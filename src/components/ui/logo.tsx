
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("rounded-md bg-gradient-to-br from-mindpop-300 to-mindpop-400 text-white flex items-center justify-center font-bold", sizes[size])}>
        <span>MP</span>
      </div>
      {showText && (
        <span className={cn("ml-2 font-bold text-mindpop-500 dark:text-mindpop-300", textSizes[size])}>
          MindPop
        </span>
      )}
    </div>
  );
}
