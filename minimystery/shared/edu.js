/* MiniMystery Educatie – afdelingspagina. Tekent de pagina uit shared/catalog.js: elk spel met line:"educatie" wordt een kaart.
   Nieuwe wandeling = één object in de catalogus (subj, grp, short, ways, cover in assets/cover-<id>.webp); hier hoeft niets bij.
   status:"soon" geeft een grijze kaart "Binnenkort". Laden: <script src="…/shared/edu.js" data-root="../"></script> na catalog.js. */
(function(){
"use strict";
var me=document.currentScript,ROOT=(me&&me.dataset.root)||"../",L=(document.documentElement.lang||"nl").slice(0,2)==="en"?"en":"nl";
var KOFI="https://ko-fi.com/s/76c337bb9e",MAIL="kellievandekerkhof@gmail.com";
var C=window.MW_CATALOG,G=C.games.filter(function(g){return g.line==="educatie"});
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var T={
 nl:{back:"◂ MiniMystery",other:"English",otherU:ROOT+"en/education/",kick:"MiniMystery Educatie · school en BSO",h1:"Speurtochten met lesstof",
  lead:"Teams lossen een mysterie op en oefenen onderweg rekenen, taal, natuur, geschiedenis of Engels.",
  facts:["🏫 Groep 3–8 en BSO","⏱ 35–60 minuten","🎟 Proefronde gratis"],cta:"Bekijk de wandelingen ↓",buy:"Schoolpas € 39,99",free:"proefronde gratis",
  howK:"In drie stappen",howH:"Zo werkt het",
  how:[["1","Start op jouw telefoon","Kies groep en lengte. Je krijgt een zaakcode en een begeleidersblad met lesbrief."],["2","Teams spelen","4 tot 6 kinderen, één telefoon. Zaakcode invullen en op pad."],["3","Diploma en nabespreking","Elk team krijgt een diploma. De lesbrief helpt bij het nabespreken."]],
  wayK:"Bij elk weer",wayH:"Vier manieren om te spelen",waySub:"Je kiest bij de start. Elke wandeling kan op al deze manieren.",
  ways:{out:["🚶","Buiten","Rond de school, alles binnen ongeveer 300 meter."],school:["🏫","In het gebouw","Met plekkaartjes in de gangen en lokalen."],"in":["👣","Binnen, op de plaats","In de klas of gymzaal: de telefoon telt de stappen."],sofa:["🛋️","Zonder lopen","Tik op de kaart. Handig bij regen of op het digibord."]},
  listK:"Per vak",listH:"De wandelingen",listSub:"Tik op een wandeling voor meer informatie.",all:"Alles",
  min:"min",more:"Meer info →",soon:"Binnenkort",isNew:"Nieuw",start:"Start →",trial:"▶ Proefronde",close:"Sluiten",full:"Alles over deze wandeling",
  askH:"Mis je een vak?",askT:"Er komen meer wandelingen aan. Laat weten wat je zoekt.",askS:"Wens voor MiniMystery Educatie",
  passK:"Eén prijs voor de hele school",passH:"De Schoolpas",price:"€ 39,99",per:"· zes maanden",
  pass:["Alle wandelingen, ook de nieuwe die erbij komen","Zo vaak je wilt, met al je klassen","Proefronde in elke wandeling blijft gratis"],buyB:"Koop de Schoolpas · € 39,99",
  legal:"Digitale inhoud, direct geleverd na betaling. Door te kopen ga je akkoord met directe levering en zie je af van je herroepingsrecht: de aankoop is definitief, geld terug is niet mogelijk. Vul de code in op elk apparaat waarmee een team speelt.",
  faqH:"Veelgestelde vragen",
  faq:[["Wat heb ik nodig?","Per team één telefoon met internet. Geen app, geen account. Voor buiten met kaart: locatie aan."],["Hoeveel voorbereiding kost het?","Een minuut: wandeling starten en de zaakcode doorgeven. Het begeleidersblad heeft het verhaal, alle antwoorden en hints."],["Moeten de kinderen ver lopen?","Nee. Buiten ligt alles binnen ongeveer 300 meter. Binnen kan ook: in het gebouw, op de plaats of helemaal zonder lopen."],["Waar blijven de foto's?","Op het apparaat van het team. Er wordt niets geüpload."],["Kan ik een eigen thema krijgen?","Ja. Kijk bij <a href=\""+ROOT+"speurtocht-op-maat.html\">speurtocht op maat</a>."]],
  foot:"MiniMystery Educatie is onderdeel van <a href=\""+ROOT+"\">MiniMystery</a>."},
 en:{back:"◂ MiniMystery",other:"Nederlands",otherU:ROOT+"educatie/",kick:"MiniMystery Education · schools and clubs",h1:"Treasure hunts with real lessons",
  lead:"Teams solve a mystery and practise maths, literacy, nature or history along the way.",
  facts:["🏫 Ages 6–12","⏱ 35–60 minutes","🎟 Practice round free"],cta:"See the walks ↓",buy:"School Pass € 39.99",free:"practice round free",
  howK:"In three steps",howH:"How it works",
  how:[["1","Start on your phone","Pick the age and length. You get a case code and a leader's sheet with a lesson plan."],["2","Teams play","4 to 6 children, one phone. Enter the case code and off you go."],["3","Certificate and review","Every team gets a certificate. The lesson plan helps with the review."]],
  wayK:"Whatever the weather",wayH:"Four ways to play",waySub:"You choose at the start. Every walk works in all of these ways.",
  ways:{out:["🚶","Outdoors","Around the school, all within about 300 metres."],school:["🏫","In the building","With spot cards in corridors and classrooms."],"in":["👣","Indoors, on the spot","In the classroom or gym: the phone counts the steps."],sofa:["🛋️","No walking","Tap the map. Handy in the rain or on the whiteboard."]},
  listK:"By subject",listH:"The walks",listSub:"Tap a walk for more information.",all:"All",
  min:"min",more:"More info →",soon:"Coming soon",isNew:"New",start:"Start →",trial:"▶ Practice round",close:"Close",full:"Everything about this walk",
  askH:"Missing a subject?",askT:"More walks are on the way. Tell us what you're looking for.",askS:"Request for MiniMystery Education",
  passK:"One price for the whole school",passH:"The School Pass",price:"€ 39.99",per:"· six months",
  pass:["Every walk, including new ones as they arrive","As often as you like, with all your classes","The practice round in every walk stays free"],buyB:"Buy the School Pass · € 39.99",
  legal:"Digital content, delivered immediately after payment. By buying you agree to immediate delivery and waive your right of withdrawal: the purchase is final and cannot be refunded. Enter the code on every device a team plays on.",
  faqH:"Frequently asked questions",
  faq:[["What do I need?","One phone with internet per team. No app, no account. Outdoors with the map: location on."],["How much preparation is there?","A minute: start the walk and pass on the case code. The leader's sheet has the story, every answer and hints."],["Do the children have to walk far?","No. Outdoors everything is within about 300 metres. Indoors works too: in the building, on the spot or with no walking at all."],["Where do the photos go?","They stay on the team's device. Nothing is uploaded."],["Can I have my own theme?","Yes, made to measure is possible: <a href=\"mailto:"+MAIL+"\">get in touch</a>."]],
  foot:"MiniMystery Education is part of <a href=\""+ROOT+"en/\">MiniMystery</a>."}}[L];
function cover(g){return ROOT+"assets/cover-"+g.id+".webp"}
function url(g){return ROOT+g[L].slug}
function subj(g){return (g.subj||{})[L]||""}
function rows(list,cls){return '<ul class="rows '+cls+'">'+list.map(function(r){return '<li><i aria-hidden="true">'+r[0]+'</i><b>'+esc(r[1])+'</b><span>'+esc(r[2])+'</span></li>'}).join("")+'</ul>'}
function walk(g){var x=g[L],soon=g.status==="soon";
  return '<'+(soon?'div':'button type="button"')+' class="w'+(soon?' soon':'')+'" id="'+g.id+'" data-id="'+g.id+'" data-subj="'+esc(subj(g))+'" style="--c:'+esc(g.theme||"#d9c7f0")+'">'+
    '<span class="wi"><img src="'+cover(g)+'" alt="" width="300" height="300" loading="lazy"><b>'+esc(subj(g))+'</b>'+(soon?'<em>'+T.soon+'</em>':g.isNew?'<em>'+T.isNew+'</em>':'')+'</span>'+
    '<span class="wb"><h3>'+esc(x.title)+'</h3><p>'+esc(x.short||x.tag)+'</p><small>'+esc((g.grp||{})[L]||"")+' · '+esc(g.minutes)+' '+T.min+'</small>'+(soon?'':'<u>'+T.more+'</u>')+'</span></'+(soon?'div':'button')+'>'}
var subs=[];G.forEach(function(g){var s=subj(g);if(s&&subs.indexOf(s)<0)subs.push(s)});
var live=G.filter(function(g){return g.status!=="soon"}),fan=live.slice(0,6);
document.querySelector("main").innerHTML=
  '<div class="top"><a class="pill" href="'+(L==="nl"?ROOT:ROOT+"en/")+'">'+T.back+'</a><a class="pill" href="'+T.otherU+'">'+T.other+'</a></div>'+
  '<section class="hero"><div><span class="kick">'+T.kick+'</span><h1>'+T.h1+'</h1><p>'+T.lead+'</p><a class="plink" href="#prijs">🎟 '+T.buy+' · '+T.free+' →</a></div>'+
    '<div class="fan" aria-hidden="true">'+fan.map(function(g){return '<img src="'+cover(g)+'" alt="" width="300" height="300">'}).join("")+'</div></section>'+
  '<section class="sec first" id="wandelingen"><h2>'+T.listH+'</h2>'+
    '<div class="flt" role="group"><button type="button" data-f="" aria-pressed="true">'+T.all+'</button>'+subs.map(function(s){return '<button type="button" data-f="'+esc(s)+'" aria-pressed="false">'+esc(s)+'</button>'}).join("")+'</div>'+
    '<div class="walks">'+G.map(walk).join("")+'<a class="w ask" href="mailto:'+MAIL+'?subject='+encodeURIComponent(T.askS)+'"><i aria-hidden="true">💡</i><b>'+T.askH+'</b><span>'+T.askT+'</span></a></div></section>'+
  '<section class="sec" id="hoe"><span class="kick">'+T.howK+'</span><h2>'+T.howH+'</h2>'+rows(T.how,"c3")+'</section>'+
  '<section class="sec"><span class="kick">'+T.wayK+'</span><h2>'+T.wayH+'</h2><p class="sub">'+T.waySub+'</p>'+rows(["out","school","in","sofa"].map(function(k){return T.ways[k]}),"c4")+'</section>'+
  '<section class="sec" id="prijs"><span class="kick">'+T.passK+'</span><h2>'+T.passH+'</h2><div class="pass"><p class="price">'+T.price+' <span>'+T.per+'</span></p><ul>'+T.pass.map(function(p){return '<li>'+p+'</li>'}).join("")+'</ul>'+
    '<a class="btn" id="eduBuy" href="'+KOFI+'" target="_blank" rel="noopener">'+T.buyB+'</a><small>'+T.legal+'</small></div></section>'+
  '<section class="sec faq"><h2>'+T.faqH+'</h2>'+T.faq.map(function(f){return '<details><summary>'+f[0]+'</summary><p>'+f[1]+'</p></details>'}).join("")+'</section>'+
  '<footer>'+T.foot+'</footer><dialog class="dl" id="dl"></dialog>';
/* filter per vak */
var flt=document.querySelector(".flt");
flt.onclick=function(e){var b=e.target.closest("button");if(!b)return;var f=b.dataset.f;
  [].forEach.call(flt.querySelectorAll("button"),function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});
  [].forEach.call(document.querySelectorAll(".walks .w[data-id]"),function(w){w.hidden=!!f&&w.dataset.subj!==f})};
/* kaart open: plaatje, één zin, hoe je speelt, twee knoppen; de lange tekst ingeklapt */
var dl=document.getElementById("dl");
function open(g){var x=g[L];
  dl.innerHTML='<div class="dlh"><img src="'+cover(g)+'" alt="" width="300" height="300"><div><span class="kick">'+esc(subj(g))+'</span><h2>'+esc(x.title)+'</h2><small>'+esc((g.grp||{})[L]||"")+' · '+esc(g.minutes)+' '+T.min+'</small></div></div>'+
    '<div class="dlb"><p>'+esc(x.short||x.tag)+'</p><ul class="chips">'+(g.ways||[]).map(function(w){var y=T.ways[w];return y?'<li>'+y[0]+' '+esc(y[1])+'</li>':''}).join("")+'</ul>'+
    '<details><summary>'+T.full+'</summary><p>'+esc(x.desc)+'</p></details>'+
    '<div class="btns"><a class="btn ghost" href="'+url(g)+'?oefen">'+T.trial+'</a><a class="btn" href="'+url(g)+'">'+T.start+'</a></div><button type="button" class="dlx">'+T.close+'</button></div>';
  dl.querySelector(".dlx").onclick=function(){dl.close()};
  if(dl.showModal)dl.showModal();else location.href=url(g)}
dl.addEventListener("click",function(e){if(e.target===dl)dl.close()});
document.querySelector(".walks").addEventListener("click",function(e){var w=e.target.closest("button.w[data-id]");if(!w)return;var g=G.filter(function(x){return x.id===w.dataset.id})[0];if(g)open(g)});
/* link vanaf de hoofdpagina (#tr, #rk…): scroll naar de kaart */
if(location.hash.length===3){var t=document.getElementById(location.hash.slice(1));if(t&&t.classList.contains("w"))setTimeout(function(){t.scrollIntoView({block:"center"})},60)}
})();
