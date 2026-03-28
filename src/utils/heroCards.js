const STORAGE_KEY = 'porks_hero_cards'
const API_BASE = 'https://musica.sobradinhoporks.com.br/tracker/hero-cards'

export const DEFAULT_CARDS = [
  { id: 1, tag: '★ shows ao vivo',    title: 'SEXTA-FEIRA',           sub: 'Rock ao vivo · entrada gratuita',  img: '', tape: true  },
  { id: 2, tag: '★ shows ao vivo',    title: 'SÁBADO',                sub: 'Bandas toda semana · sem couvert', img: '', tape: false },
  { id: 3, tag: '★ reservas abertas', title: 'ANIVERSÁRIOS & GRUPOS', sub: 'Confirmação rápida · WhatsApp',    img: '', tape: false },
]

// Synchronous read from localStorage cache (for first render)
export function getHeroCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return DEFAULT_CARDS
}

// Fetch from API, update local cache, return cards
export async function fetchHeroCards() {
  try {
    const res = await fetch(API_BASE, { cache: 'no-store' })
    if (!res.ok) throw new Error('api')
    const cards = await res.json()
    if (Array.isArray(cards) && cards.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
      return cards
    }
  } catch (_) {}
  return getHeroCards()
}

// Save to API + local cache
export async function saveHeroCards(cards, pass) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  await fetch(`${API_BASE}?pass=${encodeURIComponent(pass)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cards),
  })
}
