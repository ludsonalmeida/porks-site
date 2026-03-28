const STORAGE_KEY = 'porks_hero_cards'

export const DEFAULT_CARDS = [
  { id: 1, tag: '★ shows ao vivo',   title: 'SEXTA-FEIRA',          sub: 'Rock ao vivo · entrada gratuita', img: '', tape: true  },
  { id: 2, tag: '★ shows ao vivo',   title: 'SÁBADO',               sub: 'Bandas toda semana · sem couvert', img: '', tape: false },
  { id: 3, tag: '★ reservas abertas', title: 'ANIVERSÁRIOS & GRUPOS', sub: 'Confirmação rápida · WhatsApp',  img: '', tape: false },
]

export function getHeroCards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return DEFAULT_CARDS
}

export function saveHeroCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}
