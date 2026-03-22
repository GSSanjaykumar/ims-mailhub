import { useState } from 'react'
import { useMailStore } from '../stores/mailStore'
import { useNavigate, useLocation } from 'react-router-dom'

const CATEGORIES = [
  { key: 'all', label: 'All', icon: '📨', color: '#3b82f6' },
  { key: 'urgent', label: 'Urgent', icon: '🚨', color: '#ef4444' },
  { key: 'exam', label: 'Exam', icon: '📝', color: '#ef4444' },
  { key: 'assign', label: 'Assignments', icon: '📚', color: '#f59e0b' },
  { key: 'club', label: 'Club', icon: '🎭', color: '#8b5cf6' },
  { key: 'circular', label: 'Circulars', icon: '📢', color: '#06b6d4' },
  { key: 'fee', label: 'Fee', icon: '💰', color: '#10b981' },
  { key: 'placement', label: 'Placement', icon: '💼', color: '#ec4899' },
  { key: 'holiday', label: 'Holidays', icon: '🏖️', color: '#6366f1' },
]

const PORTAL_NAV = [
  { label: 'Dashboard', icon: '🏠' },
  { label: 'Timetable', icon: '📅' },
  { label: 'Attendance', icon: '✅' },
  { label: 'Marks', icon: '📊' },
  { label: 'Fee Payment', icon: '💳' },
]

