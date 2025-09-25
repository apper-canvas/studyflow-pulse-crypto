import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import StatusBadge from "@/components/molecules/StatusBadge"
import ApperIcon from "@/components/ApperIcon"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay,
  addMonths,
  subMonths
} from "date-fns"
import assignmentService from "@/services/api/assignmentService"
import courseService from "@/services/api/courseService"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [assignments, setAssignments] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
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
      setError(err.message || "Failed to load calendar data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getAssignmentsForDate = (date) => {
    return assignments.filter(assignment => 
      isSameDay(new Date(assignment.dueDate), date)
    )
  }

  const getSelectedDateAssignments = () => {
    return getAssignmentsForDate(selectedDate).map(assignment => ({
      ...assignment,
      course: courses.find(c => c.Id === assignment.courseId)
    }))
  }

  const navigateMonth = (direction) => {
    setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Calendar</h1>
        <p className="text-gray-600">View and manage your assignment deadlines and class schedule.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="Calendar" className="w-5 h-5 text-primary-600" />
                {format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                  <ApperIcon name="ChevronLeft" className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                  <ApperIcon name="ChevronRight" className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const dayAssignments = getAssignmentsForDate(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isTodayDate = isToday(day)
                const isSelected = isSameDay(day, selectedDate)
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-2 border border-gray-100 cursor-pointer transition-colors hover:bg-gray-50
                      ${!isCurrentMonth ? "text-gray-400 bg-gray-50" : ""}
                      ${isTodayDate ? "bg-primary-50 border-primary-200" : ""}
                      ${isSelected ? "bg-primary-100 border-primary-300" : ""}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium mb-1 ${isTodayDate ? "text-primary-600" : ""}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayAssignments.slice(0, 2).map(assignment => {
                        const course = courses.find(c => c.Id === assignment.courseId)
                        return (
                          <div
                            key={assignment.Id}
                            className="text-xs p-1 rounded"
                            style={{ 
                              backgroundColor: `${course?.color}20`,
                              borderLeft: `3px solid ${course?.color || "#6366f1"}`
                            }}
                          >
                            <div className="truncate font-medium">{assignment.title}</div>
                          </div>
                        )
                      })}
                      {dayAssignments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayAssignments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Clock" className="w-5 h-5 text-primary-600" />
              {format(selectedDate, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getSelectedDateAssignments().length === 0 ? (
              <div className="text-center py-6">
                <ApperIcon name="Calendar" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No assignments due</p>
                <p className="text-sm text-gray-400 mt-1">Select another date to view assignments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getSelectedDateAssignments().map(assignment => (
                  <div
                    key={assignment.Id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                      <StatusBadge status={assignment.status} showIcon={false} />
                    </div>
                    {assignment.course && (
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: assignment.course.color }}
                        />
                        <span className="text-sm text-gray-600">{assignment.course.name}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Due: {format(new Date(assignment.dueDate), "h:mm a")}
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mt-2">{assignment.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

export default Calendar