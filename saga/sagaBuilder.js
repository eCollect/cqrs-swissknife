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
		let sagaFunction;

		const sagaSettings = {
			name,
			context,
			aggregate,
		};

		if (!Array.isArray(reaction))
			reaction = [reaction];

		reaction.forEach((item) => {
			if (item.settings)
				return Object.assign(sagaSettings, item.settings);

			if (item.useAsId) {
				identifier = item.useAsId;
				return null;
			}

			if (typeof item === 'function')
				sagaFunction = item;

			return null;
		});

		if (!sagaFunction)
			throw new Error('No saga function specified');

		// TODO Error handling
		const sagaDefinition = defineSaga(sagaSettings, asyncParamCallback('event', 'saga'));

		if (identifier)
			sagaDefinition.useAsId(asyncParamCallback(identifier, 'event'));

		sagas.push(sagaDefinition);
	});

	return sagas;
};
