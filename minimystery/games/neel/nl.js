document.getElementById("app").innerHTML="<!-- START -->\n<div class=\"scr on\" id=\"s-start\"><div class=\"in\">\n<div id=\"hero\"><img src=\"img/kompas.webp\" alt=\"\" onerror=\"this.remove()\"><svg viewBox=\"0 0 600 600\"><g font-size=\"46\" text-anchor=\"middle\" font-family=\"Georgia,serif\" fill=\"#3a2408\"><text x=\"297\" y=\"240\">N</text><text x=\"297\" y=\"478\">Z</text><text x=\"186\" y=\"358\">W</text><text x=\"408\" y=\"358\">O</text></g><g><path d=\"M297 222l20 120h-40z\" fill=\"#b5432c\"/><path d=\"M297 462l20-120h-40z\" fill=\"#3a2408\"/><animateTransform attributeName=\"transform\" type=\"rotate\" values=\"35 297 342;62 297 342;41 297 342;55 297 342;35 297 342\" dur=\"7s\" repeatCount=\"indefinite\"/></g></svg></div>\n<h1 id=\"ttl\">De Schat van <b>Rosse Neel</b></h1>\n<div class=\"tag\">Schattenjacht · zes escape rooms in 3D · drie tussenstops · ± 60 tot 90 minuten</div>\n<div id=\"hsp\"></div>\n<div id=\"resume\" style=\"display:none;margin-bottom:14px\"><button class=\"btn\" id=\"bResume\">Ga verder met je jacht</button><div style=\"height:8px\"></div><button class=\"lnk\" id=\"bNew\">Opnieuw beginnen</button></div>\n<div id=\"setup\">\n<div class=\"seg\" id=\"lvlseg\"><button data-v=\"kind\" class=\"on\">Kinderen</button><button data-v=\"gezin\">Gezin</button></div>\n<div class=\"modes\">\n<button class=\"mode\" data-m=\"buiten\"><i>🧭</i><div><b>Buiten</b><span>Loop met gps. Het kompas wijst je de plekken aan in je eigen buurt.</span></div></button>\n<button class=\"mode\" data-m=\"binnen\"><i>👣</i><div><b>Binnen</b><span>Loop door het huis of op de plaats. Je stappen brengen je verder.</span></div></button>\n<button class=\"mode on\" data-m=\"bank\"><i>🛋️</i><div><b>Op de bank</b><span>Reis door te tikken op de schatkaart. Alle kamers, geen meter lopen.</span></div></button>\n</div>\n<div class=\"seg\" id=\"lenseg\"></div>\n<button class=\"btn\" id=\"bStart\">Begin de jacht</button>\n<p class=\"small\" id=\"trial\" style=\"display:none;margin-top:12px\">Proefronde: de eerste twee plekken zijn gratis. Daarna speel je verder met een Feestpas.</p>\n<p class=\"small\" style=\"margin-top:16px\">Alleen of samen op één scherm. Sleep om rond te kijken in elke kamer, tik op wat je opvalt. Je voortgang wordt op dit apparaat bewaard.</p>\n<button class=\"lnk\" id=\"bSound\">Geluid: aan</button> <button class=\"lnk\" id=\"bLang\">English</button> <a class=\"lnk\" id=\"bHub\" style=\"display:none\">‹ MiniMystery</a>\n</div></div></div>\n\n<!-- MAP -->\n<div class=\"scr\" id=\"s-map\">\n<div class=\"top\"><h2>De kaart van Neel</h2><button class=\"pill\" id=\"mTest\" style=\"display:none\">Test ⏭</button><button class=\"pill\" data-inv>🎒 Buidel</button><div class=\"pill\"><span class=\"c\"></span><span class=\"coinn\">0</span></div></div>\n<div id=\"mapwrap\"><svg id=\"map\" viewBox=\"0 0 1000 1100\" preserveAspectRatio=\"xMidYMid meet\"></svg></div>\n<div id=\"mpanel\"></div>\n</div>\n\n<!-- ROOM -->\n<div class=\"scr\" id=\"s-room\">\n<div class=\"top\"><h2 id=\"rname\"></h2><button class=\"pill\" id=\"rTest\" style=\"display:none\">Test ⏭</button><button class=\"pill\" id=\"bMap\">🗺️</button><button class=\"pill\" id=\"bHint\">💡</button><button class=\"pill\" data-inv>🎒</button><div class=\"pill\"><span class=\"c\"></span><span class=\"coinn\">0</span></div></div>\n<div id=\"view\">\n<canvas id=\"gl\" style=\"position:absolute;inset:0;width:100%;height:100%;display:block\"></canvas><div id=\"vig\"></div>\n<div id=\"cam\">\n<div class=\"face wallf\" id=\"fN\"></div><div class=\"face wallf\" id=\"fE\"></div><div class=\"face wallf\" id=\"fS\"></div><div class=\"face wallf\" id=\"fW\"></div>\n<div class=\"face flatf\" id=\"fF\"></div><div class=\"face flatf\" id=\"fC\"></div>\n<div class=\"p3\" id=\"props\"></div>\n</div>\n<div id=\"dark\"></div>\n<button class=\"look\" id=\"lkL\">◀</button><button class=\"look\" id=\"lkR\">▶</button>\n<div id=\"cap\" class=\"off\"></div>\n<div id=\"fx\"></div>\n</div>\n</div>\n\n<!-- END -->\n<div class=\"scr\" id=\"end\"><div class=\"in\" id=\"endin\"></div></div>\n\n<div id=\"ov\"><div class=\"card\" id=\"card\"></div></div>\n\n".split("img/").join((window.RNB||"")+"img/");
"use strict";
const USE3=()=>!!(window.R3D&&R3D.ok);
const B=window.RNB||'',GID='rn';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LS='rosseneel.v1';
let S,TEST=false;const K=()=>S.lvl==='kind';
function fresh(){return{v:2,mode:'bank',lvl:'kind',len:1,stage:0,open:0,pos:-1,inRoom:false,coins:0,fl:{},inv:[],hints:{},hintN:0,t0:0,t1:0,start:null,pts:null,steps:0,sound:true,intro:false}}
function save(){try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}}
function load(){try{const j=localStorage.getItem(LS);if(j)return JSON.parse(j)}catch(e){}return null}
function show(id){if(id!=='s-room'&&USE3())R3D.stop();$$('.scr').forEach(s=>s.classList.toggle('on',s.id===id))}
function upd(){$$('.coinn').forEach(e=>e.textContent=S.coins)}

/* ---------- geluid ---------- */
let AC;
function ac(){if(!S||!S.sound)return null;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
function tone(f,d,type,v,when){const a=ac();if(!a)return;try{const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.value=f;const t=a.currentTime+(when||0);g.gain.setValueAtTime(v||.12,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.03)}catch(e){}}
const sfx={tap:()=>tone(520,.06,'triangle',.07),ok:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.3,'triangle',.13,i*.1)),no:()=>tone(150,.28,'sawtooth',.07),coin:()=>{tone(1320,.08,'square',.05);tone(1760,.22,'square',.05,.07)},bell:f=>{tone(f,1.5,'sine',.2);tone(f*2.01,1,'sine',.07);tone(f*2.99,.5,'sine',.035)},creak:()=>{tone(90,.5,'sawtooth',.05);tone(70,.6,'sawtooth',.04,.2)}};

