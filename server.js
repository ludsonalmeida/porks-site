import express from 'express'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync, createWriteStream } from 'fs'
import { randomBytes, timingSafeEqual } from 'crypto'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const ADMIN_PASS = process.env.ADMIN_PASS || 'porks2026'
const DATA_DIR = process.env.DATA_DIR || '/uploads'

try { mkdirSync(DATA_DIR, { recursive: true }) } catch {}

const app = express()
app.use(express.json({ limit: '25mb' }))

function readJson(file, fallback = []) {
  try {
    const p = join(DATA_DIR, file)
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'))
  } catch {}
  return fallback
}
function writeJson(file, data) {
  writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8')
}

// Hero cards
app.get('/api/hero-cards', (_req, res) => res.json(readJson('hero-cards.json', [])))
app.post('/api/hero-cards', (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: 'unauthorized' })
  const cards = req.body
  if (!Array.isArray(cards)) return res.status(400).json({ error: 'expected array' })
  writeJson('hero-cards.json', cards)
  res.json({ ok: true })
})

// Breweries
app.get('/api/breweries', (_req, res) => res.json(readJson('breweries.json', [])))
app.post('/api/breweries', (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: 'unauthorized' })
  const items = req.body
  if (!Array.isArray(items)) return res.status(400).json({ error: 'expected array' })
  writeJson('breweries.json', items)
  res.json({ ok: true })
})

// ── Johnny, produtor musical: inscrição de banda ─────────────────────────────
// Ficha + arquivos ficam no volume em /uploads/bandas/<id>/. Ao concluir, o lead
// vai pro Engine Porks (tag "Banda"); se o engine falhar, o laço reenvia depois.
const BANDAS_DIR = join(DATA_DIR, 'bandas')
const ENGINE_URL = process.env.ENGINE_URL || 'https://broadcast.sobradinhoporks.com.br'
const ENGINE_TOKEN = process.env.ENGINE_TOKEN || ''
const SITE_URL = process.env.SITE_URL || 'https://sobradinhoporks.com.br'
const MB = 1024 * 1024
const LIMITES = {
  video: { max: 5, bytes: 100 * MB, ext: ['mp4', 'mov', 'm4v', 'webm', '3gp', 'mkv', 'avi'] },
  foto: { max: 10, bytes: 15 * MB, ext: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif'] },
}
const VIDEO_DIAS = 60
try { mkdirSync(BANDAS_DIR, { recursive: true }) } catch {}

const fichaPath = id => join(BANDAS_DIR, id, 'ficha.json')
const idValido = id => /^[a-z0-9-]{10,40}$/.test(id)
function lerFicha(id) {
  if (!idValido(id)) return null
  try { return JSON.parse(readFileSync(fichaPath(id), 'utf8')) } catch { return null }
}
function salvarFicha(f) {
  writeFileSync(fichaPath(f.id), JSON.stringify(f, null, 2), 'utf8')
}
const chaveIgual = (a, b) => {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''))
  return x.length === y.length && timingSafeEqual(x, y)
}
const texto = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

// limite simples por IP: 6 inscrições por hora
const tentativas = new Map()
function ipLiberado(ip) {
  const agora = Date.now()
  const lista = (tentativas.get(ip) || []).filter(t => agora - t < 3600e3)
  if (lista.length >= 6) return false
  lista.push(agora)
  tentativas.set(ip, lista)
  return true
}

app.post('/api/bandas', (req, res) => {
  const b = req.body || {}
  if (b._hp) return res.json({ ok: true }) // honeypot
  if (!ipLiberado(req.headers['x-forwarded-for']?.split(',')[0] || req.ip)) {
    return res.status(429).json({ error: 'Muitas inscrições seguidas. Tenta de novo daqui a pouco.' })
  }
  const whatsapp = String(b.whatsapp || '').replace(/\D/g, '')
  const pp = b.tipo === 'pp'
  const diaDaSemana = iso => new Date(`${iso}T12:00:00-03:00`).getUTCDay()
  const quintas = pp ? [...new Set((Array.isArray(b.quintas) ? b.quintas : []).map(String))]
    .filter(q => /^\d{4}-\d{2}-\d{2}$/.test(q) && diaDaSemana(q) === 4).sort().slice(0, 20) : []
  const data = pp ? (quintas[0] || '') : String(b.data || '')
  const dia = new Date(`${data}T12:00:00-03:00`)
  const erros = []
  if (!texto(b.banda, 120)) erros.push('banda')
  if (texto(b.responsavel, 120).split(' ').length < 2) erros.push('responsavel')
  if (!/^\d{2}9\d{8}$/.test(whatsapp)) erros.push('whatsapp')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || isNaN(dia) || !(pp ? [4] : [5, 6]).includes(dia.getUTCDay())) erros.push('data')
  if (!b.aceite) erros.push('aceite')
  if (erros.length) return res.status(400).json({ error: 'dados inválidos', campos: erros })

  const id = `${data}-${randomBytes(6).toString('hex')}`
  const integrantes = Math.min(30, Math.max(1, parseInt(b.integrantes, 10) || 1))
  const ficha = {
    id,
    tipo: pp ? 'pp' : 'agenda',
    ...(pp ? { quintas, quintas_aprovadas: [] } : {}),
    criado_em: new Date().toISOString(),
    banda: texto(b.banda, 120),
    integrantes,
    instrumentos: (Array.isArray(b.instrumentos) ? b.instrumentos : []).map(i => texto(i, 60)).filter(Boolean).slice(0, 20),
    // estilo escolhido no Johnny já nasce preenchido no perfil público
    perfil: { estilos: [...new Set((Array.isArray(b.estilos) ? b.estilos : []).map(e => texto(e, 30)).filter(Boolean))].slice(0, 8) },
    lugares: texto(b.lugares, 600),
    tempo: texto(b.tempo, 40),
    cache: pp ? '' : texto(b.cache, 40), // privado: só admin, material interno e engine
    responsavel: texto(b.responsavel, 120),
    whatsapp,
    data,
    data_texto: texto(b.dataTexto, 60),
    aceite: texto(b.aceite, 40),
    chave_upload: randomBytes(18).toString('base64url'),
    chave_ver: randomBytes(18).toString('base64url'),
    arquivos: [],
    concluido_em: null,
    engine: null,
  }
  mkdirSync(join(BANDAS_DIR, id), { recursive: true })
  salvarFicha(ficha)
  console.log(`[bandas] nova inscrição ${id} ${ficha.banda}`)
  res.json({ id, chave: ficha.chave_upload })
})

