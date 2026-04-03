import { useState, useEffect, useCallback, useMemo } from 'react'

const API = 'https://musica.sobradinhoporks.com.br/admin/api/remote'
const CSV = 'https://musica.sobradinhoporks.com.br/admin/api/remote-csv'

// ── Genre classifier ──────────────────────────────────────────────────────────
// Normalize: strip accents + apostrophes for matching
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[''`]/g, '').toLowerCase()

const GENRES = {
  'rock nacional':   ['legiao urbana','charlie brown jr','titas','sepultura','raimundos','capital inicial','engenheiros do hawaii','paralamas','skank','jota quest','nando reis','los hermanos','fresno','supercombo','a.c.e','pitty','detonautas','nx zero','cpm 22','o rappa','natiruts','cidade negra','cazuza','barao vermelho','ira','ultraje a rigor','plebe rude','biquini cavadao','planet hemp','cassia eller','ney matogrosso','patricio sid','febre90s'],
  'rock internacional': ['nirvana','system of a down','linkin park','metallica','red hot chili peppers','foo fighters','pearl jam','radiohead','the beatles','pink floyd','queen','ac/dc','acdc','guns n roses','iron maiden','avenged sevenfold','green day','led zeppelin','deep purple','black sabbath','whitesnake','van halen','bon jovi','def leppard','scorpions','ozzy','motorhead','judas priest','alice in chains','soundgarden','rage against','arctic monkeys','the strokes','muse','oasis','u2','the who','jimi hendrix','aerosmith','kiss','the offspring','blink-182','blink 182','sum 41','limp bizkit','creed','slipknot','ramones','deftones','audioslave','korn','silverchair','nickelback','thirty seconds to mars','disturbed','jeff buckley','tina turner','cyndi lauper','kaleo','the neighbourhood','twenty one pilots','gorillaz','the calling','chase atlantic'],
  'hip-hop / trap':  ['matue','yago oproprio','lil peep','xxxtentacion','drake','travis scott','juice wrld','the weeknd','post malone','eminem','kanye west','kendrick lamar','j. cole','wc no beat','bk brj','outra vez','baco exu do blues','djonga','filipe ret','orochi','veigh','racionais','mano brown','sabotage','criolo','nognog','teto','mc poze','mc ryan','leall','marcelo d2','black alien','conecrew','froid','sant','pecaos'],
  'r&b / soul':      ['sza','beyonce','frank ocean','dangelo','alicia keys','john legend','miguel','h.e.r.','jorja smith','giveon','doja cat','ari lennox','summer walker','tim maia','jorge ben','jorge ben jor','steve lacy','amy winehouse','willow'],
  'mpb / sertanejo': ['chico buarque','caetano veloso','gilberto gil','maria bethania','djavan','seu jorge','ana carolina','marisa monte','elba ramalho','roberto carlos','ze ramalho','geraldo azevedo','raul seixas','novos baianos','alceu valenca','belchior','gonzaguinha','luiz gonzaga','milton nascimento','elis regina','gal costa','tom jobim','vinicius de moraes','chitaozinho','jorge e mateus','jorge & mateus'],
  'pop':             ['taylor swift','ariana grande','billie eilish','olivia rodrigo','harry styles','ed sheeran','shawn mendes','camila cabello','selena gomez','dua lipa','bruno mars','miley cyrus','lady gaga','katy perry','rihanna','adele','coldplay','imagine dragons','maroon 5','one republic','onerepublic','the anxiety'],
}

function classifyGenres(topArtists) {
  const scores = {}
  for (const a of topArtists) {
    const artist = norm(Array.isArray(a) ? a[0] : a.artist || '')
    const count  = Array.isArray(a) ? a[1] : (a.count || 1)
    for (const [genre, list] of Object.entries(GENRES)) {
      if (list.some(g => artist.includes(g) || g.includes(artist.split(' ')[0]))) {
        scores[genre] = (scores[genre] || 0) + count
      }
    }
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])
}

function peakHours(hourCount) {
  const sorted = Object.entries(hourCount).sort((a, b) => Number(b[1]) - Number(a[1]))
  return sorted.slice(0, 3).map(([h]) => `${h}h`)
}

// ── Repertoire recommendations ───────────────────────────────────────────────
const BAND_RECS = {
  'rock nacional': {
    cover: ['Legião Urbana','Capital Inicial','Paralamas do Sucesso','Titãs','Engenheiros do Hawaii','Charlie Brown Jr','Raimundos','Barão Vermelho','Skank','Nando Reis'],
    style: 'Rock nacional clássico e anos 90/2000. Público quer cantar junto — priorize hits conhecidos.',
    setlistTip: 'Abra com energia (Raimundos/CBJR), meio com clássicos emocionantes (Legião/Capital), feche com singalong (Paralamas/Skank).',
    energy: 'média-alta',
    audience: '25-45 anos, nostálgico, cresceu com MTV Brasil e rádio rock. Bebe cerveja artesanal ou long neck, vai em grupo de amigos. Canta junto e se emociona com clássicos. Fiel — volta toda semana se o repertório agradar.',
  },
  'rock internacional': {
    cover: ['Nirvana','Foo Fighters','Red Hot Chili Peppers','Pearl Jam','Linkin Park','Green Day','System of a Down','Queens of the Stone Age','Arctic Monkeys','The Strokes'],
    style: 'Rock alternativo/grunge dos anos 90-2000. Público curte peso mas também melodia.',
    setlistTip: 'Intercale peso (SOAD/Metallica) com grooves (RHCP/Foo Fighters). Encerre com Nirvana — sempre funciona.',
    energy: 'alta',
    audience: '22-40 anos, headbanger casual. Usa camiseta de banda, toma chopp ou whisky. Gosta de volume alto e guitarra distorcida. Fica até fechar e pede bis. Vem sozinho ou em dupla, não precisa de grupo pra curtir.',
  },
  'hip-hop / trap': {
    cover: ['Matuê','Yago Oproprio','Filipe Ret','Veigh','Orochi','WC no Beat','BK','Baco Exu do Blues','Djonga','Racionais'],
    style: 'Trap/rap BR domina. Público jovem, curte beat pesado e autotune. Shows de rap/trap ou DJ sets com vocal.',
    setlistTip: 'DJ set com transições rápidas entre hits. Matuê e Veigh são unanimidade. Misture com trap gringo nos intervalos.',
    energy: 'alta',
    audience: '18-28 anos, geração Z/millennial tardio. Consome via Spotify e TikTok. Bebe drink ou cerveja barata, fica no celular filmando. Público rotativo — vem pela vibe, não pela fidelidade. Responde bem a promoções e eventos temáticos.',
  },
  'r&b / soul': {
    cover: ['SZA','Frank Ocean','The Weeknd','Beyoncé','D\'Angelo','Jorja Smith','Giveon','H.E.R.','Alicia Keys','Erykah Badu'],
    style: 'R&B contemporâneo com raízes soul. Público sofisticado, curte vibe mais intimista.',
    setlistTip: 'Comece suave (Frank Ocean/Giveon), suba gradualmente (SZA/Beyoncé). Ótimo pra noites mais chill.',
    energy: 'média-baixa',
    audience: '22-35 anos, urbano e antenado. Curte estética, vai bem vestido. Prefere cocktail ou vinho. Público de casal ou grupo pequeno. Valoriza ambiente e iluminação tanto quanto a música. Bom pra noites de quarta/quinta.',
  },
  'mpb / sertanejo': {
    cover: ['Djavan','Seu Jorge','Criolo','Raul Seixas','Zé Ramalho','Gilberto Gil','Caetano Veloso','Tim Maia','Jorge Ben Jor','Novos Baianos'],
    style: 'MPB raiz com pegada brasileira forte. Público valoriza qualidade musical e letra.',
    setlistTip: 'Tim Maia e Jorge Ben Jor esquentam qualquer pista. Raul Seixas é coringa. Djavan pra momentos mais suaves.',
    energy: 'média',
    audience: '30-55 anos, público raiz brasileiro. Entende de música, valoriza letra e harmonia. Bebe cachaça premium, vinho ou chopp. Fica sentado conversando e prestando atenção na banda. Ticket médio alto — consome mais e reclama menos.',
  },
  'pop': {
    cover: ['Dua Lipa','Harry Styles','Taylor Swift','Billie Eilish','Olivia Rodrigo','The Weeknd','Bruno Mars','Ed Sheeran','Ariana Grande','Miley Cyrus'],
    style: 'Pop mainstream global. Público eclético, funciona bem como ponte entre gêneros.',
    setlistTip: 'Use como transição entre blocos de rock e rap. Bruno Mars e Dua Lipa são universais.',
    energy: 'média-alta',
    audience: '18-35 anos, generalista. Não é fã de um gênero específico — vai pelo hit do momento. Público de aniversário, rolê casual e primeiro encontro. Bebe de tudo, fica em grupo grande. Bom pra lotar em noites fracas.',
  },
}

function generateRepertoire(data) {
  const { topArtists = [], topTracks = [], stats = {}, totalAll = 0 } = data
  const genreRanking = classifyGenres(topArtists)
  if (genreRanking.length === 0) return null

  const classifiedTotal = genreRanking.reduce((s, [, c]) => s + c, 0)
  const recs = []

  // All genres get recommendations
  for (let i = 0; i < genreRanking.length; i++) {
    const [genre, count] = genreRanking[i]
    const pct = classifiedTotal > 0 ? Math.round((count / classifiedTotal) * 100) : 0
    const rec = BAND_RECS[genre]
    if (!rec) continue

    // Find which artists from this genre were actually requested
    const genreArtists = GENRES[genre] || []
    const requestedFromGenre = topArtists
      .filter(a => {
        const name = norm(Array.isArray(a) ? a[0] : a.artist || '')
        return genreArtists.some(g => name.includes(g) || g.includes(name.split(' ')[0]))
      })
      .map(a => ({
        name: Array.isArray(a) ? a[0] : a.artist,
        count: Array.isArray(a) ? a[1] : (a.count || 1),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Suggest cover bands that match but weren't requested (discovery)
    const requestedNames = requestedFromGenre.map(a => a.name.toLowerCase())
    const discovery = rec.cover.filter(b => !requestedNames.some(r => b.toLowerCase().includes(r) || r.includes(b.toLowerCase())))
      .slice(0, 4)

    recs.push({
      genre,
      pct,
      rank: i + 1,
      style: rec.style,
      setlistTip: rec.setlistTip,
      energy: rec.energy,
      audience: rec.audience,
      requested: requestedFromGenre,
      discovery,
      allCovers: rec.cover,
    })
  }

  // Must-play songs (approved + duplicates = high demand)
  const mustPlay = topTracks.slice(0, 6).map(t => {
    const name = Array.isArray(t) ? t[0] : (t.trackName || '')
    const count = Array.isArray(t) ? t[1] : (t.count || 0)
    return { name, count }
  })

  return { recs, mustPlay, genreRanking }
}

function generateInsights(data) {
  const { topArtists = [], topTracks = [], stats = {}, totalAll = 0,
          uniqueSessions = 0, hourCount = {}, dayCount = {} } = data

  const insights = []
  const genreRanking = classifyGenres(topArtists)
  const total = Object.values(stats).reduce((s, v) => s + v, 0) || totalAll

  // Genre profile
  if (genreRanking.length > 0) {
    const [g1, g2] = genreRanking
    const pct = total > 0 ? Math.round((g1[1] / total) * 100) : 0
    if (g2) {
      insights.push({ icon: '🎸', title: 'Perfil musical', text: `Público tem forte presença de **${g1[0]}** (${pct}% dos pedidos). Segunda corrente: **${g2[0]}** — mistura típica de quem curte rock mas também consome urbano.` })
    } else {
      insights.push({ icon: '🎸', title: 'Perfil musical', text: `Pedidos concentrados em **${g1[0]}** — público coeso e com gosto bem definido.` })
    }
  }

  // Peak hours
  const peaks = peakHours(hourCount)
  if (peaks.length > 0) {
    const lateNight = peaks.some(h => parseInt(h) >= 22 || parseInt(h) <= 3)
    insights.push({ icon: '🕐', title: 'Horário de pico', text: `Maior movimento de pedidos às **${peaks.join(', ')}**. ${lateNight ? 'Público noturno — chega mais tarde e fica até fechar.' : 'Público que chega mais cedo e aquece antes da meia-noite.'}` })
  }

  // Approval rate
  const approved = stats.APPROVED || 0
  const rejected = stats.REJECTED || 0
  const rate = total > 0 ? Math.round((approved / total) * 100) : 0
  if (rate >= 70) {
    insights.push({ icon: '✅', title: 'Curadoria alinhada', text: `Taxa de aprovação de **${rate}%** — o DJ está bem sintonizado com o gosto do público. Poucos pedidos fora do perfil da casa.` })
  } else if (rate >= 50) {
    insights.push({ icon: '⚠️', title: 'Curadoria moderada', text: `${rate}% de aprovação — parte dos pedidos está sendo recusada. Pode indicar pedidos fora do estilo ou alta frequência de músicas repetidas.` })
  } else {
    insights.push({ icon: '🔴', title: 'Alta taxa de rejeição', text: `Apenas ${rate}% aprovados. O perfil do público pode estar divergindo do repertório do DJ — vale alinhar.` })
  }

  // Duplicate signals
  const dupRate = total > 0 ? Math.round(((stats.DUPLICATE || 0) / total) * 100) : 0
  if (dupRate >= 15) {
    const topTrack = Array.isArray(topTracks[0]) ? topTracks[0][0].split(' — ')[0] : ''
    insights.push({ icon: '🔁', title: 'Músicas queridinhas', text: `${dupRate}% dos pedidos são duplicatas — o público pede as mesmas músicas várias vezes. ${topTrack ? `"${topTrack}" é a mais disputada.` : ''} Sinal de que essas faixas são must-play.` })
  }

  // Session diversity
  if (uniqueSessions > 0 && totalAll > 0) {
    const avgPerSession = (totalAll / uniqueSessions).toFixed(1)
    if (parseFloat(avgPerSession) >= 3) {
      insights.push({ icon: '👥', title: 'Público engajado', text: `Média de **${avgPerSession} pedidos por mesa/pessoa** — público muito participativo. Quem usa o jukebox, usa bastante.` })
    } else {
      insights.push({ icon: '👥', title: 'Participação distribuída', text: `**${uniqueSessions} sessões únicas** com média de ${avgPerSession} pedidos cada — base ampla de usuários, participação bem distribuída.` })
    }
  }

  // Day patterns
  const sortedDays = Object.entries(dayCount).sort((a, b) => Number(b[1]) - Number(a[1]))
  if (sortedDays.length >= 2) {
    const [bestDay] = sortedDays
    const dayNames = { '0': 'Dom', '1': 'Seg', '2': 'Ter', '3': 'Qua', '4': 'Qui', '5': 'Sex', '6': 'Sáb' }
    const d = new Date(bestDay[0] + 'T12:00:00')
    const weekday = dayNames[d.getDay()] || bestDay[0].slice(5)
    insights.push({ icon: '📅', title: 'Melhor dia', text: `**${weekday} (${bestDay[0].slice(5)})** foi o dia com mais pedidos (${bestDay[1]}). Programar shows ou promoções nesse dia pode ampliar ainda mais o engajamento.` })
  }

  return insights
}

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

  // hooks must be before any early returns
  const insights = useMemo(() => generateInsights(data || {}), [data])
  const repertoire = useMemo(() => generateRepertoire(data || {}), [data])

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
          uniqueSessions = 0, uniqueTables = 0, totalAll = 0, currentPage = 1, totalPages = 1,
          hourCount = {}, dayCount = {} } = data || {}

  const approvalRate = totalAll > 0 ? Math.round(((stats.APPROVED || 0) / totalAll) * 100) : 0

  // Build album art map from requests
  const artMap = {}
  for (const r of requests) {
    if (r.albumArt && !artMap[r.trackName]) artMap[r.trackName] = r.albumArt
  }

  const avgPerPerson = uniqueSessions > 0 ? (totalAll / uniqueSessions).toFixed(1) : '—'

  const statCards = [
    { label: 'Total pedidos',  value: totalAll,            color: INK },
    { label: '👤 Pessoas',     value: uniqueSessions,      color: AMB, sub: `${avgPerPerson} pedidos/pessoa`, highlight: true },
    { label: 'Aprovados',      value: stats.APPROVED || 0, color: '#2e7d32' },
    { label: 'Rejeitados',     value: stats.REJECTED || 0, color: '#c62828' },
    { label: 'Cooldown',       value: stats.COOLDOWN || 0, color: '#1565c0' },
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
          <div key={sc.label} style={sc.highlight ? { ...R.statCard, border: `2px solid ${AMB}`, background: '#fffaf4' } : R.statCard}>
            <div style={{ ...R.statValue, color: sc.color }}>{sc.value}</div>
            <div style={R.statLabel}>{sc.label}</div>
            {sc.sub && <div style={{ fontSize: 10, color: AMB, marginTop: 2, fontWeight: 600 }}>{sc.sub}</div>}
          </div>
        ))}
        <div style={R.statCard}>
          <div style={{ ...R.statValue, color: AMB }}>{approvalRate}%</div>
          <div style={R.statLabel}>Taxa aprovação</div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div style={R.insightGrid}>
          {insights.map((ins, i) => (
            <div key={i} style={R.insightCard}>
              <div style={R.insightIcon}>{ins.icon}</div>
              <div style={R.insightTitle}>{ins.title}</div>
              <div style={R.insightText}>
                {ins.text.split('**').map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Repertoire Recommendations */}
      {repertoire && repertoire.recs.length > 0 && (() => {
        const topRecs = repertoire.recs.filter(r => r.rank <= 3)
        const otherRecs = repertoire.recs.filter(r => r.rank > 3)
        const totalClassified = repertoire.genreRanking.reduce((s, [, c]) => s + c, 0)
        return (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: SYS, fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: INK, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            🎤 RECOMENDAÇÕES DE REPERTÓRIO
          </div>
          <div style={{ fontFamily: SYS, fontSize: '.78rem', color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>
            Análise baseada em <strong>{totalClassified} pedidos classificados</strong> em {repertoire.genreRanking.length} gêneros. Os percentuais refletem a proporção real de cada gênero sobre o total de pedidos identificados.
          </div>

          {/* Must-play setlist */}
          {repertoire.mustPlay.length > 0 && (
            <div style={{ background: '#1a1a1a', border: `2px solid ${AMB}`, padding: 20, marginBottom: 20, boxShadow: `4px 4px 0 ${CREAM2}` }}>
              <div style={{ fontFamily: SYS, fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: AMB, marginBottom: 12 }}>
                🔥 SETLIST OBRIGATÓRIA — Músicas que o público MAIS pede
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {repertoire.mustPlay.map((t, i) => (
                  <div key={i} style={{ background: i < 3 ? AMB : '#333', color: i < 3 ? '#fff' : CREAM, padding: '8px 14px', fontFamily: SYS, fontSize: '.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 4 }}>
                    <span style={{ fontSize: '.7rem', opacity: .7 }}>#{i+1}</span>
                    {t.name.includes(' — ') ? t.name.split(' — ')[0] : t.name}
                    <span style={{ fontSize: '.7rem', fontWeight: 400, opacity: .6 }}>{t.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOP 3 Section */}
          <div style={{ fontFamily: SYS, fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: AMB, marginBottom: 10 }}>
            🏆 TOP 3 — GÊNEROS DOMINANTES
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14, marginBottom: 24 }}>
            {topRecs.map((rec) => (
              <div key={rec.genre} style={{
                background: rec.rank === 1 ? '#fff8ee' : CREAM,
                border: `2px solid ${rec.rank === 1 ? AMB : INK}`,
                padding: 18,
                boxShadow: rec.rank === 1 ? `4px 4px 0 #e8d4b0` : `3px 3px 0 ${CREAM2}`,
                position: 'relative',
              }}>
                {/* Rank badge */}
                <div style={{
                  position: 'absolute', top: -10, left: 14,
                  background: rec.rank === 1 ? AMB : rec.rank === 2 ? '#78909c' : '#8d6e63',
                  color: '#fff', fontFamily: SYS, fontSize: '.65rem', fontWeight: 700,
                  padding: '2px 10px', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '.05em',
                }}>
                  {rec.rank === 1 ? '👑 #1 DOMINANTE' : rec.rank === 2 ? '🥈 #2' : '🥉 #3'}
                </div>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 6 }}>
                  <div style={{ fontFamily: SYS, fontSize: rec.rank === 1 ? '.85rem' : '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: rec.rank === 1 ? AMB : INK }}>
                    {rec.genre}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: SYS, fontSize: rec.rank === 1 ? '.85rem' : '.7rem', fontWeight: 700, color: rec.rank === 1 ? AMB : MUTED }}>{rec.pct}%</span>
                    <span style={{ fontFamily: SYS, fontSize: '.65rem', fontWeight: 700, color: '#fff', background: rec.energy === 'alta' ? '#c62828' : rec.energy === 'média-alta' ? AMB : rec.energy === 'média' ? '#1565c0' : '#546e7a', padding: '2px 8px', borderRadius: 3, textTransform: 'uppercase' }}>
                      {rec.energy}
                    </span>
                  </div>
                </div>

                {/* Style description */}
                <div style={{ fontFamily: SYS, fontSize: '.85rem', color: INK, lineHeight: 1.5, marginBottom: 12, padding: '8px 10px', background: 'rgba(0,0,0,.04)', borderLeft: `3px solid ${rec.rank === 1 ? AMB : MUTED}` }}>
                  {rec.style}
                </div>

                {/* Most requested from genre */}
                {rec.requested.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontFamily: SYS, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: MUTED, marginBottom: 6 }}>
                      Artistas mais pedidos
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {rec.requested.map(a => (
                        <span key={a.name} style={{ fontFamily: SYS, fontSize: '.78rem', fontWeight: 600, background: INK, color: CREAM, padding: '3px 10px', borderRadius: 3 }}>
                          {a.name} <span style={{ fontSize: '.65rem', opacity: .6 }}>{a.count}x</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audience profile */}
                {rec.audience && (
                  <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(46,28,8,.06)', borderRadius: 4, border: `1px solid ${CREAM2}` }}>
                    <div style={{ fontFamily: SYS, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: AMB, marginBottom: 6 }}>
                      👥 Perfil do público
                    </div>
                    <div style={{ fontFamily: SYS, fontSize: '.8rem', color: INK, lineHeight: 1.5 }}>
                      {rec.audience}
                    </div>
                  </div>
                )}

                {/* Discovery / cover suggestions */}
                {rec.discovery.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontFamily: SYS, fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: AMB, marginBottom: 6 }}>
                      💡 Bandas recomendadas pra cover/show
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {rec.discovery.map(b => (
                        <span key={b} style={{ fontFamily: SYS, fontSize: '.78rem', fontWeight: 500, background: '#fff', border: `1.5px solid ${AMB}`, color: INK, padding: '3px 10px', borderRadius: 3 }}>
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Setlist tip */}
                <div style={{ fontFamily: SYS, fontSize: '.82rem', color: INK, lineHeight: 1.5, padding: '8px 10px', background: rec.rank === 1 ? 'rgba(204,106,10,.08)' : 'rgba(0,0,0,.03)', borderRadius: 4 }}>
                  <strong style={{ color: AMB }}>Dica de setlist:</strong> {rec.setlistTip}
                </div>
              </div>
            ))}
          </div>

          {/* OTHER GENRES Section */}
          {otherRecs.length > 0 && (
            <>
              <div style={{ fontFamily: SYS, fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: MUTED, marginBottom: 10 }}>
                📊 DEMAIS GÊNEROS — Presença menor mas relevante
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10, marginBottom: 20 }}>
                {otherRecs.map((rec) => (
                  <div key={rec.genre} style={{
                    background: CREAM, border: `1.5px solid ${CREAM2}`, padding: 14,
                    opacity: 0.85,
                  }}>
                    {/* Header compact */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontFamily: SYS, fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: MUTED }}>
                        #{rec.rank} {rec.genre}
                      </div>
                      <span style={{ fontFamily: SYS, fontSize: '.7rem', fontWeight: 600, color: MUTED }}>{rec.pct}%</span>
                    </div>

                    {/* Style - compact */}
                    <div style={{ fontFamily: SYS, fontSize: '.8rem', color: INK, lineHeight: 1.4, marginBottom: 10, padding: '6px 8px', background: 'rgba(0,0,0,.03)', borderLeft: `2px solid ${CREAM2}` }}>
                      {rec.style}
                    </div>

                    {/* Requested artists */}
                    {rec.requested.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontFamily: SYS, fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', color: MUTED, marginBottom: 4 }}>Pedidos</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {rec.requested.map(a => (
                            <span key={a.name} style={{ fontFamily: SYS, fontSize: '.72rem', fontWeight: 600, background: '#e8dcc6', color: INK, padding: '2px 8px', borderRadius: 3 }}>
                              {a.name} <span style={{ fontSize: '.6rem', opacity: .5 }}>{a.count}x</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Discovery compact */}
                    {rec.discovery.length > 0 && (
                      <div>
                        <div style={{ fontFamily: SYS, fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', color: MUTED, marginBottom: 4 }}>Sugestões</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {rec.discovery.map(b => (
                            <span key={b} style={{ fontFamily: SYS, fontSize: '.72rem', fontWeight: 500, background: '#fff', border: `1px solid ${CREAM2}`, color: MUTED, padding: '2px 8px', borderRadius: 3 }}>
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Setlist tip compact */}
                    <div style={{ fontFamily: SYS, fontSize: '.75rem', color: MUTED, lineHeight: 1.4, marginTop: 8, fontStyle: 'italic' }}>
                      {rec.setlistTip}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary analysis */}
              <div style={{ background: '#1a1a1a', border: `2px solid ${INK}`, padding: 18, boxShadow: `3px 3px 0 ${CREAM2}` }}>
                <div style={{ fontFamily: SYS, fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: AMB, marginBottom: 10 }}>
                  📋 ANÁLISE GERAL DO PERFIL MUSICAL
                </div>
                <div style={{ fontFamily: SYS, fontSize: '.85rem', color: CREAM, lineHeight: 1.6 }}>
                  {repertoire.genreRanking.map(([genre, count], i) => {
                    const pct = totalClassified > 0 ? Math.round((count / totalClassified) * 100) : 0
                    return (
                      <div key={genre} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontFamily: SYS, fontSize: '.7rem', fontWeight: 700, color: i < 3 ? AMB : '#78909c', minWidth: 28 }}>#{i+1}</span>
                        <span style={{ flex: 1, fontWeight: i < 3 ? 700 : 400, color: i < 3 ? '#fff' : '#aaa' }}>{genre}</span>
                        <div style={{ width: 120, height: 8, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: i === 0 ? AMB : i < 3 ? '#78909c' : '#555', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontFamily: SYS, fontSize: '.75rem', fontWeight: 600, color: i < 3 ? AMB : '#888', minWidth: 40, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    )
                  })}
                  <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(204,106,10,.1)', borderRadius: 4, fontSize: '.82rem', lineHeight: 1.6, color: '#ddd' }}>
                    <strong style={{ color: AMB }}>Conclusão:</strong>{' '}
                    {(() => {
                      const [g1] = repertoire.genreRanking
                      const rockTotal = repertoire.genreRanking
                        .filter(([g]) => g.includes('rock'))
                        .reduce((s, [, c]) => s + c, 0)
                      const rockPct = totalClassified > 0 ? Math.round((rockTotal / totalClassified) * 100) : 0
                      const nonRock = repertoire.genreRanking.filter(([g]) => !g.includes('rock'))
                      if (rockPct >= 70) {
                        return `O público é ${rockPct}% rock (nacional + internacional). ${nonRock.length > 0 ? `Os ${100-rockPct}% restantes (${nonRock.map(([g]) => g).join(', ')}) representam pedidos pontuais — vale ter no repertório como coringa mas sem dominar o setlist.` : 'Perfil muito coeso — mantenha o foco em rock.'}`
                      } else {
                        return `Perfil eclético. ${g1[0]} lidera mas não domina — considere sets variados que transitem entre os gêneros.`
                      }
                    })()}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        )
      })()}

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
const SYS = "system-ui, -apple-system, 'Segoe UI', sans-serif"
const BEBAS = "'Bebas Neue', sans-serif"

