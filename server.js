import express from 'express'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const ADMIN_PASS = process.env.ADMIN_PASS || 'porks2026'
const DATA_DIR = '/uploads'

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

// Serve Vite build
app.use(express.static(join(__dirname, 'dist')))
app.get('*', (_req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))

app.listen(PORT, () => console.log(`porks-site :${PORT}`))
