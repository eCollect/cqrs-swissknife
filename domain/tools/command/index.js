'use strict';

const settings = obj => ({ settings: obj });
const preLoadCondition = (condition) => {
	if (typeof condition !== 'function')
		throw new Error('Condition is missing.');
	return {
		preLoadCondition(command, callback) {
			Promise.resolve(condition(command)).then(callback).catch(e => callback(e));
		},
	};
};
const preCondition = (condition) => {
	if (!condition || typeof condition !== 'function')
		throw new Error('Condition is missing or not a function.');

	return {
		preCondition(command, aggregate, callback) {
			Promise.resolve(condition(command, aggregate)).then(callback).catch(e => callback(e));
		},
	};
};

const only = {
	ifExists() {
		return settings({ existing: true });
	},
	ifNotExists() {
		return settings({ existing: false });
	},
	ifValidatedBy(schema) {
		// no schema provided
		if (!schema)
			throw new Error('Schema is missing.');

		// validation funciton, ie. pre-load-condition
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
