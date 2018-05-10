'use strict';

const fs = require('fs');
const path = require('path');

const denormalizerBuilder = require('./denormalizerBuilder');

module.exports = (contextDirectory) => {
	const collections = [];
	/* eslint-disable no-sync */
	fs.readdirSync(contextDirectory).forEach((collectionName) => {
		/* eslint-enable no-sync */
		const collectionFile = path.join(contextDirectory, collectionName);

		/* eslint-disable no-sync */
		if (!fs.statSync(collectionFile).isFile())
		/* eslint-enable no-sync */
			return;

		if (path.extname(collectionFile) !== '.js') return;

		collections.push(denormalizerBuilder(path.basename(collectionName, '.js'), require(collectionFile))); // eslint-disable-line
	});

	return collections;
};
