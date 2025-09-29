import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";

export const studentService = {
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
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "major_c"}},
          {"field": {"Name": "year_c"}},
          {"field": {"Name": "gpa_c"}},
          {"field": {"Name": "science_marks_c"}},
          {"field": {"Name": "maths_marks_c"}},
          {"field": {"Name": "status_c"}}
        ]
      }

      const response = await apperClient.fetchRecords('student_c', params)

      if (!response?.data?.length) {
        return []
      }

return response.data.map(student => ({
        Id: student.Id,
        name: student.name_c || '',
        email: student.email_c || '',
        major: student.major_c || '',
        year: student.year_c || '',
        gpa: student.gpa_c || '',
        scienceMarks: student.science_marks_c || '',
        mathsMarks: student.maths_marks_c || '',
        status: student.status_c || 'Active'
      }))
    } catch (error) {
      console.error("Error fetching students:", error?.response?.data?.message || error)
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
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "major_c"}},
          {"field": {"Name": "year_c"}},
{"field": {"Name": "gpa_c"}},
          {"field": {"Name": "science_marks_c"}},
          {"field": {"Name": "maths_marks_c"}},
          {"field": {"Name": "status_c"}}
        ]
      }

      const response = await apperClient.getRecordById('student_c', parseInt(id), params)

      if (!response?.data) {
        return null
      }

      const student = response.data
return {
        Id: student.Id,
        name: student.name_c || '',
        email: student.email_c || '',
        major: student.major_c || '',
        year: student.year_c || '',
        gpa: student.gpa_c || '',
        scienceMarks: student.science_marks_c || '',
        mathsMarks: student.maths_marks_c || '',
        status: student.status_c || 'Active'
      }
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async create(studentData) {
    try {
      if (!studentData.name || !studentData.email || !studentData.major || !studentData.year) {
        throw new Error('Missing required fields')
      }

      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

const params = {
        records: [{
          Name: studentData.name.trim(),
          name_c: studentData.name.trim(),
          email_c: studentData.email.trim().toLowerCase(),
          major_c: studentData.major.trim(),
          year_c: studentData.year,
name_c: studentData.name,
          email_c: studentData.email,
          major_c: studentData.major,
          year_c: studentData.year,
          gpa_c: studentData.gpa ? parseFloat(studentData.gpa) : null,
          science_marks_c: studentData.scienceMarks ? parseFloat(studentData.scienceMarks) : null,
          maths_marks_c: studentData.mathsMarks ? parseFloat(studentData.mathsMarks) : null,
          status_c: studentData.status || 'Active'
        }]
      }

      const response = await apperClient.createRecord('student_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} students:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        if (successful.length > 0) {
const created = successful[0].data;
          
          // Create corresponding Stripe customer
          try {
            const { ApperClient } = window.ApperSDK;
            const apperClient = new ApperClient({
              apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
              apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
            });
            
            const stripeResult = await apperClient.functions.invoke(import.meta.env.VITE_CREATE_STRIPE_CUSTOMER, {
              body: JSON.stringify({
                email: created.email_c || '',
                name: created.name_c || ''
              }),
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            if (stripeResult.success && stripeResult.data?.customerId) {
              // Store Stripe customer ID in student record
              const updateParams = {
                records: [{
                  Id: created.Id,
                  stripe_customer_id_c: stripeResult.data.customerId
                }]
              };
              
              await apperClient.updateRecord('student_c', updateParams);
              toast.success(`Student created successfully and linked to billing system`);
            } else {
              console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_CREATE_STRIPE_CUSTOMER}. The response body is: ${JSON.stringify(stripeResult)}.`);
              toast.warning('Student created successfully, but billing setup encountered an issue');
            }
          } catch (stripeError) {
            console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_CREATE_STRIPE_CUSTOMER}. The error is: ${stripeError.message}`);
            toast.warning('Student created successfully, but billing integration failed');
          }

          const studentData = {
            Id: created.Id,
            name: created.name_c || '',
            email: created.email_c || '',
            major: created.major_c || '',
            year: created.year_c || '',
            gpa: created.gpa_c || '',
            scienceMarks: created.science_marks_c || '',
            mathsMarks: created.maths_marks_c || '',
            status: created.status_c || 'Active'
          };
          // Check if maths marks are greater than 7.0 and send email
          if (created.maths_marks_c && created.maths_marks_c > 7.0) {
            try {
              const { ApperClient } = window.ApperSDK;
              const apperClient = new ApperClient({
                apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
                apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
              });

              await apperClient.functions.invoke(import.meta.env.VITE_SEND_STUDENT_EMAIL, {
                body: {
                  email: created.email_c,
                  name: created.name_c
                },
                headers: {
                  'Content-Type': 'application/json'
                }
              });

              toast.success(`Student created successfully! Congratulations email sent to ${created.email_c}`);
            } catch (emailError) {
              console.error('Failed to send congratulations email:', emailError);
              toast.warning('Student created successfully, but failed to send congratulations email');
            }
          } else {
            toast.success('Student created successfully!');
          }

          return studentData;
        }
      }
      return null
    } catch (error) {
      console.error("Error creating student:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, studentData) {
    try {
      if (!studentData.name || !studentData.email || !studentData.major || !studentData.year) {
        throw new Error('Missing required fields')
      }

      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

const params = {
        records: [{
          Id: parseInt(id),
          Name: studentData.name.trim(),
          name_c: studentData.name.trim(),
          email_c: studentData.email.trim().toLowerCase(),
          major_c: studentData.major.trim(),
          year_c: studentData.year,
name_c: studentData.name,
          email_c: studentData.email,
          major_c: studentData.major,
          year_c: studentData.year,
          gpa_c: studentData.gpa ? parseFloat(studentData.gpa) : null,
          science_marks_c: studentData.scienceMarks ? parseFloat(studentData.scienceMarks) : null,
          maths_marks_c: studentData.mathsMarks ? parseFloat(studentData.mathsMarks) : null,
          status_c: studentData.status || 'Active'
        }]
      }

      const response = await apperClient.updateRecord('student_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} students:`, failed)
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
            email: updated.email_c || '',
            major: updated.major_c || '',
            year: updated.year_c || '',
            gpa: updated.gpa_c || '',
            scienceMarks: updated.science_marks_c || '',
            mathsMarks: updated.maths_marks_c || '',
            status: updated.status_c || 'Active'
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error updating student:", error?.response?.data?.message || error)
      throw error
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

      const response = await apperClient.deleteRecord('student_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} students:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        return successful.length > 0
      }
      return true
    } catch (error) {
      console.error("Error deleting student:", error?.response?.data?.message || error)
      return false
    }
  },

  async search(query) {
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
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "major_c"}},
          {"field": {"Name": "year_c"}},
{"field": {"Name": "gpa_c"}},
          {"field": {"Name": "science_marks_c"}},
          {"field": {"Name": "maths_marks_c"}},
          {"field": {"Name": "status_c"}}
        ],
        whereGroups: query ? [{
          "operator": "OR",
          "subGroups": [
            {"conditions": [{"fieldName": "name_c", "operator": "Contains", "values": [query]}], "operator": ""},
            {"conditions": [{"fieldName": "email_c", "operator": "Contains", "values": [query]}], "operator": ""},
            {"conditions": [{"fieldName": "major_c", "operator": "Contains", "values": [query]}], "operator": ""}
          ]
        }] : []
      }

      const response = await apperClient.fetchRecords('student_c', params)

      if (!response?.data?.length) {
        return []
      }

