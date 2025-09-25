import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import ApperIcon from "@/components/ApperIcon"
import courseService from "@/services/api/courseService"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"

const WeeklySchedule = () => {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadSchedule = async () => {
    try {
      setError("")
      setLoading(true)
      
      const courses = await courseService.getAll()
      
      const scheduleItems = []
      courses.forEach(course => {
        if (course.schedule && course.schedule.days) {
          course.schedule.days.forEach(day => {
            scheduleItems.push({
              id: `${course.Id}-${day}`,
              courseId: course.Id,
              courseName: course.name,
              instructor: course.instructor,
              day,
              time: course.schedule.time,
              location: course.schedule.location,
              color: course.color
            })
          })
        }
      })

      // Sort by day and time
      const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      scheduleItems.sort((a, b) => {
        const dayComparison = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
        if (dayComparison !== 0) return dayComparison
        return a.time.localeCompare(b.time)
      })

      setSchedule(scheduleItems)
    } catch (err) {
      setError(err.message || "Failed to load weekly schedule")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadSchedule} />

  const groupedSchedule = schedule.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = []
    }
    acc[item.day].push(item)
    return acc
  }, {})

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ApperIcon name="Calendar" className="w-5 h-5 text-primary-600" />
          Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedSchedule).length === 0 ? (
          <div className="text-center py-6">
            <ApperIcon name="Calendar" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No classes scheduled</p>
            <p className="text-sm text-gray-400 mt-1">Add courses to see your schedule</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSchedule).map(([day, items]) => (
              <div key={day} className="border-b border-gray-100 pb-4 last:border-b-0">
                <h4 className="font-semibold text-gray-900 mb-3">{day}</h4>
                <div className="space-y-2">
                  {items.map((item) => (
<div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 min-w-0">
<div className="font-medium text-gray-900 truncate">
                          {item.courseName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.instructor}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-medium text-gray-700">
                          {item.time}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WeeklySchedule