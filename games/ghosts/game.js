/* De Nacht van de Geesten / Night of the Ghosts – Halloween-nachtzaak. Spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js, walk.js, NG_DATA (data-xx.js) en games/vanishing/puzzles.js.
   Anders dan de andere wandelingen: acht locaties in VASTE volgorde, elk met een eigen vorm (foto, getuige, voorwerp, verschijning via de camera,
   oud bericht, verkeerde conclusie, waarschuwing, laatste plek). Onderweg verandert de kaart (locatie 6 verdwijnt en duikt elders op; er komt een negende bij)
   en duiken zeldzame geesten kort op die je op tijd moet aantikken. Op de laatste plek beantwoord je drie vragen: wie, wat, waarom vannacht. */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.NG_DATA,T=D.T,L=D.lang,esc=MW.esc,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="ng",GK="ss_game_ng_"+L,WK="ss_ways_ng_"+L,rngOf=Wk.rngOf,shuffle=Wk.shuffle,hashStr=MW.hashStr;
var toast=Wk.toast,sheet=Wk.sheet,beep=Wk.beep,buzz=Wk.buzz;function closeSheet(){if(window.mgStop)window.mgStop();Wk.closeSheet()}
var fill=function(s,o){return String(s).replace(/\{(\w+)\}/g,function(m,k){return o&&(k in o)?o[k]:m})};
var G=null,W=[],P={x:0,y:0,acc:0},R0=650,PAR=75,sel=null,walkTo=null,arrived=null,lastT=0,map=null,nearD=1e9;
var PZ=D.PZ,MAPFONT="600 12px 'Barlow Condensed','Arial Narrow',sans-serif",still=matchMedia("(prefers-reduced-motion: reduce)").matches;
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}

/* ---------- de zaak: welke van de drie vrouwen, welk lot, waarom vannacht ---------- */
var WPIC=[2,3,4]; // de vrouwen met een portret (woman-<i>.webp)
function wsrc(i){return MW.root+"games/ghosts/woman-"+i+".webp"}
function genCase(seed){var r=rngOf(seed),idx=[0,1,2];
  for(var t=0;t<300;t++){idx=shuffle(WPIC.slice(),r).slice(0,3);var k={};if(idx.every(function(i){var w=D.WOMEN[i],key=w.a+""+w.b;if(k[key])return false;k[key]=1;return true}))break}
  var g=Math.floor(r()*3),F=Math.floor(r()*3),Wf=(F+1+Math.floor(r()*2))%3,R=Math.floor(r()*3),o=shuffle([0,1,2].filter(function(x){return x!==R}),r);
  // F = wat er echt gebeurde, Wf = wat de krant beweert (locatie 5) en locatie 6 weerlegt, X = wat de verschijning uitsluit (locatie 4)
  // R = waarom vannacht; n1 en n2 = de twee redenen die de getuige (2) en de waarschuwing (7) uitsluiten
  return{seed:seed,w:idx,g:g,F:F,Wf:Wf,X:3-F-Wf,R:R,n1:o[0],n2:o[1],obj:Math.floor(r()*3),sig:shuffle([0,1,2],r)}}
var ITEMOF=[2,0,1]; // reden 0 (jaardag) -> knipsel, 1 (plek verdwijnt) -> foto, 2 (naam genoemd) -> voorwerp
function ghost(c){return D.WOMEN[c.w[c.g]]}
function vars(c,extra){var w=ghost(c),o={NAME:w.n,N:new Date().getFullYear()-w.y,PY:w.y+5+((c.seed>>>0)%9),HAIR:D.HAIR[w.a],DRESS:D.DRESS[w.b],OBJ:D.OBJ[c.obj][0],OBJD:D.OBJ[c.obj][1],INI:w.ini};if(extra)for(var k in extra)o[k]=extra[k];return o}
function itemName(c,i){return fill(D.ITEMS[i],vars(c))}
function locText(c,n){var v=vars(c);
  return n===1?fill(D.L1,v):n===2?fill(D.L2,vars(c,{NOT:D.NOTW[c.n1]})):n===3?fill(D.L3,v):n===4?fill(D.L4,{GEST:D.GEST[c.X]}):n===5?fill(D.L5,{ASSERT:D.ASSERT[c.Wf]}):
    n===6?fill(D.L6,{SUM:D.SUM[c.Wf],REFUTE:D.REFUTE[c.Wf],POINT:D.POINT[c.F]}):n===7?fill(D.L7a,{NOT:D.NOTM[c.n2]}):n===9?D.L9:""}

/* ---------- figuren: schimmen zonder voeten, die onderaan in mist oplossen (vak 120×164) ---------- */
var FP={},fp=function(d){return FP[d]||(FP[d]=new Path2D(d))};
function haze(c,x,y,s,al,col){var g=c.createRadialGradient(x,y+s*.08,s*.04,x,y+s*.08,s*.78);g.addColorStop(0,"rgba("+col+","+(.30*al)+")");g.addColorStop(1,"rgba("+col+",0)");c.fillStyle=g;c.beginPath();c.arc(x,y+s*.08,s*.78,0,7);c.fill()}
function body(c,x,y,s,al,tint,fn){c.save();c.translate(x,y);c.scale(s/164,s/164);c.translate(-60,-84);var g=c.createLinearGradient(0,6,0,162);g.addColorStop(0,"rgba("+tint+","+(.94*al)+")");g.addColorStop(.58,"rgba("+tint+","+(.7*al)+")");g.addColorStop(1,"rgba("+tint+",0)");
  c.fillStyle=g;c.lineJoin="round";c.lineCap="round";fn(g,al);c.restore()}
var GOWN="M48 40 C52 36 68 36 72 40 C77 62 81 96 87 130 C89 142 93 150 97 162 H23 C27 150 31 142 33 130 C39 96 43 62 48 40 Z",COAT="M44 42 C50 38 70 38 76 42 L83 122 C85 138 87 150 89 162 H31 C33 150 35 138 37 122 Z";
/* zij: lange jurk, lang haar of sluier, hoofd iets gebogen. calm = de laatste keer: warm licht, geen schaduw over het gezicht */
function spirit(c,x,y,s,al,calm,tint){haze(c,x,y,s,al,calm?"255,226,180":"190,212,238");body(c,x,y,s,al,tint||(calm?"255,243,222":"208,224,242"),function(g,a){
  c.fill(fp(GOWN));c.strokeStyle=g;c.lineWidth=7;c.stroke(fp("M49 46 C41 64 39 86 41 104 M71 46 C79 64 81 86 79 104"));
  c.fill(fp("M49 24 C46 4 74 4 71 24 C77 44 75 64 71 80 H49 C45 64 43 44 49 24 Z"));
  c.fillStyle="rgba(8,12,20,"+((calm?.22:.62)*a)+")";c.beginPath();c.ellipse(60,27,6.5,8.5,0,0,7);c.fill();
  c.strokeStyle="rgba(255,255,255,"+(.3*a)+")";c.lineWidth=1;c.stroke(fp("M54 62 C52 98 46 132 40 158 M66 62 C68 98 74 132 80 158 M60 64 V160"))})}
