/* Backstage: De Verdwenen Setlist / Backstage: The Missing Setlist – kinderwandeling 8+ (vooral voor meiden). Spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js, walk.js, steps.js, kidsmap.js, party.js, voice.js en BS_DATA (data-xx.js).
   Een uur voor de show van meidenband NOVA is de setlist weg, en steeds iets uit de kleedkamer. De Crew (het team) loopt langs backstage-stops:
   glitterspoor, choreo, merch stylen, lichtshow, handtekeningen, tickets scannen, lipsync, kabels, foodtruck, fotobooth, memory, mengtafel.
   Per stop: een spul voor het podium (verzamelvoortgang), en een setlist-snipper, een spoor over de outfit van de tas-drager of een getuige (één zit ernaast).
   Finale: Pip herkennen op de wazige foto van Nour, gesprek met Pip, de setlist in de goede volgorde, de show (springen, zingen, zwaaien, klappen, applaus),
   bandfoto, album en Backstage-pas als PDF. Alle figuren tekent het spel zelf op canvas; muziek en geluid via WebAudio.
   Niveaus "fan"/"ster" (Superster). Lengte 5/8/11 stops. Standen "map","demo","street","in". */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.BS_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="bs",GK="ss_game_bs_"+L,WK="ss_ways_bs_"+L,hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz;function closeSheet(){mg.stop();hush();Wk.closeSheet()}
