import { useState, useRef } from 'react'
import { useMailStore } from '../stores/mailStore'

const SAMPLES = [
  {
    label: '📝 Exam: CAT-2 Timetable',
    sender: 'exam.controller@college.edu',
    subject: 'CAT-2 Examination Timetable Semester 5',
    body: 'CAT-2 Semester 5: DSA Jan 15 10AM, Networks Jan 17 10AM, DBMS Jan 20 10AM, OS Jan 22 10AM. Syllabus Units 1-3. ID card mandatory. Report 15 mins early.'
  },
  {
    label: '💰 Fee: URGENT Exam Fee',
    sender: 'finance@college.edu',
    subject: 'URGENT Semester Exam Fee Last Date January 12',
    body: 'Exam fee Rs.850 due by Jan 10. Late fee Rs.350/day. Hall tickets not issued without payment receipt. Pay at IMS Portal Fee Section.'
  },
  {
    label: '📚 Assignment: DBMS Project',
    sender: 'kavitha.r@college.edu',
    subject: 'DBMS Mini Project Final Submission Jan 17',
    body: 'Submit PDF report + GitHub link + 5-min video via LMS by Jan 17 11:59PM. Late penalty 50% per day. Viva Jan 20.'
  },
  {
    label: '💼 Placement: TCS NQT Drive',
    sender: 'placement@college.edu',
    subject: 'TCS NQT Campus Drive Register by January 10',
    body: 'TCS drive Jan 22. Package 3.5-7 LPA. 60%+ no backlogs 2025 batch. Register IMS Placement portal by Jan 10 11:59PM.'
  },
  {
    label: '🎭 Club: CodeStorm 2025',
    sender: 'iste@college.edu',
    subject: 'CodeStorm 2025 24hr Hackathon Register by Jan 20',
    body: 'Feb 1-2. Team 2-4. Prize 50000. Fee 200/team. Register by Jan 20 at ims.college.edu/codestorm.'
  },
  {
    label: '📢 Circular: Anti-Ragging',
    sender: 'principal@college.edu',
    subject: 'Anti-Ragging Policy Compliance Action Required',
    body: 'All students must submit anti-ragging undertaking by Jan 15 via IMS portal. Mandatory compliance. Non-submission results in disciplinary action.'
  },
  {
    label: '🏖️ Holiday: Republic Day',
    sender: 'admin@college.edu',
    subject: 'Holiday Notice Republic Day January 26',
    body: 'College will remain closed on January 26 for Republic Day. All scheduled classes and labs are cancelled. Resume normal schedule Jan 27.'
  },
  {
    label: '💰 Fee: Tuition 3rd Installment',
    sender: 'accounts@college.edu',
    subject: 'Tuition Fee Due 3rd Installment Last Date Jan 31',
    body: '3rd installment of tuition fee Rs.25000 due by January 31. Fine of Rs.500/day after due date. Pay via IMS Fee portal or bank transfer.'
  },
]

const LOG_LINES = [
  { text: '→ Sending to Gemini AI classification engine...', color: '#3b82f6' },
  { text: '→ Detecting mail category...', color: '#3b82f6' },
  { text: '→ Extracting action items & tasks...', color: '#3b82f6' },
  { text: '→ Assigning priority & confidence scores...', color: '#3b82f6' },
  { text: '→ Parsing natural language deadlines...', color: '#3b82f6' },
  { text: '→ Checking workload collision...', color: '#3b82f6' },
]

