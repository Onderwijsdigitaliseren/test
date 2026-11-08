/* Operatie Pakjesavond – MiniMystery (6–10 jaar, pakjesavond). Op de wandelmotor van MiniMystery (platform.js, walk.js, kidsmap.js).
   Piet Pepernoot is zijn verstopkaart kwijt: hij is in 6, 8 of 10 stukken gewaaid. Buiten (met of zonder kaart) ligt op elke plek in de
   buurt een stukje; binnen ligt in elke kamer een stukje. Elk stukje verdien je met een Pietenproef (veertien soorten, twee niveaus).
   Alle stukjes samen: de kaart wordt omgedraaid en Piet leest de laatste aanwijzing voor. Die komt uit de Ouderhoek: de ouders vullen
   vooraf (achter een pincode) in waar de echte pakjes liggen, met een raadsel, de precieze plek en een foto. Zaakcode PA…, diploma A4. */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.PA_DATA,T=D.T,X=D.X,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="pa",GK="ss_game_pa",WK="ss_ways_pa",PK="ss_pa_parent",hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz,beep=Wk.beep;function closeSheet(){mg.stop();hush();Wk.closeSheet()}
var G=null,tick=0,MODE=LS.get("ss_pa_mode","in"),NAME=LS.get("ss_pa_name",""),VOICE=LS.get("ss_pa_voice",true),LVL=String(LS.get("ss_pa_lvl","0"));
var LEN=LS.get("ss_pa_len","normaal");if(!/^(kort|normaal|lang)$/.test(LEN))LEN="normaal";if(LVL!=="0"&&LVL!=="1")LVL="0";
var LENN={kort:6,normaal:8,lang:10},LENR={kort:260,normaal:300,lang:340},R0=300;
var W=[],P={x:0,y:0,acc:0},map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
var COL=["#e63946","#f2b705","#2a9d8f"],PAR=LS.get(PK,null)||{pin:"",spots:[]};if(!Array.isArray(PAR.spots))PAR.spots=[];
var ZBY={};D.Z.forEach(function(z){ZBY[z.id]=z});
/* lopende minigame-timers, worden gestopt bij het sluiten van een vel */
var mg={raf:0,tm:[],iv:[],off:null,stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[];this.iv.forEach(clearInterval);this.iv=[];if(this.off){try{this.off()}catch(e){}this.off=null}}};
function RR(){return G&&G.R||R0}
function NN(){return G&&G.c&&G.c.slots?G.c.slots.length:LENN[LEN]}
function lvI(){return (G&&G.lvl!=null?+G.lvl:+LVL)?1:0}
function locked(){return !D.FREE&&MW.pro.locked(ID)}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function mmss(ms){var s=Math.max(0,Math.floor(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]/g,"").replace(/^(de|het|een)(?=[a-z])/,"")}
function rnd(r,a,b){return a+Math.floor(r()*(b-a+1))}
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}

/* ---------- stem ---------- */
function say(t){if(!VOICE||!t)return;t=String(t).replace(/<[^>]+>/g,"");if(window.MMVoice)return MMVoice.say(t);try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(t.replace(/[“”"]/g,"").replace(/\{[^}]+\}/g,""));u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.92;u.pitch=1.05;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
function bubble(txt,who,cls,av){return '<div class="msg '+(cls||"")+'">'+(av||PIETAV)+'<div class="bub"><button type="button" class="spk" aria-label="'+esc(T.listen)+'" data-say="'+esc(txt.replace(/<[^>]+>/g,""))+'">🔊</button>'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+txt+'</p></div></div>'}
var PIETAV='<span class="avatar piet" aria-hidden="true">P</span>',SINTAV='<span class="avatar sint" aria-hidden="true">S</span>';
/* artwork van Kellie in games/pakjes/img wint waar het er is (zie games/pakjes/ARTWORK.md) */
var IMGROOT=MW.root+"games/pakjes/img/",IM={};
["hero","piet","sint","ozosnel","kaart-heel","kaart-achterkant","brief","diploma-stempel","finale"].concat(D.Z.map(function(z){return "st-"+z.id})).forEach(function(k){var im=new Image();im.src=IMGROOT+k+".webp?v=1";IM[k]=im});
function ok(k){var im=IM[k];return !!(im&&im.complete&&im.naturalWidth)}
function imgOf(k){return ok(k)?'<img class="erapic" src="'+IMGROOT+k+'.webp?v=1" alt="">':''}
function avatarHTML(cls,letter,key){return '<span class="avatar '+cls+'" aria-hidden="true"'+(ok(key)?' style="background:#fff8ec url('+IMGROOT+key+'.webp?v=1) center 18%/150% auto no-repeat"':'')+'>'+(ok(key)?"":letter)+'</span>'}
function refreshAv(){PIETAV=avatarHTML("piet","P","piet");SINTAV=avatarHTML("sint","S","sint");if(ok("hero"))$("#home").classList.add("photo")}
Promise.all(Object.keys(IM).map(function(k){return new Promise(function(res){var im=IM[k];if(im.complete)return res();im.onload=im.onerror=function(){res()}})})).then(refreshAv);
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){hush();VOICE=true;say(b.dataset.say)}});

/* ---------- geluid ---------- */
var AC=null;function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}return AC}
function tone(f,d,type,vol,when){if(!Wk.sound())return;var a=ac();if(!a)return;try{var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(when||0);o.type=type||"triangle";o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(vol||.06,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
var SFX={good:function(){tone(660,.1,"sine",.06);tone(990,.18,"sine",.05,.09)},bad:function(){tone(180,.25,"square",.05)},tick:function(){tone(1200,.04,"square",.04)},coin:function(){tone(1319,.07,"sine",.05);tone(1760,.16,"sine",.05,.06)},
  win:function(){[523,659,784,1047].forEach(function(f,i){tone(f,.25,"triangle",.07,i*.13)})},hoof:function(i){tone([392,494,587,698][i],.22,"triangle",.07)}};

/* ---------- de zaak samenstellen: alleen uit de seed ---------- */
function genCase(seed,N,mode){var r=rngOf(seed),ids=shuffle(D.Z.map(function(z){return z.id}),r).slice(0,N);
  if(ids.indexOf("zoek")<0)ids[rnd(r,0,N-1)]="zoek"; /* altijd één echte zoekopdracht */
  var rooms=shuffle(D.ROOMS.map(function(_,i){return i}),r).slice(0,N),bq=shuffle(D.BOEK[0].map(function(_,i){return i}),r),rq=shuffle(D.RIJM[0].map(function(_,i){return i}),r);
  var slots=ids.map(function(id,i){var s={z:id,room:rooms[i],seed:Math.floor(r()*1e9)};
    if(id==="zoek")s.zi=rnd(r,0,D.ZOEK.length-1);if(id==="kijk")s.ki=rnd(r,0,3);if(id==="boek")s.qi=bq[i%bq.length];if(id==="rijm")s.ri=rq[i%rq.length];if(id==="code")s.ci=rnd(r,0,5);return s});
  return{slots:slots}}
function makeCode(seed,mode,len,lvl){return"PA"+(len==="kort"?"V":len==="lang"?"L":"N")+(mode==="in"?"B":mode==="map"||mode==="demo"?"K":"S")+(+lvl+1)+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);var m=/^PA([VNL])([KSB])([12])([0-9A-Z]{1,8})$/.exec(c);if(!m)return null;var seed=parseInt(m[4],36);if(!(seed>=0)||seed>4294967295)return null;
  return{len:m[1]==="V"?"kort":m[1]==="L"?"lang":"normaal",mode:m[2]==="B"?"in":m[2]==="K"?"map":"street",lvl:String(+m[3]-1),seed:seed}}
function fixG(g){if(!g||!g.c||!g.c.slots)return null;if(!g.R)g.R=LENR[g.len]||R0;if(!Array.isArray(g.ph))g.ph=[];if(!g.hints)g.hints={};if(!g.obs)g.obs={};g.pep=g.pep||0;g.flip=g.flip||[];g.found=g.found||[];return g}
function done(){return G.ph.filter(Boolean).length}
function puzzleOf(s){return ZBY[s.z].lvl[lvI()]}

/* ---------- startscherm ---------- */
function home(){
  $("#bResume").hidden=!LS.get(GK,null);
  var lk=locked();$("#bGps").textContent=(lk?"🔒 ":"")+T.today;$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=true;$("#status").textContent="";
  $("#name").value=NAME;voiceBtn();parentBtn();
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});
  $$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===LVL)});
  $$("#dur button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});
  show("home")}
