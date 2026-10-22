import { useEffect, useRef, useState } from 'react'
import '../index.css'
import './produtor.css'

/* Johnny, o produtor musical do Porks: chat guiado pra banda que quer tocar na casa */

const MB = 1024 * 1024
const MAX_VIDEOS = 5
const MAX_VIDEO_MB = 100
const MAX_FOTOS = 10
const MAX_FOTO_MB = 15
const CONSUMO_POR_MUSICO = 50

const INSTRUMENTOS = ['Bateria', 'Guitarra', 'Vocal', 'Baixo']
const CASAS = ['UK', 'London', 'Casas de Rock', 'Mané Mercado', 'Vikings', 'Galpão X']
const TEMPOS = ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', 'Mais de 5 anos']
const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

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

function Avatar({ small }) {
  return (
    <div className={`pd-avatar${small ? ' pd-avatar-sm' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
        <rect x="2" y="14" width="4.5" height="7" rx="1.5" fill="currentColor" />
        <rect x="17.5" y="14" width="4.5" height="7" rx="1.5" fill="currentColor" />
      </svg>
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
        <div className="pd-termo-ico">🕗</div>
        <div>
          <div className="pd-termo-tit">Música ao vivo das 20h às 23h50</div>
          <p>É o horário legal habilitado pelo órgão fiscalizador. Tem um <b>intervalo de uns 20 minutos no meio, antes das 22h</b>, pra vocês relaxarem a musculatura e consumirem.</p>
        </div>
      </div>
      <div className="pd-termo">
        <div className="pd-termo-ico">🍺</div>
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
        <div className="pd-termo-ico">🔊</div>
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
        <div className="pd-termo-ico">🥁</div>
        <div>
          <div className="pd-termo-tit">Recomendamos FORTEMENTE bateria elétrica</div>
          <p>Os vizinhos agradecem e o IBRAM também.</p>
        </div>
      </div>
      <div className="pd-termo pd-termo-alerta">
        <div className="pd-termo-ico">📏</div>
        <div>
          <div className="pd-termo-tit">Decibéis medidos a cada 30 minutos</div>
          <p>A gente mede em pontos estratégicos. Se passar do permitido, a banda <b>obrigatoriamente reduz o volume</b> até voltar pro limite do IBRAM naquele horário. É regra, é premissa, e tem funcionado: estamos de boa!</p>
          <p>Descumprir as regras gera um desconforto gigantesco e desgasta o relacionamento com a casa.</p>
        </div>
      </div>
      <div className="pd-termo">
        <div className="pd-termo-ico">🔞</div>
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
        <dt>Já tocou em</dt><dd>{ficha.lugares}</dd>
        <dt>Formação</dt><dd>{ficha.tempo}</dd>
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
          <button type="button" key={i} className={`pd-chip${sel.includes(i) ? ' on' : ''}`} onClick={() => toggle(i)}>{i}</button>
        ))}
        <button type="button" className={`pd-chip${outro ? ' on' : ''}`} onClick={() => setOutro(o => !o)}>+ Outro</button>
      </div>
      {outro && (
        <input className="pd-input pd-input-block" autoFocus value={outroTxt} onChange={e => setOutroTxt(e.target.value)} placeholder="Ex.: teclado, sax, percussão" maxLength={60} />
      )}
      <button type="button" className="pd-cta" disabled={!ok} onClick={() => onSend({ integrantes: n, instrumentos: lista })}>Confirmar formação</button>
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
          <button type="button" key={c} className={`pd-chip${sel.includes(c) ? ' on' : ''}`} onClick={() => toggle(c)}>{c}</button>
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
                ? <video src={`${f.url}#t=0.5`} muted playsInline preload="metadata" />
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
          <span className="pd-drop-ico">{video ? '🎬' : '📸'}</span>
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

function DataComposer({ onSend }) {
  const [datas] = useState(proximasSextasESabados)
  const [sel, setSel] = useState(null)
  return (
    <div className="pd-compose-box">
      <div className="pd-cal" role="listbox" aria-label="Sextas e sábados disponíveis">
        {datas.map(d => {
          const iso = isoDate(d)
          return (
            <button type="button" key={iso} role="option" aria-selected={sel === iso} className={`pd-day${sel === iso ? ' on' : ''}`} onClick={() => setSel(iso)}>
              <span className="pd-day-dow">{DIAS[d.getDay()]}</span>
              <span className="pd-day-n">{d.getDate()}</span>
              <span className="pd-day-m">{MESES[d.getMonth()]}</span>
              <span className="pd-day-h">20h</span>
            </button>
          )
        })}
      </div>
      <div className="pd-cal-note">Só sextas e sábados, sempre a partir das 20h</div>
      <button type="button" className="pd-cta" disabled={!sel} onClick={() => onSend(datas.find(d => isoDate(d) === sel))}>
        {sel ? `Quero ${dataExtenso(datas.find(d => isoDate(d) === sel))}` : 'Escolha uma data'}
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

/* ─ Página ─ */

export default function Produtor() {
  const [msgs, setMsgs] = useState([])
  const [typing, setTyping] = useState(false)
  const [step, setStep] = useState(null)
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
    if (next) setStep(next)
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
      johnny(['Agora preciso do nome e do WhatsApp de quem cuida da negociação da banda.'], 'contato')
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
    // Passo 1: só local, nada é enviado ainda. O envio entra no passo 2.
    console.info('[produtor] ficha', { ...F(), videos: F().videos?.map(v => v.name), fotos: F().fotos?.map(v => v.name) })
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
          {step === 'lugares' && <LugaresComposer onSend={handlers.lugares} />}
          {step === 'videos' && <UploadComposer tipo="video" onSend={handlers.videos} onRejeita={r => rejeita('video', r)} />}
          {step === 'fotos' && <UploadComposer tipo="foto" onSend={handlers.fotos} onRejeita={r => rejeita('foto', r)} />}
          {step === 'tempo' && <ChipsComposer opcoes={TEMPOS} onSend={handlers.tempo} />}
          {step === 'contato' && <ContatoComposer onSend={handlers.contato} />}
          {step === 'data' && <DataComposer onSend={handlers.data} />}
          {step === 'aceite' && <AceiteComposer onSim={aceitar} onNao={naoConcordo} />}
        </footer>
      )}
    </div>
  )
}
