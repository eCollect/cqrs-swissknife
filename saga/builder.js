'use strict';

const sagaBuilder = require('./builders/sagaBuilder');

const loader = require('./loader');

const buildSagas = (collections, definitions, customApiBuilder) => Object.entries(collections).reduce(
	(sagas, [sagaName, saga]) => {
		const sagaFile = saga.path;
		sagas[sagaName] = sagaBuilder(require(sagaFile), customApiBuilder, definitions); // eslint-disable-line
		return sagas;
	},
	{},
);

// Domain may be a path to the domain dir or a loaded domain object
// Definitions come from cqrs-domain module
module.exports = (sagas, definitions, customApiBuilder) => {
	if (typeof sagas === 'string' || sagas instanceof String)
		sagas = loader(sagas);
	return buildSagas(sagas, definitions, customApiBuilder);
};
