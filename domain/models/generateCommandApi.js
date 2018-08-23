'use strict';

const { inherits } = require('util');

const dotty = require('dotty');

const { valueop, isObject, isString } = require('../../utils');


const generateEvent = (aggregate, name, payload, metadata) => {
	const event = {};
	dotty.put(event,  aggregate.definitions.event.name, name);
	dotty.put(event,  aggregate.definitions.event.payload, payload);
	dotty.put(event,  aggregate.definitions.event.meta, metadata);
	return event;
};

const normalizeEvent = (aggregate, name, payload = {}, version) => {
	if (isObject(name))
		return name;
	if (!isString(name))
		throw ('First argument must be of type String or Object');

	return generateEvent(aggregate, name, payload, metadata);
};

const buildApplyModel = (eventNames = []) => {
	const apply = (name, payload, version) => {
	};
};


class BaseAggregateCommandModel {
	constructor(aggregate, eventEnricher = noop) {
		this._aggregate = aggregate;
	}

	get(...params) {
		return this._aggregate.get(...params);
	}

	apply(name, payload = {}) {
		const evt = {
			name,
			payload,
			metadata,
		};
		// this._eventEnricher({ name, payload, metadata }, this._aggregate);
		this._aggregate.apply(this._eventEnricher({ name, payload, metadata }, this._aggregate) || );
	}

}

const generateAggregateCommandModel = (eventNames, eventEnricher = valueop) => {
	const AggregateModel = function AggregateModel(aggregate, aggregateModel) {
		this._aggregate = aggregate;
		this._aggregateModel = aggregateModel;
	};

	AggregateModel.prototype.get = function get(...params) {
		return this._aggregateModel.get(...params);
	}

	AggregateModel.prototype.apply = function apply(name, payload, metadata) {
		const evt = generateEvent(this._aggregate, name, payload, metadata);
		this._aggregateModel.apply(eventEnricher(evt) || evt);
	}

	eventNames.forEach((eventName) => {
		AggregateModel.prototype.apply[eventName] = function applyEvent(payload, metadata) {
			this.apply(eventName, payload, metadata);
		}
	});

	return aggregateModel;
}


module.exports = generateAggregateCommandModel;
