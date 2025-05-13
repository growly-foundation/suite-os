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
  Panel,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { StepNode } from '@/components/steps/step-node';
import type { AggregatedWorkflow } from '@growly/core';
import { getStepConditionEdges } from '@/lib/workflow.utils';
import Dagre from '@dagrejs/dagre';
import { Button } from '../ui/button';

const nodeTypes = {
  step: StepNode,
};

interface WorkflowCanvasProps {
  workflow: AggregatedWorkflow;
  setWorkflow: (workflow: AggregatedWorkflow) => void;
}

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: { direction: 'TB' | 'BT' | 'LR' | 'RL' }
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  const nodeWidth = 500;
  const nodeHeight = 500;

  edges.forEach(edge => g.setEdge(edge.source, edge.target));
  nodes.forEach(node =>
    g.setNode(node.id, {
      ...node,
      width: nodeWidth,
      height: nodeHeight,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map(node => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - nodeWidth / 2;
      const y = position.y - nodeHeight / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

export function WorkflowCanvas({ workflow, setWorkflow }: WorkflowCanvasProps) {
  const { fitView } = useReactFlow();
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

    const layouted = getLayoutedElements(flowNodes, flowEdges, { direction: 'LR' });
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
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

  const onLayout = useCallback(
    (direction: 'TB' | 'BT' | 'LR' | 'RL') => {
      console.log(nodes);
      const layouted = getLayoutedElements(nodes, edges, { direction });

      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      fitView();
    },
    [nodes, edges]
  );

  return (
    <div
      className="h-[calc(100vh-200px)] w-full border rounded-md bg-gray-50 dark:bg-gray-900"
      ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes as any}
        fitView
        deleteKeyCode="Delete">
        <Background />
        <Controls />
        {/* Removed MiniMap as requested */}
        <Panel position="top-right" className="flex gap-2">
          <Button onClick={() => onLayout('TB')} variant="outline">
            Vertical Layout
          </Button>
          <Button onClick={() => onLayout('LR')} variant="outline">
            Horizontal Layout
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
