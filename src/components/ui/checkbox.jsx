import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onChange, disabled, id, ...props }, ref) => {
  return (
    <div className="inline-flex items-center">
      <input
        type="checkbox"
        id={id}
        ref={ref}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />
      <label
        htmlFor={id}
        className={cn(
          "h-4 w-4 shrink-0 rounded-sm border border-gray-300 bg-white flex items-center justify-center cursor-pointer transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          className
        )}
      >
        {checked && <Check className="h-3 w-3 text-white stroke-[3]" />}
      </label>
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
