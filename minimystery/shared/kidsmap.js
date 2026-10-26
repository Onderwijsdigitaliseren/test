/* MiniMystery – verhaalkaart voor kinderen (gedeeld door de wandelingen).
   Kinderen kunnen nog geen plattegrond lezen. In plaats van de echte kaart zien ze een getekend stukje land dat bij het verhaal hoort,
   met wegen, vaste plekken (één per spoor) en hun eigen groepje dat over de weg naar de volgende plek loopt: zo ver als ze in het echt
   al dichterbij zijn gekomen (gps), of op stappen (binnen). Een kompaspijl en koud/lauw/warm/heet wijzen de weg.
   De echte plattegrond blijft achter een knop voor de begeleider.
   Vereist platform.js en walk.js. Gebruik:
     var km=MW.KidsMap.create({ T:{...teksten}, map:{W,H,start,spots:[{x,y,k}],roads:[[i,j]],land,...}, draw:{landmark,decor,start,hero,runner,overlay},
                               G:()=>G, P:()=>P, dTo:fn, virt:()=>bool, mode:()=>G.mode, say:fn, onTap:fn });
     km.mount();  // één keer, na het laden van de pagina (maakt #kids, #kidsMsg, #kidsHot en #bView in #play)
     km.enter({kids:bool, virt:bool, map:map});  // bij het betreden van de kaart
     km.draw(t) in de teken-lus (geeft true als de verhaalkaart getekend is, anders teken je de echte kaart)
     km.leave(); km.virtSpots(n); km.stepLen(st,target); km.fk(spot); km.heat(d) */
