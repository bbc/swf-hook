'use strict';

/* global describe, it, beforeEach, afterEach */

const rewire = require('rewire');
const sinon = require('sinon');
const expect = require('chai').expect;

process.env.SWF_DOMAIN = 'swf-hook';
process.env.SWF_WORKFLOW_TYPE = 'name=foo,version=0.0.1';
process.env.SWF_TASK_PRIORITY = -10;

const lambda = rewire('../lambda');

describe('lambda', () => {
  let sandbox, swfCreateStub, swfHistoryStub;

  beforeEach(() => {
    const swf = lambda.__get__('swf');

    sandbox = sinon.sandbox.create();

    swfCreateStub = sandbox.stub(swf, 'startWorkflowExecution');
    swfHistoryStub = sandbox.stub(swf, 'getWorkflowExecutionHistory');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass env variables and cast them as SWF API params', () => {
    const payload = { foo: 'bar', other: true };

    lambda.create(payload);

    return Promise.resolve().then(() => {
      const params = swfCreateStub.firstCall.args[0];

      expect(params).to.contain.property('taskPriority', '-10');
      expect(params).to.contain.property('workflowType').to.deep.equal({
        name: 'foo',
        version: '0.0.1'
      });
    });
  });

  describe('#create', () => {
    it('should pass an input to getWorkflowExecutionHistory', () => {
      const payload = 'foo=bar&other=true';

      lambda.create(payload);

      return Promise.resolve().then(() => {
        const params = swfCreateStub.firstCall.args[0];

        expect(params).to.have.keys('domain', 'input', 'workflowType', 'workflowId', 'taskPriority');
        expect(params).to.contain.property('input', JSON.stringify({
          foo: 'bar',
          other: 'true'
        }));
      });
    });
  });

  describe('#activities', () => {
    it('should pass a workflowId+runId to getWorkflowExecutionHistory', () => {
      const payload = { workflowId: 'aaaa-bbbb', runId: '&abc+' };

      lambda.activities(payload);

      return Promise.resolve().then(() => {
        const params = swfHistoryStub.firstCall.args[0];

        expect(params).to.have.keys('domain', 'execution');
        expect(params).to.contain.property('execution')
                      .to.deep.equal(payload);
      });
    });
  });
});
