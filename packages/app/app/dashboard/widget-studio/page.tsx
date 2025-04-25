import { getUser, getUserDetails } from '@/utils/supabase/queries';

import WidgetStudio from '@/components/dashboard/widget-studio';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function WidgetStudioPage() {
  const supabase = await createClient();
  const [user, userDetails] = await Promise.all([getUser(supabase), getUserDetails(supabase)]);

  if (!user) {
    return redirect('/dashboard/signin');
  }

  return <WidgetStudio user={user} userDetails={userDetails} />;
}
