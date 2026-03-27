const WA = 'https://wa.me/5561935003917?text=Quero+fazer+minha+reserva'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        <img src="/images/hero-bg.jpg" alt="Porks Sobradinho" loading="eager" />
      </div>
      <div className="hero-ov" />

      <div className="hero-strip">
        <div className="hero-strip-inner">
          <span>SEM COUVERT</span>
          <span className="bull">●</span>
          <span>SHOWS AO VIVO</span>
          <span className="bull">●</span>
          <span>CHOPE GELADO</span>
          <span className="bull">●</span>
          <span>SOBRADINHO · DF</span>
        </div>
      </div>

      <div className="hero-body wrap">
        <div>
          <div className="hero-ey rv">★ Reserve sua noite no Porks</div>
          <span className="ht1 rv d1">a casa mais rock'n'roll da cidade</span>
          <span className="ht2 rv d1">SUA NOITE<br/>COMEÇA AQUI<span className="r">.</span></span>
          <span className="ht3 rv d2">RESERVE SUA MESA ★</span>
          <p className="hero-sub rv d2">Aniversário, encontro com a galera, confraternização ou evento da empresa. Reserve antes e chegue sabendo que seu lugar tá garantido.</p>

          <div className="hero-btns rv d2">
            <a href={WA} className="btn btn-amb btn-lg">⚡ Reservar agora</a>
            <a href="#agenda" className="btn btn-ghost">Ver agenda →</a>
          </div>

          <div className="hero-rider rv d3">
            <div className="ri"><div className="ri-n">2×</div><div className="ri-l">Shows<br/>por semana</div></div>
            <div className="ri"><div className="ri-n">R$0</div><div className="ri-l">Couvert<br/>sempre</div></div>
            <div className="ri"><div className="ri-n">★</div><div className="ri-l">Selo<br/>Michelin</div></div>
          </div>
        </div>

        <div className="hero-stickers rv d3">
          <div className="ticket hs-t1">
            <div className="tape hs-tape" />
            <span className="tl">★ shows ao vivo</span>
            <span className="tv">SEXTA & SÁBADO</span>
            <span className="ts">toda semana · sem couvert</span>
          </div>
          <div className="ticket hs-b1">
            <span className="tl">★ chope gelado</span>
            <span className="tv">MY F*CKING BAR</span>
            <span className="ts">pilsen · puro malte · artesanal</span>
          </div>
          <div className="ticket hs-t2">
            <span className="tl">★ reservas abertas</span>
            <span className="tv">ANIVERSÁRIOS & GRUPOS</span>
            <span className="ts">confirmação rápida · whatsapp</span>
          </div>
        </div>
      </div>
    </section>
  )
}
