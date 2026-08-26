import { useEffect, useRef } from 'react'
import { assetUrl } from '../assetUrl'

interface GiftsPageProps {
  /** True once this slot is the active visible sheet. */
  active: boolean
}

export default function GiftsPage({ active }: GiftsPageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const revealedRef = useRef(false)

  useEffect(() => {
    if (!active || revealedRef.current) return
    const el = sectionRef.current
    if (!el) return

    // Stop vertical page-swipe propagation on registry cards
    const cards = el.querySelectorAll<HTMLAnchorElement>('.registry-card')
    cards.forEach((card) => {
      card.addEventListener('click', (e) => e.stopPropagation())
      card.addEventListener('pointerdown', (e) => e.stopPropagation())
      card.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true })
    })

    const timer = window.setTimeout(() => {
      el.classList.add('is-revealed')
      el.dataset.revealed = 'true'
      revealedRef.current = true
    }, 450)

    return () => window.clearTimeout(timer)
  }, [active])

  // Pause infinite card-border sparkles when this page is not active,
  // resume when it becomes active again.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (active) {
      el.classList.remove('btn-stars-paused')
    } else {
      el.classList.add('btn-stars-paused')
    }
  }, [active])

  return (
    <section
      ref={sectionRef}
      className="invitation-sheet gifts-page"
      aria-label="Mesa de regalos"
    >
      <img className="gifts-page__paper" src={assetUrl('assets/shared/page-front.png')} alt="" aria-hidden="true" draggable={false} />
      <img className="gifts-sprig" src={assetUrl('assets/gifts/gifts-sprig.png')} alt="" aria-hidden="true" draggable={false} />
      <h2 className="gifts-heading">REGALOS</h2>

      <div className="gift-stage" aria-hidden="true">
        <img className="gift-box" src={assetUrl('assets/gifts/gift-box-outline.png')} alt="" draggable={false} />
        <img className="gift-ribbon" src={assetUrl('assets/gifts/gift-ribbon-bow.png')} alt="" draggable={false} />
      </div>

      {/* 3 one-shot sparkles near the bow — fire once, no repeat */}
      <span aria-hidden="true" className="gift-star gift-star--a" />
      <span aria-hidden="true" className="gift-star gift-star--b" />
      <span aria-hidden="true" className="gift-star gift-star--c" />

      <p className="gifts-primary">TU PRESENCIA ES<br />NUESTRO MEJOR REGALO</p>
      <div className="gifts-divider" aria-hidden="true"><i></i></div>

      <p className="gifts-copy">
        Si deseas tener un detalle con nosotros,<br />
        puedes hacerlo en alguna de nuestras<br />
        mesas de regalos.
      </p>

      {/* Registry section */}
      <div className="registry-section">
        <p className="registry-section__label">ELIGE UNA MESA DE REGALOS</p>

        {/* Amazon card */}
        <a
          className="registry-card registry-card--amazon"
          href="https://www.amazon.com.mx/wedding/guest-view/2IKIY56SHC1V8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="registry-card__icon" src={assetUrl('assets/gifts/amazon-registry-icon.png')} alt="Amazon" draggable={false} />
          <span className="registry-card__text">
            <span className="registry-card__name">AMAZON</span>
            <span className="registry-card__cta">VER MESA DE REGALOS →</span>
          </span>
          {/* Infinite border sparkles — Amazon phase */}
          <span aria-hidden="true" className="btn-star btn-star--a1" />
          <span aria-hidden="true" className="btn-star btn-star--a2" />
          <span aria-hidden="true" className="btn-star btn-star--a3" />
        </a>

        {/* Liverpool card */}
        <a
          className="registry-card registry-card--liverpool"
          href="https://mesaderegalos.liverpool.com.mx/milistaderegalos/60031252"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img className="registry-card__icon" src={assetUrl('assets/gifts/liverpool-registry-icon.png')} alt="Liverpool" draggable={false} />
          <span className="registry-card__text">
            <span className="registry-card__name">LIVERPOOL</span>
            <span className="registry-card__cta">VER MESA DE REGALOS →</span>
          </span>
          {/* Infinite border sparkles — Liverpool phase (delayed after Amazon) */}
          <span aria-hidden="true" className="btn-star btn-star--l1" />
          <span aria-hidden="true" className="btn-star btn-star--l2" />
          <span aria-hidden="true" className="btn-star btn-star--l3" />
        </a>

        {/* Alcancía note — each span forces exactly one line on mobile */}
        <p className="registry-alcancia">
          <span className="registry-alcancia__line">Si deseas hacernos un obsequio en efectivo,</span>
          <span className="registry-alcancia__line">durante la recepción encontrarás una alcancía</span>
          <span className="registry-alcancia__line">preparada para ello.</span>
        </p>
      </div>

      <div className="gift-footer" aria-hidden="true">
        <img className="gift-footer__ribbon" src={assetUrl('assets/gifts/bottom-gift-ribbon.png')} alt="" draggable={false} />
        <img className="gift-footer__tag" src={assetUrl('assets/gifts/gift-tag-ms.png')} alt="" draggable={false} />
      </div>
    </section>
  )
}
