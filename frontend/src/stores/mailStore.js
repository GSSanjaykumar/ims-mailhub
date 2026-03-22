import { create } from 'zustand'
import axios from 'axios'

export const useMailStore = create((set, get) => ({
  mails: [],
  filteredMails: [],
  currentCategory: 'all',
  isLoading: false,
  stats: { totalEmails: 0, urgentEmails: 0, totalTasks: 0, avgConfidence: 87, aiAccuracy: '89%' },
  gmailConnected: false,
  gmailEmail: '',
  workload: [],
  toasts: [],
  searchQuery: '',
  priorityFilter: 'all',
  timeSaved: {
    totalProcessed: 0, thisWeek: 0, today: 0,
    totalTasks: 0, thisWeekTasks: 0,
    totalMinsSaved: 0, weekMinsSaved: 0, todayMinsSaved: 0,
    urgentCaught: 0, totalHoursSaved: 0, weekHoursSaved: 0
  },

  setPriorityFilter: (f) => set({ priorityFilter: f }),

  addToast: (message, type = 'info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 4000)
  },

  fetchMails: async () => {
    set({ isLoading: true })
    try {
      const res = await axios.get('/api/emails')
      const emails = res.data.emails || []
      set({ mails: emails, filteredMails: emails, isLoading: false })
      get().fetchTimeSaved()
    } catch (e) {
      set({ isLoading: false })
      console.error('Failed to fetch mails:', e)
    }
  },

  filterByCategory: (category) => {
    const { mails, searchQuery } = get()
    let filtered = mails
    if (category && category !== 'all') {
      if (category === 'urgent') {
        filtered = mails.filter(m => m.isUrgent || m.urgent)
      } else {
        filtered = mails.filter(m => m.category === category)
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(m =>
        (m.subject || '').toLowerCase().includes(q) ||
        (m.senderName || '').toLowerCase().includes(q) ||
        (m.senderEmail || '').toLowerCase().includes(q)
      )
    }
    set({ currentCategory: category, filteredMails: filtered })
  },

  searchMails: (query) => {
    const { mails, currentCategory } = get()
    set({ searchQuery: query })
    let filtered = mails
    if (currentCategory && currentCategory !== 'all') {
      if (currentCategory === 'urgent') {
        filtered = mails.filter(m => m.isUrgent || m.urgent)
      } else {
        filtered = mails.filter(m => m.category === currentCategory)
      }
    }
    if (query) {
      const q = query.toLowerCase()
      filtered = filtered.filter(m =>
        (m.subject || '').toLowerCase().includes(q) ||
        (m.senderName || '').toLowerCase().includes(q) ||
        (m.senderEmail || '').toLowerCase().includes(q)
      )
    }
    set({ filteredMails: filtered })
  },

  markRead: async (id) => {
    try {
      const res = await axios.put(`/api/emails/${id}/read`)
      const newState = res.data.isRead
      set(s => ({
        mails: s.mails.map(m => m.id === id ? { ...m, isRead: newState } : m),
        filteredMails: s.filteredMails.map(m => m.id === id ? { ...m, isRead: newState } : m)
      }))
    } catch (e) { console.error(e) }
  },

  extractFromEmail: async (sender, subject, body) => {
    try {
      const res = await axios.post('/api/emails/extract-manual', { sender, subject, body })
      const newMail = res.data
      set(s => ({
        mails: [newMail, ...s.mails],
        filteredMails: [newMail, ...s.filteredMails]
      }))
      get().fetchStats()
      get().fetchWorkload()
      get().fetchTimeSaved()
      return newMail
    } catch (e) {
      console.error(e)
      throw e
    }
  },

  syncGmail: async () => {
    const { gmailConnected, addToast } = get()
    if (!gmailConnected) {
      addToast('Connect Gmail first before syncing', 'error')
      return
    }
    addToast('Syncing Gmail inbox...', 'info')
    try {
      const res = await axios.post('/api/emails/sync')
      addToast(`✓ Synced ${res.data.synced} new emails from Gmail`, 'success')
      get().fetchMails()
      get().fetchStats()
      get().fetchWorkload()
      get().fetchTimeSaved()
    } catch (e) {
      addToast('Failed to sync Gmail: ' + (e.response?.data?.message || e.message), 'error')
    }
  },

  fetchStats: async () => {
    try {
      const res = await axios.get('/api/emails/analytics/summary')
      set({ stats: res.data })
    } catch (e) { console.error(e) }
  },

  fetchWorkload: async () => {
    try {
      const res = await axios.get('/api/emails/analytics/workload')
      set({ workload: res.data })
    } catch (e) { console.error(e) }
  },

  fetchTimeSaved: async () => {
    try {
      const res = await axios.get('/api/emails/analytics/timesaved')
      set({ timeSaved: res.data })
    } catch (e) { console.error('Failed to fetch time saved:', e) }
  },

  checkGmailStatus: async () => {
    try {
      const res = await axios.get('/oauth2/status')
      set({
        gmailConnected: res.data.connected,
        gmailEmail: res.data.email || ''
      })
    } catch (e) {
      set({ gmailConnected: false })
    }
  },

  connectGmail: async () => {
    try {
      const res = await axios.get('/oauth2/authorize')
      window.open(res.data.authUrl, '_self')
    } catch (e) {
      get().addToast('Failed to start Gmail connection', 'error')
    }
  }
}))
