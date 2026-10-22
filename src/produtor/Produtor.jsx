import { useEffect, useRef, useState } from 'react'
import '../index.css'
import './produtor.css'
import { ESTILOS, MAX_ESTILOS } from '../bandas/estilos.js'

/* Johnny, o produtor musical do Porks: chat guiado pra banda que quer tocar na casa */

const MB = 1024 * 1024
const MAX_VIDEOS = 5
const MAX_VIDEO_MB = 100
const MAX_FOTOS = 10
const MAX_FOTO_MB = 15
const CONSUMO_POR_MUSICO = 50

const INSTRUMENTOS = ['Bateria', 'Guitarra', 'Vocal', 'Baixo']

const CASAS = ['UK Music Hall', 'London Street Pub', 'Cult 22', 'John Bull Pub', 'Pinella', 'Dig Rock Bar', 'Mané Mercado', 'Vikings', 'Galpão X', 'Porão do Rock']
const TEMPOS = ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', 'Mais de 5 anos']
const CACHES = ['Até R$ 500', 'R$ 500 a 800', 'R$ 800 a 1.000', 'R$ 1.000 a 1.500', 'Acima de R$ 1.500']
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

const ETAPAS = ['banda', 'formacao', 'estilo', 'lugares', 'videos', 'fotos', 'tempo', 'cache', 'contato', 'data', 'aceite', 'fim']
const wait = ms => new Promise(r => setTimeout(r, ms))
const tamanho = bytes => bytes < MB
  ? `${Math.max(1, Math.round(bytes / 1024))} KB`
  : `${(bytes / MB).toFixed(bytes < 10 * MB ? 1 : 0).replace('.', ',')} MB`
const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