export default function Sidebar() {
  const { currentCategory, filterByCategory, mails, gmailConnected, gmailEmail, connectGmail, syncGmail } = useMailStore()
  const [showGmailMenu, setShowGmailMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const getCategoryCount = (key) => {
    if (key === 'all') return mails.length
    if (key === 'urgent') return mails.filter(m => m.isUrgent || m.urgent).length
    return mails.filter(m => m.category === key).length
  }

  const highCount = mails.reduce((acc, m) => acc + (m.tasks || []).filter(t => t.priority === 'HIGH').length, 0)
  const isTaskPage = location.pathname === '/tasks'
  const isMailPage = location.pathname === '/'

  return (
    <aside style={{
      width: 240, minWidth: 240, height: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
      display: 'flex', flexDirection: 'column', color: '#c8cde0',
      overflow: 'auto', flexShrink: 0
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: '#fff',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}>✉</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: 1 }}>IMS</div>
            <div style={{ fontSize: 11, color: '#8890b0', letterSpacing: 0.5 }}>Smart Mail Hub</div>
          </div>
        </div>
        <div style={{
          marginTop: 8, fontFamily: 'JetBrains Mono', fontSize: 9, color: '#818cf8',
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          padding: '3px 8px', borderRadius: 4,
          letterSpacing: 0.5, display: 'inline-block'
        }}>
          AI-POWERED · DESIGNATHON 2026
        </div>
      </div>

      {/* User Profile */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 13, color: '#fff'
          }}>SK</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>Sanjay Kumar</div>
            <div style={{ fontSize: 11, color: '#8890b0' }}>Roll: 21CS045</div>
            <div style={{ fontSize: 10, color: '#6b70a0' }}>CSE · Sem 5</div>
          </div>
        </div>
      </div>

      {/* PORTAL Nav */}
      <div style={{ padding: '12px 12px 4px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#6b70a0', letterSpacing: 1.5, marginBottom: 6, paddingLeft: 4 }}>PORTAL</div>
        {PORTAL_NAV.map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
            borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#8890b0',
            opacity: 0.6, transition: 'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sidebar-h)'; e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.6' }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* SMART TOOLS Nav */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#6b70a0', letterSpacing: 1.5, marginBottom: 6, paddingLeft: 4 }}>SMART TOOLS</div>
        <div onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderRadius: 6, cursor: 'pointer', fontSize: 13, marginBottom: 1,
          background: isMailPage ? 'rgba(59,130,246,0.12)' : 'transparent',
          color: isMailPage ? '#fff' : '#c8cde0',
          fontWeight: isMailPage ? 700 : 500, transition: 'all 0.15s'
        }}
          onMouseEnter={e => { if (!isMailPage) e.currentTarget.style.background = 'var(--sidebar-h)' }}
          onMouseLeave={e => { if (!isMailPage) e.currentTarget.style.background = 'transparent' }}
        >
          <span style={{ fontSize: 14 }}>✉️</span>
          <span style={{ flex: 1 }}>Smart Mail Hub</span>
        </div>
        <div onClick={() => navigate('/tasks')} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
          borderRadius: 6, cursor: 'pointer', fontSize: 13, marginBottom: 1,
          background: isTaskPage ? 'rgba(59,130,246,0.12)' : 'transparent',
          color: isTaskPage ? '#fff' : '#c8cde0',
          fontWeight: isTaskPage ? 700 : 500, transition: 'all 0.15s'
        }}
          onMouseEnter={e => { if (!isTaskPage) e.currentTarget.style.background = 'var(--sidebar-h)' }}
          onMouseLeave={e => { if (!isTaskPage) e.currentTarget.style.background = 'transparent' }}
        >
          <span style={{ fontSize: 14 }}>✅</span>
          <span style={{ flex: 1 }}>Task Dashboard</span>
          {highCount > 0 && (
            <span style={{
              background: '#ef4444', color: '#fff',
              fontSize: 10, fontWeight: 700,
              padding: '1px 7px', borderRadius: 10, minWidth: 20, textAlign: 'center'
            }}>{highCount}</span>
          )}
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 4px' }}></div>
      </div>

      {/* SMART MAIL Nav */}
      <div style={{ padding: '8px 12px', flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#6b70a0', letterSpacing: 1.5, marginBottom: 6, paddingLeft: 4 }}>SMART MAIL</div>
        {CATEGORIES.map(cat => {
          const count = getCategoryCount(cat.key)
          const active = currentCategory === cat.key
          return (
            <div key={cat.key}
              onClick={() => filterByCategory(cat.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                borderRadius: 6, cursor: 'pointer', fontSize: 13, marginBottom: 1,
                background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: active ? '#fff' : '#c8cde0',
                fontWeight: active ? 700 : 500,
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-h)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 14 }}>{cat.icon}</span>
              {count > 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, flexShrink: 0 }}></span>}
              <span style={{ flex: 1 }}>{cat.label}</span>
              {count > 0 && (
                <span style={{
                  background: cat.key === 'urgent' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                  color: cat.key === 'urgent' ? '#fff' : '#8890b0',
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 7px', borderRadius: 10, minWidth: 20, textAlign: 'center'
                }}>{count}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Academic */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#6b70a0', letterSpacing: 1.5, marginBottom: 6, paddingLeft: 4 }}>ACADEMIC</div>
        {['Courses', 'Exam Schedule', 'Settings'].map(item => (
          <div key={item} style={{
            padding: '7px 10px', fontSize: 13, color: '#8890b0',
            borderRadius: 6, cursor: 'pointer', opacity: 0.6
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sidebar-h)'; e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.6' }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* Gmail Connect */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
        {gmailConnected ? (
          <>
            <div
              onClick={() => setShowGmailMenu(!showGmailMenu)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, color: '#22c55e', cursor: 'pointer',
                padding: '6px 8px', borderRadius: 6,
                background: showGmailMenu ? 'rgba(34,197,94,0.1)' : 'transparent',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
              onMouseLeave={e => { if (!showGmailMenu) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                animation: 'pulse 2s infinite', flexShrink: 0
              }}></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Gmail Connected</div>
                <div style={{
                  fontSize: 10, color: '#8890b0', fontFamily: 'JetBrains Mono',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: 160
                }}>{gmailEmail}</div>
              </div>
              <span style={{ fontSize: 10, color: '#6b70a0' }}>
                {showGmailMenu ? '▲' : '▼'}
              </span>
            </div>

            {showGmailMenu && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 8, right: 8,
                background: '#252a4a', borderRadius: 8, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 -8px 24px rgba(0,0,0,0.3)',
                animation: 'fadeIn 0.15s ease'
              }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#6b70a0', marginBottom: 4 }}>CONNECTED ACCOUNT</div>
                  <div style={{
                    fontSize: 11, color: '#fff', fontFamily: 'JetBrains Mono',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>{gmailEmail}</div>
                </div>
                <div
                  onClick={() => { setShowGmailMenu(false); syncGmail(); }}
                  style={{
                    padding: '10px 12px', fontSize: 12, color: '#c8cde0',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>🔄</span> Sync Inbox Now
                </div>
                <div
                  onClick={() => { setShowGmailMenu(false); connectGmail(); }}
                  style={{
                    padding: '10px 12px', fontSize: 12, color: '#c8cde0',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>🔀</span> Switch Account
                </div>
                <div
                  onClick={() => {
                    setShowGmailMenu(false)
                    useMailStore.setState({ gmailConnected: false, gmailEmail: '' })
                  }}
                  style={{
                    padding: '10px 12px', fontSize: 12, color: '#ef4444',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span>⛔</span> Disconnect Gmail
                </div>
              </div>
            )}
          </>
        ) : (
          <button onClick={connectGmail} style={{
            width: '100%', padding: '8px 12px', borderRadius: 6, border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            fontFamily: 'Nunito', transition: 'transform 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            ✉ Connect Gmail
          </button>
        )}
      </div>
    </aside>
  )
}
