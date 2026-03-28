import { useState, useEffect } from 'react'
import { getBreweries, fetchBreweries } from '../utils/breweriesCards.js'

export default function ChopeComida() {
  const [breweries, setBreweries] = useState(() => getBreweries().filter(b => b.name))

  useEffect(() => {
    fetchBreweries().then(items => setBreweries(items.filter(b => b.name)))
  }, [])
  const items = [...breweries, ...breweries] // duplicate for seamless loop

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

      <div className="cc-breweries rv">
        <div className="cc-brew-label">Cervejarias parceiras</div>
        <div className="cc-brew-track-wrap">
          <div className="cc-brew-track">
            {items.map((b, i) => (
              <div key={i} className="cc-brew-item">
                {b.logo
                  ? <img src={b.logo} alt={b.name} loading="lazy" />
                  : <span className="cc-brew-text">{b.name}</span>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
