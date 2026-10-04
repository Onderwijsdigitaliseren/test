/* De Verdwijning / The Vanishing – spel-logica (taalonafhankelijk). Vereist platform.js, catalog.js, walk.js en VZ_DATA (data-xx.js). */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.VZ_DATA,T=D.T,L=D.lang,esc=MW.esc,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="vz",GK="ss_game_vz_"+L,WK="ss_ways_vz_"+L,rngOf=Wk.rngOf,shuffle=Wk.shuffle,hashStr=MW.hashStr;
var toast=Wk.toast,sheet=Wk.sheet,closeSheet=Wk.closeSheet,beep=Wk.beep,buzz=Wk.buzz;
var fill=function(s,o){return String(s).replace(/\{(\w+)\}/g,function(m,k){return o&&(k in o)?o[k]:m})};
var G=null,W=[],P={x:0,y:0,acc:0},R0=650,PAR=75,sel=null,walkTo=null,arrived=null,lastT=0,map=null,nearD=1e9;

/* ---------- zaakgenerator: alles waar, niets alleen afdoende ---------- */
var SCN=["T","F","V"],CTK=Object.keys(D.CT);
function minutes(h,m){return h*60+m}
function fmt(mi){return Math.floor(mi/60)+(L==="nl"?"."+String(mi%60).padStart(2,"0"):":"+String(mi%60).padStart(2,"0"))}
function genCase(seed){
  var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  var M=pick(D.MISSING),pr=D.PRON[M.g];
  for(var tries=0;tries<5000;tries++){
    // vijf contacten met unieke relatie, elk vijf eigenschappen
    var pool=shuffle(D.CONTACTS,r),con=[],rel={};
    for(var i=0;i<pool.length&&con.length<5;i++){if(rel[pool[i][1]])continue;rel[pool[i][1]]=1;var tr={};CTK.forEach(function(k){tr[k]=pick(D.CT[k].v)});con.push({name:pool[i][0],rel:pool[i][1],tr:tr})}
    var K=Math.floor(r()*5),S=Math.floor(r()*3);
    // drie eigenschapssporen: elk past bij ≥2 mensen, samen alleen bij K; liefst geen twee die al volstaan
    var keys=shuffle(CTK,r).slice(0,3),cm=keys.map(function(k){var v=con[K].tr[k],m=0;con.forEach(function(c,j){if(c.tr[k]===v)m|=1<<j});return{k:k,v:v,m:m}});
    if(cm.some(function(x){return bits(x.m)<2}))continue;
    var all=cm.reduce(function(a,x){return a&x.m},31);if(all!==1<<K)continue;
    var strict=tries<3000;if(strict&&(bits(cm[0].m&cm[1].m)<2||bits(cm[0].m&cm[2].m)<2||bits(cm[1].m&cm[2].m)<2))continue;
    // drie scenariosporen uit de twee paren waar S in zit, samen alleen S
    var s=SCN[S],pairs=D.SC.filter(function(c){return c.m.indexOf(s)>=0}),byPair={};pairs.forEach(function(c){(byPair[c.m]=byPair[c.m]||[]).push(c)});
    var pk=Object.keys(byPair);if(pk.length<2)continue;
    var sc=[pick(byPair[pk[0]]),pick(byPair[pk[1]])],third=pick(pairs.filter(function(c){return sc.indexOf(c)<0}));if(!third)continue;sc.push(third);
    var kinds={};var frags=[];
    cm.forEach(function(x){var opts=D.CT[x.k].clue[x.v],c=pick(opts.filter(function(o){return !kinds[o.k]}))||pick(opts);kinds[c.k]=(kinds[c.k]||0)+1;frags.push({k:c.k,t:c.t,who:x.m,what:7,trait:x.k})});
    sc.forEach(function(c){frags.push({k:c.k,t:c.t,who:31,what:mask(c.m)})});
    frags.push(Object.assign({who:31,what:7},pick(D.TIME)));
    frags=shuffle(frags,r);
    // tijdstippen: opener 20.05–20.40, daarna oplopend tot ca. 23.50
    var t0=minutes(20,5)+Math.floor(r()*35),span=minutes(23,50)-t0,times=[t0];for(i=1;i<8;i++)times.push(t0+Math.round(span*(i/7))+Math.floor((r()-.5)*10));
    frags.unshift({k:"open",t:D.OPEN,who:31,what:7});
    frags.forEach(function(f,i){f.tm=times[i]});
    var c={seed:seed,M:M,pr:pr,con:con,K:K,S:S,frags:frags};
    var sol=solve(c);if(sol.who===1<<K&&sol.what===1<<S)return c;
  }
  return null}
