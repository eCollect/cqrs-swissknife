'use strict';

const { asyncParamCustomErrorApiCallback } = require('../../utils');

const nameGenerator = (context, aggregateName, index) => `${context}:${aggregateName}:businessRule:${index}`;

const ruleNormalizer = (context, aggregateName, index, rule) => {
	if (typeof rule === 'function')
		return {
			name: nameGenerator(context, aggregateName, index),
			rule,
		};
	// should be an object
	if (!rule || !('rule' in rule) || typeof rule.rule !== 'function')
		throw new Error('Invlaid business rule.');

	if (!rule.name)
		rule.name = nameGenerator(context, aggregateName, index);
	return rule;
};

const rulesNormalizer = (context, aggregateName, rules) => {
	if (!Array.isArray(rules))
		rules = [rules];
	return rules.map((rule, index) => ruleNormalizer(context, aggregateName, index, rule));
};

module.exports = (
	{
		context,
		aggregateName,
		rules,
	},
	{
		BusinessRule,
		errorBuilders,
	},
	customApiBuilder,
) => rulesNormalizer(context, aggregateName, rules).map(rule => new BusinessRule({ name: rule.name, description: rule.description }, asyncParamCustomErrorApiCallback(rule.rule, errorBuilders.businessRule, (cs, ps, e, c) => customApiBuilder(c), 'currentState', 'previousState', 'events', 'command')));
