'use strict';

const sagaBuilder = require('./builders/sagaBuilder');

const loader = require('./loader');

const buildSagas = (collections, definitions) => Object.entries(collections).reduce(
	(sagas, [collectionName, collection]) => {
		const collectionFile = collection.path;
		sagas[collectionName] = sagaBuilder(collectionName, require(collectionFile), definitions); // eslint-disable-line
		return sagas;
	},
	{},
);

// Domain may be a path to the domain dir or a loaded domain object
// Definitions come from cqrs-domain module
module.exports = (sagas, definitions) => {
	if (typeof collections === 'string' || sagas instanceof String)
		sagas = loader(sagas);
	return buildSagas(sagas, definitions);
};
