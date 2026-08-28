/**
 * ClosingPage — Cinematic epilogue for Montse & Sayd.
 *
 * Timeline (≈ 48 s total):
 *   0.0 –  3.0   Prelude: two lines write left-to-right (clip-path)
 *   3.0 –  7.0   Prelude holds fully visible (~4 s reading window)
 *   7.0 –  7.7   Prelude fades out (700 ms)
 *   8.2 – 19.3   Dance: animated WebP (transparent bg, 2:3, 11.1 s) mounted on demand
 *  19.3 – 20.0   Empty paper pause
 *  20.0 – 23.5   Transition text writes itself (two sentences)
 *  23.5 – 26.5   Transition text holds fully visible (~3 s)
 *  26.5 – 27.0   Transition text fades out (500 ms)
 *  27.5 – 43.8   Four photos crossfade — strictly serial, one at a time
 *  44.4 – 51.2   Final message writes itself line by line
 *  51.8 – 56.0   Signature + date fade in → wax seal stamps → hold forever
 *
 * Key decisions:
 *  - Dance is an <img> with the animated WebP. The element is inserted into
 *    the DOM only when the dance phase starts, so the WebP doesn't begin
 *    animating early. It is removed after its phase ends.
 *  - No <video>, no MP4, no mix-blend-mode, no CSS masks, no blend filters.
 *  - Photos use object-fit:contain so their built-in transparent borders show.
 *  - Pen is hidden (not synced to exact stroke position per spec §4/§7).
 */

import { useEffect, useRef, useCallback } from 'react'
import { assetUrl } from '../assetUrl'

// ─── Asset paths ──────────────────────────────────────────────────────────────
const PAPER   = assetUrl('assets/shared/page-front.png')
const DANCE   = assetUrl('assets/closing/montse-sayd-dance-transparent.webp')
const PHOTOS  = [
  assetUrl('assets/closing/01-architecture-hybrid.webp'),
  assetUrl('assets/closing/02-playful-lift-hybrid.webp'),
  assetUrl('assets/closing/03-intimate-hybrid.webp'),
  assetUrl('assets/closing/04-dip-hybrid.webp'),
]
const SEAL         = assetUrl('assets/closing/ms-wax-seal.png')
const MAGIC_GIF    = assetUrl('assets/closing/montse-sayd-magic.gif')
const SPARKLES_WP  = assetUrl('assets/closing/couple-sparkles-loop-subtle.webp')

// WebP dance duration (seconds) + small buffer
const DANCE_DURATION_MS = 11100
// GIF couple magic duration ≈ 9 600 ms — no loop, no ended event; timing embedded inline below

interface ClosingPageProps { active: boolean }

