import { useMailStore } from '../stores/mailStore'

export default function Toast() {
  const { toasts } = useMailStore()

  if (toasts.length === 0) return null

  const borderColors = { success: '#22c55e', error: '#ef4444', info: '#3b82f6' }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 200,
      display: 'flex', flexDirection: 'column', gap: 8
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: '#1b1f3a', color: '#fff', padding: '12px 18px',
          borderRadius: 10, fontSize: 13, fontWeight: 600,
          borderLeft: `4px solid ${borderColors[t.type] || borderColors.info}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease', maxWidth: 360,
          fontFamily: 'Nunito'
        }}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
