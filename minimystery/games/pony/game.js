/* Het Geheim van Pony Pluis / The Secret of Pony Fluff – kinderwandeling voor feestjes (manege, dieren-getuigen). Spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js, walk.js en PP_DATA (data-xx.js). Geen beeldherkenning: de twee foto's (clubfoto, foto met Pluis) zijn souvenirs.
   Zaak: Pluis is weg, het hek stond open. Acht sporen, elk een manege-puzzel: hoefspoor, verrekijker, roskam, appels tellen, halster, glimmertjes, kat aaien, de wei door.
   Per spoor: bewijs (3x, altijd waar, wijst een kenmerk van de plek aan), een dier-getuige (4x, één zit ernaast) of een berichtje van Fenna (1x).
   Drie kenmerken (vlag, dieren, lekkers) wijzen precies één van vijf plekken aan waar Bibi logeert. Daar is Pluis. Daarna: het geheim (Kato vertelt), de keuze, paspoort.
   Niveaus: "veulen" (makkelijk) en "ruiter" (pittiger: één dier liegt, puzzels langer). Standen: "map", "demo", "street", "in". De telefoon leest voor. */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.PP_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="pp",GK="ss_game_pp_"+L,WK="ss_ways_pp_"+L,hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz,beep=Wk.beep;function closeSheet(){mg.stop();hush();Wk.closeSheet()}
var G=null,tick=0,MODE=LS.get("ss_pp_mode","map"),NAME=LS.get("ss_pp_name",""),VOICE=LS.get("ss_pp_voice",true),LEVEL=LS.get("ss_pp_level","veulen"),LEN=LS.get("ss_pp_len","normaal");
/* lengte: Kort 5, Normaal 8 (zoals altijd), Lang 11 plekken. Zit in de zaakcode (PP5… = kort, PPL… = lang, oude codes PPK/PPS/PPB = normaal) */
var LENS={kort:5,normaal:8,lang:11};if(!LENS[LEN])LEN="normaal";
var ATK=["vlag","dier","voer"],NS=5,ALL=31,ACTS=["hoof","look","brush","apples","halter","shiny","pet","maze","sound","jump","pairs","braid"];
/* fotomomenten tussendoor (na zoveel sporen), per lengte */
var POSE_AT={5:[3],8:[4],11:[4,8]};
function NN(){return (G&&G.n)||8}
function lenOf(n){return n===5?"kort":n===11?"lang":"normaal"}
var W=[],P={x:0,y:0,acc:0},R0=550,map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null,photoFor=null;
var lastFix=0,GL={on:false,t0:0,x:0,y:0,dir:1,next:0};
var mg={raf:0,tm:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[]}};
var COL=["#e76f51","#f4c20d","#6ec3ff","#ff8fab"],FLAGC=["#e63946","#2a9d4b","#f4c20d"],RINGC=["#e63946","#2563eb","#f4c20d","#22c55e"],GRASS="#8fd47a",SKY="#9ad7ff";
function hard(){return LEVEL==="ruiter"}

/* ---------- hulpjes ---------- */
function bits(m){var n=0;while(m){n+=m&1;m>>=1}return n}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function ico(id,cls){return '<svg class="'+(cls||"ico")+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(D.ICON[id]||"M4 4h16v16H4z")+'"/></svg>'}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function pony(){return NAME?fill(D.CADEAU,{J:NAME}):D.CADEAU0}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function star(g,cx,cy,R,r,n){n=n||5;g.beginPath();for(var i=0;i<n*2;i++){var a=-Math.PI/2+i*Math.PI/n,rad=i%2?r:R;g.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad)}g.closePath()}
/* voorlezen */
/* voorlezen: opnames (shared/voice.js, games/pony/voice) met de browserstem als vangnet */
if(window.MMVoice)MMVoice.init("pony",L);
function say(t){if(!VOICE||!t)return;if(window.MMVoice)return MMVoice.say(t);try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(String(t).replace(/[“”"]/g,"").replace(/\{[^}]+\}/g,""));u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.92;u.pitch=1.08;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
function bubble(txt,who,cls,av){return '<div class="msg '+(cls||"")+'">'+(av||FENNA())+'<div class="bub"><button type="button" class="spk" aria-label="'+esc(T.listen)+'" data-say="'+esc(txt)+'">🔊</button>'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+esc(txt)+'</p></div></div>'}
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){var v=VOICE;VOICE=true;say(b.dataset.say);VOICE=v}});

/* ---------- plaatjes (Kellie's artwork, games/pony/img): als een plaatje er is, wint het van de canvas-tekening ---------- */
var IMGROOT=MW.root+"games/pony/img/",IM={};
["fenna-talk","fenna-happy","fenna-head","pluis","pluis-walk","pluis-bibi","bibi","wit-goat","wit-duck","wit-dog","wit-cat","wit-crow","kids-row","hero","icon-shoe",
 "place-0","place-1","place-2","place-3","place-4","place-5","place-6","place-7","flag-0","flag-1","flag-2","dier-0","dier-1","dier-2","voer-0","voer-1","voer-2"].forEach(function(k){var im=new Image();im.src=IMGROOT+k+".webp";IM[k]=im});
function ok(k){var im=IM[k];return !!(im&&im.complete&&im.naturalWidth)}
var IMREADY=Promise.all(Object.keys(IM).map(function(k){return new Promise(function(res){var im=IM[k];if(im.complete)return res();im.onload=im.onerror=function(){res()}})}));
var imReady=function(){return Promise.race([IMREADY,new Promise(function(res){setTimeout(res,2500)})])};
function imgAt(g,k,x,y,h,al,anchorBottom){var im=IM[k];if(!ok(k))return false;var w=h*im.naturalWidth/im.naturalHeight;g.save();g.globalAlpha=al==null?1:al;g.drawImage(im,x-w/2,anchorBottom===false?y-h/2:y-h,w,h);g.restore();return true}

/* ---------- figuren tekenen: pony's, dieren, Fenna, plekken ---------- */
/* pony: (x,y) = midden onder de hoeven, h = schofthoogte. o={bibi, halter:[ringkleur-indexen], flip, al, walk(fase), star} */
function drawPony(g,x,y,h,o){o=o||{};var s=h/100;g.save();g.globalAlpha=o.al==null?1:o.al;g.translate(x,y);g.scale(o.flip?-s:s,s);
  var coat=o.bibi?"#fdfdfd":"#d9a066",dark=o.bibi?"#2b2b2b":"#8a5a2b",mane=o.bibi?"#2b2b2b":"#fff6e0",ph=o.walk||0,sw=Math.sin(ph)*7;
  g.lineWidth=1.4;g.strokeStyle="rgba(0,0,0,.35)";
  /* schaduw */g.fillStyle="rgba(0,0,0,.2)";g.beginPath();g.ellipse(2,0,40,6,0,0,7);g.fill();
  /* staart */g.strokeStyle=mane;g.lineWidth=7;g.lineCap="round";g.beginPath();g.moveTo(-32,-62);g.quadraticCurveTo(-48,-50,-42,-18+sw*.4);g.stroke();g.lineWidth=1.4;g.strokeStyle="rgba(0,0,0,.35)";
  /* achterpoten */g.fillStyle=coat;rr(g,-30-sw*.3,-48,9,46,4);g.fill();g.stroke();rr(g,-18+sw*.3,-48,9,46,4);g.fill();g.stroke();
  /* voorpoten */rr(g,10+sw*.3,-48,9,46,4);g.fill();g.stroke();rr(g,22-sw*.3,-48,9,46,4);g.fill();g.stroke();
  /* hoeven */g.fillStyle="#3b2a14";[[-30-sw*.3],[-18+sw*.3],[10+sw*.3],[22-sw*.3]].forEach(function(p){rr(g,p[0]-1,-7,11,7,2);g.fill()});
  /* lijf */g.fillStyle=coat;g.beginPath();g.ellipse(0,-58,36,21,0,0,7);g.fill();g.stroke();
  if(o.bibi){g.fillStyle=dark;g.beginPath();g.ellipse(-14,-62,12,9,.3,0,7);g.fill();g.beginPath();g.ellipse(14,-52,9,7,-.4,0,7);g.fill()}
  /* hals */g.fillStyle=coat;g.beginPath();g.moveTo(16,-74);g.quadraticCurveTo(30,-96,40,-104);g.lineTo(50,-94);g.quadraticCurveTo(40,-80,30,-58);g.closePath();g.fill();g.stroke();
  /* manen */g.fillStyle=mane;for(var i=0;i<5;i++){g.beginPath();g.arc(20+i*6,-80-i*6,6.5,0,7);g.fill()}
  /* hoofd */g.fillStyle=coat;g.save();g.translate(50,-98);g.rotate(.35);g.beginPath();g.ellipse(0,0,17,11,0,0,7);g.fill();g.stroke();g.restore();
  /* snuit */g.fillStyle=o.bibi?"#e5e5e5":"#f3d9b8";g.beginPath();g.ellipse(62,-91,8,6,.3,0,7);g.fill();g.fillStyle="#3b2a14";g.beginPath();g.arc(64,-93,1.3,0,7);g.fill();
  /* oren */g.fillStyle=coat;g.beginPath();g.moveTo(40,-108);g.lineTo(44,-120);g.lineTo(49,-108);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(48,-109);g.lineTo(53,-120);g.lineTo(57,-108);g.closePath();g.fill();g.stroke();
  /* oog */g.fillStyle="#fff";g.beginPath();g.arc(52,-100,3.6,0,7);g.fill();g.fillStyle="#1e1e2e";g.beginPath();g.arc(53,-100,2.2,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.arc(53.8,-100.8,.8,0,7);g.fill();
  /* ster (Pluis) */if(!o.bibi&&o.star!==false){g.fillStyle="#fff";star(g,45,-104,4.5,2,5);g.fill()}
  /* halster */if(o.halter){g.strokeStyle="#5b3a1e";g.lineWidth=2.2;g.beginPath();g.moveTo(56,-100);g.lineTo(58,-84);g.moveTo(42,-96);g.lineTo(60,-90);g.moveTo(44,-104);g.quadraticCurveTo(38,-96,42,-88);g.stroke();
    o.halter.forEach(function(c,i){g.fillStyle=RINGC[c];g.beginPath();g.arc(44+i*8,-88+i*1.5,3.3,0,7);g.fill();g.strokeStyle="rgba(0,0,0,.4)";g.lineWidth=1;g.stroke()})}
  g.restore()}
/* dierenkop voor avatars en puzzels: (cx,cy) midden, r straal */
function drawAnimal(g,kind,cx,cy,r){g.save();g.translate(cx,cy);g.scale(r/30,r/30);g.lineWidth=1.3;g.strokeStyle="rgba(0,0,0,.35)";
  var eyes=function(dx,dy,s){g.fillStyle="#fff";g.beginPath();g.arc(-dx,dy,s,0,7);g.arc(dx,dy,s,0,7);g.fill();g.fillStyle="#111";g.beginPath();g.arc(-dx+1,dy,s*.55,0,7);g.arc(dx+1,dy,s*.55,0,7);g.fill()};
  if(kind==="goat"){g.fillStyle="#d8d2c4";g.beginPath();g.moveTo(-16,-14);g.lineTo(-22,-30);g.lineTo(-10,-18);g.moveTo(16,-14);g.lineTo(22,-30);g.lineTo(10,-18);g.fill();g.beginPath();g.ellipse(0,0,22,24,0,0,7);g.fill();g.stroke();g.fillStyle="#bfb7a6";g.beginPath();g.ellipse(-24,-4,7,4,.4,0,7);g.ellipse(24,-4,7,4,-.4,0,7);g.fill();g.fillStyle="#d8d2c4";g.beginPath();g.moveTo(-6,20);g.lineTo(0,34);g.lineTo(6,20);g.fill();eyes(8,-4,4.5);g.fillStyle="#c08a8a";g.beginPath();g.ellipse(0,12,5,3.5,0,0,7);g.fill()}
  else if(kind==="duck"){g.fillStyle="#f4c20d";g.beginPath();g.arc(0,0,23,0,7);g.fill();g.stroke();g.fillStyle="#f28c28";g.beginPath();g.ellipse(14,8,14,6,0,0,7);g.fill();g.stroke();eyes(6,-6,4.2)}
  else if(kind==="dog"){g.fillStyle="#b5651d";g.beginPath();g.ellipse(-20,-6,8,16,.2,0,7);g.ellipse(20,-6,8,16,-.2,0,7);g.fill();g.stroke();g.fillStyle="#d08a4a";g.beginPath();g.ellipse(0,0,22,23,0,0,7);g.fill();g.stroke();g.fillStyle="#f3e0c8";g.beginPath();g.ellipse(0,10,11,9,0,0,7);g.fill();g.fillStyle="#222";g.beginPath();g.ellipse(0,7,5,3.5,0,0,7);g.fill();eyes(8,-5,4.2);g.strokeStyle="#7a3b2e";g.lineWidth=1.6;g.beginPath();g.arc(0,12,5,.3,2.85);g.stroke()}
  else if(kind==="cat"){g.fillStyle="#8a8f99";g.beginPath();g.moveTo(-20,-10);g.lineTo(-18,-30);g.lineTo(-4,-18);g.moveTo(20,-10);g.lineTo(18,-30);g.lineTo(4,-18);g.fill();g.stroke();g.beginPath();g.ellipse(0,0,23,21,0,0,7);g.fill();g.stroke();g.fillStyle="#9be0a5";g.beginPath();g.ellipse(-8,-3,5,4,0,0,7);g.ellipse(8,-3,5,4,0,0,7);g.fill();g.fillStyle="#111";g.beginPath();g.ellipse(-8,-3,1.6,3.6,0,0,7);g.ellipse(8,-3,1.6,3.6,0,0,7);g.fill();g.fillStyle="#f0a5b0";g.beginPath();g.moveTo(-3,6);g.lineTo(3,6);g.lineTo(0,9);g.fill();g.strokeStyle="#333";g.lineWidth=1;[[-6,8,-24,6],[-6,10,-24,12],[6,8,24,6],[6,10,24,12]].forEach(function(l){g.beginPath();g.moveTo(l[0],l[1]);g.lineTo(l[2],l[3]);g.stroke()})}
  else if(kind==="crow"){g.fillStyle="#2b2b36";g.beginPath();g.arc(0,0,22,0,7);g.fill();g.stroke();g.fillStyle="#555";g.beginPath();g.moveTo(10,0);g.lineTo(32,6);g.lineTo(10,10);g.fill();g.stroke();g.fillStyle="#fff";g.beginPath();g.arc(4,-6,5,0,7);g.fill();g.fillStyle="#111";g.beginPath();g.arc(5,-6,2.5,0,7);g.fill();g.fillStyle="#f4c20d";g.beginPath();g.arc(-8,-10,2,0,7);g.fill()}
  else if(kind==="rabbit"){g.fillStyle="#e8d9c8";g.beginPath();g.ellipse(-8,-24,5,14,0,0,7);g.ellipse(8,-24,5,14,0,0,7);g.fill();g.stroke();g.beginPath();g.ellipse(0,0,20,19,0,0,7);g.fill();g.stroke();eyes(7,-3,3.6);g.fillStyle="#f0a5b0";g.beginPath();g.moveTo(-3,6);g.lineTo(3,6);g.lineTo(0,9);g.fill()}
  g.restore()}
function drawFenna(g,cx,cy,r){g.save();g.translate(cx,cy);g.scale(r/30,r/30);g.lineWidth=1.3;g.strokeStyle="rgba(0,0,0,.35)";
  g.fillStyle="#c8572f";g.beginPath();g.arc(0,-2,24,0,7);g.fill();g.fillStyle="#f5c9a3";g.beginPath();g.ellipse(0,2,19,21,0,0,7);g.fill();g.stroke();
  g.fillStyle="#c8572f";g.beginPath();g.ellipse(-22,10,5,16,.2,0,7);g.ellipse(22,10,5,16,-.2,0,7);g.fill();
  g.fillStyle="#2a9d4b";g.beginPath();g.arc(0,-10,22,Math.PI,0);g.closePath();g.fill();g.stroke();rr(g,-26,-12,52,6,3);g.fill();g.stroke();
  g.fillStyle="#fff";g.beginPath();g.arc(-7,2,4,0,7);g.arc(7,2,4,0,7);g.fill();g.fillStyle="#2b2b36";g.beginPath();g.arc(-6,2,2.2,0,7);g.arc(8,2,2.2,0,7);g.fill();
  g.strokeStyle="#7a3b2e";g.lineWidth=1.8;g.beginPath();g.arc(0,8,7,.3,2.85);g.stroke();g.fillStyle="#f28c8c";g.beginPath();g.arc(-12,9,3,0,7);g.arc(12,9,3,0,7);g.fill();g.restore()}
/* plek waar Bibi kan logeren: kaartje met vlag, dieren en lekkers. (x,y) linksboven, w×h */
/* plek uit lagen (Kellie's artwork): place-N achtergrond 1600x1000, vlag rechtsboven aan de paal, dieren rechtsonder, lekkers linksonder */
function placeArt(g,w,h,tr,idx){if(!ok("place-"+(idx%8))||!ok("flag-"+tr.vlag)||!ok("dier-"+tr.dier)||!ok("voer-"+tr.voer))return false;
  var lay=function(k,cx,cy,hh){var im=IM[k],ww=hh*im.naturalWidth/im.naturalHeight;g.drawImage(im,cx-ww/2,cy-hh/2,ww,hh)};
  var bgi=IM["place-"+(idx%8)],iw=bgi.naturalWidth,ih=bgi.naturalHeight,ta=w/h,FX=[.22,.18,.12,.2,.12,.15,.25,.18];
  if(iw/ih>ta){var sw=ih*ta;g.drawImage(bgi,(iw-sw)*FX[idx%8],0,sw,ih,0,0,w,h)}else{var sh=iw/ta;g.drawImage(bgi,0,(ih-sh)/2,iw,sh,0,0,w,h)}
  g.fillStyle="rgba(0,0,0,.18)";g.beginPath();g.ellipse(w*.72,h*.93,w*.17,h*.04,0,0,7);g.fill();
  lay("flag-"+tr.vlag,w*.87,h*.42,h*.66);lay("voer-"+tr.voer,w*.16,h*.82,h*.3);lay("dier-"+tr.dier,w*.68,h*.78,h*.36);return true}
function drawPlace(g,x,y,w,h,tr,idx,done){g.save();g.translate(x,y);g.beginPath();rr(g,0,0,w,h,w*.06);g.clip();
  if(placeArt(g,w,h,tr,idx)){if(done){g.fillStyle="rgba(0,0,0,.35)";g.fillRect(0,0,w,h)}g.restore();return}
  var sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(1,"#d8f0ff");g.fillStyle=sky;g.fillRect(0,0,w,h);
  g.fillStyle="#fde047";g.beginPath();g.arc(w*.85,h*.18,h*.09,0,7);g.fill();
  g.fillStyle="#a8e08a";g.beginPath();g.ellipse(w*.3,h*.62,w*.6,h*.2,0,0,7);g.ellipse(w*.9,h*.66,w*.5,h*.22,0,0,7);g.fill();g.fillStyle=GRASS;g.fillRect(0,h*.64,w,h*.36);
  /* gebouwtje per plek */var B=["#e63946","#f4a261","#8ecae6","#cdb4db","#e76f51","#90be6d","#ffb703","#f8edeb"][idx%8],bx=w*.08,bw=w*.42,bh=h*.3,by=h*.64-bh;
  g.fillStyle=B;g.fillRect(bx,by,bw,bh);g.fillStyle="#7a3b2e";g.beginPath();g.moveTo(bx-w*.02,by);g.lineTo(bx+bw/2,by-bh*.6);g.lineTo(bx+bw+w*.02,by);g.closePath();g.fill();
  g.fillStyle="#3b2a14";g.fillRect(bx+bw*.38,by+bh*.4,bw*.24,bh*.6);g.fillStyle="#fff";g.fillRect(bx+bw*.1,by+bh*.2,bw*.18,bh*.25);
  /* hek */g.fillStyle="#f5efe0";for(var i=0;i<5;i++){g.fillRect(w*.56+i*w*.1,h*.52,w*.025,h*.14)}g.fillRect(w*.56,h*.56,w*.42,h*.025);g.fillRect(w*.56,h*.62,w*.42,h*.025);
  /* vlag */g.strokeStyle="#5b3a1e";g.lineWidth=Math.max(2,w*.012);g.beginPath();g.moveTo(w*.62,h*.52);g.lineTo(w*.62,h*.12);g.stroke();g.fillStyle=FLAGC[tr.vlag];g.beginPath();g.moveTo(w*.62,h*.12);g.lineTo(w*.84,h*.19);g.lineTo(w*.62,h*.27);g.closePath();g.fill();g.strokeStyle="rgba(0,0,0,.3)";g.lineWidth=1;g.stroke();
  /* dieren */var kind=["duck","goat","rabbit"][tr.dier];drawAnimal(g,kind,w*.62,h*.8,h*.085);drawAnimal(g,kind,w*.78,h*.84,h*.075);
  /* lekkers */var fx=w*.22,fy=h*.86;if(tr.voer===0){g.fillStyle="#f28c28";for(i=0;i<4;i++){g.save();g.translate(fx+i*w*.055,fy);g.rotate(.5-i*.3);g.beginPath();g.moveTo(-w*.02,-h*.02);g.lineTo(w*.02,-h*.02);g.lineTo(0,h*.09);g.closePath();g.fill();g.fillStyle="#2a9d4b";g.fillRect(-w*.01,-h*.05,w*.02,h*.03);g.fillStyle="#f28c28";g.restore()}}
  else if(tr.voer===1){g.fillStyle="#e63946";[[0,0],[w*.06,h*.01],[w*.03,-h*.06],[w*.09,-h*.05]].forEach(function(p){g.beginPath();g.arc(fx+p[0],fy+p[1],h*.035,0,7);g.fill()})}
  else{g.fillStyle="#f4c20d";g.beginPath();g.ellipse(fx+w*.05,fy,w*.09,h*.06,0,0,7);g.fill();g.strokeStyle="#d9a500";g.lineWidth=1;for(i=0;i<6;i++){g.beginPath();g.moveTo(fx-w*.02+i*w*.025,fy+h*.04);g.lineTo(fx+i*w*.025,fy-h*.05);g.stroke()}}
  if(done){g.fillStyle="rgba(0,0,0,.35)";g.fillRect(0,0,w,h)}
  g.restore()}
function placeURL(tr,idx,w){w=w||300;var cv=document.createElement("canvas");cv.width=w;cv.height=Math.round(w*(ok("place-0")?.5:.72));drawPlace(cv.getContext("2d"),0,0,cv.width,cv.height,tr,idx);return cv.toDataURL("image/png")}
function drawShoe(g,x,y,r,col,on){g.save();g.strokeStyle=col;g.lineWidth=r*.42;g.lineCap="round";g.globalAlpha=on?1:.35;g.beginPath();g.arc(x,y,r,Math.PI*.85,Math.PI*2.15);g.stroke();g.restore()}
function drawHoofPrint(g,x,y,r,col){g.save();g.fillStyle=col||"#5b3a1e";g.beginPath();g.ellipse(x,y,r*.95,r,0,0,7);g.fill();g.fillStyle="rgba(255,255,255,.6)";g.beginPath();g.ellipse(x,y+r*.25,r*.55,r*.45,0,0,7);g.fill();g.fillStyle=col||"#5b3a1e";g.fillRect(x-r*.1,y-r*.2,r*.2,r*.6);g.restore()}
var AVC={};
function avURL(kind){if(AVC[kind])return AVC[kind];var cv=document.createElement("canvas");cv.width=cv.height=96;var g=cv.getContext("2d");if(kind==="fenna")drawFenna(g,48,52,40);else drawAnimal(g,kind,48,52,38);return AVC[kind]=cv.toDataURL("image/png")}
function FENNA(){return '<span class="avatar fenna" aria-hidden="true" style="background-image:url('+(ok("fenna-head")?IMGROOT+"fenna-head.webp":avURL("fenna"))+')"></span>'}
function witAv(kind){return '<span class="avatar wit" aria-hidden="true" style="background-image:url('+(ok("wit-"+kind)?IMGROOT+"wit-"+kind+".webp":avURL(kind))+')"></span>'}
function witKind(name){var w=D.WITS.filter(function(x){return x[0]===name})[0];return w?w[2]:"dog"}
var ICONIMG={};function icoImg(id,cls){return ico(id,cls)}

/* ---------- zaakgenerator ---------- */
function genCase(seed,mode,n){n=n||8;
  var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  for(var tries=0;tries<4000;tries++){
    var pool=shuffle(D.SUS.map(function(s,i){return{s:s,i:i}}),r).slice(0,NS),sus=pool.map(function(p){var tr={};ATK.forEach(function(k){tr[k]=Math.floor(r()*3)});return{name:p.s[0],rel:p.s[1],idx:p.i,tr:tr}});
    var K=Math.floor(r()*NS);
    var ev=ATK.map(function(k){var v=sus[K].tr[k],m=0;sus.forEach(function(s,j){if(s.tr[k]===v)m|=1<<j});return{k:k,v:v,m:m}});
    if(ev.some(function(x){return bits(x.m)<2}))continue;
    if(ev.reduce(function(a,x){return a&x.m},ALL)!==1<<K)continue;
    if(tries<2500&&(bits(ev[0].m&ev[1].m)<2||bits(ev[0].m&ev[2].m)<2||bits(ev[1].m&ev[2].m)<2))continue;
    var dup=false;sus.forEach(function(a,i){sus.forEach(function(b,j){if(i<j&&a.tr.vlag===b.tr.vlag&&a.tr.dier===b.tr.dier&&a.tr.voer===b.tr.voer)dup=true})});if(dup)continue;
    var wits=shuffle(D.WITS,r).slice(0,4),Li=Math.floor(r()*4),claims=[0,1,2,3].map(function(i){var k=ATK[i%3],v=sus[K].tr[k];if(i===Li)v=(v+1+Math.floor(r()*2))%3;return{k:k,v:v,lie:i===Li,t:pick(D.WIT[k]),who:wits[i][0],rel:wits[i][1],kind:wits[i][2]}});
    var halter=[0,1,2,3].map(function(){return Math.floor(r()*4)});
    /* alles hierboven trekt precies zoals vroeger uit r, zodat oude zaakcodes dezelfde oplossing houden. Nieuw spul komt uit een eigen generator r2. */
    var r2=rngOf((seed^0x5eed1)>>>0),ord;
    if(n===5){var oth=(Li+1+Math.floor(r2()*3))%4,pr=r2()<.5?[Li,oth]:[oth,Li];ord=["e0","w"+pr[0],"e1","w"+pr[1],"e2"]}
    else if(n===11)ord=["e0","w0","e1","w1","g","e2","w2","x0","w3","g","x1"];
    else ord=["e0","w0","e1","w1","e2","w2","g","w3"];
    var acts=shuffle(ACTS,r2).slice(0,n),usedGag=[],exs=shuffle([0,1,2,3,4].filter(function(j){return j!==K}),r2);
    var slots=ord.map(function(o,i){var act=acts[i],p=D.PUZ[act],s={act:act,id:act,what:p[0],ask:p[1],react:p[2]};
      if(o==="g"){s.kind="gag";var t=pick(D.GAG),guard=0;while(usedGag.indexOf(t)>=0&&guard++<20)t=D.GAG[Math.floor(r2()*D.GAG.length)];usedGag.push(t);s.t=t}
      else if(o[0]==="e"){var e=ev[+o[1]];s.kind="ev";s.k=e.k;s.v=e.v;s.t=pick(D.EV[e.k][e.v])}
      else if(o[0]==="x"){s.kind="ex";s.j=exs[+o[1]];s.t=D.EX[Math.floor(r2()*D.EX.length)]}
      else{s.kind="claim";s.w=+o[1]}
      return s});
    var gold=[];for(var gi=0;gi<n;gi++)gold.push(1+Math.floor(r2()*9));
    return{sus:sus,K:K,claims:claims,Li:Li,slots:slots,ev:ev,halter:halter,gold:gold}
  }
  return null}
function makeCode(seed,mode,n){return"PP"+(n===5?"5":n===11?"L":"")+(mode==="in"?"B":mode==="map"||mode==="demo"?"K":"S")+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v),m=/^PP([5L]?)([KSB])([0-9A-Z]{1,7})$/.exec(c);if(!m)return null;var seed=parseInt(m[3],36);if(!(seed>=0)||seed>4294967295)return null;
  return{mode:m[2]==="B"?"in":m[2]==="K"?"map":"street",seed:seed,n:m[1]==="5"?5:m[1]==="L"?11:8}}
/* oude bewaarde zaken (van vóór lengte, gouden cijfers en album) netjes aanvullen */
function fixG(g){if(!g||!g.c)return null;var c=g.c;if(!c.slots||!c.slots.length)return null;g.n=g.n||c.slots.length||8;
  if(!c.gold||c.gold.length<g.n){var r2=rngOf((g.seed^0x601d)>>>0);c.gold=[];for(var i=0;i<g.n;i++)c.gold.push(1+Math.floor(r2()*9))}
  if(!Array.isArray(g.ph))g.ph=[];if(!Array.isArray(g.album))g.album=[];if(!g.poses)g.poses={};if(g.st&&g.st.length<g.n)g.n=Math.max(g.st.length,1);
  c.slots.forEach(function(s){if(!PUZ[s.act]){s.act=s.id="hoof"}});return g}
function vars(){var c=G.c,k=c.sus[c.K];return{P:k.name,PV:D.AT.vlag.v[k.tr.vlag],PD:D.AT.dier.v[k.tr.dier],PE:D.AT.voer.v[k.tr.voer],J:NAME,C:pony()}}
function claimText(w){return fill(w.t,{v:D.AT[w.k].v[w.v]})}
function done(){return G.ph.filter(Boolean).length}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get();
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.pp&&p.games.pp.n)||0;
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(ID),lk=MW.pro.locked(ID),playedToday=(p.games.pp&&p.games.pp.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;
  $("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  $("#name").value=NAME;voiceBtn();
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});
  $$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===LEVEL)});
  $$("#dur button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});
  show("home")}
