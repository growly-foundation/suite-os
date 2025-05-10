'use client';

import type React from 'react';

import { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { StepNode } from '@/components/steps/step-node';
import type { AggregatedWorkflow } from '@growly/core';
import { getStepConditionEdges } from '@/lib/workflow.utils';

const nodeTypes = {
  step: StepNode,
};

interface WorkflowCanvasProps {
  workflow: AggregatedWorkflow;
  setWorkflow: (workflow: AggregatedWorkflow) => void;
}

export function WorkflowCanvas({ workflow, setWorkflow }: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert workflow steps to ReactFlow nodes and edges
  useEffect(() => {
    if (!workflow || !workflow.steps) return;

    // Create nodes from steps
    const flowNodes: Node[] = workflow.steps.map((step, index) => ({
      id: step.id,
      type: 'step',
      position: { x: 250 * index, y: 100 * index },
      data: { step, workflow },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }));

    // Create edges from step conditions
    let flowEdges: Edge[] = [];
    workflow.steps.forEach(step => {
      const stepEdges = getStepConditionEdges(step, workflow.steps);
      flowEdges = [...flowEdges, ...stepEdges];
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [workflow, setNodes, setEdges]);

  // Update workflow when nodes change
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Update node positions in the workflow
      const updatedNodes = nodes.map(n => {
        if (n.id === node.id) {
          return { ...n, position: node.position };
        }
        return n;
      });
      setNodes(updatedNodes);
    },
    [nodes, setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      // Create a new edge
      const newEdge = {
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#555' },
      };

      // Add the edge to the graph
      setEdges(eds => addEdge(newEdge, eds));

      // Update the workflow step conditions
      if (params.source && params.target) {
        const updatedSteps = workflow.steps?.map(step => {
          if (step.id === params.target) {
            // TODO: Add a condition that depends on the source step
            const updatedConditions: any = {
              type: 'and',
              conditions: [params.source],
            };

            return {
              ...step,
              conditions: updatedConditions,
            };
          }
          return step;
        });

        setWorkflow({
          ...workflow,
          steps: updatedSteps || [],
        });
      }
    },
    [setEdges, workflow, setWorkflow]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      // Remove deleted steps from the workflow
      const deletedIds = deleted.map(node => node.id);
      const updatedSteps = workflow.steps?.filter(step => !deletedIds.includes(step.id)) || [];

      setWorkflow({
        ...workflow,
        steps: updatedSteps,
      });
    },
    [workflow, setWorkflow]
  );

  return (
    <div
      className="h-[600px] w-full border rounded-md bg-gray-50 dark:bg-gray-900"
      ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode="Delete">
        <Background />
        <Controls />
        {/* Removed MiniMap as requested */}
      </ReactFlow>
    </div>
  );
}
