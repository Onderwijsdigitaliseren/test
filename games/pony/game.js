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
var G=null,tick=0,MODE=LS.get("ss_pp_mode","map"),NAME=LS.get("ss_pp_name",""),VOICE=LS.get("ss_pp_voice",true),LEVEL=LS.get("ss_pp_level","veulen");
var ATK=["vlag","dier","voer"],NS=5,ALL=31,ORDER=["e0","w0","e1","w1","e2","w2","g","w3"],ACTS=["hoof","look","brush","apples","halter","shiny","pet","maze"];
var W=[],P={x:0,y:0,acc:0},R0=550,map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null,photoFor=null;
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
function say(t){if(!VOICE||!t)return;try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(String(t).replace(/[“”"]/g,"").replace(/\{[^}]+\}/g,""));u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.92;u.pitch=1.08;ss.speak(u)}catch(e){}}
function hush(){try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
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
function genCase(seed,mode){
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
    var slots=ORDER.map(function(o,i){var act=ACTS[i],p=D.PUZ[act],s={act:act,id:act,what:p[0],ask:p[1],react:p[2]};
      if(o==="g"){s.kind="gag";s.t=pick(D.GAG)}
      else if(o[0]==="e"){var e=ev[+o[1]];s.kind="ev";s.k=e.k;s.v=e.v;s.t=pick(D.EV[e.k][e.v])}
      else{s.kind="claim";s.w=+o[1]}
      return s});
    return{sus:sus,K:K,claims:claims,Li:Li,slots:slots,ev:ev,halter:halter}
  }
  return null}
function makeCode(seed,mode){return"PP"+(mode==="in"?"B":mode==="map"||mode==="demo"?"K":"S")+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);if(!/^PP[KSB]/.test(c)||c.length<4||c.length>11)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;return{mode:c[2]==="B"?"in":c[2]==="K"?"map":"street",seed:seed}}
function vars(){var c=G.c,k=c.sus[c.K];return{P:k.name,PV:D.AT.vlag.v[k.tr.vlag],PD:D.AT.dier.v[k.tr.dier],PE:D.AT.voer.v[k.tr.voer],J:NAME,C:pony()}}
function claimText(w){return fill(w.t,{v:D.AT[w.k].v[w.v]})}
function done(){return G.ph.filter(Boolean).length}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get();
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.pp&&p.games.pp.n)||0;
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.has(ID),lk=MW.pro.locked(ID),playedToday=(p.games.pp&&p.games.pp.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=MW.t(L).tBtn+" · "+MW.cfg.team.price;
  $("#status").textContent=MW.statusText(L,ID);MW.homeOrder(lk);
  $("#name").value=NAME;voiceBtn();
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});
  $$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===LEVEL)});
  show("home")}
function voiceBtn(){var b=$("#bVoice");if(b){b.textContent=(VOICE?"🔊 ":"🔇 ")+T.voice;b.setAttribute("aria-pressed",VOICE)}}
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"team",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)},ID)}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MODE=b.dataset.m;LS.set("ss_pp_mode",MODE);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#lvl").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;LEVEL=b.dataset.l;LS.set("ss_pp_level",LEVEL);$$("#lvl button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_pp_name",NAME)});
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_pp_voice",VOICE);voiceBtn();toast(VOICE?T.voiceOn:T.voiceOff);if(VOICE)say(T.voiceOn);else hush()};
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(hashStr("pp|"+MODE+"|"+MW.today()),MODE,true)};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(Math.floor(Math.random()*4e9),MODE,false)};
$("#bPro").onclick=proSheet;
$("#bDemo").onclick=function(){var w=ehvWorld();build(Math.floor(Math.random()*4e9),"demo",w.pois,w.ways,null,false)};
$("#bHow").onclick=function(){sheet('<h2>'+T.howH+'</h2>'+$("#howT").innerHTML+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet};
$("#bResume").onclick=function(){G=LS.get(GK,null);if(!G)return home();W=LS.get(WK,[]);P={x:G.px||0,y:G.py||0,acc:0};imReady().then(enter)};
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

/* ---------- een zaak beginnen ---------- */
function begin(seed,mode,daily){if(mode!=="map")return build(seed,mode,null,null,null,daily);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      build(seed,"map",w.pois,w.ways,w.origin,daily);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})})
  }).catch(function(e){Wk.loading("");fail(e==="nogps"?T.noGps:T.denied)})}
function fail(m){sheet('<h2>'+T.fail+'</h2><p>'+esc(m)+'</p><button type="button" class="btn" id="shX">'+T.back+'</button>');$("#shX").onclick=closeSheet}
function build(seed,mode,pois,ways,origin,daily){
  var c=genCase(seed,mode);if(!c){toast("…");return}
  G={seed:seed,code:makeCode(seed,mode),mode:mode,lvl:LEVEL,c:c,i:0,ph:[],team:null,arrest:null,t0:0,tries:0,daily:!!daily,dist:0,origin:origin,px:0,py:0,st:null,cine:false,end:null};
  if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,R0,8,r,T.corner);
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het|the) /,"")),fi:i,done:false}});
    W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  Wk.loading(T.pois);imReady().then(function(){Wk.loading("");brief()})}