function voiceBtn(){var b=$("#bVoice");if(b){b.textContent=(VOICE?"🔊 ":"🔇 ")+T.voice;b.setAttribute("aria-pressed",VOICE)}}
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MODE=b.dataset.m;LS.set("ss_pp_mode",MODE);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#lvl").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;LEVEL=b.dataset.l;LS.set("ss_pp_level",LEVEL);$$("#lvl button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
if($("#dur"))$("#dur").addEventListener("click",function(e){var b=e.target.closest("button");if(!b||!LENS[b.dataset.n])return;LEN=b.dataset.n;LS.set("ss_pp_len",LEN);$$("#dur button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_pp_name",NAME)});
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_pp_voice",VOICE);voiceBtn();toast(VOICE?T.voiceOn:T.voiceOff);if(VOICE)say(T.voiceOn);else hush()};
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(hashStr("pp|"+MODE+"|"+MW.today()),MODE,true,LENS[LEN])};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(Math.floor(Math.random()*4e9),MODE,false,LENS[LEN])};
$("#bPro").onclick=proSheet;
$("#bDemo").onclick=function(){var w=ehvWorld();build(Math.floor(Math.random()*4e9),"demo",w.pois,w.ways,null,false,LENS[LEN])};
$("#bHow").onclick=function(){sheet('<h2>'+T.howH+'</h2>'+$("#howT").innerHTML+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet};
$("#bResume").onclick=function(){var g0=null;try{g0=fixG(LS.get(GK,null))}catch(e){g0=null}G=g0;if(!G){LS.del(GK);return home()}W=LS.get(WK,[]);P={x:G.px||0,y:G.py||0,acc:0};imReady().then(enter)};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};

/* ---------- proefronde: de binnenstad van Eindhoven, getekend (zelfde wereld als bij de andere wandelingen) ---------- */
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
  var Q=[["kerk","Catharinakerk",150,120],["kunst","Van Abbemuseum",395,505],["bieb","Bibliotheek in De Witte Dame",-345,-360],["kunst","Philips Museum",-430,-240],
    ["cafe","Café op Stratumseind",235,270],["cafe","Café aan de Markt",55,-70],["park","Stadswandelpark",190,600],["halte","Station Eindhoven Centraal",90,-620],
    ["halte","Bushalte Vestdijk",335,-160],["winkel","De Bijenkorf",-100,-215],["winkel","Winkelcentrum Heuvel",-230,-50],["post","Brievenbus Rechtestraat",30,-180],
    ["hotel","Hotel aan het 18 Septemberplein",110,-330],["apotheek","Apotheek Kleine Berg",-210,180],["bankje","Bankje aan de Dommel",480,200],
    ["school","School aan de Vestdijk",380,-380],["bank","Bank aan de Vestdijk",290,40],["kunst","Kunstwerk op het Wilhelminaplein",-360,170]];
  return{ways:ways,pois:Q.map(function(q){return{type:q[0],name:q[1],x:q[2],y:q[3]}})}}

/* ---------- binnen: op de plaats lopen (bewegingssensor) of op tempo, over de verhaalkaart ---------- */
var St=MW.Steps,INK=LS.get("ss_pp_in",{kind:"sensor",spm:100});
function inSheet(cb){var sens=St&&St.supported(),IN=T.kv;
  sheet('<h2>'+esc(IN.inH)+'</h2><p>'+esc(IN.inT)+'</p>'+(sens?'<button type="button" class="btn" id="inS">'+esc(IN.inSensor)+'</button>':'')+'<button type="button" class="btn'+(sens?' ghost dk':'')+'" id="inT">'+esc(IN.inTempo)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;
  if(sens)$("#inS").onclick=function(){St.ask().then(function(ok){closeSheet();if(!ok)toast(IN.inNoSensor);cb(ok?"sensor":"tempo",100)})};
  $("#inT").onclick=function(){closeSheet();cb("tempo",100)}}
function startIn(seed,daily,n){inSheet(function(kind,spm){INK={kind:kind,spm:spm};LS.set("ss_pp_in",INK);build(seed,"in",null,null,null,daily,n,true)})}
function stepLen(st,target){var left=st.slice(),x=0,y=0,tour=0;while(left.length){var bi=0,bd=1e9;left.forEach(function(s,i){var d=Math.hypot(s.x-x,s.y-y);if(d<bd){bd=d;bi=i}});tour+=bd;x=left[bi].x;y=left[bi].y;left.splice(bi,1)}return Math.max(.3,Math.min(3,tour/target))}
function stepIn(k){if(!G||G.mode!=="in")return;G.in.steps+=k;var open=G.st.filter(function(s){return !s.done}),t=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;t=s}});if(!t)return;
  var d=dTo(t),m=k*G.in.sl;if(d<=m){P.x=t.x;P.y=t.y;G.dist+=d}else{P.x+=(t.x-P.x)/d*m;P.y+=(t.y-P.y)/d*m;G.dist+=m}}
function startSteps(){if(!St||!G||G.mode!=="in")return;St.start({mode:G.in.kind,spm:G.in.spm,onStep:stepIn,active:function(){return !!G&&G.mode==="in"&&!$("#play").hidden&&$("#sheet").hidden&&$("#hide").hidden},
    onDead:function(){if(!G||G.mode!=="in")return;G.in.kind="tempo";save();toast(T.kv.inNoSensor);startSteps()}});St.awake(true)}
function stopSteps(){if(St){St.stop();St.awake(false)}}

/* ---------- een zaak beginnen ---------- */
function begin(seed,mode,daily,n){if(mode==="in")return startIn(seed,daily,n);if(mode!=="map")return build(seed,mode,null,null,null,daily,n);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      if(!w.pois||!w.pois.length)return buildVirt(seed,"map",w.origin,daily,n);
      build(seed,"map",w.pois,w.ways,w.origin,daily,n);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})},function(){Wk.loading("");var kx=111320*Math.cos(lat*Math.PI/180);buildVirt(seed,"map",{lat:lat,lon:lon,kx:kx,ky:110540},daily,n)})
  }).catch(function(e){Wk.loading("");noMapSheet(seed,daily,e==="nogps"?T.noGps:T.denied,n)})}
/* virtuele wereld: geen plattegrond maar wel gps (buiten) of stappen (binnen); de verhaalkaart is dan de kaart */
function buildVirt(seed,mode,origin,daily,n){build(seed,mode,null,null,origin,daily,n,true);if(G&&mode==="map")toast(T.kv.virtOut)}
/* geen kaart mogelijk: dezelfde zaak zonder kaart aanbieden in plaats van een foutmelding */
function noMapSheet(seed,daily,why,n){sheet('<h2>'+T.kv.noMapQ+'</h2>'+(why?'<p class="note">'+esc(why)+'</p>':'')+'<p>'+esc(T.kv.noMapT)+'</p><button type="button" class="btn" id="nmGo">'+T.kv.noMapGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet;$("#nmGo").onclick=function(){closeSheet();MODE="street";LS.set("ss_pp_mode",MODE);build(seed,"street",null,null,null,daily,n)}}
/* onderweg overstappen naar zonder kaart: zelfde zaak, de gedane sporen blijven */
function dropMap(){if(!G||G.mode==="street")return;Wk.stopWatch();stopHead();stopSteps();G.virt=false;
  G.mode="street";G.i=0;while(G.ph[G.i])G.i++;G.st=null;save();show("cards");render();toast(T.kv.switched)}
function fail(m){sheet('<h2>'+T.fail+'</h2><p>'+esc(m)+'</p><button type="button" class="btn" id="shX">'+T.back+'</button>');$("#shX").onclick=closeSheet}
function build(seed,mode,pois,ways,origin,daily,n,virt){n=n===5||n===11?n:8;
  var c=genCase(seed,mode,n);if(!c){toast("…");return}
  G={seed:seed,code:makeCode(seed,mode,n),mode:mode,lvl:LEVEL,n:n,c:c,i:0,ph:[],team:null,arrest:null,t0:0,tries:0,daily:!!daily,dist:0,origin:origin,px:0,py:0,st:null,cine:false,end:null,album:[],poses:{},lockOpen:false};
  if(virt||mode==="in"){G.virt=true;G.st=virtSpots(n).map(function(p,i){p.fi=i;p.done=false;return p});W=[];P={x:0,y:0,acc:0};LS.set(WK,W);if(mode==="in")G.in={kind:INK.kind,spm:INK.spm,steps:0,sl:KM.stepLen(G.st,1200)}}
  else if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,R0,n,r,T.corner);
    /* te weinig plekken gevonden? vul aan met hoeken op een cirkel, zodat elke lengte uit te spelen is */
    for(var k=0;spots.length<n&&k<40;k++){var a=k*2.39996+r(),d=R0*(.35+.5*r());spots.push({x:Math.round(Math.cos(a)*d),y:Math.round(Math.sin(a)*d),type:"hoek",name:""})}
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het|the) /,"")),fi:i,done:false}});
    W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  Wk.loading(T.pois);imReady().then(function(){Wk.loading("");brief()})}
function brief(){var c=G.c;LEVEL=G.lvl||LEVEL;
  $("#bfNo").textContent=(G.mode==="demo"?T.demoCase+" · ":"")+T.lvl[LEVEL]+" · "+T.lens[lenOf(NN())];
  $("#bfOpen").innerHTML='<canvas class="brscene" width="320" height="180"></canvas>'+bubble(fill(D.OPEN,{C:pony()}),D.CHEF,"big");
  briefScene($("#bfOpen canvas"));
  /* geen rij verdachten/plekken bij de start: die staan onder de knop in de balk */
  var bs=$("#bfSus");bs.innerHTML="";bs.style.display="none";if(bs.previousElementSibling&&bs.previousElementSibling.classList.contains("eyebrow"))bs.previousElementSibling.style.display="none";
  $("#bfTip").innerHTML=MW.codeBox(L,G.code,"zaak");MW.bindCodeBox($("#bfTip"),L);
  show("brief")}
function briefScene(cv){var g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=(ts-t0)/1000;g.clearRect(0,0,320,180);
    var sky=g.createLinearGradient(0,0,0,180);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(1,"#e0f4ff");g.fillStyle=sky;g.fillRect(0,0,320,180);
    g.fillStyle="#fde047";g.beginPath();g.arc(270,36,20,0,7);g.fill();g.fillStyle="#a8e08a";g.beginPath();g.ellipse(80,130,160,40,0,0,7);g.ellipse(280,134,140,40,0,0,7);g.fill();g.fillStyle=GRASS;g.fillRect(0,130,320,50);
    /* stal met open hek */g.fillStyle="#c8572f";g.fillRect(30,60,120,70);g.fillStyle="#7a3b2e";g.beginPath();g.moveTo(22,60);g.lineTo(90,22);g.lineTo(158,60);g.closePath();g.fill();g.fillStyle="#3b2a14";g.fillRect(70,84,40,46);
    g.strokeStyle="#f5efe0";g.lineWidth=5;g.save();g.translate(110,130);g.rotate(-.5+Math.sin(t)*.03);g.beginPath();g.moveTo(0,0);g.lineTo(0,-40);g.moveTo(0,-10);g.lineTo(34,-10);g.moveTo(0,-30);g.lineTo(34,-30);g.moveTo(34,0);g.lineTo(34,-40);g.stroke();g.restore();
    /* hoefafdrukken de straat op */for(var i=0;i<6;i++)drawHoofPrint(g,150+i*26,142+(i%2)*8,5,"rgba(91,58,30,.55)");
    if(!imgAt(g,"fenna-talk",230,132,78))drawFenna(g,230,98,22);
    if(!still&&t<20)requestAnimationFrame(f)};requestAnimationFrame(f)}
function susCard(s,i,pick){return '<'+(pick?'button type="button"':'div')+' class="sus face"'+(pick?' data-s="'+i+'"':'')+'><img class="face" src="'+placeURL(s.tr,s.idx,220)+'" alt=""><div class="sbody"><b>'+esc(cap(s.name))+'</b><small>'+esc(s.rel)+'</small><div class="tags">'+ATK.map(function(k){return '<i class="t-'+k+s.tr[k]+'">'+esc(D.AT[k].s[s.tr[k]])+"</i>"}).join("")+'</div></div></'+(pick?'button':'div')+'>'}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode==="map"||G.mode==="street")MW.pro.setFree(ID)}save();hush();if(!G.cine){G.cine=true;save();cine(function(){photoSheet("team",enter)})}else enter()};
$("#bBack").onclick=function(){G=null;hush();home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}

