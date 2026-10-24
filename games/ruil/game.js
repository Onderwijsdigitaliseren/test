/* De Ruil / The Swap – kinderwandeling voor feestjes. Spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js, walk.js, onnxruntime (shared/ort), games/fotojacht/model/labels.js en DR_DATA (data-xx.js).
   De Kraai heeft het cadeau; acht keer ruil je een foto tegen een bericht. Drie versprekingen (bewijs, altijd waar), vier beweringen (één leugen), één plaagbericht.
   Drie kenmerken wijzen samen precies één van vijf buurtfiguren aan (zelfde generator als De Fotojacht).
   Drie standen: "map" (kaart + gps, de ruilpunten zijn echte plekken), "street" (buiten zonder kaart), "in" (binnen). De foto-opdracht is in alle standen dezelfde. */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.DR_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="dr",GK="ss_game_dr_"+L,WK="ss_ways_dr_"+L,hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,closeSheet=Wk.closeSheet,buzz=Wk.buzz,beep=Wk.beep;
var G=null,tick=0,MODE=LS.get("ss_dr_mode","map"),NAME=LS.get("ss_dr_name","");
var ATK=["hoofd","rit","dier"],NS=5,ALL=31,ORDER=["e0","w0","e1","w1","e2","w2","g","w3"];
var W=[],P={x:0,y:0,acc:0},R0=550,map=null,sel=null,arrived=null,lastT=0,cur=null;

/* ---------- hulpjes ---------- */
function bits(m){var n=0;while(m){n+=m&1;m>>=1}return n}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function ico(id,cls){return '<svg class="'+(cls||"ico")+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(D.ICON[id]||"M4 4h16v16H4z")+'"/></svg>'}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function cadeau(){return NAME?fill(D.CADEAU,{J:NAME}):D.CADEAU0}
/* de Kraai als klein SVG-plaatje (tot er een eigen tekening is) */
var KRAAI='<svg class="kraai" viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="34" cy="40" rx="18" ry="14" fill="#15121f"/><circle cx="24" cy="24" r="11" fill="#15121f"/><path d="M14 25l-11 3 11 2z" fill="#f0b429"/><circle cx="26" cy="22" r="3.2" fill="#fff"/><circle cx="26.8" cy="22.4" r="1.6" fill="#15121f"/><path d="M19 17l9 2" stroke="#15121f" stroke-width="2.4" stroke-linecap="round"/><path d="M48 36l14-8-6 12z" fill="#15121f"/><path d="M28 52l-2 8M38 52l2 8" stroke="#f0b429" stroke-width="2.4" stroke-linecap="round"/><circle cx="40" cy="36" r="3" fill="#d4ff3a"/></svg>';
function bubble(txt,who,cls){return '<div class="msg '+(cls||"")+'">'+KRAAI+'<div class="bub">'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+esc(txt)+'</p></div></div>'}

