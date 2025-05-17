import { Action, AggregatedWorkflow, UIEventCondition, UserDefinedPayload } from '@growly/core';
import { suiteCoreService } from '@/services/core.service';
import { useSuiteSession } from '@/hooks/use-session';
import { useEffect, useState } from 'react';
import { useSuite } from '@/hooks/use-suite';

export const WorkflowExecutionObserver: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [growlyElementMap, setGrowlyElementMap] = useState<Map<Element, UserDefinedPayload>>(
    new Map()
  );
  const { agentId, organizationApiKey } = useSuite();
  const { workflowExecutionService, initWorkflowExecutionService } = useSuiteSession();
  const executeActions = (actions: Action[]) => {
    for (const action of actions) {
      if (action.type === 'text') {
        console.log(`TextAction: ${action.return.text}`);
      } else if (action.type === 'agent') {
        console.log(`AgentAction prompt: ${action.args.prompt}`);
        executeActions([action.return]);
      }
    }
  };
  console.log(growlyElementMap);

  const handleGrowlyMouseEvent = (event: MouseEvent, condition: UIEventCondition) => {
    if (!workflowExecutionService) return;

    const target = event.target as HTMLElement;

    // Use identity check against the map (no DOM walk)
    const action = growlyElementMap.get(target);
    if (!action || action.type !== 'step') return;

    console.log('Growly Suite: Action triggered', target);
    workflowExecutionService.triggerUIEvent(
      condition,
      action.payload.id,
      action.payload.conditions
    );
  };

  const handleGrowlyClick = (e: MouseEvent) =>
    handleGrowlyMouseEvent(e, UIEventCondition.OnClicked);

  const handleGrowlyMouseEnter = (e: MouseEvent) =>
    handleGrowlyMouseEvent(e, UIEventCondition.OnHovered);

  const handlePageLoad = () =>
    workflowExecutionService?.triggerUIEvent(UIEventCondition.OnPageLoad);

  const handleVisited = () => workflowExecutionService?.triggerUIEvent(UIEventCondition.OnVisited);

  const updateGrowlyMap = (nodes: NodeList | Node[]) => {
    nodes.forEach(node => {
      if (!(node instanceof HTMLElement)) return;
      if (node.hasAttribute('data-growly')) {
        try {
          const data: UserDefinedPayload = JSON.parse(node.getAttribute('data-growly')!);
          setGrowlyElementMap(growlyElementMap.set(node, data));
        } catch (err) {
          console.warn('Invalid data-growly JSON:', node.getAttribute('data-growly'));
        }
      }
      // Check children too
      node.querySelectorAll?.('[data-growly]')?.forEach(child => {
        try {
          const data: UserDefinedPayload = JSON.parse(child.getAttribute('data-growly')!);
          setGrowlyElementMap(growlyElementMap.set(child, data));
        } catch (err) {
          console.warn('Invalid data-growly JSON in child:', child.getAttribute('data-growly'));
        }
      });
    });
  };

  const removeGrowlyFromMap = (nodes: NodeList | Node[]) => {
    nodes.forEach(node => {
      if (!(node instanceof HTMLElement)) return;
      growlyElementMap.delete(node);
      node.querySelectorAll?.('[data-growly]')?.forEach(child => {
        growlyElementMap.delete(child);
      });
    });
  };

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) updateGrowlyMap(mutation.addedNodes);
      if (mutation.removedNodes.length) removeGrowlyFromMap(mutation.removedNodes);
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  useEffect(() => {
    async function evaluateAndExecuteAgentWorkflows() {
      if (!agentId || !organizationApiKey) return;
      try {
        const workflows = await suiteCoreService.call<'workflows', AggregatedWorkflow[]>(
          'workflows',
          'getWorkflowsByAgentId',
          [agentId]
        );
        initWorkflowExecutionService(workflows, executeActions);
      } catch (error) {
        console.error(`Growly Suite Execution Error: ${error}`);
      }
    }
    evaluateAndExecuteAgentWorkflows();
  }, [agentId, organizationApiKey]);

  useEffect(() => {
    if (!workflowExecutionService) return;
    document.addEventListener('click', handleGrowlyClick);
    document.addEventListener('mouseenter', handleGrowlyMouseEnter);
    document.addEventListener('DOMContentLoaded', handlePageLoad);
    window.addEventListener('pageshow', handleVisited);

    return () => {
      document.removeEventListener('click', handleGrowlyClick);
      document.removeEventListener('mouseenter', handleGrowlyMouseEnter);
      document.removeEventListener('DOMContentLoaded', handlePageLoad);
      window.removeEventListener('pageshow', handleVisited);
    };
  }, [workflowExecutionService]);

  return <>{children}</>;
};
