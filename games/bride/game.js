/* Tot de Dood Ons Scheidt / Till Death Do Us Part – spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js, walk.js, TD_DATA (data-xx.js) en de minipuzzels van De Verdwijning (games/vanishing/puzzles.js).
   Zelfde motor als De Verdwijning, met zes verdachten, een motief in plaats van een scenario, en de bruid als schim. */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.TD_DATA,T=D.T,L=D.lang,esc=MW.esc,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="td",GK="ss_game_td_"+L,WK="ss_ways_td_"+L,rngOf=Wk.rngOf,shuffle=Wk.shuffle,hashStr=MW.hashStr;
var toast=Wk.toast,sheet=Wk.sheet,beep=Wk.beep,buzz=Wk.buzz;function closeSheet(){if(window.mgStop)window.mgStop();Wk.closeSheet()}
var fill=function(s,o){return String(s).replace(/\{(\w+)\}/g,function(m,k){return o&&(k in o)?o[k]:m})};
var G=null,W=[],P={x:0,y:0,acc:0},R0=650,PAR=75,sel=null,walkTo=null,arrived=null,lastT=0,map=null,nearD=1e9;

/* ---------- zaakgenerator: alles waar, niets alleen afdoende ---------- */
var NP=6,ALL=(1<<NP)-1,SCN=D.SCN,CTK=Object.keys(D.CT);
function minutes(h,m){return h*60+m}
function fmt(mi){return Math.floor(mi/60)+(L==="nl"?"."+String(mi%60).padStart(2,"0"):":"+String(mi%60).padStart(2,"0"))}
function genCase(seed){
  var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  var M=pick(D.MISSING),pr=D.PRON[M.g];
  for(var tries=0;tries<5000;tries++){
    // zes gasten met unieke relatie, elk vijf eigenschappen
    var pool=shuffle(D.CONTACTS,r),con=[],rel={};
    for(var i=0;i<pool.length&&con.length<NP;i++){if(rel[pool[i][1]])continue;rel[pool[i][1]]=1;var tr={};CTK.forEach(function(k){tr[k]=pick(D.CT[k].v)});con.push({name:pool[i][0],rel:pool[i][1],q:pool[i][2]||"",tr:tr})}
    var K=Math.floor(r()*NP),S=Math.floor(r()*3);
    // drie eigenschapssporen: elk past bij ≥2 mensen, samen alleen bij K; liefst geen twee die al volstaan
    var keys=shuffle(CTK,r).slice(0,3),cm=keys.map(function(k){var v=con[K].tr[k],m=0;con.forEach(function(c,j){if(c.tr[k]===v)m|=1<<j});return{k:k,v:v,m:m}});
    if(cm.some(function(x){return bits(x.m)<2}))continue;
    var all=cm.reduce(function(a,x){return a&x.m},ALL);if(all!==1<<K)continue;
    var strict=tries<3000;if(strict&&(bits(cm[0].m&cm[1].m)<2||bits(cm[0].m&cm[2].m)<2||bits(cm[1].m&cm[2].m)<2))continue;
    // drie scenariosporen uit de twee paren waar S in zit, samen alleen S
    var s=SCN[S],pairs=D.SC.filter(function(c){return c.m.indexOf(s)>=0}),byPair={};pairs.forEach(function(c){(byPair[c.m]=byPair[c.m]||[]).push(c)});
    var pk=Object.keys(byPair);if(pk.length<2)continue;
    var sc=[pick(byPair[pk[0]]),pick(byPair[pk[1]])],third=pick(pairs.filter(function(c){return sc.indexOf(c)<0}));if(!third)continue;sc.push(third);
    var kinds={};var frags=[];
    cm.forEach(function(x){var opts=D.CT[x.k].clue[x.v],c=pick(opts.filter(function(o){return !kinds[o.k]}))||pick(opts);kinds[c.k]=(kinds[c.k]||0)+1;frags.push({k:c.k,t:c.t,who:x.m,what:7,trait:x.k})});
    sc.forEach(function(c){frags.push({k:c.k,t:c.t,who:ALL,what:mask(c.m)})});
    frags.push(Object.assign({who:ALL,what:7},pick(D.TIME)));
    frags=shuffle(frags,r);
    // tijdstippen: opener 20.05–20.40, daarna oplopend tot ca. 23.50
    var t0=minutes(20,5)+Math.floor(r()*35),span=minutes(23,50)-t0,times=[t0];for(i=1;i<8;i++)times.push(t0+Math.round(span*(i/7))+Math.floor((r()-.5)*10));
    frags.unshift({k:"open",t:D.OPEN,who:ALL,what:7});
    frags.forEach(function(f,i){f.tm=times[i]});
    var c={seed:seed,M:M,pr:pr,con:con,K:K,S:S,frags:frags};
    var sol=solve(c);if(sol.who===1<<K&&sol.what===1<<S)return c;
  }
  return null}
