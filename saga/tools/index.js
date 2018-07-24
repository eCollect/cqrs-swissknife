'use strict';

const settings = require('../../shared/settings');
const sharedOnly = require('../../shared/only');

const shouldHandle = (fn) => {
	if (!fn || typeof fn !== 'function')
		throw new Error('No identifier valid supplied!');

	return { shouldHandle: fn };
};

const only = {
	ifExists: sharedOnly.ifExists,
	ifNotExists: sharedOnly.ifNotExists,
	if(condition) {
		return shouldHandle(condition);
	},
};

const identifier = (identifierFunction) => {
	if (!identifierFunction || (typeof identifierFunction !== 'function' && typeof identifierFunction !== 'string'))
		throw new Error('No identifier valid supplied!');

	return { useAsId: identifierFunction };
};

module.exports = {
	settings,
	only,
	shouldHandle,
	identifier,
};
