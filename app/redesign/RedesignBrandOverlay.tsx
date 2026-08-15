import BrandLogo from '../BrandLogo'

export default function RedesignBrandOverlay() {
  return <div
    className="cl-brand-overlay"
    aria-hidden="true"
    style={{
      position:'fixed',
      top:3,
      left:0,
      zIndex:58,
      width:189,
      height:61,
      padding:'0 10px',
      boxSizing:'border-box',
      borderRadius:0,
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      background:'#fff',
      boxShadow:'none',
      pointerEvents:'none',
      overflow:'hidden',
    }}
  >
    <BrandLogo size={24}/>
  </div>
}
