/* Moordwandeling / Murder Walk – binnen-stand: lopen op stappen in plaats van gps.
   Twee manieren, één interface:
   - "sensor": telt echte stappen met de bewegingssensor van de telefoon (devicemotion). De telefoon moet meebewegen (hand, zak, armband).
   - "tempo":  de telefoon staat stil (loopband, hometrainer); de stappen lopen op een gekozen tempo (stappen per minuut).
   Een website kan de stappenteller van de telefoon (Gezondheid, Google Fit) niet uitlezen; daarom tellen we hier zelf.
   Vereist platform.js. Gebruik: MW.Steps.ask().then(ok=>…) vanuit een tik (iPhone vraagt dan toestemming),
   daarna MW.Steps.start({mode,spm,active:()=>bool,onStep:n=>…,onDead:()=>…}) en MW.Steps.stop(). */
(function(){
"use strict";
var MW=window.MW;

/* detector(): voer versnellingen in (m/s², inclusief zwaartekracht) met een tijdstempel in ms; geeft het aantal nieuwe stappen terug.
   Werkt op de grootte van de versnelling, dus de stand van de telefoon maakt niet uit.
   - de zwaartekracht (traag gemiddelde) gaat eraf, de rest wordt licht afgevlakt;
   - een stap is een piek boven een drempel die meebeweegt met hoe hard je loopt, met minstens 260 ms tussen twee stappen;
   - losse schokken (telefoon oppakken, tikken op het scherm) tellen niet: pas bij de vierde stap in een regelmatig ritme telt de reeks mee
     (elke tussentijd moet in de buurt van de vorige liggen). */
function detector(){
  var g=9.81,lp=0,lastT=0,above=false,peak=0,lastStep=0,run=0,amp=1.6,first=true,pg=0;
  return function(ax,ay,az,t){
    var m=Math.sqrt(ax*ax+ay*ay+az*az);if(!(m>=0))return 0;
    if(first){g=m;first=false;lastT=t;return 0}
    var dt=Math.max(1,Math.min(120,t-lastT));lastT=t;
    g+=(m-g)*(1-Math.exp(-dt/900));
    lp+=((m-g)-lp)*(1-Math.exp(-dt/55));
    var thr=Math.max(.55,amp*.38),n=0;
    if(!above){if(lp>thr&&t-lastStep>260){above=true;peak=lp}}
    else{if(lp>peak)peak=lp;
      if(lp<thr*.35){above=false;var gap=t-lastStep;lastStep=t;amp+=(Math.min(peak,9)-amp)*.2;
        if(gap>1800||(pg&&(gap<pg*.55||gap>pg*1.8))){run=1;pg=0}else{run++;pg=pg?pg+(gap-pg)*.3:gap}
        if(run===4)n=4;else if(run>4)n=1}}
    return n}}

var S={mode:"",spm:110,o:null,det:null,seen:0,last:0,timer:0,acc:0,tick:0,dead:0,want:false,wl:null};
function onMotion(e){
  var a=e.accelerationIncludingGravity,v=a&&a.x!=null?a:null;if(!v)return;
  S.seen++;var t=e.timeStamp||Date.now(),n=S.det(v.x||0,v.y||0,v.z||0,t);
  if(n&&S.o&&S.o.active()){S.last=Date.now();S.o.onStep(n)}}
function onTempo(){
  var now=Date.now(),dt=Math.min(1500,now-S.tick);S.tick=now;
  if(!S.o||!S.o.active()){S.acc=0;return}
  S.acc+=dt/60000*S.spm;var n=Math.floor(S.acc);if(n>0){S.acc-=n;S.last=now;S.o.onStep(n)}}
function stop(){
  removeEventListener("devicemotion",onMotion);clearInterval(S.timer);clearTimeout(S.dead);S.timer=0;S.dead=0;S.mode="";S.o=null}
function start(o){
  stop();S.o=o;S.mode=o.mode==="sensor"?"sensor":"tempo";S.spm=o.spm||110;S.last=Date.now();
  if(S.mode==="sensor"){S.det=detector();S.seen=0;addEventListener("devicemotion",onMotion);
    // geen enkele meting binnen 4 s: dit toestel (of deze browser) geeft geen beweging door
    S.dead=setTimeout(function(){if(S.mode==="sensor"&&!S.seen&&o.onDead){var f=o.onDead;stop();f()}},4000)}
  else{S.tick=Date.now();S.acc=0;S.timer=setInterval(onTempo,250)}}
/* ask(): toestemming voor de bewegingssensor; moet vanuit een tik worden aangeroepen (iPhone). Geeft true/false. */
function ask(){
  if(!("DeviceMotionEvent" in window))return Promise.resolve(false);
  try{if(typeof DeviceMotionEvent.requestPermission==="function")return DeviceMotionEvent.requestPermission().then(function(r){return r==="granted"},function(){return false})}catch(e){return Promise.resolve(false)}
  return Promise.resolve(true)}
/* awake(true/false): houd het scherm aan zolang er binnen gelopen wordt; na terugkomen op de pagina opnieuw aanvragen */
function awake(on){S.want=!!on;
  if(!on){if(S.wl){try{S.wl.release()}catch(e){}S.wl=null}return}
  try{if(navigator.wakeLock)navigator.wakeLock.request("screen").then(function(l){S.wl=l}).catch(function(){})}catch(e){}}
document.addEventListener("visibilitychange",function(){if(!document.hidden&&S.want)awake(true)});

MW.Steps={detector:detector,supported:function(){return "DeviceMotionEvent" in window},ask:ask,start:start,stop:stop,awake:awake,
  mode:function(){return S.mode},last:function(){return S.last},tempo:function(spm){S.spm=spm}};
if(typeof module!=="undefined")module.exports={detector:detector};
})();
