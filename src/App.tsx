import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { sections, type MenuItem, type MenuSection } from './data'
import { OrbitalScene } from './OrbitalScene'
import { nearestPosition, wrapIndex } from './carousel'
import brandMarkUrl from './assets/brand-mark.svg'

type Rect = { top: number; left: number; width: number; height: number }
type Selection = { item: MenuItem; rect: Rect; sectionIndex: number; scrollTop: number }
type Phase = 'menu' | 'opening' | 'content' | 'preparing-close' | 'closing'

const ANIMATION_MS = 720

function getGeometry() {
  const viewport = window.innerWidth
  const width = viewport <= 620 ? viewport - 64 : Math.min(1280, viewport * .8)
  const angle = 360 / sections.length
  return { angle, width, radius: width / (2 * Math.tan(angle * Math.PI / 360)) }
}
const HOLOGRAPHIC_PALETTES: [string, string][] = [
  ['#15e8ff', '#0751b8'],
  ['#43b6ff', '#162b92'],
  ['#19d9f4', '#064a78'],
  ['#64f4ff', '#1263cf'],
]

function svgPreview(item: MenuItem) {
  const paletteIndex = [...item.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % HOLOGRAPHIC_PALETTES.length
  const colors = HOLOGRAPHIC_PALETTES[paletteIndex]
  const motif = {
    orbit: `<g fill="none" stroke="#9fefff"><circle cx="530" cy="155" r="108"/><ellipse cx="530" cy="155" rx="150" ry="38" transform="rotate(-24 530 155)"/><ellipse cx="530" cy="155" rx="45" ry="108"/><path d="M422 155H638M530 47V263" opacity=".4"/></g><circle cx="665" cy="95" r="5" fill="#d8faff"/>`,
    grid: `<g fill="none" stroke="#9fefff"><path d="M390 210L490 150 590 190 680 80M390 100L490 150 590 65 680 80M490 150L510 260 590 190 710 240"/><circle cx="390" cy="210" r="8"/><circle cx="490" cy="150" r="15"/><circle cx="590" cy="190" r="8"/><circle cx="680" cy="80" r="8"/><circle cx="590" cy="65" r="5"/><circle cx="390" cy="100" r="5"/><circle cx="510" cy="260" r="5"/><circle cx="710" cy="240" r="5"/></g>`,
    wave: `<g fill="none" stroke="#9fefff"><path d="M330 210L390 210 420 120 460 260 510 90 550 210 600 160 640 160 680 105 740 105" stroke-width="3"/><path d="M330 90H740M330 150H740M330 210H740M330 270H740" opacity=".18"/></g><circle cx="680" cy="105" r="6" fill="#d8faff"/>`,
    arc: `<g fill="none" stroke="#9fefff"><circle cx="550" cy="155" r="105" opacity=".3"/><circle cx="550" cy="155" r="80" stroke-dasharray="310 200" transform="rotate(-90 550 155)" stroke-width="6"/><circle cx="550" cy="155" r="57" stroke-dasharray="190 170" transform="rotate(-90 550 155)"/><path d="M550 35V55M550 255V275M430 155H450M650 155H670"/></g><text x="550" y="166" text-anchor="middle" fill="#b9f3ff" font-family="monospace" font-size="30">84.6</text>`,
  }[item.motif]

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420"><defs><radialGradient id="g"><stop stop-color="${colors[0]}" stop-opacity=".24"/><stop offset="1" stop-color="${colors[1]}" stop-opacity="0"/></radialGradient></defs><rect width="800" height="420" fill="url(#g)"/>${motif}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d={direction === 'left' ? 'M20 7l-9 9 9 9' : 'M12 7l9 9-9 9'} />
    </svg>
  )
}

const previewCache = new WeakMap<MenuItem, string>()
const Artwork = memo(function Artwork({ item }: { item: MenuItem }) {
  let preview = previewCache.get(item)
  if (!preview) {
    preview = svgPreview(item)
    previewCache.set(item, preview)
  }
  return <img className="card-art" src={preview} alt="" loading="lazy" decoding="async" draggable="false" />
})

function HomePanel({ onExplore, onContact }: { onExplore: () => void; onContact: () => void }) {
  return (
    <div className="home-panel">
      <div className="home-copy">
        <p className="led-label"><i /> A space for possibilities</p>
        <h1>A new perspective.<br /><em>New horizons.</em></h1>
        <p className="home-lead">Ideas, resources, and possibilities in one space. Choose a direction and discover what matters to you.</p>
        <div className="home-actions">
          <button onClick={onExplore}>Explore sections <span>→</span></button>
          <button className="secondary-action" onClick={onContact}>Get in touch <span>↗</span></button>
        </div>
      </div>
      <div className="hero-data-cloud" aria-hidden="true">
        <div className="hero-overview">
          <div className="hero-overview__header">
            <span>Your space</span>
            <i />
          </div>
          <div className="hero-overview__value">
            <strong>{String(sections.length).padStart(2, '0')}</strong>
            <span>directions<br />for new ideas</span>
          </div>
          <svg className="hero-overview__graph" viewBox="0 0 260 86" fill="none">
            <path className="hero-overview__guide" d="M8 70H252M8 40H252M8 10H252" />
            <path className="hero-overview__area" d="M8 66C30 66 28 48 50 48S72 56 90 44 110 53 130 32 150 45 170 24 192 35 212 16 230 24 252 8V78H8Z" />
            <path className="hero-overview__curve" d="M8 66C30 66 28 48 50 48S72 56 90 44 110 53 130 32 150 45 170 24 192 35 212 16 230 24 252 8" />
            <circle cx="130" cy="32" r="3" />
            <circle cx="252" cy="8" r="3" />
          </svg>
          <div className="hero-overview__footer">
            <span>One place to start</span>
            <span>↗</span>
          </div>
        </div>
        <div className="hero-overview-stats">
          <div>
            <span>Resources</span>
            <strong>{sections.reduce((count, section) => count + section.items.length, 0)}<small>all in one place</small></strong>
          </div>
          <div>
            <span>Panorama</span>
            <strong>360°<small>an open view</small></strong>
          </div>
        </div>
      </div>
      <div className="metrics-strip">
        <div><span>01</span><strong>24</strong><p>First metric</p></div>
        <div><span>02</span><strong>86%</strong><p>Second metric</p></div>
        <div><span>03</span><strong>12K</strong><p>Third metric</p></div>
        <div><span>04</span><strong>∞</strong><p>Room to grow</p></div>
      </div>
    </div>
  )
}

function SectionHeading({ section }: { section: MenuSection }) {
  return (
    <div className="section-heading">
      <span className="section-index">{section.index}</span>
      <div>
        <p className="kicker">Content module / {section.index}</p>
        <h1>{section.title}</h1>
        <p>{section.subtitle}</p>
      </div>
    </div>
  )
}

function GridPanel({
  section,
  isCurrent,
  onOpen,
}: {
  section: MenuSection
  isCurrent: boolean
  onOpen: (item: MenuItem, rect: Rect) => void
}) {
  return (
    <>
      <SectionHeading section={section} />
      <div className={`card-grid card-grid--count-${section.items.length}`}>
        {section.items.map((item) => (
          <button
            className="menu-card"
            key={item.id}
            data-card-id={item.id}
            tabIndex={isCurrent ? 0 : -1}
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              onOpen(item, { top: rect.top, left: rect.left, width: rect.width, height: rect.height })
            }}
          >
            <span className="card-surface">
              <Artwork item={item} />
              <span className="card-shade" />
              <span className="card-leds"><i /><i /><i /></span>
              <span className="card-copy">
                <span className="card-eyebrow">{item.eyebrow}</span>
                <strong>{item.title}</strong>
                <span className="card-description">{item.description}</span>
              </span>
              <span className="card-open" aria-hidden="true">↗</span>
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

function ContactsPanel() {
  return (
    <div className="contacts-panel">
      <p className="led-label"><i /> Communication channel</p>
      <h1>Let’s create<br />something <em>new.</em></h1>
      <p className="contacts-lead">Every idea starts with a conversation. Get in touch to explore possibilities and take the next step together.</p>
      <div className="contact-lines">
        <a href="mailto:hello@example.com"><span>Email</span><strong>hello@example.com</strong><i>↗</i></a>
        <a href="https://example.com" target="_blank" rel="noreferrer"><span>Social</span><strong>@username</strong><i>↗</i></a>
        <a href="tel:+70000000000"><span>Phone</span><strong>+7 000 000-00-00</strong><i>↗</i></a>
      </div>
      <footer className="contacts-footer"><span>© 2026 / TEMPLATE</span><span>AVAILABLE WORLDWIDE</span></footer>
    </div>
  )
}

function PanoramaMenu({
  activeIndex: position,
  onChange,
  onOpen,
  inert = false,
}: {
  activeIndex: number
  onChange: (next: number) => void
  onOpen: (item: MenuItem, rect: Rect) => void
  inert?: boolean
}) {
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const activeIndex = wrapIndex(position, sections.length)
  const [geometry, setGeometry] = useState(getGeometry)
  const [settledPosition, setSettledPosition] = useState<number | null>(position)
  const rotation = useRef(-position * geometry.angle)
  const renderScene = useRef<(() => void) | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const navButtons = useRef<(HTMLButtonElement | null)[]>([])
  const scrollPositions = useRef(new Map<string, number>())
  const initializedPanels = useRef(new WeakSet<HTMLElement>())
  const isResting = settledPosition === position && Math.abs(rotation.current + position * geometry.angle) < .000001
  const changeBy = useCallback(
    (delta: number) => onChange(position + delta),
    [position, onChange],
  )
  const goTo = useCallback(
    (index: number) => onChange(nearestPosition(position, index, sections.length)),
    [position, onChange],
  )

  useEffect(() => {
    if (inert) return
    const startAngle = rotation.current
    const endAngle = -position * geometry.angle
    if (Math.abs(startAngle - endAngle) < .000001) {
      setSettledPosition(position)
      return
    }
    if (Math.abs(startAngle - endAngle) > .000001) {
      setSettledPosition(null)
    }
    const start = performance.now()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const animate = (now: number) => {
      if (document.hidden) return
      const progress = reduced ? 1 : Math.min((now - start) / 760, 1)
      const eased = progress * progress
      rotation.current = startAngle + (endAngle - startAngle) * eased
      trackRef.current?.style.setProperty('--active-angle', `${rotation.current}deg`)
      const visualPosition = -rotation.current / geometry.angle
      navButtons.current.forEach((button, index) => {
        const offset = nearestPosition(visualPosition, index, sections.length) - visualPosition
        button?.style.setProperty('--nav-offset', String(offset))
        button?.style.setProperty('--nav-opacity', String(Math.max(0, 1 - Math.abs(offset) / 2)))
      })
      renderScene.current?.()
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      } else {
        setSettledPosition(position)
      }
    }
    const onVisibilityChange = () => {
      cancelAnimationFrame(frame)
      if (!document.hidden) frame = requestAnimationFrame(animate)
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    onVisibilityChange()
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [position, geometry.angle, inert])

  useEffect(() => {
    if (inert) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches('input, textarea, select, [contenteditable]')) return
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.preventDefault()
      if (event.key === 'ArrowLeft') changeBy(-1)
      if (event.key === 'ArrowRight') changeBy(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [changeBy, inert])

  useEffect(() => {
    const updateGeometry = () => {
      const next = getGeometry()
      setGeometry((current) => current.width === next.width && current.angle === next.angle ? current : next)
    }
    updateGeometry()
    window.addEventListener('resize', updateGeometry)
    return () => window.removeEventListener('resize', updateGeometry)
  }, [])

  const renderPanel = (index: number, interactive = false) => {
    const section = sections[index]
    const offset = nearestPosition(activeIndex, index, sections.length) - activeIndex
    const isCurrent = offset === 0
    return (
      <article
        key={section.id}
        ref={(panel) => {
          if (panel && !initializedPanels.current.has(panel)) {
            panel.scrollTop = scrollPositions.current.get(section.id) ?? 0
            initializedPanels.current.add(panel)
          }
        }}
        onScroll={(event) => {
          scrollPositions.current.set(section.id, event.currentTarget.scrollTop)
        }}
        className={`section-panel ${isCurrent ? 'is-current' : ''} ${Math.abs(offset) === 1 ? 'is-neighbor' : ''} ${interactive ? 'section-panel--interactive' : ''}`}
        style={{ '--panel-angle': `${index * geometry.angle}deg` } as React.CSSProperties}
        aria-hidden={!interactive}
        inert={!interactive}
      >
        {section.layout === 'home' && <HomePanel onExplore={() => goTo(1)} onContact={() => goTo(sections.length - 1)} />}
        {section.layout === 'grid' && <GridPanel section={section} isCurrent={interactive} onOpen={onOpen} />}
        {section.layout === 'contacts' && <ContactsPanel />}
      </article>
    )
  }

  return (
    <main
      className={`panorama ${inert ? 'panorama--preflight' : ''}`}
      aria-hidden={inert}
      inert={inert}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return
        pointerStart.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return
        const distance = event.clientX - pointerStart.current.x
        const vertical = event.clientY - pointerStart.current.y
        if (Math.abs(distance) > 70 && Math.abs(distance) > Math.abs(vertical) * 1.3) changeBy(distance > 0 ? -1 : 1)
        pointerStart.current = null
      }}
      onPointerCancel={() => { pointerStart.current = null }}
    >
      <OrbitalScene angle={rotation} renderScene={renderScene} />

      <header className="header-shell">
        <a className="brand" href="#home" onClick={(event) => {
          event.preventDefault()
          goTo(0)
        }} aria-label="Panorama — go to home">
          <img className="brand-mark" src={brandMarkUrl} alt="" aria-hidden="true" />
          <span>PANORAMA</span>
        </a>
        <div className="topbar">
          <nav className="section-nav" aria-label="Sections">
          {sections.map((section, index) => {
            const visualPosition = -rotation.current / geometry.angle
            const offset = nearestPosition(visualPosition, index, sections.length) - visualPosition
            const isNearby = Math.abs(nearestPosition(position, index, sections.length) - position) <= 1
            return (
              <button
                key={section.id}
                ref={(button) => { navButtons.current[index] = button }}
                style={{
                  '--nav-offset': offset,
                  '--nav-opacity': Math.max(0, 1 - Math.abs(offset) / 2),
                } as React.CSSProperties}
                tabIndex={isNearby ? 0 : -1}
                aria-hidden={!isNearby}
                className={index === activeIndex ? 'is-active' : ''}
                onClick={() => goTo(index)}
                aria-current={index === activeIndex ? 'page' : undefined}
              >
                {section.title}
              </button>
            )
          })}
          </nav>
        </div>
        <div className="counter" aria-label={`Section ${activeIndex + 1} of ${sections.length}`}>
          <b>{String(activeIndex + 1).padStart(2, '0')}</b>
          <span>/ {String(sections.length).padStart(2, '0')}</span>
        </div>
      </header>

      <button className="edge-hit edge-hit--left" onClick={() => changeBy(-1)} aria-label="Previous section">
        <ArrowIcon direction="left" />
      </button>
      <button className="edge-hit edge-hit--right" onClick={() => changeBy(1)} aria-label="Next section">
        <ArrowIcon direction="right" />
      </button>

      <section className="scene" aria-live="polite" style={{ '--panel-width': `${geometry.width}px` } as React.CSSProperties}>
        <div
          className={`carousel-track ${isResting ? '' : 'is-rotating'}`}
          ref={trackRef}
          style={{
            '--active-angle': `${rotation.current}deg`,
            '--carousel-radius': `${geometry.radius}px`,
            '--panel-width': `${geometry.width}px`,
          } as React.CSSProperties}
        >
          {sections.map((_, index) => isResting && index === activeIndex ? null : renderPanel(index))}
        </div>
        {isResting && renderPanel(activeIndex, true)}
      </section>

      <footer className="footer-hint">
        <span>← →</span>
        <div className="progress"><i style={{ width: `${((activeIndex + 1) / sections.length) * 100}%` }} /></div>
        <span className="footer-position">{String(activeIndex + 1).padStart(2, '0')} — {String(sections.length).padStart(2, '0')}</span>
      </footer>
    </main>
  )
}

function TransitionLayer({ item, rect, expanded }: { item: MenuItem; rect: Rect; expanded: boolean }) {
  const style = expanded
    ? { top: 0, left: 0, width: '100vw', height: '100dvh', borderRadius: 0 }
    : { top: rect.top, left: rect.left, width: rect.width, height: rect.height, borderRadius: 20 }
  return (
    <div className="transition-layer" style={style} aria-hidden="true">
      <Artwork item={item} />
      <span className="transition-vignette" />
    </div>
  )
}

function ContentStage({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const embeds = item.url.startsWith('http')
  return (
    <main className="content-stage">
      <button className="close-button" onClick={onClose} autoFocus aria-label="Close and return to menu">
        <span />
        <span />
      </button>
      <section className="viewer-shell">
        {embeds ? (
          <iframe title={item.title} src={item.url} />
        ) : (
          <div className="viewer-message">
            <p>{item.description}</p>
            <a href={item.url}>Open link</a>
          </div>
        )}
      </section>
    </main>
  )
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('menu')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [expanded, setExpanded] = useState(false)
  const pendingFocus = useRef<string | null>(null)

  const openItem = useCallback((item: MenuItem, rect: Rect) => {
    const scrollTop = document.querySelector('.section-panel.is-current')?.scrollTop ?? 0
    setSelection({ item, rect, sectionIndex: activeIndex, scrollTop })
    setExpanded(false)
    setPhase('opening')
  }, [activeIndex])

  useEffect(() => {
    if (phase !== 'opening' && phase !== 'closing') return
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setExpanded(phase === 'opening'))
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'menu' || !pendingFocus.current) return
    const cardId = pendingFocus.current
    pendingFocus.current = null
    const frame = requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-card-id="${CSS.escape(cardId)}"]`)?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [phase])

  useEffect(() => {
    if (phase !== 'opening' || !expanded) return
    const timer = window.setTimeout(() => setPhase('content'), ANIMATION_MS)
    return () => window.clearTimeout(timer)
  }, [expanded, phase])

  const closeContent = useCallback(() => {
    setExpanded(true)
    setPhase('preparing-close')
  }, [])

  useEffect(() => {
    if (phase !== 'preparing-close' || !selection) return
    const frame = requestAnimationFrame(() => {
      const card = document.querySelector<HTMLElement>(`[data-card-id="${CSS.escape(selection.item.id)}"]`)
      if (!card) {
        setSelection(null)
        setPhase('menu')
        return
      }
      const panel = card.closest('.section-panel')
      if (panel) panel.scrollTop = selection.scrollTop
      const rect = card.getBoundingClientRect()
      setSelection((current) => current && ({ ...current, rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height } }))
      setPhase('closing')
    })
    return () => cancelAnimationFrame(frame)
  }, [phase, selection])

  useEffect(() => {
    if (phase !== 'closing' || expanded || !selection) return
    const timer = window.setTimeout(() => {
      pendingFocus.current = selection.item.id
      setPhase('menu')
      setSelection(null)
    }, ANIMATION_MS)
    return () => window.clearTimeout(timer)
  }, [expanded, phase, selection])

  const showMenu = phase !== 'content'
  const showTransition = selection && (phase === 'opening' || phase === 'preparing-close' || phase === 'closing')

  return (
    <>
      {showMenu && (
        <PanoramaMenu
          activeIndex={selection?.sectionIndex ?? activeIndex}
          onChange={setActiveIndex}
          onOpen={openItem}
          inert={phase !== 'menu'}
        />
      )}
      {phase === 'content' && selection && <ContentStage item={selection.item} onClose={closeContent} />}
      {showTransition && <TransitionLayer item={selection.item} rect={selection.rect} expanded={expanded} />}
    </>
  )
}
