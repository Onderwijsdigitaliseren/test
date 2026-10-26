// Maakt games/pony/voice/<taal>/script.js: alle zinnen die Pony Pluis kan uitspreken, met wie het zegt en waar.
// Opnieuw draaien na tekstwijzigingen in data-nl.js / data-en.js:  node games/pony/voice/maak-lijst.js . nl   (vanuit de minimystery-map)
var fs=require("fs"),path=require("path"),R=process.argv[2],lang=process.argv[3];
global.window={};global.document={};
eval(fs.readFileSync(path.join(R,"shared/voice.js"),"utf8"));
eval(fs.readFileSync(path.join(R,"games/pony/data-"+lang+".js"),"utf8"));
var V=window.MMVoice,D=window.PP_DATA,T=D.T,out=[],seen={};
function fill(t,o){return String(t).replace(/\{(\w+)\}/g,function(m,k){return o[k]!=null?o[k]:m})}
// voeg toe: tekst (mag placeholders hebben), wie, waar, vars = {naam:[waarden]}
function add(t,wie,waar,vars){if(!t)return;vars=vars||{};
  // eerst per zin splitsen op het sjabloon, dan per zin alleen de eigen placeholders uitvouwen
  var tpl=String(t).replace(/:\s+(?=[“"„])/g,":\n").replace(/([.!?]+[”"»]?)\s+/g,"$1\n").split("\n");
  tpl.forEach(function(st){var ks=(st.match(/\{(\w+)\}/g)||[]).map(function(m){return m.slice(1,-1)}).filter(function(k){return vars[k]});
    var combos=[{}];ks.forEach(function(k){var nx=[];combos.forEach(function(c){vars[k].forEach(function(v){var o=Object.assign({},c);o[k]=v;nx.push(o)})});combos=nx});
    combos.forEach(function(c){V.split(fill(st,c)).forEach(function(z){var k=V.key(z);if(seen[k])return;seen[k]=1;out.push({k:k,wie:wie,waar:waar,t:z})})})})}
var digits=["0","1","2","3","4","5","6","7","8","9"];
var SUSN=D.SUS.map(function(s){return s[0]});
// intro
T.cine.forEach(function(l){add(l,/“/.test(l)?"fenna":"verteller","Intro")});
add(fill(D.OPEN,{C:D.CADEAU0}),"fenna","Opening (Fenna belt)");
add(T.voiceOn,"verteller","Voorlezen aan");
add(T.teamT,"verteller","Clubfoto");add(T.arrestT,"verteller","Foto met Pluis");
// sporen: opdracht
Object.keys(D.PUZ).forEach(function(a){add(D.PUZ[a][1],"fenna","Opdracht: "+T.kinds[a]);add(T.pz[a][1],"verteller","Uitleg puzzel: "+T.kinds[a])});
// puzzel-zinnen
add(T.pz.pick,"verteller","Puzzel");add(T.pz.star,"verteller","Puzzel roskam");add(T.pz.purrOk,"verteller","Puzzel Kato");
T.pz.cols.forEach(function(c){add(c,"verteller","Puzzel kleuren")});
Object.keys(T.pz.snd).forEach(function(a){add(T.pz.snd[a],"dieren","Puzzel geluiden ("+T.pz.anim[a]+")")});
// na een spoor: reactie, hoefijzer, soort spoor
Object.keys(D.PUZ).forEach(function(a){add(D.PUZ[a][2],"fenna","Na de puzzel: "+T.kinds[a])});
add(T.balloon,"verteller","Hoefijzer",{d:digits});
[T.ev,T.exH,T.wit,T.gag].forEach(function(h){add(h+".","verteller","Soort spoor")});
D.WITS.forEach(function(w){add(w[0]+":","verteller","Naam van het dier")});
// bewijs
Object.keys(D.EV).forEach(function(k){D.EV[k].forEach(function(p){p.forEach(function(t){add(t,"fenna","Bewijs ("+D.AT[k].n+")")})})});
// getuigen
Object.keys(D.WIT).forEach(function(k){D.WIT[k].forEach(function(t){add(t,"dieren","Een dier zegt ("+D.AT[k].n+")",{v:D.AT[k].v})})});
D.GAG.forEach(function(t){add(t,"fenna","Berichtje van Fenna")});
D.EX.forEach(function(t){add(t,"fenna","Plek wegstrepen (Lang)",{P:SUSN})});
D.CLIFF.forEach(function(t){add(t,"verteller","Cliffhanger")});add(D.CLIFFLAST,"verteller","Cliffhanger laatste");
// onderweg
D.VISIT.forEach(function(v){add(v[1],v[0]==="fenna"?"fenna":"dieren","Dier duikt op")});
D.POSE.forEach(function(t){add(t,"verteller","Fotomoment")});
add(T.kv.glimpse,"verteller","Glimp van Pluis");add(T.kv.glimpseYes,"verteller","Glimp van Pluis",{n:["1","2","3"]});add(T.kv.glimpseAll,"verteller","Glimp van Pluis");
// finale
add(T.radarAll,"verteller","Alle sporen");add(T.radarLock,"verteller","Alle sporen");
add(D.TWIST,"karel","Het slot (Karel)");add(D.TWIST2,"fenna","Het slot (Fenna)");
add(T.lockT,"verteller","Het slot");add(T.lockT2,"verteller","Het slot");add(T.lockBad,"verteller","Het slot");
add(T.gerdaQ,"verteller","Achter het hek");add(T.gerdaA,"verteller","Achter het hek");add(D.GERDA,"gerda","Achter het hek (Gerda)");
add(T.acT,"verteller","Waar is Pluis?");add(T.lineHint,"verteller","Waar is Pluis?");add(T.lineNo,"verteller","Waar is Pluis?");add(T.lineYes,"verteller","Waar is Pluis?");
T.finCine.forEach(function(l){add(l,"verteller","Eindfilmpje")});
add(D.END,"kato","Het geheim (Kato)",{P:SUSN,PV:D.AT.vlag.v,PD:D.AT.dier.v,PE:D.AT.voer.v});
add(D.END2,"verteller","Slot");add(D.ENDAT,"fenna","Slot: Pluis mee");add(D.ENDBT,"fenna","Slot: Bibi logeert");
var js="/* Alle zinnen die "+(lang==="nl"?"Het Geheim van Pony Pluis":"The Secret of Pony Fluff")+" kan uitspreken ("+out.length+"). Gemaakt uit data-"+lang+".js; k = sleutel uit shared/voice.js. Niet met de hand bewerken. */\n"+
  "window.MMV_SCRIPT=window.MMV_SCRIPT||{};window.MMV_SCRIPT[\"pony_"+lang+"\"]=[\n"+out.map(function(o){return JSON.stringify(o)}).join(",\n")+"\n];\n";
var dir=path.join(R,"games/pony/voice",lang);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"script.js"),js);
if(!fs.existsSync(path.join(dir,"index.js")))fs.writeFileSync(path.join(dir,"index.js"),"/* Opnames van pony_"+lang+": sleutel → bestand. Wordt gemaakt door stemstudio.html. */\nwindow.MMV_HAVE=window.MMV_HAVE||{};window.MMV_HAVE[\"pony_"+lang+"\"]={};\n");
var by={};out.forEach(function(o){by[o.wie]=(by[o.wie]||0)+1});
console.log(lang,out.length,"zinnen",JSON.stringify(by),out.reduce(function(a,o){return a+o.t.length},0),"tekens");
