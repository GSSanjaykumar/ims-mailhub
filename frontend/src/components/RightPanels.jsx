import { useState, useEffect } from 'react'
import { useMailStore } from '../stores/mailStore'
import WorkloadChart from './WorkloadChart'

const CAT_COLORS = {
  exam: '#ef4444', assign: '#f59e0b', club: '#8b5cf6', circular: '#06b6d4',
  fee: '#10b981', placement: '#ec4899', holiday: '#6366f1', general: '#64748b'
}

const CATEGORIES = [
  { key: 'exam', label: 'Exam/CAT', icon: '📝',
    color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', glow: 'rgba(239,68,68,0.15)' },
  { key: 'assign', label: 'Assignments', icon: '📚',
    color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', glow: 'rgba(59,130,246,0.15)' },
  { key: 'club', label: 'Club Events', icon: '🎭',
    color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', glow: 'rgba(139,92,246,0.15)' },
  { key: 'circular', label: 'Circulars', icon: '📢',
    color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc', glow: 'rgba(6,182,212,0.15)' },
  { key: 'fee', label: 'Fee/Payment', icon: '💰',
    color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', glow: 'rgba(245,158,11,0.15)' },
  { key: 'placement', label: 'Placement', icon: '💼',
    color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0', glow: 'rgba(16,185,129,0.15)' },
  { key: 'holiday', label: 'Holidays', icon: '🏖️',
    color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', glow: 'rgba(99,102,241,0.15)' },
  { key: 'general', label: 'General', icon: '📨',
    color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', glow: 'rgba(100,116,139,0.10)' },
]

export default function RightPanels() {
  const { mails, workload, filterByCategory, timeSaved, fetchTimeSaved } = useMailStore()
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())

  useEffect(() => { fetchTimeSaved() }, [])

  const formatTime = (mins) => {
    if (!mins || mins === 0) return '0 min'
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  // Build deadline timeline from tasks
  const allTasks = mails.flatMap(m => (m.tasks || []).map(t => ({ ...t, mailSubject: m.subject })))

  const formatDue = (dueRaw) => {
    if (!dueRaw || dueRaw === 'No deadline') return null
    try {
      const d = new Date(dueRaw)
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    } catch {}
    return dueRaw
  }

  const upcoming = allTasks
    .filter(t => t.dueRaw && t.dueRaw !== 'No deadline')
    .sort((a, b) => new Date(a.dueRaw) - new Date(b.dueRaw))
    .slice(0, 6)

  return (
    <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Time Saved Tracker */}
      <div style={{
        background: 'linear-gradient(135deg, #1b1f3a 0%, #252a4a 100%)',
        borderRadius: 12, padding: 16,
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>
            ⏱ Time Saved Tracker
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
            background: 'rgba(34,197,94,0.2)', color: '#22c55e',
            fontFamily: 'JetBrains Mono', border: '1px solid rgba(34,197,94,0.3)'
          }}>LIVE</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{
            fontSize: 36, fontWeight: 800, color: '#22c55e',
            fontFamily: 'JetBrains Mono', lineHeight: 1
          }}>
            {formatTime(timeSaved.weekMinsSaved)}
          </div>
          <div style={{ fontSize: 11, color: '#8890b0', marginTop: 4 }}>
            saved this week
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Emails Processed', value: timeSaved.totalProcessed, icon: '✉️', color: '#3b82f6' },
            { label: 'Tasks Extracted', value: timeSaved.totalTasks, icon: '✅', color: '#8b5cf6' },
            { label: 'This Week', value: timeSaved.thisWeek + ' emails', icon: '📅', color: '#f59e0b' },
            { label: 'Urgent Caught', value: timeSaved.urgentCaught, icon: '🚨', color: '#ef4444' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 8,
              padding: '8px 10px', border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 9, color: '#6b70a0', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: '#8890b0' }}>Total time saved</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', fontFamily: 'JetBrains Mono' }}>
              {formatTime(timeSaved.totalMinsSaved)}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: Math.min(100, (timeSaved.totalMinsSaved / 120) * 100) + '%',
              background: 'linear-gradient(90deg, #22c55e, #3b82f6)',
              transition: 'width 1s ease'
            }}></div>
          </div>
          <div style={{ fontSize: 9, color: '#6b70a0', marginTop: 3 }}>
            Goal: 2 hours saved · {Math.round((timeSaved.totalMinsSaved / 120) * 100)}% reached
          </div>
        </div>

        <div style={{
          background: 'rgba(34,197,94,0.08)', borderRadius: 8, padding: '8px 10px',
          border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center'
        }}>
          <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>
            🎯 Manual: 3 min/email · AI: 4 sec/email · 
            <strong> {Math.round(((3*60 - 4) / (3*60)) * 100)}% faster</strong>
          </span>
        </div>
      </div>

      {/* Deadline Timeline */}
      <div style={{
        background: 'var(--surface)', borderRadius: 12, padding: 16,
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 12 }}>
          📅 Deadline Timeline
        </div>
        {upcoming.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: 16 }}>
            No upcoming deadlines
          </div>
        ) : (
          upcoming.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: t.priority === 'HIGH' ? '#ef4444' : t.priority === 'MEDIUM' ? '#f59e0b' : '#22c55e',
                  border: '2px solid #fff', boxShadow: '0 0 0 2px ' + (t.priority === 'HIGH' ? '#ef4444' : t.priority === 'MEDIUM' ? '#f59e0b' : '#22c55e')
                }}></div>
                {i < upcoming.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 4 }}></div>
                )}
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                  📅 {formatDue(t.dueRaw) || t.dueRaw}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Calendar */}
      {(() => {
        const today = new Date()
        const firstDay = new Date(calYear, calMonth, 1).getDay()
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
        const dayLabels = ['Su','Mo','Tu','We','Th','Fr','Sa']
        const taskCounts = {}
        const collisionDates = {}
        const taskLabels = {}
        const allCalTasks = mails.flatMap(m => m.tasks || [])
        allCalTasks.forEach(task => {
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
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 12 }}>📅 Task Calendar</div>
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
          </div>
        )
      })()}

      {/* Category Legend */}
      <div style={{
        background: 'var(--surface)', borderRadius: 12, padding: 16,
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 10 }}>
          🏷️ Categories
        </div>
        {CATEGORIES.map(cat => {
          const count = mails.filter(m => m.category === cat.key).length
          return (
            <div key={cat.key}
              onClick={() => filterByCategory(cat.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6,
                cursor: 'pointer', marginBottom: 2,
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: CAT_COLORS[cat.key]
              }}></div>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: 'var(--sub)' }}>
                {cat.icon} {cat.label}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, color: 'var(--muted)',
                fontFamily: 'JetBrains Mono'
              }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
