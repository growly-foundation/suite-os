import WorkflowManager from '@/components/workflows/workflow-manager';

export const metadata = {
  title: 'Workflows | Growly',
  description: 'Manage your automated workflows',
};

export default function WorkflowPage() {
  return <WorkflowManager />;
}
