'use strict';

const dotty = require('dotty');

const { asyncParamApiCallback, noop, toFlatArray } = require('../../utils');

const commandBuilder = require('./commandBuilder');
const eventBuilder = require('./eventBuilder');
const businessRulesBuilder = require('./businessRulesBuilder');

const generateAggregateApi = require('../apis/generateAggregateApi');

const addCommandToAggregate = (aggregate, {
	preLoadConditions,
	preConditions,
	commandBusinessRules,
	validator,
	command,
}) => {
	if (validator)
		command.defineValidation(validator);

	aggregate.addCommand(command);
	preLoadConditions.forEach(cnd => command.addPreLoadCondition(cnd));
	preConditions.forEach(cnd => command.addPreCondition(cnd));

	return commandBusinessRules.map((f,i) => ({
		name: `${aggregate.context}:${aggregate.name}:businessRule:${command.name}:${0}`,
		rule(current, previous, events, cmd) {
			if (dotty.get(cmd, command.definitions.command.name) === command.name)
				return f(current, previous, events, cmd)
			return;
		},
	}));
};

const addEventToAggregate = (aggregate, { event }) => {
	aggregate.addEvent(event);
};

const addRuleToAggregate = (aggregate, { rule }) => {
	aggregate.addBusinessRule(rule);
};

module.exports = async (context, aggregateName,
	{
		commands = {}, events = {}, initialState = {}, rules = [], eventEnricher, idGenerator, options = {},
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

	// define eventModels - it is important to do so before defining commands so we could generate the aggregateAPI
	Object.entries(events).map(([eventName, event]) => addEventToAggregate(aggregate, eventBuilder({ eventName, event }, definitions)));

	// generate aggregateApi class
	const AggregateApi = generateAggregateApi(aggregate, eventEnricher);

	// define commandModels
	const commandBussinessRules = toFlatArray(await Promise.all(Object.entries(commands).map(async ([commandName, command]) => addCommandToAggregate(aggregate, await commandBuilder({ commandName, command, AggregateApi }, definitions, customApiBuilder)))));

	// process buissnessRules
	businessRulesBuilder({ context, aggregateName, commandBussinessRules, rules }, definitions, customApiBuilder).map(rule => addRuleToAggregate(aggregate, { rule }));

	return aggregate;
};
