import type { TenantSession,UserPermissions } from './types'
import type { StaffProfile } from './api'
import { readActiveBranchId,type BranchOption } from './branch-context'

const URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
export type CompanyAdmin={id:string;name:string;legal_name?:string|null;tax_id?:string|null;owner_phone?:string|null;country?:string|null;province?:string|null;address?:string|null;onboarding_complete?:boolean}
export type BranchAdmin={id:string;name:string;address?:string|null;country?:string|null;province?:string|null;is_primary:boolean;active:boolean;created_at?:string|null}
export type StaffRole='seller'|'manager'|'cashier'|'supervisor'
export type BranchAssignment={profile_id:string;company_id:string;branch_id:string;role:StaffRole;permissions?:UserPermissions|null;active:boolean;created_at?:string|null;updated_at?:string|null}

async function req<T>(session:TenantSession,path:string,init:RequestInit={}){const r=await fetch(`${URL}/rest/v1/${path}`,{...init,headers:{apikey:KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json',...(init.headers||{})},cache:'no-store'});const d=await r.json().catch(()=>null);if(!r.ok)throw new Error(d?.message||d?.error||`Error ${r.status}`);return d as T}

function jwtSubject(token:string){
  if(typeof window==='undefined')return ''
  try{
    const payload=token.split('.')[1]
    if(!payload)return ''
    const normalized=payload.replace(/-/g,'+').replace(/_/g,'/')
    const padded=normalized.padEnd(Math.ceil(normalized.length/4)*4,'=')
    const decoded=JSON.parse(window.atob(padded))
    return String(decoded?.sub||'')
  }catch{return ''}
}

export async function loadTenantAdmin(session:TenantSession){const [companies,branches,staff,assignments]=await Promise.all([req<CompanyAdmin[]>(session,`companies?select=id,name,legal_name,tax_id,owner_phone,country,province,address,onboarding_complete&id=eq.${encodeURIComponent(session.companyId)}&limit=1`),req<BranchAdmin[]>(session,`branches?select=id,name,address,country,province,is_primary,active,created_at&company_id=eq.${encodeURIComponent(session.companyId)}&active=eq.true&order=is_primary.desc,created_at.asc`),req<StaffProfile[]>(session,`profiles?select=id,full_name,username,role,permissions,active&company_id=eq.${encodeURIComponent(session.companyId)}&order=created_at.asc`),req<BranchAssignment[]>(session,`profile_branch_assignments?select=profile_id,company_id,branch_id,role,permissions,active,created_at,updated_at&company_id=eq.${encodeURIComponent(session.companyId)}&active=eq.true&order=created_at.asc`)]);return{company:companies[0],branches,staff,assignments}}

export async function loadMyBranchOptions(session:TenantSession):Promise<BranchOption[]>{
  const admin=session.role==='owner'||session.role==='supervisor'
  const profileId=admin?'':jwtSubject(session.token)
  if(!admin&&!profileId)return []
  const assignmentFilter=admin?'':`&profile_id=eq.${encodeURIComponent(profileId)}`
  const [branches,assignments]=await Promise.all([
    req<BranchAdmin[]>(session,`branches?select=id,name,is_primary,active,created_at&company_id=eq.${encodeURIComponent(session.companyId)}&active=eq.true&order=is_primary.desc,created_at.asc`),
    req<BranchAssignment[]>(session,`profile_branch_assignments?select=profile_id,company_id,branch_id,role,permissions,active&company_id=eq.${encodeURIComponent(session.companyId)}&active=eq.true${assignmentFilter}`),
  ])
  return (branches||[]).map(branch=>{
    const assignment=(assignments||[]).find(a=>a.branch_id===branch.id)
    if(!admin&&!assignment)return null
    return {id:branch.id,name:branch.name,is_primary:branch.is_primary,role:admin?session.role:String(assignment?.role||session.role),permissions:admin?session.permissions:(assignment?.permissions||{})} satisfies BranchOption
  }).filter(Boolean) as BranchOption[]
}

export async function saveCompanyAdmin(session:TenantSession,company:Partial<CompanyAdmin>){const next={...company};if(typeof next.tax_id==='string'&&next.tax_id.trim()){const normalized=next.tax_id.replace(/\D/g,'');if(normalized.length!==11)throw new Error('El CUIT/CUIL debe tener exactamente 11 dígitos.');next.tax_id=normalized}await req(session,`companies?id=eq.${encodeURIComponent(session.companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(next)});if(next.name&&typeof window!=='undefined')localStorage.setItem('cl_company_name',next.name)}
export async function saveBranch(session:TenantSession,branch:Partial<BranchAdmin>&Pick<BranchAdmin,'name'>){const body={company_id:session.companyId,name:branch.name.trim(),address:branch.address||null,country:branch.country||null,province:branch.province||null,is_primary:Boolean(branch.is_primary),active:true,updated_at:new Date().toISOString()};if(branch.id)await req(session,`branches?id=eq.${encodeURIComponent(branch.id)}&company_id=eq.${encodeURIComponent(session.companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(body)});else await req(session,'branches',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(body)})}
export async function deactivateBranch(session:TenantSession,id:string){await req(session,`branches?id=eq.${encodeURIComponent(id)}&company_id=eq.${encodeURIComponent(session.companyId)}&is_primary=eq.false`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({active:false,updated_at:new Date().toISOString()})})}

export async function setBranchAssignment(session:TenantSession,input:{profile_id:string;branch_id:string;role:StaffRole;permissions?:UserPermissions}){
  await req(session,'profile_branch_assignments?on_conflict=profile_id,branch_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({profile_id:input.profile_id,company_id:session.companyId,branch_id:input.branch_id,role:input.role,permissions:input.permissions||{},active:true,updated_at:new Date().toISOString()})})
}
export async function removeBranchAssignment(session:TenantSession,profileId:string,branchId:string){await req(session,`profile_branch_assignments?profile_id=eq.${encodeURIComponent(profileId)}&branch_id=eq.${encodeURIComponent(branchId)}&company_id=eq.${encodeURIComponent(session.companyId)}`,{method:'DELETE',headers:{Prefer:'return=minimal'}})}

export async function updateStaffAdmin(session:TenantSession,id:string,role:StaffRole,permissions:UserPermissions,active=true){await req(session,`profiles?id=eq.${encodeURIComponent(id)}&company_id=eq.${encodeURIComponent(session.companyId)}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({role,permissions,active})});const branchId=readActiveBranchId();if(branchId)await setBranchAssignment(session,{profile_id:id,branch_id:branchId,role,permissions}).catch(()=>{})}
export async function createStaffAdmin(session:TenantSession,input:{username:string;password:string;full_name:string;role:StaffRole;permissions:UserPermissions;branch_id?:string}){const branch_id=input.branch_id||readActiveBranchId()||undefined;const r=await fetch(`${URL}/functions/v1/create-staff-user`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${session.token}`,'Content-Type':'application/json'},body:JSON.stringify({...input,branch_id})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error||'No se pudo crear el usuario.');return d}