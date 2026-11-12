/* De Erfenis van de Spellenmaker – spel-logica (taalonafhankelijk; alle tekst staat in SM_DATA, data-xx.js).
   Vereist platform.js, catalog.js, tiles.js, plan.js, walk.js, steps.js, data-xx.js, spel-a/b/c.js, lens.js en kist.js. three.min.js wordt pas geladen als de speurtocht start.
   Eén vast verhaal in tien vakken, in vaste volgorde (ganzenbord over je eigen buurt). Per vak vier stappen (G.ph):
     0 kaartje + kist in 3D (raadsel)   1 het spel uit de kist → bewijsstuk   2 de lens: schim zoeken → schimmenspel   3 afsluiting + bonusworp
   Vak 10: kist met drie sloten → het verzegelde testament → de aanklacht (vier vragen) → de laatste schim → ontknoping.
   Standen: gps (buiten), in (binnen op stappen), sofa (op de bank: tikken op de getekende kaart), demo (gratis proefronde: de eerste twee vakken).
   Opslag: ss_game_sm_<taal> (lopende speurtocht), ss_ways_sm_<taal> (straten), ss_sm_album (speelstukken, beste sterren per spel; blijft na wissen). */
(function(){
"use strict";
var MW=window.MW,Wk=MW.Walk,LS=MW.LS,D=window.SM_DATA,T=D.T,L=D.lang,esc=MW.esc,fill=MW.fill,GAMES=window.SM_GAMES,LENS=window.SM_LENS,KIST=window.SM_KIST,St=MW.Steps;
var $=function(s){return document.querySelector(s)},$$=function(s){return[].slice.call(document.querySelectorAll(s))};
var ID="sm",GK="ss_game_sm_"+L,WK="ss_ways_sm_"+L,AK="ss_sm_album",SEED=0x5e11e,N=D.CH.length;
var rngOf=Wk.rngOf,shuffle=Wk.shuffle,toast=Wk.toast,sheet=Wk.sheet,buzz=Wk.buzz,closeSheet=Wk.closeSheet;
var G=null,W=[],P={x:0,y:0,acc:0},map=null,sel=null,walkTo=null,arrived=null,lastT=0,inT0=0,INK={kind:"sensor",spm:100};
var WHERE=LS.get("ss_sm_where","out"),R0=+LS.get("ss_sm_r",360)||360;
var QS=new URLSearchParams(location.search);
/* DEV = testsite of lokaal. Daar staat alles open (TEST); live geldt het teamticket. Met ?live in het adres gedraagt de testsite zich als de live site (wel met de console-hulp SM.skip()). */
var DEV=(/(^|\.)github\.io$/.test(location.hostname)&&/^\/test\//.test(location.pathname))||/^(localhost|127\.0\.0\.1)$/.test(location.hostname),TEST=DEV&&!QS.has("live");
function locked(){return !TEST&&MW.pro.locked(ID)}
function album(){var a=LS.get(AK,null)||{};a.pieces=a.pieces||{};a.games=a.games||{};a.done=a.done||0;return a}
function num(n){try{return Math.round(n).toLocaleString(L==="nl"?"nl-NL":"en-GB")}catch(e){return String(Math.round(n))}}
function save(){if(G){G.px=P.x;G.py=P.y;LS.set(GK,G)}}
function tapWalk(){return G&&(G.mode==="demo"||G.mode==="sofa")}

/* ---------- geluid: een klein speeldoosje ---------- */
var AC=null;
function tone(f,t0,d,v,type){try{var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+t0;o.type=type||"triangle";o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0006,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.03)}catch(e){}}
function sfx(n){if(!Wk.sound())return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){return}
  if(n==="tik")tone(900,0,.05,.045,"square");
  else if(n==="klik"){tone(520,0,.05,.08);tone(260,0,.09,.06)}
  else if(n==="goed"){tone(784,0,.16,.09);tone(1175,.08,.26,.09)}
  else if(n==="fout"){tone(196,0,.2,.08,"sawtooth");tone(147,.09,.24,.06,"sawtooth")}
  else if(n==="pop"){tone(660,0,.07,.07);tone(990,.03,.08,.05)}
  else if(n==="munt"){tone(1568,0,.08,.05,"square");tone(2093,.07,.2,.05,"square")}
  else if(n==="win")[1047,1319,1568,2093,1568,2093].forEach(function(f,i){tone(f,i*.11,.55,.08,"sine");tone(f*2,i*.11,.3,.02,"sine")});
  else if(n==="open")[523,659,784,1047,1319].forEach(function(f,i){tone(f,i*.09,1,.07,"sine")})}

/* ---------- three.js pas laden als het nodig is ---------- */
var three=null;
function loadThree(){if(three)return three;three=new Promise(function(res){if(window.THREE)return res(true);var s=document.createElement("script");s.src=MW.root+"games/spellenmaker/three.min.js?v=149";s.onload=function(){res(true)};s.onerror=function(){res(false)};document.head.appendChild(s)});return three}
function need3(cb){if(window.THREE)return cb();var done=false,fin=function(){if(done)return;done=true;Wk.loading("");cb()};Wk.loading(T.three);loadThree().then(fin);setTimeout(fin,14000)}

/* ---------- startscherm ---------- */
function show(id){["home","play"].forEach(function(s){$("#"+s).hidden=s!==id});if(id==="play"&&map)map.resize()}
function whereUi(){$$("#where button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.w===WHERE)});$$("#len button").forEach(function(b){b.setAttribute("aria-pressed",+b.dataset.r===R0)});
  $("#len").hidden=$("#lenL").hidden=WHERE==="sofa";$("#whereNote").textContent=D.WN[WHERE];
  $("#sumT").textContent=(WHERE==="in"?T.sumIn:WHERE==="sofa"?T.sumSofa:T.sumOut)+(WHERE==="sofa"?"":" · "+(R0<=400?T.sumNear:T.sumFar))}
function home(){var lk=locked();$("#bResume").hidden=!LS.get(GK,null);$("#newBox").hidden=!lk;$("#bStart").textContent=(lk?T.lockTag:"")+T.start;
  $("#bPro").hidden=!lk;$("#bPro").textContent=MW.t(L).tBtn+" · "+MW.cfg.team.price;$("#status").textContent=TEST?T.testNote:MW.statusText(L,ID);$("#safe").textContent=D.SAFE;
  whereUi();show("home");hero(true);
  LENS.PIECES.forEach(function(i){GAMES.pic(LENS.pieceFile(i))});["augustus","mathilde","ruben","pien","hugo","odette"].forEach(function(n){GAMES.pic("por-"+n+".webp")})}
$("#where").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;WHERE=b.dataset.w;LS.set("ss_sm_where",WHERE);whereUi()});
$("#len").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;R0=+b.dataset.r;LS.set("ss_sm_r",R0);whereUi()});
$("#sumB").onclick=function(){var s=$("#set");s.hidden=!s.hidden;this.setAttribute("aria-expanded",!s.hidden);this.textContent=s.hidden?D.T.edit+" ▾":D.T.editX+" ▴"};
function proSheet(){sheet(MW.proHTML(L,"team",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');$("#shX").onclick=closeSheet;MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();home();toast(msg)},ID)}
function confirmSheet(title,text,yes,fn){sheet('<h2>'+title+'</h2><p>'+text+'</p><button type="button" class="btn red" id="cfY">'+yes+'</button><button type="button" class="btn ghost dk" id="cfN">'+T.cancel+'</button>',true);$("#cfY").onclick=function(){closeSheet();fn()};$("#cfN").onclick=closeSheet}
/* de oefenwereld van de wandelmotor heeft Engelse straatnamen; deze speurtocht geeft ze een eigen naam (D.STREETS) */
function demoW(){var w=Wk.demoWorld(D.DEMO),m=D.STREETS||{};w.ways.forEach(function(x){if(x.n&&m[x.n])x.n=m[x.n]});return w}
/* "nog zo ver": binnen in stappen, anders in meters */
function awayT(i){var d=dTo(G.st[i]);return G.mode==="in"?fill(T.radarIn,{n:i+1,d:num(Math.ceil(d/G.in.sl))}):fill(T.radar,{n:i+1,d:Math.round(d)})}
function begin(mode){if(LS.get(GK,null))return confirmSheet(T.newH,T.newT,T.newY,function(){LS.del(GK);LS.del(WK);begin(mode)});
  sfx("klik");loadThree();if(mode==="gps")startGps();else if(mode==="in")startIn();else{var w=demoW();build(mode,w.pois,w.ways,null)}}
$("#bStart").onclick=function(){if(locked())return proSheet();begin(WHERE==="in"?"in":WHERE==="sofa"?"sofa":"gps")};
$("#bTrial").onclick=function(){begin("demo")};
if($("#lang"))$("#lang").onclick=function(){MW.switchLang(ID,L==="nl"?"en":"nl")};
$("#bPro").onclick=proSheet;
$("#bResume").onclick=function(){G=LS.get(GK,null);W=LS.get(WK,[]);if(!G)return home();P={x:G.px||0,y:G.py||0,acc:0};loadThree();
  if(G.mode==="in"&&G.in.kind==="sensor")St.ask().then(function(ok){if(!G)return;if(!ok){G.in.kind="tempo";toast(T.inNoSensor)}enter()});else enter()};
$("#bHow").onclick=function(){sheet('<h2>'+T.howH+'</h2><ol class="how">'+D.HOW.map(function(x){return"<li>"+esc(x)+"</li>"}).join("")+'</ol><p class="note">'+esc(D.SAFE)+'</p><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');$("#shX").onclick=closeSheet};
$("#bAlbum").onclick=function(){albumSheet()};$("#bRoom").onclick=function(){roomSheet()};
$("#bWipe").onclick=function(){if(!LS.get(GK,null))return toast(T.wiped);confirmSheet(T.wipeH,T.wipeT,T.wipeY,function(){LS.del(GK);LS.del(WK);home();toast(T.wiped)})};

/* ---------- wereld ophalen ---------- */
function fail(m){Wk.loading("");sheet('<h2>'+T.fail+'</h2><p>'+m+'</p><button type="button" class="btn" id="shX">'+T.back+'</button>');$("#shX").onclick=closeSheet}
function startGps(){Wk.loading(T.loc);
  Wk.locate().then(function(pos){return Wk.fetchWorld({lat:pos.coords.latitude,lon:pos.coords.longitude,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois);if(s==="nomap")toast(T.nomap)}}).then(function(w){
      Wk.loading("");build("gps",w.pois,w.ways,w.origin);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})})
  }).catch(function(e){fail(e==="nogps"?T.noGps:T.denied)})}
