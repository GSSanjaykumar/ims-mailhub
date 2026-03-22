import { useMailStore } from '../stores/mailStore'

export default function UrgentStrips() {
  const { mails } = useMailStore()
  const urgents = mails.filter(m => m.isUrgent || m.urgent)

  if (urgents.length === 0) return null

  return (
    <div style={{ marginTop: 16 }}>
      {urgents.slice(0, 3).map(mail => (
        <div key={mail.id} style={{
          background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
          border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 16px',
          marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeIn 0.3s ease'
        }}>
          <span style={{ fontSize: 16 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#dc2626' }}>
              URGENT: {mail.subject}
            </div>
            <div style={{ fontSize: 11, color: '#991b1b' }}>
              From: {mail.senderName || mail.senderEmail} · {mail.aiSummary || 'Action required'}
            </div>
          </div>
          <span style={{
            background: '#dc2626', color: '#fff', padding: '3px 10px',
            borderRadius: 12, fontSize: 10, fontWeight: 700
          }}>URGENT</span>
        </div>
      ))}
    </div>
  )
}