function bits(m){var n=0;while(m){n+=m&1;m>>=1}return n}
function mask(s){var m=0;for(var i=0;i<3;i++)if(s.indexOf(SCN[i])>=0)m|=1<<i;return m}
function solve(c){return{who:c.frags.reduce(function(a,f){return a&f.who},ALL),what:c.frags.reduce(function(a,f){return a&f.what},7)}}
function vars(c,extra){var o={N:c.M.n,P:c.pr.P,O:c.pr.O,S:c.pr.S,msg:c.M.msg,K:c.con[c.K].name,KR:c.con[c.K].rel};if(extra)for(var k in extra)o[k]=extra[k];return o}
function fragText(f){return fill(f.t,vars(G.c,{t:fmt(f.tm)}))}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}

/* ---------- de bruid: schaduwfiguur in lange jurk met sluier (zelfde tekenstijl als de schimmen van walk.js) ---------- */
function bride(c,x,y,s,col,al){c.save();c.globalAlpha=al;
  var h=c.createRadialGradient(x,y,s*.1,x,y,s*.95);h.addColorStop(0,"rgba(236,228,210,.26)");h.addColorStop(1,"rgba(236,228,210,0)");c.fillStyle=h;c.beginPath();c.arc(x,y,s*.95,0,7);c.fill();
  c.fillStyle="rgba(4,7,12,.6)";c.beginPath();c.ellipse(x+s*.2,y+s*.53,s*.6,s*.09,-.1,0,7);c.fill();
  c.lineJoin="round";c.lineCap="round";
  // sluier: valt van het hoofd tot voorbij de zoom, licht doorschijnend
  c.fillStyle="rgba(236,228,210,.16)";c.strokeStyle="rgba(236,228,210,.55)";c.lineWidth=Math.max(1,s*.02);
  c.beginPath();c.moveTo(x-s*.1,y-s*.56);c.quadraticCurveTo(x-s*.36,y-s*.2,x-s*.5,y+s*.5);c.lineTo(x+s*.5,y+s*.5);c.quadraticCurveTo(x+s*.36,y-s*.2,x+s*.1,y-s*.56);c.closePath();c.fill();c.stroke();
  // jurk: smal lijfje, lange uitlopende rok met sleep
  c.fillStyle="#05080e";c.strokeStyle=col;c.lineWidth=Math.max(1,s*.035);
  c.beginPath();c.moveTo(x-s*.08,y-s*.3);c.lineTo(x-s*.15,y-s*.26);c.lineTo(x-s*.1,y-s*.04);c.quadraticCurveTo(x-s*.2,y+s*.25,x-s*.36,y+s*.5);
  c.lineTo(x+s*.44,y+s*.5);c.quadraticCurveTo(x+s*.22,y+s*.25,x+s*.1,y-s*.04);c.lineTo(x+s*.15,y-s*.26);c.lineTo(x+s*.08,y-s*.3);c.closePath();c.fill();c.stroke();
  // hoofd met opgestoken haar
  c.beginPath();c.arc(x,y-s*.42,s*.12,0,7);c.fill();c.stroke();
  c.beginPath();c.arc(x,y-s*.56,s*.06,0,7);c.fill();c.stroke();
  // boeket
  c.fillStyle=col;c.beginPath();c.arc(x,y-s*.02,s*.05,0,7);c.arc(x-s*.05,y+s*.02,s*.04,0,7);c.arc(x+s*.05,y+s*.02,s*.04,0,7);c.fill();
  c.restore()}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get(),i=MW.profile.rank(p.xp),nx=MW.profile.next(p.xp),R=MW.profile.RANKS.nl[i][0],t=MW.t(L);
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.td&&p.games.td.n)||0;
  $("#pXp").style.width=(nx?Math.round((p.xp-R)/(nx[0]-R)*100):100)+"%";
  $("#pNext").textContent=nx?MW.fill(t.pts,{x:p.xp,n:nx[0]-p.xp,r:MW.profile.RANKS[L][i+1][1]}):MW.fill(t.ptsTop,{x:p.xp});
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(),lk=MW.pro.locked(ID),playedToday=(p.games.td&&p.games.td.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;
  $("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  show("home")}
function show(id){["home","brief","play"].forEach(function(s){$("#"+s).hidden=s!==id});if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro")+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;R0=+b.dataset.r;PAR=+b.dataset.par;$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
function setLen(short){var b=$$("#len button")[short?0:1];if(b)b.click()}
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();startGps(hashStr("td|"+MW.today()),true)};
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
  var echo=[];(function(){var r2=rngOf(seed^0x85ebca6b);for(var i=0;i<3;i++){var a=st[Math.floor(r2()*st.length)],b=st[Math.floor(r2()*st.length)],f=.3+.4*r2(),x=r2(),tier=x<.08?3:x<.35?2:1,opts=D.ECHO.map(function(e,j){return j}).filter(function(j){return D.ECHO[j][1]===tier&&!echo.some(function(q){return q.id===j})});
    echo.push({x:Math.round(a.x+(b.x-a.x)*f+(r2()-.5)*120),y:Math.round(a.y+(b.y-a.y)*f+(r2()-.5)*120),id:opts[Math.floor(r2()*opts.length)],done:false,echo:true})}})();
  G={mode:mode,R:R0,par:PAR,seed:seed,c:c,st:st,echo:echo,t0:0,dist:0,tries:0,origin:origin,px:0,py:0,daily:!!daily,code:codeOf(PAR,seed),out:{},outS:{}};
  W=ways;P={x:0,y:0,acc:0};LS.set(WK,W);
  var v=vars(c);
  $("#bfNo").textContent=T.brief+" "+G.code+(mode==="demo"?" · "+T.demoCase:"");
  $("#bfTitle").textContent=c.M.n;$("#bfSub").textContent=T.missing+" · "+c.M.r;
  $("#bfText").textContent=fill(c.M.bio,v);
  $("#bfMsgH").textContent=fill(T.lastMsg,{t:fmt(c.frags[0].tm)});$("#bfMsg").textContent="“"+c.M.msg+"”";
  $("#bfConH").textContent=fill(T.contacts,v);
  $("#bfCon").innerHTML=c.con.map(function(k){return conCard(k,v)}).join("");$("#bfLie").textContent=T.quoteNote;
  show("brief")}
function conCard(k,v,cls){return '<div class="sus'+(cls||"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small>'+quote(k)+'<div class="tags">'+CTK.map(function(t){return"<i>"+esc(fill(D.CT[t].tag[k.tr[t]],v))+"</i>"}).join("")+'</div></div>'}
function quote(k){return k.q?'<p class="q">“'+esc(k.q)+'”</p>':''}
$("#bGo").onclick=function(){G.t0=Date.now();if(G.mode==="gps")MW.pro.setFree(ID);save();enter()};
$("#bBack").onclick=function(){G=null;home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}
function codeOf(par,seed){return"TD"+(par<=40?"S":"L")+"-"+(seed>>>0).toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);if(!/^TD[SL]/.test(c)||c.length<4||c.length>11)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;return{short:c[2]==="S",seed:seed}}

/* ---------- spelen ---------- */
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=G.st.map(function(s){return{x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var f=G.c.frags[s.fi],bob=api.still?0:Math.sin(t/500)*3;
    var col=KCOL[f.k]||"#f0a63a";
    if(f.k==="wit")api.ghost(cx,X,Y+(s.done?0:bob*.4),38,"#a6ead9",s.done?.3:.95);
    else if(f.k==="cam")bride(cx,X,Y+(s.done?0:bob*.4),44,"#e9c7d6",s.done?.25:.95);
    else{Wk.badge(cx,X,Y+(s.done?0:bob*.3),f.k,col,s.done?.4:1,s.done);}
    if(f.k!=="wit"){
      if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.6-((t/1500)%1)*.6;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*18,0,7);cx.stroke();cx.globalAlpha=1}}
    if(sel===s){cx.strokeStyle="#ece4d2";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,24,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#5f7090":"#ece4d2";if(api.V.s>=.4||sel===s)cx.fillText((s.done?"✓ "+fmt(f.tm)+" · ":"")+s.name.toUpperCase().slice(0,26),X,Y+40)}}});
  (G.echo||[]).forEach(function(q){if(q.done||dTo(q)>200)return;var tier=D.ECHO[q.id][1];it.push({x:q.x,y:q.y,ref:q,tap:true,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/400)*3,col=tier===3?"#f0a63a":tier===2?"#c9a6ea":"#ffffff";
    cx.save();cx.globalAlpha=api.still?.9:.55+.4*Math.abs(Math.sin(t/300));var g=cx.createRadialGradient(X,Y-bob,2,X,Y-bob,26);g.addColorStop(0,col);g.addColorStop(1,"rgba(0,0,0,0)");cx.fillStyle=g;cx.beginPath();cx.arc(X,Y-bob,26,0,7);cx.fill();
    Wk.icon(cx,"echo",X,Y-bob,18,col);cx.restore();
    cx.fillStyle="#ece4d2";cx.fillText(D.ECHOT.name,X,Y+36);if(sel===q){cx.strokeStyle="#ece4d2";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,24,0,7);cx.stroke()}}})});
  if(G.won&&G.epi&&!G.epi.done){var e=G.epi;it.push({x:e.x,y:e.y,ref:e,tap:true,draw:function(cx,X,Y,t,api){bride(cx,X,Y-(api.still?0:Math.sin(t/400)*3),50,"#e9c7d6",.6+.4*Math.abs(Math.sin(t/300)));cx.fillStyle="#c9a6ea";cx.fillText(PZ.epi.name.toUpperCase(),X,Y+44);if(sel===e){cx.strokeStyle="#ece4d2";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,26,0,7);cx.stroke()}}})}
  return it}
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
  $("#hT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#hS").textContent=done+"/8";$("#hG").textContent=(G.echo||[]).filter(function(q){return q.done}).length+"/3";$("#hD").textContent=(G.dist/1000).toFixed(1).replace(".",L==="nl"?",":".");
  var open=G.won?(G.epi&&!G.epi.done?[G.epi]:[]):G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});nearD=nd;
  var ec=(G.echo||[]).filter(function(q){return !q.done&&dTo(q)<=200}),ecNear=(G.echo||[]).some(function(q){return !q.done&&dTo(q)>200&&dTo(q)<=320});
  $("#radar").textContent=G.won?(near?fill(PZ.epi.radar,{d:Math.round(nd)}):T.radarAll):ecNear&&nd>60?D.ECHOT.radar:!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  open=open.concat(ec);var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);beep(660,.2)}if(!here)arrived=null;
  chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var epi=sel===G.epi,ech=!!sel.echo,f=epi||ech?null:G.c.frags[sel.fi],d=dTo(sel),ok=inRange(sel);
  $("#cName").textContent=epi?PZ.epi.name:ech?D.ECHOT.name:sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=epi?fill(PZ.epi.chip,vars(G.c)):ech?D.ECHOT.chip:f.k==="wit"?fill(T.wit,{p:sel.persona}):T.here;
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=epi?PZ.epi.act:ech?D.ECHOT.act:T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel)){if(sel===G.epi)epilogue();else if(sel.echo)echoPuzzle(sel);else encounter(sel)}else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;encounter(sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
function sndUi(){$("#zS").style.opacity=Wk.sound()?1:.4;$("#zS").setAttribute("aria-pressed",Wk.sound()?"true":"false")}sndUi();
$("#zS").onclick=function(){Wk.sound(!Wk.sound());sndUi()};
$("#zM").onclick=menuSheet;$("#bNote").onclick=function(){noteSheet("route")};$("#bPeople").onclick=function(){noteSheet("people")};$("#bAcc").onclick=function(){if(G.won)return toast(fill(PZ.epi.radar,{d:Math.round(dTo(G.epi))}));verdictSheet()};

/* ---------- spoor openen: puzzel per soort, camera voor camerabeelden ---------- */
var KCOL={open:"#d8503f",cam:"#e9c7d6",msg:"#a6ead9",obj:"#f0a63a",time:"#d9e0ee"};
var PZ=D.PZ,mg={raf:0,tm:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[]}};window.mgStop=function(){mg.stop()};
function puzzleKey(s){var f=G.c.frags[s.fi];return f.k==="open"?"hold":f.k==="cam"?"lamp":f.k==="wit"?"radio":f.k==="msg"?"pin":f.k==="obj"?(s.fi%2?"tiles":"dust"):"seq"}
function finish(s){mg.stop();s.done=true;G.force=null;buzz(200);beep(880,.35);save();reveal(s)}
function encounter(s){walkTo=null;var f=G.c.frags[s.fi];
  if(f.k==="cam"&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&G.cam!=="off"){if(G.cam==="on")return startAR(s);
    sheet('<div class="eyebrow">'+esc(s.name)+'</div><h2>'+esc(PZ.ar.h)+'</h2><p>'+esc(fill(PZ.ar.t,vars(G.c)))+'</p><button type="button" class="btn" id="arYes">'+PZ.ar.yes+'</button><button type="button" class="btn ghost dk" id="arNo">'+PZ.ar.no+'</button>');
    $("#arYes").onclick=function(){startAR(s)};$("#arNo").onclick=function(){G.cam="off";save();puzzle(s)};return}
  puzzle(s)}
