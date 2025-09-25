import React from "react"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const StatusBadge = ({ 
  status, 
  showIcon = true, 
  className,
  ...props 
}) => {
  const statusConfig = {
    pending: {
      variant: "warning",
      icon: "Clock",
      label: "Pending"
    },
    "in-progress": {
      variant: "default",
      icon: "Play",
      label: "In Progress"
    },
    completed: {
      variant: "success",
      icon: "CheckCircle",
      label: "Completed"
    },
    overdue: {
      variant: "error",
      icon: "AlertCircle",
      label: "Overdue"
    },
    high: {
      variant: "error",
      icon: "AlertTriangle",
      label: "High"
    },
    medium: {
      variant: "warning",
      icon: "Minus",
      label: "Medium"
    },
    low: {
      variant: "secondary",
      icon: "Minus",
      label: "Low"
    }
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge 
      variant={config.variant} 
      className={cn("gap-1", className)}
      {...props}
    >
      {showIcon && <ApperIcon name={config.icon} className="w-3 h-3" />}
      {config.label}
    </Badge>
  )
}

export default StatusBadge