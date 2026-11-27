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
 kap.appendChild(ren.domElement); ren.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:none';
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
 function ekran(p,w,h,x,y,z,ry,ciz){ const d=doku(512,Math.round(512*h/w),ciz); d.m=levha(p,w,h,x,y,z,ry,d); return d; }
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
 const PEN=[]; const GOK={gunduz:['#8fd0f5','#d8f0fc'],batim:['#ff9a62','#ffd59a'],gece:['#0b1230','#1c2550'],bulut:['#9fb0c2','#d6dde6']};
 const pencere=(x,y,w,h)=>{ kutu(dun,w+.16,h+.16,.06,'#fbfaf7',x,y-.08,.02,{r:.02,gs:0});
   const d=doku(256,Math.round(256*h/w),(g,a,b,mod,hv)=>{ mod=mod||'gunduz'; const G=GOK[hv&&mod==='gunduz'&&hv!=='acik'?'bulut':mod]||GOK.gunduz; const gr=g.createLinearGradient(0,0,0,b); gr.addColorStop(0,G[0]); gr.addColorStop(1,G[1]); g.fillStyle=gr; g.fillRect(0,0,a,b);
     if(mod==='gece'){ for(let i=0;i<28;i++){ g.fillStyle='rgba(255,255,240,'+(.4+((i*37)%60)/100)+')'; g.fillRect((i*53)%a,(i*29)%(b*.75),2,2); } g.fillStyle='#fff6d0'; g.beginPath(); g.arc(a*.78,b*.25,10,0,7); g.fill(); }
     else if(mod==='batim'){ g.fillStyle='#ffcf6a'; g.beginPath(); g.arc(a*.7,b*.72,18,0,7); g.fill(); }
     else { g.fillStyle='#ffffffcc'; g.beginPath(); g.ellipse(a*.3,b*.35,a*.15,b*.07,0,0,7); g.fill(); }
     if(hv==='yagmur'){ g.strokeStyle='rgba(220,235,255,.7)'; g.lineWidth=2; for(let i=0;i<30;i++){ const x=(i*41)%a, y=(i*67)%b; g.beginPath(); g.moveTo(x,y); g.lineTo(x-5,y+14); g.stroke(); } }
     if(hv==='kar'){ g.fillStyle='#fff'; for(let i=0;i<34;i++){ g.beginPath(); g.arc((i*41)%a,(i*67)%b,2.5,0,7); g.fill(); } }
     g.fillStyle=mod==='gece'?'#1d3a2a':'#7cb86b'; g.fillRect(0,b*.82,a,b*.18); }); PEN.push(d);
   levha(dun,w,h,x,y+h/2,.07,0,d); kutu(dun,.05,h,.03,'#fbfaf7',x,y,.09,{gs:0}); kutu(dun,w,.05,.03,'#fbfaf7',x,y+h/2,.09,{gs:0}); };
 pencere(3.5,1,2.2,1.2); pencere(15,1.1,2.6,1); pencere(25.5,1,1.8,1.1);
 /* ---------- mobilya + kullanımlar ---------- */
 const KUL=[], ekranlar={};
 function masa(x,z,ad,pat,par){ const PR=par||dun; const w=pat?2.2:1.5, d=pat?1:.8, c=pat?'#5b3a26':'#c89b6d';
   kutu(PR,w,.06,d,c,x,.74,z,{r:.02});
   if(pat){ kutu(PR,.5,.7,d-.1,'#4a2e1d',x-w/2+.3,0,z); kutu(PR,.5,.7,d-.1,'#4a2e1d',x+w/2-.3,0,z); }
   else for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) kutu(PR,.06,.74,.06,'#8a6a4a',x+dx*(w/2-.08),0,z+dz*(d/2-.08));
   const ez=z-d/2+.2, mw=pat?.95:.75;
   kutu(PR,.08,.25,.08,'#2a2d36',x,.8,ez); kutu(PR,.25,.02,.18,'#2a2d36',x,.8,ez); kutu(PR,mw+.06,.5,.04,'#16181f',x,1.02,ez,{r:.02});
   ekranlar[ad]=ekran(PR,mw,.44,x,1.27,ez+.025,0,(g,a,b,yazi,aktif,renk)=>{ g.fillStyle=aktif?'#0d1726':'#0b0d12'; g.fillRect(0,0,a,b);
     if(!aktif){ g.fillStyle='#1f2a3a'; g.font='800 40px system-ui'; g.textAlign='center'; g.fillText('HC',a/2,b/2+14); return; }
     const t=performance.now(); g.strokeStyle=renk||'#2ce0b0'; g.lineWidth=4; g.beginPath(); for(let i=0;i<=24;i++){ const xx=20+i*(a-40)/24, yy=b*.66-Math.sin(i*.7+t/700)*b*.1-i*2.5; i?g.lineTo(xx,yy):g.moveTo(xx,yy); } g.stroke();
     g.fillStyle='#e8eefc'; g.font='700 26px system-ui'; g.textAlign='left'; g.fillText((yazi||'').slice(0,28),18,40);
     g.fillStyle='#ffffff44'; for(let i=0;i<3;i++) g.fillRect(18,b-62+i*16,60+((i*53+Math.floor(t/350))%220),7); });
   kutu(PR,.45,.02,.15,'#e9e9ee',x-(pat?.35:0),.8,z+.08,{r:.01,gs:0}); kure(PR,.05,'#e9e9ee',x+.38,.83,z+.1,[1,.5,1.4]);
   if(!pat){ sil(PR,.06,.12,['#fff','#ffd34d','#e0465a','#3b6fd6'][Object.keys(ekranlar).length%4],x-.55,.77,z+.1); }
   else { sil(PR,.07,.13,'#fff',x+.75,.77,z+.1); kutu(PR,.3,.04,.22,'#c0392b',x-.75,.77,z+.1,{r:.01}); kutu(PR,.3,.04,.22,'#2e86de',x-.75,.81,z+.1,{r:.01}); }
   const sz=z+d/2+.35, sr=pat?'#7a1f2a':'#3d4a66';
   sil(PR,.05,.4,'#2a2d36',x,0,sz); kutu(PR,.62,.12,.62,sr,x,.38,sz,{r:.06}); kutu(PR,.62,pat?.55:.3,.1,sr,x,.48,sz+.3,{r:.05});
   for(const a of [0,1.26,2.5,3.77,5.03]) kutu(PR,.32,.03,.04,'#2a2d36',x+Math.cos(a)*.15,.02,sz+Math.sin(a)*.15,{r:.01,gs:0});
   if(!par){ engelle(x-w/2,z-d/2,x+w/2,z+d/2);
   KUL.push({id:'masa-'+ad,oda:'ofis',tip:'yaz',x,z:sz,y:.48,yon:Math.PI/2,ekran:ad,ileri:.16}); } }
 const masaG=(g,ad)=>masa(0,0,ad,1,g);
 const KL=[];
 masa(2.4,3,'avci'); masa(5.2,3,'veri'); masa(2.4,5.6,'den'); masa(5.2,5.6,'fikir'); { const g=new T.Group(); g.position.set(8.9,0,3.6); g.rotation.y=Math.PI/2; dun.add(g); masaG(g,'loki'); engelle(8.4,2.5,9.4,4.7); KUL.push({id:'masa-loki',oda:'ofis',tip:'yaz',x:9.75,z:3.6,y:.48,yon:Math.PI,ekran:'loki',ileri:.16}); }
 /* masa ayrıntıları: kâğıtlar, kişisel eşyalar */
 for(const [x,z] of [[2.4,3],[5.2,3],[2.4,5.6],[5.2,5.6]]){ kutu(dun,.21,.01,.29,'#fbfbf6',x+.45,.77,z-.05,{r:.002,gs:0}); kutu(dun,.21,.01,.29,'#f1f1ea',x+.48,.78,z-.02,{r:.002,gs:0}).rotation.y=.2; }
 kure(dun,.06,'#d7f04a',2.4+.58,.83,3-.18);                          /* Tobey'nin tenis topu */
 sil(dun,.06,.06,'#ff8fb3',5.2+.6,.77,3-.2,{r2:.07});                 /* Venus'un pembe kalemliği */
 sil(dun,.05,.08,'#cf7b55',5.2+.6,.77,5.6-.2); kure(dun,.07,'#4fbf72',5.2+.6,.9,5.6-.2,null,{s:10});   /* Badem'in kaktüsü */
 { const kb=new T.Group(); kb.position.set(1.15,0,6.3); kb.rotation.y=.6; dun.add(kb); sil(kb,.03,.32,'#f4efe3',0,.03,0).rotation.z=Math.PI/2; for(const x of [-.17,.17]) for(const z of [-.04,.04]) kure(kb,.045,'#f4efe3',x,.04,z); }   /* Haydut'un kemiği */
 const tab=doku(512,128,(g,a,b)=>{ g.fillStyle='#1b1d26'; g.fillRect(0,0,a,b); g.fillStyle='#ffcf5a'; g.font='800 58px system-ui'; g.textAlign='center'; g.fillText('LOKİ',a/2,b/2+20); });
 levha(dun,1.1,.4,8.9,2.1,.08,0,tab);
 kutu(dun,2.4,.015,2.8,'#7a1f2a',9.2,0,3.6,{r:.01,gs:0});
 { const g=new T.Group(); g.position.set(10.55,0,1.4); g.rotation.y=-Math.PI/2; dun.add(g); kutu(g,1.2,1.9,.35,'#6b4a30',0,0,0); const R=['#c0392b','#2e86de','#f5b041','#27ae60','#8e44ad','#ecf0f1'];
   for(let r=0;r<4;r++){ kutu(g,1.12,.03,.32,'#5a3d27',0,.2+r*.44,0,{gs:0}); for(let i=0;i<7;i++) kutu(g,.11,.28+((i*7+r)%3)*.04,.24,R[(i+r*2)%6],-.45+i*.15,.24+r*.44,0,{r:.01,gs:0}); } engelle(10.2,.7,11,2.1); }
 const bitki=(x,z,s)=>{ s=s||1; sil(dun,.22*s,.4*s,'#d9775a',x,0,z,{r2:.17*s}); for(let i=0;i<7;i++) kure(dun,.22*s,i%2?'#3aa46c':'#4fc27f',x+Math.cos(i)*.15*s,(.55+(i%3)*.15)*s,z+Math.sin(i)*.15*s,[1,1.3,1],{s:10}); engelle(x-.3,z-.3,x+.3,z+.3); };
 bitki(.75,.75); bitki(6.8,.75,.8); bitki(.75,7.3); KUL.push({id:'bitki-of',oda:'ofis',tip:'kokla',x:1.4,z:7.3,y:0,yon:Math.PI},{id:'oku',oda:'ofis',tip:'oku',x:9.95,z:1.4,y:0,yon:0},{id:'pencere-0',oda:'ofis',tip:'bak',x:3.5,z:.9,y:0,yon:Math.PI/2},{id:'pencere-1',oda:'toplanti',tip:'bak',x:15.6,z:2.2,y:0,yon:Math.PI/2}); bitki(18.3,.75); bitki(16.3,16.3,.9);
 sil(dun,.22,.9,'#e8edf3',7.2,0,7.3); sil(dun,.2,.45,'#7cc7f3',7.2,.9,7.3,{m:{transparent:true,opacity:.75}}); engelle(6.9,7,7.5,7.6);
 KUL.push({id:'sebil',oda:'ofis',tip:'ic',x:7.2,z:6.7,y:0,yon:-Math.PI/2});
 /* toplantı */
 kutu(dun,4.6,.07,1.5,'#5d4030',15,.72,4.4,{r:.05}); kutu(dun,.5,.72,.9,'#3e2a1e',13.4,0,4.4); kutu(dun,.5,.72,.9,'#3e2a1e',16.6,0,4.4); engelle(12.7,3.65,17.3,5.15);
 kutu(dun,3.2,1.9,.06,'#111',15,.9,.1,{r:.03,gs:0});
 let panoMesh=null; const brif=(()=>{ const d=doku(1024,588,(g,a,b,v)=>{ g.scale(2,2); a/=2; b/=2; g.fillStyle='#0f1424'; g.fillRect(0,0,a,b); g.fillStyle='#ffcf5a'; g.font='800 36px system-ui'; g.textAlign='left'; g.fillText('GÜNLÜK BRİFİNG · 09:00',26,56);
   const L=(v&&v.length)?v:['Kapı durumu','Demo işlemler','Ofis bulguları']; g.font='600 26px system-ui'; L.slice(0,5).forEach((s,i)=>{ g.fillStyle=i?'#c9d3ea':'#2ce0b0'; g.fillText('• '+String(s).slice(0,36),30,112+i*44); }); g.setTransform(1,0,0,1,0,0); }); panoMesh=levha(dun,3.05,1.75,15,1.85,.15,0,d); return d; })(); let panoVeri=null;
 [[13.3,3.1,0],[14.6,3.1,0],[15.9,3.1,0],[13.3,5.7,1],[14.6,5.7,1],[15.9,5.7,1]].forEach(([x,z,arka],i)=>{ kutu(dun,.6,.1,.6,'#3d4a66',x,.38,z,{r:.05}); kutu(dun,.6,.28,.08,'#3d4a66',x,.46,z+(arka?.29:-.29),{r:.03}); sil(dun,.04,.42,'#2a2d36',x,0,z);
   KUL.push({id:'top-'+i,oda:'toplanti',tip:'dinle',x,z,y:.48,yon:arka?Math.PI/2:-Math.PI/2,ileri:.16}); });
 KUL.push({id:'top-sun',oda:'toplanti',tip:'sun',x:17.2,z:1.3,y:0,yon:Math.PI*.75,patron:1});
 /* mutfak */
 kutu(dun,5.2,.9,.7,'#e9e3d6',22.6,0,.6); kutu(dun,5.3,.05,.76,'#3d3d47',22.6,.9,.6); for(let i=0;i<5;i++) kutu(dun,.95,.7,.02,'#ddd5c4',20.6+i*1.02,.1,.96,{gs:0}); engelle(19.9,.2,25.3,1.1);
 KL.push({ne:'kahve',m:kutu(dun,.4,.5,.36,'#2b2b33',21,.95,.55,{r:.05})}); kutu(dun,.3,.08,.2,'#555',21,1.05,.75); sil(dun,.06,.1,'#fff',21,.97,.78);
 kutu(dun,.5,.3,.35,'#c8c8d0',23.2,.95,.55,{r:.05}); kure(dun,.12,'#e0465a',24.2,1.05,.5); kure(dun,.1,'#f5b041',24.4,1.02,.65);
 const buhar=[]; for(let i=0;i<5;i++){ const m=new T.Mesh(new T.SphereGeometry(.05,8,6),new T.MeshBasicMaterial({color:'#fff',transparent:true,opacity:.5})); dun.add(m); buhar.push(m); }
 kutu(dun,.9,2,.7,'#dfe6ee',26.9,0,.55,{r:.06}); const kapak=new T.Group(); kapak.position.set(26.45,0,.92); dun.add(kapak); kutu(kapak,.9,1.96,.06,'#e9eef4',.45,.02,0,{r:.03}); kutu(kapak,.04,.5,.04,'#999',.08,1.1,.05); KL.push({ne:'dolap',m:kapak}); const dolapIs=new T.PointLight('#e8f4ff',0,2.2); dolapIs.position.set(26.9,1.3,1.1); sc.add(dolapIs); engelle(26.3,.1,27.5,1.2);
 for(let i=0;i<5;i++){ const x=20.4+i*.75, z=7.1; KL.push({ne:'mama',k:['loki','avci','veri','den','fikir'][i],m:null}); KL[KL.length-1].m=sil(dun,.16,.08,['#e0465a','#3b6fd6','#f5b041','#27ae60','#8e44ad'][i],x,0,z,{r2:.12}); kure(dun,.12,'#8b5a2b',x,.07,z,[1,.25,1]); KUL.push({id:'mama-'+i,oda:'mutfak',tip:'ye',x,z:z-.45,y:0,yon:-Math.PI/2}); }
 for(let i=0;i<2;i++){ const x=25.7+i*.8, z=7.1; sil(dun,.16,.08,'#cfd8e3',x,0,z,{r2:.12}); sil(dun,.12,.01,'#7cc7f3',x,.07,z); KUL.push({id:'su-'+i,oda:'mutfak',tip:'ic',x,z:z-.45,y:0,yon:-Math.PI/2}); }
 KUL.push({id:'kahve',oda:'mutfak',tip:'kahve',x:21,z:1.6,y:0,yon:Math.PI/2});
 sil(dun,.6,.05,'#c89b6d',23.5,.72,4,{s:28}); sil(dun,.06,.72,'#5a3d27',23.5,0,4); engelle(22.8,3.3,24.2,4.7); kure(dun,.12,'#f2d16b',23.4,.84,3.9,[1,.6,1]);
 /* oyun */
 sil(dun,2.2,.015,'#4f7fd1',4.5,0,12.5,{s:40}); sil(dun,1.6,.02,'#6c97e0',4.5,0,12.5,{s:40});
 const top=kure(dun,.13,'#b9e64a',4.5,.13,12.5); KL.push({ne:'top',m:top}); const topIz={x:4.5,z:12.5,vx:1,vz:.6};
 kutu(dun,2.8,.45,.9,'#d14f7a',4.5,0,16.1,{r:.12}); kutu(dun,2.8,.6,.25,'#b93f69',4.5,.4,16.45,{r:.1}); kutu(dun,.25,.65,.9,'#b93f69',3.2,0,16.1,{r:.1}); kutu(dun,.25,.65,.9,'#b93f69',5.8,0,16.1,{r:.1}); engelle(3,15.6,6,16.7);
 KUL.push({id:'kanepe-0',oda:'oyun',tip:'uzan',x:4,z:16,y:.46,yon:-Math.PI/2},{id:'kanepe-1',oda:'oyun',tip:'uzan',x:5,z:16,y:.46,yon:-Math.PI/2});
 kutu(dun,.45,.45,1.6,'#2b2b33',.6,0,12.5,{r:.04}); kutu(dun,.06,.95,1.7,'#111',.5,.48,12.5,{gs:0});
 let tvAcik=false; const tv=ekran(dun,1.6,.86,.54,.95,12.5,Math.PI/2,(g,a,b,acik)=>{ if(!acik){ g.fillStyle='#08090d'; g.fillRect(0,0,a,b); return; } const t=performance.now()/1000; g.fillStyle='#1b6ad8'; g.fillRect(0,0,a,b); g.fillStyle='#ffd34d'; g.beginPath(); g.arc(a/2+Math.sin(t)*140,b/2+Math.cos(t*1.3)*60,28,0,7); g.fill(); g.fillStyle='#fff'; g.font='800 30px system-ui'; g.fillText('TOP AVI',20,44); });
 engelle(0,11.6,.9,13.4);
 for(let i=0;i<3;i++) KUL.push({id:'izle-'+i,oda:'oyun',tip:'izle',x:2.1+(i%2)*.2,z:11.6+i*.9,y:0,yon:Math.PI}); KUL.push({id:'tunel',oda:'oyun',tip:'tunel',x:6.3,z:10,x2:8.5,z2:10,y:0,yon:0},{id:'buzdolabi',oda:'mutfak',tip:'ac',x:26.9,z:1.75,y:0,yon:Math.PI/2}); for(let i=0;i<4;i++) KUL.push({id:'oyna-'+i,oda:'oyun',tip:'oyna',x:3+i*.9,z:11+(i%2)*2.6,y:0,yon:0});
 { const tn=new T.Mesh(new T.CylinderGeometry(.35,.35,1.4,20,1,true),M('#ff8a3d',{side:T.DoubleSide})); tn.rotation.z=Math.PI/2; tn.position.set(7.4,.35,10); tn.castShadow=true; dun.add(tn); }
 /* uyku */
 const YAD=['LOKİ','TOBEY','VENUS','HAYDUT','BADEM'], YR=['#7a1f2a','#2e86de','#e59866','#5d6d7e','#a569bd'], YK=['loki','avci','veri','den','fikir'];
 YAD.forEach((a,i)=>{ const x=10.6+(i%3)*2.2, z=i<3?10.3:13.7; KL.push({m:sil(dun,.62,.16,YR[i],x,0,z,{s:28}),ne:'yatak',k:YK[i]}); sil(dun,.5,.06,'#f3ece0',x,.12,z,{s:28});
   const tb=doku(256,64,(g,w,h)=>{ g.fillStyle='#f4ead6'; g.fillRect(0,0,w,h); g.fillStyle='#3a2a1a'; g.font='800 38px system-ui'; g.textAlign='center'; g.fillText(a,w/2,46); }); levha(dun,.6,.15,x,.26,z+.66,0,tb);
   KUL.push({id:'yatak-'+i,oda:'uyku',tip:'uyu',x,z,y:.16,yon:-Math.PI*.8,sahip:YK[i]}); });
 sil(dun,.08,1.3,'#ddd',16.3,0,9); kure(dun,.22,'#fff2b0',16.3,1.4,9,null,{m:{emissive:'#ffd27a',emissiveIntensity:.6}}); const gl=new T.PointLight('#ffcf7a',0,7); gl.position.set(16.3,1.4,9); sc.add(gl);
 kutu(dun,4,.015,2.6,'#8f7fbf',12.8,0,15.5,{r:.01,gs:0});
 /* bahçe */
 sil(dun,.18,1.6,'#7a5233',20,0,10); for(let i=0;i<6;i++) kure(dun,.7,i%2?'#3aa46c':'#4fbf72',20+Math.cos(i)*.45,2.1+(i%3)*.3,10+Math.sin(i)*.45,null,{s:12}); engelle(19.6,9.6,20.4,10.4);
 { const k=new T.Group(); k.position.set(26.5,0,10); dun.add(k); KL.push({ne:'kulube',m:k}); kutu(k,1.4,.9,1.2,'#c9774b',0,0,0,{r:.05}); const c=new T.Mesh(new T.ConeGeometry(1.15,.7,4),M('#7a3b2a')); c.rotation.y=Math.PI/4; c.position.y=1.25; c.castShadow=true; k.add(c);
   const ag=kutu(k,.05,.55,.5,'#3a2418',-.71,0,0,{r:.02}); engelle(25.8,9.4,27.2,10.6);
   const kt=doku(256,64,(g,w,h)=>{ g.fillStyle='#f4ead6'; g.fillRect(0,0,w,h); g.fillStyle='#7a3b2a'; g.font='800 34px system-ui'; g.textAlign='center'; g.fillText('HAYDUT',w/2,44); }); levha(dun,.6,.15,25.77,1.05,10,-Math.PI/2,kt); }
 sil(dun,1.1,.25,'#9aa5b1',23.5,0,14.2,{s:28}); sil(dun,.95,.02,'#5ab4e8',23.5,.24,14.2,{s:28,m:{roughness:.1}}); engelle(22.3,13,24.7,15.4);
 for(let i=0;i<14;i++){ const x=17.6+(i*.77)%10.2, z=16.25-(i%2)*.3; sil(dun,.015,.25,'#3a8a3a',x,0,z); kure(dun,.08,['#ff6b8b','#ffd34d','#fff','#b28cff'][i%4],x,.28,z,null,{s:8}); }
 kutu(dun,1.6,.08,.45,'#8b5a2b',19.4,.42,15.2,{r:.03}); kutu(dun,.08,.42,.4,'#5a3d27',18.7,0,15.2); kutu(dun,.08,.42,.4,'#5a3d27',20.1,0,15.2); engelle(18.5,14.9,20.3,15.5);
 KUL.push({id:'havuz',oda:'bahce',tip:'ic',x:23.5,z:12.7,y:0,yon:-Math.PI/2},{id:'kulube',oda:'bahce',tip:'kulube',x:25.2,z:10,y:0,yon:Math.PI},{id:'agac',oda:'bahce',tip:'kokla',x:20,z:11,y:0,yon:Math.PI/2},
   {id:'cicek',oda:'bahce',tip:'kokla',x:22,z:15.6,y:0,yon:-Math.PI/2},{id:'bank',oda:'bahce',tip:'uzan',x:19.4,z:15.2,y:.5,yon:-Math.PI/2},{id:'kos-0',oda:'bahce',tip:'gez',x:24,z:11,y:0,yon:0},{id:'kos-1',oda:'bahce',tip:'gez',x:21.5,z:13.5,y:0,yon:0});
 /* ---------- köpekler (cins özellikleriyle) ---------- */
 const CINS={loki:{f:'#d8a062',k:'#c48a4c',a:'#e6b97e',kulak:'malti',boy:.86,kuyruk:'kivrik',kravat:1,tuy:1},
   avci:{f:'#f7f3ec',k:'#a8622a',a:'#ffffff',kulak:'katlanik',boy:.8,kuyruk:'dik',leke:1,tasma:'#d94b4b'},
   veri:{f:'#e2a95f',k:'#c08a48',a:'#f3d7a6',kulak:'cocker',boy:.92,kuyruk:'kisa',tasma:'#e0569a'},
   den:{f:'#dcc6a1',k:'#2c241f',a:'#efe0c4',kulak:'kangal',boy:1.35,kuyruk:'kivrik',maske:1,tasma:'#2b2b33',civi:1},
   fikir:{f:'#a9734a',k:'#7b4b2b',a:'#d2a47a',kulak:'cocker',boy:.92,kuyruk:'kisa',tasma:'#27ae60'}};
 const AD={loki:'LOKİ',avci:'TOBEY',veri:'VENUS',den:'HAYDUT',fikir:'BADEM'};
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
     else if(c.kulak==='malti'){ m=new T.Group(); p.add(m); const em=M('#c99359',{roughness:1}); for(const [y,r,zz] of [[-.05,.07,.03],[-.13,.075,.045],[-.2,.065,.05]]){ const q=new T.Mesh(new T.SphereGeometry(r*s,18,14),em); q.position.set(.005*s,y*s,sg*zz*s); q.scale.set(.85,1.15,.7); q.castShadow=true; m.add(q); } }
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
   if(c.tuy){ /* Maltipoo · PELUŞ tarz: az sayıda büyük, iç içe geçen yumuşak şekil (pürüzsüz siluet) */
     const yum=M('#dcaa70',{roughness:1}), acik=M('#ecc794',{roughness:1});
     const P=(par,r,x,y,z,sx,sy,sz,m)=>{ const q=new T.Mesh(new T.SphereGeometry(r*s,22,16),m||yum); q.position.set(x*s,y*s,z*s); q.scale.set(sx||1,sy||1,sz||1); q.castShadow=true; par.add(q); return q; };
     P(gv,.17,0,.37,0,1.55,.95,1.08); P(gv,.15,.17,.38,0,1,1.05,1.05,acik);              /* kabarık gövde + göğüs */
     P(bas,.17,-.01,.01,0,1,.98,1.05); P(bas,.1,-.02,.13,0,1.2,.7,1.1);                   /* kabarık kafa + perçem */
     P(bas,.085,.14,-.05,.055,1,.9,1,acik); P(bas,.085,.14,-.05,-.055,1,.9,1,acik);       /* yanak tüyleri (namlu) */
     P(bas,.07,.15,-.11,0,1,.8,1.1,acik);                                                 /* sakal */
     bacak.forEach(p=>P(p,.065,0,-.12,0,1,1.7,1));                                        /* tüylü bacaklar */
     P(kuy,.09,-.02,.12,0,1,1.1,.9); P(kuy,.075,.05,.2,0,1,1,.9,acik);                   /* tüylü kıvrık kuyruk */ }
   return {g,gv,bacak,bas,kul,kuy,ag,s}; }
 /* ---------- A* ---------- */
 const hucre=(x,z)=>[Math.max(0,Math.min(GX-1,Math.floor(x/HUC))),Math.max(0,Math.min(GZ-1,Math.floor(z/HUC)))];
 function bos(gx,gz){ if(!engel[gz*GX+gx]) return [gx,gz]; for(let r=1;r<8;r++) for(let dx=-r;dx<=r;dx++) for(let dz=-r;dz<=r;dz++){ const x=gx+dx,z=gz+dz; if(x>=0&&z>=0&&x<GX&&z<GZ&&!engel[z*GX+x]) return [x,z]; } return [gx,gz]; }
 const D8=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
 /* yol: engellere yakın hücreler pahalı (köpek kenardan değil ortadan yürür) + görüş hattı ile yumuşatma (köşe kesmez, eşyaya girmez) */
 const yakin_=new Uint8Array(GX*GZ); for(let z=0;z<GZ;z++) for(let x=0;x<GX;x++){ if(engel[z*GX+x]) continue; let n=0; for(let dz=-1;dz<=1;dz++) for(let dx=-1;dx<=1;dx++){ const X=x+dx,Z=z+dz; if(X<0||Z<0||X>=GX||Z>=GZ||engel[Z*GX+X]) n++; } yakin_[z*GX+x]=n?1:0; }
 function serbestNokta(x,z,r){ for(const [ox,oz] of [[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,r*.7],[r*.7,-r*.7],[-r*.7,-r*.7]]){ const [hx,hz]=hucre(x+ox,z+oz); if(engel[hz*GX+hx]) return false; } return true; }
 function gorus(a,b){ const d=Math.hypot(b[0]-a[0],b[1]-a[1]), n=Math.ceil(d/.1); for(let i=1;i<n;i++){ const q=i/n; if(!serbestNokta(a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q,.24)) return false; } return true; }
 function yol(x0,z0,x1,z1){ const [ax,az]=bos(...hucre(x0,z0)), [bx,bz]=bos(...hucre(x1,z1)); const N=GX*GZ, g=new Float32Array(N).fill(1e9), from=new Int32Array(N).fill(-1), kp=new Uint8Array(N), s=az*GX+ax, e=bz*GX+bx; g[s]=0; const ac=[[0,s]];
   while(ac.length){ let bi=0; for(let i=1;i<ac.length;i++) if(ac[i][0]<ac[bi][0]) bi=i; const u=ac.splice(bi,1)[0][1]; if(u===e) break; if(kp[u]) continue; kp[u]=1; const ux=u%GX, uz=(u/GX)|0;
     for(const [dx,dz,c] of D8){ const vx=ux+dx, vz=uz+dz; if(vx<0||vz<0||vx>=GX||vz>=GZ) continue; const v=vz*GX+vx; if(engel[v]||kp[v]) continue; if(dx&&dz&&(engel[uz*GX+vx]||engel[vz*GX+ux])) continue; const ng=g[u]+c+(yakin_[v]&&v!==e?2.5:0); if(ng<g[v]){ g[v]=ng; from[v]=u; ac.push([ng+Math.hypot(bx-vx,bz-vz),v]); } } }
   const H=[[x0,z0]]; if(from[e]>=0||e===s){ const P=[]; for(let u=e;u!==s&&u>=0;u=from[u]) P.push([(u%GX+.5)*HUC,(((u/GX)|0)+.5)*HUC]); P.reverse(); H.push(...P); } H.push([x1,z1]);
   /* görüş hattı yumuşatma */ const S=[H[0]]; let i=0; while(i<H.length-1){ let j=H.length-1; while(j>i+1&&!gorus(H[i],H[j])) j--; S.push(H[j]); i=j; } return S.slice(1); }
 /* ---------- ajanlar: KALICI YAŞAM + İHTİYAÇLAR ----------
    Dünya sayfadan bağımsızdır: beş köpeğin günü (TR saati) aynı tohumdan, BİRLİKTE (aynı eşyayı aynı anda iki köpek kullanmaz) üretilir.
    Her köpeğin bedeni ve ruhu var: ENERJİ · TOKLUK · SU · KEYİF. İhtiyaçlar zamanla azalır; köpek en çok neye ihtiyacı varsa o eşyaya gider (fayda tabanlı karar, The Sims mantığı).
    İyi hisseden köpek daha verimli çalışır (performans). Sayfayı ne zaman/hangi cihazda açarsan aç aynı an görünür. */
 const K=['loki','avci','veri','den','fikir'], A={};
 const katman=document.createElement('div'); katman.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden'; kap.appendChild(katman);
 const HIZ={loki:1.15,avci:1.45,veri:1.2,den:1.0,fikir:1.2}, YAR={loki:.3,avci:.26,veri:.28,den:.38,fikir:.28};
 K.forEach((k,i)=>{ const m=kopek(k); sc.add(m.g); const et=document.createElement('div'); et.className='o3-et'; et.innerHTML=`<i></i><b>${AD[k]}</b><s class="o3-ih">${['⚡','🍖','💧','💛','🗣'].map(e=>`<span>${e}</span><u><em></em></u>`).join('')}</s>`; katman.appendChild(et);
   A[k]={k,i,m,et,poz:'ayakta',faz:i*1.7+.4,yon:0,bal:'',balT:0,oda:'ofis',seg:0,ofs:[0,0]}; });
 const saat=()=>{ const d=new Date(Date.now()+3*3600e3); return d.getUTCHours()+d.getUTCMinutes()/60; };
 let VERI=null;
 const ISY={avci:'Hata kayıtlarını tarıyorum',veri:'Servisleri ölçüyorum',den:'Sayfaları denetliyorum',fikir:'Demo karnesine bakıyorum',loki:'Ekibi izliyor, rapor yazıyorum'};
 const SOZ={ye:['Karnım acıktı, mama vakti!','Mmm, nefis.'],ic:['Susadım.','Ohh, serinledim.'],kahve:['Kahvesiz patron olmaz ☕'],oyna:['Biraz oyun, kafam dağılsın!','Topu at!'],uzan:['Yoruldum, kısa bir mola.','Beş dakika…'],kokla:['Burada ne var?','Hmm…'],gez:['Hava almaya çıkıyorum.'],dinle:['Dinliyorum patron.'],sun:['Toparlanın, brifing başlıyor!'],izle:['Biraz TV, keyfim yerine gelsin.'],sohbet:['Naber, nasıl gidiyor?','Bugün piyasa nasıl?','Bir mola verelim mi?','Raporu bitirdin mi?'],oku:['Biraz okuma…'],ac:['Dolapta atıştırmalık var mı?'],bak:['Hava güzel.'],tunel:['Tünelden geçiyorum!'],uyu:['İyi geceler.'],kulube:['Kulübemde dinleniyorum.']};
 function rng(str){ let h=1779033703^str.length; for(let i=0;i<str.length;i++){ h=Math.imul(h^str.charCodeAt(i),3432918353); h=h<<13|h>>>19; } return ()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); h^=h>>>16; return (h>>>0)/4294967296; }; }
 const YC=new Map(); function yolU(x0,z0,x1,z1){ const k=[x0,z0,x1,z1].map(v=>v.toFixed(2)).join(','); let P=YC.get(k); if(!P){ P=[[x0,z0]].concat(yol(x0,z0,x1,z1)); YC.set(k,P); if(YC.size>4000) YC.clear(); }
   const L=[0]; for(let i=1;i<P.length;i++) L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1])); return {P,L,u:L[L.length-1]}; }
 const KD=id=>KUL.find(u=>u.id===id);
 const durak=u=>{ const il=u.ileri||0; return [u.x+Math.cos(u.yon)*il,u.z-Math.sin(u.yon)*il]; };
 const POZ={sohbet:'ayakta',yaz:'otur',dinle:'otur',ye:'egil',ic:'egil',kahve:'ayakta',oyna:'oyna',uzan:'yat',uyu:'uyu',kokla:'egil',gez:'yuru',sun:'ayakta',izle:'yat',oku:'ayakta',ac:'ayakta',bak:'ayakta',tunel:'yuru',kulube:'yat'};
 /* ihtiyaç etkileri (dakika başına): e=enerji t=tokluk s=su k=keyif */
 const ETKI={sohbet:{e:-.02,t:-.08,s:-.12,k:1.5,o:9},yuru:{e:-.12,t:-.09,s:-.13,k:0},yaz:{e:-.16,t:-.09,s:-.14,k:-.1},dinle:{e:-.08,t:-.08,s:-.1,k:.3},sun:{e:-.12,t:-.08,s:-.12,k:.3},ye:{e:0,t:28,s:-.1,k:2},ic:{e:0,t:-.05,s:45,k:1},kahve:{e:6,t:0,s:6,k:2},
   oyna:{e:-.4,t:-.15,s:-.3,k:4},izle:{e:1.2,t:-.08,s:-.1,k:2.5},uzan:{e:3.2,t:-.06,s:-.08,k:.6},kulube:{e:3.2,t:-.06,s:-.08,k:.8},uyu:{e:.32,t:-.03,s:-.04,k:.02},kokla:{e:-.05,t:-.08,s:-.1,k:3},gez:{e:-.2,t:-.1,s:-.2,k:3.5},
   oku:{e:.4,t:-.08,s:-.1,k:2},ac:{e:0,t:14,s:3,k:1.5},bak:{e:.5,t:-.08,s:-.1,k:2},tunel:{e:-.3,t:-.1,s:-.15,k:6}};
 const sinir=n=>{ for(const q in n) n[q]=Math.max(0,Math.min(100,n[q])); return n; };
 const SOS={dinle:.7,sun:.7,oyna:.3,yaz:-.12,uyu:-.02};
 const uygula=(n,tip,sn)=>{ const E=ETKI[tip]||ETKI.yuru, m=sn/60; return sinir({e:n.e+E.e*m,t:n.t+E.t*m,s:n.s+E.s*m,k:n.k+E.k*m,o:n.o+(E.o!=null?E.o:(SOS[tip]!=null?SOS[tip]:-.07))*m}); };
 const perf=n=>Math.round(Math.max(0,Math.min(100,.25*n.e+.15*n.t+.15*n.s+.25*n.k+.2*n.o)));
 /* sabit takvim */
 /* BAĞLAM: gerçek dünyadan gelenler (ofis bulguları · demo · kapı · İstanbul havası · ortak olaylar) — hepsi aynı veriden, her cihazda aynı */
 let C_={bulgu:{},onemli:{},demo:[],kapiDeg:null,hava:null,olay:[]}, C_SIG='';
 function baglam(){ const v=VERI||{}, O=v.ofis||{}, B=(O.loki&&O.loki.B)||[], c={bulgu:{},onemli:{},demo:(O.demo||[]).slice(-20),kapiDeg:null,hava:O.hava||null,olay:(OLAY||[]).slice(-30)};
   for(const b of B){ if(b.o>=2){ if(!c.bulgu[b.a]) c.bulgu[b.a]=b.b; c.onemli[b.a]=1; c.onemli.loki=1; } }
   const KT=v.kapi_tarih||[]; if(KT.length>=2&&KT[KT.length-1].a!==KT[KT.length-2].a) c.kapiDeg=KT[KT.length-1].a?'ac':'kapa';
   c.yagis=!!(c.hava&&(c.hava.tur==='yagmur'||c.hava.tur==='kar'));
   c.kasa=O.kasa||0; c.xp=O.xp||{}; c.hafta_en=O.hafta_en||null; c.gunlukler=O.gunlukler||{}; c.kapiAcik=!!(v.piyasa&&v.piyasa.kapi&&v.piyasa.kapi.acik); c.vts=v.uretildi||v.ts||0; c.alarm=B.filter(b=>b.o===3).map(b=>b.b); c.fg=v.piyasa&&v.piyasa.fg&&v.piyasa.fg.deger;
   const sig=JSON.stringify([Object.keys(c.bulgu).sort(),c.demo.map(x=>x.ts),c.kapiDeg,c.yagis,c.olay.map(x=>x.ts)]);
   if(sig!==C_SIG){ C_SIG=sig; GUN=null; } C_=c; dunyaGuncelle(); }
 let OLAY=[];
 function sabitler(g0){ const S=[]; const s=h=>g0+h*3600, dow=new Date((g0+3*3600)*1000).getUTCDay(), hs=dow===0||dow===6;
   S.push([s(0),s(7),'uyku']);
   if(C_.kapiDeg&&g0+86400>Date.now()/1000) S.push([s(9),s(9.75),'acil']); else if(!hs) S.push([s(9),s(9.5),'brif']);
   for(let h=7;h<23.5;h+=hs?2:.5){ if(h>=9&&h<9.75) continue; S.push([s(h),s(h)+480,'tur']); }
   S.push([s(23.5),s(24),'uyku']);
   for(const o of C_.olay){ const t=o.ts/1000; if(t<s(7)||t>s(23.3)||t<g0||t>=g0+86400) continue; S.push([t+5,t+(o.tip==='top'?240:150),o.tip==='top'?'top':o.tip==='odul'?'odul':'mama']); }
   for(const x of C_.demo){ if(x.ts<s(7)||x.ts>s(23.3)||x.ts<g0) continue; S.push([x.ts,x.ts+150,'demo',null,x]); }
   S.sort((a,b)=>a[0]-b[0]); return {S,hs}; }
 function birlestir(S){ const T=[]; for(const x of S){ const p=T[T.length-1]; if(p&&x[0]<p[1]&&p[2]!=='uyku'){ if(['brif','acil'].includes(p[2])&&x[2]!=='uyku'){ if(x[1]>p[1]&&x[2]==='tur') T.push([p[1],x[1],x[2]]); continue; } if(['mama','top','odul','demo','acil'].includes(x[2])){ p[1]=x[0]; T.push(x); } else if(x[1]>p[1]) T.push([p[1],x[1],x[2]]); } else T.push(x); } return T.filter(x=>x[1]>x[0]+1); }
 const GRUP={ic:['sebil','su-0','su-1','havuz'],uzan:['kanepe-0','kanepe-1','bank'],kokla:['agac','cicek','bitki-of'],izle:['izle-0','izle-1','izle-2'],oyna:['oyna-0','oyna-1','oyna-2','oyna-3'],bak:['pencere-0','pencere-1'],gez:['kos-0','kos-1']};
 /* fayda: ihtiyaç ne kadar düşükse ilgili eylem o kadar cazip; iyi hisseden köpek işini sever */
 function fayda(a,n,tip){ const k=a.k, d=q=>Math.pow(1-n[q]/100,2)*100;
   switch(tip){ case 'yaz': return 35+(k==='loki'?15:0)+(n.e>40&&n.k>40?20:0)-(n.e<25||n.t<20||n.s<20?40:0)+(C_.bulgu[k]?120:k==='loki'&&C_.onemli.loki?60:0)-(a.hs?20:0);
     case 'ye': return d('t')*1.3; case 'ac': return d('t')*.7+5; case 'ic': return d('s')*1.3; case 'kahve': return k==='loki'?d('e')*.9+12:0;
     case 'uzan': return d('e')*1.1; case 'kulube': return k==='den'?d('e')*1.2+8:0; case 'izle': return d('k')*.8+d('e')*.4;
     case 'oyna': return d('k')*(k==='avci'?1.3:.9)-(n.e<30?30:0); case 'gez': return d('k')*(k==='den'?1.2:.7)-(n.e<30?25:0); case 'kokla': return d('k')*.6+4;
     case 'tunel': return k==='avci'?d('k')*.7+6:d('k')*.2; case 'oku': return k==='loki'?d('k')*.8+10:0; case 'bak': return d('k')*.35+3; }
   return 0; }
 const SURE={yaz:[900,2100],ye:[100,180],ic:[45,90],kahve:[150,300],oyna:[300,660],izle:[480,1200],uzan:[600,1500],kulube:[900,1800],kokla:[60,150],gez:[240,480],oku:[600,1200],ac:[30,60],bak:[90,240]};
 let GUN=null;
 const DOST={}; K.forEach((a,i)=>K.forEach((b,j)=>{ if(i<j){ const r=rng(a+'♥'+b)(); DOST[a+b]=DOST[b+a]=Math.round(35+r*40); } }));
 function gunHepsi(gn){ const g0=gn*86400-3*3600, SB=sabitler(g0), R={}, rez={}, out={}, dost=Object.assign({},DOST);
   const bosmu=(id,t0,t1)=>!(rez[id]||[]).some(([a,b])=>t0<b&&t1>a), ayir=(id,t0,t1)=>(rez[id]=rez[id]||[]).push([t0,t1]);
   const D={}; K.forEach((k,i)=>{ const r=rng(k+'|'+gn); R[k]=r; D[k]={k,i,hs:SB.hs,S:birlestir(SB.S.filter(x=>x[2]!=='demo'||k==='loki').map(x=>x.slice())),di:0,c:g0,yer:durak(KD('yatak-'+i)),ust:KD('yatak-'+i),n:sinir({e:88+r()*10,t:40+r()*15,s:45+r()*15,k:62+r()*15,o:50+r()*20}),seg:[],si:0}; out[k]=D[k].seg; });
   const ekle=(d,s)=>{ s.n0=Object.assign({},d.n); s.n1=uygula(d.n,s.tip==='tunel'?'tunel':s.tip==='yuru'?'yuru':s.tip,s.t1-s.t0); d.n=s.n1; d.seg.push(s); d.c=s.t1; };
   const git=(d,u)=>{ const p=durak(u); if(Math.hypot(p[0]-d.yer[0],p[1]-d.yer[1])>.05){ const Y=yolU(d.yer[0],d.yer[1],p[0],p[1]); ekle(d,{t0:d.c,t1:d.c+Y.u/HIZ[d.k],tip:'yuru',Y,u}); } d.yer=p; d.ust=u; };
   const kal=(d,u,t1,tip)=>{ if(t1>d.c+1){ ayir(u.id,d.c,t1); ekle(d,{t0:d.c,t1,tip:tip||u.tip,u}); } };
   const fixU=(d,n)=>n==='uyku'?KD('yatak-'+d.i):(n==='brif'||n==='acil')?(d.k==='loki'?KD('top-sun'):KD('top-'+(d.i-1))):n==='mama'||n==='odul'?KD('mama-'+d.i):n==='top'?KD('oyna-'+(d.i%4)):KD('masa-'+d.k);
   const fixT=(d,n)=>n==='uyku'?'uyu':(n==='brif'||n==='acil')?(d.k==='loki'?'sun':'dinle'):n==='mama'||n==='odul'?'ye':n==='top'?'oyna':'yaz';
   let guv=0; while(guv++<6000){ let d=null; for(const k of K) if(D[k].c<g0+86400-1&&(!d||D[k].c<d.c)) d=D[k]; if(!d) break; const r=R[d.k];
     const S=d.S; while(d.si<S.length&&S[d.si][1]<=d.c) d.si++; const F=S[d.si];
     while(d.di<C_.demo.length&&C_.demo[d.di].ts<=d.c){ const x=C_.demo[d.di++]; if(x.o==='kapat'&&x.kz!=null) d.n.k=Math.max(0,Math.min(100,d.n.k+(x.kz>0?14:-8))); }
     if(F&&F[0]<=d.c+1){ const u=fixU(d,F[2]); git(d,u); const sg_=d.seg.length; kal(d,u,Math.max(d.c+5,F[1]),fixT(d,F[2])); if(d.seg.length>sg_){ const z=d.seg[d.seg.length-1]; z.ozel=F[2]; if(F[4]) z.demo=F[4]; } d.si++; continue; }
     const bos_=(F?F[0]:g0+86400)-d.c;
     /* sosyal: başka bir köpek dinleniyor/yiyor/içiyorsa yanına gidip sohbet eder (diğer köpek kendini 'reklam' eder) */
     const so=Math.pow(1-d.n.o/100,2)*130+r()*10+(d.hs?10:0);
     if(so>45){ let en=null; for(const k2 of K){ if(k2===d.k) continue; const S2=D[k2].seg; for(let q=S2.length-1;q>=0;q--){ const x=S2[q]; if(x.t0<=d.c+20&&x.t1>d.c+90&&['ye','ic','kahve','uzan','izle','kokla','bak','kulube'].includes(x.tip)&&x.u&&!x.ortak){ const p2=durak(x.u);
         for(const [ox,oz] of [[.75,0],[-.75,0],[0,.75],[0,-.75],[.55,.55],[-.55,.55],[.55,-.55],[-.55,-.55]]){ const px=p2[0]+ox, pz=p2[1]+oz; if(serbestNokta(px,pz,.25)){ const tah=Math.hypot(px-d.yer[0],pz-d.yer[1])*1.5/HIZ[d.k]; const sk=tah-dost[d.k+k2]*.8; if(d.c+tah<x.t1-60&&(!en||sk<en.sk)) en={k2,x,px,pz,tah,sk,yon:Math.atan2(-(p2[1]-pz),p2[0]-px)}; break; } } break; } if(x.t0<d.c) break; } }
       if(en&&en.tah<90&&(!F||d.c+en.tah+60<F[0])){ const u={id:'sohbet-'+d.k+'-'+Math.floor(d.c),tip:'sohbet',x:en.px,z:en.pz,y:0,yon:en.yon,ortak:en.k2}; git(d,u); const t1=Math.min(en.x.t1-5,F?F[0]:en.x.t1,d.c+120+r()*240); if(t1>d.c+20){ ekle(d,{t0:d.c,t1,tip:'sohbet',u,ile:en.k2}); en.x.ortak=d.k; dost[d.k+en.k2]=dost[en.k2+d.k]=Math.min(100,dost[d.k+en.k2]+4); continue; } } }
     const ad=Object.keys(SURE).map(tip=>[tip,fayda(d,d.n,tip)+r()*12]).sort((x,y)=>y[1]-x[1]).slice(0,4).map(x=>[x[0],x[1]*(.75+r()*.5)]).sort((x,y)=>y[1]-x[1]);
     let sec=null; for(const [tip] of ad){ let L=GRUP[tip]?GRUP[tip].map(KD):[{yaz:KD('masa-'+d.k),ye:KD('mama-'+d.i),kahve:KD('kahve'),kulube:KD('kulube'),oku:KD('oku'),ac:KD('buzdolabi'),tunel:KD('tunel')}[tip]];
       L=L.filter(u=>u&&!(C_.yagis&&u.oda==='bahce'&&u.tip!=='kulube')); for(let j=0;j<L.length;j++){ const u=L[(j+Math.floor(r()*L.length))%L.length]; const p=durak(u), tah=Math.hypot(p[0]-d.yer[0],p[1]-d.yer[1])*1.5/HIZ[d.k];
         const [m0,m1]=SURE[tip]||[0,0]; let sur=m0+r()*(m1-m0); const t0=d.c+tah; if(bosmu(u.id,t0-5,t0+sur+5)){ sec={u,tip,sur,tah}; break; } } if(sec) break; }
     if(!sec||bos_<sec.tah+40){ const fu=F?fixU(d,F[2]):d.ust; git(d,fu); if(F&&d.c<F[0]) kal(d,fu,F[0],fu.tip==='uyu'?'uyu':'yaz'); else if(!F) kal(d,fu,g0+86400,'uyu'); continue; }
     if(sec.tip==='tunel'){ const g=KD('tunel'); git(d,g); const Y=yolU(g.x,g.z,g.x2,g.z2); ekle(d,{t0:d.c,t1:d.c+Y.u/(HIZ[d.k]*.6),tip:'tunel',Y}); d.yer=[g.x2,g.z2]; continue; }
     git(d,sec.u); kal(d,sec.u,Math.min(d.c+sec.sur,F?F[0]:d.c+sec.sur),sec.tip); }
   return {gn,out,dost,sig:C_SIG}; }
 function anlik(a,t){ const gn=Math.floor((t+3*3600)/86400); if(!GUN||GUN.gn!==gn||GUN.sig!==C_SIG){ GUN=gunHepsi(gn); K.forEach(k=>A[k].seg=0); }
   const S=GUN.out[a.k]; let i=a.seg; if(!S[i]||S[i].t0>t) i=0; while(i<S.length-1&&S[i].t1<=t) i++; a.seg=i; return S[i]; }
 const NEDEN={ye:'acıktı, mamasını yedi',ic:'susadı, su içti',kahve:'kahve yaptı',uzan:'yoruldu, dinlenmeye çekildi',kulube:'kulübesinde dinlendi',izle:'TV izledi',oyna:'top oynadı',kokla:'etrafı kokladı',gez:'bahçede gezdi',oku:'kitap okudu',ac:'buzdolabını açtı',bak:'pencereden dışarı baktı',tunel:'tünelden geçti',yaz:'masasında çalıştı',dinle:'brifingi dinledi',sun:'brifing verdi',uyu:'uyudu'};
 function gunluk(t,n){ const gn=Math.floor((t+3*3600)/86400); if(!GUN||GUN.gn!==gn||GUN.sig!==C_SIG) GUN=gunHepsi(gn); const L=[]; for(const k of K) for(const s of GUN.out[k]){ if(s.t0>t||s.tip==='yuru') continue; let m=NEDEN[s.tip]; if(s.ozel==='mama') m='ikram edilen mamayı yedi'; if(s.ozel==='odul') m='ödül maması aldı'; if(s.ozel==='top') m='atılan topun peşinden koştu'; if(s.ozel==='acil') m=s.tip==='sun'?'ACİL kapı toplantısı yaptı':'acil kapı toplantısına katıldı'; if(s.ozel==='demo'&&s.demo) m='demo işlemi duyurdu: '+(s.demo.c||'')+(s.demo.o==='ac'?' açıldı':' kapandı'+(s.demo.kz!=null?' ('+(s.demo.kz>0?'+':'')+s.demo.kz+' $)':'')); if(s.tip==='sohbet') m=(AD[s.ile]||'')+' ile sohbet etti'; if(!m) continue; L.push({t:s.t0,k,m,p:perf(s.n0)}); }
   L.sort((a,b)=>b.t-a.t); const T=[]; for(const x of L){ const p=T[T.length-1]; if(p&&p.k===x.k&&p.m===x.m) continue; T.push(x); if(T.length>=n) break; } return T; }
 function ihtiyac(a,t){ const s=anlik(a,t); if(!s||!s.n0) return null; const q=Math.max(0,Math.min(1,(t-s.t0)/((s.t1-s.t0)||1))), n={}; for(const k in s.n0) n[k]=s.n0[k]+(s.n1[k]-s.n0[k])*q; n.p=perf(n); return n; }
 function yolNokta(Y,f){ const d=Y.u*Math.max(0,Math.min(1,f)); let i=1; while(i<Y.L.length-1&&Y.L[i]<d) i++; const a=Y.P[i-1], b=Y.P[i]||a, l=(Y.L[i]-Y.L[i-1])||1, q=(d-Y.L[i-1])/l; return [a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q,Math.atan2(-(b[1]-a[1]),b[0]-a[0])]; }
 const topYer=t=>[4.5+1.7*Math.sin(t*.55)+.4*Math.sin(t*1.7),12.5+1.3*Math.sin(t*.83+1)];
 function guncelleAjan(a,t){ const s=anlik(a,t), g=a.hedef||(a.hedef=new V3()); if(!s) return;
   if(s!==a.sonSeg){ a.sonSeg=s; if(s.tip!=='yuru'&&t-s.t0<8){ let L=s.tip==='yaz'?[C_.bulgu[a.k]?'Önemli bulgu: '+C_.bulgu[a.k].slice(0,40):ISY[a.k]+'…']:SOZ[s.tip];
       if(s.tip==='sohbet') L=sohbetSoz(); if(s.ozel==='mama') L=['Mama geldi! Teşekkürler!']; if(s.ozel==='odul') L=['Ödül! Hav hav!']; if(s.ozel==='top') L=['Top atıldı! Benim!'];
       if(s.ozel==='acil') L=[a.k==='loki'?(C_.kapiDeg==='ac'?'KAPI AÇILDI! Herkes toplantıya!':'Kapı kapandı, toplanın!'):'Geliyorum patron!'];
       if(s.ozel==='demo'&&s.demo) L=[s.demo.o==='ac'?'Yeni demo işlem: '+(s.demo.c||'')+(s.demo.y==='S'?' short':' long'):(s.demo.c||'')+' kapandı'+(s.demo.kz!=null?' · '+(s.demo.kz>0?'+':'')+s.demo.kz+' $':'')];
       if(L){ a.bal=L[Math.floor(s.t0%97)%L.length]; a.balT=performance.now()+5500; SES&&SES.olay(s.tip,s.ozel); } } }
   a.n=ihtiyac(a,t)||a.n;
   a.is=s.tip; a.kul=s.u||null; a.tunel=false;
   if(s.tip==='yuru'||s.tip==='tunel'){ const [x,z,y]=yolNokta(s.Y,(t-s.t0)/(s.t1-s.t0)); g.set(x,0,z); a.yon=y; a.poz='yuru'; a.tunel=s.tip==='tunel'; a.yurur=true; return; }
   a.yurur=false; const u=s.u, d=durak(u);
   if(s.tip==='oyna'){ const f=Math.max(0,Math.min(1,(t-s.t0)/2,(s.t1-t)/2)); const [bx,bz]=topYer(t-.6-a.i*.5); const ox=d[0]+(bx-d[0])*f, oz=d[1]+(bz-d[1])*f; const [px,pz]=topYer(t-.75-a.i*.5); g.set(ox,0,oz); if(f>.05) a.yon=Math.atan2(-(bz-pz),bx-px); a.poz=f<.05?'ayakta':'oyna'; a.yurur=f>.05; return; }
   if(s.tip==='gez'){ if(!s.gY){ const r=rng(a.k+'g'+Math.floor(s.t0)), W_=[d]; for(let j=0;j<4;j++) for(let q=0;q<40;q++){ const x=18+r()*9, z=9+r()*7; if(serbestNokta(x,z,.35)){ W_.push([x,z]); break; } } W_.push(d);
       const P=[]; for(let j=1;j<W_.length;j++){ const Y=yolU(W_[j-1][0],W_[j-1][1],W_[j][0],W_[j][1]); P.push(...(j>1?Y.P.slice(1):Y.P)); } const L=[0]; for(let j=1;j<P.length;j++) L.push(L[j-1]+Math.hypot(P[j][0]-P[j-1][0],P[j][1]-P[j-1][1])); s.gY={P,L,u:L[L.length-1]}; }
     const f=(t-s.t0)/((s.t1-s.t0)||1); const [x,z,y]=yolNokta(s.gY,f); g.set(x,0,z); a.yon=y; a.poz='yuru'; a.yurur=true; return; }
   g.set(d[0],u.y||0,d[1]); a.yon=u.yon; a.poz=POZ[s.tip]||'ayakta'; if(s.tip==='sohbet'){ a.poz='ayakta'; a.ile=s.ile; } else a.ile=null; }
 /* çarpışma: yürüyen köpekler birbirinin içinden geçmez (deterministik itme, duvara/eşyaya itmez) */
 function ayir(dt){ const P=K.map(k=>A[k]); for(let i=0;i<P.length;i++) for(let j=i+1;j<P.length;j++){ const a=P[i], b=P[j]; if(a.tunel||b.tunel) continue; const ha=a.hedef, hb=b.hedef; if(Math.abs((ha.y||0)-(hb.y||0))>.3) continue;
     const dx=hb.x-ha.x, dz=hb.z-ha.z, d=Math.hypot(dx,dz), min=YAR[a.k]+YAR[b.k]+.06; if(d>=min||(!a.yurur&&!b.yurur)) continue;
     let nx=d>1e-4?dx/d:Math.cos(i+j), nz=d>1e-4?dz/d:Math.sin(i+j); const pay=(min-d);
     const wa=a.yurur?(b.yurur?.5:1):0, wb=1-wa;
     const ita=[ha.x-nx*pay*wa,ha.z-nz*pay*wa], itb=[hb.x+nx*pay*wb,hb.z+nz*pay*wb];
     if(wa&&serbestNokta(ita[0],ita[1],.2)){ ha.x=ita[0]; ha.z=ita[1]; } if(wb&&serbestNokta(itb[0],itb[1],.2)){ hb.x=itb[0]; hb.z=itb[1]; } } }
 const kullan=id=>K.some(k=>{ const a=A[k]; return a.kul&&a.kul.id===id&&a.is!=='yuru'; });
 const L_=(a,b,t)=>a+(b-a)*t;
 function pozla(a,dt,t){ const m=a.m, s=m.s, f=a.faz, b=m.bacak, P=a.poz, k_=1-Math.exp(-dt*9), N=a.n||{e:70,k:70}, ke=N.k/100, en=N.e/100; let gy=0, eg=0, bz=0, bx=0, ks=Math.sin(t*(3+7*ke)+f)*(.15+.55*ke), kl=0;
   if(P==='yuru'||P==='oyna'){ const w=Math.sin(t*(P==='oyna'?15:8+4*en)+f); b[0].rotation.z=b[3].rotation.z=w*.6; b[1].rotation.z=b[2].rotation.z=-w*.6; gy=Math.abs(w)*.02*s; ks=Math.sin(t*13+f)*.7; kl=w*.15; if(a.tunel) gy-=.08*s; }
   else for(const x of b) x.rotation.z=L_(x.rotation.z,0,k_);
   if(P==='otur'){ eg=.5; b[2].rotation.z=b[3].rotation.z=1.15; b[0].rotation.z=b[1].rotation.z=-.45; gy=-.06*s; bz=-.3; bx=a.is==='yaz'?Math.sin(t*.8+f)*.15:a.is==='dinle'?Math.sin(t*.4+f)*.08:0; }
   if(P==='egil'){ eg=-.12; bz=.85; ks=Math.sin(t*9+f)*.8; }
   if(P==='yat'||P==='uyu'){ gy=-.2*s; for(let i=0;i<4;i++) b[i].rotation.z=i<2?-1.35:1.35; bz=P==='uyu'?.45:a.is==='izle'?-.15:.05; ks=P==='uyu'?0:Math.sin(t*3+f)*.3; }
   if(P==='ayakta'&&(a.is==='oku'||a.is==='ac'||a.is==='bak'||a.is==='kahve')){ bz=-.25; }
   if(P==='ayakta'&&a.is==='sun'){ bx=Math.sin(t*1.2)*.25; ks=Math.sin(t*5)*.6; }
   if((P==='ayakta'||P==='otur'||P==='yuru')&&en<.28) bz+=.22; if(ke<.3) kl-=.35;   /* yorgunsa başı düşer, keyifsizse kulaklar iner */
   m.gv.scale.y=P==='uyu'?1+Math.sin(t*1.6+f)*.035:1;
   m.ag.visible=P==='yuru'||P==='oyna'||a.is==='sun'||(P==='ayakta'&&Math.sin(t*.5+f)>.6);
   m.gv.position.y=L_(m.gv.position.y,gy,k_); m.gv.rotation.z=L_(m.gv.rotation.z,eg,k_);
   m.bas.rotation.z=L_(m.bas.rotation.z,-bz,k_); m.bas.rotation.x=L_(m.bas.rotation.x,bx,k_); m.kuy.rotation.x=ks; for(const q of m.kul) q.rotation.x=kl;
   let dy=a.yon-m.g.rotation.y; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2; m.g.rotation.y+=dy*Math.min(1,dt*10); }
 { const t0=Date.now()/1000; K.forEach(k=>{ const a=A[k]; guncelleAjan(a,t0); a.m.g.position.copy(a.hedef); a.konum=1; a.m.g.rotation.y=a.yon; }); }
 /* ---------- kamera ---------- */
 let takip=null;
 function odaSec(id){ takip=null; const o=ODA[id]; if(o){ camHedef.c.set((o.x0+o.x1)/2,0,(o.z0+o.z1)/2+.3); camHedef.z=Math.max(o.x1-o.x0,o.z1-o.z0)*.9; } else { camHedef.c.set(14,0,8.5); camHedef.z=24; } }
 odaSec(opt.oda||'ofis'); camAn.c.copy(camHedef.c); camAn.z=camHedef.z;
 function camGuncelle(r){ const asp=r.width/(r.height||1); let w=camAn.z, h=w/asp; if(h<camAn.z*.62){ h=camAn.z*.62; w=h*asp; } cam.left=-w/2; cam.right=w/2; cam.top=h/2; cam.bottom=-h/2; cam.updateProjectionMatrix();
   const c=camAn.c, u=30; cam.position.set(c.x+Math.sin(aci)*u,u*.9,c.z+Math.cos(aci)*u); cam.lookAt(c.x,0,c.z); }
 const el=ren.domElement, P=new Map(); let sur=null, pinch=null;
 function kaydir(dx,dy){ const r=el.getBoundingClientRect(), pw=(cam.right-cam.left)/r.width; takip=null; const sa=Math.sin(aci), ca=Math.cos(aci);
   const sx=-dx*pw, sy=dy*pw*1.4; camHedef.c.x+=ca*sx+(-sa)*sy; camHedef.c.z+=(-sa)*sx+(-ca)*sy; camHedef.c.x=Math.max(-2,Math.min(30,camHedef.c.x)); camHedef.c.z=Math.max(-2,Math.min(19,camHedef.c.z)); camAn.c.copy(camHedef.c); }
 function yakin(f){ takip=null; camHedef.z=Math.max(3,Math.min(30,camHedef.z*f)); camAn.z=camHedef.z; }
 el.addEventListener('pointerdown',e=>{ el.setPointerCapture(e.pointerId); P.set(e.pointerId,{x:e.clientX,y:e.clientY}); if(P.size===1) sur={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,b:e.button,sh:e.shiftKey,top:0};
   if(P.size===2){ const [a,b]=[...P.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y),an:Math.atan2(b.y-a.y,b.x-a.x),z:camHedef.z,aci}; if(sur) sur.top=99; } });
 el.addEventListener('pointermove',e=>{ if(!P.has(e.pointerId)) return; P.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(P.size===2&&pinch){ const [a,b]=[...P.values()]; const d=Math.hypot(a.x-b.x,a.y-b.y), an=Math.atan2(b.y-a.y,b.x-a.x); camHedef.z=Math.max(3,Math.min(30,pinch.z*pinch.d/d)); camAn.z=camHedef.z; aci=pinch.aci-(an-pinch.an); takip=null; return; }
   if(!sur) return; const dx=e.clientX-sur.lx, dy=e.clientY-sur.ly; sur.lx=e.clientX; sur.ly=e.clientY; sur.top+=Math.abs(dx)+Math.abs(dy);
   if(sur.b===2||sur.sh) aci-=dx*.008; else kaydir(dx,dy); });
 const birak=e=>{ const vardi=P.has(e.pointerId); P.delete(e.pointerId); if(P.size<2) pinch=null; if(!vardi||!sur) return; if(P.size===0){ const kis=sur.top<8; sur=null; if(kis&&e.type==='pointerup') tikla(e); } };
 el.addEventListener('pointerup',birak); el.addEventListener('pointercancel',birak); el.addEventListener('contextmenu',e=>e.preventDefault());
 el.addEventListener('wheel',e=>{ e.preventDefault(); if(e.ctrlKey) yakin(Math.exp(e.deltaY*.01)); else if(e.shiftKey) aci-=e.deltaY*.003; else yakin(Math.exp(e.deltaY*.0015)); },{passive:false});
 const ray=new T.Raycaster();
 function tikla(e){ const r=el.getBoundingClientRect(), p=new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); ray.setFromCamera(p,cam);
   let en=null, ed=1e9; K.forEach(k=>{ const h=ray.intersectObject(A[k].m.g,true); if(h.length&&h[0].distance<ed){ ed=h[0].distance; en=k; } });
   if(!en){ ed=46; K.forEach(k=>{ const v=A[k].m.g.position.clone(); v.y=.4; v.project(cam); const d=Math.hypot((v.x-p.x)*r.width,(v.y-p.y)*r.height)/2; if(d<ed){ ed=d; en=k; } }); }
   if(!en&&panoMesh&&ray.intersectObject(panoMesh).length){ if(opt.pano) opt.pano(panoVeri); return; }
   if(!en&&opt.bilgi){ const L=KL.concat(Object.keys(ekranlar).map(k=>({ne:'ekran',k,m:ekranlar[k].m}))).filter(x=>x.m); let hit=null, hd=1e9; for(const x of L){ const h=ray.intersectObject(x.m,true); if(h.length&&h[0].distance<hd){ hd=h[0].distance; hit=x; } } if(hit){ opt.bilgi(bilgiMetin(hit)); return; } }
   if(opt.secildi) opt.secildi(en); }
 /* ---------- döngü ---------- */
 /* ---------- SİSTEMİN BEDENİ + BÜYÜYEN OFİS + ZİYARETÇİLER ---------- */
 const svl=x=>1+Math.floor(Math.sqrt((x||0)/40));
 function sohbetSoz(){ const L=[], v=VERI||{}, d=(C_.demo||[]).filter(x=>x.o==='kapat').slice(-1)[0];
   if(d) L.push(`${d.c} işlemi ${d.kz>0?'+':''}${d.kz} $ ile kapandı, duydun mu?`);
   L.push(C_.kapiAcik?'Kapı açık, piyasa nefes alıyor.':'Kapı hâlâ kapalı, sabırlı olacağız.');
   if(C_.fg!=null) L.push(`Piyasa duygusu ${Math.round(C_.fg)}, ${C_.fg<30?'herkes korkuyor':C_.fg>70?'herkes çok iyimser':'ortalarda'}.`);
   const b=Object.values(C_.bulgu)[0]; if(b) L.push('Masadaki bulguya bakmamız lazım: '+b.slice(0,40));
   if(C_.hava) L.push(`Dışarısı ${C_.hava.t}°C, ${({acik:'güzel bir gün',bulut:'bulutlu',yagmur:'yağmur yağıyor',kar:'kar yağıyor',sis:'sisli'})[C_.hava.tur]||''}.`);
   return L.length?L:SOZ.sohbet; }
 /* piyasa kapısı = ofisin ön kapısı (sol duvar) */
 const kapiG=new T.Group(); kapiG.position.set(.12,0,3.6); dun.add(kapiG); kutu(kapiG,.08,2.1,1,'#7a5233',0,0,.5,{r:.02}); kure(kapiG,.04,'#d9c27a',.06,1,.88,null,{m:{metalness:.8,roughness:.3}});
 kutu(dun,.1,.08,1.15,'#5a3d27',.08,2.1,4.1,{gs:0});
 const kapiLam=new T.Mesh(new T.SphereGeometry(.09,12,10),new T.MeshStandardMaterial({color:'#444',emissive:'#000'})); kapiLam.position.set(.15,2.35,4.1); dun.add(kapiLam);
 { const kt=doku(256,64,(g,w,h)=>{ g.fillStyle='#1b1d26'; g.fillRect(0,0,w,h); g.fillStyle='#e8eefc'; g.font='800 26px system-ui'; g.textAlign='center'; g.fillText('PİYASA KAPISI',w/2,42); }); levha(dun,.9,.22,.08,2.65,4.1,Math.PI/2,kt); }
 KL.push({ne:'kapi',m:kapiG});
 /* alarm lambası (kritik bulgu) */
 const alarm=new T.Mesh(new T.CylinderGeometry(.1,.12,.14,16),new T.MeshStandardMaterial({color:'#5a1c1c',emissive:'#000'})); alarm.position.set(6.2,2.35,.12); dun.add(alarm); const alarmIs=new T.PointLight('#ff3030',0,5); alarmIs.position.set(6.2,2.2,.5); sc.add(alarmIs); KL.push({ne:'alarm',m:alarm});
 /* elektrik kesintisi şeridi */
 const elk=document.createElement('div'); elk.style.cssText='position:absolute;left:50%;top:10px;transform:translateX(-50%);background:rgba(20,10,10,.85);color:#ffd27a;font:700 12px system-ui;padding:6px 12px;border-radius:99px;display:none;z-index:2'; katman.appendChild(elk);
 /* büyüyen ofis: kasa eşikleri · mevsim süsleri · haftanın çalışanı kupası */
 const EK={}; let kupaM=null;
 function dunyaGuncelle(){ const ks=C_.kasa||0, ay=new Date(Date.now()+3*3600e3).getUTCMonth()+1;
   if(ks>=500&&!EK.akv){ const g=EK.akv=new T.Group(); g.position.set(18.3,0,6.9); dun.add(g); kutu(g,.5,.7,.9,'#3a2a1e',0,0,0); const cam_=new T.Mesh(new T.BoxGeometry(.48,.45,.88),new T.MeshStandardMaterial({color:'#6fc3ea',transparent:true,opacity:.45,roughness:.05})); cam_.position.y=.95; g.add(cam_); g.balik=[0,1,2].map(i=>{ const b=new T.Mesh(new T.SphereGeometry(.035,8,6),M(['#ff8a3d','#ffd34d','#ff5fa2'][i])); b.scale.set(1.6,1,.6); g.add(b); return b; }); engelle(18,6.4,18.6,7.4); YC.clear(); GUN=null; KL.push({ne:'akv',m:g}); }
   if(ks>=1500&&!EK.hamak){ const g=EK.hamak=new T.Group(); dun.add(g); sil(g,.07,1.4,'#7a5233',21.2,0,9.4); sil(g,.07,1.4,'#7a5233',23.4,0,9.4); engelle(21,9.2,23.6,9.6); YC.clear(); GUN=null; const h=new T.Mesh(new T.CylinderGeometry(.35,.35,2.1,16,1,true,Math.PI,Math.PI),M('#e0465a',{side:T.DoubleSide})); h.rotation.z=Math.PI/2; h.position.set(22.3,.75,9.4); h.castShadow=true; g.add(h); KL.push({ne:'hamak',m:g}); }
   if(ks>=3000&&!EK.altin){ EK.altin=1; KL.filter(x=>x.ne==='kahve').forEach(x=>x.m.material=M('#d4af37',{metalness:.8,roughness:.25})); }
   if((ay===12||ay===1)&&!EK.cam){ const g=EK.cam=new T.Group(); g.position.set(11.8,0,7.1); dun.add(g); sil(g,.06,.3,'#7a5233',0,0,0); for(let i=0;i<3;i++){ const c=new T.Mesh(new T.ConeGeometry(.5-i*.13,.6,10),M('#2e7d4f')); c.position.y=.55+i*.38; c.castShadow=true; g.add(c); } g.isik=[...Array(10)].map((_,i)=>{ const m=new T.Mesh(new T.SphereGeometry(.035,8,6),new T.MeshBasicMaterial({color:['#ff5a5a','#ffd34d','#5ab4ff'][i%3]})); const a=i*2.1, y=.5+i*.11, r=.42-i*.035; m.position.set(Math.cos(a)*r,y,Math.sin(a)*r); g.add(m); return m; }); const y_=new T.Mesh(new T.OctahedronGeometry?new T.SphereGeometry(.07,8,6):new T.SphereGeometry(.07,8,6),new T.MeshBasicMaterial({color:'#ffd34d'})); y_.position.y=1.75; g.add(y_); engelle(11.3,6.6,12.3,7.6); YC.clear(); GUN=null; }
   if((ay===12||ay<=2)&&!EK.kardan){ const g=EK.kardan=new T.Group(); g.position.set(25.2,0,15.4); dun.add(g); kure(g,.32,'#ffffff',0,.3,0); kure(g,.23,'#ffffff',0,.78,0); kure(g,.16,'#ffffff',0,1.12,0); const bn=new T.Mesh(new T.ConeGeometry(.04,.18,8),M('#ff8a3d')); bn.rotation.z=-Math.PI/2; bn.position.set(.22,1.12,0); g.add(bn); kure(g,.025,'#111',.13,1.17,.06); kure(g,.025,'#111',.13,1.17,-.06); sil(g,.17,.04,'#c0392b',0,.96,0); engelle(24.8,15,25.6,15.8); YC.clear(); GUN=null; }
   const he=C_.hafta_en; if(kupaM&&kupaM.k!==he){ kupaM.parent.remove(kupaM); kupaM=null; }
   if(he&&!kupaM){ const m=KUL.find(u=>u.id==='masa-'+he); if(m&&he!=='loki'){ const g=new T.Group(); g.position.set(m.x-.5,.77,m.z-.95); dun.add(g); sil(g,.025,.06,'#d4af37',0,0,0,{m:{metalness:.85,roughness:.25}}); sil(g,.012,.07,'#d4af37',0,.06,0,{m:{metalness:.85,roughness:.25}}); sil(g,.06,.09,'#d4af37',0,.13,0,{r2:.03,m:{metalness:.85,roughness:.25}}); g.k=he; kupaM=g; KL.push({ne:'kupa',m:g}); } }
   K.forEach(k=>{ const b=A[k]&&A[k].et.querySelector('b'); if(b) b.textContent=AD[k]+(k!=='loki'&&C_.xp[k]?' · Sv'+svl(C_.xp[k]):'')+(he===k?' 🏆':''); }); }
 /* ziyaretçiler: sen ve HQ'da çevrimiçi olanlar ofise gelir */
 const ZY={}; const TEN=['#f1c9a5','#e0ac80','#c98e64'], GOM=['#3b6fd6','#27ae60','#8e44ad','#e67e22'];
 function insan(ad,i){ const g=new T.Group(), r_=rng('z'+ad); const gm=M(GOM[Math.floor(r_()*4)]), tn=M(TEN[Math.floor(r_()*3)]);
   for(const z of [-.08,.08]){ const b=new T.Mesh(new T.CapsuleGeometry(.055,.42,4,8),M('#2b2f3a')); b.position.set(0,.27,z); b.castShadow=true; g.add(b); }
   const gv=new T.Mesh(new T.CapsuleGeometry(.16,.36,6,12),gm); gv.position.y=.86; gv.castShadow=true; g.add(gv);
   for(const z of [-.21,.21]){ const k=new T.Mesh(new T.CapsuleGeometry(.045,.34,4,8),gm); k.position.set(0,.88,z); k.castShadow=true; g.add(k); }
   const bs=new T.Mesh(new T.SphereGeometry(.13,16,12),tn); bs.position.y=1.32; bs.castShadow=true; g.add(bs); const sc_=new T.Mesh(new T.SphereGeometry(.135,16,12,0,Math.PI*2,0,1.3),M('#3a2a1e')); sc_.position.y=1.34; g.add(sc_);
   const et=document.createElement('div'); et.className='o3-et o3-zy'; et.innerHTML=`<i style="display:none"></i><b>${ad}</b>`; katman.appendChild(et); g.et=et; return g; }
 function ziyaret(L){ const ad=new Set((L||[]).map(x=>x.ad)); for(const k in ZY) if(!ad.has(k)){ dun.remove(ZY[k]); ZY[k].et.remove(); delete ZY[k]; }
   (L||[]).forEach((x,i)=>{ if(ZY[x.ad]) return; const g=insan(x.ad,i); g.position.set(.85+Math.floor(i/2)*.6,0,4.35+(i%2)*.75); g.rotation.y=0; dun.add(g); ZY[x.ad]=g; const lk=A.loki; if(lk){ lk.bal='Hoş geldin '+x.ad+'!'; lk.balT=performance.now()+6000; } K.forEach(k=>{ if(k!=='loki'&&Math.random()<.5){ A[k].bal='Hav! 🐾'; A[k].balT=performance.now()+3000; } }); }); }
 function sistemCiz(t,now){ const ac=C_.kapiAcik; kapiG.rotation.y=L_(kapiG.rotation.y,ac?1.15:0,.04); kapiLam.material.color.set(ac?'#18c08a':'#e2524a'); kapiLam.material.emissive.set(ac?'#0a6':'#a00');
   const al=(C_.alarm||[]).length>0, bl=al&&Math.sin(t*6)>0; alarm.material.emissive.set(bl?'#ff2020':'#000'); alarmIs.intensity=bl?4:0;
   const kes=C_.vts&&(Date.now()/1000-C_.vts>60*60); elk.style.display=kes?'':'none'; if(kes) elk.textContent='⚡ Elektrik kesik — HQ verisi '+Math.round((Date.now()/1000-C_.vts)/60)+' dk\'dır yenilenmedi';
   if(EK.akv) EK.akv.balik.forEach((b,i)=>{ const a=t*(.4+i*.15)+i*2; b.position.set(Math.sin(a)*.17,.85+i*.09+Math.sin(t+i)*.03,Math.cos(a*1.3)*.35); b.rotation.y=-a; });
   if(EK.cam) EK.cam.isik.forEach((m,i)=>{ m.visible=Math.sin(t*3+i)>-.3; });
   for(const k in ZY){ const g=ZY[k], v=g.position.clone(); v.y=1.6; v.project(cam); const r=kap.getBoundingClientRect(); g.et.style.transform=`translate(${((v.x+1)/2*r.width).toFixed(1)}px,${((1-v.y)/2*r.height).toFixed(1)}px) translate(-50%,-100%)`; g.rotation.y=Math.atan2(-(A.loki.m.g.position.z-g.position.z),A.loki.m.g.position.x-g.position.x)*.2; }
   return kes; }
 const BATIM=new Color('#ffb27a'), GUNR_=new Color('#fff1dc'); let penMod='';
 const YG=new T.InstancedMesh(new T.BoxGeometry(.015,.28,.015),new T.MeshBasicMaterial({color:'#cfe6ff',transparent:true,opacity:.6}),160); YG.visible=false; sc.add(YG);
 const KR=new T.InstancedMesh(new T.SphereGeometry(.04,6,4),new T.MeshBasicMaterial({color:'#ffffff'}),160); KR.visible=false; sc.add(KR);
 const YP=[...Array(160)].map((_,i)=>[17.2+((i*7.31)%10.6),((i*3.7)%4),8.2+((i*5.13)%8.6)]); const MT=new T.Matrix4();
 function yagisCiz(dt,t){ const tr=C_.hava&&C_.hava.tur; YG.visible=tr==='yagmur'; KR.visible=tr==='kar'; const M_=tr==='yagmur'?YG:tr==='kar'?KR:null; if(!M_) return; const v=tr==='yagmur'?7:.9;
   YP.forEach((p,i)=>{ p[1]-=v*dt; if(p[1]<0) p[1]+=4; const x=p[0]+(tr==='kar'?Math.sin(t+i)*.2:0); MT.makeTranslation(x,p[1],p[2]); M_.setMatrixAt(i,MT); }); M_.instanceMatrix.needsUpdate=true; }
 /* ses: tarayıcıda üretilir (dosya yok) — varsayılan KAPALI */
 var SES={ac:null,on:false,ortam:null,
   bas(){ if(this.ac) return; const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; const a=this.ac=new AC(), n=a.createBuffer(1,a.sampleRate*2,a.sampleRate), d=n.getChannelData(0); let l=0; for(let i=0;i<d.length;i++){ l=(l+.02*(Math.random()*2-1))/1.02; d[i]=l*3; }
     const s_=a.createBufferSource(); s_.buffer=n; s_.loop=true; const f=a.createBiquadFilter(); f.type='lowpass'; f.frequency.value=420; const g=a.createGain(); g.gain.value=0; s_.connect(f).connect(g).connect(a.destination); s_.start(); this.ortam=g; },
   ayar(on){ this.on=!!on; if(on){ this.bas(); if(this.ac&&this.ac.state==='suspended') this.ac.resume(); } if(this.ortam) this.ortam.gain.setTargetAtTime(on?.05:0,this.ac.currentTime,.4); },
   ton(f0,f1,sur,tip,vol){ if(!this.on||!this.ac) return; const a=this.ac, o=a.createOscillator(), g=a.createGain(); o.type=tip||'sine'; o.frequency.setValueAtTime(f0,a.currentTime); o.frequency.exponentialRampToValueAtTime(f1,a.currentTime+sur); g.gain.setValueAtTime(vol||.08,a.currentTime); g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+sur); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime+sur+.05); },
   hav(){ this.ton(520,260,.12,'sawtooth',.05); setTimeout(()=>this.ton(560,280,.1,'sawtooth',.045),170); },
   olay(tip,oz){ if(!this.on) return; if(tip==='ye') this.ton(1800,1500,.18,'triangle',.05); else if(tip==='oyna'||oz==='top'||oz==='acil'||tip==='sohbet') this.hav(); else if(tip==='kahve') this.ton(300,120,.6,'sine',.03); else if(tip==='ac') this.ton(900,700,.08,'square',.02); } };
 let son=performance.now(), cal=true, sT=0, eT=0, secili=null; const geceR=new Color('#0c0e1a'), gunR=new Color('#1a1d2b');
 function ciz(){ if(!cal) return; requestAnimationFrame(ciz); if(!kap.isConnected){ cal=false; ren.dispose(); return; } if(!kap.offsetParent||document.hidden){ son=performance.now(); return; }
   const now=performance.now(); if(mob&&now-son<30) return; const dt=Math.min(.05,(now-son)/1000); son=now; const t=now/1000;
   const r=kap.getBoundingClientRect(); const cw=Math.round(r.width), ch=Math.round(r.height); if(el.width!==Math.round(cw*ren.getPixelRatio())||el.height!==Math.round(ch*ren.getPixelRatio())) ren.setSize(cw,ch,false);
   const ck=1-Math.exp(-dt*4); camAn.c.lerp(takip&&A[takip]?A[takip].m.g.position:camHedef.c,ck); camAn.z=L_(camAn.z,takip?5.5:camHedef.z,ck); camGuncelle(r);
   const W_=Date.now()/1000; K.forEach(k=>guncelleAjan(A[k],W_)); K.forEach(k=>{ const a=A[k]; if(a.is==='sohbet'&&a.ile&&A[a.ile]){ const b=A[a.ile], dx=b.hedef.x-a.hedef.x, dz=b.hedef.z-a.hedef.z; a.yon=Math.atan2(-dz,dx); if(b.poz==='ayakta'){ b.yon=Math.atan2(dz,-dx); b.dinliyor=1; } } }); ayir(dt);
   K.forEach(k=>{ const a=A[k], g=a.m.g.position, h=a.hedef, ilk=!a.konum; const ks=ilk?1:1-Math.exp(-dt*14); g.x=L_(g.x,h.x,ks); g.z=L_(g.z,h.z,ks); g.y=L_(g.y,h.y,ilk?1:1-Math.exp(-dt*10)); a.konum=1; pozla(a,dt,t); });
   { const oy=kullan('oyna-0')||kullan('oyna-1')||kullan('oyna-2')||kullan('oyna-3'); const [bx,bz]=oy?topYer(W_):[4.5,12.5]; top.position.x=L_(top.position.x,bx,1-Math.exp(-dt*6)); top.position.z=L_(top.position.z,bz,1-Math.exp(-dt*6)); top.rotation.z-=dt*(oy?6:0); }
   { const ac=kullan('buzdolabi'); kapak.rotation.y=L_(kapak.rotation.y,ac?-1.6:0,1-Math.exp(-dt*5)); dolapIs.intensity=ac?1.2:0; }
   tvAcik=K.some(k=>A[k].is==='izle'); const kahveV=kullan('kahve');
   buhar.forEach((b,i)=>{ const p=(t*.4+i/5)%1; b.position.set(21+Math.sin(t+i)*.04,1.15+p*.5,.78); b.material.opacity=kahveV?.45*(1-p):0; b.scale.setScalar(.6+p); });
   const kesik=sistemCiz(t,now); const h=saat(), gece=kesik||h<6.5||h>=19.5, batim=!gece&&(h>=17.3||h<7.3); gunes.color.lerp(batim?BATIM:GUNR_,.02); gunes.position.y=L_(gunes.position.y,batim?14:32,.02);
   { const mod=gece?'gece':batim?'batim':'gunduz', hv=C_.hava&&C_.hava.tur; if(mod+hv!==penMod){ penMod=mod+hv; PEN.forEach(p=>p.yenile(mod,hv)); } }
   yagisCiz(dt,t);
   gunes.intensity=L_(gunes.intensity,gece?.25:C_.yagis?1.2:2.2,.02); hemi.intensity=L_(hemi.intensity,gece?.45:1.1,.02); gl.intensity=L_(gl.intensity,gece?6:0,.05); sc.background.lerp(gece?geceR:gunR,.02);
   if(now-eT>450){ eT=now; for(const k in ekranlar){ const e=ekranlar[k]; e.aktif=!kesik&&A[k]&&A[k].is==='yaz'&&A[k].poz==='otur'; e.yenile(C_.bulgu[k]?'⚠ '+C_.bulgu[k]:ISY[k],!!e.aktif,k==='loki'?'#ffcf5a':'#2ce0b0'); } tv.yenile(tvAcik); }
   ren.render(sc,cam);
   K.forEach(k=>{ const a=A[k], v=a.m.g.position.clone(); v.y+=.8*a.m.s+(a.poz==='otur'?.12:0)+(a.m.g.position.y); v.project(cam); const x=(v.x+1)/2*cw, y=(1-v.y)/2*ch, gr=x>-60&&x<cw+60&&y>-60&&y<ch+60;
     a.et.style.display=gr&&!a.tunel?'':'none'; if(!gr) return; a.et.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;
     if(now-(a.ihT||0)>1000&&a.n){ a.ihT=now; const q=['e','t','s','k','o'], E=a.et.querySelectorAll('.o3-ih em'); E.forEach((x,j)=>{ const v=a.n[q[j]]||0; x.style.width=Math.round(v)+'%'; x.style.background=v>=60?'#18c08a':v>=30?'#f5b041':'#e2524a'; }); }
     const bi=a.et.firstChild, b=now<a.balT?a.bal:(a.poz==='uyu'?'z z z':''); if(bi.textContent!==b) bi.textContent=b; bi.style.display=b?'':'none'; a.et.classList.toggle('sec',secili===k); });
   if(now-sT>1000){ sT=now; if(opt.durum) opt.durum(odaSay()); } }
 function sayac(f){ const t=Date.now()/1000, gn=Math.floor((t+3*3600)/86400); if(!GUN||GUN.gn!==gn||GUN.sig!==C_SIG) GUN=gunHepsi(gn); const R_={}; for(const k of K) for(const x of GUN.out[k]){ if(x.t0>t) break; if(f(x)){ const d=Math.min(t,x.t1)-x.t0; R_[k]=R_[k]||{n:0,sn:0}; R_[k].n++; R_[k].sn+=d; } } return R_; }
 const dk=sn=>sn>=3600?(sn/3600).toFixed(1).replace('.',',')+' sa':Math.round(sn/60)+' dk';
 function bilgiMetin(x){ const t=Date.now()/1000;
   if(x.ne==='ekran'){ const a=A[x.k], b=C_.bulgu[x.k]; return {b:'🖥 '+AD[x.k]+' · monitör',L:[a&&a.is==='yaz'?'Şu an masasında çalışıyor.':'Şu an masasında değil.',b?'⚠ Üzerinde çalıştığı bulgu: '+b:'İşi: '+ISY[x.k],'Bugün masada: '+dk(((sayac(s=>s.tip==='yaz')[x.k])||{sn:0}).sn)]}; }
   if(x.ne==='yatak'){ const r=(sayac(s=>s.tip==='uyu')[x.k])||{sn:0}; const n=ihtiyac(A[x.k],t)||{e:0}; return {b:'🛏 '+AD[x.k]+'’in yatağı',L:['Bugün uyku: '+dk(r.sn),'Enerjisi şu an: %'+Math.round(n.e)]}; }
   if(x.ne==='mama'){ const r=(sayac(s=>s.tip==='ye'&&s.u&&s.u.id==='mama-'+A[x.k].i)[x.k])||{n:0}; const n=ihtiyac(A[x.k],t)||{t:0}; return {b:'🍖 '+AD[x.k]+'’in mama kabı',L:['Bugün '+r.n+' kez yedi.','Tokluğu: %'+Math.round(n.t)]}; }
   if(x.ne==='kahve'){ const r=sayac(s=>s.tip==='kahve'); return {b:'☕ Kahve makinesi',L:K.filter(k=>r[k]).map(k=>AD[k]+': '+r[k].n+' kahve').concat(Object.keys(r).length?[]:['Bugün henüz kahve yapılmadı.'])}; }
   if(x.ne==='dolap'){ const r=sayac(s=>s.tip==='ac'); const n=Object.values(r).reduce((a,b)=>a+b.n,0); return {b:'🧊 Buzdolabı',L:['Bugün '+n+' kez açıldı.'].concat(K.filter(k=>r[k]).map(k=>AD[k]+': '+r[k].n))}; }
   if(x.ne==='kulube'){ const r=(sayac(s=>s.tip==='kulube').den)||{sn:0}; return {b:'🏠 HAYDUT’un kulübesi',L:['Haydut bugün burada '+dk(r.sn)+' dinlendi.']}; }
   if(x.ne==='top'){ const r=sayac(s=>s.tip==='oyna'); return {b:'🎾 Top',L:K.filter(k=>r[k]).map(k=>AD[k]+': '+dk(r[k].sn)+' oynadı').concat(Object.keys(r).length?[]:['Bugün henüz kimse oynamadı.'])}; }
   if(x.ne==='kapi') return {b:'🚪 Piyasa kapısı',L:[C_.kapiAcik?'Kapı AÇIK — yeşil ışık yanıyor.':'Kapı KAPALI — kırmızı ışık yanıyor.','Ofisin ön kapısı gerçek piyasa kapısıyla birlikte açılıp kapanır.']};
   if(x.ne==='alarm') return {b:'🚨 Alarm lambası',L:(C_.alarm||[]).length?['Kritik bulgu var:'].concat(C_.alarm.slice(0,4)):['Sessiz — kritik bulgu yok.']};
   if(x.ne==='akv') return {b:'🐠 Akvaryum',L:['Demo kasası 500 $ kârı geçince ofise geldi.','Kasa şu an: '+(C_.kasa>0?'+':'')+C_.kasa+' $']};
   if(x.ne==='hamak') return {b:'🏖 Hamak',L:['Demo kasası 1.500 $ kârı geçince bahçeye kuruldu.']};
   if(x.ne==='kupa') return {b:'🏆 Haftanın çalışanı',L:[AD[C_.hafta_en]+' — bu hafta en çok gerçek bulgu getiren asistan.']};
   return {b:'',L:[]}; }
 function iliski(k){ const t=Date.now()/1000, gn=Math.floor((t+3*3600)/86400); if(!GUN||GUN.gn!==gn||GUN.sig!==C_SIG) GUN=gunHepsi(gn); const D_=GUN.dost; return K.filter(x=>x!==k).map(x=>({k:x,ad:AD[x],v:D_[k+x]})).sort((a,b)=>b.v-a.v); }
 function odaSay(){ const n={}; K.forEach(k=>{ const a=A[k], p=a.m.g.position; for(const id in ODA){ const o=ODA[id]; if(p.x>=o.x0&&p.x<o.x1&&p.z>=o.z0&&p.z<o.z1){ n[id]=(n[id]||0)+1; a.oda=id; } } }); return n; }
 requestAnimationFrame(ciz);
 return { odaSec, takip(k){ takip=k||null; }, sec(k){ secili=k||null; }, veri(v){ VERI=v; baglam(); const B=v&&v.ofis&&v.ofis.loki&&v.ofis.loki.B; panoVeri=B?B.map(b=>({a:AD[b.a]||b.a,b:b.b,d:b.d,o:b.o})):null; brif.yenile(B?B.map(b=>(AD[b.a]||b.a)+': '+b.b):null); },
   olaylar(E){ OLAY=E||[]; baglam(); }, ziyaret(L){ ziyaret(L); }, durum(){ return {kasa:C_.kasa,xp:C_.xp,hafta_en:C_.hafta_en,gunluk:C_.gunlukler,sv:k=>svl((C_.xp||{})[k])}; }, ses(on){ SES.ayar(on); }, iliski(k){ return iliski(k); }, don(d){ aci+=d; }, yakinlas(f){ yakin(f); }, konus(k,m,sn){ if(A[k]){ A[k].bal=m; A[k].balT=performance.now()+(sn||4)*1000; } }, barlar(on){ katman.classList.toggle('o3-bk',!on); }, odaSay, gunluk(n){ return gunluk(Date.now()/1000,n||20); }, ihtiyac(k){ return A[k]?ihtiyac(A[k],Date.now()/1000):null; }, nerede(k){ return A[k]&&A[k].oda; }, durdur(){ cal=false; } };
};
window.HCOfis3D=HCOfis3D;
})();
