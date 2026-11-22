"use strict";
/* De Schat van Rosse Neel - echte 3D-kamers (three.js r149). Valt terug op de getekende kamers als WebGL ontbreekt. */
(function(){
const T=window.THREE,R={ok:false},EN=window.LANG==='en';window.R3D=R;if(!T)return;
let shU=0,rend,scene,camera,canvas,G,PICK=[],ANIM=[],PREV={},NEW={},running=false,BELLG={},focus=null,last=0,intro=0,MM={};
const TC={},t0=performance.now(),HX=3,HY=3.2,EYE=1.55,D=Math.PI/180;
const now=()=>(performance.now()-t0)/1000;
try{canvas=document.getElementById('gl');rend=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'})}catch(e){return}
rend.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));rend.shadowMap.enabled=true;rend.shadowMap.type=T.PCFSoftShadowMap;rend.shadowMap.autoUpdate=false;rend.outputEncoding=T.sRGBEncoding;rend.toneMapping=T.ACESFilmicToneMapping;rend.toneMappingExposure=1.25;
camera=new T.PerspectiveCamera(72,1,.05,60);camera.rotation.order='YXZ';
R.ok=true;R._cam=camera;
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};

/* ---------- texturen ---------- */
function canv(key,w,h,fn,norep){if(!TC[key]){const c=document.createElement('canvas');c.width=w;c.height=h;seed=key.length*7919+key.charCodeAt(0)*31+13;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;if(!norep)t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;TC[key]=t}return TC[key]}
function rep(t,x,y){const c=t.clone();c.repeat.set(x,y);c.needsUpdate=true;c.userData.c=1;return c}
function woodTex(key,c1,c2){return canv(key,512,512,(g,w,h)=>{g.fillStyle=c1;g.fillRect(0,0,w,h);for(let i=0;i<8;i++){const y=i*64;g.fillStyle=`rgba(${rnd()<.5?'0,0,0':'255,220,170'},${rnd()*.13})`;g.fillRect(0,y,w,64);
  for(let j=0;j<14;j++){g.strokeStyle=`rgba(40,20,5,${.08+rnd()*.16})`;g.lineWidth=1+rnd()*1.5;g.beginPath();const yy=y+6+rnd()*52;g.moveTo(0,yy);g.bezierCurveTo(170,yy+rnd()*8-4,340,yy+rnd()*8-4,512,yy);g.stroke()}
  g.fillStyle=c2;g.fillRect(0,y,w,5);g.fillRect(rnd()*500,y,4,64);if(rnd()<.6){g.fillStyle='rgba(30,15,5,.5)';g.beginPath();g.ellipse(rnd()*512,y+32,7,4,0,0,7);g.fill()}}})}
function stoneTex(key,b,mortar){return canv(key,512,512,g=>{g.fillStyle=mortar;g.fillRect(0,0,512,512);const vv=[];for(let i=0;i<8;i++)vv.push(rnd()*34-17);
  for(let r=0;r<4;r++)for(let c=-1;c<3;c++){const x=c*256+(r%2?128:0),y=r*128,v=vv[r*2+((c+2)%2)];g.fillStyle=`rgb(${b[0]+v|0},${b[1]+v|0},${b[2]+v|0})`;g.fillRect(x+5,y+5,246,118);g.fillStyle='rgba(255,255,255,.07)';g.fillRect(x+5,y+5,246,6);g.fillStyle='rgba(0,0,0,.16)';g.fillRect(x+5,y+115,246,8)}
  for(let i=0;i<500;i++){g.fillStyle=`rgba(${rnd()<.5?'0,0,0':'255,255,255'},${rnd()*.09})`;g.fillRect(rnd()*512,rnd()*512,2+rnd()*4,2+rnd()*4)}})}
function rockTex(key,b){return canv(key,512,512,g=>{g.fillStyle=`rgb(${b})`;g.fillRect(0,0,512,512);for(let i=0;i<130;i++){g.fillStyle=`rgba(${rnd()<.5?'0,0,0':'190,220,225'},${.04+rnd()*.12})`;g.beginPath();g.ellipse(rnd()*512,rnd()*512,20+rnd()*70,10+rnd()*40,rnd()*3,0,7);g.fill()}
  for(let i=0;i<26;i++){g.strokeStyle=`rgba(10,15,18,${.25+rnd()*.3})`;g.lineWidth=1+rnd()*2;g.beginPath();let x=rnd()*512,y=rnd()*512;g.moveTo(x,y);for(let j=0;j<4;j++){x+=rnd()*60-30;y+=rnd()*60-20;g.lineTo(x,y)}g.stroke()}})}
function sandTex(){return canv('sand',512,512,g=>{g.fillStyle='#9a8558';g.fillRect(0,0,512,512);for(let i=0;i<9;i++){g.strokeStyle='rgba(70,55,25,.28)';g.lineWidth=5;g.beginPath();const y=i*57+20;g.moveTo(0,y);g.bezierCurveTo(128,y-24,384,y+24,512,y);g.stroke()}for(let i=0;i<900;i++){g.fillStyle=`rgba(${rnd()<.5?'60,45,20':'255,240,200'},${rnd()*.2})`;g.fillRect(rnd()*512,rnd()*512,2,2)}})}
function tileTex(){return canv('tile',512,512,g=>{for(let r=0;r<2;r++)for(let c=0;c<2;c++){g.fillStyle=(r+c)%2?'#2a3a4b':'#3d5268';g.fillRect(c*256,r*256,256,256);g.strokeStyle='#131c26';g.lineWidth=8;g.strokeRect(c*256,r*256,256,256)}for(let i=0;i<400;i++){g.fillStyle=`rgba(255,255,255,${rnd()*.05})`;g.fillRect(rnd()*512,rnd()*512,3,3)}})}
function skyTex(){return canv('sky',512,512,g=>{const gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#04101f');gr.addColorStop(.62,'#1c4a66');gr.addColorStop(.63,'#0c2a3c');gr.addColorStop(1,'#061722');g.fillStyle=gr;g.fillRect(0,0,512,512);
  for(let i=0;i<110;i++){g.fillStyle=`rgba(255,250,230,${.3+rnd()*.7})`;g.fillRect(rnd()*512,rnd()*310,1.5+rnd()*1.5,1.5+rnd()*1.5)}
  const m=g.createRadialGradient(350,140,10,350,140,120);m.addColorStop(0,'rgba(255,248,220,1)');m.addColorStop(.3,'rgba(255,248,220,.95)');m.addColorStop(.34,'rgba(200,225,255,.3)');m.addColorStop(1,'rgba(200,225,255,0)');g.fillStyle=m;g.fillRect(200,0,312,300);
  for(let i=0;i<40;i++){g.fillStyle=`rgba(220,235,255,${rnd()*.35})`;g.fillRect(300+rnd()*100-i,325+i*4.5,20+rnd()*60,2)}},true)}
