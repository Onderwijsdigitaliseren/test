/* MiniMystery – bonusplekken onderweg (gedeeld door alle wandelingen met een kaart).
   Tussen de plekken van het verhaal liggen extra stops met een klein spelletje: een quiz, snoepjes op een rij, blokjes stapelen,
   memory, mollen meppen, zoek-de-andere en kleurenreeks. Ze zijn een extraatje: het verhaal heeft ze niet nodig, maar elke stop geeft een ster.
   Laden ná kidsmap.js; kidsmap.js meldt het spel hier aan (MW.Bonus.attach) en tekent de stops op de verhaalkaart, walk.js op de echte kaart.
   De stops komen op de lijn tussen twee plekken (in looproute vanaf de start), zodat je er vanzelf langs loopt, ook binnen op stappen. */
(function(){
"use strict";
var MW=window.MW=window.MW||{};
var L=(document.documentElement.lang||"nl").slice(0,2)==="en"?"en":"nl",$=function(s){return document.querySelector(s)};
var X={nl:{name:"Bonusstop",star:"ster",stars:"sterren",here:"Bonusstop! Speel het spelletje voor een ster.",got:"Je hebt een ster! ⭐",skip:"Overslaan",again:"Nog een keer",ok:"Verder lopen",close:"Sluiten",
    bonus:"Bonus",near:"Bonusstop · {d} m",goDemo:"Je loopt naar de bonusstop",
    g:{quiz:["Quiz","Kies het goede antwoord. Drie vragen."],snoep:["Snoepjes op een rij","Tik een snoepje en dan het snoepje ernaast om ze te ruilen. Maak 5 keer drie op een rij."],
      blok:["Blokjes stapelen","Schuif en draai de blokjes. Maak 2 volle rijen."],memo:["Memory","Zoek de plaatjes die bij elkaar horen."],mol:["Hamsters tikken","Tik op de hamsters als ze opduiken. Tik er 10."],
      anders:["Zoek de andere","Eén plaatje is anders dan de rest. Welke? Vier keer."],kleur:["Kleurenreeks","Kijk welke kleuren oplichten en tik ze na in dezelfde volgorde."]},
    rows:"Rijtjes: {n} van {m}",moves:"Zetten over: {n}",lines:"Rijen: {n} van {m}",hits:"Getikt: {n} van {m}",round:"Ronde {n} van {m}",pairs:"Paren: {n} van {m}",watch:"Kijk goed…",yours:"Nu jij!",oops:"Oeps, nog een keer kijken!",
    q:[["Hoeveel poten heeft een spin?",["8","6","4"]],["Welke kleur krijg je met blauw en geel?",["Groen","Paars","Oranje"]],["Welk dier zegt 'kukeleku'?",["Haan","Koe","Eend"]],["Hoeveel dagen heeft een week?",["7","5","10"]],
       ["Wat groeit er aan een appelboom?",["Appels","Peren","Bananen"]],["Welk dier kan het hardst rennen?",["Jachtluipaard","Olifant","Schildpad"]],["Hoeveel is 5 + 4?",["9","8","10"]],["Waar woont een vis?",["In het water","In een boom","In de grond"]],
       ["Welke vorm heeft drie hoeken?",["Driehoek","Cirkel","Vierkant"]],["Welk seizoen komt na de winter?",["Lente","Zomer","Herfst"]],["Wat maakt een bij?",["Honing","Melk","Kaas"]],["Hoeveel wielen heeft een fiets?",["2","3","4"]],
       ["Welk dier heeft een slurf?",["Olifant","Giraf","Leeuw"]],["Wat is de kleur van een banaan?",["Geel","Rood","Blauw"]],["Hoeveel is 10 − 3?",["7","6","8"]],["Wat heb je nodig om te zien?",["Ogen","Oren","Neus"]],
       ["Welk dier slaapt de hele winter?",["Egel","Hond","Kip"]],["Wat valt er uit de lucht als het regent?",["Water","Zand","Snoep"]],["Hoeveel maanden heeft een jaar?",["12","10","7"]],["Welk dier maakt een web?",["Spin","Mier","Vlinder"]],
       ["Waar staan de meeste boeken?",["Bibliotheek","Bakker","Zwembad"]],["Wat is het grootst?",["De zon","De maan","De aarde"]],["Welk getal komt na 19?",["20","18","21"]],["Waar wordt een kuiken uit geboren?",["Een ei","Een bloem","Een appel"]]]},
  en:{name:"Bonus stop",star:"star",stars:"stars",here:"Bonus stop! Play the little game for a star.",got:"You got a star! ⭐",skip:"Skip",again:"Once more",ok:"Walk on",close:"Close",
    bonus:"Bonus",near:"Bonus stop · {d} m",goDemo:"You walk to the bonus stop",
    g:{quiz:["Quiz","Pick the right answer. Three questions."],snoep:["Sweets in a row","Tap a sweet, then the one next to it to swap them. Make three in a row 5 times."],
      blok:["Stacking blocks","Slide and turn the blocks. Make 2 full rows."],memo:["Memory","Find the pictures that belong together."],mol:["Tap the hamsters","Tap the hamsters when they pop up. Tap 10."],
      anders:["Spot the odd one","One picture is different from the rest. Which one? Four times."],kleur:["Colour sequence","Watch which colours light up and tap them in the same order."]},
    rows:"Rows: {n} of {m}",moves:"Moves left: {n}",lines:"Rows: {n} of {m}",hits:"Tapped: {n} of {m}",round:"Round {n} of {m}",pairs:"Pairs: {n} of {m}",watch:"Watch closely…",yours:"Your turn!",oops:"Oops, watch again!",
    q:[["How many legs does a spider have?",["8","6","4"]],["What colour do blue and yellow make?",["Green","Purple","Orange"]],["Which animal says 'cock-a-doodle-doo'?",["Rooster","Cow","Duck"]],["How many days are in a week?",["7","5","10"]],
       ["What grows on an apple tree?",["Apples","Pears","Bananas"]],["Which animal runs the fastest?",["Cheetah","Elephant","Tortoise"]],["What is 5 + 4?",["9","8","10"]],["Where does a fish live?",["In the water","In a tree","In the ground"]],
       ["Which shape has three corners?",["Triangle","Circle","Square"]],["Which season comes after winter?",["Spring","Summer","Autumn"]],["What does a bee make?",["Honey","Milk","Cheese"]],["How many wheels does a bike have?",["2","3","4"]],
       ["Which animal has a trunk?",["Elephant","Giraffe","Lion"]],["What colour is a banana?",["Yellow","Red","Blue"]],["What is 10 − 3?",["7","6","8"]],["What do you need to see?",["Eyes","Ears","Nose"]],
       ["Which animal sleeps all winter?",["Hedgehog","Dog","Chicken"]],["What falls from the sky when it rains?",["Water","Sand","Sweets"]],["How many months are in a year?",["12","10","7"]],["Which animal spins a web?",["Spider","Ant","Butterfly"]],
       ["Where are the most books?",["Library","Bakery","Swimming pool"]],["Which is the biggest?",["The sun","The moon","The earth"]],["Which number comes after 19?",["20","18","21"]],["What does a chick hatch from?",["An egg","A flower","An apple"]]]}}[L];
var GAMES=["quiz","snoep","blok","memo","mol","anders","kleur"];
var H=null,box=null,busy=false,hud=null,lastToast=0;
function fill(s,v){return String(s).replace(/\{(\w+)\}/g,function(m,k){return v[k]!=null?v[k]:m})}
function rng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function shuf(a,r){a=a.slice();r=r||Math.random;for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function buzz(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
var AC=null;function beep(f,d){try{if(MW.Walk&&MW.Walk.sound&&!MW.Walk.sound())return;AC=AC||new(window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.type="triangle";o.frequency.value=f;g.gain.value=.07;g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function toast(t){if(MW.Walk&&MW.Walk.toast)MW.Walk.toast(t)}

/* ---------- plekken ---------- */
function count(n){return n<=5?4:n>=11?8:6}
function make(G){if(!G||!G.st||!G.st.length||G.bx)return;
  /* looproute vanaf de start: steeds de dichtstbijzijnde plek */
  var left=G.st.slice(),cur={x:0,y:0},seg=[];while(left.length){var bi=0,bd=1e12;left.forEach(function(s,i){var d=Math.hypot(s.x-cur.x,s.y-cur.y);if(d<bd){bd=d;bi=i}});var nx=left.splice(bi,1)[0];seg.push([cur,nx,bd]);cur=nx}
  var long=seg.filter(function(s){return s[2]>=100}),want=Math.min(count(G.st.length),long.length),r=rng((G.seed||1)*31+7),pick=[];
  if(!want){G.bx=[];return}
  /* gelijk verdeeld over de route */
  for(var i=0;i<want;i++)pick.push(long[Math.floor((i+.5)*long.length/want)]);
  var gs=shuf(GAMES,r);
  G.bx=pick.map(function(s,i){var f=.45+r()*.1;return{x:Math.round(s[0].x+(s[1].x-s[0].x)*f),y:Math.round(s[0].y+(s[1].y-s[0].y)*f),g:gs[i%gs.length],done:false,bonus:true,id:i}})}
function list(){var G=H&&H.G();return G&&G.bx?G.bx:[]}
function stars(){return list().filter(function(b){return b.done}).length}

/* ---------- aanmelden en volgen ---------- */
function attach(o){H=o;if(!attach.t)attach.t=setInterval(tick,700)}
function playing(){var p=$("#play");return p&&!p.hidden}
function tick(){if(!H||busy)return;var G=H.G();if(!G||!G.st||!playing()){if(hud)hud.hidden=true;return}
  var m=H.mode&&H.mode();if(m==="street"){if(hud)hud.hidden=true;return}
  if(!G.bx)make(G);var bx=list();ui(bx);if(!bx.length)return;
  var sh=$("#sheet");if(sh&&!sh.hidden)return;
  var p=H.P(),acc=Math.min((p&&p.acc)||0,60),here=bx.filter(function(b){return !b.done&&Math.hypot(b.x-p.x,b.y-p.y)<=Math.max(40,acc)})[0];
  if(here)open(here)}
function ui(bx){if(!hud){css();hud=document.createElement("button");hud.type="button";hud.id="mmBxHud";hud.onclick=function(){var b=list(),n=b.filter(function(x){return !x.done}).length,p=H.P(),nb=null,nd=1e9;b.forEach(function(x){if(x.done)return;var d=Math.hypot(x.x-p.x,x.y-p.y);if(d<nd){nd=d;nb=x}});toast(nb?fill(X.near,{d:Math.round(nd)}):X.got)};var pl=$("#play");if(pl)pl.appendChild(hud)}
  hud.hidden=!bx.length;hud.innerHTML="⭐ <b>"+bx.filter(function(b){return b.done}).length+"</b>/"+bx.length}
/* in de proefronde: tik op een bonusstop op de kaart = erheen lopen */
function tapAt(b){if(!H)return;var m=H.mode&&H.mode();if(m==="demo"&&H.go&&!b.done){H.go(b);toast(X.goDemo)}else{var p=H.P();toast(b.done?X.name+" ✓":fill(X.near,{d:Math.round(Math.hypot(b.x-p.x,b.y-p.y))}))}}

/* ---------- tekenen (verhaalkaart en echte kaart) ---------- */
function glyph(g,x,y,s,done,t,still){var bob=still||done?0:Math.sin(t/380)*s*.12;g.save();g.translate(x,y-bob);
  g.fillStyle="rgba(0,0,0,.22)";g.beginPath();g.ellipse(0,s*.62+bob,s*.5,s*.14,0,0,7);g.fill();
  if(!done&&!still){var ph=(t/1600)%1;g.strokeStyle="rgba(255,215,64,"+(.8*(1-ph))+")";g.lineWidth=s*.08;g.beginPath();g.arc(0,0,s*(.62+ph*.6),0,7);g.stroke()}
  g.fillStyle=done?"#c9c2b0":"#ffd23f";g.strokeStyle=done?"#8e8676":"#c27c00";g.lineWidth=s*.08;g.beginPath();
  for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,r=i%2?s*.26:s*.58;i?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke();
  if(done){g.strokeStyle="#fff";g.lineWidth=s*.1;g.beginPath();g.moveTo(-s*.18,0);g.lineTo(-s*.04,s*.14);g.lineTo(s*.2,-s*.14);g.stroke()}
  else{g.fillStyle="#7a4a00";g.beginPath();g.arc(-s*.1,-s*.04,s*.04,0,7);g.arc(s*.1,-s*.04,s*.04,0,7);g.fill();g.strokeStyle="#7a4a00";g.lineWidth=s*.05;g.beginPath();g.arc(0,s*.03,s*.1,.2,Math.PI-.2);g.stroke()}
  g.restore()}
/* kidsmap: to(q) zet wereldcoördinaten om naar de tekening; sc = schaal van de tekening */
function drawKids(g,to,sc,t,still){var bx=list();if(!bx.length)return;bx.forEach(function(b){var q=to(b);if(!q)return;glyph(g,q.x,q.y-24,Math.max(34,22/Math.max(sc,.2)),b.done,t,still)})}
function hitKids(x,y,to,VT){var bx=list(),hit=null,hd=1e9;bx.forEach(function(b){var q=to(b);if(!q)return;var sx=VT.ox+q.x*VT.sc,sy=VT.oy+(q.y-24)*VT.sc,d=Math.hypot(x-sx,y-sy);if(d<hd){hd=d;hit=b}});
  if(hit&&hd<46){tapAt(hit);return true}return false}
/* echte kaart (walk.js) */
function items(){return list().map(function(b){return{x:b.x,y:b.y,ref:b,bonus:true,tap:true,draw:function(cx,X0,Y0,t,api){glyph(cx,X0,Y0,26,b.done,t,api.still)}}})}

/* ---------- het spelletje ---------- */
function css(){if($("#mmBxCss"))return;var s=document.createElement("style");s.id="mmBxCss";s.textContent=
  "#mmBxHud{position:absolute;left:10px;top:calc(78px + env(safe-area-inset-top,0px));z-index:30;border:0;border-radius:999px;padding:7px 12px;background:#ffd23f;color:#3b2a00;font:700 15px Fredoka,Nunito,system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer}#mmBxHud[hidden]{display:none}"+
  "#mmBx{position:fixed;inset:0;z-index:1000;background:rgba(14,18,40,.72);display:flex;align-items:center;justify-content:center;padding:14px;font-family:Fredoka,Nunito,system-ui,sans-serif}"+
  "#mmBx .bxc{background:#fffaf0;color:#1b2550;border-radius:22px;width:100%;max-width:420px;max-height:96vh;overflow:auto;padding:16px 16px 14px;box-shadow:0 20px 50px rgba(0,0,0,.45);text-align:center;border:4px solid #ffd23f}"+
  "#mmBx .bxk{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#c27c00;font-weight:700}#mmBx h2{margin:2px 0 4px;font-size:24px;line-height:1.15}#mmBx .bxi{margin:0 0 10px;font-size:15px;line-height:1.4;color:#39436a}"+
  "#mmBx .bxs{margin:8px 0 0;font-size:15px;font-weight:700;min-height:20px}#mmBx .bxa{display:flex;gap:8px;margin-top:12px}#mmBx .bxa button{flex:1}"+
  "#mmBx button.bb{appearance:none;border:0;border-radius:14px;padding:12px 10px;font:700 16px Fredoka,Nunito,system-ui,sans-serif;cursor:pointer;background:#ffd23f;color:#3b2a00;box-shadow:0 4px 0 #c27c00}#mmBx button.bb.gh{background:#e8e2d2;color:#39436a;box-shadow:0 4px 0 #c9c0aa}"+
  "#mmBx button.bb:active{transform:translateY(2px);box-shadow:0 2px 0 #c27c00}#mmBx .qa{display:grid;gap:8px}#mmBx .qa button{font-size:18px;padding:14px}#mmBx .qa button.ok{background:#4ade80;box-shadow:0 4px 0 #15803d}#mmBx .qa button.no{background:#fca5a5;box-shadow:0 4px 0 #b91c1c}"+
  "#mmBx .grid{display:grid;gap:5px;margin:0 auto;touch-action:manipulation;user-select:none;-webkit-user-select:none}#mmBx .grid button{appearance:none;border:0;border-radius:10px;background:#efe7d4;font-size:26px;line-height:1;aspect-ratio:1;padding:0;cursor:pointer;transition:transform .12s,background .12s}"+
  "#mmBx .grid button.sel{background:#ffd23f;transform:scale(1.08)}#mmBx .grid button.pop{transform:scale(.2);opacity:.2}#mmBx .grid button.hid{background:#5b44b8;color:transparent}#mmBx .grid button.fnd{background:#bbf7d0}"+
  "#mmBx canvas{display:block;margin:0 auto;background:#1b2550;border-radius:12px;max-width:100%;touch-action:none}#mmBx .ctl{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}#mmBx .ctl button{font-size:22px;padding:12px 0}"+
  "#mmBx .pads{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:280px;margin:0 auto}#mmBx .pads button{aspect-ratio:1;border:0;border-radius:20px;opacity:.55;cursor:pointer;transition:opacity .1s,transform .1s}#mmBx .pads button.on{opacity:1;transform:scale(1.05)}"+
  "#mmBx .win{font-size:64px;line-height:1;margin:6px 0;animation:mmBxPop .5s ease-out}@keyframes mmBxPop{0%{transform:scale(.2) rotate(-30deg)}70%{transform:scale(1.2)}100%{transform:none}}";
  document.head.appendChild(s)}
function open(b){if(busy)return;busy=true;css();buzz([60,40,60]);beep(784,.12);setTimeout(function(){beep(1046,.18)},120);
  var I=X.g[b.g]||X.g.quiz;box=document.createElement("div");box.id="mmBx";box.setAttribute("role","dialog");
  box.innerHTML='<div class="bxc"><div class="bxk">⭐ '+X.name+'</div><h2>'+I[0]+'</h2><p class="bxi">'+I[1]+'</p><div id="bxP"></div><p class="bxs" id="bxS"></p><div class="bxa"><button type="button" class="bb gh" id="bxSkip">'+X.skip+'</button></div></div>';
  document.body.appendChild(box);var stopped=false,cleanup=[];
  var api={box:$("#bxP"),msg:function(t){$("#bxS").textContent=t},good:function(){beep(880,.1);buzz(30)},bad:function(){beep(200,.15);buzz(80)},on:function(f){cleanup.push(f)},alive:function(){return !stopped},r:rng(((H&&H.G()&&H.G().seed)||1)*97+b.id*13),
    win:function(){if(stopped)return;stopped=true;cleanup.forEach(function(f){try{f()}catch(e){}});b.done=true;save();beep(660,.12);setTimeout(function(){beep(880,.12)},110);setTimeout(function(){beep(1175,.25)},220);buzz([80,50,120]);
      $("#bxP").innerHTML='<div class="win">⭐</div>';$("#bxS").textContent=X.got;var a=box.querySelector(".bxa");a.innerHTML='<button type="button" class="bb" id="bxOk">'+X.ok+'</button>';$("#bxOk").onclick=close;ui(list())}};
  $("#bxSkip").onclick=function(){stopped=true;cleanup.forEach(function(f){try{f()}catch(e){}});b.done=true;b.skip=true;save();close()};
  try{(G_[b.g]||G_.quiz)(api)}catch(e){api.win()}}
function close(){if(box)box.remove();box=null;setTimeout(function(){busy=false},1500);ui(list())}
function save(){try{if(H&&H.save)H.save()}catch(e){}}

/* --- de spelletjes --- */
var G_={};
G_.quiz=function(a){var qs=shuf(X.q,a.r).slice(0,3),i=0,good=0;function show(){if(i>=qs.length){return a.win()}var q=qs[i],opts=shuf(q[1],a.r);a.msg(fill(X.round,{n:i+1,m:3}));
  a.box.innerHTML='<p style="font-size:19px;font-weight:700;margin:4px 0 12px">'+q[0]+'</p><div class="qa">'+opts.map(function(o){return'<button type="button" class="bb gh">'+o+'</button>'}).join("")+'</div>';
  [].forEach.call(a.box.querySelectorAll(".qa button"),function(btn){btn.onclick=function(){var ok=btn.textContent===q[1][0];[].forEach.call(a.box.querySelectorAll(".qa button"),function(x){x.disabled=true;if(x.textContent===q[1][0])x.className="bb ok"});if(!ok){btn.className="bb no";a.bad()}else{good++;a.good()}setTimeout(function(){i++;show()},900)}})}show()};
G_.snoep=function(a){var C=["🍬","🍭","🍫","🍩","🍓"],N=6,need=5,moves=18,got=0,b=[],sel=-1,lock=false;
  function rnd(){return C[Math.floor(a.r()*C.length)]}
  for(var i=0;i<N*N;i++){var c;do{c=rnd()}while((i%N>=2&&b[i-1]===c&&b[i-2]===c)||(i>=2*N&&b[i-N]===c&&b[i-2*N]===c));b.push(c)}
  a.box.innerHTML='<div class="grid" style="grid-template-columns:repeat(6,1fr);max-width:330px"></div>';var gr=a.box.firstChild;
  function draw(){gr.innerHTML=b.map(function(c,i){return'<button type="button" data-i="'+i+'"'+(i===sel?' class="sel"':'')+'>'+c+'</button>'}).join("");a.msg(fill(X.rows,{n:got,m:need})+" · "+fill(X.moves,{n:moves}))}
  function matches(){var m={};for(var r=0;r<N;r++)for(var c=0;c<N;c++){var i=r*N+c,v=b[i];if(!v)continue;if(c<=N-3&&b[i+1]===v&&b[i+2]===v){var k=c;while(k<N&&b[r*N+k]===v){m[r*N+k]=1;k++}}if(r<=N-3&&b[i+N]===v&&b[i+2*N]===v){var k2=r;while(k2<N&&b[k2*N+c]===v){m[k2*N+c]=1;k2++}}}return Object.keys(m).map(Number)}
  function groups(ms){/* aantal rijtjes: losse groepen */var seen={},n=0;ms.forEach(function(i){if(seen[i])return;n++;var st=[i];while(st.length){var x=st.pop();if(seen[x])continue;seen[x]=1;[x-1,x+1,x-N,x+N].forEach(function(y){if(ms.indexOf(y)>=0&&!seen[y]&&(Math.abs(y-x)===N||Math.floor(y/N)===Math.floor(x/N)))st.push(y)})}});return n}
  function settle(){var ms=matches();if(!ms.length){lock=false;draw();if(got>=need)return a.win();if(moves<=0){a.msg(X.oops);moves=12;setTimeout(draw,900)}return}
    got+=groups(ms);a.good();[].forEach.call(gr.children,function(x){if(ms.indexOf(+x.dataset.i)>=0)x.classList.add("pop")});
    setTimeout(function(){ms.forEach(function(i){b[i]=null});for(var c=0;c<N;c++){var col=[];for(var r=N-1;r>=0;r--)if(b[r*N+c])col.push(b[r*N+c]);for(r=N-1;r>=0;r--){var v=col.shift();b[r*N+c]=v||rnd()}}draw();setTimeout(settle,260)},260)}
  gr.onclick=function(e){var t=e.target.closest("button");if(!t||lock)return;var i=+t.dataset.i;if(sel<0){sel=i;draw();return}
    var adj=(Math.abs(i-sel)===1&&Math.floor(i/N)===Math.floor(sel/N))||Math.abs(i-sel)===N;if(!adj){sel=i;draw();return}
    var x=b[i];b[i]=b[sel];b[sel]=x;var s0=sel;sel=-1;if(matches().length){moves--;lock=true;draw();setTimeout(settle,180)}else{x=b[i];b[i]=b[s0];b[s0]=x;a.bad();draw()}};
  draw()};
G_.blok=function(a){var W=8,Hh=13,cs=26,need=2,lines=0,grid=[],P=null,tm=null,fallMs=650;for(var r=0;r<Hh;r++)grid.push(new Array(W).fill(0));
  var SH=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0],[1,0],[1,1]],[[0,1],[0,1],[1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]],COL=["#6ec3ff","#ffd23f","#c084fc","#fb923c","#60a5fa","#4ade80","#f87171"];
  a.box.innerHTML='<canvas width="'+W*cs+'" height="'+Hh*cs+'"></canvas><div class="ctl"><button type="button" class="bb gh" data-k="l">◀</button><button type="button" class="bb gh" data-k="r">⟳</button><button type="button" class="bb gh" data-k="d">⬇</button><button type="button" class="bb gh" data-k="R">▶</button></div>';
  var cv=a.box.querySelector("canvas"),g=cv.getContext("2d");
  function newP(){var k=Math.floor(a.r()*SH.length);P={m:SH[k].map(function(r){return r.slice()}),c:k+1,x:Math.floor(W/2)-1,y:0};if(hit(P.m,P.x,P.y)){for(var r=0;r<Hh;r++)grid[r].fill(0);helpers();a.msg(X.oops)}}
  function hit(m,x,y){for(var r=0;r<m.length;r++)for(var c=0;c<m[r].length;c++)if(m[r][c]){var gx=x+c,gy=y+r;if(gx<0||gx>=W||gy>=Hh||(gy>=0&&grid[gy][gx]))return true}return false}
  function rot(m){return m[0].map(function(_,c){return m.map(function(r){return r[c]}).reverse()})}
  function lock(){P.m.forEach(function(r,ri){r.forEach(function(v,ci){if(v&&P.y+ri>=0)grid[P.y+ri][P.x+ci]=P.c})});var cl=0;for(var r=Hh-1;r>=0;r--){if(grid[r].every(Boolean)){grid.splice(r,1);grid.unshift(new Array(W).fill(0));cl++;r++}}
    if(cl){lines+=cl;a.good()}msg();if(lines>=need){stop();return a.win()}newP()}
  function step(){if(!a.alive())return stop();if(!hit(P.m,P.x,P.y+1))P.y++;else lock();draw()}
  function draw(){g.fillStyle="#1b2550";g.fillRect(0,0,cv.width,cv.height);g.strokeStyle="rgba(255,255,255,.06)";for(var x=0;x<=W;x++){g.beginPath();g.moveTo(x*cs,0);g.lineTo(x*cs,cv.height);g.stroke()}
    var cell=function(x,y,c){g.fillStyle=COL[c-1];g.fillRect(x*cs+1,y*cs+1,cs-2,cs-2);g.fillStyle="rgba(255,255,255,.3)";g.fillRect(x*cs+2,y*cs+2,cs-4,5)};
    grid.forEach(function(r,y){r.forEach(function(v,x){if(v)cell(x,y,v)})});if(P)P.m.forEach(function(r,ri){r.forEach(function(v,ci){if(v)cell(P.x+ci,P.y+ri,P.c)})})}
  /* de onderste rijen staan al bijna vol: zo lukt het ook voor de kleintjes */
  function helpers(){for(var r=Hh-2;r<Hh;r++){var gap=Math.floor(a.r()*W);for(var c=0;c<W;c++)grid[r][c]=c===gap||(c===(gap+1)%W&&r===Hh-2)?0:1+Math.floor(a.r()*7)}}helpers();
  function msg(){a.msg(fill(X.lines,{n:Math.min(lines,need),m:need}))}
  function stop(){clearInterval(tm)}
  a.box.querySelector(".ctl").onclick=function(e){var k=(e.target.closest("button")||{}).dataset;if(!k||!P)return;k=k.k;if(k==="l"&&!hit(P.m,P.x-1,P.y))P.x--;else if(k==="R"&&!hit(P.m,P.x+1,P.y))P.x++;else if(k==="r"){var m=rot(P.m);if(!hit(m,P.x,P.y))P.m=m;else if(!hit(m,P.x-1,P.y)){P.m=m;P.x--}}else if(k==="d"){while(!hit(P.m,P.x,P.y+1))P.y++;lock()}draw()};
  newP();draw();msg();tm=setInterval(step,fallMs);a.on(stop)};
G_.memo=function(a){var E=shuf(["🐶","🐱","🦊","🐸","🐵","🦄","🐙","🐝"],a.r).slice(0,6),cards=shuf(E.concat(E),a.r),open=[],found=0,lock=false;
  a.box.innerHTML='<div class="grid" style="grid-template-columns:repeat(4,1fr);max-width:300px"></div>';var gr=a.box.firstChild;
  gr.innerHTML=cards.map(function(c,i){return'<button type="button" class="hid" data-i="'+i+'">'+c+'</button>'}).join("");a.msg(fill(X.pairs,{n:0,m:E.length}));
  gr.onclick=function(e){var t=e.target.closest("button");if(!t||lock||!t.classList.contains("hid"))return;t.classList.remove("hid");open.push(t);
    if(open.length===2){lock=true;if(open[0].textContent===open[1].textContent){open.forEach(function(x){x.classList.add("fnd")});found++;a.good();open=[];lock=false;a.msg(fill(X.pairs,{n:found,m:E.length}));if(found===E.length)setTimeout(a.win,500)}
      else setTimeout(function(){open.forEach(function(x){x.classList.add("hid")});open=[];lock=false},800)}}};
G_.mol=function(a){var need=10,hits=0,cur=-1,tm=null;a.box.innerHTML='<div class="grid" style="grid-template-columns:repeat(3,1fr);max-width:270px"></div>';var gr=a.box.firstChild;
  gr.innerHTML=[0,1,2,3,4,5,6,7,8].map(function(i){return'<button type="button" data-i="'+i+'">🕳️</button>'}).join("");a.msg(fill(X.hits,{n:0,m:need}));
  function next(){if(!a.alive())return clearTimeout(tm);if(cur>=0)gr.children[cur].textContent="🕳️";var n;do{n=Math.floor(a.r()*9)}while(n===cur);cur=n;gr.children[cur].textContent="🐹";tm=setTimeout(next,Math.max(700,1300-hits*50))}
  gr.onclick=function(e){var t=e.target.closest("button");if(!t)return;if(+t.dataset.i===cur){hits++;a.good();t.textContent="💥";cur=-1;clearTimeout(tm);a.msg(fill(X.hits,{n:hits,m:need}));if(hits>=need)return setTimeout(a.win,300);tm=setTimeout(next,350)}};
  tm=setTimeout(next,600);a.on(function(){clearTimeout(tm)})};
G_.anders=function(a){var P=[["🐶","🐱"],["🍎","🍐"],["🚗","🚲"],["🌻","🌷"],["🐟","🐢"],["🍦","🍩"],["⚽","🏀"],["🐸","🐵"]],R=4,rd=0;
  function show(){if(rd>=R)return a.win();var pr=shuf(P,a.r)[0],n=rd<2?9:16,odd=Math.floor(a.r()*n),cols=n===9?3:4;a.msg(fill(X.round,{n:rd+1,m:R}));
    a.box.innerHTML='<div class="grid" style="grid-template-columns:repeat('+cols+',1fr);max-width:'+(cols*72)+'px"></div>';var gr=a.box.firstChild;
    var arr=[];for(var i=0;i<n;i++)arr.push(i===odd?pr[1]:pr[0]);gr.innerHTML=arr.map(function(c,i){return'<button type="button" data-i="'+i+'" style="font-size:32px">'+c+'</button>'}).join("");
    gr.onclick=function(e){var t=e.target.closest("button");if(!t)return;if(+t.dataset.i===odd){a.good();t.classList.add("fnd");rd++;gr.onclick=null;setTimeout(show,500)}else{a.bad();t.classList.add("sel");setTimeout(function(){t.classList.remove("sel")},300)}}}show()};
G_.kleur=function(a){var C=["#ef4444","#3b82f6","#22c55e","#facc15"],F=[330,440,550,660],seq=[],pos=0,len=3,lock=true,tms=[];
  a.box.innerHTML='<div class="pads">'+C.map(function(c,i){return'<button type="button" data-i="'+i+'" style="background:'+c+'" aria-label="'+(i+1)+'"></button>'}).join("")+'</div>';var pads=a.box.querySelectorAll(".pads button");
  function flash(i,d){pads[i].classList.add("on");beep(F[i],.25);tms.push(setTimeout(function(){pads[i].classList.remove("on")},d||380))}
  function play(){lock=true;a.msg(X.watch);while(seq.length<len)seq.push(Math.floor(a.r()*4));seq.forEach(function(v,k){tms.push(setTimeout(function(){if(a.alive())flash(v)},700+k*650))});tms.push(setTimeout(function(){lock=false;pos=0;a.msg(X.yours)},700+seq.length*650))}
  a.box.querySelector(".pads").onclick=function(e){var t=e.target.closest("button");if(!t||lock)return;var i=+t.dataset.i;flash(i,200);if(i===seq[pos]){pos++;if(pos===seq.length){if(len>=4)return setTimeout(a.win,400);len++;a.good();setTimeout(play,600)}}else{a.bad();a.msg(X.oops);seq=seq.slice(0,0);setTimeout(play,900)}};
  play();a.on(function(){tms.forEach(clearTimeout)})};

MW.Bonus={tap:tapAt,attach:attach,make:make,list:list,stars:stars,drawKids:drawKids,hitKids:hitKids,items:items,open:open,T:X};
})();
