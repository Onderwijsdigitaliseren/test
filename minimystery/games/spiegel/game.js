/* De Betoverde Toverspiegel / The Enchanted Mirror – feestspel voor binnen: de telefoon ís de toverspiegel. Spel-logica (taalonafhankelijk).
   Vereist platform.js, catalog.js, walk.js (vellen/toasts/geluid) en TS_DATA (data-xx.js). Geen GPS, niets te printen.
   Zaak: prinses Parel is een kikker. Zeven ingrediënten voor het Tegentoverdrankje, elk een sensor-opdracht (schudden, camera-kleur, kantelen, blazen, ritme, selfie, spreken).
   Tussendoor sporen van spiegelgeest Grimmel: kleur, hoed, ogen (per zaak geloot). Finale: kies Grimmel uit drie, blaas samen, Parel terug, kroning, diploma's.
   Niveaus: "elfje" (makkelijk) en "tovenaar" (pittiger: woordraadsel, één valse hint). Spiegelstanden: auto / silent (geen mic) / old (geen beweging) / tap. */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.TS_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="ts",GK="ss_game_ts_"+L,hashStr=MW.hashStr,rngOf=Wk.rngOf,shuffle=Wk.shuffle,toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz,beep=Wk.beep;
function closeSheet(){Wk.closeSheet()}
var G=null,LEVEL=LS.get("ss_ts_level","elfje"),NAME=LS.get("ss_ts_name",""),VOICE=LS.get("ss_ts_voice",true),KIDS=LS.get("ss_ts_kids",[]),SMODE=LS.get("ss_ts_smode","auto"),WHERE=LS.get("ss_ts_where","in"),LEN=LS.get("ss_ts_len","normaal"),ROUTE=LS.get("ss_ts_route","no");
var SENS={motion:false,mic:false,asked:false},mic=null,AC=null,cam=null;
var COLHEX=["#b794f6","#3ccfa8","#f4c20d"],COLDARK=["#7c4dd6","#15957a","#c99400"];
var mg={raf:0,tm:[],iv:[],ev:[],stop:function(){cancelAnimationFrame(this.raf);this.raf=0;this.tm.forEach(clearTimeout);this.tm=[];this.iv.forEach(clearInterval);this.iv=[];this.ev.forEach(function(e){e[0].removeEventListener(e[1],e[2])});this.ev=[];stopCam()},
  on:function(el,ev,fn){el.addEventListener(ev,fn);this.ev.push([el,ev,fn])},later:function(fn,ms){var t=setTimeout(fn,ms);this.tm.push(t);return t},every:function(fn,ms){var t=setInterval(fn,ms);this.iv.push(t);return t}};
function hard(){return LEVEL==="tovenaar"}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function useMotion(){return SENS.motion&&(SMODE==="auto"||SMODE==="silent")}
function useMic(){return SENS.mic&&(SMODE==="auto"||SMODE==="old")}
function useCam(){return SMODE!=="tap"&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)}
/* voorlezen */
if(window.MMVoice)MMVoice.init("spiegel",L);
function say(t){if(t)LASTSAY=t;if(!VOICE||!t)return;if(window.MMVoice)return MMVoice.say(String(t).replace(/<[^>]+>/g,""));try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(String(t).replace(/<[^>]+>/g,"").replace(/[“”"]/g,""));u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.92;u.pitch=1.05;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){var v=VOICE;VOICE=true;say(b.dataset.say);VOICE=v}});

/* ---------- plaatjes (Kellie's artwork, games/spiegel/img): als een plaatje er is, wint het van de SVG-tekening ---------- */
var IMGROOT=MW.root+"games/spiegel/img/",IM={};
["mira-talk","mira-happy","mira-shock","parel","parel-cheer","frog","frog-jump","grimmel-party","hero","crown","cauldron","ing-0","ing-1","ing-2","ing-3","ing-4","ing-6","room-bg","room-books","room-chest","room-chest-open","room-candle","room-lamp-off","room-lamp-on","room-door","room-door-open","room-frame","room-shard"].forEach(function(k){var im=new Image();im.src=IMGROOT+k+".webp";IM[k]=im});
function ok(k){var im=IM[k];return !!(im&&im.complete&&im.naturalWidth)}
function ingIco(k,cls){var key="ing-"+k;return ok(key)?'<img class="'+(cls||"ii")+'" src="'+IMGROOT+key+'.webp" alt="">':T.ing[k].e}
function pic(k,svg,cls){return ok(k)?'<img class="'+(cls||"fig")+'" src="'+IMGROOT+k+'.webp" alt="">':'<div class="'+(cls||"fig")+'">'+svg+'</div>'}
IM.hero.onload=function(){var h=$("#home");if(h&&IM.hero.naturalWidth)h.classList.add("photo")};

/* ---------- figuren (SVG) ---------- */
function svgGrimmel(col,hat,eyes,o){o=o||{};var c=o.sil?"#141126":COLHEX[col],d=o.sil?"#141126":COLDARK[col],ey=o.sil?"#f4c20d":"#fff";
  var eyeXs=eyes===1?[-18,0,18]:[-13,13],E=eyeXs.map(function(x){return '<ellipse cx="'+x+'" cy="-6" rx="7" ry="9" fill="'+ey+'"/>'+(o.sil?'':'<circle cx="'+(x+2)+'" cy="-5" r="3.5" fill="#1f2a44"/><circle cx="'+(x+3.2)+'" cy="-6.5" r="1.1" fill="#fff"/>')}).join("");
  var H="";if(o.party)H='<path d="M-14,-40 L0,-82 L14,-40 Z" fill="#ff6b6b" stroke="#1f2a44" stroke-width="2"/><circle cx="0" cy="-82" r="4" fill="#f4c20d"/><path d="M-14,-40 Q0,-48 14,-40" fill="none" stroke="#1f2a44" stroke-width="2"/>';
  else if(hat===0)H='<path d="M-20,-38 L4,-86 L22,-38 Z" fill="'+(o.sil?c:"#5b44b8")+'" stroke="#1f2a44" stroke-width="2"/><path d="M-26,-38 L28,-38" stroke="#1f2a44" stroke-width="3" stroke-linecap="round"/>'+(o.sil?'':'<circle cx="4" cy="-62" r="3" fill="#f4c20d"/>');
  else if(hat===1)H='<path d="M-22,-40 L-24,-66 L-11,-52 L0,-72 L11,-52 L24,-66 L22,-40 Z" fill="'+(o.sil?c:"#f4c20d")+'" stroke="#1f2a44" stroke-width="2"/>'+(o.sil?'':'<circle cx="0" cy="-72" r="3" fill="#ff6b6b"/><circle cx="-24" cy="-66" r="2.5" fill="#3ccfa8"/><circle cx="24" cy="-66" r="2.5" fill="#3ccfa8"/>');
  else H='<path d="M0,-44 L-24,-58 L-22,-36 Z M0,-44 L24,-58 L22,-36 Z" fill="'+(o.sil?c:"#ff6b6b")+'" stroke="#1f2a44" stroke-width="2"/><circle cx="0" cy="-44" r="5" fill="'+(o.sil?c:"#ff8fab")+'" stroke="#1f2a44" stroke-width="2"/>';
  var mouth=o.sil?'':(o.sad?'<path d="M-10,16 Q0,8 10,16" fill="none" stroke="#1f2a44" stroke-width="2.5" stroke-linecap="round"/>':'<path d="M-12,12 Q0,24 12,12" fill="none" stroke="#1f2a44" stroke-width="2.5" stroke-linecap="round"/><path d="M-20,8 a3,3 0 1,0 .1,0 M20,8 a3,3 0 1,0 .1,0" fill="#ff8fab" opacity=".7"/>');
  return '<svg viewBox="-60 -100 120 150" class="gr'+(o.cls?" "+o.cls:"")+'" aria-hidden="true"><g>'+
   '<path d="M-44,30 Q-58,-10 -36,-26 Q-40,-50 -14,-46 Q0,-60 16,-46 Q42,-50 38,-26 Q58,-8 42,30 Q30,48 10,38 Q0,46 -12,38 Q-32,48 -44,30 Z" fill="'+c+'" stroke="#1f2a44" stroke-width="'+(o.sil?0:2.5)+'"/>'+
   (o.sil?'':'<path d="M-30,10 Q-10,-2 10,8 Q24,2 34,12" fill="none" stroke="'+d+'" stroke-width="3" opacity=".5"/>')+H+E+mouth+
   '<path d="M-10,44 Q-14,62 -4,70 M8,44 Q14,60 4,72" fill="none" stroke="'+c+'" stroke-width="7" stroke-linecap="round"/></g></svg>'}
function svgFrog(o){o=o||{};return '<svg viewBox="-60 -70 120 110" class="frog'+(o.cls?" "+o.cls:"")+'" aria-hidden="true">'+
  '<ellipse cx="0" cy="18" rx="44" ry="24" fill="#4caf50" stroke="#1f2a44" stroke-width="2.5"/><ellipse cx="0" cy="24" rx="28" ry="14" fill="#a5d6a7"/>'+
  '<path d="M-44,26 Q-60,36 -40,40 M44,26 Q60,36 40,40" stroke="#1f2a44" stroke-width="2.5" fill="#4caf50"/>'+
  '<ellipse cx="0" cy="-10" rx="40" ry="26" fill="#4caf50" stroke="#1f2a44" stroke-width="2.5"/>'+
  '<circle cx="-20" cy="-30" r="12" fill="#4caf50" stroke="#1f2a44" stroke-width="2.5"/><circle cx="20" cy="-30" r="12" fill="#4caf50" stroke="#1f2a44" stroke-width="2.5"/>'+
  '<circle cx="-20" cy="-30" r="7" fill="#fff"/><circle cx="20" cy="-30" r="7" fill="#fff"/><circle cx="-18" cy="-29" r="3.5" fill="#1f2a44"/><circle cx="22" cy="-29" r="3.5" fill="#1f2a44"/>'+
  '<path d="M-16,-2 Q0,10 16,-2" fill="none" stroke="#1f2a44" stroke-width="2.5" stroke-linecap="round"/><circle cx="-26" cy="-4" r="4" fill="#ff8fab" opacity=".7"/><circle cx="26" cy="-4" r="4" fill="#ff8fab" opacity=".7"/>'+
  '<path d="M-16,-44 L-18,-64 L-8,-54 L0,-68 L8,-54 L18,-64 L16,-44 Z" fill="#f4c20d" stroke="#1f2a44" stroke-width="2"/><circle cx="0" cy="-68" r="3" fill="#ff6b6b"/></svg>'}
function svgParel(o){o=o||{};return '<svg viewBox="-60 -110 120 190" class="parel'+(o.cls?" "+o.cls:"")+'" aria-hidden="true">'+
  '<path d="M-44,70 Q-30,-10 0,-10 Q30,-10 44,70 Z" fill="#ff8fab" stroke="#1f2a44" stroke-width="2.5"/><path d="M-30,70 Q-20,20 0,20 Q20,20 30,70" fill="#ffb3c6"/>'+
  '<path d="M-28,-30 Q-40,-80 0,-86 Q40,-80 28,-30 Z" fill="#7a4a1e" stroke="#1f2a44" stroke-width="2.5"/>'+
  '<circle cx="0" cy="-46" r="22" fill="#f8d9b8" stroke="#1f2a44" stroke-width="2.5"/><path d="M-22,-52 Q-10,-78 0,-72 Q10,-78 22,-52" fill="#7a4a1e"/>'+
  '<circle cx="-8" cy="-48" r="3" fill="#1f2a44"/><circle cx="8" cy="-48" r="3" fill="#1f2a44"/><path d="M-7,-38 Q0,-32 7,-38" fill="none" stroke="#1f2a44" stroke-width="2" stroke-linecap="round"/><circle cx="-14" cy="-40" r="3" fill="#ff8fab" opacity=".7"/><circle cx="14" cy="-40" r="3" fill="#ff8fab" opacity=".7"/>'+
  (o.crown===false?'':'<path d="M-14,-78 L-16,-98 L-7,-88 L0,-102 L7,-88 L16,-98 L14,-78 Z" fill="#f4c20d" stroke="#1f2a44" stroke-width="2"/><circle cx="0" cy="-102" r="3" fill="#ff6b6b"/>')+
  (o.cheer?'<path d="M-30,-20 L-54,-60 M30,-20 L54,-60" stroke="#f8d9b8" stroke-width="9" stroke-linecap="round"/><path d="M-30,-20 L-54,-60 M30,-20 L54,-60" stroke="#1f2a44" stroke-width="2" fill="none"/>':'<path d="M-30,-10 L-50,30 M30,-10 L50,30" stroke="#f8d9b8" stroke-width="9" stroke-linecap="round"/>')+'</svg>'}
function svgMira(mood){var m=mood==="shock"?'<ellipse cx="0" cy="26" rx="8" ry="11" fill="#1f2a44"/>':mood==="happy"?'<path d="M-18,20 Q0,42 18,20" fill="#1f2a44"/>':'<path d="M-14,22 Q0,32 14,22" fill="none" stroke="#1f2a44" stroke-width="3" stroke-linecap="round"/>';
  return '<svg viewBox="-70 -70 140 140" class="mira" aria-hidden="true"><defs><radialGradient id="mg"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".7" stop-color="#cfd8ff" stop-opacity=".7"/><stop offset="1" stop-color="#8fa3ff" stop-opacity="0"/></radialGradient></defs>'+
  '<circle r="66" fill="url(#mg)"/><path d="M-26,-6 Q-18,-16 -8,-6 M8,-6 Q18,-16 26,-6" fill="none" stroke="#1f2a44" stroke-width="3" stroke-linecap="round"/>'+
  (mood==="shock"?'<circle cx="-17" cy="-4" r="5" fill="#1f2a44"/><circle cx="17" cy="-4" r="5" fill="#1f2a44"/>':'')+m+
  '<path d="M-40,-30 Q-30,-50 -10,-44 M40,-30 Q30,-50 10,-44" fill="none" stroke="#b794f6" stroke-width="4" stroke-linecap="round" opacity=".8"/></svg>'}
function svgCrown(){return '<svg viewBox="-30 -30 60 40" class="crown" aria-hidden="true"><path d="M-26,8 L-28,-18 L-14,-6 L0,-26 L14,-6 L28,-18 L26,8 Z" fill="#f4c20d" stroke="#1f2a44" stroke-width="2"/><circle cx="0" cy="-26" r="3.5" fill="#ff6b6b"/><circle cx="-28" cy="-18" r="3" fill="#3ccfa8"/><circle cx="28" cy="-18" r="3" fill="#3ccfa8"/></svg>'}
function svgHat(h,big){var s=big?' style="width:100px;height:100px"':'';
  if(h===0)return '<svg viewBox="-40 -60 80 70"'+s+'><path d="M-24,0 L0,-54 L24,0 Z" fill="#5b44b8" stroke="#1f2a44" stroke-width="2.5"/><path d="M-34,0 L34,0" stroke="#1f2a44" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="-30" r="4" fill="#f4c20d"/></svg>';
  if(h===1)return '<svg viewBox="-40 -60 80 70"'+s+'><path d="M-26,0 L-28,-34 L-14,-18 L0,-42 L14,-18 L28,-34 L26,0 Z" fill="#f4c20d" stroke="#1f2a44" stroke-width="2.5"/><circle cx="0" cy="-42" r="4" fill="#ff6b6b"/></svg>';
  return '<svg viewBox="-40 -60 80 70"'+s+'><path d="M0,-24 L-30,-44 L-26,-6 Z M0,-24 L30,-44 L26,-6 Z" fill="#ff6b6b" stroke="#1f2a44" stroke-width="2.5"/><circle cx="0" cy="-24" r="7" fill="#ff8fab" stroke="#1f2a44" stroke-width="2.5"/></svg>'}
function drawCrownOn(g,cx,top,w){if(ok("crown")){var im=IM.crown,h=w*im.naturalHeight/im.naturalWidth;g.drawImage(im,cx-w/2,top-h*.75,w,h);return}g.save();g.translate(cx,top);var s=w/60;g.scale(s,s);g.fillStyle="#f4c20d";g.strokeStyle="#1f2a44";g.lineWidth=2;g.beginPath();g.moveTo(-26,8);g.lineTo(-28,-18);g.lineTo(-14,-6);g.lineTo(0,-26);g.lineTo(14,-6);g.lineTo(28,-18);g.lineTo(26,8);g.closePath();g.fill();g.stroke();
  g.fillStyle="#ff6b6b";g.beginPath();g.arc(0,-26,3.5,0,7);g.fill();g.fillStyle="#3ccfa8";g.beginPath();g.arc(-28,-18,3,0,7);g.arc(28,-18,3,0,7);g.fill();g.restore()}

/* ---------- zaak ---------- */
function makeCase(seed){var r=rngOf(seed),c={col:Math.floor(r()*3),hat:Math.floor(r()*3),eyes:Math.floor(r()*2)};
  c.words=shuffle(D.WORDS,r).slice(0,3);c.order=[0].concat(shuffle([1,2,3,4],r)).concat([5,6]);
  c.digits=[3+Math.floor(r()*6),3+Math.floor(r()*5),2+Math.floor(r()*8)];c.lieTrue=r()<.5;c.lieCol=c.lieTrue?c.col:(c.col+1+Math.floor(r()*2))%3;
  /* finale: drie kandidaten, één klopt; de andere twee verschillen in 1 of 2 kenmerken */
  var alt=function(){var k={col:c.col,hat:c.hat,eyes:c.eyes},n=1+Math.floor(r()*2),keys=shuffle(["col","hat","eyes"],r).slice(0,n);keys.forEach(function(q){var m=q==="eyes"?2:3;k[q]=(k[q]+1+Math.floor(r()*(m-1)))%m});return k};
  var a=alt(),b=alt();while(b.col===a.col&&b.hat===a.hat&&b.eyes===a.eyes)b=alt();
  c.cands=shuffle([{col:c.col,hat:c.hat,eyes:c.eyes,ok:true},a,b],r);
  /* silhouetten bij ingrediënt 6: drie, met verschillende hoed/ogen */
  var s1={hat:(c.hat+1)%3,eyes:c.eyes},s2={hat:(c.hat+2)%3,eyes:1-c.eyes};c.sils=shuffle([{hat:c.hat,eyes:c.eyes,ok:true},s1,s2],r);
  c.hatOpts=shuffle([0,1,2],r);c.cseq=shuffle([0,1,2,3],r);c.r=r;return c}
/* zaakcode: TS + één letter voor niveau én lengte + seed (base36). E/T = Normaal (ook oude codes), K/L = Elfje kort/lang, S/V = Tovenaar kort/lang */
var CODEL={elfje:{kort:"K",normaal:"E",lang:"L"},tovenaar:{kort:"S",normaal:"T",lang:"V"}};
function caseCode(seed,len){return"TS"+CODEL[hard()?"tovenaar":"elfje"][len||"normaal"]+seed.toString(36).toUpperCase()}
function parseCode(v){var c=MW.norm(v);if(!/^TS[ETKLSV]/.test(c)||c.length<4||c.length>11)return null;var seed=parseInt(c.slice(3),36);if(!(seed>=0)||seed>4294967295)return null;
  var lv=null,ln=null;Object.keys(CODEL).forEach(function(a){Object.keys(CODEL[a]).forEach(function(b){if(CODEL[a][b]===c[2]){lv=a;ln=b}})});return{level:lv,len:ln,seed:seed}}
/* puzzelplan: per ingrediënt-positie (0..6) een lijstje puzzels. Positie 1, 3, 5 begint met een cijferpuzzel (antwoord = gouden cijfer).
   Kort 6, Normaal 8, Lang 12 puzzels; in Lang komt elk type precies één keer voor. */
var PDIG=["roses","flies","mirror","pond"],POTH=["stars","moons","memory","bells","sym","shadow","mime","ball"],KRING=["mime","ball"];
function makePlan(seed,len){var r=rngOf((seed^0x9A11)>>>0),d=shuffle(PDIG,r),o=shuffle(POTH.concat([d[3]]),r),nO=len==="lang"?9:len==="kort"?3:5;
  if(nO<9){var used=o.slice(0,nO);if(used.indexOf("mime")<0&&used.indexOf("ball")<0){var j=o.indexOf(r()<.5?"mime":"ball"),t=o[nO-1];o[nO-1]=o[j];o[j]=t}}
  var p=[],oi=0;for(var i=0;i<6;i++){var s=[i%2===1?d[(i-1)/2]:o[oi++]];if(len==="lang"||(len!=="kort"&&(i===2||i===4)))s.push(o[oi++]);p.push(s)}
  /* nooit twee kringspellen achter elkaar in één ingrediënt */
  p.forEach(function(s,i){if(s.length===2&&KRING.indexOf(s[0])>=0&&KRING.indexOf(s[1])>=0){for(var q=0;q<6;q++){var x=p[q];if(q!==i&&x.length===2&&KRING.indexOf(x[1])<0){var t=x[1];x[1]=s[1];s[1]=t;break}}}});
  p.push([]);return p}
function plan(){if(!G.plan||G.plan.length!==7)G.plan=makePlan(G.seed,G.len||"normaal");return G.plan}
/* opgeslagen voortgang opvangen: ontbrekende (nieuwe) velden aanvullen */
function revive(g){if(!g||!g.c)return null;g.c.r=rngOf((g.seed^0x77)>>>0);g.album=g.album||[];g.sj=g.sj||{};g.sjN=g.sjN||0;g.pot=g.pot||[];g.len=g.len||"normaal";g.pi=g.pi||0;g.wrong=g.wrong||0;g.skips=g.skips||0;g.who=g.who||{};g.cl=g.cl||{};
  if(!g.sjList)g.sjList=sjPlan(g.seed);if(!g.code)g.code=caseCode(g.seed,g.len);return g}
function vars(){var c=G.c;return{c:D.COLS[c.col],h:D.HATS[c.hat],o:D.EYES[c.eyes],w:c.words.join(" – "),j:NAME}}
function save(){if(G)LS.set(GK,G)}
function kid(i){var n=G.kids.length;return n?G.kids[(i+G.off)%n]:""}

/* ---------- start ---------- */
function home(){hush();mg.stop();$("#walk").hidden=true;cancelAnimationFrame(walkRaf);Wk.stopWatch();$$(".screen").forEach(function(s){s.hidden=true});$("#home").hidden=false;window.scrollTo(0,0);
  var p=MW.profile.get(),lk=MW.pro.locked(ID),pro=MW.pro.isPro(ID),g=LS.get(GK,null);
  $("#bGps").textContent=(lk?"🔒 ":"")+T.today;$("#bRandom").textContent=(lk?"🔒 ":"")+T.extra;$("#bPro").hidden=pro;$("#bPro").textContent=T.pro+" · "+MW.cfg.price;
  $("#bResume").hidden=!(g&&!g.done&&!g.demo);$("#status").textContent=MW.statusText(L,ID);
  $("#name").value=NAME;$("#kids").value=KIDS.join("\n");
  $$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.l===LEVEL)});$$("#where button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.w===WHERE)});$$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});$$("#route button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.r===ROUTE)});$("#bVoice").setAttribute("aria-pressed",VOICE);lenInfo();
  var bc=$("#bCode");if(bc)bc.innerHTML=esc(T.dBtn)+'<small class="bsub">'+esc(T.dWhere)+'</small>'}
function lenInfo(){var el=$("#lenInfo");if(el&&T.lenInfo)el.textContent=T.lenInfo[LEN]||""}
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#where").onclick=function(e){var b=e.target.closest("button");if(!b)return;WHERE=b.dataset.w;LS.set("ss_ts_where",WHERE);$$("#where button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})};
$("#route").onclick=function(e){var b=e.target.closest("button");if(!b)return;ROUTE=b.dataset.r;LS.set("ss_ts_route",ROUTE);$$("#route button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})};
$("#len").onclick=function(e){var b=e.target.closest("button");if(!b)return;LEN=b.dataset.n;LS.set("ss_ts_len",LEN);$$("#len button").forEach(function(x){x.setAttribute("aria-pressed",x===b)});lenInfo()};
$("#lvl").onclick=function(e){var b=e.target.closest("button");if(!b)return;LEVEL=b.dataset.l;LS.set("ss_ts_level",LEVEL);$$("#lvl button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})};
$("#name").oninput=function(){NAME=this.value.trim();LS.set("ss_ts_name",NAME)};
$("#kids").oninput=function(){KIDS=this.value.split(/\n|,/).map(function(s){return s.trim()}).filter(Boolean).slice(0,10);LS.set("ss_ts_kids",KIDS)};
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_ts_voice",VOICE);this.setAttribute("aria-pressed",VOICE);if(VOICE)say(T.wakeOk)};
$("#bHow").onclick=function(){var h=$("#howT");h.hidden=!h.hidden};
$("#bGps").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(hashStr("ts|"+LEVEL+"|"+MW.today()),false)};
$("#bRandom").onclick=function(){if(MW.pro.locked(ID))return proSheet();begin(Math.floor(Math.random()*4e9),false)};
$("#bDemo").onclick=function(){begin(Math.floor(Math.random()*4e9),true)};
$("#bPro").onclick=proSheet;$("#bCode").onclick=function(){codeSheet("")};$("#bWipe").onclick=wipeSheet;
$("#bResume").onclick=function(){var g=LS.get(GK,null);if(g&&g.level)LEVEL=g.level;G=revive(g);if(!G)return home();save();showPlay();wake(function(){if(G.ph==="room"&&G.room)return roomScreen();if(G.ph==="finale"||(G.room&&G.room.door))return finale();if(G.ph==="sj"||G.ph==="cliff")return after();step()})};
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};
$("#hub").href=MW.hubUrl(L);

function begin(seed,demo){if(!demo&&KIDS.length<2){toast(T.namesErr);$("#kids").focus();return}
  var kids=KIDS.length>=2?KIDS.slice():(L==="nl"?["Speurder 1","Speurder 2"]:["Sleuth 1","Sleuth 2"]);
  G={seed:seed,level:LEVEL,demo:!!demo,c:makeCase(seed),kids:kids,off:Math.floor(Math.random()*kids.length),i:0,pi:0,ph:"intro",pot:[],words:0,digits:0,photo:null,crown:null,t0:Date.now(),done:false,wrong:0,skips:0,where:WHERE,len:LEN,album:[],sj:{},sjN:0,who:{},cl:{}};G.sjList=sjPlan(seed);
  G.code=caseCode(seed,LEN);G.plan=makePlan(seed,LEN);save();
  var go=function(){showPlay();wake(function(){intro()})};/* de zaakcode staat in het menu/Speurboekje; geen apart scherm meer vooraf */
  if(ROUTE!=="walk")return go();
  Wk.loading(T.wk.loc);Wk.locate().then(function(pos){Wk.loading("");var lat=pos.coords.latitude,lon=pos.coords.longitude;G.walk={origin:{lat:lat,lon:lon,kx:111320*Math.cos(lat*Math.PI/180),ky:110540},st:KM.virtSpots(7).map(function(p,i){p.fi=i;p.done=false;return p}),mode:"map",virt:true,walked:{}};save();go()},
    function(){Wk.loading("");toast(T.wk.noGps);go()})}
/* ---------- wandelroute: voor elk ingrediënt eerst naar een plek in het Spiegelbos lopen (gps op de verhaalkaart) ---------- */
var KI=MW.KidsMap.icons,WP={x:0,y:0,acc:0},WSTART={x:500,y:1290},walkRaf=0,walkThen=null;
var WFP=[{x:230,y:1040,k:"padd"},{x:150,y:700,k:"vijver"},{x:330,y:480,k:"eik"},{x:560,y:330,k:"put"},{x:790,y:440,k:"brug"},{x:850,y:760,k:"hut"},{x:700,y:980,k:"poort"}];
var WROADS=[[-1,0],[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,-1],[0,2],[2,4],[1,3],[3,6]];
function wdTo(t){return Math.hypot(t.x-WP.x,t.y-WP.y)}
var KM=MW.KidsMap.create({host:"#walk",T:T.wk,G:function(){return G&&G.walk},P:function(){return WP},dTo:wdTo,virt:function(){return true},mode:function(){return "map"},
  map:{W:1000,H:1400,start:WSTART,spots:WFP,roads:WROADS,vsc:.4,sky:"#2a1d57",land:"#2f5a3f",road:"#9a7bd6",roadLine:"#e9d8ff",label:"#ffe9a8",labelHalo:"rgba(42,29,87,.9)",heroHalo:"rgba(183,148,246,.35)"},
  draw:{mark:function(g,x,y,r,col){g.save();g.fillStyle=col==="#fff"?"#ffe9a8":"rgba(255,233,168,.55)";g.shadowColor="#ffe9a8";g.shadowBlur=10;for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();g.fill();g.restore()},
    ground:function(g,t,still){g.fillStyle="#27503a";[[200,250,160],[760,900,200],[300,1150,140],[650,250,120]].forEach(function(e){g.beginPath();g.ellipse(e[0],e[1],e[2],e[2]*.5,0,0,7);g.fill()});
      g.fillStyle="#fff";for(var i=0;i<50;i++){g.globalAlpha=still?.6:.3+.6*Math.abs(Math.sin(t/600+i));g.beginPath();g.arc((i*173)%980+10,(i*97)%300+10,2,0,7);g.fill()}g.globalAlpha=1;g.fillStyle="#fff7c2";g.shadowColor="#fff";g.shadowBlur=30;g.beginPath();g.arc(880,120,36,0,7);g.fill();g.shadowBlur=0},
    decor:function(g){[[80,1180],[120,320],[420,160],[640,180],[920,300],[950,900],[940,1180],[300,1300],[700,1300],[420,900],[640,620],[90,520],[820,1080],[560,1130],[250,860],[480,560]].forEach(function(p,i){KI.tree(g,p[0],p[1],48+(i%3)*10,"#1f6b4a","#2a9a5a")});
      g.fillStyle="#b794f6";[[150,1100],[860,520],[400,300],[600,1000]].forEach(function(p){g.beginPath();g.arc(p[0],p[1],5,0,7);g.fill()})},
    start:function(g,x,y){g.fillStyle="#6b5b95";g.fillRect(x-110,y-110,220,110);g.fillStyle="#4b3f7a";[[-110],[-20],[70]].forEach(function(d){g.fillRect(x+d[0],y-150,40,40)});g.fillStyle="#2a1d57";g.beginPath();g.arc(x,y-30,34,Math.PI,0);g.fill();g.fillRect(x-34,y-30,68,30);g.fillStyle="#b794f6";g.shadowColor="#b794f6";g.shadowBlur=20;g.beginPath();g.ellipse(x,y-70,22,28,0,0,7);g.fill();g.shadowBlur=0},
    landmark:function(g,k,x,y,s){
      if(k==="padd"){g.fillStyle="#f5efe0";g.fillRect(x-s*.14,y-s*.6,s*.28,s*.6);g.fillStyle="#e63946";g.beginPath();g.ellipse(x,y-s*.6,s*.6,s*.35,0,Math.PI,0);g.fill();g.fillStyle="#fff";[[-.3,-.7],[.1,-.85],[.35,-.65]].forEach(function(q){g.beginPath();g.arc(x+q[0]*s,y+q[1]*s,s*.08,0,7);g.fill()})}
      else if(k==="vijver"){g.fillStyle="#3aa0e8";g.beginPath();g.ellipse(x,y-s*.1,s*.8,s*.4,0,0,7);g.fill();g.fillStyle="#6ec3ff";g.beginPath();g.ellipse(x-s*.2,y-s*.2,s*.3,s*.12,0,0,7);g.fill();g.fillStyle="#2a9d4b";g.beginPath();g.arc(x+s*.3,y-s*.1,s*.14,0,7);g.fill()}
      else if(k==="eik"){KI.tree(g,x,y,s*1.9,"#2a7a4a","#3f9a5a");g.fillStyle="#f4c20d";g.beginPath();g.arc(x+s*.1,y-s*1.3,s*.12,0,7);g.fill()}
      else if(k==="put"){g.fillStyle="#8a8f99";g.fillRect(x-s*.5,y-s*.4,s,s*.4);g.beginPath();g.ellipse(x,y,s*.5,s*.22,0,0,7);g.fill();g.fillStyle="#2a1d57";g.beginPath();g.ellipse(x,y-s*.4,s*.32,s*.14,0,0,7);g.fill();g.fillStyle="#8a5a2b";g.fillRect(x-s*.45,y-s*1.1,s*.08,s*.7);g.fillRect(x+s*.37,y-s*1.1,s*.08,s*.7);g.fillStyle="#b5461e";g.beginPath();g.moveTo(x-s*.6,y-s*1.05);g.lineTo(x,y-s*1.4);g.lineTo(x+s*.6,y-s*1.05);g.closePath();g.fill()}
      else if(k==="brug"){KI.bridge(g,x,y,s)}
      else if(k==="hut"){KI.house(g,x,y,s,"#5b4a3a","#3b2a14");g.fillStyle="#ffe9a8";g.fillRect(x-s*.42,y-s*.5,s*.2,s*.18);g.fillRect(x+s*.22,y-s*.5,s*.2,s*.18)}
      else if(k==="poort"){g.fillStyle="#6b5b95";g.fillRect(x-s*.7,y-s*1.1,s*.3,s*1.1);g.fillRect(x+s*.4,y-s*1.1,s*.3,s*1.1);g.fillRect(x-s*.7,y-s*1.2,s*1.4,s*.2);g.fillStyle="#2a1d57";g.beginPath();g.arc(x,y-s*.4,s*.38,Math.PI,0);g.fill();g.fillRect(x-s*.38,y-s*.4,s*.76,s*.4)}},
    hero:function(g,x,y){g.fillStyle="#b794f6";g.shadowColor="#b794f6";g.shadowBlur=22;g.beginPath();g.ellipse(x,y-26,20,26,0,0,7);g.fill();g.shadowBlur=0;g.fillStyle="#2a1d57";g.beginPath();g.arc(x-7,y-30,3,0,7);g.arc(x+7,y-30,3,0,7);g.fill()},
    runner:function(g,fx,fy,t,still){g.save();g.globalAlpha=still?.8:.5+.4*Math.abs(Math.sin(t/400));var a=t/2200,px=fx+Math.cos(a)*80,py=fy+30+Math.sin(a*.7)*40;g.fillStyle="#141126";g.beginPath();g.ellipse(px,py-20,16,24,0,0,7);g.fill();g.fillStyle="#f4c20d";g.beginPath();g.arc(px-5,py-26,3,0,7);g.arc(px+5,py-26,3,0,7);g.fill();g.restore()}}});
KM.mount();
function walkTo(i,then){var w=G.walk,sp=w.st[i];if(!sp||sp.done)return then();walkThen=then;WP={x:WP.x,y:WP.y,acc:0};
  w.st.forEach(function(s,j){s.done=j<i});
  $("#walk").hidden=false;$("#wkTitle").textContent=fill(T.wk.title,{i:i+1,p:T.wk.fp[KM.fk(sp)]});$("#wkAt").textContent=T.wk.at;
  KM.enter({kids:true,virt:true});Wk.stopWatch();Wk.watch(w.origin,WP,function(d){KM.moved(d)});
  var t=fill(T.wk.go,{p:T.wk.fp[KM.fk(sp)]});say(t);toast(t);
  var loop=function(ts){if($("#walk").hidden)return;KM.draw(ts);if(wdTo(sp)<=Math.max(35,Math.min(WP.acc||0,60))){arrive(i);return}walkRaf=requestAnimationFrame(loop)};walkRaf=requestAnimationFrame(loop)}
function arrive(i){cancelAnimationFrame(walkRaf);Wk.stopWatch();KM.leave();var w=G.walk;w.st[i].done=true;w.st[i].doneAt=Date.now();w.walked[i]=1;w.kd0=null;save();buzz([80,60,80]);beep(660,.2);$("#walk").hidden=true;var th=walkThen;walkThen=null;if(th)th()}
$("#wkAt").onclick=function(){var i=G&&G.walk&&G.walk.st.filter(function(s){return !s.done})[0];if(i)arrive(i.fi)};
$("#wkBack").onclick=function(){cancelAnimationFrame(walkRaf);Wk.stopWatch();KM.leave();$("#walk").hidden=true;walkThen=null;home()};
/* bij de start: de zaakcode, met uitleg (nog eens spelen / tweede telefoon) */
function codeIntro(){glass('<div class="talk codeI"><span class="eyebrow">🔮 '+esc(T.lvlN[G.level]+" · "+T.lenN[G.len])+'</span><h2>'+esc(T.codeH)+'</h2>'+MW.codeBox(L,G.code,"zaak")+'<p class="note">'+esc(T.codeAgain)+'</p><button type="button" class="btn big" id="nx">'+T.next+'</button></div>');
  MW.bindCodeBox($("#glass"),L);say(T.codeH+". "+T.codeAgain);$("#nx").onclick=intro}
function showPlay(){$$(".screen").forEach(function(s){s.hidden=true});$("#play").hidden=false;window.scrollTo(0,0);pot();
  var tm=window.MMP&&MMP.team(),h=$("#hudT");if(h)h.remove();if(tm&&tm.col){var e=document.createElement("i");e.id="hudT";e.style.background=tm.col;e.title=tm.name;$("#hud").insertBefore(e,$("#hud").firstChild)}}

/* ---------- sensoren wakker maken (één gebaar voor iOS-toestemmingen) ---------- */
function wake(then){if(SENS.asked||SMODE==="tap")return then();
  glass('<div class="talk">'+pic("mira-talk",svgMira("talk"),"av")+'<h2>'+T.wakeH+'</h2><p>'+T.wakeT+'</p><button type="button" class="btn big" id="wk">'+T.wake+'</button></div>');say(T.wakeT);
  $("#wk").onclick=function(){SENS.asked=true;var b=this;b.disabled=true;var jobs=[];
    if(typeof DeviceMotionEvent!=="undefined"&&typeof DeviceMotionEvent.requestPermission==="function"){jobs.push(DeviceMotionEvent.requestPermission().then(function(s){SENS.motion=s==="granted"},function(){SENS.motion=false}))}
    else{jobs.push(new Promise(function(res){var got=false,h=function(e){if(e.accelerationIncludingGravity&&e.accelerationIncludingGravity.x!=null)got=true};window.addEventListener("devicemotion",h);setTimeout(function(){window.removeEventListener("devicemotion",h);SENS.motion=got||!!window.DeviceOrientationEvent&&/Android|iPhone|iPad/i.test(navigator.userAgent);res()},900)}))}
    if(SMODE!=="silent"&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){jobs.push(navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){mic=s;SENS.mic=true;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var src=AC.createMediaStreamSource(s);mic.an=AC.createAnalyser();mic.an.fftSize=1024;src.connect(mic.an)}catch(e){SENS.mic=false}},function(){SENS.mic=false}))}
    Promise.all(jobs).then(function(){buzz([60,40,120]);beep(660,.15);setTimeout(function(){beep(990,.3)},160);var m=[T.wakeOk,SENS.motion?T.wakeMotion:T.wakeNoMotion,SENS.mic?T.wakeMic:T.wakeNoMic];toast(m.join(" "));say(m.join(" "));setTimeout(then,900)})}}
function micLevel(){if(!mic||!mic.an)return 0;var a=new Uint8Array(mic.an.fftSize);mic.an.getByteTimeDomainData(a);var s=0;for(var i=0;i<a.length;i++){var v=(a[i]-128)/128;s+=v*v}return Math.sqrt(s/a.length)}
function micLow(){if(!mic||!mic.an)return 0;var a=new Uint8Array(mic.an.frequencyBinCount);mic.an.getByteFrequencyData(a);var s=0,n=Math.min(24,a.length);for(var i=1;i<n;i++)s+=a[i];return s/(n-1)/255}
function startCam(facing){stopCam();if(!useCam())return Promise.reject("nocam");return navigator.mediaDevices.getUserMedia({video:{facingMode:facing||"environment",width:{ideal:960}},audio:false}).then(function(s){cam=s;cam.facing=facing||"environment";return s})}
function stopCam(){if(cam){cam.getTracks().forEach(function(t){t.stop()});cam=null}}

/* ---------- scherm ---------- */
function glass(html){mg.stop();curSkip=null;var g=$("#glass");g.innerHTML=html;g.scrollTop=0;$("#hudN").textContent=G?(G.i<7?(G.i+1)+"/7":"7/7"):"";}
function pot(){var el=$("#pot");if(!el||!G)return;var ings=T.ing;el.innerHTML=G.c.order.map(function(k,i){var full=G.pot.indexOf(k)>=0;return '<i class="'+(full?"on":"")+'" title="'+esc(ings[k].n)+'">'+(full?ingIco(k):"")+'</i>'}).join("")+'<b>'+(G.pot.length)+'/7</b>'}
function talk(lines,then,who){var i=0,av=who||"mira-talk";var show=function(){if(i>=lines.length)return then();var t=lines[i++];
  glass('<div class="talk">'+(av==="frog"?pic("frog",svgFrog(),"av"):av==="cauldron"?pic("cauldron",svgFrog(),"av"):av==="grimmel"?'<div class="av">'+svgGrimmel(G.c.col,G.c.hat,G.c.eyes,{sad:true})+'</div>':av==="parel"?pic("parel-cheer",svgParel({cheer:true}),"av"):pic(av,svgMira(av==="mira-shock"?"shock":av==="mira-happy"?"happy":"talk"),"av"))+'<p class="big">'+esc(t)+'</p><button type="button" class="btn" id="nx">'+T.next+'</button></div>');
  say(t);$("#nx").onclick=show};show()}
function intro(){G.ph="intro";save();
  talk([T.in1+" "+T.in2],function(){talk([T.in3],function(){talk([T.in4],function(){talk([T.in5+" "+T.in6],function(){buzz(40);G.ph="pass";G.i=0;save();step()},"mira-talk")},"frog")},"mira-shock")},"mira-shock")}
function step(){if(G.done)return finish();if(G.i>=7)return G.room&&G.room.door?finale():room();if(G.demo&&G.i>=2)return demoEnd();
  if(G.ph==="intro")return intro();var k=G.c.order[G.i],ing=T.ing[k],who=kid(G.i);
  if(G.walk&&!G.walk.walked[G.i]&&G.pot.indexOf(k)<0)return walkTo(G.i,step);
  if(G.pot.indexOf(k)>=0)return after();/* ingrediënt al in de ketel (na herladen) */
  G.who[G.i]=who;save();
  glass('<div class="talk pass"><span class="eyebrow">'+esc(ing.e+" "+ing.n)+'</span><h2>'+esc(T.passH)+'</h2><div class="who">'+esc(who)+'</div><p>'+esc(T.passT)+'</p><button type="button" class="btn big" id="pk">'+esc(T.passOk)+'</button></div>');
  say(T.passH+" "+who+". "+T.passT);if(G.i>0)taunt();$("#pk").onclick=function(){buzz(30);task(k)}}
function task(k){G.ph="task";G.pi=0;save();var ing=T.ing[k];hush();
  var fn=[tSterren,tRood,tDruppel,tMist,tRitme,tSelfie,tSpreuk][k];fn(ing,function(){runPuzzles(function(){won(k)})})}
function won(k){mg.stop();var ing=T.ing[k];if(G.pot.indexOf(k)<0)G.pot.push(k);var pos=G.c.order.indexOf(k);
  /* woord/cijfer meteen vastleggen, zodat herladen niets kwijtraakt */var gw=null,gd=null;if(pos===0||pos===2||pos===4){gw=G.c.words[G.words];G.words=Math.min(3,G.words+1)}else if(pos===1||pos===3||pos===5){gd=G.c.digits[G.digits];G.digits=Math.min(3,G.digits+1)}G.ph="won";save();beep(660,.15);setTimeout(function(){beep(880,.15)},150);setTimeout(function(){beep(1320,.3)},300);buzz([60,40,60,40,160]);pot();
  var clue=fill(ing.clue,vars());
  glass('<div class="talk"><div class="burst">'+ingIco(k,"bi")+'</div><h2>'+esc(ing.done)+'</h2>'+pic("mira-happy",svgMira("happy"),"av sm")+'<p class="big">'+esc(clue)+'</p><button type="button" class="btn" id="nx">'+T.next+'</button></div>');
  say(ing.done+" "+clue);
  $("#nx").onclick=function(){if(gw!=null)wordGet(gw,after);else if(gd!=null)digitGet(gd,after);else after()}}
function wordGet(w,then){
  glass('<div class="talk"><p>'+esc(T.wordGet)+'</p><div class="word">'+esc(w)+'</div><p class="note">'+esc(T.wordsSoFar)+' '+esc(G.c.words.slice(0,G.words).join(" · "))+'</p><p class="why">'+esc(T.wordWhy)+'</p><button type="button" class="btn" id="nx">'+T.next+'</button></div>');
  say(T.wordGet+" "+w+". "+T.wordWhy);$("#nx").onclick=then}
function after(){var per=G.len==="lang"?2:G.len==="kort"?0:1,doneHere=G.sj[G.i]||0;if(G.sjList&&doneHere<per){G.sj[G.i]=doneHere+1;save();return photoHunt(G.sjList[G.sjN++],after)}
  if(G.i<6&&!G.cl[G.i]){G.cl[G.i]=1;G.ph="cliff";save();return cliff(G.i,after)}
  G.i++;G.pi=0;G.ph="pass";save();
  /* Tovenaar: één valse hint van Grimmel, na ingrediënt 5 (vlak voor de selfie) */
  if(hard()&&G.i===5&&!G.lied){G.lied=1;save();var t=fill(T.lie,{c:D.COLS[G.c.lieCol]});glass('<div class="talk"><div class="av">'+svgGrimmel(G.c.col,G.c.hat,G.c.eyes,{sil:true})+'</div><p class="big whisper">'+esc(t)+'</p><button type="button" class="btn" id="nx">'+T.next+'</button></div>');say(t);$("#nx").onclick=step;return}
  step()}

/* cliffhanger na elk ingrediënt: de spiegel trilt, Grimmel of Mira zegt iets spannends (nooit eng) */
function cliff(i,then){var t=T.cliff[i]||"";if(!t)return then();var gr=i%2===0;
  glass('<div class="talk cliff"><div class="av rumble">'+(gr?svgGrimmel(G.c.col,G.c.hat,G.c.eyes,{sil:true}):pic("mira-shock",svgMira("shock"),"av"))+'</div><span class="eyebrow">'+esc(T.cliffE)+'</span><p class="big">'+esc(t)+'</p><button type="button" class="btn" id="nx">'+T.next+'</button></div>');
  $("#glassWrap").classList.remove("shake");void $("#glassWrap").offsetWidth;$("#glassWrap").classList.add("shake");beep(196,.25);setTimeout(function(){beep(233,.25)},220);buzz([40,60,40]);say(t);$("#nx").onclick=then}
/* ---------- 1. sterrenstof: schudden ---------- */
function tSterren(ing,done){var motion=useMotion(),need=100,v=0,last=null,lastT=0;
  glass(taskHead(ing,motion?ing.t:ing.tt)+'<div class="jar"><div class="fill" id="jf"></div><div class="stars" id="js"></div></div>'+(motion?'<p class="note" id="jm">'+esc(T.tilt)+'</p>':'<button type="button" class="btn big" id="jt">✨ '+esc(T.beat)+'</button>')+helpBtn());
  say(motion?ing.t:ing.tt);var upd=function(){$("#jf").style.height=Math.min(100,v)+"%";if(v>=need){done()}};
  var add=function(d){v+=d;if(Math.random()<.3)spark();upd()};
  var spark=function(){var s=document.createElement("i");s.style.left=(10+Math.random()*80)+"%";s.style.top=(10+Math.random()*60)+"%";$("#js").appendChild(s);mg.later(function(){s.remove()},800)};
  if(motion){mg.on(window,"devicemotion",function(e){var a=e.accelerationIncludingGravity||e.acceleration;if(!a)return;var m=Math.hypot(a.x||0,a.y||0,a.z||0);if(last==null){last=m;return}var d=Math.abs(m-last);last=m;var now=Date.now();
    if(d>28){if(now-lastT>800){lastT=now;v=Math.max(0,v-18);toast(T.shakeHard);buzz(150);upd()}}else if(d>4){add(d*.35)}})}
  else{$("#jt").onclick=function(){add(6+Math.random()*4);buzz(10)}}
  bindHelp(done)}
/* ---------- 2. rozenblaadjes: camera-kleurenjacht (rood) ---------- */
function tRood(ing,done){var canCam=useCam();
  if(!canCam)return roodTap(ing,done);
  glass(taskHead(ing,ing.t)+'<div class="camwrap"><video id="cv" playsinline autoplay muted></video><div class="ring" id="ring"><b>'+esc(T.red)+'</b></div></div><p class="note" id="cm">'+esc(T.ringFill)+'</p>'+helpBtn());
  say(ing.t);startCam("environment").then(function(s){var vd=$("#cv");vd.srcObject=s;var cv=document.createElement("canvas"),g=cv.getContext("2d",{willReadFrequently:true}),held=0,tLast=0;
    var loop=function(){mg.raf=requestAnimationFrame(loop);if(!vd.videoWidth)return;cv.width=48;cv.height=48;var w=vd.videoWidth,h=vd.videoHeight,m=Math.min(w,h)*.3;g.drawImage(vd,(w-m)/2,(h-m)/2,m,m,0,0,48,48);var d=g.getImageData(0,0,48,48).data,n=0,hit=0;
      for(var i=0;i<d.length;i+=16){var r=d[i],gg=d[i+1],b=d[i+2],mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),sat=mx?(mx-mn)/mx:0;n++;if(mx>60&&sat>.42&&r>gg*1.45&&r>b*1.45)hit++}
      var now=performance.now(),dt=tLast?now-tLast:16;tLast=now;if(hit/n>.35)held=Math.min(1500,held+dt);else held=Math.max(0,held-dt*1.5);
      $("#ring").style.setProperty("--p",(held/1500*360)+"deg");if(held>=1500){cancelAnimationFrame(mg.raf);stopCam();done()}};loop()},function(){roodTap(ing,done)});
  bindHelp(done)}