function inSheet(cb){var sens=St.supported();
  sheet('<h2>'+T.inH+'</h2><p>'+T.inT+'</p>'+(sens?'<button type="button" class="btn two" id="inS"><b>'+T.inSensor+'</b><small>'+T.inSensorS+'</small></button>':'')+'<button type="button" class="btn two'+(sens?' ghost dk':'')+'" id="inT"><b>'+T.inTempo+'</b><small>'+T.inTempoS+'</small></button><button type="button" class="btn ghost dk" id="shX">'+T.cancel+'</button>');
  $("#shX").onclick=closeSheet;if(sens)$("#inS").onclick=function(){St.ask().then(function(ok){closeSheet();if(!ok)toast(T.inNoSensor);cb(ok?"sensor":"tempo",100)})};
  $("#inT").onclick=function(){closeSheet();cb("tempo",100)}}
function startIn(){inSheet(function(kind,spm){INK={kind:kind,spm:spm};
    var demo=function(){Wk.loading("");var w=demoW();build("in",w.pois,w.ways,null,true);toast(T.inNoLoc)},c=LS.get("ss_map",null);
    if(c&&c.R>=R0&&c.pois&&c.pois.length>=4){build("in",c.pois,c.ways||[],null);return}
    Wk.loading(T.loc);
    Wk.locate().then(function(pos){return Wk.fetchWorld({lat:pos.coords.latitude,lon:pos.coords.longitude,R:R0,status:function(s){if(s==="pois")Wk.loading(T.pois)}}).then(function(w){
        if(!w.pois.length)return demo();Wk.loading("");build("in",w.pois,w.ways,null);var mine=G;w.later.then(function(ways){if(ways&&G&&G===mine){W=ways;LS.set(WK,W)}})})}).catch(demo)})}
/* volgorde van de vakken: steeds de dichtstbijzijnde, daarna kruisingen eruit halen (2-opt) */
function orderRoute(a){var left=a.slice(),out=[],x=0,y=0;while(left.length){var bi=0,bd=1e9;left.forEach(function(s,i){var d=Math.hypot(s.x-x,s.y-y);if(d<bd){bd=d;bi=i}});var s=left.splice(bi,1)[0];out.push(s);x=s.x;y=s.y}
  var pts=[{x:0,y:0}].concat(out),n=pts.length,d=function(i,j){return Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y)},imp=true,it=0;
  while(imp&&it++<40){imp=false;for(var i=1;i<n-1;i++)for(var j=i+1;j<n;j++){var bf=d(i-1,i)+(j+1<n?d(j,j+1):0),af=d(i-1,j)+(j+1<n?d(i,j+1):0);if(af<bf-1){var seg=pts.slice(i,j+1).reverse();for(var k=0;k<seg.length;k++)pts[i+k]=seg[k];imp=true}}}
  return pts.slice(1)}
function tourLen(st){var x=0,y=0,t=0;st.forEach(function(s){t+=Math.hypot(s.x-x,s.y-y);x=s.x;y=s.y});return t}
function build(mode,pois,ways,origin,wide){var R=tapWalkMode(mode)||wide?620:R0,   /* wide: de getekende oefenwereld, daar liggen de plekken verder uit elkaar (binnen telt toch het aantal stappen, niet de afstand) */
  r=rngOf(SEED),spots=Wk.pickSpots(pois,ways,R,N,r,T.corner);
  while(spots.length<N){var a=r()*6.283,dd=R*(.35+.6*r());spots.push({x:Math.round(Math.cos(a)*dd),y:Math.round(Math.sin(a)*dd),type:"hoek",name:""})}
  var st=orderRoute(spots).map(function(p){return{x:p.x,y:p.y,type:p.type,name:p.name||D.TYPES[p.type]||D.TYPES.hoek}});
  var r2=rngOf(SEED^0x9e3779b9),ids=shuffle(LENS.PIECES.slice(0,11),r2),pc=[];
  [1,2,4,5,7,8].forEach(function(i,n){var a=st[i-1],b=st[i],f=.35+.3*r2(),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,off=(r2()<.5?-1:1)*(28+r2()*40);
    pc.push({x:Math.round(a.x+dx*f-dy/len*off),y:Math.round(a.y+dy*f+dx/len*off),id:r2()<.08?"kroon":ids[n],done:false})});
  G={v:1,mode:mode,R:R,st:st,pc:pc,ch:0,ph:0,at:-1,stars:[],fiches:10,t0:Date.now(),dist:0,tries:0,cam:LS.get("ss_sm_cam","ask"),origin:origin,px:0,py:0,trial:mode==="demo",pro:false};
  if(mode==="in")G.in={kind:INK.kind,spm:INK.spm,steps:0,sl:Math.max(.25,Math.min(3,tourLen(st)/(R0<=400?2600:3900))),pause:false};
  W=ways;P={x:0,y:0,acc:0};LS.set(WK,W);save();enter(true);prologue()}
