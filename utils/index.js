'use strict';


const asyncParamCallbacks = {
	1: fn => (par1, callback) => Promise.resolve(fn(par1)).then(result => callback(null, result)).catch(error => callback(error)),
	2: fn => (par1, par2, callback) => Promise.resolve(fn(par1, par2)).then(result => callback(null, result)).catch(error => callback(error)),
	3: fn => (par1, par2, par3, callback) => Promise.resolve(fn(par1, par2, par3)).then(result => callback(null, result)).catch(error => callback(error)),
};

const asyncParamCallback = (fn, ...params) => {
	const asyncFn = asyncParamCallbacks[params.length];

	if (!asyncFn)
		throw new Error(`Async param callback function with ${params.length} parameters is not implemented yet.`);

	return asyncFn(fn);
};

module.exports = {
	asyncParamCallback,
};
