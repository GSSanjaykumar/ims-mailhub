import { create } from 'zustand'
import axios from 'axios'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  filter: 'all',
  loading: false,

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const res = await axios.get('/api/tasks?t=' + Date.now())
      const taskList = Array.isArray(res.data) ? res.data :
                       (res.data.tasks || res.data.content || [])
      set({ tasks: taskList, loading: false })
      return taskList
    } catch (e) {
      console.error('Failed to fetch tasks:', e)
      set({ loading: false })
      return []
    }
  },

  setFilter: (f) => set({ filter: f }),

  updateTask: (taskId, updates) => {
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
      )
    }))
  },

  toggleDone: async (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return
    const newStatus = task.status === 'DONE' ? 'ACTIVE' : 'DONE'
    try {
      await axios.put(`/api/tasks/${id}`, { status: newStatus })
      set(s => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t)
      }))
    } catch (e) { console.error(e) }
  },

  get filteredTasks() {
    const { tasks, filter } = get()
    switch (filter) {
      case 'HIGH': return tasks.filter(t => t.priority === 'HIGH')
      case 'MEDIUM': return tasks.filter(t => t.priority === 'MEDIUM')
      case 'LOW': return tasks.filter(t => t.priority === 'LOW')
      case 'collision': return tasks.filter(t => t.hasCollision)
      case 'review': return tasks.filter(t => (t.confidenceScore || 70) < 80)
      default: return tasks
    }
  },

  getFilteredTasks: () => {
    const { tasks, filter } = get()
    switch (filter) {
      case 'HIGH': return tasks.filter(t => t.priority === 'HIGH')
      case 'MEDIUM': return tasks.filter(t => t.priority === 'MEDIUM')
      case 'LOW': return tasks.filter(t => t.priority === 'LOW')
      case 'collision': return tasks.filter(t => t.hasCollision)
      case 'review': return tasks.filter(t => (t.confidenceScore || 70) < 80)
      default: return tasks
    }
  },

  getStats: () => {
    const tasks = get().tasks
    const total = tasks.length
    const high = tasks.filter(t => t.priority === 'HIGH').length
    const collisions = tasks.filter(t => t.hasCollision).length
    const scores = tasks.map(t => t.confidenceScore || 70)
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    return { total, high, collisions, avg }
  },

  getWorkloadByDay: () => {
    const { tasks } = get()

    // Show next 7 days from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Build 7 day slots starting from today
    const slots = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      slots.push({
        day: days[d.getDay()],
        date: d.toDateString(),
        dateObj: d,
        tasks: 0,
        collision: false
      })
    }

    // Count tasks per day
    tasks.forEach(task => {
      let taskDate = null
      if (task.dueDate) {
        taskDate = new Date(task.dueDate)
      } else if (task.dueRaw && task.dueRaw !== 'No deadline') {
        taskDate = new Date(task.dueRaw)
        if (isNaN(taskDate.getTime())) return
      }
      if (!taskDate || isNaN(taskDate.getTime())) return

      taskDate.setHours(0, 0, 0, 0)

      slots.forEach(slot => {
        if (taskDate.toDateString() === slot.dateObj.toDateString()) {
          slot.tasks++
          if (task.hasCollision) slot.collision = true
        }
      })
    })

    return slots
  }
}))