function voiceBtn(){var b=$("#bVoice");if(b){b.textContent=(VOICE?"🔊 ":"🔇 ")+T.voice;b.setAttribute("aria-pressed",VOICE)}}
function parentBtn(){var b=$("#bParent"),n=PAR.spots.filter(function(s){return (s.what||s.hint||s.where||s.photo)}).length;if(!b)return;b.textContent=n?fill(T.prBtnOk,{n:n}):T.prBtn;b.classList.toggle("set",!!n)}
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function segClick(id,key,fn){var el=$(id);if(!el)return;el.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;fn(b.dataset[key]);$$(id+" button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})})}
segClick("#len","m",function(v){MODE=v;LS.set("ss_pa_mode",MODE)});
segClick("#lvl","l",function(v){LVL=v;LS.set("ss_pa_lvl",LVL)});
segClick("#dur","n",function(v){LEN=v;LS.set("ss_pa_len",LEN)});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_pa_name",NAME)});
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_pa_voice",VOICE);voiceBtn();toast(VOICE?T.voiceOn:T.voiceOff);if(VOICE)say(T.voiceOn);else hush()};
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#bGps").onclick=function(){if(locked())return proSheet();begin(hashStr("pa|"+MODE+"|"+MW.today()+"|"+LEN+"|"+LVL),MODE,true,LEN)};
$("#bRandom").onclick=function(){if(locked())return proSheet();begin(Math.floor(Math.random()*4e9),MODE,false,LEN)};
$("#bPro").onclick=proSheet;
$("#bDemo").onclick=function(){var w=ehvWorld();build(Math.floor(Math.random()*4e9),"demo",w.pois,w.ways,null,false,"kort")};
$("#bHow").onclick=function(){sheet('<h2>'+T.howH+'</h2>'+$("#howT").innerHTML+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet};
$("#bResume").onclick=function(){G=fixG(LS.get(GK,null));if(!G){LS.del(GK);return home()}W=LS.get(WK,[]);P={x:G.px||0,y:G.py||0,acc:0};enter()};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;
$("#bParent").onclick=function(){parentSheet()};
/* start.js zet het startscherm om; de Ouderhoek-knop hoort vlak boven de grote startknop */
setTimeout(function(){var b=$("#bParent"),go=$("#bGps");if(b&&go&&go.parentNode)go.parentNode.insertBefore(b,go)},0);

/* ---------- Ouderhoek: pincode, verstopplekken, antwoorden ---------- */
function savePar(){LS.set(PK,PAR);parentBtn()}
function parentSheet(after){if(!PAR.pin)return pinSheet(true,function(){parentEdit(after)});pinSheet(false,function(){parentEdit(after)})}
function pinSheet(isNew,then){sheet('<div class="eyebrow">🎄 '+esc(T.prH)+'</div><h2>'+esc(T.prPinAsk)+'</h2><p class="note">'+esc(isNew?T.prPinNew:T.prLead)+'</p><input class="inp code" id="pin" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••"><p class="note err" id="pinMsg"></p><button type="button" class="btn" id="pinOk">'+(isNew?T.prPinSet:T.prPinGo)+'</button>'+(isNew?'':'<p class="note small">'+esc(T.prPinForgot)+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;var go=function(){var v=$("#pin").value.replace(/\D/g,"");if(v.length!==4){$("#pinMsg").textContent=T.prPinNew;return}if(isNew){PAR.pin=v;savePar();then()}else if(v===PAR.pin)then();else{$("#pinMsg").textContent=T.prPinBad;buzz(100);$("#pin").select()}};
  $("#pinOk").onclick=go;$("#pin").onkeydown=function(e){if(e.key==="Enter")go()};setTimeout(function(){var p=$("#pin");if(p)p.focus()},80)}
var PHOTO_FOR=null;
function parentEdit(after){if(!PAR.spots.length)PAR.spots.push({what:"",hint:"",where:"",photo:null});
  var rows=PAR.spots.map(function(s,i){return '<div class="spot" data-i="'+i+'"><div class="spotH"><b>🎁 '+(i+1)+'</b>'+(PAR.spots.length>1?'<button type="button" class="lnk" data-del="'+i+'">'+esc(T.prDel)+'</button>':'')+'</div>'+
    '<label>'+esc(T.prWhat)+'<input data-k="what" maxlength="60" value="'+esc(s.what||"")+'" placeholder="'+esc(T.prWhatP)+'"></label>'+
    '<label>'+esc(T.prHint)+'<textarea data-k="hint" maxlength="240" rows="2" placeholder="'+esc(T.prHintP)+'">'+esc(s.hint||"")+'</textarea></label>'+
    '<label>'+esc(T.prWhere)+'<input data-k="where" maxlength="90" value="'+esc(s.where||"")+'" placeholder="'+esc(T.prWhereP)+'"></label>'+
    '<div class="spotP">'+(s.photo?'<img src="'+s.photo+'" alt="">':'')+'<button type="button" class="btn ghost dk sm" data-ph="'+i+'">'+(s.photo?T.prPhotoOk:T.prPhoto)+'</button></div></div>'}).join("");
  var ans=G?'<details class="prAns"><summary>'+esc(T.prAns)+'</summary><p class="note small">'+esc(T.prAnsT)+'</p>'+answersHTML()+'</details>':'';
  sheet('<div class="eyebrow">🎄 '+esc(T.prH)+'</div><h2>'+esc(T.prSpots)+'</h2><p class="note small">'+esc(T.prLead)+' '+esc(T.prSpotsT)+'</p><div id="spots">'+rows+'</div><button type="button" class="btn ghost dk sm" id="prAdd">'+esc(T.prAdd)+'</button>'+
    '<button type="button" class="btn" id="prSave">'+esc(T.prSave)+'</button>'+ans+'<p class="note small">'+esc(D.LEADNOTE)+'</p><button type="button" class="btn ghost dk sm" id="prPin">'+esc(T.prChange)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>',true);
  var collect=function(){$$("#spots .spot").forEach(function(el){var i=+el.dataset.i,s=PAR.spots[i];if(!s)return;$$("[data-k]",el).forEach(function(inp){s[inp.dataset.k]=inp.value.trim()})})};
  function $$(sel,root){return [].slice.call((root||document).querySelectorAll(sel))}
  $("#sheetBody").onclick=function(e){var t=e.target;
    if(t.id==="shX"){collect();savePar();closeSheet();if(after)after();return}
    if(t.id==="prSave"){collect();savePar();toast(PAR.spots.some(function(s){return s.what||s.hint||s.where||s.photo})?T.prSaved:T.prEmpty);closeSheet();if(after)after();return}
    if(t.id==="prAdd"){collect();PAR.spots.push({what:"",hint:"",where:"",photo:null});savePar();parentEdit(after);return}
    if(t.id==="prPin"){collect();savePar();pinSheet(true,function(){toast(T.prSaved);parentEdit(after)});return}
    if(t.dataset.del!=null){collect();PAR.spots.splice(+t.dataset.del,1);savePar();parentEdit(after);return}
    if(t.dataset.ph!=null){collect();PHOTO_FOR={par:+t.dataset.ph,after:after};$("#file").value="";$("#file").click()}};
  $("#sheetBody").onsubmit=function(e){e.preventDefault()}}
function spotsReady(){return PAR.spots.filter(function(s){return s.what||s.hint||s.where||s.photo})}
function answersHTML(){if(!G)return"";return '<ol class="ol small">'+G.c.slots.map(function(s,i){var z=ZBY[s.z],p=puzzleOf(s);return '<li><b>'+esc(z.title)+'</b>'+(G.ph[i]?" ✓":"")+'<br>'+esc(answerOf(s,p))+'<br><small>'+esc(X.hint)+': '+esc(hintOf(s,p))+'</small></li>'}).join("")+'</ol>'}
function answerOf(s,p){var z=s.z,l=lvI();
  if(z==="boek"){var q=D.BOEK[l][s.qi%D.BOEK[l].length];return q[0]+" → "+q[1][q[2]]}
  if(z==="rijm"){var r=D.RIJM[l][s.ri%D.RIJM[l].length];return r[0]+" → "+r[1]}
  if(z==="code"){return X.aWord+codeWord(s).toUpperCase()}
  if(z==="zoek"){return X.aPhoto+D.ZOEK[s.zi][0]}
  if(z==="kijk"){return D.KIJK[G.mode==="in"?"binnen":"buiten"][s.ki][0]+(l?X.aKijk1:X.aKijk0)}
  if(z==="tel")return X.aTel;
  if(z==="vang")return fill(X.aVang,{n:p.need,s:p.secs});
  if(z==="dak")return fill(X.aDak,{n:p.hits});
  if(z==="ritme")return fill(X.aRitme,{n:p.rounds.length});
  if(z==="sorteer")return p.by==="size"?X.aSort0:X.aSort1;
  if(z==="verschil")return X.aVerschil;
  if(z==="memory")return fill(X.aMemory,{n:p.pairs});
  if(z==="gym")return X.aGym;
  if(z==="schaduw")return fill(X.aSchaduw,{n:p.rounds});return "–"}
function hintOf(s,p){if(s.z==="zoek")return D.ZOEK[s.zi][1];return p.hint}

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

/* ---------- verhaalkaart (kidsmap.js): de winterbuurt op pakjesavond ---------- */
var KI=MW.KidsMap.icons,START={x:500,y:1290};
var FP=[{x:230,y:1040,k:"bakker"},{x:150,y:760,k:"halte"},{x:300,y:520,k:"speel"},{x:520,y:330,k:"plein2"},{x:760,y:420,k:"brug"},{x:860,y:700,k:"park"},{x:720,y:960,k:"kerk"},{x:500,y:760,k:"plein"},{x:150,y:300,k:"winkel"},{x:880,y:1060,k:"post"},{x:620,y:1130,k:"kiosk"},{x:380,y:900,k:"bank"}];
var ROADS=[[-1,0],[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,-1],[7,2],[7,5],[7,0],[7,6],[8,2],[8,1],[9,6],[9,5],[10,-1],[10,6],[11,7],[11,0]];
var TREES=[[80,1180],[120,320],[420,160],[640,180],[900,260],[950,900],[940,1180],[300,1300],[700,1300],[640,600],[90,520],[820,1050],[560,1120]];
var KM=MW.KidsMap.create({T:T.kv,go:function(s){walkTo={x:s.x,y:s.y};sel=null},G:function(){return G},P:function(){return P},dTo:function(s){return dTo(s)},virt:function(){return !!(G&&G.virt)},mode:function(){return G&&G.mode},
  map:{W:1000,H:1400,top:170,start:START,spots:FP,roads:ROADS,vsc:.42,sky:"#1b2550",land:"#e9f1fb",road:"#cfd8e8",roadLine:"#fff",label:"#17203a",labelHalo:"rgba(255,255,255,.9)",heroHalo:"rgba(242,183,5,.35)"},
  draw:{mark:function(g,x,y,r,col){g.save();g.fillStyle=col;g.beginPath();g.ellipse(x,y,r*.9,r,0,0,7);g.fill();g.restore()},
    ground:function(g){g.fillStyle="#f6f9ff";[[200,250,160],[760,900,200],[300,1150,140],[650,250,120]].forEach(function(e){g.beginPath();g.ellipse(e[0],e[1],e[2],e[2]*.5,0,0,7);g.fill()});
      g.strokeStyle="#9ec5ef";g.lineWidth=70;g.lineCap="round";g.lineJoin="round";g.beginPath();[[0,640],[120,690],[260,660],[420,700],[600,680],[800,720],[1000,690]].forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke();
      /* sneeuwvlokken */g.fillStyle="rgba(255,255,255,.9)";for(var i=0;i<40;i++){var x=(i*263)%1000,y=(i*541)%1400;g.beginPath();g.arc(x,y,3+(i%3),0,7);g.fill()}},
    decor:function(g){TREES.forEach(function(p,i){KI.tree(g,p[0],p[1],44+(i%3)*8);g.fillStyle="rgba(255,255,255,.85)";g.beginPath();g.ellipse(p[0],p[1]-(44+(i%3)*8)*.8,14,6,0,0,7);g.fill()});[[60,1000,"#d94f4f"],[900,200,"#8aa6d6"],[420,1000,"#e8b44c"]].forEach(function(h){KI.house(g,h[0],h[1],56,h[2]);g.fillStyle="#ffe08a";g.fillRect(h[0]-10,h[1]-18,8,8);g.fillRect(h[0]+4,h[1]-18,8,8)})},
    start:function(g,x,y){KI.house(g,x,y,110,"#c8433e");g.save();g.fillStyle="#7a2e2a";g.fillRect(x+22,y-96,16,30);g.fillStyle="#fff";g.beginPath();g.ellipse(x+30,y-98,12,5,0,0,7);g.fill();g.fillStyle="rgba(255,255,255,.7)";[0,1,2].forEach(function(i){g.beginPath();g.arc(x+34+i*8,y-112-i*12,5+i*2,0,7);g.fill()});g.fillStyle="#ffe08a";g.fillRect(x-28,y-40,16,14);g.fillRect(x+10,y-40,16,14);g.restore()},
    landmark:function(g,k,x,y,s){({bakker:function(){KI.shop(g,x,y,s)},halte:function(){KI.sign(g,x,y,s,"#2563eb","B")},speel:function(){KI.swing(g,x,y,s)},plein2:function(){KI.lamp(g,x,y,s)},brug:function(){KI.bridge(g,x,y,s)},park:function(){KI.park(g,x,y,s)},kerk:function(){KI.church(g,x,y,s)},plein:function(){KI.fountain(g,x,y,s)},winkel:function(){KI.shop(g,x,y,s)},post:function(){KI.postbox(g,x,y,s)},kiosk:function(){KI.kiosk(g,x,y,s)},bank:function(){KI.bench(g,x,y,s)}}[k]||function(){})()},
    hero:function(g,x,y){g.save();g.strokeStyle="#1b2550";g.lineWidth=3;for(var i=-1;i<=1;i++){g.fillStyle=["#e63946","#f2b705","#2a9d8f"][i+1];g.fillRect(x+i*22-9,y-6,18,16);g.fillStyle="#f6d7b0";g.beginPath();g.arc(x+i*22,y-18,11,0,7);g.fill();g.stroke();/* pietenmuts met veer */g.fillStyle=["#e63946","#f2b705","#2a9d8f"][i+1];g.beginPath();g.moveTo(x+i*22-11,y-22);g.lineTo(x+i*22+11,y-22);g.lineTo(x+i*22,y-36);g.closePath();g.fill();g.stroke();g.fillStyle="#fff";g.fillRect(x+i*22+2,y-44,3,10)}g.restore()}}});
KM.mount();
function buildVirt(seed,mode,origin,daily,len){build(seed,mode,null,null,origin,daily,len,true);if(G&&mode==="map")toast(T.kv.virtOut)}
function noMapSheet(seed,daily,why,len){sheet('<h2>'+T.kv.noMapQ+'</h2>'+(why?'<p class="note">'+esc(why)+'</p>':'')+'<p>'+esc(T.kv.noMapT)+'</p><button type="button" class="btn" id="nmGo">'+T.kv.noMapGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet;$("#nmGo").onclick=function(){closeSheet();MODE="street";LS.set("ss_pa_mode",MODE);build(seed,"street",null,null,null,daily,len)}}
function dropMap(){if(!G||G.mode==="street")return;Wk.stopWatch();KM.leave();G.virt=false;G.mode="street";G.i=0;while(G.ph[G.i])G.i++;G.st=null;save();show("cards");render();toast(T.kv.switched)}

/* ---------- een zaak beginnen ---------- */
var PEND=null;
function begin(seed,mode,daily,len){len=len||"normaal";if(mode!=="map")return build(seed,mode,null,null,null,daily,len);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:LENR[len]||R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      if(!w.pois||!w.pois.length)return buildVirt(seed,"map",w.origin,daily,len);
      build(seed,"map",w.pois,w.ways,w.origin,daily,len);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})},function(){Wk.loading("");var kx=111320*Math.cos(lat*Math.PI/180);buildVirt(seed,"map",{lat:lat,lon:lon,kx:kx,ky:110540},daily,len)})
  }).catch(function(e){Wk.loading("");noMapSheet(seed,daily,e==="nogps"?T.noGps:T.denied,len)})}
function build(seed,mode,pois,ways,origin,daily,len,virt){len=LENN[len]?len:"normaal";var N=LENN[len],lvl=PEND?PEND.lvl:LVL;PEND=null;
  var c=genCase(seed,N,mode);
  G={seed:seed,code:makeCode(seed,mode,len,lvl),mode:mode,lvl:lvl,len:len,R:LENR[len],c:c,i:0,ph:[],hints:{},obs:{},t0:0,daily:!!daily,dist:0,origin:origin,px:0,py:0,st:null,photo:null,wrong:0,pep:0,flip:[],found:[]};
  if(virt){G.virt=true;G.st=KM.virtSpots(N).map(function(p,i){p.fi=i;p.done=false;return p});W=[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  else if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,G.R,N,r,T.corner);
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het) /,"")),fi:i,done:false}});
    for(var k=0;G.st.length<N&&k<N;k++){var a=r()*6.283,d=G.R*(.35+.5*r());G.st.push({x:Math.round(Math.cos(a)*d),y:Math.round(Math.sin(a)*d),type:"hoek",name:T.corner+" "+(G.st.length+1),fi:G.st.length,done:false})}
    W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  brief()}
