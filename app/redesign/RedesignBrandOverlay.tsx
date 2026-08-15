import BrandLogo from '../BrandLogo'

export default function RedesignBrandOverlay() {
  return <div
    className="cl-brand-overlay"
    aria-hidden="true"
    style={{
      position:'fixed',
      top:0,
      left:0,
      zIndex:80,
      width:222,
      height:72,
      padding:'0 15px',
      boxSizing:'border-box',
      display:'flex',
      alignItems:'center',
      justifyContent:'flex-start',
      background:'var(--surface, #fff)',
      borderBottom:'1px solid var(--line, #e4dfe7)',
      pointerEvents:'none',
      overflow:'hidden',
    }}
  >
    <BrandLogo size={34}/>
  </div>
}
