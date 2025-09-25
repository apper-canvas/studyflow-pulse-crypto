import React, { useState } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import AssignmentTable from "@/components/organisms/AssignmentTable"
import AssignmentModal from "@/components/organisms/AssignmentModal"

const Assignments = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)

  const handleAddAssignment = () => {
    setEditingAssignment(null)
    setShowModal(true)
  }

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAssignment(null)
  }

  const handleSaveAssignment = () => {
    setShowModal(false)
    setEditingAssignment(null)
    toast.success(editingAssignment ? "Assignment updated successfully!" : "Assignment added successfully!")
  }

  const handleDeleteAssignment = () => {
    toast.success("Assignment deleted successfully!")
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
          <h1 className="text-3xl font-bold text-gradient mb-2">Assignments</h1>
          <p className="text-gray-600">Track and manage all your coursework and deadlines.</p>
        </div>
        <Button onClick={handleAddAssignment} icon="Plus">
          Add Assignment
        </Button>
      </div>

      <AssignmentTable 
        onEditAssignment={handleEditAssignment} 
        onDeleteAssignment={handleDeleteAssignment}
      />

      {showModal && (
        <AssignmentModal
          assignment={editingAssignment}
          onClose={handleCloseModal}
          onSave={handleSaveAssignment}
        />
      )}
    </motion.div>
  )
}

export default Assignments