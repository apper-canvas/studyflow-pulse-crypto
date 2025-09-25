import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import SearchBar from "@/components/molecules/SearchBar"
import Select from "@/components/atoms/Select"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import { format } from "date-fns"
import noteService from "@/services/api/noteService"
import courseService from "@/services/api/courseService"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import NoteModal from "@/components/organisms/NoteModal"

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [courses, setCourses] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("all")
  const [selectedNote, setSelectedNote] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setError("")
      setLoading(true)
      
      const [notesData, coursesData] = await Promise.all([
        noteService.getAll(),
        courseService.getAll()
      ])

      setNotes(notesData)
      setCourses(coursesData)
    } catch (err) {
      setError(err.message || "Failed to load notes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = notes

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (courseFilter !== "all") {
      filtered = filtered.filter(note => note.courseId === parseInt(courseFilter))
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFilteredNotes(filtered)
  }, [notes, searchTerm, courseFilter])

  const handleAddNote = () => {
    setEditingNote(null)
    setShowModal(true)
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setShowModal(true)
  }

  const handleViewNote = (note) => {
    setSelectedNote(note)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingNote(null)
  }

  const handleSaveNote = () => {
    setShowModal(false)
    setEditingNote(null)
    loadData()
    toast.success(editingNote ? "Note updated successfully!" : "Note created successfully!")
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await noteService.delete(noteId)
      await loadData()
      if (selectedNote && selectedNote.Id === noteId) {
        setSelectedNote(null)
      }
      toast.success("Note deleted successfully!")
    } catch (err) {
      setError(err.message || "Failed to delete note")
    }
  }

  const getCourseById = (courseId) => {
    return courses.find(course => course.Id === courseId)
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Notes</h1>
          <p className="text-gray-600">Organize your study notes and course materials.</p>
        </div>
        <Button onClick={handleAddNote} icon="Plus">
          Add Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ApperIcon name="StickyNote" className="w-5 h-5 text-primary-600" />
                All Notes
              </CardTitle>
              <div className="space-y-4 mt-4">
                <SearchBar 
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
                <Select 
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                >
                  <option value="all">All Courses</option>
                  {courses.map(course => (
                    <option key={course.Id} value={course.Id.toString()}>
                      {course.name}
                    </option>
                  ))}
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredNotes.length === 0 ? (
                <div className="p-6">
                  <Empty 
                    message={notes.length === 0 ? "No notes found" : "No notes match your search"}
                    action={notes.length === 0 ? "Create your first note to get started" : "Try adjusting your search or filters"}
                    icon="FileText"
                  />
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {filteredNotes.map(note => {
                    const course = getCourseById(note.courseId)
                    const isSelected = selectedNote && selectedNote.Id === note.Id
                    
                    return (
                      <div
                        key={note.Id}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                          isSelected ? "bg-primary-50 border-primary-200" : ""
                        }`}
                        onClick={() => handleViewNote(note)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditNote(note)
                              }}
                              className="h-6 w-6"
                            >
                              <ApperIcon name="Edit" className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteNote(note.Id)
                              }}
                              className="h-6 w-6 text-error-600 hover:text-error-700 hover:bg-error-50"
                            >
                              <ApperIcon name="Trash2" className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {course && (
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: course.color }}
                            />
                            <span className="text-xs text-gray-600">{course.name}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {note.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {note.tags.length > 2 && (
                              <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {format(new Date(note.createdAt), "MMM dd")}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedNote ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{selectedNote.title}</CardTitle>
                    {getCourseById(selectedNote.courseId) && (
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getCourseById(selectedNote.courseId).color }}
                        />
                        <span className="text-sm text-gray-600">
                          {getCourseById(selectedNote.courseId).name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ApperIcon name="Calendar" className="w-4 h-4" />
                      Created {format(new Date(selectedNote.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditNote(selectedNote)}
                      icon="Edit"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteNote(selectedNote.Id)}
                      icon="Trash2"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedNote.content}
                  </div>
                </div>
                {selectedNote.tags.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Tag" className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Tags:</span>
                      <div className="flex gap-2">
                        {selectedNote.tags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ApperIcon name="FileText" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a note to view
                  </h3>
                  <p className="text-gray-500">
                    Choose a note from the list to see its contents
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showModal && (
        <NoteModal
          note={editingNote}
          courses={courses}
          onClose={handleCloseModal}
          onSave={handleSaveNote}
        />
      )}
    </motion.div>
  )
}

export default Notes