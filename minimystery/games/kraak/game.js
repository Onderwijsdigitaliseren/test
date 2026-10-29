/* De Grote Kraak / The Big Heist – kinderwandeling 9–12 (boef-en-politie + vluchtspel). Spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js, walk.js, steps.js, kidsmap.js, party.js, crew.js, voice.js en GK_DATA (data-xx.js).
   Deel 1 – de voorbereiding: per stop een kraak-puzzel (verkenning, laser-doolhof, vermomming, kluisslot op het gehoor, plattegrond, stroom eraf, foto-agent,
   stille tocht, vingerafdrukken wissen, sleutels, alarmcode, uitkijkpost) en een onderdeel van het plan (verzamelvoortgang), plus een cijfer van de kluiscode,
   een spoor over de schuilkluis of een tipgever (één zit ernaast, of liegt op Meesterdief). De kraak: nep-kroon, alarm.
   Deel 2 – de ontsnapping: op de kaart rijden politiewagens met een zoeklicht (stilstaan!), er duiken wegversperringen op en soms een helikopter; zonder kaart
   is de ontsnapping een kantelspel op het scherm. Finale: welke schuilkluis (vijf plekken, drie kenmerken), de kluis in 3D (code, samen de deur opentrekken),
   de twist met Stella Blauw, foto met de Kroon, album en Meesterdief-certificaat. Alle figuren tekent het spel zelf op canvas; muziek via WebAudio.
   Niveaus "rookie"/"meester". Lengte 5/8/11 stops. Standen "map","demo","street","in". Codes GK… */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.GK_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="gk",GK="ss_game_gk_"+L,WK="ss_ways_gk_"+L,hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz;function closeSheet(){mg.stop();hush();Wk.closeSheet()}