/* ---------- ruilgenerator ---------- */
function genCase(seed,mode){
  var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  for(var tries=0;tries<4000;tries++){
    var pool=shuffle(D.SUS,r).slice(0,NS),sus=pool.map(function(s){var tr={};ATK.forEach(function(k){tr[k]=Math.floor(r()*3)});return{name:s[0],rel:s[1],q:s[2],tr:tr}});
    var K=Math.floor(r()*NS);
    var ev=ATK.map(function(k){var v=sus[K].tr[k],m=0;sus.forEach(function(s,j){if(s.tr[k]===v)m|=1<<j});return{k:k,v:v,m:m}});
    if(ev.some(function(x){return bits(x.m)<2}))continue;
    if(ev.reduce(function(a,x){return a&x.m},ALL)!==1<<K)continue;
    if(tries<2500&&(bits(ev[0].m&ev[1].m)<2||bits(ev[0].m&ev[2].m)<2||bits(ev[1].m&ev[2].m)<2))continue;
    // vier beweringen: drie waar, één gelogen
    var Li=Math.floor(r()*4),claims=[0,1,2,3].map(function(i){var k=ATK[i%3],v=sus[K].tr[k];if(i===Li)v=(v+1+Math.floor(r()*2))%3;return{k:k,v:v,lie:i===Li,t:pick(D.WIT[k])}});
    // acht opdrachten: vijf plekken + drie groepsfoto's, de eerste ruil altijd een groepsfoto
    var places=shuffle(mode==="in"?D.IN:D.OUT,r).slice(0,5),groups=shuffle(D.GROUP,r).slice(0,3),tasks=shuffle(places.concat(groups.slice(1)),r);tasks.unshift(groups[0]);
    var slots=ORDER.map(function(o,i){var t=tasks[i],s={id:t[0],what:t[1],ask:t[2],hint:t[3],react:t[4],cls:t[5]||[]};
      if(o==="g"){s.kind="gag";s.t=pick(D.GAG)}
      else if(o[0]==="e"){var e=ev[+o[1]];s.kind="ev";s.k=e.k;s.v=e.v;s.t=pick(D.EV[e.k][e.v])}
      else{s.kind="claim";s.w=+o[1]}
      return s});
    return{sus:sus,K:K,claims:claims,Li:Li,slots:slots,ev:ev}
  }
  return null}
function makeCode(seed,mode){return"DR"+(mode==="in"?"B":mode==="map"?"K":"S")+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);if(!/^DR[KSB]/.test(c)||c.length<4||c.length>11)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;return{mode:c[2]==="B"?"in":c[2]==="K"?"map":"street",seed:seed}}
function vars(){var c=G.c,k=c.sus[c.K];return{K:k.name,KR:k.rel,KJ:D.AT.hoofd.v[k.tr.hoofd],KW:D.AT.rit.v[k.tr.rit],KD:D.AT.dier.v[k.tr.dier],J:NAME,C:cadeau()}}
function claimText(w){return fill(w.t,{v:D.AT[w.k].v[w.v]})}
function done(){return G.ph.filter(Boolean).length}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get(),t=MW.t(L);
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.dr&&p.games.dr.n)||0;
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(),lk=MW.pro.locked(ID),playedToday=(p.games.dr&&p.games.dr.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;
  $("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  $("#name").value=NAME;
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});
  show("home")}
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro")+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MODE=b.dataset.m;LS.set("ss_dr_mode",MODE);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_dr_name",NAME)});
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(hashStr("dr|"+MODE+"|"+MW.today()),MODE,true)};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(Math.floor(Math.random()*4e9),MODE,false)};
$("#bPro").onclick=proSheet;
$("#bResume").onclick=function(){G=LS.get(GK,null);if(!G)return home();W=LS.get(WK,[]);P={x:G.px||0,y:G.py||0,acc:0};enter()};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};

/* ---------- een ruil beginnen ---------- */
function begin(seed,mode,daily){if(mode!=="map")return build(seed,mode,null,null,null,daily);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      build(seed,"map",w.pois,w.ways,w.origin,daily);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})})
  }).catch(function(e){Wk.loading("");fail(e==="nogps"?T.noGps:T.denied)})}
function fail(m){sheet('<h2>'+T.fail+'</h2><p>'+esc(m)+'</p><button type="button" class="btn" id="shX">'+T.back+'</button>');$("#shX").onclick=closeSheet}
function build(seed,mode,pois,ways,origin,daily){
  var c=genCase(seed,mode);if(!c){toast("…");return}
  G={seed:seed,code:makeCode(seed,mode),mode:mode,c:c,i:0,ph:[],t0:0,tries:0,daily:!!daily,par:mode==="in"?35:70,shown:false,seen:[],skips:0,dist:0,origin:origin,px:0,py:0,st:null};
  if(mode==="map"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,R0,8,r,T.corner);
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het|the) /,"")),fi:i,done:false}});
    W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  brief()}
