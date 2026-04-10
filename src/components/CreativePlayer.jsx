import { useState, useEffect, useRef, useCallback } from 'react'

// ── Hardcoded creatives ──────────────────────────────────────────────────────
// Replace src values with your actual asset URLs or /public paths.
// Supported types: 'image' | 'video'
const CREATIVES = [
  {
    id: 1,
    type: 'image',
    src: '/creatives/H_M_1.jpg', // Example image in /public/creatives/
    duration: 8000,
    label: 'AUTUMN COLLECTION',
    sub: 'NEW ARRIVALS // 2025',
  },
  {
    id: 2,
    type: 'image',
    src: '/creatives/H_M_2.jpg', // Example image in /public/creatives/
    duration: 8000,
    label: 'MACHINED LUXURY',
    sub: 'CURATED EDITION',
  },
  {
    id: 3,
    type: 'image',
    src: '/creatives/H_M_3.jpg', // Example image in /public/creatives/
    duration: 8000,
    label: 'THE REFINED FORM',
    sub: 'WINTER // 25',
  },
  {
    id: 4,
    type: 'video',
    src:"/creatives/H&M&180.mp4",
    duration: 15000, // Fallback duration if video metadata fails to load
    label:'Kingfisher Premium',
    sub:'Live the Moment',
  }
]

const TRANSITION_MS = 1200

export default function CreativePlayer() {
  const [current, setCurrent] = useState(0)
  const [next, setNext] = useState(1 % CREATIVES.length)
  const [phase, setPhase] = useState('visible') // 'visible' | 'fading'
  const videoRef = useRef(null)
  const timerRef = useRef(null)
  const preloadRef = useRef({})

  // Preload next asset
  const preload = useCallback((index) => {
    const c = CREATIVES[index]
    if (!c || preloadRef.current[index]) return
    if (c.type === 'image') {
      const img = new Image()
      img.src = c.src
      preloadRef.current[index] = img
    } else {
      const vid = document.createElement('video')
      vid.src = c.src
      vid.preload = 'auto'
      vid.muted = true
      preloadRef.current[index] = vid
    }
  }, [])

  const advance = useCallback(() => {
    setPhase('fading')
    setTimeout(() => {
      setCurrent((prev) => {
        const n = (prev + 1) % CREATIVES.length
        setNext((n + 1) % CREATIVES.length)
        return n
      })
      setPhase('visible')
    }, TRANSITION_MS)
  }, [])

  // Start timer for current creative
  useEffect(() => {
  const c = CREATIVES[current]

  if (c.type === 'image') {
    timerRef.current = setTimeout(advance, c.duration)
  }

  // preload next
  preload((current + 1) % CREATIVES.length)

  return () => clearTimeout(timerRef.current)
}, [current])

  // Handle video end
  const handleVideoEnd = useCallback(() => advance(), [advance])
  const handleVideoError = useCallback(() => advance(), [advance])

  const creative = CREATIVES[current]

  return (
    <div className="creative-player">
      {/* Background media */}
      {creative.type === 'image' ? (
        <div
          key={creative.id}
          className={`creative-bg creative-bg--image ${phase === 'fading' ? 'creative-bg--fade' : ''}`}
          style={{ backgroundImage: `url(${creative.src})` }}
        />
      ) : (
        <video
  key={creative.id}
  ref={videoRef}
  className={`creative-bg creative-bg--video ${phase === 'fading' ? 'creative-bg--fade' : ''}`}
  src={creative.src}
  autoPlay
  muted
  playsInline
  preload="auto"
  controls={false}
  onEnded={handleVideoEnd}
  onError={handleVideoError}
/>
      )}

      {/* Luxury overlay gradients */}
      <div className="creative-overlay creative-overlay--left" />
      <div className="creative-overlay creative-overlay--bottom" />
      <div className="creative-overlay creative-overlay--right" />

      {/* Campaign label */}
      {/* <div className="creative-label">
        <div className="creative-label__line" />
        <p className="creative-label__sub">{creative.sub}</p>
        <h2 className="creative-label__title">{creative.label}</h2>
      </div> */}

      {/* Progress dots */}
      {/* <div className="creative-dots">
        {CREATIVES.map((_, i) => (
          <span
            key={i}
            className={`creative-dot ${i === current ? 'creative-dot--active' : ''}`}
          />
        ))}
      </div> */}
    </div>
  )
}
