'use strict';

const { asyncParamCallback } = require('../../utils');

module.exports = ({ commandName, command }, { defineCommand, definePreLoadCondition, definePreCondition }) => {
	const commandSettings = {
		name: commandName,
	};

	if (!Array.isArray(command))
		command = [command];

	return command.reduce((result, item, priority) => {
		// command
		if (typeof item === 'function') {
			result.command = defineCommand(commandSettings, item);
			return result;
		}

		// settings ( exists ? )
		if (item.settings) {
			Object.assign(commandSettings, item.settings);
			return result;
		}

		if (item.preLoadCondition) {
			result.preLoadConditions.push(definePreLoadCondition({ name: [commandName], priority }, asyncParamCallback(item.preLoadCondition, 'cmd')));
			return result;
		}

		if (item.preCondition) {
			result.preConditions.push(definePreCondition({ name: [commandName], priority }, asyncParamCallback(item.preCondition, 'cmd', 'agg')));
			return result;
		}

		return result;
	}, {
		preLoadConditions: [],
		preConditions: [],
		command: null,
	});
};
