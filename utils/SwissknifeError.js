'use strict';

module.exports = class SwissknifeError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, SwissknifeError);
	}
};