function brief(){var c=G.c;LEVEL=G.lvl||LEVEL;
  $("#bfNo").textContent=fill(T.briefNo,{c:G.code})+(G.mode==="demo"?" · "+T.demoCase:"")+" · "+T.lvl[LEVEL];
  $("#bfOpen").innerHTML='<canvas class="brscene" width="320" height="180"></canvas>'+bubble(fill(D.OPEN,{C:pony()}),D.CHEF,"big");
  briefScene($("#bfOpen canvas"));
  $("#bfSus").innerHTML=c.sus.map(susCard).join("");
  $("#bfTip").textContent=T.codeTip;
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
  var lines=T.cine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  var r=rngOf(11),hills=[],i;for(i=0;i<5;i++)hills.push({x:r(),w:.3+r()*.3,h:.08+r()*.08,c:["#a8e08a","#8fd47a","#7cc466"][i%3]});
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?9:t;
    g.setTransform(dpr,0,0,dpr,0,0);var dawn=Math.min(1,ph/4),sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#f6b26b");sky.addColorStop(.5,"#ffd9a0");sky.addColorStop(1,"#9ad7ff");g.fillStyle=sky;g.fillRect(0,0,w,h);
    g.fillStyle="#fde68a";g.shadowColor="#fff";g.shadowBlur=40;g.beginPath();g.arc(w*.78,h*.3-dawn*h*.08,34,0,7);g.fill();g.shadowBlur=0;
    var base=h*.74;hills.forEach(function(hh){g.fillStyle=hh.c;g.beginPath();g.ellipse(hh.x*w,base,hh.w*w,hh.h*h,0,0,7);g.fill()});g.fillStyle=GRASS;g.fillRect(0,base,w,h-base);
    /* stal */var sx=w*.12,sw2=w*.42,sh2=h*.26,sy=base-sh2;g.fillStyle="#c8572f";g.fillRect(sx,sy,sw2,sh2);g.fillStyle="#7a3b2e";g.beginPath();g.moveTo(sx-10,sy);g.lineTo(sx+sw2/2,sy-sh2*.55);g.lineTo(sx+sw2+10,sy);g.closePath();g.fill();
    g.fillStyle="#2b1a0a";g.fillRect(sx+sw2*.33,sy+sh2*.3,sw2*.34,sh2*.7);g.fillStyle="#f5efe0";g.font="700 "+Math.round(h*.028)+"px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(L==="nl"?"PLUIS":"FLUFF",sx+sw2/2,sy+sh2*.24);
    /* hek dat openzwaait */var ga=Math.min(1,Math.max(0,(ph-1.5)/1.5));g.save();g.translate(sx+sw2+8,base);g.rotate(-ga*.55);g.strokeStyle="#f5efe0";g.lineWidth=Math.max(4,h*.008);g.beginPath();g.moveTo(0,0);g.lineTo(0,-sh2*.6);g.moveTo(sw2*.3,0);g.lineTo(sw2*.3,-sh2*.6);g.moveTo(0,-sh2*.15);g.lineTo(sw2*.3,-sh2*.15);g.moveTo(0,-sh2*.45);g.lineTo(sw2*.3,-sh2*.45);g.stroke();g.restore();
    /* hoefafdrukken */var n=Math.min(12,Math.floor(Math.max(0,ph-3)*6));for(i=0;i<n;i++)drawHoofPrint(g,sx+sw2*.75+i*w*.05,base+h*.04+(i%2)*h*.03,Math.max(5,h*.012),"rgba(91,58,30,.6)");
    /* Pluis wandelt weg */if(ph>3&&ph<9){var px=sx+sw2*.75+(ph-3)/5*w*.5;if(!imgAt(g,"pluis-walk",px,base+h*.06,Math.min(170,h*.26)))drawPony(g,px,base+h*.06,Math.min(120,h*.17),{walk:ph*7,halter:G.c.halter.slice(0,3)})}
    if(ph>7.2){g.textAlign="center";g.fillStyle="#fff";g.strokeStyle="#5b3a1e";g.lineWidth=6;var sc2=Math.min(1,(ph-7.2)/.5),fs=Math.round(38*sc2+12);g.font="700 "+fs+"px 'Fredoka','Arial Rounded MT Bold',sans-serif";var tt=L==="nl"?["HET GEHEIM VAN","PONY PLUIS"]:["THE SECRET OF","PONY FLUFF"];g.strokeText(tt[0],w/2,h*.3);g.fillText(tt[0],w/2,h*.3);g.strokeText(tt[1],w/2,h*.3+fs*1.05);g.fillText(tt[1],w/2,h*.3+fs*1.05)}
    var li=Math.min(lines.length-1,Math.floor(ph/1.5));txt.textContent=ph<7.2?lines[li]:"";if(li!==spoken&&ph<7.2&&!still){spoken=li;say(lines[li])}
    if(ph>9.4)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}

