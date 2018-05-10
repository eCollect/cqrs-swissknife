'use strict';

const {
	defineCollection,
	defineEventExtender,
	definePreEventExtender,
	defineViewBuilder,
} = require('cqrs-eventdenormalizer');

module.exports = (collectionName, {
	eventExtenders = {}, preEventExtenders = {}, viewBuilders = {}, repositorySettings = {},
}) => {
	const collection = defineCollection({
		name: collectionName,
		defaultPayload: '',
		repositorySettings,
	});

	// define preEventExtenders
	Object.entries(preEventExtenders).forEach(([extenderName, extender]) => {
		const [context, aggregate, name, id] = extenderName.split('|');

		const extenderSettings = {
			name,
			context,
			aggregate,
			id,
		};

		if (!Array.isArray(extender))
			extender = [extender];

		return extender.forEach((item) => {
			// command
			if (typeof item === 'function')
				return collection.addPreEventExtender(definePreEventExtender(extenderSettings, item));

			// settings ( exists ? )
			if (item.settings)
				return Object.assign(extenderSettings, item.settings);

			return null;
		});
	});

	// define eventExtenders
	Object.entries(eventExtenders).forEach(([extenderName, extender]) => {
		const [context, aggregate, name, id] = extenderName.split('|');

		const extenderSettings = {
			name,
			context,
			aggregate,
			id,
		};

		if (!Array.isArray(extender))
			extender = [extender];

		return extender.forEach((item) => {
			// command
			if (typeof item === 'function')
				return collection.addEventExtender(defineEventExtender(extenderSettings, item));

			// settings ( exists ? )
			if (item.settings)
				return Object.assign(extenderSettings, item.settings);

			return null;
		});
	});

	// define viewModels
	Object.entries(viewBuilders).forEach(([modelName, model]) => {
		const [context, aggregate, name, id] = modelName.split('|');

		const modelSettings = {
			name,
			context,
			aggregate,
			id,
		};

		if (!Array.isArray(model))
			model = [model];

		return model.forEach((item) => {
			// command
			if (typeof item === 'function')
				return collection.addViewBuilder(defineViewBuilder(modelSettings, (event, vm, callback) => Promise.resolve(item(event, vm)).then(() => vm.commit(callback))));

			// settings ( exists ? )
			if (item.settings)
				return Object.assign(modelSettings, item.settings);

			return null;
		});
	});

	return collection;
};
