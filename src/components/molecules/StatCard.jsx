import React from "react"
import { Card, CardContent } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  color = "primary",
  className,
  ...props 
}) => {
  const colorClasses = {
    primary: "text-primary-600 bg-primary-50",
    success: "text-success-600 bg-success-50",
    warning: "text-warning-600 bg-warning-50",
    error: "text-error-600 bg-error-50",
    accent: "text-accent-600 bg-accent-50"
  }

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && trendValue && (
              <div className="flex items-center mt-2">
                <ApperIcon 
                  name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                  className={cn(
                    "w-4 h-4 mr-1",
                    trend === "up" ? "text-success-500" : "text-error-500"
                  )}
                />
                <span className={cn(
                  "text-sm font-medium",
                  trend === "up" ? "text-success-500" : "text-error-500"
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn("p-3 rounded-lg", colorClasses[color])}>
              <ApperIcon name={icon} className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard