/* MiniMystery – stem (voorlezen).
   Elke zin die het spel uitspreekt wordt opgezocht in de opnames van dat spel (games/<spel>/voice/<taal>/index.js).
   Is er een mp3 van die zin: die wordt afgespeeld. Zo niet: de browserstem leest die ene zin voor (met de beste Nederlandse/Engelse stem die het toestel heeft).
   Zinnen zonder opname worden op dit toestel bijgehouden (localStorage "mmv_missing_<spel>_<taal>"), zodat de stemstudio ze kan ophalen.
   Gebruik: MMVoice.init("pony","nl"); MMVoice.say(tekst); MMVoice.hush();
   Splitsen en sleutels moeten exact gelijk blijven aan stemstudio.html en de lijst in voice/<taal>/script.js, dus alleen hier aanpassen. */
(function(){
"use strict";
var V={game:null,lang:"nl",have:{},base:"",q:[],cur:null,au:null,next:null,gen:0,voice:null,ready:false,unlocked:false};

/* ---------- tekst → zinnen → sleutels ---------- */
function clean(t){return String(t||"").replace(/([!?])\./g,"$1").replace(/\{[^}]+\}/g,"").replace(/[“”„"«»]/g,"").replace(/\s+/g," ").trim()}
/* splits na . ! ? (gevolgd door spatie) en vóór een citaat na een dubbele punt ("Hond Boris: “Woef!”").
   Een beletselteken (…) splitst niet, zodat "Maar wacht… daar" één zin blijft. */
function split(t){
  var s=String(t||"").replace(/\{[^}]+\}/g,"").replace(/\s+/g," ").trim();if(!s)return[];
  s=s.replace(/:\s+(?=[“"„])/g,":\n").replace(/([.!?]+[”"»]?)\s+/g,"$1\n");
  return s.split("\n").map(clean).filter(function(x){return /[0-9A-Za-zÀ-ÿ]/.test(x)})}
function norm(t){return clean(t).toLowerCase().replace(/[’']/g,"").replace(/[^0-9a-zà-ÿ]+/g," ").trim()}
function key(t){var s=norm(t),h=0x811c9dc5;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}return("0000000"+h.toString(16)).slice(-8)}

/* ---------- opnames laden ---------- */
function root(){return (window.MW&&MW.root)||""}
function init(game,lang){V.game=game;V.lang=lang||"nl";V.base=root()+"games/"+game+"/voice/"+V.lang+"/";V.have={};
  var sc=document.createElement("script");sc.src=V.base+"index.js?v="+Date.now().toString(36).slice(0,-4);
  sc.onload=function(){var m=window.MMV_HAVE&&window.MMV_HAVE[game+"_"+V.lang];if(m)V.have=m;V.ready=true};
  sc.onerror=function(){V.ready=true};document.head.appendChild(sc);pickVoice();
  try{speechSynthesis.onvoiceschanged=pickVoice}catch(e){}
  ["pointerdown","touchend","keydown"].forEach(function(ev){document.addEventListener(ev,unlock,{capture:true,passive:true})})}
/* iOS: geluid mag pas na een tik. Eén keer een stil fragment afspelen ontgrendelt het audio-element. */
function silentWav(){var n=800,b=new Uint8Array(44+n),d=new DataView(b.buffer),w=function(o,t){for(var i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i)};
  w(0,"RIFF");d.setUint32(4,36+n,true);w(8,"WAVE");w(12,"fmt ");d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,8000,true);d.setUint32(28,8000,true);d.setUint16(32,1,true);d.setUint16(34,8,true);w(36,"data");d.setUint32(40,n,true);
  for(var i=0;i<n;i++)b[44+i]=128;var s="";for(i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);return "data:audio/wav;base64,"+btoa(s)}
function unlock(){if(V.unlocked)return;V.unlocked=true;try{V.au=V.au||new Audio();V.au.src=silentWav();var p=V.au.play();if(p&&p.catch)p.catch(function(){V.unlocked=false})}catch(e){V.unlocked=false}}

/* ---------- browserstem als vangnet: kies de mooiste stem van het toestel ---------- */
function pickVoice(){try{var vs=speechSynthesis.getVoices();if(!vs||!vs.length)return;var want=V.lang==="nl"?"nl":"en",best=null,bs=-99;
  vs.forEach(function(v){var l=(v.lang||"").toLowerCase().replace("_","-");if(l.indexOf(want)!==0)return;var n=v.name||"",s=0;
    if(want==="nl"&&l==="nl-nl")s+=3;if(want==="en"&&l==="en-gb")s+=3;
    if(/premium|enhanced|natural|neural|verbeterd|online/i.test(n))s+=5;if(/google/i.test(n))s+=3;if(/siri/i.test(n))s+=4;
    if(/xander|claire|fleur|colette|maarten|serena|daniel|kate|martha|arthur/i.test(n))s+=1;if(/compact|eloquence|espeak/i.test(n))s-=5;
    if(s>bs){bs=s;best=v}});V.voice=best}catch(e){}}
function tts(t,done){try{var ss=window.speechSynthesis;if(!ss){done();return}var u=new SpeechSynthesisUtterance(t);u.lang=V.lang==="nl"?"nl-NL":"en-GB";
  if(V.voice)u.voice=V.voice;u.rate=.95;u.pitch=1.05;var fin=false,end=function(){if(fin)return;fin=true;done()};u.onend=end;u.onerror=end;ss.speak(u);
  setTimeout(function(){if(!fin&&!ss.speaking&&!ss.pending)end()},Math.max(4000,t.length*120))}catch(e){done()}}

/* ---------- ontbrekende zinnen onthouden (voor de stemstudio) ---------- */
function miss(t){if(!V.game)return;try{var k="mmv_missing_"+V.game+"_"+V.lang,a=JSON.parse(localStorage.getItem(k)||"[]"),c=clean(t);
  if(a.indexOf(c)<0){a.push(c);if(a.length>400)a=a.slice(-400);localStorage.setItem(k,JSON.stringify(a))}}catch(e){}}

/* ---------- afspelen: zin voor zin, mp3 als die er is ---------- */
function stopAll(){V.gen++;V.q=[];try{if(V.au){V.au.onended=V.au.onerror=null;V.au.pause()}}catch(e){}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
function file(t){var f=V.have[key(t)];return f?V.base+f:null}
function step(g){if(g!==V.gen)return;var t=V.q.shift();if(t==null)return;var f=file(t);
  if(f){if(!V.au)V.au=new Audio();var a=V.au,go=false,next=function(){if(go)return;go=true;setTimeout(function(){step(g)},120)};
    a.onended=next;a.onerror=function(){if(go)return;go=true;tts(t,function(){step(g)})};a.src=f;
    var p=a.play();if(p&&p.catch)p.catch(function(){if(go)return;go=true;tts(t,function(){step(g)})});
    if(V.q.length){var nf=file(V.q[0]);if(nf){V.next=new Audio();V.next.preload="auto";V.next.src=nf}}}
  else{miss(t);tts(t,function(){step(g)})}}
function say(t){if(!t)return;stopAll();V.q=split(t);if(!V.q.length)return;var g=V.gen;
  if(!V.ready){var w=0,iv=setInterval(function(){if(V.ready||++w>15){clearInterval(iv);step(g)}},100)}else step(g)}
function hush(){stopAll()}

window.MMVoice={init:init,say:say,hush:hush,split:split,key:key,norm:norm,clean:clean,count:function(){return Object.keys(V.have).length}};
})();