function brief(){var N=NN();
  $("#bfNo").textContent=(G.mode==="demo"?T.demoCase:"");
  $("#bfOpen").innerHTML=imgOf("brief")+bubble(fill(D.OPEN[G.mode==="in"?"binnen":"buiten"],{N:T.nw[N]||N}),D.PIET,"big")+
    '<div class="chips"><span class="chip">'+esc(T.lvl[lvI()])+' · '+esc(T.lvlAge[lvI()])+'</span><span class="chip">'+esc(fill(X.pieces,{n:N}))+'</span><span class="chip">'+(G.mode==="in"?X.mIn:G.mode==="street"?X.mStreet:X.mMap)+'</span></div>'+
    (spotsReady().length?'':'<div class="act warn"><span class="ico">🎄</span><div>'+X.warnPar+'</div></div>');
  $("#bfTip").innerHTML=MW.codeBox(L,G.code,"zaak");MW.bindCodeBox($("#bfTip"),L);
  show("brief")}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode!=="demo")MW.pro.setFree(ID)}save();hush();enter()};
$("#bBack").onclick=function(){G=null;hush();home()};
$("#bParent2").onclick=function(){parentSheet()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}
function enter(){fixG(G);if(G.mode==="map"||G.mode==="demo")enterMap();else{show("cards");render()}}

/* ---------- hud en kaartjes ---------- */
function tilesHTML(){var out="";G.c.slots.forEach(function(s,i){out+='<i class="tl'+(G.ph[i]?" on":"")+'">'+(G.ph[i]?"🧩":"")+'</i>'});return out}
function hud(){if(!G)return;var n=done();$("#hT").textContent=mmss(Date.now()-G.t0);$("#hS").textContent=n+"/"+NN();$("#hP").textContent=G.pep;$("#hM").innerHTML=tilesHTML()}
function roomOf(s){return D.ROOMS[s.room]}
function render(){hud();while(G.i<NN()&&G.ph[G.i])G.i++;var i=G.i,box=$("#card"),N=NN();
  if(i>=N){box.innerHTML='<div class="pol done"><div class="big">🗺️</div></div>'+bubble(T.radarAll,D.PIET)+'<button type="button" class="btn red" id="bAcc">'+T.finH+'</button>';$("#bAcc").onclick=toFinale;return}
  var s=G.c.slots[i],z=ZBY[s.z],room=roomOf(s),where=G.mode==="in"?fill(X.goRoom,{r:"<b>"+esc(room[1])+"</b>"}):X.goOut;
  box.innerHTML='<div class="pol empty"><div class="ph">'+(G.mode==="in"?room[2]:"🧩")+'</div><p class="cap">'+esc(fill(T.task,{i:i+1,n:N}))+(G.mode==="in"?' · '+esc(cap(room[0])):'')+'</p></div>'+bubble(where+fill(X.pieceThere,{i:i+1,t:"<b>"+esc(z.title)+"</b>"}),D.PIET)+'<button type="button" class="btn" id="bOpen">▶ '+T.start+'</button>';
  $("#bOpen").onclick=function(){taskSheet(i)}}

/* ---------- spelen met kaart ---------- */
function enterMap(){show("play");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return RR()},
    theme:{bg:"#1b2550",water:"#2a62b8",waterEdge:"#6ec3ff",ripple:"rgba(110,195,255,.3)",park:"#2f8a4c",parkEdge:"#6fd38a",river:"#2a62b8",major:"#f2b705",minor:"#4f6ab8",road:"#9fb3e8",label:"#ffe08a",waterLabel:"#bfeaff",ring:"rgba(242,183,5,.35)",me:"#f2b705",meHalo:"rgba(242,183,5,.16)",meRing:"rgba(242,183,5,.7)",font:"700 12px 'Fredoka',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(RR());sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d;KM.moved(d)});
  KM.enter({kids:true,virt:!!G.virt,map:map});
  if(G.mode==="demo")toast(T.demoTip);
  requestAnimationFrame(loop)}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[];
  it.push({x:P.x,y:P.y,tap:false,draw:function(cx,X,Y,t,api){if(api.still)return;cx.save();cx.fillStyle="rgba(242,183,5,.18)";cx.beginPath();cx.arc(X,Y,30+8*Math.sin(t/300),0,7);cx.fill();cx.restore()}});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/500+s.fi)*3,col=COL[s.fi%3];
    if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*22,0,7);cx.stroke();cx.globalAlpha=1}
    Wk.badge(cx,X,Y+bob*.3,"obj",s.done?"#6b7fa8":col,1,s.done);if(!s.done){cx.save();cx.fillStyle="#101a2b";cx.beginPath();cx.arc(X,Y+bob*.3,13,0,7);cx.fill();cx.font="18px sans-serif";cx.textAlign="center";cx.textBaseline="middle";cx.fillText("🧩",X,Y+bob*.3+1);cx.restore()}cx.textBaseline="alphabetic";
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,26,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#9fb0d8":"#fff";cx.shadowColor="#000";cx.shadowBlur=6;if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+36);cx.shadowBlur=0}})});
  return it}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=110*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  if(!KM.draw(t))map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tickMap()}requestAnimationFrame(loop)}
