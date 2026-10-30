/* De Fotojacht / The Photo Hunt – moordzaak zonder kaart en zonder gps. Spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js en FJ_DATA (data-xx.js). Géén walk.js: er is geen kaart.
   Acht foto-opdrachten (soort plek, niet een locatie): de camera bewijst dat je buiten was en iets gezocht hebt.
   Bij elke foto verschijnt wat de dader daar achterliet (bewijs, altijd waar) of wat een getuige zag (vier getuigen, één liegt).
   Drie eigenschappen (jas, vervoer, wat hij bij zich had) wijzen samen precies één van vijf verdachten aan.
   Foto's blijven op de telefoon (kleine kopie in localStorage) en worden aan het eind één bewijsstrook. */
(function(){
"use strict";
var MW=window.MW,LS=MW.LS,D=window.FJ_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="fj",GK="ss_game_fj_"+L,hashStr=MW.hashStr;
var G=null,tick=0,MODE=LS.get("ss_fj_mode","out");
var ATK=["jas","weg","ding"],NS=5,ALL=31;

/* ---------- kleine hulpjes (zelfde ids als in de andere spellen) ---------- */
function rngOf(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function shuffle(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function toast(t){var e=$("#toast");e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},2600)}
function sheet(html,lock){var b=$("#sheetBody");b.onclick=null;b.innerHTML=html;$("#sheet").hidden=false;b.scrollTop=0;if(lock)$("#sheet").dataset.lock="1";else delete $("#sheet").dataset.lock;return b}
function closeSheet(){var b=$("#sheetBody");if(b)b.onclick=null;$("#sheet").hidden=true;delete $("#sheet").dataset.lock}
$("#sheet").addEventListener("click",function(e){if(e.target.id==="sheet"&&!$("#sheet").dataset.lock)closeSheet()});
function buzz(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
var AC=null;function beep(f,d){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;o.type="triangle";g.gain.value=.07;g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function bits(m){var n=0;while(m){n+=m&1;m>>=1}return n}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function ico(id,cls){return '<svg class="'+(cls||"ico")+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(D.ICON[id]||"M4 4h16v16H4z")+'"/></svg>'}
function fmt(mi){return Math.floor(mi/60)+(L==="nl"?"."+String(mi%60).padStart(2,"0"):":"+String(mi%60).padStart(2,"0"))}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}

/* ---------- zaakgenerator ---------- */
function genCase(seed,mode){
  var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  var V=pick(D.VIC);
  for(var tries=0;tries<4000;tries++){
    // vijf verdachten met elk drie eigenschappen
    var pool=shuffle(D.SUS,r).slice(0,NS),sus=pool.map(function(s){var tr={};ATK.forEach(function(k){tr[k]=Math.floor(r()*3)});return{name:s[0],rel:s[1],q:s[2],tr:tr}});
    var K=Math.floor(r()*NS);
    // elk bewijs past bij ≥2 verdachten, alle drie samen alleen bij K; geen twee die al volstaan
    var ev=ATK.map(function(k){var v=sus[K].tr[k],m=0;sus.forEach(function(s,j){if(s.tr[k]===v)m|=1<<j});return{k:k,v:v,m:m}});
    if(ev.some(function(x){return bits(x.m)<2}))continue;
    if(ev.reduce(function(a,x){return a&x.m},ALL)!==1<<K)continue;
    if(tries<2500&&(bits(ev[0].m&ev[1].m)<2||bits(ev[0].m&ev[2].m)<2||bits(ev[1].m&ev[2].m)<2))continue;
    // vier getuigen: drie zeggen de waarheid over een eigenschap van K, één liegt (noemt een andere waarde van zo'n eigenschap)
    var ws=shuffle(D.WS,r).slice(0,4),Li=Math.floor(r()*4),wits=ws.map(function(w,i){var k=ATK[i%3],v=sus[K].tr[k];
      if(i===Li){v=(v+1+Math.floor(r()*2))%3}
      return{name:w[0],who:w[1],k:k,v:v,lie:i===Li,t:pick(D.WIT[k])}});
    // acht opdrachten en de volgorde: bewijs, getuige, bewijs, getuige, bewijs, getuige, tijd, getuige
    var list=shuffle(mode==="in"?D.IN:D.OUT,r).slice(0,8),order=["e0","w0","e1","w1","e2","w2","t","w3"];
    var tm=22*60+5+Math.floor(r()*70),slots=order.map(function(o,i){var task=list[i],s={id:task[0],what:task[1],h1:task[2],h2:task[3],lead:task[4],cls:task[5]||[]};
      if(o==="t"){s.kind="time";s.t=fill(pick(D.TIME),{t:fmt(tm)})}
      else if(o[0]==="e"){var e=ev[+o[1]];s.kind="ev";s.k=e.k;s.v=e.v;s.t=pick(D.EV[e.k][e.v])}
      else{s.kind="wit";s.w=+o[1]}
      return s});
    return{V:V[0],W:V[1],sus:sus,K:K,wits:wits,Li:Li,slots:slots,ev:ev}
  }
  return null}
function makeCode(seed,mode){return"FJ"+(mode==="in"?"B":"S")+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);if(!/^FJ[SB]/.test(c)||c.length<4||c.length>11)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;return{mode:c[2]==="B"?"in":"out",seed:seed}}
function vars(){var c=G.c,k=c.sus[c.K];return{V:c.V,W:c.W,K:k.name,KR:k.rel,KJ:cap(D.AT.jas.v[k.tr.jas]),KW:D.AT.weg.v[k.tr.weg],KD:D.AT.ding.v[k.tr.ding],L:cap(c.wits[c.Li].name)}}
function witText(w){return fill(w.t,{v:D.AT[w.k].v[w.v]})}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get(),i=MW.profile.rank(p.xp),nx=MW.profile.next(p.xp),R=MW.profile.RANKS.nl[i][0],t=MW.t(L);
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.fj&&p.games.fj.n)||0;
  $("#pXp").style.width=(nx?Math.round((p.xp-R)/(nx[0]-R)*100):100)+"%";
  $("#pNext").textContent=nx?MW.fill(t.pts,{x:p.xp,n:nx[0]-p.xp,r:MW.profile.RANKS[L][i+1][1]}):MW.fill(t.ptsTop,{x:p.xp});
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.has(ID),lk=MW.pro.locked(ID),playedToday=(p.games.fj&&p.games.fj.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=MW.t(L).tBtn+" · "+MW.cfg.team.price;
  $("#status").textContent=MW.statusText(L,ID);MW.homeOrder(lk);
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});
  show("home")}
