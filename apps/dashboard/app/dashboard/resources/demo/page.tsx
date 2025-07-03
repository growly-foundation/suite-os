'use client';

import { ResourcePageLayout } from '@/components/layouts/resource-page-layout';
import { mockResources } from '@/components/resources/mock-resources';

export default function ResourceDemoPage() {
  return (
    <ResourcePageLayout
      title="Resources Demo"
      resources={mockResources}
      onResourceUpdate={updatedResource => {
        console.log('Update resource:', updatedResource);
      }}
      onResourceDelete={id => {
        console.log('Delete resource:', id);
      }}
      onResourceAdd={() => {
        console.log('Add new resource');
      }}
    />
  );
}