/* zeldzame geesten: w = vrouw in sluier, s = soldaat, g = meisje, m = man met hoed (zonder gezicht) */
function rareFig(c,x,y,s,al,type){if(type==="w")return spirit(c,x,y,s,al,false,"168,176,200");
  haze(c,x,y,s,al,type==="s"?"190,220,190":type==="g"?"240,220,235":"210,214,224");
  body(c,x,y,s,al,type==="s"?"196,218,198":type==="g"?"240,226,238":"206,212,224",function(g,a){
    if(type==="g"){c.fill(fp("M50 78 C54 74 66 74 70 78 L83 134 C85 146 86 154 87 162 H33 C34 154 35 146 37 134 Z"));c.beginPath();c.arc(60,66,8.5,0,7);c.fill();c.fill(fp("M51 50 L60 56 L51 62 Z M69 50 L60 56 L69 62 Z"))}
    else{c.fill(fp(COAT));c.beginPath();c.arc(60,30,8.5,0,7);c.fill();
      if(type==="s"){c.fill(fp("M46 20 C46 6 74 6 74 20 L80 24 H40 Z"));c.strokeStyle=g;c.lineWidth=2.5;c.stroke(fp("M86 24 L77 152"))}
      else{c.fill(fp("M47 18 H73 V5 H47 Z M38 18 H82 V22.5 H38 Z"));c.fillStyle="rgba(245,248,252,"+a+")";c.beginPath();c.ellipse(60,31,6,7,0,0,7);c.fill()}}})}
var RFX=[45,45,55,55,35,62,50,40,35,47,47,75],RIMG={};function rsrc(id){return MW.root+"games/ghosts/rare-"+id+".webp"}
function rimg(id){if(!RIMG[id]){RIMG[id]=new Image();RIMG[id].src=rsrc(id)}return RIMG[id]}
function rpic(id,cls){return '<img class="rpic'+(cls||"")+'" src="'+rsrc(id)+'" alt="" style="object-position:'+RFX[id]+'% 50%">'}
function spiritG(c,x,y,s,col,al){spirit(c,x,y,s,al,false)}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get(),i=MW.profile.rank(p.xp),nx=MW.profile.next(p.xp),R=MW.profile.RANKS.nl[i][0],t=MW.t(L);
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.ng&&p.games.ng.n)||0;
  $("#pXp").style.width=(nx?Math.round((p.xp-R)/(nx[0]-R)*100):100)+"%";
  $("#pNext").textContent=nx?MW.fill(t.pts,{x:p.xp,n:nx[0]-p.xp,r:MW.profile.RANKS[L][i+1][1]}):MW.fill(t.ptsTop,{x:p.xp});
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(),lk=MW.pro.locked(ID),playedToday=(p.games.ng&&p.games.ng.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;
  $("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  show("home")}
function show(id){["home","brief","play"].forEach(function(s){$("#"+s).hidden=s!==id});if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro")+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;R0=+b.dataset.r;PAR=+b.dataset.par;$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
function setLen(short){var b=$$("#len button")[short?0:1];if(b)b.click()}
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();startGps(hashStr("ng|"+MW.today()),true)};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();startGps(Math.floor(Math.random()*4e9),false)};
$("#bPro").onclick=proSheet;
$("#bDemo").onclick=function(){var w=Wk.demoWorld(D.DEMO);build(Math.floor(Math.random()*4e9),"demo",w.pois,w.ways,null,false)};
$("#bResume").onclick=function(){G=LS.get(GK,null);W=LS.get(WK,[]);if(!G)return home();P={x:G.px||0,y:G.py||0,acc:0};R0=G.R;PAR=G.par;enter()};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};

/* ---------- wereld ophalen ---------- */
function fail(m){Wk.loading("");sheet('<h2>'+T.fail+'</h2><p>'+m+'</p><button type="button" class="btn" id="shX">'+T.back+'</button>');$("#shX").onclick=closeSheet}
function startGps(seed,daily){
  Wk.loading(T.pois);
  Wk.locate().then(function(pos){
    var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){
      Wk.loading("");build(seed,"gps",w.pois,w.ways,w.origin,daily);var mine=G;
      w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})})
  }).catch(function(e){fail(e==="nogps"?T.noGps:T.denied)})}

/* ---------- de nacht opbouwen: acht locaties in een lus, twee reserveplekken ---------- */
function build(seed,mode,pois,ways,origin,daily){
  var c=genCase(seed),r=rngOf(seed^0x9e3779b9),all=Wk.pickSpots(pois,ways,R0,10,r,T.corner),spots=all.slice(0,8),spare=all.slice(8);
  spots.sort(function(a,b){return Math.atan2(a.y,a.x)-Math.atan2(b.y,b.x)});var off=Math.floor(r()*spots.length);spots=spots.slice(off).concat(spots.slice(0,off));
  var mk=function(p,n){var TY=D.TYPES[p.type]||D.TYPES.hoek;return{x:p.x,y:p.y,type:p.type,name:p.name||cap(TY[0].replace(/^(de|het|the) /,"")),n:n,done:false}};
  var st=spots.map(function(p,i){return mk(p,i+1)});
  while(spare.length<2){var b=st[spare.length?1:5],a=r()*6.283,d=130+r()*90;spare.push({x:Math.round(b.x+Math.cos(a)*d),y:Math.round(b.y+Math.sin(a)*d),type:"hoek",name:""})}
  G={mode:mode,R:R0,par:PAR,seed:seed,c:c,st:st,sp:spare.slice(0,2).map(function(p){return mk(p,0)}),t0:0,dist:0,tries:0,origin:origin,px:0,py:0,daily:!!daily,code:codeOf(PAR,seed),
     out:{},outF:{},outR:{},item:null,step7:0,ev:{},rare:{next:0,cur:null,got:[]}};
  W=ways;P={x:0,y:0,acc:0};LS.set(WK,W);
  $("#bfNo").textContent=T.brief+" "+G.code+(mode==="demo"?" · "+T.demoCase:"");
  $("#bfIntro").innerHTML=T.intro.map(function(t,i){return '<p style="animation-delay:'+(.3+i*1.5)+'s">'+esc(t)+'</p>'}).join("");
  $("#bfConH").textContent=T.women;$("#bfCon").innerHTML=c.w.map(function(i){return womanCard(D.WOMEN[i],"")}).join("");
  show("brief")}
