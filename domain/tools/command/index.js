'use strict';

const settings = require('../../../shared/settings');
const sharedOnly = require('../../../shared/only');

const preLoadCondition = (condition) => {
	if (typeof condition !== 'function')
		throw new Error('Condition is missing.');

	return { preLoadCondition: condition };
};

const preCondition = (condition) => {
	if (!condition || typeof condition !== 'function')
		throw new Error('Condition is missing or not a function.');

	return { preCondition: condition };
};

const commandBusinessRule = (businessRule) => {
	if (!businessRule || typeof businessRule !== 'function')
		throw new Error('Rule missing or not a function.');

	return { businessRule };
};

const only = {
	ifExists: sharedOnly.ifExists,
	ifNotExists: sharedOnly.ifNotExists,
	ifValidatedBy(schema) {
		// no schema provided
		if (!schema)
			throw new Error('Schema is missing.');

		// validation function, ie. pre-load-condition
		if (typeof schema === 'function')
			return preLoadCondition(schema);

		return { schema };
	},
	ifState(condition) { // pre-condition
		return preCondition(condition);
	},
	after(rule) { // businessRule
		return commandBusinessRule(rule);
	},
};

module.exports = {
	settings,
	preLoadCondition,
	preCondition,
	only,
};
