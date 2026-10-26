/* Agent voor Eén Dag / Officer for a Day – kinderwandeling voor feestjes: politie spelen. Spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js, walk.js en AG_DATA (data-xx.js). Geen beeldherkenning: de foto's (teamfoto, fotomissies, arrestatiefoto) zijn souvenirs.
   Zaak: de Bordendief. Lengte Kort/Normaal/Lang = 5/8/11 sporen, elk een politiepuzzel (13 soorten, per zaak geschud zodat er weinig herhaalt):
   vingerafdruk, compositietekening, voetspoor, sirene, verrekijker, portofoon, achtervolging, zoek de dief, kenteken, bewijszakken, verhoor, kaartlezen, codeslot.
   Per spoor: bewijs (altijd waar, toont een kenmerk), een getuige (één liegt) of een bericht van de chef, plus een gouden cijfer op de achterkant van het bord.
   Tussendoor duiken de dief en de chef (portofoon) op, met een cliffhanger na elke plek. Twist: de dief sloot de handboeien op in de bewijskast;
   die open je met de gouden cijfers (niveau Rechercheur: achterstevoren). Daarna de confrontatie in 3D, een geanimeerde finale, fotoalbum, diploma en GEZOCHT-poster.
   Zaakcode: AG + stand (K/S/B) + seed = Normaal (oude codes); AG + V(kort)/L(lang) + stand + seed.
   Standen: "map" (kaart + gps), "demo" (fictieve kaart, tik om te lopen), "street" (buiten zonder kaart), "in" (binnen). De telefoon leest voor (speechSynthesis). */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.AG_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="ag",GK="ss_game_ag_"+L,WK="ss_ways_ag_"+L,hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz,beep=Wk.beep;function closeSheet(){mg.stop();hush();Wk.closeSheet()}
var G=null,tick=0,MODE=LS.get("ss_ag_mode","map"),NAME=LS.get("ss_ag_name",""),VOICE=LS.get("ss_ag_voice",true),AGE=LS.get("ss_ag_age","6");function HARD(){return (G&&G.age||AGE)==="8"}
function RR(){return G&&G.R||R0}
function NN(){return G&&G.c&&G.c.slots?G.c.slots.length:8}
var ATK=["hoofd","shirt","voet"],NS=5,ALL=31,ORDER=["e0","w0","e1","w1","e2","w2","g","w3"],ACTS=["print","face","shoe","siren","diff","radio","maze","crowd","plate","bag","talk","mapr","lock"];
var LEN=LS.get("ss_ag_len","normaal");if(!/^(kort|normaal|lang)$/.test(LEN))LEN="normaal";
var LENN={kort:5,normaal:8,lang:11},LENR={kort:420,normaal:550,lang:650},MISSAT={kort:[2],normaal:[2,5],lang:[2,5,8]};
var PZD=Object.assign({},D.PUZ,D.PUZ2||{});
var W=[],P={x:0,y:0,acc:0},R0=550,map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null,photoFor=null;
var mg={raf:0,tm:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[]}};
var COL=["#ffc21a","#ff3b3b","#4fd3ff","#ffffff"],HATC=["#e63946","#2a9d4b","#f4c20d"],SKIN="#f5c9a3";

/* ---------- hulpjes ---------- */
function bits(m){var n=0;while(m){n+=m&1;m>>=1}return n}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
var ICON2={plate:"M3 7h18v10H3zM5 4h14M7 11h2M11 11h2M15 11h2M3 9h2",bag:"M6 8h12l1 13H5zM9 8V5a3 3 0 0 1 6 0v3M9 13h6",talk:"M4 5h16v10H9l-5 4zM8 9h8M8 12h5",mapr:"M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14",lock:"M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4M12 15v2"};
function ico(id,cls){return '<svg class="'+(cls||"ico")+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(D.ICON[id]||ICON2[id]||"M4 4h16v16H4z")+'"/></svg>'}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function ballons(){return NAME?fill(D.CADEAU,{J:NAME}):D.CADEAU0}
/* straatnaambord: blauw met witte rand en witte letters, zoals in Nederland; n = nummertje */
function drawSign(g,cx,cy,w,text,n,glow){var h=w*.34,r=h*.18;g.save();if(glow){g.shadowColor="#4fd3ff";g.shadowBlur=glow}g.fillStyle="#fff";rr(g,cx-w/2,cy-h/2,w,h,r);g.fill();g.shadowBlur=0;g.fillStyle="#1d4ed8";rr(g,cx-w/2+h*.1,cy-h/2+h*.1,w-h*.2,h-h*.2,r*.7);g.fill();
  var t=String(text||"").toUpperCase(),fs=h*.46;g.font="700 "+fs+"px 'Barlow Condensed','Arial Narrow',sans-serif";while(g.measureText(t).width>w*.82&&fs>h*.2){fs*=.92;g.font="700 "+fs+"px 'Barlow Condensed','Arial Narrow',sans-serif"}
  g.fillStyle="#fff";g.textAlign="center";g.textBaseline="middle";g.fillText(t,cx,cy+h*.02);
  if(n!=null){g.fillStyle="#ffc21a";g.beginPath();g.arc(cx+w/2-h*.1,cy-h/2+h*.1,h*.3,0,7);g.fill();g.fillStyle="#0d2a66";g.font="700 "+h*.36+"px 'Barlow Condensed',sans-serif";g.fillText(n,cx+w/2-h*.1,cy-h/2+h*.12)}g.restore()}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
