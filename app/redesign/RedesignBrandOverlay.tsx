import BrandLogo from '../BrandLogo'

export default function RedesignBrandOverlay() {
  return <div
    className="cl-brand-overlay"
    aria-hidden="true"
    style={{
      position:'fixed',
      top:12,
      left:17,
      zIndex:58,
      width:166,
      height:50,
      padding:'7px 12px',
      boxSizing:'border-box',
      borderRadius:13,
      display:'flex',
      alignItems:'center',
      justifyContent:'flex-start',
      background:'#fff',
      boxShadow:'0 8px 20px rgba(35,27,76,.12)',
      pointerEvents:'none',
      overflow:'hidden',
    }}
  >
    <BrandLogo size={30}/>
  </div>
}
