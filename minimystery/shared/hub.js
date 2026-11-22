/* MiniMystery – hub-logica (NL in de root, EN onder /en/). Vereist platform.js en catalog.js. Taal komt uit <html lang>. */
(function(){
"use strict";
var MW=window.MW,C=window.MW_CATALOG,L=MW.lang.page(),t=MW.t(L),esc=MW.esc,$=function(s){return document.querySelector(s)};

/* oude zaak- en groepslinks (#z=…, #g=…) direct naar het juiste spel */
(function(){var h=location.hash;if(!/^#[zg]=/i.test(h))return;var P={AG:"ag",LD:"sj",SJ:"sj",PP:"pp"},m=h.slice(3,5).toUpperCase(),id=P[m];
  if(id){location.replace(MW.gameUrl(id,L)+h)}})();

var H={
  nl:{play:"Spelen",resume:"Ga verder",trial:"Feestpas € 9,99",pro:"Feestpas actief",try:"Proefronde",more2:"Meer over dit spel",ageA:"{a} jaar",ageF:"vanaf {a} jaar",fAll:"Alles",fLbl:"Hoe wil je spelen?",none:"Geen spel met deze keuze.",
      w:{out:["🚶","Buiten"],in:["👣","Binnen lopen"],sofa:["🛋️","Op de bank"],house:["🏠","Door het huis"],school:["🏫","In het gebouw"],table:["🍰","Aan tafel"]},
      gWalk:"Speurtochten",gWalkS:"Loop van plek naar plek en los het mysterie op. Buiten, binnen of op de bank.",gTable:"Feestspellen aan tafel",gTableS:"Zonder lopen: de telefoon gaat de kring rond.",tryT:"Proefronde",tryD:"Gratis in de binnenstad van Eindhoven, gewoon vanaf de bank. Zo ziet het groepje hoe het werkt.",free:"Gratis",min:"min",km:"km",best:"Beste",more:"Meer over deze zaak",less:"Minder",
      privH:"Hoe met je gegevens wordt omgegaan",
      privT:"<p><b>De spellen.</b> Alles draait in je browser. Voortgang, Pro-status en taalkeuze staan in de lokale opslag van je browser, op je eigen toestel. Ze verlaten het niet; browsergegevens wissen verwijdert ze. Geen cookies, geen analytics, geen tracking.</p><p><b>Locatie en camera.</b> Je locatie wordt alleen op je toestel gebruikt om plekken om je heen te kiezen; voor de kaart worden alleen plekken in de buurt opgevraagd bij kaartdiensten met OpenStreetMap-gegevens (OpenFreeMap, en Overpass als reserve), nooit jij als persoon. Foto's van de groep blijven op de telefoon en worden niet opgeslagen of verstuurd; ook het diploma wordt op de telefoon zelf gemaakt.</p><p><b>Betalen.</b> Pro en de groepspas koop je via Ko-fi; daar gelden de voorwaarden van Ko-fi. Je krijgt een code die alleen op je toestel wordt gecontroleerd.</p><p><b>Hosting.</b> De site staat op GitHub Pages; GitHub kan standaard serverlogboeken bijhouden.</p>"},
  en:{play:"Play",resume:"Continue",trial:"Party Pass € 9.99",pro:"Party Pass active",try:"Practice round",more2:"More about this game",ageA:"ages {a}",ageF:"ages {a}",fAll:"All",fLbl:"How do you want to play?",none:"No game for this choice.",
      w:{out:["🚶","Outdoors"],in:["👣","Indoor walking"],sofa:["🛋️","On the sofa"],house:["🏠","Around the house"],school:["🏫","In the building"],table:["🍰","Round the table"]},
      gWalk:"Treasure hunts",gWalkS:"Walk from place to place and solve the mystery. Outdoors, indoors or on the sofa.",gTable:"Party games round the table",gTableS:"No walking: the phone goes round the circle.",tryT:"Practice round",tryD:"Free in the centre of Eindhoven, straight from the sofa. The group sees how it works.",free:"Free",min:"min",km:"km",best:"Best",more:"More about this case",less:"Less",
      privH:"How your data is handled",
      privT:"<p><b>The games.</b> Everything runs in your browser. Progress, Pro status and language live in your browser's local storage, on your own device. They never leave it; clearing browser data removes them. No cookies, no analytics, no tracking.</p><p><b>Location and camera.</b> Your location is used on your device only, to pick places around you; the map asks map services with OpenStreetMap data (OpenFreeMap, with Overpass as a backup) for places nearby, never for you as a person. The group's photos stay on the phone and are not stored or sent; the diploma is made on the phone itself too.</p><p><b>Payments.</b> Pro and the group pass are bought through Ko-fi, under Ko-fi's terms. You receive a code that is checked on your device only.</p><p><b>Hosting.</b> The site is served by GitHub Pages, which may keep standard server logs.</p>"}
}[L];

/* ---------- profiel ---------- */
function profile(){$("#status").textContent=""}

/* ---------- inspiratie: de gratis proefrondes ---------- */
function inspo(){var el=$("#inspo");if(!el)return;
  el.innerHTML=C.games.filter(function(g){return g.status!=="soon"&&g.line!=="educatie"}).map(function(g){var x=g[L];
    return '<a class="try" style="--c:'+esc(g.theme||"#f5b800")+'" href="'+MW.root+esc(x.slug)+'?oefen"><img src="'+MW.root+'assets/cover-'+g.id+'.webp" alt="" width="300" height="300" loading="lazy"><span><small>'+H.tryT+'</small><b>'+esc(x.title)+'</b><em>'+esc(x.tag)+'</em><i>'+H.try+' →</i></span></a>'}).join("")}

/* ---------- zaken ---------- */
function resumeKey(g){return "ss_game_"+g.id+"_"+L}
/* compacte kaart: plaatje, titel, één zin, leeftijd/duur, hoe je het speelt, twee knoppen. De lange tekst zit achter "Meer". */
function ageTxt(a){a=String(a||"");return a?MW.fill(/\+$/.test(a)?H.ageF:H.ageA,{a:L==="nl"?a.replace("+",""):a}):""}
function waysHTML(g){return '<ul class="gw">'+(g.ways||[]).map(function(w){var x=H.w[w];return x?'<li><i aria-hidden="true">'+x[0]+'</i>'+esc(x[1])+'</li>':''}).join("")+'</ul>'}
function card(g){var x=g[L],has=!!MW.LS.get(resumeKey(g),null),url=MW.root+esc(x.slug),pro=g.access!=="free"&&MW.pro.isPro(g.id);
  return '<article class="g" data-ways="'+esc((g.ways||[]).join(" "))+'" style="--c:'+esc(g.theme||"#ffc21a")+'">'+
    '<a class="gimg" href="'+url+'" tabindex="-1" aria-hidden="true"><img src="'+MW.root+'assets/cover-'+g.id+'.webp" alt="" width="300" height="300" loading="lazy">'+(g.badge?'<b class="rib">'+esc(g.badge[L])+'</b>':'')+'</a>'+
    '<div class="gb"><h3><a href="'+url+'">'+esc(x.title)+'</a></h3><p class="gs">'+esc(x.short||x.tag)+'</p>'+
    '<ul class="gm">'+'<li>⏱ '+esc(g.minutes)+' '+H.min+'</li>'+(pro?'<li class="ok">✓ '+H.pro+'</li>':'')+'</ul>'+waysHTML(g)+'</div>'+
    '<div class="ga"><a class="btn sm ghost" href="'+url+'?oefen">▶ '+H.try+'</a><a class="btn sm" href="'+url+'">'+(has?H.resume:H.play)+' →</a></div>'+
    '<details class="gd"><summary>'+H.more2+'</summary><p>'+esc(x.desc)+'</p></details></article>'}
function group(h,sub,list){return list.length?'<div class="grp"><h3 class="grph">'+esc(h)+'</h3><p class="grps">'+esc(sub)+'</p><div class="gl">'+list.map(card).join("")+'</div></div>':''}
var FILTER="";
function cases(){var el=$("#cases"),live=C.games.filter(function(g){return g.status!=="soon"&&g.line!=="educatie"});
  var walks=live.filter(function(g){return g.kind!=="table"}),tables=live.filter(function(g){return g.kind==="table"});
  var fs=["out","in","sofa","table"];
  el.innerHTML='<div class="flt" role="group" aria-label="'+esc(H.fLbl)+'"><span>'+esc(H.fLbl)+'</span><button type="button" data-f="" aria-pressed="true">'+H.fAll+'</button>'+fs.map(function(f){return '<button type="button" data-f="'+f+'" aria-pressed="false">'+H.w[f][0]+' '+esc(H.w[f][1])+'</button>'}).join("")+'</div>'+
    group(H.gWalk,H.gWalkS,walks)+group(H.gTable,H.gTableS,tables)+'<p class="note" id="noGame" hidden>'+H.none+'</p>';
  var apply=function(){var any=false;[].forEach.call(el.querySelectorAll(".flt button"),function(b){b.setAttribute("aria-pressed",b.dataset.f===FILTER?"true":"false")});
    [].forEach.call(el.querySelectorAll(".grp"),function(gr){var n=0;[].forEach.call(gr.querySelectorAll(".g"),function(c){var ok=!FILTER||(" "+c.dataset.ways+" ").indexOf(" "+FILTER+" ")>=0;c.hidden=!ok;if(ok)n++});gr.hidden=!n;if(n)any=true});$("#noGame").hidden=any};
  el.querySelector(".flt").onclick=function(e){var b=e.target.closest("button");if(!b)return;FILTER=b.dataset.f;apply()};apply();eduStrip()}
/* MiniMystery Educatie is een eigen afdeling (educatie/ en en/education/): op de feest-hub één blok met de plaatjes van de wandelingen */
function eduStrip(){var el=$("#eduStrip");if(!el)return;var base=MW.root+(L==="nl"?"educatie/":"en/education/");
  el.innerHTML=C.games.filter(function(g){return g.line==="educatie"&&g.status!=="soon"}).map(function(g){return '<a href="'+base+'#'+g.id+'"><img src="'+MW.root+'assets/cover-'+g.id+'.webp" alt="" width="300" height="300" loading="lazy"><span>'+esc((g.subj||{})[L]||g[L].title)+'</span></a>'}).join("")}

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
var CF={nl:{btn:"✨ Op maat",card:"Jullie eigen versie",cardT:"Elke zaak met foto's van de kinderen, hun namen en een thema: € 29,95 inclusief Feestpas. Iets helemaal nieuws? Vraag het aan.",cardB:"Vraag aan",cardM:"Meer weten",h:"Jullie eigen versie",lead:"Personaliseren met foto's, namen en een thema kost € 29,95 inclusief Feestpas; verhaal en puzzels blijven hetzelfde. Iets helemaal nieuws, zoals een eigen route of verhaal, vraag je hier ook aan; de prijs bepalen we samen. Het formulier opent je mailprogramma met alles al ingevuld; foto's voeg je daarna als bijlage toe.",
    name:"Je naam",email:"Je e-mailadres",kids:"Aantal kinderen",age:"Leeftijd",where:"Waar (adres of buurt)",when:"Wanneer (datum, of ongeveer)",kind:"Wat voor feest?",kinds:["Kinderfeestje","Schoolkamp of klas","Buurt- of straatfeest","Bedrijfs- of familie-uitje","Iets anders"],
    wish:"Jullie wensen",wishP:"Bijvoorbeeld: De Lichtjesdief personaliseren, de jarige heet Noor, thema verjaardag, foto's komen als bijlage…",send:"✉️ Open de mail en verstuur",copy:"Lukt het mailen niet? Kopieer de tekst",copied:"Gekopieerd. Plak hem in een mail aan kellievandekerkhof@gmail.com.",need:"Vul in elk geval je naam en wat je wilt in.",
    subj:"Speurtocht op maat via MiniMystery",hi:"Hoi Kellie,",intro:"Ik zoek een speurtocht op maat.",bye:"Groet,"},
  en:{btn:"✨ Made to measure",card:"Your own version",cardT:"Any case with photos of the children, their names and a theme: € 29.95 incl. Party Pass. Something entirely new? Ask for it.",cardB:"Ask for one",cardM:"Find out more",h:"Your own version",lead:"Personalising with photos, names and a theme costs € 29.95 incl. Party Pass; story and puzzles stay the same. Something entirely new, like a route or story of your own, you can ask for here too; we'll agree the price together. The form opens your mail app with everything filled in; attach the photos afterwards.",
    name:"Your name",email:"Your email address",kids:"Number of children",age:"Age",where:"Where (address or neighbourhood)",when:"When (date, or roughly)",kind:"What kind of party?",kinds:["Kids' party","School trip or class","Street or neighbourhood party","Company or family outing","Something else"],
    wish:"Your wishes",wishP:"For example: personalise The Light Thief, the birthday girl is called Noor, birthday theme, photos attached…",send:"✉️ Open the email and send",copy:"Email not working? Copy the text",copied:"Copied. Paste it into an email to kellievandekerkhof@gmail.com.",need:"At least fill in your name and what you want.",
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
