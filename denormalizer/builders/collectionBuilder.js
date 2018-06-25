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
		Collection,
		...definitions
	},
	customApiBuilder,
) => Object.entries(reactions).reduce(
	(collection, [eventFullName, reaction]) => addViewModelToCollection(collection, viewModelBuilder({ eventFullName, reaction, identifier: identity[eventFullName] }, definitions, customApiBuilder)),
	new Collection({
		name: collectionName,
		defaultPayload: '',
		repositorySettings,
	}, initialState),
);
