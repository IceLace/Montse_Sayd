import { useCallback, useEffect, useRef, useState } from 'react'
import { assetUrl } from '../assetUrl'
import Envelope from './Envelope'
import InvitationPage from './InvitationPage'
import AnnouncementPage from './AnnouncementPage'
import FamilyPage from './FamilyPage'
import CeremonyPage from './CeremonyPage'
import ReceptionPage from './ReceptionPage'
import GiftsPage from './GiftsPage'
import DressCodePage from './DressCodePage'
import RsvpPage from './RsvpPage'
import ClosingPage from './ClosingPage'

const MUSIC_SRC = assetUrl('assets/music/ivory-and-gold.mp3')
const MUSIC_TARGET_VOLUME = 0.32
const MUSIC_FADE_MS = 280

function preloadImage(src: string) {
  const img = new Image()
  img.src = src
}

const PRELOAD_ASSETS = [
  assetUrl('assets/shared/page-front.png'),
  assetUrl('assets/invitation/montse-sayd-romantic-calligraphy.png'),
  assetUrl('assets/invitation/couple-magic-drawing.gif'),
  assetUrl('assets/invitation/wedding-rings-divider.png'),
  assetUrl('assets/family/family-divider.png'),
  assetUrl('assets/family/vigil-candles.png'),
  assetUrl('assets/family/wedding-rings.png'),
  assetUrl('assets/family/arras-chest.png'),
  assetUrl('assets/location/ceremony-map.png'),
  assetUrl('assets/location/reception-map.png'),
  assetUrl('assets/location/map-pin.png'),
  assetUrl('assets/location/location-sprig.png'),
  assetUrl('assets/gifts/gifts-sprig.png'),
  assetUrl('assets/gifts/gift-box-outline.png'),
  assetUrl('assets/gifts/gift-ribbon-bow.png'),
  assetUrl('assets/gifts/bottom-gift-ribbon.png'),
  assetUrl('assets/gifts/gift-tag-ms.png'),
  assetUrl('assets/rsvp/rsvp-sprig.png'),
  assetUrl('assets/rsvp/confirmation-envelope.png'),
  assetUrl('assets/dresscode/formal-suit-transparent.png'),
  assetUrl('assets/dresscode/formal-dress-transparent.png'),
]

/**
 * Total number of pages in the stack.
 * 1 = InvitationPage   (front cover)
 * 2 = AnnouncementPage
 * 3 = FamilyPage
 * 4 = CeremonyPage
 * 5 = ReceptionPage
 * 6 = GiftsPage
 * 7 = DressCodePage
 * 8 = RsvpPage
 * 9 = ClosingPage  (last page — no sheets underneath)
 */
const FIRST_PAGE = 1
const LAST_PAGE  = 9

/**
 * Physical stack offsets per depth level.
 * depth 0 = active top page (no offset), depth 1 = immediately below, etc.
 */
const STACK_OFFSETS: Array<{ x: number; y: number; rot: number }> = [
  { x:  0, y:  0, rot:  0    },
  { x:  2, y:  5, rot:  0.25 },
  { x: -2, y:  9, rot: -0.25 },
  { x:  1, y: 13, rot:  0.18 },
  { x: -1, y: 17, rot: -0.18 },
  { x:  0, y: 21, rot:  0.10 },
  { x:  1, y: 24, rot: -0.10 },
  { x: -1, y: 27, rot:  0.08 },
  { x:  0, y: 30, rot:  0.06 },
]

/**
 * Drop-shadow per depth level — progressively softer.
 */
const STACK_SHADOWS = [
  'drop-shadow(0 8px 24px rgba(0,0,0,0.45))',
  'drop-shadow(0 5px 14px rgba(0,0,0,0.28))',
  'drop-shadow(0 4px 10px rgba(0,0,0,0.20))',
  'drop-shadow(0 3px  8px rgba(0,0,0,0.15))',
  'drop-shadow(0 2px  6px rgba(0,0,0,0.11))',
  'drop-shadow(0 2px  5px rgba(0,0,0,0.08))',
  'drop-shadow(0 1px  4px rgba(0,0,0,0.06))',
  'drop-shadow(0 1px  3px rgba(0,0,0,0.04))',
  'drop-shadow(0 1px  2px rgba(0,0,0,0.03))',
]

/** Duration of the active-page departure animation (ms) — must match CSS transition. */
const DEPARTURE_MS    = 900
const SWIPE_THRESHOLD = 55
const WHEEL_THRESHOLD = 70
const WHEEL_LOCK_MS   = 800
const WHEEL_IDLE_MS   = 160