(function(){
"use strict";
var MW=window.MW,$=function(s){return document.querySelector(s)};
function create(o){
  var T=o.T,M=o.map,DR=o.draw||{},VSC=M.vsc||.42,KV=false,HEAD=null,MOVB=null,lastP=null,map=null,bView=null,msgEl=null,hotEl=null,cv=null;
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
  /* plek van het groepje op de verhaalkaart */
  function prevSpot(){var g=G(),last=null,lt=-1;g.st.forEach(function(s){if(s.done&&(s.doneAt||0)>lt){lt=s.doneAt||0;last=s}});return last?fspot(fk(last)):M.start}
  function pos(nr){var g=G(),p=P();if(o.virt())return{x:M.start.x+p.x/VSC,y:M.start.y+p.y/VSC};if(!nr)return prevSpot();var a=prevSpot(),b=fspot(fk(nr)),d=dTo(nr);
    if(g.kd0==null||g.kdFi!==nr.fi){g.kd0=Math.max(d,40);g.kdFi=nr.fi}if(d>g.kd0)g.kd0=d;var tt=Math.max(0,Math.min(1,1-d/g.kd0));return{x:a.x+(b.x-a.x)*tt,y:a.y+(b.y-a.y)*tt}}
  function hoof(g,x,y,r,col){if(DR.mark)return DR.mark(g,x,y,r,col);g.save();g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.restore()}
  /* ---------- dom ---------- */
  function mount(){var play=$("#play");if(!play||$("#kids"))return;
    var k=document.createElement("div");k.id="kids";k.hidden=true;k.innerHTML='<canvas id="kidsC"></canvas><div id="kidsHot"></div><div id="kidsMsg"></div>';play.insertBefore(k,play.firstChild.nextSibling);
    bView=document.createElement("button");bView.type="button";bView.id="bView";play.appendChild(bView);bView.onclick=function(){KV=!KV;setView()};
    cv=$("#kidsC");msgEl=$("#kidsMsg");hotEl=$("#kidsHot");
    cv.addEventListener("pointerdown",function(e){if(!o.onTap)return;var b=cv.getBoundingClientRect();o.onTap(e.clientX-b.left,e.clientY-b.top)});
    addEventListener("resize",function(){if(!$("#play").hidden&&KV)size()})}
  function size(){var dpr=Math.min(2,devicePixelRatio||1),w=cv.clientWidth||innerWidth,h=cv.clientHeight||innerHeight;cv.width=w*dpr;cv.height=h*dpr;cv.dataset.dpr=dpr}
  function setView(){$("#kids").hidden=!KV;$("#play").classList.toggle("kv",KV);bView.textContent=KV?T.map:T.kids;if(KV)size();else{if(map)map.resize();if(o.mode()==="map"&&T.mapTip)MW.Walk.toast(T.mapTip)}}
  function enter(a){map=a.map||map;lastP=null;MOVB=null;KV=a.kids!==false;bView.hidden=!!a.virt;setView();stopHead();if(o.mode()==="map")startHead()}
  function leave(){stopHead()}
  /* ---------- tekenen ---------- */
  function draw(t){if(!KV||$("#kids").hidden)return false;var g=cv.getContext("2d"),dpr=+cv.dataset.dpr||1,w=cv.width/dpr,h=cv.height/dpr;g.setTransform(dpr,0,0,dpr,0,0);
    var GG=G(),nr=near(),nd=nr?dTo(nr):1e9,ht=heat(nd),col=HC[ht],top=M.top||120,bot=M.bot||200,sc=Math.min(w/M.W,(h-top-bot)/M.H),ox=(w-M.W*sc)/2,oy=top+(h-top-bot-M.H*sc)/2;
    g.fillStyle=M.sky||"#9ad7ff";g.fillRect(0,0,w,h);
    g.save();g.translate(ox,oy);g.scale(sc,sc);
    /* land */g.fillStyle=M.land||"#9fd98a";g.beginPath();g.moveTo(40,120);g.quadraticCurveTo(M.W/2,20,M.W-40,110);g.quadraticCurveTo(M.W+10,M.H/2,M.W-50,M.H-80);g.quadraticCurveTo(M.W/2,M.H,50,M.H-90);g.quadraticCurveTo(-10,M.H/2,40,120);g.closePath();g.fill();
    if(DR.ground)DR.ground(g,t,still);
    /* wegen */g.lineCap="round";g.lineJoin="round";var rd=function(r){var a=r[0]<0?M.start:M.spots[r[0]],b=r[1]<0?M.start:M.spots[r[1]];g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()};
    M.roads.forEach(function(r){g.strokeStyle=M.road||"#e9d8a6";g.lineWidth=34;rd(r)});M.roads.forEach(function(r){g.strokeStyle=M.roadLine||"#fff7dd";g.lineWidth=4;g.setLineDash([14,18]);rd(r);g.setLineDash([])});
    /* spoor naar de volgende plek */if(nr&&!o.virt()){var a=prevSpot(),b=fspot(fk(nr)),L=Math.hypot(b.x-a.x,b.y-a.y),n2=Math.floor(L/48);for(var i=1;i<n2;i++){var q=i/n2;hoof(g,a.x+(b.x-a.x)*q+(i%2?10:-10),a.y+(b.y-a.y)*q,8,"rgba(0,0,0,.28)")}}
    if(DR.decor)DR.decor(g,t,still);
    if(DR.start)DR.start(g,M.start.x,M.start.y,t,still);
    /* plekken */M.spots.forEach(function(f,i){var st=GG.st.filter(function(s){return fk(s)===i})[0];if(!st)return;var dn=st.done,isN=nr&&fk(nr)===i;
      if(DR.landmark)DR.landmark(g,f.k,f.x,f.y,62);
      g.fillStyle=M.label||"#3b2a14";g.font="700 26px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="alphabetic";g.strokeStyle=M.labelHalo||"rgba(255,250,240,.9)";g.lineWidth=6;g.strokeText(T.fp[i]||"",f.x,f.y+36);g.fillText(T.fp[i]||"",f.x,f.y+36);
      if(dn){g.fillStyle="#22c55e";g.beginPath();g.arc(f.x+44,f.y-60,18,0,7);g.fill();g.strokeStyle="#fff";g.lineWidth=4;g.beginPath();g.moveTo(f.x+35,f.y-60);g.lineTo(f.x+41,f.y-54);g.lineTo(f.x+53,f.y-68);g.stroke()}
      else if(isN){var bob=still?0:Math.sin(t/300)*6;g.fillStyle=col;g.shadowColor=col;g.shadowBlur=18;g.beginPath();g.arc(f.x,f.y-120+bob,26,0,7);g.fill();g.shadowBlur=0;hoof(g,f.x,f.y-120+bob,13,"#fff");if(!still){g.strokeStyle=col;g.globalAlpha=.6-((t/1200)%1)*.6;g.lineWidth=4;g.beginPath();g.arc(f.x,f.y-10,30+((t/1200)%1)*40,0,7);g.stroke();g.globalAlpha=1}}
      else hoof(g,f.x,f.y-100,11,"rgba(0,0,0,.3)")});
    /* het groepje */var kp=pos(nr);g.fillStyle="rgba(0,0,0,.2)";g.beginPath();g.ellipse(kp.x,kp.y+6,30,10,0,0,7);g.fill();g.fillStyle=M.heroHalo||"rgba(231,111,81,.25)";g.beginPath();g.arc(kp.x,kp.y-20,46+(still?0:Math.sin(t/400)*4),0,7);g.fill();
    if(DR.hero)DR.hero(g,kp.x,kp.y,t);else{g.fillStyle=col;g.beginPath();g.arc(kp.x,kp.y-20,22,0,7);g.fill()}
    if(nr&&DR.runner){var f2=fspot(fk(nr));DR.runner(g,f2.x,f2.y,t,still)}
    g.restore();
    /* kompaspijl */var ang=nr?arrowAngle(nr):null,cx=52,cy=h-bot+58,R=36;g.save();g.shadowColor="rgba(0,0,0,.25)";g.shadowBlur=12;g.fillStyle="#fffaf0";g.beginPath();g.arc(cx,cy,R,0,7);g.fill();g.restore();g.lineWidth=5;g.strokeStyle="#f4c20d";g.beginPath();g.arc(cx,cy,R-4,0,7);g.stroke();
    if(nr&&ang!=null){g.save();g.translate(cx,cy);g.rotate(ang);g.fillStyle=col;g.beginPath();g.moveTo(R*.6,0);g.lineTo(-R*.25,-R*.32);g.lineTo(-R*.08,0);g.lineTo(-R*.25,R*.32);g.closePath();g.fill();g.restore()}else if(nr){g.fillStyle="#3b2a14";g.font="700 28px 'Fredoka',sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillText("?",cx,cy+2)}
    var ov=DR.overlay?DR.overlay(g,w,h,t):null;
    hotEl.textContent=!nr?"":T[ht];hotEl.style.color=col;
    var p=P(),m=o.mode(),inr=Math.max(35,Math.min(p.acc||0,60));
    if(!ov)msgEl.textContent=!nr?T.all:nd<=inr?T.here:m==="in"&&GG.in?MW.fill(T.inSteps,{n:Math.ceil(nd/GG.in.sl)}):ang==null&&m!=="demo"?(lastP?T.noDir:T.first):MW.fill(T.near,{d:Math.round(nd)});
    return true}
  return{mount:mount,enter:enter,leave:leave,draw:draw,moved:moved,fk:fk,fspot:fspot,near:near,heat:heat,virtSpots:virtSpots,stepLen:stepLen,on:function(){return KV},setMsg:function(s){msgEl.textContent=s},size:size,hot:function(){var n=near();return n?HC[heat(dTo(n))]:"#6ec3ff"}}}
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
