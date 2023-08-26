'use client'
import { useEffect, useState } from "react";
import ManageSubscriptionButton from "./ManageSubscriptionButton";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface RealtimeSubscriptionProps {
  profileData: Profile
}

type Profile = {
  id: string,
  created_at: string,
  is_subscribed: boolean,
  interval: string,
  stripe_customer: string,
  email: string
}

export default function RealtimeSubscription({ profileData }: RealtimeSubscriptionProps) {
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<Profile>(profileData);

  useEffect(() => {
    setProfile(profileData)
  }, [profileData])

  useEffect(() => {
    if (profile) {
      const subscription = supabase
        .channel(`profile:id=eq.${profile.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profile' }, (payload: any) => {
          setProfile({ ...profile, ...payload.new });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription)
      }

    }
  }, [profile])

  return (
    <div className='text-white w-fullmax  max-w-3xl mx-auto py-16 px-8'>
      <h1 className='text-3xl mb-6'>Dashboard</h1>
      <p className='text-white mb-6'>
        {
          profile?.is_subscribed
            ? `Subscribed: ${profile.is_subscribed}`
            : "Not subscribed"
        }
      </p>
      <ManageSubscriptionButton />
    </div>
  )
}