var G=null,tick=0,MODE=LS.get("ss_gk_mode","map"),NAME=LS.get("ss_gk_name",""),VOICE=LS.get("ss_gk_voice",true),LEVEL=LS.get("ss_gk_level","rookie"),LEN=LS.get("ss_gk_len","normaal"),MUSIC=LS.get("ss_gk_music",true);
var LENS={kort:5,normaal:8,lang:11};if(!LENS[LEN])LEN="normaal";if(LEVEL!=="rookie"&&LEVEL!=="meester")LEVEL="rookie";
var ATK=["omg","deur","naast"],ACTS=["scout","laser","disguise","dial","blueprint","wires","photo","silence","wipe","keys","alarm","lookout"];
var EVPOS={5:[1,2,3],8:[1,3,5],11:[2,5,8]},CODEPOS={5:[0,1,3,4],8:[0,2,4,6],11:[0,3,6,9]},WITPOS={5:[2,4],8:[2,4,6,7],11:[1,3,6,9,10]},POSE_AT={5:[3],8:[4],11:[4,8]},PUL=["time","shield","hint","xp2","coin2"];
var PRIO=[0,1,2,3,4,5,6,7,8,9,10],WITK=["bas","jet","tom","mies","henk"];
function NN(){return (G&&G.n)||8}function lenOf(n){return n===5?"kort":n===11?"lang":"normaal"}function hard(){return LEVEL==="meester"}
var W=[],P={x:0,y:0,acc:0},R0=550,map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null,photoFor=null,lastFix=0,GL={on:false,t0:0,x:0,y:0,dir:1,next:0};
var mg={raf:0,tm:[],iv:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[];this.iv.forEach(clearInterval);this.iv=[];if(this.off){this.off();this.off=null}}};
var C={night:"#0b1430",deep:"#060b1c",blue:"#1a2b5e",gold:"#f2b705",red:"#ff3b3b",laser:"#39ff88",light:"#3aa0ff",paper:"#101c42",ink:"#eaf0ff",grey:"#94a3b8",white:"#ffffff"};
var AVC=["#1f2937","#39ff88","#f2b705","#ff3b3b"],DOORC=["#e63946","#2a9d4b","#2563eb"],still=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- hulpjes ---------- */
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function mmss(ms){var s=Math.max(0,Math.floor(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function rr(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function rankOf(xp){return Math.min(10,1+Math.floor((xp||0)/200))}
function rankName(l){return T.ranks[Math.max(0,Math.min(9,(l||1)-1))]}
if(window.MMVoice)MMVoice.init("kraak",L);
function say(t){if(!VOICE||!t)return;if(window.MMVoice)return MMVoice.say(t);try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(String(t).replace(/[“”"«»]/g,"").replace(/\{[^}]+\}/g,""));u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.95;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
function bubble(txt,who,cls,av){return '<div class="msg '+(cls||"")+'">'+(av||AV("opa"))+'<div class="bub"><button type="button" class="spk" aria-label="'+esc(T.listen)+'" data-say="'+esc(txt)+'">🔊</button>'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+esc(txt)+'</p></div></div>'}
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){var v=VOICE;VOICE=true;say(b.dataset.say);VOICE=v}});

/* ---------- geluid: alles met WebAudio, geen bestanden ---------- */
var AC=null;function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}return AC}
function tone(f,d,type,vol,when,slide){if(!Wk.sound())return;var a=ac();if(!a)return;try{var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(when||0);o.type=type||"triangle";o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(vol||.06,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
function noise(d,vol,when,hp){if(!Wk.sound())return;var a=ac();if(!a)return;try{var n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),ch=b.getChannelData(0);for(var i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);var s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime+(when||0);s.buffer=b;f.type="highpass";f.frequency.value=hp||800;g.gain.value=vol||.05;s.connect(f);f.connect(g);g.connect(a.destination);s.start(t)}catch(e){}}
var SFX={coin:function(){tone(1319,.08,"sine",.06);tone(1760,.2,"sine",.05,.06)},hurt:function(){tone(330,.25,"sawtooth",.06,0,165)},bad:function(){tone(200,.2,"square",.05)},click:function(){tone(1200,.03,"square",.05);noise(.03,.04,0,3000)},hit:function(){tone(880,.06,"triangle",.05)},
  clear:function(){[523,659,784,1047].forEach(function(f,i){tone(f,.18,"triangle",.07,i*.1)});tone(1319,.5,"triangle",.07,.42)},
  levelup:function(){[392,523,659,784,1047,1319].forEach(function(f,i){tone(f,.14,"sine",.07,i*.08)})},
  boot:function(){tone(55,.6,"sawtooth",.06,0,110);noise(.4,.04,.2,300);tone(220,.5,"triangle",.05,.5)},
  whoosh:function(){noise(.4,.05,0,1200);tone(900,.3,"sine",.03,0,300)},
  alarm:function(){for(var i=0;i<6;i++){tone(i%2?620:880,.22,"square",.05,i*.25)}},
  siren:function(){for(var i=0;i<4;i++){tone(600,.35,"triangle",.045,i*.7,900);tone(900,.35,"triangle",.045,i*.7+.35,600)}},
  radio:function(){noise(.15,.04,0,1500);tone(700,.08,"square",.03,.15)},
  heli:function(){for(var i=0;i<16;i++)noise(.06,.05,i*.09,200)},
  engine:function(){tone(70,.6,"sawtooth",.04,0,90)},
  win:function(){[523,659,784,1047,784,1047,1319,1568].forEach(function(f,i){tone(f,.16,"triangle",.07,i*.11)});noise(1.5,.05,.6,900)}};
function sfx(k){if(SFX[k])SFX[k]()}
/* spanningsmuziek: 8-staps sequencer met bas en pizzicato */
var MUS={iv:0,step:0,pat:null};
var PATS={map:{bpm:96,bass:[73,0,73,0,87,0,65,0],lead:[0,587,0,523,0,0,494,0],kick:[1,0,0,1,0,0,1,0]},
  esc:{bpm:150,bass:[73,73,87,87,65,65,98,98],lead:[587,0,659,587,0,523,0,494],kick:[1,0,1,0,1,0,1,1]},
  vault:{bpm:80,bass:[55,0,0,0,65,0,0,0],lead:[0,0,440,0,0,0,415,0],kick:[1,0,0,0,0,0,1,0]}};
function music(name){musicStop();if(!MUSIC||!name||!Wk.sound())return;var a=ac();if(!a)return;MUS.pat=PATS[name];MUS.step=0;var dt=60/MUS.pat.bpm/2;
  MUS.iv=setInterval(function(){if(!Wk.sound()||!MUSIC)return;var p=MUS.pat,i=MUS.step%8;if(p.bass[i])tone(p.bass[i],dt*.9,"triangle",.045);if(p.lead[i]&&MUS.step%16<12)tone(p.lead[i],dt*.5,"sine",.02);if(p.kick[i])tone(80,.1,"sine",.05,0,40);MUS.step++},dt*1000)}
function musicStop(){clearInterval(MUS.iv);MUS.iv=0}

/* ---------- figuren: alles getekend op canvas ---------- */
/* o={skin,hair,hs(0 kaal,1 kort,2 knot,3 lang,4 krullen),top,legs,hat,glasses,beard,must,pose,prop} ; (x,y)=voeten, s=maat (figuur ≈ 9s hoog) */
var PPL={
  opa:{skin:"#e8c2a0",hair:"#cbd5e1",hs:1,top:"#3f3f46",legs:"#1f2937",hat:0,beard:1,prop:"cane",shoe:0},
  baron:{skin:"#f1d2b6",hair:"#2b1a10",hs:1,top:"#4c1d95",legs:"#1e1b4b",hat:1,glasses:3,must:1,prop:"cane2",shoe:2},
  stella:{skin:"#d2a679",hair:"#1f1147",hs:2,top:"#1d4ed8",legs:"#1e3a8a",hat:2,prop:"",shoe:0},
  bas:{skin:"#f1c27d",hair:"#3b2a14",hs:1,top:"#334155",legs:"#1f2937",hat:3,prop:"torch",shoe:0},
  jet:{skin:"#8d5524",hair:"#111",hs:2,top:"#0ea5e9",legs:"#1f2937",hat:4,prop:"mop",shoe:1},
  tom:{skin:"#ffdbac",hair:"#d9480f",hs:1,top:"#dc2626",legs:"#1f2937",hat:5,prop:"pizza",shoe:1},
  mies:{skin:"#ffe0bd",hair:"#e5e7eb",hs:2,top:"#be185d",legs:"#581c87",glasses:1,prop:"",shoe:0},
  henk:{skin:"#e0ac69",hair:"#64748b",hs:1,top:"#92400e",legs:"#1f2937",hat:7,must:1,prop:"torch",shoe:0}};
Object.keys(PPL).forEach(function(k){PPL[k].k=k});
/* ---------- artwork van Kellie (webp in img/); ontbreekt een plaatje, dan tekent het spel het zelf ---------- */
var IMGS={},IMGBASE=(MW.root||"")+"games/kraak/img/";
function img(k){var e=IMGS[k];if(e===undefined){var im=new Image();im.onload=function(){IMGS[k]=im};im.onerror=function(){IMGS[k]=null};im.src=IMGBASE+k+".webp";IMGS[k]=false;return null}return e||null}
["opa","opa-wink","baron","baron-angry","stella","bas","jet","tom","mies","henk","crown","crown-fake","car","heli","vault","hero","scene-heist","scene-finale"].forEach(img);
function fig(g,k,x,y,h,o){var im=img(k);if(!im)return false;o=o||{};var w=h*im.width/im.height;g.save();if(o.alpha!=null)g.globalAlpha=o.alpha;if(o.flip){g.translate(x,0);g.scale(-1,1);g.drawImage(im,-w/2,y-h,w,h)}else g.drawImage(im,x-w/2,y-h,w,h);g.restore();return w}
function fit(g,k,x,y,bw,bh){var im=img(k);if(!im)return false;var s=Math.min(bw/im.width,bh/im.height),w=im.width*s,h=im.height*s;g.drawImage(im,x-w/2,y-h/2,w,h);return true}
function sceneBg(g,k,w,h){var im=img(k);if(!im)return false;var s=Math.max(w/im.width,h/im.height),iw=im.width*s,ih=im.height*s;g.drawImage(im,(w-iw)/2,(h-ih)/2,iw,ih);return true}
function hatDraw(g,cx,cy,r,k){g.save();
  if(k===0){g.fillStyle="#6b4f2a";g.beginPath();g.ellipse(cx,cy-.6*r,1.15*r,.55*r,0,Math.PI,0);g.fill();g.fillRect(cx-1.1*r,cy-.65*r,2.5*r,.18*r)}
  else if(k===1){g.fillStyle="#111827";g.beginPath();g.ellipse(cx,cy-.75*r,1.3*r,.28*r,0,0,7);g.fill();rr(g,cx-.78*r,cy-2.1*r,1.56*r,1.4*r,.12*r);g.fill();g.fillStyle="#f2b705";g.fillRect(cx-.78*r,cy-1.15*r,1.56*r,.2*r)}
  else if(k===2||k===3){g.fillStyle=k===2?"#1e3a8a":"#334155";g.beginPath();g.ellipse(cx,cy-.6*r,1.1*r,.6*r,0,Math.PI,0);g.fill();g.fillRect(cx-1.1*r,cy-.68*r,2.2*r,.22*r);g.fillStyle="#111";g.beginPath();g.ellipse(cx+.1*r,cy-.45*r,1.15*r,.22*r,0,0,Math.PI);g.fill();g.fillStyle="#f2b705";g.beginPath();g.arc(cx,cy-.9*r,.18*r,0,7);g.fill()}
  else if(k===4){g.fillStyle="#f472b6";g.beginPath();g.ellipse(cx,cy-.45*r,1.12*r,.9*r,0,Math.PI,0);g.fill();g.beginPath();g.moveTo(cx+.9*r,cy-.1*r);g.lineTo(cx+1.5*r,cy+.4*r);g.lineTo(cx+.7*r,cy+.3*r);g.fill()}
  else if(k===5){g.fillStyle="#dc2626";g.beginPath();g.ellipse(cx,cy-.3*r,1.15*r,1.1*r,0,Math.PI,0);g.fill();g.fillStyle="#fff";g.fillRect(cx-1.15*r,cy-.35*r,2.3*r,.16*r)}
  else if(k===7){g.fillStyle="#1e293b";g.beginPath();g.ellipse(cx,cy-.45*r,1.1*r,.95*r,0,Math.PI,0);g.fill();g.fillRect(cx-1.1*r,cy-.55*r,2.2*r,.3*r)}
  g.restore()}
function drawHeadAt(g,cx,cy,r,o,t){o=o||{};var hc=o.hair||"#3b2a14",sk=o.skin||"#f1c27d",hs=o.hs||1;g.save();
  g.fillStyle=hc;if(hs===3){rr(g,cx-1.18*r,cy-.9*r,2.36*r,2.5*r,.9*r);g.fill()}else if(hs===4){for(var i=0;i<9;i++){var a=Math.PI*(.9+i*.15);g.beginPath();g.arc(cx+Math.cos(a)*1.05*r,cy+Math.sin(a)*1.0*r+.1*r,.42*r,0,7);g.fill()}}
  else if(hs===2){g.beginPath();g.arc(cx,cy-1.1*r,.48*r,0,7);g.fill()}
  g.fillStyle=sk;g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
  if(hs!==0){g.fillStyle=hc;g.beginPath();g.ellipse(cx,cy-.28*r,1.04*r,.78*r,0,Math.PI,0);g.fill();if(hs===1){g.beginPath();g.ellipse(cx,cy-.4*r,1.06*r,.7*r,0,Math.PI*.95,Math.PI*2.05);g.fill()}}
  var blink=(!still&&t&&Math.floor((t+(o.ph||0))/2600)%9===0)?.25:1;g.fillStyle="#1e1b2e";[-.42,.42].forEach(function(dx){g.beginPath();g.ellipse(cx+dx*r,cy+.12*r,.13*r,.17*r*blink,0,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.arc(cx+dx*r+.04*r,cy+.06*r,.05*r,0,7);g.fill();g.fillStyle="#1e1b2e"});
  g.strokeStyle="#7a2e3a";g.lineWidth=Math.max(1,.08*r);g.beginPath();if(o.frown)g.arc(cx,cy+.75*r,.3*r,1.15*Math.PI,1.85*Math.PI);else g.arc(cx,cy+.36*r,.3*r,.15*Math.PI,.85*Math.PI);g.stroke();
  if(o.must){g.fillStyle=hc;g.beginPath();g.ellipse(cx-.25*r,cy+.42*r,.3*r,.12*r,-.2,0,7);g.ellipse(cx+.25*r,cy+.42*r,.3*r,.12*r,.2,0,7);g.fill()}
  if(o.beard){g.fillStyle=hc;g.beginPath();g.arc(cx,cy+.4*r,.72*r,0,Math.PI);g.fill()}
  if(o.glasses===1){g.strokeStyle="#7c3aed";g.lineWidth=.1*r;g.beginPath();g.arc(cx-.42*r,cy+.12*r,.28*r,0,7);g.stroke();g.beginPath();g.arc(cx+.42*r,cy+.12*r,.28*r,0,7);g.stroke()}
  if(o.glasses===2){g.fillStyle="#111";rr(g,cx-.95*r,cy-.05*r,.8*r,.4*r,.15*r);g.fill();rr(g,cx+.15*r,cy-.05*r,.8*r,.4*r,.15*r);g.fill();g.fillRect(cx-.2*r,cy,.4*r,.08*r)}
  if(o.glasses===3){g.strokeStyle="#f2b705";g.lineWidth=.1*r;g.beginPath();g.arc(cx+.42*r,cy+.12*r,.3*r,0,7);g.stroke();g.beginPath();g.moveTo(cx+.72*r,cy+.3*r);g.lineTo(cx+.95*r,cy+1.2*r);g.stroke()}
  if(o.mask!=null){g.fillStyle=o.mask;g.beginPath();g.arc(cx,cy,r*1.02,0,7);g.fill();g.fillStyle=sk;rr(g,cx-.75*r,cy-.1*r,1.5*r,.5*r,.2*r);g.fill();g.fillStyle="#1e1b2e";[-.42,.42].forEach(function(dx){g.beginPath();g.ellipse(cx+dx*r,cy+.14*r,.13*r,.15*r,0,0,7);g.fill()})}
  g.restore();if(o.hat!=null)hatDraw(g,cx,cy,r,o.hat)}
function shoe(g,x,y,s,k){if(k===2){g.fillStyle="#111";rr(g,x-.6*s,y-.55*s,1.3*s,.55*s,.2*s);g.fill();g.fillStyle="#f2b705";g.fillRect(x-.2*s,y-.5*s,.4*s,.12*s)}else if(k===1){g.fillStyle="#f8fafc";rr(g,x-.6*s,y-.6*s,1.3*s,.6*s,.25*s);g.fill();g.fillStyle="#94a3b8";g.fillRect(x-.6*s,y-.12*s,1.3*s,.12*s)}else{g.fillStyle="#3b2a14";rr(g,x-.6*s,y-.55*s,1.3*s,.55*s,.2*s);g.fill()}}
function figPerson(g,k,x,y,s,o,t){if(!k)return false;var v=k;if(k==="opa"&&o.pose==="wave"&&img("opa-wink"))v="opa-wink";if(k==="baron"&&o.frown&&img("baron-angry"))v="baron-angry";var im=img(v);if(!im)return false;
  var bob=(o.bob&&!still)?Math.abs(Math.sin(((t||0)+(o.ph||0))/170))*s*.35:0;fig(g,v,x,y-bob,s*9.2,{alpha:o.alpha,flip:o.flip});return true}
function drawPerson(g,x,y,s,o,t){o=o||{};if(o.k&&figPerson(g,o.k,x,y,s,o,t))return;var sk=o.skin||"#f1c27d",pose=o.pose||"idle",bob=(o.bob&&!still)?Math.abs(Math.sin(((t||0)+(o.ph||0))/170))*s*.35:0,sq=pose==="down"?.9*s:0;
  g.save();g.translate(x,y-bob);g.lineCap="round";g.lineJoin="round";
  g.fillStyle="rgba(0,0,0,.25)";g.beginPath();g.ellipse(0,bob,2*s,.4*s,0,0,7);g.fill();
  g.fillStyle=o.legs||"#1f2937";rr(g,-1.05*s,-2.7*s+sq,.85*s,2.4*s-sq,.3*s);g.fill();rr(g,.2*s,-2.7*s+sq,.85*s,2.4*s-sq,.3*s);g.fill();
  shoe(g,-.62*s,0,s,o.shoe==null?0:o.shoe);shoe(g,.68*s,0,s,o.shoe==null?0:o.shoe);
  g.translate(0,sq);
  g.fillStyle=o.top||"#334155";g.beginPath();g.moveTo(-1.15*s,-5.5*s);g.lineTo(1.15*s,-5.5*s);g.lineTo(1.75*s,-2.4*s);g.lineTo(-1.75*s,-2.4*s);g.closePath();g.fill();
  if(o.stripes){g.fillStyle="rgba(255,255,255,.75)";for(var i=0;i<3;i++)g.fillRect(-1.5*s,-5*s+i*.8*s,3*s,.3*s)}
  if(o.badge){g.fillStyle="#f2b705";g.beginPath();g.arc(-.6*s,-4.6*s,.3*s,0,7);g.fill()}
  var A={idle:[[-1.9,-3.1],[1.9,-3.1]],up:[[-1.8,-7.9],[1.8,-7.9]],left:[[-3.3,-5.8],[-.3,-3.6]],right:[[.3,-3.6],[3.3,-5.8]],down:[[-2.1,-2.9],[2.1,-2.9]],wave:[[-1.9,-3.1],[2.5,-7.3]],point:[[-1.9,-3.1],[3.4,-5.4]],sneak:[[-2.6,-4.6],[2.6,-4.6]],hush:[[-1.9,-3.1],[.3,-6.4]],hold:[[-1.4,-3.8],[1.4,-3.8]]}[pose]||[[-1.9,-3.1],[1.9,-3.1]];
  g.strokeStyle=o.top||"#334155";g.lineWidth=.6*s;[[-1.05,A[0]],[1.05,A[1]]].forEach(function(p){g.beginPath();g.moveTo(p[0]*s,-5.2*s);g.lineTo(p[1][0]*s,p[1][1]*s);g.stroke();g.fillStyle=o.gloves?"#111":sk;g.beginPath();g.arc(p[1][0]*s,p[1][1]*s,.36*s,0,7);g.fill()});
  var pr=o.prop;
  if(pr==="cane"||pr==="cane2"){g.strokeStyle=pr==="cane2"?"#111":"#8b5a2b";g.lineWidth=.22*s;g.beginPath();g.moveTo(A[1][0]*s,A[1][1]*s);g.lineTo(A[1][0]*s+.4*s,.1*s);g.stroke();if(pr==="cane2"){g.fillStyle="#f2b705";g.beginPath();g.arc(A[1][0]*s,A[1][1]*s-.1*s,.35*s,0,7);g.fill()}}
  else if(pr==="torch"){g.fillStyle="#374151";rr(g,A[1][0]*s-.25*s,A[1][1]*s-1.2*s,.5*s,1.2*s,.1*s);g.fill();g.fillStyle="rgba(255,240,150,.35)";g.beginPath();g.moveTo(A[1][0]*s-.3*s,A[1][1]*s-1.2*s);g.lineTo(A[1][0]*s-1.6*s,A[1][1]*s-4*s);g.lineTo(A[1][0]*s+1.6*s,A[1][1]*s-4*s);g.lineTo(A[1][0]*s+.3*s,A[1][1]*s-1.2*s);g.fill()}
  else if(pr==="mop"){g.strokeStyle="#d6b98c";g.lineWidth=.2*s;g.beginPath();g.moveTo(A[1][0]*s,A[1][1]*s);g.lineTo(A[1][0]*s+.6*s,-8*s);g.stroke();g.fillStyle="#e5e7eb";g.beginPath();g.arc(A[1][0]*s+.6*s,-8.1*s,.55*s,0,7);g.fill()}
  else if(pr==="pizza"){g.fillStyle="#dc2626";rr(g,A[1][0]*s-.3*s,A[1][1]*s-1.6*s,1.9*s,1.6*s,.1*s);g.fill();g.fillStyle="#fff";g.fillRect(A[1][0]*s,A[1][1]*s-1.1*s,1.3*s,.3*s)}
  else if(pr==="crown"){crownDraw(g,A[1][0]*s,A[1][1]*s-.6*s,.9*s,t)}
  else if(pr==="cuffs"){g.strokeStyle="#cbd5e1";g.lineWidth=.18*s;g.beginPath();g.arc(A[0][0]*s,A[0][1]*s,.5*s,0,7);g.stroke();g.beginPath();g.arc(A[1][0]*s,A[1][1]*s,.5*s,0,7);g.stroke();g.beginPath();g.moveTo(A[0][0]*s+.5*s,A[0][1]*s);g.lineTo(A[1][0]*s-.5*s,A[1][1]*s);g.stroke()}
  drawHeadAt(g,0,-7*s,1.55*s,o,t);
  g.restore()}
function crownDraw(g,x,y,s,t,fake){g.save();g.translate(x,y);var gold=fake?"#d4c28a":"#f2b705",dark=fake?"#9c8f5a":"#b45309";if(!fake&&!still&&t){g.shadowColor="#fde68a";g.shadowBlur=10+Math.sin(t/300)*6}
  g.fillStyle=gold;g.beginPath();g.moveTo(-1.1*s,.5*s);g.lineTo(-1.2*s,-.6*s);g.lineTo(-.6*s,-.1*s);g.lineTo(0,-.9*s);g.lineTo(.6*s,-.1*s);g.lineTo(1.2*s,-.6*s);g.lineTo(1.1*s,.5*s);g.closePath();g.fill();g.shadowBlur=0;g.fillStyle=dark;g.fillRect(-1.1*s,.3*s,2.2*s,.2*s);
  ["#e63946","#2563eb","#2a9d4b"].forEach(function(c,i){g.fillStyle=fake?"#bbb":c;g.beginPath();g.arc(-.6*s+i*.6*s,.1*s,.14*s,0,7);g.fill()});g.restore()}
function sparkle(g,x,y,r,col,ph){g.save();g.translate(x,y);g.rotate((ph||0)%6.283);g.fillStyle=col;g.beginPath();for(var i=0;i<8;i++){var a=i/8*6.283,rad=i%2?r*.35:r;g.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}g.closePath();g.fill();g.restore()}
/* de bende (het team): zwarte outfit, masker of accessoire in de teamkleur */
function crewLook(av){av=av||{c:0,h:0};var c=AVC[av.c];return{skin:"#f1c27d",hair:"#2b1a10",hs:1,top:"#1f2937",legs:"#111827",shoe:1,gloves:true,mask:av.h===0?c:null,glasses:av.h===1?2:0,hat:av.h===2?0:null,scarf:av.h===3?c:null,hatc:c}}
function drawCrew(g,x,y,s,av,t,pose){var o=crewLook(av);o.pose=pose||"idle";o.bob=!!t;drawPerson(g,x,y,s,o,t);
  if(o.scarf){g.fillStyle=o.scarf;rr(g,x-1.4*s,y-5.9*s,2.8*s,.7*s,.3*s);g.fill()}if(av&&av.h===2){g.fillStyle=o.hatc;g.beginPath();g.ellipse(x,y-7.9*s,1.6*s,.75*s,0,Math.PI,0);g.fill()}
  g.fillStyle=AVC[av?av.c:0];g.beginPath();g.arc(x+1.1*s,y-4.6*s,.3*s,0,7);g.fill()}
function spriteURL(fn,w,h){var cv=document.createElement("canvas");cv.width=w;cv.height=h;fn(cv.getContext("2d"));return cv.toDataURL("image/png")}
var AVU={};
function headURL(k){var im=img(k);if(im){if(!AVU["i"+k])AVU["i"+k]=spriteURL(function(g){var gr=g.createLinearGradient(0,0,0,96);gr.addColorStop(0,"#1a2b5e");gr.addColorStop(1,"#060b1c");g.fillStyle=gr;g.fillRect(0,0,96,96);var hw=im.width*.75,hx=(im.width-hw)/2;g.drawImage(im,hx,im.height*.02,hw,hw,4,6,88,88)},96,96);return AVU["i"+k]}
  if(!AVU[k])AVU[k]=spriteURL(function(g){var gr=g.createLinearGradient(0,0,0,96);gr.addColorStop(0,"#1a2b5e");gr.addColorStop(1,"#060b1c");g.fillStyle=gr;g.fillRect(0,0,96,96);var o=PPL[k];g.fillStyle=o.top;g.beginPath();g.ellipse(48,104,36,26,0,0,7);g.fill();drawHeadAt(g,48,52,24,o,0)},96,96);return AVU[k]}
function AV(k){return '<span class="avatar a-'+k+'" style="background-image:url('+headURL(k)+')"></span>'}
function NAMEOF(k){return D.PEOPLE[k]?D.PEOPLE[k][0]:k}
/* politiewagen (van boven) en de gouden auto van de Baron */
function carTop(g,x,y,a,s,police,t){g.save();g.translate(x,y);g.rotate(a);g.fillStyle="rgba(0,0,0,.3)";rr(g,-1.1*s,-.6*s,2.3*s,1.3*s,.3*s);g.fill();
  g.fillStyle=police?"#f8fafc":"#f2b705";rr(g,-1.1*s,-.65*s,2.2*s,1.3*s,.3*s);g.fill();g.fillStyle=police?"#1d4ed8":"#b45309";rr(g,-.3*s,-.55*s,.9*s,1.1*s,.15*s);g.fill();
  if(police){g.fillStyle="#f97316";g.fillRect(-1.1*s,-.65*s,.4*s,1.3*s);var on=Math.floor((t||0)/160)%2;g.fillStyle=on?"#ff3b3b":"#3aa0ff";g.shadowColor=g.fillStyle;g.shadowBlur=10;g.fillRect(-.15*s,-.5*s,.35*s,.35*s);g.fillStyle=on?"#3aa0ff":"#ff3b3b";g.shadowColor=g.fillStyle;g.fillRect(-.15*s,.15*s,.35*s,.35*s);g.shadowBlur=0}
  else{crownDraw(g,.6*s,0,.3*s,0)}
  g.fillStyle="#fde68a";g.fillRect(1.0*s,-.5*s,.14*s,.3*s);g.fillRect(1.0*s,.2*s,.14*s,.3*s);g.restore()}
function carSide(g,x,y,s,gold,t){g.save();g.translate(x,y);g.fillStyle=gold?"#f2b705":["#64748b","#dc2626","#2563eb","#16a34a","#f8fafc"][Math.abs(Math.round(x))%5];rr(g,-1.6*s,-.9*s,3.2*s,.9*s,.25*s);g.fill();rr(g,-.9*s,-1.5*s,1.7*s,.7*s,.25*s);g.fill();
  g.fillStyle="#bfdbfe";rr(g,-.7*s,-1.4*s,.6*s,.5*s,.1*s);g.fill();rr(g,.05*s,-1.4*s,.6*s,.5*s,.1*s);g.fill();g.fillStyle="#111";g.beginPath();g.arc(-.9*s,0,.35*s,0,7);g.arc(.9*s,0,.35*s,0,7);g.fill();
  if(gold)crownDraw(g,1.1*s,-1.05*s,.3*s,0);g.restore()}
/* het plan: een blauwdruk-bord dat volloopt. n onderdelen aan, N totaal */
var ITEMPOS=[[.18,.3],[.5,.26],[.82,.3],[.2,.62],[.5,.6],[.8,.62],[.32,.86],[.68,.86],[.5,.44],[.14,.8],[.86,.8]];
function drawPlan(g,w,h,n,N,t,opt){var on=Math.min(11,n>=N?11:Math.round(n/N*11));g.fillStyle="#13306b";g.fillRect(0,0,w,h);g.strokeStyle="rgba(255,255,255,.1)";g.lineWidth=1;for(var x=0;x<w;x+=20){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(var y=0;y<h;y+=20){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
  /* het museum in het midden als blauwdruk */g.strokeStyle="rgba(255,255,255,.55)";g.lineWidth=2;g.strokeRect(w*.36,h*.36,w*.28,h*.3);g.strokeRect(w*.42,h*.44,w*.16,h*.14);g.beginPath();g.moveTo(w*.5,h*.66);g.lineTo(w*.5,h*.76);g.stroke();
  g.fillStyle="rgba(255,255,255,.12)";g.font="700 "+Math.round(h*.06)+"px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText("MUSEUM",w*.5,h*.6);
  /* tape */g.save();g.translate(w*.5,h*.1);g.rotate(-.05);g.fillStyle="#f2b705";g.fillRect(-w*.22,-h*.045,w*.44,h*.09);g.fillStyle="#0b1430";g.font="700 "+Math.round(h*.065)+"px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.fillText("TOP SECRET · "+Math.min(n,N)+"/"+N,0,h*.025);g.restore();
  /* rood touwtje */g.strokeStyle="rgba(255,59,59,.85)";g.lineWidth=2;g.beginPath();for(var i=0;i<on;i++){var p=ITEMPOS[PRIO[i]];i?g.lineTo(p[0]*w,p[1]*h):g.moveTo(p[0]*w,p[1]*h)}if(on>=11){g.lineTo(w*.5,h*.5)}g.stroke();
  for(i=0;i<11;i++){var k=PRIO[i],p=ITEMPOS[k],X=p[0]*w,Y=p[1]*h,sz=Math.min(w,h)*.07;if(i<on){g.fillStyle="#fffbea";g.save();g.translate(X,Y);g.rotate((k%2?.08:-.08));rr(g,-sz*1.1,-sz*1.1,sz*2.2,sz*2.2,4);g.fill();g.restore();drawItem(g,k,X,Y,sz*.9);g.fillStyle="#ff3b3b";g.beginPath();g.arc(X,Y-sz*1.05,sz*.22,0,7);g.fill()}
    else{g.strokeStyle="rgba(255,255,255,.25)";g.setLineDash([3,3]);g.strokeRect(X-sz,Y-sz,sz*2,sz*2);g.setLineDash([])}}
  if(on>=11){crownDraw(g,w*.5,h*.5,Math.min(w,h)*.09,t)}
  if(opt&&opt.alarm&&!still&&Math.floor((t||0)/200)%2){g.fillStyle="rgba(255,59,59,.25)";g.fillRect(0,0,w,h)}}
/* onderdelen van het plan als icoon; k = 0..10 */
function drawItem(g,k,x,y,s){g.save();g.translate(x,y);g.lineCap="round";g.lineJoin="round";
  if(k===0){g.fillStyle="#fff";g.fillRect(-.7*s,-.9*s,1.4*s,1.8*s);g.fillStyle="#1d4ed8";for(var i=0;i<4;i++)g.fillRect(-.5*s,-.6*s+i*.4*s,1*s,.14*s);g.fillStyle="#ff3b3b";g.fillRect(-.5*s,.2*s,.5*s,.14*s)}
  else if(k===1){g.fillStyle="#1d4ed8";g.fillRect(-.9*s,-.7*s,1.8*s,1.4*s);g.strokeStyle="#fff";g.lineWidth=.08*s;g.strokeRect(-.6*s,-.4*s,1.2*s,.8*s);g.strokeRect(-.3*s,-.1*s,.6*s,.4*s)}
  else if(k===2){hatDraw(g,0,.1*s,.55*s,1);g.fillStyle="#111";rr(g,-.6*s,.05*s,.5*s,.3*s,.1*s);g.fill();rr(g,.1*s,.05*s,.5*s,.3*s,.1*s);g.fill()}
  else if(k===3){g.strokeStyle="#dc2626";g.lineWidth=.22*s;g.beginPath();g.moveTo(-.7*s,.8*s);g.lineTo(.5*s,-.6*s);g.moveTo(.7*s,.8*s);g.lineTo(-.5*s,-.6*s);g.stroke();g.fillStyle="#cbd5e1";g.beginPath();g.arc(-.5*s,-.65*s,.3*s,0,7);g.arc(.5*s,-.65*s,.3*s,0,7);g.fill()}
  else if(k===4){g.fillStyle="#f2b705";g.beginPath();g.arc(-.4*s,-.3*s,.45*s,0,7);g.fill();g.fillStyle="#1a2b5e";g.beginPath();g.arc(-.4*s,-.3*s,.15*s,0,7);g.fill();g.fillStyle="#f2b705";g.fillRect(-.1*s,-.4*s,1*s,.2*s);g.fillRect(.5*s,-.2*s,.15*s,.35*s);g.fillRect(.75*s,-.2*s,.15*s,.25*s)}
  else if(k===5){g.fillStyle="#111827";rr(g,-.45*s,-.7*s,.9*s,1.5*s,.15*s);g.fill();g.fillStyle="#3aa0ff";rr(g,-.3*s,-.5*s,.6*s,.4*s,.05*s);g.fill();g.fillStyle="#9ca3af";g.fillRect(.1*s,-1.1*s,.1*s,.45*s)}
  else if(k===6){g.fillStyle="#111827";rr(g,-.9*s,-.3*s,.8*s,.7*s,.2*s);g.fill();rr(g,.1*s,-.3*s,.8*s,.7*s,.2*s);g.fill();g.fillRect(-.1*s,-.1*s,.2*s,.3*s);g.fillStyle="#3aa0ff";g.beginPath();g.arc(-.5*s,.05*s,.22*s,0,7);g.arc(.5*s,.05*s,.22*s,0,7);g.fill()}
  else if(k===7){g.fillStyle="#f2b705";rr(g,-.5*s,-.7*s,1*s,1.5*s,.15*s);g.fill();g.fillStyle="#111";rr(g,-.3*s,-.45*s,.6*s,.4*s,.05*s);g.fill();g.fillStyle="#9ca3af";g.fillRect(.25*s,-1.1*s,.1*s,.4*s);for(var j=0;j<3;j++)g.fillRect(-.3*s+j*.22*s,.2*s,.14*s,.14*s)}
  else if(k===8){g.strokeStyle="#ff3b3b";g.lineWidth=.14*s;g.beginPath();g.moveTo(-.8*s,.7*s);g.lineTo(-.3*s,.2*s);g.lineTo(.2*s,.6*s);g.lineTo(.8*s,-.7*s);g.stroke();g.fillStyle="#ff3b3b";g.beginPath();g.arc(.8*s,-.7*s,.2*s,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.arc(-.8*s,.7*s,.18*s,0,7);g.fill()}
  else if(k===9){g.fillStyle="#111827";rr(g,-.6*s,-.4*s,.55*s,1.2*s,.2*s);g.fill();rr(g,.05*s,-.4*s,.55*s,1.2*s,.2*s);g.fill();g.fillStyle="#334155";g.fillRect(-.6*s,-.9*s,.55*s,.5*s);g.fillRect(.05*s,-.9*s,.55*s,.5*s)}
  else{g.fillStyle="#111";g.beginPath();g.ellipse(-.4*s,0,.5*s,.22*s,-.3,0,7);g.ellipse(.4*s,0,.5*s,.22*s,.3,0,7);g.fill()}
  g.restore()}
/* spoor-icoon: k = kenmerk, v = waarde */
function evDraw(g,k,v){g.fillStyle="#13306b";rr(g,0,0,80,80,12);g.fill();g.strokeStyle="#f2b705";g.lineWidth=2;rr(g,2,2,76,76,11);g.stroke();
  if(k==="omg"){if(v===0){g.fillStyle="#0ea5e9";g.beginPath();g.ellipse(40,56,30,10,0,0,7);g.fill();g.strokeStyle="#bae6fd";g.lineWidth=2;g.beginPath();g.moveTo(16,54);g.quadraticCurveTo(28,48,40,54);g.quadraticCurveTo(52,60,64,54);g.stroke()}
    else if(v===1){MW.KidsMap.icons.tree(g,28,60,24);MW.KidsMap.icons.tree(g,52,62,20)}else{g.fillStyle="#475569";g.fillRect(10,14,22,52);g.fillRect(48,14,22,52);g.fillStyle="#0b1430";g.fillRect(32,14,16,52);g.fillStyle="#f2b705";g.beginPath();g.arc(40,24,3,0,7);g.fill()}}
  else if(k==="deur"){g.fillStyle=DOORC[v];rr(g,24,16,32,50,4);g.fill();g.fillStyle="#f2b705";g.beginPath();g.arc(50,42,2.5,0,7);g.fill();g.fillStyle="#9ca3af";rr(g,34,52,12,10,2);g.fill()}
  else{if(v===0)MW.KidsMap.icons.tree(g,40,66,30);else if(v===1)MW.KidsMap.icons.lamp(g,40,66,28,true);else MW.KidsMap.icons.postbox(g,40,66,30)}}
/* een schuilplaats als scène: kenmerken omg/deur/naast */
function vaultScene(g,w,h,K,t){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,"#0b1430");gr.addColorStop(1,"#1a2b5e");g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(var i=0;i<14;i++){g.fillStyle="rgba(255,255,255,"+(.2+(i%3)*.15)+")";g.fillRect((i*37)%w,(i*53)%(h*.4),1.5,1.5)}
  var fy=h*.78;g.fillStyle="#1f2a44";g.fillRect(0,fy,w,h-fy);
  if(K.omg===0){g.fillStyle="#0f3a66";g.fillRect(0,fy+h*.1,w,h);g.strokeStyle="rgba(186,230,253,.4)";g.lineWidth=2;for(i=0;i<3;i++){g.beginPath();g.moveTo(0,fy+h*.13+i*h*.04);g.quadraticCurveTo(w*.25,fy+h*.1+i*h*.04,w*.5,fy+h*.13+i*h*.04);g.quadraticCurveTo(w*.75,fy+h*.16+i*h*.04,w,fy+h*.13+i*h*.04);g.stroke()}}
  else if(K.omg===1){MW.KidsMap.icons.tree(g,w*.12,fy,h*.45,"#1f6b3a","#2a8a4a");MW.KidsMap.icons.tree(g,w*.9,fy,h*.4,"#1f6b3a","#2a8a4a");g.fillStyle="#14532d";g.fillRect(0,fy,w,h*.05)}
  else{g.fillStyle="#2a3550";g.fillRect(0,0,w*.18,fy);g.fillRect(w*.82,0,w*.18,fy);g.fillStyle="#111827";for(i=0;i<4;i++){g.fillRect(w*.04,h*.1+i*h*.16,w*.08,h*.09);g.fillRect(w*.88,h*.1+i*h*.16,w*.08,h*.09)}}
  /* het gebouw */g.fillStyle="#34405f";g.fillRect(w*.3,h*.25,w*.4,fy-h*.25);g.fillStyle="#2a3550";g.beginPath();g.moveTo(w*.27,h*.25);g.lineTo(w*.5,h*.12);g.lineTo(w*.73,h*.25);g.fill();
  g.fillStyle=DOORC[K.deur];rr(g,w*.43,fy-h*.3,w*.14,h*.3,4);g.fill();g.fillStyle="#f2b705";g.beginPath();g.arc(w*.54,fy-h*.15,3,0,7);g.fill();g.fillStyle="#9ca3af";rr(g,w*.47,fy-h*.12,w*.06,h*.05,2);g.fill();
  g.fillStyle="#fde68a";g.globalAlpha=.6;g.fillRect(w*.33,h*.35,w*.07,h*.08);g.globalAlpha=1;
  if(K.naast===0)MW.KidsMap.icons.tree(g,w*.76,fy,h*.42);else if(K.naast===1)MW.KidsMap.icons.lamp(g,w*.76,fy,h*.4,true);else MW.KidsMap.icons.postbox(g,w*.76,fy,h*.36)}

/* ---------- zaakgenerator ---------- */
function genCase(seed,mode,n){n=n||8;var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  var K={omg:Math.floor(r()*3),deur:Math.floor(r()*3),naast:Math.floor(r()*3)};
  var wpos=WITPOS[n],wp=shuffle([0,1,2,3,4],r).slice(0,wpos.length),li=Math.floor(r()*wpos.length),lk=pick(ATK),lv=(K[lk]+1+Math.floor(r()*2))%3;
  var sus=[K];ATK.forEach(function(k){var d={omg:K.omg,deur:K.deur,naast:K.naast};d[k]=k===lk?lv:(K[k]+1+Math.floor(r()*2))%3;sus.push(d)});
  var d5={omg:K.omg,deur:K.deur,naast:K.naast};d5[lk]=3-K[lk]-lv;sus.push(d5);
  var order=shuffle([0,1,2,3,4],r),sus2=order.map(function(i){return sus[i]}),Ki=order.indexOf(0);
  var evo=shuffle(ATK,r),ev=evo.map(function(k){return{k:k,v:K[k],t:pick(D.EV[k])}});
  var tk=shuffle(ATK,r),wits=wp.map(function(p,j){var lie=j===li,k=lie?lk:tk[j%3];return{p:p,k:k,v:lie?lv:K[k],lie:lie}});
  var code=[0,1,2,3].map(function(){return Math.floor(r()*10)});
  var acts=["scout"].concat(shuffle(ACTS.filter(function(a){return a!=="scout"}),r).slice(0,n-1)),av={c:Math.floor(r()*4),h:Math.floor(r()*4)};
  var slots=acts.map(function(a,i){var e=EVPOS[n].indexOf(i),cd=CODEPOS[n].indexOf(i),w=wpos.indexOf(i);return{act:a,coins:10+Math.floor(r()*21),pu:shuffle(PUL,r).slice(0,3),e:e,cd:cd,w:w}});
  var vn=shuffle(D.VNAMES,r).slice(0,5);
  return{sus:sus2,K:Ki,ev:ev,wits:wits,code:code,slots:slots,av:av,vn:vn,ster:LEVEL==="meester",esc:{cars:LEVEL==="meester"?3:2,secs:LEVEL==="meester"?360:540}}}
function makeCode(seed,mode,n){return"GK"+(n===5?"5":n===11?"L":"")+(LEVEL==="meester"?"X":"")+(mode==="in"?"B":mode==="map"||mode==="demo"?"K":"S")+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v),m=/^GK([5L]?)(X?)([KSB])([0-9A-Z]{1,7})$/.exec(c);if(!m)return null;var seed=parseInt(m[4],36);if(!(seed>=0)||seed>4294967295)return null;return{mode:m[3]==="B"?"in":m[3]==="K"?"map":"street",seed:seed,n:m[1]==="5"?5:m[1]==="L"?11:8,lvl:m[2]?"meester":"rookie"}}
function fixG(g){if(!g||!g.c||!g.c.slots)return null;g.n=g.n||g.c.slots.length;if(!Array.isArray(g.ph))g.ph=[];if(!Array.isArray(g.album))g.album=[];if(!g.poses)g.poses={};if(!g.ach)g.ach={};g.xp=g.xp||0;g.coins=g.coins||0;g.tl=g.tl||1;g.av=g.av||g.c.av;g.times=g.times||[];g.fin=g.fin||0;if(!g.c.esc)g.c.esc={cars:2,secs:540};return g}
function done(){return G.ph.filter(Boolean).length}
function codeDigit(j){return G.c.code[j]}
function codeKnown(){return CODEPOS[NN()].map(function(p,j){return G.ph[p]?G.c.code[j]:null})}
function witText(w){return D.WITPRE[WITK[w.p]]+fill(D.WITT[w.k],{v:D.AT[w.k].v[w.v]})}
function vars(){return{J:NAME,tl:G?G.tl:1,xp:G?G.xp:0,co:G?G.coins:0}}
function ach(k){if(!G||G.ach[k])return;G.ach[k]=1;save();toast("🏆 "+fill(T.achGot,{a:T.ach[k][0]}));sfx("levelup")}
function hideSpot(){return G&&G.st?G.st.filter(function(s){return s.hide})[0]:null}

/* ---------- startscherm ---------- */
function home(){musicStop();var p=MW.profile.get();
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(ID),lk=MW.pro.locked(ID),playedToday=(p.games.gk&&p.games.gk.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;$("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  $("#name").value=NAME;voiceBtn();
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});$$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===LEVEL)});$$("#dur button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});
  show("home")}
function voiceBtn(){var b=$("#bVoice");if(b){b.textContent=(VOICE?"🔊 ":"🔇 ")+T.voice;b.setAttribute("aria-pressed",VOICE)}}
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MODE=b.dataset.m;LS.set("ss_gk_mode",MODE);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#lvl").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;LEVEL=b.dataset.l;LS.set("ss_gk_level",LEVEL);$$("#lvl button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#dur").addEventListener("click",function(e){var b=e.target.closest("button");if(!b||!LENS[b.dataset.n])return;LEN=b.dataset.n;LS.set("ss_gk_len",LEN);$$("#dur button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_gk_name",NAME)});
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_gk_voice",VOICE);voiceBtn();toast(VOICE?T.voiceOn:T.voiceOff);if(VOICE)say(T.voiceOn);else hush()};
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(hashStr("gk|"+MODE+"|"+LEVEL+"|"+MW.today()),MODE,true,LENS[LEN])};
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
var St=MW.Steps,INK=LS.get("ss_gk_in",{kind:"sensor",spm:100});
function inSheet(cb){var sens=St&&St.supported(),IN=T.kv;
  sheet('<h2>'+esc(IN.inH)+'</h2><p>'+esc(IN.inT)+'</p>'+(sens?'<button type="button" class="btn" id="inS">'+esc(IN.inSensor)+'</button>':'')+'<button type="button" class="btn'+(sens?' ghost dk':'')+'" id="inT">'+esc(IN.inTempo)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;if(sens)$("#inS").onclick=function(){St.ask().then(function(ok){closeSheet();if(!ok)toast(IN.inNoSensor);cb(ok?"sensor":"tempo",100)})};$("#inT").onclick=function(){closeSheet();cb("tempo",100)}}
function startIn(seed,daily,n){inSheet(function(kind,spm){INK={kind:kind,spm:spm};LS.set("ss_gk_in",INK);build(seed,"in",null,null,null,daily,n,true)})}
function stepIn(k){if(!G||G.mode!=="in"||FRZ)return;G.in.steps+=k;var open=G.st.filter(function(s){return !s.done}),t=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;t=s}});if(!t)return;var d=dTo(t),m=k*G.in.sl;if(d<=m){P.x=t.x;P.y=t.y;G.dist+=d}else{P.x+=(t.x-P.x)/d*m;P.y+=(t.y-P.y)/d*m;G.dist+=m}}
function startSteps(){if(!St||!G||G.mode!=="in")return;St.start({mode:G.in.kind,spm:G.in.spm,onStep:stepIn,active:function(){return !!G&&G.mode==="in"&&!$("#play").hidden&&$("#sheet").hidden&&$("#hide").hidden&&!(window.MW.Crew&&MW.Crew.busy())},onDead:function(){if(!G||G.mode!=="in")return;G.in.kind="tempo";save();toast(T.kv.inNoSensor);startSteps()}});St.awake(true)}
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
  $("#shX").onclick=closeSheet;$("#nmGo").onclick=function(){closeSheet();MODE="street";LS.set("ss_gk_mode",MODE);build(seed,"street",null,null,null,daily,n)}}
function dropMap(){if(!G||G.mode==="street")return;Wk.stopWatch();KM.leave();stopSteps();endFreeze();G.virt=false;G.mode="street";G.i=0;while(G.ph[G.i])G.i++;G.st=null;if(G.fin===1){G.escS=null}save();show("cards");render();toast(T.kv.switched)}
/* verhaalkaart-plekken: elke stop staat op de plek die bij zijn opdracht hoort */
function virtSpots(c){return c.slots.map(function(s,i){var k=ACTS.indexOf(s.act),f=FP[k];return{x:Math.round((f.x-START.x)*VSC),y:Math.round((f.y-START.y)*VSC),type:"hoek",name:T.kv.fp[k],fi:i,fk:k,done:false}})}
function build(seed,mode,pois,ways,origin,daily,n,virt){n=n===5||n===11?n:8;var c=genCase(seed,mode,n);
  G={seed:seed,code:makeCode(seed,mode,n),mode:mode,lvl:LEVEL,n:n,c:c,i:0,ph:[],team:null,arrest:null,t0:0,tries:0,daily:!!daily,dist:0,origin:origin,px:0,py:0,st:null,cine:false,end:null,album:[],poses:{},xp:0,coins:0,tl:1,ach:{},pu:null,av:c.av,times:[],lost:0,retries:0,fin:0,esc:null};
  if(virt||mode==="in"){G.virt=true;G.st=virtSpots(c);W=[];P={x:0,y:0,acc:0};LS.set(WK,W);if(mode==="in")G.in={kind:INK.kind,spm:INK.spm,steps:0,sl:KM.stepLen(G.st,1200)}}
  else if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,R0,n,r,T.corner);
    for(var k=0;spots.length<n&&k<40;k++){var a=k*2.39996+r(),d=R0*(.35+.5*r());spots.push({x:Math.round(Math.cos(a)*d),y:Math.round(Math.sin(a)*d),type:"hoek",name:""})}
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het|the) /,"")),fi:i,fk:ACTS.indexOf(c.slots[i].act),done:false}});W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  brief()}
function brief(){var c=G.c;LEVEL=G.lvl||LEVEL;
  $("#bfNo").textContent=(G.mode==="demo"?T.demoCase+" · ":"")+T.lvl[LEVEL]+" · "+T.lens[lenOf(NN())];
  $("#bfOpen").innerHTML='<canvas class="brscene" width="320" height="180"></canvas>'+bubble(D.OPA.open,NAMEOF("opa"),"big");briefScene($("#bfOpen canvas"));
  $("#bfSus").innerHTML='<div class="eyebrow">'+esc(T.bandH)+'</div><div class="band">'+["opa","baron","stella"].map(function(k){return '<span>'+AV(k)+'<b>'+esc(NAMEOF(k))+'</b><small>'+esc(D.PEOPLE[k][1])+'</small></span>'}).join("")+'</div>'+
    '<div class="eyebrow">'+esc(T.avH)+'</div><p class="note">'+esc(T.avT)+'</p><div class="avpick"><canvas id="avC" width="160" height="210"></canvas><div class="avopts"><div class="seg four" id="avCol">'+T.avC.map(function(n,i){return '<button type="button" data-i="'+i+'" style="--c:'+AVC[i]+'" aria-pressed="'+(G.av.c===i)+'">'+esc(n)+'</button>'}).join("")+'</div><div class="seg four" id="avHat">'+T.avHat.map(function(n,i){return '<button type="button" data-i="'+i+'" aria-pressed="'+(G.av.h===i)+'">'+esc(n)+'</button>'}).join("")+'</div></div></div>'+
    '<div class="eyebrow">'+esc(T.people)+'</div><div class="lvlist">'+c.slots.map(function(s,i){return '<span><b>'+(i+1)+'</b>'+esc(T.kinds[s.act])+'</span>'}).join("")+'</div>';
  var paint=function(){var cv=$("#avC");if(!cv)return;var g=cv.getContext("2d");g.clearRect(0,0,160,210);drawCrew(g,80,200,19,G.av,0)};paint();
  $("#avCol").onclick=function(e){var b=e.target.closest("button");if(!b)return;G.av.c=+b.dataset.i;$$("#avCol button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});paint();sfx("hit")};
  $("#avHat").onclick=function(e){var b=e.target.closest("button");if(!b)return;G.av.h=+b.dataset.i;$$("#avHat button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});paint();sfx("hit")};
  $("#bfTip").innerHTML=MW.codeBox(L,G.code,"zaak");MW.bindCodeBox($("#bfTip"),L);show("brief")}
function nightBg(g,w,h,ts,opt){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,"#060b1c");gr.addColorStop(1,"#1a2b5e");g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(var i=0;i<40;i++){var q=(i*9301+49297)%233280/233280;g.fillStyle="rgba(255,255,255,"+(.2+.3*((i%3)/2))+")";g.fillRect(q*w,(i*37%100)/100*h*.4,1.5,1.5)}
  g.fillStyle="#0a1226";var ms=[.28,.44,.36,.52,.3,.46,.38];for(i=0;i<7;i++){var bw=w/7;g.fillRect(i*bw,h*(1-ms[i]),bw-3,h*ms[i]);g.fillStyle="rgba(253,230,138,.25)";for(var k=0;k<4;k++)if((i*7+k)%3)g.fillRect(i*bw+6+(k%2)*bw*.5,h*(1-ms[i])+10+Math.floor(k/2)*18,8,10);g.fillStyle="#0a1226"}
  g.fillStyle="#1f2a44";g.fillRect(0,h*.86,w,h*.14);if(opt&&opt.lamp){g.fillStyle="rgba(253,230,138,.12)";g.beginPath();g.moveTo(w*.75,h*.3);g.lineTo(w*.6,h*.86);g.lineTo(w*.9,h*.86);g.fill()}
  if(opt&&opt.siren&&!still){var on=Math.floor((ts||0)/220)%2;g.fillStyle=on?"rgba(58,160,255,.14)":"rgba(255,59,59,.14)";g.fillRect(0,0,w,h)}}
function museumBg(g,w,h,ts,opt){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,"#0b1430");gr.addColorStop(1,"#101c42");g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle="#1a2b5e";g.fillRect(0,h*.78,w,h*.22);g.strokeStyle="rgba(255,255,255,.08)";for(var i=0;i<8;i++){g.beginPath();g.moveTo(w*i/8,h*.78);g.lineTo(w*i/8-w*.1+w*.2*(i/8),h);g.stroke()}
  g.fillStyle="#2a3550";[.12,.88].forEach(function(px){g.fillRect(w*px-w*.03,h*.1,w*.06,h*.68)});g.fillStyle="#34405f";g.fillRect(w*.3,h*.22,w*.4,h*.3);g.strokeStyle="#f2b705";g.lineWidth=4;g.strokeRect(w*.33,h*.25,w*.34,h*.24);
  if(opt&&opt.crown!==false){g.fillStyle="#7a0b4a";rr(g,w*.42,h*.62,w*.16,h*.07,6);g.fill();crownDraw(g,w*.5,h*.6,Math.min(w,h)*.05,ts,opt&&opt.fake)}
  if(opt&&opt.alarm&&!still&&Math.floor((ts||0)/180)%2){g.fillStyle="rgba(255,59,59,.3)";g.fillRect(0,0,w,h)}
  if(opt&&opt.lasers){g.strokeStyle="rgba(255,59,59,.7)";g.lineWidth=1.5;g.shadowColor="#ff3b3b";g.shadowBlur=8;for(i=0;i<4;i++){var y=h*.3+i*h*.12+Math.sin((ts||0)/700+i)*6;g.beginPath();g.moveTo(w*.15,y);g.lineTo(w*.85,y+(i%2?30:-30));g.stroke()}g.shadowBlur=0}}
function briefScene(cv){var g=cv.getContext("2d"),t0=0;var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=ts-t0;nightBg(g,320,180,t,{lamp:true});
    drawPerson(g,90,172,7.5,Object.assign({},PPL.opa,{pose:"point"}),t);drawCrew(g,180,172,6.5,G.av,t);drawCrew(g,230,174,6,{c:(G.av.c+1)%4,h:(G.av.h+2)%4},t);
    g.fillStyle="#f2b705";g.font="700 16px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText("VANNACHT. · TONIGHT.".split(" · ")[L==="nl"?0:1],230,40);if(!still&&t<30000)requestAnimationFrame(f)};requestAnimationFrame(f)}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode==="map"||G.mode==="street")MW.pro.setFree(ID)}save();hush();ac();if(!G.cine){G.cine=true;save();cine(function(){photoSheet("team",enter)})}else enter()};
$("#bBack").onclick=function(){G=null;hush();home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}

/* ---------- intro: de Kroon, de Baron, Opa Kluis ---------- */
function cine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),w,h,dpr,t0=0,fin=false,raf=0;
  ov.hidden=false;var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();sfx("boot");music("map");
  var lines=T.cine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?13:t;g.setTransform(dpr,0,0,dpr,0,0);
    if(ph<4.4){nightBg(g,w,h,ts);var cs=Math.min(w,h)*.12;g.fillStyle="#7a0b4a";rr(g,w/2-cs*1.6,h*.62,cs*3.2,cs*.5,8);g.fill();crownDraw(g,w/2,h*.55,cs,ts);g.fillStyle="rgba(0,0,0,"+Math.max(0,Math.min(1,(ph-3.6)/.8))+")";g.fillRect(0,0,w,h)}
    else if(ph<7){museumBg(g,w,h,ts,{crown:true,lasers:true});var s=Math.max(5,Math.min(w,h)*.022),o=Object.assign({},PPL.baron,{pose:"hold",prop:"crown",bob:true});drawPerson(g,w*.5,h*.78,s*1.1,o,ts);
      g.fillStyle="#f2b705";g.font="700 "+Math.round(Math.min(26,w*.06))+"px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText("BARON VON GLANS",w/2,h*.18)}
    else{nightBg(g,w,h,ts,{lamp:true});var s2=Math.max(7,Math.min(w,h)*.03),o2=Object.assign({},PPL.opa);o2.pose=Math.floor(ph*1.5)%2?"point":"idle";drawPerson(g,w*.35,h*.86,s2,o2,ts);drawCrew(g,w*.62,h*.86,s2*.85,G.av,ts);drawCrew(g,w*.78,h*.87,s2*.8,{c:(G.av.c+2)%4,h:(G.av.h+1)%4},ts);
      if(ph>12.5){g.textAlign="center";g.fillStyle="#f2b705";g.shadowColor="#f2b705";g.shadowBlur=24;var fs=Math.round(Math.min(56,w*.14));g.font="700 "+fs+"px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.fillText(T.subTitle.toUpperCase(),w/2,h*.3);g.shadowBlur=0}}
    var li=Math.min(lines.length-1,Math.floor(ph/2.2));txt.textContent=lines[li];if(li!==spoken&&!still){spoken=li;say(lines[li])}
    if(ph>15.5&&!still)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);if(still)setTimeout(end,5000)}

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
function enter(){LEVEL=G.lvl||LEVEL;if(G.mode==="map"||G.mode==="demo"||G.mode==="in")enterMap();else{show("cards");render();music(G.fin===1?"esc":"map")}}
function hudTxt(pre){var n=done();$("#"+pre+"T").textContent=mmss(Date.now()-G.t0);$("#"+pre+"S").textContent=n+"/"+NN();$("#"+pre+"X").textContent=G.xp;$("#"+pre+"L").textContent=G.tl;$("#"+pre+"C").textContent=G.coins}
function hud(){if(!G)return;hudTxt("h")}
function stageHTML(n){return '<div class="crys"><canvas id="crC" width="240" height="160"></canvas><div><b>'+esc(fill(T.stage,{n:n,N:NN()}))+'</b><span class="xpbar"><i style="width:'+Math.round((G.xp%200)/2)+'%"></i></span><small>'+esc(rankName(G.tl))+' · '+G.xp+' '+T.xp+' · '+G.coins+' '+T.coins+(G.pu?' · '+esc(fill(T.puOn,{p:T.pu[G.pu][0]})):'')+'</small></div></div>'}
function paintStage(n){var cv=$("#crC");if(!cv)return;var g=cv.getContext("2d"),t0=0,f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;drawPlan(g,240,160,n,NN(),ts);if(!still&&ts-t0<15000)requestAnimationFrame(f)};requestAnimationFrame(f)}
function render(){hud();while(G.i<NN()&&G.ph[G.i])G.i++;var i=G.i,box=$("#card");
  if(i>=NN()){var lbl=G.fin===0?T.toBoss:G.fin===1?T.toEsc:T.toVault,line=G.fin===0?T.radarAll:G.fin===1?T.escIntro:D.OPA.escIn;
    box.innerHTML='<div class="pol done"><div class="grid">'+G.ph.map(function(p){return '<img src="'+p+'" alt="">'}).join("")+'</div></div>'+stageHTML(done())+bubble(line,NAMEOF("opa"))+'<button type="button" class="btn red" id="bAcc">'+lbl+'</button>';paintStage(done());$("#bAcc").onclick=finaleGate;return}
  var s=G.c.slots[i];box.innerHTML='<div class="pol empty"><div class="world">'+esc(fill(T.world,{i:i+1}))+'</div><p class="cap">'+esc(T.kinds[s.act])+'</p></div>'+stageHTML(done())+bubble(T.pz[s.act][1],NAMEOF(T.pz[s.act][2]||"opa"),"",AV(T.pz[s.act][2]||"opa"))+'<button type="button" class="btn" id="bOpen">'+T.start+'</button>';paintStage(done());$("#bOpen").onclick=function(){taskSheet(i)}}

/* ---------- spelen met kaart ---------- */
function enterMap(){show("play");music(G.fin===1?"esc":"map");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return R0},
    theme:{bg:"#0b1430",water:"#0a1d3d",waterEdge:"#1e3a8a",ripple:"rgba(58,160,255,.2)",park:"#0f2a2a",parkEdge:"#1f4a3c",river:"#0a1d3d",major:"#3b4f8a",minor:"#1e2a55",road:"#2c3f7a",label:"#bfd3ff",waterLabel:"#60a5fa",ring:"rgba(242,183,5,.25)",me:"#f2b705",meHalo:"rgba(242,183,5,.14)",meRing:"rgba(242,183,5,.7)",font:"700 11px 'Nunito',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&hit.ref.glimpse){if(GL.on)glimpseHit();return}if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(R0);sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d;lastFix=Date.now();KM.moved(d)});
  lastFix=Date.now();KM.enter({kids:true,virt:!!G.virt,map:map});stopSteps();if(G.mode==="in")startSteps();GL.next=Date.now()+45000+Math.random()*45000;if(G.mode==="demo")toast(T.demoTip);if(G.fin===1)escResume();requestAnimationFrame(loop)}
/* verhaalkaart: de nachtstad. Elke opdracht heeft zijn eigen plek (index = ACTS), 12 = het onderduikadres */
var START={x:500,y:1250},VSC=.42,FP=[{x:200,y:1030,k:"bank"},{x:760,y:1040,k:"laser"},{x:300,y:560,k:"shop"},{x:540,y:360,k:"brug"},{x:860,y:720,k:"halte"},{x:150,y:800,k:"power"},{x:150,y:330,k:"foto"},{x:500,y:800,k:"steeg"},{x:720,y:560,k:"lab"},{x:860,y:300,k:"key"},{x:360,y:1130,k:"alarm"},{x:640,y:1180,k:"toren"},{x:500,y:140,k:"garage"}];
var ROADS=[[-1,0],[-1,1],[-1,10],[-1,11],[0,5],[5,2],[2,6],[6,3],[3,12],[3,9],[9,4],[4,1],[4,8],[8,3],[7,0],[7,5],[7,8],[7,2],[10,0],[11,1],[11,4],[12,9],[12,6]];
function landmark(g,k,x,y,s){g.save();g.lineJoin="round";var I=MW.KidsMap.icons;
  if(k==="bank"){I.lamp(g,x+s*.6,y,s*.9,true);I.bench(g,x-s*.2,y,s*1.1)}
  else if(k==="laser"){g.fillStyle="#1f2a44";g.fillRect(x-s*.8,y-s*.9,s*1.6,s*.9);g.strokeStyle="#ff3b3b";g.lineWidth=s*.04;g.shadowColor="#ff3b3b";g.shadowBlur=8;for(var i=0;i<3;i++){g.beginPath();g.moveTo(x-s*.7,y-s*.75+i*s*.25);g.lineTo(x+s*.7,y-s*.55+i*s*.25);g.stroke()}g.shadowBlur=0}
  else if(k==="shop"){I.house(g,x,y,s,"#4b5563","#1e293b");I.awning(g,x,y-s*.22,s*.9,"#f2b705","#111");hatDraw(g,x,y-s*.3,s*.14,1)}
  else if(k==="brug"){I.bridge(g,x,y,s)}
  else if(k==="halte"){I.sign(g,x-s*.3,y,s,"#2563eb","H");I.bench(g,x+s*.35,y,s*.7)}
  else if(k==="power"){I.house(g,x,y,s*.9,"#374151","#111827");g.fillStyle="#f2b705";g.beginPath();g.moveTo(x-s*.05,y-s*.5);g.lineTo(x+s*.12,y-s*.5);g.lineTo(x,y-s*.3);g.lineTo(x+s*.12,y-s*.3);g.lineTo(x-s*.08,y-s*.02);g.lineTo(x,y-s*.25);g.lineTo(x-s*.12,y-s*.25);g.fill()}
  else if(k==="foto"){I.house(g,x,y,s,"#1e293b","#0f172a");g.fillStyle="#3aa0ff";g.beginPath();g.arc(x,y-s*.3,s*.14,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.arc(x+s*.05,y-s*.35,s*.04,0,7);g.fill()}
  else if(k==="steeg"){g.fillStyle="#1f2a44";g.fillRect(x-s*.9,y-s*1.1,s*.5,s*1.1);g.fillRect(x+s*.4,y-s*1.1,s*.5,s*1.1);g.fillStyle="#0b1430";g.fillRect(x-s*.4,y-s*.8,s*.8,s*.8);I.lamp(g,x+s*.3,y,s*.6,true)}
  else if(k==="lab"){I.house(g,x,y,s,"#e2e8f0","#475569");g.fillStyle="#39ff88";g.beginPath();g.arc(x-s*.25,y-s*.35,s*.1,0,7);g.arc(x+s*.25,y-s*.35,s*.1,0,7);g.fill()}
  else if(k==="key"){I.house(g,x,y,s*.9,"#78350f","#431407");drawItem(g,4,x,y-s*.95,s*.3)}
  else if(k==="alarm"){g.fillStyle="#334155";g.fillRect(x-s*.5,y-s*1.2,s,s*1.2);g.fillStyle="#ff3b3b";g.shadowColor="#ff3b3b";g.shadowBlur=12;g.beginPath();g.arc(x,y-s*1.3,s*.16,0,7);g.fill();g.shadowBlur=0;g.fillStyle="#0b1430";for(i=0;i<3;i++)g.fillRect(x-s*.3,y-s*1.05+i*s*.3,s*.6,s*.15)}
  else if(k==="toren"){g.fillStyle="#475569";g.fillRect(x-s*.22,y-s*1.8,s*.44,s*1.8);g.fillStyle="#334155";g.fillRect(x-s*.45,y-s*1.95,s*.9,s*.3);g.fillStyle="#f2b705";g.beginPath();g.arc(x,y-s*1.8,s*.1,0,7);g.fill()}
  else if(k==="garage"){g.fillStyle="#374151";g.fillRect(x-s*.9,y-s*.9,s*1.8,s*.9);g.fillStyle="#1f2937";g.beginPath();g.moveTo(x-s,y-s*.9);g.lineTo(x,y-s*1.3);g.lineTo(x+s,y-s*.9);g.fill();g.fillStyle="#6b7280";g.fillRect(x-s*.6,y-s*.65,s*1.2,s*.65);g.fillStyle="#4b5563";for(i=0;i<4;i++)g.fillRect(x-s*.6,y-s*.6+i*s*.16,s*1.2,s*.05);I.lamp(g,x+s*1.1,y,s*.7,true)}
  g.restore()}
var KM=MW.KidsMap.create({T:T.kv,go:function(s){walkTo={x:s.x,y:s.y};sel=null},G:function(){return G},P:function(){return P},dTo:function(s){return dTo(s)},virt:function(){return !!(G&&G.virt)},mode:function(){return G&&G.mode},
  map:{W:1000,H:1400,start:START,spots:FP,roads:ROADS,vsc:VSC,sky:"#060b1c",land:"#111a36",road:"#2c3f7a",roadLine:"#f2b705",label:"#eaf0ff",labelHalo:"rgba(6,11,28,.9)",heroHalo:"rgba(242,183,5,.18)"},
  draw:{mark:function(g,x,y,r,col){g.fillStyle=col;g.beginPath();g.ellipse(x,y,r*.6,r,0,0,7);g.fill()},
    ground:function(g,t){g.fillStyle="rgba(255,255,255,.04)";for(var i=0;i<70;i++){var q=(i*9301+49297)%233280/233280,q2=(i*4271+1013)%997/997;g.fillRect(80+q*840,140+q2*1120,40,26)}},
    decor:function(g,t){[[80,1200],[930,560],[60,560],[940,1240],[330,1250],[420,640],[640,620],[380,250],[660,250]].forEach(function(p){MW.KidsMap.icons.lamp(g,p[0],p[1],40,true)})},
    start:function(g,x,y){g.fillStyle="#2a3550";g.fillRect(x-150,y-130,300,130);g.fillStyle="#34405f";g.beginPath();g.moveTo(x-165,y-130);g.lineTo(x,y-200);g.lineTo(x+165,y-130);g.fill();g.fillStyle="#1a2b5e";[-100,-40,20,80].forEach(function(dx){g.fillRect(x+dx,y-115,22,115)});g.fillStyle="#f2b705";rr(g,x-120,y-250,240,46,8);g.fill();g.fillStyle="#0b1430";g.font="700 30px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText(T.kv.gate,x,y-216);crownDraw(g,x,y-70,22,0)},
    landmark:landmark,
    hero:function(g,x,y,t){drawCrew(g,x,y+6,6.5,G.av,t)},
    runner:function(g,fx,fy,t){if(GL.on||(G&&G.fin===1))return;var aa=t/2000;carTop(g,fx+Math.cos(aa)*110,fy+40+Math.sin(aa)*20,aa+Math.PI/2,14,false,t)},
    world:function(g,t,to,sc,still2){escDrawKids(g,t,to,sc)},
    overlay:function(g,w,h,t){if(!GL.on)return false;var gt=(t-GL.t0)/1000,gx=GL.dir>0?-80+gt/4*(w+160):w+80-gt/4*(w+160),gy=h*.5;GL.x=gx;GL.y=gy;carTop(g,gx,gy,GL.dir>0?0:Math.PI,Math.max(16,h*.03),false,t);if(gt>4){GL.on=false;KM.setMsg("");toast(T.glimpseNo);return false}KM.setMsg(T.glimpse);return true}},
  onTap:function(x,y){if(!GL.on)return;if(Math.hypot(x-GL.x,y-GL.y)<80)glimpseHit()}});
KM.mount();
function glimpseHit(){GL.on=false;G.gl=(G.gl||0)+1;G.coins+=10;save();buzz([40,30,80]);sfx("coin");KM.setMsg("");toast(fill(T.glimpseYes,{n:10}))}
function glimpseTick(){if(GL.on||!G||G.fin>0||(G.gl||0)>=3||!$("#sheet").hidden||Date.now()<GL.next)return;var open=G.st.filter(function(s){return !s.done});if(!open.length)return;if(!KM.on()&&G.mode!=="demo")return;GL.on=true;GL.t0=performance.now();GL.dir=Math.random()<.5?1:-1;GL.next=Date.now()+70000+Math.random()*60000;say(T.glimpse);sfx("engine");buzz([30,40,30])}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[],open=G.st.filter(function(s){return !s.done});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var col=s.hide?"#39ff88":["#f2b705","#3aa0ff","#ff3b3b","#39ff88"][s.fi%4];
    if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=3;cx.beginPath();cx.arc(X,Y,18+((t/1500)%1)*24,0,7);cx.stroke();cx.globalAlpha=1}
    cx.fillStyle=s.done?"#4b5563":"#0b1430";cx.beginPath();cx.arc(X,Y,17,0,7);cx.fill();cx.strokeStyle=s.done?"#9ca3af":col;cx.lineWidth=3;cx.stroke();
    cx.fillStyle=s.done?"#d1d5db":col;cx.font="700 15px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";cx.textAlign="center";cx.textBaseline="middle";cx.fillText(s.done?"✓":s.hide?"★":String(s.fi+1),X,Y+1);cx.textBaseline="alphabetic";
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,25,0,7);cx.stroke()}
    cx.fillStyle=s.done?"#9ca3af":"#eaf0ff";cx.font="700 11px 'Nunito',sans-serif";if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+34)}})});
  if(GL.on&&!KM.on()){var gt=(performance.now()-GL.t0)/1000,gref={x:P.x+(GL.dir>0?-220+gt*110:220-gt*110),y:P.y+90,glimpse:true};it.push({x:gref.x,y:gref.y,ref:gref,tap:true,draw:function(cx,X,Y,t){carTop(cx,X,Y,GL.dir>0?0:Math.PI,16,false,t)}});if(gt>4){GL.on=false;toast(T.glimpseNo)}}
  if(G.fin===1&&G.esc)escItems(it);
  if(open.length&&G.fin!==1){var near=open.reduce(function(a,s){return dTo(s)<dTo(a)?s:a});it.push({x:near.x,y:near.y,tap:false,draw:function(cx,X,Y,t,api){var a=t/2000,rx=50*api.V.s+30;for(var i=0;i<4;i++)sparkle(cx,X+Math.cos(a+i*1.57)*rx,Y+Math.sin(a+i*1.57)*rx*.6,5,i%2?"#f2b705":"#39ff88",t/300)}})}
  return it}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(G.mode==="demo"&&walkTo&&!FRZ){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=110*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  if(G.fin===1&&G.esc)escStep(dt,t);
  if(!KM.draw(t))map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tickMap();glimpseTick();if(G.fin===1&&G.esc)escTick()}requestAnimationFrame(loop)}
