/* MiniMystery – hub-logica (NL in de root, EN onder /en/). Vereist platform.js en catalog.js. Taal komt uit <html lang>. */
(function(){
"use strict";
var MW=window.MW,C=window.MW_CATALOG,L=MW.lang.page(),t=MW.t(L),esc=MW.esc,$=function(s){return document.querySelector(s)};

/* oude zaak- en groepslinks (#z=…, #g=…) direct naar het juiste spel */
(function(){var h=location.hash;if(!/^#[zg]=/i.test(h))return;var P={AG:"ag",LD:"sj",SJ:"sj",PP:"pp"},m=h.slice(3,5).toUpperCase(),id=P[m];
  if(id){location.replace(MW.gameUrl(id,L)+h)}})();

var H={
  nl:{play:"Speel de echte zaak",resume:"Ga verder",trial:"Feestpas € 9,99",pro:"Feestpas actief",try:"Probeer gratis",tryT:"Proefronde",tryD:"Gratis in de binnenstad van Eindhoven, gewoon vanaf de bank. Zo ziet het groepje hoe het werkt.",free:"Gratis",min:"min",km:"km",best:"Beste",more:"Meer over deze zaak",less:"Minder",
      privH:"Hoe met je gegevens wordt omgegaan",
      privT:"<p><b>De spellen.</b> Alles draait in je browser. Voortgang, Pro-status en taalkeuze staan in de lokale opslag van je browser, op je eigen toestel. Ze verlaten het niet; browsergegevens wissen verwijdert ze. Geen cookies, geen analytics, geen tracking.</p><p><b>Locatie en camera.</b> Je locatie wordt alleen op je toestel gebruikt om plekken om je heen te kiezen; voor de kaart worden alleen plekken in de buurt opgevraagd bij OpenStreetMap-servers, nooit jij als persoon. Foto's van de groep blijven op de telefoon en worden niet opgeslagen of verstuurd; ook het diploma wordt op de telefoon zelf gemaakt.</p><p><b>Betalen.</b> Pro en de groepspas koop je via Ko-fi; daar gelden de voorwaarden van Ko-fi. Je krijgt een code die alleen op je toestel wordt gecontroleerd.</p><p><b>Hosting.</b> De site staat op GitHub Pages; GitHub kan standaard serverlogboeken bijhouden.</p>"},
  en:{play:"Play the real case",resume:"Continue",trial:"Party Pass € 9.99",pro:"Party Pass active",try:"Try it free",tryT:"Practice round",tryD:"Free in the centre of Eindhoven, straight from the sofa. The group sees how it works.",free:"Free",min:"min",km:"km",best:"Best",more:"More about this case",less:"Less",
      privH:"How your data is handled",
      privT:"<p><b>The games.</b> Everything runs in your browser. Progress, Pro status and language live in your browser's local storage, on your own device. They never leave it; clearing browser data removes them. No cookies, no analytics, no tracking.</p><p><b>Location and camera.</b> Your location is used on your device only, to pick places around you; the map asks OpenStreetMap servers for places nearby, never for you as a person. The group's photos stay on the phone and are not stored or sent; the diploma is made on the phone itself too.</p><p><b>Payments.</b> Pro and the group pass are bought through Ko-fi, under Ko-fi's terms. You receive a code that is checked on your device only.</p><p><b>Hosting.</b> The site is served by GitHub Pages, which may keep standard server logs.</p>"}
}[L];

/* ---------- profiel ---------- */
function profile(){$("#status").textContent=""}

/* ---------- inspiratie: de gratis proefrondes ---------- */
function inspo(){var el=$("#inspo");if(!el)return;
  el.innerHTML=C.games.filter(function(g){return g.status!=="soon"}).map(function(g){var x=g[L];
    return '<a class="try" style="--c:'+esc(g.theme||"#f5b800")+'" href="'+MW.root+esc(x.slug)+'?oefen"><img src="'+MW.root+'assets/cover-'+g.id+'.webp" alt="" width="300" height="300" loading="lazy"><span><small>'+H.tryT+'</small><b>'+esc(x.title)+'</b><em>'+esc(x.tag)+'</em><i>'+H.try+' →</i></span></a>'}).join("")}

/* ---------- zaken ---------- */
function resumeKey(g){return "ss_game_"+g.id+"_"+L}
function card(g){var x=g[L],p=MW.profile.get(),st=p.games&&p.games[g.id],has=!!MW.LS.get(resumeKey(g),null),meta=[];
  meta.push("<li>⏱ "+esc(g.minutes)+" "+H.min+"</li><li>👟 "+esc(g.km)+" "+H.km+"</li>");
  meta.push(g.access==="free"?"<li>"+H.free+"</li>":MW.pro.isPro(g.id)?"<li>✓ "+H.pro+"</li>":"<li>🎟 "+H.trial+"</li>");
  return '<article class="case" style="--c:'+esc(g.theme||"#ffc21a")+'"><img class="cov" src="'+MW.root+'assets/cover-'+g.id+'.webp" alt="" width="300" height="300" loading="lazy">'+
    '<h3>'+esc(x.title)+'</h3><p class="tag">'+esc(x.tag)+'</p><ul class="meta">'+meta.join("")+'</ul>'+
    '<button type="button" class="more" aria-expanded="false">'+H.more+'</button><p class="desc" hidden>'+esc(x.desc)+'</p>'+
    /* één lijst: per zaak de gratis proefronde én de echte zaak */
    '<div class="acts"><a class="btn ghost try1" href="'+MW.root+esc(x.slug)+'?oefen">▶ '+H.try+'</a><a class="btn" href="'+MW.root+esc(x.slug)+'">'+(has?H.resume:H.play)+' →</a></div></article>'}
function cases(){var el=$("#cases");el.innerHTML=C.games.filter(function(g){return g.status!=="soon"}).map(card).join("");
  [].forEach.call(el.querySelectorAll(".more"),function(b){b.onclick=function(){var d=b.nextElementSibling,open=d.hidden;d.hidden=!open;b.textContent=open?H.less:H.more;b.setAttribute("aria-expanded",open)}})}

/* ---------- vellen ---------- */
function sheet(html){$("#sheetBody").innerHTML=html;$("#sheet").hidden=false;$("#sheetBody").scrollTop=0}
function closeSheet(){$("#sheet").hidden=true}
$("#sheet").addEventListener("click",function(e){if(e.target.id==="sheet")closeSheet()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeSheet()});
function toast(s){var e=$("#toast");e.textContent=s;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},2800)}
function proSheet(kind){sheet(MW.proHTML(L,kind)+'<button type="button" class="btn ghost dk" id="shX">'+t.cancel+'</button>');
  $("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();refresh();toast(msg)})}
function privacy(){sheet('<div class="eyebrow">Privacy</div><h2>'+H.privH+'</h2>'+H.privT+'<button type="button" class="btn ghost dk" id="shX">'+t.close+'</button>');$("#shX").onclick=closeSheet}

/* ---------- Pro-paneel ---------- */
function proBox(){var b=$("#proBox"),s=$("#proSec");s.hidden=false;
  b.innerHTML=MW.proHTML(L,"pro");
  MW.bindPro(b,L,function(r,msg){refresh();toast(msg)})}

function refresh(){profile();cases();proBox()}

/* ---------- start ---------- */
$("#bPriv").onclick=privacy;
var sw=$("#lang");if(sw)sw.onclick=function(e){e.preventDefault();var to=L==="nl"?"en":"nl";MW.lang.set(to);location.href=MW.hubUrl(to)};
refresh();
MW.pro.ready.then(refresh);
})();
