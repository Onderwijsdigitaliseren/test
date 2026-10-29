/* MiniMystery – gedeelde speellaag "Crew": wat Glitch en Backstage leuker maakt, voor alle zaken. Laden na walk.js, vóór game.js.
   1. Hartjes: drie per puzzel. Fout = hartje kwijt. Op = "Opnieuw!" zonder straf (geen sterren of munten kwijt).
        var H=MW.Crew.hearts(box, restartFn, {dead:stopLoops, mount:el});  // mount: vaste plek voor de hartjes (anders vlak boven box)  H.miss() → true als de puzzel opnieuw moet (de laag toont zelf het opnieuw-vak)
   2. Kaping: de schurk neemt het scherm over met een opdracht voor de hele groep, met klokje. Iedereen doet mee, niet alleen wie de telefoon vasthoudt.
        MW.Crew.hijack({who, img, line, secs, say, then})
   3. Samen-moment: iedereen tikt tegelijk tot de meter vol is (lantaarn opladen, motor starten, spreuk opbouwen…).
        MW.Crew.rally({title, text, goal, secs, icon, color, say, then})
   Teksten NL/EN zitten hierin; de regels zelf (wat de schurk zegt) komen uit het spel. */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,esc=MW.esc,fill=MW.fill,$=function(s){return document.querySelector(s)};
var L=(document.documentElement.lang||"nl").slice(0,2)==="en"?"en":"nl";
var T={nl:{lost:"Hartje kwijt!",tip:"Drie hartjes. Fout = hartje weg. Op? Gewoon opnieuw, zonder straf.",over:"Alle hartjes op!",overT:"Geeft niks. Even schudden en opnieuw, dat kan zo vaak als je wilt.",retry:"Opnieuw!",
    hjH:"⚠ Hij neemt het scherm over",hjGo:"Gedaan! ▸",hjAll:"Opdracht voor de hele groep",
    raH:"Samen!",raGo:"Klaar ▸",raT:"Iedereen tikt tegelijk op het scherm. Zo snel als je kunt!",raOk:"Gelukt!"},
  en:{lost:"Lost a heart!",tip:"Three hearts. Wrong = lose one. All gone? Just try again, no penalty.",over:"Out of hearts!",overT:"No worries. Shake it off and try again, as often as you like.",retry:"Try again!",
    hjH:"⚠ He's taking over the screen",hjGo:"Done! ▸",hjAll:"Task for the whole group",
    raH:"Together!",raGo:"Done ▸",raT:"Everyone taps the screen at the same time. As fast as you can!",raOk:"You did it!"}}[L];
