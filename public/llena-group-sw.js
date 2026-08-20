self.addEventListener('push',event=>{
  let data={}
  try{data=event.data?event.data.json():{}}catch{}
  const title=data.title||'Llena Group'
  const critical=data.severity==='critical'||String(data.type||'').includes('critical')
  const options={
    body:data.body||'Tenés una novedad de Nexo.',
    icon:'/llena-group-icon.svg',
    badge:'/llena-group-icon.svg',
    tag:data.tag||'llena-group',
    renotify:true,
    silent:false,
    vibrate:critical?[260,90,260,90,420]:[180,80,180],
    data:{url:'/llena-group'}
  }
  event.waitUntil(self.registration.showNotification(title,options))
})
self.addEventListener('notificationclick',event=>{
  event.notification.close()
  const target=new URL('/llena-group',self.location.origin).href
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{
    for(const client of windows){if('focus'in client){client.navigate(target);return client.focus()}}
    return clients.openWindow(target)
  }))
})
