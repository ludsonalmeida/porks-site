import { useState, useEffect, useCallback, useRef } from 'react'
import './admin-bandas.css'
import { PerfilCabeca, PerfilAbas } from '../bandas/BandaPerfil.jsx'
import { ESTILOS, MAX_ESTILOS } from '../bandas/estilos.js'

const STATUS = [
  { id: 'nova', label: 'Nova' },
  { id: 'conversa', label: 'Em conversa' },
  { id: 'aprovada', label: 'Aprovada' },
  { id: 'recusada', label: 'Recusada' },
]
const ST = Object.fromEntries(STATUS.map(s => [s.id, s]))
const POR_PAGINA = 20
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/* ─ ícones de traço (mesma linguagem do Johnny) ─ */
const ICONES = {
  busca: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  zap: <><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a3.5 3.5 0 0 1-2-2l1-1-1-2z" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></>,
  foto: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></>,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  esq: <path d="m15 5-7 7 7 7" />,
  dir: <path d="m9 5 7 7-7 7" />,
  pessoas: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1" /><path d="M16 5a3 3 0 0 1 0 6M21 20v-1a5 5 0 0 0-3-4.6" /></>,
  calendario: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  baixar: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></>,
  externo: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  alerta: <><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17h.01" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></>,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 5 2.5-5 2.5z" /></>,
  spotify: <><circle cx="12" cy="12" r="9.5" /><path d="M7 9.5c3.5-1 7.5-.6 10 1M7.5 12.5c3-.8 6-.4 8.5 1M8 15.5c2.5-.6 4.5-.3 6.5.8" /></>,
  guitarra: <><path d="m14 10 6-6M18 2l4 4" /><path d="M10.5 9.5a4 4 0 0 0-5.6.4c-1.3 1.4-.9 3-2.4 4.6 2 2 5.6 5 7.5 3.1 1.5-1.5 1.4-2.8 3-4a4 4 0 0 0-.1-5.6z" /><circle cx="9" cy="14" r="1.2" /></>,
}
function Ico({ n, className = 'ab-ico' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONES[n]}
    </svg>
  )
}

/* ─ helpers ─ */
const diaShow = iso => {
  const d = new Date(`${iso}T12:00:00`)
  return `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : ''}`
}
function haQuanto(iso) {
  const min = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (min < 60) return min <= 1 ? 'agora' : `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.round(h / 24)
  if (d < 31) return d === 1 ? 'ontem' : `há ${d} dias`
  return new Date(iso).toLocaleDateString('pt-BR')
}
const dataHora = iso => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const fone = n => n.replace(/(\d{2})(\d)(\d{4})(\d{4})/, '($1) $2 $3-$4')
const tamanho = b => (b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1).replace('.', ',')} MB`)
const showPassou = iso => iso < new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10)
const quintaCurta = iso => iso.split('-').reverse().slice(0, 2).join('/')
const TIPOS_INSC = [{ id: '', label: 'Todas' }, { id: 'agenda', label: 'Agenda (sex e sáb)' }, { id: 'pp', label: 'Plug & Play (quintas)' }]
function linkZap(b) {
  const nome = b.responsavel.split(' ')[0]
  const txt = b.tipo === 'pp'
    ? `Fala, ${nome}! Aqui é do Porks Sobradinho, sobre sua inscrição no Plug & Play das quintas (${b.quintas.map(quintaCurta).join(', ')}).`
    : `Fala, ${nome}! Aqui é do Porks Sobradinho, sobre a inscrição da banda ${b.banda} pro dia ${diaShow(b.data).toLowerCase()}.`
  return `https://wa.me/55${b.whatsapp}?text=${encodeURIComponent(txt)}`
}

// 1 … 4 5 [6] 7 8 … 20
function numerosPaginas(atual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const meio = [atual - 1, atual, atual + 1].filter(n => n > 1 && n < total)
  const out = [1]
  if (meio[0] > 2) out.push('…')
  out.push(...meio)
  if (meio[meio.length - 1] < total - 1) out.push('…')
  out.push(total)
  return out
}

