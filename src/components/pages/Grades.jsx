import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Select from "@/components/atoms/Select"
import ApperIcon from "@/components/ApperIcon"
import courseService from "@/services/api/courseService"
import gradeService from "@/services/api/gradeService"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"

const Grades = () => {
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setError("")
      setLoading(true)
      
      const [coursesData, gradesData] = await Promise.all([
        courseService.getAll(),
        gradeService.getAll()
      ])

      setCourses(coursesData)
      setGrades(gradesData)
    } catch (err) {
      setError(err.message || "Failed to load grades")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const calculateCourseGrade = (courseId) => {
    const courseGrades = grades.filter(g => g.courseId === parseInt(courseId))
    if (courseGrades.length === 0) return null

    let weightedScore = 0
    let totalWeight = 0

    courseGrades.forEach(grade => {
      const percentage = (grade.points / grade.maxPoints) * 100
      weightedScore += percentage * grade.weight
      totalWeight += grade.weight
    })

    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : null
  }

  const calculateOverallGPA = () => {
    let totalPoints = 0
    let totalCredits = 0

    courses.forEach(course => {
      const finalGrade = calculateCourseGrade(course.Id)
      if (finalGrade !== null) {
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
    })

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A"
  }

  const getLetterGrade = (percentage) => {
    if (percentage >= 97) return "A+"
    if (percentage >= 93) return "A"
    if (percentage >= 90) return "A-"
    if (percentage >= 87) return "B+"
    if (percentage >= 83) return "B"
    if (percentage >= 80) return "B-"
    if (percentage >= 77) return "C+"
    if (percentage >= 73) return "C"
    if (percentage >= 70) return "C-"
    if (percentage >= 67) return "D+"
    if (percentage >= 65) return "D"
    return "F"
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-success-600"
    if (percentage >= 80) return "text-accent-600"
    if (percentage >= 70) return "text-warning-600"
    return "text-error-600"
  }

  const filteredCourses = selectedCourse === "all" ? courses : courses.filter(c => c.Id === parseInt(selectedCourse))

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Grades</h1>
          <p className="text-gray-600">Track your academic performance across all courses.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall GPA</div>
            <div className="text-2xl font-bold text-gradient">{calculateOverallGPA()}</div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ApperIcon name="Award" className="w-5 h-5 text-primary-600" />
              Course Grades
            </CardTitle>
            <Select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-48"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.Id} value={course.Id.toString()}>
                  {course.name}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <Empty message="No courses found" action="Add courses to track your grades" />
          ) : (
            <div className="space-y-6">
              {filteredCourses.map(course => {
                const courseGrades = grades.filter(g => g.courseId === course.Id)
                const finalGrade = calculateCourseGrade(course.Id)
                
                return (
                  <div key={course.Id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: course.color }}
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                        <span className="text-sm text-gray-500">({course.credits} credits)</span>
                      </div>
                      {finalGrade !== null && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getGradeColor(finalGrade)}`}>
                            {finalGrade}%
                          </div>
                          <div className={`text-lg font-medium ${getGradeColor(finalGrade)}`}>
                            {getLetterGrade(finalGrade)}
                          </div>
                        </div>
                      )}
                    </div>

                    {courseGrades.length === 0 ? (
                      <div className="text-center py-8">
                        <ApperIcon name="FileX" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No grades recorded for this course</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 text-sm font-semibold text-gray-700">Category</th>
                              <th className="text-center py-2 text-sm font-semibold text-gray-700">Points</th>
                              <th className="text-center py-2 text-sm font-semibold text-gray-700">Weight</th>
                              <th className="text-center py-2 text-sm font-semibold text-gray-700">Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courseGrades.map(grade => {
                              const percentage = Math.round((grade.points / grade.maxPoints) * 100)
                              return (
                                <tr key={grade.Id} className="border-b border-gray-100">
                                  <td className="py-2 text-sm">{grade.category}</td>
                                  <td className="py-2 text-sm text-center">
                                    {grade.points}/{grade.maxPoints}
                                  </td>
                                  <td className="py-2 text-sm text-center">
                                    {Math.round(grade.weight * 100)}%
                                  </td>
                                  <td className="py-2 text-sm text-center">
                                    <span className={`font-medium ${getGradeColor(percentage)}`}>
                                      {percentage}%
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Grades