/* MiniMystery – verhaalkaart voor kinderen (gedeeld door de wandelingen).
   Kinderen kunnen nog geen plattegrond lezen. In plaats van de echte kaart zien ze een getekend stukje land dat bij het verhaal hoort,
   met wegen, vaste plekken (één per spoor) en hun eigen groepje dat over de weg naar de volgende plek loopt: zo ver als ze in het echt
   al dichterbij zijn gekomen (gps), of op stappen (binnen). Een kompaspijl en koud/lauw/warm/heet wijzen de weg.
   De echte plattegrond blijft achter een knop voor de begeleider.
   Vereist platform.js en walk.js. Gebruik:
     var km=MW.KidsMap.create({ T:{...teksten}, map:{W,H,start,spots:[{x,y,k}],roads:[[i,j]],land,...}, draw:{landmark,decor,start,hero,runner,overlay},
                               G:()=>G, P:()=>P, dTo:fn, virt:()=>bool, mode:()=>G.mode, say:fn, onTap:fn, go:fn(st) (proefronde: loop naar deze plek) });
     km.mount();  // één keer, na het laden van de pagina (maakt #kmBox, #kmMsg, #kmHot en #bView in #play)
     km.enter({kids:bool, virt:bool, map:map});  // bij het betreden van de kaart
     km.draw(t) in de teken-lus (geeft true als de verhaalkaart getekend is, anders teken je de echte kaart)
     km.intro(true) toont de uitleg nog eens; km.leave(); km.virtSpots(n); km.stepLen(st,target); km.fk(spot); km.heat(d) */
