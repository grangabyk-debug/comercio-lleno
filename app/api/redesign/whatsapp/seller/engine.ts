const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL??'https://wtcntclzcubkbtcsqkzc.supabase.co'
const PUBLISHABLE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
const GATEWAY_URL='https://ai-gateway.vercel.sh/v1/chat/completions'
const MODELS=['openai/gpt-5.4-nano','google/gemini-3.5-flash-lite','openai/gpt-5.4']

type IntentName='add'|'remove'|'confirm'|'cancel'|'greeting'|'cart'|'help'|'unknown'
type ParsedItem={query:string;qty:number}
type ParsedIntent={intent:IntentName;items:ParsedItem[];selectedNumber?:number|null}
type Product={id:string;name:string;barcode?:string|null;category?:string|null;price:number|string;stock:number|string;unit?:string|null}
type CartItem={product_id:string;name:string;qty:number;unit_price:number;stock:number;unit?:string|null}
type Conversation={id:string;company_id:string;customer_phone:string;instance_name:string;status:string;cart:{items?:CartItem[]}|null;context:Record<string,any>|null}
type SellerContext={token:string;companyId:string;companyName:string;phone:string;text:string;externalMessageId?:string|null;commitSale?:boolean}

function headers(token:string,prefer?:string){return{apikey:PUBLISHABLE_KEY,Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})}}
async function rest<T>(token:string,path:string,init:RequestInit={}){const response=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...init,headers:{...headers(token),...(init.headers||{})},cache:'no-store'});const text=await response.text();let data:any=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!response.ok)throw new Error(data?.message||data?.error||`Supabase ${response.status}`);return data as T}
async function rpc<T>(token:string,name:string,body:unknown){return rest<T>(token,`rpc/${name}`,{method:'POST',body:JSON.stringify(body),headers:{Prefer:'return=representation'}})}
export function normalizePhone(value:unknown){return String(value||'').replace(/\D/g,'').slice(0,18)}
export function sellerInstanceName(companyId:string){return`cl-${companyId.replace(/[^a-zA-Z0-9]/g,'').slice(0,40).toLowerCase()}`}
function clean(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function money(value:number){return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:2}).format(value)}
function cartItems(conversation:Conversation){return Array.isArray(conversation.cart?.items)?conversation.cart!.items!:[]}
function cartTotal(items:CartItem[]){return items.reduce((sum,item)=>sum+item.qty*item.unit_price,0)}
function cartText(items:CartItem[]){if(!items.length)return'Tu pedido está vacío.';return`${items.map(item=>`• ${item.qty} × ${item.name} — ${money(item.qty*item.unit_price)}`).join('\n')}\n\nTotal: ${money(cartTotal(items))}`}

function fallbackIntent(text:string,status:string):ParsedIntent{
  const q=clean(text)
  const number=q.match(/^(?:el |la |opcion )?(\d{1,2})$/)?.[1]
  if(number)return{intent:'add',items:[],selectedNumber:Number(number)}
  if(/^(si|sí|dale|ok|okay|confirmo|confirmar|confirmado|listo|de acuerdo|esta bien|está bien)$/.test(text.trim().toLowerCase())&&status==='awaiting_confirmation')return{intent:'confirm',items:[]}
  if(/\b(cancel|anul|borra todo|vaciar|vacia)\w*/.test(q))return{intent:'cancel',items:[]}
  if(/\b(carrito|pedido|total|que llevo|qué llevo)\b/.test(q))return{intent:'cart',items:[]}
  if(/^(hola|buenas|buen dia|buenas tardes|buenas noches)[!. ]*$/.test(q))return{intent:'greeting',items:[]}
  const remove=/\b(saca|sacame|quita|quitame|elimina|borra)\b/.test(q)
  const stripped=q.replace(/\b(hola|buenas|necesito|quiero|busco|dame|agregame|agrega|sumame|suma|por favor|porfa|tambien|también|me|un|una)\b/g,' ').replace(/\s+/g,' ').trim()
  const parts=stripped.split(/\s*(?:,|\by\b|\be\b|\bademas\b)\s*/).map(x=>x.trim()).filter(Boolean)
  const items=parts.map(part=>{const m=part.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);return{query:(m?.[2]||part).trim(),qty:Math.max(.001,Number((m?.[1]||'1').replace(',','.'))||1)}}).filter(x=>x.query.length>1)
  return{intent:remove?'remove':items.length?'add':'unknown',items}
}

