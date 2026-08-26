import { useEffect, useRef, useState } from 'react'
import { assetUrl } from '../assetUrl'

interface RsvpPageProps {
  active: boolean
}

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxH-0fRufpSqJdxqPkyegVz-OVSWxud9Jr3ECHiXJZ0uOTjgfjy-LD1FRHoI6s9bTGB/exec'

async function submitRsvp(payload: {
  fullName: string
  attendance: string
  companions: number
  totalPeople: number
}): Promise<{ ok: boolean }> {
  await fetch(WEB_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  // no-cors opaque response — treat a completed fetch as success
  return { ok: true }
}

type SuccessData = {
  attendance: 'yes' | 'no'
  totalPeople: number
}

export default function RsvpPage({ active }: RsvpPageProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const revealedRef = useRef(false)

  // ── Form state ────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('')
  const [attendance, setAttendance] = useState<'yes' | 'no' | ''>('')
  const [companions, setCompanions] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successData, setSuccessData] = useState<SuccessData | null>(null)

  const MAX_COMPANIONS = 5

  // ── Reveal animation: 450 ms after the page becomes active ───────────────
  useEffect(() => {
    if (!active || revealedRef.current) return
    const el = sectionRef.current
    if (!el) return
    const timer = window.setTimeout(() => {
      el.classList.add('is-revealed')
      revealedRef.current = true
    }, 450)
    return () => window.clearTimeout(timer)
  }, [active])

  // ── Success screen: add is-visible once it becomes unhidden ─────────────
  const successRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!successData) return
    const el = successRef.current
    if (!el) return
    requestAnimationFrame(() => el.classList.add('is-visible'))
  }, [successData])

  // ── Handlers ─────────────────────────────────────────────────────────────
  function stopGesture(e: React.SyntheticEvent) {
    e.stopPropagation()
  }

  function handleCompanion(delta: number, e: React.MouseEvent) {
    e.stopPropagation()
    setCompanions((c) => Math.max(0, Math.min(MAX_COMPANIONS, c + delta)))
  }

  function handleAttendanceChange(val: 'yes' | 'no') {
    setAttendance(val)
    if (val === 'no') setCompanions(0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (submitted || submitting) return
    if (!fullName.trim()) { setErrorMsg('Por favor escribe tu nombre.'); return }
    if (!attendance) { setErrorMsg('Por favor selecciona tu asistencia.'); return }

    setErrorMsg('')
    setSubmitting(true)

    const totalPeople = attendance === 'yes' ? companions + 1 : 0
    const payload = { fullName: fullName.trim(), attendance, companions, totalPeople }

    try {
      const result = await submitRsvp(payload)
      if (!result?.ok) throw new Error('Not saved')
      setSubmitted(true)
      setSuccessData({ attendance, totalPeople })
    } catch {
      setErrorMsg('No pudimos guardar tu respuesta. Intenta nuevamente.')
      setSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className="invitation-sheet rsvp-page"
      id="rsvp-page"
      aria-labelledby="rsvp-title"
    >
      <img className="rsvp-paper" src={assetUrl('assets/shared/page-front.png')} alt="" aria-hidden="true" draggable={false} />

      <div className={`rsvp-content${successData ? ' is-confirmed' : ''}`}>
        <header className="rsvp-header reveal reveal-1">
          <img src={assetUrl('assets/rsvp/rsvp-sprig.png')} alt="" className="rsvp-sprig" aria-hidden="true" draggable={false} />
          <h2 id="rsvp-title">RSVP</h2>
          <p>CONFIRMA TU ASISTENCIA</p>
        </header>

        <div className="rsvp-divider reveal reveal-2" aria-hidden="true"><span></span></div>

        {/* Adults-only notice */}
        <p className="rsvp-adults-notice reveal reveal-3">
          Con mucho cariño, hemos reservado esta celebración solo para adultos.{' '}
          Agradecemos su comprensión.
          <span className="rsvp-adults-label">NO NIÑOS</span>
        </p>

        <form
          id="rsvp-form"
          className="rsvp-form"
          noValidate
          onSubmit={handleSubmit}
        >
          {/* Name */}
          <label className="field reveal reveal-4">
            <span>NOMBRE COMPLETO</span>
            <input
              id="guest-name"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="Escribe tu nombre"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onPointerDown={stopGesture}
              onTouchStart={stopGesture}
            />
          </label>

          {/* Attendance */}
          <fieldset className="attendance reveal reveal-5">
            <legend>¿PODRÁS ACOMPAÑARNOS?</legend>
            <div className="radio-options">
              <label onPointerDown={stopGesture} onTouchStart={stopGesture}>
                <input
                  type="radio"
                  name="attendance"
                  value="yes"
                  checked={attendance === 'yes'}
                  onChange={() => handleAttendanceChange('yes')}
                />
                <span>SÍ, ASISTIRÉ</span>
              </label>
              <label onPointerDown={stopGesture} onTouchStart={stopGesture}>
                <input
                  type="radio"
                  name="attendance"
                  value="no"
                  checked={attendance === 'no'}
                  onChange={() => handleAttendanceChange('no')}
                />
                <span>NO ASISTIRÉ</span>
              </label>
            </div>
          </fieldset>

          {/* Companions stepper */}
          <div
            className={`companions reveal reveal-6${attendance === 'no' ? ' is-disabled' : ''}`}
            id="companions-block"
          >
            <p>NÚMERO DE ACOMPAÑANTES</p>
            <div className="stepper">
              <button
                type="button"
                aria-label="Quitar acompañante"
                onPointerDown={stopGesture}
                onTouchStart={stopGesture}
                onClick={(e) => handleCompanion(-1, e)}
              >−</button>
              <output id="companions-count" aria-live="polite">{companions}</output>
              <button
                type="button"
                aria-label="Agregar acompañante"
                onPointerDown={stopGesture}
                onTouchStart={stopGesture}
                onClick={(e) => handleCompanion(1, e)}
              >+</button>
            </div>
            <small>Sin incluirte a ti</small>
          </div>

          {/* Submit */}
          <button
            className="submit-rsvp reveal reveal-7"
            type="submit"
            disabled={submitting}
            onPointerDown={stopGesture}
            onTouchStart={stopGesture}
          >
            <span>{submitting ? 'ENVIANDO…' : 'CONFIRMAR ASISTENCIA'}</span>
          </button>
          {errorMsg && (
            <p className="form-status" role="status" aria-live="polite">{errorMsg}</p>
          )}
        </form>

        <footer className="rsvp-footer reveal reveal-8">
          <p>POR FAVOR CONFIRMA ANTES DEL</p>
          <strong>15 DE NOVIEMBRE DE 2026</strong>
          <img src={assetUrl('assets/rsvp/confirmation-envelope.png')} alt="" aria-hidden="true" draggable={false} />
          <em>Con cariño, Montse &amp; Sayd</em>
        </footer>

        {/* ── Success screen ────────────────────────────────────────────── */}
        {successData && (
          <section
            ref={successRef}
            className="rsvp-success"
            id="rsvp-success"
            aria-live="polite"
          >
            <img
              src={assetUrl('assets/rsvp/confirmation-envelope.png')}
              alt="Confirmación registrada"
              draggable={false}
            />

            <h3>¡GRACIAS POR CONFIRMAR!</h3>
            <p className="success-copy">Tu respuesta ha sido registrada correctamente.</p>

            <div className="success-divider" aria-hidden="true"><span></span></div>

            {successData.attendance === 'yes' ? (
              <>
                <p className="success-heading">NOS ALEGRA MUCHO QUE PUEDAS ACOMPAÑARNOS</p>
                <strong>
                  {successData.totalPeople === 1
                    ? '1 persona confirmada'
                    : `${successData.totalPeople} personas confirmadas`}
                </strong>
                <p>Nos vemos el 21 de diciembre de 2026.</p>
              </>
            ) : (
              <p className="success-no-msg">
                Aunque no puedas acompañarnos ese día,<br />
                nos alegra que formes parte de nuestra historia.
              </p>
            )}

            <div className="success-sprig-divider" aria-hidden="true">
              <img src={assetUrl('assets/rsvp/rsvp-sprig.png')} alt="" draggable={false} />
            </div>

            <em>Con cariño,<br /><b>Montse &amp; Sayd</b></em>
          </section>
        )}
      </div>
    </section>
  )
}