function tickMap(){hudTxt("m");var open=G.st.filter(function(s){return !s.done}),near=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;near=s}});
  if(G.fin===1&&G.esc&&near)$("#radar").textContent=fill(T.escTimer,{t:mmss(escLeft()*1000)})+" · "+fill(T.escRadar,{d:Math.round(nd)});
  else $("#radar").textContent=!near?T.radarAll:nd<60?fill(T.hot,{d:Math.round(nd)}):nd<150?fill(T.warm,{d:Math.round(nd)}):fill(T.near,{d:Math.round(nd)});
  var here=open.filter(inRange)[0];if(here&&arrived!==here&&$("#sheet").hidden){arrived=here;sel=here;buzz([80,60,80]);sfx("coin")}if(!here)arrived=null;
  chip();var el=Math.floor((Date.now()-G.t0)/1000);if(el%10===0)save();if(G.mode==="map"&&!G.virt&&lastFix&&Date.now()-lastFix>45000){lastFix=Date.now();toast(T.kv.gpsLost)}
  if(open.length&&G.fin===0&&$("#sheet").hidden&&!here&&Date.now()-(G.lastVisit||G.t0)>80000)visit()}
function chip(){var c=$("#chip");if(!sel||sel.done){c.hidden=true;return}c.hidden=false;var d=dTo(sel),ok=inRange(sel);
  if(sel.hide){$("#cName").textContent=sel.name;$("#cHint").textContent=ok?T.escHere:T.escIntro}else{var act=G.c.slots[sel.fi].act;$("#cName").textContent=fill(T.world,{i:sel.fi+1})+" · "+sel.name;$("#cHint").textContent=T.kinds[act]}
  $("#cDist").textContent=Math.round(d)+" m";
  var b=$("#cAct");b.hidden=false;if(ok)b.textContent=sel.hide?T.toVault:T.look;else if(G.mode==="demo")b.textContent=T.walk;else if(d<150)b.textContent=T.gps;else b.hidden=true}
