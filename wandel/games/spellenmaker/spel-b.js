/* De Erfenis van de Spellenmaker – spellen, deel B: Zoek de verschillen, Stenenrij (stenen in rijen en groepen), Mahjong.
   Vereist spel-a.js (SM_GAMES.kit en SM_GAMES.art). */
(function(){
"use strict";
var S=window.SM_GAMES,K=S.kit,rngOf=K.rngOf,shuffle=K.shuffle,canvas=K.canvas,rr=K.rr,mmss=K.mmss,banner=K.banner;

/* ================= 4. Zoek de verschillen ================= */
/* zeven verschillen; elk verschil heeft een of meer rechthoeken [x,y,b,h] in pixels van trap-voor/trap-na (1360×840), het vlak is 340×210 */
var DIFF=[[[426,56,55,50],[372,208,53,50],[313,372,57,51]],[[969,161,65,176]],[[646,264,42,45]],[[947,734,90,59]],[[116,260,168,107]],[[509,32,318,62]],[[1134,64,179,175]]]
  .map(function(d){return d.map(function(r){return[(r[0]+r[2]/2)/4,(r[1]+r[3]/2)/4,r[2]/8,r[3]/8]})});
S.verschil=function(host,o){
  var W=360,PW=340,PH=210,X0=10,Y1=24,Y2=Y1+PH+28,H=Y2+PH+8,k=canvas(host,W,H),g=k.g,over=false,raf=0,miss=0,found=[],marks=[],flash=-1,flashT=0,t0=Date.now();
  var IS=Math.min(3,2*(window.devicePixelRatio||1)),A=document.createElement("canvas"),B=document.createElement("canvas");
  function paint(){[A,B].forEach(function(cv,i){cv.width=PW*IS;cv.height=PH*IS;var q=cv.getContext("2d");q.scale(IS,IS);S.art.drawTrap(q,PW,PH,i)})}
  paint();["trap-voor.webp","trap-na.webp"].forEach(function(n){S.pic(n,paint)});
  DIFF.forEach(function(){found.push(0)});
  function stat(){o.status(o.T.verStat.replace("{n}",found.filter(Boolean).length).replace("{m}",DIFF.length).replace("{x}",miss))}
  function ring(x,y,rx,ry,p,col){g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.ellipse(x,y,rx+4,ry+4,0,-1.57,-1.57+6.283*p);g.stroke()}
  function frame(){var now=Date.now(),i;g.clearRect(0,0,W,H);
    g.fillStyle="#f6efdf";g.font="600 13px 'Barlow Condensed',sans-serif";g.textAlign="left";g.fillText(o.T.verA,X0+2,Y1-7);g.fillText(o.T.verB,X0+2,Y2-7);
    [[A,Y1],[B,Y2]].forEach(function(q){g.fillStyle="#f6efdf";g.fillRect(X0-3,q[1]-3,PW+6,PH+6);g.drawImage(q[0],X0,q[1],PW,PH)});
    DIFF.forEach(function(d,di){var f=found[di];if(!f&&flash!==di)return;var p=f?Math.min(1,(now-f)/350):1,col=f?"#f2b632":"rgba(246,239,223,"+(.5+.5*Math.sin(now/90))+")";
      d.forEach(function(rg){ring(X0+rg[0],Y1+rg[1],rg[2],rg[3],p,col);ring(X0+rg[0],Y2+rg[1],rg[2],rg[3],p,col)})});
    for(i=marks.length-1;i>=0;i--){var m=marks[i],a=1-(now-m.t)/700;if(a<=0){marks.splice(i,1);continue}g.strokeStyle="rgba(226,80,61,"+a+")";g.lineWidth=3;g.beginPath();g.moveTo(m.x-8,m.y-8);g.lineTo(m.x+8,m.y+8);g.moveTo(m.x+8,m.y-8);g.lineTo(m.x-8,m.y+8);g.stroke()}
    if(flash>=0&&now>flashT){found[flash]=now;flash=-1;check()}
    raf=requestAnimationFrame(frame)}
  function check(){stat();if(found.every(Boolean)&&!over){over=true;var st=miss<=1?3:miss<=4?2:1;o.sfx("win");setTimeout(function(){o.done({stars:st,time:Date.now()-t0})},1100)}}
  k.c.addEventListener("pointerdown",function(e){if(over)return;var q=k.at(e),py=q[1]>=Y2-4?Y2:Y1,x=q[0]-X0,y=q[1]-py;if(x<-4||x>PW+4||y<-4||y>PH+4)return;
    for(var i=0;i<DIFF.length;i++){if(found[i])continue;for(var j=0;j<DIFF[i].length;j++){var rg=DIFF[i][j];if(Math.abs(x-rg[0])<=rg[2]+7&&Math.abs(y-rg[1])<=rg[3]+7){found[i]=Date.now();if(flash===i)flash=-1;o.sfx("goed");check();return}}}
    miss++;marks.push({x:q[0],y:q[1],t:Date.now()});o.sfx("fout");stat()});
  stat();raf=requestAnimationFrame(frame);
  return{stop:function(){over=true;cancelAnimationFrame(raf);k.kill()},
    hint:function(){if(over||flash>=0)return false;var l=[];found.forEach(function(f,i){if(!f)l.push(i)});if(!l.length)return false;flash=l[Math.floor(Math.random()*l.length)];flashT=Date.now()+1600;return true},
    auto:function(){found=found.map(function(f){return f||Date.now()});check()}}};

/* ================= 6. Stenenrij ================= */
/* een steen = kleur*13 + (getal-1); vier kleuren, getallen 1 t/m 13, elke steen komt één keer voor */
function tileSolve(ids,limit){var res=[],has={};ids.forEach(function(t){has[t]=1});
  var order=ids.slice().sort(function(a,b){return(a%13-b%13)||(a-b)});
  (function rec(cur){if(res.length>=limit)return;var t=-1,i;for(i=0;i<order.length;i++)if(has[order[i]]){t=order[i];break}
    if(t<0){res.push(cur.map(function(s){return s.slice()}));return}
    var c=t/13|0,n=t%13,run=[t],m;
    for(m=n+1;m<13&&has[c*13+m];m++){run.push(c*13+m);if(run.length>=3){run.forEach(function(x){has[x]=0});cur.push(run.slice());rec(cur);cur.pop();run.forEach(function(x){has[x]=1})}}
    var oth=[];for(var cc=0;cc<4;cc++)if(cc!==c&&has[cc*13+n])oth.push(cc*13+n);
    var subs=[];if(oth.length>=2){for(i=0;i<oth.length;i++)for(var j=i+1;j<oth.length;j++)subs.push([oth[i],oth[j]]);if(oth.length===3)subs.push(oth.slice())}
    subs.forEach(function(sb){var grp=[t].concat(sb);grp.forEach(function(x){has[x]=0});cur.push(grp);rec(cur);cur.pop();grp.forEach(function(x){has[x]=1})})})([]);
  return res}
function tileValid(row){if(row.length<3)return false;var s=row.slice().sort(function(a,b){return a-b}),i,run=true,grp=row.length<=4;
  for(i=1;i<s.length;i++){if((s[i]/13|0)!==(s[0]/13|0)||s[i]!==s[i-1]+1)run=false}
  var cols={};for(i=0;i<row.length;i++){if(row[i]%13!==row[0]%13||cols[row[i]/13|0])grp=false;cols[row[i]/13|0]=1}
  return run||grp}
/* maak een puzzel: een paar rijen en groepen die elkaar in de weg zitten, met precies één oplossing */
function tileGen(seed,nSets,minT,maxT){var r=rngOf(seed),best=null,bs=-1;
  for(var t=0;t<500;t++){var used={},ids=[],ok=true,nr=0;
    for(var s=0;s<nSets&&ok;s++){var set=[],tries=0;do{set=[];tries++;
        if(r()<.55){var c=Math.floor(r()*4),len=3+Math.floor(r()*3),st=Math.floor(r()*(14-len));for(var i=0;i<len;i++)set.push(c*13+st+i)}
        else{var n=Math.floor(r()*13),cs=shuffle([0,1,2,3],r).slice(0,r()<.6?3:4);cs.forEach(function(cc){set.push(cc*13+n)})}
      }while(set.some(function(x){return used[x]})&&tries<40);
      if(set.some(function(x){return used[x]})){ok=false;break}set.forEach(function(x){used[x]=1;ids.push(x)})}
    if(!ok||ids.length<minT||ids.length>maxT)continue;
    var sol=tileSolve(ids,2);if(sol.length!==1)continue;
    /* valkuilen: stenen die ook in een andere geldige rij zouden passen */
    var trap=0;ids.forEach(function(a){var c=a/13|0,n=a%13,k=0;if(used[c*13+n-1]&&n>0)k++;if(used[c*13+n+1]&&n<12)k++;var g2=0;for(var cc=0;cc<4;cc++)if(cc!==c&&used[cc*13+n])g2++;if(k>=1&&g2>=2)trap++});
    if(trap>bs){bs=trap;best={ids:ids.slice(),sol:sol[0]}}
    if(bs>=5)break}
  return best}
/* ronde "volle tafel": een deel van de stenen ligt al op tafel, in een andere geldige indeling dan de oplossing. Je moet dus herschikken. */
function tileTable(pz,seed){var r=rngOf(seed),key=function(a){return a.slice().sort(function(x,y){return x-y}).join(",")},solK={};pz.sol.forEach(function(a){solK[key(a)]=1});
  for(var t=0;t<600;t++){var n=Math.round(pz.ids.length*(.5+r()*.2)),sub=shuffle(pz.ids,r).slice(0,n),ar=tileSolve(sub,1)[0];if(!ar||ar.length>4)continue;
    var diff=ar.filter(function(a){return !solK[key(a)]}).length;if(diff>=Math.min(2,ar.length))return{table:ar,rack:pz.ids.filter(function(x){return sub.indexOf(x)<0})}}
  return null}
/* ronde "één steen te veel": een extra steen die nergens past, en die ook geen andere steen kan vervangen */
function tileDecoy(pz,seed){var r=rngOf(seed),has={};pz.ids.forEach(function(x){has[x]=1});
  var cand=shuffle(Array.apply(null,{length:52}).map(function(_,i){return i}),r).filter(function(x){return !has[x]});
  for(var c=0;c<cand.length;c++){var d=cand[c],near=0,cc=d/13|0,nn=d%13;if(has[d-1]&&nn>0)near++;if(has[d+1]&&nn<12)near++;for(var q=0;q<4;q++)if(q!==cc&&has[q*13+nn])near++;
    if(near<2)continue;if(tileSolve(pz.ids.concat([d]),1).length)continue;
    var ok=pz.ids.every(function(a){return !tileSolve(pz.ids.filter(function(x){return x!==a}).concat([d]),1).length});if(ok)return d}
  return -1}
S.stenenGen=tileGen;S.stenenSolve=tileSolve;S.stenenValid=tileValid;S.stenenTable=tileTable;S.stenenDecoy=tileDecoy;
S.stenen=function(host,o){
  var W=360,TW=30,TH=40,NR=6,RH=47,RY=8,RACK=RY+NR*RH+14,H=RACK+2*(TH+6)+16,k=canvas(host,W,H),g=k.g,over=false,raf=0,t0=Date.now(),hints=0,tm=0;
  /* drie rondes: 1 opwarmen, 2 de tafel ligt al vol (herschikken), 3 één steen hoort er niet bij */
  var RC=o.rounds||[{sets:4,minT:12,maxT:14},{sets:5,minT:15,maxT:18,table:true},{sets:6,minT:17,maxT:19,decoy:true}],ri=-1,intro=null,TR=o.T.steRounds||[];
  var COL=["#d6452f","#2f6f9f","#1d1d24","#d9901a"],r=rngOf((o.seed||5)+99),pz=null,decoy=-1;
  var rack=[],rows=[],locked=[],sel=-1,drag=null,i;
  function fill(t,v){return String(t||"").replace(/\{(\w+)\}/g,function(m,q){return v[q]!=null?v[q]:m})}
  function setup(){var C=RC[ri],sd=(o.seed||5)*7+ri*131,tb=null;decoy=-1;
    for(var tr=0;tr<12;tr++){pz=tileGen(sd+tr,C.sets,C.minT,C.maxT);if(!pz)continue;if(C.table){tb=tileTable(pz,sd+tr);if(!tb)continue}if(C.decoy){decoy=tileDecoy(pz,sd+tr);if(decoy<0)continue}break}
    if(!pz)pz={ids:[4,5,6,17,30,43,20,21,22],sol:[[4,5,6],[17,30,43],[20,21,22]]};
    rows=[];locked=[];for(var n=0;n<NR;n++){rows.push([]);locked.push(false)}
    if(tb){tb.table.forEach(function(a,n){rows[n]=a.slice();sortRow(rows[n])});rack=shuffle(tb.rack,r)}else rack=shuffle(pz.ids,r);
    if(decoy>=0)rack.splice(Math.floor(r()*(rack.length+1)),0,decoy);sel=-1;drag=null;
    var d=TR[ri]||{};intro={eye:fill(o.T.steRound,{r:ri+1,n:RC.length}),title:d.t||"",text:d.d||"",tap:o.T.tapGo}}
  function sortRow(a){a.sort(function(x,y){return(x%13-y%13)||(x-y)})}
  function rackPos(n){var per=Math.floor((W-16)/(TW+4)),x=8+(n%per)*(TW+4)+((W-16)-per*(TW+4)+4)/2,y=RACK+8+Math.floor(n/per)*(TH+6);return[x,y]}
  function rowPos(ri,n,len){var x0=44;return[x0+n*(TW+2),RY+ri*RH+3]}
  function tile(x,y,t,hi,lift){g.save();if(lift){g.shadowColor="rgba(0,0,0,.5)";g.shadowBlur=12;g.shadowOffsetY=5}
    g.fillStyle="#f8f1df";rr(g,x,y,TW,TH,4);g.fill();g.restore();g.strokeStyle=hi?"#f2b632":"#b9a886";g.lineWidth=hi?2.5:1;rr(g,x,y,TW,TH,4);g.stroke();
    g.fillStyle=COL[t/13|0];g.font="700 21px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText((t%13)+1,x+TW/2,y+24);
    g.beginPath();g.arc(x+TW/2,y+32,3.2,0,7);g.fill()}
  function draw(){g.clearRect(0,0,W,H);var ri,n;
    for(ri=0;ri<NR;ri++){var row=rows[ri],y=RY+ri*RH,v=tileValid(row),bad=row.length>=3&&!v;
      g.fillStyle=locked[ri]?"rgba(242,182,50,.16)":v?"rgba(70,165,102,.2)":"rgba(0,0,0,.25)";rr(g,6,y,W-12,RH-4,6);g.fill();
      g.strokeStyle=locked[ri]?"#f2b632":v?"#6fd08a":bad?"#e2503d":"rgba(246,239,223,.22)";g.lineWidth=v||bad?2:1;rr(g,6,y,W-12,RH-4,6);g.stroke();
      g.fillStyle=v?"#8fe0a4":bad?"#ff9c8a":"rgba(246,239,223,.5)";g.font="700 16px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText(v?"✓":bad?"✗":String(ri+1),24,y+27);
      for(n=0;n<row.length;n++){if(drag&&drag.t===row[n])continue;var p=rowPos(ri,n);tile(p[0],p[1],row[n],false)}}
    g.fillStyle="rgba(0,0,0,.35)";rr(g,4,RACK,W-8,H-RACK-4,8);g.fill();g.strokeStyle="#8a5a34";g.lineWidth=2;rr(g,4,RACK,W-8,H-RACK-4,8);g.stroke();
    for(n=0;n<rack.length;n++){if(drag&&drag.t===rack[n])continue;var q=rackPos(n);tile(q[0],q[1],rack[n],sel===rack[n])}
    if(!rack.length&&!drag){g.fillStyle="rgba(246,239,223,.5)";g.font="600 13px 'Barlow Condensed',sans-serif";g.textAlign="center";g.fillText(o.T.steEmpty,W/2,RACK+38)}
    if(drag)tile(drag.x-TW/2,drag.y-TH/2-14,drag.t,true,true);
    if(intro)banner(g,W,H,intro)}
  function need(){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}
  function stat(){var v=rows.filter(function(a){return tileValid(a)}).length;o.status(fill(o.T.steStat,{r:ri+1,m:RC.length,n:rack.length,v:v})+" · "+mmss(Date.now()-t0))}
  function take(t){var n=rack.indexOf(t);if(n>=0){rack.splice(n,1);return true}for(var ri=0;ri<NR;ri++){n=rows[ri].indexOf(t);if(n>=0){if(locked[ri])return false;rows[ri].splice(n,1);return true}}return false}
  function where(t){if(rack.indexOf(t)>=0)return -1;for(var ri=0;ri<NR;ri++)if(rows[ri].indexOf(t)>=0)return ri;return -2}
  function put(t,ri){if(ri<0){rack.push(t)}else{rows[ri].push(t);sortRow(rows[ri])}}
  function solved(){return rack.length===(decoy>=0?1:0)&&(decoy<0||rack[0]===decoy)&&rows.every(function(a){return !a.length||tileValid(a)})}
  function check(){stat();need();if(over||intro)return;if(!solved())return;o.sfx("win");
    if(ri>=RC.length-1){over=true;clearInterval(tm);var t=Date.now()-t0,st=!hints&&t<=600000?3:hints<=2&&t<=1000000?2:1;setTimeout(function(){o.done({stars:st,time:t})},800);return}
    var nd=TR[ri+1]||{};setTimeout(function(){intro={eye:fill(o.T.steRound,{r:ri+1,n:RC.length}),title:o.T.steDone,text:(decoy>=0?fill(o.T.steDecoyOk,{t:((o.T.steCols||[])[decoy/13|0]||"")+" "+((decoy%13)+1)})+" ":"")+fill(o.T.torNext,{t:nd.t})+" "+(nd.d||""),tap:o.T.tapNext,nx:true};need()},700)}
  function next(quiet){ri++;setup();if(quiet)intro=null;stat();need()}
  function hit(q){var n,ri;for(n=rack.length-1;n>=0;n--){var p=rackPos(n);if(q[0]>=p[0]-2&&q[0]<=p[0]+TW+2&&q[1]>=p[1]-2&&q[1]<=p[1]+TH+2)return rack[n]}
    for(ri=0;ri<NR;ri++)for(n=rows[ri].length-1;n>=0;n--){var p2=rowPos(ri,n);if(q[0]>=p2[0]&&q[0]<=p2[0]+TW+2&&q[1]>=p2[1]&&q[1]<=p2[1]+TH)return rows[ri][n]}return -1}
  function rowAt(q){if(q[1]>=RACK-4)return -1;return Math.max(0,Math.min(NR-1,Math.floor((q[1]-RY)/RH)))}
  var c=k.c;
  c.addEventListener("pointerdown",function(e){if(over)return;if(intro){var nx=intro.nx;intro=null;o.sfx("klik");if(nx)next(true);else need();return}var q=k.at(e),t=hit(q);
    if(t<0){var ri=rowAt(q);if(sel>=0&&ri>=0&&!locked[ri]&&rows[ri].length<9){take(sel);put(sel,ri);sel=-1;o.sfx("klik");check()}return}
    var w=where(t);if(w>=0&&locked[w])return;drag={t:t,x:q[0],y:q[1],sx:q[0],sy:q[1],moved:false,from:w};try{c.setPointerCapture(e.pointerId)}catch(err){}need()});
  c.addEventListener("pointermove",function(e){if(!drag)return;var q=k.at(e);drag.x=q[0];drag.y=q[1];if(Math.hypot(q[0]-drag.sx,q[1]-drag.sy)>7)drag.moved=true;need()});
  function up(e){if(!drag)return;var d=drag;drag=null;
    if(!d.moved){ /* tik: uit het rek = kiezen, van tafel = terug naar het rek */
      if(d.from===-1){sel=sel===d.t?-1:d.t;o.sfx("tik")}else{take(d.t);put(d.t,-1);sel=-1;o.sfx("tik")}check();return}
    var ri=rowAt([d.x,d.y-14]);if(ri>=0&&(locked[ri]||rows[ri].length>=9&&d.from!==ri))ri=d.from;
    take(d.t);put(d.t,ri);sel=-1;o.sfx("klik");check()}
  c.addEventListener("pointerup",up);c.addEventListener("pointercancel",up);
  k.onfit=draw;tm=setInterval(function(){if(!over)stat()},1000);next(false);
  function placeSet(set){var ri=-1,i2;for(i2=0;i2<NR;i2++)if(!rows[i2].length){ri=i2;break}
    if(ri<0){for(i2=NR-1;i2>=0;i2--)if(!locked[i2]){rows[i2].slice().forEach(function(t){take(t);put(t,-1)});ri=i2;break}}
    if(ri<0)return;set.forEach(function(t){take(t);put(t,ri)});locked[ri]=true}
  function isDone(set){for(var ri=0;ri<NR;ri++){if(rows[ri].length===set.length&&set.every(function(t){return rows[ri].indexOf(t)>=0}))return ri}return -1}
  return{stop:function(){over=true;clearInterval(tm);cancelAnimationFrame(raf);k.kill()},
    hint:function(){if(over||intro)return false;for(var s=0;s<pz.sol.length;s++){var at=isDone(pz.sol[s]);if(at>=0){locked[at]=true;continue}hints++;placeSet(pz.sol[s]);o.sfx("goed");check();return true}return false},
    auto:function(){if(over)return;ri=RC.length-1;intro=null;rows=rows.map(function(){return[]});locked=locked.map(function(){return false});rack=pz.ids.slice();if(decoy>=0)rack.push(decoy);pz.sol.forEach(function(s){placeSet(s)});check()},
    /* test: deze ronde oplossen zoals een speler (alle sets met hints) */
    solveRound:function(){intro=null;for(var g2=0;g2<12;g2++)if(!this.hint())break;check()},
    tapIntro:function(){if(intro){var nx=intro.nx;intro=null;if(nx)next(true);else need()}},
    state:function(){var p=rack.length?rackPos(0):null;return{round:ri,intro:!!intro,decoy:decoy,table:rows.reduce(function(a,b){return a+b.length},0),rack:rack.length,rows:rows.map(function(a){return a.length}),first:p?[p[0]+TW/2,p[1]+TH/2]:null,row0:[W/2,RY+RH/2],row1:[W/2,RY+RH*1.5],W:W,H:H}}}};

/* ================= 7. Mahjong ================= */
S.mahjong=function(host,o){
  var W=360,TW=40,TH=52,X0=18,Y0=26,H=Y0+4*TH+26,k=canvas(host,W,H),g=k.g,r=rngOf(o.seed||9),over=false,raf=0,t0=Date.now(),shuf=0,tm=0;
  var T=[],x,y,sel=null,hintP=null,hintT=0,fx=[],shake=null,busy=false;
  for(y=0;y<8;y+=2)for(x=0;x<16;x+=2)T.push({x:x,y:y,z:0});
  for(y=1;y<6;y+=2)for(x=2;x<14;x+=2)T.push({x:x,y:y,z:1});
  for(y=2;y<5;y+=2)for(x=5;x<10;x+=2)T.push({x:x,y:y,z:2});
  T.forEach(function(t){t.on=true;t.k=0});
  function isFree(t){var L=false,R=false,i,u;for(i=0;i<T.length;i++){u=T[i];if(!u.on||u===t)continue;
      if(u.z===t.z+1&&Math.abs(u.x-t.x)<2&&Math.abs(u.y-t.y)<2)return false;
      if(u.z===t.z&&Math.abs(u.y-t.y)<2){if(u.x===t.x-2)L=true;if(u.x===t.x+2)R=true}}return !(L&&R)}
  /* verdeel de soorten in een volgorde die zeker op te lossen is: steeds twee vrije stenen dezelfde soort geven en wegdenken */
  function assign(kinds){var live=T.filter(function(t){return t.on});
    for(var a=0;a<300;a++){var ks=shuffle(kinds,r),ok=true,i;live.forEach(function(t){t.on=true});
      for(i=0;i<ks.length;i++){var fr=live.filter(function(t){return t.on&&isFree(t)});if(fr.length<2){ok=false;break}
        var p=Math.floor(r()*fr.length),q=Math.floor(r()*(fr.length-1));if(q>=p)q++;fr[p].k=fr[q].k=ks[i];fr[p].on=fr[q].on=false}
      live.forEach(function(t){t.on=true});if(ok)return true}return false}
  var KN=[];for(var i=0;i<14;i++){KN.push(i,i)}assign(KN);
  function pos(t){return[X0+t.x*TW/2-t.z*4,Y0+t.y*TH/2-t.z*5]}
  var LET=o.T.mahLet||["A","H","V","B"],SU=["♠","♥","♦","♣"],PIP=[[[0,0]],[[-1,-1],[1,1]],[[-1,-1],[0,0],[1,1]],[[-1,-1],[1,-1],[-1,1],[1,1]],[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]];
  function face(t,px,py,hi,dim){
    g.fillStyle="#8a6a3c";rr(g,px+3,py+4,TW-1,TH-1,6);g.fill();
    g.fillStyle="#d9c9a4";rr(g,px+1.5,py+2,TW-1,TH-1,6);g.fill();
    g.fillStyle=hi?"#fff3c4":"#fbf5e6";rr(g,px,py,TW-1,TH-1,6);g.fill();g.strokeStyle=hi?"#f2b632":"#b9a886";g.lineWidth=hi?2.5:1;g.stroke();
    var cx=px+TW/2-.5,cy=py+TH/2-.5,kk=t.k;
    if(kk<6){g.fillStyle=kk%2?"#2f6f9f":"#d6452f";PIP[kk].forEach(function(p){g.beginPath();g.arc(cx+p[0]*9,cy+p[1]*13,4.2,0,7);g.fill()})}
    else if(kk<10){g.fillStyle=kk===7||kk===8?"#c8302a":"#1b1b22";g.font="30px serif";g.textAlign="center";g.fillText(SU[kk-6],cx,cy+11)}
    else{g.fillStyle="#1f5d4d";g.font="700 28px Georgia,serif";g.textAlign="center";g.fillText(LET[kk-10],cx,cy+10);g.fillRect(cx-9,cy+15,18,2)}
    if(dim){g.fillStyle="rgba(40,26,10,.34)";rr(g,px,py,TW-1,TH-1,6);g.fill()}}
  function order(){return T.filter(function(t){return t.on}).sort(function(a,b){return(a.z-b.z)||(a.y-b.y)||(a.x-b.x)})}
  function draw(){var now=Date.now();g.clearRect(0,0,W,H);
    order().forEach(function(t){var p=pos(t),sx=shake&&shake.t===t?Math.sin(now/25)*3:0,hi=t===sel||(hintP&&now<hintT&&(hintP[0]===t||hintP[1]===t)&&Math.floor(now/200)%2===0);face(t,p[0]+sx,p[1],hi,!isFree(t))});
    for(var n=fx.length-1;n>=0;n--){var f=fx[n],a=1-(now-f.t0)/320;if(a<=0){fx.splice(n,1);continue}g.globalAlpha=a;var p2=pos(f.t);face(f.t,p2[0],p2[1]-(1-a)*14,true,false);g.globalAlpha=1}
    if(shake&&now>shake.end)shake=null;
    if(fx.length||shake||(hintP&&now<hintT))raf=requestAnimationFrame(draw)}
  function need(){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}
  function left(){return T.filter(function(t){return t.on}).length}
  function pairs(){var fr=T.filter(function(t){return t.on&&isFree(t)}),out=[];for(var a=0;a<fr.length;a++)for(var b=a+1;b<fr.length;b++)if(fr[a].k===fr[b].k)out.push([fr[a],fr[b]]);return out}
  function stat(){o.status(o.T.mahStat.replace("{n}",left()).replace("{p}",pairs().length)+" · "+mmss(Date.now()-t0))}
  function reshuffle(){var ks=[],cnt={};T.forEach(function(t){if(t.on)cnt[t.k]=(cnt[t.k]||0)+1});Object.keys(cnt).forEach(function(q){for(var n=0;n<cnt[q]/2;n++)ks.push(+q)});shuf++;assign(ks);sel=null;o.status(o.T.mahShuffle);need()}
  function check(){if(over)return;stat();if(!left()){over=true;clearInterval(tm);var t=Date.now()-t0,st=!shuf&&t<=270000?3:shuf<=1?2:1;o.sfx("win");setTimeout(function(){o.done({stars:st,time:t})},700);return}
    if(!pairs().length){busy=true;o.status(o.T.mahStuck);setTimeout(function(){busy=false;if(!over){reshuffle()}},1500)}}
  k.c.addEventListener("pointerdown",function(e){if(over||busy)return;var q=k.at(e),l=order(),t=null;for(var n=l.length-1;n>=0;n--){var p=pos(l[n]);if(q[0]>=p[0]&&q[0]<=p[0]+TW&&q[1]>=p[1]&&q[1]<=p[1]+TH){t=l[n];break}}
    if(!t)return;if(!isFree(t)){shake={t:t,end:Date.now()+260};o.sfx("fout");need();return}
    if(sel&&sel!==t&&sel.k===t.k){sel.on=t.on=false;fx.push({t:sel,t0:Date.now()},{t:t,t0:Date.now()});sel=null;hintP=null;o.sfx("goed");check()}
    else{sel=sel===t?null:t;o.sfx("tik")}need()});
  k.onfit=draw;tm=setInterval(function(){if(!over&&!busy)stat()},1000);stat();draw();
  return{stop:function(){over=true;clearInterval(tm);cancelAnimationFrame(raf);k.kill()},
    hint:function(){if(over)return false;var p=pairs();if(!p.length)return false;hintP=p[0];hintT=Date.now()+2600;need();return true},
    auto:function(){T.forEach(function(t){t.on=false});check();need()},
    bot:function(){var p=pairs();if(p.length){p[0][0].on=p[0][1].on=false;check();need();return true}return false},
    state:function(){var p=pairs()[0],a=p&&pos(p[0]),b=p&&pos(p[1]);return{left:left(),pairs:pairs().length,shuf:shuf,over:over,pair:p?[a[0]+TW/2,a[1]+TH/2,b[0]+TW/2,b[1]+TH/2]:null,W:W,H:H}}}};
})();