/* ---------- foto's: clubfoto en foto met Pluis (souvenirs, geen controle) ---------- */
function photoSheet(kind,then){photoFor={kind:kind,then:then};var team=kind==="team";
  sheet('<div class="eyebrow">'+esc(team?T.teamH:T.arrestH)+'</div><div class="task"><div class="ph">'+ico("team","big")+'</div><div><h2>'+esc(team?T.teamH:T.arrestH)+'</h2><p class="hint">'+esc(team?T.teamT:T.arrestT)+'</p></div></div>'+
    '<label class="btn cam" for="file">📷 '+T.shoot+'</label><p class="note" id="pMsg"></p><p class="note">'+esc(T.camNote)+'</p><button type="button" class="btn ghost dk" id="pSkip">'+T.skipPhoto+'</button>',true);
  say(team?T.teamT:T.arrestT);
  $("#pSkip").onclick=function(){closeSheet();photoFor=null;then()}}
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f||!G||!photoFor)return;var msg=$("#pMsg");
  var url=URL.createObjectURL(f),im=new Image();im.onload=function(){URL.revokeObjectURL(url);
    var w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,480/Math.max(w,h)),cv=document.createElement("canvas");cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
    G[photoFor.kind]=cv.toDataURL("image/jpeg",.72);save();buzz([40,30,80]);beep(660,.15);var th=photoFor.then;closeSheet();photoFor=null;th()};
  im.onerror=function(){URL.revokeObjectURL(url);if(msg)msg.textContent=T.noFile};im.src=url});

/* ---------- spelen zonder kaart: kaartjes ---------- */
function enter(){LEVEL=G.lvl||LEVEL;if(G.mode==="map"||G.mode==="demo")enterMap();else{show("cards");render()}}
function hud(){if(!G)return;var n=done();$("#hT").textContent=mmss(Date.now()-G.t0);$("#hS").textContent=n+"/8";shoeUI($("#hM"),n)}
function shoeUI(el,n){if(!el)return;el.innerHTML="";for(var i=0;i<8;i++){var s=document.createElement("i");if(i<n)s.className="on";el.appendChild(s)}}
function render(){hud();var i=G.i,box=$("#card");
  if(i>=8){box.innerHTML='<div class="pol done"><div class="grid">'+G.ph.map(function(p){return '<img src="'+p+'" alt="">'}).join("")+'</div></div>'+bubble(T.radarAll,D.CHEF)+'<button type="button" class="btn red" id="bAcc">'+T.last+'</button>';$("#bAcc").onclick=accuseSheet;return}
  var s=G.c.slots[i];
  box.innerHTML='<div class="pol empty"><div class="ph">'+ico(s.id,"big")+'</div><p class="cap">'+esc(fill(T.task,{i:i+1}))+' · '+esc(T.kinds[s.act])+'</p></div>'+bubble(s.ask,D.CHEF)+'<button type="button" class="btn" id="bOpen">▶ '+T.start+'</button>';
  $("#bOpen").onclick=function(){taskSheet(i)}}

/* ---------- spelen met kaart: weidekaart, hoefafdrukken, Pluis die in de verte loopt ---------- */
function enterMap(){show("play");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return R0},
    theme:{bg:"#bfe39f",water:"#6ec3ff",waterEdge:"#3aa0e8",ripple:"rgba(255,255,255,.35)",park:"#8fd47a",parkEdge:"#5fb45a",river:"#6ec3ff",major:"#f5efe0",minor:"#e3d9c0",road:"#efe6cf",label:"#3b2a14",waterLabel:"#1b5fa0",ring:"rgba(91,58,30,.25)",me:"#e76f51",meHalo:"rgba(231,111,81,.18)",meRing:"rgba(231,111,81,.7)",font:"700 12px 'Fredoka','Barlow Condensed',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(R0);sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d});
  if(G.mode==="demo")toast(T.demoTip);
  requestAnimationFrame(loop)}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[];
  var open=G.st.filter(function(s){return !s.done});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/500+s.fi)*3,col=["#e76f51","#f4c20d","#6ec3ff"][s.fi%3];
    if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*22,0,7);cx.stroke();cx.globalAlpha=1}
    cx.fillStyle="#fffaf0";cx.shadowColor="rgba(0,0,0,.3)";cx.shadowBlur=s.done?0:10;cx.beginPath();cx.arc(X,Y+bob*.3,16,0,7);cx.fill();cx.shadowBlur=0;cx.strokeStyle=s.done?"#9aa58f":col;cx.lineWidth=2.5;cx.stroke();
    if(s.done){cx.strokeStyle="#9aa58f";cx.lineWidth=3;cx.beginPath();cx.moveTo(X-6,Y);cx.lineTo(X-1,Y+5);cx.lineTo(X+7,Y-5);cx.stroke()}else drawHoofPrint(cx,X,Y+bob*.3,8,"#5b3a1e");
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,26,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#7a8a70":"#3b2a14";cx.shadowColor="#fff";cx.shadowBlur=6;if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+36);cx.shadowBlur=0}})});
  if(open.length){var near=open.reduce(function(a,s){return dTo(s)<dTo(a)?s:a});it.push({x:near.x,y:near.y,tap:false,draw:function(cx,X,Y,t,api){if(api.still){if(!imgAt(cx,"pluis-walk",X+44,Y-8,60,.9))drawPony(cx,X+44,Y-8,44,{al:.9,halter:G.c.halter.slice(0,3)});return}var a=t/2600,rx=60*api.V.s+30,sx=X+Math.cos(a)*rx,sy=Y+Math.sin(a*.7)*rx*.6+10,fl=Math.sin(a)>0;if(!imgAt(cx,"pluis-walk",sx,sy,60,.9))drawPony(cx,sx,sy,44,{al:.9,walk:t/120,flip:fl,halter:G.c.halter.slice(0,3)})}})}
  return it}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=110*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tickMap()}requestAnimationFrame(loop)}
