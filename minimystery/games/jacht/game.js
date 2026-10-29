/* De Lichtjesdief / The Light Thief – kinderwandeling voor feestjes. Plaatjes staan in deze map.
   In plaats van ruilen en scherven: je vangt de Lichtjesdief op acht plekken, hij vlucht en laat een lichtje vallen; acht lichtjes in de lantaarn tonen zijn gezicht.
   Vereist platform.js, catalog.js, walk.js, onnxruntime (shared/ort), games/fotojacht/model/labels.js en SJ_DATA (data-xx.js).
   De Lichtjesdief heeft het cadeau; acht keer vang je hem en krijg je een spiegelscherf en een bericht. Opdrachten wisselen af:
   groepsfoto, schaduw vangen, schuifpuzzel, plekfoto, zaklamp, kleurcode, plekfoto, veegruit. Drie versprekingen (bewijs), vier beweringen (één leugen), één plaagbericht.
   Drie kenmerken wijzen samen precies één van vijf buurtfiguren aan. Daarna: zijn schuilplaats in 3D, het cadeau vinden, diploma.
   Standen: "map" (kaart + gps), "demo" (fictieve kaart, tik om te lopen), "street" (buiten zonder kaart), "in" (binnen). */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.SJ_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="sj",GK="ss_game_sj_"+L,WK="ss_ways_sj_"+L,hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz,beep=Wk.beep;function closeSheet(){mg.stop();Wk.closeSheet()}
var G=null,tick=0,MODE=LS.get("ss_sj_mode","map"),NAME=LS.get("ss_sj_name","");
var ATK=["hoofd","rit","dier"],NS=5,ALL=31,ORDER=["e0","w0","e1","w1","e2","w2","g","w3"];
/* v8: lengte (kort/normaal/lang), niveau (easy/hard), voorlezen. Normaal = de oude jacht van acht plekken (oude codes blijven werken). */
var LEN=LS.get("ss_sj_len","normaal"),LEVEL=LS.get("ss_sj_level","easy"),VOICE=LS.get("ss_sj_voice",true);
if(!/^(kort|normaal|lang)$/.test(LEN))LEN="normaal";if(LEVEL!=="hard")LEVEL="easy";
var LENS={kort:{n:5,order:["e0","w0","e1","w1","e2"],tpl:["group","P","photo","P","P"],nc:2,par:.65},
  normaal:{n:8,order:ORDER,tpl:["group","P","P","photo","P","P","photo","P"],nc:4,par:1},
  lang:{n:11,order:["e0","w0","e1","g","w1","w2","e2","g","w3","w4","g"],tpl:["group","P","photo","P","P","photo","P","group","P","photo","P"],nc:5,par:1.35}};
var NEWP=["shadow","count","lights","memory","peek"],OLDP=["catch","lamp","tiles","seq","dust"];
function N(){return G&&G.c?G.c.slots.length:8}
function hard(){return !!G&&G.level==="hard"}
function isPuz(act){return act!=="photo"&&act!=="group"}
/* voorlezen (makkelijk niveau: niemand hoeft te lezen) */
/* stem: via shared/voice.js (beste stem van het toestel, zin voor zin, opnames als die er zijn); anders de kale browserstem */
if(window.MMVoice)MMVoice.init("jacht",L);
function say(t){if(!VOICE||!t)return;t=String(t).replace(/<[^>]+>/g,"");if(window.MMVoice)return MMVoice.say(t);try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(t.replace(/[“”"]/g,""));u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.92;u.pitch=1.05;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".spk");if(b){var v=VOICE;VOICE=true;say(b.dataset.say);VOICE=v}});
function spk(t){return '<button type="button" class="spk" data-say="'+esc(t)+'" aria-label="'+esc(T.readAloud||"🔊")+'">🔊</button>'}
function nw(n){return (D.X.NUM&&D.X.NUM[n])||String(n)}
/* oude bewaarde jachten (van vóór v8) aanvullen met de nieuwe velden */
function fixG(g){if(!g)return g;g.len=g.len||"normaal";g.level=g.level||"easy";g.gold=g.gold||[];g.ph=g.ph||[];g.seen=g.seen||[];return g}
var W=[],P={x:0,y:0,acc:0},R0=550,map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null;
var mg={raf:0,tm:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[]}};
var COL=["#d4ff3a","#ff4fa3","#f0b429","#38e8ff"];

/* ---------- hulpjes ---------- */
function bits(m){var n=0;while(m){n+=m&1;m>>=1}return n}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function ico(id,cls){return '<svg class="'+(cls||"ico")+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(D.ICON[id]||"M4 4h16v16H4z")+'"/></svg>'}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function cadeau(){return NAME?fill(D.CADEAU,{J:NAME}):D.CADEAU0}
/* de Schaduw: kap, geen gezicht, twee lichtgroene ogen */
var IMGROOT=MW.root+"games/jacht/",SHADOW='<img class="shadow" src="'+IMGROOT+'thief-head.webp" alt="" width="200" height="200">';
var SUSF=["krul","bibi","bram","pim","sem","vos","kees","theo","lotte","dirk"];
function pose(k,cls){return '<img class="'+(cls||"pose")+'" src="'+IMGROOT+(k==="thief"?"thief":"thief-"+k)+'.webp" alt="" width="720" height="720">'}
/* plaatjes van de dief voor canvas (kaart, spellen, intro, spiegel) */
var TIMG={};["thief","run","lamp","laugh","shard","red","green","yellow"].forEach(function(k){var im=new Image();im.src=IMGROOT+(k==="thief"?"thief":"thief-"+k)+".webp";TIMG[k]=im});
["gift","torch"].forEach(function(k){var im=new Image();im.src=IMGROOT+(k==="shardimg"?"shard":k)+".webp";TIMG[k]=im});
function drawPose(c,k,x,y,s,al){var im=TIMG[k];if(!im||!im.naturalWidth)return false;c.save();c.globalAlpha=al==null?1:al;var h=s,w=h*im.naturalWidth/im.naturalHeight;c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();return true}
function bubble(txt,who,cls){return '<div class="msg '+(cls||"")+'">'+SHADOW+'<div class="bub">'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+esc(txt)+'</p></div></div>'}
function shadowFig(c,x,y,s,al,eyes,key){if(drawPose(c,key||"run",x,y,s*1.1,al))return;c.save();c.globalAlpha=al==null?1:al;c.translate(x,y);c.scale(s/64,s/64);
  var g=c.createRadialGradient(0,-10,2,0,0,40);g.addColorStop(0,"#2a2150");g.addColorStop(1,"#07050f");c.fillStyle=g;
  c.beginPath();c.moveTo(0,-26);c.bezierCurveTo(-9,-26,-14,-18,-14,-9);c.bezierCurveTo(-14,-3,-12,1,-12,5);c.lineTo(-18,26);c.lineTo(18,26);c.lineTo(12,5);c.bezierCurveTo(12,1,14,-3,14,-9);c.bezierCurveTo(14,-18,9,-26,0,-26);c.closePath();c.fill();
  if(eyes!==false){c.fillStyle="#d4ff3a";c.shadowColor="#d4ff3a";c.shadowBlur=8;c.beginPath();c.ellipse(-6,-5,3,2.2,0,0,7);c.ellipse(6,-5,3,2.2,0,0,7);c.fill()}c.restore()}

/* ---------- ruilgenerator ---------- */
function genCase(seed,mode,len){
  var LN=LENS[len]||LENS.normaal,nc=LN.nc,np=LN.tpl.filter(function(x){return x==="photo"}).length,ng=LN.tpl.filter(function(x){return x==="group"}).length;
  var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  /* puzzeltypes en gouden cijfers met een eigen rng: de zaak zelf (verdachten, dader, sporen) blijft voor oude codes gelijk */
  var r2=rngOf((seed^0x51A7C0DE)>>>0),nT=shuffle(NEWP,r2),oT=shuffle(OLDP,r2),deck=[];for(var q=0;q<5;q++){deck.push(nT[q]);deck.push(oT[q])}
  var gagDeck=shuffle(D.GAG,r2),grpDeck=shuffle(D.GROUP,r2);
  for(var tries=0;tries<4000;tries++){
    var pool=shuffle(D.SUS,r).slice(0,NS),sus=pool.map(function(s){var tr={};ATK.forEach(function(k){tr[k]=Math.floor(r()*3)});return{name:s[0],rel:s[1],q:s[2],tr:tr}});
    var K=Math.floor(r()*NS);
    var ev=ATK.map(function(k){var v=sus[K].tr[k],m=0;sus.forEach(function(s,j){if(s.tr[k]===v)m|=1<<j});return{k:k,v:v,m:m}});
    if(ev.some(function(x){return bits(x.m)<2}))continue;
    if(ev.reduce(function(a,x){return a&x.m},ALL)!==1<<K)continue;
    if(tries<2500&&(bits(ev[0].m&ev[1].m)<2||bits(ev[0].m&ev[2].m)<2||bits(ev[1].m&ev[2].m)<2))continue;
    var idx=[];for(var ci=0;ci<nc;ci++)idx.push(ci);
    var Li=Math.floor(r()*nc),claims=idx.map(function(i){var k=ATK[i%3],v=sus[K].tr[k];if(i===Li)v=(v+1+Math.floor(r()*2))%3;return{k:k,v:v,lie:i===Li,t:pick(D.WIT[k])}});
    var places=shuffle(mode==="in"?D.IN:D.OUT,r).slice(0,np),group=pick(D.GROUP),groups=[group],pi=0,gi=0,di=0,gg=0;
    if(ng>1)grpDeck.forEach(function(x){if(groups.length<ng&&groups.indexOf(x)<0)groups.push(x)});
    var slots=LN.order.map(function(o,i){var act=LN.tpl[i]==="P"?deck[di++]:LN.tpl[i],s={act:act};
      if(act==="group"){var gr=groups[gi++]||group;s.id="groep";s.what=gr[1];s.ask=gr[2];s.hint=gr[3];s.react=gr[4];s.cls=[]}
      else if(act==="photo"){var t=places[pi++];s.id=t[0];s.what=t[1];s.ask=t[2];s.hint=t[3];s.react=t[4];s.cls=t[5]||[]}
      else{var p=D.PUZ[act];s.id=act==="lamp"?"lampz":act;s.what=p[0];s.ask=p[1];s.react=p[2];s.cls=null;s.gold=1+Math.floor(r2()*9)}
      if(o==="g"){s.kind="gag";s.t=LN.n===8?pick(D.GAG):gagDeck[gg++%gagDeck.length]}
      else if(o[0]==="e"){var e=ev[+o[1]];s.kind="ev";s.k=e.k;s.v=e.v;s.t=pick(D.EV[e.k][e.v])}
      else{s.kind="claim";s.w=+o[1]}
      return s});
    return{sus:sus,K:K,claims:claims,Li:Li,slots:slots,ev:ev}
  }
  return null}
/* jachtcode: LD + één letter (stand × lengte × niveau) + seed. K/S/B = normaal+makkelijk, precies zoals de oude codes. */
var CL="ACKDEFGHSJLMNPBQRT",LKEYS=["kort","normaal","lang"];
function makeCode(seed,mode,len,level){var m=mode==="in"?2:mode==="map"||mode==="demo"?0:1,l=Math.max(0,LKEYS.indexOf(len||"normaal")),v=level==="hard"?1:0;return"LD"+CL[m*6+l*2+v]+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);if(!/^LD[A-Z]/.test(c)||c.length<4||c.length>11)return null;var x=CL.indexOf(c[2]);if(x<0)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;
  return{mode:["map","street","in"][Math.floor(x/6)],len:LKEYS[Math.floor(x%6/2)],level:x%2?"hard":"easy",seed:seed}}
function vars(){var c=G.c,k=c.sus[c.K];return{K:k.name,KR:k.rel,KJ:D.AT.hoofd.v[k.tr.hoofd],KW:D.AT.rit.v[k.tr.rit],KD:D.AT.dier.v[k.tr.dier],J:NAME,C:cadeau()}}
function claimText(w){return fill(w.t,{v:D.AT[w.k].v[w.v]})}
function done(){return G.ph.filter(Boolean).length}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get();
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.dr&&p.games.dr.n)||0;
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(ID),lk=MW.pro.locked(ID),playedToday=(p.games.dr&&p.games.dr.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;
  $("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  $("#name").value=NAME;
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});
  $$("#dur button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});
  $$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===LEVEL)});
  var vb=$("#bVoice");if(vb){vb.setAttribute("aria-pressed",VOICE);vb.textContent=(VOICE?"🔊 ":"🔇 ")+(VOICE?T.voiceOn:T.voiceOff)}
  show("home")}
function setLen(l){LEN=l;LS.set("ss_sj_len",l);$$("#dur button").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.n===l)})}
function setLevel(l){LEVEL=l;LS.set("ss_sj_level",l);$$("#lvl button").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.l===l)})}
if($("#dur"))$("#dur").addEventListener("click",function(e){var b=e.target.closest("button");if(b)setLen(b.dataset.n)});
if($("#lvl"))$("#lvl").addEventListener("click",function(e){var b=e.target.closest("button");if(b)setLevel(b.dataset.l)});
if($("#bVoice"))$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_sj_voice",VOICE);if(!VOICE)hush();else say(T.voiceHi);this.setAttribute("aria-pressed",VOICE);this.textContent=(VOICE?"🔊 ":"🔇 ")+(VOICE?T.voiceOn:T.voiceOff)};
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MODE=b.dataset.m;LS.set("ss_sj_mode",MODE);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_sj_name",NAME)});
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(hashStr("dr|"+MODE+"|"+MW.today()),MODE,true)};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(Math.floor(Math.random()*4e9),MODE,false)};
$("#bPro").onclick=proSheet;
$("#bDemo").onclick=function(){var w=ehvWorld();build(Math.floor(Math.random()*4e9),"demo",w.pois,w.ways,null,false)};
$("#bHow").onclick=function(){sheet('<h2>'+T.howH+'</h2>'+$("#howT").innerHTML+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet};
$("#bResume").onclick=function(){G=fixG(LS.get(GK,null));if(!G||!G.c||!G.c.slots)return home();W=LS.get(WK,[]);P={x:G.px||0,y:G.py||0,acc:0};enter()};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};

