'use strict';

const settings = require('../../shared/settings');
const sharedOnly = require('../../shared/only');

const only = {
	ifExists: sharedOnly.ifExists,
	ifNotExists: sharedOnly.ifNotExists,
};

const identifier = (identifierFunction) => {
	if (!identifierFunction || (typeof identifierFunction !== 'function' && typeof identifierFunction !== 'string'))
		throw new Error('No identifier valid supplied!');

	return { useAsId: identifierFunction };
};

const shouldHandle = (fn) => {
	if (!fn || typeof fn !== 'function')
		throw new Error('No identifier valid supplied!');

	return { shouldHandle: fn };
};

module.exports = {
	settings,
	only,
	shouldHandle,
	identifier,
};
