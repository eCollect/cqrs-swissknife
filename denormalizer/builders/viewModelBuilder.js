'use strict';

const { asyncParamCallback } = require('../../utils');

module.exports = ({ eventFullName, reaction, identifier }, { defineViewBuilder, definePreEventExtender, defineEventExtender }) => {
	const [context, aggregate, name] = eventFullName.split('.');

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
			viewModelFunction = asyncParamCallback(item, 'event', 'vm');
			return;
		}

		if (item.eventExtender) {
			if (eventExtenderFunction)
				throw new Error('Only one event extender can be defined per event');
			eventExtenderFunction = asyncParamCallback(item.eventExtender, 'event', 'vm');
			return;
		}

		if (item.preEventExtender) {
			if (preEventExtenderFunction)
				throw new Error('Only one pre-event extender can be defined per event');
			preEventExtenderFunction = asyncParamCallback(item.preEventExtender, 'event', 'collection');
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

	const viewModel = defineViewBuilder(
		modelSettings,
		viewModelFunction,
	);

	let preEventExtender;

	if (preEventExtenderFunction)
		preEventExtender = definePreEventExtender(
			modelSettings,
			preEventExtenderFunction,
		);

	let eventExtender;

	if (eventExtenderFunction)
		eventExtender = defineEventExtender(
			modelSettings,
			eventExtenderFunction,
		);

	if (typeof identifier === 'function') {
		viewModel.useAsId(asyncParamCallback(identifier, 'event'));
		if (eventExtender)
			eventExtender.useAsId(asyncParamCallback(identifier, 'event'));
	}

	return {
		viewModel,
		eventExtender,
		preEventExtender,
	};
};
