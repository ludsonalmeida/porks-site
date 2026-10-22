import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import '../index.css'
import { PerfilCabeca, PerfilAbas, Ico } from './BandaPerfil.jsx'

const ABAS_OK = ['geral', 'midia', 'avaliacoes', 'shows']

// avaliações de mentira só pra ver a tela cheia em desenvolvimento (?demo=1)
const DEMO = import.meta.env.DEV && new URLSearchParams(window.location.search).has('demo')
function avaliacoesDemo() {
  const itens = [
    { id: 1, nome: 'Mariana Alves', contexto: 'Assistiu em 18 de out', quando: 'há 3 dias', nota: 5, texto: 'Que show! Repertório de rock nacional perfeito, cantei do começo ao fim. Voltaria fácil.' },
    { id: 2, nome: 'Pedro Henrique', contexto: 'Assistiu em 18 de out', quando: 'há 4 dias', nota: 5, texto: 'Vocal afinado e volume na medida, deu pra conversar na mesa.' },
    { id: 3, nome: 'Camila Rocha', contexto: 'Assistiu em 11 de out', quando: 'há 1 semana', nota: 4, texto: 'Muito bom, só faltou um bis.' },
    { id: 4, nome: 'Lucas Martins', contexto: 'Assistiu em 11 de out', quando: 'há 1 semana', nota: 3, texto: '' },
  ]
  return { media: itens.reduce((s, x) => s + x.nota, 0) / itens.length, total: itens.length, itens }
}

export default function PaginaBanda() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const [b, setB] = useState(null)
  const [erro, setErro] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const aba = ABAS_OK.includes(params.get('aba')) ? params.get('aba') : 'geral'

  useEffect(() => {
    let vivo = true
    fetch(`/api/bandas/publico/${encodeURIComponent(slug)}`)
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(d => { if (vivo) setB(DEMO ? { ...d, avaliacoes: avaliacoesDemo() } : d) })
      .catch(s => { if (vivo) setErro(s === 404 ? 404 : 'rede') })
    return () => { vivo = false }
  }, [slug])

  useEffect(() => {
    if (b) document.title = `${b.banda} · banda no Porks Sobradinho`
  }, [b])

  function irAba(id) {
    setParams(id === 'geral' ? {} : { aba: id }, { replace: true })
    document.getElementById('bp-abas-topo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function compartilhar() {
    const url = `${window.location.origin}/bandas/${b.slug}`
    if (navigator.share) {
      try { await navigator.share({ title: b.banda, text: `Conheça a banda ${b.banda} no Porks Sobradinho`, url }); return } catch { /* cancelou */ }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch { window.prompt('Copie o link da banda:', url) }
  }

  return (
    <div className="bp-pagina">
      <nav className="bp-topo">
        <a href="/" className="bp-topo-logo" aria-label="Porks Sobradinho, página inicial"><img src="/images/logo-porks.png" alt="Porks Sobradinho" /></a>
        {b && <button type="button" className="bp-topo-btn" onClick={compartilhar}><Ico n="compartilhar" />Compartilhar</button>}
      </nav>

      <main className="bp-main">
        {erro ? (
          <div className="bp-vazio bp-vazio-pagina">
            <Ico n="palco" className="bp-vazio-ico" />
            <b>{erro === 404 ? 'Banda não encontrada' : 'Não deu pra carregar a banda'}</b>
            <span>{erro === 404 ? 'O link pode estar errado ou a banda saiu do ar.' : 'Confere a internet e tenta de novo.'}</span>
            <a className="bp-btn" href="/">Ir pro site do Porks</a>
          </div>
        ) : !b ? (
          <div className="bp-esqueleto" aria-busy="true" aria-label="Carregando banda">
            <div className="bp-esq bp-esq-capa" /><div className="bp-esq bp-esq-linha" /><div className="bp-esq bp-esq-linha curta" /><div className="bp-esq bp-esq-card" />
          </div>
        ) : (
          <>
            <PerfilCabeca b={b} onIrAba={irAba} acoes={<>
              <button type="button" className="bp-acao" onClick={compartilhar}><span><Ico n="compartilhar" /></span>Compartilhar</button>
              {(b.videos.length > 0 || b.fotos.length > 0) && <button type="button" className="bp-acao" onClick={() => irAba('midia')}><span><Ico n={b.videos.length ? 'video' : 'foto'} /></span>{b.videos.length ? 'Vídeos' : 'Fotos'}</button>}
              <button type="button" className="bp-acao" onClick={() => irAba('avaliacoes')}><span><Ico n="estrela" /></span>Avaliações</button>
              {b.instagram && <a className="bp-acao" href={/^https?:/.test(b.instagram) ? b.instagram : `https://instagram.com/${b.instagram}`} target="_blank" rel="noopener noreferrer"><span><Ico n="instagram" /></span>Instagram</a>}
            </>} />
            <div id="bp-abas-topo" />
            <PerfilAbas b={b} aba={aba} onAba={irAba} />

            <a className="bp-cta-johnny" href="/produtor">
              <img src="/images/johnny.jpg" alt="" />
              <div><b>Sua banda quer tocar no Porks?</b><span>Fala com o Johnny, nosso produtor musical</span></div>
              <Ico n="dir" />
            </a>
          </>
        )}
      </main>

      <div className="bp-toast" role="status" aria-live="polite">{copiado && <><Ico n="check" />Link da banda copiado</>}</div>
    </div>
  )
}
