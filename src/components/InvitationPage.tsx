import { type MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { assetUrl } from '../assetUrl'

interface InvitationPageProps {
  /**
   * When false the paper background is still rendered (visible through the
   * envelope) but all text / portrait content is hidden so nothing bleeds
   * through the envelope artwork before it opens.
   * Becomes true once the envelope has fully departed — triggers entrance animations.
   */
  contentVisible: boolean
  /**
   * Whether the current page is the active (top) page in the stack.
   * Used to hide the swipe hint when the user navigates away.
   */
  isActive: boolean
  /**
   * Ref populated by InvitationPage so the parent (WeddingIntro) can call
   * dismissHint() on the first touch/drag, even when the hint element itself
   * has pointer-events:none and cannot receive native events.
   */
  dismissHintRef?: MutableRefObject<(() => void) | null>
}

/** SessionStorage key — show hint only once per page load */
const HINT_SEEN_KEY = 'swipe-hint-seen'

/**
 * Total duration of the couple GIF (no loop) in ms.
 * Measured from raw GCE delay values: 81 frames, total 1063 centiseconds = 10 630 ms.
 * The hint appears 2 s after this animation finishes.
 * For the still PNG (prefers-reduced-motion) there is no drawing, so only 2 s.
 */
const GIF_DURATION_MS = 10_630
const HINT_PAUSE_MS   = 2_000

export default function InvitationPage({ contentVisible, isActive, dismissHintRef }: InvitationPageProps) {
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const portraitSrc = prefersReducedMotion.current
    ? assetUrl('assets/invitation/couple-magic-drawing-still.png')
    : assetUrl('assets/invitation/couple-magic-drawing.gif')

  // ── Swipe-up hint state ────────────────────────────────────────────
  const [hintVisible, setHintVisible] = useState(false)
  const hintTimerRef       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hintShownRef       = useRef(false)
  // Both signals must fire before the timer starts
  const portraitLoadedRef  = useRef(false)
  const contentVisibleRef  = useRef(false)

  const clearHintTimer = useCallback(() => {
    if (hintTimerRef.current !== null) {
      clearTimeout(hintTimerRef.current)
      hintTimerRef.current = null
    }
  }, [])

  /** Hides the hint immediately and marks the session so it never shows again. */
  const dismissHint = useCallback(() => {
    clearHintTimer()
    setHintVisible(false)
    if (typeof window !== 'undefined') sessionStorage.setItem(HINT_SEEN_KEY, '1')
  }, [clearHintTimer])

  // Expose dismissHint to the parent via the ref it provided
  useEffect(() => {
    if (dismissHintRef) {
      dismissHintRef.current = dismissHint
      return () => { dismissHintRef.current = null }
    }
  }, [dismissHint, dismissHintRef])

  /**
   * Called whenever one of the two signals fires.
   * Starts the timer only once both are ready and the hint hasn't been shown yet.
   *
   * Delay from portrait load event:
   *   GIF  → GIF_DURATION_MS + HINT_PAUSE_MS  (wait for drawing to finish, then 2 s)
   *   PNG  → HINT_PAUSE_MS                    (no drawing animation, just 2 s)
   */
  const tryScheduleHint = useCallback(() => {
    if (!portraitLoadedRef.current) return
    if (!contentVisibleRef.current) return
    if (hintShownRef.current) return
    if (typeof window !== 'undefined' && sessionStorage.getItem(HINT_SEEN_KEY)) return

    const delay = prefersReducedMotion.current
      ? HINT_PAUSE_MS
      : GIF_DURATION_MS + HINT_PAUSE_MS

    clearHintTimer()
    hintTimerRef.current = setTimeout(() => {
      hintShownRef.current = true
      setHintVisible(true)
    }, delay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearHintTimer])

  // Signal 1: envelope has fully departed and content is revealed
  useEffect(() => {
    if (!contentVisible) return
    contentVisibleRef.current = true
    tryScheduleHint()
  }, [contentVisible, tryScheduleHint])

  // Fallback for cached images: if the img is already complete at mount time,
  // onLoad will never fire. Check img.complete once after first render.
  const portraitImgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const img = portraitImgRef.current
    if (img?.complete && !portraitLoadedRef.current) {
      portraitLoadedRef.current = true
      tryScheduleHint()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Hide hint whenever this page leaves the active slot
  useEffect(() => {
    if (!isActive) {
      clearHintTimer()
      setHintVisible(false)
    }
  }, [isActive, clearHintTimer])

  // Cleanup on unmount
  useEffect(() => clearHintTimer, [clearHintTimer])

  // Signal 2: portrait image has loaded — GIF starts playing from this moment
  function handlePortraitLoad() {
    portraitLoadedRef.current = true
    tryScheduleHint()
  }


  return (
    <article
      className={`invitation-page${contentVisible ? ' is-revealed' : ''}`}
      aria-label="Invitación de boda de Montse y Sayd"
    >
      {/* ── Layer 0: paper background — always visible ────────── */}
      <img
        className="invitation-page__paper"
        src={assetUrl('assets/shared/page-front.png')}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      {/* ── Layers 1–4: content — revealed with staggered entrance ── */}
      <p className="invitation-page__headline">NOS CASAMOS</p>

      <img
        className="invitation-page__names"
        src={assetUrl('assets/invitation/montse-sayd-romantic-calligraphy.png')}
        alt="Montse y Sayd"
        draggable={false}
      />

      <p className="invitation-page__date">21 · Diciembre · 2026</p>

      <img
        className="invitation-page__portrait"
        src={portraitSrc}
        alt="Retrato ilustrado de Montse y Sayd"
        ref={portraitImgRef}
        draggable={false}
        onLoad={handlePortraitLoad}
      />

      {/*
       * Swipe-up hint.
       * pointer-events:none in CSS ensures it never blocks gestures.
       * The parent calls dismissHintRef.current() on the first touch.
       */}
      <div
        className={[
          'swipe-hint',
          hintVisible ? 'swipe-hint--visible' : '',
          prefersReducedMotion.current ? 'swipe-hint--reduced' : '',
        ].join(' ').trim()}
        aria-hidden="true"
      >
        <img
          className="swipe-hint__flourish"
          src={assetUrl('assets/invitation/swipe-up-flourish.svg')}
          alt=""
          draggable={false}
        />
        <span className="swipe-hint__label">Desliza hacia arriba</span>
      </div>
    </article>
  )
}
