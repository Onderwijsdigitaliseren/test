/* Glitch in de Buurt / Glitch in the Neighbourhood – kinderwandeling 8+ als videogame. Spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js, walk.js, kidsmap.js, party.js en GL_DATA (data-xx.js).
   De buurt is de game: elke plek een level met eigen spelmechaniek (vangen, springen, winkel, geheugen, sluipen, AR, geheimschrift, pixels, hacken, memory, ritme).
   Systemen: hartjes per level, XP + team-level, munten, power-ups, achievements, Startknop-kristal (voortgang), eigen pixel-avatar, Glitch die het scherm kaapt.
   Eindbaas in drie fases (ontwijken in pseudo-3D, teamaanval met microfoon, de Serverkamer als 3D-escape-room), dan de keuze Delete/Patch, album en diploma.
   Alles pixel-art in code (sprites) en chiptune via WebAudio; geen plaatjes nodig. Niveaus "normaal"/"hard". Standen "map","demo","street","in". */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.GL_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="gl",GK="ss_game_gl_"+L,WK="ss_ways_gl_"+L,hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle;
var toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz;function closeSheet(){mg.stop();hush();Wk.closeSheet()}
var G=null,tick=0,MODE=LS.get("ss_gl_mode","map"),NAME=LS.get("ss_gl_name",""),VOICE=LS.get("ss_gl_voice",true),LEVEL=LS.get("ss_gl_level","normaal"),LEN=LS.get("ss_gl_len","normaal"),MUSIC=LS.get("ss_gl_music",true);
var LENS={kort:5,normaal:8,lang:11};if(!LENS[LEN])LEN="normaal";
var ATK=["kleur","ogen","ant"],ACTS=["bugs","jump","shop","simon","stealth","ar","cipher","pixelfix","hack","pairs","rhythm"],EVPOS={5:[1,2,3],8:[1,3,5],11:[2,5,8]},POSE_AT={5:[3],8:[4],11:[4,8]},PUL=["time","shield","hint","xp2","coin2"];
function NN(){return (G&&G.n)||8}function lenOf(n){return n===5?"kort":n===11?"lang":"normaal"}function hard(){return LEVEL==="hard"}
var W=[],P={x:0,y:0,acc:0},R0=550,map=null,sel=null,arrived=null,lastT=0,cur=null,walkTo=null,photoFor=null,lastFix=0,GL={on:false,t0:0,x:0,y:0,dir:1,next:0};
var mg={raf:0,tm:[],iv:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[];this.iv.forEach(clearInterval);this.iv=[];if(this.off){this.off();this.off=null}}};
var C={pur:"#2b1055",navy:"#12163a",green:"#39ff88",cyan:"#22d3ee",pink:"#ff4fa3",yel:"#ffd23f",ink:"#0b0d22",white:"#f4f6ff",orange:"#f59e0b",blue:"#2563eb",red:"#ff3b3b"};
var GCOL=["#b794f6","#3ccfa8","#ffd23f"],AVC=["#39ff88","#22d3ee","#ff4fa3","#ffd23f"],still=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- hulpjes ---------- */
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function teamLvl(xp){return Math.min(10,1+Math.floor((xp||0)/150))}
if(window.MMVoice)MMVoice.init("glitch",L);
function say(t){if(!VOICE||!t)return;if(window.MMVoice)return MMVoice.say(t);try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(String(t).replace(/[“”"]/g,"").replace(/\{[^}]+\}/g,""));u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.95;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
function bubble(txt,who,cls,av){return '<div class="msg '+(cls||"")+'">'+(av||BITAV())+'<div class="bub"><button type="button" class="spk" aria-label="'+esc(T.listen)+'" data-say="'+esc(txt)+'">🔊</button>'+(who?'<em>'+esc(who)+'</em>':'')+'<p>'+esc(txt)+'</p></div></div>'}
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){var v=VOICE;VOICE=true;say(b.dataset.say);VOICE=v}});

/* ---------- chiptune: alles met WebAudio, geen bestanden ---------- */
var AC=null;function ac(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}return AC}
function tone(f,d,type,vol,when,slide){if(!Wk.sound())return;var a=ac();if(!a)return;try{var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(when||0);o.type=type||"square";o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(vol||.06,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
var SFX={coin:function(){tone(988,.08);tone(1319,.18,"square",.06,.07)},hurt:function(){tone(220,.25,"sawtooth",.08,0,110)},bad:function(){tone(180,.2,"square",.07)},jump:function(){tone(300,.15,"square",.05,0,700)},hit:function(){tone(660,.06,"square",.05)},
  clear:function(){[523,659,784,1047].forEach(function(f,i){tone(f,.16,"square",.06,i*.1)});tone(1319,.4,"square",.06,.42)},
  levelup:function(){[392,523,659,784,1047,1319].forEach(function(f,i){tone(f,.12,"triangle",.07,i*.08)})},
  boot:function(){tone(110,.3,"square",.05);tone(220,.3,"square",.05,.3);tone(440,.5,"square",.05,.6)},
  glitch:function(){for(var i=0;i<6;i++)tone(200+Math.random()*900,.05,"sawtooth",.05,i*.05)},
  boss:function(){tone(110,.5,"sawtooth",.09);tone(104,.5,"sawtooth",.09,.5);tone(98,.9,"sawtooth",.09,1)},
  win:function(){[523,659,784,1047,784,1047,1319,1568].forEach(function(f,i){tone(f,.14,"square",.06,i*.11)})}};
function sfx(k){if(SFX[k])SFX[k]()}
/* achtergrondmuziekje: 8-staps sequencer */
var MUS={on:false,iv:0,step:0,pat:null};
var PATS={map:{bpm:128,bass:[110,110,131,131,98,98,147,147],lead:[0,440,523,0,659,0,587,523]},boss:{bpm:150,bass:[82,82,78,82,73,73,78,82],lead:[0,330,0,311,0,294,330,0]}};
function music(name){musicStop();if(!MUSIC||!name||!Wk.sound())return;var a=ac();if(!a)return;MUS.on=true;MUS.pat=PATS[name];MUS.step=0;var dt=60/MUS.pat.bpm/2;
  MUS.iv=setInterval(function(){if(!Wk.sound()||!MUSIC)return;var p=MUS.pat,i=MUS.step%8;tone(p.bass[i],dt*.9,"triangle",.05);if(p.lead[i])tone(p.lead[i],dt*.6,"square",.025);MUS.step++},dt*1000)}
function musicStop(){clearInterval(MUS.iv);MUS.iv=0;MUS.on=false}

/* ---------- pixel-art: sprites in code ---------- */
function px(g,x,y,s,rows,pal,flip){g.save();g.translate(x,y);if(flip)g.scale(-1,1);var w=rows[0].length;for(var r=0;r<rows.length;r++)for(var c=0;c<w;c++){var ch=rows[r][c];if(ch==="."||!pal[ch])continue;g.fillStyle=pal[ch];g.fillRect((c-w/2)*s,(r-rows.length)*s,s+.3,s+.3)}g.restore()}
var SPR={
bit:["....BBBB....","...BBBBBBB..","...BBBBBBBB.","..OOOOOOO...","..OWOOOWO...","..OKOOOKO...","..OOWWWOO...","...OOOOO....","..BBBBBBB...","..BBBBBBB...","...OO.OO....","...OO.OO....","..KK...KK..."],
bit2:["....BBBB....","...BBBBBBB..","...BBBBBBBB.","..OOOOOOO...","..OWOOOWO...","..OKOOOKO...","..OOWWWOO...","...OOOOO....","..BBBBBBB...","..BBBBBBB...","..OO...OO...",".OO.....OO..","KK.......KK."],
glitch:["....CCCC....","..CCCCCCCC..",".CCCCCCCCCC.",".CCCCCCCCCC.","CCCCCCCCCCCC","CCCCCCCCCCCC",".CCCCCCCCCC.",".CCCCCCCCCC.","..CC.CC.CC..","...C..C..C.."],
kid:["....HHHH....","...HHHHHH...","...SSSSSS...","...SWSSWS...","...SSSSSS...","....SSSS....","..TTTTTTTT..","..TTTTTTTT..","...TTTTTT...","...PP..PP...","...PP..PP...","..KK....KK.."],
sjef:["...GGGGGG...","..GGGGGGGG..","..WWWWWWWW..","..WKWWWWKW..","..WWWWWWWW..","..WWGGGGWW..","...GGGGGG...","..DDDDDDDD..","..DDDDDDDD..","...DD..DD...","..KK....KK.."],
heart:[".KK...KK.","KRRK.KRRK","KRRRRRRRK","KRRRRRRRK",".KRRRRRK.","..KRRRK..","...KRK...","....K...."],
coin:["..KKKK..",".KYYYYK.","KYYWYYYK","KYYWYYYK","KYYYYYYK","KYYYYYYK",".KYYYYK.","..KKKK.."],
bomb:["....KK..","...K.K..",".KKKKKK.","KKKKKKKK","KKWKKKKK","KKKKKKKK",".KKKKKK.","..KKKK.."],
star:["....Y....","...YYY...","YYYYYYYYY",".YYYYYYY.","..YYYYY..",".YYY.YYY.","YY.....YY"]};
var PAL={B:C.blue,O:C.orange,W:"#fff",K:C.ink,Y:C.yel,R:C.red,G:"#64748b",D:"#475569"};
/* ---------- plaatjes (Kellie's artwork, games/glitch/img): als een plaatje er is, wint het van de pixel-sprite in code ---------- */
var IMGROOT=MW.root+"games/glitch/img/",IM={};
["bit","bit-run","bit-fall","glitch-0","glitch-1","glitch-2","eyes-0","eyes-1","eyes-2","ant-0","ant-1","ant-2","sjef","kid-0","kid-1","kid-2","kid-3","hat-0","hat-1","hat-2","hat-3","hero","scene-intro","scene-boss","scene-finale"].forEach(function(k){var im=new Image();im.src=IMGROOT+k+".webp";IM[k]=im});
function ok(k){var im=IM[k];return !!(im&&im.complete&&im.naturalWidth)}
/* plaatje met het midden-onder op (x,y), hoogte h; flip spiegelt */
function imgAt(g,k,x,y,h,al,flip){var im=IM[k];if(!ok(k))return false;var w=h*im.naturalWidth/im.naturalHeight;g.save();g.globalAlpha=al==null?1:al;g.translate(x,y);if(flip)g.scale(-1,1);g.drawImage(im,-w/2,-h,w,h);g.restore();return true}
/* scène als achtergrond, vullend (cover) */
function sceneBg(g,k,w,h,al){var im=IM[k];if(!ok(k))return false;var iw=im.naturalWidth,ih=im.naturalHeight,s=Math.max(w/iw,h/ih),dw=iw*s,dh=ih*s;g.save();g.globalAlpha=al==null?1:al;g.drawImage(im,(w-dw)/2,(h-dh)/2,dw,dh);g.restore();return true}
function drawBit(g,x,y,s,frame,flip){if(imgAt(g,frame===2?"bit-fall":frame?"bit-run":"bit",x,y,s*13,1,flip))return;px(g,x,y,s,frame?SPR.bit2:SPR.bit,PAL,flip)}
function drawSjef(g,x,y,s){px(g,x,y,s,SPR.sjef,PAL)}
/* Glitch: tr={kleur,ogen,ant}; (x,y)=midden onder, s=pixelgrootte */
function drawGlitch(g,x,y,s,tr,t,al){tr=tr||{kleur:0,ogen:1,ant:0};
  if(tr.kleur>=0&&ok("glitch-"+tr.kleur)&&ok("eyes-"+tr.ogen)&&ok("ant-"+tr.ant)){var bh=s*10,wb=still?0:Math.sin((t||0)/180)*s*.5,by=y+wb;g.save();g.globalAlpha=al==null?1:al;
    imgAt(g,"ant-"+tr.ant,x,by-bh*.86,bh*.55);imgAt(g,"glitch-"+tr.kleur,x,by,bh);imgAt(g,"eyes-"+tr.ogen,x,by-bh*.5,bh*(tr.ogen===0?.3:.24));g.restore();return}
  g.save();g.globalAlpha=al==null?1:al;var wob=still?0:Math.sin((t||0)/180)*s*.5;y+=wob;
  px(g,x,y,s,SPR.glitch,{C:GCOL[tr.kleur]||"#64748b"});
  /* ogen */var n=tr.ogen+1,xs=n===1?[0]:n===2?[-2,2]:[-3,0,3];xs.forEach(function(dx){g.fillStyle="#fff";g.fillRect(x+dx*s-s,y-7*s,2*s,2*s);g.fillStyle=C.ink;g.fillRect(x+dx*s-s*.5+(still?0:Math.sin((t||0)/500)*s*.4),y-6.5*s,s,s)});
  /* mond */g.fillStyle=C.ink;g.fillRect(x-2*s,y-4*s,4*s,s);
  /* antenne */g.fillStyle=C.yel;var top=y-10*s;if(tr.ant===0){[[0,-1],[1,-2],[0,-3],[1,-4],[0,-5]].forEach(function(p){g.fillRect(x+p[0]*s-s*.5,top+p[1]*s,s,s)})}
  else if(tr.ant===1){g.fillRect(x-s*.5,top-2*s,s,2*s);px(g,x,top-2*s,s*.6,SPR.star,PAL)}
  else{g.fillRect(x-s*.5,top-s,s,s);[[1,-2],[2,-3],[1,-4],[0,-4],[-1,-3],[0,-2]].forEach(function(p){g.fillRect(x+p[0]*s-s*.5,top+p[1]*s,s,s)})}
  g.restore()}
/* pixel-avatar van het team: av={c,h} */
function drawAvatar(g,x,y,s,av,t,flip){av=av||{c:0,h:0};
  if(ok("kid-"+av.c)&&ok("hat-"+av.h)){var kh=s*12,hop=(!still&&t)?Math.abs(Math.sin(t/150))*s*.6:0;imgAt(g,"kid-"+av.c,x,y-hop,kh,1,flip);var hs=av.h===2?kh*.34:av.h===3?kh*.16:kh*.3,hy=av.h===3?y-hop-kh*.84:y-hop-kh*.9;imgAt(g,"hat-"+av.h,x+(av.h===0?kh*.02:0),hy+hs,hs,1,flip);return}
  var HC=[C.red,C.yel,"#94a3b8",C.pink][av.h];var rows=SPR.kid.slice();
  if(av.h===1)rows[0]="...H.HH.H...";if(av.h===2){rows[0]="....HHHH....";rows[1]="..HHHHHHHH.."}if(av.h===3){rows[0]="............";rows[1]="...HHHHHH..."}
  if(!still&&t){var ph=Math.floor(t/150)%2;if(ph){rows[9]="..PP....PP..";rows[10]="..PP....PP..";rows[11]=".KK......KK."}}
  px(g,x,y,s,rows,{H:HC,S:"#f5c9a3",W:C.ink,T:AVC[av.c],P:"#1e3a8a",K:C.ink},flip)}
function spriteURL(fn,w,h){var cv=document.createElement("canvas");cv.width=w;cv.height=h;fn(cv.getContext("2d"));return cv.toDataURL("image/png")}
var AVU={};
function BITAV(){if(ok("bit"))return '<span class="avatar" style="background-image:url('+IMGROOT+'bit.webp);background-size:contain"></span>';AVU.bit=AVU.bit||spriteURL(function(g){drawBit(g,48,88,6)},96,96);return '<span class="avatar" style="background-image:url('+AVU.bit+')"></span>'}
function GLAV(){if(!AVU.gl||AVU.glk!==G.seed){AVU.glk=G.seed;AVU.gl=spriteURL(function(g){drawGlitch(g,48,86,6,G.c.sus[G.c.K])},96,96)}return '<span class="avatar gl" style="background-image:url('+AVU.gl+')"></span>'}
function SJEFAV(){if(ok("sjef"))return '<span class="avatar" style="background-image:url('+IMGROOT+'sjef.webp);background-size:contain"></span>';AVU.sj=AVU.sj||spriteURL(function(g){drawSjef(g,48,88,7)},96,96);return '<span class="avatar" style="background-image:url('+AVU.sj+')"></span>'}
/* geheimschrift-glyphen: 26 vaste 4x4 pixelpatronen */
var GLY=(function(){var out=[],seen={},h=0x9e37;for(var i=0;out.length<26;i++){h=(Math.imul(h^(i+1),2654435761)>>>0);var b=(h>>>8)&0xffff;var n=0;for(var k=0;k<16;k++)n+=(b>>k)&1;if(n<5||n>11||seen[b])continue;seen[b]=1;out.push(b)}return out})();
function drawGlyph(g,i,x,y,s,col){g.fillStyle=col||C.green;var b=GLY[i];for(var k=0;k<16;k++)if((b>>k)&1)g.fillRect(x+(k%4)*s,y+Math.floor(k/4)*s,s-.5,s-.5)}
function glyphURL(i,col){return spriteURL(function(g){drawGlyph(g,i,4,4,8,col)},40,40)}
/* kristal: N segmenten, n gevuld */
function drawCrystal(g,cx,cy,R,n,N,t){g.save();g.translate(cx,cy);for(var i=0;i<N;i++){var a0=-Math.PI/2+i/N*6.283,a1=-Math.PI/2+(i+1)/N*6.283,on=i<n;g.fillStyle=on?[C.green,C.cyan,C.pink,C.yel][i%4]:"rgba(255,255,255,.08)";g.beginPath();g.moveTo(0,0);g.arc(0,0,R,a0+.03,a1-.03);g.closePath();g.fill();if(on){g.strokeStyle="rgba(255,255,255,.5)";g.lineWidth=2;g.stroke()}}
  g.fillStyle=n>=N?"#fff":C.navy;g.beginPath();g.arc(0,0,R*.35,0,7);g.fill();if(n>=N&&!still){g.strokeStyle="rgba(255,255,255,.6)";g.lineWidth=3;g.beginPath();g.arc(0,0,R*1.1+Math.sin((t||0)/200)*4,0,7);g.stroke()}g.restore()}

/* ---------- zaakgenerator ---------- */
function genCase(seed,mode,n){n=n||8;var r=rngOf(seed),pick=function(a){return a[Math.floor(r()*a.length)]};
  var K={kleur:Math.floor(r()*3),ogen:Math.floor(r()*3),ant:Math.floor(r()*3)},sus=[K],ks=shuffle(ATK,r);
  ks.forEach(function(k){var d={kleur:K.kleur,ogen:K.ogen,ant:K.ant};d[k]=(K[k]+1+Math.floor(r()*2))%3;sus.push(d)});
  var order=shuffle([0,1,2,3],r),sus2=order.map(function(i){return sus[i]}),Ki=order.indexOf(0);
  var evo=shuffle(ATK,r),ev=evo.map(function(k){return{k:k,v:K[k],t:pick(D.EV[k])}});
  var wi=Math.floor(r()*D.WORDS.length),perm=shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],r);
  var acts=["bugs"].concat(shuffle(ACTS.filter(function(a){return a!=="bugs"&&a!=="cipher"}),r).slice(0,n-2)).concat(["cipher"]);
  var logs=shuffle(D.LOG,r),li=0,ei=0,av={c:Math.floor(r()*4),h:Math.floor(r()*4)};
  var slots=acts.map(function(a,i){var s={act:a,coins:10+Math.floor(r()*21),pu:shuffle(PUL,r).slice(0,3)};
    if(i===n-1){s.kind="key"}else if(EVPOS[n].indexOf(i)>=0){s.kind="ev";s.e=ei++}else{s.kind="log";s.t=logs[li++%logs.length]}return s});
  return{sus:sus2,K:Ki,ev:ev,wi:wi,perm:perm,slots:slots,av:av}}
function makeCode(seed,mode,n){return"GL"+(n===5?"5":n===11?"L":"")+(mode==="in"?"B":mode==="map"||mode==="demo"?"K":"S")+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v),m=/^GL([5L]?)([KSB])([0-9A-Z]{1,7})$/.exec(c);if(!m)return null;var seed=parseInt(m[3],36);if(!(seed>=0)||seed>4294967295)return null;return{mode:m[2]==="B"?"in":m[2]==="K"?"map":"street",seed:seed,n:m[1]==="5"?5:m[1]==="L"?11:8}}
function fixG(g){if(!g||!g.c||!g.c.slots)return null;g.n=g.n||g.c.slots.length;if(!Array.isArray(g.ph))g.ph=[];if(!Array.isArray(g.album))g.album=[];if(!g.poses)g.poses={};if(!g.ach)g.ach={};g.xp=g.xp||0;g.coins=g.coins||0;g.tl=g.tl||1;g.av=g.av||g.c.av;g.times=g.times||[];return g}
function word(){return D.WORDS[G.c.wi]}
function done(){return G.ph.filter(Boolean).length}
function vars(){return{J:NAME,W:word(),tl:G?G.tl:1,xp:G?G.xp:0,co:G?G.coins:0}}
function ach(k){if(!G||G.ach[k])return;G.ach[k]=1;save()}