function puzzle(s){var f=G.c.frags[s.fi],key=puzzleKey(s),wit=f.k==="wit";
  if(key==="hold")return holdSheet(s);
  var I=PZ[key];
  sheet('<div class="eyebrow">'+esc(s.name)+(wit?" · "+esc(s.persona):" · "+esc(T.kinds[f.k]))+' · '+esc(fill(T.found,{i:s.fi+1,t:fmt(f.tm)}))+'</div><h2>'+esc(I[0])+'</h2><p id="mgHint">'+esc(I[1])+'</p><div id="mgbox"></div><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=function(){mg.stop();closeSheet()};
  var box=$("#mgbox"),fin=false;
  var o={box:box,P:PZ,mg:mg,beep:beep,buzz:buzz,toast:toast,shuffle:shuffle,ghost:f.k==="cam"?bride:Wk.ghost,label:wit?fragText(f).slice(0,44)+"…":T.kinds[f.k]+" · "+fmt(f.tm),
    done:function(){if(fin)return;fin=true;$("#mgSkip").hidden=true;finish(s)},
    canvas:function(){box.innerHTML='<canvas class="sq" width="260" height="260"></canvas>';return box.firstChild},
    at:function(e,c){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*260,(e.clientY-b.top)/b.height*260]}};
  window.VZ_PUZ[key](o)}
