'use strict';

const { asyncParamCallback } = require('../../utils');

module.exports = async (
	{
		commandName,
		command,
	},
	{
		Command,
		PreLoadCondition,
		PreCondition,
		validatorFunctionBuilder,
	},
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
		schema: null,
	};

	for (const item of command) { // eslint-disable-line no-restricted-syntax
		// command
		if (typeof item === 'function') {
			result.command = new Command(commandSettings, item);
			return result;
		}

		if (item.schema && validatorFunctionBuilder) {
			result.validator = asyncParamCallback(await Promise.resolve(validatorFunctionBuilder(item.schema)), 'schema'); // eslint-disable-line no-await-in-loop
			return result;
		}

		// settings ( exists ? )
		if (item.settings) {
			Object.assign(commandSettings, item.settings);
			return result;
		}

		if (item.preLoadCondition) {
			result.preLoadConditions.push(new PreLoadCondition({ name: [commandName] }, asyncParamCallback(item.preLoadCondition, 'cmd')));
			return result;
		}

		if (item.preCondition) {
			result.preConditions.push(new PreCondition({ name: [commandName] }, asyncParamCallback(item.preCondition, 'cmd', 'agg')));
			return result;
		}
	}

	return result;
};