async function aiIntent(text:string,status:string):Promise<ParsedIntent>{
  const apiKey=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN
  if(!apiKey)return fallbackIntent(text,status)
  const system=`Sos un parser de pedidos de un comercio argentino. Devolvé SOLAMENTE JSON válido y nada más. Formato: {"intent":"add|remove|confirm|cancel|greeting|cart|help|unknown","items":[{"query":"producto pedido sin cantidad","qty":1}],"selectedNumber":null}. Interpretá español rioplatense. Si el usuario confirma explícitamente un pedido y el estado es awaiting_confirmation, intent=confirm. Un simple saludo no agrega productos. Para frases como "necesito desodorante de piso y acondicionador de pelo" generá dos items. Para "dos lavandinas" qty=2. Estado actual: ${status}.`
  for(const model of MODELS){
    try{
      const response=await fetch(GATEWAY_URL,{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:text}],temperature:.05,max_tokens:280}),cache:'no-store'})
      const data=await response.json().catch(()=>({}))
      if(!response.ok)continue
      const raw=String(data?.choices?.[0]?.message?.content||'').replace(/^```(?:json)?/i,'').replace(/```$/,'').trim()
      const start=raw.indexOf('{'),end=raw.lastIndexOf('}')
      if(start<0||end<start)continue
      const parsed=JSON.parse(raw.slice(start,end+1))
      const allowed:IntentName[]=['add','remove','confirm','cancel','greeting','cart','help','unknown']
      const intent=allowed.includes(parsed?.intent)?parsed.intent:'unknown'
      const items=Array.isArray(parsed?.items)?parsed.items.map((item:any)=>({query:String(item?.query||'').trim(),qty:Math.max(.001,Number(item?.qty)||1)})).filter((item:ParsedItem)=>item.query):[]
      return{intent,items,selectedNumber:Number.isFinite(Number(parsed?.selectedNumber))?Number(parsed.selectedNumber):null}
    }catch{}
  }
  return fallbackIntent(text,status)
}