function tickMap(){var el=Math.floor((Date.now()-G.t0)/1000),n=done();
  $("#mT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#mS").textContent=n+"/8";shoeUI($("#mM"),n);
  var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});
  $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);beep(660,.2)}if(!here)arrived=null;
  chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel),act=G.c.slots[sel.fi].act;
  $("#cName").textContent=sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=T.here+" · "+T.kinds[act];
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))taskSheet(sel.fi,sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;taskSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mPeople").onclick=susSheet;$("#mAcc").onclick=function(){if(done()>=8)accuseSheet();else noteSheet()};
$("#bNote").onclick=noteSheet;$("#bPeople").onclick=susSheet;$("#bAcc2").onclick=function(){if(done()>=8)accuseSheet();else noteSheet()};

/* ---------- een spoor: opdracht → puzzel → hoefijzer en spoor ---------- */
function taskSheet(i,spot){walkTo=null;var s=G.c.slots[i];cur={i:i,spot:spot||null};var n=done()+1,I=T.pz[s.act];
  var head='<div class="eyebrow">'+esc(fill(T.task,{i:n}))+' · '+esc(T.kinds[s.act])+(spot?' · '+esc(spot.name):'')+'</div>'+bubble(s.ask,D.CHEF);
  sheet(head+'<div class="pzh"><h2>'+esc(I[0])+'</h2><p class="hint">'+esc(I[1])+'</p></div><div id="pz"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){G.force=null;closeSheet()};
  say(s.ask+" "+I[1]);
  var fin=false,o={box:$("#pz"),rng:rngOf(G.seed*7+i*131),done:function(){if(fin)return;fin=true;mg.stop();cur.thumb=shoeThumb(i,s.act);accept()},
    canvas:function(hh){o.box.innerHTML='<canvas class="sq" width="280" height="'+(hh||280)+'"></canvas>';var c=o.box.firstChild;if(hh)c.style.aspectRatio="280/"+hh;return c},
    at:function(e,c){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*280,(e.clientY-b.top)/b.height*(c.height)]},
    msg:function(t){var m=$("#pzM");if(!m){m=document.createElement("p");m.id="pzM";m.className="pzst";o.box.appendChild(m)}m.textContent=t},
    say:say,good:function(){buzz(80);beep(660,.15);setTimeout(function(){beep(990,.2)},120)},bad:function(){G.oops=(G.oops||0)+1;buzz(120);beep(180,.2)}};
  if(/debug/.test(location.search))window.PP_DBG=o;
  PUZ[s.act](o)}
function accept(){var i=cur.i,s=G.c.slots[i];G.ph[i]=cur.thumb;if(cur.spot)cur.spot.done=true;G.force=null;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;save();buzz([40,30,80]);beep(520,.15);
  var kind=s.kind,n=done(),head=kind==="ev"?T.ev:kind==="claim"?T.wit:T.gag,sub=kind==="ev"?T.evT:kind==="claim"?(hard()?T.witT2:T.witT):"",txt=kind==="claim"?claimText(G.c.claims[s.w]):s.t,who=kind==="claim"?G.c.claims[s.w].who:D.CHEF,av=kind==="claim"?witAv(G.c.claims[s.w].kind):FENNA();
  sheet('<div class="eyebrow">'+esc(fill(T.clue,{n:n}))+' · '+esc(T.reply)+'</div><div class="ballwrap"><canvas id="ballC" width="320" height="200"></canvas><b>'+esc(fill(T.balloon,{n:n}))+'</b></div>'+
    '<div class="msg small">'+FENNA()+'<div class="bub"><p>'+esc(s.react)+'</p></div></div>'+
    '<div class="rep k-'+kind+'"><em>'+esc(head)+'</em>'+(kind==="ev"?'<canvas class="evc" id="evC" width="300" height="120"></canvas>':'')+bubble(txt,kind==="claim"?who+" · "+G.c.claims[s.w].rel:null,"",av)+(sub?'<p class="note">'+esc(sub)+'</p>':'')+'</div>'+
    '<button type="button" class="btn" id="bNext">'+(n>=8?T.last:T.next)+'</button>',true);
  shoeAnim($("#ballC"),n);if(kind==="ev"){evDraw($("#evC"),s.k,s.v);buzz([60,40,60,40,120])}
  say(s.react+" "+head+". "+(kind==="claim"?who+": ":"")+txt);
  $("#bNext").onclick=function(){closeSheet();sel=null;cur=null;if(n<8&&Math.random()<.6)popUp();if(G.mode==="map"||G.mode==="demo"){chip();if(n>=8)accuseSheet()}else{render();if(n>=8)accuseSheet()}}}
/* een dier komt even langs tussen twee sporen */
function popUp(){var t=T.pop[Math.floor(Math.random()*T.pop.length)];toast(t);say(t)}
/* hoefijzer: als plaatje voor de strook en als animatie */
function shoeThumb(i,act){var cv=document.createElement("canvas");cv.width=cv.height=240;var g=cv.getContext("2d"),bg=g.createLinearGradient(0,0,0,240);bg.addColorStop(0,"#9ad7ff");bg.addColorStop(1,"#8fd47a");g.fillStyle=bg;g.fillRect(0,0,240,240);
  for(var k=0;k<30;k++){g.fillStyle=COL[k%4];g.globalAlpha=.5;g.beginPath();g.arc((k*97)%240,(k*53)%240,3,0,7);g.fill()}g.globalAlpha=1;drawShoe(g,120,100,50,"#9a6a00",true);drawShoe(g,120,100,50,"#f4c20d",true);
  g.fillStyle="#5b3a1e";g.font="700 30px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(i+1,120,104);g.textBaseline="alphabetic";
  g.fillStyle="#fff";g.strokeStyle="#5b3a1e";g.lineWidth=4;g.font="700 20px 'Fredoka',sans-serif";g.strokeText(T.kinds[act],120,222);g.fillText(T.kinds[act],120,222);return cv.toDataURL("image/jpeg",.8)}
function shoeAnim(cv,n){var g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f=function(ts){if(!t0)t0=ts;var t=Math.min(1,(ts-t0)/1100);if(still)t=1;var e=1-Math.pow(1-t,3);g.clearRect(0,0,320,200);
    for(var k=0;k<24;k++){var a=k/24*6.283,d=40+e*90;g.fillStyle=COL[k%4];g.globalAlpha=(1-t)*.9;g.beginPath();g.arc(160+Math.cos(a)*d,100+Math.sin(a)*d*.6,3,0,7);g.fill()}g.globalAlpha=1;
    g.save();g.translate(160,110);g.rotate((1-e)*6.283);g.scale(.3+e*.7,.3+e*.7);drawShoe(g,0,0,46,"#9a6a00",true);drawShoe(g,0,-3,46,"#f4c20d",true);g.fillStyle="#5b3a1e";g.font="700 30px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(n,0,2);g.restore();
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
    c.addEventListener("pointerdown",mv);c.addEventListener("pointermove",function(e){if(e.buttons||e.pointerType==="touch")mv(e)})}
};

/* ---------- speurboekje, plekken, menu ---------- */
function noteSheet(){var ev=[],cl=[];G.c.slots.forEach(function(s,i){if(!G.ph[i])return;
    if(s.kind==="ev")ev.push('<div class="clue ev"><canvas class="evmini" data-k="'+s.k+'" data-v="'+s.v+'" width="60" height="60"></canvas><div><em>'+esc(D.AT[s.k].s[s.v])+'</em><p>'+esc(s.t)+'</p></div></div>');
    else if(s.kind==="claim"){var w=G.c.claims[s.w];cl.push('<div class="clue">'+witAv(w.kind)+'<div><em>'+esc(w.who)+'</em><p>'+esc(claimText(w))+'</p></div></div>')}});
  sheet('<h2>'+T.notebook+'</h2>'+(ev.length||cl.length?'<div class="eyebrow">'+T.nbE+'</div><div class="list">'+(ev.join("")||'<p class="note">–</p>')+'</div><div class="eyebrow">'+T.nbW+'</div><div class="list">'+(cl.join("")||'<p class="note">–</p>')+'</div>':'<p class="note">'+T.nbNone+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  $$("#sheetBody .evmini").forEach(function(cv){var g=cv.getContext("2d");g.fillStyle="#fff2c2";g.beginPath();g.arc(30,30,28,0,7);g.fill();evIcon(g,cv.dataset.k,+cv.dataset.v,30,30,.75)});
  $("#shX").onclick=closeSheet}
function susSheet(){sheet('<h2>'+T.people+'</h2><p class="note">'+T.peopleT+'</p><div class="list">'+G.c.sus.map(susCard).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function menuSheet(){sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button><button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- waar is Pluis: vijf plekken, tik op de goede ---------- */
function accuseSheet(){sheet('<h2>'+T.acH+'</h2><p>'+T.acT+'</p><button type="button" class="btn red" id="vGo">'+T.acGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  say(T.acT);$("#shX").onclick=closeSheet;$("#vGo").onclick=function(){closeSheet();lineup()}}
function lineup(){var ov=$("#hide"),room=$("#room"),c=G.c,K=c.K;
  room.innerHTML='<div class="places">'+c.sus.map(function(s,i){return '<button type="button" class="place" data-s="'+i+'"><img src="'+placeURL(s.tr,s.idx,360)+'" alt=""><b>'+esc(cap(s.name))+'</b><div class="tags">'+ATK.map(function(k){return '<i class="t-'+k+s.tr[k]+'">'+esc(D.AT[k].s[s.tr[k]])+"</i>"}).join("")+'</div><canvas class="found" width="200" height="140"></canvas></button>'}).join("")+'</div>';
  $("#hideHint").textContent=T.lineHint;$("#hideMsg").textContent="";ov.hidden=false;say(T.lineHint);
  var fin=false;
  room.onclick=function(e){var o=e.target.closest(".place");if(!o||fin)return;G.tries++;save();
    if(+o.dataset.s===K){fin=true;o.classList.add("yes");buzz([100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);confetti();var cv=o.querySelector(".found"),g=cv.getContext("2d");if(!imgAt(g,"pluis-bibi",100,134,120)){drawPony(g,70,130,90,{halter:c.halter.slice(0,3)});drawPony(g,150,130,80,{bibi:true,flip:true})}
      $("#hideMsg").textContent=T.lineYes;say(T.lineYes);o.scrollIntoView({block:"center",behavior:"smooth"});setTimeout(confess,2200)}
    else{o.classList.add("shake");setTimeout(function(){o.classList.remove("shake")},600);$("#hideMsg").textContent=T.lineNo;say(T.lineNo);buzz(120);beep(180,.2);setTimeout(function(){if(!fin)$("#hideMsg").textContent=""},2200)}};
  $("#hideX").onclick=function(){if(fin)return;ov.hidden=true;hush();if(G.mode==="map"||G.mode==="demo")chip();else render()}}
function confetti(){var ov=$("#hide");for(var i=0;i<40;i++){var s=document.createElement("i");s.className="cf";s.style.left=50+(Math.random()-.5)*60+"%";s.style.background=COL[i%4];s.style.animationDelay=Math.random()*.6+"s";s.style.setProperty("--dx",(Math.random()-.5)*200+"px");ov.appendChild(s);setTimeout(function(x){x.remove()},2600,s)}}
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
var RES=null,TEAM=LS.get("ss_pp_team","");
function win(){var c=G.c,min=((G.tEnd||Date.now())-G.t0)/60000,s2=G.tries===1,s3=(G.oops||0)<=3,stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:cap(c.sus[c.K].name),code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.pp.day=MW.today();MW.profile.save(p)}
  Wk.stopWatch();buzz([100,50,100,50,300]);
  var st=a.prof.streak,code=G.code;
  RES={ph:G.ph.slice(),team:G.team,arrest:G.arrest,code:code,stars:stars,min:Math.round(min),v:vars(),slots:G.c.slots.slice(),K:c.sus[c.K],halter:c.halter,seed:G.seed,end:G.end};
  sheet('<div class="eyebrow">'+T.won+' · '+esc(code)+'</div><div class="stars">'+shoeStars(stars)+'</div><h2>'+esc(cap(c.sus[c.K].name))+'</h2>'+
    '<canvas id="strip" width="1080" height="1350" class="stripc"></canvas>'+
    '<div class="tags"><i>'+Math.round(min)+' min</i><i>'+fill(T.pts,{x:xp})+'</i>'+(G.mode==="map"?'<i>'+fill(st===1?T.streakTxt:T.streakTxtP,{n:st})+'</i>':'')+'</div>'+
    (a.up?'<p><b>'+esc(fill(T.up,{r:MW.profile.rankName(a.prof.xp,L)}))+'</b></p>':'')+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+T.missed2+'</p>':'')+
    '<button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#strip");drawStrip(cv,RES);
  $("#vDip").onclick=dipSheet;
  var txt=fill(T.shareTxt,{c:code,s:"★".repeat(stars),m:Math.round(min)})+location.origin+location.pathname+"#z="+code;
  $("#vShare").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],"pony-"+code+".jpg",{type:"image/jpeg"});
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:txt}).catch(function(){})}
      else if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}},"image/jpeg",.85)};
  $("#vDl").onclick=function(){var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.85);a.download="pony-"+code+".jpg";document.body.appendChild(a);a.click();a.remove()};
  $("#vHome").onclick=function(){closeSheet();endCase()}}
