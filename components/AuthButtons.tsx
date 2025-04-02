"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthButtons() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated on client-side only
    const checkAuth = async () => {
      try {
        // This is safe because useEffect only runs in the browser
        const { useAuth } = await import('@clerk/nextjs');
        const auth = useAuth();
        setIsAuthenticated(!!auth.isSignedIn);
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isAuthenticated) {
    return <UserButton afterSignOutUrl="/" />;
  }
  
  return (
    <Button asChild>
      <Link href="/sign-in">Sign In</Link>
    </Button>
  );
} 