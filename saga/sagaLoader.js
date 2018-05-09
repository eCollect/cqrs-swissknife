'use strict';

const fs = require('fs');
const path = require('path');

const sagaBuilder = require('./sagaBuilder');

const loadSagas = (sagasDirectory) => {
	const sagas = [];
	/* eslint-disable no-sync */
	fs.readdirSync(sagasDirectory).forEach((sagaName) => {
		/* eslint-enable no-sync */
		const sagaFile = path.join(sagasDirectory, sagaName);

		/* eslint-disable no-sync */
		if (!fs.statSync(sagaFile).isFile())
			/* eslint-enable no-sync */
			return;

		if (path.extname(sagaFile) !== '.js') return;

		sagas.push(sagaBuilder(require(sagaFile))); // eslint-disable-line
	});

	return sagas;
};

module.exports = (directory, options) => loadSagas(directory, options);
