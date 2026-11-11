/* De Erfenis van de Spellenmaker – de kisten in 3D (THREE r149).
   SM_KIST.open(host, spec, o) → {stop(), solve()}
   spec = {no, stages:[{type:"discs"|"dice"|"buttons"|"levers"|"tap", ...}]}
     discs:   {glyphs:[..], n, ans:[index per schijf], side}   (tik boven = vorige teken, tik onder = volgende)
     dice:    {n, ans:[ogen per steen]}
     buttons: {labels:[..], order:[index..], side, cols:[kleur per knop]}
     levers:  {labels:[..], ans:[true=omhoog..], side, cols:[..]}
     tap:     één knop
   side -1 = achterop de kist (de speler moet de kist omdraaien door te slepen).
   o = {sfx(naam), done(), stage(i,n)}. Zonder WebGL komt er een platte bediening (zelfde raadsel, zelfde antwoord). */
(function(){
"use strict";
var K=window.SM_KIST={};
function ease(t){return t<0?0:t>1?1:1-Math.pow(1-t,3)}
function back(t){var c=1.4;t=t<0?0:t>1?1:t;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)}

/* ---------- platte bediening als 3D niet kan ---------- */
function flat(host,spec,o){
  var box=document.createElement("div");box.className="smFlat";host.appendChild(box);var si=0,dead=false;
  function show(){if(dead)return;var st=spec.stages[si];box.innerHTML="";o.stage&&o.stage(si,spec.stages.length);
    var row=document.createElement("div");row.className="smFlatRow";box.appendChild(row);
    var win=function(){o.sfx("goed");si++;if(si>=spec.stages.length){o.sfx("open");setTimeout(function(){if(!dead)o.done()},500)}else show()};
    if(st.type==="discs"||st.type==="dice"){var n=st.n,v=[],G=st.type==="dice"?["1","2","3","4","5","6"]:st.glyphs;
      for(var i=0;i<n;i++)(function(i){v[i]=st.type==="dice"?(st.ans[i]%6):(st.ans[i]+1+i)%G.length;var b=document.createElement("button");b.type="button";b.className="smFlatB";b.textContent=G[v[i]];
        b.onclick=function(){v[i]=(v[i]+1)%G.length;b.textContent=G[v[i]];o.sfx("klik");if(v.every(function(x,j){return st.type==="dice"?x+1===st.ans[j]:x===st.ans[j]}))win()};row.appendChild(b)})(i)}
    else if(st.type==="buttons"){var pos=0;st.labels.forEach(function(l,i){var b=document.createElement("button");b.type="button";b.className="smFlatB";b.textContent=l;if(st.cols)b.style.color=st.cols[i];
        b.onclick=function(){if(b.disabled)return;if(st.order[pos]===i){b.disabled=true;pos++;o.sfx("klik");if(pos>=st.order.length)win()}else{pos=0;[].forEach.call(row.children,function(x){x.disabled=false});o.sfx("fout")}};row.appendChild(b)})}
    else if(st.type==="levers"){var up=st.labels.map(function(){return false});st.labels.forEach(function(l,i){var b=document.createElement("button");b.type="button";b.className="smFlatB";b.innerHTML=l+"<br>▽";if(st.cols)b.style.color=st.cols[i];
        b.onclick=function(){up[i]=!up[i];b.innerHTML=l+"<br>"+(up[i]?"▲":"▽");o.sfx("klik");if(up.every(function(x,j){return x===!!st.ans[j]}))win()};row.appendChild(b)})}
    else{var b=document.createElement("button");b.type="button";b.className="smFlatB";b.textContent="★";b.onclick=win;row.appendChild(b)}}
  show();
  return{stop:function(){dead=true;if(box.parentNode)box.parentNode.removeChild(box)},solve:function(){si=spec.stages.length;o.done()}}}

K.open=function(host,spec,o){
  var T=window.THREE,R=null;
  if(T){try{R=new T.WebGLRenderer({antialias:true,alpha:false})}catch(e){R=null}}
  if(!R)return flat(host,spec,o);
  var dead=false,raf=0,W=1,H=1,t0=performance.now(),opened=0,si=0,act=[],mech=null,mechs=[],sw=null;
  R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.outputEncoding=T.sRGBEncoding;
  var el=R.domElement;el.className="smGl";el.style.touchAction="none";host.appendChild(el);
  var sc=new T.Scene();sc.background=new T.Color(0x0a1512);sc.fog=new T.Fog(0x0a1512,10,26);
  var cam=new T.PerspectiveCamera(40,1,.1,60),orb={th:.35,ph:.62,r:12,tth:.0,tph:1.02,tr:6.4,free:spec.stages.some(function(s){return s.side===-1})};
  function ctex(w,h,fn){var c=document.createElement("canvas");c.width=w;c.height=h;fn(c.getContext("2d"),w,h);var t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t}
  function woodTex(base,rgb){return ctex(256,256,function(g,w,h){g.fillStyle=base;g.fillRect(0,0,w,h);for(var i=0;i<130;i++){g.strokeStyle="rgba("+rgb+","+(.05+Math.random()*.15)+")";g.lineWidth=.6+Math.random()*2.4;var y=Math.random()*h;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+Math.random()*14-7,w*.6,y+Math.random()*14-7,w,y+Math.random()*8-4);g.stroke()}})}
  var mWood=new T.MeshStandardMaterial({map:woodTex("#8a5a34","50,26,8"),roughness:.72,metalness:0}),
      mDark=new T.MeshStandardMaterial({map:woodTex("#5b3a22","30,14,4"),roughness:.8}),
      mBrass=new T.MeshPhongMaterial({color:0xc9a24a,specular:0xfff0b0,shininess:70}),
      mRed=new T.MeshLambertMaterial({color:0x8a2420,side:T.BackSide}),mBlack=new T.MeshLambertMaterial({color:0x17100a});
  /* tafel: vilt met een ganzenbord erop */
  var felt=ctex(256,256,function(g,w,h){g.fillStyle="#17483c";g.fillRect(0,0,w,h);for(var i=0;i<2600;i++){g.fillStyle="rgba("+(Math.random()<.5?"255,255,255":"0,0,0")+","+Math.random()*.06+")";g.fillRect(Math.random()*w,Math.random()*h,1.4,1.4)}});felt.wrapS=felt.wrapT=T.RepeatWrapping;felt.repeat.set(7,7);
  var tb=new T.Mesh(new T.PlaneGeometry(40,40),new T.MeshStandardMaterial({map:felt,roughness:1}));tb.rotation.x=-Math.PI/2;tb.receiveShadow=true;sc.add(tb);
  var bord=ctex(512,512,function(g,w){g.fillStyle="#f1e6c8";g.fillRect(0,0,w,w);var C=["#d6452f","#f2b632","#2f6f9f","#3f9a6a"],n=0,s=64,i;
    for(i=0;i<8;i++,n++){g.fillStyle=C[n%4];g.fillRect(i*s+3,3,s-6,s-6)}for(i=1;i<8;i++,n++){g.fillStyle=C[n%4];g.fillRect(7*s+3,i*s+3,s-6,s-6)}for(i=6;i>=0;i--,n++){g.fillStyle=C[n%4];g.fillRect(i*s+3,7*s+3,s-6,s-6)}for(i=6;i>=1;i--,n++){g.fillStyle=C[n%4];g.fillRect(3,i*s+3,s-6,s-6)}
    g.strokeStyle="#8a5a34";g.lineWidth=6;g.strokeRect(s+10,s+10,w-2*s-20,w-2*s-20);g.fillStyle="#8a5a34";g.font="700 54px Georgia,serif";g.textAlign="center";g.fillText("T",w/2,w/2+18)});
  var bd=new T.Mesh(new T.PlaneGeometry(6.4,6.4),new T.MeshStandardMaterial({map:bord,roughness:.9,color:0xb9ad92}));bd.rotation.x=-Math.PI/2;bd.position.y=.004;bd.receiveShadow=true;sc.add(bd);
  /* licht */
  sc.add(new T.AmbientLight(0xffe7c4,.26));
  var sp=new T.SpotLight(0xffe2b0,1.0,34,.5,.6,1);sp.position.set(2.6,8,4.6);sp.target.position.set(0,.6,0);sp.castShadow=true;sp.shadow.mapSize.set(1024,1024);sp.shadow.bias=-.0012;sc.add(sp);sc.add(sp.target);
  var rim=new T.PointLight(0x5fa0a8,.55,20);rim.position.set(-4,3,-4.5);sc.add(rim);
  var front=new T.PointLight(0xffd9a0,.2,14);front.position.set(0,2.2,5);sc.add(front);
  /* de kist: bodem, vier wanden, rood fluweel, koperen banden, deksel met scharnier achter */
  var kist=new T.Group();sc.add(kist);
  function boxm(w,h,d,m,x,y,z,par){var me=new T.Mesh(new T.BoxGeometry(w,h,d),m);me.position.set(x,y,z);me.castShadow=true;me.receiveShadow=true;(par||kist).add(me);return me}
  boxm(2.4,.08,1.5,mWood,0,.04,0);boxm(2.4,1.1,.08,mWood,0,.55,.71);boxm(2.4,1.1,.08,mWood,0,.55,-.71);boxm(.08,1.1,1.34,mWood,-1.16,.55,0);boxm(.08,1.1,1.34,mWood,1.16,.55,0);
  var inn=new T.Mesh(new T.BoxGeometry(2.22,1.0,1.32),mRed);inn.position.set(0,.6,0);kist.add(inn);
  boxm(2.46,.07,1.56,mBrass,0,.1,0);boxm(2.46,.05,1.56,mBrass,0,1.06,0);
  [[-1.2,.74],[1.2,.74],[-1.2,-.74],[1.2,-.74]].forEach(function(p){boxm(.1,1.1,.1,mBrass,p[0],.55,p[1])});
  var lid=new T.Group();lid.position.set(0,1.1,-.75);kist.add(lid);
  var lidTex=ctex(512,320,function(g,w,h){g.fillStyle="#7c4f2c";g.fillRect(0,0,w,h);for(var i=0;i<110;i++){g.strokeStyle="rgba(40,20,6,"+(.06+Math.random()*.14)+")";g.lineWidth=.8+Math.random()*2.4;var y=Math.random()*h;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+Math.random()*12-6,w*.6,y+Math.random()*12-6,w,y+Math.random()*8-4);g.stroke()}
    g.strokeStyle="#d9b25a";g.lineWidth=5;g.strokeRect(22,22,w-44,h-44);g.lineWidth=2;g.strokeRect(34,34,w-68,h-68);
    g.fillStyle="#d9b25a";g.beginPath();g.arc(w/2,h/2,84,0,7);g.fill();g.fillStyle="#4a2e1a";g.beginPath();g.arc(w/2,h/2,72,0,7);g.fill();
    g.fillStyle="#f2d488";g.textAlign="center";g.font="700 92px Georgia,serif";g.fillText(spec.no?String(spec.no):"T",w/2,h/2+32)});
  var lm=[mDark,mDark,new T.MeshStandardMaterial({map:lidTex,roughness:.65}),mDark,mDark,mDark],lidMesh=new T.Mesh(new T.BoxGeometry(2.5,.2,1.6),lm);lidMesh.position.set(0,.1,.78);lidMesh.castShadow=true;lid.add(lidMesh);
  boxm(.3,.13,.05,mBrass,0,.035,1.6,lid);
  var glow=new T.PointLight(0xffd27a,0,7);glow.position.set(0,.8,0);kist.add(glow);
  var prize=new T.Mesh(new T.BoxGeometry(1.25,.26,.85),[mDark,mDark,new T.MeshBasicMaterial({map:ctex(256,176,function(g,w,h){g.fillStyle="#d6452f";g.fillRect(0,0,w,h);g.fillStyle="#f2b632";g.fillRect(10,10,w-20,h-20);g.fillStyle="#d6452f";g.fillRect(18,18,w-36,h-36);g.fillStyle="#f6efdf";g.font="700 60px Georgia,serif";g.textAlign="center";g.fillText("SPEL",w/2,h/2+22)})}),mDark,mDark,mDark]);prize.position.set(0,.25,0);kist.add(prize);
  /* stofjes in het lamplicht */
  var dn=70,dp=new Float32Array(dn*3),i;for(i=0;i<dn;i++){dp[i*3]=(Math.random()-.5)*7;dp[i*3+1]=Math.random()*5;dp[i*3+2]=(Math.random()-.5)*6}
  var dg=new T.BufferGeometry();dg.setAttribute("position",new T.BufferAttribute(dp,3));var dust=new T.Points(dg,new T.PointsMaterial({color:0xffe2a8,size:.035,transparent:true,opacity:.55,depthWrite:false}));sc.add(dust);
  var spark=null,sv=null;

  /* ---------- mechanieken ---------- */
  function glyphTex(G,col){return ctex(256,256,function(g,w){g.fillStyle="#f3e7c6";g.beginPath();g.arc(128,128,128,0,7);g.fill();g.strokeStyle="#8a5a34";g.lineWidth=5;g.beginPath();g.arc(128,128,122,0,7);g.stroke();g.beginPath();g.arc(128,128,34,0,7);g.stroke();
      g.fillStyle=col||"#2a1a0c";g.textAlign="center";g.textBaseline="middle";var n=G.length,fs=n>8?46:56;g.font="700 "+fs+"px Georgia,'Times New Roman',serif";
      for(var j=0;j<n;j++){var a=j*Math.PI*2/n;g.save();g.translate(128+Math.sin(a)*82,128-Math.cos(a)*82);g.rotate(a);g.fillText(G[j],0,3);g.restore()}})}
  function labelTex(txt,col){return ctex(128,128,function(g){g.fillStyle="#f3e7c6";g.beginPath();g.arc(64,64,62,0,7);g.fill();g.fillStyle=col||"#2a1a0c";g.textAlign="center";g.textBaseline="middle";g.font="700 "+(String(txt).length>1?58:76)+"px Georgia,serif";g.fillText(txt,64,68)})}
  function pipTex(v){return ctex(128,128,function(g){g.fillStyle="#f6efdf";g.fillRect(0,0,128,128);g.strokeStyle="#c9bfa6";g.lineWidth=6;g.strokeRect(3,3,122,122);g.fillStyle=v===1?"#d6452f":"#1c1410";var P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[v];P.forEach(function(p){g.beginPath();g.arc(64+p[0]*32,64+p[1]*32,v===1?16:12,0,7);g.fill()})})}
  function mount(st){var gr=new T.Group();gr.userData.act=[];if(st.side===-1)gr.rotation.y=Math.PI;gr.scale.set(.001,.001,.001);kist.add(gr);return gr}
  function addHit(gr,mesh,fn){mesh.userData.hit=fn;gr.userData.act.push(mesh)}
  var BUILD={
    discs:function(st){var gr=mount(st),n=st.n,G=st.glyphs,idx=[],an=[],cvs=[],txs=[],ms=[];
      /* elke schijf is een rolletje achter een venster: het teken in het midden telt */
      function paint(j){var g=cvs[j].getContext("2d"),w=128,h=176,off=an[j]*h*.6,cur=idx[j],L=G.length;g.fillStyle="#f3e7c6";g.fillRect(0,0,w,h);g.textAlign="center";g.textBaseline="middle";
        g.fillStyle="#2a1a0c";g.font="700 "+(String(G[cur]).length>1?70:98)+"px Georgia,'Times New Roman',serif";g.fillText(G[cur],w/2,h/2+off+5);
        g.globalAlpha=.28;g.font="700 54px Georgia,'Times New Roman',serif";g.fillText(G[(cur-1+L)%L],w/2,h/2+off-h*.52);g.fillText(G[(cur+1)%L],w/2,h/2+off+h*.52);g.globalAlpha=1;
        var sh=g.createLinearGradient(0,0,0,h);sh.addColorStop(0,"rgba(50,28,10,.7)");sh.addColorStop(.24,"rgba(50,28,10,0)");sh.addColorStop(.76,"rgba(50,28,10,0)");sh.addColorStop(1,"rgba(50,28,10,.7)");g.fillStyle=sh;g.fillRect(0,0,w,h);txs[j].needsUpdate=true}
      for(var j=0;j<n;j++)(function(j){var x=(j-(n-1)/2)*.54;idx[j]=(st.ans[j]+1+j*2)%G.length;if(idx[j]===st.ans[j])idx[j]=(idx[j]+1)%G.length;an[j]=0;
        var fr=new T.Mesh(new T.BoxGeometry(.5,.66,.06),mBrass);fr.position.set(x,.56,.775);fr.castShadow=true;gr.add(fr);
        cvs[j]=document.createElement("canvas");cvs[j].width=128;cvs[j].height=176;txs[j]=new T.CanvasTexture(cvs[j]);txs[j].encoding=T.sRGBEncoding;
        var f=new T.Mesh(new T.PlaneGeometry(.4,.55),new T.MeshBasicMaterial({map:txs[j]}));f.position.set(x,.56,.807);gr.add(f);ms[j]=f;paint(j);
        /* tik op de bovenste helft: het teken erboven komt naar het midden (terug); op de onderste helft: het teken eronder (verder) */
        addHit(gr,f,function(h){var back=!!(h&&h.uv&&h.uv.y>.5),L=G.length;idx[j]=(idx[j]+(back?L-1:1))%L;an[j]=back?-1:1;o.sfx("klik");check()})})(j);
      gr.userData.tick=function(dt){for(var j=0;j<n;j++)if(an[j]){an[j]=an[j]>0?Math.max(0,an[j]-dt*7):Math.min(0,an[j]+dt*7);paint(j)}};
      gr.userData.ok=function(){return idx.every(function(v,j){return v===st.ans[j]})};
      gr.userData.solve=function(){for(var j=0;j<n;j++){idx[j]=st.ans[j];an[j]=1}};return gr},
    dice:function(st){var gr=mount(st),n=st.n,v=[],ms=[],hop=[],VAL=[3,4,1,6,2,5],mats=VAL.map(function(x){return new T.MeshStandardMaterial({map:pipTex(x),roughness:.5})});
      var Q={1:[0,0],6:[Math.PI,0],2:[-Math.PI/2,0],5:[Math.PI/2,0],3:[0,Math.PI/2],4:[0,-Math.PI/2]},qt=[];
      var tray=new T.Mesh(new T.BoxGeometry(n*.74+.3,.06,.8),mDark);tray.position.set(0,.03,1.42);tray.receiveShadow=true;gr.add(tray);
      function q(val){var e=new T.Euler(Q[val][0],0,Q[val][1]);return new T.Quaternion().setFromEuler(e)}
      for(var j=0;j<n;j++)(function(j){v[j]=st.ans[j]%6+1;if(v[j]===st.ans[j])v[j]=v[j]%6+1;hop[j]=0;var d=new T.Mesh(new T.BoxGeometry(.5,.5,.5),mats);d.position.set((j-(n-1)/2)*.74,.31,1.42);d.castShadow=true;d.quaternion.copy(q(v[j]));qt[j]=q(v[j]);gr.add(d);ms[j]=d;
        addHit(gr,d,function(){v[j]=v[j]%6+1;qt[j]=q(v[j]);hop[j]=1;o.sfx("klik");check()})})(j);
      gr.userData.tick=function(dt){for(var j=0;j<n;j++){ms[j].quaternion.slerp(qt[j],Math.min(1,dt*12));if(hop[j]>0){hop[j]=Math.max(0,hop[j]-dt*4);ms[j].position.y=.31+Math.sin(hop[j]*Math.PI)*.22}}};
      gr.userData.ok=function(){return v.every(function(x,j){return x===st.ans[j]})};gr.userData.high=true;
      gr.userData.solve=function(){for(var j=0;j<n;j++){v[j]=st.ans[j];qt[j]=q(v[j])}};return gr},
    buttons:function(st){var gr=mount(st),n=st.labels.length,pos=0,bs=[],dn=[],zz=[];
      for(var j=0;j<n;j++)(function(j){var x=(j-(n-1)/2)*(n>4?.44:.5),b=new T.Group();b.position.set(x,.56,.75);gr.add(b);
        var cyl=new T.Mesh(new T.CylinderGeometry(.18,.19,.16,32),mBrass);cyl.rotation.x=Math.PI/2;cyl.position.z=.07;cyl.castShadow=true;b.add(cyl);
        var f=new T.Mesh(new T.CircleGeometry(.155,32),new T.MeshBasicMaterial({map:labelTex(st.labels[j],st.cols&&st.cols[j])}));f.position.z=.152;b.add(f);bs[j]=b;dn[j]=false;zz[j]=.75;
        addHit(gr,f,function(){if(dn[j])return;if(st.order[pos]===j){dn[j]=true;zz[j]=.66;pos++;o.sfx("klik");check()}else{pos=0;for(var q=0;q<n;q++){dn[q]=false;zz[q]=.75}o.sfx("fout");shake=.5}})})(j);
      gr.userData.tick=function(dt){for(var j=0;j<n;j++)bs[j].position.z+=(zz[j]-bs[j].position.z)*Math.min(1,dt*18)};
      gr.userData.ok=function(){return pos>=st.order.length};
      gr.userData.solve=function(){pos=st.order.length;for(var j=0;j<n;j++){dn[j]=true;zz[j]=.66}};return gr},
    levers:function(st){var gr=mount(st),n=st.labels.length,up=[],pv=[],tg=[];
      for(var j=0;j<n;j++)(function(j){var x=(j-(n-1)/2)*.42;up[j]=false;tg[j]=.7;
        var slot=new T.Mesh(new T.BoxGeometry(.11,.42,.03),mBlack);slot.position.set(x,.4,.765);gr.add(slot);
        var pl=new T.Mesh(new T.BoxGeometry(.3,.52,.02),mBrass);pl.position.set(x,.4,.755);gr.add(pl);
        var p=new T.Group();p.position.set(x,.4,.77);p.rotation.x=.7;gr.add(p);pv[j]=p;
        var arm=new T.Mesh(new T.CylinderGeometry(.03,.03,.3,12),mBrass);arm.rotation.x=Math.PI/2;arm.position.z=.15;p.add(arm);
        var kn=new T.Mesh(new T.SphereGeometry(.085,18,14),new T.MeshPhongMaterial({color:st.cols?new T.Color(st.cols[j]):0xd6452f,specular:0xffffff,shininess:60}));kn.position.z=.32;kn.castShadow=true;p.add(kn);
        var lb=new T.Mesh(new T.CircleGeometry(.13,24),new T.MeshBasicMaterial({map:labelTex(st.labels[j],st.cols&&st.cols[j])}));lb.position.set(x,.84,.76);gr.add(lb);
        var hit=new T.Mesh(new T.BoxGeometry(.38,.95,.5),new T.MeshBasicMaterial({visible:false}));hit.position.set(x,.5,.95);gr.add(hit);
        addHit(gr,hit,function(){up[j]=!up[j];tg[j]=up[j]?-.7:.7;o.sfx("klik");check()})})(j);
      gr.userData.tick=function(dt){for(var j=0;j<n;j++)pv[j].rotation.x+=(tg[j]-pv[j].rotation.x)*Math.min(1,dt*14)};
      gr.userData.ok=function(){return up.every(function(u,j){return u===!!st.ans[j]})};
      gr.userData.solve=function(){for(var j=0;j<n;j++){up[j]=!!st.ans[j];tg[j]=up[j]?-.7:.7}};return gr},
    tap:function(st){var gr=mount(st),done=false,b=new T.Group(),z=.75;b.position.set(0,.56,.75);gr.add(b);
      var cyl=new T.Mesh(new T.CylinderGeometry(.3,.32,.18,40),mBrass);cyl.rotation.x=Math.PI/2;cyl.position.z=.08;cyl.castShadow=true;b.add(cyl);
      var f=new T.Mesh(new T.CircleGeometry(.26,40),new T.MeshBasicMaterial({map:labelTex(st.label||"★","#d6452f")}));f.position.z=.172;b.add(f);
      addHit(gr,f,function(){if(done)return;done=true;z=.64;o.sfx("klik");check()});
      gr.userData.tick=function(dt){b.position.z+=(z-b.position.z)*Math.min(1,dt*18);if(!done)b.scale.setScalar(1+Math.sin(performance.now()/260)*.04)};
      gr.userData.ok=function(){return done};gr.userData.solve=function(){done=true;z=.64};return gr}
  };
  var shake=0,checkT=0;
  function check(){clearTimeout(checkT);checkT=setTimeout(function(){if(dead||!mech||sw||opened)return;if(mech.userData.ok())solved()},380)}
  function setStage(n){si=n;mech=mechs[n];act=mech.userData.act;mech.userData.in=performance.now();o.stage&&o.stage(n,spec.stages.length);
    var st=spec.stages[n];orb.tph=mech.userData.high?.74:1.02}
  function solved(){o.sfx("goed");if(si+1<spec.stages.length){sw={t:performance.now(),from:mech};act=[];setTimeout(function(){if(dead)return;sw=null;setStage(si+1)},650)}else open()}
  function open(){if(opened)return;opened=performance.now();act=[];o.sfx("open");orb.tth=0;orb.tph=.78;
    var n=90,p=new Float32Array(n*3);sv=[];for(var j=0;j<n;j++){p[j*3]=(Math.random()-.5)*1.6;p[j*3+1]=1;p[j*3+2]=(Math.random()-.5)*1;sv.push([(Math.random()-.5)*1.2,1.4+Math.random()*2.2,(Math.random()-.5)*1.2])}
    var g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(p,3));spark=new T.Points(g,new T.PointsMaterial({color:0xffd66b,size:.07,transparent:true,opacity:1,depthWrite:false}));sc.add(spark);
    setTimeout(function(){if(!dead)o.done()},2500)}
  spec.stages.forEach(function(st){mechs.push(BUILD[st.type](st))});setStage(0);

  /* ---------- camera: slepen draait om de kist ---------- */
  function fit(){W=host.clientWidth||320;H=host.clientHeight||420;R.setSize(W,H);cam.aspect=W/H;cam.updateProjectionMatrix();orb.base=Math.max(6.1,1.72/(Math.tan(20*Math.PI/180)*cam.aspect))}
  fit();orb.tr=orb.base;orb.r=orb.base*1.9;var rs=function(){fit();orb.tr=orb.base};addEventListener("resize",rs);
  var pd=null,ray=new T.Raycaster(),v2=new T.Vector2();
  el.addEventListener("pointerdown",function(e){pd={x:e.clientX,y:e.clientY,th:orb.tth,ph:orb.tph,mv:0,t:performance.now()};try{el.setPointerCapture(e.pointerId)}catch(err){}});
  el.addEventListener("pointermove",function(e){if(!pd)return;var dx=e.clientX-pd.x,dy=e.clientY-pd.y;pd.mv=Math.max(pd.mv,Math.hypot(dx,dy));if(pd.mv<8||opened)return;
    orb.tth=pd.th-dx*.0085;if(!orb.free)orb.tth=Math.max(-1.15,Math.min(1.15,orb.tth));orb.tph=Math.max(.42,Math.min(1.32,pd.ph-dy*.006))});
  function up(e){if(!pd)return;var q=pd;pd=null;if(q.mv>=8||performance.now()-q.t>700||opened||sw)return;
    var b=el.getBoundingClientRect();v2.set((e.clientX-b.left)/b.width*2-1,-((e.clientY-b.top)/b.height*2-1));ray.setFromCamera(v2,cam);var hit=ray.intersectObjects(act,false);if(hit.length)hit[0].object.userData.hit(hit[0])}
  el.addEventListener("pointerup",up);el.addEventListener("pointercancel",function(){pd=null});

  var last=performance.now();
  function frame(now){if(dead)return;var dt=Math.min(.05,(now-last)/1000);last=now;var t=(now-t0)/1000;
    var k=Math.min(1,dt*(t<2.6?2.2:6));orb.th+=(orb.tth-orb.th)*k;orb.ph+=(orb.tph-orb.ph)*k;orb.r+=(orb.tr-orb.r)*Math.min(1,dt*2.2);
    var th=orb.th+(pd||opened?0:Math.sin(t*.45)*.035),sx=Math.sin(orb.ph),cy=.72+(mech&&mech.userData.high?-.1:0);
    cam.position.set(Math.sin(th)*sx*orb.r+(shake?Math.sin(now/18)*shake*.08:0),cy+Math.cos(orb.ph)*orb.r,Math.cos(th)*sx*orb.r);cam.lookAt(0,cy,0);if(shake)shake=Math.max(0,shake-dt*1.6);
    mechs.forEach(function(m,n){var s=m.scale.x,tgt=(n===si&&!sw&&!opened)?1:(sw&&sw.from===m)?0.001:(n===si&&opened)?1:0.001;if(n===si&&opened)tgt=1;s+=(tgt-s)*Math.min(1,dt*9);m.scale.setScalar(s);m.visible=s>.01;if(m.userData.tick)m.userData.tick(dt)});
    var pa=dust.geometry.attributes.position;for(var j=0;j<dn;j++){pa.array[j*3+1]+=dt*.07;pa.array[j*3]+=Math.sin(t*.3+j)*dt*.03;if(pa.array[j*3+1]>5)pa.array[j*3+1]=0}pa.needsUpdate=true;
    if(opened){var u=(now-opened)/1000;lid.rotation.x=-1.92*back(u/1.25);glow.intensity=2.6*ease(u/1.1);prize.position.y=.25+1.25*ease((u-.5)/1.3);prize.rotation.y=ease((u-.5)/1.6)*.9;orb.tr=orb.base*.9;
      if(spark){var sa=spark.geometry.attributes.position;for(j=0;j<sv.length;j++){sa.array[j*3]+=sv[j][0]*dt;sa.array[j*3+1]+=sv[j][1]*dt;sa.array[j*3+2]+=sv[j][2]*dt;sv[j][1]-=1.6*dt}sa.needsUpdate=true;spark.material.opacity=Math.max(0,1-u/2.2)}}
    R.render(sc,cam);raf=requestAnimationFrame(frame)}
  raf=requestAnimationFrame(frame);
  return{stop:function(){dead=true;cancelAnimationFrame(raf);clearTimeout(checkT);removeEventListener("resize",rs);try{R.dispose();R.forceContextLoss()}catch(e){}if(el.parentNode)el.parentNode.removeChild(el)},
    solve:function(){if(opened||dead)return;if(mech.userData.solve)mech.userData.solve();check()},
    turn:function(){orb.tth=orb.tth>1.5?0:Math.PI},
    state:function(){return{stage:si,opened:!!opened,gl:true}}}};
})();
