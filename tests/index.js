'use strict';

/* global describe, it, beforeEach, afterEach */

const sinon = require('sinon');
const expect = require('chai').expect;
const AWS = require('aws-sdk');

const hook = require('../index');
const historyResponse = require('./fixtures/history.json');
const errorResponse = require('./fixtures/error.json');

const UUID = /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;


describe('api', () => {
  let sandbox, swfCreateStub, swfHistoryStub, api;

  beforeEach(() => {
    const swf = new AWS.SWF({ region: 'eu-west-1' });
    api = hook(swf, {
      SWF_DOMAIN: 'swf-hook',
      SWF_WORKFLOW_TYPE: 'name=foo,version=0.0.1'
    });

    sandbox = sinon.sandbox.create();

    swfCreateStub = sandbox.stub(swf, 'startWorkflowExecution');
    swfHistoryStub = sandbox.stub(swf, 'getWorkflowExecutionHistory');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('create', () => {
    it('should respond with a { workflowId, runId } execution object', () => {
      swfCreateStub.yields(null, { runId: '%abc+' });

      return api.create({ foo: 'bar' }).then(execution => {
        expect(execution).to.have.keys('runId', 'workflowId');

        expect(execution).to.have.property('runId', '%abc+');
        expect(execution).to.have.property('workflowId').to.match(UUID);
      });
    });

    it('should fail if swf respond with an error', () => {
      swfCreateStub.yields(errorResponse);

      return api.create({ foo: 'bar' }).catch(err => {
        expect(err).to.have.property('message').to.match(/Unknown execution/);
      });
    });
  });

  describe('activities', () => {
    it('should respond with a consolidated history', () => {
      swfHistoryStub.yields(null, historyResponse);

      const execution = { workflowId: '5c42f06b-7cc5-4bd5-8813-4620fb5ad240', runId: '22qIzqlMXRNFjGK9AODY+89HfVJjCC6OIheIVk/l/PfN4=' };

      return api.activities(execution).then(activities => {
        expect(activities).to.have.keys('execution', 'activities', 'status');

        expect(activities).to.have.property('execution').to.contain(execution);
      });
    });
  });
});
