'use strict';

const assign = require('./properties').assign;
const toObject = require('./payload').toObject;
const extract = require('./properties').extract;
const toCamelCase = require('./properties').toCamelCase;
const toShorthand = require('./properties').toShorthand;

const SHORTHAND_PROPERTIES = [
  'workflowType',
  'taskList'
];

const getMemberNames = (swf, method) => {
  return swf.api.operations[method].input.memberNames;
};

const extendParams = (client, defaults) => {
  return (method, params, extras) => {
    const memberNames = getMemberNames(client, method);
    const allParams = toShorthand(toCamelCase(assign(defaults, params, extras), 'SWF_'));

    SHORTHAND_PROPERTIES.forEach(prop => {
      if (prop in allParams) {
        allParams[prop] = toObject(allParams[prop], ',');
      }
    });

    return extract(memberNames, allParams);
  };
};

module.exports = {
  extendParams,
  getMemberNames
};
