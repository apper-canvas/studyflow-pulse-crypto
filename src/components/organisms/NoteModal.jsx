import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Textarea from "@/components/atoms/Textarea"
import Select from "@/components/atoms/Select"
import FormField from "@/components/molecules/FormField"
import ApperIcon from "@/components/ApperIcon"
import noteService from "@/services/api/noteService"

const NoteModal = ({ note, courses, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    content: "",
    tags: ""
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || "",
        courseId: note.courseId?.toString() || "",
        content: note.content || "",
        tags: note.tags?.join(", ") || ""
      })
    }
  }, [note])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) newErrors.title = "Note title is required"
    if (!formData.content.trim()) newErrors.content = "Note content is required"
    if (!formData.courseId) newErrors.courseId = "Course selection is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSaving(true)
      
      const noteData = {
        title: formData.title.trim(),
        courseId: parseInt(formData.courseId),
        content: formData.content.trim(),
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0)
      }
      
      if (note) {
        await noteService.update(note.Id, noteData)
      } else {
        await noteService.create(noteData)
      }
      
      onSave()
    } catch (error) {
      setErrors({ submit: error.message || "Failed to save note" })
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
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {note ? "Edit Note" : "Create Note"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Note Title" required error={errors.title}>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., Calculus - Derivatives Notes"
                error={!!errors.title}
              />
            </FormField>

            <FormField label="Course" required error={errors.courseId}>
              <Select
                value={formData.courseId}
                onChange={(e) => handleChange("courseId", e.target.value)}
                error={!!errors.courseId}
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.Id} value={course.Id.toString()}>
                    {course.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Content" required error={errors.content}>
            <Textarea
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Write your notes here..."
              rows={12}
              error={!!errors.content}
              className="resize-vertical"
            />
          </FormField>

          <FormField 
            label="Tags" 
            error={errors.tags}
          >
            <Input
              value={formData.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="e.g., derivatives, chain-rule, calculus (comma separated)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </FormField>

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
              {note ? "Update Note" : "Create Note"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default NoteModal