#!/usr/bin/env node
/* Maakt voor elk spel en elke taal de zinnenlijst voor de stemstudio: games/<spel>/voice/<taal>/script.js
   Draaien vanuit de map minimystery:   node _tools/stemscript.js            (alle spellen)
                                        node _tools/stemscript.js taart nl  (één spel)
   - Leest games/<spel>/data-<taal>.js, loopt alle teksten af, splitst ze in zinnen zoals shared/voice.js dat doet
     en geeft elke zin de sleutel die het spel bij het afspelen ook berekent.
   - Een bestaande script.js blijft leidend: wie/waar van bestaande zinnen worden bewaard, nieuwe zinnen komen erbij,
     zinnen die niet meer in de data staan krijgen een † voor hun onderdeel (de mp3 blijft werken).
   - Lijsten die ooit met de hand zijn samengesteld (pony, jacht, agent, spiegel) worden zonder spelnaam overgeslagen.
   - Per spel kun je hieronder in RULES aangeven: welke sleutels geen spraak zijn (knoppen, ids), wie wat zegt, en
     hoe {plaatshouders} ingevuld worden. Zonder regel: spreker "verteller", plaatshouder-zinnen worden overgeslagen
     (die blijven browserstem, want ze veranderen per spel). */
"use strict";
const fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,"..");
global.window={};global.document={addEventListener(){},createElement(){return{}}};global.localStorage={getItem(){return null},setItem(){}};
try{eval(fs.readFileSync(path.join(ROOT,"shared/voice.js"),"utf8"))}catch(e){}
const V=window.MMVoice;

/* Sleutels die nooit spraak zijn (ids, bestandsnamen, kleuren, knoppen) */
const SKIP_KEYS=/^(id|slug|img|image|src|file|files|url|href|kleur|color|colour|icon|emoji|cls|class|code|key|k|hex|font|lang|type|kind|ok|sec|x|y|lat|lng|lon|w|h|r|seed|v|ver|by|dir|map|photo|pic|audio|mp3|tag|tags|theme|aria|alt|href|href2|css|html)$/i;
/* Teksten die eruitzien als code of bestand */
const LOOKS_CODE=/^(#|\.|\/|https?:|www\.|[a-z0-9_-]+\.(webp|png|jpg|svg|mp3|js|html|css)$|[A-Z]{2,}-[A-Z0-9]{4,}$|[0-9a-f]{6}$)/;

const RULES={
 taart:{
  skip:["T","MISSIONS","ROLES","CV"],                  // knoppen, missiekaartjes en rolbeschrijvingen staan alleen op het scherm
  skipKeys:/^(name|short|kleurNaam|thing|strike|em|word|draw|label|a|o)$/,
  keep:[["T","freezeGo"],["T","freezeStop"]],     // maar deze twee spreekt het spel wel uit
  expand:{"{k}":["paars","groen","rood","geel","oranje","blauw","roze"],"{naam}":null,"{n}":null,"{s}":null,"{role}":null,"{timer}":null,"{strike}":null,"{p}":null,"{reveal}":null,"{alibi}":null,"{treat}":null},
  wie:(p,o)=>p[0]==="S"&&/^(truth|lie)$/.test(p[2])?o.id:"verteller",
  waar:(p,o)=>({S:p[2]==="truth"?"Verhoor – waarheid":p[2]==="lie"?"Verhoor – leugen":p[2]==="alibi"?"Alibi":p[2]==="reveal"?"Onthulling":"Verdachten",C:"Spoor",PC:"Plek-spoor",PLACES:"Plek-alibi",TASKS:"Opdracht: "+(o.t||""),STORY:"Verhaal",MISSIONS:"Geheime missies",ROLES:"Rollen",T:"Standbeeld"})[p[0]]||p[0]
 }
};

function listGames(){return fs.readdirSync(path.join(ROOT,"games")).filter(g=>fs.existsSync(path.join(ROOT,"games",g))&&fs.statSync(path.join(ROOT,"games",g)).isDirectory())}
function loadData(game,lang){const f=path.join(ROOT,"games",game,"data-"+lang+".js");if(!fs.existsSync(f))return null;
  window={};global.window=window;try{eval(fs.readFileSync(f,"utf8"))}catch(e){console.error("  kan "+f+" niet laden: "+e.message);return null}
  const k=Object.keys(window).find(x=>/_DATA$/.test(x))||Object.keys(window)[0];return window[k]||null}

function walk(obj,p,out,rule,parent){
  if(obj==null)return;
  if(typeof obj==="string"){const key=p[p.length-1];
    if(typeof key==="string"&&(SKIP_KEYS.test(key)||(rule.skipKeys&&rule.skipKeys.test(key))))return;
    const skipTop=rule.skip||[]; /* zonder regel wordt alles meegenomen; korte losse labels vallen verderop af */
    if(skipTop.includes(p[0])&&!(rule.keep||[]).some(k=>k.every((x,i)=>String(p[i])===String(x))))return;
    let t=obj.replace(/<[^>]+>/g," ").replace(/&[a-z]+;/g," ").trim();if(t.length<2||LOOKS_CODE.test(t))return;
    if(!/[A-Za-zÀ-ÿ]{2}/.test(t))return;
    const phs=t.match(/\{[^}]+\}/g)||[];let variants=[t];
    for(const ph of phs){const vals=(rule.expand&&rule.expand[ph])||["\u0007"]; /* zonder waarden: de zin met de plaatshouder vervalt straks, de rest blijft */
      variants=[].concat(...variants.map(v=>vals.map(x=>v.split(ph).join(x))))}
    variants.forEach(v=>out.push({t:v,p:p.slice(),o:parent}));return}
  if(Array.isArray(obj)){obj.forEach((x,i)=>walk(x,p.concat([i]),out,rule,typeof x==="object"&&x!==null?x:parent));return}
  if(typeof obj==="object"){for(const k of Object.keys(obj))walk(obj[k],p.concat([k]),out,rule,obj)}}