const R = {
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 0', color: MUTED },
  spinner: { width: 36, height: 36, border: `3px solid ${CREAM2}`, borderTop: `3px solid ${AMB}`, borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { fontFamily: SYS, fontSize: '.8rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' },
  errorBox: { background: '#fff0f0', border: `2px solid #c62828`, padding: 24, borderRadius: 4, marginTop: 24 },
  errorTitle: { fontFamily: BEBAS, fontSize: '1.4rem', color: '#c62828', letterSpacing: '.08em', marginBottom: 8 },
  errorMsg: { fontFamily: SYS, fontSize: '.9rem', color: '#c62828', marginBottom: 16 },
  retryBtn: { fontFamily: SYS, fontSize: '.9rem', fontWeight: 700, background: '#c62828', color: '#fff', border: 'none', padding: '8px 20px', cursor: 'pointer', borderRadius: 4 },

  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12, marginBottom: 28 },
  statCard: { background: CREAM, border: `2px solid ${INK}`, padding: '14px 16px', boxShadow: `3px 3px 0 ${CREAM2}` },
  statValue: { fontFamily: BEBAS, fontSize: '2rem', lineHeight: 1, letterSpacing: '.04em' },
  statLabel: { fontFamily: SYS, fontSize: '.7rem', fontWeight: 600, color: MUTED, marginTop: 6 },

  insightGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12, marginBottom: 28 },
  insightCard: { background: '#fff8ee', border: `2px solid ${AMB}`, padding: '14px 16px', boxShadow: `3px 3px 0 #e8d4b0` },
  insightIcon: { fontSize: '1.4rem', marginBottom: 6 },
  insightTitle: { fontFamily: SYS, fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: AMB, marginBottom: 6 },
  insightText: { fontFamily: SYS, fontSize: '.88rem', color: INK, lineHeight: 1.5 },

  charts: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 },
  chartBox: { background: CREAM, border: `2px solid ${INK}`, padding: 16, boxShadow: `3px 3px 0 ${CREAM2}` },
  chartTitle: { fontFamily: SYS, fontSize: '.8rem', fontWeight: 700, color: INK, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.06em' },
  barChart: { display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 },
  barCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', cursor: 'default' },
  bar: { width: '100%', borderRadius: '2px 2px 0 0', transition: 'height .3s' },
  barLabel: { fontFamily: SYS, fontSize: '.55rem', color: MUTED, marginTop: 3, whiteSpace: 'nowrap' },

  topArt: { width: 30, height: 30, objectFit: 'cover', borderRadius: 3, marginRight: 4, flexShrink: 0 },
  tops: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 },
  topBox: { background: CREAM, border: `2px solid ${INK}`, padding: 16, boxShadow: `3px 3px 0 ${CREAM2}` },
  topTitle: { fontFamily: SYS, fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: INK, marginBottom: 12, borderBottom: `1px solid ${CREAM2}`, paddingBottom: 8 },
  topRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${CREAM2}` },
  topRank: { fontFamily: SYS, fontSize: '.75rem', fontWeight: 700, color: AMB, minWidth: 28 },
  topName: { fontFamily: SYS, fontSize: '.9rem', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: INK },
  topCount: { fontFamily: SYS, fontSize: '.8rem', fontWeight: 600, color: MUTED },

  filterBar: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' },
  filterSelect: { fontFamily: SYS, fontSize: '.85rem', padding: '8px 10px', background: CREAM, border: `1.5px solid ${INK}`, color: INK, cursor: 'pointer', minHeight: 44, borderRadius: 4 },
  filterInput: { fontFamily: SYS, fontSize: '.85rem', padding: '8px 10px', background: CREAM, border: `1.5px solid ${CREAM2}`, borderBottom: `1.5px solid ${INK}`, color: INK, outline: 'none', minHeight: 44, flex: '1 1 140px' },
  csvBtn: { fontFamily: SYS, fontSize: '.85rem', fontWeight: 700, padding: '8px 18px', background: INK, color: CREAM, border: 'none', cursor: 'pointer', minHeight: 44, borderRadius: 4 },

  tableWrap: { overflowX: 'auto', border: `2px solid ${INK}`, background: CREAM, boxShadow: `4px 4px 0 ${CREAM2}` },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: SYS, fontSize: '.88rem' },
  th: { fontFamily: SYS, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '10px 12px', background: INK, color: CREAM, textAlign: 'left', whiteSpace: 'nowrap' },
  tr: { borderBottom: `1px solid ${CREAM2}` },
  td: { padding: '10px 12px', color: INK, verticalAlign: 'middle' },
  badge: { fontFamily: SYS, fontSize: '.7rem', fontWeight: 700, color: '#fff', padding: '3px 9px', textTransform: 'uppercase', display: 'inline-block', borderRadius: 3 },

  pag: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, flexWrap: 'wrap' },
  pagInfo: { fontFamily: SYS, fontSize: '.8rem', color: MUTED, marginRight: 8 },
  pagBtn: { fontFamily: SYS, fontSize: '.8rem', fontWeight: 600, padding: '6px 10px', background: CREAM, border: `1.5px solid ${CREAM2}`, color: INK, cursor: 'pointer', minWidth: 36, minHeight: 36, borderRadius: 4 },
  pagBtnActive: { background: INK, color: CREAM, border: `1.5px solid ${INK}` },
  pagEllipsis: { fontFamily: SYS, color: MUTED, padding: '0 4px' },
}
