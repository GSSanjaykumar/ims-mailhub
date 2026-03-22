import { useEffect, useState } from 'react'
import { useTaskStore } from '../stores/taskStore'
import FullMailModal from './FullMailModal'
import axios from 'axios'

const PRI = {
  HIGH: { bg: '#fff1f1', text: '#dc2626', border: '#fca5a5', dot: '#ef4444' },
  MEDIUM: { bg: '#fffbeb', text: '#b45309', border: '#fcd34d', dot: '#f59e0b' },
  LOW: { bg: '#f0fdf4', text: '#15803d', border: '#86efac', dot: '#22c55e' },
}

const TAG_RULES = [
  { kw: ['submit', 'assignment', 'project'], label: 'assign', bg: '#f5f3ff', color: '#7c3aed' },
  { kw: ['exam', 'test', 'cat', 'CAT'], label: 'exam', bg: '#fef2f2', color: '#dc2626' },
  { kw: ['pay', 'fee', 'Rs', 'rs', 'payment'], label: 'fee', bg: '#f0fdf4', color: '#059669' },
  { kw: ['register', 'registration', 'enroll'], label: 'register', bg: '#eff6ff', color: '#2563eb' },
  { kw: ['deadline', 'due', 'last date'], label: 'deadline', bg: '#fff7ed', color: '#c2410c' },
]

const deriveTags = (title) => {
  if (!title) return []
  const t = title.toLowerCase()
  return TAG_RULES.filter(r => r.kw.some(k => t.includes(k.toLowerCase())))
}

const FILTERS = [
  { key: 'all', label: 'All', icon: '' },
  { key: 'HIGH', label: 'High', icon: '●', color: '#ef4444' },
  { key: 'MEDIUM', label: 'Medium', icon: '●', color: '#f59e0b' },
  { key: 'LOW', label: 'Low', icon: '●', color: '#22c55e' },
  { key: 'collision', label: 'Collision', icon: '⚡' },
  { key: 'review', label: 'Review', icon: '🔍' },
]

const barColor = (count) => count >= 5 ? '#ef4444' : count >= 3 ? '#f97316' : '#22c55e'

const DEEP_LINKS = {
  fee: { label: '💳 Fee Portal', url: 'https://www.google.com/search?q=college+fee+payment+portal' },
  exam: { label: '📝 Exam Portal', url: 'https://www.google.com/search?q=college+exam+hall+ticket+download' },
  lms: { label: '📚 Open LMS', url: 'https://www.google.com/search?q=college+LMS+submission+portal' },
  assign: { label: '📚 Open LMS', url: 'https://www.google.com/search?q=college+LMS+submission+portal' },
  placement: { label: '💼 Placement Portal', url: 'https://www.google.com/search?q=TCS+NQT+registration+portal' },
}

