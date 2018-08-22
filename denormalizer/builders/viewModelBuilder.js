'use strict';

const { asyncParamApiCallback, noop, nameRetriever } = require('../../utils');

module.exports = ({ eventFullName, reaction, identifier }, { ViewBuilder, PreEventExtender, EventExtender }, customApiBuilder = noop) => {
	const [context, aggregate, name] = nameRetriever.event(eventFullName);

	let viewModelFunction = null;
	let eventExtenderFunction;
	let preEventExtenderFunction;

	const modelSettings = {
		name,
		context,
		aggregate,
	};

	if (!Array.isArray(reaction))
		reaction = [reaction];

	reaction.forEach((item) => {
		// event handler
		if (typeof item === 'function') {
			viewModelFunction = asyncParamApiCallback(item, customApiBuilder, 'event', 'vm');
			return;
		}

		if (item.eventExtender) {
			if (eventExtenderFunction)
				throw new Error('Only one event extender can be defined per event');
			eventExtenderFunction = asyncParamApiCallback(item.eventExtender, customApiBuilder, 'event', 'vm');
			return;
		}

		if (item.preEventExtender) {
			if (preEventExtenderFunction)
				throw new Error('Only one pre-event extender can be defined per event');
			preEventExtenderFunction = asyncParamApiCallback(item.preEventExtender, customApiBuilder, 'event', 'collection');
			return;
		}

		if (item.useAsId) {
			identifier = item.useAsId;
			return;
		}

		// settings ( exists ? )
		if (item.settings)
			Object.assign(modelSettings, item.settings);
	});

	if (!viewModelFunction)
		throw new Error(`No view model function specified for event ${eventFullName}`);

	if (!identifier)
		throw new Error(`No identity specified for event ${eventFullName}`);


	if (typeof identifier === 'string')
		modelSettings.id = identifier;

	const viewModel = new ViewBuilder(
		modelSettings,
		viewModelFunction,
	);

	let preEventExtender;

	if (preEventExtenderFunction)
		preEventExtender = new PreEventExtender(
			modelSettings,
			preEventExtenderFunction,
		);

	let eventExtender;

	if (eventExtenderFunction)
		eventExtender = new EventExtender(
			modelSettings,
			eventExtenderFunction,
		);

	if (typeof identifier === 'function') {
		viewModel.useAsId(asyncParamApiCallback(identifier, customApiBuilder, 'event'));
		if (eventExtender)
			eventExtender.useAsId(asyncParamApiCallback(identifier, customApiBuilder, 'event'));
	}

	return {
		viewModel,
		eventExtender,
		preEventExtender,
	};
};
