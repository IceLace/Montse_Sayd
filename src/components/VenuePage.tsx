import { useEffect, useRef } from 'react'
import { assetUrl } from '../assetUrl'

interface VenuePageProps {
  /** True once this slot is the active visible sheet. */
  active: boolean
  className: string
  ariaLabel: string
  ornament?: string
  heading: string
  venueName: string
  time: string
  venueImageWebp: string
  venueImagePng: string
  mapImage: string
  mapPinX: string
  mapPinY: string
  address: React.ReactNode
  mapsUrl: string
}

export default function VenuePage({
  active,
  className,
  ariaLabel,
  ornament,
  heading,
  venueName,
  time,
  venueImageWebp,
  venueImagePng,
  mapImage,
  address,
  mapsUrl,
}: VenuePageProps) {
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
      className={`invitation-sheet location-page ${className}`}
      aria-label={ariaLabel}
    >
      {/* Paper background */}
      <img
        className="location-page__paper"
        src={assetUrl('assets/shared/page-front.png')}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <div className="location-page__content">
        {/* Header Group */}
        <div className="location-header-group">
          {ornament && (
            <img
              className="location-ornament"
              src={assetUrl(ornament)}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          )}
          <h2 className="location-heading">{heading}</h2>
          <p className="location-venue">{venueName}</p>

          <div className="location-time" aria-label={`Hora: ${time}`}>
            <img
              className="location-clock-icon"
              src={assetUrl('assets/location/clock.svg')}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
            <span className="location-time__text">{time}</span>
          </div>
        </div>

        {/* LARGE Venue Photograph */}
        <div className="location-photo-container">
          <picture>
            <source srcSet={assetUrl(venueImageWebp)} type="image/webp" />
            <img
              className="location-photo"
              src={assetUrl(venueImagePng)}
              alt={`Fotografía de ${venueName}`}
              draggable={false}
            />
          </picture>
        </div>

        {/* Decorative Divider */}
        <img
          className="location-divider"
          src={assetUrl('assets/location/venue-divider.svg')}
          alt=""
          aria-hidden="true"
          draggable={false}
        />

        {/* Lower Information Area (Unified Watermark Composition) */}
        <div className="location-lower">
          <div className="location-watermark-block">
            {/* Map Watermark Layer (Background) */}
            <img
              className="location-map-watermark"
              src={assetUrl(mapImage)}
              alt=""
              aria-hidden="true"
              draggable={false}
            />

            {/* Content Layer (Foreground) */}
            <div className="location-watermark-content">
              <address className="location-address">{address}</address>

              <a
                className="maps-link"
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="maps-link__icon"
                  src={assetUrl('assets/location/map-pin.svg')}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />
                <span>VER EN MAPS</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Flourish Ornament */}
        <img
          className="location-bottom-flourish"
          src={assetUrl('assets/location/bottom-flourish.svg')}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>
    </section>
  )
}