function bits(m){var n=0;while(m){n+=m&1;m>>=1}return n}
function mask(s){var m=0;for(var i=0;i<3;i++)if(s.indexOf(SCN[i])>=0)m|=1<<i;return m}
function solve(c){return{who:c.frags.reduce(function(a,f){return a&f.who},31),what:c.frags.reduce(function(a,f){return a&f.what},7)}}
function vars(c,extra){var o={N:c.M.n,P:c.pr.P,O:c.pr.O,S:c.pr.S,msg:c.M.msg,K:c.con[c.K].name,KR:c.con[c.K].rel};if(extra)for(var k in extra)o[k]=extra[k];return o}
function fragText(f){return fill(f.t,vars(G.c,{t:fmt(f.tm)}))}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get(),i=MW.profile.rank(p.xp),nx=MW.profile.next(p.xp),R=MW.profile.RANKS.nl[i][0],t=MW.t(L);
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.vz&&p.games.vz.n)||0;
  $("#pXp").style.width=(nx?Math.round((p.xp-R)/(nx[0]-R)*100):100)+"%";
  $("#pNext").textContent=nx?MW.fill(t.pts,{x:p.xp,n:nx[0]-p.xp,r:MW.profile.RANKS[L][i+1][1]}):MW.fill(t.ptsTop,{x:p.xp});
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(),lk=MW.pro.locked(ID),playedToday=(p.games.vz&&p.games.vz.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;
  $("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  show("home")}
function show(id){["home","brief","play"].forEach(function(s){$("#"+s).hidden=s!==id});if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro")+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;R0=+b.dataset.r;PAR=+b.dataset.par;$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
function setLen(short){var b=$$("#len button")[short?0:1];if(b)b.click()}
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();startGps(hashStr("vz|"+MW.today()),true)};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();startGps(Math.floor(Math.random()*4e9),false)};
$("#bPro").onclick=proSheet;
$("#bDemo").onclick=function(){var w=Wk.demoWorld(D.DEMO);build(Math.floor(Math.random()*4e9),"demo",w.pois,w.ways,null,false)};
$("#bResume").onclick=function(){G=LS.get(GK,null);W=LS.get(WK,[]);if(!G)return home();P={x:G.px||0,y:G.py||0,acc:0};R0=G.R;PAR=G.par;enter()};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};

/* ---------- wereld ophalen ---------- */
function fail(m){Wk.loading("");sheet('<h2>'+T.fail+'</h2><p>'+m+'</p><button type="button" class="btn" id="shX">'+T.back+'</button>');$("#shX").onclick=closeSheet}
function startGps(seed,daily){
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){
    var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){
      Wk.loading("");build(seed,"gps",w.pois,w.ways,w.origin,daily);var mine=G;
      w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})})
  }).catch(function(e){fail(e==="nogps"?T.noGps:T.denied)})}
