'use client';

import type React from 'react';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  Position,
  Panel,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { StepNode } from '@/components/steps/step-node';
import { getLayoutedElements, getStepConditionEdges } from '@/lib/workflow.utils';
import { Button } from '../ui/button';
import { useWorkflowDetailStore } from '@/hooks/use-workflow-details';

enum LayoutDirection {
  Vertical = 'TB',
  Horizontal = 'LR',
}

export function WorkflowCanvas() {
  const { workflow } = useWorkflowDetailStore();
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

    const layouted = getLayoutedElements(flowNodes, flowEdges, {
      direction: LayoutDirection.Horizontal,
    });
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

  const onLayout = useCallback(
    (direction: LayoutDirection) => {
      const layouted = getLayoutedElements(nodes, edges, {
        direction,
      });
      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);
      fitView();
    },
    [nodes, edges]
  );

  const nodeTypes = useMemo(
    () => ({
      step: StepNode(workflow?.id || ''),
    }),
    [workflow]
  );

  return (
    <div
      className="h-[calc(100vh-300px)] w-full border rounded-md bg-gray-50 dark:bg-gray-900"
      ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView>
        <Background />
        <Controls />
        {/* Removed MiniMap as requested */}
        <Panel position="top-right" className="flex gap-2">
          <Button onClick={() => onLayout(LayoutDirection.Vertical)} variant="outline">
            Vertical Layout
          </Button>
          <Button onClick={() => onLayout(LayoutDirection.Horizontal)} variant="outline">
            Horizontal Layout
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
