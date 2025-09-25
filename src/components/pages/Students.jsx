import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Card } from "@/components/atoms/Card";
import { studentService } from "@/services/api/studentService";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Label from "@/components/atoms/Label";

export default function Students() {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMajor, setFilterMajor] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
major: '',
year: '',
gpa: '',
    status: '',
  });

  useEffect(() => {
    loadStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchQuery, filterMajor, filterYear, filterStatus])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const data = await studentService.getAll()
      setStudents(data)
      setError(null)
    } catch (err) {
      setError('Failed to load students')
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(student =>
        (student.name && student.name.toLowerCase().includes(query)) ||
        (student.email && student.email.toLowerCase().includes(query)) ||
        (student.major && student.major.toLowerCase().includes(query))
      )
    }

    if (filterMajor !== 'all') {
      filtered = filtered.filter(student => student.major === filterMajor)
    }

    if (filterYear !== 'all') {
      filtered = filtered.filter(student => student.year === filterYear)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(student => student.status === filterStatus)
    }

    setFilteredStudents(filtered)
  }

const openModal = (student = null) => {
    setEditingStudent(student)
    setFormData(student ? { 
      name: student.name || '',
      email: student.email || '', 
      major: student.major || '',
      year: student.year || '',
      gpa: student.gpa || '',
      status: student.status || '',
    } : {
      name: '',
      email: '',
      major: '',
      year: '',
      gpa: '',
      status: '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingStudent(null)
    setFormData({
      name: '',
      email: '',
      major: '',
      year: '',
      gpa: '',
      status: '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
if (!formData.name || !formData.email || !formData.major || !formData.year || !formData.status) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.gpa && (isNaN(formData.gpa) || formData.gpa < 0 || formData.gpa > 4)) {
      toast.error('GPA must be a number between 0 and 4')
      return
    }


    if (formData.mathsMarks && (isNaN(formData.mathsMarks) || formData.mathsMarks < 0 || formData.mathsMarks > 100)) {
      toast.error('Maths marks must be a number between 0 and 100')
      return
    }
    try {
      if (editingStudent) {
        const updatedStudent = await studentService.update(editingStudent.Id, formData)
        setStudents(prev => prev.map(s => s.Id === editingStudent.Id ? updatedStudent : s))
        toast.success('Student updated successfully')
      } else {
        const newStudent = await studentService.create(formData)
        setStudents(prev => [...prev, newStudent])
        toast.success('Student added successfully')
      }
      closeModal()
    } catch (err) {
      toast.error('Failed to save student')
    }
  }

  const handleDelete = async (studentId, studentName) => {
    if (!confirm(`Are you sure you want to delete ${studentName}?`)) {
      return
    }

    try {
      await studentService.delete(studentId)
      setStudents(prev => prev.filter(s => s.Id !== studentId))
      toast.success('Student deleted successfully')
    } catch (err) {
      toast.error('Failed to delete student')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success'
      case 'Inactive': return 'error'
      case 'Graduated': return 'primary'
      case 'On Leave': return 'warning'
      default: return 'secondary'
    }
  }

  const getYearDisplay = (year) => {
    switch (year) {
      case 'Freshman': return '1st Year'
      case 'Sophomore': return '2nd Year'
      case 'Junior': return '3rd Year'
      case 'Senior': return '4th Year'
      default: return year
    }
  }

  const majors = [...new Set(students.map(s => s.major))].sort()
  const years = ['Freshman', 'Sophomore', 'Junior', 'Senior']
  const statuses = ['Active', 'Inactive', 'Graduated', 'On Leave']

  if (loading) return <Loading />
  if (error) return <Error message={error} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student records and information</p>
        </div>
        <Button 
          onClick={() => openModal()}
          className="w-full sm:w-auto"
        >
          <ApperIcon name="Plus" size={16} />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search students by name, email, or major..."
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Major</Label>
              <Select
                value={filterMajor}
                onChange={(e) => setFilterMajor(e.target.value)}
              >
                <option value="all">All Majors</option>
                {majors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </Select>
            </div>
            
            <div>
              <Label>Year</Label>
              <Select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{getYearDisplay(year)}</option>
                ))}
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('')
                  setFilterMajor('all')
                  setFilterYear('all')
                  setFilterStatus('all')
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <Empty 
          message={searchQuery || filterMajor !== 'all' || filterYear !== 'all' || filterStatus !== 'all' 
            ? "No students match your filters" 
            : "No students found"
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map(student => (
<Card key={student.Id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <Badge variant={getStatusColor(student.status)}>
                  {student.status}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
<div className="flex justify-between text-sm">
                  <span className="text-gray-600">Major:</span>
                  <span className="font-medium">{student.major}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Year:</span>
                  <span className="font-medium">{getYearDisplay(student.year)}</span>
                </div>
{student.gpa && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GPA:</span>
                    <span className="font-medium">{student.gpa}</span>
                  </div>
                )}
{student.mathsMarks && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Maths Marks:</span>
                    <span className="font-medium">{student.mathsMarks}</span>
</div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openModal(student)}
                  className="flex-1"
                >
                  <ApperIcon name="Edit" size={14} />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(student.Id, student.name)}
                  className="flex-1 text-error-600 hover:bg-error-50 border-error-300"
                >
                  <ApperIcon name="Trash2" size={14} />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label required>Full Name</Label>
                  <Input
value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter student name"
                    required
                  />
                </div>

                <div>
                  <Label required>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <Label required>Major</Label>
                  <Input
                    value={formData.major}
                    onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                    placeholder="Enter major/program"
                    required
                  />
                </div>

                <div>
                  <Label required>Year</Label>
                  <Select
value={formData.year || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{getYearDisplay(year)}</option>
                    ))}
                  </Select>
                </div>

<div>
                  <Label>GPA (Optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={formData.gpa || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                    placeholder="Enter GPA (0.0 - 4.0)"
                  />
                </div>

                <div>
                  <Label required>Status</Label>
                  <Select
                    value={formData.status || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    required
                  >
                    <option value="">Select Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingStudent ? 'Update Student' : 'Add Student'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}