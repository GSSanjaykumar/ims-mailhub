import { useMailStore } from '../stores/mailStore'

export default function StatsRow() {
  const { mails, stats } = useMailStore()

  const totalTasks = mails.reduce((a, m) => a + (m.tasks || []).length, 0)
  const urgentCount = mails.filter(m => m.isUrgent).length
  const examCount = mails.filter(m => m.category === 'exam').length
  const clubCount = mails.filter(m => m.category === 'club').length
  const avgConf = totalTasks > 0
    ? Math.round(mails.flatMap(m => m.tasks || [])
        .reduce((a, t) => a + (t.confidenceScore || 70), 0) / totalTasks)
    : 89

  const cards = [
    {
      label: 'Total Mails', value: mails.length,
      icon: '✉️', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      bg: 'rgba(59,130,246,0.08)', glow: 'rgba(59,130,246,0.2)',
      sub: `+${Math.max(0,mails.length-10)} from yesterday`
    },
    {
      label: 'Urgent', value: urgentCount,
      icon: '🚨', gradient: 'linear-gradient(135deg,#ef4444,#dc2626)',
      bg: 'rgba(239,68,68,0.08)', glow: 'rgba(239,68,68,0.2)',
      sub: urgentCount > 0 ? 'Needs attention' : 'All clear'
    },
    {
      label: 'Exam/CAT', value: examCount,
      icon: '📝', gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
      bg: 'rgba(245,158,11,0.08)', glow: 'rgba(245,158,11,0.2)',
      sub: examCount > 0 ? `${examCount} upcoming` : 'No exams'
    },
    {
      label: 'Club Events', value: clubCount,
      icon: '🎭', gradient: 'linear-gradient(135deg,#8b5cf6,#a855f7)',
      bg: 'rgba(139,92,246,0.08)', glow: 'rgba(139,92,246,0.2)',
      sub: clubCount > 0 ? `${clubCount} reg open` : 'None open'
    },
    {
      label: 'AI Accuracy', value: avgConf + '%',
      icon: '🤖', gradient: 'linear-gradient(135deg,#22c55e,#10b981)',
      bg: 'rgba(34,197,94,0.08)', glow: 'rgba(34,197,94,0.2)',
      sub: '+8% this week', isPercent: true, conf: avgConf
    },
  ]

  return (
    <div style={{
      display: 'flex', gap: 12, marginBottom: 16, marginTop: 16
    }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          flex: 1, background: '#fff', borderRadius: 14,
          padding: '16px 18px',
          border: '1px solid var(--border)',
          boxShadow: `0 0 0 1px ${card.glow}`,
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'default', position: 'relative', overflow: 'hidden',
          animation: `fadeIn 0.4s ease ${i * 0.08}s both`
        }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-3px)'
            e.currentTarget.style.boxShadow = `0 8px 24px ${card.glow}`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 0 0 1px ${card.glow}`
          }}
        >
          {/* Background gradient circle */}
          <div style={{
            position: 'absolute', top: -20, right: -20,
            width: 90, height: 90, borderRadius: '50%',
            background: card.bg, pointerEvents: 'none'
          }}></div>

          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'var(--muted)',
                marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1
              }}>{card.label}</div>
              <div style={{
                fontSize: 32, fontWeight: 900,
                background: card.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1, fontFamily: 'Nunito'
              }}>{card.value}</div>
              {card.isPercent && (
                <div style={{
                  marginTop: 8, height: 4, borderRadius: 2,
                  background: 'var(--border)'
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: card.conf + '%',
                    background: card.gradient,
                    transition: 'width 1s ease'
                  }}></div>
                </div>
              )}
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: card.bg,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, flexShrink: 0
            }}>{card.icon}</div>
          </div>
          <div style={{
            fontSize: 11, color: 'var(--muted)', marginTop: 8,
            fontFamily: 'JetBrains Mono'
          }}>{card.sub}</div>
        </div>
      ))}
    </div>
  )
}