/* ---------- symbolen ---------- */
const SYM={
zon:'<circle cx="12" cy="12" r="4.5"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M19.8 4.2L17 7M7 17l-2.8 2.8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>',
maan:'<path d="M15 2a10 10 0 1 0 7 15A8.5 8.5 0 0 1 15 2z"/>',
ster:'<path d="M12 1.5l3 7 7.5.6-5.7 4.9 1.8 7.4L12 17.4 5.4 21.4l1.8-7.4L1.5 9.1 9 8.5z"/>',
golf:'<path d="M1 9c3-5 6-5 8 0s5 5 7 0 4-4 7-1M1 17c3-5 6-5 8 0s5 5 7 0 4-4 7-1" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
schedel:'<path d="M12 2a8 8 0 0 0-8 8c0 3 1.5 5 3.5 6v4h9v-4c2-1 3.5-3 3.5-6a8 8 0 0 0-8-8z"/><circle cx="8.8" cy="10.5" r="2" fill="#000" fill-opacity=".6"/><circle cx="15.2" cy="10.5" r="2" fill="#000" fill-opacity=".6"/>',
anker:'<path d="M12 6v15M5 13c0 5 3.5 8 7 8s7-3 7-8M8 10h8" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="12" cy="4" r="2.2" stroke="currentColor" stroke-width="2" fill="none"/>',
vis:'<path d="M2 12c4-6 11-6 15 0-4 6-11 6-15 0zM16 12l6-5v10z"/><circle cx="6.5" cy="11" r="1" fill="#000" fill-opacity=".6"/>',
kroon:'<path d="M3 19V7l5 5 4-8 4 8 5-5v12z"/>'};
const SYMN={zon:'de zon',maan:'de maan',ster:'de ster',golf:'de golf',schedel:'de schedel',anker:'het anker',vis:'de vis',kroon:'de kroon'};
function sym(n,x,y,s,c){return `<g transform="translate(${x-s/2},${y-s/2}) scale(${s/24})" fill="${c}" style="color:${c}">${SYM[n]}</g>`}
function symH(n,s,c){return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="${c}" style="color:${c}">${SYM[n]}</svg>`}
const DUB=[{s:'zon',n:7},{s:'maan',n:3},{s:'schedel',n:9},{s:'ster',n:4},{s:'golf',n:6}];
const FINAL=[3,6,7,9,4]; // maan, golf, zon, schedel, ster

/* ---------- overlay ---------- */
function card(html){$('#card').innerHTML=html;$('#ov').classList.add('on');$('#card').scrollTop=0}
function closeCard(){$('#ov').classList.remove('on')}
$('#ov').addEventListener('click',e=>{if(e.target.id==='ov'&&!$('#card').dataset.lock)closeCard();const b=e.target.closest('[data-x]');if(b){sfx.tap();closeCard()}});
function note(title,body,btn){delete $('#card').dataset.lock;card(`<h3>${title}</h3>${body}<button class="btn" data-x>${btn||'Verder'}</button>`)}
let capT;
function say(t,keep){const c=$('#cap');c.innerHTML=t;c.classList.remove('off');clearTimeout(capT);if(!keep)capT=setTimeout(()=>c.classList.add('off'),6500)}

function dial(o){ // o:{title,text,wheels:[[vals]],labels?,answer:[idx],ok}
  const st=o.wheels.map(()=>0);
  const draw=()=>{$('#card').innerHTML=`<h3>${o.title}</h3><p class="c">${o.text||''}</p><div class="wheels" id="whs">${o.wheels.map((w,i)=>`<div class="wh"><button data-w="${i}" data-d="1">▲</button><div class="v">${w[st[i]]}</div><button data-w="${i}" data-d="-1">▼</button></div>`).join('')}</div><button class="btn" id="dTry">Probeer</button> <button class="btn sec" data-x>Terug</button>`};
  draw();$('#ov').classList.add('on');
  $('#card').onclick=e=>{const b=e.target.closest('[data-w]');if(b){const i=+b.dataset.w,n=o.wheels[i].length;st[i]=(st[i]+(+b.dataset.d)+n)%n;sfx.tap();draw();return}
    if(e.target.id==='dTry'){if(st.every((v,i)=>v===o.answer[i])){$('#card').onclick=null;closeCard();o.ok()}else{sfx.no();const w=$('#whs');w.classList.remove('shake');void w.offsetWidth;w.classList.add('shake')}}};
}
const D10=['0','1','2','3','4','5','6','7','8','9'];

/* ---------- buidel ---------- */
const ITEMS={sleutel:['🗝️','IJzeren sleutel'],spiegel:['🪞','Spiegelscherf'],bladA:['🎼','Half muziekblad'],bladB:['🎼','Andere helft']};
function openInv(){
  let h='<h3>Je buidel</h3>';const d=DUB.filter((_,i)=>S.fl['done'+i]);
  h+=`<p class="c">${d.length} van 5 dubloenen · ${d.length} van 5 kaartstukken · ${S.coins} gouden munten</p><div class="inv">`;
  DUB.forEach((x,i)=>{if(S.fl['done'+i])h+=`<button data-dub="${i}"><div class="dub">${symH(x.s,34,'#5a3d08')}<img src="${B}img/dub-${x.s}.webp" alt="" onerror="this.remove()"><div class="n">${x.n}</div></div>Dubloen</button>`});
  S.inv.forEach(k=>{h+=`<button><div style="font-size:40px;height:64px;display:flex;align-items:center">${ITEMS[k][0]}</div>${ITEMS[k][1]}</button>`});
  h+='</div>';if(!d.length&&!S.inv.length)h+='<p class="c hand">Nog leeg. Dat gaat veranderen.</p>';
  if(d.length)h+='<p class="c small" style="color:#5a4a2a">Op elke dubloen staat een teken en een ingekrast cijfer. Bewaar ze goed.</p>';
  note('',h,'Dicht');$('#card h3').remove();$('#card').classList.remove('bare');
}
document.addEventListener('click',e=>{if(e.target.closest('[data-inv]')){sfx.tap();openInv()}});

/* ================= KAMERS ================= */
const W=1200,H=760;
const hs=(id,inner)=>`<g data-hs="${id}" class="hs">${inner}</g>`;
const light=(g)=>`<rect width="${W}" height="${H}" fill="url(#${g||'gLight'})" pointer-events="none"/>`;
function base(p,g){return `<rect width="${W}" height="${H}" fill="url(#${p})"/>`}
function candle(x,y){return `<rect x="${x-18}" y="${y}" width="36" height="9" rx="3" fill="#b08a3a"/><rect x="${x-8}" y="${y-58}" width="16" height="58" fill="#efe6c8"/><circle cx="${x}" cy="${y-70}" r="46" fill="#ffc94a" opacity=".14"/><ellipse cx="${x}" cy="${y-72}" rx="8" ry="15" fill="#ffc94a"><animate attributeName="ry" values="15;12;16;14;15" dur="1.3s" repeatCount="indefinite"/></ellipse>`}
function scope(x,y,r){return `<g transform="translate(${x},${y}) rotate(${r||0})"><rect x="-90" y="-13" width="80" height="26" fill="url(#gBrass)" stroke="#5a3d08" stroke-width="2"/><rect x="-12" y="-10" width="64" height="20" fill="#7a5228" stroke="#2c1a0c" stroke-width="2"/><rect x="50" y="-8" width="44" height="16" fill="url(#gBrass)" stroke="#5a3d08" stroke-width="2"/></g>`}
function coinSpot(k,x,y,shape){if(S.fl[k])return'';return hs('coin:'+k,(shape||`<circle cx="${x}" cy="${y}" r="13" fill="url(#gCoin)" stroke="#8a6510" stroke-width="3"><animate attributeName="opacity" values="1;.55;1" dur="2.4s" repeatCount="indefinite"/></circle>`)+`<circle cx="${x}" cy="${y}" r="36" fill="#fff" fill-opacity="0"/>`)}
function door(done,style){const c=style==='stone'?'#4b3a2a':'#3b2412';return hs('door',`<path d="M470 760V330q0-90 130-90t130 90v430z" fill="#160d06"/><path d="M486 760V336q0-78 114-78t114 78v424z" fill="${c}" stroke="#1a0f06" stroke-width="4"/><path d="M600 262v498M486 480h228" stroke="#1a0f06" stroke-width="4"/><circle cx="690" cy="540" r="11" fill="url(#gBrass)"/>${done?`<g><rect x="520" y="372" width="160" height="50" rx="6" fill="#e8b93e"/><text x="600" y="406" text-anchor="middle" font-size="26" fill="#2a1c05" font-family="Georgia,serif">Naar de kaart</text></g>`:''}`)}
function ship(x,y,m,s){let g=`<g transform="translate(${x},${y}) scale(${s||1})"><path d="M-44 0h88l-14 20h-60z" fill="#5a3418"/>`;({1:[0],2:[-14,14],3:[-24,0,24],4:[-30,-10,10,30]})[m].forEach(px=>{g+=`<path d="M${px} 0v-50" stroke="#3a2210" stroke-width="3.5"/><path d="M${px+2} -48l15 18h-15z" fill="#fff8e0" stroke="#3a2210" stroke-width="1.5"/>`});return g+'</g>'}
function chartInner(){return `<rect width="1000" height="600" fill="url(#pPar)" stroke="#6b4a1c" stroke-width="10"/><rect x="60" y="60" width="880" height="480" fill="none" stroke="#6b4a1c" stroke-width="2" stroke-dasharray="8 6"/><g font-family="Georgia,serif" font-size="44" fill="#6b1f12" text-anchor="middle"><text x="500" y="50">N</text><text x="500" y="590">Z</text><text x="32" y="316">W</text><text x="968" y="316">O</text></g><path d="M380 260q40-70 130-50t110 60-30 100-130 40-110-60 30-90z" fill="#c9b075" stroke="#6b4a1c" stroke-width="3"/><path d="M450 300l20-40 24 40 20-26 22 26" stroke="#6b4a1c" stroke-width="3" fill="none"/><g stroke="#3d6a78" stroke-width="3" fill="none" opacity=".6"><path d="M150 150q20-14 40 0t40 0M760 130q20-14 40 0t40 0M200 470q20-14 40 0t40 0M740 460q20-14 40 0t40 0"/></g>${ship(500,150,3,1.25)}${ship(850,310,1,1.25)}${ship(500,500,2,1.25)}${ship(150,310,4,1.25)}`}
function barrel(x,y,sn,t,lit){let m='';if(lit){for(let i=0;i<t;i++)m+=`<path d="M${x-8*t+i*18+2} ${y-74}l6 34" stroke="#f4f1e4" stroke-width="6" stroke-linecap="round"/>`;m+=sym(sn,x,y-122,64,'#f4f1e4')}
  return `<path d="M${x-72} ${y-196}q-24 98 0 196h144q24-98 0-196z" fill="#7a5028" stroke="#2c1a0c" stroke-width="4"/><path d="M${x-52} ${y-196}q-14 98 0 196M${x} ${y-196}v196M${x+52} ${y-196}q14 98 0 196" stroke="#5a3a1c" stroke-width="3" fill="none"/><path d="M${x-80} ${y-170}h160M${x-80} ${y-22}h160" stroke="#33373b" stroke-width="12"/>${m}`}
const BELLS=[3,5,1,4,2],BELLX=[190,400,600,790,1000],FREQ={1:988,2:831,3:740,4:622,5:494},MEL=[2,4,1,5,3,1],MELK=[1,5,3,1],mel=()=>K()?MELK:MEL;
function bell(x,k){const r=30+k*13,y=150;return hs('bell:'+k,`<path d="M${x} 60v${y-60}" stroke="#2c1a0c" stroke-width="7"/><path d="M${x-r*.5} ${y}Q${x-r*.55} ${y+r*.95} ${x-r} ${y+r*1.5}L${x+r} ${y+r*1.5}Q${x+r*.55} ${y+r*.95} ${x+r*.5} ${y}Q${x} ${y-r*.55} ${x-r*.5} ${y}Z" fill="url(#gBrass)" stroke="#5a3d08" stroke-width="4"/><path d="M${x-r*.82} ${y+r*1.25}h${r*1.64}" stroke="#5a3d08" stroke-width="3"/><circle cx="${x}" cy="${y+r*1.5+10}" r="${7+k*1.5}" fill="#3b2a0a"/>`)}
function staff(parts){const M=mel(),h=M.length/2,kid=K();let s=`<svg viewBox="0 0 400 190" width="400"><rect width="400" height="190" fill="#f6ecd0"/>`;if(!kid)for(let i=1;i<=5;i++)s+=`<path d="M20 ${20+i*26}h360" stroke="#2a1c05" stroke-width="2"/>`;
  M.forEach((k,i)=>{const on=i<h?parts.a:parts.b,x=kid?68+i*88:62+i*56;if(!on){s+=`<text x="${x}" y="110" font-size="40" text-anchor="middle" fill="#b5432c" font-family="Georgia,serif">?</text>`;return}
    if(kid){const r=6+k*8,y=100-r*.75;s+=`<path d="M${x-r*.5} ${y}Q${x-r*.55} ${y+r*.95} ${x-r} ${y+r*1.5}L${x+r} ${y+r*1.5}Q${x+r*.55} ${y+r*.95} ${x+r*.5} ${y}Q${x} ${y-r*.55} ${x-r*.5} ${y}Z" fill="#c9952a" stroke="#5a3d08" stroke-width="3"/><text x="${x}" y="182" font-size="20" text-anchor="middle" fill="#6b1f12" font-family="Georgia,serif">${i+1}</text>`}
    else s+=`<ellipse cx="${x}" cy="${20+k*26}" rx="14" ry="10" fill="#2a1c05" transform="rotate(-18 ${x} ${20+k*26})"/><path d="M${x+12} ${20+k*26}v-${k>2?52:0}" stroke="#2a1c05" stroke-width="3"/>${k<=2?`<path d="M${x-12} ${20+k*26}v52" stroke="#2a1c05" stroke-width="3"/>`:''}`});
  s+=`<path d="M202 6l-6 30 8 30-8 30 8 30-6 58" stroke="#b9a777" stroke-width="2" fill="none" stroke-dasharray="5 4"/>`;return s+'</svg>'}
function treasureMap(){const P=[[150,95,'maan'],[285,210,'golf'],[150,300,'zon'],[300,385,'schedel'],[190,470,'ster']];
  let s=`<svg viewBox="0 0 400 540" width="400"><rect width="400" height="540" fill="url(#pPar)"/><path d="M60 60q90-50 200-20t90 120-40 110 40 120-80 110-170-10-60-140 30-130-10-160z" fill="#d9c391" stroke="#6b4a1c" stroke-width="3"/>`;
  s+=`<path d="M40 30L${P.map(p=>p[0]+' '+p[1]).join('L')}" fill="none" stroke="#b5432c" stroke-width="5" stroke-dasharray="3 12" stroke-linecap="round"/>`;
  s+=`<text x="26" y="24" font-size="15" fill="#6b1f12" font-family="Georgia,serif" font-style="italic">begin hier</text>`;
  P.forEach((p,i)=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="26" fill="#f6ecd0" stroke="#6b4a1c" stroke-width="2"/>`+sym(p[2],p[0],p[1],32,'#6b1f12')+(K()?`<circle cx="${p[0]+30}" cy="${p[1]+24}" r="15" fill="#2a1c05"/><text x="${p[0]+30}" y="${p[1]+31}" font-size="20" text-anchor="middle" fill="#e8b93e" font-family="Georgia,serif">${DUB.find(d=>d.s===p[2]).n}</text>`:'')});
  s+=`<path d="M176 492l28 28M204 492l-28 28" stroke="#b5432c" stroke-width="7" stroke-linecap="round"/>`;
  s+=`<g stroke="#8a7447" stroke-width="2" fill="none" stroke-dasharray="6 5"><path d="M0 150l130 20 90-40 180 30M0 345l160-20 90 30 150-25M210 0l20 130M195 345l25 195"/></g></svg>`;return s}

