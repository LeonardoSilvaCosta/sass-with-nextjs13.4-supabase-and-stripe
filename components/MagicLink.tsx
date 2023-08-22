"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type MagicLinkProps = {
  email: string;
}

export default function MagicLink({ email }: MagicLinkProps ) {
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
      },
    })

    // alert("Verifique o seu email " + email + " " + JSON.stringify(data, null,))
    // alert("Houston, temos um erro " + error)
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