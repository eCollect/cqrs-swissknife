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
		const evt = generateEvent(aggregate, name, payload, metadata);
		this._aggregateModel.apply(eventEnricher(evt, this._aggregateModel, this._command) || evt);
	};

	aggregate.events.forEach(({ name }) => {
		AggregateApi.prototype.apply[name] = function applyEvent(payload, metadata) {
			this.call(this.__self, name, payload, metadata);
		};
	});

	return AggregateApi;
};

module.exports = generateAggregateApi;