const PLEK=['hut','kaarten','kelder','toren','grot','schatkamer'];
const ROOMS=[
/* 1 ---------- KAPITEINSHUT ---------- */
{name:'De Kapiteinshut',dub:0,
 intro:'De hut van de <i>Meermin</i>. Het ruikt naar teer en kaarsvet. Links staat een zeekist met een hangslot. Het logboek ligt nog open op het bureau.',
 hints:['Lees het logboek op het bureau. Neel vertelt wat ze elke avond telde, en in welke volgorde.','Tel in de hele hut: de brandende kaarsen, de verrekijkers en de kanonskogels. Kijk op alle vier de wanden.','Vier kaarsen, twee kijkers, zes kogels: de lade opent met 4-2-6. De sleutel uit de lade past op de zeekist.'],
 walls(){const f=S.fl;return{
  n:base('pPlank')+`<circle cx="600" cy="230" r="118" fill="#2c1a0c"/><circle cx="600" cy="230" r="100" fill="url(#gSky)"/><circle cx="640" cy="190" r="26" fill="#f6ecd0"/><path d="M500 270q25-14 50 0t50 0 50 0 50 0v60H500z" fill="#12323f"/><path d="M600 130v200M500 230h200" stroke="#2c1a0c" stroke-width="8"/>
   <rect x="320" y="520" width="560" height="34" fill="#3f2713"/><rect x="340" y="554" width="26" height="206" fill="#33200f"/><rect x="834" y="554" width="26" height="206" fill="#33200f"/>`+
   hs('drawer',f.drawer?`<rect x="480" y="566" width="240" height="84" fill="#2a180a"/><rect x="470" y="600" width="260" height="70" fill="#5c3b20" stroke="#2c1a0c" stroke-width="4"/><rect x="486" y="606" width="228" height="20" fill="#1a0f06"/>`:`<rect x="480" y="560" width="240" height="78" fill="#5c3b20" stroke="#2c1a0c" stroke-width="4"/><circle cx="600" cy="600" r="16" fill="url(#gBrass)"/><g fill="#1a0f06"><rect x="556" y="590" width="18" height="20" rx="3"/><rect x="591" y="590" width="18" height="20" rx="3"/><rect x="626" y="590" width="18" height="20" rx="3"/></g>`)+
   hs('log',`<path d="M380 518l12-34h130l12 34z" fill="#8c2a1c" stroke="#2c1a0c" stroke-width="3"/><path d="M392 512l10-24h110l10 24z" fill="#f6ecd0"/><path d="M457 488v24M410 496h36M410 504h30M468 496h36M468 504h28" stroke="#6b4a1c" stroke-width="2"/>`)+
   candle(820,520)+scope(680,502,-4)+light(),
  e:base('pPlank')+`<rect x="200" y="340" width="480" height="18" fill="#3f2713"/><path d="M230 358l20 40M650 358l-20 40" stroke="#33200f" stroke-width="8"/>`+candle(300,340)+candle(560,340)+
   `<path d="M250 344h50l-8-38h-34z" fill="#4c6a3a"/><rect x="400" y="290" width="70" height="50" fill="#6b4a1c"/><rect x="408" y="282" width="54" height="10" fill="#8c2a1c"/>`+
   coinSpot('r1a',900,300)+
   hs('paint',`<g ${f.paint?'transform="rotate(28 770 180)"':''}><rect x="770" y="180" width="270" height="220" fill="#b08a3a" stroke="#5a3d08" stroke-width="5"/><rect x="790" y="200" width="230" height="180" fill="#1f4c66"/><path d="M790 320q30-14 58 0t58 0 58 0 56 0v60H790z" fill="#12323f"/>${ship(905,318,3,1.3)}</g><circle cx="770" cy="180" r="7" fill="#2c1a0c"/>`)+
   `<path d="M120 560q240 150 520 0" fill="none" stroke="#c9b075" stroke-width="26" stroke-linecap="round"/><path d="M120 560V470M640 560V470" stroke="#8a7447" stroke-width="5"/>`+light(),
  s:base('pPlank')+door(f.done0)+`<g fill="#2a2f36" stroke="#111" stroke-width="3"><circle cx="850" cy="724" r="34"/><circle cx="918" cy="724" r="34"/><circle cx="986" cy="724" r="34"/><circle cx="884" cy="666" r="34"/><circle cx="952" cy="666" r="34"/><circle cx="918" cy="608" r="34"/></g><g fill="#fff" opacity=".18"><circle cx="840" cy="712" r="8"/><circle cx="908" cy="712" r="8"/><circle cx="976" cy="712" r="8"/><circle cx="874" cy="654" r="8"/><circle cx="942" cy="654" r="8"/><circle cx="908" cy="596" r="8"/></g>`+barrel(250,760,'anker',0,false)+`<path d="M150 300h200v120H150z" fill="#12323f" stroke="#2c1a0c" stroke-width="8"/><path d="M160 380l60-50 50 40 40-30 30 30" stroke="#ecdcb4" stroke-width="3" fill="none"/>`+light(),
  w:base('pPlank')+`<rect x="262" y="400" width="76" height="12" fill="#33200f"/><path d="M300 412v40" stroke="#33200f" stroke-width="8"/>`+candle(300,400)+
   `<path d="M700 340v40M960 340v40" stroke="#33200f" stroke-width="10"/>`+scope(830,330,0)+
   `<path d="M480 160h240l-30 110H510z" fill="#1a0f06" stroke="#b08a3a" stroke-width="5"/>`+sym('schedel',600,212,70,'#ecdcb4')+light(),
  f:`<rect width="1200" height="1200" fill="url(#pFloorW)"/><ellipse cx="600" cy="600" rx="330" ry="250" fill="#7a2a1e" stroke="#c9952a" stroke-width="10"/><ellipse cx="600" cy="600" rx="250" ry="180" fill="none" stroke="#c9952a" stroke-width="4" stroke-dasharray="14 10"/>`+sym('anker',600,600,150,'#c9952a')+`<rect width="1200" height="1200" fill="url(#gLight)" pointer-events="none"/>`,
  c:`<rect width="1200" height="1200" fill="url(#pFloorW)"/><g fill="#33200f"><rect y="280" width="1200" height="50"/><rect y="860" width="1200" height="50"/></g><path d="M300 330q300 240 600 0" fill="none" stroke="#8a7447" stroke-width="4"/><path d="M340 330l40 150M460 330l20 215M600 330v230M740 330l-20 215M860 330l-40 150M380 480q220 130 440 0" fill="none" stroke="#8a7447" stroke-width="2"/>`+coinSpot('r1b',880,300)+`<rect width="1200" height="1200" fill="#000" opacity=".35" pointer-events="none"/>`}},
 props(){return chest('rotateY(90deg)',false,S.fl.done0)},
 on:{
  log(){if(K())return note('Logboek van de Meermin','<p class="hand c">Mijn lade heeft drie wieltjes.<br>Tel in de hele hut:</p><p class="c" style="font-size:26px;line-height:1.7">🕯️ kaarsen = ?<br>🔭 kijkers = ?<br>⚫ kogels = ?</p><p class="hand c">Kijk op alle muren!</p>','Dicht');note('Logboek van de Meermin','<p class="hand">14 oktober 1689. Windstil. De bemanning slaapt, ik niet.</p><p class="hand">Mijn lade opent alleen voor wie telt zoals ik elke avond tel: eerst mijn <b>kaarsen</b>, dan mijn <b>kijkers</b>, dan mijn <b>kogels</b>.</p><p class="hand">Wie ze niet alle vindt, heeft niet goed rondgekeken.</p>','Dicht')},
  drawer(){if(S.fl.drawer)return say('De lade is leeg. De sleutel heb je al.');dial({title:'De lade',text:'Drie koperen wieltjes naast de knop.',wheels:[D10,D10,D10],answer:[4,2,6],ok(){S.fl.drawer=1;S.inv.push('sleutel');sfx.ok();save();renderWalls();say('Klik. De lade schuift open. Er ligt een <b>ijzeren sleutel</b> in.')}})},
  paint(){if(!S.fl.paint){S.fl.paint=1;sfx.creak();renderWalls();say('Het schilderij zwaait opzij. Erachter glimt iets.')}else say('Een driemaster in de storm. Neel hield van drama.')},
  chest(){if(S.fl.done0)return say('De zeekist is leeg, op wat zand na.');if(!S.inv.includes('sleutel'))return say('Een zwaar hangslot. Hier hoort een sleutel bij.');S.inv=S.inv.filter(x=>x!=='sleutel');openChest();win(0)},
  door(){tryLeave(0)}}
},
/* 2 ---------- KAARTENKAMER ---------- */
{name:'De Kaartenkamer',dub:1,
 intro:'Kaarten tot aan het plafond. In de kast zit geen sleutelgat, maar een koperen kompasroos met vier knoppen.',
 hints:['Bekijk de grote zeekaart: vier schepen, elk aan een andere rand. En draai de wereldbol eens om.','Onder de wereldbol ligt een briefje: kleinste schip eerst, vlaggenschip het laatst. Tel de masten.','Eén mast ligt in het oosten, twee in het zuiden, drie in het noorden, vier in het westen: druk O, Z, N, W.'],
 walls(){const f=S.fl;return{
  n:base('pBrick')+hs('chart',`<g transform="translate(250,130) scale(.7)">${chartInner()}</g>`)+`<rect x="236" y="116" width="728" height="16" fill="#3f2713"/>`+candle(150,560)+candle(1050,560)+`<rect x="110" y="569" width="80" height="191" fill="#3f2713"/><rect x="1010" y="569" width="80" height="191" fill="#3f2713"/>`+light(),
  e:base('pBrick')+hs('cab',`<rect x="400" y="230" width="400" height="530" fill="#4a2e18" stroke="#1a0f06" stroke-width="6"/>${f.done1?`<rect x="420" y="250" width="360" height="490" fill="#120b05"/><path d="M400 230l-90 40v470l90 20z" fill="#5c3b20" stroke="#1a0f06" stroke-width="4"/>`:`<path d="M600 236v518" stroke="#1a0f06" stroke-width="5"/><circle cx="600" cy="490" r="86" fill="url(#gBrass)" stroke="#5a3d08" stroke-width="5"/><circle cx="600" cy="490" r="66" fill="#0d2b3d"/><path d="M600 432l14 58h-28zM600 548l14-58h-28z" fill="#ecdcb4"/><path d="M542 490l58-14v28zM658 490l-58-14v28z" fill="#b5432c"/><g font-family="Georgia,serif" font-size="24" fill="#2a1c05" text-anchor="middle"><text x="600" y="426">N</text><text x="600" y="570">Z</text><text x="532" y="498">W</text><text x="668" y="498">O</text></g>`}`)+
   `<g transform="translate(900,330)"><rect width="200" height="150" fill="url(#pPar)" stroke="#6b4a1c" stroke-width="4"/><path d="M30 100q40-70 80-30t60-40" stroke="#6b1f12" stroke-width="3" fill="none" stroke-dasharray="6 5"/></g><g transform="translate(110,300) rotate(-4)"><rect width="210" height="160" fill="url(#pPar)" stroke="#6b4a1c" stroke-width="4"/><circle cx="105" cy="80" r="46" fill="none" stroke="#6b4a1c" stroke-width="3"/><path d="M105 34v92M59 80h92" stroke="#6b4a1c" stroke-width="2"/></g>`+light(),
  s:base('pBrick')+door(f.done1,'stone')+`<rect x="800" y="200" width="320" height="560" fill="#3f2713" stroke="#1a0f06" stroke-width="5"/><g stroke="#1a0f06" stroke-width="5"><path d="M800 340h320M800 480h320M800 620h320"/></g>`+
   [0,1,2,3].map(r=>[0,1,2,3,4,5].map(c=>(r===2&&c===3)?'':`<rect x="${816+c*49}" y="${226+r*140+(c%3)*8}" width="40" height="${110-(c%3)*8}" fill="${['#7a2a1e','#2e4a5a','#5a4a1e','#3a5a3a','#5a2a4a','#2a2a5a'][(c+r*2)%6]}" stroke="#1a0f06" stroke-width="2"/>`).join('')).join('')+
   coinSpot('r2a',983,555,`<rect x="963" y="496" width="40" height="120" fill="#b5432c" stroke="#1a0f06" stroke-width="2" transform="rotate(7 983 616)"/><path d="M972 520h22" stroke="#e8b93e" stroke-width="4" transform="rotate(7 983 616)"/>`)+
   `<path d="M150 760V420h200v340" fill="#3f2713" stroke="#1a0f06" stroke-width="5"/><g fill="url(#pPar)" stroke="#6b4a1c" stroke-width="3"><circle cx="200" cy="470" r="22"/><circle cx="250" cy="470" r="22"/><circle cx="300" cy="470" r="22"/><circle cx="225" cy="530" r="22"/><circle cx="275" cy="530" r="22"/></g>`+light(),
  w:base('pBrick')+hs('globe',`<path d="M600 560v120M520 700h160l20 60H500z" fill="#3f2713" stroke="#3f2713" stroke-width="14"/><circle cx="600" cy="430" r="140" fill="none" stroke="url(#gBrass)" stroke-width="12"/><g ${f.globe?'transform="rotate(160 600 430)"':''}><circle cx="600" cy="430" r="122" fill="#2e6a80"/><path d="M540 350q50-30 80 10t-10 70-70-10-30-50zM640 470q40-10 50 30t-30 40-40-40z" fill="#c9b075"/><path d="M500 400q30 20 20 60" stroke="#c9b075" stroke-width="16" fill="none"/></g>`)+
   (f.globe?hs('note',`<g transform="rotate(-8 790 690)"><rect x="730" y="650" width="130" height="86" fill="#f6ecd0" stroke="#6b4a1c" stroke-width="2"/><path d="M746 672h96M746 690h80M746 708h90" stroke="#6b4a1c" stroke-width="3"/></g>`):'')+
   `<rect x="130" y="250" width="230" height="300" fill="#0d2b3d" stroke="#3f2713" stroke-width="12"/><g fill="#f6ecd0"><circle cx="190" cy="310" r="4"/><circle cx="260" cy="340" r="5"/><circle cx="300" cy="420" r="4"/><circle cx="210" cy="460" r="5"/><circle cx="170" cy="400" r="3"/></g><path d="M190 310l70 30 40 80-90 40-40-60z" stroke="#f6ecd0" stroke-width="1.5" fill="none" opacity=".6"/>`+light(),
  f:`<rect width="1200" height="1200" fill="url(#pTile)"/><circle cx="600" cy="600" r="260" fill="#12323f" stroke="#c9952a" stroke-width="8"/><path d="M600 360l40 240-40 240-40-240zM360 600l240-40 240 40-240 40z" fill="#c9952a"/>`+coinSpot('r2b',200,1030)+`<rect width="1200" height="1200" fill="url(#gLight)" pointer-events="none"/>`,
  c:`<rect width="1200" height="1200" fill="#2a2f36"/><g fill="#3f2713"><rect x="180" width="50" height="1200"/><rect x="575" width="50" height="1200"/><rect x="970" width="50" height="1200"/></g><rect width="1200" height="1200" fill="#000" opacity=".3" pointer-events="none"/>`}},
 on:{
  chart(){note('De zeekaart',`<svg viewBox="0 0 1000 600" width="400">${chartInner()}</svg><p class="c hand">Vier schepen, elk voor anker aan een andere rand van de kaart.</p>`,'Dicht')},
  globe(){if(!S.fl.globe){S.fl.globe=1;sfx.creak();renderWalls();say('De bol draait piepend. Er dwarrelt een briefje onder vandaan.')}else say('De wereld, zoals Neel hem kende. Halfleeg dus.')},
  note(){if(K())return note('Briefje onder de wereldbol',`<svg viewBox="0 0 400 90" width="400">${ship(50,70,1,.8)}${ship(140,70,2,.8)}${ship(240,70,3,.8)}${ship(345,70,4,.8)}<path d="M82 50h18M180 50h18M284 50h18" stroke="#b5432c" stroke-width="4"/></svg><p class="hand c">Eerst het kleinste schip, dan steeds groter.<br>Kijk op de grote kaart waar elk schip ligt: boven, onder, links of rechts. Druk op die pijl.</p>`,'Dicht');note('Briefje onder de wereldbol','<p class="hand">Mijn vloot voer nooit zomaar uit. Het <b>kleinste schip eerst</b>, het vlaggenschip het laatst.</p><p class="hand">Waar ze liggen, daar draai je heen.</p>','Dicht')},
  cab(){if(S.fl.done1)return say('De kast is leeg.');seqLock({title:'De kompasroos',text:'Vier knoppen. Vier keer drukken.',btns:['N','W','O','Z'],grid:[null,'N',null,'W',null,'O',null,'Z',null],len:4,lab:K()?{N:'↑',W:'←',O:'→',Z:'↓'}:null,answer:['O','Z','N','W'],ok(){win(1)}})},
  door(){tryLeave(1)}}
},
/* 3 ---------- SMOKKELKELDER ---------- */
{name:'De Smokkelkelder',dub:2,dark:true,
 intro:'Pikdonker. Het ruikt naar rum en natte steen. Ergens gloeit een heel klein vonkje. Sleep rond tot je het vindt.',
 hints:['Zoek eerst licht: op een plank gloeit de lont van een lantaarn. Tik erop.','Met licht zie je krijtstrepen op vier vaten en een tekst op de muur bij de trap. In de vloer zit een luik met vier tekens.','Meeste streepjes eerst: kroon (4), anker (3), schedel (2), vis (1). Het luik zit in de vloer, kijk omlaag.'],
 walls(){const f=S.fl,L=f.lant;return{
  n:base('pBrickD')+`<rect x="700" y="330" width="330" height="18" fill="#33200f"/><path d="M730 348l16 40M1000 348l-16 40" stroke="#33200f" stroke-width="8"/>`+
   hs('lant',`<rect x="836" y="230" width="68" height="100" rx="8" fill="${L?'#ffc94a':'#2a1c05'}" stroke="#b08a3a" stroke-width="6"/><path d="M846 230q24-50 48 0" fill="none" stroke="#b08a3a" stroke-width="6"/><circle cx="870" cy="290" r="${L?18:6}" fill="#ff8a2a"><animate attributeName="opacity" values="1;.4;1" dur="1.1s" repeatCount="indefinite"/></circle>${L?'<circle cx="870" cy="280" r="130" fill="#ffc94a" opacity=".16"/>':'<circle cx="870" cy="290" r="60" fill="#ff8a2a" opacity=".2"/>'}`)+
   barrel(330,760,'anker',3,L)+`<rect x="720" y="560" width="260" height="200" fill="#5c3b20" stroke="#2c1a0c" stroke-width="5"/><path d="M720 560l260 200M980 560L720 760" stroke="#2c1a0c" stroke-width="5"/>`+light(),
  e:base('pBrickD')+barrel(420,760,'kroon',4,L)+barrel(800,760,'anker',0,false)+`<path d="M150 760V300q0-80 80-80" fill="none" stroke="#33200f" stroke-width="14"/><path d="M1000 200v160" stroke="#8a7447" stroke-width="6"/><path d="M970 360h60l-10 80h-40z" fill="#7a2a1e"/>`+light(),
  s:base('pBrickD')+door(f.done2,'stone')+(L?`<g font-family="'Comic Sans MS','Segoe Print',cursive" font-size="44" fill="#f4f1e4" opacity=".9" transform="rotate(-3 250 300)"><text x="90" y="290">MEESTE</text><text x="90" y="345">STREEPJES</text><text x="90" y="400">EERST</text></g>`:'')+barrel(940,760,'schedel',2,L)+light(),
  w:base('pBrickD')+barrel(700,760,'vis',1,L)+`<path d="M250 760q0-70 60-70t60 70z" fill="#0a0604"/>`+coinSpot('r3a',310,738)+`<g stroke="#8a7447" stroke-width="5" fill="none"><path d="M900 120q40 120 0 240"/></g><path d="M870 360h60v70h-60z" fill="#3b3b3b"/>`+light(),
  f:`<rect width="1200" height="1200" fill="url(#pBrickD)"/>`+hs('trap',`<rect x="420" y="420" width="360" height="360" fill="${f.done2?'#050302':'#5c3b20'}" stroke="#1a0f06" stroke-width="10"/>${f.done2?'<path d="M450 450h300M450 500h300M450 550h300" stroke="#2c1a0c" stroke-width="12"/>':`<path d="M420 540h360M420 660h360" stroke="#2c1a0c" stroke-width="6"/><rect x="505" y="565" width="190" height="70" rx="10" fill="url(#gBrass)" stroke="#5a3d08" stroke-width="4"/><g fill="#1a0f06"><rect x="520" y="580" width="34" height="40" rx="4"/><rect x="562" y="580" width="34" height="40" rx="4"/><rect x="604" y="580" width="34" height="40" rx="4"/><rect x="646" y="580" width="34" height="40" rx="4"/></g>`}`)+`<rect width="1200" height="1200" fill="url(#gLight)" pointer-events="none"/>`,
  c:`<rect width="1200" height="1200" fill="#1a110c"/><g fill="#33200f"><rect y="200" width="1200" height="60"/><rect y="570" width="1200" height="60"/><rect y="940" width="1200" height="60"/></g>`+coinSpot('r3b',330,600)+`<path d="M700 600v60M690 660h20l8 50h-36z" stroke="#8a7447" stroke-width="4" fill="#7a2a1e"/>`}},
 on:{
  lant(){if(S.fl.lant)return say('De lantaarn brandt rustig. Kijk om je heen.');S.fl.lant=1;sfx.ok();save();renderWalls();setDark();say('Je draait de lont omhoog. De kelder komt tevoorschijn: vaten, krijt op de muur, een luik in de vloer.')},
  trap(){if(S.fl.done2)return say('Het luik staat open. Leeg nu.');if(!S.fl.lant)return say('Je voelt hout en koud ijzer. Zonder licht zie je niet wat je doet.');const sy=['anker','vis','kroon','schedel'],v=sy.map(n=>symH(n,34,'#fff3c9'));dial({title:'Het luik',text:'Vier wieltjes met tekens.',wheels:[v,v,v,v],answer:[2,0,3,1],ok(){win(2)}})},
  door(){tryLeave(2)}}
},
/* 4 ---------- KLOKKENTOREN ---------- */
{name:'De Klokkentoren',dub:3,
 intro:'Wind door de galmgaten. Vijf klokken, geen twee even groot. Op de lessenaar ligt een half gescheurd muziekblad.',
 hints:['Het muziekblad is doormidden gescheurd. De ene helft ligt op de lessenaar, de andere zit ergens waar een vogel hem heen sleepte.','Lees het bordje op de muur: hoe hoger de noot, hoe kleiner de klok. De bovenste lijn is de kleinste klok.','Luid in deze volgorde, van klein (1) tot groot (5): 2, 4, 1, 5, 3, 1.'],
 walls(){const f=S.fl;return{
  n:base('pBrick')+`<path d="M90 760V260Q90 40 600 40t510 220v500z" fill="url(#gSky)"/><g fill="#f6ecd0"><circle cx="200" cy="330" r="3"/><circle cx="330" cy="500" r="4"/><circle cx="900" cy="420" r="3"/><circle cx="1030" cy="560" r="4"/><circle cx="520" cy="600" r="3"/><circle cx="760" cy="640" r="3"/></g><path d="M90 760q200-90 400-40t300-20 320 0v60z" fill="#0a1a22"/><rect x="80" y="44" width="1040" height="30" fill="#33200f"/>`+BELLS.map((k,i)=>bell(BELLX[i],k)).join('')+
   (f.done3?`<rect x="520" y="560" width="160" height="130" fill="#0a0604" stroke="#c9952a" stroke-width="5"/>`:`<rect x="520" y="560" width="160" height="130" fill="#565d67" stroke="#2a2f36" stroke-width="5"/>`+sym('ster',600,625,60,'#2a2f36'))+light('gCool'),
  e:base('pBrick')+`<path d="M380 760V330q0-170 220-170t220 170v430z" fill="url(#gSky)"/><circle cx="660" cy="300" r="40" fill="#f6ecd0"/><circle cx="676" cy="290" r="36" fill="#0e2233"/><rect x="360" y="640" width="480" height="24" fill="#3a4048"/>`+
   hs('nest',`<ellipse cx="520" cy="630" rx="80" ry="26" fill="#6b4a1c"/><path d="M450 628q70-30 140 0M456 636q64 24 128 0" stroke="#8a7447" stroke-width="4" fill="none"/>${f.b?'':'<rect x="490" y="596" width="50" height="34" fill="#f6ecd0" transform="rotate(-14 515 613)"/><path d="M498 610h30" stroke="#2a1c05" stroke-width="2" transform="rotate(-14 515 613)"/>'}<circle cx="560" cy="618" r="10" fill="#e9e4d2"/>`)+light('gCool'),
  s:base('pBrick')+door(f.done3,'stone')+hs('lect',`<path d="M880 760V560M820 760h120" stroke="#3f2713" stroke-width="16"/><path d="M800 560l40-90h110l30 90z" fill="#5c3b20" stroke="#1a0f06" stroke-width="4"/><path d="M836 548l26-62h60l-6 62z" fill="#f6ecd0"/><path d="M850 530h56M854 516h50M858 502h46" stroke="#2a1c05" stroke-width="2"/>`)+`<path d="M200 760V200" stroke="#8a7447" stroke-width="10"/><path d="M190 200h20M180 760h40" stroke="#8a7447" stroke-width="16"/>`+light('gCool'),
  w:base('pBrick')+hs('plaq',`<rect x="420" y="250" width="360" height="150" fill="#2a2f36" stroke="url(#gBrass)" stroke-width="8"/><path d="M450 300h300M450 330h300M450 360h220" stroke="#c9952a" stroke-width="5"/>`)+
   (S.fl.r4a?`<rect x="200" y="543" width="194" height="54" fill="#0a0604"/>`:hs('coin:r4a',`<rect x="203" y="543" width="194" height="54" rx="5" fill="#6d7580" stroke="#2a2f36" stroke-width="3" transform="rotate(2 300 570)"/>`))+
   `<path d="M900 760V470h160v290" fill="#3f2713" stroke="#1a0f06" stroke-width="5"/><path d="M900 540h160M900 620h160M900 700h160" stroke="#1a0f06" stroke-width="4"/>`+light('gCool'),
  f:`<rect width="1200" height="1200" fill="url(#pFloorW)"/><rect x="460" y="460" width="280" height="280" fill="#0a0604" stroke="#2c1a0c" stroke-width="12"/><path d="M600 460v280" stroke="#8a7447" stroke-width="10"/><rect width="1200" height="1200" fill="url(#gCool)" pointer-events="none"/>`,
  c:`<rect width="1200" height="1200" fill="#151b22"/><path d="M0 0l1200 1200M1200 0L0 1200M600 0v1200M0 600h1200" stroke="#33200f" stroke-width="40"/><circle cx="600" cy="600" r="70" fill="#33200f"/>`+coinSpot('r4b',850,330)}},
 on:{
  bell(k){k=+k;sfx.bell(FREQ[k]);if(USE3())R3D.ring(k);const t=S._seq=(S._seq||[]).concat(k).slice(-mel().length);if(S.fl.done3)return;
   if(t.length===mel().length&&t.every((v,i)=>v===mel()[i])){S._seq=[];setTimeout(()=>{say('De laatste toon blijft hangen. Onder de klokken schuift een steen opzij.');win(3)},900)}
   else say(['','De kleinste klok. Hoog en helder.','Een kleine klok.','De middelste klok.','Een grote klok.','De grootste klok. Je voelt hem in je buik.'][k])},
  lect(){if(!S.fl.a){S.fl.a=1;S.inv.push('bladA')}showSheet()},
  nest(){if(!S.fl.b){S.fl.b=1;S.inv.push('bladB');sfx.ok();renderWalls();say('Tussen de takjes zit een stuk papier: de andere helft van het muziekblad.');setTimeout(showSheet,900)}else say('Een verlaten meeuwennest. En één ei dat je met rust laat.')},
  plaq(){if(K())return note('Koperen bordje','<p class="hand c">Luid mijn klokken zoals op het muziekblad:<br>kleine klok, grote klok, precies in die volgorde.</p>','Dicht');note('Koperen bordje','<p class="hand c">Hoe hoger de noot,<br>hoe kleiner de klok.</p><p class="hand c">Speel mijn lied en de toren geeft zich gewonnen.</p>','Dicht')},
  door(){tryLeave(3)}}
},
/* 5 ---------- GETIJDENGROT ---------- */
{name:'De Getijdengrot',dub:4,
 intro:'Druppels, zout, het ruisen van de zee. Door een spleet valt één straal maanlicht op een rek vol spiegels. Eén houder is leeg.',
 hints:['Het spiegelwerk mist een spiegel. Zoek in de grot naar iets dat blinkt onder water.','De scherf ligt in de getijdenpoel. Zet hem in de lege houder linksonder en tik op spiegels om ze te kantelen.','De straal moet omlaag, naar links, omlaag en dan naar rechts naar het kristal. Kantel de vier spiegels op die route.'],
 walls(){const f=S.fl;return{
  n:base('pRock')+`<path d="M560 0l20 250" stroke="#cfeaff" stroke-width="26" opacity=".25"/>`+hs('mir',`<rect x="380" y="250" width="440" height="420" rx="14" fill="#1a2427" stroke="url(#gBrass)" stroke-width="10"/><g stroke="#cfeaff" stroke-width="8" stroke-linecap="round"><path d="M470 320l50 50M600 430l50-50M440 440l50 50M700 300l50 50"/></g><path d="M740 560l30 40-30 40-30-40z" fill="${f.done4?'#7fe3ff':'#3d6a78'}" stroke="#cfeaff" stroke-width="3"/>${f.done4?'<circle cx="740" cy="600" r="90" fill="#7fe3ff" opacity=".25"/>':''}<circle cx="440" cy="600" r="24" fill="none" stroke="#8a7447" stroke-width="5" stroke-dasharray="6 6"/>`)+
   (f.done4?`<path d="M900 760V560q60-60 120 0v200z" fill="#0a0604" stroke="#c9952a" stroke-width="5"/>`:'')+light('gCool'),
  e:base('pRock')+hs('pool',`<ellipse cx="600" cy="690" rx="330" ry="70" fill="#1b4a5a" stroke="#2c373a" stroke-width="10"/><path d="M380 680q40-16 80 0M620 700q40-16 80 0M500 660q30-12 60 0" stroke="#7fb9c9" stroke-width="4" fill="none"><animate attributeName="opacity" values=".9;.3;.9" dur="3s" repeatCount="indefinite"/></path>${f.shard?'':'<path d="M640 676l34-10 10 22-30 8z" fill="#e8f6ff"><animate attributeName="opacity" values="1;.4;1" dur="1.6s" repeatCount="indefinite"/></path>'}`)+
   `<path d="M300 0l30 180 20-180M800 0l24 130 30-130M560 0l16 90 20-90" fill="#2c373a"/>`+light('gCool'),
  s:base('pRock')+hs('door',`<path d="M360 760V380q0-200 240-200t240 200v380z" fill="url(#gSky)"/><circle cx="690" cy="330" r="34" fill="#f6ecd0"/><path d="M360 600q60-24 120 0t120 0 120 0 120 0v160H360z" fill="#12323f"/><path d="M360 650q60-24 120 0t120 0 120 0 120 0" stroke="#7fb9c9" stroke-width="3" fill="none"/>${f.done4?`<rect x="520" y="440" width="160" height="50" rx="6" fill="#e8b93e"/><text x="600" y="474" text-anchor="middle" font-size="26" fill="#2a1c05" font-family="Georgia,serif">Naar de kaart</text>`:''}`)+light('gCool'),
  w:base('pRock')+hs('boat',`<path d="M300 620q300 190 600 0l-40 120H340z" fill="#5c3b20" stroke="#2c1a0c" stroke-width="5"/><path d="M340 660h520" stroke="#2c1a0c" stroke-width="4"/><path d="M700 640l160-180" stroke="#8a7447" stroke-width="10"/>`)+coinSpot('r5a',520,690)+
   hs('rune',`<g stroke="#e9dfc0" stroke-width="6" fill="none" opacity=".75"><path d="M420 250h120l80 80M620 330l-90 90"/><path d="M600 316l40 28" stroke-width="12"/><circle cx="500" cy="440" r="18"/></g>`)+light('gCool'),
  f:`<rect width="1200" height="1200" fill="url(#pSand)"/><path d="M820 300l14 34 36 4-27 24 8 36-31-19-31 19 8-36-27-24 36-4z" fill="#c2553a"/>`+coinSpot('r5b',330,820,`<path d="M300 830q30-60 60 0z" fill="#e9d6c0" stroke="#8a7447" stroke-width="3"/><path d="M330 800v30M315 808l8 22M345 808l-8 22" stroke="#8a7447" stroke-width="2"/>`)+`<rect width="1200" height="1200" fill="url(#gCool)" pointer-events="none"/>`,
  c:`<rect width="1200" height="1200" fill="url(#pRock)"/><path d="M520 560l160 40-30 60-140-50z" fill="#cfeaff" opacity=".5"/><rect width="1200" height="1200" fill="#000" opacity=".45" pointer-events="none"/>`}},
 on:{
  pool(){if(S.fl.shard)return say('Het water is helder en ijskoud. Een krabbetje kijkt je verontwaardigd aan.');S.fl.shard=1;S.inv.push('spiegel');sfx.ok();save();renderWalls();say('Je vist een <b>spiegelscherf</b> uit de poel. Rond geslepen: dit is geen afval.')},
  mir(){if(S.fl.done4)return say('Het kristal gloeit. De straal staat goed.');mirrorPuzzle()},
  boat(){say('Een sloep, half vergaan. Hiermee bracht Neel haar goud aan land.')},
  rune(){note('Krassen in de rots','<p class="hand c">Licht buigt waar het spiegelt.<br>Breng de maan naar het kristal.</p>','Dicht')},
  door(){tryLeave(4)}}
},
/* 6 ---------- SCHATKAMER ---------- */
{name:'De Schatkamer',dub:-1,
 intro:'Het einde van de kompasnaald. Op een sokkel staat een kist met vijf cijferwielen. Geen sleutelgat. Neel vertrouwde alleen op wie álles had gevonden.',
 hints:['Leg je vijf kaartstukken op de stenen tafel. Samen vormen ze Neels kaart.','De stippellijn op de kaart loopt langs vijf tekens. Dat is de volgorde. Het cijfer vind je op de dubloen met dat teken, in je buidel.','Maan, golf, zon, schedel, ster: 3-6-7-9-4.'],
 walls(){const f=S.fl;return{
  n:base('pBrickV')+`<path d="M330 760V300q0-190 270-190t270 190v460z" fill="#0b1520" stroke="url(#gBrass)" stroke-width="10"/><circle cx="600" cy="300" r="90" fill="#f3c941" opacity="${f.won?.5:.12}"/>`+sym('zon',170,330,90,'#c9952a')+sym('maan',1030,330,90,'#c9952a')+candle(170,620)+candle(1030,620)+`<rect x="130" y="629" width="80" height="131" fill="#2a3644"/><rect x="990" y="629" width="80" height="131" fill="#2a3644"/>`+light(),
  e:base('pBrickV')+hs('plaq',`<path d="M470 760V420q0-120 130-120t130 120v340z" fill="#3a4048" stroke="#1c2733" stroke-width="6"/><circle cx="600" cy="330" r="62" fill="#59606a"/><path d="M540 318q20-80 120 0 30 60 10 150-20-40-30-110-50 10-100-40z" fill="#b5432c"/><path d="M520 300h160l-20-34H540z" fill="#1c2733"/><path d="M576 340h14M610 340h14M586 366q14 10 28 0" stroke="#1c2733" stroke-width="4" fill="none"/><rect x="500" y="600" width="200" height="90" fill="url(#gBrass)" stroke="#5a3d08" stroke-width="4"/><path d="M520 630h160M520 655h120" stroke="#5a3d08" stroke-width="4"/>`)+coinSpot('r6a',930,660)+sym('golf',260,330,90,'#c9952a')+light(),
  s:base('pBrickV')+door(false,'stone')+sym('schedel',220,330,90,'#c9952a')+sym('ster',980,330,90,'#c9952a')+light(),
  w:base('pBrickV')+hs('table',`<rect x="330" y="540" width="540" height="40" fill="#59606a" stroke="#1c2733" stroke-width="5"/><rect x="380" y="580" width="60" height="180" fill="#3a4048"/><rect x="760" y="580" width="60" height="180" fill="#3a4048"/>${f.map?`<g transform="translate(470,340) scale(.5)">${treasureMap().replace(/^<svg[^>]*>|<\/svg>$/g,'')}</g>`:`<g fill="none" stroke="#c9952a" stroke-width="4" stroke-dasharray="10 8"><rect x="470" y="350" width="200" height="180"/></g><text x="570" y="450" text-anchor="middle" font-size="26" fill="#c9952a" font-family="Georgia,serif" font-style="italic">leg hier</text>`}`)+sym('anker',170,330,90,'#c9952a')+light(),
  f:`<rect width="1200" height="1200" fill="url(#pTile)"/><circle cx="600" cy="330" r="230" fill="none" stroke="#c9952a" stroke-width="8"/><rect width="1200" height="1200" fill="url(#gLight)" pointer-events="none"/>`,
  c:`<rect width="1200" height="1200" fill="#101a24"/><g fill="#f3c941"><circle cx="300" cy="300" r="5"/><circle cx="500" cy="200" r="4"/><circle cx="800" cy="350" r="6"/><circle cx="950" cy="700" r="4"/><circle cx="250" cy="800" r="5"/><circle cx="650" cy="950" r="4"/></g><path d="M300 300l200-100 300 150 150 350M250 800l400 150" stroke="#f3c941" stroke-width="1.5" opacity=".5" fill="none"/>`+coinSpot('r6b',620,620)}},
 props(){return chest('',true,S.fl.won)},
 on:{
  table(){if(!ALL5())return note('De stenen tafel','<p class="hand c">Hier passen vijf kaartstukken. Je hebt er '+(5-MISS().length)+'.</p><p class="c">Je mist nog het stuk uit:<br><b>'+MISS().join('<br>')+'</b></p><p class="c small" style="color:#5a4a2a">Tik op 🗺️ en ga terug naar die plek.</p>','Dicht');if(!S.fl.map){S.fl.map=1;sfx.ok();save();renderWalls()}note('De kaart van Neel',treasureMap()+'<p class="c hand">'+(K()?'Volg de stippellijn vanaf "begin hier". Bij elk teken staat het cijfer van die dubloen. Dat zijn de vijf cijfers van de kist.':'Vijf stukken, één kaart. De stippellijn begint linksboven en eindigt bij het kruis.')+'</p>','Dicht')},
  plaq(){note('Rosse Neel, in steen','<p class="hand c">Vijf munten, vijf cijfers.<br>Mijn kaart wijst de volgorde,<br>mijn munten het getal.</p>','Dicht')},
  chest(){if(S.fl.won)return;if(!ALL5())return note('De kist van Neel','<p class="hand c">Vijf wielen, maar jij hebt nog geen vijf dubloenen.</p><p class="c">Je mist nog de dubloen uit:<br><b>'+MISS().join('<br>')+'</b></p><p class="c small" style="color:#5a4a2a">Tik op 🗺️ en ga terug naar die plek.</p>','Dicht');dial({title:'De kist van Neel',text:'Vijf wielen. Eén kans is genoeg, als je alles hebt gevonden.',wheels:[D10,D10,D10,D10,D10],answer:FINAL,ok(){finale()}})},
  door(){peek()}}
}];

