/* Ooggetuige / Eyewitness – spel-logica (taalonafhankelijk). Vereist platform.js, catalog.js, walk.js, OG_DATA (data-xx.js) en games/vanishing/puzzles.js.
   Thriller op de motor van De Verdwijning: jij bent de getuige. Op elk punt een bericht van ‘Onbekend’; een achtervolger loopt over je eigen spoor achter je aan
   en komt dichterbij als je stilstaat. Je lost twee dingen op: wie je volgt (K) en wie ‘Onbekend’ is, dus wie je kunt vertrouwen (A). */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.OG_DATA,T=D.T,L=D.lang,esc=MW.esc,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="og",GK="ss_game_og_"+L,WK="ss_ways_og_"+L,rngOf=Wk.rngOf,shuffle=Wk.shuffle,hashStr=MW.hashStr;
var toast=Wk.toast,sheet=Wk.sheet,beep=Wk.beep,buzz=Wk.buzz;function closeSheet(){if(window.mgStop)window.mgStop();Wk.closeSheet()}
var fill=function(s,o){return String(s).replace(/\{(\w+)\}/g,function(m,k){return o&&(k in o)?o[k]:m})};
var G=null,W=[],P={x:0,y:0,acc:0},R0=650,PAR=75,sel=null,walkTo=null,arrived=null,lastT=0,map=null,nearD=1e9;

/* ---------- zaakgenerator: alles waar, niets alleen afdoende ---------- */
var NP=6,ALL=63,PK=D.PK,AK=D.AK,CTK=PK.concat(AK);
function minutes(h,m){return h*60+m}
function fmt(mi){return Math.floor(mi/60)+(L==="nl"?"."+String(mi%60).padStart(2,"0"):":"+String(mi%60).padStart(2,"0"))}
function genCase(seed){
  var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  var M=pick(D.MISSING);
  for(var tries=0;tries<6000;tries++){
    // zes mensen met unieke relatie; elk vier uiterlijke eigenschappen (PK) en vier dingen die ‘Onbekend’ zouden verraden (AK)
    var pool=shuffle(D.CONTACTS,r),con=[],rel={};
    for(var i=0;i<pool.length&&con.length<NP;i++){if(rel[pool[i][1]])continue;rel[pool[i][1]]=1;var tr={};CTK.forEach(function(k){tr[k]=pick(D.CT[k].v)});con.push({name:pool[i][0],rel:pool[i][1],q:pool[i][2]||"",tr:tr})}
    var K=Math.floor(r()*NP),A=Math.floor(r()*(NP-1));if(A>=K)A++;
    // drie sporen per persoon: elk past bij minstens twee mensen, samen bij precies één
    var set=function(keys,who){var cm=shuffle(keys,r).slice(0,3).map(function(k){var v=con[who].tr[k],m=0;con.forEach(function(c,j){if(c.tr[k]===v)m|=1<<j});return{k:k,v:v,m:m}});
      if(cm.some(function(x){return bits(x.m)<2}))return null;return cm.reduce(function(a,x){return a&x.m},ALL)===1<<who?cm:null};
    var pk=set(PK,K),ak=set(AK,A);if(!pk||!ak)continue;
    var kinds={},frags=[],add=function(x,isK){var opts=D.CT[x.k].clue[x.v],c=pick(opts.filter(function(o){return !kinds[o.k]}))||pick(opts);kinds[c.k]=(kinds[c.k]||0)+1;frags.push({k:c.k,t:c.t,who:isK?x.m:ALL,ally:isK?ALL:x.m,trait:x.k})};
    pk.forEach(function(x){add(x,true)});ak.forEach(function(x){add(x,false)});
    frags.push(Object.assign({who:ALL,ally:ALL},pick(D.TIME)));
    frags=shuffle(frags,r);
    var t0=minutes(21,5)+Math.floor(r()*25),span=minutes(23,50)-t0,times=[t0];for(i=1;i<8;i++)times.push(t0+Math.round(span*(i/7))+Math.floor((r()-.5)*8));
    frags.unshift({k:"open",t:D.OPEN,who:ALL,ally:ALL});
    frags.forEach(function(f,i){f.tm=times[i]});
    var c={seed:seed,M:M,con:con,K:K,A:A,frags:frags};
    var sol=solve(c);if(sol.who===1<<K&&sol.ally===1<<A)return c;
  }
  return null}
function bits(m){var n=0;while(m){n+=m&1;m>>=1}return n}
function solve(c){return{who:c.frags.reduce(function(a,f){return a&f.who},ALL),ally:c.frags.reduce(function(a,f){return a&f.ally},ALL)}}
function vars(c,extra){var o={N:c.M.n,msg:c.M.msg,K:c.con[c.K].name,KR:c.con[c.K].rel,A:c.con[c.A].name,AR:c.con[c.A].rel};if(extra)for(var k in extra)o[k]=extra[k];return o}
function fragText(f){return fill(f.t,vars(G.c,{t:fmt(f.tm)}))}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}

/* ---------- figuren (vak 120×160, voeten op y=152) ---------- */
var FP={},fp=function(d){return FP[d]||(FP[d]=new Path2D(d))};
function figBox(c,x,y,s,al,fn){c.save();c.globalAlpha=al;c.translate(x,y);c.scale(s/150,s/150);c.translate(-60,-80);c.lineJoin="round";c.lineCap="round";fn();c.restore()}
function wet(c,rx,a){var g=c.createRadialGradient(60,152,2,60,152,rx);g.addColorStop(0,"rgba(240,150,60,"+a+")");g.addColorStop(1,"rgba(240,150,60,0)");c.save();c.translate(0,152);c.scale(1,.26);c.translate(0,-152);c.fillStyle=g;c.beginPath();c.arc(60,152,rx,0,7);c.fill();c.restore();
  var r=c.createLinearGradient(0,152,0,176);r.addColorStop(0,"rgba(5,4,5,.7)");r.addColorStop(1,"rgba(5,4,5,0)");c.fillStyle=r;c.fillRect(46,152,30,24)}
