'use strict';

module.exports = ({ eventName, event }, { Event }) => {
	const eventSettings = {
		name: eventName,
	};

	// plain old simple command
	if (!Array.isArray(event))
		event = [event];

	return event.reduce((result, item) => {
		// command
		if (typeof item === 'function')
			result.event = new Event(eventSettings, item);

		// settings ( exists ? )
		if (item.settings)
			Object.assign(eventSettings, item.settings);

		return result;
	}, {
		event: null,
	});
};
