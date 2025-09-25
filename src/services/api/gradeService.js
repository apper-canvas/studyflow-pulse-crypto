import { toast } from 'react-toastify'

const gradeService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_id_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      }

      const response = await apperClient.fetchRecords('grade_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data.map(grade => ({
        Id: grade.Id,
        assignmentId: grade.assignment_id_c || 0,
        category: grade.category_c || '',
        points: grade.points_c || 0,
        maxPoints: grade.max_points_c || 0,
        weight: grade.weight_c || 0,
        courseId: grade.course_id_c?.Id || grade.course_id_c
      }))
    } catch (error) {
      console.error("Error fetching grades:", error?.response?.data?.message || error)
      return []
    }
  },

  async getByCourse(courseId) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_id_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [{"FieldName": "course_id_c", "Operator": "EqualTo", "Values": [parseInt(courseId)]}]
      }

      const response = await apperClient.fetchRecords('grade_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data.map(grade => ({
        Id: grade.Id,
        assignmentId: grade.assignment_id_c || 0,
        category: grade.category_c || '',
        points: grade.points_c || 0,
        maxPoints: grade.max_points_c || 0,
        weight: grade.weight_c || 0,
        courseId: grade.course_id_c?.Id || grade.course_id_c
      }))
    } catch (error) {
      console.error("Error fetching grades by course:", error?.response?.data?.message || error)
      return []
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_id_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "weight_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      }

      const response = await apperClient.getRecordById('grade_c', parseInt(id), params)

      if (!response?.data) {
        return null
      }

      const grade = response.data
      return {
        Id: grade.Id,
        assignmentId: grade.assignment_id_c || 0,
        category: grade.category_c || '',
        points: grade.points_c || 0,
        maxPoints: grade.max_points_c || 0,
        weight: grade.weight_c || 0,
        courseId: grade.course_id_c?.Id || grade.course_id_c
      }
    } catch (error) {
      console.error(`Error fetching grade ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async create(gradeData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        records: [{
          Name: gradeData.category || '',
          assignment_id_c: parseInt(gradeData.assignmentId) || 0,
          category_c: gradeData.category || '',
          points_c: parseInt(gradeData.points) || 0,
          max_points_c: parseInt(gradeData.maxPoints) || 0,
          weight_c: parseFloat(gradeData.weight) || 0,
          course_id_c: parseInt(gradeData.courseId)
        }]
      }

      const response = await apperClient.createRecord('grade_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} grades:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const created = successful[0].data
          return {
            Id: created.Id,
            assignmentId: created.assignment_id_c || 0,
            category: created.category_c || '',
            points: created.points_c || 0,
            maxPoints: created.max_points_c || 0,
            weight: created.weight_c || 0,
            courseId: created.course_id_c?.Id || created.course_id_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error creating grade:", error?.response?.data?.message || error)
      return null
    }
  },

  async update(id, gradeData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const updateData = {
        Id: parseInt(id)
      }

      if (gradeData.category !== undefined) {
        updateData.Name = gradeData.category
        updateData.category_c = gradeData.category
      }
      if (gradeData.assignmentId !== undefined) updateData.assignment_id_c = parseInt(gradeData.assignmentId)
      if (gradeData.points !== undefined) updateData.points_c = parseInt(gradeData.points)
      if (gradeData.maxPoints !== undefined) updateData.max_points_c = parseInt(gradeData.maxPoints)
      if (gradeData.weight !== undefined) updateData.weight_c = parseFloat(gradeData.weight)
      if (gradeData.courseId !== undefined) updateData.course_id_c = parseInt(gradeData.courseId)

      const params = {
        records: [updateData]
      }

      const response = await apperClient.updateRecord('grade_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} grades:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data
          return {
            Id: updated.Id,
            assignmentId: updated.assignment_id_c || 0,
            category: updated.category_c || '',
            points: updated.points_c || 0,
            maxPoints: updated.max_points_c || 0,
            weight: updated.weight_c || 0,
            courseId: updated.course_id_c?.Id || updated.course_id_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error updating grade:", error?.response?.data?.message || error)
      return null
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = { 
        RecordIds: [parseInt(id)]
      }

      const response = await apperClient.deleteRecord('grade_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} grades:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        return successful.length > 0
      }
      return true
    } catch (error) {
      console.error("Error deleting grade:", error?.response?.data?.message || error)
      return false
    }
  }
}

export default gradeService