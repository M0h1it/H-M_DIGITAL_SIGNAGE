import { useEffect } from 'react'
import CreativePlayer from './components/CreativePlayer.jsx'
import ClockPanel from './components/ClockPanel.jsx'

// Auto-reload every 6 hours for stability on 24/7 displays
const AUTO_RELOAD_MS = 6 * 60 * 60 * 1000

export default function App() {
  useEffect(() => {
    const timer = setTimeout(() => window.location.reload(), AUTO_RELOAD_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="app-root">
      <CreativePlayer />
      <ClockPanel />
    </div>
  )
}