/* ---------- startscherm ---------- */
function home(){musicStop();var p=MW.profile.get();
  $("#bResume").hidden=!LS.get(GK,null);
  var pro=MW.pro.isPro(ID),lk=MW.pro.locked(ID),playedToday=(p.games.gl&&p.games.gl.day)===MW.today();
  $("#bGps").textContent=(lk?"🔒 ":"")+(playedToday?T.todayAgain:T.today);$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;
  $("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;$("#status").textContent=pro?T.proOn:lk?T.proUsed:T.proFree;
  $("#name").value=NAME;voiceBtn();
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.m===MODE)});$$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===LEVEL)});$$("#dur button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});
  show("home")}
function voiceBtn(){var b=$("#bVoice");if(b){b.textContent=(VOICE?"🔊 ":"🔇 ")+T.voice;b.setAttribute("aria-pressed",VOICE)}}
function show(id){["home","brief","play","cards"].forEach(function(s){$("#"+s).hidden=s!==id});clearInterval(tick);tick=0;if(id==="cards")tick=setInterval(hud,1000);if(id==="play"&&map)map.resize()}
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;MODE=b.dataset.m;LS.set("ss_gl_mode",MODE);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#lvl").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;LEVEL=b.dataset.l;LS.set("ss_gl_level",LEVEL);$$("#lvl button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#dur").addEventListener("click",function(e){var b=e.target.closest("button");if(!b||!LENS[b.dataset.n])return;LEN=b.dataset.n;LS.set("ss_gl_len",LEN);$$("#dur button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})});
$("#name").addEventListener("input",function(){NAME=this.value.trim().slice(0,24);LS.set("ss_gl_name",NAME)});
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_gl_voice",VOICE);voiceBtn();toast(VOICE?T.voiceOn:T.voiceOff);if(VOICE)say(T.voiceOn);else hush()};
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(hashStr("gl|"+MODE+"|"+MW.today()),MODE,true,LENS[LEN])};
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
var St=MW.Steps,INK=LS.get("ss_gl_in",{kind:"sensor",spm:100});
function inSheet(cb){var sens=St&&St.supported(),IN=T.kv;
  sheet('<h2>'+esc(IN.inH)+'</h2><p>'+esc(IN.inT)+'</p>'+(sens?'<button type="button" class="btn" id="inS">'+esc(IN.inSensor)+'</button>':'')+'<button type="button" class="btn'+(sens?' ghost dk':'')+'" id="inT">'+esc(IN.inTempo)+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;if(sens)$("#inS").onclick=function(){St.ask().then(function(ok){closeSheet();if(!ok)toast(IN.inNoSensor);cb(ok?"sensor":"tempo",100)})};$("#inT").onclick=function(){closeSheet();cb("tempo",100)}}
function startIn(seed,daily,n){inSheet(function(kind,spm){INK={kind:kind,spm:spm};LS.set("ss_gl_in",INK);build(seed,"in",null,null,null,daily,n,true)})}
function stepIn(k){if(!G||G.mode!=="in")return;G.in.steps+=k;var open=G.st.filter(function(s){return !s.done}),t=null,nd=1e9;open.forEach(function(s){var d=dTo(s);if(d<nd){nd=d;t=s}});if(!t)return;var d=dTo(t),m=k*G.in.sl;if(d<=m){P.x=t.x;P.y=t.y;G.dist+=d}else{P.x+=(t.x-P.x)/d*m;P.y+=(t.y-P.y)/d*m;G.dist+=m}}
function startSteps(){if(!St||!G||G.mode!=="in")return;St.start({mode:G.in.kind,spm:G.in.spm,onStep:stepIn,active:function(){return !!G&&G.mode==="in"&&!$("#play").hidden&&$("#sheet").hidden&&$("#hide").hidden},onDead:function(){if(!G||G.mode!=="in")return;G.in.kind="tempo";save();toast(T.kv.inNoSensor);startSteps()}});St.awake(true)}
function stopSteps(){if(St){St.stop();St.awake(false)}}

/* ---------- een game beginnen ---------- */
function begin(seed,mode,daily,n){if(mode==="in")return startIn(seed,daily,n);if(mode!=="map")return build(seed,mode,null,null,null,daily,n);
  Wk.loading(T.loc);
  Wk.locate().then(function(pos){var lat=pos.coords.latitude,lon=pos.coords.longitude;
    return Wk.fetchWorld({lat:lat,lon:lon,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){Wk.loading("");
      if(!w.pois||!w.pois.length)return buildVirt(seed,"map",w.origin,daily,n);
      build(seed,"map",w.pois,w.ways,w.origin,daily,n);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})},function(){Wk.loading("");var kx=111320*Math.cos(lat*Math.PI/180);buildVirt(seed,"map",{lat:lat,lon:lon,kx:kx,ky:110540},daily,n)})
  }).catch(function(e){Wk.loading("");noMapSheet(seed,daily,e==="nogps"?T.noGps:T.denied,n)})}
function buildVirt(seed,mode,origin,daily,n){build(seed,mode,null,null,origin,daily,n,true);if(G&&mode==="map")toast(T.kv.virtOut)}
function noMapSheet(seed,daily,why,n){sheet('<h2>'+T.kv.noMapQ+'</h2>'+(why?'<p class="note">'+esc(why)+'</p>':'')+'<p>'+esc(T.kv.noMapT)+'</p><button type="button" class="btn" id="nmGo">'+T.kv.noMapGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#shX").onclick=closeSheet;$("#nmGo").onclick=function(){closeSheet();MODE="street";LS.set("ss_gl_mode",MODE);build(seed,"street",null,null,null,daily,n)}}
function dropMap(){if(!G||G.mode==="street")return;Wk.stopWatch();KM.leave();stopSteps();G.virt=false;G.mode="street";G.i=0;while(G.ph[G.i])G.i++;G.st=null;save();show("cards");render();toast(T.kv.switched)}
function build(seed,mode,pois,ways,origin,daily,n,virt){n=n===5||n===11?n:8;var c=genCase(seed,mode,n);
  G={seed:seed,code:makeCode(seed,mode,n),mode:mode,lvl:LEVEL,n:n,c:c,i:0,ph:[],team:null,arrest:null,t0:0,tries:0,daily:!!daily,dist:0,origin:origin,px:0,py:0,st:null,cine:false,end:null,album:[],poses:{},xp:0,coins:0,tl:1,ach:{},pu:null,av:c.av,times:[],lost:0,retries:0};
  if(virt||mode==="in"){G.virt=true;G.st=KM.virtSpots(n).map(function(p,i){p.fi=i;p.done=false;return p});W=[];P={x:0,y:0,acc:0};LS.set(WK,W);if(mode==="in")G.in={kind:INK.kind,spm:INK.spm,steps:0,sl:KM.stepLen(G.st,1200)}}
  else if(mode==="map"||mode==="demo"){var r=rngOf(seed^0x9e3779b9),spots=Wk.pickSpots(pois,ways,R0,n,r,T.corner);
    for(var k=0;spots.length<n&&k<40;k++){var a=k*2.39996+r(),d=R0*(.35+.5*r());spots.push({x:Math.round(Math.cos(a)*d),y:Math.round(Math.sin(a)*d),type:"hoek",name:""})}
    G.st=spots.map(function(p,i){return{x:p.x,y:p.y,type:p.type,name:p.name||cap((D.TYPES[p.type]||D.TYPES.hoek).replace(/^(de|het|the) /,"")),fi:i,done:false}});W=ways||[];P={x:0,y:0,acc:0};LS.set(WK,W)}
  brief()}
function brief(){var c=G.c;LEVEL=G.lvl||LEVEL;
  $("#bfNo").textContent=(G.mode==="demo"?T.demoCase+" · ":"")+T.lvl[LEVEL]+" · "+T.lens[lenOf(NN())];
  $("#bfOpen").innerHTML='<canvas class="brscene" width="320" height="180"></canvas>'+bubble(D.BIT.open,D.HERO,"big");briefScene($("#bfOpen canvas"));
  $("#bfSus").innerHTML='<div class="eyebrow">'+esc(T.avH)+'</div><p class="note">'+esc(T.avT)+'</p><div class="avpick"><canvas id="avC" width="160" height="200"></canvas><div class="avopts"><div class="seg four" id="avCol">'+T.avC.map(function(n,i){return '<button type="button" data-i="'+i+'" style="--c:'+AVC[i]+'" aria-pressed="'+(G.av.c===i)+'">'+esc(n)+'</button>'}).join("")+'</div><div class="seg four" id="avHat">'+T.avHat.map(function(n,i){return '<button type="button" data-i="'+i+'" aria-pressed="'+(G.av.h===i)+'">'+esc(n)+'</button>'}).join("")+'</div></div></div>';
  var paint=function(){var cv=$("#avC");if(!cv)return;var g=cv.getContext("2d");g.clearRect(0,0,160,200);drawAvatar(g,80,180,11,G.av,0)};paint();
  $("#avCol").onclick=function(e){var b=e.target.closest("button");if(!b)return;G.av.c=+b.dataset.i;$$("#avCol button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});paint();sfx("hit")};
  $("#avHat").onclick=function(e){var b=e.target.closest("button");if(!b)return;G.av.h=+b.dataset.i;$$("#avHat button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});paint();sfx("hit")};
  $("#bfTip").innerHTML=MW.codeBox(L,G.code,"zaak");MW.bindCodeBox($("#bfTip"),L);show("brief")}
function briefScene(cv){var g=cv.getContext("2d"),t0=0;var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=ts-t0;if(sceneBg(g,"scene-intro",320,180)){drawGlitch(g,282,176,4,G.c.sus[G.c.K],t,.95)}else{scanBg(g,320,180,t);
    drawBit(g,110,150,7,Math.floor(t/200)%2);drawGlitch(g,230,150,7,G.c.sus[G.c.K],t)}g.fillStyle=C.green;g.font="700 14px 'Press Start 2P',monospace";g.textAlign="center";g.fillText("PRESS START",160,40);if(!still&&t<30000)requestAnimationFrame(f)};requestAnimationFrame(f)}
function scanBg(g,w,h,t){var gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,C.navy);gr.addColorStop(1,C.pur);g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle="rgba(34,211,238,.18)";g.lineWidth=1;var hz=h*.55;for(var i=-6;i<=6;i++){g.beginPath();g.moveTo(w/2,hz);g.lineTo(w/2+i*w*.3,h);g.stroke()}for(var k=0;k<6;k++){var z=((k/6+(t||0)/3000)%1);var y=hz+z*z*(h-hz);g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}g.fillStyle="rgba(0,0,0,.15)";for(var y2=0;y2<h;y2+=3)g.fillRect(0,y2,w,1)}
$("#bGo").onclick=function(){if(!G.t0){G.t0=Date.now();if(G.mode==="map"||G.mode==="street")MW.pro.setFree(ID)}save();hush();ac();if(!G.cine){G.cine=true;save();cine(function(){photoSheet("team",enter)})}else enter()};
$("#bBack").onclick=function(){G=null;hush();home()};
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}

/* ---------- intro: PRESS START, flikkering, Bit valt uit het scherm ---------- */
function cine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),w,h,dpr,t0=0,fin=false,raf=0;
  ov.hidden=false;var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();sfx("boot");
  var lines=T.cine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;then()};
  $("#cineX").onclick=end;ov.onclick=function(e){if(e.target.id==="cine"||e.target.id==="cineC")end()};
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?12:(t-skipT)*13.5/TOTAL;g.setTransform(dpr,0,0,dpr,0,0);
    g.fillStyle=C.ink;g.fillRect(0,0,w,h);
    /* fase A: zwart scherm met PRESS START */if(ph<2.5){g.fillStyle=C.green;g.font="700 "+Math.round(Math.min(26,w*.06))+"px 'Press Start 2P',monospace";g.textAlign="center";if(Math.floor(ph*2)%2===0)g.fillText("PRESS START",w/2,h*.5)}
    /* fase B: laadbalk en fout */else if(ph<5){var pr=Math.min(1,(ph-2.5)/2);g.fillStyle=C.navy;g.fillRect(0,0,w,h);g.strokeStyle=C.cyan;g.lineWidth=3;g.strokeRect(w*.15,h*.5,w*.7,24);g.fillStyle=pr<1?C.cyan:C.red;g.fillRect(w*.15+3,h*.5+3,(w*.7-6)*pr,18);
      if(pr>=.98){g.fillStyle=C.red;g.font="700 "+Math.round(Math.min(28,w*.07))+"px 'Press Start 2P',monospace";g.textAlign="center";g.fillText("FOUT 404",w/2+(Math.random()-.5)*8,h*.4+(Math.random()-.5)*8);if(Math.random()<.3){g.fillStyle="rgba(255,79,163,.3)";g.fillRect(0,Math.random()*h,w,20)}}}
    /* fase C: de straat (pseudo-3D), Bit valt, Glitch lacht */else{var ph2=ph-5,drop=Math.min(1,ph2/1.2),bob=drop<1?0:Math.abs(Math.sin(ph2*3))*4,hasArt=ok("scene-intro")&&ok("hero");
      if(hasArt){if(ph2<1.6)sceneBg(g,"scene-intro",w,h);else{sceneBg(g,"hero",w,h);g.fillStyle="rgba(11,13,34,"+Math.min(.55,(ph2-1.6)*.3)+")";g.fillRect(0,0,w,h)}}else scanBg(g,w,h,t*1000);
      if(!hasArt)drawBit(g,w*.35,h*.3+drop*drop*h*.45-bob,Math.max(6,w*.02),drop<1?2:Math.floor(ph2*4)%2);
      if(ph2>1.6){var gx=w*.7+Math.sin(ph2*2)*20;drawGlitch(g,gx,h*.72,Math.max(6,w*.02),G.c.sus[G.c.K],ph2*1000)}
      if(ph2>1.6&&ph2<4.5){/* kristal breekt */for(var i=0;i<8;i++){var a=i/8*6.28,d=(ph2-1.6)*80;g.fillStyle=[C.green,C.cyan,C.pink,C.yel][i%4];g.fillRect(w*.7+Math.cos(a)*d,h*.5+Math.sin(a)*d*.6-(ph2-1.6)*20,10,10)}}
      if(ph2>6){g.textAlign="center";g.fillStyle=C.green;g.shadowColor=C.green;g.shadowBlur=20;var fs=Math.round(Math.min(34,w*.075));g.font="700 "+fs+"px 'Press Start 2P',monospace";var tt=L==="nl"?["GLITCH IN","DE BUURT"]:["GLITCH IN THE","NEIGHBOURHOOD"];g.fillText(tt[0],w/2,h*.28);g.fillText(tt[1],w/2,h*.28+fs*1.4);g.shadowBlur=0}}
    var li=0;while(li<lines.length-1&&t-skipT>=STARTS[li+1])li++;txt.textContent=lines[li];if(li!==spoken&&!still){spoken=li;say(lines[li])}
    if(t-skipT>TOTAL&&!still)return end();raf=requestAnimationFrame(f)};
  /* leestijd per zin: ± 15 tekens per seconde, minstens 4 s; tik op de tekst = volgende zin */
  var STARTS=[],TOTAL=0;lines.forEach(function(l){STARTS.push(TOTAL);TOTAL+=Math.max(4,l.length/15+1.5)});TOTAL+=1;var skipT=0;
  txt.style.pointerEvents="auto";txt.onclick=function(e){e.stopPropagation();var t=(performance.now()-t0)/1000-skipT,n=STARTS.filter(function(x){return x>t})[0];if(n==null)return end();skipT-=(n-t)};raf=requestAnimationFrame(f);if(still)setTimeout(end,5000)}