/* voorlezen */
function say(t){if(!VOICE||!t)return;try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(String(t).replace(/[“”"]/g,"").replace(/\{[^}]+\}/g,""));u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.92;u.pitch=1.05;ss.speak(u)}catch(e){}}
function hush(){try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
function bubble(txt,who,cls,av){return '<div class="msg '+(cls||"")+'">'+(av||CHEF)+'<div class="bub"><button type="button" class="spk" aria-label="'+esc(T.listen)+'" data-say="'+esc(txt)+'">🔊</button>'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+esc(txt)+'</p></div></div>'}
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){var v=VOICE;VOICE=true;say(b.dataset.say);VOICE=v}});

/* ---------- figuren tekenen (boeven, agent, kenmerken): alles op canvas, zodat de kenmerken per zaak kloppen ---------- */
function drawHat(g,x,y,s,v){ /* (x,y) = midden bovenkant hoofd */
  g.save();g.translate(x,y);g.scale(s,s);g.lineWidth=1.2;g.strokeStyle="rgba(0,0,0,.35)";
  if(v===0){g.fillStyle=HATC[0];g.beginPath();g.arc(0,2,16,Math.PI,0);g.closePath();g.fill();g.stroke();rr(g,-2,0,28,6,3);g.fill();g.stroke();g.fillStyle="#fff";g.beginPath();g.arc(0,-6,3,0,7);g.fill()}
  else if(v===1){g.fillStyle=HATC[1];rr(g,-24,0,48,6,3);g.fill();g.stroke();rr(g,-13,-20,26,22,4);g.fill();g.stroke();g.fillStyle="#1b5e35";g.fillRect(-13,-6,26,5)}
  else{g.fillStyle=HATC[2];g.beginPath();g.arc(0,2,16,Math.PI,0);g.closePath();g.fill();g.stroke();g.fillStyle="#d9a500";rr(g,-17,-2,34,7,3);g.fill();g.stroke();g.fillStyle="#fff";g.beginPath();g.arc(0,-16,5,0,7);g.fill();g.stroke()}
  g.restore()}
function shirtFill(g,v,x,y,w,h){ /* patroon op een rechthoek */
  if(v===0){g.fillStyle="#fff";g.fillRect(x,y,w,h);g.fillStyle="#1a1a2e";for(var i=0;i<h;i+=h/4.5)if(Math.floor(i/(h/4.5))%2===0)g.fillRect(x,y+i,w,h/9)}
  else if(v===1){g.fillStyle="#fff";g.fillRect(x,y,w,h);g.fillStyle="#e63946";for(var r=0;r<3;r++)for(var c=0;c<3;c++){g.beginPath();g.arc(x+w*(.2+c*.3)+(r%2?w*.1:0),y+h*(.2+r*.3),Math.min(w,h)*.08,0,7);g.fill()}}
  else{g.fillStyle="#2563eb";g.fillRect(x,y,w,h)}}
function drawShirt(g,x,y,s,v){g.save();g.translate(x,y);g.scale(s,s);g.save();rr(g,-20,0,40,34,6);g.clip();shirtFill(g,v,-20,0,40,34);g.restore();g.lineWidth=1.2;g.strokeStyle="rgba(0,0,0,.35)";rr(g,-20,0,40,34,6);g.stroke();g.restore()}
function drawShoe(g,x,y,s,v,flip){ /* (x,y) = onderkant midden van één schoen */
  g.save();g.translate(x,y);g.scale(flip?-s:s,s);g.lineWidth=1.2;g.strokeStyle="rgba(0,0,0,.35)";
  if(v===0){g.fillStyle="#e63946";rr(g,-9,-9,22,9,4);g.fill();g.stroke();g.fillStyle="#fff";g.fillRect(-9,-3,22,3)}
  else if(v===1){g.fillStyle="#2a9d4b";rr(g,-7,-22,14,22,3);g.fill();g.stroke();rr(g,-9,-7,22,7,3);g.fill();g.stroke()}
  else{g.fillStyle="#f4c20d";rr(g,-9,-9,22,9,4);g.fill();g.stroke();g.fillStyle="#fff";g.fillRect(-9,-4,22,4);g.fillStyle="#333";g.fillRect(-9,-9,22,2)}
  g.restore()}
/* figuur: (x,y) = midden onder de voeten, h = hoogte. o={tr:{hoofd,shirt,voet}, mask, cop, balloons, al} */
function drawFig(g,x,y,h,o){o=o||{};var s=h/100,tr=o.tr||{hoofd:0,shirt:0,voet:0};g.save();g.globalAlpha=o.al==null?1:o.al;g.translate(x,y);g.scale(s,s);
  g.lineWidth=1.2;g.strokeStyle="rgba(0,0,0,.35)";
  /* schaduw */g.fillStyle="rgba(0,0,0,.25)";g.beginPath();g.ellipse(0,0,24,5,0,0,7);g.fill();
  /* benen */g.fillStyle=o.cop?"#1e3a8a":"#2b2b40";rr(g,-13,-34,11,30,3);g.fill();rr(g,2,-34,11,30,3);g.fill();
  /* schoenen */if(o.cop){g.fillStyle="#111";rr(g,-16,-8,22,8,3);g.fill();rr(g,-5,-8,22,8,3);g.fill()}else{drawShoe(g,-8,0,1,tr.voet,true);drawShoe(g,8,0,1,tr.voet,false)}
  /* romp */g.save();rr(g,-20,-64,40,34,6);g.clip();if(o.cop){g.fillStyle="#1d4ed8";g.fillRect(-20,-64,40,34);g.fillStyle="#ffc21a";g.beginPath();g.arc(-9,-52,4,0,7);g.fill();g.fillStyle="#fff";g.fillRect(-20,-40,40,3)}else shirtFill(g,tr.shirt,-20,-64,40,34);g.restore();rr(g,-20,-64,40,34,6);g.stroke();
  /* armen */g.strokeStyle=o.cop?"#1d4ed8":tr.shirt===2?"#2563eb":"#fff";g.lineWidth=9;g.lineCap="round";g.beginPath();g.moveTo(-18,-58);g.lineTo(o.balloons?-30:-30,o.balloons?-78:-38);g.moveTo(18,-58);g.lineTo(30,-38);g.stroke();
  g.fillStyle=SKIN;g.beginPath();g.arc(o.balloons?-30:-30,o.balloons?-78:-38,5.5,0,7);g.arc(30,-38,5.5,0,7);g.fill();
  /* hoofd */g.fillStyle=SKIN;g.beginPath();g.arc(0,-78,15,0,7);g.fill();g.lineWidth=1.2;g.strokeStyle="rgba(0,0,0,.35)";g.stroke();
  if(o.mask!==false&&!o.cop){g.fillStyle="#1a1a2e";rr(g,-16,-85,32,11,4);g.fill();g.fillStyle="#fff";g.beginPath();g.ellipse(-6,-79.5,4,3,0,0,7);g.ellipse(6,-79.5,4,3,0,0,7);g.fill();g.fillStyle="#111";g.beginPath();g.arc(-5,-79.5,1.6,0,7);g.arc(7,-79.5,1.6,0,7);g.fill()}
  else{g.fillStyle="#111";g.beginPath();g.arc(-5,-80,1.8,0,7);g.arc(5,-80,1.8,0,7);g.fill()}
  g.strokeStyle="#7a3b2e";g.lineWidth=1.6;g.beginPath();g.arc(0,-72,6,.3,2.85);g.stroke();
  /* pet / politiepet */if(o.cop){g.fillStyle="#1e3a8a";g.beginPath();g.arc(0,-90,16,Math.PI,0);g.closePath();g.fill();g.stroke();g.fillStyle="#111";rr(g,-18,-92,36,6,3);g.fill();g.fillStyle="#ffc21a";g.beginPath();g.arc(0,-97,4,0,7);g.fill()}else drawHat(g,0,-92,1,tr.hoofd);
  /* ballonnen */if(o.balloons){g.strokeStyle="rgba(255,255,255,.8)";g.lineWidth=1;[[-52,-150,"#ff3b3b"],[-28,-162,"#ffc21a"],[-10,-140,"#4fd3ff"]].forEach(function(b){g.beginPath();g.moveTo(-30,-78);g.lineTo(b[0],b[1]+16);g.stroke();g.fillStyle=b[2];g.beginPath();g.ellipse(b[0],b[1],12,15,0,0,7);g.fill();g.fillStyle="rgba(255,255,255,.5)";g.beginPath();g.ellipse(b[0]-4,b[1]-5,3,5,-.5,0,7);g.fill()})}
  g.restore()}
function drawItem(g,k,v,x,y,s){if(k==="hoofd")drawHat(g,x,y+6,s*1.6,v);else if(k==="shirt")drawShirt(g,x,y-24*s,s*1.3,v);else{drawShoe(g,x-10*s,y+14*s,s*1.5,v,true);drawShoe(g,x+10*s,y+14*s,s*1.5,v,false)}}
function figURL(tr,h,o){o=o||{};if(boefReady()){var c2=boefCanvas(o.b!=null?o.b:0,tr,h);return c2.toDataURL("image/png")}var cv=document.createElement("canvas");cv.width=Math.round(h*1.1);cv.height=Math.round(h*1.15);var g=cv.getContext("2d");o.tr=tr;drawFig(g,cv.width/2,cv.height-4,h,o);return cv.toDataURL("image/png")}
function cuffsSVG(){return '<svg class="cuffs" viewBox="0 0 64 32" width="64" height="32"><g fill="none" stroke="#cfd8e8" stroke-width="5"><circle cx="16" cy="18" r="10"/><circle cx="48" cy="18" r="10"/><path d="M26 16h12"/></g></svg>'}
/* ---------- plaatjes (Kellie's artwork, games/agent/img): boeven zonder pet/shirt/schoenen, die legt het spel er per zaak overheen ---------- */
var IMGROOT=MW.root+"games/agent/img/",IM={};
["chef-talk","chef-happy","chef-worried","chef-head","hat-red","hat-green","hat-yellow","shirt-stripes","shirt-dots","shirt-blue","shoe-red","shoe-green","shoe-yellow",
 "chef-arms","car","van","moto","boef-ronnie","boef-gerrit","boef-greet","boef-sjaak","boef-bea","boef-piet","boef-lena","boef-tas","boef-run","boef-sneak","boef-caught","boef-sorry","kids-row","kids-tools",
 "icon-star","icon-cuffs","icon-siren","icon-radio","icon-glass","icon-foot","icon-print"].forEach(function(k){var im=new Image();im.src=IMGROOT+k+".webp?v=3";IM[k]=im});
function ok(k){var im=IM[k];return !!(im&&im.complete&&im.naturalWidth)}
var IMREADY=Promise.all(Object.keys(IM).map(function(k){return new Promise(function(res){var im=IM[k];if(im.complete)return res();im.onload=im.onerror=function(){res()}})}));
var imReady=function(){return Promise.race([IMREADY,new Promise(function(res){setTimeout(res,2500)})])};
var BKEY=["ronnie","gerrit","greet","sjaak","bea","piet","lena","tas"],BA=[[202,572,105,120,45,180,125,60,140,70,571],[262,568,135,130,30,180,215,60,200,80,567],[278,548,140,130,85,200,120,55,180,70,547],[186,580,95,105,35,200,120,40,140,70,579],[256,486,125,115,60,150,140,60,170,70,485],[218,552,115,120,50,190,140,50,165,70,551],[242,550,115,115,45,220,130,50,165,70,549],[440,544,190,120,25,150,230,90,250,95,543]];
var HATK=["hat-red","hat-green","hat-yellow"],SHK=["shirt-stripes","shirt-dots","shirt-blue"],SHOK=["shoe-red","shoe-green","shoe-yellow"];
function boefIdx(name){var j=D.SUS.findIndex(function(x){return x[0]===name});return j<0?0:j}
function boefReady(){return ok("boef-ronnie")&&ok("hat-red")&&ok("shirt-stripes")&&ok("shoe-red")}
/* samengestelde boef op een canvas (gecachet): lijf + shirt + pet + schoenen. h = hoogte van het lijf */
var BC={};
function boefCanvas(j,tr,h){var key=j+"|"+tr.hoofd+tr.shirt+tr.voet+"|"+Math.round(h);if(BC[key])return BC[key];
  var a=BA[j],sc=h/a[1],pad=Math.round(h*.22),cv=document.createElement("canvas");cv.width=Math.round(a[0]*sc+pad*2);cv.height=Math.round(h+pad*.6);var g=cv.getContext("2d"),ox=pad,oy=Math.round(pad*.5);
  g.drawImage(IM["boef-"+BKEY[j]],ox,oy,a[0]*sc,h);
  var sh=IM[SHK[tr.shirt]],w=a[6]*1.05*sc,hh=sh.naturalHeight*w/sh.naturalWidth;g.drawImage(sh,ox+(a[4]+a[6]/2)*sc-w/2,oy+a[5]*sc-10*sc,w,hh);
  var ht=IM[HATK[tr.hoofd]];w=a[3]*1.25*sc;hh=ht.naturalHeight*w/ht.naturalWidth;g.drawImage(ht,ox+a[2]*sc-w/2,oy+a[3]*.22*sc-hh,w,hh);
  var so=IM[SHOK[tr.voet]];w=((a[8]-a[7])+a[9]*.85)*sc;hh=so.naturalHeight*w/so.naturalWidth;g.drawImage(so,ox+(a[7]+a[8])/2*sc-w/2,oy+a[10]*sc+6*sc-hh,w,hh);
  BC[key]=cv;return cv}
/* figuur tekenen: plaatje als het er is, anders de canvas-tekening. o.b = lijf (index in SUS), anders gekozen uit de kenmerken */
function fig(g,x,y,h,o){o=o||{};if(o.cop||!o.tr||!boefReady())return drawFig(g,x,y,h,o);
  var j=o.b!=null?o.b:(o.tr.hoofd*3+o.tr.shirt*5+o.tr.voet*7)%8,cv=boefCanvas(j,o.tr,h);g.save();g.globalAlpha=o.al==null?1:o.al;g.drawImage(cv,x-cv.width/2,y-h-(cv.height-h)*.45);g.restore()}
function imgAt(g,k,x,y,h,al,anchorBottom,flip){var im=IM[k];if(!ok(k))return false;var w=h*im.naturalWidth/im.naturalHeight;g.save();g.globalAlpha=al==null?1:al;if(flip){g.translate(x,0);g.scale(-1,1);x=0}g.drawImage(im,x-w/2,anchorBottom===false?y-h/2:y-h,w,h);g.restore();return true}
function itemImg(g,k,v,x,y,s){var key=k==="hoofd"?HATK[v]:k==="shirt"?SHK[v]:SHOK[v];if(!ok(key))return drawItem(g,k,v,x,y,s);var im=IM[key],w=s*62,h=w*im.naturalHeight/im.naturalWidth;g.drawImage(im,x-w/2,y-h/2,w,h)}
var ICONIMG={print:"icon-print",shoe:"icon-foot",siren:"icon-siren",radio:"icon-radio",diff:"icon-glass",maze:"icon-cuffs",crowd:"icon-star",team:"icon-star"};
function icoImg(id,cls){return ICONIMG[id]?'<img class="'+(cls||"ico")+' pic" src="'+IMGROOT+ICONIMG[id]+'.webp?v=3" alt="">':ico(id,cls)}
var CHEF='<span class="avatar chef" aria-hidden="true" style="background-image:url('+IMGROOT+'chef-head.webp?v=3)"></span>';
function witAv(name){return '<span class="avatar wit" aria-hidden="true">'+esc(name.replace(/^(Opa|Juf|Bakker|Postbode|Mevrouw|Kapper|Oom|Grandpa|Miss|Baker|Postman|Mrs|Barber|Uncle)\s+/,"").slice(0,1))+'</span>'}

/* ---------- zaakgenerator ---------- */
/* volgorde van de puzzels: geschud, zonder twee gelijksoortige achter elkaar */
var PGRP={siren:1,radio:1,print:2,shoe:2,face:3,crowd:3,talk:4,diff:4,maze:5,mapr:5,plate:6,lock:7,bag:8};
function pickActs(seed,n){var r=rngOf((seed^0x7ac75e1)>>>0),a=shuffle(ACTS,r).slice(0,n);
  for(var k=0;k<20;k++){var bad=-1;for(var i=1;i<a.length;i++)if(PGRP[a[i]]===PGRP[a[i-1]]){bad=i;break}if(bad<0)break;var j=(bad+1+Math.floor(r()*(a.length-1)))%a.length;var t=a[bad];a[bad]=a[j];a[j]=t}
  return a}
function genDigits(seed,n){var r=rngOf((seed^0x601dd1)>>>0),d=[];for(var i=0;i<n;i++){var x=1+Math.floor(r()*9);if(i&&x===d[i-1])x=x%9+1;d.push(x)}return d}
function genCase(seed,mode,len){len=len||"normaal";
  var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  for(var tries=0;tries<4000;tries++){
    var pool=shuffle(D.SUS,r).slice(0,NS),sus=pool.map(function(s){var tr={};ATK.forEach(function(k){tr[k]=Math.floor(r()*3)});return{name:s[0],rel:s[1],q:s[2],tr:tr}});
    var K=Math.floor(r()*NS);
    var ev=ATK.map(function(k){var v=sus[K].tr[k],m=0;sus.forEach(function(s,j){if(s.tr[k]===v)m|=1<<j});return{k:k,v:v,m:m}});
    if(ev.some(function(x){return bits(x.m)<2}))continue;
    if(ev.reduce(function(a,x){return a&x.m},ALL)!==1<<K)continue;
    if(tries<2500&&(bits(ev[0].m&ev[1].m)<2||bits(ev[0].m&ev[2].m)<2||bits(ev[1].m&ev[2].m)<2))continue;
    /* geen twee boeven met precies dezelfde drie kenmerken (anders zijn ze op de rij niet te onderscheiden) */
    var dup=false;sus.forEach(function(a,i){sus.forEach(function(b,j){if(i<j&&a.tr.hoofd===b.tr.hoofd&&a.tr.shirt===b.tr.shirt&&a.tr.voet===b.tr.voet)dup=true})});if(dup)continue;
    var wits=shuffle(D.WITS,r).slice(0,4),Li=Math.floor(r()*4),claims=[0,1,2,3].map(function(i){var k=ATK[i%3],v=sus[K].tr[k];if(i===Li)v=(v+1+Math.floor(r()*2))%3;return{k:k,v:v,lie:i===Li,t:pick(D.WIT[k]),who:wits[i][0],rel:wits[i][1]}});
    /* Normaal = de oude volgorde (zelfde zaak bij dezelfde code); Kort = 3x bewijs + 2 getuigen (waaronder de leugenaar); Lang = 5x bewijs, 4 getuigen, 2x de chef */
    var ord=len==="kort"?["e0","w"+Li,"e1","w"+((Li+1)%4),"e2"]:len==="lang"?["e0","w0","e1","g","w1","x0","e2","w2","g","x1","w3"]:ORDER,acts=pickActs(seed,ord.length),gags=[];
    var slots=ord.map(function(o,i){var act=acts[i],p=PZD[act],s={act:act,id:act,what:p[0],ask:p[1],react:p[2]};
      if(o==="g"){s.kind="gag";var gl=D.GAG.filter(function(x){return gags.indexOf(x)<0});s.t=pick(gl.length?gl:D.GAG);gags.push(s.t)}
      else if(o[0]==="e"){var e=ev[+o[1]];s.kind="ev";s.k=e.k;s.v=e.v;s.t=pick(D.EV[e.k][e.v])}
      else if(o[0]==="x"){s.kind="ev";s.x=1;s.xi=+o[1]}
      else{s.kind="claim";s.w=+o[1]}
      return s});
    /* extra bewijs (Lang): hetzelfde kenmerk nog eens, met de andere tekst */
    slots.forEach(function(s){if(!s.x)return;var e=ev[[0,2][s.xi]],first=slots.filter(function(q){return q.kind==="ev"&&!q.x&&q.k===e.k})[0],pool=D.EV[e.k][e.v];s.k=e.k;s.v=e.v;s.t=pool[0]===(first&&first.t)?pool[1]:pool[0]});
    return{sus:sus,K:K,claims:claims,Li:Li,slots:slots,ev:ev,digits:genDigits(seed,slots.length)}
  }
  return null}
function makeCode(seed,mode,len){return"AG"+(len==="kort"?"V":len==="lang"?"L":"")+(mode==="in"?"B":mode==="map"||mode==="demo"?"K":"S")+seed.toString(36).toUpperCase()}
/* oude codes (AGK…, AGS…, AGB…) = Normaal; AGV… = Kort, AGL… = Lang */
function parseCode(v){var c=MW.norm(v),len="normaal";if(/^AG[VL][KSB]/.test(c)){len=c[2]==="V"?"kort":"lang";c="AG"+c.slice(3)}
  if(!/^AG[KSB]/.test(c)||c.length<4||c.length>11)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;return{mode:c[2]==="B"?"in":c[2]==="K"?"map":"street",seed:seed,len:len}}
/* opgeslagen zaak van een oudere versie: ontbrekende velden aanvullen */
function fixG(g){if(!g||!g.c||!g.c.slots)return null;if(!g.len)g.len=g.c.slots.length===5?"kort":g.c.slots.length===11?"lang":"normaal";if(!g.R)g.R=LENR[g.len]||R0;
  if(!g.c.digits||g.c.digits.length!==g.c.slots.length)g.c.digits=genDigits(g.seed||0,g.c.slots.length);if(!Array.isArray(g.album))g.album=[];if(!Array.isArray(g.ph))g.ph=[];
  g.c.slots.forEach(function(s){if(!PUZ[s.act]){s.act="print";s.id="print"}});if(!g.signs)g.signs=shuffle(D.STREETS,rngOf((g.seed||0)^0x51ed270b)).slice(0,g.c.slots.length);
  while(g.signs.length<g.c.slots.length)g.signs.push(D.STREETS[g.signs.length%D.STREETS.length]);return g}
function vars(){var c=G.c,k=c.sus[c.K];return{K:k.name,KR:k.rel,KJ:D.AT.hoofd.v[k.tr.hoofd],KW:D.AT.shirt.v[k.tr.shirt],KD:D.AT.voet.v[k.tr.voet],J:NAME,C:ballons()}}
function claimText(w){return fill(w.t,{v:D.AT[w.k].v[w.v]})}
function done(){return G.ph.filter(Boolean).length}

/* ---------- startscherm ---------- */
function home(){
  var p=MW.profile.get();
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=(p.games.ag&&p.games.ag.n)||0;
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(ID),lk=MW.pro.locked(ID),playedToday=(p.games.ag&&p.games.ag.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;
  $("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  $("#name").value=NAME;voiceBtn();
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});
  $$("#age button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.a===AGE)});
  $$("#dur button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});
  show("home")}
function voiceBtn(){var b=$("#bVoice");if(b){b.textContent=(VOICE?"🔊 ":"🔇 ")+T.voice;b.setAttribute("aria-pressed",VOICE)}}
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;
  MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MODE=b.dataset.m;LS.set("ss_ag_mode",MODE);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#age").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;AGE=b.dataset.a;LS.set("ss_ag_age",AGE);$$("#age button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
(function(){var d=$("#dur");if(d)d.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;LEN=b.dataset.n;LS.set("ss_ag_len",LEN);$$("#dur button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})})})();
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_ag_name",NAME)});
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_ag_voice",VOICE);voiceBtn();toast(VOICE?T.voiceOn:T.voiceOff);if(VOICE)say(T.voiceOn);else hush()};
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(hashStr("ag|"+MODE+"|"+MW.today()+(LEN!=="normaal"?"|"+LEN:"")),MODE,true,LEN)};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(Math.floor(Math.random()*4e9),MODE,false,LEN)};
$("#bPro").onclick=proSheet;
$("#bDemo").onclick=function(){var w=ehvWorld();build(Math.floor(Math.random()*4e9),"demo",w.pois,w.ways,null,false,LEN)};
$("#bHow").onclick=function(){sheet('<h2>'+T.howH+'</h2>'+$("#howT").innerHTML+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet};
$("#bResume").onclick=function(){G=fixG(LS.get(GK,null));if(!G){LS.del(GK);return home()}W=LS.get(WK,[]);P={x:G.px||0,y:G.py||0,acc:0};imReady().then(enter)};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};

/* ---------- proefronde: de binnenstad van Eindhoven, getekend (zelfde wereld als bij Moordwandeling en De Ruil) ---------- */
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
/* ---------- verhaalkaart (kidsmap.js): het dorp rond Bureau Buurtwacht ---------- */
var KI=MW.KidsMap.icons,START={x:500,y:1290};
var FP=[{x:230,y:1040,k:"bakker"},{x:150,y:760,k:"halte"},{x:300,y:520,k:"speel"},{x:520,y:330,k:"school"},{x:760,y:420,k:"brug"},{x:860,y:700,k:"park"},{x:720,y:960,k:"kerk"},{x:500,y:760,k:"plein"},{x:150,y:300,k:"winkel"},{x:880,y:1060,k:"post"},{x:620,y:1130,k:"kiosk"}];
var ROADS=[[-1,0],[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,-1],[7,2],[7,5],[7,0],[7,6],[8,2],[8,1],[9,6],[9,5],[10,-1],[10,6]];
var TREES=[[80,1180],[120,320],[420,160],[640,180],[900,260],[950,900],[940,1180],[300,1300],[700,1300],[380,900],[640,600],[90,520],[820,1050],[560,1120]];
var KM=MW.KidsMap.create({T:T.kv,G:function(){return G},P:function(){return P},dTo:function(s){return dTo(s)},virt:function(){return !!(G&&G.virt)},mode:function(){return G&&G.mode},
  map:{W:1000,H:1400,top:170,start:START,spots:FP,roads:ROADS,vsc:.42,sky:"#bfe0ff",land:"#b9e39b",road:"#e7e2d5",roadLine:"#fff",label:"#17203a",labelHalo:"rgba(255,255,255,.9)",heroHalo:"rgba(255,194,26,.3)"},
  draw:{mark:function(g,x,y,r,col){g.save();g.fillStyle=col;g.beginPath();g.ellipse(x,y,r*.9,r,0,0,7);g.fill();g.restore()},
    ground:function(g){g.fillStyle="#a8d98a";[[200,250,160],[760,900,200],[300,1150,140],[650,250,120]].forEach(function(e){g.beginPath();g.ellipse(e[0],e[1],e[2],e[2]*.5,0,0,7);g.fill()});
      g.strokeStyle="#6ec3ff";g.lineWidth=70;g.lineCap="round";g.lineJoin="round";g.beginPath();[[0,640],[120,690],[260,660],[420,700],[600,680],[800,720],[1000,690]].forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke()},
    decor:function(g){TREES.forEach(function(p,i){KI.tree(g,p[0],p[1],44+(i%3)*8)});[[60,1000,"#f4a261"],[900,200,"#cdb4db"],[420,1000,"#8ecae6"]].forEach(function(h){KI.house(g,h[0],h[1],56,h[2])})},
    start:function(g,x,y,t,still){KI.police(g,x,y,90);g.fillStyle="#ffc21a";for(var i=0;i<8;i++)g.fillRect(x-160+i*44,y+24,24,8)},
    landmark:function(g,k,x,y,s){({bakker:function(){KI.bakery(g,x,y,s)},halte:function(){KI.sign(g,x,y,s,"#2563eb","B")},speel:function(){KI.swing(g,x,y,s)},school:function(){KI.school(g,x,y,s)},brug:function(){KI.bridge(g,x,y,s)},park:function(){KI.park(g,x,y,s)},kerk:function(){KI.church(g,x,y,s)},plein:function(){KI.fountain(g,x,y,s)},winkel:function(){KI.shop(g,x,y,s)},post:function(){KI.postbox(g,x,y,s)},kiosk:function(){KI.kiosk(g,x,y,s)}}[k]||function(){})()},
    hero:function(g,x,y){if(!imgAt(g,"kids-row",x,y+4,80)){g.fillStyle="#1d4ed8";g.beginPath();g.arc(x,y-20,22,0,7);g.fill()}},
    runner:function(g,fx,fy,t){if(!TH.init||!TH.tgt)return;var f=KM.fspot(KM.fk(TH.tgt)),run=TH.wait<=0,bob=run?Math.abs(Math.sin(t/120))*4:0,px=f.x+60+(run?Math.sin(t/900)*40:0),py=f.y+30;if(!imgAt(g,run?"boef-run":"boef-sneak",px,py-bob,80,.95,true,TH.vx<0))drawFig(g,px,py-bob,62,{tr:G.c.sus[G.c.K].tr,balloons:true})}}});
KM.mount();
/* binnen: op de plaats lopen (bewegingssensor) of op tempo, over de verhaalkaart */
var St=MW.Steps,INK=LS.get("ss_ag_in",{kind:"sensor",spm:100});
function inSheet(cb){var sens=St&&St.supported(),IN=T.kv;
  sheet('<h2>'+esc(IN.inH)+'</h2><p>'+esc(IN.inT)+'</p>'+(sens?'<button type="button" class="btn" id="inS">'+esc(IN.inSensor)+'</button>':'')+'<button type="button" class="btn'+(sens?' ghost dk':'')+'" id="inT">'+esc(IN.inTempo)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;if(sens)$("#inS").onclick=function(){St.ask().then(function(ok){closeSheet();if(!ok)toast(IN.inNoSensor);cb(ok?"sensor":"tempo",100)})};$("#inT").onclick=function(){closeSheet();cb("tempo",100)}}
function stepIn(k){if(!G||G.mode!=="in")return;G.in.steps+=k;var t=KM.near();if(!t)return;var d=dTo(t),m=k*G.in.sl;if(d<=m){P.x=t.x;P.y=t.y;G.dist+=d}else{P.x+=(t.x-P.x)/d*m;P.y+=(t.y-P.y)/d*m;G.dist+=m}}
function startSteps(){if(!St||!G||G.mode!=="in")return;St.start({mode:G.in.kind,spm:G.in.spm,onStep:stepIn,active:function(){return !!G&&G.mode==="in"&&!$("#play").hidden&&$("#sheet").hidden&&$("#hide").hidden},onDead:function(){if(!G||G.mode!=="in")return;G.in.kind="tempo";save();toast(T.kv.inNoSensor);startSteps()}});St.awake(true)}
function stopSteps(){if(St){St.stop();St.awake(false)}}
function buildVirt(seed,mode,origin,daily,len){build(seed,mode,null,null,origin,daily,len,true);if(G&&mode==="map")toast(T.kv.virtOut)}
function noMapSheet(seed,daily,why,len){sheet('<h2>'+T.kv.noMapQ+'</h2>'+(why?'<p class="note">'+esc(why)+'</p>':'')+'<p>'+esc(T.kv.noMapT)+'</p><button type="button" class="btn" id="nmGo">'+T.kv.noMapGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet;$("#nmGo").onclick=function(){closeSheet();MODE="street";LS.set("ss_ag_mode",MODE);build(seed,"street",null,null,null,daily,len)}}
function dropMap(){if(!G||G.mode==="street")return;Wk.stopWatch();KM.leave();stopSteps();G.virt=false;G.mode="street";G.i=0;while(G.ph[G.i])G.i++;G.st=null;save();show("cards");render();toast(T.kv.switched)}
function begin(seed,mode,daily,len){len=len||"normaal";if(mode==="in")return inSheet(function(kind,spm){INK={kind:kind,spm:spm};LS.set("ss_ag_in",INK);build(seed,"in",null,null,null,daily,len,true)});if(mode!=="map")return build(seed,mode,null,null,null,daily,len);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:LENR[len]||R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      if(!w.pois||!w.pois.length)return buildVirt(seed,"map",w.origin,daily,len);
      build(seed,"map",w.pois,w.ways,w.origin,daily,len);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})},function(){Wk.loading("");var kx=111320*Math.cos(lat*Math.PI/180);buildVirt(seed,"map",{lat:lat,lon:lon,kx:kx,ky:110540},daily,len)})
  }).catch(function(e){Wk.loading("");noMapSheet(seed,daily,e==="nogps"?T.noGps:T.denied,len)})}
function fail(m){sheet('<h2>'+T.fail+'</h2><p>'+esc(m)+'</p><button type="button" class="btn" id="shX">'+T.back+'</button>');$("#shX").onclick=closeSheet}
function build(seed,mode,pois,ways,origin,daily,len,virt){len=LENN[len]?len:"normaal";var N=LENN[len];
  var c=genCase(seed,mode,len);if(!c){toast("…");return}
  G={seed:seed,code:makeCode(seed,mode,len),mode:mode,age:AGE,len:len,R:LENR[len],c:c,i:0,ph:[],team:null,arrest:null,album:[],t0:0,tries:0,daily:!!daily,par:mode==="in"?35:70,dist:0,origin:origin,px:0,py:0,st:null,cine:false};
  G.signs=shuffle(D.STREETS,rngOf(seed^0x51ed270b)).slice(0,N);
  if(virt||mode==="in"){G.virt=true;G.st=KM.virtSpots(N).map(function(p,i){p.fi=i;p.done=false;return p});G.st.forEach(function(sp,i){G.signs[i]=sp.name});W=[];P={x:0,y:0,acc:0};LS.set(WK,W);if(mode==="in")G.in={kind:INK.kind,spm:INK.spm,steps:0,sl:KM.stepLen(G.st,1200)}}
  else if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,G.R,N,r,T.corner);
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het|the) /,"")),fi:i,done:false}});
    for(var k=0;G.st.length<N&&k<N;k++){var a=r()*6.283,d=G.R*(.35+.5*r());G.st.push({x:Math.round(Math.cos(a)*d),y:Math.round(Math.sin(a)*d),type:"hoek",name:cap((D.TYPES.hoek||"").replace(/^(de|het|the) /,""))+" "+(G.st.length+1),fi:G.st.length,done:false})}
    G.st.forEach(function(sp,i){if(sp.name&&!/^(Hoek|Corner)/.test(sp.name))G.signs[i]=sp.name});
    W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  Wk.loading(T.pois);imReady().then(function(){Wk.loading("");brief()})}
function brief(){var c=G.c;
  $("#bfNo").textContent=(G.mode==="demo"?T.demoCase:"");
  $("#bfOpen").innerHTML='<div class="chefpic"><img src="'+IMGROOT+'chef-talk.webp?v=3" alt="" class="chefimg"><img src="'+IMGROOT+'kids-row.webp?v=3" alt="" class="kidsimg"></div>'+bubble(fill(D.OPEN,{C:ballons(),N:(T.nw&&T.nw[NN()])||NN()}),D.CHEF,"big");
  $("#bfSus").innerHTML=c.sus.map(susCard).join("");
  $("#bfTip").innerHTML=MW.codeBox(L,G.code,"zaak");MW.bindCodeBox($("#bfTip"),L);
  show("brief")}
function chefScene(cv){var g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=(ts-t0)/1000;g.clearRect(0,0,300,200);
    var sky=g.createLinearGradient(0,0,0,200);sky.addColorStop(0,"#1d4ed8");sky.addColorStop(1,"#0d2a66");g.fillStyle=sky;g.fillRect(0,0,300,200);
    g.fillStyle="#0b1f4d";g.fillRect(0,150,300,50);g.fillStyle="#ffc21a";for(var i=0;i<300;i+=40)g.fillRect(i,160,20,6);
    g.fillStyle="#17336f";g.fillRect(20,40,260,112);g.fillStyle="#ffc21a";g.font="700 16px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText(L==="nl"?"BUREAU BUURTWACHT":"NEIGHBOURHOOD WATCH",150,62);
    var on=still||Math.floor(t*3)%2===0;g.fillStyle=on?"#ff3b3b":"#4fd3ff";g.shadowColor=g.fillStyle;g.shadowBlur=18;g.beginPath();g.arc(42,70,6,0,7);g.fill();g.fillStyle=on?"#4fd3ff":"#ff3b3b";g.shadowColor=g.fillStyle;g.beginPath();g.arc(258,70,6,0,7);g.fill();g.shadowBlur=0;
    drawFig(g,150,152,96,{cop:true});
    for(i=0;i<3;i++)drawFig(g,60+i*22+(i===2?110:0),152,56,{cop:true});
    if(!still&&t<12)requestAnimationFrame(f)};requestAnimationFrame(f)}
