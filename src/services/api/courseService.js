import { toast } from 'react-toastify'

const courseService = {
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
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "instructor_c"}},
          {"field": {"Name": "credits_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "schedule_days_c"}},
          {"field": {"Name": "schedule_time_c"}},
          {"field": {"Name": "schedule_location_c"}},
          {"field": {"Name": "color_c"}}
        ]
      }

      const response = await apperClient.fetchRecords('course_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data.map(course => ({
        Id: course.Id,
        name: course.name_c || '',
        instructor: course.instructor_c || '',
        credits: course.credits_c || 0,
        semester: course.semester_c || '',
        color: course.color_c || '#6366f1',
        schedule: {
          days: course.schedule_days_c ? course.schedule_days_c.split(',') : [],
          time: course.schedule_time_c || '',
          location: course.schedule_location_c || ''
        }
      }))
    } catch (error) {
      console.error("Error fetching courses:", error?.response?.data?.message || error)
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
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "instructor_c"}},
          {"field": {"Name": "credits_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "schedule_days_c"}},
          {"field": {"Name": "schedule_time_c"}},
          {"field": {"Name": "schedule_location_c"}},
          {"field": {"Name": "color_c"}}
        ]
      }

      const response = await apperClient.getRecordById('course_c', parseInt(id), params)

      if (!response?.data) {
        return null
      }

      const course = response.data
      return {
        Id: course.Id,
        name: course.name_c || '',
        instructor: course.instructor_c || '',
        credits: course.credits_c || 0,
        semester: course.semester_c || '',
        color: course.color_c || '#6366f1',
        schedule: {
          days: course.schedule_days_c ? course.schedule_days_c.split(',') : [],
          time: course.schedule_time_c || '',
          location: course.schedule_location_c || ''
        }
      }
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async create(courseData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        records: [{
          Name: courseData.name || '',
          name_c: courseData.name || '',
          instructor_c: courseData.instructor || '',
          credits_c: parseInt(courseData.credits) || 0,
          semester_c: courseData.semester || '',
          schedule_days_c: Array.isArray(courseData.schedule?.days) ? courseData.schedule.days.join(',') : '',
          schedule_time_c: courseData.schedule?.time || '',
          schedule_location_c: courseData.schedule?.location || '',
          color_c: courseData.color || '#6366f1'
        }]
      }

      const response = await apperClient.createRecord('course_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} courses:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const created = successful[0].data
          return {
            Id: created.Id,
            name: created.name_c || '',
            instructor: created.instructor_c || '',
            credits: created.credits_c || 0,
            semester: created.semester_c || '',
            color: created.color_c || '#6366f1',
            schedule: {
              days: created.schedule_days_c ? created.schedule_days_c.split(',') : [],
              time: created.schedule_time_c || '',
              location: created.schedule_location_c || ''
            }
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error creating course:", error?.response?.data?.message || error)
      return null
    }
  },

  async update(id, courseData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const updateData = {
        Id: parseInt(id)
      }

      if (courseData.name !== undefined) {
        updateData.Name = courseData.name
        updateData.name_c = courseData.name
      }
      if (courseData.instructor !== undefined) updateData.instructor_c = courseData.instructor
      if (courseData.credits !== undefined) updateData.credits_c = parseInt(courseData.credits)
      if (courseData.semester !== undefined) updateData.semester_c = courseData.semester
      if (courseData.color !== undefined) updateData.color_c = courseData.color
      if (courseData.schedule?.days !== undefined) updateData.schedule_days_c = Array.isArray(courseData.schedule.days) ? courseData.schedule.days.join(',') : ''
      if (courseData.schedule?.time !== undefined) updateData.schedule_time_c = courseData.schedule.time
      if (courseData.schedule?.location !== undefined) updateData.schedule_location_c = courseData.schedule.location

      const params = {
        records: [updateData]
      }

      const response = await apperClient.updateRecord('course_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} courses:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data
          return {
            Id: updated.Id,
            name: updated.name_c || '',
            instructor: updated.instructor_c || '',
            credits: updated.credits_c || 0,
            semester: updated.semester_c || '',
            color: updated.color_c || '#6366f1',
            schedule: {
              days: updated.schedule_days_c ? updated.schedule_days_c.split(',') : [],
              time: updated.schedule_time_c || '',
              location: updated.schedule_location_c || ''
            }
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error updating course:", error?.response?.data?.message || error)
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

      const response = await apperClient.deleteRecord('course_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} courses:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        return successful.length > 0
      }
      return true
    } catch (error) {
      console.error("Error deleting course:", error?.response?.data?.message || error)
      return false
    }
  }
}

export default courseService