import React, { useState, useEffect } from "react"
import StatCard from "@/components/molecules/StatCard"
import courseService from "@/services/api/courseService"
import assignmentService from "@/services/api/assignmentService"
import gradeService from "@/services/api/gradeService"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    pendingAssignments: 0,
    overallGPA: 0,
    completionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadStats = async () => {
    try {
      setError("")
      setLoading(true)
      
      const [courses, assignments, grades] = await Promise.all([
        courseService.getAll(),
        assignmentService.getAll(),
        gradeService.getAll()
      ])

      const pendingAssignments = assignments.filter(a => a.status === "pending").length
      const completedAssignments = assignments.filter(a => a.status === "completed").length
      const completionRate = assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0

      // Calculate GPA
      const courseGrades = {}
      grades.forEach(grade => {
        if (!courseGrades[grade.courseId]) {
          courseGrades[grade.courseId] = []
        }
        courseGrades[grade.courseId].push(grade)
      })

      let totalPoints = 0
      let totalCredits = 0

      Object.keys(courseGrades).forEach(courseId => {
        const course = courses.find(c => c.Id === parseInt(courseId))
        if (course) {
          const courseGradeList = courseGrades[courseId]
          let weightedScore = 0
          let totalWeight = 0

          courseGradeList.forEach(grade => {
            const percentage = (grade.points / grade.maxPoints) * 100
            weightedScore += percentage * grade.weight
            totalWeight += grade.weight
          })

          if (totalWeight > 0) {
            const finalGrade = weightedScore / totalWeight
            const gpaPoints = finalGrade >= 97 ? 4.0 :
                           finalGrade >= 93 ? 3.7 :
                           finalGrade >= 90 ? 3.3 :
                           finalGrade >= 87 ? 3.0 :
                           finalGrade >= 83 ? 2.7 :
                           finalGrade >= 80 ? 2.3 :
                           finalGrade >= 77 ? 2.0 :
                           finalGrade >= 73 ? 1.7 :
                           finalGrade >= 70 ? 1.3 :
                           finalGrade >= 67 ? 1.0 : 0.0

            totalPoints += gpaPoints * course.credits
            totalCredits += course.credits
          }
        }
      })

      const overallGPA = totalCredits > 0 ? totalPoints / totalCredits : 0

      setStats({
        totalCourses: courses.length,
        pendingAssignments,
        overallGPA: Math.round(overallGPA * 100) / 100,
        completionRate
      })
    } catch (err) {
      setError(err.message || "Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadStats} />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Courses"
        value={stats.totalCourses}
        icon="BookOpen"
        color="primary"
      />
      <StatCard
        title="Pending Assignments"
        value={stats.pendingAssignments}
        icon="Clock"
        color="warning"
      />
      <StatCard
        title="Overall GPA"
        value={stats.overallGPA.toFixed(2)}
        icon="Award"
        color="success"
        trend={stats.overallGPA >= 3.5 ? "up" : "down"}
        trendValue={stats.overallGPA >= 3.5 ? "Excellent" : "Needs improvement"}
      />
      <StatCard
        title="Completion Rate"
        value={`${stats.completionRate}%`}
        icon="CheckCircle"
        color="accent"
        trend={stats.completionRate >= 80 ? "up" : "down"}
        trendValue={stats.completionRate >= 80 ? "On track" : "Behind schedule"}
      />
    </div>
  )
}

export default DashboardStats