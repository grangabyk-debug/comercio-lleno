import Link from 'next/link'
import BrandLogo from '../BrandLogo'
export default function Cash(){return <main className="app"><header className="appbar"><Link className="brand" href="/dashboard" aria-label="Comercio Lleno"><BrandLogo size={32}/></Link><Link href="/">← Caja</Link></header><div className="content"><h1>Caja</h1><p className="muted">Apertura, movimientos y cierre de caja.</p><div className="cashBox"><strong>Caja 1</strong><span>Estado: cerrada</span><button className="primary">Abrir caja</button></div></div></main>}