function build(seed,mode,pois,ways,origin,daily){
  var c=genCase(seed);if(!c){toast(T.dBad);return}
  var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,R0,8,r,T.corner),used={},spare=D.SPARE.slice();
  // spoor 0 (laatste bericht) liefst bij café/halte/hoek; de rest willekeurig
  var ord=shuffle(spots,r),o0=ord.findIndex(function(p){return /cafe|halte|hoek|bankje/.test(p.type)});if(o0>0){var tmp=ord[0];ord[0]=ord[o0];ord[o0]=tmp}
  var st=ord.map(function(p,i){var f=c.frags[i],TY=D.TYPES[p.type]||D.TYPES.hoek,persona="";if(f.k==="wit"){persona=TY[1];if(used[persona])persona=spare.shift()||TY[1];used[persona]=1}
    return{x:p.x,y:p.y,type:p.type,name:p.name||cap(TY[0].replace(/^(de|het|the) /,"")),noun:TY[0],fi:i,persona:persona,done:false}});
  G={mode:mode,R:R0,par:PAR,seed:seed,c:c,st:st,t0:0,dist:0,tries:0,origin:origin,px:0,py:0,daily:!!daily,code:codeOf(PAR,seed),out:{},outS:{}};
  W=ways;P={x:0,y:0,acc:0};LS.set(WK,W);
  var v=vars(c);
  $("#bfNo").textContent=T.brief+" "+G.code+(mode==="demo"?" · "+T.demoCase:"");
  $("#bfTitle").textContent=c.M.n;$("#bfSub").textContent=T.missing+" · "+c.M.r;
  $("#bfText").textContent=fill(c.M.bio,v);
  $("#bfMsgH").textContent=fill(T.lastMsg,{t:fmt(c.frags[0].tm)});$("#bfMsg").textContent="“"+c.M.msg+"”";
  $("#bfConH").textContent=fill(T.contacts,v);
  $("#bfCon").innerHTML=c.con.map(function(k){return conCard(k,v)}).join("");
  show("brief")}
function conCard(k,v,cls){return '<div class="sus'+(cls||"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small><div class="tags">'+CTK.map(function(t){return"<i>"+esc(fill(D.CT[t].tag[k.tr[t]],v))+"</i>"}).join("")+'</div></div>'}
$("#bGo").onclick=function(){G.t0=Date.now();if(G.mode==="gps")MW.pro.setFree(ID);save();enter()};
$("#bBack").onclick=function(){G=null;home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}
function codeOf(par,seed){return"VZ"+(par<=40?"S":"L")+"-"+(seed>>>0).toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);if(!/^VZ[SL]/.test(c)||c.length<4||c.length>11)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;return{short:c[2]==="S",seed:seed}}

/* ---------- spelen ---------- */
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){return G.st.map(function(s){return{x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var f=G.c.frags[s.fi],bob=api.still?0:Math.sin(t/500)*3;
    if(f.k==="wit")api.ghost(cx,X,Y+(s.done?0:bob*.4),38,"#a6ead9",s.done?.3:.95);
    else{cx.save();cx.globalAlpha=s.done?.35:1;cx.fillStyle=f.k==="open"?"#d8503f":f.k==="cam"?"#c9a6ea":"#f0a63a";cx.translate(X,Y);cx.rotate(Math.PI/4);cx.fillRect(-9,-9,18,18);cx.restore();
      if(!s.done&&!api.still){cx.strokeStyle="rgba(240,166,58,"+(.6-((t/1500)%1)*.6)+")";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,12+((t/1500)%1)*16,0,7);cx.stroke()}}
    if(sel===s){cx.strokeStyle="#ece4d2";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,24,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#5f7090":"#ece4d2";if(api.V.s>=.4||sel===s)cx.fillText((s.done?"✓ "+fmt(f.tm)+" · ":"")+s.name.toUpperCase().slice(0,26),X,Y+40)}}})}
function enter(){
  show("play");if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return G?G.R:650},items:items,onTap:function(hit,w){
    if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(G.R);sel=null;walkTo=null;arrived=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="gps")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d});
  if(G.mode==="demo")toast(T.demoTip);
  requestAnimationFrame(loop)}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=90*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tick()}requestAnimationFrame(loop)}