var G=null,tick=0,MODE=LS.get("ss_bs_mode","map"),NAME=LS.get("ss_bs_name",""),VOICE=LS.get("ss_bs_voice",true),LEVEL=LS.get("ss_bs_level","fan"),LEN=LS.get("ss_bs_len","normaal"),MUSIC=LS.get("ss_bs_music",true);
var LENS={kort:5,normaal:8,lang:11};if(!LENS[LEN])LEN="normaal";if(LEVEL!=="fan"&&LEVEL!=="ster")LEVEL="fan";
var ATK=["glit","hoed","schoen"],ACTS=["glitter","choreo","style","lights","sign","tickets","rhythm","menu","diff","cables","pairs","mixer"];
var EVPOS={5:[1,2,3],8:[1,3,5],11:[2,5,8]},SONGPOS={5:[0,1,2,3,4],8:[0,2,4,6,7],11:[0,3,4,7,10]},WITPOS={5:[2,4],8:[2,3,5,6],11:[1,3,5,6,9]},POSE_AT={5:[3],8:[4],11:[4,8]},PUL=["time","shield","hint","xp2","coin2"];
/* volgorde waarin de podium-onderdelen aangaan (element-id's, zie drawStage) */
var PRIO=[1,2,0,6,10,5,3,4,9,7,8];
function NN(){return (G&&G.n)||8}function lenOf(n){return n===5?"kort":n===11?"lang":"normaal"}function hard(){return LEVEL==="ster"}
var W=[],P={x:0,y:0,acc:0},R0=550,map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null,photoFor=null,lastFix=0,GL={on:false,t0:0,x:0,y:0,dir:1,next:0};
var mg={raf:0,tm:[],iv:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[];this.iv.forEach(clearInterval);this.iv=[];if(this.off){this.off();this.off=null}}};
var C={pur:"#3b0764",deep:"#1a0433",night:"#12021f",mag:"#ff2d95",gold:"#ffd166",turq:"#2dd4bf",pink:"#ffb3d9",white:"#ffffff",ink:"#14052b",lil:"#a78bfa",red:"#ff4d6d",blue:"#60a5fa",green:"#4ade80"};
var GC=["#ff6fb5","#ffd166","#2dd4bf"],AVC=["#ff2d95","#2dd4bf","#ffd166","#a78bfa"],still=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- hulpjes ---------- */
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function rankOf(xp){return Math.min(10,1+Math.floor((xp||0)/150))}
function rankName(l){return T.ranks[Math.max(0,Math.min(9,(l||1)-1))]}
if(window.MMVoice)MMVoice.init("backstage",L);
function say(t){if(!VOICE||!t)return;if(window.MMVoice)return MMVoice.say(t);try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(String(t).replace(/[“”"«»]/g,"").replace(/\{[^}]+\}/g,""));u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.95;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
function bubble(txt,who,cls,av){return '<div class="msg '+(cls||"")+'">'+(av||AV("max"))+'<div class="bub"><button type="button" class="spk" aria-label="'+esc(T.listen)+'" data-say="'+esc(txt)+'">🔊</button>'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+esc(txt)+'</p></div></div>'}
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){var v=VOICE;VOICE=true;say(b.dataset.say);VOICE=v}});

/* ---------- geluid: alles met WebAudio, geen bestanden ---------- */
var AC=null;function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}return AC}
function tone(f,d,type,vol,when,slide){if(!Wk.sound())return;var a=ac();if(!a)return;try{var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(when||0);o.type=type||"triangle";o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(vol||.06,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
function noise(d,vol,when,hp){if(!Wk.sound())return;var a=ac();if(!a)return;try{var n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),ch=b.getChannelData(0);for(var i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);var s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime+(when||0);s.buffer=b;f.type="highpass";f.frequency.value=hp||800;g.gain.value=vol||.05;s.connect(f);f.connect(g);g.connect(a.destination);s.start(t)}catch(e){}}
var SFX={coin:function(){tone(1319,.08,"sine",.06);tone(1760,.2,"sine",.05,.06)},hurt:function(){tone(330,.25,"sawtooth",.06,0,165)},bad:function(){tone(200,.2,"square",.05)},jump:function(){tone(400,.15,"triangle",.06,0,900)},hit:function(){tone(880,.06,"triangle",.05)},
  clear:function(){[523,659,784,1047].forEach(function(f,i){tone(f,.18,"triangle",.07,i*.1)});tone(1319,.5,"triangle",.07,.42);noise(.6,.03,.4,2000)},
  levelup:function(){[392,523,659,784,1047,1319].forEach(function(f,i){tone(f,.14,"sine",.07,i*.08)})},
  boot:function(){tone(55,.6,"sawtooth",.06,0,110);noise(.4,.04,.2,300);tone(220,.5,"triangle",.05,.5)},
  whoosh:function(){noise(.4,.05,0,1200);tone(900,.3,"sine",.03,0,300)},
  cheer:function(){noise(1.4,.06,0,700);noise(1,.04,.3,1500)},
  drum:function(){tone(110,.15,"sine",.09,0,50);noise(.06,.05,0,3000)},
  win:function(){[523,659,784,1047,784,1047,1319,1568].forEach(function(f,i){tone(f,.16,"triangle",.07,i*.11)});noise(1.5,.05,.6,900)}};
function sfx(k){if(SFX[k])SFX[k]()}
/* popliedjes: 8-staps sequencer met kick, bas en melodie */
var MUS={on:false,iv:0,step:0,pat:null};
var PATS={map:{bpm:112,bass:[110,0,110,131,98,0,98,147],lead:[659,0,784,659,0,587,523,0],kick:[1,0,0,0,1,0,0,0]},
  show:{bpm:124,bass:[131,131,165,165,147,147,110,110],lead:[523,659,784,659,880,784,659,587],kick:[1,0,1,0,1,0,1,0]}};
function music(name){musicStop();if(!MUSIC||!name||!Wk.sound())return;var a=ac();if(!a)return;MUS.on=true;MUS.pat=PATS[name];MUS.step=0;var dt=60/MUS.pat.bpm/2;
  MUS.iv=setInterval(function(){if(!Wk.sound()||!MUSIC)return;var p=MUS.pat,i=MUS.step%8;if(p.bass[i])tone(p.bass[i],dt*.9,"triangle",.045);if(p.lead[i]&&MUS.step%16<12)tone(p.lead[i],dt*.7,"sine",.02);if(p.kick[i])tone(90,.12,"sine",.05,0,45);MUS.step++},dt*1000)}
function musicStop(){clearInterval(MUS.iv);MUS.iv=0;MUS.on=false}

/* ---------- figuren: alles getekend op canvas ---------- */
/* o={skin,hair,hs(0 lang,1 knotjes,2 krullen,3 kort,4 paardenstaart,5 bob),top,legs,glit,hat,shoe,glasses,beard,freck,pose,prop,blur,bagc} ; (x,y)=voeten, s=maat (figuur ≈ 9s hoog) */
var PPL={
  max:{skin:"#c68642",hair:"#2b1a10",hs:3,top:"#1f2937",hat:4,prop:"clip",legs:"#111827",shoe:1},
  luna:{skin:"#f1c27d",hair:"#7c3aed",hs:0,top:"#ff2d95",glit:0,prop:"mic",shoe:0},
  zoe:{skin:"#ffdbac",hair:"#d9480f",hs:2,top:"#2dd4bf",prop:"guitar",shoe:1},
  indi:{skin:"#8d5524",hair:"#111",hs:3,top:"#a78bfa",hat:2,prop:"",shoe:1},
  pip:{skin:"#f8d5b0",hair:"#6b3f1d",hs:1,top:"#ffd166",freck:1,prop:"sticks",shoe:1},
  vera:{skin:"#ffe0bd",hair:"#f4c20d",hs:4,top:"#ff6fb5",glasses:1,prop:""},
  sam:{skin:"#e0ac69",hair:"#3b2a14",hs:3,top:"#475569",hat:3,prop:""},
  bo:{skin:"#ffdbac",hair:"#7c4a1e",hs:3,top:"#0f172a",hat:2,beard:1,prop:""},
  fay:{skin:"#a0522d",hair:"#111",hs:5,top:"#f8fafc",hat:5,prop:""},
  nour:{skin:"#d2a679",hair:"#1f1147",hs:5,top:"#fb923c",prop:"camera"}};
var WITK=["vera","sam","bo","fay","nour"];Object.keys(PPL).forEach(function(k){PPL[k].k=k});
/* ---------- artwork van Kellie (webp in img/); ontbreekt een plaatje, dan tekent het spel het zelf ---------- */
var IMGS={},IMGBASE=(MW.root||"")+"games/backstage/img/";
function img(k){var e=IMGS[k];if(e===undefined){var im=new Image();im.onload=function(){IMGS[k]=im};im.onerror=function(){IMGS[k]=null};im.src=IMGBASE+k+".webp";IMGS[k]=false;return null}return e||null}
["max","max-panic","luna","luna-point","zoe","indi","pip-sad","pip-relief","pip-drum","crew-0","crew-1","crew-2","crew-3","vera","sam","bo","fay","nour","hat-0","hat-1","hat-2","shoe-0","shoe-1","shoe-2","bag","drums","guitar","keyboard","djdeck","micstand","spot-0","spot-1","spot-2","spot-3","wedge","speaker","speakerstack","amp","cable","rack","clipboard","headphones","lightsbar","case","diff-a","diff-b"].forEach(img);
/* plaatje met de voeten op (x,y), hoogte h */
function fig(g,k,x,y,h,o){var im=img(k);if(!im)return false;o=o||{};var w=h*im.width/im.height;g.save();if(o.alpha!=null)g.globalAlpha=o.alpha;if(o.flip){g.translate(x,0);g.scale(-1,1);g.drawImage(im,-w/2,y-h,w,h)}else g.drawImage(im,x-w/2,y-h,w,h);g.restore();return w}
/* plaatje passend in een vak, midden op (x,y) */
function fit(g,k,x,y,bw,bh){var im=img(k);if(!im)return false;var s=Math.min(bw/im.width,bh/im.height),w=im.width*s,h=im.height*s;g.drawImage(im,x-w/2,y-h/2,w,h);return true}
function hsl2(h,s,l){var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,gg=0,b=0;if(h<60){r=c;gg=x}else if(h<120){r=x;gg=c}else if(h<180){gg=c;b=x}else if(h<240){gg=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return[Math.round((r+m)*255),Math.round((gg+m)*255),Math.round((b+m)*255)]}
/* de crew-kinderen: hoofddeksel = plaatje, shirtkleur = het lila shirt herkleuren */
var CREWC={};
function crewImg(av){av=av||{c:0,h:0};var k="crew-"+av.h,im=img(k);if(!im)return null;var ck=k+"-"+av.c;if(CREWC[ck])return CREWC[ck];if(av.c===3){CREWC[ck]=im;return im}
  var cv=document.createElement("canvas");cv.width=im.width;cv.height=im.height;var g=cv.getContext("2d");g.drawImage(im,0,0);var d;try{d=g.getImageData(0,0,cv.width,cv.height)}catch(e){CREWC[ck]=im;return im}var p=d.data,tgt=[330,174,45,265][av.c];
  for(var i=0;i<p.length;i+=4){if(p[i+3]<10)continue;var r=p[i]/255,gg=p[i+1]/255,b=p[i+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),l=(mx+mn)/2;if(mx===mn)continue;var s=l>.5?(mx-mn)/(2-mx-mn):(mx-mn)/(mx+mn),h=mx===r?(gg-b)/(mx-mn)+(gg<b?6:0):mx===gg?(b-r)/(mx-mn)+2:(r-gg)/(mx-mn)+4;h*=60;
    if(h<238||h>292||s<.22||l<.28||l>.93)continue;var c=hsl2(tgt,Math.min(1,s*(av.c===1?1.1:1)),av.c===2?Math.min(.72,l):l);p[i]=c[0];p[i+1]=c[1];p[i+2]=c[2]}
  g.putImageData(d,0,0);CREWC[ck]=cv;return cv}
/* Pip: hoofddeksel als plaatje op haar hoofd; [x-midden, bovenkant hoofd, hoedbreedte, hoofdmidden] als deel van het plaatje */
var PIPA={"pip-sad":[.5,.03,.62,.2],"pip-relief":[.5,.03,.62,.2],"pip-drum":[.5,0,.3,.1]};
function hatOn(g,hoed,cx,top,cy,w){var hi=img("hat-"+hoed);if(!hi)return false;var hh=w*hi.height/hi.width;if(hoed===2)g.drawImage(hi,cx-w/2,cy-hh/2,w,hh);else g.drawImage(hi,cx-w/2,top-hh+hh*.38,w,hh);return true}
function figPerson(g,x,y,s,o,t){var k=o.k;if(!k)return false;var v=k;if(k==="max")v=o.pose==="wave"?"max-panic":"max";else if(k==="luna")v=o.pose==="point"?"luna-point":"luna";else if(k==="pip")v="pip-"+(o.v||"drum");
  var im=img(v);if(!im)return false;var h=s*(v==="pip-drum"?7.2:v==="pip-sad"||v==="pip-relief"?6.4:9.2),bob=(o.bob&&!still)?Math.abs(Math.sin(((t||0)+(o.ph||0))/170))*s*.35:0,w=fig(g,v,x,y-bob,h,{alpha:o.alpha,flip:o.flip});
  if(k==="pip"&&o.hat!=null&&!o.flip){var a=PIPA[v];hatOn(g,o.hat,x-w/2+w*a[0],y-bob-h+h*a[1],y-bob-h+h*a[3],w*a[2])}return true}
function shoe(g,x,y,s,k){if(k===0){g.fillStyle="#b45309";rr(g,x-.55*s,y-1.7*s,1.1*s,1.7*s,.3*s);g.fill();g.fillStyle="#ffd166";g.fillRect(x-.55*s,y-1.7*s,1.1*s,.22*s)}
  else if(k===2){g.fillStyle="#ff2d95";g.beginPath();g.ellipse(x+.1*s,y-.3*s,.65*s,.32*s,0,0,7);g.fill();g.fillStyle="#7a0b4a";g.fillRect(x-.55*s,y-.4*s,.16*s,.4*s);g.fillStyle="#fff";g.beginPath();g.arc(x+.3*s,y-.42*s,.1*s,0,7);g.fill()}
  else{g.fillStyle="#f8fafc";rr(g,x-.6*s,y-.6*s,1.3*s,.6*s,.25*s);g.fill();g.fillStyle="#2dd4bf";g.fillRect(x-.4*s,y-.4*s,.9*s,.14*s);g.fillStyle="#94a3b8";g.fillRect(x-.6*s,y-.12*s,1.3*s,.12*s)}}
function hatDraw(g,cx,cy,r,k){g.save();
  if(k===0){g.fillStyle="#1f1147";g.beginPath();g.ellipse(cx,cy-.82*r,1.25*r,.26*r,0,0,7);g.fill();rr(g,cx-.7*r,cy-1.75*r,1.4*r,.98*r,.2*r);g.fill();g.fillStyle="#ffd166";g.fillRect(cx-.7*r,cy-1.05*r,1.4*r,.22*r)}
  else if(k===1){g.fillStyle="#ff4d8d";var bx=cx+.55*r,by=cy-.95*r;g.beginPath();g.moveTo(bx,by);g.lineTo(bx-.75*r,by-.45*r);g.lineTo(bx-.7*r,by+.4*r);g.closePath();g.fill();g.beginPath();g.moveTo(bx,by);g.lineTo(bx+.75*r,by-.45*r);g.lineTo(bx+.7*r,by+.4*r);g.closePath();g.fill();g.fillStyle="#c2185b";g.beginPath();g.arc(bx,by,.2*r,0,7);g.fill()}
  else if(k===2||k===4){g.strokeStyle=k===4?"#334155":"#2dd4bf";g.lineWidth=.24*r;g.beginPath();g.arc(cx,cy,1.12*r,Math.PI*1.05,Math.PI*1.95);g.stroke();g.fillStyle=k===4?"#334155":"#2dd4bf";rr(g,cx-1.32*r,cy-.35*r,.42*r,.75*r,.18*r);g.fill();rr(g,cx+.9*r,cy-.35*r,.42*r,.75*r,.18*r);g.fill();
    if(k===4){g.strokeStyle="#334155";g.lineWidth=.1*r;g.beginPath();g.moveTo(cx-1.1*r,cy+.3*r);g.quadraticCurveTo(cx-.9*r,cy+.9*r,cx-.3*r,cy+.75*r);g.stroke();g.fillStyle="#111";g.beginPath();g.arc(cx-.28*r,cy+.75*r,.1*r,0,7);g.fill()}}
  else if(k===3){g.fillStyle="#e11d48";g.beginPath();g.ellipse(cx,cy-.55*r,1.08*r,.75*r,0,Math.PI,0);g.fill();g.fillRect(cx-.2*r,cy-.62*r,1.55*r,.2*r)}
  else if(k===5){g.fillStyle="#fff";g.strokeStyle="#cbd5e1";g.lineWidth=.06*r;rr(g,cx-.85*r,cy-1.2*r,1.7*r,.5*r,.1*r);g.fill();g.stroke();[-.5,0,.5].forEach(function(dx){g.beginPath();g.arc(cx+dx*r,cy-1.4*r,.45*r,0,7);g.fill();g.stroke()})}
  else if(k===6){g.fillStyle="#111";rr(g,cx-.95*r,cy-.05*r,.8*r,.4*r,.15*r);g.fill();rr(g,cx+.15*r,cy-.05*r,.8*r,.4*r,.15*r);g.fill();g.fillRect(cx-.2*r,cy,.4*r,.08*r)}
  g.restore()}
function drawHeadAt(g,cx,cy,r,o,t){o=o||{};var hc=o.hair||"#3b2a14",sk=o.skin||"#f1c27d",hs=o.hs||0;g.save();
  if(o.blur){g.filter="blur("+Math.max(2,r*.28)+"px)";hc="#3a2a4d";sk="#d6a77a"}
  g.fillStyle=hc;
  if(hs===0){rr(g,cx-1.18*r,cy-.9*r,2.36*r,2.5*r,.9*r);g.fill()}else if(hs===4){g.beginPath();g.ellipse(cx+1.05*r,cy+.3*r,.38*r,.95*r,-.3,0,7);g.fill()}else if(hs===5){rr(g,cx-1.15*r,cy-.9*r,2.3*r,1.75*r,.8*r);g.fill()}
  else if(hs===1){g.beginPath();g.arc(cx-.85*r,cy-.95*r,.5*r,0,7);g.arc(cx+.85*r,cy-.95*r,.5*r,0,7);g.fill()}
  else if(hs===2){for(var i=0;i<9;i++){var a=Math.PI*(.9+i*.15);g.beginPath();g.arc(cx+Math.cos(a)*1.05*r,cy+Math.sin(a)*1.0*r+.1*r,.42*r,0,7);g.fill()}g.beginPath();g.arc(cx-1.05*r,cy+.4*r,.4*r,0,7);g.arc(cx+1.05*r,cy+.4*r,.4*r,0,7);g.fill()}
  g.fillStyle=sk;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
  g.fillStyle=hc;g.beginPath();g.ellipse(cx,cy-.28*r,1.04*r,.78*r,0,Math.PI,0);g.fill();
  if(hs===3){g.beginPath();g.ellipse(cx,cy-.4*r,1.06*r,.7*r,0,Math.PI*.95,Math.PI*2.05);g.fill()}
  if(hs===4||hs===0||hs===5){g.beginPath();g.ellipse(cx-.35*r,cy-.45*r,.75*r,.4*r,-.4,0,7);g.fill()}
  if(!o.blur){var blink=(!still&&t&&Math.floor((t+(o.ph||0))/2600)%9===0)?.25:1;g.fillStyle="#1e1b2e";[-.42,.42].forEach(function(dx){g.beginPath();g.ellipse(cx+dx*r,cy+.12*r,.13*r,.17*r*blink,0,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.arc(cx+dx*r+.04*r,cy+.06*r,.05*r,0,7);g.fill();g.fillStyle="#1e1b2e"});
    g.strokeStyle="#7a2e3a";g.lineWidth=Math.max(1,.08*r);g.beginPath();g.arc(cx,cy+.36*r,.3*r,.15*Math.PI,.85*Math.PI);g.stroke();
    g.fillStyle="rgba(255,110,150,.35)";g.beginPath();g.arc(cx-.62*r,cy+.42*r,.18*r,0,7);g.arc(cx+.62*r,cy+.42*r,.18*r,0,7);g.fill();
    if(o.freck){g.fillStyle="rgba(140,80,40,.6)";[[-.6,.28],[-.5,.4],[-.7,.38],[.6,.28],[.5,.4],[.7,.38]].forEach(function(p){g.beginPath();g.arc(cx+p[0]*r,cy+p[1]*r,.04*r,0,7);g.fill()})}
    if(o.beard){g.fillStyle=hc;g.beginPath();g.arc(cx,cy+.35*r,.75*r,0,Math.PI);g.fill();g.fillStyle=sk;g.beginPath();g.ellipse(cx,cy+.4*r,.28*r,.12*r,0,0,7);g.fill()}
    if(o.glasses===1){g.strokeStyle="#ff2d95";g.lineWidth=.1*r;g.beginPath();g.arc(cx-.42*r,cy+.12*r,.28*r,0,7);g.stroke();g.beginPath();g.arc(cx+.42*r,cy+.12*r,.28*r,0,7);g.stroke()}}
  g.restore();if(o.hat!=null)hatDraw(g,cx,cy,r,o.hat);if(o.glasses===2)hatDraw(g,cx,cy,r,6)}
function drawPerson(g,x,y,s,o,t){o=o||{};if(figPerson(g,x,y,s,o,t))return;var sk=o.skin||"#f1c27d",pose=o.pose||"idle",bob=(o.bob&&!still)?Math.abs(Math.sin(((t||0)+(o.ph||0))/170))*s*.35:0,sq=pose==="down"?.9*s:0;
  g.save();g.translate(x,y-bob);g.lineCap="round";g.lineJoin="round";
  g.fillStyle="rgba(0,0,0,.18)";g.beginPath();g.ellipse(0,bob,2*s,.4*s,0,0,7);g.fill();
  g.fillStyle=o.legs||"#2e1065";rr(g,-1.05*s,-2.7*s+sq,.85*s,2.4*s-sq,.3*s);g.fill();rr(g,.2*s,-2.7*s+sq,.85*s,2.4*s-sq,.3*s);g.fill();
  shoe(g,-.62*s,0,s,o.shoe==null?1:o.shoe);shoe(g,.68*s,0,s,o.shoe==null?1:o.shoe);
  g.translate(0,sq);
  g.fillStyle=o.top||"#ff2d95";g.beginPath();g.moveTo(-1.15*s,-5.5*s);g.lineTo(1.15*s,-5.5*s);g.lineTo(1.75*s,-2.4*s);g.lineTo(-1.75*s,-2.4*s);g.closePath();g.fill();
  if(o.glit!=null){var gc=GC[o.glit],q=rngOf(7+o.glit);for(var i=0;i<16;i++){var gx=(q()-.5)*2.8*s,gy=-2.6*s-q()*2.8*s;g.fillStyle=i%3?gc:"#fff";sparkle(g,gx,gy,s*(.12+q()*.16),g.fillStyle,t?t/300+i:0)}}
  var A={idle:[[-1.9,-3.1],[1.9,-3.1]],up:[[-1.8,-7.9],[1.8,-7.9]],left:[[-3.3,-5.8],[-.3,-3.6]],right:[[.3,-3.6],[3.3,-5.8]],down:[[-2.1,-2.9],[2.1,-2.9]],wave:[[-1.9,-3.1],[2.5,-7.3]],mic:[[-1.9,-3.1],[.7,-5.9]],drum:[[-2.7,-4.2+(t&&!still?Math.sin(t/90)*.5:0)],[2.7,-4.2-(t&&!still?Math.sin(t/90)*.5:0)]],guitar:[[-1.1,-3.8],[1.5,-4.1]],clap:[[-.3,-6],[.3,-6]],point:[[-1.9,-3.1],[3.4,-5.4]]}[pose]||[[-1.9,-3.1],[1.9,-3.1]];
  g.strokeStyle=sk;g.lineWidth=.55*s;[[-1.05,A[0]],[1.05,A[1]]].forEach(function(p){g.beginPath();g.moveTo(p[0]*s,-5.2*s);g.lineTo(p[1][0]*s,p[1][1]*s);g.stroke();g.fillStyle=sk;g.beginPath();g.arc(p[1][0]*s,p[1][1]*s,.36*s,0,7);g.fill()});
  var pr=o.prop;
  if(pr==="mic"){g.fillStyle="#cbd5e1";g.fillRect(A[1][0]*s-.12*s,A[1][1]*s-.2*s,.24*s,1.1*s);g.fillStyle=o.glit!=null?GC[o.glit]:"#e5e7eb";g.beginPath();g.arc(A[1][0]*s,A[1][1]*s-.35*s,.38*s,0,7);g.fill()}
  else if(pr==="sticks"){g.strokeStyle="#d4a373";g.lineWidth=.22*s;[A[0],A[1]].forEach(function(h,k){g.beginPath();g.moveTo(h[0]*s,h[1]*s);g.lineTo(h[0]*s+(k?1.2:-1.2)*s,h[1]*s-1.4*s);g.stroke()})}
  else if(pr==="guitar"){g.save();g.translate(.2*s,-3.8*s);g.rotate(-.5);g.fillStyle="#ff2d95";g.beginPath();g.ellipse(-.6*s,0,1*s,.8*s,0,0,7);g.fill();g.fillStyle="#7a0b4a";g.beginPath();g.arc(-.5*s,0,.25*s,0,7);g.fill();g.fillStyle="#8b5a2b";g.fillRect(.2*s,-.15*s,2.6*s,.3*s);g.restore()}
  else if(pr==="camera"){g.fillStyle="#1f2937";rr(g,-.8*s,-4.6*s,1.6*s,1*s,.2*s);g.fill();g.fillStyle="#60a5fa";g.beginPath();g.arc(0,-4.1*s,.35*s,0,7);g.fill()}
  else if(pr==="clip"){g.fillStyle="#d6b98c";rr(g,A[0][0]*s-.6*s,A[0][1]*s-1*s,1.2*s,1.5*s,.15*s);g.fill();g.fillStyle="#fff";g.fillRect(A[0][0]*s-.45*s,A[0][1]*s-.75*s,.9*s,1.05*s)}
  else if(pr==="bag"){g.strokeStyle="#5b21b6";g.lineWidth=.2*s;g.beginPath();g.moveTo(-1*s,-5.3*s);g.lineTo(1.4*s,-3*s);g.stroke();g.fillStyle="#5b21b6";rr(g,.6*s,-3.4*s,1.6*s,1.3*s,.3*s);g.fill();if(o.bagc!=null){g.fillStyle=GC[o.bagc];for(var b=0;b<5;b++)sparkle(g,.9*s+b*.3*s,-3*s+(b%2)*.4*s,.15*s,GC[o.bagc],b)}}
  drawHeadAt(g,0,-7*s,1.55*s,o,t);
  g.restore()}
function sparkle(g,x,y,r,col,ph){g.save();g.translate(x,y);g.rotate((ph||0)%6.283);g.fillStyle=col;g.beginPath();for(var i=0;i<8;i++){var a=i/8*6.283,rad=i%2?r*.35:r;g.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}g.closePath();g.fill();g.restore()}
function heart(g,x,y,s,col){g.save();g.fillStyle=col;g.beginPath();g.moveTo(x,y+s*.35);g.bezierCurveTo(x-s*.9,y-s*.3,x-s*.35,y-s*.95,x,y-s*.42);g.bezierCurveTo(x+s*.35,y-s*.95,x+s*.9,y-s*.3,x,y+s*.35);g.fill();g.restore()}
function crewLook(av){av=av||{c:0,h:0};return{skin:"#f1c27d",hair:"#4a2c17",hs:[3,4,1,0][av.h],top:AVC[av.c],hat:[3,2,null,1][av.h],glasses:av.h===2?2:0,shoe:1,legs:"#1e1b4b"}}
function drawCrew(g,x,y,s,av,t,pose){var ci=crewImg(av);if(ci){var h=9.2*s,w=h*ci.width/ci.height,bob=(t&&!still)?Math.abs(Math.sin((t+(av.c*97))/170))*s*.35:0;g.drawImage(ci,x-w/2,y-bob-h,w,h);return}var o=crewLook(av);o.pose=pose||"idle";o.bob=!!t;drawPerson(g,x,y,s,o,t);g.fillStyle="#ffd166";rr(g,x-.45*s,y-4.7*s,.9*s,.65*s,.12*s);g.fill();g.fillStyle="#14052b";g.font="700 "+Math.max(6,.38*s)+"px 'Fredoka',sans-serif";g.textAlign="center";g.fillText("CREW",x,y-4.22*s)}
function spriteURL(fn,w,h){var cv=document.createElement("canvas");cv.width=w;cv.height=h;fn(cv.getContext("2d"));return cv.toDataURL("image/png")}
var AVU={};
function headURL(k){var im=img(k==="pip"?"pip-relief":k);if(im){if(!AVU["i"+k])AVU["i"+k]=spriteURL(function(g){var gr=g.createLinearGradient(0,0,0,96);gr.addColorStop(0,"#5b21b6");gr.addColorStop(1,"#1a0433");g.fillStyle=gr;g.fillRect(0,0,96,96);var sit=k==="pip",hw=im.width*(sit?.62:.75),hh=hw,hx=(im.width-hw)/2,hy=im.height*(sit?.0:.02);g.drawImage(im,hx,hy,hw,hh,4,6,88,88)},96,96);return AVU["i"+k]}
  if(!AVU[k])AVU[k]=spriteURL(function(g){var gr=g.createLinearGradient(0,0,0,96);gr.addColorStop(0,"#5b21b6");gr.addColorStop(1,"#1a0433");g.fillStyle=gr;g.fillRect(0,0,96,96);var o=PPL[k];g.fillStyle=o.top;g.beginPath();g.ellipse(48,104,36,26,0,0,7);g.fill();drawHeadAt(g,48,50,26,o,0)},96,96);return AVU[k]}
function AV(k){return '<span class="avatar a-'+k+'" style="background-image:url('+headURL(k)+')"></span>'}
function NAMEOF(k){return D.PEOPLE[k]?D.PEOPLE[k][0]:k}

/* spullen (podium-onderdelen) als icoon; k = element-id 0..10 */
var ITEMIMG={0:"clipboard",1:"micstand",3:"guitar",4:"headphones",5:"lightsbar",9:"cable"};
function drawItem(g,k,x,y,s){if(ITEMIMG[k]&&fit(g,ITEMIMG[k],x,y,2.4*s,2.4*s))return;g.save();g.translate(x,y);g.lineCap="round";
  if(k===0){g.fillStyle="#334155";rr(g,-.8*s,-.5*s,1.6*s,1*s,.2*s);g.fill();g.fillStyle="#ffd166";g.beginPath();g.arc(.8*s,0,.45*s,0,7);g.fill();g.fillStyle="rgba(255,209,102,.35)";g.beginPath();g.moveTo(.8*s,-.4*s);g.lineTo(2*s,-1*s);g.lineTo(2*s,1*s);g.lineTo(.8*s,.4*s);g.fill()}
  else if(k===1){g.fillStyle="#cbd5e1";g.fillRect(-.12*s,-.2*s,.24*s,1.3*s);g.fillStyle="#ff6fb5";g.beginPath();g.arc(0,-.5*s,.55*s,0,7);g.fill();sparkle(g,-.2*s,-.6*s,.2*s,"#fff",0);sparkle(g,.25*s,-.35*s,.15*s,"#fff",1)}
  else if(k===2){g.strokeStyle="#d4a373";g.lineWidth=.22*s;g.beginPath();g.moveTo(-.9*s,.9*s);g.lineTo(.6*s,-.9*s);g.stroke();g.fillStyle="#f5deb3";g.beginPath();g.arc(.6*s,-.9*s,.16*s,0,7);g.fill()}
  else if(k===3){g.fillStyle="#ff2d95";g.beginPath();g.moveTo(-.7*s,-.7*s);g.quadraticCurveTo(0,-1*s,.7*s,-.7*s);g.quadraticCurveTo(.6*s,.3*s,0,1*s);g.quadraticCurveTo(-.6*s,.3*s,-.7*s,-.7*s);g.fill();g.fillStyle="#fff";g.font="700 "+(.6*s)+"px 'Fredoka',sans-serif";g.textAlign="center";g.fillText("N",0,.1*s)}
  else if(k===4){g.strokeStyle="#a78bfa";g.lineWidth=.25*s;g.beginPath();g.arc(0,0,.8*s,Math.PI,0);g.stroke();g.fillStyle="#a78bfa";rr(g,-1.05*s,-.1*s,.5*s,.8*s,.2*s);g.fill();rr(g,.55*s,-.1*s,.5*s,.8*s,.2*s);g.fill()}
  else if(k===5){g.strokeStyle="#cbd5e1";g.lineWidth=.12*s;g.beginPath();g.moveTo(-1.1*s,-.3*s);g.lineTo(1.1*s,-.3*s);g.stroke();["#ff2d95","#ffd166","#2dd4bf","#a78bfa"].forEach(function(c,i){g.fillStyle=c;g.beginPath();g.arc(-.8*s+i*.55*s,.1*s,.22*s,0,7);g.fill()})}
  else if(k===6){var gr=g.createRadialGradient(-.2*s,-.2*s,.1*s,0,0,.9*s);gr.addColorStop(0,"#fff");gr.addColorStop(1,"#94a3b8");g.fillStyle=gr;g.beginPath();g.arc(0,.1*s,.85*s,0,7);g.fill();g.strokeStyle="rgba(30,27,46,.35)";g.lineWidth=.05*s;for(var i=-2;i<=2;i++){g.beginPath();g.moveTo(-.85*s,.1*s+i*.3*s);g.lineTo(.85*s,.1*s+i*.3*s);g.stroke();g.beginPath();g.moveTo(i*.3*s,-.75*s);g.lineTo(i*.3*s,.95*s);g.stroke()}g.strokeStyle="#cbd5e1";g.beginPath();g.moveTo(0,-.75*s);g.lineTo(0,-1.2*s);g.stroke()}
  else if(k===7){g.fillStyle="#475569";rr(g,-.6*s,-.6*s,1.2*s,1.2*s,.2*s);g.fill();g.fillStyle="#ff4d6d";g.beginPath();g.arc(0,0,.35*s,0,7);g.fill()}
  else if(k===8){g.fillStyle="#ffd166";g.save();g.rotate(-.6);rr(g,-.3*s,-.9*s,.6*s,1.6*s,.15*s);g.fill();g.restore();["#ff2d95","#2dd4bf","#a78bfa","#fff"].forEach(function(c,i){g.fillStyle=c;g.fillRect(.3*s+i*.2*s,-.9*s-i*.15*s,.18*s,.18*s)})}
  else if(k===9){g.fillStyle="#1f2937";rr(g,-.7*s,-1*s,1.4*s,2*s,.2*s);g.fill();g.fillStyle="#475569";g.beginPath();g.arc(0,.35*s,.45*s,0,7);g.fill();g.beginPath();g.arc(0,-.5*s,.25*s,0,7);g.fill()}
  else if(k===10){g.fillStyle="#ff2d95";rr(g,-1.2*s,-.5*s,2.4*s,1*s,.15*s);g.fill();g.fillStyle="#fff";g.font="700 "+(.6*s)+"px 'Fredoka',sans-serif";g.textAlign="center";g.fillText("NOVA",0,.2*s)}
  g.restore()}
/* het podium dat opbouwt: n onderdelen aan (in PRIO-volgorde), N totaal */
function drawStage(g,w,h,n,N,t,crowd,opt){var on={};PRIO.slice(0,n>=N?11:n).forEach(function(k){on[k]=1});if(opt&&opt.band){delete on[2];delete on[1]}var full=n>=N,tt=still?0:(t||0);
  var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,"#12021f");gr.addColorStop(1,"#3b0764");g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(var i=0;i<40;i++){var q=(i*9301+49297)%233280/233280;g.fillStyle="rgba(255,255,255,"+(.2+.3*((i%3)/2))+")";g.fillRect(q*w,(i*37%100)/100*h*.4,1.5,1.5)}
  var fy=h*.72;
  if(on[0]){[[.12,1],[.88,-1]].forEach(function(p,i){var ang=Math.sin(tt/900+i)*.35;g.save();g.translate(p[0]*w,h*.08);g.rotate(ang*p[1]);g.fillStyle=i?"rgba(45,212,191,.22)":"rgba(255,45,149,.22)";g.beginPath();g.moveTo(-6,0);g.lineTo(6,0);g.lineTo(w*.25,h*.7);g.lineTo(-w*.25,h*.7);g.closePath();g.fill();g.restore()})}
  if(on[0]&&img("spot-0")){[.14,.36,.64,.86].forEach(function(px,i){var im=img("spot-"+i);if(im){var hh=h*.1,ww=hh*im.width/im.height;g.save();if(i>1){g.translate(px*w,0);g.scale(-1,1);g.drawImage(im,-ww/2,h*.03,ww,hh)}else g.drawImage(im,px*w-ww/2,h*.03,ww,hh);g.restore()}})}
  if(on[5]){g.fillStyle="#475569";g.fillRect(w*.08,h*.08,w*.84,5);for(i=0;i<8;i++){var c=["#ff2d95","#ffd166","#2dd4bf","#a78bfa"][i%4];g.fillStyle=c;g.shadowColor=c;g.shadowBlur=full&&!still?12:4;g.beginPath();g.arc(w*.12+i*w*.108,h*.08+8,5,0,7);g.fill()}g.shadowBlur=0}
  if(on[10]){g.fillStyle="#ff2d95";rr(g,w*.3,h*.13,w*.4,h*.11,6);g.fill();g.fillStyle="#fff";g.font="700 "+Math.round(h*.08)+"px 'Fredoka',sans-serif";g.textAlign="center";g.fillText("NOVA",w/2,h*.215)}
  if(on[6]){var dy=h*.3;g.strokeStyle="#cbd5e1";g.lineWidth=1;g.beginPath();g.moveTo(w/2,h*.08);g.lineTo(w/2,dy-12);g.stroke();drawItem(g,6,w/2,dy,Math.max(10,h*.05));if(!still)for(i=0;i<6;i++){var a=tt/700+i;g.fillStyle="rgba(255,255,255,.6)";g.fillRect(w/2+Math.cos(a)*w*.3,dy+Math.sin(a*1.3)*h*.2+h*.1,3,3)}}
  g.fillStyle="#1e1b2e";g.beginPath();g.moveTo(w*.05,fy);g.lineTo(w*.95,fy);g.lineTo(w,fy+h*.08);g.lineTo(0,fy+h*.08);g.closePath();g.fill();g.fillStyle="#2a2342";g.fillRect(0,fy+h*.08,w,h*.04);
  if(on[9]&&img("speakerstack")){[w*.07,w*.93].forEach(function(x){fig(g,"speakerstack",x,fy,h*.3)});if(img("wedge")){fig(g,"wedge",w*.28,fy+h*.07,h*.06);fig(g,"wedge",w*.72,fy+h*.07,h*.06,{flip:true})}}
  else if(on[9]){[w*.06,w*.94].forEach(function(x){g.fillStyle="#111827";rr(g,x-w*.04,fy-h*.2,w*.08,h*.2,4);g.fill();g.fillStyle="#374151";g.beginPath();g.arc(x,fy-h*.07,w*.025,0,7);g.fill();g.beginPath();g.arc(x,fy-h*.15,w*.014,0,7);g.fill()})}
  if(on[3]&&fig(g,"amp",opt&&opt.band?w*.5:w*.22,fy,h*.12)){}else if(on[3]){g.fillStyle="#111827";rr(g,w*.18,fy-h*.11,w*.1,h*.11,3);g.fill();g.fillStyle="#ffd166";g.fillRect(w*.19,fy-h*.1,w*.08,3)}
  if(on[4]&&fig(g,"djdeck",w*.78,fy,h*.09)){}else if(on[4]){g.fillStyle="#a78bfa";rr(g,w*.68,fy-h*.1,w*.16,h*.1,3);g.fill();g.fillStyle="#1e1b2e";g.beginPath();g.arc(w*.72,fy-h*.06,w*.02,0,7);g.arc(w*.8,fy-h*.06,w*.02,0,7);g.fill()}
  if(on[2]&&fig(g,"drums",w/2,fy,h*.2)){}else if(on[2]){var dx=w/2,dyy=fy-h*.02;g.fillStyle="#ff6fb5";g.beginPath();g.ellipse(dx,dyy-h*.06,w*.07,h*.06,0,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.ellipse(dx,dyy-h*.06,w*.05,h*.045,0,0,7);g.fill();g.fillStyle="#ffd166";g.beginPath();g.ellipse(dx-w*.1,dyy-h*.12,w*.035,h*.012,0,0,7);g.fill();g.beginPath();g.ellipse(dx+w*.1,dyy-h*.12,w*.035,h*.012,0,0,7);g.fill()}
  if(on[1]&&fig(g,"micstand",w*.38,fy,h*.24)){}else if(on[1]){g.strokeStyle="#cbd5e1";g.lineWidth=2;g.beginPath();g.moveTo(w*.4,fy);g.lineTo(w*.4,fy-h*.18);g.stroke();drawItem(g,1,w*.4,fy-h*.2,Math.max(5,h*.025))}
  if(on[7]&&!still){for(i=0;i<7;i++){g.fillStyle="rgba(226,232,240,.07)";g.beginPath();g.ellipse(w*.1+i*w*.13+Math.sin(tt/800+i)*10,fy+h*.03,w*.09,h*.025+Math.sin(tt/600+i)*2,0,0,7);g.fill()}}
  if(on[8]){[w*.03,w*.97].forEach(function(x,i){g.save();g.translate(x,fy);g.rotate(i?-.5:.5);g.fillStyle="#ffd166";rr(g,-5,-28,10,28,3);g.fill();g.restore()});if(full&&!still)for(i=0;i<30;i++){var cq=(i*7919)%101/101;g.fillStyle=["#ff2d95","#ffd166","#2dd4bf","#a78bfa","#fff"][i%5];g.fillRect(cq*w,((tt/9+i*41)%(h*1.1))-h*.1,4,6)}}
  if(crowd!==false){for(i=0;i<16;i++){var cx=(i+.5)*w/16,ch=h*.07+((i*13)%5)*h*.012,j=(!still&&full)?Math.abs(Math.sin(tt/200+i))*h*.02:0;g.fillStyle="#0b0215";g.beginPath();g.arc(cx,h-ch-j,h*.035,0,7);g.fill();g.fillRect(cx-h*.04,h-ch+h*.02-j,h*.08,ch)}}}
/* spoor-icoon: k = kenmerk, v = waarde */
function evDraw(g,k,v){g.fillStyle="#2a0a4a";rr(g,0,0,80,80,12);g.fill();g.strokeStyle="#ffd166";g.lineWidth=2;rr(g,2,2,76,76,11);g.stroke();
  if(k==="glit"){for(var i=0;i<22;i++){var q=(i*9301+49297)%233280/233280,q2=(i*4271+1013)%997/997;sparkle(g,14+q*52,20+q2*44,3+((i*7)%4),i%4?GC[v]:"#fff",i)}}
  else if(k==="hoed"){if(img("hat-"+v)){fit(g,"hat-"+v,40,40,66,60);return}hatDraw(g,40,62,22,v);g.fillStyle="rgba(255,255,255,.12)";g.beginPath();g.arc(40,62,20,0,7);g.fill()}
  else{if(img("shoe-"+v)){fit(g,"shoe-"+v,40,40,68,60);return}g.save();g.translate(22,38);shoe(g,4,26,14,v);shoe(g,32,22,14,v);g.restore()}}

/* ---------- zaakgenerator ---------- */
function genCase(seed,mode,n){n=n||8;var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  var K={glit:Math.floor(r()*3),hoed:Math.floor(r()*3),schoen:Math.floor(r()*3)};
  var wpos=WITPOS[n],wp=shuffle([0,1,2,3,4],r).slice(0,wpos.length),li=Math.floor(r()*wpos.length),lk=pick(ATK),lv=(K[lk]+1+Math.floor(r()*2))%3;
  var sus=[K];ATK.forEach(function(k){var d={glit:K.glit,hoed:K.hoed,schoen:K.schoen};d[k]=k===lk?lv:(K[k]+1+Math.floor(r()*2))%3;sus.push(d)});
  var d5={glit:K.glit,hoed:K.hoed,schoen:K.schoen};d5[lk]=3-K[lk]-lv;sus.push(d5);
  var order=shuffle([0,1,2,3,4],r),sus2=order.map(function(i){return sus[i]}),Ki=order.indexOf(0);
  var evo=shuffle(ATK,r),ev=evo.map(function(k){return{k:k,v:K[k],t:pick(D.EV[k])}});
  var tk=shuffle(ATK,r),wits=wp.map(function(p,j){var lie=j===li,k=lie?lk:tk[j%3];return{p:p,k:k,v:lie?lv:K[k],lie:lie}});
  var sg=shuffle(D.SONGS.map(function(x,i){return i}),r).slice(0,5),so=LEVEL==="ster"?shuffle([0,1,2,3,4],r):[0,1,2,3,4];
  var acts=["glitter"].concat(shuffle(ACTS.filter(function(a){return a!=="glitter"}),r).slice(0,n-1)),av={c:Math.floor(r()*4),h:Math.floor(r()*4)};
  var slots=acts.map(function(a,i){var e=EVPOS[n].indexOf(i),s=SONGPOS[n].indexOf(i),w=wpos.indexOf(i);return{act:a,coins:10+Math.floor(r()*21),pu:shuffle(PUL,r).slice(0,3),e:e,sg:s,w:w}});
  return{sus:sus2,K:Ki,ev:ev,wits:wits,sg:sg,so:so,ster:LEVEL==="ster",slots:slots,av:av}}
function makeCode(seed,mode,n){return"BS"+(n===5?"5":n===11?"L":"")+(LEVEL==="ster"?"X":"")+(mode==="in"?"B":mode==="map"||mode==="demo"?"K":"S")+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v),m=/^BS([5L]?)(X?)([KSB])([0-9A-Z]{1,7})$/.exec(c);if(!m)return null;var seed=parseInt(m[4],36);if(!(seed>=0)||seed>4294967295)return null;return{mode:m[3]==="B"?"in":m[3]==="K"?"map":"street",seed:seed,n:m[1]==="5"?5:m[1]==="L"?11:8,lvl:m[2]?"ster":"fan"}}
function fixG(g){if(!g||!g.c||!g.c.slots)return null;g.n=g.n||g.c.slots.length;if(!Array.isArray(g.ph))g.ph=[];if(!Array.isArray(g.album))g.album=[];if(!g.poses)g.poses={};if(!g.ach)g.ach={};g.xp=g.xp||0;g.coins=g.coins||0;g.tl=g.tl||1;g.av=g.av||g.c.av;g.times=g.times||[];g.fin=g.fin||0;return g}
function done(){return G.ph.filter(Boolean).length}
function songAt(p){return D.SONGS[G.c.sg[p]]}
function songText(j){var p=G.c.so[j],s=songAt(p);if(!G.c.ster)return fill(D.SONGF,{p:p+1,t:s.t});return fill(D.SONGX,{t:s.t,c:p===0?D.SONGC0:fill(D.SONGC,{th:songAt(p-1).th})})}
function witText(w){return D.WITPRE[WITK[w.p]]+fill(D.WITT[w.k],{v:D.AT[w.k].v[w.v]})}
function minsLeft(){return Math.max(3,Math.round((NN()-done())*6+3))}
function vars(){return{J:NAME,tl:G?G.tl:1,xp:G?G.xp:0,co:G?G.coins:0}}
function ach(k){if(!G||G.ach[k])return;G.ach[k]=1;save()}

/* ---------- startscherm ---------- */
function home(){musicStop();var p=MW.profile.get();
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(ID),lk=MW.pro.locked(ID),playedToday=(p.games.bs&&p.games.bs.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;$("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  $("#name").value=NAME;voiceBtn();
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});$$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===LEVEL)});$$("#dur button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});
  show("home")}
function voiceBtn(){var b=$("#bVoice");if(b){b.textContent=(VOICE?"🔊 ":"🔇 ")+T.voice;b.setAttribute("aria-pressed",VOICE)}}
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MODE=b.dataset.m;LS.set("ss_bs_mode",MODE);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#lvl").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;LEVEL=b.dataset.l;LS.set("ss_bs_level",LEVEL);$$("#lvl button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#dur").addEventListener("click",function(e){var b=e.target.closest("button");if(!b||!LENS[b.dataset.n])return;LEN=b.dataset.n;LS.set("ss_bs_len",LEN);$$("#dur button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_bs_name",NAME)});
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_bs_voice",VOICE);voiceBtn();toast(VOICE?T.voiceOn:T.voiceOff);if(VOICE)say(T.voiceOn);else hush()};
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(hashStr("bs|"+MODE+"|"+LEVEL+"|"+MW.today()),MODE,true,LENS[LEN])};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(Math.floor(Math.random()*4e9),MODE,false,LENS[LEN])};
$("#bPro").onclick=proSheet;
$("#bDemo").onclick=function(){var w=ehvWorld();build(Math.floor(Math.random()*4e9),"demo",w.pois,w.ways,null,false,LENS[LEN])};
$("#bHow").onclick=function(){sheet('<h2>'+T.howH+'</h2>'+$("#howT").innerHTML+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet};
$("#bResume").onclick=function(){var g0=null;try{g0=fixG(LS.get(GK,null))}catch(e){g0=null}G=g0;if(!G){LS.del(GK);return home()}LEVEL=G.lvl||LEVEL;W=LS.get(WK,[]);P={x:G.px||0,y:G.py||0,acc:0};enter()};
$("#bCode").onclick=function(){codeSheet("")};$("#bArch").onclick=archSheet;$("#bWipe").onclick=wipeSheet;
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};

