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
  const data = String(b.data || '')
  const dia = new Date(`${data}T12:00:00-03:00`)
  const erros = []
  if (!texto(b.banda, 120)) erros.push('banda')
  if (texto(b.responsavel, 120).split(' ').length < 2) erros.push('responsavel')
  if (!/^\d{2}9\d{8}$/.test(whatsapp)) erros.push('whatsapp')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || isNaN(dia) || ![5, 6].includes(dia.getUTCDay())) erros.push('data')
  if (!b.aceite) erros.push('aceite')
  if (erros.length) return res.status(400).json({ error: 'dados inválidos', campos: erros })

  const id = `${data}-${randomBytes(6).toString('hex')}`
  const integrantes = Math.min(30, Math.max(1, parseInt(b.integrantes, 10) || 1))
  const ficha = {
    id,
    criado_em: new Date().toISOString(),
    banda: texto(b.banda, 120),
    integrantes,
    instrumentos: (Array.isArray(b.instrumentos) ? b.instrumentos : []).map(i => texto(i, 60)).filter(Boolean).slice(0, 20),
    lugares: texto(b.lugares, 600),
    tempo: texto(b.tempo, 40),
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
  if (f.arquivos.filter(a => a.tipo === tipo).length + r[tipo] >= lim.max) {
    return res.status(409).json({ error: `limite de ${lim.max} ${tipo === 'video' ? 'vídeos' : 'fotos'}` })
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
    res.json({ ok: true, nome })
  })
  req.pipe(out)
})

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
let tagBandaId = null
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
    if (!tagBandaId) tagBandaId = (await engine('/api/tags', { name: 'Banda', color: '#EE7F12' })).id
    const conta = t => f.arquivos.filter(a => a.tipo === t).length
    const lead = await engine('/api/leads', {
      name: f.responsavel,
      phone: `55${f.whatsapp}`,
      product: 'porks_sobradinho',
      unit: 'sobradinho',
      source: 'produtor-musical',
      tag_ids: [tagBandaId],
      metadata: {
        tipo: 'banda',
        banda: f.banda,
        integrantes: f.integrantes,
        instrumentos: f.instrumentos.join(', '),
        lugares: f.lugares,
        tempo_formacao: f.tempo,
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
    const velhos = f.arquivos.filter(a => a.tipo === 'video' && !a.apagado_em && agora - Date.parse(a.em) > VIDEO_DIAS * 864e5)
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
  const ordem = req.query.ordem === 'show' ? 'show' : 'recentes'
  const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10)

  let lista = todasFichas().map(resumo)
  if (q) {
    lista = lista.filter(b => normaliza(`${b.banda} ${b.responsavel}`).includes(q) || (qDig.length >= 4 && b.whatsapp.includes(qDig)))
  }
  const contagem = { todas: lista.length }
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
    instrumentos: f.instrumentos, lugares: f.lugares, tempo: f.tempo, aceite: f.aceite,
    nota: f.nota || '', status_em: f.status_em || null,
    engine_lead_id: f.engine?.lead_id || null,
    material: `/produtor/material/${f.id}?k=${k}`,
    arquivos: f.arquivos.map(a => ({
      tipo: a.tipo, original: a.original, bytes: a.bytes, em: a.em, apagado_em: a.apagado_em || null,
      url: a.apagado_em ? null : `/produtor/material/${f.id}/${a.nome}?k=${k}`,
    })),
  })
})

app.patch('/api/admin/bandas/:id', (req, res) => {
  if (!adminOk(req)) return res.status(401).json({ error: 'unauthorized' })
  const f = lerFicha(req.params.id)
  if (!f) return res.status(404).json({ error: 'não encontrada' })
  const { status, nota } = req.body || {}
  if (status !== undefined) {
    if (!STATUS_BANDA.includes(status)) return res.status(400).json({ error: 'status inválido' })
    if (status !== (f.status || 'nova')) { f.status = status; f.status_em = new Date().toISOString() }
  }
  if (nota !== undefined) f.nota = String(nota).slice(0, 2000)
  salvarFicha(f)
  res.json({ ok: true, status: f.status || 'nova', status_em: f.status_em || null, nota: f.nota || '' })
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
  const fotos = f.arquivos.filter(a => a.tipo === 'foto')
  const linha = (r, v) => `<tr><th>${r}</th><td>${esc(v)}</td></tr>`
  res.set('X-Robots-Tag', 'noindex').send(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(f.banda)} · material da banda</title>
<style>body{margin:0;font:16px/1.5 system-ui,sans-serif;background:#F3E2BF;color:#2C1C0D}main{max-width:760px;margin:0 auto;padding:20px 16px 48px}
h1{margin:0 0 4px;font-size:1.8rem}h2{margin:28px 0 10px}table{width:100%;border-collapse:collapse;background:#FFFBF2;border-radius:12px;overflow:hidden}
th,td{padding:10px 12px;text-align:left;vertical-align:top;border-bottom:1px solid #EAD7B0}th{width:38%;font-weight:600;color:#7A5426}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}video,img{width:100%;border-radius:10px;background:#000;display:block}
a{color:#B4500A}.vazio{color:#7A5426}.cap{font-size:.85rem;color:#7A5426;margin-top:4px;word-break:break-all}</style></head><body><main>
<h1>${esc(f.banda)}</h1><div class="vazio">Inscrição pelo Johnny em ${esc(new Date(f.criado_em).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))}</div>
<h2>Ficha</h2><table>
${linha('Responsável', f.responsavel)}${linha('WhatsApp', f.whatsapp.replace(/(\d{2})(\d)(\d{4})(\d{4})/, '($1) $2 $3-$4'))}
${linha('Data pedida', f.data_texto ? `${f.data_texto}, a partir das 20h` : f.data)}${linha('Integrantes', f.integrantes)}
${linha('Instrumentos', f.instrumentos.join(', '))}${linha('Já tocou em', f.lugares)}${linha('Tempo de formação', f.tempo)}
${linha('Consumo da banda', `R$ ${f.integrantes * 50}`)}${linha('Termos aceitos em', f.aceite ? new Date(f.aceite).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '')}
</table>
<h2>Vídeos (${videos.length})</h2>${videos.length ? `<div class="grid">${videos.map(a => a.apagado_em
    ? `<div class="vazio">${esc(a.original)}: apagado depois de ${VIDEO_DIAS} dias</div>`
    : `<div><video src="${url(a)}" controls preload="metadata" playsinline></video><div class="cap"><a href="${url(a)}" download="${esc(a.original)}">${esc(a.original)}</a></div></div>`).join('')}</div>` : '<p class="vazio">A banda não mandou vídeo.</p>'}
<h2>Fotos (${fotos.length})</h2>${fotos.length ? `<div class="grid">${fotos.map(a => `<div><a href="${url(a)}" target="_blank"><img src="${url(a)}" alt="" loading="lazy"></a><div class="cap"><a href="${url(a)}" download="${esc(a.original)}">baixar ${esc(a.original)}</a></div></div>`).join('')}</div>` : '<p class="vazio">A banda não mandou foto.</p>'}
</main></body></html>`)
})

// Serve Vite build
app.use(express.static(join(__dirname, 'dist')))
app.get('*', (_req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))

app.listen(PORT, () => console.log(`porks-site :${PORT}`))
