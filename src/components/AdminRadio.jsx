import { useState, useEffect, useCallback } from 'react'

const API = 'https://musica.sobradinhoporks.com.br/admin/api/remote'
const CSV = 'https://musica.sobradinhoporks.com.br/admin/api/remote-csv'

const STATUS_COLOR = {
  APPROVED: '#2e7d32', REJECTED: '#c62828', DUPLICATE: '#e65100',
  COOLDOWN: '#1565c0', PLAYING: '#6a1b9a', PLAYED: '#546e7a', PENDING: '#795548',
}
const STATUS_PT = {
  APPROVED: 'Aprovado', REJECTED: 'Rejeitado', DUPLICATE: 'Duplicado',
  COOLDOWN: 'Cooldown', PLAYING: 'Tocando', PLAYED: 'Tocou', PENDING: 'Pendente',
}

export default function AdminRadio({ pass }) {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [filters, setFilters] = useState({ status: 'ALL', search: '', dateFrom: '', dateTo: '', page: 1 })

  const load = useCallback(async (f = filters) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ pass, ...f })
      const res = await fetch(`${API}?${params}`)
      if (!res.ok) throw new Error('Erro ' + res.status)
      setData(await res.json())
    } catch (e) {
      setError('Não foi possível conectar à API da rádio. Verifique se está online.')
    }
    setLoading(false)
  }, [pass, filters])

  useEffect(() => { load() }, []) // eslint-disable-line

  function setFilter(key, val) {
    const next = { ...filters, [key]: val, page: 1 }
    setFilters(next)
    load(next)
  }

  function goPage(p) {
    const next = { ...filters, page: p }
    setFilters(next)
    load(next)
  }

  function exportCsv() {
    const params = new URLSearchParams({ pass })
    window.open(`${CSV}?${params}`, '_blank')
  }

  if (loading && !data) return (
    <div style={R.loading}>
      <div style={R.spinner} />
      <span style={R.loadingText}>CARREGANDO DADOS DA RÁDIO...</span>
    </div>
  )

  if (error) return (
    <div style={R.errorBox}>
      <div style={R.errorTitle}>ERRO DE CONEXÃO</div>
      <div style={R.errorMsg}>{error}</div>
      <button style={R.retryBtn} onClick={() => load()}>Tentar novamente</button>
    </div>
  )

  const { requests = [], total = 0, stats = {}, topArtists = [], topTracks = [],
          uniqueSessions = 0, totalAll = 0, currentPage = 1, totalPages = 1,
          hourCount = {}, dayCount = {} } = data || {}

  const approvalRate = totalAll > 0 ? Math.round(((stats.APPROVED || 0) / totalAll) * 100) : 0

  // Build album art map from requests
  const artMap = {}
  for (const r of requests) {
    if (r.albumArt && !artMap[r.trackName]) artMap[r.trackName] = r.albumArt
  }

  const statCards = [
    { label: 'Total pedidos',  value: totalAll,            color: INK },
    { label: 'Aprovados',      value: stats.APPROVED || 0, color: '#2e7d32' },
    { label: 'Rejeitados',     value: stats.REJECTED || 0, color: '#c62828' },
    { label: 'Duplicados',     value: stats.DUPLICATE || 0, color: '#e65100' },
    { label: 'Cooldown',       value: stats.COOLDOWN || 0,  color: '#1565c0' },
    { label: 'Sessões únicas', value: uniqueSessions,       color: AMB },
  ]

  // Hourly chart
  const maxHour = Math.max(...Array.from({length:24},(_,h) => hourCount[h]||0), 1)
  // Daily chart
  const sortedDays = Object.entries(dayCount).sort((a,b) => a[0].localeCompare(b[0]))
  const maxDay = Math.max(...sortedDays.map(d => Number(d[1])), 1)

  return (
    <div>
      {/* Stat cards */}
      <div style={R.statGrid}>
        {statCards.map(sc => (
          <div key={sc.label} style={R.statCard}>
            <div style={{ ...R.statValue, color: sc.color }}>{sc.value}</div>
            <div style={R.statLabel}>{sc.label}</div>
          </div>
        ))}
        <div style={R.statCard}>
          <div style={{ ...R.statValue, color: AMB }}>{approvalRate}%</div>
          <div style={R.statLabel}>Taxa aprovação</div>
        </div>
      </div>

      {/* Charts */}
      <div style={R.charts}>
        <div style={R.chartBox}>
          <div style={R.chartTitle}>PEDIDOS POR HORÁRIO</div>
          <div style={R.barChart}>
            {Array.from({length:24},(_,h) => {
              const c = hourCount[h] || 0
              const pct = Math.round((c / maxHour) * 100)
              return (
                <div key={h} style={R.barCol} title={`${h}h: ${c}`}>
                  <div style={{...R.bar, height: `${Math.max(pct,2)}%`, background: pct>60?'#c62828':pct>30?AMB:CREAM2}} />
                  <span style={R.barLabel}>{h}h</span>
                </div>
              )
            })}
          </div>
        </div>
        <div style={R.chartBox}>
          <div style={R.chartTitle}>PEDIDOS POR DIA</div>
          <div style={R.barChart}>
            {sortedDays.map(([day, count]) => {
              const pct = Math.round((Number(count) / maxDay) * 100)
              return (
                <div key={day} style={R.barCol} title={`${day}: ${count}`}>
                  <div style={{...R.bar, height: `${Math.max(pct,2)}%`, background: pct>60?'#c62828':pct>30?AMB:CREAM2}} />
                  <span style={R.barLabel}>{day.slice(5)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top artists + tracks */}
      <div style={R.tops}>
        <div style={R.topBox}>
          <div style={R.topTitle}>TOP ARTISTAS</div>
          {topArtists.slice(0,8).map((a, i) => {
            const name  = Array.isArray(a) ? a[0] : (a.artist || a.name || '')
            const count = Array.isArray(a) ? a[1] : (a._count?.artist || a.count || 0)
            return (
              <div key={name} style={R.topRow}>
                <span style={R.topRank}>#{i+1}</span>
                <span style={R.topName}>{name}</span>
                <span style={R.topCount}>{count}x</span>
              </div>
            )
          })}
        </div>
        <div style={R.topBox}>
          <div style={R.topTitle}>TOP MÚSICAS</div>
          {topTracks.slice(0,8).map((t, i) => {
            const rawName = Array.isArray(t) ? t[0] : (t.trackName || t.name || '')
            const count   = Array.isArray(t) ? t[1] : (t._count?.trackName || t.count || 0)
            // rawName format: "Track — Artist"
            const trackName = rawName.includes(' — ') ? rawName.split(' — ')[0] : rawName
            const art = artMap[rawName] || artMap[trackName]
            return (
              <div key={rawName} style={R.topRow}>
                {art && <img src={art} alt="" style={R.topArt} />}
                <span style={R.topRank}>#{i+1}</span>
                <span style={R.topName}>{trackName}</span>
                <span style={R.topCount}>{count}x</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={R.filterBar}>
        <select style={R.filterSelect} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="ALL">Todos os status</option>
          {Object.keys(STATUS_PT).map(s => <option key={s} value={s}>{STATUS_PT[s]}</option>)}
        </select>
        <input style={R.filterInput} placeholder="Buscar música ou artista..."
          value={filters.search} onChange={e => setFilter('search', e.target.value)} />
        <input style={R.filterInput} type="date" value={filters.dateFrom}
          onChange={e => setFilter('dateFrom', e.target.value)} />
        <input style={R.filterInput} type="date" value={filters.dateTo}
          onChange={e => setFilter('dateTo', e.target.value)} />
        <button style={R.csvBtn} type="button" onClick={exportCsv}>↓ CSV</button>
      </div>

      {/* Table */}
      <div style={R.tableWrap}>
        <table style={R.table}>
          <thead>
            <tr>
              {['Data/Hora','Música','Artista','Status','Mesa','DJ'].map(h => (
                <th key={h} style={R.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map(r => {
              const d = new Date(r.createdAt)
              const dt = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
              return (
                <tr key={r.id} style={R.tr}>
                  <td style={R.td}>{dt}</td>
                  <td style={R.td}>
                    <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                      {r.albumArt && <img src={r.albumArt} alt="" style={R.topArt} />}
                      <span style={{ fontWeight: 600 }}>{r.trackName}</span>
                    </div>
                  </td>
                  <td style={R.td}>{r.artist}</td>
                  <td style={R.td}>
                    <span style={{ ...R.badge, background: STATUS_COLOR[r.status] || '#555' }}>
                      {STATUS_PT[r.status] || r.status}
                    </span>
                  </td>
                  <td style={{ ...R.td, textAlign: 'center' }}>{r.tableNumber || '—'}</td>
                  <td style={{ ...R.td, fontSize: '.72rem', color: MUTED, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.aiMessage || ''}>
                    {(r.aiMessage || '').slice(0, 80)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={R.pag}>
        <span style={R.pagInfo}>{total} resultado{total !== 1 ? 's' : ''}</span>
        {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p =>
          p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
        ).map((p, idx, arr) => (
          <span key={p}>
            {idx > 0 && arr[idx-1] !== p-1 && <span style={R.pagEllipsis}>…</span>}
            <button
              style={{ ...R.pagBtn, ...(p === currentPage ? R.pagBtnActive : {}) }}
              onClick={() => goPage(p)}
            >{p}</button>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Paleta (mesma do AdminPanel) ─── */
const CREAM  = '#f2e8d5'
const CREAM2 = '#e8dcc6'
const INK    = '#2e1c08'
const AMB    = '#cc6a0a'
const MUTED  = '#7a5c35'
const BARLOW_C = "'Barlow Condensed', sans-serif"
const BARLOW   = "'Barlow', sans-serif"
const BEBAS    = "'Bebas Neue', sans-serif"

const R = {
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 0', color: MUTED },
  spinner: { width: 36, height: 36, border: `3px solid ${CREAM2}`, borderTop: `3px solid ${AMB}`, borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { fontFamily: BARLOW_C, fontSize: '.7rem', fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase' },
  errorBox: { background: '#fff0f0', border: `2px solid #c62828`, padding: 24, borderRadius: 4, marginTop: 24 },
  errorTitle: { fontFamily: BEBAS, fontSize: '1.4rem', color: '#c62828', letterSpacing: '.08em', marginBottom: 8 },
  errorMsg: { fontFamily: BARLOW, fontSize: '.9rem', color: '#c62828', marginBottom: 16 },
  retryBtn: { fontFamily: BEBAS, fontSize: '1rem', letterSpacing: '.1em', background: '#c62828', color: '#fff', border: 'none', padding: '8px 20px', cursor: 'pointer' },

  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12, marginBottom: 28 },
  statCard: { background: CREAM, border: `2px solid ${INK}`, padding: '14px 16px', boxShadow: `3px 3px 0 ${CREAM2}` },
  statValue: { fontFamily: BEBAS, fontSize: '2rem', lineHeight: 1, letterSpacing: '.04em' },
  statLabel: { fontFamily: BARLOW_C, fontSize: '.58rem', fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: MUTED, marginTop: 4 },

  charts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 },
  chartBox: { background: CREAM, border: `2px solid ${INK}`, padding: 16, boxShadow: `3px 3px 0 ${CREAM2}` },
  chartTitle: { fontFamily: BEBAS, fontSize: '1rem', letterSpacing: '.1em', color: INK, marginBottom: 12 },
  barChart: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 },
  barCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', cursor: 'default' },
  bar: { width: '100%', borderRadius: '2px 2px 0 0', transition: 'height .3s' },
  barLabel: { fontSize: '.45rem', color: MUTED, marginTop: 2, whiteSpace: 'nowrap' },

  topArt: { width: 28, height: 28, objectFit: 'cover', borderRadius: 2, marginRight: 4, flexShrink: 0 },
  tops: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 },
  topBox: { background: CREAM, border: `2px solid ${INK}`, padding: 16, boxShadow: `3px 3px 0 ${CREAM2}` },
  topTitle: { fontFamily: BEBAS, fontSize: '1.1rem', letterSpacing: '.1em', color: INK, marginBottom: 12, borderBottom: `1px dashed ${CREAM2}`, paddingBottom: 8 },
  topRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: `1px solid ${CREAM2}` },
  topRank: { fontFamily: BEBAS, fontSize: '.9rem', color: AMB, minWidth: 28 },
  topName: { fontFamily: BARLOW, fontSize: '.85rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  topCount: { fontFamily: BEBAS, fontSize: '.9rem', color: MUTED },

  filterBar: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' },
  filterSelect: { fontFamily: BARLOW_C, fontSize: '.8rem', fontWeight: 700, letterSpacing: '.08em', padding: '8px 10px', background: CREAM, border: `1.5px solid ${INK}`, color: INK, cursor: 'pointer', minHeight: 44 },
  filterInput: { fontFamily: BARLOW, fontSize: '.85rem', padding: '8px 10px', background: CREAM, border: `1.5px solid ${CREAM2}`, borderBottom: `1.5px solid ${INK}`, color: INK, outline: 'none', minHeight: 44, flex: '1 1 140px' },
  csvBtn: { fontFamily: BEBAS, fontSize: '1rem', letterSpacing: '.1em', padding: '8px 18px', background: INK, color: CREAM, border: 'none', cursor: 'pointer', minHeight: 44 },

  tableWrap: { overflowX: 'auto', border: `2px solid ${INK}`, background: CREAM, boxShadow: `4px 4px 0 ${CREAM2}` },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: BARLOW, fontSize: '.82rem' },
  th: { fontFamily: BARLOW_C, fontSize: '.62rem', fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', padding: '10px 12px', background: INK, color: CREAM, textAlign: 'left', whiteSpace: 'nowrap' },
  tr: { borderBottom: `1px solid ${CREAM2}` },
  td: { padding: '9px 12px', color: INK, verticalAlign: 'middle' },
  badge: { fontFamily: BARLOW_C, fontSize: '.6rem', fontWeight: 800, letterSpacing: '.12em', color: '#fff', padding: '3px 8px', textTransform: 'uppercase', display: 'inline-block' },

  pag: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, flexWrap: 'wrap' },
  pagInfo: { fontFamily: BARLOW_C, fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', color: MUTED, marginRight: 8 },
  pagBtn: { fontFamily: BARLOW_C, fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em', padding: '6px 10px', background: CREAM, border: `1.5px solid ${CREAM2}`, color: INK, cursor: 'pointer', minWidth: 36, minHeight: 36 },
  pagBtnActive: { background: INK, color: CREAM, border: `1.5px solid ${INK}` },
  pagEllipsis: { fontFamily: BARLOW, color: MUTED, padding: '0 4px' },
}
