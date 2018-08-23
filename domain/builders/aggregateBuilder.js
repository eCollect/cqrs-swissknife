'use strict';

const { asyncParamApiCallback, noop } = require('../../utils');

const commandBuilder = require('./commandBuilder');
const eventBuilder = require('./eventBuilder');

const addCommandToAggregate = (aggregate, {
	preLoadConditions,
	preConditions,
	validator,
	command,
}) => {
	if (validator)
		command.defineValidation(validator);

	aggregate.addCommand(command);
	preLoadConditions.forEach(cnd => command.addPreLoadCondition(cnd));
	preConditions.forEach(cnd => command.addPreCondition(cnd));
};

const addEventToAggregate = (aggregate, { event }) => {
	aggregate.addEvent(event);
	return event.name;
};

module.exports = async (context, aggregateName,
	{
		commands = {}, events = {}, initialState = {}, eventEnricher, idGenerator, options = {},
	}, {
		Aggregate,
		...definitions
	},
	customApiBuilder = noop,
) => {
	const aggregate = new Aggregate({
		name: aggregateName,
		context: context.name,
		...options,
	}, { ...initialState });

	if (idGenerator)
		aggregate.defineCommandAwareAggregateIdGenerator(asyncParamApiCallback(idGenerator, customApiBuilder, 'cmd'));

	context.addAggregate(aggregate);

	// define eventModels
	const eventNames = Object.entries(events).map(([eventName, event]) => addEventToAggregate(aggregate, eventBuilder({ eventName, event }, definitions)));

	// define commandModels
	await Promise.all(Object.entries(commands).map(async ([commandName, command]) => addCommandToAggregate(aggregate, await commandBuilder({ commandName, command, eventEnricher }, definitions, customApiBuilder))));

	return aggregate;
};