function glowTex(){return canv('glow',128,128,g=>{const m=g.createRadialGradient(64,64,2,64,64,64);m.addColorStop(0,'rgba(255,255,255,1)');m.addColorStop(.25,'rgba(255,255,255,.45)');m.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=m;g.fillRect(0,0,128,128)},true)}
function globeTex(){return canv('globe',512,256,g=>{g.fillStyle='#2b6d86';g.fillRect(0,0,512,256);g.fillStyle='#cdb277';for(let i=0;i<16;i++){g.beginPath();g.ellipse(rnd()*512,40+rnd()*176,20+rnd()*50,12+rnd()*34,rnd()*3,0,7);g.fill()}g.strokeStyle='rgba(20,40,50,.4)';for(let i=1;i<8;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,256);g.stroke()}for(let i=1;i<4;i++){g.beginPath();g.moveTo(0,i*64);g.lineTo(512,i*64);g.stroke()}},true)}
let DEFS='';
function svgTex(key,inner,vw,vh,scale){if(TC[key])return TC[key];scale=scale||1;const w=Math.round(vw*scale),h=Math.round(vh*scale),c=document.createElement('canvas');c.width=w;c.height=h;const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;
  if(!DEFS){const d=document.querySelector('svg defs');DEFS=d?d.outerHTML:''}
  const img=new Image();img.onload=()=>{c.getContext('2d').drawImage(img,0,0,w,h);t.needsUpdate=true};img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${w}" height="${h}">${DEFS}${inner}</svg>`);return TC[key]=t}

/* ---------- bouwstenen ---------- */
function M(c,o){return new T.MeshStandardMaterial(Object.assign({color:c,roughness:.86,metalness:0},o||{}))}
function mm(k,f){return MM[k]||(MM[k]=f())}
const WD=()=>mm('wd',()=>M(0xffffff,{map:rep(woodTex('w1','#6d4627','#2c1a0c'),1,1)}));
const DK=()=>mm('dk',()=>M(0xffffff,{map:rep(woodTex('w2','#3f2815','#190e05'),1,1)}));
const BR=()=>mm('br',()=>M(0xd9a93a,{metalness:.85,roughness:.32}));
const IR=()=>mm('ir',()=>M(0x2b2f35,{metalness:.7,roughness:.5}));
const ST=()=>mm('st',()=>M(0x6a727d,{roughness:.95}));
const GO=()=>mm('go',()=>M(0xf5c84a,{metalness:.95,roughness:.22,emissive:0x6b4500,emissiveIntensity:.5}));
const PA=()=>mm('pa',()=>M(0xf2e6c4,{roughness:1}));
function sh(o){o.castShadow=true;o.receiveShadow=true;return o}
function bx(w,h,d,m,x,y,z,ry){const o=sh(new T.Mesh(new T.BoxGeometry(w,h,d),m));o.position.set(x,y,z);if(ry)o.rotation.y=ry;G.add(o);return o}
function cy(rt,rb,h,m,x,y,z,seg){const o=sh(new T.Mesh(new T.CylinderGeometry(rt,rb,h,seg||16),m));o.position.set(x,y,z);G.add(o);return o}
function sp(r,m,x,y,z){const o=sh(new T.Mesh(new T.SphereGeometry(r,20,14),m));o.position.set(x,y,z);G.add(o);return o}
function pl(w,h,m,x,y,z){const o=new T.Mesh(new T.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.receiveShadow=true;G.add(o);return o}
function decal(tex,w,h,x,y,z,o){return pl(w,h,new T.MeshStandardMaterial(Object.assign({map:tex,transparent:true,alphaTest:.04,roughness:1},o||{})),x,y,z)}
function lit(tex,w,h,x,y,z){return pl(w,h,new T.MeshBasicMaterial({map:tex,transparent:true}),x,y,z)}
function grp(x,y,z,ry){const g=new T.Group();g.position.set(x||0,y||0,z||0);g.rotation.y=ry||0;G.add(g);return g}
function into(g,fn){const p=G;G=g;fn(g);G=p;return g}
function pick(o,id){o.traverse(c=>{c.userData.hs=id});PICK.push(o);return o}
function hit(w,h,d,x,y,z,id){const o=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));o.position.set(x,y,z);G.add(o);return pick(o,id)}
const WALLS={n:[0,-HX,0],e:[HX,0,-Math.PI/2],s:[0,HX,Math.PI],w:[-HX,0,Math.PI/2]};
function wall(k,fn){const a=WALLS[k];return into(grp(a[0],0,a[1],a[2]),fn)}
function tw(key,dur,fn){if(NEW[key]){const s=now();shU=Math.max(shU,s+dur+.3);fn(0);ANIM.push(t=>{let e=Math.min(1,(t-s)/dur);fn(e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2);return e<1})}else fn(1)}
function glow(x,y,z,s,c,op){const m=new T.Sprite(new T.SpriteMaterial({map:glowTex(),color:c,transparent:true,opacity:op||.8,blending:T.AdditiveBlending,depthWrite:false}));m.position.set(x,y,z);m.scale.set(s,s,s);G.add(m);return m}
function flame(x,y,z,o){o=o||{};const m=new T.Mesh(new T.ConeGeometry(.03,.11,8),new T.MeshBasicMaterial({color:0xffe19a}));m.position.set(x,y+.055,z);G.add(m);const gl=glow(x,y+.06,z,.5,0xffb050,.75);const L=new T.PointLight(o.c||0xffa24a,o.i||.9,o.d||6.5,1.6);L.position.set(x,y+.12,z);G.add(L);const ph=rnd()*9,I=o.i||.9;
  ANIM.push(t=>{const f=.84+.13*Math.sin(t*11+ph)+.07*Math.sin(t*23.7+ph*2);L.intensity=I*f;m.scale.y=.85+.3*Math.abs(Math.sin(t*9+ph));gl.material.opacity=.55+.25*f});return L}
function candle(x,y,z,o){cy(.07,.09,.03,BR(),x,y+.015,z,12);cy(.028,.03,.2,mm('wax',()=>M(0xf3ead0,{emissive:0x332200})),x,y+.13,z,10);return flame(x,y+.23,z,o)}
function scope(x,y,z,ry,rz){const g=grp(x,y,z,ry||0);g.rotation.z=rz||0;into(g,()=>{const a=cy(.07,.07,.42,BR(),-.2,0,0);a.rotation.z=Math.PI/2;const b=cy(.055,.055,.34,WD(),.16,0,0);b.rotation.z=Math.PI/2;const c=cy(.045,.045,.26,BR(),.44,0,0);c.rotation.z=Math.PI/2});return g}
function coin(key,x,y,z,flat){if(S.fl[key])return;const g=grp(x,y,z);into(g,()=>{const c=new T.Mesh(new T.CylinderGeometry(.075,.075,.016,20),GO());if(!flat)c.rotation.x=Math.PI/2;G.add(c);const s=glow(0,0,0,.34,0xffd766,.5);ANIM.push(t=>{if(!flat)c.rotation.z=t*1.6;s.material.opacity=.25+.3*Math.abs(Math.sin(t*2.2+x))});hit(.34,.34,.34,0,0,0,'coin:'+key)});pick(g,'coin:'+key)}
function barrel(x,z,sn,tally){const g=grp(x,0,z);into(g,()=>{const pts=[];for(let i=0;i<=8;i++){const a=i/8;pts.push(new T.Vector2(.3+.1*Math.sin(a*Math.PI),a*.98))}const b=sh(new T.Mesh(new T.LatheGeometry(pts,20),WD()));G.add(b);cy(.3,.3,.02,DK(),0,.97,0,20);
    for(const y of[.14,.84]){const h=new T.Mesh(new T.TorusGeometry(.345+(.02),.022,8,24),IR());h.rotation.x=Math.PI/2;h.position.y=y;G.add(h)}
    if(sn){let s=sym(sn,128,96,120,'#f4f1e4');for(let i=0;i<tally;i++)s+=`<path d="M${128-tally*17+i*34+10} 180l8 56" stroke="#f4f1e4" stroke-width="11" stroke-linecap="round"/>`;decal(svgTex('bar'+sn+tally,s,256,256,1),.46,.46,0,.5,.415)}});return g}
function chest3(x,z,ry,big,key,id){const w=big?1.15:.95,h=big?.55:.45,d=big?.7:.6,lh=big?.26:.2,col=big?mm('cr',()=>M(0xc8503c,{roughness:.6,map:rep(woodTex('w1','#6d4627','#2c1a0c'),1,1)})):WD();const g=grp(x,0,z,ry);into(g,()=>{
  if(big){cy(.82,.9,.3,ST(),0,.15,0,24);cy(.72,.82,.14,ST(),0,.37,0,24)}const y0=big?.44:0;
  bx(w,h,d,col,0,y0+h/2,0);for(const sx of[-.34,.34]){bx(.09,h+.01,d+.02,big?GO():BR(),sx*w,y0+h/2,0)}bx(.16,.2,.03,big?GO():BR(),0,y0+h-.08,d/2+.015);
  const gl=pl(w-.12,d-.12,new T.MeshBasicMaterial({color:0xffd766}),0,y0+h-.03,0);gl.rotation.x=-Math.PI/2;gl.visible=false;const L=new T.PointLight(0xffc24a,0,7,1.5);L.position.set(0,y0+h+.25,0);G.add(L);
  const lid=grp(0,y0+h,-d/2);into(lid,()=>{bx(w,lh,d,col,0,lh/2,d/2);const top=cy(d/2,d/2,w,col,0,lh,d/2,20);top.rotation.z=Math.PI/2;top.scale.set(.45,1,1);for(const sx of[-.34,.34]){const b=cy(d/2+.012,d/2+.012,.09,big?GO():BR(),sx*w,lh,d/2,20);b.rotation.z=Math.PI/2;b.scale.set(.47,1,1);bx(.09,lh+.01,d+.02,big?GO():BR(),sx*w,lh/2,d/2)}});
  if(S.fl[key])tw(key,1.5,e=>{lid.rotation.x=-1.95*e;gl.visible=e>.15;L.intensity=(big?3.2:1.2)*e});
  if(S.fl[key]&&big){for(let i=0;i<46;i++){const c=new T.Mesh(new T.CylinderGeometry(.05,.05,.012,10),GO());c.position.set((rnd()-.5)*(w-.2),y0+h-.03+rnd()*.07,(rnd()-.5)*(d-.2));c.rotation.set(rnd()*3,rnd()*3,rnd()*3);G.add(c)}}});
  return pick(g,id||'chest')}
