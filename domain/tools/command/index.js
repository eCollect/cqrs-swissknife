'use strict';

const settings = require('../../../shared/settings');
const sharedOnly = require('../../../shared/only');

const preLoadCondition = (condition) => {
	if (typeof condition !== 'function')
		throw new Error('Condition is missing.');
	return {
		async preLoadCondition(command) {
			await Promise.resolve(condition(command));
		},
	};
};
const preCondition = (condition) => {
	if (!condition || typeof condition !== 'function')
		throw new Error('Condition is missing or not a function.');

	return {
		async preCondition(command, aggregate) {
			await Promise.resolve(condition(command, aggregate));
		},
	};
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
};

module.exports = {
	settings,
	preLoadCondition,
	preCondition,
	only,
};