/* ---------- foto's ---------- */
function photoSheet(kind,then,at){photoFor={kind:kind,then:then,at:at};var team=kind==="team",pose=kind==="pose",pz=pose?D.POSE[((at||0)+G.seed)%D.POSE.length]:null,H=team?T.teamH:pose?T.poseH:T.arrestH,TX=team?T.teamT:pose?pz:T.arrestT;
  sheet('<div class="eyebrow">'+esc(H)+'</div><div class="task"><div class="ph">📷</div><div><h2>'+esc(H)+'</h2><p class="hint">'+esc(TX)+'</p></div></div><label class="btn cam" for="file">📷 '+T.shoot+'</label><p class="note" id="pMsg"></p><p class="note">'+esc(pose?T.poseNote:T.camNote)+'</p><button type="button" class="btn ghost dk" id="pSkip">'+T.skipPhoto+'</button>',true);
  say(TX);$("#pSkip").onclick=function(){closeSheet();photoFor=null;then()}}
$("#file").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f||!G||!photoFor)return;var msg=$("#pMsg");
  var url=URL.createObjectURL(f),im=new Image();im.onload=function(){URL.revokeObjectURL(url);var pose=photoFor.kind==="pose",mx=pose?400:480;
    var w=im.naturalWidth,h=im.naturalHeight,sc=Math.min(1,mx/Math.max(w,h)),cv=document.createElement("canvas");cv.width=Math.round(w*sc);cv.height=Math.round(h*sc);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
    var data=cv.toDataURL("image/jpeg",pose?.66:.72);if(pose){G.album=G.album||[];G.album.push({u:data,at:photoFor.at||0})}else G[photoFor.kind]=data;save();buzz([40,30,80]);sfx("coin");var th=photoFor.then;closeSheet();photoFor=null;th()};
  im.onerror=function(){URL.revokeObjectURL(url);if(msg)msg.textContent=T.noFile};im.src=url});

/* ---------- spelen zonder kaart: levelkaartjes ---------- */
function enter(){LEVEL=G.lvl||LEVEL;if(G.mode==="map"||G.mode==="demo"||G.mode==="in")enterMap();else{show("cards");render();music("map")}}
function hudTxt(pre){var n=done();$("#"+pre+"T").textContent=mmss(Date.now()-G.t0);$("#"+pre+"S").textContent=n+"/"+NN();$("#"+pre+"X").textContent=G.xp;$("#"+pre+"L").textContent="LVL "+G.tl;$("#"+pre+"C").textContent=G.coins}
function hud(){if(!G)return;hudTxt("h")}
function crystalHTML(n){return '<div class="crys"><canvas id="crC" width="120" height="120"></canvas><div><b>'+esc(fill(T.crystal,{n:n,N:NN()}))+'</b></div></div>'}
function paintCrystal(n){var cv=$("#crC");if(cv)drawCrystal(cv.getContext("2d"),60,60,54,n,NN(),0)}
function render(){hud();while(G.i<NN()&&G.ph[G.i])G.i++;var i=G.i,box=$("#card");
  if(i>=NN()){box.innerHTML='<div class="pol done"><div class="grid">'+G.ph.map(function(p){return '<img src="'+p+'" alt="">'}).join("")+'</div></div>'+crystalHTML(done())+bubble(T.radarAll,D.HERO)+'<button type="button" class="btn red" id="bAcc">'+T.toBoss+'</button>';paintCrystal(done());$("#bAcc").onclick=finaleGate;return}
  var s=G.c.slots[i];box.innerHTML='<div class="pol empty"><div class="world">'+esc(fill(T.world,{i:i+1}))+'</div><p class="cap">'+esc(T.kinds[s.act])+'</p></div>'+crystalHTML(done())+bubble(T.pz[s.act][1],D.HERO)+'<button type="button" class="btn" id="bOpen">'+T.start+'</button>';paintCrystal(done());$("#bOpen").onclick=function(){taskSheet(i)}}

/* ---------- spelen met kaart ---------- */
function enterMap(){show("play");music("map");
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return R0},
    theme:{bg:"#12163a",water:"#1b2a66",waterEdge:"#2d4aa0",ripple:"rgba(34,211,238,.2)",park:"#173a3a",parkEdge:"#1f5a4a",river:"#1b2a66",major:"#4a5aa0",minor:"#2b3566",road:"#343f78",label:"#8fd3ff",waterLabel:"#5b8dd6",ring:"rgba(57,255,136,.25)",me:"#39ff88",meHalo:"rgba(57,255,136,.15)",meRing:"rgba(57,255,136,.7)",font:"700 11px 'Nunito','Barlow Condensed',sans-serif"},
    items:items,onTap:function(hit,w){if(hit&&hit.ref.glimpse){if(GL.on)glimpseHit();return}if(hit&&!hit.ref.done){sel=hit.ref;chip()}else if(G.mode==="demo"){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(R0);sel=null;arrived=null;walkTo=null;$("#chip").hidden=true;
  Wk.stopWatch();if(G.mode==="map")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d;lastFix=Date.now();KM.moved(d)});
  lastFix=Date.now();KM.enter({kids:true,virt:!!G.virt,map:map});stopSteps();if(G.mode==="in")startSteps();GL.next=Date.now()+45000+Math.random()*45000;if(G.mode==="demo")toast(T.demoTip);requestAnimationFrame(loop)}
