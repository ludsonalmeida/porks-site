const WA = 'https://wa.me/5561935003917?text=Quero+fazer+uma+reserva+para+empresa'
const feats = [
  { ic: '🎸', t: 'Música ao vivo inclusa', d: 'Shows quase todas as noites — entretenimento sem custo extra.' },
  { ic: '📋', t: 'Reserva personalizada', d: 'Atendimento direto para planejar data, espaço e tamanho.' },
  { ic: '🍺', t: 'Cardápio completo', d: 'Chope, drinks, entradas e pratos. Pra agradar todo time.' },
  { ic: '💰', t: 'Custo muito menor', d: 'Muito mais em conta que espaços fechados.' },
]

export default function Empresa() {
  return (
    <section className="empresa pad" id="empresa">
      <div className="emp-layout wrap">
        <div>
          <div className="emp-ey rv">Corporativo</div>
          <div className="rv d1">
            <span className="emp-t1">happy hour, encontro de equipe ou</span>
            <span className="emp-t2">EVENTO DA<br/><span className="a">EMPRESA. ★</span></span>
          </div>
          <p className="emp-p rv d2">Recepção de clientes, comemoração interna ou confraternização — com atendimento alinhado, reserva antecipada e a energia do Porks do seu lado.</p>
          <div className="emp-btns rv d3">
            <a href={WA} className="btn btn-amb">⚡ Reservar evento</a>
            <a href={WA} className="btn btn-outline">Falar com atendimento</a>
          </div>
        </div>
        <div className="emp-feats rv d2">
          {feats.map(f => (
            <div key={f.t} className="ef">
              <div className="ef-ic">{f.ic}</div>
              <div><div className="ef-t">{f.t}</div><div className="ef-d">{f.d}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
