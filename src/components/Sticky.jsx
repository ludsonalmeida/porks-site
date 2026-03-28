import { useState, useEffect } from 'react'

import { waLink } from '../utils/wa.js'

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
      <a href={waLink('sticky')} className="btn btn-amb">⚡ Reservar</a>
      <a href="#agenda" className="btn btn-outline">★ Agenda</a>
    </div>
  )
}
