'use strict';

const { nextify, asyncParamApiCallback } = require('../../utils');

/*
const patchCommandHandler = (CommandHandler) => {
	if (CommandHandler.__patched)
		return;

	CommandHandler.prototype.asycValidateCommand = promisify(CommandHandler.prototype.validateCommand);
	CommandHandler.prototype.asycLoadAggregate = promisify(CommandHandler.prototype.loadAggregate);
	CommandHandler.prototype.asyncCheckPreLoadConditions = promisify(CommandHandler.prototype.checkPreLoadConditions);
	CommandHandler.prototype.asyncCommit = promisify(CommandHandler.prototype.commit);

	CommandHandler.__patched = true;

}

const buildCommandHandler = (item, AggregateApi, customApiBuilder) => async (aggId, cmd, commandHandler) => {
	// validate Command
	await commandHandler.asycValidateCommand(cmd);
	// check preload condifitions
	await commandHandler.asyncCheckPreLoadConditions(cmd);
	// TODO: Lock aggregate

	const [ aggregate, streams ] = await commandHandler.asycLoadAggregate(cmd, aggId);

	var err = commandHandler.verifyAggregate(aggregate, cmd);
	if (err)
		throw err;

	await Promise.resolve(item(cmd, new AggregateApi(aggregate, cmd), customApiBuilder(cmd)));

	// TODO: Check lock aggregate

	// dispatch
	const [ eventsToDisaptch ] = await commandHandler.asyncCommit(aggregate, streams);

	// TODO: Check unlock aggregate
	return eventsToDisaptch;
};
*/

module.exports = async (
	{
		commandName,
		command,
		AggregateApi,
	},
	{
		Command,
		PreLoadCondition,
		PreCondition,
		validatorFunctionBuilder,
	},
	customApiBuilder,
) => {
	const commandSettings = {
		name: commandName,
	};

	if (!Array.isArray(command))
		command = [command];


	const result = {
		preLoadConditions: [],
		preConditions: [],
		command: null,
		validator: null,
	};

	for (const item of command) { // eslint-disable-line no-restricted-syntax
		// command
		if (typeof item === 'function') {
			result.command = new Command(commandSettings, (cmd, agg) => item(cmd, new AggregateApi(agg, cmd), customApiBuilder(cmd)));
			continue;
		}

		if (item.schema && validatorFunctionBuilder) {
			result.validator = nextify(await Promise.resolve(validatorFunctionBuilder(item.schema)), 'schema'); // eslint-disable-line no-await-in-loop
			continue;
		}

		// settings ( exists ? )
		if (item.settings) {
			Object.assign(commandSettings, item.settings);
			continue;
		}

		if (item.preLoadCondition) {
			result.preLoadConditions.push(new PreLoadCondition({ name: [commandName] }, asyncParamApiCallback(item.preLoadCondition, customApiBuilder, 'cmd')));
			continue;
		}

		if (item.preCondition)
			result.preConditions.push(new PreCondition({ name: [commandName] }, asyncParamApiCallback(item.preCondition, customApiBuilder, 'cmd', 'agg')));
	}

	return result;
};