function brief(){var c=G.c;
  $("#bfNo").textContent=fill(T.briefNo,{c:G.code});
  $("#bfOpen").innerHTML=bubble(fill(D.OPEN,{C:cadeau()}),null,"big");
  $("#bfSus").innerHTML=c.sus.map(susCard).join("");
  $("#bfTip").textContent=T.codeTip;
  show("brief")}
function susCard(s,i,pick){return '<'+(pick?'button type="button"':'div')+' class="sus"'+(pick?' data-s="'+i+'"':'')+'><b>'+esc(s.name)+'</b><small>'+esc(cap(s.rel))+' · '+esc(s.q)+'</small><div class="tags">'+ATK.map(function(k){return "<i>"+esc(D.AT[k].s[s.tr[k]])+"</i>"}).join("")+'</div></'+(pick?'button':'div')+'>'}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode!=="in")MW.pro.setFree(ID)}save();enter()};
$("#bBack").onclick=function(){G=null;home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}

/* ---------- spelen zonder kaart: kaartjes ---------- */
function enter(){mlWarm();if(G.mode==="map")enterMap();else{show("cards");render()}}
function hud(){if(!G)return;var n=done();$("#hT").textContent=mmss(Date.now()-G.t0);$("#hS").textContent=n+"/8";$("#hG").textContent=G.c.slots.filter(function(s,i){return G.ph[i]&&s.kind!=="gag"}).length+"/7"}
function render(){hud();var i=G.i,box=$("#card");
  if(i>=8){box.innerHTML='<div class="pol done"><div class="grid">'+G.ph.map(function(p){return '<img src="'+p+'" alt="">'}).join("")+'</div></div>'+bubble(T.radarAll)+'<button type="button" class="btn red" id="bAcc">'+T.last+'</button>';$("#bAcc").onclick=accuseSheet;return}
  var s=G.c.slots[i];
  box.innerHTML='<div class="pol empty"><div class="ph">'+ico(s.id,"big")+'</div><p class="cap">'+esc(fill(T.task,{i:i+1}))+'</p></div>'+bubble(s.ask,T.wants)+'<button type="button" class="btn" id="bOpen">📷 '+T.shoot+'</button>';
  $("#bOpen").onclick=function(){ruilSheet(i)}}

/* ---------- spelen met kaart ---------- */
function enterMap(){show("play");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return R0},
    theme:{bg:"#1a1433",water:"#162a4a",waterEdge:"#2f5a8a",ripple:"rgba(120,170,230,.18)",park:"#173a2e",parkEdge:"#2b6b4f",river:"#1f3f66",major:"#5a4f86",minor:"#2c2550",road:"#3b3268",label:"#b9a8ff",waterLabel:"#7fb2ff",ring:"rgba(212,255,58,.3)",me:"#d4ff3a",meHalo:"rgba(212,255,58,.14)",meRing:"rgba(212,255,58,.6)",font:"700 12px 'Fredoka','Barlow Condensed',sans-serif"},
    items:items,onTap:function(hit){sel=hit&&!hit.ref.done?hit.ref:null;chip()}});
  map.resize();map.fit(R0);sel=null;arrived=null;$("#chip").hidden=true;
  Wk.stopWatch();Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d});
  requestAnimationFrame(loop)}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[];
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/500+s.fi)*3;
    if(!s.done&&!api.still){cx.strokeStyle="#ff4fa3";cx.globalAlpha=.6-((t/1500)%1)*.6;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*20,0,7);cx.stroke();cx.globalAlpha=1}
    Wk.badge(cx,X,Y+bob*.3,"cam",s.done?"#5f7090":"#ff4fa3",1,s.done);
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,26,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#8d86a8":"#fff";cx.shadowColor="#000";cx.shadowBlur=6;if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+36);cx.shadowBlur=0}})});
  return it}
