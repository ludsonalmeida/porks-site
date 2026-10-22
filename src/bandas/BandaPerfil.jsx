import { useState, useEffect } from 'react'
import './banda-perfil.css'

/* ─ Perfil da banda: usado na página pública (/bandas/:slug) e na prévia do admin ─ */

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const ICONES = {
  estrela: <path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3L2.8 9.5l6.4-.9z" />,
  pessoas: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1" /><path d="M16 5a3 3 0 0 1 0 6M21 20v-1a5 5 0 0 0-3-4.6" /></>,
  local: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  relogio: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  palco: <><path d="M3 20h18M5 20V9l7-5 7 5v11" /><path d="M9 20v-5h6v5" /></>,
  nota: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  calendario: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  compartilhar: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></>,
  youtube: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" /></>,
  spotify: <><circle cx="12" cy="12" r="9.5" /><path d="M7 9.5c3.5-1 7.5-.6 10 1M7.5 12.5c3-.8 6-.4 8.5 1M8 15.5c2.5-.6 4.5-.3 6.5.8" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3z" /></>,
  foto: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.5" /></>,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  esq: <path d="m15 5-7 7 7 7" />,
  dir: <path d="m9 5 7 7-7 7" />,
  balao: <path d="M4 5h16v11H9l-5 4z" />,
  check: <path d="m5 12 5 5 9-10" />,
}
export function Ico({ n, className = 'bp-ico' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONES[n]}
    </svg>
  )
}

export function Estrelas({ nota = 0, className = '' }) {
  const pct = Math.max(0, Math.min(100, (nota / 5) * 100))
  const linha = cheia => Array.from({ length: 5 }, (_, i) => (
    <svg key={i} viewBox="0 0 24 24" aria-hidden="true" className="bp-estrela">
      <path d={ICONES.estrela.props.d} fill={cheia ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ))
  return (
    <span className={`bp-estrelas ${className}`} role="img" aria-label={nota ? `Nota ${nota.toFixed(1).replace('.', ',')} de 5` : 'Sem avaliações'}>
      <span className="bp-estrelas-base">{linha(false)}</span>
      <span className="bp-estrelas-cheias" style={{ width: `${pct}%` }}>{linha(true)}</span>
    </span>
  )
}

const notaTxt = n => n.toFixed(1).replace('.', ',')
const diaShow = iso => {
  const d = new Date(`${iso}T12:00:00`)
  return `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : ''}`
}
const hojeIso = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10)
const iniciais = nome => nome.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
const linkInsta = u => (/^https?:/.test(u) ? u : `https://instagram.com/${u}`)
const linkUrl = u => (/^https?:/.test(u) ? u : `https://${u}`)

/* ─ Cabeça: capa, foto, nome, estrelas, etiquetas, ações ─ */

export function PerfilCabeca({ b, acoes, onIrAba }) {
  const av = b.avaliacoes
  const proximo = b.shows.filter(s => s.data >= hojeIso()).sort((x, y) => x.data.localeCompare(y.data))[0]
  return (
    <header className="bp-cabeca">
      <div className="bp-capa">
        {b.capa
          ? <img src={b.capa} alt="" />
          : <div className="bp-capa-vazia" aria-hidden="true"><span>{b.banda}</span></div>}
      </div>
      <div className="bp-id">
        <div className="bp-avatar">
          {b.avatar ? <img src={b.avatar} alt={`Foto da banda ${b.banda}`} /> : <span aria-hidden="true">{iniciais(b.banda)}</span>}
        </div>
        <div className="bp-id-txt">
          <h1 className="bp-nome">{b.banda}</h1>
          <button type="button" className="bp-nota-linha" onClick={() => onIrAba?.('avaliacoes')}>
            {av.total
              ? <><b>{notaTxt(av.media)}</b><Estrelas nota={av.media} /><span>({av.total} {av.total === 1 ? 'avaliação' : 'avaliações'})</span></>
              : <><Estrelas nota={0} /><span>Sem avaliações ainda</span></>}
          </button>
          <p className="bp-tipo">
            Banda{b.estilos.length ? ` de ${b.estilos.slice(0, 3).join(', ').toLowerCase()}` : ''}{b.cidade ? ` · ${b.cidade}` : ''}
          </p>
        </div>
      </div>

      {proximo && (
        <div className="bp-proximo">
          <Ico n="calendario" />
          <span>Próximo show no Porks: <b>{diaShow(proximo.data)}, 20h</b>{proximo.titulo ? ` · ${proximo.titulo}` : ''}</span>
        </div>
      )}

      {acoes && <div className="bp-acoes">{acoes}</div>}
    </header>
  )
}

