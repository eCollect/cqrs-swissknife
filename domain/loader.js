'use strict';

const fs = require('fs');
const path = require('path');

const { toFlatArray, firstFilenamePart } = require('../utils');

const schemaExtractor = (handler = []) => ({ schema: (toFlatArray(handler).find(item => 'schema' in item) || {}).schema });

const loadAggregate = (filePath, { commands = {}, events = {} }) => {
	const aggregate = {
		commands: {},
		events: {},
		path: filePath,
	};

	// commands
	Object.entries(commands).forEach(([commandName, commandHandler]) => {
		const { schema } = schemaExtractor(commandHandler);
		aggregate.commands[commandName] = schema ? { schema } : {};
	});

	// events
	Object.entries(events).forEach(([eventName]) => {
		aggregate.events[eventName] = {};
	});

	return aggregate;
};

const loadContext = (contextDirectory) => {
	const context = {};

	fs.readdirSync(contextDirectory).forEach((aggregateName) => {
		const aggregateFile = path.join(contextDirectory, aggregateName);

		if (!fs.statSync(aggregateFile).isFile() || path.extname(aggregateFile) !== '.js')
			return;

		const basename = firstFilenamePart(aggregateFile);

		if (context[basename])
			throw new Error(`Duplicate aggregator: [${basename}] in: ${aggregateFile} and ${context[basename].path}.`);

		context[basename] = loadAggregate(aggregateFile, require(aggregateFile)); // eslint-disable-line
	});

	return context;
};

const loadDomain = (writeModelDirectory, options) => {
	const contexts = {};

	fs.readdirSync(writeModelDirectory).forEach((contextName) => {
		const contextDirectory = path.join(writeModelDirectory, contextName);

		if (!fs.statSync(contextDirectory).isDirectory())
			return;

		contexts[contextName] = loadContext(contextDirectory, options);
	});

	return contexts;
};

module.exports = (directory, options) => loadDomain(directory, options);
