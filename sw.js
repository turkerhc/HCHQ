// HC HQ · çevrimdışı kabuk: her zaman önce ağ, ağ yoksa son kayıtlı sürüm · v4.21: telefon bildirimleri (web push — kapı · sinyal · terminal)
const K='cortex-v4';
self.addEventListener('install',e=>{e.waitUntil(caches.open(K).then(c=>c.addAll(['./','manifest.webmanifest','ikon-192.png'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(L=>Promise.all(L.filter(x=>x!==K).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin) return;
  const anahtar=u.pathname.endsWith('.json')?new Request(u.origin+u.pathname):e.request;   // veri.json · rapor.json: ?t= ile çoğalmasın
  e.respondWith(fetch(e.request).then(r=>{ if(r.ok){const k=r.clone(); caches.open(K).then(c=>c.put(anahtar,k));} return r; })
    .catch(()=>caches.match(anahtar).then(r=>r||caches.match('./'))));
});
/* 24.11 · 💬 mesaj bildiriminde mesajın kendisi: şifreli önizleme (oz) bu cihazdaki anahtarla açılır; açılamazsa 'Yeni mesaj' */
function msjAc(oz){ return new Promise(res=>{ try{ const q=indexedDB.open('hc-hq',1); q.onupgradeneeded=()=>q.result.createObjectStore('k');
  q.onsuccess=()=>{ try{ const g=q.result.transaction('k').objectStore('k').get('msj'); g.onsuccess=async()=>{ try{ const k=g.result; if(!k) return res(null);
    const b=Uint8Array.from(atob(oz),c=>c.charCodeAt(0)); const p=await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},k,b.slice(12)); res(new TextDecoder().decode(p)); }catch(_){ res(null); } }; g.onerror=()=>res(null); }catch(_){ res(null); } };
  q.onerror=()=>res(null); }catch(_){ res(null); } }); }
self.addEventListener('push',e=>{ let d={}; try{ d=e.data?e.data.json():{}; }catch(_){ d={b:e.data?e.data.text():''}; }
  e.waitUntil((d.oz?msjAc(d.oz).then(t=>{ if(t) d.b=t; }):Promise.resolve()).then(()=>self.registration.showNotification(d.t||'HC HQ',{body:d.b||'',icon:'ikon-192.png',badge:'ikon-192.png',tag:d.tag||'cortex',renotify:true,data:{u:d.u||'./'},timestamp:Date.now()}).then(()=>self.registration.getNotifications()).then(L=>{ if(self.navigator&&self.navigator.setAppBadge) return self.navigator.setAppBadge(L.length||1); }).catch(()=>{})));   /* 23.11 · simgede sayı rozeti */
});
self.addEventListener('notificationclick',e=>{ e.notification.close(); try{ self.registration.getNotifications().then(L=>{ if(self.navigator&&self.navigator.setAppBadge){ L.length?self.navigator.setAppBadge(L.length):self.navigator.clearAppBadge(); } }); }catch(_){} const u=new URL((e.notification.data&&e.notification.data.u)||'./',self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>{ for(const c of L){ if(c.url.startsWith(self.registration.scope)&&'focus' in c){ c.postMessage({cortex:'git',u}); return c.focus(); } } return self.clients.openWindow(u); }));
});
self.addEventListener('pushsubscriptionchange',e=>{ e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(L=>L.forEach(c=>c.postMessage({cortex:'abone-yenile'})))); });