/* de vermiste: op de rug gezien, lopend, capuchon op en rugzak om (bewust geen man of vrouw), tegen het laatste avondlicht */
function walker(c,x,y,s,col,al){figBox(c,x,y,s,al,function(){
  var h=c.createRadialGradient(60,60,6,60,70,100);h.addColorStop(0,"rgba(232,120,70,.30)");h.addColorStop(1,"rgba(232,120,70,0)");c.fillStyle=h;c.beginPath();c.arc(60,70,100,0,7);c.fill();
  wet(c,70,.5);
  c.fillStyle="#070506";
  c.fill(fp("M45 86 H61 L56 120 L51 152 H41 L45 120 Z M58 86 H76 L74 116 L82 146 L73 152 L65 122 L60 98 Z"));
  c.fill(fp("M45 44 C52 39 68 39 75 44 L78 88 H42 Z"));
  c.strokeStyle="#070506";c.lineWidth=7;c.stroke(fp("M46 47 C39 60 39 74 41 90 M74 47 C81 60 82 72 80 88"));
  c.fill(fp("M50 25 C47 7 73 7 70 25 C71 35 69 42 66 46 H54 C51 42 49 35 50 25 Z"));
  c.fillStyle="#1c1616";c.strokeStyle="rgba(240,150,60,.55)";c.lineWidth=1.1;var bp=fp("M50 52 Q50 47 55 47 H65 Q70 47 70 52 V78 Q70 83 65 83 H55 Q50 83 50 78 Z");c.fill(bp);c.stroke(bp);
  c.stroke(fp("M53 62 H67 M55 47 C54 44 54 42 55 41 M65 47 C66 44 66 42 65 41"));
  c.strokeStyle=col;c.lineWidth=1.7;c.stroke(fp("M70 25 C71 35 69 42 66 46 M75 44 L78 88 M76 86 L74 116 L82 146 M80.5 60 C82 70 81.5 80 80 88"));
  c.fillStyle="#d9d2c4";c.fill(fp("M73 152 L82 146 L84 150 L76 155 Z"))})}
/* de achtervolger: capuchon op, geen gezicht, handen in de zakken; koud randlicht, een lantaarn achter hem */
var SIMG=new Image();SIMG.src=MW.root+"games/witness/stalker.webp";
function tint(h,a){return "rgba("+parseInt(h.slice(1,3),16)+","+parseInt(h.slice(3,5),16)+","+parseInt(h.slice(5,7),16)+","+a+")"}
function ph(k,cls){return '<img class="'+(cls||"ph")+'" src="'+MW.root+'games/witness/p-'+k+'.webp" alt="" width="720" height="620">'}
function fid(f){var i,k,v,a;if(f.k==="open")return "open";for(i=0;i<(D.SC||[]).length;i++)if(D.SC[i].t===f.t)return "SC:"+i;for(i=0;i<D.TIME.length;i++)if(D.TIME[i].t===f.t)return "TIME:"+i;for(k in D.CT)for(v in D.CT[k].clue){a=D.CT[k].clue[v];for(i=0;i<a.length;i++)if(a[i].t===f.t)return k+":"+v+":"+i}return ""}
var FPH={"auto:ja:0":"car","auto:ja:1":"car","auto:nee:0":"ticket","rookt:nee:0":"ticket","nummer:oud:1":"ticket","nummer:nieuw:1":"ticket","TIME:0":"shadows","TIME:2":"cam","TIME:3":"arrow"};
function phF(f){return FPH[fid(f)]||(f.k==="cam"?"cam":f.k==="wit"?"passer":f.k==="time"?"window":"found")}
function stalker(c,x,y,s,col,al){
  if(SIMG.naturalWidth){c.save();c.globalAlpha=al;var cy=y-s*.08,g0=c.createRadialGradient(x,cy,s*.05,x,cy,s*.72);g0.addColorStop(0,tint(col,.5));g0.addColorStop(.55,tint(col,.18));g0.addColorStop(1,tint(col,0));c.fillStyle=g0;c.beginPath();c.arc(x,cy,s*.72,0,7);c.fill();
    var sh=s*1.14,sw=sh*SIMG.naturalWidth/SIMG.naturalHeight;c.drawImage(SIMG,x-sw/2,y-sh/2,sw,sh);c.restore();return}
  figBox(c,x,y,s,al,function(){
  var h=c.createRadialGradient(60,40,4,60,60,96);h.addColorStop(0,"rgba(240,150,60,.34)");h.addColorStop(1,"rgba(240,150,60,0)");c.fillStyle=h;c.beginPath();c.arc(60,60,96,0,7);c.fill();
  wet(c,64,.4);
  c.fillStyle="#040405";
  c.fill(fp("M46 104 H60.5 L58.5 152 H47 Z M60.5 104 H75 L73.5 152 H62.5 Z"));
  c.fill(fp("M39 57 C46 46 74 46 81 57 L85 102 C76 109 44 109 35 102 Z"));
  c.fill(fp("M47 31 C44 9 76 9 73 31 C74 42 69 49 60 49 C51 49 46 42 47 31 Z"));
  c.strokeStyle="#040405";c.lineWidth=8;c.stroke(fp("M41 60 C36 74 38 88 46 94 M79 60 C84 74 82 88 74 94"));
  c.fillStyle="#000";c.beginPath();c.ellipse(60,33,8,10,0,0,7);c.fill();
  c.globalAlpha*=.6;c.strokeStyle=col;c.lineWidth=1.3;c.stroke(fp("M71.5 22 C73.5 28 74 38 70.5 44 M81 57 L85 102 M73.5 152 L75 106"))})}
/* getuigen: voorbijgangers in het lantaarnlicht. Drie types: met paraplu, met capuchon, met hond */
var WIT=[
  {b:"M28 34 C34 8 86 8 92 34 C84 30 76 30 70 34 C66 30 54 30 50 34 C44 30 36 30 28 34 Z M60 38 a7.4 7.4 0 1 0 .01 0 Z M46 58 C52 54 68 54 74 58 L79 114 H68 L67 152 H60.5 L59.5 116 L57 152 H50 L49 114 H41 Z",r:"M92 34 C84 30 76 30 70 34 M74 58 L79 114 M67 152 L68 114",x:"M60 12 V60"},
  {b:"M50 34 C48 18 72 18 70 34 C72 42 68 48 60 48 C52 48 48 42 50 34 Z M44 52 C52 46 68 46 76 52 L80 108 H69 L67 152 H60.5 L59.5 112 L57 152 H50 L48 108 H40 Z",r:"M70 34 C72 42 68 48 62 48 M76 52 L80 108 M67 152 L69 108",x:"M46 60 C42 76 44 90 50 96 M74 60 C78 76 76 90 70 96"},
  {b:"M60 22 a7.6 7.6 0 1 0 .01 0 Z M46 42 C52 38 68 38 74 42 L78 100 H68 L67 152 H60.5 L59.5 106 L57 152 H50 L49 100 H42 Z M92 132 C98 128 108 128 112 132 L116 128 L116 138 C114 142 112 142 112 152 H108 V144 H98 V152 H94 V142 C90 140 90 136 92 132 Z",r:"M74 42 L78 100 M67 152 L68 100 M112 132 L116 128 L116 138",x:"M77 74 L94 132"}
];
function witness(c,x,y,s,col,al,v){var W=WIT[(v||0)%3];figBox(c,x,y,s,al,function(){wet(c,66,.55);
  c.fillStyle="#070506";c.fill(fp(W.b));c.strokeStyle="#070506";c.lineWidth=2.2;c.stroke(fp(W.x));c.strokeStyle=col;c.lineWidth=1.7;c.stroke(fp(W.r))})}
