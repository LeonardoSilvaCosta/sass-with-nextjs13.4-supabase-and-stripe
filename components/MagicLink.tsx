"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type MagicLinkProps = {
  email: string;
}

export default function MagicLink({ email }: MagicLinkProps) {
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_CALLBACK_URL,
      },
    })

  }


  return (
    <button type="button"
      className=""
      onClick={handleSignIn}
    >
      Sign in with Magic Link
    </button>
  );
}