$("#cAct").onclick=function(){if(!sel)return;if(inRange(sel))taskSheet(sel.fi,sel);else if(G.mode==="demo"){walkTo={x:sel.x,y:sel.y};map.follow()}else if(dTo(sel)<150){G.force=sel;taskSheet(sel.fi,sel)}};
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
$("#zM").onclick=menuSheet;$("#zM2").onclick=menuSheet;
$("#mNote").onclick=noteSheet;$("#mPeople").onclick=lvlSheet;$("#mAcc").onclick=function(){if(done()>=NN())finaleGate();else noteSheet()};
$("#bNote").onclick=noteSheet;$("#bPeople").onclick=lvlSheet;$("#bAcc2").onclick=function(){if(done()>=NN())finaleGate();else noteSheet()};

/* ---------- de Baron (of een bewaker) kaapt het scherm ---------- */
function visit(force){if(!G)return;G.lastVisit=Date.now();if(!force&&Math.random()<.35)return;var k=(G.vi==null?G.seed:G.vi+1)%D.HIJACK.length;G.vi=k;save();
  if(!$("#sheet").hidden||(MW.Crew&&MW.Crew.busy()))return;sfx("radio");buzz([30,30,30,30,120]);var h=D.HIJACK[k];say(h[1]);
  var first=!G.hjSeen;G.hjSeen=1;save();if(first)say(T.hijackIntro);MW.Crew.hijack({head:T.hijackH,who:NAMEOF(h[0])+" · "+D.PEOPLE[h[0]][1],line:(first?T.hijackIntro+"\n\n":"")+h[1],secs:h[2]||12,say:false,then:function(){sfx("hit");if(G.mode==="map"||G.mode==="demo"||G.mode==="in")chip();else render()}})}

/* ---------- een stop: opdracht → puzzel → GELUKT ---------- */
function taskSheet(i,spot){walkTo=null;if(spot&&spot.hide)return hideoutArrive(spot);if(i>=NN())return finaleGate();var s=G.c.slots[i];cur={i:i,spot:spot||null,h:3,t0:Date.now(),retries:cur&&cur.i===i?cur.retries:0,pu:G.pu,stat:{}};
  if(cur.pu){G.pu=null;save();if(cur.pu==="shield")cur.shield=true;if(cur.pu==="hint")cur.freeHint=true;if(cur.pu==="time")cur.extra=hard()?10:15}
  var I=T.pz[s.act],who=I[2]||"opa",head='<div class="eyebrow">'+esc(fill(T.world,{i:i+1}))+' · '+esc(T.kinds[s.act])+(spot?' · '+esc(spot.name):'')+'</div><div class="pzh"><div class="hearts" id="pzH"></div><div class="pzinfo"><b id="pzTm"></b><span>'+G.coins+' <i class="coin"></i></span></div></div>';
  sheet(head+'<h2>'+esc(I[0])+'</h2>'+bubble(I[1],NAMEOF(who),"small",AV(who))+(cur.pu?'<p class="note pu">⚡ '+esc(fill(T.puOn,{p:T.pu[cur.pu][0]}))+'</p>':'')+'<div id="pz"></div><div id="pzB"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
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
    hint:function(fn){var b=document.createElement("button");b.type="button";b.className="btn ghost dk sm hintb";b.textContent="💡 "+(cur.freeHint?T.hintFree:fill(T.hintCost,{c:15}));$("#pzB").appendChild(b);
      b.onclick=function(){if(cur.freeHint)cur.freeHint=false;else if(G.coins>=15)G.coins-=15;else{toast(fill(T.hintNo,{c:15}));return}cur.hinted=1;save();b.textContent="💡 "+fill(T.hintCost,{c:15});sfx("coin");fn()}}};
  if(/debug/.test(location.search))window.GK_DBG=o;
  if(window.MMP)MMP.helper(function(){G.t0-=120000;G.skips=(G.skips||0)+1;cur.h=1;save();o.done()},function(){say(I[1])});
  PUZ[s.act](o)}
function paintHearts(){var e=$("#pzH");if(!e||!cur)return;e.innerHTML="";for(var i=0;i<3;i++){var s=document.createElement("i");if(i<cur.h)s.className="on";e.appendChild(s)}}
function dead(){mg.stop();var box=$("#pz");box.innerHTML='<div class="deadbox"><b>'+esc(T.deadH)+'</b><p>'+esc(T.dead)+'</p><button type="button" class="btn" id="pzR">'+esc(T.retry)+'</button></div>';$("#pzB").innerHTML="";sfx("bad");say(T.dead);
  $("#pzR").onclick=function(){var i=cur.i,sp=cur.spot;cur.retries++;G.retries++;save();var keep=cur;taskSheet(i,sp);cur.retries=keep.retries}}
function thumb(i,act){var cv=document.createElement("canvas");cv.width=cv.height=240;var g=cv.getContext("2d");drawPlan(g,240,240,Math.min(NN(),done()+1),NN(),0);g.fillStyle="rgba(6,11,28,.6)";g.fillRect(0,0,240,74);g.fillStyle="#f2b705";g.font="700 22px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText(fill(T.world,{i:i+1}).toUpperCase(),120,32);g.fillStyle="#fff";g.font="700 15px 'Nunito',sans-serif";g.fillText(T.kinds[act],120,58);drawCrew(g,120,232,13,G.av,0,"up");return cv.toDataURL("image/png")}
function accept(){var i=cur.i,s=G.c.slots[i];G.ph[i]=cur.thumb;if(cur.spot){cur.spot.done=true;cur.spot.doneAt=Date.now();G.kd0=null}G.force=null;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;
  var secs=cur.secs,xp=100+cur.h*20+(secs<60?30:0)-Math.min(60,cur.retries*20);if(cur.pu==="xp2")xp*=2;var coins=s.coins+cur.h*5;if(cur.pu==="coin2")coins*=2;
  var oldL=G.tl;G.xp+=xp;G.coins+=coins;G.tl=rankOf(G.xp);G.times.push(secs);save();buzz([40,30,80]);sfx("clear");
  if(cur.h===3&&!cur.retries)ach("flawless");if(secs<45)ach("speed");if(G.coins>=150)ach("rich");if(G.tl===10)ach("max");Object.keys(cur.stat).forEach(ach);
  var n=done(),N=NN(),last=n>=N,el=PRIO[Math.min(10,Math.round((n-1)/N*11))],rew='',said=[];
  rew+='<div class="rew"><canvas class="itc" data-k="'+el+'" width="80" height="80"></canvas><p>'+esc(fill(T.itemT,{it:D.ITEMS[el][0],on:D.ITEMS[el][1]}))+'</p></div>';said.push(fill(T.itemT,{it:D.ITEMS[el][0],on:D.ITEMS[el][1]}));
  if(s.cd>=0){var ct=fill(T.codeT,{p:s.cd+1,d:codeDigit(s.cd)});rew+='<div class="rew"><div class="digit"><small>'+esc(T.codeH)+'</small><b>'+codeDigit(s.cd)+'</b><span>'+(s.cd+1)+'/4</span></div><p>'+esc(ct)+'</p></div>';said.push(ct)}
  if(s.e>=0){var e=G.c.ev[s.e],et=fill(e.t,{v:D.AT[e.k].v[e.v]});rew+='<div class="rew"><canvas class="evc" data-k="'+e.k+'" data-v="'+e.v+'" width="80" height="80"></canvas><p>'+esc(et)+'</p></div>';said.push(et);G.sn=G.sn||{};if(!G.sn.e){G.sn.e=1;rew+='<p class="why">'+esc(T.evT)+'</p>';said.push(T.evT)}}
  if(s.w>=0){var w=G.c.wits[s.w],wt=witText(w);rew+='<div class="rew">'+bubble(wt,NAMEOF(WITK[w.p])+" · "+D.PEOPLE[WITK[w.p]][1],"small",AV(WITK[w.p]))+'</div>';said.push(wt);G.sn=G.sn||{};if(!G.sn.w){G.sn.w=1;rew+='<p class="why">'+esc(T.witT)+'</p>';said.push(T.witT)}}
  var cliff=last?D.OPA.cliffLast:D.OPA.cliff[(n-1+G.seed)%D.OPA.cliff.length],react=D.OPA.react[(n+G.seed)%D.OPA.react.length];
  sheet('<div class="clear"><div class="eyebrow">'+esc(fill(T.world,{i:i+1}))+'</div><h2 class="big">'+esc(T.clear)+'</h2><canvas id="clC" width="320" height="180"></canvas>'+
    '<div class="tally"><span><b id="tXp">0</b>'+T.xp+'</span><span><b id="tCo">0</b>'+T.coins+'</span><span><b>'+cur.h+'</b>'+T.hearts+'</span><span><b>'+secs+'s</b>'+(secs<60?T.fast:T.timer)+'</span></div>'+(n===1&&T.tallyT?'<p class="why">'+esc(T.tallyT)+'</p>':'')+
    (G.tl>oldL?'<div class="lvlup">'+esc(fill(T.lvlUp,{l:rankName(G.tl)}))+'</div>':'')+
    '<div class="rep"><em>'+esc(T.found1)+'</em>'+rew+'</div>'+
    (!last?'<div class="eyebrow">'+esc(T.puH)+'</div><div class="pus" id="pus">'+s.pu.map(function(p){return '<button type="button" data-p="'+p+'"><b>'+esc(T.pu[p][0])+'</b><small>'+esc(T.pu[p][1])+'</small></button>'}).join("")+'</div>':'')+
    '<div class="msg small">'+AV("opa")+'<div class="bub"><p>'+esc(react)+'</p></div></div><p class="cliff">'+esc(cliff)+'</p><button type="button" class="btn" id="bNext"'+(!last?' disabled':'')+'>'+(last?T.toBoss:T.next)+'</button></div>',true);
  clearAnim($("#clC"),n);countUp($("#tXp"),xp);countUp($("#tCo"),coins);
  $$("#sheetBody .evc").forEach(function(cv){evDraw(cv.getContext("2d"),cv.dataset.k,+cv.dataset.v)});$$("#sheetBody .itc").forEach(function(cv){var g=cv.getContext("2d");g.fillStyle="#13306b";rr(g,0,0,80,80,12);g.fill();drawItem(g,+cv.dataset.k,40,42,18)});
  if(G.tl>oldL)setTimeout(function(){sfx("levelup")},700);
  say(T.clear+". "+said.join(" ")+" "+react+" "+cliff);
  if(!last)$("#pus").onclick=function(e){var b=e.target.closest("button");if(!b)return;G.pu=b.dataset.p;save();$$("#pus button").forEach(function(x){x.classList.toggle("on",x===b)});$("#bNext").disabled=false;sfx("coin")};
  $("#bNext").onclick=function(){closeSheet();sel=null;cur=null;var goOn=function(){if(G.mode==="map"||G.mode==="demo"||G.mode==="in"){chip();if(last)finaleGate()}else{render();if(last)finaleGate()}};
    var pa=(POSE_AT[N]||[]);if(pa.indexOf(n)>=0&&!G.poses[n]){G.poses[n]=1;save();return photoSheet("pose",function(){if(Object.keys(G.poses).length>=pa.length&&(G.album||[]).length>=pa.length)ach("photo");goOn()},n)}goOn()}}
function countUp(el,v){var t0=performance.now(),f=function(ts){var p=Math.min(1,(ts-t0)/900);el.textContent=Math.round(v*p);if(p<1&&!still)requestAnimationFrame(f);else el.textContent=v};requestAnimationFrame(f)}
function clearAnim(cv,n){var g=cv.getContext("2d"),t0=0;var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=(ts-t0)/1000;drawPlan(g,320,180,n,NN(),ts);drawCrew(g,280,172,6,G.av,still?0:ts,Math.floor(t*2)%2?"up":"wave");
    if(t<1.2){g.fillStyle="rgba(255,255,255,"+(1-t/1.2)*.5+")";g.fillRect(0,0,320,180)}if(!still&&t<20)requestAnimationFrame(f)};requestAnimationFrame(f)}

/* ---------- de puzzels ---------- */
function rand(o,a,b){return a+Math.floor(o.rng()*(b-a+1))}
var PUZ={
/* 1 verkenning: bewakers tellen op het bewakingsbeeld */
scout:function(o){var cv=o.canvas(240),g=cv.getContext("2d"),N=o.hard?rand(o,5,7):rand(o,3,5),dur=o.hard?14:16,guards=[],t0=0,asked=false,q=rngOf(o.rng()*1e9|0);
  for(var i=0;i<N;i++)guards.push({t:1.2+i*(dur-3)/N+q()*.8,dir:q()<.5?1:-1,k:q()<.5?"bas":"henk",y:190+q()*20,sp:.9+q()*.4});
  if(o.hard){var k2=Math.floor(q()*N);guards[k2].t=guards[(k2+1)%N].t+.3}
  var f=function(ts){if(!t0)t0=ts;var t=(ts-t0)/1000;museumBg(g,280,240,ts,{crown:false});g.fillStyle="#2a3550";g.fillRect(118,40,44,150);g.fillStyle="#1f2a44";g.fillRect(126,40,28,150);
    guards.forEach(function(gd){var el=t-gd.t;if(el<0||el>6/gd.sp)return;var x=gd.dir>0?-20+el*gd.sp*55:300-el*gd.sp*55;var o2=Object.assign({},PPL[gd.k],{pose:"idle",bob:true,ph:gd.t*1000});
      /* achter de pilaar: even onzichtbaar */if(x>112&&x<168)return;drawPerson(g,x,gd.y,6.5,o2,ts)});
    g.fillStyle="rgba(0,0,0,.45)";g.fillRect(0,0,280,22);g.fillStyle="#ff3b3b";g.beginPath();g.arc(12,11,4+(Math.floor(ts/500)%2?0:1),0,7);g.fill();g.fillStyle="#fff";g.font="700 11px 'Nunito',sans-serif";g.textAlign="left";g.fillText("CAM 01 · "+new Date().toTimeString().slice(0,8),22,15);
    for(var k=0;k<240;k+=4){g.fillStyle="rgba(0,0,0,.08)";g.fillRect(0,k,280,1)}
    if(t<dur){o.msg(fill(T.scoutWatch,{s:Math.ceil(dur-t)}));mg.raf=requestAnimationFrame(f)}else ask()};mg.raf=requestAnimationFrame(f);
  var ask=function(){if(asked)return;asked=true;o.msg(T.scoutQ);var opts=[];for(var i=Math.max(1,N-3);i<=N+3;i++)opts.push(i);opts=opts.slice(0,7);
    o.box.insertAdjacentHTML("beforeend",'<div class="numpad" id="scN">'+opts.map(function(n){return '<button type="button" data-n="'+n+'">'+n+'</button>'}).join("")+'</div>');
    $("#scN").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(+b.dataset.n===N){o.msg(fill(T.scoutYes,{n:N}));o.good();o.done()}else{b.disabled=true;o.msg(T.scoutNo);if(o.bad())return;if(cur.h===1){/* laatste kans: nog eens kijken */$("#scN").remove();asked=false;t0=0;mg.raf=requestAnimationFrame(f)}}}};
  o.hint(function(){o.msg(T.scoutQ+" ("+(N-1)+" … "+(N+1)+")")})},