/* ─ estado na URL: #bandas?p=2&q=rock&s=nova&o=show&id=... ─ */
function lerHash() {
  const [aba, qs = ''] = window.location.hash.slice(1).split('?')
  const p = new URLSearchParams(qs)
  return {
    aba,
    pagina: Math.max(1, parseInt(p.get('p'), 10) || 1),
    q: p.get('q') || '',
    status: ST[p.get('s')] ? p.get('s') : '',
    ordem: p.get('o') === 'show' ? 'show' : 'recentes',
    tipo: ['agenda', 'pp'].includes(p.get('t')) ? p.get('t') : '',
    id: p.get('id') || '',
  }
}
function hashDe(f) {
  const p = new URLSearchParams()
  if (f.pagina > 1) p.set('p', f.pagina)
  if (f.q) p.set('q', f.q)
  if (f.status) p.set('s', f.status)
  if (f.ordem !== 'recentes') p.set('o', f.ordem)
  if (f.tipo) p.set('t', f.tipo)
  if (f.id) p.set('id', f.id)
  const s = p.toString()
  return `#bandas${s ? `?${s}` : ''}`
}

function useApi(pass) {
  return useCallback(async (path, opts = {}) => {
    const r = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', 'x-admin-pass': pass, ...opts.headers } })
    if (!r.ok) throw new Error(r.status === 401 ? 'Senha do painel não confere com a do servidor.' : (await r.json().catch(() => ({}))).error || `Erro ${r.status}`)
    return r.json()
  }, [pass])
}

function Status({ s }) {
  return <span className={`ab-status ab-st-${s}`}><span className="ab-status-dot" aria-hidden="true" />{ST[s]?.label || s}</span>
}

/* ─ Lista ─ */