function holdSheet(s){var f=G.c.frags[s.fi];
  sheet('<div class="eyebrow">'+esc(s.name)+' · '+esc(T.kinds[f.k])+'</div><h2>'+esc(fill(T.found,{i:s.fi+1,t:fmt(f.tm)}))+'</h2><button type="button" class="btn hold" id="hold"><i></i><span>'+T.hold+'</span></button><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=closeSheet;var hb=$("#hold"),bar=hb.querySelector("i"),t0=0,raf=0,fin=false;
  var stop=function(){cancelAnimationFrame(raf);t0=0;bar.style.width="0%"};
  var go=function(){if(fin)return;var p=Math.min(1,(Date.now()-t0)/1200);bar.style.width=p*100+"%";if(p>=1){fin=true;finish(s);return}raf=requestAnimationFrame(go)};
  hb.addEventListener("pointerdown",function(e){e.preventDefault();t0=Date.now();beep(330,.08);go()});["pointerup","pointercancel","pointerleave"].forEach(function(ev){hb.addEventListener(ev,function(){if(!fin)stop()})});
  hb.addEventListener("contextmenu",function(e){e.preventDefault()})}
/* camera: de gestalte in je eigen straat. Kompas via deviceorientation; zonder kompas veeg je om rond te kijken. */
var AR={on:false};
function startAR(s){closeSheet();var ar=$("#ar"),v=$("#arV"),c=$("#arC"),hint=$("#arH");
  var req=navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
  try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")DeviceOrientationEvent.requestPermission().catch(function(){})}catch(e){}
  req.then(function(stream){G.cam="on";save();AR.on=true;v.srcObject=stream;ar.hidden=false;var g=c.getContext("2d"),dpr=1,w=0,h=0,head=null,dragH=180,target=90+Math.random()*180,hold=0,last=0,fin=false,hasOri=false;
    var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=c.clientWidth;h=c.clientHeight;c.width=w*dpr;c.height=h*dpr};rs();addEventListener("resize",rs);
    var ori=function(e){var a=e.webkitCompassHeading!=null?e.webkitCompassHeading:(e.alpha!=null?360-e.alpha:null);if(a!=null){head=a;hasOri=true}};
    addEventListener("deviceorientationabsolute",ori);addEventListener("deviceorientation",ori);
    var pd=null;c.addEventListener("pointerdown",function(e){pd=[e.clientX,dragH]});c.addEventListener("pointermove",function(e){if(pd&&!hasOri)dragH=pd[1]-(e.clientX-pd[0])*.35});c.addEventListener("pointerup",function(){pd=null});
    var stop=function(){AR.on=false;fin=true;removeEventListener("deviceorientationabsolute",ori);removeEventListener("deviceorientation",ori);removeEventListener("resize",rs);try{stream.getTracks().forEach(function(t){t.stop()})}catch(e){}v.srcObject=null;ar.hidden=true};
    AR.stop=stop;
    $("#arX").onclick=function(){stop();puzzle(s)};
    hint.textContent=PZ.ar.drag;mg.tm.push(setTimeout(function(){if(!hasOri&&!fin)hint.textContent=PZ.ar.drag},1500));
    var f=function(ts){if(fin)return;var dt=Math.min(.1,(ts-last)/1000)||0;last=ts;var H=hasOri?head:dragH;var d=((target-H)%360+540)%360-180;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
      var fov=60,x=w/2+d/fov*w,y=h*.58,vis=Math.abs(d)<fov*.9;
      if(vis){var sc=70+hold*70;bride(g,x,y-sc*.1,sc,"#e9c7d6",Math.max(0,.9-Math.max(0,hold-1.4)*1.5))}
      g.strokeStyle="rgba(240,166,58,.8)";g.lineWidth=2;g.beginPath();g.arc(w/2,y,44,0,7);g.stroke();
      var near=Math.abs(d)<10;hold=near?hold+dt:0;if(near){g.strokeStyle="#a6ead9";g.lineWidth=5;g.beginPath();g.arc(w/2,y,52,-1.57,-1.57+6.283*Math.min(1,hold/2));g.stroke()}
      hint.textContent=near?PZ.ar.hold:d<-10?PZ.ar.left:d>10?PZ.ar.right:"";
      if(hold>=2){toast(PZ.ar.found);stop();finish(s);return}
      requestAnimationFrame(f)};requestAnimationFrame(f)
  }).catch(function(){G.cam="off";save();puzzle(s)})}
