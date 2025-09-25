import React, { useState } from "react"
import { cn } from "@/utils/cn"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className,
  value = "",
  onChange,
  ...props 
}) => {
  const [searchValue, setSearchValue] = useState(value)

  const handleChange = (e) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchValue)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)} {...props}>
      <div className="relative">
        <ApperIcon 
          name="Search" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" 
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleChange}
          className="pl-10 pr-4"
        />
      </div>
    </form>
  )
}

export default SearchBar