const locations=[
 {value:'',label:'Todo Argentina'},
 {value:'CABA',label:'CABA'},
 {value:'Zona Norte GBA',label:'Zona Norte · GBA'},
 {value:'Zona Oeste GBA',label:'Zona Oeste · GBA'},
 {value:'Zona Sur GBA',label:'Zona Sur · GBA'},
 {value:'La Plata',label:'La Plata'},
 {value:'Rosario',label:'Rosario'},
 {value:'Córdoba',label:'Córdoba'},
 {value:'Mendoza',label:'Mendoza'},
 {value:'Remoto',label:'Remoto'},
]

export default function HomeJobSearch(){
 return <form className="pm7-search pm-home-job-search" action="/empleos" method="get">
  <label>
   <small>¿Qué querés hacer?</small>
   <input name="q" type="search" autoComplete="off" placeholder="ventas, café, diseño, logística…" aria-label="Puesto o palabra clave"/>
  </label>
  <label>
   <small>¿Dónde?</small>
   <select name="location" defaultValue="" aria-label="Zona para buscar trabajo">
    {locations.map(option=><option key={option.label} value={option.value}>{option.label}</option>)}
   </select>
  </label>
  <button type="submit">Buscar</button>
 </form>
}
