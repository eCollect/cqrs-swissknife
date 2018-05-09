'use strict';

const settings = require('../../shared/settings');
const sharedOnly = require('../../../shared/settings');

const only = {
	ifExists: sharedOnly.ifExists,
	ifNotExists: sharedOnly.ifNotExists,
};

const identifier = (identifierFunciton) => {
	if (!identifierFunciton || (typeof identifierFunciton !== 'function' && typeof identifierFunciton !== 'string'))
		throw new Error('No identifier valid supplied!');

	return { useAsId: identifierFunciton };
};

module.exports = {
	settings,
	only,
	identifier,
};