function show(id){["home","brief","play"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="play")tick=setInterval(hud,1000)}
function proSheet(){sheet(MW.proHTML(L,"team",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)},ID)}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MODE=b.dataset.m;LS.set("ss_fj_mode",MODE);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();start(hashStr("fj|"+MODE+"|"+MW.today()),MODE,true)};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();start(Math.floor(Math.random()*4e9),MODE,false)};
$("#bPro").onclick=proSheet;
$("#bResume").onclick=function(){G=LS.get(GK,null);if(!G)return home();enter()};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};

/* ---------- dossier ---------- */
function start(seed,mode,daily){var c=genCase(seed,mode);if(!c){toast("…");return}
  G={seed:seed,code:makeCode(seed,mode),mode:mode,c:c,i:0,ph:[],t0:0,tries:0,daily:!!daily,par:mode==="in"?30:60,shown:false,seen:[]};brief()}
function brief(){var c=G.c;
  $("#bfNo").textContent=fill(T.briefNo,{c:G.code});$("#bfTitle").textContent=c.V;$("#bfSub").textContent=cap(c.W);
  $("#bfText").textContent=fill(D.OPEN,{V:c.V,W:c.W});
  $("#bfSus").innerHTML=c.sus.map(function(s){return '<div class="sus"><b>'+esc(s.name)+'</b><small>'+esc(cap(s.rel))+' · '+esc(s.q)+'</small><div class="tags">'+ATK.map(function(k){return "<i>"+esc(D.AT[k].s[s.tr[k]])+"</i>"}).join("")+'</div></div>'}).join("");
  $("#bfWit").innerHTML=c.wits.map(function(w){return '<div class="sus"><b>'+esc(cap(w.name))+'</b><small>'+esc(cap(w.who))+'</small></div>'}).join("");
  show("brief")}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();MW.pro.setFree(ID)}save();enter()};
