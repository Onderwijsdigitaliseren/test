/* De verdwenen bijen – MiniMystery Educatie (natuur). Opzet gelijk aan games/reken en games/tijd. Op de wandelmotor van MiniMystery (platform.js, walk.js, kidsmap.js).
   Drie standen: buiten met kaart (gps, plekken binnen ± 300 m), buiten zonder kaart (missies achter elkaar), en in het gebouw
   (de begeleider kiest plekken in de school; per plek een kaartje met een code, uit het begeleidersblad).
   6, 10 of 12 tijdlekken; elk tijdlek is een tijdvak met een onderzoekje en een vraag. Finale: de tijdvakken op volgorde leggen.
   Zaakcode TR…: dezelfde tijdreis op alle telefoons (in de gebouw-stand zit ook de plekkenkeuze in de code). */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.NT_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="nt",GK="ss_game_nt",WK="ss_ways_nt",hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz,beep=Wk.beep;function closeSheet(){hush();Wk.closeSheet()}
var G=null,tick=0,MODE=LS.get("ss_nt_mode","map"),NAME=LS.get("ss_nt_name",""),VOICE=LS.get("ss_nt_voice",true),AGE=String(LS.get("ss_nt_age","1")),MODUS=LS.get("ss_nt_modus","school");
if(!/^(map|street|gebouw)$/.test(MODE))MODE="map";
var LEN=LS.get("ss_nt_len","normaal");if(!/^(kort|normaal|lang)$/.test(LEN))LEN="normaal";
var LENN={kort:6,normaal:8,lang:10},LENR={kort:240,normaal:300,lang:340},R0=300;
var W=[],P={x:0,y:0,acc:0},map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null;
var MBY={};D.S.forEach(function(m){MBY[m.id]=m});
var ROOMSEL=LS.get("ss_nt_rooms",[0,1,2,3,4,5,6,7,8,9]),NOCARDS=!!LS.get("ss_nt_nocards",false);
function RR(){return G&&G.R||R0}
function NN(){return G&&G.c&&G.c.slots?G.c.slots.length:LENN[LEN]}
function ageI(){return Math.max(0,Math.min(2,+(G&&G.age!=null?G.age:AGE)||0))}
function modus(){return (G&&G.modus)||MODUS}
function locked(){return !D.FREE&&MW.pro.locked(ID)}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9:,.]/g,"").replace(/^(de|het|een)(?=[a-z])/,"")}
function inBuilding(){return G&&G.mode==="gebouw"}

/* ---------- stem ---------- */
function say(t){if(!VOICE||!t)return;t=String(t).replace(/<[^>]+>/g,"");if(window.MMVoice)return MMVoice.say(t);try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(t.replace(/[“”"]/g,"").replace(/\{[^}]+\}/g,""));u.lang="nl-NL";u.rate=.92;u.pitch=1.05;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
/* artwork van Kellie in games/natuur/img wint waar het er is (zie games/natuur/ARTWORK.md); anders getekende/tekst-versies */
var IMGROOT=MW.root+"games/natuur/img/",IM={};
["hero","noor","tik","bijenkast","bijen","diploma-stempel"].concat(D.S.map(function(m){return "st-"+m.id})).forEach(function(k){var im=new Image();im.src=IMGROOT+k+".webp?v=1";IM[k]=im});
function ok(k){var im=IM[k];return !!(im&&im.complete&&im.naturalWidth)}
function avatarHTML(cls,letter,key){return '<span class="avatar '+cls+'" aria-hidden="true"'+(ok(key)?' style="background:#fff8ec url('+IMGROOT+key+'.webp?v=1) center 18%/150% auto no-repeat"':'')+'>'+(ok(key)?"":letter)+'</span>'}
var TIKAV='<span class="avatar tik" aria-hidden="true">T</span>',NOORAV='<span class="avatar noor" aria-hidden="true">N</span>';
function refreshAv(){TIKAV=avatarHTML("tik","T","tik");NOORAV=avatarHTML("noor","N","noor");if(ok("hero"))$("#home").classList.add("photo")}
Promise.all(Object.keys(IM).map(function(k){return new Promise(function(res){var im=IM[k];if(im.complete)return res();im.onload=im.onerror=function(){res()}})})).then(refreshAv);
function eraPic(m){return ok("st-"+m.id)?'<img class="erapic" src="'+IMGROOT+'st-'+m.id+'.webp?v=1" alt="">':''}
function bubble(txt,who,cls,av){return '<div class="msg '+(cls||"")+'">'+(av||NOORAV)+'<div class="bub"><button type="button" class="spk" aria-label="'+esc(T.listen)+'" data-say="'+esc(txt.replace(/<[^>]+>/g,""))+'">🔊</button>'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+txt+'</p></div></div>'}
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){hush();VOICE=true;say(b.dataset.say)}});

/* ---------- de tijdreis samenstellen (alleen uit de seed) ---------- */
function genCase(seed,N,age){var r=rngOf(seed),ids=N<=6?D.KORT.slice():D.S.slice(0,N).map(function(m){return m.id});
  ids=shuffle(ids,r);var ch=D.KETEN[N]||D.KETEN[8],keys=ch.map(function(k,i){return{e:k[0],s:k[1],v:i}});
  keys=shuffle(keys,r);return{slots:ids.map(function(id,i){return{m:id,key:keys[i]}})}}
function b36(n,len){var s=n.toString(36).toUpperCase();while(s.length<len)s="0"+s;return s}
function makeCode(seed,mode,len,age,modus,rooms,nocards){var mask=0;(rooms||[]).forEach(function(i){mask|=1<<i});if(nocards)mask|=1<<14;
  return"NT"+(len==="kort"?"V":len==="lang"?"L":"N")+(mode==="gebouw"?"G":mode==="map"||mode==="demo"?"K":"S")+(+age+1)+(modus==="bso"?"B":"S")+(mode==="gebouw"?b36(mask,3):"")+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v),m=/^NT([VNL])([KSG])([123])([SB])([0-9A-Z]+)$/.exec(c);if(!m)return null;var rest=m[5],rooms=null,nocards=false;
  if(m[2]==="G"){if(rest.length<4)return null;var mask=parseInt(rest.slice(0,3),36);rest=rest.slice(3);rooms=[];for(var i=0;i<14;i++)if(mask&(1<<i))rooms.push(i);nocards=!!(mask&(1<<14));if(!rooms.length)return null}
  if(rest.length>8)return null;var seed=parseInt(rest,36);if(!(seed>=0)||seed>4294967295)return null;
  return{len:m[1]==="V"?"kort":m[1]==="L"?"lang":"normaal",mode:m[2]==="G"?"gebouw":m[2]==="K"?"map":"street",age:String(+m[3]-1),modus:m[4]==="B"?"bso":"school",seed:seed,rooms:rooms,nocards:nocards}}