function womanCard(w,cls,attr){return '<'+(attr?'button type="button" '+attr:'div')+' class="sus woman'+cls+'">'+(WPIC.indexOf(D.WOMEN.indexOf(w))>=0?'<img class="wpic" src="'+wsrc(D.WOMEN.indexOf(w))+'" alt="">':'<span class="oval" aria-hidden="true"><i class="h'+w.a+' d'+w.b+'"></i></span>')+'<span class="wb"><b>'+esc(w.n)+'</b><small>'+esc(w.role)+' · '+esc(fill(T.vanished,{y:w.y,a:w.age}))+'</small><span class="tags"><i>'+esc(T.hairTag[w.a])+'</i><i>'+esc(T.dressTag[w.b])+'</i><i>'+esc(w.ini)+'</i></span></span></'+(attr?'button':'div')+'>'}
$("#bGo").onclick=function(){G.t0=Date.now();if(G.mode==="gps")MW.pro.setFree(ID);save();enter()};
$("#bBack").onclick=function(){G=null;home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}
function codeOf(par,seed){return"NG"+(par<=40?"S":"L")+"-"+(seed>>>0).toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);if(!/^NG[SL]/.test(c)||c.length<4||c.length>11)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;return{short:c[2]==="S",seed:seed}}

/* ---------- spelen ---------- */
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function nextN(){for(var i=0;i<8;i++)if(!G.st[i].done)return i+1;return 0}
function canOpen(s){return !s.done&&!hid(s)&&(s.n===9||s.n===nextN())}
function doneCount(){return G.st.filter(function(s){return s.n<=8&&s.done}).length}
/* dwaallicht op de kaart: 0 = nog niet aan de beurt, 1 = de volgende locatie (rood doelwit), 2 = gehad */
function wisp(c,X,Y,n,state,t,api){var fl=api.still?0:Math.sin(t/160+n)*2,col=state===1?"255,138,40":state===2?"110,124,144":"176,196,222",R=state===1?52:30,a=state===1?.5:state===2?.1:.2;
  var g=c.createRadialGradient(X,Y,3,X,Y,R);g.addColorStop(0,"rgba("+col+","+a+")");g.addColorStop(1,"rgba("+col+",0)");c.fillStyle=g;c.beginPath();c.arc(X,Y,R,0,7);c.fill();
  if(state===1&&!api.still){for(var i=0;i<2;i++){var q=((t/1500)+i/2)%1;c.strokeStyle="rgba(214,48,40,"+(.75*(1-q))+")";c.lineWidth=2;c.beginPath();c.arc(X,Y,16+q*30,0,7);c.stroke()}}
  c.fillStyle="rgba("+col+","+(state===1?.95:state===2?.4:.55)+")";c.beginPath();c.moveTo(X,Y-17-fl);c.bezierCurveTo(X+12,Y-4,X+10,Y+11,X,Y+12);c.bezierCurveTo(X-10,Y+11,X-12,Y-4,X,Y-17-fl);c.fill();
  c.fillStyle=state===2?"rgba(10,12,18,.8)":"#0a0c12";c.font="700 13px 'Barlow Condensed','Arial Narrow',sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText(state===2?"✓":n,X,Y+1);c.textBaseline="alphabetic"}
function items(){var it=[],nx=nextN();
  // mist: trekt langzaam over de kaart en wordt dichter naarmate de nacht vordert
  it.push({x:P.x,y:P.y,tap:false,draw:function(cx,X,Y,t,api){var sz=api.size(),w=sz[0],h=sz[1],k=.05+.018*doneCount()+(G.thick?.08:0);
    for(var i=0;i<7;i++){var bx=((i*197+(api.still?0:t*.012*(1+i%3)))%(w+300))-150,by=(i*131+Math.sin((api.still?0:t)/4000+i)*40)%h,br=140+(i%3)*60,g=cx.createRadialGradient(bx,by,10,bx,by,br);g.addColorStop(0,"rgba(190,205,225,"+k+")");g.addColorStop(1,"rgba(190,205,225,0)");cx.fillStyle=g;cx.fillRect(bx-br,by-br,br*2,br*2)}}});
  G.st.forEach(function(s){if(hid(s))return;it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var state=s.done?2:(s.n===nx||s.n===9)?1:0;
    wisp(cx,X,Y,s.n,state,t,api);
    if(sel===s){cx.strokeStyle="#e9eef5";cx.lineWidth=1.5;cx.setLineDash([3,4]);cx.beginPath();cx.arc(X,Y,25,0,7);cx.stroke();cx.setLineDash([])}
    if(state===1||sel===s||(state===2&&api.V.s>=.5)){cx.font=MAPFONT;cx.textAlign="center";cx.shadowColor="#000";cx.shadowBlur=6;cx.fillStyle=state===2?"#7f8ba0":state===1?"#ffd9b0":"#c8d4e4";cx.fillText((T.loc[s.n-1]+" · "+s.name).toUpperCase().slice(0,34),X,Y+34);cx.shadowBlur=0}}})});
  var q=G.rare.cur;if(q)it.push({x:q.x,y:q.y,ref:q,tap:true,draw:function(cx,X,Y,t,api){var left=1-(Date.now()-q.t0)/RLIFE,ty=D.RARE[q.id][2],dr=api.still?0:Math.sin(t/700)*6;
    var al=Math.max(.2,Math.min(1,left*2))*(api.still?1:.75+.25*Math.abs(Math.sin(t/190))),im=rimg(q.id);
    if(im.complete&&im.naturalWidth){var sh=im.naturalHeight,sx=Math.max(0,Math.min(im.naturalWidth-sh,im.naturalWidth*RFX[q.id]/100-sh/2));cx.save();cx.globalAlpha=al;cx.beginPath();cx.arc(X+dr,Y-10,36,0,7);cx.clip();cx.drawImage(im,sx,0,sh,sh,X+dr-36,Y-46,72,72);cx.restore()}else rareFig(cx,X+dr,Y-10,64,al,ty);
    cx.strokeStyle="rgba(255,138,40,.9)";cx.lineWidth=3;cx.beginPath();cx.arc(X,Y-10,40,-1.57,-1.57+6.283*Math.max(0,left));cx.stroke();
    cx.font=MAPFONT;cx.textAlign="center";cx.fillStyle="#ffd9b0";cx.shadowColor="#000";cx.shadowBlur=6;cx.fillText("???",X,Y+44);cx.shadowBlur=0}});
  return it}
