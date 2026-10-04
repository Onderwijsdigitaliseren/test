/* Moordwandeling / Murder Walk – gedeelde platformlaag
   Eén account over alle wandelspellen heen: profiel (rang, punten, dagstreak), Pro, groepspas,
   codes.json, taal. Alles in localStorage onder ss_* (zelfde origin = gedeeld tussen pagina's).
   Laad dit bestand vóór catalog.js en vóór de spel-scripts: <script src="/shared/platform.js"></script> */
(function(){
"use strict";
/* ===== PRO-INSTELLINGEN: alleen hier aanpassen ===== */
var CFG={
  url:"https://ko-fi.com/s/aa277497a2",  // Ko-fi-product voor Pro
  price:"€ 3,99",                    // staat op de Pro-knop
  hash:1659528216,                   // oude Pro-code (vóór codes.json) blijft hiermee werken
  groep:{
    url:"https://ko-fi.com/s/dc0dfbafe5",  // Ko-fi-product voor de groepspas
    price:"€ 9,99",
    uren:48,                         // geldigheid groepspas na invoeren
    max:10                           // aantal telefoons in de uitleg
  },
  kofi:"https://ko-fi.com/s/aa277497a2", // Ko-fi-knop op de hub; zet hier je Ko-fi-pagina (bijv. https://ko-fi.com/<jouwnaam>) als je die liever toont
  salt:"moordwandeling|",            // zout voor code-hashes; NIET wijzigen, anders werken bestaande codes niet meer
  codes:"codes.json"                 // één codes.json voor het hele platform (relatief aan de site-root)
};
window.SS_PRO=CFG; // spel 1 leest zijn instellingen hieruit
/* site-root: werkt in de root van een domein én in een submap (bv. gebruiker.github.io/repo/) */
var ROOT=location.pathname.replace(/\/(nl\/)?[^\/]*$/,"/");

var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
  del:function(k){try{localStorage.removeItem(k)}catch(e){}}};
var norm=function(s){return String(s||"").toUpperCase().replace(/[^A-Z0-9]/g,"")};
function hashStr(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function sha256(s){var K=[],H=[],W=[];var n=2,i=0;var fr=function(x){return((x-Math.floor(x))*4294967296)|0};
  for(;i<64;n++){var p=true;for(var d=2;d*d<=n;d++)if(n%d===0){p=false;break}if(p){if(i<8)H[i]=fr(Math.pow(n,.5));K[i++]=fr(Math.pow(n,1/3))}}
  var b=unescape(encodeURIComponent(s)),l=b.length,m=[];for(i=0;i<l;i++)m[i>>2]|=b.charCodeAt(i)<<(24-i%4*8);m[l>>2]|=0x80<<(24-l%4*8);m[((l+8>>6)<<4)+15]=l*8;
  var R=function(x,k){return x>>>k|x<<(32-k)};
  for(var j=0;j<m.length;j+=16){var a=H[0],b2=H[1],c=H[2],d2=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
    for(i=0;i<64;i++){W[i]=i<16?m[j+i]|0:(R(W[i-2],17)^R(W[i-2],19)^W[i-2]>>>10)+W[i-7]+(R(W[i-15],7)^R(W[i-15],18)^W[i-15]>>>3)+W[i-16]|0;
      var t1=h+(R(e,6)^R(e,11)^R(e,25))+(e&f^~e&g)+K[i]+W[i]|0,t2=(R(a,2)^R(a,13)^R(a,22))+(a&b2^a&c^b2&c)|0;h=g;g=f;f=e;e=d2+t1|0;d2=c;c=b2;b2=a;a=t1+t2|0}
    H[0]=H[0]+a|0;H[1]=H[1]+b2|0;H[2]=H[2]+c|0;H[3]=H[3]+d2|0;H[4]=H[4]+e|0;H[5]=H[5]+f|0;H[6]=H[6]+g|0;H[7]=H[7]+h|0}
  return H.map(function(x){return(x>>>0).toString(16).padStart(8,"0")}).join("")}
var today=function(){var d=new Date();return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
var yesterday=function(){var d=new Date(Date.now()-864e5);return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};

/* ---------- taal ---------- */
var LANG={
  /* ss_lang staat als ruwe tekst (zonder JSON-aanhalingstekens), zoals de oude loader hem schreef */
  get:function(){var l=null;try{l=localStorage.getItem("ss_lang")||localStorage.getItem("lr_lang")}catch(e){}if(l)l=l.replace(/"/g,"");return l==="nl"||l==="en"?l:null},
  set:function(l){if(l==="nl"||l==="en"){try{localStorage.setItem("ss_lang",l)}catch(e){}}},
  guess:function(){return this.get()||(/moordwandeling/i.test(location.hostname)?"nl":/murderwalk/i.test(location.hostname)?"en":/^nl/i.test(navigator.language||"")?"nl":"en")},
  page:function(){return (document.documentElement.lang||"en").slice(0,2)==="nl"?"nl":"en"}
};

/* ---------- profiel: gedeeld over alle spellen ---------- */
var RANKS={nl:[[0,"Aspirant"],[150,"Surveillant"],[400,"Rechercheur"],[800,"Inspecteur"],[1400,"Hoofdinspecteur"],[2200,"Commissaris"]],
  en:[[0,"Cadet"],[150,"Constable"],[400,"Detective"],[800,"Inspector"],[1400,"Chief Inspector"],[2200,"Commissioner"]]};
var PROFILE={
  RANKS:RANKS,
  get:function(){var p=LS.get("ss_prof",null);if(!p)p={xp:0,streak:0,last:"",solved:0,book:{}};if(!p.games)p.games={};return p},
  save:function(p){LS.set("ss_prof",p)},
  rank:function(xp){var i=0;RANKS.nl.forEach(function(r,j){if(xp>=r[0])i=j});return i},
  rankName:function(xp,lang){return RANKS[lang==="nl"?"nl":"en"][this.rank(xp)][1]},
  next:function(xp){return RANKS.nl[this.rank(xp)+1]||null},
  /* award({game,xp,stars,gps,min,km,title,code}) → {prof,up,stars} ; telt dagstreak alleen bij gps-zaken */
  award:function(o){var p=this.get(),before=this.rank(p.xp);
    if(o.gps){var t=today();if(p.last!==t){p.streak=p.last===yesterday()?p.streak+1:1;p.last=t}}
    p.xp+=o.xp||0;if(o.solved!==false)p.solved=(p.solved||0)+1;
    var g=p.games[o.game]||(p.games[o.game]={n:0,best:0,log:[]});g.n++;if((o.stars||0)>g.best)g.best=o.stars||0;
    if(o.title){g.log.unshift({d:today(),t:o.title,st:o.stars||0,m:Math.round(o.min||0),km:+(o.km||0).toFixed(1),c:o.code||""});g.log=g.log.slice(0,12)}
    this.save(p);return{prof:p,up:this.rank(p.xp)>before}},
  wipe:function(){LS.del("ss_prof")}
};

/* ---------- Pro, groepspas en codes.json ---------- */
var CODES=LS.get("ss_codes",[]),codesOk=false;
var ready=new Promise(function(res){
  var url=ROOT+CFG.codes+"?"+Date.now();
  var done=function(){res(codesOk)};
  try{fetch(url,{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){CODES=(d&&d.codes)||[];LS.set("ss_codes",CODES);codesOk=true;done()}).catch(done)}catch(e){done()}
});
var entry=function(h){for(var i=0;i<CODES.length;i++)if(CODES[i]&&CODES[i].h===h)return CODES[i];return null};
var dayNum=function(s){var p=String(s).split("-");return p[0]*10000+p[1]*100+ +p[2]};
function valid(e,t){return !!e&&!e.uit&&(e.t||"pro")===t&&(!e.tot||dayNum(today())<=dayNum(e.tot))}
// wie de oude (pre-codes.json) Pro-code al had ingevoerd, blijft Pro
if(!LS.get("ss_proH","")&&CFG.hash&&hashStr(norm(LS.get("ss_pro","")))===CFG.hash)LS.set("ss_proH","oud");
var PRO={
  cfg:CFG,
  ready:ready,
  codesOk:function(){return codesOk},
  codes:function(){return CODES},
  isPro:function(){var h=LS.get("ss_proH","");if(!h)return false;var e=entry(h);return !(e&&e.uit)},
  /* vrije proefzaak per spel: spel 1 gebruikt het oude ss_free, nieuwe spellen ss_free_<id> */
  freeKey:function(game){return game==="mw"?"ss_free":"ss_free_"+game},
  usedFree:function(game){return !!LS.get(this.freeKey(game),0)},
  setFree:function(game){LS.set(this.freeKey(game),1)},
  locked:function(game){return !this.isPro()&&this.usedFree(game)},
  groupLeft:function(){var g=LS.get("ss_grp",null);if(!g)return 0;var e=entry(g.h);if(e&&e.uit)return 0;var end=g.t0+(CFG.groep.uren||48)*36e5;
    if(e&&e.tot){var p=String(e.tot).split("-");end=Math.min(end,new Date(+p[0],p[1]-1,+p[2],23,59,59).getTime())}return Math.max(0,end-Date.now())},
  /* redeem(code) → "pro" | "groep" | "used" | "exp" | null */
  redeem:function(v){var c=norm(v);if(!c)return null;
    if(CFG.hash&&hashStr(c)===CFG.hash){LS.set("ss_proH","oud");return"pro"}
    var h=sha256(CFG.salt+c),e=entry(h);if(!e)return null;
    if(valid(e,"pro")){LS.set("ss_proH",h);return"pro"}
    if(valid(e,"groep")){var cur=LS.get("ss_grp",null),used=LS.get("ss_grpU",[]);if(cur&&cur.h===h&&this.groupLeft())return"groep";if(used.indexOf(h)>=0)return"used";
      used.push(h);LS.set("ss_grpU",used);LS.set("ss_grp",{h:h,t0:Date.now()});return"groep"}
    return"exp"}
};

/* ---------- gedeelde teksten (hub, Pro-paneel, nieuwe spellen) ---------- */
var T={
  nl:{pro:"Pro",pH:"Eén keer Pro, alle wandelingen",pT:"Met Pro speel je op het hele platform elke dag een nieuwe zaak en zoveel extra zaken als je wilt. Je betaalt één keer via Ko-fi en krijgt daar een code. Vul die hieronder in.",
    pBtn:"Word Pro",pHave:"Ik heb een code",pUse:"Code invoeren",pOk:"Pro staat aan. Veel succes, rechercheur.",pBad:"Die code klopt niet. Controleer hem en probeer het opnieuw.",pExp:"Deze code is verlopen.",pUsedC:"Deze groepscode is op dit toestel al gebruikt.",pNoNet:"De codelijst kon niet worden geladen. Controleer je verbinding en probeer het opnieuw.",pWait:"Even geduld, de codes worden geladen…",
    pOn:"Pro is actief op dit toestel.",pFree:"Je eerste zaak van elk spel is gratis.",pUsed:"Je gratis zaak is gespeeld. Met Pro speel je elke dag een nieuwe.",
    gp:"Groepspas",gpOn:"Groepspas actief, nog {h} uur.",gpOk:"Groepspas staat aan voor {u} uur.",gpH:"Speel met een groep",gpT:"Met een groepspas maak je {u} uur lang groepszaken aan, voor maximaal {n} telefoons. Alleen jij hebt de pas nodig. De rest doet gratis mee via je uitnodiging. De {u} uur gaan in zodra je de code invoert.",gpBtn:"Koop een groepspas",
    cancel:"Annuleren",close:"Sluiten",rank:"Rang",streak:"Dagen op rij",solved:"Opgelost",pts:"{x} punten. Nog {n} tot {r}.",ptsTop:"{x} punten. Hoogste rang bereikt."},
  en:{pro:"Pro",pH:"Pro once, every walk",pT:"Pro unlocks a new case every day and as many extra cases as you like, across the whole platform. Pay once via Ko-fi and you get a code. Enter it below.",
    pBtn:"Go Pro",pHave:"I have a code",pUse:"Enter code",pOk:"Pro is on. Good luck, detective.",pBad:"That code is not right. Check it and try again.",pExp:"This code has expired.",pUsedC:"This group code has already been used on this phone.",pNoNet:"The code list could not be loaded. Check your connection and try again.",pWait:"One moment, loading codes…",
    pOn:"Pro is active on this phone.",pFree:"Your first case of every game is free.",pUsed:"Your free case is played. With Pro you play a new one every day.",
    gp:"Group pass",gpOn:"Group pass active, {h} hours left.",gpOk:"Group pass is on for {u} hours.",gpH:"Play with a group",gpT:"A group pass lets you create group cases for {u} hours, for up to {n} phones. Only you need the pass; the others join free through your invitation. The {u} hours start when you enter the code.",gpBtn:"Buy a group pass",
    cancel:"Cancel",close:"Close",rank:"Rank",streak:"Day streak",solved:"Solved",pts:"{x} points. {n} more to make {r}.",ptsTop:"{x} points. Top rank reached."}
};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
var fill=function(s,o){return String(s).replace(/\{(\w+)\}/g,function(m,k){return o&&k in o?o[k]:m})};

/* Pro-paneel: HTML + binding. Zelfde ids als in spel 1 (pCode/pOk/pMsg). kind: "pro"|"groep" */
function proHTML(lang,kind){var t=T[lang]||T.en,g=kind==="groep",url=g?CFG.groep.url:CFG.url,price=g?CFG.groep.price:CFG.price,U={u:CFG.groep.uren,n:CFG.groep.max};
  return '<div class="eyebrow">'+(g?t.gp:t.pro)+'</div><h2>'+(g?t.gpH:t.pH)+'</h2><p>'+fill(g?t.gpT:t.pT,U)+'</p>'+
    (url?'<a class="btn" href="'+esc(url)+'" target="_blank" rel="noopener">'+(g?t.gpBtn:t.pBtn)+(price?' · '+esc(price):'')+'</a>':'')+
    '<div class="eyebrow">'+t.pHave+'</div><input class="inp" id="pCode" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="'+t.pHave+'"><button type="button" class="btn ghost dk" id="pOk">'+t.pUse+'</button><p class="note" id="pMsg" style="color:#a5392c"></p>'}
function bindPro(root,lang,done){var t=T[lang]||T.en,inp=root.querySelector("#pCode"),ok=root.querySelector("#pOk"),msg=root.querySelector("#pMsg"),busy=false;
  var go=function(){if(busy)return;busy=true;var v=inp.value;var run=function(){var r=PRO.redeem(v);busy=false;
      if(r==="pro"||r==="groep"){msg.textContent="";done&&done(r,r==="pro"?t.pOk:fill(t.gpOk,{u:CFG.groep.uren}))}
      else{msg.textContent=r==="exp"?t.pExp:r==="used"?t.pUsedC:!codesOk&&CODES.length===0?t.pNoNet:t.pBad;try{navigator.vibrate&&navigator.vibrate(120)}catch(e){}}};
    if(!codesOk){msg.textContent=t.pWait;ready.then(run)}else run()};
  ok.onclick=go;inp.onkeydown=function(e){if(e.key==="Enter")go()}}
function statusText(lang,game){var t=T[lang]||T.en,s=PRO.isPro()?t.pOn:game&&PRO.usedFree(game)?t.pUsed:t.pFree,gl=PRO.groupLeft();return s+(gl?" "+fill(t.gpOn,{h:Math.ceil(gl/36e5)}):"")}

/* ---------- navigatie ---------- */
function gameUrl(id,lang){var c=window.MW_CATALOG,g=c&&c.games.filter(function(x){return x.id===id})[0];if(!g)return hubUrl(lang);return ROOT+g[lang==="nl"?"nl":"en"].slug}
function hubUrl(lang){return ROOT+(lang==="nl"?"nl/":"")}
/* op een spelpagina: taal wisselen = andere taalpagina van hetzelfde spel, hash meenemen */
function switchLang(id,to){LANG.set(to);location.href=gameUrl(id,to)+location.hash}

window.MW={v:1,root:ROOT,cfg:CFG,LS:LS,norm:norm,hashStr:hashStr,sha256:sha256,today:today,esc:esc,fill:fill,
  lang:LANG,profile:PROFILE,pro:PRO,T:T,t:function(lang){return T[lang]||T.en},
  proHTML:proHTML,bindPro:bindPro,statusText:statusText,gameUrl:gameUrl,hubUrl:hubUrl,switchLang:switchLang};
})();
