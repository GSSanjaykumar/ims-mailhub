import { useMailStore } from '../stores/mailStore'

export default function SearchBar() {
  const { searchMails } = useMailStore()

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 14, color: 'var(--muted)'
        }}>🔍</span>
        <input
          type="text"
          placeholder="Search emails by subject, sender, or content..."
          onChange={e => searchMails(e.target.value)}
          style={{
            width: '100%', padding: '10px 16px 10px 36px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--surface)',
            fontSize: 13, fontFamily: 'Nunito', color: 'var(--ink)',
            outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.08)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
        />
      </div>
    </div>
  )
}
