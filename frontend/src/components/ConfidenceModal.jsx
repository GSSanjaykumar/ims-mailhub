import { useEffect, useState } from 'react'

const FACTORS = [
  { key: 'confTaskIntent', label: 'Task Intent Clarity', icon: '🎯' },
  { key: 'confDeadline', label: 'Deadline Extraction', icon: '📅' },
  { key: 'confPriorityReason', label: 'Priority Reasoning', icon: '⚡' },
  { key: 'confTagAccuracy', label: 'Tag Accuracy', icon: '🏷️' },
  { key: 'confSenderAuthority', label: 'Sender Authority', icon: '👤' },
]

export default function ConfidenceModal({ task, onClose }) {
  const [animate, setAnimate] = useState(false)
  const overall = task.confidenceScore || 70

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100)
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const getColor = (v) => v >= 85 ? '#22c55e' : v >= 65 ? '#f59e0b' : '#ef4444'
  const getBg = (v) => v >= 85 ? '#f0fdf4' : v >= 65 ? '#fffbeb' : '#fef2f2'

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, padding: 24,
        width: 480, maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>
            🔍 AI Confidence Breakdown
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg)', border: 'none', borderRadius: 6,
            width: 28, height: 28, cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        <div style={{ fontSize: 13, color: 'var(--sub)', fontStyle: 'italic', marginBottom: 16 }}>
          {task.title}
        </div>

        {/* Overall Banner */}
        <div style={{
          padding: '14px 16px', borderRadius: 10, marginBottom: 20,
          background: getBg(overall), display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 800,
            fontSize: 16, color: '#fff', background: getColor(overall),
            fontFamily: 'JetBrains Mono'
          }}>{overall}%</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: getColor(overall) }}>
              {overall >= 85 ? '✓ High confidence' : overall >= 65 ? '⚠ Review recommended' : '✕ Manual verification required'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>
              Overall AI confidence score for this extracted task
            </div>
          </div>
        </div>

        {/* 5 Factor Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FACTORS.map(f => {
            const val = task[f.key] || 70
            const color = getColor(val)
            return (
              <div key={f.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                    {f.icon} {f.label}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color, fontFamily: 'JetBrains Mono'
                  }}>{val}%</span>
                </div>
                <div style={{
                  height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', borderRadius: 4, background: color,
                    width: animate ? `${val}%` : '0%',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Approve button for low confidence */}
        {overall < 85 && (
          <button onClick={onClose} style={{
            marginTop: 20, width: '100%', padding: '10px',
            borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            fontFamily: 'Nunito', transition: 'transform 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            ✓ Manually Approve This Task
          </button>
        )}
      </div>
    </div>
  )
}