function roodTap(ing,done){var items=shuffle([["🍎","red"],["🫐","blue"],["🍌","yellow"],["🥦","green"],["🍇","purple"],["🧡","orange"]],G.c.r);
  glass(taskHead(ing,ing.tt)+'<div class="room">'+items.map(function(it){return '<button type="button" data-c="'+it[1]+'">'+it[0]+'</button>'}).join("")+'</div>'+helpBtn());say(ing.tt);
  $(".room").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.dataset.c==="red"){done()}else{toast(T.wrong);buzz(80);b.classList.add("no")}};bindHelp(done)}
/* ---------- 3. maanwater: kantel-doolhof ---------- */
function tDruppel(ing,done){var motion=useMotion(),W=7,H=9,r=rngOf(G.seed^0x5151);
  /* doolhof (recursive backtracker) */var cells=[];for(var i=0;i<W*H;i++)cells.push({v:false,w:[true,true,true,true]});/* N E S W */
  var stack=[0];cells[0].v=true;while(stack.length){var c=stack[stack.length-1],cx=c%W,cy=Math.floor(c/W),nb=[];
    if(cy>0&&!cells[c-W].v)nb.push([c-W,0,2]);if(cx<W-1&&!cells[c+1].v)nb.push([c+1,1,3]);if(cy<H-1&&!cells[c+W].v)nb.push([c+W,2,0]);if(cx>0&&!cells[c-1].v)nb.push([c-1,3,1]);
    if(!nb.length){stack.pop();continue}var n=nb[Math.floor(r()*nb.length)];cells[c].w[n[1]]=false;cells[n[0]].w[n[2]]=false;cells[n[0]].v=true;stack.push(n[0])}
  glass(taskHead(ing,motion?ing.t:ing.tt)+'<canvas id="mz" width="350" height="450"></canvas><p class="note" id="mm"></p>'+helpBtn());say(motion?ing.t:ing.tt);
  var cv=$("#mz"),g=cv.getContext("2d"),S=cv.width/W,px=S/2,py=S/2,vx=0,vy=0,gx=0,gy=0,R=S*.3,goal={x:(W-.5)*S,y:(H-.5)*S},pushes=[0,0],t0=performance.now(),pushN=0,drag=null;
  var wallAt=function(x,y){var cx=Math.floor(x/S),cy=Math.floor(y/S);if(cx<0||cy<0||cx>=W||cy>=H)return null;return cells[cy*W+cx]};
  var move=function(nx,ny){/* botsing per as */var c=wallAt(px,py);if(!c)return;var cx=Math.floor(px/S),cy=Math.floor(py/S);
    if(nx-R<cx*S&&c.w[3]){nx=cx*S+R;vx=0}if(nx+R>(cx+1)*S&&c.w[1]){nx=(cx+1)*S-R;vx=0}
    var c2=wallAt(nx,py),cx2=Math.floor(nx/S);if(c2&&cx2!==cx){/* in nieuwe cel: ok */}
    px=nx;c=wallAt(px,py);cy=Math.floor(py/S);cx=Math.floor(px/S);
    if(ny-R<cy*S&&c.w[0]){ny=cy*S+R;vy=0}if(ny+R>(cy+1)*S&&c.w[2]){ny=(cy+1)*S-R;vy=0}
    py=ny;/* hoekjes: binnen de cel blijven als zijmuur in nieuwe rij */var cc=wallAt(px,py);if(cc){var kx=Math.floor(px/S),ky=Math.floor(py/S);if(px-R<kx*S&&cc.w[3])px=kx*S+R;if(px+R>(kx+1)*S&&cc.w[1])px=(kx+1)*S-R;if(py-R<ky*S&&cc.w[0])py=ky*S+R;if(py+R>(ky+1)*S&&cc.w[2])py=(ky+1)*S-R}};
  var draw=function(){g.clearRect(0,0,cv.width,cv.height);g.fillStyle="#1a1740";g.fillRect(0,0,cv.width,cv.height);g.strokeStyle="#b794f6";g.lineWidth=3;g.lineCap="round";g.beginPath();
    cells.forEach(function(c,i){var x=(i%W)*S,y=Math.floor(i/W)*S;if(c.w[0]){g.moveTo(x,y);g.lineTo(x+S,y)}if(c.w[1]){g.moveTo(x+S,y);g.lineTo(x+S,y+S)}if(c.w[2]){g.moveTo(x,y+S);g.lineTo(x+S,y+S)}if(c.w[3]){g.moveTo(x,y);g.lineTo(x,y+S)}});g.stroke();
    g.font=(S*.7)+"px serif";g.textAlign="center";g.textBaseline="middle";g.fillText("🪄",goal.x,goal.y+2);
    g.fillStyle="#6ec3ff";g.beginPath();g.arc(px,py,R,0,7);g.fill();g.fillStyle="#fff";g.beginPath();g.arc(px-R*.3,py-R*.3,R*.25,0,7);g.fill()};
  var frame=function(){mg.raf=requestAnimationFrame(frame);var el=performance.now()-t0;
    if(motion){vx+=gx*.08;vy+=gy*.08;vx*=.9;vy*=.9;move(px+vx,py+vy)}
    /* Grimmel duwt twee keer */if(pushN<2&&el>6000+pushN*7000&&!drag){pushN++;toast(T.pushed);beep(880,.1);setTimeout(function(){beep(660,.1)},120);var a=r()*6.28;vx+=Math.cos(a)*12;vy+=Math.sin(a)*12;if(!motion){move(px+Math.cos(a)*S*.6,py+Math.sin(a)*S*.6)}}
    draw();if(Math.hypot(px-goal.x,py-goal.y)<S*.4){cancelAnimationFrame(mg.raf);done()}};
  if(motion){mg.on(window,"deviceorientation",function(e){var b=e.beta||0,gm=e.gamma||0;var o=(screen.orientation&&screen.orientation.angle)||window.orientation||0;if(o===90){var t=b;b=-gm;gm=t}else if(o===-90||o===270){t=b;b=gm;gm=-t}gx=Math.max(-25,Math.min(25,gm))/25*6;gy=Math.max(-25,Math.min(25,b-35))/25*6})}
  var pt=function(e){var rc=cv.getBoundingClientRect(),sx=cv.width/rc.width;return{x:(e.clientX-rc.left)*sx,y:(e.clientY-rc.top)*sx}};
  mg.on(cv,"pointerdown",function(e){var p=pt(e);if(Math.hypot(p.x-px,p.y-py)<S*1.2){drag=true;cv.setPointerCapture(e.pointerId)}});
  mg.on(cv,"pointermove",function(e){if(!drag)return;var p=pt(e),dx=p.x-px,dy=p.y-py,n=Math.ceil(Math.hypot(dx,dy)/(R*.5))||1;for(var i=0;i<n;i++)move(px+dx/n,py+dy/n)});
  mg.on(cv,"pointerup",function(){drag=false});mg.on(cv,"pointercancel",function(){drag=false});
  frame();bindHelp(done)}
