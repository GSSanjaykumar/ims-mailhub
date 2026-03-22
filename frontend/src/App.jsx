import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Main from './components/Main'
import TaskDashboard from './components/TaskDashboard'
import Toast from './components/Toast'
import { useEffect } from 'react'
import { useMailStore } from './stores/mailStore'

export default function App() {
  const { fetchMails, fetchStats, fetchWorkload, checkGmailStatus, addToast } = useMailStore()
  const location = useLocation()

  useEffect(() => {
    fetchMails()
    fetchStats()
    fetchWorkload()
    checkGmailStatus()

    // Check for Gmail connected redirect
    const params = new URLSearchParams(window.location.search)
    if (params.get('gmail') === 'connected') {
      addToast('✓ Gmail connected successfully!', 'success')
      checkGmailStatus()
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/tasks" element={<TaskDashboard />} />
      </Routes>
      <Toast />
    </div>
  )
}
