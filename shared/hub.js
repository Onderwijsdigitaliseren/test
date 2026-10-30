/* Hub-logica (EN + NL). Vereist platform.js en catalog.js. Taal komt uit <html lang>. */
(function(){
"use strict";
var MW=window.MW,C=window.MW_CATALOG,L=MW.lang.page(),t=MW.t(L),esc=MW.esc,$=function(s){return document.querySelector(s)};
var H={
  nl:{choose:"Kies je wandeling",play:"Speel",resume:"Ga verder",soon:"Binnenkort",neu:"Nieuw",trial:"Proefronde gratis",pro:"Pro",free:"Gratis",min:"min",km:"km",grp:"Groepszaak",best:"Beste",
      typed:["Acht sporen op echte plekken om je heen.","Eén ticket per team, start wanneer jij wilt.","Samen puzzelen. Verdachten uitsluiten. De dader aanwijzen."],privacy:"Privacy",privH:"Hoe met je gegevens wordt omgegaan",
      privT:"<p><b>De spellen.</b> Alles draait in je browser. Je voortgang, rang, tickets en taalkeuze staan in de lokale opslag van je browser, op je eigen toestel. Ze verlaten het niet; browsergegevens wissen verwijdert ze. Geen cookies, geen analytics, geen tracking.</p><p><b>Locatie en camera.</b> Je locatie wordt alleen op je toestel gebruikt om sporen om je heen te leggen; voor de kaart worden alleen plekken in je buurt (zonder jouw positie als persoon) opgevraagd bij OpenStreetMap-servers. Camerabeeld blijft op je telefoon en wordt niet opgeslagen of verstuurd.</p><p><b>Betalen.</b> Een teamticket koop je via Ko-fi; daar gelden de voorwaarden van Ko-fi. Je krijgt een code, die alleen op je toestel wordt gecontroleerd. Eerder gekochte Pro- en groepscodes blijven werken.</p><p><b>Hosting.</b> De site staat op GitHub Pages; GitHub kan standaard serverlogboeken bijhouden.</p>",
      contact:"Een vraag of een idee? ",other:"Liever binnen blijven? Speel de bureauzaken op "},
  en:{choose:"Choose your walk",play:"Play",resume:"Continue",soon:"Coming soon",neu:"New",trial:"Free practice round",pro:"Pro",free:"Free",min:"min",km:"km",grp:"Group mode",best:"Best",
      typed:["Eight leads at real places around you.","One ticket per team, start whenever you like.","Puzzle together. Rule out suspects. Name the killer."],privacy:"Privacy",privH:"How your data is handled",
      privT:"<p><b>The games.</b> Everything runs in your browser. Your progress, rank, tickets and language live in your browser's local storage, on your own device. They never leave it; clearing browser data removes them. No cookies, no analytics, no tracking.</p><p><b>Location and camera.</b> Your location is used on your device only, to place leads around you; the map asks OpenStreetMap servers for places near you (never for you as a person). Camera images stay on your phone and are not stored or sent.</p><p><b>Payments.</b> Team tickets are bought through Ko-fi, under Ko-fi's terms. You receive a code that is checked on your device only. Pro and group codes bought earlier keep working.</p><p><b>Hosting.</b> The site is served by GitHub Pages, which may keep standard server logs.</p>",
      contact:"A question or an idea? ",other:"Rather stay indoors? Play the desk cases at "}
}[L];

/* ---------- profiel ---------- */
function profile(){var p=MW.profile.get(),i=MW.profile.rank(p.xp),nx=MW.profile.next(p.xp),R=MW.profile.RANKS.nl[i][0];
  $("#pRank").textContent=MW.profile.rankName(p.xp,L);$("#pStreak").textContent=p.streak||0;$("#pSolved").textContent=p.solved||0;
  $("#pXp").style.width=(nx?Math.round((p.xp-R)/(nx[0]-R)*100):100)+"%";
  $("#pNext").textContent=nx?MW.fill(t.pts,{x:p.xp,n:nx[0]-p.xp,r:MW.profile.RANKS[L][i+1][1]}):MW.fill(t.ptsTop,{x:p.xp});
  $("#status").textContent=MW.statusText(L);var pro=MW.pro.isPro();$("#bPro").hidden=pro;$("#bPro").textContent=t.tHave;if(pro){$("#proBox").hidden=true}}
function access(g){if(g.access==="free")return"<i>"+H.free+"</i>";if(MW.pro.has(g.id))return'<i class="pro">'+t.tAct+'</i>';return"<i>"+H.trial+"</i><i>"+esc(MW.cfg.team.price)+" "+t.tPer+"</i>"}

/* ---------- catalogus ---------- */
var ICON={
  missing:'<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="32" cy="20" r="10" stroke-dasharray="4 4"/><path d="M12 56c2-14 9-20 20-20s18 6 20 20" stroke-dasharray="5 4"/><path d="M44 10l6-6M50 4v6M50 4h-6" opacity=".7"/></svg>',
  kids:'<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="36" cy="38" rx="16" ry="12"/><circle cx="26" cy="24" r="9"/><path d="M17 25l-9 2 9 2"/><circle cx="28" cy="22" r="1.6" fill="currentColor"/><path d="M50 34l10-6-4 10M30 50l-2 7M40 50l2 7"/><path d="M8 50l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L3 53.5l3.5-.5z" opacity=".6"/></svg>',
  cold:'<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M8 18h18l5 6h25v28H8z"/><path d="M8 30h48" opacity=".6"/><path d="M20 40h24M20 46h16" opacity=".6"/></svg>',
  night:'<svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M40 8a22 22 0 1 0 16 36A18 18 0 0 1 40 8z"/><path d="M14 12l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM52 50l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor" stroke="none"/></svg>'};

function resumeKey(g){return g.id==="mw"?(L==="nl"?"ss_game":"ss_game_en"):"ss_game_"+g.id+"_"+L}
function card(g){var x=g[L],p=MW.profile.get(),st=p.games&&p.games[g.id],soon=g.status==="soon",has=!soon&&!!MW.LS.get(resumeKey(g),null);
  var meta=[];if(g.status==="new")meta.push('<i class="new">'+H.neu+'</i>');if(soon)meta.push("<i>"+H.soon+"</i>");
  meta.push("<i>"+esc(g.minutes)+" "+H.min+"</i><i>"+esc(g.km)+" "+H.km+"</i>");
  meta.push(access(g));
  if(g.group)meta.push("<i>"+H.grp+"</i>");
  if(st&&st.best)meta.push('<i class="star">'+H.best+" "+"★".repeat(st.best)+"☆".repeat(3-st.best)+"</i>");
  var COV={mw:1,td:1,vz:1,og:1,cc:1,lb:1,ng:1,fj:1,ag:1,sj:1,pp:1};
  var cover=COV[g.id]?'<img class="cover" src="'+MW.root+'assets/cover-'+g.id+'.webp?v=2" alt="" width="400" height="400" loading="lazy">':'<div class="cover ico-'+g.cat+'" aria-hidden="true">'+(ICON[g.cat]||"")+'</div>';
  return '<article class="game'+(soon?' soon':'')+(g.status==="new"?' isnew':'')+'" data-id="'+g.id+'">'+(soon?'<span class="stamp">'+H.soon+'</span>':'')+(g.status==="new"?'<span class="ribbon">'+H.neu+'</span>':'')+cover+'<h3>'+esc(x.title)+'</h3><p class="tag">'+esc(x.tag)+'</p><p class="desc">'+esc(x.desc)+'</p><div class="meta">'+meta.join("")+'</div>'+
    (soon?'<button class="btn ghost dk" disabled>'+H.soon+'</button>':'<a class="btn" href="'+MW.root+esc(x.slug)+'">'+(has?H.resume:H.play)+' →</a>')+'</article>'}
function feature(g){var x=g[L],has=!!MW.LS.get(resumeKey(g),null),p=MW.profile.get(),st=p.games&&p.games[g.id],meta="<i>"+esc(g.minutes)+" "+H.min+"</i><i>"+esc(g.km)+" "+H.km+"</i>"+access(g)+(st&&st.best?'<i class="star">'+H.best+" "+"★".repeat(st.best)+"☆".repeat(3-st.best)+"</i>":"");
  return '<a class="feature" href="'+MW.root+esc(x.slug)+'" style="background-image:linear-gradient(180deg,rgba(7,9,13,.05) 0,rgba(7,9,13,.15) 170px,#07090d 325px),url('+MW.root+'assets/feature-'+g.id+'.webp)"><span class="fbadge">🎃 '+esc(g.feature[L])+'</span><span class="fbody"><h2>'+esc(x.title)+'</h2><span class="tag">'+esc(x.tag)+'</span><span class="desc">'+esc(x.desc)+'</span><span class="meta">'+meta+'</span><span class="btn">'+(has?H.resume:H.play)+' →</span></span></a>'}
function catalog(){
  var fe=$("#feat");if(!fe){fe=document.createElement("div");fe.id="feat";$("#cats").parentNode.insertBefore(fe,$("#cats"))}
  fe.innerHTML=C.games.filter(function(g){return g.feature&&g.status!=="soon"}).map(feature).join("");
  $("#cats").innerHTML=C.cats.map(function(c){var gs=C.games.filter(function(g){return g.cat===c.id&&!g.feature}),soon=gs.every(function(g){return g.status==="soon"});
    return '<section class="cat'+(soon?' soon':'')+'"><div class="hd"><span class="ico" aria-hidden="true">'+c.icon+'</span><h2>'+esc(c[L].n)+'</h2></div><p class="ct">'+esc(c[L].t)+'</p>'+gs.map(card).join("")+'</section>'}).join("")}

/* ---------- vellen ---------- */
function sheet(html){$("#sheetBody").innerHTML=html;$("#sheet").hidden=false;$("#sheetBody").scrollTop=0}
function closeSheet(){$("#sheet").hidden=true}
$("#sheet").addEventListener("click",function(e){if(e.target.id==="sheet")closeSheet()});
function toast(s){var e=$("#toast");e.textContent=s;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},2800)}
function proSheet(kind){sheet(MW.proHTML(L,kind)+'<button type="button" class="btn ghost dk" id="shX">'+t.cancel+'</button>');
  $("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();profile();catalog();toast(msg)})}
function privacy(){sheet('<div class="eyebrow">'+H.privacy+'</div><h2>'+H.privH+'</h2>'+H.privT+'<button type="button" class="btn ghost dk" id="shX">'+t.close+'</button>');$("#shX").onclick=closeSheet}

/* ---------- Pro-paneel op de pagina ---------- */
function proBox(){var b=$("#proBox");if(MW.pro.isPro()){b.hidden=true;return}b.innerHTML=MW.proHTML(L,"team");
  MW.bindPro(b,L,function(r,msg){profile();catalog();proBox();toast(msg)})}


/* ---------- moordwandeling op maat: formulier → mail ---------- */
var CF={nl:{btn:"✉ Op maat",h:"Moordwandeling op maat",lead:"Een moordzaak voor jullie bedrijfsuitje, vrijgezellenfeest, verjaardag of klas, in jullie eigen stad, met jullie namen in het verhaal? Vertel wat je in gedachten hebt. Het formulier opent je mailprogramma met alles al ingevuld; verstuur de mail en je hoort snel wat er kan. Prijs in overleg.",
    name:"Je naam",email:"Je e-mailadres",n:"Aantal deelnemers",teams:"Aantal teams",where:"Waar (stad, buurt of startadres)",when:"Wanneer (datum, of ongeveer)",kind:"Wat voor gelegenheid?",kinds:["Bedrijfsuitje of teamuitje","Vrijgezellenfeest","Verjaardag of feest","Familie- of vriendendag","School of klas","Iets anders"],
    wish:"Jullie wensen",wishP:"Bijvoorbeeld: het slachtoffer is onze directeur (met een knipoog), start bij het station en eindigen in ons stamcafé, een bruiloftsthema, Engelstalig…",send:"✉ Open de mail en verstuur",copy:"Lukt het mailen niet? Kopieer de tekst",copied:"Gekopieerd. Plak hem in een mail aan kellievandekerkhof@gmail.com.",need:"Vul in elk geval je naam en jullie wensen in.",
    subj:"Moordwandeling op maat",hi:"Hoi Kellie,",intro:"Ik zoek een moordwandeling op maat.",bye:"Groet,"},
  en:{btn:"✉ Custom",h:"A custom Murder Walk",lead:"A murder case for your company outing, hen or stag party, birthday or class, in your own town, with your names in the story? Tell me what you have in mind. The form opens your mail app with everything filled in; send the email and you'll hear quickly what's possible. Price on request.",
    name:"Your name",email:"Your email address",n:"Number of players",teams:"Number of teams",where:"Where (town, neighbourhood or start address)",when:"When (date, or roughly)",kind:"What's the occasion?",kinds:["Company or team outing","Hen or stag party","Birthday or party","Family or friends' day","School or class","Something else"],
    wish:"Your wishes",wishP:"For example: the victim is our CEO (tongue in cheek), start at the station and finish at our local pub, a wedding theme, in Dutch…",send:"✉ Open the email and send",copy:"Email not working? Copy the text",copied:"Copied. Paste it into an email to kellievandekerkhof@gmail.com.",need:"At least fill in your name and your wishes.",
    subj:"Custom Murder Walk",hi:"Hi Kellie,",intro:"I'm looking for a custom Murder Walk.",bye:"Kind regards,"}}[L];
var MAIL="kellievandekerkhof@gmail.com",CFK="ss_mw_custom";
function customForm(){var v=MW.LS.get(CFK,{});var f=function(id,lab,ph,type){return '<label class="cf"><span>'+lab+'</span><input type="'+(type||"text")+'" id="'+id+'" autocomplete="'+(id==="cfN"?"name":id==="cfE"?"email":"off")+'" value="'+esc(v[id]||"")+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></label>'};
  sheet('<div class="eyebrow">'+(L==="nl"?"Moordwandeling":"Murder Walk")+'</div><h2>'+CF.h+'</h2><p class="cfl">'+CF.lead+'</p><form id="cfF" novalidate>'+f("cfN",CF.name)+f("cfE",CF.email,"",'email')+'<div class="cf2">'+f("cfK",CF.n,"12",'number')+f("cfA",CF.teams,"3",'number')+'</div>'+f("cfW",CF.where)+f("cfD",CF.when)+
    '<label class="cf"><span>'+CF.kind+'</span><select id="cfT">'+CF.kinds.map(function(k){return '<option'+(v.cfT===k?' selected':'')+'>'+esc(k)+'</option>'}).join("")+'</select></label>'+
    '<label class="cf"><span>'+CF.wish+'</span><textarea id="cfX" rows="4" placeholder="'+esc(CF.wishP)+'">'+esc(v.cfX||"")+'</textarea></label>'+
    '<p class="note" id="cfM" style="color:#a5392c"></p><button type="submit" class="btn">'+CF.send+'</button><button type="button" class="btn ghost dk" id="cfC">'+CF.copy+'</button><button type="button" class="btn ghost dk" id="shX">'+t.close+'</button></form>');
  $("#shX").onclick=closeSheet;
  var read=function(){var o={};["cfN","cfE","cfK","cfA","cfW","cfD","cfT","cfX"].forEach(function(id){o[id]=($("#"+id).value||"").trim()});MW.LS.set(CFK,o);return o};
  var body=function(o){return CF.hi+"\n\n"+CF.intro+"\n\n"+CF.kind+": "+o.cfT+"\n"+CF.n+": "+o.cfK+"\n"+CF.teams+": "+o.cfA+"\n"+CF.where+": "+o.cfW+"\n"+CF.when+": "+o.cfD+"\n\n"+CF.wish+":\n"+o.cfX+"\n\n"+CF.bye+"\n"+o.cfN+(o.cfE?"\n"+o.cfE:"")+"\n"};
  var ok=function(o){if(!o.cfN||!o.cfX){$("#cfM").textContent=CF.need;return false}$("#cfM").textContent="";return true};
  $("#cfF").onsubmit=function(e){e.preventDefault();var o=read();if(!ok(o))return;location.href="mailto:"+MAIL+"?subject="+encodeURIComponent(CF.subj)+"&body="+encodeURIComponent(body(o))};
  $("#cfC").onclick=function(){var o=read();if(!ok(o))return;var txt=CF.subj+"\n\n"+body(o);try{navigator.clipboard.writeText(txt).then(function(){toast(CF.copied)},function(){prompt(MAIL,txt)})}catch(err){prompt(MAIL,txt)}}}
function customBtn(){var top=document.querySelector(".hero .top"),lg=$("#lang");if(top&&lg&&!$("#bCustom")){var w=document.createElement("span");w.className="tr";top.insertBefore(w,lg);
    var b=document.createElement("button");b.type="button";b.className="pill custom-pill";b.id="bCustom";b.textContent=CF.btn;w.appendChild(b);w.appendChild(lg);b.onclick=customForm}
  document.querySelectorAll("[data-custom]").forEach(function(a){a.removeAttribute("href");a.setAttribute("role","button");a.onclick=function(e){e.preventDefault();customForm()}})}

/* ---------- hemel: regen en lantaarnlicht ---------- */
function sky(){var cv=$("#sky");if(!cv)return;var g=cv.getContext("2d"),still=matchMedia("(prefers-reduced-motion: reduce)").matches,w,h,drops=[],dpr=1,hero=$(".hero");
  function rs(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr;drops=[];for(var i=0;i<(still?0:140);i++)drops.push([Math.random()*w,Math.random()*h,10+Math.random()*16,.35+Math.random()*.55])}
  rs();addEventListener("resize",rs);
  function f(){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);var lim=hero?hero.getBoundingClientRect().bottom:h;
    if(lim>0){g.strokeStyle="rgba(214,226,246,.28)";g.lineWidth=1;for(var i=0;i<drops.length;i++){var d=drops[i];if(d[1]<lim){g.beginPath();g.moveTo(d[0],d[1]);g.lineTo(d[0]-2.5,d[1]+d[2]);g.stroke()}d[1]+=d[2]*d[3]*1.8;d[0]-=.5*d[3];if(d[1]>Math.min(h,lim)){d[1]=-24;d[0]=Math.random()*(w+40)}}}
    if(!still)requestAnimationFrame(f)}
  requestAnimationFrame(f)}
function typed(){var el=$("#typed");if(!el)return;var still=matchMedia("(prefers-reduced-motion: reduce)").matches,lines=H.typed,li=0,ci=0;
  if(still){el.textContent=lines[0];return}
  (function step(){var s=lines[li];if(ci<=s.length){el.textContent=s.slice(0,ci++)+(ci%2?"▌":"");setTimeout(step,38)}else{el.textContent=s;setTimeout(function(){li=(li+1)%lines.length;ci=0;step()},2600)}})()}

/* ---------- start ---------- */
$("#bPro").onclick=function(){proSheet("team")};$("#bPriv").onclick=privacy;
var sw=$("#lang");if(sw)sw.onclick=function(e){e.preventDefault();var to=L==="nl"?"en":"nl";MW.lang.set(to);location.href=MW.hubUrl(to)};
profile();catalog();proBox();customBtn();sky();typed();
MW.pro.ready.then(function(){profile();catalog();proBox()});
})();