export default function WeddingIntro() {
  /**
   * paperRef — attached to the slot-1 div so Envelope's GSAP tween can
   * scale it (0.985 → 1) as the envelope halves slide apart.
   * Slot 1's InvitationPage shows the paper texture always; only its
   * text/portrait content is hidden until the envelope fully departs.
   */
  const paperRef = useRef<HTMLDivElement>(null)

  // ── Audio ─────────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null)
  if (audioRef.current === null) {
    const audio = new Audio(MUSIC_SRC)
    audio.loop = true
    audio.volume = 0
    audio.preload = 'auto'
    audioRef.current = audio
  }

  function handlePlay() {
    const audio = audioRef.current
    if (!audio || !audio.paused) return
    audio.volume = 0
    audio.play().catch(() => {})
    const steps = 14
    const interval = MUSIC_FADE_MS / steps
    const increment = MUSIC_TARGET_VOLUME / steps
    let step = 0
    const timer = window.setInterval(() => {
      step += 1
      if (!audio) { window.clearInterval(timer); return }
      if (step >= steps) {
        audio.volume = MUSIC_TARGET_VOLUME
        window.clearInterval(timer)
      } else {
        audio.volume = Math.min(MUSIC_TARGET_VOLUME, audio.volume + increment)
      }
    }, interval)
  }

  // ── State ─────────────────────────────────────────────────────────────────
  const [envelopeVisible,   setEnvelopeVisible]   = useState(true)
  /**
   * invitationContentVisible: controls whether InvitationPage shows its
   * text/portrait. Becomes true once the envelope fully departs.
   * The paper background inside InvitationPage is always rendered so it
   * appears through the opening envelope without any flash.
   */
  const [invitationContentVisible, setInvitationContentVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState<number>(FIRST_PAGE)

  const gestureActiveRef  = useRef(false)
  const transitionLocked  = useRef(false)

  useEffect(() => { PRELOAD_ASSETS.forEach(preloadImage) }, [])

  // ── Navigation ────────────────────────────────────────────────────────────
  const goToPage = useCallback((next: number) => {
    if (transitionLocked.current) return
    const min     = gestureActiveRef.current ? FIRST_PAGE : 0
    const clamped = Math.max(min, Math.min(LAST_PAGE, next))
    if (clamped === currentPage) return
    transitionLocked.current = true
    setCurrentPage(clamped)
    window.setTimeout(() => { transitionLocked.current = false }, DEPARTURE_MS)
  }, [currentPage])

  // ── Envelope callbacks ────────────────────────────────────────────────────
  function handleOpenStart() {
    // Paper texture already visible via slot 1 — nothing extra needed.
  }

  function handleOpenComplete() {
    setEnvelopeVisible(false)
    setInvitationContentVisible(true)
    gestureActiveRef.current = true
  }

  // ── Touch / swipe ─────────────────────────────────────────────────────────
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!gestureActiveRef.current) return
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!gestureActiveRef.current || !touchStartRef.current) return
    const start = touchStartRef.current
    touchStartRef.current = null
    const t  = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) > Math.abs(dy)) return
    if (dy < 0 && Math.abs(dy) >= SWIPE_THRESHOLD) goToPage(currentPage + 1)
    else if (dy > 0 && dy >= SWIPE_THRESHOLD && currentPage > FIRST_PAGE) goToPage(currentPage - 1)
  }, [currentPage, goToPage])

  // ── Wheel ─────────────────────────────────────────────────────────────────
  const wheelAccumRef       = useRef(0)
  const wheelIdleTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wheelLockedUntilRef = useRef(0)

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!gestureActiveRef.current) return
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
    const now = Date.now()
    if (now < wheelLockedUntilRef.current) return
    if (wheelIdleTimerRef.current !== null) clearTimeout(wheelIdleTimerRef.current)
    wheelIdleTimerRef.current = setTimeout(() => { wheelAccumRef.current = 0 }, WHEEL_IDLE_MS)
    wheelAccumRef.current += e.deltaY
    if (wheelAccumRef.current >= WHEEL_THRESHOLD) {
      wheelAccumRef.current = 0
      wheelLockedUntilRef.current = now + WHEEL_LOCK_MS
      goToPage(currentPage + 1)
    } else if (wheelAccumRef.current <= -WHEEL_THRESHOLD) {
      wheelAccumRef.current = 0
      wheelLockedUntilRef.current = now + WHEEL_LOCK_MS
      if (currentPage > FIRST_PAGE) goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!gestureActiveRef.current) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault(); goToPage(currentPage + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        if (currentPage > FIRST_PAGE) goToPage(currentPage - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentPage, goToPage])

  // ── Stack slot helpers ────────────────────────────────────────────────────
  //
  // ALL visual values (transform, opacity, visibility, filter, zIndex) are set
  // as inline style so the browser always interpolates between two inline values.
  // CSS only provides the transition timing. This avoids any CSS/inline conflict
  // that would cause jumps.
  //
  function slotProps(index: number): { className: string; style: React.CSSProperties } {
    const base = `page-slot page-slot--${index}`

    if (index < currentPage) {
      // Departed: slide up and fade out, staying on top during the animation.
      // zIndex 9 keeps it above the newly-active page (8) so it slides away
      // over the top rather than disappearing behind it.
      // visibility is NOT set here — the CSS .is-above rule handles the delayed
      // visibility:hidden so the element stays visible during the slide-out.
      return {
        className: `${base} is-above`,
        style: {
          transform: 'translateY(-108%)',
          opacity:   0,
          zIndex:    9,
          filter:    'none',
        },
      }
    }

    if (index === currentPage) {
      // Active top sheet: centered, full opacity, strongest shadow
      return {
        className: `${base} is-active`,
        style: {
          transform:  'translateY(0)',
          opacity:    1,
          visibility: 'visible',
          zIndex:     8,
          filter:     STACK_SHADOWS[0],
        },
      }
    }

    // Below the active sheet: physical offset, full opacity, softer shadow
    const depth  = index - currentPage
    const off    = STACK_OFFSETS[Math.min(depth, STACK_OFFSETS.length - 1)]
    const shadow = STACK_SHADOWS [Math.min(depth, STACK_SHADOWS.length  - 1)]

    return {
      className: `${base} is-below`,
      style: {
        transform:  `translate(${off.x}px, ${off.y}px) rotate(${off.rot}deg)`,
        opacity:    1,
        visibility: 'visible',
        zIndex:     8 - depth,
        filter:     shadow,
      },
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="stage"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/*
       * Physical page stack — always in the DOM and always visible.
       *
       * Slot 1 (InvitationPage) renders its paper-texture <img> unconditionally
       * so it shows through the opening envelope (GSAP scales this div via
       * paperRef). Its text / portrait are hidden until invitationContentVisible.
       *
       * All slots start with z-index values well below the envelope (z-index 10),
       * so nothing competes with the envelope visually before it departs.
       */}
      <div className="page-stack">

        {/* Slot 1: InvitationPage — paperRef here for GSAP envelope-open scale */}
        {(() => { const p = slotProps(1); return (
          <div ref={paperRef} className={p.className} style={p.style}>
            <InvitationPage contentVisible={invitationContentVisible} />
          </div>
        )})()}

        {/* Slot 2: AnnouncementPage */}
        {(() => { const p = slotProps(2); return (
          <div className={p.className} style={p.style}>
            <AnnouncementPage active={currentPage === 2} />
          </div>
        )})()}

        {/* Slot 3: FamilyPage */}
        {(() => { const p = slotProps(3); return (
          <div className={p.className} style={p.style}>
            <FamilyPage active={currentPage === 3} />
          </div>
        )})()}

        {/* Slot 4: CeremonyPage */}
        {(() => { const p = slotProps(4); return (
          <div className={p.className} style={p.style}>
            <CeremonyPage active={currentPage === 4} />
          </div>
        )})()}

        {/* Slot 5: ReceptionPage */}
        {(() => { const p = slotProps(5); return (
          <div className={p.className} style={p.style}>
            <ReceptionPage active={currentPage === 5} />
          </div>
        )})()}

        {/* Slot 6: GiftsPage */}
        {(() => { const p = slotProps(6); return (
          <div className={p.className} style={p.style}>
            <GiftsPage active={currentPage === 6} />
          </div>
        )})()}

        {/* Slot 7: DressCodePage */}
        {(() => { const p = slotProps(7); return (
          <div className={p.className} style={p.style}>
            <DressCodePage active={currentPage === 7} />
          </div>
        )})()}

        {/* Slot 8: RsvpPage */}
        {(() => { const p = slotProps(8); return (
          <div className={p.className} style={p.style}>
            <RsvpPage active={currentPage === 8} />
          </div>
        )})()}

        {/* Slot 9: ClosingPage — last page, no sheets underneath */}
        {(() => { const p = slotProps(9); return (
          <div className={p.className} style={p.style}>
            <ClosingPage active={currentPage === 9} />
          </div>
        )})()}
      </div>

      {/* Envelope — highest z-index, removed from DOM once fully open */}
      {envelopeVisible && (
        <Envelope
          paperRef={paperRef}
          onOpenStart={handleOpenStart}
          onOpenComplete={handleOpenComplete}
          onPlay={handlePlay}
        />
      )}
    </div>
  )
}