/* ---------- 4. vuurvliegadem: blazen + raadsel ---------- */
function tMist(ing,done){var m=useMic(),mist=1,hat=G.c.hat;
  glass(taskHead(ing,m?ing.t:ing.tt)+'<div class="mistbox"><div class="under">'+svgHat(hat,true)+'</div><canvas id="mc" width="320" height="320"></canvas></div><p class="note" id="mm">'+(m?"💨":"👆")+'</p>'+helpBtn());say(m?ing.t:ing.tt);
  var cv=$("#mc"),g=cv.getContext("2d"),blobs=[];for(var i=0;i<40;i++)blobs.push({x:Math.random()*320,y:Math.random()*320,r:60+Math.random()*60});
  var draw=function(){g.clearRect(0,0,320,320);g.globalAlpha=Math.max(0,mist);blobs.forEach(function(b){var gr=g.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);gr.addColorStop(0,"rgba(232,228,255,.95)");gr.addColorStop(1,"rgba(232,228,255,0)");g.fillStyle=gr;g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.fill()});g.globalAlpha=1};
  var tick=function(){mg.raf=requestAnimationFrame(tick);if(m){var lv=micLow();if(lv>.33){mist-=0.012*(lv*2);blobs.forEach(function(b){b.x+=(Math.random()-.5)*6;b.y-=1.5})}}draw();if(mist<=0){cancelAnimationFrame(mg.raf);mg.later(function(){riddle(done)},700)}};
  if(!m){var lastP=null;mg.on(cv,"pointermove",function(e){if(e.buttons===0&&e.pointerType==="mouse")return;if(lastP){mist-=Math.hypot(e.clientX-lastP.x,e.clientY-lastP.y)/2200}lastP={x:e.clientX,y:e.clientY}});mg.on(cv,"pointerup",function(){lastP=null})}
  tick();bindHelp(function(){riddle(done)})}
function riddle(done){mg.stop();var hat=G.c.hat,opts=G.c.hatOpts,q=hard()?D.RIDDLE[hat]:T.riddleP;
  glass('<div class="talk"><h2>'+esc(hard()?T.riddleW:T.riddleP)+'</h2>'+(hard()?'<p class="big">'+esc(q)+'</p>':'')+'<div class="opts">'+opts.map(function(h){return '<button type="button" data-h="'+h+'">'+svgHat(h)+'<span>'+esc(cap(D.HATS1[h]))+'</span></button>'}).join("")+'</div></div>');
  say(hard()?q:T.riddleP);bindHelp(done);$(".opts").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(+b.dataset.h===hat){toast(T.right);done()}else{if(pzMiss())return;buzz(80);b.classList.add("no")}}}
/* ---------- 5. slaapliedje: ritme ---------- */
function tRitme(ing,done){var bpm=hard()?100:80,per=60000/bpm,need=hard()?12:8,hits=0,t0,beatN=0,m=useMic(),lastClap=0;
  glass(taskHead(ing,ing.t)+'<div class="moon" id="mo">🌙</div><p class="big" id="rc">'+fill(T.beatCount,{n:0,m:need})+'</p><button type="button" class="btn big" id="rt">👏 '+esc(T.beat)+'</button>'+helpBtn());say(ing.t);
  mg.later(function(){t0=performance.now();var pulse=function(){var el=performance.now()-t0,b=Math.floor(el/per);if(b!==beatN){beatN=b;var mo=$("#mo");if(mo){mo.classList.remove("p");void mo.offsetWidth;mo.classList.add("p")}beep(b%4?440:660,.08)}mg.raf=requestAnimationFrame(pulse)};pulse()},600);
  var hit=function(){if(!t0)return;var el=performance.now()-t0,ph=el%per,off=Math.min(ph,per-ph);if(off<per*.25){hits++;$("#rc").textContent=fill(T.beatCount,{n:hits,m:need});buzz(15);if(hits>=need){cancelAnimationFrame(mg.raf);done()}}else{toast(T.beatMiss);hits=Math.max(0,hits-1);$("#rc").textContent=fill(T.beatCount,{n:hits,m:need})}};
  $("#rt").onclick=hit;
  if(m){mg.every(function(){var lv=micLevel(),now=performance.now();if(lv>.25&&now-lastClap>220){lastClap=now;hit()}},40)}
  bindHelp(done)}
/* ---------- 6. het echte spiegelbeeld: selfie + silhouet ---------- */
function tSelfie(ing,done){selfie(ing,ing.t,function(url){G.photo=url;save();silhouet(done)})}
function selfie(ing,txt,then,crown){var canCam=useCam();
  var fallback=function(){glass(taskHead(ing,txt)+'<p class="note">'+esc(T.selfieNoCam)+'</p><button type="button" class="btn big" id="pf">📸 '+esc(T.pick)+'</button>'+helpBtn());say(txt);
    $("#pf").onclick=function(){var f=$("#file");f.onchange=function(){var fl=f.files&&f.files[0];if(!fl)return;var u=URL.createObjectURL(fl),im=new Image();im.onload=function(){URL.revokeObjectURL(u);then(snap(im,crown))};im.src=u;f.value=""};f.click()};bindHelp(function(){then(null)})};
  if(!canCam)return fallback();
  glass(taskHead(ing,txt)+'<div class="camwrap selfie"><video id="cv" playsinline autoplay muted></video><div class="still" id="st">'+esc(T.holdStill)+'</div></div><button type="button" class="btn big" id="sn">'+esc(T.selfieGo)+'</button>'+helpBtn());say(txt);
  startCam("user").then(function(s){var vd=$("#cv");vd.srcObject=s;var still=0,last=null;
    if(useMotion()){mg.on(window,"devicemotion",function(e){var a=e.accelerationIncludingGravity;if(!a)return;var mm=Math.hypot(a.x||0,a.y||0,a.z||0);if(last!=null){var d=Math.abs(mm-last);still=d<1.2?Math.min(100,still+4):Math.max(0,still-15)}last=mm;var st=$("#st");if(st){st.textContent=still>=100?T.sharp:T.holdStill;st.classList.toggle("ok",still>=100)}})}
    else mg.later(function(){var st=$("#st");if(st){st.textContent=T.sharp;st.classList.add("ok")}},2000);
    $("#sn").onclick=function(){beep(1200,.1);buzz(30);var url=snap(vd,crown);stopCam();mg.stop();
      glass(taskHead(ing,"")+'<img class="shot" src="'+url+'" alt=""><div class="row2"><button type="button" class="btn ghost" id="rt">'+esc(T.selfieRetry)+'</button><button type="button" class="btn" id="okk">'+esc(T.selfieOk)+'</button></div>');
      $("#rt").onclick=function(){selfie(ing,txt,then,crown)};$("#okk").onclick=function(){then(url)}}},fallback);
  bindHelp(function(){then(null)})}
/* foto naar vierkant canvas; bij ingrediënt 6 komt Grimmels silhouet in de hoek, bij de kroning een kroon bovenaan */
function snap(src,crown){var w=src.videoWidth||src.naturalWidth,h=src.videoHeight||src.naturalHeight,m=Math.min(w,h),cv=document.createElement("canvas");cv.width=720;cv.height=720;var g=cv.getContext("2d");
  if(src.videoWidth&&cam&&cam.facing==="user"){g.translate(720,0);g.scale(-1,1)}
  g.drawImage(src,(w-m)/2,(h-m)/2,m,m,0,0,720,720);g.setTransform(1,0,0,1,0,0);
  if(crown){drawCrownOn(g,360,150,220)}else{/* silhouet rechtsboven */g.save();g.globalAlpha=.85;
    g.fillStyle="#141126";g.beginPath();g.ellipse(560,200,70,60,0,0,7);g.fill();g.fillStyle="#f4c20d";var ex=G.c.eyes?[-26,0,26]:[-18,18];ex.forEach(function(x){g.beginPath();g.ellipse(560+x,196,8,11,0,0,7);g.fill()});
    g.fillStyle="#141126";if(G.c.hat===0){g.beginPath();g.moveTo(530,150);g.lineTo(565,70);g.lineTo(592,150);g.fill()}else if(G.c.hat===1){g.beginPath();g.moveTo(528,150);g.lineTo(526,112);g.lineTo(544,130);g.lineTo(560,100);g.lineTo(576,130);g.lineTo(594,112);g.lineTo(592,150);g.fill()}else{g.beginPath();g.moveTo(560,140);g.lineTo(530,120);g.lineTo(534,152);g.moveTo(560,140);g.lineTo(590,120);g.lineTo(586,152);g.fill()}g.restore()}
  return cv.toDataURL("image/jpeg",.8)}
function silhouet(done){mg.stop();var s=G.c.sils;
  glass('<div class="talk"><h2>'+esc(T.silH)+'</h2><p>'+esc(T.silT)+'</p><div class="opts three">'+s.map(function(x,i){return '<button type="button" data-i="'+i+'">'+svgGrimmel(0,x.hat,x.eyes,{sil:true})+'</button>'}).join("")+'</div></div>');say(T.silH+" "+T.silT);
  $(".opts").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(s[+b.dataset.i].ok){toast(T.right);done()}else{if(pzMiss())return;buzz(80);b.classList.add("no")}}}
/* ---------- 7. een vriendelijk woord: spreek de spreuk ---------- */
function tSpreuk(ing,done){var m=useMic(),w=G.c.words;
  if(m){glass(taskHead(ing,ing.t)+'<div class="word spell">'+w.map(esc).join("<br>")+'</div><div class="vol"><i id="vb"></i></div><p class="note" id="vm">'+esc(fill(T.speak,{w:w.join(" ")}))+'</p>'+helpBtn());say(ing.t+" "+w.join(", "));
    var acc=0;mg.every(function(){var lv=micLevel();$("#vb").style.width=Math.min(100,lv*300)+"%";if(lv>.12)acc+=.06;else acc=Math.max(0,acc-.01);if(acc>=1.6){mg.stop();done()}else if(lv>0.05&&lv<=.12)$("#vm").textContent=T.speakGo},60)}
  else{var order=shuffle(w,G.c.r),at=0;glass(taskHead(ing,ing.tt)+'<div class="opts three words">'+order.map(function(x){return '<button type="button" data-w="'+esc(x)+'"><span>'+esc(x)+'</span></button>'}).join("")+'</div><p class="note" id="vm">'+esc(w[0])+'…</p>'+helpBtn());say(ing.tt+" "+w.join(", "));
    $(".opts").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.dataset.w===w[at]){b.classList.add("ok");at++;beep(660+at*120,.12);if(at>=3)done();else $("#vm").textContent=w[at]+"…"}else{toast(T.wrong);buzz(80)}}}
  bindHelp(done)}
function taskHead(ing,txt){return '<div class="th"><span class="eyebrow">'+esc(ing.e+" "+ing.n)+'</span>'+(txt?'<p>'+esc(txt)+'</p>':'')+'</div>'}
/* het menu zit in de spiegellijst (☰); per opdracht onthouden we de overslaan-actie */
var curSkip=null;function helpBtn(){return ""}function bindHelp(skip){curSkip=skip;helper(skip)}
/* begeleidersknop (Feestopties): houd de bovenste regel van een opdracht één seconde vast → voorlezen of overslaan (+2 min) */
var LASTSAY="";
function penalty(){if(!G)return;G.t0-=120000;G.skips=(G.skips||0)+1;save()}
function helper(skip){var h=$("#glass .th")||$("#glass .talk>h2")||$("#glass .rhint");if(!h||!skip||h.dataset.hlp)return;h.dataset.hlp=1;h.classList.add("hold");var t=0;
  var down=function(){h.classList.add("holding");clearTimeout(t);t=setTimeout(function(){h.classList.remove("holding");open()},1000)},up=function(){clearTimeout(t);h.classList.remove("holding")};
  h.addEventListener("pointerdown",down);h.addEventListener("pointerup",up);h.addEventListener("pointerleave",up);h.addEventListener("pointercancel",up);h.addEventListener("contextmenu",function(e){e.preventDefault()});
  function open(){buzz(60);var old=$("#tsHelp");if(old)old.remove();var d=document.createElement("div");d.id="tsHelp";d.innerHTML='<div><h3>'+esc(T.hlpH)+'</h3><p>'+esc(T.hlpT)+'</p><button type="button" class="btn ghost dk" id="thR">🔊 '+esc(T.hlpRead)+'</button><button type="button" class="btn" id="thS">⏭ '+esc(T.hlpSkip)+'</button><button type="button" class="btn ghost dk" id="thX">'+esc(T.hlpX)+'</button></div>';document.body.appendChild(d);
    var x=function(){d.remove()};$("#thX").onclick=x;d.onclick=function(e){if(e.target===d)x()};$("#thR").onclick=function(){x();var v=VOICE;VOICE=true;say(LASTSAY);VOICE=v};$("#thS").onclick=function(){x();if(curSkip!==skip)return;penalty();toast(T.hlpDone);skip()}}}

/* ========== puzzels na elk ingrediënt (per ingrediënt-type) ========== */
var PZ=T.pz,RM=T.rm;
function pzHead(h,t){return '<div class="th"><h2>'+esc(h)+'</h2>'+(t?'<p>'+esc(t)+'</p>':'')+'</div>'}
/* Tovenaar: zichtbare klok van 60 s, zonder blokkade */
function pzTimer(){if(!hard())return;var el=document.createElement("div");el.className="ptimer";$("#glass").appendChild(el);var left=60;var tk=function(){el.textContent=fill(PZ.timer,{s:left});if(left<=0){toast(PZ.timeUp);el.classList.add("up");return}left--;mg.later(tk,1000)};tk()}
/* alle puzzels van deze ingrediënt-positie na elkaar (G.pi = waar we zijn) */
function runPuzzles(done){var list=plan()[G.i]||[];var go=function(){if(G.pi>=list.length)return done();var slot=G.pi;G.ph="pz";save();puzzle(list[slot],slot,function(){G.pi=slot+1;save();go()})};go()}
var PZFIN=null;
function pg(html){glass(html);if(PZFIN)bindHelp(PZFIN)}
var PZH=null;
/* fout antwoord: hartje kwijt (crew.js); op = dezelfde puzzel opnieuw, zonder straf */
var PZCUR=null;
/* hartjes staan in een vaste strook boven de spiegel (#tsH), zodat ze blijven staan als de puzzel een nieuwe ronde tekent */
function pzHearts(){if(PZH||!window.MW.Crew||!PZCUR)return;var m=$("#tsH");if(!m){m=document.createElement("div");m.id="tsH";var g=$("#glass");g.parentNode.insertBefore(m,g)}document.body.classList.add("tsHearts");var c=PZCUR;
  PZH=MW.Crew.hearts($("#glass"),function(){G.retries=(G.retries||0)+1;save();PZH=null;puzzle(c.key,c.slot,c.done)},{mount:m,dead:function(){mg.stop()}})}
function pzHeartsOff(){var m=$("#tsH");if(m)m.innerHTML="";document.body.classList.remove("tsHearts");PZH=null;PZCUR=null}
function pzMiss(){pzHearts();if(PZH)return PZH.miss();return false}
function puzzle(key,slot,done){var fn=PZF[key];if(!fn)return done();mg.stop();
  var n=(slot===0&&G.i%2===1&&G.i<6)?G.c.digits[(G.i-1)/2]:3+Math.floor(rngOf((G.seed^(G.i*977+slot*131))>>>0)()*5);
  var fin=function(){if(PZFIN!==fin)return;PZFIN=null;mg.stop();pzHeartsOff();done()};PZFIN=fin;fn(fin,n);
  PZH=null;PZCUR={key:key,slot:slot,done:done};if($("#glass .opts"))pzHearts();/* puzzels met keuzeknoppen tonen de hartjes meteen; andere pas bij de eerste fout */
  if(KRING.indexOf(key)<0)pzTimer();bindHelp(fin);peek()}
/* Grimmel gluurt soms midden in een puzzel even om de hoek */
function peek(){mg.later(function(){taunt(true)},9000+Math.random()*7000)}
function dbg(a){if(window.TS_DBG)window.TS_DBG.ans=a}
/* 1 sterrenbeeld: tik sterren in volgorde (Elfje genummerd; Tovenaar: onthoud de volgorde waarin ze oplichten) */
function pzStars(done){var r=rngOf(G.seed^0xA11),n=hard()?6:5,st=[],at=0,showing=hard();
  for(var i=0;i<n;i++){var ok2=false,x,y,t=0;while(!ok2&&t++<50){x=12+r()*76;y=12+r()*70;ok2=st.every(function(s){return Math.hypot(s.x-x,s.y-y)>20})}st.push({x:x,y:y})}
  glass(pzHead(PZ.starH,hard()?PZ.starTT:PZ.starT)+'<div class="sky" id="sky"><svg viewBox="0 0 100 100" preserveAspectRatio="none" id="skyL"></svg>'+st.map(function(s,i){return '<button type="button" data-i="'+i+'" style="left:'+s.x+'%;top:'+s.y+'%">'+(hard()?"":(i+1))+'</button>'}).join("")+'</div>');say(hard()?PZ.starTT:PZ.starT);
  var line=function(){var d="";for(var i=1;i<at;i++)d+="M"+st[i-1].x+","+st[i-1].y+"L"+st[i].x+","+st[i].y;$("#skyL").innerHTML='<path d="'+d+'" stroke="#f4c20d" stroke-width="1.2" fill="none" vector-effect="non-scaling-stroke"/>'};
  if(hard()){st.forEach(function(s,i){mg.later(function(){var b=$("#sky [data-i='"+i+"']");b.classList.add("lit");beep(500+i*80,.15);mg.later(function(){b.classList.remove("lit");if(i===n-1)showing=false},600)},800+i*900)})}
  $("#sky").onclick=function(e){var b=e.target.closest("button");if(!b||showing)return;var i=+b.dataset.i;if(i===at){b.classList.add("on");at++;beep(500+i*80,.12);buzz(15);line();if(at>=n){mg.later(done,700)}}else{toast(PZ.starBad);buzz(100);at=0;$$("#sky button").forEach(function(x){x.classList.remove("on")});line()}}}
