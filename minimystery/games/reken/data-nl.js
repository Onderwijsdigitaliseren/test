/* Professor Nul en de verdwenen cijfers – MiniMystery Educatie (rekenen, groep 3–8). Teksten en rekenstations (NL).
   Alle cijfers van de school zijn weg: van de klok, de deuren, de kalender, de kassa. Professor Nul vindt getallen overbodig.
   Op plekken rond (of in) de school staan "rekenstations": daar bewijst het team dat je getallen nodig hebt door echt iets te
   tellen, meten, schatten of rekenen. Elke station geeft een getalsleutel. In de finale zetten ze de getallen op volgorde:
   dan gaat de getallenkluis open en komen de cijfers terug.
   Niveaus: 0 = groep 3–4 (tot 20/100, tellen, meten met stappen, hele en halve uren, geld tot 10; twee plaatjes als antwoord, alles
   wordt voorgelezen) · 1 = groep 5–6 (tot 1000, tafels, cm/m, kwartieren, geld met komma, halve en kwart) · 2 = groep 7–8 (grote
   getallen, kommagetallen, procenten, verhoudingen, oppervlakte, schaal, gemiddelde).
   Per station: intro, act {out,in} (de meting), lvl[3] (kind text/choice/count/word/clock; count = eerst iets tellen, dan fn(x)
   geeft de vervolgvraag), tip (het leermoment na het antwoord). */