// ─── Component ────────────────────────────────────────────────────────────────
export default function ClosingPage({ active }: ClosingPageProps) {
  const rootRef    = useRef<HTMLElement>(null)
  const seqRef     = useRef<Seq | null>(null)
  const startedRef = useRef(false)
  const reducedRef = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const preloadPhotos = useCallback(() => {
    PHOTOS.forEach(src => { const img = new Image(); img.src = src })
  }, [])

  // ── Start once when page becomes active (same as all other pages) ──────────
  useEffect(() => {
    if (!active || startedRef.current) return
    const timer = window.setTimeout(() => {
      if (startedRef.current) return
      startedRef.current = true
      const root = rootRef.current
      if (!root) return

      if (reducedRef.current) {
        showStatic(root)
        return
      }

      const seq = buildSeq(root, preloadPhotos)
      seqRef.current = seq
      seq.play()
    }, 450)
    return () => window.clearTimeout(timer)
  }, [active, preloadPhotos])

  // ── Pause / resume on tab hide ─────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      if (!seqRef.current) return
      document.hidden ? seqRef.current.pause() : seqRef.current.resume()
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [])

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => () => { seqRef.current?.destroy() }, [])

  // ── Render — static DOM ────────────────────────────────────────────────────
  // The dance <img> is NOT in the initial DOM; it is created and inserted by JS
  // at the dance phase so the WebP doesn't start animating before its turn.
  return (
    <section
      ref={rootRef}
      className="invitation-sheet closing-page"
      aria-label="Epílogo — Montse &amp; Sayd"
    >
      {/* Background paper — identical to every other page */}
      <img
        className="closing-page__paper"
        src={PAPER}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      {/* ── Ambient sparkle stars — activate when the final GIF starts ── */}
      {/* Top-left cluster */}
      <span aria-hidden="true" className="cp-star cp-star--1"  />
      <span aria-hidden="true" className="cp-star cp-star--2"  />
      <span aria-hidden="true" className="cp-star cp-star--3"  />
      {/* Top-right cluster */}
      <span aria-hidden="true" className="cp-star cp-star--4"  />
      <span aria-hidden="true" className="cp-star cp-star--5"  />
      {/* Mid-left */}
      <span aria-hidden="true" className="cp-star cp-star--6"  />
      {/* Centre */}
      <span aria-hidden="true" className="cp-star cp-star--7"  />
      <span aria-hidden="true" className="cp-star cp-star--8"  />
      {/* Mid-right */}
      <span aria-hidden="true" className="cp-star cp-star--9"  />
      {/* Lower area */}
      <span aria-hidden="true" className="cp-star cp-star--10" />
      <span aria-hidden="true" className="cp-star cp-star--11" />
      <span aria-hidden="true" className="cp-star cp-star--12" />

      {/* ── Prelude ── */}
      <div className="cp-prelude">
        <p className="cp-line cp-prelude-line0">Hay historias que se cuentan con palabras…</p>
        <p className="cp-line cp-prelude-line1">y otras que cobran vida.</p>
      </div>

      {/* ── Dance mount point — <img> injected by JS ── */}
      <div className="cp-dance-mount" aria-hidden="true" />

      {/* ── Couple finale mount — GIF + sparkle overlay injected by JS ── */}
      <div className="cp-couple-mount" aria-hidden="true" />

      {/* ── Transitional text (between dance and photos) ── */}
      <div className="cp-transition-block" aria-hidden="true">
        <p className="cp-line cp-tr-line0">Cada historia se construye</p>
        <p className="cp-line cp-tr-line1">con pequeños momentos.</p>
        <p className="cp-line cp-tr-line2 cp-tr-gap">Estos son algunos de los nuestros,</p>
        <p className="cp-line cp-tr-line3">antes de comenzar el más importante.</p>
      </div>

      {/* ── Memory photos ── */}
      <div className="cp-memory-stage">
        {PHOTOS.map((src, i) => (
          <img
            key={src}
            className="cp-memory-photo"
            src={src}
            alt={`Recuerdo ${i + 1} de Montse y Sayd`}
            draggable={false}
          />
        ))}
      </div>

      {/* ── Closing block: message + sign + seal as one column ── */}
      <div className="cp-closing-block">
        <div className="cp-message">
          <p className="cp-line cp-msg-line0">Cada página nos trajo hasta aquí.</p>
          <p className="cp-line cp-msg-line1">Y lo más hermoso de nuestra historia</p>
          <p className="cp-line cp-msg-line2">aún está por escribirse.</p>
          <p className="cp-line cp-msg-line3 cp-msg-gap">Gracias por ser parte de ella.</p>
        </div>

        <div className="cp-sign-block">
          <span className="cp-signature">Montse &amp; Sayd</span>
          <span className="cp-date">21 · Diciembre · 2026</span>
        </div>

        <div className="cp-seal-wrap">
          <img
            className="cp-seal"
            src={SEAL}
            alt="Sello de cera M&S"
            draggable={false}
          />
        </div>
      </div>

      {/* ── Accessible hidden text */}
      <p className="cp-sr-only">
        Hay historias que se cuentan con palabras… y otras que cobran vida.
        Cada historia se construye con pequeños momentos.
        Estos son algunos de los nuestros, antes de comenzar el más importante.
        Cada página nos trajo hasta aquí. Y lo más hermoso de nuestra historia
        aún está por escribirse. Gracias por ser parte de ella.
        Montse &amp; Sayd. 21 · Diciembre · 2026.
      </p>
    </section>
  )
}

// ─── Reduced-motion: static final composition ─────────────────────────────────
function showStatic(root: HTMLElement) {
  // Show the couple GIF in its final-frame state — no animation, no overlay loop.
  // The closing block is hidden; only the couple image and paper remain visible.
  const coupleMount = root.querySelector<HTMLElement>('.cp-couple-mount')
  if (coupleMount) {
    const wrapper = document.createElement('div')
    wrapper.className = 'cp-couple-inner'

    const gifImg = document.createElement('img')
    gifImg.src       = MAGIC_GIF
    gifImg.alt       = ''
    gifImg.className = 'cp-couple-gif'
    gifImg.setAttribute('aria-hidden', 'true')
    gifImg.draggable = false

    wrapper.appendChild(gifImg)
    coupleMount.appendChild(wrapper)
    coupleMount.style.opacity = '1'
  }
}