/* speld op de kaart: onbekend = donkere schijf met amberen rand; gevonden = rood genummerd punt, zoals op de plattegrond van de sfeerfoto */
function pin(c,X,Y,kind,col,done,n){c.save();
  if(done){c.fillStyle="#b3222b";c.beginPath();c.arc(X,Y,12,0,7);c.fill();c.strokeStyle="rgba(255,255,255,.75)";c.lineWidth=1.2;c.stroke();c.fillStyle="#f4ece0";c.font="15px 'Special Elite',monospace";c.textAlign="center";c.textBaseline="middle";c.fillText(n,X,Y+1);c.textBaseline="alphabetic"}
  else{var g=c.createRadialGradient(X,Y,6,X,Y,44);g.addColorStop(0,"rgba(240,150,60,.40)");g.addColorStop(1,"rgba(240,150,60,0)");c.fillStyle=g;c.beginPath();c.arc(X,Y,44,0,7);c.fill();
    c.fillStyle="#120d0d";c.beginPath();c.arc(X,Y,17,0,7);c.fill();c.strokeStyle="#f0963c";c.lineWidth=2;c.stroke();Wk.icon(c,kind,X,Y,21,col)}
  c.restore()}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get(),i=MW.profile.rank(p.xp),nx=MW.profile.next(p.xp),R=MW.profile.RANKS.nl[i][0],t=MW.t(L);
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.og&&p.games.og.n)||0;
  $("#pXp").style.width=(nx?Math.round((p.xp-R)/(nx[0]-R)*100):100)+"%";
  $("#pNext").textContent=nx?MW.fill(t.pts,{x:p.xp,n:nx[0]-p.xp,r:MW.profile.RANKS[L][i+1][1]}):MW.fill(t.ptsTop,{x:p.xp});
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(),lk=MW.pro.locked(ID),playedToday=(p.games.og&&p.games.og.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;
  $("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  show("home")}
function show(id){["home","brief","play"].forEach(function(s){$("#"+s).hidden=s!==id});if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro")+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;R0=+b.dataset.r;PAR=+b.dataset.par;$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
function setLen(short){var b=$$("#len button")[short?0:1];if(b)b.click()}
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();startGps(hashStr("og|"+MW.today()),true)};
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
  G={mode:mode,R:R0,par:PAR,seed:seed,c:c,st:st,echo:echo,t0:0,dist:0,tries:0,origin:origin,px:0,py:0,daily:!!daily,code:codeOf(PAR,seed),out:{},outS:{},fd:140,trail:[],seen:false,warn:0};
  W=ways;P={x:0,y:0,acc:0};LS.set(WK,W);
  var v=vars(c);
  $("#bfNo").textContent=T.brief+" "+G.code+(mode==="demo"?" · "+T.demoCase:"");
  $("#bfTitle").textContent=c.M.n;$("#bfSub").textContent=T.missing;
  $("#bfText").textContent=fill(c.M.bio,v);
  $("#bfMsgH").textContent=fill(T.lastMsg,{t:fmt(c.frags[0].tm)});$("#bfMsg").textContent=c.M.msg;$("#bfLie").textContent=T.quoteNote;
  $("#bfConH").textContent=fill(T.contacts,v);
  $("#bfCon").innerHTML=c.con.map(function(k){return conCard(k,v)}).join("");
  show("brief")}
function tagsOf(k,v){var g=function(keys){return '<div class="tags">'+keys.map(function(t){return"<i>"+esc(fill(D.CT[t].tag[k.tr[t]],v))+"</i>"}).join("")+'</div>'};return g(PK)+g(AK)}
function conCard(k,v,cls){return '<div class="sus'+(cls||"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small>'+quote(k)+tagsOf(k,v)+'</div>'}
function quote(k){return k.q?'<p class="q">'+esc(k.q)+'</p>':''}
$("#bGo").onclick=function(){G.t0=Date.now();if(G.mode==="gps")MW.pro.setFree(ID);save();enter()};
$("#bBack").onclick=function(){G=null;home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}
function codeOf(par,seed){return"OG"+(par<=40?"S":"L")+"-"+(seed>>>0).toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);if(!/^OG[SL]/.test(c)||c.length<4||c.length>11)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;return{short:c[2]==="S",seed:seed}}

/* ---------- spelen ---------- */
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
/* hartslag: twee doffe tikken; interval 1,5 s (ver) tot 0,45 s (vlakbij). Geeft 0..1 terug voor de pulserende beelden. */
var HB={t:0,p:0};
function heart(t){if(!G||G.won||G.fd>=110)return 0;var iv=450+Math.max(0,G.fd-30)*13;if(t-HB.t>iv){HB.t=t;
    if($("#sheet").hidden&&$("#ar").hidden){beep(64,.09);setTimeout(function(){beep(52,.11)},150);if(G.fd<70)buzz(G.fd<45?[35,110,45]:25)}}
  var d=t-HB.t;return d<120?1-d/120:d>150&&d<300?.7*(1-(d-150)/150):0}
/* achtervolger: loopt over jouw eigen spoor, G.fd meter achter je */
function flash(){var e=document.getElementById("fflash");if(!e){e=document.createElement("div");e.id="fflash";$("#play").appendChild(e)}e.classList.remove("on");void e.offsetWidth;e.classList.add("on")}
function fpos(){var tr=G.trail||[],d=G.fd,x=P.x,y=P.y;for(var i=tr.length-1;i>=0;i--){var dx=tr[i][0]-x,dy=tr[i][1]-y,l=Math.hypot(dx,dy);if(l>=d&&l>0)return[x+dx/l*d,y+dy/l*d];d-=l;x=tr[i][0];y=tr[i][1]}
  var a=(G.seed%628)/100;return[x+Math.cos(a)*d,y+Math.sin(a)*d]}
function items(){var it=[];
  it.push({x:P.x,y:P.y,tap:false,draw:function(cx,X,Y,t,api){var tr=G.trail||[],sz=api.size(),w=sz[0],h=sz[1],i;
    if(tr.length>1){cx.save();cx.strokeStyle="rgba(240,150,60,.3)";cx.lineWidth=2;cx.setLineDash([2,6]);cx.beginPath();tr.forEach(function(p,k){var x=api.sx(p[0]),y=api.sy(p[1]);k?cx.lineTo(x,y):cx.moveTo(x,y)});cx.lineTo(X,Y);cx.stroke();cx.restore()}
    if(!api.still){cx.save();cx.strokeStyle="rgba(200,205,215,.10)";cx.lineWidth=1;cx.beginPath();for(i=0;i<30;i++){var rx=(i*173.3+t*.05)%w,ry=(i*97.7+t*.5*(1+(i%3)*.2))%h;cx.moveTo(rx,ry);cx.lineTo(rx-3,ry+17)}cx.stroke();cx.restore()}
    if(G.won)return;
    var f=fpos(),fx=api.sx(f[0]),fy=api.sy(f[1]),k=Math.max(0,Math.min(1,(110-G.fd)/80)),near=G.fd<60,beat=heart(t),pulse=api.still?0:beat;
    // voetstappen van hem naar jou: hoe dichterbij, hoe roder
    var dx=X-fx,dy=Y-fy,len=Math.hypot(dx,dy)||1,n=Math.max(2,Math.floor(len/16));cx.save();cx.fillStyle=near?"rgba(224,84,95,.85)":"rgba(143,163,184,.55)";
    for(i=1;i<n;i++){var u=((i+(api.still?0:(t/600)%1))/n),px=fx+dx*u,py=fy+dy*u,sd=i%2?4:-4;cx.beginPath();cx.ellipse(px-dy/len*sd,py+dx/len*sd,3.2,1.8,Math.atan2(dy,dx),0,7);cx.fill()}cx.restore();
    // rode ringen om hem heen
    cx.save();for(i=0;i<3;i++){var q=api.still?.5:((t/1400+i/3)%1);cx.strokeStyle="rgba(224,84,95,"+((.25+.5*k)*(1-q))+")";cx.lineWidth=2;cx.beginPath();cx.arc(fx,fy,18+q*(30+50*k),0,7);cx.stroke()}cx.restore();
    stalker(cx,fx,fy-8,64+12*k+pulse*6,near?"#ff6b74":"#b9c6d6",1);
    cx.save();cx.font="600 13px 'Barlow Condensed','Arial Narrow',sans-serif";cx.textAlign="center";cx.shadowColor="#000";cx.shadowBlur=6;cx.fillStyle=near?"#ff6b74":"#d5dbe4";cx.fillText(T.behind.toUpperCase()+" · "+Math.round(G.fd)+" M",fx,fy+46);cx.restore();
    // buiten beeld? pijl aan de rand
    if(fx<16||fx>w-16||fy<70||fy>h-150){var ax=Math.max(26,Math.min(w-26,fx)),ay=Math.max(86,Math.min(h-170,fy)),an=Math.atan2(fy-ay,fx-ax);cx.save();cx.translate(ax,ay);cx.rotate(an);cx.fillStyle="rgba(224,84,95,"+(.7+.3*pulse)+")";cx.beginPath();cx.moveTo(14,0);cx.lineTo(-8,-10);cx.lineTo(-3,0);cx.lineTo(-8,10);cx.closePath();cx.fill();cx.restore();
      cx.save();cx.font="600 12px 'Barlow Condensed','Arial Narrow',sans-serif";cx.textAlign="center";cx.fillStyle="#ff6b74";cx.shadowColor="#000";cx.shadowBlur=6;cx.fillText(Math.round(G.fd)+" M",ax,ay+24);cx.restore()}
    // rode waas vanaf de rand, klopt mee met de hartslag
    if(k>0){var vg=cx.createRadialGradient(w/2,h/2,Math.min(w,h)*(.55-.25*k),w/2,h/2,Math.max(w,h)*.75);vg.addColorStop(0,"rgba(160,16,26,0)");vg.addColorStop(1,"rgba(160,16,26,"+(k*(.35+.3*pulse))+")");cx.fillStyle=vg;cx.fillRect(0,0,w,h)}}});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var f=G.c.frags[s.fi],bob=api.still?0:Math.sin(t/500)*3,col=KCOL[f.k]||"#f0963c";
    if(s.done)pin(cx,X,Y,f.k,col,true,s.fi+1);
    else if(f.k==="wit")witness(cx,X,Y-6,54,"#f0963c",1,s.fi);
    else if(f.k==="cam")stalker(cx,X,Y-6,52,"#8fa3b8",.9);
    else{pin(cx,X,Y+bob*.3,f.k,col,false);if(!api.still){cx.strokeStyle=col;cx.globalAlpha=.6-((t/1500)%1)*.6;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*18,0,7);cx.stroke();cx.globalAlpha=1}}
    var big=!s.done&&(f.k==="wit"||f.k==="cam");
    if(sel===s){cx.strokeStyle="#f4ece0";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,big?34:24,0,7);cx.stroke()}
    cx.font=MAPFONT;cx.shadowColor="#000";cx.shadowBlur=6;cx.fillStyle=s.done?"#9a8d80":"#f4ece0";if(api.V.s>=.4||sel===s)cx.fillText((s.done?fmt(f.tm)+" · ":"")+s.name.toUpperCase().slice(0,26),X,Y+(big?46:s.done?28:40));cx.shadowBlur=0}})});
  (G.echo||[]).forEach(function(q){if(q.done||dTo(q)>200)return;var tier=D.ECHO[q.id][1];it.push({x:q.x,y:q.y,ref:q,tap:true,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/400)*3,col=tier===3?"#f0963c":tier===2?"#e0545f":"#f4ece0";
    cx.save();cx.globalAlpha=api.still?.9:.55+.4*Math.abs(Math.sin(t/300));var g=cx.createRadialGradient(X,Y-bob,2,X,Y-bob,26);g.addColorStop(0,col);g.addColorStop(1,"rgba(0,0,0,0)");cx.fillStyle=g;cx.beginPath();cx.arc(X,Y-bob,26,0,7);cx.fill();
    Wk.icon(cx,"echo",X,Y-bob,18,col);cx.restore();
    cx.font=MAPFONT;cx.fillStyle="#f4ece0";cx.fillText(D.ECHOT.name,X,Y+36);if(sel===q){cx.strokeStyle="#f4ece0";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,24,0,7);cx.stroke()}}})});
  if(G.won&&G.epi&&!G.epi.done){var e=G.epi;it.push({x:e.x,y:e.y,ref:e,tap:true,draw:function(cx,X,Y,t,api){witness(cx,X,Y-6,60,"#f0963c",.7+.3*Math.abs(Math.sin(t/300)),G.seed);cx.font=MAPFONT;cx.fillStyle="#f3c9a0";cx.fillText(PZ.epi.name.toUpperCase(),X,Y+48);if(sel===e){cx.strokeStyle="#f4ece0";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,26,0,7);cx.stroke()}}})}
  return it}
