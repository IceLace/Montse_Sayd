import { useEffect, useRef } from 'react'
import { assetUrl } from '../assetUrl'

interface ItineraryPageProps {
  active: boolean
}

// ── Countdown helpers ────────────────────────────────────────────────────────
const WEDDING_DATE = new Date('2026-12-21T13:00:00-06:00')

function getRemaining() {
  const ms = Math.max(0, WEDDING_DATE.getTime() - Date.now())
  const totalMinutes = Math.floor(ms / 60000)
  return {
    days:    Math.floor(totalMinutes / 1440),
    hours:   Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  }
}

function formatUnit(unit: string, value: number): string {
  return unit === 'days' ? String(value) : String(value).padStart(2, '0')
}

function renderCountdown(root: HTMLElement) {
  const remaining = getRemaining()
  root.querySelectorAll<HTMLElement>('[data-itin-unit]').forEach((node) => {
    const unit = node.dataset.itinUnit as string
    const next = formatUnit(unit, remaining[unit as keyof typeof remaining])
    if (node.textContent !== next) node.textContent = next
  })
}

// ── Timeline data ─────────────────────────────────────────────────────────────
// side: which half the text+icon group sits on
const EVENTS = [
  { time: '1:00 PM',  label: 'BODA RELIGIOSA', icon: 'boda-religiosa.png', side: 'left'  },
  { time: '4:00 PM',  label: 'RECEPCIÓN',       icon: 'recepcion.png',      side: 'right' },
  { time: '5:00 PM',  label: 'BODA CIVIL',      icon: 'boda-civil.png',     side: 'left'  },
  { time: '5:30 PM',  label: 'COMIDA',          icon: 'comida.png',         side: 'right' },
  { time: '7:00 PM',  label: 'VALS',            icon: 'vals.png',           side: 'left'  },
  { time: '7:30 PM',  label: 'BAILE',           icon: 'baile.png',          side: 'right' },
  { time: '12:00 AM', label: 'FIN',             icon: 'fin.png',            side: 'left'  },
] as const

export default function ItineraryPage({ active }: ItineraryPageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const activeRef  = useRef(false)

  // Entry animation — fires once on first activation
  useEffect(() => {
    if (!active || activeRef.current) return
    const el = sectionRef.current
    if (!el) return
    const timer = window.setTimeout(() => {
      el.classList.add('is-active')
      activeRef.current = true
      el.querySelectorAll<HTMLElement>('.itin-event').forEach((row, i) => {
        // --itin-pos drives absolute vertical placement (0–6)
        row.style.setProperty('--itin-pos', String(i))
        // --itin-delay drives the entry animation stagger
        row.style.setProperty('--itin-delay', `${1.4 + i * 0.22}s`)
      })
    }, 400)
    return () => window.clearTimeout(timer)
  }, [active])

  // Countdown tick
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    renderCountdown(el)
    let tid: ReturnType<typeof setTimeout>
    const tick = () => {
      const delay = 60000 - (Date.now() % 60000) + 80
      tid = window.setTimeout(() => { renderCountdown(el); tick() }, delay)
    }
    tick()
    return () => window.clearTimeout(tid)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="invitation-sheet itin-page"
      aria-label="Itinerario de la boda"
    >
      {/* Paper background */}
      <img
        className="itin-paper"
        src={assetUrl('assets/shared/page-front.png')}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <div className="itin-content">

        {/* ── Title block ── */}
        <div className="itin-header">
          <img
            className="itin-header-ornament"
            src={assetUrl('assets/itinerary/itinerary-header.png')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <h1 className="itin-title">ITINERARIO</h1>
          <p className="itin-subtitle">Celebremos juntos este día</p>
        </div>

        {/* ── Photograph ── */}
        <div className="itin-photo-wrap">
          <picture>
            <source srcSet={assetUrl('assets/itinerary/itinerary-photo.webp')} type="image/webp" />
            <img
              className="itin-photo"
              src={assetUrl('assets/itinerary/itinerary-photo.png')}
              alt="Montse y Sayd"
              draggable={false}
            />
          </picture>
        </div>

        {/* ── Alternating vertical timeline ──
         *
         * Each row is a 3-col grid:  [left-group] [dot] [right-group]
         *
         * LEFT events:  left-group = flex-row(icon + text),  right-group = empty
         * RIGHT events: left-group = empty,  right-group = flex-row(text + icon)
         *
         * The icon sits flush beside the text so they read as one cluster.
         */}
        <div className="itin-timeline" role="list" aria-label="Programa del día">
          <div className="itin-spine" aria-hidden="true">
            <div className="itin-spine-line" />
          </div>

          {EVENTS.map((ev, i) => (
            <div
              key={ev.label}
              className={`itin-event itin-event--${ev.side}`}
              role="listitem"
              data-index={i}
              style={{ '--itin-pos': String(i) } as React.CSSProperties}
            >
              {/* Left cell: icon+text for left events, empty for right */}
              <div className="itin-cell itin-cell--left">
                {ev.side === 'left' && (
                  <>
                    <img className="itin-event-icon" src={assetUrl(`assets/itinerary/${ev.icon}`)} alt="" aria-hidden="true" draggable={false} />
                    <div className="itin-event-text">
                      <span className="itin-event-time">{ev.time}</span>
                      <span className="itin-event-label">{ev.label}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Centre dot */}
              <div className="itin-dot" aria-hidden="true" />

              {/* Right cell: text+icon for right events, empty for left */}
              <div className="itin-cell itin-cell--right">
                {ev.side === 'right' && (
                  <>
                    <div className="itin-event-text">
                      <span className="itin-event-time">{ev.time}</span>
                      <span className="itin-event-label">{ev.label}</span>
                    </div>
                    <img className="itin-event-icon" src={assetUrl(`assets/itinerary/${ev.icon}`)} alt="" aria-hidden="true" draggable={false} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Countdown ── */}
        <div className="itin-countdown-wrap">
          <div className="itin-faltan-row" aria-hidden="true">
            <span className="itin-faltan-line" />
            <span className="itin-faltan-text">FALTAN</span>
            <span className="itin-faltan-line" />
          </div>
          <div
            className="itin-countdown"
            aria-live="polite"
            aria-label="Tiempo restante para la ceremonia"
          >
            <div className="itin-cunit">
              <span className="itin-cvalue" data-itin-unit="days">0</span>
              <small>DÍAS</small>
            </div>
            <div className="itin-csep" aria-hidden="true" />
            <div className="itin-cunit">
              <span className="itin-cvalue" data-itin-unit="hours">00</span>
              <small>HORAS</small>
            </div>
            <div className="itin-csep" aria-hidden="true" />
            <div className="itin-cunit">
              <span className="itin-cvalue" data-itin-unit="minutes">00</span>
              <small>MINUTOS</small>
            </div>
          </div>
        </div>

        {/* ── Bottom heart flourish ── */}
        <div className="itin-heart-wrap" aria-hidden="true">
          <img
            className="itin-heart"
            src={assetUrl('assets/itinerary/corazon.png')}
            alt=""
            draggable={false}
          />
        </div>

      </div>
    </section>
  )
}
