'use strict';

const loader = require('./loader');
const aggregateBuilder = require('./builders/aggregateBuilder');

const buildContext = async ([contextName, aggregates], { Context, ...definitions }) => {
	const context = new Context({ name: contextName, externallyLoaded: true });

	const entries = Object.entries(aggregates);
	for(const [aggregateName, aggregate] of entries) { // eslint-disable-line
		const aggregateFile = aggregate.path;
		await aggregateBuilder(context, aggregateName, require(aggregateFile), definitions); // eslint-disable-line
	}

	return context;
};

const buildDomain = (domain, definitions) => Object.entries(domain).reduce((domainTree, entries) => {
	domainTree[entries[0]] = buildContext(entries, definitions);
	return domainTree;
}, {});

// Domain may be a path to the domain dir or a loaded domain object
// Definitions come from cqrs-domain module
module.exports = async (domain, definitions) => {
	if (typeof domain === 'string' || domain instanceof String)
		domain = loader(domain);
	return buildDomain(domain, definitions);
};
