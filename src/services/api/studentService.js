import mockData from '@/services/mockData/students.json'
import { toast } from 'react-toastify'

// Helper function to create a copy of the data
const getData = () => JSON.parse(JSON.stringify(mockData))

// Store for runtime data
let studentsData = getData()

export const studentService = {
  // Get all students
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getData())
      }, 300) // Realistic delay
    })
  },

  // Get student by ID
  getById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const student = studentsData.find(s => s.Id === parseInt(id))
        if (student) {
          resolve({ ...student })
        } else {
          reject(new Error('Student not found'))
        }
      }, 200)
    })
  },

  // Create new student
  create: async (studentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Validate required fields
          if (!studentData.name || !studentData.email || !studentData.major || !studentData.year) {
            reject(new Error('Missing required fields'))
            return
          }

          // Check for duplicate email
          const existingStudent = studentsData.find(s => 
            s.email.toLowerCase() === studentData.email.toLowerCase()
          )
          if (existingStudent) {
            reject(new Error('A student with this email already exists'))
            return
          }

          // Generate new ID
          const maxId = studentsData.length > 0 
            ? Math.max(...studentsData.map(s => s.Id)) 
            : 0
          
          const newStudent = {
            Id: maxId + 1,
            name: studentData.name.trim(),
            email: studentData.email.trim().toLowerCase(),
            major: studentData.major.trim(),
            year: studentData.year,
            gpa: studentData.gpa ? parseFloat(studentData.gpa).toFixed(2) : '',
            status: studentData.status || 'Active'
          }

          studentsData.push(newStudent)
          resolve({ ...newStudent })
        } catch (error) {
          reject(error)
        }
      }, 400)
    })
  },

  // Update existing student
  update: async (id, studentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = studentsData.findIndex(s => s.Id === parseInt(id))
          if (index === -1) {
            reject(new Error('Student not found'))
            return
          }

          // Validate required fields
          if (!studentData.name || !studentData.email || !studentData.major || !studentData.year) {
            reject(new Error('Missing required fields'))
            return
          }

          // Check for duplicate email (excluding current student)
          const existingStudent = studentsData.find(s => 
            s.Id !== parseInt(id) && 
            s.email.toLowerCase() === studentData.email.toLowerCase()
          )
          if (existingStudent) {
            reject(new Error('A student with this email already exists'))
            return
          }

          const updatedStudent = {
            ...studentsData[index],
            name: studentData.name.trim(),
            email: studentData.email.trim().toLowerCase(),
            major: studentData.major.trim(),
            year: studentData.year,
            gpa: studentData.gpa ? parseFloat(studentData.gpa).toFixed(2) : '',
            status: studentData.status || 'Active'
          }

          studentsData[index] = updatedStudent
          resolve({ ...updatedStudent })
        } catch (error) {
          reject(error)
        }
      }, 400)
    })
  },

  // Delete student
  delete: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = studentsData.findIndex(s => s.Id === parseInt(id))
          if (index === -1) {
            reject(new Error('Student not found'))
            return
          }

          studentsData.splice(index, 1)
          resolve(true)
        } catch (error) {
          reject(error)
        }
      }, 300)
    })
  },

  // Search students
  search: async (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query) {
          resolve(getData())
          return
        }

        const searchQuery = query.toLowerCase()
        const filtered = studentsData.filter(student =>
          student.name.toLowerCase().includes(searchQuery) ||
          student.email.toLowerCase().includes(searchQuery) ||
          student.major.toLowerCase().includes(searchQuery)
        )
        
        resolve(filtered.map(s => ({ ...s })))
      }, 200)
    })
  },

  // Get students by status
  getByStatus: async (status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = studentsData.filter(student => student.status === status)
        resolve(filtered.map(s => ({ ...s })))
      }, 200)
    })
  },

  // Get students by major
  getByMajor: async (major) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = studentsData.filter(student => student.major === major)
        resolve(filtered.map(s => ({ ...s })))
      }, 200)
    })
  },

  // Get unique majors
  getMajors: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const majors = [...new Set(studentsData.map(s => s.major))].sort()
        resolve(majors)
      }, 100)
    })
  },

  // Reset data to initial state
  resetData: () => {
    studentsData = getData()
    return studentsData
  }
}