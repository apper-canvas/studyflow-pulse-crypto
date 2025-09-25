import React, { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import CourseGrid from "@/components/organisms/CourseGrid"
import CourseModal from "@/components/organisms/CourseModal"

const Courses = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  const handleAddCourse = () => {
    setEditingCourse(null)
    setShowModal(true)
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCourse(null)
  }

  const handleSaveCourse = () => {
    setShowModal(false)
    setEditingCourse(null)
    toast.success(editingCourse ? "Course updated successfully!" : "Course added successfully!")
  }

  const handleDeleteCourse = () => {
    toast.success("Course deleted successfully!")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Courses</h1>
          <p className="text-gray-600">Manage your enrolled courses and track progress.</p>
        </div>
        <Button onClick={handleAddCourse} icon="Plus">
          Add Course
        </Button>
      </div>

      <CourseGrid 
        onEditCourse={handleEditCourse} 
        onDeleteCourse={handleDeleteCourse}
      />

      {showModal && (
        <CourseModal
          course={editingCourse}
          onClose={handleCloseModal}
          onSave={handleSaveCourse}
        />
      )}
    </motion.div>
  )
}

export default Courses