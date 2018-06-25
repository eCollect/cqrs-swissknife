'use strict';


const asyncParamCallbacks = {
	1: fn => (par1, callback) => Promise.resolve(fn(par1)).then(result => callback(null, result), error => callback(error)),
	2: fn => (par1, par2, callback) => Promise.resolve(fn(par1, par2)).then(result => callback(null, result), error => callback(error)),
	3: fn => (par1, par2, par3, callback) => Promise.resolve(fn(par1, par2, par3)).then(result => callback(null, result), error => callback(error)),
};

const asyncParamCallback = (fn, ...params) => {
	const asyncFn = asyncParamCallbacks[params.length];

	if (!asyncFn)
		throw new Error(`Async param callback function with ${params.length} parameters is not implemented yet.`);

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

module.exports = {
	asyncParamCallback,
	asyncParamApiCallback,
	noop,
};
