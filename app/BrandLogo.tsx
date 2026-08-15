type BrandLogoProps = {
  size?: number
  markOnly?: boolean
  showTagline?: boolean
  inverse?: boolean
  className?: string
}

const LOGO_SRC = '/brand/comercio-lleno-logo.webp'

export default function BrandLogo({
  size = 44,
  markOnly = false,
  showTagline = false,
  inverse = false,
  className,
}: BrandLogoProps) {
  const logoSize = Math.max(18, size)
  const imageStyle = markOnly
    ? { width: logoSize, height: logoSize, objectFit: 'contain' as const }
    : { height: logoSize, width: 'auto' as const, maxWidth: '100%' }

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
        lineHeight: 1,
        minWidth: 0,
        padding: inverse ? '6px 8px' : 0,
        borderRadius: inverse ? 10 : 0,
        background: inverse ? 'rgba(255,255,255,.96)' : 'transparent',
      }}
    >
      <img
        src={LOGO_SRC}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{ ...imageStyle, display: 'block', objectPosition: 'left center' }}
      />
      {showTagline && !markOnly && (
        <span style={{ fontSize: 10, fontWeight: 750, letterSpacing: '.03em', color: '#6f7880' }}>
          Vendé más · crecé siempre
        </span>
      )}
    </span>
  )
}
