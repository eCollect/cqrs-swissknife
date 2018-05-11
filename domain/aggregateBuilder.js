'use strict';

const {
	defineAggregate,
	defineCommand,
	definePreLoadCondition,
	definePreCondition,
	defineEvent,
} = require('cqrs-domain');

const { asyncParamCallback } = require('../utils');

const addCommandToAggregate = (preLoadConditions, preConditions, aggregate, command) => {
	aggregate.addCommand(command);
	preLoadConditions.forEach(cnd => command.addPreLoadCondition(cnd));
	preConditions.forEach(cnd => command.addPreCondition(cnd));
};

module.exports = (context, aggregateName, {
	commandModels = {}, eventModels = {}, initialState = {}, idGenerator,
}) => {
	const aggregate = defineAggregate({
		name: aggregateName,
		defaultCommandPayload: '',
		defaultEventPayload: '',
		defaultPreConditionPayload: '',
		context: context.name,
	}, { ...initialState });

	if (idGenerator)
		aggregate.defineCommandAwareAggregateIdGenerator(asyncParamCallback(idGenerator, 'cmd'));

	context.addAggregate(aggregate);

	// define commandModels
	Object.entries(commandModels).forEach(([commandName, command]) => {
		const commandSettings = {
			name: commandName,
		};

		// plain old simple command
		if (!Array.isArray(command))
			command = [command];

		const preLoadConditions = [];
		const preConditions = [];

		return command.forEach((item, priority) => {
			// command
			if (typeof item === 'function')
				return addCommandToAggregate(
					preLoadConditions,
					preConditions,
					aggregate,
					defineCommand(commandSettings, item),
				);

			// settings ( exists ? )
			if (item.settings)
				return Object.assign(commandSettings, item.settings);

			if (item.preLoadCondition)
				return preLoadConditions.push(definePreLoadCondition({ name: [commandName], priority }, asyncParamCallback(item.preLoadCondition, 'cmd')));

			if (item.preCondition)
				return preConditions.push(definePreCondition({ name: [commandName], priority }, asyncParamCallback(item.preCondition, 'cmd', 'agg')));

			return null;
		});
	});

	// define eventModels
	Object.entries(eventModels).forEach(([eventName, event]) => {
		const eventSettings = {
			name: eventName,
		};

		// plain old simple command
		if (!Array.isArray(event))
			event = [event];

		return event.forEach((item) => {
			// command
			if (typeof item === 'function')
				return aggregate.addEvent(defineEvent(eventSettings, item));

			// settings ( exists ? )
			if (item.settings)
				return Object.assign(eventSettings, item.settings);

			return null;
		});
	});

	return aggregate;
};
