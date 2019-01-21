'use strict';

const dotty = require('dotty');
const merge = require('lodash.merge');
const { cloneDeep } = require('lodash');

const { valueop } = require('../../utils');

const deferredEventsSymbol = Symbol('aggregate:deferedEvents');
const commandSymbol = Symbol('aggregate:command');
const apiSymbol = Symbol('aggregate:apiSymbol');


// direct copy from : https://github.com/adrai/node-cqrs-domain/blob/9b17c73853ec59d451d3101492cb00b16e1ec9e3/lib/definitions/aggregate.js#L70
const generateEvent = (aggregate, model, eventEnricher, cmd, name, payload, metadata, version = 0) => {
	const event = {};

	const protoSet = Object.getPrototypeOf(model).set;
	model.set = (...params) => protoSet.apply(model, params);

	dotty.put(event, aggregate.definitions.event.name, name);
	dotty.put(event, aggregate.definitions.event.payload, payload);
	// merge metadata
	dotty.put(event, aggregate.definitions.event.meta, merge(metadata, dotty.get(cmd, aggregate.definitions.command.meta)));

	const context = aggregate.context.name;
	const aggregateName = aggregate.name;
	const aggregateId = model.id;

	// TODO CHECK
	dotty.put(event, aggregate.definitions.event.aggregateId, aggregateId);

	dotty.put(event, aggregate.definitions.event.correlationId, dotty.get(cmd, aggregate.definitions.command.id));

	// version
	if (aggregate.definitions.event.version) {
		if (Number.isInteger(version))
			dotty.put(event, aggregate.definitions.event.version, version);

		if (!dotty.exists(event, aggregate.definitions.event.version)) {
			const evtName = dotty.get(event, aggregate.definitions.event.name);
			const maxVersion = aggregate.getEvents().reduce((res, e) => {
				if (e.name !== evtName)
					return res;

				return Math.max(e.version || 0, res);
			}, 0);
			dotty.put(event, aggregate.definitions.event.version, maxVersion);
		}
	}

	if (aggregate.definitions.event.aggregate)
		dotty.put(event, aggregate.definitions.event.aggregate, aggregateName);

	if (aggregate.definitions.event.context)
		dotty.put(event, aggregate.definitions.event.context, context);

	// handle revision
	if (!aggregate.disablePersistence) {
		const streamInfo = {
			context,
			aggregate: aggregateName,
			aggregateId,
		};
		const revision = model.getRevision(streamInfo) + 1;

		model.setRevision(streamInfo, revision);
		dotty.put(event, aggregate.definitions.event.revision, revision);
	}

	const enrichedEvent = eventEnricher(event, model, cmd) || event;
	enrichedEvent.__command = cmd;

	model.addUncommittedEvent(enrichedEvent);
	aggregate.apply(cloneDeep(enrichedEvent), model);

	model.set = () => {
		throw Error('Invalid operation on this step.');
	};

	return enrichedEvent;
};

const applyGenerator = (ctx, applyProto, aggregate, eventEnricher) => {
	const apply = function apply(name, payload, metadata) {
		return generateEvent(aggregate, this._aggregateModel, eventEnricher, this[commandSymbol], name, payload, metadata);
	};

	apply.__self = ctx;
	Object.setPrototypeOf(apply, applyProto);
	return apply;
};

class AggregateApi {
	constructor(aggregateModel, command, { applyProto, aggregate, eventEnricher }) {
		this._aggregateModel = aggregateModel;
		this._aggregateModel[apiSymbol] = this;

		this.id = this._aggregateModel.id;
		this[commandSymbol] = command;
		this.apply = applyGenerator(this, applyProto, aggregate, eventEnricher);
	}

	get(attr) {
		if (!attr)
			return this._aggregateModel.attributes;
		return this._aggregateModel.get(attr);
	}

	_getDeferredEvents() {
		return this[deferredEventsSymbol];
	}
}

const generateAggregateApi = (aggregate, eventEnricher = valueop) => {
	const applyProto = Object.create(Function.prototype);
	aggregate.events.forEach(({ name }) => {
		applyProto[name] = function applyEvent(payload, metadata) {
			this.call(this.__self, name, payload, metadata);
		};
	});

	return (aggregateModel, command) => {
		if (!aggregateModel[apiSymbol])
			return new AggregateApi(aggregateModel, command, { applyProto, aggregate, eventEnricher });
		return aggregateModel[apiSymbol];
	};
};

module.exports = generateAggregateApi;
