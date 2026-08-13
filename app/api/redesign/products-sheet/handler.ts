import ExcelJS from 'exceljs'

export const runtime = 'nodejs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'

const HEADERS = ['Producto','Código','Categoría','Costo','Precio minorista','Precio mayorista','Stock','Stock mínimo','Stock objetivo','Unidad','Proveedor'] as const
const UNITS = ['unidad','kg','litro','pack','caja']

type Profile = { company_id: string; role: string; permissions?: Record<string, boolean>; active: boolean }
type Supplier = { id: string; name: string }
type ProductRow = {
  id?: string
  name: string
  barcode: string
  category?: string | null
  cost?: number | null
  price: number
  wholesale_price?: number | null
  stock: number
  min_stock?: number | null
  target_stock?: number | null
  unit?: string | null
  supplier_id?: string | null
}

function bearer(request: Request) {
  const auth = request.headers.get('authorization') || ''
  return auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
}

function tokenSubject(token: string) {
  try {
    const part = token.split('.')[1]
    if (!part) return ''
    const parsed = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
    return typeof parsed?.sub === 'string' ? parsed.sub : ''
  } catch { return '' }
}

async function supa<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  })
  const text = await response.text()
  let data: unknown = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'message' in data ? String((data as any).message) : text || `HTTP ${response.status}`
    throw new Error(message)
  }
  return data as T
}

async function context(request: Request) {
  const token = bearer(request)
  if (!token) throw new Error('Sesión no válida.')
  const userId = tokenSubject(token)
  if (!userId) throw new Error('No se pudo validar el usuario de la sesión.')
  const profiles = await supa<Profile[]>(token, `profiles?select=company_id,role,permissions,active&id=eq.${encodeURIComponent(userId)}&limit=1`)
  const profile = profiles[0]
  if (!profile?.company_id || !profile.active) throw new Error('Perfil del comercio no disponible.')
  const canStock = profile.role === 'owner' || profile.permissions?.can_manage_stock !== false
  if (!canStock) throw new Error('No tenés permiso para administrar productos.')
  return { token, profile }
}

function safeNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value)
  const raw = String(value ?? '').trim()
  if (!raw) return 0
  let normalized = raw
  if (raw.includes(',') && raw.includes('.')) normalized = raw.replace(/\./g, '').replace(',', '.')
  else if (raw.includes(',')) normalized = raw.replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function textValue(value: unknown) {
  if (value == null) return ''
  if (typeof value === 'object' && value && 'text' in (value as any)) return String((value as any).text || '').trim()
  return String(value).trim()
}

function normalizeHeader(value: unknown) {
  return textValue(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function excelResponse(workbook: ExcelJS.Workbook, filename: string) {
  return workbook.xlsx.writeBuffer().then(buffer => new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  }))
}

function styleSheet(sheet: ExcelJS.Worksheet) {
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  const header = sheet.getRow(1)
  header.height = 25
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16794A' } }
  header.alignment = { vertical: 'middle' }
  sheet.columns = [
    { width: 34 }, { width: 18 }, { width: 22 }, { width: 14 }, { width: 18 }, { width: 18 },
    { width: 12 }, { width: 14 }, { width: 15 }, { width: 13 }, { width: 28 },
  ]
  sheet.autoFilter = { from: 'A1', to: 'K1' }
  for (const col of ['D','E','F','G','H','I']) sheet.getColumn(col).numFmt = '#,##0.00'
}