/* 2 laser-doolhof: sleep de sluiper van onder naar boven, lasers knipperen */
laser:function(o){var H=340;o.box.innerHTML='<div class="arbox tall"><video id="arV" playsinline muted autoplay></video><canvas id="arC" width="280" height="'+H+'"></canvas></div>';var cv=$("#arC"),g=cv.getContext("2d"),hasCam=false,q=rngOf(o.rng()*1e9|0),N=o.hard?6:5,L2=[],pl={x:140,y:H-24},drag=false,t0=performance.now(),hits=0;
  for(var i=0;i<N;i++){var y=50+i*(H-100)/N;L2.push({y:y,per:1400+q()*900,ph:q()*3000,ang:(q()-.5)*.5,on:1})}
  var rot=o.hard?{y:H*.5,per:4200}:null;
  var isOn=function(l,ts){return((ts+l.ph)%l.per)<l.per*.55};
  var hitLine=function(x,y,ts){for(var i=0;i<L2.length;i++){var l=L2[i];if(!isOn(l,ts))continue;var ly=l.y+(x-140)*Math.tan(l.ang);if(Math.abs(y-ly)<7)return true}
    if(rot){var a=ts/rot.per*6.283,dx=x-140,dy=y-rot.y,d=Math.abs(dx*Math.sin(a)-dy*Math.cos(a)),along=dx*Math.cos(a)+dy*Math.sin(a);if(d<7&&Math.abs(along)<120)return true}return false};
  var reset=function(){pl={x:140,y:H-24};drag=false;hits++;o.msg(T.laserHit);sfx("alarm");buzz([80,40,80]);o.bad()};
  var f=function(ts){g.clearRect(0,0,280,H);if(!hasCam)museumBg(g,280,H,ts,{crown:true});else{g.fillStyle="rgba(11,20,48,.3)";g.fillRect(0,0,280,H)}
    g.fillStyle="rgba(242,183,5,.25)";g.fillRect(100,0,80,30);crownDraw(g,140,16,10,ts);
    L2.forEach(function(l){var on=isOn(l,ts);g.strokeStyle=on?"rgba(255,59,59,.95)":"rgba(255,59,59,.15)";g.lineWidth=on?2.5:1;g.shadowColor="#ff3b3b";g.shadowBlur=on?10:0;g.beginPath();g.moveTo(0,l.y-140*Math.tan(l.ang));g.lineTo(280,l.y+140*Math.tan(l.ang));g.stroke();g.shadowBlur=0;g.fillStyle="#475569";g.fillRect(0,l.y-140*Math.tan(l.ang)-6,8,12);g.fillRect(272,l.y+140*Math.tan(l.ang)-6,8,12)});
    if(rot){var a=ts/rot.per*6.283;g.save();g.translate(140,rot.y);g.rotate(a);g.strokeStyle="rgba(255,59,59,.95)";g.lineWidth=2.5;g.shadowColor="#ff3b3b";g.shadowBlur=10;g.beginPath();g.moveTo(-120,0);g.lineTo(120,0);g.stroke();g.shadowBlur=0;g.fillStyle="#475569";g.beginPath();g.arc(0,0,7,0,7);g.fill();g.restore()}
    drawCrew(g,pl.x,pl.y+12,3.2,G.av,0,"sneak");
    if(drag&&hitLine(pl.x,pl.y,ts))reset();
    if(pl.y<34){o.msg(T.laserOk);o.good();if(!hits)o.flag("laser");o.done();return}mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  cv.onpointerdown=function(e){var p=o.at(e,cv);if(Math.hypot(p[0]-pl.x,p[1]-pl.y)<40){drag=true;cv.setPointerCapture&&cv.setPointerCapture(e.pointerId)}};
  cv.onpointermove=function(e){if(!drag)return;var p=o.at(e,cv),nx=Math.max(12,Math.min(268,p[0])),ny=Math.max(10,Math.min(H-24,p[1]));/* stap voor stap, zodat je niet door een straal heen springt */var steps=Math.ceil(Math.hypot(nx-pl.x,ny-pl.y)/4)||1;for(var k=1;k<=steps;k++){var x=pl.x+(nx-pl.x)*k/steps,y=pl.y+(ny-pl.y)*k/steps;if(hitLine(x,y,performance.now())){reset();return}}pl.x=nx;pl.y=ny};
  cv.onpointerup=cv.onpointercancel=function(){drag=false};
  o.msg(T.laserGo);
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(st){var vid=$("#arV");if(!vid){st.getTracks().forEach(function(t){t.stop()});return}vid.srcObject=st;hasCam=true;mg.off=function(){st.getTracks().forEach(function(t){t.stop()})}}).catch(function(){})},
/* 3 vermomming: stel de outfit samen die bij de beschrijving past */
disguise:function(o){var K=["hoofd","bril","jas","snor"],OPT=T.disOpt,want={},have={hoofd:-1,bril:-1,jas:-1,snor:-1},first=true,neg=null;
  K.forEach(function(k){want[k]=Math.floor(o.rng()*OPT[k].length)});
  /* Rookie: drie regels (jas, hoofd, bril); Meesterdief: alles, met één "zonder"-regel */
  if(!o.hard){want.snor=1;var rule=fill(T.disRule,{a:OPT.hoofd[want.hoofd],b:OPT.bril[want.bril],c:OPT.jas[want.jas]})}
  else{neg=K[Math.floor(o.rng()*4)];var pos=K.filter(function(k){return k!==neg});
    /* de "zonder"-regel: het kenmerk dat ontbreekt */if(neg==="hoofd")want.hoofd=3;else if(neg==="bril")want.bril=2;else if(neg==="snor")want.snor=1;else want.jas=Math.floor(o.rng()*3);
    var rule=fill(T.disRuleX,{a:OPT[pos[0]][want[pos[0]]],b:OPT[pos[1]][want[pos[1]]],c:OPT[pos[2]][want[pos[2]]],d:neg==="jas"?OPT.jas[(want.jas+1)%3].replace(/^een /,""):T.disNeg[neg]});if(neg==="jas")want.jasNot=(want.jas+1)%3}
  var doll=function(g,x,y,s,st){var top=st.jas>=0?["#f2b705","#dc2626","#2563eb"][st.jas]:"#64748b";var hat=st.hoofd===0?0:st.hoofd===1?1:st.hoofd===2?5:null;var gl=st.bril===0?2:st.bril===1?1:0;
    drawPerson(g,x,y,s,{skin:"#f1c27d",hair:"#3b2a14",hs:1,top:top,legs:"#1f2937",hat:hat,glasses:gl,must:st.snor===0?1:0,shoe:0},0)};
  var cells=function(k,vi,g){g.fillStyle="#13306b";g.fillRect(0,0,56,56);if(k==="hoofd"){if(vi===3){g.fillStyle="#94a3b8";g.font="700 22px 'Nunito',sans-serif";g.textAlign="center";g.fillText("–",28,36)}else hatDraw(g,28,40,13,[0,1,5][vi])}
    else if(k==="bril"){if(vi===2){g.fillStyle="#94a3b8";g.font="700 22px 'Nunito',sans-serif";g.textAlign="center";g.fillText("–",28,36)}else drawHeadAt(g,28,30,14,{skin:"#f1c27d",hair:"#3b2a14",hs:1,glasses:vi===0?2:1},0)}
    else if(k==="jas"){g.fillStyle=["#f2b705","#dc2626","#2563eb"][vi];g.beginPath();g.moveTo(14,14);g.lineTo(42,14);g.lineTo(48,48);g.lineTo(8,48);g.fill()}
    else drawHeadAt(g,28,30,14,{skin:"#f1c27d",hair:"#3b2a14",hs:1,must:vi===0?1:0},0)};
  var paint=function(){var rows=(o.hard?K:["hoofd","bril","jas"]);o.box.innerHTML='<div class="clues"><p>'+esc(rule)+'</p></div><div class="styl"><canvas width="160" height="200"></canvas><div class="stylo">'+rows.map(function(k){return '<div class="srow c'+OPT[k].length+'" data-c="'+k+'">'+OPT[k].map(function(v,vi){return '<button type="button" data-v="'+vi+'" class="'+(have[k]===vi?"on":"")+'" aria-label="'+esc(v)+'"><canvas width="56" height="56"></canvas></button>'}).join("")+'</div>'}).join("")+'</div></div><button type="button" class="btn sm" id="disOk">'+esc(T.disOk)+'</button>';
    var g=o.box.querySelector(".styl>canvas").getContext("2d");g.fillStyle="#0b1430";g.fillRect(0,0,160,200);doll(g,80,195,13,have);
    $$("#pz .srow").forEach(function(row){var k=row.dataset.c;[].forEach.call(row.querySelectorAll("canvas"),function(c,vi){cells(k,vi,c.getContext("2d"))})});
    o.box.querySelector(".stylo").onclick=function(e){var b=e.target.closest("button");if(!b)return;var k=b.closest(".srow").dataset.c;have[k]=+b.dataset.v;o.hit();paint()};
    $("#disOk").onclick=function(){var rows2=(o.hard?K:["hoofd","bril","jas"]),ok=rows2.every(function(k){if(k==="jas"&&want.jasNot!=null)return have.jas>=0&&have.jas!==want.jasNot;return have[k]===want[k]});
      if(ok){o.msg(T.disYes);o.good();o.done()}else{first=false;o.msg(T.disNo);if(o.bad())return}}};
  paint();o.hint(function(){var k=(o.hard?K:["hoofd","bril","jas"]).filter(function(k){return have[k]!==want[k]})[0];if(k&&!(k==="jas"&&want.jasNot!=null)){have[k]=want[k];paint()}})},
/* 4 kluisslot op het gehoor: draai de schijf, trillen en klikken bij het goede getal */
dial:function(o){var cv=o.canvas(300),g=cv.getContext("2d"),target=[],k=0,ang=0,last=null,lastClickN=-1,first=true,N=20;for(var i=0;i<3;i++)target.push(Math.floor(o.rng()*N));
  o.box.insertAdjacentHTML("beforeend",'<button type="button" class="btn sm" id="dlOk">'+esc(T.dialFix)+'</button>');
  var num=function(){return((Math.round(-ang/(6.283/N))%N)+N)%N};
  var dist=function(a,b){var d=Math.abs(a-b)%N;return Math.min(d,N-d)};
  var draw=function(){var cx=140,cy=150,R=110;g.fillStyle="#0b1430";g.fillRect(0,0,280,300);g.fillStyle="#1f2a44";g.beginPath();g.arc(cx,cy,R+14,0,7);g.fill();
    g.save();g.translate(cx,cy);g.rotate(ang);var gr=g.createRadialGradient(-30,-30,10,0,0,R);gr.addColorStop(0,"#94a3b8");gr.addColorStop(1,"#334155");g.fillStyle=gr;g.beginPath();g.arc(0,0,R,0,7);g.fill();
    for(i=0;i<N;i++){var a=i*6.283/N;g.save();g.rotate(a);g.fillStyle="#0b1430";g.fillRect(-1.5,-R+6,3,i%5?10:18);if(i%5===0){g.fillStyle="#fff";g.font="700 14px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.save();g.translate(0,-R+36);g.rotate(-a-ang);g.fillText(i,0,5);g.restore()}g.restore()}
    g.fillStyle="#1f2a44";g.beginPath();g.arc(0,0,30,0,7);g.fill();g.restore();
    g.fillStyle="#f2b705";g.beginPath();g.moveTo(cx,cy-R-22);g.lineTo(cx-8,cy-R-36);g.lineTo(cx+8,cy-R-36);g.fill();
    for(i=0;i<3;i++){g.fillStyle=i<k?"#39ff88":"#334155";g.beginPath();g.arc(60+i*80,282,8,0,7);g.fill()}
    var n=num();g.fillStyle="#fff";g.font="700 20px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText(n,cx,cy+6);
    if(!o.hard){var d=dist(n,target[k]);g.fillStyle=d===0?"#39ff88":d<3?"#f2b705":"#64748b";g.font="700 12px 'Nunito',sans-serif";g.fillText(d===0?"●":d<3?T.dialWarm:T.dialCold,cx,cy+22)}};
  draw();o.msg(fill(T.dialGo,{k:1}));
  cv.onpointerdown=function(e){var p=o.at(e,cv);last=Math.atan2(p[1]-150,p[0]-140);cv.setPointerCapture&&cv.setPointerCapture(e.pointerId)};
  cv.onpointermove=function(e){if(last==null)return;var p=o.at(e,cv),a=Math.atan2(p[1]-150,p[0]-140),d=a-last;if(d>Math.PI)d-=6.283;if(d<-Math.PI)d+=6.283;ang+=d;last=a;var n=num();
    if(n!==lastClickN){lastClickN=n;if(n===target[k]){buzz([40,30,40]);sfx("click");tone(1800,.05,"sine",.05)}else tone(500,.02,"square",.02)}draw()};
  cv.onpointerup=cv.onpointercancel=function(){last=null};
  $("#dlOk").onclick=function(){if(num()===target[k]){k++;o.good();if(k>=3){o.msg(T.dialOpen);if(first)o.flag("dial");o.done()}else{o.msg(fill(T.dialYes,{k:k})+" "+fill(T.dialGo,{k:k+1}));draw()}}else{first=false;o.msg(T.dialNo);if(o.bad())return}};
  o.hint(function(){o.msg(fill(T.dialGo,{k:k+1})+" → "+target[k])})},
/* 5 plattegrond: door het museum langs draaiende camera's */
blueprint:function(o){var N=o.hard?7:6,cv=o.canvas(280),g=cv.getContext("2d"),cs=240/N,ox=20,oy=20,q=rngOf(o.rng()*1e9|0),walls={},cams=[],pl,start,goal,seen=false,moves=0;
  var key=function(r,c){return r+","+c};
  var gen=function(){walls={};cams=[];for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(q()<.22&&c>0&&c<N-1)walls[key(r,c)]=1;start=[Math.floor(q()*N),0];goal=[Math.floor(q()*N),N-1];delete walls[key(start[0],0)];delete walls[key(goal[0],N-1)];
    var nC=o.hard?4:3;for(var i=0;i<nC;i++){var r2,c2,t=0;do{r2=Math.floor(q()*N);c2=1+Math.floor(q()*(N-2));t++}while((walls[key(r2,c2)]||(r2===start[0]&&c2<2)||(r2===goal[0]&&c2>N-3))&&t<40);walls[key(r2,c2)]=1;cams.push({r:r2,c:c2,ph:Math.floor(q()*4),per:o.hard?1100:1500,dir:q()<.5?1:-1})}};
  /* zicht van een camera op tijd t: richting d (0 boven,1 rechts,2 onder,3 links), twee vakjes ver tot een muur */
  var camDir=function(cm,ts){return((cm.ph+cm.dir*Math.floor(ts/cm.per))%4+4)%4};
  var watched=function(ts){var w={};cams.forEach(function(cm){var d=camDir(cm,ts),DX=[0,1,0,-1][d],DY=[-1,0,1,0][d];for(var k=1;k<=2;k++){var r=cm.r+DY*k,c=cm.c+DX*k;if(r<0||c<0||r>=N||c>=N||walls[key(r,c)])break;w[key(r,c)]=1}});return w};
  var reachable=function(){var vis={},st=[start];vis[key(start[0],start[1])]=1;while(st.length){var p=st.pop();if(p[0]===goal[0]&&p[1]===goal[1])return true;[[0,1],[1,0],[0,-1],[-1,0]].forEach(function(d){var r=p[0]+d[0],c=p[1]+d[1];if(r<0||c<0||r>=N||c>=N||walls[key(r,c)]||vis[key(r,c)])return;vis[key(r,c)]=1;st.push([r,c])})}return false};
  var tries=0;do{gen();tries++}while(!reachable()&&tries<40);pl=start.slice();
  var draw=function(ts){g.fillStyle="#13306b";g.fillRect(0,0,280,280);var W2=watched(ts);
    for(var r=0;r<N;r++)for(var c=0;c<N;c++){var x=ox+c*cs,y=oy+r*cs;g.strokeStyle="rgba(255,255,255,.25)";g.lineWidth=1;g.strokeRect(x,y,cs,cs);if(walls[key(r,c)]){g.fillStyle="#e2e8f0";g.fillRect(x+1,y+1,cs-2,cs-2)}if(W2[key(r,c)]){g.fillStyle="rgba(255,59,59,.45)";g.fillRect(x+1,y+1,cs-2,cs-2)}}
    g.fillStyle="#39ff88";g.fillRect(ox+start[1]*cs+3,oy+start[0]*cs+3,cs-6,cs-6);g.fillStyle="#f2b705";g.fillRect(ox+goal[1]*cs+3,oy+goal[0]*cs+3,cs-6,cs-6);crownDraw(g,ox+goal[1]*cs+cs/2,oy+goal[0]*cs+cs/2,cs*.25,0);
    cams.forEach(function(cm){var d=camDir(cm,ts),x=ox+cm.c*cs+cs/2,y=oy+cm.r*cs+cs/2;g.save();g.translate(x,y);g.rotate(d*Math.PI/2);g.fillStyle="#111827";rr(g,-cs*.25,-cs*.15,cs*.5,cs*.3,3);g.fill();g.fillStyle="#ff3b3b";g.beginPath();g.arc(0,-cs*.1,cs*.08,0,7);g.fill();g.restore()});
    g.fillStyle="rgba(0,0,0,.25)";g.beginPath();g.ellipse(ox+pl[1]*cs+cs/2,oy+pl[0]*cs+cs*.85,cs*.3,cs*.1,0,0,7);g.fill();drawCrew(g,ox+pl[1]*cs+cs/2,oy+pl[0]*cs+cs*.85,cs*.09,G.av,0,"sneak");
    if(W2[key(pl[0],pl[1])]){seen=true;pl=start.slice();o.msg(T.bpSeen);sfx("alarm");buzz([80,40,80]);if(o.bad())return}
    mg.raf=requestAnimationFrame(draw)};mg.raf=requestAnimationFrame(draw);
  cv.onpointerdown=function(e){var p=o.at(e,cv),c=Math.floor((p[0]-ox)/cs),r=Math.floor((p[1]-oy)/cs);if(r<0||c<0||r>=N||c>=N||walls[key(r,c)])return;if(Math.abs(r-pl[0])+Math.abs(c-pl[1])!==1)return;pl=[r,c];moves++;tone(600+moves*10,.04,"triangle",.03);
    if(r===goal[0]&&c===goal[1]){o.msg(T.bpOk);o.good();if(!seen)o.flag("bp");o.done()}};
  o.msg(T.bpGo)},
/* 6 stroom eraf: kabels draaien (pipe-puzzel) */
wires:function(o){var N=o.hard?5:4,cv=o.canvas(280),g=cv.getContext("2d"),cs=240/N,ox=20,oy=20,r0=Math.floor(o.rng()*N),r1=Math.floor(o.rng()*N),grid=[],path=null;
  var DX=[0,1,0,-1],DY=[-1,0,1,0];
  var findPath=function(){var vis={},res=null,calls=0,go=function(r,c,acc){if(res||++calls>4000)return;if(c===N-1&&r===r1){res=acc.concat([[r,c]]);return}vis[r+","+c]=1;var ds=shuffle([0,1,2,3],o.rng);ds.forEach(function(d){var nr=r+DY[d],nc=c+DX[d];if(nr<0||nc<0||nr>=N||nc>=N||vis[nr+","+nc])return;go(nr,nc,acc.concat([[r,c]]))});vis[r+","+c]=0};go(r0,0,[]);return res};
  for(var tries=0;tries<20&&!path;tries++)path=findPath();
  if(!path){path=[];for(var c0=0;c0<N;c0++)path.push([r0,c0]);for(var rr2=r0;rr2!==r1;){rr2+=r1>r0?1:-1;path.push([rr2,N-1])}}
  for(var r=0;r<N;r++){grid.push([]);for(var c=0;c<N;c++)grid[r].push({t:o.rng()<.5?"s":"c",rot:Math.floor(o.rng()*4),onP:false})}
  path.forEach(function(p,k){var prev=k?path[k-1]:[p[0],-1],next=k<path.length-1?path[k+1]:[p[0],N],din=dirOf(p,prev),dout=dirOf(p,next),cell=grid[p[0]][p[1]];cell.onP=true;cell.t=(din+2)%4===dout?"s":"c";cell.rot=Math.floor(o.rng()*4)});
  function dirOf(a,b){if(b[0]<a[0])return 0;if(b[1]>a[1])return 1;if(b[0]>a[0])return 2;return 3}
  var opens=function(cell){var base=cell.t==="s"?[0,2]:[0,1];return base.map(function(d){return(d+cell.rot)%4})};
  var trace=function(){var r=r0,c=0,from=3,lit={},steps=0;while(steps++<N*N+2){if(r<0||c<0||r>=N||c>=N)return{ok:false,lit:lit};var op=opens(grid[r][c]);if(op.indexOf(from)<0)return{ok:false,lit:lit};lit[r+","+c]=1;var out=op[0]===from?op[1]:op[0];if(c===N-1&&r===r1&&out===1)return{ok:true,lit:lit};r+=DY[out];c+=DX[out];from=(out+2)%4}return{ok:false,lit:lit}};
  var draw=function(){var tr=trace();g.fillStyle="#0b1430";g.fillRect(0,0,280,280);for(var r=0;r<N;r++)for(var c=0;c<N;c++){var x=ox+c*cs,y=oy+r*cs,cell=grid[r][c],on=tr.lit[r+","+c];g.fillStyle="#1f2a44";rr(g,x+2,y+2,cs-4,cs-4,6);g.fill();
      g.strokeStyle=on?"#39ff88":"#64748b";g.lineWidth=cs*.16;g.lineCap="round";if(on){g.shadowColor="#39ff88";g.shadowBlur=10}var cx=x+cs/2,cy=y+cs/2;opens(cell).forEach(function(d){g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+DX[d]*cs/2,cy+DY[d]*cs/2);g.stroke()});g.shadowBlur=0;g.fillStyle=on?"#39ff88":"#64748b";g.beginPath();g.arc(cx,cy,cs*.1,0,7);g.fill()}
    g.fillStyle="#f2b705";g.beginPath();g.arc(10,oy+r0*cs+cs/2,9,0,7);g.fill();g.fillStyle="#111827";rr(g,262,oy+r1*cs+cs/2-14,16,28,3);g.fill();g.fillStyle=tr.ok?"#39ff88":"#ff3b3b";g.beginPath();g.arc(270,oy+r1*cs+cs/2,5,0,7);g.fill();
    mg.raf=requestAnimationFrame(draw)};mg.raf=requestAnimationFrame(draw);
  var guard=0;while(trace().ok&&guard++<10)grid[path[0][0]][path[0][1]].rot=(grid[path[0][0]][path[0][1]].rot+1)%4;
  o.msg(T.wiresGo);var moves=0;
  if(o.hard){var tm,onEnd=function(){if(o.bad())return;tm=o.timer(70,onEnd)};tm=o.timer(70,onEnd)}
  cv.onpointerdown=function(e){var p=o.at(e,cv),c=Math.floor((p[0]-ox)/cs),r=Math.floor((p[1]-oy)/cs);if(r<0||c<0||r>=N||c>=N)return;grid[r][c].rot=(grid[r][c].rot+1)%4;moves++;tone(500+r*60+c*40,.05,"triangle",.04);
    if(trace().ok){if(!cur.hinted)o.flag("wires");o.msg(T.wiresOk);o.good();mg.tm.push(setTimeout(o.done,500))}};
  o.hint(function(){var bad=path.filter(function(p,k){var prev=k?path[k-1]:[p[0],-1],next=k<path.length-1?path[k+1]:[p[0],N],a=dirOf(p,prev),b=dirOf(p,next),op=opens(grid[p[0]][p[1]]);return !(op.indexOf(a)>=0&&op.indexOf(b)>=0)})[0];
    if(!bad)return;var k=path.indexOf(bad),prev=k?path[k-1]:[bad[0],-1],next=k<path.length-1?path[k+1]:[bad[0],N],a=dirOf(bad,prev),b=dirOf(bad,next),cell=grid[bad[0]][bad[1]];for(var i=0;i<4;i++){var op=opens(cell);if(op.indexOf(a)>=0&&op.indexOf(b)>=0)break;cell.rot=(cell.rot+1)%4}
    if(trace().ok){o.good();mg.tm.push(setTimeout(o.done,500))}})},
/* 7 foto-agent: welke van de vier foto's is bewerkt? */
photo:function(o){var rounds=3,ri=0,fi,q=rngOf(o.rng()*1e9|0);
  var scene=function(g,v){museumBg(g,200,130,0,{crown:v!=="crown"});g.fillStyle="#2a3550";rr(g,20,70,30,32,3);g.fill();if(v!=="vase"){g.fillStyle="#3aa0ff";g.beginPath();g.ellipse(35,64,8,12,0,0,7);g.fill()}
    g.fillStyle=v==="door"?"#dc2626":"#1e3a8a";rr(g,150,50,30,52,3);g.fill();g.fillStyle="#f2b705";g.beginPath();g.arc(173,78,2,0,7);g.fill();
    g.fillStyle="#f2b705";g.font="700 14px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText(v==="sign"?"MUZEUM":"MUSEUM",100,22);
    if(v==="extra"){g.fillStyle="#39ff88";g.beginPath();g.arc(100,110,6,0,7);g.fill()}if(v==="hat")hatDraw(g,100,36,8,1);
    if(o.hard&&v!=="none"){g.fillStyle="rgba(0,0,0,.08)";g.fillRect(0,0,200,130)}};
  var paint=function(){var V=o.hard?["vase","door","sign","hat"]:["crown","door","extra","hat"],v=V[Math.floor(q()*V.length)];fi=Math.floor(q()*4);
    o.box.innerHTML='<div class="photos">'+[0,1,2,3].map(function(i){return '<button type="button" data-i="'+i+'"><canvas width="200" height="130"></canvas></button>'}).join("")+'</div>';
    $$("#pz .photos canvas").forEach(function(c,i){scene(c.getContext("2d"),i===fi?v:"none")});o.msg(fill(T.photoN,{r:ri+1,n:rounds}));
    o.box.querySelector(".photos").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(+b.dataset.i===fi){ri++;o.good();b.classList.add("yes");o.msg(T.photoYes);if(ri>=rounds){o.done();return}mg.tm.push(setTimeout(paint,600))}else{b.classList.add("shake");o.msg(T.photoNo);if(o.bad())return}}};
  paint();o.hint(function(){var b=$$("#pz .photos button")[fi];if(b)b.classList.add("hintme")})},