// upload de 1 arquivo por requisição, corpo cru em streaming direto pro volume
const reservados = new Map() // id -> { video, foto } em andamento
app.put('/api/bandas/:id/arquivos', (req, res) => {
  const f = lerFicha(req.params.id)
  if (!f || !chaveIgual(req.headers['x-upload-key'], f.chave_upload)) return res.status(404).json({ error: 'inscrição não encontrada' })
  if (f.concluido_em) return res.status(409).json({ error: 'inscrição já concluída' })
  receberArquivo(req, res, f)
})
// admin sobe foto extra pro perfil (capa, foto de show…), sem o limite de 10 da banda
app.put('/api/admin/bandas/:id/arquivos', (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ error: 'unauthorized' })
  const f = lerFicha(req.params.id)
  if (!f) return res.status(404).json({ error: 'não encontrada' })
  if (req.query.tipo !== 'foto') return res.status(400).json({ error: 'só foto' })
  receberArquivo(req, res, f, 40)
})

function receberArquivo(req, res, f, maxQtd) {
  const tipo = req.query.tipo
  const lim = LIMITES[tipo]
  if (!lim) return res.status(400).json({ error: 'tipo inválido' })
  const nomeOriginal = texto(req.query.nome, 120) || 'arquivo'
  const ext = (nomeOriginal.split('.').pop() || '').toLowerCase()
  if (!lim.ext.includes(ext)) return res.status(415).json({ error: `formato .${ext} não aceito` })
  const tamanho = parseInt(req.headers['content-length'], 10)
  if (!tamanho) return res.status(411).json({ error: 'tamanho ausente' })
  if (tamanho > lim.bytes) {
    return res.status(413).json({ error: tipo === 'video' ? 'O vídeo é muito grande: tem mais de 100 MB, tem que ser menos.' : 'A foto passou de 15 MB.' })
  }
  const r = reservados.get(f.id) || { video: 0, foto: 0 }
  const max = maxQtd || lim.max
  if (f.arquivos.filter(a => a.tipo === tipo).length + r[tipo] >= max) {
    return res.status(409).json({ error: `limite de ${max} ${tipo === 'video' ? 'vídeos' : 'fotos'}` })
  }
  r[tipo]++
  reservados.set(f.id, r)
  const liberar = () => { r[tipo]--; if (!r.video && !r.foto) reservados.delete(f.id) }

  const nome = `${tipo}-${Date.now()}-${randomBytes(3).toString('hex')}.${ext}`
  const destino = join(BANDAS_DIR, f.id, nome)
  const out = createWriteStream(destino)
  let bytes = 0
  let falhou = false
  const abortar = (status, msg) => {
    if (falhou) return
    falhou = true
    liberar()
    out.destroy()
    rmSync(destino, { force: true })
    if (!res.headersSent) res.status(status).json({ error: msg })
    req.unpipe(out)
    req.resume()
  }
  req.on('data', chunk => {
    bytes += chunk.length
    if (bytes > lim.bytes) abortar(413, 'arquivo maior que o limite')
  })
  req.on('aborted', () => abortar(400, 'envio interrompido'))
  out.on('error', () => abortar(500, 'falha ao gravar'))
  out.on('finish', () => {
    if (falhou) return
    liberar()
    const atual = lerFicha(f.id)
    atual.arquivos.push({ nome, original: nomeOriginal, tipo, bytes, em: new Date().toISOString() })
    salvarFicha(atual)
    res.json({ ok: true, nome, url: `/bandas-midia/${f.id}/${nome}` })
  })
  req.pipe(out)
}

app.post('/api/bandas/:id/concluir', async (req, res) => {
  const f = lerFicha(req.params.id)
  if (!f || !chaveIgual(req.headers['x-upload-key'], f.chave_upload)) return res.status(404).json({ error: 'inscrição não encontrada' })
  if (!f.concluido_em) {
    f.concluido_em = new Date().toISOString()
    salvarFicha(f)
    console.log(`[bandas] concluída ${f.id} (${f.arquivos.length} arquivos)`)
    enviarEngine(f.id).catch(() => {})
  }
  res.json({ ok: true })
})

// ── Engine Porks ──
const tagsEngine = {} // nome da tag -> id no engine
async function engine(path, body) {
  const r = await fetch(`${ENGINE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ENGINE_TOKEN}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${path} ${r.status} ${j.error || ''}`)
  return j
}
async function enviarEngine(id) {
  const f = lerFicha(id)
  if (!f || f.engine?.lead_id) return
  if (!ENGINE_TOKEN) { console.warn('[bandas] ENGINE_TOKEN ausente, lead não enviado', id); return }
  try {
    const pp = f.tipo === 'pp'
    const tagNome = pp ? 'Plug & Play' : 'Banda'
    if (!tagsEngine[tagNome]) tagsEngine[tagNome] = (await engine('/api/tags', { name: tagNome, color: pp ? '#7B3FA0' : '#EE7F12' })).id
    const conta = t => f.arquivos.filter(a => a.tipo === t).length
    const lead = await engine('/api/leads', {
      name: f.responsavel,
      phone: `55${f.whatsapp}`,
      product: 'porks_sobradinho',
      unit: 'sobradinho',
      source: pp ? 'plug-and-play' : 'produtor-musical',
      tag_ids: [tagsEngine[tagNome]],
      metadata: {
        tipo: pp ? 'plug-and-play' : 'banda',
        ...(pp ? { quintas: (f.quintas || []).join(', ') } : {}),
        banda: f.banda,
        integrantes: f.integrantes,
        instrumentos: f.instrumentos.join(', '),
        estilos: (f.perfil?.estilos || []).join(', '),
        lugares: f.lugares,
        tempo_formacao: f.tempo,
        cache_medio: f.cache || '',
        data_show: f.data,
        data_show_texto: f.data_texto ? `${f.data_texto}, a partir das 20h` : f.data,
        consumo_banda: `R$ ${f.integrantes * 50}`,
        videos: conta('video'),
        fotos: conta('foto'),
        material: `${SITE_URL}/produtor/material/${f.id}?k=${f.chave_ver}`,
        termos_aceitos_em: f.aceite,
        inscricao_id: f.id,
      },
    })
    const atual = lerFicha(id)
    atual.engine = { lead_id: lead.id, enviado_em: new Date().toISOString() }
    salvarFicha(atual)
    console.log(`[bandas] lead ${lead.id} no engine (${f.banda})`)
  } catch (e) {
    const atual = lerFicha(id)
    atual.engine = { erro: e.message, tentativas: (atual.engine?.tentativas || 0) + 1, em: new Date().toISOString() }
    salvarFicha(atual)
    console.warn('[bandas] engine falhou', id, e.message)
  }
}