return response.data.map(student => ({
        Id: student.Id,
        name: student.name_c || '',
        email: student.email_c || '',
        major: student.major_c || '',
        year: student.year_c || '',
        gpa: student.gpa_c || '',
        scienceMarks: student.science_marks_c || '',
        mathsMarks: student.maths_marks_c || '',
        status: student.status_c || 'Active'
      }))
    } catch (error) {
      console.error("Error searching students:", error?.response?.data?.message || error)
      return []
    }
  },

  async getByStatus(status) {
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
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "major_c"}},
          {"field": {"Name": "year_c"}},
          {"field": {"Name": "gpa_c"}},
{"field": {"Name": "science_marks_c"}},
          {"field": {"Name": "maths_marks_c"}},
          {"field": {"Name": "status_c"}}
        ],
        where: [{"FieldName": "status_c", "Operator": "EqualTo", "Values": [status]}]
      }

      const response = await apperClient.fetchRecords('student_c', params)

      if (!response?.data?.length) {
        return []
      }

return response.data.map(student => ({
        Id: student.Id,
        name: student.name_c || '',
        email: student.email_c || '',
        major: student.major_c || '',
        year: student.year_c || '',
        gpa: student.gpa_c || '',
        scienceMarks: student.science_marks_c || '',
        mathsMarks: student.maths_marks_c || '',
        status: student.status_c || 'Active'
      }))
    } catch (error) {
      console.error("Error fetching students by status:", error?.response?.data?.message || error)
      return []
    }
  },

  async getByMajor(major) {
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
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "major_c"}},
          {"field": {"Name": "year_c"}},
{"field": {"Name": "gpa_c"}},
          {"field": {"Name": "science_marks_c"}},
          {"field": {"Name": "maths_marks_c"}},
          {"field": {"Name": "status_c"}}
        ],
        where: [{"FieldName": "major_c", "Operator": "EqualTo", "Values": [major]}]
      }

      const response = await apperClient.fetchRecords('student_c', params)

      if (!response?.data?.length) {
        return []
      }

return response.data.map(student => ({
        Id: student.Id,
        name: student.name_c || '',
        email: student.email_c || '',
        major: student.major_c || '',
        year: student.year_c || '',
        gpa: student.gpa_c || '',
        scienceMarks: student.science_marks_c || '',
        mathsMarks: student.maths_marks_c || '',
        status: student.status_c || 'Active'
      }))
    } catch (error) {
      console.error("Error fetching students by major:", error?.response?.data?.message || error)
      return []
    }
  },

  async getMajors() {
    try {
      const students = await this.getAll()
      const majors = [...new Set(students.map(s => s.major))].sort()
      return majors
    } catch (error) {
      console.error("Error fetching majors:", error?.response?.data?.message || error)
      return []
    }
  }
}