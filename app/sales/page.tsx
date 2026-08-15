import Link from 'next/link'
import BrandLogo from '../BrandLogo'
export default function Sales(){return <main className="app"><header className="appbar"><Link className="brand" href="/dashboard" aria-label="Comercio Lleno"><BrandLogo size={32}/></Link><Link href="/">← Caja</Link></header><div className="content"><h1>Ventas</h1><p className="muted">Historial de operaciones y comprobantes fiscales.</p><div className="emptyPage">Todavía no hay ventas. Las operaciones aparecerán acá automáticamente.</div></div></main>}