/* ---------- proefronde: de binnenstad van Eindhoven ---------- */
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
  var Q=[["kerk","Catharinakerk",150,120],["kunst","Van Abbemuseum",395,505],["bieb","Bibliotheek in De Witte Dame",-345,-360],["kunst","Philips Museum",-430,-240],["cafe","Café op Stratumseind",235,270],["cafe","Café aan de Markt",55,-70],["park","Stadswandelpark",190,600],["halte","Station Eindhoven Centraal",90,-620],
    ["halte","Bushalte Vestdijk",335,-160],["winkel","De Bijenkorf",-100,-215],["winkel","Winkelcentrum Heuvel",-230,-50],["post","Brievenbus Rechtestraat",30,-180],["hotel","Hotel aan het 18 Septemberplein",110,-330],["apotheek","Apotheek Kleine Berg",-210,180],["bankje","Bankje aan de Dommel",480,200],["school","School aan de Vestdijk",380,-380],["bank","Bank aan de Vestdijk",290,40],["kunst","Kunstwerk op het Wilhelminaplein",-360,170]];
  return{ways:ways,pois:Q.map(function(q){return{type:q[0],name:q[1],x:q[2],y:q[3]}})}}

/* ---------- binnen: stappen ---------- */
var St=MW.Steps,INK=LS.get("ss_bs_in",{kind:"sensor",spm:100});
function inSheet(cb){var sens=St&&St.supported(),IN=T.kv;
  sheet('<h2>'+esc(IN.inH)+'</h2><p>'+esc(IN.inT)+'</p>'+(sens?'<button type="button" class="btn" id="inS">'+esc(IN.inSensor)+'</button>':'')+'<button type="button" class="btn'+(sens?' ghost dk':'')+'" id="inT">'+esc(IN.inTempo)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;if(sens)$("#inS").onclick=function(){St.ask().then(function(ok){closeSheet();if(!ok)toast(IN.inNoSensor);cb(ok?"sensor":"tempo",100)})};$("#inT").onclick=function(){closeSheet();cb("tempo",100)}}
function startIn(seed,daily,n){inSheet(function(kind,spm){INK={kind:kind,spm:spm};LS.set("ss_bs_in",INK);build(seed,"in",null,null,null,daily,n,true)})}
function stepIn(k){if(!G||G.mode!=="in")return;G.in.steps+=k;var open=G.st.filter(function(s){return !s.done}),t=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;t=s}});if(!t)return;var d=dTo(t),m=k*G.in.sl;if(d<=m){P.x=t.x;P.y=t.y;G.dist+=d}else{P.x+=(t.x-P.x)/d*m;P.y+=(t.y-P.y)/d*m;G.dist+=m}}
function startSteps(){if(!St||!G||G.mode!=="in")return;St.start({mode:G.in.kind,spm:G.in.spm,onStep:stepIn,active:function(){return !!G&&G.mode==="in"&&!$("#play").hidden&&$("#sheet").hidden&&$("#hide").hidden},onDead:function(){if(!G||G.mode!=="in")return;G.in.kind="tempo";save();toast(T.kv.inNoSensor);startSteps()}});St.awake(true)}
function stopSteps(){if(St){St.stop();St.awake(false)}}

/* ---------- een zaak beginnen ---------- */
function begin(seed,mode,daily,n){if(mode==="in")return startIn(seed,daily,n);if(mode!=="map")return build(seed,mode,null,null,null,daily,n);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      if(!w.pois||!w.pois.length)return buildVirt(seed,"map",w.origin,daily,n);
      build(seed,"map",w.pois,w.ways,w.origin,daily,n);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})},function(){Wk.loading("");var kx=111320*Math.cos(lat*Math.PI/180);buildVirt(seed,"map",{lat:lat,lon:lon,kx:kx,ky:110540},daily,n)})
  }).catch(function(e){Wk.loading("");noMapSheet(seed,daily,e==="nogps"?T.noGps:T.denied,n)})}
function buildVirt(seed,mode,origin,daily,n){build(seed,mode,null,null,origin,daily,n,true);if(G&&mode==="map")toast(T.kv.virtOut)}
function noMapSheet(seed,daily,why,n){sheet('<h2>'+T.kv.noMapQ+'</h2>'+(why?'<p class="note">'+esc(why)+'</p>':'')+'<p>'+esc(T.kv.noMapT)+'</p><button type="button" class="btn" id="nmGo">'+T.kv.noMapGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet;$("#nmGo").onclick=function(){closeSheet();MODE="street";LS.set("ss_bs_mode",MODE);build(seed,"street",null,null,null,daily,n)}}
function dropMap(){if(!G||G.mode==="street")return;Wk.stopWatch();KM.leave();stopSteps();G.virt=false;G.mode="street";G.i=0;while(G.ph[G.i])G.i++;G.st=null;save();show("cards");render();toast(T.kv.switched)}
/* verhaalkaart-plekken: elke stop staat op de plek die bij zijn opdracht hoort */
function virtSpots(c){return c.slots.map(function(s,i){var k=ACTS.indexOf(s.act),f=FP[k];return{x:Math.round((f.x-START.x)*VSC),y:Math.round((f.y-START.y)*VSC),type:"hoek",name:T.kv.fp[k],fi:i,fk:k,done:false}})}
function build(seed,mode,pois,ways,origin,daily,n,virt){n=n===5||n===11?n:8;var c=genCase(seed,mode,n);
  G={seed:seed,code:makeCode(seed,mode,n),mode:mode,lvl:LEVEL,n:n,c:c,i:0,ph:[],team:null,arrest:null,t0:0,tries:0,daily:!!daily,dist:0,origin:origin,px:0,py:0,st:null,cine:false,end:null,album:[],poses:{},xp:0,coins:0,tl:1,ach:{},pu:null,av:c.av,times:[],lost:0,retries:0,fin:0};
  if(virt||mode==="in"){G.virt=true;G.st=virtSpots(c);W=[];P={x:0,y:0,acc:0};LS.set(WK,W);if(mode==="in")G.in={kind:INK.kind,spm:INK.spm,steps:0,sl:KM.stepLen(G.st,1200)}}
  else if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,R0,n,r,T.corner);
    for(var k=0;spots.length<n&&k<40;k++){var a=k*2.39996+r(),d=R0*(.35+.5*r());spots.push({x:Math.round(Math.cos(a)*d),y:Math.round(Math.sin(a)*d),type:"hoek",name:""})}
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het|the) /,"")),fi:i,fk:ACTS.indexOf(c.slots[i].act),done:false}});W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  brief()}
function brief(){var c=G.c;LEVEL=G.lvl||LEVEL;
  $("#bfNo").textContent=(G.mode==="demo"?T.demoCase+" · ":"")+T.lvl[LEVEL]+" · "+T.lens[lenOf(NN())];
  $("#bfOpen").innerHTML='<canvas class="brscene" width="320" height="180"></canvas>'+bubble(D.MAXL.open,NAMEOF("max"),"big");briefScene($("#bfOpen canvas"));
  $("#bfSus").innerHTML='<div class="eyebrow">'+esc(T.avH)+'</div><p class="note">'+esc(T.avT)+'</p><div class="avpick"><canvas id="avC" width="160" height="210"></canvas><div class="avopts"><div class="seg four" id="avCol">'+T.avC.map(function(n,i){return '<button type="button" data-i="'+i+'" style="--c:'+AVC[i]+'" aria-pressed="'+(G.av.c===i)+'">'+esc(n)+'</button>'}).join("")+'</div><div class="seg four" id="avHat">'+T.avHat.map(function(n,i){return '<button type="button" data-i="'+i+'" aria-pressed="'+(G.av.h===i)+'">'+esc(n)+'</button>'}).join("")+'</div></div></div>';
  var paint=function(){var cv=$("#avC");if(!cv)return;var g=cv.getContext("2d");g.clearRect(0,0,160,210);drawCrew(g,80,200,19,G.av,0)};paint();
  $("#avCol").onclick=function(e){var b=e.target.closest("button");if(!b)return;G.av.c=+b.dataset.i;$$("#avCol button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});paint();sfx("hit")};
  $("#avHat").onclick=function(e){var b=e.target.closest("button");if(!b)return;G.av.h=+b.dataset.i;$$("#avHat button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});paint();sfx("hit")};
  $("#bfTip").innerHTML=MW.codeBox(L,G.code,"zaak");MW.bindCodeBox($("#bfTip"),L);show("brief")}
function briefScene(cv){var g=cv.getContext("2d"),t0=0;var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=ts-t0;drawStage(g,320,180,2,NN(),t,false);
    drawPerson(g,90,170,7.5,PPL.max,t);drawPerson(g,250,170,7,Object.assign({},PPL.luna,{pose:"point"}),t);
    g.save();g.translate(170,70);g.rotate(Math.sin(t/400)*.3);g.fillStyle="#fff";rr(g,-22,-28,44,56,4);g.fill();g.fillStyle="#cbd5e1";for(var i=0;i<5;i++)g.fillRect(-15,-18+i*9,30,3);g.restore();
    g.fillStyle="#ffd166";g.font="700 16px 'Fredoka',sans-serif";g.textAlign="center";g.fillText("SETLIST?!",170,24);if(!still&&t<30000)requestAnimationFrame(f)};requestAnimationFrame(f)}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode==="map"||G.mode==="street")MW.pro.setFree(ID)}save();hush();ac();if(!G.cine){G.cine=true;save();cine(function(){photoSheet("team",enter)})}else enter()};
$("#bBack").onclick=function(){G=null;hush();home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}

/* ---------- intro: de show, de lichten, Max in paniek ---------- */
function cine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),w,h,dpr,t0=0,fin=false,raf=0;
  ov.hidden=false;var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();sfx("boot");music("map");
  var lines=T.cine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  var paper=[];for(var i=0;i<5;i++)paper.push({x:.3+i*.1,r:i*1.3,v:.6+i*.15});
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?13:(t-skipT)*14/TOTAL;g.setTransform(dpr,0,0,dpr,0,0);
    if(ph<4.2){drawStage(g,w,h,11,11,ts,true,{band:1});var s=Math.max(5,Math.min(w,h)*.022);["luna","zoe","pip","indi"].forEach(function(k,i){var o=Object.assign({},PPL[k]);o.pose=k==="luna"?"mic":k==="pip"?"drum":k==="zoe"?"guitar":"up";o.bob=true;o.ph=i*200;drawPerson(g,w*(.25+i*.17),h*.72,s,o,ts)});
      g.fillStyle="rgba(0,0,0,"+Math.max(0,Math.min(1,(ph-3.4)/.8))+")";g.fillRect(0,0,w,h)}
    else if(ph<7){g.fillStyle="#05010a";g.fillRect(0,0,w,h);var fl=Math.random()<.15?.25:0;if(fl){g.fillStyle="rgba(255,45,149,"+fl+")";g.fillRect(0,0,w,h)}
      paper.forEach(function(p,i){var pt=ph-4.2,x=w*p.x+Math.sin(pt*2+i)*w*.08+pt*w*.08,y=h*.25+pt*h*.18*p.v;g.save();g.translate(x,y);g.rotate(p.r+pt*2);g.fillStyle="#fff";g.fillRect(-14,-18,28,36);g.fillStyle="#cbd5e1";for(var k=0;k<4;k++)g.fillRect(-9,-12+k*8,18,2);g.restore()});
      g.fillStyle="#ff2d95";g.font="700 "+Math.round(Math.min(32,w*.08))+"px 'Fredoka',sans-serif";g.textAlign="center";g.fillText("SETLIST: ???",w/2,h*.72)}
    else{drawStage(g,w,h,0,11,ts,false);var s2=Math.max(7,Math.min(w,h)*.035),o2=Object.assign({},PPL.max);o2.pose=Math.floor(ph*2)%2?"wave":"idle";drawPerson(g,w*.5,h*.86,s2,o2,ts);
      if(ph>10){g.textAlign="center";g.fillStyle="#ffd166";g.shadowColor="#ff2d95";g.shadowBlur=24;var fs=Math.round(Math.min(40,w*.09));g.font="700 "+fs+"px 'Fredoka',sans-serif";g.fillText("BACKSTAGE",w/2,h*.28);g.font="700 "+Math.round(fs*.55)+"px 'Fredoka',sans-serif";g.fillStyle="#fff";g.fillText(T.subTitle,w/2,h*.28+fs);g.shadowBlur=0}}
    var li=0;while(li<lines.length-1&&t-skipT>=STARTS[li+1])li++;txt.textContent=lines[li];if(li!==spoken&&!still){spoken=li;say(lines[li])}
    if(t-skipT>TOTAL&&!still)return end();raf=requestAnimationFrame(f)};
  /* leestijd per zin: ± 15 tekens per seconde, minstens 4 s; tik op de tekst = volgende zin */
  var STARTS=[],TOTAL=0;lines.forEach(function(l){STARTS.push(TOTAL);TOTAL+=Math.max(4,l.length/15+1.5)});TOTAL+=1;var skipT=0;
  txt.style.pointerEvents="auto";txt.onclick=function(e){e.stopPropagation();var t=(performance.now()-t0)/1000-skipT,n=STARTS.filter(function(x){return x>t})[0];if(n==null)return end();skipT-=(n-t)};raf=requestAnimationFrame(f);if(still)setTimeout(end,5000)}

/* ---------- foto's ---------- */
function photoSheet(kind,then,at){photoFor={kind:kind,then:then,at:at};var team=kind==="team",pose=kind==="pose",pz=pose?D.POSE[((at||0)+G.seed)%D.POSE.length]:null,H=team?T.teamH:pose?T.poseH:T.arrestH,TX=team?T.teamT:pose?pz:T.arrestT;
  sheet('<div class="eyebrow">'+esc(H)+'</div><div class="task"><div class="ph">📸</div><div><h2>'+esc(H)+'</h2><p class="hint">'+esc(TX)+'</p></div></div><label class="btn cam" for="file">📷 '+T.shoot+'</label><p class="note" id="pMsg"></p><p class="note">'+esc(pose?T.poseNote:T.camNote)+'</p><button type="button" class="btn ghost dk" id="pSkip">'+T.skipPhoto+'</button>',true);
  say(TX);$("#pSkip").onclick=function(){closeSheet();photoFor=null;then()}}
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f||!G||!photoFor)return;var msg=$("#pMsg");
  var url=URL.createObjectURL(f),im=new Image();im.onload=function(){URL.revokeObjectURL(url);var pose=photoFor.kind==="pose",mx=pose?400:480;
    var w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,mx/Math.max(w,h)),cv=document.createElement("canvas");cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
    var data=cv.toDataURL("image/jpeg",pose?.66:.72);if(pose){G.album=G.album||[];G.album.push({u:data,at:photoFor.at||0})}else G[photoFor.kind]=data;save();buzz([40,30,80]);sfx("coin");var th=photoFor.then;closeSheet();photoFor=null;th()};
  im.onerror=function(){URL.revokeObjectURL(url);if(msg)msg.textContent=T.noFile};im.src=url});

/* ---------- spelen zonder kaart: stopkaartjes ---------- */
function enter(){LEVEL=G.lvl||LEVEL;if(G.mode==="map"||G.mode==="demo"||G.mode==="in")enterMap();else{show("cards");render();music("map")}}
function hudTxt(pre){var n=done();$("#"+pre+"T").textContent=mmss(Date.now()-G.t0);$("#"+pre+"S").textContent=n+"/"+NN();$("#"+pre+"X").textContent=G.xp;$("#"+pre+"L").textContent=G.tl;$("#"+pre+"C").textContent=G.coins}
function hud(){if(!G)return;hudTxt("h")}
function stageHTML(n){return '<div class="crys"><canvas id="crC" width="240" height="140"></canvas><div><b>'+esc(fill(T.stage,{n:n,N:NN()}))+'</b></div></div>'}
function paintStage(n){var cv=$("#crC");if(!cv)return;var g=cv.getContext("2d"),t0=0,f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;drawStage(g,240,140,n,NN(),ts,false);if(!still&&ts-t0<15000)requestAnimationFrame(f)};requestAnimationFrame(f)}
function render(){hud();while(G.i<NN()&&G.ph[G.i])G.i++;var i=G.i,box=$("#card");
  if(i>=NN()){box.innerHTML='<div class="pol done"><div class="grid">'+G.ph.map(function(p){return '<img src="'+p+'" alt="">'}).join("")+'</div></div>'+stageHTML(done())+bubble(T.radarAll,NAMEOF("max"))+'<button type="button" class="btn red" id="bAcc">'+T.toBoss+'</button>';paintStage(done());$("#bAcc").onclick=finaleGate;return}
  var s=G.c.slots[i];box.innerHTML='<div class="pol empty"><div class="world">'+esc(fill(T.world,{i:i+1}))+'</div><p class="cap">'+esc(T.kinds[s.act])+'</p></div>'+stageHTML(done())+bubble(T.pz[s.act][1],NAMEOF("max"))+'<button type="button" class="btn" id="bOpen">'+T.start+'</button>';paintStage(done());$("#bOpen").onclick=function(){taskSheet(i)}}

/* ---------- spelen met kaart ---------- */
function enterMap(){show("play");music("map");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return R0},
    theme:{bg:"#1a0433",water:"#2a1060",waterEdge:"#4c1d95",ripple:"rgba(45,212,191,.2)",park:"#2b1250",parkEdge:"#4a1d7a",river:"#2a1060",major:"#a21caf",minor:"#4c1d95",road:"#5b21b6",label:"#ffd6ec",waterLabel:"#a78bfa",ring:"rgba(255,45,149,.25)",me:"#ff2d95",meHalo:"rgba(255,45,149,.15)",meRing:"rgba(255,45,149,.7)",font:"700 11px 'Nunito',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&hit.ref.glimpse){if(GL.on)glimpseHit();return}if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(R0);sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d;lastFix=Date.now();KM.moved(d)});
  lastFix=Date.now();KM.enter({kids:true,virt:!!G.virt,map:map});stopSteps();if(G.mode==="in")startSteps();GL.next=Date.now()+45000+Math.random()*45000;if(G.mode==="demo")toast(T.demoTip);requestAnimationFrame(loop)}