function chest(rot,big,open){const w=big?300:250,h=big?150:120,d=big?190:160,lh=big?60:50,py=big?70:0,cy=380-py-h/2,cls='ch'+(big?' gold':'');
  return `<div class="p3 ${open?'open':''}" id="chest" style="transform:${rot} translate3d(0,${cy}px,-400px)">${big?`<div class="p3" style="transform:translate3d(0,${h/2+py/2}px,0)">${box(w+80,py,d+80,'ped','chest')}</div>`:''}${box(w,h,d,cls,'chest')}<div class="glow" style="width:${w-30}px;height:${d-30}px;left:${-(w-30)/2}px;top:${-(d-30)/2}px;transform:rotateX(90deg) translateZ(${h/2-6}px)"></div><div class="p3 lid" style="transform:translate3d(0,${-h/2}px,${-d/2}px) rotateX(${open?105:0}deg)"><div class="p3" style="transform:translate3d(0,${-lh/2}px,${d/2}px)">${box(w,lh,d,cls+' lidf','chest')}</div></div></div>`}
function box(w,h,d,cls,id){const f=(c,st)=>`<div class="bf ${cls} ${c}" data-hs="${id}" style="${st}"></div>`,a=`width:${w}px;height:${h}px;left:${-w/2}px;top:${-h/2}px;`,b=`width:${d}px;height:${h}px;left:${-d/2}px;top:${-h/2}px;`,c=`width:${w}px;height:${d}px;left:${-w/2}px;top:${-d/2}px;`;
  return f('fr',a+`transform:translateZ(${d/2}px)`)+f('bk',a+`transform:rotateY(180deg) translateZ(${d/2}px)`)+f('rt',b+`transform:rotateY(90deg) translateZ(${w/2}px)`)+f('lf',b+`transform:rotateY(-90deg) translateZ(${w/2}px)`)+f('tp',c+`transform:rotateX(90deg) translateZ(${h/2}px)`)+f('bt',c+`transform:rotateX(-90deg) translateZ(${h/2}px)`)}
