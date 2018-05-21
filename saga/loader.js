'use strict';

const fs = require('fs');
const path = require('path');

const loadCollections = (sagasDirectory) => {
	const sagas = {};

	fs.readdirSync(sagasDirectory).forEach((sagaName) => {
		const sagaFile = path.join(sagasDirectory, sagaName);


		if (!fs.statSync(sagaFile).isFile() || path.extname(sagaFile) !== '.js')
			return;

		sagas[path.basename(sagaName, '.js')] = {
			path: sagaFile,
		};
	});

	return sagas;
};

module.exports = (sagasDirectory, options) => loadCollections(sagasDirectory, options);
