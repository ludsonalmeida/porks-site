export default function SvgFilters() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',width:0,height:0,overflow:'hidden'}}>
      <defs>
        <filter id="worn" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="3" result="n"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3 0 0 5 -0.3" in="n" result="m"/>
          <feComposite in="SourceGraphic" in2="m" operator="in"/>
        </filter>
        <filter id="rip" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="turbulence" baseFrequency="0.025 0.06" numOctaves="3" seed="8" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="smudge" x="-4%" y="-4%" width="108%" height="108%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="2" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    </svg>
  )
}