function openChest(){sfx.creak();if(USE3())return;const c=$('#chest');if(!c)return;sfx.creak();c.classList.add('open');c.querySelector('.lid').style.transform=c.querySelector('.lid').style.transform.replace(/rotateX\([^)]*\)/,'rotateX(105deg)')}

function seqLock(o){let inp=[];const L=o.lab||{};
  const draw=()=>{$('#card').innerHTML=`<h3>${o.title}</h3><p class="c">${o.text}</p><div class="seqd" id="sqd">${inp.map(x=>L[x]||x).join(' ')||'· · · ·'}</div><div class="seqb">${o.grid.map(g=>g?`<button data-s="${g}">${L[g]||g}</button>`:'<span></span>').join('')}</div><button class="btn sec" id="sqC">Wis</button> <button class="btn sec" data-x>Terug</button>`};
  draw();$('#ov').classList.add('on');
  $('#card').onclick=e=>{const b=e.target.closest('[data-s]');if(e.target.id==='sqC'){inp=[];draw();return}if(!b)return;sfx.tap();inp.push(b.dataset.s);draw();
    if(inp.length===o.len){if(inp.every((v,i)=>v===o.answer[i])){$('#card').onclick=null;closeCard();o.ok()}else{sfx.no();const w=$('#sqd');w.classList.add('shake');setTimeout(()=>{inp=[];draw()},500)}}};
}
function showSheet(){const p={a:!!S.fl.a,b:!!S.fl.b};note('Het lied van Neel',staff(p)+`<p class="c hand">${p.a&&p.b?(K()?'Luid de klokken in deze volgorde: klein of groot, net als op het blad.':'Zes noten. Het blad is weer heel.'):'De helft ontbreekt. Het blad is doormidden gescheurd.'}</p>`,'Dicht')}

/* spiegelpuzzel */
const MG={rocks:['1,1','3,1'],target:'4,4',mir:{'0,2':'/','2,2':'\\','2,0':'\\','4,0':'/','1,4':'/','3,3':'\\','0,4':'\\'}};
function trace(m,placed){let r=0,c=-1,d='E';const pts=[[-.5,0]];let hit=false;const mv={E:[0,1],W:[0,-1],N:[-1,0],S:[1,0]};
  for(let i=0;i<60;i++){r+=mv[d][0];c+=mv[d][1];if(r<0||r>4||c<0||c>4){pts.push([c-mv[d][1]*.5,r-mv[d][0]*.5]);break}pts.push([c,r]);const k=r+','+c;
    if(MG.rocks.includes(k))break;if(k===MG.target){hit=true;break}
    if(m[k]&&(k!=='4,0'||placed)){d=m[k]==='/'?{E:'N',N:'E',W:'S',S:'W'}[d]:{E:'S',S:'E',W:'N',N:'W'}[d]}}
  return{pts,hit}}
function mirrorPuzzle(){const m=S.fl.mg||(S.fl.mg=Object.assign({},MG.mir,K()?{'0,2':'\\','2,2':'/'}:{}));const C=64;
  const draw=()=>{const placed=!!S.fl.placed,t=trace(m,placed);let s=`<svg viewBox="-40 -8 368 336" width="368" id="mgs"><rect x="-40" y="-8" width="368" height="336" fill="#1a2427"/>`;
    for(let r=0;r<5;r++)for(let c=0;c<5;c++){const k=r+','+c,x=c*C,y=r*C;s+=`<rect x="${x+2}" y="${y+2}" width="${C-4}" height="${C-4}" rx="6" fill="#26353a" data-c="${k}"/>`;
      if(MG.rocks.includes(k))s+=`<path d="M${x+10} ${y+52}l8-30 18-10 16 14 4 26z" fill="#59666a" pointer-events="none"/>`;
      if(k===MG.target)s+=`<path d="M${x+32} ${y+10}l16 22-16 22-16-22z" fill="${t.hit?'#7fe3ff':'#3d6a78'}" stroke="#cfeaff" stroke-width="2" pointer-events="none"/>`;
      if(m[k]){if(k==='4,0'&&!placed)s+=`<circle cx="${x+32}" cy="${y+32}" r="18" fill="none" stroke="#8a7447" stroke-width="3" stroke-dasharray="5 5" pointer-events="none"/>`;
        else s+=`<path d="${m[k]==='/'?`M${x+12} ${y+52}L${x+52} ${y+12}`:`M${x+12} ${y+12}L${x+52} ${y+52}`}" stroke="#e8f6ff" stroke-width="7" stroke-linecap="round" pointer-events="none"/>`}}
    s+=`<path d="M-40 32L${t.pts.map(p=>(p[0]*C+32)+' '+(p[1]*C+32)).join('L')}" fill="none" stroke="#fff6c0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".9" pointer-events="none"/><text x="-34" y="20" font-size="15" fill="#fff6c0">☾</text></svg>`;
    $('#card').innerHTML=`<h3>Het spiegelwerk</h3><p class="c">Tik op een spiegel om hem te kantelen. Stuur het maanlicht naar het kristal.</p>${s}<br><button class="btn sec" data-x>Terug</button>`;return t};
  draw();$('#ov').classList.add('on');
  $('#card').onclick=e=>{const el=e.target.closest('[data-c]');if(!el)return;const k=el.dataset.c;if(!m[k])return;
    if(k==='4,0'&&!S.fl.placed){if(S.inv.includes('spiegel')){S.inv=S.inv.filter(x=>x!=='spiegel');S.fl.placed=1;sfx.ok();draw()}else{sfx.no();$('#card p').innerHTML='<b>Deze houder is leeg.</b> Hier hoort een spiegel in. Zoek hem in de grot.'}return}
    m[k]=m[k]==='/'?'\\':'/';sfx.tap();const t=draw();save();if(t.hit){$('#card').onclick=null;setTimeout(()=>{closeCard();say('Het kristal vangt de maan en licht blauw op. In de rots klapt een nis open.');win(4)},900)}};
}

