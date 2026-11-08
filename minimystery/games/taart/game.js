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
var G=null,tick=0,tmr=0;

/* ---------- plekken (deel 2) ---------- */
var PLACES=[
 {id:"schuur",name:"de schuur",buiten:true,hoog:false,koud:true,alibi:"Niet in de schuur: daar zit een slot op en de sleutel is al weken zoek."},
 {id:"koelkast",name:"de koelkast",buiten:false,hoog:false,koud:true,alibi:"Niet in de koelkast: die zit propvol limonade, er past geen taart meer bij."},
 {id:"zolder",name:"de zolder",buiten:false,hoog:true,koud:false,alibi:"Niet op zolder: de zoldertrap kraakt enorm en niemand heeft dat gehoord."},
 {id:"bank",name:"onder de bank",buiten:false,hoog:false,koud:false,alibi:"Niet onder de bank: Hond Bo heeft daar net gezocht naar zijn sok."},
 {id:"boom",name:"in de boom",buiten:true,hoog:true,koud:false,alibi:"Niet in de boom: de ladder ligt op de grond en niemand kan zo hoog klimmen."}];
var PC={
 buiten:{true:{t:"Modder aan de doos",d:"Op de vloer ligt een stukje van de taartdoos met modder eraan. De taart is buiten!",strike:"binnen"},false:{t:"Geen modder",d:"Nergens modder, geen natte voetstappen. De taart is binnen gebleven.",strike:"buiten"}},
 hoog:{true:{t:"Slagroom op de leuning",d:"Op een trapleuning en een ladder zit slagroom. De taart is naar boven gegaan: hij ligt hoog!",strike:"laag"},false:{t:"Slagroom op de vloer",d:"Een slagroomspoor over de vloer, en nergens hoger. De taart ligt laag.",strike:"hoog"}},
 koud:{true:{t:"Stijve slagroom",d:"Een klodder slagroom die we vonden is nog stijf en koud. De taart staat op een koude plek!",strike:"warm"},false:{t:"Gesmolten slagroom",d:"De slagroom die we vonden is helemaal gesmolten. De taart staat op een warme plek.",strike:"koud"}}};

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
function genCase(seed,len){var r=rngOf(seed),n1=LENR[len][0],n2=LENR[len][1];
  var culprit=pick(D.S,r),place=pick(PLACES,r);
  var clues=findClues(D.S,culprit,["vacht","hoed","klein","kleur"],n1,r)||findClues(D.S,culprit,["vacht","hoed","klein","kleur"],n1,rngOf(seed+7),9);
  var pclues=n2?findClues(PLACES,place,["buiten","hoog","koud"],n2,r,1)||findClues(PLACES,place,["buiten","hoog","koud"],n2,rngOf(seed+9),9):[];
  var sus=shuffle(D.S.map(function(s){return s.id}),r),house=shuffle(D.TASKS.filter(function(t){return t.kind!=="mini"}),r),mini=shuffle(D.TASKS.filter(function(t){return t.kind==="mini"}),r);
  var rounds=[],first=r()<.5;
  for(var i=0;i<n1+n2;i++){var useMini=(i%2===0)===first,t=(useMini?mini:house).shift()||(useMini?house:mini).shift();
    rounds.push({part:i<n1?1:2,s:i<n1?sus[i]||null:null,task:t.id,clue:i<n1?clues[i]:pclues[i-n1]})}
  /* vaste gegevens voor minispellen, zodat beide telefoons hetzelfde zien */
  var mk={vinger:Math.floor(r()*1e9),geheugen:Math.floor(r()*1e9),slot:Math.floor(r()*1e9),spiegel:Math.floor(r()*1e9),schaduw:pick(D.S,r).id,kaarsjes:5+Math.floor(r()*8),kruimels:Math.floor(r()*1e9)};
  return{culprit:culprit.id,place:place.id,rounds:rounds,mk:mk}}
