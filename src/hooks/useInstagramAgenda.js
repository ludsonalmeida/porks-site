import { useState, useEffect } from 'react'

const TASK_ID = 'kc8xZqrC9DmM7VWgF'
const TOKEN = import.meta.env.VITE_APIFY_TOKEN || ''
const CACHE_KEY = 'porks_ig_agenda'
const CACHE_TTL = 1000 * 60 * 60 * 6 // 6 horas

export default function useInstagramAgenda() {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Tenta cache primeiro
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL) {
          setPost(data)
          setLoading(false)
          return
        }
      } catch (_) {}
    }

    const url = `https://api.apify.com/v2/actor-tasks/${TASK_ID}/runs/last/dataset/items?token=${TOKEN}&status=SUCCEEDED&limit=15`

    fetch(url)
      .then(r => r.json())
      .then(items => {
        if (!Array.isArray(items)) return
        const agenda = items.find(p =>
          p.caption && /agenda.{0,15}semana/i.test(p.caption)
        ) || items.find(p => p.caption && !p.error) || null

        if (agenda) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: agenda, ts: Date.now() }))
          setPost(agenda)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { post, loading }
}