export default function ExtractPanel() {
  const [tab, setTab] = useState('manual')
  const [sender, setSender] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [logLines, setLogLines] = useState([])
  const { extractFromEmail, addToast } = useMailStore()
  const logRef = useRef(null)

  const loadSample = (sample) => {
    setSender(sample.sender)
    setSubject(sample.subject)
    setBody(sample.body)
    setTab('manual')
  }

  const handleExtract = async () => {
    if (!sender || !subject || !body) {
      addToast('Please fill in all fields', 'error')
      return
    }

    setExtracting(true)
    setLogLines([])

    // Animate log lines
    for (let i = 0; i < LOG_LINES.length; i++) {
      await new Promise(r => setTimeout(r, 220))
      setLogLines(prev => [...prev, LOG_LINES[i]])
    }

    try {
      const result = await extractFromEmail(sender, subject, body)
      const tasks = result.tasks || []

      await new Promise(r => setTimeout(r, 200))
      setLogLines(prev => [...prev,
        { text: `✓ Category: ${result.category || 'general'}`, color: '#22c55e' },
      ])
      await new Promise(r => setTimeout(r, 200))
      setLogLines(prev => [...prev,
        { text: `✓ Extracted ${tasks.length} task(s) · Urgency: ${result.urgency || 'low'}`, color: '#22c55e' },
      ])
      await new Promise(r => setTimeout(r, 200))
      setLogLines(prev => [...prev,
        { text: `✓ Mail added to IMS Smart Hub → ${result.category || 'general'}`, color: '#22c55e' },
      ])

      addToast(`✓ Email classified as "${result.category}" with ${tasks.length} task(s)`, 'success')

      // Clear form
      setSender('')
      setSubject('')
      setBody('')
    } catch (e) {
      setLogLines(prev => [...prev, { text: '✕ Error: ' + (e.message || 'Classification failed'), color: '#ef4444' }])
      addToast('Failed to classify email', 'error')
    }

    setExtracting(false)
  }

  return (
    <div id="extract-panel" style={{
      marginTop: 24, background: 'var(--surface)', borderRadius: 12,
      border: '1px solid var(--border)', overflow: 'hidden'
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)'
      }}>
        <button onClick={() => setTab('manual')} style={{
          flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, border: 'none',
          background: tab === 'manual' ? 'var(--surface)' : 'var(--bg)',
          color: tab === 'manual' ? 'var(--blue)' : 'var(--sub)',
          borderBottom: tab === 'manual' ? '2px solid var(--blue)' : '2px solid transparent',
          cursor: 'pointer', fontFamily: 'Nunito'
        }}>✏️ Manual Paste</button>
        <button onClick={() => setTab('samples')} style={{
          flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, border: 'none',
          background: tab === 'samples' ? 'var(--surface)' : 'var(--bg)',
          color: tab === 'samples' ? 'var(--blue)' : 'var(--sub)',
          borderBottom: tab === 'samples' ? '2px solid var(--blue)' : '2px solid transparent',
          cursor: 'pointer', fontFamily: 'Nunito'
        }}>📎 Sample Emails</button>
      </div>

      <div style={{ padding: 20 }}>
        {tab === 'samples' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {SAMPLES.map((s, i) => (
              <button key={i} onClick={() => loadSample(s)} style={{
                padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--bg)', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'Nunito', fontSize: 12, fontWeight: 600, color: 'var(--sub)',
                transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.background = '#eff6ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {tab === 'manual' && (
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input value={sender} onChange={e => setSender(e.target.value)}
                  placeholder="Sender email"
                  style={{
                    padding: '9px 12px', borderRadius: 6, border: '1px solid var(--border)',
                    fontSize: 13, fontFamily: 'Nunito', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Subject"
                  style={{
                    padding: '9px 12px', borderRadius: 6, border: '1px solid var(--border)',
                    fontSize: 13, fontFamily: 'Nunito', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <textarea value={body} onChange={e => setBody(e.target.value)}
                placeholder="Paste email body here..."
                rows={5}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 6,
                  border: '1px solid var(--border)', fontSize: 13,
                  fontFamily: 'Nunito', resize: 'vertical', outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button onClick={handleExtract} disabled={extracting} style={{
                marginTop: 10, padding: '10px 24px', borderRadius: 8, border: 'none',
                background: extracting
                  ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: extracting ? 'wait' : 'pointer',
                fontFamily: 'Nunito', transition: 'transform 0.15s',
                boxShadow: '0 2px 10px rgba(99,102,241,0.3)'
              }}
                onMouseEnter={e => { if (!extracting) e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {extracting ? '⏳ Classifying...' : '⚡ Extract & Classify'}
              </button>
            </div>

            {/* Animated Log Box */}
            {logLines.length > 0 && (
              <div ref={logRef} style={{
                width: 320, background: '#0f1225', borderRadius: 8, padding: 14,
                fontFamily: 'JetBrains Mono', fontSize: 11, overflow: 'auto',
                maxHeight: 220, border: '1px solid #252a4a'
              }}>
                {logLines.map((line, i) => (
                  <div key={i} style={{
                    color: line.color, marginBottom: 4, animation: 'fadeIn 0.2s ease',
                    lineHeight: 1.5
                  }}>
                    {line.text}
                  </div>
                ))}
                {extracting && (
                  <span style={{ color: '#6b70a0', animation: 'pulse 1s infinite' }}>▌</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
