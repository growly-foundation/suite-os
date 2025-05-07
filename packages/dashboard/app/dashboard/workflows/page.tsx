import WorkflowManager from '@/components/workflows/workflow-manager';

export const metadata = {
  title: 'Workflows | Growly Suite',
  description: 'Manage your automated workflows of your agents.',
};

export default function WorkflowPage() {
  return <WorkflowManager />;
}
