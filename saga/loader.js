'use strict';

const fs = require('fs');
const path = require('path');

const { firstFilenamePart } = require('../utils');

const loadCollections = (sagasDirectory) => {
	const sagas = {};

	fs.readdirSync(sagasDirectory).forEach((sagaName) => {
		const sagaFile = path.join(sagasDirectory, sagaName);


		if (!fs.statSync(sagaFile).isFile() || path.extname(sagaFile) !== '.js')
			return;

		const basename = firstFilenamePart(sagaFile);

		if (sagas[basename])
			throw new Error(`Duplicate saga: [${basename}] in: ${sagaFile} and ${sagas[basename].path}.`);

		sagas[basename] = {
			path: sagaFile,
		};
	});

	return sagas;
};

module.exports = (sagasDirectory, options) => loadCollections(sagasDirectory, options);