export default function AdminBandas({ pass }) {
  const api = useApi(pass)
  const [f, setF] = useState(() => { const { aba: _a, ...resto } = lerHash(); return resto })
  const [busca, setBusca] = useState(f.q)
  const [dados, setDados] = useState(null)
  const [falha, setFalha] = useState(null) // { chave, msg }
  const [versao, setVersao] = useState(0)
  const topoRef = useRef(null)
  const empilhouRef = useRef(false) // ficha aberta por clique: fechar = voltar do navegador

  // muda filtros e grava na URL; abrir ficha empilha no histórico (o voltar fecha)
  const mudar = useCallback((patch, { empilhar = false } = {}) => {
    setF(atual => {
      const novo = { ...atual, ...patch }
      const h = hashDe(novo)
      if (empilhar) window.history.pushState(null, '', h)
      else window.history.replaceState(null, '', h)
      return novo
    })
  }, [])

  useEffect(() => {
    const onPop = () => { empilhouRef.current = false; const h = lerHash(); if (h.aba === 'bandas') { const { aba: _a, ...resto } = h; setF(resto); setBusca(resto.q) } }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // busca com espera de 350 ms
  useEffect(() => {
    if (busca === f.q) return
    const t = setTimeout(() => mudar({ q: busca.trim(), pagina: 1 }), 350)
    return () => clearTimeout(t)
  }, [busca, f.q, mudar])

  // cada consulta tem uma chave; carregando = a resposta na tela ainda é de outra chave
  const params = new URLSearchParams({ pagina: f.pagina, por: POR_PAGINA, ordem: f.ordem })
  if (f.q) params.set('q', f.q)
  if (f.status) params.set('status', f.status)
  if (f.tipo) params.set('tipo', f.tipo)
  const chave = `${params}#${versao}`
  const erro = falha?.chave === chave ? falha.msg : ''
  const carregando = !erro && dados?.chave !== chave

  useEffect(() => {
    let vivo = true
    const qs = chave.split('#')[0]
    api(`/api/admin/bandas?${qs}`)
      .then(d => { if (vivo) setDados({ ...d, chave }) })
      .catch(e => { if (vivo) setFalha({ chave, msg: e.message }) })
    return () => { vivo = false }
  }, [api, chave])

  function irPagina(n) {
    mudar({ pagina: n })
    topoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const c = dados?.contagem
  const inicio = dados ? (dados.pagina - 1) * dados.por + 1 : 0
  const fim = dados ? Math.min(dados.total, dados.pagina * dados.por) : 0

  return (
    <div className="ab" ref={topoRef}>
      <div className="ab-cab">
        <div>
          <h2 className="ab-titulo">Bandas</h2>
          <p className="ab-sub">Inscrições feitas com o Johnny em <a href="/produtor" target="_blank" rel="noopener noreferrer">sobradinhoporks.com.br/produtor</a></p>
        </div>
      </div>

      <div className="ab-barra">
        <label className="ab-busca">
          <Ico n="busca" />
          <span className="ab-sr">Buscar banda</span>
          <input
            type="search" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar banda, responsável ou WhatsApp" autoComplete="off"
          />
        </label>
        <label className="ab-ordem">
          <span>Ordenar</span>
          <select value={f.ordem} onChange={e => mudar({ ordem: e.target.value, pagina: 1 })}>
            <option value="recentes">Inscrição mais recente</option>
            <option value="show">Próximos shows</option>
          </select>
        </label>
      </div>

      <div className="ab-tipos" role="group" aria-label="Tipo de inscrição">
        {TIPOS_INSC.map(t => (
          <button key={t.id || 'todas'} type="button" aria-pressed={f.tipo === t.id} className={`ab-tipo${f.tipo === t.id ? ' on' : ''}`}
            onClick={() => mudar({ tipo: t.id, pagina: 1 })}>
            {t.label}{t.id && c?.tipos && <span className="ab-chip-n">{c.tipos[t.id]}</span>}
          </button>
        ))}
      </div>

      <div className="ab-filtros" role="group" aria-label="Filtrar por status">
        {[{ id: '', label: 'Todas' }, ...STATUS].map(s => {
          const on = f.status === s.id
          const n = c ? c[s.id || 'todas'] : null
          return (
            <button key={s.id || 'todas'} type="button" aria-pressed={on} className={`ab-chip${on ? ' on' : ''}`}
              onClick={() => mudar({ status: s.id, pagina: 1 })}>
              {s.id && <span className={`ab-status-dot ab-st-${s.id}`} aria-hidden="true" />}
              {s.label}
              {n !== null && <span className="ab-chip-n">{n}</span>}
            </button>
          )
        })}
      </div>

      {erro ? (
        <div className="ab-vazio" role="alert">
          <Ico n="alerta" className="ab-vazio-ico" />
          <b>Não deu pra carregar as bandas</b>
          <span>{erro}</span>
          <button type="button" className="ab-btn" onClick={() => setVersao(v => v + 1)}>Tentar de novo</button>
        </div>
      ) : !dados && carregando ? (
        <Esqueleto />
      ) : dados.total === 0 ? (
        <div className="ab-vazio">
          <Ico n="guitarra" className="ab-vazio-ico" />
          {f.q || f.status
            ? <><b>Nenhuma banda com esse filtro</b><span>Tenta outra busca ou volta pra "Todas".</span>
                <button type="button" className="ab-btn" onClick={() => { setBusca(''); mudar({ q: '', status: '', pagina: 1 }) }}>Limpar filtros</button></>
            : <><b>Nenhuma banda inscrita ainda</b><span>Quando uma banda falar com o Johnny, a ficha aparece aqui.</span></>}
        </div>
      ) : (
        <>
          <div className={`ab-lista${carregando ? ' ab-carregando' : ''}`} aria-busy={carregando}>
            <div className="ab-linha ab-linha-cab" aria-hidden="true">
              <span>Banda</span><span>Show pedido</span><span>Responsável</span><span>Material</span><span>Status</span><span>Inscrição</span>
            </div>
            {dados.itens.map(b => (
              <button key={b.id} type="button" className="ab-linha" onClick={() => { empilhouRef.current = true; mudar({ id: b.id }, { empilhar: true }) }}
                aria-label={`Abrir ficha da banda ${b.banda}`}>
                <span className="ab-c-banda">
                  <b>{b.banda}{b.tipo === 'pp' && <span className="ab-pp">Plug & Play</span>}</b>
                  <small><Ico n="pessoas" className="ab-ico-sm" />{b.integrantes} {b.tipo === 'pp' ? (b.integrantes === 1 ? 'músico' : 'músicos') : (b.integrantes === 1 ? 'integrante' : 'integrantes')}{!b.concluido && <em className="ab-incompleto"> · envio incompleto</em>}</small>
                </span>
                {b.tipo === 'pp'
                  ? <span className="ab-c-data"><Ico n="calendario" className="ab-ico-sm" />Quintas {b.quintas.map(quintaCurta).join(', ')}</span>
                  : <span className={`ab-c-data${showPassou(b.data) ? ' passou' : ''}`}><Ico n="calendario" className="ab-ico-sm" />{diaShow(b.data)}</span>}
                <span className="ab-c-resp">{b.responsavel}<small>{fone(b.whatsapp)}</small></span>
                <span className="ab-c-mat">
                  <span title="Vídeos"><Ico n="video" className="ab-ico-sm" />{b.videos}</span>
                  <span title="Fotos"><Ico n="foto" className="ab-ico-sm" />{b.fotos}</span>
                </span>
                <span className="ab-c-st"><Status s={b.status} /></span>
                <span className="ab-c-quando">{haQuanto(b.criado_em)}</span>
              </button>
            ))}
          </div>

          <nav className="ab-pag" aria-label="Paginação">
            <span className="ab-pag-info" aria-live="polite">Mostrando <b>{inicio}–{fim}</b> de <b>{dados.total}</b></span>
            {dados.paginas > 1 && (
              <div className="ab-pag-btns">
                <button type="button" className="ab-pag-seta" aria-label="Página anterior" disabled={dados.pagina === 1} onClick={() => irPagina(dados.pagina - 1)}>
                  <Ico n="esq" /><span>Anterior</span>
                </button>
                <div className="ab-pag-nums">
                  {numerosPaginas(dados.pagina, dados.paginas).map((n, i) => n === '…'
                    ? <span key={`r${i}`} className="ab-pag-reti" aria-hidden="true">…</span>
                    : <button key={n} type="button" className={`ab-pag-num${n === dados.pagina ? ' on' : ''}`}
                        aria-current={n === dados.pagina ? 'page' : undefined} aria-label={`Página ${n}`} onClick={() => irPagina(n)}>{n}</button>)}
                </div>
                <button type="button" className="ab-pag-seta" aria-label="Próxima página" disabled={dados.pagina === dados.paginas} onClick={() => irPagina(dados.pagina + 1)}>
                  <span>Próxima</span><Ico n="dir" />
                </button>
              </div>
            )}
          </nav>
        </>
      )}

      {f.id && (
        <Ficha key={f.id} id={f.id} api={api} pass={pass}
          onFechar={() => { if (empilhouRef.current) { empilhouRef.current = false; window.history.back() } else mudar({ id: '' }) }}
          onMudou={() => setVersao(v => v + 1)} />
      )}
    </div>
  )
}

function Esqueleto() {
  return (
    <div className="ab-lista" aria-busy="true" aria-label="Carregando bandas">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="ab-linha ab-esq">
          <span className="ab-esq-b" style={{ width: '70%' }} />
          <span className="ab-esq-b" style={{ width: '55%' }} />
          <span className="ab-esq-b" style={{ width: '60%' }} />
          <span className="ab-esq-b" style={{ width: '40%' }} />
          <span className="ab-esq-b" style={{ width: '50%' }} />
          <span className="ab-esq-b" style={{ width: '35%' }} />
        </div>
      ))}
    </div>
  )
}