function roomCode(seed,i){return 100+(((seed>>>0)*31+(i+1)*7919)>>>0)%900}
function fixG(g){if(!g||!g.c||!g.c.slots)return null;if(!g.R)g.R=LENR[g.len]||R0;if(!Array.isArray(g.ph))g.ph=[];if(!Array.isArray(g.order))g.order=[];if(!g.hints)g.hints={};if(!g.spoor)g.spoor={};if(!g.photos)g.photos={};if(!g.obs)g.obs={};return g}
function done(){return G.ph.filter(Boolean).length}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get(),g=p.games.nt;
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(g&&g.n)||0;
  $("#bResume").hidden=!LS.get(GK,null);
  var lk=locked();$("#bGps").textContent=(lk?"🔒 ":"")+T.today;$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=true;$("#status").textContent="";
  $("#name").value=NAME;voiceBtn();
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});
  $$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===AGE)});
  $$("#dur button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});
  $$("#route button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.r===MODUS)});
  show("home")}
function voiceBtn(){var b=$("#bVoice");if(b){b.textContent=(VOICE?"🔊 ":"🔇 ")+T.voice;b.setAttribute("aria-pressed",VOICE)}}
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function segClick(id,key,fn){var el=$(id);if(!el)return;el.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;fn(b.dataset[key]);$$(id+" button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})})}
segClick("#len","m",function(v){MODE=v;LS.set("ss_nt_mode",MODE)});
segClick("#lvl","l",function(v){AGE=v;LS.set("ss_nt_age",AGE)});
segClick("#dur","n",function(v){LEN=v;LS.set("ss_nt_len",LEN)});
segClick("#route","r",function(v){MODUS=v;LS.set("ss_nt_modus",MODUS)});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_nt_name",NAME)});
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_nt_voice",VOICE);voiceBtn();toast(VOICE?T.voiceOn:T.voiceOff);if(VOICE)say(T.voiceOn);else hush()};
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#bGps").onclick=function(){if(locked())return proSheet();begin(hashStr("tr|"+MODE+"|"+MW.today()+"|"+LEN+"|"+AGE+"|"+MODUS),MODE,true,LEN)};
$("#bRandom").onclick=function(){if(locked())return proSheet();begin(Math.floor(Math.random()*4e9),MODE,false,LEN)};
$("#bPro").onclick=proSheet;
$("#bDemo").onclick=function(){var w=ehvWorld();build(Math.floor(Math.random()*4e9),"demo",w.pois,w.ways,null,false,"kort")};
$("#bHow").onclick=function(){sheet('<h2>'+T.howH+'</h2>'+$("#howT").innerHTML+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet};
$("#bResume").onclick=function(){G=fixG(LS.get(GK,null));if(!G){LS.del(GK);return home()}W=LS.get(WK,[]);P={x:G.px||0,y:G.py||0,acc:0};enter()};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;

/* ---------- proefronde: de binnenstad van Eindhoven, getekend ---------- */
function ehvWorld(){
  var S=function(n,w){var p=[];for(var i=2;i<arguments.length;i++)p.push(arguments[i][0],arguments[i][1]);return{n:n,w:w,p:p}},ways=[
    S("Dommel",9,[540,-760],[500,-420],[455,-120],[470,160],[430,430],[390,760]),S("Vestdijk",3,[330,-760],[322,-380],[315,-60],[312,240],[330,560],[345,780]),
    S("Emmasingel",3,[-330,-330],[-410,-150],[-440,120],[-420,330]),S("Keizersgracht",3,[-420,330],[-200,300],[60,330],[300,380]),S("Stationsweg",3,[60,-300],[75,-480],[95,-700]),
    S("Mathildelaan",3,[-330,-330],[-120,-420],[95,-470],[322,-470]),S("Rechtestraat",2,[0,0],[15,-150],[60,-300]),S("Demer",2,[60,-300],[-120,-270],[-330,-330]),
    S("Hooghuisstraat",2,[0,0],[-160,-40],[-310,-70]),S("Kleine Berg",2,[-20,25],[-160,130],[-320,250]),S("Kerkstraat",2,[0,0],[95,85]),S("Stratumseind",2,[95,85],[190,210],[300,380]),
    S("Jan van Lieshoutstraat",2,[95,85],[210,40],[315,20]),S("Wal",2,[95,85],[60,200],[60,330]),S("Bilderdijklaan",2,[300,380],[380,470],[430,520]),S("Dommelstraat",2,[15,-150],[170,-140],[320,-140],[455,-130]),
    S("Willemstraat",2,[-410,-150],[-250,-170],[-120,-270]),S("Wilhelminaplein",2,[-440,120],[-330,150],[-160,130]),
    S("",1,[-160,-40],[-120,-270]),S("",1,[-160,130],[-160,-40]),S("",1,[60,200],[-160,130]),S("",1,[190,210],[315,200]),S("",1,[170,-140],[210,40]),S("",1,[-250,-170],[-310,-70],[-330,150]),
    S("",2,[312,240],[470,260]),S("",2,[315,-60],[455,-60]),S("",1,[95,-470],[60,-300]),S("",1,[60,330],[120,520],[230,640],[330,560]),S("",1,[120,520],[300,470]),S("",1,[230,640],[160,700])];
  var Q=[["kerk","Catharinakerk",150,120],["kunst","Van Abbemuseum",395,505],["bieb","Bibliotheek in De Witte Dame",-345,-360],["kunst","Philips Museum",-430,-240],["cafe","Café op Stratumseind",235,270],["cafe","Café aan de Markt",55,-70],
    ["park","Stadswandelpark",190,600],["halte","Station Eindhoven Centraal",90,-620],["halte","Bushalte Vestdijk",335,-160],["winkel","De Bijenkorf",-100,-215],["winkel","Winkelcentrum Heuvel",-230,-50],["post","Brievenbus Rechtestraat",30,-180],
    ["hotel","Hotel aan het 18 Septemberplein",110,-330],["apotheek","Apotheek Kleine Berg",-210,180],["bankje","Bankje aan de Dommel",480,200],["school","School aan de Vestdijk",380,-380],["bank","Bank aan de Vestdijk",290,40],["kunst","Kunstwerk op het Wilhelminaplein",-360,170]];
  return{ways:ways,pois:Q.map(function(q){return{type:q[0],name:q[1],x:q[2],y:q[3]}})}}

/* ---------- verhaalkaart (kidsmap.js) ---------- */
var KI=MW.KidsMap.icons,START={x:500,y:1290};
var FP=[{x:230,y:1040,k:"fiets"},{x:150,y:760,k:"halte"},{x:300,y:520,k:"speel"},{x:520,y:330,k:"plein2"},{x:760,y:420,k:"brug"},{x:860,y:700,k:"park"},{x:720,y:960,k:"kerk"},{x:500,y:760,k:"plein"},{x:150,y:300,k:"winkel"},{x:880,y:1060,k:"post"},{x:620,y:1130,k:"kiosk"},{x:380,y:900,k:"bank"}];
var ROADS=[[-1,0],[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,-1],[7,2],[7,5],[7,0],[7,6],[8,2],[8,1],[9,6],[9,5],[10,-1],[10,6],[11,7],[11,0]];
var TREES=[[80,1180],[120,320],[420,160],[640,180],[900,260],[950,900],[940,1180],[300,1300],[700,1300],[640,600],[90,520],[820,1050],[560,1120]];
var KM=MW.KidsMap.create({T:T.kv,go:function(s){walkTo={x:s.x,y:s.y};sel=null},G:function(){return G},P:function(){return P},dTo:function(s){return dTo(s)},virt:function(){return !!(G&&G.virt)},mode:function(){return G&&G.mode},
  map:{W:1000,H:1400,top:170,start:START,spots:FP,roads:ROADS,vsc:.42,sky:"#d9c7f0",land:"#c9e2a6",road:"#eae4d3",roadLine:"#fff",label:"#2b1f4a",labelHalo:"rgba(255,255,255,.9)",heroHalo:"rgba(122,92,214,.3)"},
  draw:{mark:function(g,x,y,r,col){g.save();g.fillStyle=col;g.beginPath();g.ellipse(x,y,r*.9,r,0,0,7);g.fill();g.restore()},
    ground:function(g){g.fillStyle="#b7d98f";[[200,250,160],[760,900,200],[300,1150,140],[650,250,120]].forEach(function(e){g.beginPath();g.ellipse(e[0],e[1],e[2],e[2]*.5,0,0,7);g.fill()});
      g.strokeStyle="#8fc6f0";g.lineWidth=70;g.lineCap="round";g.lineJoin="round";g.beginPath();[[0,640],[120,690],[260,660],[420,700],[600,680],[800,720],[1000,690]].forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke()},
    decor:function(g){TREES.forEach(function(p,i){KI.tree(g,p[0],p[1],44+(i%3)*8)});[[60,1000,"#f4a261"],[900,200,"#cdb4db"],[420,1000,"#8ecae6"]].forEach(function(h){KI.house(g,h[0],h[1],56,h[2])})},
    start:function(g,x,y){KI.school(g,x,y,110);g.save();g.strokeStyle="#7a5cd6";g.lineWidth=4;g.setLineDash([6,6]);g.beginPath();g.arc(x,y-70,16,0,7);g.stroke();g.restore()},
    landmark:function(g,k,x,y,s){({fiets:function(){KI.sign(g,x,y,s,"#2b1f4a","🚲")},halte:function(){KI.sign(g,x,y,s,"#2563eb","B")},speel:function(){KI.swing(g,x,y,s)},plein2:function(){KI.lamp(g,x,y,s)},brug:function(){KI.bridge(g,x,y,s)},park:function(){KI.park(g,x,y,s)},kerk:function(){KI.church(g,x,y,s)},plein:function(){KI.fountain(g,x,y,s)},winkel:function(){KI.shop(g,x,y,s)},post:function(){KI.postbox(g,x,y,s)},kiosk:function(){KI.kiosk(g,x,y,s)},bank:function(){KI.bench(g,x,y,s)}}[k]||function(){})()},
    hero:function(g,x,y){g.save();g.fillStyle="#f5b800";g.strokeStyle="#2b1f4a";g.lineWidth=3;for(var i=-1;i<=1;i++){g.beginPath();g.arc(x+i*22,y-18,11,0,7);g.fill();g.stroke();g.fillStyle=["#3a9be6","#e0584f","#7a5cd6"][i+1];g.fillRect(x+i*22-9,y-6,18,16);g.fillStyle="#f5b800"}g.restore()}}});
KM.mount();
function buildVirt(seed,mode,origin,daily,len){build(seed,mode,null,null,origin,daily,len,true);if(G&&mode==="map")toast(T.kv.virtOut)}
function noMapSheet(seed,daily,why,len){sheet('<h2>'+T.kv.noMapQ+'</h2>'+(why?'<p class="note">'+esc(why)+'</p>':'')+'<p>'+esc(T.kv.noMapT)+'</p><button type="button" class="btn" id="nmGo">'+T.kv.noMapGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet;$("#nmGo").onclick=function(){closeSheet();MODE="street";LS.set("ss_nt_mode",MODE);build(seed,"street",null,null,null,daily,len)}}
function dropMap(){if(!G||G.mode!=="map")return;Wk.stopWatch();KM.leave();G.virt=false;G.mode="street";G.i=0;while(G.ph[G.i])G.i++;G.st=null;save();show("cards");render();toast(T.kv.switched)}

/* ---------- gebouw-stand: plekken kiezen ---------- */
function roomsSheet(cb){var N=LENN[LEN];
  sheet('<h2>'+esc(T.gbH)+'</h2><p>'+esc(T.gbT)+'</p><div class="rooms" id="rooms">'+D.ROOMS.map(function(r,i){return '<label><input type="checkbox" data-i="'+i+'"'+(ROOMSEL.indexOf(i)>=0?' checked':'')+'><span>'+esc(r)+'</span></label>'}).join("")+'</div>'+
    '<label class="rooms one"><input type="checkbox" id="noCards"'+(NOCARDS?' checked':'')+'><span>'+esc(T.gbNoCards)+'</span></label><p class="note" id="rMsg"></p>'+
    '<button type="button" class="btn" id="rGo">'+esc(T.gbGo)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;var chk=function(){var sel=$$("#rooms input:checked").map(function(c){return +c.dataset.i});$("#rMsg").textContent=sel.length<N?fill(T.gbMin,{n:N}):"";return sel};chk();
  $("#rooms").addEventListener("change",chk);
  $("#rGo").onclick=function(){var sel=chk();if(!sel.length){toast(fill(T.gbMin,{n:N}));return}ROOMSEL=sel;NOCARDS=$("#noCards").checked;LS.set("ss_nt_rooms",ROOMSEL);LS.set("ss_nt_nocards",NOCARDS);closeSheet();cb(sel,NOCARDS)}}

/* ---------- een tijdreis beginnen ---------- */
var PEND=null;
function begin(seed,mode,daily,len){len=len||"normaal";
  if(mode==="gebouw"){if(PEND&&PEND.rooms)return build(seed,"gebouw",null,null,null,daily,len);return roomsSheet(function(rooms,nocards){PEND=Object.assign(PEND||{},{rooms:rooms,nocards:nocards});build(seed,"gebouw",null,null,null,daily,len)})}
  if(mode!=="map")return build(seed,mode,null,null,null,daily,len);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:LENR[len]||R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      if(!w.pois||!w.pois.length)return buildVirt(seed,"map",w.origin,daily,len);
      build(seed,"map",w.pois,w.ways,w.origin,daily,len);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})},function(){Wk.loading("");var kx=111320*Math.cos(lat*Math.PI/180);buildVirt(seed,"map",{lat:lat,lon:lon,kx:kx,ky:110540},daily,len)})
  }).catch(function(e){Wk.loading("");noMapSheet(seed,daily,e==="nogps"?T.noGps:T.denied,len)})}
