export default function Identity() {
  return (
    <section className="identity pad">
      <div className="id-inner wrap">
        <div className="rv">
          <div className="stamp stamp-red" style={{marginBottom:16}}>★ ELEITO PELA CIDADE</div>
          <span className="id-t1">a casa mais</span>
          <span className="id-t2">ROCK'N'<span className="a">ROLL</span></span>
          <span className="id-t3">DE SOBRADINHO ★</span>
          <p className="id-p">Show ao vivo quase toda noite. Chope sempre gelado. Comida forte. Um clima que você não vai achar em qualquer lugar — sem couvert, sem frescura, só a noite boa.</p>
          <a href="#cta" className="btn btn-red">⚡ Garantir minha mesa</a>
          <div className="id-stats">
            <div className="id-s rv d1"><div className="id-sn">2×</div><div className="id-sl">Shows<br/>por semana</div></div>
            <div className="id-s rv d2"><div className="id-sn">R$0</div><div className="id-sl">Couvert<br/>sempre</div></div>
            <div className="id-s rv d3"><div className="id-sn">∞</div><div className="id-sl">Chope<br/>gelado</div></div>
            <div className="id-s rv d4"><div className="id-sn">+</div><div className="id-sl">Promos<br/>toda semana</div></div>
          </div>
        </div>
        <div className="id-photo-wrap rv d2">
          <div className="tape id-tape-1" style={{position:'absolute',top:6,left:'50%',transform:'translateX(-42%) rotate(-2.5deg)',width:54,zIndex:4}} />
          <div className="tape id-tape-2" style={{position:'absolute',bottom:2,right:22,transform:'rotate(4.5deg)',width:36,zIndex:4}} />
          <div className="id-photo">
            <img src="https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p8.jpg" alt="Galera curtindo no Porks" loading="lazy" />
          </div>
          <div className="id-tkt">
            <span className="tl">★ live music · toda semana</span>
            <span className="tv">SHOWS AO VIVO</span>
          </div>
        </div>
      </div>
    </section>
  )
}
