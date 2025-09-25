import { toast } from 'react-toastify'

const noteService = {
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
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      }

      const response = await apperClient.fetchRecords('note_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data.map(note => ({
        Id: note.Id,
        title: note.title_c || '',
        content: note.content_c || '',
        createdAt: note.created_at_c || new Date().toISOString(),
        tags: note.tags_c ? note.tags_c.split(',') : [],
        courseId: note.course_id_c?.Id || note.course_id_c
      }))
    } catch (error) {
      console.error("Error fetching notes:", error?.response?.data?.message || error)
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
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [{"FieldName": "course_id_c", "Operator": "EqualTo", "Values": [parseInt(courseId)]}]
      }

      const response = await apperClient.fetchRecords('note_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data.map(note => ({
        Id: note.Id,
        title: note.title_c || '',
        content: note.content_c || '',
        createdAt: note.created_at_c || new Date().toISOString(),
        tags: note.tags_c ? note.tags_c.split(',') : [],
        courseId: note.course_id_c?.Id || note.course_id_c
      }))
    } catch (error) {
      console.error("Error fetching notes by course:", error?.response?.data?.message || error)
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
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      }

      const response = await apperClient.getRecordById('note_c', parseInt(id), params)

      if (!response?.data) {
        return null
      }

      const note = response.data
      return {
        Id: note.Id,
        title: note.title_c || '',
        content: note.content_c || '',
        createdAt: note.created_at_c || new Date().toISOString(),
        tags: note.tags_c ? note.tags_c.split(',') : [],
        courseId: note.course_id_c?.Id || note.course_id_c
      }
    } catch (error) {
      console.error(`Error fetching note ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async create(noteData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const createdAt = new Date().toISOString()
      const params = {
        records: [{
          Name: noteData.title || '',
          title_c: noteData.title || '',
          content_c: noteData.content || '',
          created_at_c: createdAt,
          tags_c: Array.isArray(noteData.tags) ? noteData.tags.join(',') : '',
          course_id_c: parseInt(noteData.courseId)
        }]
      }

      const response = await apperClient.createRecord('note_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} notes:`, failed)
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
            content: created.content_c || '',
            createdAt: created.created_at_c || createdAt,
            tags: created.tags_c ? created.tags_c.split(',') : [],
            courseId: created.course_id_c?.Id || created.course_id_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error creating note:", error?.response?.data?.message || error)
      return null
    }
  },

  async update(id, noteData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const updateData = {
        Id: parseInt(id)
      }

      if (noteData.title !== undefined) {
        updateData.Name = noteData.title
        updateData.title_c = noteData.title
      }
      if (noteData.content !== undefined) updateData.content_c = noteData.content
      if (noteData.tags !== undefined) updateData.tags_c = Array.isArray(noteData.tags) ? noteData.tags.join(',') : ''
      if (noteData.courseId !== undefined) updateData.course_id_c = parseInt(noteData.courseId)

      const params = {
        records: [updateData]
      }

      const response = await apperClient.updateRecord('note_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} notes:`, failed)
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
            content: updated.content_c || '',
            createdAt: updated.created_at_c || new Date().toISOString(),
            tags: updated.tags_c ? updated.tags_c.split(',') : [],
            courseId: updated.course_id_c?.Id || updated.course_id_c
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error updating note:", error?.response?.data?.message || error)
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

      const response = await apperClient.deleteRecord('note_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} notes:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        return successful.length > 0
      }
      return true
    } catch (error) {
      console.error("Error deleting note:", error?.response?.data?.message || error)
      return false
    }
  }
}

export default noteService