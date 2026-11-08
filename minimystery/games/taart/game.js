/* Wie heeft de taart gepakt? – MiniMystery Thuis & Binnen.
   Een kinder-whodunit voor één telefoon, binnen, met de hele groep rond de tafel. De telefoon is Inspecteur Kruimel.
   Deel 1 (wie?): per ronde een verhoor (de telefoon speelt de verdachte), een opdracht (in huis met timer of een minispel op de telefoon) en een spoor.
   Sporen zijn altijd waar en wijzen een kenmerk aan (vacht, iets op het hoofd, groot/klein, een kleur) of geven één verdachte een alibi.
   Op het sporenbord strepen de kinderen zelf weg (stand Kruimel: Help-knop). Finale: beschuldigen, drie kansen.
   Deel 2 (waar?, bij Normaal en Lang): de dief geeft toe maar zegt niet waar de taart is. Vijf verstopplekken, zelfde spelletje met plek-sporen.
   Alles uit de seed (zaakcode WT…), dus twee telefoons met dezelfde code spelen dezelfde zaak. Artwork van Kellie in games/taart/img wint waar het er is (zie ARTWORK.md). */
(function(){
"use strict";
var MW=window.MW,LS=MW.LS,D=window.WT_DATA,T=D.T,ST=D.STORY,L=D.lang,esc=MW.esc,fill=MW.fill;
var $=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var ID="wt",GK="ss_game_wt_"+L;
var LVL=+LS.get("ss_wt_lvl",0)||0,LEN=LS.get("ss_wt_len","normaal"),NAME=LS.get("ss_wt_name",""),KIDS=LS.get("ss_wt_kids",""),NKIDS=+LS.get("ss_wt_nkids",0)||0,TREAT=LS.get("ss_wt_treat",""),VOICE=LS.get("ss_wt_voice",true);
if(!/^(kort|normaal|lang)$/.test(LEN))LEN="normaal";
var LENR={kort:[4,0],normaal:[4,2],lang:[5,3]};   /* [rondes deel 1, rondes deel 2] */
var SBY={};D.S.forEach(function(s){SBY[s.id]=s});
var TBY={};D.TASKS.forEach(function(t){TBY[t.id]=t});
var G=null,tick=0,tmr=0;

/* ---------- plekken (deel 2) ---------- */
var PLACES=D.PLACES,PC=D.PC;

/* ---------- hulpjes ---------- */
function rngOf(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function shuffle(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
function pick(a,r){return a[Math.floor(r()*a.length)]}
function toast(t){var e=$("#toast");e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},2600)}
function sheet(h){var b=$("#sheetBody");b.onclick=null;b.innerHTML=h;$("#sheet").hidden=false;b.scrollTop=0}
function closeSheet(){hush();$("#sheet").hidden=true;$("#sheetBody").onclick=null}
function buzz(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
var AC=null;function beep(f,d,ty){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.type=ty||"square";o.frequency.value=f||880;g.gain.value=.08;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+(d||.12)/1000);o.stop(AC.currentTime+(d||120)/1000)}catch(e){}}
function cheer(){[523,659,784,1047].forEach(function(f,i){setTimeout(function(){beep(f,160,"triangle")},i*110)})}
function mmss(ms){var s=Math.max(0,Math.floor(ms/1000));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function save(){if(G)LS.set(GK,G)}
function locked(){return !D.FREE&&MW.pro.locked(ID)}
function cap(s){return s.replace(/^./,function(m){return m.toUpperCase()})}
function kids(){return G&&G.kids&&G.kids.length?G.kids:[]}
function jarige(){return (G&&G.name)||T.pick}

/* ---------- stem ---------- */
function say(t){if(!VOICE||!t)return;t=String(t).replace(/<[^>]+>/g,"");if(window.MMVoice)return MMVoice.say(t);try{var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=L==="en"?"en-GB":"nl-NL";u.rate=.95;ss.speak(u)}catch(e){}}
function hush(){if(window.MMVoice)return MMVoice.hush();try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}}
if(window.MMVoice)try{MMVoice.init("taart",L)}catch(e){}
document.addEventListener("click",function(e){var b=e.target.closest(".spk");if(b){hush();VOICE=true;say(b.dataset.say)}});

/* ---------- plaatjes: artwork van Kellie wint, anders getekende verdachten ---------- */
var IMGROOT=MW.root+"games/taart/img/",IM={};
["hero","kruimel","taart","diploma-stempel"].concat(D.S.map(function(s){return s.id})).concat(PLACES.map(function(p){return "plek-"+p.id})).forEach(function(k){var im=new Image();im.src=IMGROOT+k+".webp?v=1";IM[k]=im});
function ok(k){var im=IM[k];return !!(im&&im.complete&&im.naturalWidth)}
Promise.all(Object.keys(IM).map(function(k){return new Promise(function(res){var im=IM[k];if(im.complete)return res();im.onload=im.onerror=function(){res()}})})).then(function(){if(ok("hero"))$("#home").classList.add("photo")});
var KL={oranje:"#f0802a",paars:"#8e5bd6",groen:"#3f9a4f",rood:"#e04a3a",geel:"#f4c20d",blauw:"#3a8fe0",roze:"#f08ab8"};
/* getekende verdachte: hoofd, oren/hoed, ogen, bril, snor, strik, halsband */
function face(s,shadow){var c=shadow?"#1b1b1b":KL[s.kleur],skin=shadow?"#1b1b1b":(s.vacht?(s.id==="bo"?"#c98a4b":"#8b8b8b"):"#f6d1b0"),ln=shadow?"#1b1b1b":"#3b2a14",o="";
  o+='<svg viewBox="0 0 100 100" class="face" aria-hidden="true">';
  if(s.vacht){o+=s.id==="bo"?'<path d="M20 36 Q4 60 16 84 Q24 74 30 50 Z M80 36 Q96 60 84 84 Q76 74 70 50 Z" fill="'+skin+'" stroke="'+ln+'" stroke-width="3" stroke-linejoin="round"/>':'<path d="M22 40 L16 8 L42 28 Z M78 40 L84 8 L58 28 Z" fill="'+skin+'" stroke="'+ln+'" stroke-width="3" stroke-linejoin="round"/>'}
  o+='<circle cx="50" cy="55" r="34" fill="'+skin+'" stroke="'+ln+'" stroke-width="3"/>';
  if(s.id==="toos")o+='<path d="M28 42 Q28 6 50 6 Q72 6 72 42 Z" fill="'+c+'" stroke="'+ln+'" stroke-width="3"/><path d="M10 44 Q50 32 90 44 L90 48 L10 48 Z" fill="'+c+'" stroke="'+ln+'" stroke-width="3"/><circle cx="66" cy="18" r="7" fill="'+(shadow?"#1b1b1b":"#fff")+'" stroke="'+ln+'" stroke-width="2"/>';
  if(s.id==="bertus")o+='<path d="M16 38 Q50 2 84 38 Z" fill="'+c+'" stroke="'+ln+'" stroke-width="3"/><path d="M60 40 L92 44 L88 50 L60 48 Z" fill="'+c+'" stroke="'+ln+'" stroke-width="3"/>';
  if(s.id==="teun")o+='<path d="M18 40 Q50 4 82 40 Z" fill="'+c+'" stroke="'+ln+'" stroke-width="3"/><path d="M40 42 L8 46 L12 52 L40 50 Z" fill="'+c+'" stroke="'+ln+'" stroke-width="3"/>';
  if(s.id==="fien")o+='<path d="M16 40 Q50 2 84 40 Q50 24 16 40 Z" fill="'+(shadow?"#1b1b1b":"#c4612a")+'"/><path d="M82 36 Q96 52 84 70 Q90 52 78 40 Z" fill="'+(shadow?"#1b1b1b":"#c4612a")+'"/>';
  if(s.id==="lot")o+='<path d="M18 40 Q50 6 82 40 Q50 30 18 40 Z" fill="'+(shadow?"#1b1b1b":"#5b3a1e")+'"/><circle cx="50" cy="16" r="10" fill="'+(shadow?"#1b1b1b":"#5b3a1e")+'"/>';
  if(s.id==="mimi")o+='<path d="M60 24 L74 14 L72 30 Z M60 24 L48 14 L50 30 Z" fill="'+c+'" stroke="'+ln+'" stroke-width="2"/>';
  if(!shadow){
    o+='<circle cx="38" cy="54" r="4" fill="'+ln+'"/><circle cx="62" cy="54" r="4" fill="'+ln+'"/>';
    if(s.id==="toos"||s.id==="bertus")o+='<circle cx="38" cy="54" r="9" fill="none" stroke="'+ln+'" stroke-width="2.5"/><circle cx="62" cy="54" r="9" fill="none" stroke="'+ln+'" stroke-width="2.5"/><path d="M47 54 L53 54" stroke="'+ln+'" stroke-width="2.5"/>';
    if(s.id==="bertus")o+='<path d="M34 68 Q50 60 66 68 Q50 80 34 68 Z" fill="#777"/>';
    if(s.id==="fien")o+='<rect x="34" y="84" width="32" height="14" rx="3" fill="'+c+'"/>';
    if(s.id==="toos")o+='<path d="M30 86 L70 86 L74 100 L26 100 Z" fill="'+c+'"/>';
    if(s.id==="lot")o+='<path d="M26 86 L74 86 L80 100 L20 100 Z" fill="'+c+'"/>';
    if(s.vacht){o+='<ellipse cx="50" cy="66" rx="7" ry="5" fill="'+(s.id==="bo"?"#2b1d12":"#e5a0b5")+'"/><path d="M28 70 L12 66 M28 73 L12 76 M72 70 L88 66 M72 73 L88 76" stroke="'+ln+'" stroke-width="2"/>';
      if(s.id==="bo")o+='<path d="M22 90 Q50 100 78 90" stroke="'+c+'" stroke-width="7" fill="none"/>';
}
    if(!s.vacht)o+='<path d="M40 74 Q50 82 60 74" stroke="'+ln+'" stroke-width="3" fill="none" stroke-linecap="round"/>';
    if(s.id==="teun")o+='<circle cx="80" cy="86" r="8" fill="'+c+'"/><circle cx="90" cy="94" r="5" fill="#e04a3a"/>';
  }
  o+='</svg>';return o}
function pic(s,shadow){return ok(s.id)&&!shadow?'<img class="face" src="'+IMGROOT+s.id+'.webp?v=1" alt="">':face(s,shadow)}
function placePic(p){var ic={schuur:"🏚️",koelkast:"🧊",zolder:"🪜",bank:"🛋️",boom:"🌳"}[p.id];return ok("plek-"+p.id)?'<img class="face" src="'+IMGROOT+'plek-'+p.id+'.webp?v=1" alt="">':'<span class="face emo">'+ic+'</span>'}
var KRUIMELAV='<span class="avatar kr" aria-hidden="true">🐭</span>';
function bubble(txt,who,av,cls){return '<div class="msg '+(cls||"")+'">'+(av||KRUIMELAV)+'<div class="bub"><button type="button" class="spk" aria-label="Voorlezen" data-say="'+esc(txt.replace(/<[^>]+>/g,""))+'">🔊</button>'+(who?'<b>'+esc(who)+'</b>':'')+'<p>'+txt+'</p></div></div>'}

/* ---------- de zaak samenstellen (alleen uit de seed) ---------- */
/* zoek een rij van N sporen die bij elke stap minstens één kandidaat wegstreept en precies op 1 eindigt */
function findClues(items,culprit,feats,N,r,maxA){var cands=[];maxA=maxA==null?2:maxA;
  feats.forEach(function(f){cands.push({type:f,val:!!culprit[f]})});
  items.forEach(function(it){if(it!==culprit)cands.push({type:"alibi",id:it.id})});
  function elim(c,set){return set.filter(function(it){return c.type==="alibi"?it.id!==c.id:!!it[c.type]===c.val})}
  function dfs(set,seq,used){if(seq.length===N)return set.length===1?seq:null;
    var left=N-seq.length,na=seq.filter(function(c){return c.type==="alibi"}).length;var free=cands.map(function(c,i){return i}).filter(function(i){return !used[i]});
    var opts=shuffle(free.filter(function(i){return cands[i].type!=="alibi"}),r).concat(shuffle(free.filter(function(i){return cands[i].type==="alibi"}),r));
    for(var k=0;k<opts.length;k++){var i=opts[k],c=cands[i],ns=elim(c,set);if(ns.length>=set.length)continue;if(ns.length<1)continue;if(left>1&&ns.length<2)continue;if(ns.length-1>(left-1)*3)continue;if(c.type==="alibi"&&na>=maxA)continue;
      used[i]=1;var res=dfs(ns,seq.concat([c]),used);used[i]=0;if(res)return res}
    return null}
  return dfs(items.slice(),[],{})}
/* opdrachten kiezen: elke zaak een mix van spoor-onthullers, meet-spellen en puzzels; het tekenspoor komt op een ronde met een tekenbaar spoor */
function cvKey(R){var c=R.clue;return c.type==="alibi"?"alibi:"+c.id:c.type==="kleur"?"kleur":c.type+":"+c.val}
function pickTasks(rounds,lvl,r){
  var okT=function(id){var t=TBY[id];return !!t&&(t.lv==null||t.lv<=lvl)};
  var groups=[["teken"],["blaas","kras","schud"],["sluip","draag"],["puzzel","code","verschil","doolhof"],["orkest","foto","raadsel"],["kras","blaas","schud","puzzel","code"],["draag","sluip","verschil","doolhof","raadsel","orkest"]];
  var want=[],used={};
  groups.forEach(function(g){var c=shuffle(g.filter(function(id){return okT(id)&&!used[id]}),r)[0];if(c){want.push(c);used[c]=1}});
  var rest=shuffle(D.TASKS.map(function(t){return t.id}).filter(function(id){return okT(id)&&!used[id]}),r);
  while(want.length<rounds.length&&rest.length)want.push(rest.shift());
  want=want.slice(0,rounds.length);
  var out=new Array(rounds.length),free=rounds.map(function(_,i){return i}),ti=want.indexOf("teken");
  if(ti>=0){want.splice(ti,1);var el=shuffle(free.filter(function(i){var v=D.CV[cvKey(rounds[i])];return v&&v.draw}),r);
    if(el.length){out[el[0]]="teken";free.splice(free.indexOf(el[0]),1)}else want.push(rest.shift()||"kruimels")}
  want=shuffle(want,r);free.forEach(function(i,k){out[i]=want[k]||rest.shift()||"kruimels"});
  return out}
function genCase(seed,len,lvl){var r=rngOf(seed),n1=LENR[len][0],n2=LENR[len][1];
  var culprit=pick(D.S,r),place=pick(PLACES,r);
  var clues=findClues(D.S,culprit,["vacht","hoed","klein","kleur"],n1,r)||findClues(D.S,culprit,["vacht","hoed","klein","kleur"],n1,rngOf(seed+7),9);
  var pclues=n2?findClues(PLACES,place,["buiten","hoog","koud"],n2,r,1)||findClues(PLACES,place,["buiten","hoog","koud"],n2,rngOf(seed+9),9):[];
  var sus=shuffle(D.S.map(function(s){return s.id}),r),rounds=[];
  for(var i=0;i<n1+n2;i++)rounds.push({part:i<n1?1:2,s:i<n1?sus[i]||null:null,clue:i<n1?clues[i]:pclues[i-n1],k:Math.floor(r()*1e9)});
  var ts=pickTasks(rounds,lvl||0,r);rounds.forEach(function(R,i){R.task=ts[i]});
  /* vaste gegevens voor minispellen, zodat beide telefoons hetzelfde zien */
  var mk={vinger:Math.floor(r()*1e9),geheugen:Math.floor(r()*1e9),slot:Math.floor(r()*1e9),spiegel:Math.floor(r()*1e9),schaduw:pick(D.S,r).id,kaarsjes:5+Math.floor(r()*8),kruimels:Math.floor(r()*1e9)};
  return{culprit:culprit.id,place:place.id,rounds:rounds,mk:mk}}
function makeCode(seed,lvl,len){return"WT"+(lvl+1)+(len==="kort"?"K":len==="lang"?"L":"N")+seed.toString(36).toUpperCase()}
function parseCode(v){var m=/^WT([12])([KNL])([0-9A-Z]{1,8})$/.exec(MW.norm(v));if(!m)return null;var seed=parseInt(m[3],36);if(!(seed>=0)||seed>4294967295)return null;return{lvl:+m[1]-1,len:m[2]==="K"?"kort":m[2]==="L"?"lang":"normaal",seed:seed}}
function newGame(o){var seed=o.seed!=null?o.seed:Math.floor(Math.random()*4294967295);var c=genCase(seed,o.len,o.lvl);
  var ks=KIDS.split(/[,;\n]+/).map(function(s){return s.trim()}).filter(Boolean).slice(0,12);
  if(!ks.length&&NKIDS>0)for(var i=1;i<=Math.min(12,NKIDS);i++)ks.push("Kind "+i);
  var r=rngOf(seed^0x5bd1e995),ms=shuffle(D.MISSIONS.map(function(_,i){return i}),r).slice(0,ks.length);
  G={seed:seed,code:makeCode(seed,o.lvl,o.len),lvl:o.lvl,len:o.len,name:NAME,kids:ks,missions:ms,treat:TREAT,demo:!!o.demo,
     c:c,r:0,phase:"verhoor",struck:{},pstruck:{},seen:0,pseen:0,t0:0,tries:3,ptries:2,accused:[],won:false,found:false,stars:0,hints:0};
  save()}

/* ---------- startscherm ---------- */
function home(){clearInterval(tmr);hush();show("home");
  var g=LS.get(GK,null);$("#bResume").hidden=!(g&&g.c&&!(g.won&&(g.found||!LENR[g.len][1])));
  $("#name").value=NAME;$("#kids").value=KIDS;$("#nkids").value=NKIDS||"";
  $$("#lvl button").forEach(function(b){b.setAttribute("aria-pressed",+b.dataset.l===LVL)});
  $$("#len button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.n===LEN)});
  $("#bVoice").setAttribute("aria-pressed",VOICE);
  $("#status").textContent=D.FREE?"":(MW.pro.isPro(ID)?T.proOn:T.proOff);$("#bPro").hidden=D.FREE||MW.pro.isPro(ID);$("#bPro").textContent=MW.t(L).pro;
  $("#bTreat").textContent=T.treatBtn+(TREAT?" ✓":"")}
function show(id){$$(".screen").forEach(function(s){s.hidden=s.id!==id});window.scrollTo(0,0)}
$("#name").oninput=function(){NAME=this.value.trim();LS.set("ss_wt_name",NAME)};
$("#kids").oninput=function(){KIDS=this.value;LS.set("ss_wt_kids",KIDS)};
$("#nkids").oninput=function(){NKIDS=+this.value||0;LS.set("ss_wt_nkids",NKIDS)};
$("#lvl").onclick=function(e){var b=e.target.closest("button");if(!b)return;LVL=+b.dataset.l;LS.set("ss_wt_lvl",LVL);home()};
$("#len").onclick=function(e){var b=e.target.closest("button");if(!b)return;LEN=b.dataset.n;LS.set("ss_wt_len",LEN);home()};
$("#bVoice").onclick=function(){VOICE=!VOICE;LS.set("ss_wt_voice",VOICE);if(!VOICE)hush();home()};
$("#bHow").onclick=function(){var h=$("#howT");h.hidden=!h.hidden};
$("#bTreat").onclick=function(){sheet('<h2>'+esc(T.treatBtn)+'</h2><p class="note">'+esc(T.treatQ)+'</p><input class="inp" id="treatIn" maxlength="80" placeholder="'+esc(T.treatPh)+'" value="'+esc(TREAT)+'"><button type="button" class="btn" id="treatOk">'+esc(T.ready)+'</button><button type="button" class="btn ghost dk" id="shX">'+esc(T.cancel)+'</button>');
  $("#treatOk").onclick=function(){TREAT=$("#treatIn").value.trim();LS.set("ss_wt_treat",TREAT);closeSheet();home()};$("#shX").onclick=closeSheet};
$("#bPro").onclick=proSheet;
function proSheet(){sheet(MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+esc(T.cancel)+'</button>');$("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)})}
$("#bStart").onclick=function(){var demo=locked();newGame({lvl:LVL,len:LEN,demo:demo});if(demo)toast(T.demo);brief()};
$("#bDemo").onclick=function(){newGame({lvl:LVL,len:LEN,demo:true});brief()};
$("#bResume").onclick=function(){G=LS.get(GK,null);if(!G||!G.c)return home();route()};
$("#bCode").onclick=function(){sheet('<h2>'+esc(T.codeT)+'</h2><p class="note">'+esc(T.codeQ)+'</p><input class="inp" id="codeIn" autocapitalize="characters" autocomplete="off" placeholder="WT1N…"><p class="err" id="codeMsg"></p><button type="button" class="btn" id="codeOk">'+esc(T.ready)+'</button><button type="button" class="btn ghost dk" id="shX">'+esc(T.cancel)+'</button>');
  $("#shX").onclick=closeSheet;$("#codeOk").onclick=function(){var p=parseCode($("#codeIn").value);if(!p){$("#codeMsg").textContent=T.codeBad;return}LVL=p.lvl;LEN=p.len;newGame({lvl:p.lvl,len:p.len,seed:p.seed,demo:locked()});closeSheet();toast(T.codeOk);brief()}};
$("#bArch").onclick=function(){var g=MW.profile.get().games.wt,log=(g&&g.log)||[];
  sheet('<h2>'+esc(T.arch)+'</h2>'+(log.length?'<ul class="log">'+log.map(function(l){return '<li><b>'+esc(l.d)+'</b> '+"★".repeat(l.st)+"☆".repeat(3-l.st)+' · '+l.m+' min · '+esc(l.c)+'</li>'}).join("")+'</ul>':'<p class="note">–</p>')+'<button type="button" class="btn ghost dk" id="shX">'+esc(T.back)+'</button>');$("#shX").onclick=closeSheet};
$("#bWipe").onclick=function(){sheet('<h2>'+esc(T.wipeQ)+'</h2><p class="note">'+esc(T.wipeT)+'</p><button type="button" class="btn red" id="wY">'+esc(T.wipeY)+'</button><button type="button" class="btn ghost dk" id="shX">'+esc(T.cancel)+'</button>');
  $("#shX").onclick=closeSheet;$("#wY").onclick=function(){LS.del(GK);var p=MW.profile.get();delete p.games.wt;MW.profile.save(p);closeSheet();toast(T.wiped);home()}};
$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};
$("#sheet").onclick=function(e){if(e.target.id==="sheet")closeSheet()};

function holdBind(h){var a=function(e){e.preventDefault();h.classList.add("on")},b=function(){h.classList.remove("on")};
  h.addEventListener("pointerdown",a);h.addEventListener("pointerup",b);h.addEventListener("pointercancel",b);h.addEventListener("pointerleave",b);h.addEventListener("contextmenu",function(e){e.preventDefault()})}
/* ---------- briefing: verhaal, verdachten, rollen, geheime missies ---------- */
function brief(){show("brief");var nm=jarige();
  $("#bfBody").innerHTML=bubble(esc(fill(ST.open,{naam:nm})))+bubble(esc(ST.open2))+'<p class="eyebrow">'+esc(ST.intro)+'</p><div class="sus">'+D.S.map(function(s){return '<div class="sc">'+pic(s)+'<b>'+esc(s.name)+'</b><small>'+esc(s.thing)+'</small></div>'}).join("")+'</div>'+
    '<p class="note">'+esc(T.cluesN.replace("{n}","0").replace("{m}",G.c.rounds.filter(function(x){return x.part===1}).length))+' · '+esc(G.code)+'</p>';
  say(fill(ST.open,{naam:nm})+" "+ST.open2);
  $("#bGo").onclick=function(){hush();if(kids().length>=2&&G.r===0&&!G.msDone)missions(0);else{G.t0=G.t0||Date.now();save();route()}}}
function missions(i){var ks=kids();if(i>=ks.length){G.msDone=true;G.t0=Date.now();save();sheet('<h2>'+esc(T.secret)+'</h2><p>'+esc(T.secretDone)+'</p><button type="button" class="btn" id="shX">'+esc(T.next)+'</button>');$("#shX").onclick=function(){closeSheet();route()};return}
  var m=D.MISSIONS[G.missions[i]];
  sheet('<h2>'+esc(T.secret)+': '+esc(ks[i])+'</h2><p class="note">'+esc(T.secretHold)+'</p><button type="button" class="hold" id="hold"><span class="hid">'+esc(m)+'</span><em>👁 '+esc(ks[i])+'</em></button><button type="button" class="btn" id="msNext">'+esc(i+1<ks.length?fill(T.secretNext,{k:ks[i+1]}):T.next)+'</button>');
  holdBind($("#hold"));
  $("#msNext").onclick=function(){missions(i+1)}}

/* ---------- de spelronde ---------- */
function cur(){return G.c.rounds[G.r]}
function roles(){var ks=kids(),n=ks.length,r=G.r;if(n<2)return D.ROLES.map(function(x){return [x[0],T.pick]});return D.ROLES.map(function(x,i){return [x[0],ks[(r+i)%n]]})}
function hud(){var n1=G.c.rounds.filter(function(x){return x.part===1}).length,p=cur().part;
  $("#hR").textContent=fill(T.round,{n:p===1?G.r+1:G.r-n1+1,m:p===1?n1:G.c.rounds.length-n1});$("#hS").textContent=p===1?G.seen+"/"+n1:G.pseen+"/"+(G.c.rounds.length-n1);
  clearInterval(tmr);tmr=setInterval(function(){$("#hT").textContent=mmss(Date.now()-(G.t0||Date.now()))},1000);$("#hT").textContent=mmss(Date.now()-(G.t0||Date.now()))}
function route(){if(G.won&&(G.found||!LENR[G.len][1]))return finale();if(G.r>=G.c.rounds.length)return cur2();
  if(G.phase==="part2")return part2();if(G.phase==="pfind")return pfind();
  show("play");hud();var ph=G.phase;if(ph==="verhoor")verhoor();else if(ph==="task")task();else if(ph==="clue")clue();else if(ph==="board")board();else if(ph==="accuse")accuse();else verhoor()}
function cur2(){/* alle rondes gespeeld */if(!G.won){G.phase="accuse";G.r=G.c.rounds.length-1;return route()}if(!G.found){G.phase="pfind";return pfind()}finale()}
function nextPhase(){var R=cur();
  if(G.phase==="verhoor")G.phase="task";
  else if(G.phase==="task")G.phase="clue";
  else if(G.phase==="clue")G.phase="board";
  else if(G.phase==="board"){var n1=G.c.rounds.filter(function(x){return x.part===1}).length;
    if(R.part===1&&G.r===n1-1&&!G.won)G.phase="accuse";
    else if(R.part===2&&G.r===G.c.rounds.length-1)G.phase="pfind";
    else{G.r++;G.phase=cur().part===1&&cur().s!==null?"verhoor":cur().part===2&&G.r===n1?"part2":"task";if(cur().part===1&&cur().s===null)G.phase="task"}}
  save();if(G.demo&&locked()&&G.r>=2&&G.phase!=="board")return lockSheet();route()}
function lockSheet(){show("play");sheet('<h2>'+esc(T.locked)+'</h2><p>'+esc(T.lockedT)+'</p>'+MW.proHTML(L,"pro",ID)+'<button type="button" class="btn ghost dk" id="shX">'+esc(T.home)+'</button>');
  $("#shX").onclick=function(){closeSheet();home()};MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();toast(msg);if(!locked()){G.demo=false;save();route()}else home()})}
function roleLine(){return '<div class="roles"><span class="eyebrow">'+esc(T.roles)+'</span>'+roles().map(function(x){return '<span class="role"><b>'+esc(x[0])+'</b> '+esc(x[1])+'</span>'}).join("")+'</div>'}
function card(h,btn){$("#card").innerHTML=h+(btn||"")}

function verhoor(){var R=cur(),s=SBY[R.s],rl=roles();
  var line=(G.lvl===1&&R.s===G.c.culprit)?pick(s.lie,rngOf(G.seed+G.r)):pick(s.truth,rngOf(G.seed+G.r));
  var q=fill(ST.verhoor,{n:G.r+1,role:rl[0][1]===T.pick?rl[0][0]:rl[0][1],s:s.name});
  card('<h2>'+esc(T.verhoor)+'</h2>'+roleLine()+bubble(esc(q))+'<div class="suspect">'+pic(s)+'<div><b>'+esc(s.name)+'</b><small>'+esc(s.thing)+'</small></div></div>'+bubble(esc(line),s.name,'<span class="avatar sv" aria-hidden="true">'+pic(s)+'</span>',"sv")+'<p class="note">'+esc(G.lvl===1?ST.verhoorTip:ST.verhoorTipEasy)+'</p>','<button type="button" class="btn" id="bNext">'+esc(T.next)+'</button>');
  say(q+" "+s.name+" zegt: "+line);$("#bNext").onclick=function(){hush();nextPhase()}}

function task(){stopTask();var R=cur(),t=TBY[R.task]||TBY.kruimels,rl=roles();
  var head='<h2>'+esc(T.task)+': '+esc(t.t)+'</h2>'+(R.part===1&&R.s===null?bubble(esc(fill(ST.extra,{n:G.r+1}))):'')+'<p class="tk">'+esc(kids().length>=2?fill(ST.task,{role:rl[1][1],timer:rl[2][1]}):ST.task.split(".")[0]+".")+'</p>';
  say(t.kind==="riddle"?t.t+". "+riddleOf(R).q:t.kind==="photo"?t.t+". "+t.d+" "+photoPrompt(R):t.t+". "+t.d);
  var f={draw:tDraw,scratch:tScratch,blow:tBlow,puzzle:tPuzzle,code:tCode,shake:tShake,sneak:tSneak,tilt:tTilt,simon:tSimon,photo:tPhoto,diff:tDiff,maze:tMaze,riddle:tRiddle,freeze:taskFreeze,house:taskHouse}[t.kind];
  if(f)return f(t,head,R);
  ({kruimels:miniKruimels,vinger:miniVinger,geheugen:miniGeheugen,slot:miniSlot,spiegel:miniSpiegel,schaduw:miniSchaduw,kaarsjes:miniKaarsjes}[t.id]||miniKruimels)(t,head)}
var TK={};
function on(el,ev,fn,o){el.addEventListener(ev,fn,o);(TK.off=TK.off||[]).push(function(){el.removeEventListener(ev,fn,o)})}
function stopTask(){clearInterval(task.t);clearTimeout(task.t);clearTimeout(task.t2);if(TK.raf)cancelAnimationFrame(TK.raf);(TK.off||[]).forEach(function(f){try{f()}catch(e){}});TK={};micClose();var c=$("#card");if(c)c.onclick=null}
function taskDone(t){if(TK.done)return;stopTask();TK.done=1;cheer();buzz([60,40,60]);toast(t.ok||T.ready);setTimeout(nextPhase,700)}
/* een opdracht die het spoor zelf onthult */
function reveal(v,extra){stopTask();cheer();buzz([60,40,60,40,120]);
  card('<h2>'+esc(T.reveal)+'</h2><div class="reveal"><div class="rv-em">'+v.em+'</div><div class="rv-word">'+esc(v.word)+'</div></div>'+(extra||''),'<button type="button" class="btn" id="bNext">'+esc(T.clue)+' ▸</button>');
  say(T.reveal+" "+v.word.toLowerCase());$("#bNext").onclick=function(){hush();nextPhase()}}
function taskHouse(t,head){card(head+'<p class="big">'+esc(t.d)+'</p>'+(t.sec?'<div class="timer" id="tmr">'+mmss(t.sec*1000)+'</div><button type="button" class="btn ghost" id="bTmr">▶ '+esc(T.time)+'</button>':''),'<button type="button" class="btn" id="bDone">'+esc(T.done)+'</button>');
  if(t.sec){$("#bTmr").onclick=function(){var end=Date.now()+t.sec*1000;this.disabled=true;clearInterval(task.t);task.t=setInterval(function(){var l=end-Date.now();$("#tmr").textContent=mmss(l);if(l<=0){clearInterval(task.t);$("#tmr").textContent="0:00";beep(440,400);buzz(300)}else if(l<5500&&Math.floor(l/1000)!==Math.floor((l+1000)/1000))beep(660,80)},200)}}
  $("#bDone").onclick=function(){taskDone(t)}}
function taskFreeze(t,head){TK.done=0;var n=0;card(head+'<p class="big">'+esc(t.d)+'</p><div class="freeze" id="fz">'+esc(T.freeze)+'</div>','<button type="button" class="btn" id="bDone" disabled>'+esc(T.done)+'</button>');
  function go(){$("#fz").textContent=T.freezeGo;$("#fz").classList.remove("stop");say(T.freezeGo);task.t=setTimeout(stop,4000+Math.random()*5000)}
  function stop(){n++;$("#fz").textContent=T.freezeStop;$("#fz").classList.add("stop");beep(220,500,"sawtooth");buzz([200,100,200]);say(T.freezeStop);if(n>=3){$("#bDone").disabled=false;return}task.t=setTimeout(go,4000)}
  setTimeout(go,1500);$("#bDone").onclick=function(){clearTimeout(task.t);taskDone(t)}}

/* ---------- minispellen ---------- */
function miniKruimels(t,head){var need=G.lvl?15:10,got=0,alive=true,dur=G.lvl?2200:3200;
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="arena" id="ar"></div><p class="score" id="sc">'+esc(fill(T.kruimels,{n:0,m:need}))+'</p>','');
  var ar=$("#ar"),k=0;
  function spawn(){if(!alive||k>=need+4)return;k++;var e=document.createElement("button");e.type="button";e.className="crumb";e.textContent=pick(["🍪","🧁","🍰","🍩"],Math.random);e.style.left=(5+Math.random()*80)+"%";e.style.animationDuration=dur+"ms";
    e.onclick=function(){if(!alive)return;got++;beep(900+got*30,60);e.remove();$("#sc").textContent=fill(T.kruimels,{n:got,m:need});if(got>=need){alive=false;setTimeout(function(){taskDone({ok:T.kruimelsOk})},300)}};
    e.addEventListener("animationend",function(){e.remove()});ar.appendChild(e);task.t=setTimeout(spawn,G.lvl?600:800)}
  task.t=setTimeout(spawn,600);
  task.t2=setTimeout(function(){if(alive&&got<need){alive=false;card(head+'<p class="big">'+esc(T.kruimelsFail)+'</p>','<button type="button" class="btn" id="bAg">'+esc(T.again)+'</button>');$("#bAg").onclick=function(){miniKruimels(t,head)}}},(need+5)*(G.lvl?600:800)+dur)}
function printSvg(seed,variant){var r=rngOf(seed),o='<svg viewBox="0 0 100 100" class="fp">';
  for(var i=0;i<7;i++){var rad=8+i*6,gap=r()*360,len=200+r()*120;if(variant&&(i===variant.i||i===(variant.i+3)%7)){gap=(gap+variant.d)%360;len=i===variant.i?120:len}
    o+='<path d="'+arc(50,52,rad,gap,gap+len)+'" fill="none" stroke="#3b2a14" stroke-width="2.4" stroke-linecap="round"/>'}
  return o+'</svg>'}
function arc(cx,cy,r,a0,a1){var p=function(a){a=a*Math.PI/180;return (cx+r*Math.cos(a)).toFixed(1)+" "+(cy+r*Math.sin(a)).toFixed(1)};return "M"+p(a0)+" A"+r+" "+r+" 0 "+(a1-a0>180?1:0)+" 1 "+p(a1)}
function miniPick(head,question,target,opts,right,onRight){card(head+'<p class="note">'+esc(question)+'</p>'+(target||'')+'<div class="opts">'+opts.map(function(o,i){return '<button type="button" class="opt" data-i="'+i+'">'+o+'</button>'}).join("")+'</div>','');
  $("#card").onclick=function(e){var b=e.target.closest(".opt");if(!b)return;if(+b.dataset.i===right){b.classList.add("ok");$("#card").onclick=null;onRight()}else{b.classList.add("bad");beep(200,200);buzz(150);toast(T.wrongPick)}}}
function miniVinger(t,head){var seed=G.c.mk.vinger,r=rngOf(seed+1),right=Math.floor(r()*4),opts=[];
  for(var i=0;i<4;i++)opts.push(i===right?printSvg(seed):printSvg(seed,{i:Math.floor(r()*7),d:90+r()*180}));
  miniPick(head,T.vingerQ,'<div class="target">'+printSvg(seed)+'</div>',opts,right,function(){taskDone({ok:T.rightPick})})}
var ITEMS=["🍎","🥛","🧂","🍌","🥄","🫖","🧀","🥕","🍋","🥚","🍞","🧁","🥤","🍯","🫙","🍇"];
function miniGeheugen(t,head){var r=rngOf(G.c.mk.geheugen),all=shuffle(ITEMS,r),shown=all.slice(0,8),gone=pick(shown,r),rest=shown.filter(function(x){return x!==gone}),n=G.lvl?6:9;
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="counter"><div class="shelf">'+shown.map(function(x){return '<span>'+x+'</span>'}).join("")+'</div><div class="cd" id="cd">'+n+'</div></div>','');
  task.t=setInterval(function(){n--;$("#cd").textContent=n;if(n<=0){clearInterval(task.t);var opts=shuffle([gone].concat(all.slice(8,11)),r),right=opts.indexOf(gone);
    miniPick(head,T.geheugenQ,'<div class="counter"><div class="shelf">'+shuffle(rest,r).map(function(x){return '<span>'+x+'</span>'}).join("")+'</div></div>',opts,right,function(){taskDone({ok:T.rightPick})})}},1000)}
var SYM=[["🍓","aardbei"],["🍌","banaan"],["🧀","kaas"],["🥕","wortel"],["🍪","koek"],["🥛","melk"]];
function miniSlot(t,head){var r=rngOf(G.c.mk.slot),order=shuffle(SYM,r).slice(0,3),grid=shuffle(SYM,r),k=0;
  var rhyme=fill(T.slotRhyme,{a:order[0][1],b:order[1][1],c:order[2][1]});
  card(head+'<p class="note">'+esc(t.d)+'</p>'+bubble(esc(rhyme))+'<div class="lock" id="lk">'+grid.map(function(s){return '<button type="button" class="opt sym" data-s="'+s[1]+'">'+s[0]+'</button>'}).join("")+'</div><p class="score" id="sc">● ● ●</p>','');
  say(rhyme);$("#lk").onclick=function(e){var b=e.target.closest(".sym");if(!b)return;if(b.dataset.s===order[k][1]){k++;b.classList.add("ok");beep(600+k*120,100);$("#sc").textContent="● ● ●".split(" ").map(function(x,i){return i<k?"✓":"●"}).join(" ");if(k===3){$("#lk").onclick=null;taskDone({ok:T.slotOk})}}else{k=0;$$(".sym").forEach(function(x){x.classList.remove("ok")});$("#sc").textContent="● ● ●";beep(200,250);buzz(200);toast(T.slotWrong)}}}
var WORDS=["KOELKAST","SLAGROOM","KAARSJES","TAARTJE","KRUIMEL","VORKJE","SCHOTEL","CADEAU"];
function miniSpiegel(t,head){var r=rngOf(G.c.mk.spiegel),ws=shuffle(WORDS,r).slice(0,4),right=Math.floor(r()*4);
  miniPick(head,T.spiegelQ,'<div class="mirror">'+esc(ws[right])+'</div>',ws.map(esc),right,function(){taskDone({ok:T.rightPick})})}
function miniSchaduw(t,head){var s=SBY[G.c.mk.schaduw],right=D.S.indexOf(s);
  miniPick(head,T.schaduwQ,'<div class="target shadow">'+face(s,true)+'</div>',D.S.map(function(x){return esc(x.short)}),right,function(){taskDone({ok:T.rightPick})})}
function miniKaarsjes(t,head){var n=G.c.mk.kaarsjes,r=rngOf(n*77+G.seed),cs=[],i;for(i=0;i<n;i++)cs.push('<span style="left:'+(6+r()*84)+'%;top:'+(10+r()*70)+'%">🕯️</span>');
  var opts=shuffle([n,n-1,n+1,n+2].filter(function(x){return x>0}),r),right=opts.indexOf(n),sec=G.lvl?4:7;
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="cake" id="ck">'+cs.join("")+'</div><div class="cd" id="cd">'+sec+'</div>','');
  task.t=setInterval(function(){sec--;$("#cd").textContent=sec;if(sec<=0){clearInterval(task.t);miniPick(head,T.kaarsjesQ,'<div class="cake dark">🎂</div>',opts.map(String),right,function(){taskDone({ok:T.rightPick})})}},1000)}

/* ================= nieuwe opdrachten ================= */
/* hoe een spoor eruitziet: plaatje, woord voor het geheimschrift, wat de tekenaar tekent */
function cv(R){var v=Object.assign({em:"🔍",word:"SPOOR"},D.CV[cvKey(R)]||{});
  if(R.clue.type==="kleur"){var s=SBY[G.c.culprit];v.word=s.kleurNaam.toUpperCase();v.draw=fill(v.draw,{k:s.kleurNaam});v.label=fill(v.label,{k:s.kleurNaam});v.col=KL[s.kleur]}
  return v}
function riddleOf(R){var r=rngOf(R.k+31),pool=D.RIDDLES.filter(function(x){return x.lv===G.lvl});return pick(pool.length?pool:D.RIDDLES,r)}
function photoPrompt(R){return pick(D.PHOTOS,rngOf(R.k+41))}
function ptIn(el,e){var b=el.getBoundingClientRect();return{x:e.clientX-b.left,y:e.clientY-b.top}}
function canvasFit(c,w,h){var d=Math.min(2,window.devicePixelRatio||1);c.width=Math.round(w*d);c.height=Math.round(h*d);c.style.width=w+"px";c.style.height=h+"px";var x=c.getContext("2d");x.setTransform(d,0,0,d,0,0);return x}
function snap(c,max,q){max=max||260;var s=Math.min(1,max/Math.max(c.width,c.height)),o=document.createElement("canvas");o.width=Math.round(c.width*s);o.height=Math.round(c.height*s);var x=o.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,o.width,o.height);x.drawImage(c,0,0,o.width,o.height);return o.toDataURL("image/jpeg",q||.72)}
function media(k,m){G.media=G.media||{};G.media[k]=m;try{save()}catch(e){delete G.media[k]}}
function whoDraws(){var n=roles()[1][1];return n===T.pick?T.drawSomeone:n}
function meterSet(f){var m=$("#mt");if(m)m.style.width=Math.max(0,Math.min(100,f*100))+"%"}

