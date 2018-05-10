'use strict';

const settings = require('../../shared/settings');

const only = {
	ifNotExists() {
		return settings({ autoCreate: true });
	},
	ifExists() {
		return settings({ autoCreate: false });
	},
};
module.exports = {
	settings,
	only,
};
