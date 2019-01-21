'use strict';

const settings = require('../../shared/settings');
const sharedOnly = require('../../shared/only');

const shouldHandleEvent = (fn) => {
	if (!fn || typeof fn !== 'function')
		throw new Error('Condition is missing or not a function.');

	return { shouldHandleEvent: fn };
};

const shouldHandle = (fn) => {
	if (!fn || typeof fn !== 'function')
		throw new Error('Condition is missing or not a function.');

	return fn.length === 1 ? { shouldHandleEvent: fn } : { shouldHandle: fn };
};

const only = {
	ifExists: sharedOnly.ifExists,
	ifNotExists: sharedOnly.ifNotExists,
	ifEvent(condition) {
		return shouldHandleEvent(condition);
	},
	if(condition) {
		return shouldHandle(condition);
	},
};

const identifier = (identifierFunction) => {
	if (!identifierFunction || (typeof identifierFunction !== 'function' && typeof identifierFunction !== 'string'))
		throw new Error('No valid identifier supplied!');

	return { useAsId: identifierFunction };
};

module.exports = {
	settings,
	only,
	shouldHandle,
	identifier,
};
