import { useMailStore } from '../stores/mailStore'
import MailCard from './MailCard'

const applyPriorityFilter = (mails, filter) => {
  switch (filter) {
    case 'high':
      return mails.filter(m => (m.tasks || []).some(t => t.priority === 'HIGH'))
    case 'medium':
      return mails.filter(m => (m.tasks || []).some(t => t.priority === 'MEDIUM'))
    case 'low':
      return mails.filter(m => (m.tasks || []).some(t => t.priority === 'LOW'))
    case 'collision':
      return mails.filter(m => (m.tasks || []).some(t => t.hasCollision))
    case 'review':
      return mails.filter(m => {
        const scores = (m.tasks || []).map(t => t.confidenceScore || 70)
        if (scores.length === 0) return false
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length
        return avg < 85
      })
    default:
      return mails
  }
}

export default function MailList() {
  const { filteredMails, isLoading, priorityFilter } = useMailStore()
  const visibleMails = applyPriorityFilter(filteredMails, priorityFilter)

  if (isLoading) {
    return (
      <div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: 'var(--surface)', borderRadius: 12, padding: 20,
            border: '1px solid var(--border)', marginBottom: 10
          }}>
            <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }}></div>
            <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 6 }}></div>
            <div className="skeleton" style={{ height: 12, width: '40%' }}></div>
          </div>
        ))}
      </div>
    )
  }

  if (visibleMails.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px', color: 'var(--muted)'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No emails in this category</div>
        <div style={{ fontSize: 13 }}>Try syncing your Gmail or paste an email manually below</div>
      </div>
    )
  }

  return (
    <div>
      {visibleMails.map(mail => (
        <MailCard key={mail.id} mail={mail} />
      ))}
    </div>
  )
}