function scoreProduct(query:string,product:Product){
  const q=clean(query),name=clean(product.name),category=clean(product.category||'')
  if(!q)return 0
  if(name===q)return 150
  if(name.includes(q))return 115
  if(q.includes(name)&&name.length>4)return 85
  const stop=new Set(['de','del','la','el','los','las','para','con','sin','un','una','por'])
  const tokens=q.split(' ').filter(token=>token.length>1&&!stop.has(token))
  let score=0
  for(const token of tokens){if(name.split(' ').includes(token))score+=18;else if(name.includes(token))score+=11;if(category.includes(token))score+=4}
  if(tokens.length&&tokens.every(token=>name.includes(token)||category.includes(token)))score+=24
  return score
}
function matches(query:string,products:Product[]){return products.map(product=>({product,score:scoreProduct(query,product)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||Number(b.product.stock)-Number(a.product.stock)).slice(0,4)}
function ambiguous(found:Array<{product:Product;score:number}>){if(found.length<2)return false;const [a,b]=found;return a.score<40||b.score>=Math.max(28,a.score*.82)}
function addCart(items:CartItem[],product:Product,qty:number){const stock=Number(product.stock||0),requested=Math.max(.001,qty);if(stock<requested)return{items,error:`De ${product.name} tengo ${stock} ${product.unit||'unidades'} disponibles.`};const next=[...items],existing=next.find(item=>item.product_id===product.id);if(existing){if(existing.qty+requested>stock)return{items,error:`De ${product.name} me quedan ${stock} ${product.unit||'unidades'} en total.`};existing.qty+=requested;existing.unit_price=Number(product.price||0);existing.stock=stock}else next.push({product_id:product.id,name:product.name,qty:requested,unit_price:Number(product.price||0),stock,unit:product.unit});return{items:next,error:''}}

async function getConversation(token:string,companyId:string,phone:string){
  const instance=sellerInstanceName(companyId),path=`whatsapp_ai_conversations?company_id=eq.${encodeURIComponent(companyId)}&customer_phone=eq.${encodeURIComponent(phone)}&instance_name=eq.${encodeURIComponent(instance)}&select=*&limit=1`
  const rows=await rest<Conversation[]>(token,path);if(rows?.[0])return rows[0]
  const created=await rest<Conversation[]>(token,'whatsapp_ai_conversations',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({company_id:companyId,customer_phone:phone,instance_name:instance,status:'active',cart:{items:[]},context:{}})})
  if(!created?.[0])throw new Error('No se pudo abrir la conversación de WhatsApp.')
  return created[0]
}
async function patchConversation(token:string,id:string,patch:Record<string,unknown>){const rows=await rest<Conversation[]>(token,`whatsapp_ai_conversations?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({...patch,updated_at:new Date().toISOString()})});return rows?.[0]}
async function recordMessage(token:string,companyId:string,conversationId:string,direction:'inbound'|'outbound'|'system',body:string,externalMessageId?:string|null,payload:Record<string,unknown>={}){return rest<any[]>(token,'whatsapp_ai_messages',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({company_id:companyId,conversation_id:conversationId,direction,body,external_message_id:externalMessageId||null,payload})})}
async function reply(token:string,conversation:Conversation,text:string,patch:Record<string,unknown>={}){const next=await patchConversation(token,conversation.id,{...patch,last_outbound_at:new Date().toISOString()});await recordMessage(token,conversation.company_id,conversation.id,'outbound',text);return{conversation:next||conversation,reply:text}}

async function featureState(token:string,companyId:string){
  const [companyRows,entitlements,controls]=await Promise.all([
    rest<any[]>(token,`companies?id=eq.${encodeURIComponent(companyId)}&select=name,sales_settings,owner_phone&limit=1`),
    rest<any[]>(token,`company_feature_entitlements?company_id=eq.${encodeURIComponent(companyId)}&select=feature_key,enabled,plan_code`),
    rest<any[]>(token,`company_admin_controls?company_id=eq.${encodeURIComponent(companyId)}&select=access_paused,pause_reason&limit=1`),
  ])
  const company=companyRows?.[0]||{},map=new Map((entitlements||[]).map((row:any)=>[row.feature_key,row]))
  return{company,aiSellerEntitled:map.get('whatsapp_ai_seller')?.enabled===true,automationsEntitled:map.get('whatsapp_automations')?.enabled===true,aiSellerEnabled:company?.sales_settings?.whatsappAiSellerEnabled===true,cashCloseEnabled:company?.sales_settings?.whatsappCashCloseOwnerEnabled===true,accessPaused:controls?.[0]?.access_paused===true}
}
export async function getSellerFeatureState(token:string,companyId:string){return featureState(token,companyId)}

async function allProducts(token:string,companyId:string){const rows=await rest<Product[]>(token,`products?select=id,name,barcode,category,price,stock,unit&company_id=eq.${encodeURIComponent(companyId)}&active=eq.true&order=name.asc&limit=5000`);return rows||[]}
async function saveCartReply(token:string,conversation:Conversation,items:CartItem[],context:Record<string,any>,prefix=''){const text=`${prefix?`${prefix}\n\n`:''}${cartText(items)}\n\nSi está bien, respondeme *CONFIRMAR*. Si querés, también podés agregar o sacar productos.`;return reply(token,conversation,text,{cart:{items},context,status:items.length?'awaiting_confirmation':'active'})}

async function continueRequests(token:string,conversation:Conversation,products:Product[],items:CartItem[],requests:ParsedItem[],context:Record<string,any>,prefixes:string[]=[]):Promise<any>{
  let cart=[...items]
  for(let i=0;i<requests.length;i++){
    const request=requests[i],found=matches(request.query,products)
    if(!found.length){prefixes.push(`No encontré "${request.query}" en el catálogo disponible.`);continue}
    if(ambiguous(found)){
      const options=found.slice(0,3).map((item,index)=>`${index+1}. ${item.product.name} — ${money(Number(item.product.price||0))} · stock ${Number(item.product.stock||0)}`)
      const nextContext={...context,pendingChoices:found.slice(0,3).map(item=>item.product),pendingQuery:request.query,pendingQty:request.qty,remainingRequests:requests.slice(i+1)}
      const text=`${prefixes.length?`${prefixes.join('\n')}\n\n`:''}Para *${request.query}* tengo estas opciones:\n${options.join('\n')}\n\nRespondeme con el número de la opción que querés.`
      return reply(token,conversation,text,{cart:{items:cart},context:nextContext,status:'active'})
    }
    const added=addCart(cart,found[0].product,request.qty)
    cart=added.items
    if(added.error)prefixes.push(added.error);else prefixes.push(`Agregué ${request.qty} × ${found[0].product.name}.`)
  }
  return saveCartReply(token,conversation,cart,{...context,pendingChoices:null,pendingQuery:null,pendingQty:null,remainingRequests:[]},prefixes.join('\n'))
}

async function confirm(token:string,conversation:Conversation,companyName:string,commitSale:boolean){
  const current=cartItems(conversation);if(!current.length)return reply(token,conversation,'Tu pedido está vacío. Decime qué productos necesitás.',{status:'active'})
  const products=await allProducts(token,conversation.company_id),byId=new Map(products.map(product=>[product.id,product])),fresh:CartItem[]=[]
  for(const item of current){const product=byId.get(item.product_id);if(!product)return reply(token,conversation,`${item.name} ya no está disponible. Revisemos el pedido antes de confirmar.`,{status:'active'});if(Number(product.stock||0)<item.qty)return reply(token,conversation,`Cambió el stock de ${product.name}: quedan ${Number(product.stock||0)}. No generé la venta.`,{status:'active'});fresh.push({...item,name:product.name,unit_price:Number(product.price||0),stock:Number(product.stock||0),unit:product.unit})}
  const total=cartTotal(fresh)
  const customers=await rest<any[]>(token,`customers?company_id=eq.${encodeURIComponent(conversation.company_id)}&select=id,name,phone&limit=5000`)
  const customer=(customers||[]).find(row=>normalizePhone(row.phone)===conversation.customer_phone)||null
  const orderRows=await rest<any[]>(token,'whatsapp_ai_orders',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({company_id:conversation.company_id,conversation_id:conversation.id,customer_id:customer?.id||null,customer_phone:conversation.customer_phone,status:'confirmed',items:fresh,subtotal:total,total,confirmed_at:new Date().toISOString()})})
  const order=orderRows?.[0];if(!order)throw new Error('No se pudo confirmar el pedido.')
  let saleId:string|null=null
  if(commitSale){
    const sale={id:crypto.randomUUID(),company_id:conversation.company_id,customer_id:customer?.id||null,subtotal:total,total,details:{source:'whatsapp_ai',whatsapp_order_id:order.id,whatsapp_conversation_id:conversation.id,customer_phone:conversation.customer_phone,items:fresh.map(item=>({product_id:item.product_id,name:item.name,qty:item.qty,unit_price:item.unit_price,line_total:item.qty*item.unit_price}))}}
    const result:any=await rpc<any>(token,'persist_whatsapp_sale_atomic',{p_company_id:conversation.company_id,p_order_id:order.id,p_sale:sale});saleId=Array.isArray(result)?String(result[0]||''):String(result||'')
  }
  const context={...(conversation.context||{}),lastOrderId:order.id,lastSaleId:saleId,completedAt:new Date().toISOString()}
  const next=await patchConversation(token,conversation.id,{cart:{items:[]},context,status:'active'})
  const finalText=commitSale?`✅ Pedido confirmado en ${companyName}.\nTotal: ${money(total)}\nPedido #${String(order.id).slice(0,8).toUpperCase()}\n\nYa quedó registrado en Comercio Lleno para preparar/cobrar.`:`✅ Pedido confirmado en *modo prueba*.\nTotal: ${money(total)}\nPedido #${String(order.id).slice(0,8).toUpperCase()}\n\nNo desconté stock ni generé una venta real porque la simulación está en modo seguro.`
  await recordMessage(token,conversation.company_id,conversation.id,'outbound',finalText)
  return{conversation:next||conversation,reply:finalText,orderId:order.id,saleId,total,committed:commitSale}
}

export async function processSellerMessage(input:SellerContext){
  const phone=normalizePhone(input.phone);if(phone.length<10)throw new Error('Ingresá un número con código de país y área.')
  const feature=await featureState(input.token,input.companyId)
  if(!feature.aiSellerEnabled)throw new Error('El propietario todavía no activó Vendedor IA WhatsApp en Configuración.')
  let conversation=await getConversation(input.token,input.companyId,phone)
  if(input.externalMessageId){const existing=await rest<any[]>(input.token,`whatsapp_ai_messages?company_id=eq.${encodeURIComponent(input.companyId)}&external_message_id=eq.${encodeURIComponent(input.externalMessageId)}&select=id&limit=1`);if(existing?.length){const latest=await rest<any[]>(input.token,`whatsapp_ai_messages?conversation_id=eq.${encodeURIComponent(conversation.id)}&direction=eq.outbound&select=body&order=created_at.desc&limit=1`);return{ok:true,duplicate:true,reply:latest?.[0]?.body||'',conversation}}}
  await recordMessage(input.token,input.companyId,conversation.id,'inbound',input.text,input.externalMessageId||null)
  conversation=(await patchConversation(input.token,conversation.id,{last_inbound_at:new Date().toISOString()}))||conversation
  const context={...(conversation.context||{})},current=cartItems(conversation)
  const parsed=await aiIntent(input.text,conversation.status)

  const choices=Array.isArray(context.pendingChoices)?context.pendingChoices as Product[]:[]
  const selected=parsed.selectedNumber||(/^\s*(\d{1,2})\s*$/.exec(input.text)?.[1]?Number(/^\s*(\d{1,2})\s*$/.exec(input.text)![1]):null)
  if(choices.length&&selected){const chosen=choices[selected-1];if(!chosen)return reply(input.token,conversation,`Elegí una opción entre 1 y ${choices.length}.`,{});const added=addCart(current,chosen,Number(context.pendingQty||1));if(added.error)return reply(input.token,conversation,added.error,{context:{...context,pendingChoices:null}});const remaining=Array.isArray(context.remainingRequests)?context.remainingRequests as ParsedItem[]:[];const nextContext={...context,pendingChoices:null,pendingQuery:null,pendingQty:null,remainingRequests:[]};return continueRequests(input.token,conversation,await allProducts(input.token,input.companyId),added.items,remaining,nextContext,[`Agregué ${Number(context.pendingQty||1)} × ${chosen.name}.`])}

  if(parsed.intent==='confirm')return confirm(input.token,conversation,input.companyName,Boolean(input.commitSale))
  if(parsed.intent==='cancel'){return reply(input.token,conversation,'Listo, vacié el pedido. Cuando quieras empezamos de nuevo.',{cart:{items:[]},context:{},status:'active'})}
  if(parsed.intent==='cart')return reply(input.token,conversation,`${cartText(current)}${current.length?'\n\nSi está bien, respondeme *CONFIRMAR*.':''}`,{status:current.length?'awaiting_confirmation':'active'})
  if(parsed.intent==='greeting')return reply(input.token,conversation,`¡Hola! 👋 Soy el *Vendedor IA de ${input.companyName}*. Decime qué necesitás y te busco opciones con precio y stock real.`,{})
  if(parsed.intent==='help')return reply(input.token,conversation,'Podés pedirme productos, agregar cantidades, sacar algo del pedido, consultar el total o escribir CONFIRMAR cuando esté listo.',{})
  if(parsed.intent==='remove'){
    const query=parsed.items?.[0]?.query||input.text,found=current.map(item=>({item,score:scoreProduct(query,{id:item.product_id,name:item.name,price:item.unit_price,stock:item.stock,unit:item.unit})})).sort((a,b)=>b.score-a.score)
    if(!found.length||found[0].score<=0)return reply(input.token,conversation,'No encontré ese producto dentro de tu pedido.',{})
    const next=current.filter(item=>item.product_id!==found[0].item.product_id);return saveCartReply(input.token,conversation,next,context,`Saqué ${found[0].item.name} del pedido.`)
  }
  if(parsed.intent==='add'&&parsed.items.length)return continueRequests(input.token,conversation,await allProducts(input.token,input.companyId),current,parsed.items,context)
  return reply(input.token,conversation,'Contame qué producto necesitás. Por ejemplo: “necesito dos lavandinas y un acondicionador”.',{})
}

export async function sellerState(token:string,companyId:string,phone?:string){
  const feature=await featureState(token,companyId),normalized=normalizePhone(phone||'')
  let conversation:Conversation|null=null,messages:any[]=[],orders:any[]=[]
  if(normalized.length>=10){const rows=await rest<Conversation[]>(token,`whatsapp_ai_conversations?company_id=eq.${encodeURIComponent(companyId)}&customer_phone=eq.${encodeURIComponent(normalized)}&select=*&limit=1`);conversation=rows?.[0]||null;if(conversation){messages=await rest<any[]>(token,`whatsapp_ai_messages?conversation_id=eq.${encodeURIComponent(conversation.id)}&select=id,direction,body,created_at&order=created_at.asc&limit=100`);orders=await rest<any[]>(token,`whatsapp_ai_orders?conversation_id=eq.${encodeURIComponent(conversation.id)}&select=id,status,total,sale_id,created_at&order=created_at.desc&limit=20`)}}
  return{feature,conversation,messages,orders}
}
export async function resetSellerConversation(token:string,companyId:string,phone:string){const normalized=normalizePhone(phone);if(normalized.length<10)return;await rest(token,`whatsapp_ai_conversations?company_id=eq.${encodeURIComponent(companyId)}&customer_phone=eq.${encodeURIComponent(normalized)}`,{method:'DELETE'});}