/* verhaalkaart: het festivalterrein. Elke opdracht heeft zijn eigen plek (index = ACTS) */
var START={x:500,y:1300},VSC=.42,FP=[{x:230,y:1060,k:"tent"},{x:300,y:560,k:"dans"},{x:540,y:360,k:"merch"},{x:770,y:450,k:"brug"},{x:150,y:790,k:"fan"},{x:860,y:720,k:"ticket"},{x:720,y:980,k:"geluid"},{x:500,y:790,k:"food"},{x:150,y:330,k:"booth"},{x:880,y:1080,k:"truck"},{x:610,y:1160,k:"lounge"},{x:840,y:230,k:"meng"}];
var ROADS=[[-1,0],[-1,10],[0,4],[4,8],[8,1],[1,2],[2,3],[3,11],[2,11],[3,5],[5,6],[6,9],[9,10],[10,6],[7,1],[7,5],[7,0],[7,6],[0,10]];
var LMIMG={merch:"rack",brug:"lightsbar",geluid:"speakerstack",meng:"djdeck",truck:"case"};
function landmark(g,k,x,y,s){if(LMIMG[k]){var im=img(LMIMG[k]);if(im){var h=s*(k==="geluid"?2.1:1.6),w=h*im.width/im.height;g.drawImage(im,x-w/2,y-h,w,h);return}}g.save();g.lineJoin="round";
  if(k==="tent"){g.fillStyle="#ff2d95";g.beginPath();g.moveTo(x-s*.8,y);g.lineTo(x,y-s*1.1);g.lineTo(x+s*.8,y);g.closePath();g.fill();g.fillStyle="#ffb3d9";g.beginPath();g.moveTo(x-s*.2,y);g.lineTo(x,y-s*.6);g.lineTo(x+s*.2,y);g.closePath();g.fill();g.fillStyle="#ffd166";sparkle(g,x,y-s*1.2,s*.18,"#ffd166",0)}
  else if(k==="dans"){g.fillStyle="#2a2342";g.fillRect(x-s*.8,y-s*.3,s*1.6,s*.3);for(var i=0;i<4;i++){g.fillStyle=["#ff2d95","#ffd166","#2dd4bf","#a78bfa"][i];g.fillRect(x-s*.75+i*s*.38,y-s*.28,s*.34,s*.24)}drawItem(g,6,x,y-s*.95,s*.3)}
  else if(k==="merch"){g.fillStyle="#f8fafc";g.fillRect(x-s*.6,y-s*.65,s*1.2,s*.65);for(i=0;i<6;i++){g.fillStyle=i%2?"#ff2d95":"#fff";g.fillRect(x-s*.65+i*s*.22,y-s*.82,s*.22,s*.18)}g.fillStyle="#a78bfa";g.beginPath();g.moveTo(x-s*.35,y-s*.55);g.lineTo(x-s*.1,y-s*.55);g.lineTo(x-s*.1,y-s*.2);g.lineTo(x-s*.35,y-s*.2);g.fill();g.fillStyle="#2dd4bf";g.fillRect(x+s*.1,y-s*.55,s*.25,s*.35)}
  else if(k==="brug"){g.strokeStyle="#94a3b8";g.lineWidth=s*.08;g.strokeRect(x-s*.8,y-s*.9,s*1.6,s*.22);g.beginPath();g.moveTo(x-s*.75,y-s*.68);g.lineTo(x-s*.75,y);g.moveTo(x+s*.75,y-s*.68);g.lineTo(x+s*.75,y);g.stroke();for(i=0;i<4;i++){var c=["#ff2d95","#ffd166","#2dd4bf","#a78bfa"][i];g.fillStyle=c;g.shadowColor=c;g.shadowBlur=10;g.beginPath();g.arc(x-s*.5+i*s*.33,y-s*.58,s*.1,0,7);g.fill()}g.shadowBlur=0}
  else if(k==="fan"){g.fillStyle="#ffd166";g.fillRect(x-s*.05,y-s*1.2,s*.1,s*1.2);heart(g,x,y-s*1.1,s*.8,"#ff2d95");g.fillStyle="#ffb3d9";g.beginPath();g.ellipse(x,y,s*.7,s*.15,0,0,7);g.fill()}
  else if(k==="ticket"){g.fillStyle="#a21caf";g.fillRect(x-s*.7,y-s*.9,s*.22,s*.9);g.fillRect(x+s*.48,y-s*.9,s*.22,s*.9);g.fillRect(x-s*.75,y-s*1.05,s*1.5,s*.2);g.fillStyle="#ffd166";rr(g,x-s*.35,y-s*.65,s*.7,s*.35,s*.06);g.fill();g.fillStyle="#a21caf";g.fillRect(x-s*.05,y-s*.65,s*.04,s*.35)}
  else if(k==="geluid"){g.fillStyle="#334155";g.fillRect(x-s*.25,y-s*1.4,s*.5,s*1.4);g.fillStyle="#111827";for(i=0;i<3;i++){g.beginPath();g.arc(x,y-s*1.2+i*s*.42,s*.15,0,7);g.fill()}}
  else if(k==="food"){g.fillStyle="#fb923c";rr(g,x-s*.75,y-s*.75,s*1.5,s*.6,s*.12);g.fill();g.fillStyle="#fff";g.fillRect(x-s*.5,y-s*.65,s*.6,s*.28);g.fillStyle="#1f2937";g.beginPath();g.arc(x-s*.45,y-s*.12,s*.15,0,7);g.arc(x+s*.45,y-s*.12,s*.15,0,7);g.fill();g.fillStyle="#ffd166";g.font="700 "+Math.round(s*.22)+"px 'Fredoka',sans-serif";g.textAlign="center";g.fillText("FRIET",x+s*.38,y-s*.42)}
  else if(k==="booth"){g.fillStyle="#2dd4bf";rr(g,x-s*.45,y-s*1.1,s*.9,s*1.1,s*.1);g.fill();g.fillStyle="#ff2d95";g.fillRect(x-s*.45,y-s*.75,s*.9,s*.12);g.fillStyle="#1f2937";g.beginPath();g.arc(x,y-s*.95,s*.1,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.arc(x+s*.25,y-s*.95,s*.05,0,7);g.fill()}
  else if(k==="truck"){g.fillStyle="#475569";rr(g,x-s*.8,y-s*.75,s*1.15,s*.6,s*.08);g.fill();g.fillStyle="#64748b";rr(g,x+s*.38,y-s*.55,s*.42,s*.4,s*.08);g.fill();g.fillStyle="#1f2937";g.beginPath();g.arc(x-s*.5,y-s*.12,s*.15,0,7);g.arc(x+s*.55,y-s*.12,s*.15,0,7);g.fill();g.strokeStyle="#ff2d95";g.lineWidth=s*.06;g.beginPath();g.moveTo(x-s*.7,y-s*.5);g.quadraticCurveTo(x-s*.3,y-s*.3,x,y-s*.55);g.stroke()}
  else if(k==="lounge"){g.fillStyle="#a78bfa";rr(g,x-s*.7,y-s*.45,s*1.4,s*.45,s*.15);g.fill();rr(g,x-s*.7,y-s*.75,s*1.4,s*.35,s*.15);g.fill();g.fillStyle="#ffd166";g.fillRect(x-s*.8,y-s*1.15,s*1.6,s*.3);g.fillStyle="#14052b";g.font="700 "+Math.round(s*.22)+"px 'Fredoka',sans-serif";g.textAlign="center";g.fillText("VIP",x,y-s*.93)}
  else if(k==="meng"){g.fillStyle="#1f2937";rr(g,x-s*.75,y-s*.6,s*1.5,s*.6,s*.1);g.fill();for(i=0;i<5;i++){g.fillStyle="#94a3b8";g.fillRect(x-s*.6+i*s*.3,y-s*.5,s*.04,s*.4);g.fillStyle=["#ff2d95","#ffd166","#2dd4bf","#a78bfa","#fff"][i];g.fillRect(x-s*.64+i*s*.3,y-s*.4+((i*7)%3)*s*.1,s*.12,s*.07)}}
  g.restore()}
var KM=MW.KidsMap.create({T:T.kv,go:function(s){walkTo={x:s.x,y:s.y};sel=null},G:function(){return G},P:function(){return P},dTo:function(s){return dTo(s)},virt:function(){return !!(G&&G.virt)},mode:function(){return G&&G.mode},
  map:{W:1000,H:1400,start:START,spots:FP,roads:ROADS,vsc:VSC,sky:"#12021f",land:"#2e0b52",road:"#5b21b6",roadLine:"#ffb3d9",label:"#fff1f8",labelHalo:"rgba(26,4,51,.9)",heroHalo:"rgba(255,45,149,.22)"},
  draw:{mark:function(g,x,y,r,col){sparkle(g,x,y,r*1.3,col,0)},
    ground:function(g,t){g.fillStyle="rgba(255,179,217,.05)";for(var i=0;i<60;i++){var q=(i*9301+49297)%233280/233280,q2=(i*4271+1013)%997/997;g.fillRect(80+q*840,140+q2*1120,3,3)}},
    decor:function(g,t){var tt=still?0:t;/* hoofdpodium bovenaan */g.save();g.translate(500,170);g.fillStyle="#14052b";g.fillRect(-170,-60,340,70);g.fillStyle="#2a2342";g.fillRect(-190,10,380,24);g.fillStyle="#ff2d95";rr(g,-90,-110,180,44,8);g.fill();g.fillStyle="#fff";g.font="700 32px 'Fredoka',sans-serif";g.textAlign="center";g.fillText("NOVA",0,-78);
      [-1,1].forEach(function(s,i){g.save();g.translate(s*160,-60);g.rotate(Math.sin(tt/900+i)*.3*s);g.fillStyle=i?"rgba(45,212,191,.18)":"rgba(255,45,149,.18)";g.beginPath();g.moveTo(-6,0);g.lineTo(6,0);g.lineTo(80,180);g.lineTo(-80,180);g.closePath();g.fill();g.restore()});g.restore();
      [[80,1200],[930,560],[60,560],[940,1240],[330,1250],[420,640],[640,620],[380,250],[660,250]].forEach(function(p,i){g.fillStyle="#475569";g.fillRect(p[0]-3,p[1]-60,6,60);g.fillStyle=["#ff2d95","#ffd166","#2dd4bf","#a78bfa"][i%4];g.shadowColor=g.fillStyle;g.shadowBlur=14;g.beginPath();g.arc(p[0],p[1]-64,9,0,7);g.fill();g.shadowBlur=0});
      g.strokeStyle="rgba(255,255,255,.35)";g.lineWidth=2;for(var j=0;j<3;j++){g.beginPath();g.moveTo(330,640+j*4);g.quadraticCurveTo(530,700,640,620+j*4);g.stroke()}},
    start:function(g,x,y){g.fillStyle="#a21caf";g.fillRect(x-160,y-110,22,110);g.fillRect(x+138,y-110,22,110);g.fillStyle="#ff2d95";rr(g,x-175,y-150,350,50,10);g.fill();g.fillStyle="#fff";g.font="700 30px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(T.kv.gate,x,y-114)},
    landmark:landmark,
    hero:function(g,x,y,t){drawCrew(g,x,y+6,6.5,G.av,t)},
    runner:function(g,fx,fy,t){if(GL.on)return;var aa=t/2000;bagDraw(g,fx+Math.cos(aa)*90,fy+30+Math.abs(Math.sin(aa*2))*-25,22,t)},
    overlay:function(g,w,h,t){if(!GL.on)return false;var gt=(t-GL.t0)/1000,gx=GL.dir>0?-80+gt/4*(w+160):w+80-gt/4*(w+160),gy=h*.5;GL.x=gx;GL.y=gy;bagDraw(g,gx,gy,Math.max(30,h*.06),t);if(gt>4){GL.on=false;KM.setMsg("");toast(T.glimpseNo);return false}KM.setMsg(T.glimpse);return true}},
  onTap:function(x,y){if(!GL.on)return;if(Math.hypot(x-GL.x,y-GL.y)<80)glimpseHit()}});
KM.mount();
/* de tas van Pip die voorbij schiet */
function bagDraw(g,x,y,s,t){if(img("bag")){g.save();g.translate(x,y);g.rotate(still?0:Math.sin((t||0)/150)*.15);fit(g,"bag",0,0,s*2.4,s*2.4);g.restore();return}g.save();g.translate(x,y);g.rotate(still?0:Math.sin((t||0)/150)*.15);g.fillStyle="#5b21b6";rr(g,-s*.6,-s*.45,s*1.2,s*.9,s*.2);g.fill();g.strokeStyle="#5b21b6";g.lineWidth=s*.1;g.beginPath();g.arc(0,-s*.45,s*.35,Math.PI,0);g.stroke();
  var gc=G&&G.c?GC[G.c.sus[G.c.K].glit]:"#ffd166";for(var i=0;i<6;i++)sparkle(g,-s*.4+i*s*.16,-s*.1+(i%2)*s*.25,s*.1,gc,i+(t||0)/200);g.fillStyle="#fff";g.save();g.rotate(-.3);g.fillRect(s*.2,-s*.85,s*.35,s*.45);g.restore();g.restore()}
function glimpseHit(){GL.on=false;G.gl=(G.gl||0)+1;G.coins+=10;save();buzz([40,30,80]);sfx("coin");KM.setMsg("");toast(fill(T.glimpseYes,{n:10}))}
function glimpseTick(){return;if(GL.on||!G||(G.gl||0)>=3||!$("#sheet").hidden||Date.now()<GL.next)return;var open=G.st.filter(function(s){return !s.done});if(!open.length)return;if(!KM.on()&&G.mode!=="demo")return;GL.on=true;GL.t0=performance.now();GL.dir=Math.random()<.5?1:-1;GL.next=Date.now()+70000+Math.random()*60000;say(T.glimpse);sfx("whoosh");buzz([30,40,30])}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[],open=G.st.filter(function(s){return !s.done});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var col=["#ff2d95","#2dd4bf","#ffd166","#a78bfa"][s.fi%4];
    if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=3;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*24,0,7);cx.stroke();cx.globalAlpha=1}
    cx.fillStyle=s.done?"#4b5563":"#1a0433";cx.beginPath();cx.arc(X,Y,17,0,7);cx.fill();cx.strokeStyle=s.done?"#9ca3af":col;cx.lineWidth=3;cx.stroke();
    cx.fillStyle=s.done?"#d1d5db":col;cx.font="700 15px 'Fredoka',sans-serif";cx.textAlign="center";cx.textBaseline="middle";cx.fillText(s.done?"✓":String(s.fi+1),X,Y+1);cx.textBaseline="alphabetic";
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,25,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#9ca3af":"#ffe4f2";cx.font="700 11px 'Nunito',sans-serif";if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+34)}})});
  if(GL.on&&!KM.on()){var gt=(performance.now()-GL.t0)/1000,gref={x:P.x+(GL.dir>0?-220+gt*110:220-gt*110),y:P.y+90,glimpse:true};it.push({x:gref.x,y:gref.y,ref:gref,tap:true,draw:function(cx,X,Y,t){bagDraw(cx,X,Y,26,t)}});if(gt>4){GL.on=false;toast(T.glimpseNo)}}
  if(open.length){var near=open.reduce(function(a,s){return dTo(s)<dTo(a)?s:a});it.push({x:near.x,y:near.y,tap:false,draw:function(cx,X,Y,t,api){var a=t/2000,rx=50*api.V.s+30;for(var i=0;i<4;i++)sparkle(cx,X+Math.cos(a+i*1.57)*rx,Y+Math.sin(a+i*1.57)*rx*.6,5,GC[i%3],t/300)}})}
  return it}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=110*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  if(!KM.draw(t))map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tickMap();glimpseTick()}requestAnimationFrame(loop)}