$("#bBack").onclick=function(){G=null;home()};
function save(){if(G)LS.set(GK,G)}

/* ---------- de jacht ---------- */
function enter(){show("play");render();mlWarm()}
function hud(){if(!G)return;$("#hT").textContent=mmss(Date.now()-G.t0);$("#hS").textContent=G.ph.length+"/8";$("#hG").textContent=G.ph.filter(function(p,i){return G.c.slots[i].kind==="wit"}).length+"/4"}
function render(){hud();var i=G.i,box=$("#card");
  if(i>=8){box.innerHTML='<div class="pol done"><div class="grid">'+G.ph.map(function(p,j){return '<img src="'+p+'" alt="">'}).join("")+'</div><p class="cap">'+esc(T.hud.n)+' 8/8</p></div><button type="button" class="btn red" id="bAcc">'+T.accuse+'</button>';$("#bAcc").onclick=accuseSheet;return}
  var s=G.c.slots[i];
  if(G.shown){ // de foto is gemaakt: laat zien wat hier lag
    var body=s.kind==="wit"?'<p class="lead2">'+esc(s.lead)+'</p><div class="wit"><em>'+esc(T.wit)+' · '+esc(cap(G.c.wits[s.w].name))+' '+esc(T.says)+'</em><p>“'+esc(witText(G.c.wits[s.w]))+'”</p></div>'
      :'<p class="lead2">'+esc(s.lead)+'</p><div class="ev"><em>'+esc(T.found)+'</em><p>'+esc(s.t)+'</p></div>';
    box.innerHTML='<div class="pol"><img src="'+G.ph[i]+'" alt=""><p class="cap">'+esc(s.what)+'</p>'+(G.seen2?'<p class="seen">'+esc(G.seen2)+'</p>':'')+'</div>'+body+'<button type="button" class="btn" id="bNext">'+(i===7?T.accuse:T.next)+'</button>';
    $("#bNext").onclick=function(){G.i++;G.shown=false;G.miss=0;save();buzz(40);render();if(G.i>=8)accuseSheet()};return}
  box.innerHTML='<div class="pol empty"><div class="ph">'+ico(s.id,"big")+'</div><p class="cap">'+esc(T.task.replace("{i}",i+1))+'</p></div>'+
    '<div class="task"><em>'+esc(T.find)+'</em><h2>'+esc(cap(s.what))+'</h2><p class="hint" id="hint">'+esc(s.h1)+'</p><button type="button" class="btn ghost sm" id="bHint">'+T.hint2+'</button></div>'+
    '<label class="btn cam" for="file">📷 '+T.shoot+'</label><p class="note" id="pMsg"></p><p class="note" id="mlSt"></p><p class="note">'+esc(T.camNote)+'</p>';
  $("#bHint").onclick=function(){$("#hint").textContent=s.h2;this.hidden=true;G.seen[i]=1;save()};
  if(G.seen[i]){$("#hint").textContent=s.h2;$("#bHint").hidden=true}}

