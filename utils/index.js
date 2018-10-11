'use strict';

const path = require('path');

const noop = () => ({});

const valueop = v => v;

const isObject = val => val != null && typeof val === 'object' && Array.isArray(val) === false;

const isString = val => typeof val === 'string';

const flat = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flat(b) : b), []);

const toFlatArray = (workflow) => {
	if (!Array.isArray(workflow))
		return [workflow];
	return flat(workflow);
};

const assureAsync = (fn) => {
	if (typeof fn.then === 'function')
		return fn;
	return async (...params) => fn(...params);
};

const promisifyWrappers = {
	1: fn => function promisified(par1) {
		return new Promise((resolve, reject) => fn.call(this, par1, (err, ...results) => {
			if (err)
				return reject(err);
			return resolve(results);
		}));
	},
	2: fn => function promisified(par1, par2) {
		return new Promise((resolve, reject) => fn.call(this, par1, par2, (err, ...results) => {
			if (err)
				return reject(err);
			return resolve(results);
		}));
	},
	3: fn => function promisified(par1, par2, par3) {
		return new Promise((resolve, reject) => fn.call(this, par1, par2, par3, (err, ...results) => {
			if (err)
				return reject(err);
			return resolve(results);
		}));
	},
};

const nextifyWrappers = {
	1: fn => (par1, next) => fn(par1).then(() => next(), error => next(error)),
	2: fn => (par1, par2, next) => fn(par1, par2).then(() => next(), error => next(error)),
	3: fn => (par1, par2, par3, next) => fn(par1, par2, par3).then(() => next(), error => next(error)),
};

const nextify = (fn, ...params) => {
	const asyncFn = nextifyWrappers[params.length];

	if (!asyncFn)
		throw new Error(`Next callback function with ${params.length} parameters is not implemented yet.`);

	return asyncFn(assureAsync(fn));
};

const promisify = (fn) => {
	const length = fn.length - 1;
	const asyncFn = promisifyWrappers[length];

	if (!asyncFn)
		throw new Error(`Promisify function with ${length} parameters is not implemented yet.`);

	return asyncFn(fn);
};

const asyncParamApiCallbacks = {
	1: (fn, errorBuilder, api) => (par1, callback) => fn(par1, api(par1)).then(result => callback(null, result), error => callback(errorBuilder(error))),
	2: (fn, errorBuilder, api) => (par1, par2, callback) => fn(par1, par2, api(par1, par2)).then(result => callback(null, result), error => callback(errorBuilder(error))),
	3: (fn, errorBuilder, api) => (par1, par2, par3, callback) => fn(par1, par2, par3, api(par1, par2, par3)).then(result => callback(null, result), error => callback(errorBuilder(error))),
	4: (fn, errorBuilder, api) => (par1, par2, par3, par4, callback) => fn(par1, par2, par3, par4, api(par1, par2, par3, par4)).then(result => callback(null, result), error => callback(errorBuilder(error))),
};


const asyncParamApiCallback = (fn, api, ...params) => {
	const asyncFn = asyncParamApiCallbacks[params.length];

	if (!asyncFn)
		throw new Error(`Async param callback function with ${params.length} parameters is not implemented yet.`);

	return asyncFn(assureAsync(fn), valueop, api);
};

const asyncParamCustomErrorApiCallback = (fn, errorBuilder = valueop, api, ...params) => {
	const asyncFn = asyncParamApiCallbacks[params.length];

	if (!asyncFn)
		throw new Error(`Async param callback function with ${params.length} parameters is not implemented yet.`);

	return asyncFn(assureAsync(fn), errorBuilder, api);
};

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

const firstFilenamePart = filename => path.basename(filename).split('.', 1)[0];

module.exports = {
	toFlatArray,
	flat,
	nextify,
	promisify,
	asyncParamApiCallback,
	asyncParamCustomErrorApiCallback,
	noop,
	valueop,
	isObject,
	isString,
	nameRetriever,
	firstFilenamePart,
};