/* ---------- microfoon en bewegingssensoren ---------- */
var MIC={};
function micOpen(){if(MIC.an)return Promise.resolve(MIC);if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return Promise.reject(new Error("geen microfoon"));
  return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).then(function(st){
    var C=window.AudioContext||window.webkitAudioContext,ctx=new C(),src=ctx.createMediaStreamSource(st),an=ctx.createAnalyser();an.fftSize=1024;src.connect(an);
    if(ctx.state==="suspended")ctx.resume();MIC={st:st,ctx:ctx,an:an,buf:new Uint8Array(an.fftSize)};return MIC})}
function micLevel(){if(!MIC.an)return 0;MIC.an.getByteTimeDomainData(MIC.buf);var s=0,b=MIC.buf;for(var i=0;i<b.length;i++){var v=(b[i]-128)/128;s+=v*v}return Math.sqrt(s/b.length)}
function micClose(){try{if(MIC.st)MIC.st.getTracks().forEach(function(t){t.stop()});if(MIC.ctx)MIC.ctx.close()}catch(e){}MIC={}}
function motionPerm(){var a=[];try{if(window.DeviceMotionEvent&&typeof DeviceMotionEvent.requestPermission==="function")a.push(DeviceMotionEvent.requestPermission());if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")a.push(DeviceOrientationEvent.requestPermission())}catch(e){}
  return Promise.all(a).then(function(r){return r.every(function(x){return x==="granted"})},function(){return false})}
function loop(fn){var last=performance.now();(function f(now){var dt=Math.min(.05,(now-last)/1000);last=now;if(fn(dt,now)===false)return;TK.raf=requestAnimationFrame(f)})(last)}

/* ---------- tekenspoor: één kind tekent het spoor, de rest raadt ---------- */
var PEN=["#3b2a14","#e04a3a","#f0802a","#f4c20d","#3f9a4f","#3a8fe0","#8e5bd6","#f08ab8"];
function tDraw(t,head,R){var v=cv(R),who=whoDraws();
  card(head+'<p class="big">'+esc(fill(T.drawWho,{k:who}))+'</p><button type="button" class="hold" id="hold"><span class="hid"><span class="hold-em">'+v.em+'</span>'+esc(v.draw)+'</span><em>👁 '+esc(T.drawHold)+'</em></button>','<button type="button" class="btn" id="tGo">✏️ '+esc(T.drawGo)+'</button>');
  holdBind($("#hold"));$("#tGo").onclick=function(){hush();drawPad(t,R,v,who)}}
function drawPad(t,R,v,who){var secs=G.lvl?60:90,col=PEN[0],last=null,end=Date.now()+secs*1000,fin=false;
  card('<h2>✏️ '+esc(t.t)+'</h2><p class="note c">'+esc(T.drawRule)+'</p><div class="dpad"><canvas id="cv"></canvas></div><div class="tbar"><i id="tb"></i></div><div class="pal" id="pal">'+PEN.map(function(c,i){return '<button type="button" class="sw'+(i?'':' on')+'" data-c="'+c+'" style="background:'+c+'" aria-label="kleur"></button>'}).join("")+'<button type="button" class="sw wipe" id="wipe">'+esc(T.drawWipe)+'</button></div>','<button type="button" class="btn" id="bDone">🙌 '+esc(T.drawDone)+'</button>');
  var c=$("#cv"),w=c.parentNode.clientWidth,x=canvasFit(c,w,w);
  function clear(){x.fillStyle="#fff";x.fillRect(0,0,w,w)}clear();x.lineCap=x.lineJoin="round";x.lineWidth=Math.max(5,w/60);
  on(c,"pointerdown",function(e){e.preventDefault();c.setPointerCapture(e.pointerId);last=ptIn(c,e);x.fillStyle=col;x.beginPath();x.arc(last.x,last.y,x.lineWidth/2,0,7);x.fill()});
  on(c,"pointermove",function(e){if(!last)return;var p=ptIn(c,e);x.strokeStyle=col;x.beginPath();x.moveTo(last.x,last.y);x.lineTo(p.x,p.y);x.stroke();last=p});
  on(c,"pointerup",function(){last=null});on(c,"pointercancel",function(){last=null});
  $("#pal").onclick=function(e){var b=e.target.closest(".sw");if(!b)return;if(b.id==="wipe"){clear();return}col=b.dataset.c;$$(".sw").forEach(function(s){s.classList.toggle("on",s===b)})};
  task.t=setInterval(function(){var l=end-Date.now();$("#tb").style.width=Math.max(0,l/(secs*1000)*100)+"%";if(l<5200&&l>0&&Math.floor(l/1000)!==Math.floor((l+250)/1000))beep(700,70);if(l<=0)done()},250);
  function done(){if(fin)return;fin=true;clearInterval(task.t);beep(440,300);var img=snap(c);media("d"+G.r,{src:img,who:who,label:v.label});drawGuess(R,v,who,img)}
  $("#bDone").onclick=done}
function drawOpts(R,v){var r=rngOf(R.k+5),o;
  if(R.clue.type==="kleur"){o=shuffle(D.S.filter(function(s){return s.kleurNaam!==v.word.toLowerCase()}),r).slice(0,5).map(function(s){return{em:"🧵",label:fill(D.CV.kleur.label,{k:s.kleurNaam}),col:KL[s.kleur]}})}
  else o=shuffle(Object.keys(D.CV).filter(function(k){return D.CV[k].draw&&k!=="kleur"&&D.CV[k].em!==v.em}).map(function(k){return{em:D.CV[k].em,label:D.CV[k].label}}),r).slice(0,5);
  o.push({em:v.em,label:v.label,col:v.col,right:1});return shuffle(o,r)}
function drawGuess(R,v,who,img){var opts=drawOpts(R,v),miss=0;
  card('<h2>'+esc(T.drawQ)+'</h2><img class="drawn" src="'+img+'" alt=""><div class="opts three" id="op">'+opts.map(function(o,i){return '<button type="button" class="opt dopt" data-i="'+i+'"><span class="oe">'+o.em+'</span><small'+(o.col?' style="color:'+o.col+';font-weight:700"':'')+'>'+esc(o.label)+'</small></button>'}).join("")+'</div>','');
  say(T.drawQ);var by='<img class="drawn sm" src="'+img+'" alt=""><p class="note c">'+esc(fill(T.drawBy,{k:who}))+'</p>';
  $("#op").onclick=function(e){var b=e.target.closest(".dopt");if(!b||b.disabled)return;var o=opts[+b.dataset.i];
    if(o.right){b.classList.add("ok");toast(T.drawRight);setTimeout(function(){reveal(v,by)},500)}
    else{b.classList.add("bad");b.disabled=true;beep(200,200);buzz(150);miss++;if(miss>=2){toast(fill(T.drawWrong,{x:v.label}));setTimeout(function(){reveal(v,by)},1200)}else toast(T.wrongPick)}}}

/* ---------- bloem wegvegen ---------- */
function tScratch(t,head,R){var v=cv(R);
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="scr" id="scr"><div class="scr-in"><div class="rv-em">'+v.em+'</div><div class="rv-word">'+esc(v.word)+'</div></div><canvas id="sc"></canvas></div><p class="score" id="pc">'+esc(T.scratchT)+'</p>','');
  var box=$("#scr"),c=$("#sc"),w=box.clientWidth,h=box.clientHeight,x=canvasFit(c,w,h),r=rngOf(R.k),last=null,fin=false;
  x.fillStyle="#f1e6d0";x.fillRect(0,0,w,h);for(var i=0;i<1400;i++){x.fillStyle=r()<.55?"rgba(255,255,255,.85)":"rgba(205,186,150,.55)";x.beginPath();x.arc(r()*w,r()*h,1+r()*3.2,0,7);x.fill()}
  x.font=Math.round(w/9)+"px serif";x.textAlign="center";x.textBaseline="middle";["🥄","🍪","🧈"].forEach(function(em,i){x.globalAlpha=.55;x.fillText(em,w*(.2+.3*i),h*(.15+.7*r()))});x.globalAlpha=1;
  x.globalCompositeOperation="destination-out";x.lineCap=x.lineJoin="round";x.lineWidth=G.lvl?38:54;
  on(c,"pointerdown",function(e){e.preventDefault();c.setPointerCapture(e.pointerId);last=ptIn(c,e);x.beginPath();x.arc(last.x,last.y,x.lineWidth/2,0,7);x.fill()});
  on(c,"pointermove",function(e){if(!last)return;var p=ptIn(c,e);x.beginPath();x.moveTo(last.x,last.y);x.lineTo(p.x,p.y);x.stroke();last=p});
  on(c,"pointerup",function(){last=null});on(c,"pointercancel",function(){last=null});
  task.t=setInterval(function(){if(fin)return;var d=x.getImageData(0,0,c.width,c.height).data,n=0,cl=0;for(var i=3;i<d.length;i+=4*29){n++;if(d[i]<30)cl++}var f=cl/n;$("#pc").textContent=T.scratchT+" "+Math.round(Math.min(1,f/.6)*100)+"%";
    if(f>.6){fin=true;clearInterval(task.t);c.style.transition="opacity .7s";c.style.opacity=0;cheer();setTimeout(function(){reveal(v)},1100)}},350)}

/* ---------- kaarsjes uitblazen (microfoon) ---------- */
function tBlow(t,head,R){var v=cv(R),n=G.lvl?8:5,lit=[],out=0,fin=false,started=false;for(var i=0;i<n;i++)lit.push(true);
  var cs="";for(i=0;i<n;i++)cs+='<button type="button" class="cdl c'+(i%4)+'" data-i="'+i+'" style="left:'+(10+i*(80/(n-1)))+'%"><i class="fl"></i></button>';
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="bcake" id="bc"><div class="cdls" id="cd">'+cs+'</div><div class="layer l1"></div><div class="layer l2"></div><div class="smoke" id="sm"><span>'+v.em+'</span><b>'+esc(v.word)+'</b></div></div><div class="meter"><i id="mt"></i></div><p class="score" id="pc">'+esc(T.micAsk)+'</p>','<button type="button" class="btn" id="tGo">🎤 '+esc(T.micStart)+'</button><button type="button" class="btn ghost" id="bTap" hidden>'+esc(T.blowTap)+'</button>');
  function blowOne(i){if(fin)return;if(i==null){var l=lit.map(function(x,k){return x?k:-1}).filter(function(k){return k>=0});if(!l.length)return;i=l[Math.floor(Math.random()*l.length)]}
    if(!lit[i])return;lit[i]=false;out++;var b=$$(".cdl")[i];b.classList.add("out");beep(160+out*20,180,"triangle");buzz(40);
    if(out>=n){fin=true;micClose();$("#sm").classList.add("on");cheer();setTimeout(function(){reveal(v)},2000)}}
  function tapMode(msg){$("#pc").textContent=msg||T.blowTap;$("#bTap").hidden=true;$("#tGo").hidden=true;$("#cd").classList.add("tap");$("#cd").onclick=function(e){var b=e.target.closest(".cdl");if(b)blowOne(+b.dataset.i)}}
  $("#bTap").onclick=function(){tapMode()};
  $("#tGo").onclick=function(){if(started)return;started=true;this.hidden=true;
    micOpen().then(function(){var amb=0,k=0,cal=performance.now(),acc=0,per=G.lvl?.38:.26,th=.08;$("#pc").textContent=T.calib;
      setTimeout(function(){if(!fin)$("#bTap").hidden=false},15000);
      loop(function(dt,now){if(fin)return false;var lv=micLevel();
        if(now-cal<800){amb+=lv;k++;return}if(k){th=Math.max(G.lvl?.09:.07,amb/k*3.2);k=0;$("#pc").textContent=T.blowT}
        meterSet(lv/th*.6);$("#bc").classList.toggle("wob",lv>th);if(lv>th){acc+=dt;if(acc>=per){acc=0;blowOne()}}else acc=Math.max(0,acc-dt*.5)})
    },function(){tapMode(T.blowNoMic)})}}

/* ---------- de kruimelzak schudden ---------- */
function tShake(t,head,R){var v=cv(R),need=G.lvl?36:24,n=0,lastT=0,lastM=null,got=false,fin=false;
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="bag" id="bag"><span class="bag-em">🛍️</span></div><div class="meter"><i id="mt"></i></div><p class="score" id="pc">0 / '+need+'</p>','<button type="button" class="btn" id="tGo">📳 '+esc(T.micStart)+'</button>');
  function crumb(){var b=$("#bag");if(!b)return;var e=document.createElement("span");e.className="crumbp";e.textContent=pick(["🍪","🟤","✨","🍰"],Math.random);e.style.setProperty("--dx",(Math.random()*240-120)+"px");e.style.setProperty("--dy",(-60-Math.random()*120)+"px");b.appendChild(e);setTimeout(function(){e.remove()},800)}
  function hit(){if(fin)return;n++;meterSet(n/need);$("#pc").textContent=n+" / "+need;var b=$("#bag");b.classList.remove("shk");void b.offsetWidth;b.classList.add("shk");crumb();beep(300+Math.random()*300,40,"triangle");
    if(n>=need){fin=true;for(var i=0;i<12;i++)setTimeout(crumb,i*40);setTimeout(function(){reveal(v)},900)}}
  function tapMode(){$("#pc").textContent=T.shakeTap+" · "+n+" / "+need;on($("#bag"),"click",hit)}
  $("#tGo").onclick=function(){this.hidden=true;motionPerm().then(function(){
    on(window,"devicemotion",function(e){var a=e.accelerationIncludingGravity||e.acceleration;if(!a||a.x==null)return;got=true;var m=Math.abs(a.x)+Math.abs(a.y)+Math.abs(a.z),now=Date.now();
      if(lastM!=null&&Math.abs(m-lastM)>(G.lvl?16:12)&&now-lastT>140){lastT=now;hit()}lastM=m});
    $("#pc").textContent=T.shakeT;task.t2=setTimeout(function(){if(!got)tapMode()},1500)})}}

/* ---------- de gescheurde foto (wisselpuzzel) ---------- */
function puzzleImg(v,R){var S=360,c=document.createElement("canvas");c.width=c.height=S;var x=c.getContext("2d"),i;
  var cols=["#ffd6e3","#fff3d6","#ffe9b0","#e3f4ff"];for(i=0;i<16;i++){x.fillStyle=cols[i%4];x.beginPath();x.moveTo(S/2,S/2);x.arc(S/2,S/2,S,i*Math.PI/8,(i+1)*Math.PI/8);x.fill()}
  x.fillStyle="#fff";x.beginPath();x.arc(S/2,S/2-14,104,0,7);x.fill();x.lineWidth=8;x.strokeStyle="#e8456b";x.stroke();
  x.textAlign="center";x.textBaseline="middle";x.font="120px serif";x.fillText(v.em,S/2,S/2-10);
  x.font="34px serif";[["🍰",40,44],["🔍",S-40,44],["🐭",40,S-100],["🍪",S-40,S-100]].forEach(function(a){x.fillText(a[0],a[1],a[2])});
  x.fillStyle="#e8456b";x.fillRect(0,S-62,S,62);x.fillStyle="#fff";x.font="700 38px Fredoka, Arial Rounded MT Bold, sans-serif";x.fillText(v.word,S/2,S-30);
  x.lineWidth=14;x.strokeStyle="#fff";x.strokeRect(7,7,S-14,S-14);return c.toDataURL("image/png")}
function tPuzzle(t,head,R){var v=cv(R),N=G.lvl?4:3,img=puzzleImg(v,R),r=rngOf(R.k+3),ord,sel=-1,i;
  do{ord=shuffle(Array.apply(null,{length:N*N}).map(function(_,k){return k}),r)}while(ord.every(function(a,k){return a===k}));
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="pz" id="pz" style="grid-template-columns:repeat('+N+',1fr)"></div><div class="pzex"><img src="'+img+'" alt=""><small>'+esc(T.puzzleEx)+'</small></div>','');
  function draw(){$("#pz").innerHTML=ord.map(function(a,k){var cx=a%N,cy=Math.floor(a/N);return '<button type="button" class="tile'+(k===sel?' sel':'')+(a===k?' ok':'')+'" data-k="'+k+'" data-a="'+a+'" style="background-image:url('+img+');background-size:'+N*100+'% '+N*100+'%;background-position:'+(cx/(N-1)*100)+'% '+(cy/(N-1)*100)+'%"></button>'}).join("")}
  draw();$("#pz").onclick=function(e){var b=e.target.closest(".tile");if(!b)return;var k=+b.dataset.k;
    if(sel<0){sel=k;beep(600,50);draw();return}if(sel===k){sel=-1;draw();return}var tmp=ord[sel];ord[sel]=ord[k];ord[k]=tmp;sel=-1;beep(800,60,"triangle");draw();
    if(ord.every(function(a,k){return a===k})){$("#pz").onclick=null;$("#pz").classList.add("done");cheer();setTimeout(function(){reveal(v)},900)}}}

/* ---------- geheimschrift ---------- */
var SYMS=["★","●","▲","■","♥","♦","♣","♠","☀","☾","✿","☂","♪","✈","☎","⚑","✂","⚓","☕","✉","⌛","☘","⚽","✏","☁","♞"];
function tCode(t,head,R){var v=cv(R),w=v.word.replace(/[^A-Z]/g,"")||"SPOOR",r=rngOf(R.k+11),abc="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),sy=shuffle(SYMS,r),map={},got=[],busy=false;
  abc.forEach(function(c,i){map[c]=sy[i]});
  var uniq=w.split("").filter(function(c,i,a){return a.indexOf(c)===i}),extra=shuffle(abc.filter(function(c){return uniq.indexOf(c)<0}),r).slice(0,Math.max(4,10-uniq.length)),keyL=shuffle(uniq.concat(extra),r);
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="npaper"><div class="coded">'+w.split("").map(function(c){return '<span>'+map[c]+'</span>'}).join("")+'</div><div class="ans" id="ans"></div></div><p class="eyebrow c">'+esc(T.codeKey)+'</p><div class="key">'+keyL.map(function(c){return '<span><b>'+map[c]+'</b>'+c+'</span>'}).join("")+'</div><div class="kp" id="kp">'+keyL.slice().sort().map(function(c){return '<button type="button" data-c="'+c+'">'+c+'</button>'}).join("")+'<button type="button" class="del" data-c="-">'+T.codeDel+'</button></div>','');
  function draw(cls){$("#ans").innerHTML=w.split("").map(function(c,i){return '<span class="'+(cls&&got[i]?(got[i]===c?"g":"b"):"")+'">'+(got[i]||"")+'</span>'}).join("")}draw();
  $("#kp").onclick=function(e){var b=e.target.closest("button");if(!b||busy)return;var c=b.dataset.c;
    if(c==="-"){got.pop();draw();return}if(got.length>=w.length)return;got.push(c);beep(500+got.length*40,50);draw();
    if(got.length===w.length){if(got.join("")===w){$("#kp").onclick=null;draw(1);setTimeout(function(){reveal(v)},600)}
      else{busy=true;draw(1);buzz(200);beep(200,250);toast(T.codeWrong);setTimeout(function(){got=got.map(function(x,i){return x===w[i]?x:null});while(got.length&&got[got.length-1]==null)got.pop();
        /* foute letters eruit; goede blijven alleen als ze vooraan aansluiten */var k=0;while(k<got.length&&got[k]!=null)k++;got=got.slice(0,k);busy=false;draw()},1000)}}}}

/* ---------- sluipdetector (microfoon) ---------- */
function tSneak(t,head,R){var safe=0;
  card(head+'<p class="big">'+esc(t.d)+'</p><p class="note">'+esc(T.sneakArm)+'</p>','<button type="button" class="btn" id="tGo">🎤 '+esc(T.micStart)+'</button>');
  function manual(){card(head+'<p class="big">'+esc(T.sneakNoMic)+'</p><div class="guard"><div class="g-em">🎂</div><button type="button" class="touch" id="tc">'+esc(T.sneakTouch)+'</button></div><p class="score" id="pc"></p>','<button type="button" class="btn" id="bDone" disabled>'+esc(T.done)+'</button>');
    $("#tc").onclick=function(){safe++;cheer();$("#pc").textContent=fill(T.sneakSafe,{n:safe});$("#bDone").disabled=false};$("#bDone").onclick=function(){taskDone(t)}}
  $("#tGo").onclick=function(){this.disabled=true;micOpen().then(function(){
    card('<h2>🛡️ '+esc(t.t)+'</h2><div class="guard" id="gd"><div class="g-em">🎂</div><div class="g-st" id="gs">'+esc(T.calib)+'</div><div class="meter big"><i id="mt"></i><b></b></div><button type="button" class="touch" id="tc">'+esc(T.sneakTouch)+'</button></div><p class="score" id="pc"></p>','<button type="button" class="btn" id="bDone" disabled>'+esc(T.done)+'</button>');
    var st="cal",amb=0,k=0,th=.06,over=0,cool=0,t0=performance.now();
    function setSt(s,txt){st=s;if(!$("#gs"))return;$("#gs").textContent=txt;$("#gd").classList.toggle("alarm",s==="alarm");$("#gd").classList.toggle("win",s==="win")}
    function alarm(now){setSt("alarm",T.sneakAlarm);buzz([300,100,300,100,300]);var f=0;task.t=setInterval(function(){beep(f++%2?700:1050,220,"square")},240);
      setTimeout(function(){clearInterval(task.t);if(st==="alarm"){cool=performance.now()+900;setSt("armed",T.sneakGo)}},2400)}
    on($("#tc"),"pointerdown",function(){cool=performance.now()+600;if(st!=="armed")return;safe++;setSt("win",fill(T.sneakSafe,{n:safe}));cheer();buzz([60,40,60]);$("#bDone").disabled=false;
      setTimeout(function(){if(st==="win"){cool=performance.now()+900;setSt("armed",T.sneakGo)}},2600)});
    $("#bDone").onclick=function(){taskDone(t)};
    loop(function(dt,now){var lv=micLevel();if(st==="cal"){amb+=lv;k++;if(now-t0>1500){th=Math.max(G.lvl?.035:.05,amb/k*(G.lvl?2.6:3.6));setSt("armed",T.sneakGo)}return}
      meterSet(lv/th*.7);if(st!=="armed"||now<cool){over=0;return}if(lv>th){over+=dt;if(over>.12){over=0;alarm(now)}}else over=0})
  },manual)}}

/* ---------- taart dragen (kantelen) ---------- */
function tTilt(t,head,R){var need=3,okN=0,hold=G.lvl?15:10,sens=false,base=null,tl={x:0,y:0},pos={x:0,y:0},vel={x:0,y:0},run=false,t0=0,finger=null,fallback=false,listening=false;
  card(head+'<p class="big">'+esc(t.d)+'</p><div class="plate" id="pl"><div class="pcake" id="pk">🎂</div></div><p class="score" id="pc">'+esc(fill(T.tiltOk,{n:0}))+'</p>','<button type="button" class="btn" id="tGo">'+esc(T.tiltGo)+'</button>');
  var pl=$("#pl");
  on(pl,"pointerdown",function(e){if(!fallback)return;pl.setPointerCapture(e.pointerId);finger=ptIn(pl,e)});on(pl,"pointermove",function(e){if(finger)finger=ptIn(pl,e)});on(pl,"pointerup",function(){finger=null});on(pl,"pointercancel",function(){finger=null});
  function start(){pos={x:0,y:0};vel={x:0,y:0};base=null;run=true;t0=performance.now();$("#tGo").hidden=true;$("#pk").classList.remove("fall");
    setTimeout(function(){if(run&&!sens&&!fallback){fallback=true;toast(T.tiltNoSens);$("#pc").textContent=T.tiltNoSens}},1200)}
  $("#tGo").onclick=function(){motionPerm().then(function(){if(!listening){listening=true;on(window,"deviceorientation",function(e){if(e.gamma==null||e.beta==null)return;sens=true;if(!base)base={b:e.beta,g:e.gamma};tl.x=e.gamma-base.g;tl.y=e.beta-base.b})}start()})};
  loop(function(dt,now){if(!run)return;var ax=0,ay=0,tt=now/1000;
    if(sens&&!fallback){var k=G.lvl?.05:.035;ax=tl.x*k;ay=tl.y*k;if(G.lvl){ax+=Math.sin(tt*1.7)*.25;ay+=Math.cos(tt*1.3)*.25}}
    else if(fallback){ax=Math.sin(tt*.9)*.8+Math.sin(tt*2.3)*.5;ay=Math.cos(tt*1.1)*.8+Math.sin(tt*1.9)*.4;if(G.lvl){ax*=1.4;ay*=1.4}
      if(finger){var rr=pl.clientWidth/2,fx=(finger.x-rr)/rr,fy=(finger.y-rr)/rr;ax+=(fx-pos.x)*8;ay+=(fy-pos.y)*8;vel.x*=.9;vel.y*=.9}}
    else return;
    vel.x=(vel.x+ax*dt)*.985;vel.y=(vel.y+ay*dt)*.985;pos.x+=vel.x*dt;pos.y+=vel.y*dt;
    var rr2=pl.clientWidth/2*.62;$("#pk").style.transform="translate("+(pos.x*rr2)+"px,"+(pos.y*rr2)+"px) rotate("+(pos.x*20)+"deg)";
    if(Math.hypot(pos.x,pos.y)>1){run=false;$("#pk").classList.add("fall");beep(140,500,"sawtooth");buzz(400);$("#pc").textContent=T.tiltDrop;$("#tGo").textContent=T.again;$("#tGo").hidden=false;return}
    var left=hold-(now-t0)/1000;$("#pc").textContent=fill(T.tiltHold,{n:Math.max(0,Math.ceil(left))});
    if(left<=0){run=false;okN++;cheer();buzz([60,40,60]);$("#pc").textContent=fill(T.tiltOk,{n:okN});if(okN>=need){setTimeout(function(){taskDone(t)},600);return}$("#tGo").textContent=T.tiltGo;$("#tGo").hidden=false}})}

/* ---------- het keukenorkest (nadoen) ---------- */
var PADS=[["🥘","#e8456b",262],["🥛","#3a8fe0",330],["🥄","#f4c20d",392],["🫖","#3f9a4f",523]];
function tSimon(t,head,R){var r=rngOf(R.k+21),goal=G.lvl?6:4,seq=[],len=G.lvl?3:2,inp=[],busy=true,i;for(i=0;i<goal;i++)seq.push(Math.floor(r()*4));
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="simon" id="smn">'+PADS.map(function(p,i){return '<button type="button" class="spad" data-i="'+i+'" style="--c:'+p[1]+'">'+p[0]+'</button>'}).join("")+'</div><p class="score" id="pc"></p>','');
  function flash(i,d){var b=$$(".spad")[i];if(!b)return;b.classList.add("lit");beep(PADS[i][2],d,"sine");setTimeout(function(){b.classList.remove("lit")},d-40)}
  function play(){busy=true;inp=[];$("#pc").textContent=T.simonListen;var k=0,gap=G.lvl?520:680;task.t=setInterval(function(){if(k>=len){clearInterval(task.t);busy=false;$("#pc").textContent=T.simonYou+" · "+fill(T.simonLen,{n:len-(G.lvl?2:1),m:goal-(G.lvl?2:1)});return}flash(seq[k],gap-140);k++},gap)}
  $("#smn").onclick=function(e){var b=e.target.closest(".spad");if(!b||busy)return;var i=+b.dataset.i;flash(i,220);
    if(seq[inp.length]===i){inp.push(i);if(inp.length===len){busy=true;if(len>=goal){setTimeout(function(){taskDone(t)},400)}else{len++;setTimeout(play,900)}}}
    else{busy=true;buzz(200);setTimeout(function(){beep(150,400,"sawtooth")},230);toast(T.simonAgain);setTimeout(play,1400)}};
  task.t2=setTimeout(play,1400)}

/* ---------- raadsel ---------- */
function tRiddle(t,head,R){var q=riddleOf(R),opts=shuffle(q.o,rngOf(R.k+32));
  miniPick(head,"",bubble(esc(q.q)),opts.map(function(o){return '<span class="oe">'+o+'</span>'}),opts.indexOf(q.a),function(){taskDone({ok:T.rightPick})})}

/* ---------- fotobewijs ---------- */
function tPhoto(t,head,R){var pr=photoPrompt(R);
  card(head+'<p class="big">📷 '+esc(pr)+'</p><div id="pv"></div><input type="file" id="fi" accept="image/*" capture="environment" hidden>','<button type="button" class="btn" id="bShot">'+esc(T.photoBtn)+'</button><button type="button" class="btn ghost" id="bSkip">'+esc(T.photoSkip)+'</button>');
  $("#bShot").onclick=function(){$("#fi").click()};
  $("#fi").onchange=function(){var f=this.files&&this.files[0];if(!f)return;var url=URL.createObjectURL(f),im=new Image();
    im.onload=function(){var s=Math.min(1,420/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      var d=c.toDataURL("image/jpeg",.7);URL.revokeObjectURL(url);media("p"+G.r,{src:d,label:pr});$("#pv").innerHTML='<img class="drawn photo" src="'+d+'" alt="">';
      $("#bShot").textContent="📷 "+T.again;$("#bSkip").textContent=T.done;$("#bSkip").className="btn";toast(T.photoOk);cheer()};im.src=url};
  $("#bSkip").onclick=function(){taskDone({ok:T.ready})}}

/* ---------- vóór en na: zoek de verschillen ---------- */
var EXTRA=["🍕","🥨","🍫","🧇","🥐","🍩","🍬","🍭"];
function tDiff(t,head,R){var r=rngOf(R.k+51),C=G.lvl?4:3,n=C*C,nd=G.lvl?5:3,top=shuffle(ITEMS,r).slice(0,n),bot=top.slice(),diffs=shuffle(top.map(function(_,i){return i}),r).slice(0,nd),ex=shuffle(EXTRA,r),found=0;
  diffs.forEach(function(i,k){bot[i]=k%3===2?"":ex[k]});
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="dg" style="grid-template-columns:repeat('+C+',1fr)">'+top.map(function(x){return '<span>'+x+'</span>'}).join("")+'</div><div class="dg bot" id="dg" style="grid-template-columns:repeat('+C+',1fr)">'+bot.map(function(x,i){return '<button type="button" data-i="'+i+'">'+(x||"&nbsp;")+'</button>'}).join("")+'</div><p class="score" id="pc">'+esc(fill(T.diffLeft,{n:nd}))+'</p>','');
  $("#dg").onclick=function(e){var b=e.target.closest("button");if(!b||b.classList.contains("found"))return;var i=+b.dataset.i;
    if(diffs.indexOf(i)>=0){b.classList.add("found");found++;beep(700+found*80,90,"triangle");$("#pc").textContent=fill(T.diffLeft,{n:nd-found});if(found>=nd){$("#dg").onclick=null;setTimeout(function(){taskDone(t)},400)}}
    else{b.classList.add("nope");buzz(120);beep(220,120);setTimeout(function(){b.classList.remove("nope")},450)}}}

/* ---------- het muizenpad (doolhof) ---------- */
function genMaze(w,h,r){var walls=[],vis=[],st=[0],i;for(i=0;i<w*h;i++){walls.push([1,1,1,1]);vis.push(0)}vis[0]=1;
  while(st.length){var c=st[st.length-1],x=c%w,y=Math.floor(c/w),nb=[];
    if(y>0&&!vis[c-w])nb.push([c-w,0,2]);if(x<w-1&&!vis[c+1])nb.push([c+1,1,3]);if(y<h-1&&!vis[c+w])nb.push([c+w,2,0]);if(x>0&&!vis[c-1])nb.push([c-1,3,1]);
    if(!nb.length){st.pop();continue}var n=nb[Math.floor(r()*nb.length)];walls[c][n[1]]=0;walls[n[0]][n[2]]=0;vis[n[0]]=1;st.push(n[0])}
  return walls}
function tMaze(t,head,R){var W=G.lvl?7:5,H=G.lvl?9:6,walls=genMaze(W,H,rngOf(R.k+61)),at=0,goal=W*H-1,trail=[0],drag=false,fin=false;
  card(head+'<p class="note">'+esc(t.d)+'</p><div class="mz"><canvas id="mz"></canvas></div><p class="score">'+esc(T.mazeT)+'</p>','');
  var c=$("#mz"),cs=Math.floor(Math.min(c.parentNode.clientWidth/W,(window.innerHeight*.55)/H)),x=canvasFit(c,W*cs,H*cs);
  function ctr(i){return[(i%W+.5)*cs,(Math.floor(i/W)+.5)*cs]}
  function draw(){x.fillStyle="#fff6e8";x.fillRect(0,0,W*cs,H*cs);x.strokeStyle="#f7a9c2";x.lineWidth=cs*.38;x.lineCap=x.lineJoin="round";x.beginPath();trail.forEach(function(ci,k){var p=ctr(ci);k?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.stroke();
    x.strokeStyle="#5a2a3f";x.lineWidth=3;x.beginPath();for(var i=0;i<W*H;i++){var px=(i%W)*cs,py=Math.floor(i/W)*cs,w=walls[i];
      if(w[0]){x.moveTo(px,py);x.lineTo(px+cs,py)}if(w[1]){x.moveTo(px+cs,py);x.lineTo(px+cs,py+cs)}if(w[2]){x.moveTo(px,py+cs);x.lineTo(px+cs,py+cs)}if(w[3]){x.moveTo(px,py);x.lineTo(px,py+cs)}}x.stroke();
    x.font=Math.round(cs*.68)+"px serif";x.textAlign="center";x.textBaseline="middle";var g=ctr(goal),a=ctr(at);x.fillText("🧁",g[0],g[1]);x.fillText("🐭",a[0],a[1])}
  function open(a,b){var d=b-a;if(d===-W)return!walls[a][0];if(d===1)return(a%W)<W-1&&!walls[a][1];if(d===W)return!walls[a][2];if(d===-1)return(a%W)>0&&!walls[a][3];return false}
  function go(target){if(fin||target===at||target<0)return;var prev={},q=[at],dep={},seen={};seen[at]=1;dep[at]=0;
    while(q.length){var a=q.shift();if(a===target)break;if(dep[a]>=4)continue;[a-W,a+1,a+W,a-1].forEach(function(b){if(b<0||b>=W*H||seen[b]||!open(a,b))return;seen[b]=1;prev[b]=a;dep[b]=dep[a]+1;q.push(b)})}
    if(!seen[target])return;var path=[];for(var p=target;p!==at;p=prev[p])path.unshift(p);
    path.forEach(function(p){var bi=trail.indexOf(p);if(bi>=0)trail=trail.slice(0,bi+1);else trail.push(p);at=p});beep(420+Math.min(trail.length,40)*14,30,"triangle");draw();
    if(at===goal){fin=true;setTimeout(function(){taskDone({ok:T.rightPick})},300)}}
  function cell(e){var p=ptIn(c,e),cx=Math.floor(p.x/cs),cy=Math.floor(p.y/cs);return cx<0||cy<0||cx>=W||cy>=H?-1:cy*W+cx}
  on(c,"pointerdown",function(e){e.preventDefault();c.setPointerCapture(e.pointerId);drag=true;go(cell(e))});on(c,"pointermove",function(e){if(drag)go(cell(e))});on(c,"pointerup",function(){drag=false});on(c,"pointercancel",function(){drag=false});
  draw()}

/* ---------- spoor en sporenbord ---------- */
function clueOf(R){var c=R.clue;if(R.part===1){if(c.type==="alibi"){var s=SBY[c.id];return{t:s.short+": alibi",d:s.alibi,strike:null,ids:[s.id]}}
    if(c.type==="kleur"){var k=SBY[G.c.culprit].kleurNaam;return{t:fill(D.C.kleur.t,{k:k}),d:fill(D.C.kleur.d,{k:k}),strike:fill(D.C.kleur.strike,{k:k}),ids:D.S.filter(function(x){return x.kleur!==k}).map(function(x){return x.id})}}
    var cc=D.C[c.type][c.val];return{t:cc.t,d:cc.d,strike:cc.strike,ids:D.S.filter(function(x){return !!x[c.type]!==c.val}).map(function(x){return x.id})}}
  if(c.type==="alibi"){var p=PLACES.filter(function(x){return x.id===c.id})[0];return{t:cap(p.name)+": nee",d:p.alibi,strike:null,ids:[p.id]}}
  var pc=PC[c.type][c.val];return{t:pc.t,d:pc.d,strike:pc.strike,ids:PLACES.filter(function(x){return !!x[c.type]!==c.val}).map(function(x){return x.id})}}
function clue(){var R=cur(),c=clueOf(R);if(R.part===1){if(G.seen<=G.r)G.seen=G.r+1}else{var n1=G.c.rounds.filter(function(x){return x.part===1}).length;if(G.pseen<=G.r-n1)G.pseen=G.r-n1+1}save();hud();
  var v=cv(R),m=G.media&&(G.media["d"+G.r]||G.media["p"+G.r]);
  card('<h2>'+esc(T.clue)+'</h2>'+bubble(esc(ST.clue))+'<div class="cluecard"><span class="cl-em">'+v.em+'</span><span class="eyebrow">'+esc(T.clue)+' '+(R.part===1?G.seen:G.pseen)+'</span><h3>'+esc(c.t)+'</h3><p>'+esc(c.d)+'</p>'+(m?'<img class="drawn sm" src="'+m.src+'" alt=""><small class="c">'+esc(m.who?fill(T.drawBy,{k:m.who}):m.label)+'</small>':'')+'</div>','<button type="button" class="btn" id="bNext">'+esc(T.board)+' ▸</button>');
  say(ST.clue+" "+c.t+". "+c.d);$("#bNext").onclick=function(){hush();nextPhase()}}
function seenClues(part){return G.c.rounds.filter(function(R,i){return R.part===part&&(part===1?i<G.seen:i-G.c.rounds.filter(function(x){return x.part===1}).length<G.pseen)}).map(function(R){var c=clueOf(R);c.em=cv(R).em;return c})}
function board(){var R=cur(),p1=R.part===1,items=p1?D.S:PLACES,st=p1?G.struck:G.pstruck,c=clueOf(R);
  card('<h2>'+esc(T.board)+'</h2><p class="note">'+esc(G.lvl===0&&c.strike?fill(ST.boardEasy,{strike:c.strike}):ST.board)+'</p>'+
    '<div class="clist">'+seenClues(R.part).map(function(x){return '<span class="chip">'+(x.em||"")+' '+esc(x.t)+'</span>'}).join("")+'</div>'+
    '<div class="grid" id="gr">'+items.map(function(s){return '<button type="button" class="sc'+(st[s.id]?" x":"")+'" data-id="'+s.id+'">'+(p1?pic(s):placePic(s))+'<b>'+esc(p1?s.short:cap(s.name))+'</b>'+(p1?'<small>'+esc(s.thing)+'</small>':'')+'</button>'}).join("")+'</div>',
    (G.lvl===0?'<button type="button" class="btn ghost" id="bHelp">'+esc(T.help)+'</button>':'')+'<button type="button" class="btn" id="bNext">'+esc(T.next)+'</button>');
  $("#gr").onclick=function(e){var b=e.target.closest(".sc");if(!b)return;st[b.dataset.id]=!st[b.dataset.id];b.classList.toggle("x",!!st[b.dataset.id]);beep(st[b.dataset.id]?300:700,80);save()};
  if(G.lvl===0)$("#bHelp").onclick=function(){G.hints++;seenClues(R.part).forEach(function(x){x.ids.forEach(function(id){st[id]=true})});save();board()};
  $("#bNext").onclick=function(){hush();nextPhase()}}

/* ---------- beschuldigen ---------- */
function accuse(){show("play");hud();
  card('<h2>'+esc(T.accuse)+'</h2>'+bubble(esc(ST.accuseAsk))+'<p class="note">'+esc(fill(T.tries,{n:G.tries}))+'</p><div class="grid" id="gr">'+D.S.map(function(s){var out=G.accused.indexOf(s.id)>=0;return '<button type="button" class="sc'+(out||G.struck[s.id]?" x":"")+'" data-id="'+s.id+'"'+(out?' disabled':'')+'>'+pic(s)+'<b>'+esc(s.short)+'</b></button>'}).join("")+'</div>','');
  say(ST.accuseAsk);
  $("#gr").onclick=function(e){var b=e.target.closest(".sc");if(!b||b.disabled)return;var s=SBY[b.dataset.id];
    sheet('<h2>'+esc(fill(T.confirmQ,{s:s.name}))+'</h2><div class="suspect">'+pic(s)+'</div><button type="button" class="btn red" id="aY">'+esc(T.yes)+'</button><button type="button" class="btn ghost dk" id="shX">'+esc(T.no)+'</button>');
    $("#shX").onclick=closeSheet;$("#aY").onclick=function(){closeSheet();verdict(s)}}}
function verdict(s){if(s.id===G.c.culprit){G.won=true;G.stars=G.tries===3?3:G.tries===2?2:1;if(G.hints>2&&G.stars>1)G.stars--;save();cheer();buzz([80,50,80,50,200]);
    var txt=fill(ST.right,{s:s.name,reveal:s.reveal});
    card('<h2>'+esc(T.won)+'</h2><div class="suspect big">'+pic(s)+'</div>'+bubble(esc(txt)),'<button type="button" class="btn" id="bNext">'+esc(T.next)+'</button>');say(txt);
    $("#bNext").onclick=function(){hush();if(LENR[G.len][1]){G.phase="part2";G.r=G.c.rounds.filter(function(x){return x.part===1}).length;save();part2()}else{G.found=true;save();finale()}};return}
  G.tries--;G.accused.push(s.id);G.struck[s.id]=true;beep(180,400,"sawtooth");buzz(400);
  if(G.tries<=0){var c=SBY[G.c.culprit];G.won=true;G.stars=0;save();var t2=fill(ST.wrongLast,{s:c.name})+" "+c.reveal;card('<h2>'+esc(T.won)+'</h2><div class="suspect big">'+pic(c)+'</div>'+bubble(esc(t2)),'<button type="button" class="btn" id="bNext">'+esc(T.next)+'</button>');say(t2);
    $("#bNext").onclick=function(){hush();if(LENR[G.len][1]){G.phase="part2";G.r=G.c.rounds.filter(function(x){return x.part===1}).length;save();part2()}else{G.found=true;save();finale()}};return}
  save();var w=fill(ST.wrong,{s:s.name,alibi:s.alibi});sheet('<h2>'+esc(s.name)+'</h2>'+bubble(esc(w))+'<button type="button" class="btn" id="shX">'+esc(T.again)+'</button>');say(w);$("#shX").onclick=function(){closeSheet();accuse()}}

/* ---------- deel 2: waar is de taart? ---------- */
function part2(){show("play");hud();var c=SBY[G.c.culprit];
  var txt=c.name+" "+ST.part2;
  card('<h2>Waar is de taart?</h2>'+bubble(esc(txt))+'<div class="grid">'+PLACES.map(function(p){return '<div class="sc">'+placePic(p)+'<b>'+esc(cap(p.name))+'</b></div>'}).join("")+'</div>','<button type="button" class="btn" id="bNext">'+esc(T.go)+'</button>');
  say(txt);$("#bNext").onclick=function(){hush();G.phase="task";save();route()}}
function pfind(){show("play");hud();
  card('<h2>Waar is de taart?</h2>'+bubble(esc(ST.pfind))+'<p class="note">'+esc(fill(T.tries,{n:G.ptries}))+'</p><div class="grid" id="gr">'+PLACES.map(function(p){var out=G.paccused&&G.paccused.indexOf(p.id)>=0;return '<button type="button" class="sc'+(out||G.pstruck[p.id]?" x":"")+'" data-id="'+p.id+'"'+(out?' disabled':'')+'>'+placePic(p)+'<b>'+esc(cap(p.name))+'</b></button>'}).join("")+'</div>','');
  say(ST.pfind);
  $("#gr").onclick=function(e){var b=e.target.closest(".sc");if(!b||b.disabled)return;var p=PLACES.filter(function(x){return x.id===b.dataset.id})[0];
    if(p.id===G.c.place){G.found=true;if(G.ptries<2&&G.stars>0)G.stars--;save();cheer();buzz([80,50,200]);return finale()}
    G.ptries--;G.paccused=(G.paccused||[]).concat([p.id]);G.pstruck[p.id]=true;beep(180,400,"sawtooth");buzz(300);
    if(G.ptries<=0){G.found=true;if(G.stars>0)G.stars--;save();toast(fill(ST.pfindLast,{p:PLACES.filter(function(x){return x.id===G.c.place})[0].name}));return setTimeout(finale,1200)}
    save();sheet('<h2>'+esc(cap(p.name))+'</h2>'+bubble(esc(p.alibi))+'<button type="button" class="btn" id="shX">'+esc(T.again)+'</button>');say(p.alibi);$("#shX").onclick=function(){closeSheet();pfind()}}}

/* ---------- finale ---------- */
function finale(){clearInterval(tmr);show("play");var c=SBY[G.c.culprit],p=PLACES.filter(function(x){return x.id===G.c.place})[0];
  if(!G.logged){G.logged=true;var min=(Date.now()-(G.t0||Date.now()))/6e4;MW.profile.award({game:ID,xp:40+G.stars*20,stars:G.stars,gps:false,min:min,km:0,title:"Wie heeft de taart gepakt?",code:G.code});save()}
  var end=ST.end+(LENR[G.len][1]?" "+fill(ST.endPlace,{p:p.name}):"");
  var h='<h2>'+esc(T.won)+'</h2><div class="stars">'+"★".repeat(G.stars)+"☆".repeat(3-G.stars)+'</div>'+(ok("taart")?'<img class="hero" src="'+IMGROOT+'taart.webp?v=1" alt="">':'<div class="cake dark">🎂</div>')+bubble(esc(end));
  if(G.treat)h+=bubble(esc(fill(ST.treat,{treat:G.treat})));
  var med=G.media?Object.keys(G.media).sort().map(function(k){return G.media[k]}):[];
  if(med.length)h+='<p class="eyebrow c">📁 '+esc(T.dossier)+'</p><div class="dos">'+med.map(function(m){return '<figure><img src="'+m.src+'" alt=""><figcaption>'+esc(m.who?fill(T.drawBy,{k:m.who}):m.label)+'</figcaption></figure>'}).join("")+'</div>';
  if(kids().length>=2)h+=bubble(esc(ST.missionsReveal))+'<ul class="ms">'+G.missions.map(function(m){return '<li>'+esc(D.MISSIONS[m])+'</li>'}).join("")+'</ul>';
  card(h,'<button type="button" class="btn" id="bDip">🏅 '+esc(T.diploma)+'</button><button type="button" class="btn ghost" id="bHome">'+esc(T.home)+'</button>');
  say(end+(G.treat?" "+fill(ST.treat,{treat:G.treat}):""));
  $("#bHome").onclick=function(){hush();LS.del(GK);home()};$("#bDip").onclick=function(){diploma(c,p)}}
function diploma(c,p){var med=G.media?Object.keys(G.media).sort().map(function(k){return G.media[k]}):[],d=new Date().toLocaleDateString(L==="en"?"en-GB":"nl-NL",{day:"numeric",month:"long",year:"numeric"}),ks=kids();
  sheet('<div class="a4"><div class="a4in">'+(ok("diploma-stempel")?'<img class="stamp" src="'+IMGROOT+'diploma-stempel.webp?v=1" alt="">':'<div class="stamp emo">🐭</div>')+'<p class="eyebrow">MiniMystery · Inspecteur Kruimel</p><h1>'+esc(T.dipTitle)+'</h1><p class="who">'+esc(ks.length?ks.join(", "):(G.name||T.dipTeam))+'</p><p>'+esc(T.dipText)+'</p><div class="dface">'+pic(c)+'</div><p class="small">'+esc(T.dipThief)+': <b>'+esc(c.name)+'</b>'+(LENR[G.len][1]?' · '+esc(p.name):'')+'</p><p class="small">'+esc(T.dipDate)+': '+esc(d)+' · '+"★".repeat(G.stars)+"☆".repeat(3-G.stars)+'</p>'+(med.length?'<div class="dipdos">'+med.slice(0,4).map(function(m){return '<img src="'+m.src+'" alt="">'}).join("")+'</div>':'')+'</div></div>'+
    '<button type="button" class="btn" id="dPrint">🖨 '+esc(T.diploma)+'</button><button type="button" class="btn ghost dk" id="shX">'+esc(T.back)+'</button>');
  $("#shX").onclick=closeSheet;$("#dPrint").onclick=function(){document.body.classList.add("printA4");window.print();setTimeout(function(){document.body.classList.remove("printA4")},800)}}

/* ---------- start ---------- */
home();
if(/[?&]oefen/.test(location.search)){newGame({lvl:LVL,len:LEN,demo:true});brief()}
})();
