/* Moordwandeling – rustig startscherm, gedeeld door alle wandelingen (zelfde opzet als MiniMystery). Laden ná het spel:
     <script src="../shared/start.js?v=1" data-game="lb"></script>
   Zonder de spel-logica te veranderen (bestaande knoppen en hun handlers worden alleen verplaatst):
   1. Nieuw (nog geen teamticket)? → bovenaan de gratis proefronde.
   2. Eén grote knop "Start de zaak", met daarboven één regel met de instellingen (lengte, binnen/buiten, serie) en "Aanpassen".
   3. Andere zaak, zaakcode, groepszaak, archief, schimmenboek, proefronde en wissen staan klein onder "Meer".
   4. Rang, dagen op rij en de uitlegstappen gaan van het startscherm af; de uitleg staat achter "Hoe werkt het?". */
(function(){
"use strict";
var MW=window.MW,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var me=document.currentScript,GID=(me&&me.dataset.game)||"",L=(document.documentElement.lang||"en").slice(0,2)==="nl"?"nl":"en";
var X={nl:{where:"Waar speel je?",len:"Lengte",ser:"Serie",edit:"Aanpassen",editX:"Klaar",start:"Start de zaak",
    newH:"Nieuw hier?",newT:"Speel eerst gratis de proefronde: een korte zaak op een getekende kaart, zodat je ziet hoe het werkt.",trial:"▶ Gratis proefronde",trialS:"Proefronde",
    how:"Hoe werkt het?",need:"Eén ticket per team. Iedereen vult dezelfde code in op zijn eigen telefoon, of jullie spelen samen op één telefoon. Laadt de kaart niet, dan speel je verder op de plattegrond.",close:"Sluiten",moreB:"Meer"},
  en:{where:"Where are you playing?",len:"Length",ser:"Series",edit:"Change",editX:"Done",start:"Start the case",
    newH:"New here?",newT:"Play the free practice round first: a short case on a drawn map, so you can see how it works.",trial:"▶ Free practice round",trialS:"Practice round",
    how:"How does it work?",need:"One ticket per team. Everyone enters the same code on their own phone, or you play together on one phone. If the map won't load, you carry on with the street plan.",close:"Close",moreB:"More"}}[L];

function css(){if(document.getElementById("mwStartCss"))return;var s=document.createElement("style");s.id="mwStartCss";s.textContent=
  ".mwSum{display:flex;align-items:center;gap:10px;font-size:14px;line-height:1.35;text-align:left;opacity:.9}"+
  ".mwSum span{flex:1}.mwSum button{flex:0 0 auto;width:auto;background:none;border:0;color:inherit;font:inherit;font-weight:600;text-decoration:underline;text-underline-offset:3px;padding:6px 2px;cursor:pointer}"+
  ".mwSet{display:flex;flex-direction:column;gap:10px;padding:12px;border:1px dashed rgba(200,190,175,.4);border-radius:4px}.mwSet[hidden]{display:none}"+
  ".mwSet .mwL{font-family:var(--f-cond,inherit);text-transform:uppercase;letter-spacing:.12em;font-size:12px;opacity:.8;margin-bottom:-4px;text-align:left}"+
  ".mwNew{padding:14px;border:1px solid rgba(200,190,175,.4);border-radius:4px;background:rgba(0,0,0,.35);text-align:left;display:flex;flex-direction:column;gap:8px}"+
  ".mwNew h3{margin:0;font-family:var(--f-cond,inherit);text-transform:uppercase;letter-spacing:.12em;font-size:14px;font-weight:600}.mwNew p{margin:0;font-size:14px;line-height:1.4;opacity:.9}.mwNew .btn{width:100%!important;margin:0!important}"+
  ".mwGo{font-size:19px!important;padding-top:17px!important;padding-bottom:17px!important}"+
  ".mwLinks{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.mwLinks[hidden]{display:none}"+
  ".mwLinks>.btn{width:auto!important;flex:0 0 auto;min-height:0!important;padding:8px 12px!important;font-size:13px!important;margin:0!important;align-self:auto!important}"+
  ".mwHow{list-style:none;margin:10px 0 14px;padding:0;counter-reset:mh}.mwHow li{display:grid;grid-template-columns:30px 1fr;gap:10px;margin:0 0 12px;counter-increment:mh;text-align:left;line-height:1.4;color:inherit}"+
  ".mwHow li::before{content:counter(mh);width:26px;height:26px;border-radius:50%;background:#b3222b;color:#f4ece0;display:grid;place-items:center;font-size:14px}"+
  ".mwNeed{font-size:14px;line-height:1.45;margin:0 0 10px;opacity:.85}.mwSafe{font-size:13px;opacity:.75;margin:0 0 12px}";
  document.head.appendChild(s)}

function txt(b){return b?b.textContent.replace(/\s+/g," ").trim():""}
function on(seg){return seg?seg.querySelector('button[aria-pressed="true"]'):null}
function label(t){var d=document.createElement("div");d.className="mwL";d.textContent=t;return d}
function sheetFn(){return MW&&MW.Walk&&MW.Walk.sheet?MW.Walk.sheet:window.sheet}
function closeFn(){return MW&&MW.Walk&&MW.Walk.closeSheet?MW.Walk.closeSheet:window.closeSheet}

function build(){var home=$("#home"),wrap=home&&home.querySelector(".wrap"),go=$("#bGps");if(!wrap||!go||$(".mwSet"))return;css();
  /* rang en reeks weg van het startscherm */
  [".pline",".strip"].forEach(function(s){var e=wrap.querySelector(s);if(e)e.hidden=true});
  var xp=$("#pXp");if(xp){var xd=xp.closest(".xp");if(xd&&xd.parentNode&&xd.parentNode!==wrap)xd.parentNode.hidden=true;else if(xd)xd.hidden=true}
  if($("#pNext"))$("#pNext").hidden=true;
  var where=$("#where"),len=$("#len"),stories=$("#stories"),how=wrap.querySelector("ol.how"),demo=$("#bDemo");
  var safe=$$("#home .wrap > p.note").filter(function(p){return /openbare weg|public road|verkeer|traffic/i.test(p.textContent)})[0]||null;
  /* nieuwe volgorde: na de verhaaltekst */
  var after=wrap.querySelector(".tasks")||wrap.querySelector(".lead")||go,anchor=document.createElement("div");after.parentNode.insertBefore(anchor,after.nextSibling);
  var frag=document.createDocumentFragment(),add=function(n){if(n)frag.appendChild(n)};
  var nw=document.createElement("div");nw.className="mwNew";nw.innerHTML='<h3>'+X.newH+'</h3><p>'+X.newT+'</p>';if(demo)add(nw);
  add($("#bResume"));
  var sum=document.createElement("div");sum.className="mwSum";sum.innerHTML='<span></span><button type="button" aria-expanded="false">'+X.edit+' ▾</button>';add(sum);
  var set=document.createElement("div");set.className="mwSet";set.hidden=true;add(set);
  go.classList.add("mwGo");add(go);add($("#status"));add($("#bPro"));
  var foot=document.createElement("div");foot.className="mwLinks";add(foot);
  var links=document.createElement("div");links.className="mwLinks";links.hidden=true;add(links);
  add(safe);
  anchor.parentNode.replaceChild(frag,anchor);
  /* instellingen */
  if(where){set.appendChild(label(X.where));set.appendChild(where);if($("#inNote"))set.appendChild($("#inNote"))}
  if(len){set.appendChild(label(X.len));set.appendChild(len)}
  if(stories){var pe=stories.previousElementSibling;if(pe&&pe.classList.contains("eyebrow"))pe.remove();set.appendChild(label(X.ser));set.appendChild(stories);if($("#stTag"))set.appendChild($("#stTag"))}
  if(!set.children.length)sum.hidden=true;
  /* kleine knoppen */
  var howB=document.createElement("button");howB.type="button";howB.className="btn ghost sm";howB.textContent=X.how;foot.appendChild(howB);
  var moreB=document.createElement("button");moreB.type="button";moreB.className="btn ghost sm";moreB.textContent=X.moreB+" ▾";foot.appendChild(moreB);
  moreB.onclick=function(){links.hidden=!links.hidden;moreB.textContent=X.moreB+(links.hidden?" ▾":" ▴")};
  ["#bRandom","#bCode","#bGrp","#bEcho","#bBookHome","#bArch","#bScare","#bWipe"].forEach(function(id){var b=$(id);if(b){b.classList.add("ghost","sm");b.classList.remove("red");links.appendChild(b)}});
  if(how)how.hidden=true;
  howB.onclick=function(){var items=how?[].slice.call(how.querySelectorAll("li")).map(function(li){return "<li>"+li.innerHTML+"</li>"}).join(""):"";
    sheetFn()('<h2>'+X.how+'</h2>'+(items?'<ol class="mwHow">'+items+'</ol>':'')+'<p class="mwNeed">'+X.need+'</p>'+(safe?'<p class="mwSafe">'+safe.textContent+'</p>':'')+'<button type="button" class="btn ghost dk" id="mwHowX">'+X.close+'</button>');
    document.getElementById("mwHowX").onclick=function(){closeFn()()}};
  sum.querySelector("button").onclick=function(){set.hidden=!set.hidden;this.setAttribute("aria-expanded",!set.hidden);this.textContent=set.hidden?X.edit+" ▾":X.editX+" ▴"};
  set.addEventListener("click",function(){setTimeout(refresh,0)});
  /* vaste bijzin onder de stappen ("Blijf op de openbare weg") staat in "Hoe werkt het?"; op het scherm klein */
  if(safe)safe.style.cssText+=";font-size:12px;opacity:.7;text-align:center";
  /* sierlijnen die nu naast elkaar of onderaan staan opruimen */
  [].slice.call(wrap.children).forEach(function(e){if(e.classList.contains("orn")){var n=e.nextElementSibling;while(n&&n.hidden)n=n.nextElementSibling;if(!n||n.classList.contains("orn")||n===safe)e.hidden=true}});
  function refresh(){var bits=[],w=on(where),l=on(len),s=on(stories);if(w)bits.push(txt(w));if(l)bits.push(txt(l));if(s)bits.push(txt(s));
    var sj=bits.join(" · "),sp=sum.querySelector("span");if(sp.textContent!==sj)sp.textContent=sj;
    var lk=MW&&MW.pro&&MW.pro.locked?MW.pro.locked(GID):false;
    var want=(lk?"🔒 ":"")+X.start;if(go.textContent!==want)go.textContent=want;
    if(demo){if(lk){nw.hidden=false;if(demo.parentNode!==nw)nw.appendChild(demo);demo.className="btn";if(demo.textContent!==X.trial)demo.textContent=X.trial}
      else{nw.hidden=true;if(demo.parentNode!==links)links.insertBefore(demo,$("#bWipe"));demo.className="btn ghost sm";if(demo.textContent!==X.trialS)demo.textContent=X.trialS}}
    var st=$("#status");if(st){var hd=!st.textContent.trim();if(st.hidden!==hd)st.hidden=hd}}
  var busy=false,q=function(){if(busy)return;busy=true;setTimeout(function(){refresh();busy=false},0)};
  refresh();
  new MutationObserver(function(){if(!home.hidden)q()}).observe(home,{attributes:true,attributeFilter:["hidden"]});
  /* het spel zet bij elke terugkeer de tekst van de startknop en de status opnieuw */
  new MutationObserver(function(){if(!busy)q()}).observe(wrap,{childList:true,characterData:true,subtree:true});
  if(MW&&MW.pro&&MW.pro.ready&&MW.pro.ready.then)MW.pro.ready.then(function(){setTimeout(refresh,50)});
  setTimeout(refresh,300)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();