function susCard(s,i,pick){return '<'+(pick?'button type="button"':'div')+' class="sus face"'+(pick?' data-s="'+i+'"':'')+'><img class="face" src="'+figURL(s.tr,110,{b:boefIdx(s.name)})+'" alt=""><div class="sbody"><b>'+esc(s.name)+'</b><small>'+esc(cap(s.rel))+' · '+esc(s.q)+'</small><div class="tags">'+ATK.map(function(k){return '<i class="t-'+k+s.tr[k]+'">'+esc(D.AT[k].s[s.tr[k]])+"</i>"}).join("")+'</div></div></'+(pick?'button':'div')+'>'}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode==="map"||G.mode==="street")MW.pro.setFree(ID)}save();hush();if(!G.cine){G.cine=true;save();cine(function(){photoSheet("team",enter)})}else enter()};
$("#bBack").onclick=function(){G=null;hush();home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}

/* ---------- intro: de beëdiging ---------- */
function cine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,dpr,t0=0,fin=false,raf=0;
  ov.hidden=false;var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  var r=rngOf(7),bld=[],x=-20;while(x<w+60){var bw=40+r()*60,bh=50+r()*120;bld.push({x:x,w:bw,h:bh,c:["#f4a261","#e76f51","#8ecae6","#ffb703","#90be6d","#f8edeb"][Math.floor(r()*6)],win:[]});for(var i=0;i<bw/14-1;i++)for(var j=0;j<bh/18-1;j++)bld[bld.length-1].win.push([7+i*14,10+j*18]);x+=bw+6+r()*10}
  var lines=T.cine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?9:t;
    g.setTransform(dpr,0,0,dpr,0,0);var sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#1d4ed8");sky.addColorStop(.7,"#60a5fa");sky.addColorStop(1,"#fde68a");g.fillStyle=sky;g.fillRect(0,0,w,h);
    g.fillStyle="#fff7c2";g.shadowColor="#fff";g.shadowBlur=40;g.beginPath();g.arc(w*.8,h*.2,34,0,7);g.fill();g.shadowBlur=0;
    var base=h*.78;
    bld.forEach(function(b){g.fillStyle=b.c;g.fillRect(b.x,base-b.h,b.w,b.h);g.fillStyle="rgba(0,0,0,.18)";g.fillRect(b.x,base-b.h,b.w,8);b.win.forEach(function(wn){g.fillStyle="#1e3a8a";g.fillRect(b.x+wn[0],base-b.h+wn[1],8,10)})});
    g.fillStyle="#334155";g.fillRect(0,base,w,h-base);g.fillStyle="#ffc21a";for(i=0;i<w;i+=44)g.fillRect(i,base+22,22,5);
    /* agentjes op een rij */if(!imgAt(g,"kids-row",w*.42,base+6,Math.min(150,h*.22)))for(i=0;i<4;i++)drawFig(g,w*.2+i*w*.13,base+6,Math.min(110,h*.17),{cop:true});
    /* penning zoomt in */if(ph>1.2&&ph<4.2){var sc=Math.min(1,(ph-1.2)/.6),bs=Math.min(w,h)*.3*sc;badgeDraw(g,w/2,h*.4,bs,NAME||(L==="nl"?"AGENT":"OFFICER"))}
    if(ph>5.2&&ph<7.4){var cx2=-200+(ph-5.2)/2.2*(w+400);imgAt(g,"car",cx2,base+10,Math.min(120,h*.17))}
    /* zwaailicht */if(ph>5.5){var on=Math.floor(ph*4)%2===0;g.fillStyle=on?"rgba(255,59,59,.28)":"rgba(79,211,255,.28)";g.fillRect(0,0,w,h)}
    /* de boef rent weg met ballonnen */if(ph>6.3&&ph<9){var sx=w*1.1-(ph-6.3)/2.7*w*1.3;if(!imgAt(g,"boef-run",sx,base+6,Math.min(170,h*.25)))drawFig(g,sx,base+6,Math.min(130,h*.2),{tr:{hoofd:1,shirt:0,voet:0},balloons:true})}
    if(ph>7.2){g.textAlign="center";g.fillStyle="#ffc21a";g.strokeStyle="#0d2a66";g.lineWidth=6;var sc2=Math.min(1,(ph-7.2)/.5),fs=Math.round(42*sc2+14);g.font="700 "+fs+"px 'Barlow Condensed','Arial Narrow',sans-serif";var tt=L==="nl"?["AGENT VOOR","EÉN DAG"]:["OFFICER FOR","A DAY"];g.strokeText(tt[0],w/2,h*.36);g.fillText(tt[0],w/2,h*.36);g.strokeText(tt[1],w/2,h*.36+fs*1.05);g.fillText(tt[1],w/2,h*.36+fs*1.05)}
    var li=Math.min(lines.length-1,Math.floor(ph/1.5));txt.textContent=ph<7.2?lines[li]:"";if(li!==spoken&&ph<7.2&&!still){spoken=li;say(lines[li])}
    if(ph>9.4)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}
function badgeDraw(g,x,y,s,name){g.save();g.translate(x,y);var star=function(R,r){g.beginPath();for(var i=0;i<14;i++){var a=-Math.PI/2+i*Math.PI/7,rad=i%2?r:R;g.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}g.closePath()};
  g.shadowColor="rgba(0,0,0,.4)";g.shadowBlur=20;g.fillStyle="#ffc21a";star(s,s*.72);g.fill();g.shadowBlur=0;g.strokeStyle="#9a6a00";g.lineWidth=s*.04;g.stroke();
  g.fillStyle="#1e3a8a";g.beginPath();g.arc(0,0,s*.52,0,7);g.fill();g.fillStyle="#ffc21a";g.font="700 "+Math.round(s*.22)+"px 'Barlow Condensed',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(String(name).toUpperCase().slice(0,10),0,-s*.06,s*.9);g.font="600 "+Math.round(s*.12)+"px 'Barlow Condensed',sans-serif";g.fillText(L==="nl"?"POLITIE":"POLICE",0,s*.18);g.restore()}

/* ---------- foto's: teamfoto en arrestatiefoto (souvenirs, geen controle) ---------- */
function photoSheet(kind,then,mis){photoFor={kind:kind,then:then,mis:mis};var team=kind==="team",miss=kind==="miss",H2=miss?T.missH:team?T.teamH:T.arrestH,TX=miss?mis[0]:team?T.teamT:T.arrestT;
  sheet('<div class="eyebrow">'+esc(H2)+(miss?' · '+mis[1]:'')+'</div><div class="task"><div class="ph">'+(miss?'<span class="memo">'+mis[1]+'</span>':icoImg("team","big"))+'</div><div><h2>'+esc(H2)+'</h2><p class="hint">'+esc(TX)+'</p></div></div>'+(miss?'<p class="note">'+esc(T.missNote)+'</p>':'')+
    '<label class="btn cam" for="file">📷 '+T.shoot+'</label><p class="note" id="pMsg"></p><p class="note">'+esc(T.camNote)+'</p><button type="button" class="btn ghost dk" id="pSkip">'+T.skipPhoto+'</button>',true);
  say(TX);
  $("#pSkip").onclick=function(){closeSheet();photoFor=null;then()}}
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f||!G||!photoFor)return;var msg=$("#pMsg");
  var url=URL.createObjectURL(f),im=new Image();im.onload=function(){URL.revokeObjectURL(url);
    var miss=photoFor.kind==="miss",w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,(miss?400:480)/Math.max(w,h)),cv=document.createElement("canvas");cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
    var u=cv.toDataURL("image/jpeg",miss?.68:.72);if(miss){if(!Array.isArray(G.album))G.album=[];G.album.push({u:u,t:photoFor.mis[0],e:photoFor.mis[1]});G.album=G.album.slice(-4)}else G[photoFor.kind]=u;save();buzz([40,30,80]);beep(660,.15);var th=photoFor.then;closeSheet();photoFor=null;th()};
  im.onerror=function(){URL.revokeObjectURL(url);if(msg)msg.textContent=T.noFile};im.src=url});

/* ---------- spelen zonder kaart: kaartjes ---------- */
function enter(){fixG(G);if(G.mode==="map"||G.mode==="demo"||G.mode==="in")enterMap();else{show("cards");render()}}
function hud(){if(!G)return;var n=done();$("#hT").textContent=mmss(Date.now()-G.t0);$("#hS").textContent=n+"/"+NN();ballUI($("#hM"),n);goldUI($("#hG"))}
function ballUI(el,n){if(!el)return;var N=NN();el.innerHTML="";el.classList.toggle("many",N>8);for(var i=0;i<N;i++){var s=document.createElement("i");s.style.setProperty("--c",COL[i%3]);if(i<n)s.className="on";el.appendChild(s)}}
/* gouden cijfers: één munt per spoor; gevonden = cijfer, nog niet = vraagteken */
function coinsHTML(hi){var dg=G.c.digits||[];return dg.map(function(d,i){var got=!!G.ph[i];return '<i class="coin'+(got?"":" no")+(hi===i?" hi":"")+'" data-i="'+i+'"><span>'+(got?d:"?")+'</span><small>'+(i+1)+'</small></i>'}).join("")}
function goldUI(el){if(!el||!G||!G.c)return;var h='<b>'+esc(T.goldBar)+'</b><div class="coins">'+coinsHTML()+'</div>';if(el.dataset.h!==h){el.innerHTML=h;el.dataset.h=h}}
function render(){hud();while(G.i<NN()&&G.ph[G.i])G.i++;var i=G.i,box=$("#card"),N=NN();
  if(i>=N){box.innerHTML='<div class="pol done"><div class="grid">'+G.ph.map(function(p){return '<img src="'+p+'" alt="">'}).join("")+'</div></div>'+bubble(T.radarAll,D.CHEF)+'<button type="button" class="btn red" id="bAcc">'+(G.vault?T.last:T.twistGo)+'</button>';$("#bAcc").onclick=toFinale;return}
  var s=G.c.slots[i];
  box.innerHTML='<div class="pol empty"><div class="ph">'+icoImg(s.id,"big")+'</div><p class="cap">'+esc(fill(T.task,{i:i+1,n:N}))+' · '+esc(T.kinds[s.act])+'</p></div>'+bubble(s.ask,D.CHEF)+'<button type="button" class="btn" id="bOpen">▶ '+T.start+'</button>';
  $("#bOpen").onclick=function(){taskSheet(i)}}

/* ---------- spelen met kaart: politiekaart, zwaailicht om de speler, de boef die rondsluipt met ballonnen ---------- */
function enterMap(){show("play");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return RR()},
    theme:{bg:"#15337a",water:"#1d6fd1",waterEdge:"#4fd3ff",ripple:"rgba(79,211,255,.3)",park:"#1f8a4c",parkEdge:"#5fd38a",river:"#1d6fd1",major:"#ffc21a",minor:"#4a6fc0",road:"#8fb0ff",label:"#ffe08a",waterLabel:"#bfeaff",ring:"rgba(255,194,26,.35)",me:"#ffc21a",meHalo:"rgba(255,194,26,.16)",meRing:"rgba(255,194,26,.7)",font:"700 12px 'Barlow Condensed',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(RR());sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;TH.init=false;TH.tgt=null;TH.wait=0;TH.flee=0;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d;KM.moved(d)});
  KM.enter({kids:true,virt:!!G.virt,map:map});stopSteps();if(G.mode==="in")startSteps();
  if(G.mode==="demo")toast(T.demoTip);
  goldUI($("#mG"));
  requestAnimationFrame(loop)}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[];
  /* zwaailicht om de speler */
  it.push({x:P.x,y:P.y,tap:false,draw:function(cx,X,Y,t,api){if(api.still)return;var on=Math.floor(t/350)%2===0;cx.save();cx.fillStyle=on?"rgba(255,59,59,.22)":"rgba(79,211,255,.22)";cx.beginPath();cx.arc(X,Y,30+8*Math.sin(t/200),0,7);cx.fill();cx.restore()}});
  var open=G.st.filter(function(s){return !s.done});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/500+s.fi)*3,col=["#ffc21a","#ff6b9d","#4fd3ff"][s.fi%3];
    if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*22,0,7);cx.stroke();cx.globalAlpha=1}
    Wk.badge(cx,X,Y+bob*.3,"obj",s.done?"#6b7fa8":col,1,s.done);
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,26,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#9fb0d8":"#fff";cx.shadowColor="#000";cx.shadowBlur=6;if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+36);cx.shadowBlur=0}})});
  if(open.length){var k=G.c.sus[G.c.K];it.push({x:TH.x,y:TH.y,tap:false,draw:function(cx,X,Y,t,api){var run=TH.wait<=0,key=run?"boef-run":"boef-sneak",bob=run?Math.abs(Math.sin(t/(TH.flee>0?70:120)))*4:0,al=.8+.2*Math.abs(Math.sin(t/400));
    cx.save();cx.fillStyle="rgba(0,0,0,.25)";cx.beginPath();cx.ellipse(X,Y+4,18,6,0,0,7);cx.fill();cx.restore();
    if(!imgAt(cx,key,X,Y-bob,68,al,true,TH.vx<0))drawFig(cx,X,Y-bob,62,{tr:k.tr,balloons:true,al:al})}})}
  return it}
/* de dief loopt echt over de kaart: van open spoor naar open spoor, blijft even rondhangen, en gaat weer verder. Kom je te dichtbij, dan rent hij hard weg. */
var TH={x:0,y:0,tgt:null,vx:1,wait:0,init:false,flee:0,lastFlee:0};
function thiefTick(dt){if(!G||!G.st)return;var open=G.st.filter(function(s){return !s.done});if(!open.length)return;
  if(!TH.init){var s0=open[Math.floor(Math.random()*open.length)];TH.x=s0.x+40;TH.y=s0.y-20;TH.init=true;TH.wait=1}
  if(TH.flee>0)TH.flee-=dt;
  if(!TH.tgt||TH.tgt.done){var cand=open.filter(function(s){return s!==TH.tgt});if(!cand.length)cand=open;TH.tgt=cand[Math.floor(Math.random()*cand.length)];TH.off={x:(Math.random()-.5)*70,y:(Math.random()-.5)*50}}
  if(TH.wait>0){TH.wait-=dt;if(TH.wait<=0){var c2=open.filter(function(s){return s!==TH.tgt});TH.tgt=(c2.length?c2:open)[Math.floor(Math.random()*(c2.length||open.length))];TH.off={x:(Math.random()-.5)*70,y:(Math.random()-.5)*50}}return}
  var tx=TH.tgt.x+TH.off.x,ty=TH.tgt.y+TH.off.y,dx=tx-TH.x,dy=ty-TH.y,d=Math.hypot(dx,dy),sp=TH.flee>0?120:38;
  if(d<4){TH.wait=4+Math.random()*5;return}
  var st=Math.min(d,sp*dt);TH.x+=dx/d*st;TH.y+=dy/d*st;if(Math.abs(dx)>2)TH.vx=dx}
/* te dichtbij: de dief schrikt, roept iets en rent naar een spoor ver weg */
function thiefNear(){if(!TH.init||TH.flee>0||!$("#sheet").hidden||Date.now()-TH.lastFlee<45000)return;if(Math.hypot(TH.x-P.x,TH.y-P.y)>45)return;
  var open=G.st.filter(function(s){return !s.done});if(!open.length)return;TH.lastFlee=Date.now();TH.flee=6;TH.wait=0;
  TH.tgt=open.slice().sort(function(a,b){return Math.hypot(b.x-P.x,b.y-P.y)-Math.hypot(a.x-P.x,a.y-P.y)})[0];TH.off={x:0,y:0};popTaunt(D.TAUNT[2],true)}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=110*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  thiefTick(dt);if(!KM.draw(t))map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tickMap()}requestAnimationFrame(loop)}
function tickMap(){var el=Math.floor((Date.now()-G.t0)/1000),n=done();
  $("#mT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#mS").textContent=n+"/"+NN();ballUI($("#mM"),n);goldUI($("#mG"));
  var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});
  $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);beep(660,.2)}if(!here)arrived=null;
  thiefNear();chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel),act=G.c.slots[sel.fi].act;
  $("#cName").textContent=sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=T.here+" · "+T.kinds[act];
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))taskSheet(sel.fi,sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;taskSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mPeople").onclick=susSheet;$("#mAcc").onclick=toFinale;
$("#bNote").onclick=noteSheet;$("#bPeople").onclick=susSheet;$("#bAcc2").onclick=toFinale;

/* ---------- een spoor: opdracht → puzzel → bord terug, spoor en gouden cijfer ---------- */
function taskSheet(i,spot){walkTo=null;$$(".taunt").forEach(function(x){x.remove()});var s=G.c.slots[i];cur={i:i,spot:spot||null};var n=done()+1,I=T.pz[s.act],hint=HARD()&&I[2]?I[2]:I[1];
  var head='<div class="eyebrow">'+esc(fill(T.task,{i:n,n:NN()}))+' · '+esc(T.kinds[s.act])+(spot?' · '+esc(spot.name):'')+'</div>'+bubble(s.ask,D.CHEF);
  sheet(head+'<div class="pzh"><h2>'+esc(I[0])+'</h2><p class="hint">'+esc(hint)+'</p></div><div id="pz"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){G.force=null;closeSheet()};
  say(s.ask+" "+hint);
  var fin=false,o={box:$("#pz"),rng:rngOf(G.seed*7+i*131),done:function(){if(fin)return;fin=true;mg.stop();cur.thumb=ballThumb(i,s.act);accept()},
    canvas:function(hh){o.box.innerHTML='<canvas class="sq" width="280" height="'+(hh||280)+'"></canvas>';var c=o.box.firstChild;if(hh)c.style.aspectRatio="280/"+hh;return c},
    at:function(e,c){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*280,(e.clientY-b.top)/b.height*(c.height)]},
    msg:function(t){var m=$("#pzM");if(!m){m=document.createElement("p");m.id="pzM";m.className="pzst";o.box.appendChild(m)}m.textContent=t},
    say:say,good:function(){buzz(80);beep(660,.15);setTimeout(function(){beep(990,.2)},120)},bad:function(){G.oops=(G.oops||0)+1;buzz(120);beep(180,.2)}};
  if(/debug/.test(location.search))window.AG_DBG=o;
  if(window.MMP)MMP.helper(function(){G.t0-=120000;G.oops=(G.oops||0)+2;G.skips=(G.skips||0)+1;save();o.done()},function(){say(s.ask+" "+hint)});
  PUZ[s.act](o)}
function accept(){var i=cur.i,s=G.c.slots[i];G.ph[i]=cur.thumb;if(cur.spot){cur.spot.done=true;cur.spot.doneAt=Date.now();G.kd0=null}G.force=null;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;save();buzz([40,30,80]);beep(520,.15);
  var N=NN(),kind=s.kind,n=done(),dg=G.c.digits[i],last=n>=N,cliff=last?D.CLIFFLAST:D.CLIFF[(n-1+(G.seed%7))%D.CLIFF.length],
    head=kind==="ev"?T.ev:kind==="claim"?T.wit:T.gag,sub=kind==="ev"?T.evT:kind==="claim"?(HARD()?T.witT8:T.witT):"",txt=kind==="claim"?claimText(G.c.claims[s.w]):s.t,who=kind==="claim"?G.c.claims[s.w].who:D.CHEF,av=kind==="claim"?witAv(who):CHEF;
  sheet('<div class="eyebrow">'+esc(fill(T.clue,{n:n,t:N}))+' · '+esc(T.reply)+'</div><div class="ballwrap"><canvas id="ballC" width="320" height="200"></canvas><b>'+esc(fill(T.balloon,{n:n}))+'</b></div>'+
    '<div class="goldget"><i class="coin big"><span>'+dg+'</span><small>'+(i+1)+'</small></i><p>'+esc(T.goldT)+'</p></div>'+
    '<div class="msg small">'+CHEF+'<div class="bub"><p>'+esc(s.react)+'</p></div></div>'+
    '<div class="rep k-'+kind+'"><em>'+esc(head)+'</em>'+(kind==="ev"?'<canvas class="evc" id="evC" width="300" height="120"></canvas>':'')+bubble(txt,kind==="claim"?who+" · "+G.c.claims[s.w].rel:null,"",av)+(sub?'<p class="note">'+esc(sub)+'</p>':'')+'</div>'+
    '<p class="cliff">'+esc(cliff)+'</p>'+
    '<button type="button" class="btn" id="bNext">'+(last?T.twistGo:T.next)+'</button>',true);
  ballAnim($("#ballC"),n);if(kind==="ev"){evDraw($("#evC"),s.k,s.v);buzz([60,40,60,40,120])}
  say(s.react+" "+head+". "+(kind==="claim"?who+": ":"")+txt+" "+fill(T.goldSay,{d:dg})+" "+cliff);
  $("#bNext").onclick=function(){closeSheet();sel=null;cur=null;afterLead(n)}}
/* na een spoor: soms een fotomissie, dan de dief of de chef tussendoor, of (alles binnen) de twist */
function afterLead(n){var N=NN(),go=function(){if(G.mode==="map"||G.mode==="demo")chip();else render();if(n>=N){toFinale();return}interlude(n)};
  var ms=MISSAT[G.len]||[],mi=ms.indexOf(n);G.miss=G.miss||{};
  if(mi>=0&&!G.miss[n]&&D.MISS){G.miss[n]=1;save();return photoSheet("miss",go,D.MISS[(mi+G.seed)%D.MISS.length])}
  go()}
function interlude(n){var N=NN(),thief=n%2===1,t;
  if(thief)t=D.TAUNT[(Math.floor(n/2)+G.seed)%D.TAUNT.length];
  else{var k=(Math.floor(n/2)-1+G.seed)%D.RADIO.length,open=G.st?G.st.filter(function(s){return !s.done}):[],sp=open.length?open[(n*7+G.seed)%open.length]:null;
    t=fill(D.RADIO[k],{p:sp?sp.name:D.RADIOP,n:N-n});if(sp&&/\{p\}/.test(D.RADIO[k])){TH.tgt=sp;TH.wait=0;TH.off={x:24,y:-12}}}
  popTaunt(t,thief)}
/* klein berichtje dat binnenschuift: de dief (brutaal) of de chef (portofoon) */
function popTaunt(t,thief){$$(".taunt").forEach(function(x){x.remove()});var el=document.createElement("div");el.className="taunt "+(thief?"boef":"chef");
  el.innerHTML='<img src="'+IMGROOT+(thief?"boef-sneak":"chef-talk")+'.webp?v=3" alt=""><div><em>'+esc(thief?cap(D.V):D.CHEF)+(thief?"":" · 📻")+'</em><p>'+esc(t)+'</p></div>';
  document.body.appendChild(el);var gone=false,bye=function(){if(gone)return;gone=true;el.classList.remove("in");setTimeout(function(){el.remove()},450)};el.onclick=bye;
  requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add("in")})});
  if(thief){beep(1200,.06);setTimeout(function(){beep(1500,.08)},90)}else{beep(900,.06);setTimeout(function(){beep(700,.08)},120)}buzz(40);
  say(t);setTimeout(bye,6500)}