function tickMap(){var el=Math.floor((Date.now()-G.t0)/1000),n=done();
  $("#mT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#mS").textContent=n+"/"+NN();$("#mP").textContent=G.pep;$("#mM").innerHTML=tilesHTML();
  var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});
  $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);beep(660,.2)}if(!here)arrived=null;
  chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel),z=ZBY[G.c.slots[sel.fi].z];
  $("#cName").textContent=sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=T.here+" · "+z.title;
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))taskSheet(sel.fi,sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;taskSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mAcc").onclick=toFinale;$("#bNote").onclick=noteSheet;$("#bAcc2").onclick=toFinale;

/* ---------- een proef ---------- */
function taskSheet(i,spot){walkTo=null;
  if(G.mode==="demo"&&!G.ph[i]&&done()>=(window.MMTrial?MMTrial.max:2)&&window.MMTrial&&locked()){var _GK=GK;return MMTrial.end({buy:proSheet,home:function(){leavePlay();try{localStorage.removeItem(_GK)}catch(e){}}})}
  var s=G.c.slots[i],z=ZBY[s.z],p=puzzleOf(s),n=done()+1;cur={i:i,spot:spot||null,fails:0};
  var story=z.story;if(s.z==="zoek")story=fill(story,{z:D.ZOEK[s.zi][0]});
  var head='<div class="eyebrow">'+esc(fill(T.task,{i:n,n:NN()}))+' · '+esc(z.title)+(spot?' · '+esc(spot.name):G.mode==="in"?' · '+esc(cap(roomOf(s)[0])):'')+'</div>'+imgOf("st-"+z.id)+'<h2>'+esc(z.title)+'</h2>'+bubble(story,D.PIET);
  sheet(head+'<div id="pz"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){G.force=null;closeSheet()};
  say(story);
  var h=hintOf(s,p);PUZ[s.z](s,p,$("#pz"),h)}
function hintBox(s,p,h){var used=!!G.hints[s.z];return '<div id="fb">'+(used?'<div class="fb hint">💡 '+esc(h)+'</div>':'')+'</div><button type="button" class="btn ghost dk sm" id="bHint"'+(used?' disabled':'')+'>'+(used?T.hintUsed:T.hintBtn)+'</button>'}
function bindHint(s,h){var b=$("#bHint");if(!b)return;b.onclick=function(){G.hints[s.z]=1;save();b.disabled=true;b.textContent=T.hintUsed;$("#fb").innerHTML='<div class="fb hint">💡 '+esc(h)+'</div>';say(h)}}
function wrong(s,h,msg){G.wrong++;cur.fails++;save();SFX.bad();buzz(120);var used=!!G.hints[s.z];var fb=$("#fb");if(fb)fb.innerHTML='<div class="fb no">'+esc(msg||(used?T.wrong:T.wrongHint))+'</div>'+(used?'<div class="fb hint">💡 '+esc(h)+'</div>':'');var a=$("#ans");if(a)a.select()}
function passBtn(label){return '<button type="button" class="btn" id="bPass">'+esc(label||T.next)+'</button>'}
function choices(arr){return '<div class="choices" id="ch">'+arr.map(function(c,k){return '<button type="button" data-i="'+k+'">'+esc(c)+'</button>'}).join("")+'</div>'}
function bindChoice(correct,s,h,then){$$("#ch button").forEach(function(b){b.onclick=function(){var k=+b.dataset.i;if(k===correct){b.classList.add("ok");SFX.good();setTimeout(then||accept,350)}else{b.classList.add("no");b.disabled=true;wrong(s,h)}}})}
function shuffled(arr,r){return shuffle(arr.slice(),r)}
function canvas(box,id,w,h){var cv=document.createElement("canvas");cv.id=id;cv.width=w*2;cv.height=h*2;cv.className="mg";cv.style.aspectRatio=w+"/"+h;box.appendChild(cv);var g=cv.getContext("2d");g.scale(2,2);return cv}
function ptr(cv,fn){var f=function(e){var r=cv.getBoundingClientRect(),t=e.touches?e.touches[0]:e,x=(t.clientX-r.left)/r.width*cv.width/2,y=(t.clientY-r.top)/r.height*cv.height/2;fn(x,y,e)};cv.addEventListener("pointerdown",f);cv.addEventListener("pointermove",function(e){if(e.buttons||e.pointerType==="touch")f(e)});return f}
function sky(g,w,h){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,"#0e1738");gr.addColorStop(1,"#2a3a7a");g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle="#fff";for(var i=0;i<30;i++){g.globalAlpha=.4+((i*7)%6)/10;g.beginPath();g.arc((i*97)%w,(i*53)%(h*.7),1+(i%2),0,7);g.fill()}g.globalAlpha=1;g.fillStyle="#ffe08a";g.beginPath();g.arc(w-40,36,18,0,7);g.fill()}
function pepernoot(g,x,y,r){g.fillStyle="#8b4a1f";g.beginPath();g.ellipse(x,y,r,r*.85,0,0,7);g.fill();g.fillStyle="#b86a35";g.beginPath();g.ellipse(x-r*.25,y-r*.3,r*.45,r*.3,-.5,0,7);g.fill()}
function pakje(g,x,y,s,box,lint,bow,odd){g.fillStyle=box;rr(g,x-s/2,y-s/2,s,s,s*.12);g.fill();g.fillStyle=lint;g.fillRect(x-s*.09,y-s/2,s*.18,s);g.fillRect(x-s/2,y-s*.09,s,s*.18);
  var bx=x+(odd==="shift"?s*.24:0);g.strokeStyle=bow;g.lineWidth=Math.max(2,s*.09);g.beginPath();g.ellipse(bx-s*.17,y-s*.5,s*.17,s*.11,-.4,0,7);g.stroke();g.beginPath();g.ellipse(bx+s*.17,y-s*.5,s*.17,s*.11,.4,0,7);g.stroke();g.fillStyle=bow;g.beginPath();g.arc(bx,y-s*.5,s*.06,0,7);g.fill()}
var PUZ={
 /* Pepernoten tellen */
 tel:function(s,p,box,h){var r=rngOf(s.seed),n=rnd(r,p.min,p.max),W2=300,H=200;
  box.innerHTML='<p class="pzst" id="st">'+esc(T.ready)+'</p>';var cv=canvas(box,"cv",W2,H),g=cv.getContext("2d");var ctl=document.createElement("div");ctl.id="ctl";box.appendChild(ctl);
  var nuts=[];for(var i=0;i<n;i++)nuts.push({x:20+r()*(W2-40),t:i*(1100/p.speed)+r()*300,vx:(r()-.5)*20,r:7+r()*4});var dur=n*(1100/p.speed)+2200;
  var run=function(){mg.stop();ctl.innerHTML="";$("#st").textContent=X.telGo;var t0=performance.now();var f=function(ts){var t=ts-t0;sky(g,W2,H);g.fillStyle="#e9f1fb";g.fillRect(0,H-18,W2,18);
      nuts.forEach(function(q){var dt=(t-q.t)/1000;if(dt<0)return;var y=-10+dt*dt*220,x=q.x+q.vx*dt;if(y>H-24){y=H-24;g.fillStyle="rgba(0,0,0,.15)";g.beginPath();g.ellipse(x,y+q.r,q.r,3,0,0,7);g.fill()}pepernoot(g,x,y,q.r)});
      if(t<dur&&cv.isConnected)mg.raf=requestAnimationFrame(f);else{$("#st").textContent=X.telQ;ask()}};mg.raf=requestAnimationFrame(f)};
  var ask=function(){var r2=rngOf(s.seed^7);if(p.choice){var opts=shuffled([n,n+rnd(r2,1,2),Math.max(1,n-rnd(r2,1,2))],r2);ctl.innerHTML=choices(opts.map(String))+'<button type="button" class="btn ghost dk sm" id="bAg">'+esc(T.again)+'</button>'+hintBox(s,p,h);bindChoice(opts.indexOf(n),s,h)}
    else{ctl.innerHTML='<input class="inp code" id="ans" inputmode="numeric" maxlength="2" placeholder="0"><button type="button" class="btn" id="bCheck">'+T.ok+'</button><button type="button" class="btn ghost dk sm" id="bAg">'+esc(T.again)+'</button>'+hintBox(s,p,h);var chk=function(){var v=parseInt($("#ans").value,10);if(v===n)accept();else wrong(s,h)};$("#bCheck").onclick=chk;$("#ans").onkeydown=function(e){if(e.key==="Enter")chk()}}
    bindHint(s,h);$("#bAg").onclick=run};
  ctl.innerHTML='<button type="button" class="btn" id="bGo2">'+esc(T.go)+'</button>'+hintBox(s,p,h);bindHint(s,h);$("#bGo2").onclick=run;sky(g,W2,H)},
 /* Strooigoed vangen */
 vang:function(s,p,box,h){var W2=300,H=260,r=rngOf(s.seed);
  box.innerHTML='<p class="pzst" id="st">'+esc(T.ready)+'</p>';var cv=canvas(box,"cv",W2,H),g=cv.getContext("2d");var ctl=document.createElement("div");ctl.id="ctl";box.appendChild(ctl);
  var bx=W2/2,items=[],score=0,left=p.secs,on=false;
  ptr(cv,function(x){bx=Math.max(30,Math.min(W2-30,x))});
  var draw=function(){sky(g,W2,H);g.fillStyle="#e9f1fb";g.fillRect(0,H-14,W2,14);items.forEach(function(q){if(q.coal){g.fillStyle="#222";g.beginPath();g.ellipse(q.x,q.y,9,8,0,0,7);g.fill()}else pepernoot(g,q.x,q.y,8)});
    /* de schoen */g.fillStyle="#7a3b1e";rr(g,bx-30,H-40,60,22,8);g.fill();g.fillStyle="#5a2a12";rr(g,bx-30,H-48,24,14,6);g.fill();g.fillStyle="#f2b705";g.fillRect(bx-24,H-30,48,4);
    g.fillStyle="#fff";g.font="700 16px Fredoka,sans-serif";g.textAlign="left";g.fillText("🥜 "+score+" / "+p.need,8,22);g.textAlign="right";g.fillText("⏱ "+left,W2-8,22)};
  var run=function(){mg.stop();ctl.innerHTML="";items=[];score=0;left=p.secs;on=true;$("#st").textContent=X.vangGo;var last=performance.now(),acc=0;
    mg.iv.push(setInterval(function(){left--;if(left<=0)end()},1000));
    var f=function(ts){var dt=Math.min(.05,(ts-last)/1000);last=ts;acc+=dt*p.rate;while(acc>1){acc-=1;items.push({x:20+r()*(W2-40),y:-10,v:70+r()*60,coal:r()<p.coal})}
      items.forEach(function(q){q.y+=q.v*dt;if(q.y>H-44&&q.y<H-24&&Math.abs(q.x-bx)<30&&!q.hit){q.hit=true;if(q.coal){score=Math.max(0,score-1);SFX.bad();buzz(60)}else{score++;SFX.coin()}}});
      items=items.filter(function(q){return q.y<H+10&&!q.hit});draw();if(on&&cv.isConnected)mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)};
  var end=function(){on=false;mg.stop();draw();if(score>=p.need){$("#st").textContent=fill(X.vangOk,{n:score});SFX.good();ctl.innerHTML=passBtn();$("#bPass").onclick=accept}else{$("#st").textContent=fill(X.vangNo,{n:score,m:p.need});ctl.innerHTML='<button type="button" class="btn" id="bAg">'+esc(T.again)+'</button>'+hintBox(s,p,h);bindHint(s,h);$("#bAg").onclick=run;G.wrong++;save()}};
  ctl.innerHTML='<button type="button" class="btn" id="bGo2">'+esc(T.go)+'</button>'+hintBox(s,p,h);bindHint(s,h);$("#bGo2").onclick=run;draw()},
 /* Schoenen-memory */
 memory:function(s,p,box,h){var r=rngOf(s.seed),pick=shuffled(D.SHAD,r).slice(0,p.pairs),cards=shuffled(pick.concat(pick),r),open=[],found=0,lock=false;
  box.innerHTML='<div class="mem c'+(p.pairs>4?4:4)+'" id="mem">'+cards.map(function(c,i){return '<button type="button" data-i="'+i+'"><span class="front">👢</span><span class="back">'+c[0]+'</span></button>'}).join("")+'</div><p class="pzst" id="st">'+esc(fill(X.of,{i:0,n:p.pairs}))+'</p>'+hintBox(s,p,h);bindHint(s,h);
  $$("#mem button").forEach(function(b){b.onclick=function(){if(lock||b.classList.contains("on")||b.classList.contains("done"))return;b.classList.add("on");SFX.tick();open.push(b);if(open.length<2)return;lock=true;
    var a=cards[+open[0].dataset.i],c=cards[+open[1].dataset.i];if(a[0]===c[0]){found++;open.forEach(function(x){x.classList.add("done")});open=[];lock=false;SFX.good();$("#st").textContent=fill(X.of,{i:found,n:p.pairs});if(found>=p.pairs)setTimeout(accept,500)}
    else{G.wrong++;mg.tm.push(setTimeout(function(){open.forEach(function(x){x.classList.remove("on")});open=[];lock=false},800))}}})},
 /* Het dak op */
 dak:function(s,p,box,h){var W2=300,H=180,hits=0,miss=0,x=30,dir=1,on=true,flash=0;
  box.innerHTML='<p class="pzst" id="st">'+esc(fill(X.dakGo,{n:p.hits}))+'</p>';var cv=canvas(box,"cv",W2,H),g=cv.getContext("2d");box.insertAdjacentHTML("beforeend",hintBox(s,p,h));bindHint(s,h);
  var CH=W2/2,speed=90*p.speed;var last=performance.now();
  var draw=function(ts){sky(g,W2,H);/* daken */g.fillStyle="#2b2f4a";[[0,120,80],[70,105,70],[130,112,45],[170,100,60],[225,115,75]].forEach(function(d){g.beginPath();g.moveTo(d[0],H);g.lineTo(d[0],d[1]);g.lineTo(d[0]+d[2]/2,d[1]-22);g.lineTo(d[0]+d[2],d[1]);g.lineTo(d[0]+d[2],H);g.fill()});
    g.fillStyle="#e9f1fb";[[0,120,80],[70,105,70],[130,112,45],[170,100,60],[225,115,75]].forEach(function(d){g.beginPath();g.moveTo(d[0]-2,d[1]+3);g.lineTo(d[0]+d[2]/2,d[1]-20);g.lineTo(d[0]+d[2]+2,d[1]+3);g.lineTo(d[0]+d[2],d[1]+8);g.lineTo(d[0]+d[2]/2,d[1]-12);g.lineTo(d[0],d[1]+8);g.fill()});
    g.fillStyle="#ffe08a";[[20,135],[95,125],[190,120],[250,135]].forEach(function(w){g.fillRect(w[0],w[1],10,10)});
    /* schoorsteen */g.fillStyle=flash>0?"#f2b705":"#c8433e";g.fillRect(CH-12,78,24,34);g.fillStyle="#7a2e2a";g.fillRect(CH-14,74,28,6);
    /* Piet als silhouet met muts */var py=72-Math.abs(Math.sin(x/18))*6;g.fillStyle="#141a3a";g.beginPath();g.arc(x,py-20,7,0,7);g.fill();rr(g,x-6,py-14,12,16,4);g.fill();g.fillStyle=COL[0];g.beginPath();g.moveTo(x-8,py-22);g.lineTo(x+8,py-22);g.lineTo(x+2,py-34);g.closePath();g.fill();g.fillStyle="#fff";g.fillRect(x+2,py-40,2,8);
    g.strokeStyle="#141a3a";g.lineWidth=3;g.beginPath();g.moveTo(x-4,py+2);g.lineTo(x-9,py+10);g.moveTo(x+4,py+2);g.lineTo(x+9,py+10);g.stroke()};
  var f=function(ts){var dt=Math.min(.05,(ts-last)/1000);last=ts;x+=dir*speed*dt;if(x>W2-20){x=W2-20;dir=-1}if(x<20){x=20;dir=1}if(flash>0)flash-=dt;draw(ts);if(on&&cv.isConnected)mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  cv.addEventListener("pointerdown",function(){if(!on)return;if(Math.abs(x-CH)<16){hits++;flash=.4;SFX.good();buzz(40);$("#st").textContent=fill(X.dakHit,{i:hits,n:p.hits});if(hits>=p.hits){on=false;mg.tm.push(setTimeout(accept,500))}}else{miss++;SFX.bad();G.wrong++;$("#st").textContent=fill(X.dakMiss,{i:hits,n:p.hits})}})},
 /* De hoefslag van Ozosnel */
 ritme:function(s,p,box,h){var r=rngOf(s.seed),round=0,seq=[],at=0,busy=true,HC=["#e63946","#f2b705","#2a9d8f","#4f6ab8"];
  box.innerHTML='<p class="pzst" id="st">'+esc(X.listen)+'</p><div class="hoef" id="hoef">'+[0,1,2,3].map(function(i){return '<button type="button" data-i="'+i+'" style="--c:'+HC[i]+'"><span class="u"></span></button>'}).join("")+'</div>'+hintBox(s,p,h);bindHint(s,h);
  var light=function(i,ms){var b=$('#hoef [data-i="'+i+'"]');if(!b)return;b.classList.add("on");SFX.hoof(i);mg.tm.push(setTimeout(function(){b.classList.remove("on")},ms||350))};
  var play=function(){busy=true;at=0;seq=[];for(var i=0;i<p.rounds[round];i++)seq.push(rnd(r,0,3));$("#st").textContent=fill(X.round,{i:round+1,n:p.rounds.length});
    seq.forEach(function(k,i){mg.tm.push(setTimeout(function(){light(k)},700+i*600))});mg.tm.push(setTimeout(function(){busy=false;$("#st").textContent=X.yourTurn},700+seq.length*600))};
  $("#hoef").onclick=function(e){var b=e.target.closest("button");if(!b||busy)return;var k=+b.dataset.i;light(k,200);
    if(k===seq[at]){at++;if(at>=seq.length){busy=true;round++;if(round>=p.rounds.length){$("#st").textContent=X.exact;SFX.good();mg.tm.push(setTimeout(accept,600))}else{$("#st").textContent=X.good;mg.tm.push(setTimeout(play,900))}}}
    else{busy=true;wrong(s,h,X.ritmeNo);mg.tm.push(setTimeout(play,1100))}};
  mg.tm.push(setTimeout(play,600))},
 /* De inpakpiet */
 sorteer:function(s,p,box,h){var r=rngOf(s.seed),n=p.n,arr=[];
  for(var i=0;i<n;i++)arr.push({size:p.by==="size"?34+i*14:40,num:p.by==="num"?rnd(r,1+i*18,15+i*18):0,col:["#e63946","#2a9d8f","#4f6ab8","#f2b705","#9b5de5"][i%5],k:i});
  var view=shuffled(arr,r),next=0;
  var paint=function(){box.innerHTML='<p class="pzst" id="st">'+esc(p.by==="size"?X.sort0:X.sort1)+'</p><div class="pak" id="pak">'+view.map(function(a){return '<button type="button" data-k="'+a.k+'" class="'+(a.k<next?"done":"")+'"><span style="width:'+a.size+'px;height:'+a.size+'px;background-color:'+a.col+'"></span>'+(a.num?'<b>'+a.num+'</b>':'')+'</button>'}).join("")+'</div>'+hintBox(s,p,h);bindHint(s,h);
    $("#pak").onclick=function(e){var b=e.target.closest("button");if(!b||b.classList.contains("done"))return;var k=+b.dataset.k;if(k===next){next++;b.classList.add("done");SFX.coin();if(next>=n){$("#st").textContent=X.sortOk;mg.tm.push(setTimeout(accept,500))}else $("#st").textContent=X.sortNext}else{b.classList.add("shake");wrong(s,h,X.sortNo);next=0;mg.tm.push(setTimeout(paint,700))}}};
  paint()},
 /* Het verkeerde pakje */
 verschil:function(s,p,box,h){var r=rngOf(s.seed),odd=rnd(r,0,8),box_c=["#e63946","#2a9d8f","#4f6ab8"][rnd(r,0,2)],lint=["#f2b705","#fff","#ffb3c6"][rnd(r,0,2)],bow=lint,bow2=p.subtle?lint:"#1b2550";
  box.innerHTML='<div class="grid9" id="g9">'+[0,1,2,3,4,5,6,7,8].map(function(i){return '<button type="button" data-i="'+i+'"><canvas width="140" height="140"></canvas></button>'}).join("")+'</div>'+hintBox(s,p,h);bindHint(s,h);
  $$("#g9 canvas").forEach(function(cv,i){var g=cv.getContext("2d");g.scale(2,2);g.fillStyle="#fff8ec";g.fillRect(0,0,70,70);pakje(g,35,40,38,box_c,lint,i===odd?bow2:bow,i===odd&&p.subtle?"shift":"")});
  $("#g9").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(+b.dataset.i===odd){b.classList.add("ok");SFX.good();mg.tm.push(setTimeout(accept,400))}else{b.classList.add("no");wrong(s,h)}}},
 /* Pietengeheimschrift */
 code:function(s,p,box,h){var word=codeWord(s),letters=[],r=rngOf(s.seed);word.split("").forEach(function(c){if(letters.indexOf(c)<0)letters.push(c)});
  var extra=Object.keys(D.SYM).filter(function(c){return letters.indexOf(c)<0});shuffled(extra,r).slice(0,4).forEach(function(c){letters.push(c)});letters=shuffled(letters,r);
  var key='<div class="key">'+letters.map(function(c){return '<i>'+D.SYM[c]+'<b>'+c.toUpperCase()+'</b></i>'}).join("")+'</div>',cipher='<div class="cipher">'+word.split("").map(function(c){return '<i>'+D.SYM[c]+'</i>'}).join("")+'</div>';
  if(!p.text){var cw=D.CODEW[s.ci%D.CODEW.length],opts=shuffled(cw[1],r);box.innerHTML=key+cipher+choices(opts.map(function(x){return x.toUpperCase()}))+hintBox(s,p,h);bindHint(s,h);bindChoice(opts.indexOf(word),s,h)}
  else{box.innerHTML=key+cipher+'<input class="inp code" id="ans" autocomplete="off" autocapitalize="characters" maxlength="10" placeholder="'+esc(X.phWord)+'"><button type="button" class="btn" id="bCheck">'+T.ok+'</button>'+hintBox(s,p,h);bindHint(s,h);var chk=function(){if(norm($("#ans").value)===word)accept();else wrong(s,h)};$("#bCheck").onclick=chk;$("#ans").onkeydown=function(e){if(e.key==="Enter")chk()}}},
 /* De Rijmpiet */
 rijm:function(s,p,box,h){var l=lvI(),q=D.RIJM[l][s.ri%D.RIJM[l].length],r=rngOf(s.seed);
  if(!p.text){var opts=shuffled(q[2],r);box.innerHTML='<p class="q rijm">'+esc(q[0])+'</p>'+choices(opts)+hintBox(s,p,h);bindHint(s,h);bindChoice(opts.indexOf(q[1]),s,h);say(q[0])}
  else{box.innerHTML='<p class="q rijm">'+esc(q[0])+'</p><input class="inp code" id="ans" autocomplete="off" autocapitalize="characters" maxlength="12" placeholder="'+esc(X.phRhyme)+'"><button type="button" class="btn" id="bCheck">'+T.ok+'</button>'+hintBox(s,p,h);bindHint(s,h);say(q[0]);var chk=function(){var v=norm($("#ans").value);if(q[2].some(function(a){return norm(a)===v}))accept();else wrong(s,h)};$("#bCheck").onclick=chk;$("#ans").onkeydown=function(e){if(e.key==="Enter")chk()}}},
 /* Het Grote Boek */
 boek:function(s,p,box,h){var l=lvI(),q=D.BOEK[l][s.qi%D.BOEK[l].length],r=rngOf(s.seed),idx=shuffled([0,1,2],r);
  box.innerHTML='<p class="q">'+esc(q[0])+'</p>'+choices(idx.map(function(i){return q[1][i]}))+hintBox(s,p,h);bindHint(s,h);bindChoice(idx.indexOf(q[2]),s,h);say(q[0])},
 /* Zoek en fotografeer */
 zoek:function(s,p,box,h){var paint=function(){box.innerHTML='<div class="photo" id="ph">'+(G.photo?'<img src="'+G.photo+'" alt="">':'')+'<button type="button" class="btn sky" id="bPhoto">'+(G.photo?T.photoAgain:T.photoGo)+'</button>'+(G.photo?'<button type="button" class="btn" id="bPhotoOk">'+T.photoOk+'</button>':'')+'<p class="note">'+T.photoKeep+'</p><button type="button" class="lnk" id="bSkipPh">'+esc(T.photoSkip)+'</button></div>'+hintBox(s,p,h);bindHint(s,h);
    $("#bPhoto").onclick=function(){PHOTO_FOR=null;$("#file").value="";$("#file").click()};var ok2=$("#bPhotoOk");if(ok2)ok2.onclick=accept;$("#bSkipPh").onclick=accept};paint();cur.rePaint=paint},
 /* Kijk en tel */
 kijk:function(s,p,box,h){var pre=D.KIJK[G.mode==="in"?"binnen":"buiten"][s.ki][0],obs=G.obs[s.z];
  if(obs==null){box.innerHTML='<p class="q">'+esc(pre)+'</p><input class="inp code" id="obs" inputmode="numeric" maxlength="3" placeholder="0"><button type="button" class="btn" id="bObs">'+T.countGo+'</button>'+hintBox(s,p,h);bindHint(s,h);say(pre);
    var go=function(){var v=parseInt($("#obs").value.replace(/\D/g,""),10);if(!(v>=0)||v>200){toast(X.typeNum);return}G.obs[s.z]=v;save();PUZ.kijk(s,p,box,h)};$("#bObs").onclick=go;$("#obs").onkeydown=function(e){if(e.key==="Enter")go()};return}
  var r=rngOf(s.seed),q,opts,ans;
  if(!lvI()){q=fill(X.kijk0,{n:obs});opts=X.evenOdd;ans=obs%2===0?0:1}
  else{q=fill(X.kijk1,{n:obs});var a=obs+3,o=shuffled([a,a+1,a-1>0?a-1:a+2],r);opts=o.map(String);ans=o.indexOf(a)}
  box.innerHTML='<p class="note">'+esc(pre)+' <b>'+obs+'</b> <button type="button" class="lnk" id="bReObs">'+esc(X.other)+'</button></p><p class="q">'+esc(q)+'</p>'+choices(opts)+hintBox(s,p,h);bindHint(s,h);say(q);
  $("#bReObs").onclick=function(){delete G.obs[s.z];save();PUZ.kijk(s,p,box,h)};bindChoice(ans,s,h)},
 /* Pietengym */
 gym:function(s,p,box,h){var left=p.secs,jumps=0,lastJ=0,on=false,sens=false;
  box.innerHTML='<div class="gym"><b id="gT">'+p.secs+'</b><span>'+esc(X.secs)+'</span><b id="gJ">0</b><span>'+esc(X.jumps)+'</span></div><p class="pzst" id="st">'+esc(T.ready)+'</p><div id="ctl"><button type="button" class="btn" id="bGo2">'+esc(T.go)+'</button></div>'+hintBox(s,p,h);bindHint(s,h);
  var onMotion=function(e){if(!on)return;var a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;var m=Math.hypot(a.x||0,a.y||0,a.z||0),t=Date.now();sens=true;if(m>19&&t-lastJ>350){lastJ=t;jumps++;$("#gJ").textContent=jumps;SFX.tick()}};
  var start=function(){on=true;$("#ctl").innerHTML="";$("#st").textContent=X.gymGo;
    var go=function(){window.addEventListener("devicemotion",onMotion);mg.off=function(){window.removeEventListener("devicemotion",onMotion)}};
    try{if(window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==="function")DeviceMotionEvent.requestPermission().then(function(st){if(st==="granted")go()}).catch(function(){});else go()}catch(e){}
    mg.iv.push(setInterval(function(){left--;$("#gT").textContent=left;if(left<=0)end()},1000))};
  var end=function(){on=false;mg.stop();SFX.good();buzz([60,40,60]);$("#st").textContent=sens?(jumps>=p.target?fill(X.gymTop,{n:jumps}):fill(X.gymOk,{n:jumps})):X.gymNoSens;$("#ctl").innerHTML=passBtn();$("#bPass").onclick=accept};
  $("#bGo2").onclick=start},
 /* Schaduwen op het dak */
 schaduw:function(s,p,box,h){var r=rngOf(s.seed),round=0;
  var next=function(){if(round>=p.rounds)return accept();var pool=shuffled(D.SHAD,r).slice(0,p.opts),ans=rnd(r,0,p.opts-1);
    box.innerHTML='<p class="pzst">'+esc(fill(X.of,{i:round+1,n:p.rounds}))+'</p><div class="shadow">'+pool[ans][0]+'</div>'+choices(pool.map(function(x){return cap(x[1])}))+hintBox(s,p,h);bindHint(s,h);
    bindChoice(ans,s,h,function(){round++;next()})};next()}
};
function codeWord(s){return lvI()?D.CODEW1[s.ci%D.CODEW1.length]:D.CODEW[s.ci%D.CODEW.length][0]}
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];if(!f)return;var img=new Image(),url=URL.createObjectURL(f);img.onload=function(){var mx=900,sc=Math.min(1,mx/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);c.getContext("2d").drawImage(img,0,0,c.width,c.height);var data=c.toDataURL("image/jpeg",.7);URL.revokeObjectURL(url);
    if(PHOTO_FOR&&PHOTO_FOR.par!=null){var sp=PAR.spots[PHOTO_FOR.par];if(sp)sp.photo=data;savePar();var af=PHOTO_FOR.after;PHOTO_FOR=null;parentEdit(af);toast(T.prPhotoOk);return}
    if(!G||!cur)return;G.photo=data;save();if(cur.rePaint)cur.rePaint();toast(X.nicePhoto)};img.src=url});
