import { useState } from 'react'
import { useMailStore } from '../stores/mailStore'
import ConfidenceModal from './ConfidenceModal'
import FullMailModal from './FullMailModal'

const CAT_COLORS = {
  exam: '#ef4444', assign: '#f59e0b', club: '#8b5cf6', circular: '#06b6d4',
  fee: '#10b981', placement: '#ec4899', holiday: '#6366f1', general: '#64748b'
}

const CAT_EMOJIS = {
  exam: '📝', assign: '📚', club: '🎭', circular: '📢',
  fee: '💰', placement: '💼', holiday: '🏖️', general: '📨'
}

const PRIORITY_STYLES = {
  HIGH: { bg: '#fff1f1', text: '#dc2626', border: '#fca5a5', dot: '#ef4444' },
  MEDIUM: { bg: '#fffbeb', text: '#b45309', border: '#fcd34d', dot: '#f59e0b' },
  LOW: { bg: '#f0fdf4', text: '#15803d', border: '#86efac', dot: '#22c55e' },
}

export default function MailCard({ mail }) {
  const [showTasks, setShowTasks] = useState(false)
  const [confTask, setConfTask] = useState(null)
  const [showFull, setShowFull] = useState(false)
  const { markRead } = useMailStore()

  const cat = mail.category || 'general'
  const catColor = CAT_COLORS[cat] || CAT_COLORS.general
  const tasks = mail.tasks || []
  const isRead = mail.isRead

  const timeAgo = () => {
    if (!mail.createdAt && !mail.receivedAt) return ''
    try {
      const d = new Date(mail.createdAt || mail.receivedAt)
      const mins = Math.floor((Date.now() - d.getTime()) / 60000)
      if (mins < 60) return `${mins}m ago`
      if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
      return `${Math.floor(mins / 1440)}d ago`
    } catch { return '' }
  }

  return (
    <>
      <div style={{
        background: isRead ? 'var(--surface)' : catColor + '06',
        borderRadius: 12, marginBottom: 10,
        border: `1px solid ${isRead ? 'var(--border)' : catColor + '30'}`,
        borderLeft: `4px solid ${catColor}`,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.15s',
        animation: 'fadeIn 0.3s ease',
        boxShadow: isRead ? 'none' : `0 2px 12px ${catColor}15`
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {/* Zone 1: Header */}
        <div style={{ padding: '14px 16px 10px', display: 'flex', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {!isRead ? (
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: catColor }}></div>
            ) : (
              <div style={{ width: 7, height: 7 }}></div>
            )}
            <div style={{
              width: 36, height: 36, borderRadius: 8, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 18,
              background: catColor + '14'
            }}>
              {CAT_EMOJIS[cat]}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>
                {mail.senderName || mail.senderEmail || 'Unknown'}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 10,
                background: catColor + '20', color: catColor,
                border: `1px solid ${catColor}40`,
                textTransform: 'uppercase', letterSpacing: 0.5,
                fontFamily: 'JetBrains Mono'
              }}>{cat}</span>
              {mail.isUrgent && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 10,
                  background: '#fff1f1', color: '#dc2626', border: '1px solid #fca5a5'
                }}>🚨 URGENT</span>
              )}
              {tasks.length > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 10,
                  background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe'
                }}>
                  {tasks.length} task{tasks.length > 1 ? 's' : ''}
                </span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
                {timeAgo()}
              </span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 3 }}>
              {mail.subject}
            </div>
            <div style={{
              fontSize: 12, color: 'var(--muted)', lineHeight: 1.4,
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {mail.aiSummary && !mail.aiSummary.startsWith('Email processed:') 
                ? mail.aiSummary 
                : mail.bodyClean || mail.bodyRaw || ''}
            </div>
          </div>
        </div>

        {/* Zone 2: Tasks (collapsible) */}
        {showTasks && tasks.length > 0 && (
          <div style={{
            padding: '10px 16px', background: '#f8f9fc',
            borderTop: '1px solid var(--border)', animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)', marginBottom: 8 }}>
              🤖 AI Extracted Tasks ({tasks.length} task{tasks.length > 1 ? 's' : ''})
            </div>
            {tasks.map((task, i) => {
              const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM
              const conf = task.confidenceScore || 70
              const confColor = conf >= 85 ? '#22c55e' : conf >= 70 ? '#f59e0b' : '#ef4444'
              return (
                <div key={task.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  borderRadius: 6, marginBottom: 4, background: '#fff',
                  border: '1px solid var(--border)'
                }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                    background: ps.bg, color: ps.text, border: `1px solid ${ps.border}`,
                    whiteSpace: 'nowrap'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: ps.dot }}></span>
                    {task.priority}
                  </span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                    {task.title}
                  </span>
                  {task.dueRaw && (
                    <span style={{
                      fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono',
                      whiteSpace: 'nowrap'
                    }}>📅 {task.dueRaw}</span>
                  )}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8,
                    background: confColor + '14', color: confColor,
                    fontFamily: 'JetBrains Mono'
                  }}>{conf}%</span>
                  <button onClick={() => setConfTask(task)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, padding: 2
                  }} title="View confidence breakdown">
                    🔍
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Zone 3: Footer */}
        <div style={{
          padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8,
          borderTop: '1px solid var(--border)', fontSize: 12
        }}>
          <button onClick={() => markRead(mail.id)} style={{
            background: isRead ? '#f0fdf4' : 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 4, width: 22, height: 22, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 12,
            color: isRead ? '#22c55e' : 'var(--muted)', transition: 'all 0.15s'
          }}>
            {isRead ? '✓' : '○'}
          </button>
          <button onClick={() => setShowTasks(!showTasks)} style={{
            padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
            background: showTasks ? '#eff6ff' : 'var(--surface)',
            color: showTasks ? '#3b82f6' : 'var(--sub)',
            fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'Nunito',
            transition: 'all 0.15s'
          }}>
            {showTasks ? '▲' : '▼'} {showTasks ? 'Hide' : 'Show'} Tasks ({tasks.length})
          </button>
          <button onClick={() => setShowFull(true)} style={{
            padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--sub)',
            fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'Nunito'
          }}>
            👁️ View Full Mail
          </button>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
            {mail.senderEmail}
          </span>
        </div>
      </div>

      {confTask && <ConfidenceModal task={confTask} onClose={() => setConfTask(null)} />}
      {showFull && <FullMailModal mail={mail} onClose={() => setShowFull(false)} />}
    </>
  )
}