/* ---------- intro: de lege stal ---------- */
function cine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,dpr,t0=0,fin=false,raf=0;
  ov.hidden=false;var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  var lines=T.cine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;txt.onclick=null;txt.style.visibility="";then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  var r=rngOf(11),hills=[],i;for(i=0;i<5;i++)hills.push({x:r(),w:.3+r()*.3,h:.08+r()*.08,c:["#a8e08a","#8fd47a","#7cc466"][i%3]});
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,tt0=t-skipT,ph=still?9:(tt0<TOTAL?tt0*7.2/TOTAL:7.2+tt0-TOTAL);
    g.setTransform(dpr,0,0,dpr,0,0);var dawn=Math.min(1,ph/4),sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#f6b26b");sky.addColorStop(.5,"#ffd9a0");sky.addColorStop(1,"#9ad7ff");g.fillStyle=sky;g.fillRect(0,0,w,h);
    g.fillStyle="#fde68a";g.shadowColor="#fff";g.shadowBlur=40;g.beginPath();g.arc(w*.78,h*.3-dawn*h*.08,34,0,7);g.fill();g.shadowBlur=0;
    var base=h*.74;hills.forEach(function(hh){g.fillStyle=hh.c;g.beginPath();g.ellipse(hh.x*w,base,hh.w*w,hh.h*h,0,0,7);g.fill()});g.fillStyle=GRASS;g.fillRect(0,base,w,h-base);
    /* stal */var sx=w*.12,sw2=w*.42,sh2=h*.26,sy=base-sh2;g.fillStyle="#c8572f";g.fillRect(sx,sy,sw2,sh2);g.fillStyle="#7a3b2e";g.beginPath();g.moveTo(sx-10,sy);g.lineTo(sx+sw2/2,sy-sh2*.55);g.lineTo(sx+sw2+10,sy);g.closePath();g.fill();
    g.fillStyle="#2b1a0a";g.fillRect(sx+sw2*.33,sy+sh2*.3,sw2*.34,sh2*.7);g.fillStyle="#f5efe0";g.font="700 "+Math.round(h*.028)+"px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(L==="nl"?"PLUIS":"FLUFF",sx+sw2/2,sy+sh2*.24);
    /* hek dat openzwaait */var ga=Math.min(1,Math.max(0,(ph-1.5)/1.5));g.save();g.translate(sx+sw2+8,base);g.rotate(-ga*.55);g.strokeStyle="#f5efe0";g.lineWidth=Math.max(4,h*.008);g.beginPath();g.moveTo(0,0);g.lineTo(0,-sh2*.6);g.moveTo(sw2*.3,0);g.lineTo(sw2*.3,-sh2*.6);g.moveTo(0,-sh2*.15);g.lineTo(sw2*.3,-sh2*.15);g.moveTo(0,-sh2*.45);g.lineTo(sw2*.3,-sh2*.45);g.stroke();g.restore();
    /* hoefafdrukken */var n=Math.min(12,Math.floor(Math.max(0,ph-3)*6));for(i=0;i<n;i++)drawHoofPrint(g,sx+sw2*.75+i*w*.05,base+h*.04+(i%2)*h*.03,Math.max(5,h*.012),"rgba(91,58,30,.6)");
    /* Pluis wandelt weg */if(ph>3&&ph<9){var px=sx+sw2*.75+(ph-3)/5*w*.5;if(!imgAt(g,"pluis-walk",px,base+h*.06,Math.min(170,h*.26)))drawPony(g,px,base+h*.06,Math.min(120,h*.17),{walk:ph*7,halter:G.c.halter.slice(0,3)})}
    if(ph>7.2){g.textAlign="center";g.fillStyle="#fff";g.strokeStyle="#5b3a1e";g.lineWidth=6;var sc2=Math.min(1,(ph-7.2)/.5),fs=Math.round(38*sc2+12);g.font="700 "+fs+"px 'Fredoka','Arial Rounded MT Bold',sans-serif";var tt=L==="nl"?["HET GEHEIM VAN","PONY PLUIS"]:["THE SECRET OF","PONY FLUFF"];g.strokeText(tt[0],w/2,h*.3);g.fillText(tt[0],w/2,h*.3);g.strokeText(tt[1],w/2,h*.3+fs*1.05);g.fillText(tt[1],w/2,h*.3+fs*1.05)}
    var li=0;while(li<lines.length-1&&tt0>=STARTS[li+1])li++;txt.textContent=ph<7.2?lines[li]:"";txt.style.visibility=ph<7.2?"":"hidden";if(li!==spoken&&ph<7.2&&!still){spoken=li;say(lines[li])}
    if(ph>9.4)return end();raf=requestAnimationFrame(f)};
  /* leestijd per zin: ± 15 tekens per seconde, minstens 4 s; tik op de tekst = volgende zin */
  var STARTS=[],TOTAL=0,skipT=0;lines.forEach(function(l){STARTS.push(TOTAL);TOTAL+=Math.max(4,l.length/15+1.5)});
  txt.style.pointerEvents="auto";txt.onclick=function(e){e.stopPropagation();var t=(performance.now()-t0)/1000-skipT,n=STARTS.filter(function(x){return x>t})[0];if(n==null)n=TOTAL;skipT-=(n-t)};raf=requestAnimationFrame(f)}

/* ---------- foto's: clubfoto en foto met Pluis (souvenirs, geen controle) ---------- */
function photoSheet(kind,then,at){photoFor={kind:kind,then:then,at:at};var team=kind==="team",pose=kind==="pose",pz=pose?D.POSE[((at||0)+G.seed)%D.POSE.length]:null,
    H=team?T.teamH:pose?T.poseH:T.arrestH,TX=team?T.teamT:pose?pz:T.arrestT;
  sheet('<div class="eyebrow">'+esc(H)+'</div><div class="task"><div class="ph">'+ico("team","big")+'</div><div><h2>'+esc(H)+'</h2><p class="hint">'+esc(TX)+'</p></div></div>'+
    '<label class="btn cam" for="file">📷 '+T.shoot+'</label><p class="note" id="pMsg"></p><p class="note">'+esc(pose?T.poseNote:T.camNote)+'</p><button type="button" class="btn ghost dk" id="pSkip">'+T.skipPhoto+'</button>',true);
  say(TX);
  $("#pSkip").onclick=function(){closeSheet();photoFor=null;then()}}
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f||!G||!photoFor)return;var msg=$("#pMsg");
  var url=URL.createObjectURL(f),im=new Image();im.onload=function(){URL.revokeObjectURL(url);var pose=photoFor.kind==="pose",mx=pose?400:480;
    var w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,mx/Math.max(w,h)),cv=document.createElement("canvas");cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
    var data=cv.toDataURL("image/jpeg",pose?.66:.72);if(pose){G.album=G.album||[];G.album.push({u:data,at:photoFor.at||0})}else G[photoFor.kind]=data;save();buzz([40,30,80]);beep(660,.15);var th=photoFor.then;closeSheet();photoFor=null;th()};
  im.onerror=function(){URL.revokeObjectURL(url);if(msg)msg.textContent=T.noFile};im.src=url});

/* ---------- spelen zonder kaart: kaartjes ---------- */
function enter(){LEVEL=G.lvl||LEVEL;if(G.mode==="map"||G.mode==="demo"||G.mode==="in")enterMap();else{show("cards");render()}}
function hud(){if(!G)return;var n=done();$("#hT").textContent=mmss(Date.now()-G.t0);$("#hS").textContent=n+"/"+NN();shoeUI($("#hM"),n)}
function shoeUI(el,n){if(!el)return;var N=NN();el.innerHTML="";el.classList.toggle("many",N>8);for(var i=0;i<N;i++){var s=document.createElement("i");if(i<n)s.className="on";el.appendChild(s)}}
/* de stal: alle gouden hoefijzers met hun cijfer (verzameld in volgorde van vinden) */
function stalHTML(n,big){var N=NN(),h='<div class="stal'+(big?' big':'')+'" aria-label="'+esc(T.stal)+'">';for(var i=0;i<N;i++)h+='<span class="'+(i<n?"on":"")+'"><i>'+(i<n?G.c.gold[i]:"?")+'</i></span>';return h+'</div>'}
function render(){hud();while(G.i<NN()&&G.ph[G.i])G.i++;var i=G.i,box=$("#card");
  if(i>=NN()){box.innerHTML='<div class="pol done"><div class="grid">'+G.ph.map(function(p){return '<img src="'+p+'" alt="">'}).join("")+'</div></div>'+stalHTML(done())+bubble(G.lockOpen?T.radarAll:T.radarLock,D.CHEF)+'<button type="button" class="btn red" id="bAcc">'+(G.lockOpen?T.last:T.toGate)+'</button>';$("#bAcc").onclick=finaleGate;return}
  var s=G.c.slots[i];
  box.innerHTML='<div class="pol empty"><div class="ph">'+ico(s.id,"big")+'</div><p class="cap">'+esc(fill(T.task,{i:i+1,N:NN()}))+' · '+esc(T.kinds[s.act])+'</p></div>'+stalHTML(done())+bubble(s.ask,D.CHEF)+'<button type="button" class="btn" id="bOpen">▶ '+T.start+'</button>';
  $("#bOpen").onclick=function(){taskSheet(i)}}

/* ---------- spelen met kaart: weidekaart, hoefafdrukken, Pluis die in de verte loopt ---------- */
function enterMap(){show("play");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return R0},
    theme:{bg:"#bfe39f",water:"#6ec3ff",waterEdge:"#3aa0e8",ripple:"rgba(255,255,255,.35)",park:"#8fd47a",parkEdge:"#5fb45a",river:"#6ec3ff",major:"#f5efe0",minor:"#e3d9c0",road:"#efe6cf",label:"#3b2a14",waterLabel:"#1b5fa0",ring:"rgba(91,58,30,.25)",me:"#e76f51",meHalo:"rgba(231,111,81,.18)",meRing:"rgba(231,111,81,.7)",font:"700 12px 'Fredoka','Barlow Condensed',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&hit.ref.glimpse){if(GL.on){GL.on=false;G.gl=(G.gl||0)+1;save();buzz([40,30,80]);beep(880,.15);toast(G.gl>=3?T.kv.glimpseAll:fill(T.kv.glimpseYes,{n:Math.min(3,G.gl)}))}return}if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(R0);sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d;lastFix=Date.now();KM.moved(d)});
  lastFix=Date.now();KM.enter({kids:true,virt:!!G.virt,map:map});stopSteps();if(G.mode==="in")startSteps();GL.next=Date.now()+45000+Math.random()*45000;
  if(G.mode==="demo")toast(T.demoTip);
  requestAnimationFrame(loop)}
/* ---------- verhaalkaart (gedeelde module kidsmap.js) met het land rond Manege De Hoefslag ---------- */
var START={x:500,y:1290},VSC=.42;
var FP=[{x:230,y:1040,k:"hooi"},{x:150,y:760,k:"sloot"},{x:300,y:520,k:"speel"},{x:520,y:330,k:"kraam"},{x:760,y:420,k:"brug"},{x:860,y:700,k:"bank"},{x:720,y:960,k:"kerk"},{x:500,y:760,k:"plein"},{x:150,y:300,k:"boom"},{x:880,y:1060,k:"put"},{x:620,y:1130,k:"weitje"}];
var ROADS=[[-1,0],[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,-1],[7,2],[7,5],[7,0],[7,6],[8,2],[8,1],[9,6],[9,5],[10,-1],[10,6]];
var RIVER=[[0,640],[120,690],[260,660],[420,700],[600,680],[800,720],[1000,690]];
var TREES=[[80,1180],[120,320],[420,160],[640,180],[900,260],[950,900],[940,1180],[300,1300],[700,1300],[380,900],[640,600],[90,520],[820,1050],[560,1120]];
function tree(g,x,y,s){g.fillStyle="rgba(0,0,0,.12)";g.beginPath();g.ellipse(x+s*.1,y+s*.05,s*.55,s*.18,0,0,7);g.fill();g.fillStyle="#7a4a1e";g.fillRect(x-s*.08,y-s*.5,s*.16,s*.5);g.fillStyle="#3f9a4a";g.beginPath();g.arc(x,y-s*.7,s*.42,0,7);g.fill();g.fillStyle="#5fc46a";g.beginPath();g.arc(x-s*.12,y-s*.82,s*.26,0,7);g.fill()}
function house(g,x,y,s,col,roof){g.fillStyle="rgba(0,0,0,.12)";g.beginPath();g.ellipse(x,y+s*.05,s*.7,s*.16,0,0,7);g.fill();g.fillStyle=col;g.fillRect(x-s*.5,y-s*.6,s,s*.6);g.fillStyle=roof||"#b5461e";g.beginPath();g.moveTo(x-s*.6,y-s*.6);g.lineTo(x,y-s*1.1);g.lineTo(x+s*.6,y-s*.6);g.closePath();g.fill();g.fillStyle="#3b2a14";g.fillRect(x-s*.12,y-s*.34,s*.24,s*.34)}
function landmark(g,k,x,y,s){
  if(k==="hooi"){g.fillStyle="#e8b43a";g.beginPath();g.moveTo(x-s*.6,y);g.quadraticCurveTo(x,y-s*1.3,x+s*.6,y);g.closePath();g.fill();g.strokeStyle="#c9941a";g.lineWidth=2;for(var i=0;i<5;i++){g.beginPath();g.moveTo(x-s*.4+i*s*.2,y);g.lineTo(x-s*.2+i*s*.1,y-s*.5);g.stroke()}}
  else if(k==="sloot"){drawAnimal(g,"duck",x,y-s*.3,s*.3)}
  else if(k==="speel"){g.strokeStyle="#c0392b";g.lineWidth=s*.12;g.beginPath();g.moveTo(x-s*.5,y);g.lineTo(x-s*.5,y-s*.9);g.moveTo(x+s*.5,y);g.lineTo(x+s*.5,y-s*.9);g.moveTo(x-s*.5,y-s*.9);g.lineTo(x+s*.5,y-s*.9);g.stroke();g.strokeStyle="#f4c20d";g.lineWidth=s*.06;g.beginPath();g.moveTo(x-s*.15,y-s*.9);g.lineTo(x-s*.15,y-s*.3);g.moveTo(x+s*.15,y-s*.9);g.lineTo(x+s*.15,y-s*.3);g.stroke();g.fillStyle="#2563eb";g.fillRect(x-s*.25,y-s*.34,s*.5,s*.1)}
  else if(k==="kraam"){g.fillStyle="#8a5a2b";g.fillRect(x-s*.55,y-s*.5,s*1.1,s*.5);g.fillStyle="#e63946";for(i=0;i<5;i++)g.fillRect(x-s*.6+i*s*.24,y-s*.78,s*.12,s*.28);g.fillStyle="#fff";for(i=0;i<5;i++)g.fillRect(x-s*.48+i*s*.24,y-s*.78,s*.12,s*.28);g.fillStyle="#e63946";[[-.3,-.3],[0,-.32],[.3,-.3],[-.15,-.2],[.15,-.2]].forEach(function(p){g.beginPath();g.arc(x+p[0]*s,y+p[1]*s,s*.09,0,7);g.fill()})}
  else if(k==="brug"){g.fillStyle="#8a5a2b";g.beginPath();g.moveTo(x-s*.7,y);g.quadraticCurveTo(x,y-s*.7,x+s*.7,y);g.lineTo(x+s*.7,y+s*.15);g.quadraticCurveTo(x,y-s*.5,x-s*.7,y+s*.15);g.closePath();g.fill();g.strokeStyle="#5b3a1e";g.lineWidth=3;g.beginPath();g.moveTo(x-s*.7,y-s*.1);g.quadraticCurveTo(x,y-s*.85,x+s*.7,y-s*.1);g.stroke()}
  else if(k==="bank"){g.fillStyle="#2a8a4c";g.fillRect(x-s*.08,y-s*1.2,s*.16,s*1.2);g.fillStyle="#f4c20d";g.beginPath();g.arc(x,y-s*1.25,s*.2,0,7);g.fill();g.fillStyle="#8a5a2b";g.fillRect(x-s*.5,y-s*.45,s,s*.12);g.fillRect(x-s*.45,y-s*.3,s*.08,s*.3);g.fillRect(x+s*.37,y-s*.3,s*.08,s*.3);g.fillRect(x-s*.5,y-s*.7,s,s*.1)}
  else if(k==="kerk"){house(g,x,y,s*.9,"#d9c7a3","#7a3b2e");g.fillStyle="#d9c7a3";g.fillRect(x+s*.2,y-s*1.4,s*.3,s*.9);g.fillStyle="#7a3b2e";g.beginPath();g.moveTo(x+s*.15,y-s*1.4);g.lineTo(x+s*.35,y-s*1.8);g.lineTo(x+s*.55,y-s*1.4);g.closePath();g.fill();drawAnimal(g,"cat",x-s*.4,y-s*.75,s*.2)}
  else if(k==="boom"){tree(g,x,y,s*1.4);g.fillStyle="#e63946";[[-.3,-.9],[.2,-1.1],[.35,-.75],[-.05,-.6]].forEach(function(q){g.beginPath();g.arc(x+q[0]*s,y+q[1]*s,s*.1,0,7);g.fill()})}
  else if(k==="put"){g.fillStyle="#8a8f99";g.beginPath();g.ellipse(x,y,s*.5,s*.22,0,0,7);g.fill();g.fillStyle="#5b6670";g.fillRect(x-s*.5,y-s*.4,s,s*.4);g.fillStyle="#8a8f99";g.beginPath();g.ellipse(x,y-s*.4,s*.5,s*.22,0,0,7);g.fill();g.fillStyle="#3b2a14";g.beginPath();g.ellipse(x,y-s*.4,s*.3,s*.12,0,0,7);g.fill();g.fillStyle="#8a5a2b";g.fillRect(x-s*.45,y-s*1.1,s*.08,s*.7);g.fillRect(x+s*.37,y-s*1.1,s*.08,s*.7);g.fillStyle="#b5461e";g.beginPath();g.moveTo(x-s*.6,y-s*1.05);g.lineTo(x,y-s*1.4);g.lineTo(x+s*.6,y-s*1.05);g.closePath();g.fill()}
  else if(k==="weitje"){g.fillStyle="#f5efe0";for(var j=0;j<5;j++)g.fillRect(x-s*.6+j*s*.3,y-s*.5,s*.07,s*.5);g.fillRect(x-s*.6,y-s*.4,s*1.25,s*.06);g.fillRect(x-s*.6,y-s*.18,s*1.25,s*.06);drawAnimal(g,"rabbit",x+s*.1,y-s*.12,s*.16)}
  else if(k==="plein"){g.fillStyle="#f5efe0";g.beginPath();g.moveTo(x-s*.7,y);g.lineTo(x-s*.35,y-s*.8);g.lineTo(x,y);g.closePath();g.fill();g.beginPath();g.moveTo(x,y);g.lineTo(x+s*.35,y-s*.8);g.lineTo(x+s*.7,y);g.closePath();g.fill();g.strokeStyle="#5b3a1e";g.lineWidth=2;g.beginPath();g.moveTo(x-s*.9,y-s*1);g.lineTo(x+s*.9,y-s*1);g.stroke();for(i=0;i<6;i++){g.fillStyle=COL[i%4];g.beginPath();g.moveTo(x-s*.85+i*s*.3,y-s*1);g.lineTo(x-s*.7+i*s*.3,y-s*.78);g.lineTo(x-s*.55+i*s*.3,y-s*1);g.closePath();g.fill()}}}
var KM=MW.KidsMap.create({T:T.kv,go:function(s){walkTo={x:s.x,y:s.y};sel=null},G:function(){return G},P:function(){return P},dTo:function(s){return dTo(s)},virt:function(){return !!(G&&G.virt)},mode:function(){return G&&G.mode},
  map:{W:1000,H:1400,start:START,spots:FP,roads:ROADS,vsc:VSC,sky:"#9ad7ff",land:"#9fd98a",road:"#e9d8a6",roadLine:"#fff7dd",label:"#3b2a14"},
  draw:{mark:function(g,x,y,r,col){drawHoofPrint(g,x,y,r,col)},
    ground:function(g,t,still){g.fillStyle="#8fd47a";[[200,250,160],[760,900,200],[300,1150,140],[650,250,120]].forEach(function(e){g.beginPath();g.ellipse(e[0],e[1],e[2],e[2]*.5,0,0,7);g.fill()});g.fillStyle="#7cc466";for(var i=0;i<60;i++)g.fillRect((i*173)%980+10,(i*311)%1380+10,5,10);
      g.strokeStyle="#6ec3ff";g.lineWidth=70;g.lineCap="round";g.lineJoin="round";g.beginPath();RIVER.forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke();g.strokeStyle="#3aa0e8";g.lineWidth=74;g.globalAlpha=.25;g.stroke();g.globalAlpha=1},
    decor:function(g,t,still){TREES.forEach(function(p,i){tree(g,p[0],p[1],44+(i%3)*8)});g.fillStyle="#d9c7a3";g.fillRect(60,860,60,160);g.fillStyle="#7a3b2e";g.beginPath();g.moveTo(45,860);g.lineTo(90,800);g.lineTo(135,860);g.closePath();g.fill();g.strokeStyle="#5b3a1e";g.lineWidth=5;[0,1].forEach(function(k){g.save();g.translate(90,830);g.rotate(k*Math.PI/2+(still?0:t/3000));g.beginPath();g.moveTo(-70,0);g.lineTo(70,0);g.stroke();g.restore()})},
    start:function(g,x,y){house(g,x-150,y-10,80,"#c8572f");house(g,x+150,y-10,64,"#e07a4a");g.fillStyle="#f5efe0";for(var i=0;i<8;i++)g.fillRect(x-150+i*44,y+20,8,34);g.fillRect(x-150,y+30,310,6);g.fillRect(x-150,y+46,310,6)},
    landmark:landmark,
    hero:function(g,x,y){if(!imgAt(g,"kids-row",x,y+4,80)){g.fillStyle="#e76f51";g.beginPath();g.arc(x,y-20,22,0,7);g.fill()}},
    runner:function(g,fx,fy,t){if(GL.on)return;var aa=t/2600,px=fx+Math.cos(aa)*90,py=fy+40+Math.sin(aa*.7)*40;if(!imgAt(g,"pluis-walk",px,py,70,.9))drawPony(g,px,py,50,{al:.9,walk:t/120,flip:Math.sin(aa)>0,halter:G.c.halter.slice(0,3)})},
    overlay:function(g,w,h,t){if(!GL.on)return false;var gt=(t-GL.t0)/1000,gx=GL.dir>0?-80+gt/4*(w+160):w+80-gt/4*(w+160),gy=h*.5;GL.x=gx;GL.y=gy;
      if(!imgAt(g,"pluis-walk",gx,gy,h*.13,.95))drawPony(g,gx,gy,h*.09,{walk:t/100,flip:GL.dir<0,al:.95});if(gt>4){GL.on=false;KM.setMsg("");toast(T.kv.glimpseNo);return false}KM.setMsg(T.kv.glimpse);return true}},
  onTap:function(x,y){if(!GL.on)return;if(Math.hypot(x-GL.x,y-(GL.y-30))<70){GL.on=false;G.gl=(G.gl||0)+1;save();buzz([40,30,80]);beep(880,.15);KM.setMsg("");var m=G.gl>=3?T.kv.glimpseAll:fill(T.kv.glimpseYes,{n:Math.min(3,G.gl)});toast(m);say(m)}}});