function waarOf(p,o,rule){if(rule.waar){try{const w=rule.waar(p,o);if(w)return w}catch(e){}}
  const title=o&&typeof o==="object"&&!Array.isArray(o)?["title","titel","t","name","naam","kop"].map(k=>o[k]).find(v=>typeof v==="string"&&v.length<60&&v!==undefined):null;
  return String(p[0])+(typeof p[1]==="number"?" "+(p[1]+1):"")+(title?" · "+title.replace(/<[^>]+>/g,"").trim():"")}
function wieOf(p,o,rule){if(rule.wie){try{const w=rule.wie(p,o);if(w)return w}catch(e){}}return "verteller"}

function build(game,lang,force){const D=loadData(game,lang);if(!D)return null;const rule=RULES[game]||{};
  const raw=[];walk(D,[],raw,rule,D);
  const out=[],seen={};
  raw.forEach(r=>{V.split(r.t).forEach(s=>{if(s.indexOf("\u0007")>=0)return;if(!/\s/.test(s.trim())&&!/[.!?…]$/.test(s.trim()))return;const k=V.key(s);if(seen[k])return;seen[k]=1;out.push({k,wie:wieOf(r.p,r.o,rule),waar:waarOf(r.p,r.o,rule),t:s})})});
  const dir=path.join(ROOT,"games",game,"voice",lang),f=path.join(dir,"script.js"),set=game+"_"+lang;
  let old=[];if(fs.existsSync(f)){const src=fs.readFileSync(f,"utf8");if(src.indexOf("stemscript.js")<0&&!force){return{skipped:true}} /* met de hand samengestelde lijst: alleen bijwerken als het spel met naam wordt opgegeven */
    window={};global.window=window;try{eval(src);old=(window.MMV_SCRIPT||{})[set]||[]}catch(e){}}
  const oldBy={};old.forEach(o=>oldBy[o.k]=o);
  const merged=out.map(o=>oldBy[o.k]?Object.assign({},o,{wie:oldBy[o.k].wie,waar:oldBy[o.k].waar}):o);
  /* bewaar de volgorde van de oude lijst voor zinnen die er al waren, nieuwe erachter per onderdeel */
  /* oude zinnen die niet meer in de data staan blijven in de lijst (er kan een opname van zijn), met een merkteken */
  const kept=old.map(o=>seen[o.k]?merged.find(m=>m.k===o.k):Object.assign({},o,{waar:/^†/.test(o.waar)?o.waar:"† "+o.waar})),extra=merged.filter(m=>!oldBy[m.k]);
  const list=old.length?kept.concat(extra):merged;
  const n=list.length,added=extra.length,gone=old.filter(o=>!seen[o.k]).length;
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(f,"/* Alle vaste zinnen die dit spel kan uitspreken ("+n+"). Gemaakt door _tools/stemscript.js uit data-"+lang+".js; k = sleutel uit shared/voice.js. Niet met de hand bewerken: draai het gereedschap opnieuw. */\nwindow.MMV_SCRIPT=window.MMV_SCRIPT||{};window.MMV_SCRIPT[\""+set+"\"]=[\n"+list.map(o=>JSON.stringify(o)).join(",\n")+"\n];\n");
  const idx=path.join(dir,"index.js");if(!fs.existsSync(idx))fs.writeFileSync(idx,"/* Opnames van "+set+": sleutel → bestand. Wordt gemaakt door stemstudio.html. */\nwindow.MMV_HAVE=window.MMV_HAVE||{};window.MMV_HAVE[\""+set+"\"]={};\n");
  return{n,added,gone,chars:list.reduce((a,o)=>a+o.t.length,0)}}

const argGame=process.argv[2],argLang=process.argv[3];
const games=argGame?[argGame]:listGames();
games.forEach(g=>{(argLang?[argLang]:["nl","en"]).forEach(l=>{const r=build(g,l,!!argGame);if(r&&r.skipped)console.log((g+"_"+l).padEnd(14)+"  met de hand samengesteld, overgeslagen (geef het spel op om bij te werken)");else if(r)console.log((g+"_"+l).padEnd(14)+String(r.n).padStart(4)+" zinnen  "+String(r.chars).padStart(6)+" tekens  +"+r.added+(r.gone?"  –"+r.gone:""))})});
