import React from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const NavigationItem = ({ 
  to, 
  icon, 
  children, 
  className,
  ...props 
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105",
          isActive
            ? "gradient-primary text-white shadow-md"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
          className
        )
      }
      {...props}
    >
      {icon && <ApperIcon name={icon} className="w-5 h-5 mr-3" />}
      {children}
    </NavLink>
  )
}

export default NavigationItem