function build(seed,mode,pois,ways,origin,daily,len,virt){len=LENN[len]?len:"normaal";var N=LENN[len],age=PEND&&PEND.age!=null?PEND.age:AGE,md=PEND&&PEND.modus?PEND.modus:MODUS,rooms=PEND&&PEND.rooms?PEND.rooms:null,nocards=!!(PEND&&PEND.nocards);PEND=null;
  var c=genCase(seed,N,Math.max(0,Math.min(2,+age||0)));
  G={seed:seed,code:makeCode(seed,mode,len,age,md,rooms,nocards),mode:mode,age:age,modus:md,len:len,R:LENR[len],c:c,i:0,ph:[],order:[],hints:{},spoor:{},photos:{},obs:{},t0:0,daily:!!daily,dist:0,origin:origin,px:0,py:0,st:null,wrong:0};
  if(mode==="gebouw"){var r0=rngOf(seed^0x7777),rs=shuffle(rooms,r0),ro=[];for(var k=0;k<N;k++)ro.push(rs[k%rs.length]);G.rooms=rooms;G.roomOrder=ro;G.nocards=nocards}
  else if(virt){G.virt=true;G.st=KM.virtSpots(N).map(function(p,i){p.fi=i;p.done=false;return p});W=[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  else if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,G.R,N,r,T.corner);
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het) /,"")),fi:i,done:false}});
    for(k=0;G.st.length<N&&k<N;k++){var a=r()*6.283,d=G.R*(.35+.5*r());G.st.push({x:Math.round(Math.cos(a)*d),y:Math.round(Math.sin(a)*d),type:"hoek",name:T.corner+" "+(G.st.length+1),fi:G.st.length,done:false})}
    W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  brief()}