function accept(){if(!cur)return;var i=cur.i,s=G.c.slots[i];if(G.ph[i])return;G.ph[i]=1;if(cur.spot){cur.spot.done=true;cur.spot.doneAt=Date.now()}G.force=null;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;
  var pep=10+(G.hints[s.z]?0:5);G.pep+=pep;save();mg.stop();buzz([40,30,80]);SFX.win();
  var N=NN(),n=done(),last=n>=N,cliff=last?D.CLIFFLAST:D.CLIFF[(n-1+(G.seed%5))%D.CLIFF.length];
  sheet('<div class="eyebrow">'+esc(fill(T.clue,{n:n,t:N}))+'</div><div class="reward"><div class="big">🧩</div><p>'+esc(T.pieceGet)+'</p><canvas id="pc" class="piece" width="240" height="180"></canvas><p class="pep">🥜 '+esc(fill(T.pepGet,{n:pep}))+'</p><div class="tiles">'+tilesHTML()+'</div></div>'+
    bubble(cliff,D.PIET)+'<button type="button" class="btn" id="bNext">'+(last?T.finH:T.next)+'</button>',true);
  pieceThumb($("#pc"),i);say(T.pieceGet+" "+cliff);
  $("#bNext").onclick=function(){closeSheet();sel=null;cur=null;if(G.mode==="map"||G.mode==="demo")chip();else render();if(last)toFinale()}}