/* ---------- proefronde: de binnenstad van Eindhoven, getekend (zelfde wereld als bij Moordwandeling) ---------- */
function ehvWorld(){
  var S=function(n,w){var p=[];for(var i=2;i<arguments.length;i++)p.push(arguments[i][0],arguments[i][1]);return{n:n,w:w,p:p}},ways=[
    S("Dommel",9,[540,-760],[500,-420],[455,-120],[470,160],[430,430],[390,760]),
    S("Vestdijk",3,[330,-760],[322,-380],[315,-60],[312,240],[330,560],[345,780]),
    S("Emmasingel",3,[-330,-330],[-410,-150],[-440,120],[-420,330]),
    S("Keizersgracht",3,[-420,330],[-200,300],[60,330],[300,380]),
    S("Stationsweg",3,[60,-300],[75,-480],[95,-700]),
    S("Mathildelaan",3,[-330,-330],[-120,-420],[95,-470],[322,-470]),
    S("Rechtestraat",2,[0,0],[15,-150],[60,-300]),
    S("Demer",2,[60,-300],[-120,-270],[-330,-330]),
    S("Hooghuisstraat",2,[0,0],[-160,-40],[-310,-70]),
    S("Kleine Berg",2,[-20,25],[-160,130],[-320,250]),
    S("Kerkstraat",2,[0,0],[95,85]),
    S("Stratumseind",2,[95,85],[190,210],[300,380]),
    S("Jan van Lieshoutstraat",2,[95,85],[210,40],[315,20]),
    S("Wal",2,[95,85],[60,200],[60,330]),
    S("Bilderdijklaan",2,[300,380],[380,470],[430,520]),
    S("Dommelstraat",2,[15,-150],[170,-140],[320,-140],[455,-130]),
    S("Willemstraat",2,[-410,-150],[-250,-170],[-120,-270]),
    S("Wilhelminaplein",2,[-440,120],[-330,150],[-160,130]),
    S("",1,[-160,-40],[-120,-270]),S("",1,[-160,130],[-160,-40]),S("",1,[60,200],[-160,130]),
    S("",1,[190,210],[315,200]),S("",1,[170,-140],[210,40]),S("",1,[-250,-170],[-310,-70],[-330,150]),
    S("",2,[312,240],[470,260]),S("",2,[315,-60],[455,-60]),S("",1,[95,-470],[60,-300]),
    S("",1,[60,330],[120,520],[230,640],[330,560]),S("",1,[120,520],[300,470]),S("",1,[230,640],[160,700])];
  var P=[["kerk","Catharinakerk",150,120],["kunst","Van Abbemuseum",395,505],["bieb","Bibliotheek in De Witte Dame",-345,-360],["kunst","Philips Museum",-430,-240],
    ["cafe","Café op Stratumseind",235,270],["cafe","Café aan de Markt",55,-70],["park","Stadswandelpark",190,600],["halte","Station Eindhoven Centraal",90,-620],
    ["halte","Bushalte Vestdijk",335,-160],["winkel","De Bijenkorf",-100,-215],["winkel","Winkelcentrum Heuvel",-230,-50],["post","Brievenbus Rechtestraat",30,-180],
    ["hotel","Hotel aan het 18 Septemberplein",110,-330],["apotheek","Apotheek Kleine Berg",-210,180],["bankje","Bankje aan de Dommel",480,200],
    ["school","School aan de Vestdijk",380,-380],["bank","Bank aan de Vestdijk",290,40],["kunst","Kunstwerk op het Wilhelminaplein",-360,170]];
  return{ways:ways,pois:P.map(function(q){return{type:q[0],name:q[1],x:q[2],y:q[3]}})}}

/* ---------- een ruil beginnen ---------- */
/* ---------- verhaalkaart (kidsmap.js): de nachtstraat rond het feesthuis ---------- */
var KI=MW.KidsMap.icons,START={x:500,y:1290};
var FP=[{x:230,y:1040,k:"lamp"},{x:150,y:760,k:"bank"},{x:300,y:520,k:"speel"},{x:520,y:330,k:"school"},{x:760,y:420,k:"brug"},{x:860,y:700,k:"park"},{x:720,y:960,k:"kerk"},{x:500,y:760,k:"plein"},{x:150,y:300,k:"winkel"},{x:880,y:1060,k:"halte"},{x:620,y:1130,k:"post"}];
var ROADS=[[-1,0],[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,-1],[7,2],[7,5],[7,0],[7,6],[8,2],[8,1],[9,6],[9,5],[10,-1],[10,6]];
var TREES=[[80,1180],[120,320],[420,160],[640,180],[900,260],[950,900],[940,1180],[300,1300],[700,1300],[380,900],[640,600],[90,520],[820,1050],[560,1120]];
var KM=MW.KidsMap.create({T:T.kv,go:function(s){walkTo={x:s.x,y:s.y};sel=null},G:function(){return G},P:function(){return P},dTo:function(s){return dTo(s)},virt:function(){return !!(G&&G.virt)},mode:function(){return G&&G.mode},
  map:{W:1000,H:1400,bot:250,start:START,spots:FP,roads:ROADS,vsc:.42,sky:"#140f2e",land:"#223a3a",road:"#4a3f86",roadLine:"#9f8cff",label:"#ffd36a",labelHalo:"rgba(20,15,46,.9)",heroHalo:"rgba(212,255,58,.25)"},
  draw:{mark:function(g,x,y,r,col){g.save();g.fillStyle=col==="#fff"?"#ffd36a":"rgba(255,211,106,.5)";g.shadowColor="#ffd36a";g.shadowBlur=8;g.beginPath();g.arc(x,y,r*.8,0,7);g.fill();g.restore()},
    ground:function(g,t,still){g.fillStyle="#1d3330";[[200,250,160],[760,900,200],[300,1150,140],[650,250,120]].forEach(function(e){g.beginPath();g.ellipse(e[0],e[1],e[2],e[2]*.5,0,0,7);g.fill()});
      g.strokeStyle="#0f2d5c";g.lineWidth=70;g.lineCap="round";g.lineJoin="round";g.beginPath();[[0,640],[120,690],[260,660],[420,700],[600,680],[800,720],[1000,690]].forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke();
      g.fillStyle="#fff";for(var i=0;i<40;i++){g.globalAlpha=still?.6:.3+.5*Math.abs(Math.sin(t/700+i));g.beginPath();g.arc((i*173)%980+10,(i*97)%260+20,2,0,7);g.fill()}g.globalAlpha=1;g.fillStyle="#fff7c2";g.beginPath();g.arc(880,140,34,0,7);g.fill()},
    decor:function(g){TREES.forEach(function(p,i){KI.tree(g,p[0],p[1],44+(i%3)*8,"#1f5a3a","#2a7a4a")});[[60,1000,"#3b3560"],[900,200,"#4a3f86"],[420,1000,"#3b3560"]].forEach(function(h){KI.house(g,h[0],h[1],56,h[2],"#2a2540")})},
    start:function(g,x,y){KI.party(g,x,y,90)},
    landmark:function(g,k,x,y,s){({lamp:function(){KI.lamp(g,x,y,s,true)},bank:function(){KI.bench(g,x,y,s)},speel:function(){KI.swing(g,x,y,s)},school:function(){KI.school(g,x,y,s)},brug:function(){KI.bridge(g,x,y,s)},park:function(){KI.park(g,x,y,s)},kerk:function(){KI.church(g,x,y,s)},plein:function(){KI.fountain(g,x,y,s)},winkel:function(){KI.shop(g,x,y,s)},halte:function(){KI.sign(g,x,y,s,"#2563eb","B")},post:function(){KI.postbox(g,x,y,s)}}[k]||function(){})()},
    hero:function(g,x,y){g.fillStyle="#d4ff3a";g.shadowColor="#d4ff3a";g.shadowBlur=20;g.beginPath();g.arc(x,y-24,20,0,7);g.fill();g.shadowBlur=0;g.fillStyle="#140f2e";g.beginPath();g.arc(x-7,y-27,3,0,7);g.arc(x+7,y-27,3,0,7);g.fill()},
    runner:function(g,fx,fy,t,still){var a=t/2200,px=fx+Math.cos(a)*80,py=fy+30+Math.sin(a*.7)*40;shadowFig(g,px,py,60,still?.8:.55+.4*Math.abs(Math.sin(t/400)))}}});
KM.mount();
function buildVirt(seed,origin,daily){build(seed,"map",null,null,origin,daily,true);if(G)toast(T.kv.virtOut)}
function noMapSheet(seed,daily,why){sheet('<h2>'+T.kv.noMapQ+'</h2>'+(why?'<p class="note">'+esc(why)+'</p>':'')+'<p>'+esc(T.kv.noMapT)+'</p><button type="button" class="btn" id="nmGo">'+T.kv.noMapGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet;$("#nmGo").onclick=function(){closeSheet();MODE="street";LS.set("ss_sj_mode",MODE);build(seed,"street",null,null,null,daily)}}
function dropMap(){if(!G||G.mode!=="map")return;Wk.stopWatch();KM.leave();G.virt=false;G.mode="street";G.i=0;while(G.ph[G.i])G.i++;G.st=null;save();show("cards");render();toast(T.kv.switched)}
function begin(seed,mode,daily){if(mode!=="map")return build(seed,mode,null,null,null,daily);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      if(!w.pois||!w.pois.length)return buildVirt(seed,w.origin,daily);
      build(seed,"map",w.pois,w.ways,w.origin,daily);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})},function(){Wk.loading("");var kx=111320*Math.cos(lat*Math.PI/180);buildVirt(seed,{lat:lat,lon:lon,kx:kx,ky:110540},daily)})
  }).catch(function(e){Wk.loading("");noMapSheet(seed,daily,e==="nogps"?T.noGps:T.denied)})}
function fail(m){sheet('<h2>'+T.fail+'</h2><p>'+esc(m)+'</p><button type="button" class="btn" id="shX">'+T.back+'</button>');$("#shX").onclick=closeSheet}
function build(seed,mode,pois,ways,origin,daily,virt){
  var c=genCase(seed,mode,LEN);if(!c){toast("…");return}
  G={seed:seed,code:makeCode(seed,mode,LEN,LEVEL),mode:mode,len:LEN,level:LEVEL,c:c,i:0,ph:[],t0:0,tries:0,daily:!!daily,par:Math.round((mode==="in"?35:70)*LENS[LEN].par),seen:[],skips:0,dist:0,origin:origin,px:0,py:0,st:null,cine:false,gold:[],hints:0};
  if(virt){G.virt=true;G.st=KM.virtSpots(c.slots.length).map(function(p,i){p.fi=i;p.done=false;return p});W=[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  else if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,R0,c.slots.length,r,T.corner);
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het|the) /,"")),fi:i,done:false}});
    W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  brief()}
function brief(){var c=G.c;
  $("#bfNo").textContent=(G.mode==="demo"?T.demoCase:"");
  var open=fill(D.OPEN,{C:cadeau(),NW:nw(N())});
  $("#bfOpen").innerHTML=pose("thief","hero-pose")+bubble(open,null,"big")+'<div class="lvlrow"><span class="chipL">'+esc(T.lenName[G.len]+" · "+fill(T.lenPl,{n:N()})+" · "+T.lvlName[G.level])+'</span>'+spk(open)+'</div>';
  $("#bfSus").innerHTML=c.sus.map(susCard).join("");
  $("#bfTip").innerHTML=MW.codeBox(L,G.code,"jacht");MW.bindCodeBox($("#bfTip"),L);
  show("brief")}
function susImg(s){var j=D.SUS.findIndex(function(x){return x[0]===s.name});return j>=0?'<img class="face" src="'+IMGROOT+'sus-'+SUSF[j]+'.webp" alt="" width="420" height="420">':''}
function susCard(s,i,pick){return '<'+(pick?'button type="button"':'div')+' class="sus face"'+(pick?' data-s="'+i+'"':'')+'>'+susImg(s)+'<div class="sbody"><b>'+esc(s.name)+'</b><small>'+esc(cap(s.rel))+' · '+esc(s.q)+'</small><div class="tags">'+ATK.map(function(k){return '<i class="t-'+k+(k==="hoofd"?s.tr[k]:"")+'">'+esc(D.AT[k].s[s.tr[k]])+"</i>"}).join("")+'</div></div></'+(pick?'button':'div')+'>'}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode==="map"||G.mode==="street")MW.pro.setFree(ID)}save();if(!G.cine){G.cine=true;save();cine(enter)}else enter()};
$("#bBack").onclick=function(){G=null;home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}

/* ---------- intro: de nacht dat de lichten uitgingen ---------- */
function cine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,dpr,t0=0,fin=false,raf=0;
  ov.hidden=false;var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  var r=rngOf(7),bld=[],x=-20;while(x<w+60){var bw=30+r()*50,bh=60+r()*160;bld.push({x:x,w:bw,h:bh,win:[]});for(var i=0;i<bw/12-1;i++)for(var j=0;j<bh/16-1;j++)if(r()<.45)bld[bld.length-1].win.push([6+i*12,8+j*16,r()]);x+=bw+4+r()*10}
  var lines=T.cine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);ov.hidden=true;then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  var f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?8:t;
    g.setTransform(dpr,0,0,dpr,0,0);var sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#0a0718");sky.addColorStop(1,"#2a1a4a");g.fillStyle=sky;g.fillRect(0,0,w,h);
    g.fillStyle="#fff";for(i=0;i<60;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*2+i));g.fillRect((i*131)%w,(i*71)%(h*.6),1.5,1.5)}g.globalAlpha=1;
    var base=h*.78,off=ph>=2?Math.min(1,(ph-2)/1.6):0;
    bld.forEach(function(b){g.fillStyle="#0b0818";g.fillRect(b.x,base-b.h,b.w,b.h);b.win.forEach(function(wn){var out=wn[2]<off;g.fillStyle=out?"#15102a":(wn[2]>.8?"#38e8ff":"#ffd36a");if(!out){g.shadowColor=g.fillStyle;g.shadowBlur=6}g.fillRect(b.x+wn[0],base-b.h+wn[1],7,9);g.shadowBlur=0})});
    g.fillStyle="#07050f";g.fillRect(0,base,w,h-base);
    for(i=0;i<w;i+=90){var on=off<1||ph>7;g.fillStyle=on?"#ffd36a":"#2a2150";if(on){g.shadowColor="#ffd36a";g.shadowBlur=18}g.beginPath();g.arc(i+45,base-34,4,0,7);g.fill();g.shadowBlur=0;g.fillStyle="#1a1433";g.fillRect(i+44,base-30,2,30)}
    if(ph>4.2&&ph<6.5){var sx=w*(ph-4.2)/2.3;shadowFig(g,sx,base-70,150,.95,true,"run")}
    if(ph>6.6){g.textAlign="center";g.fillStyle="#d4ff3a";g.shadowColor="#2d7a1f";g.shadowBlur=0;var sc=Math.min(1,(ph-6.6)/.5),fs=Math.round(60*sc+20);var tt=L==="nl"?"DE LICHTJESDIEF":"THE LIGHT THIEF";g.font="700 "+fs+"px 'Fredoka','Arial Rounded MT Bold',sans-serif";var tw=g.measureText(tt).width;if(tw>w-32){fs=Math.floor(fs*(w-32)/tw);g.font="700 "+fs+"px 'Fredoka','Arial Rounded MT Bold',sans-serif"}g.fillText(tt,w/2,h*.4)}
    var li=Math.min(lines.length-1,Math.floor(ph/1.35));txt.textContent=ph<6.6?lines[li]:"";
    if(ph>8.2)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}

/* ---------- spelen zonder kaart: kaartjes ---------- */
function enter(){mlWarm();if(G.mode==="map"||G.mode==="demo")enterMap();else{show("cards");render()}}
function hud(){if(!G)return;var n=done();$("#hT").textContent=mmss(Date.now()-G.t0);$("#hS").textContent=n+"/"+N();shardsUI($("#hM"),n);goldUI()}
function shardsUI(el,n){if(!el)return;var t=N();el.innerHTML="";el.className="shards n"+t;for(var i=0;i<t;i++){var s=document.createElement("i");if(i<n)s.className="on";el.appendChild(s)}}
/* de gouden cijfers in de lantaarn: verzamelde cijfers + lege plekjes voor de puzzels die nog komen */
function goldTotal(){return G.c.slots.filter(function(s){return isPuz(s.act)}).length}
function goldHTML(){var got=G.gold||[],left=Math.max(0,goldTotal()-got.length),h='<span class="gl">'+esc(T.goldBar)+'</span>';
  got.forEach(function(x){h+='<b class="coin">'+x.d+'</b>'});for(var k=0;k<left;k++)h+='<b class="coin off">?</b>';return h}
