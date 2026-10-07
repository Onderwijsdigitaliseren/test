/* De Verdwijning – minipuzzels per soort spoor. Taalonafhankelijk; teksten komen uit VZ_DATA.PZ.
   Elke puzzel krijgt o = {box, canvas(), at(e,c), done(), label, P (teksten), beep, buzz, toast, shuffle, ghost, mg} */
(function(){
"use strict";
var PLAY={
  /* zaklamp: vind de gestalte in het donker (terugval als de camera niet mag) */
  lamp:function(o){var c=o.canvas(),g=c.getContext("2d"),fx,fy,vx,vy,lx=130,ly=210,hold=0,hits=0,last=0;
    var place=function(){fx=40+Math.random()*180;fy=55+Math.random()*150;var a=Math.random()*6.28,sp=11;vx=Math.cos(a)*sp;vy=Math.sin(a)*sp};place();
    var crates=[0,1,2,3,4,5,6].map(function(){return[Math.random()*230,Math.random()*230,20+Math.random()*40,20+Math.random()*50]});
    var mv=function(e){var q=o.at(e,c);lx=q[0];ly=q[1]};c.addEventListener("pointerdown",mv);c.addEventListener("pointermove",mv);
    var f=function(ts){var dt=Math.min(.1,(ts-last)/1000)||0;last=ts;fx+=vx*dt;fy+=vy*dt;if(fx<30||fx>230)vx=-vx;if(fy<50||fy>220)vy=-vy;
      g.fillStyle="#2a3550";g.fillRect(0,0,260,260);g.fillStyle="#1c2740";crates.forEach(function(r){g.fillRect(r[0],r[1],r[2],r[3])});
      o.ghost(g,fx,fy,64,"#c9a6ea",1);
      var gr=g.createRadialGradient(lx,ly,8,lx,ly,62);gr.addColorStop(0,"rgba(5,8,14,0)");gr.addColorStop(1,"rgba(5,8,14,1)");g.fillStyle=gr;g.fillRect(0,0,260,260);
      var near=Math.hypot(lx-fx,ly-fy)<28;hold=near?hold+dt:0;
      if(near){g.strokeStyle="#f0a63a";g.lineWidth=3;g.beginPath();g.arc(fx,fy,44,-1.57,-1.57+6.283*Math.min(1,hold/.6));g.stroke()}
      if(hold>=.6){hits++;hold=0;o.beep(500+hits*120,.12);o.buzz(40);if(hits>=3)return o.done();place()}
      g.fillStyle="#ece4d2";g.font="16px 'Special Elite',monospace";g.textAlign="center";g.fillText(hits+" / 3",130,252);
      o.mg.raf=requestAnimationFrame(f)};o.mg.raf=requestAnimationFrame(f)},
  /* deurbelcamera: lampjes-volgorde natikken */
  seq:function(o){o.box.innerHTML='<div class="lans">'+[0,1,2,3].map(function(i){return'<button type="button" class="lan" data-i="'+i+'" aria-label="'+(i+1)+'"></button>'}).join("")+'</div><p class="note" id="sqS"></p><button type="button" class="btn ghost dk" id="sqR">'+(o.P.again||(/^nl/i.test(document.documentElement.lang||"")?"Toon het patroon opnieuw":"Show the pattern again"))+'</button>';
    var Ls=[].slice.call(o.box.querySelectorAll(".lan")),S=[0,1,2,3,4].map(function(){return Math.floor(Math.random()*4)}),st=o.box.querySelector("#sqS"),pos=0,busy=true,len=3,pt=[],later=function(fn,ms){var id=setTimeout(fn,ms);pt.push(id);o.mg.tm.push(id)};
    var lit=function(i,ms){Ls[i].classList.add("on");o.beep(330+i*110,.18);later(function(){Ls[i].classList.remove("on")},ms)};
    var play=function(){pt.forEach(clearTimeout);pt=[];Ls.forEach(function(l){l.classList.remove("on")});busy=true;pos=0;st.textContent=o.P.look;for(var k=0;k<len;k++)(function(k){later(function(){lit(S[k],350)},600+k*600)})(k);later(function(){busy=false;st.textContent=o.P.yours.replace("{n}",len)},600+len*600)};
    o.box.querySelector("#sqR").addEventListener("click",function(){play()});
    o.box.firstChild.addEventListener("click",function(e){var b=e.target.closest(".lan");if(!b||busy)return;var i=+b.dataset.i;lit(i,200);
      if(i!==S[pos]){busy=true;st.textContent=o.P.wrongSeq;o.buzz(150);later(play,900);return}
      pos++;if(pos>=len){if(len>=5)return o.done();len++;busy=true;st.textContent=o.P.good;later(play,700)}});
    play()},
  /* vergrendelde telefoon: vier vette vegen op het toetsenbord, vind de volgorde (groen = goed, geel = wel in de code) */
  pin:function(o){var digits=o.shuffle([1,2,3,4,5,6,7,8,9,0],Math.random).slice(0,4),sec=o.shuffle(digits,Math.random),cur=[],tries=0;
    o.box.innerHTML='<div class="phone"><div class="pdisp" id="pnD">_ _ _ _</div><div class="pkeys">'+[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map(function(d){return d===""?'<span></span>':'<button type="button" data-d="'+d+'" class="'+(digits.indexOf(d)>=0?"smudge":"")+'">'+d+'</button>'}).join("")+'</div><button type="button" class="btn" id="pnTry">'+o.P.tryBtn+'</button><div class="hist" id="pnH"></div></div>';
    var disp=o.box.querySelector("#pnD"),up=function(){disp.textContent=[0,1,2,3].map(function(i){return cur[i]!==undefined?cur[i]:"_"}).join(" ")};
    o.box.querySelector(".pkeys").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;var d=b.dataset.d;if(d==="⌫"){cur.pop()}else if(cur.length<4)cur.push(+d);o.beep(300,.05);up()});
    o.box.querySelector("#pnTry").addEventListener("click",function(){if(cur.length<4)return;tries++;var fb=cur.map(function(d,i){return d===sec[i]?2:sec.indexOf(d)>=0?1:0});
      o.box.querySelector("#pnH").insertAdjacentHTML("afterbegin","<div>"+cur.map(function(d,i){return'<span class="g'+fb[i]+'">'+d+"</span>"}).join("")+"</div>");
      if(fb.every(function(x){return x===2}))o.done();else{o.beep(200,.1);o.buzz(80);cur=[];up()}})},
  /* radio: stem in de ruis, draai tot hij helder is en houd stil */
  radio:function(o){var msg=o.label.toUpperCase(),noise="#%&@/=*?",tg=8+Math.floor(Math.random()*84),hold=0,last=0,acc=1;
    o.box.innerHTML='<div class="big" id="rdT" style="font-size:17px;letter-spacing:.06em;min-height:3.4em"></div><input type="range" id="rdR" min="0" max="100" value="'+(tg>50?4:96)+'" aria-label="'+o.P.freq+'"><div class="xp" style="width:100%;background:#c9bfa6"><i id="rdB" style="width:0%"></i></div>';
    var sl=o.box.querySelector("#rdR"),tx=o.box.querySelector("#rdT"),br=o.box.querySelector("#rdB");
    var f=function(ts){var dt=Math.min(.2,(ts-last)/1000)||0;last=ts;acc+=dt;var d=Math.abs(+sl.value-tg);hold=d<=2?hold+dt:0;
      if(acc>.1){acc=0;var p=d<=2?0:Math.min(1,d/22);tx.textContent=msg.replace(/[A-Z0-9]/g,function(ch){return Math.random()<p?noise[Math.floor(Math.random()*8)]:ch});br.style.width=Math.round((1-p)*100)+"%"}
      if(hold>=1.2)return o.done();o.mg.raf=requestAnimationFrame(f)};o.mg.raf=requestAnimationFrame(f)},
  /* verscheurde foto: stukken wisselen */
  tiles:function(o){var c=o.canvas(),g=c.getContext("2d"),src=document.createElement("canvas");src.width=src.height=260;var s=src.getContext("2d");
    s.fillStyle="#ece4d2";s.fillRect(0,0,260,260);s.strokeStyle="#1b2233";s.lineWidth=3;s.strokeRect(12,12,236,236);
    s.fillStyle="#c9a6ea";s.save();s.translate(200,60);s.rotate(.6);s.fillRect(-22,-22,44,44);s.restore();
    s.beginPath();s.arc(60,66,26,0,7);s.lineWidth=4;s.stroke();
    s.fillStyle="#1b2233";s.textAlign="center";s.font="26px 'Special Elite',monospace";var w=o.label.split(" "),l1=w.slice(0,Math.ceil(w.length/2)).join(" "),l2=w.slice(Math.ceil(w.length/2)).join(" ");s.fillText(l1.slice(0,16),130,124);s.fillText(l2.slice(0,16),130,154);
    s.lineWidth=1;for(var i=0;i<8;i++){s.beginPath();s.moveTo(30,180+i*8);s.lineTo(70+((i*53)%160),180+i*8);s.stroke()}
    var p;do{p=o.shuffle([0,1,2,3,4,5,6,7,8],Math.random)}while(p.every(function(v,i){return v===i}));var pick=-1,fin=false,TL=260/3;
    var dr=function(){g.clearRect(0,0,260,260);p.forEach(function(v,i){g.drawImage(src,(v%3)*TL,Math.floor(v/3)*TL,TL,TL,(i%3)*TL,Math.floor(i/3)*TL,TL,TL);g.strokeStyle="#101a2b";g.lineWidth=2;g.strokeRect((i%3)*TL+1,Math.floor(i/3)*TL+1,TL-2,TL-2)});
      if(pick>=0){g.strokeStyle="#f0a63a";g.lineWidth=5;g.strokeRect((pick%3)*TL+3,Math.floor(pick/3)*TL+3,TL-6,TL-6)}};dr();
    c.addEventListener("pointerdown",function(e){if(fin)return;var q=o.at(e,c),i=Math.min(2,Math.floor(q[0]/TL))+3*Math.min(2,Math.floor(q[1]/TL));
      if(pick<0)pick=i;else{var a=p[pick];p[pick]=p[i];p[i]=a;pick=-1;o.beep(300,.05)}dr();
      if(p.every(function(v,k){return v===k})){fin=true;o.mg.tm.push(setTimeout(o.done,600))}})},
  /* stof wegvegen */
  dust:function(o){o.box.innerHTML='<div class="dustw"><div>'+o.label.replace(/[&<>]/g,"")+'</div><canvas width="260" height="260"></canvas></div>';var c=o.box.querySelector("canvas"),g=c.getContext("2d");
    g.fillStyle="#3a4a66";g.fillRect(0,0,260,260);for(var i=0;i<500;i++){g.fillStyle=i%2?"#4a5b79":"#2d3b55";g.fillRect(Math.random()*260,Math.random()*260,6,3)}
    g.globalCompositeOperation="destination-out";var cells={},n=0,down=false;
    var rub=function(e){if(!down)return;var q=o.at(e,c);g.beginPath();g.arc(q[0],q[1],26,0,7);g.fill();var k=Math.floor(q[0]/33)+"_"+Math.floor(q[1]/33);if(!cells[k]){cells[k]=1;n++}if(n>=34){down=false;o.done()}};
    c.addEventListener("pointerdown",function(e){down=true;rub(e)});c.addEventListener("pointermove",rub);c.addEventListener("pointerup",function(){down=false})}
};
window.VZ_PUZ=PLAY;
})();
