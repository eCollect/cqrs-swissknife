'use strict';

const { asyncParamApiCallback } = require('../../utils');

const nameRetriever = (eventFullName) => {
	const split = eventFullName.split('.');
	if (split.length === 4)
		return split.slice(1);
	return split;
};

module.exports = ({ reactions = {}, identity = {} }, customApiBuilder = saga => saga, { Saga }) => Object.entries(reactions).map(([fullName, reaction]) => {
	const [context, aggregate, name] = nameRetriever(fullName);

	let identifier = identity[fullName];
	let sagaFunction;
	let shouldHandle;

	const sagaSettings = {
		name,
		context,
		aggregate,
	};

	if (!Array.isArray(reaction))
		reaction = [reaction];

	reaction.forEach((item) => {
		if (!item)
			throw new Error('No saga function specified');

		if (item.settings)
			return Object.assign(sagaSettings, item.settings);

		if (item.useAsId) {
			identifier = item.useAsId;
			return null;
		}

		if (item.shouldHandle) {
			shouldHandle = asyncParamApiCallback(item.shouldHandle, customApiBuilder, 'evt', 'saga');
			return null;
		}

		if (typeof item === 'function') {
			sagaFunction = (event, saga, callback) => Promise.resolve(item(event, saga, customApiBuilder(event, saga))).then(() => saga.commit(callback));
			return null;
		}
		return null;
	});

	if (!sagaFunction)
		throw new Error(`No saga function specified for event ${fullName}`);

	if (identifier && typeof identifier === 'string')
		sagaSettings.id = identifier;

	const sagaDefinition = new Saga(sagaSettings, sagaFunction);

	if (identifier && typeof identifier === 'function')
		sagaDefinition.useAsId(identifier);

	if (shouldHandle)
		sagaDefinition.defineShouldHandle(shouldHandle);

	return sagaDefinition;
});
