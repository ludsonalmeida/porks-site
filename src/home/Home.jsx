import { useEffect, useState } from 'react'
import { waLink } from '../utils/wa.js'
import { getBreweries, fetchBreweries } from '../utils/breweriesCards.js'
import PixelLoader from '../components/PixelLoader'
import './home.css'

const CDN = 'https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas'
const IFOOD = 'https://www.ifood.com.br/delivery/brasilia-df/porks-sobradinho-sobradinho/e42c5658-b382-44e4-a6e8-5259c3c07726'
const MAPS = 'https://maps.google.com/?cid=2138163599891563158'
const INSTA = 'https://www.instagram.com/porks_sobradinho/'
const FONE = '(61) 9 3500-3917'

// clique no WhatsApp = conversão do Google Ads (antes só o botão flutuante disparava)
function conversao() {
  if (typeof window.gtag === 'function') window.gtag('event', 'conversion', { send_to: 'AW-17637617336/UOtdCOa115AcELjdotpB' })
}
function Wa({ secao, className, children }) {
  return <a href={waLink(secao)} className={className} target="_blank" rel="noopener noreferrer" onClick={conversao}>{children}</a>
}

const ICONES = {
  wa: <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm4.6 12.6c-.2.6-1.1 1.1-1.6 1.2-.4 0-.9.1-2.9-.7-2.4-1-4-3.4-4.1-3.6-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.6-.1 1.2z" fill="currentColor" stroke="none" />,
  cal: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  mapa: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  fone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  insta: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></>,
  plug: <><path d="M9 3v5M15 3v5" /><path d="M6 8h12v3a6 6 0 0 1-12 0z" /><path d="M12 17v4" /></>,
  guitarra: <><path d="M14 10l6-6M18 2l4 4" /><path d="M11.5 8.5a3.5 3.5 0 0 0-4.9.3c-.8.9-.6 1.7-1.6 2.5C3.3 12.7 2 14 3.6 17.4 5 20.3 8 21.7 10.6 20c.8-.5 1.6-.8 2.5-1.6.8-.8 1.4-1.6 1.5-2.4.2-1.2-.6-2-1.4-2.6" /><circle cx="9" cy="15" r="1.4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  fechar: <path d="M6 6l12 12M18 6L6 18" />,
  estrela: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor" stroke="none" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  sacola: <><path d="M5 8h14l-1 13H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
}
function Ico({ n, className = 'hm-ico' }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONES[n]}</svg>
}

/* ── agenda (Google Agenda do Porks + perfis das bandas) ── */
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const diaDe = s => new Date(`${s}T12:00:00`)
const SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
// hora só quando faz sentido pra show (evita "08h" digitado errado na agenda)
const horaTxt = h => (h && +h.slice(0, 2) >= 16 ? `${+h.slice(0, 2)}h${h.slice(3, 5) !== '00' ? h.slice(3, 5) : ''}` : null)

function useShows() {
  const [shows, setShows] = useState(null)
  useEffect(() => {
    const hoje = new Date()
    const ate = new Date(); ate.setDate(ate.getDate() + 75)
    fetch(`/api/bandas/agenda?de=${iso(hoje)}&ate=${iso(ate)}`)
      .then(r => (r.ok ? r.json() : []))
      .then(l => setShows(l.filter(s => s.banda && !/^teste\b/i.test(s.banda))))
      .catch(() => setShows([]))
  }, [])
  return shows
}

function DataBloco({ data }) {
  const d = diaDe(data)
  return (
    <span className="hm-data">
      <small>{SEMANA[d.getDay()]}</small>
      <b>{d.getDate()}</b>
      <small>{MESES[d.getMonth()]}</small>
    </span>
  )
}

