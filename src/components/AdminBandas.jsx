import { useState, useEffect, useCallback, useRef } from 'react'
import './admin-bandas.css'

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
function linkZap(b) {
  const nome = b.responsavel.split(' ')[0]
  const txt = `Fala, ${nome}! Aqui é do Porks Sobradinho, sobre a inscrição da banda ${b.banda} pro dia ${diaShow(b.data).toLowerCase()}.`
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
    id: p.get('id') || '',
  }
}
function hashDe(f) {
  const p = new URLSearchParams()
  if (f.pagina > 1) p.set('p', f.pagina)
  if (f.q) p.set('q', f.q)
  if (f.status) p.set('s', f.status)
  if (f.ordem !== 'recentes') p.set('o', f.ordem)
  if (f.id) p.set('id', f.id)
  const s = p.toString()
  return `#bandas${s ? `?${s}` : ''}`
}

function useApi(pass) {
  return useCallback(async (path, opts = {}) => {
    const r = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', 'x-admin-pass': pass, ...opts.headers } })
    if (!r.ok) throw new Error(r.status === 401 ? 'Senha do painel não confere com a do servidor.' : `Erro ${r.status}`)
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
                  <b>{b.banda}</b>
                  <small><Ico n="pessoas" className="ab-ico-sm" />{b.integrantes} {b.integrantes === 1 ? 'integrante' : 'integrantes'}{!b.concluido && <em className="ab-incompleto"> · envio incompleto</em>}</small>
                </span>
                <span className={`ab-c-data${showPassou(b.data) ? ' passou' : ''}`}><Ico n="calendario" className="ab-ico-sm" />{diaShow(b.data)}</span>
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
        <Ficha key={f.id} id={f.id} api={api}
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

/* ─ Ficha (painel lateral no computador, tela cheia no celular) ─ */

function Ficha({ id, api, onFechar, onMudou }) {
  const [b, setB] = useState(null)
  const [erro, setErro] = useState('')
  const [nota, setNota] = useState('')
  const [salvando, setSalvando] = useState('')
  const [salvo, setSalvo] = useState('')
  const fecharRef = useRef(null)

  useEffect(() => {
    let vivo = true
    api(`/api/admin/bandas/${id}`)
      .then(d => { if (vivo) { setB(d); setNota(d.nota) } })
      .catch(e => { if (vivo) setErro(e.message === 'Erro 404' ? 'Essa ficha não existe mais.' : e.message) })
    return () => { vivo = false }
  }, [api, id])

  useEffect(() => {
    fecharRef.current?.focus()
    const onKey = e => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow }
  }, [onFechar])

  async function salvar(patch, qual) {
    setSalvando(qual)
    setSalvo('')
    try {
      const r = await api(`/api/admin/bandas/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      setB(x => ({ ...x, ...r }))
      setSalvo(qual)
      setTimeout(() => setSalvo(s => (s === qual ? '' : s)), 2500)
      onMudou()
    } catch (e) {
      setErro(e.message)
    }
    setSalvando('')
  }

  const videos = b?.arquivos.filter(a => a.tipo === 'video') || []
  const videosNoAr = videos.filter(a => a.url).length
  const fotos = b?.arquivos.filter(a => a.tipo === 'foto') || []

  return (
    <div className="ab-modal" onMouseDown={e => { if (e.target === e.currentTarget) onFechar() }}>
      <aside className="ab-painel" role="dialog" aria-modal="true" aria-labelledby="ab-ficha-titulo">
        <header className="ab-painel-cab">
          <button ref={fecharRef} type="button" className="ab-fechar" onClick={onFechar} aria-label="Fechar ficha"><Ico n="fechar" /></button>
          <div className="ab-painel-tit">
            <h3 id="ab-ficha-titulo">{b?.banda || 'Ficha da banda'}</h3>
            {b && <span>Inscrita em {dataHora(b.criado_em)}</span>}
          </div>
        </header>

        <div className="ab-painel-corpo">
          {erro && <div className="ab-aviso" role="alert"><Ico n="alerta" className="ab-ico-sm" />{erro}</div>}
          {!b && !erro && <div className="ab-painel-esq"><span className="ab-esq-b" /><span className="ab-esq-b" /><span className="ab-esq-b" /></div>}

          {b && (
            <>
              <div className="ab-destaques">
                <div><small>Show pedido</small><b>{diaShow(b.data)}</b><span>a partir das 20h{showPassou(b.data) && ' · já passou'}</span></div>
                <div><small>Integrantes</small><b>{b.integrantes}</b><span>consumo R$ {b.integrantes * 50}</span></div>
              </div>

              <a className="ab-btn ab-btn-zap" href={linkZap(b)} target="_blank" rel="noopener noreferrer">
                <Ico n="zap" />Chamar {b.responsavel.split(' ')[0]} no WhatsApp
              </a>

              <section className="ab-sec" aria-labelledby="ab-st-tit">
                <h4 id="ab-st-tit">Status</h4>
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
                <h4>Ficha</h4>
                <dl className="ab-dl">
                  <dt>Responsável</dt><dd>{b.responsavel}</dd>
                  <dt>WhatsApp</dt><dd>{fone(b.whatsapp)}</dd>
                  <dt>Formação</dt><dd>{b.instrumentos.join(', ') || '—'}</dd>
                  <dt>Já tocou em</dt><dd>{b.lugares || '—'}</dd>
                  <dt>Tempo de banda</dt><dd>{b.tempo || '—'}</dd>
                  <dt>Termos aceitos</dt><dd>{b.aceite ? dataHora(b.aceite) : '—'}</dd>
                  {b.engine_lead_id && <><dt>Engine Porks</dt><dd>Lead #{b.engine_lead_id} (tag Banda)</dd></>}
                </dl>
                {!b.concluido && <p className="ab-aviso"><Ico n="alerta" className="ab-ico-sm" />A banda saiu antes de terminar o envio. Pode faltar vídeo ou foto.</p>}
              </section>

              <section className="ab-sec">
                <h4><Ico n="video" className="ab-ico-sm" />Vídeos ({videosNoAr})</h4>
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
              </section>

              <section className="ab-sec">
                <h4><Ico n="foto" className="ab-ico-sm" />Fotos ({fotos.length})</h4>
                {fotos.length ? (
                  <div className="ab-fotos">
                    {fotos.map(a => (
                      <figure key={a.url} className="ab-foto">
                        <a href={a.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${a.original}`}>
                          <img src={a.url} alt={`Foto da banda ${b.banda}`} loading="lazy" />
                        </a>
                        <a className="ab-foto-baixar" href={a.url} download={a.original} aria-label={`Baixar ${a.original}`}><Ico n="baixar" className="ab-ico-sm" /></a>
                      </figure>
                    ))}
                  </div>
                ) : <p className="ab-dica">A banda não mandou foto.</p>}
              </section>

              <a className="ab-link-ext" href={b.material} target="_blank" rel="noopener noreferrer">
                Abrir página do material (mesmo link do lead no engine)<Ico n="externo" className="ab-ico-sm" />
              </a>
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