function reveal(s){var f=G.c.frags[s.fi],v=vars(G.c);
  sheet('<div class="eyebrow">'+esc(T.kinds[f.k])+' · '+fmt(f.tm)+' '+(L==="nl"?"uur":"")+'</div><h2>'+esc(s.name)+'</h2><div class="clue'+(f.k==="wit"?" wit":"")+'"><em>'+(f.k==="wit"?esc(cap(s.persona)):esc(T.kinds[f.k]))+'</em><p>'+esc(fragText(f))+'</p></div>'+
    (f.k==="open"?'<p class="note">'+esc(fill(T.how[1],v))+'</p>':'')+'<button type="button" class="btn" id="shX">'+T.back+'</button>');
  $("#shX").onclick=function(){closeSheet();sel=null;chip();if(G.st.every(function(x){return x.done}))toast(T.radarAll)}}

/* ---------- echo's: voorwerpen van de vermiste, alleen dichtbij zichtbaar ---------- */
function echoPuzzle(q){walkTo=null;var E=D.ECHO[q.id],tier=E[1],key=tier===3?"lamp":tier===2?"tiles":"dust",I=PZ[key],v=vars(G.c);
  sheet('<div class="eyebrow">'+esc(fill(D.ECHOT.eye,v))+' · '+esc(D.ECHOT.tier[tier])+'</div><h2>'+esc(I[0])+'</h2><p>'+esc(I[1])+'</p><div id="mgbox"></div><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=function(){mg.stop();closeSheet()};var box=$("#mgbox"),fin=false;
  var o={box:box,P:PZ,mg:mg,beep:beep,buzz:buzz,toast:toast,shuffle:shuffle,ghost:bride,label:E[0],done:function(){if(fin)return;fin=true;$("#mgSkip").hidden=true;echoFound(q)},
    canvas:function(){box.innerHTML='<canvas class="sq" width="260" height="260"></canvas>';return box.firstChild},at:function(e,c){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*260,(e.clientY-b.top)/b.height*260]}};
  window.VZ_PUZ[key](o)}