function enter(){
  show("play");if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return G?G.R:650},
    theme:{bg:"#07090d",water:"#081019",waterEdge:"#1c2c3e",ripple:"rgba(160,185,215,.12)",park:"#0a100d",parkEdge:"#1b2a22",river:"#0d1824",major:"#343d4c",minor:"#12161d",road:"#1f2631",label:"#667488",waterLabel:"#4d6a88",ring:"rgba(255,138,40,.2)",me:"#ff8a28",meHalo:"rgba(255,138,40,.14)",meRing:"rgba(255,138,40,.55)",font:MAPFONT},
    items:items,onTap:function(hit,w){
      if(hit&&hit.ref.rare)return catchRare(hit.ref);
      if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(G.R);sel=null;walkTo=null;arrived=null;$("#chip").hidden=true;
  // na hervatten: wat al verschoven had moeten zijn, staat meteen goed
  if(G.st[3].done&&!G.ev.m6)move6(true);if(G.st[5].done&&!G.ev.n9)add9(true);
  Wk.stopWatch();if(G.mode==="gps")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d});
  if(G.mode==="demo")toast(T.demoTip);
  requestAnimationFrame(loop)}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=90*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tick()}requestAnimationFrame(loop)}
var RLIFE=14000;
function tick(){
  var now=Date.now(),el=Math.floor((now-G.t0)/1000),nx=nextN(),busy=!$("#sheet").hidden||!$("#ar").hidden||!!$("#glitch.on");
  $("#hT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#hS").textContent=G.st.filter(function(s){return s.done}).length+"/"+(G.st.length>8&&!hid(G.st[8])?9:8);$("#hG").textContent=G.rare.got.length;$("#hD").textContent=(G.dist/1000).toFixed(1).replace(".",L==="nl"?",":".");
  var tg=nx?G.st[nx-1]:null,nd=tg&&!hid(tg)?dTo(tg):1e9;nearD=nd;
  $("#radar").textContent=G.won?T.won:!tg?T.won:hid(tg)?"…":nd<60?fill(T.radarHot,{d:Math.round(nd)}):fill(T.radarNext,{n:nx,d:Math.round(nd)});
  var open=G.st.filter(canOpen),here=open.filter(inRange)[0];if(here&&arrived!==here&&!busy){arrived=here;sel=here;buzz([80,60,80]);beep(520,.25)}if(!here)arrived=null;
  // zeldzame geesten: duiken onverwacht op, vlak bij je, en blijven maar even
  var rg=G.rare;if(!G.won){
    if(!rg.cur){if(!rg.next)rg.next=now+22000+Math.random()*30000;
      if(now>rg.next&&!busy){var x=Math.random(),tier=x<.1?3:x<.4?2:1,opts=D.RARE.map(function(e,j){return j}).filter(function(j){return D.RARE[j][1]===tier}),a=Math.random()*6.283,d=38+Math.random()*45;
        rg.cur={x:Math.round(P.x+Math.cos(a)*d),y:Math.round(P.y+Math.sin(a)*d),id:opts[Math.floor(Math.random()*opts.length)],t0:now,rare:true};toast(T.rare.seen);buzz([40,40,40]);beep(990,.12)}}
    else if(now-rg.cur.t0>RLIFE){rg.cur=null;rg.next=now+40000+Math.random()*55000;if(!busy)toast(T.rare.late)}}
  chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!sel||sel.done||hid(sel)){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel),can=canOpen(sel),nx=nextN();
  $("#cName").textContent=fill(T.locN,{n:sel.n})+" · "+T.loc[sel.n-1];$("#cDist").textContent=Math.round(d)+" m";
  $("#cHint").textContent=!can?(sel.n===8&&nx===7?T.lockedLast:fill(T.locked,{n:nx})):sel.name+". "+D.INTROLOC[sel.n-1];
  var b=$("#cAct");b.hidden=!can;if(!can)return;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel||!canOpen(sel))return;if(inRange(sel))openLoc(sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;openLoc(sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
function sndUi(){$("#zS").style.opacity=Wk.sound()?1:.4;$("#zS").setAttribute("aria-pressed",Wk.sound()?"true":"false")}sndUi();
$("#zS").onclick=function(){Wk.sound(!Wk.sound());sndUi()};
$("#zM").onclick=menuSheet;$("#bNote").onclick=function(){noteSheet("found")};$("#bPeople").onclick=function(){noteSheet("women")};$("#bAcc").onclick=function(){noteSheet("ghosts")};

/* ---------- puzzels en camera ---------- */
var mg={raf:0,tm:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[]}};window.mgStop=function(){mg.stop()};
function head(s){return '<div class="lochead"><b>'+s.n+'</b><span><em>'+esc(T.loc[s.n-1])+'</em>'+esc(s.name)+'</span></div>'}
function runPuzzle(s,key,label,onDone){var I=PZ[key];
  sheet(head(s)+'<h2>'+esc(I[0])+'</h2><p>'+esc(I[1])+'</p><div id="mgbox"></div><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=function(){mg.stop();closeSheet()};var box=$("#mgbox"),fin=false;
  window.VZ_PUZ[key]({box:box,P:PZ,mg:mg,beep:beep,buzz:buzz,toast:toast,shuffle:shuffle,ghost:spiritG,label:label,done:function(){if(fin)return;fin=true;mg.stop();buzz(200);beep(740,.3);onDone()},
    canvas:function(){box.innerHTML='<canvas class="sq" width="260" height="260"></canvas>';return box.firstChild},at:function(e,c){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*260,(e.clientY-b.top)/b.height*260]}})}
function holdSheet(s,label,onDone){
  sheet(head(s)+'<p>'+esc(D.INTROLOC[s.n-1])+'</p><button type="button" class="btn hold" id="hold"><i></i><span>'+esc(label)+'</span></button><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=closeSheet;var hb=$("#hold"),bar=hb.querySelector("i"),t0=0,raf=0,fin=false;
  var stop=function(){cancelAnimationFrame(raf);t0=0;bar.style.width="0%"};
  var go=function(){if(fin)return;var p=Math.min(1,(Date.now()-t0)/1500);bar.style.width=p*100+"%";if(p>=1){fin=true;buzz(200);beep(740,.3);onDone();return}raf=requestAnimationFrame(go)};
  hb.addEventListener("pointerdown",function(e){e.preventDefault();t0=Date.now();beep(220,.08);go()});["pointerup","pointercancel","pointerleave"].forEach(function(ev){hb.addEventListener(ev,function(){if(!fin)stop()})});
  hb.addEventListener("contextmenu",function(e){e.preventDefault()})}
/* camera. fin=false: ze staat ergens om je heen, onrustig; zoek haar en houd haar in beeld. fin=true: de laatste keer, recht voor je, rustig, en ze lost langzaam op. */
var AR={on:false,stop:function(){}};
function camOK(){return !!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)&&G.cam!=="off"}
function runAR(fin,onDone,onFail){closeSheet();var ar=$("#ar"),v=$("#arV"),c=$("#arC"),hint=$("#arH");
  var req=navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
  try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")DeviceOrientationEvent.requestPermission().catch(function(){})}catch(e){}
  req.then(function(stream){G.cam="on";save();AR.on=true;v.srcObject=stream;ar.hidden=false;ar.classList.toggle("calm",!!fin);
    var g=c.getContext("2d"),dpr=1,w=0,h=0,hd=null,dragH=180,target=fin?null:90+Math.random()*180,hold=0,last=0,over=false,hasOri=false,t0=0;
    var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=c.clientWidth;h=c.clientHeight;c.width=w*dpr;c.height=h*dpr};rs();addEventListener("resize",rs);
    var ori=function(e){var a=e.webkitCompassHeading!=null?e.webkitCompassHeading:(e.alpha!=null?360-e.alpha:null);if(a!=null){hd=a;hasOri=true}};
    addEventListener("deviceorientationabsolute",ori);addEventListener("deviceorientation",ori);
    var pd=null;c.onpointerdown=function(e){pd=[e.clientX,dragH]};c.onpointermove=function(e){if(pd&&!hasOri)dragH=pd[1]-(e.clientX-pd[0])*.35};c.onpointerup=function(){pd=null};
    var stop=function(){AR.on=false;over=true;removeEventListener("deviceorientationabsolute",ori);removeEventListener("deviceorientation",ori);removeEventListener("resize",rs);try{stream.getTracks().forEach(function(t){t.stop()})}catch(e){}v.srcObject=null;ar.hidden=true};
    AR.stop=stop;$("#arX").onclick=function(){stop();onFail()};hint.textContent=fin?PZ.ar.calm:PZ.ar.drag;
    var f=function(ts){if(over)return;var dt=Math.min(.1,(ts-last)/1000)||0;last=ts;var H=hasOri?hd:dragH;if(target==null){if(!t0)t0=ts;if(ts-t0>500)target=H;else{requestAnimationFrame(f);return}}
      var d=((target-H)%360+540)%360-180;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);var fov=60,x=w/2+d/fov*w,y=h*.55;
      if(fin){var e=(ts-t0-500)/1000,al=e<1.6?e/1.6:e<4.5?1:Math.max(0,1-(e-4.5)/5.5);spirit(g,x,y,h*.5,al,true);hint.textContent=e<4.5?PZ.ar.calm:PZ.ar.fade;if(e>10.2){stop();onDone();return}}
      else{if(Math.abs(d)<fov*.9){var sc=h*.3+hold*h*.14,jx=Math.sin(ts/53)*2*(1+hold);spirit(g,x+jx,y,sc,.45+.5*Math.abs(Math.sin(ts/170)),false)}
        g.strokeStyle="rgba(255,138,40,.8)";g.lineWidth=1.5;g.beginPath();g.arc(w/2,y,46,0,7);g.stroke();
        var near=Math.abs(d)<10;hold=near?hold+dt:0;if(near){g.strokeStyle="#e9eef5";g.lineWidth=4;g.beginPath();g.arc(w/2,y,54,-1.57,-1.57+6.283*Math.min(1,hold/1.5));g.stroke();if(Math.random()<.2)buzz(15)}
        hint.textContent=near?PZ.ar.hold:d<-10?PZ.ar.left:d>10?PZ.ar.right:"";
        if(hold>=1.5){toast(PZ.ar.found);buzz([200,80,300]);stop();onDone();return}}
      requestAnimationFrame(f)};requestAnimationFrame(f)
  }).catch(function(){G.cam="off";save();onFail()})}

