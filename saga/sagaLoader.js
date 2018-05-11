'use strict';

const fs = require('fs');
const path = require('path');

const sagaBuilder = require('./sagaBuilder');

const loadSagas = (sagasDirectory) => {
	const sagas = [];

	fs.readdirSync(sagasDirectory).forEach((sagaName) => {
		const sagaFile = path.join(sagasDirectory, sagaName);


		if (!fs.statSync(sagaFile).isFile())

			return;

		if (path.extname(sagaFile) !== '.js') return;

		sagas.push(sagaBuilder(require(sagaFile))); // eslint-disable-line
	});

	return sagas;
};

module.exports = (directory, options) => loadSagas(directory, options);
