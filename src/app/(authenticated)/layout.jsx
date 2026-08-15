"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function AuthenticatedLayout({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base text-text-main">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute rounded-full h-10 w-10 bg-bg-panel border border-border-strong flex items-center justify-center text-[10px] text-blue-600 dark:text-blue-400 font-bold">
            SEC
          </div>
        </div>
        <p className="mt-4 text-xs text-text-muted font-medium tracking-wider uppercase animate-pulse">
          Wait while we do something...
        </p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