function tickMap(){hudTxt("m");var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});
  $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);sfx("coin")}if(!here)arrived=null;
  chip();var el=Math.floor((Date.now()-G.t0)/1000);if(el%10===0)save();if(G.mode==="map"&&!G.virt&&lastFix&&Date.now()-lastFix>45000){lastFix=Date.now();toast(T.kv.gpsLost)}
  if(open.length&&$("#sheet").hidden&&!here&&Date.now()-(G.lastVisit||G.t0)>80000)visit()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel),act=G.c.slots[sel.fi].act;
  $("#cName").textContent=fill(T.world,{i:sel.fi+1})+" · "+sel.name;$("#cDist").textContent=Math.round(d)+" m";$("#cHint").textContent=T.kinds[act];
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))taskSheet(sel.fi,sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;taskSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mPeople").onclick=lvlSheet;$("#mAcc").onclick=function(){if(done()>=NN())finaleGate();else noteSheet()};
$("#bNote").onclick=noteSheet;$("#bPeople").onclick=lvlSheet;$("#bAcc2").onclick=function(){if(done()>=NN())finaleGate();else noteSheet()};

/* ---------- de band kaapt het scherm ---------- */
function visit(force){if(!G)return;G.lastVisit=Date.now();if(!force&&Math.random()<.35)return;var k=(G.vi==null?G.seed:G.vi+1)%D.HIJACK.length;G.vi=k;save();
  if(!$("#sheet").hidden)return;sfx("drum");buzz([30,30,30,30,120]);var h=D.HIJACK[k];
  sheet('<div class="hijack"><div class="eyebrow">'+esc(T.hijackH)+'</div>'+bubble(h[1],NAMEOF(h[0]),"big",AV(h[0]))+'<button type="button" class="btn" id="hjX">'+esc(T.hijackX)+'</button></div>',true);
  say(h[1]);$("#hjX").onclick=function(){sfx("hit");closeSheet();if(G.mode==="map"||G.mode==="demo"||G.mode==="in")chip();else render()}}

/* ---------- een stop: opdracht → puzzel → SPOT ON ---------- */
function taskSheet(i,spot){walkTo=null;if(G.mode==="demo"&&!G.ph[i]&&done()>=(window.MMTrial?MMTrial.max:2)&&window.MMTrial){var _GK=GK;return MMTrial.end({buy:proSheet,home:function(){leavePlay();try{localStorage.removeItem(_GK)}catch(e){}}})}var s=G.c.slots[i];cur={i:i,spot:spot||null,h:3,t0:Date.now(),retries:cur&&cur.i===i?cur.retries:0,pu:G.pu,stat:{}};
  if(cur.pu){G.pu=null;save();if(cur.pu==="shield")cur.shield=true;if(cur.pu==="hint")cur.freeHint=true;if(cur.pu==="time")cur.extra=hard()?10:15}
  var I=T.pz[s.act],head='<div class="eyebrow">'+esc(fill(T.world,{i:i+1}))+' · '+esc(T.kinds[s.act])+(spot?' · '+esc(spot.name):'')+'</div><div class="pzh"><div class="hearts" id="pzH"></div><div class="pzinfo"><b id="pzTm"></b></div></div>';
  sheet(head+'<h2>'+esc(I[0])+'</h2>'+bubble(I[1],NAMEOF(I[2]||"max"),"small",AV(I[2]||"max"))+(cur.pu?'<p class="note pu">⚡ '+esc(fill(T.puOn,{p:T.pu[cur.pu][0]}))+'</p>':'')+'<div id="pz"></div><div id="pzB"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){G.force=null;closeSheet()};paintHearts();say(I[1]);
  var fin=false,o={box:$("#pz"),rng:rngOf(G.seed*7+i*131),hard:hard(),extra:cur.extra||0,
    done:function(){if(fin)return;fin=true;mg.stop();cur.secs=Math.round((Date.now()-cur.t0)/1000);cur.thumb=thumb(i,s.act);accept()},
    canvas:function(hh){o.box.innerHTML='<canvas class="sq" width="280" height="'+(hh||280)+'"></canvas>';var c=o.box.firstChild;if(hh)c.style.aspectRatio="280/"+hh;return c},
    at:function(e,c){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*280,(e.clientY-b.top)/b.height*(c.height)]},
    msg:function(t){var m=$("#pzM");if(!m){m=document.createElement("p");m.id="pzM";m.className="pzst";o.box.appendChild(m)}m.textContent=t},
    say:say,good:function(){buzz(60);sfx("coin")},hit:function(){sfx("hit")},flag:function(k){cur.stat[k]=1},
    bad:function(){if(fin)return false;if(cur.shield){cur.shield=false;toast(T.shieldUsed);sfx("hit");return false}cur.h--;G.lost++;paintHearts();buzz(120);sfx("hurt");if(cur.h<=0){dead();return true}toast(T.heartsLost);return false},
    dead:function(){return !cur.h},
    timer:function(sec,onEnd){sec+=o.extra;var el=$("#pzTm"),t0=Date.now(),iv=setInterval(function(){var left=Math.max(0,sec-(Date.now()-t0)/1000);el.textContent="⏱ "+Math.ceil(left);el.classList.toggle("low",left<8);if(left<=0){clearInterval(iv);onEnd&&onEnd()}},200);mg.iv.push(iv);return{left:function(){return Math.max(0,sec-(Date.now()-t0)/1000)},stop:function(){clearInterval(iv);el.textContent=""}}},
    hint:function(fn){var b=document.createElement("button");b.type="button";b.className="btn ghost dk sm hintb";b.textContent="💡 "+T.hint1;$("#pzB").appendChild(b);
      b.onclick=function(){cur.hinted=1;save();sfx("coin");fn()}}};
  if(/debug/.test(location.search))window.BS_DBG=o;
  if(window.MMP)MMP.helper(function(){G.t0-=120000;G.skips=(G.skips||0)+1;cur.h=1;save();o.done()},function(){say(I[1])});
  PUZ[s.act](o)}
function paintHearts(){var e=$("#pzH");if(!e||!cur)return;e.innerHTML="";for(var i=0;i<3;i++){var s=document.createElement("i");if(i<cur.h)s.className="on";e.appendChild(s)}}
function dead(){mg.stop();var box=$("#pz");box.innerHTML='<div class="deadbox"><b>'+esc(T.deadH)+'</b><p>'+esc(T.dead)+'</p><button type="button" class="btn" id="pzR">'+esc(T.retry)+'</button></div>';$("#pzB").innerHTML="";sfx("bad");say(T.dead);
  $("#pzR").onclick=function(){var i=cur.i,sp=cur.spot;cur.retries++;G.retries++;save();var keep=cur;taskSheet(i,sp);cur.retries=keep.retries}}
function thumb(i,act){var cv=document.createElement("canvas");cv.width=cv.height=240;var g=cv.getContext("2d");drawStage(g,240,240,Math.min(NN(),done()+1),NN(),0,false);g.fillStyle="rgba(20,5,43,.55)";g.fillRect(0,0,240,74);g.fillStyle="#ffd166";g.font="700 20px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(fill(T.world,{i:i+1}).toUpperCase(),120,32);g.fillStyle="#fff";g.font="700 15px 'Nunito',sans-serif";g.fillText(T.kinds[act],120,58);drawCrew(g,120,232,13,G.av,0,"up");return cv.toDataURL("image/png")}
function accept(){var i=cur.i,s=G.c.slots[i];G.ph[i]=cur.thumb;if(cur.spot){cur.spot.done=true;cur.spot.doneAt=Date.now();G.kd0=null}G.force=null;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;
  var secs=cur.secs,xp=100+cur.h*20+(secs<60?30:0)-Math.min(60,cur.retries*20);if(cur.pu==="xp2")xp*=2;var coins=s.coins+cur.h*5;if(cur.pu==="coin2")coins*=2;
  var oldL=G.tl;G.xp+=xp;G.coins+=coins;G.tl=rankOf(G.xp);G.times.push(secs);save();buzz([40,30,80]);sfx("clear");
  if(cur.h===3&&!cur.retries)ach("flawless");if(secs<45)ach("speed");if(G.coins>=150)ach("rich");if(G.tl===10)ach("max");Object.keys(cur.stat).forEach(ach);
  var n=done(),N=NN(),last=n>=N,el=PRIO[Math.min(10,n-1)],rew='',said=[];
  rew+='<div class="rew"><canvas class="itc" data-k="'+el+'" width="80" height="80"></canvas><p>'+esc(fill(T.itemT,{it:D.ITEMS[el][0],on:D.ITEMS[el][1]}))+'</p></div>';said.push(fill(T.itemT,{it:D.ITEMS[el][0],on:D.ITEMS[el][1]}));
  if(s.sg>=0){var st=songText(s.sg);rew+='<div class="rew"><div class="snip"><small>SETLIST</small>'+esc(songAt(G.c.so[s.sg]).t)+'</div><p>'+esc(st)+'</p></div>';said.push(st);G.sn=G.sn||{};if(!G.sn.s){G.sn.s=1;rew+='<p class="why">'+esc(T.sgT)+'</p>';said.push(T.sgT)}}
  if(s.e>=0){var e=G.c.ev[s.e],et=fill(e.t,{v:D.AT[e.k].v[e.v]});rew+='<div class="rew"><canvas class="evc" data-k="'+e.k+'" data-v="'+e.v+'" width="80" height="80"></canvas><p>'+esc(et)+'</p></div>';said.push(et);G.sn=G.sn||{};if(!G.sn.e){G.sn.e=1;rew+='<p class="why">'+esc(T.evT)+'</p>';said.push(T.evT)}}
  if(s.w>=0){var w=G.c.wits[s.w],wt=witText(w);rew+='<div class="rew">'+bubble(wt,NAMEOF(WITK[w.p])+" · "+D.PEOPLE[WITK[w.p]][1],"small",AV(WITK[w.p]))+'</div>';said.push(wt);G.sn=G.sn||{};if(!G.sn.w){G.sn.w=1;rew+='<p class="why">'+esc(T.witT)+'</p>';said.push(T.witT)}}
  var cliff=last?D.MAXL.cliffLast:D.MAXL.cliff[(n-1+G.seed)%D.MAXL.cliff.length],react=fill(D.MAXL.react[(n+G.seed)%D.MAXL.react.length],{m:minsLeft()});
  sheet('<div class="clear"><div class="eyebrow">'+esc(fill(T.world,{i:i+1}))+'</div><h2 class="big">'+esc(T.clear)+'</h2><canvas id="clC" width="320" height="180"></canvas>'+
    '<div class="rep"><em>'+esc(T.found1)+'</em>'+rew+'</div>'+
    '<div class="msg small">'+AV("max")+'<div class="bub"><p>'+esc(react)+'</p></div></div><p class="cliff">'+esc(cliff)+'</p><button type="button" class="btn" id="bNext">'+(last?T.toBoss:T.next)+'</button></div>',true);
  clearAnim($("#clC"),n);
  $$("#sheetBody .evc").forEach(function(cv){evDraw(cv.getContext("2d"),cv.dataset.k,+cv.dataset.v)});$$("#sheetBody .itc").forEach(function(cv){var g=cv.getContext("2d");g.fillStyle="#2a0a4a";rr(g,0,0,80,80,12);g.fill();drawItem(g,+cv.dataset.k,40,44,18)});
  say(T.clear+". "+said.join(" ")+" "+react+" "+cliff);
  $("#bNext").onclick=function(){closeSheet();sel=null;cur=null;var goOn=function(){if(G.mode==="map"||G.mode==="demo"||G.mode==="in"){chip();if(last)finaleGate()}else{render();if(last)finaleGate()}};
    var pa=(POSE_AT[N]||[]);if(pa.indexOf(n)>=0&&!G.poses[n]){G.poses[n]=1;save();return photoSheet("pose",function(){if(Object.keys(G.poses).length>=pa.length&&(G.album||[]).length>=pa.length)ach("photo");goOn()},n)}goOn()}}
/* memory: husselen tot geen enkel paar naast of onder elkaar ligt */
function spreadPairs(c,cols,r){for(var t=0;t<300;t++){var bad=false;for(var i=0;i<c.length&&!bad;i++){if(i%cols<cols-1&&c[i]===c[i+1])bad=true;if(i+cols<c.length&&c[i]===c[i+cols])bad=true}if(!bad)return c;c=shuffle(c,r)}return c}
function countUp(el,v){var t0=performance.now(),f=function(ts){var p=Math.min(1,(ts-t0)/900);el.textContent=Math.round(v*p);if(p<1&&!still)requestAnimationFrame(f);else el.textContent=v};requestAnimationFrame(f)}
function clearAnim(cv,n){var g=cv.getContext("2d"),t0=0;var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=(ts-t0)/1000;drawStage(g,320,180,n,NN(),ts,true);drawCrew(g,250,170,6.5,G.av,still?0:ts,Math.floor(t*2)%2?"up":"wave");
    if(t<1.2){g.fillStyle="rgba(255,255,255,"+(1-t/1.2)*.5+")";g.fillRect(0,0,320,180)}if(!still&&t<20)requestAnimationFrame(f)};requestAnimationFrame(f)}

/* ---------- de puzzels ---------- */
function rand(o,a,b){return a+Math.floor(o.rng()*(b-a+1))}
function stageBg(g,w,h,ts){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,"#1a0433");gr.addColorStop(1,"#3b0764");g.fillStyle=gr;g.fillRect(0,0,w,h);if(!still){g.fillStyle="rgba(255,45,149,.07)";g.beginPath();var a=Math.sin((ts||0)/1200)*.4;g.moveTo(w/2,0);g.lineTo(w/2+Math.sin(a)*w-80,h);g.lineTo(w/2+Math.sin(a)*w+80,h);g.fill()}}
var PUZ={
/* 1 glitterspoor: veeg het stof weg, vind de hartjes-stickers */
glitter:function(o){var cv=o.canvas(300),g=cv.getContext("2d"),N=o.hard?7:5,got=0,mask=document.createElement("canvas");mask.width=280;mask.height=300;var mg2=mask.getContext("2d");mg2.fillStyle="#3a2f4a";mg2.fillRect(0,0,280,300);
  var q=rngOf(o.rng()*1e9|0);mg2.fillStyle="rgba(255,255,255,.06)";for(var i=0;i<400;i++)mg2.fillRect(q()*280,q()*300,2,2);
  var gc=GC[G.c.sus[G.c.K].glit],stk=[],dots=[];for(i=0;i<N;i++){var x,y,ok,tr=0;do{x=30+q()*220;y=30+q()*240;ok=stk.every(function(s){return Math.hypot(s.x-x,s.y-y)>55});tr++}while(!ok&&tr<50);stk.push({x:x,y:y,on:true})}
  for(i=0;i<160;i++)dots.push({x:q()*280,y:q()*300,r:2+q()*3,ph:q()*6});var stick={x:40+q()*200,y:40+q()*220,a:q()*3};
  o.msg(fill(T.glitN,{n:0,N:N}));
  var drawF=function(ts){g.fillStyle="#2a1a3a";g.fillRect(0,0,280,300);dots.forEach(function(d,i){sparkle(g,d.x,d.y,d.r,i%4?gc:"#fff",d.ph+(still?0:ts/600))});
    g.save();g.translate(stick.x,stick.y);g.rotate(stick.a);g.strokeStyle="#d4a373";g.lineWidth=6;g.lineCap="round";g.beginPath();g.moveTo(-40,0);g.lineTo(40,0);g.stroke();g.restore();
    stk.forEach(function(s){if(s.on){heart(g,s.x,s.y+6,30,"#ff2d95");g.fillStyle="#fff";g.beginPath();g.arc(s.x-6,s.y-4,3,0,7);g.fill()}});g.drawImage(mask,0,0)};
  var f=function(ts){drawF(ts);mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  var down=null,wipe=function(p){mg2.globalCompositeOperation="destination-out";mg2.beginPath();mg2.arc(p[0],p[1],22,0,7);mg2.fill();mg2.globalCompositeOperation="source-over"};
  var cleared=function(x,y){try{return mg2.getImageData(Math.round(x),Math.round(y),1,1).data[3]<100}catch(e){return true}};
  cv.onpointerdown=function(e){cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);var p=o.at(e,cv);down={p:p,moved:0};
    var hit=null;stk.forEach(function(s){if(s.on&&Math.hypot(s.x-p[0],s.y-p[1])<24&&cleared(s.x,s.y))hit=s});if(hit){hit.on=false;got++;o.hit();buzz(30);o.msg(fill(T.glitN,{n:got,N:N}));if(got>=N){o.good();o.done()}down=null;return}wipe(p)};
  cv.onpointermove=function(e){if(!down)return;var p=o.at(e,cv);down.moved++;wipe(p)};cv.onpointerup=cv.onpointercancel=function(){down=null};
  if(o.hard){var tm,onEnd=function(){if(o.bad())return;tm=o.timer(70,onEnd)};tm=o.timer(70,onEnd)}},
/* 2 choreo: Luna danst voor, de Crew doet het na (pijlen) */
choreo:function(o){var cv=o.canvas(240),g=cv.getContext("2d"),rounds=o.hard?[4,5,6]:[3,4,4],ri=0,seq=[],inp=[],busy=true,show=-1,crewP="idle",perfect=true,MV=["up","left","right","down"],AR=["↑","←","→","↓"];
  for(var i=0;i<6;i++)seq.push(Math.floor(o.rng()*4));
  o.box.insertAdjacentHTML("beforeend",'<div class="arrows" id="arw">'+AR.map(function(a,i){return '<button type="button" data-i="'+i+'">'+a+'</button>'}).join("")+'</div>');
  var f=function(ts){stageBg(g,280,240,ts);g.fillStyle="#2a2342";g.fillRect(0,200,280,40);var lo=Object.assign({},PPL.luna);lo.pose=show>=0?MV[show]:"idle";lo.prop="";drawPerson(g,90,205,10,lo,ts);
    drawCrew(g,200,205,9,G.av,0,crewP);g.fillStyle="#ffd166";g.font="700 14px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(NAMEOF("luna"),90,232);g.fillText("CREW",200,232);
    if(show>=0){g.fillStyle="#fff";g.font="700 34px 'Fredoka',sans-serif";g.fillText(AR[show],90,40)}mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  var play=function(){busy=true;inp=[];var len=rounds[ri],k=0;o.msg(T.choWatch+" "+fill(T.simonRound,{r:ri+1,n:rounds.length}));
    var step=function(){if(o.dead())return;if(k>=len){show=-1;busy=false;o.msg(T.choGo);return}show=seq[k];tone(392+seq[k]*98,.2,"triangle",.06);sfx("drum");k++;mg.tm.push(setTimeout(function(){show=-1;mg.tm.push(setTimeout(step,200))},o.hard?480:650))};mg.tm.push(setTimeout(step,700))};
  $("#arw").onclick=function(e){var b=e.target.closest("button");if(!b||busy)return;var i=+b.dataset.i;crewP=MV[i];setTimeout(function(){crewP="idle"},300);tone(392+i*98,.15,"triangle",.05);inp.push(i);var j=inp.length-1;
    if(inp[j]!==seq[j]){perfect=false;o.msg(T.choNo);if(o.bad())return;mg.tm.push(setTimeout(play,700));return}
    if(inp.length===rounds[ri]){ri++;o.hit();if(ri>=rounds.length){if(perfect)o.flag("dance");o.good();o.done()}else{o.msg(T.choYes);mg.tm.push(setTimeout(play,800))}}};
  play()},
/* 3 merchkraam: onthoud de bestelling en style de paspop */
style:function(o){var CAT=[{k:"c",o:["#ff2d95","#2dd4bf","#ffd166","#a78bfa"]},{k:"p",o:[0,1,2,3]},{k:"h",o:[3,2,1,0]}],orders=o.hard?3:2,oi=0,want=null,have={c:-1,p:-1,h:-1},first=true,showT=o.hard?3500:5500;
  var mk=function(){want={c:Math.floor(o.rng()*4),p:Math.floor(o.rng()*4),h:Math.floor(o.rng()*4)}};
  var print=function(g,x,y,s,k){g.fillStyle="#fff";if(k===0)sparkle(g,x,y,s,"#fff",0);else if(k===1)heart(g,x,y+s*.3,s*1.6,"#fff");else if(k===2){g.beginPath();g.moveTo(x-s*.3,y-s);g.lineTo(x+s*.5,y-s*.1);g.lineTo(x,y);g.lineTo(x+s*.3,y+s);g.lineTo(x-s*.5,y+s*.1);g.lineTo(x,y);g.closePath();g.fill()}else{g.font="700 "+Math.round(s*1.8)+"px serif";g.textAlign="center";g.fillText("♪",x,y+s*.6)}};
  var doll=function(g,x,y,s,st){var c=st.c>=0?CAT[0].o[st.c]:"#64748b";g.fillStyle="#d6b98c";g.fillRect(x-.15*s,y-3*s,.3*s,3*s);g.fillRect(x-1*s,y-.2*s,2*s,.25*s);g.fillStyle=c;g.beginPath();g.moveTo(x-1.4*s,y-6*s);g.lineTo(x+1.4*s,y-6*s);g.lineTo(x+1.7*s,y-3*s);g.lineTo(x-1.7*s,y-3*s);g.closePath();g.fill();g.fillRect(x-2.2*s,y-6*s,.9*s,1.3*s);g.fillRect(x+1.3*s,y-6*s,.9*s,1.3*s);
    if(st.p>=0)print(g,x,y-4.5*s,.6*s,st.p);g.fillStyle="#e8d5b5";g.beginPath();g.arc(x,y-7.2*s,1.1*s,0,7);g.fill();if(st.h>=0)hatDraw(g,x,y-7.2*s,1.1*s,CAT[2].o[st.h])};
  var card=function(){o.box.innerHTML='<div class="ordcard"><canvas width="200" height="170"></canvas><p>'+esc(T.styOrder)+' '+(oi+1)+'/'+orders+'</p></div>';var g=o.box.querySelector("canvas").getContext("2d");g.fillStyle="#fff7fb";g.fillRect(0,0,200,170);g.fillStyle="#ff2d95";g.font="700 16px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(T.styCard,100,22);doll(g,100,165,14,want);
    o.msg(T.styLook);var tm=setTimeout(paint,showT);mg.tm.push(tm)};
  var paint=function(){var h='<div class="styl"><canvas width="160" height="190"></canvas><div class="stylo">'+CAT.map(function(ca,ci){return '<div class="srow" data-c="'+ca.k+'">'+ca.o.map(function(v,vi){return '<button type="button" data-v="'+vi+'" class="'+(have[ca.k]===vi?"on":"")+'">'+(ci===0?'<i style="background:'+v+'"></i>':'')+'<canvas width="40" height="40"></canvas></button>'}).join("")+'</div>'}).join("")+'</div></div><button type="button" class="btn sm" id="styOk">'+esc(T.styOk)+'</button>';
    o.box.innerHTML=h;var g=o.box.querySelector(".styl>canvas").getContext("2d");g.fillStyle="#2a1a3a";g.fillRect(0,0,160,190);doll(g,80,185,13,have);
    $$("#pz .srow").forEach(function(row,ci){[].forEach.call(row.querySelectorAll("canvas"),function(c,vi){var gg=c.getContext("2d");if(ci===1){gg.fillStyle="#64748b";gg.fillRect(0,0,40,40);print(gg,20,20,9,vi)}else if(ci===2){hatDraw(gg,20,30,11,CAT[2].o[vi])}})});
    o.box.querySelector(".stylo").onclick=function(e){var b=e.target.closest("button");if(!b)return;var k=b.closest(".srow").dataset.c;have[k]=+b.dataset.v;o.hit();paint()};
    $("#styOk").onclick=function(){if(have.c===want.c&&have.p===want.p&&have.h===want.h){oi++;o.good();if(oi>=orders){if(first)o.flag("style");o.done()}else{have={c:-1,p:-1,h:-1};mk();card()}}else{first=false;o.msg(T.styNo);if(o.bad())return;have={c:-1,p:-1,h:-1};card()}}};
  mk();card();o.hint(function(){card()})},
/* 4 lichtbrug: lichtshow nabouwen (steeds langer) */
lights:function(o){var cv=o.canvas(280),g=cv.getContext("2d"),N=o.hard?7:5,seq=[],round=0,inp=[],lit=-1,busy=true,perfect=true,COLS=["#ff2d95","#ffd166","#2dd4bf","#a78bfa","#60a5fa"];for(var i=0;i<N;i++)seq.push(Math.floor(o.rng()*5));
  var X=function(i){return 36+i*52};
  var draw=function(ts){stageBg(g,280,280,ts);g.fillStyle="#94a3b8";g.fillRect(14,40,252,8);for(var i=0;i<5;i++){var on=lit===i;g.fillStyle="#334155";rr(g,X(i)-16,48,32,30,6);g.fill();g.fillStyle=on?"#fff":COLS[i];g.globalAlpha=on?1:.6;g.beginPath();g.arc(X(i),78,13,0,7);g.fill();
      if(on){g.globalAlpha=.4;g.fillStyle=COLS[i];g.beginPath();g.moveTo(X(i)-12,82);g.lineTo(X(i)+12,82);g.lineTo(X(i)+48,270);g.lineTo(X(i)-48,270);g.closePath();g.fill()}g.globalAlpha=1}
    g.fillStyle="#2a2342";g.fillRect(0,250,280,30);mg.raf=requestAnimationFrame(draw)};mg.raf=requestAnimationFrame(draw);
  var play=function(){busy=true;inp=[];o.msg(T.simonWatch+" "+fill(T.simonRound,{r:round+1,n:N}));var k=0,step=function(){if(o.dead())return;if(k>round){lit=-1;busy=false;o.msg(T.simonGo);return}lit=seq[k];tone(392+seq[k]*88,.25,"sine",.06);k++;mg.tm.push(setTimeout(function(){lit=-1;mg.tm.push(setTimeout(step,180))},o.hard?380:520))};mg.tm.push(setTimeout(step,600))};
  cv.onpointerdown=function(e){if(busy)return;var p=o.at(e,cv),i=Math.max(0,Math.min(4,Math.round((p[0]-36)/52)));lit=i;tone(392+i*88,.2,"sine",.05);mg.tm.push(setTimeout(function(){lit=-1},180));
    inp.push(i);var j=inp.length-1;if(inp[j]!==seq[j]){perfect=false;if(o.bad())return;play();return}if(inp.length===round+1){round++;if(round>=N){if(perfect)o.flag("light");o.good();o.done()}else mg.tm.push(setTimeout(play,500))}};
  play()},
/* 5 fanzone: welke handtekening van Luna is nep? */
sign:function(o){var rounds=3,ri=0,cvs;
  var sig=function(g,x,y,v,j){g.save();g.translate(x,y);g.rotate(j*.06);g.strokeStyle="#1e1b4b";g.fillStyle="#1e1b4b";g.lineWidth=2.4;g.lineCap="round";g.font="700 30px 'Permanent Marker',cursive";g.textAlign="left";
    var txt=v===2?(o.hard?"Lnua":"Lina"):"Luna";g.fillText(txt,-48,6);if(v!==1){g.beginPath();g.moveTo(-52,16);g.bezierCurveTo(-20,26,20,6,52,14);g.stroke()}if(v===4){g.beginPath();g.moveTo(-52,22);g.bezierCurveTo(-20,32,20,12,52,20);g.stroke()}
    if(v!==3){sparkle(g,62,-8,o.hard&&v===5?6:9,"#ff2d95",0)}else{heart(g,62,-4,14,"#ff2d95")}
    g.restore()};
  var paint=function(){var fakeV=1+Math.floor(o.rng()*4),fi=Math.floor(o.rng()*5);
    o.box.innerHTML='<div class="sigref"><small>'+esc(T.sigRef)+'</small><canvas width="200" height="70"></canvas></div><div class="sigs">'+[0,1,2,3,4].map(function(i){return '<button type="button" data-i="'+i+'"><canvas width="200" height="70"></canvas></button>'}).join("")+'</div>';
    var rg=o.box.querySelector(".sigref canvas").getContext("2d");rg.fillStyle="#fffdf6";rg.fillRect(0,0,200,70);sig(rg,92,40,0,0);
    $$("#pz .sigs canvas").forEach(function(c,i){var gg=c.getContext("2d");gg.fillStyle="#fffdf6";gg.fillRect(0,0,200,70);sig(gg,92+(o.rng()-.5)*10,40,i===fi?fakeV:0,(o.rng()-.5)*2)});
    o.msg(fill(T.sigN,{r:ri+1,n:rounds}));
    o.box.querySelector(".sigs").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(+b.dataset.i===fi){ri++;o.good();b.classList.add("yes");if(ri>=rounds){o.done();return}mg.tm.push(setTimeout(paint,500))}else{b.classList.add("shake");o.msg(T.sigNo);if(o.bad())return}};
    cvs=fi};
  paint();o.hint(function(){var b=$$("#pz .sigs button")[cvs];if(b)b.classList.add("hintme")})},
/* 6 ticketcontrole: scan de tickets, tik de nep-tickets */
tickets:function(o){var N=o.hard?8:6,F=o.hard?3:2,got=0,tk=[],vid=null,hasCam=false,t0=Date.now(),day=new Date(),dd=day.getDate()+"-"+(day.getMonth()+1);
  o.box.innerHTML='<div class="tkrule">'+esc(fill(T.tkRule,{d:dd}))+'</div><div class="arbox"><video id="arV" playsinline muted autoplay></video><canvas id="arC" width="280" height="360"></canvas></div>';var cv=$("#arC"),g=cv.getContext("2d");
  var bads=shuffle([0,1,2,3,4,5,6,7].slice(0,N),o.rng).slice(0,F),kinds=shuffle(["name","date","event"],o.rng);
  for(var i=0;i<N;i++){var col=i%2,row=Math.floor(i/2),fake=bads.indexOf(i);tk.push({x:col?205:75,y:50+row*(o.hard?78:100),ph:o.rng()*6,fake:fake>=0?kinds[fake%3]:null,on:true})}
  var f=function(ts){g.clearRect(0,0,280,360);if(!hasCam)stageBg(g,280,360,ts);else{g.fillStyle="rgba(26,4,51,.25)";g.fillRect(0,0,280,360)}
    tk.forEach(function(t){if(!t.on)return;var y=t.y+(still?0:Math.sin(ts/600+t.ph)*4);g.save();g.translate(t.x,y);g.rotate(Math.sin(t.ph)*.06);g.fillStyle="#ffd166";rr(g,-62,-28,124,56,8);g.fill();g.fillStyle="#ff2d95";g.fillRect(-62,-28,20,56);g.fillStyle="#14052b";g.textAlign="left";g.font="700 15px 'Fredoka',sans-serif";
      g.fillText(t.fake==="name"?(D.FAKEN[Math.floor(t.ph)%D.FAKEN.length]):"NOVA",-36,-8);g.font="600 11px 'Nunito',sans-serif";g.fillText(t.fake==="date"?((day.getDate()%27)+2)+"-"+(day.getMonth()+1):dd,-36,8);g.fillText(t.fake==="event"?T.tkFakeE:T.tkEvent,-36,22);g.restore()});
    var sy=(ts/8)%360;g.fillStyle="rgba(45,212,191,.35)";g.fillRect(0,sy,280,3);mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  cv.onpointerdown=function(e){var p=o.at(e,cv),hit=null;tk.forEach(function(t){if(t.on&&Math.abs(p[0]-t.x)<64&&Math.abs(p[1]-t.y)<32)hit=t});if(!hit)return;
    if(hit.fake){hit.on=false;got++;o.hit();buzz(30);o.msg(fill(T.tkLeft,{n:F-got}));if(got>=F){tm.stop();if(Date.now()-t0<40000)o.flag("scan");o.good();o.done()}}else{o.msg(T.tkReal);o.bad()}};
  var tm,onEnd=function(){if(o.bad())return;tm=o.timer(o.hard?45:60,onEnd)};tm=o.timer(o.hard?45:60,onEnd);
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(st){vid=$("#arV");if(!vid){st.getTracks().forEach(function(t){t.stop()});return}vid.srcObject=st;hasCam=true;mg.off=function(){st.getTracks().forEach(function(t){t.stop()})}}).catch(function(){})}
  o.msg(fill(T.tkLeft,{n:F}))},
