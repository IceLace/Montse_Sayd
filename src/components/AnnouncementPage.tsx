import { useEffect, useRef } from 'react'
import { assetUrl } from '../assetUrl'

interface AnnouncementPageProps {
  /** True once the envelope is gone and this page is the active visible sheet */
  active: boolean
}

export default function AnnouncementPage({ active }: AnnouncementPageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const revealedRef = useRef(false)

  useEffect(() => {
    if (!active || revealedRef.current) return
    const el = sectionRef.current
    if (!el) return

    const timer = window.setTimeout(() => {
      el.classList.add('is-revealed')
      revealedRef.current = true
    }, 650)

    return () => window.clearTimeout(timer)
  }, [active])

  return (
    <section
      ref={sectionRef}
      className="announcement-page"
      aria-label="Anuncio de boda"
    >
      <img className="announcement-page__paper" src={assetUrl('assets/shared/page-front.png')} alt="" aria-hidden="true" draggable={false} />

      <p className="announcement-copy announcement-copy--top">
        <span className="reveal-line" style={{ '--line': 0 } as React.CSSProperties}>Con gran alegría, nos</span>
        <span className="reveal-line" style={{ '--line': 1 } as React.CSSProperties}>complace anunciar que</span>
        <span className="reveal-line" style={{ '--line': 2 } as React.CSSProperties}>hemos decidido unir</span>
        <span className="reveal-line" style={{ '--line': 3 } as React.CSSProperties}>nuestras vidas en</span>
        <span className="reveal-line" style={{ '--line': 4 } as React.CSSProperties}>matrimonio.</span>
      </p>

      <img
        className="announcement-photo"
        src={assetUrl('assets/announcement/montse-sayd-page2-photo.webp')}
        alt="Montse y Sayd"
        draggable={false}
      />

      <img className="announcement-divider" src={assetUrl('assets/announcement/wedding-rings-divider.png')} alt="" aria-hidden="true" draggable={false} />

      <p className="announcement-copy announcement-copy--bottom">
        <span className="reveal-line" style={{ '--line': 5 } as React.CSSProperties}>Este día especial es el</span>
        <span className="reveal-line" style={{ '--line': 6 } as React.CSSProperties}>comienzo de un nuevo</span>
        <span className="reveal-line" style={{ '--line': 7 } as React.CSSProperties}>capítulo en nuestra</span>
        <span className="reveal-line" style={{ '--line': 8 } as React.CSSProperties}>historia, un capítulo que</span>
        <span className="reveal-line" style={{ '--line': 9 } as React.CSSProperties}>queremos escribir junto a</span>
        <span className="reveal-line" style={{ '--line': 10 } as React.CSSProperties}>ustedes, nuestros</span>
        <span className="reveal-line" style={{ '--line': 11 } as React.CSSProperties}>familiares y amigos más</span>
        <span className="reveal-line" style={{ '--line': 12 } as React.CSSProperties}>queridos.</span>
      </p>
    </section>
  )
}
