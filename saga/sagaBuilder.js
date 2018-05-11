'use strict';

const {
	defineSaga,
} = require('cqrs-saga');

const { asyncParamCallback } = require('../utils');

module.exports = ({ reactions = {}, identity = {} }) => {
	const sagas = [];

	Object.entries(reactions).forEach(([fullName, reaction]) => {
		const [context, aggregate, name] = fullName.split('.');

		let identifier = identity[fullName];

		const sagaSettings = {
			name,
			context,
			aggregate,
		};

		if (!Array.isArray(reaction))
			reaction = [reaction];

		return reaction.forEach((item) => {
			if (!item)
				throw new Error('No saga function specified');

			if (item.settings)
				return Object.assign(sagaSettings, item.settings);

			if (item.useAsId) {
				identifier = item.useAsId;
				return null;
			}

			if (typeof item === 'function') {
				const sagaDefinition = defineSaga(sagaSettings, (event, saga, callback) => Promise.resolve(item(event, saga)).then(() => saga.commit(callback)));

				if (identifier)
					sagaDefinition.useAsId(asyncParamCallback(identifier, 'event'));

				sagas.push(sagaDefinition);

				return null;
			}
			return null;
		});
	});

	return sagas;
};
