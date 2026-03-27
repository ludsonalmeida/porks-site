import { useState } from 'react'

const WA = 'https://wa.me/5561935003917?text=Oi%2C+tenho+uma+d%C3%BAvida'
const items = [
  { q: 'Como funciona a reserva?', a: 'Entre em contato pelo WhatsApp com data, horário e número de pessoas. Confirmamos a disponibilidade e garantimos seu espaço. Rápido, sem burocracia.' },
  { q: 'Quais tipos de reserva existem?', a: 'Mesa avulsa, aniversário, confraternização/grupos e eventos corporativos. É só nos contar o motivo.' },
  { q: 'Posso reservar para aniversário?', a: 'Sim! É um dos nossos mais pedidos. Sem couvert, sem entrada — sempre.' },
  { q: 'Posso reservar para grupo grande?', a: 'Com certeza. De uma mesa pra 4 até turmas grandes. Nos conta quantas pessoas.' },
  { q: 'Como falo com alguém do Porks?', a: 'A forma mais rápida é pelo WhatsApp. Respondemos rápido, especialmente em dias de semana.' },
  { q: 'Como funciona a confirmação?', a: 'Após alinhar data, horário e número de pessoas pelo WhatsApp, você recebe a confirmação direto no chat.' },
]

export default function Faq() {
  const [open, setOpen] = useState(-1)

  return (
    <section className="faq pad" id="faq">
      <div className="faq-layout wrap">
        <div>
          <div className="faq-ey rv">Dúvidas</div>
          <div className="rv d1">
            <span className="faq-t1">como podemos</span>
            <span className="faq-t2">TE AJUDAR? ★</span>
          </div>
          <p className="faq-p rv d2">Tire suas dúvidas. Fale direto no WhatsApp — resposta rápida.</p>
          <a href={WA} className="btn btn-amb rv d3">⚡ Falar no WhatsApp</a>
        </div>
        <div className="faq-list rv d1">
          {items.map((it, i) => (
            <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                {it.q}
                <div className="faq-ico">+</div>
              </button>
              <div className="faq-a">{it.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
