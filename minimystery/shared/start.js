/* MiniMystery – rustiger startscherm en briefing, gedeeld door alle zaken. Laden ná game.js:
     <script src="shared/start.js" data-game="pp"></script>
   Wat het doet (zonder de spel-logica te veranderen; de bestaande knoppen en hun handlers worden alleen verplaatst):
   1. Startscherm in drie lagen: (a) nieuw? → gratis proefronde; (b) "Waar spelen jullie?" + één grote startknop;
      (c) alle andere instellingen (naam, niveau, lengte, voorlezen, feestopties) achter "Aanpassen", met een samenvatting.
      Andere zaak, zaakcode, archief, wissen en "Hoe werkt het?" staan als kleine knoppen onderaan.
   2. "Hoe werkt het?" = drie stappen; de volledige uitleg staat ingeklapt onder "Alles voor de begeleider".
   3. Briefing: eerst het verhaal en de verdachten/plekken, de startknop blijft onderin zichtbaar; de zaakcode voor
      meer telefoons staat ingeklapt onderaan (platform.js codeBox). */
(function(){
"use strict";
var MW=window.MW,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var me=document.currentScript,GID=(me&&me.dataset.game)||"",L=(document.documentElement.lang||"nl").slice(0,2)==="en"?"en":"nl";
var X={nl:{where:"Waar spelen jullie?",edit:"Aanpassen",editX:"Klaar",set:"Instellingen",lvl:"Niveau",dur:"Lengte",vOn:"voorlezen aan",vOff:"voorlezen uit",forN:"voor {n}",kids:"{n} namen",kids0:"namen nog leeg",
    newH:"Nieuw hier?",newT:"Speel eerst gratis de proefronde: een paar minuten op een getekende stad, zodat je ziet hoe het werkt.",trial:"▶ Gratis proefronde",real:"De echte zaak",
    how:"Hoe werkt het?",need:"Nodig: één telefoon per groepje en een volwassene erbij. Lezen hoeft niet: de telefoon leest voor.",more:"Alles voor de begeleider",close:"Sluiten",trialS:"Proefronde",moreB:"Meer"},
  en:{where:"Where are you playing?",edit:"Change",editX:"Done",set:"Settings",lvl:"Level",dur:"Length",vOn:"read aloud on",vOff:"read aloud off",forN:"for {n}",kids:"{n} names",kids0:"no names yet",
    newH:"New here?",newT:"Play the free practice round first: a few minutes on a drawn town, so you can see how it works.",trial:"▶ Free practice round",real:"The real case",
    how:"How does it work?",need:"You need: one phone per group and a grown-up. No reading needed: the phone reads aloud.",more:"Everything for the grown-up",close:"Close",trialS:"Practice round",moreB:"More"}}[L];
/* drie stappen per spel: [icoon, kop, uitleg] */
var STEPS={
  pp:{nl:[["🐾","Volg de hoefafdrukken","Loop naar de volgende plek. De pijl en koud/warm/heet wijzen de weg. Binnen loop je op de plaats."],["🧩","Los de puzzel op","Elke puzzel geeft een spoor en een gouden hoefijzer met een cijfer."],["🏡","Waar is Pluis?","Met alle sporen kies je de plek waar Pluis is. Daarna krijg je het Ruiterpaspoort."]],
      en:[["🐾","Follow the hoofprints","Walk to the next place. The arrow and cold/warm/hot show the way. Indoors you walk on the spot."],["🧩","Solve the puzzle","Every puzzle gives a lead and a golden horseshoe with a number."],["🏡","Where is Fluff?","With all the leads you pick the place where Fluff is. Then you get the Rider's Passport."]]},
  ag:{nl:[["🚓","Ga naar het spoor","Loop naar de volgende plek. De pijl en koud/warm/heet wijzen de weg. Binnen loop je op de plaats."],["🧩","Los de politiepuzzel op","Elke puzzel geeft bewijs en een gouden cijfer."],["🕵️","Wie was het?","Met het bewijs wijs je de dief aan. Daarna krijg je het politiediploma."]],
      en:[["🚓","Go to the lead","Walk to the next place. The arrow and cold/warm/hot show the way. Indoors you walk on the spot."],["🧩","Solve the police puzzle","Every puzzle gives evidence and a golden number."],["🕵️","Who did it?","With the evidence you point out the thief. Then you get the police diploma."]]},
  sj:{nl:[["🔦","Zoek de Lichtjesdief","Hij verstopt zich op plekken in de buurt. De pijl en koud/warm/heet wijzen de weg."],["🧩","Vang hem met een opdracht","Gelukt? Dan laat hij van schrik een lichtje vallen."],["🏮","Wie is hij?","Met een volle lantaarn zie je wie hij is en vind je zijn schuilplaats."]],
      en:[["🔦","Find the Light Thief","He hides at places nearby. The arrow and cold/warm/hot show the way."],["🧩","Catch him with a task","Done it? Then he drops a light out of fright."],["🏮","Who is he?","With a full lantern you see who he is and find his hideout."]]},
  gl:{nl:[["🕹️","Loop naar het volgende level","Elke plek in de buurt is een level. De pijl en koud/warm/heet wijzen de weg."],["🧩","Speel het level","Elk level geeft een stukje kristal, XP en munten."],["👾","Versla de eindbaas","Met alle stukjes kristal kan Bit naar huis."]],
      en:[["🕹️","Walk to the next level","Every place nearby is a level. The arrow and cold/warm/hot show the way."],["🧩","Play the level","Every level gives a piece of crystal, XP and coins."],["👾","Beat the final boss","With all the crystal pieces Bit can go home."]]},
  bs:{nl:[["🎤","Ga naar de volgende stop","Loop naar de volgende plek. De pijl en koud/warm/heet wijzen de weg."],["🧩","Doe de opdracht","Dansen, stylen, zoeken: elke opdracht geeft een stukje setlist."],["🌟","Wie had de tas?","Met alle stukjes los je het op, en dan begint de show."]],
      en:[["🎤","Go to the next stop","Walk to the next place. The arrow and cold/warm/hot show the way."],["🧩","Do the task","Dance, style, search: every task gives a scrap of setlist."],["🌟","Who had the bag?","With all the scraps you solve it, and then the show begins."]]},
  gk:{nl:[["🕶️","Bereid de kraak voor","Loop naar de volgende stop. De pijl en koud/warm/heet wijzen de weg. Elke stop is een kraak-puzzel."],["🔢","Verzamel de kluiscode","Elke stop zet iets op het plan: een cijfer, een spoor over de schuilkluis of een tipgever."],["🚔","Ontsnap en kraak de kluis","Als het alarm afgaat loop je naar het onderduikadres, langs de politie. Dan de echte kluis kraken."]],
      en:[["🕶️","Prepare the heist","Walk to the next stop. The arrow and cold/warm/hot show the way. Every stop is a heist puzzle."],["🔢","Collect the vault code","Every stop adds something to the plan: a digit, a trace about the secret vault or a tipster."],["🚔","Escape and crack the vault","When the alarm goes off you walk to the hideout, past the police. Then crack the real vault."]]},
  ts:{nl:[["🪞","Geef de spiegel door","De telefoon gaat de kring rond. De spiegel zegt wie aan de beurt is."],["✨","Verzamel de ingrediënten","Schudden, blazen, zoeken: elke opdracht levert een ingrediënt op."],["🐸","Brouw het drankje","Met alle ingrediënten wordt de kikker weer een prinses."]],
      en:[["🪞","Pass the mirror round","The phone goes round the circle. The mirror says whose turn it is."],["✨","Collect the ingredients","Shake, blow, search: every task gives an ingredient."],["🐸","Brew the potion","With all the ingredients the frog turns back into a princess."]]}};

function css(){if(document.getElementById("mmStartCss"))return;var s=document.createElement("style");s.id="mmStartCss";s.textContent=
  ".mmQ{margin:18px 0 8px;font-weight:700;font-size:15px;text-align:left;opacity:.95}"+
  ".mmSum{display:flex;align-items:center;gap:10px;margin:10px 0 4px;font-size:14px;line-height:1.35;text-align:left;opacity:.92}"+
  ".mmSum span{flex:1}.mmSum button{flex:0 0 auto;width:auto;background:none;border:0;color:inherit;font:inherit;font-weight:700;text-decoration:underline;text-underline-offset:3px;padding:6px 2px;cursor:pointer}"+
  ".mmSet{margin:6px 0 4px;padding:12px;border-radius:16px;border:2px dashed currentColor;border-color:rgba(127,127,127,.45)}.mmSet[hidden]{display:none}"+
  ".mmSet>*{margin-top:10px}.mmSet>*:first-child{margin-top:0}.mmSet .mmL{font-weight:700;font-size:13px;text-align:left;opacity:.85;margin-bottom:-4px}"+
  ".mmNew{margin:16px 0 6px;padding:14px;border-radius:18px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35);text-align:left}"+
  ".mmNew h3{margin:0 0 4px;font-size:17px}.mmNew p{margin:0 0 10px;font-size:14px;line-height:1.4;opacity:.92}.mmNew .btn{margin:0!important;width:100%}"+
  ".mmReal{margin:20px 0 0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;opacity:.8;text-align:left}"+
  ".mmGo{font-size:19px!important;padding-top:18px!important;padding-bottom:18px!important}"+
  ".mmLinks{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:22px 0 8px}.mmLinks.mmMore{margin-top:0}.mmLinks[hidden]{display:none}"+
  ".mmLinks>.btn{width:auto!important;flex:0 0 auto;min-height:0!important;padding:8px 12px!important;font-size:13px!important;margin:0!important;letter-spacing:normal!important}"+
  ".mmHow{list-style:none;margin:10px 0 12px;padding:0}.mmHow li{display:flex;gap:12px;align-items:flex-start;margin:0 0 12px;text-align:left}"+
  ".mmHow i{font-style:normal;font-size:26px;line-height:1;flex:0 0 34px;text-align:center}.mmHow b{display:block;font-size:16px;margin-bottom:2px}.mmHow span{font-size:14px;line-height:1.4}"+
  ".mmNeed{font-size:14px;line-height:1.4;margin:4px 0 12px;opacity:.85}"+
  ".mmMoreD{margin:6px 0 14px;text-align:left}.mmMoreD summary{cursor:pointer;font-weight:700;padding:8px 0}"+
  /* tijdens het spel: begrippen pas tonen als ze iets betekenen. Gouden cijfers pas na het eerste cijfer (het spel legt het dan zelf uit);
     de rang/team-level is afgeleid van de XP/fans en staat in het speurboekje. */
  "#mG:not(:has(.coin:not(.no))),#hG:not(:has(.coin:not(.no))),#goldM:not(:has(.coin:not(.off))),#goldC:not(:has(.coin:not(.off))){display:none!important}"+
  "#mhud>div:has(#mL),#hud>div:has(#hL){display:none}"+
  /* briefing: startknop blijft onderin in beeld */
  "#brief #bGo{position:sticky;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:6;box-shadow:0 8px 26px rgba(0,0,0,.35)}"+
  ".mmCodeD{margin:14px 0 0}.mmCodeD>summary{cursor:pointer;list-style:none;font-weight:700;font-size:14px;padding:10px 12px;border-radius:12px;border:2px dashed rgba(127,127,127,.5)}.mmCodeD>summary::-webkit-details-marker{display:none}";
  document.head.appendChild(s)}

function txt(b){if(!b)return"";var t="";for(var i=0;i<b.childNodes.length;i++){var n=b.childNodes[i];if(n.nodeType===3||n.nodeName==="BR")t+=n.nodeType===3?n.textContent:" ";else if(n.nodeName!=="SMALL")t+=n.textContent}return t.replace(/\s+/g," ").trim()}
function small(b){var s=b&&b.querySelector("small");return s?s.textContent.replace(/\s+/g," ").trim():""}
function on(seg){return seg?seg.querySelector('button[aria-pressed="true"]'):null}
/* een instelling verhuizen, met het label dat erbij hoort */
function unit(el){if(!el)return null;var p=el.parentNode;if(p&&p.classList&&p.classList.contains("optrow"))return [p];var pr=el.previousElementSibling,out=[el];if(pr&&pr.classList&&pr.classList.contains("seglbl"))out.unshift(pr);return out}
function label(t){var d=document.createElement("div");d.className="mmL";d.textContent=t;return d}

function build(){var home=$("#home"),wrap=home&&home.querySelector(".wrap"),go=$("#bGps");if(!wrap||!go||$(".mmSet"))return;css();
  var modeSeg=$("#where")||($("#home [data-m]")||{}).parentNode||null;
  var durSeg=$("#dur")||($("#len [data-n]")?$("#len"):null),lvlSeg=$("#lvl")||$("#age"),route=$("#route");
  var lead=wrap.querySelector(".lead"),howB=$("#bHow"),anchor=document.createElement("div");
  (lead||howB).parentNode.insertBefore(anchor,(lead||howB).nextSibling);
  var frag=document.createDocumentFragment(),add=function(n){if(n)frag.appendChild(n)};
  /* (a) nieuw hier: gratis proefronde (alleen zolang er geen Feestpas is) */
  var nw=document.createElement("div");nw.className="mmNew";nw.innerHTML='<h3>'+X.newH+'</h3><p>'+X.newT+'</p>';add(nw);
  var real=document.createElement("div");real.className="mmReal";real.textContent=X.real;add(real);
  add($("#bResume"));
  /* (b) waar spelen jullie + start */
  /* Toverspiegel: de namen zijn nodig om te beginnen, dus die blijven in beeld */
  var kids=$("#kids");if(kids){var kb=kids.closest(".namebox")||kids;add(kb)}
  var sum=document.createElement("div");sum.className="mmSum";sum.innerHTML='<span></span><button type="button" aria-expanded="false">'+X.edit+' ▾</button>';add(sum);
  var set=document.createElement("div");set.className="mmSet";set.hidden=true;add(set);
  go.classList.add("mmGo");add(go);add($("#status"));add($("#bPro"));
  var foot=document.createElement("div");foot.className="mmLinks";add(foot);
  var moreB=document.createElement("button");moreB.type="button";moreB.className="btn ghost sm";moreB.textContent=X.moreB+" ▾";
  var links=document.createElement("div");links.className="mmLinks mmMore";links.hidden=true;add(links);
  moreB.onclick=function(){links.hidden=!links.hidden;moreB.textContent=X.moreB+(links.hidden?" ▾":" ▴")};
  anchor.parentNode.replaceChild(frag,anchor);
  /* (c) instellingen */
  var putIn=function(arr){(arr||[]).forEach(function(n){if(n)set.appendChild(n)})};
  if(modeSeg){var pl=modeSeg.previousElementSibling;if(pl&&pl.classList.contains("seglbl"))pl.remove();set.appendChild(label(X.where));putIn([modeSeg])}
  var nm=$("#name");if(nm)putIn([nm.closest(".namebox")||nm]);
  if(lvlSeg){var u=unit(lvlSeg);if(u.length===1)set.appendChild(label(X.lvl));putIn(u)}
  if(durSeg){var u2=unit(durSeg);if(u2.length===1)set.appendChild(label(X.dur));putIn(u2)}
  if($("#lenInfo"))putIn([$("#lenInfo")]);
  if(route)putIn(unit(route));
  putIn([$("#bVoice")]);
  var party=$(".mmp-row");if(party)putIn([party]);
  /* overige knoppen klein onderaan */
  if(howB){howB.classList.add("ghost","sm");foot.appendChild(howB)}foot.appendChild(moreB);
  [$("#bRandom"),$("#bCode"),$("#bArch"),$("#bDemo"),$("#bWipe")].forEach(function(b){if(b){b.classList.add("ghost","sm");links.appendChild(b)}});
  /* losse labels die nu leeg/verweesd zijn opruimen */
  $$("#home .wrap > .seglbl").forEach(function(e){e.remove()});
  var demo=$("#bDemo"),demoTxt=demo?demo.textContent:"";
  sum.querySelector("button").onclick=function(){set.hidden=!set.hidden;this.setAttribute("aria-expanded",!set.hidden);this.textContent=(set.hidden?X.edit+" ▾":X.editX+" ▴");if(!set.hidden)set.scrollIntoView({behavior:"smooth",block:"nearest"})};
  set.addEventListener("click",function(){setTimeout(refresh,0)});set.addEventListener("input",function(){setTimeout(refresh,0)});
  /* "Hoe werkt het?": drie stappen, de rest ingeklapt */
  if(howB)howB.onclick=function(){var st=(STEPS[GID]||{})[L]||[],full=$("#howT");
    var b=MW.Walk.sheet('<h2>'+X.how+'</h2><ol class="mmHow">'+st.map(function(s){return '<li><i>'+s[0]+'</i><div><b>'+s[1]+'</b><span>'+s[2]+'</span></div></li>'}).join("")+'</ol><p class="mmNeed">'+X.need+'</p>'+
      (full?'<details class="mmMoreD"><summary>'+X.more+'</summary>'+full.innerHTML+'</details>':'')+'<button type="button" class="btn ghost dk" id="mmHowX">'+X.close+'</button>');
    $("#mmHowX").onclick=MW.Walk.closeSheet};
  function refresh(){var bits=[],md=on(modeSeg),lv=on(lvlSeg),du=on(durSeg),vb=$("#bVoice"),name=nm&&nm.value.trim();
    if(md)bits.push(txt(md));if(lv)bits.push(txt(lv));if(du){var mm=(small(du)+" "+txt(du)).match(/±\s?\d+\s?min/);bits.push(mm?mm[0].replace(/±\s?/,"± "):txt(du))}
    if(vb)bits.push(/🔇/.test(vb.textContent)||vb.getAttribute("aria-pressed")==="false"?X.vOff:X.vOn);
    if(name)bits.push(MW.fill(X.forN,{n:name}));
    sum.querySelector("span").textContent=bits.join(" · ");go.textContent=go.textContent.replace("🔒 ▶ ","🔒 ");
    var lk=MW.pro&&MW.pro.locked?MW.pro.locked(GID):false;nw.hidden=!lk||!demo;real.hidden=true;var stt=$("#status");if(stt)stt.hidden=lk;
    if(demo){if(lk){nw.appendChild(demo);demo.classList.remove("sm");demo.textContent=X.trial}else{links.insertBefore(demo,$("#bWipe"));demo.classList.add("sm");demo.textContent=X.trialS}}}
  refresh();
  new MutationObserver(function(){if(!home.hidden)setTimeout(refresh,0)}).observe(home,{attributes:true,attributeFilter:["hidden"]});
  if(MW.pro&&MW.pro.ready)MW.pro.ready.then(function(){setTimeout(refresh,50)});
  /* briefing: zaakcode-vak naar onderen (hij staat zelf al ingeklapt, zie platform.js) */
  var tip=$("#bfTip"),paper=tip&&tip.closest(".paper");if(tip&&paper)paper.appendChild(tip)}

/* proefronde: na twee stops is het proeven klaar; daarna de Feestpas. Elk spel roept MMTrial.end({buy,home}) aan bij de derde stop. */
window.MMTrial={max:2,end:function(o){var Y={nl:{h:"Dit was de proefronde",t:"Zo werkt het! Jullie hebben twee opdrachten geprobeerd. De hele zaak, met alle opdrachten, het verhaal, de ontknoping en het diploma, speel je met de Feestpas in je eigen buurt.",b:"Koop de Feestpas",c:"Ik heb al een code",h2:"Terug naar het begin"},
    en:{h:"That was the practice round",t:"That's how it works! You tried two tasks. The whole case, with every task, the story, the big reveal and the diploma, you play with the Party Pass in your own neighbourhood.",b:"Get the Party Pass",c:"I have a code",h2:"Back to the start"}}[L];
  try{if(MW.Walk&&MW.Walk.buzz)MW.Walk.buzz([60,40,60])}catch(e){}
  MW.Walk.sheet('<div class="eyebrow">'+X.trialS+'</div><h2>'+Y.h+'</h2><p>'+Y.t+'</p><button type="button" class="btn" id="mmTb">'+Y.b+' · '+MW.cfg.price+'</button><button type="button" class="btn ghost dk" id="mmTc">'+Y.c+'</button><button type="button" class="btn ghost dk" id="mmTh">'+Y.h2+'</button>',true);
  document.getElementById("mmTb").onclick=function(){o.buy()};document.getElementById("mmTc").onclick=function(){o.buy()};document.getElementById("mmTh").onclick=function(){MW.Walk.closeSheet();o.home()}}};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build);else build();
})();