/* ---------- de verstopkaart (canvas) ---------- */
function grid(N){return{c:N===6?3:N===8?4:5,r:2}}
function drawKaartBase(g,w,h){if(ok("kaart-heel")){g.drawImage(IM["kaart-heel"],0,0,w,h);return}
  g.fillStyle="#f3e4bf";g.fillRect(0,0,w,h);g.strokeStyle="#c9ab6a";g.lineWidth=2;for(var x=0;x<w;x+=24){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.globalAlpha=.25;g.stroke();g.globalAlpha=1}
  /* straat met huizen */g.fillStyle="#e9d7aa";g.fillRect(0,h*.62,w,h*.38);g.fillStyle="#d8c38f";for(var i=0;i<6;i++){var hx=20+i*(w-40)/5,hw=w*.1;g.fillStyle=["#c8433e","#4f6ab8","#2a9d8f","#e8b44c","#9b5de5","#c8433e"][i];g.fillRect(hx-hw/2,h*.4,hw,h*.24);g.fillStyle="#7a2e2a";g.beginPath();g.moveTo(hx-hw/2-4,h*.4);g.lineTo(hx,h*.3);g.lineTo(hx+hw/2+4,h*.4);g.fill();g.fillStyle="#ffe08a";g.fillRect(hx-hw*.3,h*.46,hw*.22,hw*.22);g.fillRect(hx+hw*.08,h*.46,hw*.22,hw*.22)}
  /* het huis van de pakjes, groter, met kruis */var cx=w*.5,cy=h*.52;g.fillStyle="#c8433e";g.fillRect(cx-w*.09,cy-h*.1,w*.18,h*.26);g.fillStyle="#7a2e2a";g.beginPath();g.moveTo(cx-w*.11,cy-h*.1);g.lineTo(cx,cy-h*.24);g.lineTo(cx+w*.11,cy-h*.1);g.fill();g.fillRect(cx+w*.03,cy-h*.22,w*.03,h*.08);
  /* stippellijn van de schoorsteen naar het kruis */g.strokeStyle="#b3202a";g.lineWidth=3;g.setLineDash([6,6]);g.beginPath();g.moveTo(cx+w*.045,cy-h*.22);g.bezierCurveTo(cx+w*.2,cy-h*.35,w*.85,h*.2,w*.82,h*.5);g.bezierCurveTo(w*.8,h*.75,w*.3,h*.7,w*.22,h*.82);g.stroke();g.setLineDash([]);
  g.strokeStyle="#b3202a";g.lineWidth=5;g.beginPath();g.moveTo(w*.16,h*.76);g.lineTo(w*.28,h*.88);g.moveTo(w*.28,h*.76);g.lineTo(w*.16,h*.88);g.stroke();
  g.fillStyle="#1b2550";g.font="700 "+Math.round(h*.09)+"px 'Permanent Marker',cursive";g.textAlign="center";g.fillText("VERSTOPKAART",w*.5,h*.14);g.font="700 "+Math.round(h*.06)+"px Nunito,sans-serif";g.fillText("van Piet Pepernoot",w*.5,h*.21);
  g.font=Math.round(h*.07)+"px sans-serif";[["🎁",w*.08,h*.95],["🎁",w*.9,h*.93],["⭐",w*.75,h*.12],["🐴",w*.62,h*.9]].forEach(function(e){g.fillText(e[0],e[1],e[2])})}