function goldUI(){if(!G)return;var el=$("#goldM");if(!el&&$("#low")){el=document.createElement("div");el.id="goldM";el.className="goldbar";$("#low").insertBefore(el,$("#radar"))}if(el)el.innerHTML=goldHTML();var c=$("#goldC");if(c)c.innerHTML=goldHTML()}
function render(){hud();popPlan();while(G.i<N()&&G.ph[G.i])G.i++;var i=G.i,box=$("#card"),t=N();
  if(i>=t){box.innerHTML='<div class="goldbar" id="goldC">'+goldHTML()+'</div><div class="pol done"><div class="grid">'+G.ph.map(function(p){return '<img src="'+p+'" alt="">'}).join("")+'</div></div>'+bubble(T.radarAll)+'<button type="button" class="btn red" id="bAcc">'+T.last+'</button>';$("#bAcc").onclick=accuseSheet;return}
  var s=G.c.slots[i],photo=!isPuz(s.act);
  box.innerHTML='<div class="goldbar" id="goldC">'+goldHTML()+'</div><div class="pol empty"><div class="ph">'+ico(s.id,"big")+'</div><p class="cap">'+esc(fill(T.task,{i:i+1,N:t}))+' · '+esc(T.kinds[s.act])+'</p></div>'+bubble(s.ask,T.wants)+'<div class="lvlrow">'+spk(s.ask)+'</div><button type="button" class="btn" id="bOpen">'+(photo?'📷 '+T.shoot:'▶ '+T.start)+'</button>';
  $("#bOpen").onclick=function(){ruilSheet(i)}}

/* ---------- spelen met kaart: neonkaart, vuurvliegjes, een schaduw die rondsluipt ---------- */
function enterMap(){show("play");popPlan();
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return R0},
    theme:{bg:"#140f2e",water:"#0f2d5c",waterEdge:"#38e8ff",ripple:"rgba(56,232,255,.25)",park:"#123d2a",parkEdge:"#2fd27a",river:"#1b4a8a",major:"#ff4fa3",minor:"#4a3f86",road:"#7a5cff",label:"#ffd36a",waterLabel:"#9ff0ff",ring:"rgba(212,255,58,.35)",me:"#d4ff3a",meHalo:"rgba(212,255,58,.16)",meRing:"rgba(212,255,58,.7)",font:"700 12px 'Fredoka','Barlow Condensed',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(R0);sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d;KM.moved(d)});
  KM.enter({kids:true,virt:!!G.virt,map:map});
  if(G.mode==="demo")toast(T.demoTip);
  requestAnimationFrame(loop)}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
var FLY=[];for(var fi=0;fi<40;fi++)FLY.push({a:fi*1.7,r:120+fi*17,s:.2+(fi%5)*.08,c:COL[fi%4]});
function items(){var it=[];
  it.push({x:P.x,y:P.y,tap:false,draw:function(cx,X,Y,t,api){if(api.still)return;cx.save();FLY.forEach(function(f){var ang=f.a+t/4000*f.s*3,x=api.sx(Math.cos(ang)*f.r),y=api.sy(Math.sin(ang*1.3)*f.r*.8),al=.35+.6*Math.abs(Math.sin(t/300+f.a));cx.globalAlpha=al;cx.fillStyle=f.c;cx.shadowColor=f.c;cx.shadowBlur=10;cx.beginPath();cx.arc(x,y,2.2,0,7);cx.fill()});cx.restore()}});
  var open=G.st.filter(function(s){return !s.done});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/500+s.fi)*3,act=G.c.slots[s.fi].act,col=act==="photo"||act==="group"?"#ff4fa3":act==="catch"||act==="lamp"?"#38e8ff":"#f0b429";
    if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*22,0,7);cx.stroke();cx.globalAlpha=1}
    Wk.badge(cx,X,Y+bob*.3,act==="photo"||act==="group"?"cam":act==="catch"||act==="lamp"?"obj":"msg",s.done?"#5f7090":col,1,s.done);
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,26,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#8d86a8":"#fff";cx.shadowColor="#000";cx.shadowBlur=6;if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+36);cx.shadowBlur=0}})});
  // de Schaduw sluipt in een boog rond het dichtstbijzijnde open ruilpunt
  if(open.length){var near=open.reduce(function(a,s){return dTo(s)<dTo(a)?s:a});it.push({x:near.x,y:near.y,tap:false,draw:function(cx,X,Y,t,api){if(api.still){shadowFig(cx,X+40,Y-20,40,.8);return}var a=t/2200,rx=60*api.V.s+30,sx=X+Math.cos(a)*rx,sy=Y+Math.sin(a*.7)*rx*.6-20;shadowFig(cx,sx,sy,42,.55+.4*Math.abs(Math.sin(t/400)))}})}
  return it}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=110*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  if(!KM.draw(t))map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tickMap()}requestAnimationFrame(loop)}