function brief(){
  $("#bfNo").textContent=(G.mode==="demo"?T.demoCase:"");
  $("#bfOpen").innerHTML=(ok("schrift")?'<img class="erapic" src="'+IMGROOT+'schrift.webp?v=1" alt="Het oude schrift uit 1923">':'')+bubble(fill(openOf(modus()),{N:T.nw[NN()]||NN()}),D.NOOR,"big")+
    '<div class="chips"><span class="chip">'+esc(T.lvl[ageI()])+'</span><span class="chip">'+(modus()==="bso"?"BSO-modus":"Schoolmodus")+'</span><span class="chip">'+NN()+' stations</span><span class="chip">'+(inBuilding()?"in het gebouw":G.mode==="street"?"zonder kaart":"met kaart")+'</span></div>';
  $("#bfTip").innerHTML=MW.codeBox(L,G.code,"zaak");MW.bindCodeBox($("#bfTip"),L);
  show("brief")}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode==="map"||G.mode==="street")MW.pro.setFree(ID)}save();hush();enter()};
$("#bBack").onclick=function(){G=null;hush();home()};
$("#bLead").onclick=function(){leadSheet()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}
function enter(){fixG(G);if(G.mode==="map"||G.mode==="demo")enterMap();else{show("cards");render()}}

/* ---------- hud ---------- */
function tilesHTML(){var out="";G.c.slots.map(function(s){return s}).sort(function(a,b){return a.key.v-b.key.v}).forEach(function(s){var i=G.c.slots.indexOf(s),got=!!G.ph[i];out+='<i class="tl'+(got?" on":"")+'">'+(got?s.key.e:"")+'</i>'});return out}
function hud(){if(!G)return;var n=done();$("#hT").textContent=mmss(Date.now()-G.t0);$("#hS").textContent=n+"/"+NN();$("#hM").innerHTML=tilesHTML()}
function render(){hud();while(G.i<NN()&&G.ph[G.i])G.i++;var i=G.i,box=$("#card"),N=NN();
  if(i>=N){box.innerHTML='<div class="pol done"><div class="big">🕰️</div></div>'+bubble(T.radarAll,D.NOOR)+'<button type="button" class="btn red" id="bAcc">'+T.finH+'</button>';$("#bAcc").onclick=toFinale;return}
  var s=G.c.slots[i],m=MBY[s.m];
  if(inBuilding()){var room=D.ROOMS[G.roomOrder[i]];
    box.innerHTML='<div class="pol empty"><div class="ph">🚪</div><p class="cap">'+esc(fill(T.task,{i:i+1,n:N}))+'</p></div><div class="goto"><em>'+esc(T.gbGoto)+'</em><b>'+esc(room)+'</b></div>'+
      (G.nocards?'<button type="button" class="btn" id="bHere">'+esc(T.gbHere)+'</button>':'<p class="q">'+esc(T.gbCode)+'</p><input class="inp code" id="rc" inputmode="numeric" maxlength="3" autocomplete="off" placeholder="000"><div id="fb"></div><button type="button" class="btn" id="bHere">'+T.ok+'</button>');
    var go=function(){if(!G.nocards){var v=($("#rc").value||"").replace(/\D/g,"");if(v!==String(roomCode(G.seed,G.roomOrder[i]))){G.wrong++;save();beep(180,.2);$("#fb").innerHTML='<div class="fb no">'+esc(T.gbBad)+'</div>';$("#rc").select();return}}buzz([60,40,60]);beep(660,.2);taskSheet(i)};
    $("#bHere").onclick=go;if($("#rc"))$("#rc").onkeydown=function(e){if(e.key==="Enter")go()};return}
  box.innerHTML='<div class="pol empty"><div class="ph">'+m.ico+'</div><p class="cap">'+esc(fill(T.task,{i:i+1,n:N}))+'</p></div>'+bubble("Loop samen naar een nieuwe plek in de buurt: een hoek, een gebouw, een stoep of een plein. Daar staat het volgende natuurstation: <b>"+esc(m.title)+"</b>.",D.NOOR)+'<button type="button" class="btn" id="bOpen">▶ '+T.start+'</button>';
  $("#bOpen").onclick=function(){taskSheet(i)}}

/* ---------- spelen met kaart ---------- */
function enterMap(){show("play");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return RR()},
    theme:{bg:"#2b1f4a",water:"#4a62b8",waterEdge:"#8fc6f0",ripple:"rgba(143,198,240,.3)",park:"#2f8a4c",parkEdge:"#6fd38a",river:"#4a62b8",major:"#f5b800",minor:"#6a5ab8",road:"#b3a6e8",label:"#ffe08a",waterLabel:"#bfeaff",ring:"rgba(245,184,0,.35)",me:"#f5b800",meHalo:"rgba(245,184,0,.16)",meRing:"rgba(245,184,0,.7)",font:"700 12px 'Fredoka',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(RR());sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d;KM.moved(d)});
  KM.enter({kids:true,virt:!!G.virt,map:map});
  if(G.mode==="demo")toast(T.demoTip);
  requestAnimationFrame(loop)}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[];
  it.push({x:P.x,y:P.y,tap:false,draw:function(cx,X,Y,t,api){if(api.still)return;cx.save();cx.fillStyle="rgba(245,184,0,.18)";cx.beginPath();cx.arc(X,Y,30+8*Math.sin(t/300),0,7);cx.fill();cx.restore()}});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/500+s.fi)*3;
    if(!s.done&&!api.still){cx.strokeStyle="#f5b800";cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*22,0,7);cx.stroke();cx.globalAlpha=1}
    Wk.badge(cx,X,Y+bob*.3,"obj",s.done?"#6b7fa8":"#f5b800",1,s.done);
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,26,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#9fb0d8":"#fff";cx.shadowColor="#000";cx.shadowBlur=6;if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+36);cx.shadowBlur=0}})});
  return it}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=110*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  if(!KM.draw(t))map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tickMap()}requestAnimationFrame(loop)}
