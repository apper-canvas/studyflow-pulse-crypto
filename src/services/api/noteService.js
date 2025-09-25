import noteData from "@/services/mockData/notes.json"

let notes = [...noteData]

const noteService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...notes]
  },

  async getByCourse(courseId) {
    await new Promise(resolve => setTimeout(resolve, 250))
    return notes.filter(note => note.courseId === parseInt(courseId))
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return notes.find(note => note.Id === parseInt(id))
  },

  async create(note) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newNote = {
      ...note,
      Id: Math.max(...notes.map(n => n.Id), 0) + 1,
      createdAt: new Date().toISOString()
    }
    notes.push(newNote)
    return newNote
  },

  async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = notes.findIndex(note => note.Id === parseInt(id))
    if (index !== -1) {
      notes[index] = { ...notes[index], ...data }
      return notes[index]
    }
    throw new Error("Note not found")
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = notes.findIndex(note => note.Id === parseInt(id))
    if (index !== -1) {
      const deleted = notes.splice(index, 1)[0]
      return deleted
    }
    throw new Error("Note not found")
  }
}

export default noteService