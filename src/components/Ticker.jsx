const items = [
  "ROCK'N'ROLL", 'SHOWS AO VIVO', 'CHOPE GELADO', 'ANIVERSÁRIO',
  'GRUPOS & CONFRAS', 'JAZZ & BLUES & ROCK', 'SEM COUVERT',
  'PORCO & CHOPE', 'SOBRADINHO · DF',
]

export default function Ticker() {
  return (
    <div className="ticker" style={{position:'relative',zIndex:3}} aria-hidden="true">
      <div className="ticker-track">
        {[...items, ...items].map((t, i) => (
          <span key={i}>
            <span className="tick-i">{t}</span>
            <span className="tick-sep">★</span>
          </span>
        ))}
      </div>
    </div>
  )
}
