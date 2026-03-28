import { waLink } from '../utils/wa.js'
const reasons = [
  { n: '01', t: 'Sua mesa garantida', d: 'Sem fila, sem improviso. Você chega e já tem seu espaço.' },
  { n: '02', t: 'Mais organização pra galera', d: 'Turma toda junta, com tudo combinado antes de chegar.' },
  { n: '03', t: 'Dias muito disputados', d: 'Sexta e sábado com show enchem. Quem reserva não depende de sorte.' },
  { n: '04', t: 'Menos improviso', d: 'A noite começa melhor quando tem plano. Menos estresse, mais curtição.' },
]

export default function Porque() {
  return (
    <section className="porque pad" id="porque" style={{paddingTop:16}}>
      <div className="pq-layout wrap">
        <div className="pq-photo rv">
          <img src="/images/porque.jpg" alt="Porks cheio de vida" loading="lazy" />
        </div>
        <div>
          <div className="pq-ey rv">Por que reservar</div>
          <div className="rv d1">
            <span className="pq-t1">não deixa</span>
            <span className="pq-t2"><span className="pa">SUA NOITE</span><br/><span className="rd">NA SORTE.</span></span>
          </div>
          <p className="pq-lead rv d2">Sexta, sábado e noites de show enchem rápido. Quem reserva chega sem estresse — e aproveita muito mais.</p>
          <div className="pq-list rv d3">
            {reasons.map(r => (
              <div className="pq-row" key={r.n}>
                <div className="pq-num">{r.n}</div>
                <div><div className="pq-it">{r.t}</div><div className="pq-id">{r.d}</div></div>
              </div>
            ))}
          </div>
          <a href={waLink('porque')} className="btn btn-amb rv d4">⚡ Garantir minha mesa</a>
        </div>
      </div>
    </section>
  )
}
