'use strict';

const settings = require('./settings');

module.exports = {
	ifExists() {
		return settings({ existing: true });
	},
	ifNotExists() {
		return settings({ existing: false });
	},
};