/* 2 rozen tellen → gouden cijfer 1 */
function pzRoses(done,n){var r=rngOf(G.seed^0xB22^G.i),cells=[],tot=16;for(var i=0;i<n;i++)cells.push("rose");if(hard())for(i=0;i<3;i++)cells.push("wilt");while(cells.length<tot)cells.push(r()<.5?"tulip":"daisy");cells=shuffle(cells,r);
  var opts=shuffle([n,n-1,n+1,n+2].filter(function(v){return v>=1&&v<=9}),r).slice(0,4);if(opts.indexOf(n)<0)opts[0]=n;opts.sort(function(a,b){return a-b});
  var fl=function(k){if(k==="rose")return '<svg viewBox="-20 -24 40 48"><path d="M0,20 L0,2" stroke="#2a9d4b" stroke-width="2.5"/><path d="M0,10 q-8,-2 -8,-8 q8,0 8,8z" fill="#2a9d4b"/><circle r="9" cy="-6" fill="#e63946"/><path d="M-5,-9 q5,-6 10,0 q-4,6 -10,0z" fill="#ff6b6b"/></svg>';
    if(k==="wilt")return '<svg viewBox="-20 -24 40 48"><path d="M0,20 Q2,6 -4,-2" stroke="#6b5a3a" stroke-width="2.5" fill="none"/><circle r="8" cx="-5" cy="-4" fill="#8a5a4a"/><path d="M-9,-6 q4,-5 8,0 q-3,5 -8,0z" fill="#a0786a"/></svg>';
    if(k==="tulip")return '<svg viewBox="-20 -24 40 48"><path d="M0,20 L0,0" stroke="#2a9d4b" stroke-width="2.5"/><path d="M-8,-2 L-8,-14 L-3,-8 L0,-16 L3,-8 L8,-14 L8,-2 Q0,6 -8,-2z" fill="#f4c20d"/></svg>';
    return '<svg viewBox="-20 -24 40 48"><path d="M0,20 L0,0" stroke="#2a9d4b" stroke-width="2.5"/>'+[0,60,120,180,240,300].map(function(a){return '<ellipse rx="3.5" ry="7" cy="-7" fill="#fff" transform="rotate('+a+' 0 -7)"/>'}).join("")+'<circle cy="-7" r="3.5" fill="#4fb3ff"/></svg>'};
  glass(pzHead(PZ.roseH,hard()?PZ.roseTT:PZ.roseT)+'<div class="garden">'+cells.map(fl).join("")+'</div><div class="opts four">'+opts.map(function(v){return '<button type="button" data-v="'+v+'"><span>'+v+'</span></button>'}).join("")+'</div>');say(hard()?PZ.roseTT:PZ.roseT);
  $(".opts").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(+b.dataset.v===n){toast(T.right);done()}else{if(pzMiss())return;buzz(80);b.classList.add("no")}}}
/* 3 maanreeks */
function pzMoons(done){var M=["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"],r=rngOf(G.seed^0xC33),seq,ans,opts;
  if(hard()){var step=r()<.5?2:3,s0=Math.floor(r()*8),len=5;seq=[];for(var i=0;i<len;i++)seq.push(M[(s0+i*step)%8]);ans=M[(s0+len*step)%8];opts=shuffle([ans,M[(s0+len*step+3)%8],M[(s0+len*step+5)%8]],r)}
  else{/* Elfje: een herhalend patroon */var P=shuffle(["🌙","⭐","☁️","🌈"],r),k=2+Math.floor(r()*2),pat=P.slice(0,k);seq=[];for(i=0;i<(k===2?5:6);i++)seq.push(pat[i%k]);ans=pat[seq.length%k];opts=shuffle([ans].concat(P.filter(function(x){return x!==ans}).slice(0,2)),r)}
  glass(pzHead(PZ.moonH,PZ.moonT)+'<div class="moons">'+seq.map(function(m){return '<span>'+m+'</span>'}).join("")+'<span class="q">?</span></div><div class="opts three">'+opts.map(function(m){return '<button type="button" data-m="'+m+'"><span class="moonb">'+m+'</span></button>'}).join("")+'</div>');say(PZ.moonT);
  $(".opts").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.dataset.m===ans){toast(T.right);done()}else{if(pzMiss())return;buzz(80);b.classList.add("no")}}}
/* 4 vuurvliegjes vangen → gouden cijfer 2 (= aantal mint) */
function pzFlies(done,n){var r=rngOf(G.seed^0xD44^G.i),fl=[],caught=0;
  for(var i=0;i<n+(hard()?6:4);i++)fl.push({x:r()*300+20,y:r()*300+20,a:r()*6.28,sp:(hard()?1.3:.8)+r()*.8,mint:i<n,on:true,ph:r()*6.28});
  glass(pzHead(PZ.flyH,PZ.flyT)+'<canvas id="fc" width="340" height="340"></canvas><p class="big" id="fcnt">0 / '+n+'</p>');say(PZ.flyT);
  var cv=$("#fc"),g=cv.getContext("2d"),t0=performance.now();
  var frame=function(){mg.raf=requestAnimationFrame(frame);var t=(performance.now()-t0)/1000;g.clearRect(0,0,340,340);g.fillStyle="#120f2a";g.fillRect(0,0,340,340);
    fl.forEach(function(f){if(!f.on)return;f.a+=(r()-.5)*.3;f.x+=Math.cos(f.a)*f.sp;f.y+=Math.sin(f.a)*f.sp;if(f.x<15||f.x>325)f.a=Math.PI-f.a;if(f.y<15||f.y>325)f.a=-f.a;f.x=Math.max(15,Math.min(325,f.x));f.y=Math.max(15,Math.min(325,f.y));
      var gl=.55+.45*Math.sin(t*4+f.ph),c=f.mint?"60,207,168":"183,148,246";var gr=g.createRadialGradient(f.x,f.y,0,f.x,f.y,22);gr.addColorStop(0,"rgba("+c+","+gl+")");gr.addColorStop(1,"rgba("+c+",0)");g.fillStyle=gr;g.beginPath();g.arc(f.x,f.y,22,0,7);g.fill();g.fillStyle="rgb("+c+")";g.beginPath();g.arc(f.x,f.y,5,0,7);g.fill()})};
  mg.on(cv,"pointerdown",function(e){var rc=cv.getBoundingClientRect(),x=(e.clientX-rc.left)*340/rc.width,y=(e.clientY-rc.top)*340/rc.height,best=null,bd=30;fl.forEach(function(f){if(!f.on)return;var d=Math.hypot(f.x-x,f.y-y);if(d<bd){bd=d;best=f}});if(!best)return;
    if(best.mint){best.on=false;caught++;beep(900+caught*60,.1);buzz(15);$("#fcnt").textContent=caught+" / "+n;if(caught>=n){cancelAnimationFrame(mg.raf);toast(fill(PZ.flyDone,{n:n}));mg.later(done,600)}}else{toast(PZ.flyBad);buzz(120);G.wrong++;save();if(caught>0){caught--;$("#fcnt").textContent=caught+" / "+n;var back=fl.filter(function(f){return f.mint&&!f.on})[0];if(back)back.on=true}}});
  frame()}
/* 5 memory */
function pzMemory(done){var E=["🎵","🎶","🎻","🪈","🥁","🎺"],r=rngOf(G.seed^0xE55),pairs=hard()?6:3,cards=shuffle(E.slice(0,pairs).concat(E.slice(0,pairs)),r),open=[],found=0,lock=false;
  glass(pzHead(PZ.memH,PZ.memT)+'<div class="mem '+(hard()?"six":"three")+'">'+cards.map(function(c,i){return '<button type="button" data-i="'+i+'"><i>'+c+'</i></button>'}).join("")+'</div>');say(PZ.memT);
  $(".mem").onclick=function(e){var b=e.target.closest("button");if(!b||lock||b.classList.contains("up"))return;b.classList.add("up");open.push(b);beep(600,.08);
    if(open.length===2){lock=true;var a=open[0],c=open[1];mg.later(function(){if(cards[+a.dataset.i]===cards[+c.dataset.i]){a.classList.add("ok");c.classList.add("ok");found++;beep(900,.12);if(found>=pairs)mg.later(done,500)}else{a.classList.remove("up");c.classList.remove("up")}open=[];lock=false},700)}}}
/* 6 spiegelschrift → gouden cijfer 3 */
function pzMirror(done,n){var r=rngOf(G.seed^0xF66^G.i),signs=[String(n)];if(hard()){signs=shuffle([String(n),"R","F","J"],r)}
  var opts=shuffle([n,(n+1)%10,(n+4)%10,(n+7)%10],r).map(String);
  glass(pzHead(PZ.mirH,hard()?PZ.mirTT:PZ.mirT)+'<div class="mirtxt">'+signs.map(function(s){return '<span>'+s+'</span>'}).join("")+'</div><div class="opts four">'+opts.map(function(v){return '<button type="button" data-v="'+v+'"><span>'+v+'</span></button>'}).join("")+'</div>');say(hard()?PZ.mirTT:PZ.mirT);
  $(".opts").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(+b.dataset.v===n){toast(T.right);done()}else{if(pzMiss())return;buzz(80);b.classList.add("no")}}}
function digitGet(d,then){
  glass('<div class="talk"><p>'+esc(PZ.digitGet)+'</p><div class="word gold">'+d+'</div><p class="note">'+esc(PZ.digitsSoFar)+' '+G.c.digits.slice(0,G.digits).join(" · ")+'</p><p class="why">'+esc(PZ.digitWhy)+'</p><button type="button" class="btn" id="nx">'+T.next+'</button></div>');
  say(PZ.digitGet+" "+d+". "+PZ.digitWhy);$("#nx").onclick=then}
/* ========== nieuwe puzzels ========== */
function opts4(n,r){var o=[n];[n-1,n+1,n+2,n-2].forEach(function(v){if(v>=1&&v<=12&&o.length<4)o.push(v)});return shuffle(o,r).sort(function(a,b){return a-b})}
/* A. de toverklokjes: kijk en luister, speel het liedje na (Elfje 3 tonen, Tovenaar 5) */
function pzBells(done){var r=rngOf((G.seed^0x1B3^(G.i*7))>>>0),n=hard()?5:3,seq=[],F=[523,659,784,988],C=["#ff8fab","#f4c20d","#3ccfa8","#b794f6"],at=0,busy=true;
  for(var i=0;i<n;i++){var v=Math.floor(r()*4);if(i&&v===seq[i-1])v=(v+1+Math.floor(r()*3))%4;seq.push(v)}dbg(seq);
  pg(pzHead(PZ.bellH,hard()?PZ.bellTT:PZ.bellT)+'<div class="bells">'+[0,1,2,3].map(function(i){return '<button type="button" data-i="'+i+'" style="--c:'+C[i]+'"><span>🔔</span></button>'}).join("")+'</div><div class="dots" id="bd">'+seq.map(function(){return '<i></i>'}).join("")+'</div><button type="button" class="btn ghost sm" id="bAg">🔁 '+esc(PZ.again)+'</button>');
  say(hard()?PZ.bellTT:PZ.bellT);
  var ring=function(i){var b=$(".bells [data-i='"+i+"']");if(!b)return;b.classList.remove("lit");void b.offsetWidth;b.classList.add("lit");beep(F[i],.32);mg.later(function(){b.classList.remove("lit")},380)};
  var upd=function(){[].forEach.call($$("#bd i"),function(x,j){x.className=j<at?"on":""})};
  var play=function(){busy=true;at=0;upd();seq.forEach(function(v,j){mg.later(function(){ring(v)},500+j*(hard()?560:700))});mg.later(function(){busy=false},500+n*(hard()?560:700))};
  mg.later(play,hard()?2600:3200);
  $(".bells").onclick=function(e){var b=e.target.closest("button");if(!b||busy)return;var i=+b.dataset.i;ring(i);buzz(15);
    if(i===seq[at]){at++;upd();if(at>=n){busy=true;toast(T.right);mg.later(done,700)}}else{toast(PZ.bellBad);if(pzMiss())return;buzz(100);busy=true;mg.later(play,900)}};
  $("#bAg").onclick=function(){if(!busy)play()}}
/* B. de halve vlinder: maak de vleugel in spiegelbeeld heel */
function pzSym(done){var r=rngOf((G.seed^0x5E7^(G.i*13))>>>0),R=hard()?4:3,C=hard()?3:2,k=hard()?5:3,all=[],y,x;for(y=0;y<R;y++)for(x=0;x<C;x++)all.push(y*C+x);
  var left=shuffle(all,r).slice(0,k),want=left.map(function(c){return Math.floor(c/C)*C+(C-1-c%C)}),on={},col=["#ff8fab","#b794f6","#3ccfa8","#f4c20d"][Math.floor(r()*4)];dbg(want);
  var rows="";for(y=0;y<R;y++){var a="",b="";for(x=0;x<C;x++){a+='<i class="'+(left.indexOf(y*C+x)>=0?"on":"")+'"></i>';b+='<button type="button" data-c="'+(y*C+x)+'" aria-label="'+(y+1)+'-'+(x+1)+'"></button>'}rows+='<div class="wl">'+a+'</div><b></b><div class="wr">'+b+'</div>'}
  pg(pzHead(PZ.symH,hard()?PZ.symTT:PZ.symT)+'<div class="sym" style="--n:'+C+';--w:'+col+'"><div class="body">🐛</div>'+rows+'</div><p class="note" id="sm"></p>');say(hard()?PZ.symTT:PZ.symT);
  var check=function(){var ks=Object.keys(on).filter(function(q){return on[q]}).map(Number).sort(),w=want.slice().sort();if(ks.length===w.length&&ks.every(function(v,i){return v===w[i]})){$$(".sym button").forEach(function(b){b.disabled=true});$(".sym").classList.add("fly");beep(880,.15);mg.later(function(){beep(1320,.3)},150);toast(T.right);mg.later(done,1200)}
    else if(ks.length>=w.length){$("#sm").textContent=PZ.symAlmost}else $("#sm").textContent=""};
  $(".sym").onclick=function(e){var b=e.target.closest("button");if(!b||b.disabled)return;var c=+b.dataset.c;on[c]=!on[c];b.classList.toggle("on",on[c]);beep(on[c]?700:500,.06);buzz(10);check()}}
/* C. de kikkervijver: tel de kikkers (Elfje: ze springen erin; Tovenaar: erin én eruit, daarna mist) */
function pzPond(done,n){var r=rngOf((G.seed^0x90D^(G.i*17))>>>0),ev=[],i;
  if(hard()){var outN=2+Math.floor(r()*2),rest=[];for(i=0;i<n+outN-2;i++)rest.push(1);for(i=0;i<outN;i++)rest.push(-1);rest=shuffle(rest,r);ev=[1,1].concat(rest);var c=0;for(i=0;i<ev.length;i++){if(ev[i]<0&&c<=1){for(var j=i+1;j<ev.length;j++)if(ev[j]>0){ev[j]=-1;ev[i]=1;break}}c+=ev[i]}}
  else for(i=0;i<n;i++)ev.push(1);dbg(n);
  var PADS=[[22,30],[44,22],[66,28],[82,46],[70,66],[48,74],[26,66],[14,48],[36,46],[58,48],[40,30],[60,64]];
  var opts=opts4(n,r);
  var run=function(){pg(pzHead(PZ.pondH,hard()?PZ.pondTT:PZ.pondT)+'<div class="pond" id="pd">'+PADS.map(function(p){return '<i class="pad" style="left:'+p[0]+'%;top:'+p[1]+'%"></i>'}).join("")+'</div><div id="pq"></div>');say(hard()?PZ.pondTT:PZ.pondT);
    var pd=$("#pd"),onPad=[],free=PADS.map(function(_,q){return q}),step=hard()?800:1000;free=shuffle(free,r);
    ev.forEach(function(e,q){mg.later(function(){if(e>0){var pi=free.shift(),f=document.createElement("span");f.className="frg";f.textContent="🐸";var fromL=r()<.5;f.style.left=(fromL?-12:104)+"%";f.style.top=(30+r()*40)+"%";pd.appendChild(f);void f.offsetWidth;f.style.left=PADS[pi][0]+"%";f.style.top=PADS[pi][1]+"%";f.classList.add("hop");onPad.push({el:f,p:pi});beep(300,.12);mg.later(function(){beep(220,.1)},120)}
      else{var o=onPad.splice(Math.floor(r()*onPad.length),1)[0];if(o){free.push(o.p);o.el.classList.remove("hop");void o.el.offsetWidth;o.el.classList.add("hop");o.el.style.left=(r()<.5?-14:106)+"%";beep(520,.1);mg.later(function(){o.el.remove()},800)}}},900+q*step)});
    mg.later(function(){if(hard())pd.classList.add("mist");$("#pq").innerHTML='<p class="big">'+esc(PZ.pondQ)+'</p><div class="opts four">'+opts.map(function(v){return '<button type="button" data-v="'+v+'"><span>'+v+'</span></button>'}).join("")+'</div><button type="button" class="btn ghost sm" id="pL">🔁 '+esc(PZ.pondLook)+'</button>';say(PZ.pondQ);
      $("#pq .opts").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(+b.dataset.v===n){toast(T.right);pd.classList.remove("mist");mg.later(done,900)}else{if(pzMiss())return;buzz(80);b.classList.add("no")}};
      $("#pL").onclick=run},900+ev.length*step+700)};run()}
