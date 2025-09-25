import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import StatusBadge from "@/components/molecules/StatusBadge"
import SearchBar from "@/components/molecules/SearchBar"
import Select from "@/components/atoms/Select"
import ApperIcon from "@/components/ApperIcon"
import { format, isPast, isToday } from "date-fns"
import assignmentService from "@/services/api/assignmentService"
import courseService from "@/services/api/courseService"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"

const AssignmentTable = ({ onEditAssignment, onDeleteAssignment }) => {
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setError("")
      setLoading(true)
      
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentService.getAll(),
        courseService.getAll()
      ])

      setAssignments(assignmentsData)
      setCourses(coursesData)
    } catch (err) {
      setError(err.message || "Failed to load assignments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = assignments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(assignment => assignment.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(assignment => assignment.priority === priorityFilter)
    }

    // Sort by due date
    filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    setFilteredAssignments(filtered)
  }, [assignments, searchTerm, statusFilter, priorityFilter])

  const handleStatusUpdate = async (assignmentId, newStatus) => {
    try {
      await assignmentService.update(assignmentId, { status: newStatus })
      await loadData()
    } catch (err) {
      setError(err.message || "Failed to update assignment status")
    }
  }

  const handleDelete = async (assignmentId) => {
    try {
      await assignmentService.delete(assignmentId)
      await loadData()
      if (onDeleteAssignment) {
        onDeleteAssignment(assignmentId)
      }
    } catch (err) {
      setError(err.message || "Failed to delete assignment")
    }
  }

  const getAssignmentStatus = (assignment) => {
    const dueDate = new Date(assignment.dueDate)
    if (assignment.status === "completed") return "completed"
    if (isPast(dueDate) && !isToday(dueDate)) return "overdue"
    return assignment.status
  }

  const getCourseById = (courseId) => {
    return courses.find(course => course.Id === courseId)
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ApperIcon name="FileText" className="w-5 h-5 text-primary-600" />
          Assignments
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <SearchBar 
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex gap-2">
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </Select>
            <Select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAssignments.length === 0 ? (
          <Empty 
            message={assignments.length === 0 ? "No assignments found" : "No assignments match your filters"}
            action={assignments.length === 0 ? "Add your first assignment to get started" : "Try adjusting your search or filters"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Assignment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment) => {
                  const course = getCourseById(assignment.courseId)
                  const status = getAssignmentStatus(assignment)
                  const dueDate = new Date(assignment.dueDate)
                  
                  return (
                    <tr key={assignment.Id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{assignment.title}</div>
                          {assignment.description && (
                            <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                              {assignment.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {course && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: course.color }}
                            />
                            <span className="text-sm font-medium">{course.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className={`text-sm ${status === "overdue" ? "text-error-600 font-medium" : "text-gray-600"}`}>
                          {format(dueDate, "MMM dd, yyyy")}
                          <div className="text-xs text-gray-500">
                            {format(dueDate, "h:mm a")}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={assignment.priority} showIcon={false} />
                      </td>
                      <td className="py-3 px-4">
                        <Select
                          value={assignment.status}
                          onChange={(e) => handleStatusUpdate(assignment.Id, e.target.value)}
                          className="text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${assignment.grade ? "text-gray-900" : "text-gray-400"}`}>
                          {assignment.grade ? `${assignment.grade}%` : "Not graded"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditAssignment && onEditAssignment(assignment)}
                            className="h-8 w-8"
                          >
                            <ApperIcon name="Edit" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(assignment.Id)}
                            className="h-8 w-8 text-error-600 hover:text-error-700 hover:bg-error-50"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AssignmentTable