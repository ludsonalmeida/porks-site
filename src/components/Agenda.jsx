const WA = 'https://wa.me/5561935003917?text=Quero+fazer+minha+reserva'
const days = [
  { hot: true, day: '⚡ Sexta-feira · Show ao vivo', name: 'Rock ao Vivo', event: '🎸 Bandas toda sexta', desc: 'Show ao vivo sem couvert. Chega cedo e garante sua mesa.', price: 'Sem couvert', delay: 0 },
  { hot: true, day: '⚡ Sábado · Show ao vivo', name: 'Noite de Rock', event: '🎸 Bandas todo sábado', desc: 'Rock ao vivo a partir das 21h. Sem cobrança de entrada.', price: 'Sem couvert', delay: 1 },
  { day: 'Terça-feira', name: 'Terça do Ritual', event: 'Chope + petisco', desc: 'Do primeiro gole ao primeiro ataque no torresmo. Combos especiais a noite toda.', price: 'Combos', sub: 'a partir de R$16', delay: 2 },
  { day: 'Quarta-feira', name: 'Quarta Raiz 🇧🇷', event: 'Torresmo + Pilsen', desc: 'Torresmo Mineiro + Pilsen. O combo raiz que não tem erro.', price: 'R$29,90', delay: 0 },
  { day: 'Quinta-feira', name: 'Quinta do Drink', event: 'Qualquer drink da casa', desc: 'R$16 em qualquer drink — a noite toda.', price: 'R$16', sub: 'qualquer drink', delay: 1 },
  { day: 'Domingo', name: 'Hamburgada', event: 'Qualquer burger da casa', desc: 'Qualquer hambúrguer por R$18 — a noite toda.', price: 'R$18', sub: 'qualquer burger', delay: 2 },
]

export default function Agenda() {
  return (
    <section className="agenda pad-sm" id="agenda" style={{paddingTop:8}}>
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
