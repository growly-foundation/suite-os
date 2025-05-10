import { Edge, MarkerType } from 'reactflow';
import type { ParsedStep, Step } from '@growly/core';

enum UIEventCondition {
  Always = 'always',
  OnPageLoad = 'onPageLoad',
  OnVisited = 'onVisited',
  OnClicked = 'onClicked',
  OnHovered = 'onHovered',
}

// Helper function to extract step IDs from conditions
export function extractStepIdsFromConditions(conditions: any): string[] {
  if (!conditions) return [];

  // If conditions is a boolean, there are no step dependencies
  if (typeof conditions === 'boolean') return [];

  // If conditions is a string, it might be a step ID
  if (typeof conditions === 'string') return [conditions];

  // If conditions is an object with type 'and' or 'or'
  if (typeof conditions === 'object' && conditions.type) {
    if (conditions.type === 'and' || conditions.type === 'or') {
      return conditions.conditions.flatMap((condition: any) =>
        extractStepIdsFromConditions(condition)
      );
    }
    // If it's a judgedByAgent condition
    if (conditions.type === 'judgedByAgent' && conditions.args && conditions.args.stepId) {
      return [conditions.args.stepId];
    }
  }

  // If conditions is an array
  if (Array.isArray(conditions)) {
    return conditions.flatMap(condition => extractStepIdsFromConditions(condition));
  }

  return [];
}

// Get a human-readable description of the condition
export function getConditionDescription(condition: any): string {
  if (condition === true) return 'Always';
  if (typeof condition === 'string') {
    // Check if it's a UI event condition
    if (Object.values(UIEventCondition).includes(condition as any)) {
      switch (condition) {
        case UIEventCondition.Always:
          return 'Always';
        case UIEventCondition.OnPageLoad:
          return 'On Page Load';
        case UIEventCondition.OnVisited:
          return 'On Visited';
        case UIEventCondition.OnClicked:
          return 'On Clicked';
        case UIEventCondition.OnHovered:
          return 'On Hovered';
        default:
          return 'UI Event';
      }
    }
    // Otherwise it's a step ID
    return 'After Step';
  }

  if (typeof condition === 'object') {
    if (condition.type === 'and') return 'All Conditions';
    if (condition.type === 'or') return 'Any Condition';
    if (condition.type === 'judgedByAgent') return 'Judged by Agent';
  }

  return 'Custom Condition';
}

// Create edges based on step conditions
export function getStepConditionEdges(step: ParsedStep, allSteps: ParsedStep[]): Edge[] {
  const edges: Edge[] = [];

  // Extract step IDs from conditions
  const dependencyIds = extractStepIdsFromConditions(step.conditions);

  // Create an edge for each dependency
  dependencyIds.forEach(sourceId => {
    // Check if the source step exists
    const sourceStep = allSteps.find(s => s.id === sourceId);
    if (sourceStep) {
      edges.push({
        id: `${sourceId}-${step.id}`,
        source: sourceId,
        target: step.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#555' },
        label: getConditionDescription(step.conditions),
      });
    }
  });

  return edges;
}
