'use strict';

const loader = require('./loader');
const aggregateBuilder = require('./builders/aggregateBuilder');

const buildContext = async ([contextName, aggregates], { Context, ...definitions }, customApiBuilder) => {
	const context = new Context({ name: contextName, externallyLoaded: true });

	const entries = Object.entries(aggregates);
	for(const [aggregateName, aggregate] of entries) { // eslint-disable-line
		const aggregateFile = aggregate.path;
		await aggregateBuilder(context, aggregateName, require(aggregateFile), definitions, customApiBuilder); // eslint-disable-line
	}

	return context;
};


const buildDomain = async (domain, definitions, customApiBuilder) => {
	const domainTree = {};
	const domainTreeEntries = Object.entries(domain);
	for(const entries of domainTreeEntries) // eslint-disable-line
		domainTree[entries[0]] = await buildContext(entries, definitions, customApiBuilder); // eslint-disable-line
	return domainTree;
};

// Domain may be a path to the domain dir or a loaded domain object
// Definitions come from cqrs-domain module
module.exports = async (domain, definitions, customApiBuilder) => {
	if (typeof domain === 'string' || domain instanceof String)
		domain = loader(domain);
	return buildDomain(domain, definitions, customApiBuilder);
};