function drawBack(g,x,y,w,h,i){g.save();g.fillStyle="#d9c59a";rr(g,x+2,y+2,w-4,h-4,6);g.fill();g.strokeStyle="#b89b5e";g.lineWidth=2;g.setLineDash([4,4]);rr(g,x+6,y+6,w-12,h-12,4);g.stroke();g.setLineDash([]);g.fillStyle="#8a6d3b";g.font="700 "+Math.round(h*.35)+"px Fredoka,sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText("?",x+w/2,y+h/2);g.restore()}
function drawKaart(cv,N,open,flipped){var g=cv.getContext("2d"),w=cv.width,h=cv.height,gd=grid(N),tw=w/gd.c,th=h/gd.r;g.clearRect(0,0,w,h);drawKaartBase(g,w,h);
  for(var i=0;i<N;i++){var x=(i%gd.c)*tw,y=Math.floor(i/gd.c)*th;if(!open[i]){g.fillStyle="#f3e4bf";g.fillRect(x,y,tw,th)}else if(!flipped[i])drawBack(g,x,y,tw,th,i);g.strokeStyle="rgba(120,90,40,.35)";g.lineWidth=2;g.strokeRect(x,y,tw,th)}}
function pieceThumb(cv,i){var N=NN(),gd=grid(N),g=cv.getContext("2d"),w=cv.width,h=cv.height,full=document.createElement("canvas");full.width=gd.c*160;full.height=gd.r*120;var fg=full.getContext("2d");drawKaartBase(fg,full.width,full.height);
  g.fillStyle="#fff";g.fillRect(0,0,w,h);g.save();g.translate(w/2,h/2);g.rotate(-.08);g.drawImage(full,(i%gd.c)*160,Math.floor(i/gd.c)*120,160,120,-w*.42,-h*.42,w*.84,h*.84);g.strokeStyle="#c9ab6a";g.lineWidth=3;g.setLineDash([5,4]);g.strokeRect(-w*.42,-h*.42,w*.84,h*.84);g.restore()}
function noteSheet(){var N=NN(),open=G.ph.slice(),all=[];for(var i=0;i<N;i++)all[i]=true;
  var solved=[];G.c.slots.forEach(function(s,i){if(G.ph[i])solved.push('<li>'+esc(ZBY[s.z].title)+(G.mode==="in"?' <small>'+esc(roomOf(s)[0])+'</small>':'')+'</li>')});
  sheet('<h2>'+T.notebook+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+'<canvas id="kaart" class="kaart" width="640" height="400"></canvas><p class="note small" style="text-align:center">'+esc(fill(X.noteLine,{i:done(),n:N,p:G.pep}))+'</p><div class="eyebrow">'+esc(T.nbZ)+'</div>'+(solved.length?'<ol class="ol">'+solved.join("")+'</ol>':'<p class="note">'+T.nbNone+'</p>')+
    '<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');MW.bindCodeBox($("#sheetBody"),L);drawKaart($("#kaart"),N,open,all);$("#shX").onclick=closeSheet}
function menuSheet(){var onMap=G&&G.mode==="map";sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button>'+(onMap?'<button type="button" class="btn ghost dk" id="mNoMap">'+T.kv.mNoMap+'</button>':'')+'<button type="button" class="btn ghost dk" id="mPar">'+T.mParent+'</button>'+(cur&&!$("#sheet").hidden?'':'')+'<button type="button" class="btn ghost dk" id="mSkip">'+T.mSkip+'</button><button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mNoMap"){closeSheet();dropMap()}else if(i==="mPar")parentSheet(closeSheet);else if(i==="mSkip")skipSheet();else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}
/* begeleider: de volgende open proef overslaan (achter de pincode) */
function skipSheet(){var i=G.i;while(i<NN()&&G.ph[i])i++;if(G.mode==="map"||G.mode==="demo"){var o=G.st.filter(function(s){return !s.done})[0];if(!o){toast(T.radarAll);return}i=o.fi}if(i>=NN()){toast(T.radarAll);return}
  var go=function(){closeSheet();cur={i:i,spot:G.st?G.st.filter(function(s){return s.fi===i})[0]:null,fails:0};G.hints[G.c.slots[i].z]=1;accept()};
  if(!PAR.pin)return confirmSheet(T.mSkip,fill(X.skipT,{i:i+1}),X.skipY,go);pinSheet(false,go)}

/* ---------- finale: de kaart omdraaien, Piet leest voor, de echte pakjes ---------- */
function toFinale(){if(!G)return;if(done()<NN()){toast(fill(T.finNot,{n:NN()-done()}));return noteSheet()}if(G.kaart)return letterSheet();kaartSheet()}
function kaartSheet(){var N=NN(),all=[];for(var i=0;i<N;i++)all[i]=true;if(G.flip.length<N)for(var k=0;k<N;k++)G.flip[k]=!!G.flip[k];
  sheet('<div class="eyebrow">'+esc(T.finH)+'</div><h2>'+esc(T.finH)+'</h2><p class="q">'+esc(T.finT)+'</p><canvas id="kaart" class="kaart tap" width="640" height="400"></canvas><p class="pzst" id="kMsg"></p><div id="kBtn"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  var cv=$("#kaart"),paint=function(){drawKaart(cv,N,all,G.flip);var n=G.flip.filter(Boolean).length;$("#kMsg").textContent=fill(X.flipped,{i:n,n:N});if(n>=N){$("#kBtn").innerHTML='<button type="button" class="btn" id="bFin">'+esc(T.finGo)+'</button>';$("#bFin").onclick=function(){G.kaart=1;save();SFX.win();letterSheet()}}};
  paint();say(T.finT);
  cv.addEventListener("pointerdown",function(e){var r=cv.getBoundingClientRect(),gd=grid(N),x=(e.clientX-r.left)/r.width*gd.c|0,y=(e.clientY-r.top)/r.height*gd.r|0,i=y*gd.c+x;if(i<0||i>=N||G.flip[i])return;G.flip[i]=true;save();SFX.tick();buzz(20);paint()});
  $("#shX").onclick=closeSheet}
function letterSheet(){var N=NN(),all=[];for(var i=0;i<N;i++)all[i]=true;
  sheet('<div class="eyebrow">'+esc(T.letH)+'</div>'+imgOf("finale")+'<canvas id="kaart" class="kaart" width="640" height="400"></canvas>'+bubble(D.LETTER,D.PIET,"big")+'<button type="button" class="btn red" id="bTr">'+esc(T.trH)+' ▸</button>',true);
  drawKaart($("#kaart"),N,all,all);say(D.LETTER);$("#bTr").onclick=function(){G.tEnd=G.tEnd||Date.now();save();treasureSheet()}}
function treasureSheet(){var spots=spotsReady(),k=G.found.length;
  if(!spots.length)spots=[D.DEFSPOT]; /* niets ingevuld: dan wijst de kaart naar de woonkamer */
  if(k>=spots.length)return win();
  var sp=spots[k],txt=(sp.what?"<b>"+esc(sp.what)+"</b>. ":"")+(sp.hint?esc(sp.hint):sp.where?esc(sp.where):"");
  sheet('<div class="eyebrow">'+esc(T.trH)+(spots.length>1?' · '+fill(X.of,{i:k+1,n:spots.length}):'')+'</div><div class="reward"><div class="big">🎁</div></div>'+bubble(X.onMap+txt,D.PIET,"big")+(sp.photo?'<div class="photo"><img src="'+sp.photo+'" alt=""></div>':'')+
    '<div id="trX"></div><button type="button" class="btn" id="trF">'+esc(T.trFound)+'</button>'+(sp.hint&&sp.where?'<button type="button" class="btn ghost dk sm" id="trH">'+esc(T.trHelp)+'</button>':''),true);
  say(X.onMap+(sp.what||"")+". "+(sp.hint||sp.where||""));
  var th=$("#trH");if(th)th.onclick=function(){G.hints.tr=1;save();th.disabled=true;$("#trX").innerHTML='<div class="fb hint">🤫 '+esc(fill(T.trExact,{w:sp.where}))+'</div>';say(fill(T.trExact,{w:sp.where}))};
  $("#trF").onclick=function(){G.found.push(k);save();SFX.win();buzz([80,40,80,40,200]);if(G.found.length<spots.length){toast(T.trMore);treasureSheet()}else win()}}

/* ---------- gewonnen ---------- */
var RES=null;
function win(){var min=((G.tEnd||Date.now())-G.t0)/60000,nh=Object.keys(G.hints).filter(function(k){return k!=="tr"}).length,stars=nh===0?3:nh<=2?2:1,xp=100+stars*50;
  MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:X.title,code:G.code});
  Wk.stopWatch();buzz([100,50,100,50,300]);
  RES={code:G.code,stars:stars,min:Math.round(min),team:NAME,photo:G.photo,wrong:G.wrong,hints:nh,lvl:lvI(),N:NN(),pep:G.pep};
  LS.set("ss_pa_last",RES);winBack()}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div>'+bubble(D.SINTTXT,D.SINT,"big",SINTAV)+'<div class="stars">'+"★".repeat(r.stars)+"☆".repeat(3-r.stars)+'</div><h2>'+esc(r.team||X.teamDef)+'</h2>'+
    '<div class="tags"><i>'+r.min+' min</i><i>'+esc(fill(X.pieces,{n:r.N}))+'</i><i>🥜 '+r.pep+'</i><i>'+(r.hints?fill(r.hints>1?X.hintsN:X.hint1,{n:r.hints}):X.noHints)+'</i></div>'+(r.stars<3?'<p class="note">'+T.missed1+'</p>':'')+
    '<button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  say(D.SINTTXT);$("#vDip").onclick=dipShow;
  var txt=fill(T.shareTxt,{c:r.code,s:"★".repeat(r.stars),m:r.min})+location.origin+location.pathname+"#z="+r.code;
  $("#vShare").onclick=function(){if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
function endCase(){LS.del(GK);G=null;hush();home()}
function a4Sheet(title,note,fname,drawFn,back){sheet('<h2>'+esc(title)+'</h2><p class="note">'+esc(note)+'</p><canvas id="a4" width="1240" height="1754" class="a4"></canvas><button type="button" class="btn" id="a4Dl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="a4Pr">'+esc(X.print)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  var cv=$("#a4");drawFn(cv);$("#a4Dl").onclick=function(){var a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download=fname+".png";document.body.appendChild(a);a.click();a.remove()};
  $("#a4Pr").onclick=function(){document.body.classList.add("printA4");window.print();setTimeout(function(){document.body.classList.remove("printA4")},500)};
  $("#shX").onclick=back||closeSheet;if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(cv.isConnected)drawFn(cv)})}
function dipShow(){a4Sheet(T.dipH,T.dipNote,X.dipFile,function(cv){drawDiploma(cv,RES)},winBack)}
function fitText(g,t,x,y,maxW,size,font){g.font=font.replace("{s}",size+"px");while(g.measureText(t).width>maxW&&size>16){size-=2;g.font=font.replace("{s}",size+"px")}g.fillText(t,x,y)}
function drawDiploma(cv,r){var g=cv.getContext("2d"),W2=cv.width,H=cv.height;
  g.fillStyle="#fff6e5";g.fillRect(0,0,W2,H);g.strokeStyle="#c8433e";g.lineWidth=22;g.strokeRect(40,40,W2-80,H-80);g.strokeStyle="#f2b705";g.lineWidth=5;g.strokeRect(74,74,W2-148,H-148);
  /* mijter */g.save();g.translate(W2/2,300);g.fillStyle="#c8433e";g.beginPath();g.moveTo(-110,90);g.lineTo(0,-120);g.lineTo(110,90);g.closePath();g.fill();g.strokeStyle="#f2b705";g.lineWidth=12;g.beginPath();g.moveTo(0,-100);g.lineTo(0,80);g.moveTo(-70,0);g.lineTo(70,0);g.stroke();g.fillStyle="#f2b705";g.fillRect(-116,86,232,22);g.restore();
  g.textAlign="center";g.fillStyle="#b3202a";g.font="600 30px Fredoka,sans-serif";g.fillText(X.dTop,W2/2,170);
  g.fillStyle="#1b2550";g.font="700 84px Fredoka,sans-serif";g.fillText(X.dTitle,W2/2,540);
  g.fillStyle="#39436a";g.font="500 34px Nunito,sans-serif";g.fillText(X.dIntro,W2/2,630);
  g.fillStyle="#1b2550";fitText(g,r.team||X.dTeam,W2/2,730,W2-260,74,"700 {s} Fredoka,sans-serif");
  g.fillStyle="#39436a";g.font="500 32px Nunito,sans-serif";g.fillText(fill(X.dL1,{n:r.N}),W2/2,840);
  g.fillText(fill(X.dL2,{m:r.min,p:r.pep,h:(r.hints?fill(r.hints>1?X.hintsN:X.hint1,{n:r.hints}):X.noHints2),l:T.lvl[r.lvl]}),W2/2,890);
  g.fillText(X.dL3,W2/2,940);
  g.fillStyle="#f2b705";g.font="700 70px Fredoka,sans-serif";g.fillText("★".repeat(r.stars)+"☆".repeat(3-r.stars),W2/2,1050);
  var d=new Date();g.fillStyle="#39436a";g.font="500 30px Nunito,sans-serif";g.fillText(d.toLocaleDateString(L==="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"}),W2/2,1120);
  g.fillStyle="#b3202a";g.font="400 56px 'Permanent Marker',cursive";g.save();g.translate(W2/2,1290);g.rotate(-.03);g.fillText(X.dSign1,0,0);g.restore();g.font="400 36px 'Permanent Marker',cursive";g.fillText(X.dSign2,W2/2,1350);
  g.font="60px sans-serif";["🎁","🥕","👢","🐴","⭐","🎁"].forEach(function(e,i){g.fillText(e,200+i*170,1480)});
  if(ok("diploma-stempel")){g.save();g.translate(W2-235,295);g.rotate(.14);g.globalAlpha=.95;g.drawImage(IM["diploma-stempel"],-110,-110,220,220);g.restore()}
  g.fillStyle="#9aa3c0";g.font="500 24px Nunito,sans-serif";g.fillText(X.dFoot+r.code,W2/2,H-120)}

