'use strict';

const { asyncParamApiCallback, nameRetriever, toFlatArray } = require('../../utils');

module.exports = ({ reactions = {}, identity = {} }, customApiBuilder = saga => saga, { Saga }) => Object.entries(reactions).map(([fullName, reaction]) => {
	const [context, aggregate, name] = nameRetriever.event(fullName);

	let identifier = identity[fullName];
	let sagaFunction;
	let shouldHandle;

	const sagaSettings = {
		name,
		context,
		aggregate,
	};

	reaction = toFlatArray(reaction);

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