function door(done,col,wood){const fr=wood?DK():ST();const g=grp(0,0,0);into(g,()=>{bx(.2,2.5,.26,fr,-.82,1.25,.12);bx(.2,2.5,.26,fr,.82,1.25,.12);bx(1.84,.24,.26,fr,0,2.6,.12);const ar=new T.Mesh(new T.TorusGeometry(.72,.1,8,20,Math.PI),fr);ar.position.set(0,2.5,.14);ar.scale.set(1,.45,1.2);G.add(ar);pl(1.44,2.5,new T.MeshBasicMaterial({color:done?0xffc070:0x050302}),0,1.25,.02);
    const dm=mm('door'+col,()=>M(col||0x2f5560,{roughness:.7}));const dg=grp(-.72,0,.12);into(dg,()=>{bx(1.44,2.46,.09,dm,.72,1.23,0);for(let i=0;i<4;i++)bx(.02,2.4,.012,M(0x0c1a1e),.2+i*.35,1.23,.05);for(const y of[.45,1.25,2.05]){bx(1.3,.09,.03,IR(),.68,y,.055)}const k=new T.Mesh(new T.TorusGeometry(.07,.018,8,16),BR());k.position.set(1.22,1.2,.09);G.add(k);sp(.03,BR(),1.22,1.28,.07)});
    if(done){tw('door'+RI(),1.3,e=>{dg.rotation.y=-.75*e});const L=new T.PointLight(0xffc880,1.1,4.5,1.5);L.position.set(0,1.6,.3);G.add(L);
      lit(svgTex('lbl','<rect x="4" y="4" width="312" height="72" rx="12" fill="#e8b93e" stroke="#8a6510" stroke-width="5"/><text x="160" y="52" text-anchor="middle" font-size="36" fill="#2a1c05" font-family="Georgia,serif">'+(EN?'To the map':'Naar de kaart')+'</text>',320,80,2),1.1,.275,0,2.98,.3)}hit(1.8,2.7,.4,0,1.35,.15,'door')});return pick(g,'door')}
function shell(o){scene.background=new T.Color(o.fog);scene.fog=new T.Fog(o.fog,o.fn||3.5,o.ff||13);
  const wm=M(0xffffff,{map:rep(o.wall,o.wr||2,o.wv||1.07),bumpMap:rep(o.wall,o.wr||2,o.wv||1.07),bumpScale:o.bump||.035,roughness:.95});
  for(const k in WALLS){const a=WALLS[k],p=new T.Mesh(new T.PlaneGeometry(6,HY),wm);p.position.set(a[0],HY/2,a[1]);p.rotation.y=a[2];p.receiveShadow=true;scene.add(p)}
  const fl=new T.Mesh(new T.PlaneGeometry(6,6),M(0xffffff,{map:rep(o.floor,o.fr||2,o.fr||2),bumpMap:rep(o.floor,o.fr||2,o.fr||2),bumpScale:.03,roughness:o.frough||.9}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;scene.add(fl);
  const ce=new T.Mesh(new T.PlaneGeometry(6,6),M(0xffffff,{map:rep(o.ceil,2,2),roughness:1}));ce.rotation.x=Math.PI/2;ce.position.y=HY;scene.add(ce);
  scene.add(new T.HemisphereLight(o.amb[0],o.amb[2]||0x5a4632,o.amb[1]))}
function dust(n,c,op){const g=new T.BufferGeometry(),p=new Float32Array(n*3);for(let i=0;i<n*3;i+=3){p[i]=(rnd()-.5)*5.6;p[i+1]=rnd()*HY;p[i+2]=(rnd()-.5)*5.6}g.setAttribute('position',new T.BufferAttribute(p,3));
  const pts=new T.Points(g,new T.PointsMaterial({map:glowTex(),color:c,size:.045,transparent:true,opacity:op||.5,depthWrite:false,blending:T.AdditiveBlending}));scene.add(pts);
  ANIM.push((t,dt)=>{const a=g.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i]+=Math.sin(t*.3+i)*dt*.03;a[i+1]+=dt*.035;if(a[i+1]>HY)a[i+1]=0}g.attributes.position.needsUpdate=true})}
function key(L,sz){L.castShadow=true;L.shadow.mapSize.set(sz||1024,sz||1024);L.shadow.bias=-.0025;L.shadow.radius=4;return L}

