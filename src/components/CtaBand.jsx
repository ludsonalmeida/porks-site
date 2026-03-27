const WA = 'https://wa.me/5561935003917?text=Quero+fazer+minha+reserva'

export default function CtaBand() {
  return (
    <div className="cta-band" id="cta">
      <div className="cta-txt rv">
        <span className="cta-t1">não deixa sua noite na sorte —</span>
        <span className="cta-t2">RESERVE AGORA.</span>
        <span className="cta-t3">SUA MESA GARANTIDA. ★</span>
      </div>
      <div className="cta-btns rv d2">
        <a href={WA} className="btn btn-yel btn-lg">⚡ Reservar agora</a>
        <a href="#ocasioes" className="btn btn-ghost">Ver ocasiões</a>
      </div>
    </div>
  )
}
