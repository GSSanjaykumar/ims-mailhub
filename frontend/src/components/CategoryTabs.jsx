import { useMailStore } from '../stores/mailStore'

const CATS = [
  { key: 'all', label: 'All', color: '#3b82f6' },
  { key: 'urgent', label: 'Urgent', color: '#ef4444' },
  { key: 'exam', label: 'Exam', color: '#ef4444' },
  { key: 'assign', label: 'Assignments', color: '#f59e0b' },
  { key: 'club', label: 'Club', color: '#8b5cf6' },
  { key: 'circular', label: 'Circulars', color: '#06b6d4' },
  { key: 'fee', label: 'Fee', color: '#10b981' },
  { key: 'placement', label: 'Placement', color: '#ec4899' },
  { key: 'holiday', label: 'Holidays', color: '#6366f1' },
]

const PILLS = [
  { key: 'all', label: 'All', activeBg: '#1b1f3a', activeColor: '#fff', activeBorder: '#1b1f3a' },
  { key: 'high', label: 'High', dot: '#ef4444', activeBg: '#fff1f1', activeColor: '#dc2626', activeBorder: '#fca5a5' },
  { key: 'medium', label: 'Medium', dot: '#f59e0b', activeBg: '#fffbeb', activeColor: '#b45309', activeBorder: '#fcd34d' },
  { key: 'low', label: 'Low', dot: '#22c55e', activeBg: '#f0fdf4', activeColor: '#15803d', activeBorder: '#86efac' },
  { key: 'collision', label: 'Collision', icon: '⚡', activeBg: '#fefce8', activeColor: '#854d0e', activeBorder: '#fde047' },
  { key: 'review', label: 'Review', icon: '🔍', activeBg: '#eff6ff', activeColor: '#1d4ed8', activeBorder: '#bfdbfe' },
]

export default function CategoryTabs() {
  const { currentCategory, filterByCategory, mails, priorityFilter, setPriorityFilter, filteredMails } = useMailStore()

  const getCount = (key) => {
    if (key === 'all') return mails.length
    if (key === 'urgent') return mails.filter(m => m.isUrgent).length
    return mails.filter(m => m.category === key).length
  }

  // Count visible emails after priority filter
  const getVisibleCount = () => {
    let list = filteredMails
    switch (priorityFilter) {
      case 'high': return list.filter(m => (m.tasks || []).some(t => t.priority === 'HIGH')).length
      case 'medium': return list.filter(m => (m.tasks || []).some(t => t.priority === 'MEDIUM')).length
      case 'low': return list.filter(m => (m.tasks || []).some(t => t.priority === 'LOW')).length
      case 'collision': return list.filter(m => (m.tasks || []).some(t => t.hasCollision)).length
      case 'review': return list.filter(m => {
        const scores = (m.tasks || []).map(t => t.confidenceScore || 70)
        return scores.length > 0 && scores.reduce((a, b) => a + b, 0) / scores.length < 85
      }).length
      default: return list.length
    }
  }

  return (
    <div>
      {/* Category tabs row */}
      <div style={{
        display: 'flex', gap: 6, marginTop: 16, overflowX: 'auto', paddingBottom: 4
      }}>
        {CATS.map(cat => {
          const active = currentCategory === cat.key
          const count = getCount(cat.key)
          return (
            <button key={cat.key} onClick={() => filterByCategory(cat.key)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
                borderColor: active ? cat.color : 'var(--border)',
                background: active ? cat.color + '12' : 'var(--surface)',
                color: active ? cat.color : 'var(--sub)',
                fontWeight: active ? 700 : 500, fontSize: 12, cursor: 'pointer',
                fontFamily: 'Nunito', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.15s'
              }}
            >
              {cat.label}
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: active ? cat.color : 'var(--bg)',
                color: active ? '#fff' : 'var(--muted)',
                padding: '0 6px', borderRadius: 10, minWidth: 18, textAlign: 'center'
              }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Priority filter pills row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 0', marginBottom: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>Your Tasks</span>
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>{getVisibleCount()} active</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {PILLS.map(pill => {
            const active = priorityFilter === pill.key
            return (
              <button key={pill.key} onClick={() => setPriorityFilter(pill.key)}
                style={{
                  padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Nunito', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: active ? pill.activeBg : '#f3f4f8',
                  color: active ? pill.activeColor : 'var(--sub)',
                  border: `1px solid ${active ? pill.activeBorder : 'var(--border)'}`,
                  transition: 'all 0.15s'
                }}
              >
                {pill.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: pill.dot, flexShrink: 0 }}></span>}
                {pill.icon && <span>{pill.icon}</span>}
                {pill.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
