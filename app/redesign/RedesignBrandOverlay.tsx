import BrandLogo from '../BrandLogo'

export default function RedesignBrandOverlay() {
  return <div className="cl-brand-overlay" aria-hidden="true" style={{position:'fixed',top:15,left:23,zIndex:58,width:42,height:42,borderRadius:14,display:'grid',placeItems:'center',background:'#fff',boxShadow:'0 8px 20px rgba(20,80,53,.10)',pointerEvents:'none'}}>
    <BrandLogo size={40} markOnly/>
  </div>
}