/* levelkaart: pixelwereld */
var START={x:500,y:1290},FP=[{x:230,y:1040,k:"spawn"},{x:300,y:520,k:"speel"},{x:520,y:330,k:"winkel"},{x:760,y:420,k:"brug"},{x:150,y:760,k:"water"},{x:860,y:700,k:"halte"},{x:720,y:960,k:"school"},{x:500,y:760,k:"plein"},{x:150,y:300,k:"toren"},{x:880,y:1060,k:"tunnel"},{x:620,y:1130,k:"antenne"}];
var ROADS=[[-1,0],[0,4],[4,1],[1,2],[2,3],[3,5],[5,6],[6,-1],[7,1],[7,5],[7,0],[7,6],[8,1],[8,4],[9,6],[9,5],[10,-1],[10,6]];
function blk(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function landmark(g,k,x,y,s){var d=C.ink;
  if(k==="spawn"){blk(g,x-s*.6,y-s*.3,s*1.2,s*.3,C.green);blk(g,x-s*.5,y-s*.5,s,s*.2,"#1f7a4a");blk(g,x-s*.1,y-s*1.1,s*.2,s*.6,C.green);drawBit(g,x,y-s*.3,s*.07,0)}
  else if(k==="speel"){blk(g,x-s*.6,y-s*1,s*.12,s,C.red);blk(g,x+s*.5,y-s*1,s*.12,s,C.red);blk(g,x-s*.6,y-s*1,s*1.2,s*.12,C.red);blk(g,x-s*.12,y-s*.9,s*.08,s*.5,C.yel);blk(g,x+s*.08,y-s*.9,s*.08,s*.5,C.yel);blk(g,x-s*.2,y-s*.4,s*.4,s*.1,C.blue)}
  else if(k==="winkel"){blk(g,x-s*.6,y-s*.7,s*1.2,s*.7,"#f6e3b4");for(var i=0;i<6;i++)blk(g,x-s*.65+i*s*.22,y-s*.85,s*.22,s*.18,i%2?C.pink:"#fff");blk(g,x-s*.15,y-s*.4,s*.3,s*.4,d);blk(g,x-s*.5,y-s*.55,s*.25,s*.2,C.cyan)}
  else if(k==="brug"){blk(g,x-s*.8,y-s*.2,s*1.6,s*.2,"#8a5a2b");for(i=0;i<5;i++)blk(g,x-s*.75+i*s*.36,y-s*.5,s*.08,s*.3,"#5b3a1e");blk(g,x-s*.8,y-s*.5,s*1.6,s*.06,"#5b3a1e")}
  else if(k==="water"){blk(g,x-s*.7,y-s*.3,s*1.4,s*.3,C.cyan);blk(g,x-s*.5,y-s*.2,s*.3,s*.06,"#fff");blk(g,x+s*.1,y-s*.12,s*.3,s*.06,"#fff")}
  else if(k==="halte"){blk(g,x-s*.05,y-s*1.2,s*.1,s*1.2,"#94a3b8");blk(g,x-s*.3,y-s*1.3,s*.6,s*.3,C.blue);g.fillStyle="#fff";g.font="700 "+Math.round(s*.22)+"px 'Press Start 2P',monospace";g.textAlign="center";g.fillText("BUS",x,y-s*1.08);blk(g,x-s*.5,y-s*.35,s,s*.1,"#94a3b8")}
  else if(k==="school"){blk(g,x-s*.7,y-s*.8,s*1.4,s*.8,"#f4a261");blk(g,x-s*.8,y-s*.95,s*1.6,s*.15,"#7a3b2e");for(i=0;i<3;i++)blk(g,x-s*.55+i*s*.4,y-s*.65,s*.25,s*.25,C.cyan);blk(g,x+s*.5,y-s*1.4,s*.05,s*.5,d);blk(g,x+s*.55,y-s*1.4,s*.3,s*.18,C.red)}
  else if(k==="plein"){blk(g,x-s*.9,y-s*.15,s*1.8,s*.15,"#4a5aa0");for(i=0;i<6;i++)blk(g,x-s*.85+i*s*.3,y-s*.6+(i%2)*s*.1,s*.12,s*.45,[C.green,C.pink,C.cyan,C.yel][i%4]);}
  else if(k==="toren"){blk(g,x-s*.3,y-s*1.6,s*.6,s*1.6,"#475569");blk(g,x-s*.4,y-s*1.75,s*.8,s*.15,"#334155");blk(g,x-s*.1,y-s*1.3,s*.2,s*.2,C.yel);blk(g,x-s*.1,y-s*.8,s*.2,s*.2,C.yel)}
  else if(k==="tunnel"){blk(g,x-s*.7,y-s*.8,s*1.4,s*.8,"#64748b");blk(g,x-s*.4,y-s*.6,s*.8,s*.6,d);blk(g,x-s*.3,y-s*.5,s*.6,s*.1,C.pink)}
  else if(k==="antenne"){blk(g,x-s*.05,y-s*1.5,s*.1,s*1.5,"#94a3b8");for(i=1;i<4;i++){blk(g,x-s*.3*i/3-s*.05,y-s*1.5+i*s*.3,s*.6*i/3+s*.1,s*.06,"#94a3b8")}blk(g,x-s*.08,y-s*1.65,s*.16,s*.16,C.red)}}
var KM=MW.KidsMap.create({T:T.kv,go:function(s){walkTo={x:s.x,y:s.y};sel=null},G:function(){return G},P:function(){return P},dTo:function(s){return dTo(s)},virt:function(){return !!(G&&G.virt)},mode:function(){return G&&G.mode},
  map:{W:1000,H:1400,start:START,spots:FP,roads:ROADS,vsc:.42,sky:"#12163a",land:"#1d2451",road:"#343f78",roadLine:"#22d3ee",label:"#e0f2fe",labelHalo:"rgba(18,22,58,.9)",heroHalo:"rgba(57,255,136,.2)"},
  draw:{mark:function(g,x,y,r,col){g.fillStyle=col;g.fillRect(x-r,y-r,r*2,r*2)},
    ground:function(g,t){g.fillStyle="rgba(34,211,238,.08)";for(var x=0;x<1000;x+=100)g.fillRect(x,0,1,1400);for(var y=0;y<1400;y+=100)g.fillRect(0,y,1000,1);g.fillStyle="#1b2a66";[[0,640,1000,90]].forEach(function(e){g.fillRect(e[0],e[1],e[2],e[3])});g.fillStyle="rgba(255,255,255,.25)";for(var i=0;i<8;i++)g.fillRect(60+i*120+(still?0:Math.sin(t/700+i)*10),670+(i%2)*20,40,4)},
    decor:function(g,t){[[80,1180],[120,180],[420,160],[640,180],[900,260],[950,900],[940,1180],[300,1300],[700,1300],[380,900],[640,600],[90,520]].forEach(function(p,i){blk(g,p[0]-6,p[1]-30,12,30,"#3b2a14");blk(g,p[0]-22,p[1]-58,44,32,i%2?"#1f7a4a":"#2a9d4b")});
      var ph=still?0:(t/120)%1000;g.fillStyle=C.pink;g.globalAlpha=.6;g.fillRect(ph,100,30,6);g.fillRect(1000-ph,1250,30,6);g.globalAlpha=1},
    start:function(g,x,y){blk(g,x-170,y-80,110,80,"#ff8fab");blk(g,x-180,y-92,130,14,C.red);blk(g,x+60,y-70,100,70,"#fcd34d");blk(g,x+50,y-82,120,14,C.blue);blk(g,x-150,y-50,24,24,C.cyan);blk(g,x+100,y-45,24,24,C.cyan);for(var i=0;i<8;i++)blk(g,x-150+i*44,y+6,10,30,"#cbd5e1")},
    landmark:landmark,
    hero:function(g,x,y,t){drawAvatar(g,x,y+6,6,G.av,t)},
    runner:function(g,fx,fy,t){return;var aa=t/2000;drawGlitch(g,fx+Math.cos(aa)*80,fy+40+Math.abs(Math.sin(aa*2))*-30,4,G.c.sus[G.c.K],t,.9)},
    overlay:function(g,w,h,t){if(!GL.on)return false;var gt=(t-GL.t0)/1000,gx=GL.dir>0?-80+gt/4*(w+160):w+80-gt/4*(w+160),gy=h*.5;GL.x=gx;GL.y=gy;drawGlitch(g,gx,gy,Math.max(5,h*.008),G.c.sus[G.c.K],t);if(gt>4){GL.on=false;KM.setMsg("");toast(T.glimpseNo);return false}KM.setMsg(T.glimpse);return true}},
  onTap:function(x,y){if(!GL.on)return;if(Math.hypot(x-GL.x,y-(GL.y-30))<70)glimpseHit()}});
KM.mount();
function glimpseHit(){GL.on=false;G.gl=(G.gl||0)+1;G.coins+=10;save();buzz([40,30,80]);sfx("coin");KM.setMsg("");var m=fill(T.glimpseYes,{n:10});toast(m)}
function glimpseTick(){return;if(GL.on||!G||(G.gl||0)>=3||!$("#sheet").hidden||Date.now()<GL.next)return;var open=G.st.filter(function(s){return !s.done});if(!open.length)return;if(!KM.on()&&G.mode!=="demo")return;GL.on=true;GL.t0=performance.now();GL.dir=Math.random()<.5?1:-1;GL.next=Date.now()+70000+Math.random()*60000;say(T.glimpse);sfx("glitch");buzz([30,40,30])}
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)},inRange=function(t){return dTo(t)<=Math.max(35,Math.min(P.acc||0,60))||G.force===t};
function items(){var it=[],open=G.st.filter(function(s){return !s.done});
  G.st.forEach(function(s){it.push({x:s.x,y:s.y,ref:s,tap:!s.done,draw:function(cx,X,Y,t,api){var col=[C.green,C.cyan,C.pink,C.yel][s.fi%4];
    if(!s.done&&!api.still){cx.strokeStyle=col;cx.globalAlpha=.7-((t/1500)%1)*.7;cx.lineWidth=2;cx.strokeRect(X-18-((t/1500)%1)*22,Y-18-((t/1500)%1)*22,36+((t/1500)%1)*44,36+((t/1500)%1)*44);cx.globalAlpha=1}
    cx.fillStyle=s.done?"#334155":C.navy;cx.fillRect(X-16,Y-16,32,32);cx.strokeStyle=s.done?"#64748b":col;cx.lineWidth=3;cx.strokeRect(X-16,Y-16,32,32);
    cx.fillStyle=s.done?"#94a3b8":col;cx.font="700 13px 'Press Start 2P',monospace";cx.textAlign="center";cx.textBaseline="middle";cx.fillText(s.done?"✓":String(s.fi+1),X,Y+1);cx.textBaseline="alphabetic";
    if(sel===s){cx.strokeStyle="#fff";cx.lineWidth=2;cx.strokeRect(X-24,Y-24,48,48)}
    cx.fillStyle=s.done?"#64748b":"#e0f2fe";cx.font="700 11px 'Nunito',sans-serif";if(api.V.s>=.4||sel===s)cx.fillText(s.name.toUpperCase().slice(0,24),X,Y+34)}})});
  if(GL.on&&!KM.on()){var gt=(performance.now()-GL.t0)/1000,gref={x:P.x+(GL.dir>0?-220+gt*110:220-gt*110),y:P.y+90,glimpse:true};it.push({x:gref.x,y:gref.y,ref:gref,tap:true,draw:function(cx,X,Y,t){drawGlitch(cx,X,Y,5,G.c.sus[G.c.K],t,.9)}});if(gt>4){GL.on=false;toast(T.glimpseNo)}}
  if(open.length){var near=open.reduce(function(a,s){return dTo(s)<dTo(a)?s:a});it.push({x:near.x,y:near.y,tap:false,draw:function(cx,X,Y,t,api){var a=t/2000,rx=50*api.V.s+30;drawGlitch(cx,X+Math.cos(a)*rx,Y+Math.sin(a*.7)*rx*.6+10,4,G.c.sus[G.c.K],t,.9)}})}
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

/* ---------- Glitch kaapt het scherm ---------- */
function visit(force){if(!G)return;G.lastVisit=Date.now();if(!force&&Math.random()<.35)return;var k=(G.vi==null?G.seed:G.vi+1)%D.HIJACK.length;G.vi=k;save();
  if(!$("#sheet").hidden)return;sfx("glitch");buzz([30,30,30,30,120]);
  var b=sheet('<div class="hijack"><div class="eyebrow">'+esc(T.hijackH)+'</div>'+bubble(D.HIJACK[k],D.VILLAIN,"big",GLAV())+'<button type="button" class="btn" id="hjX">'+esc(T.hijackX)+'</button></div>',true);
  say(D.HIJACK[k]);$("#hjX").onclick=function(){sfx("hit");closeSheet();if(G.mode==="map"||G.mode==="demo"||G.mode==="in")chip();else render()}}

/* ---------- een level: opdracht → puzzel → LEVEL CLEAR ---------- */
function taskSheet(i,spot){walkTo=null;var s=G.c.slots[i];cur={i:i,spot:spot||null,h:3,t0:Date.now(),retries:cur&&cur.i===i?cur.retries:0,pu:G.pu,stat:{}};
  if(cur.pu){G.pu=null;save();if(cur.pu==="shield")cur.shield=true;if(cur.pu==="hint")cur.freeHint=true;if(cur.pu==="time")cur.extra=hard()?5:15}
  var I=T.pz[s.act],head='<div class="eyebrow">'+esc(fill(T.world,{i:i+1}))+' · '+esc(T.kinds[s.act])+(spot?' · '+esc(spot.name):'')+'</div><div class="pzh"><div class="hearts" id="pzH"></div><div class="pzinfo"><b id="pzTm"></b></div></div>';
  sheet(head+'<h2>'+esc(I[0])+'</h2>'+bubble(I[1],D.HERO,"small")+(cur.pu?'<p class="note pu">⚡ '+esc(fill(T.puOn,{p:T.pu[cur.pu][0]}))+'</p>':'')+'<div id="pz"></div><div id="pzB"></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
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
    hint:function(fn){var b=document.createElement("button");b.type="button";b.className="btn ghost dk sm hintb";b.textContent=(ok("sjef")?"":"💡 ")+T.hint;if(ok("sjef")){var si=new Image();si.src=IMGROOT+"sjef.webp";si.className="sjefico";si.alt="";b.insertBefore(si,b.firstChild)}$("#pzB").appendChild(b);
      b.onclick=function(){cur.hinted=1;save();sfx("coin");fn()}}};
  if(/debug/.test(location.search))window.GL_DBG=o;
  if(window.MMP)MMP.helper(function(){G.t0-=120000;G.skips=(G.skips||0)+1;cur.h=1;save();o.done()},function(){say(I[1])});
  PUZ[s.act](o)}
function paintHearts(){var e=$("#pzH");if(!e||!cur)return;e.innerHTML="";for(var i=0;i<3;i++){var s=document.createElement("i");if(i<cur.h)s.className="on";e.appendChild(s)}}
function dead(){mg.stop();var box=$("#pz");box.innerHTML='<div class="deadbox"><b>GAME OVER?</b><p>'+esc(T.dead)+'</p><button type="button" class="btn" id="pzR">'+esc(T.retry)+'</button></div>';$("#pzB").innerHTML="";sfx("boss");say(T.dead);
  $("#pzR").onclick=function(){var i=cur.i,sp=cur.spot;cur.retries++;G.retries++;save();var keep=cur;taskSheet(i,sp);cur.retries=keep.retries}}
function thumb(i,act){var cv=document.createElement("canvas");cv.width=cv.height=240;var g=cv.getContext("2d");scanBg(g,240,240,0);g.fillStyle=C.green;g.font="700 16px 'Press Start 2P',monospace";g.textAlign="center";g.fillText("WORLD 1-"+(i+1),120,40);g.fillStyle="#fff";g.font="700 14px 'Nunito',sans-serif";g.fillText(T.kinds[act],120,64);drawAvatar(g,120,210,8,G.av,0);return cv.toDataURL("image/png")}
function accept(){var i=cur.i,s=G.c.slots[i];G.ph[i]=cur.thumb;if(cur.spot){cur.spot.done=true;cur.spot.doneAt=Date.now();G.kd0=null}G.force=null;if(G.mode!=="map"&&G.mode!=="demo")G.i=i+1;
  var secs=cur.secs,xp=100+cur.h*20+(secs<60?30:0)-Math.min(60,cur.retries*20);if(cur.pu==="xp2")xp*=2;var coins=s.coins+cur.h*5;if(cur.pu==="coin2")coins*=2;
  var oldL=G.tl;G.xp+=xp;G.coins+=coins;G.tl=teamLvl(G.xp);G.times.push(secs);save();buzz([40,30,80]);sfx("clear");
  if(cur.h===3&&!cur.retries)ach("flawless");if(secs<45)ach("speed");if(G.coins>=150)ach("rich");if(G.tl===10)ach("max");Object.keys(cur.stat).forEach(ach);
  var n=done(),N=NN(),last=n>=N,kind=s.kind,rw,rwH,rwT;
  if(kind==="ev"){var e=G.c.ev[s.e];rwH=T.evH;rwT=T.evT;rw='<div class="rew"><canvas class="evc" data-k="'+e.k+'" data-v="'+e.v+'" width="80" height="80"></canvas><p>'+esc(fill(e.t,{v:D.AT[e.k].v[e.v]}))+'</p></div>'}
  else if(kind==="key"){rwH=T.keyH;rwT=T.keyT;rw='<div class="rew key"><b class="pw">'+esc(word())+'</b><p>'+esc(fill(D.KEYT,{w:word()}))+'</p></div>'}
  else{rwH=T.logH;rwT=T.logT;rw='<div class="rew">'+bubble(s.t,D.VILLAIN,"small",GLAV())+'</div>'}
  var cliff=last?D.BIT.cliffLast:D.BIT.cliff[(n-1+G.seed)%D.BIT.cliff.length],react=D.BIT.react[(n+G.seed)%D.BIT.react.length];
  sheet('<div class="clear"><div class="eyebrow">'+esc(fill(T.world,{i:i+1}))+'</div><h2 class="big">'+esc(T.clear)+'</h2><canvas id="clC" width="320" height="170"></canvas>'+
    crystalHTML(n)+
    '<div class="rep"><em>'+esc(rwH)+'</em>'+rw+'<p class="note">'+esc(rwT)+'</p></div>'+
    '<div class="msg small">'+BITAV()+'<div class="bub"><p>'+esc(react)+'</p></div></div><p class="cliff">'+esc(cliff)+'</p><button type="button" class="btn" id="bNext">'+(last?T.toBoss:T.next)+'</button></div>',true);
  paintCrystal(n);clearAnim($("#clC"),n);
  $$("#sheetBody .evc").forEach(function(cv){evDraw(cv.getContext("2d"),cv.dataset.k,+cv.dataset.v)});
  say(T.clear+". "+rwH+". "+(kind==="key"?fill(D.KEYT,{w:word().split("").join(" ")}):kind==="ev"?fill(G.c.ev[s.e].t,{v:D.AT[G.c.ev[s.e].k].v[G.c.ev[s.e].v]}):s.t)+" "+react+" "+cliff);
  $("#bNext").onclick=function(){closeSheet();sel=null;cur=null;var goOn=function(){if(G.mode==="map"||G.mode==="demo"||G.mode==="in"){chip();if(last)finaleGate()}else{render();if(last)finaleGate()}};
    var pa=(POSE_AT[N]||[]);if(pa.indexOf(n)>=0&&!G.poses[n]){G.poses[n]=1;save();return photoSheet("pose",function(){if(Object.keys(G.poses).length>=pa.length&&(G.album||[]).length>=pa.length)ach("photo");goOn()},n)}goOn()}}
/* memory: husselen tot geen enkel paar naast of onder elkaar ligt */
function spreadPairs(c,cols,r){for(var t=0;t<300;t++){var bad=false;for(var i=0;i<c.length&&!bad;i++){if(i%cols<cols-1&&c[i]===c[i+1])bad=true;if(i+cols<c.length&&c[i]===c[i+cols])bad=true}if(!bad)return c;c=shuffle(c,r)}return c}
function countUp(el,v){var t0=performance.now(),f=function(ts){var p=Math.min(1,(ts-t0)/900);el.textContent=Math.round(v*p);if(p<1&&!still)requestAnimationFrame(f);else el.textContent=v};requestAnimationFrame(f)}
function clearAnim(cv,n){var g=cv.getContext("2d"),t0=0,q=rngOf(n*77),conf=[];for(var i=0;i<40;i++)conf.push({x:q()*320,y:-q()*170,v:40+q()*80,c:[C.green,C.cyan,C.pink,C.yel][i%4],s:4+q()*5});
  var f=function(ts){if(!cv.isConnected)return;if(!t0)t0=ts;var t=(ts-t0)/1000;scanBg(g,320,170,ts);conf.forEach(function(c){g.fillStyle=c.c;g.fillRect(c.x,(c.y+c.v*t)%190,c.s,c.s)});
    drawAvatar(g,120,150,7,G.av,still?0:ts);var k=Math.min(1,t/1);drawCrystal(g,230,80,30+k*10,n,NN(),ts);if(!still&&t<20)requestAnimationFrame(f)};requestAnimationFrame(f)}
function evDraw(g,k,v){g.fillStyle=C.navy;g.fillRect(0,0,80,80);g.strokeStyle=C.green;g.lineWidth=2;g.strokeRect(2,2,76,76);
  if(k==="kleur"){g.fillStyle=GCOL[v];g.fillRect(20,20,40,40)}else if(k==="ogen"&&ok("eyes-"+v)){imgAt(g,"eyes-"+v,40,52,v===0?28:22)}
  else if(k==="ant"&&ok("ant-"+v)){imgAt(g,"ant-"+v,40,72,56)}
  else if(k==="ogen"){var n=v+1,xs=n===1?[40]:n===2?[28,52]:[20,40,60];xs.forEach(function(x){g.fillStyle="#fff";g.fillRect(x-8,32,16,16);g.fillStyle=C.ink;g.fillRect(x-3,37,6,6)})}
  else{drawGlitch(g,40,74,4,{kleur:-1,ogen:1,ant:v},0);g.fillStyle=C.navy;g.fillRect(0,38,80,42);g.fillStyle="rgba(57,255,136,.15)";g.fillRect(0,0,80,38)}}

/* ---------- de puzzels ---------- */
var PUZ={
/* 1 bug-jacht: tik bugs weg, niet de hartjes */
bugs:function(o){var cv=o.canvas(300),g=cv.getContext("2d"),N=o.hard?16:12,got=0,bugs=[],t0=performance.now(),last=0;o.msg(fill(T.score,{})+" 0/"+N);
  var spawn=function(){var isH=o.rng()<(o.hard?.3:.2);bugs.push({x:20+o.rng()*240,y:20+o.rng()*260,vx:(o.rng()-.5)*(o.hard?3:1.8),vy:(o.rng()-.5)*(o.hard?3:1.8),h:isH,born:performance.now(),life:2200+o.rng()*1500})};
  var f=function(ts){if(o.dead())return;scanBg(g,280,300,ts);if(ts-last>(o.hard?700:900)&&bugs.length<6){last=ts;spawn()}
    bugs=bugs.filter(function(b){return ts-b.born<b.life});bugs.forEach(function(b){b.x+=b.vx;b.y+=b.vy;if(b.x<10||b.x>270)b.vx*=-1;if(b.y<10||b.y>290)b.vy*=-1;if(b.h)px(g,b.x,b.y+12,2.6,SPR.heart,PAL);else{g.fillStyle=C.pink;g.fillRect(b.x-8,b.y-6,16,12);g.fillStyle=C.ink;g.fillRect(b.x-6,b.y-4,4,4);g.fillRect(b.x+2,b.y-4,4,4);g.fillRect(b.x-12,b.y-10+((ts/100)%2)*2,4,4);g.fillRect(b.x+8,b.y-10+((ts/100)%2)*2,4,4)}});
    mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  cv.onpointerdown=function(e){var p=o.at(e,cv),hit=null;bugs.forEach(function(b){if(Math.hypot(b.x-p[0],b.y-p[1])<22)hit=b});if(!hit)return;bugs.splice(bugs.indexOf(hit),1);
    if(hit.h){o.bad()}else{got++;o.hit();o.msg(T.score+" "+got+"/"+N);if(got>=N){o.good();o.done()}}}},
/* 2 platformer: Bit rent, tik (of spring echt) om te springen */
jump:function(o){var cv=o.canvas(240),g=cv.getContext("2d"),LEN=o.hard?2600:2000,gaps=[],x=0,sp=o.hard?2.6:2.1,vy=0,yb=0,alive=true,onG=true;
  for(var gx=260;gx<LEN-200;gx+=180+o.rng()*120)gaps.push({x:gx,w:40+o.rng()*(o.hard?45:30)});
  var jump=function(){if(!alive||!onG)return;vy=-9.5;onG=false;sfx("jump")};cv.onpointerdown=jump;
  /* echt springen: piek in de versnellingsmeter */var onM=function(e){var a=e.accelerationIncludingGravity;if(!a)return;var m=Math.hypot(a.x||0,a.y||0,a.z||0);if(m>19)jump()};try{addEventListener("devicemotion",onM)}catch(e){}mg.off=function(){removeEventListener("devicemotion",onM)};
  o.msg(T.jumpTap);
  var f=function(ts){if(o.dead())return;x+=sp;var bx=60,wx=x+bx,inGap=gaps.some(function(q){return wx>q.x+8&&wx<q.x+q.w-8});
    vy+=.55;yb+=vy;if(yb>=0&&!inGap){yb=0;vy=0;onG=true}
    scanBg(g,280,240,ts);var gy=200;g.fillStyle="#4a5aa0";g.fillRect(0,gy,280,40);g.fillStyle=C.ink;gaps.forEach(function(q){g.fillRect(q.x-x,gy,q.w,40)});g.fillStyle=C.green;g.fillRect(0,gy,280,4);gaps.forEach(function(q){g.fillStyle=C.ink;g.fillRect(q.x-x,gy,q.w,4)});
    /* vlag */var fx=LEN-x;g.fillStyle="#fff";g.fillRect(fx,gy-70,4,70);g.fillStyle=C.yel;g.fillRect(fx+4,gy-70,30,20);
    drawBit(g,bx,gy+yb,4,Math.floor(ts/120)%2);
    if(yb>36){alive=false;var d=o.bad();if(d)return;x=Math.max(0,x-160);yb=0;vy=0;onG=true;alive=true}
    if(x>=LEN-60){o.good();o.done();return}mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)},
/* 3 shop: koop voor precies het bedrag */
shop:function(o){var items=shuffle(D.SHOP,o.rng).slice(0,6).map(function(n){return{n:n,p:2+Math.floor(o.rng()*(o.hard?14:9))}}),pick=[];
  /* doelbedrag = som van 2 of 3 echte items, zodat het altijd kan */var sub=shuffle(items,o.rng).slice(0,o.hard?3:2),target=sub.reduce(function(a,b){return a+b.p},0),first=true;
  var paint=function(){var tot=pick.reduce(function(a,i){return a+items[i].p},0);o.box.innerHTML='<div class="shop"><div class="shopt">'+esc(T.shopTarget)+' <b>'+target+'</b> <i class="coin"></i></div><div class="shopg">'+items.map(function(it,i){return '<button type="button" data-i="'+i+'" class="'+(pick.indexOf(i)>=0?"on":"")+'"><span>'+esc(it.n)+'</span><b>'+it.p+'</b></button>'}).join("")+'</div><div class="shopt">'+esc(T.shopTotal)+': <b>'+tot+'</b></div><div class="row2"><button type="button" class="btn ghost dk sm" id="shR">'+esc(T.shopReset)+'</button><button type="button" class="btn sm" id="shB">'+esc(T.shopBuy)+'</button></div></div>';
    o.box.querySelector(".shopg").onclick=function(e){var b=e.target.closest("button");if(!b)return;var i=+b.dataset.i,k=pick.indexOf(i);if(k>=0)pick.splice(k,1);else pick.push(i);o.hit();paint()};
    $("#shR").onclick=function(){pick=[];paint()};$("#shB").onclick=function(){var tt=pick.reduce(function(a,i){return a+items[i].p},0);if(tt===target&&pick.length){if(first)o.flag("math");o.good();o.msg(T.shopOk);o.done()}else{first=false;o.msg(T.shopNo);o.bad()}}};
  paint();o.hint(function(){var i=items.indexOf(sub[0]);if(pick.indexOf(i)<0)pick.push(i);paint()})},
/* 4 geheugenbrug (Simon) */
simon:function(o){var cv=o.canvas(280),g=cv.getContext("2d"),N=o.hard?7:5,seq=[],round=0,inp=[],lit=-1,busy=true,perfect=true;for(var i=0;i<N;i++)seq.push(Math.floor(o.rng()*6));
  var TL=[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],COLS=[C.green,C.cyan,C.pink,C.yel,"#b794f6",C.orange];
  var draw=function(){scanBg(g,280,280,0);g.fillStyle="#8a5a2b";g.fillRect(10,60,260,160);TL.forEach(function(t,i){g.fillStyle=lit===i?"#fff":COLS[i];g.globalAlpha=lit===i?1:.55;g.fillRect(20+t[0]*85,70+t[1]*72,75,62);g.globalAlpha=1;g.strokeStyle=C.ink;g.lineWidth=3;g.strokeRect(20+t[0]*85,70+t[1]*72,75,62)})};
  var play=function(){busy=true;inp=[];o.msg(T.simonWatch+" "+fill(T.simonRound,{r:round+1,n:N}));var k=0,step=function(){if(o.dead())return;if(k>round+1){lit=-1;draw();busy=false;o.msg(T.simonGo);return}lit=k<=round?seq[k]:-1;draw();if(lit>=0)tone(330+lit*70,.25,"square",.05);k++;mg.tm.push(setTimeout(function(){lit=-1;draw();mg.tm.push(setTimeout(step,180))},o.hard?350:500))};mg.tm.push(setTimeout(step,600))};
  cv.onpointerdown=function(e){if(busy)return;var p=o.at(e,cv),i=-1;TL.forEach(function(t,k){if(p[0]>20+t[0]*85&&p[0]<95+t[0]*85&&p[1]>70+t[1]*72&&p[1]<132+t[1]*72)i=k});if(i<0)return;lit=i;draw();tone(330+i*70,.2,"square",.05);mg.tm.push(setTimeout(function(){lit=-1;draw()},150));
    inp.push(i);var j=inp.length-1;if(inp[j]!==seq[j]){perfect=false;if(o.bad())return;play();return}if(inp.length===round+1){round++;if(round>=N){if(perfect)o.flag("memory");o.good();o.done()}else mg.tm.push(setTimeout(play,500))}};
  draw();play()},
/* 5 sluipen: rood licht / groen licht, met microfoon als extra oor */
stealth:function(o){var cv=o.canvas(240),g=cv.getContext("2d"),x=20,look=false,hold=false,nextT=0,vol=0,mic=null,heard=false,quiet=true;
  var start=function(){var f=function(ts){if(o.dead())return;if(ts>nextT){look=!look;nextT=ts+(look?(900+o.rng()*900):(1400+o.rng()*2200));if(look)tone(520,.1,"square",.05)}
    if(hold&&!look)x+=o.hard?1.6:1.9;
    scanBg(g,280,240,ts);g.fillStyle="#4a5aa0";g.fillRect(0,190,280,50);g.fillStyle=C.green;g.fillRect(250,150,30,40);
    /* bewaker */var gx=140,gy=100;drawGlitch(g,gx,gy,4,G.c.sus[G.c.K],ts);g.fillStyle=look?"rgba(255,59,59,.35)":"rgba(255,255,255,.06)";g.beginPath();g.moveTo(gx,gy-20);g.lineTo(0,240);g.lineTo(280,240);g.closePath();g.fill();
    if(mic){g.fillStyle=vol>(o.hard?.06:.1)?C.red:C.green;g.fillRect(10,10,Math.min(120,vol*800),8);g.strokeStyle="#fff";g.strokeRect(10,10,120,8)}
    drawAvatar(g,x,200,4,G.av,hold&&!look?ts:0);
    var loud=mic&&vol>(o.hard?.06:.1);if((look&&hold)||(loud&&x>30)){heard=heard||loud;quiet=false;o.msg(loud?T.stealthHeard:T.stealthStop);if(o.bad())return;x=20}
    else o.msg(look?T.stealthStop:T.stealthGo);
    if(x>=245){if(quiet)o.flag("whisper");o.good();o.done();return}mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)};
  cv.onpointerdown=function(){hold=true};cv.onpointerup=cv.onpointercancel=cv.onpointerleave=function(){hold=false};
  var ok=function(){toast(T.stealthMic)},nope=function(){toast(T.stealthNoMic)};
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){var a=ac();if(!a){nope();return}var src=a.createMediaStreamSource(st),an=a.createAnalyser();an.fftSize=512;src.connect(an);var buf=new Uint8Array(an.fftSize);mic=setInterval(function(){an.getByteTimeDomainData(buf);var s=0;for(var i=0;i<buf.length;i++){var v=(buf[i]-128)/128;s+=v*v}vol=Math.sqrt(s/buf.length)},100);mg.iv.push(mic);mg.off=function(){st.getTracks().forEach(function(t){t.stop()})};ok()}).catch(nope)}else nope();start()},
/* 6 AR-jacht: camera + kantelen, blokjes wegtikken */
ar:function(o){var N=10,got=0,blocks=[],ox=0,oy=0,hasCam=false,vid=null,t0=Date.now();
  o.box.innerHTML='<div class="arbox"><video id="arV" playsinline muted autoplay></video><canvas id="arC" width="280" height="360"></canvas></div>';var cv=$("#arC"),g=cv.getContext("2d");
  for(var i=0;i<N;i++)blocks.push({x:(o.rng()-.5)*700,y:(o.rng()-.5)*500,s:28+o.rng()*18,on:true,ph:o.rng()*6});
  var onO=function(e){if(e.gamma!=null)ox=-e.gamma*5;if(e.beta!=null)oy=-(e.beta-60)*4};var tilt=function(){try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")DeviceOrientationEvent.requestPermission().then(function(r){if(r==="granted")addEventListener("deviceorientation",onO)}).catch(function(){});else addEventListener("deviceorientation",onO)}catch(e){}};tilt();
  var drag=null;cv.onpointerdown=function(e){var p=o.at(e,cv),hit=null;blocks.forEach(function(b){if(!b.on)return;var bx=140+b.x+ox,by=180+b.y+oy;if(Math.abs(p[0]-bx)<b.s&&Math.abs(p[1]-by)<b.s)hit=b});
    if(hit){hit.on=false;got++;o.hit();buzz(30);o.msg(fill(T.arLeft,{n:N-got}));if(got>=N){tm.stop();if(Date.now()-t0<40000)o.flag("sharp");o.good();o.done()}return}drag={x:e.clientX,y:e.clientY,ox:ox,oy:oy}};
  cv.onpointermove=function(e){if(!drag)return;ox=drag.ox+(e.clientX-drag.x)*1.5;oy=drag.oy+(e.clientY-drag.y)*1.5};cv.onpointerup=cv.onpointercancel=function(){drag=null};
  var tm,onEnd=function(){if(o.bad())return;got=0;blocks.forEach(function(b){b.on=true});tm=o.timer(o.hard?50:60,onEnd)};tm=o.timer(o.hard?50:60,onEnd);
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(st){vid=$("#arV");if(!vid){st.getTracks().forEach(function(t){t.stop()});return}vid.srcObject=st;hasCam=true;mg.off=function(){st.getTracks().forEach(function(t){t.stop()})}}).catch(function(){toast(T.arNoCam)})}else toast(T.arNoCam);
  o.msg(fill(T.arLeft,{n:N}));
  var f=function(ts){if(o.dead())return;g.clearRect(0,0,280,360);if(!hasCam){scanBg(g,280,360,ts)}
    blocks.forEach(function(b){if(!b.on)return;var bx=140+b.x+ox,by=180+b.y+oy+Math.sin(ts/300+b.ph)*6;if(bx<-40||bx>320||by<-40||by>400)return;g.fillStyle=[C.pink,C.green,C.cyan][Math.floor(b.ph)%3];g.globalAlpha=.85;g.fillRect(bx-b.s/2,by-b.s/2,b.s,b.s);g.globalAlpha=1;g.strokeStyle="#fff";g.lineWidth=2;g.strokeRect(bx-b.s/2,by-b.s/2,b.s,b.s);g.fillStyle=C.ink;g.fillRect(bx-b.s*.3,by-b.s*.2,b.s*.2,b.s*.2);g.fillRect(bx+b.s*.1,by-b.s*.2,b.s*.2,b.s*.2)});
    /* vizier */g.strokeStyle=C.green;g.lineWidth=2;g.strokeRect(120,160,40,40);mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f)},
