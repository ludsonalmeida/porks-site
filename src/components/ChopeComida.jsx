const breweries = [
  { name: 'Biomma', logo: 'https://assets.untappd.com/site/brewery_logos/brewery-483650_3f93a.jpeg' },
  { name: 'Colombina', logo: 'https://cdn.awsli.com.br/1577/1577274/logo/dc92f2836b.png' },
  { name: 'Cruls', logo: 'https://static.wixstatic.com/media/50d772_2a9b16e063cd4fe2b538f6d795466d84~mv2.png' },
  { name: 'Biela Bier', logo: 'https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/logo-biela.png' },
  { name: 'Puhls Beer', logo: null },
]

export default function ChopeComida() {
  return (
    <section className="cc" id="chope">
      <div className="wrap">
        <div className="cc-grid">
          <div className="cc-block rv">
            <div className="cc-ey">Chope artesanal</div>
            <span className="cc-t1">mais de</span>
            <span className="cc-t2">15 ROTULOS</span>
            <span className="cc-t3">ARTESANAIS ★</span>
            <p className="cc-p">Receitas premiadas das melhores cervejarias do cerrado. Colombina e Cruls na torneira, sempre gelado, sempre especial.</p>
            <div className="cc-logos">
              {breweries.map(b => (
                <div key={b.name} className="cc-logo">
                  {b.logo
                    ? <img src={b.logo} alt={b.name} loading="lazy" />
                    : <span className="cc-logo-text">{b.name}</span>
                  }
                </div>
              ))}
            </div>
          </div>
          <div className="cc-block cc-food rv d1">
            <div className="cc-ey">Gastronomia</div>
            <span className="cc-t1">especialistas em</span>
            <span className="cc-t2">PETISCOS</span>
            <span className="cc-t3">DE PORCO ★</span>
            <p className="cc-p">Harmonização perfeita entre chope artesanal e receitas autorais de porco. Torresmo, costela, linguiça e muito mais — tudo pensado pra acompanhar sua noite.</p>
            <div className="cc-highlights">
              <div className="cc-hi"><span className="cc-hi-ic">🍖</span><span>Torresmo artesanal</span></div>
              <div className="cc-hi"><span className="cc-hi-ic">🍺</span><span>Harmonização exclusiva</span></div>
              <div className="cc-hi"><span className="cc-hi-ic">🔥</span><span>Receitas autorais</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