function enter(){
  show("play");if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return G?G.R:650},theme:{bg:"#060607",water:"#090d12",waterEdge:"#1f2a36",ripple:"rgba(143,163,184,.14)",park:"#0b0f0b",parkEdge:"#1e2a1d",river:"#0f1822",major:"#3a3d44",minor:"#15161a",road:"#22242a",label:"#6f7782",waterLabel:"#56708c",ring:"rgba(240,150,60,.22)",me:"#f0963c",meHalo:"rgba(240,150,60,.14)",meRing:"rgba(240,150,60,.55)",font:MAPFONT},items:items,onTap:function(hit,w){
    if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(G.R);sel=null;walkTo=null;arrived=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="gps")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d});
  tick.q=null;HB.t=0;if(!document.getElementById("fbar")){var fbE=document.createElement("div");fbE.id="fbar";fbE.innerHTML="<i></i>";$("#play").appendChild(fbE)}toast(G.mode==="demo"?T.demoTip:T.fHint);if(G.mode==="demo")setTimeout(function(){if(G&&!G.won)toast(T.fHint)},3200);
  requestAnimationFrame(loop)}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=90*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tick()}requestAnimationFrame(loop)}
function tick(){
  var el=Math.floor((Date.now()-G.t0)/1000),done=G.st.filter(function(s){return s.done}).length;
  // de achtervolger: komt dichterbij als je stilstaat (niet terwijl je leest), raakt achterop als je doorloopt
  if(!G.won){var now=Date.now(),tr=G.trail,l=tr[tr.length-1];if(!l||Math.hypot(P.x-l[0],P.y-l[1])>8){tr.push([Math.round(P.x),Math.round(P.y)]);if(tr.length>70)tr.shift()}
    // gps komt met horten: reken met je snelheid over de laatste 8 seconden
    var q=tick.q||(tick.q=[]);q.push([now,G.dist]);while(q.length>1&&now-q[0][0]>8000)q.shift();var sp=q.length>1?(G.dist-q[0][1])/Math.max(1,(now-q[0][0])/1000):0;
    var busy=!$("#sheet").hidden||!$("#ar").hidden;
    if(!busy){if(sp>.55)G.fd=Math.min(140,G.fd+(G.mode==="demo"?1.2:.45));else G.fd=Math.max(22,G.fd-.8);
      // af en toe versnelt hij, ook als je doorloopt
      if(!G.nextRush)G.nextRush=now+45000+Math.random()*40000;
      if(now>G.nextRush){G.nextRush=now+50000+Math.random()*45000;if(G.fd>58){G.fd=Math.max(48,G.fd-32);toast(T.rush[Math.floor(Math.random()*T.rush.length)]);buzz([60,60,60,60,160]);beep(110,.35)}}}
    else G.nextRush=Math.max(G.nextRush||0,now+15000);
    // berichten van Onbekend als hij een grens passeert
    var lv=G.fd<=30?3:G.fd<=45?2:G.fd<=70?1:0;if(G.lv==null)G.lv=0;
    if(lv>G.lv&&!busy){if(lv===3){G.seen=true;flash();toast(T.closeIn[Math.floor(Math.random()*T.closeIn.length)]);buzz([300,90,300,90,500]);beep(140,.6)}else{toast(T.fMsg[lv-1]);buzz(lv===2?[120,80,120]:80)}}
    else if(lv<G.lv&&lv===0)toast(T.lost);
    G.lv=busy?Math.min(G.lv,lv):lv;
    $("#hD").parentNode.classList.toggle("danger",G.fd<70);var fb=$("#fbar i");if(fb){fb.style.width=Math.round(Math.max(0,Math.min(1,(140-G.fd)/110))*100)+"%";fb.parentNode.classList.toggle("hot",G.fd<45)}}
  $("#hT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#hS").textContent=done+"/8";$("#hG").textContent=(G.echo||[]).filter(function(q){return q.done}).length+"/3";$("#hD").textContent=G.won?"–":Math.round(G.fd)+" m";
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
var KCOL={open:"#e0545f",cam:"#f3c9a0",msg:"#f4ece0",wit:"#f0963c",obj:"#f0963c",time:"#c9c2b8"},MAPFONT="600 12px 'Barlow Condensed','Arial Narrow',sans-serif";
var PZ=D.PZ,mg={raf:0,tm:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[]}};window.mgStop=function(){mg.stop()};
function puzzleKey(s){var f=G.c.frags[s.fi];return f.k==="open"?"hold":f.k==="cam"?"lamp":f.k==="wit"?"radio":f.k==="msg"?"pin":f.k==="obj"?(s.fi%2?"tiles":"dust"):"seq"}
function finish(s){mg.stop();s.done=true;G.force=null;buzz(200);beep(880,.35);save();reveal(s)}
function encounter(s){walkTo=null;var f=G.c.frags[s.fi];
  if(f.k==="cam"&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&G.cam!=="off"){if(G.cam==="on")return startAR(s);
    sheet(ph("cam")+'<div class="eyebrow">'+esc(s.name)+'</div><h2>'+esc(PZ.ar.h)+'</h2><p>'+esc(fill(PZ.ar.t,vars(G.c)))+'</p><button type="button" class="btn" id="arYes">'+PZ.ar.yes+'</button><button type="button" class="btn ghost dk" id="arNo">'+PZ.ar.no+'</button>');
    $("#arYes").onclick=function(){startAR(s)};$("#arNo").onclick=function(){G.cam="off";save();puzzle(s)};return}
  puzzle(s)}
