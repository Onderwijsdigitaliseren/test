/* De Erfenis van de Spellenmaker – spellen, deel A: gereedschap, tekeningen, legpuzzel, Drie Torens (kaarten), Knikkers (drie op een rij).
   Elk spel: SM_GAMES.<naam>(host, o) → {stop(), hint(), auto()}.
   o = {seed, lvl, T (teksten), done({stars,time}), status(tekst), sfx(naam)}. Taalonafhankelijk: alle tekst komt uit o.T. */
(function(){
"use strict";
var S=window.SM_GAMES=window.SM_GAMES||{};
/* beelden uit img/: pic(naam,cb) geeft het beeld terug zodra het geladen is, anders null (en roept cb aan als het binnen is) */
var IMGB=(function(){var s=document.currentScript&&document.currentScript.src||"";return s?s.replace(/spel-a\.js.*$/,"img/"):"../games/spellenmaker/img/"})(),IMC={};
function pic(n,cb){var im=IMC[n];if(!im){im=IMC[n]=new Image();im._cb=[];im.onload=function(){im._ok=1;var l=im._cb;im._cb=[];l.forEach(function(f){f()})};im.onerror=function(){im._cb=[]};im.src=IMGB+n}
  if(im._ok)return im;if(cb)im._cb.push(cb);return null}
function cover(g,im,x,y,w,h,fy){var s=Math.max(w/im.naturalWidth,h/im.naturalHeight),sw=w/s,sh=h/s;g.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)*(fy==null?.5:fy),sw,sh,x,y,w,h)}
S.pic=pic;S.cover=cover;S.IMG=IMGB;
function rngOf(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function shuffle(a,r){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
/* canvas(host,W,H): een logisch vlak van W×H dat meeschaalt met de ruimte in host */
function canvas(host,W,H){
  var c=document.createElement("canvas");c.className="smCv";c.style.touchAction="none";host.appendChild(c);
  var g=c.getContext("2d"),k={c:c,g:g,W:W,H:H,s:1,dpr:1,onfit:null};
  k.fit=function(){var bw=host.clientWidth||W,bh=host.clientHeight||0,s=bw/W;if(bh>60&&H*s>bh)s=bh/H;s=Math.max(.5,Math.min(s,1.7));k.s=s;k.dpr=Math.min(2.5,window.devicePixelRatio||1);
    c.style.width=Math.round(W*s)+"px";c.style.height=Math.round(H*s)+"px";c.width=Math.round(W*s*k.dpr);c.height=Math.round(H*s*k.dpr);g.setTransform(s*k.dpr,0,0,s*k.dpr,0,0);if(k.onfit)k.onfit()};
  k.at=function(e){var b=c.getBoundingClientRect();return[(e.clientX-b.left)/b.width*W,(e.clientY-b.top)/b.height*H]};
  var rs=function(){k.fit()};addEventListener("resize",rs);
  k.kill=function(){removeEventListener("resize",rs);if(c.parentNode)c.parentNode.removeChild(c)};
  k.fit();return k}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function mmss(ms){var s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
/* banner(g,W,H,b): tussenkaart over het speelveld, b={eye,title,text,tap}. Het spel tekent hem zelf en vangt de tik af. */
function wrap(g,t,w){var out=[],line="";String(t||"").split(" ").forEach(function(wd){var tr=line?line+" "+wd:wd;if(g.measureText(tr).width>w&&line){out.push(line);line=wd}else line=tr});if(line)out.push(line);return out}
function banner(g,W,H,b){g.save();g.fillStyle="rgba(8,24,20,.86)";g.fillRect(0,0,W,H);
  var pw=W-40,lines;g.font="500 15px 'Barlow',sans-serif";lines=wrap(g,b.text,pw-36);var ph=118+lines.length*21,px=20,py=Math.max(8,(H-ph)/2);
  g.fillStyle="#f3e7c6";rr(g,px,py,pw,ph,10);g.fill();g.strokeStyle="#f2b632";g.lineWidth=2;rr(g,px+5,py+5,pw-10,ph-10,7);g.stroke();
  g.textAlign="center";g.fillStyle="#8a5a34";g.font="600 12px 'Barlow Condensed',sans-serif";g.fillText(String(b.eye||"").toUpperCase().split("").join(String.fromCharCode(8202)),W/2,py+30);
  g.fillStyle="#231709";g.font="400 24px 'Abril Fatface',Georgia,serif";g.fillText(b.title||"",W/2,py+60);
  g.fillStyle="#3b2a17";g.font="500 15px 'Barlow',sans-serif";lines.forEach(function(l,i){g.fillText(l,W/2,py+88+i*21)});
  g.fillStyle="#d6452f";g.font="700 15px 'Barlow Condensed',sans-serif";g.fillText(String(b.tap||"").toUpperCase(),W/2,py+ph-20);g.restore()}
S.kit={rngOf:rngOf,shuffle:shuffle,canvas:canvas,rr:rr,mmss:mmss,still:still,banner:banner,wrap:wrap};

/* ================= tekeningen ================= */
/* houten kegelpop; o: c (lijf), skin, hold "L"|"R" (de eigen linker- of rechterhand van de pop), item, extra(g,x,hy,hr) */
function doll(g,x,y,h,o){
  var bw=h*.36,hy=y-h*.80,hr=h*.15,sh=y-h*.6;
  g.fillStyle=o.c;g.beginPath();g.moveTo(x-bw*.62,y);g.quadraticCurveTo(x-bw*.72,y-h*.42,x-bw*.36,y-h*.66);g.lineTo(x+bw*.36,y-h*.66);g.quadraticCurveTo(x+bw*.72,y-h*.42,x+bw*.62,y);g.closePath();g.fill();
  g.fillStyle="rgba(0,0,0,.14)";g.beginPath();g.moveTo(x+bw*.1,y);g.quadraticCurveTo(x+bw*.5,y-h*.4,x+bw*.2,y-h*.66);g.lineTo(x+bw*.36,y-h*.66);g.quadraticCurveTo(x+bw*.72,y-h*.42,x+bw*.62,y);g.closePath();g.fill();
  g.lineCap="round";g.strokeStyle=o.c;g.lineWidth=h*.075;
  [-1,1].forEach(function(sd){var held=(o.hold==="R"&&sd===-1)||(o.hold==="L"&&sd===1),hx=x+sd*bw*(held?.9:.74),hY=held?y-h*.5:y-h*.3;
    g.beginPath();g.moveTo(x+sd*bw*.4,sh);g.quadraticCurveTo(x+sd*bw*.82,sh+h*.08,hx,hY);g.stroke();
    g.fillStyle=o.skin||"#f0c6a0";g.beginPath();g.arc(hx,hY,h*.045,0,7);g.fill();
    if(held&&o.item)o.item(g,hx,hY,h,sd)});
  g.fillStyle=o.skin||"#f0c6a0";g.beginPath();g.arc(x,hy,hr,0,7);g.fill();
  g.fillStyle="#2a2018";g.beginPath();g.arc(x-hr*.36,hy-hr*.05,hr*.09,0,7);g.arc(x+hr*.36,hy-hr*.05,hr*.09,0,7);g.fill();
  g.strokeStyle="#7a3b2a";g.lineWidth=1;g.beginPath();g.arc(x,hy+hr*.3,hr*.3,.2,2.94);g.stroke();
  if(o.extra)o.extra(g,x,hy,hr)}
var IT={
  glas:function(g,x,y,h){g.strokeStyle="#f4ead2";g.lineWidth=1.4;g.beginPath();g.moveTo(x,y-h*.02);g.lineTo(x,y-h*.11);g.stroke();g.fillStyle="rgba(196,46,60,.9)";g.beginPath();g.moveTo(x-h*.045,y-h*.18);g.lineTo(x+h*.045,y-h*.18);g.lineTo(x,y-h*.1);g.closePath();g.fill();g.stroke()},
  pijpje:function(g,x,y,h,sd){g.strokeStyle="#1d1712";g.lineWidth=1.6;g.beginPath();g.moveTo(x,y-h*.02);g.lineTo(x+sd*h*.2,y-h*.14);g.stroke();g.fillStyle="#f29a3a";g.beginPath();g.arc(x+sd*h*.2,y-h*.14,1.8,0,7);g.fill()},
  telefoon:function(g,x,y,h){g.fillStyle="#1a2030";rr(g,x-h*.035,y-h*.13,h*.07,h*.13,1.5);g.fill();g.fillStyle="#7fd1ff";g.fillRect(x-h*.022,y-h*.115,h*.044,h*.085)},
  kaarten:function(g,x,y,h){for(var i=-1;i<=1;i++){g.save();g.translate(x,y);g.rotate(i*.34);g.fillStyle="#fffaf0";g.strokeStyle="#5a4632";g.lineWidth=.7;rr(g,-h*.04,-h*.17,h*.08,h*.12,1);g.fill();g.stroke();g.fillStyle=i?"#c22a2a":"#1d1712";g.fillRect(-h*.012,-h*.13,h*.024,h*.024);g.restore()}},
  potlood:function(g,x,y,h,sd){g.fillStyle="#f5efe0";g.strokeStyle="#5a4632";g.lineWidth=.7;rr(g,x-h*.06,y-h*.12,h*.12,h*.1,1);g.fill();g.stroke();g.strokeStyle="#e0a020";g.lineWidth=2;g.beginPath();g.moveTo(x+sd*h*.02,y-h*.02);g.lineTo(x+sd*h*.1,y-h*.17);g.stroke()}
};
var HEAD={
  hugo:function(g,x,hy,hr){g.fillStyle="#b9b4aa";g.beginPath();g.arc(x,hy-hr*.15,hr*1.02,Math.PI*1.02,Math.PI*1.98);g.fill();g.fillStyle="#8d877c";g.beginPath();g.ellipse(x,hy+hr*.2,hr*.5,hr*.14,0,0,7);g.fill()},
  odette:function(g,x,hy,hr){g.fillStyle="#3b2a44";g.beginPath();g.arc(x,hy,hr*1.08,Math.PI*.95,Math.PI*2.05);g.fill();g.fillStyle="#6c3f86";g.beginPath();g.ellipse(x,hy-hr*.62,hr*1.75,hr*.32,0,0,7);g.fill();g.beginPath();g.ellipse(x,hy-hr*.95,hr*.85,hr*.55,0,Math.PI,0);g.fill();
    g.strokeStyle="#f2b632";g.lineWidth=2;g.beginPath();g.moveTo(x+hr*.6,hy-hr*1);g.quadraticCurveTo(x+hr*1.6,hy-hr*2.4,x+hr*.5,hy-hr*2.5);g.stroke()},
  augustus:function(g,x,hy,hr){g.fillStyle="#f4f1ea";g.beginPath();g.moveTo(x-hr*.75,hy+hr*.25);g.lineTo(x+hr*.75,hy+hr*.25);g.lineTo(x,hy+hr*1.75);g.closePath();g.fill();
    g.beginPath();g.arc(x-hr*.92,hy-hr*.1,hr*.34,0,7);g.arc(x+hr*.92,hy-hr*.1,hr*.34,0,7);g.fill();
    g.strokeStyle="#2a2018";g.lineWidth=1;g.beginPath();g.arc(x-hr*.36,hy-hr*.05,hr*.26,0,7);g.moveTo(x+hr*.62,hy-hr*.05);g.arc(x+hr*.36,hy-hr*.05,hr*.26,0,7);g.stroke();
    g.strokeStyle="#4a2e1a";g.lineWidth=2;g.beginPath();g.moveTo(x+hr*.25,hy+hr*.5);g.lineTo(x+hr*1.25,hy+hr*.7);g.stroke();g.fillStyle="#4a2e1a";g.fillRect(x+hr*1.1,hy+hr*.35,hr*.45,hr*.5)},
  mathilde:function(g,x,hy,hr){g.fillStyle="#6b4226";g.beginPath();g.arc(x,hy-hr*.1,hr*1.04,Math.PI*1.0,Math.PI*2.0);g.fill();g.beginPath();g.arc(x,hy-hr*1.2,hr*.48,0,7);g.fill();
    g.strokeStyle="#1b1b1b";g.lineWidth=1.1;g.beginPath();g.rect(x-hr*.66,hy-hr*.28,hr*.52,hr*.42);g.rect(x+hr*.14,hy-hr*.28,hr*.52,hr*.42);g.moveTo(x-hr*.14,hy-hr*.08);g.lineTo(x+hr*.14,hy-hr*.08);g.stroke()},
  ruben:function(g,x,hy,hr){g.fillStyle="#44505c";g.beginPath();g.ellipse(x,hy-hr*.62,hr*1.12,hr*.5,0,Math.PI,0);g.fill();g.beginPath();g.ellipse(x-hr*.75,hy-hr*.56,hr*.75,hr*.17,-.12,0,7);g.fill();
    g.fillStyle="rgba(60,40,30,.28)";g.beginPath();g.arc(x,hy+hr*.25,hr*.78,.15,2.99);g.fill()},
  pien:function(g,x,hy,hr){g.fillStyle="#c9772e";g.beginPath();g.arc(x,hy-hr*.12,hr*1.05,Math.PI*.98,Math.PI*2.02);g.fill();g.beginPath();g.moveTo(x+hr*.8,hy-hr*.7);g.quadraticCurveTo(x+hr*2.1,hy-hr*.4,x+hr*1.5,hy+hr*1.2);g.quadraticCurveTo(x+hr*1.2,hy+hr*.1,x+hr*.7,hy-hr*.1);g.closePath();g.fill()}
};
/* kapstok met bolhoed, lange jas en wandelstok (st.cane: 0 = stok staat ertegen) */
function kapstok(g,x,y,H,cane){
  g.strokeStyle="#3b2616";g.lineWidth=3.5;g.lineCap="round";g.beginPath();g.moveTo(x,y);g.lineTo(x,y-H);g.moveTo(x-9,y);g.lineTo(x+9,y);g.moveTo(x-10,y-H+6);g.lineTo(x+10,y-H+6);g.stroke();
  g.fillStyle="#2b2d3a";g.beginPath();g.moveTo(x+2,y-H+10);g.lineTo(x+16,y-H+14);g.lineTo(x+19,y-H*.25);g.lineTo(x+3,y-H*.22);g.closePath();g.fill();
  g.fillStyle="#15161c";g.beginPath();g.ellipse(x-9,y-H+3,10,2.6,0,0,7);g.fill();g.beginPath();g.ellipse(x-9,y-H+1,6,6.5,0,Math.PI,0);g.fill();
  if(!cane){g.strokeStyle="#7a4a1e";g.lineWidth=2.4;g.beginPath();g.moveTo(x+26,y);g.lineTo(x+21,y-H*.62);g.stroke();g.beginPath();g.arc(x+17,y-H*.62,4,Math.PI,0);g.stroke()}}
/* de familiefoto (voor de legpuzzel) */
function foto(g,w,h){
  var im=pic("foto.webp");if(im){cover(g,im,0,0,w,h);return}
  var s=w/320;g.save();g.scale(s,s);
  g.fillStyle="#f6efdf";g.fillRect(0,0,320,240);
  g.save();g.beginPath();g.rect(9,9,302,206);g.clip();
  var wg=g.createLinearGradient(0,9,0,180);wg.addColorStop(0,"#27564b");wg.addColorStop(1,"#1d443b");g.fillStyle=wg;g.fillRect(9,9,302,180);
  g.strokeStyle="rgba(242,182,50,.16)";g.lineWidth=1;for(var x=20;x<312;x+=22){g.beginPath();g.moveTo(x,9);g.lineTo(x,150);g.stroke();g.beginPath();g.arc(x,40+(x%44),3,0,7);g.stroke()}
  g.fillStyle="#6a4326";g.fillRect(9,150,302,34);g.fillStyle="#7c5130";for(x=14;x<310;x+=37)g.fillRect(x,155,31,24);
  g.fillStyle="#a8743e";g.fillRect(9,184,302,31);g.strokeStyle="rgba(60,34,14,.4)";for(x=9;x<312;x+=28){g.beginPath();g.moveTo(x,184);g.lineTo(x-10,215);g.stroke()}
  /* slinger */
  g.strokeStyle="#f6efdf";g.lineWidth=1;g.beginPath();g.moveTo(9,22);g.quadraticCurveTo(160,46,311,22);g.stroke();
  var FC=["#d6452f","#f2b632","#3d86c6","#f6efdf"];for(var i=0;i<13;i++){var fx=22+i*23,fy=22+Math.sin((fx-9)/302*Math.PI)*12;g.fillStyle=FC[i%4];g.beginPath();g.moveTo(fx-7,fy);g.lineTo(fx+7,fy);g.lineTo(fx,fy+13);g.closePath();g.fill()}
  g.fillStyle="#f2b632";g.beginPath();g.arc(160,62,15,0,7);g.fill();g.fillStyle="#1d443b";g.font="700 16px Georgia,serif";g.textAlign="center";g.fillText("81",160,68);
  /* trap rechts */
  g.fillStyle="#5a371c";for(i=0;i<6;i++)g.fillRect(262+i*9,196-(i+1)*13,60,13*(i+1));
  g.strokeStyle="#3b2616";g.lineWidth=4;g.lineCap="round";g.beginPath();g.moveTo(262,196);g.lineTo(262,140);g.moveTo(262,146);g.lineTo(316,68);g.stroke();g.fillStyle="#f2b632";g.beginPath();g.arc(262,137,4.5,0,7);g.fill();
  g.lineWidth=1.6;for(i=1;i<6;i++){g.beginPath();g.moveTo(262+i*9+2,196-i*13);g.lineTo(262+i*9+2,146-i*13);g.stroke()}
  kapstok(g,30,205,112,0);
  /* zes poppen: Hugo, Odette, Augustus, Mathilde, Ruben, Pien */
  doll(g,70,206,100,{c:"#3a3f52",hold:"R",item:IT.glas,extra:HEAD.hugo});
  doll(g,104,206,86,{c:"#7b4a94",hold:"R",item:IT.pijpje,extra:HEAD.odette});
  doll(g,140,206,82,{c:"#d6452f",extra:HEAD.augustus});
  doll(g,176,206,92,{c:"#2f6f9f",hold:"R",item:IT.telefoon,extra:HEAD.mathilde});
  doll(g,212,206,86,{c:"#b8862b",hold:"L",item:IT.kaarten,extra:HEAD.ruben});
  doll(g,244,206,76,{c:"#3f9a6a",hold:"L",item:IT.potlood,extra:HEAD.pien});
  g.restore();
  g.fillStyle="rgba(110,70,30,.10)";g.fillRect(9,9,302,206);
  g.fillStyle="#5a4632";g.font="italic 13px Georgia,serif";g.textAlign="left";g.fillText("Zaterdag, 19:05",14,232);g.textAlign="right";g.fillText("A.T. 81",306,232);
  g.restore()}
/* de trap in de werkplaats; na=0: zaterdag 19:05, na=1: zondagochtend (zeven verschillen) */
function trap(g,w,h,na){
  var im=pic(na?"trap-na.webp":"trap-voor.webp");if(im){g.drawImage(im,0,0,w,h);return}
  var s=w/340,i,x;g.save();g.scale(s,s);g.beginPath();g.rect(0,0,340,210);g.clip();
  var wg=g.createLinearGradient(0,0,0,172);wg.addColorStop(0,"#7d332c");wg.addColorStop(1,"#632620");g.fillStyle=wg;g.fillRect(0,0,340,172);
  g.strokeStyle="rgba(246,239,223,.09)";g.lineWidth=5;for(x=10;x<340;x+=20){g.beginPath();g.moveTo(x,0);g.lineTo(x,132);g.stroke()}
  g.fillStyle="#5b3a22";g.fillRect(0,132,340,40);g.fillStyle="#694528";for(x=6;x<340;x+=42)g.fillRect(x,137,36,30);
  g.fillStyle="#9a6c3c";g.fillRect(0,172,340,38);g.strokeStyle="rgba(60,34,14,.45)";g.lineWidth=1;for(x=0;x<360;x+=30){g.beginPath();g.moveTo(x,172);g.lineTo(x-12,210);g.stroke()}
  /* lamp */
  g.strokeStyle="#1c1410";g.lineWidth=1.5;g.beginPath();g.moveTo(232,0);g.lineTo(232,12);g.stroke();
  if(!na){var lg=g.createRadialGradient(232,26,2,232,40,70);lg.addColorStop(0,"rgba(255,226,140,.55)");lg.addColorStop(1,"rgba(255,226,140,0)");g.fillStyle=lg;g.fillRect(150,0,170,120)}
  g.fillStyle="#2f6f9f";g.beginPath();g.moveTo(222,12);g.lineTo(242,12);g.lineTo(250,26);g.lineTo(214,26);g.closePath();g.fill();
  g.fillStyle=na?"#8b8676":"#ffe38c";g.beginPath();g.arc(232,28,5.5,0,7);g.fill();
  /* klok */
  g.fillStyle="#4a2e1a";g.beginPath();g.arc(40,40,24,0,7);g.fill();g.fillStyle="#f6efdf";g.beginPath();g.arc(40,40,19,0,7);g.fill();
  g.strokeStyle="#4a2e1a";g.lineWidth=1.4;for(i=0;i<12;i++){var a=i*Math.PI/6;g.beginPath();g.moveTo(40+Math.sin(a)*15,40-Math.cos(a)*15);g.lineTo(40+Math.sin(a)*18,40-Math.cos(a)*18);g.stroke()}
  var hh=na?11+11/60:7+5/60,mm=na?11:5,ha=hh/12*6.283,ma=mm/60*6.283;g.lineCap="round";g.strokeStyle="#1c1410";
  g.lineWidth=2.6;g.beginPath();g.moveTo(40,40);g.lineTo(40+Math.sin(ha)*10,40-Math.cos(ha)*10);g.stroke();
  g.lineWidth=1.7;g.beginPath();g.moveTo(40,40);g.lineTo(40+Math.sin(ma)*15,40-Math.cos(ma)*15);g.stroke();
  g.fillStyle="#d6452f";g.beginPath();g.arc(40,40,2,0,7);g.fill();
  /* gereedschapsbord */
  g.fillStyle="#c9a368";rr(g,62,86,64,46,2);g.fill();g.fillStyle="rgba(60,34,14,.35)";for(x=68;x<124;x+=8)for(i=92;i<130;i+=8){g.beginPath();g.arc(x,i,.8,0,7);g.fill()}
  g.strokeStyle="#6b4226";g.lineWidth=3;g.beginPath();g.moveTo(73,98);g.lineTo(73,124);g.stroke();g.fillStyle="#555b63";g.fillRect(66,93,14,7);
  g.fillStyle="#b8bcc2";g.beginPath();g.moveTo(84,96);g.lineTo(95,96);g.lineTo(95,124);g.closePath();g.fill();g.fillStyle="#6b4226";g.fillRect(84,92,11,6);
  g.strokeStyle="#555b63";g.lineWidth=2;g.beginPath();g.moveTo(101,96);g.lineTo(105,112);g.lineTo(101,126);g.moveTo(108,96);g.lineTo(104,112);g.lineTo(108,126);g.stroke();
  if(!na){g.fillStyle="#f2b632";rr(g,113,94,6,13,2);g.fill();g.strokeStyle="#b8bcc2";g.lineWidth=2;g.beginPath();g.moveTo(116,107);g.lineTo(116,125);g.stroke()}
  else{g.strokeStyle="rgba(60,34,14,.5)";g.lineWidth=1;g.setLineDash([2,2]);g.strokeRect(112,93,8,33);g.setLineDash([])}
  /* plank met speelgoed */
  g.fillStyle="#4a2e1a";g.fillRect(134,62,62,4);
  g.fillStyle="#b8862b";g.beginPath();g.arc(146,52,7,0,7);g.arc(146,42,5,0,7);g.arc(142,38,2.2,0,7);g.arc(150,38,2.2,0,7);g.fill();
  g.fillStyle="#d6452f";g.fillRect(160,50,12,12);g.fillStyle="#3d86c6";g.fillRect(166,38,12,12);g.fillStyle="#f2b632";g.fillRect(173,50,12,12);
  g.fillStyle="#3f9a6a";g.beginPath();g.arc(190,55,7,0,7);g.fill();
  /* kapstok met Hugo's hoed, jas en stok */
  kapstok(g,22,196,96,na);
  /* deur boven */
  g.fillStyle="#3b2616";g.fillRect(314,10,26,50);g.fillStyle="#f2b632";g.beginPath();g.arc(319,38,1.8,0,7);g.fill();
  /* trap: 7 treden van 24×16 vanaf (140,172), overloop op y=60 */
  g.fillStyle="#4a2e1a";g.beginPath();g.moveTo(140,172);for(i=0;i<7;i++){g.lineTo(140+24*i,172-16*(i+1));g.lineTo(140+24*(i+1),172-16*(i+1))}g.lineTo(340,60);g.lineTo(340,172);g.closePath();g.fill();
  g.fillStyle="#b07a44";for(i=0;i<7;i++)g.fillRect(140+24*i-1,172-16*(i+1),26,4);g.fillRect(307,60,33,4);
  /* speelkaart onder de trap */
  if(na){g.save();g.translate(176,191);g.rotate(-.35);g.fillStyle="#fffaf0";g.strokeStyle="#5a4632";g.lineWidth=.8;rr(g,-7,-10,14,20,2);g.fill();g.stroke();g.fillStyle="#15161c";g.font="700 9px Georgia,serif";g.textAlign="center";g.fillText("A",0,-1);g.font="9px serif";g.fillText("♠",0,8);g.restore()}
  /* leuning */
  g.strokeStyle="#2d1b0e";g.lineCap="round";g.lineWidth=1.8;for(i=0;i<7;i++){var px=152+24*i;g.beginPath();g.moveTo(px,172-16*(i+1));g.lineTo(px,172-16*(i+1)-33+(na?i*.9:0));g.stroke()}
  g.lineWidth=5;g.beginPath();g.moveTo(140,172);g.lineTo(140,132);g.moveTo(310,60);g.lineTo(310,20);g.stroke();
  g.fillStyle="#f2b632";g.beginPath();g.arc(140,129,5,0,7);g.arc(310,17,5,0,7);g.fill();
  g.strokeStyle="#6b4226";g.lineWidth=5;g.beginPath();g.moveTo(140,138);if(na)g.lineTo(302,36);else g.lineTo(308,26);g.stroke();
  g.fillStyle="#c9a368";rr(g,299,20,16,14,2);g.fill();
  for(i=0;i<3;i++){g.fillStyle=na?"#1c1410":"#e9e2d0";g.beginPath();g.arc(303+i*4.2,24+(i%2)*6,na?1.3:1.7,0,7);g.fill()}
  /* knikker op de trede en de stok boven aan de trap */
  if(na){var kg=g.createRadialGradient(270,69,1,272,71,6);kg.addColorStop(0,"#d8f0ff");kg.addColorStop(1,"#2f6f9f");g.fillStyle=kg;g.beginPath();g.arc(272,71,5,0,7);g.fill();
    g.strokeStyle="#7a4a1e";g.lineWidth=2.4;g.beginPath();g.moveTo(316,57);g.lineTo(338,55);g.stroke();g.beginPath();g.arc(316,53.5,3.5,Math.PI*.5,Math.PI*1.5);g.stroke()}
  if(na){g.fillStyle="rgba(10,16,30,.20)";g.fillRect(0,0,340,210)}
  g.restore()}
S.art={foto:foto,trap:function(g,w,h){trap(g,w,h*1,0)},doll:doll,drawTrap:trap};

/* ================= 1. Legpuzzel ================= */
S.jig=function(host,o){
  var W=360,H=536,big=o.lvl>1,cols=big?6:5,rows=big?5:4,BW=320,BH=240,bx=20,by=12,pw=BW/cols,ph=BH/rows;
  var r=rngOf(o.seed||11),k=canvas(host,W,H),g=k.g,t0=Date.now(),over=false,raf=0,tm=0,drag=null,dirty=true,i,j;
  var IS=Math.min(3,2*(window.devicePixelRatio||1)),img=document.createElement("canvas");img.width=BW*IS;img.height=BH*IS;var ig=img.getContext("2d");ig.scale(IS,IS);
  function paint(){ig.clearRect(0,0,BW,BH);if(o.art==="trap"){ig.fillStyle="#1c1410";ig.fillRect(0,0,BW,BH);ig.save();ig.translate(0,(BH-BW*210/340)/2);trap(ig,BW,BW*210/340,0);ig.restore()}else foto(ig,BW,BH)}
  paint();pic(o.art==="trap"?"trap-voor.webp":"foto.webp",function(){if(over)return;paint();need()});
  var Hh=[],Vv=[];
  for(i=0;i<=rows;i++){Hh[i]=[];for(j=0;j<cols;j++)Hh[i][j]=(i===0||i===rows)?0:(r()<.5?1:-1)}
  for(i=0;i<rows;i++){Vv[i]=[];for(j=0;j<=cols;j++)Vv[i][j]=(j===0||j===cols)?0:(r()<.5?1:-1)}
  function edge(q,x0,y0,x1,y1,s){if(!s){q.lineTo(x1,y1);return}
    var dx=x1-x0,dy=y1-y0,nx=-dy*s,ny=dx*s,P=function(t,hgt){return[x0+dx*t+nx*hgt,y0+dy*t+ny*hgt]};
    var a=P(.36,0),b=P(.47,.02),c=P(.25,.25),d=P(.5,.25),e=P(.75,.25),f=P(.53,.02),e2=P(.64,0);
    q.lineTo(a[0],a[1]);q.bezierCurveTo(b[0],b[1],c[0],c[1],d[0],d[1]);q.bezierCurveTo(e[0],e[1],f[0],f[1],e2[0],e2[1]);q.lineTo(x1,y1)}
  function path(q,rw,cl){q.moveTo(0,0);edge(q,0,0,pw,0,Hh[rw][cl]);edge(q,pw,0,pw,ph,-Vv[rw][cl+1]);edge(q,pw,ph,0,ph,-Hh[rw+1][cl]);edge(q,0,ph,0,0,Vv[rw][cl]);q.closePath()}
  var ps=[];for(i=0;i<rows;i++)for(j=0;j<cols;j++)ps.push({r:i,c:j,tx:bx+j*pw,ty:by+i*ph,x:4+r()*(W-pw-8),y:by+BH+26+r()*(H-(by+BH+26)-ph-14),lock:false});
  ps=shuffle(ps,r);
  function drawPiece(p,lift){g.save();g.translate(p.x,p.y);g.beginPath();path(g,p.r,p.c);
    if(!p.lock){g.save();g.shadowColor="rgba(0,0,0,.5)";g.shadowBlur=lift?14:5;g.shadowOffsetY=lift?6:2;g.fillStyle="#1d1712";g.fill();g.restore()}
    g.save();g.clip();g.drawImage(img,-p.c*pw,-p.r*ph,BW,BH);g.restore();
    g.strokeStyle=p.lock?"rgba(0,0,0,.18)":"rgba(255,255,255,.35)";g.lineWidth=p.lock?.6:1;g.stroke();g.restore()}
  function draw(){dirty=false;g.clearRect(0,0,W,H);
    g.fillStyle="rgba(0,0,0,.28)";rr(g,bx-6,by-6,BW+12,BH+12,6);g.fill();g.save();g.globalAlpha=.13;g.drawImage(img,bx,by,BW,BH);g.restore();
    g.strokeStyle="rgba(246,239,223,.35)";g.lineWidth=1;g.strokeRect(bx,by,BW,BH);
    g.fillStyle="rgba(246,239,223,.5)";g.font="600 12px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText(o.T.jigTray,W/2,by+BH+20);
    ps.forEach(function(p){if(p.lock)drawPiece(p)});ps.forEach(function(p){if(!p.lock&&(!drag||drag.p!==p))drawPiece(p)});if(drag)drawPiece(drag.p,true)}
  function need(){if(!dirty){dirty=true;raf=requestAnimationFrame(draw)}}
  k.onfit=draw;draw();
  function placed(){return ps.filter(function(p){return p.lock}).length}
  function stat(){o.status(o.T.jigStat.replace("{n}",placed()).replace("{m}",ps.length)+" · "+mmss(Date.now()-t0))}
  tm=setInterval(function(){if(!over)stat()},1000);stat();
  function lockP(p){p.x=p.tx;p.y=p.ty;p.lock=true;o.sfx("klik");stat();need();if(placed()===ps.length)win()}
  function win(){over=true;clearInterval(tm);var t=Date.now()-t0,st=t<=(big?260:150)*1000?3:t<=(big?420:270)*1000?2:1;o.sfx("win");setTimeout(function(){o.done({stars:st,time:t})},900)}
  var c=k.c;
  c.addEventListener("pointerdown",function(e){if(over)return;var q=k.at(e);for(var n=ps.length-1;n>=0;n--){var p=ps[n];if(p.lock)continue;
      if(q[0]>p.x-8&&q[0]<p.x+pw+8&&q[1]>p.y-8&&q[1]<p.y+ph+8){drag={p:p,dx:q[0]-p.x,dy:q[1]-p.y};ps.splice(n,1);ps.push(p);try{c.setPointerCapture(e.pointerId)}catch(err){}o.sfx("tik");need();break}}});
  c.addEventListener("pointermove",function(e){if(!drag)return;var q=k.at(e);drag.p.x=Math.max(-pw*.3,Math.min(W-pw*.7,q[0]-drag.dx));drag.p.y=Math.max(-ph*.3,Math.min(H-ph*.7,q[1]-drag.dy));need()});
  function up(){if(!drag)return;var p=drag.p;drag=null;if(Math.abs(p.x-p.tx)<17&&Math.abs(p.y-p.ty)<17)lockP(p);else need()}
  c.addEventListener("pointerup",up);c.addEventListener("pointercancel",up);
  return{stop:function(){over=true;clearInterval(tm);cancelAnimationFrame(raf);k.kill()},
    hint:function(){var l=ps.filter(function(p){return !p.lock});if(!l.length||over)return false;lockP(l[Math.floor(Math.random()*l.length)]);return true},
    auto:function(){ps.forEach(function(p){if(!p.lock){p.x=p.tx;p.y=p.ty;p.lock=true}});need();win()},
    state:function(){var l=ps.filter(function(p){return !p.lock}),p=l[l.length-1];return{placed:placed(),top:p?[p.x+pw/2,p.y+ph/2,p.tx+pw/2,p.ty+ph/2]:null,W:W,H:H}}}};

/* ================= 2. Drie Torens (kaarten) ================= */
S.torens=function(host,o){
  /* drie rondes: 1 gewoon, 2 met twee jokers in de stapel, 3 met een korte stapel en kaarten "uit de mouw" bij een reeks van vier */
  var W=360,H=318,k=canvas(host,W,H),g=k.g,r=rngOf(o.seed||7),over=false,streak=0,wild=false,raf=0,fly=null,shake=0,tmr=[],t0=Date.now();
  var SU=["♠","♥","♦","♣"],RK=o.T.ranks||["A","2","3","4","5","6","7","8","9","10","B","V","H"],TR=o.T.torRounds||[];
  var RC=o.rounds||[{},{jok:2},{sleeve:9}],ending=false,ri=-1,pts=0,total=0,cleared=0,sleeve=[],intro=null,popT=null;
  var CW=34,CH=50,tab=[],gone=[],stock=[],waste=-1,POS=[],i;
  for(i=0;i<3;i++)POS.push([61+102*i,16]);
  for(i=0;i<6;i++)POS.push([44+102*Math.floor(i/2)+(i%2)*34,16+26]);
  for(i=0;i<9;i++)POS.push([27+34*i,16+52]);
  for(i=0;i<10;i++)POS.push([10+34*i,16+78]);
  function kids(n){if(n<3)return[3+2*n,4+2*n];if(n<9){var j=n-3,b=9+j+Math.floor(j/2);return[b,b+1]}if(n<18)return[n+9,n+10];return null}
  function expo(n,gn){var q=kids(n);return !gn[n]&&(!q||(gn[q[0]]&&gn[q[1]]))}
  function adj(a,b){if(a>=52||b>=52)return true;var d=Math.abs(a%13-b%13);return d===1||d===12}
  function playout(tb,st,w,q){var gn=[],left=28,top=w,si=st.length,n;for(n=0;n<28;n++)gn[n]=false;
    for(;;){var op=[];for(n=0;n<28;n++)if(expo(n,gn)&&adj(tb[n],top))op.push(n);
      if(op.length){var p=op[Math.floor(q()*op.length)];gn[p]=true;top=tb[p];if(--left===0)return true}else if(si>0)top=st[--si];else return false}}
  function deal(){var C=RC[ri]||{},deck=[],n,t,best=null,bw=-1;for(n=0;n<52;n++)if(!(o.miss&&n===0))deck.push(n);
    for(t=0;t<80;t++){var d=shuffle(deck,r),tb=d.slice(0,28),w=d[28],st=d.slice(29),sl=[];
      if(C.sleeve){sl=st.slice(0,C.sleeve);st=st.slice(C.sleeve)}
      if(C.jok){for(n=0;n<C.jok;n++)st.splice(Math.floor(r()*(st.length+1)),0,52+n)}
      var wins=0,q=rngOf(1234+t+ri*97);for(n=0;n<160&&wins<4;n++)if(playout(tb,st.concat(sl.slice(0,3)),w,q))wins++;
      if(wins>bw){bw=wins;best={tb:tb,w:w,st:st,sl:sl}}if(wins>=4)break}
    tab=best.tb;waste=best.w;stock=best.st;sleeve=best.sl;gone=[];for(n=0;n<28;n++)gone[n]=false;streak=0;wild=false;pts=0;stat()}
  function left(){return gone.filter(function(x){return !x}).length}
  function stat(){o.status(fill(o.T.torStat,{r:ri+1,n:RC.length,s:stock.length,p:total+pts}))}
  function fill(t,v){return String(t||"").replace(/\{(\w+)\}/g,function(m,q){return v[q]!=null?v[q]:m})}
  function card(x,y,w,h,v,face,hot){rr(g,x,y,w,h,4);if(!face){g.fillStyle="#1f5d4d";g.fill();g.strokeStyle="#f6efdf";g.lineWidth=1;g.stroke();g.save();rr(g,x+3,y+3,w-6,h-6,2);g.strokeStyle="rgba(242,182,50,.7)";g.stroke();g.fillStyle="rgba(242,182,50,.75)";g.font="700 "+Math.round(w*.42)+"px Georgia,serif";g.textAlign="center";g.fillText("T",x+w/2,y+h/2+w*.15);g.restore();return}
    g.fillStyle=v>=52?"#fff1c2":hot?"#fff6d8":"#fffaf0";g.fill();g.strokeStyle=hot||v>=52?"#f2b632":"#8a7355";g.lineWidth=hot||v>=52?2:1;g.stroke();g.textAlign="center";
    if(v>=52){g.fillStyle="#d6452f";g.font=Math.round(w*.62)+"px serif";g.fillText("★",x+w/2,y+h*.55);g.fillStyle="#231709";g.font="700 "+Math.round(w*.24)+"px 'Barlow Condensed',sans-serif";g.fillText(o.T.torWild,x+w/2,y+h*.86);return}
    var red=(v/13|0)===1||(v/13|0)===2;g.fillStyle=red?"#c8302a":"#1b1b22";g.font="700 "+Math.round(w*.44)+"px 'Barlow Condensed',sans-serif";g.fillText(RK[v%13],x+w/2,y+h*.4);
    g.font=Math.round(w*.5)+"px serif";g.fillText(SU[v/13|0],x+w/2,y+h*.82)}
  function draw(){g.clearRect(0,0,W,H);var n,sx=shake?Math.sin(Date.now()/22)*shake:0;
    for(n=0;n<28;n++){if(gone[n]||(fly&&fly.n===n))continue;var e=expo(n,gone);card(POS[n][0],POS[n][1],CW,CH,tab[n],e,e&&(wild||adj(tab[n],waste)))}
    g.fillStyle="rgba(0,0,0,.25)";rr(g,40,180,280,128,10);g.fill();
    if(stock.length){for(n=Math.min(3,stock.length)-1;n>=0;n--)card(70-n*2,196-n*2,56,82,0,false)}else{g.strokeStyle="rgba(246,239,223,.35)";g.setLineDash([4,4]);rr(g,70,196,56,82,5);g.stroke();g.setLineDash([])}
    g.fillStyle="#f6efdf";g.font="600 13px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText(o.T.torStock+" "+stock.length,98,297);
    if(sleeve.length){g.fillStyle="rgba(242,182,50,.9)";g.font="600 12px 'Barlow Condensed',sans-serif";g.fillText(fill(o.T.torSleeve,{n:sleeve.length}),160,310)}
    card(196+sx,190,62,90,waste,true,false);if(wild){g.strokeStyle="#f2b632";g.lineWidth=3;rr(g,193,187,68,96,7);g.stroke();g.fillStyle="#f2b632";g.font="600 13px 'Barlow Condensed',sans-serif";g.fillText(o.T.torWild,227,299)}
    g.textAlign="right";g.fillStyle="#f2b632";g.font="700 22px 'Barlow Condensed',sans-serif";g.fillText(total+pts,312,212);g.font="600 11px 'Barlow Condensed',sans-serif";g.fillStyle="#f6efdf";g.fillText(o.T.torPts,312,226);
    if(streak>1){g.textAlign="center";g.fillStyle="#f2b632";g.font="700 20px 'Barlow Condensed',sans-serif";g.fillText(o.T.torRun+" ×"+streak,160,170)}
    if(popT&&Date.now()-popT.t<1100){var a=1-(Date.now()-popT.t)/1100;g.globalAlpha=a;g.textAlign="center";g.fillStyle="#f2b632";g.strokeStyle="#1c1410";g.lineWidth=4;g.font="700 24px 'Barlow Condensed',sans-serif";g.strokeText(popT.s,W/2,150-(1-a)*30);g.fillText(popT.s,W/2,150-(1-a)*30);g.globalAlpha=1}
    if(fly){var t=Math.min(1,(Date.now()-fly.t0)/170),ee=1-(1-t)*(1-t),x=fly.x+(196-fly.x)*ee,y=fly.y+(190-fly.y)*ee,w=CW+(62-CW)*ee,hh=CH+(90-CH)*ee;card(x,y,w,hh,fly.v,true,false);if(t>=1){waste=fly.v;fly=null;after()}}
    if(shake){shake*=.86;if(shake<.3)shake=0}
    if(intro)banner(g,W,H,intro);
    if(fly||shake||(popT&&Date.now()-popT.t<1100))raf=requestAnimationFrame(draw)}
  function say(t){popT={s:t,t:Date.now()};cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}
  function next(quiet){ri++;ending=false;if(ri>=RC.length)return finish();deal();var d=TR[ri]||{};if(!quiet)intro={eye:fill(o.T.torRound,{r:ri+1,n:RC.length}),title:d.t||"",text:d.d||"",tap:o.T.tapGo};draw()}
  function endRound(clear){if(intro)return;var bonus=clear?20+2*stock.length:0;if(clear)cleared++;pts+=bonus;total+=pts;
    var d=TR[ri+1],res=clear?fill(o.T.torClear,{p:pts,b:bonus}):fill(left()===1?o.T.torEnd1:o.T.torEnd,{p:pts,n:left()});
    o.sfx(clear?"win":"fout");pts=0;stat();
    intro={eye:fill(o.T.torRound,{r:ri+1,n:RC.length}),title:clear?o.T.torClearH:o.T.torEndH,text:res+(d?" "+fill(o.T.torNext,{t:d.t})+" "+d.d:""),tap:d?o.T.tapNext:o.T.tapEnd,nx:true};draw()}
  function finish(){over=true;var st=cleared>=RC.length?3:cleared>=Math.max(1,RC.length-1)?2:1;o.status(fill(o.T.torFinal,{p:total,c:cleared,n:RC.length}));tmr.push(setTimeout(function(){o.done({stars:st,score:total,time:Date.now()-t0})},500))}
  function after(){stat();if(ending)return draw();if(left()===0){ending=true;draw();tmr.push(setTimeout(function(){if(!over)endRound(true)},500));return}
    var any=false;for(var n=0;n<28;n++)if(expo(n,gone)&&(wild||adj(tab[n],waste)))any=true;
    if(!any&&!stock.length){ending=true;o.status(o.T.torStuck);tmr.push(setTimeout(function(){if(!over)endRound(false)},1200))}draw()}
  function play(n){var top=n<3;gone[n]=true;streak++;pts+=streak+(top?10:0);wild=false;
    if(top)say("+"+(streak+10));
    if(RC[ri].sleeve&&streak%4===0&&sleeve.length){stock.unshift(sleeve.pop());say(o.T.torSleeveGot)}
    fly={n:n,v:tab[n],x:POS[n][0],y:POS[n][1],t0:Date.now()};o.sfx(streak>2?"goed":"tik");raf=requestAnimationFrame(draw)}
  k.c.addEventListener("pointerdown",function(e){if(over||fly)return;
    if(intro){var nx=intro.nx;intro=null;o.sfx("klik");if(nx)next(true);else draw();return}
    if(ending)return;var q=k.at(e),n;
    for(n=27;n>=0;n--){if(gone[n])continue;var p=POS[n];if(q[0]>=p[0]&&q[0]<=p[0]+CW&&q[1]>=p[1]&&q[1]<=p[1]+CH){if(expo(n,gone)&&(wild||adj(tab[n],waste)))play(n);else{shake=5;o.sfx("fout");raf=requestAnimationFrame(draw)}return}}
    if(q[0]>46&&q[0]<160&&q[1]>180&&q[1]<308&&stock.length){waste=stock.pop();streak=0;wild=false;o.sfx("tik");after()}});
  k.onfit=draw;next();
  return{stop:function(){over=true;cancelAnimationFrame(raf);tmr.forEach(clearTimeout);k.kill()},
    hint:function(){if(over||wild||intro)return false;wild=true;draw();return true},
    auto:function(){if(over)return;cleared=RC.length;total+=150;finish()},
    /* test: speel deze ronde gretig uit (geen tik op de stapel als er een zet is) */
    bot:function(){if(over)return"over";if(intro){var nx=intro.nx;intro=null;if(nx)next(true);else draw();return"intro"}if(fly||ending)return"busy";
      for(var n=27;n>=0;n--)if(expo(n,gone)&&adj(tab[n],waste)){play(n);return"play"}if(stock.length){waste=stock.pop();streak=0;after();return"draw"}return"stuck"},
    state:function(){return{round:ri,intro:!!intro,left:left(),stock:stock.length,total:total+pts,cleared:cleared,over:over}}}};

/* ================= 3. Knikkers (drie op een rij) ================= */
S.knikkers=function(host,o){
  /* drie levels: 1 kleuren verzamelen, 2 glas breken (rij 4 en 5 zitten onder glas), 3 dobbelstenen naar de bodem laten zakken */
  var COLS=7,ROWS=8,CS=46,OX=19,OY=74,W=360,H=OY+ROWS*CS+8,k=canvas(host,W,H),g=k.g,r=rngOf(o.seed||3),TL=o.T.kniLevels||[];
  var COL=[["#e2503d","#ffb3a3","#8f2116"],["#f2b632","#ffe9a6","#9c6a08"],["#3d86c6","#b3daf7","#1a4877"],["#46a566","#b9ecc6","#1c5f33"],["#9b62c2","#e0c8f2","#58297a"]],NC=COL.length;
  var LV=o.levels||[{moves:22,goal:[{k:0,n:14},{k:1,n:14},{k:2,n:14}]},{moves:25,ice:[3,4],goal:[{ice:1,n:14},{k:4,n:12}]},{moves:25,dice:3,goal:[{die:1,n:3},{k:3,n:12}]}];
  var li=-1,goal=[],moves=0,got=[],score=0,extra=0,ice=[],intro=null,t0=Date.now();
  var grid=[],busy=true,over=false,sel=null,pd=null,parts=[],texts=[],tw=[],raf=0,last=0,combo=0,x,y;
  function fill(t,v){return String(t||"").replace(/\{(\w+)\}/g,function(m,q){return v[q]!=null?v[q]:m})}
  function cell(kc){return{k:kc,sp:0,ox:0,oy:0,s:1}}
  function rnd(){return Math.floor(r()*NC)}
  function fresh(){grid=[];for(y=0;y<ROWS;y++){grid[y]=[];for(x=0;x<COLS;x++){var kc;do{kc=rnd()}while((x>1&&grid[y][x-1].k===kc&&grid[y][x-2].k===kc)||(y>1&&grid[y-1][x].k===kc&&grid[y-2][x].k===kc));grid[y][x]=cell(kc)}}}
  function startLevel(){var L=LV[li];fresh();moves=L.moves;goal=L.goal;got=goal.map(function(){return 0});ice=[];
    for(y=0;y<ROWS;y++){ice[y]=[];for(x=0;x<COLS;x++)ice[y][x]=L.ice&&L.ice.indexOf(y)>=0?1:0}
    if(L.dice){var cs=[1,3,5,0,6,2,4];for(var d=0;d<L.dice;d++){grid[0][cs[d]]={k:-2,sp:4,ox:0,oy:0,s:1}}}
    var dd=TL[li]||{};intro={eye:fill(o.T.kniLevel,{l:li+1,n:LV.length}),title:dd.t||"",text:dd.d||"",tap:o.T.tapGo};busy=true;combo=0;stat()}
  function addGot(type,kc){goal.forEach(function(gl,gi){if(got[gi]>=gl.n)return;if(type==="c"&&gl.k===kc)got[gi]++;else if(type==="ice"&&gl.ice)got[gi]++;else if(type==="die"&&gl.die)got[gi]++})}
  /* tweens: {o,p,a,b,t,d}; als alles klaar is roept anim(cb) de callback aan */
  function anim(list,cb){if(still)list.forEach(function(q){q.d=1});tw=tw.concat(list);var mx=0;list.forEach(function(q){mx=Math.max(mx,q.d+(q.w||0))});setTimeout(cb,mx+20)}
  function runs(){var out=[],xx,yy,n;
    for(yy=0;yy<ROWS;yy++)for(xx=0;xx<COLS;){var c0=grid[yy][xx].k;n=1;while(xx+n<COLS&&c0>=0&&grid[yy][xx+n].k===c0)n++;if(n>=3&&c0>=0){var a=[];for(var i=0;i<n;i++)a.push([xx+i,yy]);out.push({c:a,h:true})}xx+=n}
    for(xx=0;xx<COLS;xx++)for(yy=0;yy<ROWS;){var c1=grid[yy][xx].k;n=1;while(yy+n<ROWS&&c1>=0&&grid[yy+n][xx].k===c1)n++;if(n>=3&&c1>=0){var b=[];for(var j=0;j<n;j++)b.push([xx,yy+j]);out.push({c:b,h:false})}yy+=n}
    return out}
  function key(p){return p[0]+","+p[1]}
  function pop(set,keep,cb){
    var todo=Object.keys(set),seen={},q;while(todo.length){q=todo.pop();if(seen[q])continue;seen[q]=1;var p=q.split(",").map(Number),c=grid[p[1]][p[0]];if(keep[q])continue;
      if(c.sp===1)for(var i=0;i<COLS;i++){var a=i+","+p[1];if(!set[a]){set[a]=1;todo.push(a)}}
      else if(c.sp===2)for(var j=0;j<ROWS;j++){var b=p[0]+","+j;if(!set[b]){set[b]=1;todo.push(b)}}
      else if(c.sp===3){var kc2=rnd();for(var yy=0;yy<ROWS;yy++)for(var xx=0;xx<COLS;xx++)if(grid[yy][xx].k===kc2){var d=xx+","+yy;if(!set[d]){set[d]=1;todo.push(d)}}}}
    var list=[],cnt=0;Object.keys(set).forEach(function(q2){if(keep[q2])return;var p=q2.split(",").map(Number),c=grid[p[1]][p[0]];if(c.sp===4||c.dead)return;cnt++;
      addGot("c",c.k);
      var cx=OX+p[0]*CS+CS/2,cy=OY+p[1]*CS+CS/2,cl=c.k>=0?COL[c.k][0]:"#fff";for(var n=0;n<5;n++)parts.push({x:cx,y:cy,vx:(Math.random()-.5)*160,vy:(Math.random()-.8)*160,t:.45,c:cl});
      if(ice[p[1]][p[0]]>0){ice[p[1]][p[0]]--;if(!ice[p[1]][p[0]])addGot("ice");for(var m=0;m<7;m++)parts.push({x:cx,y:cy,vx:(Math.random()-.5)*220,vy:(Math.random()-.9)*200,t:.6,c:"#dff3ff"});o.sfx("klik")}
      list.push({o:c,p:"s",a:1,b:0,t:0,d:150});c.dead=true});
    score+=cnt*10*combo;if(combo>1){texts.push({x:W/2,y:OY+ROWS*CS/2,t:1,s:o.T.kniCombo.replace("{n}",combo)})}
    o.sfx(combo>1?"goed":"pop");anim(list,cb)}
  function collapse(cb){var list=[];for(var xx=0;xx<COLS;xx++){var w=ROWS-1,yy;for(yy=ROWS-1;yy>=0;yy--){var c=grid[yy][xx];if(c.dead)continue;if(w!==yy){grid[w][xx]=c;c.oy=-(w-yy)*CS;list.push({o:c,p:"oy",a:c.oy,b:0,t:0,d:110+60*Math.sqrt(w-yy),e:1})}w--}
      for(yy=w;yy>=0;yy--){var nc=cell(rnd());nc.oy=-(w+1)*CS-10;grid[yy][xx]=nc;list.push({o:nc,p:"oy",a:nc.oy,b:0,t:0,d:150+60*Math.sqrt(w+1),e:1})}}
    anim(list,cb)}
  /* dobbelstenen die de bodem raken, vallen uit de zak */
  function diceOut(){var list=[];for(var xx=0;xx<COLS;xx++){var c=grid[ROWS-1][xx];if(c.sp===4&&!c.dead){c.dead=true;addGot("die");list.push({o:c,p:"s",a:1,b:0,t:0,d:260});texts.push({x:OX+xx*CS+CS/2,y:OY+ROWS*CS-30,t:1,s:"✓"})}}return list}
  function resolve(at){var out=diceOut();if(out.length){o.sfx("win");anim(out,function(){collapse(function(){resolve(null)})});return}
    var rs=runs();if(!rs.length){endTurn();return}combo++;var set={},keep={},mk=[];
    rs.forEach(function(run){run.c.forEach(function(p){set[key(p)]=1});
      if(run.c.length>=4){var p0=run.c[Math.floor(run.c.length/2)];if(at)run.c.forEach(function(p){if(at.some(function(a){return a[0]===p[0]&&a[1]===p[1]}))p0=p});mk.push([p0,run.c.length>=5?3:run.h?1:2])}});
    mk.forEach(function(m){var c=grid[m[0][1]][m[0][0]];if(c.sp)return;keep[key(m[0])]=1;c.sp=m[1];addGot("c",c.k);if(m[1]===3)c.k=-1;
      var px=m[0][0],py=m[0][1];if(ice[py][px]>0){ice[py][px]--;if(!ice[py][px])addGot("ice")}});
    pop(set,keep,function(){collapse(function(){resolve(null)})})}
  function hasMove(){var xx,yy,t;for(yy=0;yy<ROWS;yy++)for(xx=0;xx<COLS;xx++){if(grid[yy][xx].sp===3)return true;
      var tr=[[1,0],[0,1]];for(var i=0;i<2;i++){var x2=xx+tr[i][0],y2=yy+tr[i][1];if(x2>=COLS||y2>=ROWS)continue;t=grid[yy][xx];grid[yy][xx]=grid[y2][x2];grid[y2][x2]=t;var ok=runs().length>0;t=grid[yy][xx];grid[yy][xx]=grid[y2][x2];grid[y2][x2]=t;if(ok)return[[xx,yy],[x2,y2]]}}return null}
  /* voor de test-bot: de zet die het meest bijdraagt aan het doel (glas, kolommen onder een dobbelsteen, doelkleur) */
  function bestMove(){var best=null,bs=-1,xx,yy,t,dz={};for(xx=0;xx<COLS;xx++)for(yy=0;yy<ROWS;yy++)if(grid[yy][xx].sp===4)dz[xx]=Math.max(dz[xx]||-1,yy);
    for(yy=0;yy<ROWS;yy++)for(xx=0;xx<COLS;xx++){var tr=[[1,0],[0,1]];for(var i=0;i<2;i++){var x2=xx+tr[i][0],y2=yy+tr[i][1];if(x2>=COLS||y2>=ROWS)continue;
      t=grid[yy][xx];grid[yy][xx]=grid[y2][x2];grid[y2][x2]=t;var rs=runs(),sc=0;
      rs.forEach(function(run){run.c.forEach(function(p){sc+=1;if(ice[p[1]][p[0]])sc+=4;if(dz[p[0]]!=null&&p[1]>dz[p[0]])sc+=4;var c=grid[p[1]][p[0]];goal.forEach(function(gl,gi){if(gl.k===c.k&&got[gi]<gl.n)sc+=2})})});
      t=grid[yy][xx];grid[yy][xx]=grid[y2][x2];grid[y2][x2]=t;if(rs.length&&sc>bs){bs=sc;best=[[xx,yy],[x2,y2]]}}}return best||hasMove()}
  function metGoal(){return goal.every(function(gl,gi){return got[gi]>=gl.n})}
  function stat(){o.status(fill(o.T.kniStat,{l:li+1,n:LV.length,m:moves,p:score}))}
  function endTurn(){combo=0;stat();
    if(metGoal()){o.sfx("win");var last=li>=LV.length-1,nd=TL[li+1];
      if(last){over=true;var st=extra<=1?3:extra<=4?2:1;setTimeout(function(){o.done({stars:st,score:score,time:Date.now()-t0})},700);return}
      setTimeout(function(){intro={eye:fill(o.T.kniLevel,{l:li+1,n:LV.length}),title:o.T.kniDone,text:fill(o.T.kniDoneT,{m:moves})+" "+fill(o.T.torNext,{t:nd.t})+" "+nd.d,tap:o.T.tapNext,nx:true}},600);return}
    if(moves<=0){extra++;moves=5;o.sfx("fout");texts.push({x:W/2,y:OY+ROWS*CS/2,t:1.3,s:o.T.kniExtra});stat()}
    if(!hasMove()){var all=[],pos=[];grid.forEach(function(row,yy){row.forEach(function(c,xx){if(c.sp===4)return;all.push(c.k>=0?c.k:rnd());pos.push([xx,yy])})});
      do{all=shuffle(all,r);pos.forEach(function(p,n){grid[p[1]][p[0]]=cell(all[n])})}while(runs().length||!hasMove());o.status(o.T.kniShuffle)}
    busy=false}
  function swapCells(a,b){var ca=grid[a[1]][a[0]],cb=grid[b[1]][b[0]];grid[a[1]][a[0]]=cb;grid[b[1]][b[0]]=ca;
    cb.ox=(b[0]-a[0])*CS;cb.oy=(b[1]-a[1])*CS;ca.ox=-cb.ox;ca.oy=-cb.oy;
    return[{o:cb,p:"ox",a:cb.ox,b:0,t:0,d:130},{o:cb,p:"oy",a:cb.oy,b:0,t:0,d:130},{o:ca,p:"ox",a:ca.ox,b:0,t:0,d:130},{o:ca,p:"oy",a:ca.oy,b:0,t:0,d:130}]}
  function trySwap(a,b){if(busy||over||intro)return;if(b[0]<0||b[1]<0||b[0]>=COLS||b[1]>=ROWS)return;busy=true;sel=null;var ca=grid[a[1]][a[0]],cb=grid[b[1]][b[0]];
    if(ca.sp===3||cb.sp===3){moves--;o.sfx("tik");anim(swapCells(a,b),function(){combo=1;var set={},rb=grid[a[1]][a[0]].sp===3?a:b,ot=rb===a?b:a,kc2=grid[ot[1]][ot[0]].k;if(kc2===-2)kc2=rnd();
        for(var yy=0;yy<ROWS;yy++)for(var xx=0;xx<COLS;xx++)if(kc2===-1||grid[yy][xx].k===kc2)set[xx+","+yy]=1;set[key(rb)]=1;grid[rb[1]][rb[0]].sp=0;
        pop(set,{},function(){collapse(function(){resolve(null)})})});return}
    o.sfx("tik");anim(swapCells(a,b),function(){if(runs().length){moves--;resolve([a,b])}else{o.sfx("fout");anim(swapCells(a,b),function(){busy=false})}})}
  function die(cx,cy,sz){g.save();g.shadowColor="rgba(0,0,0,.45)";g.shadowBlur=6;g.shadowOffsetY=2;g.fillStyle="#f6efdf";rr(g,cx-sz,cy-sz,sz*2,sz*2,sz*.35);g.fill();g.restore();
    g.strokeStyle="#c9a24a";g.lineWidth=2;rr(g,cx-sz,cy-sz,sz*2,sz*2,sz*.35);g.stroke();g.fillStyle="#d6452f";[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]].forEach(function(p){g.beginPath();g.arc(cx+p[0]*sz*.5,cy+p[1]*sz*.5,sz*.16,0,7);g.fill()})}
  function glass(xx,yy,a){var x0=OX+xx*CS+2,y0=OY+yy*CS+2,w=CS-4;g.save();g.globalAlpha=a;g.fillStyle="rgba(205,236,255,.42)";rr(g,x0,y0,w,w,6);g.fill();g.strokeStyle="rgba(235,248,255,.9)";g.lineWidth=1.5;rr(g,x0,y0,w,w,6);g.stroke();
    g.strokeStyle="rgba(255,255,255,.8)";g.lineWidth=2;g.beginPath();g.moveTo(x0+6,y0+w*.45);g.lineTo(x0+w*.45,y0+6);g.moveTo(x0+10,y0+w*.7);g.lineTo(x0+w*.7,y0+10);g.stroke();g.restore()}
  function marble(cx,cy,rad,c){if(c.sp===4)return die(cx,cy,rad*.9);var cl=c.k>=0?COL[c.k]:["#fff","#fff","#888"],gr=g.createRadialGradient(cx-rad*.35,cy-rad*.4,rad*.1,cx,cy,rad);
    if(c.sp===3){gr=g.createRadialGradient(cx,cy,rad*.1,cx,cy,rad);gr.addColorStop(0,"#fff");gr.addColorStop(.35,"#f2b632");gr.addColorStop(.6,"#e2503d");gr.addColorStop(.8,"#9b62c2");gr.addColorStop(1,"#3d86c6")}
    else{gr.addColorStop(0,cl[1]);gr.addColorStop(.45,cl[0]);gr.addColorStop(1,cl[2])}
    g.fillStyle=gr;g.beginPath();g.arc(cx,cy,rad,0,7);g.fill();
    if(c.k>=0){g.save();g.beginPath();g.arc(cx,cy,rad,0,7);g.clip();g.strokeStyle="rgba(255,255,255,.35)";g.lineWidth=rad*.22;g.beginPath();g.arc(cx+rad*.5,cy+rad*.9,rad*1.1,3.6,5.1);g.stroke();g.restore()}
    g.fillStyle="rgba(255,255,255,.75)";g.beginPath();g.ellipse(cx-rad*.38,cy-rad*.42,rad*.2,rad*.12,-.6,0,7);g.fill();
    if(c.sp===1||c.sp===2){g.strokeStyle="#fff";g.lineWidth=2.6;g.lineCap="round";g.beginPath();if(c.sp===1){g.moveTo(cx-rad*.7,cy);g.lineTo(cx+rad*.7,cy);g.moveTo(cx+rad*.4,cy-rad*.28);g.lineTo(cx+rad*.7,cy);g.lineTo(cx+rad*.4,cy+rad*.28);g.moveTo(cx-rad*.4,cy-rad*.28);g.lineTo(cx-rad*.7,cy);g.lineTo(cx-rad*.4,cy+rad*.28)}
      else{g.moveTo(cx,cy-rad*.7);g.lineTo(cx,cy+rad*.7);g.moveTo(cx-rad*.28,cy+rad*.4);g.lineTo(cx,cy+rad*.7);g.lineTo(cx+rad*.28,cy+rad*.4);g.moveTo(cx-rad*.28,cy-rad*.4);g.lineTo(cx,cy-rad*.7);g.lineTo(cx+rad*.28,cy-rad*.4)}g.stroke()}}
  function frame(ts){var dt=Math.min(.05,(ts-last)/1000)||0;last=ts;var i;
    for(i=tw.length-1;i>=0;i--){var q=tw[i];q.t+=dt*1000;var u=Math.max(0,Math.min(1,q.t/q.d)),ee=q.e?u*u:1-(1-u)*(1-u);q.o[q.p]=q.a+(q.b-q.a)*ee;if(u>=1)tw.splice(i,1)}
    g.clearRect(0,0,W,H);
    /* doelen */
    g.fillStyle="rgba(0,0,0,.28)";rr(g,OX,6,COLS*CS,58,8);g.fill();
    goal.forEach(function(gl,gi){var cx=OX+30+gi*84,dn=got[gi]>=gl.n;if(gl.ice){g.save();g.translate(cx-OX-CS/2+3,35-OY-CS/2);glass(0,0,1);g.restore()}else if(gl.die)die(cx,35,13);else marble(cx,35,15,{k:gl.k,sp:0});
      g.fillStyle=dn?"#8fe0a4":"#f6efdf";g.font="700 17px 'Barlow Condensed',sans-serif";g.textAlign="left";g.fillText(dn?"✓":got[gi]+"/"+gl.n,cx+20,41)});
    g.textAlign="right";g.fillStyle=moves<=5?"#ff9c8a":"#f2b632";g.font="700 30px 'Barlow Condensed',sans-serif";g.fillText(moves,OX+COLS*CS-14,44);g.font="600 11px 'Barlow Condensed',sans-serif";g.fillStyle="#f6efdf";g.fillText(o.T.kniMoves,OX+COLS*CS-14,58);
    /* bord */
    g.fillStyle="rgba(0,0,0,.3)";rr(g,OX-5,OY-5,COLS*CS+10,ROWS*CS+10,8);g.fill();
    g.save();g.beginPath();g.rect(OX-4,OY-4,COLS*CS+8,ROWS*CS+8);g.clip();
    for(var yy=0;yy<ROWS;yy++)for(var xx=0;xx<COLS;xx++){var c=grid[yy][xx];g.fillStyle=(xx+yy)%2?"rgba(255,255,255,.035)":"rgba(255,255,255,.07)";g.fillRect(OX+xx*CS+1,OY+yy*CS+1,CS-2,CS-2);
      if(c.dead&&c.s<=0)continue;var cx=OX+xx*CS+CS/2+c.ox,cy=OY+yy*CS+CS/2+c.oy,rad=CS*.41*c.s;if(sel&&sel[0]===xx&&sel[1]===yy){g.strokeStyle="#f6efdf";g.lineWidth=2;g.beginPath();g.arc(cx,cy,CS*.47,0,7);g.stroke()}
      if(rad>.5)marble(cx,cy,rad,c)}
    for(yy=0;yy<ROWS;yy++)for(xx=0;xx<COLS;xx++)if(ice[yy]&&ice[yy][xx])glass(xx,yy,1);
    if(LV[li]&&LV[li].dice){g.fillStyle="rgba(242,182,50,.55)";for(xx=0;xx<COLS;xx++){g.beginPath();g.moveTo(OX+xx*CS+CS/2-6,OY+ROWS*CS-5);g.lineTo(OX+xx*CS+CS/2+6,OY+ROWS*CS-5);g.lineTo(OX+xx*CS+CS/2,OY+ROWS*CS+1);g.fill()}}
    g.restore();
    for(i=parts.length-1;i>=0;i--){var p=parts[i];p.t-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;if(p.t<=0){parts.splice(i,1);continue}g.globalAlpha=Math.min(1,p.t*3);g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,3,0,7);g.fill()}g.globalAlpha=1;
    for(i=texts.length-1;i>=0;i--){var t=texts[i];t.t-=dt*1.1;if(t.t<=0){texts.splice(i,1);continue}g.globalAlpha=Math.min(1,t.t*2);g.fillStyle="#f2b632";g.strokeStyle="#1c1410";g.lineWidth=4;g.font="700 30px 'Barlow Condensed',sans-serif";g.textAlign="center";g.strokeText(t.s,t.x,t.y-(1-t.t)*40);g.fillText(t.s,t.x,t.y-(1-t.t)*40)}g.globalAlpha=1;
    if(intro)banner(g,W,H,intro);
    raf=requestAnimationFrame(frame)}
  function cellAt(q){var xx=Math.floor((q[0]-OX)/CS),yy=Math.floor((q[1]-OY)/CS);return xx>=0&&yy>=0&&xx<COLS&&yy<ROWS?[xx,yy]:null}
  function tapIntro(){var nx=intro.nx;intro=null;o.sfx("klik");if(nx){li++;startLevel();intro=null;busy=false}else busy=false}
  k.c.addEventListener("pointerdown",function(e){if(over)return;if(intro){tapIntro();return}if(busy)return;var q=k.at(e),c=cellAt(q);if(!c)return;
    if(sel&&Math.abs(sel[0]-c[0])+Math.abs(sel[1]-c[1])===1){trySwap(sel,c);return}sel=c;pd={q:q,c:c}});
  k.c.addEventListener("pointermove",function(e){if(!pd||busy)return;var q=k.at(e),dx=q[0]-pd.q[0],dy=q[1]-pd.q[1];if(Math.abs(dx)>15||Math.abs(dy)>15){var c=pd.c;pd=null;trySwap(c,Math.abs(dx)>Math.abs(dy)?[c[0]+(dx>0?1:-1),c[1]]:[c[0],c[1]+(dy>0?1:-1)])}});
  k.c.addEventListener("pointerup",function(){pd=null});k.c.addEventListener("pointercancel",function(){pd=null});
  li=0;startLevel();raf=requestAnimationFrame(frame);
  return{stop:function(){over=true;cancelAnimationFrame(raf);k.kill()},
    hint:function(){if(over||intro)return false;moves+=5;stat();return true},
    auto:function(){if(over)return;li=LV.length-1;goal.forEach(function(gl,gi){got[gi]=gl.n});intro=null;busy=true;endTurn()},
    bot:function(){if(over)return"over";if(intro){tapIntro();return"intro"}if(busy)return"busy";var m=bestMove();if(m&&m!==true)trySwap(m[0],m[1]);else{for(var yy=0;yy<ROWS;yy++)for(var xx=0;xx<COLS;xx++)if(grid[yy][xx].sp===3){trySwap([xx,yy],xx+1<COLS?[xx+1,yy]:[xx-1,yy]);return"ok"}}return"ok"},
    state:function(){var m=hasMove();return{level:li,intro:!!intro,moves:moves,extra:extra,got:got.slice(),over:over,busy:busy,mv:m&&m!==true?[OX+m[0][0]*CS+CS/2,OY+m[0][1]*CS+CS/2,OX+m[1][0]*CS+CS/2,OY+m[1][1]*CS+CS/2]:null,W:W,H:H}}}};
})();