// a cada 10 min: reenvia o que falhou (ou ficou sem concluir há 30 min) e apaga vídeos com mais de 60 dias
function manutencaoBandas() {
  let ids = []
  try { ids = readdirSync(BANDAS_DIR).filter(idValido) } catch { return }
  const agora = Date.now()
  for (const id of ids) {
    const f = lerFicha(id)
    if (!f) continue
    const parado = agora - Date.parse(f.criado_em) > 30 * 60e3
    if (!f.engine?.lead_id && (f.concluido_em || parado) && (f.engine?.tentativas || 0) < 30) enviarEngine(id).catch(() => {})
    const velhos = f.status === 'aprovada' ? [] : f.arquivos.filter(a => a.tipo === 'video' && !a.apagado_em && agora - Date.parse(a.em) > VIDEO_DIAS * 864e5)
    if (velhos.length) {
      for (const a of velhos) {
        rmSync(join(BANDAS_DIR, id, a.nome), { force: true })
        a.apagado_em = new Date().toISOString()
      }
      salvarFicha(f)
      console.log(`[bandas] ${velhos.length} vídeo(s) de ${id} apagados (${VIDEO_DIAS} dias)`)
    }
  }
}
setInterval(manutencaoBandas, 10 * 60e3)
setTimeout(manutencaoBandas, 60e3)

// ── Perfil público da banda ──
const slugify = s => normaliza(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'banda'
// slug fixo por banda, gravado na ficha na primeira vez que alguém pede
function garantirSlug(f, todas) {
  if (f.slug) return f.slug
  const usados = new Set((todas || todasFichas()).filter(x => x.id !== f.id && x.slug).map(x => x.slug))
  const base = slugify(f.banda)
  let slug = base
  for (let n = 2; usados.has(slug); n++) slug = `${base}-${n}`
  f.slug = slug
  salvarFicha(f)
  return slug
}
const midiaUrl = (f, a) => `/bandas-midia/${f.id}/${a.nome}`
const PERFIL_VAZIO = { sobre: '', cidade: '', estilos: [], instagram: '', youtube: '', spotify: '', capa: '', avatar: '', shows: [] }
function perfilDe(f) {
  return { ...PERFIL_VAZIO, ...(f.perfil || {}) }
}
function limparPerfil(p, f) {
  const nomes = new Set(f.arquivos.filter(a => a.tipo === 'foto' && !a.apagado_em).map(a => a.nome))
  const rede = v => texto(v, 200).replace(/^@/, '')
  return {
    sobre: String(p.sobre ?? '').trim().slice(0, 1500),
    cidade: texto(p.cidade, 80),
    estilos: (Array.isArray(p.estilos) ? p.estilos : []).map(e => texto(e, 30)).filter(Boolean).slice(0, 8),
    instagram: rede(p.instagram),
    youtube: texto(p.youtube, 200),
    spotify: texto(p.spotify, 200),
    capa: nomes.has(p.capa) ? p.capa : '',
    avatar: nomes.has(p.avatar) ? p.avatar : '',
    shows: (Array.isArray(p.shows) ? p.shows : [])
      .filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x?.data))
      .map(x => ({ data: x.data, titulo: texto(x.titulo, 80) }))
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 100),
  }
}
// só o que pode ir pro público: nada de responsável, WhatsApp, status ou observação
function publicoDe(f) {
  const perfil = perfilDe(f)
  const fotos = f.arquivos.filter(a => a.tipo === 'foto' && !a.apagado_em)
  const capa = fotos.find(a => a.nome === perfil.capa) || fotos[0]
  const avatar = fotos.find(a => a.nome === perfil.avatar) || capa
  return {
    slug: f.slug,
    banda: f.banda,
    integrantes: f.integrantes,
    instrumentos: f.instrumentos,
    lugares: f.lugares && !/^ainda não/i.test(f.lugares) ? f.lugares.split(',').map(x => x.trim()).filter(Boolean) : [],
    tempo: f.tempo,
    desde: f.criado_em,
    sobre: perfil.sobre, cidade: perfil.cidade, estilos: perfil.estilos,
    instagram: perfil.instagram, youtube: perfil.youtube, spotify: perfil.spotify,
    shows: (() => {
      const vistos = new Set(perfil.shows.map(x => x.data))
      return [...perfil.shows, ...showsGoogleDa(f).filter(x => !vistos.has(x.data))].sort((a, b) => b.data.localeCompare(a.data))
    })(),
    capa: capa ? midiaUrl(f, capa) : null,
    avatar: avatar ? midiaUrl(f, avatar) : null,
    fotos: fotos.map(a => ({ url: midiaUrl(f, a), nome: a.nome })),
    videos: f.arquivos.filter(a => a.tipo === 'video' && !a.apagado_em).map(a => ({ url: midiaUrl(f, a), nome: a.nome })),
    avaliacoes: { media: 0, total: 0, itens: [] }, // mecanismo de avaliação entra depois
  }
}
function fichaPorSlug(slug) {
  const todas = todasFichas()
  for (const f of todas) garantirSlug(f, todas)
  return todas.find(f => f.slug === slug && f.tipo !== 'pp') || null
}

// ── Google Agenda do Porks (fonte oficial de quem toca em cada noite) ──
// O endereço secreto (.ics) é colado no admin e fica só no servidor. Cada evento = uma banda.
// O CACHÊ vem no título ("Banda - R$1000") e é DESCARTADO na leitura: nunca é gravado nem exibido.
const AGENDA_CFG = 'agenda-config.json'
const AGENDA_CACHE = 'agenda-google.json'
let agendaGoogle = readJson(AGENDA_CACHE, { atualizada_em: null, eventos: [], erro: null })

