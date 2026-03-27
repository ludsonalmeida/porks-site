import { useRef } from 'react'

const reviews = [
  { name: 'Nicolas Soares', stars: 5, text: 'Ambiente muito aconchegante, atendimento EXCELENTE, funcionários muito prestativos, atenciosos e educados, bandas EXCELENTES, drinks e bebidas criativas além da culinária rústica excepcional.' },
  { name: 'Luegela Lourenço', stars: 5, text: 'Uma palavra pra definir o local e a noite de ontem: INCRÍVEL!!! Desde o agendamento! Toda atenção, o atendimento excepcional, a banda contagiou demais, minhas filhas amaram! Super indico.' },
  { name: 'Afranio Dias', stars: 5, text: 'Não há cobrança de couvert ou 10%. Isso é ótimo! Além disso, local de boa música!! Rock do bom!!!' },
  { name: 'Beatrice Azevedo', stars: 5, text: 'Chopp gelado e delicioso! O de manga é o melhor. Ótimo atendimento e ambiente super agradável.' },
  { name: 'Márcio Formiga', stars: 5, text: 'Ótimo atendimento, comida diferenciada e alta qualidade de som, mantenham!' },
  { name: 'Vinicius Santana', stars: 5, text: 'Chopp gelado, atendimento excelente e música boa!' },
  { name: 'Jonatha Souza', stars: 5, text: 'Ótimo atendimento, equipe super simpática, indico bastante!' },
  { name: 'Karine Lima', stars: 5, text: 'Eduardo o melhor garçom do estabelecimento, educado e muito simpático. Super indico!' },
]

function StarRow() {
  return <div className="rv-stars">{'★★★★★'}</div>
}

export default function Reviews() {
  const trackRef = useRef(null)
  const scroll = (dir) => {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <section className="reviews pad" id="reviews">
      <div className="wrap">
        <div className="rv-head rv">
          <div>
            <div className="stamp stamp-red" style={{ marginBottom: 14 }}>AVALIAÇÕES REAIS</div>
            <span className="rv-t1">o que falam</span>
            <span className="rv-t2">DO PORKS ★</span>
          </div>
          <div className="rv-badge rv d1">
            <div className="rv-badge-score">4.6</div>
            <div className="rv-badge-info">
              <StarRow />
              <span className="rv-badge-src">Google Meu Negócio</span>
            </div>
          </div>
        </div>
        <div className="rv-nav rv d2">
          <button className="rv-arr" onClick={() => scroll(-1)} aria-label="Anterior">←</button>
          <button className="rv-arr" onClick={() => scroll(1)} aria-label="Próximo">→</button>
        </div>
        <div className="rv-track rv d2" ref={trackRef}>
          {reviews.map((r, i) => (
            <div key={i} className="rv-card">
              <StarRow />
              <p className="rv-text">"{r.text}"</p>
              <div className="rv-author">
                <div className="rv-avatar">{r.name[0]}</div>
                <div>
                  <div className="rv-name">{r.name}</div>
                  <div className="rv-src">Google</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