function proximasSextasESabados(semanas = 10) {
  const out = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 1)
  while (out.length < semanas * 2) {
    const dow = d.getDay()
    if (dow === 5 || dow === 6) out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

function isoDate(d) {
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function dataExtenso(d) {
  const dia = d.getDay() === 5 ? 'sexta' : 'sábado'
  return `${dia}, ${d.getDate()} de ${d.toLocaleDateString('pt-BR', { month: 'long' })}`
}

function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  if (d.length <= 3) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`
}

/* ─ Peças visuais ─ */

/* ícones de traço único (estilo Lucide), no lugar de emoji */
const ICONES = {
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  chope: <><path d="M6 8h9v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" /><path d="M15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" /><path d="M6 8a3 3 0 0 1 3-4 3 3 0 0 1 5 0 2.5 2.5 0 0 1 1 4" /></>,
  som: <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="14" r="3.5" /><circle cx="12" cy="7" r="1.2" /></>,
  bateria: <><ellipse cx="12" cy="9" rx="8" ry="3" /><path d="M4 9v7c0 1.7 3.6 3 8 3s8-1.3 8-3V9" /><path d="m7 2 4 5M17 2l-4 5" /></>,
  decibel: <path d="M3 12h3l3-7 4 14 3-7h5" />,
  menor: <><circle cx="12" cy="7" r="3" /><path d="M6 21v-2a6 6 0 0 1 12 0v2" /><path d="M4 4l16 16" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></>,
  foto: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></>,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  check: <path d="m5 12 5 5 9-10" />,
  tranca: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  esq: <path d="m15 5-7 7 7 7" />,
  dir: <path d="m9 5 7 7-7 7" />,
}

function Ico({ n, className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONES[n]}
    </svg>
  )
}


function Avatar({ small }) {
  // foto do Johnny em /images/johnny.jpg; se não existir, fica o ícone de fone
  const [foto, setFoto] = useState(true)
  return (
    <div className={`pd-avatar${small ? ' pd-avatar-sm' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
        <rect x="2" y="14" width="4.5" height="7" rx="1.5" fill="currentColor" />
        <rect x="17.5" y="14" width="4.5" height="7" rx="1.5" fill="currentColor" />
      </svg>
      {foto && <img src="/images/johnny.jpg" alt="" className="pd-avatar-img" onError={() => setFoto(false)} />}
    </div>
  )
}

function Typing() {
  return (
    <div className="pd-row pd-row-j">
      <Avatar small />
      <div className="pd-bubble pd-bubble-j pd-typing" aria-label="Johnny está digitando">
        <span /><span /><span />
      </div>
    </div>
  )
}

function Termos({ musicos }) {
  const total = musicos * CONSUMO_POR_MUSICO
  return (
    <div className="pd-termos">
      <div className="pd-termo">
        <div className="pd-termo-ico"><Ico n="relogio" /></div>
        <div>
          <div className="pd-termo-tit">Música ao vivo das 20h às 23h50</div>
          <p>É o horário legal habilitado pelo órgão fiscalizador. Tem um <b>intervalo de uns 20 minutos no meio, antes das 22h</b>, pra vocês relaxarem a musculatura e consumirem.</p>
        </div>
      </div>
      <div className="pd-termo">
        <div className="pd-termo-ico"><Ico n="chope" /></div>
        <div>
          <div className="pd-termo-tit">R$ 50 de consumo por músico</div>
          <p>Um cartão único pra banda gastar no <b>Clube do Chope</b>.</p>
          <div className="pd-conta">
            <span>{musicos} {musicos === 1 ? 'músico' : 'músicos'} × R$ 50</span>
            <b>{brl(total)}</b>
          </div>
        </div>
      </div>
      <div className="pd-termo">
        <div className="pd-termo-ico"><Ico n="som" /></div>
        <div>
          <div className="pd-termo-tit">Equipamento</div>
          <ul className="pd-equip">
            <li className="pd-ok">2 caixas de som Staner, muito potentes, se quiserem usar</li>
            <li className="pd-ok">Mesa de som simples de 8 canais</li>
            <li className="pd-nao">Não temos microfones nem cabos de microfone</li>
            <li className="pd-nao">Vocês levam o equipamento de vocês, inclusive retorno</li>
          </ul>
        </div>
      </div>
      <div className="pd-termo pd-termo-forte">
        <div className="pd-termo-ico"><Ico n="bateria" /></div>
        <div>
          <div className="pd-termo-tit">Recomendamos FORTEMENTE bateria elétrica</div>
          <p>Os vizinhos agradecem e o IBRAM também.</p>
        </div>
      </div>
      <div className="pd-termo pd-termo-alerta">
        <div className="pd-termo-ico"><Ico n="decibel" /></div>
        <div>
          <div className="pd-termo-tit">Decibéis medidos a cada 30 minutos</div>
          <p>A gente mede em pontos estratégicos. Se passar do permitido, a banda <b>obrigatoriamente reduz o volume</b> até voltar pro limite do IBRAM naquele horário. É regra, é premissa, e tem funcionado: estamos de boa!</p>
          <p>Descumprir as regras gera um desconforto gigantesco e desgasta o relacionamento com a casa.</p>
        </div>
      </div>
      <div className="pd-termo">
        <div className="pd-termo-ico"><Ico n="menor" /></div>
        <div>
          <div className="pd-termo-tit">Músicos menores de idade</div>
          <p>Só acompanhados de responsável legal. Menor não consome bebida alcoólica, e a gente jamais vende.</p>
        </div>
      </div>
    </div>
  )
}

function Ficha({ ficha }) {
  return (
    <div className="pd-ficha">
      <div className="pd-ficha-head">
        <span>FICHA DA BANDA</span>
        <b>{ficha.banda}</b>
      </div>
      <dl>
        <dt>Integrantes</dt><dd>{ficha.integrantes} · {ficha.instrumentos.join(', ')}</dd>
        {ficha.estilos?.length > 0 && <><dt>Estilo</dt><dd>{ficha.estilos.join(', ')}</dd></>}
        <dt>Já tocou em</dt><dd>{ficha.lugares}</dd>
        <dt>Formação</dt><dd>{ficha.tempo}</dd>
        {ficha.cache && <><dt>Cachê médio</dt><dd>{ficha.cache}</dd></>}
        <dt>Material</dt><dd>{ficha.videos.length} {ficha.videos.length === 1 ? 'vídeo' : 'vídeos'} · {ficha.fotos.length} {ficha.fotos.length === 1 ? 'foto' : 'fotos'}</dd>
        <dt>Negociação</dt><dd>{ficha.responsavel} · {ficha.whatsapp}</dd>
        <dt>Data</dt><dd>{ficha.dataTexto[0].toUpperCase() + ficha.dataTexto.slice(1)}, a partir das 20h</dd>
      </dl>
    </div>
  )
}

/* ─ Composers (a área de resposta muda a cada pergunta) ─ */

function TextoComposer({ placeholder, onSend, maxLength = 80 }) {
  const [v, setV] = useState('')
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  const ok = v.trim().length >= 2
  return (
    <form className="pd-compose-line" onSubmit={e => { e.preventDefault(); if (ok) onSend(v.trim()) }}>
      <input ref={ref} className="pd-input" value={v} onChange={e => setV(e.target.value)} placeholder={placeholder} maxLength={maxLength} enterKeyHint="send" />
      <button className="pd-send" disabled={!ok} aria-label="Enviar">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" /></svg>
      </button>
    </form>
  )
}

function FormacaoComposer({ onSend }) {
  const [n, setN] = useState(4)
  const [sel, setSel] = useState([])
  const [outro, setOutro] = useState(false)
  const [outroTxt, setOutroTxt] = useState('')
  const toggle = i => setSel(s => (s.includes(i) ? s.filter(x => x !== i) : [...s, i]))
  const lista = [...sel, ...(outro && outroTxt.trim() ? [outroTxt.trim()] : [])]
  const ok = lista.length > 0 && (!outro || outroTxt.trim().length > 1)
  return (
    <div className="pd-compose-box">
      <div className="pd-lbl">Quantos integrantes?</div>
      <div className="pd-stepper">
        <button type="button" onClick={() => setN(x => Math.max(1, x - 1))} disabled={n <= 1} aria-label="Menos">−</button>
        <span className="pd-stepper-n">{n}</span>
        <button type="button" onClick={() => setN(x => Math.min(15, x + 1))} disabled={n >= 15} aria-label="Mais">+</button>
      </div>
      <div className="pd-lbl">Quem tem na banda? <i>marque todos</i></div>
      <div className="pd-chips">
        {INSTRUMENTOS.map(i => (
          <button type="button" key={i} className={`pd-chip${sel.includes(i) ? ' on' : ''}`} aria-pressed={sel.includes(i)} onClick={() => toggle(i)}>{sel.includes(i) && <Ico n="check" className="pd-chip-ck" />}{i}</button>
        ))}
        <button type="button" className={`pd-chip${outro ? ' on' : ''}`} aria-pressed={outro} onClick={() => setOutro(o => !o)}>{outro ? <Ico n="check" className="pd-chip-ck" /> : '+ '}Outro</button>
      </div>
      {outro && (
        <input className="pd-input pd-input-block" autoFocus value={outroTxt} onChange={e => setOutroTxt(e.target.value)} placeholder="Ex.: teclado, sax, percussão" maxLength={60} />
      )}
      <button type="button" className="pd-cta" disabled={!ok} onClick={() => onSend({ integrantes: n, instrumentos: lista })}>Confirmar formação</button>
    </div>
  )
}

function EstiloComposer({ onSend }) {
  const [sel, setSel] = useState([])
  const [txt, setTxt] = useState('')
  const extras = txt.split(/[,\n]/).map(s => s.trim()).filter(Boolean)
  const lista = [...new Set([...sel, ...extras])].slice(0, MAX_ESTILOS)
  const toggle = e => setSel(s => (s.includes(e) ? s.filter(x => x !== e) : s.length + extras.length >= MAX_ESTILOS ? s : [...s, e]))
  return (
    <div className="pd-compose-box">
      <div className="pd-chips">
        {ESTILOS.map(e => (
          <button type="button" key={e} className={`pd-chip${sel.includes(e) ? ' on' : ''}`} aria-pressed={sel.includes(e)}
            disabled={!sel.includes(e) && lista.length >= MAX_ESTILOS} onClick={() => toggle(e)}>
            {sel.includes(e) && <Ico n="check" className="pd-chip-ck" />}{e}
          </button>
        ))}
      </div>
      <input className="pd-input pd-input-block" value={txt} onChange={e => setTxt(e.target.value)} placeholder="Outro estilo? Escreve aqui" maxLength={80} />
      <button type="button" className="pd-cta" disabled={!lista.length} onClick={() => onSend(lista)}>
        {lista.length ? `Confirmar ${lista.length === 1 ? 'estilo' : `${lista.length} estilos`}` : `Marque até ${MAX_ESTILOS} estilos`}
      </button>
    </div>
  )
}

function LugaresComposer({ onSend }) {
  const [sel, setSel] = useState([])
  const [txt, setTxt] = useState('')
  const toggle = c => setSel(s => (s.includes(c) ? s.filter(x => x !== c) : [...s, c]))
  const lista = [...sel, ...txt.split(/[,\n]/).map(s => s.trim()).filter(Boolean)]
  return (
    <div className="pd-compose-box">
      <div className="pd-chips">
        {CASAS.map(c => (
          <button type="button" key={c} className={`pd-chip${sel.includes(c) ? ' on' : ''}`} aria-pressed={sel.includes(c)} onClick={() => toggle(c)}>{sel.includes(c) && <Ico n="check" className="pd-chip-ck" />}{c}</button>
        ))}
      </div>
      <input className="pd-input pd-input-block" value={txt} onChange={e => setTxt(e.target.value)} placeholder="Outras casas, separadas por vírgula" maxLength={240} />
      <button type="button" className="pd-cta" disabled={!lista.length} onClick={() => onSend(lista.join(', '))}>Enviar</button>
      <button type="button" className="pd-link" onClick={() => onSend('Ainda não tocamos em nenhuma casa')}>Ainda não tocamos em nenhuma casa</button>
    </div>
  )
}

function UploadComposer({ tipo, onSend, onRejeita }) {
  const video = tipo === 'video'
  const max = video ? MAX_VIDEOS : MAX_FOTOS
  const maxMb = video ? MAX_VIDEO_MB : MAX_FOTO_MB
  const [files, setFiles] = useState([])
  const inputRef = useRef(null)

  useEffect(() => () => files.forEach(f => URL.revokeObjectURL(f.url)), []) // eslint-disable-line react-hooks/exhaustive-deps

  function add(list) {
    const novos = []
    const grandes = []
    let sobrou = 0
    for (const file of list) {
      if (video ? !file.type.startsWith('video/') : !file.type.startsWith('image/')) continue
      if (file.size > maxMb * MB) { grandes.push(file); continue }
      if (files.length + novos.length >= max) { sobrou++; continue }
      novos.push({ id: `${file.name}-${file.size}-${file.lastModified}`, file, url: URL.createObjectURL(file) })
    }
    if (novos.length) setFiles(f => [...f, ...novos])
    if (grandes.length || sobrou) onRejeita({ grandes, sobrou })
  }

  function remove(id) {
    setFiles(f => {
      const r = f.find(x => x.id === id)
      if (r) URL.revokeObjectURL(r.url)
      return f.filter(x => x.id !== id)
    })
  }

  return (
    <div className="pd-compose-box">
      {files.length > 0 && (
        <div className="pd-thumbs">
          {files.map(f => (
            <div className="pd-thumb" key={f.id}>
              {video
                ? <><video src={`${f.url}#t=0.5`} muted playsInline preload="metadata" /><Ico n="play" className="pd-thumb-play" /></>
                : <img src={f.url} alt="" />}
              <span className="pd-thumb-mb">{tamanho(f.file.size)}</span>
              <button type="button" className="pd-thumb-x" onClick={() => remove(f.id)} aria-label="Remover">×</button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple
        accept={video ? 'video/*' : 'image/*'}
        onChange={e => { add([...e.target.files]); e.target.value = '' }}
      />
      {files.length < max && (
        <button type="button" className="pd-drop" onClick={() => inputRef.current?.click()}>
          <Ico n={video ? 'video' : 'foto'} className="pd-drop-ico" />
          <span>
            <b>{files.length ? `Adicionar mais ${video ? 'vídeos' : 'fotos'}` : `Escolher ${video ? 'vídeos' : 'fotos'}`}</b>
            <small>{files.length}/{max} · até {maxMb} MB cada</small>
          </span>
        </button>
      )}
      <button type="button" className="pd-cta" disabled={!files.length} onClick={() => onSend(files)}>
        {files.length ? `Enviar ${files.length} ${video ? (files.length === 1 ? 'vídeo' : 'vídeos') : (files.length === 1 ? 'foto' : 'fotos')}` : 'Enviar'}
      </button>
      <button type="button" className="pd-link" onClick={() => onSend([])}>Não tenho agora</button>
    </div>
  )
}

function ChipsComposer({ opcoes, onSend }) {
  return (
    <div className="pd-compose-box">
      <div className="pd-chips pd-chips-big">
        {opcoes.map(o => <button type="button" key={o} className="pd-chip" onClick={() => onSend(o)}>{o}</button>)}
      </div>
    </div>
  )
}

// faixa de cachê ou valor exato (o exato vence a faixa)
function CacheComposer({ onSend }) {
  const [faixa, setFaixa] = useState('')
  const [valor, setValor] = useState('')
  const digitos = valor.replace(/\D/g, '').slice(0, 6)
  const exato = digitos ? `R$ ${Number(digitos).toLocaleString('pt-BR')}` : ''
  const resposta = exato || faixa
  return (
    <div className="pd-compose-box">
      <div className="pd-chips">
        {CACHES.map(c => (
          <button type="button" key={c} className={`pd-chip${faixa === c && !exato ? ' on' : ''}`} aria-pressed={faixa === c && !exato}
            onClick={() => { setFaixa(c); setValor('') }}>
            {faixa === c && !exato && <Ico n="check" className="pd-chip-ck" />}{c}
          </button>
        ))}
      </div>
      <label className="pd-campo-cache">
        <span>Ou o valor exato</span>
        <span className="pd-input-cache">
          <b>R$</b>
          <input className="pd-input" inputMode="numeric" value={digitos ? Number(digitos).toLocaleString('pt-BR') : ''}
            onChange={e => setValor(e.target.value)} placeholder="Ex.: 900" aria-label="Valor exato do cachê em reais" />
        </span>
      </label>
      <button type="button" className="pd-cta" disabled={!resposta} onClick={() => onSend(resposta)}>
        {resposta ? `Confirmar ${resposta}` : 'Escolha uma faixa ou digite o valor'}
      </button>
    </div>
  )
}

function ContatoComposer({ onSend }) {
  const [nome, setNome] = useState('')
  const [tel, setTel] = useState('')
  const digitos = tel.replace(/\D/g, '')
  const telOk = digitos.length === 11 && digitos[2] === '9'
  const nomeOk = nome.trim().split(/\s+/).length >= 2
  const ok = nomeOk && telOk
  return (
    <form className="pd-compose-box" onSubmit={e => { e.preventDefault(); if (ok) onSend({ nome: nome.trim(), whatsapp: tel }) }}>
      <label className="pd-field">
        <span className="pd-lbl">Responsável pela negociação</span>
        <span className="pd-field-wrap">
          <svg className="pd-field-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
          <input className="pd-input pd-input-block" autoFocus value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome e sobrenome" autoComplete="name" maxLength={80} />
          {nomeOk && <span className="pd-field-ok">✓</span>}
        </span>
      </label>
      <label className="pd-field">
        <span className="pd-lbl">WhatsApp</span>
        <span className="pd-field-wrap">
          <svg className="pd-field-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
          <input className="pd-input pd-input-block" value={tel} onChange={e => setTel(maskPhone(e.target.value))} placeholder="(61) 9 9999-9999" inputMode="tel" autoComplete="tel" />
          {telOk && <span className="pd-field-ok">✓</span>}
        </span>
      </label>
      {digitos.length === 11 && !telOk && <div className="pd-erro">Confere o número: celular começa com 9 depois do DDD.</div>}
      <button className="pd-cta" disabled={!ok}>Enviar contato</button>
    </form>
  )
}

const MESES_NOME = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const MESES_A_FRENTE = 6

// sextas e sábados dos próximos meses, agrupados por mês e por fim de semana
function montarMeses() {
  const limite = new Date()
  limite.setHours(0, 0, 0, 0)
  limite.setMonth(limite.getMonth() + MESES_A_FRENTE, 0)
  const out = []
  for (const d of proximasSextasESabados(MESES_A_FRENTE * 5)) {
    if (d > limite) break
    const chave = `${d.getFullYear()}-${d.getMonth()}`
    let m = out[out.length - 1]
    if (!m || m.chave !== chave) {
      m = { chave, mes: d.getMonth(), ano: d.getFullYear(), semanas: [] }
      out.push(m)
    }
    const ult = m.semanas[m.semanas.length - 1]
    if (d.getDay() === 6 && ult?.sex && !ult.sab && d.getDate() === ult.sex.getDate() + 1) ult.sab = d
    else m.semanas.push(d.getDay() === 5 ? { sex: d } : { sab: d })
  }
  return out
}

function DiaCard({ d, sel, onSel, ocupado }) {
  if (!d) return <div className="pd-day pd-day-vazio" aria-hidden="true" />
  const on = sel === isoDate(d)
  return (
    <button type="button" role="option" aria-selected={on} aria-disabled={ocupado} disabled={ocupado}
      className={`pd-day${on ? ' on' : ''}${ocupado ? ' ocupado' : ''}`} onClick={() => onSel(isoDate(d))}
      aria-label={ocupado ? `${dataExtenso(d)}: já tem banda marcada` : `${dataExtenso(d)}, a partir das 20h`}>
      <span className="pd-day-dow">{d.getDay() === 5 ? 'SEXTA' : 'SÁBADO'}{ocupado && <small>Já tem banda</small>}</span>
      <span className="pd-day-n">{d.getDate()}</span>
      {ocupado ? <span className="pd-day-h pd-day-tranca"><Ico n="tranca" className="pd-day-ck" /></span> : <span className="pd-day-h">{on ? <Ico n="check" className="pd-day-ck" /> : '20h'}</span>}
    </button>
  )
}

function DataComposer({ onSend }) {
  const [meses] = useState(montarMeses)
  const [mi, setMi] = useState(0)
  const [sel, setSel] = useState(null)
  const [ocupadas, setOcupadas] = useState(() => new Set())
  // datas que já têm banda na agenda do Porks (só a data; nome e cachê não vêm)
  useEffect(() => {
    const dias = meses.flatMap(x => x.semanas.flatMap(w => [w.sex, w.sab])).filter(Boolean)
    if (!dias.length) return
    fetch(`/api/bandas/ocupadas?de=${isoDate(dias[0])}&ate=${isoDate(dias[dias.length - 1])}`)
      .then(r => (r.ok ? r.json() : [])).then(l => setOcupadas(new Set(l))).catch(() => {})
  }, [meses])
  const selData = sel ? meses.flatMap(x => x.semanas.flatMap(w => [w.sex, w.sab])).find(d => d && isoDate(d) === sel) : null
  const m = meses[mi]
  const anoAtual = new Date().getFullYear()

  return (
    <div className="pd-compose-box">
      <div className="pd-mes-nav">
        <button type="button" className="pd-mes-seta" onClick={() => setMi(i => i - 1)} disabled={mi === 0} aria-label="Mês anterior"><Ico n="esq" /></button>
        <div className="pd-mes-titulo" aria-live="polite">
          {MESES_NOME[m.mes]}{m.ano !== anoAtual && <small> {m.ano}</small>}
        </div>
        <button type="button" className="pd-mes-seta" onClick={() => setMi(i => i + 1)} disabled={mi === meses.length - 1} aria-label="Próximo mês"><Ico n="dir" /></button>
      </div>
      <div className="pd-mes-tabs" role="tablist" aria-label="Meses">
        {meses.map((x, i) => {
          const temSel = !!selData && selData.getMonth() === x.mes && selData.getFullYear() === x.ano
          return (
            <button type="button" role="tab" aria-selected={i === mi} key={x.chave} className={`pd-mes-tab${i === mi ? ' on' : ''}${temSel ? ' tem' : ''}`} onClick={() => setMi(i)}>
              {MESES[x.mes]}
            </button>
          )
        })}
      </div>
      <div className="pd-cal-grid" role="listbox" aria-label={`Sextas e sábados de ${MESES_NOME[m.mes]}`} key={m.chave}>
        {m.semanas.map(w => (
          <div className="pd-semana" key={isoDate(w.sex || w.sab)}>
            <DiaCard d={w.sex} sel={sel} onSel={setSel} ocupado={!!w.sex && ocupadas.has(isoDate(w.sex))} />
            <DiaCard d={w.sab} sel={sel} onSel={setSel} ocupado={!!w.sab && ocupadas.has(isoDate(w.sab))} />
          </div>
        ))}
      </div>
      <button type="button" className="pd-cta" disabled={!selData} onClick={() => onSend(selData)}>
        {selData ? `Quero ${dataExtenso(selData)}` : 'Escolha uma sexta ou sábado'}
      </button>
    </div>
  )
}

function AceiteComposer({ onSim, onNao }) {
  return (
    <div className="pd-compose-box">
      <button type="button" className="pd-cta pd-cta-yel" onClick={onSim}>Tô de acordo com os termos 🤘</button>
      <button type="button" className="pd-link" onClick={onNao}>Não concordo</button>
    </div>
  )
}

function EnvioComposer({ envio, onTentar }) {
  if (envio.erro) {
    return (
      <div className="pd-compose-box">
        <button type="button" className="pd-cta pd-cta-yel" onClick={onTentar}>Tentar enviar de novo</button>
      </div>
    )
  }
  const pct = Math.round(envio.pct * 100)
  return (
    <div className="pd-compose-box" role="status" aria-live="polite">
      <div className="pd-envio-txt">
        <span>{envio.texto}</span>
        <b>{pct}%</b>
      </div>
      <div className="pd-envio-barra"><span style={{ transform: `scaleX(${envio.pct})` }} /></div>
    </div>
  )
}

/* ─ Envio pro servidor ─ */

async function api(path, body, headers = {}) {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || `erro ${r.status}`)
  return j
}

// PUT do arquivo cru, com progresso (fetch não dá progresso de upload)
function subirArquivo({ id, chave, tipo, file, onProgresso }) {
  return new Promise((ok, falha) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', `/api/bandas/${id}/arquivos?tipo=${tipo}&nome=${encodeURIComponent(file.name)}`)
    xhr.setRequestHeader('X-Upload-Key', chave)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = e => onProgresso(e.loaded)
    xhr.onload = () => (xhr.status < 300 ? ok() : falha(new Error(xhr.status)))
    xhr.onerror = () => falha(new Error('rede'))
    xhr.send(file)
  })
}

/* ─ Página ─ */

export default function Produtor() {
  const [msgs, setMsgs] = useState([])
  const [typing, setTyping] = useState(false)
  const [step, setStep] = useState(null)
  const [etapa, setEtapa] = useState(0)
  const [envio, setEnvio] = useState({ pct: 0, texto: '' })
  const fichaRef = useRef({})
  const started = useRef(false)
  const idRef = useRef(0)


  useEffect(() => {
    // rola a página até o fim: o composer é sticky e cobriria a última mensagem
    requestAnimationFrame(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }))
  }, [msgs, typing, step])

  function push(from, content, extra = {}) {
    idRef.current += 1
    setMsgs(m => [...m, { id: idRef.current, from, content, ...extra }])
  }

  async function johnny(lines, next, { manterResposta = false } = {}) {
    if (!manterResposta) setStep(null)
    for (const line of lines) {
      setTyping(true)
      const len = typeof line === 'string' ? line.length : 120
      await wait(Math.min(1500, 450 + len * 14))
      setTyping(false)
      push('j', line)
      await wait(180)
    }
    if (next) {
      setStep(next)
      setEtapa(e => Math.max(e, ETAPAS.indexOf(next)))
    }
  }

  function banda(content) {
    push('b', content)
  }

  useEffect(() => {
    document.title = 'Johnny, produtor musical do Porks'
    if (started.current) return
    started.current = true
    setTimeout(() => johnny([
      'Fala, banda! 🤘 Aqui é o Johnny, produtor musical do Porks Sobradinho.',
      'Vou te fazer umas perguntas rápidas pra conhecer o som de vocês e levar pra administração da casa.',
      'Bora começar: qual é o nome da banda?',
    ], 'banda'), 250)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ficha só é lida em handlers, nunca no render
  const F = () => fichaRef.current

  const handlers = {
    banda: nome => {
      F().banda = nome
      banda(nome)
      johnny([`${nome}! Gostei. 🔥`, 'Me conta a formação: quantos são e quem toca o quê?'], 'formacao')
    },
    formacao: ({ integrantes, instrumentos }) => {
      F().integrantes = integrantes
      F().instrumentos = instrumentos
      banda(`${integrantes} ${integrantes === 1 ? 'integrante' : 'integrantes'}: ${instrumentos.join(', ')}`)
      johnny(['E qual é a pegada da banda? Marca os estilos que vocês tocam.'], 'estilo')
    },
    estilo: estilos => {
      F().estilos = estilos
      banda(estilos.join(', '))
      johnny(['Quais lugares a banda já tocou? Pode marcar as casas abaixo e escrever outras.'], 'lugares')
    },
    lugares: txt => {
      F().lugares = txt
      banda(txt)
      johnny([
        'Show. Agora a parte que mais me ajuda:',
        'Consegue mandar vídeos da banda pra eu analisar? Ajuda MUITO se for lugar lotado, com muita energia e voz AFINADA. É pra me ajudar a te ajudar 😉',
        `Até ${MAX_VIDEOS} vídeos, cada um com menos de ${MAX_VIDEO_MB} MB.`,
      ], 'videos')
    },
    videos: files => {
      F().videos = files.map(x => x.file)
      banda(files.length ? { tipo: 'video', files } : 'Não tenho vídeo agora')
      johnny([
        files.length ? 'Recebi! Vou assistir com carinho. 🎧' : 'Tranquilo. Sem vídeo fica mais difícil de avaliar, mas segue o jogo.',
        'Tem fotos da banda pra gente trabalhar nos flyers?',
      ], 'fotos')
    },
    fotos: files => {
      F().fotos = files.map(x => x.file)
      banda(files.length ? { tipo: 'foto', files } : 'Não tenho foto agora')
      johnny([
        files.length ? 'Boa, já dá pra imaginar o flyer. 📸' : 'Beleza, se rolar a parceria a gente pede depois.',
        'Quanto tempo a banda tem de formação?',
      ], 'tempo')
    },
    tempo: t => {
      F().tempo = t
      banda(t)
      johnny(['Pra eu levar certinho pra administração: qual é a média de cachê que a banda costuma cobrar por show?'], 'cache')
    },
    cache: c => {
      F().cache = c
      banda(c)
      johnny([
        'Valeu pela sinceridade! Isso é importante pra gente alinhar expectativas desde o começo. 🤝',
        'Agora preciso do nome e do WhatsApp de quem cuida da negociação da banda.',
      ], 'contato')
    },
    contato: ({ nome, whatsapp }) => {
      F().responsavel = nome
      F().whatsapp = whatsapp
      banda(`${nome} · ${whatsapp}`)
      johnny([`Valeu, ${nome.split(' ')[0]}!`, 'Qual data te interessa? Aqui no Porks a música ao vivo rola sextas e sábados, a partir das 20h.'], 'data')
    },
    data: d => {
      F().data = isoDate(d)
      F().dataTexto = dataExtenso(d)
      banda(`${F().dataTexto[0].toUpperCase()}${F().dataTexto.slice(1)}, a partir das 20h`)
      johnny([
        'Anotado! Agora deixa eu te explicar como funciona aqui na casa. 👇',
        { tipo: 'termos', musicos: F().integrantes || 1 },
        'Está de acordo com estes termos?',
      ], 'aceite')
    },
  }

  function rejeita(tipo, { grandes, sobrou }) {
    const lines = grandes.map(g => tipo === 'video'
      ? `Opa, o vídeo "${g.name}" é muito grande: tá com ${tamanho(g.size)}, passou de ${MAX_VIDEO_MB} MB. Tem que ser menos que isso. Corta um trecho ou exporta mais leve e manda de novo 🤘`
      : `A foto "${g.name}" tá com ${tamanho(g.size)}, passou de ${MAX_FOTO_MB} MB. Manda uma versão mais leve.`)
    if (sobrou) lines.push(tipo === 'video'
      ? `O limite é de ${MAX_VIDEOS} vídeos. Escolhe os ${MAX_VIDEOS} melhores, aqueles com mais energia!`
      : `O limite é de ${MAX_FOTOS} fotos. Fica com as melhores.`)
    // mantém o composer aberto pra banda não perder os arquivos que já escolheu
    johnny(lines, null, { manterResposta: true })
  }

  async function aceitar() {
    F().aceite = new Date().toISOString()
    banda('Tô de acordo com os termos 🤘')
    enviar()
  }

  async function enviar() {
    const f = F()
    const arquivos = [
      ...(f.videos || []).map(file => ({ tipo: 'video', file })),
      ...(f.fotos || []).map(file => ({ tipo: 'foto', file })),
    ].filter(a => !f.enviados?.has(a.file))
    const total = arquivos.reduce((s, a) => s + a.file.size, 0) || 1
    setStep('enviando')
    setEnvio({ pct: 0, texto: 'Enviando a ficha da banda…' })
    try {
      if (!f.inscricao) {
        f.inscricao = await api('/api/bandas', {
          banda: f.banda, integrantes: f.integrantes, instrumentos: f.instrumentos, estilos: f.estilos, lugares: f.lugares,
          tempo: f.tempo, cache: f.cache, responsavel: f.responsavel, whatsapp: f.whatsapp,
          data: f.data, dataTexto: f.dataTexto, aceite: f.aceite,
        })
        f.enviados = new Set()
      }
      const { id, chave } = f.inscricao
      let feito = 0
      for (const [i, a] of arquivos.entries()) {
        const rotulo = a.tipo === 'video' ? 'vídeo' : 'foto'
        setEnvio({ pct: feito / total, texto: `Enviando ${rotulo} ${i + 1} de ${arquivos.length}…` })
        try {
          await subirArquivo({ id, chave, tipo: a.tipo, file: a.file, onProgresso: n => setEnvio(e => ({ ...e, pct: (feito + n) / total })) })
          f.enviados.add(a.file)
        } catch (e) {
          // erro de rede derruba o envio todo (dá pra tentar de novo); recusa do servidor só pula o arquivo
          if (e.message === 'rede') throw e
        }
        feito += a.file.size
      }
      setEnvio({ pct: 1, texto: 'Fechando a inscrição…' })
      await api(`/api/bandas/${id}/concluir`, {}, { 'X-Upload-Key': chave }).catch(() => {})
    } catch {
      setEnvio({ erro: true })
      await johnny([
        'Ih, a conexão caiu no meio do envio. 😕',
        'Nada se perdeu: confere a internet e toca no botão aqui embaixo que eu continuo de onde parou.',
      ], null, { manterResposta: true })
      return
    }
    await johnny([
      'Perfeito! A administração recebeu a sua solicitação e vai entrar em contato com uma resposta pra negociar o cachê. Beleza pura?',
      'Em até 72h a gente retorna! 🤘',
      { tipo: 'ficha', ficha: { ...F() } },
    ], 'fim')
  }

  function naoConcordo() {
    banda('Não concordo')
    johnny([
      'Entendo. Essas regras são premissa da casa, por causa da fiscalização e dos vizinhos, então não dá pra abrir exceção.',
      'Se mudar de ideia, é só confirmar aqui embaixo. 😉',
    ], 'aceite')
  }

  function renderContent(m) {
    const c = m.content
    if (typeof c === 'string') return c
    if (c.tipo === 'termos') return <Termos musicos={c.musicos} />
    if (c.tipo === 'ficha') return <Ficha ficha={c.ficha} />
    if (c.tipo === 'video' || c.tipo === 'foto') {
      return (
        <div className="pd-sent-media">
          {c.files.map(x => (
            <div key={x.id} className="pd-sent-item">
              {c.tipo === 'video'
                ? <video src={`${x.url}#t=0.5`} muted playsInline preload="metadata" />
                : <img src={x.url} alt="" />}
            </div>
          ))}
          <div className="pd-sent-cap">{c.files.length} {c.tipo === 'video' ? (c.files.length === 1 ? 'vídeo' : 'vídeos') : (c.files.length === 1 ? 'foto' : 'fotos')}</div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="pd">
      <header className="pd-head">
        <a href="/" className="pd-back" aria-label="Voltar pro site">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 5l-7 7 7 7" /></svg>
        </a>
        <Avatar />
        <div className="pd-head-txt">
          <div className="pd-head-nome">JOHNNY</div>
          <div className="pd-head-sub"><span className="pd-dot" />Produtor musical · Porks Sobradinho</div>
        </div>
        <img src="/images/logo-porks.png" alt="Porks" className="pd-head-logo" />
        <div className="pd-prog" role="progressbar" aria-label="Progresso da conversa" aria-valuemin={0} aria-valuemax={ETAPAS.length - 1} aria-valuenow={etapa}>
          <span style={{ transform: `scaleX(${etapa / (ETAPAS.length - 1)})` }} />
        </div>
      </header>

      <main className="pd-feed">
        <div className="pd-hero">
          <div className="pd-hero-ey">QUER TOCAR NO PORKS?</div>
          <div className="pd-hero-t">PALCO ABERTO PRA SUA BANDA</div>
        </div>
        {msgs.map((m, i) => {
          const prev = msgs[i - 1]
          const first = !prev || prev.from !== m.from
          const wide = typeof m.content !== 'string'
          return (
            <div key={m.id} className={`pd-row pd-row-${m.from}${first ? ' pd-first' : ''}`}>
              {m.from === 'j' && (first ? <Avatar small /> : <div className="pd-avatar-gap" />)}
              <div className={`pd-bubble pd-bubble-${m.from}${wide ? ' pd-bubble-wide' : ''}`}>{renderContent(m)}</div>
            </div>
          )
        })}
        {typing && <Typing />}
        <div className="pd-end" />
      </main>

      {step && step !== 'fim' && (
        <footer className="pd-compose" key={step}>
          {step === 'banda' && <TextoComposer placeholder="Nome da banda" onSend={handlers.banda} />}
          {step === 'formacao' && <FormacaoComposer onSend={handlers.formacao} />}
          {step === 'estilo' && <EstiloComposer onSend={handlers.estilo} />}
          {step === 'lugares' && <LugaresComposer onSend={handlers.lugares} />}
          {step === 'videos' && <UploadComposer tipo="video" onSend={handlers.videos} onRejeita={r => rejeita('video', r)} />}
          {step === 'fotos' && <UploadComposer tipo="foto" onSend={handlers.fotos} onRejeita={r => rejeita('foto', r)} />}
          {step === 'tempo' && <ChipsComposer opcoes={TEMPOS} onSend={handlers.tempo} />}
          {step === 'cache' && <CacheComposer onSend={handlers.cache} />}
          {step === 'contato' && <ContatoComposer onSend={handlers.contato} />}
          {step === 'data' && <DataComposer onSend={handlers.data} />}
          {step === 'aceite' && <AceiteComposer onSim={aceitar} onNao={naoConcordo} />}
          {step === 'enviando' && <EnvioComposer envio={envio} onTentar={enviar} />}
        </footer>
      )}
    </div>
  )
}
