import React, { forwardRef } from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "md", 
  children, 
  icon,
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "gradient-primary text-white shadow-md hover:shadow-lg hover:scale-105",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm hover:shadow-md hover:scale-105",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md hover:scale-105",
    ghost: "hover:bg-gray-100 text-gray-700 hover:scale-105",
    destructive: "bg-error-500 text-white shadow-md hover:bg-error-600 hover:shadow-lg hover:scale-105"
  }
  
  const sizes = {
    sm: "h-8 px-3 text-sm gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2",
    icon: "h-10 w-10"
  }
  
  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ApperIcon name="Loader2" className="animate-spin" size={16} />}
      {!loading && icon && <ApperIcon name={icon} size={16} />}
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button