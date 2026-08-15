import type { TenantSession,UserPermissions } from './types'

export const ACTIVE_BRANCH_ID_KEY='cl_branch_id'
export const ACTIVE_BRANCH_NAME_KEY='cl_branch_name'

export type BranchOption={
  id:string
  name:string
  is_primary:boolean
  role:string
  permissions?:UserPermissions|null
}

export function readActiveBranchId(){
  if(typeof window==='undefined')return ''
  return localStorage.getItem(ACTIVE_BRANCH_ID_KEY)||''
}

export function readActiveBranchName(){
  if(typeof window==='undefined')return ''
  return localStorage.getItem(ACTIVE_BRANCH_NAME_KEY)||''
}

export function setActiveBranch(option:BranchOption,session:TenantSession){
  if(typeof window==='undefined')return
  localStorage.setItem(ACTIVE_BRANCH_ID_KEY,option.id)
  localStorage.setItem(ACTIVE_BRANCH_NAME_KEY,option.name)
  if(session.role!=='owner'&&session.role!=='supervisor'){
    localStorage.setItem('cl_user_role',option.role||session.role)
    localStorage.setItem('cl_user_permissions',JSON.stringify(option.permissions||{}))
  }
  window.dispatchEvent(new CustomEvent('comercio:branch-ready',{detail:{id:option.id,name:option.name}}))
}

export function scopedCompanyKey(companyId:string){
  const branch=readActiveBranchId()
  return branch?`${companyId}:${branch}`:companyId
}