(function(){
"use strict";
var MW=window.MW,$=function(s){return document.querySelector(s)};
function create(o){
  var T=o.T,M=o.map,DR=o.draw||{},VSC=M.vsc||.42,VT=null,KV=false,HEAD=null,MOVB=null,lastP=null,map=null,bView=null,msgEl=null,hotEl=null,cv=null;
  var still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function G(){return o.G()}function P(){return o.P()}function dTo(s){return o.dTo(s)}
  function fk(s){return s.fk!=null?s.fk:s.fi%M.spots.length}
  function fspot(i){return M.spots[i%M.spots.length]}
  function near(){var g=G();if(!g||!g.st)return null;var best=null,bd=1e9;g.st.forEach(function(s){if(s.done)return;var d=dTo(s);if(d<bd){bd=d;best=s}});return best}
  function heat(d){return d<40?"hot":d<100?"warm":d<220?"cool":"cold"}
  var HC={hot:"#e63946",warm:"#f28c28",cool:"#f4c20d",cold:"#6ec3ff"};
  /* virtuele wereld: de plekken op echte afstanden rond de speler, in dezelfde vorm als de verhaalkaart */
  function virtSpots(n){var all=M.spots.map(function(s,i){return i}),pick;
    if(n>=all.length)pick=all.slice(0,n);else{pick=[];var step=all.length/n;for(var i=0;i<n;i++)pick.push(Math.round(i*step)%all.length)}
    return pick.map(function(k){var f=M.spots[k];return{x:Math.round((f.x-M.start.x)*VSC),y:Math.round((f.y-M.start.y)*VSC),type:"hoek",name:T.fp[k]||"",fk:k}})}
  function stepLen(st,target){var left=st.slice(),x=0,y=0,tour=0;while(left.length){var bi=0,bd=1e9;left.forEach(function(s,i){var d=Math.hypot(s.x-x,s.y-y);if(d<bd){bd=d;bi=i}});tour+=bd;x=left[bi].x;y=left[bi].y;left.splice(bi,1)}return Math.max(.3,Math.min(3,tour/target))}
  /* kompas: kijkrichting van de telefoon, anders de looprichting */
  function onHead(e){var h=null;if(typeof e.webkitCompassHeading==="number")h=e.webkitCompassHeading;else if(e.absolute&&typeof e.alpha==="number")h=360-e.alpha;if(h!=null)HEAD=h}
  function startHead(){try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function"){DeviceOrientationEvent.requestPermission().then(function(r){if(r==="granted")addEventListener("deviceorientation",onHead)}).catch(function(){})}else{addEventListener("deviceorientationabsolute",onHead);addEventListener("deviceorientation",onHead)}}catch(e){}}
  function stopHead(){removeEventListener("deviceorientationabsolute",onHead);removeEventListener("deviceorientation",onHead);HEAD=null}
  function moved(d){var p=P();if(lastP&&d>6)MOVB=Math.atan2(p.y-lastP.y,p.x-lastP.x);if(!lastP||d>6)lastP={x:p.x,y:p.y}}
  function arrowAngle(tgt){var p=P(),b=Math.atan2(tgt.y-p.y,tgt.x-p.x),m=o.mode();if(m==="demo"||m==="in")return b;if(HEAD!=null)return b-Math.PI/2-(HEAD-90)*Math.PI/180;if(MOVB!=null)return b-Math.PI/2-MOVB;return null}
  /* geo-indeling: de plekken staan op de verhaalkaart op dezelfde onderlinge plek als in het echt (noorden boven, start = waar je begon),
     geschaald tot het stuk land past. Het groepje staat dan op zijn echte gps-positie. Zonder echte plekken (virtueel) geldt de vaste tekening. */
  var LY=null;
  function layout(){var g=G();if(o.virt()||!g||!g.st||!g.st.length)return LY=null;
    var sig=g.st.length+":"+g.st.map(function(s){return s.fi+","+Math.round(s.x)+","+Math.round(s.y)}).join(";");if(LY&&LY.sig===sig)return LY;
    var pts=[{x:0,y:0}].concat(g.st.map(function(s){return{x:s.x,y:s.y}})),x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
    pts.forEach(function(q){x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);y0=Math.min(y0,q.y);y1=Math.max(y1,q.y)});
    var mx=130,mt=200,mb=120,iw=M.W-2*mx,ih=M.H-mt-mb,bw=Math.max(60,x1-x0),bh=Math.max(60,y1-y0),sc=Math.min(iw/bw,ih/bh);
    var ox=mx+(iw-bw*sc)/2-x0*sc,oy=mt+(ih-bh*sc)/2-y0*sc,to=function(q){return{x:ox+q.x*sc,y:oy+q.y*sc}};
    var L={sig:sig,sc:sc,to:to,start:to({x:0,y:0}),by:{},list:[]};
    g.st.forEach(function(s){var q=to(s);q.st=s;q.k=fspot(fk(s)).k;q.i=fk(s);L.by[s.fi]=q;L.list.push(q)});
    /* wegen: een route van de start langs alle plekken (steeds de dichtstbijzijnde) */
    L.roads=[];var left=L.list.slice(),cur=L.start;while(left.length){var bi=0,bd=1e9;left.forEach(function(q,i){var d=Math.hypot(q.x-cur.x,q.y-cur.y);if(d<bd){bd=d;bi=i}});L.roads.push([cur,left[bi]]);cur=left[bi];left.splice(bi,1)}
    return LY=L}
  function gpos(s){return LY&&LY.by[s.fi]?LY.by[s.fi]:fspot(fk(s))}
  function gstart(){return LY?LY.start:M.start}
  /* plek van het groepje op de verhaalkaart */
  function prevSpot(){var g=G(),last=null,lt=-1;g.st.forEach(function(s){if(s.done&&(s.doneAt||0)>lt){lt=s.doneAt||0;last=s}});return last?gpos(last):gstart()}
  function pos(nr){var g=G(),p=P();if(o.virt())return{x:M.start.x+p.x/VSC,y:M.start.y+p.y/VSC};if(LY)return LY.to({x:p.x,y:p.y});if(!nr)return prevSpot();var a=prevSpot(),b=gpos(nr),d=dTo(nr);
    if(g.kd0==null||g.kdFi!==nr.fi){g.kd0=Math.max(d,40);g.kdFi=nr.fi}if(d>g.kd0)g.kd0=d;var tt=Math.max(0,Math.min(1,1-d/g.kd0));return{x:a.x+(b.x-a.x)*tt,y:a.y+(b.y-a.y)*tt}}
  function hoof(g,x,y,r,col){if(DR.mark)return DR.mark(g,x,y,r,col);g.save();g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.restore()}
  /* ---------- dom ---------- */
  /* uitleg: de verhaalkaart is een tekening, de echte plattegrond zit achter de knop. Teksten per taal; de kaartnamen komen uit het spel (T.kids/T.map). */
  var LG=(document.documentElement.lang||"nl").slice(0,2)==="en"?"en":"nl",introEl=null,cardEl=null,goEl=null,subEl=null,compEl=null,heatEl=null;
  var X=LG==="en"?{toMap:"Real map",toMapS:"map",you:"You",toKids:"Back",go:"Walk to",here:"You're there!",all:"All done!",help:"What is this map?",
      title:"The play map",p1:"The places on this map are real: they're in your own neighbourhood, where they really are. Walk and your group walks along. The arrow and cold → hot show the way.",
      p2:"Want to see the streets? Tap the 🗺️ button at the side for the real map. Tap it again to come back.",ok:"OK",goMap:"Show the real map"}
    :{toMap:"Echte plattegrond",toMapS:"kaart",you:"Jullie",toKids:"Terug",go:"Ga lopen naar",here:"Je bent er!",all:"Alles gevonden!",help:"Wat is deze kaart?",
      title:"De speelkaart",p1:"De plekken op deze kaart zijn echt: ze liggen bij jou in de buurt, zoals ze in het echt liggen. Loop, en jullie groepje loopt mee. Het pijltje en koud → heet wijzen de weg.",
      p2:"Wil je de straten zien? Tik op het 🗺️-knopje aan de zijkant voor de echte plattegrond. Nog een keer tikken en je bent terug.",ok:"OK",goMap:"Toon de echte plattegrond"};
  function fillX(s){return s}
  var introPend=false,introChk=0;
  /* de uitleg pas tonen als de verhaalkaart echt vrij in beeld is (geen vel, filmpje of ander scherm ervoor) */
  function clear(){var r=cv.getBoundingClientRect(),e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!e&&(e===cv||e.closest("#kmBox")===$("#kmBox"))}
  function introWhenClear(){}
  function intro(force){if(!introEl||!force)return;
    introEl.className="";introEl.innerHTML='<div class="kmCard"><div class="kmPic">🗺️</div><h3>'+X.title+'</h3><p>'+X.p1+'</p><p>'+X.p2+'</p><div class="kmBtns"><button type="button" class="kmGo">'+X.goMap+'</button><button type="button" class="kmOk">'+X.ok+'</button></div></div>';
    introEl.hidden=false;introEl.querySelector(".kmOk").onclick=function(){introEl.hidden=true};
    introEl.querySelector(".kmGo").onclick=function(){introEl.hidden=true;KV=false;setView()}}
  /* label en ?-knop nemen de kleuren van #bView over (per spel gestyled); hun plek staat in css (kidsmap.css, per spel te overschrijven) */
  /* de opdrachtkaart neemt de kleuren van de knop over (die is per spel gestyled) */
  function placeTag(){if(!cardEl)return;var cs=getComputedStyle(bView);cardEl.style.background=cs.backgroundColor;cardEl.style.borderColor=cs.borderTopColor;cardEl.style.color=cs.color;cardEl.style.fontFamily=cs.fontFamily}
  function mount(){var play=$(o.host||"#play");if(!play||$("#kmBox"))return;
    var k=document.createElement("div");k.id="kmBox";k.hidden=true;
    k.innerHTML='<canvas id="kmC"></canvas><div id="kmHot"></div><div id="kmMsg"></div><div id="kmCard"><canvas id="kmComp" width="128" height="128"></canvas><div class="kmTx"><b id="kmGoT"></b><span id="kmSub"></span></div><i id="kmHeat"></i></div>';
    play.insertBefore(k,play.firstChild.nextSibling);
    bView=document.createElement("button");bView.type="button";bView.id="bView";bView.className="kmSide";bView.setAttribute("aria-label",X.toMap);play.appendChild(bView);bView.onclick=function(){KV=!KV;setView()};
    introEl=document.createElement("div");introEl.id="kmIntro";introEl.hidden=true;play.appendChild(introEl);
    cv=$("#kmC");msgEl=$("#kmMsg");hotEl=$("#kmHot");cardEl=$("#kmCard");goEl=$("#kmGoT");subEl=$("#kmSub");compEl=$("#kmComp");heatEl=$("#kmHeat");
    cv.addEventListener("pointerdown",function(e){var b=cv.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;if(o.onTap)o.onTap(x,y);
      /* tik op een plek: in de proefronde loop je er (nep) heen, anders wordt hij even aangewezen */
      if(!VT||!LY)return;var hit=null,hd=1e9;LY.list.forEach(function(q){var sx=VT.ox+q.x*VT.sc,sy=VT.oy+(q.y-50)*VT.sc,d=Math.hypot(x-sx,y-sy);if(d<hd){hd=d;hit=q}});
      if(hit&&hd<64*Math.max(VT.sc,.5)+22){if(o.mode()==="demo"&&o.go&&!hit.st.done){o.go(hit.st);if(T.goDemo)MW.Walk.toast(MW.fill(T.goDemo,{p:T.fp[hit.i]||hit.st.name||""}))}else if(T.fp[hit.i]){MW.Walk.toast((T.fp[hit.i]||"")+(hit.st.done?" ✓":" · "+Math.round(dTo(hit.st))+" m"))}}});
    addEventListener("resize",function(){if(!$(o.host||"#play").hidden&&KV)size()})}
  function size(){var dpr=Math.min(2,devicePixelRatio||1),w=cv.clientWidth||innerWidth,h=cv.clientHeight||innerHeight;cv.width=w*dpr;cv.height=h*dpr;cv.dataset.dpr=dpr}
  function setView(){$("#kmBox").hidden=!KV;$(o.host||"#play").classList.toggle("kv",KV);
    bView.innerHTML=KV?'<i>🗺️</i><small>'+X.toMapS+'</small>':'<i>↩</i><small>'+X.toKids+'</small>';bView.setAttribute("aria-label",KV?X.toMap:X.toKids);placeTag();
    if(KV)size();else{if(map)map.resize();if(o.mode()==="map"&&T.mapTip)MW.Walk.toast(T.mapTip)}}
  function enter(a){map=a.map||map;lastP=null;MOVB=null;KV=a.kids!==false;bView.hidden=!!a.virt;setView();stopHead();if(o.mode()==="map")startHead();introPend=KV&&!a.virt&&!MW.LS.get("ss_kmintro")}
  function leave(){stopHead()}
  /* ---------- tekenen ---------- */
  /* hulpjes voor de mooiere kaart */
  function hexRgb(h){h=String(h||"#888").replace("#","");if(h.length===3)h=h.split("").map(function(c){return c+c}).join("");var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
  function shade(h,f){var c=hexRgb(h);return"rgb("+c.map(function(v){return Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f)))}).join(",")+")"}
  function dark(h){var c=hexRgb(h);return (c[0]*.3+c[1]*.59+c[2]*.11)<110}
  var SPK=null;function speckles(){if(SPK)return SPK;SPK=[];var r=1;for(var i=0;i<260;i++){r=(r*16807)%2147483647;var a=r/2147483647;r=(r*16807)%2147483647;var b=r/2147483647;r=(r*16807)%2147483647;SPK.push([60+a*(M.W-120),140+b*(M.H-260),(r%5)+2,r%2])}return SPK}
  function landPath(g){g.beginPath();g.moveTo(40,120);g.quadraticCurveTo(M.W/2,20,M.W-40,110);g.quadraticCurveTo(M.W+10,M.H/2,M.W-50,M.H-80);g.quadraticCurveTo(M.W/2,M.H,50,M.H-90);g.quadraticCurveTo(-10,M.H/2,40,120);g.closePath()}
  function curve(g,a,b,k){var mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,off=Math.min(60,L*.14)*(k%2?1:-1);g.moveTo(a.x,a.y);g.quadraticCurveTo(mx-dy/L*off,my+dx/L*off,b.x,b.y)}
  var CSC=1;function pill(g,txt,x,y,big,fg,bg){var f=(big?17:12.5)/CSC;g.font="700 "+f+"px 'Fredoka',sans-serif";var w=g.measureText(txt).width+f*(big?1:.9),h=f*1.55;g.save();g.shadowColor="rgba(0,0,0,.25)";g.shadowBlur=8;g.shadowOffsetY=2;g.fillStyle=bg;g.beginPath();if(g.roundRect)g.roundRect(x-w/2,y-h/2,w,h,h/2);else g.rect(x-w/2,y-h/2,w,h);g.fill();g.restore();g.fillStyle=fg;g.textAlign="center";g.textBaseline="middle";g.fillText(txt,x,y+1)}
  function pin(g,x,y,col,s,t){g.save();g.translate(x,y);g.scale(s,s);g.shadowColor="rgba(0,0,0,.35)";g.shadowBlur=12;g.shadowOffsetY=6;g.fillStyle=col;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-26,-34,-34,-52,-34,-70);g.arc(0,-70,34,Math.PI,0);g.bezierCurveTo(34,-52,26,-34,0,0);g.closePath();g.fill();g.shadowColor="transparent";g.fillStyle="#fff";g.beginPath();g.arc(0,-70,20,0,7);g.fill();g.restore()}
  function compass(ang,col,nr){if(!compEl)return;var g=compEl.getContext("2d"),R=56;g.clearRect(0,0,128,128);g.save();g.translate(64,64);
    g.fillStyle="rgba(255,255,255,.95)";g.beginPath();g.arc(0,0,R,0,7);g.fill();g.lineWidth=8;g.strokeStyle=col;g.beginPath();g.arc(0,0,R-5,0,7);g.stroke();
    if(nr&&ang!=null){g.rotate(ang);g.fillStyle=col;g.beginPath();g.moveTo(R*.7,0);g.lineTo(-R*.3,-R*.38);g.lineTo(-R*.1,0);g.lineTo(-R*.3,R*.38);g.closePath();g.fill()}
    else{g.fillStyle="#3b2a14";g.font="700 50px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(nr?"?":"★",0,4)}g.restore()}
  function draw(t){if(!KV||$("#kmBox").hidden)return false;var g=cv.getContext("2d"),dpr=+cv.dataset.dpr||1,w=cv.width/dpr,h=cv.height/dpr;g.setTransform(dpr,0,0,dpr,0,0);
    var GG=G(),nr=near(),nd=nr?dTo(nr):1e9,ht=heat(nd),col=HC[ht],top=M.top||120,bot=M.bot||200,sc=Math.min(w/M.W,(h-top-bot)/M.H),ox=(w-M.W*sc)/2,oy=top+(h-top-bot-M.H*sc)/2;layout();VT={sc:sc,ox:ox,oy:oy};CSC=sc;
    var sky=M.sky||"#9ad7ff",land=M.land||"#9fd98a",night=dark(sky);
    /* lucht met zachte gloed, en wolkjes (dag) of twinkelende sterren (nacht) */
    var bg=g.createRadialGradient(w/2,h*.45,40,w/2,h*.45,Math.max(w,h)*.8);bg.addColorStop(0,shade(sky,night?.12:.25));bg.addColorStop(1,shade(sky,night?-.35:-.12));g.fillStyle=bg;g.fillRect(0,0,w,h);
    if(night){for(var si=0;si<40;si++){var sx=(si*137.5)%w,sy=(si*71.3)%h;g.globalAlpha=.25+.55*Math.abs(Math.sin((still?0:t/900)+si));g.fillStyle="#fff";g.fillRect(sx,sy,2,2)}g.globalAlpha=1}
    else{g.fillStyle="rgba(255,255,255,.55)";for(var ci=0;ci<4;ci++){var cx0=((ci*260+(still?0:t/90))%(w+300))-150,cy0=40+ci*(h/4.5);g.beginPath();g.ellipse(cx0,cy0,60,16,0,0,7);g.ellipse(cx0+40,cy0-8,40,14,0,0,7);g.fill()}}
    g.save();g.translate(ox,oy);g.scale(sc,sc);
    /* land: schaduw, rand, gras met spikkels */
    g.save();g.translate(0,22);g.fillStyle="rgba(0,0,0,"+(night?.45:.18)+")";landPath(g);g.fill();g.restore();
    g.fillStyle=shade(land,-.28);g.save();g.translate(0,10);landPath(g);g.fill();g.restore();
    var lg=g.createLinearGradient(0,0,0,M.H);lg.addColorStop(0,shade(land,.12));lg.addColorStop(1,shade(land,-.08));g.fillStyle=lg;landPath(g);g.fill();
    g.save();landPath(g);g.clip();speckles().forEach(function(p){g.fillStyle=p[3]?shade(land,.22):shade(land,-.18);g.globalAlpha=.55;g.beginPath();g.arc(p[0],p[1],p[2],0,7);g.fill()});g.globalAlpha=1;g.restore();
    if(DR.ground)DR.ground(g,t,still);
    /* paden: kronkelend, met stoeprand en middenstreep */
    g.lineCap="round";g.lineJoin="round";
    var RDS=LY?LY.roads:M.roads,ends=function(r){return LY?[r[0],r[1]]:[r[0]<0?M.start:M.spots[r[0]],r[1]<0?M.start:M.spots[r[1]]]},road=M.road||"#e9d8a6";
    RDS.forEach(function(r,k){var e=ends(r);g.strokeStyle=shade(road,-.3);g.lineWidth=44;g.beginPath();curve(g,e[0],e[1],k);g.stroke()});
    RDS.forEach(function(r,k){var e=ends(r);g.strokeStyle=road;g.lineWidth=34;g.beginPath();curve(g,e[0],e[1],k);g.stroke()});
    RDS.forEach(function(r,k){var e=ends(r);g.strokeStyle=M.roadLine||"#fff7dd";g.lineWidth=4;g.setLineDash([14,18]);g.beginPath();curve(g,e[0],e[1],k);g.stroke();g.setLineDash([])});
    if(DR.decor&&!LY)DR.decor(g,t,still);
    if(DR.world)DR.world(g,t,function(q){return LY?LY.to(q):{x:M.start.x+q.x/VSC,y:M.start.y+q.y/VSC}},LY?LY.sc:1/VSC,still);
    var S0=gstart();if(DR.start)DR.start(g,S0.x,S0.y,t,still);
    var kp=pos(nr);
    /* looppad naar de volgende plek: lopende streepjes in de kleur van koud/warm/heet */
    if(nr){var b=gpos(nr);g.save();g.strokeStyle="rgba(255,255,255,.85)";g.lineWidth=16;g.setLineDash([2,26]);g.lineDashOffset=still?0:-t/30;g.beginPath();g.moveTo(kp.x,kp.y-10);g.lineTo(b.x,b.y-10);g.stroke();
      g.strokeStyle=col;g.lineWidth=10;g.stroke();g.restore()}
    /* plekken */
    var PL=LY?LY.list.map(function(q){return{x:q.x,y:q.y,k:q.k,i:q.i,st:q.st}}):M.spots.map(function(f,i){return{x:f.x,y:f.y,k:f.k,i:i,st:GG.st.filter(function(s){return fk(s)===i})[0]}});
    PL.sort(function(a,b){return a.y-b.y});
    var lab=M.label||"#3b2a14",halo=M.labelHalo||"rgba(255,250,240,.95)",nextF=null;
    PL.forEach(function(f){var st=f.st;if(!st)return;var dn=st.done,isN=nr&&nr.fi===st.fi;if(isN){nextF=f;return}
      g.globalAlpha=dn?1:.75;if(DR.landmark)DR.landmark(g,f.k,f.x,f.y,dn?58:52);g.globalAlpha=1;
      pill(g,T.fp[f.i]||"",f.x,f.y+14+9/CSC,false,lab,halo);
      if(dn){g.fillStyle="#22c55e";g.beginPath();g.arc(f.x+40,f.y-56,18,0,7);g.fill();g.strokeStyle="#fff";g.lineWidth=4;g.beginPath();g.moveTo(f.x+31,f.y-56);g.lineTo(f.x+37,f.y-50);g.lineTo(f.x+49,f.y-64);g.stroke()}});
    if(nextF){var f=nextF,bob=still?0:Math.abs(Math.sin(t/320))*14;
      if(!still){var ph=(t/1400)%1;g.strokeStyle=col;g.globalAlpha=.7*(1-ph);g.lineWidth=6;g.beginPath();g.ellipse(f.x,f.y,40+ph*70,(40+ph*70)*.45,0,0,7);g.stroke();g.globalAlpha=1}
      if(DR.landmark)DR.landmark(g,f.k,f.x,f.y,Math.max(70,34/CSC));
      var ps=Math.max(1.15,.42/CSC);pin(g,f.x,f.y-40-bob,col,ps,t);hoof(g,f.x,f.y-40-bob-70*ps,9*ps,col);
      pill(g,T.fp[f.i]||"",f.x,f.y+16+13/CSC,true,"#fff",col)}
    /* het groepje */
    g.fillStyle="rgba(0,0,0,.22)";g.beginPath();g.ellipse(kp.x,kp.y+6,32,11,0,0,7);g.fill();
    /* het groepje altijd goed zichtbaar: minstens ± 60 px op het scherm */
    var hs=Math.max(1,.62/CSC);g.save();g.translate(kp.x,kp.y);g.scale(hs,hs);g.translate(-kp.x,-kp.y);
    g.strokeStyle="#fff";g.lineWidth=5;g.fillStyle=M.heroHalo||"rgba(231,111,81,.3)";g.beginPath();g.arc(kp.x,kp.y-20,48+(still?0:Math.sin(t/400)*4),0,7);g.fill();g.stroke();
    if(DR.hero)DR.hero(g,kp.x,kp.y,t);else{g.fillStyle=col;g.beginPath();g.arc(kp.x,kp.y-20,22,0,7);g.fill()}
    g.restore();
    /* label "Jullie" onder het groepje */
    pill(g,X.you,kp.x,kp.y+20+11/CSC,false,"#fff","rgba(0,0,0,.6)");
    if(nr&&DR.runner){var f2=gpos(nr);DR.runner(g,f2.x,f2.y,t,still)}
    g.restore();
    var ang=nr?arrowAngle(nr):null;compass(ang,col,nr);
    var ov=DR.overlay?DR.overlay(g,w,h,t):null;
    hotEl.textContent=!nr?"":T[ht];
    var p=P(),m=o.mode(),inr=Math.max(35,Math.min(p.acc||0,60)),here=nr&&nd<=inr;
    var sub=!nr?T.all:here?T.here:m==="in"&&GG.in?MW.fill(T.inSteps,{n:Math.ceil(nd/GG.in.sl)}):ang==null&&m!=="demo"?(lastP?T.noDir:T.first):MW.fill(T.near,{d:Math.round(nd)});
    if(!ov){goEl.textContent=!nr?X.all:here?X.here:"👣 "+X.go+": "+(T.fp[fk(nr)]||nr.name||"");subEl.textContent=sub;msgEl.textContent=sub}
    heatEl.textContent=nr&&!here?(T[ht]||"").split(/[.!]/)[0]:"";heatEl.style.background=col;heatEl.hidden=!nr||here;
    return true}
  return{mount:mount,enter:enter,leave:leave,intro:intro,draw:draw,moved:moved,fk:fk,fspot:fspot,near:near,heat:heat,virtSpots:virtSpots,stepLen:stepLen,on:function(){return KV},setMsg:function(s){msgEl.textContent=s;if(subEl)subEl.textContent=s},size:size,hot:function(){var n=near();return n?HC[heat(dTo(n))]:"#6ec3ff"}}}
/* eenvoudige tekeningetjes voor plekken (voor spellen zonder eigen landmarks) */
var I={};
I.tree=function(g,x,y,s,lf,lf2){g.fillStyle="rgba(0,0,0,.12)";g.beginPath();g.ellipse(x+s*.1,y+s*.05,s*.55,s*.18,0,0,7);g.fill();g.fillStyle="#7a4a1e";g.fillRect(x-s*.08,y-s*.5,s*.16,s*.5);g.fillStyle=lf||"#3f9a4a";g.beginPath();g.arc(x,y-s*.7,s*.42,0,7);g.fill();g.fillStyle=lf2||"#5fc46a";g.beginPath();g.arc(x-s*.12,y-s*.82,s*.26,0,7);g.fill()};
I.house=function(g,x,y,s,col,roof){g.fillStyle="rgba(0,0,0,.12)";g.beginPath();g.ellipse(x,y+s*.05,s*.7,s*.16,0,0,7);g.fill();g.fillStyle=col||"#e8c9a0";g.fillRect(x-s*.5,y-s*.6,s,s*.6);g.fillStyle=roof||"#b5461e";g.beginPath();g.moveTo(x-s*.6,y-s*.6);g.lineTo(x,y-s*1.1);g.lineTo(x+s*.6,y-s*.6);g.closePath();g.fill();g.fillStyle="#3b2a14";g.fillRect(x-s*.12,y-s*.34,s*.24,s*.34);g.fillStyle="#bae6fd";g.fillRect(x-s*.42,y-s*.5,s*.2,s*.18);g.fillRect(x+s*.22,y-s*.5,s*.2,s*.18)};
I.awning=function(g,x,y,s,c1,c2){for(var i=0;i<6;i++){g.fillStyle=i%2?c1:c2;g.fillRect(x-s*.6+i*s*.2,y-s*.72,s*.2,s*.16)}};
I.church=function(g,x,y,s){I.house(g,x,y,s*.9,"#d9c7a3","#7a3b2e");g.fillStyle="#d9c7a3";g.fillRect(x+s*.2,y-s*1.4,s*.3,s*.9);g.fillStyle="#7a3b2e";g.beginPath();g.moveTo(x+s*.15,y-s*1.4);g.lineTo(x+s*.35,y-s*1.8);g.lineTo(x+s*.55,y-s*1.4);g.closePath();g.fill()};
I.bridge=function(g,x,y,s){g.fillStyle="#8a5a2b";g.beginPath();g.moveTo(x-s*.7,y);g.quadraticCurveTo(x,y-s*.7,x+s*.7,y);g.lineTo(x+s*.7,y+s*.15);g.quadraticCurveTo(x,y-s*.5,x-s*.7,y+s*.15);g.closePath();g.fill();g.strokeStyle="#5b3a1e";g.lineWidth=3;g.beginPath();g.moveTo(x-s*.7,y-s*.1);g.quadraticCurveTo(x,y-s*.85,x+s*.7,y-s*.1);g.stroke()};
I.swing=function(g,x,y,s){g.strokeStyle="#c0392b";g.lineWidth=s*.12;g.beginPath();g.moveTo(x-s*.5,y);g.lineTo(x-s*.5,y-s*.9);g.moveTo(x+s*.5,y);g.lineTo(x+s*.5,y-s*.9);g.moveTo(x-s*.5,y-s*.9);g.lineTo(x+s*.5,y-s*.9);g.stroke();g.strokeStyle="#f4c20d";g.lineWidth=s*.06;g.beginPath();g.moveTo(x-s*.15,y-s*.9);g.lineTo(x-s*.15,y-s*.3);g.moveTo(x+s*.15,y-s*.9);g.lineTo(x+s*.15,y-s*.3);g.stroke();g.fillStyle="#2563eb";g.fillRect(x-s*.25,y-s*.34,s*.5,s*.1)};
I.bench=function(g,x,y,s){g.fillStyle="#8a5a2b";g.fillRect(x-s*.5,y-s*.45,s,s*.12);g.fillRect(x-s*.45,y-s*.3,s*.08,s*.3);g.fillRect(x+s*.37,y-s*.3,s*.08,s*.3);g.fillRect(x-s*.5,y-s*.7,s,s*.1)};
I.lamp=function(g,x,y,s,on){g.fillStyle="#2b2b36";g.fillRect(x-s*.05,y-s*1.3,s*.1,s*1.3);g.fillRect(x-s*.2,y-s*.08,s*.4,s*.08);g.fillStyle=on?"#ffd36a":"#555";if(on){g.shadowColor="#ffd36a";g.shadowBlur=24}g.beginPath();g.arc(x,y-s*1.35,s*.16,0,7);g.fill();g.shadowBlur=0};
I.sign=function(g,x,y,s,col,txt){g.fillStyle="#2b2b36";g.fillRect(x-s*.04,y-s*1.1,s*.08,s*1.1);g.fillStyle=col||"#2563eb";g.beginPath();g.arc(x,y-s*1.15,s*.3,0,7);g.fill();g.fillStyle="#fff";g.font="700 "+Math.round(s*.34)+"px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText(txt||"B",x,y-s*1.13)};
I.postbox=function(g,x,y,s){g.fillStyle="#f28c28";g.fillRect(x-s*.25,y-s*.9,s*.5,s*.9);g.beginPath();g.arc(x,y-s*.9,s*.25,Math.PI,0);g.fill();g.fillStyle="#3b2a14";g.fillRect(x-s*.15,y-s*.7,s*.3,s*.06)};
I.fountain=function(g,x,y,s){g.fillStyle="#9ab";g.beginPath();g.ellipse(x,y,s*.6,s*.25,0,0,7);g.fill();g.fillStyle="#6ec3ff";g.beginPath();g.ellipse(x,y-s*.04,s*.5,s*.18,0,0,7);g.fill();g.fillStyle="#9ab";g.fillRect(x-s*.06,y-s*.6,s*.12,s*.6);g.strokeStyle="#6ec3ff";g.lineWidth=3;[-1,0,1].forEach(function(k){g.beginPath();g.moveTo(x,y-s*.6);g.quadraticCurveTo(x+k*s*.3,y-s*.9,x+k*s*.4,y-s*.2);g.stroke()})};
I.kiosk=function(g,x,y,s){g.fillStyle="#5fb45a";g.fillRect(x-s*.45,y-s*.6,s*.9,s*.6);I.awning(g,x,y,s*.8,"#e63946","#fff");g.fillStyle="#fff";g.fillRect(x-s*.3,y-s*.45,s*.6,s*.25)};
I.shop=function(g,x,y,s){I.house(g,x,y,s,"#f6e3b4","#7a3b2e");I.awning(g,x,y-s*.22,s*.9,"#2a9d4b","#fff")};
I.bakery=function(g,x,y,s){I.house(g,x,y,s,"#fde68a","#b5461e");I.awning(g,x,y-s*.22,s*.9,"#e63946","#fff");g.fillStyle="#c8884a";g.beginPath();g.ellipse(x,y-s*.08,s*.16,s*.08,0,0,7);g.fill()};
I.school=function(g,x,y,s){I.house(g,x,y,s*1.1,"#f4a261","#7a3b2e");g.fillStyle="#2b2b36";g.fillRect(x+s*.5,y-s*1.4,s*.04,s*.8);g.fillStyle="#e63946";g.beginPath();g.moveTo(x+s*.54,y-s*1.4);g.lineTo(x+s*.85,y-s*1.3);g.lineTo(x+s*.54,y-s*1.2);g.closePath();g.fill()};
I.party=function(g,x,y,s){I.house(g,x,y,s,"#ffb3c6","#7a3b2e");var C=["#ff4fa3","#ffd36a","#38e8ff","#d4ff3a"];for(var i=0;i<5;i++){g.fillStyle=C[i%4];g.beginPath();g.ellipse(x-s*.7+i*s*.35,y-s*1.3-(i%2)*s*.15,s*.1,s*.13,0,0,7);g.fill()}};
I.police=function(g,x,y,s){I.house(g,x,y,s*1.1,"#dbeafe","#1e3a8a");g.fillStyle="#ffc21a";g.beginPath();for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,r=i%2?s*.08:s*.16;g.lineTo(x+Math.cos(a)*r,y-s*.72+Math.sin(a)*r)}g.closePath();g.fill();g.fillStyle="#ff3b3b";g.beginPath();g.arc(x-s*.3,y-s*1.25,s*.08,0,7);g.fill();g.fillStyle="#4fd3ff";g.beginPath();g.arc(x+s*.3,y-s*1.25,s*.08,0,7);g.fill()};
I.park=function(g,x,y,s){I.tree(g,x-s*.35,y,s*.9);I.tree(g,x+s*.35,y+s*.1,s*1.1)};
MW.KidsMap={create:create,icons:I};
})();