/* 8 stille tocht: muisstil zijn tot de meter vol is (microfoon), anders vinger stil houden */
silence:function(o){var cv=o.canvas(220),g=cv.getContext("2d"),need=o.hard?30:20,prog=0,mic=false,tracks=null,an=null,buf=null,touch=null,t0=performance.now(),resets=0,lastF=performance.now();
  var henk={x:-40};o.msg(T.silGo);
  var draw=function(ts){var dt=Math.min(.1,(ts-lastF)/1000);lastF=ts;nightBg(g,280,220,ts,{lamp:true});henk.x=-40+(prog/need)*360;drawPerson(g,henk.x,205,7,Object.assign({},PPL.henk,{bob:true}),ts);drawCrew(g,40,210,5,G.av,0,"hush");
    var vol=0;if(an){an.getByteTimeDomainData(buf);var s=0;for(var i=0;i<buf.length;i++){var v=(buf[i]-128)/128;s+=v*v}vol=Math.sqrt(s/buf.length)}
    var ok=mic?vol<(o.hard?.06:.09):!!touch;if(ok)prog+=dt;
    if(mic&&vol>=(o.hard?.06:.09)){resets++;prog=0;o.msg(T.silLoud);buzz(80);if(resets%2===0&&o.bad())return}
    g.fillStyle="rgba(6,11,28,.8)";rr(g,20,16,240,22,11);g.fill();g.fillStyle=ok?"#39ff88":"#ff3b3b";rr(g,23,19,Math.max(4,234*Math.min(1,prog/need)),16,8);g.fill();
    if(mic){g.fillStyle="#fff";g.font="700 11px 'Nunito',sans-serif";g.textAlign="left";g.fillText("🎤",24,52);g.fillStyle="rgba(255,255,255,.3)";g.fillRect(44,44,100,8);g.fillStyle=vol<.09?"#39ff88":"#ff3b3b";g.fillRect(44,44,Math.min(100,vol*600),8)}else{g.fillStyle="#bfd3ff";g.font="700 12px 'Nunito',sans-serif";g.textAlign="center";g.fillText(T.silTouch,140,56)}
    if(prog>=need){o.msg(T.silOk);o.good();if(!resets)o.flag("silence");end();o.done();return}mg.raf=requestAnimationFrame(draw)};mg.raf=requestAnimationFrame(draw);
  var end=function(){if(tracks)tracks.forEach(function(t){t.stop()});tracks=null;an=null};mg.off=end;
  cv.onpointerdown=function(e){touch=o.at(e,cv);cv.setPointerCapture&&cv.setPointerCapture(e.pointerId)};cv.onpointermove=function(e){if(!touch||mic)return;var p=o.at(e,cv);if(Math.hypot(p[0]-touch[0],p[1]-touch[1])>14){touch=null;resets++;prog=0;o.msg(T.silMoved);buzz(80);if(resets%2===0)o.bad()}};cv.onpointerup=cv.onpointercancel=function(){if(!mic)touch=null};
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){var a=ac();if(!a){st.getTracks().forEach(function(t){t.stop()});return}tracks=st.getTracks();var src=a.createMediaStreamSource(st);an=a.createAnalyser();an.fftSize=512;src.connect(an);buf=new Uint8Array(an.fftSize);mic=true;prog=0}).catch(function(){})},
/* 9 vingerafdrukken wissen: veeg het glas schoon */
wipe:function(o){var cv=o.canvas(300),g=cv.getContext("2d"),mask=document.createElement("canvas");mask.width=280;mask.height=300;var mg2=mask.getContext("2d"),q=rngOf(o.rng()*1e9|0),N=o.hard?14:10,total=0;
  for(var i=0;i<N;i++){var x=30+q()*220,y=30+q()*240;mg2.save();mg2.translate(x,y);mg2.rotate(q()*6.28);mg2.strokeStyle="rgba(255,255,255,.75)";mg2.lineWidth=1.3;for(var r=4;r<18;r+=2.6){mg2.beginPath();mg2.ellipse(0,0,r*.75,r,0,0,5.5);mg2.stroke()}mg2.restore()}
  var count=function(){try{var d=mg2.getImageData(0,0,280,300).data,n=0;for(var k=3;k<d.length;k+=16)if(d[k]>40)n++;return n}catch(e){return 0}};total=count()||1;
  var drawF=function(ts){museumBg(g,280,300,ts,{crown:true});g.fillStyle="rgba(186,230,253,.12)";g.fillRect(0,0,280,300);g.drawImage(mask,0,0)};
  var f=function(ts){drawF(ts);mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  var down=false,last=0,wipeAt=function(p){mg2.globalCompositeOperation="destination-out";mg2.beginPath();mg2.arc(p[0],p[1],20,0,7);mg2.fill();mg2.globalCompositeOperation="source-over"};
  var check=function(){var left=count(),pct=Math.round(100-left/total*100);o.msg(fill(T.wipeN,{p:Math.max(0,pct)}));if(pct>=96){o.msg(T.wipeOk);o.good();o.done()}};
  cv.onpointerdown=function(e){down=true;cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);wipeAt(o.at(e,cv))};cv.onpointermove=function(e){if(!down)return;wipeAt(o.at(e,cv));if(performance.now()-last>400){last=performance.now();check()}};cv.onpointerup=cv.onpointercancel=function(){down=false;check()};
  o.msg(fill(T.wipeN,{p:0}));if(o.hard){var tm,onEnd=function(){if(o.bad())return;tm=o.timer(45,onEnd)};tm=o.timer(45,onEnd)}},
/* 10 de juiste sleutel: welke past op het slot? */
keys:function(o){var rounds=3,ri=0,q=rngOf(o.rng()*1e9|0),first=true,ki;
  var keyDraw=function(g,bits,x,y,gold,mir){g.save();g.translate(x,y);if(mir)g.scale(-1,1);g.fillStyle=gold?"#f2b705":"#cbd5e1";g.beginPath();g.arc(-44,0,14,0,7);g.fill();g.fillStyle="#0b1430";g.beginPath();g.arc(-44,0,5,0,7);g.fill();g.fillStyle=gold?"#f2b705":"#cbd5e1";g.fillRect(-32,-4,74,8);bits.forEach(function(b,i){g.fillRect(-10+i*12,0,8,4+b*5)});g.restore()};
  var lockDraw=function(g,bits,x,y){g.fillStyle="#334155";rr(g,x-40,y-30,80,60,8);g.fill();g.fillStyle="#0b1430";rr(g,x-22,y-8,44,16,3);g.fill();g.fillStyle="#f2b705";bits.forEach(function(b,i){g.fillRect(x-20+i*12,y+8-(4+b*5),8,4+b*5)})};
  var paint=function(){var right=[0,1,2,3].map(function(){return Math.floor(q()*3)}),ks=[],n=o.hard?6:4;ki=Math.floor(q()*n);
    for(var i=0;i<n;i++){if(i===ki){ks.push(right);continue}var b;do{b=right.slice();var j=Math.floor(q()*4);b[j]=(b[j]+1+Math.floor(q()*2))%3;if(o.hard&&q()<.5){var j2=(j+1+Math.floor(q()*3))%4;b[j2]=(b[j2]+1)%3}}while(b.join()===right.join());ks.push(b)}
    o.box.innerHTML='<canvas class="lockc" width="280" height="90"></canvas><div class="keys c'+(n>4?3:2)+'">'+ks.map(function(k,i){return '<button type="button" data-i="'+i+'"><canvas width="130" height="50"></canvas></button>'}).join("")+'</div>';
    var lg=o.box.querySelector(".lockc").getContext("2d");lg.fillStyle="#0b1430";lg.fillRect(0,0,280,90);lockDraw(lg,right,140,45);
    $$("#pz .keys canvas").forEach(function(c,i){var gg=c.getContext("2d");gg.fillStyle="#13306b";gg.fillRect(0,0,130,50);keyDraw(gg,ks[i],65,22,i===ki&&false,o.hard&&i%2===1)});
    o.msg(fill(T.keyN,{r:ri+1,n:rounds}));
    o.box.querySelector(".keys").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(+b.dataset.i===ki){ri++;o.good();b.classList.add("yes");o.msg(T.keyYes);if(ri>=rounds){if(first)o.flag("keys");o.done();return}mg.tm.push(setTimeout(paint,600))}else{first=false;b.classList.add("shake");o.msg(T.keyNo);if(o.bad())return}}};
  paint();o.hint(function(){var b=$$("#pz .keys button")[ki];if(b)b.classList.add("hintme")})},
/* 11 alarmcode: de lampjes nadoen (steeds langer) */
alarm:function(o){var cv=o.canvas(280),g=cv.getContext("2d"),N=o.hard?7:5,seq=[],round=0,inp=[],lit=-1,busy=true,COLS=["#ff3b3b","#f2b705","#39ff88","#3aa0ff"];for(var i=0;i<N;i++)seq.push(Math.floor(o.rng()*4));
  var PX=[[80,100],[200,100],[80,200],[200,200]];
  var draw=function(ts){g.fillStyle="#1f2a44";g.fillRect(0,0,280,280);g.fillStyle="#334155";rr(g,20,20,240,240,16);g.fill();g.fillStyle="#0b1430";rr(g,40,30,200,34,6);g.fill();g.fillStyle="#ff3b3b";g.font="700 16px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText((busy?"● ":"▶ ")+fill(T.simonRound,{r:Math.min(N,round+1),n:N}),140,53);
    PX.forEach(function(p,i){var on=lit===i;g.fillStyle=on?"#fff":COLS[i];g.globalAlpha=on?1:.55;if(on){g.shadowColor=COLS[i];g.shadowBlur=24}g.beginPath();g.arc(p[0],p[1],38,0,7);g.fill();g.shadowBlur=0;g.globalAlpha=1});mg.raf=requestAnimationFrame(draw)};mg.raf=requestAnimationFrame(draw);
  var play=function(){busy=true;inp=[];o.msg(T.simonWatch);var k=0,step=function(){if(o.dead())return;if(k>round){lit=-1;busy=false;o.msg(T.simonGo);return}lit=seq[k];tone(392+seq[k]*110,.25,"square",.04);k++;mg.tm.push(setTimeout(function(){lit=-1;mg.tm.push(setTimeout(step,180))},o.hard?380:520))};mg.tm.push(setTimeout(step,600))};
  cv.onpointerdown=function(e){if(busy)return;var p=o.at(e,cv),i=(p[0]<140?0:1)+(p[1]<150?0:2);lit=i;tone(392+i*110,.2,"square",.04);mg.tm.push(setTimeout(function(){lit=-1},180));
    inp.push(i);var j=inp.length-1;if(inp[j]!==seq[j]){if(o.bad())return;play();return}if(inp.length===round+1){round++;if(round>=N){o.good();o.done()}else mg.tm.push(setTimeout(play,500))}};
  play()},
/* 12 uitkijkpost: tik de gouden auto van de Baron in het verkeer */
lookout:function(o){var cv=o.canvas(240),g=cv.getContext("2d"),rounds=3,ri=0,cars=[],q=rngOf(o.rng()*1e9|0),t0=0,fin=false;
  var mk=function(){cars=[];var n=(o.hard?7:5)+ri*2,gi=Math.floor(q()*n);for(var i=0;i<n;i++){var lane=i%3;cars.push({x:-80-q()*300,y:120+lane*36,sp:(60+q()*40)*(o.hard?1.5:1)*(1+ri*.2),lane:lane,gold:i===gi,s:7+lane*1.6})}};mk();
  o.msg(fill(T.lookN,{r:1,n:rounds}));
  var f=function(ts){if(fin)return;if(!t0)t0=ts;var dt=Math.min(.1,(ts-(f.l||ts))/1000);f.l=ts;nightBg(g,280,240,ts);g.fillStyle="#1f2a44";g.fillRect(0,100,280,110);g.strokeStyle="rgba(255,255,255,.25)";g.setLineDash([12,10]);g.beginPath();g.moveTo(0,138);g.lineTo(280,138);g.moveTo(0,174);g.lineTo(280,174);g.stroke();g.setLineDash([]);
    var all=true;cars.forEach(function(c){c.x+=c.sp*dt;if(c.x<300)all=false;carSide(g,c.x,c.y,c.s,c.gold,ts)});
    /* verrekijker */g.fillStyle="rgba(0,0,0,.65)";g.beginPath();g.rect(0,0,280,240);g.arc(95,120,78,0,7,true);g.fill();g.beginPath();g.rect(0,0,280,240);g.arc(185,120,78,0,7,true);g.fill();
    if(all){cars.forEach(function(c){c.x=-80-q()*300})}mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  cv.onpointerdown=function(e){var p=o.at(e,cv),hit=null;cars.forEach(function(c){if(Math.abs(p[0]-c.x)<c.s*1.8&&Math.abs(p[1]-(c.y-c.s*.7))<c.s*1.4)hit=c});if(!hit)return;
    if(hit.gold){ri++;o.good();o.msg(T.lookYes);if(ri>=rounds){fin=true;o.done();return}mk();mg.tm.push(setTimeout(function(){o.msg(fill(T.lookN,{r:ri+1,n:rounds}))},700))}else{o.msg(T.lookNo);if(o.bad())return}}}
};

