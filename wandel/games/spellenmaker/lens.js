/* De Erfenis van de Spellenmaker – de lens: schimmen en speelstukken zoeken via de camera, en het schimmenspel (toverlantaarn).
   SM_LENS.run(o) opent #ar. o = {kind:"schim"|"stuk", cam:true|false, T:{...}, sfx, title,
     scene:"v1".."v10", caps:[3 bijschriften]   (schim: na het vangen speelt het schimmenspel)
     piece:id                                    (stuk: tik het speelstuk aan)
     skipHunt:true                               (alleen het schimmenspel, zonder camera: terugkijken in het dossier)
     onDone(), onCancel(), onCam(bool)}
   Zonder camera (of zonder toestemming) kijk je rond in een getekende avondstraat; zonder kompas sleep je om rond te kijken. */
(function(){
"use strict";
var L=window.SM_LENS={},$=function(s){return document.querySelector(s)};
var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
/* kijkrichting van de camera aan de achterkant, uit de volledige stand van het toestel (zelfde rekenwijze als De Nacht van de Geesten) */
function camHead(e){if(e.alpha==null)return e.webkitCompassHeading!=null?e.webkitCompassHeading:null;if(e.beta==null||e.gamma==null)return(360-e.alpha)%360;
  var r=Math.PI/180,A=e.alpha*r,B=e.beta*r,C=e.gamma*r,sA=Math.sin(A),cA=Math.cos(A),sB=Math.sin(B),cB=Math.cos(B),sC=Math.sin(C),cC=Math.cos(C),E=-(cC*sA*sB+cA*sC),N=-(sA*sC-cA*cC*sB);
  if(Math.abs(E)+Math.abs(N)<.2)return null;return(Math.atan2(E,N)/r+360)%360}
function wrap(d){return((d%360)+540)%360-180}
function hsh(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
var INK="rgba(24,13,6,.94)";

/* ---------- speelstukken (ook voor de kaart en de speelkast) ---------- */
var PIECES=["pion","steen","knikker","tol","domino","paard","jojo","joker","fiche","blok","sleutel","kroon"];
L.PIECES=PIECES;
var PF={pion:"pion",steen:"dobbelsteen",knikker:"knikker",tol:"tol",domino:"dominosteen",paard:"schaakpaard",jojo:"jojo",joker:"joker",fiche:"fiche",blok:"blok",sleutel:"opwindsleutel",kroon:"kroon"};
L.pieceFile=function(id){return PF[id]?"stuk-"+PF[id]+".webp":null};
L.piece=function(g,x,y,s,id,t){var pf=L.pieceFile(id),im=pf&&window.SM_GAMES&&SM_GAMES.pic?SM_GAMES.pic(pf):null;
  if(im){g.drawImage(im,x-s*.62,y-s*.62,s*1.24,s*1.24);return}
  g.save();g.translate(x,y);g.lineJoin="round";g.lineCap="round";var k=s/40,P=function(){g.beginPath()};g.scale(k,k);
  var c1="#f2b632",c2="#d6452f",c3="#2f6f9f",c4="#f6efdf",dk="#3b2616";
  if(id==="pion"){g.fillStyle=c2;P();g.arc(0,-12,7,0,7);g.fill();P();g.moveTo(-5,-6);g.lineTo(5,-6);g.lineTo(10,14);g.lineTo(-10,14);g.closePath();g.fill();g.fillRect(-12,13,24,5)}
  else if(id==="steen"){g.fillStyle=c4;P();g.rect(-14,-14,28,28);g.fill();g.fillStyle=dk;[[-7,-7],[7,7],[0,0],[-7,7],[7,-7]].forEach(function(p){P();g.arc(p[0],p[1],3,0,7);g.fill()})}
  else if(id==="knikker"){var gr=g.createRadialGradient(-5,-6,2,0,0,15);gr.addColorStop(0,"#d8f0ff");gr.addColorStop(1,c3);g.fillStyle=gr;P();g.arc(0,0,15,0,7);g.fill();g.strokeStyle="rgba(255,255,255,.6)";g.lineWidth=3;P();g.arc(4,8,12,3.6,5);g.stroke()}
  else if(id==="tol"){g.fillStyle=c2;P();g.moveTo(-14,-6);g.lineTo(14,-6);g.lineTo(0,17);g.closePath();g.fill();g.fillStyle=c1;g.fillRect(-14,-10,28,5);g.fillStyle=dk;g.fillRect(-2,-19,4,10)}
  else if(id==="domino"){g.fillStyle=dk;P();g.rect(-10,-17,20,34);g.fill();g.fillStyle=c4;g.fillRect(-8,-1,16,2);[[0,-9],[-5,5],[5,5],[-5,12],[5,12]].forEach(function(p){P();g.arc(p[0],p[1],2.4,0,7);g.fill()})}
  else if(id==="paard"){g.fillStyle=dk;P();g.moveTo(-10,16);g.lineTo(-7,4);g.quadraticCurveTo(-12,-8,-2,-17);g.lineTo(2,-13);g.quadraticCurveTo(12,-10,12,-1);g.lineTo(4,-3);g.quadraticCurveTo(6,6,9,16);g.closePath();g.fill();g.fillStyle=c4;P();g.arc(3,-9,1.6,0,7);g.fill()}
  else if(id==="jojo"){g.strokeStyle=c4;g.lineWidth=1.5;P();g.moveTo(0,-20);g.lineTo(0,-8);g.stroke();g.fillStyle=c3;P();g.arc(0,2,14,0,7);g.fill();g.fillStyle=c1;P();g.arc(0,2,6,0,7);g.fill()}
  else if(id==="joker"){g.fillStyle=c4;P();g.rect(-12,-17,24,34);g.fill();g.fillStyle=c2;g.font="700 22px Georgia,serif";g.textAlign="center";g.fillText("J",0,7);g.fillStyle=c1;P();g.arc(0,-11,2.5,0,7);g.fill()}
  else if(id==="fiche"){g.fillStyle=c2;P();g.arc(0,0,15,0,7);g.fill();g.strokeStyle=c4;g.lineWidth=4;g.setLineDash([5,5.5]);P();g.arc(0,0,12,0,7);g.stroke();g.setLineDash([]);g.fillStyle=c4;P();g.arc(0,0,6,0,7);g.fill()}
  else if(id==="blok"){g.fillStyle=c3;P();g.rect(-14,-10,26,24);g.fill();g.fillStyle="#5b9fd0";P();g.moveTo(-14,-10);g.lineTo(-8,-17);g.lineTo(18,-17);g.lineTo(12,-10);g.closePath();g.fill();g.fillStyle="#1f4f76";P();g.moveTo(12,-10);g.lineTo(18,-17);g.lineTo(18,7);g.lineTo(12,14);g.closePath();g.fill();g.fillStyle=c4;g.font="700 18px Georgia,serif";g.textAlign="center";g.fillText("T",-1,9)}
  else if(id==="sleutel"){g.strokeStyle=c1;g.lineWidth=5;P();g.arc(-9,-9,7,0,7);g.stroke();P();g.moveTo(-4,-4);g.lineTo(14,14);g.moveTo(9,9);g.lineTo(14,5);g.moveTo(4,4);g.lineTo(8,0);g.stroke()}
  else{g.fillStyle=c1;P();g.moveTo(-15,12);g.lineTo(-15,-8);g.lineTo(-7,2);g.lineTo(0,-13);g.lineTo(7,2);g.lineTo(15,-8);g.lineTo(15,12);g.closePath();g.fill();g.fillStyle=c2;[-9,0,9].forEach(function(px){P();g.arc(px,7,2.4,0,7);g.fill()})}
  g.restore()};

/* ---------- schimfiguren (zijaanzicht, kijkend naar rechts; U = hoogte van een gewone figuur in px) ---------- */
var HT={A:.95,M:1.02,R:.98,P:.86,H:1.12,Hb:1.12,O:.96,X:.98},LONG={M:.14,H:.12,X:.12,O:.05};
function fig(g,x,gy,U,who,o){o=o||{};var s=U*(HT[who]||1),t=o.t||0,pose=o.pose||"stand",prop=o.prop||null;
  var aF=[.14+Math.sin(t*1.3)*.03,.12],aB=[-.12,.08],lA=.07,lB=-.07,lean=0,hip=-.48*s,drop=0,kneel=pose==="kneel",sit=pose==="sit";
  if(pose==="walk"||pose==="run"){var w=Math.sin(t*(pose==="run"?12:6.5));lA=w*.42;lB=-w*.42;aF=[-w*.5,.3];aB=[w*.5,.3];lean=pose==="run"?.2:.04}
  else if(pose==="toast"){aF=[2.3+Math.sin(t*2)*.05,.45];prop=prop||"glass"}
  else if(pose==="point"){aF=[1.45+Math.sin(t*8)*.07,.05];lean=.07}
  else if(pose==="phone"){aF=[1.0,2.5];prop="phone"}
  else if(pose==="cards"){aF=[.85,1.1+Math.sin(t*9)*.14];aB=[.6,1.3];prop="cards"}
  else if(pose==="reach"){aF=[2.05+Math.sin(t*3)*.05,.12]}
  else if(pose==="push"){aF=[1.38,.08];aB=[1.25,.14];lean=.17}
  else if(pose==="kiss"){aF=[1.15,.6];aB=[.95,.7];lean=.13}
  else if(pose==="cane"){aF=[.55,.25];prop="cane"}
  else if(pose==="glassdrop"){aF=[.5,.2]}
  if(kneel){hip=-.25*s;aF=[1.05+Math.sin(t*10)*.06,.4];lean=.22;prop=prop||"driver"}
  if(sit){hip=-.3*s;aF=[.75,1.35]}
  g.save();g.translate(x,gy-(o.y||0)*U);if(o.flip)g.scale(-1,1);g.globalAlpha=o.a==null?1:o.a;g.fillStyle=INK;g.strokeStyle=INK;g.lineCap="round";g.lineJoin="round";
  /* benen */
  g.lineWidth=.075*s;
  if(kneel){g.beginPath();g.moveTo(0,hip);g.lineTo(.2*s,-.03*s);g.lineTo(-.14*s,-.03*s);g.stroke();g.beginPath();g.moveTo(0,hip);g.lineTo(-.02*s,-.04*s);g.lineTo(-.2*s,-.02*s);g.stroke()}
  else if(sit){g.beginPath();g.moveTo(0,hip);g.lineTo(.24*s,hip);g.lineTo(.25*s,0);g.stroke()}
  else{[lA,lB].forEach(function(a){g.beginPath();g.moveTo(0,hip);g.lineTo(Math.sin(a)*.48*s,-(1-Math.cos(a))*.12*s);g.stroke()})}
  g.translate(0,hip);g.rotate(lean);g.translate(0,-hip);
  var shY=hip-.33*s,hdY=shY-.11*s,hr=.082*s,shx=.02*s,AL=.2*s;
  function arm(a,pr){var ex=shx+Math.sin(a[0])*AL,ey=shY+.03*s+Math.cos(a[0])*AL,hx=ex+Math.sin(a[0]+a[1])*AL,hy=ey+Math.cos(a[0]+a[1])*AL;g.lineWidth=.058*s;g.beginPath();g.moveTo(shx,shY+.03*s);g.lineTo(ex,ey);g.lineTo(hx,hy);g.stroke();
    if(!pr)return;g.lineWidth=.02*s;
    if(pr==="glass"){g.beginPath();g.moveTo(hx,hy);g.lineTo(hx,hy-.07*s);g.stroke();g.beginPath();g.moveTo(hx-.04*s,hy-.14*s);g.lineTo(hx+.04*s,hy-.14*s);g.lineTo(hx,hy-.07*s);g.closePath();g.fill()}
    else if(pr==="phone"){g.fillRect(hx-.02*s,hy-.07*s,.035*s,.11*s)}
    else if(pr==="cards"){for(var n=-1;n<=1;n++){g.save();g.translate(hx,hy);g.rotate(n*.4+.3);g.fillRect(-.03*s,-.13*s,.06*s,.11*s);g.restore()}}
    else if(pr==="driver"){g.lineWidth=.026*s;g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+.13*s,hy+.02*s);g.stroke()}
}
  arm(aB,null);
  /* lijf: jas of jurk voor wie die draagt */
  var hem=LONG[who],bw=who==="O"?.2:who==="P"?.1:.12;
  g.beginPath();g.moveTo(-.1*s,hip);g.lineTo(-.125*s,shY+.03*s);g.quadraticCurveTo(0,shY-.05*s,.125*s,shY+.03*s);g.lineTo(.1*s,hip);
  if(hem&&!kneel&&!sit){g.lineTo((who==="O"?.2:.15)*s,hip+(.48-hem)*s);g.lineTo(-(who==="O"?.2:.15)*s,hip+(.48-hem)*s)}g.closePath();g.fill();
  if(who==="P"){g.beginPath();g.moveTo(-.11*s,shY+.05*s);g.quadraticCurveTo(-.24*s,shY+.1*s,-.2*s,hip-.02*s);g.lineTo(-.1*s,hip-.02*s);g.closePath();g.fill()}
  /* hoofd en wat erop zit */
  var hx0=.012*s;g.beginPath();g.arc(hx0,hdY,hr,0,7);g.fill();g.fillRect(hx0-hr*.45,hdY+hr*.6,hr*.9,hr*.9);
  if(who==="A"){g.beginPath();g.moveTo(hx0-hr*.2,hdY+hr*.75);g.lineTo(hx0+hr*.98,hdY+hr*.5);g.lineTo(hx0+hr*.95,hdY+hr*2.1);g.closePath();g.fill();g.lineWidth=hr*.28;g.beginPath();g.moveTo(hx0+hr*.9,hdY+hr*.28);g.lineTo(hx0+hr*2.1,hdY+hr*.62);g.stroke();g.fillRect(hx0+hr*1.85,hdY+hr*.15,hr*.55,hr*.6)}
  else if(who==="M"){g.beginPath();g.arc(hx0-hr*.95,hdY-hr*.72,hr*.52,0,7);g.fill()}
  else if(who==="R"){g.beginPath();g.ellipse(hx0,hdY-hr*.5,hr*1.12,hr*.62,0,Math.PI,0);g.fill();g.beginPath();g.ellipse(hx0+hr*1.05,hdY-hr*.42,hr*.8,hr*.17,.1,0,7);g.fill()}
  else if(who==="P"){g.beginPath();g.moveTo(hx0-hr*.7,hdY-hr*.7);g.quadraticCurveTo(hx0-hr*2.6,hdY-hr*.6,hx0-hr*2.0,hdY+hr*1.7);g.quadraticCurveTo(hx0-hr*1.5,hdY+hr*.2,hx0-hr*.8,hdY);g.closePath();g.fill()}
  else if(who==="H"||who==="X"){g.beginPath();g.ellipse(hx0,hdY-hr*.62,hr*.95,hr*.95,0,Math.PI,0);g.fill();g.beginPath();g.ellipse(hx0,hdY-hr*.62,hr*1.65,hr*.2,0,0,7);g.fill()}
  else if(who==="O"){g.beginPath();g.ellipse(hx0,hdY-hr*.6,hr*2.05,hr*.26,0,0,7);g.fill();g.beginPath();g.ellipse(hx0,hdY-hr*.6,hr*.9,hr*.7,0,Math.PI,0);g.fill();g.lineWidth=hr*.34;g.beginPath();g.moveTo(hx0-hr*.4,hdY-hr*1.1);g.quadraticCurveTo(hx0-hr*.9,hdY-hr*2.9,hx0-hr*2.3,hdY-hr*2.5);g.stroke();
    g.lineWidth=hr*.16;g.beginPath();g.moveTo(hx0+hr*.9,hdY+hr*.3);g.lineTo(hx0+hr*2.3,hdY-hr*.2);g.stroke()}
  arm(aF,prop==="cane"?null:prop);
  if(prop==="cane"){var ex=shx+Math.sin(aF[0])*AL,ey=shY+.03*s+Math.cos(aF[0])*AL,hx=ex+Math.sin(aF[0]+aF[1])*AL,hy=ey+Math.cos(aF[0]+aF[1])*AL;g.lineWidth=.028*s;g.beginPath();g.moveTo(hx,hy-.03*s);g.lineTo(hx+.04*s,0);g.stroke();g.beginPath();g.arc(hx-.03*s,hy-.03*s,.03*s,Math.PI,0);g.stroke()}
  g.restore()}
L.fig=fig;

/* ---------- decorstukken ---------- */
var PR={
  table:function(g,x,gy,U,w){g.fillStyle=INK;g.fillRect(x-w/2,gy-.4*U,w,.035*U);g.fillRect(x-w/2+.03*U,gy-.4*U,.03*U,.4*U);g.fillRect(x+w/2-.06*U,gy-.4*U,.03*U,.4*U);g.beginPath();g.moveTo(x-w/2,gy-.37*U);g.lineTo(x+w/2,gy-.37*U);g.lineTo(x+w/2-.04*U,gy-.22*U);g.lineTo(x-w/2+.04*U,gy-.22*U);g.closePath();g.globalAlpha=.55;g.fill();g.globalAlpha=1;
    [-.3,.02,.31].forEach(function(p){g.fillRect(x+p*w,gy-.4*U-.13*U,.02*U,.13*U);g.beginPath();g.arc(x+p*w+.01*U,gy-.56*U,.02*U,0,7);g.fill()})},
  /* trap omhoog naar rechts; geeft de overloop terug: [x, hoogte in U] */
  stairs:function(g,x,gy,U,n){var sw=.17*U,sh=.115*U,i;n=n||6;g.fillStyle=INK;g.beginPath();g.moveTo(x,gy);for(i=0;i<n;i++){g.lineTo(x+i*sw,gy-(i+1)*sh);g.lineTo(x+(i+1)*sw,gy-(i+1)*sh)}g.lineTo(x+n*sw+U*1.2,gy-n*sh);g.lineTo(x+n*sw+U*1.2,gy);g.closePath();g.fill();
    g.strokeStyle=INK;g.lineWidth=.03*U;g.beginPath();g.moveTo(x,gy-.42*U);g.lineTo(x+n*sw,gy-n*sh-.42*U);g.stroke();g.lineWidth=.018*U;for(i=0;i<=n;i+=2){g.beginPath();g.moveTo(x+i*sw,gy-i*sh);g.lineTo(x+i*sw,gy-i*sh-.42*U);g.stroke()}
    return[x+n*sw+.2*U,n*sh/U]},
  stand:function(g,x,gy,U,hat,coat,cane){g.strokeStyle=INK;g.fillStyle=INK;g.lineWidth=.03*U;g.lineCap="round";g.beginPath();g.moveTo(x,gy);g.lineTo(x,gy-1.05*U);g.moveTo(x-.1*U,gy);g.lineTo(x+.1*U,gy);g.moveTo(x-.12*U,gy-.98*U);g.lineTo(x+.12*U,gy-.98*U);g.stroke();
    if(hat){g.beginPath();g.ellipse(x-.12*U,gy-1.02*U,.085*U,.085*U,0,Math.PI,0);g.fill();g.beginPath();g.ellipse(x-.12*U,gy-1.02*U,.14*U,.018*U,0,0,7);g.fill()}
    if(coat){g.beginPath();g.moveTo(x+.02*U,gy-.96*U);g.lineTo(x+.2*U,gy-.9*U);g.lineTo(x+.24*U,gy-.2*U);g.lineTo(x+.04*U,gy-.17*U);g.closePath();g.fill()}
    if(cane){g.lineWidth=.026*U;g.beginPath();g.moveTo(x+.36*U,gy);g.lineTo(x+.3*U,gy-.62*U);g.stroke();g.beginPath();g.arc(x+.27*U,gy-.62*U,.03*U,Math.PI,0);g.stroke()}},
  bench:function(g,x,gy,U){g.fillStyle=INK;g.fillRect(x-.32*U,gy-.3*U,.64*U,.035*U);g.fillRect(x-.3*U,gy-.3*U,.03*U,.3*U);g.fillRect(x+.27*U,gy-.3*U,.03*U,.3*U);g.fillRect(x-.32*U,gy-.6*U,.03*U,.3*U);g.fillRect(x-.32*U,gy-.6*U,.2*U,.03*U)},
  arch:function(g,x,gy,U){g.strokeStyle=INK;g.fillStyle=INK;g.lineWidth=.035*U;g.beginPath();g.moveTo(x-.5*U,gy);g.lineTo(x-.5*U,gy-.9*U);g.quadraticCurveTo(x,gy-1.55*U,x+.5*U,gy-.9*U);g.lineTo(x+.5*U,gy);g.stroke();
    for(var i=0;i<16;i++){var a=Math.PI+i/15*Math.PI,px=x+Math.cos(a)*.52*U,py=gy-.9*U+Math.sin(a)*.34*U-(Math.abs(Math.cos(a))<.95?.12*U:0);g.beginPath();g.ellipse(px,py+(i%2)*.04*U,.07*U,.045*U,i,0,7);g.fill()}},
  machine:function(g,x,gy,U,t){g.fillStyle=INK;g.fillRect(x-.2*U,gy-.5*U,.4*U,.5*U);g.fillRect(x-.13*U,gy-.78*U,.26*U,.24*U);g.fillRect(x-.01*U,gy-.9*U,.02*U,.12*U);g.beginPath();g.arc(x,gy-.92*U,.03*U,0,7);g.fill();
    g.save();g.translate(x+.3*U,gy-.3*U);g.rotate(t*2);for(var i=0;i<8;i++){g.rotate(Math.PI/4);g.fillRect(-.02*U,-.13*U,.04*U,.26*U)}g.restore();g.beginPath();g.arc(x+.3*U,gy-.3*U,.09*U,0,7);g.fill()},
  windowF:function(g,x,gy,U){g.strokeStyle=INK;g.lineWidth=.03*U;g.strokeRect(x-.25*U,gy-1.15*U,.5*U,.6*U);g.beginPath();g.moveTo(x,gy-1.15*U);g.lineTo(x,gy-.55*U);g.moveTo(x-.25*U,gy-.85*U);g.lineTo(x+.25*U,gy-.85*U);g.stroke()},
  sack:function(g,x,y,U,rot){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=INK;g.beginPath();g.ellipse(0,0,.15*U,.2*U,0,0,7);g.fill();g.beginPath();g.moveTo(-.05*U,-.18*U);g.lineTo(-.09*U,-.3*U);g.lineTo(.09*U,-.3*U);g.lineTo(.05*U,-.18*U);g.closePath();g.fill();g.restore()},
  lit:function(g,x,y,U){g.save();g.globalCompositeOperation="source-over";g.fillStyle="#fff7d8";g.shadowColor="#fff2b0";g.shadowBlur=12;g.fillRect(x-.02*U,y-.035*U,.04*U,.07*U);g.restore()}
};
function mix(a,b,u){return a+(b-a)*u}
function sm(u){u=u<0?0:u>1?1:u;return u*u*(3-2*u)}
/* ---------- de tien scènes: elk drie momenten; S = {g, X(x), gy, U}, u = voortgang 0..1, t = seconden ---------- */
var SC={
 v1:[function(S,u,t){PR.table(S.g,S.X(0),S.gy,S.U,S.U*2.3);fig(S.g,S.X(-.86),S.gy,S.U,"H",{t:t});fig(S.g,S.X(-.55),S.gy,S.U,"O",{t:t+1});fig(S.g,S.X(0),S.gy,S.U,"A",{pose:"toast",t:t});fig(S.g,S.X(.42),S.gy,S.U,"M",{flip:1,t:t+2});fig(S.g,S.X(.68),S.gy,S.U,"R",{flip:1,t:t});fig(S.g,S.X(.9),S.gy,S.U,"P",{flip:1,t:t+3})},
  function(S,u,t){PR.table(S.g,S.X(0),S.gy,S.U,S.U*2.3);fig(S.g,S.X(-.86),S.gy,S.U,"H",{t:t});fig(S.g,S.X(-.55),S.gy,S.U,"O",{t:t+1});fig(S.g,S.X(0),S.gy,S.U,"A",{pose:"point",t:u<1?t:0,flip:Math.floor(t/1.6)%2});fig(S.g,S.X(.42),S.gy,S.U,"M",{flip:1,t:t+2});fig(S.g,S.X(.68),S.gy,S.U,"R",{flip:1,t:t});fig(S.g,S.X(.9),S.gy,S.U,"P",{flip:1,t:t+3})},
  function(S,u,t){PR.table(S.g,S.X(0),S.gy,S.U,S.U*2.3);fig(S.g,S.X(-.86),S.gy,S.U,"H",{t:0});fig(S.g,S.X(-.55),S.gy,S.U,"O",{t:0});fig(S.g,S.X(0),S.gy,S.U,"A",{t:0});fig(S.g,S.X(.42),S.gy,S.U,"M",{flip:1,t:0});fig(S.g,S.X(.68),S.gy,S.U,"R",{flip:1,pose:"glassdrop",t:0});fig(S.g,S.X(.9),S.gy,S.U,"P",{flip:1,t:0});
    var f=Math.min(1,u*2.2);S.g.fillStyle=INK;S.g.save();S.g.translate(S.X(.56),S.gy-S.U*.42*(1-f*f));S.g.rotate(f*2.4);S.g.fillRect(-S.U*.025,-S.U*.05,S.U*.05,S.U*.1);S.g.restore()}],
 v2:[function(S,u,t){PR.stand(S.g,S.X(-.7),S.gy,S.U,1,1,1);fig(S.g,S.X(mix(.9,.15,sm(u))),S.gy,S.U,"R",{pose:u<1?"walk":"phone",t:t,flip:1})},
  function(S,u,t){PR.stand(S.g,S.X(-.7),S.gy,S.U,1,1,1);fig(S.g,S.X(.15),S.gy,S.U,"R",{pose:"phone",t:t,flip:u>.55?0:1})},
  function(S,u,t){PR.stand(S.g,S.X(-.7),S.gy,S.U,1,1,1);fig(S.g,S.X(.15),S.gy,S.U,"R",{pose:"cards",t:t,flip:1})}],
 v3:[function(S,u,t){var top=PR.stairs(S.g,S.X(.2),S.gy,S.U,5);fig(S.g,S.X(-.75),S.gy,S.U,"A",{t:t});fig(S.g,S.X(-.25),S.gy,S.U,"P",{pose:"point",t:t,flip:1})},
  function(S,u,t){PR.stairs(S.g,S.X(.2),S.gy,S.U,5);fig(S.g,S.X(-.75),S.gy,S.U,"A",{pose:"reach",t:t});fig(S.g,S.X(-.25),S.gy,S.U,"P",{t:t,flip:u<.5?1:0})},
  function(S,u,t){var x0=S.X(.2),top=PR.stairs(S.g,x0,S.gy,S.U,5),q=sm(u);fig(S.g,S.X(-.75),S.gy,S.U,"A",{t:t});fig(S.g,mix(S.X(-.25),top[0]+S.U*.5,q),S.gy,S.U,"P",{pose:u<1?"run":"stand",t:t,y:Math.max(0,Math.min(top[1],(mix(S.X(-.25),top[0],q)-x0)/(S.U*.17)*.115)),a:u>.8?Math.max(0,1-(u-.8)*5):1})}],
 v4:[function(S,u,t){var top=PR.stairs(S.g,S.X(-.9),S.gy,S.U,5);fig(S.g,mix(top[0]+S.U*.75,top[0]+S.U*.12,sm(u)),S.gy,S.U,"X",{pose:u<1?"walk":"kneel",t:t,y:top[1],flip:1,prop:u<1?"cane":null})},
  function(S,u,t){var top=PR.stairs(S.g,S.X(-.9),S.gy,S.U,5);fig(S.g,top[0]+S.U*.12,S.gy,S.U,"X",{pose:"kneel",t:t,y:top[1],flip:1})},
  function(S,u,t){var top=PR.stairs(S.g,S.X(-.9),S.gy,S.U,5),g=S.g,ly=S.gy-top[1]*S.U;fig(g,mix(top[0]+S.U*.12,top[0]+S.U*.9,sm(u*1.3)),S.gy,S.U,"X",{pose:u<.75?"walk":"stand",t:t,y:top[1],a:1-sm((u-.5)*2)});
    g.strokeStyle=INK;g.fillStyle=INK;g.lineWidth=.026*S.U;g.beginPath();g.moveTo(top[0]-S.U*.05,ly-S.U*.015);g.lineTo(top[0]+S.U*.5,ly-S.U*.03);g.stroke();g.beginPath();g.arc(top[0]-S.U*.26,ly-S.U*.035,.035*S.U,0,7);g.fill();S.dim=sm((u-.55)*2.2)*.75}],
 v5:[function(S,u,t){PR.arch(S.g,S.X(0),S.gy,S.U);fig(S.g,S.X(mix(-.9,-.17,sm(u))),S.gy,S.U,"O",{pose:u<1?"walk":"stand",t:t});fig(S.g,S.X(mix(.9,.17,sm(u))),S.gy,S.U,"Hb",{pose:u<1?"walk":"stand",t:t,flip:1})},
  function(S,u,t){PR.arch(S.g,S.X(0),S.gy,S.U);fig(S.g,S.X(-.1),S.gy,S.U,"O",{pose:"kiss",t:t});fig(S.g,S.X(.1),S.gy,S.U,"Hb",{pose:"kiss",t:t,flip:1})},
  function(S,u,t){PR.arch(S.g,S.X(0),S.gy,S.U);var j=u<.25?Math.sin(u*80)*S.U*.012:0;fig(S.g,S.X(-.2)+j,S.gy,S.U,"O",{t:0,flip:1});fig(S.g,S.X(.2)+j,S.gy,S.U,"Hb",{t:0,flip:1})}],
 v6:[function(S,u,t){PR.windowF(S.g,S.X(.6),S.gy,S.U);PR.table(S.g,S.X(-.6),S.gy,S.U,S.U*.7);var p=Math.sin(t*.8);fig(S.g,S.X(p*.3),S.gy,S.U,"M",{pose:"phone",t:t,flip:Math.cos(t*.8)<0})},
  function(S,u,t){PR.windowF(S.g,S.X(.6),S.gy,S.U);PR.table(S.g,S.X(-.6),S.gy,S.U,S.U*.7);fig(S.g,S.X(.05),S.gy,S.U,"M",{pose:"phone",t:t})},
  function(S,u,t){PR.windowF(S.g,S.X(.6),S.gy,S.U);PR.table(S.g,S.X(-.6),S.gy,S.U,S.U*.7);var p=Math.sin(t*.8+1);fig(S.g,S.X(p*.3)+(u<.2?Math.sin(u*90)*S.U*.012:0),S.gy,S.U,"M",{pose:"phone",t:t,flip:Math.cos(t*.8+1)<0})}],
 v7:[function(S,u,t){PR.stand(S.g,S.X(-.1),S.gy,S.U,1,1,1)},
  function(S,u,t){var g=S.g,q=sm(u*1.25),back=sm((u-.6)*2.5),ax=mix(S.X(1.15),S.X(.02),q)+back*S.U*.7;PR.stand(g,S.X(-.1),S.gy,S.U,u<.6,1,1);
    g.strokeStyle=INK;g.fillStyle=INK;g.lineWidth=.07*S.U;g.lineCap="round";g.beginPath();g.moveTo(S.X(1.2),S.gy-.75*S.U);g.lineTo(ax,S.gy-1.0*S.U);g.stroke();
    if(u>=.6){g.beginPath();g.ellipse(ax-.04*S.U,S.gy-1.06*S.U,.085*S.U,.085*S.U,0,Math.PI,0);g.fill();g.beginPath();g.ellipse(ax-.04*S.U,S.gy-1.06*S.U,.14*S.U,.018*S.U,0,0,7);g.fill()}},
  function(S,u,t){PR.stand(S.g,S.X(-.1),S.gy,S.U,0,u<.3,u<.6)}],
 v8:[function(S,u,t){PR.bench(S.g,S.X(-.2),S.gy,S.U);fig(S.g,S.X(-.24),S.gy,S.U,"R",{pose:"sit",t:t});PR.lit(S.g,S.X(-.24)+S.U*.2,S.gy-S.U*.5,S.U)},
  function(S,u,t){PR.bench(S.g,S.X(-.2),S.gy,S.U);var q=sm((u-.3)*1.6);PR.lit(S.g,S.X(-.2)+S.U*.12,S.gy-S.U*.33,S.U);fig(S.g,mix(S.X(-.02),S.X(1.2),q),S.gy,S.U,"R",{pose:u>.3&&u<1?"walk":"stand",t:t,a:1-sm((u-.75)*4)})},
  function(S,u,t){PR.bench(S.g,S.X(-.2),S.gy,S.U);PR.lit(S.g,S.X(-.2)+S.U*.12,S.gy-S.U*.33,S.U);var q=sm((u-.35)*1.7);if(u>.35)fig(S.g,mix(S.X(1.2),S.X(.12),q),S.gy,S.U,"R",{pose:q<1?"walk":"stand",t:t,flip:1,a:sm((u-.35)*5)})}],
 v9:[function(S,u,t){var top=PR.stairs(S.g,S.X(-.9),S.gy,S.U,5);fig(S.g,top[0]+S.U*.42,S.gy,S.U,"A",{t:t,y:top[1],flip:1});PR.sack(S.g,top[0]+S.U*.05,S.gy-top[1]*S.U-S.U*.2,S.U,0)},
  function(S,u,t){var x0=S.X(-.9),top=PR.stairs(S.g,x0,S.gy,S.U,5),q=Math.min(1,u*1.5),fall=sm((u-.25)*1.6);fig(S.g,top[0]+S.U*mix(.42,.3,sm(u*4)),S.gy,S.U,"A",{pose:u<.5?"push":"stand",t:t,y:top[1],flip:1});
    var sx=mix(top[0]+S.U*.05,x0-S.U*.12,fall),sy=mix(S.gy-top[1]*S.U-S.U*.2,S.gy-S.U*.2,fall*fall)-Math.abs(Math.sin(fall*9))*S.U*.1*(1-fall);PR.sack(S.g,sx,sy,S.U,-fall*7)},
  function(S,u,t){var x0=S.X(-.9),top=PR.stairs(S.g,x0,S.gy,S.U,5);PR.sack(S.g,x0-S.U*.12,S.gy-S.U*.16,S.U,-1.3);fig(S.g,mix(top[0]+S.U*.3,top[0]+S.U*.95,sm(u)),S.gy,S.U,"A",{pose:u<1?"walk":"stand",t:t,y:top[1],a:1-sm(u*1.1)})}],
 v10:[function(S,u,t){fig(S.g,S.X(mix(1.1,.1,sm(u))),S.gy,S.U,"A",{pose:u<1?"walk":"stand",t:t,flip:1})},
  function(S,u,t){fig(S.g,S.X(.1),S.gy,S.U,"A",{pose:"toast",t:t,flip:1})},
  function(S,u,t){fig(S.g,S.X(.1),S.gy,S.U,"A",{pose:"point",t:t,flip:1});PR.sack(S.g,S.X(-.5),S.gy-S.U*.16,S.U,-1.3)}]
};
L.SCENES=SC;

/* ---------- getekende avondstraat als er geen camera is ---------- */
function pano(g,w,h,H,ts){var sk=g.createLinearGradient(0,0,0,h);sk.addColorStop(0,"#0b1626");sk.addColorStop(.55,"#1d3a4a");sk.addColorStop(.8,"#3b5b54");sk.addColorStop(1,"#10231f");g.fillStyle=sk;g.fillRect(0,0,w,h);
  var fov=60,X=function(a){return w/2+wrap(a-H)/fov*w},i;
  for(i=0;i<70;i++){var sx=X(hsh(i)*360),sy=hsh(i+90)*h*.5;if(sx<-5||sx>w+5)continue;g.fillStyle="rgba(255,244,214,"+(.3+.5*hsh(i+7))+")";g.fillRect(sx,sy,1.6,1.6)}
  var mx=X(48);if(mx>-80&&mx<w+80){g.fillStyle="#f4ecd0";g.beginPath();g.arc(mx,h*.16,26,0,7);g.fill();g.fillStyle="#0b1626";g.beginPath();g.arc(mx+11,h*.16-5,24,0,7);g.fill()}
  var gy=h*.74,ww=w/6;
  for(i=0;i<36;i++){var cx=X(i*10+5);if(cx<-ww||cx>w+ww)continue;var hh=h*(.16+.22*hsh(i*3+1)),bw=ww*(.86+.12*hsh(i+40)),x0=cx-bw/2;g.fillStyle=i%2?"#0d1a1c":"#101f20";g.fillRect(x0,gy-hh,bw,hh);
    g.beginPath();if(hsh(i+5)<.6){g.moveTo(x0-3,gy-hh);g.lineTo(cx,gy-hh-bw*.42);g.lineTo(x0+bw+3,gy-hh)}else{g.rect(x0+bw*.6,gy-hh-bw*.3,bw*.16,bw*.3)}g.fill();
    for(var r=0;r<3;r++)for(var c=0;c<2;c++){if(hsh(i*7+r*3+c)>.55)continue;g.fillStyle="rgba(255,206,110,"+(.55+.3*hsh(i+r+c))+")";g.fillRect(x0+bw*(.2+c*.38),gy-hh+hh*(.14+r*.27),bw*.2,hh*.13)}}
  g.fillStyle="#0a1513";g.fillRect(0,gy,w,h-gy);
  for(i=0;i<8;i++){var lx=X(i*45+20);if(lx<-40||lx>w+40)continue;g.strokeStyle="#060c0b";g.lineWidth=4;g.beginPath();g.moveTo(lx,h*.9);g.lineTo(lx,gy-h*.2);g.stroke();var gl=g.createRadialGradient(lx,gy-h*.2,2,lx,gy-h*.2,70);gl.addColorStop(0,"rgba(255,214,130,.85)");gl.addColorStop(1,"rgba(255,214,130,0)");g.fillStyle=gl;g.beginPath();g.arc(lx,gy-h*.2,70,0,7);g.fill()}}

/* het lantaarnbeeld: een warme lichtcirkel met donkere schimmen erin */
function lantern(g,cx,cy,r,al,draw){g.save();g.globalAlpha=al;g.beginPath();g.arc(cx,cy,r,0,7);g.clip();
  var lg=g.createRadialGradient(cx,cy-r*.1,r*.1,cx,cy,r);lg.addColorStop(0,"rgba(255,232,176,.96)");lg.addColorStop(.7,"rgba(250,196,110,.92)");lg.addColorStop(1,"rgba(196,120,40,.9)");g.fillStyle=lg;g.fillRect(cx-r,cy-r,r*2,r*2);
  var S={g:g,cx:cx,cy:cy,r:r,gy:cy+r*.6,U:r*.72,X:function(x){return cx+x*r*.8},dim:0};
  g.fillStyle=INK;g.fillRect(cx-r,S.gy,r*2,r);
  if(draw){g.save();g.shadowColor="rgba(24,13,6,.7)";g.shadowBlur=3;draw(S);g.restore()}
  if(S.dim){g.fillStyle="rgba(12,8,4,"+S.dim+")";g.fillRect(cx-r,cy-r,r*2,r*2)}
  g.restore();g.save();g.globalAlpha=al;g.strokeStyle="rgba(60,34,10,.9)";g.lineWidth=Math.max(3,r*.05);g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();g.strokeStyle="rgba(255,222,150,.55)";g.lineWidth=2;g.beginPath();g.arc(cx,cy,r+Math.max(3,r*.05)*.5,0,7);g.stroke();g.restore()}
L.lantern=lantern;

var cur=null;
L.stop=function(){if(cur)cur.stop()};
L.active=function(){return !!cur};
L.win=function(){if(cur&&cur.win)cur.win()};
L.run=function(o){
  if(cur)cur.stop();
  var ar=$("#ar"),v=$("#arV"),c=$("#arC"),hint=$("#arH"),nx=$("#arN"),ttl=$("#arT"),g=c.getContext("2d"),T=o.T;
  var dpr=1,w=0,h=0,over=false,stream=null,camOn=false,hd=null,hasOri=false,dragH=20,pd=null,raf=0,last=0;
  var phase=o.skipHunt?"show":"hunt",target=70+Math.random()*200,hold=0,moved=still||o.kind!=="schim",goneT=0,gotT=0,beat=0,beatT=0,popT=0,sy=0;
  ar.hidden=false;ar.classList.toggle("nocam",true);nx.hidden=true;ttl.textContent=o.title||"";hint.textContent="";
  function rs(){dpr=Math.min(2,window.devicePixelRatio||1);w=c.clientWidth;h=c.clientHeight;c.width=w*dpr;c.height=h*dpr}
  rs();addEventListener("resize",rs);
  function ori(e){var a=camHead(e);if(a!=null){if(hd==null)hd=a;else hd=(hd+wrap(a-hd)*.4+360)%360;hasOri=true}}
  function stop(){if(over)return;over=true;cur=null;cancelAnimationFrame(raf);removeEventListener("deviceorientation",ori);removeEventListener("resize",rs);c.onpointerdown=c.onpointermove=c.onpointerup=null;nx.onclick=null;$("#arX").onclick=null;
    try{if(stream)stream.getTracks().forEach(function(t){t.stop()})}catch(e){}v.srcObject=null;ar.hidden=true}
  cur={stop:stop,win:function(){if(phase==="hunt")got()}};
  if(!o.skipHunt){
    try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function")DeviceOrientationEvent.requestPermission().catch(function(){})}catch(e){}
    addEventListener("deviceorientation",ori);
    if(o.cam&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
      navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false}).then(function(s){if(over){s.getTracks().forEach(function(t){t.stop()});return}stream=s;v.srcObject=s;camOn=true;ar.classList.remove("nocam");if(o.onCam)o.onCam(true)},function(){if(o.onCam)o.onCam(false)})}}
  $("#arX").onclick=function(){stop();if(o.onCancel)o.onCancel()};
  function H(){return hasOri?hd:dragH}
  c.onpointerdown=function(e){pd=[e.clientX,dragH,e.clientX,e.clientY]};
  c.onpointermove=function(e){if(pd&&!hasOri&&phase==="hunt")dragH=pd[1]-(e.clientX-pd[0])*.32};
  c.onpointerup=function(e){var q=pd;pd=null;if(!q||phase!=="hunt"||o.kind!=="stuk")return;if(Math.hypot(e.clientX-q[2],e.clientY-q[3])>12)return;
    var b=c.getBoundingClientRect(),d=wrap(target-H()),x=w/2+d/60*w;if(Math.hypot(e.clientX-b.left-x,e.clientY-b.top-sy)<62)got()};
  function got(){if(phase!=="hunt")return;gotT=performance.now();o.sfx&&o.sfx("goed");try{navigator.vibrate&&navigator.vibrate([120,60,200])}catch(e){}
    if(o.kind==="stuk"){phase="pop";popT=gotT;hint.textContent=T.gotPiece;setTimeout(function(){if(over)return;stop();o.onDone&&o.onDone()},1100)}
    else{phase="grow";hint.textContent=T.gotShade;setTimeout(function(){if(over)return;startShow()},900)}}
  function startShow(){phase="show";beat=0;beatT=performance.now();cap()}
  function cap(){hint.textContent=o.caps[beat]||"";nx.hidden=false;nx.textContent=beat<o.caps.length-1?T.next:T.keep;o.sfx&&o.sfx("tik")}
  nx.onclick=function(){if(phase!=="show")return;if(beat<o.caps.length-1){beat++;beatT=performance.now();cap()}else{stop();o.onDone&&o.onDone()}};
  if(o.skipHunt)startShow();
  function frame(ts){if(over)return;var dt=Math.min(.1,(ts-last)/1000)||0;last=ts;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);var hdg=H();
    if(!camOn)pano(g,w,h,phase==="show"?hdg:hdg,ts);
    if(phase==="hunt"){var d=wrap(target-hdg),fov=60,x=w/2+d/fov*w,y=h*.46;sy=y+Math.sin(ts/420)*8;
      if(Math.abs(d)<fov*.8&&ts>goneT){
        if(o.kind==="stuk"){var hg=g.createRadialGradient(x,sy,4,x,sy,74);hg.addColorStop(0,"rgba(255,226,140,.75)");hg.addColorStop(1,"rgba(255,226,140,0)");g.fillStyle=hg;g.beginPath();g.arc(x,sy,74,0,7);g.fill();g.save();g.translate(x,sy);g.rotate(Math.sin(ts/500)*.25);L.piece(g,0,0,68,o.piece,ts);g.restore()}
        else{var rr2=40+hold*26,fl=.55+.35*Math.abs(Math.sin(ts/190))+(Math.random()<.06?-.3:0);lantern(g,x+Math.sin(ts/61)*2*(1+hold),y,rr2,Math.max(.2,fl),function(S){fig(S.g,S.cx,S.gy,S.U*1.25,o.who||"X",{t:ts/1000,pose:"stand"})})}}
      if(o.kind==="schim"){g.strokeStyle="rgba(246,239,223,.75)";g.lineWidth=1.5;g.beginPath();g.arc(w/2,y,54,0,7);g.stroke();
        var near=Math.abs(d)<11&&ts>goneT;hold=near?hold+dt:Math.max(0,hold-dt*1.4);
        if(!moved&&hold>.5){moved=true;hold=0;near=false;goneT=ts+1300;target=(hdg+110+Math.random()*70)%360;o.sfx&&o.sfx("fout");try{navigator.vibrate&&navigator.vibrate([80,50,80])}catch(e){}}
        if(near){g.strokeStyle="#f2b632";g.lineWidth=5;g.beginPath();g.arc(w/2,y,62,-1.57,-1.57+6.283*Math.min(1,hold/1.4));g.stroke()}
        hint.textContent=goneT&&ts<goneT+1800?T.gone:near?T.hold:d<-11?T.left:d>11?T.right:"";
        if(hold>=1.4)got()}
      else{hint.textContent=Math.abs(d)<24?T.tapPiece:d<0?T.left:T.right}
      if(!hasOri&&ts-(frame.t0||(frame.t0=ts))>1500&&!frame.said){frame.said=1;ttl.textContent=(o.title?o.title+" · ":"")+T.drag}
      /* pijlen aan de rand */
      if(Math.abs(d)>26){g.fillStyle="rgba(242,182,50,"+(.6+.4*Math.sin(ts/200))+")";var ax=d<0?26:w-26,dir=d<0?-1:1;g.beginPath();g.moveTo(ax+dir*12,y);g.lineTo(ax-dir*10,y-16);g.lineTo(ax-dir*10,y+16);g.closePath();g.fill()}}
    else if(phase==="pop"){var q=Math.min(1,(ts-popT)/900),e2=1-Math.pow(1-q,3);g.save();g.translate(w/2+(wrap(target-hdg)/60*w)*(1-e2),mix(sy,h*.4,e2));g.rotate(e2*6.283);L.piece(g,0,0,68+e2*70,o.piece,ts);g.restore();
      for(var n=0;n<14;n++){var a=n/14*6.283+ts/400,rad=40+e2*110;g.fillStyle="rgba(255,226,140,"+(1-q)+")";g.beginPath();g.arc(w/2+Math.cos(a)*rad,h*.4+Math.sin(a)*rad,4,0,7);g.fill()}}
    else{var R0=Math.min(w*.47,h*.31),cx=w/2,cy=h*.4;
      if(phase==="grow"){var q2=sm(Math.min(1,(ts-gotT)/850)),sx0=w/2+wrap(target-hdg)/60*w;lantern(g,mix(sx0,cx,q2),mix(h*.46,cy,q2),mix(66,R0,q2),1,null)}
      else{var el=(ts-beatT)/1000,u=Math.min(1,el/3.4),fn=(SC[o.scene]||[])[beat];g.fillStyle="rgba(4,8,7,"+(camOn?.35:.5)+")";g.fillRect(0,0,w,h);lantern(g,cx,cy,R0,Math.min(1,.35+el*2.5)*(.96+.04*Math.sin(ts/90)),function(S){if(fn)fn(S,u,el)})}}
    raf=requestAnimationFrame(frame)}
  raf=requestAnimationFrame(frame);
  return cur};
})();