const icsDesfaz = v => String(v || '').replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1').trim()
// "Velho Olho Vermelho- R$1000" -> banda; "Strangways - Especial The Smiths R$1000" -> banda + tema
function separarTitulo(sumario) {
  const limpo = icsDesfaz(sumario)
    .replace(/\s*[-–—:|]?\s*R?\$\s*[\d.]+(?:,\d{1,2})?/gi, '') // cachê com R$ ou $
    .replace(/\s+/g, ' ').replace(/[\s\-–—:|]+$/, '').trim()
    // cachê sem símbolo no fim ("Overflow 800"); "anos 2000" e "Blink 182" ficam
    .replace(/(?<!\banos\s*)\s*[-–—]?\s*(\d{3,4})(?:,\d{2})?$/i, (m, n) => (+n >= 300 && +n <= 5000 ? '' : m))
    .replace(/[\s\-–—:|]+$/, '').trim()
  const m = limpo.match(/^(.+?)\s+[-–—]\s+(.+)$/)
  return m ? { banda: m[1].trim(), tema: m[2].trim() } : { banda: limpo, tema: '' }
}
// DTSTART em UTC (Z), com TZID ou dia inteiro -> data e hora de Brasília
function dataBrasilia(linha) {
  const m = linha.match(/^DTSTART([^:]*):(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?/)
  if (!m) return null
  const [, params, a, me, d, h, mi, , z] = m
  if (!h) return { data: `${a}-${me}-${d}`, hora: null }
  if (z) {
    const brt = new Date(Date.UTC(+a, +me - 1, +d, +h, +mi) - 3 * 3600e3)
    return { data: brt.toISOString().slice(0, 10), hora: brt.toISOString().slice(11, 16) }
  }
  // TZID=America/Sao_Paulo (ou sem fuso): já é hora local
  void params
  return { data: `${a}-${me}-${d}`, hora: `${h}:${mi}` }
}
function lerIcs(texto) {
  const corpo = String(texto).replace(/\r?\n[ \t]/g, '')
  const eventos = []
  for (const bloco of corpo.split('BEGIN:VEVENT').slice(1)) {
    const campo = k => (bloco.match(new RegExp(`^${k}[^:\\n]*:(.*)$`, 'm')) || [])[1] || ''
    if (/CANCELLED/i.test(campo('STATUS'))) continue
    const ini = (bloco.match(/^DTSTART[^\n]*$/m) || [])[0]
    const quando = ini && dataBrasilia(ini.trim())
    const { banda, tema } = separarTitulo(campo('SUMMARY'))
    if (!quando || !banda) continue
    eventos.push({ uid: campo('UID').trim().slice(0, 120), data: quando.data, hora: quando.hora, banda: banda.slice(0, 120), tema: tema.slice(0, 120) })
  }
  eventos.sort((x, y) => x.data.localeCompare(y.data) || (x.hora || '').localeCompare(y.hora || ''))
  return eventos
}
async function sincronizarAgenda() {
  const cfg = readJson(AGENDA_CFG, {})
  if (!cfg.url) return agendaGoogle
  try {
    const r = await fetch(cfg.url, { signal: AbortSignal.timeout(20000) })
    if (!r.ok) throw new Error(`Google respondeu ${r.status}`)
    const texto = await r.text()
    if (!texto.includes('BEGIN:VCALENDAR')) throw new Error('o link não é de uma agenda (.ics)')
    agendaGoogle = { atualizada_em: new Date().toISOString(), eventos: lerIcs(texto), erro: null }
  } catch (e) {
    agendaGoogle = { ...agendaGoogle, erro: e.message, tentou_em: new Date().toISOString() }
    console.warn('[agenda] falha ao ler o Google Agenda:', e.message)
  }
  writeJson(AGENDA_CACHE, agendaGoogle)
  return agendaGoogle
}
setInterval(() => { sincronizarAgenda().catch(() => {}) }, 10 * 60e3)
setTimeout(() => { sincronizarAgenda().catch(() => {}) }, 5e3)

// banda do Google ↔ ficha cadastrada (mesmo nome, sem acento/caixa)
const chaveNome = n => normaliza(n).replace(/[^a-z0-9]+/g, '')
function fichaDoNome(nome, todas) {
  const k = chaveNome(nome)
  return k ? todas.find(f => f.tipo !== 'pp' && chaveNome(f.banda) === k) || null : null
}
function showsGoogleDa(f) {
  const k = chaveNome(f.banda)
  return agendaGoogle.eventos.filter(e => chaveNome(e.banda) === k).map(e => ({ data: e.data, titulo: e.tema }))
}

// agenda: qual banda tocou (ou vai tocar) em cada noite: Google Agenda + "Shows no Porks" do perfil.
// ?data=AAAA-MM-DD (uma noite) ou ?de=&ate= (intervalo). Público: só nome, slug e foto.
app.get('/api/bandas/agenda', (req, res) => {
  const dia = /^\d{4}-\d{2}-\d{2}$/
  const de = String(req.query.data || req.query.de || '')
  const ate = String(req.query.data || req.query.ate || de)
  if (!dia.test(de) || !dia.test(ate)) return res.status(400).json({ error: 'use ?data=AAAA-MM-DD ou ?de=&ate=' })
  res.set('Cache-Control', 'public, max-age=300').json(agendaEntre(de, ate))
})

function agendaEntre(de, ate) {
  const todas = todasFichas()
  const out = []
  const visto = new Set()
  const comFicha = (f, data, titulo, hora, fonte) => {
    const p = publicoDe({ ...f, slug: garantirSlug(f, todas) })
    return { data, hora, titulo, slug: p.slug, banda: p.banda, avatar: p.avatar ? `${SITE_URL}${p.avatar}` : null, link: `${SITE_URL}/bandas/${p.slug}`, fonte }
  }
  for (const e of agendaGoogle.eventos) {
    if (e.data < de || e.data > ate) continue
    const f = fichaDoNome(e.banda, todas)
    out.push(f ? comFicha(f, e.data, e.tema, e.hora, 'google')
      : { data: e.data, hora: e.hora, titulo: e.tema, slug: null, banda: e.banda, avatar: null, link: null, fonte: 'google' })
    visto.add(`${e.data}|${chaveNome(e.banda)}`)
  }
  for (const f of todas) {
    for (const s of perfilDe(f).shows) {
      if (s.data < de || s.data > ate || visto.has(`${s.data}|${chaveNome(f.banda)}`)) continue
      out.push(comFicha(f, s.data, s.titulo, null, 'perfil'))
    }
  }
  out.sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || '') || a.banda.localeCompare(b.banda))
  return out
}

// Plug & Play: músicos já aprovados em cada quinta (pro Johnny mostrar vagas/lotada)
const PP_MAX_MUSICOS = 10
function musicosAprovadosNaQuinta(todas) {
  const conta = {}
  for (const f of todas) {
    if (f.tipo !== 'pp') continue
    for (const q of f.quintas_aprovadas || []) conta[q] = (conta[q] || 0) + (f.integrantes || 1)
  }
  return conta
}
app.get('/api/bandas/quintas', (req, res) => {
  const dia = /^\d{4}-\d{2}-\d{2}$/
  const de = String(req.query.de || ''), ate = String(req.query.ate || '')
  if (!dia.test(de) || !dia.test(ate)) return res.status(400).json({ error: 'use ?de=&ate=' })
  const conta = musicosAprovadosNaQuinta(todasFichas())
  const out = Object.entries(conta).filter(([d]) => d >= de && d <= ate)
    .map(([data, aprovados]) => ({ data, aprovados, lotada: aprovados >= PP_MAX_MUSICOS }))
  res.set('Cache-Control', 'no-store').json(out)
})

// datas já com banda (pro calendário do Johnny): só a data, sem nome nem cachê
app.get('/api/bandas/ocupadas', (req, res) => {
  const dia = /^\d{4}-\d{2}-\d{2}$/
  const de = String(req.query.de || ''), ate = String(req.query.ate || '')
  if (!dia.test(de) || !dia.test(ate)) return res.status(400).json({ error: 'use ?de=&ate=' })
  res.set('Cache-Control', 'public, max-age=300').json([...new Set(agendaEntre(de, ate).map(x => x.data))])
})