const HK=[
['Tik op het rode boek op het bureau. Daar staat wat je moet tellen.','Tel 🕯️ de kaarsen met een vlammetje, 🔭 de gouden kijkers en ⚫ de zwarte kogels. Kijk op alle vier de muren!','🕯️ 4 · 🔭 2 · ⚫ 6. Draai de wieltjes van de lade op 4, 2, 6. Met de sleutel open je de kist.'],
['Tik op de wereldbol. Er valt een briefje uit. Bekijk ook de grote kaart.','Zoek het schip met 1 mast. Ligt het boven, onder, links of rechts op de kaart? Druk op die pijl. Dan 2 masten, 3 masten, 4 masten.','Druk op de kast: → ↓ ↑ ←'],
['Het is donker! Sleep rond tot je een oranje lichtje ziet en tik erop.','Op vier vaten staan krijtstreepjes en een plaatje. Het vat met de meeste streepjes komt eerst. Het luik zit in de vloer: kijk omlaag.',`Zet de wieltjes van het luik zo: ${['kroon','anker','schedel','vis'].map(n=>symH(n,26,'#6b1f12')).join(' ')}`],
['Tik op de lessenaar bij de deur. En kijk in het vogelnest bij het raam.','Op het muziekblad staan klokken getekend: klein of groot. Tik op de echte klokken in dezelfde volgorde.','Kleinste klok, grootste klok, middelste klok, kleinste klok.'],
['Er mist een spiegel. Kijk in het water van de poel, daar blinkt iets.','Tik op het spiegelrek en dan op het lege rondje linksonder. Tik daarna op spiegels om ze te draaien.','Draai alleen de twee spiegels helemaal links: die in het midden en die onderaan. Dan loopt het licht naar het kristal.'],
['Tik op de stenen tafel. Daar leg je de stukken van de kaart neer.','Volg de rode stippellijn vanaf "begin hier". Lees de cijfers in de zwarte rondjes, in die volgorde.','De kist gaat open met 3, 6, 7, 9, 4.']];
/* ---------- route: kamers en tussenstops ---------- */
const XS=[{name:'De Oude Steiger',icon:'🧩'},{name:'De Wegwijzer',icon:'❓'},{name:'De Papegaai',icon:'🦜'}];
const STOPS=[{r:0},{x:0},{r:1},{r:2},{x:1},{r:3},{r:4},{x:2},{r:5}],LAST=STOPS.length-1,TOT=15;
const RI=()=>STOPS[S.stage].r;
const NAME=i=>STOPS[i].r!=null?ROOMS[STOPS[i].r].name:XS[STOPS[i].x].name;
const DONE=i=>{const t=STOPS[i];return !!(t.r!=null?(t.r<5?S.fl['done'+t.r]:S.fl.won):S.fl['xdone'+t.x])};
function xWin(x,silent){S.fl['xdone'+x]=1;S.coins++;S.pos=S.stage;S.open=Math.min(LAST,Math.max(S.open,S.stage+1));S.stage=nextTarget();S.steps=0;leftAt=S.pos;away=false;save();upd();
  if(silent){if($('#s-map').classList.contains('on')){drawMap();panel()}return}
  sfx.ok();setTimeout(()=>sfx.coin(),350);$('#card').dataset.lock=1;card(`<h3>Gelukt!</h3><div class="dub big" style="animation:spin 1s ease-out"><img src="${B}img/munt.webp" alt="" onerror="this.remove()"></div><p class="c">${['Het biljet is weer heel. Achter het spijkertje zat een <b>gouden munt</b> geklemd.','De wegwijzer kraakt en draait. Uit de paal rolt een <b>gouden munt</b>.','De papegaai krijst tevreden en laat een <b>gouden munt</b> uit zijn snavel vallen.'][x]}</p><button class="btn" id="xGo">Verder op de kaart</button>`);
  $('#xGo').onclick=()=>{delete $('#card').dataset.lock;closeCard();showMap(true)}}
function skipX(){while(STOPS[S.stage].x!=null&&!DONE(S.stage))xWin(STOPS[S.stage].x,true)}
function xShell(x,intro,body){$('#card').dataset.lock=1;card(`<h3>${XS[x].icon} ${XS[x].name}</h3><p class="hand c" id="xIntro">${intro}</p><div id="xBody">${body}</div><button class="btn sec sm" id="xLater">Later</button>`);$('#xLater').onclick=()=>{delete $('#card').dataset.lock;$('#card').onclick=null;closeCard()}}
function xJigsaw(){const n=K()?3:4,N=n*n;let ord=[...Array(N).keys()],sel=-1;do{for(let i=N-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ord[i],ord[j]]=[ord[j],ord[i]]}}while(ord.every((v,i)=>v===i));
  const draw=()=>{$('#xBody').innerHTML=`<div class="jig" style="grid-template-columns:repeat(${n},1fr)">${ord.map((v,i)=>`<button data-j="${i}" class="${i===sel?'sel':''}" style="background-size:${n*100}% ${n*100}%;background-position:${(v%n)/(n-1)*100}% ${Math.floor(v/n)/(n-1)*100}%">${K()?`<i>${v+1}</i>`:''}</button>`).join('')}</div><p class="c small" style="color:#5a4a2a">Tik op twee stukjes om ze te verwisselen.</p>`};
  xShell(0,'Aan een paal hangt een opsporingsbiljet, in stukken gescheurd door de wind. Wie staat erop?','');draw();
  $('#card').onclick=e=>{const b=e.target.closest('[data-j]');if(!b)return;const i=+b.dataset.j;sfx.tap();if(sel<0){sel=i;draw();return}[ord[sel],ord[i]]=[ord[i],ord[sel]];sel=-1;draw();if(ord.every((v,k)=>v===k)){$('#card').onclick=null;setTimeout(()=>xWin(0),700)}}}
function xQuiz(x,intro,rounds){let r=0;
  const draw=msg=>{const q=rounds[r];$('#xBody').innerHTML=`<div class="xq">${q.q}</div><div class="opts" id="xOpts">${q.o.map((t,i)=>`<button data-o="${i}">${t}</button>`).join('')}</div><p class="c small" style="color:#6b1f12;min-height:1.3em">${msg||(rounds.length>1?`${r+1} van ${rounds.length}`:'')}</p>`};
  xShell(x,intro,'');draw();
  $('#card').onclick=e=>{const b=e.target.closest('[data-o]');if(!b)return;if(+b.dataset.o===rounds[r].a){sfx.ok();r++;if(r>=rounds.length){$('#card').onclick=null;setTimeout(()=>xWin(x),500)}else draw('Goed zo! Nog één.')}else{sfx.no();draw('Nee, dat is het niet. Denk nog eens.');const w=$('#xOpts');w.classList.add('shake')}}}
function openStop(){const x=STOPS[S.stage].x;if(S.fl['xdone'+x])return note(XS[x].icon+' '+XS[x].name,'<p class="c hand">Hier ben je al geweest. De munt zit in je buidel.</p>','Verder');
  if(x===0)return xJigsaw();
  if(x===1)return xQuiz(1,'Een scheve wegwijzer op een kruispunt. In de paal heeft iemand twee raadsels gekerfd.',[
    {q:'<p>Ik heb een naald, maar naaien kan ik niet.<br>Ik weet altijd de weg, maar loop nooit zelf.</p><p><b>Wat ben ik?</b></p>',o:['Een klok','Een kompas','Een zeilschip','Een schatkaart'],a:1},
    {q:'<p>Hoe meer je van mij weghaalt, hoe groter ik word.<br>Schatgravers kennen mij goed.</p><p><b>Wat ben ik?</b></p>',o:['Een schatkist','Een berg zand','De zee','Een kuil'],a:3}]);
  xMemory()}
function xMemory(){const names=['zon','maan','ster','golf','schedel','anker','vis','kroon'].slice(0,K()?6:8),deck=names.concat(names),open=[],done={};let lock=false;
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}xMemory.deck=deck;
  const draw=()=>{$('#xBody').innerHTML=`<div class="mem">${deck.map((n,i)=>{const up=done[i]||open.includes(i);return `<button data-k="${i}" class="${up?'up':''}${done[i]?' ok':''}">${up?symH(n,36,'#6b1f12'):''}</button>`}).join('')}</div><p class="c small" style="color:#5a4a2a">Draai twee kaarten om. Zijn ze gelijk, dan blijven ze liggen.</p>`};
  xShell(2,'De papegaai van Neel heeft haar speelkaarten van tafel geveegd. Zoek de paren bij elkaar.','');draw();
  $('#card').onclick=e=>{const b=e.target.closest('[data-k]');if(!b||lock)return;const i=+b.dataset.k;if(done[i]||open.includes(i))return;sfx.tap();open.push(i);draw();if(open.length<2)return;
    const x=open[0],y=open[1];if(deck[x]===deck[y]){done[x]=done[y]=1;open.length=0;sfx.coin();draw();if(Object.keys(done).length===deck.length){$('#card').onclick=null;setTimeout(()=>xWin(2),700)}}
    else{lock=true;setTimeout(()=>{open.length=0;lock=false;if($('#xBody .mem'))draw()},850)}}}
/* ---------- kamer-engine ---------- */
let yaw=0,pitch=0,PP=600,drag=null;
const cam=$('#cam'),view=$('#view');
function applyCam(){if(USE3())return;cam.style.transform=`translateZ(${PP}px) rotateX(${pitch}deg) rotateY(${yaw}deg)`;if(ROOMS[RI()]&&ROOMS[RI()].dark)setDark()}
function resizeView(){const r=view.getBoundingClientRect();if(!r.width)return;if(USE3()){PP=57.3*r.height/R3D.resize(r.width,r.height);return}PP=Math.max(r.width,r.height)*(r.width>r.height?.44:.58);view.style.perspective=PP+'px';applyCam()}
window.addEventListener('resize',resizeView);
function svgw(inner,h){return `<svg viewBox="0 0 1200 ${h}" preserveAspectRatio="none">${inner}</svg>`}
function renderWalls(){if(USE3()){R3D.build();upd();return}const w=ROOMS[RI()].walls();$('#fN').innerHTML=svgw(w.n,H);$('#fE').innerHTML=svgw(w.e,H);$('#fS').innerHTML=svgw(w.s,H);$('#fW').innerHTML=svgw(w.w,H);$('#fF').innerHTML=svgw(w.f,1200);$('#fC').innerHTML=svgw(w.c,1200);upd()}
function setDark(){const r=ROOMS[RI()],d=$('#dark');if(USE3()||!r||!r.dark||!$('#s-room').classList.contains('on')){d.style.display='none';return}d.style.display='block';
  d.style.background=S.fl.lant?'radial-gradient(circle at 50% 50%,transparent 0,transparent 26%,rgba(0,0,0,.55) 60%,rgba(0,0,0,.9) 100%)':(K()?'radial-gradient(circle at 50% 50%,transparent 0,rgba(0,0,0,.2) 16%,rgba(0,0,0,.86) 36%)':'radial-gradient(circle at 50% 50%,transparent 0,rgba(0,0,0,.25) 9%,rgba(0,0,0,.965) 22%)')}
function enterRoom(){const r=ROOMS[RI()];S.inRoom=true;S._seq=[];save();show('s-room');$('#rname').textContent=r.name;yaw=0;pitch=USE3()?-7:0;$('#cap').classList.add('off');
  if(USE3()){$('#cam').style.display='none';resizeView();R3D.enter()}else{$('#gl').style.display='none';$('#vig').style.display='none';$('#props').innerHTML=r.props?r.props():'';renderWalls();resizeView()}setDark();
  $('#rTest').style.display=TEST?'':'none';
  if(!S.fl['seen'+RI()]){S.fl['seen'+RI()]=1;delete $('#card').dataset.lock;card(`<img class="pimg" src="${B}img/plek-${PLEK[RI()]}.webp" alt="" onerror="this.remove()"><h3>${r.name}</h3><p class="hand">${r.intro}</p><p class="small c" style="color:#5a4a2a">Sleep om rond te kijken, ook omhoog en omlaag. Tik op wat je opvalt.</p><button class="btn" data-x>Kijk rond</button>`)}else say(r.intro)}
view.addEventListener('pointerdown',e=>{if(e.target.closest('.look'))return;if(USE3())R3D.nofocus();drag={x:e.clientX,y:e.clientY,yaw,pitch,mv:0};cam.classList.remove('sm')});
window.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,k=57.3/PP;drag.mv=Math.max(drag.mv,Math.abs(dx),Math.abs(dy));yaw=drag.yaw-dx*k;pitch=Math.max(-75,Math.min(75,drag.pitch+dy*k));applyCam()});
window.addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;if(d.mv<9&&USE3()){if(e.target.closest&&e.target.closest('#view')&&!e.target.closest('.look')){const id=R3D.tap(e.clientX,e.clientY);if(id){sfx.tap();onHs(id)}}}else if(d.mv<9){const el=document.elementFromPoint(e.clientX,e.clientY),t=el&&el.closest&&el.closest('[data-hs]');if(t){sfx.tap();onHs(t.dataset.hs)}}});
window.addEventListener('pointercancel',()=>drag=null);
function turn(d){if(USE3())return R3D.turn(Math.round((yaw+d*90)/90)*90,0);cam.classList.add('sm');yaw=Math.round((yaw+d*90)/90)*90;pitch=0;applyCam()}
$('#lkL').onclick=()=>turn(-1);$('#lkR').onclick=()=>turn(1);
function onHs(id){if(id.indexOf('coin:')===0){const k=id.slice(5);if(!S.fl[k]){S.fl[k]=1;S.coins++;sfx.coin();save();renderWalls();say(`Een gouden munt! Je hebt er nu ${S.coins}.`)}return}
  const p=id.split(':'),h=ROOMS[RI()].on[p[0]];if(h)h(p[1])}
function win(i){S.fl['done'+i]=1;sfx.ok();save();renderWalls();setTimeout(()=>{const x=DUB[i];$('#card').dataset.lock=1;
  card(`<h3>Een dubloen van Neel!</h3><div class="dub big">${symH(x.s,70,'#5a3d08')}<img src="${B}img/dub-${x.s}.webp" alt="" onerror="this.remove()"><div class="n">${x.n}</div></div><p class="c">Goud, met ${SYMN[x.s]} erop. In de rand is een <b>${x.n}</b> gekrast.</p><p class="c">Eronder ligt een stuk van een kaart: <b>kaartstuk ${DUB.filter((_,j)=>S.fl['done'+j]).length} van 5</b>.</p><button class="btn" id="wGo">Terug naar de kaart</button><br><button class="btn sec sm" id="wStay">Nog even rondzoeken</button>`);
  $('#wGo').onclick=()=>{delete $('#card').dataset.lock;closeCard();leave()};$('#wStay').onclick=()=>{delete $('#card').dataset.lock;closeCard();say('Zoek gerust verder naar gouden munten. De deur brengt je terug naar de kaart.')}},1300)}
