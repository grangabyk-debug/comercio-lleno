type BrandLogoProps = {
  size?: number
  markOnly?: boolean
  showTagline?: boolean
  inverse?: boolean
  className?: string
}

export default function BrandLogo({ size = 44, markOnly = false, showTagline = false, inverse = false, className }: BrandLogoProps) {
  const ink = inverse ? '#f4fbf7' : '#12392d'
  const muted = inverse ? '#cfe3d8' : '#60756b'
  const green = '#33b657'
  const greenDark = '#147746'
  const greenLight = '#8ac926'

  return <span className={className} aria-label="Comercio Lleno" style={{display:'inline-flex',alignItems:'center',gap:Math.max(8,Math.round(size*.2)),lineHeight:1,minWidth:0}}>
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 96 96" fill="none" style={{display:'block',flex:'0 0 auto'}}>
      <circle cx="48" cy="48" r="41" stroke={greenDark} strokeWidth="5.5"/>
      <path d="M17 34h13l9 33h36l7-27H36" stroke={ink} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M42 66h31" stroke={ink} strokeWidth="5" strokeLinecap="round"/>
      <circle cx="47" cy="77" r="5.5" fill={ink}/>
      <circle cx="70" cy="77" r="5.5" fill={ink}/>
      <path d="M38 58c9-4 18-6 29-6l-4 13H41l-3-7Z" fill={greenLight}/>
      <circle cx="55" cy="39" r="17" fill={green} stroke={greenLight} strokeWidth="3"/>
      <text x="55" y="46" textAnchor="middle" fontSize="24" fontWeight="900" fontFamily="Arial, Helvetica, sans-serif" fill="white">$</text>
      <path d="M31 54c15-1 34-8 47-24" stroke={green} strokeWidth="6" strokeLinecap="round"/>
      <path d="M73 26l13-4-4 13" fill={green}/>
      <path d="M18 22c9-10 20-15 32-16" stroke={greenLight} strokeWidth="3" strokeLinecap="round"/>
      <path d="M75 73c7-6 12-14 14-23" stroke={greenLight} strokeWidth="3" strokeLinecap="round"/>
    </svg>
    {!markOnly && <span style={{display:'inline-flex',flexDirection:'column',gap:showTagline?5:0,minWidth:0}}>
      <span style={{display:'inline-flex',alignItems:'baseline',gap:5,fontFamily:'Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',fontWeight:900,fontSize:Math.max(16,Math.round(size*.48)),letterSpacing:'-.045em',whiteSpace:'nowrap'}}>
        <span style={{color:ink}}>Comercio</span><span style={{color:green}}>Lleno</span>
      </span>
      {showTagline && <span style={{fontFamily:'Inter,system-ui,sans-serif',fontSize:Math.max(8,Math.round(size*.2)),fontWeight:800,letterSpacing:'.16em',textTransform:'uppercase',color:muted,whiteSpace:'nowrap'}}>Vendé más · crecé siempre</span>}
    </span>}
  </span>
}
