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

  // Show loading state if clerk is not loaded yet
  if (!isClient || !isLoaded) {
    return (
      <Button variant="ghost" size="sm" disabled className="opacity-70">
        Loading...
      </Button>
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