/* D. de schaduwkast: welke schaduw hoort bij dit ding? (Tovenaar: lijkende vormen, gespiegeld) */
var SHG=[["🐸","🐢","🦎","🐊"],["👑","🎩","🧢","👒"],["🦄","🐴","🦌","🐐"],["🍄","🌂","🌳","🌵"],["🕯️","🔦","🏮","🔔"],["🔑","🪄","🥄","🗝️"],["🦋","🐝","🐞","🕊️"],["🐰","🐭","🐹","🦊"],["🏰","⛪","🏠","⛺"]];
function pzShadow(done){var r=rngOf((G.seed^0x5AD^(G.i*19))>>>0),m=hard()?3:2,gs=shuffle(SHG.map(function(_,i){return i}),r).slice(0,m),round=0;
  var show=function(){var gi=gs[round],g=SHG[gi],t=g[Math.floor(r()*4)],opts;
    if(hard())opts=shuffle(g.slice(),r);else{var oth=shuffle(SHG.filter(function(_,i){return i!==gi}),r).slice(0,2).map(function(x){return x[Math.floor(r()*4)]});opts=shuffle([t].concat(oth),r)}dbg(t);
    pg(pzHead(PZ.shH,hard()?PZ.shTT:PZ.shT)+'<span class="eyebrow">'+esc(fill(PZ.shRound,{n:round+1,m:m}))+'</span><div class="shObj">'+t+'</div><div class="opts '+(opts.length===4?"two2":"three")+' shs'+(hard()?" flip":"")+'">'+opts.map(function(o){return '<button type="button" data-o="'+o+'"><span>'+o+'</span></button>'}).join("")+'</div>');
    if(round===0)say(hard()?PZ.shTT:PZ.shT);
    $(".shs").onclick=function(e){var b=e.target.closest("button");if(!b)return;if(b.dataset.o===t){b.classList.add("ok");beep(880,.12);buzz(20);round++;mg.later(function(){if(round>=m)done();else show()},700)}else{if(pzMiss())return;buzz(80);b.classList.add("no")}}};show()}
/* E. kringspel: betoverde dieren (één kijkt stiekem, doet het dier na, de rest raadt) */
function pzMime(done){var r=rngOf((G.seed^0x313^(G.i*23))>>>0),m=hard()?3:2,pool=shuffle(hard()?D.MIME.t:D.MIME.e,r),pk=0,round=0;
  var who=function(){return kid(G.i+1+round)};
  var start=function(){var n=who();pg(pzHead(PZ.mimeH,"")+'<span class="eyebrow">👥 '+esc(PZ.kringE)+' · '+esc(fill(PZ.shRound,{n:round+1,m:m}))+'</span>'+'<div class="av">'+svgGrimmel(G.c.col,G.c.hat,G.c.eyes,{sil:true})+'</div><p class="big">'+esc(fill(PZ.mimeT,{n:n}))+'</p><div class="who sm">'+esc(n)+'</div><button type="button" class="btn big" id="mL">'+esc(PZ.mimeLook)+'</button>');say(fill(PZ.mimeT,{n:n}));$("#mL").onclick=card};
  var card=function(){var a=pool[pk++%pool.length];dbg(a[0]);hush();pg(pzHead(PZ.mimeH,"")+'<p>'+esc(PZ.mimeShow)+'</p><div class="mimeC"><span>'+a[1]+'</span><b>'+esc(cap(a[0]))+'</b></div><button type="button" class="btn big" id="mR">'+esc(PZ.mimeReady)+'</button><button type="button" class="btn ghost sm" id="mN">🔄 '+esc(PZ.mimeNew)+'</button>');
    $("#mR").onclick=act;$("#mN").onclick=card};
  var act=function(){var n=who(),t0=Date.now();pg(pzHead(PZ.mimeH,"")+'<div class="mimeQ">❓</div><p class="big">'+esc(fill(PZ.mimeDo,{n:n}))+'</p><p class="note">'+esc(hard()?PZ.mimeDoT:PZ.mimeDoE)+'</p><div class="vol"><i id="mt" style="width:100%"></i></div><button type="button" class="btn big" id="mOk">'+esc(PZ.mimeOk)+'</button>');say(fill(PZ.mimeDo,{n:n})+" "+(hard()?PZ.mimeDoT:PZ.mimeDoE));
    mg.every(function(){var el=$("#mt");if(el)el.style.width=Math.max(0,100-(Date.now()-t0)/600)+"%"},250);
    $("#mOk").onclick=function(){confettiS();beep(660,.12);mg.later(function(){beep(990,.2)},120);round++;if(round>=m)mg.later(done,600);else mg.later(start,600)}};start()}
/* F. kringspel: de hete toverbal (doorgeven tot PLING, dan een toveropdracht) */
function pzBall(done){var r=rngOf((G.seed^0xBA11^(G.i*29))>>>0),m=hard()?3:2,pool=shuffle(hard()?D.BALL.t:D.BALL.e,r),round=0;
  var start=function(){pg(pzHead(PZ.ballH,round===0?PZ.ballT:"")+'<span class="eyebrow">👥 '+esc(PZ.kringE)+' · '+esc(fill(PZ.shRound,{n:round+1,m:m}))+'</span><div class="orb" id="ob">🔮</div><button type="button" class="btn big" id="bG">'+esc(PZ.ballGo)+'</button>');if(round===0)say(PZ.ballT);
    $("#bG").onclick=function(){hush();var b=this;b.disabled=true;b.textContent=PZ.ballPass;var dur=window.TS_DBG?1200:(6500+r()*6000),t0=performance.now(),ob=$("#ob");ob.classList.add("hot");
      var tick=function(){var el=performance.now()-t0;if(el>=dur){stop();return}var gap=Math.max(140,520-el/dur*400);ob.style.animationDuration=(gap*2)+"ms";beep(el/dur>.7?880:660,.05);buzz(15);mg.later(tick,gap)};tick()}};
  var stop=function(){var a=pool[round%pool.length];buzz([200,60,200]);beep(1320,.4);mg.later(function(){beep(1760,.4)},180);
    pg(pzHead(PZ.ballStop,"")+'<div class="burst">'+a[1]+'</div><p class="big">'+esc(a[0])+'</p><button type="button" class="btn big" id="bD">'+esc(PZ.ballDone)+'</button>');say(PZ.ballStop+" "+a[0]);
    $("#bD").onclick=function(){confettiS();round++;if(round>=m)mg.later(done,500);else start()}};start()}
var PZF={stars:pzStars,roses:pzRoses,moons:pzMoons,flies:pzFlies,memory:pzMemory,mirror:pzMirror,bells:pzBells,sym:pzSym,pond:pzPond,shadow:pzShadow,mime:pzMime,ball:pzBall};
/* kleine confetti-plof in het glas */
function confettiS(){var w=$("#glassWrap");if(!w)return;for(var i=0;i<24;i++){var c=document.createElement("i");c.className="cfs";c.style.left=(30+Math.random()*40)+"%";c.style.background=["#ff8fab","#f4c20d","#b794f6","#3ccfa8"][i%4];c.style.setProperty("--dx",(Math.random()-.5)*260+"px");c.style.setProperty("--dy",(-80-Math.random()*200)+"px");w.appendChild(c);(function(c){setTimeout(function(){c.remove()},1100)})(c)}}
/* Grimmel duikt even op in een hoek van de spiegel */
function taunt(mid){if(!G||$(".taunt"))return;var el=document.createElement("div");el.className="taunt"+(mid?" low":"");el.innerHTML=svgGrimmel(G.c.col,G.c.hat,G.c.eyes,{sil:true})+'<span>'+esc(RM.taunts[Math.floor(Math.random()*RM.taunts.length)])+'</span>';$("#glassWrap").appendChild(el);beep(1200,.08);setTimeout(function(){beep(1500,.08)},90);setTimeout(function(){el.classList.add("go");setTimeout(function(){el.remove()},500)},2600)}

/* ========== escape-room: de spiegelwereld ========== */
function roomArt(){return ok("room-bg")&&ok("room-books")&&ok("room-chest")&&ok("room-candle")&&ok("room-door")&&ok("room-lamp-off")}
function roomHtml(){var R=G.room,im=function(k,id,st,extra){return '<div class="ro'+(id?" hs":"")+'"'+(id?' id="'+id+'"':'')+' style="'+st+'"><img src="'+IMGROOT+k+'.webp" alt="">'+(extra||"")+'</div>'};
  var CC=["#ff8fab","#f4c20d","#b794f6","#3ccfa8"],FX=[17,37,62,84];
  var flames=[0,1,2,3].map(function(i){return R.cand.indexOf(i)>=0?'<i class="flame" style="left:'+FX[i]+'%"></i>':''}).join("");
  var paint=R.paintOn?'<div class="pdots">'+R.cseq.map(function(c){return '<i style="background:'+CC[c]+'"></i>'}).join("")+'</div>':'<div class="pdots q">?</div>';
  return '<div class="roomScene" style="background-image:url('+IMGROOT+'room-bg.webp)">'+
   im("room-frame","hsPaint","left:73%;top:16%;width:13%",paint)+
   im("room-books","hsBooks","left:3%;bottom:9%;height:62%")+
   im(R.door?"room-door-open":"room-door","hsDoor","left:21%;bottom:11%;height:50%")+
   im(R.key?"room-chest-open":"room-chest","hsChest","left:37%;bottom:4%;height:24%")+
   im("room-candle","hsCandle","left:56%;bottom:8%;height:31%",flames)+
   im(R.lamp?"room-lamp-on":"room-lamp-off","hsLamp","left:81%;bottom:5%;height:33%")+
   (R.shard?im("room-shard","","left:12%;bottom:5%;height:10%;pointer-events:none"):"")+'</div>'}
function roomSvg(){if(roomArt())return roomHtml();var dark=!G.room.lamp;return '<svg viewBox="0 0 900 520" class="roomS" preserveAspectRatio="xMidYMid slice">'+
 '<defs><linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2466"/><stop offset="1" stop-color="#1a1740"/></linearGradient><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2d6b"/><stop offset="1" stop-color="#241c4a"/></linearGradient></defs>'+
 '<rect width="900" height="380" fill="url(#wl)"/><rect y="380" width="900" height="140" fill="url(#fl)"/><path d="M0,380 L900,380" stroke="#6a57b8" stroke-width="3"/>'+
 /* raam met maan */'<rect x="380" y="60" width="140" height="190" rx="70" fill="#0d0b22" stroke="#c99400" stroke-width="6"/><circle cx="450" cy="130" r="30" fill="#fff7c2"/><circle cx="462" cy="122" r="26" fill="#0d0b22"/><circle cx="410" cy="200" r="2" fill="#fff"/><circle cx="480" cy="90" r="1.5" fill="#fff"/><circle cx="495" cy="210" r="2" fill="#fff"/>'+
 /* schilderij (volgorde kaarsen) */'<g id="hsPaint" class="hs"><rect x="560" y="90" width="150" height="110" rx="6" fill="#4a3b1e" stroke="#f4c20d" stroke-width="6"/><rect x="574" y="104" width="122" height="82" fill="#1a1740"/>'+(G.room.paintOn?G.room.cseq.map(function(c,i){return '<circle cx="'+(592+i*30)+'" cy="145" r="11" fill="'+["#ff8fab","#f4c20d","#b794f6","#3ccfa8"][c]+'"/>'}).join(""):'<text x="635" y="155" fill="#b794f6" font-size="40" text-anchor="middle">?</text>')+'</g>'+
 /* kandelaar */'<g id="hsCandle" class="hs"><rect x="600" y="300" width="80" height="12" rx="6" fill="#c99400"/><rect x="634" y="312" width="12" height="60" fill="#c99400"/><rect x="620" y="366" width="40" height="14" rx="7" fill="#c99400"/>'+[0,1,2,3].map(function(i){var x=604+i*24,lit=G.room.cand.indexOf(i)>=0;return '<rect x="'+x+'" y="262" width="12" height="40" fill="'+["#ff8fab","#f4c20d","#b794f6","#3ccfa8"][i]+'"/>'+(lit?'<ellipse cx="'+(x+6)+'" cy="252" rx="6" ry="11" fill="#ffd166"><animate attributeName="ry" values="11;14;11" dur=".6s" repeatCount="indefinite"/></ellipse>':'')}).join("")+'</g>'+
 /* boekenkast */'<g id="hsBooks" class="hs"><rect x="60" y="100" width="200" height="280" fill="#4a3b1e" stroke="#2a2010" stroke-width="6"/>'+[0,1,2].map(function(rw){return [0,1,2,3,4,5].map(function(i){return '<rect x="'+(74+i*30)+'" y="'+(120+rw*86)+'" width="24" height="70" rx="3" fill="'+["#ff6b6b","#4fb3ff","#3ccfa8","#f4c20d","#b794f6","#ff8fab"][(i+rw)%6]+'"/>'}).join("")}).join("")+(G.room.shard?'':'<rect x="60" y="380" width="200" height="0"/>')+'</g>'+
 /* kist */'<g id="hsChest" class="hs"><rect x="330" y="330" width="130" height="80" rx="10" fill="#7a4a1e" stroke="#2a2010" stroke-width="5"/><path d="M330,350 Q395,300 460,350" fill="#8a5a2e" stroke="#2a2010" stroke-width="5"/><rect x="385" y="352" width="20" height="26" rx="4" fill="#f4c20d"/>'+(G.room.key?'<text x="395" y="300" font-size="30" text-anchor="middle">🔑</text>':'')+'</g>'+
 /* tafel met lantaarn */'<g id="hsLamp" class="hs"><rect x="740" y="330" width="120" height="14" fill="#5a3a1e"/><rect x="750" y="344" width="10" height="60" fill="#5a3a1e"/><rect x="840" y="344" width="10" height="60" fill="#5a3a1e"/><rect x="782" y="270" width="36" height="56" rx="6" fill="#c99400" stroke="#7a5a00" stroke-width="3"/><rect x="788" y="278" width="24" height="40" fill="'+(dark?"#2a2060":"#fff2a8")+'"/>'+(dark?'':'<circle cx="800" cy="298" r="60" fill="rgba(255,230,150,.18)"/>')+'</g>'+
 /* deur */'<g id="hsDoor" class="hs"><rect x="260" y="150" width="90" height="230" rx="45" fill="#3b2a14" stroke="#c99400" stroke-width="5"/><circle cx="330" cy="270" r="7" fill="#f4c20d"/>'+(G.room.door?'<rect x="268" y="158" width="74" height="222" rx="37" fill="#b794f6" opacity=".9"/>':'')+'</g>'+
 '</svg>'}
function room(){G.ph="room";if(!G.room){var r=rngOf(G.seed^0x5E5E);G.room={lamp:false,key:false,shard:false,door:false,cand:[],cseq:G.c.cseq,paintOn:!hard()};save();
    return talk([RM.enter1],function(){talk([RM.enter2],function(){roomScreen()},"mira-shock")},"cauldron")}
  roomScreen()}
function roomScreen(){mg.stop();var R=G.room;
  glass('<div class="roomWrap" id="rw"><div class="roomPan" id="rp">'+roomSvg()+'</div>'+(R.lamp?'':'<div class="darkL" id="dk"></div>')+'</div><p class="note rhint" id="rh">'+esc(R.lamp?RM.roomT:RM.dark)+'</p><div class="inv">'+esc(RM.inv)+' '+(R.lamp?"🏮 ":"")+(R.key?"🔑 ":"")+(R.shard?(ok("room-shard")?'<img class="invi" src="'+IMGROOT+'room-shard.webp" alt=""> ':"🔷 "):"")+(hard()||R.key?"":'<span class="dg">'+esc(PZ.digitsSoFar)+' '+G.c.digits.map(function(d){return '<b>'+d+'</b>'}).join(" ")+'</span>')+'</div>');
  say(R.lamp?(R.said?"":RM.roomT):RM.dark);R.said=1;
  var rw=$("#rw"),rp=$("#rp");rp.scrollLeft=R.lamp?rp.scrollLeft:rp.scrollWidth;
  if(!R.lamp){var dk=$("#dk");var mv=function(e){var rc=rw.getBoundingClientRect();dk.style.setProperty("--x",(e.clientX-rc.left)+"px");dk.style.setProperty("--y",(e.clientY-rc.top)+"px")};mg.on(rw,"pointermove",mv);mg.on(rw,"pointerdown",mv);
    $("#hsLamp").onclick=function(){R.lamp=true;save();beep(700,.2);setTimeout(function(){beep(1050,.3)},180);buzz([40,30,120]);toast(RM.lampOn);say(RM.lampOn);roomScreen()};return}
  $("#hsChest").onclick=function(){R.key?toast(RM.chestOk):chestSheet()};
  $("#hsBooks").onclick=function(){R.shard?toast(RM.booksOk):booksSheet()};
  $("#hsCandle").onclick=function(){R.cand.length===4?toast(fill(RM.candleOk,vars())):candleTap()};
  $("#hsPaint").onclick=function(){if(hard()){R.paintOn=true;R.cand=[];save();roomScreen();mg.later(function(){R.paintOn=false;save();roomScreen()},1800)}};
  $("#hsLamp").onclick=function(){toast("🏮")};
  bindHelp(function(){R.key=true;R.shard=true;R.cand=[0,1,2,3];save();roomScreen();toast(RM.skipRoom)});
  $("#hsDoor").onclick=function(){if(R.key&&R.shard){R.door=true;save();beep(523,.2);setTimeout(function(){beep(784,.3)},200);buzz([60,40,200]);glass('<div class="talk">'+pic("mira-happy",svgMira("happy"),"av")+'<p class="big">'+esc(RM.doorOk)+'</p><button type="button" class="btn" id="nx">'+T.next+'</button></div>');say(RM.doorOk);$("#nx").onclick=twist}else{toast(RM.doorLock);say(RM.doorLock);buzz(80)}}}
function chestSheet(){var v=[0,0,0];var html=function(){return '<h2>'+esc(RM.chestH)+'</h2><p>'+esc(RM.chestT)+'</p><div class="wheels">'+v.map(function(d,i){return '<div><button type="button" data-i="'+i+'" data-d="1">▲</button><b>'+d+'</b><button type="button" data-i="'+i+'" data-d="-1">▼</button></div>'}).join("")+'</div><button type="button" class="btn" id="cOk">'+esc(RM.open)+'</button><button type="button" class="btn ghost dk" id="shX">'+esc(T.back)+'</button>'};
  var render=function(){sheet(html());$("#shX").onclick=closeSheet;$$(".wheels button").forEach(function(b){b.onclick=function(){var i=+b.dataset.i;v[i]=(v[i]+ +b.dataset.d+10)%10;beep(500,.05);render()}});
    $("#cOk").onclick=function(){if(v.join("")===G.c.digits.join("")){G.room.key=true;save();closeSheet();beep(660,.15);setTimeout(function(){beep(990,.3)},150);buzz([60,40,160]);toast(RM.chestOk);say(RM.chestOk);roomScreen()}else{G.wrong++;save();toast(RM.chestBad);buzz(120)}}};render()}