// ─── Sequence engine ──────────────────────────────────────────────────────────
interface Seq { play(): void; pause(): void; resume(): void; destroy(): void }

function buildSeq(root: HTMLElement, preloadPhotos: () => void): Seq {
  // Each scheduled step is stored so we can cancel and re-schedule on resume.
  const steps: Array<{ ms: number; fn: () => void }> = []
  const timers: number[] = []
  let destroyed  = false
  let playing    = false
  let startedAt  = 0   // wall-clock ms when play() was called

  function at(ms: number, fn: () => void) {
    steps.push({ ms, fn })
    timers.push(window.setTimeout(() => { if (!destroyed) fn() }, ms))
  }

  function fadeEl(el: HTMLElement | null, to: number, dur: number) {
    if (!el) return
    el.style.transition = `opacity ${dur}ms ease`
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { if (el) el.style.opacity = String(to) })
    })
  }

  function qs<T extends HTMLElement>(sel: string) { return root.querySelector<T>(sel) }
  function qsa<T extends HTMLElement>(sel: string) { return Array.from(root.querySelectorAll<T>(sel)) }

  // Write-on: clip-path left-to-right reveal
  function writeLine(el: HTMLElement | null, dur: number) {
    if (!el) return
    el.style.transition = `clip-path ${dur}ms cubic-bezier(0.4,0,0.2,1), opacity 60ms ease`
    el.style.opacity    = '1'
    el.style.clipPath   = 'inset(0 0% 0 0)'
  }

  function resetLines() {
    qsa<HTMLElement>('.cp-line').forEach(el => {
      el.style.transition = 'none'
      el.style.clipPath   = 'inset(0 100% 0 0)'
      el.style.opacity    = '0'
    })
  }

  function resetPhotos() {
    qsa<HTMLElement>('.cp-memory-photo').forEach(el => {
      el.style.transition = 'none'
      el.style.opacity    = '0'
      el.style.transform  = 'scale(1)'
    })
  }

  function showPhoto(el: HTMLElement, dur: number) {
    el.style.transition = `opacity ${dur}ms ease`
    el.style.opacity    = '1'
  }

  function hidePhoto(el: HTMLElement, dur: number) {
    el.style.transition = `opacity ${dur}ms ease`
    el.style.opacity    = '0'
  }

  // ── play ────────────────────────────────────────────────────────────────────
  function play() {
    playing   = true
    startedAt = Date.now()
    resetLines()
    resetPhotos()

    const prelude      = qs<HTMLElement>('.cp-prelude')
    const pLine0       = qs<HTMLElement>('.cp-prelude-line0')
    const pLine1       = qs<HTMLElement>('.cp-prelude-line1')
    const danceMount   = qs<HTMLElement>('.cp-dance-mount')
    const memStage     = qs<HTMLElement>('.cp-memory-stage')
    const closingBlock = qs<HTMLElement>('.cp-closing-block')
    const message      = qs<HTMLElement>('.cp-message')
    const msgLines     = qsa<HTMLElement>('.cp-msg-line0,.cp-msg-line1,.cp-msg-line2,.cp-msg-line3')
    const signBlock    = qs<HTMLElement>('.cp-sign-block')
    const signature    = qs<HTMLElement>('.cp-signature')
    const dateEl       = qs<HTMLElement>('.cp-date')
    const sealWrap     = qs<HTMLElement>('.cp-seal-wrap')
    const sealImg      = qs<HTMLElement>('.cp-seal')
    const photos       = qsa<HTMLElement>('.cp-memory-photo')

    // ── Phase 1: Prelude (0 – 7 700 ms) ──────────────────────────────────────
    // Line 0 writes in 1 400 ms, line 1 starts 400 ms later and writes in 1 200 ms.
    // Last character finishes at ~3 000 ms. Hold fully visible for ~4 s, then fade.
    at(0,    () => { if (prelude) prelude.style.opacity = '1' })
    at(200,  () => writeLine(pLine0, 1400))   // line 0: 0.2 → 1.6 s
    at(1600, () => writeLine(pLine1, 1200))   // line 1: 1.6 → 2.8 s  (400 ms overlap gap)
    // Writing done ≈ 2 800 ms → hold until 7 000 ms (~4.2 s reading window)
    at(7000, () => fadeEl(prelude, 0, 700))   // gentle 700 ms fade

    // ── Phase 2: Dance (8 200 – 19 900 ms) ───────────────────────────────────
    // 700 ms after fade starts = 7 700 ms paper is clean; 500 ms more → mount dance
    const DANCE_START = 8200
    let danceImg: HTMLImageElement | null = null
    at(DANCE_START, () => {
      preloadPhotos()
      if (!danceMount) return
      // Clear any stale element, then inject fresh <img>
      danceMount.innerHTML = ''
      danceImg = document.createElement('img')
      danceImg.src       = DANCE
      danceImg.alt       = ''
      danceImg.className = 'closing-dance'
      danceImg.setAttribute('aria-hidden', 'true')
      danceImg.draggable = false
      danceMount.appendChild(danceImg)
      // Two rAFs ensure the element is painted before we trigger the transition
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (danceMount) {
          danceMount.style.transition = 'opacity 400ms ease'
          danceMount.style.opacity    = '1'
        }
      }))
    })

    // Fade dance out near the end of the WebP (~11.1 s after mount)
    const DANCE_FADE_START = DANCE_START + DANCE_DURATION_MS - 600   // ≈ 18 700 ms
    at(DANCE_FADE_START, () => fadeEl(danceMount, 0, 550))
    // Remove from DOM after fade
    at(DANCE_FADE_START + 650, () => {
      if (danceMount) { danceMount.innerHTML = ''; danceMount.style.opacity = '0' }
      danceImg = null
    })

    // ── Phase 3: Transitional text (20 000 – 27 000 ms) ──────────────────────
    // 700 ms empty-paper pause after dance is removed, then write two sentences.
    //   Line 0–1: first sentence  ("Cada historia…")  — slightly bolder in CSS
    //   Line 2–3: second sentence ("Estos son…")      — slightly more delicate
    // Hold complete text for ~3 s, then gentle fade before photos begin.
    const trBlock  = qs<HTMLElement>('.cp-transition-block')
    const trLine0  = qs<HTMLElement>('.cp-tr-line0')
    const trLine1  = qs<HTMLElement>('.cp-tr-line1')
    const trLine2  = qs<HTMLElement>('.cp-tr-line2')
    const trLine3  = qs<HTMLElement>('.cp-tr-line3')

    const TR_START     = DANCE_FADE_START + 650 + 700   // ≈ 20 050 ms
    const TR_LINE_DUR  = 900    // 0.9 s per line — natural but not rushed
    const TR_LINE_GAP  = 200    // small breath between lines

    at(TR_START, () => { if (trBlock) trBlock.style.opacity = '1' })
    // Sentence 1: lines 0 + 1
    at(TR_START + 100,                               () => writeLine(trLine0, TR_LINE_DUR))
    at(TR_START + 100 + TR_LINE_DUR + TR_LINE_GAP,   () => writeLine(trLine1, TR_LINE_DUR))
    // Small pause (500 ms) between sentences, then sentence 2: lines 2 + 3
    const S2_START = TR_START + 100 + 2 * (TR_LINE_DUR + TR_LINE_GAP) + 500
    at(S2_START,                             () => writeLine(trLine2, TR_LINE_DUR))
    at(S2_START + TR_LINE_DUR + TR_LINE_GAP, () => writeLine(trLine3, TR_LINE_DUR))
    // All four lines done; hold ~3 s, then fade
    const TR_ALL_DONE  = S2_START + 2 * (TR_LINE_DUR + TR_LINE_GAP)
    const TR_HOLD_END  = TR_ALL_DONE + 4200  // ~4.2 s — matches prelude reading window
    at(TR_HOLD_END, () => fadeEl(trBlock, 0, 500))

    // ── Phase 4: Photos — 500 ms after transition text fades ──────────────────
    const PHOTO_START = TR_HOLD_END + 500 + 500  // fade(500) + empty pause(500)
    const PHOTO_XFADE = 450
    const PHOTO_HOLD  = 3000

    at(PHOTO_START, () => {
      if (memStage) memStage.style.opacity = '1'
    })

    photos.forEach((photo, i) => {
      const start = PHOTO_START + i * (PHOTO_HOLD + PHOTO_XFADE)
      at(start,              () => showPhoto(photo, PHOTO_XFADE))
      at(start + PHOTO_HOLD, () => hidePhoto(photo, PHOTO_XFADE))
    })

    const MEM_END = PHOTO_START + photos.length * (PHOTO_HOLD + PHOTO_XFADE)
    at(MEM_END + 100, () => fadeEl(memStage, 0, 300))

    // ── Phase 5: Final message ─────────────────────────────────────────────────
    const MSG_START = MEM_END + 600
    const LINE_DUR  = 1400  // 1.4 s per line — readable at first glance
    const LINE_GAP  = 280   // natural breath between lines

    at(MSG_START, () => {
      if (closingBlock) closingBlock.style.opacity = '1'
      if (message) message.style.opacity = '1'
    })
    msgLines.forEach((el, i) => {
      at(MSG_START + 200 + i * (LINE_DUR + LINE_GAP), () => writeLine(el, LINE_DUR))
    })

    // ── Phase 6: Signature + date ──────────────────────────────────────────────
    const SIGN_START = MSG_START + 200 + msgLines.length * (LINE_DUR + LINE_GAP) + 600
    at(SIGN_START, () => {
      if (signBlock) signBlock.style.opacity = '1'
      if (signature) { signature.style.transition = 'opacity 700ms ease'; signature.style.opacity = '1' }
    })
    at(SIGN_START + 1200, () => {
      if (dateEl) { dateEl.style.transition = 'opacity 600ms ease'; dateEl.style.opacity = '1' }
    })

    // ── Phase 7: Wax seal ─────────────────────────────────────────────────────
    // Phase 8 is chained directly from the seal callback — short relative timers
    // avoid the >30 s setTimeout throttling on background tabs / dimmed screens.
    at(SIGN_START + 2000, () => {
      if (sealWrap) sealWrap.style.opacity = '1'
      if (sealImg)  sealImg.style.animation = 'cp-seal-stamp 0.6s cubic-bezier(0.25,0.46,0.45,0.94) forwards'

      // ── Phase 8: Couple finale — chained off the seal ──────────────────────
      const chain = (delay: number, fn: () => void) => {
        timers.push(window.setTimeout(() => { if (!destroyed) fn() }, delay))
      }

      // 800 ms after seal stamps: mount and reveal GIF bottom-right + activate sparkles
      chain(800, () => {
        // Activate ambient sparkle stars across the page
        root.classList.add('cp-stars-active')

        const coupleMount = qs<HTMLElement>('.cp-couple-mount')
        if (!coupleMount) return

        const wrapper = document.createElement('div')
        wrapper.className = 'cp-couple-inner'

        const gifImg = document.createElement('img')
        gifImg.src        = MAGIC_GIF
        gifImg.alt        = ''
        gifImg.className  = 'cp-couple-gif'
        gifImg.setAttribute('aria-hidden', 'true')
        gifImg.draggable  = false

        const overlay = document.createElement('img')
        overlay.src       = SPARKLES_WP
        overlay.alt       = ''
        overlay.className = 'cp-couple-overlay'
        overlay.setAttribute('aria-hidden', 'true')
        overlay.draggable = false

        wrapper.appendChild(gifImg)
        wrapper.appendChild(overlay)
        coupleMount.appendChild(wrapper)

        requestAnimationFrame(() => requestAnimationFrame(() => {
          coupleMount.style.transition = 'opacity 500ms ease'
          coupleMount.style.opacity    = '1'
        }))

        // 800 + 500 fade-in + 9 600 GIF = 10 900 ms: show sparkle overlay
        chain(10900, () => {
          const ov = root.querySelector<HTMLElement>('.cp-couple-overlay')
          if (!ov) return
          ov.style.transition = 'opacity 600ms ease'
          ov.style.opacity    = '1'
        })
      })
    })
    // Hold forever — no loop on GIF, sparkle overlay loops indefinitely
  }

  // ── pause / resume / destroy ────────────────────────────────────────────────
  function pause() {
    if (!playing) return
    playing = false
    timers.forEach(id => window.clearTimeout(id))
    timers.length = 0
  }

  function resume() {
    if (playing || destroyed) return
    playing = true
    // Re-schedule any steps whose target time is still in the future.
    const elapsed = Date.now() - startedAt
    steps.forEach(({ ms, fn }) => {
      const remaining = ms - elapsed
      if (remaining > 0) {
        timers.push(window.setTimeout(() => { if (!destroyed) fn() }, remaining))
      }
    })
  }

  function destroy() {
    destroyed = true
    timers.forEach(id => window.clearTimeout(id))
    timers.length = 0
    // Remove dance img if still mounted
    const mount = root.querySelector<HTMLElement>('.cp-dance-mount')
    if (mount) mount.innerHTML = ''
    // Remove couple finale if still mounted
    const coupleMount = root.querySelector<HTMLElement>('.cp-couple-mount')
    if (coupleMount) coupleMount.innerHTML = ''
    // Remove sparkle stars activation
    root.classList.remove('cp-stars-active')
  }

  return { play, pause, resume, destroy }
}
