import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers';
import RealtimeSubscription from '@/components/RealtimeSubscription';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profile")
    .select()
    .eq("id", user?.id)
    .single();

  return (
    <RealtimeSubscription profileData={profile} />
  )
}