/* 7 geluidscheck: lipsync op de beat */
rhythm:function(o){var cv=o.canvas(300),g=cv.getContext("2d"),N=o.hard?20:15,bpm=o.hard?124:100,beat=60000/bpm,notes=[],hit=0,miss=0,t0=performance.now()+1200,LN=[60,140,220],LAB=["LA","DI","DA"];
  for(var i=0;i<N;i++)notes.push({t:t0+i*beat+(o.rng()<.3?beat/2:0),l:Math.floor(o.rng()*3),on:true});
  o.msg(fill(T.rhythmHit,{n:0,N:N}));var line=250,speed=.25,flash=[0,0,0];
  var f=function(ts){if(o.dead())return;stageBg(g,280,300,ts);LN.forEach(function(x,k){g.fillStyle="rgba(255,255,255,.06)";g.fillRect(x-30,0,60,300);g.fillStyle=["#ff2d95","#ffd166","#2dd4bf"][k];g.globalAlpha=ts-flash[k]<150?1:.7;rr(g,x-28,line-6,56,12,6);g.fill();g.globalAlpha=1;g.fillStyle="#fff";g.font="700 13px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(LAB[k],x,line+28)});
    notes.forEach(function(n){if(!n.on)return;var y=line-(n.t-ts)*speed;if(y>290){n.on=false;miss++;if(miss%5===0&&o.bad())return}if(y>-20){g.fillStyle="#fff";g.beginPath();g.arc(LN[n.l],y,13,0,7);g.fill();g.fillStyle=["#ff2d95","#ffd166","#2dd4bf"][n.l];g.font="700 16px serif";g.textAlign="center";g.fillText("♪",LN[n.l],y+6)}});
    if(notes.every(function(n){return !n.on})){o.good();o.done();return}mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  cv.onpointerdown=function(e){var p=o.at(e,cv),l=p[0]<100?0:p[0]<180?1:2,ts=performance.now(),best=null;flash[l]=ts;notes.forEach(function(n){if(n.on&&n.l===l&&Math.abs(n.t-ts)<220&&(!best||Math.abs(n.t-ts)<Math.abs(best.t-ts)))best=n});
    tone([523,659,784][l],.12,"sine",.06);if(best){best.on=false;hit++;o.hit();o.msg(fill(T.rhythmHit,{n:hit,N:N}))}}},
/* 8 foodtruck: welke bestelling is van de band? */
menu:function(o){var FOOD=D.FOOD,R=o.hard?5:4,rc=[],first=true;var pick3=function(){return shuffle(FOOD.map(function(x,i){return i}),o.rng).slice(0,3).sort(function(a,b){return a-b})};
  var right=pick3();rc.push(right);var key=function(a){return a.join(",")};while(rc.length<R){var c=pick3();if(rc.every(function(x){return key(x)!==key(c)}))rc.push(c)}
  var clues=rc.slice(1).map(function(w){var not=w.filter(function(x){return right.indexOf(x)<0}),yes=right.filter(function(x){return w.indexOf(x)<0});if(yes.length&&(o.rng()<.5||!not.length))return fill(T.menuYes,{f:FOOD[yes[Math.floor(o.rng()*yes.length)]]});return fill(T.menuNo,{f:FOOD[not[Math.floor(o.rng()*not.length)]]})});
  clues=shuffle(clues.filter(function(c,i){return clues.indexOf(c)===i}),o.rng);var order=shuffle(rc.map(function(x,i){return i}),o.rng),out={};
  /* klopt elke andere bon echt niet met de hints? (dubbele hints vallen weg, dus controleren) */
  var ok=function(bon){return clues.every(function(cl){return FOOD.every(function(fd,fi){if(cl===fill(T.menuYes,{f:fd}))return bon.indexOf(fi)>=0;if(cl===fill(T.menuNo,{f:fd}))return bon.indexOf(fi)<0;return true})})};
  rc.forEach(function(b,i){if(i&&ok(b)){var miss=right.filter(function(x){return b.indexOf(x)<0})[0];if(miss!=null)clues.push(fill(T.menuYes,{f:FOOD[miss]}))}});
  var paint=function(){o.box.innerHTML='<div class="clues">'+clues.map(function(c){return '<p>• '+esc(c)+'</p>'}).join("")+'</div><div class="bons">'+order.map(function(ix,k){return '<button type="button" data-i="'+ix+'" class="'+(out[ix]?"out":"")+'"><b>'+esc(T.menuBon)+' '+(k+1)+'</b>'+rc[ix].map(function(fi){return '<span>'+esc(FOOD[fi])+'</span>'}).join("")+'</button>'}).join("")+'</div>';
    o.box.querySelector(".bons").onclick=function(e){var b=e.target.closest("button");if(!b||b.classList.contains("out"))return;var ix=+b.dataset.i;if(ix===0){if(first)o.flag("menu");o.good();o.msg(T.menuOk);o.done()}else{first=false;out[ix]=1;o.msg(T.menuWrong);if(o.bad())return;paint()}}};
  paint();o.hint(function(){var w=order.filter(function(ix){return ix&&!out[ix]})[0];if(w!=null){out[w]=1;paint()}})},
/* 9 fotobooth: vind de verschillen tussen twee bandfoto's */
diff:function(o){if(img("diff-a")&&img("diff-b"))return PUZ.diffPhoto(o);var N=o.hard?6:5,q=rngOf(o.rng()*1e9|0),obj=[],found=0,miss=0,H=170;
  var KIND=["star","note","balloon","heart","light","speaker"],COL=["#ff2d95","#ffd166","#2dd4bf","#a78bfa","#60a5fa","#fff"];
  for(var i=0;i<14;i++){var x,y,ok,tr=0;do{x=24+q()*232;y=22+q()*120;ok=obj.every(function(b){return Math.hypot(b.x-x,b.y-y)>34});tr++}while(!ok&&tr<60);obj.push({x:x,y:y,k:KIND[Math.floor(q()*6)],c:Math.floor(q()*6),s:10+q()*5})}
  var ch=shuffle(obj.map(function(b,i){return i}),q).slice(0,N),chg={};ch.forEach(function(i,k){chg[i]=["gone","col","col","move"][k%4]});
  o.box.innerHTML='<canvas class="sq dif" width="280" height="'+H+'"></canvas><canvas class="sq dif" id="difB" width="280" height="'+H+'"></canvas>';$$("#pz .dif").forEach(function(c){c.style.aspectRatio="280/"+H});
  var cA=o.box.children[0],cB=o.box.children[1];
  var one=function(g,b,alt){var x=b.x,y=b.y,c=COL[b.c],s=b.s;if(alt==="gone")return;if(alt==="col")c=COL[(b.c+2)%6];if(alt==="move"){x+=16;y-=10}
    if(b.k==="star")sparkle(g,x,y,s,c,0);else if(b.k==="heart")heart(g,x,y+s*.3,s*1.8,c);else if(b.k==="note"){g.fillStyle=c;g.font="700 "+Math.round(s*2.4)+"px serif";g.textAlign="center";g.fillText("♪",x,y+s*.8)}
    else if(b.k==="balloon"){g.fillStyle=c;g.beginPath();g.ellipse(x,y,s*.8,s,0,0,7);g.fill();g.strokeStyle="#fff";g.lineWidth=1;g.beginPath();g.moveTo(x,y+s);g.lineTo(x,y+s*2);g.stroke()}
    else if(b.k==="light"){g.fillStyle="#334155";g.fillRect(x-s*.6,y-s*.6,s*1.2,s*.6);g.fillStyle=c;g.beginPath();g.arc(x,y+s*.1,s*.5,0,7);g.fill()}
    else{g.fillStyle="#111827";g.fillRect(x-s*.6,y-s,s*1.2,s*2);g.fillStyle=c;g.beginPath();g.arc(x,y+s*.3,s*.4,0,7);g.fill()}};
  var got={},paint=function(){[cA,cB].forEach(function(c,ci){var g=c.getContext("2d");drawStage(g,280,H,6,11,0,false);obj.forEach(function(b,i){one(g,b,ci&&chg[i]?chg[i]:null)});
      ch.forEach(function(i){if(got[i]){g.strokeStyle="#4ade80";g.lineWidth=3;g.beginPath();g.arc(obj[i].x+(chg[i]==="move"&&ci?8:0),obj[i].y-(chg[i]==="move"&&ci?5:0),20,0,7);g.stroke()}})})};
  paint();o.msg(fill(T.difN,{n:0,N:N}));
  var tap=function(c,e){var p=o.at(e,c),best=null;ch.forEach(function(i){var b=obj[i],d=Math.min(Math.hypot(b.x-p[0],b.y-p[1]),Math.hypot(b.x+16-p[0],b.y-10-p[1]));if(!got[i]&&d<24)best=i});
    if(best!=null){got[best]=1;found++;o.hit();buzz(30);paint();o.msg(fill(T.difN,{n:found,N:N}));if(found>=N){o.good();o.done()}}else{miss++;o.msg(T.difNo);if(miss%3===0)o.bad()}};
  cA.onpointerdown=function(e){tap(cA,e)};cB.onpointerdown=function(e){tap(cB,e)};
  if(o.hard){var tm,onEnd=function(){if(o.bad())return;tm=o.timer(80,onEnd)};tm=o.timer(80,onEnd)}
  o.hint(function(){var i=ch.filter(function(i){return !got[i]})[0];if(i==null)return;var g=cB.getContext("2d");g.strokeStyle="#ffd166";g.lineWidth=3;g.setLineDash([4,4]);g.beginPath();g.arc(obj[i].x+8,obj[i].y-5,30,0,7);g.stroke();g.setLineDash([])})},
/* 9b fotobooth met de foto van Kellie: vijf vaste verschillen (coördinaten in het 887×887-origineel) */
diffPhoto:function(o){var D5=[[150,370],[840,390],[745,500],[470,555],[80,470]],N=D5.length,found=0,miss=0,got={},S=280/887;
  o.box.innerHTML='<canvas class="sq dif" width="280" height="280"></canvas><canvas class="sq dif" id="difB" width="280" height="280"></canvas>';$$("#pz .dif").forEach(function(c){c.style.aspectRatio="1/1"});
  var cA=o.box.children[0],cB=o.box.children[1];
  var paint=function(){[cA,cB].forEach(function(c,ci){var g=c.getContext("2d");g.drawImage(img(ci?"diff-b":"diff-a"),0,0,280,280);D5.forEach(function(p,i){if(got[i]){g.strokeStyle="#4ade80";g.lineWidth=3;g.beginPath();g.arc(p[0]*S,p[1]*S,22,0,7);g.stroke()}})})};
  paint();o.msg(fill(T.difN,{n:0,N:N}));
  var tap=function(c,e){var p=o.at(e,c),best=null;D5.forEach(function(d,i){if(!got[i]&&Math.hypot(d[0]*S-p[0],d[1]*S-p[1])<26)best=i});
    if(best!=null){got[best]=1;found++;o.hit();buzz(30);paint();o.msg(fill(T.difN,{n:found,N:N}));if(found>=N){o.good();o.done()}}else{miss++;o.msg(T.difNo);if(miss%3===0)o.bad()}};
  cA.onpointerdown=function(e){tap(cA,e)};cB.onpointerdown=function(e){tap(cB,e)};
  if(o.hard){var tm,onEnd=function(){if(o.bad())return;tm=o.timer(80,onEnd)};tm=o.timer(80,onEnd)}
  o.hint(function(){var i=D5.map(function(d,i){return i}).filter(function(i){return !got[i]})[0];if(i==null)return;var g=cB.getContext("2d");g.strokeStyle="#ffd166";g.lineWidth=3;g.setLineDash([4,4]);g.beginPath();g.arc(D5[i][0]*S,D5[i][1]*S,30,0,7);g.stroke();g.setLineDash([])})},
/* 10 geluidstruck: draai de kabels tot de stroom bij de versterker komt */
cables:function(o){var N=o.hard?5:4,cv=o.canvas(280),g=cv.getContext("2d"),cs=240/N,ox=20,oy=20,r0=Math.floor(o.rng()*N),r1=Math.floor(o.rng()*N),grid=[],path=null;
  /* richtingen: 0 boven, 1 rechts, 2 onder, 3 links */
  var DX=[0,1,0,-1],DY=[-1,0,1,0];
  var findPath=function(){var vis={},res=null,calls=0,go=function(r,c,acc){if(res||++calls>4000)return;if(c===N-1&&r===r1){res=acc.concat([[r,c]]);return}vis[r+","+c]=1;var ds=shuffle([0,1,2,3],o.rng);ds.forEach(function(d){var nr=r+DY[d],nc=c+DX[d];if(nr<0||nc<0||nr>=N||nc>=N||vis[nr+","+nc])return;go(nr,nc,acc.concat([[r,c]]))});vis[r+","+c]=0};go(r0,0,[]);return res};
  for(var tries=0;tries<20&&!path;tries++)path=findPath();
  if(!path){path=[];for(var c0=0;c0<N;c0++)path.push([r0,c0]);for(var rr2=r0;rr2!==r1;){rr2+=r1>r0?1:-1;path.push([rr2,N-1])}}
  for(var r=0;r<N;r++){grid.push([]);for(var c=0;c<N;c++)grid[r].push({t:o.rng()<.5?"s":"c",rot:Math.floor(o.rng()*4),onP:false})}
  path.forEach(function(p,k){var prev=k?path[k-1]:[p[0],-1],next=k<path.length-1?path[k+1]:[p[0],N],din=dirOf(p,prev),dout=dirOf(p,next),cell=grid[p[0]][p[1]];cell.onP=true;cell.t=(din+2)%4===dout?"s":"c";cell.rot=Math.floor(o.rng()*4)});
  function dirOf(a,b){if(b[0]<a[0])return 0;if(b[1]>a[1])return 1;if(b[0]>a[0])return 2;return 3}
  var opens=function(cell){var base=cell.t==="s"?[0,2]:[0,1];return base.map(function(d){return(d+cell.rot)%4})};
  var trace=function(){var r=r0,c=0,from=3,lit={},steps=0;while(steps++<N*N+2){if(r<0||c<0||r>=N||c>=N)return{ok:false,lit:lit};var op=opens(grid[r][c]);if(op.indexOf(from)<0)return{ok:false,lit:lit};lit[r+","+c]=1;var out=op[0]===from?op[1]:op[0];if(c===N-1&&r===r1&&out===1)return{ok:true,lit:lit};r+=DY[out];c+=DX[out];from=(out+2)%4}return{ok:false,lit:lit}};
  var draw=function(ts){var tr=trace();g.fillStyle="#1e1b2e";g.fillRect(0,0,280,280);for(var r=0;r<N;r++)for(var c=0;c<N;c++){var x=ox+c*cs,y=oy+r*cs,cell=grid[r][c],on=tr.lit[r+","+c];g.fillStyle="#2a2342";rr(g,x+2,y+2,cs-4,cs-4,6);g.fill();
      g.strokeStyle=on?"#ff2d95":"#64748b";g.lineWidth=cs*.16;g.lineCap="round";if(on){g.shadowColor="#ff2d95";g.shadowBlur=10}var cx=x+cs/2,cy=y+cs/2;opens(cell).forEach(function(d){g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+DX[d]*cs/2,cy+DY[d]*cs/2);g.stroke()});g.shadowBlur=0;g.fillStyle=on?"#ff2d95":"#64748b";g.beginPath();g.arc(cx,cy,cs*.1,0,7);g.fill()}
    g.fillStyle="#ffd166";g.beginPath();g.arc(10,oy+r0*cs+cs/2,9,0,7);g.fill();g.fillStyle="#111827";rr(g,262,oy+r1*cs+cs/2-14,16,28,3);g.fill();g.fillStyle=tr.ok?"#4ade80":"#475569";g.beginPath();g.arc(270,oy+r1*cs+cs/2,5,0,7);g.fill();
    mg.raf=requestAnimationFrame(draw)};mg.raf=requestAnimationFrame(draw);
  /* zorg dat de puzzel niet al klaar is bij de start */
  var guard=0;while(trace().ok&&guard++<10)grid[path[0][0]][path[0][1]].rot=(grid[path[0][0]][path[0][1]].rot+1)%4;
  o.msg(T.cabGo);var moves=0;
  cv.onpointerdown=function(e){var p=o.at(e,cv),c=Math.floor((p[0]-ox)/cs),r=Math.floor((p[1]-oy)/cs);if(r<0||c<0||r>=N||c>=N)return;grid[r][c].rot=(grid[r][c].rot+1)%4;moves++;tone(500+r*60+c*40,.05,"triangle",.04);
    if(trace().ok){if(!cur.hinted)o.flag("cable");o.msg(T.cabOk);o.good();mg.tm.push(setTimeout(o.done,500))}};
  o.hint(function(){var bad=path.filter(function(p,k){var prev=k?path[k-1]:[p[0],-1],next=k<path.length-1?path[k+1]:[p[0],N],a=dirOf(p,prev),b=dirOf(p,next),op=opens(grid[p[0]][p[1]]);return !(op.indexOf(a)>=0&&op.indexOf(b)>=0)})[0];
    if(!bad)return;var k=path.indexOf(bad),prev=k?path[k-1]:[bad[0],-1],next=k<path.length-1?path[k+1]:[bad[0],N],a=dirOf(bad,prev),b=dirOf(bad,next),cell=grid[bad[0]][bad[1]];for(var i=0;i<4;i++){var op=opens(cell);if(op.indexOf(a)>=0&&op.indexOf(b)>=0)break;cell.rot=(cell.rot+1)%4}
    if(trace().ok){o.good();mg.tm.push(setTimeout(o.done,500))}})},
/* 11 memory in de VIP-lounge */
pairs:function(o){var n=o.hard?8:6,icons=shuffle([0,1,2,3,4,5,6,7,8,9,10],o.rng).slice(0,n),cards=spreadPairs(shuffle(icons.concat(icons),o.rng),4,o.rng),open=[],found=0,lock=false;
  var U={};icons.forEach(function(k){U[k]=spriteURL(function(g){g.fillStyle="#2a0a4a";g.fillRect(0,0,64,64);drawItem(g,k,32,36,15)},64,64)});
  var paint=function(){o.box.innerHTML='<div class="mem c4">'+cards.map(function(k,i){var on=open.indexOf(i)>=0||k===null;return '<button type="button" data-i="'+i+'" class="'+(on?"on":"")+(k===null?" out":"")+'">'+(on&&k!==null?'<img src="'+U[k]+'" alt="">':'')+'</button>'}).join("")+'</div>';
    o.box.firstChild.onclick=function(e){var b=e.target.closest("button");if(!b||lock)return;var i=+b.dataset.i;if(cards[i]===null||open.indexOf(i)>=0)return;open.push(i);o.hit();paint();
      if(open.length===2){lock=true;mg.tm.push(setTimeout(function(){lock=false;if(cards[open[0]]===cards[open[1]]){found++;cards[open[0]]=cards[open[1]]=null;sfx("coin")}open=[];paint();if(found>=n){o.good();o.done()}},700))}}};paint()},
/* 12 mengtafel: zet de schuiven zoals Bo het wil */
mixer:function(o){var cv=o.canvas(280),g=cv.getContext("2d"),CH=T.mixCh,N=4,want=[],have=[],drag=-1,first=true;for(var i=0;i<N;i++){want.push(1+Math.floor(o.rng()*9));have.push(5)}
  var X=function(i){return 45+i*63},Y=function(v){return 230-v*18};
  o.box.insertAdjacentHTML("beforeend",'<div class="mixwant">'+CH.map(function(c,i){return '<span>'+esc(c)+' <b>'+want[i]+'</b></span>'}).join("")+'</div><button type="button" class="btn sm" id="mxOk">'+esc(T.mixOk)+'</button>');
  var draw=function(){g.fillStyle="#1e1b2e";g.fillRect(0,0,280,280);for(var i=0;i<N;i++){g.fillStyle="#0f0a1a";rr(g,X(i)-5,Y(10)-6,10,Y(0)-Y(10)+12,5);g.fill();for(var v=0;v<=10;v++){g.fillStyle="#475569";g.fillRect(X(i)-16,Y(v),8,1.5);if(v%5===0){g.fillStyle="#94a3b8";g.font="600 10px 'Nunito',sans-serif";g.textAlign="right";g.fillText(v,X(i)-19,Y(v)+4)}}
      if(!o.hard){g.strokeStyle="rgba(255,209,102,.6)";g.setLineDash([3,3]);g.beginPath();g.moveTo(X(i)-14,Y(want[i]));g.lineTo(X(i)+14,Y(want[i]));g.stroke();g.setLineDash([])}
      g.fillStyle=["#ff2d95","#ffd166","#2dd4bf","#a78bfa"][i];rr(g,X(i)-14,Y(have[i])-8,28,16,4);g.fill();g.fillStyle="#fff";g.font="700 11px 'Fredoka',sans-serif";g.textAlign="center";g.fillText(have[i],X(i),Y(have[i])+4);g.fillStyle="#e9d5ff";g.font="700 11px 'Nunito',sans-serif";g.fillText(CH[i],X(i),262)}};draw();
  var set=function(e){var p=o.at(e,cv);if(drag<0){var best=-1,bd=40;for(var i=0;i<N;i++){var d=Math.abs(p[0]-X(i));if(d<bd){bd=d;best=i}}drag=best}if(drag<0)return;have[drag]=Math.max(0,Math.min(10,Math.round((230-p[1])/18)));draw()};
  cv.onpointerdown=function(e){cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);drag=-1;set(e);tone(300+have[Math.max(0,drag)]*40,.04,"sine",.03)};cv.onpointermove=function(e){if(drag>=0)set(e)};cv.onpointerup=cv.onpointercancel=function(){drag=-1};
  $("#mxOk").onclick=function(){var ok=have.every(function(v,i){return v===want[i]});if(ok){if(first)o.flag("mix");o.msg(T.mixYes);o.good();o.done()}else{first=false;var wr=have.filter(function(v,i){return v!==want[i]}).length;o.msg(fill(T.mixNo,{n:wr}));o.bad()}};
  o.msg(T.mixGo)}
};