/* ---------- beeldherkenning: MobileNetV2 (ImageNet, int8) in de browser via onnxruntime-web, alles vanaf de eigen site ----------
   Elke opdracht heeft een lijst ImageNet-klassen die tellen. De foto wordt vierkant uitgesneden, naar 224×224 geschaald en genormaliseerd;
   de kans van de best passende klasse of de som van de passende klassen moet hoog genoeg zijn. De foto zelf verlaat de telefoon niet. */
var ML={sess:null,busy:null,dead:false};
function mlLoad(){if(ML.sess)return Promise.resolve(ML.sess);if(ML.busy)return ML.busy;if(ML.dead||!window.ort)return Promise.reject("noml");
  try{ort.env.wasm.wasmPaths=new URL(MW.root+"shared/ort/",location.href).href;ort.env.wasm.numThreads=1}catch(e){}
  ML.busy=ort.InferenceSession.create(MW.root+"games/fotojacht/model/mobilenetv2.onnx",{executionProviders:["wasm"]}).then(function(x){ML.sess=x;ML.busy=null;return x},function(e){ML.dead=true;ML.busy=null;throw e});
  return ML.busy}
/* classify(img) → {p(i), top:[{i,p}×5]} na softmax */
function classify(im){return mlLoad().then(function(sess){
  var N=224,cv=document.createElement("canvas");cv.width=cv.height=N;var g=cv.getContext("2d"),w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,sq=Math.min(w,h);
  g.drawImage(im,(w-sq)/2,(h-sq)/2,sq,sq,0,0,N,N);
  var d=g.getImageData(0,0,N,N).data,f=new Float32Array(3*N*N),M=[.485,.456,.406],S=[.229,.224,.225];
  for(var i=0;i<N*N;i++)for(var c=0;c<3;c++)f[c*N*N+i]=(d[i*4+c]/255-M[c])/S[c];
  var feed={};feed[sess.inputNames[0]]=new ort.Tensor("float32",f,[1,3,N,N]);
  return sess.run(feed).then(function(out){var o=out[sess.outputNames[0]].data,mx=-1e9,i;for(i=0;i<o.length;i++)if(o[i]>mx)mx=o[i];
    var e=new Float64Array(o.length),sum=0;for(i=0;i<o.length;i++){e[i]=Math.exp(o[i]-mx);sum+=e[i]}
    var idx=[];for(i=0;i<o.length;i++)idx.push(i);idx.sort(function(a,b){return e[b]-e[a]});
    return{p:function(k){return e[k]/sum},top:idx.slice(0,5).map(function(k){return{i:k,p:e[k]/sum}})}})})}
function mlLabel(i){var l=window.FJ_LABELS;return (D.LBL&&D.LBL[i])||(l&&l[i])||("#"+i)}
/* mlMatch(res,cls) → past het gezochte op de foto? */
function mlMatch(res,cls){var best=0,sum=0;cls.forEach(function(k){var p=res.p(k);sum+=p;if(p>best)best=p});return{best:best,sum:sum,ok:best>=.10||sum>=.18}}

