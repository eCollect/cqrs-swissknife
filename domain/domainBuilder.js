'use strict';

const fs = require('fs');
const path = require('path');

const aggregateFactory = require('./aggregateBuilder');

const { defineContext } = require('cqrs-domain');

const loadAggregates = (contextDirectory, context) => {
	fs.readdirSync(contextDirectory).forEach((aggregateName) => {
		const aggregateFile = path.join(contextDirectory, aggregateName);


		if (!fs.statSync(aggregateFile).isFile())

			return;

		if (path.extname(aggregateFile) !== '.js') return;

		aggregateFactory(context, path.basename(aggregateName, '.js'), require(aggregateFile)); // eslint-disable-line
	});

	return context;
};

const loadContexts = (writeModelDirectory, options) => {
	const contexts = [];

	fs.readdirSync(writeModelDirectory).forEach((contextName) => {
		const contextDirectory = path.join(writeModelDirectory, contextName);

		if (!fs.statSync(contextDirectory).isDirectory())
			return;

		contexts.push(loadAggregates(contextDirectory, defineContext({ name: contextName, externallyLoaded: true }), options));
	});

	return contexts;
};

module.exports = (directory, options) => loadContexts(directory, options);