app.get('/api/bandas/publico/:slug', (req, res) => {
  const f = fichaPorSlug(String(req.params.slug))
  if (!f) return res.status(404).json({ error: 'banda não encontrada' })
  res.json(publicoDe(f))
})
app.get('/bandas-midia/:id/:arquivo', (req, res) => {
  const f = lerFicha(req.params.id)
  const a = f?.arquivos.find(x => x.nome === req.params.arquivo && !x.apagado_em)
  if (!a) return res.status(404).send('Não encontrado')
  res.set('Cache-Control', 'public, max-age=86400')
  res.sendFile(join(BANDAS_DIR, f.id, a.nome))
})
// HTML da página da banda com título e preview (WhatsApp/Instagram leem isso antes do React)
app.get('/bandas/:slug', (req, res, next) => {
  const f = fichaPorSlug(String(req.params.slug))
  let html
  try { html = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf8') } catch { return next() }
  if (!f) return res.status(404).send(html)
  const p = publicoDe(f)
  const titulo = `${p.banda} · banda no Porks Sobradinho`
  const desc = (p.sobre || `${p.integrantes} integrantes${p.estilos.length ? ` · ${p.estilos.join(', ')}` : ''}. Veja fotos, vídeos e avaliações da banda.`).slice(0, 200)
  const img = p.capa ? `${SITE_URL}${p.capa}` : `${SITE_URL}/images/logo-porks.png`
  const meta = `<title>${esc(titulo)}</title>
    <meta name="description" content="${esc(desc)}" />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content="${esc(titulo)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:image" content="${esc(img)}" />
    <meta property="og:url" content="${SITE_URL}/bandas/${p.slug}" />
    <meta name="twitter:card" content="summary_large_image" />`
  res.send(html.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace('</head>', `${meta}\n</head>`))
})

// ── Admin: ligar o Google Agenda ──
const ICS_OK = /^https:\/\/calendar\.google\.com\/calendar\/ical\/[^/\s]+\/[^/\s]+\/basic\.ics$/
const mascararIcs = u => u.replace(/(private-)[a-f0-9]+/i, '$1••••••').replace(/\/ical\/([^/]+)\//, (_, c) => `/ical/${decodeURIComponent(c)}/`)
function estadoAgenda() {
  const cfg = readJson(AGENDA_CFG, {})
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10)
  return {
    ligada: !!cfg.url,
    endereco: cfg.url ? mascararIcs(cfg.url) : null,
    publico: cfg.url ? !/\/private-/.test(cfg.url) : false,
    atualizada_em: agendaGoogle.atualizada_em,
    erro: agendaGoogle.erro || null,
    eventos: agendaGoogle.eventos.length,
    proximos: agendaGoogle.eventos.filter(e => e.data >= hoje).length,
  }
}
app.get('/api/admin/agenda', (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ error: 'unauthorized' })
  res.json(estadoAgenda())
})
app.post('/api/admin/agenda', async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ error: 'unauthorized' })
  const url = String(req.body?.url || '').trim()
  if (!ICS_OK.test(url)) return res.status(400).json({ error: 'Esse não parece o endereço iCal do Google Agenda. Ele começa com https://calendar.google.com/calendar/ical/ e termina em basic.ics.' })
  if (/holiday|feriado/i.test(url)) return res.status(400).json({ error: 'Esse é o endereço da agenda de feriados, não a do Porks.' })
  const antes = readJson(AGENDA_CFG, {})
  writeJson(AGENDA_CFG, { url, ligada_em: new Date().toISOString() })
  const r = await sincronizarAgenda()
  if (r.erro) {
    writeJson(AGENDA_CFG, antes)
    return res.status(400).json({ error: `Não consegui ler essa agenda: ${r.erro}` })
  }
  res.json(estadoAgenda())
})
app.post('/api/admin/agenda/atualizar', async (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ error: 'unauthorized' })
  await sincronizarAgenda()
  res.json(estadoAgenda())
})
app.delete('/api/admin/agenda', (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ error: 'unauthorized' })
  writeJson(AGENDA_CFG, {})
  agendaGoogle = { atualizada_em: null, eventos: [], erro: null }
  writeJson(AGENDA_CACHE, agendaGoogle)
  res.json(estadoAgenda())
})

// ── Admin: aba Bandas ──
const STATUS_BANDA = ['nova', 'conversa', 'aprovada', 'recusada']
const adminOk = req => chaveIgual(req.headers['x-admin-pass'], ADMIN_PASS)
const normaliza = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
function todasFichas() {
  let ids = []
  try { ids = readdirSync(BANDAS_DIR).filter(idValido) } catch { return [] }
  return ids.map(lerFicha).filter(Boolean)
}
function resumo(f) {
  const ativos = f.arquivos.filter(a => !a.apagado_em)
  return {
    id: f.id, banda: f.banda, responsavel: f.responsavel, whatsapp: f.whatsapp,
    data: f.data, data_texto: f.data_texto, integrantes: f.integrantes,
    criado_em: f.criado_em, concluido: !!f.concluido_em,
    tipo: f.tipo === 'pp' ? 'pp' : 'agenda', quintas: f.quintas || [], quintas_aprovadas: f.quintas_aprovadas || [],
    status: f.status || 'nova',
    videos: ativos.filter(a => a.tipo === 'video').length,
    fotos: ativos.filter(a => a.tipo === 'foto').length,
  }
}

app.get('/api/admin/bandas', (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ error: 'unauthorized' })
  const por = Math.min(50, Math.max(5, parseInt(req.query.por, 10) || 20))
  const q = normaliza(req.query.q).trim()
  const qDig = q.replace(/\D/g, '')
  const status = STATUS_BANDA.includes(req.query.status) ? req.query.status : null
  const tipo = ['agenda', 'pp'].includes(req.query.tipo) ? req.query.tipo : null
  const ordem = req.query.ordem === 'show' ? 'show' : 'recentes'
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10)

  let lista = todasFichas().map(resumo)
  if (q) {
    lista = lista.filter(b => normaliza(`${b.banda} ${b.responsavel}`).includes(q) || (qDig.length >= 4 && b.whatsapp.includes(qDig)))
  }
  const tipos = { agenda: lista.filter(b => b.tipo === 'agenda').length, pp: lista.filter(b => b.tipo === 'pp').length }
  if (tipo) lista = lista.filter(b => b.tipo === tipo)
  const contagem = { todas: lista.length, tipos }
  for (const s of STATUS_BANDA) contagem[s] = lista.filter(b => b.status === s).length
  if (status) lista = lista.filter(b => b.status === status)
  if (ordem === 'show') {
    // próximos shows primeiro, datas passadas no fim
    lista.sort((a, b) => (a.data < hoje) - (b.data < hoje) || (a.data < hoje ? b.data.localeCompare(a.data) : a.data.localeCompare(b.data)))
  } else {
    lista.sort((a, b) => b.criado_em.localeCompare(a.criado_em))
  }
  const total = lista.length
  const paginas = Math.max(1, Math.ceil(total / por))
  const pagina = Math.min(paginas, Math.max(1, parseInt(req.query.pagina, 10) || 1))
  res.json({ itens: lista.slice((pagina - 1) * por, pagina * por), total, pagina, paginas, por, contagem })
})