/* 7 geheimschrift: symbolen → letters */
cipher:function(o){var w=word(),perm=G.c.perm,letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ",show;
  if(o.hard){var need=w.split(""),extra=shuffle(letters.split("").filter(function(c){return need.indexOf(c)<0}),o.rng).slice(0,7);show=shuffle(need.filter(function(c,i){return need.indexOf(c)===i}).concat(extra),o.rng)}else show=letters.split("");
  o.box.innerHTML='<div class="cip"><div class="cipw">'+w.split("").map(function(c){return '<img src="'+glyphURL(perm[letters.indexOf(c)],C.pink)+'" alt="">'}).join("")+'</div><div class="cipk">'+show.map(function(c){return '<span><img src="'+glyphURL(perm[letters.indexOf(c)])+'" alt=""><b>'+c+'</b></span>'}).join("")+'</div><input class="inp" id="cipI" maxlength="'+w.length+'" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="'+esc(T.cipherType)+'"><button type="button" class="btn sm" id="cipB">'+esc(T.go)+'</button></div>';
  var inp=$("#cipI"),go=function(){var v=MW.norm(inp.value);if(v===w){if(!cur.hinted)o.flag("code");o.good();o.msg(T.cipherYes);o.done()}else{o.msg(T.cipherNo);inp.value="";o.bad()}};
  $("#cipB").onclick=go;inp.onkeydown=function(e){if(e.key==="Enter")go()};o.hint(function(){inp.value=w.slice(0,Math.min(w.length-1,(inp.value.length||0)+2));o.msg(w[0]+"…")})},
/* 8 pixels herstellen: wissel tegels tot Bit klopt */
pixelfix:function(o){var N=o.hard?4:3,cv=o.canvas(280),g=cv.getContext("2d"),src=document.createElement("canvas");src.width=src.height=240;var sg=src.getContext("2d");scanBg(sg,240,240,0);drawBit(sg,120,230,15,0);
  var order=[],i;for(i=0;i<N*N;i++)order.push(i);do{order=shuffle(order,o.rng)}while(order.every(function(v,k){return v===k}));var selI=-1,ts=240/N,cs=280/N;
  var draw=function(){g.fillStyle=C.ink;g.fillRect(0,0,280,280);order.forEach(function(src2,k){var sx=(src2%N)*ts,sy=Math.floor(src2/N)*ts,dx=(k%N)*cs,dy=Math.floor(k/N)*cs;g.drawImage(src,sx,sy,ts,ts,dx+1,dy+1,cs-2,cs-2);if(selI===k){g.strokeStyle=C.yel;g.lineWidth=4;g.strokeRect(dx+3,dy+3,cs-6,cs-6)}})};
  cv.onpointerdown=function(e){var p=o.at(e,cv),k=Math.floor(p[0]/cs)+Math.floor(p[1]/cs)*N;if(selI<0){selI=k}else{var t=order[selI];order[selI]=order[k];order[k]=t;selI=-1;o.hit();if(order.every(function(v,j){return v===j})){draw();o.good();o.done();return}}draw()};draw()},
