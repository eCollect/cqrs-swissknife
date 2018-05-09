'use strict';

const {
	defineAggregate,
	defineCommand,
	definePreLoadCondition,
	definePreCondition,
	defineEvent,
} = require('cqrs-domain');


const addCommandToAggregate = (preLoadConditions, preConditions, aggregate, command) => {
	aggregate.addCommand(command);
	preLoadConditions.forEach(cnd => command.addPreLoadCondition(cnd));
	preConditions.forEach(cnd => command.addPreCondition(cnd));
};

const itemFactory = (contextName, aggregateName, definition) => {
	definition.context = contextName;
	definition.aggregate = aggregateName;
	return definition;
};

module.exports = (context, aggregateName, { commands = {}, events = {}, idGenerator }) => {
	const contextName = context.name;

	const aggregate = defineAggregate({
		name: aggregateName,
		defaultCommandPayload: '',
		defaultEventPayload: '',
		defaultPreConditionPayload: '',
	});

	if (idGenerator)
		aggregate.defineCommandAwareAggregateIdGenerator((cmd, callback) => Promise.resolve(idGenerator).then(id => callback(null, id).catch(e => callback(e))));

	context.addAggregate(aggregate);
	aggregate.context = contextName;

	// define commands
	Object.entries(commands).forEach(([commandName, command]) => {
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
					itemFactory(
						contextName,
						aggregateName,
						defineCommand(commandSettings, item),
					),
				);

			// settings ( exists ? )
			if (item.settings)
				return Object.assign(commandSettings, item.settings);

			if (item.preLoadCondition)
				return preLoadConditions.push(itemFactory(
					contextName,
					aggregateName,
					definePreLoadCondition({ name: [commandName], priority }, item.preLoadCondition),
				));

			if (item.preCondition)
				return preConditions.push(itemFactory(
					contextName,
					aggregateName,
					definePreCondition({ name: [commandName], priority }, item.preCondition),
				));

			return null;
		});
	});

	// define events
	Object.entries(events).forEach(([eventName, event]) => {
		const eventSettings = {
			name: eventName,
		};

		// plain old simple command
		if (!Array.isArray(event))
			event = [event];

		return event.forEach((item) => {
			// command
			if (typeof item === 'function')
				return aggregate.addEvent(itemFactory(
					contextName,
					aggregateName,
					defineEvent(eventSettings, item),
				));

			// settings ( exists ? )
			if (item.settings)
				return Object.assign(eventSettings, item.settings);

			return null;
		});
	});

	return aggregate;
};
