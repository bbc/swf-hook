'use strict';

const valuesOf = (obj) => {
  return Object.keys(obj).map(key => obj[key]);
};

const DEFAULT_ACTIVITY = Object.freeze({
  activityType: {
    name: '',
    version: ''
  },
  status: '',
  scheduledAt: '',
  startedAt: '',
  completedAt: '',
  identity: '',
  activityId: ''
});

const COMPLETION_EVENTS = [
  'WorkflowExecutionCompleted',
  'WorkflowExecutionFailed',
  'WorkflowExecutionTimedOut',
  'WorkflowExecutionCanceled',
  'WorkflowExecutionTerminated',
];

const ACTIVITY_COMPLETION_EVENTS = [
  'ActivityTaskCompleted',
  'ActivityTaskFailed',
  'ActivityTaskTimedOut',
  'ActivityTaskCanceled',
];

function reduceActivities (workflow, event) {
  const eventType = event.eventType;
  const attrs = event[`${eventType[0].toLowerCase()}${eventType.slice(1)}EventAttributes`];

  if (eventType === 'WorkflowExecutionStarted') {
    workflow.execution.startedAt = event.eventTimestamp;
    workflow.execution.stdin = attrs.input;
    workflow.status = 'Started';
  }

  if (COMPLETION_EVENTS.indexOf(eventType) !== -1) {
    workflow.execution.completedAt = event.eventTimestamp;
    workflow.status = eventType.replace('WorkflowExecution', '');
  }

  if (eventType === 'ActivityTaskScheduled') {
    let activityType = attrs.activityType;
    let activityId = attrs.activityId;

    workflow.eventIdToTaskMap[event.eventId] = activityId;
    workflow.activities[activityId] = Object.assign({}, DEFAULT_ACTIVITY, {
      activityType,
      activityId,
      scheduledAt: event.eventTimestamp,
      status: 'Scheduled'
    });
  }

  if (eventType === 'ActivityTaskStarted') {
    let activityId = workflow.eventIdToTaskMap[ attrs.scheduledEventId ];
    let activity = workflow.activities[activityId];

    activity.startedAt = event.eventTimestamp;
    activity.identity = attrs.identity;
    activity.status = 'Started';
  }

  if (ACTIVITY_COMPLETION_EVENTS.indexOf(eventType) !== -1) {
    let activityId = workflow.eventIdToTaskMap[ attrs.scheduledEventId ];
    let activity = workflow.activities[activityId];

    activity.completedAt = event.eventTimestamp;
    activity.status = eventType.replace('ActivityTask', '');

    if (attrs.reason) {
      activity.stderr = `${attrs.reason}\n${attrs.details}`
        .trim()
        .replace(new RegExp(workflow.execution.workflowId, 'gi'), '<workflow-id>');
    }

    if (attrs.result) {
      activity.stdout = attrs.result;
    }
  }

  return workflow;
}

function consolidate (execution, history) {
  const DEFAULT_WORKFLOW_HISTORY = {
    execution: {
      startedAt: '',
      completedAt: '',
    },
    eventIdToTaskMap: {},
    activities: {}
  };

  const defaults = Object.assign({}, DEFAULT_WORKFLOW_HISTORY);
  defaults.execution = Object.assign({}, execution, defaults.execution);

  const workflow = history.reduce(reduceActivities, defaults);
  workflow.activities = valuesOf(workflow.activities);

  delete workflow.eventIdToTaskMap;

  return workflow;
}

module.exports = {
  consolidate
};
