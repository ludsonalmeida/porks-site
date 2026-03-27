import './index.css'
import useReveal from './hooks/useReveal'
import SvgFilters from './components/SvgFilters'
import Nav from './components/Nav'
import Hero from './components/Hero'
import TornEdge from './components/TornEdge'
import Ticker from './components/Ticker'
import Identity from './components/Identity'
import ChopeComida from './components/ChopeComida'
import Ocasioes from './components/Ocasioes'
import Aniversario from './components/Aniversario'
import Grupos from './components/Grupos'
import Empresa from './components/Empresa'
import Reviews from './components/Reviews'
import Agenda from './components/Agenda'
import CtaBand from './components/CtaBand'
import Faq from './components/Faq'
import Footer from './components/Footer'
import Sticky from './components/Sticky'
import WaFloat from './components/WaFloat'

export default function App() {
  useReveal()

  return (
    <>
      <SvgFilters />
      <Nav />
      {/* TOPO — Atração */}
      <Hero />
      <TornEdge type="darkToAmber" />
      <Ticker />
      <TornEdge type="amberToKraft" />
      <Identity />
      {/* MEIO — Interesse & Desejo */}
      <TornEdge type="kraftToDark" />
      <ChopeComida />
      <TornEdge type="darkToAged" />
      <Ocasioes />
      <Aniversario />
      <Grupos />
      <Empresa />
      {/* FUNDO — Prova Social & Ação */}
      <TornEdge type="agedToDark" />
      <Reviews />
      <TornEdge type="darkToKraft" />
      <Agenda />
      <CtaBand />
      <Faq />
      <Footer />
      <Sticky />
      <WaFloat />
    </>
  )
}