function shoeStars(n){var s="";for(var i=0;i<3;i++)s+='<span class="'+(i<n?"on":"")+'">∩</span>';return s}
function loadImgs(list,cb){var IMG={},left=list.filter(Boolean).length;if(!left)return cb(IMG);list.filter(Boolean).forEach(function(src){if(IMG[src]!==undefined){if(--left===0)cb(IMG);return}IMG[src]=null;var im=new Image();im.onload=im.onerror=function(){IMG[src]=im.width?im:null;if(--left===0)cb(IMG)};im.src=src})}
function polaroid(g,im,x,y,pw,phh,cap2,rot,font,withPony,halter){var imgH=phh-pw*.34;g.save();g.translate(x+pw/2,y+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);
  g.shadowColor="rgba(0,0,0,.3)";g.shadowBlur=18;g.shadowOffsetY=8;g.fillStyle="#fff";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
  var pad=pw*.06,iw=pw-2*pad;if(im){var s=Math.max(iw/im.width,imgH/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();g.drawImage(im,pad+(iw-w)/2,pad+(imgH-h)/2,w,h);g.restore()}else{var sky=g.createLinearGradient(0,pad,0,pad+imgH);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(1,GRASS);g.fillStyle=sky;g.fillRect(pad,pad,iw,imgH);if(!imgAt(g,"kids-row",pw/2,pad+imgH-8,imgH*.8))drawPony(g,pw/2,pad+imgH-10,imgH*.6,{halter:halter})}
  if(withPony){g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();if(!imgAt(g,"pluis",pad+iw*.78,pad+imgH-4,imgH*.6))drawPony(g,pad+iw*.78,pad+imgH-6,imgH*.42,{halter:halter});g.restore()}
  g.fillStyle="#1e293b";g.font=font;g.textAlign="center";g.fillText(cap2,pw/2,phh-pw*.1,pw-20);g.restore()}
/* stalkaart: hoefijzers en foto's op weidegroen */
function drawStrip(cv,r){var g=cv.getContext("2d"),W2=cv.width,H=cv.height;
  loadImgs([r.team,r.arrest].concat(r.ph),function(IMG){
    var sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#9ad7ff");sky.addColorStop(.45,"#d8f0ff");sky.addColorStop(.46,"#a8e08a");sky.addColorStop(1,"#6fb860");g.fillStyle=sky;g.fillRect(0,0,W2,H);var q=rngOf(r.seed);for(var i=0;i<60;i++){g.fillStyle=COL[i%4];g.globalAlpha=.5;g.beginPath();g.arc(q()*W2,H*.47+q()*H*.5,4+q()*5,0,7);g.fill()}g.globalAlpha=1;
    for(i=0;i<W2;i+=90){g.strokeStyle=COL[(i/90)%4];g.lineWidth=6;g.beginPath();g.moveTo(i,20);g.lineTo(i+45,50);g.lineTo(i+90,20);g.stroke()}
    g.textAlign="center";g.fillStyle="#fff";g.strokeStyle="#5b3a1e";g.lineWidth=10;g.font="700 64px 'Fredoka','Arial Rounded MT Bold',sans-serif";g.strokeText(T.stripTitle,W2/2,120);g.fillText(T.stripTitle,W2/2,120);
    g.fillStyle="#3b2a14";g.font="600 30px 'Fredoka',sans-serif";g.fillText(fill(T.stripT,{c:r.code}).toUpperCase()+"   "+"∩".repeat(r.stars)+"   "+r.min+" MIN",W2/2,168);
    var pw=400,phh=500;polaroid(g,IMG[r.team],80,210,pw,phh,T.teamH,-.03,"700 30px 'Permanent Marker',cursive",false,r.halter);polaroid(g,IMG[r.arrest],W2-80-pw,230,pw,phh,T.arrestH,.03,"700 30px 'Permanent Marker',cursive",true,r.halter);
    var top=800;r.ph.forEach(function(src,i){var im=IMG[src],x=70+(i%4)*240,y=top+Math.floor(i/4)*240;if(im)g.drawImage(im,x,y,220,220)});
    g.fillStyle="#fffaf0";g.font="600 24px 'Fredoka',sans-serif";g.fillText(T.stripSub,W2/2,H-34)})}
function endCase(){LS.del(GK);G=null;hush();home()}

/* ---------- Ruiterpaspoort: A4 op canvas, als PDF (één JPEG-pagina) of als afbeelding ---------- */
function dipSheet(){if(!RES)return;
  sheet('<h2>'+T.dipH+'</h2><p>'+T.dipT+'</p><input class="inp team" id="dTeam" autocomplete="off" maxlength="120" placeholder="'+esc(T.dipP)+'" value="'+esc(TEAM)+'"><button type="button" class="btn" id="dGo">'+T.dipGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){closeSheet();winBack()};
  $("#dGo").onclick=function(){TEAM=$("#dTeam").value.trim();LS.set("ss_pp_team",TEAM);dipShow()}}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div><h2>'+esc(cap(r.v.P))+'</h2><button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  $("#vDip").onclick=dipSheet;$("#vHome").onclick=function(){closeSheet();endCase()}}