KM.mount();
function fk(s){return KM.fk(s)}function virtSpots(n){return KM.virtSpots(n)}function stopHead(){KM.leave()}

function glimpseTick(){if(GL.on||!G||(G.gl||0)>=3||!$("#sheet").hidden||Date.now()<GL.next)return;var open=G.st.filter(function(s){return !s.done});if(!open.length)return;
  if(!KM.on()&&G.mode!=="demo")return;GL.on=true;GL.t0=performance.now();GL.dir=Math.random()<.5?1:-1;GL.next=Date.now()+70000+Math.random()*60000;say(T.kv.glimpse);buzz([30,40,30])}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[];
  var open=G.st.filter(function(s){return !s.done});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/500+s.fi)*3,col=["#e76f51","#f4c20d","#6ec3ff"][s.fi%3];
    if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*22,0,7);cx.stroke();cx.globalAlpha=1}
    cx.fillStyle="#fffaf0";cx.shadowColor="rgba(0,0,0,.3)";cx.shadowBlur=s.done?0:10;cx.beginPath();cx.arc(X,Y+bob*.3,16,0,7);cx.fill();cx.shadowBlur=0;cx.strokeStyle=s.done?"#9aa58f":col;cx.lineWidth=2.5;cx.stroke();
    if(s.done){cx.strokeStyle="#9aa58f";cx.lineWidth=3;cx.beginPath();cx.moveTo(X-6,Y);cx.lineTo(X-1,Y+5);cx.lineTo(X+7,Y-5);cx.stroke()}else drawHoofPrint(cx,X,Y+bob*.3,8,"#5b3a1e");
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,26,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#7a8a70":"#3b2a14";cx.shadowColor="#fff";cx.shadowBlur=6;if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+36);cx.shadowBlur=0}})});
  if(GL.on&&!KM.on()){var gt=(performance.now()-GL.t0)/1000,gref={x:P.x+(GL.dir>0?-220+gt*110:220-gt*110),y:P.y+90,glimpse:true};GL.wx=gref.x;GL.wy=gref.y;it.push({x:gref.x,y:gref.y,ref:gref,tap:true,draw:function(cx,X,Y,t,api){if(!imgAt(cx,"pluis-walk",X,Y,70,.9))drawPony(cx,X,Y,50,{walk:t/100,flip:GL.dir<0,al:.9})}});if(gt>4){GL.on=false;toast(T.kv.glimpseNo)}}
  if(open.length){var near=open.reduce(function(a,s){return dTo(s)<dTo(a)?s:a});it.push({x:near.x,y:near.y,tap:false,draw:function(cx,X,Y,t,api){if(api.still){if(!imgAt(cx,"pluis-walk",X+44,Y-8,60,.9))drawPony(cx,X+44,Y-8,44,{al:.9,halter:G.c.halter.slice(0,3)});return}var a=t/2600,rx=60*api.V.s+30,sx=X+Math.cos(a)*rx,sy=Y+Math.sin(a*.7)*rx*.6+10,fl=Math.sin(a)>0;if(!imgAt(cx,"pluis-walk",sx,sy,60,.9))drawPony(cx,sx,sy,44,{al:.9,walk:t/120,flip:fl,halter:G.c.halter.slice(0,3)})}})}
  return it}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=110*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  if(!KM.draw(t))map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tickMap();glimpseTick()}requestAnimationFrame(loop)}
