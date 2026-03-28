import { useState, useEffect } from 'react'

import { waLink } from '../utils/wa.js'

const IFOOD = 'https://www.ifood.com.br/delivery/brasilia-df/porks-sobradinho-sobradinho/e42c5658-b382-44e4-a6e8-5259c3c07726'

const links = [
  { href: '#shows', label: 'Shows' },
  { href: '#ocasioes', label: 'Ocasiões' },
  { href: '#agenda', label: 'Agenda' },
  { href: '#aniversario', label: 'Aniversário' },
  { href: '#grupos', label: 'Grupos' },
  { href: '#empresa', label: 'Empresa' },
  { href: '#faq', label: 'FAQ' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobOpen, setMobOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const close = () => setMobOpen(false)

  return (
    <nav id="nav" className={scrolled ? 'sc' : ''}>
      <div className="nav-in">
        <a href="#" className="nav-logo">
          <img src="/images/logo-porks.png" alt="Porks Sobradinho" className="nav-logo-img" />
        </a>
        <ul className="nav-links">
          {links.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
          <li><a href={IFOOD} target="_blank" rel="noopener noreferrer" className="nav-delivery">Delivery</a></li>
        </ul>
        <div className="nav-acts">
          <a href={waLink('nav')} className="btn btn-ghost btn-sm" style={{clipPath:'none'}}>WhatsApp</a>
          <a href="#cta" className="btn btn-amb btn-sm">⚡ Reservar</a>
        </div>
        <button className="hamburger" onClick={() => setMobOpen(!mobOpen)} aria-label="Menu">
          <span/><span/><span/>
        </button>
      </div>
      <div className={`mob-menu${mobOpen ? ' open' : ''}`}>
        {links.map(l => <a key={l.href} href={l.href} onClick={close}>{l.label}</a>)}
        <a href={IFOOD} target="_blank" rel="noopener noreferrer" onClick={close}>Delivery</a>
        <a href={waLink('nav')} onClick={close}>WhatsApp</a>
        <a href="#cta" className="hi" onClick={close}>⚡ Reservar agora</a>
      </div>
    </nav>
  )
}
