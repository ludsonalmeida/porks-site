const WA = 'https://wa.me/5561935003917?text=Quero+fazer+meu+anivers%C3%A1rio+no+Porks+Sobradinho'
const perks = [
  'Ideal para grupos de todos os tamanhos',
  'Show ao vivo quase toda noite',
  'Experiência organizada, sem estresse',
  'Confirmação rápida pelo WhatsApp',
  'Sem couvert e sem entrada — nunca',
]

export default function Aniversario() {
  return (
    <section className="aniversario" id="aniversario">
      <div className="aniv-photo">
        <img src="https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p5.jpg" alt="Aniversário no Porks" loading="lazy" />
        <div className="aniv-photo-grad" />
        <div className="aniv-stk">
          <div className="as-big">Sem couvert.<br/>Sempre.</div>
          <div className="as-sub">pra todo mundo</div>
        </div>
      </div>
      <div className="aniv-content">
        <div className="stamp stamp-red rv" style={{marginBottom:14}}>⚡ Celebração especial</div>
        <div className="rv d1">
          <span className="aniv-t1">seu aniversário merece</span>
          <span className="aniv-t2">MAIS DO QUE</span>
          <span className="aniv-t3">UMA MESA QUALQUER. ★</span>
        </div>
        <p className="aniv-p rv d2">Chama a galera, garanta sua reserva e comemora no Porks com clima de verdade, chope gelado, comida forte e energia de noite memorável.</p>
        <div className="aniv-perks rv d3">
          {perks.map(p => <div key={p} className="aniv-perk">{p}</div>)}
        </div>
        <a href={WA} className="btn btn-amb btn-lg rv d4">⚡ Reservar meu aniversário</a>
      </div>
    </section>
  )
}
