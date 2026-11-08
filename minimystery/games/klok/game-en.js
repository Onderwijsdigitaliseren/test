/* Het mysterie van de verdwenen schoolklok – MiniMystery Educatie (school en BSO).
   Op de wandelmotor van MiniMystery (platform.js, walk.js, kidsmap.js, steps.js): kaart met gps, zonder kaart, of binnen.
   8, 10 of 12 plekken dicht bij elkaar (binnen ± 300 m). Op elke plek een korte educatieve zaak: kijken, tellen, lezen, nadenken.
   Zes zaken geven een letter (samen de plek: ZOLDER), de andere een cijfer voor het hangslot op de zolderdeur.
   Zaakcode KL…: dezelfde zaak op alle telefoons van een klas of BSO-groep. Begeleidersblad met alle antwoorden. Diploma als A4. */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.KL_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="kl",GK="ss_game_kl",WK="ss_ways_kl",hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz,beep=Wk.beep;function closeSheet(){hush();Wk.closeSheet()}
var G=null,tick=0,MODE=LS.get("ss_kl_mode","map"),NAME=LS.get("ss_kl_name",""),VOICE=LS.get("ss_kl_voice",true),AGE=String(LS.get("ss_kl_age","1")),MODUS=LS.get("ss_kl_modus","school");
var LEN=LS.get("ss_kl_len","normaal");if(!/^(kort|normaal|lang)$/.test(LEN))LEN="normaal";
var LENN={kort:8,normaal:10,lang:12},LENR={kort:260,normaal:300,lang:340},R0=300;
var W=[],P={x:0,y:0,acc:0},map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null;
var COL=["#f5b800","#3a9be6","#7a5cd6"],WORD=D.WORD;
var ZBY={};D.Z.forEach(function(z){ZBY[z.id]=z});
function RR(){return G&&G.R||R0}
function NN(){return G&&G.c&&G.c.slots?G.c.slots.length:LENN[LEN]}
function ageI(){return Math.max(0,Math.min(2,+(G&&G.age!=null?G.age:AGE)||0))}
function modus(){return (G&&G.modus)||MODUS}
function locked(){return !D.FREE&&MW.pro.locked(ID)}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9:,.]/g,"").replace(/^(de|het|een)(?=[a-z])/,"")}

/* ---------- stem ---------- */
function say(t){if(!VOICE||!t)return;t=String(t).replace(/<[^>]+>/g,"");if(window.MMVoice)return MMVoice.say(t);try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(t.replace(/[“”"]/g,"").replace(/\{[^}]+\}/g,""));u.lang="en-GB";u.rate=.92;u.pitch=1.05;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
function bubble(txt,who,cls,av){return '<div class="msg '+(cls||"")+'">'+(av||TIKAV)+'<div class="bub"><button type="button" class="spk" aria-label="'+esc(T.listen)+'" data-say="'+esc(txt.replace(/<[^>]+>/g,""))+'">🔊</button>'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+txt+'</p></div></div>'}
var TIKAV='<span class="avatar tik" aria-hidden="true">T</span>',NOORAV='<span class="avatar noor" aria-hidden="true">N</span>';
/* artwork van Kellie in games/klok/img wint waar het er is (zie games/klok/ARTWORK.md); anders getekende versies */
var IMGROOT=MW.root+"games/klok/img/",IM={};
["hero","noor","tik","briefje","onthulling","diploma-stempel"].concat(D.Z.map(function(z){return "st-"+z.id})).forEach(function(k){var im=new Image();im.src=IMGROOT+k+".webp?v=1";IM[k]=im;im.addEventListener("error",function(){im._bad=1})});
function ok(k){var im=IM[k];return !!(im&&im.complete&&im.naturalWidth)}
/* plaatje meteen tonen (ook als het nog laadt); mislukt het, dan verdwijnt het en blijft de tekening */
function okI(k){var im=IM[k];return !!im&&!im._bad}
function picTag(k,cls){return okI(k)?'<img class="'+cls+'" src="'+IMGROOT+k+'.webp?v=1" alt="" onerror="this.remove()">':''}
function imgOf(k){return picTag(k,"erapic")}
function avatarHTML(cls,letter,key){return '<span class="avatar '+cls+'" aria-hidden="true"'+(ok(key)?' style="background:#fff8ec url('+IMGROOT+key+'.webp?v=1) center 18%/150% auto no-repeat"':'')+'>'+(ok(key)?"":letter)+'</span>'}
function refreshAv(){TIKAV=avatarHTML("tik","T","tik");NOORAV=avatarHTML("noor","N","noor");if(ok("hero"))$("#home").classList.add("photo")}
Promise.all(Object.keys(IM).map(function(k){return new Promise(function(res){var im=IM[k];if(im.complete)return res();im.onload=im.onerror=function(){res()}})})).then(refreshAv);
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){hush();VOICE=true;say(b.dataset.say)}});

/* ---------- de zaak samenstellen: alleen uit de seed, zodat elke telefoon met dezelfde code dezelfde zaken krijgt ---------- */
function genCase(seed,N){var r=rngOf(seed),cats=["kijk","taal","verkeer","plek"],pools={};
  cats.forEach(function(c){pools[c]=shuffle(D.Z.filter(function(z){return z.cat===c}),r)});
  var ids=["foto"],ci=Math.floor(r()*4);
  while(ids.length<N){var c=cats[ci%4];ci++;var z=pools[c].shift();if(!z){if(!cats.some(function(k){return pools[k].length}))break;continue}ids.push(z.id)}
  ids=shuffle(ids,r);
  /* zes letterplekken, de rest cijfers */
  var idx=ids.map(function(_,i){return i}),lp=shuffle(idx,r).slice(0,6),letters=shuffle(WORD.split(""),r),li=0,digits=[],prev=0;
  var slots=ids.map(function(id,i){var s={z:id};if(lp.indexOf(i)>=0){s.letter=letters[li++]}else{var d=1+Math.floor(r()*9);if(d===prev)d=d%9+1;prev=d;s.digit=d;digits.push(d)}return s});
  return{slots:slots,digits:digits}}
function makeCode(seed,mode,len,age,modus){return"KL"+(len==="kort"?"V":len==="lang"?"L":"N")+(mode==="in"?"B":mode==="map"||mode==="demo"?"K":"S")+(+age+1)+(modus==="bso"?"B":"S")+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);var m=/^KL([VNL])([KSB])([123])([SB])([0-9A-Z]{1,8})$/.exec(c);if(!m)return null;var seed=parseInt(m[5],36);if(!(seed>=0)||seed>4294967295)return null;
  return{len:m[1]==="V"?"kort":m[1]==="L"?"lang":"normaal",mode:m[2]==="B"?"in":m[2]==="K"?"map":"street",age:String(+m[3]-1),modus:m[4]==="B"?"bso":"school",seed:seed}}
