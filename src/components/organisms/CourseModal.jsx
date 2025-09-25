import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Label from "@/components/atoms/Label"
import FormField from "@/components/molecules/FormField"
import ApperIcon from "@/components/ApperIcon"
import courseService from "@/services/api/courseService"

const CourseModal = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    instructor: "",
    credits: "",
    semester: "Fall 2024",
    color: "#3b82f6",
    schedule: {
      days: [],
      time: "",
      location: ""
    }
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", 
    "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1"
  ]

  useEffect(() => {
if (course) {
      setFormData({
        name: course.name || "",
        instructor: course.instructor || "",
        credits: course.credits?.toString() || "",
        semester: course.semester || "Fall 2024",
        color: course.color || "#3b82f6",
        schedule: {
          days: course.schedule?.days || [],
          time: course.schedule?.time || "",
          location: course.schedule?.location || ""
        }
      })
    }
  }, [course])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleScheduleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value
      }
    }))
  }

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = "Course name is required"
    if (!formData.instructor.trim()) newErrors.instructor = "Instructor name is required"
    if (!formData.credits || isNaN(formData.credits) || parseInt(formData.credits) <= 0) {
      newErrors.credits = "Valid credits number is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSaving(true)
      
const courseData = {
        ...formData,
        credits: parseInt(formData.credits)
      }
      
      if (course) {
        await courseService.update(course.Id, courseData)
      } else {
        await courseService.create(courseData)
      }
      
      onSave()
    } catch (error) {
      setErrors({ submit: error.message || "Failed to save course" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {course ? "Edit Course" : "Add Course"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Course Name" required error={errors.name}>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Calculus I"
                error={!!errors.name}
              />
            </FormField>

            <FormField label="Instructor" required error={errors.instructor}>
              <Input
                value={formData.instructor}
                onChange={(e) => handleChange("instructor", e.target.value)}
                placeholder="e.g., Dr. Smith"
                error={!!errors.instructor}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Credits" required error={errors.credits}>
              <Input
                type="number"
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => handleChange("credits", e.target.value)}
                placeholder="3"
                error={!!errors.credits}
              />
            </FormField>

            <FormField label="Semester">
              <select
                value={formData.semester}
                onChange={(e) => handleChange("semester", e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Fall 2024">Fall 2024</option>
                <option value="Spring 2025">Spring 2025</option>
                <option value="Summer 2025">Summer 2025</option>
              </select>
            </FormField>
          </div>

          <FormField label="Course Color">
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange("color", color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? "border-gray-900" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </FormField>

          <div className="space-y-4">
            <Label className="text-base font-medium">Schedule (Optional)</Label>
            
            <FormField label="Class Days">
              <div className="flex flex-wrap gap-2">
                {days.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      formData.schedule.days.includes(day)
                        ? "bg-primary-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Time">
                <Input
                  value={formData.schedule.time}
                  onChange={(e) => handleScheduleChange("time", e.target.value)}
                  placeholder="e.g., 10:00-11:30"
                />
              </FormField>

              <FormField label="Location">
                <Input
                  value={formData.schedule.location}
                  onChange={(e) => handleScheduleChange("location", e.target.value)}
                  placeholder="e.g., Room 101"
                />
              </FormField>
            </div>
          </div>

          {errors.submit && (
            <div className="text-error-600 text-sm">{errors.submit}</div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              className="flex-1"
            >
              {course ? "Update Course" : "Add Course"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default CourseModal