/* ---------- het plan (speurboekje), stops, menu ---------- */
function noteSheet(){var ev=[],wt=[],ck=codeKnown();G.c.slots.forEach(function(s,i){if(!G.ph[i])return;
    if(s.e>=0){var e=G.c.ev[s.e];ev.push('<div class="clue"><canvas class="evc" data-k="'+e.k+'" data-v="'+e.v+'" width="80" height="80"></canvas><div><em>'+esc(D.AT[e.k].n)+'</em><p>'+esc(fill(e.t,{v:D.AT[e.k].v[e.v]}))+'</p></div></div>')}
    if(s.w>=0){var w=G.c.wits[s.w];wt.push('<div class="clue wit">'+AV(WITK[w.p])+'<div><em>'+esc(NAMEOF(WITK[w.p]))+'</em><p>'+esc(witText(w))+'</p></div></div>')}});
  var code='<div class="codes">'+ck.map(function(d,j){return '<span class="'+(d==null?"":"on")+'"><small>'+(j+1)+'</small><b>'+(d==null?"?":d)+'</b></span>'}).join("")+'</div>';
  var achs=Object.keys(G.ach).map(function(k){return '<i>🏆 '+esc(T.ach[k][0])+'</i>'}).join("");
  sheet('<h2>'+T.notebook+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+stageHTML(done())+(ev.length||wt.length||ck.some(function(d){return d!=null})?'<div class="eyebrow">'+T.nbS+'</div>'+code+'<div class="eyebrow">'+T.nbE+'</div><p class="note">'+esc(T.evT)+'</p><div class="list">'+(ev.join("")||'<p class="note">–</p>')+'</div><div class="eyebrow">'+T.nbW+'</div><p class="note">'+esc(T.witT)+'</p><div class="list">'+(wt.join("")||'<p class="note">–</p>')+'</div>':'<p class="note">'+T.nbNone+'</p>')+(achs?'<div class="eyebrow">'+T.nbAch+'</div><div class="tags">'+achs+'</div>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  MW.bindCodeBox($("#sheetBody"),L);paintStage(done());$$("#sheetBody .evc").forEach(function(cv){evDraw(cv.getContext("2d"),cv.dataset.k,+cv.dataset.v)});$("#shX").onclick=closeSheet}
function lvlSheet(){sheet('<h2>'+T.people+'</h2><p class="note">'+T.peopleT+'</p><div class="lvlist big">'+G.c.slots.map(function(s,i){return '<span class="'+(G.ph[i]?"on":"")+'"><b>'+(i+1)+'</b>'+esc(T.kinds[s.act])+'</span>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function menuSheet(){var onMap=G&&(G.mode==="map"||G.mode==="in");sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button><button type="button" class="btn ghost dk" id="mMus">'+(MUSIC?"🎵 "+T.musOn:"🎵 "+T.musOff)+'</button>'+(onMap?'<button type="button" class="btn ghost dk" id="mNoMap">'+T.kv.mNoMap+'</button>':'')+'<button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mMus"){MUSIC=!MUSIC;LS.set("ss_gk_music",MUSIC);$("#mMus").textContent=MUSIC?"🎵 "+T.musOn:"🎵 "+T.musOff;if(MUSIC)music(G&&G.fin===1?"esc":"map");else musicStop()}else if(i==="mNoMap"){closeSheet();dropMap()}else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- finale ---------- */
/* G.fin: 0 plan compleet, 1 alarm/ontsnapping bezig, 2 op het onderduikadres (welke kluis), 3 kluis gevonden (3D), 4 kroon gepakt (ontknoping), 5 klaar */
function finaleGate(){if(!G)return;if(done()<NN())return noteSheet();G.fin=G.fin||0;
  if(G.fin===0)return heistCine();
  if(G.fin===1){if(G.mode==="street")return escGame();return escSheet()}
  if(G.fin===2)return vaultPick();if(G.fin===3)return vaultRoom();if(G.fin===4)return reveal();
  finaleCine(function(){photoSheet("arrest",win)})}
/* de kraak: het museum, de nep-kroon, het alarm */
function heistCine(){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),w,h,dpr,t0=0,fin=false,raf=0;ov.hidden=false;hush();musicStop();music("vault");
  var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  var lines=T.heistCine,alarmed=false,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;if(G.fin===0){escStart()}if(G.mode==="street"){render();escGame()}else{music("esc");escSheet()}};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?12:t;g.setTransform(dpr,0,0,dpr,0,0);var li=Math.min(lines.length-1,Math.floor(ph/2.3));
    if(!sceneBg(g,"scene-heist",w,h))museumBg(g,w,h,ts,{crown:li<6,fake:li>=4,lasers:li<2,alarm:li>=6});else if(li>=6&&!still&&Math.floor(ts/180)%2){g.fillStyle="rgba(255,59,59,.3)";g.fillRect(0,0,w,h)}
    var s=Math.max(5,Math.min(w,h)*.022);drawCrew(g,w*.3,h*.8,s,G.av,ts,li>=6?"up":"sneak");drawPerson(g,w*.68,h*.8,s*1.05,Object.assign({},PPL.opa,{pose:li>=3?"point":"idle",bob:li>=6}),ts);
    if(li===5){g.save();g.translate(w/2,h*.42);g.rotate(-.08);g.fillStyle="#fffbea";g.fillRect(-w*.22,-h*.09,w*.44,h*.18);g.fillStyle="#1e1b4b";g.font="700 "+Math.round(Math.min(22,w*.05))+"px 'Permanent Marker',cursive";g.textAlign="center";g.fillText("– B.",w*.12,h*.06);g.restore()}
    if(li>=6){g.fillStyle="#ff3b3b";g.shadowColor="#ff3b3b";g.shadowBlur=24;g.font="700 "+Math.round(Math.min(60,w*.14))+"px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText("ALARM",w/2,h*.25);g.shadowBlur=0;if(!alarmed){alarmed=true;sfx("alarm");buzz([200,100,200,100,200])}}
    txt.textContent=lines[li];if(li!==spoken&&!still){spoken=li;say(lines[li])}
    if(ph>lines.length*2.3+1&&!still)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);if(still)setTimeout(end,5000)}

/* ---------- de ontsnapping (op de kaart) ---------- */
var CARS=[],FRZ=null,FRZEL=null;
function escLeft(){return G&&G.esc?Math.max(0,G.esc.secs-(Date.now()-G.esc.t0)/1000):0}
function nodes(){var out=[];W.forEach(function(w){if(typeof w.w!=="number"||w.w>4)return;for(var i=0;i<w.p.length;i+=2)out.push([w.p[i],w.p[i+1]])});return out}
function hidePos(r){if(G.virt){var f=FP[12];return{x:Math.round((f.x-START.x)*VSC),y:Math.round((f.y-START.y)*VSC)}}
  var lo=hard()?330:230,hi=hard()?480:380,nd=nodes().filter(function(n){var d=Math.hypot(n[0]-P.x,n[1]-P.y);return d>=lo&&d<=hi&&Math.hypot(n[0],n[1])<R0*1.3});
  if(nd.length){nd.sort(function(a,b){return Math.hypot(b[0],b[1])-Math.hypot(a[0],a[1])});var pick=nd[Math.floor(r()*Math.min(nd.length,8))];return{x:pick[0],y:pick[1]}}
  var a=r()*6.283,d=(lo+hi)/2;return{x:Math.round(P.x+Math.cos(a)*d),y:Math.round(P.y+Math.sin(a)*d)}}
function escStart(){G.fin=1;var r=rngOf(G.seed^0x5bd1e995);G.esc={t0:Date.now(),secs:G.c.esc.secs,cars:G.c.esc.cars,h:3,caught:0,spotted:0,heliNext:Date.now()+40000+r()*30000,blocks:[],seed:G.seed^0x5bd1e995};
  if(G.st){var hp=hidePos(r);G.st.push({x:hp.x,y:hp.y,type:"hoek",name:T.escSpot,fi:NN(),fk:12,done:false,hide:true});
    /* wegversperringen tussen hier en het onderduikadres */var nb=hard()?3:2,nd=nodes(),ax=P.x,ay=P.y,bx=hp.x,by=hp.y,L2=Math.hypot(bx-ax,by-ay)||1;
    var cand=nd.filter(function(n){var t=((n[0]-ax)*(bx-ax)+(n[1]-ay)*(by-ay))/(L2*L2);if(t<.25||t>.75)return false;var px=ax+(bx-ax)*t,py=ay+(by-ay)*t;return Math.hypot(n[0]-px,n[1]-py)<70});
    cand=shuffle(cand,r);for(var i=0;i<nb;i++){if(cand[i])G.esc.blocks.push({x:cand[i][0],y:cand[i][1],warn:0});else{var t=.35+i*.2;G.esc.blocks.push({x:Math.round(ax+(bx-ax)*t+(r()-.5)*60),y:Math.round(ay+(by-ay)*t+(r()-.5)*60),warn:0})}}}
  save();escResume()}
function escResume(){if(!G||!G.esc||G.mode==="street")return;var hp=hideSpot();if(!hp)return;CARS=[];var r=rngOf(G.esc.seed+G.esc.cars),ways=W.filter(function(w){return typeof w.w==="number"&&w.w>=2&&w.p.length>=6&&w.p.some(function(v,i){return i%2===0&&Math.hypot(w.p[i]-hp.x,w.p[i+1]-hp.y)<380})});
  for(var i=0;i<G.esc.cars;i++){var pts=[];if(ways.length){var w=ways[Math.floor(r()*ways.length)];for(var k=0;k<w.p.length;k+=2)pts.push({x:w.p[k],y:w.p[k+1]})}
    else{var cx=(hp.x+P.x)/2,cy=(hp.y+P.y)/2,R=120+r()*140;for(k=0;k<8;k++){var a=k/8*6.283;pts.push({x:cx+Math.cos(a)*R,y:cy+Math.sin(a)*R})}}
    var pi=Math.floor(r()*pts.length),s=pts[pi];CARS.push({x:s.x,y:s.y,a:0,pts:pts,pi:(pi+1)%pts.length,dir:1,cool:Date.now()+8000+i*4000,ph:r()*6})}
  music("esc")}
function escStep(dt,t){if(!CARS.length)return;var sp=(hard()?4.2:3)*(G.mode==="demo"?10:1);
  CARS.forEach(function(c){var tg=c.pts[c.pi],d=Math.hypot(tg.x-c.x,tg.y-c.y);if(d<2){c.pi+=c.dir;if(c.pi>=c.pts.length||c.pi<0){c.dir*=-1;c.pi+=2*c.dir;c.pi=Math.max(0,Math.min(c.pts.length-1,c.pi))}return}var mv=Math.min(d,sp*dt);c.x+=(tg.x-c.x)/d*mv;c.y+=(tg.y-c.y)/d*mv;c.a=Math.atan2(tg.y-c.y,tg.x-c.x)})}
function coneOf(c,t){return{a:c.a+Math.sin((t||0)/1300+c.ph)*.7,len:hard()?75:55,half:.6}}
function inCone(c,t){var k=coneOf(c,t),dx=P.x-c.x,dy=P.y-c.y,d=Math.hypot(dx,dy);if(d>k.len||d<1)return false;var da=Math.atan2(dy,dx)-k.a;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;return Math.abs(da)<k.half}
function escTick(){if(!G||!G.esc||G.fin!==1)return;var now=Date.now(),busy=!$("#sheet").hidden||(MW.Crew&&MW.Crew.busy());
  if(FRZ){if(G.mode==="map"&&!G.virt&&Math.hypot(P.x-FRZ.p0.x,P.y-FRZ.p0.y)>8)return endFreeze(false);if((now-FRZ.t0)/1000>=FRZ.secs)return endFreeze(true);var left=Math.ceil(FRZ.secs-(now-FRZ.t0)/1000),c=$("#frzN");if(c)c.textContent=left;return}
  if(busy)return;
  var tt=performance.now();for(var i=0;i<CARS.length;i++){var c=CARS[i];if(now>c.cool&&inCone(c,tt)){startFreeze(c);return}}
  G.esc.blocks.forEach(function(b){if(Math.hypot(b.x-P.x,b.y-P.y)<28&&now>b.warn){b.warn=now+30000;toast(T.escBlock);say(T.escBlock);buzz([60,40,60])}});
  if(now>G.esc.heliNext){G.esc.heliNext=now+60000+Math.random()*40000;save();sfx("heli");buzz([100,60,100,60,100]);say(T.escHeliT);MW.Crew.hijack({head:T.escHeli,who:"",line:T.escHeliT,secs:8,say:false});return}
  if(escLeft()<=0){G.esc.t0=now;G.esc.secs=180;G.esc.caught++;if(G.esc.cars<4){G.esc.cars++;escResume()}save();toast(T.escTimeUp);say(T.escTimeUp);sfx("siren")}}
function frzEl(){if(!FRZEL){FRZEL=document.createElement("div");FRZEL.id="frz";document.body.appendChild(FRZEL)}return FRZEL}
function startFreeze(c){FRZ={car:c,t0:Date.now(),p0:{x:P.x,y:P.y},secs:hard()?7:5};G.esc.spotted++;save();var el=frzEl();el.innerHTML='<div class="frzBox"><div class="frzEb">🚔</div><b>'+esc(T.escFreeze)+'</b><div class="frzN" id="frzN">'+FRZ.secs+'</div><p>'+esc(T.escFreezeT)+'</p></div>';el.hidden=false;sfx("siren");buzz([300,100,300]);say(T.escFreeze+" "+T.escFreezeT)}
function endFreeze(ok){if(!FRZ)return;var c=FRZ.car;FRZ=null;if(FRZEL)FRZEL.hidden=true;c.cool=Date.now()+20000;c.dir*=-1;
  if(ok===true){toast(T.escFreezeOk);say(T.escFreezeOk);sfx("coin")}else if(ok===false){G.esc.h--;save();sfx("hurt");buzz(200);toast(T.escMoved);say(T.escMoved);
    if(G.esc.h<=0){G.esc.h=3;G.esc.caught++;save();MW.Crew.hijack({head:T.escCaughtH,who:NAMEOF("stella"),line:T.escCaught,secs:10,say:false});say(T.escCaught)}}}
function escSheet(){var sp=hideSpot();sheet('<div class="eyebrow">'+esc(T.escH)+'</div><h2 class="big">'+esc(T.escH)+'</h2><canvas id="bC" class="endscene" width="320" height="200"></canvas>'+bubble(T.escIntro,NAMEOF("opa"),"big")+'<div class="tags"><i>⏱ '+mmss(escLeft()*1000)+'</i><i>🚔 '+G.esc.cars+'</i><i>❤ '+G.esc.h+'</i></div><button type="button" class="btn red" id="bGo2">'+esc(T.escGo)+'</button>',true);
  var cv=$("#bC"),g=cv.getContext("2d");(function f(ts){if(!cv.isConnected)return;nightBg(g,320,200,ts,{siren:true});carTop(g,80+((ts/12)%400)-40,150,0,16,true,ts);drawCrew(g,250,185,7,G.av,ts,"sneak");if(!still)requestAnimationFrame(f)})(0);say(T.escIntro);
  $("#bGo2").onclick=function(){closeSheet();if(sp){sel=sp;chip()}}}
function escItems(it){var tt=performance.now();CARS.forEach(function(c){it.push({x:c.x,y:c.y,tap:false,draw:function(cx,X,Y,t,api){var k=coneOf(c,tt),len=k.len*api.V.s;cx.save();cx.translate(X,Y);cx.rotate(k.a);cx.fillStyle="rgba(255,255,255,.14)";cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,len,-k.half,k.half);cx.closePath();cx.fill();cx.restore();carTop(cx,X,Y,c.a,Math.max(9,2.2*api.V.s),true,t)}})});
  G.esc.blocks.forEach(function(b){it.push({x:b.x,y:b.y,tap:false,draw:function(cx,X,Y,t,api){blockDraw(cx,X,Y,Math.max(10,5*api.V.s))}})})}
function blockDraw(g,x,y,s){g.save();g.translate(x,y);g.fillStyle="#f8fafc";rr(g,-s*2,-s*.5,s*4,s,s*.2);g.fill();g.fillStyle="#ff3b3b";for(var i=0;i<4;i++)g.fillRect(-s*2+i*s,-s*.5,s*.5,s);g.fillStyle="#475569";g.fillRect(-s*1.7,s*.5,s*.3,s*.6);g.fillRect(s*1.4,s*.5,s*.3,s*.6);g.restore()}
function escDrawKids(g,t,to,sc){if(!G||G.fin!==1||!G.esc)return;var tt=performance.now();CARS.forEach(function(c){var p=to({x:c.x,y:c.y}),k=coneOf(c,tt);g.save();g.translate(p.x,p.y);g.rotate(k.a);g.fillStyle="rgba(255,255,255,.16)";g.beginPath();g.moveTo(0,0);g.arc(0,0,k.len*sc,-k.half,k.half);g.closePath();g.fill();g.restore();carTop(g,p.x,p.y,c.a,Math.max(12,2.2*sc),true,t)});
  G.esc.blocks.forEach(function(b){var p=to(b);blockDraw(g,p.x,p.y,Math.max(10,5*sc))})}
function hideoutArrive(spot){if(G.fin!==1)return finaleGate();spot.done=true;spot.doneAt=Date.now();G.force=null;endFreeze();G.fin=2;if(!G.esc.spotted&&!G.esc.caught)ach("ghost");G.escS={spotted:G.esc.spotted,caught:G.esc.caught};save();musicStop();music("vault");sel=null;chip();buzz([60,40,60,40,200]);sfx("clear");
  sheet('<div class="eyebrow">'+esc(T.escIn)+'</div><h2 class="big">'+esc(T.escInT)+'</h2><canvas id="bC" class="endscene" width="320" height="200"></canvas>'+bubble(D.OPA.escIn,NAMEOF("opa"),"big")+'<button type="button" class="btn" id="bGo2">'+esc(T.goOn)+'</button>',true);
  var cv=$("#bC"),g=cv.getContext("2d");(function f(ts){if(!cv.isConnected)return;nightBg(g,320,200,ts,{lamp:true});landmark(g,"garage",160,186,70);drawPerson(g,70,190,7,Object.assign({},PPL.opa,{pose:"wave"}),ts);drawCrew(g,250,190,6.5,G.av,ts,"up");if(!still)requestAnimationFrame(f)})(0);say(T.escInT+" "+D.OPA.escIn);
  $("#bGo2").onclick=function(){closeSheet();vaultPick()}}
/* zonder kaart: ontsnap door de straten op het scherm (kantelen of slepen) */
function escGame(){if(!G.esc){G.esc={t0:Date.now(),secs:0,cars:hard()?4:3,h:3,caught:0,spotted:0,blocks:[]}}
  var ov=$("#hide");ov.hidden=false;ov.className="esc";$("#room").hidden=true;var cv=$("#bossC");if(!cv){cv=document.createElement("canvas");cv.id="bossC";ov.insertBefore(cv,$("#room"))}cv.hidden=false;music("esc");
  var g=cv.getContext("2d"),w,h,dpr,fin=false,px0=.5,py0=.92,tilt={x:0,y:0},drag=null,cars=[],t0=0,q=rngOf(G.seed+77),hearts=G.esc.h,last=0,spotted=0;
  var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  $("#hideHint").textContent=T.escGameT;$("#hideMsg").textContent="";say(T.escGame+". "+T.escGameT);
  var nC=G.esc.cars;for(var i=0;i<nC;i++)cars.push({y:.26+i*(.56/nC),x:q(),dir:q()<.5?1:-1,sp:(.12+q()*.08)*(hard()?1.4:1),ph:q()*6});
  var onO=function(e){if(e.gamma!=null)tilt.x=Math.max(-1,Math.min(1,e.gamma/25));if(e.beta!=null)tilt.y=Math.max(-1,Math.min(1,(e.beta-40)/25))};
  try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")DeviceOrientationEvent.requestPermission().then(function(r){if(r==="granted")addEventListener("deviceorientation",onO)}).catch(function(){});else addEventListener("deviceorientation",onO)}catch(e){}
  cv.onpointerdown=function(e){drag={x:e.clientX,y:e.clientY,px:px0,py:py0}};cv.onpointermove=function(e){if(drag){px0=Math.max(.04,Math.min(.96,drag.px+(e.clientX-drag.x)/w));py0=Math.max(.1,Math.min(.95,drag.py+(e.clientY-drag.y)/h))}};cv.onpointerup=cv.onpointercancel=function(){drag=null};
  var end=function(){fin=true;removeEventListener("deviceorientation",onO);cv.onpointerdown=null};
  var f=function(ts){if(fin)return;if(!t0)t0=ts;var dt=Math.min(.1,(ts-last)/1000)||0;last=ts;if(!drag){px0=Math.max(.04,Math.min(.96,px0+tilt.x*.5*dt));py0=Math.max(.1,Math.min(.95,py0+tilt.y*.5*dt))}
    g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle="#0b1430";g.fillRect(0,0,w,h);
    /* straten */g.fillStyle="#1e2a55";for(i=0;i<nC;i++)g.fillRect(0,cars[i].y*h-h*.05,w,h*.1);[.2,.5,.8].forEach(function(x){g.fillRect(x*w-w*.05,0,w*.1,h)});g.fillStyle="#2c3f7a";for(i=0;i<nC;i++)for(var k=0;k<10;k++)g.fillRect(k*w/10+w*.02,cars[i].y*h-1,w*.05,2);
    /* huizenblokken */g.fillStyle="#111a36";for(var r2=0;r2<=nC;r2++)for(var c2=0;c2<4;c2++){var yA=r2===0?.16:cars[r2-1].y+.05,yB=r2===nC?.86:cars[r2].y-.05,xA=c2===0?.02:[.2,.5,.8][c2-1]+.05,xB=c2===3?.98:[.2,.5,.8][c2]-.05;if(yB>yA+.02&&xB>xA+.02){g.fillRect(xA*w+4,yA*h+4,(xB-xA)*w-8,(yB-yA)*h-8);g.fillStyle="rgba(253,230,138,.2)";g.fillRect(xA*w+12,yA*h+12,8,10);g.fillStyle="#111a36"}}
    /* garage */g.fillStyle="rgba(57,255,136,.15)";g.fillRect(w*.3,h*.09,w*.4,h*.07);landmark(g,"garage",w*.5,h*.15,Math.min(w,h)*.06);
    var hit=false;cars.forEach(function(c){c.x+=c.dir*c.sp*dt;if(c.x>1.05||c.x<-.05)c.dir*=-1;var X=c.x*w,Y=c.y*h,a=c.dir>0?0:Math.PI,ca=a+Math.sin(ts/1200+c.ph)*.6,len=w*(hard()?.3:.24);
      g.save();g.translate(X,Y);g.rotate(ca);g.fillStyle="rgba(255,255,255,.16)";g.beginPath();g.moveTo(0,0);g.arc(0,0,len,-.55,.55);g.closePath();g.fill();g.restore();carTop(g,X,Y,a,Math.max(8,w*.025),true,ts);
      var dx=px0*w-X,dy=py0*h-Y,d=Math.hypot(dx,dy);if(d<len&&d>1){var da=Math.atan2(dy,dx)-ca;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;if(Math.abs(da)<.55)hit=true}});
    drawCrew(g,px0*w,py0*h+10,Math.max(3.5,w*.011),G.av,ts,"sneak");
    for(i=0;i<3;i++){g.fillStyle=i<hearts?"#ff3b3b":"#334155";g.beginPath();g.arc(30+i*28,h*.14,9,0,7);g.fill()}
    if(hit&&ts-(f.hitT||0)>1500){f.hitT=ts;spotted++;hearts--;sfx("siren");buzz([200,80,200]);$("#hideMsg").textContent=T.escGameHit;px0=.5;py0=.92;if(hearts<=0){hearts=3;G.esc.caught++;save()}}
    if(ts-(f.hitT||0)<250){g.fillStyle="rgba(255,59,59,.3)";g.fillRect(0,0,w,h)}
    if(py0<.13&&px0>.3&&px0<.7){end();G.esc.spotted+=spotted;G.esc.h=hearts;G.fin=2;if(!G.esc.spotted&&!G.esc.caught)ach("ghost");G.escS={spotted:G.esc.spotted,caught:G.esc.caught};save();sfx("clear");buzz([60,40,60,40,200]);$("#hideMsg").textContent=T.escGameOk;say(T.escGameOk);setTimeout(function(){musicStop();$("#hide").hidden=true;render();vaultPick()},1600);return}
    requestAnimationFrame(f)};requestAnimationFrame(f);
  $("#hideX").onclick=function(){end();musicStop();$("#hide").hidden=true;hush();back()}}
function back(){if(G.mode==="map"||G.mode==="demo"||G.mode==="in")chip();else render()}
/* welke schuilkluis? vijf plekken, drie kenmerken */
function vaultPick(){var c=G.c,fin=false;musicStop();music("vault");
  sheet('<div class="eyebrow">'+esc(T.vaultH)+'</div><h2>'+esc(T.vaultH)+'</h2>'+bubble(D.OPA.pick,NAMEOF("opa"),"small")+'<p class="note">'+esc(T.vaultT)+'</p><div class="who five">'+c.sus.map(function(s,i){return '<button type="button" data-s="'+i+'"><canvas width="200" height="130"></canvas><b>'+esc(c.vn[i])+'</b><div class="tags">'+ATK.map(function(k){return '<i>'+esc(D.AT[k].s[s[k]])+'</i>'}).join("")+'</div></button>'}).join("")+'</div><p class="pzst" id="whoM"></p><button type="button" class="btn ghost dk" id="shX">'+T.notebook+'</button>',true);
  $$("#sheetBody .who canvas").forEach(function(cv,i){vaultScene(cv.getContext("2d"),200,130,c.sus[i],0)});say(D.OPA.pick+" "+T.vaultT);
  $("#shX").onclick=function(){noteSheet();$("#shX").onclick=function(){closeSheet();vaultPick()}};
  $("#sheetBody .who").onclick=function(e){var b=e.target.closest("button");if(!b||fin)return;G.tries++;save();if(+b.dataset.s===c.K){fin=true;b.classList.add("yes");sfx("win");buzz([100,50,300]);$("#whoM").textContent=T.vaultYes;say(T.vaultYes);G.fin=3;save();setTimeout(vaultRoom,1500)}else{b.classList.add("shake");setTimeout(function(){b.classList.remove("shake")},600);$("#whoM").textContent=T.vaultNo;say(T.vaultNo);sfx("siren");if(G.esc){G.esc.caught++;save()}}}}
/* de schuilkluis in 3D: toetsenbord vinden, code intikken, samen de deur opentrekken */
function vaultRoom(){Wk.closeSheet();var ov=$("#hide");ov.hidden=false;ov.className="vault";var cv=$("#bossC");if(cv)cv.hidden=true;var room=$("#room");room.hidden=false;music("vault");
  var st={ry:0,open:!!G.vk,unlocked:!!G.vk},size=Math.max(360,Math.min(innerWidth,900));
  $("#hideHint").textContent=T.roomT;$("#hideMsg").textContent=T.roomHint;say(D.OPA.room);
  room.innerHTML='<div class="cube" style="--s:'+size+'px"><div class="wall w0"><div class="vdoor" id="oDoor"><div class="wheel"></div><div class="bolts"></div></div><div class="crownIn" id="oCrown"><canvas width="160" height="120"></canvas></div></div><div class="wall w1"><div class="desk" id="oDesk"><div class="bp"></div><div class="lamp"></div></div></div><div class="wall w2"><button type="button" class="pad" id="oPad"><span class="scr" id="padScr">_ _ _ _</span><b>'+esc(T.roomPad)+'</b></button></div><div class="wall w3"><div class="portrait" id="oPort"><canvas width="140" height="180"></canvas></div></div></div>';
  var cube=room.firstChild,paint=function(){cube.style.setProperty("--ry",st.ry+"deg");room.classList.toggle("open",st.open);room.classList.toggle("unlocked",st.unlocked)};paint();
  var pc=cube.querySelector("#oPort canvas"),pg=pc.getContext("2d");pg.fillStyle="#1a1230";pg.fillRect(0,0,140,180);drawPerson(pg,70,172,8,Object.assign({},PPL.baron,{pose:"hold"}),0);
  var cc=cube.querySelector("#oCrown canvas"),cg=cc.getContext("2d");(function f(ts){if(!cc.isConnected)return;cg.clearRect(0,0,160,120);cg.fillStyle="#7a0b4a";rr(cg,30,80,100,22,6);cg.fill();crownDraw(cg,80,70,34,ts);if(!still)requestAnimationFrame(f)})(0);
  var drag=null;room.onpointerdown=function(e){drag={x:e.clientX,ry:st.ry}};room.onpointermove=function(e){if(!drag)return;st.ry=drag.ry+(e.clientX-drag.x)*.35;paint()};room.onpointerup=room.onpointercancel=function(e){if(drag&&Math.abs(e.clientX-drag.x)<6)tap(e.target);drag=null};
  var tap=function(el){var o=el.closest(".vdoor,.desk,.pad,.portrait,.crownIn");if(!o)return;var id=o.id;
    if(id==="oDesk"){$("#hideMsg").textContent=hard()?T.roomDeskX:T.roomDesk;say(hard()?T.roomDeskX:T.roomDesk);sfx("hit")}
    else if(id==="oPort"){$("#hideMsg").textContent=T.roomPort;say(T.roomPort);sfx("hit")}
    else if(id==="oPad"){if(st.unlocked){$("#hideMsg").textContent=T.roomDoorOpen;return}padSheet()}
    else if(id==="oDoor"){if(!st.unlocked){$("#hideMsg").textContent=T.roomDoor;say(T.roomDoor);sfx("bad")}else if(!st.open)pull()}
    else if(id==="oCrown"){if(st.open)takeCrown()}};
  var want=function(){var c=G.c.code.slice();if(hard())c.reverse();return c.join("")};
  var padSheet=function(){var v="";sheet('<div class="padbox"><div class="eyebrow">'+esc(T.roomPad)+'</div><div class="scr2"><p>'+esc(T.roomCode)+' <b id="pdV">_ _ _ _</b></p></div><div class="pad kb" id="kb">'+"1234567890".split("").map(function(c){return '<button type="button" class="key" data-d="'+c+'">'+c+'</button>'}).join("")+'<button type="button" class="key back" data-d="x">⌫</button><button type="button" class="key ok" data-d="ok">OK</button></div><button type="button" class="btn ghost dk sm" id="pdN">'+esc(T.notebook)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button></div>',true);
    var paintV=function(){var e=$("#pdV");if(e)e.textContent=[0,1,2,3].map(function(i){return v[i]||"_"}).join(" ")};$("#shX").onclick=closeSheet;$("#pdN").onclick=function(){noteSheet();$("#shX").onclick=function(){closeSheet();padSheet()}};
    $("#kb").onclick=function(e){var b=e.target.closest(".key");if(!b)return;var d=b.dataset.d;if(d==="x")v=v.slice(0,-1);else if(d==="ok"){if(v===want()){sfx("clear");buzz([60,40,60,40,200]);st.unlocked=true;G.vk=1;if(G.tries<=1)ach("vault");save();paint();$("#padScr").textContent=v.split("").join(" ");$(".scr2").innerHTML='<p class="ok">'+esc(T.roomOk)+'</p>';say(T.roomOk);setTimeout(function(){closeSheet();$("#hideMsg").textContent=T.roomDoorOpen;say(T.roomDoorOpen);pull()},1300)}else{G.tries++;save();sfx("bad");buzz(120);$(".scr2").classList.add("shake");setTimeout(function(){$(".scr2").classList.remove("shake")},500);toast(hard()&&v===G.c.code.join("")?T.roomBadX:T.roomBad);v=""}}else if(v.length<4){v+=d;tone(600+v.length*60,.05,"square",.04)}paintV()}};
  var pull=function(){MW.Crew.rally({title:T.pullH,text:T.pullT,goal:hard()?80:55,secs:20,icon:"🚪",iconDone:"👑",color:"#f2b705",okText:T.pullOk,failText:T.pullOk,say:false,then:function(){st.open=true;paint();sfx("boot");buzz([80,40,200]);$("#hideMsg").textContent=T.crownT;say(T.crownT);setTimeout(takeCrown,1800)}});say(T.pullH+". "+T.pullT)};
  var took=false,takeCrown=function(){if(took)return;took=true;G.fin=4;save();musicStop();$("#hide").hidden=true;reveal()};
  if(st.unlocked&&!st.open)setTimeout(pull,600);
  $("#hideX").onclick=function(){musicStop();$("#hide").hidden=true;hush();back()}}
/* de ontknoping: sirenes, Stella Blauw, de twist, de keuze (allebei goed) */
function reveal(){var c=G.c,lw=c.wits.filter(function(w){return w.lie})[0],lieT=lw?fill(c.ster?D.OPA.lieX:D.OPA.lie,{w:NAMEOF(WITK[lw.p]),v:D.AT[lw.k].g[lw.v]}):"";
  sheet('<div class="eyebrow">'+esc(T.revH)+'</div><h2 class="big">'+esc(T.revT)+'</h2><canvas id="endC" class="endscene" width="320" height="200"></canvas>'+bubble(D.OPA.twist1,NAMEOF("stella"),"big",AV("stella"))+bubble(D.OPA.twist2,NAMEOF("opa"),"",AV("opa"))+bubble(D.OPA.twist3,NAMEOF("stella"),"",AV("stella"))+(lieT?'<p class="note">'+esc(lieT)+'</p>':'')+'<h2>'+esc(T.choiceH)+'</h2><div class="row2 col"><button type="button" class="btn" id="eA">'+esc(T.choA)+'</button><button type="button" class="btn red" id="eB">'+esc(T.choB)+'</button></div>',true);
  sfx("siren");var cv=$("#endC"),g=cv.getContext("2d");(function f(ts){if(!cv.isConnected)return;nightBg(g,320,200,ts,{siren:true});drawPerson(g,60,190,7,PPL.stella,ts);drawPerson(g,130,190,7,Object.assign({},PPL.baron,{pose:"hold",prop:"cuffs",frown:true}),ts);drawPerson(g,205,190,7,Object.assign({},PPL.opa,{pose:"wave"}),ts);drawCrew(g,275,190,6.5,G.av,ts,"up");crownDraw(g,275,118,14,ts);if(!still)requestAnimationFrame(f)})(0);
  say(D.OPA.twist1+" "+D.OPA.twist2+" "+D.OPA.twist3+" "+lieT);
  var pick=function(k){G.end=k;ach("hero");G.fin=5;save();var t=k==="A"?D.OPA.choA:D.OPA.choB;sheet('<div class="eyebrow">'+esc(T.revH)+'</div>'+bubble(t,NAMEOF(k==="A"?"stella":"opa"),"big",AV(k==="A"?"stella":"opa"))+'<button type="button" class="btn" id="bPhoto">'+T.goOn+'</button>',true);say(t);$("#bPhoto").onclick=function(){closeSheet();finaleCine(function(){photoSheet("arrest",win)})}};
  $("#eA").onclick=function(){pick("A")};$("#eB").onclick=function(){pick("B")}}
function finaleCine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),w,h,dpr,t0=0,fin=false,raf=0;ov.hidden=false;ov.classList.add("fin");
  var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();sfx("win");
  var lines=T.finCine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;ov.classList.remove("fin");then()};$("#cineX").onclick=end;
  var q=rngOf(G.seed+3),fw=[];for(var i=0;i<14;i++)fw.push({x:.1+q()*.8,y:.1+q()*.35,t:q()*8,c:["#f2b705","#39ff88","#3aa0ff","#fff"][i%4]});
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?9:t;g.setTransform(dpr,0,0,dpr,0,0);if(!sceneBg(g,"scene-finale",w,h))nightBg(g,w,h,ts,{siren:ph<3});
    fw.forEach(function(p){var dt=(ph-p.t+8)%8;if(dt<0||dt>1.5||ph<3)return;for(var k=0;k<12;k++){var a=k/12*6.28;g.fillStyle=p.c;g.globalAlpha=1-dt/1.5;g.beginPath();g.arc(p.x*w+Math.cos(a)*dt*80,p.y*h+Math.sin(a)*dt*80+dt*dt*30,3,0,7);g.fill()}g.globalAlpha=1});
    var s=Math.max(5,Math.min(w,h)*.022);drawPerson(g,w*.14,h*.86,s,PPL.stella,ts);drawPerson(g,w*.32,h*.86,s,Object.assign({},PPL.baron,{pose:"hold",prop:"cuffs",frown:true}),ts);drawPerson(g,w*.52,h*.86,s,Object.assign({},PPL.opa,{pose:ph>3?"up":"wave",bob:ph>3}),ts);drawCrew(g,w*.72,h*.86,s*.95,G.av,ts,ph>3?"up":"idle");drawCrew(g,w*.88,h*.87,s*.9,{c:(G.av.c+1)%4,h:(G.av.h+3)%4},ts,ph>3?"up":"idle");
    if(ph>4){g.fillStyle="#7a0b4a";rr(g,w/2-s*8,h*.52,s*16,s*2.5,8);g.fill();crownDraw(g,w/2,h*.5,s*5,ts)}
    if(ph>2){var fs=Math.round(Math.min(48,w*.1));g.textAlign="center";g.fillStyle="#f2b705";g.shadowColor="#f2b705";g.shadowBlur=20;g.font="700 "+fs+"px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.fillText(T.found,w/2,h*.3);g.shadowBlur=0}
    if(ph>6){g.fillStyle="#fff";g.font="700 16px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.fillText((NAME?NAME.toUpperCase()+" & ":"")+T.crewW,w/2,h*.97)}
    var li=Math.min(lines.length-1,Math.floor(ph/2.2));txt.textContent=lines[li];if(li!==spoken&&!still){spoken=li;say(lines[li])}
    if(ph>11.5&&!still)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);if(still)setTimeout(end,4000)}

/* ---------- gewonnen: album, certificaat ---------- */
var RES=null,TEAM=LS.get("ss_gk_team",""),CLUB=LS.get("ss_gk_club","");
function win(){if(window.MMP&&MMP.hasTreasure()&&!G.trDone){G.trDone=1;G.tEnd=G.tEnd||Date.now();save();return MMP.finale(win)}G.tEnd=G.tEnd||Date.now();var c=G.c,min=(G.tEnd-G.t0)/60000,es=G.escS||{spotted:0,caught:0},s2=G.tries<=1,s3=(es.caught||0)===0&&(G.lost||0)<=NN(),stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:T.lvl[G.lvl||LEVEL]+" · "+T.lens[lenOf(NN())],code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.gk.day=MW.today();MW.profile.save(p)}Wk.stopWatch();buzz([100,50,100,50,300]);musicStop();
  var tm=window.MMP?MMP.team():{i:-1,name:"",col:null};
  RES={ph:G.ph.slice(),team:G.team,arrest:G.arrest,album:(G.album||[]).map(function(x){return x.u}),code:G.code,stars:stars,min:Math.round(min),secs:Math.round((G.tEnd-G.t0)/1000),v:vars(),seed:G.seed,n:NN(),lvl:G.lvl||LEVEL,tcol:tm.col,tname:tm.name,ach:Object.keys(G.ach),av:G.av,K:c.sus[c.K],xp:G.xp,tl:G.tl,coins:G.coins,codeS:G.c.code.join(" "),vn:c.vn[c.K]};
  sheet('<div class="eyebrow">'+T.won+' · '+esc(G.code)+'</div><div class="stars">'+starsHTML(stars)+'</div><h2>'+esc(T.found)+'</h2><canvas id="strip" width="1080" height="1350" class="stripc"></canvas><div class="tags"><i>'+Math.round(min)+' min</i><i>'+esc(rankName(G.tl))+'</i><i>'+G.xp+' '+T.xp+'</i><i>'+RES.ach.length+' 🏆</i></div>'+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+T.missed2+'</p>':'')+
    '<button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#strip");drawAlbum(cv,RES);$("#vDip").onclick=dipSheet;$("#vShare").onclick=function(){shareAlbum(cv)};$("#vDl").onclick=function(){dlCanvas(cv,albumName())};$("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP)MMP.result($("#sheetBody"),{code:G.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function starsHTML(n){var s="";for(var i=0;i<3;i++)s+='<span class="'+(i<n?"on":"")+'">★</span>';return s}
function loadImgs(list,cb){var IMG={},left=list.filter(Boolean).length;if(!left)return cb(IMG);list.filter(Boolean).forEach(function(src){if(IMG[src]!==undefined){if(--left===0)cb(IMG);return}IMG[src]=null;var im=new Image();im.onload=im.onerror=function(){IMG[src]=im.width?im:null;if(--left===0)cb(IMG)};im.src=src})}
function polaroid(g,im,x,y,pw,phh,cap2,rot,font,withCrown){var imgH=phh-pw*.34;g.save();g.translate(x+pw/2,y+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);g.shadowColor="rgba(0,0,0,.5)";g.shadowBlur=18;g.shadowOffsetY=8;g.fillStyle="#fff";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
  var pad=pw*.06,iw=pw-2*pad;if(im){var s=Math.max(iw/im.width,imgH/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();g.drawImage(im,pad+(iw-w)/2,pad+(imgH-h)/2,w,h);g.restore()}else{g.save();g.translate(pad,pad);g.beginPath();g.rect(0,0,iw,imgH);g.clip();nightBg(g,iw,imgH,0,{lamp:true});drawCrew(g,iw/2,imgH-10,imgH*.08,RES.av,0,"up");g.restore()}
  if(withCrown){g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();crownDraw(g,pad+iw*.85,pad+imgH*.2,iw*.08,0);g.restore()}
  g.fillStyle="#1e1b4b";g.font=font;g.textAlign="center";g.fillText(cap2,pw/2,phh-pw*.1,pw-20);g.restore()}
function albumName(){return (L==="nl"?"grote-kraak-album-":"big-heist-album-")+RES.code+".jpg"}
function dlCanvas(cv,name){try{cv.toBlob(function(b){if(!b)return;var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)},"image/jpeg",.88)}catch(e){toast(T.noFile)}}
function shareAlbum(cv){var txt=fill(T.shareTxt,{c:RES.code,s:"★".repeat(RES.stars),m:RES.min})+location.origin+location.pathname+"#z="+RES.code;cv.toBlob(function(b){var f=null;try{f=b&&new File([b],albumName(),{type:"image/jpeg"})}catch(e){}if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:txt}).catch(function(){})}else{dlCanvas(cv,albumName());toast(T.albumSaved)}},"image/jpeg",.88)}
function albumSheet(){if(!RES)return;sheet('<div class="eyebrow">'+esc(T.albumH)+'</div><canvas id="strip" width="1080" height="1350" class="stripc"></canvas><button type="button" class="btn" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button>',true);var cv=$("#strip");drawAlbum(cv,RES);$("#vShare").onclick=function(){shareAlbum(cv)};$("#vDl").onclick=function(){dlCanvas(cv,albumName())};$("#dBack").onclick=function(){closeSheet();winBack()}}
function drawAlbum(cv,r){var g=cv.getContext("2d"),W2=1080,pics=[{u:r.team,c:T.teamH}].concat((r.album||[]).map(function(u,i){return{u:u,c:T.poseH+" "+(i+1)}})).concat([{u:r.arrest,c:T.arrestH,ch:true}]),rows=Math.ceil(pics.length/2),PH=560,H=340+rows*PH+330;cv.width=W2;cv.height=H;
  loadImgs(pics.map(function(p){return p.u}),function(IMG){var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#060b1c");gr.addColorStop(.5,"#1a2b5e");gr.addColorStop(1,"#060b1c");g.fillStyle=gr;g.fillRect(0,0,W2,H);var q=rngOf(r.seed);for(var i=0;i<90;i++){g.fillStyle="rgba(255,255,255,"+(.2+q()*.5)+")";g.fillRect(q()*W2,q()*H,2,2)}
    /* blauwdruk-raster */g.strokeStyle="rgba(255,255,255,.06)";g.lineWidth=1;for(i=0;i<W2;i+=40){g.beginPath();g.moveTo(i,0);g.lineTo(i,H);g.stroke()}for(i=0;i<H;i+=40){g.beginPath();g.moveTo(0,i);g.lineTo(W2,i);g.stroke()}
    if(r.tcol){g.fillStyle=r.tcol;g.fillRect(0,40,W2,22);g.fillStyle="#fff";g.font="700 18px 'Nunito',sans-serif";g.textAlign="center";g.fillText(fill(T.albumTeam,{t:r.tname}).toUpperCase(),W2/2,58)}
    g.textAlign="center";g.fillStyle="#f2b705";g.shadowColor="#f2b705";g.shadowBlur=24;g.font="700 96px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";var ttl=r.v.J?fill(T.albumTitleJ,{J:r.v.J}):T.albumTitle;g.fillText(ttl,W2/2,150,W2-80);g.shadowBlur=0;
    g.fillStyle="#eaf0ff";g.font="600 28px 'Nunito',sans-serif";g.fillText(fill(T.albumSub,{c:r.code,m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars),l:T.lvl[r.lvl]||"",n:T.lens[lenOf(r.n)]||""}),W2/2,206,W2-60);
    g.fillStyle="#39ff88";g.font="700 26px 'Nunito',sans-serif";g.fillText(fill(T.albumFound,{tl:rankName(r.tl),xp:r.xp,co:r.coins,a:r.ach.length}),W2/2,250,W2-80);
    g.fillStyle="#fff";g.font="700 34px 'Permanent Marker',cursive";g.fillText(T.roomCode+" "+r.codeS+"  ·  "+r.vn,W2/2,302,W2-80);
    var pw=440,ph=PH-50;pics.forEach(function(p,i){var col=i%2,row=Math.floor(i/2),alone=i===pics.length-1&&pics.length%2===1,x=alone?(W2-pw)/2:col?W2-80-pw:80,y=330+row*PH+(col?18:0);polaroid(g,IMG[p.u],x,y,pw,ph,p.c,(i%2?.03:-.03)*(row%2?-1:1),"700 30px 'Permanent Marker',cursive",!!p.ch)});
    var sy=330+rows*PH+20;g.save();g.translate(W2/2-200,sy);drawPlan(g,400,220,11,11,0);g.restore();drawCrew(g,140,H-40,16,r.av,0,"up");drawPerson(g,W2-140,H-40,16,Object.assign({},PPL.opa,{pose:"wave"}),0);
    g.fillStyle="#eaf0ff";g.font="600 24px 'Nunito',sans-serif";g.fillText(T.stripSub,W2/2,H-34)})}
