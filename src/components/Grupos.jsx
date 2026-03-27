const WA = 'https://wa.me/5561935003917?text=Quero+fazer+uma+reserva+pro+meu+grupo'
const tags = ['Formaturas','Despedidas','Reencontros','Amigos','Faculdade','Festa informal','Happy hour','Aniversário em grupo']

export default function Grupos() {
  return (
    <section className="grupos pad" id="grupos">
      <div className="gp-layout wrap">
        <div>
          <div className="gp-ey rv">Grupos & confraternizações</div>
          <div className="rv d1">
            <span className="gp-t1">reúne a turma</span>
            <span className="gp-t2">NO LUGAR<br/><span className="a">CERTO. ★</span></span>
          </div>
          <p className="gp-p rv d2">Brindar, comer bem e transformar o encontro em noite de verdade. O Porks tem espaço, programação e aquele clima que faz qualquer confra virar memória boa.</p>
          <div className="gp-tags rv d3">
            {tags.map(t => <span key={t} className="gtag">{t}</span>)}
          </div>
          <a href={WA} className="btn btn-amb rv d4">⚡ Reservar para grupo</a>
        </div>
        <div className="gp-photos rv d2">
          <div className="gv tall"><img src="https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p2.jpg" alt="Galera no Porks" loading="lazy" /><span className="gv-tag">★ Sextas</span></div>
          <div className="gv"><img src="https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p7.jpg" alt="Turma reunida" loading="lazy" /></div>
          <div className="gv"><img src="https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p1.jpg" alt="Noite no Porks" loading="lazy" /></div>
        </div>
      </div>
    </section>
  )
}
