import Link from 'next/link'
import BrandLogo from '../BrandLogo'
export default function Customers(){return <main className="app"><header className="appbar"><Link className="brand" href="/dashboard" aria-label="Comercio Lleno"><BrandLogo size={32}/></Link><Link href="/">← Caja</Link></header><div className="content"><h1>Clientes</h1><p className="muted">Clientes habituales y datos necesarios para facturación.</p><div className="emptyPage">Todavía no hay clientes cargados.</div></div></main>}
