'use strict';

const { asyncParamCallback } = require('../../utils');

module.exports = ({ commandName, command }, { Command, PreLoadCondition, PreCondition }) => {
	const commandSettings = {
		name: commandName,
	};

	if (!Array.isArray(command))
		command = [command];

	return command.reduce((result, item, priority) => {
		// command
		if (typeof item === 'function') {
			result.command = new Command(commandSettings, item);
			return result;
		}

		// settings ( exists ? )
		if (item.settings) {
			Object.assign(commandSettings, item.settings);
			return result;
		}

		if (item.preLoadCondition) {
			result.preLoadConditions.push(new PreLoadCondition({ name: [commandName], priority }, asyncParamCallback(item.preLoadCondition, 'cmd')));
			return result;
		}

		if (item.preCondition) {
			result.preConditions.push(new PreCondition({ name: [commandName], priority }, asyncParamCallback(item.preCondition, 'cmd', 'agg')));
			return result;
		}

		return result;
	}, {
		preLoadConditions: [],
		preConditions: [],
		command: null,
	});
};
