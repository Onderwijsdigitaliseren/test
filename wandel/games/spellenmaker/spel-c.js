/* De Erfenis van de Spellenmaker – spellen, deel C: Uurwerk (raderen draaien), Vier op een rij tegen de Automaat, Kogelbaan (rollende kogel, 3D).
   Vereist spel-a.js. De kogelbaan gebruikt THREE als dat geladen is en WebGL werkt; anders een plat bovenaanzicht. */
(function(){
"use strict";
var S=window.SM_GAMES,K=S.kit,rngOf=K.rngOf,shuffle=K.shuffle,canvas=K.canvas,rr=K.rr,mmss=K.mmss;

/* ================= 8. Uurwerk ================= */
S.uurwerk=function(host,o){
  var big=o.lvl>1,C=big?6:5,R=big?7:6,CS=big?52:60,W=360,OX=(W-C*CS)/2,OY=8,H=R*CS+16,k=canvas(host,W,H),g=k.g,r=rngOf(o.seed||13),over=false,raf=0,t0=Date.now(),taps=0,tm=0;
  var N=C*R,DX=[0,1,0,-1],DY=[-1,0,1,0],base=[],rot=[],lock=[],spin=[],i,src=Math.floor(R/2)*C+Math.floor(C/2);
  for(i=0;i<N;i++){base[i]=0;rot[i]=0;lock[i]=false;spin[i]=0}
  /* groeiende boom vanaf de veer: afwisselend doorlopen en vertakken */
  (function(){var seen=[],fr=[src],n;seen[src]=1;while(fr.length){var at=r()<.55?fr.length-1:Math.floor(r()*fr.length),a=fr[at],ax=a%C,ay=a/C|0,op=[];
      for(n=0;n<4;n++){var bx=ax+DX[n],by=ay+DY[n];if(bx<0||by<0||bx>=C||by>=R||seen[by*C+bx])continue;op.push(n)}
      var deg=0;for(n=0;n<4;n++)if(base[a]&(1<<n))deg++;
      if(!op.length||deg>=3){fr.splice(at,1);continue}
      var d=op[Math.floor(r()*op.length)],b=(ay+DY[d])*C+ax+DX[d];base[a]|=1<<d;base[b]|=1<<((d+2)%4);seen[b]=1;fr.push(b)}})();
  function turn(m,n){for(var j=0;j<n;j++)m=((m<<1)|(m>>3))&15;return m}
  function cur(n){return turn(base[n],rot[n])}
  var par=0;for(i=0;i<N;i++){var q=Math.floor(r()*4);rot[i]=q;var need=0;while(turn(base[i],(q+need)%4)!==base[i])need++;par+=need}
  if(!par){rot[src]=1;par=3}
  function power(){var on=[],st=[src],n;on[src]=1;while(st.length){var a=st.pop(),ax=a%C,ay=a/C|0,m=cur(a);for(n=0;n<4;n++){if(!(m&(1<<n)))continue;var bx=ax+DX[n],by=ay+DY[n];if(bx<0||by<0||bx>=C||by>=R)continue;var b=by*C+bx;if(on[b]||!(cur(b)&(1<<((n+2)%4))))continue;on[b]=1;st.push(b)}}return on}
  function gear(cx,cy,rad,teeth,a,col,col2){g.save();g.translate(cx,cy);g.rotate(a);g.fillStyle=col;g.beginPath();for(var n=0;n<teeth*2;n++){var rr2=n%2?rad:rad*.78,an=n*Math.PI/teeth;g.lineTo(Math.cos(an)*rr2,Math.sin(an)*rr2);g.lineTo(Math.cos(an+Math.PI/teeth*.55)*rr2,Math.sin(an+Math.PI/teeth*.55)*rr2)}g.closePath();g.fill();g.fillStyle=col2;g.beginPath();g.arc(0,0,rad*.3,0,7);g.fill();g.restore()}
  function frame(ts){var on=power(),cnt=0,n;g.clearRect(0,0,W,H);g.fillStyle="rgba(0,0,0,.3)";rr(g,OX-6,OY-6,C*CS+12,R*CS+12,8);g.fill();
    for(n=0;n<N;n++){var x=OX+(n%C)*CS,y=OY+(n/C|0)*CS,cx=x+CS/2,cy=y+CS/2,p=!!on[n],m=base[n];if(p)cnt++;
      if(spin[n]>0)spin[n]=Math.max(0,spin[n]-.14);
      g.fillStyle=lock[n]?"#2b4a35":(n%C+(n/C|0))%2?"#3a2716":"#422d1a";rr(g,x+1.5,y+1.5,CS-3,CS-3,5);g.fill();
      g.save();g.translate(cx,cy);g.rotate((rot[n]-spin[n])*Math.PI/2);
      g.lineCap="butt";for(var d=0;d<4;d++){if(!(m&(1<<d)))continue;g.strokeStyle=p?"#8a6a12":"#4b5158";g.lineWidth=CS*.26;g.beginPath();g.moveTo(0,0);g.lineTo(DX[d]*CS/2,DY[d]*CS/2);g.stroke();g.strokeStyle=p?"#f2c84a":"#8b9299";g.lineWidth=CS*.14;g.beginPath();g.moveTo(0,0);g.lineTo(DX[d]*CS/2,DY[d]*CS/2);g.stroke()}
      g.restore();
      var deg=0;for(d=0;d<4;d++)if(m&(1<<d))deg++;
      if(n===src){g.fillStyle="#d6452f";g.beginPath();g.arc(cx,cy,CS*.27,0,7);g.fill();g.strokeStyle="#f6efdf";g.lineWidth=2.4;g.beginPath();for(var a2=0;a2<9;a2+=.3){var rs=a2*CS*.024;g.lineTo(cx+Math.cos(a2+ts/900)*rs,cy+Math.sin(a2+ts/900)*rs)}g.stroke()}
      else gear(cx,cy,CS*(deg===1?.3:.2),deg===1?10:8,p?ts/(deg===1?700:-500)+n:n,p?"#f2c84a":"#8b9299",p?"#8a6a12":"#4b5158")}
    if(!over&&cnt===N){over=true;clearInterval(tm);var st=taps<=par*1.5+3?3:taps<=par*2.6+6?2:1;o.sfx("win");setTimeout(function(){o.done({stars:st,time:Date.now()-t0})},1200)}
    frame.cnt=cnt;raf=requestAnimationFrame(frame)}
  function stat(){o.status(o.T.uurStat.replace("{n}",frame.cnt||0).replace("{m}",N).replace("{t}",taps))}
  k.c.addEventListener("pointerdown",function(e){if(over)return;var q=k.at(e),x=Math.floor((q[0]-OX)/CS),y=Math.floor((q[1]-OY)/CS);if(x<0||y<0||x>=C||y>=R)return;var n=y*C+x;
    if(lock[n]){o.sfx("fout");return}rot[n]=(rot[n]+1)%4;spin[n]=1;taps++;o.sfx("klik");setTimeout(stat,60)});
  tm=setInterval(function(){if(!over)stat()},700);raf=requestAnimationFrame(frame);setTimeout(stat,80);
  return{stop:function(){over=true;clearInterval(tm);cancelAnimationFrame(raf);k.kill()},
    hint:function(){if(over)return false;var l=[];for(var n=0;n<N;n++)if(!lock[n]&&cur(n)!==base[n])l.push(n);if(!l.length)return false;var p=l[Math.floor(Math.random()*l.length)];rot[p]=0;lock[p]=true;spin[p]=1;return true},
    auto:function(){for(var n=0;n<N;n++)rot[n]=0}}};

/* ================= 9. Vier op een rij tegen de Automaat ================= */
S.vier=function(host,o){
  var C=7,R=6,CS=44,W=360,OX=(W-C*CS)/2,OY=120,H=OY+R*CS+18,k=canvas(host,W,H),g=k.g,over=false,raf=0,games=0,wins=0,lost=0,need=o.need||2,depth=o.depth||4,eps=o.eps==null?.14:o.eps,tmr=[];
  var b=[],turn=1,drop=null,winL=null,hover=-1,say="",hintC=-1,hintT=0,blink=0,think=false,x,y;
  function reset(){b=[];for(y=0;y<R;y++){b[y]=[];for(x=0;x<C;x++)b[y][x]=0}turn=1;winL=null;drop=null;games++;think=false;say=o.T.vierYou;stat()}
  function row(bb,c){for(var yy=R-1;yy>=0;yy--)if(!bb[yy][c])return yy;return -1}
  function line(bb,p){var D=[[1,0],[0,1],[1,1],[1,-1]];for(var yy=0;yy<R;yy++)for(var xx=0;xx<C;xx++){if(bb[yy][xx]!==p)continue;for(var d=0;d<4;d++){var l=[[xx,yy]],n;for(n=1;n<4;n++){var x2=xx+D[d][0]*n,y2=yy+D[d][1]*n;if(x2<0||x2>=C||y2<0||y2>=R||bb[y2][x2]!==p)break;l.push([x2,y2])}if(l.length===4)return l}}return null}
  function full(bb){for(var xx=0;xx<C;xx++)if(!bb[0][xx])return false;return true}
  function score(bb,p){var q=3-p,s=0,xx,yy,d,D=[[1,0],[0,1],[1,1],[1,-1]];for(yy=0;yy<R;yy++)if(bb[yy][3]===p)s+=3;
    for(yy=0;yy<R;yy++)for(xx=0;xx<C;xx++)for(d=0;d<4;d++){var x3=xx+D[d][0]*3,y3=yy+D[d][1]*3;if(x3<0||x3>=C||y3<0||y3>=R)continue;var a=0,e=0,n;for(n=0;n<4;n++){var v=bb[yy+D[d][1]*n][xx+D[d][0]*n];if(v===p)a++;else if(v===q)e++}
      if(a===3&&!e)s+=6;else if(a===2&&!e)s+=2;else if(e===3&&!a)s-=5;else if(e===2&&!a)s-=1}return s}
  var ORD=[3,2,4,1,5,0,6];
  function mm(bb,d,al,be,p,me){if(line(bb,me))return[-1,100000+d];if(line(bb,3-me))return[-1,-100000-d];if(full(bb))return[-1,0];if(!d)return[-1,score(bb,me)];
    var best=-1,val=p===me?-1e9:1e9;for(var n=0;n<C;n++){var c=ORD[n],yy=row(bb,c);if(yy<0)continue;bb[yy][c]=p;var v=mm(bb,d-1,al,be,3-p,me)[1];bb[yy][c]=0;
      if(p===me){if(v>val){val=v;best=c}al=Math.max(al,v)}else{if(v<val){val=v;best=c}be=Math.min(be,v)}if(al>=be)break}return[best,val]}
  function place(c,p,cb){var yy=row(b,c);if(yy<0)return false;drop={c:c,r:yy,p:p,t0:Date.now(),cb:cb};o.sfx("tik");return true}
  function landed(){var d=drop;drop=null;b[d.r][d.c]=d.p;o.sfx("klik");var l=line(b,d.p);
    if(l){winL=l;if(d.p===1){wins++;o.sfx("win");if(wins>=need){over=true;say=o.T.vierWin;var st=lost===0?3:lost<=2?2:1;tmr.push(setTimeout(function(){o.done({stars:st})},1500))}
        else{say=o.T.vierWin1;depth=Math.min(6,depth+1);eps=Math.max(0,eps-.06);tmr.push(setTimeout(function(){if(!over)reset()},2300))}}
      else{lost++;say=o.T.vierLose;o.sfx("fout");depth=Math.max(1,depth-1);eps=Math.min(.6,eps+.14);tmr.push(setTimeout(function(){if(!over)reset()},2300))}stat();return}
    if(full(b)){say=o.T.vierDraw;tmr.push(setTimeout(function(){if(!over)reset()},2000));stat();return}
    if(d.cb)d.cb()}
  function ai(){think=true;say=o.T.vierThink;stat();tmr.push(setTimeout(function(){think=false;var c=-1,n,yy;
      for(n=0;n<C&&c<0;n++){yy=row(b,n);if(yy<0)continue;b[yy][n]=2;if(line(b,2))c=n;b[yy][n]=0}
      for(n=0;n<C&&c<0;n++){yy=row(b,n);if(yy<0)continue;b[yy][n]=1;if(line(b,1))c=n;b[yy][n]=0}
      if(c<0&&Math.random()<eps){var ok=[];for(n=0;n<C;n++)if(row(b,n)>=0)ok.push(n);c=ok[Math.floor(Math.random()*ok.length)]}
      if(c<0)c=mm(b,depth,-1e9,1e9,2,2)[0];if(c<0)for(n=0;n<C;n++)if(row(b,n)>=0){c=n;break}
      place(c,2,function(){turn=1;say=o.T.vierYou;stat()})},650+Math.random()*500))}
  function stat(){o.status(say+" · "+(o.T.vierScore||"{w}–{l}").replace("{w}",wins).replace("{l}",lost).replace("{n}",need))}
  function disc(cx,cy,p,rad){var cl=p===1?["#ff8a78","#d6452f","#8f2116"]:["#ffe9a6","#e0a81e","#8a5d06"],gr=g.createRadialGradient(cx-rad*.3,cy-rad*.35,rad*.1,cx,cy,rad);gr.addColorStop(0,cl[0]);gr.addColorStop(.5,cl[1]);gr.addColorStop(1,cl[2]);g.fillStyle=gr;g.beginPath();g.arc(cx,cy,rad,0,7);g.fill();g.strokeStyle="rgba(0,0,0,.25)";g.lineWidth=1;g.beginPath();g.arc(cx,cy,rad*.62,0,7);g.stroke()}
  function frame(ts){g.clearRect(0,0,W,H);var xx,yy,now=Date.now();
    /* Meneer Zet */
    var hx=W/2,hy=54,mz=S.pic("meneer-zet.webp");
    if(mz){g.drawImage(mz,hx-56,0,112,112);if(think)for(xx=0;xx<3;xx++){g.fillStyle="rgba(242,182,50,"+(.35+.65*Math.abs(Math.sin(ts/220+xx*.9)))+")";g.beginPath();g.arc(hx+64+xx*11,46,4,0,7);g.fill()}}
    else{g.fillStyle="#8a5a34";rr(g,hx-74,96,148,16,4);g.fill();
    g.fillStyle="#c59a3a";rr(g,hx-40,14,80,78,14);g.fill();g.strokeStyle="#7a5a12";g.lineWidth=2;g.stroke();
    g.fillStyle="#7a5a12";g.fillRect(hx-3,2,6,14);g.beginPath();g.arc(hx,4,5,0,7);g.fill();
    blink=think?0:(Math.floor(ts/2600)%7===0&&ts%2600<140?1:0);
    [-18,18].forEach(function(dx){g.fillStyle="#1c1410";g.beginPath();g.arc(hx+dx,hy-8,11,0,7);g.fill();if(!blink){var ex=turn===1&&hover>=0?(hover-3)*1.2:think?Math.sin(ts/160)*4:0;g.fillStyle=think?"#f2b632":"#8fe0d0";g.beginPath();g.arc(hx+dx+ex,hy-8+(think?-2:2),5,0,7);g.fill()}});
    g.fillStyle="#1c1410";rr(g,hx-22,hy+16,44,10,3);g.fill();g.fillStyle="#f6efdf";for(xx=0;xx<5;xx++)g.fillRect(hx-19+xx*8,hy+18,5,6*(think?(.4+.6*Math.abs(Math.sin(ts/120+xx))):winL&&!over?1:.5));
    }
    /* gaatjeskaart-rand */
    g.fillStyle="#1f5d4d";rr(g,OX-8,OY-8,C*CS+16,R*CS+16,10);g.fill();
    if(turn===1&&hover>=0&&!drop&&!winL&&!over){g.globalAlpha=.55;disc(OX+hover*CS+CS/2,OY-22,1,CS*.4);g.globalAlpha=1}
    if(hintC>=0&&now<hintT){g.fillStyle="#f2b632";g.beginPath();var ax=OX+hintC*CS+CS/2,ay=OY-14+Math.sin(ts/150)*4;g.moveTo(ax-10,ay-12);g.lineTo(ax+10,ay-12);g.lineTo(ax,ay+2);g.closePath();g.fill()}
    for(yy=0;yy<R;yy++)for(xx=0;xx<C;xx++){var cx=OX+xx*CS+CS/2,cy=OY+yy*CS+CS/2;g.fillStyle="#0e2a23";g.beginPath();g.arc(cx,cy,CS*.41,0,7);g.fill();if(b[yy][xx])disc(cx,cy,b[yy][xx],CS*.4)}
    if(drop){var t=(now-drop.t0)/1000,ty=OY+drop.r*CS+CS/2,py=OY-22+900*t*t;if(py>=ty){disc(OX+drop.c*CS+CS/2,ty,drop.p,CS*.4);landed()}else disc(OX+drop.c*CS+CS/2,py,drop.p,CS*.4)}
    if(winL){g.strokeStyle="#f6efdf";g.lineWidth=3+Math.sin(ts/140)*1.5;winL.forEach(function(p){g.beginPath();g.arc(OX+p[0]*CS+CS/2,OY+p[1]*CS+CS/2,CS*.43,0,7);g.stroke()})}
    raf=requestAnimationFrame(frame)}
  function col(e){var q=k.at(e),c=Math.floor((q[0]-OX)/CS);return c>=0&&c<C&&q[1]>OY-50?c:-1}
  k.c.addEventListener("pointermove",function(e){hover=col(e)});
  k.c.addEventListener("pointerdown",function(e){if(over||turn!==1||drop||winL||think)return;var c=col(e);hover=c;if(c<0)return;
    if(place(c,1,function(){turn=2;ai()})){turn=0;hintC=-1}else o.sfx("fout")});
  reset();raf=requestAnimationFrame(frame);
  return{stop:function(){over=true;cancelAnimationFrame(raf);tmr.forEach(clearTimeout);k.kill()},
    hint:function(){if(over||turn!==1)return false;hintC=mm(b,5,-1e9,1e9,1,1)[0];hintT=Date.now()+3000;return hintC>=0},
    auto:function(){if(over)return;over=true;o.done({stars:lost===0?3:lost<=2?2:1})},
    bot:function(){if(over||turn!==1||drop||winL||think)return false;var c=mm(b,6,-1e9,1e9,1,1)[0];if(c<0)return false;place(c,1,function(){turn=2;ai()});turn=0;return true},
    state:function(){return{games:games,over:over,turn:turn}}}};

/* ================= 5. Kogelbaan ================= */
var KB={w:8,h:11,start:[.7,.7],goal:[7.15,10.2],
  walls:[[0,2.12,5.9,.16],[2.1,4.32,5.9,.16],[0,6.52,5.9,.16],[2.1,8.72,5.9,.16],
    [2.52,0,.16,1.15],[4.52,1.05,.16,1.07],[5.32,3.2,.16,1.12],[3.32,2.28,.16,1.12],[2.52,4.48,.16,1.12],[4.72,5.4,.16,1.12],[5.12,6.68,.16,1.12],[2.92,7.6,.16,1.12],[3.12,8.88,.16,1.12],[5.32,9.9,.16,1.1]],
  holes:[[3.95,1.7],[7.4,.6],[4.4,2.65],[.55,3.3],[.6,6.05],[3.9,6.15],[7.4,4.9],[7.4,8.3],[4.1,8.3],[.6,7.2],[.6,10.4],[4.6,10.6],[7.45,9.35]],
  cp:[[.7,.7,0],[7,2.9,2.3],[1,5.1,4.5],[7,7.3,6.7],[1,9.5,8.9]]};
S.kogelBaan=KB;
S.kogel=function(host,o){
  var W=360,H=500,BR=.27,HR=.34,over=false,raf=0,t0=0,falls=0,tm=0,started=false;
  var ball={x:KB.start[0],y:KB.start[1],vx:0,vy:0,fall:0},tilt=[0,0],sens=null,zero=null,pd=null,cp=0,last=0;
  var box=document.createElement("div");box.className="smKb";box.style.cssText="position:relative;margin:0 auto;touch-action:none";host.appendChild(box);
  var walls=KB.walls.concat([[-.5,-.5,KB.w+1,.5],[-.5,KB.h,KB.w+1,.5],[-.5,0,.5,KB.h],[KB.w,0,.5,KB.h]]);
  /* ---- weergave: 3D als het kan, anders plat ---- */
  var T3=window.THREE,R3=null,cv2=null,g2=null,sc,cam,grp,bm;
  function size(){var bw=host.clientWidth||W,bh=host.clientHeight||0,s=bw/W;if(bh>60&&H*s>bh)s=bh/H;s=Math.max(.5,Math.min(s,1.7));return[Math.round(W*s),Math.round(H*s)]}
  function init3(){if(!T3)return false;try{R3=new T3.WebGLRenderer({antialias:true,alpha:true})}catch(e){R3=null;return false}
    R3.setPixelRatio(Math.min(2,window.devicePixelRatio||1));R3.shadowMap.enabled=true;R3.shadowMap.type=T3.PCFSoftShadowMap;box.appendChild(R3.domElement);
    sc=new T3.Scene();cam=new T3.PerspectiveCamera(36,W/H,.1,100);cam.position.set(0,20.8,5.2);cam.lookAt(0,0,.25);
    sc.add(new T3.AmbientLight(0xfff0d8,.42));var dl=new T3.DirectionalLight(0xfff2d0,.62);dl.position.set(-5,14,4);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);dl.shadow.camera.left=-7;dl.shadow.camera.right=7;dl.shadow.camera.top=8;dl.shadow.camera.bottom=-8;dl.shadow.bias=-.0015;sc.add(dl);
    grp=new T3.Group();sc.add(grp);
    var tc=document.createElement("canvas");tc.width=256;tc.height=352;var q=tc.getContext("2d");q.fillStyle="#d9b47a";q.fillRect(0,0,256,352);for(var n=0;n<90;n++){q.strokeStyle="rgba(120,70,20,"+(.05+Math.random()*.1)+")";q.lineWidth=1+Math.random()*2;q.beginPath();var yy=Math.random()*352;q.moveTo(0,yy);q.bezierCurveTo(80,yy+Math.random()*10-5,170,yy+Math.random()*10-5,256,yy+Math.random()*6-3);q.stroke()}
    var tex=new T3.CanvasTexture(tc),wood=new T3.MeshLambertMaterial({map:tex}),dark=new T3.MeshLambertMaterial({color:0x6b4226}),rim=new T3.MeshLambertMaterial({color:0x4a2e1a});
    var fl=new T3.Mesh(new T3.BoxGeometry(KB.w,.3,KB.h),wood);fl.position.y=-.15;fl.receiveShadow=true;grp.add(fl);
    var bs=new T3.Mesh(new T3.BoxGeometry(KB.w+.9,.5,KB.h+.9),rim);bs.position.y=-.36;bs.receiveShadow=true;grp.add(bs);
    walls.forEach(function(w,i){var m=new T3.Mesh(new T3.BoxGeometry(w[2],.46,w[3]),i<KB.walls.length?dark:rim);m.position.set(w[0]+w[2]/2-KB.w/2,.23,w[1]+w[3]/2-KB.h/2);m.castShadow=true;m.receiveShadow=true;grp.add(m)});
    var hm=new T3.MeshBasicMaterial({color:0x120a05}),hr=new T3.MeshLambertMaterial({color:0x8a5a34});
    KB.holes.forEach(function(hh){var a=new T3.Mesh(new T3.CircleGeometry(HR,28),hm);a.rotation.x=-Math.PI/2;a.position.set(hh[0]-KB.w/2,.006,hh[1]-KB.h/2);grp.add(a);var b2=new T3.Mesh(new T3.RingGeometry(HR,HR+.05,28),hr);b2.rotation.x=-Math.PI/2;b2.position.set(hh[0]-KB.w/2,.008,hh[1]-KB.h/2);grp.add(b2)});
    var st=new T3.Shape(),n2;for(n2=0;n2<10;n2++){var rad=n2%2?.2:.46,an=n2*Math.PI/5-Math.PI/2;if(n2)st.lineTo(Math.cos(an)*rad,Math.sin(an)*rad);else st.moveTo(Math.cos(an)*rad,Math.sin(an)*rad)}
    var sm=new T3.Mesh(new T3.ShapeGeometry(st),new T3.MeshBasicMaterial({color:0xf2b632}));sm.rotation.x=-Math.PI/2;sm.position.set(KB.goal[0]-KB.w/2,.01,KB.goal[1]-KB.h/2);grp.add(sm);init3.star=sm;
    bm=new T3.Mesh(new T3.SphereGeometry(BR,28,20),new T3.MeshPhongMaterial({color:0x9aa4ae,specular:0xffffff,shininess:140}));bm.castShadow=true;grp.add(bm);
    return true}
  function init2(){cv2=document.createElement("canvas");box.appendChild(cv2);g2=cv2.getContext("2d")}
  function fit(){var s=size();box.style.width=s[0]+"px";box.style.height=s[1]+"px";if(R3){R3.setSize(s[0],s[1])}else if(cv2){var d=Math.min(2.5,window.devicePixelRatio||1);cv2.style.width=s[0]+"px";cv2.style.height=s[1]+"px";cv2.width=s[0]*d;cv2.height=s[1]*d;fit.k=s[0]*d/W}}
  function draw2(ts){var g=g2,kq=fit.k,U=40,ox=20,oy=30;g.setTransform(kq,0,0,kq,0,0);g.clearRect(0,0,W,H);
    g.fillStyle="#4a2e1a";rr(g,ox-12,oy-12,KB.w*U+24,KB.h*U+24,10);g.fill();g.fillStyle="#d9b47a";g.fillRect(ox,oy,KB.w*U,KB.h*U);
    KB.holes.forEach(function(hh){g.fillStyle="#120a05";g.beginPath();g.arc(ox+hh[0]*U,oy+hh[1]*U,HR*U,0,7);g.fill()});
    g.fillStyle="#f2b632";g.beginPath();for(var n=0;n<10;n++){var rad=(n%2?.2:.46)*U,an=n*Math.PI/5-Math.PI/2;g.lineTo(ox+KB.goal[0]*U+Math.cos(an)*rad,oy+KB.goal[1]*U+Math.sin(an)*rad)}g.fill();
    g.fillStyle="#6b4226";KB.walls.forEach(function(w){g.fillRect(ox+w[0]*U,oy+w[1]*U,w[2]*U,w[3]*U)});
    var s=1-ball.fall;if(s>0){g.fillStyle="rgba(0,0,0,.3)";g.beginPath();g.arc(ox+ball.x*U+tilt[0]*5+2,oy+ball.y*U+tilt[1]*5+3,BR*U*s,0,7);g.fill();var gr=g.createRadialGradient(ox+ball.x*U-3,oy+ball.y*U-4,1,ox+ball.x*U,oy+ball.y*U,BR*U);gr.addColorStop(0,"#fff");gr.addColorStop(1,"#7f8a96");g.fillStyle=gr;g.beginPath();g.arc(ox+ball.x*U,oy+ball.y*U,BR*U*s,0,7);g.fill()}}
  function draw3(ts){grp.rotation.z=-tilt[0]*.16;grp.rotation.x=tilt[1]*.16;var s=Math.max(.01,1-ball.fall);bm.scale.set(s,s,s);bm.position.set(ball.x-KB.w/2,BR*s-ball.fall*.5,ball.y-KB.h/2);bm.rotation.z-=ball.vx*.03;bm.rotation.x+=ball.vy*.03;
    if(init3.star)init3.star.rotation.z=ts/900;R3.render(sc,cam)}
  if(!init3())init2();fit();var rs=function(){fit()};addEventListener("resize",rs);
  /* ---- besturing: kantelen (bewegingssensor) of slepen ---- */
  function ori(e){if(e.gamma==null||e.beta==null)return;if(!zero)zero=[e.gamma,e.beta];sens=[Math.max(-1,Math.min(1,(e.gamma-zero[0])/20)),Math.max(-1,Math.min(1,(e.beta-zero[1])/20))]}
  box.addEventListener("pointerdown",function(e){if(!started||(e.target.closest&&e.target.closest(".smKbStart")))return;pd=[e.clientX,e.clientY];try{box.setPointerCapture(e.pointerId)}catch(err){}});
  box.addEventListener("pointermove",function(e){if(pd)tilt=[Math.max(-1,Math.min(1,(e.clientX-pd[0])/70)),Math.max(-1,Math.min(1,(e.clientY-pd[1])/70))]});
  function pu(){pd=null;if(!sens)tilt=[0,0]}box.addEventListener("pointerup",pu);box.addEventListener("pointercancel",pu);
  /* ---- natuurkunde ---- */
  function respawn(){var c=KB.cp[cp];ball.x=c[0];ball.y=c[1];ball.vx=ball.vy=0;ball.fall=0}
  function step(dt){if(ball.fall>0){ball.fall+=dt*2.6;if(ball.fall>=1){falls++;stat();respawn()}return}
    ball.vx+=tilt[0]*15*dt;ball.vy+=tilt[1]*15*dt;var f=Math.exp(-1.1*dt);ball.vx*=f;ball.vy*=f;var sp=Math.hypot(ball.vx,ball.vy);if(sp>7){ball.vx*=7/sp;ball.vy*=7/sp}
    ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
    for(var i=0;i<walls.length;i++){var w=walls[i],cx=Math.max(w[0],Math.min(ball.x,w[0]+w[2])),cy=Math.max(w[1],Math.min(ball.y,w[1]+w[3])),dx=ball.x-cx,dy=ball.y-cy,d=Math.hypot(dx,dy);
      if(d<BR){if(d<1e-6){dx=0;dy=-1;d=1}else{dx/=d;dy/=d}ball.x=cx+dx*BR;ball.y=cy+dy*BR;var vn=ball.vx*dx+ball.vy*dy;if(vn<0){ball.vx-=1.3*vn*dx;ball.vy-=1.3*vn*dy;if(vn<-2.2)o.sfx("tik")}}}
    for(i=0;i<KB.holes.length;i++)if(Math.hypot(ball.x-KB.holes[i][0],ball.y-KB.holes[i][1])<HR*.72){ball.fall=.01;o.sfx("fout");return}
    for(i=KB.cp.length-1;i>cp;i--)if(ball.y>KB.cp[i][2]){cp=i;break}
    if(Math.hypot(ball.x-KB.goal[0],ball.y-KB.goal[1])<.36&&!over){over=true;clearInterval(tm);var t=Date.now()-t0,st=falls===0?3:falls<=3?2:1;o.sfx("win");setTimeout(function(){o.done({stars:st,time:t})},900)}}
  function frame(ts){var dt=Math.min(.05,(ts-last)/1000)||0;last=ts;if(sens&&!pd)tilt=sens;if(started&&!over){var n=Math.max(1,Math.round(dt/.006));for(var i=0;i<n;i++)step(dt/n)}
    if(R3)draw3(ts);else draw2(ts);raf=requestAnimationFrame(frame)}
  function stat(){o.status(o.T.kogStat.replace("{f}",falls)+(started?" · "+mmss(Date.now()-t0):""))}
  /* startknop: op de iPhone moet de bewegingssensor vanuit een tik worden gevraagd */
  var ov=document.createElement("div");ov.className="smKbStart";ov.innerHTML='<p>'+o.T.kogHow+'</p><button type="button" class="btn">'+o.T.kogGo+'</button>';box.appendChild(ov);
  ov.querySelector("button").onclick=function(){var go=function(){addEventListener("deviceorientation",ori);started=true;t0=Date.now();ov.remove();tm=setInterval(function(){if(!over)stat()},1000);stat()};
    try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function"){DeviceOrientationEvent.requestPermission().then(go,go);return}}catch(e){}go()};
  stat();raf=requestAnimationFrame(frame);
  return{stop:function(){over=true;clearInterval(tm);cancelAnimationFrame(raf);removeEventListener("resize",rs);removeEventListener("deviceorientation",ori);if(R3){try{R3.dispose();R3.forceContextLoss()}catch(e){}}if(box.parentNode)box.parentNode.removeChild(box)},
    hint:function(){if(over)return false;zero=null;if(cp<KB.cp.length-1){cp++;respawn();return true}return false},
    auto:function(){ball.x=KB.goal[0];ball.y=KB.goal[1];ball.fall=0;started=true;if(!t0)t0=Date.now();if(ov.parentNode)ov.remove()},
    sim:function(tx,ty,sec){tilt=[tx,ty];for(var i=0;i<sec/.006;i++)step(.006);return[ball.x,ball.y,cp,falls,over]},
    state:function(){return{x:ball.x,y:ball.y,cp:cp,falls:falls,over:over,gl:!!R3}}}};
})();
