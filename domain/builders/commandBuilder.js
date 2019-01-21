'use strict';

const {
	nextify, asyncParamCustomErrorApiCallback, toFlatArray, noop,
} = require('../../utils');

module.exports = async (
	{
		commandName,
		command,
		aggregateApi,
	},
	{
		Command,
		PreLoadCondition,
		PreCondition,
		validatorFunctionBuilder,
		errorBuilders,
	},
	customApiBuilder,
) => {
	const commandSettings = {
		name: commandName,
	};

	command = toFlatArray(command);

	const result = {
		preLoadConditions: [],
		preConditions: [],
		command: null,
		validator: null,
		commandBusinessRules: [],
	};

	for (const item of command) { // eslint-disable-line no-restricted-syntax
		// command
		if (typeof item === 'function') {
			const middleware = async (cmd, agg, api) => item(cmd, aggregateApi(agg, cmd), api); // : item.preCondition;
			result.preConditions.push(new PreCondition({ name: [commandName] }, asyncParamCustomErrorApiCallback(middleware, errorBuilders.businessRule, customApiBuilder, 'cmd', 'agg')));
			result.command = result.command || new Command(commandSettings, noop);
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
			if (result.command)
				throw new Error('PreLoadConditions may be defined only before command handlers');
			result.preLoadConditions.push(new PreLoadCondition({ name: [commandName] }, asyncParamCustomErrorApiCallback(item.preLoadCondition, errorBuilders.businessRule, customApiBuilder, 'cmd')));
			continue;
		}

		if (item.preCondition) {
			if (result.command)
				throw new Error('PreConditions may be defined only before command handlers');
			const condition = async (cmd, agg, api) => item.preCondition(cmd, aggregateApi(agg, cmd), api);
			result.preConditions.push(new PreCondition({ name: [commandName] }, asyncParamCustomErrorApiCallback(condition, errorBuilders.businessRule, customApiBuilder, 'cmd', 'agg')));
		}

		if (item.commandBusinessRule)
			result.commandBusinessRules.push(item.commandBusinessRule);
	}

	return result;
};
