'use strict';

const AWS = require('aws-sdk');
const apex = require('apex.js');
const hook = require('./index');

const swf = new AWS.SWF({ region: process.env.AWS_DEFAULT_REGION });
const api = hook(swf, process.env);

['create', 'activities'].forEach(method => {
  exports[method] = apex(event => api[method](event));
});