/* ================= DE ZES KAMERS ================= */
const BUILD=[
/* 1 kapiteinshut */
()=>{const f=S.fl;shell({wall:woodTex('w1','#6d4627','#2c1a0c'),floor:woodTex('w1','#6d4627','#2c1a0c'),ceil:woodTex('w2','#3f2815','#190e05'),fog:0x0d0703,amb:[0xffe2b8,.34]});
  G=scene;for(const z of[-2,0,2])bx(6,.22,.26,DK(),0,HY-.11,z);for(const x of[-2.93,2.93])for(const z of[-1.5,1.5])bx(.14,HY,.22,DK(),x,HY/2,z);
  const rug=decal(svgTex('rug','<ellipse cx="256" cy="256" rx="250" ry="250" fill="#7a2a1e" stroke="#c9952a" stroke-width="14"/><ellipse cx="256" cy="256" rx="190" ry="190" fill="none" stroke="#c9952a" stroke-width="5" stroke-dasharray="18 12"/>'+sym('anker',256,256,200,'#c9952a'),512,512,1),2.5,2.5,0,.012,-.3);rug.rotation.x=-Math.PI/2;
  coin('r1b',1.5,HY-.12,.16);
  wall('n',()=>{const sky=new T.Mesh(new T.CircleGeometry(.56,32),new T.MeshBasicMaterial({map:skyTex()}));sky.position.set(0,2.1,.02);G.add(sky);const ring=new T.Mesh(new T.TorusGeometry(.59,.075,10,36),BR());ring.position.set(0,2.1,.06);G.add(ring);bx(.045,1.14,.04,BR(),0,2.1,.05);bx(1.14,.045,.04,BR(),0,2.1,.05);
    const moon=key(new T.SpotLight(0x86b4ff,2.2,13,.62,.7,1));moon.position.set(0,2.5,.15);moon.target.position.set(0,0,3.4);G.add(moon,moon.target);
    bx(2.5,.08,.95,DK(),0,.86,.62);for(const sx of[-1.15,1.15])for(const sz of[.22,1.02])bx(.09,.82,.09,DK(),sx,.41,sz);bx(2.3,.3,.06,DK(),0,.67,.2);
    const dr=grp(0,.7,.66);into(dr,()=>{bx(1,.2,.72,WD(),0,0,0);sp(.045,BR(),0,0,.38);if(f.drawer){pl(.86,.6,M(0x140b04),0,.102,0).rotation.x=-Math.PI/2}});pick(dr,'drawer');if(f.drawer)tw('drawer',.9,e=>{dr.position.z=.66+.5*e});
    const lg=grp(-.78,.9,.66,.18);into(lg,()=>{bx(.56,.05,.4,mm('red',()=>M(0x8c2a1c)),0,.025,0);bx(.25,.03,.36,PA(),-.13,.065,0);bx(.25,.03,.36,PA(),.13,.065,0);hit(.7,.3,.55,0,.12,0,'log')});pick(lg,'log');
    candle(.98,.9,.55);scope(.2,.97,.72,.25);bx(.22,.16,.16,WD(),-.1,.98,.4,-.3)});
  wall('e',()=>{bx(2.1,.06,.36,DK(),-1.05,1.5,.2);for(const sx of[-2,-.1])bx(.06,.3,.3,DK(),sx,1.34,.17);candle(-1.7,1.53,.2);candle(-.45,1.53,.2);
    bx(.3,.34,.24,mm('grn',()=>M(0x4c6a3a)),-1.2,1.7,.18);for(let i=0;i<4;i++)bx(.07,.26+.04*(i%2),.2,M([0x7a2a1e,0x2e4a5a,0x5a4a1e,0x3a2a4a][i]),-.95+i*.085,1.66+.02*(i%2),.17);
    coin('r1a',1.35,1.75,.03);
    const pg=grp(.7,2.3,.07);into(pg,()=>{bx(1.36,1,.06,BR(),.68,-.5,0);const p=lit(svgTex('ship','<rect width="460" height="340" fill="#1f4c66"/><circle cx="360" cy="80" r="30" fill="#f6ecd0"/><path d="M0 240q40-18 78 0t78 0 78 0 78 0 78 0 70 0v100H0z" fill="#12323f"/>'+ship(230,238,3,2.4),460,340,1.5),1.2,.86,.68,-.5,.035);p.material=new T.MeshStandardMaterial({map:p.material.map,roughness:.8})});pick(pg,'paint');sp(.03,IR(),.7,2.3,.1);if(f.paint)tw('paint',1.1,e=>{pg.rotation.z=-.62*e});
});
  wall('s',()=>{door(f.done0,0x2f5560,true);const cb=mm('cb',()=>M(0x24282e,{metalness:.6,roughness:.45}));const r=.16;[[1.3,0],[1.62,0],[1.94,0],[1.46,1],[1.78,1],[1.62,2]].forEach(a=>sp(r,cb,a[0],r+a[1]*.27,.4));bx(1.1,.05,.5,DK(),1.62,.012,.4);
    barrel(-1.9,.55);bx(.7,.6,.6,WD(),-1.0,.3,.45,.2)});
  wall('w',()=>{bx(.3,.05,.24,DK(),-1.8,1.45,.14);candle(-1.8,1.475,.15);bx(.05,.3,.14,IR(),1.15,1.72,.09);bx(.05,.3,.14,IR(),1.95,1.72,.09);scope(1.5,1.86,.16);
    decal(svgTex('flag','<path d="M10 10h300l-36 150H46z" fill="#12100e" stroke="#b08a3a" stroke-width="8"/>'+sym('schedel',160,80,96,'#ecdcb4'),320,170,1.5),1.3,.7,0,2.45,.03)});
  G=scene;chest3(-2.2,0,Math.PI/2,false,'done0');dust(70,0xffd9a0,.45)},

/* 2 kaartenkamer */
()=>{const f=S.fl;shell({wall:stoneTex('s1',[98,106,116],'#30353c'),floor:tileTex(),ceil:woodTex('w2','#3f2815','#190e05'),fog:0x0a0d12,amb:[0xdde6ff,.3],fr:3});
  G=scene;for(const x of[-2,0,2])bx(.24,.24,6,DK(),x,HY-.12,0);
  const inl=decal(svgTex('inlay','<circle cx="256" cy="256" r="240" fill="#12323f" stroke="#c9952a" stroke-width="12"/><path d="M256 30l40 226-40 226-40-226zM30 256l226-40 226 40-226 40z" fill="#c9952a"/>',512,512,1),2.4,2.4,0,.012,0);inl.rotation.x=-Math.PI/2;
  coin('r2b',-2.3,.02,2.3,true);
  const lamp=key(new T.SpotLight(0xffc98a,1.9,10,.95,.8,1.2));lamp.position.set(0,HY-.1,0);lamp.target.position.set(0,0,0);scene.add(lamp,lamp.target);cy(.02,.02,.5,IR(),0,HY-.25,0,6);cy(.12,.2,.2,BR(),0,HY-.55,0,12);glow(0,HY-.68,0,.9,0xffc070,.7);
  wall('n',()=>{bx(3.9,2.4,.07,DK(),0,1.75,.04);const ch=pl(3.66,2.2,new T.MeshStandardMaterial({map:svgTex('chart',chartInner(),1000,600,1.3),roughness:1}),0,1.75,.085);pick(ch,'chart');
    for(const sx of[-2.5,2.5]){cy(.05,.09,1.0,IR(),sx,.5,.4,8);candle(sx,1.0,.4)}});
  wall('w',()=>{const gg=grp(0,0,.9);into(gg,()=>{cy(.32,.4,.08,DK(),0,.04,0);cy(.05,.05,.8,DK(),0,.45,0,8);const gl=sp(.46,new T.MeshStandardMaterial({map:globeTex(),roughness:.6}),0,1.3,0);gl.rotation.z=.4;const rg=new T.Mesh(new T.TorusGeometry(.5,.025,8,36),BR());rg.position.y=1.3;rg.rotation.y=Math.PI/2;G.add(rg);
      ANIM.push((t,dt)=>{gl.rotation.y+=dt*.12});if(f.globe)tw('globe',1.6,e=>{gl.rotation.y=e*9});hit(1.1,1.9,1.1,0,1,0,'globe')});pick(gg,'globe');
    if(f.globe){const n=grp(.75,.02,1.0);n.rotation.y=.5;into(n,()=>{const p=decal(svgTex('note','<rect width="130" height="90" fill="#f6ecd0" stroke="#6b4a1c" stroke-width="3"/><path d="M16 24h98M16 44h80M16 64h90" stroke="#6b4a1c" stroke-width="4"/>',130,90,2),.42,.3,0,0,0);p.rotation.x=-Math.PI/2;glow(0,.1,0,.6,0xfff0c0,.35);hit(.6,.3,.5,0,.1,0,'note')});pick(n,'note');tw('globe',1.2,e=>{n.position.y=1.2-1.18*e;n.rotation.z=(1-e)*2})}
    const sm=decal(svgTex('stars','<rect width="230" height="300" fill="#0d2b3d" stroke="#3f2713" stroke-width="12"/><g fill="#f6ecd0"><circle cx="60" cy="60" r="5"/><circle cx="130" cy="90" r="6"/><circle cx="170" cy="170" r="5"/><circle cx="80" cy="210" r="6"/><circle cx="40" cy="150" r="4"/></g><path d="M60 60l70 30 40 80-90 40-40-60z" stroke="#f6ecd0" stroke-width="2" fill="none" opacity=".7"/>',230,300,1.5),1,1.3,-1.9,1.8,.03)});
  wall('e',()=>{const cb=grp(0,0,.35);into(cb,()=>{bx(1.7,2.4,.06,DK(),0,1.2,-.3);bx(.07,2.4,.66,DK(),-.85,1.2,0);bx(.07,2.4,.66,DK(),.85,1.2,0);bx(1.77,.08,.7,DK(),0,2.44,0);bx(1.7,.06,.6,DK(),0,1.0,0);
      const dl=grp(-.82,1.2,.33),dr=grp(.82,1.2,.33);into(dl,()=>{bx(.82,2.36,.06,WD(),.41,0,0)});into(dr,()=>{bx(.82,2.36,.06,WD(),-.41,0,0)});
      const dial=grp(0,1.3,.37);into(dial,()=>{const c=cy(.34,.34,.05,BR(),0,0,0,28);c.rotation.x=Math.PI/2;lit(svgTex('dial','<circle cx="100" cy="100" r="96" fill="#0d2b3d" stroke="#f0cf6a" stroke-width="8"/><path d="M100 30l16 70H84zM100 170l16-70H84z" fill="#ecdcb4"/><path d="M30 100l70-16v32zM170 100l-70-16v32z" fill="#b5432c"/><g font-family="Georgia,serif" font-size="24" fill="#f0cf6a" text-anchor="middle"><text x="100" y="26">N</text><text x="100" y="192">'+(EN?'S':'Z')+'</text><text x="14" y="108">W</text><text x="186" y="108">'+(EN?'E':'O')+'</text></g>',200,200,1.5),.6,.6,0,0,.03)});
      if(f.done1){dial.visible=false;tw('done1',1.4,e=>{dl.rotation.y=-1.9*e;dr.rotation.y=1.9*e});const L=new T.PointLight(0xffc24a,1.6,4,1.5);L.position.set(0,1.5,.1);G.add(L);glow(0,1.35,0,.9,0xffd766,.6)}hit(1.7,2.4,.8,0,1.2,.1,'cab')});pick(cb,'cab');
    decal(svgTex('map2','<rect width="210" height="160" fill="url(#pPar)" stroke="#6b4a1c" stroke-width="5"/><path d="M30 110q40-70 80-30t60-40" stroke="#6b1f12" stroke-width="4" fill="none" stroke-dasharray="7 6"/>',210,160,2),1.0,.76,2.0,1.8,.03);decal(svgTex('map3','<rect width="210" height="160" fill="url(#pPar)" stroke="#6b4a1c" stroke-width="5"/><circle cx="105" cy="80" r="50" fill="none" stroke="#6b4a1c" stroke-width="4"/><path d="M105 30v100M55 80h100" stroke="#6b4a1c" stroke-width="3"/>',210,160,2),1.0,.76,-2.0,1.7,.03).rotation.z=.07});
  wall('s',()=>{door(f.done1,0x5a2a22);const bs=grp(2.0,0,.22);into(bs,()=>{bx(1.5,2.6,.05,DK(),0,1.3,-.18);bx(.06,2.6,.4,DK(),-.75,1.3,0);bx(.06,2.6,.4,DK(),.75,1.3,0);for(let r=0;r<5;r++)bx(1.5,.05,.4,DK(),0,.05+r*.62,0);
      const cols=[0x7a2a1e,0x2e4a5a,0x5a4a1e,0x3a5a3a,0x5a2a4a,0x2a2a5a];for(let r=0;r<4;r++){let x=-.68;while(x<.62){const w=.07+rnd()*.07,h=.36+rnd()*.18;if(!(r===1&&x>-.05&&x<.1))bx(w,h,.26,M(cols[(rnd()*6)|0]),x+w/2,.08+r*.62+h/2,.0);x+=w+.012}}});
    if(!f.r2a){const bk=grp(2.02,.95,.38);bk.rotation.set(.0,.0,-.22);into(bk,()=>{bx(.1,.46,.3,mm('redb',()=>M(0xc23a26,{emissive:0x300804})),0,0,0);bx(.104,.05,.302,GO(),0,.12,0);hit(.3,.6,.4,0,0,0,'coin:r2a')});pick(bk,'coin:r2a')}
    bx(1.0,.9,.5,DK(),-2.0,.45,.3);for(let i=0;i<5;i++){const s=cy(.07,.07,.9,PA(),-2.3+i*.15,.98+(i%2)*.13,.3,10);s.rotation.x=Math.PI/2}});
  G=scene;dust(60,0xffe2b0,.4)},

/* 3 smokkelkelder */
()=>{const f=S.fl,Lt=f.lant;shell({wall:stoneTex('s2',[112,70,52],'#1c120d'),floor:stoneTex('s3',[70,52,42],'#120b08'),ceil:woodTex('w2','#3f2815','#190e05'),fog:0x030201,amb:[0xffc890,Lt?.1:.012],fn:2,ff:11});
  G=scene;for(const z of[-1.8,0,1.8])bx(6,.24,.28,DK(),0,HY-.12,z);coin('r3b',-1.6,HY-.13,.18);
  if(!Lt){const c=new T.SpotLight(0x9fb4d0,K()?.55:.3,7,.42,.9,1);camera.add(c);c.position.set(0,0,0);c.target.position.set(0,0,-1);camera.add(c.target);scene.add(camera);R._cl=c}
  wall('n',()=>{bx(1.7,.06,.36,DK(),1.55,1.45,.2);for(const sx of[.8,2.3])bx(.06,.3,.3,DK(),sx,1.29,.17);
    const lg=grp(1.6,1.48,.22);into(lg,()=>{cy(.11,.13,.04,BR(),0,.02,0,12);const gls=cy(.09,.09,.24,new T.MeshStandardMaterial({color:0xffd9a0,transparent:true,opacity:.35,emissive:Lt?0xffa040:0x331000,emissiveIntensity:Lt?1.4:.4}),0,.16,0,12);cy(.03,.11,.07,BR(),0,.315,0,12);const hd=new T.Mesh(new T.TorusGeometry(.08,.012,6,16,Math.PI),BR());hd.position.y=.35;G.add(hd);
      const em=sp(.025,new T.MeshBasicMaterial({color:0xff7a1a}),0,.12,0);const g2=glow(0,.14,0,Lt?1.3:.42,0xff9a40,.9);const L=new T.PointLight(0xffa450,0,12,1.4);L.position.set(0,.2,.25);G.add(L);if(Lt){key(L,512);tw('lant',1.6,e=>{L.userData.i=2.6*e})}else L.userData.i=.16;
      ANIM.push(t=>{const fl=.85+.12*Math.sin(t*10)+.06*Math.sin(t*23);L.intensity=(L.userData.i||0)*(Lt?fl:.6+.4*Math.sin(t*3));g2.material.opacity=Lt?.6+.25*fl:.5+.4*Math.sin(t*3)});hit(.5,.6,.5,0,.2,0,'lant')});pick(lg,'lant');
    barrel(-1.7,.6,'anker',3);bx(.9,.8,.8,WD(),.2,.4,.55,.15);bx(.6,.5,.6,WD(),.25,1.05,.55,-.2)});
  wall('e',()=>{barrel(-.9,.6,'kroon',4);barrel(.9,.55);barrel(1.75,.6);const r=new T.Mesh(new T.TorusGeometry(.3,.04,8,20),M(0xb59a66));r.position.set(-2.2,1.9,.06);G.add(r);bx(.06,.06,.12,IR(),-2.2,2.2,.06)});
  wall('s',()=>{door(f.done2,0x3a3226);decal(svgTex('chalk','<g font-family="\'Comic Sans MS\',\'Segoe Print\',\'Bradley Hand\',cursive" font-size="50" fill="#f4f1e4" opacity=".92"><text x="14" y="62">'+(EN?'MOST':'MEESTE')+'</text><text x="14" y="126">'+(EN?'MARKS':'STREEPJES')+'</text><text x="14" y="190">'+(EN?'FIRST':'EERST')+'</text></g>',330,210,2),1.5,.95,-1.9,1.75,.03).rotation.z=.05;barrel(1.8,.6,'schedel',2);for(let i=0;i<3;i++)bx(1.4,.18,.3,ST(),0,-.02+i*.01,.5+i*.3)});
  wall('w',()=>{barrel(.8,.6,'vis',1);barrel(-.4,.55);bx(.8,.7,.7,WD(),-1.9,.35,.5,.3);coin('r3a',-1.25,.09,.3);cy(.02,.02,1.3,M(0xb59a66),2.2,HY-.65,.5,6);bx(.2,.26,.2,IR(),2.2,HY-1.4,.5)});
  G=scene;const tg=grp(0,0,-.9);into(tg,()=>{bx(1.5,.05,1.5,IR(),0,.012,0);pl(1.3,1.3,new T.MeshBasicMaterial({color:f.done2?0x2a1c06:0x000000}),0,.04,0).rotation.x=-Math.PI/2;
    const dg=grp(0,.05,-.65);into(dg,()=>{bx(1.3,.07,1.3,WD(),0,0,.65);for(const sx of[-.4,.4])bx(.09,.075,1.3,IR(),sx,0,.65);bx(.5,.06,.2,BR(),0,.05,1.05);const ring=new T.Mesh(new T.TorusGeometry(.09,.02,6,16),IR());ring.position.set(0,.05,.75);ring.rotation.x=Math.PI/2;G.add(ring)});
    if(f.done2){tw('done2',1.5,e=>{dg.rotation.x=-1.75*e});const L=new T.PointLight(0xffc24a,1.8,4,1.5);L.position.set(0,.3,0);G.add(L);glow(0,.25,0,1.4,0xffd766,.6)}hit(1.5,.4,1.5,0,.15,0,'trap')});pick(tg,'trap');
  if(Lt)dust(50,0xffc080,.4)},

/* 4 klokkentoren */
()=>{const f=S.fl;shell({wall:stoneTex('s1',[98,106,116],'#30353c'),floor:woodTex('w1','#6d4627','#2c1a0c'),ceil:woodTex('w2','#3f2815','#190e05'),fog:0x060b14,amb:[0xa9c4ff,.5,0x3a4252]});
  G=scene;const cx=bx(8.4,.2,.24,DK(),0,HY-.1,0,Math.PI/4);bx(8.4,.2,.24,DK(),0,HY-.1,0,-Math.PI/4);coin('r4b',1.3,HY-.12,-1.12);
  bx(1.1,.03,1.1,M(0x050302),-2.1,.016,2.1);for(const sx of[-.2,.2]){cy(.025,.025,HY,M(0xb59a66),-2.1+sx,HY/2,2.1,6)}
  const arch='<defs><clipPath id="ac"><path d="M0 512V200Q0 0 180 0t180 200v312z"/></clipPath></defs><g clip-path="url(#ac)"><rect width="360" height="512" fill="url(#gSky)"/><g fill="#f6ecd0"><circle cx="50" cy="150" r="2.5"/><circle cx="120" cy="60" r="2"/><circle cx="300" cy="120" r="2.5"/><circle cx="250" cy="260" r="2"/><circle cx="80" cy="300" r="2.5"/><circle cx="200" cy="180" r="2"/><circle cx="320" cy="330" r="2"/></g>MOON<path d="M0 430q60-40 120-14t120-10 120 4v110H0z" fill="#07131c"/></g>';
  const moonL=key(new T.SpotLight(0x9cc0ff,2.4,14,.7,.8,1));moonL.position.set(2.9,2.6,0);moonL.target.position.set(-1.5,0,0);scene.add(moonL,moonL.target);
  wall('n',()=>{lit(svgTex('archN',arch.replace('MOON',''),360,512,1.5),4.6,2.9,0,1.5,.02);bx(4.9,.14,.3,ST(),0,.08,.12);for(const sx of[-2.4,2.4])bx(.3,3,.3,ST(),sx,1.5,.12);
    bx(5.6,.2,.22,DK(),0,2.85,.75);for(const sx of[-2.4,2.4]){bx(.3,.05,.3,IR(),sx,1.6,.42);candle(sx,1.625,.45,{i:1.5,d:7})}BELLG={};BELLS.forEach((k,i)=>{const x=(i-2)*1.02,Rr=.15+k*.05,pv=grp(x,2.75,.75);into(pv,()=>{cy(.014,.014,.34,IR(),0,-.17,0,6);const pts=[[0,1.25],[.34,1.2],[.5,.92],[.6,.42],[.84,.09],[1,0]].map(p=>new T.Vector2(p[0]*Rr,p[1]*Rr));const b=sh(new T.Mesh(new T.LatheGeometry(pts,24),mm('bell',()=>M(0xd9a93a,{metalness:.9,roughness:.28,side:T.DoubleSide}))));b.position.y=-.34-Rr*1.25;G.add(b);sp(Rr*.2,IR(),0,-.34-Rr*1.22,0);hit(Rr*2.3,Rr*2+.4,Rr*2.3,0,-.34-Rr*.6,0,'bell:'+k)});pick(pv,'bell:'+k);BELLG[k]=pv});
    const stn=grp(0,.75,.2);into(stn,()=>{bx(.9,.8,.22,ST(),0,0,0);decal(svgTex('starst',sym('ster',64,64,110,'#2a2f36'),128,128,1),.5,.5,0,0,.115)});pl(.84,.74,new T.MeshBasicMaterial({color:f.done3?0x3a2606:0x000000}),0,.75,.1);
    if(f.done3){tw('done3',1.6,e=>{stn.position.x=1.0*e});const L=new T.PointLight(0xffc24a,1.5,4,1.5);L.position.set(0,.8,.5);G.add(L);glow(0,.75,.2,.9,0xffd766,.6)}});
  wall('e',()=>{lit(svgTex('archE',arch.replace('MOON','<circle cx="230" cy="150" r="34" fill="#f6ecd0"/><circle cx="244" cy="140" r="30" fill="#12304a"/>'),360,512,1.5),2.6,3,0,1.6,.02);bx(3,.16,.5,ST(),0,.75,.2);bx(3,.75,.3,ST(),0,.37,.12);for(const sx of[-1.45,1.45])bx(.3,3.1,.3,ST(),sx,1.55,.12);
    const ng=grp(-.6,.84,.25);into(ng,()=>{const n=new T.Mesh(new T.TorusGeometry(.2,.07,8,18),M(0x6b4a1c));n.rotation.x=Math.PI/2;n.scale.y=1;G.add(n);cy(.2,.16,.04,M(0x5a3d14),0,-.03,0,14);sp(.05,M(0xe9e4d2),.07,.03,.03).scale.set(1,1.25,1);if(!f.b){const p=bx(.2,.01,.14,PA(),-.05,.06,-.02,.5);p.rotation.z=.25;glow(-.05,.1,0,.4,0xfff0c0,.35)}hit(.6,.4,.6,0,.05,0,'nest')});pick(ng,'nest')});
  wall('s',()=>{door(f.done3,0x24405a);const lc=grp(1.9,0,.6,-.4);into(lc,()=>{cy(.2,.26,.06,DK(),0,.03,0);cy(.04,.04,1.05,DK(),0,.55,0,8);const t=bx(.62,.04,.46,DK(),0,1.14,0);t.rotation.x=.5;const p=bx(.34,.012,.3,PA(),0,1.17,.01);p.rotation.x=.5;hit(.8,1.4,.7,0,.75,0,'lect')});pick(lc,'lect');
    });
  wall('w',()=>{const pq=grp(0,1.75,.05);into(pq,()=>{bx(1.5,.62,.05,BR(),0,0,0);decal(svgTex('plq','<rect width="300" height="110" fill="#2a2f36"/><path d="M26 34h248M26 58h248M26 82h180" stroke="#c9952a" stroke-width="6"/>',300,110,1.5),1.38,.5,0,0,.03)});pick(pq,'plaq');
    if(f.r4a)pl(.72,.36,new T.MeshBasicMaterial({color:0x000000}),-1.9,1.0,.02);else{const s=bx(.74,.38,.2,mm('st2',()=>M(0x8b94a0,{roughness:.9})),-1.9,1.0,.07);s.rotation.z=.04;pick(s,'coin:r4a')}
    bx(.9,1.5,.5,DK(),2.0,.75,.28);for(let i=0;i<3;i++)bx(.82,.03,.46,WD(),2.0,.3+i*.45,.3)});
  G=scene;dust(50,0xbcd4ff,.35)},

/* 5 getijdengrot */
()=>{const f=S.fl;shell({wall:rockTex('r1','58,72,76'),floor:sandTex(),ceil:rockTex('r2','40,50,54'),fog:0x061014,amb:[0x9fd8e6,.4,0x2a3a3c],bump:.07,wr:1.5,fn:3,ff:12});
  G=scene;const rk=mm('rk',()=>M(0x4a5a5f,{roughness:1,flatShading:true})),rk2=mm('rk2',()=>M(0x38464a,{roughness:1,flatShading:true}));seed=4242;
  for(let i=0;i<34;i++){const a=rnd()*Math.PI*2,r=2.5+rnd()*.5,s=.25+rnd()*.5;const x=Math.cos(a)*3,z=Math.sin(a)*3;const m=sh(new T.Mesh(new T.DodecahedronGeometry(s,0),i%2?rk:rk2));const ax=Math.abs(Math.cos(a))>Math.abs(Math.sin(a));m.position.set(ax?Math.sign(x)*(2.95-rnd()*.15):(rnd()-.5)*5.6,rnd()<.6?s*.5:1.2+rnd()*1.9,ax?(rnd()-.5)*5.6:Math.sign(z)*(2.95-rnd()*.15));
    const p=m.position;if(Math.abs(p.x)<1.1&&p.z<-2.5&&p.y>.3&&p.y<2.8)continue;if(Math.abs(p.x)<1.2&&p.z>2.5)continue;if(p.x>2.4&&Math.abs(p.z)<1.5&&p.y<.6)continue;m.rotation.set(rnd()*3,rnd()*3,rnd()*3);m.scale.set(1,.7+rnd()*.6,1);G.add(m)}
  for(let i=0;i<16;i++){const h=.3+rnd()*.8,c=sh(new T.Mesh(new T.ConeGeometry(.07+rnd()*.1,h,6),rk2));c.position.set((rnd()-.5)*5.4,HY-h/2,(rnd()-.5)*5.4);c.rotation.x=Math.PI;G.add(c)}
  const beam=new T.Mesh(new T.CylinderGeometry(.06,.5,3,16,1,true),new T.MeshBasicMaterial({color:0xbfe0ff,transparent:true,opacity:.11,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));beam.position.set(-.5,1.9,-2.2);beam.rotation.z=-.16;G.add(beam);ANIM.push(t=>{beam.material.opacity=.09+.03*Math.sin(t*1.3)});
  const ml=key(new T.SpotLight(0xa8d0ff,2.6,12,.5,.8,1));ml.position.set(-.75,HY,-2.1);ml.target.position.set(-.2,0,-1.9);G.add(ml,ml.target);
  const fill=new T.PointLight(0x4fb6d0,.7,9,1.5);fill.position.set(1.8,.6,0);G.add(fill);
  { const s=sp(.14,M(0xc2553a,{roughness:1}),.9,.03,1.6);s.scale.set(1,.2,1) }
  if(!f.r5b){const sg=grp(-1.3,0,1.5);into(sg,()=>{const s=sp(.16,M(0xf0dfc8,{roughness:.6}),0,0,0);s.scale.set(1,.5,.8);hit(.5,.3,.5,0,.1,0,'coin:r5b')});pick(sg,'coin:r5b')}
  wall('n',()=>{const mg=grp(0,1.55,.16);into(mg,()=>{bx(2.1,2.1,.08,mm('slate',()=>M(0x182226,{roughness:.7})),0,0,0);for(const a of[[-1.05,0,.08,2.2],[1.05,0,.08,2.2],[0,1.05,2.2,.08],[0,-1.05,2.2,.08]])bx(a[2],a[3],.14,BR(),a[0],a[1],.02);
      const mir=mm('mir',()=>M(0xe8f6ff,{metalness:1,roughness:.08,emissive:0x1a3038}));[[-.5,.6,.7],[.1,.1,-.7],[-.62,-.15,.7],[.55,.65,.7]].forEach(a=>{const m=bx(.42,.05,.06,mir,a[0],a[1],.08);m.rotation.z=a[2]});
      const ring=new T.Mesh(new T.TorusGeometry(.13,.015,6,18),BR());ring.position.set(-.62,-.68,.07);G.add(ring);
      const cr=new T.Mesh(new T.OctahedronGeometry(.2,0),new T.MeshStandardMaterial({color:f.done4?0x9ff0ff:0x3d6a78,emissive:f.done4?0x49d8ff:0x06181c,emissiveIntensity:f.done4?1.6:1,roughness:.15,metalness:.2,flatShading:true}));cr.position.set(.62,-.62,.14);cr.scale.y=1.4;G.add(cr);ANIM.push(t=>{cr.rotation.y=t*.8});
      if(f.done4){const L=new T.PointLight(0x5fdcff,0,8,1.4);L.position.set(.62,-.62,.5);G.add(L);const g2=glow(.62,-.62,.2,1.6,0x6fe0ff,.7);tw('done4',1.4,e=>{L.intensity=2.4*e;g2.material.opacity=.7*e})}hit(2.2,2.2,.4,0,0,.1,'mir')});pick(mg,'mir');
    if(f.done4){pl(.7,.9,new T.MeshBasicMaterial({color:0x2a1c06}),2.0,.6,.03);glow(2.0,.6,.2,.9,0xffd766,.6)}});
  wall('e',()=>{const pg=grp(0,0,1.0);into(pg,()=>{const rim=new T.Mesh(new T.TorusGeometry(1.15,.16,8,22),rk);rim.rotation.x=Math.PI/2;rim.position.y=.03;rim.scale.set(1,.75,1);G.add(rim);
      const wg=new T.CircleGeometry(1.1,28),w=new T.Mesh(wg,new T.MeshStandardMaterial({color:0x1b6a80,emissive:0x0a3440,roughness:.08,metalness:.6,transparent:true,opacity:.88}));w.rotation.x=-Math.PI/2;w.position.y=.07;w.scale.y=.75;G.add(w);const base=wg.attributes.position.array.slice();ANIM.push(t=>{const a=wg.attributes.position.array;for(let i=0;i<a.length;i+=3)a[i+2]=Math.sin(base[i]*5+t*1.6)*.018+Math.cos(base[i+1]*6+t*1.2)*.018;wg.attributes.position.needsUpdate=true;wg.computeVertexNormals()});
      if(!f.shard){const s=bx(.16,.012,.11,mm('mir',()=>M(0xe8f6ff,{metalness:1,roughness:.08,emissive:0x1a3038})),.2,.1,.1,.6);const g2=glow(.2,.16,.1,.5,0xcfeaff,.6);ANIM.push(t=>{g2.material.opacity=.25+.45*Math.abs(Math.sin(t*2.4))})}hit(2.2,.5,1.8,0,.2,0,'pool')});pick(pg,'pool')});
  wall('s',()=>{const dg=grp(0,0,0);into(dg,()=>{lit(svgTex('mouth','<defs><clipPath id="mc"><path d="M0 512V230Q-10 0 200 0t200 230v282z"/></clipPath></defs><g clip-path="url(#mc)"><rect width="400" height="512" fill="url(#gSky)"/><circle cx="280" cy="150" r="36" fill="#f6ecd0"/><circle cx="280" cy="150" r="70" fill="#f6ecd0" opacity=".12"/><path d="M0 330q50-20 100 0t100 0 100 0 100 0v182H0z" fill="#12323f"/><path d="M0 370q50-16 100 0t100 0 100 0 100 0M0 420q50-16 100 0t100 0 100 0 100 0" stroke="#7fb9c9" stroke-width="3" fill="none"/><path d="M250 340h60M240 380h80M230 430h100" stroke="#f6ecd0" stroke-width="3" opacity=".5"/></g>',400,512,1.3),2.5,2.9,0,1.45,.03);hit(2.4,2.8,.3,0,1.4,.1,'door');
      if(f.done4)lit(svgTex('lbl','<rect x="4" y="4" width="312" height="72" rx="12" fill="#e8b93e" stroke="#8a6510" stroke-width="5"/><text x="160" y="52" text-anchor="middle" font-size="36" fill="#2a1c05" font-family="Georgia,serif">'+(EN?'To the map':'Naar de kaart')+'</text>',320,80,2),1.0,.25,0,1.9,.3)});pick(dg,'door')});
  wall('w',()=>{const bg=grp(.1,0,.9);bg.rotation.y=.15;into(bg,()=>{const h=sh(new T.Mesh(new T.SphereGeometry(1,18,10,0,Math.PI*2,Math.PI/2,Math.PI/2),M(0xffffff,{map:rep(woodTex('w1','#6d4627','#2c1a0c'),2,1),side:T.DoubleSide})));h.scale.set(1.35,.5,.5);h.position.y=.5;G.add(h);bx(.1,.05,.9,DK(),-.4,.42,0);bx(.1,.05,.9,DK(),.45,.42,0);const o=cy(.025,.025,1.9,WD(),.3,.75,.2,8);o.rotation.z=1.1;hit(2.7,.9,1.1,0,.4,0,'boat')});pick(bg,'boat');
    into(bg,()=>coin('r5a',-.05,.28,0));
    const rn=decal(svgTex('rune','<g stroke="#e9dfc0" stroke-width="7" fill="none" opacity=".85" stroke-linecap="round"><path d="M30 40h120l80 80M230 120l-90 90"/><path d="M208 104l44 30" stroke-width="14"/><circle cx="118" cy="232" r="20"/><path d="M30 20l-14 20 14 20"/></g>',280,270,1.5),1.2,1.15,-1.7,1.9,.3);pick(rn,'rune')});
  G=scene;dust(60,0x9fe0ff,.4)},

/* 6 schatkamer */
()=>{const f=S.fl;shell({wall:stoneTex('s4',[52,72,92],'#141d27'),floor:tileTex(),ceil:stoneTex('s5',[30,42,56],'#0c1219'),fog:0x05080d,amb:[0xc8d8ff,.3],fr:3});
  G=scene;for(const sx of[-2.7,2.7])for(const sz of[-2.7,2.7]){cy(.24,.28,HY,ST(),sx,HY/2,sz,14);cy(.36,.36,.16,ST(),sx,.08,sz,14);cy(.36,.3,.2,ST(),sx,HY-.1,sz,14)}
  const ringF=new T.Mesh(new T.RingGeometry(1.15,1.22,48),new T.MeshBasicMaterial({color:0xc9952a}));ringF.rotation.x=-Math.PI/2;ringF.position.set(0,.013,-2.0);G.add(ringF);
  if(!f.r6b){const cg=grp(0,HY-.5,.3);into(cg,()=>{cy(.006,.006,.5,IR(),0,.25,0,4)});coin('r6b',0,HY-.56,.3)}
  const lamp=key(new T.SpotLight(0xffd9a0,1.5,10,.75,.9,1.2));lamp.position.set(0,HY-.05,-1.0);lamp.target.position.set(0,0,-2.0);G.add(lamp,lamp.target);
  const gs=(n,k,x,y)=>lit(svgTex('g'+n,sym(n,64,64,112,'#f3c941'),128,128,1.5),.7,.7,x,y,.03);
  wall('n',()=>{bx(2.9,.2,.3,ST(),0,2.75,.14);for(const sx of[-1.4,1.4])bx(.28,2.7,.3,ST(),sx,1.35,.14);pl(2.5,2.6,new T.MeshBasicMaterial({color:0x04080d}),0,1.3,.02);gs('zon',0,-2.2,2.0);gs('maan',0,2.2,2.0);
    for(const sx of[-2.2,2.2]){cy(.06,.1,1.1,IR(),sx,.55,.4,8);cy(.14,.07,.1,IR(),sx,1.13,.4,10);flame(sx,1.17,.4,{i:1.3,d:7})}});
  wall('e',()=>{const sg=grp(0,0,.55);into(sg,()=>{bx(.9,.5,.7,ST(),0,.25,0);const body=cy(.2,.34,1.0,mm('coat',()=>M(0x24364f,{roughness:.8})),0,1.0,0,12);sp(.19,mm('skin',()=>M(0xd9b08c,{roughness:.8})),0,1.68,0);const hair=sp(.22,mm('hair',()=>M(0xc23a1c,{roughness:.7,emissive:0x2a0600})),0,1.66,-.05);hair.scale.set(1.12,1.25,1);
      const hat=cy(.34,.36,.05,mm('hat',()=>M(0x141c2a)),0,1.86,0,3);hat.rotation.y=Math.PI;cy(.14,.2,.16,mm('hat',()=>M(0x141c2a)),0,1.95,0,10);for(const sx of[-.3,.3]){const a=cy(.06,.07,.7,mm('coat',()=>M(0x24364f)),sx,1.12,.05,8);a.rotation.z=sx*.6}
      const pq=bx(.7,.3,.04,BR(),0,.28,.37);hit(1.1,2.2,.9,0,1.1,0,'plaq')});pick(sg,'plaq');coin('r6a',1.2,.09,.5);gs('golf',0,-1.9,2.0);gs('ster',0,1.9,2.0)});
  wall('s',()=>{door(false,0x5a4a1e);gs('schedel',0,-1.9,2.0);gs('anker',0,1.9,2.0)});
  wall('w',()=>{const tg=grp(0,0,.6);into(tg,()=>{bx(1.9,.12,.9,ST(),0,.84,0);for(const sx of[-.75,.75])bx(.22,.8,.7,ST(),sx,.4,0);
      if(f.map){const m=pl(.62,.84,new T.MeshStandardMaterial({map:svgTex('tmap'+S.lvl,treasureMap().replace(/^<svg[^>]*>|<\/svg>$/g,''),400,540,1.4),roughness:1}),0,.905,0);m.rotation.x=-Math.PI/2;m.rotation.z=.08;tw('map',.8,e=>{m.position.y=1.5-.595*e});glow(0,1.0,0,1.1,0xfff0c0,.3)}
      else{const m=lit(svgTex('leg','<rect x="6" y="6" width="188" height="248" fill="none" stroke="#c9952a" stroke-width="6" stroke-dasharray="14 10"/><text x="100" y="140" text-anchor="middle" font-size="30" fill="#c9952a" font-family="Georgia,serif" font-style="italic">'+(EN?'lay here':'leg hier')+'</text>',200,260,1.5),.62,.84,0,.905,0);m.rotation.x=-Math.PI/2}
      hit(1.9,.5,.9,0,1.0,0,'table')});pick(tg,'table')});
  G=scene;chest3(0,-2.0,0,true,'won');dust(70,0xffd766,.5)}
];

/* ---------- opbouw, camera, lus ---------- */
function clear(){if(!scene)return;scene.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){(Array.isArray(m)?m:[m]).forEach(x=>{for(const k of['map','bumpMap'])if(x[k]&&x[k].userData&&x[k].userData.c)x[k].dispose();x.dispose()})}});if(R._cl){camera.remove(R._cl,R._cl.target);R._cl=null}if(camera.parent)camera.parent.remove(camera)}
R.build=function(first){clear();NEW={};if(first)PREV=Object.assign({},S.fl);for(const k in S.fl)if(!PREV[k])NEW[k]=1;if(S.fl['done'+RI()]&&NEW['done'+RI()])NEW['door'+RI()]=1;PREV=Object.assign({},S.fl);
  scene=new T.Scene();PICK=[];ANIM=[];MM={};G=scene;seed=RI()*977+101;BUILD[RI()]();shU=Math.max(shU,now()+.6)};