function fixG(g){if(!g||!g.c||!g.c.slots)return null;if(!g.R)g.R=LENR[g.len]||R0;if(!Array.isArray(g.ph))g.ph=[];if(!Array.isArray(g.order))g.order=[];if(!g.hints)g.hints={};if(!g.obs)g.obs={};return g}
function done(){return G.ph.filter(Boolean).length}
function letters(){var a=[];G.c.slots.forEach(function(s,i){if(G.ph[i]&&s.letter)a.push(s.letter)});return a}
function digitsGot(){var a=[];G.order.forEach(function(i){var s=G.c.slots[i];if(s.digit)a.push({d:s.digit,got:true})});G.c.slots.forEach(function(s,i){if(s.digit&&!G.ph[i])a.push({d:s.digit,got:false})});return a}
function digitSeq(){return G.order.map(function(i){return G.c.slots[i].digit}).filter(Boolean)}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get(),g=p.games.kl;
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
segClick("#len","m",function(v){MODE=v;LS.set("ss_kl_mode",MODE)});
segClick("#lvl","l",function(v){AGE=v;LS.set("ss_kl_age",AGE)});
segClick("#dur","n",function(v){LEN=v;LS.set("ss_kl_len",LEN)});
segClick("#route","r",function(v){MODUS=v;LS.set("ss_kl_modus",MODUS)});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_kl_name",NAME)});
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_kl_voice",VOICE);voiceBtn();toast(VOICE?T.voiceOn:T.voiceOff);if(VOICE)say(T.voiceOn);else hush()};
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#bGps").onclick=function(){if(locked())return proSheet();begin(hashStr("kl|"+MODE+"|"+MW.today()+"|"+LEN+"|"+AGE+"|"+MODUS),MODE,true,LEN)};
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

/* ---------- verhaalkaart (kidsmap.js): de buurt rond de school ---------- */
var KI=MW.KidsMap.icons,START={x:500,y:1290};
var FP=[{x:230,y:1040,k:"fiets"},{x:150,y:760,k:"halte"},{x:300,y:520,k:"speel"},{x:520,y:330,k:"plein2"},{x:760,y:420,k:"brug"},{x:860,y:700,k:"park"},{x:720,y:960,k:"kerk"},{x:500,y:760,k:"plein"},{x:150,y:300,k:"winkel"},{x:880,y:1060,k:"post"},{x:620,y:1130,k:"kiosk"},{x:380,y:900,k:"bank"}];
var ROADS=[[-1,0],[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,-1],[7,2],[7,5],[7,0],[7,6],[8,2],[8,1],[9,6],[9,5],[10,-1],[10,6],[11,7],[11,0]];
var TREES=[[80,1180],[120,320],[420,160],[640,180],[900,260],[950,900],[940,1180],[300,1300],[700,1300],[640,600],[90,520],[820,1050],[560,1120]];
var KM=MW.KidsMap.create({T:T.kv,go:function(s){walkTo={x:s.x,y:s.y};sel=null},G:function(){return G},P:function(){return P},dTo:function(s){return dTo(s)},virt:function(){return !!(G&&G.virt)},mode:function(){return G&&G.mode},
  map:{W:1000,H:1400,top:170,start:START,spots:FP,roads:ROADS,vsc:.42,sky:"#bfe0ff",land:"#b9e39b",road:"#e7e2d5",roadLine:"#fff",label:"#17203a",labelHalo:"rgba(255,255,255,.9)",heroHalo:"rgba(245,184,0,.3)"},
  draw:{mark:function(g,x,y,r,col){g.save();g.fillStyle=col;g.beginPath();g.ellipse(x,y,r*.9,r,0,0,7);g.fill();g.restore()},
    ground:function(g){g.fillStyle="#a8d98a";[[200,250,160],[760,900,200],[300,1150,140],[650,250,120]].forEach(function(e){g.beginPath();g.ellipse(e[0],e[1],e[2],e[2]*.5,0,0,7);g.fill()});
      g.strokeStyle="#6ec3ff";g.lineWidth=70;g.lineCap="round";g.lineJoin="round";g.beginPath();[[0,640],[120,690],[260,660],[420,700],[600,680],[800,720],[1000,690]].forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke()},
    decor:function(g){TREES.forEach(function(p,i){KI.tree(g,p[0],p[1],44+(i%3)*8)});[[60,1000,"#f4a261"],[900,200,"#cdb4db"],[420,1000,"#8ecae6"]].forEach(function(h){KI.house(g,h[0],h[1],56,h[2])})},
    start:function(g,x,y){KI.school(g,x,y,110);/* lege klokcirkel op de gevel */g.save();g.strokeStyle="#e0584f";g.lineWidth=4;g.setLineDash([6,6]);g.beginPath();g.arc(x,y-70,16,0,7);g.stroke();g.restore()},
    landmark:function(g,k,x,y,s){({fiets:function(){KI.sign(g,x,y,s,"#1b2550","🚲")},halte:function(){KI.sign(g,x,y,s,"#2563eb","B")},speel:function(){KI.swing(g,x,y,s)},plein2:function(){KI.lamp(g,x,y,s)},brug:function(){KI.bridge(g,x,y,s)},park:function(){KI.park(g,x,y,s)},kerk:function(){KI.church(g,x,y,s)},plein:function(){KI.fountain(g,x,y,s)},winkel:function(){KI.shop(g,x,y,s)},post:function(){KI.postbox(g,x,y,s)},kiosk:function(){KI.kiosk(g,x,y,s)},bank:function(){KI.bench(g,x,y,s)}}[k]||function(){})()},
    hero:function(g,x,y){g.save();g.fillStyle="#f5b800";g.strokeStyle="#1b2550";g.lineWidth=3;for(var i=-1;i<=1;i++){g.beginPath();g.arc(x+i*22,y-18,11,0,7);g.fill();g.stroke();g.fillStyle=["#3a9be6","#e0584f","#7a5cd6"][i+1];g.fillRect(x+i*22-9,y-6,18,16);g.fillStyle="#f5b800"}g.restore()}}});