/* ballon: als plaatje voor de strook en als animatie (zweeft omhoog) */
function drawBalloon(g,cx,cy,r,n,col){g.save();g.strokeStyle="rgba(255,255,255,.7)";g.lineWidth=1.5;g.beginPath();g.moveTo(cx,cy+r*1.25);g.quadraticCurveTo(cx+r*.3,cy+r*1.8,cx-r*.1,cy+r*2.3);g.stroke();
  g.fillStyle=col;g.shadowColor="rgba(0,0,0,.3)";g.shadowBlur=8;g.beginPath();g.ellipse(cx,cy,r,r*1.22,0,0,7);g.fill();g.shadowBlur=0;g.beginPath();g.moveTo(cx-r*.15,cy+r*1.2);g.lineTo(cx+r*.15,cy+r*1.2);g.lineTo(cx,cy+r*1.38);g.fill();
  g.fillStyle="rgba(255,255,255,.45)";g.beginPath();g.ellipse(cx-r*.38,cy-r*.45,r*.2,r*.38,-.5,0,7);g.fill();
  if(n!=null){g.fillStyle=col==="#ffffff"?"#1e3a8a":"#fff";g.font="700 "+Math.round(r*.9)+"px 'Barlow Condensed',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(n,cx,cy+r*.05)}g.restore()}
function ballThumb(i,act){var cv=document.createElement("canvas");cv.width=cv.height=240;var g=cv.getContext("2d"),bg=g.createLinearGradient(0,0,0,240);bg.addColorStop(0,"#15337a");bg.addColorStop(1,"#0d2a66");g.fillStyle=bg;g.fillRect(0,0,240,240);
  g.fillStyle="#334155";g.fillRect(0,170,240,70);g.fillStyle="#ffc21a";for(var k=0;k<240;k+=40)g.fillRect(k,200,20,4);g.fillStyle="#475569";g.fillRect(114,60,12,120);drawSign(g,120,70,200,G.signs[i],i+1,14);
  g.fillStyle="#fff";g.font="700 20px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText(T.kinds[act],120,222);return cv.toDataURL("image/jpeg",.8)}
function ballAnim(cv,n){var g=cv.getContext("2d"),t0=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var f=function(ts){if(!t0)t0=ts;var t=Math.min(1,(ts-t0)/1100);if(still)t=1;var e=1-Math.pow(1-t,3);g.clearRect(0,0,320,200);
    for(var k=0;k<24;k++){var a=k/24*6.283,d=40+e*90;g.fillStyle=COL[k%4];g.globalAlpha=(1-t)*.9;g.beginPath();g.arc(160+Math.cos(a)*d,100+Math.sin(a)*d*.6,3,0,7);g.fill()}g.globalAlpha=1;
    g.save();g.translate(160,100-(1-e)*120);g.rotate((1-e)*.6);drawSign(g,0,0,120+e*160,G.signs[cur?cur.i:n-1],n,16);g.restore();if(t<1&&cv.isConnected)mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)}
function evDraw(cv,k,v){var g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,300,120);g.strokeStyle="#ffc21a";g.lineWidth=6;g.setLineDash([14,8]);g.strokeRect(6,6,288,108);g.setLineDash([]);
  g.fillStyle="#ffe9a8";g.beginPath();g.ellipse(150,62,60,46,0,0,7);g.fill();itemImg(g,k,v,150,60,1.4);
  g.fillStyle="#9a6a00";g.font="700 14px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText(D.AT[k].s[v].toUpperCase(),150,112)}

/* ---------- de politiepuzzels ---------- */
/* vingerafdruk tekenen: type 0 cirkels, 1 scheve ellipsen, 2 bogen, 3 spiraal */
function drawPrint(g,cx,cy,r,type,seed,col){var q=rngOf(seed);g.save();g.strokeStyle=col||"#1e293b";g.lineWidth=Math.max(1.5,r*.045);g.lineCap="round";
  var N=7;
  if(type===3){g.beginPath();for(var a=0;a<=N*6.283;a+=.08){var R2=r*a/(N*6.283);g.lineTo(cx+Math.cos(a)*R2,cy+Math.sin(a)*R2*.9)}g.stroke();g.restore();return}
  for(var i=1;i<=N;i++){var rad=r*i/N;
    if(type===2){g.beginPath();g.ellipse(cx,cy+r*.55,rad,rad*1.05,0,Math.PI+.15,6.283-.15);g.stroke();continue}
    var gaps=1+Math.floor(q()*2),ga=q()*6.283;
    for(var s=0;s<gaps;s++){var a0=ga+s*6.283/gaps+.25,a1=ga+(s+1)*6.283/gaps-.25;g.beginPath();
      if(type===0)g.arc(cx,cy,rad,a0,a1);else g.ellipse(cx,cy,rad,rad*.62,.6,a0,a1);
      g.stroke()}}
  g.restore()}
/* voetzool met patroon: 0 rondjes, 1 zigzag, 2 strepen, 3 sterren */
function drawSole(g,cx,cy,h,pat,col,ink){g.save();g.translate(cx,cy);var w=h*.46;g.fillStyle=col;g.beginPath();g.ellipse(0,-h*.22,w*.5,h*.3,0,0,7);g.fill();g.beginPath();g.ellipse(0,h*.28,w*.42,h*.2,0,0,7);g.fill();g.fillRect(-w*.42,-h*.1,w*.84,h*.4);
  g.fillStyle=ink;g.strokeStyle=ink;g.lineWidth=Math.max(1.5,h*.03);
  if(pat===0){for(var r=0;r<4;r++)for(var c=0;c<2;c++){g.beginPath();g.arc(-w*.18+c*w*.36,-h*.36+r*h*.2,h*.04,0,7);g.fill()}}
  else if(pat===1){g.beginPath();for(var i=0;i<6;i++){g.lineTo((i%2?-1:1)*w*.25,-h*.4+i*h*.16)}g.stroke()}
  else if(pat===2){for(r=0;r<5;r++)g.fillRect(-w*.3,-h*.4+r*h*.17,w*.6,h*.05)}
  else{for(r=0;r<3;r++){var sx=0,sy=-h*.32+r*h*.27;g.beginPath();for(i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rad=i%2?h*.035:h*.08;g.lineTo(sx+Math.cos(a)*rad,sy+Math.sin(a)*rad)}g.closePath();g.fill()}}
  g.restore()}
/* straatje voor de verrekijker: één scène, alle elementen uit S */
function drawScene(g,S,W,H){g.save();var sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#60a5fa");sky.addColorStop(1,"#bfdbfe");g.fillStyle=sky;g.fillRect(0,0,W,H);
  if(S.sun){g.fillStyle="#fde047";g.beginPath();g.arc(W*.86,H*.2,H*.1,0,7);g.fill()}
  S.clouds.forEach(function(c){g.fillStyle="#fff";g.beginPath();g.arc(c.x,c.y,10,0,7);g.arc(c.x+12,c.y-4,12,0,7);g.arc(c.x+26,c.y,10,0,7);g.fill()});
  g.fillStyle="#86efac";g.fillRect(0,H*.7,W,H*.3);g.fillStyle="#9ca3af";g.fillRect(0,H*.84,W,H*.16);
  S.houses.forEach(function(h){g.fillStyle=h.col;g.fillRect(h.x,H*.7-h.h,h.w,h.h);g.fillStyle="#7f1d1d";g.beginPath();g.moveTo(h.x-4,H*.7-h.h);g.lineTo(h.x+h.w/2,H*.7-h.h-h.w*.45);g.lineTo(h.x+h.w+4,H*.7-h.h);g.fill();
    g.fillStyle=h.door;g.fillRect(h.x+h.w*.4,H*.7-h.h*.4,h.w*.2,h.h*.4);if(h.win){g.fillStyle="#bae6fd";g.fillRect(h.x+h.w*.12,H*.7-h.h*.8,h.w*.22,h.h*.25);g.fillRect(h.x+h.w*.66,H*.7-h.h*.8,h.w*.22,h.h*.25)}});
  if(S.tree){g.fillStyle="#78350f";g.fillRect(S.tree.x-4,H*.52,8,H*.2);g.fillStyle="#16a34a";g.beginPath();g.arc(S.tree.x,H*.48,H*.14,0,7);g.fill();if(S.tree.apples){g.fillStyle="#ef4444";[[-8,-6],[6,2],[-2,8]].forEach(function(p){g.beginPath();g.arc(S.tree.x+p[0],H*.48+p[1],3,0,7);g.fill()})}}
  if(S.car){g.fillStyle=S.car.col;rr(g,S.car.x,H*.84-18,46,16,5);g.fill();rr(g,S.car.x+10,H*.84-30,26,14,5);g.fill();g.fillStyle="#111";g.beginPath();g.arc(S.car.x+10,H*.84,5,0,7);g.arc(S.car.x+36,H*.84,5,0,7);g.fill()}
  S.flowers.forEach(function(f){g.strokeStyle="#15803d";g.lineWidth=2;g.beginPath();g.moveTo(f.x,H*.84);g.lineTo(f.x,H*.76);g.stroke();g.fillStyle=f.col;g.beginPath();g.arc(f.x,H*.75,5,0,7);g.fill()});
  if(S.cat){g.fillStyle="#374151";g.beginPath();g.ellipse(S.cat.x,H*.8,12,6,0,0,7);g.fill();g.beginPath();g.arc(S.cat.x+10,H*.76,5,0,7);g.fill();g.beginPath();g.moveTo(S.cat.x+6,H*.73);g.lineTo(S.cat.x+8,H*.68);g.lineTo(S.cat.x+10,H*.73);g.moveTo(S.cat.x+11,H*.73);g.lineTo(S.cat.x+13,H*.68);g.lineTo(S.cat.x+14,H*.73);g.fill()}
  if(S.bird){g.strokeStyle="#111";g.lineWidth=2;g.beginPath();g.moveTo(S.bird.x-8,S.bird.y);g.quadraticCurveTo(S.bird.x-4,S.bird.y-6,S.bird.x,S.bird.y);g.quadraticCurveTo(S.bird.x+4,S.bird.y-6,S.bird.x+8,S.bird.y);g.stroke()}
  if(S.balloon){drawSign(g,S.balloon.x,H*.62,34,"STRAAT",null)}
  g.restore()}
var PUZ={
  /* 1 vingerafdruk: poeder wegvegen, dan de juiste van vier kiezen */
  print:function(o){var c=o.canvas(),g=c.getContext("2d"),r=o.rng,type=Math.floor(r()*4),seed=Math.floor(r()*1e6),stage=1;
    var back=document.createElement("canvas");back.width=back.height=280;var bg=back.getContext("2d");bg.fillStyle="#e2e8f0";bg.fillRect(0,0,280,280);bg.fillStyle="#f8fafc";rr(bg,30,30,220,220,20);bg.fill();drawPrint(bg,140,140,88,type,seed);
    var fog=document.createElement("canvas");fog.width=fog.height=280;var fg=fog.getContext("2d");fg.fillStyle="#475569";fg.fillRect(0,0,280,280);for(var k=0;k<500;k++){fg.fillStyle="rgba(148,163,184,.5)";fg.beginPath();fg.arc(Math.random()*280,Math.random()*280,2+Math.random()*5,0,7);fg.fill()}
    var downp=false,wiped=0,draw=function(){g.drawImage(back,0,0);g.drawImage(fog,0,0)};draw();o.msg(T.pz.wipeMore);
    var check=function(){var d=fg.getImageData(0,0,280,280).data,n=0,m=0;for(var i=3;i<d.length;i+=16){m++;if(d[i]<40)n++}if(n/m>.45){stage=2;pick()}};
    var wipe=function(e){if(!downp||stage!==1)return;var q=o.at(e,c);fg.globalCompositeOperation="destination-out";fg.fillStyle="#000";fg.beginPath();fg.arc(q[0],q[1],28,0,7);fg.fill();fg.globalCompositeOperation="source-over";wiped++;draw();if(wiped%6===0)check()};
    c.addEventListener("pointerdown",function(e){if(stage===1){downp=true;wipe(e)}else tap(e)});c.addEventListener("pointermove",wipe);c.addEventListener("pointerup",function(){downp=false;if(stage===1)check()});c.addEventListener("pointercancel",function(){downp=false});
    var opts=[],right=0;function pick(){var types=shuffle([0,1,2,3],r);right=types.indexOf(type);opts=types.map(function(t,i){return{t:t,x:40+i*66.6,y:222}});o.good();o.msg(T.pz.pick);o.say(T.pz.pick);
      g.fillStyle="#e2e8f0";g.fillRect(0,0,280,280);g.fillStyle="#f8fafc";rr(g,70,16,140,140,16);g.fill();drawPrint(g,140,86,58,type,seed);g.strokeStyle="#ffc21a";g.lineWidth=4;rr(g,70,16,140,140,16);g.stroke();
      opts.forEach(function(p){g.fillStyle="#fff";rr(g,p.x-30,p.y-30,60,60,10);g.fill();g.strokeStyle="#94a3b8";g.lineWidth=2;g.stroke();drawPrint(g,p.x,p.y,24,p.t,p.t===type?seed:seed+p.t+1)})}
    function tap(e){var q=o.at(e,c);opts.forEach(function(p,i){if(Math.abs(q[0]-p.x)<32&&Math.abs(q[1]-p.y)<32){if(i===right){g.strokeStyle="#22c55e";g.lineWidth=5;rr(g,p.x-30,p.y-30,60,60,10);g.stroke();o.msg(T.pz.found);o.good();setTimeout(o.done,500)}else{g.strokeStyle="#ef4444";g.lineWidth=4;rr(g,p.x-30,p.y-30,60,60,10);g.stroke();o.msg(T.pz.nope);o.bad()}}})}},
  /* 2 compositietekening: tik pet, shirt en schoenen tot ze gelijk zijn aan de boef van de getuige */
  face:function(o){var c=o.canvas(),g=c.getContext("2d"),r=o.rng,bodyA=Math.floor(r()*8),tgt={hoofd:Math.floor(r()*3),shirt:Math.floor(r()*3),voet:Math.floor(r()*3)},mine={hoofd:(tgt.hoofd+1)%3,shirt:(tgt.shirt+2)%3,voet:(tgt.voet+1)%3},okk=false;
    var rows=[["hoofd",0],["shirt",1],["voet",2]],draw=function(){g.fillStyle="#fef3c7";g.fillRect(0,0,280,280);
      g.fillStyle="#fff";rr(g,8,8,126,122,12);g.fill();rr(g,146,8,126,122,12);g.fill();g.strokeStyle="#fbbf24";g.lineWidth=3;rr(g,8,8,126,122,12);g.stroke();g.strokeStyle=okk?"#22c55e":"#94a3b8";rr(g,146,8,126,122,12);g.stroke();
      g.fillStyle="#92400e";g.font="700 11px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText("👁",71,22);g.fillText("✏️",209,22);
      fig(g,71,124,100,{tr:tgt,b:bodyA});fig(g,209,124,100,{tr:mine,b:bodyA});
      rows.forEach(function(rw,ri){var y=150+ri*44;for(var v=0;v<3;v++){var x=52+v*88;g.fillStyle=mine[rw[0]]===v?"#fde68a":"#fff";rr(g,x-40,y-18,80,38,8);g.fill();g.strokeStyle=mine[rw[0]]===v?"#f59e0b":"#cbd5e1";g.lineWidth=2;g.stroke();itemImg(g,rw[0],v,x,y+2,.55)}})};draw();
    c.addEventListener("pointerdown",function(e){if(okk)return;var q=o.at(e,c),ri=Math.floor((q[1]-132)/44),v=Math.floor((q[0]-8)/88);if(ri<0||ri>2||v<0||v>2)return;mine[rows[ri][0]]=v;beep(440+v*80,.08);draw();
      if(mine.hoofd===tgt.hoofd&&mine.shirt===tgt.shirt&&mine.voet===tgt.voet){okk=true;draw();o.msg(T.pz.faceOk);o.good();setTimeout(o.done,600)}})},
  /* 3 voetspoor: welke zool past bij de afdruk in de modder */
  shoe:function(o){var c=o.canvas(),g=c.getContext("2d"),r=o.rng,pat=Math.floor(r()*4),cols=["#e63946","#2a9d4b","#f4c20d","#2563eb"],order=shuffle([0,1,2,3],r),right=order.indexOf(pat),lock=false;
    var draw=function(mark){g.fillStyle="#bbf7d0";g.fillRect(0,0,280,280);g.fillStyle="#7c4a1e";g.beginPath();g.ellipse(140,78,120,60,0,0,7);g.fill();g.fillStyle="#5b3414";g.beginPath();g.ellipse(140,78,100,46,0,0,7);g.fill();
      drawSole(g,140,78,110,pat,"#3b1f0a","#8a5a2b");
      order.forEach(function(p,i){var x=38+i*68,y=210;g.fillStyle=mark&&mark.i===i?(mark.ok?"#bbf7d0":"#fecaca"):"#fff";rr(g,x-30,y-50,60,100,12);g.fill();g.strokeStyle=mark&&mark.i===i?(mark.ok?"#22c55e":"#ef4444"):"#94a3b8";g.lineWidth=3;g.stroke();drawSole(g,x,y,84,p,cols[p],"#fff")})};draw();
    c.addEventListener("pointerdown",function(e){if(lock)return;var q=o.at(e,c);if(q[1]<150)return;var i=Math.floor((q[0]-4)/68);if(i<0||i>3)return;var ok=i===right;draw({i:i,ok:ok});if(ok){lock=true;o.msg(T.pz.found);o.good();setTimeout(o.done,600)}else{o.msg(T.pz.nope);o.bad()}})},
  /* 4 sirene: vier lampen lichten op, natikken; rondes van 2, 3 en 4 */
  siren:function(o){var LC=["#ff3b3b","#4fd3ff","#ffb703","#ffffff"];o.box.innerHTML='<div class="siren"><i></i><i></i></div><div class="lans">'+[0,1,2,3].map(function(i){return'<button type="button" class="lan" data-i="'+i+'" style="--c:'+LC[i]+'" aria-label="'+(i+1)+'"></button>'}).join("")+'</div><p class="pzst" id="sqS"></p><button type="button" class="btn ghost sm dk" id="sqR">'+T.pz.again+'</button>';
    var Ls=$$("#pz .lan"),S=[0,1,2,3,4,5].map(function(){return Math.floor(o.rng()*4)}),st=$("#sqS"),pos=0,busy=true,len=2,later=function(fn,ms){mg.tm.push(setTimeout(fn,ms))};
    var lit=function(i,ms){Ls[i].classList.add("on");beep(330+i*110,.18);later(function(){Ls[i].classList.remove("on")},ms)};
    var play=function(){Ls.forEach(function(l){l.classList.remove("on")});busy=true;pos=0;st.textContent=T.pz.look;for(var k=0;k<len;k++)(function(k){later(function(){lit(S[k],420)},600+k*750)})(k);later(function(){busy=false;st.textContent=fill(T.pz.yours,{n:len})},600+len*750)};
    $("#sqR").onclick=play;
    o.box.addEventListener("click",function(e){var b=e.target.closest(".lan");if(!b||busy)return;var i=+b.dataset.i;lit(i,220);
      if(i!==S[pos]){st.textContent=T.pz.wrongSeq;o.bad();later(play,900);busy=true;return}
      pos++;if(pos>=len){len++;if(len>(HARD()?6:4)){o.good();st.textContent=T.pz.found;later(o.done,500);return}st.textContent=T.pz.good;later(play,900);busy=true}});
    later(play,400)},
  /* 5 verrekijker: boven gisteren, onder vandaag; drie verschillen aantikken in de onderste */
  diff:function(o){var c=o.canvas(300),g=c.getContext("2d"),r=o.rng,H=140,W=280;
    var S={sun:true,clouds:[{x:30+r()*60,y:20+r()*15},{x:150+r()*60,y:15+r()*20}],houses:[{x:20,w:60,h:50+r()*20,col:["#f4a261","#8ecae6","#f8edeb"][Math.floor(r()*3)],door:"#7c2d12",win:true},{x:110,w:70,h:60+r()*20,col:["#e76f51","#ffb703","#cdb4db"][Math.floor(r()*3)],door:"#1e3a8a",win:true},{x:210,w:55,h:45+r()*25,col:["#90be6d","#f9c74f","#f8edeb"][Math.floor(r()*3)],door:"#14532d",win:true}],
      tree:{x:95,apples:true},car:{x:40+r()*120,col:["#ef4444","#3b82f6","#eab308"][Math.floor(r()*3)]},flowers:[{x:20,col:"#f472b6"},{x:200,col:"#facc15"},{x:260,col:"#a78bfa"}],cat:{x:230},bird:{x:200+r()*50,y:40+r()*20},balloon:{x:60+r()*160,col:"#ff3b3b"}};
    var S2=JSON.parse(JSON.stringify(S)),cands=[
      function(){S2.car.col=S2.car.col==="#ef4444"?"#3b82f6":"#ef4444";return[S2.car.x+23,H*.84-14]},
      function(){S2.bird=null;return[S.bird.x,S.bird.y]},
      function(){S2.cat=null;return[S.cat.x+4,H*.78]},
      function(){var i=Math.floor(r()*3);S2.houses[i].door=S2.houses[i].door==="#7c2d12"?"#facc15":"#7c2d12";var h=S.houses[i];return[h.x+h.w*.5,H*.7-h.h*.2]},
      function(){S2.flowers[1].col="#60a5fa";return[S.flowers[1].x,H*.76]},
      function(){S2.tree.apples=false;return[S.tree.x,H*.48]},
      function(){S2.balloon=null;return[S.balloon.x,H*.62]},
      function(){S2.sun=false;return[W*.86,H*.2]},
      function(){var i=Math.floor(r()*3);S2.houses[i].win=false;var h=S.houses[i];return[h.x+h.w*.5,H*.7-h.h*.68]}];
    var ND=HARD()?5:3,pts=shuffle(cands,r).slice(0,ND).map(function(f){return{p:f(),hit:false}}),found=0;
    var draw=function(){g.save();drawScene(g,S,W,H);g.restore();g.save();g.translate(0,160);drawScene(g,S2,W,H);pts.forEach(function(d){if(d.hit){g.strokeStyle="#22c55e";g.lineWidth=4;g.beginPath();g.arc(d.p[0],d.p[1],22,0,7);g.stroke()}});g.restore();
      g.fillStyle="#1e3a8a";g.fillRect(0,140,W,20);g.fillStyle="#fff";g.font="700 12px 'Barlow Condensed',sans-serif";g.textAlign="left";g.fillText("↑ "+(L==="nl"?"GISTEREN":"YESTERDAY"),8,154);g.textAlign="right";g.fillText((L==="nl"?"VANDAAG":"TODAY")+" ↓",W-8,154)};draw();o.msg(fill(T.pz.diffLeft,{n:ND}));
    c.addEventListener("pointerdown",function(e){var q=o.at(e,c);if(q[1]<160)return;var y=q[1]-160,hit=false;pts.forEach(function(d){if(!d.hit&&Math.hypot(d.p[0]-q[0],d.p[1]-y)<30){d.hit=true;hit=true}});
      if(hit){found++;beep(660,.12);buzz(40);draw();o.msg(found>=ND?T.pz.found:fill(T.pz.diffLeft,{n:ND-found}));if(found>=ND){o.good();setTimeout(o.done,600)}}else beep(200,.08)})},
  /* 6 portofoon: drie kleuren horen en zien, dan natikken */
  radio:function(o){var r=o.rng,RC=["#ff3b3b","#2563eb","#ffc21a","#22c55e"],code=(HARD()?[1,2,3,4,5]:[1,2,3]).map(function(){return Math.floor(r()*4)}),later=function(fn,ms){mg.tm.push(setTimeout(fn,ms))};
    o.box.innerHTML='<canvas class="sq radio" width="280" height="150" style="aspect-ratio:280/150"></canvas><div class="keys col">'+[0,1,2,3].map(function(k){return '<button type="button" class="key" data-k="'+k+'" style="--c:'+RC[k]+'" aria-label="'+T.pz.cols[k]+'"></button>'}).join("")+'</div><p class="pzst" id="rdS"></p><button type="button" class="btn ghost sm dk" id="rdR">'+T.pz.replay+'</button>';
    var c=o.box.firstChild,g=c.getContext("2d"),st=$("#rdS"),typed=[],busy=true;
    var draw=function(big,noise){g.fillStyle="#0f172a";g.fillRect(0,0,280,150);g.fillStyle="#1e293b";rr(g,20,10,240,130,14);g.fill();g.fillStyle="#22c55e";g.beginPath();g.arc(40,30,5,0,7);g.fill();
      if(noise){g.strokeStyle="#4fd3ff";g.lineWidth=2;g.beginPath();for(var x=40;x<240;x+=4)g.lineTo(x,75+(Math.random()-.5)*40);g.stroke()}
      if(big!=null){g.fillStyle=RC[big];g.shadowColor=RC[big];g.shadowBlur=30;g.beginPath();g.arc(140,70,40,0,7);g.fill();g.shadowBlur=0}
      var x0=140-(code.length-1)*15;typed.forEach(function(k,i){g.fillStyle=RC[k];g.beginPath();g.arc(x0+i*30,128,9,0,7);g.fill()});for(var i=typed.length;i<code.length;i++){g.strokeStyle="#64748b";g.lineWidth=2;g.beginPath();g.arc(x0+i*30,128,9,0,7);g.stroke()}};
    var play=function(){busy=true;typed=[];st.textContent=T.pz.listen;draw(null,true);beep(900,.1);later(function(){beep(700,.1)},150);var t=700;
      code.forEach(function(d,i){later(function(){draw(d);beep(400+d*90,.25);buzz(30);var v=VOICE;VOICE=true;say(T.pz.cols[d]);VOICE=v},t+i*1300);later(function(){draw(null)},t+i*1300+1000)});
      later(function(){busy=false;draw(null);st.textContent=T.pz.typeIt},t+code.length*1300)};
    $("#rdR").onclick=function(){if(!busy)play()};
    o.box.addEventListener("click",function(e){var b=e.target.closest(".key");if(!b||busy)return;var k=+b.dataset.k;typed.push(k);beep(400+k*90,.1);draw(null);
      if(typed[typed.length-1]!==code[typed.length-1]){st.textContent=T.pz.wrongSeq;o.bad();busy=true;later(play,900);return}
      if(typed.length===code.length){st.textContent=T.pz.found;o.good();busy=true;later(o.done,500)}});
    later(play,500)},
  /* 7 achtervolging: met je vinger de politieauto door een doolhof van straatjes slepen */
  maze:function(o){var c=o.canvas(),g=c.getContext("2d"),r=o.rng,N=HARD()?9:7,S=280/N,cells=[],i;for(i=0;i<N*N;i++)cells.push(0);
    var vis=[],stack=[0];vis[0]=1;var DIRS=[[0,-1,1,4],[1,0,2,8],[0,1,4,1],[-1,0,8,2]];
    while(stack.length){var cur2=stack[stack.length-1],cx=cur2%N,cy=Math.floor(cur2/N),nb=shuffle(DIRS,r).filter(function(d){var nx=cx+d[0],ny=cy+d[1];return nx>=0&&ny>=0&&nx<N&&ny<N&&!vis[ny*N+nx]});
      if(!nb.length){stack.pop();continue}var d=nb[0],nx=cx+d[0],ny=cy+d[1];cells[cur2]|=d[2];cells[ny*N+nx]|=d[3];vis[ny*N+nx]=1;stack.push(ny*N+nx)}
    var pos=0,goal=N*N-1,trail=[0],fin=false,t0=0;
    var draw=function(ts){g.fillStyle="#1f8a4c";g.fillRect(0,0,280,280);
      for(i=0;i<N*N;i++){var x=(i%N)*S+S/2,y=Math.floor(i/N)*S+S/2;g.strokeStyle="#cbd5e1";g.lineWidth=S*.5;g.lineCap="round";g.beginPath();g.moveTo(x,y);g.lineTo(x,y);g.stroke();
        if(cells[i]&2){g.beginPath();g.moveTo(x,y);g.lineTo(x+S,y);g.stroke()}if(cells[i]&4){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+S);g.stroke()}}
      for(i=0;i<N*N;i++){x=(i%N)*S+S/2;y=Math.floor(i/N)*S+S/2;g.strokeStyle="#f8fafc";g.lineWidth=2;g.setLineDash([4,6]);if(cells[i]&2){g.beginPath();g.moveTo(x,y);g.lineTo(x+S,y);g.stroke()}if(cells[i]&4){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+S);g.stroke()}g.setLineDash([])}
      g.strokeStyle="rgba(255,194,26,.8)";g.lineWidth=5;g.lineJoin="round";g.beginPath();trail.forEach(function(k,j){var tx=(k%N)*S+S/2,ty=Math.floor(k/N)*S+S/2;j?g.lineTo(tx,ty):g.moveTo(tx,ty)});g.stroke();
      var gx=(goal%N)*S+S/2,gy=Math.floor(goal/N)*S+S/2;car(gx,gy,"#ef4444",false,ts);var px=(pos%N)*S+S/2,py=Math.floor(pos/N)*S+S/2;car(px,py,"#1d4ed8",true,ts)};
    var car=function(x,y,col,cop,ts){g.save();g.translate(x,y);var k2=S/40;g.scale(k2,k2);g.fillStyle=col;rr(g,-14,-9,28,18,5);g.fill();g.fillStyle="#bae6fd";rr(g,-7,-6,14,12,3);g.fill();g.fillStyle="#111";g.fillRect(-12,-12,6,4);g.fillRect(6,-12,6,4);g.fillRect(-12,8,6,4);g.fillRect(6,8,6,4);
      if(cop){var on=Math.floor((ts||0)/250)%2===0;g.fillStyle=on?"#ff3b3b":"#4fd3ff";g.shadowColor=g.fillStyle;g.shadowBlur=10;g.fillRect(-4,-4,8,8)}else{g.strokeStyle="#fff";g.lineWidth=1;[[-6,-26,"#ff3b3b"],[4,-30,"#ffc21a"],[12,-22,"#4fd3ff"]].forEach(function(b){g.beginPath();g.moveTo(0,-6);g.lineTo(b[0],b[1]+6);g.stroke();g.fillStyle=b[2];g.beginPath();g.ellipse(b[0],b[1],5,6,0,0,7);g.fill()})}g.restore()};
    var f=function(ts){if(fin||!c.isConnected)return;draw(ts);mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
    var mv=function(e){if(fin)return;var q=o.at(e,c),cx=Math.floor(q[0]/S),cy=Math.floor(q[1]/S);if(cx<0||cy<0||cx>=N||cy>=N)return;var k=cy*N+cx;if(k===pos)return;
      var px=pos%N,py=Math.floor(pos/N),dx=cx-px,dy=cy-py;if(Math.abs(dx)+Math.abs(dy)!==1)return;
      var open=(dx===1&&(cells[pos]&2))||(dx===-1&&(cells[pos]&8))||(dy===1&&(cells[pos]&4))||(dy===-1&&(cells[pos]&1));
      if(!open){beep(160,.06);return}pos=k;if(trail.length>1&&trail[trail.length-2]===k)trail.pop();else trail.push(k);beep(500+trail.length*10,.04);
      if(pos===goal){fin=true;draw(0);g.fillStyle="rgba(255,194,26,.9)";g.font="700 40px 'Barlow Condensed',sans-serif";g.textAlign="center";g.strokeStyle="#0d2a66";g.lineWidth=6;g.strokeText(T.pz.caught,140,150);g.fillText(T.pz.caught,140,150);o.msg(T.pz.caught);o.good();setTimeout(o.done,800)}};
    c.addEventListener("pointerdown",mv);c.addEventListener("pointermove",function(e){if(e.buttons||e.pointerType==="touch")mv(e)})},
  /* 8 zoek de boef: twintig boeven in de drukte, één met precies de pet en het shirt van het plaatje */
  crowd:function(o){var c=o.canvas(),g=c.getContext("2d"),r=o.rng,tgt={hoofd:Math.floor(r()*3),shirt:Math.floor(r()*3),voet:Math.floor(r()*3)},figs=[],i,lock=false,CO=HARD()?6:5,RO=HARD()?5:4,NF=CO*RO,FH=HARD()?40:46;
    for(i=0;i<NF;i++){var tr;do{tr={hoofd:Math.floor(r()*3),shirt:Math.floor(r()*3),voet:Math.floor(r()*3)}}while(tr.hoofd===tgt.hoofd&&tr.shirt===tgt.shirt);figs.push({x:30+(i%CO)*(230/(CO-1))+(r()-.5)*14,y:(HARD()?112:118)+Math.floor(i/CO)*(HARD()?42:52)+(r()-.5)*8,tr:tr,b:Math.floor(r()*8),ph:r()*6.3})}
    var w=Math.floor(r()*NF);figs[w].tr={hoofd:tgt.hoofd,shirt:tgt.shirt,voet:tgt.voet};
    var draw=function(ts){g.fillStyle="#fde68a";g.fillRect(0,0,280,280);g.fillStyle="#1e3a8a";g.fillRect(0,0,280,64);g.fillStyle="#fff";rr(g,6,6,52,52,8);g.fill();fig(g,32,58,50,{tr:tgt,b:0});
      g.fillStyle="#fff";g.font="700 13px 'Barlow Condensed',sans-serif";g.textAlign="left";g.fillText(D.AT.hoofd.s[tgt.hoofd],68,28);g.fillText(D.AT.shirt.s[tgt.shirt],68,48);
      figs.slice().sort(function(a,b){return a.y-b.y}).forEach(function(f){fig(g,f.x,f.y+Math.sin((ts||0)/400+f.ph)*2,FH,{tr:f.tr,b:f.b})})};
    var f=function(ts){if(lock||!c.isConnected)return;draw(ts);mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
    c.addEventListener("pointerdown",function(e){if(lock)return;var q=o.at(e,c),best=null,bd=28;figs.forEach(function(fg,i){var d=Math.hypot(fg.x-q[0],fg.y-FH/2-q[1]);if(d<bd){bd=d;best=i}});if(best==null)return;
      if(best===w){lock=true;draw(0);g.strokeStyle="#22c55e";g.lineWidth=5;g.beginPath();g.arc(figs[w].x,figs[w].y-FH/2,30,0,7);g.stroke();o.msg(T.pz.found);o.good();setTimeout(o.done,600)}else{g.strokeStyle="#ef4444";g.lineWidth=3;g.beginPath();g.arc(figs[best].x,figs[best].y-FH/2,28,0,7);g.stroke();o.msg(T.pz.nope);o.bad()}})},
  /* 9 kenteken: de vluchtauto rijdt voorbij (kleur + kenteken), daarna de goede auto terugzoeken. Rechercheur: korter zien, langer kenteken, alle auto's dezelfde kleur */
  plate:function(o){var r=o.rng,H=HARD(),CC=["#e63946","#2563eb","#f4c20d","#2a9d4b","#f1f5f9"],LET="BDFGHJKLNPRSTXZ",DIG="23456789",later=function(fn,ms){mg.tm.push(setTimeout(fn,ms))};
    var rl=function(){return LET[Math.floor(r()*LET.length)]},rd=function(){return DIG[Math.floor(r()*DIG.length)]};
    var mk=function(){return H?rl()+rl()+"-"+rd()+rd()+"-"+rl():rl()+"-"+rd()+"-"+rl()};
    var mut=function(p){var a=p.split(""),idx=[];a.forEach(function(ch,k){if(ch!=="-")idx.push(k)});var k=idx[Math.floor(r()*idx.length)],src=/\d/.test(a[k])?DIG:LET,nc;do{nc=src[Math.floor(r()*src.length)]}while(nc===a[k]);a[k]=nc;return a.join("")};
    var col=Math.floor(r()*5),plate=mk(),opts=[{c:col,p:plate,ok:1}];
    if(!H){opts.push({c:(col+1+Math.floor(r()*4))%5,p:plate});var p2;do{p2=mk()}while(p2===plate);opts.push({c:col,p:p2})}
    else{var guard=0;while(opts.length<4&&guard++<50){var p3=mut(plate);if(!opts.some(function(x){return x.p===p3}))opts.push({c:col,p:p3})}}
    opts=shuffle(opts,r);var right=opts.findIndex(function(x){return x.ok}),busy=true,lock=false;
    /* auto van achteren: (cx,cy) = midden onderkant, s = breedte */
    var car=function(g,cx,cy,s,ci,p){var k=s/200;g.save();g.translate(cx,cy);g.scale(k,k);
      g.fillStyle="rgba(0,0,0,.25)";g.beginPath();g.ellipse(0,0,110,12,0,0,7);g.fill();
      g.fillStyle="#111";rr(g,-92,-36,36,36,8);g.fill();rr(g,56,-36,36,36,8);g.fill();
      g.fillStyle=CC[ci];g.strokeStyle="rgba(0,0,0,.35)";g.lineWidth=3;rr(g,-100,-120,200,90,22);g.fill();g.stroke();rr(g,-72,-170,144,60,18);g.fill();g.stroke();
      g.fillStyle="#bae6fd";rr(g,-60,-160,120,42,10);g.fill();
      g.fillStyle="#ef4444";rr(g,-94,-106,30,16,5);g.fill();rr(g,64,-106,30,16,5);g.fill();
      g.fillStyle="#334155";rr(g,-104,-46,208,18,8);g.fill();
      g.fillStyle="#ffd400";rr(g,-62,-92,124,36,6);g.fill();g.strokeStyle="#111";g.lineWidth=3;g.stroke();g.fillStyle="#1d4ed8";rr(g,-62,-92,16,36,6);g.fill();
      g.fillStyle="#111";g.textAlign="center";g.textBaseline="middle";var fs=30;g.font="700 "+fs+"px 'Barlow Condensed','Arial Narrow',sans-serif";while(g.measureText(p).width>98&&fs>14){fs-=2;g.font="700 "+fs+"px 'Barlow Condensed','Arial Narrow',sans-serif"}g.fillText(p,8,-73);g.restore()};
    o.box.innerHTML='<canvas class="sq plc" width="280" height="200" style="aspect-ratio:280/200"></canvas><p class="pzst" id="plS"></p><div class="plopts" id="plO" hidden>'+opts.map(function(x,k){return '<button type="button" data-k="'+k+'"><canvas width="140" height="110"></canvas></button>'}).join("")+'</div><button type="button" class="btn ghost sm dk" id="plA">'+T.pz.plAgain+'</button>';
    var c=o.box.querySelector(".plc"),g=c.getContext("2d"),st=$("#plS"),ob=$("#plO");
    $$("#plO canvas").forEach(function(cv,k){var gg=cv.getContext("2d");gg.fillStyle="#cbd5e1";gg.fillRect(0,0,140,110);gg.fillStyle="#94a3b8";gg.fillRect(0,92,140,18);car(gg,70,102,124,opts[k].c,opts[k].p)});
    var street=function(){var sky=g.createLinearGradient(0,0,0,200);sky.addColorStop(0,"#60a5fa");sky.addColorStop(1,"#bfdbfe");g.fillStyle=sky;g.fillRect(0,0,280,200);g.fillStyle="#475569";g.beginPath();g.moveTo(110,90);g.lineTo(170,90);g.lineTo(280,200);g.lineTo(0,200);g.closePath();g.fill();g.fillStyle="#ffc21a";for(var y=96;y<200;y+=22)g.fillRect(138-(y-90)*.03,y,4+(y-90)*.06,10)};
    var look=function(){busy=true;ob.hidden=true;st.textContent=T.pz.plLook;var t0=0,hold=H?2200:4200;
      if(!H){say(fill(T.pz.plSay,{c:T.pz.plCols[col],p:plate.split("").filter(function(x){return x!=="-"}).join(" ")}))}
      var f=function(ts){if(!c.isConnected)return;if(!t0)t0=ts;var t=(ts-t0)/1000,e=Math.min(1,t/1.1),s=60+e*200;street();car(g,140,110+e*80,s,col,plate);
        if(t*1000<1100+hold)mg.raf=requestAnimationFrame(f);else{street();g.fillStyle="rgba(15,23,42,.55)";g.fillRect(0,0,280,200);g.fillStyle="#fff";g.font="700 54px 'Barlow Condensed',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText("?",140,100);ob.hidden=false;busy=false;st.textContent=T.pz.plPick;say(T.pz.plPick)}};
      mg.raf=requestAnimationFrame(f)};
    $("#plA").onclick=function(){if(!busy&&!lock){mg.stop();look()}};
    var pick=function(k){if(busy||lock)return;var b=ob.children[k];if(k===right){lock=true;b.classList.add("ok");st.textContent=T.pz.found;o.good();later(o.done,700)}else{b.classList.add("no");setTimeout(function(){b.classList.remove("no")},700);st.textContent=T.pz.nope;o.bad()}};
    ob.onclick=function(e){var b=e.target.closest("button");if(b)pick(+b.dataset.k)};
    o.solve=function(){busy=false;pick(right)};
    later(look,300)},
  /* 10 bewijszakken: elk bewijsstuk in de goede zak. Junior: op kleur. Rechercheur: op soort (kleren, gereedschap, snoep), de kleur is afleiding */
  bag:function(o){var r=o.rng,H=HARD(),BC=["#e63946","#2563eb","#f4c20d"],BL=["#ffd3d8","#dbeafe","#fff0b3"],CATS=[["🧢","👕","🧦","👟","🧤","🎩"],["🔧","🔩","🪛","🔨","🧲","🔑"],["🍬","🍭","🍪","🍩","🧁","🍫"]],n=H?8:6,items=[],i;
    for(i=0;i<n;i++){var cat=i%3,cc=H?Math.floor(r()*3):i%3;items.push({e:CATS[H?cat:Math.floor(r()*3)][Math.floor(r()*6)],c:cc,key:H?cat:cc})}
    items=shuffle(items,r);var at=0,lock=false;
    o.box.innerHTML='<div class="bagit" id="bgI"></div><p class="pzst" id="bgS"></p><div class="bags">'+[0,1,2].map(function(k){return '<button type="button" class="bagb" data-k="'+k+'" style="--c:'+(H?"#a16207":BC[k])+'" aria-label="'+esc(H?T.pz.bagCat[k]:T.pz.cols[k])+'"><span>'+(H?CATS[k][0]:"")+'</span></button>'}).join("")+'</div>';
    var it=$("#bgI"),st=$("#bgS");
    var showIt=function(){var x=items[at];it.className="bagit";it.style.setProperty("--b",BL[x.c]);it.style.setProperty("--c",BC[x.c]);it.innerHTML='<span>'+x.e+'</span>';void it.offsetWidth;it.classList.add("pop");st.textContent=fill(T.pz.bagLeft,{n:n-at})};
    var put=function(k){if(lock)return;var x=items[at],b=o.box.querySelector('.bagb[data-k="'+k+'"]');
      if(k===x.key){beep(500+at*60,.1);buzz(30);b.classList.add("gulp");setTimeout(function(){b.classList.remove("gulp")},400);it.classList.add("fly");it.style.setProperty("--dx",(k-1)*110+"px");at++;
        if(at>=n){lock=true;st.textContent=T.pz.found;o.good();mg.tm.push(setTimeout(o.done,700))}else mg.tm.push(setTimeout(showIt,380))}
      else{b.classList.add("shake");setTimeout(function(){b.classList.remove("shake")},500);st.textContent=T.pz.bagNo;o.bad()}};
    o.box.querySelector(".bags").onclick=function(e){var b=e.target.closest(".bagb");if(b)put(+b.dataset.k)};
    o.solve=function(){var step=function(){if(lock)return;put(items[at].key);if(!lock)setTimeout(step,450)};step()};
    showIt()},
  /* 11 verhoor: de verdachte vertelt wat hij zag; klopt dat met de camerafoto? Junior: drie zinnen. Rechercheur: vijf, ook tellen */
  talk:function(o){var r=o.rng,H=HARD(),W=280,Hh=140,CARS=["#ef4444","#3b82f6","#eab308"],keys=H?["sun","cat","bird","apples","car","flowers","houses"]:["sun","cat","bird","apples","car"];
    var pickK=shuffle(keys,r).slice(0,H?5:3),truth=pickK.map(function(){return r()<.5});if(truth.every(Boolean))truth[0]=false;if(!truth.some(Boolean))truth[1]=true;
    var want=function(k){var j=pickK.indexOf(k);return j<0?(r()<.5):truth[j]};
    var ci=Math.floor(r()*3),nf=2+Math.floor(r()*3),fx=[30,70,200,250],fcol=["#f472b6","#facc15","#a78bfa","#fb923c"];
    var S={sun:want("sun"),clouds:[{x:30+r()*60,y:20+r()*15},{x:150+r()*60,y:15+r()*20}],houses:[{x:20,w:60,h:55,col:"#f4a261",door:"#7c2d12",win:true},{x:110,w:70,h:66,col:"#8ecae6",door:"#1e3a8a",win:true},{x:210,w:55,h:50,col:"#90be6d",door:"#14532d",win:true}],
      tree:{x:95,apples:want("apples")},car:{x:40+r()*120,col:CARS[ci]},flowers:fx.slice(0,nf).map(function(x,k){return{x:x,col:fcol[k]}}),cat:want("cat")?{x:230}:null,bird:want("bird")?{x:200+r()*50,y:40+r()*20}:null};
    var lines=pickK.map(function(k,j){var t=truth[j],tx;
      if(k==="car")tx=fill(D.TALK.car,{c:D.CARC[t?ci:(ci+1+Math.floor(r()*2))%3]});
      else if(k==="flowers")tx=fill(D.TALK.flowers,{n:t?nf:nf+(r()<.5&&nf>2?-1:1)});
      else if(k==="houses")tx=fill(D.TALK.houses,{n:t?3:(r()<.5?2:4)});
      else tx=D.TALK[k];return{t:tx,ok:t}});
    var sus=G.c.sus[Math.floor(r()*NS)],av='<span class="avatar boefav" style="background-image:url('+figURL(sus.tr,120,{b:boefIdx(sus.name)})+')"></span>';
    o.box.innerHTML='<canvas class="sq" width="280" height="160" style="aspect-ratio:280/160"></canvas><div id="tkB" class="tkb"></div><div class="yn"><button type="button" class="btn" data-a="1">👍 '+esc(T.pz.tYes)+'</button><button type="button" class="btn red" data-a="0">👎 '+esc(T.pz.tNo)+'</button></div><p class="pzst" id="tkS"></p>';
    var c=o.box.firstChild,g=c.getContext("2d"),at=0,lock=false,wait=false,st=$("#tkS");
    g.save();drawScene(g,S,W,Hh);g.restore();g.fillStyle="#0f172a";g.fillRect(0,140,280,20);g.fillStyle="#ef4444";g.beginPath();g.arc(12,150,4,0,7);g.fill();g.fillStyle="#fff";g.font="700 12px 'Barlow Condensed',sans-serif";g.textAlign="left";g.fillText(T.pz.tPhoto+" · REC",22,154);
    var show=function(){var x=lines[at];$("#tkB").innerHTML=bubble(x.t,sus.name+" · "+(at+1)+"/"+lines.length,"",av);st.textContent="";say(x.t)};
    var ans=function(a){if(lock||wait)return;var x=lines[at];if(a===x.ok){o.good();st.textContent=x.ok?T.pz.tTrue:T.pz.tLie;wait=true;at++;
        if(at>=lines.length){lock=true;mg.tm.push(setTimeout(o.done,800))}else mg.tm.push(setTimeout(function(){wait=false;show()},1000))}
      else{o.bad();st.textContent=T.pz.tWrong;say(T.pz.tWrong)}};
    o.box.querySelector(".yn").onclick=function(e){var b=e.target.closest("button");if(b)ans(b.dataset.a==="1")};
    o.solve=function(){var step=function(){if(lock)return;wait=false;ans(lines[at].ok);setTimeout(step,1100)};step()};
    show()},
  /* 12 kaartlezen: de chef geeft de route via de portofoon (pijlen + voorlezen); tik het vakje waar de auto uitkomt */
  mapr:function(o){var r=o.rng,H=HARD(),N=H?6:5,S=280/N,nl=H?3+Math.floor(r()*2):2,maxS=H?3:2,DX=[[0,-1],[1,0],[0,1],[-1,0]],path,legs,sx,sy,ex,ey;
    for(var tries=0;tries<200;tries++){sx=Math.floor(r()*N);sy=Math.floor(r()*N);var x=sx,y=sy,prev=-1,okp=true;legs=[];path=[[x,y]];
      for(var l=0;l<nl;l++){var opts2=[0,1,2,3].filter(function(d){return d!==prev&&(prev<0||d!==(prev+2)%4)});var d=opts2[Math.floor(r()*opts2.length)],n=1+Math.floor(r()*maxS),nx=x+DX[d][0]*n,ny=y+DX[d][1]*n;
        if(nx<0||ny<0||nx>=N||ny>=N){okp=false;break}for(var k=1;k<=n;k++)path.push([x+DX[d][0]*k,y+DX[d][1]*k]);x=nx;y=ny;legs.push([d,n]);prev=d}
      if(okp&&!(x===sx&&y===sy)){ex=x;ey=y;break}}
    if(ex==null){sx=0;sy=0;ex=2;ey=1;legs=[[1,2],[2,1]];path=[[0,0],[1,0],[2,0],[2,1]]}
    var deco=[];for(var i=0;i<N*N;i++)deco.push(Math.floor(r()*4));
    o.box.innerHTML='<div class="arrows">'+legs.map(function(lg){var s="";for(var k=0;k<lg[1];k++)s+='<i class="ar d'+lg[0]+'">➜</i>';return '<span>'+s+'</span>'}).join("")+'</div><canvas class="sq" width="280" height="280"></canvas><p class="pzst" id="mpS"></p><button type="button" class="btn ghost sm dk" id="mpR">'+T.pz.replay+'</button>';
    var c=o.box.querySelector("canvas"),g=c.getContext("2d"),lock=false,st=$("#mpS"),bads=[];
    var spoken=function(){return legs.map(function(lg){return T.pz.mN[lg[1]]+" "+T.pz.mDirs[lg[0]]}).join(", ")};
    var draw=function(showPath){g.fillStyle="#1f8a4c";g.fillRect(0,0,280,280);
      for(var i=0;i<N*N;i++){var cx=(i%N)*S,cy=Math.floor(i/N)*S;g.fillStyle="#2f9e5a";rr(g,cx+4,cy+4,S-8,S-8,6);g.fill();var dd=deco[i],m=S/2;
        if(dd===0){g.fillStyle="#f4a261";g.fillRect(cx+m-S*.2,cy+m-S*.08,S*.4,S*.3);g.fillStyle="#7f1d1d";g.beginPath();g.moveTo(cx+m-S*.25,cy+m-S*.08);g.lineTo(cx+m,cy+m-S*.3);g.lineTo(cx+m+S*.25,cy+m-S*.08);g.fill()}
        else if(dd===1){g.fillStyle="#14532d";g.beginPath();g.arc(cx+m,cy+m,S*.2,0,7);g.fill()}
        else if(dd===2){g.fillStyle="#8ecae6";g.fillRect(cx+m-S*.18,cy+m-S*.2,S*.36,S*.4);g.fillStyle="#1e3a8a";g.fillRect(cx+m-S*.05,cy+m+S*.02,S*.1,S*.18)}}
      g.strokeStyle="#cbd5e1";g.lineWidth=4;for(i=0;i<=N;i++){g.beginPath();g.moveTo(i*S,0);g.lineTo(i*S,280);g.stroke();g.beginPath();g.moveTo(0,i*S);g.lineTo(280,i*S);g.stroke()}
      bads.forEach(function(b){g.strokeStyle="#ef4444";g.lineWidth=4;var x0=b[0]*S+S*.25,y0=b[1]*S+S*.25;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+S*.5,y0+S*.5);g.moveTo(x0+S*.5,y0);g.lineTo(x0,y0+S*.5);g.stroke()});
      if(showPath){g.strokeStyle="#ffc21a";g.lineWidth=6;g.lineJoin="round";g.beginPath();path.forEach(function(p,k){var X=p[0]*S+S/2,Y=p[1]*S+S/2;k?g.lineTo(X,Y):g.moveTo(X,Y)});g.stroke();
        g.strokeStyle="#22c55e";g.lineWidth=5;g.beginPath();g.arc(ex*S+S/2,ey*S+S/2,S*.42,0,7);g.stroke();imgAt(g,"boef-sneak",ex*S+S/2,ey*S+S*.92,S*.85)}
      /* politieauto op de start */var X=sx*S+S/2,Y=sy*S+S/2;g.fillStyle="#fff";rr(g,X-S*.32,Y-S*.2,S*.64,S*.4,6);g.fill();g.fillStyle="#1d4ed8";g.fillRect(X-S*.32,Y-S*.02,S*.64,S*.08);g.fillStyle="#ff3b3b";g.fillRect(X-S*.12,Y-S*.28,S*.1,S*.08);g.fillStyle="#4fd3ff";g.fillRect(X+S*.02,Y-S*.28,S*.1,S*.08)};
    draw(false);st.textContent=T.pz.mGo;
    var hear=function(){var v=VOICE;VOICE=true;say(spoken());VOICE=v};$("#mpR").onclick=hear;
    var tap=function(cx,cy){if(lock)return;if(cx===ex&&cy===ey){lock=true;draw(true);st.textContent=T.pz.found;o.good();mg.tm.push(setTimeout(o.done,900))}else{bads.push([cx,cy]);draw(false);st.textContent=T.pz.nope;o.bad()}};
    c.addEventListener("pointerdown",function(e){var q=o.at(e,c),cx=Math.floor(q[0]/S),cy=Math.floor(q[1]/S);if(cx<0||cy<0||cx>=N||cy>=N)return;tap(cx,cy)});
    o.solve=function(){tap(ex,ey)};
    mg.tm.push(setTimeout(hear,1600))},
  /* 13 codeslot: tel de bolletjes in elk raampje en zet de wieltjes goed. Junior: twee wieltjes, 1–5. Rechercheur: drie wieltjes, alleen de rode tellen */
  lock:function(o){var r=o.rng,H=HARD(),nw=H?3:2,cnt=[],val=[],lock=false,i;
    for(i=0;i<nw;i++){cnt.push(H?2+Math.floor(r()*6):1+Math.floor(r()*5));val.push(0)}
    var dots=cnt.map(function(c){var a=[];for(var k=0;k<c;k++)a.push(H?"#ef4444":"#ffc21a");if(H){var d=1+Math.floor(r()*3);for(k=0;k<d;k++)a.push("#3b82f6")}return shuffle(a,r)});
    var html=function(){return '<div class="padlock'+(lock?" open":"")+'"><i class="shackle"></i><div class="lbody"><div class="lwins">'+cnt.map(function(c,k){return '<div class="lwin"><div class="dots">'+dots[k].map(function(col){return '<i style="background:'+col+'"></i>'}).join("")+'</div><div class="lwheel"><button type="button" data-k="'+k+'" data-d="1" aria-label="+">▲</button><b>'+val[k]+'</b><button type="button" data-k="'+k+'" data-d="-1" aria-label="−">▼</button></div></div>'}).join("")+'</div></div></div><button type="button" class="btn" id="lkGo">'+esc(T.pz.lOpen)+'</button><p class="pzst" id="lkS"></p>'};
    var paint=function(m){o.box.innerHTML=html();if(m)$("#lkS").textContent=m};paint();
    var openIt=function(){if(lock)return;if(val.join(",")===cnt.join(",")){lock=true;paint(T.pz.lOk);o.good();beep(880,.2);mg.tm.push(setTimeout(o.done,900))}else{o.bad();paint(T.pz.lBad);var p=o.box.querySelector(".padlock");p.classList.add("shake")}};
    o.box.onclick=function(e){var b=e.target.closest("button");if(!b||lock)return;if(b.id==="lkGo")return openIt();var k=+b.dataset.k;val[k]=(val[k]+ +b.dataset.d+10)%10;beep(420+val[k]*30,.05);paint()};
    o.solve=function(){val=cnt.slice();paint();openIt()}}
};

/* ---------- speurboekje, boeven, menu ---------- */
function noteSheet(){var ev=[],cl=[];G.c.slots.forEach(function(s,i){if(!G.ph[i])return;
    if(s.kind==="ev")ev.push('<div class="clue ev"><canvas class="evmini" data-k="'+s.k+'" data-v="'+s.v+'" width="60" height="60"></canvas><div><em>'+esc(D.AT[s.k].s[s.v])+'</em><p>'+esc(s.t)+'</p></div></div>');
    else if(s.kind==="claim"){var w=G.c.claims[s.w];cl.push('<div class="clue">'+witAv(w.who)+'<div><em>'+esc(w.who)+'</em><p>'+esc(claimText(w))+'</p></div></div>')}});
  sheet('<h2>'+T.notebook+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+'<div class="eyebrow">'+esc(T.nbG)+'</div><div class="coins nb">'+coinsHTML()+'</div>'+(ev.length||cl.length?'<div class="eyebrow">'+T.nbE+'</div><div class="list">'+(ev.join("")||'<p class="note">–</p>')+'</div><div class="eyebrow">'+T.nbW+'</div><div class="list">'+(cl.join("")||'<p class="note">–</p>')+'</div>':'<p class="note">'+T.nbNone+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  $$("#sheetBody .evmini").forEach(function(cv){var g=cv.getContext("2d");g.fillStyle="#ffe9a8";g.beginPath();g.arc(30,30,28,0,7);g.fill();itemImg(g,cv.dataset.k,+cv.dataset.v,30,30,.75)});
  MW.bindCodeBox($("#sheetBody"),L);$("#shX").onclick=closeSheet}
function susSheet(){sheet('<h2>'+T.people+'</h2><p class="note">'+T.peopleT+'</p><div class="list">'+G.c.sus.map(susCard).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function menuSheet(){var onMap=G&&(G.mode==="map"||G.mode==="in");sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button>'+(onMap?'<button type="button" class="btn ghost dk" id="mNoMap">'+T.kv.mNoMap+'</button>':'')+'<button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mNoMap"){closeSheet();dropMap()}else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- de twist: de dief heeft de handboeien in de bewijskast opgesloten; open hem met de gouden cijfers ---------- */
function toFinale(){if(!G)return;if(done()<NN())return noteSheet();if(G.vault)return accuseSheet();twistSheet()}
function twistSheet(){$$(".taunt").forEach(function(x){x.remove()});var hard=HARD(),t=D.TWIST+(hard?" "+D.TWIST8:"");buzz([60,40,60,40,200]);beep(900,.08);setTimeout(function(){beep(700,.1)},130);
  sheet('<div class="eyebrow">📻 '+esc(T.twistH)+'</div><div class="twistpic"><img src="'+IMGROOT+'chef-worried.webp?v=3" alt="" class="tw1"><img src="'+IMGROOT+'boef-sneak.webp?v=3" alt="" class="tw2"></div>'+bubble(t,D.CHEF,"big")+
    '<div class="msg boefmsg"><span class="avatar boefav" style="background-image:url('+IMGROOT+'boef-sneak.webp?v=3)"></span><div class="bub"><button type="button" class="spk" aria-label="'+esc(T.listen)+'" data-say="'+esc(D.TWISTB)+'">🔊</button><em>'+esc(cap(D.V))+'</em><p>'+esc(D.TWISTB)+'</p></div></div>'+
    '<button type="button" class="btn red" id="twGo">'+esc(T.twistGo)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  say(t+" "+D.TWISTB);$("#shX").onclick=closeSheet;$("#twGo").onclick=vaultSheet}
function vaultSheet(){var dg=G.c.digits,N=dg.length,hard=HARD(),order=[],k;for(k=0;k<N;k++)order.push(hard?N-1-k:k);var pos=0,fin=false,hiT=0;
  sheet('<div class="eyebrow">🔒 '+esc(T.vH)+'</div><div class="vault" id="vault"><div class="vin"><img src="'+IMGROOT+'icon-cuffs.webp?v=3" alt=""><b>'+esc(T.vIn)+'</b></div>'+
    '<div class="vdoor"><div class="vtop"><i class="vled" id="vLed"></i><span>'+esc(T.vH)+'</span><i class="vbolt"></i></div><div class="vdisp" id="vDisp"></div>'+
    '<div class="vpad" id="vPad">'+[1,2,3,4,5,6,7,8,9].map(function(d){return '<button type="button" data-d="'+d+'">'+d+'</button>'}).join("")+'</div></div></div>'+
    '<div class="vgold'+(hard?" rev":"")+'"><b>'+esc(T.goldBar)+(hard?" ⟲":"")+'</b><div class="coins" id="vCoins"></div></div>'+
    '<p class="pzst" id="vMsg">'+esc(hard?T.vTT:T.vT)+'</p><button type="button" class="btn ghost dk sm" id="vHint">'+esc(T.vHint)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  var msg=function(t){$("#vMsg").textContent=t};
  var paint=function(hi){var cs=$("#vCoins");cs.innerHTML=coinsHTML(hi);
    for(var j=0;j<pos;j++){var u=cs.querySelector('[data-i="'+order[j]+'"]');if(u)u.classList.add("used")}
    if(!hard&&!fin&&hi==null){var nx=cs.querySelector('[data-i="'+order[pos]+'"]');if(nx)nx.classList.add("next")}
    var s="";for(j=0;j<N;j++)s+='<i class="'+(j<pos?"on":"")+'">'+(j<pos?dg[order[j]]:"")+'</i>';$("#vDisp").innerHTML=s};
  paint();say(hard?T.vTT:T.vT);
  var open=function(){if(fin)return;fin=true;pos=N;paint();G.vault=1;save();$("#vLed").classList.add("ok");msg(T.vOk);beep(660,.15);setTimeout(function(){beep(880,.15)},150);setTimeout(function(){beep(1320,.35)},300);buzz([60,40,60,40,240]);
    setTimeout(function(){var v=$("#vault");if(!v)return;v.classList.add("open");say(T.vOk+" "+T.vIn);
      setTimeout(function(){var b=$("#vHint");if(!b)return;b.outerHTML='<button type="button" class="btn red" id="vGo">'+esc(T.vGo)+'</button>';$("#vGo").onclick=function(){closeSheet();accuseSheet()}},900)},500)};
  $("#vPad").onclick=function(e){var b=e.target.closest("button");if(!b||fin)return;var d=+b.dataset.d;b.classList.add("press");setTimeout(function(){b.classList.remove("press")},150);
    if(d===dg[order[pos]]){pos++;beep(500+pos*40,.08);buzz(20);paint();if(pos>=N)open();else msg(hard?T.vTT:T.vT)}
    else{var v=$("#vault");v.classList.remove("shake");void v.offsetWidth;v.classList.add("shake");buzz(140);beep(180,.25);if(hard){pos=0;G.oops=(G.oops||0)+1;save();msg(T.vBadT);say(T.vBadT)}else{msg(T.vBad);say(T.vBad)}paint()}};
  $("#vHint").onclick=function(){if(fin)return;G.hints=(G.hints||0)+1;save();paint(order[pos]);var key=$('#vPad [data-d="'+dg[order[pos]]+'"]');if(key){key.classList.add("glow");setTimeout(function(){key.classList.remove("glow")},1800)}msg(T.vHintT);say(T.vHintT);clearTimeout(hiT);hiT=setTimeout(function(){if(!fin&&$("#vCoins"))paint()},1800)};
  $("#shX").onclick=closeSheet;
  if(/debug/.test(location.search))window.AG_VAULT={code:function(){return order.map(function(j){return dg[j]})},open:open};
  if(window.MMP)MMP.helper(open,function(){say(hard?T.vTT:T.vT)})}

/* ---------- finale: zwaailicht, de dief in de boeien, alle borden vliegen terug op hun paal ---------- */
function finaleCine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,dpr,t0=0,fin=false,raf=0,N=NN(),spoken=-1;
  ov.hidden=false;ov.classList.add("fin");var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  var r=rngOf(G.seed^0xF1A1),bld=[],x=-20;while(x<w+60){var bw=40+r()*60,bh=60+r()*130;bld.push({x:x,w:bw,h:bh,c:["#f4a261","#e76f51","#8ecae6","#ffb703","#90be6d","#f8edeb"][Math.floor(r()*6)]});x+=bw+6+r()*10}
  var conf=[];for(var i=0;i<70;i++)conf.push({x:r(),v:.5+r(),s:4+r()*5,c:COL[i%4],a:r()*6.3});
  var sw=Math.min(96,(w-20)/Math.ceil(N/2)*.92),signs=[];for(i=0;i<N;i++){var row=i%2,col=Math.floor(i/2),cols=Math.ceil(N/2);signs.push({x:(col+.5+(row?.25:-.25))*(w/cols),row:row,d:1.9+i*.22,sx:r()*w,rot:(r()-.5)*3})}
  var end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;ov.classList.remove("fin");txt.textContent="";then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  for(i=0;i<4;i++)setTimeout(function(k){if(!fin)beep(k%2?660:880,.22)},i*320,i);
  var k=G.c.sus[G.c.K],f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?7:t;
    g.setTransform(dpr,0,0,dpr,0,0);var sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#1d4ed8");sky.addColorStop(.7,"#60a5fa");sky.addColorStop(1,"#fde68a");g.fillStyle=sky;g.fillRect(0,0,w,h);
    var base=h*.8;bld.forEach(function(b){g.fillStyle=b.c;g.fillRect(b.x,base-b.h-h*.12,b.w,b.h+h*.12);g.fillStyle="rgba(30,58,138,.8)";for(var yy=base-b.h-h*.12+10;yy<base-20;yy+=20)for(var xx=b.x+7;xx<b.x+b.w-10;xx+=14)g.fillRect(xx,yy,7,9)});
    g.fillStyle="#334155";g.fillRect(0,base,w,h-base);g.fillStyle="#ffc21a";for(i=0;i<w;i+=44)g.fillRect(i,base+24,22,5);
    /* palen met borden: twee rijen, de borden vliegen er één voor één op */
    signs.forEach(function(s,i){var py=s.row?base-h*.1:base-h*.02,ph2=py-h*.17*(s.row?.85:1),sc=s.row?.8:1,ww=sw*sc;g.fillStyle="#64748b";g.fillRect(s.x-2,ph2,4,py-ph2);
      if(ph>s.d){var e=Math.min(1,(ph-s.d)/.5),ee=1-Math.pow(1-e,3),yy=-60+(ph2-(-60))*ee,xx=s.sx+(s.x-s.sx)*ee;g.save();g.translate(xx,yy);g.rotate(s.rot*(1-ee));drawSign(g,0,0,ww,G.signs[i]||"",i+1,e>=1?12:0);g.restore();if(e>=1&&!s.ding){s.ding=1;beep(700+i*40,.06)}}});
    /* de politieauto rijdt binnen */var cx=Math.min(w*.3,-200+ph/1.4*(w*.3+200));if(!imgAt(g,"car",cx,base+16,Math.min(110,h*.15)))drawFig(g,cx,base,80,{cop:true});
    /* de dief: handen omhoog, handboeien klikken */if(ph>.7){var bx=w*.72,al=Math.min(1,(ph-.7)/.4);if(!imgAt(g,"boef-caught",bx,base+8,Math.min(190,h*.26),al))fig(g,bx,base+8,Math.min(160,h*.22),{tr:k.tr,b:boefIdx(k.name),al:al});
      if(ph>1.5){var cs=Math.min(1,(ph-1.5)/.3);imgAt(g,"icon-cuffs",bx,base-Math.min(190,h*.26)*.42,Math.min(46,h*.06)*(2-cs),cs,false)}}
    /* de agentjes */if(ph>1.1)imgAt(g,"kids-row",w*.36,base+10,Math.min(120,h*.17),Math.min(1,(ph-1.1)/.5));
    /* zwaailicht */if(ph<4.5){var on=Math.floor(ph*5)%2===0;g.fillStyle=on?"rgba(255,59,59,.22)":"rgba(79,211,255,.22)";g.fillRect(0,0,w,h)}
    /* stempel */if(ph>4.6){var ss=Math.max(1,3-(ph-4.6)*6),fs=Math.min(64,w*.13);g.save();g.translate(w/2,h*.3);g.rotate(-.12);g.scale(ss,ss);g.globalAlpha=Math.min(1,(ph-4.6)*4);g.strokeStyle="#e11d48";g.lineWidth=6;g.textAlign="center";g.textBaseline="middle";
      var tt=T.fin[3].replace(/!$/,""),tw;do{g.font="700 "+fs+"px 'Barlow Condensed','Arial Narrow',sans-serif";tw=g.measureText(tt).width;fs-=2}while(tw>w*.74&&fs>16);fs+=2;g.fillStyle="rgba(255,255,255,.88)";g.fillRect(-tw/2-18,-fs*.62,tw+36,fs*1.24);g.strokeRect(-tw/2-18,-fs*.62,tw+36,fs*1.24);g.fillStyle="#e11d48";g.fillText(tt,0,0);g.restore();if(!f.stamp){f.stamp=1;buzz([120,60,200]);beep(220,.2)}}
    if(ph>4.8&&!still)conf.forEach(function(c){var yy=((ph-4.8)*c.v*160)%(h+40)-20;g.fillStyle=c.c;g.save();g.translate(c.x*w+Math.sin(ph*2+c.a)*14,yy);g.rotate(ph*3+c.a);g.fillRect(-c.s/2,-c.s/4,c.s,c.s/2);g.restore()});
    var li=ph<1.5?0:ph<signs[0].d+.1?1:ph<4.6?2:3;txt.textContent=T.fin[li];if(li!==spoken){spoken=li;say(T.fin[li])}
    if(ph>8.2)return end();raf=requestAnimationFrame(f)};f.stamp=0;raf=requestAnimationFrame(f)}

/* ---------- fotoalbum: alle groepsfoto's met titel, zaakcode, tijd, sterren en teamkleur in één afbeelding ---------- */
function albumList(r){var a=[];if(r.team)a.push({u:r.team,t:T.teamH,e:"⭐"});(r.album||[]).forEach(function(x){if(x&&x.u)a.push(x)});if(r.arrest)a.push({u:r.arrest,t:T.arrestH,e:"🙌"});return a}
function drawAlbum(cv,r,cb){var list=albumList(r),n=Math.max(1,list.length),cols=n<=1?1:n<=4?2:3,W2=1080,P=40,pw=Math.floor((W2-P*(cols+1))/cols),phh=Math.round(pw*1.18),rows=Math.ceil(n/cols),top=330,H=top+rows*(phh+P)+230;
  cv.width=W2;cv.height=H;var g=cv.getContext("2d"),tc=r.tc||{};
  loadImgs(list.map(function(x){return x.u}),function(IMG){
    g.fillStyle="#15337a";g.fillRect(0,0,W2,H);var q=rngOf(r.seed+9);for(var i=0;i<140;i++){g.fillStyle=COL[i%4];g.globalAlpha=.35;g.beginPath();g.arc(q()*W2,q()*H,3+q()*4,0,7);g.fill()}g.globalAlpha=1;
    tape(g,0,W2);tape(g,H-22,W2);
    if(tc.col){g.fillStyle=tc.col;g.fillRect(0,22,W2,16);g.fillRect(0,H-38,W2,16)}
    badgeDraw(g,120,150,74,NAME||(L==="nl"?"AGENT":"OFFICER"));
    g.textAlign="left";g.fillStyle="#ffc21a";g.font="700 66px 'Barlow Condensed','Arial Narrow',sans-serif";g.fillText(T.alTitle,220,120,W2-260);
    g.fillStyle="#fff";g.font="700 40px 'Barlow Condensed',sans-serif";g.fillText((L==="nl"?"AGENT VOOR EÉN DAG":"OFFICER FOR A DAY")+(NAME?" · "+NAME.toUpperCase():""),220,172,W2-260);
    g.font="600 30px 'Barlow Condensed',sans-serif";g.fillStyle="#bfd3ff";g.fillText(fill(T.alCase,{c:r.code}).toUpperCase()+"  ·  "+r.min+" MIN  ·  ",220,222);var sx=220+g.measureText(fill(T.alCase,{c:r.code}).toUpperCase()+"  ·  "+r.min+" MIN  ·  ").width;
    g.fillStyle="#ffc21a";g.font="700 38px 'Barlow',sans-serif";g.fillText("★".repeat(r.stars)+"☆".repeat(3-r.stars),sx,224);
    if(tc.name){var tl=fill(T.alTeam,{t:tc.name}).toUpperCase();g.font="700 28px 'Barlow Condensed',sans-serif";g.fillStyle=tc.col||"#1e3a8a";rr(g,220,246,g.measureText(tl).width+40,46,23);g.fill();g.fillStyle="#fff";g.fillText(tl,240,279)}
    var rq=rngOf(r.seed+21);
    if(!list.length)polaroid(g,null,(W2-pw)/2,top,pw,phh,T.teamH,-.02,"700 30px 'Permanent Marker',cursive");
    list.forEach(function(x,i){var c0=i%cols,r0=Math.floor(i/cols),inRow=Math.min(cols,list.length-r0*cols),off=(cols-inRow)*(pw+P)/2;polaroid(g,IMG[x.u],P+off+c0*(pw+P),top+r0*(phh+P),pw,phh,(x.e?x.e+" ":"")+(x.t.length>34?x.t.slice(0,33)+"…":x.t),(rq()-.5)*.07,"700 "+Math.round(pw*.07)+"px 'Permanent Marker',cursive")});
    var fy=H-190;fig(g,W2-150,fy+150,140,{tr:r.K.tr,b:r.Kb});g.save();g.translate(W2-150,fy+120);g.rotate(-.1);g.fillStyle="#ff3b3b";g.font="700 34px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText(L==="nl"?"GEPAKT":"CAUGHT",0,0);g.restore();
    g.textAlign="left";g.fillStyle="#fff";g.font="700 34px 'Barlow Condensed',sans-serif";g.fillText(r.K.name.toUpperCase(),P,fy+60,W2-340);
    g.fillStyle="#ffc21a";g.font="700 30px 'Barlow Condensed',sans-serif";g.fillText("🔒 "+(r.digits||[]).join(" "),P,fy+104,W2-340);
    g.fillStyle="#bfd3ff";g.font="600 24px 'Barlow Condensed',sans-serif";g.fillText(T.stripSub,P,fy+146);
    if(cb)cb()})}
function albumSheet(){if(!RES)return;var r=RES,fname=(L==="nl"?"fotoalbum-":"photo-album-")+r.code+".jpg";
  sheet('<div class="eyebrow">📷 '+esc(T.alH)+'</div><p>'+esc(T.alT)+'</p><canvas id="alb" width="1080" height="1350" class="stripc"></canvas><p class="note" id="alM">'+esc(T.alMade)+'</p><button type="button" class="btn" id="aSh">'+esc(T.alShare)+'</button><button type="button" class="btn ghost dk" id="aDl">'+esc(T.alDl)+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button>',true);
  var cv=$("#alb");drawAlbum(cv,r,function(){var m=$("#alM");if(m)m.textContent=""});
  var dl=function(){cv.toBlob(function(b){if(!b)return;var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=fname;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)},"image/jpeg",.88)};
  $("#aDl").onclick=dl;
  $("#aSh").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],fname,{type:"image/jpeg"});
    if(f&&navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],text:fill(T.shareTxt,{c:r.code,s:"★".repeat(r.stars),m:r.min})}).catch(function(){});else dl()},"image/jpeg",.88)};
  $("#dBack").onclick=function(){closeSheet();winBack()}}

/* ---------- de confrontatie: vijf boeven op een rij in 3D, tik op de dader ---------- */
function accuseSheet(){sheet('<h2>'+T.acH+'</h2><p>'+T.acT+'</p><button type="button" class="btn red" id="vGo">'+T.acGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  say(T.acT);$("#shX").onclick=closeSheet;$("#vGo").onclick=function(){closeSheet();lineup()}}
function lineup(){var ov=$("#hide"),room=$("#room"),c=G.c,K=c.K;
  var pos=[[0,"left:28%"],[0,"left:72%"],[1,"left:50%"],[2,"left:50%"],[3,"left:50%"]];
  var walls=[[],[],[],[]];c.sus.forEach(function(s,i){walls[pos[i][0]].push('<div class="obj boef" data-s="'+i+'" style="'+pos[i][1]+';bottom:6%"><img src="'+figURL(s.tr,230,{b:boefIdx(s.name)})+'" alt="">'+cuffsSVG()+'<span>'+esc(s.name)+'</span></div>')});
  room.innerHTML=walls.map(function(w,i){return '<div class="wall w'+i+'" style="background-image:url('+IMGROOT+'wall-'+i+'.webp?v=3)">'+w.join("")+'</div>'}).join("")+'<div class="floor"></div>';
  $("#hideHint").textContent=T.lineHint;$("#hideTip").textContent=T.lineTip;$("#hideMsg").textContent="";ov.hidden=false;say(T.lineHint);
  var rot=0,pd=null,fin=false,set=function(){room.style.transform="rotateY("+rot+"deg)"};set();
  ov.onpointerdown=function(e){pd={x:e.clientX,r:rot,moved:false}};ov.onpointermove=function(e){if(!pd)return;var dx=e.clientX-pd.x;if(Math.abs(dx)>6)pd.moved=true;rot=pd.r+dx*.35;set()};
  ov.onpointerup=function(e){if(!pd)return;var moved=pd.moved;pd=null;if(moved||fin)return;var o=e.target.closest(".obj");if(!o)return;G.tries++;save();
    if(+o.dataset.s===K){fin=true;o.classList.add("cuffed");buzz([100,50,300]);beep(660,.2);setTimeout(function(){beep(990,.4)},200);confetti();$("#hideMsg").textContent=T.cuffs;say(T.lineYes);setTimeout(function(){$("#hideMsg").textContent=T.lineYes},700);setTimeout(function(){finaleCine(confess)},1700)}
    else{o.classList.add("shake");setTimeout(function(){o.classList.remove("shake")},600);$("#hideMsg").textContent=T.lineNo;say(T.lineNo);buzz(120);beep(180,.2);setTimeout(function(){if(!fin)$("#hideMsg").textContent=""},2200)}};
  $("#hideX").onclick=function(){if(fin)return;ov.hidden=true;hush();if(G.mode==="map"||G.mode==="demo")chip();else render()}}
function confetti(){var ov=$("#hide");for(var i=0;i<40;i++){var s=document.createElement("i");s.className="cf";s.style.left=50+(Math.random()-.5)*60+"%";s.style.background=["#1d4ed8","#ffc21a","#fff","#4fd3ff"][i%4];s.style.animationDelay=Math.random()*.6+"s";s.style.setProperty("--dx",(Math.random()-.5)*200+"px");ov.appendChild(s);setTimeout(function(x){x.remove()},2600,s)}}
function confess(){var c=G.c,k=c.sus[c.K],w=c.claims[c.Li];G.tEnd=G.tEnd||Date.now();save();$("#hide").hidden=true;
  sheet('<div class="eyebrow">'+esc(T.confess)+'</div><div class="mirror"><img src="'+figURL(k.tr,200,{b:boefIdx(k.name)})+'" alt="" class="caught"><img src="'+IMGROOT+'boef-sorry.webp?v=3" alt="" class="sorry"><h2>'+esc(k.name)+'</h2></div>'+bubble(fill(D.END,vars()),k.name,"big",'<span class="avatar boefav" style="background-image:url('+figURL(k.tr,120,{b:boefIdx(k.name)})+')"></span>')+
    '<p class="note liar">'+esc(fill(T.liarWas,{W:w.who,w:claimText(w)}))+'</p><button type="button" class="btn" id="bPhoto">'+T.goOn+'</button>',true);
  say(fill(D.END,vars()));
  $("#bPhoto").onclick=function(){closeSheet();photoSheet("arrest",win)}}

/* ---------- gewonnen ---------- */
var RES=null,TEAM=LS.get("ss_ag_team","");
function win(){if(window.MMP&&MMP.hasTreasure()&&!G.trDone){G.trDone=1;G.tEnd=G.tEnd||Date.now();save();$("#hide").hidden=true;return MMP.finale(win)}var c=G.c,min=((G.tEnd||Date.now())-G.t0)/60000,s2=G.tries===1,s3=(G.oops||0)<=3,stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:c.sus[c.K].name,code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.ag.day=MW.today();MW.profile.save(p)}
  Wk.stopWatch();buzz([100,50,100,50,300]);
  var st=a.prof.streak,code=G.code;
  RES={ph:G.ph.slice(),team:G.team,arrest:G.arrest,album:(G.album||[]).slice(),digits:(G.c.digits||[]).slice(),tc:window.MMP?MMP.team():{},code:code,stars:stars,min:Math.round(min),v:vars(),slots:G.c.slots.slice(),K:c.sus[c.K],Kb:boefIdx(c.sus[c.K].name),seed:G.seed};
  sheet('<div class="eyebrow">'+T.won+' · '+esc(code)+'</div><div class="stars">'+"★".repeat(stars)+"☆".repeat(3-stars)+'</div><h2>'+esc(c.sus[c.K].name)+'</h2>'+
    '<canvas id="strip" width="1080" height="1350" class="stripc"></canvas>'+
    '<div class="tags"><i>'+Math.round(min)+' min</i></div>'+
    ''+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+T.missed2+'</p>':'')+
    '<button type="button" class="btn" id="vAlb">📷 '+T.alBtn+'</button><button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn" id="vPos">'+T.posBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#strip");drawStrip(cv,RES);
  $("#vDip").onclick=dipSheet;$("#vPos").onclick=posShow;$("#vAlb").onclick=albumSheet;
  var txt=fill(T.shareTxt,{c:code,s:"★".repeat(stars),m:Math.round(min)})+location.origin+location.pathname+"#z="+code;
  $("#vShare").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],"agent-"+code+".jpg",{type:"image/jpeg"});
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:txt}).catch(function(){})}
      else if(navigator.share){navigator.share({text:txt}).catch(function(){})}else{try{navigator.clipboard.writeText(txt);toast(T.copied)}catch(e){prompt("",txt)}}},"image/jpeg",.85)};
  $("#vDl").onclick=function(){var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.85);a.download="agent-"+code+".jpg";document.body.appendChild(a);a.click();a.remove()};
  $("#vHome").onclick=function(){closeSheet();endCase()};RES.secs=Math.round(((G.tEnd||Date.now())-G.t0)/1000);if(window.MMP)MMP.result($("#sheetBody"),{code:G.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function loadImgs(list,cb){var IMG={},left=list.filter(Boolean).length;if(!left)return cb(IMG);list.filter(Boolean).forEach(function(src){if(IMG[src]!==undefined){if(--left===0)cb(IMG);return}IMG[src]=null;var im=new Image();im.onload=im.onerror=function(){IMG[src]=im.width?im:null;if(--left===0)cb(IMG)};im.src=src})}
function polaroid(g,im,x,y,pw,phh,cap2,rot,font){var imgH=phh-pw*.34;g.save();g.translate(x+pw/2,y+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);
  g.shadowColor="rgba(0,0,0,.3)";g.shadowBlur=18;g.shadowOffsetY=8;g.fillStyle="#fff";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
  var pad=pw*.06,iw=pw-2*pad;if(im){var s=Math.max(iw/im.width,imgH/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();g.drawImage(im,pad+(iw-w)/2,pad+(imgH-h)/2,w,h);g.restore()}else{g.fillStyle="#dbeafe";g.fillRect(pad,pad,iw,imgH);if(!imgAt(g,"kids-row",pw/2,pad+imgH-8,imgH*.8))drawFig(g,pw/2,pad+imgH-8,imgH*.8,{cop:true})}
  g.fillStyle="#1e293b";g.font=font;g.textAlign="center";g.fillText(cap2,pw/2,phh-pw*.1,pw-20);g.restore()}
/* politierapport: ballonnen en foto's op blauw papier */
function drawStrip(cv,r){var g=cv.getContext("2d"),W2=cv.width,H=cv.height;
  loadImgs([r.team,r.arrest].concat(r.ph),function(IMG){
    g.fillStyle="#15337a";g.fillRect(0,0,W2,H);var q=rngOf(r.seed);for(var i=0;i<120;i++){g.fillStyle=COL[i%4];g.globalAlpha=.4;g.beginPath();g.arc(q()*W2,q()*H,3+q()*4,0,7);g.fill()}g.globalAlpha=1;
    g.fillStyle="#ffc21a";for(i=0;i<W2;i+=80)g.fillRect(i,0,40,14);for(i=40;i<W2;i+=80)g.fillRect(i,H-14,40,14);
    g.textAlign="center";g.fillStyle="#ffc21a";g.font="700 64px 'Barlow Condensed','Arial Narrow',sans-serif";g.fillText(L==="nl"?"AGENT VOOR EÉN DAG":"OFFICER FOR A DAY",W2/2,110);
    g.fillStyle="#fff";g.font="600 30px 'Barlow Condensed',sans-serif";g.fillText(fill(T.stripT,{c:r.code}).toUpperCase()+"   "+"★".repeat(r.stars)+"☆".repeat(3-r.stars)+"   "+r.min+" MIN",W2/2,160);
    var pw=400,phh=500;polaroid(g,IMG[r.team],80,210,pw,phh,T.teamH,-.03,"700 30px 'Permanent Marker',cursive");polaroid(g,IMG[r.arrest],W2-80-pw,230,pw,phh,T.arrestH,.03,"700 30px 'Permanent Marker',cursive");
    var top=800,nC=r.ph.length>8?6:4,cw=(W2-140)/nC,ts=cw-20;r.ph.forEach(function(src,i){var im=IMG[src],x=70+(i%nC)*cw,y=top+Math.floor(i/nC)*cw;if(im)g.drawImage(im,x,y,ts,ts);if(r.digits&&r.digits[i]!=null){g.fillStyle="#ffc21a";g.beginPath();g.arc(x+ts-14,y+14,22,0,7);g.fill();g.fillStyle="#0d2a66";g.font="700 28px 'Barlow Condensed',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(r.digits[i],x+ts-14,y+15);g.textBaseline="alphabetic"}});
    g.fillStyle="#bfd3ff";g.font="600 24px 'Barlow Condensed',sans-serif";g.fillText(T.stripSub,W2/2,H-34)})}
function endCase(){LS.del(GK);G=null;hush();home()}

/* ---------- politiediploma en GEZOCHT-poster: A4 op canvas, als PDF (één JPEG-pagina) of als afbeelding ---------- */
function dipSheet(){if(!RES)return;
  sheet('<h2>'+T.dipH+'</h2><p>'+T.dipT+'</p><input class="inp team" id="dTeam" autocomplete="off" maxlength="120" placeholder="'+esc(T.dipP)+'" value="'+esc(TEAM)+'"><button type="button" class="btn" id="dGo">'+T.dipGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){closeSheet();winBack()};
  $("#dGo").onclick=function(){TEAM=$("#dTeam").value.trim();LS.set("ss_ag_team",TEAM);dipShow()}}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div><h2>'+esc(r.v.K)+'</h2><button type="button" class="btn" id="vAlb">📷 '+T.alBtn+'</button><button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn" id="vPos">'+T.posBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  $("#vDip").onclick=dipSheet;$("#vPos").onclick=posShow;$("#vAlb").onclick=albumSheet;$("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP&&RES.secs!=null)MMP.result($("#sheetBody"),{code:RES.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function a4Sheet(title,note,fname,drawFn){var r=RES;
  sheet('<div class="eyebrow">'+esc(title)+'</div><canvas id="dip" width="1240" height="1754" class="stripc a4"></canvas><p class="note">'+esc(note)+'</p><button type="button" class="btn" id="dPdf">'+T.dipPdf+'</button><button type="button" class="btn ghost dk" id="dImg">'+T.dipImg+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#dip");drawFn(cv,r);
  $("#dPdf").onclick=function(){var jpg=cv.toDataURL("image/jpeg",.9),blob=pdfFromJpeg(jpg,cv.width,cv.height),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=fname+"-"+r.code+".pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)};
  $("#dImg").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],fname+"-"+r.code+".jpg",{type:"image/jpeg"});
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){})}else{var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.9);a.download=fname+"-"+r.code+".jpg";document.body.appendChild(a);a.click();a.remove()}},"image/jpeg",.9)};
  $("#dBack").onclick=function(){closeSheet();winBack()};$("#vHome").onclick=function(){closeSheet();endCase()}}
