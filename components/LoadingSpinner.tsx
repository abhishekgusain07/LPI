import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({ size = "md" }: LoadingSpinnerProps) => {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }[size];
  
  return <Loader2 className={`${sizeClass} animate-spin text-primary`} />;
}; 