KM.mount();
/* binnen: lopen op de plaats */
var St=MW.Steps,INK=LS.get("ss_kl_in",{kind:"sensor",spm:100});
function inSheet(cb){var sens=St&&St.supported(),IN=T.kv;
  sheet('<h2>'+esc(IN.inH)+'</h2><p>'+esc(IN.inT)+'</p>'+(sens?'<button type="button" class="btn" id="inS">'+esc(IN.inSensor)+'</button>':'')+'<button type="button" class="btn'+(sens?' ghost dk':'')+'" id="inT">'+esc(IN.inTempo)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;if(sens)$("#inS").onclick=function(){St.ask().then(function(ok){closeSheet();if(!ok)toast(IN.inNoSensor);cb(ok?"sensor":"tempo",100)})};$("#inT").onclick=function(){closeSheet();cb("tempo",100)}}
function stepIn(k){if(!G||G.mode!=="in")return;G.in.steps+=k;var t=KM.near();if(!t)return;var d=dTo(t),m=k*G.in.sl;if(d<=m){P.x=t.x;P.y=t.y;G.dist+=d}else{P.x+=(t.x-P.x)/d*m;P.y+=(t.y-P.y)/d*m;G.dist+=m}}
function startSteps(){if(!St||!G||G.mode!=="in")return;St.start({mode:G.in.kind,spm:G.in.spm,onStep:stepIn,active:function(){return !!G&&G.mode==="in"&&!$("#play").hidden&&$("#sheet").hidden},onDead:function(){if(!G||G.mode!=="in")return;G.in.kind="tempo";save();toast(T.kv.inNoSensor);startSteps()}});St.awake(true)}
function stopSteps(){if(St){St.stop();St.awake(false)}}
function buildVirt(seed,mode,origin,daily,len){build(seed,mode,null,null,origin,daily,len,true);if(G&&mode==="map")toast(T.kv.virtOut)}
function noMapSheet(seed,daily,why,len){sheet('<h2>'+T.kv.noMapQ+'</h2>'+(why?'<p class="note">'+esc(why)+'</p>':'')+'<p>'+esc(T.kv.noMapT)+'</p><button type="button" class="btn" id="nmGo">'+T.kv.noMapGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet;$("#nmGo").onclick=function(){closeSheet();MODE="street";LS.set("ss_kl_mode",MODE);build(seed,"street",null,null,null,daily,len)}}
function dropMap(){if(!G||G.mode==="street")return;Wk.stopWatch();KM.leave();stopSteps();G.virt=false;G.mode="street";G.i=0;while(G.ph[G.i])G.i++;G.st=null;save();show("cards");render();toast(T.kv.switched)}

/* ---------- een zaak beginnen ---------- */
var PEND=null; /* instellingen uit een zaakcode (leeftijd/modus) voor de volgende build */
function begin(seed,mode,daily,len){len=len||"normaal";if(mode==="in")return inSheet(function(kind,spm){INK={kind:kind,spm:spm};LS.set("ss_kl_in",INK);build(seed,"in",null,null,null,daily,len,true)});if(mode!=="map")return build(seed,mode,null,null,null,daily,len);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:LENR[len]||R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      if(!w.pois||!w.pois.length)return buildVirt(seed,"map",w.origin,daily,len);
      build(seed,"map",w.pois,w.ways,w.origin,daily,len);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})},function(){Wk.loading("");var kx=111320*Math.cos(lat*Math.PI/180);buildVirt(seed,"map",{lat:lat,lon:lon,kx:kx,ky:110540},daily,len)})
  }).catch(function(e){Wk.loading("");noMapSheet(seed,daily,e==="nogps"?T.noGps:T.denied,len)})}
function build(seed,mode,pois,ways,origin,daily,len,virt){len=LENN[len]?len:"normaal";var N=LENN[len],age=PEND?PEND.age:AGE,md=PEND?PEND.modus:MODUS;PEND=null;
  var c=genCase(seed,N);
  G={seed:seed,code:makeCode(seed,mode,len,age,md),mode:mode,age:age,modus:md,len:len,R:LENR[len],c:c,i:0,ph:[],order:[],hints:{},obs:{},t0:0,daily:!!daily,dist:0,origin:origin,px:0,py:0,st:null,photo:null,wrong:0};
  if(virt||mode==="in"){G.virt=true;G.st=KM.virtSpots(N).map(function(p,i){p.fi=i;p.done=false;return p});W=[];P={x:0,y:0,acc:0};LS.set(WK,W);if(mode==="in")G.in={kind:INK.kind,spm:INK.spm,steps:0,sl:KM.stepLen(G.st,900)}}
  else if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,G.R,N,r,T.corner);
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het) /,"")),fi:i,done:false}});
    for(var k=0;G.st.length<N&&k<N;k++){var a=r()*6.283,d=G.R*(.35+.5*r());G.st.push({x:Math.round(Math.cos(a)*d),y:Math.round(Math.sin(a)*d),type:"hoek",name:T.corner+" "+(G.st.length+1),fi:G.st.length,done:false})}
    W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  brief()}
function brief(){
  $("#bfNo").textContent=(G.mode==="demo"?T.demoCase:"");
  $("#bfOpen").innerHTML=imgOf("briefje")+bubble(fill(D.OPEN[modus()],{N:T.nw[NN()]||NN()}),D.TIK,"big")+
    '<div class="chips"><span class="chip">'+esc(T.lvl[ageI()])+'</span><span class="chip">'+(modus()==="bso"?"After-school mode":"School mode")+'</span><span class="chip">'+NN()+' places</span></div>';
  $("#bfTip").innerHTML=MW.codeBox(L,G.code,"zaak");MW.bindCodeBox($("#bfTip"),L);
  show("brief")}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode==="map"||G.mode==="street")MW.pro.setFree(ID)}save();hush();enter()};
