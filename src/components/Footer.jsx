const WA = 'https://wa.me/5561935003917?text=Quero+fazer+minha+reserva'

export default function Footer() {
  return (
    <footer>
      <div className="ft-reserve">
        <div className="frv">
          <div className="frv-lbl">Mais rápido</div>
          <div className="frv-title">RESERVAR PELO WHATSAPP</div>
          <a href={WA} className="btn btn-amb btn-sm">⚡ Reservar</a>
        </div>
        <div className="frv">
          <div className="frv-lbl">Fale com a gente</div>
          <div className="frv-title">ATENDIMENTO DIRETO</div>
          <a href="tel:+5561935003917" className="frv-phone">(61) 9 3500-3917</a>
          <div className="frv-sub">Exclusivo para reservas</div>
        </div>
        <div className="frv">
          <div className="frv-lbl">Horários</div>
          <div className="frv-title">TER–SEX 17H · SÁB–DOM 16H</div>
          <div className="frv-sub">★ Sem couvert · Sem entrada ★</div>
        </div>
      </div>
      <div className="ft-main">
        <div className="ft-brand">
          <img src="/images/logo-porks.png" alt="Porks Sobradinho" className="ft-logo-img" />
          <p>Show ao vivo quase toda noite, chope gelado, comida forte. Sobradinho, DF.</p>
          <div className="ft-socs">
            <a href="#" className="ft-soc">IG</a>
            <a href={WA} className="ft-soc">WA</a>
            <a href="#" className="ft-soc">FB</a>
          </div>
        </div>
        <div className="ft-col">
          <h5>★ Reservas</h5>
          <ul>
            <li><a href={WA}>WhatsApp</a></li>
            <li><a href="#aniversario">Aniversário</a></li>
            <li><a href="#grupos">Grupos</a></li>
            <li><a href="#empresa">Corporativo</a></li>
          </ul>
        </div>
        <div className="ft-col">
          <h5>★ Programação</h5>
          <ul>
            <li><a href="#agenda">Agenda semanal</a></li>
            <li><a href="#shows">Shows ao vivo</a></li>
            <li><a href="#agenda">Terça do Ritual</a></li>
            <li><a href="#agenda">Quarta Raiz</a></li>
          </ul>
        </div>
        <div className="ft-col">
          <h5>★ O Porks</h5>
          <ul>
            <li><a href="#">Sobradinho — DF</a></li>
            <li><a href="#">Ter–Sex 17h · Sáb–Dom 16h</a></li>
            <li><a href="#">Instagram</a></li>
            <li><a href="#">Como chegar</a></li>
          </ul>
        </div>
      </div>
      <div className="ft-bot">
        <div className="ft-copy">© 2026 Porks Sobradinho · ★ A casa mais rock'n'roll da cidade ★</div>
        <div className="ft-copy">Porco & Chope · Jazz, Blues & Rock · Sobradinho, DF</div>
      </div>
    </footer>
  )
}