function tickMap(){var el=Math.floor((Date.now()-G.t0)/1000),n=done();
  $("#mT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#mS").textContent=n+"/"+N();shardsUI($("#mM"),n);goldUI();
  var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});
  $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);beep(660,.2)}if(!here)arrived=null;
  chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel),act=G.c.slots[sel.fi].act;
  $("#cName").textContent=sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=T.here+" · "+T.kinds[act];
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))ruilSheet(sel.fi,sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;ruilSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mPeople").onclick=susSheet;$("#mAcc").onclick=function(){if(done()>=N())accuseSheet();else noteSheet()};
$("#bNote").onclick=noteSheet;$("#bPeople").onclick=susSheet;$("#bAcc2").onclick=function(){if(done()>=N())accuseSheet();else noteSheet()};

/* ---------- de Schaduw duikt op: tussen twee plekken springt hij af en toe in beeld met een plagerij. Tik hem weg. ---------- */
var POP={t:0,n:0,el:null};
function popStop(){clearTimeout(POP.t);POP.t=0;if(POP.el)POP.el.classList.remove("on")}
function popPlan(ms){clearTimeout(POP.t);if(!G||done()>=N())return;POP.t=setTimeout(popShow,ms||(28000+Math.random()*32000))}
/* plaagberichten: algemene plus berichten die passen bij hoe ver jullie zijn (gouden cijfers, bijna klaar, net begonnen) */
function tauntLine(){var X=D.X,n=done(),t=N(),pool=D.TAUNT.slice();
  if(n===0)pool=pool.concat(X.TAUNT_START);if((G.gold||[]).length)pool=pool.concat(X.TAUNT_GOLD);if(t-n<=2)pool=X.TAUNT_END.concat(X.TAUNT_END);else if(n>=t/2)pool=pool.concat(X.TAUNT_HALF);
  var last=POP.last,l;for(var k=0;k<6;k++){l=pool[Math.floor(Math.random()*pool.length)];if(l!==last)break}POP.last=l;return fill(l,{J:NAME||T.popYou,n:t-n,g:(G.gold||[]).length})}
function popShow(){POP.t=0;if(!G||done()>=N())return;var busy=!$("#sheet").hidden||!$("#hide").hidden||!$("#cine").hidden||($("#play").hidden&&$("#cards").hidden)||document.hidden||(window.MW.Crew&&MW.Crew.busy());if(busy)return popPlan(9000);
  if(!POP.el){POP.el=document.createElement("button");POP.el.type="button";POP.el.id="pop";POP.el.setAttribute("aria-label",T.popTap);POP.el.innerHTML='<img alt="" width="720" height="720"><span class="bub"><span></span></span>';$("#app").appendChild(POP.el);
    POP.el.onclick=function(){if(!POP.el.classList.contains("on"))return;POP.el.querySelector(".bub span").textContent=D.POPHIT[Math.floor(Math.random()*D.POPHIT.length)];POP.el.classList.add("hit");buzz([40,30,40]);beep(880,.08);setTimeout(function(){POP.el.classList.remove("on","hit")},900)}}
  if(window.MW.Crew&&D.CREW&&POP.n%2===1&&done()>0){POP.n++;var hk=(G.hj==null?G.seed:G.hj+1)%D.CREW.CREW_HIJACK.length;G.hj=hk;save();
    MW.Crew.hijack({who:D.V,img:IMGROOT+"thief-laugh.webp",line:D.CREW.CREW_HIJACK[hk],secs:15,say:false,then:function(){popPlan()}});say(D.CREW.CREW_HIJACK[hk]);return}
  var poses=["laugh","run","lamp","thief"],side=POP.n%2?"r":"l",lines=D.TAUNT;POP.n++;
  POP.el.className=side;POP.el.querySelector("img").src=IMGROOT+(function(k){return k==="thief"?"thief":"thief-"+k})(poses[POP.n%poses.length])+".webp";
  var line=tauntLine();POP.el.querySelector(".bub span").textContent=line;say(line);
  void POP.el.offsetWidth;POP.el.classList.add("on");beep(300,.12);setTimeout(function(){beep(220,.15)},140);buzz(60);
  setTimeout(function(){if(POP.el)POP.el.classList.remove("on")},5200);popPlan()}

/* ---------- de ruil zelf: opdracht → (foto of puzzel) → scherf en antwoord ---------- */
function ruilSheet(i,spot){walkTo=null;var s=G.c.slots[i];cur={i:i,spot:spot||null};var n=done()+1,photo=!isPuz(s.act);
  var head='<div class="eyebrow">'+esc(fill(T.task,{i:n,N:N()}))+' · '+esc(T.kinds[s.act])+(spot?' · '+esc(spot.name):'')+'</div>'+bubble(s.ask,T.wants);
  if(photo){say(s.ask);
    cur.solve=function(){cur.thumb=shardThumb(i,s.act);accept()};
    sheet(head+'<div class="task"><div class="ph">'+ico(s.id,"big")+'</div><div><h2>'+esc(cap(s.what))+'</h2><p class="hint" id="hint">'+(G.seen[i]||!s.hint?esc(s.hint||""):'')+'</p>'+(G.seen[i]||!s.hint?'':'<button type="button" class="btn ghost sm dk" id="bHint">'+T.hint2+'</button>')+'</div></div>'+
      '<label class="btn cam" for="file">📷 '+T.shoot+'</label><p class="note" id="pMsg"></p><p class="note" id="mlSt"></p><p class="note">'+esc(T.camNote)+'</p>'+
      '<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
    $("#shX").onclick=function(){G.force=null;closeSheet()};
    var bh=$("#bHint");if(bh)bh.onclick=function(){$("#hint").textContent=s.hint;bh.hidden=true;G.seen[i]=1;save()};
    if(window.MMP)MMP.helper(function(){cur.thumb=shardThumb(i,s.act);G.t0-=120000;G.skips=(G.skips||0)+1;save();accept()},function(){say(s.ask)});
    mlWarm();return}
  var I=T.pz[s.act],instr=(hard()&&I[2])||I[1];
  sheet(head+'<div class="pzh"><h2>'+esc(I[0])+'</h2><p class="hint">'+esc(instr)+' '+spk(I[0]+". "+instr)+'</p>'+(hard()?'<span class="chipL hard">'+esc(T.lvlName.hard)+'</span>':'')+'</div><div id="pz"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  say(I[0]+". "+instr);
  $("#shX").onclick=function(){G.force=null;hush();closeSheet()};
  var fin=false,H=null,o={box:$("#pz"),hard:hard(),done:function(){if(fin)return;fin=true;mg.stop();if(H)H.remove();cur.thumb=shardThumb(i,s.act);accept()},
    canvas:function(){o.box.innerHTML='<canvas class="sq" width="280" height="280"></canvas>';return o.box.firstChild},
    at:function(e,c){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*280,(e.clientY-b.top)/b.height*280]},
    st:function(t,talk){var e=$("#pzS");if(e)e.textContent=t;if(talk)say(t)},
    /* fout antwoord: hartje kwijt (crew.js). Op = opnieuw, zonder straf */
    miss:function(){return H?H.miss():false}};
  cur.solve=o.done;
  if(window.MMP)MMP.helper(function(){G.t0-=120000;G.skips=(G.skips||0)+1;save();o.done()},function(){say(I[0]+". "+instr)});
  var start=function(){mg.stop();fin=false;o.box.innerHTML="";if(window.MW.Crew)H=MW.Crew.hearts(o.box,function(){G.retries=(G.retries||0)+1;save();start()},{dead:function(){mg.stop()}});(PUZ[s.act]||PUZ.catch)(o)};
  start()}
function goldOf(i){var s=G.c.slots[i];return s.gold!=null?s.gold:1+(hashStr(G.seed+"|g"+i)%9)}
function accept(seen){var i=cur.i,s=G.c.slots[i];G.ph[i]=cur.thumb;if(cur.spot){cur.spot.done=true;cur.spot.doneAt=Date.now();G.kd0=null}G.force=null;G.miss=0;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;
  var gd=null;if(isPuz(s.act)){G.gold=G.gold||[];var had=G.gold.filter(function(x){return x.i===i})[0];if(had)gd=had.d;else{gd=goldOf(i);G.gold.push({i:i,d:gd,id:s.id})}}
  save();buzz([40,30,80]);beep(520,.15);
  var kind=s.kind,head=kind==="ev"?T.slip:kind==="claim"?T.claim:T.gag,sub=kind==="ev"?T.slipT:kind==="claim"?T.claimT:"",txt=kind==="claim"?claimText(G.c.claims[s.w]):s.t,n=done(),t=N();
  var X=D.X,cl=n>=t?X.CLIFF_LAST:X.CLIFF[(G.seed+n*7)%X.CLIFF.length];
  sheet('<div class="eyebrow">'+esc(fill(T.task,{i:n,N:t}))+' · '+esc(T.reply)+'</div><div class="shardwrap"><canvas id="shardC" width="320" height="200"></canvas><b>'+esc(fill(T.shard,{n:n,N:t}))+'</b></div>'+
    (gd!=null?'<div class="goldget"><span class="coin big">'+gd+'</span><div><b>'+esc(T.goldGot)+'</b><small>'+esc(T.goldGotT)+'</small></div></div>':'')+
    '<div class="pol mini"><img src="'+cur.thumb+'" alt=""><p class="cap">'+esc(s.what)+(seen?' · '+esc(seen):'')+'</p></div>'+
    '<div class="msg small">'+pose("run","shadow big")+'<div class="bub"><p>'+esc(s.react)+'</p></div></div><div class="rep k-'+kind+'"><em>'+esc(head)+'</em>'+bubble(txt)+(sub?'<p class="note">'+esc(sub)+'</p>':'')+'</div>'+
    '<p class="cliff">'+esc(fill(cl,{n:t-n,J:NAME||T.popYou}))+'</p>'+
    '<button type="button" class="btn" id="bNext">'+(n>=t?T.last:T.next)+'</button>',true);
  shardAnim($("#shardC"),n);if(kind==="ev")buzz([60,40,60,40,120]);
  say(s.react+" "+(gd!=null?fill(T.goldSay,{d:gd})+" ":"")+head+": "+txt+" "+fill(cl,{n:t-n,J:NAME||T.popYou}));
  $("#bNext").onclick=function(){hush();closeSheet();sel=null;cur=null;popPlan(9000+Math.random()*12000);if(G.mode==="map"||G.mode==="demo"){chip();goldUI();if(n>=t)accuseSheet()}else{render();if(n>=t)accuseSheet()}}}
/* scherf: veelhoek met spiegelglans; als plaatje voor de strook en als animatie (valt binnen, licht op) */
function shardPath(g,cx,cy,r,n){var pts=[],k=5+(n%3);for(var i=0;i<k;i++){var a=i/k*6.283+n,rr=r*(.7+((i*7+n*3)%5)/10);pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}g.beginPath();pts.forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.closePath()}
/* een gevangen lichtje: gloeiende bol met vuurvliegjesvleugels en een nummer */
function drawShard(g,cx,cy,r,n,glow){g.save();var h=g.createRadialGradient(cx,cy,r*.1,cx,cy,r*1.6);h.addColorStop(0,"rgba(255,236,140,.95)");h.addColorStop(.35,"rgba(212,255,58,.55)");h.addColorStop(1,"rgba(212,255,58,0)");g.fillStyle=h;g.beginPath();g.arc(cx,cy,r*1.6,0,7);g.fill();
  g.fillStyle="rgba(255,255,255,.35)";g.beginPath();g.ellipse(cx-r*.55,cy-r*.55,r*.55,r*.28,-.6,0,7);g.ellipse(cx+r*.55,cy-r*.55,r*.55,r*.28,.6,0,7);g.fill();
  var c=g.createRadialGradient(cx-r*.2,cy-r*.25,r*.05,cx,cy,r*.75);c.addColorStop(0,"#ffffff");c.addColorStop(.5,"#fff3a0");c.addColorStop(1,"#d4ff3a");if(glow){g.shadowColor="#ffe066";g.shadowBlur=glow}g.fillStyle=c;g.beginPath();g.arc(cx,cy,r*.72,0,7);g.fill();g.shadowBlur=0;
  g.fillStyle="#1a1433";g.font="700 "+Math.round(r*.62)+"px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(n,cx,cy+2);g.restore()}
function drawShardOld(g,cx,cy,r,n,glow){var im=null;
  if(im&&im.naturalWidth){var h=r*2.2,w=h*im.naturalWidth/im.naturalHeight;g.save();if(glow){g.shadowColor="#38e8ff";g.shadowBlur=glow}g.drawImage(im,cx-w/2,cy-h/2,w,h);g.shadowBlur=0;
    g.fillStyle="#d4ff3a";g.beginPath();g.arc(cx+r*.55,cy+r*.6,r*.36,0,7);g.fill();g.fillStyle="#1a1433";g.font="700 "+Math.round(r*.46)+"px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(n,cx+r*.55,cy+r*.62);g.restore();return}
  var gr=g.createLinearGradient(cx-r,cy-r,cx+r,cy+r);gr.addColorStop(0,"#e9fbff");gr.addColorStop(.45,"#8fd8ff");gr.addColorStop(.5,"#ffffff");gr.addColorStop(.55,"#5ab0ff");gr.addColorStop(1,"#2b2a7a");
  g.save();if(glow){g.shadowColor="#38e8ff";g.shadowBlur=glow}shardPath(g,cx,cy,r,n);g.fillStyle=gr;g.fill();g.shadowBlur=0;g.strokeStyle="#fff";g.lineWidth=2;g.stroke();
  g.fillStyle="#1a1433";g.font="700 "+Math.round(r*.7)+"px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(n,cx,cy+2);g.restore()}
function shardThumb(i,act){var cv=document.createElement("canvas");cv.width=cv.height=360;var g=cv.getContext("2d"),bg=g.createRadialGradient(180,180,20,180,180,260);bg.addColorStop(0,"#2a2150");bg.addColorStop(1,"#0a0718");g.fillStyle=bg;g.fillRect(0,0,360,360);
  for(var k=0;k<40;k++){g.fillStyle=COL[k%4];g.globalAlpha=.5;g.fillRect((k*97)%360,(k*53)%360,3,3)}g.globalAlpha=1;drawShard(g,180,180,120,i+1,30);return cv.toDataURL("image/jpeg",.8)}
function shardAnim(cv,n){var g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f=function(ts){if(!t0)t0=ts;var t=Math.min(1,(ts-t0)/900);if(still)t=1;var e=1-Math.pow(1-t,3);g.clearRect(0,0,320,200);
    for(var k=0;k<24;k++){var a=k/24*6.283,d=40+e*90;g.fillStyle=COL[k%4];g.globalAlpha=(1-t)*.9;g.beginPath();g.arc(160+Math.cos(a)*d,100+Math.sin(a)*d*.6,3,0,7);g.fill()}g.globalAlpha=1;
    drawShard(g,160,100-(1-e)*80,20+e*50,n,20+20*Math.sin(ts/150));if(t<1&&cv.isConnected)mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)}

/* ---------- puzzels en vangspellen (op een vierkant canvas of in het vel) ---------- */
var EMO="'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
function nope(){var a=D.X.NOPE;return a[Math.floor(Math.random()*a.length)]}
var PUZ={
  /* schaduw vangen: hij flitst over het scherm, drie keer tikken */
  catch:function(o){var c=o.canvas(),g=c.getContext("2d"),fx=140,fy=140,vx=0,vy=0,hits=0,last=0,flash=0,place=function(){fx=40+Math.random()*200;fy=40+Math.random()*200;var a=Math.random()*6.28,sp=70+hits*35;vx=Math.cos(a)*sp;vy=Math.sin(a)*sp};place();
    c.addEventListener("pointerdown",function(e){var q=o.at(e,c);if(Math.hypot(q[0]-fx,q[1]-fy)<34){hits++;flash=1;beep(500+hits*120,.12);buzz(40);if(hits>=(o.hard?5:3)){o.done();return}place()}else{beep(180,.08)}});
    var f=function(ts){var dt=Math.min(.1,(ts-last)/1000)||0;last=ts;fx+=vx*dt;fy+=vy*dt;if(fx<30||fx>250)vx=-vx;if(fy<30||fy>250)vy=-vy;if(Math.random()<.01)place();flash=Math.max(0,flash-dt*3);
      var bg=g.createRadialGradient(140,140,10,140,140,200);bg.addColorStop(0,"#2a2150");bg.addColorStop(1,"#07050f");g.fillStyle=bg;g.fillRect(0,0,280,280);
      for(var k=0;k<30;k++){g.fillStyle="#fff";g.globalAlpha=.2+.5*Math.abs(Math.sin(ts/500+k));g.fillRect((k*83)%280,(k*47)%280,2,2)}g.globalAlpha=1;
      if(flash){g.fillStyle="rgba(212,255,58,"+flash*.5+")";g.fillRect(0,0,280,280)}
      shadowFig(g,fx,fy,70,.95);
      g.fillStyle="#d4ff3a";g.font="700 20px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(fill(T.pz.hits,{n:hits,m:o.hard?5:3}),140,268);
      mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)},
  /* zaklamp: het licht drie keer op de schaduw houden */
  lamp:function(o){var c=o.canvas(),g=c.getContext("2d"),fx,fy,vx,vy,lx=140,ly=230,hold=0,hits=0,last=0;
    var place=function(){fx=40+Math.random()*200;fy=50+Math.random()*160;var a=Math.random()*6.28,sp=14;vx=Math.cos(a)*sp;vy=Math.sin(a)*sp};place();
    var crates=[0,1,2,3,4,5].map(function(i){return[(i*97)%240,(i*61)%220,22+(i*13)%40,22+(i*17)%50,COL[i%4]]});
    var mv=function(e){var q=o.at(e,c);lx=q[0];ly=q[1]};c.addEventListener("pointerdown",mv);c.addEventListener("pointermove",mv);
    var f=function(ts){var dt=Math.min(.1,(ts-last)/1000)||0;last=ts;fx+=vx*dt;fy+=vy*dt;if(fx<30||fx>250)vx=-vx;if(fy<50||fy>240)vy=-vy;
      c.dataset.p=Math.round(fx)+","+Math.round(fy);g.fillStyle="#2b2560";g.fillRect(0,0,280,280);crates.forEach(function(r){g.fillStyle=r[4];g.globalAlpha=.35;g.fillRect(r[0],r[1],r[2],r[3])});g.globalAlpha=1;
      shadowFig(g,fx,fy,70,1,true,"lamp");
      var gr=g.createRadialGradient(lx,ly,10,lx,ly,70);gr.addColorStop(0,"rgba(7,5,15,0)");gr.addColorStop(1,"rgba(7,5,15,1)");g.fillStyle=gr;g.fillRect(0,0,280,280);
      drawPose(g,"torch",lx-52,ly-48,90,.95);
      var near=Math.hypot(lx-fx,ly-fy)<30;hold=near?hold+dt:0;
      if(near){g.strokeStyle="#d4ff3a";g.lineWidth=4;g.beginPath();g.arc(fx,fy,46,-1.57,-1.57+6.283*Math.min(1,hold/.7));g.stroke()}
      if(hold>=(o.hard?.95:.7)){hits++;hold=0;beep(500+hits*120,.12);buzz(40);if(hits>=(o.hard?4:3))return o.done();place()}
      g.fillStyle="#d4ff3a";g.font="700 20px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(fill(T.pz.hits,{n:hits,m:o.hard?4:3}),140,268);
      mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)},
  /* schuifpuzzel: 3×3 stukken van de scherf wisselen */
  tiles:function(o){var c=o.canvas(),g=c.getContext("2d"),src=document.createElement("canvas");src.width=src.height=280;var sg=src.getContext("2d"),bg=sg.createRadialGradient(140,140,10,140,140,200);bg.addColorStop(0,"#3a2d7a");bg.addColorStop(1,"#0a0718");sg.fillStyle=bg;sg.fillRect(0,0,280,280);
    for(var k=0;k<60;k++){sg.fillStyle=COL[k%4];sg.beginPath();sg.arc((k*97)%280,(k*53)%280,3,0,7);sg.fill()}drawShard(sg,140,140,100,done()+1,30);shadowFig(sg,70,210,60,.9);shadowFig(sg,215,70,50,.7);
    var N=3,S=280/N,ord=[0,1,2,3,4,5,6,7,8],sw=0,pick=null;while(sw<(o.hard?7:3)){var a=Math.floor(Math.random()*9),b=Math.floor(Math.random()*9);if(a!==b){var t=ord[a];ord[a]=ord[b];ord[b]=t;sw++}}
    var draw=function(){c.dataset.ord=ord.join("");g.fillStyle="#07050f";g.fillRect(0,0,280,280);ord.forEach(function(p,i){var sx=(p%N)*S,sy=Math.floor(p/N)*S,dx=(i%N)*S,dy=Math.floor(i/N)*S;g.drawImage(src,sx,sy,S,S,dx+1,dy+1,S-2,S-2);if(pick===i){g.strokeStyle="#d4ff3a";g.lineWidth=4;g.strokeRect(dx+3,dy+3,S-6,S-6)}})};draw();
    c.addEventListener("pointerdown",function(e){var q=o.at(e,c),i=Math.floor(q[0]/S)+Math.floor(q[1]/S)*N;if(pick==null){pick=i;beep(400,.06)}else{var t=ord[pick];ord[pick]=ord[i];ord[i]=t;pick=null;beep(520,.08)}draw();if(ord.every(function(p,i){return p===i})){buzz(80);o.done()}})},
  /* kleurcode: vier gekleurde knoppen, volgorde natikken, drie rondes */
  seq:function(o){o.box.innerHTML='<div class="lans">'+[0,1,2,3].map(function(i){return'<button type="button" class="lan" data-i="'+i+'" style="--c:'+COL[i]+'" aria-label="'+(i+1)+'"></button>'}).join("")+'</div><p class="pzst" id="sqS"></p><button type="button" class="btn ghost sm dk" id="sqR">'+T.pz.again+'</button>';
    var Ls=$$("#pz .lan"),S=[0,1,2,3,4,5,6].map(function(){return Math.floor(Math.random()*4)}),st=$("#sqS"),pos=0,busy=true,len=o.hard?3:2,later=function(fn,ms){mg.tm.push(setTimeout(fn,ms))};
    var lit=function(i,ms){Ls[i].classList.add("on");beep(330+i*110,.18);later(function(){Ls[i].classList.remove("on")},ms)};
    var play=function(){Ls.forEach(function(l){l.classList.remove("on")});busy=true;pos=0;st.textContent=T.pz.look;for(var k=0;k<len;k++)(function(k){later(function(){lit(S[k],350)},600+k*600)})(k);later(function(){busy=false;st.textContent=fill(T.pz.yours,{n:len})},600+len*600)};
    $("#sqR").onclick=play;
    o.box.addEventListener("click",function(e){var b=e.target.closest(".lan");if(!b||busy)return;var i=+b.dataset.i;lit(i,200);
      if(i!==S[pos]){st.textContent=T.pz.wrongSeq;beep(160,.2);busy=true;if(o.miss())return;later(play,900);return}
      pos++;if(pos>=len){len++;if(len>(o.hard?6:4)){buzz(80);o.done();return}st.textContent=T.pz.good;later(play,800);busy=true}});
    later(play,300)},
  /* veegruit: wrijf de condens weg tot de scherf zichtbaar is */
  dust:function(o){var c=o.canvas(),g=c.getContext("2d"),fog=document.createElement("canvas");fog.width=fog.height=280;var fg=fog.getContext("2d");fg.fillStyle="#c9d6e8";fg.fillRect(0,0,280,280);for(var k=0;k<400;k++){fg.fillStyle="rgba(255,255,255,.25)";fg.beginPath();fg.arc(Math.random()*280,Math.random()*280,2+Math.random()*4,0,7);fg.fill()}
    var back=document.createElement("canvas");back.width=back.height=280;var bg=back.getContext("2d"),gr=bg.createRadialGradient(140,140,10,140,140,200);gr.addColorStop(0,"#3a2d7a");gr.addColorStop(1,"#0a0718");bg.fillStyle=gr;bg.fillRect(0,0,280,280);drawShard(bg,140,140,100,done()+1,30);
    var downp=false,wiped=0,draw=function(){g.drawImage(back,0,0);g.drawImage(fog,0,0)};draw();
    var check=function(){var d=fg.getImageData(0,0,280,280).data,n=0,m=0;for(var i=3;i<d.length;i+=16){m++;if(d[i]<40)n++}if(n/m>(o.hard?.68:.45)){buzz(80);o.done()}};
    var wipe=function(e){if(!downp)return;var q=o.at(e,c);fg.globalCompositeOperation="destination-out";fg.fillStyle="#000";fg.beginPath();fg.arc(q[0],q[1],o.hard?20:30,0,7);fg.fill();fg.globalCompositeOperation="source-over";wiped++;draw();if(wiped%6===0)check()};
    c.addEventListener("pointerdown",function(e){downp=true;wipe(e)});c.addEventListener("pointermove",wipe);c.addEventListener("pointerup",function(){downp=false;check()});c.addEventListener("pointercancel",function(){downp=false})},
  /* ===== v8: vijf nieuwe puzzels. Elk heeft een makkelijk niveau (plaatjes, voorgelezen, niks te lezen) en een pittig niveau. ===== */
  /* wiens schaduw? een zwart silhouet op de muur; tik het ding dat erbij hoort */
  shadow:function(o){var round=0,rounds=o.hard?3:2,GR=D.X.SHAPES,ans=null;
    o.box.innerHTML='<canvas class="sq" width="280" height="280"></canvas><div class="opts emo'+(o.hard?" five":"")+'" id="shO"></div><p class="pzst" id="pzS"></p>';
    var c=o.box.firstChild,g=c.getContext("2d");
    var sil=function(e,sz,flip,rot){var cv=document.createElement("canvas");cv.width=cv.height=220;var x=cv.getContext("2d");x.translate(110,110);x.rotate(rot);x.scale(flip?-1:1,1);x.font=sz+"px "+EMO;x.textAlign="center";x.textBaseline="middle";x.fillText(e,0,8);x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation="source-in";x.fillStyle="#140c2a";x.fillRect(0,0,220,220);return cv};
    var go=function(){var opts;
      if(o.hard){var gi=Math.floor(Math.random()*GR.length),oth=GR[(gi+1+Math.floor(Math.random()*(GR.length-1)))%GR.length];opts=shuffle(GR[gi],Math.random).slice(0,4).concat([oth[Math.floor(Math.random()*oth.length)]])}
      else opts=shuffle(GR,Math.random).slice(0,3).map(function(s){return s[Math.floor(Math.random()*s.length)]});
      opts=shuffle(opts,Math.random);ans=opts[Math.floor(Math.random()*opts.length)];c.dataset.ans=ans;
      var w=g.createRadialGradient(140,110,20,140,140,210);w.addColorStop(0,"#fff6d0");w.addColorStop(.55,"#e0bf7a");w.addColorStop(1,"#3b2a4a");g.fillStyle=w;g.fillRect(0,0,280,280);
      g.fillStyle="rgba(59,42,74,.25)";for(var k=0;k<7;k++)g.fillRect(0,k*40+18,280,2);
      g.save();g.globalAlpha=.9;g.drawImage(sil(ans,o.hard?120:150,o.hard&&Math.random()<.7,o.hard?(Math.random()-.5)*.9:0),30,22);g.restore();
      g.fillStyle="#1a1433";g.font="700 18px 'Fredoka',sans-serif";g.textAlign="center";g.fillText((round+1)+" / "+rounds,140,268);
      $("#shO").innerHTML=opts.map(function(e){return '<button type="button" class="opt" data-e="'+e+'">'+e+'</button>'}).join("");
      o.st(T.pz.which,round>0)};
    o.box.addEventListener("click",function(e){var b=e.target.closest(".opt");if(!b||b.disabled)return;
      if(b.dataset.e===ans){b.classList.add("ok");beep(600+round*120,.12);buzz(40);round++;$$("#shO .opt").forEach(function(x){x.disabled=true});if(round>=rounds){mg.tm.push(setTimeout(o.done,450));return}mg.tm.push(setTimeout(go,600))}
      else{b.classList.add("no");b.disabled=true;beep(180,.15);if(o.miss())return;o.st(nope(),true)}});
    go()},
  /* tel de lichtjes: makkelijk = stilstaande gele lichtjes, knoppen met stippen; pittig = ze zweven en knipperen, en er vliegen roze en blauwe neppers tussen */
  count:function(o){var round=0,rounds=2,ans=0,Ls=[],last=0;
    o.box.innerHTML='<canvas class="sq" width="280" height="280"></canvas><div class="opts nums" id="cnO"></div><p class="pzst" id="pzS"></p>';
    var c=o.box.firstChild,g=c.getContext("2d");
    var spot=function(){for(var t=0;t<200;t++){var p={x:30+Math.random()*220,y:30+Math.random()*200};if(Ls.every(function(q){return Math.hypot(q.x-p.x,q.y-p.y)>40}))return p}return p};
    var go=function(){ans=o.hard?5+Math.floor(Math.random()*4):2+Math.floor(Math.random()*4);Ls=[];var k,p;
      for(k=0;k<ans;k++){p=spot();Ls.push({x:p.x,y:p.y,gold:1,ph:Math.random()*6.3,vx:o.hard?(Math.random()-.5)*26:0,vy:o.hard?(Math.random()-.5)*26:0})}
      if(o.hard)for(k=0;k<3;k++){p=spot();Ls.push({x:p.x,y:p.y,gold:0,col:k%2?"#ff4fa3":"#38e8ff",ph:Math.random()*6.3,vx:(Math.random()-.5)*26,vy:(Math.random()-.5)*26})}
      c.dataset.ans=ans;var opts=o.hard?[ans-1,ans,ans+1,ans+2]:[ans-1,ans,ans+1];if(opts[0]<1)opts=opts.map(function(x){return x+1});
      $("#cnO").innerHTML=opts.map(function(n){return '<button type="button" class="opt" data-n="'+n+'"><b>'+n+'</b>'+(o.hard?'':'<i>'+"●".repeat(n)+'</i>')+'</button>'}).join("");
      o.st(o.hard?T.pz.countH:T.pz.countE,round>0)};
    var f=function(ts){var dt=Math.min(.1,(ts-last)/1000)||0;last=ts;var bg=g.createRadialGradient(140,140,10,140,140,200);bg.addColorStop(0,"#2a2150");bg.addColorStop(1,"#07050f");g.fillStyle=bg;g.fillRect(0,0,280,280);
      g.fillStyle="#0b0818";g.fillRect(0,236,280,44);
      Ls.forEach(function(l){l.x+=l.vx*dt;l.y+=l.vy*dt;if(l.x<20||l.x>260)l.vx=-l.vx;if(l.y<20||l.y>225)l.vy=-l.vy;var a=o.hard?.35+.65*Math.abs(Math.sin(ts/700+l.ph)):.85+.15*Math.sin(ts/400+l.ph);
        g.save();g.globalAlpha=a;if(l.gold)drawShard(g,l.x,l.y,15,"",18);else{g.fillStyle=l.col;g.shadowColor=l.col;g.shadowBlur=14;g.beginPath();g.arc(l.x,l.y,10,0,7);g.fill()}g.restore()});
      g.fillStyle="#d4ff3a";g.font="700 18px 'Fredoka',sans-serif";g.textAlign="center";g.fillText((round+1)+" / "+rounds,140,265);
      mg.raf=requestAnimationFrame(f)};
    o.box.addEventListener("click",function(e){var b=e.target.closest(".opt");if(!b||b.disabled)return;
      if(+b.dataset.n===ans){b.classList.add("ok");beep(600+round*120,.12);buzz(40);round++;$$("#cnO .opt").forEach(function(x){x.disabled=true});if(round>=rounds){mg.tm.push(setTimeout(o.done,450));return}mg.tm.push(setTimeout(go,600))}
      else{b.classList.add("no");beep(180,.15);$$("#cnO .opt").forEach(function(x){x.disabled=true});if(o.miss())return;o.st(T.pz.countNo,true);mg.tm.push(setTimeout(go,1100))}});
    go();mg.raf=requestAnimationFrame(f)},
  /* lantaarns aansteken: makkelijk = tik ze aan, de dief blaast er af en toe één uit; pittig = elke tik zet ook de buren om (alles aan = klaar) */
  lights:function(o){var n=o.hard?9:6,cols=3,on=[],sol=[],i,taps=0,blows=0;
    for(i=0;i<n;i++){on.push(o.hard);sol.push(false)}
    var nb=function(k){var r=Math.floor(k/cols),c2=k%cols,a=[k];if(r>0)a.push(k-cols);if(r<2&&k+cols<n)a.push(k+cols);if(c2>0)a.push(k-1);if(c2<cols-1)a.push(k+1);return a};
    var press=function(k){nb(k).forEach(function(j){on[j]=!on[j]});sol[k]=!sol[k]};
    if(o.hard){var pr=shuffle([0,1,2,3,4,5,6,7,8],Math.random).slice(0,3);pr.forEach(press)}
    o.box.innerHTML='<div class="lgrid" id="lgG">'+on.map(function(x,k){return '<button type="button" class="lt" data-i="'+k+'" aria-label="'+(k+1)+'"><i></i></button>'}).join("")+'</div><p class="pzst" id="pzS"></p>'+(o.hard?'<button type="button" class="btn ghost sm dk" id="lgH">'+T.pz.hintBtn+'</button>':'');
    var bs=$$("#lgG .lt"),draw=function(){bs.forEach(function(b,k){b.classList.toggle("on",on[k])});o.box.dataset.sol=sol.map(function(x){return x?1:0}).join("")},fin=false;
    var check=function(){if(on.every(Boolean)){fin=true;buzz(80);beep(990,.25);o.st(T.pz.lightsOk,false);mg.tm.push(setTimeout(o.done,600))}};
    draw();o.st(o.hard?T.pz.lightsH:T.pz.lightsE,false);
    $("#lgG").addEventListener("click",function(e){var b=e.target.closest(".lt");if(!b||fin)return;var k=+b.dataset.i;taps++;bs.forEach(function(x){x.classList.remove("hint")});
      if(o.hard)press(k);else on[k]=true;beep(on[k]?520+k*40:260,.08);draw();check()});
    if(o.hard)$("#lgH").onclick=function(){var k=sol.indexOf(true);if(k>=0){bs[k].classList.add("hint");G.hints=(G.hints||0)+1}};
    else mg.tm.push(setInterval(function(){if(fin)return;var lit=[];on.forEach(function(x,k){if(x)lit.push(k)});if(lit.length<2||lit.length>=n-1||blows>=3)return;blows++;var k=lit[Math.floor(Math.random()*lit.length)];on[k]=false;bs[k].classList.add("blow");setTimeout(function(){bs[k].classList.remove("blow")},600);beep(200,.12);draw()},3200))},
  /* zijn spullen: memory met plaatjes. Makkelijk 3 paar (eerst even spieken), pittig 6 paar */
  memory:function(o){var pairs=o.hard?6:3,items=shuffle(D.X.STUFF,Math.random).slice(0,pairs),cards=shuffle(items.concat(items),Math.random),open=[],got=0,lock=true;
    o.box.innerHTML='<div class="mem'+(o.hard?" h":"")+'" id="mmG">'+cards.map(function(e,k){return '<button type="button" class="card up" data-i="'+k+'" data-e="'+e+'"><span>'+e+'</span></button>'}).join("")+'</div><p class="pzst" id="pzS"></p>';
    var bs=$$("#mmG .card");o.st(T.pz.memLook,false);
    mg.tm.push(setTimeout(function(){bs.forEach(function(b){b.classList.remove("up")});lock=false;o.st(T.pz.memGo,false)},o.hard?1200:2600));
    $("#mmG").addEventListener("click",function(e){var b=e.target.closest(".card");if(!b||lock||b.classList.contains("up"))return;b.classList.add("up");open.push(b);beep(440,.06);
      if(open.length<2)return;var a=open[0],c2=open[1];open=[];
      if(a.dataset.e===c2.dataset.e){a.classList.add("got");c2.classList.add("got");got++;beep(700,.15);buzz(40);if(got>=pairs){lock=true;o.st(T.pz.memOk,false);mg.tm.push(setTimeout(o.done,600))}}
      else{lock=true;mg.tm.push(setTimeout(function(){a.classList.remove("up");c2.classList.remove("up");lock=false},850))}})},
  /* ogen in het donker: de dief gluurt even (groene ogen) achter een van de dingen. Waar zat hij? Pittig: korter, meer plekken, en een kat met gele ogen als afleiding */
  peek:function(o){var n=o.hard?8:4,round=0,rounds=o.hard?3:2,ans=-1,busy=true,spots=shuffle(D.X.HIDE,Math.random).slice(0,n);
    o.box.innerHTML='<div class="peek'+(o.hard?" h":"")+'" id="pkG">'+spots.map(function(e,k){return '<button type="button" class="hs" data-i="'+k+'"><i class="ey"><b></b><b></b></i><span>'+e+'</span></button>'}).join("")+'</div><p class="pzst" id="pzS"></p><button type="button" class="btn ghost sm dk" id="pkA">'+T.pz.again+'</button>';
    var bs=$$("#pkG .hs"),later=function(fn,ms){mg.tm.push(setTimeout(fn,ms))};
    var show=function(keep){busy=true;bs.forEach(function(b){b.classList.remove("no","found","eyes","cat")});if(!keep)ans=Math.floor(Math.random()*n);o.box.dataset.ans=ans;o.st(T.pz.peekLook,false);
      var ms=o.hard?480:1100,blink=function(k,cls,at){later(function(){bs[k].classList.add(cls);if(cls==="eyes")beep(880,.05)},at);later(function(){bs[k].classList.remove(cls)},at+ms)};
      blink(ans,"eyes",700);if(o.hard){var j=(ans+1+Math.floor(Math.random()*(n-1)))%n;blink(j,"cat",700+ms+250)}else blink(ans,"eyes",700+ms+400);
      later(function(){busy=false;o.st(T.pz.peekWhere,true)},700+ms*2+(o.hard?300:450))};
    $("#pkA").onclick=function(){if(!busy)show(true)};
    $("#pkG").addEventListener("click",function(e){var b=e.target.closest(".hs");if(!b||busy)return;var k=+b.dataset.i;
      if(k===ans){b.classList.add("found");beep(600+round*150,.15);buzz(40);round++;busy=true;if(round>=rounds){o.st(T.pz.peekOk,false);later(o.done,700);return}later(function(){show(false)},900)}
      else{b.classList.add("no");beep(180,.15);busy=true;if(o.miss())return;o.st(nope(),true);later(function(){show(true)},1100)}});
    later(function(){show(false)},400)}
};


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
  var gold=(G.gold||[]).length||goldTotal()?'<div class="eyebrow">'+T.nbG+'</div><div class="goldbar inbook">'+goldHTML()+'</div>':'';
  sheet('<h2>'+T.notebook+'</h2>'+MW.codeBox(L,G.code,"jacht",true)+gold+(ev.length||cl.length?'<div class="eyebrow">'+T.nbE+'</div><div class="list">'+(ev.join("")||'<p class="note">–</p>')+'</div><div class="eyebrow">'+T.nbW+'</div><div class="list">'+(cl.join("")||'<p class="note">–</p>')+'</div>':'<p class="note">'+T.nbNone+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');MW.bindCodeBox($("#sheetBody"),L);$("#shX").onclick=closeSheet}
function susSheet(){sheet('<h2>'+T.people+'</h2><p class="note">'+T.peopleT+'</p><div class="list">'+G.c.sus.map(susCard).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function menuSheet(){sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button><button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mNoMap"){closeSheet();dropMap()}else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- ontmaskeren ---------- */
function accuseSheet(){var c=G.c,ps=null,pw=null;
  if(window.MW.Crew&&D.CREW&&!G.rally){G.rally=1;save();popStop();hush();closeSheet();
    return MW.Crew.rally({title:D.CREW.CREW_RALLY_T,text:D.CREW.CREW_RALLY_TXT,icon:"🏮",iconDone:"🔦",color:"#d4ff3a",goal:Math.round(50*(hard()?1.4:1)),secs:15,okText:D.CREW.CREW_RALLY_OK,failText:D.CREW.CREW_RALLY_FAIL,then:function(){accuseSheet()}})}
  sheet('<h2>'+T.acH+'</h2><p>'+esc(fill(T.acT,{nc:nw(c.claims.length)}))+'</p><div class="eyebrow">'+T.acWho+'</div><div class="list" id="vS">'+c.sus.map(function(s,i){return susCard(s,i,true)}).join("")+'</div>'+
    '<div class="eyebrow">'+T.acLiar+'</div><div class="list" id="vW">'+c.claims.map(function(w,i){return '<button type="button" class="sus" data-w="'+i+'"><small>'+esc(claimText(w))+'</small></button>'}).join("")+'</div>'+
    '<button type="button" class="btn red" id="vGo">'+T.acGo+'</button><p class="note err" id="vMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){var b=e.target.closest("button");if(!b)return;
    if(b.id==="shX")closeSheet();
    else if(b.dataset.s){ps=+b.dataset.s;$$("#vS .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.dataset.w){pw=+b.dataset.w;$$("#vW .sus").forEach(function(x){x.classList.toggle("pick",x===b)})}
    else if(b.id==="vGo"){if(ps==null||pw==null){$("#vMsg").textContent=T.acNeed;return}G.tries++;save();
      if(ps===c.K&&pw===c.Li)unmask();else{$("#vMsg").textContent=T.wrong+(G.tries>1?" "+T.wrongTries:"");buzz(150);beep(180,.25)}}}}
function unmask(){popStop();var c=G.c;G.tEnd=G.tEnd||Date.now();save();buzz([100,50,100]);beep(660,.2);
  var end=fill(D.END,vars());
  sheet('<div class="eyebrow">'+T.unmasked+'</div><div class="mirror"><canvas id="mirC" width="320" height="320"></canvas><h2>'+esc(c.sus[c.K].name)+'</h2></div>'+bubble(end,null,"big")+'<div class="lvlrow">'+spk(end)+'</div>'+
    '<button type="button" class="btn" id="bHide">'+T.twistGo+'</button>',true);
  say(end);mirrorAnim($("#mirC"),c.sus[c.K]);$("#bHide").onclick=function(){hush();twist()}}
/* de plotwending vlak voor de finale: waarom hij de lichtjes pakte, en het gouden slot */
function twist(){var X=D.X,k=G.c.sus[G.c.K],tw=fill(X.TWIST,vars()),g=(G.gold||[]).length,lk=g?fill(X.TWIST_LOCK,{n:nw(g)}):X.TWIST_NOLOCK;
  sheet('<div class="eyebrow">'+esc(T.twistH)+'</div><div class="twistpic">'+pose(["red","green","yellow"][k.tr.hoofd],"pose")+'</div>'+bubble(tw,null,"big")+bubble(lk,null,"small")+'<div class="lvlrow">'+spk(tw+" "+lk)+'</div>'+
    '<button type="button" class="btn" id="bTw">'+T.hideGo+'</button>',true);
  buzz([60,60,60]);beep(330,.2);setTimeout(function(){beep(262,.3)},220);say(tw+" "+lk);
  $("#bTw").onclick=function(){hush();closeSheet();hideout()}}
/* de spiegel: acht scherven schuiven in elkaar en tonen hoofddeksel, rit en dier */
function mirrorAnim(cv,k){var g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches,hc=["#e63946","#2a9d4b","#f4c20d"][k.tr.hoofd];
  var f=function(ts){if(!t0)t0=ts;var t=Math.min(1,(ts-t0)/1400);if(still)t=1;var e=1-Math.pow(1-t,3);g.clearRect(0,0,320,320);
    for(var i=0;i<8;i++){var a=i/8*6.283,r=110,cx=160+Math.cos(a)*r*(1-e)*2,cy=160+Math.sin(a)*r*(1-e)*2;g.save();g.translate(cx,cy);g.rotate((1-e)*2);drawShard(g,0,0,54,i+1,14);g.restore()}
    if(t>.95){g.save();g.beginPath();g.arc(160,160,96,0,7);g.clip();var gr=g.createLinearGradient(64,64,256,256);gr.addColorStop(0,"#fffbe0");gr.addColorStop(.5,"#ffe58a");gr.addColorStop(1,"#d4a020");g.fillStyle=gr;g.fillRect(0,0,320,320);
      if(!drawPose(g,["red","green","yellow"][k.tr.hoofd],160,150,190,1)){shadowFig(g,160,180,150,1,false);g.fillStyle=hc;g.beginPath();g.ellipse(160,112,46,16,0,0,7);g.fill();g.fillRect(118,98,84,16)}
      g.font="700 26px 'Fredoka',sans-serif";g.textAlign="center";g.fillStyle="#1a1433";g.fillText(["🛴","🚲","🛹"][k.tr.rit]+" "+["🐕","🐈","🦜"][k.tr.dier],160,240);g.restore();g.strokeStyle="#fff";g.lineWidth=4;g.beginPath();g.arc(160,160,96,0,7);g.stroke()}
    if(t<1&&cv.isConnected)mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)}

/* ---------- zijn schuilplaats in 3D (CSS): vier muren, veeg om rond te kijken, tik op de juiste kist ---------- */
function hideout(){var ov=$("#hide"),room=$("#room"),k=G.c.sus[G.c.K],right=k.tr.hoofd,H=D.HIDE,cols=["#e63946","#2a9d4b","#f4c20d"];
  var walls=[[chest(0)],[chest(1)],[chest(2)],[laugh()]];
  function chest(i){return '<div class="obj chest img" data-c="'+i+'" style="--c:'+cols[i]+';left:'+[30,34,32][i]+'%;bottom:4%"><img class="gift" src="'+IMGROOT+'gift.webp" alt="" width="529" height="560"><img class="box" src="'+IMGROOT+'chest-'+["red","green","yellow"][i]+'.webp" alt="" width="560" height="440"><span>'+esc(H.boxes[i])+'</span></div>'}
  function tv(){return '<div class="obj tvs" data-x="1" style="right:26%;bottom:34%"><b>'+esc(H.tv)+'</b><span>'+esc(H.others[0])+'</span></div>'}
  function coat(){return '<div class="obj coat" data-x="1" style="right:27%;bottom:22%"><i></i><i></i><i></i><span>'+esc(H.others[1])+'</span></div>'}
  function feathers(){return '<div class="obj feat" data-x="1" style="left:30%;bottom:10%"><b>'+esc(H.feathers)+'</b><span>'+esc(H.others[2])+'</span></div>'}
  function poster(){return '<div class="obj poster" style="right:28%;top:12%">'+SHADOW+'<b>?</b></div>'}
  function laugh(){return '<div class="obj laugh" style="left:4%;bottom:4%">'+pose("laugh","pose")+'</div>'}
  function lamp(){return '<div class="obj lampo" style="left:38%;top:8%"></div>'}
  room.innerHTML=walls.map(function(w,i){return '<div class="wall w'+i+'" style="background-image:url('+IMGROOT+'wall-'+i+'.webp)">'+w.join("")+'</div>'}).join("")+'<div class="floor"></div>';
  $("#hideHint").textContent=T.hideHint;$("#hideTip").textContent=T.hideTip;$("#hideMsg").textContent="";ov.hidden=true;ov.hidden=false;
  var rot=0,pd=null,fin=false,set=function(){room.style.transform="rotateY("+rot+"deg)"};set();
  ov.onpointerdown=function(e){if($("#sjDoor"))return;pd={x:e.clientX,r:rot,moved:false}};ov.onpointermove=function(e){if(!pd)return;var dx=e.clientX-pd.x;if(Math.abs(dx)>6)pd.moved=true;rot=pd.r+dx*.35;set()};
  ov.onpointerup=function(e){if(!pd)return;var moved=pd.moved;pd=null;if(moved||fin)return;var o=e.target.closest(".obj");if(!o)return;
    if(o.dataset.c!=null){if(+o.dataset.c===right){fin=true;o.classList.add("open");buzz([100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);confetti();$("#hideMsg").textContent=T.hideYes;setTimeout(win,1600)}
      else{o.classList.add("shake");setTimeout(function(){o.classList.remove("shake")},600);$("#hideMsg").textContent=T.hideNo;buzz(120);beep(180,.2)}}
    else{o.classList.add("shake");setTimeout(function(){o.classList.remove("shake")},600);beep(260,.08)}};
  $("#hideX").onclick=function(){if(fin)return;ov.hidden=true;var d=$("#sjDoor");if(d)d.remove();unmask()};
  if((G.gold||[]).length&&!G.lockOpen)door()}
/* ---------- het gouden slot op de deur van zijn schuilplaats: open met de gouden cijfers ---------- */
function door(){var ov=$("#hide"),old=$("#sjDoor");if(old)old.remove();var d=document.createElement("div");d.id="sjDoor";
  d.innerHTML='<div class="dl"></div><div class="dr"></div><button type="button" id="sjPad"><span class="padI">🔒</span><span class="padC">'+G.gold.map(function(){return '<i></i>'}).join("")+'</span><b>'+esc(T.lockTap)+'</b></button>';
  ov.appendChild(d);$("#hideHint").textContent=T.lockH;$("#hideTip").textContent=T.lockTip;say(T.lockH+". "+T.lockTap);
  $("#sjPad").onclick=function(){ov.hidden=true;lockSheet()}}
function lockOrder(){var gold=G.gold||[];return hard()?gold.slice().reverse():gold.slice()}
function lockSheet(){var X=D.X,order=lockOrder(),n=order.length,hd=hard(),val=(G.lockVal&&G.lockVal.length===n)?G.lockVal.slice():order.map(function(){return 0}),intro=hd?fill(X.LOCK_HARD,{n:nw(n)}):fill(X.LOCK_EASY,{n:nw(n)});
  sheet('<div class="eyebrow">'+esc(T.lockH)+'</div>'+bubble(intro,null,"small")+'<div class="lvlrow">'+spk(intro)+'</div>'+
    '<div class="lantern"><span>'+esc(T.goldBar)+'</span>'+(G.gold||[]).map(function(x){return '<b class="coin">'+(hd?'':ico(x.id||"seq","mi"))+x.d+'</b>'}).join("")+'</div>'+
    '<div class="lock" id="lkW">'+order.map(function(x,k){return '<div class="wheel" data-k="'+k+'">'+(hd?'<small>'+(k+1)+'</small>':ico(x.id||"seq","mi"))+'<button type="button" class="up" aria-label="+">▲</button><b>'+val[k]+'</b><button type="button" class="dn" aria-label="−">▼</button></div>'}).join("")+'</div>'+
    '<p class="pzst" id="lkS"></p><button type="button" class="btn" id="lkGo">🔓 '+esc(T.lockGo)+'</button><button type="button" class="btn ghost sm dk" id="lkH">💡 '+esc(T.lockHint)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  say(intro);
  var W3=$$("#lkW .wheel"),put=function(k,v){val[k]=(v+10)%10;W3[k].querySelector("b").textContent=val[k];W3[k].classList.remove("ok","no");G.lockVal=val.slice();save()};
  $("#lkW").onclick=function(e){var w=e.target.closest(".wheel");if(!w)return;var k=+w.dataset.k;if(e.target.closest(".dn"))put(k,val[k]-1);else put(k,val[k]+1);beep(300+val[k]*40,.05);buzz(10)};
  $("#lkH").onclick=function(){for(var k=0;k<n;k++)if(val[k]!==order[k].d){put(k,order[k].d);W3[k].classList.add("ok");G.hints=(G.hints||0)+1;save();$("#lkS").textContent=T.lockHinted;say(T.lockHinted);return}};
  $("#lkGo").onclick=function(){var right=0;W3.forEach(function(w,k){var ok=val[k]===order[k].d;if(ok)right++;if(!hd){w.classList.toggle("ok",ok);w.classList.toggle("no",!ok)}});
    if(right===n)return openLock();G.lockTries=(G.lockTries||0)+1;save();buzz([80,40,80]);beep(160,.25);var lk=$("#lkW");lk.classList.remove("shake");void lk.offsetWidth;lk.classList.add("shake");
    var m=hd?fill(T.lockSome,{n:right,m:n}):X.LOCK_NO[G.lockTries%X.LOCK_NO.length];$("#lkS").textContent=m;say(m)};
  $("#shX").onclick=function(){hush();closeSheet();$("#hide").hidden=false};
  if(window.MMP)MMP.helper(function(){openLock()},function(){say(intro)})}
function openLock(){G.lockOpen=1;save();hush();closeSheet();var ov=$("#hide"),d=$("#sjDoor");ov.hidden=false;
  buzz([60,40,60,40,200]);beep(520,.15);setTimeout(function(){beep(780,.2)},150);setTimeout(function(){beep(1040,.3)},320);say(T.lockOpen);
  $("#hideHint").textContent=T.hideHint;$("#hideTip").textContent=T.hideTip;$("#hideMsg").textContent=T.lockOpen;setTimeout(function(){if($("#hideMsg").textContent===T.lockOpen)$("#hideMsg").textContent=""},1800);
  if(d){d.classList.add("open");setTimeout(function(){d.remove()},1500)}}
function confetti(){var ov=$("#hide");for(var i=0;i<60;i++){var s=document.createElement("i");s.className="cf";s.style.left=50+(Math.random()-.5)*40+"%";s.style.background=COL[i%4];s.style.animationDelay=Math.random()*.4+"s";s.style.setProperty("--dx",(Math.random()-.5)*300+"px");ov.appendChild(s);setTimeout(function(x){x.remove()},1800,s)}}

/* ---------- gewonnen ---------- */
function win(){if(!G.finDone){G.finDone=1;G.tEnd=G.tEnd||Date.now();save();$("#hide").hidden=true;return finale(win)}
  if(window.MMP&&MMP.hasTreasure()&&!G.trDone){G.trDone=1;G.tEnd=G.tEnd||Date.now();save();$("#hide").hidden=true;return MMP.finale(win)}var c=G.c,min=((G.tEnd||Date.now())-G.t0)/60000,s2=G.tries===1&&!G.skips,s3=min<=G.par,stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50;
  $("#hide").hidden=true;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:c.sus[c.K].name,code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.dr.day=MW.today();MW.profile.save(p)}
  Wk.stopWatch();buzz([100,50,100,50,300]);
  var st=a.prof.streak,ph=G.ph.slice(),code=G.code;
  var secs=Math.round(((G.tEnd||Date.now())-G.t0)/1000),tm=Math.floor(secs/60)+":"+String(secs%60).padStart(2,"0");
  sheet('<div class="eyebrow">'+T.won+' · '+esc(code)+'</div><div class="stars">'+"★".repeat(stars)+"☆".repeat(3-stars)+'</div><h2>'+esc(c.sus[c.K].name)+'</h2><p>'+esc(T.hideFound)+'</p>'+
    '<div class="eyebrow">'+esc(T.albumH)+'</div><canvas id="strip" width="1080" height="1350" class="stripc"></canvas>'+
    '<div class="tags"><i>⏱ '+tm+'</i><i>'+esc(T.lenName[G.len]+" · "+fill(T.lenPl,{n:N()}))+'</i><i>'+esc(T.lvlName[G.level])+'</i></div>'+
    ''+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+fill(T.missed2,{m:G.par})+'</p>':'')+
    '<button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var tmI=window.MMP?MMP.team():{i:-1,name:"",col:null};
  RES={ph:ph,code:code,stars:stars,min:Math.round(min),secs:secs,v:vars(),slots:G.c.slots.slice(),seed:G.seed,len:G.len,level:G.level,n:N(),gold:(G.gold||[]).map(function(x){return x.d}),team:tmI,hat:c.sus[c.K].tr.hoofd,name:NAME};
  var cv=$("#strip");drawAlbum(cv,RES);
  $("#vDip").onclick=dipSheet;
  var txt=fill(T.shareTxt,{c:code,s:"★".repeat(stars),m:Math.round(min)})+location.origin+location.pathname+"#z="+code;
  $("#vShare").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],(L==="nl"?"lichtjesdief-album-":"light-thief-album-")+code+".jpg",{type:"image/jpeg"});
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:txt}).catch(function(){})}
      else if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}},"image/jpeg",.85)};
  $("#vDl").onclick=function(){var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.85);a.download=(L==="nl"?"lichtjesdief-album-":"light-thief-album-")+code+".jpg";document.body.appendChild(a);a.click();a.remove()};
  $("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP)MMP.result($("#sheetBody"),{code:G.code,secs:RES.secs,stars:RES.stars,back:winBack})}
/* ---------- finale: alle lichtjes vliegen uit de lantaarn terug de straat in, de dief krijgt een feestmuts op ---------- */
function finale(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,dpr,t0=0,fin=false,raf=0,X=D.X,v=vars();
  ov.hidden=false;ov.classList.add("fin");var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  var r=rngOf(G.seed||7),bld=[],x=-20;while(x<w+60){var bw=30+r()*50,bh=60+r()*170,b={x:x,w:bw,h:bh,win:[]};for(var i=0;i<bw/12-1;i++)for(var j=0;j<bh/16-1;j++)if(r()<.5)b.win.push([6+i*12,8+j*16,r()]);bld.push(b);x+=bw+4+r()*10}
  var base=h*.74,n=N(),posts=[],k;for(k=0;k<n;k++)posts.push({x:w*(k+.5)/n,y:base-38,t:1.4+k*(3.2/n)});
  var lines=X.FIN.map(function(l){return fill(l,v)}),parts=[],boom=[],lastB=0,hatK=["red","green","yellow"][G.c.sus[G.c.K].tr.hoofd];
  var end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);ov.hidden=true;ov.classList.remove("fin");txt.textContent="";hush();then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  say(lines.join(" "));buzz([60,40,60]);
  var f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?9:t;
    g.setTransform(dpr,0,0,dpr,0,0);var lit=Math.max(0,Math.min(1,(ph-4.6)/1.6));
    var sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,lit>0?"#1b1446":"#0a0718");sky.addColorStop(1,lit>0?"#4a2d7a":"#2a1a4a");g.fillStyle=sky;g.fillRect(0,0,w,h);
    g.fillStyle="#fff";for(i=0;i<60;i++){g.globalAlpha=.3+.7*Math.abs(Math.sin(t*2+i));g.fillRect((i*131)%w,(i*71)%(h*.6),1.5,1.5)}g.globalAlpha=1;
    /* ramen gaan aan, golf vanuit het midden */
    bld.forEach(function(b){g.fillStyle="#0b0818";g.fillRect(b.x,base-b.h,b.w,b.h);b.win.forEach(function(wn){var d=Math.abs((b.x+wn[0])-w/2)/(w/2),on=lit>d*.9+wn[2]*.1;g.fillStyle=on?(wn[2]>.8?"#38e8ff":"#ffd36a"):"#15102a";if(on){g.shadowColor=g.fillStyle;g.shadowBlur=6}g.fillRect(b.x+wn[0],base-b.h+wn[1],7,9);g.shadowBlur=0})});
    g.fillStyle="#07050f";g.fillRect(0,base,w,h-base);
    /* lantaarnpalen: elk krijgt zijn lichtje terug */
    posts.forEach(function(p,k){var on=ph>p.t+.6;g.fillStyle="#1a1433";g.fillRect(p.x-1,p.y+4,2,34);g.fillStyle=on?"#ffd36a":"#2a2150";if(on){g.shadowColor="#ffd36a";g.shadowBlur=22}g.beginPath();g.arc(p.x,p.y,5,0,7);g.fill();g.shadowBlur=0;
      if(on&&!p.pop){p.pop=1;beep(520+k*60,.08);for(var q=0;q<10;q++)parts.push({x:p.x,y:p.y,vx:(Math.random()-.5)*120,vy:-Math.random()*120,l:1,c:COL[q%4]})}});
    /* de lantaarn onderin het midden */
    var lx=w/2,ly=h*.88,gl=g.createRadialGradient(lx,ly,4,lx,ly,90);gl.addColorStop(0,"rgba(255,236,140,"+(.9-.5*lit)+")");gl.addColorStop(1,"rgba(255,236,140,0)");g.fillStyle=gl;g.beginPath();g.arc(lx,ly,90,0,7);g.fill();
    g.fillStyle="#3b3268";g.fillRect(lx-20,ly-34,40,6);g.strokeStyle="#ffd36a";g.lineWidth=3;g.strokeRect(lx-16,ly-28,32,40);g.beginPath();g.arc(lx,ly-38,8,Math.PI,0);g.stroke();
    /* lichtjes vliegen in een boog naar hun paal */
    posts.forEach(function(p,k){var a=(ph-p.t)/.6;if(a<0||a>1)return;var e=1-Math.pow(1-a,2),px=lx+(p.x-lx)*e,py=ly-20+(p.y-ly+20)*e-Math.sin(a*Math.PI)*120;drawShard(g,px,py,12,"",20)});
    /* de dief komt erbij, met het cadeau en een feestmuts */
    if(ph>5.4){var a2=Math.min(1,(ph-5.4)/1.2),tx=w+120-(w*.5+120)*(1-Math.pow(1-a2,3)),ty=base-80+(still?0:Math.sin(t*4)*5);
      if(!drawPose(g,hatK,tx,ty,Math.min(200,h*.28),1))shadowFig(g,tx,ty,120,1,true);
      g.fillStyle="#ff4fa3";g.beginPath();g.moveTo(tx-22,ty-Math.min(200,h*.28)*.44);g.lineTo(tx+4,ty-Math.min(200,h*.28)*.44-46);g.lineTo(tx+26,ty-Math.min(200,h*.28)*.44);g.closePath();g.fill();g.fillStyle="#d4ff3a";g.beginPath();g.arc(tx+4,ty-Math.min(200,h*.28)*.44-46,6,0,7);g.fill()}
    /* vuurwerk en titel */
    if(ph>6.6&&!still&&t-lastB>.55){lastB=t;var bx=w*(.2+Math.random()*.6),by=h*(.12+Math.random()*.25),cc=COL[Math.floor(Math.random()*4)];for(var q=0;q<36;q++){var an=q/36*6.283,sp=80+Math.random()*60;boom.push({x:bx,y:by,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,l:1,c:cc})}beep(300+Math.random()*500,.1)}
    var dt=1/60;[parts,boom].forEach(function(arr){for(var q=arr.length-1;q>=0;q--){var o=arr[q];o.x+=o.vx*dt;o.y+=o.vy*dt;o.vy+=60*dt;o.l-=dt*.8;if(o.l<=0){arr.splice(q,1);continue}g.globalAlpha=o.l;g.fillStyle=o.c;g.fillRect(o.x-2,o.y-2,4,4)}});g.globalAlpha=1;
    if(ph>6.8){g.textAlign="center";var sc=Math.min(1,(ph-6.8)/.5),fs=Math.round(52*sc+16),tt=X.FINT;g.font="700 "+fs+"px 'Fredoka','Arial Rounded MT Bold',sans-serif";var tw=g.measureText(tt).width;if(tw>w-32){fs=Math.floor(fs*(w-32)/tw);g.font="700 "+fs+"px 'Fredoka','Arial Rounded MT Bold',sans-serif"}
      g.fillStyle="#2d7a1f";g.fillText(tt,w/2,h*.44+4);g.fillStyle="#d4ff3a";g.fillText(tt,w/2,h*.44)}
    var li=Math.min(lines.length-1,Math.floor(ph/2.4));txt.textContent=lines[li];
    if(ph>11.5)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}

/* ---------- het album: alle foto's + titel, jachtcode, tijd, sterren en teamkleur in één afbeelding ---------- */
function rrect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function drawAlbum(cv,R){var g=cv.getContext("2d"),W2=cv.width,H=cv.height,slots=R.slots,tc=R.team&&R.team.col;
  var list=[];slots.forEach(function(s,i){if(R.ph[i]&&!isPuz(s.act))list.push({src:R.ph[i],cap:s.what})});
  if(!list.length)slots.forEach(function(s,i){if(R.ph[i])list.push({src:R.ph[i],cap:s.what})});
  list=list.slice(0,9);
  var secs=R.secs||R.min*60,tm=Math.floor(secs/60)+":"+String(secs%60).padStart(2,"0"),IMG={},left=list.length;
  var draw=function(){var r=rngOf(R.seed||1);
    var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#140f2e");bg.addColorStop(.7,"#2a1d55");bg.addColorStop(1,"#1a1433");g.fillStyle=bg;g.fillRect(0,0,W2,H);
    if(tc){g.fillStyle=tc;g.fillRect(0,0,W2,18);g.fillRect(0,H-18,W2,18)}
    for(var i=0;i<120;i++){g.fillStyle=COL[i%4];g.save();g.translate(r()*W2,r()*H);g.rotate(r()*6.3);g.globalAlpha=.45;g.fillRect(-7,-3,14,6);g.restore()}
    /* skyline onderaan met brandende ramen */
    var x=-10,base=H-40;while(x<W2+40){var bw=40+r()*70,bh=90+r()*150;g.fillStyle="#0b0818";g.fillRect(x,base-bh,bw,bh+40);for(var a=0;a<bw/16-1;a++)for(var b=0;b<bh/22-1;b++)if(r()<.55){g.fillStyle=r()>.8?"#38e8ff":"#ffd36a";g.globalAlpha=.85;g.fillRect(x+8+a*16,base-bh+10+b*22,8,11);g.globalAlpha=1}x+=bw+6}
    g.textAlign="center";g.fillStyle="#2d7a1f";g.font="700 84px 'Fredoka','Arial Rounded MT Bold',sans-serif";g.fillText(L==="nl"?"DE LICHTJESDIEF":"THE LIGHT THIEF",W2/2,112,W2-80);g.fillStyle="#d4ff3a";g.fillText(L==="nl"?"DE LICHTJESDIEF":"THE LIGHT THIEF",W2/2,106,W2-80);
    g.fillStyle="#ff9ccf";g.font="400 40px 'Permanent Marker','Comic Sans MS',cursive";g.fillText(R.name?fill(T.albumParty,{J:R.name}):T.albumSub,W2/2,166,W2-120);
    var y0=196;if(tc){g.font="700 30px 'Fredoka',sans-serif";var tt=fill(T.albumTeam,{t:R.team.name}).toUpperCase(),tw=g.measureText(tt).width+60;g.fillStyle=tc;rrect(g,W2/2-tw/2,y0,tw,50,25);g.fill();g.fillStyle="#fff";g.fillText(tt,W2/2,y0+36);y0+=66}else y0+=10;
    /* foto's als polaroids */
    var k=list.length,cols=k<=1?1:k<=4?2:3,rows=Math.max(1,Math.ceil(k/cols)),top=y0+10,areaH=1000-top,gap=34,cw=(W2-100-(cols-1)*gap)/cols,ch=Math.min(cw*1.18,(areaH-(rows-1)*gap)/rows),pw=Math.min(cw,ch/1.18);if(k===1){pw=Math.min(pw,560);ch=pw*1.18}top+=Math.max(0,(areaH-(rows*ch+(rows-1)*gap))/2);
    list.forEach(function(p,i){var c=i%cols,rw=Math.floor(i/cols),inRow=Math.min(cols,k-rw*cols),rowW=inRow*pw+(inRow-1)*gap,px=(W2-rowW)/2+c*(pw+gap),py=top+rw*(ch+gap)+(ch-pw*1.18)/2,phh=pw*1.18,rot=((i*7919+(R.seed||0))%11-5)*.018;
      g.save();g.translate(px+pw/2,py+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);g.shadowColor="rgba(0,0,0,.55)";g.shadowBlur=26;g.shadowOffsetY=10;g.fillStyle="#fff8ee";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
      var pad=pw*.06,iw=pw-2*pad,ih=phh-pw*.26,im=IMG[p.src];if(im){var sc=Math.max(iw/im.width,ih/im.height),dw=im.width*sc,dh=im.height*sc;g.save();g.beginPath();g.rect(pad,pad,iw,ih);g.clip();g.drawImage(im,pad+(iw-dw)/2,pad+(ih-dh)/2,dw,dh);g.restore()}else{g.fillStyle="#2b2340";g.fillRect(pad,pad,iw,ih)}
      g.fillStyle="#ff4fa3";g.globalAlpha=.85;g.fillRect(pw/2-50,-14,100,30);g.globalAlpha=1;
      g.fillStyle="#2b2340";g.font="400 "+Math.round(Math.max(20,Math.min(34,pw*.075)))+"px 'Permanent Marker','Comic Sans MS',cursive";g.textAlign="center";g.fillText(p.cap,pw/2,phh-pw*.08,pw-24);g.restore()});
    /* infokaart: wie het was, tijd, sterren, gouden code */
    var iy=1020,ih2=200;g.fillStyle="rgba(255,248,238,.96)";rrect(g,50,iy,W2-100,ih2,28);g.fill();if(tc){g.strokeStyle=tc;g.lineWidth=8;rrect(g,50,iy,W2-100,ih2,28);g.stroke()}
    if(!drawPose(g,["red","green","yellow"][R.hat||0],150,iy+ih2/2+4,190,1))shadowFig(g,150,iy+ih2/2,120,1,true);
    g.textAlign="left";g.fillStyle="#1a1433";g.font="700 40px 'Fredoka',sans-serif";g.fillText(fill(T.albumWas,{K:R.v.K}),250,iy+62,W2-330);
    g.font="600 34px 'Fredoka',sans-serif";g.fillStyle="#2b2340";g.fillText("⏱ "+tm+"     "+"★".repeat(R.stars)+"☆".repeat(3-R.stars)+(R.gold&&R.gold.length?"     🔑 "+R.gold.join(" "):""),250,iy+118,W2-330);
    g.font="500 26px 'Barlow','Fredoka',sans-serif";g.fillStyle="#6e6386";g.fillText(fill(T.albumLine,{c:R.code,n:R.n,l:T.lvlName[R.level]||""}),250,iy+164,W2-330);
    g.textAlign="center";g.fillStyle="#b9a8ff";g.font="600 26px 'Fredoka',sans-serif";var dS=new Date().toLocaleDateString(L==="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"});g.fillText(T.stripSub+" · "+dS,W2/2,H-40)};
  draw();if(!left)return;
  list.forEach(function(p){if(IMG[p.src]!==undefined){if(--left===0)draw();return}IMG[p.src]=null;var im=new Image();im.onload=im.onerror=function(){IMG[p.src]=im.width?im:null;if(--left===0)draw()};im.src=p.src});
  try{document.fonts.load("400 30px 'Permanent Marker'").then(function(){if(!left)draw()})}catch(e){}}
function drawStrip(cv,ph,code,stars,min){drawAlbum(cv,{ph:ph,code:code,stars:stars,min:min,slots:G.c.slots,seed:G.seed,v:vars(),n:N(),level:G.level,gold:[],team:null,hat:G.c.sus[G.c.K].tr.hoofd,name:NAME})}
function endCase(){LS.del(GK);G=null;home()}

/* ---------- speurdersdiploma: A4 op canvas, als PDF (zelf geschreven, één JPEG-pagina) of als afbeelding ---------- */
var RES=null,TEAM=LS.get("ss_sj_team","");
function dipSheet(){if(!RES)return;
  sheet('<h2>'+T.dipH+'</h2><p>'+T.dipT+'</p><input class="inp team" id="dTeam" autocomplete="off" maxlength="120" placeholder="'+esc(T.dipP)+'" value="'+esc(TEAM)+'"><button type="button" class="btn" id="dGo">'+T.dipGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){closeSheet();winBack()};
  $("#dGo").onclick=function(){TEAM=$("#dTeam").value.trim();LS.set("ss_sj_team",TEAM);dipShow()}}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div><h2>'+esc(r.v.K)+'</h2><button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  $("#vDip").onclick=dipSheet;$("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP&&RES.secs!=null)MMP.result($("#sheetBody"),{code:RES.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function dipShow(){var r=RES;
  sheet('<div class="eyebrow">'+T.dipH+'</div><canvas id="dip" width="1240" height="1754" class="stripc a4"></canvas><p class="note">'+T.dipNote+'</p><button type="button" class="btn" id="dPdf">'+T.dipPdf+'</button><button type="button" class="btn ghost dk" id="dImg">'+T.dipImg+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#dip");drawDiploma(cv,r,TEAM);
  $("#dPdf").onclick=function(){var jpg=cv.toDataURL("image/jpeg",.9),blob=pdfFromJpeg(jpg,cv.width,cv.height),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=(L==="nl"?"speurdersdiploma-":"detective-diploma-")+r.code+".pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)};
  $("#dImg").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],"diploma-"+r.code+".jpg",{type:"image/jpeg"});
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){})}else{var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.9);a.download="diploma-"+r.code+".jpg";document.body.appendChild(a);a.click();a.remove()}},"image/jpeg",.9)};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
function drawDiploma(cv,r,team){var g=cv.getContext("2d"),W2=cv.width,H=cv.height,rr=rngOf(r.code.length*7919+r.min),v=r.v;
  var dateStr=new Date().toLocaleDateString(L==="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"});
  var groups=[],places=[];r.slots.forEach(function(s,i){if(!r.ph[i])return;(s.act==="group"||s.act==="photo"?groups:places).push({src:r.ph[i],cap:s.what})});
  var IMG={},list=groups.concat(places),left=list.length;
  var polaroid=function(src,x,y,pw,phh,cap,rot,font){var imgH=phh-pw*.34;g.save();g.translate(x+pw/2,y+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);
    g.shadowColor="rgba(0,0,0,.28)";g.shadowBlur=18;g.shadowOffsetY=8;g.fillStyle="#fff";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
    var im=IMG[src];if(im){var pad=pw*.06,iw=pw-2*pad,s=Math.max(iw/im.width,imgH/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();g.drawImage(im,pad+(iw-w)/2,pad+(imgH-h)/2,w,h);g.restore()}
    g.fillStyle="#2b2340";g.font=font;g.textAlign="center";g.fillText(cap,pw/2,phh-pw*.1,pw-20);g.restore()};
  var draw=function(){
    g.fillStyle="#fff8ee";g.fillRect(0,0,W2,H);
    for(var i=0;i<220;i++){var e=Math.floor(rr()*4),x,y;if(e===0){x=rr()*W2;y=30+rr()*70}else if(e===1){x=rr()*W2;y=H-100+rr()*70}else if(e===2){x=30+rr()*70;y=rr()*H}else{x=W2-100+rr()*70;y=rr()*H}
      g.fillStyle=["#d4ff3a","#ff4fa3","#f0b429","#38e8ff","#1a1433"][i%5];g.save();g.translate(x,y);g.rotate(rr()*6.3);g.globalAlpha=.8;g.fillRect(-9,-4,18,8);g.restore()}
    g.strokeStyle="#1a1433";g.lineWidth=6;g.strokeRect(70,70,W2-140,H-140);g.strokeStyle="#ff4fa3";g.lineWidth=3;g.strokeRect(86,86,W2-172,H-172);
    var tc=r.team&&r.team.col;if(tc){g.fillStyle=tc;g.fillRect(100,100,W2-200,26)}
    g.textAlign="center";
    g.fillStyle="#1a1433";g.font="700 92px 'Fredoka','Arial Rounded MT Bold',sans-serif";g.fillText(T.dipTitle,W2/2,220);
    g.fillStyle=tc||"#ff4fa3";g.font="600 26px 'Fredoka',sans-serif";g.fillText((tc?fill(T.albumTeam,{t:r.team.name}).toUpperCase()+" · ":"")+(L==="nl"?"MOORDWANDELING · KINDERFEESTJE":"MURDER WALK · KIDS' PARTY").split("").join(String.fromCharCode(8202)),W2/2,268);
    g.fillStyle="#2b2340";g.font="500 34px 'Barlow','Segoe UI',sans-serif";g.fillText(T.dipL1,W2/2,350);
    g.fillStyle="#1a1433";g.font="700 64px 'Fredoka',sans-serif";g.fillText(v.J?fill(T.dipL2,{J:v.J}):T.dipL2b,W2/2,428,W2-240);
    g.fillStyle="#2b2340";g.font="500 34px 'Barlow',sans-serif";g.fillText(T.dipL3,W2/2,486);
    var n=groups.length,gap=30,pw=Math.min(n>=3?300:360,(W2-240-(n-1)*gap)/Math.max(1,n)),phh=pw*1.25,tot=n*pw+(n-1)*gap,x0=(W2-tot)/2,y0=540;
    groups.forEach(function(p,i){polaroid(p.src,x0+i*(pw+gap),y0+(i%2?14:0),pw,phh,p.cap,((i*7919)%9-4)*.02,"700 22px 'Permanent Marker','Comic Sans MS',cursive")});
    var y=y0+phh+70;
    g.fillStyle="#2b2340";g.font="italic 500 28px 'Barlow',sans-serif";g.fillText(fill(T.dipL4,v),W2/2,y,W2-220);y+=44;
    g.fillStyle="#6e6386";g.font="500 26px 'Barlow',sans-serif";var sc2=r.secs!=null?r.secs:r.min*60;g.fillText(fill(T.dipDate2||T.dipDate,{d:dateStr,m:r.min,t:Math.floor(sc2/60)+":"+String(sc2%60).padStart(2,"0"),n:r.n||8,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars)}),W2/2,y);y+=34;
    g.fillStyle="#f0b429";g.font="700 46px 'Fredoka',sans-serif";g.fillText("★".repeat(r.stars)+"☆".repeat(3-r.stars),W2/2,y+26);y+=62;
    if(team){g.fillStyle="#ff4fa3";g.font="600 22px 'Fredoka',sans-serif";g.fillText(T.dipTeam.toUpperCase(),W2/2,y);y+=46;
      var names=team.split(/[,;]+/).map(function(s){return s.trim()}).filter(Boolean),line="",lines=[];g.font="700 36px 'Permanent Marker','Comic Sans MS',cursive";
      names.forEach(function(nm){var t=line?line+"  ·  "+nm:nm;if(g.measureText(t).width>W2-260&&line){lines.push(line);line=nm}else line=t});if(line)lines.push(line);
      g.fillStyle="#1a1433";lines.slice(0,3).forEach(function(l){g.fillText(l,W2/2,y);y+=46});y+=14}
    var m=places.length;if(m){var sw=Math.min(170,(W2-240-(m-1)*16)/m),sh=sw*1.25,sx=(W2-(m*sw+(m-1)*16))/2;places.forEach(function(p,i){polaroid(p.src,sx+i*(sw+16),y+(i%2?8:0),sw,sh,p.cap,((i*104729)%9-4)*.02,"600 14px 'Permanent Marker',cursive")});y+=sh+60}
    var sy=Math.min(Math.max(y+20,H-260),H-200);g.strokeStyle="#1a1433";g.lineWidth=2;g.beginPath();g.moveTo(W2/2-200,sy);g.lineTo(W2/2+200,sy);g.stroke();
    g.fillStyle="#1a1433";g.font="700 40px 'Permanent Marker',cursive";g.save();g.translate(W2/2,sy-18);g.rotate(-.04);g.fillText(D.V,0,0);g.restore();
    g.fillStyle="#6e6386";g.font="500 22px 'Barlow',sans-serif";g.fillText(T.dipSign,W2/2,sy+36);
    if(r.hat!=null)drawPose(g,["red","green","yellow"][r.hat],W2/2+350,sy-30,170,1);
    g.fillStyle="#6e6386";g.font="500 20px 'Fredoka',sans-serif";g.fillText(fill(T.dipFoot,{c:r.code})+(r.gold&&r.gold.length?" · 🔑 "+r.gold.join(""):""),W2/2,H-112)};
  if(!left)return draw();
  list.forEach(function(p){if(IMG[p.src]!==undefined){if(--left===0)draw();return}IMG[p.src]=null;var im=new Image();im.onload=im.onerror=function(){IMG[p.src]=im.width?im:null;if(--left===0)draw()};im.src=p.src});
  try{document.fonts.load("700 30px 'Permanent Marker'").then(function(){if(!left)draw()})}catch(e){}}
