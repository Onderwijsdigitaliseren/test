/* MiniMystery Educatie – bonusvraag bij een station (sinds 23 nov 2026).
   Na de hoofdvraag van een station krijgt het team één korte bonusvraag met één zin uitleg. Daarna komt de sleutel.
   Bewust kort: de doelgroep is de basisschool en jonge kinderen lezen nog niet vlot (keuze van Kellie, 23 nov 2026).

   Data: op een station (in data-<taal>.js) staat  more:[niveau0, niveau1, niveau2]  en elk niveau is een lijst stappen:
     ["vraag", ["goed antwoord","fout","fout"], "uitleg"]      keuzevraag; het GOEDE antwoord staat altijd eerst, het spel husselt
     ["vraag", "antwoord|ander goed antwoord", "uitleg"]         typvraag; meer goede antwoorden gescheiden door |
     ["doe-opdracht"]                                            samen doen, daarna 'Gedaan'
     Een vierde element 1 (bijv. ["vraag",["goed","fout"],"uitleg",1]) maakt een stap de vaste kindervraag van dat niveau.
   Het spel toont er één (de kortste, zie kid()); het begeleidersblad toont ze allemaal met de volledige uitleg.
   Aansluiten in een game.js:  MW.Meer.run({G,key,steps,box,age,lang,say,save,beep,buzz,done})  en  MW.Meer.lead(steps,lang). */