function loop(t){if($("#play").hidden||!G)return;map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tickMap()}requestAnimationFrame(loop)}
function tickMap(){var el=Math.floor((Date.now()-G.t0)/1000),n=done();
  $("#mT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#mS").textContent=n+"/8";$("#mD").textContent=(G.dist/1000).toFixed(1).replace(".",L==="nl"?",":".");
  var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});
  $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);beep(660,.2)}if(!here)arrived=null;
  chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel);
  $("#cName").textContent=sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=T.here;
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))ruilSheet(sel.fi,sel);else if(dTo(sel)<150){G.force=sel;ruilSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mPeople").onclick=susSheet;$("#mAcc").onclick=function(){if(done()>=8)accuseSheet();else noteSheet()};
$("#bNote").onclick=noteSheet;$("#bPeople").onclick=susSheet;$("#bAcc2").onclick=function(){if(done()>=8)accuseSheet();else noteSheet()};

/* ---------- de ruil zelf: opdracht → foto → antwoord van De Kraai ---------- */
function ruilSheet(i,spot){var s=G.c.slots[i];cur={i:i,spot:spot||null};
  var n=done()+1;
  sheet('<div class="eyebrow">'+esc(fill(T.task,{i:n}))+(spot?' · '+esc(spot.name):'')+'</div>'+bubble(s.ask,T.wants)+
    '<div class="task"><div class="ph">'+ico(s.id,"big")+'</div><div><h2>'+esc(cap(s.what))+'</h2><p class="hint" id="hint">'+(G.seen[i]?esc(s.hint):'')+'</p>'+(G.seen[i]?'':'<button type="button" class="btn ghost sm dk" id="bHint">'+T.hint2+'</button>')+'</div></div>'+
    '<label class="btn cam" for="file">📷 '+T.shoot+'</label><p class="note" id="pMsg"></p><p class="note" id="mlSt"></p><p class="note">'+esc(T.camNote)+'</p>'+
    '<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){G.force=null;closeSheet()};
  var bh=$("#bHint");if(bh)bh.onclick=function(){$("#hint").textContent=s.hint;bh.hidden=true;G.seen[i]=1;save()};
  mlWarm()}
function accept(seen){var i=cur.i,s=G.c.slots[i];G.ph[i]=cur.thumb;if(cur.spot)cur.spot.done=true;G.force=null;G.miss=0;if(G.mode!=="map")G.i=i+1;save();buzz([40,30,80]);beep(520,.15);
  var kind=s.kind,head=kind==="ev"?T.slip:kind==="claim"?T.claim:T.gag,sub=kind==="ev"?T.slipT:kind==="claim"?T.claimT:"",txt=kind==="claim"?claimText(G.c.claims[s.w]):s.t,n=done();
  sheet('<div class="eyebrow">'+esc(fill(T.task,{i:n}))+' · '+esc(T.reply)+'</div><div class="pol"><img src="'+cur.thumb+'" alt=""><p class="cap">'+esc(s.what)+(seen?' · '+esc(seen):'')+'</p></div>'+
    bubble(s.react,null,"small")+'<div class="rep k-'+kind+'"><em>'+esc(head)+'</em>'+bubble(txt)+(sub?'<p class="note">'+esc(sub)+'</p>':'')+'</div>'+
    '<button type="button" class="btn" id="bNext">'+(n>=8?T.last:T.next)+'</button>',true);
  if(kind==="ev"){buzz([60,40,60,40,120])}
  $("#bNext").onclick=function(){closeSheet();sel=null;cur=null;if(G.mode==="map"){chip();if(n>=8)accuseSheet()}else{render();if(n>=8)accuseSheet()}}}

/* ---------- beeldherkenning (zelfde aanpak als De Fotojacht; model wordt gedeeld) ---------- */
var ML={sess:null,busy:null,dead:false};
function mlLoad(){if(ML.sess)return Promise.resolve(ML.sess);if(ML.busy)return ML.busy;if(ML.dead||!window.ort)return Promise.reject("noml");
  try{ort.env.wasm.wasmPaths=new URL(MW.root+"shared/ort/",location.href).href;ort.env.wasm.numThreads=1}catch(e){}
  ML.busy=ort.InferenceSession.create(MW.root+"games/fotojacht/model/mobilenetv2.onnx",{executionProviders:["wasm"]}).then(function(x){ML.sess=x;ML.busy=null;return x},function(e){ML.dead=true;ML.busy=null;throw e});
  return ML.busy}
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
function mlMatch(res,cls){var best=0,sum=0;cls.forEach(function(k){var p=res.p(k);sum+=p;if(p>best)best=p});return{best:best,sum:sum,ok:best>=.10||sum>=.18}}
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f||!G||!cur)return;var msg=$("#pMsg");if(!msg)return;msg.textContent=T.checking;
  if(f.lastModified&&Math.abs(Date.now()-f.lastModified)>5*60000){msg.textContent=T.tooOld;buzz(120);return}
  var url=URL.createObjectURL(f),im=new Image();im.onload=function(){URL.revokeObjectURL(url);
    var w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,360/Math.max(w,h)),cv=document.createElement("canvas");cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);var g=cv.getContext("2d");g.drawImage(im,0,0,cv.width,cv.height);
    var d=g.getImageData(0,0,cv.width,cv.height).data,sum=0,n=0;for(var i=0;i<d.length;i+=16){sum+=d[i]*.3+d[i+1]*.59+d[i+2]*.11;n++}
    if(sum/n<14){msg.textContent=T.tooDark;buzz(120);return}
    cur.thumb=cv.toDataURL("image/jpeg",.7);var s=G.c.slots[cur.i];
    if(!s.cls||!s.cls.length)return accept();
    msg.textContent=T.mlCheck;
    classify(im).then(function(res){var m=mlMatch(res,s.cls),top=res.top[0];
      if(m.ok)return accept(fill(T.mlYes,{x:mlLabel(top.i)}));
      G.miss=(G.miss||0)+1;save();buzz(120);beep(180,.2);
      msg.textContent=fill(T.mlNo,{x:mlLabel(top.i),w:s.what});
      if(G.miss>=3&&!$("#bSkip")){var b=document.createElement("button");b.type="button";b.id="bSkip";b.className="btn ghost sm dk";b.textContent=T.mlSkip;msg.parentNode.insertBefore(b,msg.nextSibling);
        b.onclick=function(){G.skips=(G.skips||0)+1;G.miss=0;toast(T.mlSkipped);accept()}}
    },function(){msg.textContent=T.mlFail;accept()})};
  im.onerror=function(){URL.revokeObjectURL(url);msg.textContent=T.noFile};im.src=url});
