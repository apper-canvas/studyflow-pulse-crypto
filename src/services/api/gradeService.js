import gradeData from "@/services/mockData/grades.json"

let grades = [...gradeData]

const gradeService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...grades]
  },

  async getByCourse(courseId) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return grades.filter(grade => grade.courseId === parseInt(courseId))
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return grades.find(grade => grade.Id === parseInt(id))
  },

  async create(grade) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newGrade = {
      ...grade,
      Id: Math.max(...grades.map(g => g.Id), 0) + 1
    }
    grades.push(newGrade)
    return newGrade
  },

  async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = grades.findIndex(grade => grade.Id === parseInt(id))
    if (index !== -1) {
      grades[index] = { ...grades[index], ...data }
      return grades[index]
    }
    throw new Error("Grade not found")
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = grades.findIndex(grade => grade.Id === parseInt(id))
    if (index !== -1) {
      const deleted = grades.splice(index, 1)[0]
      return deleted
    }
    throw new Error("Grade not found")
  }
}

export default gradeService