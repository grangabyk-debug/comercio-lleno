import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedRoles=['seller','manager','cashier','supervisor'] as const
const permissionKeys=['can_sell','can_open_close_cash','can_view_reports','can_manage_stock','can_edit_products','can_import_export_products','can_manage_suppliers','can_manage_purchases','can_manage_customers','can_edit_customers','can_delete_customers','can_manage_promotions','can_manage_finances','can_delete_sales']
function cors(req:Request){const origin=req.headers.get('origin')||'';const allowed=origin==='https://comerciolleno.com'||origin==='https://www.comerciolleno.com'||/^https:\/\/[-a-z0-9]+\.vercel\.app$/i.test(origin);return{'Access-Control-Allow-Origin':allowed?origin:'https://www.comerciolleno.com','Vary':'Origin','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'}}
function json(req:Request,body:unknown,status=200){return Response.json(body,{status,headers:cors(req)})}
function strongPassword(v:string){return v.length>=8&&/[A-Z]/.test(v)&&/\d/.test(v)&&/[^A-Za-z0-9]/.test(v)}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)})
  if(req.method!=='POST')return json(req,{error:'Método no permitido'},405)
  try{
    const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const auth=req.headers.get('Authorization')||''
    const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}})
    const {data:{user},error:uerr}=await userClient.auth.getUser()
    if(uerr||!user)return json(req,{error:'Sesión inválida'},401)
    const admin=createClient(url,service)
    const {data:me,error:merr}=await admin.from('profiles').select('company_id,role,active').eq('id',user.id).single()
    if(merr||!me||!['owner','supervisor'].includes(String(me.role))||me.active!==true||!me.company_id)return json(req,{error:'Sólo el propietario o supervisor activo puede crear usuarios'},403)
    const body=await req.json();const username=String(body.username||'').trim().toLowerCase().replace(/[^a-z0-9._-]/g,'');const password=String(body.password||''),full_name=String(body.full_name||'').trim(),role=String(body.role||'')
    if(username.length<2||username.length>40)return json(req,{error:'Ingresá un nombre de usuario válido.'},400)
    if(!strongPassword(password))return json(req,{error:'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un signo especial.'},400)
    if(!allowedRoles.includes(role as any))return json(req,{error:'Rol inválido.'},400)
    const permissions:Record<string,boolean>={};const requested=body.permissions&&typeof body.permissions==='object'?body.permissions:{};for(const key of permissionKeys)if(typeof requested[key]==='boolean')permissions[key]=requested[key]
    let branchId=String(body.branch_id||'').trim()
    if(!branchId){const {data:primary}=await admin.from('branches').select('id').eq('company_id',me.company_id).eq('is_primary',true).eq('active',true).limit(1).maybeSingle();branchId=String(primary?.id||'')}
    if(!branchId)return json(req,{error:'No hay una sucursal activa para asignar el usuario.'},400)
    const {data:branch}=await admin.from('branches').select('id').eq('id',branchId).eq('company_id',me.company_id).eq('active',true).maybeSingle()
    if(!branch)return json(req,{error:'La sucursal seleccionada no pertenece al comercio.'},400)
    const email=`${username}@staff.comerciolleno.local`
    const {data:created,error:cerr}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{staff_username:username,staff_role:role,company_id:me.company_id}})
    if(cerr||!created.user){const msg=String(cerr?.message||'No se pudo crear el usuario');return json(req,{error:/already|registered|exists/i.test(msg)?'Ese nombre de usuario ya está en uso.':msg},400)}
    const {error:perr}=await admin.from('profiles').upsert({id:created.user.id,company_id:me.company_id,role,full_name,username,permissions,active:true},{onConflict:'id'})
    if(perr){await admin.auth.admin.deleteUser(created.user.id);throw perr}
    const {error:aerr}=await admin.from('profile_branch_assignments').upsert({profile_id:created.user.id,company_id:me.company_id,branch_id:branchId,role,permissions,active:true,updated_at:new Date().toISOString()},{onConflict:'profile_id,branch_id'})
    if(aerr){await admin.from('profiles').delete().eq('id',created.user.id);await admin.auth.admin.deleteUser(created.user.id);throw aerr}
    return json(req,{ok:true,id:created.user.id,username,role,branch_id:branchId})
  }catch(e){return json(req,{error:e instanceof Error?e.message:String(e)},400)}
})