/* ---------- zaakcode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;var go=function(){var c=parseCode($("#dCode").value);if(!c){$("#dMsg").textContent=T.dBad;return}closeSheet();if(locked())return proSheet();
    PEND={lvl:c.lvl};LVL=c.lvl;LS.set("ss_pa_lvl",LVL);begin(c.seed,c.mode,false,c.len)};
  $("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()};$("#dCode").focus()}
function archSheet(){var g=MW.profile.get().games.pa,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
  sheet('<h2>'+esc(X.archH)+'</h2>'+(log.length?'<div class="list">'+log.map(function(r){return '<button type="button" class="sus" data-c="'+esc(r.c)+'"><b>'+esc(r.d)+' · '+st(r.st)+'</b><small>'+esc(fill(X.archRow,{m:r.m,c:r.c}))+'</small></button>'}).join("")+'</div>':'<p class="note">'+esc(X.archNone)+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();KM.leave();G=null;hush();home()}
function wipeGame(){Wk.stopWatch();KM.leave();LS.del(GK);G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);LS.del("ss_pa_last");LS.del(PK);PAR={pin:"",spots:[]};MW.profile.wipe();closeSheet();home();toast(T.wiped)})}}
window.addEventListener("popstate",function(){if(!$("#sheet").hidden){closeSheet();history.pushState(null,"");return}if(!$("#brief").hidden){G=null;home();history.pushState(null,"");return}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);history.pushState(null,"")}});
history.pushState(null,"");
(function(){var lb=$("#lang");if(lb)lb.onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")}})();
if(/debug/.test(location.search))window.PA_DBG={G:function(){return G},Z:ZBY,accept:function(){accept()},cur:function(){return cur},par:function(){return PAR},task:function(i){taskSheet(i)}};
home();
var m=/[#&]z=([A-Za-z0-9]+)/.exec(location.hash);if(m)setTimeout(function(){codeSheet(m[1])},300);
})();