app.get('/api/admin/bandas/:id', (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ error: 'unauthorized' })
  const f = lerFicha(req.params.id)
  if (!f) return res.status(404).json({ error: 'não encontrada' })
  const k = encodeURIComponent(f.chave_ver)
  res.json({
    ...resumo(f),
    instrumentos: f.instrumentos, lugares: f.lugares, tempo: f.tempo, aceite: f.aceite, cache: f.cache || '',
    nota: f.nota || '', status_em: f.status_em || null,
    engine_lead_id: f.engine?.lead_id || null,
    material: `/produtor/material/${f.id}?k=${k}`,
    slug: garantirSlug(f),
    perfil: perfilDe(f),
    vagas_quintas: f.tipo === 'pp' ? (() => {
      const conta = musicosAprovadosNaQuinta(todasFichas().filter(x => x.id !== f.id))
      return Object.fromEntries((f.quintas || []).map(q => [q, conta[q] || 0]))
    })() : null,
    publico: (garantirSlug(f), publicoDe(f)),
    arquivos: f.arquivos.map(a => ({
      tipo: a.tipo, original: a.original, bytes: a.bytes, em: a.em, apagado_em: a.apagado_em || null,
      nome: a.nome,
      url: a.apagado_em ? null : midiaUrl(f, a),
    })),
  })
})

app.patch('/api/admin/bandas/:id', (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ error: 'unauthorized' })
  const f = lerFicha(req.params.id)
  if (!f) return res.status(404).json({ error: 'não encontrada' })
  const { status, nota, perfil, banda, quintas_aprovadas } = req.body || {}
  if (quintas_aprovadas !== undefined && f.tipo === 'pp') {
    const pedidas = new Set(f.quintas || [])
    const novas = [...new Set((Array.isArray(quintas_aprovadas) ? quintas_aprovadas : []).map(String))].filter(q => pedidas.has(q)).sort()
    // trava de 10 músicos por quinta (sem contar esta inscrição)
    const conta = musicosAprovadosNaQuinta(todasFichas().filter(x => x.id !== f.id))
    const estoura = novas.filter(q => (conta[q] || 0) + (f.integrantes || 1) > PP_MAX_MUSICOS && !(f.quintas_aprovadas || []).includes(q))
    if (estoura.length) return res.status(409).json({ error: `Não cabe: com essa inscrição, a quinta ${estoura.map(q => q.split('-').reverse().slice(0, 2).join('/')).join(', ')} passaria de ${PP_MAX_MUSICOS} músicos aprovados.` })
    f.quintas_aprovadas = novas
  }
  if (perfil !== undefined) f.perfil = limparPerfil(perfil || {}, f)
  if (banda !== undefined && texto(banda, 120)) f.banda = texto(banda, 120)
  if (status !== undefined) {
    if (!STATUS_BANDA.includes(status)) return res.status(400).json({ error: 'status inválido' })
    if (status !== (f.status || 'nova')) { f.status = status; f.status_em = new Date().toISOString() }
  }
  if (nota !== undefined) f.nota = String(nota).slice(0, 2000)
  salvarFicha(f)
  res.json({ ok: true, status: f.status || 'nova', status_em: f.status_em || null, nota: f.nota || '', perfil: perfilDe(f), banda: f.banda, publico: publicoDe(f), quintas_aprovadas: f.quintas_aprovadas || [] })
})

