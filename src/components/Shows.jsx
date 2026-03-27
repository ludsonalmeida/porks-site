import { useState, useEffect, useRef, useCallback } from 'react'

const slides = [
  { src: '/images/show-3.jpg', alt: 'Show ao vivo no Porks' },
  { src: '/images/show-4.jpg', alt: 'Banda tocando no Porks' },
  { src: '/images/show-5.jpg', alt: 'Noite de rock no Porks' },
  { src: '/images/show-6.jpg', alt: 'Show no Porks Sobradinho' },
  { src: '/images/show-7.jpg', alt: 'Rock ao vivo' },
  { src: '/images/show-8.jpg', alt: 'Palco do Porks' },
  { src: '/images/show-9.jpg', alt: 'Noite no Porks' },
]

function perView() {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth < 580) return 1
  if (window.innerWidth < 900) return 2
  return 3
}

export default function Shows() {
  const [idx, setIdx] = useState(0)
  const [pv, setPv] = useState(perView)
  const touchRef = useRef(0)

  useEffect(() => {
    const h = () => setPv(perView())
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const max = Math.max(0, slides.length - pv)
  const safeIdx = Math.min(idx, max)
  const dots = Math.ceil(slides.length / pv)

  const next = useCallback(() => setIdx(i => Math.min(i + pv, max)), [pv, max])
  const prev = useCallback(() => setIdx(i => Math.max(0, i - pv)), [pv])

  return (
    <section className="shows pad-sm" id="shows" style={{paddingTop:16}}>
      <div className="wrap">
        <div className="shows-head rv">
          <div>
            <div className="shows-ey">⚡ Shows & eventos reais</div>
            <div className="bebas" style={{fontSize:'clamp(2.5rem,5vw,4.5rem)',color:'var(--aged)',display:'block',lineHeight:.9}}>NOITES QUE ACONTECEM</div>
            <div className="bebas" style={{fontSize:'clamp(2.5rem,5vw,4.5rem)',color:'var(--amb)',display:'block',lineHeight:.9}}>DE VERDADE. ★</div>
          </div>
          <a href="#agenda" className="btn btn-ghost rv" style={{clipPath:'polygon(2px 0,100% 0,calc(100% - 2px) 100%,0 100%)'}}>Ver agenda →</a>
        </div>
      </div>
      <div className="car-wrap">
        <div
          className="car-track"
          style={{transform:`translateX(-${safeIdx*(100/pv)}%)`}}
          onTouchStart={e => { touchRef.current = e.touches[0].clientX }}
          onTouchEnd={e => {
            const dx = e.changedTouches[0].clientX - touchRef.current
            if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
          }}
        >
          {slides.map((s, i) => (
            <div className="car-slide" key={i} style={{minWidth:`${100/pv}%`}}>
              <img src={s.src} alt={s.alt} loading="lazy" />
            </div>
          ))}
        </div>
        <div className="car-controls">
          <button className="car-arrow" onClick={prev}>← Anterior</button>
          <div className="car-dots">
            {Array.from({length:dots}).map((_,i) => (
              <button
                key={i}
                className={`c-dot${i === Math.floor(safeIdx/pv) ? ' on' : ''}`}
                aria-label={`Slide ${i+1}`}
                onClick={() => setIdx(i*pv)}
              />
            ))}
          </div>
          <button className="car-arrow" onClick={next}>Próximo →</button>
        </div>
      </div>
    </section>
  )
}
