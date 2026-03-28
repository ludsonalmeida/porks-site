import { useState } from 'react'
import { waLink } from '../utils/wa.js'
import { getHeroCards } from '../utils/heroCards.js'

const DAY_KEYWORDS = [
  'DOMINGO', 'SEGUNDA', 'TERCA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'SÁBADO'
]
const DAY_MAP = {
  0: ['DOMINGO'],
  1: ['SEGUNDA'],
  2: ['TERCA', 'TERÇA'],
  3: ['QUARTA'],
  4: ['QUINTA'],
  5: ['SEXTA'],
  6: ['SABADO', 'SÁBADO'],
}

function getInitialCard(cards) {
  const today = new Date().getDay()
  const keywords = DAY_MAP[today] || []
  const idx = cards.findIndex(c =>
    keywords.some(k => (c.title || '').toUpperCase().includes(k) || (c.tag || '').toUpperCase().includes(k))
  )
  return idx >= 0 ? idx : 0
}

function HeroDeck() {
  const DECK_CARDS = getHeroCards()
  const len = DECK_CARDS.length
  const [active, setActive] = useState(() => getInitialCard(DECK_CARDS))

  function prev(e) { e.stopPropagation(); setActive(i => (i - 1 + len) % len) }
  function next(e) { e.stopPropagation(); setActive(i => (i + 1) % len) }

  return (
    <div className="hero-deck" onClick={next}>
      {DECK_CARDS.map((card, i) => {
        const pos = (i - active + len) % len
        return (
          <div key={i} className={`hd-card hd-p${pos}`}>
            {card.tape && <div className="tape hd-tape" />}
            <div className={`ticket hd-ticket${card.img ? ' hd-has-img' : ''}`}>
              {card.img
                ? <>
                    <img src={card.img} alt={card.title} className="hd-img" onError={e => e.target.style.display='none'} />
                    <div className="hd-text">
                      <span className="tl">{card.tag}</span>
                      <span className="tv">{card.title}</span>
                      <span className="ts">{card.sub}</span>
                      <a href={waLink('hero-card')} className="hd-cta-btn">★ Reserve sua mesa</a>
                    </div>
                  </>
                : <>
                    <span className="tl">{card.tag}</span>
                    <span className="tv">{card.title}</span>
                    <span className="ts">{card.sub}</span>
                  </>
              }
            </div>
          </div>
        )
      })}
      <div className="hd-nav">
        <button className="hd-nav-btn" onClick={prev} aria-label="Anterior">‹</button>
        <span className="hd-dots">{DECK_CARDS.map((_, i) => <span key={i} className={`hd-dot${i === active ? ' hd-dot-on' : ''}`} />)}</span>
        <button className="hd-nav-btn" onClick={next} aria-label="Próximo">›</button>
      </div>
    </div>
  )
}

export default function Hero() {
  const cards = getHeroCards()
  const tapeIdx = cards.findIndex(c => c.tape)

  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        <img src="https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p9.jpg" alt="Porks Sobradinho" loading="eager" />
      </div>
      <div className="hero-ov" />

      <div className="hero-body wrap">
        <div>
          <div className="hero-ey rv">★ Reserve sua noite no Porks</div>
          <span className="ht1 rv d1">a casa mais rock'n'roll da cidade</span>
          <span className="ht2 rv d1">SUA NOITE<br/>COMEÇA AQUI<span className="r">.</span></span>
          <span className="ht3 rv d2">RESERVE SUA MESA ★</span>

          <HeroDeck />

          <p className="hero-sub rv d2">Aniversário, encontro com a galera, confraternização ou evento da empresa. Reserve antes e chegue sabendo que seu lugar tá garantido.</p>

          <div className="hero-rider rv d3">
            <div className="ri"><div className="ri-n">2×</div><div className="ri-l">Shows<br/>por semana</div></div>
            <div className="ri"><div className="ri-n">R$0</div><div className="ri-l">Couvert<br/>sempre</div></div>
            <div className="ri"><div className="ri-n">2024</div><div className="ri-l">Desde<br/>em Sobradinho</div></div>
          </div>
        </div>

        <div className="hero-stickers rv d3">
          <HeroDeck />
        </div>
      </div>
    </section>
  )
}