function css(){if($("#mmCrewCss"))return;var s=document.createElement("style");s.id="mmCrewCss";s.textContent=
  ".why{font-size:14px;line-height:1.4;opacity:.9;margin:6px 0 10px;padding:8px 12px;border-radius:12px;background:rgba(127,127,127,.12);text-align:left}"+
  "#crHj .crLine{white-space:pre-line}"+
  ".crH{display:flex;justify-content:center;gap:6px;margin:4px 0 8px}.crH i{width:24px;height:22px;background:rgba(127,127,127,.35);clip-path:polygon(50% 100%,0 40%,0 15%,25% 0,50% 20%,75% 0,100% 15%,100% 40%);transition:transform .2s,background .2s}"+
  ".crH i.on{background:#ff4f7a;box-shadow:0 0 10px rgba(255,79,122,.7)}.crH i.pop{transform:scale(1.4)}"+
  ".crOver{text-align:center;padding:18px 10px}.crOver b{display:block;font-size:22px;margin-bottom:6px}.crOver p{margin:0 0 14px;font-size:15px;opacity:.85}"+
  /* kaping: volledig scherm, bovenop alles */
  "#crHj{position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(8,6,20,.9);backdrop-filter:blur(4px);animation:crIn .25s ease-out}"+
  "#crHj[hidden]{display:none}@keyframes crIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:none}}"+
  "#crHj .crBox{width:100%;max-width:440px;background:#fffaf0;color:#1b2550;border-radius:24px;padding:18px 18px 16px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.6);animation:crShake .5s ease-out 1}"+
  "@keyframes crShake{0%,100%{transform:none}20%{transform:translateX(-6px) rotate(-1deg)}40%{transform:translateX(6px) rotate(1deg)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}"+
  "#crHj .crEb{font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#c2410c}"+
  "#crHj img{width:150px;height:150px;object-fit:contain;margin:6px auto 2px;display:block;filter:drop-shadow(0 8px 16px rgba(0,0,0,.4))}"+
  "#crHj .crWho{font-weight:700;font-size:13px;opacity:.7}#crHj .crLine{font-size:20px;line-height:1.3;font-weight:700;margin:6px 0 10px}"+
  "#crHj .crAll{display:inline-block;background:#1b2550;color:#fff;font-size:12px;font-weight:700;border-radius:99px;padding:4px 12px;margin-bottom:10px}"+
  "#crHj .crClk{font-size:44px;font-weight:700;line-height:1;margin:4px 0 12px;font-variant-numeric:tabular-nums}#crHj .crClk.low{color:#e11d48}"+
  "#crHj .btn,#crRa .btn{width:100%;padding:14px;border:0;border-radius:16px;background:#f5b800;color:#1b2550;font:700 18px inherit;cursor:pointer}"+
  /* samen-moment */
  "#crRa{position:fixed;inset:0;z-index:9990;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(8,6,20,.92);user-select:none;touch-action:manipulation}#crRa[hidden]{display:none}"+
  "#crRa .crBox{width:100%;max-width:440px;text-align:center;color:#fff}#crRa .crEb{font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;opacity:.8}"+
  "#crRa h2{margin:4px 0 6px;font-size:26px}#crRa p{margin:0 0 14px;font-size:16px;opacity:.9}"+
  "#crRa .crIco{font-size:96px;line-height:1;margin:6px 0;transition:transform .08s}#crRa .crIco.hit{transform:scale(1.18)}"+
  "#crRa .crBar{height:26px;border-radius:99px;background:rgba(255,255,255,.18);overflow:hidden;margin:10px 0 6px}#crRa .crBar i{display:block;height:100%;width:0;background:var(--cr,#f5b800);box-shadow:0 0 18px var(--cr,#f5b800);transition:width .12s}"+
  "#crRa .crClk{font-size:15px;opacity:.85;margin-bottom:14px}#crRa .crOk{font-size:30px;font-weight:700;margin:8px 0}"+
  "#crRa .crBurst{position:absolute;width:12px;height:12px;border-radius:50%;pointer-events:none;animation:crB .7s ease-out forwards}@keyframes crB{to{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}";
  document.head.appendChild(s)}
function say(t){try{if(!t)return;var ss=window.speechSynthesis;if(!ss)return;ss.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=L==="nl"?"nl-NL":"en-GB";ss.speak(u)}catch(e){}}

/* ---------- 1. hartjes ---------- */
function hearts(box,restart,opt){css();opt=typeof opt==="number"?{n:opt}:(opt||{});var n=opt.n||3;var el=document.createElement("div");el.className="crH";if(opt.mount){opt.mount.innerHTML="";opt.mount.appendChild(el)}else box.parentNode.insertBefore(el,box);var h=n,dead=false;
  function paint(){el.innerHTML="";for(var i=0;i<n;i++){var s=document.createElement("i");if(i<h)s.className="on";el.appendChild(s)}}
  paint();
  try{if(!localStorage.getItem("mm_hearts_tip")){localStorage.setItem("mm_hearts_tip","1");setTimeout(function(){Wk.toast(T.tip)},700)}}catch(e){}
  return{el:el,left:function(){return h},dead:function(){return dead},
    miss:function(){if(dead)return true;h--;paint();var last=el.children[h];if(last){last.classList.add("pop");setTimeout(function(){last.classList.remove("pop")},250)}Wk.buzz(120);
      if(h>0){Wk.toast(T.lost);return false}
      dead=true;if(opt.dead)try{opt.dead()}catch(e){}box.innerHTML='<div class="crOver"><b>'+T.over+'</b><p>'+T.overT+'</p><button type="button" class="btn" id="crRetry">'+T.retry+'</button></div>';say(T.over+" "+T.overT);
      $("#crRetry").onclick=function(){el.remove();restart()};return true},
    reset:function(){h=n;dead=false;paint()},remove:function(){el.remove()}}}