function dipShow(){a4Sheet(T.dipH,T.dipNote,L==="nl"?"politiediploma":"police-diploma",function(cv,r){drawDiploma(cv,r,TEAM)})}
function posShow(){a4Sheet(T.posH,T.posNote,L==="nl"?"gezocht-poster":"wanted-poster",function(cv,r){drawPoster(cv,r,TEAM)})}
function tape(g,y,W2){for(var i=-40;i<W2;i+=80){g.fillStyle="#ffc21a";g.fillRect(i,y,40,22);g.fillStyle="#111";g.fillRect(i+40,y,40,22)}}
function names(g,team,y,W2,col){if(!team)return y;var list=team.split(/[,;]+/).map(function(s){return s.trim()}).filter(Boolean),line="",lines=[];g.font="700 36px 'Permanent Marker','Comic Sans MS',cursive";g.textAlign="center";
  list.forEach(function(nm){var t=line?line+"  ·  "+nm:nm;if(g.measureText(t).width>W2-260&&line){lines.push(line);line=nm}else line=t});if(line)lines.push(line);
  g.fillStyle=col;lines.slice(0,3).forEach(function(l){g.fillText(l,W2/2,y);y+=46});return y+10}
function drawDiploma(cv,r,team){var g=cv.getContext("2d"),W2=cv.width,H=cv.height,v=r.v;
  var dateStr=new Date().toLocaleDateString(L==="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"});
  loadImgs([r.team,r.arrest],function(IMG){
    g.fillStyle="#fffaf0";g.fillRect(0,0,W2,H);tape(g,40,W2);tape(g,H-62,W2);
    g.strokeStyle="#1e3a8a";g.lineWidth=8;g.strokeRect(70,100,W2-140,H-200);g.strokeStyle="#ffc21a";g.lineWidth=3;g.strokeRect(88,118,W2-176,H-236);
    badgeDraw(g,W2/2,250,95,v.J||(L==="nl"?"AGENT":"OFFICER"));
    g.textAlign="center";g.fillStyle="#1e3a8a";g.font="700 86px 'Barlow Condensed','Arial Narrow',sans-serif";g.fillText(T.dipTitle,W2/2,420);
    g.fillStyle="#9a6a00";g.font="600 24px 'Barlow Condensed',sans-serif";g.fillText(T.dipSub.split("").join(String.fromCharCode(8202)),W2/2,462);
    g.fillStyle="#1e293b";g.font="500 34px 'Barlow','Segoe UI',sans-serif";g.fillText(T.dipL1,W2/2,540);
    g.fillStyle="#1e3a8a";g.font="700 64px 'Barlow Condensed',sans-serif";g.fillText(v.J?fill(T.dipL2,{J:v.J}):T.dipL2b,W2/2,616,W2-240);
    g.fillStyle="#1e293b";g.font="500 34px 'Barlow',sans-serif";g.fillText(T.dipL3,W2/2,672);
    var pw=360,phh=450,gap=50,x0=(W2-2*pw-gap)/2,y0=720;polaroid(g,IMG[r.team],x0,y0,pw,phh,T.teamH,-.03,"700 24px 'Permanent Marker',cursive");polaroid(g,IMG[r.arrest],x0+pw+gap,y0+14,pw,phh,T.arrestH,.03,"700 24px 'Permanent Marker',cursive");
    var y=y0+phh+80;g.fillStyle="#1e293b";g.font="italic 500 28px 'Barlow',sans-serif";g.fillText(fill(T.dipL4,v),W2/2,y,W2-220);y+=44;
    g.fillStyle="#64748b";g.font="500 26px 'Barlow',sans-serif";g.fillText(fill(T.dipDate,{d:dateStr,m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars)}),W2/2,y);y+=64;
    if(team){g.fillStyle="#9a6a00";g.font="600 22px 'Barlow Condensed',sans-serif";g.fillText(T.dipTeam.toUpperCase(),W2/2,y);y+=46;y=names(g,team,y,W2,"#1e3a8a")}
    imgAt(g,"moto",190,H-150,150,.95);fig(g,W2-180,H-140,150,{tr:r.K.tr,b:r.Kb});g.save();g.translate(W2-180,H-100);g.rotate(-.08);g.fillStyle="#ef4444";g.font="700 30px 'Barlow Condensed',sans-serif";g.fillText(L==="nl"?"GEPAKT":"CAUGHT",0,0);g.restore();
    var sy=H-230;g.strokeStyle="#1e3a8a";g.lineWidth=2;g.beginPath();g.moveTo(W2/2-240,sy);g.lineTo(W2/2+160,sy);g.stroke();
    g.fillStyle="#1e3a8a";g.font="700 40px 'Permanent Marker',cursive";g.save();g.translate(W2/2-40,sy-18);g.rotate(-.04);g.fillText(r.K.name,0,0);g.restore();
    g.fillStyle="#64748b";g.font="500 22px 'Barlow',sans-serif";g.fillText(T.dipSign,W2/2-40,sy+36);
    g.fillStyle="#64748b";g.font="500 20px 'Barlow Condensed',sans-serif";g.fillText(fill(T.dipFoot,{c:r.code})+(r.digits&&r.digits.length?"  ·  "+fill(T.dipCode,{g:r.digits.join("")}):""),W2/2,H-100,W2-200);
    teamPill(g,r,W2-120,170,"right")})}
