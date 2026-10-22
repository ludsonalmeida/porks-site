import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchHeroCards, saveHeroCards, DEFAULT_CARDS } from '../utils/heroCards.js'
import { fetchBreweries, saveBreweries, DEFAULT_BREWERIES } from '../utils/breweriesCards.js'
import AdminRadio from './AdminRadio.jsx'
import AdminBandas from './AdminBandas.jsx'
import './admin.css'

const PASS = import.meta.env.VITE_ADMIN_PASS || 'porks2026'
const MAX_W = 900

function resizeToBase64(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, MAX_W / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject
    img.src = url
  })
}

/* ─ ícones de traço (mesma família do Johnny e do perfil da banda) ─ */
const ICONES = {
  inicio: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  agenda: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /><path d="M8 14h3v3H8z" /></>,
  bandas: <><path d="m14 10 6-6M18 2l4 4" /><path d="M10.5 9.5a4 4 0 0 0-5.6.4c-1.3 1.4-.9 3-2.4 4.6 2 2 5.6 5 7.5 3.1 1.5-1.5 1.4-2.8 3-4a4 4 0 0 0-.1-5.6z" /><circle cx="9" cy="14" r="1.2" /></>,
  site: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /><circle cx="6" cy="6.5" r=".6" fill="currentColor" /><circle cx="8.5" cy="6.5" r=".6" fill="currentColor" /></>,
  radio: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  sair: <><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M10 16l-4-4 4-4M6 12h10" /></>,
  externo: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  olho: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  olhoX: <><path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.8M6.5 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.2-.9" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  alerta: <><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h.01" /></>,
  foto: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></>,
  lixo: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  mais: <path d="M12 5v14M5 12h14" />,
  dir: <path d="m9 5 7 7-7 7" />,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  microfone: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  copo: <><path d="M6 8h9v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" /><path d="M15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" /><path d="M6 8a3 3 0 0 1 3-4 3 3 0 0 1 5 0 2.5 2.5 0 0 1 1 4" /></>,
}
function Ico({ n, className = 'adm-ico' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONES[n]}
    </svg>
  )
}

const SECOES = [
  { id: 'inicio', label: 'Início', icone: 'inicio' },
  { id: 'agenda', label: 'Agenda', icone: 'agenda' },
  { id: 'bandas', label: 'Bandas', icone: 'bandas' },
  { id: 'site', label: 'Site', icone: 'site' },
  { id: 'radio', label: 'Rádio', icone: 'radio' },
]
const ANTIGAS = { hero: 'site', cervejarias: 'site' } // links velhos do admin
function secaoDoHash() {
  const h = window.location.hash.replace('#', '').split('?')[0]
  if (ANTIGAS[h]) return ANTIGAS[h]
  return SECOES.some(s => s.id === h) ? h : 'inicio'
}

/* ─ Login ─ */

function Login({ onEntrar }) {
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
  const [erro, setErro] = useState('')
  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={e => {
        e.preventDefault()
        if (senha === PASS) onEntrar()
        else setErro('Senha incorreta. Confere e tenta de novo.')
      }}>
        <img src="/images/logo-porks.png" alt="Porks Sobradinho" className="adm-login-logo" />
        <h1>Painel do Porks</h1>
        <p>Agenda, bandas, site e rádio num lugar só.</p>
        <label className="adm-campo">
          <span>Senha</span>
          <div className="adm-senha">
            <input type={ver ? 'text' : 'password'} value={senha} autoFocus autoComplete="current-password"
              onChange={e => { setSenha(e.target.value); setErro('') }} aria-invalid={!!erro} aria-describedby="adm-login-erro" />
            <button type="button" onClick={() => setVer(v => !v)} aria-label={ver ? 'Esconder senha' : 'Mostrar senha'}><Ico n={ver ? 'olhoX' : 'olho'} /></button>
          </div>
        </label>
        <p id="adm-login-erro" className="adm-erro" role="alert">{erro}</p>
        <button type="submit" className="adm-btn adm-btn-grande">Entrar</button>
      </form>
    </div>
  )
}

/* ─ Painel ─ */