export default function TaskDashboard() {
  const { tasks, filter, fetchTasks, setFilter, getFilteredTasks, getStats, toggleDone, getWorkloadByDay, updateTask } = useTaskStore()
  const [sender, setSender] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [toast, setToast] = useState(null)
  const [viewingMail, setViewingMail] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())

  useEffect(() => { fetchTasks() }, [])

  const stats = getStats()
  const filtered = getFilteredTasks()
  const workload = getWorkloadByDay()
  const collisionCount = tasks.filter(t => t.hasCollision).length

  const handleExtract = async () => {
    if (!sender || !subject || !body) return
    setExtracting(true)
    try {
      const res = await axios.post('/api/emails/extract-manual', { sender, subject, body })
      const taskCount = res.data.tasks?.length || 0
      setToast(`✓ ${taskCount} new task${taskCount !== 1 ? 's' : ''} extracted`)
      setSender(''); setSubject(''); setBody('')
      fetchTasks()
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      setToast('⚠ Extraction failed: ' + (e.response?.data?.message || e.message))
      setTimeout(() => setToast(null), 4000)
    }
    setExtracting(false)
  }

  const formatDate = (d) => {
    if (!d) return null
    try {
      const dt = new Date(d)
      return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return d }
  }

  const viewEmail = async (task) => {
    try {
      const res = await axios.get('/api/emails/' + task.emailId)
      const emailData = res.data
      if (!emailData.tasks || emailData.tasks.length === 0) {
        emailData.tasks = [task]
      }
      if (!emailData.bodyClean && !emailData.bodyRaw) {
        emailData.bodyClean = task.email?.bodyClean || 
          'Original email body not stored. Task extracted: ' + task.title
      }
      setViewingMail(emailData)
    } catch (e) {
      setViewingMail({
        id: task.emailId,
        subject: task.email?.subject || task.title,
        senderName: task.email?.senderName || task.senderName || 'Unknown Sender',
        senderEmail: task.email?.senderEmail || task.senderEmail || '',
        aiSummary: task.email?.aiSummary || task.title,
        bodyClean: task.email?.bodyClean || task.email?.bodyRaw || 
          `Task extracted from this email:\n\n• ${task.title}\n  Priority: ${task.priority}\n  Due: ${task.dueRaw || 'No deadline'}\n  Confidence: ${task.confidenceScore || 70}%`,
        category: task.email?.category || 'general',
        isUrgent: task.email?.isUrgent || false,
        receivedAt: task.email?.receivedAt || task.createdAt,
        tasks: [task]
      })
    }
  }

  const startEdit = (task) => {
    setEditingTask(task.id)
    setEditForm({
      title: task.title || '',
      priority: task.priority || 'MEDIUM',
      dueRaw: task.dueRaw || '',
      status: task.status || 'ACTIVE'
    })
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditForm({})
  }

  const saveEdit = async (taskId) => {
    try {
      const payload = {
        title: editForm.title,
        priority: editForm.priority,
        dueRaw: editForm.dueRaw,
        status: editForm.status
      }

      console.log('Saving task', taskId, payload)

      const res = await axios.put('/api/tasks/' + taskId, payload)
      console.log('Save response:', res.data)

      // Close edit form first
      setEditingTask(null)
      setEditForm({})

      // Wait 500ms then fetch fresh data
      setTimeout(async () => {
        await fetchTasks()
      }, 500)

    } catch (e) {
      console.error('Save failed:', e)
      console.error('Response:', e.response?.data)
      alert('Save failed: ' + (e.response?.data?.message || e.message))
    }
  }

  const addToGoogleCalendar = (task) => {
    let startDate = ''
    let endDate = ''
    try {
      const due = task.dueDate || task.dueRaw
      if (due) {
        const d = new Date(due)
        if (!isNaN(d.getTime())) {
          const pad = n => String(n).padStart(2, '0')
          const year = d.getFullYear()
          const month = pad(d.getMonth() + 1)
          const day = pad(d.getDate())
          startDate = `${year}${month}${day}T090000`
          endDate = `${year}${month}${day}T100000`
        }
      }
    } catch (e) {}
    const title = encodeURIComponent(task.title || 'Task')
    const details = encodeURIComponent(
      `Priority: ${task.priority || 'MEDIUM'}\n` +
      `AI Confidence: ${task.confidenceScore || 70}%\n` +
      `Source: IMS Smart Mail Hub\n` +
      `Email ID: ${task.emailId}`
    )
    const location = encodeURIComponent('College')
    let calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE`
    calUrl += `&text=${title}&details=${details}&location=${location}`
    if (startDate) calUrl += `&dates=${startDate}/${endDate}`
    window.open(calUrl, '_blank')
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)', padding: '0 24px 24px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 13,
          background: toast.startsWith('✓') ? '#22c55e' : '#ef4444', color: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'fadeIn 0.3s ease'
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 0 12px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', fontFamily: 'JetBrains Mono', letterSpacing: 1 }}>
              IMS · SMART EMAIL TASK MODULE
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>
              Smart Task Dashboard
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              IMS Portal / Smart Tools / Task Dashboard
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)',
              fontFamily: 'JetBrains Mono'
            }}>● AI ENGINE ON</span>
            <button style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--sub)', fontWeight: 600, fontSize: 11,
              cursor: 'pointer', fontFamily: 'Nunito'
            }}>🔔 Alerts</button>
            <span style={{
              fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--muted)', textAlign: 'right'
            }}>PROTOTYPE v1.0<br/>Academic Year 2024-25</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Total Tasks', value: stats.total, sub: `+${Math.min(stats.total, 3)} from yesterday`, color: '#3b82f6', icon: '📋' },
          { label: 'High Priority', value: stats.high, sub: `${stats.high} need review`, color: '#f97316', icon: '🔥' },
          { label: 'Collisions Detected', value: stats.collisions, sub: 'overloaded days', color: '#eab308', icon: '⚡' },
          { label: 'Avg AI Confidence', value: stats.avg + '%', sub: '+5% this week', color: '#22c55e', icon: '🎯' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)', borderRadius: 12, padding: 16,
            border: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -8, right: -8, fontSize: 48, opacity: 0.06 }}>{s.icon}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Left: Task List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
              Your Tasks — <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{filtered.length} active</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  padding: '4px 12px', borderRadius: 20, border: '1px solid ' + (filter === f.key ? '#3b82f6' : 'var(--border)'),
                  background: filter === f.key ? '#eff6ff' : 'var(--surface)',
                  color: filter === f.key ? '#3b82f6' : 'var(--sub)',
                  fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'Nunito',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  {f.icon && <span style={{ color: f.color }}>{f.icon}</span>}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Task Cards */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 40, background: 'var(--surface)', borderRadius: 12,
              border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 13
            }}>No tasks found for this filter.</div>
          ) : filtered.map(task => {
            const ps = PRI[task.priority] || PRI.MEDIUM
            const conf = task.confidenceScore || 70
            const confColor = conf >= 85 ? '#22c55e' : conf >= 65 ? '#f59e0b' : '#ef4444'
            const tags = deriveTags(task.title)
            const done = task.status === 'DONE'
            const dl = task.deepLinkModule

            return (
              <div key={task.id} style={{
                background: 'var(--surface)', borderRadius: 12, marginBottom: 10,
                border: '1px solid var(--border)', overflow: 'hidden',
                opacity: done ? 0.6 : 1, transition: 'all 0.2s'
              }}>
                <div style={{ padding: 16 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <button onClick={() => toggleDone(task.id)} style={{
                      width: 22, height: 22, borderRadius: 4, border: '2px solid ' + (done ? '#22c55e' : 'var(--border)'),
                      background: done ? '#f0fdf4' : '#fff', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#22c55e',
                      flexShrink: 0, marginTop: 2
                    }}>{done ? '✓' : ''}</button>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 14, color: 'var(--ink)',
                        textDecoration: done ? 'line-through' : 'none'
                      }}>{task.title}</div>
                    </div>
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                      fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 10,
                      background: ps.bg, color: ps.text, border: `1px solid ${ps.border}`, whiteSpace: 'nowrap'
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ps.dot }}></span>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => startEdit(task)}
                      title="Edit task"
                      style={{
                        background: 'none', border: '1px solid var(--border)',
                        borderRadius: 6, padding: '2px 8px', cursor: 'pointer',
                        fontSize: 11, color: 'var(--muted)', marginLeft: 4,
                      }}
                    >
                      ✏️ Edit
                    </button>
                  </div>

                  {/* Collision Warning */}
                  {task.hasCollision && (
                    <div style={{
                      margin: '8px 0 0 32px', padding: '6px 10px', borderRadius: 6,
                      background: '#fffbeb', border: '1px solid #fcd34d',
                      fontSize: 11, color: '#b45309', fontWeight: 500
                    }}>
                      ⚡ Workload Collision Detected — {task.collisionDetail || 'You already have another task on this day.'} <span style={{ color: '#3b82f6', cursor: 'pointer' }}>(click to resolve)</span>
                    </div>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, marginLeft: 32 }}>
                      {tags.map(tag => (
                        <span key={tag.label} style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                          background: tag.bg, color: tag.color, textTransform: 'uppercase'
                        }}>{tag.label}</span>
                      ))}
                    </div>
                  )}

                  {/* Confidence Bar */}
                  <div style={{ margin: '10px 0 0 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', whiteSpace: 'nowrap' }}>AI Conf.</div>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ width: conf + '%', height: '100%', borderRadius: 3, background: confColor, transition: 'width 0.5s ease' }}></div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: confColor, fontFamily: 'JetBrains Mono', minWidth: 32, textAlign: 'right' }}>{conf}%</span>
                    </div>
                    <div style={{ fontSize: 9, color: confColor, fontWeight: 600, marginTop: 2, marginLeft: 50 }}>
                      {conf >= 85 ? '✓ High Confidence' : conf >= 65 ? '⚠ Moderate — Review Suggested' : '⚠ Low Confidence — Manual Review Required'}
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {editingTask === task.id && (
                    <div style={{
                      background:'#f8f9fc', borderRadius:8, padding:14,
                      border:'1px solid #bfdbfe', margin:'10px 0 0 32px',
                      animation:'fadeIn 0.2s ease'
                    }}>
                      <div style={{fontSize:11,fontWeight:700,color:'#3b82f6',marginBottom:10}}>
                        ✏️ EDITING TASK
                      </div>

                      <label style={{fontSize:11,fontWeight:600,color:'var(--sub)',display:'block',marginBottom:4}}>
                        Task Title
                      </label>
                      <input
                        value={editForm.title}
                        onChange={e => setEditForm(f => ({...f, title: e.target.value}))}
                        style={{width:'100%',padding:'8px 10px',borderRadius:6,
                          border:'1px solid #bfdbfe',fontSize:13,fontFamily:'Nunito',
                          outline:'none',marginBottom:10,color:'var(--ink)',background:'#fff',
                          boxSizing:'border-box'}}
                      />

                      <div style={{display:'flex',gap:10,marginBottom:10}}>
                        <div style={{flex:1}}>
                          <label style={{fontSize:11,fontWeight:600,color:'var(--sub)',display:'block',marginBottom:4}}>
                            Priority
                          </label>
                          <select
                            value={editForm.priority}
                            onChange={e => setEditForm(f => ({...f, priority: e.target.value}))}
                            style={{width:'100%',padding:'8px 10px',borderRadius:6,
                              border:'1px solid #bfdbfe',fontSize:12,fontFamily:'Nunito',
                              outline:'none',color:'var(--ink)',background:'#fff',cursor:'pointer'}}
                          >
                            <option value="HIGH">🔴 HIGH</option>
                            <option value="MEDIUM">🟡 MEDIUM</option>
                            <option value="LOW">🟢 LOW</option>
                          </select>
                        </div>
                        <div style={{flex:1}}>
                          <label style={{fontSize:11,fontWeight:600,color:'var(--sub)',display:'block',marginBottom:4}}>
                            Status
                          </label>
                          <select
                            value={editForm.status}
                            onChange={e => setEditForm(f => ({...f, status: e.target.value}))}
                            style={{width:'100%',padding:'8px 10px',borderRadius:6,
                              border:'1px solid #bfdbfe',fontSize:12,fontFamily:'Nunito',
                              outline:'none',color:'var(--ink)',background:'#fff',cursor:'pointer'}}
                          >
                            <option value="ACTIVE">⚡ Active</option>
                            <option value="PENDING_REVIEW">🔍 Pending Review</option>
                            <option value="DONE">✅ Done</option>
                            <option value="SYNCED">🔄 Synced</option>
                          </select>
                        </div>
                      </div>

                      <label style={{fontSize:11,fontWeight:600,color:'var(--sub)',display:'block',marginBottom:4}}>
                        Due Date (e.g. Apr 8, 2026)
                      </label>
                      <input
                        value={editForm.dueRaw}
                        onChange={e => setEditForm(f => ({...f, dueRaw: e.target.value}))}
                        placeholder="Apr 8, 2026"
                        style={{width:'100%',padding:'8px 10px',borderRadius:6,
                          border:'1px solid #bfdbfe',fontSize:13,fontFamily:'JetBrains Mono',
                          outline:'none',marginBottom:12,color:'var(--ink)',background:'#fff',
                          boxSizing:'border-box'}}
                      />

                      <div style={{display:'flex',gap:8}}>
                        <button
                          onClick={() => saveEdit(task.id)}
                          style={{flex:1,padding:'8px 0',borderRadius:6,border:'none',
                            background:'linear-gradient(135deg,#3b82f6,#2563eb)',
                            color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer',
                            fontFamily:'Nunito'}}
                        >
                          ✓ Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{padding:'8px 16px',borderRadius:6,
                            border:'1px solid var(--border)',
                            background:'var(--surface)',color:'var(--sub)',
                            fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'Nunito'}}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Date row */}
                  <div style={{ margin: '8px 0 0 32px', display: 'flex', gap: 12, fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
                    <span>📅 {formatDate(task.dueRaw) || task.dueRaw || 'No deadline'}</span>
                    <span>👤 Me</span>
                    {task.email?.senderName && <span>👨‍🏫 {task.email.senderName}</span>}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ margin: '10px 0 0 32px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, alignSelf: 'center', marginRight: 4 }}>TAKE ME THERE</span>
                    <ActionBtn label="👁 View Email" onClick={() => viewEmail(task)} />
                    {dl && dl !== 'none' && DEEP_LINKS[dl] && (
                      <ActionBtn label={DEEP_LINKS[dl].label} onClick={() => window.open(DEEP_LINKS[dl].url, '_blank')} />
                    )}
                    <ActionBtn label="📅 Calendar" onClick={() => addToGoogleCalendar(task)} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Sidebar */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Task Calendar */}
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>📅 Task Calendar</div>
              {collisionCount > 0 && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                  background: '#fff1f1', color: '#dc2626', border: '1px solid #fca5a5'
                }}>{collisionCount} CONFLICT{collisionCount > 1 ? 'S' : ''}</span>
              )}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>Task deadlines — collisions flagged</div>

            {(() => {
              const today = new Date()
              const firstDay = new Date(calYear, calMonth, 1).getDay()
              const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
              const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
              const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa']
              const taskCounts = {}
              const collisionDates = {}
              const taskLabels = {}
              tasks.forEach(task => {
                let d = null
                if (task.dueDate) {
                  d = new Date(task.dueDate)
                } else if (task.dueRaw && task.dueRaw !== 'No deadline' && task.dueRaw !== '') {
                  d = new Date(task.dueRaw)
                }
                if (!d || isNaN(d.getTime())) return
                if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
                  const key = d.getDate()
                  taskCounts[key] = (taskCounts[key] || 0) + 1
                  if (task.hasCollision) collisionDates[key] = true
                  if (!taskLabels[key]) taskLabels[key] = []
                  taskLabels[key].push(task.title)
                }
              })
              return (
                <>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8 }}>
                    <button
                      onClick={() => {
                        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
                        else setCalMonth(m => m - 1)
                      }}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, width: 24, height: 24, cursor: 'pointer', fontSize: 14, color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                    >‹</button>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>
                      {monthNames[calMonth]} {calYear}
                    </span>
                    <button
                      onClick={() => {
                        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
                        else setCalMonth(m => m + 1)
                      }}
                      style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, width: 24, height: 24, cursor: 'pointer', fontSize: 14, color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                    >›</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
                    {dayLabels.map(d => (
                      <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--muted)', padding: '2px 0', fontFamily: 'JetBrains Mono' }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                    {Array(firstDay).fill(null).map((_, i) => <div key={'e'+i}></div>)}
                    {Array(daysInMonth).fill(null).map((_, i) => {
                      const day = i + 1
                      const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()
                      const tc = taskCounts[day] || 0
                      const hc = collisionDates[day]
                      let bg = 'transparent', clr = 'var(--sub)', bdr = '1px solid transparent'
                      if (isToday) { bg = '#3b82f6'; clr = '#fff'; bdr = 'none' }
                      else if (hc) { bg = 'rgba(239,68,68,0.15)'; clr = '#ef4444'; bdr = '1px solid rgba(239,68,68,0.3)' }
                      else if (tc >= 3) { bg = 'rgba(239,68,68,0.1)'; clr = '#ef4444' }
                      else if (tc === 2) { bg = 'rgba(249,115,22,0.1)'; clr = '#f97316' }
                      else if (tc === 1) { bg = 'rgba(34,197,94,0.1)'; clr = '#22c55e' }
                      return (
                        <div key={day} title={taskLabels[day] ? taskLabels[day].join(', ') : ''} style={{ textAlign: 'center', padding: '4px 2px', borderRadius: 6, background: bg, color: clr, border: bdr, fontSize: 11, fontWeight: isToday ? 700 : tc > 0 ? 600 : 400, fontFamily: 'JetBrains Mono', minHeight: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: tc > 0 ? 'pointer' : 'default' }}>
                          {day}
                          {tc > 0 && <div style={{ fontSize: 8, lineHeight: 1, opacity: 0.8, marginTop: 1 }}>{tc}t{hc ? '⚡' : ''}</div>}
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', fontSize: 10, color: 'var(--muted)' }}>
                    <span><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:'rgba(34,197,94,0.3)',marginRight:3}}></span>1 task</span>
                    <span><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:'rgba(249,115,22,0.3)',marginRight:3}}></span>2 tasks</span>
                    <span><span style={{display:'inline-block',width:8,height:8,borderRadius:2,background:'rgba(239,68,68,0.3)',marginRight:3}}></span>3+</span>
                    <span>⚡ collision</span>
                  </div>
                </>
              )
            })()}
          </div>

          {/* Extract Panel */}
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}></span>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>Extract Tasks from Email</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 12 }}>Paste faculty/admin email below</div>

            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--sub)', letterSpacing: 0.5 }}>FROM (SENDER)</label>
            <input value={sender} onChange={e => setSender(e.target.value)} placeholder="professor@college.edu"
              style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 8, fontSize: 12, fontFamily: 'Nunito', background: 'var(--bg)', color: 'var(--ink)', boxSizing: 'border-box' }} />

            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--sub)', letterSpacing: 0.5 }}>SUBJECT</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..."
              style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 8, fontSize: 12, fontFamily: 'Nunito', background: 'var(--bg)', color: 'var(--ink)', boxSizing: 'border-box' }} />

            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--sub)', letterSpacing: 0.5 }}>EMAIL BODY</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Paste email content here..."
              style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', marginBottom: 10, fontSize: 12, fontFamily: 'Nunito', background: 'var(--bg)', color: 'var(--ink)', resize: 'vertical', boxSizing: 'border-box' }} />

            <button onClick={handleExtract} disabled={extracting} style={{
              width: '100%', padding: '8px 16px', borderRadius: 6, border: 'none',
              background: extracting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff', fontWeight: 700, fontSize: 12, cursor: extracting ? 'wait' : 'pointer',
              fontFamily: 'Nunito'
            }}>
              {extracting ? '⏳ Extracting...' : '🤖 Extract Tasks'}
            </button>
          </div>
        </div>
      </div>

      {/* Full Mail Modal */}
      {viewingMail && (
        <FullMailModal mail={viewingMail} onClose={() => setViewingMail(null)} />
      )}
    </div>
  )
}

function ActionBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)',
      background: 'var(--surface)', color: 'var(--sub)', fontWeight: 600, fontSize: 10,
      cursor: 'pointer', fontFamily: 'Nunito', transition: 'all 0.15s'
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)' }}
    >{label}</button>
  )
}
