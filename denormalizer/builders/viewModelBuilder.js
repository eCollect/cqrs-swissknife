'use strict';

const {
	asyncParamApiCallback,
	noop,
	nameRetriever,
	toFlatArray,
} = require('../../utils');

const compositeHandler = handlers => async (event, vm, api) => {
	for (const handler of handlers)
		await handler(event, vm, api);
}

const buildViewModelFunction = (viewModelFunctions) => {
	if (!viewModelFunctions.length)
		throw new Error(`No view model function specified for event ${eventFullName}`);

	if (viewModelFunctions.length === 1)
		return viewModelFunctions[0];

	return compositeHandler(viewModelFunctions);
}

module.exports = ({ eventFullName, reaction, identifier }, { ViewBuilder, PreEventExtender, EventExtender }, customApiBuilder = noop) => {
	const [context, aggregate, name] = nameRetriever.event(eventFullName);

	let viewModelFunctions = [];
	let eventExtenderFunction;
	let preEventExtenderFunction;

	const modelSettings = {
		name,
		context,
		aggregate,
	};


	reaction = toFlatArray(reaction);

	reaction.forEach((item) => {
		// event handler
		if (typeof item === 'function') {
			viewModelFunctions.push(item); //  asyncParamApiCallback(item, customApiBuilder, 'event', 'vm'));
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

	const viewModelFunction = asyncParamApiCallback(buildViewModelFunction(viewModelFunctions), customApiBuilder, 'event', 'vm');

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