/* foto: alleen net gemaakt en niet pikzwart; dan herkennen; kleine kopie bewaren */
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f||!G)return;var msg=$("#pMsg");if(!msg)return;msg.textContent=T.checking;
  if(f.lastModified&&Math.abs(Date.now()-f.lastModified)>5*60000){msg.textContent=T.tooOld;buzz(120);return}
  var url=URL.createObjectURL(f),im=new Image();im.onload=function(){URL.revokeObjectURL(url);
    var w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,360/Math.max(w,h)),cv=document.createElement("canvas");cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);var g=cv.getContext("2d");g.drawImage(im,0,0,cv.width,cv.height);
    var d=g.getImageData(0,0,cv.width,cv.height).data,sum=0,n=0;for(var i=0;i<d.length;i+=16){sum+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;n++}
    if(sum/n<14){msg.textContent=T.tooDark;buzz(120);return}
    var thumb=cv.toDataURL("image/jpeg",.7),s=G.c.slots[G.i],accept=function(seen){G.ph[G.i]=thumb;G.shown=true;G.seen2=seen||"";save();buzz([40,30,80]);beep(520,.15);render()};
    if(!s.cls||!s.cls.length)return accept();
    msg.textContent=T.mlCheck;
    classify(im).then(function(res){var m=mlMatch(res,s.cls),top=res.top[0];
      if(m.ok)return accept(fill(T.mlYes,{x:mlLabel(top.i)}));
      G.miss=(G.miss||0)+1;save();buzz(120);beep(180,.2);
      msg.textContent=fill(T.mlNo,{x:mlLabel(top.i),w:s.what});
      if(G.miss>=3&&!$("#bSkip")){var b=document.createElement("button");b.type="button";b.id="bSkip";b.className="btn ghost sm";b.textContent=T.mlSkip;msg.parentNode.insertBefore(b,msg.nextSibling);
        b.onclick=function(){G.skips=(G.skips||0)+1;G.miss=0;toast(T.mlSkipped);accept()}}
    },function(){msg.textContent=T.mlFail;accept()})};
  im.onerror=function(){URL.revokeObjectURL(url);msg.textContent=T.noFile};im.src=url});
/* bij het begin van de jacht alvast laden, zodat de eerste foto niet hoeft te wachten */
function mlWarm(){if(ML.sess||ML.dead)return;var st=$("#mlSt");if(st)st.textContent=T.mlLoad;mlLoad().then(function(){var e=$("#mlSt");if(e)e.textContent=T.mlOk;setTimeout(function(){var e=$("#mlSt");if(e&&e.textContent===T.mlOk)e.textContent=""},2500)},function(){var e=$("#mlSt");if(e)e.textContent=T.mlFail})}