function makeCode(seed,lvl,len){return"WT"+(lvl+1)+(len==="kort"?"K":len==="lang"?"L":"N")+seed.toString(36).toUpperCase()}
function parseCode(v){var m=/^WT([12])([KNL])([0-9A-Z]{1,8})$/.exec(MW.norm(v));if(!m)return null;var seed=parseInt(m[3],36);if(!(seed>=0)||seed>4294967295)return null;return{lvl:+m[1]-1,len:m[2]==="K"?"kort":m[2]==="L"?"lang":"normaal",seed:seed}}
function newGame(o){var seed=o.seed!=null?o.seed:Math.floor(Math.random()*4294967295);var c=genCase(seed,o.len);
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

/* ---------- briefing: verhaal, verdachten, rollen, geheime missies ---------- */
function brief(){show("brief");var nm=jarige();
  $("#bfBody").innerHTML=bubble(esc(fill(ST.open,{naam:nm})))+bubble(esc(ST.open2))+'<p class="eyebrow">'+esc(ST.intro)+'</p><div class="sus">'+D.S.map(function(s){return '<div class="sc">'+pic(s)+'<b>'+esc(s.name)+'</b><small>'+esc(s.thing)+'</small></div>'}).join("")+'</div>'+
    '<p class="note">'+esc(T.cluesN.replace("{n}","0").replace("{m}",G.c.rounds.filter(function(x){return x.part===1}).length))+' · '+esc(G.code)+'</p>';
  say(fill(ST.open,{naam:nm})+" "+ST.open2);
  $("#bGo").onclick=function(){hush();if(kids().length>=2&&G.r===0&&!G.msDone)missions(0);else{G.t0=G.t0||Date.now();save();route()}}}
function missions(i){var ks=kids();if(i>=ks.length){G.msDone=true;G.t0=Date.now();save();sheet('<h2>'+esc(T.secret)+'</h2><p>'+esc(T.secretDone)+'</p><button type="button" class="btn" id="shX">'+esc(T.next)+'</button>');$("#shX").onclick=function(){closeSheet();route()};return}
  var m=D.MISSIONS[G.missions[i]];
  sheet('<h2>'+esc(T.secret)+': '+esc(ks[i])+'</h2><p class="note">'+esc(T.secretHold)+'</p><button type="button" class="hold" id="hold"><span class="hid">'+esc(m)+'</span><em>👁 '+esc(ks[i])+'</em></button><button type="button" class="btn" id="msNext">'+esc(i+1<ks.length?fill(T.secretNext,{k:ks[i+1]}):T.next)+'</button>');
  var h=$("#hold"),on=function(e){e.preventDefault();h.classList.add("on")},off=function(){h.classList.remove("on")};
  h.addEventListener("pointerdown",on);h.addEventListener("pointerup",off);h.addEventListener("pointercancel",off);h.addEventListener("pointerleave",off);
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

function task(){var R=cur(),t=D.TASKS.filter(function(x){return x.id===R.task})[0],rl=roles();
  var head='<h2>'+esc(T.task)+': '+esc(t.t)+'</h2>'+(R.part===1&&R.s===null?bubble(esc(fill(ST.extra,{n:G.r+1}))):'')+'<p class="tk">'+esc(kids().length>=2?fill(ST.task,{role:rl[1][1],timer:rl[2][1]}):ST.task.split(".")[0]+".")+'</p>';
  say(t.t+". "+t.d);
  if(t.kind==="house")return taskHouse(t,head);if(t.kind==="freeze")return taskFreeze(t,head);
  ({kruimels:miniKruimels,vinger:miniVinger,geheugen:miniGeheugen,slot:miniSlot,spiegel:miniSpiegel,schaduw:miniSchaduw,kaarsjes:miniKaarsjes})[t.id](t,head)}
function taskDone(t){clearInterval(task.t);clearTimeout(task.t2);cheer();buzz([60,40,60]);toast(t.ok||T.ready);setTimeout(nextPhase,700)}
function taskHouse(t,head){card(head+'<p class="big">'+esc(t.d)+'</p>'+(t.sec?'<div class="timer" id="tmr">'+mmss(t.sec*1000)+'</div><button type="button" class="btn ghost" id="bTmr">▶ '+esc(T.time)+'</button>':''),'<button type="button" class="btn" id="bDone">'+esc(T.done)+'</button>');
  if(t.sec){$("#bTmr").onclick=function(){var end=Date.now()+t.sec*1000;this.disabled=true;clearInterval(task.t);task.t=setInterval(function(){var l=end-Date.now();$("#tmr").textContent=mmss(l);if(l<=0){clearInterval(task.t);$("#tmr").textContent="0:00";beep(440,400);buzz(300)}else if(l<5500&&Math.floor(l/1000)!==Math.floor((l+1000)/1000))beep(660,80)},200)}}
  $("#bDone").onclick=function(){taskDone(t)}}
function taskFreeze(t,head){var n=0;card(head+'<p class="big">'+esc(t.d)+'</p><div class="freeze" id="fz">'+esc(T.freeze)+'</div>','<button type="button" class="btn" id="bDone" disabled>'+esc(T.done)+'</button>');
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

/* ---------- spoor en sporenbord ---------- */
function clueOf(R){var c=R.clue;if(R.part===1){if(c.type==="alibi"){var s=SBY[c.id];return{t:s.short+": alibi",d:s.alibi,strike:null,ids:[s.id]}}
    if(c.type==="kleur"){var k=SBY[G.c.culprit].kleurNaam;return{t:fill(D.C.kleur.t,{k:k}),d:fill(D.C.kleur.d,{k:k}),strike:fill(D.C.kleur.strike,{k:k}),ids:D.S.filter(function(x){return x.kleur!==k}).map(function(x){return x.id})}}
    var cc=D.C[c.type][c.val];return{t:cc.t,d:cc.d,strike:cc.strike,ids:D.S.filter(function(x){return !!x[c.type]!==c.val}).map(function(x){return x.id})}}
  if(c.type==="alibi"){var p=PLACES.filter(function(x){return x.id===c.id})[0];return{t:cap(p.name)+": nee",d:p.alibi,strike:null,ids:[p.id]}}
  var pc=PC[c.type][c.val];return{t:pc.t,d:pc.d,strike:pc.strike,ids:PLACES.filter(function(x){return !!x[c.type]!==c.val}).map(function(x){return x.id})}}
function clue(){var R=cur(),c=clueOf(R);if(R.part===1){if(G.seen<=G.r)G.seen=G.r+1}else{var n1=G.c.rounds.filter(function(x){return x.part===1}).length;if(G.pseen<=G.r-n1)G.pseen=G.r-n1+1}save();hud();
  card('<h2>'+esc(T.clue)+'</h2>'+bubble(esc(ST.clue))+'<div class="cluecard"><span class="eyebrow">'+esc(T.clue)+' '+(R.part===1?G.seen:G.pseen)+'</span><h3>'+esc(c.t)+'</h3><p>'+esc(c.d)+'</p></div>','<button type="button" class="btn" id="bNext">'+esc(T.board)+' ▸</button>');
  say(ST.clue+" "+c.t+". "+c.d);$("#bNext").onclick=function(){hush();nextPhase()}}
function seenClues(part){return G.c.rounds.filter(function(R,i){return R.part===part&&(part===1?i<G.seen:i-G.c.rounds.filter(function(x){return x.part===1}).length<G.pseen)}).map(clueOf)}
function board(){var R=cur(),p1=R.part===1,items=p1?D.S:PLACES,st=p1?G.struck:G.pstruck,c=clueOf(R);
  card('<h2>'+esc(T.board)+'</h2><p class="note">'+esc(G.lvl===0&&c.strike?fill(ST.boardEasy,{strike:c.strike}):ST.board)+'</p>'+
    '<div class="clist">'+seenClues(R.part).map(function(x){return '<span class="chip">'+esc(x.t)+'</span>'}).join("")+'</div>'+
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
  var txt=c.name+" geeft toe, maar zegt niet waar de taart is. Vijf verstopplekken. Doe de opdrachten, verzamel plek-sporen en streep weg waar de taart níet kan zijn.";
  card('<h2>Waar is de taart?</h2>'+bubble(esc(txt))+'<div class="grid">'+PLACES.map(function(p){return '<div class="sc">'+placePic(p)+'<b>'+esc(cap(p.name))+'</b></div>'}).join("")+'</div>','<button type="button" class="btn" id="bNext">'+esc(T.go)+'</button>');
  say(txt);$("#bNext").onclick=function(){hush();G.phase="task";save();route()}}
function pfind(){show("play");hud();
  card('<h2>Waar is de taart?</h2>'+bubble("Jullie hebben alle plek-sporen. Waar ligt de taart? Kies samen.")+'<p class="note">'+esc(fill(T.tries,{n:G.ptries}))+'</p><div class="grid" id="gr">'+PLACES.map(function(p){var out=G.paccused&&G.paccused.indexOf(p.id)>=0;return '<button type="button" class="sc'+(out||G.pstruck[p.id]?" x":"")+'" data-id="'+p.id+'"'+(out?' disabled':'')+'>'+placePic(p)+'<b>'+esc(cap(p.name))+'</b></button>'}).join("")+'</div>','');
  say("Waar ligt de taart? Kies samen.");
  $("#gr").onclick=function(e){var b=e.target.closest(".sc");if(!b||b.disabled)return;var p=PLACES.filter(function(x){return x.id===b.dataset.id})[0];
    if(p.id===G.c.place){G.found=true;if(G.ptries<2&&G.stars>0)G.stars--;save();cheer();buzz([80,50,200]);return finale()}
    G.ptries--;G.paccused=(G.paccused||[]).concat([p.id]);G.pstruck[p.id]=true;beep(180,400,"sawtooth");buzz(300);
    if(G.ptries<=0){G.found=true;if(G.stars>0)G.stars--;save();toast("Inspecteur Kruimel: de taart lag "+PLACES.filter(function(x){return x.id===G.c.place})[0].name+"!");return setTimeout(finale,1200)}
    save();sheet('<h2>'+esc(cap(p.name))+'</h2>'+bubble(esc(p.alibi))+'<button type="button" class="btn" id="shX">'+esc(T.again)+'</button>');say(p.alibi);$("#shX").onclick=function(){closeSheet();pfind()}}}

/* ---------- finale ---------- */
function finale(){clearInterval(tmr);show("play");var c=SBY[G.c.culprit],p=PLACES.filter(function(x){return x.id===G.c.place})[0];
  if(!G.logged){G.logged=true;var min=(Date.now()-(G.t0||Date.now()))/6e4;MW.profile.award({game:ID,xp:40+G.stars*20,stars:G.stars,gps:false,min:min,km:0,title:"Wie heeft de taart gepakt?",code:G.code});save()}
  var end=ST.end+(LENR[G.len][1]?" Hij lag "+p.name+".":"");
  var h='<h2>'+esc(T.won)+'</h2><div class="stars">'+"★".repeat(G.stars)+"☆".repeat(3-G.stars)+'</div>'+(ok("taart")?'<img class="hero" src="'+IMGROOT+'taart.webp?v=1" alt="">':'<div class="cake dark">🎂</div>')+bubble(esc(end));
  if(G.treat)h+=bubble(esc(fill(ST.treat,{treat:G.treat})));
  if(kids().length>=2)h+=bubble(esc(ST.missionsReveal))+'<ul class="ms">'+G.missions.map(function(m){return '<li>'+esc(D.MISSIONS[m])+'</li>'}).join("")+'</ul>';
  card(h,'<button type="button" class="btn" id="bDip">🏅 '+esc(T.diploma)+'</button><button type="button" class="btn ghost" id="bHome">'+esc(T.home)+'</button>');
  say(end+(G.treat?" "+fill(ST.treat,{treat:G.treat}):""));
  $("#bHome").onclick=function(){hush();LS.del(GK);home()};$("#bDip").onclick=function(){diploma(c,p)}}
function diploma(c,p){var d=new Date().toLocaleDateString(L==="en"?"en-GB":"nl-NL",{day:"numeric",month:"long",year:"numeric"}),ks=kids();
  sheet('<div class="a4"><div class="a4in">'+(ok("diploma-stempel")?'<img class="stamp" src="'+IMGROOT+'diploma-stempel.webp?v=1" alt="">':'<div class="stamp emo">🐭</div>')+'<p class="eyebrow">MiniMystery · Inspecteur Kruimel</p><h1>'+esc(T.dipTitle)+'</h1><p class="who">'+esc(ks.length?ks.join(", "):(G.name||T.dipTeam))+'</p><p>'+esc(T.dipText)+'</p><div class="dface">'+pic(c)+'</div><p class="small">'+esc(T.dipThief)+': <b>'+esc(c.name)+'</b>'+(LENR[G.len][1]?' · '+esc(p.name):'')+'</p><p class="small">'+esc(T.dipDate)+': '+esc(d)+' · '+"★".repeat(G.stars)+"☆".repeat(3-G.stars)+'</p></div></div>'+
    '<button type="button" class="btn" id="dPrint">🖨 '+esc(T.diploma)+'</button><button type="button" class="btn ghost dk" id="shX">'+esc(T.back)+'</button>');
  $("#shX").onclick=closeSheet;$("#dPrint").onclick=function(){document.body.classList.add("printA4");window.print();setTimeout(function(){document.body.classList.remove("printA4")},800)}}

/* ---------- start ---------- */
home();
if(/[?&]oefen/.test(location.search)){newGame({lvl:LVL,len:LEN,demo:true});brief()}
})();
