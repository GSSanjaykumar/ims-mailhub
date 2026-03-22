import IMSBanner from './IMSBanner'
import TopBar from './TopBar'
import UrgentStrips from './UrgentStrips'
import StatsRow from './StatsRow'
import CategoryTabs from './CategoryTabs'
import SearchBar from './SearchBar'
import MailList from './MailList'
import RightPanels from './RightPanels'
import ExtractPanel from './ExtractPanel'

export default function Main() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <IMSBanner />
      <TopBar />
      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 24px' }}>
        <UrgentStrips />
        <StatsRow />
        <CategoryTabs />
        <SearchBar />
        <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MailList />
          </div>
          <RightPanels />
        </div>
        <ExtractPanel />
      </div>
    </div>
  )
}
