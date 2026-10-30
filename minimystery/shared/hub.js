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


/* ---------- speurtocht op maat: formulier → mail ---------- */
var CF={nl:{btn:"✉️ Op maat",h:"Speurtocht op maat",lead:"Vertel wat je in gedachten hebt. Het formulier opent je mailprogramma met alles al ingevuld; verstuur de mail en je hoort snel wat er kan. Prijs in overleg.",
    name:"Je naam",email:"Je e-mailadres",kids:"Aantal kinderen",age:"Leeftijd",where:"Waar (adres of buurt)",when:"Wanneer (datum, of ongeveer)",kind:"Wat voor feest?",kinds:["Kinderfeestje","Schoolkamp of klas","Buurt- of straatfeest","Bedrijfs- of familie-uitje","Iets anders"],
    wish:"Jullie wensen",wishP:"Bijvoorbeeld: een piratenthema, de namen van de kinderen in het verhaal, start bij ons huis, eindigen bij de speeltuin…",send:"✉️ Open de mail en verstuur",copy:"Lukt het mailen niet? Kopieer de tekst",copied:"Gekopieerd. Plak hem in een mail aan kellievandekerkhof@gmail.com.",need:"Vul in elk geval je naam en wat je wilt in.",
    subj:"Speurtocht op maat via MiniMystery",hi:"Hoi Kellie,",intro:"Ik zoek een speurtocht op maat.",bye:"Groet,"},
  en:{btn:"✉️ Custom",h:"A custom treasure hunt",lead:"Tell me what you have in mind. The form opens your mail app with everything filled in; send the email and you'll hear quickly what's possible. Price on request.",
    name:"Your name",email:"Your email address",kids:"Number of children",age:"Age",where:"Where (address or neighbourhood)",when:"When (date, or roughly)",kind:"What kind of party?",kinds:["Kids' party","School trip or class","Street or neighbourhood party","Company or family outing","Something else"],
    wish:"Your wishes",wishP:"For example: a pirate theme, the children's names in the story, start at our house, finish at the playground…",send:"✉️ Open the email and send",copy:"Email not working? Copy the text",copied:"Copied. Paste it into an email to kellievandekerkhof@gmail.com.",need:"At least fill in your name and what you want.",
    subj:"Custom treasure hunt via MiniMystery",hi:"Hi Kellie,",intro:"I'm looking for a custom treasure hunt.",bye:"Kind regards,"}}[L];
var MAIL="kellievandekerkhof@gmail.com",CFK="ss_mm_custom";
function customForm(){var v=MW.LS.get(CFK,{});var f=function(id,lab,ph,type){return '<label class="cf"><span>'+lab+'</span><input type="'+(type||"text")+'" id="'+id+'" autocomplete="'+(id==="cfN"?"name":id==="cfE"?"email":"off")+'" value="'+esc(v[id]||"")+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></label>'};
  sheet('<div class="eyebrow">MiniMystery</div><h2>'+CF.h+'</h2><p class="sub cfl">'+CF.lead+'</p><form id="cfF" novalidate>'+f("cfN",CF.name)+f("cfE",CF.email,"",'email')+'<div class="cf2">'+f("cfK",CF.kids,"8",'number')+f("cfA",CF.age,"6–12")+'</div>'+f("cfW",CF.where)+f("cfD",CF.when)+
    '<label class="cf"><span>'+CF.kind+'</span><select id="cfT">'+CF.kinds.map(function(k){return '<option'+(v.cfT===k?' selected':'')+'>'+esc(k)+'</option>'}).join("")+'</select></label>'+
    '<label class="cf"><span>'+CF.wish+'</span><textarea id="cfX" rows="4" placeholder="'+esc(CF.wishP)+'">'+esc(v.cfX||"")+'</textarea></label>'+
    '<p class="note err" id="cfM"></p><button type="submit" class="btn">'+CF.send+'</button><button type="button" class="btn ghost dk" id="cfC">'+CF.copy+'</button><button type="button" class="btn ghost dk" id="shX">'+t.close+'</button></form>');
  $("#shX").onclick=closeSheet;
  var read=function(){var o={};["cfN","cfE","cfK","cfA","cfW","cfD","cfT","cfX"].forEach(function(id){o[id]=($("#"+id).value||"").trim()});MW.LS.set(CFK,o);return o};
  var body=function(o){return CF.hi+"\n\n"+CF.intro+"\n\n"+CF.kind+": "+o.cfT+"\n"+CF.kids+": "+o.cfK+"\n"+CF.age+": "+o.cfA+"\n"+CF.where+": "+o.cfW+"\n"+CF.when+": "+o.cfD+"\n\n"+CF.wish+":\n"+o.cfX+"\n\n"+CF.bye+"\n"+o.cfN+(o.cfE?"\n"+o.cfE:"")+"\n"};
  var ok=function(o){if(!o.cfN||!o.cfX){$("#cfM").textContent=CF.need;return false}$("#cfM").textContent="";return true};
  $("#cfF").onsubmit=function(e){e.preventDefault();var o=read();if(!ok(o))return;location.href="mailto:"+MAIL+"?subject="+encodeURIComponent(CF.subj)+"&body="+encodeURIComponent(body(o))};
  $("#cfC").onclick=function(){var o=read();if(!ok(o))return;var txt=CF.subj+"\n\n"+body(o);try{navigator.clipboard.writeText(txt).then(function(){toast(CF.copied)},function(){prompt(MAIL,txt)})}catch(err){prompt(MAIL,txt)}}}
function customBtn(){var top=document.querySelector(".hero .top");if(top&&!$("#bCustom")){var b=document.createElement("button");b.type="button";b.className="pill custom-pill";b.id="bCustom";b.textContent=CF.btn;top.insertBefore(b,top.firstChild);b.onclick=customForm}
  var a=document.querySelector("#custom a.btn");if(a){a.removeAttribute("href");a.setAttribute("role","button");a.onclick=function(e){e.preventDefault();customForm()}}}

/* ---------- Pro-paneel ---------- */
function proBox(){var b=$("#proBox"),s=$("#proSec");s.hidden=false;
  b.innerHTML=MW.proHTML(L,"pro");
  MW.bindPro(b,L,function(r,msg){refresh();toast(msg)})}

function refresh(){profile();cases();proBox()}

/* ---------- start ---------- */
$("#bPriv").onclick=privacy;customBtn();
var sw=$("#lang");if(sw)sw.onclick=function(e){e.preventDefault();var to=L==="nl"?"en":"nl";MW.lang.set(to);location.href=MW.hubUrl(to)};
refresh();
MW.pro.ready.then(refresh);
})();