/* 9 hack: tik als de balk in het groen is */
hack:function(o){var cv=o.canvas(200),g=cv.getContext("2d"),pos=10,dir=1,sp=o.hard?3.4:2.4,hits=0,miss=0,zone={x:0,w:o.hard?34:50};zone.x=60+o.rng()*140;
  var f=function(ts){if(o.dead())return;pos+=dir*sp;if(pos>=270){pos=270;dir=-1}else if(pos<=10){pos=10;dir=1}scanBg(g,280,200,ts);g.fillStyle="#334155";g.fillRect(10,90,260,30);g.fillStyle=C.green;g.fillRect(zone.x,90,zone.w,30);g.fillStyle="#fff";g.fillRect(pos-3,80,6,50);
    for(var i=0;i<5;i++){g.fillStyle=i<hits?C.yel:"#475569";g.fillRect(70+i*30,150,20,20)}mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  cv.onpointerdown=function(){if(pos>zone.x&&pos<zone.x+zone.w){hits++;o.hit();o.msg(fill(T.hackHit,{n:hits}));zone.x=40+o.rng()*180;sp+=.3;if(hits>=5){o.good();o.done()}}else{miss++;o.msg(T.hackMiss);if(miss%4===0)o.bad()}}},
/* 10 memory */
pairs:function(o){var n=o.hard?8:6,icons=shuffle(["bit","heart","coin","bomb","star","gl0","gl1","gl2"],o.rng).slice(0,n),cards=spreadPairs(shuffle(icons.concat(icons),o.rng),4,o.rng),open=[],found=0,lock=false;
  var face=function(k){return spriteURL(function(g){g.fillStyle=C.navy;g.fillRect(0,0,64,64);if(k==="bit")drawBit(g,32,60,4,0);else if(k[0]==="g"&&k.length===3)drawGlitch(g,32,58,4,{kleur:+k[2],ogen:+k[2],ant:+k[2]},0);else px(g,32,56,5,SPR[k],PAL)},64,64)};
  var U={};icons.forEach(function(k){U[k]=face(k)});
  var paint=function(){o.box.innerHTML='<div class="mem c'+(n>6?4:3)+'">'+cards.map(function(k,i){var on=open.indexOf(i)>=0||k===null;return '<button type="button" data-i="'+i+'" class="'+(on?"on":"")+(k===null?" out":"")+'">'+(on&&k?'<img src="'+U[k]+'" alt="">':'')+'</button>'}).join("")+'</div>';
    o.box.firstChild.onclick=function(e){var b=e.target.closest("button");if(!b||lock)return;var i=+b.dataset.i;if(cards[i]===null||open.indexOf(i)>=0)return;open.push(i);o.hit();paint();
      if(open.length===2){lock=true;mg.tm.push(setTimeout(function(){lock=false;if(cards[open[0]]===cards[open[1]]){found++;cards[open[0]]=cards[open[1]]=null;sfx("coin")}open=[];paint();if(found>=n){o.good();o.done()}},700))}}};paint()},
/* 11 ritme: blokjes op de beat */
rhythm:function(o){var cv=o.canvas(300),g=cv.getContext("2d"),N=o.hard?20:15,bpm=o.hard?120:100,beat=60000/bpm,notes=[],hit=0,miss=0,t0=performance.now()+1000,LN=[60,140,220];
  for(var i=0;i<N;i++)notes.push({t:t0+i*beat+(o.rng()<.3?beat/2:0),l:Math.floor(o.rng()*3),on:true});
  o.msg(fill(T.rhythmHit,{n:0,N:N}));var line=250,speed=.25;
  var f=function(ts){if(o.dead())return;scanBg(g,280,300,ts);LN.forEach(function(x,k){g.fillStyle="rgba(255,255,255,.06)";g.fillRect(x-30,0,60,300);g.fillStyle=[C.green,C.cyan,C.pink][k];g.fillRect(x-28,line-4,56,8)});
    notes.forEach(function(n){if(!n.on)return;var y=line-(n.t-ts)*speed;if(y>290){n.on=false;miss++;if(miss%5===0&&o.bad())return}if(y>-20)px(g,LN[n.l],y+10,4,SPR.coin,PAL)});
    if(notes.every(function(n){return !n.on})){o.good();o.done();return}mg.raf=requestAnimationFrame(f)};mg.raf=requestAnimationFrame(f);
  cv.onpointerdown=function(e){var p=o.at(e,cv),l=p[0]<100?0:p[0]<180?1:2,ts=performance.now(),best=null;notes.forEach(function(n){if(n.on&&n.l===l&&Math.abs(n.t-ts)<220&&(!best||Math.abs(n.t-ts)<Math.abs(best.t-ts)))best=n});
    tone(330+l*110,.1,"square",.05);if(best){best.on=false;hit++;o.hit();o.msg(fill(T.rhythmHit,{n:hit,N:N}))}}}
};

