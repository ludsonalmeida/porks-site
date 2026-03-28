import { useState, useEffect, useRef } from 'react'
import { getHeroCards, saveHeroCards, DEFAULT_CARDS } from '../utils/heroCards.js'
import { getBreweries, saveBreweries, DEFAULT_BREWERIES } from '../utils/breweriesCards.js'
import AdminRadio from './AdminRadio.jsx'

const PASS = import.meta.env.VITE_ADMIN_PASS || 'porks2026'
const MAX_W = 900

function resizeToBase64(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, MAX_W / img.width)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = reject
    img.src = url
  })
}

/* ── Google Fonts já carregadas pelo site (Bebas Neue, Barlow Condensed, Barlow) ── */

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [input, setInput] = useState('')
  const [err, setErr] = useState('')
  const [cards, setCards] = useState(DEFAULT_CARDS)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState({})
  const [tab, setTab] = useState('hero')
  const [brews, setBrews] = useState(DEFAULT_BREWERIES)
  const [brewSaved, setBrewSaved] = useState(false)
  const [brewUploading, setBrewUploading] = useState({})
  const fileRefs = useRef({})
  const brewFileRefs = useRef({})

  useEffect(() => {
    if (sessionStorage.getItem('porks_admin') === '1') setAuthed(true)
  }, [])

  useEffect(() => {
    if (authed) {
      setCards(getHeroCards())
      setBrews(getBreweries())
    }
  }, [authed])

  function updateBrew(id, field, value) {
    setBrews(bs => bs.map(b => b.id === id ? { ...b, [field]: value } : b))
    setBrewSaved(false)
  }
  function addBrew() {
    const newId = Date.now()
    setBrews(bs => [...bs, { id: newId, name: '', logo: '' }])
  }
  function removeBrew(id) {
    setBrews(bs => bs.filter(b => b.id !== id))
  }
  async function handleBrewUpload(id, file) {
    if (!file) return
    setBrewUploading(u => ({ ...u, [id]: true }))
    try {
      const b64 = await resizeToBase64(file)
      updateBrew(id, 'logo', b64)
    } catch (_) {}
    setBrewUploading(u => ({ ...u, [id]: false }))
  }

  async function handleBrewSave(e) {
    e.preventDefault()
    await saveBreweries(brews.filter(b => b.name), PASS)
    setBrewSaved(true)
    setTimeout(() => setBrewSaved(false), 3500)
  }

  function login(e) {
    e.preventDefault()
    if (input === PASS) {
      sessionStorage.setItem('porks_admin', '1')
      setAuthed(true)
    } else {
      setErr('Senha incorreta')
    }
  }

  function updateCard(id, field, value) {
    setCards(cs => cs.map(c => c.id === id ? { ...c, [field]: value } : c))
    setSaved(false)
  }

  async function handleUpload(id, file) {
    if (!file) return
    setUploading(u => ({ ...u, [id]: true }))
    try {
      const b64 = await resizeToBase64(file)
      updateCard(id, 'img', b64)
    } catch (_) {}
    setUploading(u => ({ ...u, [id]: false }))
  }

  async function handleSave(e) {
    e.preventDefault()
    await saveHeroCards(cards, PASS)
    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }

  if (!authed) return (
    <div style={S.page}>
      <div style={S.loginWrap}>
        {/* Ticket shape */}
        <div style={S.loginTicket}>
          <div style={S.ticketHoleL} />
          <div style={S.ticketHoleR} />

          <div style={S.loginHead}>
            <div style={S.loginStamp}>ACESSO RESTRITO</div>
            <div style={S.loginLogo}>PORKS</div>
            <div style={S.loginSub}>SOBRADINHO · PAINEL BACKSTAGE</div>
          </div>

          <div style={S.loginDivider} />

          <form onSubmit={login} style={{ padding: '0 4px' }}>
            <label style={S.loginLabel} htmlFor="admin-pass">SENHA DE ACESSO</label>
            <input
              id="admin-pass"
              type="password"
              placeholder="••••••••"
              value={input}
              onChange={e => { setInput(e.target.value); setErr('') }}
              style={S.passInput}
              autoFocus
            />
            {err && <p style={S.err} role="alert">⚠ {err}</p>}
            <button type="submit" style={S.loginBtn}>ENTRAR</button>
          </form>

          <div style={S.loginFooter}>
            <span style={S.loginFooterText}>★ HERO CARDS MANAGER ★</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={S.page}>
      {/* Topbar */}
      <div style={S.topbar}>
        <a href="/" target="_blank" rel="noopener noreferrer" style={S.back}>← Ver site</a>
        <div style={S.topCenter}>
          <span style={S.topBadge}>BACKSTAGE</span>
          <span style={S.topTitle}>PORKS ADMIN</span>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('porks_admin'); setAuthed(false) }}
          style={S.logoutBtn}
          aria-label="Sair do painel"
        >
          SAIR
        </button>
      </div>

      {/* Tabs de navegação */}
      <div style={S.tabBar}>
        {[
          { id: 'hero',       label: 'Hero Cards',   icon: '▣' },
          { id: 'cervejarias', label: 'Cervejarias',  icon: '🍺' },
          { id: 'radio',      label: 'Rádio',        icon: '♫' },
        ].map(t => (
          <button
            key={t.id}
            style={{ ...S.tabBtn, ...(tab === t.id ? S.tabBtnActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            <span style={S.tabIcon}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div style={S.content}>
        {tab === 'hero' && (
          <>
            {saved && (
              <div style={S.banner} role="status" aria-live="polite">
                <span style={S.bannerIcon}>✓</span>
                Cards salvos! Recarregue o site para ver as mudanças.
              </div>
            )}
            <p style={S.pageDesc}>
              Edite os 3 cards que aparecem no hero do site em mobile.
            </p>
            <form onSubmit={handleSave}>
          <div style={S.grid}>
            {cards.map((card, i) => (
              <div key={card.id} style={S.ticket}>
                {/* Punch holes */}
                <div style={S.holeL} />
                <div style={S.holeR} />

                {/* Número do card */}
                <div style={S.ticketLabel}>CARD {i + 1} DE 3</div>

                {/* Preview da imagem */}
                <div style={S.imgWrap}>
                  {card.img
                    ? <img
                        src={card.img}
                        alt={`Preview card ${i + 1}`}
                        style={S.cardImg}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                    : null
                  }
                  <div style={{ ...S.cardNoImg, display: card.img ? 'none' : 'flex' }}>
                    <span style={S.noImgIcon}>⬡</span>
                    <span style={S.noImgText}>SEM IMAGEM</span>
                  </div>
                </div>

                <div style={S.ticketDash} />

                {/* Campos */}
                <div style={S.fields}>
                  <label style={S.fieldLabel} htmlFor={`tag-${card.id}`}>TAG (TOPO)</label>
                  <input
                    id={`tag-${card.id}`}
                    style={S.input}
                    value={card.tag}
                    onChange={e => updateCard(card.id, 'tag', e.target.value)}
                    placeholder="★ shows ao vivo"
                  />

                  <label style={S.fieldLabel} htmlFor={`title-${card.id}`}>TÍTULO</label>
                  <input
                    id={`title-${card.id}`}
                    style={{ ...S.input, ...S.inputTitle }}
                    value={card.title}
                    onChange={e => updateCard(card.id, 'title', e.target.value)}
                    placeholder="SEXTA-FEIRA"
                  />

                  <label style={S.fieldLabel} htmlFor={`sub-${card.id}`}>SUBTÍTULO</label>
                  <input
                    id={`sub-${card.id}`}
                    style={S.input}
                    value={card.sub}
                    onChange={e => updateCard(card.id, 'sub', e.target.value)}
                    placeholder="Rock ao vivo · sem couvert"
                  />

                  <label style={S.fieldLabel}>IMAGEM</label>
                  {/* Input file oculto */}
                  <input
                    ref={el => fileRefs.current[card.id] = el}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleUpload(card.id, e.target.files[0])}
                  />
                  <button
                    type="button"
                    style={uploading[card.id] ? S.uploadBtnLoading : S.uploadBtn}
                    onClick={() => fileRefs.current[card.id]?.click()}
                    disabled={!!uploading[card.id]}
                  >
                    {uploading[card.id] ? 'PROCESSANDO...' : card.img ? '↑ TROCAR IMAGEM' : '↑ SUBIR IMAGEM'}
                  </button>
                  {card.img && (
                    <button
                      type="button"
                      style={S.removeBtn}
                      onClick={() => updateCard(card.id, 'img', '')}
                    >
                      ✕ remover
                    </button>
                  )}
                  <label style={{ ...S.fieldLabel, marginTop: 10 }}>OU COLE UMA URL</label>
                  <input
                    id={`img-${card.id}`}
                    style={S.input}
                    value={(card.img && !card.img.startsWith('data:')) ? card.img : ''}
                    onChange={e => updateCard(card.id, 'img', e.target.value)}
                    placeholder="https://..."
                    type="url"
                  />

                  <label style={S.checkLabel}>
                    <input
                      type="checkbox"
                      checked={card.tape}
                      onChange={e => updateCard(card.id, 'tape', e.target.checked)}
                      style={S.checkbox}
                    />
                    FITA ADESIVA NO CARD
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" style={S.saveBtn}>
            ★ SALVAR TODOS OS CARDS
          </button>
        </form>
          </>
        )}

        {tab === 'cervejarias' && (
          <>
            {brewSaved && (
              <div style={S.banner} role="status" aria-live="polite">
                <span style={S.bannerIcon}>✓</span>
                Cervejarias salvas! Recarregue o site para ver as mudanças.
              </div>
            )}
            <p style={S.pageDesc}>
              Gerencie as cervejarias parceiras que aparecem no carrossel.
            </p>
            <form onSubmit={handleBrewSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {brews.map((b) => (
                  <div key={b.id} style={{ ...S.brewRow, alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px dashed ${CREAM2}` }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <input
                        style={S.input}
                        placeholder="Nome da cervejaria"
                        value={b.name || ''}
                        onChange={e => updateBrew(b.id, 'name', e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          ref={el => brewFileRefs.current[b.id] = el}
                          type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => handleBrewUpload(b.id, e.target.files[0])}
                        />
                        <button
                          type="button"
                          style={{ ...S.uploadBtn, flex: '0 0 auto', padding: '8px 12px', fontSize: '.7rem', marginBottom: 0 }}
                          onClick={() => brewFileRefs.current[b.id]?.click()}
                          disabled={!!brewUploading[b.id]}
                        >
                          {brewUploading[b.id] ? '...' : '↑ Upload'}
                        </button>
                        <input
                          style={{ ...S.input, flex: 1, marginBottom: 0 }}
                          placeholder="ou URL do logo (https://...)"
                          value={(b.logo && !b.logo.startsWith('data:')) ? b.logo : ''}
                          onChange={e => updateBrew(b.id, 'logo', e.target.value)}
                        />
                      </div>
                    </div>
                    {b.logo && <img src={b.logo} alt={b.name} style={S.brewThumb} onError={e => e.target.style.display='none'} />}
                    <button type="button" style={S.removeBtnSm} onClick={() => removeBrew(b.id)}>✕</button>
                  </div>
                ))}
              </div>
              <button type="button" style={{ ...S.saveBtn, background: '#3a2a10', marginTop: 16, marginBottom: 8 }} onClick={addBrew}>
                + Adicionar cervejaria
              </button>
              <button type="submit" style={S.saveBtn}>★ SALVAR CERVEJARIAS</button>
            </form>
          </>
        )}

        {tab === 'radio' && (
          <AdminRadio pass={PASS} />
        )}
      </div>
    </div>
  )
}

/* ─── Paleta ─── */
const CREAM   = '#f2e8d5'
const CREAM2  = '#e8dcc6'
const INKDK   = '#1a0f05'
const INK     = '#2e1c08'
const RED     = '#e74c3c'
const REDDK   = '#c0392b'
const AMB     = '#cc6a0a'
const AMBLT   = '#e18a16'
const MUTED   = '#7a5c35'
const DIVIDER = 'rgba(46,28,8,.18)'

const BEBAS = "'Bebas Neue', 'Barlow Condensed', sans-serif"
const BARLOW_C = "'Barlow Condensed', 'Oswald', sans-serif"
const BARLOW = "'Barlow', sans-serif"

const S = {
  /* ── Layout ── */
  page: {
    minHeight: '100vh',
    background: CREAM,
    fontFamily: BARLOW,
    color: INK,
  },

  /* ── Login ── */
  loginWrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loginTicket: {
    background: CREAM,
    border: `2px solid ${INK}`,
    borderRadius: 4,
    width: '100%',
    maxWidth: 360,
    padding: '32px 32px 24px',
    position: 'relative',
    boxShadow: `4px 4px 0 ${INK}`,
  },
  ticketHoleL: {
    position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
    width: 28, height: 28, borderRadius: '50%',
    background: CREAM, border: `2px solid ${INK}`,
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,.15)',
  },
  ticketHoleR: {
    position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
    width: 28, height: 28, borderRadius: '50%',
    background: CREAM, border: `2px solid ${INK}`,
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,.15)',
  },
  loginHead: { textAlign: 'center', marginBottom: 20 },
  loginStamp: {
    display: 'inline-block',
    fontFamily: BARLOW_C,
    fontSize: '.58rem', fontWeight: 800, letterSpacing: '.22em',
    color: CREAM, background: RED,
    padding: '3px 10px', marginBottom: 12,
    textTransform: 'uppercase',
  },
  loginLogo: {
    fontFamily: BEBAS,
    fontSize: '4.5rem', lineHeight: 1,
    color: INK, letterSpacing: '.06em',
    textShadow: `2px 2px 0 ${CREAM2}`,
  },
  loginSub: {
    fontFamily: BARLOW_C,
    fontSize: '.58rem', fontWeight: 700, letterSpacing: '.22em',
    color: MUTED, textTransform: 'uppercase', marginTop: 4,
  },
  loginDivider: {
    borderTop: `2px dashed ${CREAM2}`,
    margin: '0 -32px 20px',
  },
  loginLabel: {
    display: 'block',
    fontFamily: BARLOW_C,
    fontSize: '.62rem', fontWeight: 800, letterSpacing: '.18em',
    color: MUTED, textTransform: 'uppercase', marginBottom: 6,
  },
  passInput: {
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px',
    background: CREAM2, border: `1.5px solid ${INK}`,
    color: INK, borderRadius: 2,
    fontFamily: BARLOW, fontSize: '1rem',
    outline: 'none',
    boxShadow: 'inset 0 1px 4px rgba(0,0,0,.1)',
  },
  err: {
    fontFamily: BARLOW_C, fontSize: '.75rem', fontWeight: 700,
    letterSpacing: '.08em', color: RED, marginTop: 8,
  },
  loginBtn: {
    width: '100%', marginTop: 14,
    padding: '13px', cursor: 'pointer',
    background: RED, color: '#fff', border: `2px solid ${REDDK}`,
    fontFamily: BEBAS, fontSize: '1.3rem', letterSpacing: '.12em',
    boxShadow: `3px 3px 0 ${REDDK}`,
    transition: 'transform .1s, box-shadow .1s',
  },
  loginFooter: {
    textAlign: 'center', marginTop: 20,
    borderTop: `1px dashed ${CREAM2}`, paddingTop: 12,
  },
  loginFooterText: {
    fontFamily: BARLOW_C, fontSize: '.52rem', fontWeight: 700,
    letterSpacing: '.24em', color: MUTED, textTransform: 'uppercase',
  },

  /* ── Topbar ── */
  topbar: {
    background: INK,
    padding: '0 24px',
    height: 52,
    display: 'flex', alignItems: 'center', gap: 16,
    borderBottom: `3px solid ${RED}`,
  },
  back: {
    fontFamily: BARLOW_C, fontSize: '.72rem', fontWeight: 700,
    letterSpacing: '.14em', textTransform: 'uppercase',
    color: CREAM2, textDecoration: 'none',
    opacity: .7,
  },
  topCenter: {
    display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center',
  },
  topBadge: {
    fontFamily: BARLOW_C, fontSize: '.55rem', fontWeight: 800,
    letterSpacing: '.22em', background: RED, color: '#fff',
    padding: '2px 8px', textTransform: 'uppercase',
  },
  topTitle: {
    fontFamily: BEBAS, fontSize: '1.5rem', letterSpacing: '.1em',
    color: CREAM, lineHeight: 1,
  },
  logoutBtn: {
    fontFamily: BARLOW_C, fontSize: '.65rem', fontWeight: 800,
    letterSpacing: '.16em', textTransform: 'uppercase',
    background: 'none', border: `1px solid rgba(242,232,213,.25)`,
    color: CREAM2, padding: '6px 12px', cursor: 'pointer',
    opacity: .7, minHeight: 36,
  },

  /* ── Tab nav ── */
  tabBar: {
    background: CREAM2, borderBottom: `2px solid ${INK}`,
    display: 'flex', gap: 0,
  },
  tabBtn: {
    fontFamily: BEBAS, fontSize: '1.1rem', letterSpacing: '.1em',
    padding: '12px 28px', cursor: 'pointer',
    background: 'none', border: 'none', borderRight: `1px solid ${INK}`,
    color: MUTED, display: 'flex', alignItems: 'center', gap: 8,
    transition: 'background .15s, color .15s',
    minHeight: 48,
  },
  tabBtnActive: {
    background: INK, color: CREAM,
  },
  tabIcon: { fontSize: '1rem' },

  /* ── Content ── */
  content: {
    maxWidth: 1020, margin: '32px auto', padding: '0 20px 80px',
  },
  banner: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#2e7d32', color: '#fff',
    fontFamily: BARLOW_C, fontSize: '.8rem', fontWeight: 700, letterSpacing: '.1em',
    padding: '12px 20px', marginBottom: 28,
    border: '2px solid #1b5e20',
    boxShadow: '3px 3px 0 #1b5e20',
  },
  bannerIcon: { fontSize: '1.1rem', fontWeight: 900 },
  pageDesc: {
    fontFamily: BARLOW, fontSize: '.9rem', color: MUTED,
    marginBottom: 28, lineHeight: 1.6, maxWidth: 620,
  },

  /* ── Grid ── */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: 28,
  },

  /* ── Ticket card ── */
  ticket: {
    background: CREAM,
    border: `2px solid ${INK}`,
    borderRadius: 2,
    position: 'relative',
    boxShadow: `4px 4px 0 ${CREAM2}, 5px 5px 0 ${INK}`,
    overflow: 'visible',
  },
  holeL: {
    position: 'absolute', left: -11, top: 180,
    width: 22, height: 22, borderRadius: '50%',
    background: CREAM, border: `2px solid ${INK}`,
    zIndex: 2,
  },
  holeR: {
    position: 'absolute', right: -11, top: 180,
    width: 22, height: 22, borderRadius: '50%',
    background: CREAM, border: `2px solid ${INK}`,
    zIndex: 2,
  },
  ticketLabel: {
    fontFamily: BARLOW_C, fontSize: '.58rem', fontWeight: 800,
    letterSpacing: '.26em', textTransform: 'uppercase',
    background: AMB, color: '#fff',
    padding: '4px 12px',
  },
  imgWrap: {
    position: 'relative', width: '100%', aspectRatio: '4/5', overflow: 'hidden',
    background: CREAM2,
  },
  cardImg: {
    width: '100%', height: '100%', objectFit: 'cover', display: 'block',
  },
  cardNoImg: {
    height: '100%', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    background: CREAM2,
  },
  noImgIcon: { fontSize: '1.8rem', color: CREAM2, filter: `drop-shadow(0 1px 0 ${MUTED})` },
  noImgText: {
    fontFamily: BARLOW_C, fontSize: '.58rem', fontWeight: 800,
    letterSpacing: '.22em', color: MUTED, textTransform: 'uppercase',
  },
  ticketDash: {
    borderTop: `2px dashed ${CREAM2}`,
    margin: '0 -2px',
  },

  /* ── Fields ── */
  fields: { padding: '14px 16px 18px' },
  fieldLabel: {
    display: 'block',
    fontFamily: BARLOW_C, fontSize: '.6rem', fontWeight: 800,
    letterSpacing: '.2em', textTransform: 'uppercase',
    color: MUTED, margin: '12px 0 4px',
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 10px',
    background: CREAM2, border: `1.5px solid ${CREAM2}`,
    borderBottom: `1.5px solid ${INK}`,
    color: INK, fontFamily: BARLOW, fontSize: '.9rem',
    outline: 'none', borderRadius: 0,
    transition: 'border-color .15s',
  },
  inputTitle: {
    fontFamily: BEBAS, fontSize: '1.2rem', letterSpacing: '.06em',
  },
  checkLabel: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: BARLOW_C, fontSize: '.62rem', fontWeight: 800,
    letterSpacing: '.16em', textTransform: 'uppercase',
    color: MUTED, marginTop: 14, cursor: 'pointer',
    minHeight: 44,
  },
  checkbox: { width: 18, height: 18, cursor: 'pointer', accentColor: RED },

  /* ── Upload button ── */
  uploadBtn: {
    width: '100%', padding: '10px', cursor: 'pointer', boxSizing: 'border-box',
    background: INK, color: CREAM,
    border: `2px solid ${INK}`,
    fontFamily: BEBAS, fontSize: '1rem', letterSpacing: '.12em',
    boxShadow: `2px 2px 0 ${AMB}`,
    transition: 'transform .1s, box-shadow .1s',
    marginBottom: 4,
  },
  uploadBtnLoading: {
    width: '100%', padding: '10px', cursor: 'not-allowed', boxSizing: 'border-box',
    background: MUTED, color: CREAM2,
    border: `2px solid ${MUTED}`,
    fontFamily: BEBAS, fontSize: '1rem', letterSpacing: '.12em',
    marginBottom: 4,
  },
  removeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: BARLOW_C, fontSize: '.65rem', fontWeight: 700,
    letterSpacing: '.1em', textTransform: 'uppercase',
    color: RED, padding: '2px 0', marginBottom: 4,
  },

  /* ── Save button ── */
  saveBtn: {
    display: 'block', width: '100%',
    marginTop: 36, padding: '16px',
    background: RED, color: '#fff',
    border: `2px solid ${REDDK}`,
    fontFamily: BEBAS, fontSize: '1.5rem', letterSpacing: '.14em',
    cursor: 'pointer',
    boxShadow: `4px 4px 0 ${REDDK}`,
    transition: 'transform .1s, box-shadow .1s',
  },
  brewRow: {
    display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  },
  brewThumb: {
    height: 40, maxWidth: 60, objectFit: 'contain', borderRadius: 4,
    background: '#fff', padding: 2,
  },
  removeBtnSm: {
    background: 'none', border: `1px solid ${REDDK}`, color: RED,
    width: 32, height: 32, borderRadius: 4, cursor: 'pointer',
    fontFamily: BEBAS, fontSize: '1rem', flexShrink: 0,
  },
}