/* ---------- de acht locaties, elk met een eigen vorm ---------- */
function doc(s,html,then,btn){sheet(head(s)+'<div class="doc d'+s.n+'">'+html+'</div><button type="button" class="btn" id="shX">'+(btn||T.back)+'</button>',true);
  $("#shX").onclick=function(){closeSheet();sel=null;chip();if(then)then()}}
function done(s){mg.stop();s.done=true;G.force=null;save()}
function openLoc(s){walkTo=null;var c=G.c,n=s.n,v=vars(c);
  if(n===1)return holdSheet(s,T.holdDev,function(){done(s);doc(s,'<div class="photo"><img src="'+MW.root+'games/ghosts/photo1.webp" alt="" width="900" height="532"><i>'+v.PY+'</i></div><p>'+esc(locText(c,1))+'</p>')});
  if(n===2){done(s);return doc(s,'<p class="hand">'+esc(locText(c,2))+'</p>')}
  if(n===3)return doc(s,'<p>'+esc(fill(D.L3a,v))+'</p>',function(){runPuzzle(s,"dust",v.INI,function(){done(s);doc(s,'<div class="engr">'+esc(v.INI)+'</div><p>'+esc(locText(c,3))+'</p>')})},PZ.dust[1]);
  if(n===4){var after=function(){done(s);doc(s,'<div class="photo"><img src="'+MW.root+'games/ghosts/apparition.webp" alt="" width="900" height="782"></div><p>'+esc(locText(c,4))+'</p>',function(){move6(false)})};
    var lamp=function(){runPuzzle(s,"lamp","",after)};
    if(!camOK())return lamp();if(G.cam==="on")return runAR(false,after,lamp);
    sheet(head(s)+'<h2>'+esc(PZ.ar.h)+'</h2><p>'+esc(D.L4a)+'</p><button type="button" class="btn" id="arYes">'+PZ.ar.yes+'</button><button type="button" class="btn ghost dk" id="arNo">'+PZ.ar.no+'</button>',true);
    $("#arYes").onclick=function(){runAR(false,after,lamp)};$("#arNo").onclick=function(){G.cam="off";save();lamp()};return}
  if(n===5)return runPuzzle(s,"seq","",function(){done(s);doc(s,'<div class="paperclip"><h3>'+esc(T.news[0])+'</h3><img src="'+MW.root+'games/ghosts/clipping.webp" alt=""><b>'+esc(T.news[1])+'</b><p>'+esc(locText(c,5))+'</p></div>')});
  if(n===6){done(s);return doc(s,'<p class="strike">'+esc(cap(D.SUM[c.Wf]))+'</p><p>'+esc(locText(c,6))+'</p>',function(){add9(false)})}
  if(n===7){if(G.step7>=1)return step7(s);G.step7=1;save();return doc(s,warnHTML(locText(c,7)),function(){step7(s)},PZ.tiles[0])}
  if(n===8)return finalSheet(s);
  if(n===9){done(s);var id=D.RARE.map(function(e,j){return j}).filter(function(j){return D.RARE[j][1]===3})[(c.seed>>>0)%3];addRare(id);
    doc(s,''+rpic(id," wide")+'<p>'+esc(D.L9)+'</p><p class="note">'+esc(fill(T.rare.got,{n:D.RARE[id][0]}))+' · +60</p>')}}
