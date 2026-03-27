import { useEffect, useRef } from 'react'
import useInstagramAgenda from '../hooks/useInstagramAgenda'

const WA = 'https://wa.me/5561935003917?text=Quero+fazer+minha+reserva'
const days = [
  { hot: true, day: '⚡ Sexta-feira · Show ao vivo', name: 'Rock ao Vivo', event: '🎸 Bandas toda sexta', desc: 'Show ao vivo sem couvert. Chega cedo e garante sua mesa.', price: 'Sem couvert', delay: 0 },
  { hot: true, day: '⚡ Sábado · Show ao vivo', name: 'Noite de Rock', event: '🎸 Bandas todo sábado', desc: 'Rock ao vivo a partir das 21h. Sem cobrança de entrada.', price: 'Sem couvert', delay: 1 },
  { day: 'Terça-feira', name: 'Terça do Ritual', event: 'Chope + petisco', desc: 'Do primeiro gole ao primeiro ataque no torresmo. Combos especiais a noite toda.', price: 'Combos', sub: 'a partir de R$16', delay: 2 },
  { day: 'Quarta-feira', name: 'Quarta Raiz 🇧🇷', event: 'Torresmo + Pilsen', desc: 'Torresmo Mineiro + Pilsen. O combo raiz que não tem erro.', price: 'R$29,90', delay: 0 },
  { day: 'Quinta-feira', name: 'Quinta do Drink', event: 'Qualquer drink da casa', desc: 'R$16 em qualquer drink — a noite toda.', price: 'R$16', sub: 'qualquer drink', delay: 1 },
  { day: 'Domingo', name: 'Hamburgada', event: 'Qualquer burger da casa', desc: 'Qualquer hambúrguer por R$18 — a noite toda.', price: 'R$18', sub: 'qualquer burger', delay: 2 },
]

function IgPostCard({ post }) {
  const date = new Date(post.timestamp).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const preview = post.caption?.slice(0, 220).trim()

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="ag-ig-card rv"
    >
      {post.displayUrl && (
        <div className="ag-ig-img">
          <img src={post.displayUrl} alt="Agenda da semana" loading="lazy" />
        </div>
      )}
      <div className="ag-ig-body">
        <div className="ag-ig-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          Post desta semana
        </div>
        <p className="ag-ig-caption">{preview}{post.caption?.length > 220 ? '…' : ''}</p>
        <div className="ag-ig-footer">
          <span className="ag-ig-date">{date}</span>
          <span className="ag-ig-cta">Ver no Instagram →</span>
        </div>
      </div>
    </a>
  )
}

export default function Agenda() {
  const { post } = useInstagramAgenda()
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const ob = new IntersectionObserver(
      entries => entries.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); ob.unobserve(x.target) } }),
      { threshold: 0.05, rootMargin: '0px 0px 0px 0px' }
    )
    section.querySelectorAll('.rv:not(.in)').forEach(e => ob.observe(e))
    return () => ob.disconnect()
  }, [post])

  return (
    <section className="agenda pad-sm" id="agenda" style={{paddingTop:8}} ref={sectionRef}>
      <div className="wrap">
        <div className="ag-head rv">
          <div>
            <div className="ag-ey">Programação semanal</div>
            <div className="bebas" style={{fontSize:'clamp(2.5rem,5vw,4.2rem)',color:'var(--ink)',lineHeight:.9}}>VIU A AGENDA?</div>
            <div className="bebas" style={{fontSize:'clamp(2.5rem,5vw,4.2rem)',color:'var(--amb)',lineHeight:.9}}>RESERVA ANTES. ★</div>
          </div>
          <a href={WA} className="btn btn-red rv">Ver disponibilidade →</a>
        </div>
      </div>
      <div className="ag-banner rv">
        <img src="/images/agenda-banner.jpg" alt="Agenda semanal" loading="lazy" />
        <div className="ag-banner-ov" />
        <div className="ag-banner-txt">
          <div className="ag-ey" style={{marginBottom:8}}>★ Toda semana tem motivo</div>
          <div className="bebas" style={{fontSize:'clamp(2rem,4vw,3.5rem)',color:'var(--aged)',lineHeight:.9}}>SHOWS. PROMOS.<br/><span style={{color:'var(--amb)'}}>NOITE BOA. ★</span></div>
        </div>
      </div>

      {post && (
        <div style={{padding:'0 5%', marginBottom: 24}}>
          <IgPostCard post={post} />
        </div>
      )}

      <div className="ag-grid" style={{padding:'0 5%'}}>
        {days.map((d, i) => (
          <div key={i} className={`ag-c${d.hot ? ' hot' : ''} rv${d.delay ? ` d${d.delay}` : ''}`}>
            <div className="ag-top">
              <div className="ag-day">{d.day}</div>
              <div className="ag-name">{d.name}</div>
              <div className="ag-event">{d.event}</div>
              <p className="ag-desc">{d.desc}</p>
            </div>
            <div className="ag-bot">
              <div className="ag-price">{d.price}{d.sub && <small>{d.sub}</small>}</div>
              <a href={WA} className="ag-link">Reservar →</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