function tapWalkMode(m){return m==="demo"||m==="sofa"}

/* ---------- toneel: één schermvullende laag voor kisten, spellen en kaartjes ---------- */
var stg={cur:null,hintFn:null,skipFn:null,onX:null};
function stF(){var n=G?G.fiches:"";$("#stF").textContent=n;$("#stF").hidden=!G;if(G)$("#hF").textContent=n}
function stClear(){if(stg.cur){try{stg.cur.stop()}catch(e){}stg.cur=null}var b=$("#stBody");b.onclick=null;b.innerHTML="";b.className="";$("#stS").textContent="";setHint(null);setSkip(null)}
function openStage(title){$("#stage").hidden=false;$("#stT").textContent=title;stF()}
function closeStage(){stClear();stg.onX=null;$("#stage").hidden=true}
function stCard(html){stClear();var b=$("#stBody");b.className="scroll";b.innerHTML='<div class="smCard">'+html+'</div>';b.scrollTop=0;return b}
function setHint(fn){stg.hintFn=fn;$("#stH").hidden=!fn}
function setSkip(fn){stg.skipFn=fn;$("#stSkip").hidden=!(fn&&TEST)}
$("#stH").onclick=function(){if(stg.hintFn)stg.hintFn()};
$("#stSkip").onclick=function(){if(stg.skipFn)stg.skipFn()};
$("#stX").onclick=function(){if(stg.onX){var f=stg.onX;closeStage();f();return}closeStage();if(G){save();chip()}};
function pay(n){if(!G)return;G.fiches=Math.max(0,G.fiches-n);stF();save()}
function costT(tpl,n){return fill(tpl,{n:G&&G.fiches>=n?n:"0 ("+T.hintFree+")"})}
function hand(lines,sig){return'<div class="hand">'+lines.map(function(p){return"<p>"+esc(p)+"</p>"}).join("")+(sig?'<span class="sig">'+esc(sig)+'</span>':'')+'</div>'}
function pimg(n,cls){return'<img class="'+(cls||"evPic")+'" src="'+GAMES.IMG+n+'.webp" alt="" decoding="async">'}
function artImg(art){return art==="foto"?pimg("foto"):art==="trap2"?pimg("trap-voor")+pimg("trap-na"):art?pimg(art):""}
function doc(title,ps,art,foot){return'<div class="doc">'+(title?'<h3>'+esc(title)+'</h3>':'')+artImg(art)+ps.map(function(p){return"<p>"+esc(p)+"</p>"}).join("")+(foot?'<div class="foot">'+esc(foot)+'</div>':'')+'</div>'}
function paintArt(root){[].forEach.call(root.querySelectorAll("canvas[data-art]"),function(c){var g=c.getContext("2d"),a=c.dataset.art;if(a==="foto")GAMES.art.foto(g,c.width,c.height);else GAMES.art.drawTrap(g,c.width,c.height,a==="trap1"?1:0)})}
function starsHTML(n){return'<div class="starsRow" aria-label="'+n+'/3">'+[1,2,3].map(function(i){return'<i class="'+(i<=n?"on":"")+'">★</i>'}).join("")+'</div>'}
function dieHTML(v){var P9={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]}[v],h='<div class="die">';for(var i=0;i<9;i++)h+='<i class="'+(P9.indexOf(i)>=0?"p":"")+'"></i>';return h+'</div>'}
var POR={A:"augustus",M:"mathilde",R:"ruben",P:"pien",H:"hugo",O:"odette"};
function portrait(c,who){var g=c.getContext("2d"),w=c.width,h=c.height,im=POR[who]&&GAMES.pic("por-"+POR[who]+".webp",function(){portrait(c,who)});
  if(im){g.clearRect(0,0,w,h);GAMES.cover(g,im,0,0,w,h,.25);return}LENS.lantern(g,w/2,h*.5,Math.min(w,h)*.47,1,function(S){LENS.fig(S.g,S.cx-S.U*.06,S.gy+S.U*1.25,S.U*2.5,who,{t:0})})}
function paintWho(root){[].forEach.call(root.querySelectorAll("canvas[data-who]"),function(c){portrait(c,c.dataset.who)})}
function vakTitle(c){return T.vak+" "+(c+1)+" · "+D.CH[c].name}

