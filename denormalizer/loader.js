'use strict';

const fs = require('fs');
const path = require('path');

// const denormalizerBuilder = require('./denormalizerBuilder');

const loadCollections = (collectionsDirectory) => {
	const collections = {};

	fs.readdirSync(collectionsDirectory).forEach((collectionName) => {
		const collectionFile = path.join(collectionsDirectory, collectionName);


		if (!fs.statSync(collectionFile).isFile() || path.extname(collectionFile) !== '.js')
			return;


		collections[path.basename(collectionName, '.js')] = {
			path: collectionFile,
		};
	});

	return collections;
};

module.exports = (collectionsDirectory, options) => loadCollections(collectionsDirectory, options);
