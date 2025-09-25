import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import assignmentService from "@/services/api/assignmentService";
import courseService from "@/services/api/courseService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";

const AssignmentModal = ({ assignment, onClose, onSave }) => {
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    dueDate: "",
    dueTime: "",
    priority: "medium",
    status: "pending",
    description: ""
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
if (assignment) {
      const dueDate = new Date(assignment.dueDate)
      setFormData({
        title: assignment.title || "",
        courseId: assignment.courseId?.toString() || "",
        dueDate: format(dueDate, "yyyy-MM-dd"),
        dueTime: format(dueDate, "HH:mm"),
        priority: assignment.priority || "medium",
        status: assignment.status || "pending",
        description: assignment.description || ""
      })
    }
  }, [assignment])

  const loadCourses = async () => {
    try {
      const coursesData = await courseService.getAll()
      setCourses(coursesData)
    } catch (error) {
      setErrors({ courses: "Failed to load courses" })
    } finally {
      setLoadingCourses(false)
    }
  }

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
    
    if (!formData.title.trim()) newErrors.title = "Assignment title is required"
    if (!formData.courseId) newErrors.courseId = "Course selection is required"
    if (!formData.dueDate) newErrors.dueDate = "Due date is required"
    if (!formData.dueTime) newErrors.dueTime = "Due time is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
if (!validateForm()) return
    
    try {
      setSaving(true)
      
      // Combine date and time
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}:00`)
      
      const assignmentData = {
        title: formData.title,
        courseId: parseInt(formData.courseId),
        dueDate: dueDateTime.toISOString(),
        priority: formData.priority,
        status: formData.status,
        description: formData.description
      }
      
      let result;
      if (assignment) {
        result = await assignmentService.update(assignment.Id, assignmentData)
      } else {
        result = await assignmentService.create(assignmentData)
      }

      toast.success(`Assignment ${assignment ? "updated" : "created"} successfully!`)
      
      // Check if assignment priority is High and send email notification
      if (assignmentData.priority === 'high') {
        try {
const { ApperClient } = window.ApperSDK;
          const apperClient = new ApperClient({
            apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
            apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
          });
          
          await apperClient.functions.invoke(import.meta.env.VITE_SEND_HIGH_PRIORITY_ASSIGNMENT_EMAIL, {
            body: {
              studentEmail: assignmentData.studentEmail || 'student@example.com',
              assignmentTitle: assignmentData.title || 'New Assignment',
              dueDate: assignmentData.dueDate || new Date().toISOString(),
              courseName: assignmentData.courseName || 'Not specified',
              priority: assignmentData.priority
            },
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          toast.success('High priority assignment email notification sent!');
        } catch (emailError) {
          console.error('Failed to send high priority email:', emailError);
          toast.warn('Assignment saved but email notification failed');
        }
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Failed to save assignment:', error);
      setErrors({ submit: 'Failed to save assignment. Please try again.' });
      toast.error('Failed to save assignment');
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
              {assignment ? "Edit Assignment" : "Add Assignment"}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <FormField label="Assignment Title" required error={errors.title}>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Math Homework Chapter 5"
              error={!!errors.title}
            />
          </FormField>

          <FormField label="Course" required error={errors.courseId || errors.courses}>
            <Select
              value={formData.courseId}
              onChange={(e) => handleChange("courseId", e.target.value)}
              error={!!errors.courseId}
              disabled={loadingCourses}
            >
              <option value="">Select a course</option>
{courses.map(course => (
                <option key={course.Id} value={course.Id.toString()}>
                  {course.name}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Due Date" required error={errors.dueDate}>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                error={!!errors.dueDate}
              />
            </FormField>

            <FormField label="Due Time" required error={errors.dueTime}>
              <Input
                type="time"
                value={formData.dueTime}
                onChange={(e) => handleChange("dueTime", e.target.value)}
                error={!!errors.dueTime}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Priority">
              <Select
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormField>

            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Add any additional details about this assignment..."
              rows={4}
            />
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
              {assignment ? "Update Assignment" : "Add Assignment"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AssignmentModal