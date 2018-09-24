'use strict';

const dotty = require('dotty');
const merge = require('lodash.merge');

const { valueop } = require('../../utils');

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

	model.addUncommittedEvent(enrichedEvent);
	aggregate.apply(enrichedEvent, model);

	model.set = () => {
		throw Error('Invalid operation on this step.');
	};

	return enrichedEvent;
};

const generateAggregateApi = (aggregate, eventEnricher = valueop) => {
	const AggregateApi = function AggregateApi(aggregateModel, command) {
		this._aggregateModel = aggregateModel;
		this._command = command;
		this.id = this._aggregateModel.id;
		this.apply.__self = this;
	};

	AggregateApi.prototype.get = function get(attr) {
		return this._aggregateModel.get(attr);
	};

	AggregateApi.prototype.apply = function apply(name, payload, metadata) {
		generateEvent(aggregate, this._aggregateModel, eventEnricher, this._command, name, payload, metadata);
		// this._aggregateModel.apply(eventEnricher(evt, this._aggregateModel, this._command) || evt);
	};

	aggregate.events.forEach(({ name }) => {
		AggregateApi.prototype.apply[name] = function applyEvent(payload, metadata) {
			this.call(this.__self, name, payload, metadata);
		};
	});

	return AggregateApi;
};

module.exports = generateAggregateApi;