function tickMap(){var el=Math.floor((Date.now()-G.t0)/1000),n=done();
  $("#mT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#mS").textContent=n+"/"+NN();$("#mM").innerHTML=tilesHTML();
  var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});
  $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);beep(660,.2)}if(!here)arrived=null;
  chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel);
  $("#cName").textContent=sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=T.here+" · "+MBY[G.c.slots[sel.fi].m].title;
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))taskSheet(sel.fi,sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;taskSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mAcc").onclick=toFinale;$("#bNote").onclick=noteSheet;$("#bAcc2").onclick=toFinale;

/* ---------- een tijdlek: de tijdreis → het onderzoek → de vraag → tijdsleutel + feit + buurtonderzoek ---------- */
function puzzleOf(s){return MBY[s.m].lvl[ageI()]}
function tipOf(m){return m.tip[ageI()]}
function introOf(m){return m.intro}
function feitOf(m){return tipOf(m)}
function openOf(md){return ageI()===0&&D.OPEN0?D.OPEN0[md]:D.OPEN[md]}
function revealOf(md){return ageI()===0&&D.REVEAL0?D.REVEAL0[md]:D.REVEAL[md]}
function taskSheet(i,spot){walkTo=null;
  if(G.mode==="demo"&&!G.ph[i]&&done()>=(window.MMTrial?MMTrial.max:2)&&window.MMTrial&&locked()){var _GK=GK;return MMTrial.end({buy:proSheet,home:function(){leavePlay();try{localStorage.removeItem(_GK)}catch(e){}}})}
  var s=G.c.slots[i],m=MBY[s.m],p=puzzleOf(s),n=done()+1,md=modus(),sch=md==="school",act=(ageI()===0&&m.act0?m.act0:m.act)[inBuilding()?"in":"out"];cur={i:i,spot:spot||null};
  var head='<div class="eyebrow">'+esc(fill(T.task,{i:n,n:NN()}))+(spot?' · '+esc(spot.name):'')+'</div>'+eraPic(m)+'<div class="era" style="--c:#3a9be6"><span class="ico">'+m.ico+'</span><div><b>'+esc(m.title)+'</b><small>'+esc(m.dom)+'</small></div></div>'+
    bubble(introOf(m),sch?D.NOOR:D.TIK,"",sch?NOORAV:TIKAV)+
    '<div class="act"><span class="ico">🔍</span><div><b>Waarnemen</b><br>'+esc(act)+'</div></div>';
  sheet(head+'<div id="pz"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){G.force=null;closeSheet()};
  say(m.title+". "+introOf(m)+" Waarnemen: "+act);
  renderPuzzle(s,p,i)}
function hintBox(s,p){var used=!!G.hints[s.m];return '<div id="fb">'+(used?'<div class="fb hint">💡 '+esc(p.hint)+'</div>':'')+'</div><button type="button" class="btn ghost dk sm" id="bHint"'+(used?' disabled':'')+'>'+(used?T.hintUsed:T.hintBtn)+'</button>'}
function bindHint(s,p){var b=$("#bHint");if(!b)return;b.onclick=function(){G.hints[s.m]=1;save();b.disabled=true;b.textContent=T.hintUsed;$("#fb").innerHTML='<div class="fb hint">💡 '+esc(p.hint)+'</div>';say(p.hint)}}
function wrong(s,p){G.wrong++;save();beep(180,.2);buzz(120);var used=!!G.hints[s.m];$("#fb").innerHTML='<div class="fb no">'+esc(used?T.wrong:T.wrongHint)+'</div>'+(used?'<div class="fb hint">💡 '+esc(p.hint)+'</div>':'');var a=$("#ans");if(a)a.select()}
function renderPuzzle(s,p,i){var box=$("#pz"),h="";
  if(p.kind==="count"||p.kind==="word"){var obs=G.obs[s.m];
    if(obs==null){h='<p class="q">'+esc(p.pre)+'</p><input class="inp code" id="obs" autocomplete="off" '+(p.kind==="count"?'inputmode="numeric" maxlength="5" placeholder="0"':'autocapitalize="characters" maxlength="30" placeholder="…"')+'><button type="button" class="btn" id="bObs">'+T.countGo+'</button>'+hintBox(s,p);
      box.innerHTML=h;bindHint(s,p);var go=function(){var v=$("#obs").value.trim();if(p.kind==="count"){v=parseInt(v.replace(/\D/g,""),10);if(!(v>=0)||v>99999){toast("Typ een getal");return}}else{v=v.replace(/[^\w\s'’.-]/g,"").slice(0,30);if(v.replace(/[^a-z]/gi,"").length<2){toast("Typ het over");return}}
        G.obs[s.m]=v;save();renderPuzzle(s,p,i)};$("#bObs").onclick=go;$("#obs").onkeydown=function(e){if(e.key==="Enter")go()};$("#obs").focus();return}
    var der=p.fn(obs),dp={kind:der.kind||"text",q:der.q,a:der.a,c:der.c,hint:p.hint};
    h='<p class="note">'+esc(p.pre)+' <b>'+esc(obs)+'</b> <button type="button" class="lnk" id="bReObs">anders</button></p>';
    box.innerHTML=h+'<div id="pz2"></div>';$("#bReObs").onclick=function(){delete G.obs[s.m];save();renderPuzzle(s,p,i)};
    return renderQ(s,dp,$("#pz2"))}
  if(p.kind==="clock")return renderClock(s,p,box);
  renderQ(s,p,box)}
/* klok zonder cijfers: tijd uit de seed; niveau 0 hele uren (twee keuzes), 1 kwartieren, 2 per 5 minuten */
function clockTime(){var r=rngOf(G.seed^0xc10c),h=1+Math.floor(r()*12),lv=ageI(),m=lv===0?0:lv===1?[0,15,30,45][Math.floor(r()*4)]:5*Math.floor(r()*12);if(lv===2&&m===0)m=35;return{h:h,m:m}}
function drawClock(cv,h,m){var g=cv.getContext("2d"),W=cv.width,c=W/2,R=W*.44;g.clearRect(0,0,W,W);g.fillStyle="#fff";g.beginPath();g.arc(c,c,R,0,7);g.fill();g.lineWidth=W*.03;g.strokeStyle="#2b1f4a";g.stroke();
  for(var i=0;i<60;i++){var a=i/60*Math.PI*2,big=i%5===0;g.strokeStyle=big?"#2b1f4a":"#b9b0d6";g.lineWidth=big?W*.015:W*.006;g.beginPath();g.moveTo(c+Math.cos(a)*(R*.86),c+Math.sin(a)*(R*.86));g.lineTo(c+Math.cos(a)*(R*(big?.72:.8)),c+Math.sin(a)*(R*(big?.72:.8)));g.stroke()}
  var ah=((h%12)+m/60)/12*Math.PI*2-Math.PI/2,am=m/60*Math.PI*2-Math.PI/2;g.lineCap="round";
  g.strokeStyle="#2b1f4a";g.lineWidth=W*.04;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(ah)*R*.5,c+Math.sin(ah)*R*.5);g.stroke();
  g.strokeStyle="#e0584f";g.lineWidth=W*.025;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(am)*R*.72,c+Math.sin(am)*R*.72);g.stroke();
  g.fillStyle="#2b1f4a";g.beginPath();g.arc(c,c,W*.03,0,7);g.fill()}
function renderClock(s,p,box){var t=clockTime(),lv=ageI(),q=T.clockQ[lv],hh=String(t.h),mm=(t.m<10?"0":"")+t.m;
  var dp;if(lv===0){var other=(t.h+2+Math.floor(rngOf(G.seed^0x77)()*8))%12||12;dp={kind:"choice",q:q,c:[{e:"🕐",t:hh+" uur"},{e:"🕓",t:other+" uur"}],a:0,hint:p.hint};if(rngOf(G.seed^0x99)()<.5){dp.c.reverse();dp.a=1}}
  else dp={kind:"text",q:q,a:[hh+":"+mm,hh+mm,(t.h<10?"0":"")+hh+":"+mm,(t.h<10?"0":"")+hh+mm].concat(t.m===0?[hh,hh+"uur"]:[]),hint:p.hint};
  box.innerHTML='<div class="clockbox"><canvas id="clk" width="300" height="300"></canvas></div><div id="pz2"></div>';drawClock($("#clk"),t.h,t.m);renderQ(s,dp,$("#pz2"))}
function renderQ(s,p,box){var h='<p class="q">'+esc(p.q)+'</p>',ph=G.photos[s.m];
  if(p.kind==="text")h+='<p class="note">'+T.pzT+'</p><input class="inp code" id="ans" autocomplete="off" autocapitalize="characters" maxlength="14" placeholder="antwoord">'+hintBox(s,p)+'<button type="button" class="btn" id="bCheck">'+T.ok+'</button>';
  else if(p.kind==="choice"){var pic=typeof p.c[0]==="object";h+='<div class="choices'+(pic?' pics':'')+'" id="ch">'+p.c.map(function(c,k){return '<button type="button" data-i="'+k+'"'+(pic?' aria-label="'+esc(c.t)+'"':'')+'>'+(pic?'<span class="pe">'+c.e+'</span><span>'+esc(c.t)+'</span>':esc(c))+'</button>'}).join("")+'</div>'+hintBox(s,p)}
  else if(p.kind==="photo")h+='<div class="photo" id="ph">'+(ph?'<img src="'+ph+'" alt="">':'')+'<button type="button" class="btn sky" id="bPhoto">'+(ph?T.photoAgain:T.photoGo)+'</button>'+(ph?'<button type="button" class="btn" id="bPhotoOk">'+T.photoOk+'</button>':'')+'<p class="note">'+T.photoKeep+'</p></div>'+hintBox(s,p);
  box.innerHTML=h;bindHint(s,p);
  if(ageI()===0&&p.kind==="choice"&&VOICE)setTimeout(function(){if(box.isConnected)say(p.q+" "+p.c.map(function(c){return typeof c==="object"?c.t:c}).join(", of: ")+"?")},200);
  if(p.kind==="text"){var chk=function(){var v=norm($("#ans").value);if(!v)return;if(p.a.some(function(a){return norm(a)===v}))accept();else wrong(s,p)};$("#bCheck").onclick=chk;$("#ans").onkeydown=function(e){if(e.key==="Enter")chk()}}
  if(p.kind==="choice")$$("#ch button").forEach(function(b){b.onclick=function(){var k=+b.dataset.i;if(k===p.a){b.classList.add("ok");setTimeout(accept,350)}else{b.classList.add("no");b.disabled=true;wrong(s,p)}}});
  if(p.kind==="photo"){$("#bPhoto").onclick=function(){$("#file").value="";$("#file").click()};var ok=$("#bPhotoOk");if(ok)ok.onclick=accept}}
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];if(!f||!cur)return;var img=new Image(),url=URL.createObjectURL(f);img.onload=function(){var mx=800,sc=Math.min(1,mx/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);var s=G.c.slots[cur.i];G.photos[s.m]=c.toDataURL("image/jpeg",.6);URL.revokeObjectURL(url);save();renderQ(s,puzzleOf(s),$("#pz"));toast("Bewaard in het logboek")};img.src=url});
function accept(){var i=cur.i,s=G.c.slots[i],m=MBY[s.m];if(G.ph[i])return;G.ph[i]=1;G.order.push(i);if(cur.spot){cur.spot.done=true;cur.spot.doneAt=Date.now()}G.force=null;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;save();buzz([40,30,80]);beep(520,.15);setTimeout(function(){beep(780,.2)},130);
  var N=NN(),n=done(),last=n>=N,cliff=last?D.CLIFFLAST:D.CLIFF[(n-1+(G.seed%5))%D.CLIFF.length];
  sheet('<div class="eyebrow">'+esc(fill(T.clue,{n:n,t:N}))+'</div><div class="reward"><p>'+esc(T.keyGet)+'</p><div class="numkey"><span class="pe">'+s.key.e+'</span>'+esc(s.key.s)+'</div><p class="note">'+esc(m.title)+'</p><div class="tiles">'+tilesHTML()+'</div></div>'+
    '<div class="feit"><em>'+esc(T.tipH)+'</em><p>'+esc(feitOf(m))+'</p></div>'+
    bubble(cliff,D.TIK,"",TIKAV)+'<button type="button" class="btn" id="bNext">'+(last?T.finH:T.next)+'</button>',true);
  say(T.keyGet+" "+s.key.s+". "+T.tipH+": "+feitOf(m)+" "+cliff);
  $("#bNext").onclick=function(){save();closeSheet();sel=null;cur=null;if(G.mode==="map"||G.mode==="demo")chip();else render();if(last)toFinale()}}

