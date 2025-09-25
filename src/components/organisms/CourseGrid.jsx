import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import courseService from "@/services/api/courseService"
import assignmentService from "@/services/api/assignmentService"
import gradeService from "@/services/api/gradeService"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"

const CourseGrid = ({ onEditCourse, onDeleteCourse }) => {
  const [courses, setCourses] = useState([])
  const [courseStats, setCourseStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadCourses = async () => {
    try {
      setError("")
      setLoading(true)
      
      const [coursesData, assignments, grades] = await Promise.all([
        courseService.getAll(),
        assignmentService.getAll(),
        gradeService.getAll()
      ])

      // Calculate stats for each course
      const stats = {}
      coursesData.forEach(course => {
        const courseAssignments = assignments.filter(a => a.courseId === course.Id)
        const courseGrades = grades.filter(g => g.courseId === course.Id)
        
        const pendingAssignments = courseAssignments.filter(a => a.status === "pending").length
        const completedAssignments = courseAssignments.filter(a => a.status === "completed").length
        
        // Calculate weighted grade
        let weightedScore = 0
        let totalWeight = 0
        courseGrades.forEach(grade => {
          const percentage = (grade.points / grade.maxPoints) * 100
          weightedScore += percentage * grade.weight
          totalWeight += grade.weight
        })
        
        const currentGrade = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : null

        stats[course.Id] = {
          pendingAssignments,
          completedAssignments,
          totalAssignments: courseAssignments.length,
          currentGrade
        }
      })

      setCourses(coursesData)
      setCourseStats(stats)
    } catch (err) {
      setError(err.message || "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleDelete = async (courseId) => {
    try {
      await courseService.delete(courseId)
      await loadCourses()
      if (onDeleteCourse) {
        onDeleteCourse(courseId)
      }
    } catch (err) {
      setError(err.message || "Failed to delete course")
    }
  }

  const getGradeColor = (grade) => {
    if (!grade) return "text-gray-400"
    if (grade >= 90) return "text-success-600"
    if (grade >= 80) return "text-accent-600" 
    if (grade >= 70) return "text-warning-600"
    return "text-error-600"
  }

  const getGradeLetter = (grade) => {
    if (!grade) return "N/A"
    if (grade >= 90) return "A"
    if (grade >= 80) return "B"
    if (grade >= 70) return "C"
    if (grade >= 60) return "D"
    return "F"
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadCourses} />
  if (courses.length === 0) return <Empty message="No courses found" action="Add your first course to get started" />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => {
        const stats = courseStats[course.Id] || {}
        return (
          <Card key={course.Id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: course.color }}
                    />
                    <span className="truncate">{course.name}</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600">{course.instructor}</p>
                  <p className="text-xs text-gray-500 mt-1">{course.credits} Credits</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditCourse && onEditCourse(course)}
                    className="h-8 w-8"
                  >
                    <ApperIcon name="Edit" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(course.Id)}
                    className="h-8 w-8 text-error-600 hover:text-error-700 hover:bg-error-50"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Grade</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getGradeColor(stats.currentGrade)}`}>
                      {stats.currentGrade || "N/A"}%
                    </span>
                    <Badge variant={stats.currentGrade >= 80 ? "success" : stats.currentGrade >= 70 ? "warning" : "error"}>
                      {getGradeLetter(stats.currentGrade)}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Assignments</span>
                  <div className="flex gap-2">
                    {stats.pendingAssignments > 0 && (
                      <Badge variant="warning">
                        {stats.pendingAssignments} pending
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {stats.completedAssignments}/{stats.totalAssignments}
                    </Badge>
                  </div>
                </div>

                {course.schedule && (
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <ApperIcon name="Clock" className="w-3 h-3" />
                      {course.schedule.days?.join(", ")} at {course.schedule.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <ApperIcon name="MapPin" className="w-3 h-3" />
                      {course.schedule.location}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default CourseGrid