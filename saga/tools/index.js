'use strict';

const settings = require('../../shared/settings');
const sharedOnly = require('../../shared/only');

const only = {
	ifExists: sharedOnly.ifExists,
	ifNotExists: sharedOnly.ifNotExists,
};

const identifier = (identifierFunction) => {
	if (!identifierFunction || (typeof identifierFunciton !== 'function' && typeof identifierFunction !== 'string'))
		throw new Error('No identifier valid supplied!');

	return { useAsId: identifierFunction };
};

module.exports = {
	settings,
	only,

	identifier,
};
