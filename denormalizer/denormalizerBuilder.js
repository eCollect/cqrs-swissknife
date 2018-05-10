'use strict';

const {
	defineCollection,
	defineEventExtender,
	definePreEventExtender,
	defineViewBuilder,
} = require('cqrs-eventdenormalizer');

const { asyncParamCallback } = require('../utils');

module.exports = (collectionName, {
	reactions = {}, repositorySettings = {}, identity = {},
}) => {
	const collection = defineCollection({
		name: collectionName,
		defaultPayload: '',
		repositorySettings,
	});

	// define viewModels
	Object.entries(reactions).forEach(([eventFullName, model]) => {
		const [context, aggregate, name] = eventFullName.split('.');

		let identifier = identity[eventFullName];
		let viewModelFunction;
		let eventExtenderFunction;
		let preEventExtenderFunction;

		const modelSettings = {
			name,
			context,
			aggregate,
		};

		if (!Array.isArray(model))
			model = [model];

		model.forEach((item) => {
			// command
			if (typeof item === 'function') {
				viewModelFunction = (event, vm, callback) => Promise.resolve(item(event, vm)).then(() => vm.commit(callback));
				return;
			}

			if (item.eventExtender) {
				if (eventExtenderFunction)
					throw new Error('Only one event extender can be defined per event');
				eventExtenderFunction = asyncParamCallback(item.eventExtender, 'item', 'vm');
				return;
			}

			if (item.preEventExtender) {
				if (preEventExtenderFunction)
					throw new Error('Only one event extender can be defined per event');
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
			viewModel.useAsId(identifier);
			if (eventExtender)
				eventExtender.useAsId(identifier);
		}

		collection.addViewModel(viewModel);
		if (eventExtender)
			collection.addeventExtender(eventExtender);

		if (preEventExtender)
			collection.addeventExtender(preEventExtender);
	});

	return collection;
};
