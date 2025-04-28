'use client';
import DashboardLayout from '@/components/layout';
import WidgetStudioLayout from '@/components/layout/widgetStudio';
import WidgetContainer from '@/components/widgets/WidgetContainer';
import { User } from '@supabase/supabase-js';

interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null;
}
export default function WidgetStudio(props: Props) {
  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title="AI Generator"
      description="AI Generator">
      <WidgetStudioLayout>
        <div className="flex justify-center items-center flex-col w-full">
          <WidgetContainer />
        </div>
      </WidgetStudioLayout>
    </DashboardLayout>
  );
}
