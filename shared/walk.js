/* Moordwandeling / Murder Walk – gedeelde wandelmotor voor nieuwe wandelspellen.
   Wereld ophalen (OpenStreetMap via Overpass, met cache), plekken kiezen, nachtkaart tekenen, gps volgen, oefenwereld,
   vellen/toasts/geluid. Vereist platform.js. Spel 1 (Moordwandeling) heeft nog zijn eigen, oudere kopie hiervan. */
(function(){
"use strict";
var MW=window.MW,LS=MW.LS,$=function(s){return document.querySelector(s)};
function rngOf(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function shuffle(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}

/* ---------- plekken ---------- */
var PRI=["kerk","hotel","bank","apotheek","cafe","bieb","park","school","kunst","tank","winkel","halte","post","bankje","hoek"];
function poiType(t){
  if(!t)return null;var a=t.amenity,s=t.tourism;
  if(a==="place_of_worship")return"kerk";if(a==="bank"||a==="atm")return"bank";if(/^(cafe|pub|bar|restaurant)$/.test(a||""))return"cafe";
  if(a==="pharmacy")return"apotheek";if(a==="post_box")return"post";if(a==="library")return"bieb";if(a==="school")return"school";if(a==="fuel")return"tank";if(a==="bench")return"bankje";
  if(s==="hotel")return"hotel";if(s==="artwork"||s==="museum")return"kunst";if(t.shop)return"winkel";if(t.highway==="bus_stop")return"halte";
  if(t.leisure==="park"||t.leisure==="playground")return"park";return null}
var HOSTS=["https://overpass.private.coffee/api/interpreter","https://maps.mail.ru/osm/tools/overpass/api/interpreter","https://overpass-api.de/api/interpreter"];
/* eerst één server; na 4 en 8 s zonder antwoord (of meteen bij een fout) de volgende erbij */
function ask(q,ms){var hosts=window.SS_MAP||HOSTS;return new Promise(function(res,rej){var ac=new AbortController(),ts=[],nx=0,left=hosts.length,done=false;
  var fin=function(ok,v){if(done)return;done=true;ts.forEach(clearTimeout);ac.abort();ok?res(v):rej(v)};
  var start=function(){if(done||nx>=hosts.length)return;var h=hosts[nx++];
    fetch(h,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"data="+encodeURIComponent(q),signal:ac.signal}).then(function(r){if(!r.ok)throw new Error("server "+r.status);return r.json()}).then(function(d){fin(true,d)},function(e){if(--left<=0)fin(false,e);else start()})};
  start();ts.push(setTimeout(start,4000),setTimeout(start,8000),setTimeout(function(){fin(false,new Error("timeout"))},ms))})}
/* fetchWorld({lat,lon,R,status}) → Promise<{pois,ways,origin,later}>; later = Promise met straten (komen op de achtergrond) */
function fetchWorld(o){var lat=o.lat,lon=o.lon,R=o.R,st=o.status||function(){};
  var kx=111320*Math.cos(lat*Math.PI/180),ky=110540,xy=function(la,lo){return[(lo-lon)*kx,-(la-lat)*ky]},A="(around:"+R+","+lat+","+lon+")",origin={lat:lat,lon:lon,kx:kx,ky:ky};
  var c=LS.get("ss_map",null);
  if(c&&c.R>=R&&c.pois&&c.pois.length&&Math.hypot((c.lon-lon)*kx,(c.lat-lat)*ky)<150){var ox=(c.lon-lon)*kx,oy=-(c.lat-lat)*ky;
    return Promise.resolve({origin:origin,cached:true,pois:c.pois.map(function(p){return{x:p.x+ox,y:p.y+oy,type:p.type,name:p.name}}),ways:(c.ways||[]).map(function(w){return{w:w.w,n:w.n,p:w.p.map(function(v,i){return Math.round(v+(i%2?oy:ox))})}}),later:Promise.resolve(null)})}
  st("pois");var pois=[],ways=[];
  return ask('[out:json][timeout:15];(nwr'+A+'[amenity~"^(place_of_worship|bank|atm|cafe|pub|bar|restaurant|pharmacy|post_box|library|school|fuel)$"];nwr'+A+'[tourism~"^(hotel|artwork|museum)$"];nwr'+A+'[shop~"^(supermarket|bakery|convenience)$"];node'+A+'[highway=bus_stop];nwr'+A+'[leisure~"^(park|playground)$"];);out center qt 400;',18000)
  .then(function(d){(d.elements||[]).forEach(function(e){var ty=poiType(e.tags),q=e.type==="node"?[e.lat,e.lon]:e.center?[e.center.lat,e.center.lon]:null;if(!ty||!q)return;var p=xy(q[0],q[1]);pois.push({x:p[0],y:p[1],type:ty,name:e.tags.name||""})})},function(){st("nomap")})
  .then(function(){
    var later=ask('[out:json][timeout:25];way(around:'+(R+150)+','+lat+','+lon+')[highway~"^(residential|tertiary|secondary|primary|unclassified|living_street|pedestrian|footway|path|cycleway|service)$"];out geom qt;',45000).then(function(d){
      (d.elements||[]).forEach(function(e){if(!e.geometry)return;var p=[];e.geometry.forEach(function(g){var q=xy(g.lat,g.lon);p.push(Math.round(q[0]),Math.round(q[1]))});var h=(e.tags&&e.tags.highway)||"";ways.push({p:p,w:/primary|secondary|tertiary/.test(h)?3:/footway|path|cycleway/.test(h)?1:2,n:(e.tags&&e.tags.name)||""})});
      if(pois.length)LS.set("ss_map",{lat:lat,lon:lon,R:R,pois:pois,ways:ways});return ways}).catch(function(){if(pois.length)LS.set("ss_map",{lat:lat,lon:lon,R:R,pois:pois,ways:[]});return null});
    return{origin:origin,cached:false,pois:pois,ways:ways,later:later}})}
/* locate(cb(err,pos)) met nette foutafhandeling */
function locate(){return new Promise(function(res,rej){if(!navigator.geolocation)return rej("nogps");navigator.geolocation.getCurrentPosition(function(p){res(p)},function(){rej("denied")},{enableHighAccuracy:true,timeout:20000})})}
/* oefenwereld: fictieve grachtengordel ten noorden van de speler. names = [[type,naam],...] (13 stuks) per taal */
function demoWorld(names){
  var cy=-500,ways=[],arc=function(r,w,n){var p=[];for(var a=25;a<=155;a+=5){var t=a*Math.PI/180;p.push(Math.round(r*Math.cos(t)),Math.round(cy+r*Math.sin(t)))}ways.push({p:p,w:w,n:n||""})};
  [[400,"Schaduwgracht"],[560,"Lantaarngracht"],[740,"Nachtgracht"],[920,"Mistgracht"]].forEach(function(c){arc(c[0],9,c[1])});
  [400,560,740,920].forEach(function(c){arc(c-26,1);arc(c+26,1)});[330,470,650,830].forEach(function(r){arc(r,2)});
  for(var a=30;a<=150;a+=12){var t=a*Math.PI/180;ways.push({p:[Math.round(260*Math.cos(t)),Math.round(cy+260*Math.sin(t)),Math.round(1000*Math.cos(t)),Math.round(cy+1000*Math.sin(t))],w:a===90||a===54||a===126?3:2,n:""})}
  var L=[[330,90],[470,70],[470,112],[650,90],[650,68],[650,113],[830,80],[830,102],[830,58],[830,124],[470,45],[470,136],[980,90]];
  return{ways:ways,pois:L.map(function(l,i){var t=l[1]*Math.PI/180,nm=names[i]||["hoek",""];return{x:Math.round(l[0]*Math.cos(t)),y:Math.round(cy+l[0]*Math.sin(t)),type:nm[0],name:nm[1]}})}}
/* pickSpots(pois,ways,R,n,r) → n goed gespreide plekken binnen R; vult aan met straathoeken ("hoek") op echte wegen */
function pickSpots(pois,ways,R,n,r,cornerLabel){
  var far=function(p,l,m){return l.every(function(q){return Math.hypot(q.x-p.x,q.y-p.y)>=m})},min=Math.max(90,R*.24),ch=[];
  var cand=shuffle(pois.filter(function(p){var d=Math.hypot(p.x,p.y);return d>70&&d<=R}),r).sort(function(a,b){return PRI.indexOf(a.type)-PRI.indexOf(b.type)});
  for(var pass=0;pass<2&&ch.length<n;pass++)for(var i=0;i<cand.length&&ch.length<n;i++){var p=cand[i],k=ch.filter(function(q){return q.type===p.type}).length;if(ch.indexOf(p)>=0||k>pass||(p.type==="bankje"&&pass===0&&cand.length>12))continue;if(far(p,ch,min))ch.push(p)}
  var nodes=[];ways.forEach(function(w){for(var i=0;i<w.p.length;i+=2)nodes.push([w.p[i],w.p[i+1],w.n])});
  for(var t=0;ch.length<n&&t<600;t++){if(t%80===79)min*=.8;var a=r()*6.283,d=R*(.4+.55*r()),q={x:Math.cos(a)*d,y:Math.sin(a)*d,type:"hoek",name:""},b=null,bd=140;
    for(var j=0;j<nodes.length;j++){var dd=Math.hypot(nodes[j][0]-q.x,nodes[j][1]-q.y);if(dd<bd){bd=dd;b=nodes[j]}}if(b){q.x=b[0];q.y=b[1];if(b[2])q.name=(cornerLabel||"Hoek")+" "+b[2]}
    if(far(q,ch,min))ch.push(q)}
  return ch.map(function(p){return{x:Math.round(p.x),y:Math.round(p.y),type:p.type,name:p.name||""}})}

/* ---------- kaart ---------- */
function ghost(c,x,y,s,col,al){c.save();c.globalAlpha=al;
  var h=c.createRadialGradient(x,y,s*.1,x,y,s*.85);h.addColorStop(0,"rgba(147,166,198,.28)");h.addColorStop(1,"rgba(147,166,198,0)");c.fillStyle=h;c.beginPath();c.arc(x,y,s*.85,0,7);c.fill();
  c.fillStyle="rgba(4,7,12,.6)";c.beginPath();c.ellipse(x+s*.22,y+s*.52,s*.5,s*.09,-.12,0,7);c.fill();
  c.fillStyle="#05080e";c.strokeStyle=col;c.lineWidth=Math.max(1,s*.035);c.lineJoin="round";
  c.beginPath();c.moveTo(x-s*.09,y-s*.3);c.lineTo(x-s*.24,y-s*.24);c.lineTo(x-s*.3,y+s*.5);c.lineTo(x+s*.3,y+s*.5);c.lineTo(x+s*.24,y-s*.24);c.lineTo(x+s*.09,y-s*.3);c.closePath();c.fill();c.stroke();
  c.beginPath();c.arc(x,y-s*.4,s*.13,0,7);c.fill();c.stroke();
  c.beginPath();c.moveTo(x-s*.27,y-s*.47);c.lineTo(x+s*.27,y-s*.47);c.lineTo(x+s*.27,y-s*.52);c.lineTo(x+s*.14,y-s*.53);c.lineTo(x+s*.12,y-s*.7);c.lineTo(x-s*.12,y-s*.7);c.lineTo(x-s*.14,y-s*.53);c.lineTo(x-s*.27,y-s*.52);c.closePath();c.fill();c.stroke();
  c.fillStyle=col;c.beginPath();c.arc(x-s*.05,y-s*.41,s*.022,0,7);c.arc(x+s*.05,y-s*.41,s*.022,0,7);c.fill();c.restore()}
/* createMap(canvas,{player:()=>P, ways:()=>W, R:()=>R, items:()=>[{x,y,draw(cx,X,Y,t,api)}], onTap(hit,worldXY)}) */
function createMap(cv,o){var cx=cv.getContext("2d"),dpr=1,cw=0,ch=0,V={s:.5,ox:0,oy:0,follow:true},still=matchMedia("(prefers-reduced-motion: reduce)").matches,pd=null;
  function resize(){dpr=window.devicePixelRatio||1;cw=cv.clientWidth;ch=cv.clientHeight;cv.width=cw*dpr;cv.height=ch*dpr}
  addEventListener("resize",resize);
  var P=function(){return o.player()},sx=function(x){return(x-(V.follow?P().x:V.ox))*V.s+cw/2},sy=function(y){return(y-(V.follow?P().y:V.oy))*V.s+ch/2};
  var api={V:V,sx:sx,sy:sy,ghost:ghost,still:still,cx:cx,resize:resize,fit:function(R){V.follow=true;V.s=Math.min(innerWidth,innerHeight)/(R*1.5)},zoom:function(f){V.s=Math.min(4,Math.max(.1,V.s*f))},follow:function(){V.follow=true},
    size:function(){return[cw,ch]}};
  api.draw=function(t){var W=o.ways(),p=P();cx.setTransform(dpr,0,0,dpr,0,0);cx.fillStyle="#101a2b";cx.fillRect(0,0,cw,ch);cx.lineCap="round";cx.lineJoin="round";
    for(var i=0;i<W.length;i++){var w=W[i];cx.strokeStyle=w.w===9?"#173f5c":w.w===1?"#22324f":"#2c3f62";cx.lineWidth=Math.max(1.2,(w.w===9?30:w.w===3?9:w.w===2?6:2.5)*V.s);cx.beginPath();for(var k=0;k<w.p.length;k+=2){var X=sx(w.p[k]),Y=sy(w.p[k+1]);k?cx.lineTo(X,Y):cx.moveTo(X,Y)}cx.stroke()}
    cx.font="italic 12px Georgia,serif";cx.textAlign="center";cx.fillStyle="#5f8fb0";for(i=0;i<W.length;i++){w=W[i];if(w.w===9&&w.n){var m=Math.floor(w.p.length/4)*2;cx.fillText(w.n,sx(w.p[m]),sy(w.p[m+1])+4)}}
    cx.strokeStyle="rgba(147,166,198,.25)";cx.setLineDash([4,8]);cx.lineWidth=1;cx.beginPath();cx.arc(sx(0),sy(0),o.R()*V.s,0,7);cx.stroke();cx.setLineDash([]);
    cx.font="600 12px 'Barlow Condensed','Arial Narrow',sans-serif";cx.textAlign="center";
    o.items().forEach(function(it){it.draw(cx,sx(it.x),sy(it.y),t,api)});
    var X=sx(p.x),Y=sy(p.y);cx.fillStyle="rgba(240,166,58,.12)";cx.beginPath();cx.arc(X,Y,35*V.s,0,7);cx.fill();cx.strokeStyle="rgba(240,166,58,.5)";cx.lineWidth=1;cx.stroke();
    cx.fillStyle="#f0a63a";cx.beginPath();cx.arc(X,Y,7,0,7);cx.fill();cx.strokeStyle="#101a2b";cx.lineWidth=2;cx.stroke()};
  cv.addEventListener("pointerdown",function(e){pd={x:e.clientX,y:e.clientY,ox:V.follow?P().x:V.ox,oy:V.follow?P().y:V.oy,drag:false};try{cv.setPointerCapture(e.pointerId)}catch(err){}});
  cv.addEventListener("pointermove",function(e){if(!pd)return;var dx=e.clientX-pd.x,dy=e.clientY-pd.y;if(!pd.drag&&Math.hypot(dx,dy)>8)pd.drag=true;if(pd.drag){V.follow=false;V.ox=pd.ox-dx/V.s;V.oy=pd.oy-dy/V.s}});
  cv.addEventListener("pointerup",function(e){if(!pd)return;if(!pd.drag){var b=cv.getBoundingClientRect(),mx=e.clientX-b.left,my=e.clientY-b.top,hit=null;
    o.items().forEach(function(it){if(it.tap!==false&&Math.hypot(sx(it.x)-mx,sy(it.y)-my)<30)hit=it});
    var wx=(mx-cw/2)/V.s+(V.follow?P().x:V.ox),wy=(my-ch/2)/V.s+(V.follow?P().y:V.oy);o.onTap&&o.onTap(hit,{x:wx,y:wy})}pd=null});
  resize();return api}

/* ---------- gps ---------- */
var watchId=null;
function watch(origin,P,onMove){stopWatch();if(!navigator.geolocation)return;
  watchId=navigator.geolocation.watchPosition(function(p){var x=(p.coords.longitude-origin.lon)*origin.kx,y=-(p.coords.latitude-origin.lat)*origin.ky,d=Math.hypot(x-P.x,y-P.y);if(d>3){P.x=x;P.y=y}P.acc=p.coords.accuracy||0;onMove&&onMove(d)},function(){},{enableHighAccuracy:true,maximumAge:2000});
  try{navigator.wakeLock&&navigator.wakeLock.request("screen").catch(function(){})}catch(e){}}
function stopWatch(){if(watchId!=null&&navigator.geolocation){navigator.geolocation.clearWatch(watchId)}watchId=null}

/* ---------- ui: vellen, toast, laadscherm, geluid ---------- */
function toast(t){var e=$("#toast");if(!e)return;e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){e.hidden=true},2600)}
function sheet(html,lock){var b=$("#sheetBody");b.innerHTML=html;$("#sheet").hidden=false;b.scrollTop=0;if(lock)$("#sheet").dataset.lock="1";else delete $("#sheet").dataset.lock;return b}
function closeSheet(){$("#sheet").hidden=true;delete $("#sheet").dataset.lock}
function loading(txt){var l=$("#load");if(!l)return;l.hidden=!txt;if(txt)$("#loadT").textContent=txt}
function buzz(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
var AC=null,sndOn=LS.get("ss_snd",true);
function beep(f,d){if(!sndOn)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;o.type="triangle";g.gain.value=.08;g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function sound(v){if(v===undefined)return sndOn;sndOn=!!v;LS.set("ss_snd",sndOn);return sndOn}
document.addEventListener("DOMContentLoaded",function(){var s=$("#sheet");if(s)s.addEventListener("click",function(e){if(e.target.id==="sheet"&&!s.dataset.lock)closeSheet()})});

MW.Walk={rngOf:rngOf,shuffle:shuffle,PRI:PRI,poiType:poiType,fetchWorld:fetchWorld,locate:locate,demoWorld:demoWorld,pickSpots:pickSpots,createMap:createMap,ghost:ghost,
  watch:watch,stopWatch:stopWatch,toast:toast,sheet:sheet,closeSheet:closeSheet,loading:loading,buzz:buzz,beep:beep,sound:sound};
})();
