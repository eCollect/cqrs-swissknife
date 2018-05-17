'use strict';

module.exports = (path, {
	commands = {}, events = {},
}) => {
	const aggregate = {
		commands: {},
		events: {},
		path,
	};

	// commands
	Object.entries(commands).forEach(([commandName]) => {
		aggregate.commands[commandName] = {};
	});

	// events
	Object.entries(events).forEach(([eventName]) => {
		aggregate.events[eventName] = {};
	});

	return aggregate;
};
