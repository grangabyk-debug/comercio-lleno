export default function CvIaLayout({children}:{children:React.ReactNode}){
  return <>
    {children}
    <nav aria-label="Información legal de Postulá Mejor" style={{display:'flex',justifyContent:'center',gap:18,flexWrap:'wrap',padding:'18px 16px 28px',background:'#fff',borderTop:'1px solid #eceef1',fontFamily:'Inter,system-ui,sans-serif',fontSize:11}}>
      <a href="https://postulamejor.com/privacidad" style={{color:'#666d77',textDecoration:'none'}}>Privacidad</a>
      <a href="https://postulamejor.com/terminos" style={{color:'#666d77',textDecoration:'none'}}>Términos</a>
      <span style={{color:'#9aa0a9'}}>Postulá Mejor · Llena Group</span>
    </nav>
  </>
}