function tryLeave(i){if(S.fl['done'+i])leave();else peek()}
const ALL5=()=>[0,1,2,3,4].every(i=>S.fl['done'+i]);
const MISS=()=>[0,1,2,3,4].filter(i=>!S.fl['done'+i]).map(i=>ROOMS[i].name);
function nextTarget(){for(let i=S.pos+1;i<=S.open;i++)if(!DONE(i)&&i<LAST)return i;for(let i=0;i<=Math.min(S.open,LAST-1);i++)if(!DONE(i)&&STOPS[i].r!=null)return i;return Math.min(LAST,S.open)}
function leave(){S.inRoom=false;S.pos=S.stage;S.open=Math.min(LAST,Math.max(S.open,S.stage+1));S.stage=nextTarget();S.steps=0;leftAt=S.pos;away=false;save();$('#dark').style.display='none';showMap(true)}
function peek(){S.inRoom=false;S.pos=S.stage;S.steps=0;leftAt=S.pos;away=false;save();$('#dark').style.display='none';showMap()}
$('#bMap').onclick=()=>{sfx.tap();peek()};
$('#bHint').onclick=()=>{const r={hints:K()?HK[RI()]:ROOMS[RI()].hints},n=S.hints[RI()]||0;sfx.tap();if(n>=r.hints.length)return note('Hint '+n+' van '+r.hints.length,`<p>${r.hints[n-1]}</p>`,'Dicht');
  const cost=K()||n===0?0:1;delete $('#card').dataset.lock;card(`<h3>Hint ${n+1} van ${r.hints.length}</h3><p class="c">${n?`Eerdere hint: <i>${r.hints[n-1]}</i>`:(K()?'Hints zijn gratis. Vraag er gerust een.':'De eerste hint in elke kamer is gratis.')}</p><p class="c">${cost?(S.coins>0?'Deze hint kost <b>1 gouden munt</b>.':'Je hebt geen munten. Neel strijkt met de hand over het hart: deze is gratis.'):''}</p><button class="btn" id="hGo">Geef de hint</button> <button class="btn sec" data-x>Toch niet</button>`);
  $('#hGo').onclick=()=>{if(cost&&S.coins>0)S.coins--;S.hints[RI()]=n+1;S.hintN++;save();upd();note('Hint '+(n+1),`<p>${r.hints[n]}</p>`,'Dank je')}};
$('#rTest').onclick=()=>{const i=RI();if(i<5){if(!S.fl['done'+i])win(i);else leave()}else{for(let j=0;j<5;j++)S.fl['done'+j]=1;finale()}};

function finale(){S.fl.won=1;S.t1=Date.now();save();openChest();renderWalls();sfx.ok();if(USE3())R3D.turn(Math.round(yaw/360)*360,-22);else{cam.classList.add('sm');yaw=0;pitch=-20;applyCam()}
  const fx=$('#fx');for(let i=0;i<70;i++){const c=document.createElement('div');c.className='cp';const a=Math.random()*Math.PI*2,d=120+Math.random()*420;c.style.setProperty('--x',Math.cos(a)*d+'px');c.style.setProperty('--y',(Math.sin(a)*d-160)+'px');c.style.setProperty('--d',(1.2+Math.random()*1.6)+'s');c.style.animationDelay=(.9+Math.random()*1.8)+'s';fx.appendChild(c)}
  [0,1,2,3,4,5].forEach(i=>setTimeout(()=>sfx.coin(),1100+i*260));
  say('Vijf klikken. Het deksel veert open en het goud spat je tegemoet.',true);setTimeout(()=>{fx.innerHTML='';showEnd()},5600)}
function showEnd(){show('end');const ms=(S.t1||Date.now())-S.t0,min=Math.max(1,Math.round(ms/60000)),c=S.coins,found=Object.keys(S.fl).filter(k=>/^(r\d[ab]|xdone\d)$/.test(k)).length;
  const rank=found>=TOT?'Kaperkoning(in) van de zeven zeeën':found>=10?'Eerste stuurman met een neus voor goud':found>=5?'Matroos met scherpe ogen':'Landrot met geluk';
  $('#endin').innerHTML=`<img class="kimg" src="${B}img/kist-open.webp" alt="" onerror="this.remove()">
  <h1 style="font-size:32px;color:var(--gold)">De schat is van jou</h1><p class="tag">${rank}</p>
  <div class="stat"><span>Tijd op jacht</span><b>${min} min</b></div><div class="stat"><span>Dubloenen</span><b>5 van 5</b></div><div class="stat"><span>Verborgen gouden munten</span><b>${found} van ${TOT}</b></div><div class="stat"><span>Hints gebruikt</span><b>${S.hintN}</b></div>
  <div class="card" style="margin:22px auto;text-align:left"><img class="neel" src="${B}img/por-neel.webp" alt="" onerror="this.remove()"><p class="hand">Zoeker,</p><p class="hand">Je hebt geteld, gekeken, geluisterd en licht gebogen. Meer vroeg ik nooit van mijn bemanning.</p><p class="hand">Neem het goud. Maar leg één munt terug in de kist en doe hem dicht. Niet voor mij. Voor wie na jou komt, en voor het plezier van het zoeken.</p><p class="hand" style="text-align:right">R.N., 1689</p></div>
  ${found<TOT?`<p class="small">Er liggen nog ${TOT-found} gouden munten verstopt. Twee per kamer, zelden op ooghoogte, en één bij elke tussenstop.</p>`:''}
  <div class="row" style="margin-top:14px"><button class="btn" id="eCopy">Kopieer je uitslag</button><button class="btn sec" id="eAgain">Opnieuw spelen</button></div>`;
  $('#eCopy').onclick=()=>{const t=`Ik vond de schat van Rosse Neel in ${min} minuten, met ${found} van de ${TOT} verborgen munten. ${rank}.`;try{navigator.clipboard.writeText(t).then(()=>{$('#eCopy').textContent='Gekopieerd'},()=>{$('#eCopy').textContent=t})}catch(e){$('#eCopy').textContent=t}};
  $('#eAgain').onclick=()=>{try{localStorage.removeItem(LS)}catch(e){}location.reload()}}

/* ================= KAART EN BEWEGING ================= */
const SPOT=[[190,930],[330,770],[520,860],[720,790],[790,570],[640,470],[450,400],[240,310],[400,190],[630,165]];
const LENS={gezin:{buiten:[1500,2500,4000],binnen:[120,250,400]},kind:{buiten:[400,700,1000],binnen:[50,100,160]}};
let leftAt=null,away=false,watchId=null,pos=null,heading=null,tokenT=0,moveAnim=null,walking=false,stepSrc=null,lastStep=0,armed=true,tempoInt=null,verleg=false,geoErr='';
function toRad(d){return d*Math.PI/180}
function distM(a,b){const dy=(b.lat-a.lat)*111320,dx=(b.lon-a.lon)*111320*Math.cos(toRad(a.lat));return Math.hypot(dx,dy)}
function bearing(a,b){const dy=(b.lat-a.lat),dx=(b.lon-a.lon)*Math.cos(toRad(a.lat));return(Math.atan2(dx,dy)*180/Math.PI+360)%360}
function dest(a,brg,d){return{lat:a.lat+d*Math.cos(toRad(brg))/111320,lon:a.lon+d*Math.sin(toRad(brg))/(111320*Math.cos(toRad(a.lat)))}}
function genRoute(){const D=LENS[S.lvl].buiten[S.len],r=D/(2*Math.PI),b0=Math.random()*360,c=dest(S.start,b0,r),dir=Math.random()<.5?1:-1;S.pts=[];
  for(let k=1;k<=LAST+1;k++){const rr=k===LAST+1?r:r*(.85+Math.random()*.3);S.pts.push(dest(c,b0+180+dir*k*360/(LAST+1),rr))}save()}
function xy(i){ // kaartpositie van punt i (0=start, 1..6)
  if(S.mode!=='buiten'||!S.pts)return SPOT[i];return proj(i===0?S.start:S.pts[i-1])}
let PJ=null;
function calcProj(){const all=[S.start].concat(S.pts);if(pos)all.push(pos);const la=all.map(p=>p.lat),lo=all.map(p=>p.lon),c={lat:(Math.min(...la)+Math.max(...la))/2,lon:(Math.min(...lo)+Math.max(...lo))/2};
  let m=60;all.forEach(p=>{m=Math.max(m,Math.abs((p.lat-c.lat)*111320),Math.abs((p.lon-c.lon)*111320*Math.cos(toRad(c.lat))))});PJ={c,s:380/m}}
function proj(p){return[500+(p.lon-PJ.c.lon)*111320*Math.cos(toRad(PJ.c.lat))*PJ.s,560-(p.lat-PJ.c.lat)*111320*PJ.s]}
function unproj(x,y){return{lat:PJ.c.lat-(y-560)/PJ.s/111320,lon:PJ.c.lon+(x-500)/PJ.s/(111320*Math.cos(toRad(PJ.c.lat)))}}

function drawMap(){const g=S.mode==='buiten'&&S.pts;if(g)calcProj();const st=S.open;let s=`<rect width="1000" height="1100" fill="url(#pPar)"/><image href="${B}img/kaart.webp" width="1000" height="1100" preserveAspectRatio="none"/>`;
  if(!g){s+=`<path d="M110 300q100-140 290-110t290-50 200 140-40 290-230 120-290 40-240-140-20-290z" fill="#c79a4a" fill-opacity=".22" stroke="#6b4a1c" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/><g stroke="#3d6a78" stroke-width="3" fill="none" opacity=".55"><path d="M60 1000q22-14 44 0t44 0M420 1010q22-14 44 0t44 0M800 990q22-14 44 0t44 0M860 700q22-14 44 0t44 0"/></g><g stroke="#6b4a1c" stroke-width="3" fill="none" opacity=".6"><path d="M560 620l24-46 26 46 22-30 24 30M300 520l20-38 22 38M700 330l22-40 24 40 20-26 20 26"/></g>${ship(820,950,3,1.4)}<path d="M100 880q30-40 60 0t60 0" stroke="#3d6a78" stroke-width="5" fill="none"/><circle cx="96" cy="872" r="5" fill="#3d6a78"/>`}
  else{s+=`<g stroke="#b9a777" stroke-width="1.5" opacity=".7">${[1,2,3,4,5,6,7,8,9].map(i=>`<path d="M${i*100} 70v960M70 ${i*110}h860"/>`).join('')}</g>`;const m100=100*PJ.s;s+=`<path d="M110 1010h${m100}" stroke="#6b1f12" stroke-width="5"/><text x="${110+m100/2}" y="1000" text-anchor="middle" font-size="22" fill="#6b1f12" font-family="Georgia,serif">100 m</text>`}
  s+=`<g transform="translate(820,170)"><circle r="62" fill="none" stroke="#6b4a1c" stroke-width="3"/><path d="M0-56l12 56-12 56-12-56zM-56 0l56-12 56 12-56 12z" fill="#6b4a1c" opacity=".8"/><path d="M0-56l12 56h-24z" fill="#b5432c"/><text y="-68" text-anchor="middle" font-size="26" fill="#6b1f12" font-family="Georgia,serif">N</text></g>`;
  // route
  let pth='M'+xy(0).join(' ');for(let i=1;i<=Math.min(st+1,LAST+1);i++){const a=xy(i-1),b=xy(i);pth+=g?`L${b[0]} ${b[1]}`:`Q${(a[0]+b[0])/2+(i%2?60:-60)} ${(a[1]+b[1])/2+(i%2?-50:50)} ${b[0]} ${b[1]}`}
  s+=`<path id="rt" d="${pth}" fill="none" stroke="#b5432c" stroke-width="6" stroke-dasharray="4 16" stroke-linecap="round"/>`;
  const a0=xy(0);s+=`<g transform="translate(${a0[0]},${a0[1]})"><path d="M-22 8l22-24 22 24v22h-44z" fill="#6b4a1c"/><text y="56" text-anchor="middle" font-size="24" fill="#6b1f12" font-family="Georgia,serif" font-style="italic">${S.mode==='bank'?'jouw bank':'start'}</text></g>`;
  for(let i=1;i<=LAST+1;i++){const p=xy(i),ix=i-1,un=ix<=S.open,done=DONE(ix),tg=ix===S.stage,T=STOPS[ix],isX=T.x!=null;
    if(!un){if(!g)s+=`<g transform="translate(${p[0]},${p[1]})" opacity=".45"><circle r="${isX?12:20}" fill="none" stroke="#6b4a1c" stroke-width="3" stroke-dasharray="5 5"/>${isX?'':'<text y="9" text-anchor="middle" font-size="26" fill="#6b4a1c" font-family="Georgia,serif">?</text>'}</g>`;continue}
    let m=tg?`<circle r="46" fill="#b5432c" opacity=".18"><animate attributeName="r" values="34;58;34" dur="2s" repeatCount="indefinite"/></circle>`:'';
    if(isX)m+=`<circle r="19" fill="${done?'url(#gCoin)':'#fff8e0'}" stroke="${done?'#8a6510':'#b5432c'}" stroke-width="4"/><text y="8" text-anchor="middle" font-size="22" fill="${done?'#5a3d08':'#b5432c'}" font-family="Georgia,serif">${done?'✓':'✦'}</text>`;
    else if(done)m+=`<circle r="24" fill="url(#gCoin)" stroke="#8a6510" stroke-width="3"/>${T.r<5?sym(DUB[T.r].s,0,0,28,'#5a3d08')+`<image href="${B}img/dub-${DUB[T.r].s}.webp" x="-30" y="-30" width="60" height="60"/>`:''}`;
    else m+=`<path d="M-20-20l40 40M20-20l-40 40" stroke="#b5432c" stroke-width="${tg?11:7}" stroke-linecap="round" ${tg?'':'opacity=".7"'}/>`;
    s+=`<g transform="translate(${p[0]},${p[1]})" data-go="${ix}" style="cursor:pointer"><circle r="60" fill="#fff" fill-opacity="0"/>${m}<text y="${tg?72:(isX?48:58)}" text-anchor="middle" font-size="${tg?34:(isX?24:28)}" fill="#3a2210" font-family="Georgia,serif" ${isX&&!tg?'font-style="italic"':''}>${NAME(ix)}</text></g>`}
  // speler
  let tp;if(g&&pos)tp=proj(pos);else tp=tokenPos();
  s+=`<g id="tok" transform="translate(${tp[0]},${tp[1]})"><circle r="17" fill="#12323f" stroke="#fff8e0" stroke-width="4"/><circle r="6" fill="#e8b93e"/></g>`;
  $('#map').innerHTML=s}
function tokenPos(){const a=xy(S.pos+1),b=xy(S.stage+1),t=S.mode==='buiten'?0:(S.pos===S.stage?1:tokenT);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]}
function setTok(){const t=$('#tok');if(t){const p=tokenPos();t.setAttribute('transform',`translate(${p[0]},${p[1]})`)}}

function showMap(arrived){show('s-map');stopWalk();S.stage=Math.min(LAST,S.stage);tokenT=S.mode==='binnen'?Math.min(1,S.steps/LENS[S.lvl].binnen[S.len]):0;$('#mTest').style.display=TEST?'':'none';upd();
  if(S.mode==='buiten')startGeo();drawMap();panel();
  if(arrived&&S.stage===LAST&&ALL5()&&!S.fl.n5){S.fl.n5=1;save();setTimeout(()=>note('De naald trilt','<p class="hand">Vijf dubloenen, vijf kaartstukken. Het kompas draait nog één keer en blijft dan doodstil staan.</p><p class="hand">De laatste plek. Die van de kist.</p>','Op naar de schat'),500)}}