function echoFound(q){mg.stop();q.done=true;G.force=null;buzz(200);beep(880,.35);var E=D.ECHO[q.id],v=vars(G.c),c=G.c;
  var p=MW.profile.get();p.book_td=p.book_td||{};var isNew=!p.book_td[q.id];p.book_td[q.id]=(p.book_td[q.id]||0)+1;p.xp+=20*E[1];MW.profile.save(p);
  // tip: één verkeerde persoon die nog niet is doorgestreept valt af
  var cand=c.con.map(function(k,i){return i}).filter(function(i){return i!==c.K&&!G.out[i]}),tip="";
  if(cand.length){var r=rngOf(G.seed^q.id),i=cand[Math.floor(r()*cand.length)];G.out[i]=true;tip=fill(D.ECHOT.tip,{X:c.con[i].name,XR:c.con[i].rel,r:D.ECHOT.reasons[Math.floor(r()*D.ECHOT.reasons.length)]})}
  save();
  sheet('<div class="eyebrow">'+esc(D.ECHOT.tier[E[1]])+(isNew?" · "+esc(T.kinds.obj):"")+'</div><h2>'+esc(E[0])+'</h2><div class="clue"><p>'+esc(fill(E[2],v))+'</p></div>'+(tip?'<p class="note"><b>'+esc(tip)+'</b></p>':'')+'<div class="tags"><i>+'+(20*E[1])+'</i></div><button type="button" class="btn" id="shX">'+T.back+'</button>');
  $("#shX").onclick=function(){closeSheet();sel=null;chip()}}