async function makeWorkbook(token: string, companyId: string, products?: ProductRow[]) {
  const [suppliers, categoryRows] = await Promise.all([
    supa<Supplier[]>(token, `suppliers?select=id,name&company_id=eq.${encodeURIComponent(companyId)}&active=eq.true&order=name.asc`),
    supa<Array<{category?: string | null}>>(token, `products?select=category&company_id=eq.${encodeURIComponent(companyId)}&active=eq.true&order=category.asc&limit=5000`),
  ])
  const supplierMap = new Map(suppliers.map(s => [s.id, s.name]))
  const categories = Array.from(new Set(categoryRows.map(x => (x.category || 'General').trim()).filter(Boolean))).sort((a,b) => a.localeCompare(b,'es'))
  if (!categories.includes('General')) categories.unshift('General')

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Comercio Lleno'
  workbook.created = new Date()
  const sheet = workbook.addWorksheet('Productos')
  sheet.addRow([...HEADERS])
  styleSheet(sheet)

  for (const p of products || []) {
    sheet.addRow([
      p.name,
      p.barcode || '',
      p.category || 'General',
      Number(p.cost || 0),
      Number(p.price || 0),
      Number(p.wholesale_price || 0),
      Number(p.stock || 0),
      Number(p.min_stock || 0),
      Number(p.target_stock || 0),
      p.unit || 'unidad',
      p.supplier_id ? supplierMap.get(p.supplier_id) || '' : '',
    ])
  }

  if (!products?.length) {
    sheet.addRow(['','','General','','','','','','','unidad',''])
    sheet.getRow(2).font = { italic: true, color: { argb: 'FF6B7280' } }
  }

  const lists = workbook.addWorksheet('Listas')
  lists.getCell('A1').value = 'Categorías disponibles'
  categories.forEach((value, i) => { lists.getCell(i + 2, 1).value = value })
  lists.getCell('B1').value = 'Unidades válidas'
  UNITS.forEach((value, i) => { lists.getCell(i + 2, 2).value = value })
  lists.getCell('C1').value = 'Proveedores disponibles'
  suppliers.forEach((value, i) => { lists.getCell(i + 2, 3).value = value.name })
  lists.getRow(1).font = { bold: true }
  lists.columns = [{width:28},{width:20},{width:34}]

  const maxRows = 5000
  if (categories.length) {
    for (let r = 2; r <= maxRows; r++) sheet.getCell(`C${r}`).dataValidation = { type:'list', allowBlank:true, formulae:[`Listas!$A$2:$A$${categories.length + 1}`] }
  }
  for (let r = 2; r <= maxRows; r++) sheet.getCell(`J${r}`).dataValidation = { type:'list', allowBlank:true, formulae:[`Listas!$B$2:$B$${UNITS.length + 1}`] }
  if (suppliers.length) {
    for (let r = 2; r <= maxRows; r++) sheet.getCell(`K${r}`).dataValidation = { type:'list', allowBlank:true, formulae:[`Listas!$C$2:$C$${suppliers.length + 1}`] }
  }

  const info = workbook.addWorksheet('Instrucciones')
  info.columns = [{width:28},{width:95}]
  info.addRows([
    ['Campo','Cómo completarlo'],
    ['Producto','Obligatorio. Nombre que se verá en el sistema.'],
    ['Código','Código de barras o código interno. Si queda vacío, Comercio Lleno genera uno único al importar.'],
    ['Categoría','Elegí una de la lista o escribí una nueva categoría.'],
    ['Costo / precios / stock','Usá valores numéricos positivos. Los casilleros vacíos se toman como 0.'],
    ['Unidad','unidad, kg, litro, pack o caja.'],
    ['Proveedor','Debe coincidir con un proveedor existente; si no coincide queda sin proveedor.'],
    ['Importación','Podés editar este archivo y luego cargarlo desde Productos y stock → Importar.'],
  ])
  info.getRow(1).font = { bold:true, color:{argb:'FFFFFFFF'} }
  info.getRow(1).fill = { type:'pattern', pattern:'solid', fgColor:{argb:'FF16794A'} }
  info.getColumn(2).alignment = { wrapText:true, vertical:'top' }
  return workbook
}

