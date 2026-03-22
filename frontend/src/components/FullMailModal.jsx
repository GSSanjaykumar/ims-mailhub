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

export default function FullMailModal({ mail, onClose }) {
  const cat = mail.category || 'general'
  const catColor = CAT_COLORS[cat] || CAT_COLORS.general
  const tasks = mail.tasks || []

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, width: 640, maxWidth: '90vw',
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 20,
            background: catColor + '14'
          }}>{CAT_EMOJIS[cat]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{mail.subject}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              From: {mail.senderName || mail.senderEmail} · {mail.senderEmail}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg)', border: 'none', borderRadius: 6,
            width: 28, height: 28, cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {mail.aiSummary && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8,
              padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#15803d'
            }}>
              🤖 AI Summary: {mail.aiSummary}
            </div>
          )}
          <div style={{
            fontSize: 13, lineHeight: 1.7, color: 'var(--sub)', whiteSpace: 'pre-wrap'
          }}>
            {mail.bodyClean || mail.bodyRaw || 'No email body available'}
          </div>

          {/* Tasks */}
          {tasks.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 10 }}>
                🤖 Extracted Tasks ({tasks.length})
              </div>
              {tasks.map((task, i) => {
                const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM
                const conf = task.confidenceScore || 70
                const confColor = conf >= 85 ? '#22c55e' : conf >= 70 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={task.id || i} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                    borderRadius: 6, marginBottom: 6, background: '#f8f9fc',
                    border: '1px solid var(--border)'
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                      background: ps.bg, color: ps.text, border: `1px solid ${ps.border}`,
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ps.dot }}></span>
                      {task.priority}
                    </span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{task.title}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8,
                      background: confColor + '14', color: confColor, fontFamily: 'JetBrains Mono'
                    }}>{conf}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 8, justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--sub)',
            fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'Nunito'
          }}>Close</button>
        </div>
      </div>
    </div>
  )
}
