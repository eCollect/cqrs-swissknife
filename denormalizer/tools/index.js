'use strict';

const settings = require('../../shared/settings');

const shouldHandle = (fn) => {
	if (!fn || typeof fn !== 'function')
		throw new Error('Condition is missing or not a function.');

	return fn.length === 1 ? { shouldHandleEvent: fn } : { shouldHandle: fn };
};

const only = {
	ifNotExists() {
		return settings({ autoCreate: true });
	},
	ifExists() {
		return settings({ autoCreate: false });
	},
	if(condition) {
		return shouldHandle(condition);
	},
};

const extendPreEvent = (extender) => {
	if (!extender || typeof extender !== 'function')
		throw new Error('Extender is missing or not a function.');

	return {
		preEventExtender(event) {
			return Promise.resolve(extender(event));
		},
	};
};

const extendEvent = (extender) => {
	if (!extender || typeof extender !== 'function')
		throw new Error('Extender is missing or not a function.');

	return {
		eventExtender(event) {
			return Promise.resolve(extender(event));
		},
	};
};

const identifier = (identifierFunction) => {
	if (!identifierFunction || (typeof identifierFunction !== 'function' && typeof identifierFunction !== 'string'))
		throw new Error('No identifier valid supplied!');

	return { useAsId: identifierFunction };
};

module.exports = {
	settings,
	only,
	extendPreEvent,
	extendEvent,
	identifier,
};
