type BrandLogoProps = {
  size?: number
  markOnly?: boolean
  showTagline?: boolean
  inverse?: boolean
  className?: string
}

const heavyFont = 'Arial Black, Inter, ui-sans-serif, system-ui, sans-serif'

export default function BrandLogo({
  size = 44,
  markOnly = false,
  showTagline = false,
  inverse = false,
  className,
}: BrandLogoProps) {
  const logoSize = Math.max(18, size)
  const fontSize = Math.max(14, Math.round(logoSize * 0.72))

  return (
    <span
      className={className}
      aria-label="ComercioLleno.com"
      style={{
        display: 'inline-flex',
        flexDirection: showTagline && !markOnly ? 'column' : 'row',
        alignItems: showTagline && !markOnly ? 'flex-start' : 'center',
        justifyContent: 'center',
        gap: showTagline && !markOnly ? 4 : 0,
        minWidth: 0,
        padding: inverse ? '6px 8px' : 0,
        borderRadius: inverse ? 10 : 0,
        background: inverse ? 'rgba(255,255,255,.96)' : 'transparent',
      }}
    >
      {markOnly ? (
        <span style={{display:'inline-flex',alignItems:'baseline',fontFamily:heavyFont,fontSize:logoSize * .7,fontWeight:950,letterSpacing:'-.10em',lineHeight:.9,whiteSpace:'nowrap'}}>
          <span style={{color:'#080c10'}}>C</span><span style={{color:'#5a22f6'}}>L</span><span style={{color:'#ff641d',fontSize:logoSize*.34,marginLeft:2}}>•</span>
        </span>
      ) : (
        <span style={{display:'inline-flex',alignItems:'baseline',fontFamily:heavyFont,fontSize,fontWeight:950,letterSpacing:'-.075em',lineHeight:.9,whiteSpace:'nowrap'}}>
          <span style={{color:'#080c10'}}>Comercio</span>
          <span style={{background:'linear-gradient(180deg,#4a18ff 0%,#692bf1 100%)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent'}}>Lleno</span>
          <span style={{background:'linear-gradient(180deg,#ff5600 0%,#ff7a00 100%)',WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent'}}>.com</span>
        </span>
      )}
      {showTagline && !markOnly && (
        <span style={{ fontSize: 10, fontWeight: 750, letterSpacing: '.03em', color: '#6f7880' }}>
          Vendé más · crecé siempre
        </span>
      )}
    </span>
  )
}
