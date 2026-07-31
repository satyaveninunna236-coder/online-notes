import * as React from "react"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-blue-500/20 dark:ring-blue-400/20 shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef(({ className, src, alt = "Avatar", ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);
  
  if (hasError || !src) return null;

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-white text-xs select-none",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