function setTarget(i){if(i===S.stage)return;S.stage=i;S.steps=0;tokenT=0;stopWalk();save();drawMap();panel()}
function skipNext(){if(S.open>=LAST)return;sfx.tap();S.open++;S.steps=0;tokenT=0;S.stage=S.open;save();drawMap();panel()}
function panel(){const p=$('#mpanel'),n=S.stage,nm=NAME(n),isX=STOPS[n].x!=null,here=S.pos===n&&!away;let h;
  const foot=()=>`<div class="row" style="margin-top:6px">${S.open<LAST?'<button class="lnk" id="bSkip">Volgend punt ›</button>':''}</div>${S.open>0?'<p class="small" style="margin:2px 0 0">Tik op een eerdere plek om daarheen terug te gaan.</p>':''}`;
  if(here){h=`<h3>Je bent bij ${nm}</h3><p>${DONE(n)?'Hier heb je alles al gevonden.':(isX?'Een tussenstop met een puzzel.':'Deze plek is nog niet opgelost.')}</p><div class="row"><button class="btn" id="bIn">${isX?'Open de puzzel':'Ga naar binnen'}</button></div>`+foot()}
  else if(S.mode==='bank'){h=`<h3>Volgende plek: ${nm}</h3><p>Tik op de plek op de kaart om erheen te reizen.</p>`+foot()}
  else if(S.mode==='binnen'){const need=LENS[S.lvl].binnen[S.len];h=`<h3>Op weg naar ${nm}</h3><div class="bar"><i id="pbar" style="width:${Math.min(100,S.steps/need*100)}%"></i></div><p id="ptxt">${Math.floor(S.steps)} van ${need} stappen</p><div class="row"><button class="btn" id="bWalk">${walking?'Pauze':'Ik loop'}</button></div><p class="small" id="psrc" style="margin-top:8px">Loop door het huis of op de plaats, telefoon in je hand of zak.</p>`+foot()}
  else{const tgt=S.pts&&S.pts[n];h=`<h3>Op weg naar ${nm}</h3>`;
    if(geoErr){h+=`<p>${geoErr}</p><div class="row"><button class="btn" id="bBank">Speel verder op de bank</button><button class="btn sec" id="bGeo">Probeer gps opnieuw</button></div>`}
    else if(!pos||!tgt){h+=`<p>Het kompas zoekt je plek. Even geduld, het ding is drie eeuwen oud.</p>`}
    else{const d=distM(pos,tgt),b=bearing(pos,tgt),rot=heading==null?b:b-heading;h+=`<div class="row"><svg id="needle" viewBox="-42 -48 84 92"><circle r="30" fill="#ecdcb4" stroke="#e8b93e" stroke-width="4"/><image href="${B}img/kompas.webp" x="-39.6" y="-45.6" width="80" height="80"/><g transform="rotate(${rot})"><path d="M0-21l6 21h-12z" fill="#b5432c"/><path d="M0 21l6-21h-12z" fill="#3a2408"/></g></svg><div style="text-align:left"><div style="font-size:30px;color:var(--gold)">${d<1000?Math.round(d)+' m':(d/1000).toFixed(1)+' km'}</div><div class="small">${heading==null?'Rood wijst de richting op de kaart (noord boven).':'Rood wijst naar de plek.'}</div></div></div><div class="row" style="margin-top:8px"><button class="btn sec sm" id="bVer">${verleg?'Tik nu op de kaart…':'Verleg dit punt'}</button>${S.open===0?'<button class="btn sec sm" id="bRoute">Andere route</button>':''}<button class="lnk" id="bHere">Ik sta er (gps hapert)</button></div>`+foot()}}
  p.innerHTML=h;const q=id=>p.querySelector(id);
  if(q('#bIn'))q('#bIn').onclick=()=>arrive();if(q('#bSkip'))q('#bSkip').onclick=skipNext;if(q('#bWalk'))q('#bWalk').onclick=toggleWalk;
  if(q('#bBank'))q('#bBank').onclick=()=>{S.mode='bank';stopGeo();save();showMap()};if(q('#bGeo'))q('#bGeo').onclick=()=>{geoErr='';stopGeo();startGeo();panel()};
  if(q('#bVer'))q('#bVer').onclick=()=>{verleg=!verleg;panel()};if(q('#bRoute'))q('#bRoute').onclick=()=>{genRoute();drawMap();panel()};if(q('#bHere'))q('#bHere').onclick=()=>arrive()}
$('#map').addEventListener('click',e=>{
  if(S.mode==='buiten'&&verleg&&S.pts){const pt=$('#map').createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform($('#map').getScreenCTM().inverse());S.pts[S.stage]=unproj(q.x,q.y);verleg=false;save();sfx.ok();drawMap();panel();return}
  const gg=e.target.closest('[data-go]');if(!gg||moveAnim)return;const ix=+gg.dataset.go,was=S.stage;sfx.tap();
  if(ix===S.pos&&!away){S.stage=ix;save();drawMap();panel();return}
  if(ix!==was)setTarget(ix);
  if(S.mode==='bank'){const t0=performance.now();const step=t=>{tokenT=Math.min(1,(t-t0)/1700);setTok();if(tokenT<1)moveAnim=requestAnimationFrame(step);else{moveAnim=null;arrive()}};moveAnim=requestAnimationFrame(step)}
  else if(ix===was){if(S.mode==='binnen')say2('Nog niet. Je voeten brengen je erheen, niet je vinger.');else say2('Loop erheen. Het kompas wijst de weg.')}});
function say2(t){const p=$('#mpanel p');if(p)p.textContent=t}
function lockedRN(){return !!(window.MW&&MW.pro&&MW.pro.locked(GID))}
function payCard(then){const L=window.LANG==='en'?'en':'nl';$('#card').dataset.lock=1;card(`<div class="pay">${MW.proHTML(L,'pro',GID)}<p class="small c" style="color:#5a4a2a">De proefronde is voorbij: de eerste twee plekken zijn gratis.</p><button class="btn sec sm" id="payX">Terug</button></div>`);
  $('#payX').onclick=()=>{delete $('#card').dataset.lock;closeCard()};MW.bindPro($('#card'),L,(r,msg)=>{delete $('#card').dataset.lock;closeCard();if(then)then()})}
function arrive(){if(S.stage>=2&&lockedRN())return payCard(arrive);stopWalk();sfx.ok();S.pos=S.stage;away=false;if(STOPS[S.stage].x!=null){leftAt=S.pos;save();drawMap();panel();openStop();return}enterRoom()}
$('#mTest').onclick=()=>arrive();

/* binnen: stappen */
function toggleWalk(){if(walking){stopWalk();panel();return}walking=true;lastStep=0;let got=false;
  const start=()=>{const h=e=>{const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;got=true;const m=Math.hypot(a.x,a.y,a.z),now=Date.now();if(m>11.8&&armed&&now-lastStep>280){armed=false;lastStep=now;addSteps(1)}if(m<10.4)armed=true};stepSrc=h;window.addEventListener('devicemotion',h);
    setTimeout(()=>{if(walking&&!got){window.removeEventListener('devicemotion',h);stepSrc=null;const e=$('#psrc');if(e)e.textContent='Geen stappenteller op dit apparaat: we tellen in wandeltempo zolang "Ik loop" aan staat.';tempoInt=setInterval(()=>addSteps(.9),500)}},1800)};
  try{if(window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission){DeviceMotionEvent.requestPermission().then(start,start)}else start()}catch(e){start()}
  panel()}
function stopWalk(){walking=false;if(stepSrc){window.removeEventListener('devicemotion',stepSrc);stepSrc=null}clearInterval(tempoInt);tempoInt=null}
function addSteps(n){const need=LENS[S.lvl].binnen[S.len];S.steps+=n;tokenT=Math.min(1,S.steps/need);setTok();const b=$('#pbar'),t=$('#ptxt');if(b)b.style.width=tokenT*100+'%';if(t)t.textContent=Math.floor(S.steps)+' van '+need+' stappen';if(Math.floor(S.steps)%20===0)save();if(S.steps>=need){S.steps=need;save();arrive()}}

/* buiten: gps */
function startGeo(){if(watchId!=null)return;if(!navigator.geolocation){geoErr='Dit apparaat geeft geen gps door.';return}
  try{watchId=navigator.geolocation.watchPosition(p=>{pos={lat:p.coords.latitude,lon:p.coords.longitude,acc:p.coords.accuracy};geoErr='';if(!S.start){S.start={lat:pos.lat,lon:pos.lon};genRoute()}
    if(!$('#s-map').classList.contains('on'))return;drawMap();panel();const rad=Math.max(25,Math.min(pos.acc||0,45));if(leftAt!=null&&S.pts[leftAt]&&distM(pos,S.pts[leftAt])>rad+20){leftAt=null;away=true;if($('#s-map').classList.contains('on'))panel()}if(verleg)return;const tgt=S.pts[S.stage];if(tgt&&S.stage!==leftAt&&distM(pos,tgt)<rad)return arrive();for(let i=0;i<=S.open;i++)if(i!==leftAt&&i!==S.stage&&distM(pos,S.pts[i])<rad){S.stage=i;return arrive()}},
    e=>{geoErr='Het kompas vindt je plek niet. Sta gps toe voor deze pagina, of speel hier vanaf de bank. In de voorvertoning van Claude werkt gps niet; op je eigen site wel.';if($('#s-map').classList.contains('on'))panel()},{enableHighAccuracy:true,maximumAge:2000,timeout:15000})}catch(e){geoErr='Gps is hier niet beschikbaar.'}
  const oh=e=>{let h=null;if(e.webkitCompassHeading!=null)h=e.webkitCompassHeading;else if(e.absolute&&e.alpha!=null)h=360-e.alpha;if(h!=null){heading=h;const n=$('#needle g');if(n&&pos&&S.pts)n.setAttribute('transform',`rotate(${bearing(pos,S.pts[S.stage])-h})`)}};
  window.addEventListener('deviceorientationabsolute',oh);window.addEventListener('deviceorientation',oh)}
function stopGeo(){if(watchId!=null){try{navigator.geolocation.clearWatch(watchId)}catch(e){}watchId=null}}

/* ================= START ================= */
let selMode='bank',selLen=1,selLvl='kind';
$('#lvlseg').onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;selLvl=b.dataset.v;$$('#lvlseg button').forEach(x=>x.classList.toggle('on',x===b));drawSeg();sfx.tap()};
function drawSeg(){const s=$('#lenseg');if(selMode==='bank'){s.innerHTML='';return}const lab=selMode==='buiten'?(selLvl==='kind'?['± 400 m','± 700 m','± 1 km']:['± 1,5 km','± 2,5 km','± 4 km']):['Kort','Normaal','Lang'];s.innerHTML=lab.map((l,i)=>`<button class="${i===selLen?'on':''}" data-l="${i}">${l}</button>`).join('')}
$$('.mode').forEach(b=>b.onclick=()=>{selMode=b.dataset.m;$$('.mode').forEach(x=>x.classList.toggle('on',x===b));drawSeg();ac();sfx.tap()});
$('#lenseg').onclick=e=>{const b=e.target.closest('[data-l]');if(b){selLen=+b.dataset.l;drawSeg()}};
let ttlN=0;$('#ttl').onclick=()=>{if(++ttlN>=5&&!TEST){TEST=true;$('.tag').textContent='Testknoppen staan aan: sla kamers en lopen over met Test ⏭';}};
$('#bLang').onclick=()=>{const o=document.documentElement.getAttribute('data-other');if(o){location.href=o;return}const l=window.LANG==='en'?'nl':'en';try{localStorage.setItem('rn.lang',l)}catch(e){}location.hash=l;location.reload()};
$('#bSound').onclick=()=>{S.sound=!S.sound;$('#bSound').textContent='Geluid: '+(S.sound?'aan':'uit')};
function begin(){S.mode=selMode;S.len=selLen;S.lvl=selLvl;S.t0=Date.now();save();
  if(S.mode==='buiten'){try{if(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)DeviceOrientationEvent.requestPermission().catch(()=>{})}catch(e){}}
  $('#card').dataset.lock=1;
  card(`<div class="letter"><div class="tx"><p>Zoeker,</p><p>Dit kompas is niet kapot. Het wijst alleen niet naar het noorden. Het wijst naar mij.</p><p>In 1689 verstopte ik, <b>Rosse Neel</b>, mijn buit op zes plekken. Vijf bewaren een dubloen en een stuk van mijn kaart. De zesde bewaart de rest.</p><p>Elke plek zit op slot. Kijk rond. Tel. Luister. En kijk ook eens omhoog: goud ligt zelden op ooghoogte.</p><p style="text-align:right">R.N.</p></div><button class="btn" id="iGo">Volg het kompas</button></div>`);$('#card').classList.add('bare');
  $('#iGo').onclick=()=>{delete $('#card').dataset.lock;$('#card').classList.remove('bare');closeCard();S.intro=true;save();showMap()}}
$('#bStart').onclick=()=>{const snd=S.sound;S=fresh();S.sound=snd;ac();sfx.tap();begin()};
function resume(){if(S.fl.won)return showEnd();if(S.inRoom)enterRoom();else showMap()}
$('#bResume').onclick=()=>{ac();resume()};
$('#bNew').onclick=()=>{S=fresh();try{localStorage.removeItem(LS)}catch(e){}$('#resume').style.display='none';$('#setup').style.display=''};
(function init(){if(location.hash==='#test')TEST=true;if(lockedRN())$('#trial').style.display='';{const hb=document.documentElement.getAttribute('data-hub');if(hb){$('#bHub').href=hb;$('#bHub').style.display=''}}const L=load();S=L||fresh();if(!S.lvl)S.lvl='gezin';if(S.open==null){S.stage=Math.min(5,S.stage);S.open=S.stage;S.pos=S.inRoom?S.stage:S.stage-1}if(!S.v){const mp=[0,2,3,5,6,8];S.stage=mp[S.stage];S.open=mp[S.open];S.pos=S.pos<0?-1:mp[S.pos];if(S.pts&&S.pts.length===6){const o=S.pts,mid=(a,b)=>({lat:(a.lat+b.lat)/2,lon:(a.lon+b.lon)/2});S.pts=[o[0],mid(o[0],o[1]),o[1],o[2],mid(o[2],o[3]),o[3],o[4],mid(o[4],o[5]),o[5]]}S.v=2}if(L&&L.intro){$('#resume').style.display='';$('#setup').style.display='none'}drawSeg();upd()})();