/* de waarschuwing als gescheurd, getypt briefje met de steen ernaast */
function warnHTML(t){var m=t.match(/^(.*?:)\s*([^a-z]+?\.)\s*([^a-z]+?\.)\s*(.*?)(‘.*’)\s*(.*)$/);if(!m)return '<p class="chalk">'+esc(t)+'</p>';
  var low=function(x){return x.charAt(0)+x.slice(1).toLowerCase()};
  return '<div class="warn"><div class="wt"><p>'+esc(m[1])+'</p><p class="caps">'+esc(m[2])+'</p><p>'+esc(low(m[3]))+'</p><p>'+esc(m[4])+'</p><p class="q">'+esc(m[5])+'</p><p>'+esc(m[6])+'</p></div><img src="'+MW.root+'games/ghosts/warning.webp" alt=""></div>'}
/* locatie 7: het teken leggen, dan kiezen welk bewijs meegaat */
function step7(s){var c=G.c,right=ITEMOF[c.R],sg=D.SIG[c.sig[right]];
  if(G.step7<2)return runPuzzle(s,"tiles",sg+"  "+sg+"  "+sg,function(){G.step7=2;save();step7(s)});
  sheet(head(s)+'<div class="sigil">'+esc(sg)+'</div><h2>'+esc(T.pick)+'</h2><p class="note">'+esc(T.pickHint)+'</p><div class="list" id="pk">'+[0,1,2].map(function(i){return '<button type="button" class="sus item" data-i="'+i+'"><span class="sg">'+esc(D.SIG[c.sig[i]])+'</span><b>'+esc(cap(itemName(c,i)))+'</b></button>'}).join("")+'</div><p class="note" id="pkMsg"></p><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=closeSheet;
  $("#pk").onclick=function(e){var b=e.target.closest("button");if(!b)return;var i=+b.dataset.i;
    if(i!==right){$("#pkMsg").textContent=T.pickWrong;b.classList.add("out");buzz(180);beep(150,.3);return}
    G.item=i;done(s);G.thick=false;buzz([100,60,200]);beep(660,.3);doc(s,'<div class="sigil">'+esc(sg)+'</div><p>'+esc(fill(T.pickRight,{i:itemName(c,i)}))+'</p>')}}

/* ---------- de kaart verandert ---------- */
function glitch(text,ms){var e=$("#glitch");if(!e){e=document.createElement("div");e.id="glitch";e.setAttribute("role","alert");$("#play").appendChild(e)}e.textContent=text;e.dataset.t=text;e.classList.remove("on");void e.offsetWidth;e.classList.add("on");
  $("#map").classList.add("shake");buzz([60,40,60,40,220]);beep(90,.6);clearTimeout(glitch.t);glitch.t=setTimeout(function(){e.classList.remove("on");$("#map").classList.remove("shake")},ms||2600)}
function hid(s){return s.hu>Date.now()}
function move6(quiet){if(G.ev.m6)return;G.ev.m6=1;var s=G.st[5],to=G.sp[0];s.x=to.x;s.y=to.y;s.name=to.name||s.name;s.type=to.type;if(quiet){save();return}
  s.hu=Date.now()+3600;save();glitch(T.ev.gone);setTimeout(function(){if(G&&!$("#play").hidden)glitch(T.ev.found,2400)},3600)}
function add9(quiet){if(G.ev.n9)return;G.ev.n9=1;var p=G.sp[1];G.st.push({x:p.x,y:p.y,type:p.type,name:p.name||T.loc[8],n:9,done:false,hu:quiet?0:Date.now()+3400});save();if(quiet)return;
  glitch(T.ev.not8,2800);setTimeout(function(){if(G&&!$("#play").hidden)glitch(T.ev.nine,2600)},3400)}

/* ---------- zeldzame geesten ---------- */
function addRare(id){var p=MW.profile.get();p.book_ng=p.book_ng||{};var isNew=!p.book_ng[id];p.book_ng[id]=(p.book_ng[id]||0)+1;p.xp+=20*D.RARE[id][1];MW.profile.save(p);G.rare.got.push(id);save();return isNew}
function catchRare(q){if(!G.rare.cur||q!==G.rare.cur)return;var E=D.RARE[q.id];G.rare.cur=null;G.rare.next=Date.now()+40000+Math.random()*55000;var isNew=addRare(q.id);buzz([60,40,160]);beep(880,.2);setTimeout(function(){beep(1180,.3)},140);
  sheet('<div class="eyebrow">'+esc(T.rare.tier[E[1]])+(isNew?" · "+esc(T.rare["new"]):"")+'</div>'+rpic(q.id," wide")+'<h2>'+esc(E[0])+'</h2><p>'+esc(E[3])+'</p><div class="tags"><i>+'+(20*E[1])+'</i></div><button type="button" class="btn" id="shX">'+T.back+'</button>');
  $("#shX").onclick=function(){closeSheet();sel=null;chip()}}
function bookSheet(){var bk=MW.profile.get().book_ng||{},n=Object.keys(bk).length;
  sheet('<div class="eyebrow">'+n+' / '+D.RARE.length+'</div><h2>'+esc(T.rare.book)+'</h2><p class="note">'+esc(T.rare.bookT)+'</p><div class="book">'+D.RARE.map(function(e,i){return '<div'+(bk[i]?'':' class="no"')+'>'+(bk[i]?rpic(i):'<span class="rpic none">?</span>')+'<b>'+(bk[i]?esc(e[0]):"???")+'</b><span class="r'+e[1]+'">'+esc(T.rare.tier[e[1]])+'</span>'+(bk[i]?'<span>×'+bk[i]+'</span>':'')+'</div>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet}
$("#bEcho").onclick=bookSheet;

/* ---------- notitieboek ---------- */
function invHTML(){var c=G.c,have=[G.st[0].done,G.st[2].done,G.st[4].done],any=have.some(Boolean);
  return '<div class="inv"><em>'+esc(T.inv)+'</em>'+(any?[0,1,2].map(function(i){return have[i]?'<span class="'+(G.item===i?"car":"")+'"><b>'+esc(D.SIG[c.sig[i]])+'</b>'+esc(cap(itemName(c,i)))+'</span>':''}).join(""):'<span>'+esc(T.nothing)+'</span>')+'</div>'}
function noteSheet(tab){tab=tab||"found";var c=G.c,fr=G.st.filter(function(s){return s.done&&s.n!==8}).sort(function(a,b){return a.n-b.n});
  var body=tab==="found"?invHTML()+(fr.length?'<div class="list">'+fr.map(function(s){return '<div class="clue"><em><b class="num">'+s.n+'</b>'+esc(T.loc[s.n-1])+' · '+esc(s.name)+'</em><p>'+esc(locText(c,s.n))+'</p></div>'}).join("")+'</div>':'<p class="note">'+T.nbNone+'</p>')
    :tab==="women"?'<div class="list">'+c.w.map(function(i,j){return womanCard(D.WOMEN[i],G.out[j]?" out":"",'data-o="'+j+'"')}).join("")+'</div><p class="note">'+T.nbTip+'</p>'
    :tab==="why"?'<div class="eyebrow">'+esc(T.q2)+'</div><div class="list">'+D.FATE.map(function(f,i){return '<button type="button" data-f="'+i+'" class="sus'+(G.outF[i]?" out":"")+'"><b>'+esc(f[0])+'</b><small>'+esc(f[1])+'</small></button>'}).join("")+'</div><div class="eyebrow">'+esc(T.q3)+'</div><div class="list">'+D.REASON.map(function(f,i){return '<button type="button" data-r="'+i+'" class="sus'+(G.outR[i]?" out":"")+'"><b>'+esc(fill(f[0],vars(c,{N:"…"})))+'</b><small>'+esc(f[1])+'</small></button>'}).join("")+'</div><p class="note">'+T.nbTip+'</p>'
    :(G.rare.got.length?'<div class="list">'+G.rare.got.map(function(id){var e=D.RARE[id];return '<div class="clue"><em>'+esc(T.rare.tier[e[1]])+'</em><b>'+esc(e[0])+'</b><p>'+esc(e[3])+'</p></div>'}).join("")+'</div>':'<p class="note">'+esc(T.rare.bookT)+'</p>')+'<button type="button" class="btn ghost dk" id="nbBook">'+esc(T.rare.book)+'</button>';
  var tb=function(k,l){return '<button type="button" data-t="'+k+'" aria-selected="'+(tab===k)+'">'+l+'</button>'};
  sheet('<div class="tabs">'+tb("found",T.nbFound)+tb("women",T.nbWomen)+tb("why",T.nbWhy)+tb("ghosts",T.nbGhosts)+'</div>'+body+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.id==="shX")closeSheet();else if(b.id==="nbBook")bookSheet();else if(b.dataset.t)noteSheet(b.dataset.t);
    else if(b.dataset.o){G.out[b.dataset.o]=!G.out[b.dataset.o];save();noteSheet("women")}else if(b.dataset.f){G.outF[b.dataset.f]=!G.outF[b.dataset.f];save();noteSheet("why")}else if(b.dataset.r){G.outR[b.dataset.r]=!G.outR[b.dataset.r];save();noteSheet("why")}}}

/* ---------- de laatste plek: drie vragen, en dan verschijnt ze voor het laatst ---------- */
function finalSheet(s){var c=G.c,a=[null,null,null];
  sheet(head(s)+'<p>'+esc(T.last)+'</p><div class="inv"><em>'+esc(T.carry)+'</em><span class="car"><b>'+esc(D.SIG[c.sig[G.item]])+'</b>'+esc(cap(itemName(c,G.item)))+'</span></div>'+
    '<div class="eyebrow">'+esc(T.q1)+'</div><div class="list" id="q0">'+c.w.map(function(i,j){return womanCard(D.WOMEN[i],G.out[j]?" out":"",'data-v="'+j+'"')}).join("")+'</div>'+
    '<div class="eyebrow">'+esc(T.q2)+'</div><div class="list" id="q1">'+D.FATE.map(function(f,i){return '<button type="button" data-v="'+i+'" class="sus'+(G.outF[i]?" out":"")+'"><b>'+esc(f[0])+'</b><small>'+esc(f[1])+'</small></button>'}).join("")+'</div>'+
    '<div class="eyebrow">'+esc(T.q3)+'</div><div class="list" id="q2">'+D.REASON.map(function(f,i){return '<button type="button" data-v="'+i+'" class="sus'+(G.outR[i]?" out":"")+'"><b>'+esc(fill(f[0],vars(c,{N:"…"})))+'</b><small>'+esc(f[1])+'</small></button>'}).join("")+'</div>'+
    '<button type="button" class="btn red" id="vGo">'+T.qGo+'</button><p class="note" id="vMsg"></p><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=closeSheet;
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;var grp=b.parentNode.id;
    if(/^q[012]$/.test(grp)){var k=+grp[1];a[k]=+b.dataset.v;$$("#"+grp+" .sus").forEach(function(x){x.classList.toggle("pick",x===b)});return}
    if(b.id==="vGo"){if(a[0]==null||a[1]==null||a[2]==null){$("#vMsg").textContent=T.qNeed;return}G.tries++;save();
      if(a[0]===c.g&&a[1]===c.F&&a[2]===c.R){done(s);finale()}else{$("#vMsg").textContent=T.qWrong;G.thick=true;buzz(220);beep(140,.5)}}}}
function finale(){var fade=function(){sheet('<canvas class="figc app calm" id="figc" width="300" height="340"></canvas><p class="ctr" id="fadeT">'+esc(PZ.ar.calm)+'</p>',true);var cv=$("#figc"),g=cv.getContext("2d"),t0=0;
    var f=function(ts){if(!cv.isConnected)return;t0=t0||ts;var e=(ts-t0)/1000,al=e<1.5?e/1.5:e<4?1:Math.max(0,1-(e-4)/5);g.clearRect(0,0,300,340);spirit(g,150,166,280,al,true);if(e>4)$("#fadeT").textContent=PZ.ar.fade;if(e>9.3){win();return}mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)};
  if(G.cam==="on"&&camOK())runAR(true,win,fade);else fade()}
function win(){mg.stop();var c=G.c,v=vars(c),min=(Date.now()-G.t0)/60000,s2=G.tries===1,s3=min<=G.par,stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50,km=G.dist/1000,w=ghost(c);
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="gps",min:min,km:km,title:w.n,code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.ng.day=MW.today();MW.profile.save(p)}
  G.won={stars:stars,min:min};G.rare.cur=null;save();buzz([100,50,100,50,300]);beep(520,.3);setTimeout(function(){beep(780,.5)},260);var st=a.prof.streak;
  sheet('<div class="eyebrow">'+T.won+' · '+esc(G.code)+'</div><div class="stars">'+"★".repeat(stars)+"☆".repeat(3-stars)+'</div><img class="wbig" src="'+wsrc(c.w[c.g])+'" alt=""><h2>'+esc(w.n)+'</h2><p class="note">'+esc(w.role)+' · '+esc(fill(T.vanished,{y:w.y,a:w.age}))+'</p>'+
    '<p>'+esc(D.FATEEND[c.F])+' '+esc(fill(D.REASONEND[c.R],v))+'</p><p class="closing">'+esc(T.closing)+'</p>'+
    '<div class="tags"><i>'+Math.round(min)+' min</i><i>'+km.toFixed(1).replace(".",L==="nl"?",":".")+' km</i><i>'+fill(T.pts,{x:xp})+'</i><i>'+G.rare.got.length+' '+esc(T.caught)+'</i>'+(G.mode==="gps"?'<i>'+fill(st===1?T.streakTxt:T.streakTxtP,{n:st})+'</i>':'')+'</div>'+
    (a.up?'<p><b>'+esc(fill(T.up,{r:MW.profile.rankName(a.prof.xp,L)}))+'</b></p>':'')+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+fill(T.missed2,{m:G.par})+'</p>':'')+
    '<button type="button" class="btn" id="vShare">'+T.share+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.toHome+'</button>',true);
  var code=G.code,stxt="★".repeat(stars),mm=Math.round(min);
  $("#vShare").onclick=function(){var url=location.origin+location.pathname+"#z="+code,txt=fill(T.shareTxt,{c:code,s:stxt,m:mm})+" "+url;
    if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
function endCase(){LS.del(GK);LS.del(WK);Wk.stopWatch();G=null;home()}

/* ---------- zaakcode, archief, menu, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note" id="dMsg" style="color:#a5392c"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();setLen(p.short);startGps(p.seed,false)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.ng,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
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
try{history.pushState({ng:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({ng:1},"")}catch(e){}}})}catch(e){}

/* ---------- startscherm: mist, vallende bladeren en flakkerend kaarslicht ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),w,h,ps=[],dpr=1,COL=["204,92,24","168,62,18","224,140,40","120,44,16"];
  function mk(top){return{x:Math.random()*w,y:top?-20:Math.random()*h,r:5+Math.random()*7,v:.4+Math.random()*.9,a:Math.random()*6.28,sp:.5+Math.random()*1.2,c:COL[Math.floor(Math.random()*4)]}}
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;ps=[];for(var i=0;i<(still?8:22);i++)ps.push(mk(false))}
  rs();addEventListener("resize",rs);
  function f(ts){if($("#home").hidden){requestAnimationFrame(f);return}g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);var i;
    for(i=0;i<5;i++){var bx=((i*230+ts*.014*(1+i%2))%(w+400))-200,by=h*(.28+.1*i)+Math.sin(ts/3000+i)*20,br=180+(i%3)*50,fg=g.createRadialGradient(bx,by,10,bx,by,br);fg.addColorStop(0,"rgba(190,205,225,.11)");fg.addColorStop(1,"rgba(190,205,225,0)");g.fillStyle=fg;g.fillRect(bx-br,by-br,br*2,br*2)}
    var fl=.10+.05*Math.sin(ts/230)+.03*Math.sin(ts/71),lg=g.createRadialGradient(w*.5,h*.06,4,w*.5,h*.06,w*.9);lg.addColorStop(0,"rgba(255,150,60,"+fl+")");lg.addColorStop(1,"rgba(255,150,60,0)");g.fillStyle=lg;g.fillRect(0,0,w,h);
    for(i=0;i<ps.length;i++){var p=ps[i];p.a+=.014*p.sp;g.save();g.translate(p.x,p.y);g.rotate(p.a);g.scale(1,.4+.5*Math.abs(Math.sin(p.a*1.6)));g.fillStyle="rgba("+p.c+",.85)";
      g.beginPath();g.moveTo(0,-p.r);g.lineTo(p.r*.5,-p.r*.3);g.lineTo(p.r,-p.r*.2);g.lineTo(p.r*.5,p.r*.25);g.lineTo(p.r*.6,p.r*.8);g.lineTo(0,p.r*.5);g.lineTo(-p.r*.6,p.r*.8);g.lineTo(-p.r*.5,p.r*.25);g.lineTo(-p.r,-p.r*.2);g.lineTo(-p.r*.5,-p.r*.3);g.closePath();g.fill();g.restore();
      p.y+=p.v;p.x+=Math.sin(p.a)*.9;if(p.y>h+14)ps[i]=mk(true)}
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
hero();
/* ---------- start ---------- */
home();MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
var HZ=(location.hash||"").match(/z=([A-Za-z0-9-]+)/);if(HZ)codeSheet(HZ[1]);
window.NG={genCase:genCase,state:function(){return G},open:function(n){var s=G.st.filter(function(x){return x.n===n})[0];if(s){G.force=s;openLoc(s)}},catchNow:function(){if(G.rare.cur)catchRare(G.rare.cur)}};
})();
