import { useEffect, useRef } from 'react'
import { assetUrl } from '../assetUrl'

interface CeremonyPageProps {
  /** True once this slot is the active visible sheet. */
  active: boolean
}

export default function CeremonyPage({ active }: CeremonyPageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const revealedRef = useRef(false)

  useEffect(() => {
    if (!active || revealedRef.current) return
    const el = sectionRef.current
    if (!el) return

    // Attach maps-link protection (stopPropagation on click / pointerdown / touchstart)
    el.querySelectorAll<HTMLAnchorElement>('.maps-link').forEach((link) => {
      link.addEventListener('click', (e) => e.stopPropagation())
      link.addEventListener('pointerdown', (e) => e.stopPropagation())
      link.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true })
    })

    const timer = window.setTimeout(() => {
      el.classList.add('is-revealed')
      el.dataset.revealed = 'true'
      revealedRef.current = true
    }, 450)

    return () => window.clearTimeout(timer)
  }, [active])

  return (
    <section
      ref={sectionRef}
      className="invitation-sheet location-page ceremony-page"
      aria-label="Ubicación de la ceremonia"
    >
      <img className="location-page__paper" src={assetUrl('assets/shared/page-front.png')} alt="" aria-hidden="true" draggable={false} />
      <img className="location-sprig" src={assetUrl('assets/location/location-sprig.png')} alt="" aria-hidden="true" draggable={false} />

      <h2 className="location-heading">CEREMONIA RELIGIOSA</h2>
      <p className="location-venue">Templo del Sagrado Corazón de Jesús</p>

      <div className="location-time" aria-label="Hora: 1:00 p. m.">
        <svg className="location-clock" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle className="clock-ring" cx="16" cy="16" r="13.5" stroke="#c9a84c" strokeWidth="1.2" />
          <line className="clock-hand clock-hand--hour"   x1="16" y1="16" x2="16"   y2="8"  stroke="#c9a84c" strokeWidth="1.4" strokeLinecap="round" />
          <line className="clock-hand clock-hand--minute" x1="16" y1="16" x2="22.5" y2="16" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
          <circle className="clock-center" cx="16" cy="16" r="1.2" fill="#c9a84c" />
        </svg>
        <span className="location-time__text">1:00 p.&nbsp;m.</span>
      </div>

      <figure className="location-map" style={{ '--pin-x': '47.9%', '--pin-y': '47.4%' } as React.CSSProperties}>
        <img className="location-map__image" src={assetUrl('assets/location/ceremony-map.png')} alt="Mapa del Templo del Sagrado Corazón de Jesús" draggable={false} />
        <img className="location-map__pin" src={assetUrl('assets/location/map-pin.png')} alt="" aria-hidden="true" draggable={false} />
      </figure>

      <address className="location-address">
        Residencial Los Fresnos,<br />
        Aguascalientes, Ags. C.P. 20328
      </address>

      <a
        className="maps-link"
        href="https://maps.app.goo.gl/Z8afitqbiNdpMKiR7"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>VER EN MAPS</span><i aria-hidden="true"></i>
      </a>
    </section>
  )
}