function booksSheet(){var NL=hard()?6:4,w=G.c.words[0].slice(0,NL).toUpperCase().split(""),r=rngOf(G.seed^0xB00C),decoy="BDGKPSTZ".split("").filter(function(c){return w.indexOf(c)<0}),letters=shuffle(w.concat(decoy.slice(0,hard()?3:2)),r),at=0;
  sheet('<h2>'+esc(RM.booksH)+'</h2><p>'+esc(hard()?RM.booksTT:fill(RM.booksT,{w:G.c.words[0].slice(0,NL).toUpperCase().split('').join(' ')+' ('+G.c.words[0]+')'}))+'</p><div class="books">'+letters.map(function(c,i){return '<button type="button" data-c="'+c+'" style="background:'+["#ff6b6b","#4fb3ff","#3ccfa8","#f4c20d","#b794f6","#ff8fab","#e76f51","#6ec3ff","#2a9d4b"][i%9]+'">'+c+'</button>'}).join("")+'</div><p class="note" id="bk"></p><button type="button" class="btn ghost dk" id="shX">'+esc(T.back)+'</button>');
  $("#shX").onclick=closeSheet;say(hard()?RM.booksTT:fill(RM.booksT,{w:G.c.words[0].slice(0,NL).toUpperCase().split('').join(' ')+' ('+G.c.words[0]+')'}));
  $(".books").onclick=function(e){var b=e.target.closest("button");if(!b||b.classList.contains("ok"))return;if(b.dataset.c===w[at]){b.classList.add("ok");at++;beep(500+at*70,.1);$("#bk").textContent=w.slice(0,at).join("");if(at>=w.length){G.room.shard=true;save();mg.later(function(){closeSheet();beep(990,.3);buzz([60,40,160]);toast(RM.booksOk);say(RM.booksOk);roomScreen()},500)}}else{G.wrong++;save();toast(RM.booksBad);buzz(100);at=0;$$(".books button").forEach(function(x){x.classList.remove("ok")});$("#bk").textContent=""}}}
