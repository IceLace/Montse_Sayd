import { useEffect, useRef } from 'react'
import { assetUrl } from '../assetUrl'

interface DressCodePageProps {
  active: boolean
}

const WEDDING_DATE = new Date('2026-12-21T13:00:00-06:00')

function getRemaining() {
  const ms = Math.max(0, WEDDING_DATE.getTime() - Date.now())
  const totalMinutes = Math.floor(ms / 60000)
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  }
}

function formatUnit(unit: string, value: number): string {
  return unit === 'days' ? String(value) : String(value).padStart(2, '0')
}

function renderCountdown(root: HTMLElement) {
  const remaining = getRemaining()
  root.querySelectorAll<HTMLElement>('[data-unit]').forEach((node) => {
    const unit = node.dataset.unit as string
    const next = formatUnit(unit, remaining[unit as keyof typeof remaining])
    if (node.textContent !== next) node.textContent = next
  })
}

/** Delicate botanical pin ornament matching the preview */
function BotanicalPin() {
  return (
    <svg
      className="dc-botanical-pin"
      viewBox="0 0 28 38"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stem */}
      <line x1="14" y1="36" x2="14" y2="14" stroke="#be8f45" strokeWidth="1.1" strokeLinecap="round" />
      {/* Left leaf arm */}
      <path d="M14 22 Q8 18 6 13" stroke="#be8f45" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Right leaf arm */}
      <path d="M14 22 Q20 18 22 13" stroke="#be8f45" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Top small circle/bud */}
      <circle cx="14" cy="11" r="2.2" stroke="#be8f45" strokeWidth="1" fill="none" />
      {/* Small dot centre */}
      <circle cx="14" cy="11" r="0.7" fill="#be8f45" />
    </svg>
  )
}

/** Clean clock: circle + two hands + centre dot, no decorative arches */
function ClockOrnament() {
  return (
    <svg
      className="dc-clock-ornament"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clock circle */}
      <circle cx="32" cy="32" r="23" stroke="#be8f45" strokeWidth="1.8" fill="none" />
      {/* Hour hand — pointing to 12 */}
      <line x1="32" y1="32" x2="32" y2="13" stroke="#be8f45" strokeWidth="1.8" strokeLinecap="round" />
      {/* Minute hand — pointing to ~1 */}
      <line x1="32" y1="32" x2="43" y2="21" stroke="#be8f45" strokeWidth="1.8" strokeLinecap="round" />
      {/* Centre dot */}
      <circle cx="32" cy="32" r="2.2" fill="#be8f45" />
    </svg>
  )
}

export default function DressCodePage({ active }: DressCodePageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const activeRef = useRef(false)

  // ── Entry animation: add is-active only on the FIRST visit, never remove ──
  useEffect(() => {
    if (!active || activeRef.current) return
    const el = sectionRef.current
    if (!el) return
    const timer = window.setTimeout(() => {
      el.classList.add('is-active')
      activeRef.current = true
    }, 400)
    return () => window.clearTimeout(timer)
  }, [active])

  // ── Countdown: initialise and schedule once on mount ─────────────────────
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    renderCountdown(el)

    let timeoutId: ReturnType<typeof setTimeout>
    const scheduleNextMinute = () => {
      const delay = 60000 - (Date.now() % 60000) + 80
      timeoutId = window.setTimeout(() => {
        renderCountdown(el)
        scheduleNextMinute()
      }, delay)
    }
    scheduleNextMinute()

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="invitation-sheet dress-code-page"
      aria-label="Código de vestimenta y contador"
    >
      <img
        className="dress-code-paper"
        src={assetUrl('assets/shared/page-front.png')}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <div className="dress-code-content">

        {/* ── Header block ── */}
        <div className="dc-header">
          <BotanicalPin />
          <h1>
            <span>PREPÁRATE PARA</span>
            <span>CELEBRAR</span>
          </h1>
          <h2 className="dc-subtitle">CÓDIGO DE VESTIMENTA</h2>
          <p className="formal-label">FORMAL</p>
          <div className="fine-divider" aria-hidden="true"><i></i></div>
        </div>

        {/* ── Attire grid ── */}
        <div className="attire-grid">
          <article className="attire-card attire-men">
            <div className="attire-image-frame">
              <img src={assetUrl('assets/dresscode/formal-suit-transparent.png')} alt="Traje formal para caballeros" draggable={false} />
            </div>
            <h3>CABALLEROS</h3>
            <p>Traje formal</p>
          </article>
          <article className="attire-card attire-women">
            <div className="attire-image-frame">
              <img src={assetUrl('assets/dresscode/formal-dress-transparent.png')} alt="Vestido formal para damas" draggable={false} />
            </div>
            <h3>DAMAS</h3>
            <p>Vestido formal</p>
          </article>
        </div>

        {/* ── Color notice ── */}
        <div className="color-notice">
          <p>Agradecemos a las damas evitar el color blanco,<br />tonos similares y verde olivo.</p>
          <div className="forbidden-swatches" aria-label="Colores a evitar">
            <span className="swatch white"></span>
            <span className="swatch champagne"></span>
            <span className="swatch olive"></span>
          </div>
          <small>COLORES A EVITAR</small>
        </div>

        {/* ── Countdown section — right-offset to clear the bouquet ── */}
        <div className="countdown-section">
          <div className="fine-divider countdown-divider" aria-hidden="true"><i></i></div>
          <div className="countdown-heading">
            <p>FALTA MUY POCO PARA</p>
            <h2 className="dc-gran-dia">NUESTRO GRAN DÍA</h2>
          </div>

          <div className="countdown" aria-live="polite" aria-label="Tiempo restante para la ceremonia">
            <div className="countdown-unit">
              <span className="countdown-value" data-unit="days">0</span>
              <small>DÍAS</small>
            </div>
            <span className="countdown-dot" aria-hidden="true">•</span>
            <div className="countdown-unit">
              <span className="countdown-value" data-unit="hours">00</span>
              <small>HORAS</small>
            </div>
            <span className="countdown-dot" aria-hidden="true">•</span>
            <div className="countdown-unit">
              <span className="countdown-value" data-unit="minutes">00</span>
              <small>MINUTOS</small>
            </div>
          </div>

          <p className="event-date">21 DE DICIEMBRE DE 2026</p>
          <p className="event-time">1:00 P. M.</p>
          <ClockOrnament />
        </div>

      </div>
    </section>
  )
}
