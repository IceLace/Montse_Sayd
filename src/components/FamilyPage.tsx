import { useEffect, useRef } from 'react'
import { assetUrl } from '../assetUrl'

interface FamilyPageProps {
  /** True once this page is the active visible sheet */
  active: boolean
}

export default function FamilyPage({ active }: FamilyPageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const revealedRef = useRef(false)

  useEffect(() => {
    if (!active || revealedRef.current) return
    const el = sectionRef.current
    if (!el) return

    const timer = window.setTimeout(() => {
      el.classList.add('is-revealed')
      el.dataset.revealed = 'true'
      revealedRef.current = true
    }, 500)

    return () => window.clearTimeout(timer)
  }, [active])

  return (
    <section
      ref={sectionRef}
      className="family-page"
      aria-label="Familia y padrinos"
    >
      <img
        className="family-page__paper"
        src={assetUrl('assets/shared/page-front.png')}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <h2 className="family-heading">
        Acompañados por el amor<br />y la bendición<br />de nuestros padres
      </h2>

      <div className="parents parents--bride">
        <h3>Novia</h3>
        <p>Teresa Pérez Orenday</p>
        <p>J. Carlos Camacho Lozano</p>
      </div>

      <div className="parents parents--groom">
        <h3>Novio</h3>
        <p>Adriana Guevara Lozano</p>
        <p>Ricardo Jasso Morales</p>
      </div>

      <img
        className="family-divider"
        src={assetUrl('assets/family/family-divider.png')}
        alt=""
        aria-hidden="true"
        draggable={false}
      />

      <h2 className="sponsors-heading">Nuestros padrinos</h2>

      <article className="sponsor sponsor--vigil">
        <img src={assetUrl('assets/family/vigil-candles.png')} alt="" aria-hidden="true" draggable={false} />
        <div>
          <h3>Padrinos de velación</h3>
          <p>Sonia Sandoval</p>
          <p>Efraín Esparza</p>
        </div>
      </article>

      <article className="sponsor sponsor--rings">
        <img src={assetUrl('assets/family/wedding-rings.png')} alt="" aria-hidden="true" draggable={false} />
        <div>
          <h3>Padrinos de anillos</h3>
          <p>Karen Jasso</p>
          <p>Irving Acuña</p>
        </div>
      </article>

      <article className="sponsor sponsor--arras">
        <img src={assetUrl('assets/family/arras-chest.png')} alt="" aria-hidden="true" draggable={false} />
        <div>
          <h3>Padrino de arras</h3>
          <p>Juan Carlos Camacho</p>
        </div>
      </article>
    </section>
  )
}
