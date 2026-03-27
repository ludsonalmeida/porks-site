import { useState, useEffect } from 'react'

const WA = 'https://wa.me/5561935003917?text=Quero+fazer+minha+reserva'

export default function Sticky() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return
    const obs = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0.1 })
    obs.observe(hero)
    return () => obs.disconnect()
  }, [])

  return (
    <div className={`sticky${show ? ' sticky-show' : ''}`} id="sm">
      <a href={WA} className="btn btn-amb">⚡ Reservar</a>
      <a href="#agenda" className="btn btn-outline">★ Agenda</a>
    </div>
  )
}
