'use strict';

const loader = require('./loader');
const aggregateBuilder = require('./builders/aggregateBuilder');

const buildContext = ([contextName, aggregates], { Context, ...definitions }) => {
	const context = new Context({ name: contextName, externallyLoaded: true });

	Object.entries(aggregates).forEach(([aggregateName, aggregate]) => {
		const aggregateFile = aggregate.path;
		aggregateBuilder(context, aggregateName, require(aggregateFile), definitions); // eslint-disable-line
	});

	return context;
};

const buildDomain = (domain, definitions) => Object.entries(domain).map(entries => buildContext(entries, definitions));

// Domain may be a path to the domain dir or a loaded domain object
// Definitions come from cqrs-domain module
module.exports = (domain, definitions) => {
	if (typeof domain === 'string' || domain instanceof String)
		domain = loader(domain);
	return buildDomain(domain, definitions);
};
