'use strict';

const { nextify, asyncParamApiCallback } = require('../../utils');

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
			result.command = new Command(commandSettings, item);
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