function tick(){
  var el=Math.floor((Date.now()-G.t0)/1000),done=G.st.filter(function(s){return s.done}).length;
  $("#hT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#hS").textContent=done+"/8";$("#hG").textContent=done?fmt(Math.min.apply(null,G.st.filter(function(s){return s.done}).map(function(s){return G.c.frags[s.fi].tm}))):"–";$("#hD").textContent=(G.dist/1000).toFixed(1).replace(".",L==="nl"?",":".");
  var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});nearD=nd;
  $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);beep(660,.2)}if(!here)arrived=null;
  chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var f=G.c.frags[sel.fi],d=dTo(sel),ok=inRange(sel);
  $("#cName").textContent=sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=f.k==="wit"?fill(T.wit,{p:sel.persona}):T.here;
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))encounter(sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;encounter(sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
function sndUi(){$("#zS").style.opacity=Wk.sound()?1:.4;$("#zS").setAttribute("aria-pressed",Wk.sound()?"true":"false")}sndUi();
$("#zS").onclick=function(){Wk.sound(!Wk.sound());sndUi()};
$("#zM").onclick=menuSheet;$("#bNote").onclick=function(){noteSheet("route")};$("#bPeople").onclick=function(){noteSheet("people")};$("#bAcc").onclick=verdictSheet;

/* ---------- spoor openen: ingedrukt houden ---------- */
function encounter(s){walkTo=null;var f=G.c.frags[s.fi],wit=f.k==="wit";
  var b=sheet('<div class="eyebrow">'+esc(s.name)+(wit?" · "+esc(s.persona):" · "+esc(T.kinds[f.k]))+'</div><h2>'+esc(fill(T.found,{i:s.fi+1,t:fmt(f.tm)}))+'</h2><button type="button" class="btn hold" id="hold"><i></i><span>'+(wit?T.holdWit:T.hold)+'</span></button><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=closeSheet;var hb=$("#hold"),bar=hb.querySelector("i"),t0=0,raf=0,fin=false;
  var stop=function(){cancelAnimationFrame(raf);t0=0;bar.style.width="0%"};
  var go=function(){if(fin)return;var p=Math.min(1,(Date.now()-t0)/1200);bar.style.width=p*100+"%";if(p>=1){fin=true;s.done=true;G.force=null;buzz(200);beep(880,.35);save();reveal(s);return}raf=requestAnimationFrame(go)};
  hb.addEventListener("pointerdown",function(e){e.preventDefault();t0=Date.now();beep(330,.08);go()});["pointerup","pointercancel","pointerleave"].forEach(function(ev){hb.addEventListener(ev,function(){if(!fin)stop()})});
  hb.addEventListener("contextmenu",function(e){e.preventDefault()})}
function reveal(s){var f=G.c.frags[s.fi],v=vars(G.c);
  sheet('<div class="eyebrow">'+esc(T.kinds[f.k])+' · '+fmt(f.tm)+' '+(L==="nl"?"uur":"")+'</div><h2>'+esc(s.name)+'</h2><div class="clue'+(f.k==="wit"?" wit":"")+'"><em>'+(f.k==="wit"?esc(cap(s.persona)):esc(T.kinds[f.k]))+'</em><p>'+esc(fragText(f))+'</p></div>'+
    (f.k==="open"?'<p class="note">'+esc(fill(T.how[1],v))+'</p>':'')+'<button type="button" class="btn" id="shX">'+T.back+'</button>');
  $("#shX").onclick=function(){closeSheet();sel=null;chip();if(G.st.every(function(x){return x.done}))toast(T.radarAll)}}

/* ---------- notitieboek ---------- */
function noteSheet(tab){tab=tab||"route";var v=vars(G.c),fr=G.st.filter(function(s){return s.done}).sort(function(a,b){return G.c.frags[a.fi].tm-G.c.frags[b.fi].tm});
  var body=tab==="route"?(fr.length?'<div class="list">'+fr.map(function(s){var f=G.c.frags[s.fi];return '<div class="clue'+(f.k==="wit"?" wit":"")+'"><em>'+fmt(f.tm)+' · '+esc(s.name)+' · '+esc(T.kinds[f.k])+'</em><p>'+esc(fragText(f))+'</p></div>'}).join("")+'</div>':'<p class="note">'+T.nbNone+'</p>')
    :tab==="people"?'<div class="list">'+G.c.con.map(function(k,i){return '<button type="button" data-o="'+i+'" class="sus'+(G.out[i]?" out":"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small><div class="tags">'+CTK.map(function(t){return"<i>"+esc(fill(D.CT[t].tag[k.tr[t]],v))+"</i>"}).join("")+'</div></button>'}).join("")+'</div><p class="note">'+T.nbTip+'</p>'
    :'<div class="list">'+T.scn.map(function(s,i){return '<button type="button" data-s="'+i+'" class="sus'+(G.outS[i]?" out":"")+'"><b>'+esc(s[0])+'</b><small>'+esc(fill(s[1],v))+'</small></button>'}).join("")+'</div><p class="note">'+T.nbTip+'</p>';
  sheet('<div class="tabs"><button type="button" data-t="route" aria-selected="'+(tab==="route")+'">'+T.nbRoute+'</button><button type="button" data-t="people" aria-selected="'+(tab==="people")+'">'+T.nbPeople+'</button><button type="button" data-t="what" aria-selected="'+(tab==="what")+'">'+T.nbWhat+'</button></div>'+body+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.id==="shX")closeSheet();else if(b.dataset.t)noteSheet(b.dataset.t);else if(b.dataset.o){G.out[b.dataset.o]=!G.out[b.dataset.o];save();noteSheet("people")}else if(b.dataset.s){G.outS[b.dataset.s]=!G.outS[b.dataset.s];save();noteSheet("what")}}}

/* ---------- conclusie ---------- */
function verdictSheet(){var v=vars(G.c),ps=null,pw=null;
  sheet('<div class="eyebrow">'+T.close+'</div><h2>'+T.vH+'</h2><p>'+T.vT+'</p><div class="eyebrow">'+T.vWhat+'</div><div class="list" id="vS">'+T.scn.map(function(s,i){return '<button type="button" data-s="'+i+'" class="sus'+(G.outS[i]?" out":"")+'"><b>'+esc(s[0])+'</b><small>'+esc(fill(s[1],v))+'</small></button>'}).join("")+'</div>'+
    '<div class="eyebrow">'+T.vWho+'</div><div class="list" id="vW">'+G.c.con.map(function(k,i){return '<button type="button" data-w="'+i+'" class="sus'+(G.out[i]?" out":"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small></button>'}).join("")+'</div>'+
    '<button type="button" class="btn red" id="vGo">'+T.vGo+'</button><p class="note" id="vMsg" style="color:#a5392c"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;
    if(b.id==="shX")closeSheet();
    else if(b.dataset.s){ps=+b.dataset.s;$$("#vS .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.dataset.w){pw=+b.dataset.w;$$("#vW .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.id==="vGo"){if(ps==null||pw==null){$("#vMsg").textContent=T.vNeed;return}G.tries++;save();
      if(ps===G.c.S&&pw===G.c.K)win();else{$("#vMsg").textContent=T.wrong+(G.tries>1?" "+T.wrongTries:"");buzz(150);beep(180,.25)}}}}
function win(){var c=G.c,v=vars(c),min=(Date.now()-G.t0)/60000,s2=G.tries===1,s3=min<=G.par,stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50,km=G.dist/1000;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="gps",min:min,km:km,title:c.M.n,code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.vz.day=MW.today();MW.profile.save(p)}
  LS.del(GK);Wk.stopWatch();buzz([100,50,100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);
  var E=D.END[c.S],st=a.prof.streak;
  sheet('<div class="eyebrow">'+T.won+' · '+esc(G.code)+'</div><div class="stars">'+"★".repeat(stars)+"☆".repeat(3-stars)+'</div><h2>'+esc(T.scn[c.S][0])+' · '+esc(c.con[c.K].name)+'</h2><p>'+esc(fill(E[0],v))+'</p><p class="note">'+esc(fill(E[1],v))+'</p>'+
    '<div class="tags"><i>'+Math.round(min)+' min</i><i>'+km.toFixed(1).replace(".",L==="nl"?",":".")+' km</i><i>'+fill(T.pts,{x:xp})+'</i>'+(G.mode==="gps"?'<i>'+fill(st===1?T.streakTxt:T.streakTxtP,{n:st})+'</i>':'')+'</div>'+
    (a.up?'<p><b>'+esc(fill(T.up,{r:MW.profile.rankName(a.prof.xp,L)}))+'</b></p>':'')+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+fill(T.missed2,{m:G.par})+'</p>':'')+
    '<button type="button" class="btn ghost dk" id="vShare">'+T.share+'</button><button type="button" class="btn" id="vHome">'+T.toHome+'</button>',true);
  var code=G.code,stxt="★".repeat(stars),mm=Math.round(min);
  $("#vShare").onclick=function(){var url=location.origin+location.pathname+"#z="+code,txt=fill(T.shareTxt,{c:code,s:stxt,m:mm})+" "+url;
    if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}};
  $("#vHome").onclick=function(){closeSheet();G=null;home()}}

/* ---------- zaakcode, archief, menu, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note" id="dMsg" style="color:#a5392c"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();setLen(p.short);startGps(p.seed,false)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.vz,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
  sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min · '+String(x.km).replace(".",L==="nl"?",":".")+' km</small><div class="tags"><i>'+st(x.st)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();G=null;home()}
function wipeGame(){LS.del(GK);LS.del(WK);Wk.stopWatch();G=null;closeSheet();home();toast(T.wiped)}
function menuSheet(){sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mMap+'</button><button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);LS.del(WK);MW.profile.wipe();closeSheet();home();toast(T.wiped)})}}
function goBack(){if(!$("#sheet").hidden){var k=$("#mgSkip");if(k)k.click();else if($("#sheet").dataset.lock){var x=$("#shX")||$("#vHome");if(x)x.click()}else closeSheet();return true}
  if(!$("#load").hidden)return true;if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({vz:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({vz:1},"")}catch(e){}}})}catch(e){}


/* ---------- startscherm: regen en lantaarnlicht ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,drops=[],dpr=1;
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;drops=[];for(var i=0;i<(still?0:110);i++)drops.push([Math.random()*w,Math.random()*h,8+Math.random()*14,.3+Math.random()*.5])}
  rs();addEventListener("resize",rs);
  function f(){if($("#home").hidden){requestAnimationFrame(f);return}g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle="#101a2b";g.fillRect(0,0,w,h);
    var r=g.createRadialGradient(w*.5,h*.3,10,w*.5,h*.3,Math.max(w,h)*.7);r.addColorStop(0,"rgba(201,166,234,.14)");r.addColorStop(.4,"rgba(240,166,58,.04)");r.addColorStop(1,"rgba(16,26,43,0)");g.fillStyle=r;g.fillRect(0,0,w,h);
    g.strokeStyle="rgba(147,166,198,.18)";g.lineWidth=1;for(var i=0;i<drops.length;i++){var d=drops[i];g.beginPath();g.moveTo(d[0],d[1]);g.lineTo(d[0]-2,d[1]+d[2]);g.stroke();d[1]+=d[2]*d[3]*1.6;d[0]-=.4*d[3];if(d[1]>h){d[1]=-20;d[0]=Math.random()*w}}
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
hero();
/* ---------- start ---------- */
home();MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
var HZ=(location.hash||"").match(/z=([A-Za-z0-9-]+)/);if(HZ)codeSheet(HZ[1]);
if(typeof module!=="undefined")module.exports={genCase:genCase,solve:solve};
window.VZ={genCase:genCase,solve:solve,state:function(){return G}};
})();