function quando(data) {
  const hoje = iso(new Date())
  const amanha = new Date(); amanha.setDate(amanha.getDate() + 1)
  if (data === hoje) return 'Hoje'
  if (data === iso(amanha)) return 'Amanhã'
  const d = diaDe(data)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

/* ── topo ── */
const LINKS = [
  { href: '#shows', label: 'Shows' },
  { href: '#semana', label: 'A semana' },
  { href: '#reservas', label: 'Reservas' },
  { href: '/cardapio', label: 'Cardápio' },
]

function Topo() {
  const [aberto, setAberto] = useState(false)
  const [rolou, setRolou] = useState(false)
  useEffect(() => {
    const f = () => setRolou(window.scrollY > 24)
    f(); window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])
  return (
    <header className={`hm-topo${rolou ? ' rolou' : ''}${aberto ? ' aberto' : ''}`}>
      <div className="hm-topo-in">
        <a href="#inicio" className="hm-logo" aria-label="Porks Sobradinho, início"><img src="/images/logo-porks.png" alt="Porks Sobradinho" width="120" height="56" /></a>
        <nav className="hm-nav" aria-label="Principal">
          {LINKS.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <Wa secao="nav" className="hm-btn hm-btn-sm hm-btn-amb hm-topo-cta"><Ico n="wa" />Reservar</Wa>
        <button type="button" className="hm-menu-btn" aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={aberto} onClick={() => setAberto(a => !a)}>
          <Ico n={aberto ? 'fechar' : 'menu'} />
        </button>
      </div>
      {aberto && (
        <nav className="hm-gaveta" aria-label="Menu">
          {LINKS.map(l => <a key={l.href} href={l.href} onClick={() => setAberto(false)}>{l.label}<Ico n="seta" /></a>)}
          <a href={IFOOD} target="_blank" rel="noopener noreferrer" onClick={() => setAberto(false)}>Delivery no iFood<Ico n="seta" /></a>
          <a href="/produtor" onClick={() => setAberto(false)}>Quero tocar no Porks<Ico n="seta" /></a>
        </nav>
      )}
    </header>
  )
}

function Hero({ proximo }) {
  return (
    <section className="hm-hero" id="inicio">
      <img className="hm-hero-bg" src={`${CDN}/p9.jpg`} alt="" fetchpriority="high" />
      <div className="hm-hero-in hm-wrap">
        <p className="hm-kicker">Porks Sobradinho · Porco & Chope</p>
        <h1>Rock ao vivo, chope gelado e <em>zero couvert.</em></h1>
        <p className="hm-hero-sub">Banda toda sexta e sábado, petiscos de porco e mais de 15 chopes artesanais. Reserve sua mesa pelo WhatsApp em 2 minutos.</p>
        <div className="hm-hero-btns">
          <Wa secao="hero" className="hm-btn hm-btn-amb hm-btn-lg"><Ico n="wa" />Reservar mesa</Wa>
          <a href="#shows" className="hm-btn hm-btn-ghost hm-btn-lg"><Ico n="cal" />Ver shows</a>
        </div>
        <ul className="hm-selos" aria-label="Destaques">
          <li><Ico n="check" />Sem couvert</li>
          <li><Ico n="check" />Sem entrada</li>
          <li><Ico n="check" />Terça a domingo</li>
        </ul>
        {proximo && (
          <a className="hm-prox" href={proximo.link || '#shows'}>
            <DataBloco data={proximo.data} />
            <span className="hm-prox-txt">
              <small>Próximo show · {quando(proximo.data)}{horaTxt(proximo.hora) ? `, ${horaTxt(proximo.hora)}` : ''}</small>
              <b>{proximo.banda}</b>
            </span>
            <Ico n="seta" className="hm-ico hm-prox-seta" />
          </a>
        )}
      </div>
    </section>
  )
}

/* ── próximos shows ── */
function Shows({ shows }) {
  const lista = (shows || []).slice(0, 6)
  return (
    <section className="hm-sec hm-escuro" id="shows" aria-labelledby="hm-shows-t">
      <div className="hm-wrap">
        <div className="hm-cab">
          <p className="hm-kicker">Agenda</p>
          <h2 id="hm-shows-t">Próximos shows</h2>
          <p className="hm-cab-sub">Música ao vivo sexta e sábado, a partir das 20h. Sem couvert, sempre.</p>
        </div>
        <div className="hm-shows-grid">
          <ol className="hm-shows">
            {shows === null && [0, 1, 2].map(i => <li key={i} className="hm-show hm-esqueleto" aria-hidden="true" />)}
            {shows && !lista.length && (
              <li className="hm-show-vazio">A agenda dos próximos fins de semana está sendo fechada. Chama a gente no WhatsApp pra saber quem toca.</li>
            )}
            {lista.map(s => {
              const conteudo = <>
                <DataBloco data={s.data} />
                {s.avatar && <img className="hm-show-av" src={s.avatar} alt="" loading="lazy" width="48" height="48" />}
                <span className="hm-show-txt">
                  <b>{s.banda}</b>
                  <small>{quando(s.data)}{horaTxt(s.hora) ? ` · ${horaTxt(s.hora)}` : ''}{s.titulo ? ` · ${s.titulo}` : ''}</small>
                </span>
                {s.link && <span className="hm-show-ver">Ver banda<Ico n="seta" /></span>}
              </>
              return <li key={`${s.data}-${s.banda}`}>{s.link ? <a className="hm-show" href={s.link}>{conteudo}</a> : <div className="hm-show">{conteudo}</div>}</li>
            })}
          </ol>
          <aside className="hm-pp">
            <span className="hm-pp-ico"><Ico n="plug" /></span>
            <p className="hm-kicker">Toda quinta · 19h às 23h50</p>
            <h3>Plug & Play</h3>
            <p>Músico chega, pluga e toca junto. Uma jam aberta toda quinta, com até 10 músicos por noite.</p>
            <a href="/produtor" className="hm-btn hm-btn-roxo"><Ico n="guitarra" />Quero tocar</a>
            <p className="hm-pp-banda">Tem banda e quer tocar no fim de semana? <a href="/produtor">Fala com o Johnny, nosso produtor.</a></p>
          </aside>
        </div>
        <div className="hm-centro">
          <Wa secao="agenda" className="hm-btn hm-btn-amb"><Ico n="wa" />Reservar mesa pro show</Wa>
        </div>
      </div>
    </section>
  )
}

/* ── a semana ── */
const SEMANA_PORKS = [
  { d: 2, dia: 'Terça', nome: 'Terça do Ritual', txt: 'Combos de chope + petisco a partir de R$ 16.' },
  { d: 3, dia: 'Quarta', nome: 'Quarta Raiz', txt: 'Torresmo mineiro + Pilsen por R$ 29,90.' },
  { d: 4, dia: 'Quinta', nome: 'Plug & Play', txt: 'Jam aberta pra músicos, das 19h às 23h50.' },
  { d: 5, dia: 'Sexta', nome: 'Rock ao vivo', txt: 'Banda a partir das 20h, sem couvert.', show: true },
  { d: 6, dia: 'Sábado', nome: 'Rock ao vivo', txt: 'Banda a partir das 20h, sem couvert.', show: true },
  { d: 0, dia: 'Domingo', nome: 'Hamburgada', txt: 'Qualquer hambúrguer da casa por R$ 18.' },
]
function Semana() {
  const hoje = new Date().getDay()
  return (
    <section className="hm-sec hm-claro" id="semana" aria-labelledby="hm-sem-t">
      <div className="hm-wrap">
        <div className="hm-cab">
          <p className="hm-kicker">Toda semana</p>
          <h2 id="hm-sem-t">Cada dia tem um motivo</h2>
          <p className="hm-cab-sub">Abrimos de terça a sexta às 17h, sábado e domingo às 16h.</p>
        </div>
        <ul className="hm-semana">
          {SEMANA_PORKS.map(s => (
            <li key={s.d} className={`hm-dia${s.show ? ' show' : ''}${s.d === hoje ? ' hoje' : ''}`}>
              <span className="hm-dia-nome">{s.dia}{s.d === hoje && <em>Hoje</em>}</span>
              <b>{s.nome}</b>
              <span>{s.txt}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── chope e comida ── */
function ChopeComida() {
  const [cervejarias, setCervejarias] = useState(() => getBreweries().filter(b => b.name))
  useEffect(() => { fetchBreweries().then(l => setCervejarias(l.filter(b => b.name))) }, [])
  return (
    <section className="hm-sec hm-escuro" id="chope" aria-labelledby="hm-cc-t">
      <div className="hm-wrap hm-cc">
        <div className="hm-cc-foto">
          <img src={`${CDN}/p1.jpg`} alt="Amigos brindando com o chope do Porks" loading="lazy" />
        </div>
        <div>
          <p className="hm-kicker">Chope e comida</p>
          <h2 id="hm-cc-t">Chope artesanal e petisco de porco</h2>
          <ul className="hm-cc-lista">
            <li><b>Mais de 15 chopes artesanais</b><span>Das melhores cervejarias do cerrado, sempre gelados.</span></li>
            <li><b>Especialistas em porco</b><span>Torresmo, costela, linguiça e receitas autorais pra acompanhar o chope.</span></li>
            <li><b>Hambúrguer, drinks e porções</b><span>Cardápio completo pra mesa toda.</span></li>
          </ul>
          <div className="hm-cc-btns">
            <a href="/cardapio" className="hm-btn hm-btn-amb">Ver cardápio</a>
            <a href={IFOOD} target="_blank" rel="noopener noreferrer" className="hm-btn hm-btn-ghost"><Ico n="sacola" />Delivery no iFood</a>
          </div>
        </div>
      </div>
      {cervejarias.length > 0 && (
        <div className="hm-wrap">
          <p className="hm-cerv-t">Cervejarias parceiras</p>
          <ul className="hm-cerv">
            {cervejarias.map(b => (
              <li key={b.id || b.name}>{b.logo ? <img src={b.logo} alt={b.name} loading="lazy" /> : <span>{b.name}</span>}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

/* ── reservas ── */
const MOTIVOS = [
  { secao: 'ocasioes', img: '/images/porque.jpg', titulo: 'Mesa pra sair', txt: 'Date, amigos ou aquela noite que merece lugar garantido.' },
  { secao: 'aniversario', img: `${CDN}/p3.jpg`, titulo: 'Aniversário', txt: 'Junta a galera e comemora com rock e chope gelado.' },
  { secao: 'grupos', img: `${CDN}/p4.jpg`, titulo: 'Grupos e confras', txt: 'Formatura, despedida, reencontro, amigo oculto.' },
  { secao: 'empresa', img: '/images/oc-corporativo.jpg', titulo: 'Evento de empresa', txt: 'Happy hour do time e recepção de clientes.' },
]
function Reservas() {
  return (
    <section className="hm-sec hm-claro" id="reservas" aria-labelledby="hm-res-t">
      <div className="hm-wrap">
        <div className="hm-cab">
          <p className="hm-kicker">Reservas</p>
          <h2 id="hm-res-t">Qual é o motivo da noite?</h2>
          <p className="hm-cab-sub">Escolha e chame a gente no WhatsApp. A confirmação chega no próprio chat.</p>
        </div>
        <ul className="hm-motivos">
          {MOTIVOS.map(m => (
            <li key={m.secao}>
              <Wa secao={m.secao} className="hm-motivo">
                <img src={m.img} alt="" loading="lazy" />
                <span className="hm-motivo-txt">
                  <b>{m.titulo}</b>
                  <span>{m.txt}</span>
                  <em>Reservar<Ico n="seta" /></em>
                </span>
              </Wa>
            </li>
          ))}
        </ul>
        <ol className="hm-passos" aria-label="Como reservar">
          <li><span>1</span>Chama no WhatsApp</li>
          <li><span>2</span>Diz o dia e quantas pessoas</li>
          <li><span>3</span>Recebe a confirmação</li>
        </ol>
      </div>
    </section>
  )
}

/* ── avaliações ── */
const AVALIACOES = [
  { nome: 'Nicolas Soares', txt: 'Ambiente muito aconchegante, atendimento excelente, funcionários muito prestativos. Bandas excelentes, drinks criativos e culinária rústica excepcional.' },
  { nome: 'Luegela Lourenço', txt: 'Uma palavra pra definir o local e a noite de ontem: incrível! Desde o agendamento, toda atenção. A banda contagiou demais, minhas filhas amaram!' },
  { nome: 'Afranio Dias', txt: 'Não há cobrança de couvert ou 10%. Isso é ótimo! Além disso, local de boa música. Rock do bom!' },
]
function Avaliacoes() {
  return (
    <section className="hm-sec hm-escuro" id="avaliacoes" aria-labelledby="hm-av-t">
      <div className="hm-wrap">
        <div className="hm-cab hm-av-cab">
          <div>
            <p className="hm-kicker">Quem foi, aprovou</p>
            <h2 id="hm-av-t">O que falam do Porks</h2>
          </div>
          <div className="hm-nota" aria-label="Nota 4,6 de 5 no Google">
            <b>4,6</b>
            <span><span className="hm-estrelas">{[0, 1, 2, 3, 4].map(i => <Ico key={i} n="estrela" />)}</span>no Google</span>
          </div>
        </div>
        <ul className="hm-avs">
          {AVALIACOES.map(a => (
            <li key={a.nome} className="hm-av">
              <span className="hm-estrelas">{[0, 1, 2, 3, 4].map(i => <Ico key={i} n="estrela" />)}</span>
              <p>“{a.txt}”</p>
              <b>{a.nome}</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ── visite + dúvidas ── */
const DUVIDAS = [
  { q: 'Tem couvert ou taxa de entrada?', a: 'Não. No Porks não tem couvert nem entrada, nem em dia de show.' },
  { q: 'Como funciona a reserva?', a: 'Chama no WhatsApp com o dia, o horário e quantas pessoas vêm. A gente confirma a disponibilidade e manda a confirmação no chat.' },
  { q: 'Dá pra reservar pra grupo grande ou evento?', a: 'Dá sim. De uma mesa pra 4 até turmas grandes e eventos de empresa. Conta pra gente quantas pessoas e o motivo.' },
  { q: 'Tem delivery?', a: 'Tem, pelo iFood. Procura por Porks Sobradinho ou toca no botão Delivery aqui no site.' },
]
function Visite() {
  return (
    <section className="hm-sec hm-claro" id="visite" aria-labelledby="hm-vis-t">
      <div className="hm-wrap hm-visite">
        <div>
          <p className="hm-kicker">Visite</p>
          <h2 id="hm-vis-t">Te esperamos em Sobradinho</h2>
          <ul className="hm-info">
            <li><Ico n="relogio" /><span><b>Terça a sexta, a partir das 17h</b>Sábado e domingo, a partir das 16h</span></li>
            <li><Ico n="mapa" /><span><b>Sobradinho, DF</b><a href={MAPS} target="_blank" rel="noopener noreferrer">Abrir no Google Maps</a></span></li>
            <li><Ico n="fone" /><span><b>{FONE}</b>Exclusivo pra reservas</span></li>
            <li><Ico n="insta" /><span><b>@porks_sobradinho</b><a href={INSTA} target="_blank" rel="noopener noreferrer">Seguir no Instagram</a></span></li>
          </ul>
        </div>
        <div>
          <h3 className="hm-duv-t">Dúvidas rápidas</h3>
          <div className="hm-duvidas">
            {DUVIDAS.map(d => (
              <details key={d.q}>
                <summary>{d.q}<span aria-hidden="true">+</span></summary>
                <p>{d.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Rodape() {
  return (
    <footer className="hm-rodape">
      <div className="hm-wrap">
        <div className="hm-fim">
          <h2>Bora garantir sua mesa?</h2>
          <Wa secao="footer" className="hm-btn hm-btn-amb hm-btn-lg"><Ico n="wa" />Reservar pelo WhatsApp</Wa>
        </div>
        <div className="hm-rod-linha">
          <img src="/images/logo-porks.png" alt="Porks Sobradinho" width="96" height="45" loading="lazy" />
          <nav aria-label="Rodapé">
            <a href="/cardapio">Cardápio</a>
            <a href={IFOOD} target="_blank" rel="noopener noreferrer">Delivery</a>
            <a href="/produtor">Quero tocar</a>
            <a href={INSTA} target="_blank" rel="noopener noreferrer">Instagram</a>
          </nav>
        </div>
        <p className="hm-copy">© {new Date().getFullYear()} Porks Sobradinho · Porco & Chope · Sobradinho, DF</p>
      </div>
    </footer>
  )
}

// barra fixa no celular: aparece depois do topo
function BarraCelular() {
  const [mostra, setMostra] = useState(false)
  useEffect(() => {
    const topo = document.getElementById('inicio')
    if (!topo) return
    const ob = new IntersectionObserver(([e]) => setMostra(!e.isIntersecting), { threshold: 0.05 })
    ob.observe(topo)
    return () => ob.disconnect()
  }, [])
  return (
    <div className={`hm-barra${mostra ? ' on' : ''}`}>
      <Wa secao="sticky" className="hm-btn hm-btn-amb"><Ico n="wa" />Reservar mesa</Wa>
      <a href="#shows" className="hm-btn hm-btn-ghost"><Ico n="cal" />Shows</a>
    </div>
  )
}

export default function Home() {
  const shows = useShows()
  return (
    <div className="hm">
      <PixelLoader />
      <a href="#shows" className="hm-pular">Pular pro conteúdo</a>
      <Topo />
      <main>
        <Hero proximo={shows?.[0]} />
        <Shows shows={shows} />
        <Semana />
        <ChopeComida />
        <Reservas />
        <Avaliacoes />
        <Visite />
      </main>
      <Rodape />
      <BarraCelular />
    </div>
  )
}
