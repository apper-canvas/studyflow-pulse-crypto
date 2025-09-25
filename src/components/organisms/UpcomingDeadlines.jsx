import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import StatusBadge from "@/components/molecules/StatusBadge"
import ApperIcon from "@/components/ApperIcon"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import assignmentService from "@/services/api/assignmentService"
import courseService from "@/services/api/courseService"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"

const UpcomingDeadlines = () => {
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDeadlines = async () => {
    try {
      setError("")
      setLoading(true)
      
      const [assignments, courses] = await Promise.all([
        assignmentService.getAll(),
        courseService.getAll()
      ])

      const upcomingAssignments = assignments
        .filter(assignment => assignment.status !== "completed")
        .map(assignment => {
          const course = courses.find(c => c.Id === assignment.courseId)
          const dueDate = new Date(assignment.dueDate)
          const isOverdue = isPast(dueDate) && !isToday(dueDate)
          
          return {
            ...assignment,
            course,
            dueDate,
            isOverdue,
            urgency: isOverdue ? 3 : isToday(dueDate) ? 2 : isTomorrow(dueDate) ? 1 : 0
          }
        })
        .sort((a, b) => {
          if (a.urgency !== b.urgency) return b.urgency - a.urgency
          return a.dueDate - b.dueDate
        })
        .slice(0, 5)

      setDeadlines(upcomingAssignments)
    } catch (err) {
      setError(err.message || "Failed to load upcoming deadlines")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeadlines()
  }, [])

  const formatDueDate = (date) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM dd")
  }

  const getUrgencyColor = (assignment) => {
    if (assignment.isOverdue) return "text-error-600"
    if (isToday(assignment.dueDate)) return "text-warning-600"
    if (isTomorrow(assignment.dueDate)) return "text-accent-600"
    return "text-gray-600"
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadDeadlines} />

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ApperIcon name="Clock" className="w-5 h-5 text-primary-600" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <div className="text-center py-6">
            <ApperIcon name="CheckCircle" className="w-12 h-12 text-success-500 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming deadlines</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.map((assignment) => (
              <div
                key={assignment.Id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {assignment.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: assignment.course?.color || "#6366f1" }}
                    />
                    {assignment.course?.name}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getUrgencyColor(assignment)}`}>
                      {formatDueDate(assignment.dueDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(assignment.dueDate, "h:mm a")}
                    </div>
                  </div>
                  <StatusBadge 
                    status={assignment.isOverdue ? "overdue" : assignment.priority} 
                    showIcon={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UpcomingDeadlines