function echoBook(){var p=MW.profile.get(),bk=p.book_td||{},n=Object.keys(bk).length,v=G?vars(G.c):{N:"…"};
  sheet('<div class="eyebrow">'+n+' / '+D.ECHO.length+'</div><h2>'+esc(D.ECHOT.book)+'</h2><p class="note">'+esc(fill(D.ECHOT.bookT,v))+'</p><div class="book">'+D.ECHO.map(function(e,i){return '<div'+(bk[i]?'':' class="no"')+'><b>'+(bk[i]?esc(e[0]):"???")+'</b><span class="r'+e[1]+'">'+esc(D.ECHOT.tier[e[1]])+'</span>'+(bk[i]?'<span>×'+bk[i]+'</span>':'')+'</div>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet}
$("#bEcho").onclick=echoBook;

/* ---------- notitieboek ---------- */
function noteSheet(tab){tab=tab||"route";var v=vars(G.c),fr=G.st.filter(function(s){return s.done}).sort(function(a,b){return G.c.frags[a.fi].tm-G.c.frags[b.fi].tm});
  var body=tab==="route"?(fr.length?'<div class="list">'+fr.map(function(s){var f=G.c.frags[s.fi];return '<div class="clue'+(f.k==="wit"?" wit":"")+'"><em>'+fmt(f.tm)+' · '+esc(s.name)+' · '+esc(T.kinds[f.k])+'</em><p>'+esc(fragText(f))+'</p></div>'}).join("")+'</div>':'<p class="note">'+T.nbNone+'</p>')
    :tab==="people"?'<div class="list">'+G.c.con.map(function(k,i){return '<button type="button" data-o="'+i+'" class="sus'+(G.out[i]?" out":"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small>'+quote(k)+'<div class="tags">'+CTK.map(function(t){return"<i>"+esc(fill(D.CT[t].tag[k.tr[t]],v))+"</i>"}).join("")+'</div></button>'}).join("")+'</div><p class="note">'+T.quoteNote+' '+T.nbTip+'</p>'
    :tab==="echo"?(function(){var bk=MW.profile.get().book_td||{},got=(G.echo||[]).filter(function(q){return q.done});return (got.length?'<div class="list">'+got.map(function(q){var e=D.ECHO[q.id];return '<div class="clue"><em>'+esc(D.ECHOT.tier[e[1]])+'</em><b>'+esc(e[0])+'</b><p>'+esc(fill(e[2],v))+'</p></div>'}).join("")+'</div>':'<p class="note">'+esc(D.ECHOT.radar)+'</p>')+'<button type="button" class="btn ghost dk" id="nbBook">'+esc(D.ECHOT.book)+' · '+Object.keys(bk).length+'/'+D.ECHO.length+'</button>'})()
    :'<div class="list">'+T.scn.map(function(s,i){return '<button type="button" data-s="'+i+'" class="sus'+(G.outS[i]?" out":"")+'"><b>'+esc(s[0])+'</b><small>'+esc(fill(s[1],v))+'</small></button>'}).join("")+'</div><p class="note">'+T.nbTip+'</p>';
  sheet('<div class="tabs"><button type="button" data-t="route" aria-selected="'+(tab==="route")+'">'+T.nbRoute+'</button><button type="button" data-t="people" aria-selected="'+(tab==="people")+'">'+T.nbPeople+'</button><button type="button" data-t="what" aria-selected="'+(tab==="what")+'">'+T.nbWhat+'</button><button type="button" data-t="echo" aria-selected="'+(tab==="echo")+'">'+T.nbEcho+'</button></div>'+body+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.id==="shX")closeSheet();else if(b.id==="nbBook")echoBook();else if(b.dataset.t)noteSheet(b.dataset.t);else if(b.dataset.o){G.out[b.dataset.o]=!G.out[b.dataset.o];save();noteSheet("people")}else if(b.dataset.s){G.outS[b.dataset.s]=!G.outS[b.dataset.s];save();noteSheet("what")}}}

/* ---------- conclusie ---------- */
function verdictSheet(){var v=vars(G.c),ps=null,pw=null;
  sheet('<div class="eyebrow">'+T.close+'</div><h2>'+T.vH+'</h2><p>'+esc(fill(T.vT,v))+'</p><div class="eyebrow">'+T.vWhat+'</div><div class="list" id="vS">'+T.scn.map(function(s,i){return '<button type="button" data-s="'+i+'" class="sus'+(G.outS[i]?" out":"")+'"><b>'+esc(s[0])+'</b><small>'+esc(fill(s[1],v))+'</small></button>'}).join("")+'</div>'+
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
  if(G.daily){var p=MW.profile.get();p.games.td.day=MW.today();MW.profile.save(p)}
  G.won={stars:stars,min:min};buzz([100,50,100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);
  // laatste plek: 120–220 m verderop, liefst op een straat
  var r=rngOf(G.seed^0x27d4eb2f),a0=r()*6.283,d0=120+r()*100,ex=P.x+Math.cos(a0)*d0,ey=P.y+Math.sin(a0)*d0,best=null,bd=90;
  W.forEach(function(w){for(var i=0;i<w.p.length;i+=2){var dd=Math.hypot(w.p[i]-ex,w.p[i+1]-ey);if(dd<bd){bd=dd;best=[w.p[i],w.p[i+1]]}}});
  G.epi={x:Math.round(best?best[0]:ex),y:Math.round(best?best[1]:ey),done:false};save();
  var E=D.END[c.S],st=a.prof.streak;
  sheet('<div class="eyebrow">'+T.won+' · '+esc(G.code)+'</div><div class="stars">'+"★".repeat(stars)+"☆".repeat(3-stars)+'</div><h2>'+esc(T.scn[c.S][0])+' · '+esc(c.con[c.K].name)+'</h2><p>'+esc(fill(E[0],v))+'</p>'+
    '<div class="tags"><i>'+Math.round(min)+' min</i><i>'+km.toFixed(1).replace(".",L==="nl"?",":".")+' km</i><i>'+fill(T.pts,{x:xp})+'</i>'+(G.mode==="gps"?'<i>'+fill(st===1?T.streakTxt:T.streakTxtP,{n:st})+'</i>':'')+'</div>'+
    (a.up?'<p><b>'+esc(fill(T.up,{r:MW.profile.rankName(a.prof.xp,L)}))+'</b></p>':'')+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+fill(T.missed2,{m:G.par})+'</p>':'')+
    '<button type="button" class="btn" id="vEpi">'+PZ.epi.btn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.share+'</button><button type="button" class="btn ghost dk" id="vHome">'+PZ.epi.home+'</button>',true);
  var code=G.code,stxt="★".repeat(stars),mm=Math.round(min);
  $("#vShare").onclick=function(){var url=location.origin+location.pathname+"#z="+code,txt=fill(T.shareTxt,{c:code,s:stxt,m:mm})+" "+url;
    if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}};
  $("#vEpi").onclick=function(){closeSheet();sel=null;chip();toast(fill(PZ.epi.radar,{d:Math.round(dTo(G.epi))}))};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
function endCase(){LS.del(GK);LS.del(WK);Wk.stopWatch();G=null;home()}
function epilogue(){var c=G.c,v=vars(c),E=D.END[c.S];G.epi.done=true;mg.stop();buzz([100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);
  MW.profile.award({game:ID,xp:50,solved:false,gps:false});
  sheet('<div class="eyebrow">'+esc(PZ.epi.h)+' · '+esc(c.M.n)+'</div><h2>'+esc(PZ.epi.name)+'</h2><div class="clue"><p>'+esc(fill(E[1],v))+'</p></div><p class="note">'+esc(PZ.epi.bonus)+'</p><button type="button" class="btn" id="vHome">'+PZ.epi.home+'</button>',true);
  $("#vHome").onclick=function(){closeSheet();endCase()}}
/* ---------- zaakcode, archief, menu, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note" id="dMsg" style="color:#a5392c"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();setLen(p.short);startGps(p.seed,false)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.td,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
  sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min · '+String(x.km).replace(".",L==="nl"?",":".")+' km</small><div class="tags"><i>'+st(x.st)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){if(AR.on)AR.stop();mg.stop();save();Wk.stopWatch();G=null;home()}
function wipeGame(){LS.del(GK);LS.del(WK);Wk.stopWatch();G=null;closeSheet();home();toast(T.wiped)}
function menuSheet(){sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mMap+'</button><button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);LS.del(WK);MW.profile.wipe();closeSheet();home();toast(T.wiped)})}}
function goBack(){if(AR.on){$("#arX").click();return true}if(!$("#sheet").hidden){var k=$("#mgSkip");if(k)k.click();else if($("#sheet").dataset.lock){var x=$("#shX")||$("#vHome");if(x)x.click()}else closeSheet();return true}
  if(!$("#load").hidden)return true;if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({td:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({td:1},"")}catch(e){}}})}catch(e){}


/* ---------- startscherm: regen en bloemblaadjes ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,drops=[],dpr=1;
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;drops=[];for(var i=0;i<(still?0:110);i++)drops.push([Math.random()*w,Math.random()*h,8+Math.random()*14,.3+Math.random()*.5])}
  rs();addEventListener("resize",rs);
  function f(){if($("#home").hidden){requestAnimationFrame(f);return}g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
    for(var i=0;i<drops.length;i++){var d=drops[i];if(i%4){g.strokeStyle="rgba(147,166,198,.16)";g.lineWidth=1;g.beginPath();g.moveTo(d[0],d[1]);g.lineTo(d[0]-2,d[1]+d[2]);g.stroke();d[1]+=d[2]*d[3]*1.6;d[0]-=.4*d[3]}
      else{g.fillStyle="rgba(233,199,214,"+(.25+d[3]*.4)+")";g.beginPath();g.ellipse(d[0],d[1],4,2.2,d[1]/40+i,0,7);g.fill();d[1]+=.5+d[3];d[0]+=Math.sin(d[1]/30+i)*.6}
      if(d[1]>h){d[1]=-20;d[0]=Math.random()*w}}
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
hero();(function(){var t=$("#ttl");if(!t||matchMedia("(prefers-reduced-motion: reduce)").matches)return;var txt=t.textContent.replace(/\u00AD/g,"");t.textContent="";var frag=document.createDocumentFragment();txt.split(" ").forEach(function(wd,wi){if(wi)frag.appendChild(document.createTextNode(" "));var w=document.createElement("span");w.className="wd";for(var i=0;i<wd.length;i++){var sp=document.createElement("span");sp.className="ch";sp.textContent=wd[i];sp.style.animationDelay=(Math.random()*6).toFixed(2)+"s";w.appendChild(sp)}frag.appendChild(w)});t.appendChild(frag)})();
/* ---------- start ---------- */
home();MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
var HZ=(location.hash||"").match(/z=([A-Za-z0-9-]+)/);if(HZ)codeSheet(HZ[1]);
if(typeof module!=="undefined")module.exports={genCase:genCase,solve:solve};
window.TD={genCase:genCase,solve:solve,state:function(){return G}};
})();
