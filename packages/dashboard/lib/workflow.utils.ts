import { Edge, MarkerType } from 'reactflow';
import {
  ConditionType,
  ScalarCondition,
  UIEventCondition,
  type Condition,
  type ParsedStep,
} from '@growly/core';

// Helper function to extract step IDs from conditions
export function extractStepIdsFromConditions(condition: Condition): string[] {
  if (!condition) return [];

  // If conditions is a boolean, there are no step dependencies
  if (condition.type === ConditionType.Always) return [];

  // If conditions is a string, it might be a step ID
  if (condition.type === ConditionType.Step) return [condition.data];

  // If conditions is an object with type 'and' or 'or'
  if (condition.type === ConditionType.Or || condition.type === ConditionType.And) {
    return condition.data.flatMap((condition: ScalarCondition) =>
      extractStepIdsFromConditions(condition)
    );
  }

  // If it's a judgedByAgent condition
  if (condition.type === ConditionType.JudgedByAgent && condition.data && condition.data.stepId) {
    return [condition.data.stepId];
  }
  return [];
}

// Get a human-readable description of the condition
export function getConditionDescription(condition: Condition): React.ReactNode {
  switch (condition.type) {
    case ConditionType.Always:
      return 'Always';
    case ConditionType.Step:
      return `After step: ${condition.data}`;
    case ConditionType.Workflow:
      return `After workflow: ${condition.data}`;
    case ConditionType.UIEvent:
      switch (condition.data) {
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
    case ConditionType.JudgedByAgent:
      return 'Judged by Agent';
    case ConditionType.Or:
      return condition.data.map(getConditionDescription).join(' OR ');
    case ConditionType.And:
      return condition.data.map(getConditionDescription).join(' AND ');
    default:
      return 'Unknown';
  }
}

// Create edges based on step conditions
export function getStepConditionEdges(step: ParsedStep, allSteps: ParsedStep[]): Edge[] {
  const edges: Edge[] = [];

  // Extract step IDs from conditions
  const dependencyIds = step.conditions.flatMap(extractStepIdsFromConditions);

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
        label: step.conditions.map(getConditionDescription).join(', '),
      });
    }
  });

  return edges;
}