/* teamkleur (uit de feestopties) als gekleurd label */
function teamPill(g,r,x,y,al){var tc=r.tc||{};if(!tc.name)return;var t=fill(T.dipTeamC,{t:tc.name}).toUpperCase();g.save();g.font="700 30px 'Barlow Condensed',sans-serif";var tw=g.measureText(t).width+48,x0=al==="right"?x-tw:al==="center"?x-tw/2:x;g.fillStyle=tc.col||"#1e3a8a";rr(g,x0,y-34,tw,48,24);g.fill();g.fillStyle="#fff";g.textAlign="center";g.textBaseline="alphabetic";g.fillText(t,x0+tw/2,y);g.restore()}
function drawPoster(cv,r,team){var g=cv.getContext("2d"),W2=cv.width,H=cv.height;
  loadImgs([r.arrest||r.team],function(IMG){var im=IMG[r.arrest||r.team];
    g.fillStyle="#f5e6c8";g.fillRect(0,0,W2,H);var q=rngOf(r.seed+3);for(var i=0;i<300;i++){g.fillStyle="rgba(120,80,30,"+(q()*.12)+")";g.beginPath();g.arc(q()*W2,q()*H,q()*6,0,7);g.fill()}
    g.strokeStyle="#3b2a14";g.lineWidth=14;g.strokeRect(60,60,W2-120,H-120);g.lineWidth=4;g.strokeRect(90,90,W2-180,H-180);
    g.textAlign="center";g.fillStyle="#3b2a14";g.font="700 190px 'Barlow Condensed','Arial Narrow',sans-serif";g.fillText(T.posTitle,W2/2,290);
    g.fillStyle="#7a1f1f";g.font="700 48px 'Barlow Condensed',sans-serif";g.fillText(T.posSub,W2/2,360);
    var fw=820,fh=680,fx=(W2-fw)/2,fy=400;g.fillStyle="#3b2a14";g.fillRect(fx-14,fy-14,fw+28,fh+28);g.fillStyle="#fff";g.fillRect(fx,fy,fw,fh);
    if(im){var s=Math.max((fw-40)/im.width,(fh-40)/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(fx+20,fy+20,fw-40,fh-40);g.clip();g.drawImage(im,fx+20+(fw-40-w)/2,fy+20+(fh-40-h)/2,w,h);g.restore()}
    else{g.fillStyle="#dbeafe";g.fillRect(fx+20,fy+20,fw-40,fh-40);if(!imgAt(g,"kids-row",fx+fw/2,fy+fh-40,fh*.8))for(i=0;i<4;i++)drawFig(g,fx+170+i*160,fy+fh-60,420,{cop:true})}
    fig(g,fx+fw-60,fy+fh+10,260,{tr:r.K.tr,b:r.Kb});
    g.save();g.translate(fx+120,fy+fh-60);g.rotate(-.25);g.fillStyle="rgba(220,38,38,.9)";g.font="700 110px 'Barlow Condensed',sans-serif";g.strokeStyle="rgba(220,38,38,.9)";g.lineWidth=10;g.strokeRect(-170,-95,340,120);g.fillText(L==="nl"?"GEPAKT":"CAUGHT",0,0);g.restore();
    var y=fy+fh+110;if(r.tc&&r.tc.name){teamPill(g,r,W2/2,y-10,"center");y+=56}g.fillStyle="#3b2a14";g.font="700 40px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText(T.posL1,W2/2,y);y+=64;y=names(g,team,y,W2,"#3b2a14");
    g.fillStyle="#3b2a14";g.font="700 34px 'Barlow Condensed',sans-serif";g.fillText(fill(T.posTime,{m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars)}),W2/2,H-180);
    g.fillStyle="#7a1f1f";g.font="700 44px 'Barlow Condensed',sans-serif";g.fillText(T.posL2,W2/2,Math.max(y+30,H-230));
    g.fillStyle="#3b2a14";g.font="600 26px 'Barlow',sans-serif";g.fillText(r.K.name+" · "+fill(T.dipFoot,{c:r.code}),W2/2,H-130)})}
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
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();begin(p.seed,p.mode,false,p.len)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.ag,log=(g&&g.log)||[],st=function(k){return"★".repeat(k||0)+"☆".repeat(3-(k||0))};
  sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min</small><div class="tags"><i>'+st(x.st)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();KM.leave();stopSteps();G=null;hush();home()}