/* ---------- speurboekje, stops, menu ---------- */
function noteSheet(){var ev=[],sg=[],wt=[];G.c.slots.forEach(function(s,i){if(!G.ph[i])return;
    if(s.e>=0){var e=G.c.ev[s.e];ev.push('<div class="clue"><canvas class="evc" data-k="'+e.k+'" data-v="'+e.v+'" width="80" height="80"></canvas><div><em>'+esc(D.AT[e.k].n)+'</em><p>'+esc(fill(e.t,{v:D.AT[e.k].v[e.v]}))+'</p></div></div>')}
    if(s.sg>=0)sg.push('<p class="snipl">'+esc(songText(s.sg))+'</p>');
    if(s.w>=0){var w=G.c.wits[s.w];wt.push('<div class="clue wit">'+AV(WITK[w.p])+'<div><em>'+esc(NAMEOF(WITK[w.p]))+'</em><p>'+esc(witText(w))+'</p></div></div>')}});
  var achs=Object.keys(G.ach).map(function(k){return '<i>🏆 '+esc(T.ach[k][0])+'</i>'}).join("");
  sheet('<h2>'+T.notebook+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+stageHTML(done())+(ev.length||sg.length||wt.length?'<div class="eyebrow">'+T.nbE+'</div><p class="note">'+esc(T.evT)+'</p><div class="list">'+(ev.join("")||'<p class="note">–</p>')+'</div><div class="eyebrow">'+T.nbS+'</div><div class="list">'+(sg.join("")||'<p class="note">–</p>')+'</div><div class="eyebrow">'+T.nbW+'</div><p class="note">'+esc(T.witT)+'</p><div class="list">'+(wt.join("")||'<p class="note">–</p>')+'</div>':'<p class="note">'+T.nbNone+'</p>')+(achs?'<div class="eyebrow">'+T.nbAch+'</div><div class="tags">'+achs+'</div>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  MW.bindCodeBox($("#sheetBody"),L);paintStage(done());$$("#sheetBody .evc").forEach(function(cv){evDraw(cv.getContext("2d"),cv.dataset.k,+cv.dataset.v)});$("#shX").onclick=closeSheet}
function lvlSheet(){sheet('<h2>'+T.people+'</h2><p class="note">'+T.peopleT+'</p><div class="lvlist big">'+G.c.slots.map(function(s,i){return '<span class="'+(G.ph[i]?"on":"")+'"><b>'+(i+1)+'</b>'+esc(T.kinds[s.act])+'</span>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function menuSheet(){var onMap=G&&(G.mode==="map"||G.mode==="in");sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button><button type="button" class="btn ghost dk" id="mMus">'+(MUSIC?"🎵 "+T.musOn:"🎵 "+T.musOff)+'</button>'+(onMap?'<button type="button" class="btn ghost dk" id="mNoMap">'+T.kv.mNoMap+'</button>':'')+'<button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mMus"){MUSIC=!MUSIC;LS.set("ss_bs_music",MUSIC);$("#mMus").textContent=MUSIC?"🎵 "+T.musOn:"🎵 "+T.musOff;if(MUSIC)music("map");else musicStop()}else if(i==="mNoMap"){closeSheet();dropMap()}else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- finale ---------- */
/* G.fin: 0 nog niets, 1 Pip herkend, 2 gesprek gehad, 3 setlist klopt, 4 show gespeeld */
function finaleGate(){if(!G)return;if(done()<NN())return noteSheet();G.fin=G.fin||0;if(G.fin===0)return photoPick();if(G.fin===1)return pipTalk();if(G.fin===2)return setlistSort();if(G.fin===3)return showIntro();finaleCine(function(){photoSheet("arrest",win)})}
/* de wazige foto van Nour: wie had de tas? */
function photoPick(){var c=G.c,fin=false;
  sheet('<div class="eyebrow">'+esc(T.picH)+'</div><h2>'+esc(T.whoH)+'</h2>'+bubble(D.MAXL.photo,NAMEOF("nour"),"small",AV("nour"))+'<p class="note">'+esc(T.whoT)+'</p><div class="who five">'+c.sus.map(function(s,i){return '<button type="button" data-s="'+i+'"><canvas width="120" height="170"></canvas><div class="tags">'+ATK.map(function(k){return '<i>'+esc(D.AT[k].s[s[k]])+'</i>'}).join("")+'</div></button>'}).join("")+'</div><p class="pzst" id="whoM"></p><button type="button" class="btn ghost dk" id="shX">'+T.notebook+'</button>',true);
  $$("#sheetBody .who canvas").forEach(function(cv,i){var g=cv.getContext("2d"),s=c.sus[i];g.fillStyle="#3b2a4d";g.fillRect(0,0,120,170);g.filter="blur(1px)";for(var k=0;k<20;k++){g.fillStyle="rgba(255,255,255,.05)";g.fillRect((k*37)%120,(k*53)%170,10,10)}g.filter="none";
    var sh=img("shoe-"+s.schoen),hv=img("hat-"+s.hoed);drawPerson(g,60,162,13.5,{blur:true,top:"#1f1147",glit:s.glit,hat:hv?null:s.hoed,shoe:sh?null:s.schoen,prop:img("bag")?"":"bag",bagc:s.glit,hs:[0,1,2,4,5][i]},0);
    if(sh)fit(g,"shoe-"+s.schoen,60,160,66,34);if(hv)hatOn(g,s.hoed,60,45,68,62);if(img("bag"))fit(g,"bag",92,122,40,40)});say(D.MAXL.photo+" "+T.whoT);
  $("#shX").onclick=function(){noteSheet();$("#shX").onclick=function(){closeSheet();photoPick()}};
  $("#sheetBody .who").onclick=function(e){var b=e.target.closest("button");if(!b||fin)return;G.tries++;save();if(+b.dataset.s===c.K){fin=true;b.classList.add("yes");sfx("win");buzz([100,50,300]);$("#whoM").textContent=T.whoYes;say(T.whoYes);G.fin=1;save();setTimeout(pipTalk,1500)}else{b.classList.add("shake");setTimeout(function(){b.classList.remove("shake")},600);$("#whoM").textContent=T.whoNo;say(T.whoNo);sfx("bad")}}}
/* Pip achter de foodtruck: het gesprek en de keuze (allebei goed) */
function pipTalk(){var c=G.c,K=c.sus[c.K],lw=c.wits.filter(function(w){return w.lie})[0],look=Object.assign({},PPL.pip,{glit:K.glit,hat:K.hoed,shoe:K.schoen,prop:"bag",bagc:K.glit,pose:"idle",v:"relief"});
  var lieT=lw?fill(c.ster?D.MAXL.lieX:D.MAXL.lie,{w:NAMEOF(WITK[lw.p]),v:D.AT[lw.k].g[lw.v]}):"";
  sheet('<div class="eyebrow">'+esc(T.revH)+'</div><h2 class="big">'+esc(T.revT)+'</h2><canvas id="endC" class="endscene" width="320" height="200"></canvas>'+bubble(D.MAXL.pip1,NAMEOF("pip"),"big",AV("pip"))+bubble(D.MAXL.pip2,NAMEOF("pip"),"",AV("pip"))+(lieT?'<p class="note">'+esc(lieT)+'</p>':'')+'<h2>'+esc(T.choiceH)+'</h2><div class="row2 col"><button type="button" class="btn" id="eA">'+esc(T.choA)+'</button><button type="button" class="btn red" id="eB">'+esc(T.choB)+'</button></div>',true);
  var cv=$("#endC"),g=cv.getContext("2d");(function f(ts){if(!cv.isConnected)return;stageBg(g,320,200,ts);g.fillStyle="#fb923c";rr(g,170,60,150,90,10);g.fill();g.fillStyle="#fff";g.fillRect(190,75,70,35);g.fillStyle="#1f2937";g.beginPath();g.arc(200,152,14,0,7);g.arc(290,152,14,0,7);g.fill();drawPerson(g,130,190,10,look,ts);if(img("bag"))fit(g,"bag",188,172,44,44);drawCrew(g,60,190,8,G.av,ts);if(!still)requestAnimationFrame(f)})(0);
  say(D.MAXL.pip1+" "+D.MAXL.pip2+" "+lieT);
  var pick=function(k){G.end=k;ach("friend");G.fin=2;save();var t=k==="A"?D.MAXL.choA:D.MAXL.choB;sheet('<div class="eyebrow">'+esc(T.revH)+'</div>'+bubble(t,NAMEOF("pip"),"big",AV("pip"))+'<button type="button" class="btn" id="bPhoto">'+T.goOn+'</button>',true);say(t);$("#bPhoto").onclick=function(){closeSheet();setlistSort()}};
  $("#eA").onclick=function(){pick("A")};$("#eB").onclick=function(){pick("B")}}
/* de setlist in de goede volgorde leggen */
function setlistSort(){var c=G.c,ord=shuffle([0,1,2,3,4],rngOf(G.seed+11)),picked=[],fin=false;
  var paint=function(){sheet('<div class="eyebrow">'+esc(T.setH)+'</div><h2>'+esc(T.setT)+'</h2>'+bubble(D.MAXL.setlist,NAMEOF("pip"),"small",AV("pip"))+'<div class="setl">'+[0,1,2,3,4].map(function(k){return '<div class="slot'+(picked[k]!=null?" on":"")+'"><b>'+(k+1)+'</b><span>'+(picked[k]!=null?esc(songAt(picked[k]).t):"…")+'</span></div>'}).join("")+'</div><div class="songs">'+ord.map(function(p){return '<button type="button" data-p="'+p+'"'+(picked.indexOf(p)>=0?' disabled':'')+'>'+esc(songAt(p).t)+'</button>'}).join("")+'</div><p class="pzst" id="setM"></p><div class="row2"><button type="button" class="btn ghost dk sm" id="setR">'+esc(T.setReset)+'</button><button type="button" class="btn ghost dk sm" id="setN">'+esc(T.notebook)+'</button></div>',true);
    $("#sheetBody .songs").onclick=function(e){var b=e.target.closest("button");if(!b||fin||b.disabled)return;picked.push(+b.dataset.p);sfx("hit");tone(523+picked.length*60,.12,"sine",.05);
      if(picked.length===5){if(picked.every(function(p,k){return p===k})){fin=true;paint();$("#setM").textContent=T.setOk;sfx("win");buzz([80,40,200]);say(T.setOk);G.fin=3;save();setTimeout(showIntro,1600);return}G.tries++;save();paint();$("#setM").textContent=T.setNo;say(T.setNo);sfx("bad");buzz(120);picked=[];setTimeout(function(){if(!fin)paint()},1800);return}paint()};
    $("#setR").onclick=function(){picked=[];paint()};$("#setN").onclick=function(){noteSheet();$("#shX").onclick=function(){closeSheet();paint()}}};
  paint();say(D.MAXL.setlist)}
/* de show: soundcheck (toestemmingen in één gebaar), dan vijf nummers met een groepsopdracht */
var SHOWK=["jump","sing","wave","clap","cheer"],SENS={mic:null,an:null,buf:null,motion:false,tracks:null};
function showIntro(){sheet('<div class="eyebrow">'+esc(T.showH)+'</div><h2 class="big">'+esc(T.showT)+'</h2><canvas id="bC" class="endscene" width="320" height="200"></canvas>'+bubble(D.MAXL.showIntro,NAMEOF("max"),"big")+'<p class="note">'+esc(T.showNote)+'</p><button type="button" class="btn red" id="bGo2">'+esc(T.showGo)+'</button>',true);
  var cv=$("#bC"),g=cv.getContext("2d");(function f(ts){if(!cv.isConnected)return;drawStage(g,320,200,NN(),NN(),ts,true);if(!still)requestAnimationFrame(f)})(0);say(D.MAXL.showIntro);
  $("#bGo2").onclick=function(){ac();try{if(window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==="function")DeviceMotionEvent.requestPermission().then(function(r){SENS.motion=r==="granted"}).catch(function(){});else SENS.motion=!!window.DeviceMotionEvent}catch(e){}
    try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")DeviceOrientationEvent.requestPermission().catch(function(){})}catch(e){}
    var go=function(){closeSheet();show2(0)};
    if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){var a=ac();if(a){SENS.tracks=st.getTracks();var src=a.createMediaStreamSource(st);SENS.an=a.createAnalyser();SENS.an.fftSize=512;src.connect(SENS.an);SENS.buf=new Uint8Array(SENS.an.fftSize);SENS.mic=true}go()}).catch(go);else go()}}
function micVol(){if(!SENS.an)return 0;SENS.an.getByteTimeDomainData(SENS.buf);var s=0;for(var i=0;i<SENS.buf.length;i++){var v=(SENS.buf[i]-128)/128;s+=v*v}return Math.sqrt(s/SENS.buf.length)}
function micOff(){if(SENS.tracks)SENS.tracks.forEach(function(t){t.stop()});SENS.tracks=null;SENS.an=null;SENS.mic=null}
function show2(p){var ov=$("#hide");ov.hidden=false;ov.className="show";$("#room").hidden=true;$("#room").innerHTML="";var cv=$("#bossC");if(!cv){cv=document.createElement("canvas");cv.id="bossC";ov.insertBefore(cv,$("#room"))}cv.hidden=false;
  var g=cv.getContext("2d"),w,h,dpr,meter=0,fin=false,kind=SHOWK[p],song=songAt(p),last=0,lastA=null,swing=0,t0=0,pulse=0,tapB=$("#showTap");
  var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  if(!tapB){tapB=document.createElement("button");tapB.type="button";tapB.id="showTap";tapB.className="btn";ov.appendChild(tapB)}tapB.hidden=false;tapB.textContent=T.showTap[kind];
  $("#hideHint").textContent=fill(T.showSong,{n:p+1,t:song.t})+" · "+T.showDo[kind];$("#hideMsg").textContent="";music("show");say(fill(T.showSong,{n:p+1,t:song.t})+". "+T.showDo[kind]);
  var add=function(v){meter=Math.min(100,meter+v);pulse=performance.now()};
  var gain=hard()?.75:1;
  tapB.onpointerdown=function(e){e.preventDefault();add((kind==="sing"?3:4.5)*gain);sfx(kind==="clap"?"drum":"hit");buzz(15)};
  var onM=function(e){var a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;var m=Math.hypot(a.x||0,a.y||0,a.z||0);
    if(kind==="jump"&&m>19&&performance.now()-last>350){last=performance.now();add(9*gain);sfx("jump")}
    if(kind==="wave"){var x=a.x||0;if(lastA!=null&&Math.sign(x)!==Math.sign(lastA)&&Math.abs(x-lastA)>8&&performance.now()-last>250){last=performance.now();add(6*gain)}lastA=x}};
  addEventListener("devicemotion",onM);
  var micIv=setInterval(function(){if(fin||!SENS.an)return;var v=micVol();if(kind==="sing"&&v>.05)add((v>.12?1.6:.9)*gain);if((kind==="clap"||kind==="cheer")&&v>.14&&performance.now()-last>140){last=performance.now();add((kind==="cheer"?4:5)*gain)}},70);
  var end=function(){fin=true;removeEventListener("devicemotion",onM);clearInterval(micIv);tapB.hidden=true;tapB.onpointerdown=null};
  var f=function(ts){if(fin)return;if(!t0)t0=ts;meter=Math.max(0,meter-(hard()?.08:.05));g.setTransform(dpr,0,0,dpr,0,0);drawStage(g,w,h,11,11,ts,false,{band:1});
    var s=Math.max(5,Math.min(w,h)*.02),beat=still?0:Math.abs(Math.sin(ts/240));["luna","zoe","pip","indi"].forEach(function(k,i){var o=Object.assign({},PPL[k]);o.pose=k==="luna"?(meter>60?"up":"mic"):k==="pip"?"drum":k==="zoe"?"guitar":(beat>.5?"up":"wave");o.bob=true;o.ph=i*150;if(k==="pip"&&G.c){var K=G.c.sus[G.c.K];o.glit=K.glit;o.hat=K.hoed;o.shoe=K.schoen}drawPerson(g,w*(.22+i*.19),h*.7,s,o,ts)});
    if(G.end==="B")drawCrew(g,w*.9,h*.7,s*.85,G.av,ts,"up");
    /* publiek dat harder juicht */var jump=meter/100;for(var i=0;i<22;i++){var cx=(i+.5)*w/22,jj=still?0:Math.abs(Math.sin(ts/(180-jump*60)+i*1.7))*h*.05*(.2+jump),hy=h*.93-jj;g.fillStyle="#0b0215";g.beginPath();g.arc(cx,hy,h*.03,0,7);g.fill();g.fillRect(cx-h*.035,hy+h*.02,h*.07,h*.1);
      if(jump>.4){g.strokeStyle="#0b0215";g.lineWidth=h*.012;g.beginPath();g.moveTo(cx-h*.02,hy+h*.03);g.lineTo(cx-h*.04,hy-h*.04*jump);g.moveTo(cx+h*.02,hy+h*.03);g.lineTo(cx+h*.04,hy-h*.04*jump);g.stroke()}
      if(kind==="wave"&&jump>.2){g.fillStyle="#fff7c2";g.shadowColor="#fff7c2";g.shadowBlur=10;g.beginPath();g.arc(cx+Math.sin(ts/300+i)*h*.03,hy-h*.06,3,0,7);g.fill();g.shadowBlur=0}}
    /* meter */var mw=w*.8,mx=w*.1,my=h*.06+40;g.fillStyle="rgba(20,5,43,.8)";rr(g,mx,my,mw,22,11);g.fill();var mc=meter>70?"#4ade80":meter>35?"#ffd166":"#ff2d95";g.fillStyle=mc;rr(g,mx+3,my+3,Math.max(6,(mw-6)*meter/100),16,8);g.fill();g.strokeStyle="#fff";g.lineWidth=2;rr(g,mx,my,mw,22,11);g.stroke();
    g.fillStyle="#fff";g.font="700 12px 'Fredoka',sans-serif";g.textAlign="left";g.fillText(T.showMeter[kind]+(SENS.mic&&(kind==="sing"||kind==="clap"||kind==="cheer")?" 🎤":SENS.motion&&(kind==="jump"||kind==="wave")?" 📳":""),mx,my-6);
    if(ts-pulse<120){g.fillStyle="rgba(255,255,255,.08)";g.fillRect(0,0,w,h)}
    if(meter>=99){end();sfx("cheer");buzz([80,40,80,40,200]);$("#hideMsg").textContent=T.showYes[p%T.showYes.length];say($("#hideMsg").textContent);
      setTimeout(function(){if(p<4)show2(p+1);else{G.fin=4;ach("encore");save();micOff();musicStop();$("#hide").hidden=true;finaleCine(function(){photoSheet("arrest",win)})}},1700);return}
    requestAnimationFrame(f)};requestAnimationFrame(f);
  $("#hideX").onclick=function(){end();micOff();musicStop();$("#hide").hidden=true;hush();back()}}
function back(){if(G.mode==="map"||G.mode==="demo"||G.mode==="in")chip();else render()}
function finaleCine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),w,h,dpr,t0=0,fin=false,raf=0;ov.hidden=false;ov.classList.add("fin");
  var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();sfx("win");
  var lines=T.finCine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;ov.classList.remove("fin");then()};$("#cineX").onclick=end;
  var q=rngOf(G.seed+3),fw=[];for(var i=0;i<14;i++)fw.push({x:.1+q()*.8,y:.1+q()*.35,t:q()*8,c:["#ff2d95","#ffd166","#2dd4bf","#a78bfa"][i%4]});
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?9:t;g.setTransform(dpr,0,0,dpr,0,0);drawStage(g,w,h,11,11,ts,true,{band:1});
    fw.forEach(function(p){var dt=(ph-p.t+8)%8;if(dt<0||dt>1.5)return;for(var k=0;k<12;k++){var a=k/12*6.28;g.fillStyle=p.c;g.globalAlpha=1-dt/1.5;g.beginPath();g.arc(p.x*w+Math.cos(a)*dt*80,p.y*h+Math.sin(a)*dt*80+dt*dt*30,3,0,7);g.fill()}g.globalAlpha=1});
    var s=Math.max(5,Math.min(w,h)*.02),K=G.c.sus[G.c.K];["luna","zoe","pip","indi"].forEach(function(k,i){var o=Object.assign({},PPL[k]);o.pose=ph>3?"up":"wave";o.bob=true;o.ph=i*120;o.prop=ph>3?"":o.prop;if(k==="pip"){o.glit=K.glit;o.hat=K.hoed;o.shoe=K.schoen}drawPerson(g,w*(.2+i*.17),h*.7,s,o,ts)});drawCrew(g,w*.88,h*.7,s*.9,G.av,ts,"up");
    if(ph>2){var fs=Math.round(Math.min(44,w*.09));g.textAlign="center";g.fillStyle="#ffd166";g.shadowColor="#ff2d95";g.shadowBlur=20;g.font="700 "+fs+"px 'Fredoka',sans-serif";g.fillText(T.found,w/2,h*.4);g.shadowBlur=0}
    if(ph>6){g.fillStyle="#fff";g.font="700 16px 'Fredoka',sans-serif";g.fillText((NAME?NAME.toUpperCase()+" & ":"")+T.crewW,w/2,h*.97)}
    var li=Math.min(lines.length-1,Math.floor(ph/2.2));txt.textContent=lines[li];if(li!==spoken&&!still){spoken=li;say(lines[li])}
    if(ph>11.5&&!still)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);if(still)setTimeout(end,4000)}

/* ---------- gewonnen: album, Backstage-pas ---------- */
var RES=null,TEAM=LS.get("ss_bs_team",""),CLUB=LS.get("ss_bs_club","");
function win(){if(window.MMP&&MMP.hasTreasure()&&!G.trDone){G.trDone=1;G.tEnd=G.tEnd||Date.now();save();return MMP.finale(win)}G.tEnd=G.tEnd||Date.now();var c=G.c,min=(G.tEnd-G.t0)/60000,s2=G.tries<=1,s3=(G.lost||0)<=NN(),stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:T.lvl[G.lvl||LEVEL]+" · "+T.lens[lenOf(NN())],code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.bs.day=MW.today();MW.profile.save(p)}Wk.stopWatch();buzz([100,50,100,50,300]);musicStop();
  var tm=window.MMP?MMP.team():{i:-1,name:"",col:null};
  RES={ph:G.ph.slice(),team:G.team,arrest:G.arrest,album:(G.album||[]).map(function(x){return x.u}),code:G.code,stars:stars,min:Math.round(min),secs:Math.round((G.tEnd-G.t0)/1000),v:vars(),seed:G.seed,n:NN(),lvl:G.lvl||LEVEL,tcol:tm.col,tname:tm.name,ach:Object.keys(G.ach),av:G.av,K:c.sus[c.K],xp:G.xp,tl:G.tl,coins:G.coins,songs:[0,1,2,3,4].map(function(p){return songAt(p).t})};
  sheet('<div class="eyebrow">'+T.won+' · '+esc(G.code)+'</div><div class="stars">'+starsHTML(stars)+'</div><h2>'+esc(T.found)+'</h2><canvas id="strip" width="1080" height="1350" class="stripc"></canvas><div class="tags"><i>'+Math.round(min)+' min</i><i>'+esc(rankName(G.tl))+'</i><i>'+G.xp+' '+T.xp+'</i><i>'+RES.ach.length+' 🏆</i></div>'+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+T.missed2+'</p>':'')+
    '<button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#strip");drawAlbum(cv,RES);$("#vDip").onclick=dipSheet;$("#vShare").onclick=function(){shareAlbum(cv)};$("#vDl").onclick=function(){dlCanvas(cv,albumName())};$("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP)MMP.result($("#sheetBody"),{code:G.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function starsHTML(n){var s="";for(var i=0;i<3;i++)s+='<span class="'+(i<n?"on":"")+'">★</span>';return s}
function loadImgs(list,cb){var IMG={},left=list.filter(Boolean).length;if(!left)return cb(IMG);list.filter(Boolean).forEach(function(src){if(IMG[src]!==undefined){if(--left===0)cb(IMG);return}IMG[src]=null;var im=new Image();im.onload=im.onerror=function(){IMG[src]=im.width?im:null;if(--left===0)cb(IMG)};im.src=src})}
function polaroid(g,im,x,y,pw,phh,cap2,rot,font,withBand){var imgH=phh-pw*.34;g.save();g.translate(x+pw/2,y+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);g.shadowColor="rgba(0,0,0,.5)";g.shadowBlur=18;g.shadowOffsetY=8;g.fillStyle="#fff";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
  var pad=pw*.06,iw=pw-2*pad;if(im){var s=Math.max(iw/im.width,imgH/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();g.drawImage(im,pad+(iw-w)/2,pad+(imgH-h)/2,w,h);g.restore()}else{g.save();g.translate(pad,pad);g.beginPath();g.rect(0,0,iw,imgH);g.clip();drawStage(g,iw,imgH,11,11,0,false);drawCrew(g,iw/2,imgH-10,imgH*.08,RES.av,0,"up");g.restore()}
  if(withBand){g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();var s2=imgH*.055,K=RES.K;drawPerson(g,pad+iw*.12,pad+imgH-6,s2,PPL.luna,0);var pp=Object.assign({},PPL.pip,{glit:K.glit,hat:K.hoed,shoe:K.schoen,pose:"wave"});drawPerson(g,pad+iw*.88,pad+imgH-6,s2,pp,0);g.restore()}
  g.fillStyle="#1e1b4b";g.font=font;g.textAlign="center";g.fillText(cap2,pw/2,phh-pw*.1,pw-20);g.restore()}
function albumName(){return (L==="nl"?"backstage-album-":"backstage-album-")+RES.code+".jpg"}
function dlCanvas(cv,name){try{cv.toBlob(function(b){if(!b)return;var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)},"image/jpeg",.88)}catch(e){toast(T.noFile)}}
function shareAlbum(cv){var txt=fill(T.shareTxt,{c:RES.code,s:"★".repeat(RES.stars),m:RES.min})+location.origin+location.pathname+"#z="+RES.code;cv.toBlob(function(b){var f=null;try{f=b&&new File([b],albumName(),{type:"image/jpeg"})}catch(e){}if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:txt}).catch(function(){})}else{dlCanvas(cv,albumName());toast(T.albumSaved)}},"image/jpeg",.88)}
function albumSheet(){if(!RES)return;sheet('<div class="eyebrow">'+esc(T.albumH)+'</div><canvas id="strip" width="1080" height="1350" class="stripc"></canvas><button type="button" class="btn" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button>',true);var cv=$("#strip");drawAlbum(cv,RES);$("#vShare").onclick=function(){shareAlbum(cv)};$("#vDl").onclick=function(){dlCanvas(cv,albumName())};$("#dBack").onclick=function(){closeSheet();winBack()}}
function drawAlbum(cv,r){var g=cv.getContext("2d"),W2=1080,pics=[{u:r.team,c:T.teamH}].concat((r.album||[]).map(function(u,i){return{u:u,c:T.poseH+" "+(i+1)}})).concat([{u:r.arrest,c:T.arrestH,ch:true}]),rows=Math.ceil(pics.length/2),PH=560,H=340+rows*PH+330;cv.width=W2;cv.height=H;
  loadImgs(pics.map(function(p){return p.u}),function(IMG){var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#1a0433");gr.addColorStop(.5,"#3b0764");gr.addColorStop(1,"#1a0433");g.fillStyle=gr;g.fillRect(0,0,W2,H);var q=rngOf(r.seed);for(var i=0;i<110;i++)sparkle(g,q()*W2,q()*H,3+q()*7,["#ff2d95","#ffd166","#2dd4bf","#a78bfa","#fff"][i%5],q()*6);
    if(r.tcol){g.fillStyle=r.tcol;g.fillRect(0,40,W2,22);g.fillStyle="#fff";g.font="700 18px 'Nunito',sans-serif";g.textAlign="center";g.fillText(fill(T.albumTeam,{t:r.tname}).toUpperCase(),W2/2,58)}
    g.textAlign="center";g.fillStyle="#ffd166";g.shadowColor="#ff2d95";g.shadowBlur=24;g.font="700 76px 'Fredoka',sans-serif";var ttl=r.v.J?fill(T.albumTitleJ,{J:r.v.J}):T.albumTitle;g.fillText(ttl,W2/2,150,W2-80);g.shadowBlur=0;
    g.fillStyle="#ffe4f2";g.font="600 28px 'Nunito',sans-serif";g.fillText(fill(T.albumSub,{c:r.code,m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars),l:T.lvl[r.lvl]||"",n:T.lens[lenOf(r.n)]||""}),W2/2,206,W2-60);
    g.fillStyle="#2dd4bf";g.font="700 26px 'Nunito',sans-serif";g.fillText(fill(T.albumFound,{tl:rankName(r.tl),xp:r.xp,co:r.coins,a:r.ach.length}),W2/2,250,W2-80);
    g.fillStyle="#fff";g.font="700 30px 'Permanent Marker',cursive";g.fillText(r.songs.join("  ·  "),W2/2,300,W2-80);
    var pw=440,ph=PH-50;pics.forEach(function(p,i){var col=i%2,row=Math.floor(i/2),alone=i===pics.length-1&&pics.length%2===1,x=alone?(W2-pw)/2:col?W2-80-pw:80,y=330+row*PH+(col?18:0);polaroid(g,IMG[p.u],x,y,pw,ph,p.c,(i%2?.03:-.03)*(row%2?-1:1),"700 30px 'Permanent Marker',cursive",!!p.ch)});
    var sy=330+rows*PH+20;g.save();g.translate(W2/2-200,sy);drawStage(g,400,220,11,11,0,false);g.restore();drawCrew(g,140,H-40,16,r.av,0,"up");drawPerson(g,W2-140,H-40,16,PPL.luna,0);
    g.fillStyle="#ffe4f2";g.font="600 24px 'Nunito',sans-serif";g.fillText(T.stripSub,W2/2,H-34)})}
