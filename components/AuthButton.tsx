"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Provider } from "@supabase/supabase-js";

type AuthButtonProps = {
  provider: Provider;
}

export default function AuthButton({ provider }: AuthButtonProps) {
  const supabase = createClientComponentClient();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
      },
    });

    if (error) {
      console.log(error)
    }
  };


  const providerCapitalized = provider.charAt(0).toUpperCase() + provider.slice(1);

  return (
    <button
      className="border border-gray-700 rounded px-4 py-2 mb-2"
      onClick={handleSignIn}
    >
      Sign in with {providerCapitalized}
    </button>
  );
}