/* ---------- logboek, menu ---------- */
function noteSheet(){var keys=[],ms=[];G.order.forEach(function(i){var sl=G.c.slots[i],m=MBY[sl.m];keys.push('<i>'+sl.key.e+' '+esc(sl.key.s)+'</i>');var o=G.obs[m.id];if(o!=null)ms.push('<li><b>'+esc(m.title)+'</b>: '+esc(o)+'</li>')});
  sheet('<h2>'+T.notebook+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+'<div class="eyebrow">'+esc(T.nbK)+'</div>'+(keys.length?'<div class="ltrbig">'+keys.join("")+'</div>':'<p class="note">'+T.nbNone+'</p>')+
    (ms.length?'<div class="eyebrow">'+esc(T.nbM)+'</div><ul class="ol">'+ms.join("")+'</ul>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');MW.bindCodeBox($("#sheetBody"),L);$("#shX").onclick=closeSheet}
function menuSheet(){var onMap=G&&G.mode==="map";sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button>'+(onMap?'<button type="button" class="btn ghost dk" id="mNoMap">'+T.kv.mNoMap+'</button>':'')+'<button type="button" class="btn ghost dk" id="mLead">'+T.mLead+'</button><button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mNoMap"){closeSheet();dropMap()}else if(i==="mLead")leadSheet();else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- finale: de tijdlijn ---------- */
function toFinale(){if(!G)return;if(done()<NN()){toast(fill(T.finNot,{n:NN()-done()}));return noteSheet()}if(G.sorted)return revealSheet();sortSheet()}
function sortSheet(){var ks=G.c.slots.map(function(sl){return sl.key}).sort(function(a,b){return a.v-b.v}),pool=shuffle(ks,rngOf(G.seed^0x5a5a)),pos=0,lv=ageI();
  sheet('<div class="eyebrow">'+esc(T.finH)+'</div><h2>'+esc(T.finH)+'</h2><p class="q">'+esc(lv===0?T.finT0:T.finT)+'</p><div class="line" id="line"></div><div class="pool" id="pool"></div><div id="fb"></div><button type="button" class="btn ghost dk sm" id="fHint">'+T.hintBtn+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=closeSheet;say(lv===0?T.finT0:T.finT);
  var paint=function(){$("#line").innerHTML=ks.map(function(k,j){return '<i class="'+(j<pos?"on":"")+'">'+(j<pos?k.e:"")+'</i>'}).join("");
    $("#pool").innerHTML=pool.map(function(k,j){var used=ks.indexOf(k)<pos;return '<button type="button" class="key num'+(used?" used":"")+'" data-k="'+j+'"'+(used?' disabled':'')+'><span class="pe">'+k.e+'</span><b>'+esc(k.s)+'</b></button>'}).join("")};paint();
  $("#pool").onclick=function(e){var b=e.target.closest("button");if(!b||b.disabled)return;var k=pool[+b.dataset.k];
    if(k===ks[pos]){pos++;beep(500+pos*40,.08);buzz(20);paint();if(pos>=ks.length){G.sorted=1;save();$("#fb").innerHTML='<div class="fb ok">'+esc(T.finOk)+'</div>';say(T.finOk);beep(660,.15);setTimeout(function(){beep(880,.15)},150);setTimeout(function(){beep(1320,.35)},300);buzz([60,40,60,40,240]);setTimeout(revealSheet,1200)}}
    else{pos=0;G.wrong++;save();b.classList.add("shake");buzz(140);beep(180,.25);$("#fb").innerHTML='<div class="fb no">'+esc(T.finBad)+'</div>';setTimeout(paint,350)}};
  $("#fHint").onclick=function(){G.hints.sort=1;save();this.disabled=true;$("#fb").innerHTML='<div class="fb hint">💡 '+esc(lv===0?T.finHint0:T.finHint)+' Volgende: '+ks[pos].e+' '+esc(ks[pos].s)+'.</div>';say(lv===0?T.finHint0:T.finHint)}}
function revealSheet(){G.tEnd=G.tEnd||Date.now();save();var md=modus();
  sheet('<div class="eyebrow">'+esc(T.won)+'</div><h2>Het gezoem is terug</h2>'+(ok("bijen")?'<img class="erapic" src="'+IMGROOT+'bijen.webp?v=1" alt="">':'')+'<div class="msg">'+(md==="bso"?TIKAV:NOORAV)+'<div class="bub"><em>Bij de bijenkast</em>'+revealOf(md)+'</div></div><button type="button" class="btn" id="bWin">'+T.next+'</button>',true);
  say(revealOf(md));$("#bWin").onclick=win}

/* ---------- gewonnen ---------- */
var RES=null;
function win(){var min=((G.tEnd||Date.now())-G.t0)/60000,nh=Object.keys(G.hints).length,stars=nh===0?3:nh<=2?2:1,xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:"De verdwenen bijen",code:G.code});
  Wk.stopWatch();buzz([100,50,100,50,300]);
  var eras=G.c.slots.map(function(s){return s.key}).sort(function(a,b){return a.v-b.v}),sp=[];Object.keys(G.obs).forEach(function(k){if(MBY[k])sp.push({t:MBY[k].title,v:G.obs[k]})});
  RES={code:G.code,stars:stars,min:Math.round(min),secs:Math.round(((G.tEnd||Date.now())-G.t0)/1000),team:NAME,wrong:G.wrong,hints:nh,age:ageI(),modus:modus(),N:NN(),eras:eras,spoor:sp,slots:G.c.slots.slice(),mode:G.mode,rooms:G.rooms,roomOrder:G.roomOrder,nocards:G.nocards,seed:G.seed};
  LS.set("ss_nt_last",RES);winBack()}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div><div class="stars">'+"★".repeat(r.stars)+"☆".repeat(3-r.stars)+'</div><h2>'+esc(r.team||"De Natuurspeurders")+'</h2>'+
    '<div class="tags"><i>'+r.min+' min</i><i>'+r.N+' tijdlekken</i><i>'+(r.hints?r.hints+" hint"+(r.hints>1?"s":""):"geen hints")+'</i>'+(r.spoor.length?'<i>'+r.spoor.length+' tellingen</i>':'')+'</div>'+(r.stars<3?'<p class="note">'+T.missed1+'</p>':'')+
    '<button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vLead">'+T.leadBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  $("#vDip").onclick=dipShow;$("#vLead").onclick=function(){leadSheet(winBack)};
  var txt=fill(T.shareTxt,{c:r.code,s:"★".repeat(r.stars),m:r.min})+location.origin+location.pathname+"#z="+r.code;
  $("#vShare").onclick=function(){if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
function endCase(){LS.del(GK);G=null;hush();home()}
function a4Sheet(title,note,fname,drawFn,back){sheet('<h2>'+esc(title)+'</h2><p class="note">'+esc(note)+'</p><canvas id="a4" width="1240" height="1754" class="a4"></canvas><button type="button" class="btn" id="a4Dl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="a4Pr">Printen</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  var cv=$("#a4");drawFn(cv);$("#a4Dl").onclick=function(){var a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download=fname+".png";document.body.appendChild(a);a.click();a.remove()};
  $("#a4Pr").onclick=function(){document.body.classList.add("printA4");window.print();setTimeout(function(){document.body.classList.remove("printA4")},500)};
  $("#shX").onclick=back||closeSheet;if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(cv.isConnected)drawFn(cv)})}
function dipShow(){a4Sheet(T.dipH,T.dipNote,"diploma-natuurspeurder",function(cv){drawDiploma(cv,RES)},winBack)}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function fitText(g,t,x,y,maxW,size,font){g.font=font.replace("{s}",size+"px");while(g.measureText(t).width>maxW&&size>16){size-=2;g.font=font.replace("{s}",size+"px")}g.fillText(t,x,y)}
function drawDiploma(cv,r){var g=cv.getContext("2d"),W2=cv.width,H=cv.height;
  g.fillStyle="#fffaf0";g.fillRect(0,0,W2,H);g.strokeStyle="#7a5cd6";g.lineWidth=22;g.strokeRect(40,40,W2-80,H-80);g.strokeStyle="#f5b800";g.lineWidth=5;g.strokeRect(74,74,W2-148,H-148);
  g.save();g.translate(W2/2,300);g.beginPath();g.arc(0,0,110,0,Math.PI*2);g.fillStyle="#fff";g.fill();g.lineWidth=10;g.strokeStyle="#2b1f4a";g.stroke();g.strokeStyle="#f5b800";g.lineWidth=5;g.setLineDash([8,12]);g.beginPath();g.arc(0,0,92,0,7);g.stroke();g.setLineDash([]);
  g.fillStyle="#2b1f4a";g.font="700 28px Fredoka,sans-serif";g.textAlign="center";g.textBaseline="middle";[["12",0,-72],["3",72,0],["6",0,72],["9",-72,0]].forEach(function(n){g.fillText(n[0],n[1],n[2])});g.textBaseline="alphabetic";
  g.strokeStyle="#7a5cd6";g.lineWidth=10;g.lineCap="round";g.beginPath();g.moveTo(0,0);g.lineTo(0,-64);g.stroke();g.strokeStyle="#e0584f";g.lineWidth=8;g.beginPath();g.moveTo(0,0);g.lineTo(48,24);g.stroke();g.fillStyle="#2b1f4a";g.beginPath();g.arc(0,0,9,0,7);g.fill();g.restore();
  g.textAlign="center";g.fillStyle="#7a5cd6";g.font="600 30px Fredoka,sans-serif";g.fillText("MINIMYSTERY EDUCATIE",W2/2,160);
  g.fillStyle="#2b1f4a";g.font="700 84px Fredoka,sans-serif";g.fillText("Diploma Natuurspeurder",W2/2,520);
  g.fillStyle="#39436a";g.font="500 34px Nunito,sans-serif";g.fillText("Dit diploma is voor",W2/2,600);
  g.fillStyle="#2b1f4a";fitText(g,r.team||"de natuurspeurders",W2/2,690,W2-260,74,"700 {s} Fredoka,sans-serif");
  g.fillStyle="#39436a";g.font="500 30px Nunito,sans-serif";g.fillText("die de bijen terughaalden: gekeken, geteld en geluisterd. De kringloop van de buurt:",W2/2,760);
  /* de kringloop */
  var n=r.eras.length,cols=Math.min(n,5),rows=Math.ceil(n/cols),bw=Math.min(200,(W2-160)/cols),y0=820;
  r.eras.forEach(function(k,j){var cx=W2/2-(cols*bw)/2+(j%cols)*bw+bw/2,cy=y0+Math.floor(j/cols)*150;g.fillStyle="#e6f6ea";rr(g,cx-bw/2+10,cy,bw-20,110,16);g.fill();g.strokeStyle="#2b1f4a";g.lineWidth=4;g.stroke();g.fillStyle="#2b1f4a";g.font="700 44px sans-serif";g.fillText(k.e,cx,cy+56);g.font="700 20px Fredoka,sans-serif";g.fillText(k.s,cx,cy+94)});
  var y0b=y0+rows*150;
  var yy=y0b+40;
  g.fillStyle="#39436a";g.font="500 30px Nunito,sans-serif";g.fillText("gespeurd in "+r.min+" minuten · "+r.N+" natuurstations · "+(r.hints?r.hints+" hint"+(r.hints>1?"s":""):"zonder hints")+(r.spoor.length?" · "+r.spoor.length+" echte tellingen":""),W2/2,yy);
  g.fillText(T.lvl[r.age]+" · "+(r.modus==="bso"?"BSO":"school")+" · zaak "+r.code,W2/2,yy+46);
  g.fillStyle="#f5b800";g.font="700 70px Fredoka,sans-serif";g.fillText("★".repeat(r.stars)+"☆".repeat(3-r.stars),W2/2,yy+140);
  var d=new Date();g.fillStyle="#39436a";g.font="500 30px Nunito,sans-serif";g.fillText(d.toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"}),W2/2,yy+200);
  g.fillStyle="#e0584f";g.font="400 50px 'Permanent Marker',cursive";g.save();g.translate(W2/2,yy+310);g.rotate(-.03);g.fillText("Juf Noor, meneer Tik en de bijen",0,0);g.restore();
  if(ok("diploma-stempel")){g.save();g.translate(W2-250,H-300);g.rotate(-.12);g.globalAlpha=.95;g.drawImage(IM["diploma-stempel"],-110,-110,220,220);g.restore()}
  g.fillStyle="#9aa3c0";g.font="500 24px Nunito,sans-serif";g.fillText("minimystery.nl/educatie",W2/2,H-120)}

/* ---------- begeleidersblad: verhaal, lesbrief, alle missies met antwoorden, plekkaartjes ---------- */
function answerOf(p){if(p.kind==="choice")return typeof p.c[p.a]==="object"?p.c[p.a].e+" "+p.c[p.a].t:p.c[p.a];if(p.kind==="text")return p.a[0];if(p.kind==="count"||p.kind==="word"){var ex=p.kind==="count"?7:"Kerkstraat",d=p.fn(ex);return "gaat verder met hun eigen telling. Voorbeeld bij "+ex+": \""+d.q+"\" → "+(d.c?(typeof d.c[d.a]==="object"?d.c[d.a].t:d.c[d.a]):d.a[0])}return "–"}
function leadSheet(back){if(typeof back!=="function")back=null;var src=G||LS.get("ss_nt_last",null);if(!src||!(src.c||src.slots)){toast("Start eerst een zaak; het blad hoort bij een zaakcode.");return}
  var slots=src.c?src.c.slots:src.slots,age=Math.max(0,Math.min(2,+(src.age||0))),md=src.modus||"school",code=src.code,gb=src.mode==="gebouw",ro=src.roomOrder||[],seed=src.seed,LES=D.LES[age];
    var rows=slots.map(function(s,i){var m=MBY[s.m],p=m.lvl[age],act=m.act[gb?"in":"out"],ans=answerOf(p);
    return '<li><b>'+esc(m.title)+'</b> <small>('+esc(m.dom)+(gb&&ro[i]!=null?" · "+esc(D.ROOMS[ro[i]])+(src.nocards?"":" · code "+roomCode(seed,ro[i])):G&&G.st&&G.st[i]&&G.mode==="map"?" · "+esc(G.st[i].name):"")+')</small><br><i>Waarnemen:</i> '+esc(act)+'<br><i>Vraag:</i> '+esc(p.kind==="count"||p.kind==="word"?p.pre+" → vervolgvraag":p.q)+'<br>Antwoord: <b>'+esc(ans)+'</b> · natuursleutel <b>'+s.key.e+' '+esc(s.key.s)+'</b><br><small>Hint: '+esc(p.hint)+' · Wist je dat: '+esc(m.tip[age])+'</small></li>'}).join("");
  var tl=slots.map(function(s){return s.key}).sort(function(a,b){return a.v-b.v}).map(function(k){return '<span class="chip">'+k.e+' '+esc(k.s)+'</span>'}).join(" → ");
  var cards="";if(gb&&!src.nocards){var seen={};ro.forEach(function(ri){if(seen[ri])return;seen[ri]=1;cards+='<div class="pcard"><em>'+esc(T.gbCardT)+' · De verdwenen bijen</em><b>'+esc(D.ROOMS[ri])+'</b><span class="pc">'+roomCode(seed,ri)+'</span><small>Typ deze code in het spel als je team hier is.</small></div>'})}
  var teams="";for(var t=1;t<=8;t++)teams+='<tr><td>'+T.leadTeam+' '+t+'</td><td></td><td></td></tr>';
  sheet('<div class="lead"><div class="eyebrow">'+esc(T.leadH)+' · '+esc(T.leadCode)+' '+esc(code)+'</div><h2>De verdwenen bijen</h2><p class="note">'+esc(T.leadT)+'</p><p class="note">'+esc(D.LEADNOTE)+'</p>'+
    '<div class="chips"><span class="chip">'+esc(T.lvl[age])+'</span><span class="chip">'+(md==="bso"?"BSO-modus":"Schoolmodus")+'</span><span class="chip">'+slots.length+' stations</span><span class="chip">'+(gb?"in het gebouw":"buiten")+'</span></div>'+
    '<h3>Lesbrief · vooraf (10 min)</h3><ol class="ol small">'+LES.intro.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ol><p class="small"><b>Leerdoelen:</b> '+esc(LES.doelen)+'</p>'+
    '<h3>De kringloop (de oplossing van de finale)</h3><div class="chips tl">'+tl+'</div>'+
    '<h3>Het verhaal (voorlezen)</h3><p class="small">'+fill(age===0?D.OPEN0[md]:D.OPEN[md],{N:T.nw[slots.length]||slots.length})+'</p>'+
    '<h3>De natuurstations, in de volgorde van het spel</h3><ol class="ol small">'+rows+'</ol>'+
    '<h3>Lesbrief · nabespreking (20 min)</h3><ol class="ol small">'+LES.na.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ol>'+
    '<h3>'+esc(T.leadTeams)+'</h3><table class="teams"><thead><tr><th>'+T.leadTeam+'</th><th>Teamnaam</th><th>'+T.leadDone+'</th></tr></thead><tbody>'+teams+'</tbody></table>'+
    (cards?'<h3 class="pbreak">'+esc(T.gbCards)+'</h3><p class="small noprint">Knip ze uit en hang ze op de plekken. De code hoort bij deze zaakcode.</p><div class="pcards">'+cards+'</div>':'')+'</div>'+
    '<button type="button" class="btn ghost dk noprint" id="ldPr">🖨 '+T.leadPrint+'</button><button type="button" class="btn ghost dk noprint" id="shX">'+T.close+'</button>',true);
  $("#ldPr").onclick=function(){document.body.classList.add("printLead");window.print();setTimeout(function(){document.body.classList.remove("printLead")},500)};
  $("#shX").onclick=back||closeSheet}

/* ---------- zaakcode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;var go=function(){var c=parseCode($("#dCode").value);if(!c){$("#dMsg").textContent=T.dBad;return}closeSheet();if(locked()&&c.mode!=="demo")return proSheet();
    PEND={age:c.age,modus:c.modus,rooms:c.rooms,nocards:c.nocards};AGE=c.age;MODUS=c.modus;LS.set("ss_nt_age",AGE);LS.set("ss_nt_modus",MODUS);begin(c.seed,c.mode,false,c.len)};
  $("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()};$("#dCode").focus()}
function archSheet(){var g=MW.profile.get().games.nt,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
  sheet('<h2>Opgeloste zaken</h2>'+(log.length?'<div class="list">'+log.map(function(r){return '<button type="button" class="sus" data-c="'+esc(r.c)+'"><b>'+esc(r.d)+' · '+st(r.st)+'</b><small>'+r.m+' min · zaak '+esc(r.c)+' · tik om dezelfde zaak nog eens te spelen</small></button>'}).join("")+'</div>':'<p class="note">Nog geen zaak opgelost op deze telefoon.</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();KM.leave();G=null;hush();home()}
function wipeGame(){Wk.stopWatch();KM.leave();LS.del(GK);G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);LS.del("ss_nt_last");MW.profile.wipe();closeSheet();home();toast(T.wiped)})}}
window.addEventListener("popstate",function(){if(!$("#sheet").hidden){closeSheet();history.pushState(null,"");return}if(!$("#brief").hidden){G=null;home();history.pushState(null,"");return}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);history.pushState(null,"")}});
history.pushState(null,"");

/* ---------- start ---------- */
if(/debug/.test(location.search))window.NT_DBG={G:function(){return G},M:MBY,puzzle:function(){var s=G.c.slots[cur.i];return puzzleOf(s)},cur:function(){return cur},roomCode:roomCode,parse:parseCode,clock:clockTime};
home();
var m=/[#&]z=([A-Za-z0-9]+)/.exec(location.hash);if(m)setTimeout(function(){codeSheet(m[1])},300);
})();