function wipeGame(){LS.del(GK);Wk.stopWatch();KM.leave();stopSteps();G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);MW.profile.wipe();if(/github\.io$/.test(location.hostname))LS.del(MW.pro.freeKey(ID));closeSheet();home();toast(T.wiped)})}}
function goBack(){if(!$("#hide").hidden){$("#hideX").click();return true}if(!$("#cine").hidden){$("#cineX").click();return true}
  if(!$("#sheet").hidden){if($("#sheet").dataset.lock){var x=$("#vHome")||$("#shX")||$("#bNext")||$("#pSkip")||$("#bPhoto");if(x)x.click()}else closeSheet();return true}
  if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({ag:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({ag:1},"")}catch(e){}}})}catch(e){}

/* ---------- startscherm: vrolijke straat, ballonnen, zwaailicht en een boef die voorbijrent ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,bal=[],dpr=1;
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;bal=[];for(var i=0;i<(still?0:10);i++)bal.push({x:Math.random()*w,y:Math.random()*h,s:7+Math.random()*9,v:.2+Math.random()*.4,a:Math.random()*6.3,c:COL[i%3]})}
  rs();addEventListener("resize",rs);
  function f(t){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);if($("#home").hidden){requestAnimationFrame(f);return}
    var on=Math.floor(t/420)%2===0;g.fillStyle=on?"rgba(255,59,59,.10)":"rgba(79,211,255,.10)";g.fillRect(0,0,w,Math.min(h,420));
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
hero();
if(/debug/.test(location.search)){window.AG_DRAW={drawFig:drawFig,badgeDraw:badgeDraw,drawBalloon:drawBalloon,begin:begin};
  /* testhaakjes: zaak bekijken, naar het volgende open spoor springen (kaartstand), code lezen */
  window.AG_API={g:function(){return G},parse:parseCode,go:function(){var s=G.st.filter(function(x){return !x.done})[0];if(!s)return null;P.x=s.x;P.y=s.y;sel=s;chip();return s.name}}}
/* ---------- start ---------- */
var hz=/[#&]z=([A-Z0-9]+)/i.exec(location.hash);
if(window.MMP)MMP.init({id:ID,fin:{nl:'Chef Bos: De Bordendief heeft nog iets bekend. Voor het feest had hij iets verstopt. Niet op het scherm, maar echt.',en:'Chief Hayes: The Sign Thief confessed one more thing. He hid something for the party. Not on the screen, but for real.'}});
home();if(hz){var pc=parseCode(hz[1]);if(pc)codeSheet(hz[1].toUpperCase())}
MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
})();
