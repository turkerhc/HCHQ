/* HCCORTEX · lib/hc_pazar.js — BIST · NASDAQ · Emtia = KRİPTO ANA SAYFASININ AYNASI (v5 · 20.11.2026)
   Türker (19.11): "Kripto sekmesinde ne görüyorsan BIST, NASDAQ ve Emtia'da da aynı olacak — hesaplamalar, görünüş, butonlar, kartlar."
   Her pazar, AYNI sayfanın ?pz=<pazar> kopyası olarak üst çubuğun altında çerçevede açılır. Sayfa ?pz ile açılınca
   veri_<pazar>.json'u (pazar_motor.py · aynı HQ motoru) okur, kriptoya özgü panelleri gizler. LOUNGE'da de aynısı (app.html?pz=…).
   Çerçeveler bir kez kurulur, sekmeler arası geçişte saklanır (yeniden yüklenmez). */
(function(){
  const FR={}; let son=null, css=false;
  function stil(){ if(css) return; css=true; const st=document.createElement('style'); st.id='hcpz-css';
    st.textContent='.pzF{position:fixed;left:0;right:0;width:100%;border:0;z-index:40;background:var(--bg,#04060c)}.pzF[hidden]{display:none}'
      +'html.pz-acik main,html.pz-acik #sekme,html.pz-acik footer,html.pz-acik [data-sek],html.pz-acik #yb{display:none!important}html.pz-acik,html.pz-acik body{overflow:hidden}';
    document.head.appendChild(st);
    addEventListener('resize',()=>setTimeout(konum,60)); if(window.visualViewport) visualViewport.addEventListener('resize',()=>setTimeout(konum,60)); }
  function konum(){ const F=son&&FR[son]; if(!F) return; const h=document.querySelector('header'); const t=h?Math.max(0,Math.round(h.getBoundingClientRect().bottom)):0;
    F.style.top=t+'px'; F.style.height=Math.max(200,(window.visualViewport?visualViewport.height:innerHeight)-t)+'px'; }
  function kur(pz){ stil(); let F=FR[pz]; if(!F){ F=document.createElement('iframe'); F.className='pzF'; F.title=pz.toUpperCase(); F.setAttribute('allow','clipboard-write');
      F.hidden=true; F.src=location.pathname+'?pz='+encodeURIComponent(pz); document.body.appendChild(F); FR[pz]=F; } return F; }
  function ac(pz){ stil(); Object.keys(FR).forEach(k=>{ FR[k].hidden=k!==pz; });
    const F=kur(pz);
    try{ const W=F.contentWindow;   /* 26.11 · Türker: pazara geçince o pazarın ANA sayfası açılır (önceki sekme/kart/panel kalmaz) */
      if(W&&W.sekmeAc){ try{ W.coinKapat&&W.coinKapat(); W.ustKatmanKapat&&W.ustKatmanKapat(); }catch(_){} W.sekmeAc('ana'); W.scrollTo(0,0); } }catch(_){}
    F.hidden=false; son=pz; document.documentElement.classList.add('pz-acik'); konum(); requestAnimationFrame(konum);
    [80,400].forEach(t=>setTimeout(()=>{ try{ F.contentWindow.dispatchEvent(new Event('resize')); }catch(_){} },t)); }   /* 20.11 · gizli yüklenen çerçevede reaktör/grafikler kendini ölçsün */
  function kapat(){ Object.values(FR).forEach(F=>F.hidden=true); document.documentElement.classList.remove('pz-acik'); son=null;
    [80,400].forEach(t=>setTimeout(()=>dispatchEvent(new Event('resize')),t)); }   /* 20.11 · Kripto'ya dönünce ana sayfa reaktörü kendini ölçsün */
  /* 24.11 · Türker: sekmeler ilk açılışta siyah/yükleniyor görünmesin → giriş biter bitmez ÜÇÜ BİRDEN yüklenir; hoş geldin ekranı hazır olana kadar (en çok ~7 sn) bekler.
     Çerçeve hazır olunca (goster bitti) {hcpz:'hazir'} mesajı yollar. */
  const HZR={}; let basladi=false, bekleyen=[];
  addEventListener('message',e=>{ const m=e.data||{}; if(m.hcpz==='hazir'&&m.pz){ HZR[m.pz]=1; if(['bist','nasdaq','emtia'].every(k=>HZR[k])){ bekleyen.forEach(f=>f()); bekleyen=[]; } } });
  function baslat(){ if(basladi||window.top!==window.self||new URLSearchParams(location.search).get('pz')) return; basladi=true; ['bist','nasdaq','emtia'].forEach(kur); }
  function hazir(ms){ baslat(); return new Promise(res=>{ if(['bist','nasdaq','emtia'].every(k=>HZR[k])) return res(); bekleyen.push(res); setTimeout(res,ms||7000); }); }
  function onYukle(){ if(window.top!==window.self||new URLSearchParams(location.search).get('pz')) return;
    const girisAcik=()=>!!document.querySelector('#giris:not([hidden]),#kilit:not([hidden])')||document.body.classList.contains('girisde');
    const dene=()=>{ if(basladi) return; if(girisAcik()){ setTimeout(dene,1000); return; } baslat(); };
    const bas=()=>setTimeout(dene,1500); if(document.readyState==='complete') bas(); else addEventListener('load',bas,{once:true}); }
  onYukle();
  window.HCPZ={ac,kapat,konum,kur,baslat,hazir};
})();