function endCase(){LS.del(GK);G=null;hush();home()}
function dipSheet(){if(!RES)return;sheet('<h2>'+T.dipH+'</h2><p>'+T.dipClubT+'</p><input class="inp team" id="dClub" autocomplete="off" maxlength="40" placeholder="'+esc(T.dipClubP)+'" value="'+esc(CLUB)+'"><p>'+T.dipT+'</p><input class="inp team" id="dTeam" autocomplete="off" maxlength="120" placeholder="'+esc(T.dipP)+'" value="'+esc(TEAM)+'"><button type="button" class="btn" id="dGo">'+T.dipGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){closeSheet();winBack()};$("#dGo").onclick=function(){TEAM=$("#dTeam").value.trim();CLUB=$("#dClub").value.trim().slice(0,40);LS.set("ss_bs_team",TEAM);LS.set("ss_bs_club",CLUB);dipShow()}}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div><h2>'+esc(T.found)+'</h2><button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vAlb">📷 '+T.albumBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  $("#vDip").onclick=dipSheet;$("#vAlb").onclick=albumSheet;$("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP&&RES.secs!=null)MMP.result($("#sheetBody"),{code:RES.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function dipShow(){var r=RES;sheet('<div class="eyebrow">'+esc(T.dipH)+'</div><canvas id="dip" width="1240" height="1754" class="stripc a4"></canvas><p class="note">'+esc(T.dipNote)+'</p><button type="button" class="btn" id="dPdf">'+T.dipPdf+'</button><button type="button" class="btn ghost dk" id="dImg">'+T.dipImg+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#dip"),fname=L==="nl"?"backstage-pas":"backstage-pass";drawDiploma(cv,r);
  $("#dPdf").onclick=function(){var jpg=cv.toDataURL("image/jpeg",.9),blob=pdfFromJpeg(jpg,cv.width,cv.height),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=fname+"-"+r.code+".pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)};
  $("#dImg").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],fname+"-"+r.code+".jpg",{type:"image/jpeg"});if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){})}else{var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.9);a.download=fname+"-"+r.code+".jpg";document.body.appendChild(a);a.click();a.remove()}},"image/jpeg",.9)};
  $("#dBack").onclick=function(){closeSheet();winBack()};$("#vHome").onclick=function(){closeSheet();endCase()}}
function names(g,team,y,W2,col){if(!team)return y;var list=team.split(/[,;]+/).map(function(s){return s.trim()}).filter(Boolean),line="",lines=[];g.font="700 38px 'Permanent Marker','Comic Sans MS',cursive";g.textAlign="center";
  list.forEach(function(nm){var t=line?line+"  ·  "+nm:nm;if(g.measureText(t).width>W2-300&&line){lines.push(line);line=nm}else line=t});if(line)lines.push(line);g.fillStyle=col;lines.slice(0,3).forEach(function(l){g.fillText(l,W2/2,y);y+=48});return y+10}
/* de Backstage-pas: een A4 met een grote pas aan een koord */
function drawDiploma(cv,r){var g=cv.getContext("2d"),W2=cv.width,H=cv.height,v=r.v,dateStr=new Date().toLocaleDateString(L==="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"});
  loadImgs([r.team,r.arrest],function(IMG){var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#1a0433");gr.addColorStop(1,"#3b0764");g.fillStyle=gr;g.fillRect(0,0,W2,H);var q=rngOf(r.seed+9);for(var i=0;i<140;i++)sparkle(g,q()*W2,q()*H,3+q()*8,["#ff2d95","#ffd166","#2dd4bf","#a78bfa","#fff"][i%5],q()*6);
    /* koord */g.strokeStyle="#ff2d95";g.lineWidth=38;g.beginPath();g.moveTo(W2*.28,-20);g.lineTo(W2/2-40,150);g.moveTo(W2*.72,-20);g.lineTo(W2/2+40,150);g.stroke();g.fillStyle="#fff";g.font="700 22px 'Fredoka',sans-serif";g.save();g.translate(W2*.36,60);g.rotate(.9);g.fillText("NOVA · NOVA · NOVA",0,8);g.restore();
    g.fillStyle="#cbd5e1";rr(g,W2/2-60,130,120,44,12);g.fill();
    /* de pas */var px0=110,py0=180,pw=W2-220,ph=H-260;g.save();g.shadowColor="rgba(0,0,0,.5)";g.shadowBlur=40;g.fillStyle="#fffaf5";rr(g,px0,py0,pw,ph,40);g.fill();g.restore();g.fillStyle="#1a0433";rr(g,W2/2-70,py0+28,140,26,13);g.fill();
    g.save();g.beginPath();rr(g,px0,py0,pw,ph,40);g.clip();var hg=g.createLinearGradient(0,py0,0,py0+330);hg.addColorStop(0,"#ff2d95");hg.addColorStop(1,"#a21caf");g.fillStyle=hg;g.fillRect(px0,py0,pw,330);for(i=0;i<40;i++)sparkle(g,px0+q()*pw,py0+q()*320,3+q()*6,"rgba(255,255,255,.7)",q()*6);g.restore();
    g.textAlign="center";g.fillStyle="#fff";g.font="700 118px 'Fredoka',sans-serif";g.shadowColor="rgba(0,0,0,.25)";g.shadowBlur=12;g.fillText(T.dipTitle,W2/2,py0+180);g.shadowBlur=0;g.font="700 40px 'Fredoka',sans-serif";g.fillStyle="#ffd166";g.fillText(T.dipSub,W2/2,py0+250);
    g.fillStyle="#1a0433";g.font="700 30px 'Nunito',sans-serif";g.fillText(v.J?fill(T.dipL2,{J:v.J}):T.dipL2b,W2/2,py0+300,pw-80);
    var y=py0+380;g.fillStyle="#3b0764";g.font="500 32px 'Nunito',sans-serif";g.fillText(T.dipL1,W2/2,y,pw-100);y+=46;g.fillText(T.dipL3,W2/2,y,pw-100);y+=30;
    var nm=TEAM?TEAM.split(/[,;]+/).filter(function(s){return s.trim()}).length:0,extra=(CLUB?90:0)+(TEAM?60+Math.min(3,Math.ceil(nm/5))*48:0)+(r.tcol?30:0),pph=Math.max(200,Math.min(400,H-600-y-extra-80)),ppw=Math.round(pph*.825),gap=50,x0=(W2-2*ppw-gap)/2;polaroid(g,IMG[r.team],x0,y,ppw,pph,T.teamH,-.03,"700 26px 'Permanent Marker',cursive",false);polaroid(g,IMG[r.arrest],x0+ppw+gap,y+14,ppw,pph,T.arrestH,.03,"700 26px 'Permanent Marker',cursive",true);y+=pph+80;
    if(r.tcol){g.fillStyle=r.tcol;g.fillRect(px0+40,y-40,pw-80,10);g.font="700 22px 'Nunito',sans-serif";g.fillText(fill(T.albumTeam,{t:r.tname}).toUpperCase(),W2/2,y-8);y+=30}
    if(CLUB){g.fillStyle="#a21caf";g.font="700 22px 'Fredoka',sans-serif";g.fillText(T.dipClub,W2/2,y);y+=50;g.fillStyle="#1a0433";g.font="700 46px 'Fredoka',sans-serif";g.fillText(CLUB,W2/2,y,pw-120);y+=40}
    if(TEAM){g.fillStyle="#a21caf";g.font="700 22px 'Fredoka',sans-serif";g.fillText(T.dipTeam,W2/2,y);y+=50;y=names(g,TEAM,y,W2,"#1a0433")}
    /* setlist in handschrift */y=H-570;g.save();g.translate(px0+70,y+10);g.rotate(-.03);g.fillStyle="#fff";g.shadowColor="rgba(0,0,0,.2)";g.shadowBlur=14;g.fillRect(0,0,420,300);g.shadowBlur=0;g.fillStyle="#ff2d95";g.font="700 34px 'Permanent Marker',cursive";g.textAlign="left";g.fillText("SETLIST",24,50);g.fillStyle="#1e1b4b";g.font="400 28px 'Permanent Marker',cursive";r.songs.forEach(function(s,i){g.fillText((i+1)+". "+s,24,100+i*42,380)});g.restore();
    g.textAlign="center";g.fillStyle="#3b0764";g.font="700 26px 'Nunito',sans-serif";g.fillText(fill(T.dipL4,{tl:rankName(r.tl),xp:r.xp,co:r.coins}),W2*.72,y+60,420);g.fillStyle="#6b7280";g.font="500 22px 'Nunito',sans-serif";g.fillText(fill(T.dipDate2,{d:dateStr,m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars),n:r.n,l:T.lens[lenOf(r.n)]||"",v:T.lvl[r.lvl]||""}),W2*.72,y+100,420);
    if(r.ach.length){r.ach.slice(0,6).forEach(function(k,i){var bx=W2*.72-200+(i%2)*205,by=y+130+Math.floor(i/2)*52;g.fillStyle="rgba(255,45,149,.1)";rr(g,bx,by,195,42,10);g.fill();g.fillStyle="#a21caf";g.font="700 18px 'Nunito',sans-serif";g.fillText("🏆 "+T.ach[k][0],bx+97,by+28,180)})}
    g.save();g.translate(W2-270,H-185);g.rotate(-.12);g.strokeStyle="#ffd166";g.lineWidth=6;g.strokeRect(-110,-45,220,80);g.fillStyle="#ffd166";g.font="700 46px 'Fredoka',sans-serif";g.fillText(T.dipStamp,0,14);g.restore();
    var sy=H-170;g.strokeStyle="#a21caf";g.lineWidth=2;g.beginPath();g.moveTo(px0+80,sy);g.lineTo(px0+520,sy);g.stroke();g.fillStyle="#1e1b4b";g.font="700 44px 'Permanent Marker',cursive";g.textAlign="center";g.fillText(T.dipSignN,px0+300,sy-14);g.fillStyle="#6b7280";g.font="500 22px 'Nunito',sans-serif";g.fillText(T.dipSign,px0+300,sy+34);
    g.fillStyle="#6b7280";g.font="500 20px 'Nunito',sans-serif";g.fillText(fill(T.dipFoot,{c:r.code}),W2/2,H-104)})}
function pdfFromJpeg(dataURL,w,h){var b64=dataURL.split(",")[1],bin=atob(b64),n=bin.length,img=new Uint8Array(n);for(var i=0;i<n;i++)img[i]=bin.charCodeAt(i);
  var PW=595.28,PH=841.89,enc=function(s){var u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u},parts=[],off=[],pos=0,push=function(u){parts.push(u);pos+=u.length};
  push(enc("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"));var objs=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+PW+" "+PH+"] /Resources << /XObject << /Im1 5 0 R >> >> /Contents 4 0 R >>"];
  var content="q "+PW+" 0 0 "+PH+" 0 0 cm /Im1 Do Q";objs.push("<< /Length "+content.length+" >>\nstream\n"+content+"\nendstream");objs.forEach(function(o,i){off[i+1]=pos;push(enc((i+1)+" 0 obj\n"+o+"\nendobj\n"))});
  off[5]=pos;push(enc("5 0 obj\n<< /Type /XObject /Subtype /Image /Width "+w+" /Height "+h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+n+" >>\nstream\n"));push(img);push(enc("\nendstream\nendobj\n"));
  var x=pos,xref="xref\n0 6\n0000000000 65535 f \n";for(i=1;i<=5;i++)xref+=String(off[i]).padStart(10,"0")+" 00000 n \n";push(enc(xref+"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+x+"\n%%EOF\n"));return new Blob(parts,{type:"application/pdf"})}

/* ---------- zaakcode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();LEN=lenOf(p.n);LS.set("ss_bs_len",LEN);LEVEL=p.lvl;LS.set("ss_bs_level",LEVEL);begin(p.seed,p.mode,false,p.n)};$("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.bs,log=(g&&g.log)||[];sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min</small><div class="tags"><i>'+"★".repeat(x.st||0)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();KM.leave();stopSteps();G=null;hush();home()}
function wipeGame(){LS.del(GK);Wk.stopWatch();KM.leave();stopSteps();G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);MW.profile.wipe();if(/github\.io$/.test(location.hostname))LS.del(MW.pro.freeKey(ID));closeSheet();home();toast(T.wiped)})}}
function goBack(){if(!$("#hide").hidden){$("#hideX").click();return true}if(!$("#cine").hidden){$("#cineX").click();return true}
  if(!$("#sheet").hidden){if($("#sheet").dataset.lock){var x=$("#vHome")||$("#shX")||$("#bNext")||$("#pSkip")||$("#bPhoto")||$("#hjX")||$("#eA");if(x)x.click()}else closeSheet();return true}
  if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({bs:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({bs:1},"")}catch(e){}}})}catch(e){}

/* ---------- startscherm: nachtelijk buurtfeest, podium met lichtshow, een verlaten drumstokje ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),w,h,dpr=1;function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr}rs();addEventListener("resize",rs);
  var photo=$("#home").classList.contains("photo");
  function f(t){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);if($("#home").hidden){requestAnimationFrame(f);return}var base=Math.min(h*.5,400),sh=base;
    if(!photo){g.save();g.beginPath();g.rect(0,0,w,sh+40);g.clip();drawStage(g,w,sh+40,8,11,t,true);g.restore();
      g.fillStyle="#2a1f3d";g.fillRect(0,sh+40,w,24);g.save();g.translate(w*.7,sh+52);g.rotate(.3);g.strokeStyle="#d4a373";g.lineWidth=6;g.lineCap="round";g.beginPath();g.moveTo(-26,0);g.lineTo(26,0);g.stroke();g.restore()}
    for(var i=0;i<12;i++){var x=(i*97)%w,y=(i*53)%sh;sparkle(g,x,y,3,["#ff2d95","#ffd166","#2dd4bf"][i%3],still?0:t/500+i)}
    if(!photo){var gr=g.createLinearGradient(0,sh*.5,0,sh+64);gr.addColorStop(0,"rgba(18,2,31,0)");gr.addColorStop(1,"rgba(18,2,31,.95)");g.fillStyle=gr;g.fillRect(0,sh*.5,w,sh*.5+64)}
    if(!still)requestAnimationFrame(f)}requestAnimationFrame(f)}
hero();
if(/debug/.test(location.search))window.BS_TEST={G:function(){return G},parse:parseCode,make:makeCode,gen:genCase,task:function(i){var sp=G.st&&G.st.filter(function(x){return x.fi===i})[0];taskSheet(i,sp||null)},fin:function(n){G.fin=n||0;finaleGate()},all:function(){G.c.slots.forEach(function(s,i){if(!G.ph[i]){G.ph[i]="x";if(G.st&&G.st[i])G.st[i].done=true}});save()},show:function(p){show2(p||0)},PUZ:PUZ,draw:{person:drawPerson,stage:drawStage,item:drawItem}};
/* ---------- start ---------- */
var hz=/[#&]z=([A-Z0-9]+)/i.exec(location.hash);
if(window.MMP)MMP.init({id:ID,fin:{nl:'Max fluistert: er is nog één verrassing na de show. Er ligt iets voor jullie verstopt, echt, niet op het scherm.',en:'Max whispers: there is one more surprise after the show. Something is hidden for you, for real, not on the screen.'}});
home();if(hz){var pc=parseCode(hz[1]);if(pc)codeSheet(hz[1].toUpperCase())}
MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
})();