/* minimale PDF: één A4-pagina met één JPEG (DCTDecode) over de hele pagina */
function pdfFromJpeg(dataURL,w,h){var b64=dataURL.split(",")[1],bin=atob(b64),n=bin.length,img=new Uint8Array(n);for(var i=0;i<n;i++)img[i]=bin.charCodeAt(i);
  var PW=595.28,PH=841.89,enc=function(s){var u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u},parts=[],off=[],pos=0,push=function(u){parts.push(u);pos+=u.length};
  push(enc("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"));
  var objs=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+PW+" "+PH+"] /Resources << /XObject << /Im1 5 0 R >> >> /Contents 4 0 R >>"];
  var content="q "+PW+" 0 0 "+PH+" 0 0 cm /Im1 Do Q";objs.push("<< /Length "+content.length+" >>\nstream\n"+content+"\nendstream");
  objs.forEach(function(o,i){off[i+1]=pos;push(enc((i+1)+" 0 obj\n"+o+"\nendobj\n"))});
  off[5]=pos;push(enc("5 0 obj\n<< /Type /XObject /Subtype /Image /Width "+w+" /Height "+h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+n+" >>\nstream\n"));push(img);push(enc("\nendstream\nendobj\n"));
  var x=pos,xref="xref\n0 6\n0000000000 65535 f \n";for(i=1;i<=5;i++)xref+=String(off[i]).padStart(10,"0")+" 00000 n \n";
  push(enc(xref+"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+x+"\n%%EOF\n"));
  return new Blob(parts,{type:"application/pdf"})}

/* ---------- ruilcode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}setLen(p.len);setLevel(p.level);closeSheet();begin(p.seed,p.mode,false)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.dr,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
  sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min</small><div class="tags"><i>'+st(x.st)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();KM.leave();popStop();G=null;home()}
function wipeGame(){LS.del(GK);Wk.stopWatch();KM.leave();popStop();G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);MW.profile.wipe();if(/github\.io$/.test(location.hostname))LS.del(MW.pro.freeKey(ID));closeSheet();home();toast(T.wiped)})}}
function goBack(){if(!$("#hide").hidden){$("#hideX").click();return true}if(!$("#cine").hidden){$("#cineX").click();return true}
  if(!$("#sheet").hidden){if($("#sheet").dataset.lock){var x=$("#vHome")||$("#shX")||$("#bNext")||$("#bHide");if(x)x.click()}else closeSheet();return true}
  if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({sj:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({sj:1},"")}catch(e){}}})}catch(e){}

/* ---------- startscherm: skyline met knipperende ramen, confetti en een schaduw die voorbijsluipt ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,bits=[],bld=[],dpr=1;
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;bits=[];for(var i=0;i<(still?0:40);i++)bits.push({x:Math.random()*w,y:Math.random()*h,s:4+Math.random()*7,v:.25+Math.random()*.6,a:Math.random()*6.3,c:COL[i%4]});
    var r=rngOf(11);bld=[];var x=-10;while(x<w+40){var bw=26+r()*46,bh=50+r()*130,b={x:x,w:bw,h:bh,win:[]};for(var i=0;i<bw/11-1;i++)for(var j=0;j<bh/15-1;j++)if(r()<.4)b.win.push([5+i*11,7+j*15,r()]);bld.push(b);x+=bw+3+r()*8}}
  rs();addEventListener("resize",rs);
  function f(t){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);if($("#home").hidden){requestAnimationFrame(f);return}
    var base=Math.min(h,640)*.72;
    bld.forEach(function(b){g.fillStyle="rgba(10,7,24,.9)";g.fillRect(b.x,base-b.h,b.w,b.h);b.win.forEach(function(wn){var on=still||Math.sin(t/900*wn[2]+wn[2]*40)>-.4;g.fillStyle=on?(wn[2]>.85?"#38e8ff":"#ffd36a"):"#1a1433";g.globalAlpha=on?.85:.4;g.fillRect(b.x+wn[0],base-b.h+wn[1],6,8)})});g.globalAlpha=1;
    if(!still){var sx=((t/40)%(w+200))-100;shadowFig(g,sx,base-40,90,.9,true,"run")}
    bits.forEach(function(b){g.save();g.translate(b.x,b.y);g.rotate(b.a+t/900);g.globalAlpha=.4;g.fillStyle=b.c;g.fillRect(-b.s/2,-b.s/4,b.s,b.s/2);g.restore();b.y+=b.v;b.x+=Math.sin(t/700+b.a)*.3;if(b.y>h+10){b.y=-10;b.x=Math.random()*w}});
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
hero();
/* ---------- start ---------- */
var hz=/[#&]z=([A-Z0-9]+)/i.exec(location.hash);
if(window.MMP)MMP.init({id:ID,fin:{nl:'De Lichtjesdief zucht: oké, oké. Het cadeau ligt niet in mijn schuilplaats. Ik heb het echt verstopt. Hier.',en:'The Light Thief sighs: okay, okay. The present is not in my hideout. I really hid it. Here.'}});
/* testhaakjes (voor de begeleider/ontwikkelaar; doet niks tenzij je ze aanroept) */
window.SJ_T={begin:begin,render:render,G:function(){return G},solve:function(){if(cur&&cur.solve)cur.solve()},parse:parseCode,make:makeCode,gen:function(seed,mode,len){return genCase(seed,mode,len)},lock:function(){return lockOrder().map(function(x){return x.d}).join("")},open:function(i){var sp=G.st?G.st.filter(function(x){return x.fi===i})[0]:null;ruilSheet(i,sp||null)}};
home();if(hz){var pc=parseCode(hz[1]);if(pc)codeSheet(hz[1].toUpperCase())}
MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
})();
