/*! HC OFİS 3B v1 (27.11.2026) — LOKİ ve ekibinin yaşadığı 3B diorama. three.js (lib/hc3o.js).
   Her eşyanın bir kullanımı var: masa→oturup çalışır (ekranında işi), kase→yer/içer, yatak→uyur, top→oynar, kanepe/kulübe→dinlenir, ekran→brifing.
   Köpekler A* ile yol bulup yürür. © Türker HC */
(function(){
const HCOfis3D={kok:'lib/'};
function yukle(){ if(window.HC3O) return Promise.resolve(true); return new Promise(r=>{ const s=document.createElement('script'); s.src=HCOfis3D.kok+'hc3o.js?v=1'; s.onload=()=>r(!!window.HC3O); s.onerror=()=>r(false); document.head.appendChild(s); }); }
HCOfis3D.kur=async function(kap,opt){
 if(!(await yukle())){ kap.innerHTML='<div style="padding:30px;text-align:center;color:#999">3B ofis bu cihazda açılamadı.</div>'; return null; }
 const T=window.HC3O, V3=T.Vector3, Color=T.Color; opt=opt||{};
 const mob=matchMedia('(max-width:700px)').matches;
 const ren=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 ren.setPixelRatio(Math.min(devicePixelRatio||1,mob?1.75:2)); ren.shadowMap.enabled=true; ren.shadowMap.type=T.PCFSoftShadowMap; ren.outputColorSpace=T.SRGBColorSpace; ren.toneMapping=T.ACESFilmicToneMapping; ren.toneMappingExposure=1.05;
 kap.appendChild(ren.domElement); ren.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:pan-y';
 const sc=new T.Scene(); sc.background=new Color('#1a1d2b');
 const cam=new T.OrthographicCamera(-10,10,10,-10,-100,200); const camHedef={c:new V3(14,0,8),z:16}, camAn={c:new V3(14,0,8),z:16}; let aci=Math.PI/4;
 const hemi=new T.HemisphereLight('#fff6e8','#3b3448',1.1); sc.add(hemi);
 const gunes=new T.DirectionalLight('#fff1dc',2.2); gunes.castShadow=true; const sm=mob?1024:2048; gunes.shadow.mapSize.set(sm,sm);
 Object.assign(gunes.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:90}); gunes.shadow.bias=-0.0004; gunes.shadow.radius=3; gunes.position.set(28,32,24); gunes.target.position.set(14,0,8); sc.add(gunes,gunes.target);
 /* ---------- yardımcılar ---------- */
 const MC={}; const M=(c,o)=>{ const k=c+JSON.stringify(o||{}); return MC[k]||(MC[k]=new T.MeshStandardMaterial(Object.assign({color:c,roughness:.75,metalness:0},o||{}))); };
 const RB=(w,h,d,r)=>new T.RoundedBoxGeometry(w,h,d,3,Math.max(.002,Math.min(r==null?.04:r,Math.min(w,h,d)/2-.002)));
 function kutu(p,w,h,d,c,x,y,z,o){ const m=new T.Mesh(RB(w,h,d,o&&o.r),M(c,o&&o.m)); m.position.set(x,y+h/2,z); m.castShadow=!(o&&o.gs===0); m.receiveShadow=true; p.add(m); return m; }
 function sil(p,r,h,c,x,y,z,o){ const m=new T.Mesh(new T.CylinderGeometry(r,(o&&o.r2!=null)?o.r2:r,h,(o&&o.s)||20),M(c,o&&o.m)); m.position.set(x,y+h/2,z); m.castShadow=true; m.receiveShadow=true; p.add(m); return m; }
 function kure(p,r,c,x,y,z,s,o){ const n=(o&&o.s)||18; const m=new T.Mesh(new T.SphereGeometry(r,n,Math.max(6,n-4)),M(c,o&&o.m)); m.position.set(x,y,z); if(s) m.scale.set(s[0],s[1],s[2]); m.castShadow=true; m.receiveShadow=true; p.add(m); return m; }
 function doku(w,h,ciz){ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'); const t=new T.CanvasTexture(cv); t.colorSpace=T.SRGBColorSpace; t.anisotropy=4;
   const o={t,yenile(...a){ g.clearRect(0,0,w,h); ciz(g,w,h,...a); t.needsUpdate=true; }}; o.yenile(); return o; }
 function levha(p,w,h,x,y,z,ry,d){ const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:d.t,toneMapped:false})); m.position.set(x,y,z); m.rotation.y=ry||0; p.add(m); return m; }
 function ekran(p,w,h,x,y,z,ry,ciz){ const d=doku(512,Math.round(512*h/w),ciz); levha(p,w,h,x,y,z,ry,d); return d; }
 /* ---------- plan (1 birim = 1 m) ---------- */
 const W=28, D=17, HUC=.5, GX=W/HUC, GZ=D/HUC; const engel=new Uint8Array(GX*GZ);
 function engelle(x0,z0,x1,z1){ for(let gx=Math.floor(x0/HUC);gx<Math.ceil(x1/HUC);gx++) for(let gz=Math.floor(z0/HUC);gz<Math.ceil(z1/HUC);gz++) if(gx>=0&&gz>=0&&gx<GX&&gz<GZ) engel[gz*GX+gx]=1; }
 const ODA={ofis:{x0:0,z0:0,x1:11,z1:8},toplanti:{x0:11,z0:0,x1:19,z1:8},mutfak:{x0:19,z0:0,x1:28,z1:8},oyun:{x0:0,z0:8,x1:9,z1:17},uyku:{x0:9,z0:8,x1:17,z1:17},bahce:{x0:17,z0:8,x1:28,z1:17}};
 const dun=new T.Group(); sc.add(dun);
 const ZEM={ofis:['#b98b5e','#a97c51'],toplanti:['#8f6c4f','#7f5f45'],mutfak:['#ece6d8','#d6cdbb'],oyun:['#c7a77f','#b8976f'],uyku:['#6d5f8a','#62557d']};
 for(const id in ODA){ if(id==='bahce') continue; const o=ODA[id], z=ZEM[id];
   if(id==='mutfak'){ for(let i=o.x0;i<o.x1;i++) for(let j=o.z0;j<o.z1;j++) kutu(dun,1,.06,1,(i+j)%2?z[0]:z[1],i+.5,-.06,j+.5,{r:.01,gs:0}); }
   else for(let j=o.z0,n=0;j<o.z1;j+=.5,n++) kutu(dun,o.x1-o.x0,.06,.49,n%2?z[0]:z[1],(o.x0+o.x1)/2,-.06,j+.25,{r:.01,gs:0}); }
 kutu(dun,11,.1,9,'#6fbf5f',22.5,-.1,12.5,{r:.02,gs:0}); for(let i=0;i<8;i++) kutu(dun,.7,.04,.5,'#cfc6b2',17.5+i*1.05,0,12.6+Math.sin(i)*.3,{r:.12,gs:0});
 const DUV='#ece6dc';
 kutu(dun,19,2.6,.2,DUV,9.5,0,-.1); kutu(dun,.2,2.6,17,'#d9d1c4',-.1,0,8.5); kutu(dun,9,2.6,.2,'#f3ede2',23.5,0,-.1);
 kutu(dun,28,.12,.24,'#8d6c4e',14,0,.02,{gs:0}); kutu(dun,.24,.12,17,'#8d6c4e',.02,0,8.5,{gs:0});
 engelle(0,0,28,.35); engelle(0,0,.35,17); engelle(27.6,0,28,17); engelle(0,16.6,28,17);
 const bolme=(x0,z0,x1,z1,kapi)=>{ const h=.55, dik=x0===x1, a0=dik?z0:x0, L=dik?z1-z0:x1-x0;
   const parca=(a,b)=>{ if(b-a<=.05) return; if(dik){ kutu(dun,.16,h,b-a,DUV,x0,0,(a+b)/2,{r:.03}); engelle(x0-.3,a,x0+.3,b); } else { kutu(dun,b-a,h,.16,DUV,(a+b)/2,0,z0,{r:.03}); engelle(a,z0-.3,b,z0+.3); } };
   parca(a0,kapi-.8); parca(kapi+.8,a0+L); };
 bolme(11,0,11,8,4.5); bolme(19,0,19,8,6.5); bolme(9,8,9,17,12.5); bolme(17,8,17,17,11.5);
 bolme(0,8,11,8,7.5); bolme(11,8,19,8,13); bolme(19,8,28,8,21.5);
 for(let x=17.3;x<28;x+=.5) kutu(dun,.08,.5,.08,'#f4efe6',x,0,16.85,{r:.02}); kutu(dun,10.7,.06,.06,'#f4efe6',22.6,.35,16.85,{r:.02,gs:0});
 const pencere=(x,y,w,h)=>{ kutu(dun,w+.16,h+.16,.06,'#fbfaf7',x,y-.08,.02,{r:.02,gs:0});
   const d=doku(256,Math.round(256*h/w),(g,a,b)=>{ const gr=g.createLinearGradient(0,0,0,b); gr.addColorStop(0,'#8fd0f5'); gr.addColorStop(1,'#d8f0fc'); g.fillStyle=gr; g.fillRect(0,0,a,b); g.fillStyle='#ffffffcc'; g.beginPath(); g.ellipse(a*.3,b*.35,a*.15,b*.07,0,0,7); g.fill(); g.fillStyle='#7cb86b'; g.fillRect(0,b*.82,a,b*.18); });
   levha(dun,w,h,x,y+h/2,.07,0,d); kutu(dun,.05,h,.03,'#fbfaf7',x,y,.09,{gs:0}); kutu(dun,w,.05,.03,'#fbfaf7',x,y+h/2,.09,{gs:0}); };
 pencere(3.5,1,2.2,1.2); pencere(15,1.1,2.6,1); pencere(25.5,1,1.8,1.1);
 /* ---------- mobilya + kullanımlar ---------- */
 const KUL=[], ekranlar={};
 function masa(x,z,ad,pat){ const w=pat?2.2:1.5, d=pat?1:.8, c=pat?'#5b3a26':'#c89b6d';
   kutu(dun,w,.06,d,c,x,.74,z,{r:.02});
   if(pat){ kutu(dun,.5,.7,d-.1,'#4a2e1d',x-w/2+.3,0,z); kutu(dun,.5,.7,d-.1,'#4a2e1d',x+w/2-.3,0,z); }
   else for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) kutu(dun,.06,.74,.06,'#8a6a4a',x+dx*(w/2-.08),0,z+dz*(d/2-.08));
   const ez=z-d/2+.2, mw=pat?.95:.75;
   kutu(dun,.08,.25,.08,'#2a2d36',x,.8,ez); kutu(dun,.25,.02,.18,'#2a2d36',x,.8,ez); kutu(dun,mw+.06,.5,.04,'#16181f',x,1.02,ez,{r:.02});
   ekranlar[ad]=ekran(dun,mw,.44,x,1.27,ez+.025,0,(g,a,b,yazi,aktif,renk)=>{ g.fillStyle=aktif?'#0d1726':'#0b0d12'; g.fillRect(0,0,a,b);
     if(!aktif){ g.fillStyle='#1f2a3a'; g.font='800 40px system-ui'; g.textAlign='center'; g.fillText('HC',a/2,b/2+14); return; }
     const t=performance.now(); g.strokeStyle=renk||'#2ce0b0'; g.lineWidth=4; g.beginPath(); for(let i=0;i<=24;i++){ const xx=20+i*(a-40)/24, yy=b*.66-Math.sin(i*.7+t/700)*b*.1-i*2.5; i?g.lineTo(xx,yy):g.moveTo(xx,yy); } g.stroke();
     g.fillStyle='#e8eefc'; g.font='700 26px system-ui'; g.textAlign='left'; g.fillText((yazi||'').slice(0,28),18,40);
     g.fillStyle='#ffffff44'; for(let i=0;i<3;i++) g.fillRect(18,b-62+i*16,60+((i*53+Math.floor(t/350))%220),7); });
   kutu(dun,.45,.02,.15,'#e9e9ee',x-(pat?.35:0),.8,z+.08,{r:.01,gs:0}); kure(dun,.05,'#e9e9ee',x+.38,.83,z+.1,[1,.5,1.4]);
   if(!pat){ sil(dun,.06,.12,['#fff','#ffd34d','#e0465a','#3b6fd6'][Object.keys(ekranlar).length%4],x-.55,.77,z+.1); }
   else { sil(dun,.07,.13,'#fff',x+.75,.77,z+.1); kutu(dun,.3,.04,.22,'#c0392b',x-.75,.77,z+.1,{r:.01}); kutu(dun,.3,.04,.22,'#2e86de',x-.75,.81,z+.1,{r:.01}); }
   const sz=z+d/2+.35, sr=pat?'#7a1f2a':'#3d4a66';
   sil(dun,.04,.4,'#2a2d36',x,0,sz); kutu(dun,.5,.08,.5,sr,x,.42,sz,{r:.04}); kutu(dun,.5,pat?.85:.55,.08,sr,x,.5,sz+.24,{r:.04});
   for(const a of [0,1.26,2.5,3.77,5.03]) kutu(dun,.32,.03,.04,'#2a2d36',x+Math.cos(a)*.15,.02,sz+Math.sin(a)*.15,{r:.01,gs:0});
   engelle(x-w/2,z-d/2,x+w/2,z+d/2);
   KUL.push({id:'masa-'+ad,oda:'ofis',tip:'yaz',x,z:sz,y:.46,yon:Math.PI/2,ekran:ad}); }
 masa(2.4,3,'avci'); masa(5.2,3,'veri'); masa(2.4,5.6,'den'); masa(5.2,5.6,'fikir'); masa(8.7,2.4,'loki',1);
 const tab=doku(512,128,(g,a,b)=>{ g.fillStyle='#1b1d26'; g.fillRect(0,0,a,b); g.fillStyle='#ffcf5a'; g.font='800 58px system-ui'; g.textAlign='center'; g.fillText('LOKİ · PATRON',a/2,b/2+20); });
 levha(dun,1.8,.45,8.7,2.1,.08,0,tab);
 kutu(dun,2.8,.015,2.2,'#7a1f2a',8.7,0,3.1,{r:.01,gs:0});
 { const g=new T.Group(); g.position.set(10.55,0,1.4); g.rotation.y=-Math.PI/2; dun.add(g); kutu(g,1.2,1.9,.35,'#6b4a30',0,0,0); const R=['#c0392b','#2e86de','#f5b041','#27ae60','#8e44ad','#ecf0f1'];
   for(let r=0;r<4;r++){ kutu(g,1.12,.03,.32,'#5a3d27',0,.2+r*.44,0,{gs:0}); for(let i=0;i<7;i++) kutu(g,.11,.28+((i*7+r)%3)*.04,.24,R[(i+r*2)%6],-.45+i*.15,.24+r*.44,0,{r:.01,gs:0}); } engelle(10.2,.7,11,2.1); }
 const bitki=(x,z,s)=>{ s=s||1; sil(dun,.22*s,.4*s,'#d9775a',x,0,z,{r2:.17*s}); for(let i=0;i<7;i++) kure(dun,.22*s,i%2?'#3aa46c':'#4fc27f',x+Math.cos(i)*.15*s,(.55+(i%3)*.15)*s,z+Math.sin(i)*.15*s,[1,1.3,1],{s:10}); engelle(x-.3,z-.3,x+.3,z+.3); };
 bitki(.75,.75); bitki(6.8,.75,.8); bitki(.75,7.3); bitki(18.3,.75); bitki(16.3,16.3,.9);
 sil(dun,.22,.9,'#e8edf3',7.2,0,7.3); sil(dun,.2,.45,'#7cc7f3',7.2,.9,7.3,{m:{transparent:true,opacity:.75}}); engelle(6.9,7,7.5,7.6);
 KUL.push({id:'sebil',oda:'ofis',tip:'ic',x:7.2,z:6.7,y:0,yon:-Math.PI/2});
 /* toplantı */
 kutu(dun,4.6,.07,1.5,'#5d4030',15,.72,4.4,{r:.05}); kutu(dun,.5,.72,.9,'#3e2a1e',13.4,0,4.4); kutu(dun,.5,.72,.9,'#3e2a1e',16.6,0,4.4); engelle(12.7,3.65,17.3,5.15);
 kutu(dun,3.2,1.9,.06,'#111',15,.9,.1,{r:.03,gs:0});
 const brif=ekran(dun,3.05,1.75,15,1.85,.15,0,(g,a,b,v)=>{ g.fillStyle='#0f1424'; g.fillRect(0,0,a,b); g.fillStyle='#ffcf5a'; g.font='800 36px system-ui'; g.textAlign='left'; g.fillText('GÜNLÜK BRİFİNG · 09:00',26,56);
   const L=(v&&v.length)?v:['Kapı durumu','Demo işlemler','Ofis bulguları']; g.font='600 26px system-ui'; L.slice(0,5).forEach((s,i)=>{ g.fillStyle=i?'#c9d3ea':'#2ce0b0'; g.fillText('• '+String(s).slice(0,36),30,112+i*44); }); });
 [[13.3,3.1,0],[14.6,3.1,0],[15.9,3.1,0],[13.3,5.7,1],[14.6,5.7,1],[15.9,5.7,1]].forEach(([x,z,arka],i)=>{ kutu(dun,.45,.06,.45,'#3d4a66',x,.42,z,{r:.04}); kutu(dun,.45,.45,.06,'#3d4a66',x,.45,z+(arka?.22:-.22),{r:.03}); sil(dun,.04,.42,'#2a2d36',x,0,z);
   KUL.push({id:'top-'+i,oda:'toplanti',tip:'dinle',x,z,y:.46,yon:arka?Math.PI/2:-Math.PI/2}); });
 KUL.push({id:'top-sun',oda:'toplanti',tip:'sun',x:17.2,z:1.3,y:0,yon:Math.PI*.75,patron:1});
 /* mutfak */
 kutu(dun,5.2,.9,.7,'#e9e3d6',22.6,0,.6); kutu(dun,5.3,.05,.76,'#3d3d47',22.6,.9,.6); for(let i=0;i<5;i++) kutu(dun,.95,.7,.02,'#ddd5c4',20.6+i*1.02,.1,.96,{gs:0}); engelle(19.9,.2,25.3,1.1);
 kutu(dun,.4,.5,.36,'#2b2b33',21,.95,.55,{r:.05}); kutu(dun,.3,.08,.2,'#555',21,1.05,.75); sil(dun,.06,.1,'#fff',21,.97,.78);
 kutu(dun,.5,.3,.35,'#c8c8d0',23.2,.95,.55,{r:.05}); kure(dun,.12,'#e0465a',24.2,1.05,.5); kure(dun,.1,'#f5b041',24.4,1.02,.65);
 const buhar=[]; for(let i=0;i<5;i++){ const m=new T.Mesh(new T.SphereGeometry(.05,8,6),new T.MeshBasicMaterial({color:'#fff',transparent:true,opacity:.5})); dun.add(m); buhar.push(m); }
 kutu(dun,.9,2,.75,'#dfe6ee',26.9,0,.6,{r:.06}); kutu(dun,.04,.6,.04,'#999',26.48,1.1,1); engelle(26.3,.1,27.5,1.2);
 for(let i=0;i<5;i++){ const x=20.4+i*.75, z=7.1; sil(dun,.16,.08,['#e0465a','#3b6fd6','#f5b041','#27ae60','#8e44ad'][i],x,0,z,{r2:.12}); kure(dun,.12,'#8b5a2b',x,.07,z,[1,.25,1]); KUL.push({id:'mama-'+i,oda:'mutfak',tip:'ye',x,z:z-.45,y:0,yon:-Math.PI/2}); }
 for(let i=0;i<2;i++){ const x=25.7+i*.8, z=7.1; sil(dun,.16,.08,'#cfd8e3',x,0,z,{r2:.12}); sil(dun,.12,.01,'#7cc7f3',x,.07,z); KUL.push({id:'su-'+i,oda:'mutfak',tip:'ic',x,z:z-.45,y:0,yon:-Math.PI/2}); }
 KUL.push({id:'kahve',oda:'mutfak',tip:'kahve',x:21,z:1.6,y:0,yon:Math.PI/2});
 sil(dun,.6,.05,'#c89b6d',23.5,.72,4,{s:28}); sil(dun,.06,.72,'#5a3d27',23.5,0,4); engelle(22.8,3.3,24.2,4.7); kure(dun,.12,'#f2d16b',23.4,.84,3.9,[1,.6,1]);
 /* oyun */
 sil(dun,2.2,.015,'#4f7fd1',4.5,0,12.5,{s:40}); sil(dun,1.6,.02,'#6c97e0',4.5,0,12.5,{s:40});
 const top=kure(dun,.13,'#b9e64a',4.5,.13,12.5); const topIz={x:4.5,z:12.5,vx:1,vz:.6};
 kutu(dun,2.8,.45,.9,'#d14f7a',4.5,0,16.1,{r:.12}); kutu(dun,2.8,.6,.25,'#b93f69',4.5,.4,16.45,{r:.1}); kutu(dun,.25,.65,.9,'#b93f69',3.2,0,16.1,{r:.1}); kutu(dun,.25,.65,.9,'#b93f69',5.8,0,16.1,{r:.1}); engelle(3,15.6,6,16.7);
 KUL.push({id:'kanepe-0',oda:'oyun',tip:'uzan',x:4,z:16,y:.46,yon:-Math.PI/2},{id:'kanepe-1',oda:'oyun',tip:'uzan',x:5,z:16,y:.46,yon:-Math.PI/2});
 kutu(dun,.45,.45,1.6,'#2b2b33',.6,0,12.5,{r:.04}); kutu(dun,.06,.95,1.7,'#111',.5,.48,12.5,{gs:0});
 const tv=ekran(dun,1.6,.86,.54,.95,12.5,Math.PI/2,(g,a,b)=>{ const t=performance.now()/1000; g.fillStyle='#1b6ad8'; g.fillRect(0,0,a,b); g.fillStyle='#ffd34d'; g.beginPath(); g.arc(a/2+Math.sin(t)*140,b/2+Math.cos(t*1.3)*60,28,0,7); g.fill(); g.fillStyle='#fff'; g.font='800 30px system-ui'; g.fillText('TOP AVI',20,44); });
 engelle(0,11.6,.9,13.4);
 for(let i=0;i<4;i++) KUL.push({id:'oyna-'+i,oda:'oyun',tip:'oyna',x:3+i*.9,z:11+(i%2)*2.6,y:0,yon:0});
 { const tn=new T.Mesh(new T.CylinderGeometry(.35,.35,1.4,20,1,true),M('#ff8a3d',{side:T.DoubleSide})); tn.rotation.z=Math.PI/2; tn.position.set(7.4,.35,10); tn.castShadow=true; dun.add(tn); }
 /* uyku */
 const YAD=['LOKİ','TOBİ','VENUS','HAYDUT','BADEM'], YR=['#7a1f2a','#2e86de','#e59866','#5d6d7e','#a569bd'], YK=['loki','avci','veri','den','fikir'];
 YAD.forEach((a,i)=>{ const x=10.6+(i%3)*2.2, z=i<3?10.3:13.7; sil(dun,.62,.16,YR[i],x,0,z,{s:28}); sil(dun,.5,.06,'#f3ece0',x,.12,z,{s:28});
   const tb=doku(256,64,(g,w,h)=>{ g.fillStyle='#f4ead6'; g.fillRect(0,0,w,h); g.fillStyle='#3a2a1a'; g.font='800 38px system-ui'; g.textAlign='center'; g.fillText(a,w/2,46); }); levha(dun,.6,.15,x,.26,z+.66,0,tb);
   KUL.push({id:'yatak-'+i,oda:'uyku',tip:'uyu',x,z,y:.16,yon:-Math.PI*.8,sahip:YK[i]}); });
 sil(dun,.08,1.3,'#ddd',16.3,0,9); kure(dun,.22,'#fff2b0',16.3,1.4,9,null,{m:{emissive:'#ffd27a',emissiveIntensity:.6}}); const gl=new T.PointLight('#ffcf7a',0,7); gl.position.set(16.3,1.4,9); sc.add(gl);
 kutu(dun,4,.015,2.6,'#8f7fbf',12.8,0,15.5,{r:.01,gs:0});
 /* bahçe */
 sil(dun,.18,1.6,'#7a5233',20,0,10); for(let i=0;i<6;i++) kure(dun,.7,i%2?'#3aa46c':'#4fbf72',20+Math.cos(i)*.45,2.1+(i%3)*.3,10+Math.sin(i)*.45,null,{s:12}); engelle(19.6,9.6,20.4,10.4);
 { const k=new T.Group(); k.position.set(26.5,0,10); dun.add(k); kutu(k,1.4,.9,1.2,'#c9774b',0,0,0,{r:.05}); const c=new T.Mesh(new T.ConeGeometry(1.15,.7,4),M('#7a3b2a')); c.rotation.y=Math.PI/4; c.position.y=1.25; c.castShadow=true; k.add(c);
   const ag=kutu(k,.05,.55,.5,'#3a2418',-.71,0,0,{r:.02}); engelle(25.8,9.4,27.2,10.6);
   const kt=doku(256,64,(g,w,h)=>{ g.fillStyle='#f4ead6'; g.fillRect(0,0,w,h); g.fillStyle='#7a3b2a'; g.font='800 34px system-ui'; g.textAlign='center'; g.fillText('HAYDUT',w/2,44); }); levha(dun,.6,.15,25.77,1.05,10,-Math.PI/2,kt); }
 sil(dun,1.1,.25,'#9aa5b1',23.5,0,14.2,{s:28}); sil(dun,.95,.02,'#5ab4e8',23.5,.24,14.2,{s:28,m:{roughness:.1}}); engelle(22.3,13,24.7,15.4);
 for(let i=0;i<14;i++){ const x=17.6+(i*.77)%10.2, z=16.25-(i%2)*.3; sil(dun,.015,.25,'#3a8a3a',x,0,z); kure(dun,.08,['#ff6b8b','#ffd34d','#fff','#b28cff'][i%4],x,.28,z,null,{s:8}); }
 kutu(dun,1.6,.08,.45,'#8b5a2b',19.4,.42,15.2,{r:.03}); kutu(dun,.08,.42,.4,'#5a3d27',18.7,0,15.2); kutu(dun,.08,.42,.4,'#5a3d27',20.1,0,15.2); engelle(18.5,14.9,20.3,15.5);
 KUL.push({id:'havuz',oda:'bahce',tip:'ic',x:23.5,z:12.7,y:0,yon:-Math.PI/2},{id:'kulube',oda:'bahce',tip:'uzan',x:25.2,z:10,y:0,yon:Math.PI},{id:'agac',oda:'bahce',tip:'kokla',x:20,z:11,y:0,yon:Math.PI/2},
   {id:'cicek',oda:'bahce',tip:'kokla',x:22,z:15.6,y:0,yon:-Math.PI/2},{id:'bank',oda:'bahce',tip:'uzan',x:19.4,z:15.2,y:.5,yon:-Math.PI/2},{id:'kos-0',oda:'bahce',tip:'gez',x:24,z:11,y:0,yon:0},{id:'kos-1',oda:'bahce',tip:'gez',x:21.5,z:13.5,y:0,yon:0});
 /* ---------- köpekler (cins özellikleriyle) ---------- */
 const CINS={loki:{f:'#e7b57c',k:'#b9824a',a:'#fbe8cc',kulak:'dik',boy:1,kuyruk:'kalkik',kravat:1},
   avci:{f:'#f7f3ec',k:'#a8622a',a:'#ffffff',kulak:'katlanik',boy:.8,kuyruk:'dik',leke:1,tasma:'#d94b4b'},
   veri:{f:'#e2a95f',k:'#c08a48',a:'#f3d7a6',kulak:'cocker',boy:.92,kuyruk:'kisa',tasma:'#e0569a'},
   den:{f:'#dcc6a1',k:'#2c241f',a:'#efe0c4',kulak:'kangal',boy:1.35,kuyruk:'kivrik',maske:1,tasma:'#2b2b33',civi:1},
   fikir:{f:'#a9734a',k:'#7b4b2b',a:'#d2a47a',kulak:'cocker',boy:.92,kuyruk:'kisa',tasma:'#27ae60'}};
 const AD={loki:'LOKİ',avci:'TOBİ',veri:'VENUS',den:'HAYDUT',fikir:'BADEM'};
 function kopek(k){ const c=CINS[k], s=c.boy, g=new T.Group(), gv=new T.Group(); g.add(gv); const mf=M(c.f), mk=M(c.k), ma=M(c.a), siyah=M('#1b1512',{roughness:.35});
   const add=(p,m,x,y,z)=>{ m.position.set(x,y,z); m.castShadow=true; p.add(m); return m; };
   const gov=add(gv,new T.Mesh(new T.CapsuleGeometry(.15*s,.32*s,6,14),mf),0,.36*s,0); gov.rotation.z=Math.PI/2;
   const gog=add(gv,new T.Mesh(new T.SphereGeometry(.13*s,14,12),ma),.2*s,.33*s,0); gog.scale.set(.9,1,1.05);
   if(c.leke){ const l=add(gv,new T.Mesh(new T.SphereGeometry(.12*s,12,10),mk),-.12*s,.42*s,.03); l.scale.set(1.2,.6,1); }
   if(c.kulak==='cocker'){ const fr=add(gv,new T.Mesh(new T.SphereGeometry(.16*s,12,10),mf),.05*s,.27*s,0); fr.scale.set(1.6,.5,1.05); }
   const bacak=[]; [[.2,.1],[.2,-.1],[-.2,.1],[-.2,-.1]].forEach(([x,z],i)=>{ const p=new T.Group(); p.position.set(x*s,.3*s,z*s); gv.add(p);
     add(p,new T.Mesh(new T.CapsuleGeometry(.045*s,.2*s,4,8),i<2?ma:mf),0,-.14*s,0); const ay=add(p,new T.Mesh(new T.SphereGeometry(.055*s,8,6),ma),.02*s,-.28*s,0); ay.scale.set(1.3,.6,1); bacak.push(p); });
   const bas=new T.Group(); bas.position.set(.3*s,.55*s,0); gv.add(bas);
   const kf=add(bas,new T.Mesh(new T.SphereGeometry(.15*s,16,14),mf),0,0,0); kf.scale.set(1,.95,.95);
   if(c.maske){ add(bas,new T.Mesh(new T.SphereGeometry(.153*s,16,12,-1,2,.8,1.3),mk),0,0,0); }
   if(c.leke){ const l=add(bas,new T.Mesh(new T.SphereGeometry(.154*s,14,12,Math.PI/2,Math.PI,0,1.4),mk),0,0,0); l.scale.set(1,.95,.95); }
   const bn=add(bas,new T.Mesh(new T.CapsuleGeometry(.07*s,.08*s,4,10),c.maske?mk:ma),.15*s,-.04*s,0); bn.rotation.z=Math.PI/2;
   add(bas,new T.Mesh(new T.SphereGeometry(.035*s,10,8),siyah),.25*s,-.02*s,0);
   const ag=add(bas,new T.Mesh(new T.SphereGeometry(.03*s,8,6),M('#d9606b')),.2*s,-.1*s,0); ag.scale.set(1,.4,.8); ag.visible=false;
   for(const z of [.065,-.065]){ add(bas,new T.Mesh(new T.SphereGeometry(.028*s,10,8),siyah),.12*s,.04*s,z*s); add(bas,new T.Mesh(new T.SphereGeometry(.009*s,6,4),M('#fff',{emissive:'#fff',emissiveIntensity:.5})),.146*s,.052*s,z*s+.006); }
   const kul=[]; for(const sg of [1,-1]){ const p=new T.Group(); p.position.set(-.02*s,.1*s,sg*.11*s); bas.add(p); let m;
     if(c.kulak==='dik'){ m=add(p,new T.Mesh(new T.ConeGeometry(.06*s,.17*s,4),mf),0,.08*s,0); m.rotation.x=sg*-.25; }
     else if(c.kulak==='katlanik'){ m=add(p,new T.Mesh(new T.ConeGeometry(.055*s,.11*s,3),mk),.04*s,.03*s,sg*.02); m.rotation.set(sg*-1.1,0,-1.2); }
     else if(c.kulak==='cocker'){ m=add(p,new T.Mesh(new T.CapsuleGeometry(.06*s,.16*s,4,10),mk),0,-.12*s,sg*.03*s); m.scale.set(1,1,.55); }
     else { m=add(p,new T.Mesh(new T.SphereGeometry(.07*s,10,8),mk),.01,-.05*s,sg*.02*s); m.scale.set(.7,1.3,.45); }
     kul.push(p); }
   const kuy=new T.Group(); kuy.position.set(-.3*s,.42*s,0); gv.add(kuy);
   if(c.kuyruk==='kivrik'){ const t=add(kuy,new T.Mesh(new T.TorusGeometry(.08*s,.035*s,8,16,4.4),mf),-.02,.1*s,0); t.rotation.z=.6; }
   else { const t=add(kuy,new T.Mesh(new T.CapsuleGeometry(.03*s,(c.kuyruk==='kisa'?.08:.2)*s,4,8),c.kuyruk==='dik'?ma:mf),0,.1*s,0); t.rotation.z=c.kuyruk==='kalkik'?-.5:-.2; }
   const halka=(renk)=>{ const t=add(gv,new T.Mesh(new T.TorusGeometry(.12*s,.022*s,8,20),M(renk)),.26*s,.47*s,0); t.rotation.y=Math.PI/2; t.rotation.x=.4; };
   if(c.tasma){ halka(c.tasma); if(c.civi) for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const cv=add(gv,new T.Mesh(new T.ConeGeometry(.012*s,.035*s,6),M('#d9d9e0',{metalness:.8,roughness:.3})),.26*s,.47*s+Math.sin(a)*.13*s,Math.cos(a)*.13*s); cv.lookAt(.26*s,.47*s,0); cv.rotateX(-Math.PI/2); } }
   if(c.kravat){ halka('#ffffff'); const kr=add(gv,new T.Mesh(new T.ConeGeometry(.045*s,.2*s,4),M('#c8323c')),.33*s,.3*s,0); kr.rotation.z=Math.PI; kr.scale.z=.35;
     const gm=M('#1b1512',{metalness:.6,roughness:.3}); for(const z of [.065,-.065]){ const r=add(bas,new T.Mesh(new T.TorusGeometry(.04*s,.008*s,6,16),gm),.15*s,.04*s,z*s); r.rotation.y=Math.PI/2; } const kp=add(bas,new T.Mesh(new T.CylinderGeometry(.006*s,.006*s,.05*s,6),gm),.16*s,.05*s,0); kp.rotation.x=Math.PI/2; }
   return {g,gv,bacak,bas,kul,kuy,ag,s}; }
 /* ---------- A* ---------- */
 const hucre=(x,z)=>[Math.max(0,Math.min(GX-1,Math.floor(x/HUC))),Math.max(0,Math.min(GZ-1,Math.floor(z/HUC)))];
 function bos(gx,gz){ if(!engel[gz*GX+gx]) return [gx,gz]; for(let r=1;r<8;r++) for(let dx=-r;dx<=r;dx++) for(let dz=-r;dz<=r;dz++){ const x=gx+dx,z=gz+dz; if(x>=0&&z>=0&&x<GX&&z<GZ&&!engel[z*GX+x]) return [x,z]; } return [gx,gz]; }
 const D8=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
 function yol(x0,z0,x1,z1){ const [ax,az]=bos(...hucre(x0,z0)), [bx,bz]=bos(...hucre(x1,z1)); const N=GX*GZ, g=new Float32Array(N).fill(1e9), from=new Int32Array(N).fill(-1), kp=new Uint8Array(N), s=az*GX+ax, e=bz*GX+bx; g[s]=0; const ac=[[0,s]];
   while(ac.length){ let bi=0; for(let i=1;i<ac.length;i++) if(ac[i][0]<ac[bi][0]) bi=i; const u=ac.splice(bi,1)[0][1]; if(u===e) break; if(kp[u]) continue; kp[u]=1; const ux=u%GX, uz=(u/GX)|0;
     for(const [dx,dz,c] of D8){ const vx=ux+dx, vz=uz+dz; if(vx<0||vz<0||vx>=GX||vz>=GZ) continue; const v=vz*GX+vx; if(engel[v]||kp[v]) continue; if(dx&&dz&&(engel[uz*GX+vx]||engel[vz*GX+ux])) continue; const ng=g[u]+c; if(ng<g[v]){ g[v]=ng; from[v]=u; ac.push([ng+Math.hypot(bx-vx,bz-vz),v]); } } }
   if(from[e]<0&&e!==s) return [[x1,z1]]; const P=[]; for(let u=e;u!==s&&u>=0;u=from[u]) P.push([(u%GX+.5)*HUC,(((u/GX)|0)+.5)*HUC]); P.reverse();
   const S=[]; for(let i=0;i<P.length-1;i+=2) S.push(P[i]); S.push([x1,z1]); return S; }
 /* ---------- ajanlar ---------- */
 const K=['loki','avci','veri','den','fikir'], A={};
 const katman=document.createElement('div'); katman.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden'; kap.appendChild(katman);
 const BAS={loki:[8.7,4.2],avci:[2.4,4.3],veri:[5.2,4.3],den:[2.4,6.9],fikir:[5.2,6.9]};
 K.forEach(k=>{ const m=kopek(k); m.g.position.set(BAS[k][0],0,BAS[k][1]); sc.add(m.g);
   const et=document.createElement('div'); et.className='o3-et'; et.innerHTML=`<i></i><b>${AD[k]}</b>`; katman.appendChild(et);
   A[k]={k,m,et,yol:[],is:null,kul:null,sure:Math.random()*2,poz:'ayakta',faz:Math.random()*9,yon:0,hiz:k==='den'?1.05:k==='avci'?1.5:1.25,bal:'',balT:0,oda:'ofis'}; });
 const dolu=new Set(); const saat=()=>{ const d=new Date(Date.now()+3*3600e3); return d.getUTCHours()+d.getUTCMinutes()/60; };
 let VERI=null;
 const ISY={avci:'Hata kayıtlarını tarıyorum',veri:'Servisleri ölçüyorum',den:'Sayfaları denetliyorum',fikir:'Demo karnesine bakıyorum',loki:'Ekibin raporunu yazıyorum'};
 const bulgu=k=>{ const o=VERI&&VERI.ofis; if(!o) return 0; if(k==='loki') return ((o.loki&&o.loki.B)||[]).length; const a=(o.asistan||{})[k]; return a?a.n||0:0; };
 const onemli=k=>{ const o=VERI&&VERI.ofis; return !!(o&&o.loki&&(o.loki.B||[]).some(b=>(b.a===k||k==='loki')&&b.o>=2)); };
 function karar(a){ const h=saat(), k=a.k, i=K.indexOf(k), r=Math.random(), masa=KUL.find(u=>u.id==='masa-'+k);
   if(h<7||h>=23.5) return KUL.find(u=>u.sahip===k);
   if(h>=9&&h<9.5) return k==='loki'?KUL.find(u=>u.id==='top-sun'):KUL.find(u=>u.id==='top-'+i);
   if(onemli(k)&&r<.8) return masa;
   if(r<(k==='loki'?.55:bulgu(k)>0?.68:.5)) return masa;
   const sec=[['mutfak','ye',.2],['mutfak','ic',.15],['ofis','ic',.08],['mutfak','kahve',k==='loki'?.3:.02],['oyun','oyna',k==='avci'?.4:.18],['oyun','uzan',.12],['bahce','kokla',.15],['bahce','gez',k==='den'?.3:.12],['bahce','ic',.06],['bahce','uzan',k==='den'?.3:.05]];
   let rr=Math.random()*sec.reduce((s,x)=>s+x[2],0); for(const [oda,tip,p] of sec){ rr-=p; if(rr<=0){ const L=KUL.filter(u=>u.oda===oda&&u.tip===tip&&!dolu.has(u.id)&&!u.patron&&!u.sahip); if(L.length) return L[Math.floor(Math.random()*L.length)]; break; } }
   return masa; }
 const SOZ={ye:['Mama vakti!','Mmm, nefis.'],ic:['Biraz su.','Ohh, serinledim.'],kahve:['Kahvesiz patron olmaz ☕'],oyna:['Topu at!','Benim o!'],uzan:['Beş dakika…','Kısa bir mola.'],kokla:['Burada ne var?'],gez:['Bahçe turu!'],dinle:['Dinliyorum patron.'],sun:['Toparlanın, brifing başlıyor!']};
 function balon(a,m,sn){ a.bal=m; a.balT=performance.now()+(sn||4)*1000; }
 function basla(a){ if(a.kul) dolu.delete(a.kul.id); const u=karar(a); a.kul=u||null; if(u) dolu.add(u.id); const p=a.m.g.position;
   a.yol=u?yol(p.x,p.z,u.x,u.z):[]; a.poz='yuru'; a.is=null; }
 function vardi(a){ const u=a.kul; if(!u){ a.sure=4; a.poz='ayakta'; return; } a.m.g.position.set(u.x,u.y||0,u.z); a.yon=u.yon; a.is=u.tip;
   a.poz={yaz:'otur',dinle:'otur',ye:'egil',ic:'egil',kahve:'ayakta',oyna:'oyna',uzan:'yat',uyu:'uyu',kokla:'egil',gez:'gez',sun:'ayakta'}[u.tip]||'ayakta';
   a.sure={yaz:45+Math.random()*60,dinle:60,uyu:120,ye:9,ic:7,kahve:14,oyna:22,uzan:28,kokla:8,gez:16,sun:60}[u.tip]||10;
   if(u.tip==='yaz') balon(a,ISY[a.k]+'…',5); else { const s=SOZ[u.tip]; if(s&&Math.random()<.75) balon(a,s[Math.floor(Math.random()*s.length)]); }
   if(u.ekran&&ekranlar[u.ekran]) ekranlar[u.ekran].aktif=1; }
 const L_=(a,b,t)=>a+(b-a)*t;
 function pozla(a,dt,t){ const m=a.m, s=m.s, f=a.faz, b=m.bacak, P=a.poz; let gy=0, eg=0, bz=0, bx=0, ks=Math.sin(t*6+f)*.4, kl=0;
   if(P==='yuru'||P==='gez'||P==='oyna'){ const w=Math.sin(t*(P==='oyna'?15:11)+f); b[0].rotation.z=b[3].rotation.z=w*.6; b[1].rotation.z=b[2].rotation.z=-w*.6; gy=Math.abs(w)*.02*s; ks=Math.sin(t*13+f)*.7; kl=w*.15; }
   else for(const x of b) x.rotation.z=L_(x.rotation.z,0,.2);
   if(P==='otur'){ eg=.5; b[2].rotation.z=b[3].rotation.z=1.15; b[0].rotation.z=b[1].rotation.z=-.45; gy=-.06*s; bz=-.3; bx=a.is==='yaz'?Math.sin(t*.8+f)*.15:0; }
   if(P==='egil'){ eg=-.12; bz=.85; ks=Math.sin(t*9+f)*.8; }
   if(P==='yat'||P==='uyu'){ gy=-.2*s; for(let i=0;i<4;i++) b[i].rotation.z=i<2?-1.35:1.35; bz=P==='uyu'?.45:.05; ks=P==='uyu'?0:Math.sin(t*3+f)*.3; }
   m.gv.scale.y=P==='uyu'?1+Math.sin(t*1.6+f)*.035:1;
   m.ag.visible=(P==='yuru'||P==='oyna'||P==='gez')||(P==='ayakta'&&Math.sin(t*.5+f)>.6);
   m.gv.position.y=L_(m.gv.position.y,gy,.2); m.gv.rotation.z=L_(m.gv.rotation.z,eg,.15);
   m.bas.rotation.z=L_(m.bas.rotation.z,-bz,.15); m.bas.rotation.x=L_(m.bas.rotation.x,bx,.15); m.kuy.rotation.x=ks; for(const k_ of m.kul) k_.rotation.x=kl;
   let dy=a.yon-m.g.rotation.y; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2; m.g.rotation.y+=dy*Math.min(1,dt*8); }
 const yonu=(dx,dz)=>Math.atan2(-dz,dx);
 function adim(a,dt){ const g=a.m.g.position;
   if(a.poz==='yuru'){ g.y=L_(g.y,0,.3); const h=a.yol[0]; if(!h){ vardi(a); return; } const dx=h[0]-g.x, dz=h[1]-g.z, d=Math.hypot(dx,dz);
     if(d<.06){ a.yol.shift(); if(!a.yol.length) vardi(a); return; } const v=Math.min(d,a.hiz*dt); g.x+=dx/d*v; g.z+=dz/d*v; a.yon=yonu(dx,dz); return; }
   if(a.poz==='gez'){ if(!a.gz||Math.hypot(a.gz[0]-g.x,a.gz[1]-g.z)<.15){ const o=ODA.bahce; for(let i=0;i<30;i++){ const x=o.x0+1+Math.random()*(o.x1-o.x0-2), z=o.z0+1+Math.random()*(o.z1-o.z0-2), [hx,hz]=hucre(x,z); if(!engel[hz*GX+hx]){ a.gz=[x,z]; break; } } }
     if(a.gz){ const dx=a.gz[0]-g.x, dz=a.gz[1]-g.z, d=Math.hypot(dx,dz)||1; const nx=g.x+dx/d*a.hiz*1.2*dt, nz=g.z+dz/d*a.hiz*1.2*dt, [hx,hz]=hucre(nx,nz); if(engel[hz*GX+hx]) a.gz=null; else { g.x=nx; g.z=nz; a.yon=yonu(dx,dz); } } }
   if(a.poz==='oyna'){ const dx=topIz.x-g.x, dz=topIz.z-g.z, d=Math.hypot(dx,dz)||1; if(d>.32){ g.x+=dx/d*a.hiz*1.5*dt; g.z+=dz/d*a.hiz*1.5*dt; a.yon=yonu(dx,dz); } else { topIz.vx=(Math.random()-.5)*5; topIz.vz=(Math.random()-.5)*5; } }
   a.sure-=dt; if(a.sure<=0){ if(a.kul&&a.kul.ekran&&ekranlar[a.kul.ekran]) ekranlar[a.kul.ekran].aktif=0; basla(a); } }
 /* ---------- kamera ---------- */
 let takip=null;
 function odaSec(id){ takip=null; const o=ODA[id]; if(o){ camHedef.c.set((o.x0+o.x1)/2,0,(o.z0+o.z1)/2+.3); camHedef.z=Math.max(o.x1-o.x0,o.z1-o.z0)*.9; } else { camHedef.c.set(14,0,8.5); camHedef.z=24; } }
 odaSec(opt.oda||'ofis'); camAn.c.copy(camHedef.c); camAn.z=camHedef.z;
 function camGuncelle(r){ const asp=r.width/(r.height||1); let w=camAn.z, h=w/asp; if(h<camAn.z*.62){ h=camAn.z*.62; w=h*asp; } cam.left=-w/2; cam.right=w/2; cam.top=h/2; cam.bottom=-h/2; cam.updateProjectionMatrix();
   const c=camAn.c, u=30; cam.position.set(c.x+Math.sin(aci)*u,u*.9,c.z+Math.cos(aci)*u); cam.lookAt(c.x,0,c.z); }
 let sur=null; const el=ren.domElement;
 el.addEventListener('pointerdown',e=>{ sur={x:e.clientX,y:e.clientY,a:aci}; });
 el.addEventListener('pointermove',e=>{ if(sur&&Math.abs(e.clientX-sur.x)>8) aci=sur.a+(e.clientX-sur.x)*.006; });
 el.addEventListener('pointerup',e=>{ if(!sur) return; const kis=Math.abs(e.clientX-sur.x)<8&&Math.abs(e.clientY-sur.y)<8; sur=null; if(kis) tikla(e); });
 el.addEventListener('pointercancel',()=>{ sur=null; });
 const ray=new T.Raycaster();
 function tikla(e){ const r=el.getBoundingClientRect(), p=new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); ray.setFromCamera(p,cam);
   let en=null, ed=1e9; K.forEach(k=>{ const h=ray.intersectObject(A[k].m.g,true); if(h.length&&h[0].distance<ed){ ed=h[0].distance; en=k; } });
   if(!en){ ed=46; K.forEach(k=>{ const v=A[k].m.g.position.clone(); v.y=.4; v.project(cam); const d=Math.hypot((v.x-p.x)*r.width,(v.y-p.y)*r.height)/2; if(d<ed){ ed=d; en=k; } }); }
   if(opt.secildi) opt.secildi(en); }
 /* ---------- döngü ---------- */
 let son=performance.now(), cal=true, sT=0, eT=0, secili=null; const geceR=new Color('#0c0e1a'), gunR=new Color('#1a1d2b');
 function ciz(){ if(!cal) return; requestAnimationFrame(ciz); if(!kap.isConnected){ cal=false; ren.dispose(); return; } if(!kap.offsetParent||document.hidden){ son=performance.now(); return; }
   const now=performance.now(); if(mob&&now-son<30) return; const dt=Math.min(.05,(now-son)/1000); son=now; const t=now/1000;
   const r=kap.getBoundingClientRect(); const cw=Math.round(r.width), ch=Math.round(r.height); if(el.width!==Math.round(cw*ren.getPixelRatio())||el.height!==Math.round(ch*ren.getPixelRatio())) ren.setSize(cw,ch,false);
   const ck=1-Math.exp(-dt*4); camAn.c.lerp(takip&&A[takip]?A[takip].m.g.position:camHedef.c,ck); camAn.z=L_(camAn.z,takip?5.5:camHedef.z,ck); camGuncelle(r);
   K.forEach(k=>{ adim(A[k],dt); pozla(A[k],dt,t); });
   const o=ODA.oyun; topIz.x+=topIz.vx*dt; topIz.z+=topIz.vz*dt; topIz.vx*=.985; topIz.vz*=.985;
   if(topIz.x<o.x0+1.4||topIz.x>o.x1-.8) topIz.vx*=-1; if(topIz.z<o.z0+.8||topIz.z>o.z1-1.5) topIz.vz*=-1;
   topIz.x=Math.max(o.x0+1.4,Math.min(o.x1-.8,topIz.x)); topIz.z=Math.max(o.z0+.8,Math.min(o.z1-1.5,topIz.z)); top.position.set(topIz.x,.13,topIz.z); top.rotation.x+=topIz.vz*dt*5; top.rotation.z-=topIz.vx*dt*5;
   buhar.forEach((b,i)=>{ const p=(t*.4+i/5)%1; b.position.set(21+Math.sin(t+i)*.04,1.15+p*.5,.78); b.material.opacity=.45*(1-p); b.scale.setScalar(.6+p); });
   const h=saat(), gece=h<6.5||h>=19.5; gunes.intensity=L_(gunes.intensity,gece?.25:2.2,.02); hemi.intensity=L_(hemi.intensity,gece?.45:1.1,.02); gl.intensity=L_(gl.intensity,gece?6:0,.05); sc.background.lerp(gece?geceR:gunR,.02);
   if(now-eT>450){ eT=now; for(const k in ekranlar){ const e=ekranlar[k]; e.yenile(ISY[k],!!e.aktif,k==='loki'?'#ffcf5a':'#2ce0b0'); } tv.yenile(); }
   ren.render(sc,cam);
   K.forEach(k=>{ const a=A[k], v=a.m.g.position.clone(); v.y+=.8*a.m.s+(a.poz==='otur'?.12:0); v.project(cam); const x=(v.x+1)/2*cw, y=(1-v.y)/2*ch, gr=x>-60&&x<cw+60&&y>-60&&y<ch+60;
     a.et.style.display=gr?'':'none'; if(!gr) return; a.et.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
     const bi=a.et.firstChild, b=now<a.balT?a.bal:(a.poz==='uyu'?'z z z':''); if(bi.textContent!==b) bi.textContent=b; bi.style.display=b?'':'none'; a.et.classList.toggle('sec',secili===k); });
   if(now-sT>1000){ sT=now; if(opt.durum) opt.durum(odaSay()); } }
 function odaSay(){ const n={}; K.forEach(k=>{ const a=A[k], p=a.m.g.position; for(const id in ODA){ const o=ODA[id]; if(p.x>=o.x0&&p.x<o.x1&&p.z>=o.z0&&p.z<o.z1){ n[id]=(n[id]||0)+1; a.oda=id; } } }); return n; }
 requestAnimationFrame(ciz);
 return { odaSec, takip(k){ takip=k||null; }, sec(k){ secili=k||null; }, veri(v){ VERI=v; const B=v&&v.ofis&&v.ofis.loki&&v.ofis.loki.B; brif.yenile(B?B.map(b=>(AD[b.a]||b.a)+': '+b.b):null); },
   konus(k,m,sn){ if(A[k]) balon(A[k],m,sn); }, odaSay, nerede(k){ return A[k]&&A[k].oda; }, durdur(){ cal=false; } };
};
window.HCOfis3D=HCOfis3D;
})();