window.RK_DATA=(function(){
var Y=new Date().getFullYear();
var T={
  today:"Start de zaak van vandaag",extra:"Extra zaak",voice:"Voorlezen",voiceOn:"Voorlezen staat aan",voiceOff:"Voorlezen staat uit",
  start:"Open het rekenstation",next:"Verder ▸",back:"Terug",close:"Sluiten",cancel:"Annuleren",ok:"Controleer ▸",listen:"Voorlezen",
  loc:"Waar zijn jullie? De telefoon vraagt om je locatie.",pois:"Juf Noor zoekt rekenstations in de buurt…",nomap:"De kaartdienst is druk. We spelen op een getekende plattegrond.",
  noGps:"Deze telefoon heeft geen gps.",denied:"De locatie staat uit. Zet hem aan in de instellingen, of speel zonder kaart.",fail:"Dat lukte niet",
  corner:"Hoek",task:"Station {i} van {n}",clue:"Getalsleutel {n} van {t}",
  near:"Volgend station op {d} m",warm:"Warm! Nog {d} m",hot:"Heet! Hier staat een station",radarAll:"Alle getalsleutels! Naar de getallenkluis.",
  here:"Hier is een rekenstation",look:"Open het station",walk:"Loop erheen",gps:"We staan er echt (gps twijfelt)",
  notebook:"Rekenboekje",nbK:"Getalsleutels",nbM:"Jullie metingen",nbNone:"Nog niets gevonden. Loop naar het eerste station.",
  menu:"Menu",mBack:"Terug naar de zaak",mHome:"Pauze, later verder",mWipe:"Deze zaak wissen",mLead:"Begeleidersblad",saved:"Opgeslagen. Je kunt later verdergaan.",
  wipe:"Wissen",wipeY:"Deze zaak wissen",wipeAll:"Alles wissen (ook het archief)",wipeQ:"Zaak wissen?",wipeT:"De voortgang is dan weg.",allQ:"Alles wissen?",allT:"Zaak, archief en instellingen worden gewist.",allY:"Ja, alles wissen",wiped:"Gewist",
  dH:"Zaakcode invullen",dT:"Met een zaakcode spelen meer telefoons dezelfde zaak: dezelfde plekken, dezelfde stations. Elke klas of groep krijgt zo één zaak voor alle teams.",dGo:"Zaak ophalen",dBad:"Die code kennen we niet. Codes beginnen met RK.",
  demoCase:"Proefronde · getekende stad",demoTip:"Tik op een plek op de kaart: jullie groepje loopt er vanzelf heen.",
  howH:"Hoe werkt het?",
  won:"Cijfers terug",dipBtn:"Diploma (A4)",dipH:"Diploma Rekenspeurder",dipNote:"Printen of opslaan. Eén per team, of print er voor elk kind een.",leadBtn:"Begeleidersblad",home:"Naar het begin",dl:"Opslaan",shareBtn:"Delen",copied:"Gekopieerd",
  shareTxt:"Wij hebben de cijfers teruggehaald! Zaak {c} · {s} · {m} min. ",missed1:"Zonder hints: drie sterren.",
  pzT:"Overleg samen. Eén iemand typt.",wrong:"Nog niet goed. Reken nog eens samen.",wrongHint:"Nog niet goed. Pak de hint, of reken nog eens samen.",hintBtn:"💡 Hint",hintUsed:"Hint gebruikt",
  countGo:"Ingevuld ▸",photoGo:"📷 Maak de foto",photoAgain:"Nog een keer",photoOk:"Dit is hem! ▸",photoKeep:"De foto blijft op deze telefoon.",
  keyGet:"Een getalsleutel:",tipH:"Rekentip",
  finH:"De getallenkluis",finT:"Tik jullie getalsleutels aan van klein naar groot. Klopt de volgorde, dan gaat de kluis open.",finT0:"Tik de getallen aan: eerst het kleinste, dan steeds een grotere.",finBad:"Die is niet de kleinste die overblijft. Begin opnieuw.",finHint:"Kijk eerst welk getal het kleinst is. Bij kommagetallen: kijk naar het getal vóór de komma.",finHint0:"Het kleinste getal eerst. Tel maar: welke komt het eerst als je telt?",finNot:"Eerst alle stations doen. Nog {n} te gaan.",finOk:"KLIK! De kluis is open. Alle cijfers stromen terug!",
  stripT:"Zaak {c}",keysBar:"Getalsleutels",
  gbH:"In het gebouw",gbT:"Kies de plekken in jullie school. De begeleider hangt op elke plek een kaartje met een code (printen via het begeleidersblad). Teams gaan naar de plek en typen de code.",gbNoCards:"Zonder kaartjes (teams drukken zelf op 'We zijn er')",gbGo:"Zaak starten",gbMin:"Kies minstens {n} plekken (of de plekken worden herhaald).",
  gbGoto:"Ga naar:",gbCode:"Typ de code van het kaartje op die plek",gbHere:"We zijn er ▸",gbBad:"Die code hoort niet bij deze plek. Kijk nog eens op het kaartje.",gbCards:"Plekkaartjes (ophangen)",gbCardT:"Rekenstation",
  leadH:"Begeleidersblad",leadT:"Alleen voor de begeleider. Dit blad hoort bij deze zaakcode: alle teams met deze code krijgen precies deze stations.",leadTeams:"Teamstand (zelf bijhouden)",leadTeam:"Team",leadDone:"Klaar om",leadPrint:"Printen",leadCode:"Zaakcode",
  lvl:["groep 3–4","groep 5–6","groep 7–8"],
  nw:{6:"zes",8:"acht",10:"tien"},
  clockQ:["Hoe laat is het op deze klok?","Hoe laat is het op deze klok? Typ als uu:mm, bijvoorbeeld 8:15.","Hoe laat is het op deze klok? Typ als uu:mm, bijvoorbeeld 8:35."],
  kv:{fp:["Fietsenstalling","Bushalte","Speeltuin","Schoolplein","Brug","Park","Kerk","Plein","Winkel","Brievenbus","Kiosk","Bankje"],
    all:"Alle getalsleutels! Naar de kluis.",near:"Station op {d} m",cold:"Koud… loop een andere kant op",cool:"Lauw. Dichterbij komt-ie",warm:"Warm! Goed zo!",hot:"HEET! Kijk om je heen!",here:"Hier is het station!",first:"Loop maar, het kompas wijst de weg",noDir:"Loop een stukje, dan weet het kompas de richting",
    map:"Plattegrond",kids:"Verhaalkaart",mapTip:"De echte plattegrond. Tik op Verhaalkaart voor de kindertekening.",goDemo:"We lopen (nep) naar {p}…",inSteps:"Nog {n} stappen",
    mNoMap:"Verder zonder kaart (zelfde zaak)",switched:"Verder zonder kaart. Dezelfde zaak, dezelfde stations.",virtOut:"Geen plattegrond van de buurt gevonden. Jullie lopen op de verhaalkaart: de pijl en warm/koud wijzen de weg.",
    noMapQ:"Geen locatie vandaag?",noMapT:"De telefoon geeft geen locatie door. Jullie kunnen dezelfde zaak zonder kaart spelen: de stations komen dan achter elkaar en jullie lopen zelf naar een nieuwe plek.",noMapGo:"Verder zonder kaart",
    inH:"Binnen: lopen op de plaats",inT:"Jullie lopen op de verhaalkaart. Loop op de plaats (of door de ruimte) met de telefoon in je hand; elke stap telt. Lukt dat niet, dan lopen de stappen vanzelf.",inSensor:"Echte stappen tellen",inTempo:"Stappen lopen vanzelf",inNoSensor:"Geen bewegingssensor gevonden. De stappen lopen nu vanzelf."}
};
var TYPES={kerk:"de kerk",hotel:"het hotel",bank:"de bank",apotheek:"de apotheek",cafe:"het café",bieb:"de bibliotheek",park:"het park",school:"de school",kunst:"het kunstwerk",tank:"het tankstation",winkel:"de winkel",halte:"de bushalte",post:"de brievenbus",bankje:"het bankje",hoek:"de hoek"};
var TIK="Meneer Tik",NOOR="Juf Noor",NUL="Professor Nul";
var ROOMS=["De hal bij de ingang","De aula","De gymzaal","De bibliotheek of leeshoek","De trap","Bij de lerarenkamer","De keuken","Het schoolplein","Een kleuterlokaal","Een bovenbouwlokaal","Bij de directiekamer","De fietsenstalling","Het speellokaal","De kapstokken"];
var OPEN={
  school:"Vanmorgen was er iets vreemds. De klok in de hal had geen cijfers meer. De deuren van de lokalen ook niet. De kalender was leeg en de kassa van de kantine deed het niet. Op het bord stond: \"Getallen zijn overbodig. Ik heb ze opgeborgen in mijn kluis. – Professor Nul.\" Maar zonder getallen weet niemand hoe laat het is, waar lokaal 7 is, of wat een broodje kost. Jullie gaan Professor Nul ongelijk geven. Op {N} plekken staat een rekenstation. Daar tellen, meten of rekenen jullie iets echts. Elk station geeft een getalsleutel. Met alle sleutels op volgorde gaat de kluis open.",
  bso:"Alle cijfers zijn weg! Van de klok, van de deuren, van de kalender, van de kassa. Op het bord staat met grote letters: \"Getallen zijn overbodig. Ik heb ze opgeborgen in mijn kluis. – Professor Nul.\" Nou, probeer maar eens een broodje te kopen zonder getallen! Jullie laten Professor Nul zien dat hij ongelijk heeft. Op {N} plekken staat een rekenstation. Daar tellen, meten of rekenen jullie iets echts uit de buurt. Elk station geeft een getalsleutel. Alle sleutels op volgorde: dan kraakt de kluis."
};
var OPEN0={
  school:"Alle cijfers zijn weg! De klok heeft geen cijfers meer. De deuren ook niet. Professor Nul heeft ze in zijn kluis gestopt. Hij zegt: getallen heb je niet nodig. Maar zonder getallen weet je niet hoe laat het is! Op {N} plekken staat een rekenstation. Daar tellen en meten jullie iets echts. Elk station geeft een getal. Alle getallen op volgorde: dan gaat de kluis open.",
  bso:"Alle cijfers zijn weg! Van de klok, van de deuren, van de kassa. Professor Nul heeft ze in zijn kluis gestopt. Hij zegt: getallen heb je niet nodig. Pff! Op {N} plekken staat een rekenstation. Daar tellen en meten jullie iets echts. Elk station geeft een getal. Alle getallen op volgorde: dan gaat de kluis open!"
};
var CLIFF=["Zie je wel, Professor Nul? Zonder getallen gaat het niet.","Goed gemeten. Zo doen landmeters het ook.","Weer een getalsleutel. Bewaar hem in het rekenboekje.","Professor Nul mompelt iets. Volgens mij twijfelt hij al.","Rekenen met echte dingen: dat kan niet iedereen.","Op naar het volgende station!"];
var CLIFFLAST="Dat was het laatste station! Nu alle getalsleutels op volgorde, dan gaat de kluis open.";
var REVEAL={
  school:"<p>KLIK. De getallenkluis zwaait open en de cijfers stromen eruit: terug naar de klok, naar de deuren, naar de kalender. Professor Nul staat erbij met zijn armen over elkaar.</p><p>\"Goed,\" bromt hij. \"Jullie hebben gemeten, geteld, geschat en gerekend. Met echte stappen en echte ramen en echte euro's. Misschien… zijn getallen toch handig.\"</p><p>Juf Noor lacht. \"Misschien?\" Professor Nul kijkt op de klok, die weer cijfers heeft. \"Hm. Kwart over elf. Tijd voor koffie. Dat wist ik net nog niet.\"</p>",
  bso:"<p>KLIK! De getallenkluis zwaait open en de cijfers vliegen eruit: terug naar de klok, naar de deuren, naar de kassa. Professor Nul staat erbij met een rood hoofd.</p><p>\"Oké, oké,\" moppert hij. \"Jullie hebben gemeten en geteld en gerekend. Met echte stappen en echte ramen en echte euro's. Getallen zijn… misschien… een klein beetje handig.\"</p><p>Meneer Tik grijnst en kijkt op de klok. \"Kwart over elf, professor. Tijd voor koffie. Zonder getallen had u dat nooit geweten.\"</p>"
};
var REVEAL0={
  school:"<p>KLIK! De kluis gaat open. Alle cijfers stromen eruit, terug naar de klok en de deuren.</p><p>Professor Nul kijkt sip. \"Jullie hebben geteld en gemeten. Getallen zijn… toch wel handig.\"</p><p>Juf Noor lacht. De klok heeft weer cijfers!</p>",
  bso:"<p>KLIK! De kluis gaat open. Alle cijfers vliegen eruit, terug naar de klok en de deuren.</p><p>Professor Nul wordt rood. \"Oké, oké. Getallen zijn toch wel handig.\"</p><p>Meneer Tik grijnst. De klok heeft weer cijfers!</p>"
};
/* getalsleutels per niveau: unieke waarden, gesorteerd in de finale. s = tekst, v = waarde */
var KEYS=[
  [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(function(n){return{s:String(n),v:n}}),
  [48,84,120,102,250,205,360,306,480,408,550,505,700,670,890,980,1000,1100].map(function(n){return{s:String(n),v:n}}),
  [{s:"0,5",v:.5},{s:"¼",v:.25},{s:"0,75",v:.75},{s:"⅔",v:.667},{s:"1,2",v:1.2},{s:"1,05",v:1.05},{s:"2,5",v:2.5},{s:"10%",v:.1},{s:"⅓",v:.333},{s:"1½",v:1.5},{s:"0,9",v:.9},{s:"3,14",v:3.14},{s:"⅕",v:.2},{s:"2",v:2},{s:"0,07",v:.07},{s:"5%",v:.05},{s:"4,5",v:4.5},{s:"1,75",v:1.75}]
];
var ch=function(q,a,hint,opts){return{kind:"choice",q:q,c:opts,a:a,hint:hint}};
var pics=function(q,a,hint,o1,o2){return{kind:"choice",q:q,c:[{e:o1[0],t:o1[1]},{e:o2[0],t:o2[1]}],a:a,hint:hint}};
var S=[
{id:"stappen",ico:"👣",dom:"meten",title:"Meten met stappen",
 intro:"Vroeger maten mensen met hun lichaam: voeten, duimen, stappen. Een landmeter zonder meetlint doet het nog steeds zo. Kies een punt vlakbij (een paal, een boom, een deur) en loop erheen met grote stappen. Tel ze.",
 act:{out:"Loop van hier naar de dichtstbijzijnde paal of boom met grote stappen. Tel hardop. Loop daarna terug en tel nog eens: klopt het?",in:"Loop de gang (of het lokaal) van de ene muur naar de andere met grote stappen. Tel hardop. Terug en nog eens: klopt het?"},
 tip:["Een grote stap van een kind is ongeveer een halve meter. Twee stappen is dus een meter.","Een grote stap is ongeveer 50 cm. Landmeters meten nu met een laser, maar schatten doen ze nog steeds met stappen.","Een stap van 60 cm: 100 stappen is 60 meter. Zo kun je overal schatten hoe ver iets is, ook zonder meetlint."],
 lvl:[{kind:"count",pre:"Hoeveel stappen waren het?",fn:function(x){return{kind:"choice",q:x+" stappen. Is dat meer of minder dan 10?",c:[{e:"🔼",t:"Meer dan 10"},{e:"🔽",t:"Minder dan 10"}],a:x>10?0:1}},hint:"Tel tot 10 op je vingers. Had je meer stappen?"},
      {kind:"count",pre:"Hoeveel grote stappen waren het?",fn:function(x){return{q:x+" stappen. Een grote stap is ongeveer een halve meter. Hoeveel meter is het ongeveer? (hele meters, naar beneden afronden)",a:[String(Math.floor(x/2))]}},hint:"Twee stappen is een meter. Deel het aantal stappen door 2."},
      {kind:"count",pre:"Hoeveel grote stappen waren het?",fn:function(x){return{q:x+" stappen van ongeveer 60 cm. Hoeveel meter is dat? Typ met komma, bijvoorbeeld 7,2.",a:[String(x*60/100).replace(".",","),String(x*60/100)]}},hint:"Stappen × 60 = centimeters. Deel door 100 voor meters."}]},
{id:"ramen",ico:"🪟",dom:"vermenigvuldigen",title:"Ramen tellen",
 intro:"Een architect telt ramen om te weten hoeveel glas hij nodig heeft. Zoek het gebouw dat het dichtst bij staat en tel de ramen aan de voorkant. Samen, anders tel je er een dubbel.",
 act:{out:"Tel de ramen aan de voorkant van het dichtstbijzijnde gebouw. Elk teamlid telt, dan vergelijken.",in:"Tel alle ramen in dit lokaal of deze ruimte. Elk teamlid telt, dan vergelijken."},
 tip:["Tellen gaat makkelijker in groepjes: eerst de ramen op de eerste rij, dan de tweede.","Staan de ramen in rijen? Dan hoef je niet alles te tellen: rijen × ramen per rij.","Keer-sommen zijn tellen in groepjes. 4 rijen van 6 ramen = 24, zonder ze alle 24 aan te wijzen."],
 lvl:[{kind:"count",pre:"Hoeveel ramen hebben jullie geteld?",fn:function(x){return{q:x+" ramen. Er komt 1 raam bij. Hoeveel ramen zijn het dan?",a:[String(x+1)]}},hint:"Eentje meer dan jullie telden."},
      {kind:"count",pre:"Hoeveel ramen hebben jullie geteld?",fn:function(x){return{q:x+" ramen. Elk raam heeft 2 gordijnen. Hoeveel gordijnen zijn dat samen?",a:[String(x*2)]}},hint:"Het aantal ramen keer 2."},
      {kind:"count",pre:"Hoeveel ramen hebben jullie geteld?",fn:function(x){return{q:x+" ramen. Een ruit kost € 45 om te vervangen. Een storm maakt een kwart van de ruiten kapot (rond naar beneden af). Hoeveel kost dat?",a:[String(Math.floor(x/4)*45)]}},hint:"Eerst het aantal ramen delen door 4 (afronden naar beneden), dan × 45."}]},
{id:"nummer",ico:"🔢",dom:"getallen",title:"Het huisnummer",
 intro:"Huisnummers hebben een systeem: aan de ene kant van de straat even, aan de andere kant oneven. Zoek het dichtstbijzijnde huisnummer (of een nummer op een deur).",
 act:{out:"Zoek een huisnummer. Kijk ook naar het huis ernaast: welk nummer staat daar?",in:"Zoek een nummer op een deur of lokaal. Kijk ook naar de deur ernaast."},
 tip:["Even getallen eindigen op 0, 2, 4, 6 of 8. Oneven op 1, 3, 5, 7 of 9.","Postbodes rekenen zo: aan dezelfde kant tellen de nummers steeds 2 op. Nummer 12 en nummer 16 zijn buren van nummer 14.","De som van de cijfers heet de cijfersom. Deelbaar door 3? Dan is het getal zelf ook deelbaar door 3."],
 lvl:[{kind:"count",pre:"Welk nummer zien jullie? (alleen het getal)",fn:function(x){return{kind:"choice",q:"Nummer "+x+". Is dat even of oneven?",c:[{e:"2️⃣",t:"Even"},{e:"1️⃣",t:"Oneven"}],a:x%2===0?0:1}},hint:"Even getallen eindigen op 0, 2, 4, 6 of 8."},
      {kind:"count",pre:"Welk nummer zien jullie? (alleen het getal)",fn:function(x){return{q:"Nummer "+x+". Welk nummer staat er waarschijnlijk drie huizen verder aan dezelfde kant?",a:[String(x+6)]}},hint:"Aan dezelfde kant tellen de nummers steeds 2 op. Drie huizen verder is dus +6."},
      {kind:"count",pre:"Welk nummer zien jullie? (alleen het getal)",fn:function(x){var r=parseInt(String(x).split("").reverse().join(""),10);return{q:"Nummer "+x+". Draai de cijfers om (van 47 maak je 74). Hoeveel is het omgedraaide getal min het echte getal? (kan negatief zijn, typ dan een min ervoor)",a:[String(r-x)]}},hint:"Eerst omdraaien, dan aftrekken: omgedraaid min echt."}]},
{id:"palen",ico:"💡",dom:"patronen",title:"Lantaarnpalen",
 intro:"Lantaarnpalen staan op vaste afstanden: dat is een patroon. Wie het patroon kent, hoeft niet alles te tellen. Tel hoeveel palen jullie vanaf hier zien.",
 act:{out:"Tel de lantaarnpalen die je vanaf hier ziet, zonder te lopen. Kijk ook: staan ze even ver uit elkaar?",in:"Tel de lampen aan het plafond van deze ruimte. Hangen ze in rijen?"},
 tip:["Dingen op een rij kun je tellen met sprongen: 2, 4, 6, 8.","Tussen 5 palen zitten maar 4 tussenruimtes. Dat vergeten veel mensen.","Het hekjesprobleem: tussen n palen zitten n−1 ruimtes. Belangrijk bij afstanden én bij hekken."],
 lvl:[{kind:"count",pre:"Hoeveel palen (of lampen) zien jullie?",fn:function(x){return{q:x+" palen. Elke paal heeft 1 lamp. Hoeveel lampen zijn dat?",a:[String(x)]}},hint:"Net zoveel lampen als palen."},
      {kind:"count",pre:"Hoeveel palen (of lampen) zien jullie?",fn:function(x){return{q:x+" palen. Elke paal heeft 2 lampen. 's Avonds is er 1 lamp kapot. Hoeveel lampen branden er?",a:[String(Math.max(0,x*2-1))]}},hint:"Eerst 2 × het aantal palen, dan 1 eraf."},
      {kind:"count",pre:"Hoeveel palen (of lampen) zien jullie?",fn:function(x){return{q:x+" palen met steeds 30 meter ertussen. Hoeveel meter is het van de eerste tot de laatste paal?",a:[String(Math.max(0,(x-1)*30))]}},hint:"Tussen de palen zitten (aantal − 1) tussenruimtes. Keer 30."}]},
{id:"klok",ico:"🕐",dom:"tijd",title:"De klok zonder cijfers",
 intro:"Professor Nul heeft de cijfers van de klok gehaald. Maar de wijzers zijn er nog. Kunnen jullie de tijd toch aflezen? De kleine wijzer wijst het uur, de grote wijzer de minuten.",
 act:{out:"Doe eerst samen een klok na: in een kring, twee kinderen zijn de wijzers. Zet 'm op 3 uur. Dan de klok op het scherm.",in:"Doe eerst samen een klok na: in een kring, twee kinderen zijn de wijzers. Zet 'm op 3 uur. Dan de klok op het scherm."},
 tip:["De kleine wijzer is de uurwijzer. Staat hij op de 3, dan is het 3 uur.","De grote wijzer op de 3 is kwart over, op de 6 half, op de 9 kwart voor.","Elk streepje is een minuut, elk cijfer 5 minuten. De grote wijzer op de 7: 7 × 5 = 35 minuten."],
 lvl:[{kind:"clock",hint:"Kijk naar de korte wijzer: op welk cijfer wijst hij?"},{kind:"clock",hint:"Korte wijzer = uur. Lange wijzer op 3 = kwart over, op 6 = half, op 9 = kwart voor."},{kind:"clock",hint:"Lange wijzer: elk cijfer is 5 minuten. Tel in sprongen van 5."}]},
{id:"kassa",ico:"🧾",dom:"geld",title:"De kassa zonder cijfers",
 intro:"De kassa van de kantine is leeg: geen prijzen, geen bedragen. Doe alsof jullie de kantine zijn. Zonder getallen kun je niet afrekenen, dus jullie moeten het uit het hoofd doen.",
 act:{out:"Verzin samen drie dingen die je bij een kiosk of winkel hier zou kopen. Wat zouden ze kosten? Dan de som.",in:"Verzin samen drie dingen uit de schoolkantine. Wat zouden ze kosten? Dan de som."},
 tip:["Bij 2 euro en 3 euro samen tel je gewoon op: 5 euro.","Terugkrijgen is aftrekken: 5 euro betalen, 2,50 kost het, dus 2,50 terug.","Korting in procenten: 25% is een kwart. Bij € 8 is dat € 2 korting. 'Drie halen, twee betalen' is 33% korting."],
 lvl:[pics("Een appel kost 1 euro. Je koopt er 3. Hoeveel euro betaal je?",1,"1 + 1 + 1.",["2️⃣","2 euro"],["3️⃣","3 euro"]),
      {kind:"text",q:"Een broodje kost € 2,50 en een pakje drinken € 1,25. Je betaalt met € 5. Hoeveel krijg je terug? Typ als 1,25.",a:["1,25","1.25","125"],hint:"Eerst optellen: 2,50 + 1,25. Dan: 5 min dat bedrag."},
      {kind:"text",q:"Een pak koekjes kost € 1,80. Deze week: 'drie halen, twee betalen'. Hoeveel kosten drie pakken? Typ als 3,60.",a:["3,60","3.60","3,6","3.6","360"],hint:"Je betaalt er twee: 2 × 1,80."}]},
{id:"tegels",ico:"🟫",dom:"oppervlakte",title:"Stoeptegels",
 intro:"Een stratenmaker telt tegels om te weten hoeveel hij nodig heeft. Een stoep is een rooster: rijen en kolommen. Zoek een stuk stoep (of een vloer met tegels).",
 act:{out:"Tel hoeveel tegels er naast elkaar liggen (de breedte van de stoep). Tel ook hoeveel tegels er in de lengte liggen tot aan de volgende paal of boom.",in:"Zoek een vloer met tegels (hal, toilet, keuken). Tel de tegels in de breedte en in de lengte."},
 tip:["Een stoeptegel is meestal een vierkant: vier gelijke zijden, vier hoeken.","Tegels in een rooster: rijen × kolommen. Zo reken je oppervlakte uit zonder alles te tellen.","Een stoeptegel is 30 × 30 cm = 900 cm². Ruim 11 tegels zijn samen 1 m²."],
 lvl:[{kind:"count",pre:"Hoeveel tegels liggen er naast elkaar?",fn:function(x){return{q:x+" tegels naast elkaar. Hoeveel hoeken heeft één tegel? Typ het getal.",a:["4"]}},hint:"Een vierkant heeft net zoveel hoeken als zijden."},
      {kind:"count",pre:"Hoeveel tegels liggen er naast elkaar (de breedte)?",fn:function(x){return{q:x+" tegels breed. In de lengte liggen 12 rijen. Hoeveel tegels zijn dat samen?",a:[String(x*12)]}},hint:"Breedte × lengte: "+"aantal × 12."},
      {kind:"count",pre:"Hoeveel tegels liggen er naast elkaar (de breedte)?",fn:function(x){return{q:x+" tegels breed, elke tegel 30 cm. Hoe breed is de stoep in meters? Typ met komma, bijvoorbeeld 1,8.",a:[String(x*30/100).replace(".",","),String(x*30/100)]}},hint:"Tegels × 30 = centimeters. Deel door 100."}]},
{id:"verkeer",ico:"🚗",dom:"statistiek",title:"Verkeer tellen",
 intro:"De gemeente telt verkeer om te weten of een straat veilig is. Dat doen jullie nu ook. Eén teamlid houdt de tijd, de rest telt: alles wat voorbijkomt op wielen (auto's, fietsen, scooters).",
 act:{out:"Tel één minuut lang alles op wielen dat voorbijkomt. Gebruik de tijd bovenin het scherm. Iedereen telt, dan vergelijken.",in:"Tel één minuut lang hoeveel mensen er langs deze plek lopen. Gebruik de tijd bovenin het scherm."},
 tip:["Turven helpt bij tellen: een streepje per auto, het vijfde streepje erdoorheen.","Per minuut × 60 = per uur. Zo schat de gemeente hoe druk een straat is.","Eén minuut is een kleine steekproef. Hoe langer je telt, hoe betrouwbaarder de schatting."],
 lvl:[{kind:"count",pre:"Hoeveel hebben jullie geteld in één minuut?",fn:function(x){return{kind:"choice",q:x+" in één minuut. Was dat veel of weinig?",c:[{e:"🚗🚗🚗",t:"Meer dan 5"},{e:"🚗",t:"5 of minder"}],a:x>5?0:1}},hint:"Tel op je vingers: meer dan één hand vol?"},
      {kind:"count",pre:"Hoeveel hebben jullie geteld in één minuut?",fn:function(x){return{q:x+" in één minuut. Hoeveel is dat in 10 minuten, als het zo blijft?",a:[String(x*10)]}},hint:"Keer 10: er komt een 0 achter."},
      {kind:"count",pre:"Hoeveel hebben jullie geteld in één minuut?",fn:function(x){return{q:x+" in één minuut. Hoeveel is dat per uur, als het zo blijft?",a:[String(x*60)]}},hint:"Een uur is 60 minuten. Keer 60."}]},
{id:"koekjes",ico:"🍪",dom:"delen",title:"Eerlijk delen",
 intro:"Juf Noor heeft koekjes gebakken voor alle teams. Maar zonder getallen weet ze niet hoe ze moet verdelen. Met hoeveel zijn jullie?",
 act:{out:"Ga in een kring staan en tel af: 1, 2, 3… Hoeveel teamleden zijn er?",in:"Ga in een kring staan en tel af: 1, 2, 3… Hoeveel teamleden zijn er?"},
 tip:["Delen is eerlijk verdelen: iedereen evenveel.","Blijft er iets over? Dat heet de rest. 13 koekjes voor 4 kinderen: ieder 3, en 1 over.","Een breuk is een deelsom: ¾ van 24 is 24 : 4 × 3 = 18."],
 lvl:[{kind:"count",pre:"Met hoeveel zijn jullie?",fn:function(x){return{q:"Jullie zijn met "+x+". Iedereen krijgt 2 koekjes. Hoeveel koekjes zijn dat samen?",a:[String(x*2)]}},hint:"Tel per kind twee koekjes: 2, 4, 6…"},
      {kind:"count",pre:"Met hoeveel zijn jullie?",fn:function(x){return{q:"Jullie zijn met "+x+". Er zijn 24 koekjes. Hoeveel krijgt ieder, en hoeveel blijven er over? Typ: aantal per kind, dan een spatie, dan de rest (bijv. 4 2).",a:[Math.floor(24/x)+" "+(24%x),Math.floor(24/x)+","+(24%x)]}},hint:"Hoe vaak past "+"jullie aantal in 24? Wat blijft er over?"},
      {kind:"count",pre:"Met hoeveel zijn jullie?",fn:function(x){return{q:"Jullie zijn met "+x+". Er zijn 60 koekjes voor 5 teams. Jullie team krijgt een eerlijk deel. Hoeveel koekjes krijgt elk teamlid? (rond naar beneden af)",a:[String(Math.floor(12/x))]}},hint:"Eerst 60 : 5 = 12 koekjes voor jullie team. Dan 12 : jullie aantal."}]},
{id:"hoogte",ico:"🌳",dom:"schatten",title:"Hoe hoog is dat?",
 intro:"Niemand kan een boom of gebouw opmeten met een meetlint. Toch weten landmeters hoe hoog het is: door slim te vergelijken. Zoek het hoogste ding dat je ziet.",
 act:{out:"Kijk naar het hoogste gebouw of de hoogste boom. Hoeveel kinderen van jullie lengte zouden op elkaar moeten staan om net zo hoog te zijn? Schat het samen.",in:"Kijk naar de hoogte van deze ruimte. Hoeveel kinderen van jullie lengte zouden op elkaar moeten staan om bij het plafond te komen? Schat het samen."},
 tip:["Schatten is slim raden: je vergelijkt met iets dat je kent, zoals je eigen lengte.","Een verdieping is ongeveer 3 meter. Tel de verdiepingen en je weet ongeveer de hoogte.","Met schaduwen: als jouw schaduw 2× zo lang is als jijzelf, is de schaduw van de boom ook 2× de boom. Zo meet je hoogte zonder te klimmen."],
 lvl:[{kind:"count",pre:"Hoeveel kinderen op elkaar?",fn:function(x){return{kind:"choice",q:x+" kinderen op elkaar. Is dat hoger dan een huis?",c:[{e:"🏠",t:"Ja, hoger"},{e:"🧍",t:"Nee, lager"}],a:x>=5?0:1}},hint:"Een huis is ongeveer zo hoog als 5 kinderen op elkaar."},
      {kind:"count",pre:"Hoeveel kinderen op elkaar?",fn:function(x){return{q:x+" kinderen van ongeveer 1 meter 30. Hoeveel centimeter is dat ongeveer in totaal?",a:[String(x*130)]}},hint:"1 meter 30 is 130 cm. Keer het aantal kinderen."},
      {kind:"count",pre:"Hoeveel kinderen op elkaar?",fn:function(x){return{q:x+" kinderen van 1,3 m. Een verdieping is 3 m. Hoeveel verdiepingen is dat ongeveer? (rond af op een heel getal)",a:[String(Math.round(x*1.3/3))]}},hint:"Eerst × 1,3 voor de meters, dan delen door 3, dan afronden."}]},
{id:"vormen",ico:"🔺",dom:"meetkunde",title:"Vormen zoeken",
 intro:"Een architect ziet overal vormen: vierkante tegels, ronde putdeksels, driehoekige daken. Zoek om je heen naar vormen.",
 act:{out:"Zoek iets ronds, iets vierkants en iets driehoekigs. Wijs ze alle drie aan. Welke vorm zie je het meest?",in:"Zoek in deze ruimte iets ronds, iets vierkants en iets driehoekigs. Welke vorm zie je het meest?"},
 tip:["Een cirkel heeft geen hoeken. Een driehoek heeft er 3, een vierkant 4.","Een stopbord is een achthoek: 8 hoeken. Een verkeersbord met een waarschuwing is een driehoek.","Putdeksels zijn rond omdat een ronde deksel nooit door het gat kan vallen. Een vierkante wel, schuin."],
 lvl:[pics("Hoeveel hoeken heeft een driehoek?",0,"Drie-hoek. Het zit in de naam.",["🔺","3 hoeken"],["🟦","4 hoeken"]),
      ch("Een stopbord heeft 8 hoeken. Hoe heet zo'n vorm?",1,"Acht hoeken: acht-hoek.",["Zeshoek","Achthoek","Rechthoek"]),
      ch("Waarom zijn putdeksels rond?",0,"Denk aan een vierkante deksel: die past schuin door het gat.",["Een ronde deksel kan nooit door het gat vallen","Rond is goedkoper","Omdat auto's rond zijn"])]},
{id:"getallenjacht",ico:"🔍",dom:"getallen",title:"Getallenjacht",
 intro:"Professor Nul heeft de cijfers van de school weggehaald, maar buiten zijn ze er nog: op borden, auto's, deuren en reclames. Zoek het grootste getal dat je ziet.",
 act:{out:"Zoek het grootste getal dat je vanaf hier ziet: een huisnummer, een kenteken, een bord, een prijs. Typ het over.",in:"Zoek het grootste getal dat je in deze ruimte ziet: op een poster, een boek, een deur, een klok. Typ het over."},
 tip:["Een getal met meer cijfers is bijna altijd groter: 12 is groter dan 9.","Afronden op tientallen: kijk naar het laatste cijfer. 5 of hoger: naar boven.","Grote getallen lees je in groepjes van drie: 1.250 is 'duizend tweehonderdvijftig'."],
 lvl:[{kind:"count",pre:"Welk getal hebben jullie gevonden?",fn:function(x){return{kind:"choice",q:"Jullie vonden "+x+". Is dat meer dan 20?",c:[{e:"🔼",t:"Ja, meer"},{e:"🔽",t:"Nee, minder"}],a:x>20?0:1}},hint:"Tel tot 20. Komt jullie getal daarna?"},
      {kind:"count",pre:"Welk getal hebben jullie gevonden?",fn:function(x){return{q:"Jullie vonden "+x+". Rond het af op tientallen.",a:[String(Math.round(x/10)*10)]}},hint:"Kijk naar het laatste cijfer: 5 of meer gaat naar boven, anders naar beneden."},
      {kind:"count",pre:"Welk getal hebben jullie gevonden?",fn:function(x){return{q:"Jullie vonden "+x+". Hoeveel is de helft daarvan? Typ met komma als het nodig is (bijv. 12,5).",a:[String(x/2).replace(".",","),String(x/2)]}},hint:"Delen door 2. Oneven getal? Dan eindigt het op ,5."}]},
{id:"schaal",ico:"🗺️",dom:"verhoudingen",title:"Kaart en schaal",
 intro:"Op een kaart is alles kleiner. Hoeveel kleiner, dat zegt de schaal. Een landmeter rekent de kaart om naar de echte wereld. Kijk even om je heen: in welke richting is de school?",
 act:{out:"Wijs allemaal tegelijk naar de school. Wijzen jullie dezelfde kant op? Kijk daarna op de plattegrond (knop Plattegrond) of op de verhaalkaart: klopt het?",in:"Wijs allemaal tegelijk naar de ingang van de school. Wijzen jullie dezelfde kant op?"},
 tip:["Een kaart is de wereld van boven, heel klein getekend.","Schaal 1 cm = 100 m betekent: 1 cm op de kaart is 100 meter in het echt.","Schaal 1:1000 betekent: alles is 1000 keer kleiner. 5 cm op de kaart = 5000 cm = 50 m."],
 lvl:[pics("Op een kaart is de school getekend. Is de echte school groter of kleiner dan op de kaart?",0,"Op een kaart is alles heel klein.",["🏫","Groter"],["🗺️","Kleiner"]),
      {kind:"text",q:"Op de kaart is 1 cm in het echt 100 meter. De speeltuin ligt 4 cm van school. Hoeveel meter is dat in het echt?",a:["400"],hint:"4 × 100."},
      {kind:"text",q:"Schaal 1:1000. Op de kaart is de straat 12 cm lang. Hoeveel meter is dat in het echt?",a:["120"],hint:"12 cm × 1000 = 12.000 cm. Deel door 100 voor meters."}]},
{id:"verdiepingen",ico:"🏢",dom:"meten",title:"Verdiepingen",
 intro:"Hoe hoog een gebouw is, kun je uitrekenen met de verdiepingen. Zoek het gebouw met de meeste verdiepingen dat je ziet en tel ze: elke rij ramen is een verdieping.",
 act:{out:"Tel de verdiepingen van het hoogste gebouw dat je ziet. Tel de begane grond mee.",in:"Hoeveel verdiepingen heeft de school? Tel de begane grond mee. Hoeveel treden heeft de trap naar boven? Tel ze samen."},
 tip:["De begane grond is ook een verdieping: die tel je mee.","Een verdieping is ongeveer 3 meter hoog. 4 verdiepingen is dus ongeveer 12 meter.","Een trap van 15 treden van 18 cm: 15 × 18 = 270 cm = 2,7 m per verdieping."],
 lvl:[{kind:"count",pre:"Hoeveel verdiepingen?",fn:function(x){return{q:x+" verdiepingen. Op elke verdieping woont 1 gezin. Hoeveel gezinnen wonen er?",a:[String(x)]}},hint:"Net zoveel gezinnen als verdiepingen."},
      {kind:"count",pre:"Hoeveel verdiepingen?",fn:function(x){return{q:x+" verdiepingen van ongeveer 3 meter. Hoe hoog is het gebouw ongeveer, in meters?",a:[String(x*3)]}},hint:"Verdiepingen × 3."},
      {kind:"count",pre:"Hoeveel verdiepingen?",fn:function(x){return{q:x+" verdiepingen. Naar elke verdieping gaat een trap van 16 treden van 17 cm. Hoe hoog is het gebouw in meters? Typ met komma (bijv. 8,16).",a:[String(Math.round((x-1)*16*17)/100).replace(".",","),String(Math.round((x-1)*16*17)/100),String(x*16*17/100).replace(".",","),String(x*16*17/100)]}},hint:"Één trap = 16 × 17 = 272 cm = 2,72 m. Tussen de verdiepingen zitten (aantal − 1) trappen."}]}
];
var ORDER_KORT=["stappen","ramen","klok","kassa","koekjes","vormen"];
return{lang:"nl",T:T,TYPES:TYPES,TIK:TIK,NOOR:NOOR,NUL:NUL,ROOMS:ROOMS,OPEN:OPEN,OPEN0:OPEN0,CLIFF:CLIFF,CLIFFLAST:CLIFFLAST,REVEAL:REVEAL,REVEAL0:REVEAL0,S:S,KORT:ORDER_KORT,KEYS:KEYS,FREE:false,
  LEADNOTE:"Tip: doe de korte introductieles vooraf (zie onder). Spreek het speelgebied af (buiten: alles binnen ongeveer 300 meter) en een eindtijd. Teams die vastzitten mogen de hint gebruiken (één per station). Bij de meetstations typt het team eerst wat het zelf geteld heeft; de vervolgvraag rekent daarmee verder. Op het blad staat daarom het rekenrecept, niet één vast antwoord.",
  LES:[
   {intro:["Laat de klok zonder cijfers zien (plak de cijfers af) en vraag: hoe laat is het nu? Wat kun je niet zonder getallen? (hoe laat, hoeveel, hoe ver, hoe duur)","Oefen samen één keer meten met stappen in de klas: hoeveel stappen is het lokaal breed? Spreek af: grote stappen, hardop tellen.","Teams van 4–6 met een volwassene, één telefoon per team, zaakcode invullen. Zet voorlezen aan: de kinderen hoeven niet zelf te lezen."],
    na:["Welk station was het leukst? Wat hebben jullie daar geteld?","Zet de metingen van de teams naast elkaar op het bord: hoeveel stappen, hoeveel ramen. Verschillen ze? Hoe komt dat (grote en kleine stappen)?","Rekenen zonder cijfers: wat zou er misgaan in een dag zonder getallen? Laat ieder kind één ding noemen.","Thuisopdracht: tel de treden van de trap thuis, of de ramen aan de voorkant van je huis."],
    doelen:"Groep 3–4 (SLO rekenen): tellen en getallen tot 20 en 100, meer/minder, even en oneven, meten met natuurlijke maten (stappen), hele uren op de klok, geld tot 10 euro, vormen herkennen."},
   {intro:["Vraag: waar gebruik je rekenen buiten school? Verzamel vijf voorbeelden (betalen, tijd, afstand, koken, bouwen).","Oefen het meten met stappen: hoeveel stappen is het lokaal, hoeveel meter is dat ongeveer (stap ≈ 50 cm)? Zo weten ze wat ze straks doen.","Teams van 4–6, één telefoon per team, zaakcode invullen. Afspraak: eerst meten, dan rekenen, samen controleren."],
    na:["Zet de metingen van alle teams in een tabel op het bord: stappen, ramen, verkeer per minuut. Wie had het meest? Wat is het gemiddelde (groep 6)?","Verkeer: hoeveel auto's per uur is dat? Is onze straat druk? Wat zou de gemeente ermee doen?","Welke som was het moeilijkst? Laat een team die uitleggen.","Verdieping: meet één ding in de school écht met een meetlint en vergelijk met de stappen-schatting."],
    doelen:"Groep 5–6 (SLO rekenen): getallen tot 1000/10.000, tafels en delen met rest, meten in cm en m, kwartieren en minuten op de klok, geld met komma, eenvoudige breuken, patronen, afronden, tabellen."},
   {intro:["Vraag: hoe weet een landmeter hoe hoog een gebouw is zonder erop te klimmen? Laat ze raden, geef nog geen antwoord (dat komt bij het station 'Hoe hoog is dat?').","Herhaal kort: schaal, procenten, kommagetallen. Die komen in de buurt terug.","Teams van 4–6, één telefoon per team, zaakcode invullen. Afspraak: schat eerst, meet dan, en vergelijk."],
    na:["Zet de metingen van alle teams in een tabel: stappen, meters, verkeer per uur. Bereken het gemiddelde en bespreek de spreiding: waarom verschilt het?","Verkeer per uur × 12 schooluren: hoeveel voertuigen per dag? Is dat veel? Zoek op wat de gemeente een drukke straat noemt.","De schaduwmethode: ga naar buiten op een zonnige dag en meet de hoogte van een boom met je eigen schaduw. Vergelijk met de schatting in verdiepingen.","Verdieping: maak een plattegrond van het schoolplein op schaal 1:100 met de stappen-metingen."],
    doelen:"Groep 7–8 (SLO rekenen): grote getallen, kommagetallen, procenten en breuken, verhoudingen en schaal, oppervlakte, gemiddelde, afronden, meten en schatten met referentiematen, rekenen in context."}
  ]}
})();

/* ===== Verdieping per station (shared/meer.js): per niveau twee extra stappen met uitleg. Goede antwoord staat eerst. ===== */
(function(D){var M={
stappen:[
 [["Je zet 6 stappen en dan nog 3. Hoeveel stappen samen?",["9","8"],"6 en 3 is 9. Tel maar door vanaf 6: zeven, acht, negen."],
  ["Wat is langer?",["10 grote stappen","10 kleine stappen"],"Met grote stappen kom je verder. Daarom meten we met een meetlint: dat is voor iedereen even lang."]],
 [["Hoeveel centimeter is 1 meter?",["100","10","1000"],"Centi betekent honderdste. In 1 meter passen 100 centimeters."],
  ["Een stap is 50 cm. Het plein is 40 stappen lang. Hoeveel meter is dat?","20","Twee stappen is 1 meter, dus 40 stappen is 20 meter. Of: 40 × 50 = 2000 cm = 20 m."]],
 [["Jouw stap is 0,6 m. Het is 150 meter naar de bushalte. Hoeveel stappen zijn dat?","250","150 : 0,6 = 1500 : 6 = 250. Maak van een kommagetal een heel getal door allebei keer 10 te doen."],
  ["Waarom is de meter overal ter wereld even lang?",["Hij is internationaal afgesproken en vastgelegd","Omdat iedereen even grote stappen zet","Omdat elk land hem zelf opmeet"],"Vroeger mat elke stad met een eigen voet of el. Sinds 1799 is de meter de vaste maat, zodat iedereen hetzelfde bedoelt."]]],
ramen:[
 [["Er zijn 5 ramen. 2 staan open. Hoeveel zijn er dicht?",["3","4"],"5 − 2 = 3. Je kunt 5 splitsen in 2 en 3."],
  ["Wat is het dubbele van 4?",["8","6"],"Dubbel is twee keer hetzelfde: 4 + 4 = 8."]],
 [["Een gevel heeft 4 rijen van 6 ramen. Hoeveel ramen zijn dat?","24","4 × 6 = 24. Rijen en kolommen tel je niet één voor één: je vermenigvuldigt."],
  ["Je weet 5 × 6 = 30. Hoe reken je 6 × 6 dan handig uit?",["30 + 6","30 + 5","30 × 6"],"6 × 6 is één groepje van 6 meer dan 5 × 6. Zo bouw je een tafel op vanuit een som die je al kent."]],
 [["Een flat heeft 12 verdiepingen met elk 15 ramen. Hoeveel ramen?","180","12 × 15 = 10 × 15 + 2 × 15 = 150 + 30 = 180. Splits het getal in tientallen en eenheden."],
  ["Van de 180 ramen brandt achter 45 ramen licht. Welk deel is dat?",["Een kwart","Een derde","De helft"],"45 is de helft van 90 en 90 is de helft van 180. De helft van de helft is een kwart: 25%."]]],
nummer:[
 [["Welk getal komt na 19?",["20","18"],"Na 19 komt 20: een nieuw tiental."],
  ["Welk getal is even?",["8","7"],"Even getallen kun je eerlijk in tweeën delen: 2, 4, 6, 8, 10."]],
 [["Aan de ene kant van de straat staan 2, 4, 6, 8. Welk nummer komt daarna?","10","De even nummers staan aan één kant en gaan met sprongen van 2 omhoog."],
  ["Hoe zie je aan een groot getal of het even is?",["Aan het laatste cijfer","Aan het eerste cijfer","Aan het aantal cijfers"],"Eindigt het op 0, 2, 4, 6 of 8, dan is het even. 1357 is dus oneven en 1358 even."]],
 [["Welk van deze huisnummers is een priemgetal?",["37","39","33"],"39 = 3 × 13 en 33 = 3 × 11. Alleen 37 is door niets te delen behalve 1 en zichzelf."],
  ["Een straat heeft de huisnummers 1 tot en met 100. Hoe vaak is het cijfer 7 geschilderd?","20","Tien keer als eenheid (7, 17, 27 … 97) en tien keer als tiental (70 tot en met 79). Het nummer 77 telt dus twee keer."]]],
palen:[
 [["Tel verder met sprongen van 2: 2, 4, 6, …",["8","7"],"Bij sprongen van 2 sla je steeds één getal over."],
  ["Er staan 10 palen. 4 lampen zijn aan. Hoeveel zijn er uit?",["6","5"],"4 en 6 zijn samen 10. Dat zijn 'verliefde harten'."]],
 [["Het patroon is: aan, uit, uit, aan, uit, uit … Is de 9e lamp aan of uit?",["Uit","Aan"],"Het patroon is 3 lang. De lampen 1, 4, 7 en 10 zijn aan; nummer 9 is de laatste van een groepje en is uit."],
  ["Er staan 6 palen op een rij. Hoeveel tussenruimtes zijn er?","5","Er is altijd één tussenruimte minder dan er palen zijn. Teken het maar: tussen 2 palen zit 1 ruimte."]],
 [["Een straat van 240 meter krijgt aan het begin en het eind een paal, en verder om de 30 meter. Hoeveel palen?","9","240 : 30 = 8 tussenruimtes, en dan 1 paal extra: 9. Dit heet het hekpalenprobleem."],
  ["Een lamp van 20 watt brandt 10 uur per nacht. Hoeveel wattuur is dat in 30 nachten?","6000|6.000","20 × 10 × 30 = 6000 wattuur, dat is 6 kilowattuur. Een oude lamp van 100 watt gebruikte vijf keer zoveel."]]],
klok:[
 [["Hoeveel wijzers heeft deze klok?",["2","1"],"De korte wijzer wijst het uur aan, de lange de minuten."],
  ["Welke wijzer wijst het uur aan?",["de korte","de lange"],"De korte wijzer loopt langzaam: hij doet 12 uur over één rondje."]],
 [["Hoeveel minuten zitten er in een uur?","60","Een uur is 60 minuten. Een kwartier is een kwart daarvan: 15 minuten."],
  ["Het is kwart voor vier. Hoeveel minuten duurt het nog tot vier uur?","15","Kwart voor betekent: nog een kwartier. Een kwartier is 15 minuten."]],
 [["De les begint om 10:45 en duurt 50 minuten. Hoe laat is de les afgelopen? Typ als uu:mm.","11:35|1135","Eerst 15 minuten tot 11:00, dan nog 35 minuten erbij: 11:35."],
  ["Hoeveel graden draait de grote wijzer in een kwartier?","90","Een heel rondje is 360 graden. Een kwart daarvan is 90 graden: een rechte hoek."]]],
kassa:[
 [["Je hebt 5 euro. Een ijsje kost 2 euro. Hoeveel houd je over?",["3 euro","2 euro"],"5 − 2 = 3."],
  ["Wat is meer waard?",["één munt van 2 euro","één munt van 1 euro"],"Kijk naar het getal op de munt, niet naar hoe groot hij is."]],
 [["Hoeveel cent is € 2,50?","250","Een euro is 100 cent. 2 euro is 200 cent, plus 50 cent is 250."],
  ["Iets kost € 3,99. Hoeveel is dat ongeveer?",["4 euro","3 euro","39 euro"],"Het scheelt maar 1 cent met 4 euro. Winkels doen dat expres: 3,99 lijkt goedkoper dan 4."]],
 [["Een jas van € 80 is 25% afgeprijsd. Wat betaal je?","60","25% is een kwart: 80 : 4 = 20 euro korting. 80 − 20 = 60."],
  ["Wat is goedkoper per stuk?",["6 flesjes voor € 4,20","4 flesjes voor € 3,20","Ze zijn even duur"],"4,20 : 6 = 0,70 per flesje. 3,20 : 4 = 0,80 per flesje. Reken altijd terug naar de prijs per stuk."]]],
tegels:[
 [["Welke vorm heeft een stoeptegel?",["een vierkant","een cirkel"],"Een vierkant heeft vier even lange zijden en vier hoeken."],
  ["Je legt 2 rijen van 3 tegels. Hoeveel tegels?",["6","5"],"3 en 3 is 6. Twee rijen van drie."]],
 [["Een tegel is 30 cm breed. Hoe breed zijn 5 tegels naast elkaar, in centimeters?","150","5 × 30 = 150 cm, dat is anderhalve meter."],
  ["Wat reken je uit met lengte keer breedte?",["De oppervlakte","De omtrek","De hoogte"],"Oppervlakte is hoeveel er op past. De omtrek is de rand eromheen: die tel je op."]],
 [["Hoeveel tegels van 30 bij 30 cm gaan er ongeveer in 1 m²?",["11","9","3"],"Eén tegel is 0,3 × 0,3 = 0,09 m². 1 : 0,09 is ruim 11. Er passen er 3 naast elkaar in 90 cm, dus 9 is net te weinig."],
  ["Een terras is 4,5 m bij 6 m. Hoeveel m² is dat?","27","4 × 6 = 24 en een half × 6 = 3. Samen 27 m²."]]],
verkeer:[
 [["Je telt 4 auto's en 3 fietsen. Hoeveel samen?",["7","6"],"4 + 3 = 7."],
  ["Er rijden 6 fietsen en 2 auto's voorbij. Waar zijn er meer van?",["fietsen","auto's"],"6 is meer dan 2."]],
 [["Hoe houd je bij het tellen de stand handig bij?",["Met turven: streepjes in groepjes van 5","Alles onthouden","Elk voertuig tekenen"],"Bij turven zet je vier streepjes en de vijfde er dwars doorheen. Groepjes van 5 tel je daarna snel op."],
  ["In 5 minuten tel je 12, 8, 10, 9 en 11 voertuigen. Hoeveel is dat gemiddeld per minuut?","10","Samen 50, gedeeld door 5 minuten is 10. Het gemiddelde is alles eerlijk verdeeld."]],
 [["Een auto rijdt 30 km per uur. Hoeveel meter legt hij af in 1 minuut?","500","30 km is 30.000 meter in 60 minuten. 30.000 : 60 = 500 meter per minuut."],
  ["Je telt één minuut op maandagochtend om 8:15. Waarom zegt dat weinig over de hele week?",["De steekproef is te klein en op één moment","Je hebt verkeerd geteld","Auto's rijden op maandag harder"],"In de spits is het drukker dan 's nachts. Voor een eerlijk beeld tel je op meer momenten en neem je het gemiddelde."]]],
koekjes:[
 [["4 koekjes voor 2 kinderen. Hoeveel krijgt ieder?",["2","3"],"Eerlijk delen: ieder evenveel. 2 en 2 is samen 4."],
  ["Je hebt 1 koekje voor 2 kinderen. Wat doe je?",["doormidden breken","zelf opeten"],"Dan krijgt ieder een half koekje. Twee helften zijn samen één hele."]],
 [["20 koekjes voor 4 kinderen. Hoeveel krijgt ieder?","5","20 : 4 = 5, want 4 × 5 = 20. Delen is het omgekeerde van vermenigvuldigen."],
  ["Welke deelsom hoort bij 6 × 7 = 42?",["42 : 7 = 6","7 : 42 = 6","42 : 6 = 6"],"Ken je de tafelsom, dan ken je de deelsom ook: 42 : 7 = 6 en 42 : 6 = 7."]],
 [["Een taart wordt verdeeld: 1/2 voor de klas, 1/4 voor de juf. Welk deel blijft over?",["1/4","1/3","1/8"],"Een half is twee kwart. Twee kwart plus één kwart is drie kwart. Er blijft één kwart over."],
  ["Drie kinderen delen € 10 eerlijk. Hoeveel krijgt ieder, afgerond op hele centen? Typ als 3,33.","3,33|3.33","10 : 3 = 3,333… Het houdt nooit op. In geld rond je af op twee cijfers achter de komma; 1 cent blijft over."]]],
hoogte:[
 [["Wat is hoger?",["een boom","een fiets"],"Hoog en laag vergelijk je door de dingen naast elkaar te denken."],
  ["Wie is langer: jij of de deur?",["de deur","ik"],"Een deur is ongeveer 2 meter. Jij past er makkelijk onderdoor."]],
 [["Hoe hoog is een gewone deur ongeveer?",["2 meter","5 meter","50 centimeter"],"Een deur van 2 meter is een handig meetlint: hoeveel deuren passen er op elkaar tot aan het dak?"],
  ["Een lantaarnpaal is ongeveer 3 deuren hoog. Hoe hoog is dat in meters?","6","3 × 2 = 6 meter. Schatten doe je met iets waarvan je de maat kent."]],
 [["Een stok van 1 m heeft een schaduw van 2 m. Een boom heeft op hetzelfde moment een schaduw van 16 m. Hoe hoog is de boom, in meters?","8","De schaduw is twee keer zo lang als het ding zelf. 16 : 2 = 8 meter. Zo meet je hoogte zonder te klimmen."],
  ["Je schat een toren op 40 meter. Hij is 50 meter. Hoeveel procent zat je ernaast, van de echte hoogte?","20","Je zat 10 meter mis. 10 van de 50 is een vijfde: 20%."]]],
vormen:[
 [["Welke vorm heeft geen hoeken?",["een cirkel","een vierkant"],"Een cirkel is helemaal rond. Een wiel moet rond zijn om te rollen."],
  ["Hoeveel zijden heeft een vierkant?",["4","3"],"Vier zijden die allemaal even lang zijn."]],
 [["Wat is het verschil tussen een vierkant en een rechthoek?",["Bij een vierkant zijn alle zijden even lang","Een rechthoek heeft meer hoeken","Een vierkant heeft schuine hoeken"],"Allebei hebben ze vier rechte hoeken. Een vierkant is een rechthoek met vier gelijke zijden."],
  ["Hoeveel graden is een rechte hoek?","90","De hoek van een tegel, een deur of een schrift is 90 graden."]],
 [["Hoeveel graden zijn de drie hoeken van een driehoek samen?","180","Altijd 180 graden, bij elke driehoek. Scheur de hoeken van een papieren driehoek af en leg ze naast elkaar: een rechte lijn."],
  ["Een rond verkeersbord heeft een diameter van 60 cm. Hoe lang is de rand ongeveer? (neem pi = 3)","180","Omtrek = pi × diameter = 3 × 60 = 180 cm. Met 3,14 kom je op ruim 188 cm."]]],
getallenjacht:[
 [["Welk getal is groter?",["15","12"],"Allebei hebben ze 1 tiental. Dan kijk je naar de eenheden: 5 is meer dan 2."],
  ["Welk getal zit tussen 9 en 11?",["10","12"],"9, 10, 11. De buren van 10 zijn 9 en 11."]],
 [["Hoeveel is het cijfer 4 waard in 347?",["40","4","400"],"347 is 3 honderdtallen, 4 tientallen en 7 eenheden. De plek van het cijfer bepaalt de waarde."],
  ["Rond 468 af op honderdtallen.","500","468 ligt tussen 400 en 500. Het tiental is 6, dat is 5 of meer, dus naar boven."]],
 [["Wat is 0,75 als breuk?",["3/4","7/5","1/75"],"0,75 is 75 honderdsten. 75/100 kun je vereenvoudigen tot 3/4. Het is ook 75%."],
  ["Op een bord staat 'max. 3,5 t'. Hoeveel kilogram is dat?","3500|3.500","Een ton is 1000 kilogram. 3,5 × 1000 = 3500 kg."]]],
schaal:[
 [["Wat zie je op een plattegrond?",["de straten van bovenaf","de straten van opzij"],"Een kaart is getekend alsof je er als een vogel boven vliegt."],
  ["Wat is op de kaart het dichtst bij school?",["het schoolplein","de andere stad"],"Wat in het echt dichtbij is, ligt op de kaart ook dichtbij."]],
 [["Op de kaart is 1 cm in het echt 50 meter. Het park ligt 6 cm verder. Hoeveel meter is dat?","300","6 × 50 = 300 meter."],
  ["Waarom is een kaart op schaal getekend?",["Omdat de echte wereld niet op papier past","Omdat het mooier staat","Omdat straten steeds veranderen"],"Op schaal betekent: alles is even veel keer kleiner gemaakt. De verhoudingen blijven kloppen."]],
 [["Schaal 1:25.000. Hoeveel meter is 4 cm op de kaart in het echt?","1000|1.000","4 × 25.000 = 100.000 cm. Dat is 1000 meter, precies 1 kilometer."],
  ["Een speelplein is in het echt 30 m lang. Je tekent het op schaal 1:200. Hoe lang wordt het op papier, in centimeters?","15","30 m = 3000 cm. 3000 : 200 = 15 cm."]]],
verdiepingen:[
 [["Je staat op verdieping 2 en gaat 1 trap omhoog. Waar ben je?",["verdieping 3","verdieping 1"],"Omhoog is erbij: 2 + 1 = 3."],
  ["Wat is de onderste verdieping?",["de begane grond","het dak"],"De begane grond is gelijk met de straat. Daarboven begin je te tellen."]],
 [["Een trap heeft 15 treden per verdieping. Je loopt 3 verdiepingen omhoog. Hoeveel treden?","45","3 × 15 = 3 × 10 + 3 × 5 = 30 + 15 = 45."],
  ["De lift staat op verdieping 2. De parkeergarage is op −1. Hoeveel verdiepingen moet de lift omlaag?","3","Van 2 naar 1, naar 0, naar −1: drie stappen. Onder nul tel je gewoon door."]],
 [["Een toren is 96 meter hoog en heeft 32 verdiepingen. Hoe hoog is één verdieping, in meters?","3","96 : 32 = 3. Controle: 32 × 3 = 96."],
  ["Een lift gaat 2 meter per seconde. Hoeveel seconden duurt de rit naar 96 meter hoogte?","48","Tijd = afstand gedeeld door snelheid: 96 : 2 = 48 seconden."]]]
};D.S.forEach(function(m){if(M[m.id])m.more=M[m.id]})})(window.RK_DATA);

/* kindervraag: korte vaste bonusvraag waar de andere te lang waren voor de doelgroep (vierde element 1, zie shared/meer.js) */
(function(D){var K={"palen": {"1": ["Aan, uit, uit, aan, uit, uit. Wat komt daarna?", ["Aan", "Uit"], "Het patroon is drie lang en begint dan opnieuw."]}, "verkeer": {"1": ["Hoe tel je handig met streepjes?", ["In groepjes van 5", "Eén lange rij", "In groepjes van 2"], "Groepjes van 5 tel je daarna snel op. Dat heet turven."]}, "hoogte": {"2": ["Je schat 40 meter. Het is 50 meter. Hoeveel zat je ernaast?", ["10 meter", "90 meter", "5 meter"], "50 − 40 = 10. Schatten hoeft niet precies."]}, "schaal": {"1": ["Waarom is een kaart kleiner dan de echte wereld?", ["Anders past hij niet op papier", "Dat is mooier", "Dat is goedkoper"], "Alles is even veel keer kleiner gemaakt. Dat heet schaal."]}, "verdiepingen": {"1": ["3 trappen van 10 treden. Hoeveel treden?", "30", "3 × 10 = 30."], "2": ["Een lift gaat 2 meter per seconde. Hoe lang doet hij over 20 meter?", ["10 seconden", "40 seconden", "22 seconden"], "20 : 2 = 10."]}};D.S.forEach(function(m){var k=K[m.id];if(k&&m.more)Object.keys(k).forEach(function(a){m.more[a].unshift(k[a].concat([1]))})})})(window.RK_DATA);
