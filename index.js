'use strict';

const uuid = require('uuid');
const aws = require('./lib/aws');
const consolidate = require('./lib/history').consolidate;
const toObject = require('./lib/payload').toObject;
const extract = require('./lib/properties').extract;

const respond = (onSuccess) => {
  return (err, response) => {
    if (err) {
      throw err;
    }

    return onSuccess(response);
  };
};

function hook (swf, options) {
  const extend = aws.extendParams(swf, options);

  return {
    create: (payload, params) => new Promise((resolve) => {
      const workflowId = uuid.v4();
      const swfParams = extend('startWorkflowExecution', params, {
        input: JSON.stringify(toObject(payload)),
        workflowId,
      });

      swf.startWorkflowExecution(swfParams, respond(response => {
        resolve({ workflowId, runId: response.runId });
      }));
    }),

    activities: (payload, params) => new Promise((resolve) => {
      const execution = extract(['workflowId', 'runId'], toObject(payload));
      const swfParams = extend('getWorkflowExecutionHistory', params, {
        execution
      });

      swf.getWorkflowExecutionHistory(swfParams, respond(history => {
        resolve(consolidate(execution, history.events));
      }));
    }),
  };
}

module.exports = hook;
