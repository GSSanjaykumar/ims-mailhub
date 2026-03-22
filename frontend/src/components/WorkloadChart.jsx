const WorkloadChart = ({ data }) => {
  const items = data && data.length > 0 ? data : [
    { day: 'Mon', tasks: 3, collision: false },
    { day: 'Tue', tasks: 5, collision: true },
    { day: 'Wed', tasks: 2, collision: false },
    { day: 'Thu', tasks: 4, collision: true },
    { day: 'Fri', tasks: 1, collision: false },
    { day: 'Sat', tasks: 0, collision: false },
    { day: 'Sun', tasks: 0, collision: false },
  ]
  const max = Math.max(...items.map(d => d.tasks), 1)

  return (
    <div>
      {items.map(({ day, tasks, collision }) => {
        const pct = (tasks / (max + 1)) * 100
        const color = tasks >= 5 ? '#ef4444' : tasks >= 3 ? '#f59e0b' : '#22c55e'
        return (
          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 30, fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--muted)'
            }}>{day}</span>
            <div style={{
              flex: 1, height: 20, background: '#f3f4f8', borderRadius: 4, overflow: 'hidden'
            }}>
              <div style={{
                width: `${pct}%`, height: '100%', background: color, borderRadius: 4,
                transition: 'width 0.9s ease', display: 'flex', alignItems: 'center',
                paddingLeft: 6, fontSize: 11, color: 'white', fontWeight: 600,
                animation: 'barGrow 0.9s ease'
              }}>
                {tasks >= 3 && `${tasks} tasks`}
              </div>
            </div>
            <span style={{ fontSize: 14 }}>{collision ? '⚡' : ''}</span>
            <span style={{ width: 16, fontSize: 12, color: 'var(--sub)' }}>{tasks}</span>
          </div>
        )
      })}
    </div>
  )
}

export default WorkloadChart
