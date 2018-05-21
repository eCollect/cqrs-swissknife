'use strict';

const viewModelBuilder = require('./viewModelBuilder');

const addViewModelToCollection = (collection, { viewModel, eventExtender, preEventExtender }) => {
	collection.addViewBuilder(viewModel);

	if (eventExtender)
		collection.addEventExtender(eventExtender);

	if (preEventExtender)
		collection.addPreEventExtender(preEventExtender);

	return collection;
};

module.exports = (
	collectionName,
	{
		reactions = {}, repositorySettings = {}, identity = {}, initialState = {},
	},
	{
		defineCollection,
		...definitions
	},
) => Object.entries(reactions).reduce(
	(collection, [eventFullName, reaction]) => addViewModelToCollection(collection, viewModelBuilder({ eventFullName, reaction, identifier: identity[eventFullName] }, definitions)),
	defineCollection({
		name: collectionName,
		defaultPayload: '',
		repositorySettings,
	}, initialState),
);