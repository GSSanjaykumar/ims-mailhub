import { useMailStore } from '../stores/mailStore'

export default function TopBar() {
  const { syncGmail, gmailConnected, addToast } = useMailStore()

  const scrollToExtract = () => {
    document.getElementById('extract-panel')?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadDemoData = () => {
    const demoMails = [
      {
        id: 9001, userId: 1, gmailId: 'demo1',
        senderEmail: 'exam.controller@college.edu', senderName: 'exam controller',
        subject: 'CAT-2 Examination Timetable Semester 5',
        bodyClean: 'CAT-2 Semester 5: DSA Apr 12 10AM, Networks Apr 14, DBMS Apr 18, OS Apr 21. Syllabus Units 1-3. ID card mandatory.',
        aiSummary: 'CAT-2 examination timetable for Semester 5, including dates, times, and mandatory ID card requirement.',
        category: 'exam', urgency: 'medium', isUrgent: false, isRead: false, isProcessed: true,
        receivedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
        tasks: [
          { id: 9001, title: 'Review CAT-2 timetable', priority: 'MEDIUM', dueRaw: 'Apr 12, 2026',
            confidenceScore: 92, confTaskIntent: 95, confDeadline: 90, confPriorityReason: 93,
            confTagAccuracy: 98, confSenderAuthority: 99, hasCollision: false, status: 'ACTIVE', deepLinkModule: 'exam' },
          { id: 9002, title: 'Carry ID card for exams', priority: 'HIGH', dueRaw: 'Apr 12, 2026',
            confidenceScore: 88, confTaskIntent: 90, confDeadline: 85, confPriorityReason: 88,
            confTagAccuracy: 92, confSenderAuthority: 95, hasCollision: true, status: 'ACTIVE', deepLinkModule: 'exam' }
        ]
      },
      {
        id: 9002, userId: 1, gmailId: 'demo2',
        senderEmail: 'finance@college.edu', senderName: 'finance',
        subject: 'URGENT Semester Exam Fee Last Date April 10',
        bodyClean: 'Semester Examination Fee Rs.850 due Apr 10, 2026. Late fee Rs.350/day. Hall tickets not issued without payment.',
        aiSummary: 'URGENT: Pay Semester Exam Fee of Rs.850 by Apr 10, 2026, to avoid late fees and ensure hall ticket.',
        category: 'fee', urgency: 'high', isUrgent: true, isRead: false, isProcessed: true,
        receivedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
        tasks: [
          { id: 9003, title: 'Pay Semester Examination Fee', priority: 'HIGH', dueRaw: 'Apr 10, 2026',
            confidenceScore: 95, confTaskIntent: 97, confDeadline: 99, confPriorityReason: 96,
            confTagAccuracy: 94, confSenderAuthority: 98, hasCollision: false, status: 'ACTIVE', deepLinkModule: 'fee' }
        ]
      },
      {
        id: 9003, userId: 1, gmailId: 'demo3',
        senderEmail: 'kavitha.r@college.edu', senderName: 'kavitha r',
        subject: 'DBMS Mini Project Final Submission Apr 15',
        bodyClean: 'DBMS Mini Project due Apr 15 11:59PM via LMS. Submit report + GitHub + video. Late penalty 50%/day. Viva Apr 18.',
        aiSummary: 'DBMS Mini Project final submission due April 15th via LMS. Late submissions penalized 50% per day.',
        category: 'assign', urgency: 'medium', isUrgent: false, isRead: false, isProcessed: true,
        receivedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
        tasks: [
          { id: 9004, title: 'Submit DBMS Mini Project report', priority: 'HIGH', dueRaw: 'Apr 15, 2026',
            confidenceScore: 94, confTaskIntent: 96, confDeadline: 98, confPriorityReason: 92,
            confTagAccuracy: 95, confSenderAuthority: 90, hasCollision: true, status: 'ACTIVE', deepLinkModule: 'lms' },
          { id: 9005, title: 'Upload GitHub repository link', priority: 'HIGH', dueRaw: 'Apr 15, 2026',
            confidenceScore: 91, confTaskIntent: 93, confDeadline: 95, confPriorityReason: 89,
            confTagAccuracy: 92, confSenderAuthority: 88, hasCollision: false, status: 'ACTIVE', deepLinkModule: 'lms' },
          { id: 9006, title: 'Prepare for viva voce', priority: 'MEDIUM', dueRaw: 'Apr 18, 2026',
            confidenceScore: 87, confTaskIntent: 88, confDeadline: 90, confPriorityReason: 85,
            confTagAccuracy: 88, confSenderAuthority: 86, hasCollision: false, status: 'ACTIVE', deepLinkModule: 'lms' }
        ]
      },
      {
        id: 9004, userId: 1, gmailId: 'demo4',
        senderEmail: 'placement@college.edu', senderName: 'placement',
        subject: 'TCS NQT Campus Drive Register by April 8',
        bodyClean: 'TCS NQT drive Apr 20. Package 3.5-7 LPA. 60%+ no backlogs. Register by Apr 8 on placement portal.',
        aiSummary: 'TCS NQT campus drive on April 20. Register by April 8. Eligibility: 60% aggregate, no backlogs.',
        category: 'placement', urgency: 'medium', isUrgent: false, isRead: false, isProcessed: true,
        receivedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
        tasks: [
          { id: 9007, title: 'Register for TCS NQT campus drive', priority: 'HIGH', dueRaw: 'Apr 8, 2026',
            confidenceScore: 93, confTaskIntent: 95, confDeadline: 97, confPriorityReason: 91,
            confTagAccuracy: 94, confSenderAuthority: 89, hasCollision: false, status: 'ACTIVE', deepLinkModule: 'placement' },
          { id: 9008, title: 'Prepare resume and marksheets', priority: 'MEDIUM', dueRaw: 'Apr 8, 2026',
            confidenceScore: 85, confTaskIntent: 87, confDeadline: 88, confPriorityReason: 83,
            confTagAccuracy: 86, confSenderAuthority: 82, hasCollision: false, status: 'ACTIVE', deepLinkModule: 'placement' }
        ]
      },
      {
        id: 9005, userId: 1, gmailId: 'demo5',
        senderEmail: 'iste@college.edu', senderName: 'ISTE Student Chapter',
        subject: 'CodeStorm 2026 Hackathon Register by Apr 20',
        bodyClean: 'CodeStorm 2026 hackathon May 1-2. Team 2-4 members. Prize Rs.50000. Fee Rs.200/team. Register by Apr 20.',
        aiSummary: 'CodeStorm 2026 hackathon on May 1-2. Team of 2-4. Prize pool Rs.50,000. Register by April 20.',
        category: 'club', urgency: 'low', isUrgent: false, isRead: false, isProcessed: true,
        receivedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
        tasks: [
          { id: 9009, title: 'Register for CodeStorm 2026 hackathon', priority: 'MEDIUM', dueRaw: 'Apr 20, 2026',
            confidenceScore: 88, confTaskIntent: 90, confDeadline: 92, confPriorityReason: 86,
            confTagAccuracy: 89, confSenderAuthority: 85, hasCollision: true, status: 'ACTIVE', deepLinkModule: 'none' },
          { id: 9010, title: 'Form team of 2-4 members', priority: 'MEDIUM', dueRaw: 'Apr 20, 2026',
            confidenceScore: 84, confTaskIntent: 86, confDeadline: 88, confPriorityReason: 82,
            confTagAccuracy: 85, confSenderAuthority: 80, hasCollision: false, status: 'ACTIVE', deepLinkModule: 'none' },
          { id: 9011, title: 'Pay Rs.200 registration fee', priority: 'MEDIUM', dueRaw: 'Apr 20, 2026',
            confidenceScore: 90, confTaskIntent: 92, confDeadline: 94, confPriorityReason: 88,
            confTagAccuracy: 91, confSenderAuthority: 86, hasCollision: false, status: 'ACTIVE', deepLinkModule: 'fee' }
        ]
      }
    ]
    useMailStore.setState({ 
      mails: demoMails, 
      filteredMails: demoMails,
      gmailConnected: true,
      gmailEmail: 'gssanjaykumar2007@gmail.com'
    })
    addToast('✓ Demo mode loaded — 5 sample emails with AI classification', 'success')
  }

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20, background: 'var(--surface)',
      padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      <div>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'JetBrains Mono', letterSpacing: 0.5 }}>
          IMS / Smart Tools / Mail Hub
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginTop: 1 }}>Smart Mail Hub</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {gmailConnected && (
          <span style={{
            fontSize: 10, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}></span>
            Gmail Connected
          </span>
        )}
        <button onClick={syncGmail} style={{
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          fontFamily: 'Nunito', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'transform 0.15s, box-shadow 0.15s',
          boxShadow: '0 2px 8px rgba(59,130,246,0.25)'
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.25)' }}
        >
          🔄 Sync Inbox
        </button>
        <button onClick={loadDemoData} style={{
          padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 12,
          cursor: 'pointer', fontFamily: 'Nunito', display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(34,197,94,0.1)', color: '#22c55e',
          border: '1px solid rgba(34,197,94,0.3)', transition: 'transform 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🎯 Demo Mode
        </button>
        <button onClick={scrollToExtract} style={{
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          fontFamily: 'Nunito', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'transform 0.15s',
          boxShadow: '0 2px 8px rgba(139,92,246,0.25)'
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ✨ Manual Extract
        </button>
      </div>
    </div>
  )
}
