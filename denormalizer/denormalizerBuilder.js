'use strict';

const {
	defineCollection,
	defineEventExtender,
	definePreEventExtender,
	defineViewBuilder,
} = require('cqrs-eventdenormalizer');

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
		let eventExtender;
		let preEventExtender;

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
				if (eventExtender)
					throw new Error('Only one event extender can be defined per event');
				eventExtender = (event, vm, callback) => Promise.resolve(item.eventExtender(event, vm)).then(e => callback(null, e)).catch(e => callback(e));
				return;
			}

			if (item.preEventExtender) {
				if (preEventExtender)
					throw new Error('Only one event extender can be defined per event');
				preEventExtender = (event, col, callback) => Promise.resolve(item.preEventExtender(event, col)).then(e => callback(null, e)).catch(e => callback(e));
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

		collection.addViewModel(defineViewBuilder(
			modelSettings,
			viewModelFunction,
		));

		if (eventExtender)
			collection.addEventExtender(defineEventExtender(
				modelSettings,
				eventExtender,
			));

		if (preEventExtender)
			collection.addPreEventExtender(definePreEventExtender(
				modelSettings,
				preEventExtender,
			));
	});

	return collection;
};