function mlWarm(){if(ML.sess||ML.dead)return;var st=$("#mlSt");if(st)st.textContent=T.mlLoad;mlLoad().then(function(){var e=$("#mlSt");if(e)e.textContent=T.mlOk;setTimeout(function(){var e=$("#mlSt");if(e&&e.textContent===T.mlOk)e.textContent=""},2500)},function(){var e=$("#mlSt");if(e)e.textContent=T.mlFail})}

/* ---------- ruilboekje, verdachten, menu ---------- */
function noteSheet(){var ev=[],cl=[];G.c.slots.forEach(function(s,i){if(!G.ph[i])return;
    if(s.kind==="ev")ev.push('<div class="clue"><em>'+esc(s.what)+'</em><p>'+esc(s.t)+'</p></div>');else if(s.kind==="claim")cl.push('<div class="clue"><em>'+esc(s.what)+'</em><p>'+esc(claimText(G.c.claims[s.w]))+'</p></div>')});
  sheet('<h2>'+T.notebook+'</h2>'+(ev.length||cl.length?'<div class="eyebrow">'+T.nbE+'</div><div class="list">'+(ev.join("")||'<p class="note">–</p>')+'</div><div class="eyebrow">'+T.nbW+'</div><div class="list">'+(cl.join("")||'<p class="note">–</p>')+'</div>':'<p class="note">'+T.nbNone+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function susSheet(){sheet('<h2>'+T.people+'</h2><p class="note">'+T.peopleT+'</p><div class="list">'+G.c.sus.map(susCard).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function menuSheet(){sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button><button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- De Kraai pakken ---------- */
function accuseSheet(){var c=G.c,ps=null,pw=null;
  sheet('<h2>'+T.acH+'</h2><p>'+T.acT+'</p><div class="eyebrow">'+T.acWho+'</div><div class="list" id="vS">'+c.sus.map(function(s,i){return susCard(s,i,true)}).join("")+'</div>'+
    '<div class="eyebrow">'+T.acLiar+'</div><div class="list" id="vW">'+c.claims.map(function(w,i){return '<button type="button" class="sus" data-w="'+i+'"><small>'+esc(claimText(w))+'</small></button>'}).join("")+'</div>'+
    '<button type="button" class="btn red" id="vGo">'+T.acGo+'</button><p class="note err" id="vMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;
    if(b.id==="shX")closeSheet();
    else if(b.dataset.s){ps=+b.dataset.s;$$("#vS .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.dataset.w){pw=+b.dataset.w;$$("#vW .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.id==="vGo"){if(ps==null||pw==null){$("#vMsg").textContent=T.acNeed;return}G.tries++;save();
      if(ps===c.K&&pw===c.Li)win();else{$("#vMsg").textContent=T.wrong+(G.tries>1?" "+T.wrongTries:"");buzz(150);beep(180,.25)}}}}
function win(){var c=G.c,min=(Date.now()-G.t0)/60000,s2=G.tries===1&&!G.skips,s3=min<=G.par,stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:c.sus[c.K].name,code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.dr.day=MW.today();MW.profile.save(p)}
  Wk.stopWatch();buzz([100,50,100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);
  var st=a.prof.streak,ph=G.ph.slice(),code=G.code;
  sheet('<div class="eyebrow">'+T.won+' · '+esc(code)+'</div><div class="stars">'+"★".repeat(stars)+"☆".repeat(3-stars)+'</div><h2>'+esc(c.sus[c.K].name)+'</h2>'+bubble(fill(D.END,vars()),null,"big")+
    '<canvas id="strip" width="1080" height="1350" class="stripc"></canvas>'+
    '<div class="tags"><i>'+Math.round(min)+' min</i><i>'+fill(T.pts,{x:xp})+'</i>'+(G.mode==="map"?'<i>'+fill(st===1?T.streakTxt:T.streakTxtP,{n:st})+'</i>':'')+'</div>'+
    (a.up?'<p><b>'+esc(fill(T.up,{r:MW.profile.rankName(a.prof.xp,L)}))+'</b></p>':'')+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+fill(T.missed2,{m:G.par})+'</p>':'')+
    '<button type="button" class="btn" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#strip");drawStrip(cv,ph,code,stars,Math.round(min));
  var txt=fill(T.shareTxt,{c:code,s:"★".repeat(stars),m:Math.round(min)})+location.origin+location.pathname+"#z="+code;
  $("#vShare").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],"ruil-"+code+".jpg",{type:"image/jpeg"});
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:txt}).catch(function(){})}
      else if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}},"image/jpeg",.85)};
  $("#vDl").onclick=function(){var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.85);a.download="ruil-"+code+".jpg";document.body.appendChild(a);a.click();a.remove()};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
