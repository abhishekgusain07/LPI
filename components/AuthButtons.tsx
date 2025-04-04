"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthButtons() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show skeleton loading state while clerk is initializing
  if (!isClient || !isLoaded) {
    return (
      <div className="h-9 w-20 rounded-md bg-muted/30 animate-pulse flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-muted/50 mr-2"></div>
        <div className="h-3 w-10 rounded-sm bg-muted/50"></div>
      </div>
    );
  }
  
  // User is signed in - show user button
  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
  }
  
  // User is not signed in - show sign in button
  return (
    <Button asChild>
      <Link href="/sign-in">Sign In</Link>
    </Button>
  );
} 