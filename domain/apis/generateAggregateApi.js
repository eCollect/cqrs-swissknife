'use strict';

const dotty = require('dotty');

const { valueop } = require('../../utils');

const generateEvent = (aggregate, name, payload, metadata) => {
	const event = {};
	dotty.put(event, aggregate.definitions.event.name, name);
	dotty.put(event, aggregate.definitions.event.payload, payload);
	dotty.put(event, aggregate.definitions.event.meta, metadata);
	return event;
};

const generateAggregateApi = (aggregate, eventNames, eventEnricher = valueop) => {
	const AggregateApi = function AggregateApi(aggregateModel) {
		this._aggregateModel = aggregateModel;
		this.apply.__self = this;
	};

	AggregateApi.prototype.get = function get(...params) {
		return this._aggregateModel.get(...params);
	};

	AggregateApi.prototype.apply = function apply(name, payload, metadata) {
		const evt = generateEvent(aggregate, name, payload, metadata);
		this._aggregateModel.apply(eventEnricher(evt) || evt);
	};

	eventNames.forEach((eventName) => {
		AggregateApi.prototype.apply[eventName] = function applyEvent(payload, metadata) {
			this.call(this.__self, eventName, payload, metadata);
		};
	});

	return AggregateApi;
};

module.exports = generateAggregateApi;
