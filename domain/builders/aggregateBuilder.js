'use strict';

const { asyncParamCallback } = require('../../utils');

const commandBuilder = require('./commandBuilder');
const eventBuilder = require('./eventBuilder');

const addCommandToAggregate = (aggregate, { preLoadConditions, preConditions, command }) => {
	aggregate.addCommand(command);
	preLoadConditions.forEach(cnd => command.addPreLoadCondition(cnd));
	preConditions.forEach(cnd => command.addPreCondition(cnd));
};

const addEventToAggregate = (aggregate, { event }) => {
	aggregate.addEvent(event);
};

module.exports = (context, aggregateName, {
	commands = {}, events = {}, initialState = {}, idGenerator,
}, {
	defineAggregate,
	...definitions
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
	Object.entries(commands).forEach(([commandName, command]) => addCommandToAggregate(aggregate, commandBuilder({ commandName, command }, definitions)));

	// define eventModels
	Object.entries(events).forEach(([eventName, event]) => addEventToAggregate(aggregate, eventBuilder({ eventName, event }, definitions)));

	return aggregate;
};