R.enter=function(){R.build(true);intro=now();if(!running){running=true;last=now();requestAnimationFrame(frame)}};
R.stop=function(){running=false};
R.resize=function(w,h){rend.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?84:62;camera.updateProjectionMatrix();return camera.fov};
R.ring=function(k){const g=BELLG[k];if(!g)return;const s=now();shU=Math.max(shU,s+3.6);ANIM.push(t=>{const e=t-s;g.rotation.z=.32*Math.sin(e*7)*Math.exp(-e*1.3);return e<3.5})};
const rc=new T.Raycaster(),v2=new T.Vector2(),v3=new T.Vector3();
R.tap=function(cx,cy){const r=canvas.getBoundingClientRect();v2.set((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height)*2+1);rc.setFromCamera(v2,camera);const h=rc.intersectObjects(PICK,true);if(!h.length)return null;
  const id=h[0].object.userData.hs,p=h[0].point,dx=p.x-camera.position.x,dy=p.y-camera.position.y,dz=p.z-camera.position.z;let ty=Math.atan2(dx,-dz)/D,tp=Math.atan2(dy,Math.hypot(dx,dz))/D;let d=((ty-yaw+540)%360)-180;
  if(Math.abs(d)>6||Math.abs(tp-pitch)>6)focus={y0:yaw,p0:pitch,y1:yaw+d*.8,p1:pitch+(tp-pitch)*.8,s:now()};return id};
R.nofocus=function(){focus=null};
R.turn=function(y1,p1){focus={y0:yaw,p0:pitch,y1:y1,p1:p1||0,s:now()}};
function frame(){if(!running)return;requestAnimationFrame(frame);if(window.__norender)return;const t=now(),dt=Math.min(.05,t-last);last=t;
  for(let i=ANIM.length-1;i>=0;i--)if(ANIM[i](t,dt)===false)ANIM.splice(i,1);
  if(focus){const e=Math.min(1,(t-focus.s)/.45),q=1-Math.pow(1-e,3);yaw=focus.y0+(focus.y1-focus.y0)*q;pitch=focus.p0+(focus.p1-focus.p0)*q;if(e>=1)focus=null}
  const ie=Math.min(1,(t-intro)/1.8),iq=1-Math.pow(1-ie,3),yr=(yaw-(1-iq)*55)*D,pr=pitch*D;
  camera.rotation.set(pr,-yr,0);const ln=-1.0;camera.position.set(Math.sin(yr)*ln,EYE+Math.sin(t*.9)*.012-(1-iq)*.2,-Math.cos(yr)*ln);
  if(t<shU)rend.shadowMap.needsUpdate=true;rend.render(scene,camera)}
})();
