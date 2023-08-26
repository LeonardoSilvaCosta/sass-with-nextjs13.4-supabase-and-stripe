"use client";
import { useRouter } from 'next/navigation'

export default function ManageSubscriptionButton() {
  const router = useRouter();
  
  const loadPortal = async () => {
    const res = await fetch("/api/portal");
    const { url } = await res.json();
    
    router.push(url);
  }

  return (
    <button onClick={() => loadPortal()}>Manage subscription</button>
  );
}