(function(){
"use strict";
var MW=window.MW=window.MW||{};
var TX={
  nl:{step:"⭐ Bonusvraag",step0:"⭐ Bonusvraag",doe:"Doe samen",done:"Gedaan ▸",next:"Verder ▸",last:"Klaar ▸",ok:"Controleer ▸",good:"Goed!",
      no:"Nog niet goed. Overleg en probeer het nog een keer.",ans:"Het antwoord is: ",ph:"antwoord",lead:"Bonusvraag en napraten",leadDo:"Doe-opdracht",why:"Zo zit het:",first:"Goed gedaan! Nu gaan jullie een stap verder."},
  en:{step:"⭐ Bonus question",step0:"⭐ Bonus question",doe:"Do this together",done:"Done ▸",next:"Next ▸",last:"Finish ▸",ok:"Check ▸",good:"Correct!",
      no:"Not quite. Talk it over and try again.",ans:"The answer is: ",ph:"answer",lead:"Bonus question and talking points",leadDo:"Activity",why:"Here is why:",first:"Well done! Now take it one step further."}
};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function norm(s){return String(s||"").toLowerCase().replace(/[’`]/g,"'").replace(/[^a-z0-9à-ÿ:,.'\-]/g,"").replace(/^(de|het|een|the|a)(?=[a-zà-ÿ])/,"")}
function parse(st){
  if(!st||!st.length)return null;
  if(st.length===1)return{kind:"doe",q:st[0]};
  if(Array.isArray(st[1]))return{kind:"choice",q:st[0],c:st[1],why:st[2]||"",kid:st[3]?1:0};
  return{kind:"text",q:st[0],a:String(st[1]).split("|"),why:st[2]||"",kid:st[3]?1:0}}
function stepsOf(m,age){var x=m&&m.more;if(!x)return[];var a=x[Math.max(0,Math.min(2,+age||0))]||[];return a.map(parse).filter(Boolean)}
/* Voor de kinderen: één bonusvraag per station, de kortste, met één zin uitleg. Jonge kinderen lezen nog niet vlot.
   Het begeleidersblad houdt alle stappen met de volledige uitleg (om na te praten). */
function size(st){return st.kid?0:st.kind==="doe"?999:st.kind==="choice"?st.q.length+st.c.join("").length:st.q.length*1.6+30}
function zin(t){var m=/^.*?[.!?](?=\s+[A-ZÀ-Ý0-9'"]|$)/.exec(String(t||""));return m?m[0]:String(t||"")}
function kid(steps){if(!steps||!steps.length)return[];var b=steps[0];steps.forEach(function(st){if(size(st)<size(b))b=st});
  var o={};for(var k in b)o[k]=b[k];o.why=zin(b.why);return[o]}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function order(n,seed){var o=[],i,j,t,x=seed>>>0||1;for(i=0;i<n;i++)o.push(i);for(i=n-1;i>0;i--){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;j=x%(i+1);t=o[i];o[i]=o[j];o[j]=t}return o}

function run(o){
  var G=o.G,steps=kid(o.steps),t=TX[o.lang]||TX.nl,box=o.box,age=+o.age||0;
  if(!G.deep)G.deep={};
  var k=G.deep[o.key]||0;
  if(!steps.length||k>=steps.length||!box||!box.isConnected){return o.done()}
  var fx=function(ok){try{if(ok){o.beep&&o.beep(620,.12);o.buzz&&o.buzz(30)}else{o.beep&&o.beep(180,.2);o.buzz&&o.buzz(120)}}catch(e){}};
  var say=function(s){try{o.say&&o.say(s)}catch(e){}};
  function fwd(){G.deep[o.key]=k+1;o.save&&o.save();run(o)}
  function head(st){return '<div class="meer"><div class="eyebrow">'+esc((age===0?t.step0:t.step).replace("{k}",k+1).replace("{n}",steps.length))+'</div>'}
  function after(st,revealed){var last=k+1>=steps.length;
    var fb=box.querySelector("#mfb");fb.innerHTML=(revealed?'<div class="fb hint">'+esc(t.ans)+'<b>'+esc(revealed)+'</b></div>':'<div class="fb ok">✔ '+esc(t.good)+'</div>')+(st.why?'<div class="feit"><em>'+esc(t.why)+'</em><p>'+esc(st.why)+'</p></div>':'')+'<button type="button" class="btn" id="mNext">'+(last?t.last:t.next)+'</button>';
    if(st.why&&(age===0||revealed))say(st.why);
    box.querySelector("#mNext").onclick=fwd;
    try{box.querySelector("#mNext").scrollIntoView({block:"nearest",behavior:"smooth"})}catch(e){}}
  var st=steps[k],h=head(st),tries=0;
  if(st.kind==="doe"){
    box.innerHTML=h+'<div class="act"><span class="ico">🤸</span><div><b>'+esc(t.doe)+'</b><br>'+esc(st.q)+'</div></div><button type="button" class="btn" id="mDone">'+t.done+'</button></div>';
    say(st.q);box.querySelector("#mDone").onclick=fwd;return}
  if(st.kind==="choice"){
    var ord=order(st.c.length,hash(o.key+"|"+k)^(G.seed>>>0));
    box.innerHTML=h+'<p class="q">'+esc(st.q)+'</p><div class="choices" id="mch">'+ord.map(function(ci){return '<button type="button" data-i="'+ci+'">'+esc(st.c[ci])+'</button>'}).join("")+'</div><div id="mfb"></div></div>';
    if(age===0)setTimeout(function(){if(box.isConnected)say(st.q+" "+ord.map(function(ci){return st.c[ci]}).join(", of: ")+"?")},200);
    var bs=[].slice.call(box.querySelectorAll("#mch button"));
    bs.forEach(function(b){b.onclick=function(){
      if(+b.dataset.i===0){fx(true);b.classList.add("ok");bs.forEach(function(x){x.disabled=true});after(st)}
      else{tries++;G.wrong=(G.wrong||0)+1;o.save&&o.save();fx(false);b.classList.add("no");b.disabled=true;
        if(tries>=2||st.c.length<=2){bs.forEach(function(x){x.disabled=true;if(+x.dataset.i===0)x.classList.add("ok")});after(st,st.c[0])}
        else box.querySelector("#mfb").innerHTML='<div class="fb no">'+esc(t.no)+'</div>'}}});
    return}
  box.innerHTML=h+'<p class="q">'+esc(st.q)+'</p><input class="inp code" id="mans" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="40" placeholder="'+esc(t.ph)+'"><div id="mfb"></div><button type="button" class="btn" id="mchk">'+t.ok+'</button></div>';
  var inp=box.querySelector("#mans"),chk=box.querySelector("#mchk");
  var go=function(){var v=norm(inp.value);if(!v)return;
    if(st.a.some(function(a){return norm(a)===v})){fx(true);inp.disabled=true;chk.remove();after(st)}
    else{tries++;G.wrong=(G.wrong||0)+1;o.save&&o.save();fx(false);
      if(tries>=3){inp.disabled=true;chk.remove();after(st,st.a[0])}
      else{box.querySelector("#mfb").innerHTML='<div class="fb no">'+esc(t.no)+'</div>';inp.select()}}};
  chk.onclick=go;inp.onkeydown=function(e){if(e.key==="Enter")go()};
}
/* begeleidersblad: de extra stappen met antwoord en uitleg */
function lead(steps,lang){var t=TX[lang]||TX.nl;if(!steps||!steps.length)return"";
  return '<br><i>'+esc(t.lead)+':</i><ol class="ol small meerlead">'+steps.map(function(st){
    if(st.kind==="doe")return '<li><i>'+esc(t.leadDo)+':</i> '+esc(st.q)+'</li>';
    return '<li>'+esc(st.q)+' → <b>'+esc(st.kind==="choice"?st.c[0]:st.a[0])+'</b>'+(st.why?' <small>('+esc(st.why)+')</small>':'')+'</li>'}).join("")+'</ol>'}
MW.Meer={run:run,lead:lead,steps:stepsOf,kid:kid,parse:parse,norm:norm};
})();
