import React from "react"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  message = "No data available", 
  action = "Get started by adding some data",
  icon = "Inbox",
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <ApperIcon name={icon} className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {message}
      </h3>
      <p className="text-gray-500 max-w-sm">
        {action}
      </p>
    </div>
  )
}

export default Empty