/* ---------- speurboekje, levels, menu ---------- */
function noteSheet(){var ev=[],lg=[],key=null;G.c.slots.forEach(function(s,i){if(!G.ph[i])return;if(s.kind==="ev"){var e=G.c.ev[s.e];ev.push('<div class="clue"><canvas class="evc" data-k="'+e.k+'" data-v="'+e.v+'" width="80" height="80"></canvas><div><em>'+esc(D.AT[e.k].n)+'</em><p>'+esc(fill(e.t,{v:D.AT[e.k].v[e.v]}))+'</p></div></div>')}else if(s.kind==="key")key=word();else lg.push('<p class="log">'+esc(s.t)+'</p>')});
  var achs=Object.keys(G.ach).map(function(k){return '<i>🏆 '+esc(T.ach[k][0])+'</i>'}).join("");
  sheet('<h2>'+T.notebook+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+crystalHTML(done())+(ev.length||lg.length||key?'<div class="eyebrow">'+T.nbE+'</div><div class="list">'+(ev.join("")||'<p class="note">–</p>')+'</div>'+(key?'<div class="eyebrow">'+T.nbK+'</div><b class="pw">'+esc(key)+'</b>':'')+'<div class="eyebrow">'+T.nbL+'</div>'+(lg.join("")||'<p class="note">–</p>'):'<p class="note">'+T.nbNone+'</p>')+(achs?'<div class="eyebrow">'+T.nbAch+'</div><div class="tags">'+achs+'</div>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  MW.bindCodeBox($("#sheetBody"),L);paintCrystal(done());$$("#sheetBody .evc").forEach(function(cv){evDraw(cv.getContext("2d"),cv.dataset.k,+cv.dataset.v)});$("#shX").onclick=closeSheet}
function lvlSheet(){sheet('<h2>'+T.people+'</h2><p class="note">'+T.peopleT+'</p><div class="lvlist big">'+G.c.slots.map(function(s,i){return '<span class="'+(G.ph[i]?"on":"")+'"><b>'+(i+1)+'</b>'+esc(T.kinds[s.act])+'</span>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet}
function menuSheet(){var onMap=G&&(G.mode==="map"||G.mode==="in");sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mBack+'</button><button type="button" class="btn ghost dk" id="mMus">'+(MUSIC?"🎵 ON":"🎵 OFF")+'</button>'+(onMap?'<button type="button" class="btn ghost dk" id="mNoMap">'+T.kv.mNoMap+'</button>':'')+'<button type="button" class="btn ghost dk" id="mHome">'+T.mHome+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="mBack")closeSheet();else if(i==="mMus"){MUSIC=!MUSIC;LS.set("ss_gl_music",MUSIC);$("#mMus").textContent=MUSIC?"🎵 ON":"🎵 OFF";if(MUSIC)music("map");else musicStop()}else if(i==="mNoMap"){closeSheet();dropMap()}else if(i==="mHome"){closeSheet();leavePlay();toast(T.saved)}else if(i==="mWipe")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame)}}

/* ---------- eindbaas ---------- */
function finaleGate(){if(!G)return;if(done()<NN())return noteSheet();if(G.boss>=3)return whoSheet();bossIntro()}
function bossIntro(){sheet('<div class="eyebrow">'+esc(T.twistH)+'</div><h2 class="big">'+esc(T.boss)+'</h2><canvas id="bC" class="endscene" width="320" height="200"></canvas>'+bubble(D.BIT.bossIntro,D.VILLAIN,"big",GLAV())+'<button type="button" class="btn red" id="bGo2">'+esc(T.bossGo)+'</button>',true);
  var cv=$("#bC"),g=cv.getContext("2d");(function f(ts){if(!cv.isConnected)return;if(!sceneBg(g,"scene-boss",320,200))scanBg(g,320,200,ts);drawGlitch(g,160,185,9,G.c.sus[G.c.K],ts);if(!still)requestAnimationFrame(f)})(0);
  sfx("boss");say(D.BIT.bossIntro);$("#bGo2").onclick=function(){closeSheet();boss()}}
function bossUI(){var ov=$("#hide");ov.hidden=false;ov.className="boss";$("#room").innerHTML="";var cv=$("#bossC");if(!cv){cv=document.createElement("canvas");cv.id="bossC";ov.insertBefore(cv,$("#room"))}cv.hidden=false;$("#room").hidden=true;music("boss");return cv}
function boss(){G.boss=G.boss||0;if(G.boss===0)bossP1();else if(G.boss===1)bossP2();else bossRoom()}
/* fase 1: pseudo-3D ontwijken */
function bossP1(){var cv=bossUI(),g=cv.getContext("2d"),w,h,dpr,px0=0,hearts=3,wave=0,bombs=[],t0=0,hitFlash=0,tilt=0,drag=null,fin=false,dmg=false;
  var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();$("#hideHint").textContent=T.bossP1;$("#hideMsg").textContent=fill(T.bossWave,{n:1});say(T.bossP1);
  var onO=function(e){if(e.gamma!=null)tilt=Math.max(-1,Math.min(1,e.gamma/25))};try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")DeviceOrientationEvent.requestPermission().then(function(r){if(r==="granted")addEventListener("deviceorientation",onO)}).catch(function(){});else addEventListener("deviceorientation",onO)}catch(e){}
  cv.onpointerdown=function(e){drag={x:e.clientX,p:px0}};cv.onpointermove=function(e){if(drag)px0=Math.max(-1,Math.min(1,drag.p+(e.clientX-drag.x)/(w*.3)))};cv.onpointerup=cv.onpointercancel=function(){drag=null};
  var q=rngOf(G.seed+5),spawnT=0,end=function(){fin=true;removeEventListener("deviceorientation",onO);cv.onpointerdown=null};
  var f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000;if(!drag&&tilt)px0=Math.max(-1,Math.min(1,px0+tilt*.05));
    g.setTransform(dpr,0,0,dpr,0,0);if(!sceneBg(g,"scene-boss",w,h))scanBg(g,w,h,ts);var hz=h*.45;
    /* Glitch aan de horizon */drawGlitch(g,w/2+Math.sin(t*1.3)*w*.2,hz+10,Math.max(4,w*.012),G.c.sus[G.c.K],ts);
    var rate=[1100,850,650][wave];if(ts-spawnT>rate){spawnT=ts;bombs.push({l:(q()-.5)*2,z:0})}
    var sp=(.35+wave*.1)*(hard()?1.25:1)/60;bombs.forEach(function(b){b.z+=sp});
    bombs.forEach(function(b){var z=b.z,sx=w/2+b.l*z*w*.55,sy=hz+z*z*(h-hz)*.78,s=2+z*z*10;px(g,sx,sy,s,SPR.bomb,PAL)});
    var pyy=h*.82,pxx=w/2+px0*w*.4;drawAvatar(g,pxx,pyy,Math.max(4,w*.013),G.av,ts);
    bombs=bombs.filter(function(b){if(b.z>=1){if(Math.abs(w/2+b.l*w*.55-pxx)<w*.09){hearts--;dmg=true;hitFlash=ts;buzz(150);sfx("hurt");$("#hideMsg").textContent=T.bossDmg}return false}return true});
    if(ts-hitFlash<200){g.fillStyle="rgba(255,59,59,.35)";g.fillRect(0,0,w,h)}
    for(var i=0;i<3;i++)px(g,30+i*34,h*.2,3,SPR.heart,i<hearts?PAL:{K:"#475569",R:"#334155"});
    g.fillStyle=C.green;g.font="700 12px 'Press Start 2P',monospace";g.textAlign="right";g.fillText(fill(T.bossWave,{n:wave+1}),w-16,h*.2);
    if(hearts<=0){end();$("#hideMsg").textContent=T.dead;say(T.dead);setTimeout(function(){if(G)bossP1()},1800);return}
    if(t>12*(wave+1)){wave++;if(wave>=3){end();if(!dmg)ach("boss");G.boss=1;save();sfx("clear");$("#hideMsg").textContent=T.bossWin1;say(T.bossWin1);setTimeout(bossP2,1500);return}$("#hideMsg").textContent=fill(T.bossWave,{n:wave+1});sfx("coin")}
    requestAnimationFrame(f)};requestAnimationFrame(f);
  $("#hideX").onclick=function(){end();musicStop();$("#hide").hidden=true;hush();back()}}
/* fase 2: teamaanval, meter vol met klappen (microfoon) of tikken */
function bossP2(){var cv=bossUI(),g=cv.getContext("2d"),w,h,dpr,meter=0,fin=false,mic=false,vol=0,last=0,t0=0;
  var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();$("#hideHint").textContent=T.bossP2;$("#hideMsg").textContent=T.bossTapP2;say(T.bossP2);
  var tracks=null;cv.onpointerdown=function(){meter=Math.min(100,meter+(hard()?2.5:4));sfx("hit");buzz(20)};
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){var a=ac();if(!a)return;tracks=st.getTracks();var src=a.createMediaStreamSource(st),an=a.createAnalyser();an.fftSize=512;src.connect(an);var buf=new Uint8Array(an.fftSize);mic=true;
    var iv=setInterval(function(){if(fin){clearInterval(iv);return}an.getByteTimeDomainData(buf);var s=0;for(var i=0;i<buf.length;i++){var v=(buf[i]-128)/128;s+=v*v}vol=Math.sqrt(s/buf.length);if(vol>.12&&performance.now()-last>120){last=performance.now();meter=Math.min(100,meter+(hard()?3:5))}},60)}).catch(function(){});
  var end=function(){fin=true;if(tracks)tracks.forEach(function(t){t.stop()});cv.onpointerdown=null};
  var f=function(ts){if(fin)return;if(!t0)t0=ts;meter=Math.max(0,meter-(hard()?.09:.06));g.setTransform(dpr,0,0,dpr,0,0);if(!sceneBg(g,"scene-boss",w,h))scanBg(g,w,h,ts);
    var sh=meter/100*14;drawGlitch(g,w/2+(Math.random()-.5)*sh,h*.62+(Math.random()-.5)*sh,Math.max(8,w*.03),G.c.sus[G.c.K],ts,1-meter/250);
    if(vol>.12||ts-last<120){for(var i=0;i<6;i++){g.fillStyle=[C.green,C.cyan,C.pink,C.yel][i%4];var a=i/6*6.28+ts/200;g.fillRect(w/2+Math.cos(a)*(60+meter),h*.5+Math.sin(a)*(60+meter),8,8)}}
    g.fillStyle="#1e293b";g.fillRect(w*.1,h*.86,w*.8,26);g.fillStyle=meter>70?C.green:meter>35?C.yel:C.pink;g.fillRect(w*.1+3,h*.86+3,(w*.8-6)*meter/100,20);g.strokeStyle="#fff";g.lineWidth=2;g.strokeRect(w*.1,h*.86,w*.8,26);
    drawAvatar(g,w*.2,h*.82,Math.max(4,w*.012),G.av,ts);drawBit(g,w*.8,h*.82,Math.max(4,w*.012),Math.floor(ts/150)%2,true);
    if(meter>=100){end();G.boss=2;save();sfx("clear");buzz([80,40,80,40,200]);$("#hideMsg").textContent=T.bossWin2;say(T.bossWin2);setTimeout(bossRoom,1500);return}
    requestAnimationFrame(f)};requestAnimationFrame(f);
  $("#hideX").onclick=function(){end();musicStop();$("#hide").hidden=true;hush();back()}}
/* fase 3: de Serverkamer (3D escape-room): stroom, kabel, terminal */
function bossRoom(){var ov=bossUI();$("#bossC").hidden=true;var room=$("#room");room.hidden=false;var R=T.room,st={power:false,cable:false,carry:false,ry:0},size=Math.max(360,Math.min(innerWidth,900));
  $("#hideHint").textContent=T.bossP3;$("#hideMsg").textContent=R.hint;say(T.bossP3);
  room.innerHTML='<div class="cube" style="--s:'+size+'px"><div class="wall w0"><div class="rack"></div><button type="button" class="obj sw" id="oSw"><i></i><b>'+esc(R.power)+'</b></button></div><div class="wall w1"><div class="rack"></div><button type="button" class="obj cable" id="oCb">🔌</button><button type="button" class="obj sock" id="oSk"><i></i></button></div><div class="wall w2"><div class="rack"></div><button type="button" class="obj term" id="oTm"><span class="scr">&gt; _</span><b>'+esc(R.term)+'</b></button></div><div class="wall w3"><div class="poster" id="oPo"><canvas width="160" height="200"></canvas><b>LEVEL 0</b></div><span class="zero">0</span></div></div>';
  var cube=room.firstChild,paint=function(){cube.style.setProperty("--ry",st.ry+"deg");room.classList.toggle("power",st.power);cube.querySelector("#oCb").hidden=st.cable||st.carry;cube.querySelector("#oSk").classList.toggle("on",st.cable)};paint();
  var pc=cube.querySelector("#oPo canvas"),g=pc.getContext("2d");scanBg(g,160,200,0);var mir=G.c.sus[(G.c.K+1)%4];drawGlitch(g,80,180,8,mir,0);g.fillStyle="rgba(0,0,0,.35)";g.fillRect(0,0,160,200);
  var drag=null;room.onpointerdown=function(e){drag={x:e.clientX,ry:st.ry}};room.onpointermove=function(e){if(!drag)return;st.ry=drag.ry+(e.clientX-drag.x)*.35;paint()};room.onpointerup=room.onpointercancel=function(e){if(drag&&Math.abs(e.clientX-drag.x)<6)tap(e.target);drag=null};
  var tap=function(el){var o=el.closest(".obj,.poster");if(!o)return;var id=o.id;
    if(id==="oSw"){st.power=true;sfx("boot");buzz(60);$("#hideMsg").textContent=R.power;paint()}
    else if(id==="oCb"){st.carry=true;sfx("hit");paint()}
    else if(id==="oSk"){if(st.carry){st.cable=true;st.carry=false;sfx("coin");$("#hideMsg").textContent=R.cable;paint()}}
    else if(id==="oPo"){$("#hideMsg").textContent=R.poster;say(R.poster)}
    else if(id==="oTm"){if(!st.power){$("#hideMsg").textContent=R.powerOff;sfx("bad");return}if(!st.cable){$("#hideMsg").textContent=R.cableOff;sfx("bad");return}termSheet()}};
  var termSheet=function(){var w=word();sheet('<div class="term2"><div class="eyebrow">'+esc(R.term)+'</div><div class="scr2"><p>LEVEL 0 // SERVER</p><p>'+esc(R.pw)+' <b id="tmV">_</b></p></div><div class="pad kb" id="kb">'+"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(function(c){return '<button type="button" class="key" data-d="'+c+'">'+c+'</button>'}).join("")+'<button type="button" class="key back" data-d="x">⌫</button><button type="button" class="key ok" data-d="ok">OK</button></div><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button></div>',true);
    var v="",paintV=function(){var e=$("#tmV");if(e)e.textContent=(v||"")+"_"};$("#shX").onclick=closeSheet;
    $("#kb").onclick=function(e){var b=e.target.closest(".key");if(!b)return;var d=b.dataset.d;if(d==="x")v=v.slice(0,-1);else if(d==="ok"){if(v===w){$("#tmV").textContent=v;sfx("clear");G.boss=3;save();$(".scr2").innerHTML='<p class="ok">'+esc(R.pwOk)+'</p>';setTimeout(function(){closeSheet();whoSheet()},1200)}else{sfx("bad");buzz(120);$(".scr2").classList.add("shake");setTimeout(function(){$(".scr2").classList.remove("shake")},500);toast(R.pwBad);v=""}}else if(v.length<w.length){v+=d;tone(600+v.length*40,.05,"square",.04)}paintV()}};
  $("#hideX").onclick=function(){musicStop();$("#hide").hidden=true;hush();back()}}
function back(){if(G.mode==="map"||G.mode==="demo"||G.mode==="in")chip();else render()}
/* wie is de echte Glitch: vier spiegelbeelden */
function whoSheet(){$("#hide").hidden=true;musicStop();var c=G.c,fin=false;
  sheet('<div class="eyebrow">'+esc(T.lineH)+'</div><h2>'+esc(T.whoH)+'</h2><p class="note">'+esc(T.whoT)+'</p><div class="who">'+c.sus.map(function(s,i){return '<button type="button" data-s="'+i+'"><canvas width="120" height="130"></canvas><div class="tags">'+ATK.map(function(k){return '<i>'+esc(D.AT[k].s[s[k]])+'</i>'}).join("")+'</div></button>'}).join("")+'</div><p class="pzst" id="whoM"></p><button type="button" class="btn ghost dk" id="shX">'+T.notebook+'</button>',true);
  $$("#sheetBody .who canvas").forEach(function(cv,i){var g=cv.getContext("2d");scanBg(g,120,130,0);drawGlitch(g,60,115,7,c.sus[i],0)});say(T.whoT);
  $("#shX").onclick=function(){noteSheet();$("#shX").onclick=function(){closeSheet();whoSheet()}};
  $("#sheetBody .who").onclick=function(e){var b=e.target.closest("button");if(!b||fin)return;G.tries++;save();if(+b.dataset.s===c.K){fin=true;b.classList.add("yes");sfx("win");buzz([100,50,300]);$("#whoM").textContent=T.whoYes;say(T.whoYes);setTimeout(choice,1500)}else{b.classList.add("shake");setTimeout(function(){b.classList.remove("shake")},600);$("#whoM").textContent=T.whoNo;say(T.whoNo);sfx("bad")}}}
function choice(){G.tEnd=G.tEnd||Date.now();save();
  sheet('<div class="eyebrow">'+esc(T.confess)+'</div><canvas id="endC" class="endscene" width="320" height="200"></canvas>'+bubble(D.BIT.end,D.VILLAIN,"big",GLAV())+'<p>'+esc(D.BIT.end2)+'</p><h2>'+esc(T.choiceH)+'</h2><div class="row2"><button type="button" class="btn red" id="eA">'+T.del+'</button><button type="button" class="btn" id="eB">'+T.patch+'</button></div>',true);
  var cv=$("#endC"),g=cv.getContext("2d");(function f(ts){if(!cv.isConnected)return;scanBg(g,320,200,ts);drawBit(g,110,180,8,0);drawGlitch(g,210,180,8,G.c.sus[G.c.K],ts);if(!still)requestAnimationFrame(f)})(0);say(D.BIT.end+" "+D.BIT.end2);
  var pick=function(k){G.end=k;ach("patch");save();var t=k==="A"?T.delT:T.patchT;sheet('<div class="eyebrow">'+esc(T.patch)+'</div>'+bubble(t,D.HERO,"big")+'<button type="button" class="btn" id="bPhoto">'+T.goOn+'</button>',true);say(t);$("#bPhoto").onclick=function(){closeSheet();finaleCine(function(){photoSheet("arrest",win)})}};
  $("#eA").onclick=function(){pick("A")};$("#eB").onclick=function(){pick("B")}}
function finaleCine(then){var ov=$("#cine"),cv=$("#cineC"),g=cv.getContext("2d"),txt=$("#cineT"),w,h,dpr,t0=0,fin=false,raf=0;ov.hidden=false;ov.classList.add("fin");
  var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();sfx("win");
  var lines=T.finCine,end=function(){if(fin)return;fin=true;cancelAnimationFrame(raf);hush();ov.hidden=true;ov.classList.remove("fin");then()};$("#cineX").onclick=end;
  var q=rngOf(G.seed+3),fw=[];for(var i=0;i<14;i++)fw.push({x:.1+q()*.8,y:.1+q()*.4,t:q()*8,c:[C.green,C.cyan,C.pink,C.yel][i%4]});
  var spoken=-1,f=function(ts){if(fin)return;if(!t0)t0=ts;var t=(ts-t0)/1000,ph=still?9:t,art=sceneBg(g,"scene-finale",w,h);if(!art)scanBg(g,w,h,ts);
    fw.forEach(function(p){var dt=(ph-p.t+8)%8;if(dt<0||dt>1.5)return;for(var k=0;k<10;k++){var a=k/10*6.28;g.fillStyle=p.c;g.globalAlpha=1-dt/1.5;g.fillRect(p.x*w+Math.cos(a)*dt*80,p.y*h+Math.sin(a)*dt*80+dt*dt*30,6,6)}g.globalAlpha=1});
    var s=Math.max(6,w*.02),gx=art?w*.5:w*.62,gy=art?h*.72:h*.75;if(!art){drawCrystal(g,w/2,h*.3,Math.min(70,w*.15),NN(),NN(),ts);drawBit(g,w*.38,h*.75,s,Math.floor(ts/150)%2)}drawGlitch(g,gx,gy,s,G.c.sus[G.c.K],ts);
    /* feestmuts op Glitch */g.fillStyle=C.red;g.beginPath();g.moveTo(gx-s*3,gy-s*10);g.lineTo(gx,gy-s*16);g.lineTo(gx+s*3,gy-s*10);g.fill();
    if(ph>2){var fs=Math.round(Math.min(40,w*.08));g.textAlign="center";if(art){g.fillStyle="rgba(11,13,34,.75)";g.fillRect(0,h*.5-fs*1.1,w,fs*2)}g.fillStyle=C.green;g.shadowColor=C.green;g.shadowBlur=18;g.font="700 "+fs+"px 'Press Start 2P',monospace";g.fillText(T.found,w/2,h*.5+fs*.4);g.shadowBlur=0}
    if(ph>6){g.fillStyle="#fff";g.font="700 14px 'Press Start 2P',monospace";g.fillText((NAME?NAME.toUpperCase()+" & ":"")+"TEAM",w/2,h*.92)}
    var li=Math.min(lines.length-1,Math.floor(ph/2.2));txt.textContent=lines[li];if(li!==spoken&&!still){spoken=li;say(lines[li])}
    if(ph>11&&!still)return end();raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f);if(still)setTimeout(end,4000)}

/* ---------- gewonnen: album, diploma ---------- */
var RES=null,TEAM=LS.get("ss_gl_team",""),CLUB=LS.get("ss_gl_club","");
function win(){if(window.MMP&&MMP.hasTreasure()&&!G.trDone){G.trDone=1;G.tEnd=G.tEnd||Date.now();save();return MMP.finale(win)}var c=G.c,min=((G.tEnd||Date.now())-G.t0)/60000,s2=G.tries===1,s3=(G.lost||0)<=NN(),stars=1+(s2?1:0)+(s3?1:0),xp=100+stars*50;
  var a=MW.profile.award({game:ID,xp:xp,stars:stars,gps:G.mode==="map",min:min,km:G.dist/1000,title:T.lvl[G.lvl||LEVEL]+" · "+T.lens[lenOf(NN())],code:G.code});
  if(G.daily){var p=MW.profile.get();p.games.gl.day=MW.today();MW.profile.save(p)}Wk.stopWatch();buzz([100,50,100,50,300]);musicStop();
  var tm=window.MMP?MMP.team():{i:-1,name:"",col:null};
  RES={ph:G.ph.slice(),team:G.team,arrest:G.arrest,album:(G.album||[]).map(function(x){return x.u}),code:G.code,stars:stars,min:Math.round(min),secs:Math.round(((G.tEnd||Date.now())-G.t0)/1000),v:vars(),seed:G.seed,n:NN(),lvl:G.lvl||LEVEL,tcol:tm.col,tname:tm.name,ach:Object.keys(G.ach),av:G.av,K:c.sus[c.K],xp:G.xp,tl:G.tl,coins:G.coins};
  sheet('<div class="eyebrow">'+T.won+' · '+esc(G.code)+'</div><div class="stars">'+starsHTML(stars)+'</div><h2>'+esc(T.found)+'</h2><canvas id="strip" width="1080" height="1350" class="stripc"></canvas><div class="tags"><i>'+Math.round(min)+' min</i><i>LVL '+G.tl+'</i><i>'+G.xp+' XP</i><i>'+RES.ach.length+' 🏆</i></div>'+(!s2?'<p class="note">'+T.missed1+'</p>':'')+(!s3?'<p class="note">'+T.missed2+'</p>':'')+
    '<button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#strip");drawAlbum(cv,RES);$("#vDip").onclick=dipSheet;$("#vShare").onclick=function(){shareAlbum(cv)};$("#vDl").onclick=function(){dlCanvas(cv,albumName())};$("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP)MMP.result($("#sheetBody"),{code:G.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function starsHTML(n){var s="";for(var i=0;i<3;i++)s+='<span class="'+(i<n?"on":"")+'">★</span>';return s}
function loadImgs(list,cb){var IMG={},left=list.filter(Boolean).length;if(!left)return cb(IMG);list.filter(Boolean).forEach(function(src){if(IMG[src]!==undefined){if(--left===0)cb(IMG);return}IMG[src]=null;var im=new Image();im.onload=im.onerror=function(){IMG[src]=im.width?im:null;if(--left===0)cb(IMG)};im.src=src})}
function polaroid(g,im,x,y,pw,phh,cap2,rot,font,withChars){var imgH=phh-pw*.34;g.save();g.translate(x+pw/2,y+phh/2);g.rotate(rot);g.translate(-pw/2,-phh/2);g.shadowColor="rgba(0,0,0,.5)";g.shadowBlur=18;g.shadowOffsetY=8;g.fillStyle="#fff";g.fillRect(0,0,pw,phh);g.shadowColor="transparent";
  var pad=pw*.06,iw=pw-2*pad;if(im){var s=Math.max(iw/im.width,imgH/im.height),w=im.width*s,h=im.height*s;g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();g.drawImage(im,pad+(iw-w)/2,pad+(imgH-h)/2,w,h);g.restore()}else{g.save();g.translate(pad,pad);scanBg(g,iw,imgH,0);drawAvatar(g,iw/2,imgH-10,imgH*.05,RES.av,0);g.restore()}
  if(withChars){g.save();g.beginPath();g.rect(pad,pad,iw,imgH);g.clip();drawBit(g,pad+iw*.14,pad+imgH-6,imgH*.04,0);drawGlitch(g,pad+iw*.86,pad+imgH-6,imgH*.04,RES.K,0);g.restore()}
  g.fillStyle="#1e293b";g.font=font;g.textAlign="center";g.fillText(cap2,pw/2,phh-pw*.1,pw-20);g.restore()}
function albumName(){return (L==="nl"?"glitch-album-":"glitch-album-")+RES.code+".jpg"}
function dlCanvas(cv,name){try{cv.toBlob(function(b){if(!b)return;var u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)},"image/jpeg",.88)}catch(e){toast(T.noFile)}}
function shareAlbum(cv){var txt=fill(T.shareTxt,{c:RES.code,s:"★".repeat(RES.stars),m:RES.min})+location.origin+location.pathname+"#z="+RES.code;cv.toBlob(function(b){var f=null;try{f=b&&new File([b],albumName(),{type:"image/jpeg"})}catch(e){}if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],text:txt}).catch(function(){})}else{dlCanvas(cv,albumName());toast(T.albumSaved)}},"image/jpeg",.88)}
function albumSheet(){if(!RES)return;sheet('<div class="eyebrow">'+esc(T.albumH)+'</div><canvas id="strip" width="1080" height="1350" class="stripc"></canvas><button type="button" class="btn" id="vShare">'+T.shareBtn+'</button><button type="button" class="btn ghost dk" id="vDl">'+T.dl+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button>',true);var cv=$("#strip");drawAlbum(cv,RES);$("#vShare").onclick=function(){shareAlbum(cv)};$("#vDl").onclick=function(){dlCanvas(cv,albumName())};$("#dBack").onclick=function(){closeSheet();winBack()}}
function drawAlbum(cv,r){var g=cv.getContext("2d"),W2=1080,pics=[{u:r.team,c:T.teamH}].concat((r.album||[]).map(function(u,i){return{u:u,c:T.poseH+" "+(i+1)}})).concat([{u:r.arrest,c:T.arrestH,ch:true}]),rows=Math.ceil(pics.length/2),PH=560,H=320+rows*PH+300;cv.width=W2;cv.height=H;
  loadImgs(pics.map(function(p){return p.u}),function(IMG){scanBg(g,W2,H,0);var q=rngOf(r.seed);for(var i=0;i<80;i++){g.fillStyle=[C.green,C.cyan,C.pink,C.yel][i%4];g.globalAlpha=.5;g.fillRect(q()*W2,q()*H,6,6)}g.globalAlpha=1;
    if(r.tcol){g.fillStyle=r.tcol;g.fillRect(0,40,W2,22);g.fillStyle="#fff";g.font="700 18px 'Nunito',sans-serif";g.textAlign="center";g.fillText(fill(T.albumTeam,{t:r.tname}).toUpperCase(),W2/2,58)}
    g.textAlign="center";g.fillStyle=C.green;g.shadowColor=C.green;g.shadowBlur=20;g.font="700 44px 'Press Start 2P',monospace";var ttl=r.v.J?fill(T.albumTitleJ,{J:r.v.J}):T.albumTitle;g.fillText(ttl,W2/2,150,W2-80);g.shadowBlur=0;
    g.fillStyle="#e0f2fe";g.font="600 28px 'Nunito',sans-serif";g.fillText(fill(T.albumSub,{c:r.code,m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars),l:T.lvl[r.lvl]||"",n:T.lens[lenOf(r.n)]||""}),W2/2,206,W2-60);
    g.fillStyle=C.yel;g.font="700 26px 'Nunito',sans-serif";g.fillText(fill(T.albumFound,{tl:r.tl,xp:r.xp,co:r.coins,a:r.ach.length}),W2/2,250,W2-80);
    var pw=440,ph=PH-50;pics.forEach(function(p,i){var col=i%2,row=Math.floor(i/2),alone=i===pics.length-1&&pics.length%2===1,x=alone?(W2-pw)/2:col?W2-80-pw:80,y=300+row*PH+(col?18:0);polaroid(g,IMG[p.u],x,y,pw,ph,p.c,(i%2?.03:-.03)*(row%2?-1:1),"700 30px 'Permanent Marker',cursive",!!p.ch)});
    var sy=300+rows*PH+30;drawCrystal(g,W2/2,sy+90,80,r.n,r.n,0);drawAvatar(g,120,H-40,14,r.av,0);drawBit(g,W2-200,H-40,14,0);drawGlitch(g,W2-90,H-40,12,r.K,0);
    g.fillStyle="#e0f2fe";g.font="600 24px 'Nunito',sans-serif";g.fillText(T.stripSub,W2/2,H-34)})}
function endCase(){LS.del(GK);G=null;hush();home()}
function dipSheet(){if(!RES)return;sheet('<h2>'+T.dipH+'</h2><p>'+T.dipClubT+'</p><input class="inp team" id="dClub" autocomplete="off" maxlength="40" placeholder="'+esc(T.dipClubP)+'" value="'+esc(CLUB)+'"><p>'+T.dipT+'</p><input class="inp team" id="dTeam" autocomplete="off" maxlength="120" placeholder="'+esc(T.dipP)+'" value="'+esc(TEAM)+'"><button type="button" class="btn" id="dGo">'+T.dipGo+'</button><button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){closeSheet();winBack()};$("#dGo").onclick=function(){TEAM=$("#dTeam").value.trim();CLUB=$("#dClub").value.trim().slice(0,40);LS.set("ss_gl_team",TEAM);LS.set("ss_gl_club",CLUB);dipShow()}}
function winBack(){var r=RES;sheet('<div class="eyebrow">'+T.won+' · '+esc(r.code)+'</div><h2>'+esc(T.found)+'</h2><button type="button" class="btn" id="vDip">'+T.dipBtn+'</button><button type="button" class="btn ghost dk" id="vAlb">📷 '+T.albumBtn+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  $("#vDip").onclick=dipSheet;$("#vAlb").onclick=albumSheet;$("#vHome").onclick=function(){closeSheet();endCase()};if(window.MMP&&RES.secs!=null)MMP.result($("#sheetBody"),{code:RES.code,secs:RES.secs,stars:RES.stars,back:winBack})}
function dipShow(){var r=RES;sheet('<div class="eyebrow">'+esc(T.dipH)+'</div><canvas id="dip" width="1240" height="1754" class="stripc a4"></canvas><p class="note">'+esc(T.dipNote)+'</p><button type="button" class="btn" id="dPdf">'+T.dipPdf+'</button><button type="button" class="btn ghost dk" id="dImg">'+T.dipImg+'</button><button type="button" class="btn ghost dk" id="dBack">'+T.back+'</button><button type="button" class="btn ghost dk" id="vHome">'+T.home+'</button>',true);
  var cv=$("#dip"),fname=L==="nl"?"diploma-level-complete":"level-complete-diploma";drawDiploma(cv,r);
  $("#dPdf").onclick=function(){var jpg=cv.toDataURL("image/jpeg",.9),blob=pdfFromJpeg(jpg,cv.width,cv.height),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=fname+"-"+r.code+".pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)};
  $("#dImg").onclick=function(){cv.toBlob(function(b){var f=b&&new File([b],fname+"-"+r.code+".jpg",{type:"image/jpeg"});if(f&&navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f]}).catch(function(){})}else{var a=document.createElement("a");a.href=cv.toDataURL("image/jpeg",.9);a.download=fname+"-"+r.code+".jpg";document.body.appendChild(a);a.click();a.remove()}},"image/jpeg",.9)};
  $("#dBack").onclick=function(){closeSheet();winBack()};$("#vHome").onclick=function(){closeSheet();endCase()}}
function names(g,team,y,W2,col){if(!team)return y;var list=team.split(/[,;]+/).map(function(s){return s.trim()}).filter(Boolean),line="",lines=[];g.font="700 36px 'Permanent Marker','Comic Sans MS',cursive";g.textAlign="center";
  list.forEach(function(nm){var t=line?line+"  ·  "+nm:nm;if(g.measureText(t).width>W2-260&&line){lines.push(line);line=nm}else line=t});if(line)lines.push(line);g.fillStyle=col;lines.slice(0,2).forEach(function(l){g.fillText(l,W2/2,y);y+=46});return y+10}
function drawDiploma(cv,r){var g=cv.getContext("2d"),W2=cv.width,H=cv.height,v=r.v,dateStr=new Date().toLocaleDateString(L==="nl"?"nl-NL":"en-GB",{day:"numeric",month:"long",year:"numeric"});
  loadImgs([r.team,r.arrest],function(IMG){g.fillStyle=C.ink;g.fillRect(0,0,W2,H);scanBg(g,W2,H,0);g.fillStyle="rgba(11,13,34,.55)";g.fillRect(0,0,W2,H);
    g.strokeStyle=C.green;g.lineWidth=8;g.strokeRect(60,60,W2-120,H-120);g.strokeStyle=C.cyan;g.lineWidth=3;g.strokeRect(84,84,W2-168,H-168);for(var i=0;i<4;i++){var cx=i%2?W2-110:110,cy=i<2?110:H-110;px(g,cx,cy+18,4,SPR.star,PAL)}
    drawCrystal(g,W2/2,230,90,r.n,r.n,0);
    g.textAlign="center";g.fillStyle=C.green;g.shadowColor=C.green;g.shadowBlur=24;g.font="700 64px 'Press Start 2P',monospace";g.fillText(T.dipTitle,W2/2,400);g.shadowBlur=0;
    g.fillStyle=C.cyan;g.font="600 22px 'Nunito',sans-serif";g.fillText(T.dipSub,W2/2,444);
    g.fillStyle="#e0f2fe";g.font="500 32px 'Nunito',sans-serif";g.fillText(T.dipL1,W2/2,520);
    g.fillStyle=C.yel;g.font="700 52px 'Press Start 2P',monospace";g.fillText(v.J?fill(T.dipL2,{J:v.J}):T.dipL2b,W2/2,600,W2-200);
    g.fillStyle="#e0f2fe";g.font="500 30px 'Nunito',sans-serif";g.fillText(T.dipL3,W2/2,660,W2-240);
    if(r.tcol){g.fillStyle=r.tcol;g.fillRect(92,680,W2-184,12);g.font="700 22px 'Nunito',sans-serif";g.fillText(fill(T.albumTeam,{t:r.tname}).toUpperCase(),W2/2,716)}
    var pw=300,phh=360,gap=60,x0=(W2-2*pw-gap)/2,y0=740;polaroid(g,IMG[r.team],x0,y0,pw,phh,T.teamH,-.03,"700 24px 'Permanent Marker',cursive",false);polaroid(g,IMG[r.arrest],x0+pw+gap,y0+14,pw,phh,T.arrestH,.03,"700 24px 'Permanent Marker',cursive",true);
    var y=y0+phh+70;g.fillStyle=C.yel;g.font="700 30px 'Nunito',sans-serif";g.fillText(fill(T.dipL4,{tl:r.tl,xp:r.xp,co:r.coins}),W2/2,y,W2-220);y+=44;
    g.fillStyle="#94a3b8";g.font="500 24px 'Nunito',sans-serif";g.fillText(fill(T.dipDate2,{d:dateStr,m:r.min,s:"★".repeat(r.stars)+"☆".repeat(3-r.stars),n:r.n,l:T.lens[lenOf(r.n)]||"",v:T.lvl[r.lvl]||""}),W2/2,y,W2-220);y+=50;
    if(r.ach.length){g.fillStyle=C.cyan;g.font="600 20px 'Nunito',sans-serif";g.fillText(T.dipAch,W2/2,y);y+=16;var per=3,bw=320,bh=46;r.ach.slice(0,9).forEach(function(k,i){var bx=W2/2+((i%per)-1)*(bw+20)-bw/2,by=y+Math.floor(i/per)*(bh+12);g.fillStyle="rgba(57,255,136,.12)";g.fillRect(bx,by,bw,bh);g.strokeStyle=C.green;g.lineWidth=2;g.strokeRect(bx,by,bw,bh);g.fillStyle="#fff";g.font="700 20px 'Nunito',sans-serif";g.fillText("🏆 "+T.ach[k][0],bx+bw/2,by+34,bw-20)});y+=Math.ceil(Math.min(9,r.ach.length)/per)*(bh+12)+22}
    if(CLUB){g.fillStyle=C.cyan;g.font="600 20px 'Nunito',sans-serif";g.fillText(T.dipClub,W2/2,y);y+=40;g.fillStyle="#fff";g.font="700 36px 'Nunito',sans-serif";g.fillText(CLUB,W2/2,y,W2-260);y+=30}
    if(TEAM&&y<H-210){g.fillStyle=C.cyan;g.font="600 20px 'Nunito',sans-serif";g.fillText(T.dipTeam,W2/2,y);y+=42;y=names(g,TEAM,y,W2,"#fff")}
    drawAvatar(g,180,H-130,11,r.av,0);drawBit(g,W2-260,H-130,11,0);drawGlitch(g,W2-150,H-130,9,r.K,0);
    g.save();g.translate(W2-200,H-96);g.rotate(-.08);g.fillStyle=C.pink;g.font="700 26px 'Press Start 2P',monospace";g.fillText(T.dipStamp,0,0);g.restore();
    var sy=H-96;g.strokeStyle=C.green;g.lineWidth=2;g.beginPath();g.moveTo(W2/2-260,sy);g.lineTo(W2/2+140,sy);g.stroke();g.fillStyle="#fff";g.font="700 40px 'Permanent Marker',cursive";g.fillText("Bit",W2/2-60,sy-12);g.fillStyle="#94a3b8";g.font="500 22px 'Nunito',sans-serif";g.fillText(T.dipSign,W2/2-60,sy+30);
    g.fillStyle="#94a3b8";g.font="500 20px 'Nunito',sans-serif";g.fillText(fill(T.dipFoot,{c:r.code}),W2/2,H-28)})}
function pdfFromJpeg(dataURL,w,h){var b64=dataURL.split(",")[1],bin=atob(b64),n=bin.length,img=new Uint8Array(n);for(var i=0;i<n;i++)img[i]=bin.charCodeAt(i);
  var PW=595.28,PH=841.89,enc=function(s){var u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u},parts=[],off=[],pos=0,push=function(u){parts.push(u);pos+=u.length};
  push(enc("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"));var objs=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+PW+" "+PH+"] /Resources << /XObject << /Im1 5 0 R >> >> /Contents 4 0 R >>"];
  var content="q "+PW+" 0 0 "+PH+" 0 0 cm /Im1 Do Q";objs.push("<< /Length "+content.length+" >>\nstream\n"+content+"\nendstream");objs.forEach(function(o,i){off[i+1]=pos;push(enc((i+1)+" 0 obj\n"+o+"\nendobj\n"))});
  off[5]=pos;push(enc("5 0 obj\n<< /Type /XObject /Subtype /Image /Width "+w+" /Height "+h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+n+" >>\nstream\n"));push(img);push(enc("\nendstream\nendobj\n"));
  var x=pos,xref="xref\n0 6\n0000000000 65535 f \n";for(i=1;i<=5;i++)xref+=String(off[i]).padStart(10,"0")+" 00000 n \n";push(enc(xref+"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+x+"\n%%EOF\n"));return new Blob(parts,{type:"application/pdf"})}

/* ---------- gamecode, archief, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}closeSheet();LEN=lenOf(p.n);LS.set("ss_gl_len",LEN);begin(p.seed,p.mode,false,p.n)};$("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function archSheet(){var g=MW.profile.get().games.gl,log=(g&&g.log)||[];sheet('<h2>'+T.aH+'</h2><div class="list">'+(log.map(function(x){return '<button type="button" class="sus" data-c="'+esc(x.c)+'"><b>'+esc(x.t)+'</b><small>'+esc(String(x.d).split("-").reverse().join("-"))+' · '+x.m+' min</small><div class="tags"><i>'+"★".repeat(x.st||0)+'</i><i>'+esc(x.c)+'</i></div></button>'}).join("")||'<p class="note">'+T.aNone+'</p>')+'</div>'+(log.length?'<p class="note">'+T.aTip+'</p>':'')+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>');
  $("#sheetBody").onclick=function(e){if(e.target.id==="shX"){closeSheet();return}var r=e.target.closest("[data-c]");if(r)codeSheet(r.dataset.c)}}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;$("#cfY").onclick=fn}
function leavePlay(){save();Wk.stopWatch();KM.leave();stopSteps();G=null;hush();home()}
function wipeGame(){LS.del(GK);Wk.stopWatch();KM.leave();stopSteps();G=null;closeSheet();home();toast(T.wiped)}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#sheetBody").onclick=function(e){var i=e.target.id;if(i==="shX")closeSheet();else if(i==="wG")confirmSheet(T.wipeQ,T.wipeT,T.wipeY,wipeGame);else if(i==="wA")confirmSheet(T.allQ,T.allT,T.allY,function(){LS.del(GK);MW.profile.wipe();if(/github\.io$/.test(location.hostname))LS.del(MW.pro.freeKey(ID));closeSheet();home();toast(T.wiped)})}}
function goBack(){if(!$("#hide").hidden){$("#hideX").click();return true}if(!$("#cine").hidden){$("#cineX").click();return true}
  if(!$("#sheet").hidden){if($("#sheet").dataset.lock){var x=$("#vHome")||$("#shX")||$("#bNext")||$("#pSkip")||$("#bPhoto")||$("#hjX")||$("#eB");if(x)x.click()}else closeSheet();return true}
  if(!$("#brief").hidden){G=null;home();return true}if(!$("#play").hidden||!$("#cards").hidden){leavePlay();toast(T.saved);return true}return false}
try{history.pushState({gl:1},"");addEventListener("popstate",function(){if(goBack()){try{history.pushState({gl:1},"")}catch(e){}}})}catch(e){}

/* ---------- startscherm: pixelstraat bij nacht, Bit rent, Glitch flikkert ---------- */
function hero(){var cv=$("#hero");if(!cv)return;var g=cv.getContext("2d"),w,h,dpr=1,bx=-60;function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr}rs();addEventListener("resize",rs);
  var q=rngOf(42),bl=[];for(var i=0;i<14;i++)bl.push({x:q(),w:.05+q()*.07,h:.08+q()*.14,win:Math.floor(q()*4)});
  function f(t){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);if($("#home").hidden){requestAnimationFrame(f);return}if(ok("hero")){document.getElementById("home").classList.add("photo");if(!still)requestAnimationFrame(f);return}var base=Math.min(h*.5,380);
    /* skyline */bl.forEach(function(b){var bw=b.w*w,bh=b.h*h,x=b.x*w;g.fillStyle="#1a1f4d";g.fillRect(x,base-bh,bw,bh);for(var k=0;k<b.win;k++){g.fillStyle=((t/700+k)|0)%5===0?C.navy:C.yel;g.fillRect(x+6+k*(bw/4),base-bh+12,6,8)}});
    g.fillStyle="#2b3566";g.fillRect(0,base,w,30);g.fillStyle=C.green;for(i=0;i<w;i+=40)g.fillRect(i+(t/20)%40,base+14,20,3);
    if(!still){bx+=1.6;if(bx>w+80)bx=-80}else bx=w*.5;drawBit(g,bx,base+6,5,Math.floor(t/120)%2);
    if(Math.sin(t/900)>.6){var gx=w*.75+(Math.random()-.5)*6;drawGlitch(g,gx,base+4,5,{kleur:0,ogen:1,ant:0},t,.85)}
    /* scanlines */g.fillStyle="rgba(0,0,0,.12)";for(var y=0;y<base+30;y+=3)g.fillRect(0,y,w,1);
    if(!still)requestAnimationFrame(f)}requestAnimationFrame(f)}
hero();
if(/debug/.test(location.search))window.GL_TEST={G:function(){return G},parse:parseCode,make:makeCode,gen:genCase,task:function(i){var sp=G.st&&G.st.filter(function(x){return x.fi===i})[0];taskSheet(i,sp||null)},word:word,boss:function(n){G.boss=n||0;boss()},who:whoSheet,draw:{bit:drawBit,glitch:drawGlitch,av:drawAvatar}};
/* ---------- start ---------- */
var hz=/[#&]z=([A-Z0-9]+)/i.exec(location.hash);
if(window.MMP)MMP.init({id:ID,fin:{nl:'Bit fluistert: er is nog een geheim level. Er ligt iets voor jullie verstopt, echt, niet op het scherm.',en:'Bit whispers: there is one more secret level. Something is hidden for you, for real, not on the screen.'}});
home();if(hz){var pc=parseCode(hz[1]);if(pc)codeSheet(hz[1].toUpperCase())}
MW.pro.ready.then(function(){if(!$("#home").hidden&&$("#sheet").hidden&&!G)home()});
})();
