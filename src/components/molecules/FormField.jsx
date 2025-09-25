import React from "react"
import { cn } from "@/utils/cn"
import Label from "@/components/atoms/Label"

const FormField = ({ 
  label, 
  error, 
  required = false, 
  children, 
  className,
  ...props 
}) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <Label className="block">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </Label>
      )}
      {children}
      {error && (
        <p className="text-sm text-error-500 mt-1">{error}</p>
      )}
    </div>
  )
}

export default FormField