/* ---------- 2. kaping ---------- */
function hijack(o){css();var ov=$("#crHj");if(!ov){ov=document.createElement("div");ov.id="crHj";document.body.appendChild(ov)}
  var secs=o.secs||20;
  ov.innerHTML='<div class="crBox"><div class="crEb">'+esc(o.head||T.hjH)+'</div>'+(o.img?'<img src="'+esc(o.img)+'" alt="">':'')+(o.who?'<div class="crWho">'+esc(o.who)+'</div>':'')+
    '<div class="crLine">'+esc(o.line)+'</div><span class="crAll">'+T.hjAll+'</span><div class="crClk" id="crClk">'+secs+'</div><button type="button" class="btn" id="crHjGo">'+T.hjGo+'</button></div>';
  ov.hidden=false;Wk.buzz([80,40,80,40,160]);if(o.say!==false)say(o.line);
  var t0=Date.now(),iv=setInterval(function(){var left=Math.max(0,secs-Math.floor((Date.now()-t0)/1000)),c=$("#crClk");if(!c){clearInterval(iv);return}c.textContent=left;c.classList.toggle("low",left<=5);if(left<=0){clearInterval(iv);Wk.buzz([60,40,60])}},250);
  $("#crHjGo").onclick=function(){clearInterval(iv);ov.hidden=true;ov.innerHTML="";try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}if(o.then)o.then()};
  return{close:function(){clearInterval(iv);ov.hidden=true;ov.innerHTML=""}}}

/* ---------- 3. samen tikken ---------- */
function rally(o){css();var hj=$("#crHj");if(hj){hj.hidden=true;hj.innerHTML=""}var ov=$("#crRa");if(!ov){ov=document.createElement("div");ov.id="crRa";document.body.appendChild(ov)}
  var goal=o.goal||60,secs=o.secs||15,n=0,fin=false;
  ov.style.setProperty("--cr",o.color||"#f5b800");
  ov.innerHTML='<div class="crBox"><div class="crEb">'+esc(o.head||T.raH)+'</div><h2>'+esc(o.title||"")+'</h2><p>'+esc(o.text||T.raT)+'</p><div class="crIco" id="crIco">'+(o.icon||"✨")+'</div><div class="crBar"><i id="crBar"></i></div><div class="crClk" id="crRaClk">'+secs+'</div><div id="crRaEnd"></div></div>';
  ov.hidden=false;if(o.say!==false)say((o.title||"")+". "+(o.text||T.raT));
  var t0=Date.now(),iv=setInterval(function(){var left=Math.max(0,secs-Math.floor((Date.now()-t0)/1000)),c=$("#crRaClk");if(!c){clearInterval(iv);return}c.textContent=left+" s";if(left<=0&&!fin)done()},250);
  function done(){fin=true;clearInterval(iv);var ok=n>=goal;Wk.buzz(ok?[60,40,60,40,200]:[80]);$("#crRaClk").textContent="";$("#crIco").textContent=o.iconDone||o.icon||"✨";
    $("#crRaEnd").innerHTML='<div class="crOk">'+esc(ok?(o.okText||T.raOk):(o.failText||T.raOk))+'</div><button type="button" class="btn" id="crRaGo">'+T.raGo+'</button>';say(ok?(o.okText||T.raOk):(o.failText||T.raOk));
    $("#crRaGo").onclick=function(){ov.hidden=true;ov.innerHTML="";if(o.then)o.then(ok,n)}}
  ov.onpointerdown=function(e){if(fin)return;n++;var p=Math.min(1,n/goal);$("#crBar").style.width=(p*100)+"%";var ic=$("#crIco");ic.classList.add("hit");setTimeout(function(){ic.classList.remove("hit")},80);
    if(n%4===0)Wk.beep(400+p*500,.05);
    var b=document.createElement("i");b.className="burst";b.style.left=e.clientX+"px";b.style.top=e.clientY+"px";b.style.background=o.color||"#f5b800";b.style.setProperty("--dx",(Math.random()*120-60)+"px");b.style.setProperty("--dy",(Math.random()*-120-20)+"px");ov.appendChild(b);setTimeout(function(){b.remove()},700);
    if(n>=goal&&!fin)setTimeout(done,350)};
  return{close:function(){clearInterval(iv);ov.hidden=true;ov.innerHTML=""}}}

css();
MW.Crew={hearts:hearts,hijack:hijack,rally:rally,T:T,busy:function(){var a=$("#crHj"),b=$("#crRa");return !!((a&&!a.hidden)||(b&&!b.hidden))}};
})();
