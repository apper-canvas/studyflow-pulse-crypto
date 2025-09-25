import courseData from "@/services/mockData/courses.json"

let courses = [...courseData]

const courseService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...courses]
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return courses.find(course => course.Id === parseInt(id))
  },

  async create(course) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newCourse = {
      ...course,
      Id: Math.max(...courses.map(c => c.Id), 0) + 1
    }
    courses.push(newCourse)
    return newCourse
  },

  async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = courses.findIndex(course => course.Id === parseInt(id))
    if (index !== -1) {
      courses[index] = { ...courses[index], ...data }
      return courses[index]
    }
    throw new Error("Course not found")
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = courses.findIndex(course => course.Id === parseInt(id))
    if (index !== -1) {
      const deleted = courses.splice(index, 1)[0]
      return deleted
    }
    throw new Error("Course not found")
  }
}

export default courseService