function a4Sheet(title,note,fname,drawFn){var r=RES;
  sheet('<div class="eyebrow">'+esc(title)+'</div><canvas id="dip" width="1240" height="1754" class="stripc a4"></canvas><p class="note">'+esc(note)+'</p><button type="button" class="btn" id="dPdf">'+T.dipPdf+'</button><button type="button" class="btn ghost dk" id="dImg">'+T.dipImg+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#dip");drawFn(cv,r);
  $("#dPdf").onclick=function(){var jpg=cv.toDataURL("image/jpeg",.9),blob=pdfFromJpeg(jpg,cv.width,cv.height),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=fname+"-"+r.code+".pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)};
  $("#dImg").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],fname+"-"+r.code+".jpg",{type:"image/jpeg"});
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){})}else{var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.9);a.download=fname+"-"+r.code+".jpg";document.body.appendChild(a);a.click();a.remove()}},"image/jpeg",.9)};
  $("#dBack").onclick=function(){closeSheet();winBack()};$("#vHome").onclick=function(){closeSheet();endCase()}}
function dipShow(){a4Sheet(T.dipH,T.dipNote,L==="nl"?"ruiterpaspoort":"riders-passport",function(cv,r){drawDiploma(cv,r,TEAM)})}
function names(g,team,y,W2,col){if(!team)return y;var list=team.split(/[,;]+/).map(function(s){return s.trim()}).filter(Boolean),line="",lines=[];g.font="700 36px 'Permanent Marker','Comic Sans MS',cursive";g.textAlign="center";
  list.forEach(function(nm){var t=line?line+"  ·  "+nm:nm;if(g.measureText(t).width>W2-260&&line){lines.push(line);line=nm}else line=t});if(line)lines.push(line);
  g.fillStyle=col;lines.slice(0,3).forEach(function(l){g.fillText(l,W2/2,y);y+=46});return y+10}
