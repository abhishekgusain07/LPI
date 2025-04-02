import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  imageUrl: string | null;
  fallbackName: string;
  size?: "sm" | "md" | "lg";
}

const UserAvatar = ({ imageUrl, fallbackName, size = "md" }: UserAvatarProps) => {
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }[size];
  
  // Get initials for fallback
  const initials = fallbackName
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <Avatar className={sizeClass}>
      {imageUrl && <AvatarImage src={imageUrl} alt={fallbackName} />}
      <AvatarFallback className="bg-muted">
        {initials || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar; 