export async function GET(request: Request) {
  try {
    const { token, profile } = await context(request)
    const workbook = await makeWorkbook(token, profile.company_id)
    return excelResponse(workbook, 'modelo-productos-comercio-lleno.xlsx')
  } catch (error) {
    return Response.json({ ok:false, error: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}

export async function POST(request: Request) {
  try {
    const { token, profile } = await context(request)
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({})) as { action?: string; ids?: string[] }
      if (body.action !== 'export') throw new Error('Acción no válida.')
      const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean).slice(0, 5000) : []
      const filter = ids.length ? `&id=in.(${ids.map(x => encodeURIComponent(x)).join(',')})` : ''
      const products = await supa<ProductRow[]>(token, `products?select=id,name,barcode,category,cost,price,wholesale_price,stock,min_stock,target_stock,unit,supplier_id&company_id=eq.${encodeURIComponent(profile.company_id)}&active=eq.true${filter}&order=name.asc&limit=5000`)
      const workbook = await makeWorkbook(token, profile.company_id, products)
      return excelResponse(workbook, ids.length ? 'productos-seleccionados.xlsx' : 'productos-comercio-lleno.xlsx')
    }

    const form = await request.formData()
    if (String(form.get('action') || '') !== 'import') throw new Error('Acción no válida.')
    const file = form.get('file')
    if (!(file instanceof File)) throw new Error('Seleccioná un archivo Excel.')
    if (file.size > 8 * 1024 * 1024) throw new Error('El archivo supera el máximo de 8 MB.')

    const workbook = new ExcelJS.Workbook()
    const uploaded = Buffer.from(await file.arrayBuffer())
    await workbook.xlsx.load(uploaded as any)
    const sheet = workbook.worksheets[0]
    if (!sheet) throw new Error('El archivo no contiene una hoja de productos.')

    const headerMap = new Map<string, number>()
    sheet.getRow(1).eachCell((cell, col) => headerMap.set(normalizeHeader(cell.value), col))
    const required = ['producto']
    for (const name of required) if (!headerMap.has(name)) throw new Error(`Falta la columna obligatoria: ${name}. Descargá el formato modelo.`)

    const suppliers = await supa<Supplier[]>(token, `suppliers?select=id,name&company_id=eq.${encodeURIComponent(profile.company_id)}&active=eq.true&limit=2000`)
    const supplierByName = new Map(suppliers.map(s => [s.name.trim().toLocaleLowerCase('es'), s.id]))
    const get = (row: ExcelJS.Row, header: string) => {
      const col = headerMap.get(normalizeHeader(header))
      return col ? row.getCell(col).value : null
    }

    const payload: any[] = []
    const seenCodes = new Set<string>()
    const maxRow = Math.min(sheet.rowCount, 5001)
    for (let r = 2; r <= maxRow; r++) {
      const row = sheet.getRow(r)
      const name = textValue(get(row, 'Producto'))
      if (!name) continue
      let barcode = textValue(get(row, 'Código'))
      if (!barcode) barcode = `AUTO-${Date.now().toString(36).toUpperCase()}-${r}`
      if (seenCodes.has(barcode)) throw new Error(`El código ${barcode} está repetido dentro del archivo (fila ${r}).`)
      seenCodes.add(barcode)
      const supplierName = textValue(get(row, 'Proveedor')).toLocaleLowerCase('es')
      const unitRaw = textValue(get(row, 'Unidad')).toLowerCase()
      payload.push({
        company_id: profile.company_id,
        name,
        barcode,
        category: textValue(get(row, 'Categoría')) || 'General',
        cost: safeNumber(get(row, 'Costo')),
        price: safeNumber(get(row, 'Precio minorista')),
        wholesale_price: safeNumber(get(row, 'Precio mayorista')),
        stock: safeNumber(get(row, 'Stock')),
        min_stock: safeNumber(get(row, 'Stock mínimo')),
        target_stock: safeNumber(get(row, 'Stock objetivo')),
        unit: UNITS.includes(unitRaw) ? unitRaw : 'unidad',
        supplier_id: supplierName ? supplierByName.get(supplierName) || null : null,
        active: true,
        updated_at: new Date().toISOString(),
      })
    }

    if (!payload.length) throw new Error('No encontré productos para importar.')
    await supa(token, 'products?on_conflict=company_id,barcode', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(payload),
    })

    return Response.json({ ok:true, processed: payload.length })
  } catch (error) {
    return Response.json({ ok:false, error: error instanceof Error ? error.message : String(error) }, { status: 400 })
  }
}