function candleTap(){var R=G.room,seq=R.cseq;if(R.cand.length===0&&!R.tapT){toast(hard()?RM.candleTT:RM.candleT);say(hard()?RM.candleTT:RM.candleT);R.tapT=1}
  /* tik op de kandelaar = volgende kaars aansteken: welke? een klein vel met vier kleuren */
  sheet('<h2>'+esc(RM.candleH)+'</h2><p>'+esc(hard()?RM.candleTT:RM.candleT)+'</p><div class="cands">'+[0,1,2,3].map(function(i){return '<button type="button" data-i="'+i+'" class="'+(R.cand.indexOf(i)>=0?"lit":"")+'" style="--c:'+["#ff8fab","#f4c20d","#b794f6","#3ccfa8"][i]+'"><i></i></button>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+esc(T.back)+'</button>');
  $("#shX").onclick=closeSheet;
  $(".cands").onclick=function(e){var b=e.target.closest("button");if(!b||b.classList.contains("lit"))return;var i=+b.dataset.i;if(seq[R.cand.length]===i){R.cand.push(i);save();b.classList.add("lit");beep(600+R.cand.length*100,.12);buzz(15);
      if(R.cand.length===4){mg.later(function(){closeSheet();var t=fill(RM.candleOk,vars());toast(t);say(t);roomScreen()},500)}}
    else{G.wrong++;R.cand=[];save();toast(RM.candleBad);buzz(120);$$(".cands button").forEach(function(x){x.classList.remove("lit")})}}}

/* speurboekje: wat weten we al van Grimmel? */
function clues(){var c=G.c,h=[];if(G.pot.indexOf(0)>=0)h.push('<div class="cl"><i style="background:'+COLHEX[c.col]+'"></i><b>'+esc(cap(D.COLS[c.col]))+'</b></div>');
  if(G.pot.indexOf(3)>=0)h.push('<div class="cl">'+svgHat(c.hat)+'<b>'+esc(cap(D.HATS1[c.hat]))+'</b></div>');
  if(G.pot.indexOf(5)>=0)h.push('<div class="cl"><span class="eyes">'+(c.eyes?"👁👁👁":"👁👁")+'</span><b>'+esc(cap(D.EYES[c.eyes]))+'</b></div>');
  return h.length?'<div class="clues">'+h.join("")+'</div>':'<p class="note">'+esc(T.bookNone)+'</p>'}
function bookSheet(){sheet('<h2>'+esc(T.bookH)+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+'<p>'+esc(T.bookT)+'</p>'+clues()+(G.words?'<p class="note">✨ '+esc(T.wordsSoFar)+' <b>'+esc(G.c.words.slice(0,G.words).join(" · "))+'</b></p>':'')+(G.digits?'<p class="note">🔢 '+esc(PZ.digitsSoFar)+' <b>'+G.c.digits.slice(0,G.digits).join(" · ")+'</b></p>':'')+'<button type="button" class="btn" id="shX">'+esc(T.close)+'</button>');MW.bindCodeBox($("#sheetBody"),L);$("#shX").onclick=closeSheet}

/* ========== Spiegeljacht: foto's van echte dingen, binnen of buiten, en groepsposes ========== */
function sjPlan(seed){var r=rngOf(seed^0x5A5A),inn=shuffle(D.SJ.in,r),out=shuffle(D.SJ.out,r),pose=shuffle(D.SJ.pose,r),list=[],a=0,b=0,c=0;
  for(var i=0;i<14;i++){var isPose=i%3===2,src;if(isPose)list.push({t:pose[c++%pose.length],pose:true});
    else{var useOut=WHERE==="out"||(WHERE==="mix"&&(a+b)%2===1);list.push(useOut?{t:out[b++%out.length],out:true}:{t:inn[a++%inn.length]})}}return list}
function photoHunt(it,then){G.ph="sj";save();var first=!G.sjSeen,who=kid(G.i+1+G.sjN);
  var show=function(){G.sjSeen=1;save();var txt=it.pose?D.sjPose:D.sjAsk;
    glass('<div class="talk sj">'+pic("mira-talk",svgMira("talk"),"av sm")+'<span class="eyebrow">📷 '+esc(D.sjH)+' · '+(G.sjN)+'</span><p>'+esc(txt)+'</p><div class="sjE">'+it.t[1]+'</div><p class="big sjT">'+esc(cap(it.t[0]))+'</p><p class="note">'+esc(fill(D.sjWho,{n:who}))+(it.out?' '+esc(D.sjOut):'')+'</p><button type="button" class="btn big" id="sjG">'+esc(D.sjGo)+'</button><button type="button" class="btn ghost sm" id="sjS">'+esc(D.sjSkip)+'</button></div>');
    say(txt+" "+it.t[0]+". "+fill(D.sjWho,{n:who}));bindHelp(then);
    $("#sjS").onclick=then;
    $("#sjG").onclick=function(){var f=$("#file");f.setAttribute("capture",it.pose?"user":"environment");f.onchange=function(){var fl=f.files&&f.files[0];f.value="";if(!fl)return;var u=URL.createObjectURL(fl),im=new Image();
      im.onload=function(){URL.revokeObjectURL(u);var m=Math.min(im.naturalWidth,im.naturalHeight),cv=document.createElement("canvas");cv.width=cv.height=420;cv.getContext("2d").drawImage(im,(im.naturalWidth-m)/2,(im.naturalHeight-m)/2,m,m,0,0,420,420);
        var url=cv.toDataURL("image/jpeg",.62);G.album.push({u:url,t:it.t[0],e:it.t[1]});try{save()}catch(e){G.album.pop()}wow(url,then)};im.src=u};f.click()}};
  if(first)talk([D.sjIntro],show,"mira-happy");else show()}
function wow(url,then){var w=D.sjWow[Math.floor(Math.random()*D.sjWow.length)];beep(880,.1);setTimeout(function(){beep(1320,.2)},110);buzz([30,30,80]);
  glass('<div class="talk"><div class="magic"><img src="'+url+'" alt=""><i></i></div><p class="big">'+esc(w)+'</p><p class="note">'+esc(fill(D.sjCount,{n:G.album.length}))+'</p><button type="button" class="btn" id="nx">'+T.next+'</button></div>');say(w);$("#nx").onclick=then}
/* ---------- spiegelalbum: alle foto's (kroning, spiegelbeeld, spiegeljacht) als één plaat om op te slaan of te delen ---------- */
function albumItems(){if(!G)return[];var a=[];if(G.crown)a.push({u:G.crown,t:T.albumCrown,e:"👑"});if(G.photo)a.push({u:G.photo,t:T.albumSelfie,e:"📸"});(G.album||[]).forEach(function(x){if(x&&x.u)a.push(x)});return a}
function albumSheet(){var a=albumItems();sheet('<h2>'+esc(D.album)+'</h2><p>'+esc(D.albumT)+'</p>'+(a.length?'<div class="album">'+a.map(function(x){return '<figure><img src="'+x.u+'" alt=""><figcaption>'+x.e+' '+esc(x.t)+'</figcaption></figure>'}).join("")+'</div><button type="button" class="btn" id="abS">🖼 '+esc(T.albumMake)+'</button><div id="abOut"></div>':'<p class="note">'+esc(D.albumNone)+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+esc(T.close)+'</button>');
  $("#shX").onclick=closeSheet;var b=$("#abS");if(b)b.onclick=function(){b.disabled=true;b.textContent=T.albumBusy;albumPlate(a,function(bl){b.disabled=false;b.textContent="🖼 "+T.albumMake;offerFile(bl,"spiegelalbum-"+G.code+".jpg",D.album,$("#abOut"))})}}
function albumPlate(a,cb){var n=a.length,cols=n<=2?2:3,S=n<=2?460:296,P=24,W=1080,rows=Math.ceil(n/cols),HEAD=300,kidsTxt=fill(T.albumKids,{k:G.kids.join(", ")}),cv=document.createElement("canvas"),g=cv.getContext("2d");
  g.font="500 30px Barlow, sans-serif";var kl=lines(g,kidsTxt,W-160).length;cv.width=W;cv.height=HEAD+rows*(S+56+P)+P+kl*40+110;
  var bg=g.createLinearGradient(0,0,0,cv.height);bg.addColorStop(0,"#2a2160");bg.addColorStop(1,"#13102a");g.fillStyle=bg;g.fillRect(0,0,W,cv.height);
  for(var i=0;i<90;i++){g.fillStyle="rgba(255,255,255,"+(.2+Math.random()*.6)+")";g.beginPath();g.arc(Math.random()*W,Math.random()*cv.height,1+Math.random()*2,0,7);g.fill()}
  g.strokeStyle="#f4c20d";g.lineWidth=16;g.strokeRect(20,20,W-40,cv.height-40);
  g.textAlign="center";g.fillStyle="#f4c20d";g.font="700 72px Fredoka, sans-serif";g.fillText(D.album,W/2,120);
  g.fillStyle="#fff";g.font="600 36px Fredoka, sans-serif";g.fillText(NAME?fill(T.albumFor,{j:NAME}):(L==="nl"?"De Betoverde Toverspiegel":"The Enchanted Mirror"),W/2,175);
  var secs=Math.round(((G.tEnd||Date.now())-G.t0)/1000),st=G.stars||0;
  g.fillStyle="#cfd8ff";g.font="500 28px Barlow, sans-serif";g.fillText(T.dipCase+" "+G.code+" · "+new Date().toLocaleDateString(L==="nl"?"nl-NL":"en-GB")+" · ⏱ "+Math.max(1,Math.round(secs/60))+" min"+(st?" · "+"★".repeat(st)+"☆".repeat(3-st):""),W/2,225);
  var left=n,x0=(W-(cols*S+(cols-1)*P))/2,fin=function(){g.fillStyle="#e8e4ff";g.font="500 30px Barlow, sans-serif";var y=HEAD+rows*(S+56+P)+P+20;lines(g,kidsTxt,W-160).forEach(function(l){g.fillText(l,W/2,y);y+=40});
    g.fillStyle="#b794f6";g.font="500 24px Barlow, sans-serif";g.fillText("MiniMystery · "+(L==="nl"?"De Betoverde Toverspiegel":"The Enchanted Mirror"),W/2,cv.height-48);cv.toBlob(cb,"image/jpeg",.86)};
  if(!n)return fin();
  a.forEach(function(x,i){var im=new Image(),cx=x0+(i%cols)*(S+P),cy=HEAD+Math.floor(i/cols)*(S+56+P);var done=function(ok){if(ok){g.save();g.translate(cx+S/2,cy+S/2);g.rotate(((i%3)-1)*.02);g.fillStyle="#fff7e8";g.fillRect(-S/2-10,-S/2-10,S+20,S+56);g.drawImage(im,-S/2,-S/2,S,S);g.fillStyle="#1f2a44";g.font="600 22px Fredoka, sans-serif";var t=x.t.length>28?x.t.slice(0,27)+"…":x.t;g.fillText(t,0,S/2+32);g.restore()}if(--left===0)fin()};
    im.onload=function(){done(true)};im.onerror=function(){done(false)};im.src=x.u})}
function lines(g,txt,w){var out=[],line="";String(txt).split(" ").forEach(function(wd){var t=line?line+" "+wd:wd;if(g.measureText(t).width>w&&line){out.push(line);line=wd}else line=t});if(line)out.push(line);return out}
/* plaatje aanbieden: delen als bestand (Web Share API), anders downloaden */
function offerFile(bl,fname,title,out){if(!bl||!out)return;var url=URL.createObjectURL(bl),f=null;try{f=new File([bl],fname,{type:"image/jpeg"})}catch(e){}
  var canFile=!!(f&&navigator.share&&navigator.canShare&&navigator.canShare({files:[f]}));
  out.innerHTML='<img class="shot" src="'+url+'" alt=""><div class="row2">'+(canFile?'<button type="button" class="btn" id="ofS">📤 '+esc(T.dipShare)+'</button>':'')+'<a class="btn ghost dk" download="'+esc(fname)+'" href="'+url+'">⬇ '+esc(T.dipSave)+'</a></div>';
  var b=out.querySelector("#ofS");if(b)b.onclick=function(){navigator.share({files:[f],title:title}).catch(function(){})};out.scrollIntoView&&out.scrollIntoView({block:"nearest"})}
/* ---------- twist vlak voor de finale: een briefje van Grimmel, en dan… namaak-Grimmels ---------- */
function twist(){G.ph="twist";save();talk([T.tw1],function(){
  glass('<div class="talk"><h2>'+esc(T.tw2h)+'</h2><div class="note2" id="nt"><p>'+esc(T.tw2)+'</p></div><button type="button" class="btn" id="nx" hidden>'+T.next+'</button></div>');
  mg.later(function(){var n=$("#nt");if(n)n.classList.add("read");say(T.tw2)},1300);mg.later(function(){var b=$("#nx");if(b)b.hidden=false},2400);
  $("#nx").onclick=function(){var c=G.c.cands;glass('<div class="talk"><div class="poofs">'+c.map(function(x,i){return '<div class="pf" style="animation-delay:'+(i*.35)+'s">'+svgGrimmel(x.col,x.hat,x.eyes)+'</div>'}).join("")+'</div><p class="big">'+esc(T.tw3)+'</p><button type="button" class="btn big" id="nx">'+T.next+'</button></div>');
    $("#glassWrap").classList.remove("shake");void $("#glassWrap").offsetWidth;$("#glassWrap").classList.add("shake");[0,1,2].forEach(function(i){setTimeout(function(){beep(500+i*200,.12);buzz(30)},i*350)});say(T.tw3);$("#nx").onclick=finale}},"mira-shock")}
/* ---------- finale ---------- */
function finale(){G.ph="finale";save();var c=G.c.cands;
  glass('<div class="talk"><h2>'+esc(T.finH)+'</h2><p>'+esc(T.finT)+'</p>'+(hard()?'':clues())+'<div class="opts three big">'+c.map(function(x,i){return '<button type="button" data-i="'+i+'">'+svgGrimmel(x.col,x.hat,x.eyes)+'</button>'}).join("")+'</div></div>');say(T.finH+" "+T.finT);
  $(".opts").onclick=function(e){var b=e.target.closest("button");if(!b||this.dataset.done)return;if(c[+b.dataset.i].ok){this.dataset.done=1;toast(T.finRight);beep(660,.15);setTimeout(function(){beep(990,.3)},160);G.tEnd=Date.now();save();
    $$(".opts button").forEach(function(x){x.classList.add(x===b?"chosen":"poof")});mg.later(function(){$$(".opts button.poof").forEach(function(x){x.style.display="none"});var o=$(".opts.big");if(o)o.classList.add("solo");var p=document.createElement("p");p.className="big";p.textContent=T.finPoof;$("#glass .talk").appendChild(p);say(T.finPoof)},700);mg.later(blowAll,3200)}else{G.wrong++;save();toast(T.finWrong);buzz(120);b.classList.add("no")}}}
function blowAll(){var m=useMic(),mist=1;
  glass('<div class="th"><h2>'+esc(T.blowH)+'</h2><p>'+esc(m?T.blowT:T.blowTT)+'</p></div><div class="mistbox"><div class="under">'+pic("parel-cheer",svgParel({cheer:true}),"fig")+'</div><canvas id="mc" width="320" height="320"></canvas></div>'+(m?'<div class="vol"><i id="vb"></i></div>':'<button type="button" class="btn big" id="bl">💨 '+esc(T.blowBtn)+'</button>'));
  say(m?T.blowT:T.blowTT);var cv=$("#mc"),g=cv.getContext("2d"),blobs=[];for(var i=0;i<50;i++)blobs.push({x:Math.random()*320,y:Math.random()*320,r:60+Math.random()*60});
  var draw=function(){g.clearRect(0,0,320,320);g.globalAlpha=Math.max(0,mist);blobs.forEach(function(b){var gr=g.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);gr.addColorStop(0,"rgba(232,228,255,.97)");gr.addColorStop(1,"rgba(232,228,255,0)");g.fillStyle=gr;g.beginPath();g.arc(b.x,b.y,b.r,0,7);g.fill()});g.globalAlpha=1};
  var holding=false;var tick=function(){mg.raf=requestAnimationFrame(tick);if(m){var lv=micLow();$("#vb").style.width=Math.min(100,lv*160)+"%";if(lv>.3)mist-=.01*lv*2}else if(holding)mist-=.006;draw();if(mist<=0){cancelAnimationFrame(mg.raf);buzz([80,40,80,40,300]);beep(523,.2);setTimeout(function(){beep(659,.2)},200);setTimeout(function(){beep(784,.2)},400);setTimeout(function(){beep(1047,.5)},600);mg.later(function(){transform(back)},300)}};
  if(!m){var b=$("#bl");mg.on(b,"pointerdown",function(){holding=true});mg.on(b,"pointerup",function(){holding=false});mg.on(b,"pointerleave",function(){holding=false})}tick()}
/* de grote terugtovering: de kikker draait, flits, Parel! */
function transform(then){glass('<div class="talk tf"><div class="tfS" id="tf"><div class="tfR"></div>'+pic("frog",svgFrog(),"tfF")+'<div class="tfP">'+pic("parel-cheer",svgParel({cheer:true}),"fig")+'<div class="tfC">'+svgCrown()+'</div></div><div class="tfX"></div></div><p class="big" id="tfT">'+esc(T.tf1)+'</p><button type="button" class="btn" id="nx" hidden>'+T.next+'</button></div>');say(T.tf1);
  var s=$("#tf");[0,1,2,3,4,5].forEach(function(i){mg.later(function(){beep(392+i*90,.12)},300+i*230)});mg.later(function(){s.classList.add("spin")},200);
  mg.later(function(){s.classList.add("flash");buzz([80,40,80,40,300]);beep(523,.2);setTimeout(function(){beep(659,.2)},150);setTimeout(function(){beep(784,.2)},300);setTimeout(function(){beep(1047,.6)},450)},1900);
  mg.later(function(){s.classList.add("done");confetti();var t=$("#tfT");if(t)t.textContent=T.tf2;say(T.tf2)},2300);mg.later(function(){var b=$("#nx");if(b)b.hidden=false},3300);$("#nx").onclick=then}
function back(){talk([T.back1],function(){talk([T.back2],function(){talk([T.back3],function(){ask()},"grimmel")},"parel")},"parel")}
function ask(){glass('<div class="talk"><div class="av">'+svgGrimmel(G.c.col,G.c.hat,G.c.eyes,{sad:true})+'</div><h2>'+esc(T.askH)+'</h2><button type="button" class="btn big" id="y">'+esc(T.askY)+'</button><button type="button" class="btn ghost" id="n">'+esc(T.askN)+'</button></div>');say(T.askH);
  var go=function(){confetti();glass('<div class="talk">'+(ok("grimmel-party")?pic("grimmel-party","","av"):'<div class="av">'+svgGrimmel(G.c.col,G.c.hat,G.c.eyes,{party:true})+'</div>')+'<p class="big">'+esc(T.askOk)+'</p><button type="button" class="btn" id="nx">'+T.next+'</button></div>');say(T.askOk);$("#nx").onclick=crown};
  $("#y").onclick=go;$("#n").onclick=go}
function crown(){var txt=NAME?fill(T.crownT,{j:NAME}):T.crownT0;selfie({e:"👑",n:T.crownH},txt,function(url){G.crown=url;G.done=true;G.tEnd=G.tEnd||Date.now();try{save()}catch(e){G.crown=null;save()}award();treasure(finish)},true)}
/* echte schat (Feestopties): na de kroning stuurt Grimmel de groep naar de echte verstopplek */
function treasure(then){if(window.MMP&&MMP.hasTreasure()&&!G.trDone&&!G.demo){G.trDone=1;save();hush();return MMP.finale(then)}then()}
function award(){if(G.awarded||G.demo)return;G.awarded=1;save();var min=(G.tEnd-G.t0)/60000,bad=2*(G.skips||0),stars=1+(bad===0?1:0)+(bad<=2?1:0);G.stars=stars;save();
  MW.profile.award({game:ID,xp:0,stars:stars,gps:false,min:min,km:0,title:(L==="nl"?"Toverspiegel ":"Mirror ")+G.code,code:G.code})}
function finish(){G.done=true;save();confetti();var nA=albumItems().length,secs=Math.round(((G.tEnd||Date.now())-G.t0)/1000);
  glass('<div class="talk fin"><span class="eyebrow">🏆 '+esc(T.doneH)+'</span>'+(G.crown?'<img class="shot" src="'+G.crown+'" alt="">':pic("parel-cheer",svgParel({cheer:true}),"av"))+'<p class="big">'+esc(NAME?fill(T.crownOk,{j:NAME}):T.crownOk0)+'</p><p>'+esc(T.doneT)+'</p><p class="stars">'+"★".repeat(G.stars||1)+"☆".repeat(3-(G.stars||1))+' · ⏱ '+Math.max(1,Math.round(secs/60))+' min</p>'+MW.codeBox(L,G.code,"zaak",true)+'<button type="button" class="btn big" id="dp">🎓 '+esc(T.dip)+'</button>'+(nA?'<button type="button" class="btn" id="ab">📷 '+esc(fill(T.albumBtn,{n:nA}))+'</button>':'')+'<button type="button" class="btn ghost" id="hm">'+esc(T.home)+'</button></div>');
  MW.bindCodeBox($("#glass"),L);say(T.doneH+" "+T.doneT);$("#dp").onclick=dipSheet;var ab=$("#ab");if(ab)ab.onclick=albumSheet;$("#hm").onclick=function(){G=null;LS.del(GK);home()};
  if(window.MMP&&!G.demo&&G.stars)MMP.result($("#glass .talk"),{code:G.code,secs:secs,stars:G.stars,back:function(){Wk.closeSheet()}})}
function demoEnd(){mg.stop();glass('<div class="talk"><h2>'+esc(T.demoH)+'</h2>'+pic("frog",svgFrog(),"av")+'<p class="big">'+esc(T.demoT)+'</p><button type="button" class="btn big" id="pr">'+esc(T.pro)+' · '+MW.cfg.price+'</button><button type="button" class="btn ghost" id="hm">'+esc(T.home)+'</button></div>');say(T.demoT);
  $("#pr").onclick=proSheet;$("#hm").onclick=function(){G=null;LS.del(GK);home()}}
function confetti(){var c=document.createElement("canvas");c.className="conf";document.body.appendChild(c);c.width=innerWidth;c.height=innerHeight;var g=c.getContext("2d"),ps=[],cols=["#ff8fab","#f4c20d","#b794f6","#3ccfa8","#ff6b6b","#4fb3ff"];
  for(var i=0;i<140;i++)ps.push({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,v:2+Math.random()*4,w:6+Math.random()*8,a:Math.random()*6.28,s:(Math.random()-.5)*.2,c:cols[i%cols.length]});
  var t0=performance.now(),f=function(){var el=performance.now()-t0;g.clearRect(0,0,c.width,c.height);ps.forEach(function(p){p.y+=p.v;p.x+=Math.sin(p.a+el/300)*1.2;p.a+=p.s;g.save();g.translate(p.x,p.y);g.rotate(p.a);g.fillStyle=p.c;g.fillRect(-p.w/2,-p.w/4,p.w,p.w/2);g.restore()});if(el<3500)requestAnimationFrame(f);else c.remove()};f()}

/* ---------- diploma's ---------- */
function dipSheet(){sheet('<h2>'+esc(T.dipH)+'</h2><p>'+esc(T.dipT)+'</p><div class="list">'+G.kids.map(function(k,i){return '<button type="button" class="sus" data-k="'+i+'"><b>'+esc(k)+'</b></button>'}).join("")+'</div><div id="dipOut"></div><button type="button" class="btn ghost dk" id="shX">'+esc(T.back)+'</button>');
  $("#shX").onclick=closeSheet;$("#sheetBody").onclick=function(e){var b=e.target.closest("[data-k]");if(b)diploma(G.kids[+b.dataset.k])}}
function roles(name){var ks=[];for(var i=0;i<7;i++){var w=G.who&&G.who[i]!=null?G.who[i]:kid(i);if(w===name)ks.push(G.c.order[i])}return ks}
function diploma(name){var cv=document.createElement("canvas");cv.width=1080;cv.height=1500;var g=cv.getContext("2d"),W=1080,H=1500,ks=roles(name);
  var bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,"#2a2160");bg.addColorStop(1,"#13102a");g.fillStyle=bg;g.fillRect(0,0,W,H);
  for(var i=0;i<90;i++){g.fillStyle="rgba(255,255,255,"+(.3+Math.random()*.6)+")";g.beginPath();g.arc(Math.random()*W,Math.random()*H,1+Math.random()*2.5,0,7);g.fill()}
  /* gouden lijst met hoekjes */g.strokeStyle="#f4c20d";g.lineWidth=28;g.strokeRect(40,40,W-80,H-80);g.strokeStyle="#c99400";g.lineWidth=6;g.strokeRect(70,70,W-140,H-140);
  g.fillStyle="#f4c20d";[[70,70],[W-70,70],[70,H-70],[W-70,H-70]].forEach(function(p){g.beginPath();g.arc(p[0],p[1],22,0,7);g.fill()});
  var ph=function(url,cb){if(!url)return cb();var im=new Image();im.onload=function(){cb(im)};im.onerror=function(){cb()};im.src=url};
  ph(G.photo||G.crown,function(im){g.textAlign="center";g.font="700 60px Fredoka, Arial Rounded MT Bold, sans-serif";g.fillStyle="#f4c20d";g.fillText(T.dipTitle.toUpperCase(),W/2,165);
    g.font="500 30px Barlow, sans-serif";g.fillStyle="#cfd8ff";g.fillText("MiniMystery · "+(L==="nl"?"De Betoverde Toverspiegel":"The Enchanted Mirror"),W/2,212);
    var cy=480,R=210;if(im){g.save();g.beginPath();g.arc(W/2,cy,R,0,7);g.closePath();g.clip();g.drawImage(im,W/2-R,cy-R,R*2,R*2);g.restore()}
    else{g.fillStyle="#1a1740";g.beginPath();g.arc(W/2,cy,R,0,7);g.fill();if(ok("frog")){var fi=IM.frog,fh=300,fw=fh*fi.naturalWidth/fi.naturalHeight;g.drawImage(fi,W/2-fw/2,cy-150,fw,fh)}else{g.font="200px serif";g.fillText("🐸",W/2,cy+70)}}
    g.strokeStyle="#f4c20d";g.lineWidth=12;g.beginPath();g.arc(W/2,cy,R,0,7);g.stroke();drawCrownOn(g,W/2,cy-R+20,150);
    /* Grimmel (feestversie) en Parel als stickers */
    if(ok("grimmel-party")){var gi=IM["grimmel-party"],gh=200,gw=gh*gi.naturalWidth/gi.naturalHeight;g.drawImage(gi,W/2+R-30,cy+R-170,gw,gh)}
    if(ok("parel-cheer")){var pi=IM["parel-cheer"],phh=220,pw=phh*pi.naturalWidth/pi.naturalHeight;g.drawImage(pi,W/2-R-pw+40,cy+R-200,pw,phh)}
    g.font="700 92px Fredoka, sans-serif";g.fillStyle="#fff";var nm=name;while(g.measureText(nm).width>880&&nm.length>3)nm=nm.slice(0,-1);g.fillText(nm,W/2,830);
    g.font="500 34px Barlow, sans-serif";g.fillStyle="#e8e4ff";var y=885;lines(g,T.dipLine+(NAME?" "+fill(T.dipFor,{j:NAME}):"")+".",860).forEach(function(l){g.fillText(l,W/2,y);y+=44});
    /* speciale taak = de ingrediënten die dit kind vasthield */
    var badge=ks.length?ks.map(function(k){return T.badge[k]}).join(" & "):T.badgeHelp;y+=26;
    g.fillStyle="rgba(244,194,13,.15)";g.strokeStyle="#f4c20d";g.lineWidth=4;var bw=Math.min(900,Math.max(520,g.measureText(badge).width+260));roundRect(g,W/2-bw/2,y-6,bw,172,28);g.fill();g.stroke();
    g.fillStyle="#b794f6";g.font="600 26px Fredoka, sans-serif";g.fillText(T.dipRole.toUpperCase(),W/2,y+34);
    g.fillStyle="#f4c20d";g.font="700 40px Fredoka, sans-serif";var bl=lines(g,badge,bw-60);g.fillText(bl[0]+(bl.length>1?"…":""),W/2,y+84);
    var icons=ks.slice(0,4),ix=W/2-(icons.length-1)*40;icons.forEach(function(k,q){var key="ing-"+k;if(ok(key)){var ii=IM[key];g.drawImage(ii,ix+q*80-26,y+96,52,52*ii.naturalHeight/ii.naturalWidth)}else{g.font="40px serif";g.fillText(T.ing[k].e,ix+q*80,y+136)}});
    y+=222;g.fillStyle="#f4c20d";g.font="700 56px Fredoka, sans-serif";g.fillText("★ ".repeat(G.stars||3).trim(),W/2,y+20);
    g.font="500 28px Barlow, sans-serif";g.fillStyle="#cfd8ff";var secs=Math.round(((G.tEnd||Date.now())-G.t0)/1000);g.fillText(T.dipCase+" "+G.code+" · "+new Date().toLocaleDateString(L==="nl"?"nl-NL":"en-GB")+" · ⏱ "+Math.max(1,Math.round(secs/60))+" min",W/2,y+80);
    g.font="italic 500 28px Barlow, sans-serif";g.fillStyle="#e8e4ff";g.fillText(T.dipSign,W/2,H-110);
    cv.toBlob(function(bl){offerFile(bl,name+"-spiegelspeurder.jpg",T.dipH,$("#dipOut"))},"image/jpeg",.86)})}
function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function wrap(g,txt,x,y,w,lh){var words=txt.split(" "),line="";words.forEach(function(wd){var t=line?line+" "+wd:wd;if(g.measureText(t).width>w&&line){g.fillText(line,x,y);y+=lh;line=wd}else line=t});if(line)g.fillText(line,x,y)}

/* ---------- menu / ouderscherm ---------- */
function menu(skip){var v=vars();
  sheet('<h2>'+esc(T.menuH)+'</h2>'+MW.codeBox(L,G.code,"zaak",true)+
   '<button type="button" class="btn ghost dk" id="mBk">📖 '+esc(T.bookH)+'</button>'+(albumItems().length?'<button type="button" class="btn ghost dk" id="mAl">📷 '+esc(fill(T.albumBtn,{n:albumItems().length}))+'</button>':'')+
   '<button type="button" class="btn ghost dk" id="mSp">🔎 '+esc(T.spiek)+'</button>'+
   (skip?'<button type="button" class="btn ghost dk" id="mSk">⏭ '+esc(T.hlpSkip)+'</button>':'')+
   '<button type="button" class="btn ghost dk" id="mOr">🔀 '+esc(T.order)+'</button>'+
   '<div class="seg two" id="mSens">'+[["auto",T.sensA],["silent",T.sensB],["old",T.sensC],["tap",T.sensD]].map(function(o){return '<button type="button" data-s="'+o[0]+'" aria-pressed="'+(SMODE===o[0])+'">'+esc(o[1])+'</button>'}).join("")+'</div>'+
   '<button type="button" class="btn ghost dk" id="mQ">'+esc(T.quit)+'</button><button type="button" class="btn" id="shX">'+esc(T.resume)+'</button>');
  var t=0,sp=$("#mSp");var open=function(){sheet('<h2>'+esc(T.spiekH)+'</h2><p class="big">'+esc(fill(T.spiekT,v))+'</p><p class="note">🔢 '+G.c.digits.join(" ")+' · 🕯 '+G.c.cseq.map(function(i){return["🩷","💛","💜","💚"][i]}).join("")+' · 📚 '+G.c.words[0].slice(0,hard()?6:4).toUpperCase()+'</p>'+(hard()?'<p class="note">'+esc(T.spiekLie)+'</p>':'')+'<div class="opts three"><button type="button" disabled>'+svgGrimmel(G.c.col,G.c.hat,G.c.eyes)+'</button></div><button type="button" class="btn" id="shX">'+esc(T.close)+'</button>');$("#shX").onclick=closeSheet};
  var down=function(){clearTimeout(t);t=setTimeout(open,900)},up=function(){clearTimeout(t)};sp.addEventListener("pointerdown",down);sp.addEventListener("pointerup",up);sp.addEventListener("pointerleave",up);sp.addEventListener("contextmenu",function(e){e.preventDefault()});
  $("#mBk").onclick=bookSheet;var al=$("#mAl");if(al)al.onclick=albumSheet;$("#shX").onclick=closeSheet;$("#mOr").onclick=function(){G.off=Math.floor(Math.random()*G.kids.length);save();closeSheet();toast(T.ok)};
  $("#mSens").onclick=function(e){var b=e.target.closest("button");if(!b)return;SMODE=b.dataset.s;LS.set("ss_ts_smode",SMODE);$$("#mSens button").forEach(function(x){x.setAttribute("aria-pressed",x===b)})};
  var sk=$("#mSk");if(sk)sk.onclick=function(){closeSheet();if(curSkip!==skip)return;penalty();skip()};MW.bindCodeBox($("#sheetBody"),L);
  $("#mQ").onclick=function(){closeSheet();save();G=null;home()}}
$("#hudM").onclick=function(){if(G)menu(curSkip)};

/* ---------- zaakcode, wissen ---------- */
function codeSheet(pre){sheet('<h2>'+T.dH+'</h2><p>'+T.dT+'</p><ul class="where">'+T.dWhereL.map(function(x){return '<li>'+x+'</li>'}).join("")+'</ul><p class="note">'+T.dTwo+'</p><input class="inp" id="dCode" autocomplete="off" autocapitalize="characters" spellcheck="false" value="'+esc(pre||"")+'"><button type="button" class="btn" id="dOk">'+T.dGo+'</button><p class="note err" id="dMsg"></p><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  var go=function(){var p=parseCode($("#dCode").value);if(!p){$("#dMsg").textContent=T.dBad;buzz(120);return}if(MW.pro.locked(ID)){proSheet();return}LEVEL=p.level;LS.set("ss_ts_level",LEVEL);LEN=p.len;LS.set("ss_ts_len",LEN);closeSheet();toast(fill(T.dLoaded,{l:T.lvlN[LEVEL],n:T.lenN[LEN]}));begin(p.seed,false)};
  $("#shX").onclick=closeSheet;$("#dOk").onclick=go;$("#dCode").onkeydown=function(e){if(e.key==="Enter")go()}}
function wipeSheet(){var has=!!LS.get(GK,null);sheet('<h2>'+T.wipe+'</h2>'+(has?'<button type="button" class="btn ghost dk" id="wG">'+T.wipeY+'</button>':'')+'<button type="button" class="btn ghost dk" id="wA">'+T.wipeAll+'</button><button type="button" class="btn" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;var g=$("#wG");if(g)g.onclick=function(){LS.del(GK);G=null;closeSheet();home();toast(T.wiped)};
  $("#wA").onclick=function(){LS.del(GK);["ss_ts_kids","ss_ts_name","ss_ts_level","ss_ts_smode"].forEach(LS.del);KIDS=[];NAME="";G=null;closeSheet();home();toast(T.wiped)}}

if(/[?&]debug\b/.test(location.search))window.TS_DBG={G:function(){return G},puzzle:puzzle,skip:function(){if(curSkip)curSkip()},ans:null,plan:makePlan,parse:parseCode};
home();
if(window.MMP)MMP.init({id:ID,fin:{nl:"Grimmel schuifelt naar voren: ‘Als sorry heb ik nog iets verstopt. Niet in de spiegel… maar echt. Kijk maar!’",en:"Grimble shuffles forward: ‘To say sorry, I hid something else. Not in the mirror… for real. Look!’"}});
})();