$("#bBack").onclick=function(){G=null;hush();home()};
$("#bLead").onclick=leadSheet;
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}
function enter(){fixG(G);if(G.mode==="map"||G.mode==="demo"||G.mode==="in")enterMap();else{show("cards");render()}}

/* ---------- hud ---------- */
function tilesHTML(){var out="";G.c.slots.forEach(function(s,i){var got=!!G.ph[i];out+='<i class="tl'+(got?" on":"")+(s.digit?" dg":"")+'">'+(got?(s.letter||s.digit):"")+'</i>'});return out}
function hud(){if(!G)return;var n=done();$("#hT").textContent=mmss(Date.now()-G.t0);$("#hS").textContent=n+"/"+NN();$("#hM").innerHTML=tilesHTML()}
function render(){hud();while(G.i<NN()&&G.ph[G.i])G.i++;var i=G.i,box=$("#card"),N=NN();
  if(i>=N){box.innerHTML='<div class="pol done"><div class="big">🏫</div></div>'+bubble(T.radarAll,D.TIK)+'<button type="button" class="btn red" id="bAcc">'+T.finH+'</button>';$("#bAcc").onclick=toFinale;return}
  var s=G.c.slots[i],z=ZBY[s.z];
  box.innerHTML='<div class="pol empty"><div class="ph">'+catIcon(z.cat)+picTag("st-"+z.id,"phimg")+'</div><p class="cap">'+esc(fill(T.task,{i:i+1,n:N}))+' · '+esc(T.kinds[z.cat])+'</p></div>'+bubble((modus()==="bso"?"Walk together to a new place nearby. ":"Walk together to a new place nearby, for example a corner, a tree or a bench. ")+"The next case is there: <b>"+esc(z.title)+"</b>.",D.TIK)+'<button type="button" class="btn" id="bOpen">▶ '+T.start+'</button>';
  $("#bOpen").onclick=function(){taskSheet(i)}}
function catIcon(c){return {plek:"📍",kijk:"🔢",taal:"🔤",verkeer:"🚦",foto:"📷"}[c]||"🧩"}