/* de kist: raadselkaartje bovenin, de kist eronder */
function kistStage(spec,riddle,hints,done){stClear();var b=$("#stBody"),used=0;
  b.innerHTML='<div class="smRiddle" id="rid"><div class="eyebrow"><span>'+T.riddle+'</span><span id="ridL"></span></div><p>'+esc(riddle)+'</p><div id="ridH"></div></div><div class="smHost gl" id="host"></div><div class="smTip" id="kTip"></div>';
  /* uitleg onder de kist past bij het slot dat je ziet; een slot op de achterkant verklapt zich niet */
  var tip=function(i){var st=spec.stages[i]||{};$("#kTip").textContent=(st.side!==-1&&T.tips&&T.tips[st.type])||T.turnTip};tip(0);
  $("#rid").onclick=function(){this.classList.toggle("min")};
  stg.cur=KIST.open($("#host"),spec,{sfx:sfx,stage:function(i,n){$("#ridL").textContent=n>1?fill(T.lock,{i:i+1,n:n}):"";tip(i)},done:done});
  var showH=function(){$("#ridH").innerHTML=hints.slice(0,used).map(function(x){return'<p class="hintT">'+esc(x)+'</p>'}).join("");$("#rid").classList.remove("min")};
  if(hints)setHint(function(){sheet('<h2>'+T.hintH+'</h2>'+(used<1?'<button type="button" class="btn" id="h1">'+costT(T.hint1,6)+'</button>':'')+(used<2?'<button type="button" class="btn ghost dk" id="h2">'+costT(T.hint2,10)+'</button>':'<p>'+T.noHint+'</p>')+'<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
    $("#shX").onclick=closeSheet;if($("#h1"))$("#h1").onclick=function(){pay(6);used=1;closeSheet();showH()};if($("#h2"))$("#h2").onclick=function(){pay(10);used=2;closeSheet();showH()}});
  setSkip(function(){if(stg.cur&&stg.cur.solve)stg.cur.solve()})}
/* een spel spelen; done({stars}) of done({fail:true}) */
function playGame(key,opt,done,rules){var go=function(){stClear();$("#stBody").innerHTML='<div class="smHost" id="host"></div>';
    var o={seed:1,lvl:1,T:D.G,sfx:sfx,status:function(t){$("#stS").textContent=t},done:done},k;for(k in opt)o[k]=opt[k];
    stg.cur=GAMES[key]($("#host"),o);
    setHint(function(){sheet('<h2>'+T.hintH+'</h2><button type="button" class="btn" id="h1">'+costT(T.hintGame,6)+'</button>'+(rules?'<p class="note">'+esc(rules)+'</p>':'')+'<button type="button" class="btn ghost dk" id="h3">'+T.skipGame+'</button><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
      $("#shX").onclick=closeSheet;$("#h1").onclick=function(){closeSheet();if(stg.cur&&stg.cur.hint&&stg.cur.hint())pay(6);else toast(T.noHint)};$("#h3").onclick=function(){closeSheet();done({stars:0,skip:true})}});
    setSkip(function(){if(stg.cur&&stg.cur.auto)stg.cur.auto()})};
  if(key==="kogel")need3(go);else go()}

/* ---------- proloog ---------- */
function prologue(){openStage(T.title);need3(function(){kistStage({no:0,stages:[{type:"tap"}]},D.PRO.kist,null,function(){sfx("win");
    stCard(doc(null,D.PRO.letter,D.PRO.letterArt)+'<button type="button" class="btn" id="go">'+T.next+'</button>');
    $("#go").onclick=function(){stCard((D.PRO.cardArt?pimg(D.PRO.cardArt):"")+hand(D.PRO.card.slice(0,-1),D.PRO.card[D.PRO.card.length-1])+'<button type="button" class="btn" id="go">'+T.next+'</button>');
      $("#go").onclick=function(){var b=stCard('<h2>'+D.PRO.susH+'</h2><p>'+D.PRO.susT+'</p><div class="susRow">'+D.SUS.slice(0,5).map(function(s){return'<div><canvas data-who="'+s.k+'" width="128" height="160"></canvas>'+esc(s.n.split(" ")[0])+'</div>'}).join("")+'</div><button type="button" class="btn" id="go">'+D.PRO.go+'</button>');paintWho(b);
        $("#go").onclick=function(){G.pro=true;save();closeStage();chip();toast(tapWalk()?T.demoTip:awayT(0))}}}})})}

/* ---------- een vak spelen ---------- */
function vakGo(){var c=G.ch;if(c>=N)return;if(trialOver())return paywall();if(!G.pro)return prologue();G.at=c;save();openStage(vakTitle(c));
  if(G.ph===0)vakCard(c);else if(G.ph===1)gameIntro(c);else if(G.ph===2)lensIntro(c);else outro(c)}
function vakCard(c){var C=D.CH[c];stCard('<div class="eyebrow">'+esc(vakTitle(c))+'</div>'+hand(C.card)+'<button type="button" class="btn" id="go">'+T.toKist+'</button>');
  $("#go").onclick=function(){need3(function(){var sp={no:c+1,stages:C.kist.stages};kistStage(sp,C.card.slice(1).join(" "),C.hints,function(){G.ph=1;save();sfx("win");gameIntro(c)})})}}
function gameIntro(c){var C=D.CH[c];if(!C.game)return evCard(c);
  stCard('<div class="eyebrow">'+T.inKist+'</div><h2>'+esc(D.GN[C.game])+'</h2><p>'+esc(C.gameT)+'</p><button type="button" class="btn" id="go">'+T.play+'</button>');
  var n=0,run=function(){var o={},k;for(k in C.gopt)o[k]=C.gopt[k];if(n&&C.game==="knikkers"){o.seed=(o.seed||1)+n*17;o.moves=25+3*n}playGame(C.game,o,function(res){gameDone(c,res,function(){n++;run()})},C.gameT)};
  $("#go").onclick=run}
function gameDone(c,res,again){var C=D.CH[c];
  if(res.fail){stCard('<h2>'+T.failH+'</h2><p>'+T.failT+'</p><button type="button" class="btn" id="go">'+T.again+'</button><button type="button" class="btn ghost" id="sk">'+T.skipGame+'</button>');$("#go").onclick=again;$("#sk").onclick=function(){gameDone(c,{stars:0},again)};return}
  var st=res.stars||0,gain=st*3;G.stars[c]=Math.max(G.stars[c]||0,st);G.fiches+=gain;G.ph=2;save();stF();
  var a=album();a.games[C.game]=Math.max(a.games[C.game]||0,st);LS.set(AK,a);
  stCard(starsHTML(st)+'<h2>'+T.stars[st]+'</h2>'+(gain?'<span class="gain">'+fill(T.fich,{n:gain})+'</span>':'')+'<button type="button" class="btn" id="go">'+T.next+'</button>');if(st)sfx("munt");
  $("#go").onclick=function(){evCard(c)}}
function evCard(c){var C=D.CH[c],b=stCard('<div class="eyebrow">'+T.evH+'</div>'+doc(C.ev.t,C.ev.p,C.ev.art)+(c<N-1?'<p class="note" style="text-align:center">'+T.evAdd+'</p>':'')+'<button type="button" class="btn" id="go">'+T.next+'</button>');paintArt(b);
  $("#go").onclick=function(){if(c===N-1)verdict();else lensIntro(c)}}
function lensIntro(c){stCard('<div class="eyebrow">'+esc(vakTitle(c))+'</div><h2>'+T.lensH+'</h2><p>'+(c===N-1?D.T.lensLast:T.lensT)+'</p><button type="button" class="btn" id="go">'+T.lensGo+'</button>');$("#go").onclick=function(){lensGo(c)}}
function withCam(run){var can=navigator.mediaDevices&&navigator.mediaDevices.getUserMedia;
  if(G.cam==="ask"&&can){sheet('<h2>'+T.camH+'</h2><p>'+T.camT+'</p><button type="button" class="btn" id="cy">'+T.camYes+'</button><button type="button" class="btn ghost dk" id="cn">'+T.camNo+'</button>',true);
    $("#cy").onclick=function(){G.cam="on";LS.set("ss_sm_cam","on");save();closeSheet();run(true)};$("#cn").onclick=function(){G.cam="off";LS.set("ss_sm_cam","off");save();closeSheet();run(false)}}
  else run(G.cam==="on"&&!!can)}
function camDenied(ok){if(!ok&&G&&G.cam==="on"){G.cam="off";save()}}
function lensGo(c){var C=D.CH[c];withCam(function(cam){LENS.run({kind:"schim",cam:cam,T:D.LT,sfx:sfx,title:C.lensTitle,scene:"v"+(c+1),caps:C.lens,who:C.who,onCam:camDenied,
    onDone:function(){G.ph=3;G.fiches+=5;save();stF();sfx("munt");outro(c)},onCancel:function(){toast(T.lensBack)}})})}
function outro(c){var C=D.CH[c];if(c===N-1)return epilogue();
  stCard('<div class="eyebrow">'+esc(vakTitle(c))+'</div>'+hand(C.out,"A.")+'<div class="eyebrow">'+T.bonusH+'</div><p id="bt">'+T.bonusT+'</p><div class="diceRow" id="dr">'+dieHTML(5)+dieHTML(2)+'</div><button type="button" class="btn" id="go">'+T.roll+'</button>');
  var rolled=false;$("#go").onclick=function(){if(rolled)return nextVak();rolled=true;var bt=this;bt.disabled=true;$$("#dr .die").forEach(function(d){d.classList.add("roll")});sfx("tik");
    setTimeout(function(){if(!G)return;var a=1+Math.floor(Math.random()*6),b=1+Math.floor(Math.random()*6),n=(a+b)*(a===b?2:1);$("#dr").innerHTML=dieHTML(a)+dieHTML(b);G.fiches+=n;save();stF();sfx(a===b?"win":"munt");
      $("#bt").textContent=fill(a===b?T.dbl:T.rolled,{a:a,b:b,n:n});bt.disabled=false;bt.textContent=T.toMap},900)}}
/* de proefronde stopt na twee vakken; wie daarna geen ticket heeft, komt op geen enkele manier verder (ook niet via "Ga verder") */
function trialOver(){return !!G&&G.trial&&G.ch>=2&&G.ch<N&&locked()}
function paywall(){sheet('<h2>'+T.trialEndH+'</h2><p>'+T.trialEndT+'</p>'+MW.proHTML(L,"team",ID)+'<button type="button" class="btn ghost dk" id="shX">'+T.back+'</button>',true);
  $("#shX").onclick=function(){closeSheet();quit(true)};MW.bindPro($("#sheetBody"),L,function(r,msg){closeSheet();toast(msg);if(G)chip()},ID)}
function nextVak(){G.ch++;G.ph=0;G.at=-1;G.force=null;save();closeStage();sel=null;arrived=null;
  if(trialOver())return paywall();
  chip();toast(awayT(G.ch))}

/* ---------- de aanklacht en het slot ---------- */
function verdict(){var pick=[],b=stCard('<div class="eyebrow">'+esc(vakTitle(N-1))+'</div><h2>'+T.vH+'</h2><p>'+T.vT+'</p>'+D.V.map(function(q,qi){return'<div class="qBlock" data-q="'+qi+'"><b>'+esc(q.q)+'</b>'+q.o.map(function(o,oi){return'<button type="button" data-o="'+oi+'" aria-pressed="false">'+esc(o)+'</button>'}).join("")+'</div>'}).join("")+'<p class="warn" id="vMsg"></p><button type="button" class="btn red" id="vGo">'+T.vGo+'</button>');
  b.onclick=function(e){var bt=e.target.closest(".qBlock button");if(!bt)return;pick[+bt.parentNode.dataset.q]=+bt.dataset.o;[].forEach.call(bt.parentNode.querySelectorAll("button"),function(x){x.setAttribute("aria-pressed",x===bt)});sfx("tik")};
  setSkip(function(){D.V.forEach(function(q,i){pick[i]=q.a});$("#vGo").click()});
  $("#vGo").onclick=function(){if(D.V.some(function(q,i){return pick[i]==null})){$("#vMsg").textContent=T.vPick;return}
    var ok=0,i;for(i=0;i<3;i++)if(pick[i]===D.V[i].a)ok++;G.tries++;
    if(ok<3){$("#vMsg").textContent=fill(T.vWrong,{n:ok});sfx("fout");buzz(150);save();return}
    G.q4=pick[3]===D.V[3].a;var st=G.tries===1?(G.q4?3:2):G.tries===2?(G.q4?2:1):1;G.stars[N-1]=st;G.ph=2;save();sfx("win");
    stCard(starsHTML(st)+'<h2>'+T.vRight+'</h2><p>'+D.T.lensLast+'</p><button type="button" class="btn" id="go">'+T.lensGo+'</button>');$("#go").onclick=function(){lensGo(N-1)}}}
function epilogue(){openStage(T.endH);stCard(hand(D.END.said)+doc(null,D.END.will)+'<button type="button" class="btn" id="go">'+T.next+'</button>');$("#go").onclick=finish}
function durT(min){var m=Math.max(1,Math.round(min)),h=Math.floor(m/60),r=m%60;return m<60?(m===1?T.endMin1:fill(T.endTime,{m:m})):r?fill(T.endHour,{h:h,m:r}):fill(T.endHour0,{h:h})}
function finish(){var tot=0,i;for(i=0;i<N;i++)tot+=G.stars[i]||0;var min=(Date.now()-G.t0)/60000,km=G.dist/1000,rk=tot>=27?3:tot>=21?2:tot>=14?1:0,pcs=G.pc.filter(function(q){return q.done}).length;
  if(!G.won){G.won=true;var a=album();a.done++;a.best=Math.max(a.best||0,tot);LS.set(AK,a);MW.profile.award({game:ID,xp:150+tot*5,stars:tot>=26?3:tot>=18?2:1,gps:G.mode==="gps",min:min,km:km,title:T.title,code:""});save()}
  sfx("win");stCard('<div class="eyebrow">'+T.endH+'</div>'+starsHTML(tot>=26?3:tot>=18?2:1)+'<h2>'+T.endRank[rk]+'</h2><p>'+fill(T.endStars,{n:tot})+' · '+durT(min)+(G.mode==="gps"?' · '+fill(T.endKm,{k:km.toFixed(1).replace(".",",")}):G.mode==="in"?' · '+fill(T.endSteps,{k:num(G.in.steps)}):'')+' · '+fill(T.endPieces,{n:pcs})+'</p><p>'+(G.q4?T.endQ4ok:T.endQ4no)+'</p><button type="button" class="btn" id="rm">'+T.roomBtn+'</button><button type="button" class="btn ghost" id="go">'+T.endHome+'</button>');
  var end=function(){LS.del(GK);LS.del(WK);quit(false)};$("#go").onclick=end;$("#rm").onclick=function(){end();roomSheet()};stg.onX=end}
function quit(keep){if(LENS.active())LENS.stop();closeStage();closeSheet();if(keep)save();Wk.stopWatch();stopSteps();G=null;home()}

/* ---------- kaart ---------- */
var dTo=function(t){return Math.hypot(t.x-P.x,t.y-P.y)};
function inRange(t){return dTo(t)<=(t.id?45:Math.max(35,Math.min(P.acc||0,60)))||G.force===t}
function target(){return G&&G.ch<N?G.st[G.ch]:null}
function cur(){return sel&&!sel.done?sel:target()}
var VC=["#d6452f","#f2b632","#2f6f9f","#3f9a6a"],MAPFONT="600 12px 'Barlow Condensed','Arial Narrow',sans-serif";
function rrect(cx,x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
function items(){var it=[],c=G.ch;
  it.push({x:0,y:0,tap:false,draw:function(cx,X,Y,t,api){var pts=[{x:0,y:0}].concat(G.st),i,k;
      for(i=1;i<pts.length;i++){var ax=api.sx(pts[i-1].x),ay=api.sy(pts[i-1].y),bx=api.sx(pts[i].x),by=api.sy(pts[i].y),n=Math.floor(Math.hypot(bx-ax,by-ay)/15),seg=i-1;if(n<2)continue;
        cx.fillStyle=seg<c?"rgba(242,182,50,.8)":seg===c?"rgba(243,231,198,"+(api.still?.8:.55+.3*Math.sin(t/300))+")":"rgba(243,231,198,.15)";
        for(k=1;k<n;k++){var px=ax+(bx-ax)*k/n,py=ay+(by-ay)*k/n;cx.fillRect(px-2.5,py-2.5,5,5)}}}});
  G.st.forEach(function(s,i){it.push({x:s.x,y:s.y,ref:s,idx:i,tap:i===c,draw:function(cx,X,Y,t,api){var done=i<c,now=i===c,sz=now?38:30,bob=now&&!api.still?Math.sin(t/420)*3:0;
      cx.save();cx.globalAlpha=done?.55:now?1:.5;if(now&&!api.still){cx.strokeStyle=VC[i%4];cx.globalAlpha=.6-((t/1600)%1)*.6;cx.lineWidth=2;cx.beginPath();cx.arc(X,Y,24+((t/1600)%1)*22,0,7);cx.stroke();cx.globalAlpha=1}
      cx.shadowColor="rgba(0,0,0,.5)";cx.shadowBlur=8;cx.fillStyle=done?"#5b4a30":VC[i%4];rrect(cx,X-sz/2,Y-sz/2-bob,sz,sz,7);cx.fill();cx.shadowBlur=0;cx.strokeStyle="#f3e7c6";cx.lineWidth=2;cx.stroke();
      cx.fillStyle=i%4===1&&!done?"#231709":"#f3e7c6";cx.font="400 "+(now?20:16)+"px 'Abril Fatface',Georgia,serif";cx.textAlign="center";cx.fillText(done?"✓":String(i+1),X,Y+(now?7:6)-bob);
      cx.restore();if(now||sel===s){cx.font=MAPFONT;cx.textAlign="center";cx.shadowColor="#000";cx.shadowBlur=6;cx.fillStyle="#f3e7c6";cx.fillText(String(s.name).toUpperCase().slice(0,28),X,Y+sz/2+16);cx.shadowBlur=0}}})});
  G.pc.forEach(function(q){if(q.done||dTo(q)>240)return;it.push({x:q.x,y:q.y,ref:q,tap:true,draw:function(cx,X,Y,t,api){var bob=api.still?0:Math.sin(t/380)*3,gl=cx.createRadialGradient(X,Y-bob,2,X,Y-bob,26);gl.addColorStop(0,"rgba(255,226,140,"+(api.still?.7:.45+.35*Math.abs(Math.sin(t/300)))+")");gl.addColorStop(1,"rgba(255,226,140,0)");cx.fillStyle=gl;cx.beginPath();cx.arc(X,Y-bob,26,0,7);cx.fill();
      LENS.piece(cx,X,Y-bob,24,q.id,t);if(sel===q){cx.strokeStyle="#f3e7c6";cx.lineWidth=2;cx.setLineDash([3,4]);cx.beginPath();cx.arc(X,Y,22,0,7);cx.stroke();cx.setLineDash([])}}})});
  it.push({x:P.x,y:P.y,tap:false,draw:function(cx,X,Y){cx.save();cx.shadowColor="rgba(0,0,0,.6)";cx.shadowBlur=6;LENS.piece(cx,X,Y-14,30,"pion",0);cx.restore()}});
  return it}
function enter(quiet){show("play");hero(false);["meneer-zet.webp","foto.webp","trap-voor.webp","trap-na.webp"].forEach(function(n){GAMES.pic(n)});
  if(!map)map=Wk.createMap($("#map"),{player:function(){return P},ways:function(){return W},R:function(){return G?G.R:650},
    theme:{bg:"#0f2a24",water:"#0b2330",waterEdge:"#1d4a5a",ripple:"rgba(150,200,210,.14)",park:"#143a2a",parkEdge:"#24573f",river:"#123846",major:"#3f6f60",minor:"#1b3d34",road:"#2a5145",label:"#8fbfae",waterLabel:"#5f9db0",ring:"rgba(242,182,50,.25)",me:"#d6452f",meHalo:"rgba(214,69,47,.14)",meRing:"rgba(214,69,47,.5)",font:MAPFONT},
    items:items,spots:function(){return G?G.st.map(function(s,i){return{x:s.x,y:s.y,ref:s,idx:i}}).filter(function(o){return o.idx===G.ch}):[]},
    onTap:function(hit,w){if(!G)return;if(hit&&hit.ref&&!hit.ref.done){sel=hit.ref;chip()}else if(tapWalk()){walkTo=w;sel=null;map.follow();chip()}else{sel=null;chip()}}});
  map.resize();map.fit(G.R);sel=null;walkTo=null;arrived=null;$("#chip").hidden=true;
  Wk.stopWatch();stopSteps();if(G.mode==="gps")Wk.watch(G.origin,P,function(d){if(d>3&&d<80)G.dist+=d});
  if(G.mode==="in")startSteps();
  var hs=$$("#hud span");T.hud.forEach(function(x,i){if(hs[i])hs[i].textContent=x});
  $$("#bar button")[0].textContent=T.barDos;$$("#bar button")[1].textContent=T.barSus;$$("#bar button")[2].textContent=T.barAlb;
  if(!quiet&&tapWalk())toast(T.demoTip);
  lastT=0;requestAnimationFrame(loop)}
function loop(t){if($("#play").hidden||!G)return;var dt=Math.min(.1,(t-lastT)/1000)||0;lastT=t;
  if(tapWalk()&&walkTo&&$("#stage").hidden){var d=Math.hypot(walkTo.x-P.x,walkTo.y-P.y),step=150*dt;if(d<=step){P.x=walkTo.x;P.y=walkTo.y;G.dist+=d;walkTo=null}else{P.x+=(walkTo.x-P.x)/d*step;P.y+=(walkTo.y-P.y)/d*step;G.dist+=step}}
  if($("#stage").hidden&&!LENS.active())map.draw(t);if(!loop.n||t-loop.n>500){loop.n=t;tick()}requestAnimationFrame(loop)}
function tick(){if(!G)return;var el=Math.floor((Date.now()-G.t0)/1000),tot=0,i;for(i=0;i<N;i++)tot+=G.stars[i]||0;
  $("#hT").textContent=Math.floor(el/60)+":"+String(el%60).padStart(2,"0");$("#hS").textContent=Math.min(N,G.ch+1)+"/"+N;$("#hF").textContent=G.fiches;$("#hD").textContent=tot;
  var t=target(),inn=G.mode==="in",contd=G.at===G.ch&&G.ph>0,rd=$("#radar");
  if(!t)rd.textContent=T.radarAll;else{var d=dTo(t),n=G.ch+1,near=G.pc.some(function(q){return !q.done&&dTo(q)<=240&&dTo(q)>45});
    rd.textContent=contd?fill(T.radarCont,{n:n}):inRange(t)?fill(T.radarHere,{n:n}):(inn?fill(T.radarIn,{n:n,d:num(Math.ceil(d/G.in.sl))}):fill(d<60?T.radarHot:d<160?T.radarWarm:T.radar,{n:n,d:Math.round(d)}))+(near&&d>80?" · "+T.radarPiece:"")}
  if($("#stage").hidden&&$("#sheet").hidden&&!LENS.active()){var cand=(t&&!contd?[t]:[]).concat(G.pc.filter(function(q){return !q.done})),here=cand.filter(inRange)[0];
    if(here&&arrived!==here){arrived=here;sel=here.id?here:null;buzz(inn?[200,80,200]:[80,60,80]);sfx("goed")}if(!here)arrived=null}
  chip();if(el%10===0)save()}
function chip(){var c=$("#chip");if(!G){c.hidden=true;return}var s=cur();if(!s){c.hidden=true;return}
  var piece=!!s.id,d=dTo(s),ok=inRange(s),inn=G.mode==="in",contd=!piece&&G.at===G.ch&&G.ph>0;
  if(!(sel||ok||contd||inn||tapWalk()||d<150)){c.hidden=true;return}c.hidden=false;
  $("#cName").textContent=piece?T.piece:vakTitle(G.ch);
  $("#cDist").textContent=ok||contd?"":inn?num(Math.ceil(d/G.in.sl))+" "+T.inSteps:Math.round(d)+" m";
  $("#cHint").textContent=piece?T.pieceHint:contd?"":inn&&!ok?(G.in.pause?T.inPaused:T.inGoing):fill(T.vakAt,{p:s.name});
  var b=$("#cAct"),cls="btn";b.hidden=false;
  if(contd)b.textContent=fill(T.cont,{n:G.ch+1});else if(ok)b.textContent=piece?T.grab:T.open;else if(inn)b.textContent=G.in.pause?T.inResume:T.inPause;else if(tapWalk())b.textContent=T.walk;
  else if(d<150){b.textContent=T.force;cls="btn ghost dk sm"}else b.hidden=true;   /* noodknop voor een plek waar je niet bij kunt: bewust klein */
  if(b.className!==cls)b.className=cls}
$("#cAct").onclick=function(){var s=cur();if(!s||!G)return;var piece=!!s.id,contd=!piece&&G.at===G.ch&&G.ph>0;
  if(contd||(!piece&&inRange(s)))return vakGo();if(piece&&inRange(s))return pieceGo(s);
  if(G.mode==="in"){G.in.pause=!G.in.pause;chip();return}
  if(tapWalk()){walkTo={x:s.x,y:s.y};map.follow();return}
  if(dTo(s)<150){G.force=s;if(piece)pieceGo(s);else vakGo()}};
function pieceGo(q){withCam(function(cam){LENS.run({kind:"stuk",cam:cam,T:D.LT,sfx:sfx,title:D.PN[q.id],piece:q.id,onCam:camDenied,onCancel:function(){},
    onDone:function(){q.done=true;var n=q.id==="kroon"?10:3,a=album(),nw=!a.pieces[q.id];G.fiches+=n;a.pieces[q.id]=(a.pieces[q.id]||0)+1;LS.set(AK,a);save();sel=null;G.force=null;sfx("munt");stF();toast(fill(T.pieceGot,{p:D.PN[q.id],n:n})+(nw?" · "+T.pieceNew:""))}})})}
$("#zIn").onclick=function(){map.zoom(1.4)};$("#zOut").onclick=function(){map.zoom(1/1.4)};$("#zMe").onclick=function(){map.follow()};
function sndUi(){$("#zS").style.opacity=Wk.sound()?1:.4}sndUi();
$("#zS").onclick=function(){Wk.sound(!Wk.sound());sndUi();sfx("klik")};
$("#zM").onclick=menuSheet;$("#bDos").onclick=function(){dossier("tl")};$("#bSus").onclick=function(){dossier("sus")};$("#bAlb").onclick=function(){albumSheet()};

/* ---------- binnen-stand: lopen op stappen ---------- */
function stepIn(n){if(!G||G.mode!=="in")return;G.in.steps+=n;var t=cur();if(!t||(t===target()&&G.at===G.ch&&G.ph>0))return;var d=dTo(t),m=n*G.in.sl;if(d<=m){P.x=t.x;P.y=t.y;G.dist+=d}else{P.x+=(t.x-P.x)/d*m;P.y+=(t.y-P.y)/d*m;G.dist+=m}}
function startSteps(){inT0=Date.now();G.in.pause=false;
  St.start({mode:G.in.kind,spm:G.in.spm,onStep:stepIn,active:function(){return !!G&&G.mode==="in"&&!$("#play").hidden&&$("#sheet").hidden&&$("#stage").hidden&&!LENS.active()&&!G.in.pause},
    onDead:function(){if(!G||G.mode!=="in")return;G.in.kind="tempo";save();toast(T.inNoSensor);startSteps()}});St.awake(true)}
function stopSteps(){St.stop();St.awake(false)}

/* ---------- dossier ---------- */
function prog(){var ev=[],sh=[];for(var c=0;c<N;c++){if(c<G.ch||(c===G.ch&&G.ph>=2))ev.push(c);if(c<G.ch||(c===G.ch&&G.ph>=3))sh.push(c)}return{ev:ev,sh:sh}}
function tkey(s){var m=String(s).match(/(\d+):(\d+)/),v=m?(+m[1])*60+ +m[2]:0;return /^zo/.test(s)?v+1440:v}
function dossier(tab){var pr=prog(),h='<h2>'+T.dosH+'</h2><div class="tabs">'+[["tl",T.tabTl],["sus",T.tabSus],["ev",T.tabEv]].map(function(x){return'<button type="button" data-tab="'+x[0]+'" aria-pressed="'+(tab===x[0])+'">'+x[1]+'</button>'}).join("")+'</div>';
  if(tab==="tl"){var rows=[];pr.ev.forEach(function(c){D.CH[c].tl.forEach(function(r){rows.push(r)})});pr.sh.forEach(function(c){D.CH[c].ltl.forEach(function(r){rows.push(r)})});rows.sort(function(a,b){return tkey(a[0])-tkey(b[0])});
    h+=rows.length?'<div class="tl">'+rows.map(function(r){return"<b>"+esc(r[0])+"</b><span>"+esc(r[1])+"</span>"}).join("")+'</div>':'<p class="note">'+T.dosEmpty+'</p>'}
  else if(tab==="sus"){var notes={};pr.ev.forEach(function(c){D.CH[c].facts.forEach(function(f){(notes[f[0]]=notes[f[0]]||[]).push(f[1])})});pr.sh.forEach(function(c){D.CH[c].lfacts.forEach(function(f){(notes[f[0]]=notes[f[0]]||[]).push(f[1])})});
    h+=D.SUS.map(function(s){var n=notes[s.k]||[];return'<div class="who"><canvas data-who="'+s.k+'" width="108" height="136"></canvas><b>'+esc(s.n)+(s.a?" ("+s.a+")":"")+'</b><small>'+esc(s.r)+'</small><small>'+esc(s.l)+'</small><ul>'+(n.length?n.map(function(x){return"<li>"+esc(x)+"</li>"}).join(""):'<li class="note">'+T.susNone+'</li>')+'</ul></div>'}).join("")}
  else{h+=pr.ev.length?pr.ev.slice().reverse().map(function(c){var C=D.CH[c],sh=pr.sh.indexOf(c)>=0;return'<div class="evi"><em>'+esc(vakTitle(c))+'</em><b>'+esc(C.ev.t)+'</b>'+(C.ev.art?pimg(C.ev.art==="trap2"?"trap-na":C.ev.art,"evThumb"):'')+C.ev.p.map(function(p){return"<p>"+esc(p)+"</p>"}).join("")+(sh?'<em>'+esc(C.lensTitle)+'</em>'+C.lens.map(function(p){return"<p>"+esc(p)+"</p>"}).join("")+'<button type="button" data-re="'+c+'">'+T.replay+'</button>':'')+'</div>'}).join(""):'<p class="note">'+T.dosEmpty+'</p>'}
  h+='<button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>';var b=sheet(h);paintWho(b);[].forEach.call(b.querySelectorAll(".evThumb"),function(im){im.onclick=function(){im.classList.toggle("big")}});$("#shX").onclick=closeSheet;
  b.onclick=function(e){var t=e.target.closest("[data-tab]"),r=e.target.closest("[data-re]");if(t)dossier(t.dataset.tab);else if(r){var c=+r.dataset.re,C=D.CH[c];closeSheet();LENS.run({kind:"schim",skipHunt:true,T:D.LT,sfx:sfx,title:C.lensTitle,scene:"v"+(c+1),caps:C.lens,onDone:function(){dossier("ev")},onCancel:function(){}})}}}
function pieceCanvases(root){[].forEach.call(root.querySelectorAll("canvas[data-pc]"),function pc(c){var g=c.getContext("2d"),f=LENS.pieceFile(c.dataset.pc);g.clearRect(0,0,c.width,c.height);LENS.piece(g,c.width/2,c.height/2,c.width*.78,c.dataset.pc,0);if(f&&!GAMES.pic(f))GAMES.pic(f,function(){pc(c)})})}
function albumSheet(){var a=album(),ids=LENS.PIECES,n=ids.filter(function(i){return a.pieces[i]}).length;
  var b=sheet('<h2>'+T.albH+'</h2><p>'+T.albT+'</p><p class="note">'+fill(T.albN,{n:n,m:ids.length})+'</p><div class="alb">'+ids.map(function(i){return'<div class="'+(a.pieces[i]?"":"no")+'"><canvas data-pc="'+i+'" width="96" height="96"></canvas>'+(a.pieces[i]?esc(D.PN[i]):"?")+'</div>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  pieceCanvases(b);$("#shX").onclick=closeSheet}

/* ---------- menu ---------- */
function menuSheet(){var camOn=G.cam==="on";
  sheet('<h2>'+T.menu+'</h2><button type="button" class="btn" id="mBack">'+T.mMap+'</button><button type="button" class="btn ghost dk" id="mSnd">'+fill(T.mSnd,{v:Wk.sound()?T.on:T.off})+'</button><button type="button" class="btn ghost dk" id="mCam">'+fill(T.mCam,{v:camOn?T.on:T.off})+'</button>'+(TEST?'<button type="button" class="btn ghost dk" id="mSkip">'+T.mSkip+'</button>':'')+'<button type="button" class="btn ghost dk" id="mStop">'+T.mStop+'</button><button type="button" class="btn ghost dk" id="mWipe">'+T.mWipe+'</button>');
  $("#mBack").onclick=closeSheet;$("#mSnd").onclick=function(){Wk.sound(!Wk.sound());sndUi();menuSheet()};
  $("#mCam").onclick=function(){G.cam=camOn?"off":"on";LS.set("ss_sm_cam",G.cam);save();menuSheet()};
  if(TEST)$("#mSkip").onclick=function(){closeSheet();var t=target();if(t){G.force=t;P.x=t.x;P.y=t.y;vakGo()}};
  $("#mStop").onclick=function(){quit(true)};$("#mWipe").onclick=function(){confirmSheet(T.wipeH,T.wipeT,T.wipeY,function(){LS.del(GK);LS.del(WK);quit(false);toast(T.wiped)})}}

/* ---------- de Speelkamer: de spellen uit de kisten opnieuw spelen ---------- */
function roomSheet(){var a=album(),all=TEST,keys=D.CH.filter(function(C){return C.game}).map(function(C){return C.game});
  var b=sheet('<h2>'+T.roomH+'</h2><p>'+T.roomT+'</p><div class="gl">'+keys.map(function(k,i){var st=a.games[k],open=all||st!=null;return'<button type="button" data-g="'+k+'"'+(open?'':' disabled')+'><b>'+esc(D.GN[k])+'</b><span>'+(open?"★".repeat(st||0)+"☆".repeat(3-(st||0)):fill(T.albLocked,{n:i+1}))+'</span></button>'}).join("")+'</div><button type="button" class="btn ghost dk" id="shX">'+T.close+'</button>');
  $("#shX").onclick=closeSheet;b.onclick=function(e){var g=e.target.closest("[data-g]");if(g&&!g.disabled){closeSheet();roomPlay(g.dataset.g)}}}
function roomPlay(key){var back=function(){closeStage();if(G)chip()};openStage(D.GN[key]);stg.onX=back;
  var run=function(){var seed=1+Math.floor(Math.random()*99999),o={seed:seed,lvl:1};if(key==="jig"){o.art=seed%2?"trap":"foto";o.lvl=seed%3===0?2:1}if(key==="uurwerk")o.lvl=seed%2?2:1;if(key==="stenen"){o.sets=5+seed%2;o.maxT=21}if(key==="vier"){o.depth=5;o.eps=.05}
    var C=D.CH.filter(function(x){return x.game===key})[0];
    playGame(key,o,function(res){var st=res.fail?0:res.stars||0,a=album();a.games[key]=Math.max(a.games[key]||0,st);LS.set(AK,a);
      stCard(starsHTML(st)+'<h2>'+(res.fail?T.failH:T.stars[st])+'</h2><button type="button" class="btn" id="go">'+T.roomAgain+'</button><button type="button" class="btn ghost" id="bk">'+T.back+'</button>');stg.onX=back;if(st)sfx("win");$("#go").onclick=run;$("#bk").onclick=function(){back();roomSheet()}},C&&C.gameT);stg.onX=back};
  run()}

/* ---------- startscherm: speelstukken die omhoog dwarrelen ---------- */
var heroRaf=0;
function hero(on){cancelAnimationFrame(heroRaf);var cv=$("#hero");if(!on||!cv)return;var g=cv.getContext("2d"),w=0,h=0,dpr=1,ps=[],still=matchMedia("(prefers-reduced-motion: reduce)").matches,ids=LENS.PIECES;
  var rs=function(){dpr=Math.min(2,devicePixelRatio||1);w=cv.clientWidth;h=cv.clientHeight;cv.width=w*dpr;cv.height=h*dpr};rs();
  for(var i=0;i<8;i++)ps.push({x:Math.random(),y:Math.random(),s:22+Math.random()*30,v:.012+Math.random()*.02,r:Math.random()*6,vr:(Math.random()-.5)*.6,id:ids[i%ids.length]});
  var last=0,f=function(t){if($("#home").hidden)return;var dt=Math.min(.05,(t-last)/1000)||0;last=t;if(cv.clientWidth!==w||cv.clientHeight!==h)rs();g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);
    ps.forEach(function(p){p.y-=p.v*dt;p.r+=p.vr*dt;if(p.y<-.1){p.y=1.1;p.x=Math.random()}g.save();g.globalAlpha=.16;g.translate(p.x*w,p.y*h);g.rotate(p.r);LENS.piece(g,0,0,p.s,p.id,t);g.restore()});
    if(!still)heroRaf=requestAnimationFrame(f)};heroRaf=requestAnimationFrame(f)}

document.addEventListener("visibilitychange",function(){if(document.hidden&&G)save()});
/* voor tests en voor het snel doorlopen op de testsite: SM.skip() slaat het huidige onderdeel over */
if(DEV)window.SM={state:function(){return G},skip:function(){if(stg.skipFn)stg.skipFn()},stage:function(){return stg},P:function(){return P},goto:function(){var t=target();if(t){P.x=t.x;P.y=t.y}}};
MW.pro.ready.then(function(){if(!G)home()});
home();
})();
