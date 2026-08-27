import { useEffect, useRef } from 'react'
import { assetUrl } from '../assetUrl'

interface DressCodePageProps {
  active: boolean
}

/** Delicate botanical pin ornament */
function BotanicalPin() {
  return (
    <svg
      className="dc-botanical-pin"
      viewBox="0 0 28 38"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="14" y1="36" x2="14" y2="14" stroke="#be8f45" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M14 22 Q8 18 6 13" stroke="#be8f45" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M14 22 Q20 18 22 13" stroke="#be8f45" strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="11" r="2.2" stroke="#be8f45" strokeWidth="1" fill="none" />
      <circle cx="14" cy="11" r="0.7" fill="#be8f45" />
    </svg>
  )
}

/** Small heart closing ornament */
function HeartOrnament() {
  return (
    <svg
      className="dc-heart-ornament"
      viewBox="0 0 40 36"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 32C-4-10 2-12 8-8c4 2 7 8 12 14C25 0 28-6 32-8 38-12 44-10 20 32Z"
        fill="none"
        stroke="#be8f45"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function DressCodePage({ active }: DressCodePageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const activeRef = useRef(false)

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

  return (
    <section
      ref={sectionRef}
      className="invitation-sheet dress-code-page"
      aria-label="Código de vestimenta"
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
              <img src={assetUrl('assets/dresscode/formal-suit-transparent.png')} alt="Traje formal para hombres" draggable={false} />
            </div>
            <h3>HOMBRES</h3>
            <p>Traje formal</p>
          </article>
          <article className="attire-card attire-women">
            <div className="attire-image-frame">
              <img src={assetUrl('assets/dresscode/formal-dress-transparent.png')} alt="Vestido formal para mujeres" draggable={false} />
            </div>
            <h3>MUJERES</h3>
            <p>Vestido formal</p>
          </article>
        </div>

        {/* ── Color notice ── */}
        <div className="color-notice">
          <p>Para ellas, agradecemos <strong>evitar</strong> el color blanco,<br />tonos similares y verde olivo.</p>
          <div className="forbidden-swatches" aria-label="Colores a evitar">
            <span className="swatch white"></span>
            <span className="swatch champagne"></span>
            <span className="swatch olive"></span>
          </div>
          <small>COLORES A EVITAR</small>
        </div>

        {/* ── Closing heart ── */}
        <div className="dc-closing">
          <HeartOrnament />
        </div>

      </div>
    </section>
  )
}
