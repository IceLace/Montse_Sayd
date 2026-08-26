import { useRef, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { assetUrl } from '../assetUrl'

interface EnvelopeProps {
  paperRef: React.RefObject<HTMLDivElement | null>
  /** Called the instant the user taps — page becomes visible under the envelope */
  onOpenStart: () => void
  /** Called once the envelope halves have fully slid off-screen */
  onOpenComplete: () => void
  /** Called synchronously on the first tap, directly within the interaction handler */
  onPlay: () => void
}

export default function Envelope({ paperRef, onOpenStart, onOpenComplete, onPlay }: EnvelopeProps) {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  // Let GSAP own the paper transform from mount so its tween never conflicts
  useEffect(() => {
    if (paperRef.current) {
      gsap.set(paperRef.current, { scale: 0.985 })
    }
  }, [paperRef])

  const handleOpen = useCallback(() => {
    if (hasAnimated.current) return
    hasAnimated.current = true

    // Start audio synchronously within the user interaction (required for iOS Safari)
    onPlay()

    // Dismiss the CTA indicator immediately, then start envelope animation after 300ms
    containerRef.current?.classList.add('is-opening')

    // Reveal the invitation page immediately so it shows beneath the envelope
    onOpenStart()

    window.setTimeout(() => {
      const tl = gsap.timeline({ onComplete: onOpenComplete })

      // Reveal the paper with a very subtle scale-up
      if (paperRef.current) {
        tl.to(
          paperRef.current,
          {
            scale: 1,
            duration: 0.8,
            ease: 'power3.inOut',
          },
          0,
        )
      }

      // Slide left piece out to the left
      tl.to(
        leftRef.current,
        {
          xPercent: -120,
          rotation: -1.5,
          duration: 0.8,
          ease: 'power3.inOut',
        },
        0,
      )

      // Slide right piece out to the right
      tl.to(
        rightRef.current,
        {
          xPercent: 120,
          rotation: 1.5,
          duration: 0.8,
          ease: 'power3.inOut',
        },
        0,
      )
    }, 300)
  }, [onOpenComplete, paperRef])

  return (
    <button
      className="envelope-layer"
      onClick={handleOpen}
      aria-label="Abrir invitación"
    >
      <div className="envelope-container" ref={containerRef}>
        <div className="envelope-piece envelope-piece--left" ref={leftRef}>
          <img
            src={assetUrl('assets/envelope/envelope-left.png')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </div>

        <div className="envelope-piece envelope-piece--right" ref={rightRef}>
          <img
            src={assetUrl('assets/envelope/envelope-right.png')}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        </div>

        <img
          className="open-envelope-cta"
          src={assetUrl('assets/envelope/open-envelope-cta.png')}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>
    </button>
  )
}