/* bewijsstrook: acht polaroids op paars papier met confetti */
function drawStrip(cv,ph,code,stars,min){var g=cv.getContext("2d"),W2=cv.width,H=cv.height,slots=G.c.slots,r=rngOf(G.seed);
  var draw=function(){g.fillStyle="#1a1433";g.fillRect(0,0,W2,H);
    for(var i=0;i<140;i++){g.fillStyle=["#d4ff3a","#ff4fa3","#f0b429","#7fb2ff"][i%4];g.save();g.translate(r()*W2,r()*H);g.rotate(r()*6.3);g.globalAlpha=.55;g.fillRect(-7,-3,14,6);g.restore()}
    g.fillStyle="#d4ff3a";g.font="700 72px 'Fredoka','Arial Rounded MT Bold',sans-serif";g.textAlign="center";g.fillText(L==="nl"?"DE RUIL":"THE SWAP",W2/2,100);
    g.fillStyle="#fff";g.font="600 30px 'Fredoka',sans-serif";g.fillText(fill(T.stripT,{c:code}).toUpperCase()+"   "+"★".repeat(stars)+"☆".repeat(3-stars)+"   "+min+" MIN",W2/2,150);
    var pw=250,phh=330,imgH=240,cols=4,gx=(W2-cols*pw)/(cols+1),top=250;
    ph.forEach(function(src,i){var col=i%cols,row=Math.floor(i/cols),x=gx+col*(pw+gx),y=top+row*520+(col%2?26:0),rot=((i*7919)%11-5)*.02;
      g.save();g.translate(x+pw/2,y+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);
      g.shadowColor="rgba(0,0,0,.5)";g.shadowBlur=24;g.shadowOffsetY=10;g.fillStyle="#fff8ee";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
      var im=IMG[i];if(im){var s=Math.max((pw-40)/im.width,imgH/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(20,20,pw-40,imgH);g.clip();g.drawImage(im,20+(pw-40-w)/2,20+(imgH-h)/2,w,h);g.restore()}
      g.fillStyle="#2b2340";g.font="700 26px 'Permanent Marker','Comic Sans MS',cursive";g.textAlign="center";g.fillText((i+1)+". "+slots[i].what,pw/2,phh-32,pw-24);g.restore()});
    g.fillStyle="#b9a8ff";g.font="600 24px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(T.stripSub,W2/2,H-30)};
  var IMG=[],left=ph.length;if(!left)return draw();
  ph.forEach(function(src,i){var im=new Image();im.onload=im.onerror=function(){IMG[i]=im.width?im:null;if(--left===0)draw()};im.src=src});
  try{document.fonts.load("700 30px 'Permanent Marker'").then(function(){if(!left)draw()})}catch(e){}}
function endCase(){LS.del(GK);G=null;home()}

/* ---------- ruilcode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();begin(p.seed,p.mode,false)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.dr,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
  sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min</small><div class="tags"><i>'+st(x.st)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();G=null;home()}
function wipeGame(){LS.del(GK);Wk.stopWatch();G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);MW.profile.wipe();if(/github\.io$/.test(location.hostname))LS.del(MW.pro.freeKey(ID));closeSheet();home();toast(T.wiped)})}}
function goBack(){if(!$("#sheet").hidden){if($("#sheet").dataset.lock){var x=$("#vHome")||$("#shX")||$("#bNext");if(x)x.click()}else closeSheet();return true}
  if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({dr:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({dr:1},"")}catch(e){}}})}catch(e){}

/* ---------- startscherm: dwarrelende veren en confetti ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,bits=[],dpr=1,COL=["#d4ff3a","#ff4fa3","#f0b429","#7fb2ff"];
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;bits=[];for(var i=0;i<(still?0:46);i++)bits.push({x:Math.random()*w,y:Math.random()*h,s:4+Math.random()*7,v:.25+Math.random()*.6,a:Math.random()*6.3,c:COL[i%4],f:i%5===0})}
  rs();addEventListener("resize",rs);
  function f(t){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);if($("#home").hidden){requestAnimationFrame(f);return}
    bits.forEach(function(b){g.save();g.translate(b.x,b.y);g.rotate(b.a+t/900);g.globalAlpha=b.f?.55:.35;g.fillStyle=b.f?"#15121f":b.c;
      if(b.f){g.beginPath();g.ellipse(0,0,b.s*1.8,b.s*.55,0,0,7);g.fill()}else g.fillRect(-b.s/2,-b.s/4,b.s,b.s/2);g.restore();
      b.y+=b.v;b.x+=Math.sin(t/700+b.a)*.3;if(b.y>h+10){b.y=-10;b.x=Math.random()*w}});
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
hero();
/* ---------- start ---------- */
var hz=/[#&]z=([A-Z0-9]+)/i.exec(location.hash);
home();if(hz){var pc=parseCode(hz[1]);if(pc)codeSheet(hz[1].toUpperCase())}
MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
})();
