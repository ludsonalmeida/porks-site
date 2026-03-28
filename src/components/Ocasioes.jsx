import { waLink } from '../utils/wa.js'

const grid1 = [
  { img: 'https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p1.jpg', h: 370, bar: 'r', tag: '★ Mesa avulsa', title: 'Reserva Particular', text: 'Pra date, casal, encontro com amigos ou aquela noite que você quer começar do jeito certo.', cta: 'Reservar mesa', waSection: 'ocasioes' },
  { img: 'https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p2.jpg', h: 220, bar: 'r', tag: '★ Celebração', title: 'Aniversário', text: 'Junta a galera, comemora com rock, chope gelado e uma experiência feita pro seu dia.', cta: 'Fazer aniversário aqui', href: '#aniversario' },
  { img: 'https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p3.jpg', h: 220, bar: 'a', tag: '★ Turma reunida', title: 'Confraternização', text: 'Formatura, despedida, reencontro, amigo oculto ou resenha organizada.', cta: 'Reservar para grupo', href: '#grupos' },
]
const grid2 = [
  { img: 'https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/p4.jpg', h: 220, bar: 'a', tag: '★ Turma & amigos', title: 'Grupos', text: 'Qualquer tamanho de turma. O Porks tem espaço pra todo mundo brindar junto.', cta: 'Reservar para grupo', href: '#grupos' },
  { img: '/images/oc-corporativo.jpg', h: 370, bar: 'y', tag: '★ Corporativo', title: 'Evento de Empresa', text: 'Happy hour, encontro do time, recepção de clientes ou evento corporativo de verdade.', cta: 'Reservar evento', href: '#empresa', imgPos: 'center 60%' },
]

function Card({ d, delay }) {
  return (
    <div className={`oc rv${delay ? ` d${delay}` : ''}`}>
      <div className="oc-photo">
        <img src={d.img} alt={d.title} style={{height:d.h,objectFit:'cover',objectPosition:d.imgPos||'center top'}} loading="lazy" />
        <div className="oc-photo-grad" />
      </div>
      <div className={`oc-bar ${d.bar}`} />
      <div className="oc-body">
        <div className="oc-tag">{d.tag}</div>
        <div className="oc-title">{d.title}</div>
        <div className="oc-text">{d.text}</div>
        <a href={d.waSection ? waLink(d.waSection) : d.href} className="oc-cta">{d.cta}</a>
      </div>
    </div>
  )
}

export default function Ocasioes() {
  return (
    <section className="ocasioes pad" id="ocasioes" style={{paddingTop:8}}>
      <div className="wrap">
        <div className="occ-head rv">
          <div className="stamp stamp-red" style={{marginBottom:14,position:'relative',zIndex:2}}>ESCOLHA SUA OCASIÃO</div>
          <div className="bebas" style={{fontSize:'clamp(2.5rem,5.5vw,5rem)',color:'var(--ink)',lineHeight:.88,display:'block'}}>QUAL É O MOTIVO</div>
          <div className="bebas" style={{fontSize:'clamp(2.5rem,5.5vw,5rem)',color:'var(--amb)',lineHeight:.88,display:'block'}}>DA NOITE? ★</div>
          <div className="occ-divider">● ENTRADA GRATUITA ● SEM COUVERT ● RESERVAS LIMITADAS ●</div>
        </div>
        <div className="occ-grid">
          {grid1.map((d, i) => <Card key={i} d={d} delay={i} />)}
        </div>
        <div className="occ-r2" style={{marginTop:3}}>
          {grid2.map((d, i) => <Card key={i} d={d} delay={i} />)}
        </div>
      </div>
    </section>
  )
}