// página do material pra equipe (link vai no lead do engine)
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
app.get('/produtor/material/:id/:arquivo', (req, res) => {
  const f = lerFicha(req.params.id)
  if (!f || !chaveIgual(req.query.k, f.chave_ver)) return res.status(404).send('Não encontrado')
  const a = f.arquivos.find(x => x.nome === req.params.arquivo && !x.apagado_em)
  if (!a) return res.status(404).send('Não encontrado')
  res.sendFile(join(BANDAS_DIR, f.id, a.nome))
})
app.get('/produtor/material/:id', (req, res) => {
  const f = lerFicha(req.params.id)
  if (!f || !chaveIgual(req.query.k, f.chave_ver)) return res.status(404).send('Não encontrado')
  const k = encodeURIComponent(req.query.k)
  const url = a => `/produtor/material/${f.id}/${a.nome}?k=${k}`
  const videos = f.arquivos.filter(a => a.tipo === 'video')
  const fotos = f.arquivos.filter(a => a.tipo === 'foto' && !a.apagado_em)
  const perfil = perfilDe(f)
  const capa = fotos.find(a => a.nome === perfil.capa) || fotos[0]
  const avatar = fotos.find(a => a.nome === perfil.avatar) || capa
  const slug = garantirSlug(f)
  const status = { nova: 'Nova', conversa: 'Em conversa', aprovada: 'Aprovada', recusada: 'Recusada' }[f.status || 'nova']
  const brt = iso => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const dia = new Date(`${f.data}T12:00:00-03:00`)
  const diaTxt = `${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dia.getUTCDay()]}, ${dia.getUTCDate()} de ${['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][dia.getUTCMonth()]}`
  const passou = f.data < new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10)
  const fone = f.whatsapp.replace(/(\d{2})(\d)(\d{4})(\d{4})/, '($1) $2 $3-$4')
  const zap = `https://wa.me/55${f.whatsapp}?text=${encodeURIComponent(`Fala, ${f.responsavel.split(' ')[0]}! Aqui é do Porks Sobradinho, sobre a inscrição da banda ${f.banda}.`)}`
  const mb = b => (b < 1048576 ? `${Math.round(b / 1024)} KB` : `${(b / 1048576).toFixed(1).replace('.', ',')} MB`)
  const lugares = f.lugares && !/^ainda não/i.test(f.lugares) ? f.lugares.split(',').map(x => x.trim()).filter(Boolean) : []
  const ini = f.banda.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
  const I = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
  const ic = {
    zap: I('<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a3.5 3.5 0 0 1-2-2l1-1-1-2z"/>'),
    admin: I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h8"/>'),
    ext: I('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    cal: I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    gente: I('<circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1"/><path d="M16 5a3 3 0 0 1 0 6M21 20v-1a5 5 0 0 0-3-4.6"/>'),
    chope: I('<path d="M6 8h9v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M15 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><path d="M6 8a3 3 0 0 1 3-4 3 3 0 0 1 5 0 2.5 2.5 0 0 1 1 4"/>'),
    relogio: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    palco: I('<path d="M3 20h18M5 20V9l7-5 7 5v11"/><path d="M9 20v-5h6v5"/>'),
    check: I('<path d="m5 12 5 5 9-10"/>'),
    video: I('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>'),
    foto: I('<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>'),
    baixar: I('<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>'),
    cadeado: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    nota: I('<path d="M4 5h16v11H9l-5 4z"/>'),
  }
  const dado = (icone, rotulo, valor, extra = '') => `<div class="dado">${icone}<div><small>${rotulo}</small><b>${valor}</b>${extra}</div></div>`

  res.set('X-Robots-Tag', 'noindex').send(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(f.banda)} · material da banda · Porks</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--fundo:#F3E6CC;--card:#FFFBF2;--tinta:#2C1C0D;--mudo:#6F5230;--linha:rgba(44,28,13,.12);--amb:#D9700F;--yel:#FFC21A;--red:#C92A20;--escuro:#22160A;
  --nova:#b85c00;--conversa:#1f5f8b;--aprovada:#2e7d32;--recusada:#a8322a;--sombra:0 1px 2px rgba(44,28,13,.08),0 6px 18px rgba(44,28,13,.08)}
*{box-sizing:border-box}
body{margin:0;font:16px/1.5 'Barlow',system-ui,sans-serif;background:var(--fundo);color:var(--tinta)}
a{color:inherit}
:focus-visible{outline:2.5px solid var(--amb);outline-offset:2px}
svg{width:20px;height:20px;flex:none}
.topo{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:12px;height:60px;padding:0 16px;background:var(--escuro);border-bottom:3px solid var(--red);color:#FFFBF2}
.topo img{height:38px}
.selo{display:inline-flex;align-items:center;gap:6px;margin-left:auto;padding:5px 12px;border-radius:16px;background:rgba(255,194,26,.14);color:var(--yel);font:700 .78rem 'Barlow',sans-serif;letter-spacing:.08em;text-transform:uppercase}
.selo svg{width:15px;height:15px}
main{max-width:920px;margin:0 auto;padding:0 0 56px}
.cabeca{background:var(--card);box-shadow:var(--sombra)}
.capa{position:relative;height:clamp(170px,30vw,280px);background:var(--escuro);overflow:hidden}
.capa img{width:100%;height:100%;object-fit:cover;display:block}
.capa::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,.45))}
.capa-vazia{height:100%;display:grid;place-items:center;background:radial-gradient(circle at 25% 30%,rgba(255,194,26,.35),transparent 55%),radial-gradient(circle at 80% 70%,rgba(201,42,32,.45),transparent 55%),var(--escuro)}
.capa-vazia span{font:400 clamp(2.4rem,9vw,5rem)/1 'Bebas Neue',sans-serif;letter-spacing:.06em;color:rgba(255,251,242,.16);text-align:center;padding:0 20px}
.id{display:flex;align-items:flex-start;gap:16px;padding:0 20px;margin-top:-48px;position:relative}
.avatar{flex:none;width:108px;height:108px;border-radius:50%;overflow:hidden;border:4px solid var(--card);background:var(--amb);box-shadow:0 4px 12px rgba(0,0,0,.2);display:grid;place-items:center}
.avatar img{width:100%;height:100%;object-fit:cover}
.avatar span{font:400 2.5rem 'Bebas Neue',sans-serif;color:#fff}
.id-txt{min-width:0;padding-top:56px}
h1{margin:0;font:400 clamp(2rem,6vw,2.8rem)/1 'Bebas Neue',sans-serif;letter-spacing:.04em;overflow-wrap:anywhere}
.sub{margin:6px 0 0;color:var(--mudo);font-size:.95rem}
.status{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:3px 12px;border-radius:14px;font-weight:700;font-size:.85rem;background:color-mix(in srgb,var(--c) 13%,transparent);color:var(--c)}
.status i{width:8px;height:8px;border-radius:50%;background:var(--c)}
.st-nova{--c:var(--nova)}.st-conversa{--c:var(--conversa)}.st-aprovada{--c:var(--aprovada)}.st-recusada{--c:var(--recusada)}
.acoes{display:flex;flex-wrap:wrap;gap:10px;padding:18px 20px 20px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 18px;border-radius:23px;text-decoration:none;font-weight:700;border:1.5px solid var(--linha);background:#fff;color:var(--tinta);transition:transform .15s,background .15s}
.btn:active{transform:scale(.97)}
.btn:hover{border-color:var(--amb)}
.btn-zap{background:#1f8a4c;border-color:#1f8a4c;color:#fff;flex:1 1 260px}
.btn-zap:hover{background:#18743f}
.grade{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:16px}
.card{background:var(--card);border-radius:16px;box-shadow:var(--sombra);padding:18px}
.card.largo{grid-column:1/-1}
h2{display:flex;align-items:center;gap:8px;margin:0 0 14px;font:400 1.35rem/1 'Bebas Neue',sans-serif;letter-spacing:.06em}
h2 svg{color:var(--amb)}
h2 .n{margin-left:2px;padding:1px 9px;border-radius:12px;background:var(--fundo);font:700 .8rem 'Barlow',sans-serif;letter-spacing:0}
.dados{display:flex;flex-direction:column;gap:14px}
.dado{display:flex;gap:12px;align-items:flex-start}
.dado > svg{color:var(--amb);margin-top:3px}
.dado small{display:block;font-size:.82rem;color:var(--mudo)}
.dado b{font-weight:600}
.dado .extra{display:block;font-size:.85rem;color:var(--mudo);font-weight:500}
.dado .tag-passou{color:var(--recusada)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.chip{padding:4px 12px;border-radius:16px;border:1px solid var(--linha);background:#fff;font-size:.88rem}
.nota{margin:0;padding:12px 14px;border-radius:12px;background:#FFF0C7;white-space:pre-line}
.mudo{margin:0;color:var(--mudo)}
.aviso{display:flex;gap:8px;align-items:flex-start;margin:0 16px;padding:12px 14px;border-radius:12px;background:#fbe3df;color:var(--recusada);font-weight:600}
.videos{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.video video{display:block;width:100%;aspect-ratio:16/9;background:#000;border-radius:12px}
.legenda{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:6px;font-size:.85rem;color:var(--mudo)}
.legenda span{overflow-wrap:anywhere}
.baixar{display:grid;place-items:center;width:44px;height:44px;flex:none;border-radius:50%;border:1.5px solid var(--linha);background:#fff;color:var(--tinta)}
.baixar:hover{border-color:var(--amb)}
.apagado{padding:14px;border-radius:12px;border:1.5px dashed var(--linha);color:var(--mudo);font-size:.9rem}
.fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}
.foto{position:relative;margin:0;aspect-ratio:1;border-radius:12px;overflow:hidden;background:var(--escuro)}
.foto img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s}
.foto a.ver:hover img{transform:scale(1.04)}
.foto .baixar{position:absolute;right:8px;bottom:8px;background:rgba(255,251,242,.94)}
.rodape{margin:8px 16px 0;padding:14px 16px;border-radius:16px;background:var(--escuro);color:#FFFBF2;display:flex;align-items:center;gap:14px}
.rodape img{width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--yel)}
.rodape b{display:block;font:400 1.25rem/1.1 'Bebas Neue',sans-serif;letter-spacing:.05em;color:var(--yel)}
.rodape span{font-size:.9rem;opacity:.85}
@media (min-width:760px){main{padding:24px 16px 64px}.cabeca{border-radius:16px;overflow:hidden}.grade{padding:16px 0}.rodape{margin:8px 0 0}.aviso{margin:0}}
@media (max-width:640px){.grade{grid-template-columns:1fr}.id{flex-direction:column;gap:10px;margin-top:-54px}.id-txt{padding-top:0}.btn{flex:1 1 auto}}
@media (prefers-reduced-motion:reduce){.foto img,.btn{transition:none}}
</style></head><body>
<header class="topo">
  <a href="/" aria-label="Porks Sobradinho"><img src="/images/logo-porks.png" alt="Porks Sobradinho"></a>
  <span class="selo">${ic.cadeado}Material interno</span>
</header>
<main>
  <section class="cabeca">
    <div class="capa">${capa ? `<img src="${url(capa)}" alt="">` : `<div class="capa-vazia"><span>${esc(f.banda)}</span></div>`}</div>
    <div class="id">
      <div class="avatar">${avatar ? `<img src="${url(avatar)}" alt="Foto da banda ${esc(f.banda)}">` : `<span>${esc(ini)}</span>`}</div>
      <div class="id-txt">
        <h1>${esc(f.banda)}</h1>
        <p class="sub">Inscrição pelo Johnny em ${esc(brt(f.criado_em))}</p>
        <span class="status st-${f.status || 'nova'}"><i></i>${status}</span>
      </div>
    </div>
    <div class="acoes">
      <a class="btn btn-zap" href="${zap}" target="_blank" rel="noopener noreferrer">${ic.zap}Chamar ${esc(f.responsavel.split(' ')[0])} no WhatsApp</a>
      <a class="btn" href="/admin#bandas?id=${encodeURIComponent(f.id)}" target="_blank" rel="noopener noreferrer">${ic.admin}Abrir no admin</a>
      ${f.tipo === 'pp' ? '' : `<a class="btn" href="/bandas/${esc(slug)}" target="_blank" rel="noopener noreferrer">${ic.ext}Página pública</a>`}
    </div>
  </section>

  <div class="grade">
    <section class="card">
      <h2>${ic.cal}Negociação</h2>
      <div class="dados">
        ${dado(ic.gente, 'Responsável', esc(f.responsavel), `<span class="extra">${fone}</span>`)}
        ${f.tipo === 'pp'
    ? dado(ic.cal, 'Plug & Play · quintas pedidas', esc((f.quintas || []).map(q => q.split('-').reverse().slice(0, 2).join('/')).join(', ')), '<span class="extra">das 19h às 23h50 · R$ 50 de bônus no dia, sem cachê</span>')
    : dado(ic.cal, 'Data pedida', `${diaTxt}, 20h`, passou ? '<span class="extra tag-passou">Essa data já passou</span>' : '')}
        ${f.tipo === 'pp' ? '' : dado(ic.chope, 'Consumo da banda', `R$ ${f.integrantes * 50}`, `<span class="extra">${f.integrantes} músicos × R$ 50 no Clube do Chope</span>`)}
        ${dado(ic.check, 'Termos da casa', f.aceite ? 'Aceitos' : 'Não aceitos', f.aceite ? `<span class="extra">em ${esc(brt(f.aceite))}</span>` : '')}
      </div>
    </section>

    <section class="card">
      <h2>${ic.gente}A banda</h2>
      <div class="dados">
        <div class="dado">${ic.gente}<div><small>Formação</small><b>${f.integrantes} ${f.integrantes === 1 ? 'integrante' : 'integrantes'}</b>
          ${f.instrumentos.length ? `<div class="chips">${f.instrumentos.map(i => `<span class="chip">${esc(i)}</span>`).join('')}</div>` : ''}</div></div>
        ${dado(ic.relogio, 'Tempo de banda', esc(f.tempo || 'Não informado'))}
        ${f.cache ? dado(ic.chope, 'Cachê médio que cobra', esc(f.cache)) : ''}
        <div class="dado">${ic.palco}<div><small>Já tocou em</small>
          ${lugares.length ? `<div class="chips">${lugares.map(l => `<span class="chip">${esc(l)}</span>`).join('')}</div>` : '<b>Ainda não tocou em nenhuma casa</b>'}</div></div>
      </div>
    </section>

    ${f.nota ? `<section class="card largo"><h2>${ic.nota}Observação da equipe</h2><p class="nota">${esc(f.nota)}</p></section>` : ''}

    <section class="card largo">
      <h2>${ic.video}Vídeos <span class="n">${videos.filter(a => !a.apagado_em).length}</span></h2>
      ${videos.length ? `<div class="videos">${videos.map(a => a.apagado_em
    ? `<div class="apagado">${esc(a.original)}: apagado depois de ${VIDEO_DIAS} dias</div>`
    : `<figure class="video" style="margin:0"><video src="${url(a)}" controls preload="metadata" playsinline></video>
        <figcaption class="legenda"><span>${esc(a.original)} · ${mb(a.bytes)}</span><a class="baixar" href="${url(a)}" download="${esc(a.original)}" aria-label="Baixar ${esc(a.original)}">${ic.baixar}</a></figcaption></figure>`).join('')}</div>`
    : '<p class="mudo">A banda não mandou vídeo.</p>'}
    </section>

    <section class="card largo">
      <h2>${ic.foto}Fotos <span class="n">${fotos.length}</span></h2>
      ${fotos.length ? `<div class="fotos">${fotos.map(a => `<figure class="foto"><a class="ver" href="${url(a)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${esc(a.original)}"><img src="${url(a)}" alt="" loading="lazy"></a>
        <a class="baixar" href="${url(a)}" download="${esc(a.original)}" aria-label="Baixar ${esc(a.original)}">${ic.baixar}</a></figure>`).join('')}</div>`
    : '<p class="mudo">A banda não mandou foto.</p>'}
    </section>
  </div>
  ${!f.concluido_em ? `<p class="aviso">A banda saiu antes de terminar o envio. Pode faltar vídeo ou foto.</p>` : ''}

  <div class="rodape"><img src="/images/johnny.jpg" alt=""><div><b>Johnny · produtor musical</b><span>Página só pra equipe do Porks. Não compartilhe este link.</span></div></div>
</main>
</body></html>`)
})

// Serve Vite build
app.use(express.static(join(__dirname, 'dist')))
app.get('*', (_req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))

app.listen(PORT, () => console.log(`porks-site :${PORT}`))
