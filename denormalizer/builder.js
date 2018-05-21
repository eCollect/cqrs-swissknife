'use strict';

const collectionBuilder = require('./builders/collectionBuilder');

const loader = require('./loader');

const buildRepository = (collections, definitions) => Object.entries(collections).reduce(
	(repository, [collectionName, collection]) => {
		const collectionFile = collection.path;
		repository[collectionName] = collectionBuilder(collectionName, require(collectionFile), definitions); // eslint-disable-line
		return repository;
	},
	{},
);

// Domain may be a path to the domain dir or a loaded domain object
// Definitions come from cqrs-domain module
module.exports = (collections, definitions) => {
	if (typeof collections === 'string' || collections instanceof String)
		collections = loader(collections);
	return buildRepository(collections, definitions);
};
