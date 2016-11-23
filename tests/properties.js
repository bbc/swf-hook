'use strict';

/* global describe, it */

const expect = require('chai').expect;
const api = require('../lib/properties');

describe('properties', () => {
  describe('assign', () => {
    const assign = api.assign;

    it('should extend a series of objects', () => {
      expect(assign({ foo: 'bar' }, { yes: true })).to.deep.equal({
        foo: 'bar',
        yes: true
      });
    });

    it('should treat undefined objects as an empty object', () => {
      expect(assign({ foo: 'bar' }, undefined)).to.deep.equal({
        foo: 'bar'
      });
    });
  });

  describe('toCamelCase', () => {
    const toCamelCase = api.toCamelCase;

    it('should return a SWF_ prefix-stripped lower camel case object', () => {
      const ENV = {
        'SWF_DOMAIN': 'foo',
        'SWF_TASK_PRIORITY': '-10',
        'SWF_WORKFLOW_TYPE__NAME': 'Foo',
        'SWF_WORKFLOW_TYPE__VERSION': '20160101',
        'workflowId': 'aaaa-bbbb'
      };

      expect(toCamelCase(ENV)).to.deep.equal({
        domain: 'foo',
        taskPriority: '-10',
        workflowType__name: 'Foo',
        workflowType__version: '20160101',
        workflowId: 'aaaa-bbbb'
      });
    });

    it('should work on custom prefixed keys', () => {
      const ENV = {
        'SWF_DOMAIN': 'foo',
        'AWS_REGION': 'eu-west-1'
      };

      expect(toCamelCase(ENV, 'AWS_')).to.deep.equal({
        SWF_DOMAIN: 'foo',
        region: 'eu-west-1'
      });
    });

    it('should work on empty object', () => {
      expect(toCamelCase()).to.deep.equal({});
    });
  });

  describe('toShorthand', () => {
    const toShorthand = api.toShorthand;

    it('should return a reduced config object with shorthanded values', () => {
      const ENV = {
        'taskPriority': '-10',
        'workflowType__name': 'Foo',
        'workflowType__version': '20160101'
      };

      expect(toShorthand(ENV)).to.deep.equal({
        taskPriority: '-10',
        workflowType: 'name=Foo,version=20160101'
      });
    });
  });
});