function tickMap(){var el=Math.floor((Date.now()-G.t0)/1000),n=done();
  $("#mT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#mS").textContent=n+"/"+NN();shoeUI($("#mM"),n);
  var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});
  $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);beep(660,.2)}if(!here)arrived=null;
  chip();if(el%10===0)save();if(G.mode==="map"&&!G.virt&&lastFix&&Date.now()-lastFix>45000){lastFix=Date.now();toast(T.kv.gpsLost)}
  /* onderweg duikt af en toe een dier op (niet als er een vel open is) */
  if(open.length&&$("#sheet").hidden&&!here&&Date.now()-(G.lastVisit||G.t0)>75000)visit()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel),act=G.c.slots[sel.fi].act;
  $("#cName").textContent=sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=T.here+" · "+T.kinds[act];
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))taskSheet(sel.fi,sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;taskSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mPeople").onclick=susSheet;$("#mAcc").onclick=function(){if(done()>=NN())finaleGate();else noteSheet()};
$("#bNote").onclick=noteSheet;$("#bPeople").onclick=susSheet;$("#bAcc2").onclick=function(){if(done()>=NN())finaleGate();else noteSheet()};

/* ---------- een spoor: opdracht → puzzel → hoefijzer en spoor ---------- */
function taskSheet(i,spot){walkTo=null;if(G.mode==="demo"&&!G.ph[i]&&done()>=(window.MMTrial?MMTrial.max:2)&&window.MMTrial){var _GK=GK;return MMTrial.end({buy:proSheet,home:function(){leavePlay();try{localStorage.removeItem(_GK)}catch(e){}}})}var vz=$("#visit");if(vz)vz.remove();var s=G.c.slots[i];cur={i:i,spot:spot||null};var n=done()+1,I=T.pz[s.act];
  var head='<div class="eyebrow">'+esc(fill(T.task,{i:n,N:NN()}))+' · '+esc(T.kinds[s.act])+(spot?' · '+esc(spot.name):'')+'</div>'+bubble(s.ask,D.CHEF);
  sheet(head+'<div class="pzh"><h2>'+esc(I[0])+'</h2><p class="hint">'+esc(I[1])+'</p></div><div id="pz"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){G.force=null;closeSheet()};
  say(s.ask+" "+I[1]);
  var fin=false,H=null,o={box:$("#pz"),rng:rngOf(G.seed*7+i*131),done:function(){if(fin)return;fin=true;mg.stop();if(H)H.remove();cur.thumb=shoeThumb(i,s.act);accept()},
    canvas:function(hh){o.box.innerHTML='<canvas class="sq" width="280" height="'+(hh||280)+'"></canvas>';var c=o.box.firstChild;if(hh)c.style.aspectRatio="280/"+hh;return c},
    at:function(e,c){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*280,(e.clientY-b.top)/b.height*(c.height)]},
    msg:function(t){var m=$("#pzM");if(!m){m=document.createElement("p");m.id="pzM";m.className="pzst";o.box.appendChild(m)}m.textContent=t},
    say:say,good:function(){buzz(80);beep(660,.15);setTimeout(function(){beep(990,.2)},120)},bad:function(){beep(180,.2);if(H)return H.miss();buzz(120);return false}};
  if(/debug/.test(location.search))window.PP_DBG=o;
  if(window.MMP)MMP.helper(function(){G.t0-=120000;G.skips=(G.skips||0)+1;save();o.done()},function(){say(s.ask+" "+I[1])});
  /* hartjes (crew.js): op = puzzel opnieuw, zonder straf */
  var start=function(){mg.stop();fin=false;o.box.innerHTML="";if(window.MW.Crew)H=MW.Crew.hearts(o.box,function(){G.retries=(G.retries||0)+1;save();start()},{dead:function(){mg.stop()}});PUZ[s.act](o)};
  start()}
/* memory: husselen tot geen enkel paar naast of onder elkaar ligt */
function spreadPairs(c,cols,r){for(var t=0;t<300;t++){var bad=false;for(var i=0;i<c.length&&!bad;i++){if(i%cols<cols-1&&c[i]===c[i+1])bad=true;if(i+cols<c.length&&c[i]===c[i+cols])bad=true}if(!bad)return c;c=shuffle(c,r)}return c}
function accept(){var i=cur.i,s=G.c.slots[i];G.ph[i]=cur.thumb;if(cur.spot){cur.spot.done=true;cur.spot.doneAt=Date.now();G.kd0=null}G.force=null;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;save();buzz([40,30,80]);beep(520,.15);
  var kind=s.kind,n=done(),N=NN(),last=n>=N,gd=G.c.gold[n-1],head=kind==="ev"?T.ev:kind==="ex"?T.exH:kind==="claim"?T.wit:T.gag,sub=kind==="ev"?T.evT:kind==="ex"?T.exT:kind==="claim"?(hard()?T.witT2:T.witT):"",
    txt=kind==="claim"?claimText(G.c.claims[s.w]):kind==="ex"?fill(s.t,{P:G.c.sus[s.j].name}):s.t,who=kind==="claim"?G.c.claims[s.w].who:D.CHEF,av=kind==="claim"?witAv(G.c.claims[s.w].kind):FENNA(),
    cliff=last?D.CLIFFLAST:D.CLIFF[(n-1+G.seed)%D.CLIFF.length];
  sheet('<div class="eyebrow">'+esc(fill(T.clue,{n:n,N:N}))+' · '+esc(T.reply)+'</div><div class="ballwrap"><canvas id="ballC" width="320" height="200"></canvas><b>'+esc(fill(T.balloon,{d:gd}))+'</b></div>'+stalHTML(n)+
    '<div class="msg small">'+FENNA()+'<div class="bub"><p>'+esc(s.react)+'</p></div></div>'+
    '<div class="rep k-'+kind+'"><em>'+esc(head)+'</em>'+(kind==="ev"?'<canvas class="evc" id="evC" width="300" height="120"></canvas>':kind==="ex"?'<img class="exc" src="'+placeURL(G.c.sus[s.j].tr,G.c.sus[s.j].idx,300)+'" alt="">':'')+bubble(txt,kind==="claim"?who+" · "+G.c.claims[s.w].rel:null,"",av)+(sub?'<p class="note">'+esc(sub)+'</p>':'')+'</div>'+
    '<p class="cliff">'+esc(cliff)+'</p>'+
    '<button type="button" class="btn" id="bNext">'+(last?T.toGate:T.next)+'</button>',true);
  shoeAnim($("#ballC"),gd);if(kind==="ev"){evDraw($("#evC"),s.k,s.v);buzz([60,40,60,40,120])}
  say(s.react+" "+fill(T.balloon,{d:gd})+". "+head+". "+(kind==="claim"?who+": ":"")+txt+" "+cliff);
  $("#bNext").onclick=function(){closeSheet();sel=null;cur=null;var goOn=function(){if(G.mode==="map"||G.mode==="demo"){chip();if(last)finaleGate()}else{render();if(last)finaleGate()}};
    var pa=(POSE_AT[N]||[]);if(pa.indexOf(n)>=0&&!G.poses[n]){G.poses[n]=1;save();return photoSheet("pose",function(){if(!last)visit(true);goOn()},n)}
    if(!last&&Math.random()<.75)visit(true);goOn()}}
/* een dier (of Kraai Karel met zijn bluf) duikt even op: kaartje onderin, wordt voorgelezen */
function visit(force){if(!G)return;G.lastVisit=Date.now();
  /* om de beurt met een dierenbezoekje: Kraai Karel kaapt het scherm met een opdracht voor de hele groep (crew.js) */
  if(window.MW.Crew&&D.CREW&&done()>0&&(G.vi||0)%2===1&&$("#sheet").hidden){var hk=(G.hj==null?G.seed:G.hj+1)%D.CREW.CREW_HIJACK.length;G.hj=hk;G.vi=(G.vi||0)+1;save();
    MW.Crew.hijack({who:D.CREW.WHO,img:IMGROOT+"wit-crow.webp",line:D.CREW.CREW_HIJACK[hk],secs:15,say:false});say(D.CREW.CREW_HIJACK[hk]);return}
  var list=D.VISIT,k=(G.vi==null?(G.seed%list.length):G.vi)%list.length;G.vi=k+1;var v=list[k],kind=v[0],txt=v[1];
  var old=$("#visit");if(old)old.remove();var el=document.createElement("div");el.id="visit";el.className="visit";el.setAttribute("role","status");
  el.innerHTML=(kind==="fenna"?FENNA():witAv(kind))+'<p>'+esc(txt)+'</p>';document.body.appendChild(el);beep(kind==="crow"?1100:760,.08);setTimeout(function(){beep(kind==="crow"?900:990,.1)},110);
  requestAnimationFrame(function(){el.classList.add("in")});var gone=function(){el.classList.remove("in");setTimeout(function(){el.remove()},400)};el.onclick=gone;setTimeout(gone,5200);
  if(force!==false)say(txt);save()}
function popUp(){visit(true)}
/* hoefijzer: als plaatje voor de strook en als animatie */
function shoeThumb(i,act){var cv=document.createElement("canvas");cv.width=cv.height=240;var g=cv.getContext("2d"),bg=g.createLinearGradient(0,0,0,240);bg.addColorStop(0,"#9ad7ff");bg.addColorStop(1,"#8fd47a");g.fillStyle=bg;g.fillRect(0,0,240,240);
  for(var k=0;k<30;k++){g.fillStyle=COL[k%4];g.globalAlpha=.5;g.beginPath();g.arc((k*97)%240,(k*53)%240,3,0,7);g.fill()}g.globalAlpha=1;drawShoe(g,120,100,50,"#9a6a00",true);drawShoe(g,120,100,50,"#f4c20d",true);
  g.fillStyle="#5b3a1e";g.font="700 30px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(i+1,120,104);g.textBaseline="alphabetic";
  g.fillStyle="#fff";g.strokeStyle="#5b3a1e";g.lineWidth=4;g.font="700 20px 'Fredoka',sans-serif";g.strokeText(T.kinds[act],120,222);g.fillText(T.kinds[act],120,222);return cv.toDataURL("image/jpeg",.8)}
function shoeAnim(cv,n){var g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f=function(ts){if(!t0)t0=ts;var t=Math.min(1,(ts-t0)/1100);if(still)t=1;var e=1-Math.pow(1-t,3);g.clearRect(0,0,320,200);
    for(var k=0;k<24;k++){var a=k/24*6.283,d=40+e*90;g.fillStyle=COL[k%4];g.globalAlpha=(1-t)*.9;g.beginPath();g.arc(160+Math.cos(a)*d,100+Math.sin(a)*d*.6,3,0,7);g.fill()}g.globalAlpha=1;
    g.save();g.translate(160,110);g.rotate((1-e)*6.283);g.scale(.3+e*.7,.3+e*.7);drawShoe(g,0,0,46,"#9a6a00",true);drawShoe(g,0,-3,46,"#f4c20d",true);g.fillStyle="#5b3a1e";g.font="700 34px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(n,0,2);g.restore();
    if(t<1&&cv.isConnected)mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)}
function evIcon(g,k,v,x,y,s){g.save();g.translate(x,y);g.scale(s,s);
  if(k==="vlag"){g.strokeStyle="#5b3a1e";g.lineWidth=3;g.beginPath();g.moveTo(-14,22);g.lineTo(-14,-24);g.stroke();g.fillStyle=FLAGC[v];g.beginPath();g.moveTo(-14,-24);g.lineTo(18,-14);g.lineTo(-14,-4);g.closePath();g.fill();g.strokeStyle="rgba(0,0,0,.3)";g.lineWidth=1;g.stroke()}
  else if(k==="dier")drawAnimal(g,["duck","goat","rabbit"][v],0,2,20);
  else{if(v===0){g.fillStyle="#f28c28";for(var i=0;i<3;i++){g.save();g.translate(-12+i*12,0);g.rotate(.3-i*.3);g.beginPath();g.moveTo(-5,-14);g.lineTo(5,-14);g.lineTo(0,16);g.closePath();g.fill();g.fillStyle="#2a9d4b";g.fillRect(-2,-22,4,8);g.fillStyle="#f28c28";g.restore()}}
    else if(v===1){g.fillStyle="#e63946";g.beginPath();g.arc(-8,2,11,0,7);g.arc(9,-2,11,0,7);g.fill();g.fillStyle="#2a9d4b";g.fillRect(8,-18,3,8);g.fillStyle="#fff";g.globalAlpha=.4;g.beginPath();g.arc(-12,-3,4,0,7);g.fill()}
    else{g.fillStyle="#f4c20d";g.beginPath();g.ellipse(0,4,22,13,0,0,7);g.fill();g.strokeStyle="#d9a500";g.lineWidth=1.5;for(i=0;i<7;i++){g.beginPath();g.moveTo(-16+i*5,14);g.lineTo(-12+i*5,-10);g.stroke()}}}
  g.restore()}
function evDraw(cv,k,v){var g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,300,120);g.strokeStyle="#f4c20d";g.lineWidth=6;g.setLineDash([14,8]);g.strokeRect(6,6,288,108);g.setLineDash([]);
  g.fillStyle="#fff2c2";g.beginPath();g.ellipse(150,58,60,44,0,0,7);g.fill();evIcon(g,k,v,150,58,1.3);
  g.fillStyle="#9a6a00";g.font="700 14px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(D.AT[k].s[v].toUpperCase(),150,112)}

/* ---------- de acht manege-puzzels ---------- */
/* sporen in het zand: 0 ponyhoef, 1 hondenpoot, 2 eendenpoot, 3 fietsband */
function drawTrack(g,cx,cy,r,type,col){g.save();g.fillStyle=col||"#5b3a1e";g.strokeStyle=col||"#5b3a1e";
  if(type===0){drawHoofPrint(g,cx,cy,r,col)}
  else if(type===1){g.beginPath();g.ellipse(cx,cy+r*.3,r*.55,r*.45,0,0,7);g.fill();[[-.55,-.3],[-.2,-.6],[.2,-.6],[.55,-.3]].forEach(function(p){g.beginPath();g.ellipse(cx+p[0]*r,cy+p[1]*r,r*.2,r*.26,0,0,7);g.fill()})}
  else if(type===2){g.lineWidth=r*.16;g.lineCap="round";g.beginPath();g.moveTo(cx,cy+r*.8);g.lineTo(cx,cy-r*.1);g.moveTo(cx,cy+r*.2);g.lineTo(cx-r*.6,cy-r*.6);g.moveTo(cx,cy+r*.2);g.lineTo(cx+r*.6,cy-r*.6);g.stroke();g.globalAlpha=.4;g.beginPath();g.moveTo(cx-r*.6,cy-r*.6);g.lineTo(cx,cy-r*.1);g.lineTo(cx+r*.6,cy-r*.6);g.lineTo(cx,cy+r*.2);g.closePath();g.fill()}
  else{g.lineWidth=r*.14;g.beginPath();for(var y=-r;y<=r;y+=r*.25){g.moveTo(cx-r*.3,cy+y);g.lineTo(cx+r*.3,cy+y+r*.12)}g.stroke();g.lineWidth=r*.06;g.beginPath();g.moveTo(cx-r*.4,cy-r);g.lineTo(cx-r*.4,cy+r);g.moveTo(cx+r*.4,cy-r);g.lineTo(cx+r*.4,cy+r);g.stroke()}
  g.restore()}
/* silhouetten in de verte: 0 pony, 1 hert, 2 hond, 3 koe */
function drawSil(g,type,x,y,h,col){g.save();g.fillStyle=col||"#2b2b36";g.translate(x,y);var s=h/100;g.scale(s,s);
  if(type===0){g.beginPath();g.ellipse(0,-58,36,21,0,0,7);g.fill();[[-30],[-18],[10],[22]].forEach(function(p){g.fillRect(p[0],-50,9,50)});g.beginPath();g.moveTo(16,-74);g.quadraticCurveTo(30,-96,40,-104);g.lineTo(52,-96);g.lineTo(30,-58);g.fill();g.beginPath();g.ellipse(52,-98,17,11,.35,0,7);g.fill();g.beginPath();g.moveTo(40,-108);g.lineTo(44,-120);g.lineTo(49,-108);g.lineTo(53,-120);g.lineTo(57,-108);g.fill();g.beginPath();g.moveTo(-32,-62);g.quadraticCurveTo(-50,-50,-44,-18);g.lineTo(-38,-20);g.quadraticCurveTo(-42,-50,-30,-62);g.fill()}
  else if(type===1){g.beginPath();g.ellipse(0,-58,30,17,0,0,7);g.fill();[[-24],[-14],[12],[22]].forEach(function(p){g.fillRect(p[0],-50,6,50)});g.beginPath();g.moveTo(14,-70);g.lineTo(34,-112);g.lineTo(44,-108);g.lineTo(28,-58);g.fill();g.beginPath();g.ellipse(42,-110,12,8,.5,0,7);g.fill();g.lineWidth=3;g.strokeStyle=g.fillStyle;g.beginPath();g.moveTo(38,-118);g.lineTo(30,-140);g.moveTo(32,-134);g.lineTo(22,-140);g.moveTo(34,-126);g.lineTo(26,-130);g.moveTo(44,-118);g.lineTo(52,-140);g.moveTo(50,-134);g.lineTo(60,-140);g.moveTo(48,-126);g.lineTo(56,-130);g.stroke()}
  else if(type===2){g.beginPath();g.ellipse(0,-34,30,15,0,0,7);g.fill();[[-24],[-14],[12],[22]].forEach(function(p){g.fillRect(p[0],-30,7,30)});g.beginPath();g.ellipse(32,-48,14,11,.2,0,7);g.fill();g.beginPath();g.moveTo(26,-56);g.lineTo(28,-70);g.lineTo(36,-56);g.fill();g.beginPath();g.moveTo(-28,-40);g.quadraticCurveTo(-44,-50,-46,-66);g.lineTo(-40,-66);g.quadraticCurveTo(-38,-52,-26,-46);g.fill()}
  else{g.beginPath();g.ellipse(0,-56,40,24,0,0,7);g.fill();[[-32],[-20],[14],[26]].forEach(function(p){g.fillRect(p[0],-45,9,45)});g.beginPath();g.ellipse(44,-66,18,14,0,0,7);g.fill();g.beginPath();g.moveTo(34,-78);g.quadraticCurveTo(26,-92,36,-92);g.lineTo(40,-80);g.moveTo(54,-78);g.quadraticCurveTo(62,-92,52,-92);g.lineTo(48,-80);g.fill()}
  g.restore()}
var PUZ={
  /* 1 hoefspoor: zand wegvegen, dan de juiste van vier kiezen */
  hoof:function(o){var c=o.canvas(),g=c.getContext("2d"),r=o.rng,type=0,seed=Math.floor(r()*1e6),stage=1;
    var back=document.createElement("canvas");back.width=back.height=280;var bg=back.getContext("2d");bg.fillStyle="#e9d8a6";bg.fillRect(0,0,280,280);for(var k=0;k<120;k++){bg.fillStyle="rgba(120,80,30,.1)";bg.beginPath();bg.arc(Math.random()*280,Math.random()*280,2+Math.random()*4,0,7);bg.fill()}
    var decoy=[1,2,3][Math.floor(r()*3)];drawTrack(bg,70,200,26,decoy,"rgba(91,58,30,.45)");drawTrack(bg,150,120,40,0);drawTrack(bg,210,210,22,decoy,"rgba(91,58,30,.35)");
    var fog=document.createElement("canvas");fog.width=fog.height=280;var fg=fog.getContext("2d");fg.fillStyle="#c9a86a";fg.fillRect(0,0,280,280);for(k=0;k<500;k++){fg.fillStyle="rgba(230,205,150,.6)";fg.beginPath();fg.arc(Math.random()*280,Math.random()*280,2+Math.random()*5,0,7);fg.fill()}
    var downp=false,wiped=0,draw=function(){g.drawImage(back,0,0);g.drawImage(fog,0,0)};draw();o.msg(T.pz.wipeMore);
    var check=function(){var d=fg.getImageData(0,0,280,280).data,n=0,m=0;for(var i=3;i<d.length;i+=16){m++;if(d[i]<40)n++}if(n/m>.45){stage=2;pick()}};
    var wipe=function(e){if(!downp||stage!==1)return;var q=o.at(e,c);fg.globalCompositeOperation="destination-out";fg.fillStyle="#000";fg.beginPath();fg.arc(q[0],q[1],28,0,7);fg.fill();fg.globalCompositeOperation="source-over";wiped++;draw();if(wiped%6===0)check()};
    c.addEventListener("pointerdown",function(e){if(stage===1){downp=true;wipe(e)}else tap(e)});c.addEventListener("pointermove",wipe);c.addEventListener("pointerup",function(){downp=false;if(stage===1)check()});c.addEventListener("pointercancel",function(){downp=false});
    var opts=[],right=0;function pick(){var types=shuffle([0,1,2,3],r);right=types.indexOf(type);opts=types.map(function(t,i){return{t:t,x:40+i*66.6,y:222}});o.good();o.msg(T.pz.pick);o.say(T.pz.pick);
      g.drawImage(back,0,0);g.fillStyle="rgba(255,250,240,.9)";rr(g,20,170,240,100,16);g.fill();g.strokeStyle="#f4c20d";g.lineWidth=4;g.beginPath();g.arc(150,120,52,0,7);g.stroke();
      opts.forEach(function(p){g.fillStyle="#fff";rr(g,p.x-30,p.y-30,60,60,10);g.fill();g.strokeStyle="#94a3b8";g.lineWidth=2;g.stroke();drawTrack(g,p.x,p.y,20,p.t)})}
    function tap(e){var q=o.at(e,c);opts.forEach(function(p,i){if(Math.abs(q[0]-p.x)<32&&Math.abs(q[1]-p.y)<32){if(i===right){g.strokeStyle="#22c55e";g.lineWidth=5;rr(g,p.x-30,p.y-30,60,60,10);g.stroke();o.msg(T.pz.found);o.good();setTimeout(o.done,500)}else{g.strokeStyle="#ef4444";g.lineWidth=4;rr(g,p.x-30,p.y-30,60,60,10);g.stroke();o.msg(T.pz.nope);o.bad()}}})}},
  /* 2 verrekijker: een silhouet wordt langzaam scherp; kies pony / hert / hond / koe */
  look:function(o){var c=o.canvas(),g=c.getContext("2d"),r=o.rng,type=Math.floor(r()*4),order=shuffle([0,1,2,3],r),right=order.indexOf(type),t0=0,lock=false,T0=hard()?7:4.5;
    var draw=function(ts,mark){if(!t0)t0=ts;var t=Math.min(1,(ts-t0)/1000/T0);
      var sky=g.createLinearGradient(0,0,0,150);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(1,"#e0f4ff");g.fillStyle=sky;g.fillRect(0,0,280,150);g.fillStyle="#a8e08a";g.beginPath();g.ellipse(60,120,120,30,0,0,7);g.ellipse(230,125,110,28,0,0,7);g.fill();g.fillStyle=GRASS;g.fillRect(0,122,280,30);
      g.save();g.beginPath();g.arc(140,78,62,0,7);g.clip();g.filter="blur("+((1-t)*6).toFixed(1)+"px)";drawSil(g,type,140,118,58,"rgba(43,43,54,"+(.25+t*.75)+")");g.restore();
      g.strokeStyle="#1e293b";g.lineWidth=10;g.beginPath();g.arc(140,78,62,0,7);g.stroke();g.strokeStyle="#64748b";g.lineWidth=2;g.beginPath();g.moveTo(140,16);g.lineTo(140,140);g.moveTo(78,78);g.lineTo(202,78);g.stroke();
      g.fillStyle="#fffaf0";g.fillRect(0,150,280,130);order.forEach(function(p,i){var x=38+i*68,y=222;g.fillStyle=mark&&mark.i===i?(mark.ok?"#bbf7d0":"#fecaca"):"#fff";rr(g,x-30,y-50,60,100,12);g.fill();g.strokeStyle=mark&&mark.i===i?(mark.ok?"#22c55e":"#ef4444"):"#94a3b8";g.lineWidth=3;g.stroke();drawSil(g,p,x,y+36,46,"#2b2b36")});
      if(t<1)o.msg(T.pz.sharp);else o.msg(T.pz.whatIs)};
    var f=function(ts){if(lock||!c.isConnected)return;draw(ts);mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
    c.addEventListener("pointerdown",function(e){if(lock)return;var q=o.at(e,c);if(q[1]<160)return;var i=Math.floor((q[0]-4)/68);if(i<0||i>3)return;var ok=i===right;t0=1;draw(1e12,{i:i,ok:ok});if(ok){lock=true;o.msg(T.pz.found);o.good();setTimeout(o.done,600)}else{o.msg(T.pz.nope);o.bad()}})},
  /* 3 roskam: modder van de foto poetsen; eronder Pluis met een ster */
  brush:function(o){var c=o.canvas(),g=c.getContext("2d"),fin=false;
    var back=document.createElement("canvas");back.width=back.height=280;var bg=back.getContext("2d");bg.fillStyle="#fff";bg.fillRect(0,0,280,280);var sky=bg.createLinearGradient(0,0,0,250);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(1,GRASS);bg.fillStyle=sky;bg.fillRect(16,16,248,220);
    if(!imgAt(bg,"pluis",140,230,200))drawPony(bg,120,228,150,{halter:G.c.halter.slice(0,3)});bg.fillStyle="#5b3a1e";bg.font="700 18px 'Permanent Marker',cursive";bg.textAlign="center";bg.fillText(D.PONY+" ♥",140,264);
    var fog=document.createElement("canvas");fog.width=fog.height=280;var fg=fog.getContext("2d");fg.fillStyle="#6b4423";fg.fillRect(0,0,280,280);for(var k=0;k<400;k++){fg.fillStyle="rgba(120,80,40,.7)";fg.beginPath();fg.arc(Math.random()*280,Math.random()*280,3+Math.random()*8,0,7);fg.fill()}
    var downp=false,wiped=0,draw=function(){g.drawImage(back,0,0);g.drawImage(fog,0,0)};draw();o.msg(T.pz.wipeMore);
    var check=function(){var d=fg.getImageData(0,0,280,280).data,n=0,m=0;for(var i=3;i<d.length;i+=16){m++;if(d[i]<40)n++}if(n/m>(hard()?.72:.6)&&!fin){fin=true;fg.clearRect(0,0,280,280);draw();g.fillStyle="#fff";star(g,185,86,16,7,5);g.fill();g.strokeStyle="#f4c20d";g.lineWidth=3;g.beginPath();g.arc(185,86,26,0,7);g.stroke();o.msg(T.pz.star);o.say(T.pz.star);o.good();setTimeout(o.done,1200)}};
    var wipe=function(e){if(!downp||fin)return;var q=o.at(e,c);fg.globalCompositeOperation="destination-out";fg.fillStyle="#000";fg.beginPath();fg.arc(q[0],q[1],24,0,7);fg.fill();fg.globalCompositeOperation="source-over";wiped++;draw();if(wiped%5===0)check()};
    c.addEventListener("pointerdown",function(e){downp=true;wipe(e)});c.addEventListener("pointermove",wipe);c.addEventListener("pointerup",function(){downp=false;check()});c.addEventListener("pointercancel",function(){downp=false})},
  /* 4 appelkraam: appels tellen (Veulen: alle appels, 3-6; Ruiter: alleen de rode, 8-12 met groene ertussen) */
  apples:function(o){var c=o.canvas(220),g=c.getContext("2d"),r=o.rng,H=hard(),N=H?8+Math.floor(r()*5):3+Math.floor(r()*4),ap=[],i,lock=false;
    for(i=0;i<N;i++)ap.push({x:34+(i%6)*42+(r()-.5)*8,y:70+Math.floor(i/6)*48+(r()-.5)*6,red:!H||r()<.6});
    var ans=ap.filter(function(a){return a.red}).length;if(H&&ans<2){ap[0].red=ap[1].red=true;ans=ap.filter(function(a){return a.red}).length}
    g.fillStyle="#fde68a";g.fillRect(0,0,280,220);g.fillStyle="#e63946";for(i=0;i<280;i+=40)g.fillRect(i,0,20,26);g.fillStyle="#fff";for(i=20;i<280;i+=40)g.fillRect(i,0,20,26);
    g.fillStyle="#8a5a2b";g.fillRect(10,40,260,120);g.fillStyle="#a06a35";g.fillRect(10,40,260,8);
    ap.forEach(function(a){g.fillStyle=a.red?"#e63946":"#7cc466";g.beginPath();g.arc(a.x,a.y,15,0,7);g.fill();g.fillStyle="#2a9d4b";g.fillRect(a.x-1.5,a.y-22,3,9);g.fillStyle="rgba(255,255,255,.45)";g.beginPath();g.arc(a.x-5,a.y-5,4,0,7);g.fill()});
    g.fillStyle="#5b3a1e";g.font="700 16px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(fill(T.pz.howMany,{c:H?T.pz.red:T.pz.all}),140,195);
    var opts=shuffle([ans,ans+1,Math.max(1,ans-1),ans+2].filter(function(v,i2,a){return a.indexOf(v)===i2}),r).slice(0,4);while(opts.length<4)opts.push(ans+opts.length+1);
    var keys=document.createElement("div");keys.className="keys";keys.innerHTML=opts.map(function(v){return '<button type="button" class="key" data-v="'+v+'">'+v+'</button>'}).join("");o.box.appendChild(keys);o.msg(fill(T.pz.howMany,{c:H?T.pz.red:T.pz.all}));
    keys.addEventListener("click",function(e){var b=e.target.closest(".key");if(!b||lock)return;if(+b.dataset.v===ans){lock=true;b.style.background="#22c55e";o.msg(T.pz.found);o.good();setTimeout(o.done,600)}else{b.style.background="#ef4444";o.msg(T.pz.nope);o.bad();setTimeout(function(){b.style.background=""},700)}})},
  /* 5 halster: de ringkleuren verschijnen één voor één (en worden gezegd), dan natikken */
  halter:function(o){var r=o.rng,code=G.c.halter.slice(0,hard()?4:3),later=function(fn,ms){mg.tm.push(setTimeout(fn,ms))};
    o.box.innerHTML='<canvas class="sq radio" width="280" height="170" style="aspect-ratio:280/170"></canvas><div class="keys col">'+[0,1,2,3].map(function(k){return '<button type="button" class="key" data-k="'+k+'" style="--c:'+RINGC[k]+'" aria-label="'+T.pz.cols[k]+'"></button>'}).join("")+'</div><p class="pzst" id="rdS"></p><button type="button" class="btn ghost sm dk" id="rdR">'+T.pz.replay+'</button>';
    var c=o.box.firstChild,g=c.getContext("2d"),st=$("#rdS"),typed=[],busy=true;
    var draw=function(showN){var sky=g.createLinearGradient(0,0,0,170);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(1,GRASS);g.fillStyle=sky;g.fillRect(0,0,280,170);
      /* hoofd van Pluis groot, van opzij */g.save();g.translate(60,170);g.scale(2.2,2.2);g.fillStyle="#d9a066";g.beginPath();g.moveTo(16,-20);g.quadraticCurveTo(30,-50,40,-60);g.lineTo(60,-50);g.quadraticCurveTo(45,-30,40,0);g.lineTo(0,0);g.closePath();g.fill();g.save();g.translate(52,-56);g.rotate(.35);g.beginPath();g.ellipse(0,0,19,12,0,0,7);g.fill();g.restore();g.fillStyle="#f3d9b8";g.beginPath();g.ellipse(66,-48,9,7,.3,0,7);g.fill();
      g.fillStyle="#d9a066";g.beginPath();g.moveTo(42,-66);g.lineTo(46,-80);g.lineTo(51,-66);g.closePath();g.fill();g.fillStyle="#fff6e0";for(var i=0;i<5;i++){g.beginPath();g.arc(22+i*6,-36-i*6,6,0,7);g.fill()}
      g.fillStyle="#fff";g.beginPath();g.arc(54,-58,3.8,0,7);g.fill();g.fillStyle="#1e1e2e";g.beginPath();g.arc(55,-58,2.3,0,7);g.fill();g.fillStyle="#fff";star(g,46,-62,4.5,2,5);g.fill();
      g.strokeStyle="#5b3a1e";g.lineWidth=2.4;g.beginPath();g.moveTo(58,-58);g.lineTo(60,-42);g.moveTo(44,-54);g.lineTo(64,-46);g.moveTo(46,-62);g.quadraticCurveTo(38,-52,42,-40);g.stroke();
      for(i=0;i<code.length;i++){var on=i<showN;g.fillStyle=on?RINGC[code[i]]:"rgba(255,255,255,.5)";g.beginPath();g.arc(42+i*7,-47+i*2,3.4,0,7);g.fill();g.strokeStyle="rgba(0,0,0,.4)";g.lineWidth=.8;g.stroke()}g.restore();
      typed.forEach(function(k,i){g.fillStyle=RINGC[k];g.beginPath();g.arc(180+i*26,150,9,0,7);g.fill()});for(i=typed.length;i<code.length;i++){g.strokeStyle="#5b3a1e";g.lineWidth=2;g.beginPath();g.arc(180+i*26,150,9,0,7);g.stroke()}};
    var play=function(){busy=true;typed=[];st.textContent=T.pz.listen;draw(0);var t=700;
      code.forEach(function(d,i){later(function(){draw(i+1);beep(400+d*90,.25);buzz(30);var v=VOICE;VOICE=true;say(T.pz.cols[d]);VOICE=v},t+i*1300)});
      later(function(){busy=false;draw(0);st.textContent=T.pz.typeIt},t+code.length*1300+600)};
    $("#rdR").onclick=function(){if(!busy)play()};
    o.box.addEventListener("click",function(e){var b=e.target.closest(".key");if(!b||busy)return;var k=+b.dataset.k;typed.push(k);beep(400+k*90,.1);draw(0);
      if(typed[typed.length-1]!==code[typed.length-1]){st.textContent=T.pz.wrongSeq;o.bad();busy=true;later(play,900);return}
      if(typed.length===code.length){st.textContent=T.pz.found;o.good();busy=true;draw(code.length);later(o.done,600)}});
    later(play,500)},
  /* 6 glimmertjes van Karel: vier glimmende dingen lichten op, natikken; rondes van 2, 3 (en 4 bij Ruiter) */
  shiny:function(o){var SH=["💍","🥄","🪙","🔑"],LC=["#f472b6","#cbd5e1","#f4c20d","#60a5fa"];o.box.innerHTML='<div class="crow"><img src="'+avURL("crow")+'" alt=""></div><div class="lans">'+[0,1,2,3].map(function(i){return'<button type="button" class="lan" data-i="'+i+'" style="--c:'+LC[i]+'" aria-label="'+(i+1)+'">'+SH[i]+'</button>'}).join("")+'</div><p class="pzst" id="sqS"></p><button type="button" class="btn ghost sm dk" id="sqR">'+T.pz.again+'</button>';
    var Ls=$$("#pz .lan"),S=[0,1,2,3].map(function(){return Math.floor(o.rng()*4)}),st=$("#sqS"),pos=0,busy=true,len=2,MAXL=hard()?4:3,later=function(fn,ms){mg.tm.push(setTimeout(fn,ms))};
    var lit=function(i,ms){Ls[i].classList.add("on");beep(330+i*110,.18);later(function(){Ls[i].classList.remove("on")},ms)};
    var play=function(){Ls.forEach(function(l){l.classList.remove("on")});busy=true;pos=0;st.textContent=T.pz.watch;for(var k=0;k<len;k++)(function(k){later(function(){lit(S[k],420)},600+k*750)})(k);later(function(){busy=false;st.textContent=fill(T.pz.yours,{n:len})},600+len*750)};
    $("#sqR").onclick=play;
    o.box.addEventListener("click",function(e){var b=e.target.closest(".lan");if(!b||busy)return;var i=+b.dataset.i;lit(i,220);
      if(i!==S[pos]){st.textContent=T.pz.wrongSeq;o.bad();later(play,900);busy=true;return}
      pos++;if(pos>=len){len++;if(len>MAXL){o.good();st.textContent=T.pz.found;later(o.done,500);return}st.textContent=T.pz.good;later(play,900);busy=true}});
    later(play,400)},
  /* 7 Kato aaien: een hartje klopt; tik precies als het groot is, vijf keer */
  pet:function(o){var c=o.canvas(),g=c.getContext("2d"),n=0,lock=false,per=hard()?900:1300,t0=0,lastHit=-1;
    var draw=function(ts){if(!t0)t0=ts;var t=(ts-t0),ph=(t%per)/per,sc=.5+.5*Math.sin(ph*6.283-1.57),big=sc>.78;
      g.fillStyle="#fde68a";g.fillRect(0,0,280,280);g.fillStyle="#c8572f";g.fillRect(0,150,280,130);g.fillStyle="#a8482a";for(var i=0;i<7;i++)for(var j=0;j<4;j++)g.fillRect((i*44+(j%2)*22)%300-10,156+j*32,40,26);
      if(!imgAt(g,"wit-cat",140,230,150))drawAnimal(g,"cat",140,170,56);
      g.save();g.translate(140,78);g.scale(.5+sc*.9,.5+sc*.9);g.fillStyle=big?"#ff3b6b":"#ffb3c6";g.shadowColor=g.fillStyle;g.shadowBlur=big?24:0;g.beginPath();g.moveTo(0,22);g.bezierCurveTo(-34,-6,-22,-40,0,-18);g.bezierCurveTo(22,-40,34,-6,0,22);g.fill();g.restore();
      for(i=0;i<5;i++){g.fillStyle=i<n?"#ff3b6b":"rgba(255,255,255,.6)";g.beginPath();g.arc(100+i*20,260,7,0,7);g.fill()}
      return big};
    var big=false,f=function(ts){if(lock||!c.isConnected)return;big=draw(ts);mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);o.msg(T.pz.purr);
    c.addEventListener("pointerdown",function(){if(lock)return;var now=performance.now();if(big&&now-lastHit>per*.6){lastHit=now;n++;beep(520+n*60,.12);buzz(40);o.msg(n>=5?T.pz.purrOk:fill(T.pz.purrN,{n:n}));if(n>=5){lock=true;draw(now);o.good();o.say(T.pz.purrOk);setTimeout(o.done,800)}}else{o.msg(T.pz.purrBad);beep(200,.08);if(n>0)n--}})},
  /* 8 de wei door: Pluis met je vinger over de paadjes naar het hek (Bibi) slepen */
  maze:function(o){var c=o.canvas(),g=c.getContext("2d"),r=o.rng,N=hard()?8:6,S=280/N,cells=[],i;for(i=0;i<N*N;i++)cells.push(0);
    var vis=[],stack=[0];vis[0]=1;var DIRS=[[0,-1,1,4],[1,0,2,8],[0,1,4,1],[-1,0,8,2]];
    while(stack.length){var cur2=stack[stack.length-1],cx=cur2%N,cy=Math.floor(cur2/N),nb=shuffle(DIRS,r).filter(function(d){var nx=cx+d[0],ny=cy+d[1];return nx>=0&&ny>=0&&nx<N&&ny<N&&!vis[ny*N+nx]});
      if(!nb.length){stack.pop();continue}var d=nb[0],nx=cx+d[0],ny=cy+d[1];cells[cur2]|=d[2];cells[ny*N+nx]|=d[3];vis[ny*N+nx]=1;stack.push(ny*N+nx)}
    var pos=0,goal=N*N-1,trail=[0],fin=false;
    var draw=function(ts){g.fillStyle=GRASS;g.fillRect(0,0,280,280);for(i=0;i<40;i++){g.fillStyle="#7cc466";g.fillRect((i*53)%280,(i*97)%280,4,8)}
      for(i=0;i<N*N;i++){var x=(i%N)*S+S/2,y=Math.floor(i/N)*S+S/2;g.strokeStyle="#e9d8a6";g.lineWidth=S*.5;g.lineCap="round";g.beginPath();g.moveTo(x,y);g.lineTo(x,y);g.stroke();
        if(cells[i]&2){g.beginPath();g.moveTo(x,y);g.lineTo(x+S,y);g.stroke()}if(cells[i]&4){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+S);g.stroke()}}
      g.strokeStyle="rgba(91,58,30,.7)";g.lineWidth=4;g.lineJoin="round";g.beginPath();trail.forEach(function(k,j){var tx=(k%N)*S+S/2,ty=Math.floor(k/N)*S+S/2;j?g.lineTo(tx,ty):g.moveTo(tx,ty)});g.stroke();
      var gx=(goal%N)*S+S/2,gy=Math.floor(goal/N)*S+S/2;g.strokeStyle="#f5efe0";g.lineWidth=3;g.beginPath();g.moveTo(gx-S*.4,gy+S*.4);g.lineTo(gx-S*.4,gy-S*.3);g.moveTo(gx+S*.4,gy+S*.4);g.lineTo(gx+S*.4,gy-S*.3);g.moveTo(gx-S*.4,gy-S*.1);g.lineTo(gx+S*.4,gy-S*.1);g.moveTo(gx-S*.4,gy+S*.2);g.lineTo(gx+S*.4,gy+S*.2);g.stroke();drawPony(g,gx,gy+S*.4,S*.7,{bibi:true,flip:true});
      var px=(pos%N)*S+S/2,py=Math.floor(pos/N)*S+S/2;drawPony(g,px,py+S*.4,S*.75,{walk:(ts||0)/120,halter:G.c.halter.slice(0,3)})};
    var f=function(ts){if(fin||!c.isConnected)return;draw(ts);mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
    var mv=function(e){if(fin)return;var q=o.at(e,c),cx=Math.floor(q[0]/S),cy=Math.floor(q[1]/S);if(cx<0||cy<0||cx>=N||cy>=N)return;var k=cy*N+cx;if(k===pos)return;
      var px=pos%N,py=Math.floor(pos/N),dx=cx-px,dy=cy-py;if(Math.abs(dx)+Math.abs(dy)!==1)return;
      var open=(dx===1&&(cells[pos]&2))||(dx===-1&&(cells[pos]&8))||(dy===1&&(cells[pos]&4))||(dy===-1&&(cells[pos]&1));
      if(!open){beep(160,.06);return}pos=k;if(trail.length>1&&trail[trail.length-2]===k)trail.pop();else trail.push(k);beep(500+trail.length*10,.04);
      if(pos===goal){fin=true;draw(0);g.fillStyle="rgba(255,250,240,.95)";g.font="700 34px 'Fredoka',sans-serif";g.textAlign="center";g.strokeStyle="#5b3a1e";g.lineWidth=6;g.strokeText(T.pz.gate,140,150);g.fillText(T.pz.gate,140,150);o.msg(T.pz.gate);o.good();setTimeout(o.done,800)}};
    c.addEventListener("pointerdown",mv);c.addEventListener("pointermove",function(e){if(e.buttons||e.pointerType==="touch")mv(e)})},
  /* 9 wie zegt dat? De telefoon maakt een dierengeluid; tik het dier (Veulen: 3 rondes, 3 dieren; Ruiter: 4 rondes, 4 dieren) */
  sound:function(o){var r=o.rng,H=hard(),KS=["pony","goat","duck","dog","cat","crow"],rounds=H?4:3,nOpt=H?4:3,k=0,lock=false,seq=shuffle(KS,r).slice(0,rounds),cur=null;
    o.box.innerHTML='<div class="sndb" id="sdB" aria-live="polite"></div><div class="opts'+nOpt+'" id="sdO"></div><div class="dots" id="sdD"></div><button type="button" class="btn ghost sm dk" id="sdP">🔊 '+esc(T.pz.hearAgain)+'</button>';
    var play=function(){var v=VOICE;VOICE=true;say(T.pz.snd[cur]);VOICE=v;var b=$("#sdB");b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop");beep(300+KS.indexOf(cur)*80,.12)};
    var dots=function(){$("#sdD").innerHTML=seq.map(function(x,i){return '<i class="'+(i<k?"on":"")+'"></i>'}).join("")};
    var round=function(){cur=seq[k];var opts=shuffle(shuffle(KS.filter(function(x){return x!==cur}),r).slice(0,nOpt-1).concat([cur]),r);lock=false;
      $("#sdB").textContent=T.pz.snd[cur];$("#sdO").innerHTML=opts.map(function(x){return '<button type="button" class="opt" data-k="'+x+'" aria-label="'+esc(T.pz.anim[x])+'"><img src="'+animalURL(x)+'" alt=""></button>'}).join("");dots();o.msg(T.pz.whoSays);mg.tm.push(setTimeout(play,500))};
    $("#sdP").onclick=play;
    $("#sdO").addEventListener("click",function(e){var b=e.target.closest(".opt");if(!b||lock)return;if(b.dataset.k===cur){lock=true;b.classList.add("ok");o.good();k++;dots();
        if(k>=rounds){o.msg(T.pz.found);mg.tm.push(setTimeout(o.done,600))}else{o.msg(T.pz.good);mg.tm.push(setTimeout(round,900))}}
      else{b.classList.add("no");o.bad();o.msg(T.pz.nope);mg.tm.push(setTimeout(function(){b.classList.remove("no")},600))}});
    round()},
  /* 10 springparcours: Pluis galoppeert; tik om over de balken te springen (Veulen: 3, rustig; Ruiter: 5, sneller) */
  jump:function(o){var c=o.canvas(200),g=c.getContext("2d"),H=hard(),need=H?5:3,v=H?130:92,JD=H?.72:.85,cleared=0,hx=330,jt=-1,crash=0,last=0,fin=false,passed=false,tt=0;
    o.peek=function(){return{hx:hx,v:v,jd:JD,jt:jt}};
    var draw=function(jy){var sky=g.createLinearGradient(0,0,0,200);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(1,"#e0f4ff");g.fillStyle=sky;g.fillRect(0,0,280,200);
      g.fillStyle="#fde047";g.beginPath();g.arc(240,34,16,0,7);g.fill();g.fillStyle="#a8e08a";g.beginPath();g.ellipse(60,150,140,26,0,0,7);g.ellipse(240,152,120,24,0,0,7);g.fill();
      g.fillStyle="#e9d8a6";g.fillRect(0,160,280,40);g.fillStyle="rgba(120,80,30,.25)";for(var i=0;i<12;i++){var xx=((i*47-tt*v)%300+300)%300-10;g.fillRect(xx,172+(i%3)*8,10,3)}
      /* balk */g.fillStyle="#fff";g.fillRect(hx-4,118,8,44);g.fillRect(hx+22,118,8,44);for(i=0;i<4;i++){g.fillStyle=i%2?"#fff":"#e63946";g.fillRect(hx-6+i*9,128,9,7)}g.fillStyle="#e63946";g.fillRect(hx-6,128,40,3);
      if(!imgAt(g,"pluis-walk",78,166-jy,74))drawPony(g,78,166-jy,52,{walk:jt>=0?0:tt*12,halter:G.c.halter.slice(0,3)});
      for(i=0;i<need;i++){drawShoe(g,20+i*22,22,7,i<cleared?"#f4c20d":"rgba(91,58,30,.35)",true)}
      if(crash>0){g.fillStyle="rgba(255,255,255,.85)";g.font="700 24px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(T.pz.oops,140,80)}};
    var f=function(ts){if(fin||!c.isConnected)return;var dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;tt+=dt;
      if(jt>=0){jt+=dt;if(jt>JD)jt=-1}var jy=jt>=0?Math.sin(jt/JD*Math.PI)*72:0;
      if(crash>0){crash-=dt;if(crash<=0){hx=330;passed=false}}else{hx-=v*dt;
        if(!passed&&hx<92&&hx>66&&jy<32){crash=1;o.msg(T.pz.jumpOops);beep(170,.2);buzz(120)}
        else if(!passed&&hx<=66){passed=true;cleared++;beep(600+cleared*80,.12);o.msg(cleared>=need?T.pz.found:fill(T.pz.jumpN,{n:cleared,m:need}));if(cleared>=need){fin=true;draw(0);o.good();mg.tm.push(setTimeout(o.done,700));return}}
        if(passed&&hx<-40){hx=320+Math.random()*(H?60:110);passed=false}}
      draw(jy);mg.raf=requestAnimationFrame(f)};
    o.msg(T.pz.jumpGo);mg.raf=requestAnimationFrame(f);
    c.addEventListener("pointerdown",function(e){e.preventDefault();if(fin||jt>=0||crash>0)return;jt=0;beep(440,.06)})},
  /* 11 hoefijzer-memory: draai kaartjes om en zoek twee dezelfde dieren (Veulen: 3 paar en eerst even spieken; Ruiter: 5 paar). Mis-omdraaien hoort bij memory: telt niet als fout. */
  pairs:function(o){var r=o.rng,H=hard(),np=H?5:3,KS=shuffle(["pony","goat","duck","dog","cat","crow"],r).slice(0,np),cards=spreadPairs(shuffle(KS.concat(KS),r),np===5?5:3,r),open=[],got=0,busy=true;
    o.box.innerHTML='<div class="mem n'+cards.length+'">'+cards.map(function(k,i){return '<button type="button" class="card up" data-i="'+i+'" aria-label="'+(i+1)+'"><span class="bk"></span><span class="fr"><img src="'+animalURL(k)+'" alt=""></span></button>'}).join("")+'</div>';
    var els=[].slice.call(o.box.querySelectorAll(".card"));o.msg(H?T.pz.memGo:T.pz.memPeek);
    mg.tm.push(setTimeout(function(){els.forEach(function(e){e.classList.remove("up")});busy=false;o.msg(T.pz.memGo)},H?900:2400));
    o.box.addEventListener("click",function(e){var b=e.target.closest(".card");if(!b||busy||b.classList.contains("up"))return;b.classList.add("up");beep(500,.05);open.push(b);
      if(open.length===2){busy=true;var a=open[0],c2=open[1];open=[];
        if(cards[+a.dataset.i]===cards[+c2.dataset.i]){got++;mg.tm.push(setTimeout(function(){a.classList.add("ok");c2.classList.add("ok");beep(700+got*60,.12);busy=false;
            if(got>=np){o.good();o.msg(T.pz.found);mg.tm.push(setTimeout(o.done,600))}else o.msg(fill(T.pz.memN,{n:got,m:np}))},350))}
        else{beep(220,.08);mg.tm.push(setTimeout(function(){a.classList.remove("up");c2.classList.remove("up");busy=false},900))}}})},
  /* 12 manen vlechten: welke strik komt hierna? (Veulen: ABAB, 2 rondes; Ruiter: lastiger patronen, 3 rondes) */
  braid:function(o){var r=o.rng,H=hard(),rounds=H?3:2,k=0,lock=false,PATS=H?[[0,1,2],[0,0,1],[0,1,1],[0,1,2,1]]:[[0,1],[0,1],[0,0,1]],seq,ans;
    o.box.innerHTML='<canvas class="sq radio" width="280" height="190" style="aspect-ratio:280/190"></canvas><div class="keys col bows" id="brK"></div><div class="dots" id="brD"></div>';
    var c=o.box.firstChild,g=c.getContext("2d");
    var bow=function(x,y,col,s,q){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=col;g.strokeStyle="rgba(0,0,0,.35)";g.lineWidth=1.2;g.beginPath();g.moveTo(0,0);g.lineTo(-14,-9);g.lineTo(-14,9);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(0,0);g.lineTo(14,-9);g.lineTo(14,9);g.closePath();g.fill();g.stroke();g.beginPath();g.arc(0,0,4.5,0,7);g.fill();g.stroke();
      if(q){g.fillStyle="#fff";g.font="700 18px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText("?",0,1)}g.restore()};
    var draw=function(showAns){var sky=g.createLinearGradient(0,0,0,190);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(1,GRASS);g.fillStyle=sky;g.fillRect(0,0,280,190);
      var P=[];for(var i=0;i<=seq.length;i++){var t=i/(seq.length);P.push([34+t*200,150-t*96-Math.sin(t*3.1)*12])}
      /* een lange blonde vlecht */g.lineCap="round";g.lineJoin="round";g.strokeStyle="#e8c98a";g.lineWidth=26;g.beginPath();P.forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke();
      g.strokeStyle="#fff6e0";g.lineWidth=18;g.stroke();g.strokeStyle="rgba(200,160,90,.6)";g.lineWidth=2;for(i=0;i<seq.length*3;i++){var a=P[Math.floor(i/3)],b2=P[Math.floor(i/3)+1],u=(i%3+.5)/3,x=a[0]+(b2[0]-a[0])*u,y=a[1]+(b2[1]-a[1])*u;g.beginPath();g.arc(x,y,7,.6+(i%2)*Math.PI,2.4+(i%2)*Math.PI);g.stroke()}
      if(!imgAt(g,"pluis",240,188,64))drawPony(g,230,186,44,{});
      seq.forEach(function(ci,i){bow(P[i][0],P[i][1],RINGC[ci],1)});
      if(showAns!=null)bow(P[seq.length][0],P[seq.length][1],RINGC[showAns],1.1);else{g.setLineDash([4,3]);g.strokeStyle="#5b3a1e";g.lineWidth=2;g.beginPath();g.arc(P[seq.length][0],P[seq.length][1],16,0,7);g.stroke();g.setLineDash([]);bow(P[seq.length][0],P[seq.length][1],"#94a3b8",1,true)}};
    var dots=function(){$("#brD").innerHTML=Array.apply(null,{length:rounds}).map(function(x,i){return '<i class="'+(i<k?"on":"")+'"></i>'}).join("")};
    var round=function(){var pat=PATS[Math.floor(r()*PATS.length)],cols=shuffle([0,1,2,3],r),len=H?6:5;seq=[];for(var i=0;i<len;i++)seq.push(cols[pat[i%pat.length]]);ans=cols[pat[len%pat.length]];lock=false;
      var opts=shuffle([ans].concat(shuffle([0,1,2,3].filter(function(x){return x!==ans}),r).slice(0,H?3:2)),r);
      $("#brK").innerHTML=opts.map(function(ci){return '<button type="button" class="key" data-c="'+ci+'" style="--c:'+RINGC[ci]+'" aria-label="'+esc(T.pz.cols[ci])+'"></button>'}).join("");draw(null);dots();o.msg(T.pz.braidQ)};
    $("#brK").addEventListener("click",function(e){var b=e.target.closest(".key");if(!b||lock)return;var ci=+b.dataset.c;if(ci===ans){lock=true;draw(ans);o.good();k++;dots();
        if(k>=rounds){o.msg(T.pz.found);mg.tm.push(setTimeout(o.done,700))}else{o.msg(T.pz.good);mg.tm.push(setTimeout(round,900))}}
      else{o.bad();o.msg(T.pz.nope);b.style.opacity=".35"}});
    round()}
};
/* dierenplaatje voor de nieuwe puzzels: Kellie's artwork als het er is, anders getekend */
function animalURL(k){if(k==="pony")return ok("pluis")?IMGROOT+"pluis.webp":(AVC.pony||(AVC.pony=(function(){var cv=document.createElement("canvas");cv.width=cv.height=120;drawPony(cv.getContext("2d"),50,112,70,{});return cv.toDataURL("image/png")})()));
  return ok("wit-"+k)?IMGROOT+"wit-"+k+".webp":avURL(k)}

/* ---------- speurboekje, plekken, menu ---------- */
function noteSheet(){var ev=[],cl=[];G.c.slots.forEach(function(s,i){if(!G.ph[i])return;
    if(s.kind==="ev")ev.push('<div class="clue ev"><canvas class="evmini" data-k="'+s.k+'" data-v="'+s.v+'" width="60" height="60"></canvas><div><em>'+esc(D.AT[s.k].s[s.v])+'</em><p>'+esc(s.t)+'</p></div></div>');
    else if(s.kind==="ex"){var sj=G.c.sus[s.j];ev.push('<div class="clue ev ex"><img class="exmini" src="'+placeURL(sj.tr,sj.idx,120)+'" alt=""><div><em>'+esc(T.exH)+'</em><p>'+esc(fill(s.t,{P:sj.name}))+'</p></div></div>')}
    else if(s.kind==="claim"){var w=G.c.claims[s.w];cl.push('<div class="clue">'+witAv(w.kind)+'<div><em>'+esc(w.who)+'</em><p>'+esc(claimText(w))+'</p></div></div>')}});
  sheet('<h2>'+T.notebook+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+'<div class="eyebrow">'+esc(T.stal)+'</div>'+stalHTML(done())+(ev.length||cl.length?'<div class="eyebrow">'+T.nbE+'</div><div class="list">'+(ev.join("")||'<p class="note">–</p>')+'</div><div class="eyebrow">'+T.nbW+'</div><div class="list">'+(cl.join("")||'<p class="note">–</p>')+'</div>':'<p class="note">'+T.nbNone+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  MW.bindCodeBox($("#sheetBody"),L);$$("#sheetBody .evmini").forEach(function(cv){var g=cv.getContext("2d");g.fillStyle="#fff2c2";g.beginPath();g.arc(30,30,28,0,7);g.fill();evIcon(g,cv.dataset.k,+cv.dataset.v,30,30,.75)});
  $("#shX").onclick=closeSheet}
function susSheet(){sheet('<h2>'+T.people+'</h2><p class="note">'+T.peopleT+'</p><div class="list">'+G.c.sus.map(susCard).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function menuSheet(){var onMap=G&&(G.mode==="map"||G.mode==="in");sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button>'+(onMap?'<button type="button" class="btn ghost dk" id="mNoMap">'+T.kv.mNoMap+'</button>':'')+'<button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mNoMap"){closeSheet();dropMap()}else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- waar is Pluis: vijf plekken, tik op de goede ---------- */
function accuseSheet(){sheet('<h2>'+T.acH+'</h2><p>'+T.acT+'</p><button type="button" class="btn red" id="vGo">'+T.acGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  say(T.acT);$("#shX").onclick=closeSheet;$("#vGo").onclick=function(){closeSheet();lineup()}}
/* ---------- finale: Karel doet het hek op slot (bluf), de gouden cijfers openen het, en daarachter… ---------- */
function lockCode(){var g=G.c.gold.slice(0,NN());return hard()?g.slice().reverse():g}
function finaleGate(){if(!G)return;if(done()<NN())return noteSheet();if(G.lockOpen)return accuseSheet();if(!G.twist)return twistSheet();lockSheet()}
function twistSheet(){G.twist=1;save();
  sheet('<div class="eyebrow">'+esc(T.twistH)+'</div><canvas id="twC" class="endscene" width="320" height="200"></canvas>'+bubble(D.TWIST,D.WITS[4][0],"big",witAv("crow"))+bubble(D.TWIST2,D.CHEF,"")+'<button type="button" class="btn" id="twGo">'+esc(T.toLock)+'</button>',true);
  gateScene($("#twC"),{crow:true});buzz([60,40,60,40,200]);beep(1200,.08);setTimeout(function(){beep(1500,.08)},90);say(D.TWIST+" "+D.TWIST2);
  $("#twGo").onclick=function(){hush();lockSheet()}}
function lockSheet(){if(window.MW.Crew&&D.CREW&&!G.rally){G.rally=1;save();hush();closeSheet();
    return MW.Crew.rally({title:D.CREW.CREW_RALLY_T,text:D.CREW.CREW_RALLY_TXT,icon:"🚧",iconDone:"🐴",color:"#f4c20d",goal:50,secs:15,okText:D.CREW.CREW_RALLY_OK,failText:D.CREW.CREW_RALLY_FAIL,then:function(){lockSheet()}})}
  var code=lockCode(),N=code.length,v=[],H=hard(),fin=false;
  var paint=function(){var d=$("#lkD");if(!d)return;d.innerHTML=code.map(function(x,i){return '<span class="'+(i<v.length?"on":"")+(i===v.length?" cur":"")+'">'+(i<v.length?v[i]:"")+'</span>'}).join("");
    /* Veulen: het hoefijzer dat je nu moet overtikken licht op (geen lezen nodig) */if(!H)$$("#sheetBody .stal.big span").forEach(function(e,i){e.classList.toggle("cur",i===v.length)})};
  sheet('<div class="eyebrow">'+esc(T.lockH)+'</div><canvas id="lkC" class="endscene" width="320" height="200"></canvas><p class="lockt">'+esc(H?T.lockT2:T.lockT)+'</p>'+stalHTML(NN(),true)+
    '<div class="lockd'+(N>8?" many":"")+'" id="lkD"></div><div class="pad" id="lkP">'+[1,2,3,4,5,6,7,8,9].map(function(d){return '<button type="button" class="key" data-d="'+d+'">'+d+'</button>'}).join("")+'<button type="button" class="key back" data-d="x" aria-label="'+esc(T.lockDel)+'">⌫</button></div>'+
    '<button type="button" class="btn ghost dk sm" id="lkH">💡 '+esc(T.lockHint)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  var sc=gateScene($("#lkC"),{lock:true});paint();say(H?T.lockT2:T.lockT);
  if(/debug/.test(location.search))window.PP_LOCK=code.join("");
  var open=function(){fin=true;G.lockOpen=true;G.oopsLock=G.oopsLock||0;save();sc.open();buzz([60,40,60,40,300]);beep(523,.15);setTimeout(function(){beep(659,.15)},150);setTimeout(function(){beep(784,.3)},300);$("#lkP").classList.add("done");
    mg.tm.push(setTimeout(gerda,1900))};
  var check=function(){if(v.length<N)return;if(v.join("")===code.join(""))open();else{G.oops=(G.oops||0)+1;save();o2bad();var d=$("#lkD");d.classList.add("shake");setTimeout(function(){d.classList.remove("shake");v=[];paint()},600);toast(T.lockBad);say(T.lockBad)}};
  var o2bad=function(){buzz(120);beep(180,.2)};
  $("#lkP").onclick=function(e){var b=e.target.closest(".key");if(!b||fin)return;if(b.dataset.d==="x")v.pop();else if(v.length<N){v.push(+b.dataset.d);beep(420+v.length*25,.05)}paint();check()};
  $("#lkH").onclick=function(){if(fin)return;var i=0;while(i<v.length&&v[i]===code[i])i++;v=v.slice(0,i);if(i<N){v.push(code[i]);G.oops=(G.oops||0)+1;save()}paint();toast(H?T.lockHintT2:T.lockHintT);check()};
  $("#shX").onclick=function(){if(fin)return;closeSheet();if(G.mode==="map"||G.mode==="demo")chip();else render()};
  if(window.MMP)MMP.helper(function(){if(fin)return;G.t0-=120000;G.oops=(G.oops||0)+2;G.skips=(G.skips||0)+1;v=code.slice();paint();open()},function(){say(H?T.lockT2:T.lockT)})}
/* het hek: Karel met zijn slot, het hek dat openzwaait. Geeft {open()} terug */
function gateScene(cv,o){var g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches,openAt=-1,api={open:function(){openAt=-2}};
  var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=(ts-t0)/1000;if(openAt===-2)openAt=t;var op=openAt>=0?Math.min(1,(t-openAt)/1.2):0;if(still&&openAt>=0)op=1;
    var sky=g.createLinearGradient(0,0,0,200);sky.addColorStop(0,"#ffd9a0");sky.addColorStop(1,"#9ad7ff");g.fillStyle=sky;g.fillRect(0,0,320,200);
    g.fillStyle="#a8e08a";g.beginPath();g.ellipse(70,150,160,36,0,0,7);g.ellipse(270,154,140,36,0,0,7);g.fill();g.fillStyle=GRASS;g.fillRect(0,150,320,50);
    if(op>.2){g.globalAlpha=Math.min(1,(op-.2)*2);for(var i=0;i<12;i++){var a=i/12*6.283+t;g.fillStyle=COL[i%4];g.beginPath();g.arc(160+Math.cos(a)*(40+op*50),100+Math.sin(a)*(26+op*30),3,0,7);g.fill()}g.globalAlpha=1}
    /* palen */g.fillStyle="#7a3b2e";g.fillRect(70,58,14,100);g.fillRect(236,58,14,100);
    /* twee hekdeuren */[[84,1],[236,-1]].forEach(function(d){g.save();g.translate(d[0],150);g.scale(d[1]*(1-op*.85),1);g.strokeStyle="#f5efe0";g.lineWidth=6;g.lineCap="round";g.beginPath();g.moveTo(0,0);g.lineTo(0,-84);g.moveTo(76,0);g.lineTo(76,-84);g.moveTo(0,-14);g.lineTo(76,-14);g.moveTo(0,-46);g.lineTo(76,-46);g.moveTo(0,-78);g.lineTo(76,-78);g.moveTo(0,-14);g.lineTo(76,-78);g.stroke();g.restore()});
    /* gouden slot */if(op<1&&(o.lock||o.crow)){var lx=160,ly=104+op*60,sw=still?0:Math.sin(t*3)*.08;g.save();g.translate(lx,ly);g.rotate(sw+op*1.5);g.globalAlpha=1-op;g.strokeStyle="#9a6a00";g.lineWidth=6;g.beginPath();g.arc(0,-14-(op>0?10:0),12,Math.PI,0);g.stroke();g.fillStyle="#f4c20d";rr(g,-18,-16,36,30,6);g.fill();g.strokeStyle="#9a6a00";g.lineWidth=2;g.stroke();drawShoe(g,0,0,8,"#9a6a00",true);g.restore()}
    /* Karel op de paal, met bluf */if(o.crow&&op<1){var by=still?0:Math.sin(t*4)*3;if(!imgAt(g,"wit-crow",246,62+by,58))drawAnimal(g,"crow",246,40+by,22);
      g.fillStyle="#fff";rr(g,96,14,124,30,12);g.fill();g.beginPath();g.moveTo(206,40);g.lineTo(222,52);g.lineTo(196,42);g.fill();g.fillStyle="#3b2a14";g.font="700 14px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(T.krr,158,34)}
    if(!still&&t<40)requestAnimationFrame(f);else if(still&&openAt>=0)requestAnimationFrame(function(){})};requestAnimationFrame(f);
  return api}
/* de twist achter het hek: is dat Pluis? Nee! Geit Gerda met het dekentje van Pluis */
function gerda(){sheet('<div class="eyebrow">'+esc(T.gerdaH)+'</div><canvas id="grC" class="endscene" width="320" height="200"></canvas><p class="pzst" id="grQ">'+esc(T.gerdaQ)+'</p><div id="grT" hidden>'+bubble(D.GERDA,D.WITS[0][0],"big",witAv("goat"))+'</div><button type="button" class="btn red" id="grGo" hidden>'+T.last+'</button>',true);
  say(T.gerdaQ);var cv=$("#grC"),g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches,shown=false;
  var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=(ts-t0)/1000;if(still)t=Math.max(t,3);var lift=Math.min(1,Math.max(0,(t-1.8)/.8));
    var sky=g.createLinearGradient(0,0,0,200);sky.addColorStop(0,"#ffd9a0");sky.addColorStop(1,"#9ad7ff");g.fillStyle=sky;g.fillRect(0,0,320,200);g.fillStyle=GRASS;g.fillRect(0,150,320,50);
    var wob=t<1.8&&!still?Math.sin(t*9)*3:0;
    if(!imgAt(g,"wit-goat",160,168,120))drawAnimal(g,"goat",160,110,44);
    /* dekentje van Pluis: rood met sterretjes, schuift eraf */g.save();g.translate(160+lift*150,62+wob-lift*30);g.rotate(lift*.9);g.fillStyle="#e63946";g.beginPath();g.moveTo(-70,0);g.quadraticCurveTo(0,-30,70,0);g.lineTo(80,90);g.quadraticCurveTo(0,104,-80,90);g.closePath();g.fill();g.strokeStyle="#f4c20d";g.lineWidth=5;g.stroke();
    g.fillStyle="#f4c20d";for(var i=0;i<5;i++){star(g,-46+i*23,48+(i%2)*14,7,3,5);g.fill()}g.fillStyle="#fff";g.font="700 16px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(D.PONY.toUpperCase(),0,26);g.restore();
    if(t<1.8){g.fillStyle="#fff";g.font="700 34px 'Fredoka',sans-serif";g.textAlign="center";g.strokeStyle="#5b3a1e";g.lineWidth=5;g.strokeText("?",60+Math.sin(t*5)*4,70);g.fillText("?",60+Math.sin(t*5)*4,70)}
    if(lift>=1&&!shown){shown=true;$("#grQ").textContent=T.gerdaA;$("#grT").hidden=false;$("#grGo").hidden=false;beep(330,.2);setTimeout(function(){beep(262,.3)},200);buzz([40,40,40]);say(T.gerdaA+" "+D.GERDA)}
    if(t<20)requestAnimationFrame(f)};requestAnimationFrame(f);
  $("#grGo").onclick=function(){hush();closeSheet();lineup()}}
function lineup(){var ov=$("#hide"),room=$("#room"),c=G.c,K=c.K;
  room.innerHTML='<div class="places">'+c.sus.map(function(s,i){return '<button type="button" class="place" data-s="'+i+'"><img src="'+placeURL(s.tr,s.idx,360)+'" alt=""><b>'+esc(cap(s.name))+'</b><div class="tags">'+ATK.map(function(k){return '<i class="t-'+k+s.tr[k]+'">'+esc(D.AT[k].s[s.tr[k]])+"</i>"}).join("")+'</div><canvas class="found" width="200" height="140"></canvas></button>'}).join("")+'</div>';
  $("#hideHint").textContent=T.lineHint;$("#hideMsg").textContent="";ov.hidden=false;say(T.lineHint);
  var fin=false;
  room.onclick=function(e){var o=e.target.closest(".place");if(!o||fin)return;G.tries++;save();
    if(+o.dataset.s===K){fin=true;o.classList.add("yes");buzz([100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);confetti();var cv=o.querySelector(".found"),g=cv.getContext("2d");if(!imgAt(g,"pluis-bibi",100,134,120)){drawPony(g,70,130,90,{halter:c.halter.slice(0,3)});drawPony(g,150,130,80,{bibi:true,flip:true})}
      $("#hideMsg").textContent=T.lineYes;say(T.lineYes);o.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(function(){finaleCine(confess)},2000)}
    else{o.classList.add("shake");setTimeout(function(){o.classList.remove("shake")},600);$("#hideMsg").textContent=T.lineNo;say(T.lineNo);buzz(120);beep(180,.2);setTimeout(function(){if(!fin)$("#hideMsg").textContent=""},2200)}};
  $("#hideX").onclick=function(){if(fin)return;ov.hidden=true;hush();if(G.mode==="map"||G.mode==="demo")chip();else render()}}
function confetti(){var ov=$("#hide");for(var i=0;i<40;i++){var s=document.createElement("i");s.className="cf";s.style.left=50+(Math.random()-.5)*60+"%";s.style.background=COL[i%4];s.style.animationDelay=Math.random()*.6+"s";s.style.setProperty("--dx",(Math.random()-.5)*200+"px");ov.appendChild(s);setTimeout(function(x){x.remove()},2600,s)}}
/* finale-film: Pluis en Bibi galopperen naar elkaar toe, regenboog, gouden hoefijzers regenen, de speurders juichen */
function finaleCine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,dpr,t0=0,fin=false,raf=0;
  $("#hide").hidden=true;ov.hidden=false;ov.classList.add("fin");var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  var lines=T.finCine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;ov.classList.remove("fin");then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  var q=rngOf(G.seed+3),rain=[];for(var i=0;i<26;i++)rain.push({x:q(),d:q()*2.5,s:.6+q()*.7,r:q()*6});
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?7:t;
    g.setTransform(dpr,0,0,dpr,0,0);var sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#ffb38a");sky.addColorStop(.55,"#ffe2a8");sky.addColorStop(1,"#9ad7ff");g.fillStyle=sky;g.fillRect(0,0,w,h);
    var base=h*.72;
    /* regenboog groeit */var rb=Math.min(1,Math.max(0,(ph-2.2)/1.4));if(rb>0){["#e63946","#f4a261","#f4c20d","#2a9d4b","#6ec3ff","#7c3aed"].forEach(function(c,k){g.strokeStyle=c;g.lineWidth=Math.max(6,w*.018);g.globalAlpha=.85;g.beginPath();g.arc(w/2,base,w*.47-k*g.lineWidth,Math.PI,Math.PI+Math.PI*rb);g.stroke()});g.globalAlpha=1}
    g.fillStyle="#a8e08a";g.beginPath();g.ellipse(w*.2,base,w*.6,h*.06,0,0,7);g.ellipse(w*.85,base+6,w*.5,h*.07,0,0,7);g.fill();g.fillStyle=GRASS;g.fillRect(0,base,w,h-base);
    /* galop naar elkaar toe */var m=Math.min(1,ph/2.2),e=1-Math.pow(1-m,2),ph2=Math.max(0,ph-2.2),hop=m<1&&!still?Math.abs(Math.sin(ph*9))*h*.02:Math.abs(Math.sin(ph2*3))*h*.008,PH=Math.min(180,h*.24);
    var px=w*(-.15+e*.53),bx=w*(1.15-e*.53);
    if(m>=1&&ok("pluis-bibi")){imgAt(g,"pluis-bibi",w/2,base+h*.05-hop,PH*1.15)}
    else{if(!imgAt(g,"pluis-walk",px,base+h*.05-hop,PH))drawPony(g,px,base+h*.05-hop,PH*.7,{walk:ph*9,halter:G.c.halter.slice(0,3)});
      if(!imgAt(g,"bibi",bx,base+h*.05-hop,PH*.95))drawPony(g,bx,base+h*.05-hop,PH*.66,{bibi:true,flip:true,walk:ph*9})}
    /* stofwolkjes */if(m<1){g.fillStyle="rgba(233,216,166,.7)";for(i=0;i<4;i++){g.beginPath();g.arc(px-40-i*14,base+h*.05,6+i*2,0,7);g.arc(bx+40+i*14,base+h*.05,6+i*2,0,7);g.fill()}}
    /* hartjes */if(ph>2.2){for(i=0;i<6;i++){var hy=base-h*.12-((ph2*60+i*40)%(h*.3)),hx=w/2+Math.sin(ph2*2+i)*30+(i-3)*8,al=1-((ph2*60+i*40)%(h*.3))/(h*.3);g.fillStyle="rgba(255,59,107,"+al+")";g.save();g.translate(hx,hy);g.scale(.8,.8);g.beginPath();g.moveTo(0,10);g.bezierCurveTo(-16,-4,-10,-20,0,-9);g.bezierCurveTo(10,-20,16,-4,0,10);g.fill();g.restore()}}
    /* gouden hoefijzers regenen */if(ph>2.6){rain.forEach(function(r){var yy=((ph-2.6-r.d)*h*.35*r.s);if(yy<0)return;yy=yy%(h*1.1)-20;g.save();g.translate(r.x*w,yy);g.rotate(r.r+ph);drawShoe(g,0,0,9,"#9a6a00",true);drawShoe(g,0,-1,9,"#f4c20d",true);g.restore()})}
    /* speurders juichen */if(ph>3.2){var ky=h-Math.min(1,(ph-3.2)/.6)*h*.2;imgAt(g,"kids-row",w/2,ky+h*.2,Math.min(220,h*.26))}
    /* GEVONDEN */if(ph>2.4){var sc2=Math.min(1,(ph-2.4)/.4),bounce=1+Math.sin(Math.min(1,(ph-2.4)/.4)*Math.PI)*.15,fs=Math.round(Math.min(64,w*.13)*sc2*bounce);g.textAlign="center";g.lineJoin="round";g.fillStyle="#fff";g.strokeStyle="#5b3a1e";g.lineWidth=7;g.font="700 "+fs+"px 'Fredoka','Arial Rounded MT Bold',sans-serif";g.strokeText(T.found,w/2,h*.28);g.fillText(T.found,w/2,h*.28)}
    var li=Math.min(lines.length-1,Math.floor(ph/2.4));txt.textContent=lines[li];if(li!==spoken&&!still){spoken=li;say(lines[li])}
    if(ph>8.6&&!still)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);
  if(still)setTimeout(end,4000)}
/* het geheim: Kato vertelt, Pluis en Bibi neus aan neus, de keuze */
function confess(){var c=G.c,w=c.claims[c.Li];G.tEnd=G.tEnd||Date.now();save();$("#hide").hidden=true;
  sheet('<div class="eyebrow">'+esc(T.confess)+'</div><canvas id="endC" class="endscene" width="320" height="200"></canvas>'+bubble(fill(D.END,vars()),D.WITS[3][0],"big",witAv("cat"))+
    '<p class="note liar">'+esc(fill(hard()?T.liarWas2:T.liarWas,{W:w.who,w:claimText(w)}))+'</p><p>'+esc(D.END2)+'</p><button type="button" class="btn" id="eA">'+esc(D.ENDA)+'</button><button type="button" class="btn ghost dk" id="eB">'+esc(D.ENDB)+'</button>',true);
  endScene($("#endC"));say(fill(D.END,vars())+" "+D.END2);
  var pickEnd=function(k){G.end=k;save();var t=k==="A"?D.ENDAT:D.ENDBT;sheet('<div class="eyebrow">'+esc(T.found)+'</div><canvas id="endC" class="endscene" width="320" height="200"></canvas>'+bubble(t,D.CHEF,"big")+'<button type="button" class="btn" id="bPhoto">'+T.goOn+'</button>',true);endScene($("#endC"),true);say(t);
    $("#bPhoto").onclick=function(){closeSheet();photoSheet("arrest",win)}};
  $("#eA").onclick=function(){pickEnd("A")};$("#eB").onclick=function(){pickEnd("B")}}
function endScene(cv,hearts){var g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=(ts-t0)/1000;
    var sky=g.createLinearGradient(0,0,0,200);sky.addColorStop(0,"#ffd9a0");sky.addColorStop(1,"#9ad7ff");g.fillStyle=sky;g.fillRect(0,0,320,200);g.fillStyle="#a8e08a";g.beginPath();g.ellipse(60,150,160,40,0,0,7);g.ellipse(280,154,140,40,0,0,7);g.fill();g.fillStyle=GRASS;g.fillRect(0,150,320,50);
    g.strokeStyle="#5b3a1e";g.lineWidth=2;for(var i=0;i<8;i++){g.strokeStyle=COL[i%4];g.lineWidth=3;g.beginPath();g.moveTo(i*44,30+Math.sin(t+i)*3);g.lineTo(i*44+22,46+Math.sin(t+i+1)*3);g.lineTo(i*44+44,30+Math.sin(t+i+2)*3);g.stroke()}
    var bob=still?0:Math.sin(t*2)*2;if(!imgAt(g,"pluis-bibi",160,165,120)){drawPony(g,105,160+bob,82,{halter:G.c.halter.slice(0,3)});drawPony(g,215,160-bob,76,{bibi:true,flip:true})}
    if(hearts||t>1){for(i=0;i<4;i++){var hy=120-((t*20+i*30)%80),hx=150+Math.sin(t+i)*12+i*5;g.fillStyle="rgba(255,59,107,"+(1-((t*20+i*30)%80)/80)+")";g.save();g.translate(hx,hy);g.scale(.5,.5);g.beginPath();g.moveTo(0,10);g.bezierCurveTo(-16,-4,-10,-20,0,-9);g.bezierCurveTo(10,-20,16,-4,0,10);g.fill();g.restore()}}
    if(!still&&t<30)requestAnimationFrame(f)};requestAnimationFrame(f)}

/* ---------- gewonnen ---------- */
var RES=null,TEAM=LS.get("ss_pp_team",""),CLUB=LS.get("ss_pp_club","");
function win(){if(window.MMP&&MMP.hasTreasure()&&!G.trDone){G.trDone=1;G.tEnd=G.tEnd||Date.now();save();$("#hide").hidden=true;return MMP.finale(win)}var c=G.c,min=((G.tEnd||Date.now())-G.t0)/60000,s2=G.tries===1,s3=true,stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:cap(c.sus[c.K].name),code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.pp.day=MW.today();MW.profile.save(p)}
  Wk.stopWatch();buzz([100,50,100,50,300]);
  var st=a.prof.streak,code=G.code;
  var tm=window.MMP?MMP.team():{i:-1,name:"",col:null};
  RES={ph:G.ph.slice(),team:G.team,arrest:G.arrest,album:(G.album||[]).map(function(a){return a.u}),code:code,stars:stars,min:Math.round(min),secs:Math.round(((G.tEnd||Date.now())-G.t0)/1000),v:vars(),slots:G.c.slots.slice(),K:c.sus[c.K],halter:c.halter,seed:G.seed,end:G.end,
    n:NN(),lvl:G.lvl||LEVEL,gold:c.gold.slice(0,NN()),tcol:tm.col,tname:tm.name,gl:G.gl||0};
  sheet('<div class="eyebrow">'+T.won+' · '+esc(code)+'</div><div class="stars">'+shoeStars(stars)+'</div><h2>'+esc(cap(c.sus[c.K].name))+'</h2>'+
    '<canvas id="strip" width="1080" height="1350" class="stripc"></canvas>'+
    '<div class="tags"><i>'+Math.round(min)+' min</i></div>'+
    ''+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+T.missed2+'</p>':'')+
    '<button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#strip");drawAlbum(cv,RES);
  $("#vDip").onclick=dipSheet;
  $("#vShare").onclick=function(){shareAlbum(cv)};
  $("#vDl").onclick=function(){dlCanvas(cv,albumName())};
  $("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP)MMP.result($("#sheetBody"),{code:G.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function shoeStars(n){var s="";for(var i=0;i<3;i++)s+='<span class="'+(i<n?"on":"")+'">∩</span>';return s}
function loadImgs(list,cb){var IMG={},left=list.filter(Boolean).length;if(!left)return cb(IMG);list.filter(Boolean).forEach(function(src){if(IMG[src]!==undefined){if(--left===0)cb(IMG);return}IMG[src]=null;var im=new Image();im.onload=im.onerror=function(){IMG[src]=im.width?im:null;if(--left===0)cb(IMG)};im.src=src})}
function polaroid(g,im,x,y,pw,phh,cap2,rot,font,withPony,halter){var imgH=phh-pw*.34;g.save();g.translate(x+pw/2,y+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);
  g.shadowColor="rgba(0,0,0,.3)";g.shadowBlur=18;g.shadowOffsetY=8;g.fillStyle="#fff";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
  var pad=pw*.06,iw=pw-2*pad;if(im){var s=Math.max(iw/im.width,imgH/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();g.drawImage(im,pad+(iw-w)/2,pad+(imgH-h)/2,w,h);g.restore()}else{var sky=g.createLinearGradient(0,pad,0,pad+imgH);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(1,GRASS);g.fillStyle=sky;g.fillRect(pad,pad,iw,imgH);if(!imgAt(g,"kids-row",pw/2,pad+imgH-8,imgH*.8))drawPony(g,pw/2,pad+imgH-10,imgH*.6,{halter:halter})}
  if(withPony){g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();if(!imgAt(g,"pluis",pad+iw*.78,pad+imgH-4,imgH*.6))drawPony(g,pad+iw*.78,pad+imgH-6,imgH*.42,{halter:halter});g.restore()}
  g.fillStyle="#1e293b";g.font=font;g.textAlign="center";g.fillText(cap2,pw/2,phh-pw*.1,pw-20);g.restore()}
/* album: alle groepsfoto's + titel, zaakcode, tijd, sterren, teamkleur en de gouden hoefijzers, in één afbeelding */
function albumName(){return (L==="nl"?"ponyalbum-":"pony-album-")+RES.code+".jpg"}
function dlCanvas(cv,name){try{cv.toBlob(function(b){if(!b)return;var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)},"image/jpeg",.88)}catch(e){toast(T.noFile)}}
function shareAlbum(cv){var txt=fill(T.shareTxt,{c:RES.code,s:"★".repeat(RES.stars),m:RES.min})+location.origin+location.pathname+"#z="+RES.code;
  cv.toBlob(function(b){var f=null;try{f=b&&new File([b],albumName(),{type:"image/jpeg"})}catch(e){}
    if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:txt}).catch(function(){})}else{dlCanvas(cv,albumName());toast(T.albumSaved)}},"image/jpeg",.88)}
function albumSheet(){if(!RES)return;sheet('<div class="eyebrow">'+esc(T.albumH)+'</div><canvas id="strip" width="1080" height="1350" class="stripc"></canvas><button type="button" class="btn" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button>',true);
  var cv=$("#strip");drawAlbum(cv,RES);$("#vShare").onclick=function(){shareAlbum(cv)};$("#vDl").onclick=function(){dlCanvas(cv,albumName())};$("#dBack").onclick=function(){closeSheet();winBack()}}
function goldStamp(g,x,y,r,d,on){g.save();g.translate(x,y);g.fillStyle=on?"#fff6d6":"rgba(255,255,255,.4)";g.beginPath();g.arc(0,0,r,0,7);g.fill();g.strokeStyle=on?"#9a6a00":"rgba(0,0,0,.2)";g.lineWidth=r*.08;g.setLineDash([r*.18,r*.12]);g.beginPath();g.arc(0,0,r*.9,0,7);g.stroke();g.setLineDash([]);
  if(on){drawShoe(g,0,-r*.05,r*.55,"#9a6a00",true);drawShoe(g,0,-r*.1,r*.55,"#f4c20d",true);g.fillStyle="#5b3a1e";g.font="700 "+Math.round(r*.6)+"px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(d,0,r*.02);g.textBaseline="alphabetic"}g.restore()}
function drawAlbum(cv,r){var g=cv.getContext("2d"),W2=1080,pics=[{u:r.team,c:T.teamH,team:true}].concat((r.album||[]).map(function(u,i){return{u:u,c:T.poseH+" "+(i+1)}})).concat([{u:r.arrest,c:T.arrestH,pony:true}]),
    rows=Math.ceil(pics.length/2),PH=560,H=300+rows*PH+350;cv.width=W2;cv.height=H;
  loadImgs(pics.map(function(p){return p.u}),function(IMG){
    var sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(.3,"#d8f0ff");sky.addColorStop(.31,"#a8e08a");sky.addColorStop(1,"#6fb860");g.fillStyle=sky;g.fillRect(0,0,W2,H);var q=rngOf(r.seed);for(var i=0;i<70;i++){g.fillStyle=COL[i%4];g.globalAlpha=.45;g.beginPath();g.arc(q()*W2,H*.32+q()*H*.66,4+q()*5,0,7);g.fill()}g.globalAlpha=1;
    for(i=0;i<W2;i+=90){g.strokeStyle=COL[(i/90)%4];g.lineWidth=6;g.beginPath();g.moveTo(i,20);g.lineTo(i+45,50);g.lineTo(i+90,20);g.stroke()}
    /* teamkleur-lint */if(r.tcol){g.fillStyle=r.tcol;g.fillRect(0,62,W2,22);g.fillStyle="#fff";g.font="700 18px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(fill(T.albumTeam,{t:r.tname}).toUpperCase(),W2/2,80)}
    g.textAlign="center";g.lineJoin="round";g.fillStyle="#fff";g.strokeStyle="#5b3a1e";g.lineWidth=10;g.font="700 62px 'Fredoka','Arial Rounded MT Bold',sans-serif";var ttl=r.v.J?fill(T.albumTitleJ,{J:r.v.J}):T.albumTitle;g.strokeText(ttl,W2/2,148,W2-80);g.fillText(ttl,W2/2,148,W2-80);
    g.fillStyle="#3b2a14";g.font="600 28px 'Fredoka',sans-serif";g.fillText(fill(T.albumSub,{c:r.code,m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars),l:T.lvl[r.lvl]||"",n:T.lens[lenOf(r.n)]||""}),W2/2,196,W2-60);
    g.fillStyle="#5b3a1e";g.font="italic 500 26px 'Barlow',sans-serif";g.fillText(fill(T.albumFound,r.v),W2/2,240,W2-80);
    var pw=440,ph=PH-50;pics.forEach(function(p,i){var col=i%2,row=Math.floor(i/2),alone=i===pics.length-1&&pics.length%2===1,x=alone?(W2-pw)/2:col?W2-80-pw:80,y=280+row*PH+(col?18:0);
      polaroid(g,IMG[p.u],x,y,pw,ph,p.c,(i%2?.03:-.03)*(row%2?-1:1),"700 30px 'Permanent Marker',cursive",!!p.pony,r.halter)});
    var sy=280+rows*PH+40,N=r.gold.length,per=Math.min(N,11),gap=Math.min(90,(W2-120)/per),x0=W2/2-(per-1)*gap/2;
    g.fillStyle="#fffaf0";g.font="700 24px 'Fredoka',sans-serif";g.fillText(T.stal.toUpperCase(),W2/2,sy-6);
    r.gold.forEach(function(d,i){goldStamp(g,x0+i*gap,sy+52,Math.min(38,gap*.44),d,true)});
    if(!imgAt(g,"pluis",W2-120,H-30,150))drawPony(g,W2-120,H-36,100,{halter:r.halter});
    g.fillStyle="#fffaf0";g.font="600 24px 'Fredoka',sans-serif";g.fillText(T.stripSub,W2/2,H-34)})}
function endCase(){LS.del(GK);G=null;hush();home()}

/* ---------- Ruiterpaspoort: A4 op canvas, als PDF (één JPEG-pagina) of als afbeelding ---------- */
function dipSheet(){if(!RES)return;
  sheet('<h2>'+T.dipH+'</h2><p>'+T.dipClubT+'</p><input class="inp team" id="dClub" autocomplete="off" maxlength="40" placeholder="'+esc(T.dipClubP)+'" value="'+esc(CLUB)+'"><p>'+T.dipT+'</p><input class="inp team" id="dTeam" autocomplete="off" maxlength="120" placeholder="'+esc(T.dipP)+'" value="'+esc(TEAM)+'"><button type="button" class="btn" id="dGo">'+T.dipGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){closeSheet();winBack()};
  $("#dGo").onclick=function(){TEAM=$("#dTeam").value.trim();CLUB=$("#dClub").value.trim().slice(0,40);LS.set("ss_pp_team",TEAM);LS.set("ss_pp_club",CLUB);dipShow()}}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div><h2>'+esc(cap(r.v.P))+'</h2><button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vAlb">📷 '+T.albumBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  $("#vDip").onclick=dipSheet;$("#vAlb").onclick=albumSheet;$("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP&&RES.secs!=null)MMP.result($("#sheetBody"),{code:RES.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function a4Sheet(title,note,fname,drawFn){var r=RES;
  sheet('<div class="eyebrow">'+esc(title)+'</div><canvas id="dip" width="1240" height="1754" class="stripc a4"></canvas><p class="note">'+esc(note)+'</p><button type="button" class="btn" id="dPdf">'+T.dipPdf+'</button><button type="button" class="btn ghost dk" id="dImg">'+T.dipImg+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#dip");drawFn(cv,r);
  $("#dPdf").onclick=function(){var jpg=cv.toDataURL("image/jpeg",.9),blob=pdfFromJpeg(jpg,cv.width,cv.height),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=fname+"-"+r.code+".pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)};
  $("#dImg").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],fname+"-"+r.code+".jpg",{type:"image/jpeg"});
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){})}else{var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.9);a.download=fname+"-"+r.code+".jpg";document.body.appendChild(a);a.click();a.remove()}},"image/jpeg",.9)};
  $("#dBack").onclick=function(){closeSheet();winBack()};$("#vHome").onclick=function(){closeSheet();endCase()}}
function dipShow(){a4Sheet(T.dipH,T.dipNote,L==="nl"?"ruiterpaspoort":"riders-passport",function(cv,r){drawDiploma(cv,r,TEAM,CLUB)})}
function names(g,team,y,W2,col){if(!team)return y;var list=team.split(/[,;]+/).map(function(s){return s.trim()}).filter(Boolean),line="",lines=[];g.font="700 36px 'Permanent Marker','Comic Sans MS',cursive";g.textAlign="center";
  list.forEach(function(nm){var t=line?line+"  ·  "+nm:nm;if(g.measureText(t).width>W2-260&&line){lines.push(line);line=nm}else line=t});if(line)lines.push(line);
  g.fillStyle=col;lines.slice(0,y>1440?2:3).forEach(function(l){g.fillText(l,W2/2,y);y+=46});return y+10}
function emblem(g,x,y,s,name){g.save();g.translate(x,y);g.shadowColor="rgba(0,0,0,.3)";g.shadowBlur=20;g.fillStyle="#f4c20d";g.beginPath();g.arc(0,0,s,0,7);g.fill();g.shadowBlur=0;g.strokeStyle="#9a6a00";g.lineWidth=s*.05;g.stroke();
  g.fillStyle="#fffaf0";g.beginPath();g.arc(0,0,s*.8,0,7);g.fill();drawShoe(g,0,-s*.08,s*.46,"#9a6a00",true);drawShoe(g,0,-s*.12,s*.46,"#f4c20d",true);
  g.fillStyle="#5b3a1e";g.font="700 "+Math.round(s*.2)+"px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(String(name).toUpperCase().slice(0,10),0,s*.02,s*1.3);g.restore()}
function drawDiploma(cv,r,team,club){var g=cv.getContext("2d"),W2=cv.width,H=cv.height,v=r.v;
  var dateStr=new Date().toLocaleDateString(L==="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"});
  loadImgs([r.team,r.arrest],function(IMG){
    g.fillStyle="#fffaf0";g.fillRect(0,0,W2,H);var q=rngOf(r.seed+9);for(var i=0;i<200;i++){g.fillStyle="rgba(150,110,60,"+(q()*.08)+")";g.beginPath();g.arc(q()*W2,q()*H,q()*5,0,7);g.fill()}
    g.strokeStyle="#5b3a1e";g.lineWidth=10;g.strokeRect(70,70,W2-140,H-140);g.strokeStyle="#f4c20d";g.lineWidth=3;g.strokeRect(92,92,W2-184,H-184);
    for(i=0;i<4;i++){var cx=i%2?W2-120:120,cy=i<2?120:H-120;drawShoe(g,cx,cy,22,"#9a6a00",true)}
    emblem(g,W2/2,250,95,v.J||(L==="nl"?"RUITER":"RIDER"));
    g.textAlign="center";g.fillStyle="#5b3a1e";g.font="700 86px 'Fredoka','Arial Rounded MT Bold',sans-serif";g.fillText(T.dipTitle,W2/2,420);
    g.fillStyle="#9a6a00";g.font="600 24px 'Fredoka',sans-serif";g.fillText(T.dipSub.split("").join(String.fromCharCode(8202)),W2/2,462);
    g.fillStyle="#1e293b";g.font="500 34px 'Barlow','Segoe UI',sans-serif";g.fillText(T.dipL1,W2/2,540);
    g.fillStyle="#5b3a1e";g.font="700 64px 'Fredoka',sans-serif";g.fillText(v.J?fill(T.dipL2,{J:v.J}):T.dipL2b,W2/2,616,W2-240);
    g.fillStyle="#1e293b";g.font="500 34px 'Barlow',sans-serif";g.fillText(T.dipL3,W2/2,672);
    if(r.tcol){g.fillStyle=r.tcol;g.fillRect(92,680,W2-184,14);g.fillStyle=r.tcol;g.font="700 22px 'Fredoka',sans-serif";g.fillText(fill(T.albumTeam,{t:r.tname}).toUpperCase(),W2/2,718)}
    var pw=300,phh=360,gap=60,x0=(W2-2*pw-gap)/2,y0=736;polaroid(g,IMG[r.team],x0,y0,pw,phh,T.teamH,-.03,"700 24px 'Permanent Marker',cursive",false,r.halter);polaroid(g,IMG[r.arrest],x0+pw+gap,y0+14,pw,phh,T.arrestH,.03,"700 24px 'Permanent Marker',cursive",true,r.halter);
    var y=y0+phh+66;g.fillStyle="#1e293b";g.font="italic 500 28px 'Barlow',sans-serif";g.fillText(fill(T.dipL4,v),W2/2,y,W2-220);y+=42;
    var gold=r.gold||[],nn=r.n||gold.length||8;
    g.fillStyle="#64748b";g.font="500 26px 'Barlow',sans-serif";g.fillText(fill(T.dipDate2,{d:dateStr,m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars),n:nn,l:T.lens[lenOf(nn)]||"",v:T.lvl[r.lvl]||""}),W2/2,y,W2-220);y+=36;
    /* hoefijzer-stempels: één per plek, met het gouden cijfer */if(gold.length){var gp=Math.min(84,(W2-300)/gold.length),gx=W2/2-(gold.length-1)*gp/2;y+=34;gold.forEach(function(d,i){g.save();g.translate(gx+i*gp,y);g.rotate(((i*37)%9-4)*.03);goldStamp(g,0,0,Math.min(34,gp*.42),d,true);g.restore()});y+=76}
    if(club){g.fillStyle="#9a6a00";g.font="600 22px 'Fredoka',sans-serif";g.fillText(T.dipClub.toUpperCase(),W2/2,y);y+=48;g.fillStyle="#5b3a1e";g.font="700 46px 'Fredoka',sans-serif";g.fillText(club,W2/2,y,W2-260);y+=40}
    if(team){g.fillStyle="#9a6a00";g.font="600 22px 'Fredoka',sans-serif";g.fillText(T.dipTeam.toUpperCase(),W2/2,y);y+=42;y=names(g,team,y,W2,"#5b3a1e")}
    if(r.gl>=3){g.save();g.translate(200,H-200);g.rotate(-.18);g.fillStyle="#ff8fab";star(g,0,0,86,70,12);g.fill();g.strokeStyle="#e63946";g.lineWidth=4;g.stroke();g.fillStyle="#fff";g.font="700 22px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(T.dipGlimpse,0,-10,140);g.font="700 16px 'Fredoka',sans-serif";g.fillText("3 × ★",0,16);g.restore()}
    if(!imgAt(g,"pluis",W2-200,H-150,190))drawPony(g,W2-200,H-150,130,{halter:r.halter});g.save();g.translate(W2-200,H-110);g.rotate(-.08);g.fillStyle="#e63946";g.font="700 30px 'Fredoka',sans-serif";g.fillText(T.dipStamp,0,0);g.restore();
    var sy=H-185;g.strokeStyle="#5b3a1e";g.lineWidth=2;g.beginPath();g.moveTo(W2/2-260,sy);g.lineTo(W2/2+140,sy);g.stroke();
    g.fillStyle="#5b3a1e";g.font="700 40px 'Permanent Marker',cursive";g.save();g.translate(W2/2-120,sy-18);g.rotate(-.04);g.fillText("Fenna",0,0);g.restore();drawHoofPrint(g,W2/2+60,sy-30,22,"rgba(91,58,30,.7)");
    g.fillStyle="#64748b";g.font="500 22px 'Barlow',sans-serif";g.fillText(T.dipSign,W2/2-60,sy+36);
    g.fillStyle="#64748b";g.font="500 20px 'Fredoka',sans-serif";g.fillText(fill(T.dipFoot,{c:r.code}),W2/2,H-100)})}
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

/* ---------- zaakcode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();LEN=lenOf(p.n);LS.set("ss_pp_len",LEN);begin(p.seed,p.mode,false,p.n)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.pp,log=(g&&g.log)||[],st=function(k){return"∩".repeat(k||0)};
  sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min</small><div class="tags"><i>'+st(x.st)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();stopHead();stopSteps();G=null;hush();home()}
function wipeGame(){LS.del(GK);Wk.stopWatch();stopHead();stopSteps();G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);MW.profile.wipe();if(/github\.io$/.test(location.hostname))LS.del(MW.pro.freeKey(ID));closeSheet();home();toast(T.wiped)})}}
function goBack(){if(!$("#hide").hidden){$("#hideX").click();return true}if(!$("#cine").hidden){$("#cineX").click();return true}
  if(!$("#sheet").hidden){if($("#sheet").dataset.lock){var x=$("#vHome")||$("#shX")||$("#bNext")||$("#pSkip")||$("#bPhoto")||$("#eA");if(x)x.click()}else closeSheet();return true}
  if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({pp:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({pp:1},"")}catch(e){}}})}catch(e){}

/* ---------- startscherm: zonnige wei, een hek, vlinders en Pluis die voorbijdraaft ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,bf=[],dpr=1,px=-100;
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;bf=[];for(var i=0;i<(still?0:7);i++)bf.push({x:Math.random()*w,y:Math.random()*h*.5,s:5+Math.random()*5,v:.3+Math.random()*.4,a:Math.random()*6.3,c:COL[i%4]})}
  rs();addEventListener("resize",rs);
  function f(t){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);if($("#home").hidden){requestAnimationFrame(f);return}
    var base=Math.min(h*.5,380);
    if(!ok("hero")){/* wei */g.fillStyle="#a8e08a";g.beginPath();g.ellipse(w*.2,base,w*.5,h*.06,0,0,7);g.ellipse(w*.85,base+4,w*.5,h*.07,0,0,7);g.fill();g.fillStyle=GRASS;g.fillRect(0,base+6,w,h*.2);
      g.fillStyle="#f5efe0";for(var i=20;i<w;i+=70){g.fillRect(i,base-30,8,42)}g.fillRect(0,base-22,w,6);g.fillRect(0,base-4,w,6);
      g.fillStyle="#fde047";g.shadowColor="#fff";g.shadowBlur=30;g.beginPath();g.arc(w*.82,base*.3,30,0,7);g.fill();g.shadowBlur=0;
      g.fillStyle="#fff";[[.15,.22],[.5,.14],[.7,.28]].forEach(function(c){var cx=c[0]*w+Math.sin(t/4000)*10,cy=c[1]*base;g.beginPath();g.arc(cx,cy,14,0,7);g.arc(cx+16,cy-6,18,0,7);g.arc(cx+36,cy,14,0,7);g.fill()});
      if(!still){px+=.6;if(px>w+120)px=-120}else px=w*.5;if(!imgAt(g,"pluis-walk",px,base+16,120))drawPony(g,px,base+16,80,{walk:t/110});}
    bf.forEach(function(b){g.save();g.translate(b.x,b.y);var fl=Math.sin(t/120+b.a);g.fillStyle=b.c;g.beginPath();g.ellipse(-b.s*.6*Math.abs(fl)-1,0,b.s*.6*Math.abs(fl)+.5,b.s*.5,0,0,7);g.ellipse(b.s*.6*Math.abs(fl)+1,0,b.s*.6*Math.abs(fl)+.5,b.s*.5,0,0,7);g.fill();g.restore();b.x+=Math.sin(t/900+b.a)*.6;b.y-=b.v*.3;if(b.y<-20){b.y=h*.5;b.x=Math.random()*w}});
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
hero();
if(/debug/.test(location.search)){window.PP_DRAW={drawPony:drawPony,drawAnimal:drawAnimal,drawPlace:drawPlace,drawFenna:drawFenna,begin:begin,noMapSheet:noMapSheet,dropMap:dropMap,glimpse:function(){GL.next=0;glimpseTick()}};window.PP_TEST={G:function(){return G},parse:parseCode,make:makeCode,gen:genCase,task:function(i){var sp=G.st&&G.st.filter(function(x){return x.fi===i})[0];taskSheet(i,sp||null)},fixG:fixG}}
/* ---------- start ---------- */
var hz=/[#&]z=([A-Z0-9]+)/i.exec(location.hash);
if(window.MMP)MMP.init({id:ID,fin:{nl:'Fenna fluistert: Pluis heeft nog een geheim. Er ligt iets voor jullie verstopt, echt, niet op het scherm.',en:'Fenna whispers: Fluff has one more secret. Something is hidden for you, for real, not on the screen.'}});
home();if(hz){var pc=parseCode(hz[1]);if(pc)codeSheet(hz[1].toUpperCase())}
MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
})();
