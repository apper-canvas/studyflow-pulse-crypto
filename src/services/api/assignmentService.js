import assignmentData from "@/services/mockData/assignments.json"

let assignments = [...assignmentData]

const assignmentService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 350))
    return [...assignments]
  },

  async getByCourse(courseId) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return assignments.filter(assignment => assignment.courseId === parseInt(courseId))
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return assignments.find(assignment => assignment.Id === parseInt(id))
  },

  async create(assignment) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newAssignment = {
      ...assignment,
      Id: Math.max(...assignments.map(a => a.Id), 0) + 1
    }
    assignments.push(newAssignment)
    return newAssignment
  },

  async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = assignments.findIndex(assignment => assignment.Id === parseInt(id))
    if (index !== -1) {
      assignments[index] = { ...assignments[index], ...data }
      return assignments[index]
    }
    throw new Error("Assignment not found")
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = assignments.findIndex(assignment => assignment.Id === parseInt(id))
    if (index !== -1) {
      const deleted = assignments.splice(index, 1)[0]
      return deleted
    }
    throw new Error("Assignment not found")
  }
}

export default assignmentService