import { useRef } from 'react'
import { assetUrl } from '../assetUrl'

interface InvitationPageProps {
  /**
   * When false the paper background is still rendered (visible through the
   * envelope) but all text / portrait content is hidden so nothing bleeds
   * through the envelope artwork before it opens.
   * Becomes true once the envelope has fully departed — triggers entrance animations.
   */
  contentVisible: boolean
}

export default function InvitationPage({ contentVisible }: InvitationPageProps) {
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const portraitSrc = prefersReducedMotion.current
    ? assetUrl('assets/invitation/couple-magic-drawing-still.png')
    : assetUrl('assets/invitation/couple-magic-drawing.gif')

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
        draggable={false}
      />
    </article>
  )
}