/* ---------- notitieboek, verdachten, menu ---------- */
function noteSheet(){var ev=[],wi=[];G.c.slots.forEach(function(s,i){if(i>=G.i&&!(i===G.i&&G.shown))return;
    if(s.kind==="wit")wi.push('<div class="clue"><em>'+esc(cap(G.c.wits[s.w].name))+'</em><p>“'+esc(witText(G.c.wits[s.w]))+'”</p></div>');else ev.push('<div class="clue"><em>'+esc(s.what)+'</em><p>'+esc(s.t)+'</p></div>')});
  sheet('<h2>'+T.notebook+'</h2>'+(ev.length||wi.length?'<div class="eyebrow">'+T.nbE+'</div><div class="list">'+ev.join("")+'</div><div class="eyebrow">'+T.nbW+'</div><div class="list">'+wi.join("")+'</div>':'<p class="note">'+T.nbNone+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function susSheet(){sheet('<h2>'+T.people+'</h2><div class="list">'+G.c.sus.map(function(s){return '<div class="sus"><b>'+esc(s.name)+'</b><small>'+esc(cap(s.rel))+' · '+esc(s.q)+'</small><div class="tags">'+ATK.map(function(k){return "<i>"+esc(D.AT[k].s[s.tr[k]])+"</i>"}).join("")+'</div></div>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function menuSheet(){sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button><button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}
$("#bNote").onclick=noteSheet;$("#bPeople").onclick=susSheet;$("#zM").onclick=menuSheet;$("#bAcc2").onclick=function(){if(G.i>=8)accuseSheet();else noteSheet()};

/* ---------- beschuldiging ---------- */
function accuseSheet(){var c=G.c,ps=null,pw=null;
  sheet('<h2>'+T.acH+'</h2><p>'+T.acT+'</p><div class="eyebrow">'+T.acWho+'</div><div class="list" id="vS">'+c.sus.map(function(s,i){return '<button type="button" class="sus" data-s="'+i+'"><b>'+esc(s.name)+'</b><small>'+esc(cap(s.rel))+'</small><div class="tags">'+ATK.map(function(k){return "<i>"+esc(D.AT[k].s[s.tr[k]])+"</i>"}).join("")+'</div></button>'}).join("")+'</div>'+
    '<div class="eyebrow">'+T.acLiar+'</div><div class="list" id="vW">'+c.wits.map(function(w,i){return '<button type="button" class="sus" data-w="'+i+'"><b>'+esc(cap(w.name))+'</b><small>“'+esc(witText(w))+'”</small></button>'}).join("")+'</div>'+
    '<button type="button" class="btn red" id="vGo">'+T.acGo+'</button><p class="note" id="vMsg" style="color:#a5392c"></p><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;
    if(b.id==="shX")closeSheet();
    else if(b.dataset.s){ps=+b.dataset.s;$$("#vS .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.dataset.w){pw=+b.dataset.w;$$("#vW .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.id==="vGo"){if(ps==null||pw==null){$("#vMsg").textContent=T.acNeed;return}G.tries++;save();
      if(ps===c.K&&pw===c.Li)win();else{$("#vMsg").textContent=T.wrong+(G.tries>1?" "+T.wrongTries:"");buzz(150);beep(180,.25)}}}}
function win(){var c=G.c,min=(Date.now()-G.t0)/60000,s2=G.tries===1&&!G.skips,s3=min<=G.par,stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="out",min:min,km:0,title:c.V,code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.fj.day=MW.today();MW.profile.save(p)}
  buzz([100,50,100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);
  var st=a.prof.streak,ph=G.ph.slice(),code=G.code;
  sheet('<div class="eyebrow">'+T.won+' · '+esc(code)+'</div><div class="stars">'+"★".repeat(stars)+"☆".repeat(3-stars)+'</div><h2>'+esc(c.sus[c.K].name)+'</h2><p>'+esc(fill(D.END,vars()))+'</p>'+
    '<canvas id="strip" width="1080" height="1350" style="width:100%;height:auto;border-radius:3px;box-shadow:0 10px 24px rgba(0,0,0,.35)"></canvas>'+
    '<div class="tags"><i>'+Math.round(min)+' min</i><i>'+fill(T.pts,{x:xp})+'</i>'+(G.mode==="out"?'<i>'+fill(st===1?T.streakTxt:T.streakTxtP,{n:st})+'</i>':'')+'</div>'+
    (a.up?'<p><b>'+esc(fill(T.up,{r:MW.profile.rankName(a.prof.xp,L)}))+'</b></p>':'')+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+fill(T.missed2,{m:G.par})+'</p>':'')+
    '<button type="button" class="btn" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#strip");drawStrip(cv,ph,code,stars,Math.round(min));
  var txt=fill(T.shareTxt,{c:code,s:"★".repeat(stars),m:Math.round(min)})+location.origin+location.pathname+"#z="+code;
  $("#vShare").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],"fotojacht-"+code+".jpg",{type:"image/jpeg"});
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:txt}).catch(function(){})}
      else if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}},"image/jpeg",.85)};
  $("#vDl").onclick=function(){var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.85);a.download="fotojacht-"+code+".jpg";document.body.appendChild(a);a.click();a.remove()};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
