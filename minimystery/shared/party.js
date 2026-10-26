/* MiniMystery – feestopties, gedeeld door alle zaken. Laden na walk.js, vóór game.js.
   1. Echte schat: de ouder vult vooraf in waar de traktatie ligt; na de ontmaskering stuurt de laatste aanwijzing de groep erheen.
   2. Teams: elk groepje kiest een teamkleur. Aan het eind een korte uitslagcode; op één telefoon vul je de codes in voor de teamstand.
   3. Begeleidersknop: houd bovenaan een puzzel één seconde ingedrukt om hem over te slaan (+2 minuten).
   Alles lokaal in localStorage (ss_mm_party), geen server. */
(function(){
"use strict";
var MW=window.MW,LS=MW.LS,esc=MW.esc,fill=MW.fill,Wk=MW.Walk,$=function(s){return document.querySelector(s)};
var L=(document.documentElement.lang||"nl").slice(0,2)==="en"?"en":"nl",KEY="ss_mm_party";
var COLS=[["#2563eb","Blauw","Blue"],["#e11d48","Rood","Red"],["#f59e0b","Geel","Yellow"],["#16a34a","Groen","Green"],["#7c3aed","Paars","Purple"],["#ea580c","Oranje","Orange"]];
var T={nl:{btn:"🎉 Feestopties",h:"Feestopties",lead:"Voor de begeleider. Vul dit in zonder dat de kinderen meekijken.",
    teamH:"Teamkleur",teamT:"Spelen jullie met meer groepjes? Geef elke telefoon dezelfde zaakcode en een eigen kleur. Aan het eind vergelijk je de tijden.",none:"Geen",
    trH:"Echte schat",trT:"Ligt er iets echts verstopt, zoals de traktatie of de cadeautjes? Dan stuurt de laatste aanwijzing de groep daarheen. Pas na de ontmaskering te zien.",
    trWhere:"Waar ligt het?",trWhereP:"Bijvoorbeeld: in de blauwe doos onder de trap",trWhat:"Wat ligt er?",trWhatP:"de traktatie",trPhoto:"📷 Foto van de plek (als hint, mag)",trPhotoOk:"Foto staat erin ✓",trDel:"Schat wissen",
    helpH:"Vastgelopen?",helpT:"Houd bovenaan een puzzel één seconde je vinger op de eerste regel. Dan kun je hem overslaan (+2 minuten op de tijd).",
    save:"Opslaan",close:"Sluiten",saved:"Opgeslagen.",
    stTeam:"Team {t}",stTr:"schat verstopt ✓",
    finKick:"Laatste aanwijzing",finGo:"Ga naar",finWhat:"Daar ligt {w}.",finHint:"Hint: laat de foto zien",finFound:"Gevonden! 🎉",finWhatDef:"de traktatie",
    resH:"Teamuitslag",resCode:"Uitslagcode",resTeam:"Team {t}",resCmp:"Teamstand",
    cmpH:"Teamstand",cmpT:"Vul hier de uitslagcodes van de andere groepjes in. Ze staan op hun eigen telefoon onder Teamuitslag.",cmpAdd:"Toevoegen",cmpBad:"Die code klopt niet.",cmpOther:"Die code hoort bij een andere zaak. Speelden jullie dezelfde zaakcode?",cmpSkip:"overgeslagen",
    hlpH:"Begeleider",hlpSkip:"Sla deze puzzel over (+2 min)",hlpClose:"Terug naar de puzzel",hlpRead:"Lees de opdracht nog eens voor",
    gen:"Er is nog één ding. Niet alles is op het scherm te vinden…"},
  en:{btn:"🎉 Party options",h:"Party options",lead:"For the grown-up. Fill this in while the children are not looking.",
    teamH:"Team colour",teamT:"Playing with more groups? Give every phone the same case code and its own colour. At the end you compare the times.",none:"None",
    trH:"Real treasure",trT:"Is something real hidden, like the treats or the presents? Then the last clue sends the group there. Only shown after the unmasking.",
    trWhere:"Where is it?",trWhereP:"For example: in the blue box under the stairs",trWhat:"What is there?",trWhatP:"the treats",trPhoto:"📷 Photo of the spot (as a hint, optional)",trPhotoOk:"Photo added ✓",trDel:"Clear treasure",
    helpH:"Stuck?",helpT:"Hold your finger on the top line of a puzzle for one second. Then you can skip it (+2 minutes on the time).",
    save:"Save",close:"Close",saved:"Saved.",
    stTeam:"Team {t}",stTr:"treasure hidden ✓",
    finKick:"Last clue",finGo:"Go to",finWhat:"That is where you will find {w}.",finHint:"Hint: show the photo",finFound:"Found it! 🎉",finWhatDef:"the treats",
    resH:"Team result",resCode:"Result code",resTeam:"Team {t}",resCmp:"Team standings",
    cmpH:"Team standings",cmpT:"Enter the result codes of the other groups here. They are on their own phone under Team result.",cmpAdd:"Add",cmpBad:"That code is not right.",cmpOther:"That code belongs to another case. Did you play the same case code?",cmpSkip:"skipped",
    hlpH:"Grown-up",hlpSkip:"Skip this puzzle (+2 min)",hlpClose:"Back to the puzzle",hlpRead:"Read the task aloud again",
    gen:"There is one more thing. Not everything can be found on the screen…"}}[L];
var CFG={id:"",fin:null};
function get(){var p=LS.get(KEY,null)||{};if(p.team==null)p.team=-1;return p}
function put(p){LS.set(KEY,p)}
function teamName(i){return i>=0&&COLS[i]?COLS[i][L==="nl"?1:2]:""}
function mmss(s){return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
function css(){if($("#mmPartyCss"))return;var st=document.createElement("style");st.id="mmPartyCss";st.textContent=
  ".mmp-row{display:flex;flex-direction:column;gap:6px;align-items:center}"+
  ".mmp-st{font-size:14px;color:var(--fog,#bfd3ff);text-align:center;min-height:1em}"+
  ".mmp-chips{display:flex;flex-wrap:wrap;gap:8px}.mmp-chips button{padding:8px 12px;border-radius:999px;border:2px solid #cbd5e1;font-weight:700;background:#fff;color:#1e293b}"+
  ".mmp-chips button[aria-pressed=true]{border-color:#0f172a;box-shadow:0 0 0 2px #0f172a inset}.mmp-chips i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:6px;vertical-align:-1px}"+
  ".mmp-f{display:flex;flex-direction:column;gap:6px}.mmp-f label{font-weight:700;font-size:14px;color:#334155}"+
  ".mmp-f textarea,.mmp-f input[type=text]{width:100%;padding:12px;border:2px solid #cbd5e1;border-radius:12px;font:500 16px/1.4 system-ui,sans-serif;color:#0f172a;background:#fff}"+
  ".mmp-box{background:#f1f5f9;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:10px}.mmp-box h3{margin:0;font-size:17px;color:#0f172a}.mmp-box p{margin:0;font-size:14px;color:#475569}"+
  "#mmFin{position:fixed;inset:0;z-index:80;background:radial-gradient(ellipse at 50% 30%,#1e293b,#020617 75%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center;color:#fff;overflow:hidden}"+
  "#mmFin .k{font:700 14px/1 system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#fbbf24}"+
  "#mmFin .say{font-size:18px;max-width:30ch;opacity:.9;min-height:3em}"+
  "#mmFin .go{font:700 14px system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase;opacity:0;transition:opacity .6s}"+
  "#mmFin .where{font:800 clamp(28px,8vw,44px)/1.1 system-ui,sans-serif;max-width:16ch;opacity:0;transform:scale(.8);transition:opacity .8s,transform .8s cubic-bezier(.2,1.5,.4,1);text-shadow:0 0 30px rgba(251,191,36,.6)}"+
  "#mmFin .what{font-size:17px;opacity:0;transition:opacity .6s}#mmFin.on .go,#mmFin.on .what{opacity:.9}#mmFin.on .where{opacity:1;transform:none}"+
  "#mmFin img{max-width:min(80vw,320px);max-height:30vh;border-radius:12px;filter:blur(18px);transition:filter .8s;border:3px solid #fff}#mmFin img.clear{filter:none}"+
  "#mmFin .btn{max-width:360px}#mmFin .cf{position:absolute;top:-20px;width:10px;height:16px;animation:mmcf 2.6s linear forwards}"+
  "@keyframes mmcf{to{transform:translate(var(--dx),110vh) rotate(720deg)}}"+
  ".mmp-res{border-radius:16px;padding:14px;color:#fff;display:flex;flex-direction:column;gap:6px;text-align:center}.mmp-res b{font-size:22px}.mmp-res .code{font:800 30px/1 ui-monospace,monospace;letter-spacing:.15em;background:rgba(255,255,255,.18);border-radius:10px;padding:8px}"+
  ".mmp-pod{display:flex;flex-direction:column;gap:8px}.mmp-pod div{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;color:#fff;font-weight:700}.mmp-pod span{margin-left:auto;font-variant-numeric:tabular-nums}.mmp-pod em{font-style:normal;font-size:22px;width:28px}"+
  "#mmHelp{position:fixed;inset:0;z-index:70;background:rgba(2,6,23,.75);display:flex;align-items:center;justify-content:center;padding:20px}#mmHelp>div{background:#fff;color:#0f172a;border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:10px;width:min(100%,380px)}#mmHelp h3{margin:0}"+
  ".mmp-hold{position:relative}.mmp-hold::after{content:'';position:absolute;left:0;bottom:-3px;height:3px;width:0;background:#f59e0b;transition:width 1s linear}.mmp-hold.holding::after{width:100%}";
  document.head.appendChild(st)}

/* ---------- startscherm: knop + status ---------- */
function status(){var el=$("#mmpSt");if(!el)return;var p=get(),bits=[];if(p.team>=0)bits.push(fill(T.stTeam,{t:teamName(p.team)}));if(p.where)bits.push(T.stTr);el.textContent=bits.join(" · ")}
function init(o){CFG.id=o.id||"";CFG.fin=o.fin||null;css();var anchor=$("#bGps")||$("#bResume");if(!anchor||$("#mmpBtn"))return;
  var w=document.createElement("div");w.className="mmp-row";w.innerHTML='<button type="button" class="btn ghost sm" id="mmpBtn">'+T.btn+'</button><p class="mmp-st" id="mmpSt"></p>';
  anchor.parentNode.insertBefore(w,$("#bResume")||anchor);$("#mmpBtn").onclick=sheet;status()}
function sheet(){var p=get(),photo=p.photo||null;
  Wk.sheet('<h2>'+T.h+'</h2><p class="note">'+T.lead+'</p>'+
    '<div class="mmp-box"><h3>'+T.teamH+'</h3><p>'+T.teamT+'</p><div class="mmp-chips" id="mmpC">'+'<button type="button" data-c="-1" aria-pressed="'+(p.team<0)+'">'+T.none+'</button>'+COLS.map(function(c,i){return '<button type="button" data-c="'+i+'" aria-pressed="'+(p.team===i)+'"><i style="background:'+c[0]+'"></i>'+c[L==="nl"?1:2]+'</button>'}).join("")+'</div></div>'+
    '<div class="mmp-box"><h3>'+T.trH+'</h3><p>'+T.trT+'</p><div class="mmp-f"><label for="mmpW">'+T.trWhere+'</label><textarea id="mmpW" rows="2" maxlength="140" placeholder="'+esc(T.trWhereP)+'">'+esc(p.where||"")+'</textarea></div>'+
    '<div class="mmp-f"><label for="mmpWh">'+T.trWhat+'</label><input type="text" id="mmpWh" maxlength="60" placeholder="'+esc(T.trWhatP)+'" value="'+esc(p.what||"")+'"></div>'+
    '<label class="btn ghost dk sm" for="mmpF" id="mmpFL">'+(photo?T.trPhotoOk:T.trPhoto)+'</label><input type="file" id="mmpF" accept="image/*" capture="environment" hidden>'+
    (p.where?'<button type="button" class="btn ghost dk sm" id="mmpDel">'+T.trDel+'</button>':'')+'</div>'+
    '<div class="mmp-box"><h3>'+T.helpH+'</h3><p>'+T.helpT+'</p></div>'+
    '<button type="button" class="btn" id="mmpOk">'+T.save+'</button><button type="button" class="btn ghost dk" id="mmpX">'+T.close+'</button>',true);
  $("#mmpC").onclick=function(e){var b=e.target.closest("button");if(!b)return;p.team=+b.dataset.c;[].forEach.call(this.children,function(x){x.setAttribute("aria-pressed",x===b)})};
  $("#mmpF").onchange=function(){var f=this.files&&this.files[0];if(!f)return;var u=URL.createObjectURL(f),im=new Image();im.onload=function(){URL.revokeObjectURL(u);var sc=Math.min(1,480/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.round(im.width*sc);cv.height=Math.round(im.height*sc);cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);photo=cv.toDataURL("image/jpeg",.7);$("#mmpFL").textContent=T.trPhotoOk};im.src=u};
  var del=$("#mmpDel");if(del)del.onclick=function(){p.where="";p.what="";p.photo=null;put(p);status();sheet()};
  $("#mmpOk").onclick=function(){p.where=$("#mmpW").value.trim();p.what=$("#mmpWh").value.trim();p.photo=p.where?photo:null;put(p);status();Wk.closeSheet();Wk.toast(T.saved)};
  $("#mmpX").onclick=function(){Wk.closeSheet()}}

/* ---------- de echte schat: laatste aanwijzing na de ontmaskering ---------- */
function hasTreasure(){return !!get().where}
function say(t){try{if(LS.get("ss_voice_off",false))return;if(window.MMVoice)return MMVoice.say(t);var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=L==="nl"?"nl-NL":"en-GB";u.rate=.9;ss.speak(u)}catch(e){}}
function finale(then){var p=get();if(!p.where)return then();Wk.closeSheet();var ov=document.createElement("div");ov.id="mmFin";var what=p.what||T.finWhatDef,line=(CFG.fin&&CFG.fin[L])||T.gen;
  ov.innerHTML='<div class="k">'+T.finKick+'</div><p class="say" id="mmfS"></p><div class="go">'+T.finGo+'</div><div class="where">'+esc(p.where)+'</div><div class="what">'+esc(fill(T.finWhat,{w:what}))+'</div>'+
    (p.photo?'<img src="'+p.photo+'" alt=""><button type="button" class="btn ghost sm" id="mmfH">'+T.finHint+'</button>':'')+'<button type="button" class="btn" id="mmfOk" style="opacity:0;pointer-events:none;transition:opacity .5s">'+T.finFound+'</button>';
  document.body.appendChild(ov);var s=$("#mmfS"),i=0,still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var type=function(){if(i<=line.length){s.textContent=line.slice(0,i);i+=still?line.length:2;setTimeout(type,30)}else{setTimeout(function(){ov.classList.add("on");Wk.beep(520,.2);setTimeout(function(){Wk.beep(780,.3)},180);Wk.buzz([80,40,160]);say(T.finGo+": "+p.where+". "+fill(T.finWhat,{w:what}));var b=$("#mmfOk");b.style.opacity=1;b.style.pointerEvents="auto"},500)}};
  say(line);type();
  var h=$("#mmfH");if(h)h.onclick=function(){ov.querySelector("img").classList.add("clear");h.remove()};
  $("#mmfOk").onclick=function(){Wk.buzz([100,50,300]);Wk.beep(660,.2);setTimeout(function(){Wk.beep(990,.4)},200);
    for(var k=0;k<70;k++){var c=document.createElement("i");c.className="cf";c.style.left=Math.random()*100+"%";c.style.background=["#fbbf24","#f472b6","#60a5fa","#34d399","#fff"][k%5];c.style.animationDelay=Math.random()*.8+"s";c.style.setProperty("--dx",(Math.random()-.5)*200+"px");ov.appendChild(c)}
    setTimeout(function(){ov.remove();then()},2200)}}

/* ---------- teamuitslag en teamstand ---------- */
function enc(caseCode,secs,stars,team){var v=((Math.min(secs,14399)*4+stars)*8+(team+1));var c=MW.hashStr(caseCode+"|"+v)%36;return(v.toString(36)+c.toString(36)).toUpperCase()}
function dec(caseCode,code){code=MW.norm(code);if(code.length<3)return{err:T.cmpBad};var v=parseInt(code.slice(0,-1),36),c=parseInt(code.slice(-1),36);if(!(v>=0))return{err:T.cmpBad};
  if(MW.hashStr(caseCode+"|"+v)%36!==c)return{err:T.cmpOther};var team=v%8-1,r=Math.floor(v/8);return{team:team,stars:r%4,secs:Math.floor(r/4),code:code}}
function result(box,o){if(!box)return;var p=get();css();var own={team:p.team,stars:o.stars,secs:o.secs,code:enc(o.code,o.secs,o.stars,p.team),own:true};
  var col=p.team>=0?COLS[p.team][0]:"#334155",html='<div class="mmp-res" style="background:'+col+'"><span>'+T.resH+'</span><b>'+(p.team>=0?esc(fill(T.resTeam,{t:teamName(p.team)})):"")+' '+mmss(o.secs)+' · '+"★".repeat(o.stars)+"☆".repeat(3-o.stars)+'</b><span>'+T.resCode+'</span><div class="code">'+own.code+'</div></div>'+
    '<button type="button" class="btn ghost dk" id="mmpCmp">'+T.resCmp+'</button>';
  var eb=box.querySelector(".eyebrow");var w=document.createElement("div");w.style.cssText="display:flex;flex-direction:column;gap:10px";w.innerHTML=html;if(eb)eb.parentNode.insertBefore(w,eb.nextSibling);else box.insertBefore(w,box.firstChild);
  var key="ss_mm_cmp_"+o.code,list=LS.get(key,[]).filter(function(x){return !x.own});list.unshift(own);LS.set(key,list);
  $("#mmpCmp").onclick=function(){standings(o,key,box.innerHTML,o.back)}}
function standings(o,key,backHtml,back){var list=LS.get(key,[]);
  var rows=list.slice().sort(function(a,b){return a.secs-b.secs||b.stars-a.stars}).map(function(r,i){var c=r.team>=0?COLS[r.team][0]:"#475569";return '<div style="background:'+c+'"><em>'+(i===0?"🥇":i===1?"🥈":i===2?"🥉":(i+1)+".")+'</em>'+(r.team>=0?esc(teamName(r.team)):"–")+(r.own?" ★":"")+'<span>'+mmss(r.secs)+' · '+"★".repeat(r.stars)+'</span></div>'}).join("");
  Wk.sheet('<h2>'+T.cmpH+'</h2><div class="mmp-pod">'+rows+'</div><p class="note">'+T.cmpT+'</p><input class="inp" id="mmpIn" autocomplete="off" autocapitalize="characters" spellcheck="false"><button type="button" class="btn" id="mmpAdd">'+T.cmpAdd+'</button><p class="note err" id="mmpE"></p><button type="button" class="btn ghost dk" id="mmpB">'+T.close+'</button>',true);
  var add=function(){var r=dec(o.code,$("#mmpIn").value);if(r.err){$("#mmpE").textContent=r.err;Wk.buzz(120);return}var l=LS.get(key,[]);if(!l.some(function(x){return x.code===r.code}))l.push(r);LS.set(key,l);Wk.beep(660,.15);standings(o,key,backHtml,back)};
  $("#mmpAdd").onclick=add;$("#mmpIn").onkeydown=function(e){if(e.key==="Enter")add()};
  $("#mmpB").onclick=function(){if(back)back();else Wk.closeSheet()}}

/* ---------- begeleidersknop: lang drukken op de bovenste regel van een puzzel ---------- */
function helper(skip,readAgain){var eb=document.querySelector("#sheetBody .eyebrow");if(!eb)return;eb.classList.add("mmp-hold");eb.style.userSelect="none";eb.style.webkitUserSelect="none";var t=0;
  var down=function(e){eb.classList.add("holding");clearTimeout(t);t=setTimeout(function(){eb.classList.remove("holding");open()},1000)},up=function(){clearTimeout(t);eb.classList.remove("holding")};
  eb.addEventListener("pointerdown",down);eb.addEventListener("pointerup",up);eb.addEventListener("pointerleave",up);eb.addEventListener("pointercancel",up);eb.addEventListener("contextmenu",function(e){e.preventDefault()});
  function open(){Wk.buzz(60);var d=document.createElement("div");d.id="mmHelp";d.innerHTML='<div><h3>'+T.hlpH+'</h3>'+(readAgain?'<button type="button" class="btn ghost dk" id="mmhR">'+T.hlpRead+'</button>':'')+'<button type="button" class="btn" id="mmhS">'+T.hlpSkip+'</button><button type="button" class="btn ghost dk" id="mmhX">'+T.hlpClose+'</button></div>';document.body.appendChild(d);
    var x=function(){d.remove()};$("#mmhX").onclick=x;d.onclick=function(e){if(e.target===d)x()};var r=$("#mmhR");if(r)r.onclick=function(){x();readAgain()};$("#mmhS").onclick=function(){x();skip()}}}

window.MMP={init:init,hasTreasure:hasTreasure,finale:finale,result:result,helper:helper,team:function(){var p=get();return{i:p.team,name:teamName(p.team),col:p.team>=0?COLS[p.team][0]:null}}};
})();
