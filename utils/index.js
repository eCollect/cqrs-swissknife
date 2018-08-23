'use strict';

const nextifyWrappers = {
	1: fn => (par1, next) => Promise.resolve(fn(par1)).then(() => next(), error => next(error)),
	2: fn => (par1, par2, next) => Promise.resolve(fn(par1, par2)).then(() => next(), error => next(error)),
	3: fn => (par1, par2, par3, next) => Promise.resolve(fn(par1, par2, par3)).then(() => next(), error => next(error)),
};

const nextify = (fn, ...params) => {
	const asyncFn = nextifyWrappers[params.length];

	if (!asyncFn)
		throw new Error(`Next callback function with ${params.length} parameters is not implemented yet.`);

	return asyncFn(fn);
};

const asyncParamApiCallbacks = {
	1: (fn, api) => (par1, callback) => Promise.resolve(fn(par1, api(par1))).then(result => callback(null, result), error => callback(error)),
	2: (fn, api) => (par1, par2, callback) => Promise.resolve(fn(par1, par2, api(par1, par2))).then(result => callback(null, result), error => callback(error)),
	3: (fn, api) => (par1, par2, par3, callback) => Promise.resolve(fn(par1, par2, par3, api(par1, par2, par3))).then(result => callback(null, result), error => callback(error)),
};

const asyncParamApiCallback = (fn, api, ...params) => {
	const asyncFn = asyncParamApiCallbacks[params.length];

	if (!asyncFn)
		throw new Error(`Async param callback function with ${params.length} parameters is not implemented yet.`);

	return asyncFn(fn, api);
};

const noop = () => ({});

const valueop = v => v;

const isObject = val => val != null && typeof val === 'object' && Array.isArray(val) === false;

const isString = val => typeof val === 'string';

const nameRetriever = {
	/**
	 * Supports two fomat of event names : [context].[domain].[agg] OR [type].[context].[domain].[agg]
	 */
	event: (eventFullName) => {
		const split = eventFullName.split('.');
		if (split.length === 4)
			return split.slice(1);
		return split;
	},
};

module.exports = {
	nextify,
	asyncParamApiCallback,
	noop,
	valueop,
	isObject,
	nameRetriever,
};