function emblem(g,x,y,s,name){g.save();g.translate(x,y);g.shadowColor="rgba(0,0,0,.3)";g.shadowBlur=20;g.fillStyle="#f4c20d";g.beginPath();g.arc(0,0,s,0,7);g.fill();g.shadowBlur=0;g.strokeStyle="#9a6a00";g.lineWidth=s*.05;g.stroke();
  g.fillStyle="#fffaf0";g.beginPath();g.arc(0,0,s*.8,0,7);g.fill();drawShoe(g,0,-s*.08,s*.46,"#9a6a00",true);drawShoe(g,0,-s*.12,s*.46,"#f4c20d",true);
  g.fillStyle="#5b3a1e";g.font="700 "+Math.round(s*.2)+"px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(String(name).toUpperCase().slice(0,10),0,s*.02,s*1.3);g.restore()}
function drawDiploma(cv,r,team){var g=cv.getContext("2d"),W2=cv.width,H=cv.height,v=r.v;
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
    var pw=360,phh=450,gap=50,x0=(W2-2*pw-gap)/2,y0=720;polaroid(g,IMG[r.team],x0,y0,pw,phh,T.teamH,-.03,"700 24px 'Permanent Marker',cursive",false,r.halter);polaroid(g,IMG[r.arrest],x0+pw+gap,y0+14,pw,phh,T.arrestH,.03,"700 24px 'Permanent Marker',cursive",true,r.halter);
    var y=y0+phh+80;g.fillStyle="#1e293b";g.font="italic 500 28px 'Barlow',sans-serif";g.fillText(fill(T.dipL4,v),W2/2,y,W2-220);y+=44;
    g.fillStyle="#64748b";g.font="500 26px 'Barlow',sans-serif";g.fillText(fill(T.dipDate,{d:dateStr,m:r.min,s:"∩".repeat(r.stars)}),W2/2,y);y+=64;
    if(team){g.fillStyle="#9a6a00";g.font="600 22px 'Fredoka',sans-serif";g.fillText(T.dipTeam.toUpperCase(),W2/2,y);y+=46;y=names(g,team,y,W2,"#5b3a1e")}
    if(!imgAt(g,"pluis",W2-200,H-150,190))drawPony(g,W2-200,H-150,130,{halter:r.halter});g.save();g.translate(W2-200,H-110);g.rotate(-.08);g.fillStyle="#e63946";g.font="700 30px 'Fredoka',sans-serif";g.fillText(T.dipStamp,0,0);g.restore();
    var sy=H-230;g.strokeStyle="#5b3a1e";g.lineWidth=2;g.beginPath();g.moveTo(W2/2-260,sy);g.lineTo(W2/2+140,sy);g.stroke();
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
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();begin(p.seed,p.mode,false)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.pp,log=(g&&g.log)||[],st=function(k){return"∩".repeat(k||0)};
  sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min</small><div class="tags"><i>'+st(x.st)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();G=null;hush();home()}
function wipeGame(){LS.del(GK);Wk.stopWatch();G=null;closeSheet();home();toast(T.wiped)}
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
if(/debug/.test(location.search))window.PP_DRAW={drawPony:drawPony,drawAnimal:drawAnimal,drawPlace:drawPlace,drawFenna:drawFenna};
/* ---------- start ---------- */
var hz=/[#&]z=([A-Z0-9]+)/i.exec(location.hash);
home();if(hz){var pc=parseCode(hz[1]);if(pc)codeSheet(hz[1].toUpperCase())}
MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
})();
