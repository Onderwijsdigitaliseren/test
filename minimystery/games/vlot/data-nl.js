/* De Sommensprint – MiniMystery Educatie (automatiseren, groep 3–8). Teksten en oefenplekken (NL).
   Herzien op 23 nov 2026 na Kellies test: veel minder leestekst, geen mistverhaal, de nadruk op oefenen.
   Verhaal in twee zinnen: de fiets van meneer Tik zit op slot; elke plek geeft één getal van de code.
   Elke plek: één korte regel (kort[niveau]) → ronde 1 typen → even bewegen (doe) → ronde 2 goed of fout → ronde 3 kiezen → sterren → getal.
   Een foute som komt terug tot hij goed is. In ronde 3 komen twee sommen van de vorige plek terug.
   Alleen op het begeleidersblad: de uitgebreide truc (truc), het beweegidee (act), het weetje (tip) en de napraatvragen (more).
   Klokkijken zit hier bewust niet in: dat krijgt een eigen wandeling.
   Niveaus: 0 = groep 3–4, 1 = groep 5–6, 2 = groep 7–8. fl[niveau](r) maakt één som of woordkeuze uit het toeval r. */
window.VM_DATA=(function(){
var T={
  today:"Start de zaak van vandaag",extra:"Extra zaak",voice:"Voorlezen",voiceOn:"Voorlezen staat aan",voiceOff:"Voorlezen staat uit",
  start:"Open de plek",next:"Verder ▸",back:"Terug",close:"Sluiten",cancel:"Annuleren",ok:"Controleer ▸",listen:"Voorlezen",
  loc:"Waar zijn jullie? De telefoon vraagt om je locatie.",pois:"Juf Noor zoekt plekken in de buurt…",nomap:"De kaartdienst is druk. We spelen op een getekende plattegrond.",
  noGps:"Deze telefoon heeft geen gps.",denied:"De locatie staat uit. Zet hem aan in de instellingen, of speel zonder kaart.",fail:"Dat lukte niet",
  corner:"Hoek",task:"Plek {i} van {n}",clue:"Getal {n} van {t}",
  near:"Volgende plek op {d} m",warm:"Warm! Nog {d} m",hot:"Heet! Hier is een plek",radarAll:"Alle getallen! Maak het slot open.",
  here:"Hier is een plek",look:"Open de plek",walk:"Loop erheen",gps:"We staan er echt (gps twijfelt)",
  notebook:"Scorekaart",nbK:"Jullie getallen",nbM:"Jullie sterren",nbNone:"Nog niets. Loop naar de eerste plek.",
  menu:"Menu",mBack:"Terug naar de zaak",mHome:"Pauze, later verder",mWipe:"Deze zaak wissen",mLead:"Begeleidersblad",saved:"Opgeslagen. Je kunt later verdergaan.",
  wipe:"Wissen",wipeY:"Deze zaak wissen",wipeAll:"Alles wissen (ook het archief)",wipeQ:"Zaak wissen?",wipeT:"De voortgang is dan weg.",allQ:"Alles wissen?",allT:"Zaak, archief en instellingen worden gewist.",allY:"Ja, alles wissen",wiped:"Gewist",
  dH:"Zaakcode invullen",dT:"Met een zaakcode spelen meer telefoons dezelfde zaak: dezelfde plekken en dezelfde sommen. Elke klas of groep krijgt zo één zaak voor alle teams.",dGo:"Zaak ophalen",dBad:"Die code kennen we niet. Codes beginnen met VM.",
  demoCase:"Proefronde · getekende stad",demoTip:"Tik op een plek op de kaart: jullie groepje loopt er vanzelf heen.",
  howH:"Hoe werkt het?",
  won:"Het slot is open",dipBtn:"Diploma (A4)",dipH:"Diploma Sommensprinter",dipNote:"Printen of opslaan. Eén per team, of print er voor elk kind een.",leadBtn:"Begeleidersblad",home:"Naar het begin",dl:"Opslaan",shareBtn:"Delen",copied:"Gekopieerd",
  shareTxt:"Wij hebben het fietsslot van meneer Tik open! Zaak {c} · {s} · {m} min. ",missed1:"Oefen nog eens voor drie sterren.",
  pzT:"Overleg samen. Eén iemand typt.",wrong:"Nog niet goed. Reken nog eens samen.",wrongHint:"Nog niet goed. Pak de hint, of reken nog eens samen.",hintBtn:"💡 Lees de truc nog eens",hintUsed:"Truc bekeken",
  countGo:"Ingevuld ▸",photoGo:"📷 Maak de foto",photoAgain:"Nog een keer",photoOk:"Dit is hem! ▸",photoKeep:"De foto blijft op deze telefoon.",
  keyGet:"Jullie getal:",tipH:"Wist je dat…",
  finH:"Het slot",finT:"Zet de getallen van klein naar groot. Dan gaat het slot open.",finT0:"Tik eerst het kleinste getal. Dan het volgende.",finBad:"Nee, die nog niet. Begin opnieuw.",finHint:"Begin bij het kleinste getal.",finHint0:"Begin bij het kleinste getal.",finNot:"Eerst alle plekken doen. Nog {n} te gaan.",finOk:"Klik! Het slot is open!",
  stripT:"Zaak {c}",keysBar:"Getallen",
  gbH:"In het gebouw",gbT:"Kies de plekken in jullie school. De begeleider hangt op elke plek een kaartje met een code (printen via het begeleidersblad). Teams gaan naar de plek en typen de code.",gbNoCards:"Zonder kaartjes (teams drukken zelf op 'We zijn er')",gbGo:"Zaak starten",gbMin:"Kies minstens {n} plekken (of de plekken worden herhaald).",
  gbGoto:"Ga naar:",gbCode:"Typ de code van het kaartje op die plek",gbHere:"We zijn er ▸",gbBad:"Die code hoort niet bij deze plek. Kijk nog eens op het kaartje.",gbCards:"Plekkaartjes (ophangen)",gbCardT:"Oefenplek",
  leadH:"Begeleidersblad",leadT:"Alleen voor de begeleider. Dit blad hoort bij deze zaakcode: alle teams met deze code krijgen dezelfde plekken en dezelfde sommen.",leadTeams:"Teamstand (zelf bijhouden)",leadTeam:"Team",leadDone:"Klaar om",leadPrint:"Printen",leadCode:"Zaakcode",
  lvl:["groep 3–4","groep 5–6","groep 7–8"],
  nw:{6:"zes",8:"acht",10:"tien"},
  /* rondes */
  trucH:"Zo doe je het",actH:"Extra beweegidee",
  rd:["Typ het antwoord","Goed of fout?","Kies het goede antwoord"],rdN:"Ronde {k} van 3",
  flGo:"▶ Start",flAgain:"↻ Nog een keer",flRevTag:"🔁 van de vorige plek",flBack:"↩ nog een keer",flWas:"Het is",
  flYes:"Goed",flNo:"Fout",doeH:"Even bewegen!",doeGo:"Gedaan ▸",
  flDone:"Klaar!",flScore:"{g} van de {n} in één keer goed",flDel:"wis",flEnter:"OK",flLead:"De sommen (ronde 1, 2 en 3)",flLeadRev:"in ronde 3 komen er twee van de vorige plek bij",leadDoe:"Bewegen tussendoor",leadTalk:"Napraten (klassikaal)",
  kv:{fp:["Fietsenstalling","Bushalte","Speeltuin","Schoolplein","Brug","Park","Kerk","Plein","Winkel","Brievenbus","Kiosk","Bankje"],
    all:"Alle getallen! Maak het slot open.",near:"Plek op {d} m",cold:"Koud… loop een andere kant op",cool:"Lauw. Dichterbij komt-ie",warm:"Warm! Goed zo!",hot:"HEET! Kijk om je heen!",here:"Hier is de plek!",first:"Loop maar, het kompas wijst de weg",noDir:"Loop een stukje, dan weet het kompas de richting",
    map:"Plattegrond",kids:"Verhaalkaart",mapTip:"De echte plattegrond. Tik op Verhaalkaart voor de kindertekening.",goDemo:"We lopen (nep) naar {p}…",inSteps:"Nog {n} stappen",
    mNoMap:"Verder zonder kaart (zelfde zaak)",switched:"Verder zonder kaart. Dezelfde zaak, dezelfde plekken.",virtOut:"Geen plattegrond van de buurt gevonden. Jullie lopen op de verhaalkaart: de pijl en warm/koud wijzen de weg.",
    noMapQ:"Geen locatie vandaag?",noMapT:"De telefoon geeft geen locatie door. Jullie kunnen dezelfde zaak zonder kaart spelen: de plekken komen dan achter elkaar en jullie lopen zelf naar een nieuwe plek.",noMapGo:"Verder zonder kaart",
    inH:"Binnen: lopen op de plaats",inT:"Jullie lopen op de verhaalkaart. Loop op de plaats (of door de ruimte) met de telefoon in je hand; elke stap telt. Lukt dat niet, dan lopen de stappen vanzelf.",inSensor:"Echte stappen tellen",inTempo:"Stappen lopen vanzelf",inNoSensor:"Geen bewegingssensor gevonden. De stappen lopen nu vanzelf."}
};
var TYPES={kerk:"de kerk",hotel:"het hotel",bank:"de bank",apotheek:"de apotheek",cafe:"het café",bieb:"de bibliotheek",park:"het park",school:"de school",kunst:"het kunstwerk",tank:"het tankstation",winkel:"de winkel",halte:"de bushalte",post:"de brievenbus",bankje:"het bankje",hoek:"de hoek"};
var TIK="Meneer Tik",NOOR="Juf Noor";
var ROOMS=["De hal bij de ingang","De aula","De gymzaal","De bibliotheek of leeshoek","De trap","Bij de lerarenkamer","De keuken","Het schoolplein","Een kleuterlokaal","Een bovenbouwlokaal","Bij de directiekamer","De fietsenstalling","Het speellokaal","De kapstokken"];
var OPEN={
  school:"De fiets van meneer Tik zit op slot. En hij is de code kwijt! Op {N} plekken oefenen jullie sommen. Elke plek geeft één getal van de code. Alle getallen? Dan gaat het slot open.",
  bso:"De fiets van meneer Tik zit op slot. En hij is de code kwijt! Op {N} plekken oefenen jullie sommen. Elke plek geeft één getal van de code. Alle getallen? Dan gaat het slot open."
};
var OPEN0={
  school:"De fiets van meneer Tik zit op slot. Hij is de code kwijt! Jullie gaan sommen oefenen. Elke plek geeft een getal. Met alle getallen gaat het slot open.",
  bso:"De fiets van meneer Tik zit op slot. Hij is de code kwijt! Jullie gaan sommen oefenen. Elke plek geeft een getal. Met alle getallen gaat het slot open."
};
var CLIFF=["Goed zo!"];
var CLIFFLAST="Alle getallen! Nu het slot.";
var REVEAL={
  school:"<p>Klik! Het slot springt open. Meneer Tik stapt op zijn fiets. \"Dank jullie wel!\" roept hij.</p><p>\"Zien jullie?\" zegt juf Noor. \"Elke dag even oefenen, en het gaat vanzelf.\"</p>",
  bso:"<p>Klik! Het slot springt open. Meneer Tik stapt op zijn fiets. \"Dank jullie wel!\" roept hij.</p><p>\"Knap gedaan,\" zegt juf Noor. \"Morgen weer?\"</p>"
};
var REVEAL0={
  school:"<p>Klik! Het slot is open. Meneer Tik fietst weg. \"Dank jullie wel!\" Knap gedaan!</p>",
  bso:"<p>Klik! Het slot is open. Meneer Tik fietst weg. \"Dank jullie wel!\" Knap gedaan!</p>"
};
/* de getallen van het slot zijn een tafelrij, per niveau */
var TAFELS=[[2,5,10],[3,4,6,7,8,9],[11,12,15,25]];

/* ---------- gereedschap voor de sommen ---------- */
var ri=function(r,a,b){return a+Math.floor(r()*(b-a+1))},pk=function(r,a){return a[Math.floor(r()*a.length)]};
var fmt=function(v){return String(parseFloat((+v).toFixed(4))).replace(".",",")};
var N=function(q,a){return{q:q,a:typeof a==="string"?a:fmt(a).replace("-","−")}};
var C=function(q,good,bad){return{q:q,c:[good,bad]}};
var W0=[["🌳","boom","bom"],["🐟","vis","fis"],["🏠","huis","huiz"],["🚲","fiets","fits"],["🐱","kat","kad"],["🌙","maan","man"],["🐻","beer","ber"],["☀️","zon","son"],["🔥","vuur","vur"],["🧀","kaas","kas"],["📚","boek","bouk"],["🐭","muis","mijs"],["🦊","vos","fos"],["🚪","deur","duer"],["🪑","stoel","stol"],["👃","neus","nuis"],["🧦","sok","sog"],["🚂","trein","trijn"],["🧊","ijs","eis"],["🥚","ei","ij"],["🐷","big","bik"],["🌧️","regen","reegen"],["🍎","appel","apel"],["🦆","eend","eent"],["🐴","paard","paart"],["🛏️","bed","bet"],["🥛","melk","mellek"],["🏫","school","sgool"]];
var W1=[["bomen","boomen"],["katten","katen"],["lopen","loopen"],["bakker","baker"],["appels","apels"],["straten","straaten"],["bellen","belen"],["vuren","vuuren"],["muren","muuren"],["bussen","busen"],["stenen","steenen"],["ramen","raamen"],["brillen","brilen"],["trein","trijn"],["klein","klijn"],["blauw","blouw"],["koud","kaud"],["paard","paart"],["hond","hont"],["feest","veest"],["zwemmen","zwemen"],["spelen","speelen"],["jassen","jasen"],["vogels","voogels"],["tafel","taffel"],["kussen","kusen"],["lezen","leezen"],["geit","gijt"],["prijs","preis"],["vrouw","vrauw"],["pauw","pouw"],["strand","strant"],["web","wep"],["dieren","diren"]];
var W2=[["Hij … morgen tien jaar.","wordt","word"],["Ik … later piloot.","word","wordt"],["Het is gisteren …","gebeurd","gebeurt"],["Wat … er nu?","gebeurt","gebeurd"],["Zij … de bal mooi.","vindt","vind"],["Ik … het een goed plan.","vind","vindt"],["… jij het ook leuk?","Vind","Vindt"],["Hij heeft hard …","gewerkt","gewerkd"],["Wij hebben een uur …","gefietst","gefietsd"],["De juf … gisteren een verhaal.","vertelde","verteldde"],["Ik … gisteren naar huis.","fietste","fietsde"],["Hij … gisteren zijn hand.","brandde","brande"],["Het … nu hard.","regent","regend"],["Opa is vorig jaar …","verhuisd","verhuist"],["De hond … hard.","blaft","blafd"],["Ik heb het …","beloofd","belooft"],["Hij … het elke keer.","belooft","beloofd"],["Jij … veel te hard.","rijdt","rijd"],["… jij ook zo hard?","Rijd","Rijdt"],["Zij … haar huiswerk.","maakt","maakd"],["Gisteren … ik mijn sleutels.","zocht","zogt"],["De bakker … elke dag brood.","bakt","bakd"],["Ik heb de deur …","geverfd","geverft"],["Hij … gisteren een uur.","wachtte","wachte"],["Het is mij niet …","gelukt","gelukd"],["Zij … altijd haar best.","doet","doed"],["Wie … de rekening?","betaalt","betaald"],["De rekening is al …","betaald","betaalt"],["Ik … je morgen.","bel","belt"],["Hij … mij elke dag.","antwoordt","antwoord"]];
var BPK=[["1/2","50","0,5"],["1/4","25","0,25"],["3/4","75","0,75"],["1/5","20","0,2"],["1/10","10","0,1"],["2/5","40","0,4"],["3/5","60","0,6"],["4/5","80","0,8"],["1/20","5","0,05"],["3/10","30","0,3"],["1/100","1","0,01"],["1/8","12,5","0,125"]];
var fl=function(h0,h1,h2){return[{kind:"flits",hint:h0},{kind:"flits",hint:h1},{kind:"flits",hint:h2}]};

var S=[
{id:"splits",ico:"💛",dom:"splitsen",title:"Samen tien",
 truc:["De verliefde harten zijn altijd samen 10: 1 en 9, 2 en 8, 3 en 7, 4 en 6, 5 en 5. Steek tien vingers op en vouw er een paar om: wat je ziet en wat weg is, zijn samen 10.",
       "De vriendjes van 10 werken ook voor 100: 30 en 70 zijn samen 100. Bij 35 + … = 100 vul je eerst aan tot het tiental (35 + 5 = 40) en dan tot 100 (40 + 60). Samen 65.",
       "Aanvullen in twee sprongen werkt altijd: bij 1000 − 375 ga je van 375 naar 400 (25) en van 400 naar 1000 (600). Bij kommagetallen net zo: 0,35 naar 0,4 is 0,05 en dan naar 1 is 0,6. Samen 0,65."],
 act:{out:"Zoek tien dingen op een rij: tegels, spijlen van een hek, of leg tien steentjes neer. Eén kind springt naar een tegel en roept het getal. De rest roept zo snel mogelijk het vriendje: hoeveel tegels zijn er nog tot 10? Wissel vijf keer.",in:"Ga in een kring staan. Eén kind steekt een aantal vingers op. De rest steekt zo snel mogelijk het vriendje op, zodat het samen 10 is. Wissel vijf keer."},
 fl:[function(r){var t=r()<.7?10:ri(r,5,9),a=ri(r,0,t);return N(t+" = "+a+" + …",t-a)},
     function(r){var a=r()<.5?ri(r,1,19)*5:ri(r,11,89);return N("100 = "+a+" + …",100-a)},
     function(r){if(r()<.5){var a=ri(r,1,39)*25;return N("1000 = "+a+" + …",1000-a)}var x=ri(r,1,19)*5;return N("1 = "+fmt(x/100)+" + …",(100-x)/100)}],
 lvl:fl("De verliefde harten: 1 en 9, 2 en 8, 3 en 7, 4 en 6, 5 en 5.","Eerst naar het tiental, dan naar 100.","Vul aan in twee sprongen: eerst naar het ronde getal, dan naar het eind."),
 tip:["Je tien vingers zijn je eerste rekenmachine. Daarom tellen we in tientallen.","Een kassamedewerker telt wisselgeld vaak op deze manier terug: aanvullen vanaf de prijs tot wat je gaf.","Computers trekken niet af zoals wij: ze tellen het 'aanvulgetal' erbij op. Aanvullen is dus ook voor een chip de snelste weg."],
 more:[
  [["7 en hoeveel is samen 10?",["3","4"],"7 en 3 zijn verliefde harten. Die blijven altijd bij elkaar."],
   ["Je weet 6 + 4 = 10. Hoeveel is dan 4 + 6?",["ook 10","9"],"Je mag de getallen omdraaien. Zo ken je met één som er meteen twee."]],
  [["Je weet 3 + 7 = 10. Welke som weet je dan ook meteen?",["30 + 70 = 100","3 + 70 = 100","33 + 77 = 100"],"Wat geldt voor eenheden, geldt ook voor tientallen. Eén weetje, twee keer gebruikt."],
   ["Waarom is splitsen handig bij 8 + 6?",["Je splitst 6 in 2 en 4: eerst naar 10, dan 4 erbij","Je telt 6 keer 1 erbij","Je draait de som om"],"8 + 2 = 10 en dan nog 4: 14. Dat heet rekenen via het tiental, en het lukt alleen vlot als je de splitsingen kent."]],
  [["Je betaalt € 6,35 met een briefje van € 10. Hoe reken je het wisselgeld het snelst uit?",["Aanvullen: 6,35 → 7 → 10","Onder elkaar zetten en lenen","Schatten is genoeg"],"65 cent naar 7 euro en dan 3 euro naar 10: € 3,65. Aanvullen is minder foutgevoelig dan lenen."],
   ["Welke twee procenten zijn samen altijd het geheel?",["Bijvoorbeeld 35% en 65%","Bijvoorbeeld 35% en 75%","Bijvoorbeeld 50% en 100%"],"Procenten zijn splitsingen van 100. Is 35% op, dan is er 65% over."]]]},
{id:"dubbel",ico:"👯",dom:"dubbelen en halveren",title:"Dubbel en de helft",
 truc:["Dubbel is twee keer hetzelfde. Kijk naar je handen: 5 vingers en nog eens 5 is 10. De helft is eerlijk delen met z'n tweeën. Ken je 4 + 4 = 8, dan weet je ook: de helft van 8 is 4.",
       "Dubbel een groot getal in stukjes: het dubbele van 35 is het dubbele van 30 (60) plus het dubbele van 5 (10): 70. Halveren gaat net zo: de helft van 70 is 30 + 5.",
       "Dubbelen en halveren maakt lastige sommen makkelijk: 16 × 25 is hetzelfde als 8 × 50 en als 4 × 100. Halveer de ene kant, verdubbel de andere."],
 act:{out:"Zoek iets met een spiegelbeeld: ramen links en rechts van een deur, twee rijen fietsen, je eigen schaduw. Eén kind doet een aantal sprongen, de rest doet precies het dubbele. Daarna andersom: de rest doet de helft.",in:"Sta tegenover elkaar als spiegels. Eén kind klapt een aantal keer, de ander klapt het dubbele. Wissel, en doe het daarna met de helft."},
 fl:[function(r){var a=ri(r,1,10);return r()<.6?N("dubbel van "+a,2*a):N("helft van "+2*a,a)},
     function(r){if(r()<.5){var a=ri(r,11,50);return N("dubbel van "+a,2*a)}var b=ri(r,10,50)*2;return N("helft van "+b,b/2)},
     function(r){var k=ri(r,0,3);if(k===0){var a=ri(r,3,19)*25;return N("dubbel van "+a,2*a)}if(k===1){var b=ri(r,11,49);return N("dubbel van "+fmt(b/10),b/5)}if(k===2){var c=ri(r,11,99)*10;return N("helft van "+c,c/2)}var d=ri(r,6,49);return N("helft van "+fmt(d/5),d/10)}],
 lvl:fl("Dubbel is twee keer hetzelfde. Gebruik je handen.","Dubbel eerst de tientallen, dan de eenheden.","Splits het getal: dubbel of halveer elk stuk apart."),
 tip:["Een vlinder is dubbel: de linkervleugel is precies de rechtervleugel in de spiegel.","Een vel papier dat je 7 keer dubbelvouwt, is al 128 lagen dik.","Verdubbel een rijstkorrel op elk vakje van een schaakbord en je hebt aan het eind meer rijst dan er op aarde groeit. Dat heet exponentiële groei."],
 more:[
  [["Je weet 6 + 6 = 12. Hoeveel is 6 + 7?",["13","12"],"6 + 7 is bijna dubbel: één meer dan 6 + 6."],
   ["Kun je 7 koekjes eerlijk delen met z'n tweeën zonder er één te breken?",["nee","ja"],"7 is oneven. Even getallen kun je halveren, bij oneven blijft er één over."]],
  [["Je weet 7 + 7 = 14. Hoe reken je 7 + 8 snel uit?",["14 + 1","14 + 8","7 + 7 + 7"],"Bijna-dubbelen: 7 + 8 is één meer dan 7 + 7. Zo zijn de lastigste sommen tot 20 ineens makkelijk."],
   ["Hoe reken je 4 × 15 handig met dubbelen?",["Dubbel 15 is 30, dubbel 30 is 60","15 + 4","Dubbel 4 is 8"],"Keer 4 is twee keer verdubbelen. Keer 8 is drie keer verdubbelen."]],
  [["Wat is 12 × 50, slim uitgerekend?",["6 × 100 = 600","12 × 5 = 60","10 × 50 + 50 = 550"],"Halveer de 12, verdubbel de 50. Het product blijft gelijk."],
   ["Delen door 4 kun je doen door…",["twee keer te halveren","te halveren en dan te verdubbelen","er 4 af te trekken"],"De helft van de helft is een kwart. 360 : 4 is 180 en dan 90."]]]},
{id:"tien",ico:"🌉",dom:"optellen",title:"Over de tien",
 truc:["Bij 8 + 5 maak je eerst 10: 8 + 2 = 10. Van de 5 heb je er nu 2 gebruikt, er zijn er nog 3. Dus 10 + 3 = 13. Eerst vol maken, dan de rest.",
       "Bij 47 + 8 spring je eerst naar het tiental: 47 + 3 = 50, dan nog 5 erbij: 55. Eraf gaat net zo: 63 − 7 is 63 − 3 = 60 en dan nog 4 eraf: 56.",
       "Bij 398 + 25 is 398 bijna 400. Reken 400 + 25 = 425 en haal de 2 die je te veel nam er weer af: 423. Dat heet compenseren."],
 act:{out:"Zoek een streep, een stoeprand of een lijn op het plein: dat is de tien. Eén kind roept een som, bijvoorbeeld 8 + 5. Spring eerst tot op de streep (hoeveel sprongen?) en dan de rest erachteraan. Roep het antwoord als je landt.",in:"Leg een touw of een jas op de grond: dat is de tien. Eén kind roept een som. Stap eerst tot aan het touw en dan de rest erachteraan. Roep het antwoord."},
 fl:[function(r){var a=ri(r,6,9),b=ri(r,11-a,9);return N(a+" + "+b,a+b)},
     function(r){if(r()<.5){var u=ri(r,5,9),a=ri(r,2,8)*10+u,b=ri(r,11-u,9);return N(a+" + "+b,a+b)}var v=ri(r,1,4),c=ri(r,3,9)*10+v,d=ri(r,v+1,9);return N(c+" − "+d,c-d)},
     function(r){if(r()<.5){var a=ri(r,1,8)*100+ri(r,88,99),b=ri(r,12,45);return N(a+" + "+b,a+b)}var c=ri(r,2,9)*100+ri(r,1,9),d=ri(r,11,30);return N(c+" − "+d,c-d)}],
 lvl:fl("Maak eerst 10. Hoeveel heb je dan nog over?","Spring eerst naar het tiental, dan de rest.","Maak er een rond getal van en haal het verschil er weer af."),
 tip:["Wij rekenen met tientallen omdat we tien vingers hebben. Met acht vingers hadden we in achttallen geteld.","Rekenen op de lege getallenlijn, met sprongen, heet rijgen. Het lijkt op kralen aan een ketting.","Winkels vragen € 3,98 in plaats van € 4. Wie kan compenseren, rekent zulke bedragen in twee tellen op."],
 more:[
  [["9 + 4. Hoeveel heeft de 9 nodig om 10 te worden?",["1","4"],"9 + 1 = 10. Van de 4 blijven er dan 3 over: 13."],
   ["Wat is makkelijker om uit te rekenen?",["10 + 3","8 + 5"],"Ze zijn even veel! Daarom maken we van 8 + 5 eerst 10 + 3."]],
  [["Hoe reken je 56 + 9 het snelst?",["56 + 10 − 1","56 + 4 + 4","50 + 9 + 6 + 1"],"9 is bijna 10. Tel 10 erbij en haal er 1 af: 65."],
   ["74 − 6: hoeveel haal je er eerst af om bij het tiental te komen?","4","74 − 4 = 70. Van de 6 zijn er nog 2 over: 68."]],
  [["Hoe reken je 503 − 198 handig?",["503 − 200 + 2","500 − 198 − 3","503 − 100 − 98"],"Haal 200 eraf, dat is 2 te veel, dus 2 er weer bij: 305."],
   ["Wat is 2,98 + 4,50?","7,48","3 + 4,50 = 7,50 en dan 2 cent eraf. Compenseren werkt net zo met kommagetallen."]]]},
{id:"min",ico:"🪜",dom:"aftrekken",title:"Eraf",
 truc:["Erbij en eraf horen bij elkaar. Weet je 3 + 4 = 7, dan weet je ook 7 − 4 = 3 en 7 − 3 = 4. Bij 9 − 7 tel je niet terug: je denkt 7 en hoeveel is 9? Twee.",
       "Liggen de getallen dicht bij elkaar, vul dan aan: 82 − 79 is van 79 naar 82, dus 3. Liggen ze ver uit elkaar, haal dan eraf in sprongen: 83 − 40 is acht tientallen min vier tientallen.",
       "Aftrekken is het verschil bepalen. 1000 − 275: van 275 naar 300 is 25, van 300 naar 1000 is 700. Samen 725. Bij 5 − 0,7 net zo: van 0,7 naar 1 is 0,3 en dan nog 4."],
 act:{out:"Zoek een trap, een stoeprand of een rij tegels. Begin bovenaan bij 10 (of 20). Eén kind roept hoeveel eraf moet, de rest stapt zo veel treden of tegels terug en roept waar ze uitkomen. Kom je bij 0, begin dan opnieuw.",in:"Zoek een trap of tel de vloertegels. Begin bij 10 (of 20). Eén kind roept hoeveel eraf moet, de rest stapt terug en roept het antwoord."},
 fl:[function(r){if(r()<.7){var a=ri(r,4,10),b=ri(r,1,a);return N(a+" − "+b,a-b)}var c=ri(r,11,19),d=ri(r,1,c-10);return N(c+" − "+d,c-d)},
     function(r){if(r()<.5){var a=ri(r,11,89);return N("100 − "+a,100-a)}var c=ri(r,41,99),d=ri(r,1,Math.floor(c/10)-1)*10;return N(c+" − "+d,c-d)},
     function(r){if(r()<.5){var a=ri(r,5,39)*25;return N("1000 − "+a,1000-a)}var w=ri(r,2,9),t=ri(r,1,9);return N(w+" − "+fmt(t/10),(w*10-t)/10)}],
 lvl:fl("Denk aan de plussom: hoeveel moet erbij?","Dichtbij: aanvullen. Ver weg: tientallen eraf.","Bepaal het verschil in twee sprongen."),
 tip:["Bij het aftellen van een raket tel je terug: 10, 9, 8… Dat is elke keer één eraf.","Een thermometer is een getallenlijn die ook onder nul doorgaat: van 3 graden naar −2 is 5 graden verschil.","De winst van een bedrijf is een aftreksom: wat er binnenkomt min wat eruit gaat. Kan ook negatief uitvallen."],
 more:[
  [["Je weet 5 + 3 = 8. Hoeveel is 8 − 3?",["5","3"],"De drie getallen 3, 5 en 8 horen bij elkaar. Dat is een sommenfamilie."],
   ["10 − 9. Tel je 9 terug, of denk je: 9 en hoeveel is 10?",["9 en hoeveel is 10","9 terugtellen"],"Aanvullen is veel sneller. Het antwoord is 1."]],
  [["Welke som reken je het handigst uit door aan te vullen?",["71 − 68","71 − 3","71 − 10"],"68 en 71 liggen vlak bij elkaar: het verschil is 3. Terugtellen zou 68 stappen kosten."],
   ["Hoe controleer je of 83 − 47 = 36 klopt?",["36 + 47 moet 83 zijn","83 + 47 uitrekenen","36 − 47 uitrekenen"],"Optellen is de controle van aftrekken. Zo vang je je eigen fouten."]],
  [["De temperatuur gaat van 4 graden naar −3 graden. Hoeveel graden is het gedaald?","7","Van 4 naar 0 is 4, van 0 naar −3 is nog 3. Het verschil is 7."],
   ["Waarom reken je 2000 − 1 liever uit je hoofd dan onder elkaar?",["Onder elkaar moet je drie keer lenen, en dat is foutgevoelig","Omdat het antwoord te groot is","Omdat je nullen mag weglaten"],"Kijk eerst naar de getallen voordat je een methode kiest. Hoofdrekenen is hier sneller en veiliger dan cijferen."]]]},
{id:"sprong",ico:"🦘",dom:"tellen met sprongen",title:"Sprongen",
 truc:["Met sprongen van 2 sla je steeds één getal over: 2, 4, 6, 8, 10. Met sprongen van 5 eindig je om en om op een 5 en een 0. Met sprongen van 10 verandert alleen het eerste cijfer.",
       "Een rij met sprongen is een tafel in vermomming: 3, 6, 9, 12 is de tafel van 3. Sprongen van 25 gaan als kwartjes: 25, 50, 75, 100. Vier sprongen van 25 is steeds 100 erbij.",
       "Kijk altijd eerst naar het verschil tussen twee buren in de rij: dat is de sprong. Een sprong kan ook een kommagetal zijn (0,25) of achteruit gaan (min 3). Vier sprongen van 0,25 is precies 1."],
 act:{out:"Zoek een rij tegels of streep vakken op de grond. Spring samen de rij: elke sprong is twee tegels en je roept 2, 4, 6… tot 20. Daarna met sprongen van 5 tot 50 (lopend, bij elke stap een getal). Wie durft het ook achteruit?",in:"Loop door de gang of het lokaal. Bij elke stap roepen jullie samen het volgende getal: eerst sprongen van 2 tot 20, dan van 5 tot 50, dan van 10 tot 100. Daarna achteruit."},
 fl:[function(r){var st=pk(r,[2,5,10]),s=st*ri(r,1,6);return N(s+" · "+(s+st)+" · "+(s+2*st)+" · …",s+3*st)},
     function(r){var st=pk(r,[3,4,6,25,50]),s=st*ri(r,1,5);return N(s+" · "+(s+st)+" · "+(s+2*st)+" · …",s+3*st)},
     function(r){var k=ri(r,0,3),st,s;if(k===0){st=25;s=ri(r,1,8)*25;return N(fmt(s/100)+" · "+fmt((s+st)/100)+" · "+fmt((s+2*st)/100)+" · …",(s+3*st)/100)}
       if(k===1){st=pk(r,[125,250]);s=st*ri(r,1,4);return N(s+" · "+(s+st)+" · "+(s+2*st)+" · …",s+3*st)}
       if(k===2){st=pk(r,[3,4,6]);s=ri(r,7,12);var mm=function(v){return String(v).replace("-","−")};return N(mm(s)+" · "+mm(s-st)+" · "+mm(s-2*st)+" · …",s-3*st)}
       st=pk(r,[15,12]);s=st*ri(r,2,6);return N(s+" · "+(s+st)+" · "+(s+2*st)+" · …",s+3*st)}],
 lvl:fl("Hoe groot is de sprong? Tel zo verder.","Kijk naar het verschil tussen twee buren.","Bepaal eerst de sprong. Hij kan ook achteruit gaan of een kommagetal zijn."),
 tip:["Een kangoeroe springt wel 9 meter ver. Met sprongen ben je er sneller dan met stapjes.","Muziek telt ook in sprongen: bij een wals tel je 1-2-3, 1-2-3. Elke eerste tel is een sprong van 3.","Een formule voor zo'n rij: begin + sprong × aantal sprongen. Daarmee weet je het honderdste getal zonder ze allemaal te tellen."],
 more:[
  [["Tel met sprongen van 2. Kom je langs 7?",["nee","ja"],"Met sprongen van 2 vanaf 2 kom je alleen op even getallen: 2, 4, 6, 8."],
   ["Je springt 3 keer met sprongen van 5. Waar ben je?",["15","8"],"5, 10, 15. Drie sprongen van 5 is 3 keer 5."]],
  [["Je doet 6 sprongen van 4. Welke keersom is dat?",["6 × 4","6 + 4","4 × 4"],"Zes sprongen van 4 is 6 × 4 = 24. Een tafel is een rij sprongen."],
   ["De rij 25, 50, 75, 100 ken je van…",["kwartjes: vier in een euro","de tafel van 20","de klok"],"Vier keer 25 is 100. Daarom is een kwart 25%."]],
  [["De rij is 7, 11, 15, 19. Wat is het tiende getal?","43","Begin 7, sprong 4. Het tiende getal is 7 + 9 × 4 = 43: negen sprongen, want het eerste getal is de start."],
   ["Een rij groeit met gelijke sprongen. Hoe heet zo'n verband?",["Lineair","Exponentieel","Willekeurig"],"Bij een lineair verband komt er steeds evenveel bij. In een grafiek is dat een rechte lijn."]]]},
{id:"tafela",ico:"⚡",dom:"tafels",title:"De makkelijke tafels",
 truc:["Keer 1 verandert niets. Keer 2 is dubbel. Keer 10 is een 0 erachter. Keer 5 is de helft van keer 10: 6 × 10 = 60, dus 6 × 5 = 30.",
       "Je hoeft maar de helft te leren: 3 × 4 is hetzelfde als 4 × 3. Keer 4 is dubbel en nog eens dubbel. Keer 5 is de helft van keer 10. Keer 3 is dubbel plus nog één keer.",
       "Elke tafelsom haal je uit een steunsom: 12 × 7 is 10 × 7 plus 2 × 7. Keer 9 is keer 10 min één keer. Keer 11 is keer 10 plus één keer."],
 act:{out:"Zoek ramen, tegels of fietsen in rijen. Wijs een rechthoek aan, bijvoorbeeld 2 rijen van 5. Stamp de tafel: bij elke stap één sprong (5, 10) en bij het antwoord spring je. Doe zo vijf verschillende keersommen die je om je heen ziet.",in:"Zoek rijen: stoelen, ramen, vakjes in een kast. Wijs een rechthoek aan, bijvoorbeeld 2 rijen van 5, en stamp de tafel. Doe vijf verschillende keersommen die je in de ruimte ziet."},
 fl:[function(r){var t=pk(r,[1,2,5,10]),k=ri(r,1,10);return N(k+" × "+t,k*t)},
     function(r){var t=pk(r,[2,3,4,5,10]),k=ri(r,2,10);return r()<.5?N(k+" × "+t,k*t):N(t+" × "+k,k*t)},
     function(r){var t=ri(r,2,12),k=ri(r,3,12);return N(k+" × "+t,k*t)}],
 lvl:fl("Keer 2 is dubbel. Keer 10 is een nul erachter. Keer 5 is de helft daarvan.","Draai de som om als dat makkelijker is.","Splits: eerst keer 10, dan de rest erbij."),
 tip:["Een eierdoos is een keersom: 2 rijen van 5 is 10 eieren.","Wie omdraaien en de makkelijke tafels (1, 2, 5 en 10) slim gebruikt, houdt van de honderd tafelsommen maar een stuk of twintig lastige over.","In Japan leren kinderen de tafels als een liedje, de kuku. Ritme helpt het geheugen."],
 more:[
  [["3 × 2 betekent…",["3 groepjes van 2","3 en 2 bij elkaar"],"3 × 2 is 2 + 2 + 2. Dat is 6."],
   ["Wat is 7 × 10?",["70","17"],"Bij keer 10 schuift het getal een plaats op en komt er een 0 achter."]],
  [["Je weet 6 × 10 = 60. Hoeveel is 6 × 5?",["30, de helft","65, vijf erbij","12, het dubbele"],"5 is de helft van 10, dus het antwoord is ook de helft."],
   ["Waarom is 3 × 8 hetzelfde als 8 × 3?",["3 rijen van 8 is hetzelfde veld als 8 rijen van 3","Dat is toeval","Omdat 3 en 8 allebei klein zijn"],"Draai een rechthoek van tegels een kwartslag: er liggen er nog steeds evenveel. Dat heet de wisseleigenschap."]],
  [["Hoe reken je 12 × 8 uit je hoofd?",["10 × 8 + 2 × 8","12 + 8 × 2","8 × 8 + 12"],"80 + 16 = 96. Splitsen in een makkelijk en een klein stuk heet de verdeeleigenschap."],
   ["Wat is 9 × 15, via een steunsom?","135","10 × 15 = 150, en één keer 15 eraf: 135."]]]},
{id:"tafelb",ico:"🧗",dom:"tafels",title:"De lastige tafels",
 truc:["Een keersom is groepjes maken. 3 × 4 is 3 groepjes van 4: 4, 8, 12. Leg ze neer of teken ze. Ken je 2 × 4 = 8, dan is 3 × 4 gewoon nog één groepje erbij.",
       "Van de lastige tafels blijven er maar een paar echt over. 7 × 8 = 56: denk aan 5, 6, 7, 8. Keer 9 doe je met je vingers: vouw bij 4 × 9 je vierde vinger om, links 3 en rechts 6: 36. Keer 6 is keer 5 plus één keer.",
       "Grote tafels bouw je uit kleine. Keer 12 is keer 10 plus keer 2. Keer 15 is keer 10 plus de helft daarvan. Keer 25 is keer 100 gedeeld door 4. Keer 11 onder de 10: het cijfer twee keer (7 × 11 = 77)."],
 act:{out:"Doe de vingertruc van de tafel van 9 allemaal tegelijk: houd tien vingers omhoog, vouw de vinger van de som om en lees de tientallen links en de eenheden rechts. Loop daarna naar een punt 20 stappen verder en zeg onderweg bij elke stap een antwoord uit de tafel van 6 of 7.",in:"Doe de vingertruc van de tafel van 9 allemaal tegelijk. Loop daarna de ruimte door en zeg bij elke stap een antwoord uit de tafel van 6 of 7. Kom je er niet uit, dan helpt het team."},
 fl:[function(r){var t=pk(r,[2,3,4]),k=ri(r,1,5);return N(k+" × "+t,k*t)},
     function(r){var t=pk(r,[6,7,8,9]),k=r()<.7?ri(r,6,9):ri(r,2,10);return r()<.5?N(k+" × "+t,k*t):N(t+" × "+k,k*t)},
     function(r){var t=pk(r,[11,12,15,25]),k=ri(r,2,12);return N(k+" × "+t,k*t)}],
 lvl:fl("Maak groepjes en tel ze op.","Gebruik een som die je al kent en doe er één keer bij of af.","Splits: keer 10 en dan de rest."),
 tip:["Een spin heeft 8 poten. Drie spinnen samen: 3 × 8 poten.","De antwoorden van de tafel van 9 tellen altijd op tot 9: 18 is 1 + 8, 27 is 2 + 7, 36 is 3 + 6.","Een kwadraat is een getal keer zichzelf: 7 × 7 = 49. Het heet zo omdat je er een vierkant (kwadraat) mee kunt leggen."],
 more:[
  [["2 × 3 = 6. Er komt nog een groepje van 3 bij. Hoeveel is 3 × 3?",["9","7"],"6 en nog 3 is 9. Eén groepje erbij."],
   ["Wat is meer: 4 groepjes van 2, of 2 groepjes van 4?",["even veel","4 groepjes van 2"],"Allebei 8. Je mag een keersom omdraaien."]],
  [["Je weet 5 × 7 = 35. Hoe kom je snel aan 6 × 7?",["35 + 7","35 + 6","35 × 2"],"Eén keer 7 erbij: 42. Zo hoef je 6 × 7 niet los te onthouden."],
   ["Welke som hoort bij het ezelsbruggetje 5-6-7-8?",["56 = 7 × 8","5 × 6 = 78","56 : 7 = 78"],"Vijf, zes, zeven, acht: zesenvijftig is zeven keer acht."]],
  [["Wat is 16 × 25, slim uitgerekend?","400","Vier keer 25 is 100. In 16 zitten vier vieren, dus 4 × 100."],
   ["Welke kwadraten liggen tussen 60 en 90?",["64 en 81","49 en 64","72 en 81"],"8 × 8 = 64 en 9 × 9 = 81. Kwadraten zijn handige ankers in de tafels."]]]},
{id:"deel",ico:"🍕",dom:"delen",title:"De deeltafels",
 truc:["Delen is eerlijk verdelen. Bij 10 : 2 geef je om de beurt: één voor jou, één voor mij, tot alles op is. Ieder krijgt er 5. Je kunt het ook vragen als: hoeveel keer 2 is 10?",
       "Elke deelsom is een tafelsom achterstevoren. Bij 42 : 7 vraag je: hoeveel keer 7 is 42? Zes keer. Eén tafelsom geeft je vier sommen: 6 × 7, 7 × 6, 42 : 7 en 42 : 6.",
       "Delen door een groter getal doe je met een steunsom: 108 : 12, hoeveel keer 12 is 108? 10 × 12 = 120, dat is er één te veel, dus 9. Controleer altijd met de keersom."],
 act:{out:"Zoek een handvol steentjes, blaadjes of kastanjes (12 stuks). Verdeel ze eerlijk over 2 kinderen, dan over 3, dan over 4, dan over 6. Zeg er elke keer de deelsom en de keersom bij. Leg alles daarna terug.",in:"Pak 12 potloden, blokjes of doppen. Verdeel ze eerlijk over 2 kinderen, dan over 3, dan over 4, dan over 6. Zeg er elke keer de deelsom en de keersom bij."},
 fl:[function(r){var t=pk(r,[2,5,10]),k=ri(r,1,5);return N((k*t)+" : "+t,k)},
     function(r){var t=ri(r,2,10),k=ri(r,2,10);return N((k*t)+" : "+t,k)},
     function(r){var t=ri(r,6,12),k=ri(r,6,12);return N((k*t)+" : "+t,k)}],
 lvl:fl("Verdeel eerlijk: om de beurt één.","Welke tafelsom hoort erbij?","Zoek de keersom die erbij hoort, via een steunsom."),
 tip:["Een pizza in 8 punten snijden is delen: iedere punt is een achtste.","Het deelteken : is in andere landen een streepje met twee stippen (÷) of een schuine streep (/). Een breuk is ook een deelsom.","Delen door 0 kan niet: hoeveel keer 0 je ook neemt, je komt nooit bij 12. Rekenmachines geven dan een foutmelding."],
 more:[
  [["Je hebt 6 appels voor 2 kinderen. Hoeveel krijgt ieder?",["3","4"],"3 en 3 is samen 6. Eerlijk gedeeld."],
   ["Je weet 2 × 5 = 10. Hoeveel is 10 : 2?",["5","2"],"Hoeveel keer 2 is 10? Vijf keer."]],
  [["Welke keersom helpt je bij 56 : 8?",["7 × 8 = 56","5 × 6 = 30","8 × 8 = 64"],"Hoeveel keer 8 is 56? Zeven keer."],
   ["Je verdeelt 20 knikkers over 6 kinderen. Hoeveel blijven er over?","2","6 × 3 = 18. Ieder krijgt er 3 en er blijven er 2 over. Dat heet de rest."]],
  [["Hoe reken je 144 : 12 uit?",["Hoeveel keer 12 is 144? 12 keer","144 − 12","12 : 144"],"12 × 12 = 144. Een kwadraat achterstevoren heet een wortel: de wortel van 144 is 12."],
   ["Wat is 3 : 4 als kommagetal?","0,75","Een breuk is een deelsom. Drie kwart is 0,75, ofwel 75%."]]]},
{id:"nul",ico:"🚀",dom:"keer 10, 100 en 1000",title:"Tientallen en nullen",
 truc:["Tientallen tel je als gewone getallen: 3 + 2 = 5, dus 30 + 20 = 50. En 10 meer dan 47? Alleen het eerste cijfer gaat één omhoog: 57.",
       "Bij keer 10 schuiven alle cijfers één plaats naar links: 47 wordt 470. Bij keer 100 twee plaatsen: 4700. Bij delen door 10 schuiven ze terug: 470 wordt 47.",
       "De cijfers schuiven, de komma blijft staan. Keer 10: één plaats naar links, dus 3,4 wordt 34. Gedeeld door 100: twee plaatsen naar rechts, dus 47 wordt 0,47. 'Een nul erachter' werkt bij kommagetallen niet."],
 act:{out:"Maak een rij van vier kinderen: jullie zijn de plaatsen duizend, honderd, tien en één. Een vijfde kind is het cijfer en gaat bij 'één' staan. Roep 'keer 10!': het cijfer schuift een plaats op naar links. 'Gedeeld door 10!': terug. Wissel van rol.",in:"Leg vier blaadjes op een rij: duizend, honderd, tien, één. Eén kind is het cijfer en gaat bij 'één' staan. Bij 'keer 10!' schuift het een plaats naar links, bij 'gedeeld door 10!' terug. Wissel van rol."},
 fl:[function(r){var k=ri(r,0,2);if(k===0){var a=ri(r,1,8),b=ri(r,1,9-a);return N(a*10+" + "+b*10,(a+b)*10)}if(k===1){var c=ri(r,2,9),d=ri(r,1,c-1);return N(c*10+" − "+d*10,(c-d)*10)}var n=ri(r,11,89);return r()<.5?N("10 meer dan "+n,n+10):N("10 minder dan "+n,n-10)},
     function(r){var k=ri(r,0,2),n=ri(r,2,99);if(k===0)return N(n+" × 10",n*10);if(k===1)return N(n+" × 100",n*100);return N(n*10+" : 10",n)},
     function(r){var k=ri(r,0,3),b;if(k===0){b=ri(r,11,99);return N(fmt(b/10)+" × 10",b)}if(k===1){b=ri(r,2,99);return N(fmt(b/100)+" × 100",b)}if(k===2){b=ri(r,11,999);return N(b+" : 10",b/10)}b=ri(r,11,99)*10+ri(r,0,1)*5;return N(b+" : 100",b/100)}],
 lvl:fl("Reken met de tientallen als gewone getallen.","De cijfers schuiven een plaats op.","De cijfers schuiven, de komma blijft staan."),
 tip:["Het cijfer 0 is jonger dan de andere cijfers. Het is bedacht in India, zo'n 1500 jaar geleden.","Kilo betekent duizend: een kilometer is 1000 meter, een kilogram 1000 gram.","Wetenschappers schrijven grote getallen met machten van 10: de afstand tot de zon is ongeveer 1,5 × 10⁸ kilometer."],
 more:[
  [["2 + 5 = 7. Hoeveel is 20 + 50?",["70","25"],"Twee tientallen en vijf tientallen is zeven tientallen: 70."],
   ["Welk getal is 10 meer dan 32?",["42","33"],"De 3 wordt een 4. De 2 blijft staan."]],
  [["Wat gebeurt er echt bij 36 × 10?",["Elk cijfer wordt 10 keer zoveel waard en schuift een plaats op","Er wordt 10 bij opgeteld","De 6 wordt een 0"],"De 3 tientallen worden 3 honderdtallen, de 6 eenheden worden 6 tientallen. De lege plek krijgt een 0."],
   ["Hoeveel is 20 × 30?","600","2 × 3 = 6, en twee keer een tiental geeft honderdtallen: 600."]],
  [["Waarom klopt 'een nul erachter' niet bij 2,5 × 10?",["2,50 is evenveel als 2,5; de cijfers moeten opschuiven","Omdat 2,5 te klein is","Omdat je kommagetallen niet kunt vermenigvuldigen"],"2,5 × 10 = 25. Een nul achter een kommagetal verandert niets aan de waarde."],
   ["Hoeveel meter is 3,2 kilometer?","3200","Kilo is keer 1000: de cijfers schuiven drie plaatsen op."]]]},
{id:"weet",ico:"🗄️",dom:"vaste weetjes",title:"Slim rekenen",
 truc:["Bijna-dubbel: 6 + 7 is 6 + 6 en nog 1. Je kent de dubbelen al, dus je kent deze ook. 8 + 9 is 8 + 8 en nog 1: 17.",
       "De helft is delen door 2, een kwart is de helft van de helft. Een kwart van 100 is 25, een kwart van 60 is 15. Drie kwart is drie van die stukken.",
       "Breuk, procent en kommagetal zijn drie namen voor hetzelfde. Een half is 50% is 0,5. Een kwart is 25% is 0,25. Een vijfde is 20% is 0,2. Een tiende is 10% is 0,1. Bij 75% van 80 neem je drie keer een kwart: 3 × 20."],
 act:{out:"Zoek iets dat je kunt verdelen: een bankje, een hek, een muur, de breedte van de stoep. Wijs met het team de helft aan, dan een kwart, dan drie kwart. Ga er letterlijk bij staan. Klopt het? Meet na met stappen.",in:"Kies een tafel, een raam of een muur. Wijs met het team de helft aan, dan een kwart, dan drie kwart. Meet na met handen of stappen."},
 fl:[function(r){var a=ri(r,2,9);return r()<.5?N(a+" + "+(a+1),2*a+1):N((a+1)+" + "+a,2*a+1)},
     function(r){var k=ri(r,0,2),n;if(k===0){n=ri(r,5,50)*2;return N("de helft van "+n,n/2)}if(k===1){n=ri(r,2,25)*4;return N("een kwart van "+n,n/4)}n=ri(r,1,10)*4;return N("drie kwart van "+n,n/4*3)},
     function(r){var k=ri(r,0,3),b=pk(r,BPK);if(k===0)return N(b[0]+" = …%",b[1]);if(k===1)return N(b[1]+"% als kommagetal",b[2]);if(k===2){var n=ri(r,2,20)*4,p=pk(r,[25,50,75]);return N(p+"% van "+n,n*p/100)}var m=ri(r,2,15)*10,q=pk(r,[10,20,30]);return N(q+"% van "+m,m*q/100)}],
 lvl:fl("Zoek de dubbelsom en doe er 1 bij.","Een kwart is de helft van de helft.","Zet het om naar de vorm die je het best kent: breuk, procent of kommagetal."),
 tip:["Je hersenen onthouden iets beter als je het vaak kort herhaalt dan als je het één keer lang oefent.","Een kwartier, een kwartje, een kwartfinale: allemaal een vierde deel.","Procent komt van het Latijnse per centum: per honderd. Het teken % is een verbasterde 100."],
 more:[
  [["Welke dubbelsom helpt je bij 4 + 5?",["4 + 4","5 + 1"],"4 + 4 = 8, en nog 1 erbij is 9."],
   ["Hoeveel is 8 + 9?",["17","18"],"8 + 8 = 16 en nog 1 is 17."]],
  [["Hoe reken je een kwart van 60 uit?",["De helft is 30, de helft daarvan is 15","60 − 4","60 : 2"],"Een kwart is twee keer halveren."],
   ["Hoeveel kwarten zitten er in een hele?","4","Vier kwarten maken één hele. Daarom is een kwartier een vierde uur: 15 minuten."]],
  [["Hoe reken je 15% van 80 uit je hoofd?",["10% is 8, 5% is 4: samen 12","80 : 15","80 − 15"],"Bouw procenten op uit 10% en de helft daarvan. Zo reken je ook een fooi of korting uit."],
   ["Wat is het grootst?",["3/4","0,7","60%"],"3/4 is 0,75. Zet alles in dezelfde vorm, dan vergelijk je eerlijk."]]]},
{id:"woord",ico:"🔤",dom:"spelling",title:"Woorden",
 truc:["Zeg het woord langzaam en luister naar elke klank. Hoor je een lange klank in een kort woord, dan schrijf je twee letters: boom, maan, vuur. Hoor je een korte klank, dan één: bom, man.",
       "Hak het woord in klankgroepen. Eindigt het eerste stuk op een lange klank, dan schrijf je één letter: bo-men, lo-pen. Hoor je een korte klank, dan verdubbel je de medeklinker: kat-ten, bak-ker. Aan het eind d of t? Maak het langer: honden, dus hond.",
       "Bij werkwoorden schrijf je in de tegenwoordige tijd ik-vorm + t: hij wordt, zij vindt. Staat jij of je erachter, dan vervalt de t: vind jij. Voltooid deelwoord: maak het langer of gebruik 't kofschip: gewerkt (k), verhuisd (z van verhuizen). Bij twijfel: vervang door 'lopen'. Loopt hij, dan krijgt jouw werkwoord ook een t."],
 act:{out:"Zoek vijf woorden om je heen: op borden, winkels, auto's, putdeksels. Eén kind leest een woord hardop, de rest schrijft het met een vinger groot in de lucht. Daarna ogen dicht en nog een keer. Welk woord was het lastigst?",in:"Zoek vijf woorden in de ruimte: op posters, deuren, boeken. Eén kind leest een woord hardop, de rest schrijft het met een vinger groot in de lucht. Daarna ogen dicht en nog een keer."},
 fl:[function(r){var w=pk(r,W0);return C(w[0],w[1],w[2])},
     function(r){var w=pk(r,W1);return C("Welke is goed?",w[0],w[1])},
     function(r){var w=pk(r,W2);return C(w[0],w[1],w[2])}],
 lvl:fl("Zeg het woord langzaam. Lange klank: twee letters.","Hak het woord in stukken. Korte klank: dubbele medeklinker.","Vervang het werkwoord door 'lopen': hoor je loopt, dan komt er een t bij."),
 tip:["Goede lezers lezen niet letter voor letter. Ze herkennen het hele woord in één flits.","Het Nederlands heeft maar vijf klinkerletters voor wel zestien klinkerklanken. Daarom hebben we tweetekenklanken als oe, eu en ui.","'t Kofschip is een ezelsbruggetje uit de negentiende eeuw. Een kofschip was een echt zeilschip."],
 more:[
  [["Hoor je in 'maan' een lange of een korte klank?",["een lange: aa","een korte: a"],"Maan met aa. Met één a staat er man."],
   ["Welk woord begint met dezelfde klank als 'vis'?",["vogel","fiets"],"Vis en vogel beginnen met een v. Fiets begint met een f."]],
  [["Waarom schrijf je 'bomen' met één o?",["De klankgroep bo- eindigt op een lange klank","Omdat het meervoud korter moet","Omdat er al een e in zit"],"Bo-men. Aan het eind van een klankgroep schrijf je een lange klank met één letter."],
   ["Paard of paart? Wat is de truc?",["Langer maken: paarden, dus een d","Goed luisteren","Het is altijd een t"],"Aan het eind hoor je geen verschil tussen d en t. De verlengingsregel beslist."]],
  [["'Hij word/wordt ziek.' Vervang door lopen. Wat hoor je?",["Hij loopt: dus wordt","Hij loop: dus word"],"Je hoort de t bij loopt, dus schrijf je hem ook bij wordt: stam word + t."],
   ["'Het is gebeur…' Welke letter, en waarom?",["d, want de r zit niet in 't kofschip","t, want het is tegenwoordige tijd","dt, voor de zekerheid"],"Een voltooid deelwoord (met is of heeft) eindigt nooit op dt. De stam gebeur eindigt op een r: gebeurd."]]]},
{id:"buur",ico:"🏘️",dom:"getalbegrip",title:"De buren van een getal",
 truc:["Elk getal heeft twee buren: één ervoor en één erna. De buren van 14 zijn 13 en 15. Na 19 komt een nieuw tiental: 20. Voor 30 komt 29.",
       "Afronden is kijken bij welke ronde buur een getal het dichtst woont. 47 ligt tussen 40 en 50, en het dichtst bij 50. Is het laatste cijfer 5 of meer, dan ga je naar boven.",
       "Kijk bij afronden alleen naar het cijfer rechts van de plek waar je afrondt. 3,47 op één decimaal: de 7 beslist, dus 3,5. 46.800 op duizendtallen: de 8 beslist, dus 47.000."],
 act:{out:"Zoek huisnummers of andere getallen in de straat. Kies er één. Eén kind noemt het getal, de rest roept de buur ervoor en erna, en daarna het tiental waar het het dichtst bij ligt. Doe dit met vijf getallen.",in:"Zoek getallen in de school: lokaalnummers, bladzijden, de kalender. Eén kind noemt een getal, de rest roept de buur ervoor en erna, en het dichtstbijzijnde tiental. Doe dit met vijf getallen."},
 fl:[function(r){var k=ri(r,0,2),n=ri(r,2,48);if(k===0)return N("na "+n+" komt …",n+1);if(k===1)return N("voor "+n+" komt …",n-1);return N("tussen "+(n-1)+" en "+(n+1)+" zit …",n)},
     function(r){if(r()<.6){var u=pk(r,[1,2,3,4,6,7,8,9]),n=ri(r,1,9)*10+u;return N("rond "+n+" af op een tiental",Math.round(n/10)*10)}var t=pk(r,[1,2,3,4,6,7,8,9]),m=ri(r,1,9)*100+t*10+ri(r,0,9);return N("rond "+m+" af op een honderdtal",Math.round(m/100)*100)},
     function(r){var k=ri(r,0,2);if(k===0){var a=ri(r,1,19)*10+pk(r,[1,2,3,4,6,7,8,9]);return N("rond "+fmt(a/10)+" af op een heel getal",Math.round(a/10))}if(k===1){var b=ri(r,10,99)*10+pk(r,[1,2,3,4,6,7,8,9]);return N("rond "+fmt(b/100)+" af op één decimaal",Math.round(b/10)/10)}var c=ri(r,11,98)*1000+pk(r,[1,2,3,4,6,7,8,9])*100;return N("rond "+c+" af op duizendtallen",Math.round(c/1000)*1000)}],
 lvl:fl("Tel maar: welk getal komt ervoor, en welk erna?","Bij welke ronde buur ligt het getal het dichtst? 5 of meer: naar boven.","Kijk alleen naar het cijfer rechts van de plek waar je afrondt."),
 tip:["Aan de ene kant van de straat staan de even huisnummers, aan de andere kant de oneven. Je buren zijn dus niet jouw getal plus 1.","In het nieuws worden getallen bijna altijd afgerond: 'ruim 18 miljoen inwoners' zegt genoeg.","Wie afrondt en schat voordat hij rekent, ziet meteen of een rekenmachine-antwoord onzin is. Dat is de belangrijkste controle die er bestaat."],
 more:[
  [["Welk getal komt na 29?",["30","20"],"Na 29 is het tiental vol. Dan komt 30."],
   ["Welk getal is het grootst?",["21","12"],"21 heeft twee tientallen, 12 maar één."]],
  [["Waarom zou je 398 + 203 eerst schatten?",["Dan weet je dat het antwoord rond 600 moet liggen","Dan hoef je niet meer te rekenen","Omdat het precieze antwoord er niet toe doet"],"400 + 200 = 600. Komt je precieze antwoord op 501 of 6001 uit, dan weet je dat er iets mis ging."],
   ["Tussen welke twee honderdtallen ligt 468?",["400 en 500","460 en 470","300 en 400"],"En het ligt dichter bij 500, want 68 is meer dan de helft van 100."]],
  [["Een rekenmachine zegt 49 × 21 = 10.029. Hoe zie je meteen dat dat fout is?",["50 × 20 = 1000, dus het moet rond de 1000 liggen","Het antwoord is oneven","Het antwoord heeft te weinig cijfers"],"Schatten kost twee tellen en vangt typefouten. Het juiste antwoord is 1029."],
   ["Je rondt 2,449 af op één decimaal. Wat wordt het?",["2,4","2,5"],"Alleen het eerste cijfer na de afrondplek telt: de 4. Je mag niet eerst naar 2,45 afronden en dan nog eens."]]]},
{id:"mix",ico:"🌪️",dom:"alles door elkaar",title:"Alles door elkaar",
 truc:["Kijk eerst naar het teken: is het erbij of eraf? Kies dan je truc: verliefde harten, dubbelen of eerst naar 10.",
       "Kijk eerst wat voor som het is. Keer: zoek de tafelsom of draai hem om. Delen: welke keersom hoort erbij? Niet raden: weet je hem niet, reken hem dan uit via een som die je wel kent.",
       "Door elkaar oefenen is moeilijker dan op een rijtje, en juist daardoor onthoud je het beter. Kijk naar het teken, kies de steunsom, en controleer een deelsom met de keersom."],
 act:{out:"Ga in een kring staan. Gooi (of wijs) een denkbeeldige bal naar iemand en roep een som. Die geeft antwoord en speelt door met een nieuwe som van een ander soort: na een plussom komt een minsom, na een keersom een deelsom. Houd het een minuut vol.",in:"Ga in een kring staan. Wijs iemand aan en roep een som. Die geeft antwoord en speelt door met een som van een ander soort. Houd het een minuut vol."},
 fl:[function(r){var k=ri(r,0,3),a,b;if(k===0){a=ri(r,0,10);return N("10 = "+a+" + …",10-a)}if(k===1){a=ri(r,1,10);return N("dubbel van "+a,2*a)}if(k===2){a=ri(r,2,9);b=ri(r,1,10-a);return N(a+" + "+b,a+b)}a=ri(r,4,10);b=ri(r,1,a);return N(a+" − "+b,a-b)},
     function(r){var t=ri(r,2,10),k=ri(r,2,10);return r()<.5?N(k+" × "+t,k*t):N((k*t)+" : "+t,k)},
     function(r){var k=ri(r,0,2),t,n;if(k===0){n=ri(r,2,15);return N(n+" × "+n,n*n)}t=ri(r,6,12);n=ri(r,6,12);return k===1?N(n+" × "+t,n*t):N((n*t)+" : "+t,n)}],
 lvl:fl("Kijk eerst naar het teken. Kies dan je truc.","Wat voor som is het? Zoek de tafelsom die erbij hoort.","Kijk naar het teken, kies de steunsom en controleer."),
 tip:["Topsporters trainen ook door elkaar: nooit tien keer achter elkaar dezelfde oefening.","Je onthoudt iets het best als je het net bijna vergeten was en het dan weer ophaalt. Daarom werken opfrissers.","Vijf minuten per dag oefenen werkt beter dan een half uur per week. Dat heet gespreid oefenen, en het geldt voor alles wat je wilt onthouden."],
 more:[
  [["Wanneer ken je een som echt goed?",["als je hem meteen weet","als je hem kunt uittellen"],"Uittellen is een goed begin. Meteen weten komt door vaak oefenen."],
   ["Wat helpt het best om sommen te onthouden?",["elke dag even oefenen","één keer heel lang oefenen"],"Kort en vaak werkt het best. Morgen weer een rondje!"]],
  [["Wat is het verschil tussen een som uitrekenen en een som weten?",["Weten gaat direct, uitrekenen kost denkstappen","Er is geen verschil","Uitrekenen is altijd fout"],"Wat je direct weet, kost geen denkkracht. Die houd je over voor het moeilijke deel van een som."],
   ["Waarom is door elkaar oefenen nuttig?",["Je moet elke keer kiezen welke truc past","Het gaat sneller","Je hoeft dan minder te oefenen"],"In een echte som staat er niet bij welke tafel je nodig hebt. Kiezen moet je dus ook oefenen."]],
  [["Waarom helpt het bij een lastig vraagstuk als je de tafels paraat hebt?",["Je werkgeheugen blijft vrij voor het redeneren","Dan hoef je het vraagstuk niet te lezen","Dan is het antwoord altijd een heel getal"],"Je werkgeheugen kan maar een paar dingen tegelijk vasthouden. Wat geautomatiseerd is, neemt daar geen plek in."],
   ["Welke oefenplanning onthoudt het best?",["Vier keer vijf minuten, verspreid over de week","Eén keer twintig minuten","Alleen de avond voor de toets"],"Gespreid oefenen wint het in elk onderzoek van stampen. Even vergeten en weer ophalen maakt het geheugenspoor sterker."]]]}
];
/* Wat de kinderen zien: één korte regel (kort[niveau]) en één beweegzin tussen ronde 1 en 2 (doe). De lange truc, act, tip en more staan alleen op het begeleidersblad. */
var KORT={
 splits:{t:["Samen 10: 7 en 3. Of 6 en 4.","Samen 100: 30 en 70. Net als 3 en 7.","Vul aan in twee sprongen: 375 → 400 → 1000."],doe:"Steek samen 10 vingers op. Vouw er 3 om!"},
 dubbel:{t:["Dubbel is twee keer hetzelfde: 4 + 4 = 8.","Dubbel 35: eerst 30, dan 5. Samen 70.","Splits het getal: dubbel 2,5 is 4 + 1 = 5."],doe:"Spring 4 keer. Nu het dubbele!"},
 tien:{t:["8 + 5: eerst naar 10, dan de rest. Dat is 13.","47 + 8: eerst naar 50, dan nog 5. Dat is 55.","398 + 25: reken 400 + 25, en dan 2 eraf."],doe:"Spring 8 keer. Dan tot 10. En nog 3!"},
 min:{t:["9 − 7: denk 7 en hoeveel is 9? Dat is 2.","100 − 37: vul aan. 37 → 40 → 100. Dat is 63.","1000 − 275: 275 → 300 → 1000. Dat is 725."],doe:"Loop 10 stappen. Nu 4 terug. Waar sta je?"},
 sprong:{t:["Hoe groot is de sprong? 5, 10, 15, 20.","Hoe groot is de sprong? 25, 50, 75, 100.","Zoek de sprong. Hij kan ook terug: 10, 7, 4, 1."],doe:"Spring en tel: 5, 10, 15, 20, 25!"},
 tafela:{t:["Keer 2 is dubbel. Keer 10: een 0 erachter.","Draai om als dat makkelijker is: 3 × 4 = 4 × 3.","12 × 7 = 10 × 7 + 2 × 7 = 84."],doe:"Stamp de tafel van 2, tot 20."},
 tafelb:{t:["3 × 4 is 3 groepjes van 4: 4, 8, 12.","7 × 8 = 56. Denk aan 5, 6, 7, 8.","Keer 12 is keer 10 plus keer 2."],doe:"Klap de tafel van 3, tot 30."},
 deel:{t:["10 : 2 is eerlijk delen. Ieder krijgt 5.","42 : 7? Hoeveel keer 7 is 42? 6 keer.","108 : 12? Hoeveel keer 12 is 108? 9 keer."],doe:"Verdeel jullie groep eerlijk in tweeën."},
 nul:{t:["3 + 2 = 5, dus 30 + 20 = 50.","Keer 10: de cijfers schuiven op. 47 wordt 470.","Keer 10: 3,4 wordt 34. Gedeeld door 100: 47 wordt 0,47."],doe:"Tel met tienen tot 100. Bij elke tien een sprong!"},
 weet:{t:["6 + 7 is 6 + 6 en nog 1. Dat is 13.","Een kwart is de helft van de helft. Kwart van 60 is 15.","1/4 = 25% = 0,25. En 1/5 = 20% = 0,2."],doe:"De helft van de groep gaat zitten."},
 woord:{t:["Lange klank: twee letters. Boom, maan, vuur.","Bo-men: één o. Kat-ten: dubbele t.","Past 'loopt'? Dan komt er een t bij: hij wordt."],doe:"Schrijf je naam groot in de lucht."},
 buur:{t:["Voor 14 komt 13. Na 14 komt 15.","47 ligt het dichtst bij 50. Bij 5 of meer: omhoog.","Kijk naar het cijfer erachter: 3,47 wordt 3,5."],doe:"Ga op een rij staan, van klein naar groot."},
 mix:{t:["Kijk eerst: is het plus of min?","Kijk eerst: is het keer of delen?","Kijk eerst naar het teken. Gebruik een som die je kent."],doe:"Tien sprongen op de plaats. Tel hardop!"}
};
S.forEach(function(m){m.kort=KORT[m.id].t;m.doe=KORT[m.id].doe});
var KERN={kort:["splits","dubbel","tien","sprong","tafela","woord"],vast:["splits","tafela","woord"]};
return{lang:"nl",T:T,TYPES:TYPES,TIK:TIK,NOOR:NOOR,ROOMS:ROOMS,OPEN:OPEN,OPEN0:OPEN0,CLIFF:CLIFF,CLIFFLAST:CLIFFLAST,REVEAL:REVEAL,REVEAL0:REVEAL0,S:S,KORT:KERN.kort,VAST:KERN.vast,TAFELS:TAFELS,FLN:[5,6,8],FREE:false,
  LEADNOTE:"De kinderen hoeven bijna niets te lezen: per plek één korte regel en dan drie rondes oefenen. Zet voorlezen aan voor groep 3–4. Laat de telefoon na elke som doorgeven, zodat ieder kind aan de beurt komt. Een foute som komt vanzelf terug. Op de scorekaart staan de sterren per plek: één ster betekent nog oefenen. De uitleg, beweegideeën en napraatvragen hieronder zijn voor jou.",
  LES:[
   {intro:["Vertel van het fietsslot van meneer Tik en vraag: welke som weet jij zonder te tellen? Laat een paar kinderen er een noemen. Dat heet: iets vlot weten.","Oefen samen de verliefde harten met tien vingers: steek er een paar op, de klas roept hoeveel er omgevouwen zijn.","Teams van 3–5 met een volwassene, één telefoon per team, zaakcode invullen. Zet voorlezen aan. Afspraak: om de beurt antwoord geven, en helpen mag pas als iemand erom vraagt."],
    na:["Welke truc vonden jullie het handigst? Laat een kind hem voordoen.","Kijk op de scorekaarten: bij welke plek stond maar één ster? Kies er met de klas één uit en oefen die deze week elke dag drie minuten.","Oefenkaartjes maken: ieder kind schrijft drie sommen die nog niet vanzelf gaan op een kaartje, met het antwoord achterop. Oefenen in tweetallen.","Thuisopdracht: doe de verliefde harten voor aan iemand thuis, en vraag welke som díe nog moet uittellen."],
    doelen:"Groep 3–4 (SLO rekenen-wiskunde, basisbewerkingen; kerndoel 26/27): splitsingen tot 10 memoriseren, optellen en aftrekken tot 10 gememoriseerd en tot 20 geautomatiseerd, dubbelen en halveren, tellen met sprongen van 2, 5 en 10, eerste tafels (1, 2, 5, 10), buurgetallen. Taal (spelling): klankzuivere woorden, lange en korte klank."},
   {intro:["Vraag: wat is het verschil tussen een som uitrekenen en een som weten? Laat 7 × 8 eerst uitrekenen (hoe doe je dat?) en vertel dan het ezelsbruggetje 5-6-7-8.","Leg uit: op elke plek drie rondes (typen, goed of fout, kiezen). Een foute som komt terug: dat is geen straf maar precies de bedoeling.","Teams van 3–5, één telefoon per team, zaakcode invullen. Afspraak: de telefoon gaat na elke som door, en eerst goed, dan snel."],
    na:["Zet de sterren van de teams naast elkaar: bij welke plek ging het het vlotst, bij welke het moeizaamst? Dat is het oefenprogramma voor de komende weken.","Laat teams een steunsom uitleggen: hoe kom je van een som die je weet bij een som die je niet weet?","Maak een tafelkaart per kind: kleur groen wat direct gaat, oranje wat via een steunsom gaat, rood wat nog niet lukt. Herhaal na twee weken.","Verdieping: laat kinderen een eigen ezelsbruggetje bedenken voor hun lastigste tafelsom en hang ze op."],
    doelen:"Groep 5–6 (SLO rekenen-wiskunde, basisbewerkingen; kerndoel 27): optellen en aftrekken tot 100 geautomatiseerd, tafels van 1 tot en met 10 gememoriseerd, deeltafels geautomatiseerd, vermenigvuldigen en delen met 10 en 100, helft en kwart, afronden op tientallen en honderdtallen. Taal (spelling): klankgroepen (open en gesloten lettergreep), verlengingsregel, tweetekenklanken."},
   {intro:["Vraag: waarom zou je in groep 7 of 8 nog tafels oefenen? Laat een redactiesom zien en bespreek waar het werkgeheugen vol raakt als je de basis moet uitrekenen.","Bespreek gespreid oefenen: vijf minuten per dag werkt beter dan een half uur per week. Laat leerlingen voorspellen bij welke plek ze het vlotst zijn.","Teams van 3–5, één telefoon per team, zaakcode invullen. Afspraak: de telefoon gaat na elke som door; wie niet aan de beurt is, schat of het antwoord kan kloppen."],
    na:["Vergelijk de voorspelling met het resultaat: bij welke plek zat het verschil? Wat zegt dat over wat je denkt te kunnen en wat je paraat hebt?","Leg de tabel breuk-procent-kommagetal samen aan (1/2, 1/4, 3/4, 1/5, 1/10, 1/8) en hang hem op. Welke gebruik je bij korting, welke bij kansen?","Werkwoordspelling: laat teams hun eigen beslisschema tekenen en test het op vijf zinnen van een ander team.","Verdieping: maak een persoonlijk oefenplan voor twee weken (wat, hoe vaak, hoe controleer je) en evalueer het daarna."],
    doelen:"Groep 7–8 (SLO rekenen-wiskunde; kerndoel 27/28 en referentieniveau 1F/1S): basisbewerkingen tot 1000 en met eenvoudige kommagetallen vlot uit het hoofd, tafels tot en met 12 en steunsommen, vermenigvuldigen en delen met 10, 100 en 1000, veelvoorkomende breuken, procenten en kommagetallen in elkaar omzetten, afronden en schattend controleren. Taal (spelling, 1F/2F): werkwoordspelling tegenwoordige tijd en voltooid deelwoord."}
  ]}
})();