function puzzle(s){var f=G.c.frags[s.fi],key=puzzleKey(s),wit=f.k==="wit";
  if(key==="hold")return holdSheet(s);
  var I=PZ[key];
  sheet('<div class="eyebrow">'+esc(s.name)+(wit?" · "+esc(s.persona):" · "+esc(T.kinds[f.k]))+' · '+esc(fill(T.found,{i:s.fi+1,t:fmt(f.tm)}))+'</div><h2>'+esc(I[0])+'</h2><p id="mgHint">'+esc(I[1])+'</p><div id="mgbox"></div><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=function(){mg.stop();closeSheet()};
  var box=$("#mgbox"),fin=false;
  var o={box:box,P:PZ,mg:mg,beep:beep,buzz:buzz,toast:toast,shuffle:shuffle,ghost:stalker,label:wit?fragText(f).slice(0,44)+"…":T.kinds[f.k]+" · "+fmt(f.tm),
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
/* kijkrichting van de camera aan de achterkant, uit de volledige stand van het toestel (alpha, beta en gamma samen).
   Alleen alpha gebruiken geeft sprongen zodra je de telefoon rechtop houdt; daarom rekenen we de richting van de lens zelf uit. */
function camHead(e){if(e.alpha==null)return e.webkitCompassHeading!=null?e.webkitCompassHeading:null;if(e.beta==null||e.gamma==null)return (360-e.alpha)%360;
  var r=Math.PI/180,A=e.alpha*r,B=e.beta*r,C=e.gamma*r,sA=Math.sin(A),cA=Math.cos(A),sB=Math.sin(B),cB=Math.cos(B),sC=Math.sin(C),cC=Math.cos(C),E=-(cC*sA*sB+cA*sC),N=-(sA*sC-cA*cC*sB);
  if(Math.abs(E)+Math.abs(N)<.2)return null;return (Math.atan2(E,N)/r+360)%360}
function startAR(s){closeSheet();var ar=$("#ar"),v=$("#arV"),c=$("#arC"),hint=$("#arH");
  var req=navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
  try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")DeviceOrientationEvent.requestPermission().catch(function(){})}catch(e){}
  req.then(function(stream){G.cam="on";save();AR.on=true;v.srcObject=stream;ar.hidden=false;var g=c.getContext("2d"),dpr=1,w=0,h=0,head=null,dragH=180,target=90+Math.random()*180,hold=0,last=0,fin=false,hasOri=false;
    var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=c.clientWidth;h=c.clientHeight;c.width=w*dpr;c.height=h*dpr};rs();addEventListener("resize",rs);
    var ori=function(e){var a=camHead(e);if(a!=null){if(head==null)head=a;else{var dh=((a-head)%360+540)%360-180;head=(head+dh*.4+360)%360}hasOri=true}};
    addEventListener("deviceorientation",ori);
    var pd=null;c.addEventListener("pointerdown",function(e){pd=[e.clientX,dragH]});c.addEventListener("pointermove",function(e){if(pd&&!hasOri)dragH=pd[1]-(e.clientX-pd[0])*.35});c.addEventListener("pointerup",function(){pd=null});
    var stop=function(){AR.on=false;fin=true;removeEventListener("deviceorientation",ori);removeEventListener("resize",rs);try{stream.getTracks().forEach(function(t){t.stop()})}catch(e){}v.srcObject=null;ar.hidden=true};
    AR.stop=stop;
    $("#arX").onclick=function(){stop();puzzle(s)};
    hint.textContent=PZ.ar.drag;mg.tm.push(setTimeout(function(){if(!hasOri&&!fin)hint.textContent=PZ.ar.drag},1500));
    var f=function(ts){if(fin)return;var dt=Math.min(.1,(ts-last)/1000)||0;last=ts;var H=hasOri?head:dragH;var d=((target-H)%360+540)%360-180;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
      var fov=60,x=w/2+d/fov*w,y=h*.58,vis=Math.abs(d)<fov*.9;
      if(vis){var sc=120+Math.max(0,20-Math.abs(d))*2;stalker(g,x,y-sc*.1,sc+hold*60,"#8fa3b8",.75+.2*Math.abs(Math.sin(ts/300)))}
      g.strokeStyle="rgba(240,166,58,.8)";g.lineWidth=2;g.beginPath();g.arc(w/2,y,44,0,7);g.stroke();
      var near=Math.abs(d)<15;hold=near?hold+dt:Math.max(0,hold-dt*1.5);if(near){g.strokeStyle="#f4ece0";g.lineWidth=5;g.beginPath();g.arc(w/2,y,52,-1.57,-1.57+6.283*Math.min(1,hold/1.2));g.stroke()}
      hint.textContent=near?PZ.ar.hold:d<-15?PZ.ar.left:d>15?PZ.ar.right:"";
      if(hold>=1.2){toast(PZ.ar.found);stop();finish(s);return}
      requestAnimationFrame(f)};requestAnimationFrame(f)
  }).catch(function(){G.cam="off";save();puzzle(s)})}
function chatHead(sub){return '<div class="chathead"><span class="av"></span><span><b>'+esc(T.unknown)+'</b><small>'+esc(sub)+'</small></span></div>'}
function reveal(s){var f=G.c.frags[s.fi],v=vars(G.c),n=G.st.filter(function(x){return x.done}).length,beats=D.BEATS[Math.max(0,Math.min(7,n-1))],tm=fmt(f.tm),bub=function(t){return '<p>'+esc(t)+'<i>'+tm+'</i></p>'};
  var att=f.k==="open"||f.k==="msg"?bub(fragText(f).replace(/^[^“]*“|”$/g,"")):
    '<div class="att k-'+f.k+'">'+ph(phF(f),"aph")+'<em>'+esc(f.k==="wit"?cap(s.persona):T.kinds[f.k])+' · '+tm+'</em><span>'+esc(fragText(f))+'</span></div>';
  sheet(chatHead(s.name+" · "+fill(T.found,{i:n,t:tm}))+'<div class="chat">'+(f.k==="open"?ph("phone","aph solo")+att:beats.map(bub).join("")+att)+(n<8?bub(T.next):"")+'</div><button type="button" class="btn" id="shX">'+T.back+'</button>');
  var fc=$("#figc");if(fc){var fg=fc.getContext("2d");if(f.k==="cam")stalker(fg,120,112,200,"#8fa3b8",1);else witness(fg,120,112,200,"#f0963c",1,s.fi)}
  $("#shX").onclick=function(){closeSheet();sel=null;chip();if(G.st.every(function(x){return x.done}))toast(T.radarAll)}}

/* ---------- echo's: voorwerpen van de vermiste, alleen dichtbij zichtbaar ---------- */
function echoPuzzle(q){walkTo=null;var E=D.ECHO[q.id],tier=E[1],key=tier===3?"lamp":tier===2?"tiles":"dust",I=PZ[key],v=vars(G.c);
  sheet('<div class="eyebrow">'+esc(fill(D.ECHOT.eye,v))+' · '+esc(D.ECHOT.tier[tier])+'</div><h2>'+esc(I[0])+'</h2><p>'+esc(I[1])+'</p><div id="mgbox"></div><button type="button" class="btn ghost dk" id="mgSkip">'+T.later+'</button>',true);
  $("#mgSkip").onclick=function(){mg.stop();closeSheet()};var box=$("#mgbox"),fin=false;
  var o={box:box,P:PZ,mg:mg,beep:beep,buzz:buzz,toast:toast,shuffle:shuffle,ghost:stalker,label:E[0],done:function(){if(fin)return;fin=true;$("#mgSkip").hidden=true;echoFound(q)},
    canvas:function(){box.innerHTML='<canvas class="sq" width="260" height="260"></canvas>';return box.firstChild},at:function(e,c){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*260,(e.clientY-b.top)/b.height*260]}};
  window.VZ_PUZ[key](o)}
function echoFound(q){mg.stop();q.done=true;G.force=null;buzz(200);beep(880,.35);var E=D.ECHO[q.id],v=vars(G.c),c=G.c;
  var p=MW.profile.get();p.book_og=p.book_og||{};var isNew=!p.book_og[q.id];p.book_og[q.id]=(p.book_og[q.id]||0)+1;p.xp+=20*E[1];MW.profile.save(p);
  // tip: één verkeerde persoon die nog niet is doorgestreept valt af
  var cand=c.con.map(function(k,i){return i}).filter(function(i){return i!==c.K&&!G.out[i]}),tip="";
  if(cand.length){var r=rngOf(G.seed^q.id),i=cand[Math.floor(r()*cand.length)];G.out[i]=true;tip=fill(D.ECHOT.tip,{X:c.con[i].name,XR:c.con[i].rel,r:D.ECHOT.reasons[Math.floor(r()*D.ECHOT.reasons.length)]})}
  save();
  sheet('<div class="eyebrow">'+esc(D.ECHOT.tier[E[1]])+(isNew?" · "+esc(T.kinds.obj):"")+'</div><h2>'+esc(E[0])+'</h2>'+ph("dropped")+'<div class="clue"><p>'+esc(fill(E[2],v))+'</p></div>'+(tip?'<p class="note"><b>'+esc(tip)+'</b></p>':'')+'<div class="tags"><i>+'+(20*E[1])+'</i></div><button type="button" class="btn" id="shX">'+T.back+'</button>');
  $("#shX").onclick=function(){closeSheet();sel=null;chip()}}
function echoBook(){var p=MW.profile.get(),bk=p.book_og||{},n=Object.keys(bk).length,v=G?vars(G.c):{N:"…"};
  sheet('<div class="eyebrow">'+n+' / '+D.ECHO.length+'</div><h2>'+esc(D.ECHOT.book)+'</h2><p class="note">'+esc(fill(D.ECHOT.bookT,v))+'</p><div class="book">'+D.ECHO.map(function(e,i){return '<div'+(bk[i]?'':' class="no"')+'><b>'+(bk[i]?esc(e[0]):"???")+'</b><span class="r'+e[1]+'">'+esc(D.ECHOT.tier[e[1]])+'</span>'+(bk[i]?'<span>×'+bk[i]+'</span>':'')+'</div>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet}
$("#bEcho").onclick=echoBook;

/* ---------- notitieboek ---------- */
function noteSheet(tab){tab=tab||"route";var v=vars(G.c),fr=G.st.filter(function(s){return s.done}).sort(function(a,b){return G.c.frags[a.fi].tm-G.c.frags[b.fi].tm});
  var body=tab==="route"?(fr.length?'<div class="list">'+fr.map(function(s){var f=G.c.frags[s.fi];return '<div class="clue k-'+f.k+(f.who!==ALL?" isK":f.ally!==ALL?" isA":"")+'"><em>'+fmt(f.tm)+' · '+esc(s.name)+' · '+esc(T.kinds[f.k])+'</em><p>'+esc(fragText(f))+'</p></div>'}).join("")+'</div>':'<p class="note">'+T.nbNone+'</p>')
    :tab==="people"?'<div class="list">'+G.c.con.map(function(k,i){return '<button type="button" data-o="'+i+'" class="sus'+(G.out[i]?" out":"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small><div class="tags">'+PK.map(function(t){return"<i>"+esc(fill(D.CT[t].tag[k.tr[t]],v))+"</i>"}).join("")+'</div></button>'}).join("")+'</div><p class="note">'+T.nbTip+'</p>'
    :tab==="echo"?(function(){var bk=MW.profile.get().book_og||{},got=(G.echo||[]).filter(function(q){return q.done});return (got.length?'<div class="list">'+got.map(function(q){var e=D.ECHO[q.id];return '<div class="clue"><em>'+esc(D.ECHOT.tier[e[1]])+'</em><b>'+esc(e[0])+'</b><p>'+esc(fill(e[2],v))+'</p></div>'}).join("")+'</div>':'<p class="note">'+esc(D.ECHOT.radar)+'</p>')+'<button type="button" class="btn ghost dk" id="nbBook">'+esc(D.ECHOT.book)+' · '+Object.keys(bk).length+'/'+D.ECHO.length+'</button>'})()
    :'<div class="list">'+G.c.con.map(function(k,i){return '<button type="button" data-s="'+i+'" class="sus'+(G.outS[i]?" out":"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small>'+quote(k)+'<div class="tags">'+AK.map(function(t){return"<i>"+esc(fill(D.CT[t].tag[k.tr[t]],v))+"</i>"}).join("")+'</div></button>'}).join("")+'</div><p class="note">'+T.nbTip+'</p>';
  sheet('<div class="tabs"><button type="button" data-t="route" aria-selected="'+(tab==="route")+'">'+T.nbRoute+'</button><button type="button" data-t="people" aria-selected="'+(tab==="people")+'">'+T.nbPeople+'</button><button type="button" data-t="what" aria-selected="'+(tab==="what")+'">'+T.nbWhat+'</button><button type="button" data-t="echo" aria-selected="'+(tab==="echo")+'">'+T.nbEcho+'</button></div>'+body+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.id==="shX")closeSheet();else if(b.id==="nbBook")echoBook();else if(b.dataset.t)noteSheet(b.dataset.t);else if(b.dataset.o){G.out[b.dataset.o]=!G.out[b.dataset.o];save();noteSheet("people")}else if(b.dataset.s){G.outS[b.dataset.s]=!G.outS[b.dataset.s];save();noteSheet("what")}}}

/* ---------- conclusie ---------- */
function verdictSheet(){var v=vars(G.c),ps=null,pw=null;
  sheet(ph("call")+'<div class="eyebrow">'+T.close+'</div><h2>'+T.vH+'</h2><p>'+T.vT+'</p><div class="eyebrow">'+T.vWhat+'</div><div class="list" id="vS">'+G.c.con.map(function(k,i){return '<button type="button" data-s="'+i+'" class="sus'+(G.outS[i]?" out":"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small></button>'}).join("")+'</div>'+
    '<div class="eyebrow">'+T.vWho+'</div><div class="list" id="vW">'+G.c.con.map(function(k,i){return '<button type="button" data-w="'+i+'" class="sus'+(G.out[i]?" out":"")+'"><b>'+esc(k.name)+'</b><small>'+esc(k.rel)+'</small></button>'}).join("")+'</div>'+
    '<button type="button" class="btn red" id="vGo">'+T.vGo+'</button><p class="note" id="vMsg" style="color:#a5392c"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;
    if(b.id==="shX")closeSheet();
    else if(b.dataset.s){ps=+b.dataset.s;$$("#vS .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.dataset.w){pw=+b.dataset.w;$$("#vW .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.id==="vGo"){if(ps==null||pw==null||ps===pw){$("#vMsg").textContent=T.vNeed;return}G.tries++;save();
      if(ps===G.c.A&&pw===G.c.K)win();else{$("#vMsg").textContent=T.wrong+(G.tries>1?" "+T.wrongTries:"");buzz(150);beep(180,.25)}}}}
function win(){var c=G.c,v=vars(c),min=(Date.now()-G.t0)/60000,s2=G.tries===1,s3=min<=G.par,stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50+(G.seen?0:50),km=G.dist/1000;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="gps",min:min,km:km,title:c.M.n,code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.og.day=MW.today();MW.profile.save(p)}
  G.won={stars:stars,min:min};buzz([100,50,100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);
  // laatste plek: 120–220 m verderop, liefst op een straat
  var r=rngOf(G.seed^0x27d4eb2f),a0=r()*6.283,d0=120+r()*100,ex=P.x+Math.cos(a0)*d0,ey=P.y+Math.sin(a0)*d0,best=null,bd=90;
  W.forEach(function(w){for(var i=0;i<w.p.length;i+=2){var dd=Math.hypot(w.p[i]-ex,w.p[i+1]-ey);if(dd<bd){bd=dd;best=[w.p[i],w.p[i+1]]}}});
  G.epi={x:Math.round(best?best[0]:ex),y:Math.round(best?best[1]:ey),done:false};save();
  var E=D.END,st=a.prof.streak;
  sheet(ph("meet")+'<div class="eyebrow">'+T.won+' · '+esc(G.code)+'</div><div class="stars">'+"★".repeat(stars)+"☆".repeat(3-stars)+'</div><h2>'+esc(fill(T.wonH,v))+'</h2><p>'+esc(fill(E[0],v))+'</p>'+
    '<div class="tags"><i>'+Math.round(min)+' min</i><i>'+km.toFixed(1).replace(".",L==="nl"?",":".")+' km</i><i>'+fill(T.pts,{x:xp})+'</i>'+(G.seen?'':'<i>'+esc(T.unseen)+'</i>')+(G.mode==="gps"?'<i>'+fill(st===1?T.streakTxt:T.streakTxtP,{n:st})+'</i>':'')+'</div>'+
    (a.up?'<p><b>'+esc(fill(T.up,{r:MW.profile.rankName(a.prof.xp,L)}))+'</b></p>':'')+(G.seen?'<p class="note">'+T.seenTxt+'</p>':'')+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+fill(T.missed2,{m:G.par})+'</p>':'')+
    '<button type="button" class="btn" id="vEpi">'+PZ.epi.btn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.share+'</button><button type="button" class="btn ghost dk" id="vHome">'+PZ.epi.home+'</button>',true);
  var code=G.code,stxt="★".repeat(stars),mm=Math.round(min);
  $("#vShare").onclick=function(){var url=location.origin+location.pathname+"#z="+code,txt=fill(T.shareTxt,{c:code,s:stxt,m:mm})+" "+url;
    if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}};
  $("#vEpi").onclick=function(){closeSheet();sel=null;chip();toast(fill(PZ.epi.radar,{d:Math.round(dTo(G.epi))}))};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
function endCase(){LS.del(GK);LS.del(WK);Wk.stopWatch();G=null;home()}
function epilogue(){var c=G.c,v=vars(c),E=D.END;G.epi.done=true;mg.stop();buzz([100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);
  MW.profile.award({game:ID,xp:50,solved:false,gps:false});
  sheet('<div class="eyebrow">'+esc(PZ.epi.h)+' · '+esc(c.M.n)+'</div><h2>'+esc(PZ.epi.name)+'</h2>'+ph("meet")+'<div class="clue"><p>'+esc(fill(E[1],v))+'</p></div><p class="note">'+esc(PZ.epi.bonus)+'</p><button type="button" class="btn" id="vHome">'+PZ.epi.home+'</button>',true);
  $("#vHome").onclick=function(){closeSheet();endCase()}}
/* ---------- zaakcode, archief, menu, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note" id="dMsg" style="color:#a5392c"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();setLen(p.short);startGps(p.seed,false)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.og,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
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
try{history.pushState({og:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({og:1},"")}catch(e){}}})}catch(e){}


/* ---------- startscherm: regen en lantaarnlicht ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,drops=[],dpr=1;
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;drops=[];for(var i=0;i<(still?0:110);i++)drops.push([Math.random()*w,Math.random()*h,8+Math.random()*14,.3+Math.random()*.5])}
  rs();addEventListener("resize",rs);
  function f(){if($("#home").hidden){requestAnimationFrame(f);return}g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
    g.strokeStyle="rgba(230,200,170,.16)";g.lineWidth=1;for(var i=0;i<drops.length;i++){var d=drops[i];g.beginPath();g.moveTo(d[0],d[1]);g.lineTo(d[0]-2,d[1]+d[2]);g.stroke();d[1]+=d[2]*d[3]*1.6;d[0]-=.4*d[3];if(d[1]>h){d[1]=-20;d[0]=Math.random()*w}}
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
hero();(function(){var t=$("#ttl");if(!t||matchMedia("(prefers-reduced-motion: reduce)").matches)return;var txt=t.textContent.replace(/\u00AD/g,"");t.textContent="";var frag=document.createDocumentFragment();txt.split(" ").forEach(function(wd,wi){if(wi)frag.appendChild(document.createTextNode(" "));var w=document.createElement("span");w.className="wd";for(var i=0;i<wd.length;i++){var sp=document.createElement("span");sp.className="ch";sp.textContent=wd[i];sp.style.animationDelay=(Math.random()*6).toFixed(2)+"s";w.appendChild(sp)}frag.appendChild(w)});t.appendChild(frag)})();
/* ---------- start ---------- */
home();MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
var HZ=(location.hash||"").match(/z=([A-Za-z0-9-]+)/);if(HZ)codeSheet(HZ[1]);
if(typeof module!=="undefined")module.exports={genCase:genCase,solve:solve};
window.OG={genCase:genCase,solve:solve,state:function(){return G},test:{reveal:function(s){s.done=true;reveal(s)},epilogue:epilogue}};
})();