function endCase(){LS.del(GK);G=null;hush();home()}
function dipSheet(){if(!RES)return;sheet('<h2>'+T.dipH+'</h2><p>'+T.dipClubT+'</p><input class="inp team" id="dClub" autocomplete="off" maxlength="40" placeholder="'+esc(T.dipClubP)+'" value="'+esc(CLUB)+'"><p>'+T.dipT+'</p><input class="inp team" id="dTeam" autocomplete="off" maxlength="120" placeholder="'+esc(T.dipP)+'" value="'+esc(TEAM)+'"><button type="button" class="btn" id="dGo">'+T.dipGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){closeSheet();winBack()};$("#dGo").onclick=function(){TEAM=$("#dTeam").value.trim();CLUB=$("#dClub").value.trim().slice(0,40);LS.set("ss_gk_team",TEAM);LS.set("ss_gk_club",CLUB);dipShow()}}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div><h2>'+esc(T.found)+'</h2><button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vAlb">📷 '+T.albumBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  $("#vDip").onclick=dipSheet;$("#vAlb").onclick=albumSheet;$("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP&&RES.secs!=null)MMP.result($("#sheetBody"),{code:RES.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function dipShow(){var r=RES;sheet('<div class="eyebrow">'+esc(T.dipH)+'</div><canvas id="dip" width="1240" height="1754" class="stripc a4"></canvas><p class="note">'+esc(T.dipNote)+'</p><button type="button" class="btn" id="dPdf">'+T.dipPdf+'</button><button type="button" class="btn ghost dk" id="dImg">'+T.dipImg+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#dip"),fname=L==="nl"?"meesterdief-certificaat":"master-thief-certificate";drawDiploma(cv,r);
  $("#dPdf").onclick=function(){var jpg=cv.toDataURL("image/jpeg",.9),blob=pdfFromJpeg(jpg,cv.width,cv.height),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=fname+"-"+r.code+".pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)};
  $("#dImg").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],fname+"-"+r.code+".jpg",{type:"image/jpeg"});if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){})}else{var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.9);a.download=fname+"-"+r.code+".jpg";document.body.appendChild(a);a.click();a.remove()}},"image/jpeg",.9)};
  $("#dBack").onclick=function(){closeSheet();winBack()};$("#vHome").onclick=function(){closeSheet();endCase()}}
function names(g,team,y,W2,col){if(!team)return y;var list=team.split(/[,;]+/).map(function(s){return s.trim()}).filter(Boolean),line="",lines=[];g.font="700 38px 'Permanent Marker','Comic Sans MS',cursive";g.textAlign="center";
  list.forEach(function(nm){var t=line?line+"  ·  "+nm:nm;if(g.measureText(t).width>W2-300&&line){lines.push(line);line=nm}else line=t});if(line)lines.push(line);g.fillStyle=col;lines.slice(0,3).forEach(function(l){g.fillText(l,W2/2,y);y+=48});return y+10}
function badgeDraw(g,x,y,s){g.save();g.translate(x,y);g.fillStyle="#f2b705";g.shadowColor="rgba(0,0,0,.3)";g.shadowBlur=10;g.beginPath();for(var i=0;i<14;i++){var a=-Math.PI/2+i*Math.PI/7,r=i%2?s*.8:s;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.shadowBlur=0;g.fillStyle="#1d4ed8";g.beginPath();g.arc(0,0,s*.6,0,7);g.fill();g.fillStyle="#f2b705";g.beginPath();for(i=0;i<10;i++){a=-Math.PI/2+i*Math.PI/5;r=i%2?s*.2:s*.45;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.restore()}
/* het Meesterdief-certificaat: A4, dossierpapier met blauw/goud, polaroids, politie-erepenning en twee handtekeningen */
function drawDiploma(cv,r){var g=cv.getContext("2d"),W2=cv.width,H=cv.height,v=r.v,dateStr=new Date().toLocaleDateString(L==="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"});
  loadImgs([r.team,r.arrest],function(IMG){g.fillStyle="#f7f1e1";g.fillRect(0,0,W2,H);var q=rngOf(r.seed+9);g.fillStyle="rgba(26,43,94,.05)";for(var i=0;i<200;i++)g.fillRect(q()*W2,q()*H,3,3);
    /* kop */var hg=g.createLinearGradient(0,0,0,330);hg.addColorStop(0,"#0b1430");hg.addColorStop(1,"#1a2b5e");g.fillStyle=hg;g.fillRect(0,0,W2,330);g.strokeStyle="rgba(255,255,255,.08)";g.lineWidth=1;for(i=0;i<W2;i+=40){g.beginPath();g.moveTo(i,0);g.lineTo(i,330);g.stroke()}for(i=0;i<330;i+=40){g.beginPath();g.moveTo(0,i);g.lineTo(W2,i);g.stroke()}
    crownDraw(g,W2/2,88,46,0);
    g.textAlign="center";g.fillStyle="#f2b705";g.font="700 124px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.shadowColor="rgba(0,0,0,.35)";g.shadowBlur=12;g.fillText(T.dipTitle,W2/2,232);g.shadowBlur=0;g.font="700 34px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.fillStyle="#eaf0ff";g.fillText(T.dipSub,W2/2,290);
    /* gouden lijst */g.strokeStyle="#f2b705";g.lineWidth=6;g.strokeRect(50,350,W2-100,H-400);g.strokeStyle="#1a2b5e";g.lineWidth=2;g.strokeRect(64,364,W2-128,H-428);
    g.fillStyle="#1a2b5e";g.font="700 30px 'Nunito',sans-serif";g.fillText(v.J?fill(T.dipL2,{J:v.J}):T.dipL2b,W2/2,430,W2-200);
    var y=490;g.fillStyle="#1f2a44";g.font="500 32px 'Nunito',sans-serif";g.fillText(T.dipL1,W2/2,y,W2-200);y+=46;g.fillText(T.dipL3,W2/2,y,W2-200);y+=40;
    var nm=TEAM?TEAM.split(/[,;]+/).filter(function(s){return s.trim()}).length:0,extra=(CLUB?90:0)+(TEAM?60+Math.min(3,Math.ceil(nm/5))*48:0)+(r.tcol?30:0),pph=Math.max(200,Math.min(400,H-640-y-extra-80)),ppw=Math.round(pph*.825),gap=50,x0=(W2-2*ppw-gap)/2;polaroid(g,IMG[r.team],x0,y,ppw,pph,T.teamH,-.03,"700 26px 'Permanent Marker',cursive",false);polaroid(g,IMG[r.arrest],x0+ppw+gap,y+14,ppw,pph,T.arrestH,.03,"700 26px 'Permanent Marker',cursive",true);y+=pph+80;
    if(r.tcol){g.fillStyle=r.tcol;g.fillRect(100,y-40,W2-200,10);g.font="700 22px 'Nunito',sans-serif";g.fillText(fill(T.albumTeam,{t:r.tname}).toUpperCase(),W2/2,y-8);y+=30}
    if(CLUB){g.fillStyle="#1d4ed8";g.font="700 22px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.fillText(T.dipClub,W2/2,y);y+=50;g.fillStyle="#0b1430";g.font="700 50px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.fillText(CLUB,W2/2,y,W2-200);y+=40}
    if(TEAM){g.fillStyle="#1d4ed8";g.font="700 22px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.fillText(T.dipTeam,W2/2,y);y+=50;y=names(g,TEAM,y,W2,"#0b1430")}
    /* onderste strook: erepenning links, gegevens rechts */y=H-600;badgeDraw(g,220,y+110,90);g.fillStyle="#0b1430";g.font="700 26px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.fillText(T.dipBadge,220,y+240);g.fillStyle="#1d4ed8";g.font="italic 500 22px 'Nunito',sans-serif";g.fillText(T.dipBadgeT,220,y+272,320);
    g.textAlign="left";g.fillStyle="#1f2a44";g.font="700 26px 'Nunito',sans-serif";g.fillText(fill(T.dipL4,{tl:rankName(r.tl),xp:r.xp,co:r.coins}),420,y+60,W2-520);g.fillStyle="#6b7280";g.font="500 22px 'Nunito',sans-serif";g.fillText(fill(T.dipDate2,{d:dateStr,m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars),n:r.n,l:T.lens[lenOf(r.n)]||"",v:T.lvl[r.lvl]||""}),420,y+100,W2-520);
    g.fillStyle="#1f2a44";g.font="700 24px 'Permanent Marker',cursive";g.fillText(T.roomCode+" "+r.codeS+"  ·  "+r.vn,420,y+140,W2-520);
    if(r.ach.length){r.ach.slice(0,6).forEach(function(k,i){var bx=420+(i%2)*250,by=y+170+Math.floor(i/2)*52;g.fillStyle="rgba(26,43,94,.08)";rr(g,bx,by,240,42,10);g.fill();g.fillStyle="#1d4ed8";g.font="700 18px 'Nunito',sans-serif";g.textAlign="center";g.fillText("🏆 "+T.ach[k][0],bx+120,by+28,225);g.textAlign="left"})}
    /* stempel */g.save();g.translate(W2-250,H-300);g.rotate(-.14);g.strokeStyle="#ff3b3b";g.lineWidth=7;g.globalAlpha=.85;g.strokeRect(-140,-46,280,84);g.fillStyle="#ff3b3b";g.font="700 54px 'Bebas Neue','Oswald','Arial Narrow',sans-serif";g.textAlign="center";g.fillText(T.dipStamp,0,18);g.restore();
    /* handtekeningen */var sy=H-150;[[200,T.dipSignN,T.dipSign],[560,T.dipSign2N,T.dipSign2]].forEach(function(s){g.strokeStyle="#1a2b5e";g.lineWidth=2;g.beginPath();g.moveTo(s[0]-130,sy);g.lineTo(s[0]+130,sy);g.stroke();g.fillStyle="#1e1b4b";g.font="700 40px 'Permanent Marker',cursive";g.textAlign="center";g.fillText(s[1],s[0],sy-14);g.fillStyle="#6b7280";g.font="500 20px 'Nunito',sans-serif";g.fillText(s[2],s[0],sy+32)});
    g.fillStyle="#6b7280";g.font="500 20px 'Nunito',sans-serif";g.textAlign="center";g.fillText(fill(T.dipFoot,{c:r.code}),W2/2,H-70)})}
function pdfFromJpeg(dataURL,w,h){var b64=dataURL.split(",")[1],bin=atob(b64),n=bin.length,img=new Uint8Array(n);for(var i=0;i<n;i++)img[i]=bin.charCodeAt(i);
  var PW=595.28,PH=841.89,enc=function(s){var u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u},parts=[],off=[],pos=0,push=function(u){parts.push(u);pos+=u.length};
  push(enc("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"));var objs=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+PW+" "+PH+"] /Resources << /XObject << /Im1 5 0 R >> >> /Contents 4 0 R >>"];
  var content="q "+PW+" 0 0 "+PH+" 0 0 cm /Im1 Do Q";objs.push("<< /Length "+content.length+" >>\nstream\n"+content+"\nendstream");objs.forEach(function(o,i){off[i+1]=pos;push(enc((i+1)+" 0 obj\n"+o+"\nendobj\n"))});
  off[5]=pos;push(enc("5 0 obj\n<< /Type /XObject /Subtype /Image /Width "+w+" /Height "+h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+n+" >>\nstream\n"));push(img);push(enc("\nendstream\nendobj\n"));
  var x=pos,xref="xref\n0 6\n0000000000 65535 f \n";for(i=1;i<=5;i++)xref+=String(off[i]).padStart(10,"0")+" 00000 n \n";push(enc(xref+"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+x+"\n%%EOF\n"));return new Blob(parts,{type:"application/pdf"})}

/* ---------- zaakcode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();LEN=lenOf(p.n);LS.set("ss_gk_len",LEN);LEVEL=p.lvl;LS.set("ss_gk_level",LEVEL);begin(p.seed,p.mode,false,p.n)};$("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.gk,log=(g&&g.log)||[];sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min</small><div class="tags"><i>'+"★".repeat(x.st||0)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();KM.leave();stopSteps();endFreeze();G=null;hush();home()}
function wipeGame(){LS.del(GK);Wk.stopWatch();KM.leave();stopSteps();endFreeze();G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);MW.profile.wipe();if(/github\.io$/.test(location.hostname))LS.del(MW.pro.freeKey(ID));closeSheet();home();toast(T.wiped)})}}
function goBack(){if(!$("#hide").hidden){$("#hideX").click();return true}if(!$("#cine").hidden){$("#cineX").click();return true}
  if(!$("#sheet").hidden){if($("#sheet").dataset.lock){var x=$("#vHome")||$("#shX")||$("#bNext")||$("#pSkip")||$("#bPhoto")||$("#bGo2")||$("#eA");if(x)x.click()}else closeSheet();return true}
  if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({gk:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({gk:1},"")}catch(e){}}})}catch(e){}

/* ---------- startscherm: nachtelijke straat, zwaailicht in de verte, een verloren bivakmuts met een gouden glinstering ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),w,h,dpr=1;function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr}rs();addEventListener("resize",rs);
  var photo=$("#home").classList.contains("photo");
  function f(t){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);if($("#home").hidden){requestAnimationFrame(f);return}var sh=Math.min(h*.5,420);
    if(!photo){g.save();g.beginPath();g.rect(0,0,w,sh+60);g.clip();nightBg(g,w,sh+60,t,{lamp:true});
      /* zwaailicht in de verte */var on=Math.floor(t/400)%2;g.fillStyle=on?"rgba(58,160,255,.35)":"rgba(255,59,59,.35)";g.beginPath();g.arc(w*.18,sh*.78,6,0,7);g.fill();g.fillStyle=on?"rgba(58,160,255,.08)":"rgba(255,59,59,.08)";g.beginPath();g.arc(w*.18,sh*.78,40,0,7);g.fill();
      /* bivakmuts op de stoep */g.fillStyle="#111827";g.beginPath();g.ellipse(w*.6,sh*.95,34,16,.2,0,7);g.fill();g.fillStyle="#f1c27d";g.beginPath();g.ellipse(w*.6+6,sh*.95,12,5,.2,0,7);g.fill();sparkle(g,w*.6+28,sh*.92,5+Math.sin(t/300)*2,"#f2b705",t/400);sparkle(g,w*.6-30,sh*.9,3,"#f2b705",t/300+2);
      g.restore()}
    if(!photo){var gr=g.createLinearGradient(0,sh*.5,0,sh+80);gr.addColorStop(0,"rgba(6,11,28,0)");gr.addColorStop(1,"rgba(6,11,28,.98)");g.fillStyle=gr;g.fillRect(0,sh*.5,w,sh*.5+80)}
    if(!still)requestAnimationFrame(f)}requestAnimationFrame(f)}
hero();
if(/debug/.test(location.search))window.GK_TEST={G:function(){return G},P:function(){return P},parse:parseCode,make:makeCode,gen:genCase,task:function(i){var sp=G.st&&G.st.filter(function(x){return x.fi===i})[0];taskSheet(i,sp||null)},fin:function(n){G.fin=n||0;if(n===1&&!G.esc)escStart();finaleGate()},all:function(){G.c.slots.forEach(function(s,i){if(!G.ph[i]){G.ph[i]="x";if(G.st&&G.st[i])G.st[i].done=true}});save()},esc:function(){return{cars:CARS,frz:FRZ,esc:G&&G.esc}},PUZ:PUZ,draw:{person:drawPerson,plan:drawPlan,item:drawItem,vault:vaultScene}};
/* ---------- start ---------- */
var hz=/[#&]z=([A-Z0-9]+)/i.exec(location.hash);
if(window.MMP)MMP.init({id:ID,fin:{nl:'Opa Kluis fluistert: er is nog één verrassing. Een echte. Er ligt iets voor jullie verstopt, niet op het scherm.',en:'Grandpa Vault whispers: there is one more surprise. A real one. Something is hidden for you, not on the screen.'}});
home();if(hz){var pc=parseCode(hz[1]);if(pc)codeSheet(hz[1].toUpperCase())}
MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
})();
