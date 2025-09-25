import { toast } from 'react-toastify'

const assignmentService = {
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      }

      const response = await apperClient.fetchRecords('assignment_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data.map(assignment => ({
        Id: assignment.Id,
        title: assignment.title_c || '',
        dueDate: assignment.due_date_c || '',
        priority: assignment.priority_c || 'medium',
        status: assignment.status_c || 'pending',
        description: assignment.description_c || '',
        grade: assignment.grade_c || null,
        courseId: assignment.course_id_c?.Id || assignment.course_id_c
      }))
    } catch (error) {
      console.error("Error fetching assignments:", error?.response?.data?.message || error)
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [{"FieldName": "course_id_c", "Operator": "EqualTo", "Values": [parseInt(courseId)]}]
      }

      const response = await apperClient.fetchRecords('assignment_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data.map(assignment => ({
        Id: assignment.Id,
        title: assignment.title_c || '',
        dueDate: assignment.due_date_c || '',
        priority: assignment.priority_c || 'medium',
        status: assignment.status_c || 'pending',
        description: assignment.description_c || '',
        grade: assignment.grade_c || null,
        courseId: assignment.course_id_c?.Id || assignment.course_id_c
      }))
    } catch (error) {
      console.error("Error fetching assignments by course:", error?.response?.data?.message || error)
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "grade_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      }

      const response = await apperClient.getRecordById('assignment_c', parseInt(id), params)

      if (!response?.data) {
        return null
      }

      const assignment = response.data
      return {
        Id: assignment.Id,
        title: assignment.title_c || '',
        dueDate: assignment.due_date_c || '',
        priority: assignment.priority_c || 'medium',
        status: assignment.status_c || 'pending',
        description: assignment.description_c || '',
        grade: assignment.grade_c || null,
        courseId: assignment.course_id_c?.Id || assignment.course_id_c
      }
    } catch (error) {
      console.error(`Error fetching assignment ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async create(assignmentData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        records: [{
          Name: assignmentData.title || '',
          title_c: assignmentData.title || '',
          due_date_c: assignmentData.dueDate || '',
          priority_c: assignmentData.priority || 'medium',
          status_c: assignmentData.status || 'pending',
          description_c: assignmentData.description || '',
          grade_c: assignmentData.grade || null,
          course_id_c: parseInt(assignmentData.courseId)
        }]
      }

      const response = await apperClient.createRecord('assignment_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} assignments:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const created = successful[0].data
          return {
            Id: created.Id,
            title: created.title_c || '',
            dueDate: created.due_date_c || '',
            priority: created.priority_c || 'medium',
            status: created.status_c || 'pending',
            description: created.description_c || '',
            grade: created.grade_c || null,
            courseId: created.course_id_c?.Id || created.course_id_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error creating assignment:", error?.response?.data?.message || error)
      return null
    }
  },

  async update(id, assignmentData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const updateData = {
        Id: parseInt(id)
      }

      if (assignmentData.title !== undefined) {
        updateData.Name = assignmentData.title
        updateData.title_c = assignmentData.title
      }
      if (assignmentData.dueDate !== undefined) updateData.due_date_c = assignmentData.dueDate
      if (assignmentData.priority !== undefined) updateData.priority_c = assignmentData.priority
      if (assignmentData.status !== undefined) updateData.status_c = assignmentData.status
      if (assignmentData.description !== undefined) updateData.description_c = assignmentData.description
      if (assignmentData.grade !== undefined) updateData.grade_c = assignmentData.grade
      if (assignmentData.courseId !== undefined) updateData.course_id_c = parseInt(assignmentData.courseId)

      const params = {
        records: [updateData]
      }

      const response = await apperClient.updateRecord('assignment_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} assignments:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data
          return {
            Id: updated.Id,
            title: updated.title_c || '',
            dueDate: updated.due_date_c || '',
            priority: updated.priority_c || 'medium',
            status: updated.status_c || 'pending',
            description: updated.description_c || '',
            grade: updated.grade_c || null,
            courseId: updated.course_id_c?.Id || updated.course_id_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error updating assignment:", error?.response?.data?.message || error)
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

      const response = await apperClient.deleteRecord('assignment_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} assignments:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        return successful.length > 0
      }
      return true
    } catch (error) {
      console.error("Error deleting assignment:", error?.response?.data?.message || error)
      return false
    }
  }
}

export default assignmentService