/* ─ Ficha = perfil da banda (painel largo no computador, tela cheia no celular) ─ */

const ABAS_FICHA = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'midia', label: 'Fotos e vídeos' },
  { id: 'gestao', label: 'Negociação' },
  { id: 'previa', label: 'Como o público vê' },
]
const rascunhoDe = b => ({ banda: b.banda, ...b.perfil, estilos: [...b.perfil.estilos], shows: b.perfil.shows.map(s => ({ ...s })) })

function Ficha({ id, api, pass, onFechar, onMudou }) {
  const [b, setB] = useState(null)
  const [erro, setErro] = useState('')
  const [aba, setAba] = useState(null) // definida quando a ficha chega (Plug & Play abre na negociação)
  const [abaPrevia, setAbaPrevia] = useState('geral')
  const [nota, setNota] = useState('')
  const [rasc, setRasc] = useState(null)
  const [salvando, setSalvando] = useState('')
  const [salvo, setSalvo] = useState('')
  const [enviando, setEnviando] = useState(null) // { feito, total }
  const [copiado, setCopiado] = useState(false)
  const fecharRef = useRef(null)

  const carregar = useCallback(() => api(`/api/admin/bandas/${id}`)
    .then(d => { setB(d); setNota(d.nota); setRasc(r => r || rascunhoDe(d)); setAba(a => a || (d.tipo === 'pp' ? 'gestao' : 'perfil')) })
    .catch(e => setErro(e.message === 'Erro 404' ? 'Essa ficha não existe mais.' : e.message)), [api, id])

  useEffect(() => { carregar() }, [carregar])

  const sujo = !!(b && rasc && JSON.stringify(rascunhoDe(b)) !== JSON.stringify(rasc))
  // fechar com perfil sem salvar pede confirmação
  const fechar = useCallback(() => {
    if (sujo && !window.confirm('Tem alteração no perfil sem salvar. Sair mesmo assim?')) return
    onFechar()
  }, [sujo, onFechar])

  useEffect(() => {
    fecharRef.current?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow }
  }, [])
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape' && !document.querySelector('.bp-lightbox')) fechar() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fechar])

  async function salvar(patch, qual) {
    setSalvando(qual)
    setSalvo('')
    setErro('')
    try {
      const r = await api(`/api/admin/bandas/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      setB(x => ({ ...x, ...r }))
      setSalvo(qual)
      setTimeout(() => setSalvo(s => (s === qual ? '' : s)), 2500)
      onMudou()
      return r
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando('')
    }
  }

  async function salvarPerfil() {
    const { banda, ...perfil } = rasc
    const r = await salvar({ banda, perfil }, 'perfil')
    if (r) setRasc(rascunhoDe({ banda: r.banda, perfil: r.perfil }))
  }

  // capa e foto do perfil salvam na hora, em cima do perfil já salvo
  async function escolherFoto(campo, nome) {
    const r = await salvar({ perfil: { ...b.perfil, [campo]: b.perfil[campo] === nome ? '' : nome } }, campo)
    if (r) setRasc(x => ({ ...x, [campo]: r.perfil[campo] }))
  }

  async function subirFotos(files) {
    const lista = [...files].filter(f => f.type.startsWith('image/'))
    if (!lista.length) return
    setEnviando({ feito: 0, total: lista.length })
    for (const [i, file] of lista.entries()) {
      try {
        const r = await fetch(`/api/admin/bandas/${id}/arquivos?tipo=foto&nome=${encodeURIComponent(file.name)}`, {
          method: 'PUT', headers: { 'x-admin-pass': pass, 'Content-Type': file.type }, body: file,
        })
        if (!r.ok) setErro(`${file.name}: ${(await r.json().catch(() => ({}))).error || `erro ${r.status}`}`)
      } catch { setErro(`${file.name}: falha de conexão`) }
      setEnviando({ feito: i + 1, total: lista.length })
    }
    setEnviando(null)
    await carregar()
    onMudou()
  }

  async function copiarLink() {
    const url = `${window.location.origin}/bandas/${b.slug}`
    try { await navigator.clipboard.writeText(url) } catch { window.prompt('Copie o link da banda:', url); return }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const muda = (campo, v) => setRasc(r => ({ ...r, [campo]: v }))
  const videos = b?.arquivos.filter(a => a.tipo === 'video') || []
  const fotos = b?.arquivos.filter(a => a.tipo === 'foto' && a.url) || []

  return (
    <div className="ab-modal" onMouseDown={e => { if (e.target === e.currentTarget) fechar() }}>
      <aside className="ab-painel ab-painel-largo" role="dialog" aria-modal="true" aria-labelledby="ab-ficha-titulo">
        <header className="ab-painel-cab">
          <button ref={fecharRef} type="button" className="ab-fechar" onClick={fechar} aria-label="Fechar ficha"><Ico n="fechar" /></button>
          <div className="ab-painel-tit">
            <h3 id="ab-ficha-titulo">{b?.banda || 'Ficha da banda'}</h3>
            {b && <span>Inscrita em {dataHora(b.criado_em)}</span>}
          </div>
          {b && b.tipo !== 'pp' && (
            <div className="ab-cab-acoes">
              <button type="button" className="ab-cab-btn" onClick={copiarLink}><Ico n={copiado ? 'check' : 'link'} className="ab-ico-sm" />{copiado ? 'Copiado' : 'Copiar link'}</button>
              <a className="ab-cab-btn" href={`/bandas/${b.slug}`} target="_blank" rel="noopener noreferrer"><Ico n="externo" className="ab-ico-sm" /><span>Página pública</span></a>
            </div>
          )}
        </header>

        <div className="ab-painel-corpo">
          {erro && <div className="ab-aviso" role="alert"><Ico n="alerta" className="ab-ico-sm" />{erro}</div>}
          {!b && !erro && <div className="ab-painel-esq"><span className="ab-esq-b" /><span className="ab-esq-b" /><span className="ab-esq-b" /></div>}

          {b && (
            <>
              {b.tipo === 'pp'
                ? <div className="ab-pp-topo"><span className="ab-pp">Plug & Play</span><span>Inscrição de músico pras quintas, das 19h às 23h50. Sem cachê, R$ 50 de bônus no dia.</span></div>
                : <div className="bp-perfil ab-previa-cabeca"><PerfilCabeca b={b.publico} onIrAba={id => { setAba('previa'); setAbaPrevia(id) }} /></div>}

              <div className="ab-fabas" role="tablist" aria-label="Seções da ficha">
                {ABAS_FICHA.filter(a => b.tipo !== 'pp' || a.id === 'gestao' || a.id === 'midia').map(a => (
                  <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} className={`ab-faba${aba === a.id ? ' on' : ''}`} onClick={() => setAba(a.id)}>
                    {a.label}{a.id === 'perfil' && sujo && <span className="ab-faba-ponto" aria-label="sem salvar" />}
                  </button>
                ))}
              </div>

              {aba === 'perfil' && rasc && b.tipo !== 'pp' && (
                <form className="ab-form" onSubmit={e => { e.preventDefault(); salvarPerfil() }}>
                  <p className="ab-dica">Tudo que você preencher aqui aparece na página pública da banda. Contato, status e observação nunca aparecem.</p>
                  <div className="ab-campos2">
                    <label className="ab-campo"><span>Nome da banda</span>
                      <input value={rasc.banda} maxLength={120} onChange={e => muda('banda', e.target.value)} required />
                    </label>
                    <label className="ab-campo"><span>De onde é</span>
                      <input value={rasc.cidade} maxLength={80} onChange={e => muda('cidade', e.target.value)} placeholder="Ex.: Sobradinho, DF" />
                    </label>
                  </div>

                  <fieldset className="ab-campo">
                    <legend>Estilo musical <small>(até 8)</small></legend>
                    <div className="ab-estilos">
                      {[...new Set([...ESTILOS, ...rasc.estilos])].map(e => {
                        const on = rasc.estilos.includes(e)
                        return (
                          <button key={e} type="button" aria-pressed={on} className={`ab-chip${on ? ' on' : ''}`} disabled={!on && rasc.estilos.length >= MAX_ESTILOS}
                            onClick={() => muda('estilos', on ? rasc.estilos.filter(x => x !== e) : [...rasc.estilos, e])}>
                            {on && <Ico n="check" className="ab-ico-sm" />}{e}
                          </button>
                        )
                      })}
                      <input className="ab-estilo-novo" placeholder="Outro estilo + Enter" maxLength={30}
                        onKeyDown={e => {
                          const v = e.currentTarget.value.trim()
                          if (e.key === 'Enter') { e.preventDefault(); if (v && rasc.estilos.length < MAX_ESTILOS && !rasc.estilos.includes(v)) muda('estilos', [...rasc.estilos, v]); e.currentTarget.value = '' }
                        }} />
                    </div>
                  </fieldset>

                  <label className="ab-campo"><span>Sobre a banda</span>
                    <textarea rows={5} value={rasc.sobre} maxLength={1500} onChange={e => muda('sobre', e.target.value)}
                      placeholder="Conta a história da banda: como começou, o que toca, o que faz o show ser bom…" />
                    <small className="ab-contador">{rasc.sobre.length}/1500</small>
                  </label>

                  <div className="ab-campos3">
                    <label className="ab-campo"><span><Ico n="instagram" className="ab-ico-sm" />Instagram</span>
                      <input value={rasc.instagram} onChange={e => muda('instagram', e.target.value)} placeholder="@nomedabanda" autoCapitalize="none" />
                    </label>
                    <label className="ab-campo"><span><Ico n="youtube" className="ab-ico-sm" />YouTube</span>
                      <input value={rasc.youtube} onChange={e => muda('youtube', e.target.value)} placeholder="youtube.com/@banda" inputMode="url" autoCapitalize="none" />
                    </label>
                    <label className="ab-campo"><span><Ico n="spotify" className="ab-ico-sm" />Spotify</span>
                      <input value={rasc.spotify} onChange={e => muda('spotify', e.target.value)} placeholder="open.spotify.com/artist/…" inputMode="url" autoCapitalize="none" />
                    </label>
                  </div>

                  <fieldset className="ab-campo">
                    <legend>Shows no Porks</legend>
                    {rasc.shows.length === 0 && <p className="ab-dica">Nenhum show ainda. Quando a banda tocar (ou tiver data marcada), adiciona aqui.</p>}
                    <ul className="ab-shows">
                      {rasc.shows.map((s, i) => (
                        <li key={i}>
                          <input type="date" aria-label="Data do show" value={s.data} onChange={e => muda('shows', rasc.shows.map((x, j) => (j === i ? { ...x, data: e.target.value } : x)))} />
                          <input aria-label="Nome do evento" placeholder="Nome do evento (opcional)" maxLength={80} value={s.titulo}
                            onChange={e => muda('shows', rasc.shows.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x)))} />
                          <button type="button" className="ab-icone-btn" aria-label="Remover show" onClick={() => muda('shows', rasc.shows.filter((_, j) => j !== i))}><Ico n="fechar" className="ab-ico-sm" /></button>
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="ab-btn ab-btn-claro" onClick={() => muda('shows', [...rasc.shows, { data: b.data, titulo: '' }])}>+ Adicionar show</button>
                  </fieldset>

                  <div className="ab-salvar-barra">
                    <span className="ab-dica" aria-live="polite">
                      {salvo === 'perfil' ? <><Ico n="check" className="ab-ico-sm" />Perfil salvo e publicado</> : sujo ? 'Alterações sem salvar' : 'Tudo salvo'}
                    </span>
                    {sujo && <button type="button" className="ab-btn ab-btn-claro" onClick={() => setRasc(rascunhoDe(b))}>Desfazer</button>}
                    <button type="submit" className="ab-btn" disabled={!sujo || !!salvando}>{salvando === 'perfil' ? 'Salvando…' : 'Salvar perfil'}</button>
                  </div>
                </form>
              )}

              {aba === 'midia' && (
                <div className="ab-form">
                  <section className="ab-sec">
                    <h4><Ico n="foto" className="ab-ico-sm" />Fotos ({fotos.length})</h4>
                    <p className="ab-dica">Escolha a <b>capa</b> (foto larga do topo) e a <b>foto do perfil</b> (a redonda). Sem escolha, entra a primeira foto.</p>
                    <div className="ab-fotos-perfil">
                      {fotos.map(a => {
                        const capa = b.perfil.capa === a.nome
                        const avatar = b.perfil.avatar === a.nome
                        return (
                          <figure key={a.nome} className={`ab-fp${capa || avatar ? ' marcada' : ''}`}>
                            <img src={a.url} alt="" loading="lazy" />
                            <div className="ab-fp-marcas">{capa && <span>Capa</span>}{avatar && <span>Perfil</span>}</div>
                            <figcaption>
                              <button type="button" aria-pressed={capa} disabled={!!salvando} onClick={() => escolherFoto('capa', a.nome)}>{capa ? <><Ico n="check" className="ab-ico-sm" />Capa</> : 'Usar de capa'}</button>
                              <button type="button" aria-pressed={avatar} disabled={!!salvando} onClick={() => escolherFoto('avatar', a.nome)}>{avatar ? <><Ico n="check" className="ab-ico-sm" />Perfil</> : 'Usar no perfil'}</button>
                            </figcaption>
                          </figure>
                        )
                      })}
                      <label className={`ab-fp-add${enviando ? ' ocupado' : ''}`}>
                        <input type="file" accept="image/*" multiple disabled={!!enviando} onChange={e => { subirFotos(e.target.files); e.target.value = '' }} />
                        <Ico n="foto" />
                        <b>{enviando ? `Enviando ${enviando.feito}/${enviando.total}…` : 'Adicionar fotos'}</b>
                        <small>JPG ou PNG, até 15 MB</small>
                      </label>
                    </div>
                  </section>

                  <section className="ab-sec">
                    <h4><Ico n="video" className="ab-ico-sm" />Vídeos ({videos.filter(a => a.url).length})</h4>
                    {videos.length ? (
                      <div className="ab-midias">
                        {videos.map(a => a.url ? (
                          <figure key={a.url} className="ab-midia">
                            <video src={a.url} controls preload="metadata" playsInline />
                            <figcaption><span>{a.original} · {tamanho(a.bytes)}</span><a href={a.url} download={a.original} aria-label={`Baixar ${a.original}`}><Ico n="baixar" className="ab-ico-sm" /></a></figcaption>
                          </figure>
                        ) : (
                          <div key={a.original + a.em} className="ab-apagado">{a.original}: apagado depois de 60 dias</div>
                        ))}
                      </div>
                    ) : <p className="ab-dica">A banda não mandou vídeo.</p>}
                    <p className="ab-dica">Vídeo de banda <b>Aprovada</b> fica guardado. Das outras, some depois de 60 dias.</p>
                  </section>
                </div>
              )}

              {aba === 'gestao' && (
                <div className="ab-form">
                  <a className="ab-btn ab-btn-zap" href={linkZap(b)} target="_blank" rel="noopener noreferrer">
                    <Ico n="zap" />Chamar {b.responsavel.split(' ')[0]} no WhatsApp
                  </a>

                  {b.tipo === 'pp' && (
                    <section className="ab-sec" aria-labelledby="ab-q-tit">
                      <h4 id="ab-q-tit">Quintas pedidas <small>(marque as aprovadas · até 10 músicos por noite)</small></h4>
                      <ul className="ab-quintas">
                        {b.quintas.map(q => {
                          const aprovada = b.quintas_aprovadas.includes(q)
                          const outros = b.vagas_quintas?.[q] || 0
                          const total = outros + (aprovada ? b.integrantes : 0)
                          const lotada = !aprovada && outros + b.integrantes > 10
                          return (
                            <li key={q}>
                              <label className={`ab-quinta${aprovada ? ' on' : ''}${lotada ? ' lotada' : ''}`}>
                                <input type="checkbox" checked={aprovada} disabled={lotada || !!salvando}
                                  onChange={() => salvar({ quintas_aprovadas: aprovada ? b.quintas_aprovadas.filter(x => x !== q) : [...b.quintas_aprovadas, q] }, 'quintas')} />
                                <b>Quinta, {quintaCurta(q)}{showPassou(q) && ' (já passou)'}</b>
                                <span>{lotada ? 'Lotada' : `${total}/10 músicos aprovados`}</span>
                              </label>
                            </li>
                          )
                        })}
                      </ul>
                      <p className="ab-dica" aria-live="polite">{salvo === 'quintas' ? <><Ico n="check" className="ab-ico-sm" />Quintas salvas</> : `${b.integrantes} ${b.integrantes === 1 ? 'músico' : 'músicos'} nesta inscrição. Cada um ganha R$ 50 de bônus no dia.`}</p>
                    </section>
                  )}

                  <section className="ab-sec" aria-labelledby="ab-st-tit">
                    <h4 id="ab-st-tit">Status <small>(só a equipe vê)</small></h4>
                    <div className="ab-st-opcoes" role="group" aria-label="Status da banda">
                      {STATUS.map(s => (
                        <button key={s.id} type="button" aria-pressed={b.status === s.id} disabled={!!salvando}
                          className={`ab-st-op ab-st-${s.id}${b.status === s.id ? ' on' : ''}`} onClick={() => salvar({ status: s.id }, 'status')}>
                          {b.status === s.id ? <Ico n="check" className="ab-ico-sm" /> : <span className="ab-status-dot" aria-hidden="true" />}{s.label}
                        </button>
                      ))}
                    </div>
                    <p className="ab-dica" aria-live="polite">
                      {salvo === 'status' ? <><Ico n="check" className="ab-ico-sm" />Status salvo</> : b.status_em ? `Atualizado em ${dataHora(b.status_em)}` : 'Toda inscrição começa como Nova.'}
                    </p>
                    <label className="ab-nota">
                      <span>Observação da equipe</span>
                      <textarea rows={3} value={nota} maxLength={2000} onChange={e => setNota(e.target.value)} placeholder="Ex.: cachê combinado, repertório, quem negociou…" />
                    </label>
                    <div className="ab-nota-acoes">
                      <button type="button" className="ab-btn" disabled={nota === b.nota || !!salvando} onClick={() => salvar({ nota }, 'nota')}>
                        {salvando === 'nota' ? 'Salvando…' : 'Salvar observação'}
                      </button>
                      {salvo === 'nota' && <span className="ab-dica" role="status"><Ico n="check" className="ab-ico-sm" />Salva</span>}
                    </div>
                  </section>

                  <section className="ab-sec">
                    <h4>Inscrição pelo Johnny</h4>
                    <dl className="ab-dl">
                      <dt>Responsável</dt><dd>{b.responsavel}</dd>
                      <dt>WhatsApp</dt><dd>{fone(b.whatsapp)}</dd>
                      {b.tipo === 'pp' ? <>
                        <dt>Formação</dt><dd>{b.integrantes} · {b.instrumentos.join(', ')}</dd>
                        <dt>Bônus</dt><dd>R$ 50 por músico, só no dia</dd>
                      </> : <>
                        <dt>Show pedido</dt><dd>{diaShow(b.data)}, 20h{showPassou(b.data) && ' (já passou)'}</dd>
                        <dt>Cachê médio</dt><dd>{b.cache || 'Não informou'}</dd>
                        <dt>Consumo</dt><dd>R$ {b.integrantes * 50} ({b.integrantes} × R$ 50)</dd>
                      </>}
                      <dt>Termos aceitos</dt><dd>{b.aceite ? dataHora(b.aceite) : '—'}</dd>
                      {b.engine_lead_id && <><dt>Engine Porks</dt><dd>Lead #{b.engine_lead_id} (tag Banda)</dd></>}
                    </dl>
                    {!b.concluido && <p className="ab-aviso"><Ico n="alerta" className="ab-ico-sm" />A banda saiu antes de terminar o envio. Pode faltar vídeo ou foto.</p>}
                  </section>
                </div>
              )}

              {aba === 'previa' && (
                <div className="bp-perfil ab-previa">
                  {sujo && <p className="ab-aviso"><Ico n="alerta" className="ab-ico-sm" />O perfil tem alteração sem salvar. A prévia mostra o que já está publicado.</p>}
                  <PerfilAbas b={b.publico} aba={abaPrevia} onAba={setAbaPrevia} />
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