/* ---------- spelen met kaart ---------- */
function enterMap(){show("play");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return RR()},
    theme:{bg:"#1b2550",water:"#2a62b8",waterEdge:"#6ec3ff",ripple:"rgba(110,195,255,.3)",park:"#2f8a4c",parkEdge:"#6fd38a",river:"#2a62b8",major:"#f5b800",minor:"#4f6ab8",road:"#9fb3e8",label:"#ffe08a",waterLabel:"#bfeaff",ring:"rgba(245,184,0,.35)",me:"#f5b800",meHalo:"rgba(245,184,0,.16)",meRing:"rgba(245,184,0,.7)",font:"700 12px 'Fredoka',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(RR());sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d;KM.moved(d)});
  KM.enter({kids:true,virt:!!G.virt,map:map});stopSteps();if(G.mode==="in")startSteps();
  if(G.mode==="demo")toast(T.demoTip);
  requestAnimationFrame(loop)}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[];
  it.push({x:P.x,y:P.y,tap:false,draw:function(cx,X,Y,t,api){if(api.still)return;cx.save();cx.fillStyle="rgba(245,184,0,.18)";cx.beginPath();cx.arc(X,Y,30+8*Math.sin(t/300),0,7);cx.fill();cx.restore()}});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/500+s.fi)*3,col=COL[s.fi%3];
    if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*22,0,7);cx.stroke();cx.globalAlpha=1}
    Wk.badge(cx,X,Y+bob*.3,"time",s.done?"#6b7fa8":col,1,s.done);
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
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel),z=ZBY[G.c.slots[sel.fi].z];
  $("#cName").textContent=sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=T.here+" · "+T.kinds[z.cat];
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))taskSheet(sel.fi,sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;taskSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mAcc").onclick=toFinale;$("#bNote").onclick=noteSheet;$("#bAcc2").onclick=toFinale;

/* ---------- een zaak: verhaal → (beweegopdracht) → vraag → letter of cijfer ---------- */
function puzzleOf(s){var z=ZBY[s.z],p=z.lvl[ageI()];return p}
function taskSheet(i,spot){walkTo=null;
  if(G.mode==="demo"&&!G.ph[i]&&done()>=(window.MMTrial?MMTrial.max:2)&&window.MMTrial&&locked()){var _GK=GK;return MMTrial.end({buy:proSheet,home:function(){leavePlay();try{localStorage.removeItem(_GK)}catch(e){}}})}
  var s=G.c.slots[i],z=ZBY[s.z],p=puzzleOf(s),n=done()+1,md=modus(),sch=md==="school";cur={i:i,spot:spot||null};
  var head='<div class="eyebrow">'+esc(fill(T.task,{i:n,n:NN()}))+' · '+esc(T.kinds[z.cat])+(spot?' · '+esc(spot.name):'')+'</div>'+imgOf("st-"+z.id)+'<h2>'+esc(z.title)+'</h2>'+
    (sch?'<div class="chips">'+z.goal.map(function(g){return '<span class="chip g">'+esc(g)+'</span>'}).join("")+'</div>':'')+
    bubble(z.story[md],sch?D.NOOR:D.TIK,"",sch?NOORAV:TIKAV)+
    (md==="bso"&&z.move?'<div class="act"><span class="ico">🏃</span><div><b>Do this first!</b><br>'+esc(z.move)+'</div></div>':'');
  sheet(head+'<div id="pz"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){G.force=null;closeSheet()};
  say(z.story[md]+(md==="bso"&&z.move?" "+z.move:""));
  renderPuzzle(s,p,i)}
function hintBox(s,p){var used=!!G.hints[s.z];return '<div id="fb">'+(used?'<div class="fb hint">💡 '+esc(p.hint)+'</div>':'')+'</div><button type="button" class="btn ghost dk sm" id="bHint"'+(used?' disabled':'')+'>'+(used?T.hintUsed:T.hintBtn)+'</button>'}
function bindHint(s,p){var b=$("#bHint");if(!b)return;b.onclick=function(){G.hints[s.z]=1;save();b.disabled=true;b.textContent=T.hintUsed;$("#fb").innerHTML='<div class="fb hint">💡 '+esc(p.hint)+'</div>';say(p.hint)}}
function wrong(s,p){G.wrong++;save();beep(180,.2);buzz(120);var used=!!G.hints[s.z];$("#fb").innerHTML='<div class="fb no">'+esc(used?T.wrong:T.wrongHint)+'</div>'+(used?'<div class="fb hint">💡 '+esc(p.hint)+'</div>':'');var a=$("#ans");if(a)a.select()}
function renderPuzzle(s,p,i){var box=$("#pz"),h="";
  if(p.kind==="count"||p.kind==="word"){var obs=G.obs[s.z];
    if(obs==null){h='<p class="q">'+esc(p.pre)+'</p><input class="inp code" id="obs" autocomplete="off" '+(p.kind==="count"?'inputmode="numeric" maxlength="4" placeholder="0"':'autocapitalize="characters" maxlength="30" placeholder="…"')+'><button type="button" class="btn" id="bObs">'+T.countGo+'</button>'+hintBox(s,p);
      box.innerHTML=h;bindHint(s,p);var go=function(){var v=$("#obs").value.trim();if(p.kind==="count"){v=parseInt(v.replace(/\D/g,""),10);if(!(v>=0)||v>999){toast("Type a number");return}}else{v=v.replace(/[^\w\s'’.-]/g,"").slice(0,30);if(v.replace(/[^a-z]/gi,"").length<2){toast("Copy the name");return}}
        G.obs[s.z]=v;save();renderPuzzle(s,p,i)};$("#bObs").onclick=go;$("#obs").onkeydown=function(e){if(e.key==="Enter")go()};$("#obs").focus();return}
    var der=p.fn(obs),dp={kind:der.kind||"text",q:der.q,a:der.a,c:der.c,hint:p.hint};
    h='<p class="note">'+esc(p.pre)+' <b>'+esc(obs)+'</b> <button type="button" class="lnk" id="bReObs">change</button></p>';
    box.innerHTML=h+'<div id="pz2"></div>';$("#bReObs").onclick=function(){delete G.obs[s.z];save();renderPuzzle(s,p,i)};
    return renderQ(s,dp,$("#pz2"))}
  renderQ(s,p,box)}
function renderQ(s,p,box){var h='<p class="q">'+esc(p.q)+'</p>';
  if(p.kind==="text")h+='<p class="note">'+T.pzT+'</p><input class="inp code" id="ans" autocomplete="off" autocapitalize="characters" maxlength="14" placeholder="antwoord">'+hintBox(s,p)+'<button type="button" class="btn" id="bCheck">'+T.ok+'</button>';
  else if(p.kind==="choice")h+='<div class="choices" id="ch">'+p.c.map(function(c,k){return '<button type="button" data-i="'+k+'">'+esc(c)+'</button>'}).join("")+'</div>'+hintBox(s,p);
  else if(p.kind==="photo")h+='<div class="photo" id="ph">'+(G.photo?'<img src="'+G.photo+'" alt="">':'')+'<button type="button" class="btn sky" id="bPhoto">'+(G.photo?T.photoAgain:T.photoGo)+'</button>'+(G.photo?'<button type="button" class="btn" id="bPhotoOk">'+T.photoOk+'</button>':'')+'<p class="note">'+T.photoKeep+'</p></div>'+hintBox(s,p);
  box.innerHTML=h;bindHint(s,p);
  if(p.kind==="text"){var chk=function(){var v=norm($("#ans").value);if(!v)return;if(p.a.some(function(a){return norm(a)===v}))accept();else wrong(s,p)};$("#bCheck").onclick=chk;$("#ans").onkeydown=function(e){if(e.key==="Enter")chk()};$("#ans").focus()}
  if(p.kind==="choice")$$("#ch button").forEach(function(b){b.onclick=function(){var k=+b.dataset.i;if(k===p.a){b.classList.add("ok");setTimeout(accept,350)}else{b.classList.add("no");b.disabled=true;wrong(s,p)}}});
  if(p.kind==="photo"){$("#bPhoto").onclick=function(){$("#file").value="";$("#file").click()};var ok=$("#bPhotoOk");if(ok)ok.onclick=accept}}
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];if(!f||!cur)return;var img=new Image(),url=URL.createObjectURL(f);img.onload=function(){var mx=900,sc=Math.min(1,mx/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);G.photo=c.toDataURL("image/jpeg",.7);URL.revokeObjectURL(url);save();var s=G.c.slots[cur.i];renderQ(s,puzzleOf(s),$("#pz"));toast("Lovely clock!")};img.src=url});
function accept(){var i=cur.i,s=G.c.slots[i],z=ZBY[s.z];if(G.ph[i])return;G.ph[i]=1;G.order.push(i);if(cur.spot){cur.spot.done=true;cur.spot.doneAt=Date.now()}G.force=null;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;save();buzz([40,30,80]);beep(520,.15);setTimeout(function(){beep(780,.2)},130);
  var N=NN(),n=done(),last=n>=N,cliff=last?D.CLIFFLAST:D.CLIFF[(n-1+(G.seed%5))%D.CLIFF.length];
  sheet('<div class="eyebrow">'+esc(fill(T.clue,{n:n,t:N}))+'</div><div class="reward"><div class="big">🎉</div><p>'+esc(s.letter?T.letterGet:T.digitGet)+'</p><div class="ltr'+(s.digit?" dg":"")+'">'+(s.letter||s.digit)+'</div><div class="tiles">'+tilesHTML()+'</div></div>'+
    bubble(cliff,D.TIK)+'<button type="button" class="btn" id="bNext">'+(last?T.finH:T.next)+'</button>',true);
  say((s.letter?T.letterGet+" "+s.letter:T.digitGet+" "+s.digit)+". "+cliff);
  $("#bNext").onclick=function(){closeSheet();sel=null;cur=null;if(G.mode==="map"||G.mode==="demo")chip();else render();if(last)toFinale()}}

/* ---------- speurboekje, menu ---------- */
function noteSheet(){var ls=letters(),dg=digitsGot(),solved=[];G.c.slots.forEach(function(s,i){if(G.ph[i])solved.push('<li>'+esc(ZBY[s.z].title)+' <small>'+esc(T.kinds[ZBY[s.z].cat])+'</small> → <b>'+(s.letter||s.digit)+'</b></li>')});
  sheet('<h2>'+T.notebook+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+'<div class="eyebrow">'+esc(T.nbL)+'</div><div class="ltrbig">'+(ls.length?ls.map(function(c){return "<i>"+c+"</i>"}).join(""):'<p class="note">–</p>')+'</div>'+
    (dg.length?'<div class="eyebrow">'+esc(T.nbC)+'</div><div class="ltrbig">'+dg.map(function(x){return '<i class="dg'+(x.got?"":" no")+'">'+(x.got?x.d:"?")+'</i>'}).join("")+'</div>':'')+
    '<div class="eyebrow">'+esc(T.nbZ)+'</div>'+(solved.length?'<ol class="ol">'+solved.join("")+'</ol>':'<p class="note">'+T.nbNone+'</p>')+
    '<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');MW.bindCodeBox($("#sheetBody"),L);$("#shX").onclick=closeSheet}
function menuSheet(){var onMap=G&&(G.mode==="map"||G.mode==="in");sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button>'+(onMap?'<button type="button" class="btn ghost dk" id="mNoMap">'+T.kv.mNoMap+'</button>':'')+'<button type="button" class="btn ghost dk" id="mLead">'+T.mLead+'</button><button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mNoMap"){closeSheet();dropMap()}else if(i==="mLead")leadSheet();else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- finale: het woord, het hangslot, de onthulling ---------- */
function toFinale(){if(!G)return;if(done()<NN()){toast(fill(T.finNot,{n:NN()-done()}));return noteSheet()}if(G.word)return lockSheet();wordSheet()}
function wordSheet(){var ls=letters();if(!G.shuf){var r=rngOf(G.seed^0x5a5a);G.shuf=shuffle(ls,r).join("");if(G.shuf===WORD)G.shuf=ls.slice(1).concat(ls[0]).join("");save()}
  sheet('<div class="eyebrow">'+esc(T.finH)+'</div><h2>'+esc(T.finH)+'</h2><div class="ltrbig">'+G.shuf.split("").map(function(c){return "<i>"+c+"</i>"}).join("")+'</div><p class="q">'+esc(T.finT)+'</p><input class="inp code" id="fIn" maxlength="12" autocomplete="off" autocapitalize="characters" placeholder="??????"><div id="fb"></div><button type="button" class="btn" id="bFin">'+T.finGo+'</button><button type="button" class="btn ghost dk sm" id="fHint">'+T.hintBtn+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=closeSheet;say(T.finT);
  var chk=function(){var v=norm($("#fIn").value);if(v===WORD.toLowerCase()){G.word=1;save();beep(660,.15);setTimeout(function(){beep(990,.2)},130);lockSheet()}else{G.wrong++;save();beep(180,.2);$("#fb").innerHTML='<div class="fb no">'+esc(T.finBad)+'</div>';$("#fIn").select()}};
  $("#bFin").onclick=chk;$("#fIn").onkeydown=function(e){if(e.key==="Enter")chk()};$("#fHint").onclick=function(){G.hints.word=1;save();this.disabled=true;$("#fb").innerHTML='<div class="fb hint">💡 '+esc(T.finHint)+'</div>';say(T.finHint)}}
function lockSheet(){var dg=digitSeq(),N=dg.length;if(!N||G.lock){return revealSheet()}var pos=0,fin=false;
  sheet('<div class="eyebrow">🔒 '+esc(T.lockH)+'</div><h2>'+esc(WORD)+'</h2><p class="q">'+esc(T.lockT)+'</p><div class="vdisp" id="vDisp"></div><div class="vpad" id="vPad">'+[1,2,3,4,5,6,7,8,9].map(function(d){return '<button type="button" data-d="'+d+'">'+d+'</button>'}).join("")+'</div><p class="note" style="text-align:center">The digits are in the notebook, in the order you found them.</p><p class="pzst" id="vMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  var paint=function(){var s="";for(var j=0;j<N;j++)s+='<i class="'+(j<pos?"on":"")+'">'+(j<pos?dg[j]:"")+'</i>';$("#vDisp").innerHTML=s};paint();say(T.lockT);
  $("#vPad").onclick=function(e){var b=e.target.closest("button");if(!b||fin)return;var d=+b.dataset.d;
    if(d===dg[pos]){pos++;beep(500+pos*40,.08);buzz(20);paint();if(pos>=N){fin=true;G.lock=1;save();$("#vMsg").textContent=T.lockOk;beep(660,.15);setTimeout(function(){beep(880,.15)},150);setTimeout(function(){beep(1320,.35)},300);buzz([60,40,60,40,240]);setTimeout(revealSheet,900)}}
    else{pos=0;G.wrong++;save();buzz(140);beep(180,.25);$("#vMsg").textContent=T.lockBad;paint()}};
  $("#shX").onclick=closeSheet}
function revealSheet(){G.tEnd=G.tEnd||Date.now();save();var md=modus();
  sheet('<div class="eyebrow">'+esc(T.won)+'</div><h2>The clock is found</h2>'+imgOf("onthulling")+'<div class="msg">'+(md==="bso"?TIKAV:NOORAV)+'<div class="bub"><em>In the cellar</em>'+D.REVEAL[md]+'</div></div><button type="button" class="btn" id="bWin">'+T.next+'</button>',true);
  say(D.REVEAL[md]);$("#bWin").onclick=win}

/* ---------- gewonnen ---------- */
var RES=null;
function win(){var min=((G.tEnd||Date.now())-G.t0)/60000,nh=Object.keys(G.hints).length,stars=nh===0?3:nh<=2?2:1,xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:"The Missing School Clock",code:G.code});
  Wk.stopWatch();buzz([100,50,100,50,300]);
  RES={code:G.code,stars:stars,min:Math.round(min),secs:Math.round(((G.tEnd||Date.now())-G.t0)/1000),team:NAME,photo:G.photo,wrong:G.wrong,hints:nh,age:ageI(),modus:modus(),N:NN(),slots:G.c.slots.slice(),digits:G.c.digits.slice()};
  LS.set("ss_kl_last",{code:RES.code,stars:stars,min:RES.min,team:NAME,secs:RES.secs,N:RES.N,age:RES.age,modus:RES.modus,slots:RES.slots,digits:RES.digits});
  winBack()}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div><div class="stars">'+"★".repeat(r.stars)+"☆".repeat(3-r.stars)+'</div><h2>'+esc(r.team||"Detective team")+'</h2>'+
    '<div class="tags"><i>'+r.min+' min</i><i>'+r.N+' cases</i><i>'+(r.hints?r.hints+" hint"+(r.hints>1?"s":""):"no hints")+'</i></div>'+(r.stars<3?'<p class="note">'+T.missed1+'</p>':'')+
    '<button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vLead">'+T.leadBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  $("#vDip").onclick=dipShow;$("#vLead").onclick=function(){leadSheet(winBack)};
  var txt=fill(T.shareTxt,{c:r.code,s:"★".repeat(r.stars),m:r.min})+location.origin+location.pathname+"#z="+r.code;
  $("#vShare").onclick=function(){if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
function endCase(){LS.del(GK);G=null;hush();home()}
/* A4 */
function a4Sheet(title,note,fname,drawFn,back){sheet('<h2>'+esc(title)+'</h2><p class="note">'+esc(note)+'</p><canvas id="a4" width="1240" height="1754" class="a4"></canvas><button type="button" class="btn" id="a4Dl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="a4Pr">Print</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  var cv=$("#a4");drawFn(cv);$("#a4Dl").onclick=function(){var a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download=fname+".png";document.body.appendChild(a);a.click();a.remove()};
  $("#a4Pr").onclick=function(){document.body.classList.add("printA4");window.print();setTimeout(function(){document.body.classList.remove("printA4")},500)};
  $("#shX").onclick=back||closeSheet;if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(cv.isConnected)drawFn(cv)})}
function dipShow(){a4Sheet(T.dipH,T.dipNote,"diploma-schoolklok",function(cv){drawDiploma(cv,RES)},winBack)}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function fitText(g,t,x,y,maxW,size,font){g.font=font.replace("{s}",size+"px");while(g.measureText(t).width>maxW&&size>16){size-=2;g.font=font.replace("{s}",size+"px")}g.fillText(t,x,y)}
function drawDiploma(cv,r){var g=cv.getContext("2d"),W2=cv.width,H=cv.height;
  g.fillStyle="#fffaf0";g.fillRect(0,0,W2,H);g.strokeStyle="#f5b800";g.lineWidth=22;g.strokeRect(40,40,W2-80,H-80);g.strokeStyle="#1b2550";g.lineWidth=4;g.strokeRect(74,74,W2-148,H-148);
  g.save();g.translate(W2/2,330);g.beginPath();g.arc(0,0,120,0,Math.PI*2);g.fillStyle="#fff";g.fill();g.lineWidth=10;g.strokeStyle="#1b2550";g.stroke();g.strokeStyle="#f5b800";g.lineWidth=5;g.setLineDash([8,12]);g.beginPath();g.arc(0,0,100,0,7);g.stroke();g.setLineDash([]);
  g.fillStyle="#1b2550";g.font="700 30px Fredoka,sans-serif";g.textAlign="center";g.textBaseline="middle";[["12",0,-78],["3",78,0],["6",0,78],["9",-78,0]].forEach(function(n){g.fillText(n[0],n[1],n[2])});g.textBaseline="alphabetic";
  g.strokeStyle="#22327a";g.lineWidth=10;g.lineCap="round";g.beginPath();g.moveTo(0,0);g.lineTo(0,-70);g.stroke();g.strokeStyle="#e0584f";g.lineWidth=8;g.beginPath();g.moveTo(0,0);g.lineTo(52,26);g.stroke();g.fillStyle="#1b2550";g.beginPath();g.arc(0,0,9,0,7);g.fill();g.restore();
  g.textAlign="center";g.fillStyle="#7a5cd6";g.font="600 30px Fredoka,sans-serif";g.fillText("MINIMYSTERY EDUCATION",W2/2,170);
  g.fillStyle="#22327a";g.font="700 84px Fredoka,sans-serif";g.fillText("Detective Team Certificate",W2/2,560);
  g.fillStyle="#39436a";g.font="500 34px Nunito,sans-serif";g.fillText("This certificate is awarded to",W2/2,650);
  g.fillStyle="#1b2550";fitText(g,r.team||"the detective team",W2/2,740,W2-260,74,"700 {s} Fredoka,sans-serif");
  g.fillStyle="#1b2550";g.font="700 40px Fredoka,sans-serif";g.fillText("The Mystery of the Missing School Clock",W2/2,860);
  g.fillStyle="#39436a";g.font="500 32px Nunito,sans-serif";g.fillText("solved in "+r.min+" minutes · "+r.N+" cases · "+(r.hints?r.hints+" hint"+(r.hints>1?"s":""):"no hints"),W2/2,920);
  g.fillText("level "+T.lvl[r.age]+" · "+(r.modus==="bso"?"after-school":"school")+" · case "+r.code,W2/2,970);
  g.fillStyle="#f5b800";g.font="700 70px Fredoka,sans-serif";g.fillText("★".repeat(r.stars)+"☆".repeat(3-r.stars),W2/2,1070);
  var d=new Date();g.fillStyle="#39436a";g.font="500 30px Nunito,sans-serif";g.fillText(d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}),W2/2,1140);
  g.fillStyle="#e0584f";g.font="400 52px 'Permanent Marker',cursive";g.save();g.translate(W2/2,1300);g.rotate(-.03);g.fillText(r.modus==="bso"?"Mr Tik, caretaker":"Miss Noor and Mr Tik",0,0);g.restore();
  var x=W2/2-6*44;for(var i=0;i<6;i++){g.fillStyle="#f5b800";rr(g,x+i*88,1400,70,70,12);g.fill();g.strokeStyle="#1b2550";g.lineWidth=3;g.stroke();g.fillStyle="#1b2550";g.font="700 46px Fredoka,sans-serif";g.fillText(WORD[i],x+i*88+35,1452)}
  if(ok("diploma-stempel")){g.save();g.translate(W2-235,295);g.rotate(.14);g.globalAlpha=.95;g.drawImage(IM["diploma-stempel"],-110,-110,220,220);g.restore()}
  g.fillStyle="#9aa3c0";g.font="500 24px Nunito,sans-serif";g.fillText("minimystery.nl/en/education",W2/2,H-120)}

/* ---------- begeleidersblad: alle zaken van déze zaakcode, met antwoorden ---------- */
function answerOf(p){if(p.kind==="choice")return p.c[p.a];if(p.kind==="text")return p.a[0].toUpperCase();if(p.kind==="photo")return "take the photo";
  if(p.kind==="count"||p.kind==="word"){var ex=p.kind==="count"?7:"Kerkstraat",d=p.fn(ex);return "depends on what they enter. Example for "+ex+": "+(d.kind==="choice"||d.c?d.c[d.a]:d.a[0])}return "–"}
function leadSheet(back){if(typeof back!=="function")back=null;var src=G||LS.get("ss_kl_last",null);if(!src||!(src.c||src.slots)){toast("Start a case first; the sheet belongs to a case code.");return}
  var slots=src.c?src.c.slots:src.slots,digits=src.c?src.c.digits:src.digits,age=Math.max(0,Math.min(2,+(src.age||0))),md=src.modus||"school",code=src.code;
  var rows=slots.map(function(s,i){var z=ZBY[s.z],p=z.lvl[age],q=p.kind==="count"||p.kind==="word"?p.pre+" → follow-up question with their number/word":p.q;
    return '<li><b>'+esc(z.title)+'</b> <small>('+esc(T.kinds[z.cat])+(G&&G.st&&G.st[i]&&G.mode!=="street"?" · "+esc(G.st[i].name):"")+')</small><br>'+esc(q)+'<br>Answer: <b>'+esc(answerOf(p))+'</b> · '+(s.letter?'letter <b>'+s.letter+'</b>':'digit <b>'+s.digit+'</b>')+'<br><small>Hint: '+esc(p.hint)+'</small></li>'}).join("");
  var teams="";for(var t=1;t<=8;t++)teams+='<tr><td>'+T.leadTeam+' '+t+'</td><td></td><td></td></tr>';
  sheet('<div class="lead"><div class="eyebrow">'+esc(T.leadH)+' · '+esc(T.leadCode)+' '+esc(code)+'</div><h2>The Mystery of the Missing School Clock</h2><p class="note">'+esc(T.leadT)+'</p><p class="note">'+esc(D.LEADNOTE)+'</p>'+
    '<div class="chips"><span class="chip">'+esc(T.lvl[age])+'</span><span class="chip">'+(md==="bso"?"After-school mode":"School mode")+'</span><span class="chip">'+slots.length+' cases</span></div>'+
    '<h3>The story (read aloud)</h3><p class="small">'+fill(D.OPEN[md],{N:T.nw[slots.length]||slots.length})+'</p>'+
    '<h3>The cases, in order</h3><ol class="ol small">'+rows+'</ol>'+
    '<h3>The solution</h3><p class="small">The place: <b>'+WORD+'</b>.'+(digits.length?' The padlock: the digits <b>'+digits.join(", ")+'</b>, to be keyed in in the order the team found them (shown in their notebook; without a map that is the order of the cases above).':'')+' Then the reveal: '+(md==="bso"?"Mr Tik":"Miss Noor Timmers and Mr Tik")+' took the clock down to the cellar to paint a new clock face on it with all the children.</p>'+
    '<h3>'+esc(T.leadTeams)+'</h3><table class="teams"><thead><tr><th>'+T.leadTeam+'</th><th>Team name</th><th>'+T.leadDone+'</th></tr></thead><tbody>'+teams+'</tbody></table></div>'+
    '<button type="button" class="btn ghost dk noprint" id="ldPr">🖨 '+T.leadPrint+'</button><button type="button" class="btn ghost dk noprint" id="shX">'+T.close+'</button>',true);
  $("#ldPr").onclick=function(){document.body.classList.add("printLead");window.print();setTimeout(function(){document.body.classList.remove("printLead")},500)};
  $("#shX").onclick=back||closeSheet}

/* ---------- zaakcode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;var go=function(){var c=parseCode($("#dCode").value);if(!c){$("#dMsg").textContent=T.dBad;return}closeSheet();if(locked()&&c.mode!=="demo")return proSheet();
    PEND={age:c.age,modus:c.modus};AGE=c.age;MODUS=c.modus;LS.set("ss_kl_age",AGE);LS.set("ss_kl_modus",MODUS);begin(c.seed,c.mode,false,c.len)};
  $("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()};$("#dCode").focus()}
function archSheet(){var g=MW.profile.get().games.kl,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
  sheet('<h2>Solved cases</h2>'+(log.length?'<div class="list">'+log.map(function(r){return '<button type="button" class="sus" data-c="'+esc(r.c)+'"><b>'+esc(r.d)+' · '+st(r.st)+'</b><small>'+r.m+' min · case '+esc(r.c)+' · tap to play the same case again</small></button>'}).join("")+'</div>':'<p class="note">No case solved on this phone yet.</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();KM.leave();stopSteps();G=null;hush();home()}
function wipeGame(){Wk.stopWatch();KM.leave();stopSteps();LS.del(GK);G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);LS.del("ss_kl_last");MW.profile.wipe();closeSheet();home();toast(T.wiped)})}}
/* terugknop van de telefoon */
window.addEventListener("popstate",function(){if(!$("#sheet").hidden){closeSheet();history.pushState(null,"");return}if(!$("#brief").hidden){G=null;home();history.pushState(null,"");return}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);history.pushState(null,"")}});
history.pushState(null,"");

(function(){var lb=$("#lang");if(lb)lb.onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")}})();
/* ---------- start ---------- */
if(/debug/.test(location.search))window.KL_DBG={G:function(){return G},Z:ZBY,accept:function(){accept()},puzzle:function(){var s=G.c.slots[cur.i];return puzzleOf(s)},cur:function(){return cur}};
home();
var m=/[#&]z=([A-Za-z0-9]+)/.exec(location.hash);if(m)setTimeout(function(){codeSheet(m[1])},300);
})();