/* bewijsstrook: acht polaroids op donker papier, met handgeschreven onderschriften */
function drawStrip(cv,ph,code,stars,min){var g=cv.getContext("2d"),W=cv.width,H=cv.height,slots=G.c.slots;
  var draw=function(){g.fillStyle="#141b26";g.fillRect(0,0,W,H);var gr=g.createRadialGradient(W*.5,H*.1,40,W*.5,H*.1,W*.9);gr.addColorStop(0,"rgba(240,166,58,.22)");gr.addColorStop(1,"rgba(240,166,58,0)");g.fillStyle=gr;g.fillRect(0,0,W,H);
    g.fillStyle="#f0a63a";g.font="400 64px 'Special Elite','Courier New',monospace";g.textAlign="center";g.fillText(L==="nl"?"DE FOTOJACHT":"THE PHOTO HUNT",W/2,96);
    g.fillStyle="#cdb98f";g.font="500 30px 'Barlow Condensed','Arial Narrow',sans-serif";g.fillText(fill(T.stripT,{c:code}).toUpperCase()+"   "+"★".repeat(stars)+"☆".repeat(3-stars)+"   "+min+" MIN",W/2,146);
    var pw=250,phh=330,imgH=240,cols=4,gx=(W-cols*pw)/(cols+1),top=250;
    ph.forEach(function(src,i){var col=i%cols,row=Math.floor(i/cols),x=gx+col*(pw+gx),y=top+row*520+(col%2?26:0),rot=((i*7919)%11-5)*.018;
      g.save();g.translate(x+pw/2,y+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);
      g.shadowColor="rgba(0,0,0,.55)";g.shadowBlur=24;g.shadowOffsetY=10;g.fillStyle="#f3ede0";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
      var im=IMG[i];if(im){var s=Math.max((pw-40)/im.width,imgH/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(20,20,pw-40,imgH);g.clip();g.drawImage(im,20+(pw-40-w)/2,20+(imgH-h)/2,w,h);g.restore()}
      g.fillStyle="#2b2a2a";g.font="600 24px 'Caveat',cursive";g.textAlign="center";g.fillText((i+1)+". "+slots[i].what,pw/2,phh-32,pw-24);g.restore()});
    g.fillStyle="#7f8aa3";g.font="500 24px 'Barlow Condensed','Arial Narrow',sans-serif";g.textAlign="center";g.fillText(T.stripSub,W/2,H-30)};
  var IMG=[],left=ph.length;if(!left)return draw();
  ph.forEach(function(src,i){var im=new Image();im.onload=im.onerror=function(){IMG[i]=im.width?im:null;if(--left===0)draw()};im.src=src});
  try{document.fonts.load("600 30px Caveat").then(function(){if(!left)draw()})}catch(e){}}
function endCase(){LS.del(GK);G=null;home()}

/* ---------- zaakcode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note" id="dMsg" style="color:#a5392c"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();start(p.seed,p.mode,false)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.fj,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
  sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min</small><div class="tags"><i>'+st(x.st)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();G=null;home()}
function wipeGame(){LS.del(GK);G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);MW.profile.wipe();if(/github\.io$/.test(location.hostname))LS.del(MW.pro.freeKey(ID));/* alleen op de testsite: gratis zaak ook terugzetten */closeSheet();home();toast(T.wiped)})}}
function goBack(){if(!$("#sheet").hidden){if($("#sheet").dataset.lock){var x=$("#vHome")||$("#shX");if(x)x.click()}else closeSheet();return true}
  if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({fj:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({fj:1},"")}catch(e){}}})}catch(e){}

/* ---------- startscherm: regen ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,drops=[],dpr=1;
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;drops=[];for(var i=0;i<(still?0:90);i++)drops.push([Math.random()*w,Math.random()*h,8+Math.random()*14,.3+Math.random()*.5])}
  rs();addEventListener("resize",rs);
  function f(){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);if($("#home").hidden){requestAnimationFrame(f);return}
    g.strokeStyle="rgba(236,214,180,.15)";g.lineWidth=1;for(var i=0;i<drops.length;i++){var d=drops[i];g.beginPath();g.moveTo(d[0],d[1]);g.lineTo(d[0]-2,d[1]+d[2]);g.stroke();d[1]+=d[2]*d[3]*1.6;d[0]-=.4*d[3];if(d[1]>h){d[1]=-20;d[0]=Math.random()*w}}
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
hero();
/* ---------- start ---------- */
var hz=/[#&]z=([A-Z0-9]+)/i.exec(location.hash);
home();if(hz){var pc=parseCode(hz[1]);if(pc)codeSheet(hz[1].toUpperCase())}
MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
})();
