'use strict';

module.exports = ({ reactions = {}, identity = {} }, customApiBuilder = saga => saga, { Saga }) => Object.entries(reactions).map(([fullName, reaction]) => {
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
		if (!item)
			throw new Error('No saga function specified');

		if (item.settings)
			return Object.assign(sagaSettings, item.settings);

		if (item.useAsId) {
			identifier = item.useAsId;
			return null;
		}

		if (typeof item === 'function') {
			sagaFunction = (event, saga, callback) => Promise.resolve(item(event, customApiBuilder(event, saga))).then(() => saga.commit(callback));
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

	return sagaDefinition;
});
