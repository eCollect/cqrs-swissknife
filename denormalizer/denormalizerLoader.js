'use strict';

const fs = require('fs');
const path = require('path');

const denormalizerBuilder = require('./denormalizerBuilder');

module.exports = (contextDirectory) => {
	const collections = [];

	fs.readdirSync(contextDirectory).forEach((collectionName) => {
		const collectionFile = path.join(contextDirectory, collectionName);


		if (!fs.statSync(collectionFile).isFile())

			return;

		if (path.extname(collectionFile) !== '.js') return;

		collections.push(denormalizerBuilder(path.basename(collectionName, '.js'), require(collectionFile))); // eslint-disable-line
	});

	return collections;
};