/* ─ Abas ─ */

const ABAS = [
  { id: 'geral', label: 'Visão geral' },
  { id: 'midia', label: 'Vídeos e fotos' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'shows', label: 'Shows' },
]

export function PerfilAbas({ b, aba, onAba }) {
  return (
    <>
      <div className="bp-abas" role="tablist" aria-label="Seções do perfil">
        {ABAS.map(a => (
          <button key={a.id} type="button" role="tab" id={`bp-aba-${a.id}`} aria-selected={aba === a.id} aria-controls={`bp-painel-${a.id}`}
            className={`bp-aba${aba === a.id ? ' on' : ''}`} onClick={() => onAba(a.id)}>
            {a.label}
            {a.id === 'midia' && <span className="bp-aba-n">{b.videos.length + b.fotos.length}</span>}
            {a.id === 'avaliacoes' && b.avaliacoes.total > 0 && <span className="bp-aba-n">{b.avaliacoes.total}</span>}
          </button>
        ))}
      </div>
      <div className="bp-painel" role="tabpanel" id={`bp-painel-${aba}`} aria-labelledby={`bp-aba-${aba}`}>
        {aba === 'geral' && <VisaoGeral b={b} onAba={onAba} />}
        {aba === 'midia' && <Midia b={b} />}
        {aba === 'avaliacoes' && <Avaliacoes b={b} />}
        {aba === 'shows' && <Shows b={b} />}
      </div>
    </>
  )
}

function Info({ ico, rotulo, children }) {
  return (
    <div className="bp-info">
      <Ico n={ico} />
      <div><small>{rotulo}</small><div>{children}</div></div>
    </div>
  )
}