export default function AdminPanel() {
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem('porks_admin') === '1' } catch { return false }
  })
  const [secao, setSecao] = useState(secaoDoHash)
  const [novas, setNovas] = useState(null)
  const mainRef = useRef(null)

  useEffect(() => {
    document.title = 'Painel do Porks'
    const onHash = () => setSecao(secaoDoHash())
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onHash) // voltar do navegador entre seções
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('popstate', onHash) }
  }, [])

  // contador de bandas novas no menu
  useEffect(() => {
    if (!authed) return
    fetch('/api/admin/bandas?status=nova&por=5', { headers: { 'x-admin-pass': PASS } })
      .then(r => (r.ok ? r.json() : null)).then(d => setNovas(d ? d.contagem.nova : null)).catch(() => {})
  }, [authed, secao])

  function ir(id) {
    if (secao === id) return
    window.history.pushState(null, '', `#${id}`)
    setSecao(id)
    mainRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }

  if (!authed) return <Login onEntrar={() => { try { sessionStorage.setItem('porks_admin', '1') } catch { /* sem storage */ } setAuthed(true) }} />

  function sair() {
    try { sessionStorage.removeItem('porks_admin') } catch { /* sem storage */ }
    setAuthed(false)
  }

  return (
    <div className="adm">
      <a href="#adm-conteudo" className="adm-pular">Pular pro conteúdo</a>
      <aside className="adm-lateral">
        <div className="adm-marca">
          <img src="/images/logo-porks.png" alt="Porks Sobradinho" />
          <span>Painel</span>
        </div>
        <nav aria-label="Seções do painel">
          {SECOES.map(s => (
            <a key={s.id} href={`#${s.id}`} className={`adm-nav${secao === s.id ? ' on' : ''}`} aria-current={secao === s.id ? 'page' : undefined}
              onClick={e => { e.preventDefault(); ir(s.id) }}>
              <Ico n={s.icone} />{s.label}
              {s.id === 'bandas' && novas > 0 && <span className="adm-badge" aria-label={`${novas} novas`}>{novas}</span>}
            </a>
          ))}
        </nav>
        <div className="adm-lateral-pe">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-nav"><Ico n="externo" />Ver o site</a>
          <button type="button" className="adm-nav" onClick={sair}><Ico n="sair" />Sair</button>
        </div>
      </aside>

      <header className="adm-topo-cel">
        <img src="/images/logo-porks.png" alt="Porks Sobradinho" />
        <b>{SECOES.find(s => s.id === secao)?.label}</b>
        <button type="button" className="adm-icone-btn" onClick={sair} aria-label="Sair do painel"><Ico n="sair" /></button>
      </header>

      <main id="adm-conteudo" className="adm-main" ref={mainRef} tabIndex={-1}>
        {secao === 'inicio' && <Inicio ir={ir} />}
        {secao === 'agenda' && <Agenda ir={ir} />}
        {secao === 'bandas' && <AdminBandas pass={PASS} />}
        {secao === 'site' && <Site />}
        {secao === 'radio' && <div className="adm-pagina"><Cabecalho titulo="Rádio" sub="Pedidos de música da jukebox do Porks." /><div className="adm-radio"><AdminRadio pass={PASS} /></div></div>}
      </main>

      <nav className="adm-baixo" aria-label="Seções do painel">
        {SECOES.map(s => (
          <a key={s.id} href={`#${s.id}`} className={`adm-baixo-item${secao === s.id ? ' on' : ''}`} aria-current={secao === s.id ? 'page' : undefined}
            onClick={e => { e.preventDefault(); ir(s.id) }}>
            <span className="adm-baixo-ico"><Ico n={s.icone} />{s.id === 'bandas' && novas > 0 && <span className="adm-badge">{novas}</span>}</span>
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

function Cabecalho({ titulo, sub, acoes }) {
  return (
    <div className="adm-cab">
      <div><h1>{titulo}</h1>{sub && <p>{sub}</p>}</div>
      {acoes && <div className="adm-cab-acoes">{acoes}</div>}
    </div>
  )
}

/* ─ Início ─ */

const hojeIso = (dias = 0) => new Date(Date.now() - 3 * 3600e3 + dias * 864e5).toISOString().slice(0, 10)
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const horaTxt = h => (h ? h.replace(':00', 'h').replace(':', 'h') : '20h')
const diaTxt = iso => { const d = new Date(`${iso}T12:00:00`); return `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}` }
function haQuanto(iso) {
  const min = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (min < 60) return min <= 1 ? 'agora' : `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.round(h / 24)
  return d === 1 ? 'ontem' : `há ${d} dias`
}
function saudacao() {
  const h = Number(new Date().toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }))
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

function Inicio({ ir }) {
  const [bandas, setBandas] = useState(null)
  const [shows, setShows] = useState(null)
  const [cards, setCards] = useState(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    fetch('/api/admin/bandas?status=nova&por=5', { headers: { 'x-admin-pass': PASS } })
      .then(r => (r.ok ? r.json() : null)).then(setBandas).catch(() => setBandas(null))
    fetch(`/api/bandas/agenda?de=${hojeIso()}&ate=${hojeIso(13)}`)
      .then(r => (r.ok ? r.json() : [])).then(setShows).catch(() => setShows([]))
    fetchHeroCards().then(setCards)
  }, [])

  async function copiarJohnny() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/produtor`) } catch { return }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <div className="adm-pagina">
      <Cabecalho titulo={`${saudacao()}!`} sub="O que está rolando no Porks." />

      <div className="adm-grade-inicio">
        <section className="adm-card">
          <div className="adm-card-cab">
            <h2><Ico n="agenda" />Próximos shows</h2>
            <button type="button" className="adm-link" onClick={() => ir('agenda')}>Ver agenda</button>
          </div>
          {shows === null ? <Esqueleto linhas={3} /> : shows.length ? (
            <ul className="adm-lista">
              {shows.map(s => (
                <li key={s.data + s.slug}>
                  {s.avatar ? <img src={s.avatar} alt="" className="adm-mini-foto" /> : <span className="adm-mini-foto adm-mini-vazia"><Ico n="microfone" /></span>}
                  <div><b>{s.banda}</b><small>{diaTxt(s.data)}, {horaTxt(s.hora)}{s.titulo ? ` · ${s.titulo}` : ''}</small></div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="adm-vazio-mini">
              <p>Nenhum show marcado pros próximos 14 dias.</p>
              <button type="button" className="adm-btn adm-btn-claro" onClick={() => ir('agenda')}>Organizar a agenda</button>
            </div>
          )}
        </section>

        <section className="adm-card">
          <div className="adm-card-cab">
            <h2><Ico n="bandas" />Bandas pra responder</h2>
            <button type="button" className="adm-link" onClick={() => ir('bandas')}>Ver todas</button>
          </div>
          {bandas === null ? <Esqueleto linhas={3} /> : bandas.itens.length ? (
            <>
              <p className="adm-numero"><b>{bandas.contagem.nova}</b> {bandas.contagem.nova === 1 ? 'banda nova esperando resposta' : 'bandas novas esperando resposta'}</p>
              <ul className="adm-lista">
                {bandas.itens.map(b => (
                  <li key={b.id}>
                    <span className="adm-mini-foto adm-mini-vazia"><Ico n="microfone" /></span>
                    <div><b>{b.banda}</b><small>Quer tocar {diaTxt(b.data).toLowerCase()} · {haQuanto(b.criado_em)}</small></div>
                    <a className="adm-icone-btn" href={`#bandas?id=${encodeURIComponent(b.id)}`} aria-label={`Abrir ficha da banda ${b.banda}`}
                      onClick={e => { e.preventDefault(); window.location.assign(`#bandas?id=${encodeURIComponent(b.id)}`) }}><Ico n="dir" /></a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="adm-vazio-mini"><Ico n="check" className="adm-ico adm-ok" /><p>Nenhuma banda esperando. Tudo respondido.</p></div>
          )}
          <div className="adm-card-pe">
            <span>Link pras bandas se inscreverem:</span>
            <button type="button" className="adm-btn adm-btn-claro" onClick={copiarJohnny}><Ico n={copiado ? 'check' : 'link'} />{copiado ? 'Link copiado' : 'Copiar link do Johnny'}</button>
          </div>
        </section>

        <section className="adm-card adm-card-largo">
          <div className="adm-card-cab">
            <h2><Ico n="site" />Cards da página inicial</h2>
            <button type="button" className="adm-link" onClick={() => ir('site')}>Editar</button>
          </div>
          {cards === null ? <Esqueleto linhas={2} /> : (
            <div className="adm-cards-mini">
              {cards.map(c => <CardPreview key={c.id} card={c} pequeno />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Esqueleto({ linhas = 3 }) {
  return <div className="adm-esq" aria-busy="true" aria-label="Carregando">{Array.from({ length: linhas }, (_, i) => <span key={i} />)}</div>
}

/* ─ Agenda: o Google Agenda do Porks é a fonte; shows marcados no perfil da banda completam ─ */

function ConexaoGoogle({ onMudou }) {
  const [st, setSt] = useState(null)
  const [url, setUrl] = useState('')
  const [ocupado, setOcupado] = useState('')
  const [erro, setErro] = useState('')
  const api = useCallback(async (metodo, path = '', body) => {
    const r = await fetch(`/api/admin/agenda${path}`, { method: metodo, headers: { 'Content-Type': 'application/json', 'x-admin-pass': PASS }, body: body ? JSON.stringify(body) : undefined })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || `Erro ${r.status}`)
    return j
  }, [])
  useEffect(() => { api('GET').then(setSt).catch(e => setErro(e.message)) }, [api])

  async function acao(nome, fn) {
    setOcupado(nome)
    setErro('')
    try { setSt(await fn()); onMudou() } catch (e) { setErro(e.message) }
    setOcupado('')
  }

  if (!st) return <section className="adm-card adm-google">{erro ? <p className="adm-aviso"><Ico n="alerta" />{erro}</p> : <Esqueleto linhas={2} />}</section>
  if (!st.ligada) {
    return (
      <section className="adm-card adm-google adm-google-off">
        <Ico n="agenda" className="adm-ico adm-ico-grande" />
        <form className="adm-google-form" onSubmit={e => { e.preventDefault(); acao('ligar', () => api('POST', '', { url })) }}>
          <h2>Ligar o Google Agenda do Porks</h2>
          <p>Os shows passam a entrar aqui sozinhos e alimentam a pesquisa de satisfação, o calendário do Johnny e o perfil das bandas. O cachê do título é descartado e não aparece em lugar nenhum.</p>
          <label className="adm-campo"><span>Endereço secreto no formato iCal</span>
            <input value={url} onChange={e => { setUrl(e.target.value); setErro('') }} inputMode="url" autoCapitalize="none" spellCheck={false}
              placeholder="https://calendar.google.com/calendar/ical/…/private-…/basic.ics" />
          </label>
          <details className="adm-ajuda">
            <summary>Onde acho esse endereço?</summary>
            <ol>
              <li>No Google Agenda do Porks, clique na engrenagem e em <b>Configurações</b>.</li>
              <li>À esquerda, em <b>Configurações das minhas agendas</b>, clique na agenda do Porks.</li>
              <li>Desça até <b>Integrar agenda</b> e copie o <b>Endereço secreto no formato iCal</b>.</li>
            </ol>
          </details>
          {erro && <p className="adm-aviso" role="alert"><Ico n="alerta" />{erro}</p>}
          <button type="submit" className="adm-btn" disabled={!url.trim() || !!ocupado}>{ocupado ? 'Lendo a agenda…' : 'Ligar agenda'}</button>
        </form>
      </section>
    )
  }
  return (
    <section className="adm-card adm-google adm-google-on">
      <span className="adm-google-selo"><Ico n="check" /></span>
      <div className="adm-google-txt">
        <h2>Google Agenda ligado</h2>
        <p>
          {st.proximos} {st.proximos === 1 ? 'show marcado' : 'shows marcados'} daqui pra frente · {st.eventos} no total
          {st.atualizada_em && <> · atualizado {haQuanto(st.atualizada_em)}</>}
        </p>
        {st.erro && <p className="adm-aviso"><Ico n="alerta" />A última leitura falhou: {st.erro}</p>}
        {erro && <p className="adm-aviso" role="alert"><Ico n="alerta" />{erro}</p>}
      </div>
      <div className="adm-google-acoes">
        <button type="button" className="adm-btn adm-btn-claro" disabled={!!ocupado} onClick={() => acao('atualizar', () => api('POST', '/atualizar'))}>
          {ocupado === 'atualizar' ? 'Atualizando…' : 'Atualizar agora'}
        </button>
        <button type="button" className="adm-link" disabled={!!ocupado}
          onClick={() => { if (window.confirm('Desligar o Google Agenda? Os shows do Google somem do painel, da pesquisa e do Johnny até ligar de novo.')) acao('desligar', () => api('DELETE')) }}>
          Desligar
        </button>
      </div>
    </section>
  )
}

function Agenda({ ir }) {
  const [shows, setShows] = useState(null)
  const [versao, setVersao] = useState(0)
  useEffect(() => {
    fetch(`/api/bandas/agenda?de=${hojeIso(-30)}&ate=${hojeIso(180)}&v=${versao}`, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : [])).then(setShows).catch(() => setShows([]))
  }, [versao])
  const hoje = hojeIso()
  const prox = (shows || []).filter(s => s.data >= hoje)
  const foram = (shows || []).filter(s => s.data < hoje).reverse()
  const linha = s => (
    <li key={s.data + s.banda} className={`adm-show${s.data === hoje ? ' hoje' : ''}`}>
      <span className="adm-show-data"><b>{new Date(`${s.data}T12:00:00`).getDate()}</b>{MESES[new Date(`${s.data}T12:00:00`).getMonth()]}</span>
      <div>
        <b>{s.banda}</b>
        <small>{diaTxt(s.data)}, {horaTxt(s.hora)}{s.titulo ? ` · ${s.titulo}` : ''}</small>
        {s.data === hoje && <span className="adm-hoje">Hoje</span>}
      </div>
      {s.link
        ? <a className="adm-icone-btn" href={s.link} target="_blank" rel="noopener noreferrer" aria-label={`Página da banda ${s.banda}`}><Ico n="externo" /></a>
        : <span className="adm-sem-perfil" title="Essa banda ainda não tem perfil no site (não se inscreveu pelo Johnny)">sem perfil</span>}
    </li>
  )
  return (
    <div className="adm-pagina">
      <Cabecalho titulo="Agenda" sub="Quem toca em cada noite do Porks." />
      <ConexaoGoogle onMudou={() => setVersao(v => v + 1)} />
      {shows === null ? <Esqueleto linhas={4} /> : (
        <div className="adm-colunas">
          <section className="adm-card">
            <h2 className="adm-h2">Próximos shows ({prox.length})</h2>
            {prox.length ? <ul className="adm-shows">{prox.map(linha)}</ul> : (
              <div className="adm-vazio-mini">
                <p>Nenhum show marcado. Marque no Google Agenda do Porks, ou abra a banda em <b>Bandas</b> e adicione a data em <b>Shows no Porks</b>.</p>
                <button type="button" className="adm-btn adm-btn-claro" onClick={() => ir('bandas')}>Ir pra Bandas</button>
              </div>
            )}
          </section>
          <section className="adm-card">
            <h2 className="adm-h2">Últimos 30 dias ({foram.length})</h2>
            {foram.length ? <ul className="adm-shows adm-shows-foram">{foram.map(linha)}</ul> : <p className="adm-dica">Nenhum show no último mês.</p>}
          </section>
        </div>
      )}
    </div>
  )
}

/* ─ Site: cards da página inicial + cervejarias ─ */

function CardPreview({ card, pequeno }) {
  return (
    <div className={`adm-cprev${pequeno ? ' pequeno' : ''}${card.tape ? ' fita' : ''}`}>
      {card.img ? <img src={card.img} alt="" /> : <div className="adm-cprev-vazio"><Ico n="foto" /><span>Sem imagem</span></div>}
      <div className="adm-cprev-txt">
        {card.tag && <span className="adm-cprev-tag">{card.tag}</span>}
        <b>{card.title || 'Título'}</b>
        {card.sub && <small>{card.sub}</small>}
      </div>
    </div>
  )
}

function BarraSalvar({ sujo, salvando, salvo, onSalvar, onDesfazer, rotulo }) {
  return (
    <div className={`adm-salvar${sujo ? ' sujo' : ''}`}>
      <span className="adm-salvar-txt" aria-live="polite">
        {salvo ? <><Ico n="check" className="adm-ico adm-ok" />Salvo. Já está no site.</> : sujo ? 'Alterações sem salvar' : 'Tudo salvo'}
      </span>
      {sujo && <button type="button" className="adm-btn adm-btn-claro" onClick={onDesfazer}>Desfazer</button>}
      <button type="button" className="adm-btn" disabled={!sujo || salvando} onClick={onSalvar}>{salvando ? 'Salvando…' : rotulo}</button>
    </div>
  )
}

function Site() {
  const [aba, setAba] = useState('cards')
  return (
    <div className="adm-pagina">
      <Cabecalho titulo="Site" sub="O que aparece em sobradinhoporks.com.br."
        acoes={<a className="adm-btn adm-btn-claro" href="/" target="_blank" rel="noopener noreferrer"><Ico n="externo" />Ver o site</a>} />
      <div className="adm-abas" role="tablist" aria-label="Partes do site">
        <button type="button" role="tab" aria-selected={aba === 'cards'} className={`adm-aba${aba === 'cards' ? ' on' : ''}`} onClick={() => setAba('cards')}>Cards da página inicial</button>
        <button type="button" role="tab" aria-selected={aba === 'cervejarias'} className={`adm-aba${aba === 'cervejarias' ? ' on' : ''}`} onClick={() => setAba('cervejarias')}>Cervejarias parceiras</button>
      </div>
      {aba === 'cards' ? <EditorCards /> : <EditorCervejarias />}
    </div>
  )
}

function useEditor(carregar, salvarFn) {
  const [salvoServ, setSalvoServ] = useState(null)
  const [itens, setItens] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')
  useEffect(() => { carregar().then(x => { setSalvoServ(x); setItens(x) }) }, [carregar])
  const sujo = !!itens && JSON.stringify(itens) !== JSON.stringify(salvoServ)
  async function salvar(limpar = x => x) {
    setSalvando(true); setErro('')
    try {
      const final = limpar(itens)
      await salvarFn(final, PASS)
      setSalvoServ(final); setItens(final); setSalvo(true)
      setTimeout(() => setSalvo(false), 3000)
    } catch { setErro('Não deu pra salvar. Confere a internet e tenta de novo.') }
    setSalvando(false)
  }
  return { itens, setItens, sujo, salvando, salvo, erro, salvar, desfazer: () => setItens(salvoServ) }
}

function EditorCards() {
  const carregar = useCallback(() => fetchHeroCards().then(c => (c?.length ? c : DEFAULT_CARDS)), [])
  const ed = useEditor(carregar, saveHeroCards)
  const [subindo, setSubindo] = useState({})
  const muda = (id, campo, v) => ed.setItens(cs => cs.map(c => (c.id === id ? { ...c, [campo]: v } : c)))
  async function subir(id, file) {
    if (!file) return
    setSubindo(u => ({ ...u, [id]: true }))
    try { muda(id, 'img', await resizeToBase64(file)) } catch { /* imagem inválida */ }
    setSubindo(u => ({ ...u, [id]: false }))
  }
  if (!ed.itens) return <Esqueleto linhas={4} />
  return (
    <>
      <p className="adm-dica">São os 3 cards grandes do topo do site no celular. Use pra anunciar quem toca na sexta e no sábado.</p>
      {ed.erro && <p className="adm-aviso" role="alert"><Ico n="alerta" />{ed.erro}</p>}
      <div className="adm-cards-editor">
        {ed.itens.map((c, i) => (
          <section key={c.id} className="adm-card adm-card-editor">
            <h2 className="adm-h2">Card {i + 1}</h2>
            <CardPreview card={c} />
            <div className="adm-img-acoes">
              <label className="adm-btn adm-btn-claro">
                <input type="file" accept="image/*" className="adm-sr" onChange={e => { subir(c.id, e.target.files[0]); e.target.value = '' }} />
                <Ico n="foto" />{subindo[c.id] ? 'Processando…' : c.img ? 'Trocar imagem' : 'Subir imagem'}
              </label>
              {c.img && <button type="button" className="adm-icone-btn" onClick={() => muda(c.id, 'img', '')} aria-label="Remover imagem"><Ico n="lixo" /></button>}
            </div>
            <label className="adm-campo"><span>Etiqueta de cima</span>
              <input value={c.tag} onChange={e => muda(c.id, 'tag', e.target.value)} placeholder="Ex.: nome da banda" />
            </label>
            <label className="adm-campo"><span>Título</span>
              <input value={c.title} onChange={e => muda(c.id, 'title', e.target.value)} placeholder="Ex.: SEXTA-FEIRA" />
            </label>
            <label className="adm-campo"><span>Linha de baixo</span>
              <input value={c.sub} onChange={e => muda(c.id, 'sub', e.target.value)} placeholder="Ex.: Rock nacional · sem couvert" />
            </label>
            <label className="adm-campo"><span>Ou cole o link de uma imagem</span>
              <input type="url" inputMode="url" value={c.img && !c.img.startsWith('data:') ? c.img : ''} onChange={e => muda(c.id, 'img', e.target.value)} placeholder="https://…" />
            </label>
            <label className="adm-check">
              <input type="checkbox" checked={!!c.tape} onChange={e => muda(c.id, 'tape', e.target.checked)} />
              <span>Fita adesiva no card</span>
            </label>
          </section>
        ))}
      </div>
      <BarraSalvar sujo={ed.sujo} salvando={ed.salvando} salvo={ed.salvo} onSalvar={() => ed.salvar()} onDesfazer={ed.desfazer} rotulo="Salvar cards" />
    </>
  )
}

function EditorCervejarias() {
  const carregar = useCallback(() => fetchBreweries().then(b => (b?.length ? b : DEFAULT_BREWERIES)), [])
  const ed = useEditor(carregar, saveBreweries)
  const [subindo, setSubindo] = useState({})
  const muda = (id, campo, v) => ed.setItens(bs => bs.map(b => (b.id === id ? { ...b, [campo]: v } : b)))
  async function subir(id, file) {
    if (!file) return
    setSubindo(u => ({ ...u, [id]: true }))
    try { muda(id, 'logo', await resizeToBase64(file)) } catch { /* imagem inválida */ }
    setSubindo(u => ({ ...u, [id]: false }))
  }
  if (!ed.itens) return <Esqueleto linhas={4} />
  return (
    <>
      <p className="adm-dica">Aparecem no carrossel de cervejarias do site. Cervejaria sem nome não é salva.</p>
      {ed.erro && <p className="adm-aviso" role="alert"><Ico n="alerta" />{ed.erro}</p>}
      <ul className="adm-brews">
        {ed.itens.map(b => (
          <li key={b.id} className="adm-card adm-brew">
            <div className="adm-brew-logo">{b.logo ? <img src={b.logo} alt="" /> : <Ico n="copo" />}</div>
            <div className="adm-brew-campos">
              <label className="adm-campo"><span>Nome</span>
                <input value={b.name || ''} onChange={e => muda(b.id, 'name', e.target.value)} placeholder="Nome da cervejaria" />
              </label>
              <label className="adm-campo"><span>Link do logo</span>
                <input type="url" inputMode="url" value={b.logo && !b.logo.startsWith('data:') ? b.logo : ''} onChange={e => muda(b.id, 'logo', e.target.value)} placeholder="https://… ou suba uma imagem" />
              </label>
            </div>
            <div className="adm-brew-acoes">
              <label className="adm-btn adm-btn-claro">
                <input type="file" accept="image/*" className="adm-sr" onChange={e => { subir(b.id, e.target.files[0]); e.target.value = '' }} />
                <Ico n="foto" />{subindo[b.id] ? '…' : 'Logo'}
              </label>
              <button type="button" className="adm-icone-btn adm-perigo" aria-label={`Remover ${b.name || 'cervejaria'}`}
                onClick={() => { if (window.confirm(`Remover ${b.name || 'esta cervejaria'}?`)) ed.setItens(bs => bs.filter(x => x.id !== b.id)) }}><Ico n="lixo" /></button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="adm-btn adm-btn-claro adm-add" onClick={() => ed.setItens(bs => [...bs, { id: Date.now(), name: '', logo: '' }])}><Ico n="mais" />Adicionar cervejaria</button>
      <BarraSalvar sujo={ed.sujo} salvando={ed.salvando} salvo={ed.salvo} onDesfazer={ed.desfazer} rotulo="Salvar cervejarias"
        onSalvar={() => ed.salvar(bs => bs.filter(b => b.name && b.name.trim()))} />
    </>
  )
}
