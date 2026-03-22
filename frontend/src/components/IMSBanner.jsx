import { useMailStore } from '../stores/mailStore'

export default function IMSBanner() {
  const { gmailConnected, gmailEmail } = useMailStore()
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #1b1f3a 100%)',
      padding: '14px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Glow effects */}
      <div style={{
        position: 'absolute', top: -40, left: 200,
        width: 200, height: 80,
        background: 'rgba(99,102,241,0.15)',
        borderRadius: '50%', filter: 'blur(30px)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute', top: -40, right: 300,
        width: 150, height: 80,
        background: 'rgba(59,130,246,0.12)',
        borderRadius: '50%', filter: 'blur(30px)',
        pointerEvents: 'none'
      }}></div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 0 16px rgba(99,102,241,0.5)'
          }}>✉</div>
          <span style={{
            fontWeight: 900, fontSize: 20, color: '#fff',
            letterSpacing: 2, fontFamily: 'Nunito'
          }}>IMS · SMART MAIL HUB</span>
          <span style={{
            background: 'linear-gradient(135deg,#6366f1,#3b82f6)',
            color: '#fff', fontSize: 9, fontWeight: 700,
            padding: '2px 8px', borderRadius: 4,
            letterSpacing: 1, fontFamily: 'JetBrains Mono'
          }}>v2.0</span>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, paddingLeft: 42 }}>
          AI-Powered College Email Intelligence System
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.25)',
          padding: '4px 12px', borderRadius: 20
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#22c55e', animation: 'pulse 2s infinite',
            display: 'inline-block'
          }}></span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>
            AI ENGINE ACTIVE
          </span>
        </div>
        <span style={{
          fontFamily: 'JetBrains Mono', fontSize: 10, color: '#6b70a0',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          padding: '3px 10px', borderRadius: 4
        }}>Gemini 2.5 Flash</span>
        {gmailConnected && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: '#22c55e',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            padding: '3px 10px', borderRadius: 20,
            display: 'flex', alignItems: 'center', gap: 5
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%',
              background: '#22c55e', display: 'inline-block' }}></span>
            Gmail Connected
          </span>
        )}
      </div>
    </div>
  )
}
