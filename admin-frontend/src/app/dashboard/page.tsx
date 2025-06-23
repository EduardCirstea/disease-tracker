'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecționare către pagina principală
    router.replace('/');
  }, [router]);

  // Returnăm o pagină de încărcare în timp ce așteptăm redirecționarea
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">Se redirecționează către Dashboard...</h1>
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );
}