function VisaoGeral({ b, onAba }) {
  const redes = [
    b.instagram && { n: 'instagram', label: `@${b.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}`, href: linkInsta(b.instagram) },
    b.youtube && { n: 'youtube', label: 'YouTube', href: linkUrl(b.youtube) },
    b.spotify && { n: 'spotify', label: 'Spotify', href: linkUrl(b.spotify) },
  ].filter(Boolean)
  return (
    <div className="bp-geral">
      <section className="bp-card">
        <h2>Sobre a banda</h2>
        {b.sobre
          ? <p className="bp-sobre">{b.sobre}</p>
          : <p className="bp-mudo">A banda ainda não contou a história dela por aqui.</p>}
      </section>

      <section className="bp-card">
        <h2>Informações</h2>
        <div className="bp-infos">
          <Info ico="pessoas" rotulo="Formação">
            {b.integrantes} {b.integrantes === 1 ? 'integrante' : 'integrantes'}
            {b.instrumentos.length > 0 && <div className="bp-chips">{b.instrumentos.map(i => <span key={i} className="bp-chip">{i}</span>)}</div>}
          </Info>
          {b.estilos.length > 0 && (
            <Info ico="nota" rotulo="Estilo"><div className="bp-chips">{b.estilos.map(e => <span key={e} className="bp-chip bp-chip-forte">{e}</span>)}</div></Info>
          )}
          {b.tempo && <Info ico="relogio" rotulo="Tempo de banda">{b.tempo}</Info>}
          {b.cidade && <Info ico="local" rotulo="De onde é">{b.cidade}</Info>}
          {b.lugares.length > 0 && (
            <Info ico="palco" rotulo="Já tocou em"><div className="bp-chips">{b.lugares.map(l => <span key={l} className="bp-chip">{l}</span>)}</div></Info>
          )}
        </div>
        {redes.length > 0 && (
          <div className="bp-redes">
            {redes.map(r => (
              <a key={r.n} href={r.href} target="_blank" rel="noopener noreferrer" className={`bp-rede bp-rede-${r.n}`}><Ico n={r.n} />{r.label}</a>
            ))}
          </div>
        )}
      </section>

      <section className="bp-card bp-card-click">
        <h2>Avaliações</h2>
        <ResumoNotas av={b.avaliacoes} compacto />
        <button type="button" className="bp-link" onClick={() => onAba('avaliacoes')}>Ver todas as avaliações</button>
      </section>

      {(b.fotos.length > 0 || b.videos.length > 0) && (
        <section className="bp-card">
          <h2>Vídeos e fotos</h2>
          <div className="bp-mini-galeria">
            {[...b.videos.slice(0, 1).map(v => ({ ...v, video: true })), ...b.fotos].slice(0, 4).map(m => (
              <button key={m.url} type="button" className="bp-mini" onClick={() => onAba('midia')} aria-label="Abrir vídeos e fotos">
                {m.video ? <><video src={`${m.url}#t=0.5`} muted playsInline preload="metadata" /><Ico n="video" className="bp-mini-ico" /></> : <img src={m.url} alt="" loading="lazy" />}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Midia({ b }) {
  const [aberta, setAberta] = useState(null)
  useEffect(() => {
    if (aberta === null) return
    const onKey = e => {
      if (e.key === 'Escape') setAberta(null)
      if (e.key === 'ArrowRight') setAberta(i => (i + 1) % b.fotos.length)
      if (e.key === 'ArrowLeft') setAberta(i => (i - 1 + b.fotos.length) % b.fotos.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [aberta, b.fotos.length])

  if (!b.videos.length && !b.fotos.length) {
    return <div className="bp-vazio"><Ico n="foto" className="bp-vazio-ico" /><b>Sem vídeos nem fotos ainda</b></div>
  }
  return (
    <div className="bp-midia">
      {b.videos.length > 0 && (
        <section>
          <h2 className="bp-sec-tit"><Ico n="video" />Vídeos ({b.videos.length})</h2>
          <div className="bp-videos">
            {b.videos.map((v, i) => (
              <video key={v.url} className={i === 0 ? 'bp-video-destaque' : ''} src={v.url} controls preload="metadata" playsInline />
            ))}
          </div>
        </section>
      )}
      {b.fotos.length > 0 && (
        <section>
          <h2 className="bp-sec-tit"><Ico n="foto" />Fotos ({b.fotos.length})</h2>
          <div className="bp-fotos">
            {b.fotos.map((f, i) => (
              <button key={f.url} type="button" className="bp-foto" onClick={() => setAberta(i)} aria-label={`Ampliar foto ${i + 1} de ${b.fotos.length}`}>
                <img src={f.url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </section>
      )}
      {aberta !== null && (
        <div className="bp-lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada" onClick={e => { if (e.target === e.currentTarget) setAberta(null) }}>
          <img src={b.fotos[aberta].url} alt={`Foto ${aberta + 1} de ${b.fotos.length} da banda ${b.banda}`} />
          <button type="button" className="bp-lb-btn bp-lb-fechar" onClick={() => setAberta(null)} aria-label="Fechar" autoFocus><Ico n="fechar" /></button>
          {b.fotos.length > 1 && <>
            <button type="button" className="bp-lb-btn bp-lb-esq" onClick={() => setAberta(i => (i - 1 + b.fotos.length) % b.fotos.length)} aria-label="Foto anterior"><Ico n="esq" /></button>
            <button type="button" className="bp-lb-btn bp-lb-dir" onClick={() => setAberta(i => (i + 1) % b.fotos.length)} aria-label="Próxima foto"><Ico n="dir" /></button>
          </>}
          <span className="bp-lb-cont">{aberta + 1} / {b.fotos.length}</span>
        </div>
      )}
    </div>
  )
}

function ResumoNotas({ av, compacto }) {
  const max = Math.max(1, ...[5, 4, 3, 2, 1].map(n => av.itens.filter(x => x.nota === n).length))
  return (
    <div className={`bp-resumo${compacto ? ' compacto' : ''}`}>
      <div className="bp-resumo-nota">
        <b>{av.total ? notaTxt(av.media) : '–'}</b>
        <Estrelas nota={av.media} />
        <span>{av.total ? `${av.total} ${av.total === 1 ? 'avaliação' : 'avaliações'}` : 'Nenhuma avaliação'}</span>
      </div>
      <div className="bp-barras">
        {[5, 4, 3, 2, 1].map(n => {
          const q = av.itens.filter(x => x.nota === n).length
          return (
            <div key={n} className="bp-barra" aria-label={`${n} estrelas: ${q}`}>
              <span>{n}</span>
              <div className="bp-barra-trilho"><div style={{ transform: `scaleX(${q / max})` }} /></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Avaliacoes({ b }) {
  const av = b.avaliacoes
  return (
    <div className="bp-avaliacoes">
      <section className="bp-card">
        <ResumoNotas av={av} />
        <div className="bp-avaliar">
          <button type="button" className="bp-btn" disabled aria-describedby="bp-em-breve"><Ico n="estrela" />Avaliar banda</button>
          <span id="bp-em-breve" className="bp-mudo">Em breve: depois do show, o público vai poder dar estrelas aqui.</span>
        </div>
      </section>
      {av.itens.length ? (
        <ul className="bp-reviews">
          {av.itens.map(r => (
            <li key={r.id} className="bp-review">
              <div className="bp-review-cab">
                <span className="bp-review-av" aria-hidden="true">{iniciais(r.nome)}</span>
                <div><b>{r.nome}</b><small>{r.contexto}</small></div>
              </div>
              <div className="bp-review-nota"><Estrelas nota={r.nota} /><small>{r.quando}</small></div>
              {r.texto && <p>{r.texto}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <div className="bp-vazio"><Ico n="balao" className="bp-vazio-ico" /><b>Nenhuma avaliação ainda</b><span>Quem assistir ao show vai poder contar o que achou.</span></div>
      )}
    </div>
  )
}

function Shows({ b }) {
  const hoje = hojeIso()
  const prox = b.shows.filter(s => s.data >= hoje).sort((x, y) => x.data.localeCompare(y.data))
  const foram = b.shows.filter(s => s.data < hoje)
  const linha = s => (
    <li key={s.data + s.titulo} className="bp-show">
      <span className="bp-show-data"><b>{new Date(`${s.data}T12:00:00`).getDate()}</b>{MESES[new Date(`${s.data}T12:00:00`).getMonth()]}</span>
      <div><b>{s.titulo || 'Show ao vivo'}</b><small>{diaShow(s.data)} · a partir das 20h · Porks Sobradinho</small></div>
    </li>
  )
  if (!b.shows.length) {
    return <div className="bp-vazio"><Ico n="palco" className="bp-vazio-ico" /><b>Ainda não tocou no Porks</b><span>Quando a banda subir no palco da casa, a data aparece aqui.</span></div>
  }
  return (
    <div className="bp-shows">
      {prox.length > 0 && <section><h2 className="bp-sec-tit">Próximos shows</h2><ul>{prox.map(linha)}</ul></section>}
      {foram.length > 0 && <section><h2 className="bp-sec-tit">Já tocou no Porks ({foram.length})</h2><ul className="bp-shows-foram">{foram.map(linha)}</ul></section>}
    </div>
  )
}
