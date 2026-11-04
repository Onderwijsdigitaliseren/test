/* De Letterdief – MiniMystery Educatie (taal, groep 3–8). Teksten en taalstations (NL).
   De Letterdief heeft 's nachts letters gestolen: van de naambordjes op de lokalen, van het bord in de hal, van de schoolnaam op de gevel.
   Overal ontbreken letters en woorden. Op taalstations rond (of in) de school lezen, spellen en bouwen de teams met echte woorden uit
   de buurt. Elk station geeft een woordsleutel. In de finale zetten ze de woorden in de goede volgorde tot een zin: dan krijgt de
   Letterdief spijt en brengt hij alles terug.
   Niveaus: 0 = groep 3–4 (klanken en letters, korte woorden, lettergrepen klappen, rijm; twee plaatjes als antwoord, alles voorgelezen)
   · 1 = groep 5–6 (spelling, samenstellingen, tegenstellingen en synoniemen, woordsoorten, alfabet, leestekens)
   · 2 = groep 7–8 (werkwoordspelling, zinsdelen, figuurlijk taalgebruik, spreekwoorden, leenwoorden, tekstbegrip).
   Per station: intro, act {out,in}, lvl[3] (kind text/choice/word; word = eerst een echt woord overtypen, dan fn(w) met de vervolgvraag), tip. */
window.TL_DATA=(function(){
var T={
  today:"Start de zaak van vandaag",extra:"Extra zaak",voice:"Voorlezen",voiceOn:"Voorlezen staat aan",voiceOff:"Voorlezen staat uit",
  start:"Open het taalstation",next:"Verder ▸",back:"Terug",close:"Sluiten",cancel:"Annuleren",ok:"Controleer ▸",listen:"Voorlezen",
  loc:"Waar zijn jullie? De telefoon vraagt om je locatie.",pois:"Juf Noor zoekt taalstations in de buurt…",nomap:"De kaartdienst is druk. We spelen op een getekende plattegrond.",
  noGps:"Deze telefoon heeft geen gps.",denied:"De locatie staat uit. Zet hem aan in de instellingen, of speel zonder kaart.",fail:"Dat lukte niet",
  corner:"Hoek",task:"Station {i} van {n}",clue:"Woordsleutel {n} van {t}",
  near:"Volgend station op {d} m",warm:"Warm! Nog {d} m",hot:"Heet! Hier staat een station",radarAll:"Alle woordsleutels! Naar de Letterdief.",
  here:"Hier is een taalstation",look:"Open het station",walk:"Loop erheen",gps:"We staan er echt (gps twijfelt)",
  notebook:"Woordenboekje",nbK:"Woordsleutels",nbM:"Woorden uit de buurt",nbNone:"Nog niets gevonden. Loop naar het eerste station.",
  menu:"Menu",mBack:"Terug naar de zaak",mHome:"Pauze, later verder",mWipe:"Deze zaak wissen",mLead:"Begeleidersblad",saved:"Opgeslagen. Je kunt later verdergaan.",
  wipe:"Wissen",wipeY:"Deze zaak wissen",wipeAll:"Alles wissen (ook het archief)",wipeQ:"Zaak wissen?",wipeT:"De voortgang is dan weg.",allQ:"Alles wissen?",allT:"Zaak, archief en instellingen worden gewist.",allY:"Ja, alles wissen",wiped:"Gewist",
  dH:"Zaakcode invullen",dT:"Met een zaakcode spelen meer telefoons dezelfde zaak: dezelfde plekken, dezelfde stations. Elke klas of groep krijgt zo één zaak voor alle teams.",dGo:"Zaak ophalen",dBad:"Die code kennen we niet. Codes beginnen met TL.",
  demoCase:"Proefronde · getekende stad",demoTip:"Tik op een plek op de kaart: jullie groepje loopt er vanzelf heen.",
  howH:"Hoe werkt het?",
  won:"Letters terug",dipBtn:"Diploma (A4)",dipH:"Diploma Woordspeurder",dipNote:"Printen of opslaan. Eén per team, of print er voor elk kind een.",leadBtn:"Begeleidersblad",home:"Naar het begin",dl:"Opslaan",shareBtn:"Delen",copied:"Gekopieerd",
  shareTxt:"Wij hebben de Letterdief gesnapt! Zaak {c} · {s} · {m} min. ",missed1:"Zonder hints: drie sterren.",
  pzT:"Overleg samen. Eén iemand typt.",wrong:"Nog niet goed. Overleg nog eens.",wrongHint:"Nog niet goed. Pak de hint, of overleg nog eens.",hintBtn:"💡 Hint",hintUsed:"Hint gebruikt",
  countGo:"Ingevuld ▸",photoGo:"📷 Maak de foto",photoAgain:"Nog een keer",photoOk:"Dit is hem! ▸",photoKeep:"De foto blijft op deze telefoon.",
  keyGet:"Een woordsleutel:",tipH:"Taaltip",
  finH:"De zin van de Letterdief",finT:"Tik de woordsleutels aan in de goede volgorde, zodat er een zin staat. Let op de hoofdletter en de punt.",finT0:"Tik de woorden aan zodat er een zin staat. Welk woord komt eerst?",finBad:"Zo wordt het geen goede zin. Begin opnieuw.",finHint:"Een zin begint met een hoofdletter en eindigt met een punt. Wie doet iets? Dat komt vaak vooraan.",finHint0:"Het woord met de hoofdletter komt eerst. Het woord met de punt als laatste.",finNot:"Eerst alle stations doen. Nog {n} te gaan.",finOk:"Dat is de zin! De Letterdief schrikt: zijn geheim staat op straat.",
  stripT:"Zaak {c}",keysBar:"Woordsleutels",
  gbH:"In het gebouw",gbT:"Kies de plekken in jullie school. De begeleider hangt op elke plek een kaartje met een code (printen via het begeleidersblad). Teams gaan naar de plek en typen de code.",gbNoCards:"Zonder kaartjes (teams drukken zelf op 'We zijn er')",gbGo:"Zaak starten",gbMin:"Kies minstens {n} plekken (of de plekken worden herhaald).",
  gbGoto:"Ga naar:",gbCode:"Typ de code van het kaartje op die plek",gbHere:"We zijn er ▸",gbBad:"Die code hoort niet bij deze plek. Kijk nog eens op het kaartje.",gbCards:"Plekkaartjes (ophangen)",gbCardT:"Taalstation",
  leadH:"Begeleidersblad",leadT:"Alleen voor de begeleider. Dit blad hoort bij deze zaakcode: alle teams met deze code krijgen precies deze stations.",leadTeams:"Teamstand (zelf bijhouden)",leadTeam:"Team",leadDone:"Klaar om",leadPrint:"Printen",leadCode:"Zaakcode",
  lvl:["groep 3–4","groep 5–6","groep 7–8"],
  nw:{6:"zes",8:"acht",10:"tien"},
  kv:{fp:["Fietsenstalling","Bushalte","Speeltuin","Schoolplein","Brug","Park","Kerk","Plein","Winkel","Brievenbus","Kiosk","Bankje"],
    all:"Alle woordsleutels! Naar de Letterdief.",near:"Station op {d} m",cold:"Koud… loop een andere kant op",cool:"Lauw. Dichterbij komt-ie",warm:"Warm! Goed zo!",hot:"HEET! Kijk om je heen!",here:"Hier is het station!",first:"Loop maar, het kompas wijst de weg",noDir:"Loop een stukje, dan weet het kompas de richting",
    map:"Plattegrond",kids:"Verhaalkaart",mapTip:"De echte plattegrond. Tik op Verhaalkaart voor de kindertekening.",goDemo:"We lopen (nep) naar {p}…",inSteps:"Nog {n} stappen",
    mNoMap:"Verder zonder kaart (zelfde zaak)",switched:"Verder zonder kaart. Dezelfde zaak, dezelfde stations.",virtOut:"Geen plattegrond van de buurt gevonden. Jullie lopen op de verhaalkaart: de pijl en warm/koud wijzen de weg.",
    noMapQ:"Geen locatie vandaag?",noMapT:"De telefoon geeft geen locatie door. Jullie kunnen dezelfde zaak zonder kaart spelen: de stations komen dan achter elkaar en jullie lopen zelf naar een nieuwe plek.",noMapGo:"Verder zonder kaart",
    inH:"",inT:"",inSensor:"",inTempo:"",inNoSensor:""}
};
var TYPES={kerk:"de kerk",hotel:"het hotel",bank:"de bank",apotheek:"de apotheek",cafe:"het café",bieb:"de bibliotheek",park:"het park",school:"de school",kunst:"het kunstwerk",tank:"het tankstation",winkel:"de winkel",halte:"de bushalte",post:"de brievenbus",bankje:"het bankje",hoek:"de hoek"};
var TIK="Meneer Tik",NOOR="Juf Noor",DIEF="De Letterdief";
var ROOMS=["De hal bij de ingang","De aula","De gymzaal","De bibliotheek of leeshoek","De trap","Bij de lerarenkamer","De keuken","Het schoolplein","Een kleuterlokaal","Een bovenbouwlokaal","Bij de directiekamer","De fietsenstalling","Het speellokaal","De kapstokken"];
var OPEN={
  school:"Vanmorgen klopte er iets niet. Op de gevel stond niet meer de naam van de school, maar S_HO_L. De bordjes op de lokalen: GR_EP 5, B_EB. Op het bord in de hal: \"Ik heb jullie letters. Wie mij wil vinden, moet mijn zin maken. – De L_tterdief.\" Zonder letters kun je niet lezen, niet schrijven en niet vinden waar je moet zijn. Jullie gaan de Letterdief vinden. Op {N} plekken staat een taalstation. Daar lezen, spellen en bouwen jullie met echte woorden uit de buurt. Elk station geeft een woordsleutel. Met alle woorden op de goede volgorde staat zijn zin er, en dan weten jullie wat hij wil.",
  bso:"Alle letters zijn weg! Op de gevel staat S_HO_L. Op de deur van de bieb staat B_EB. En op het bord in de hal: \"Ik heb jullie letters. Wie mij wil vinden, moet mijn zin maken. – De L_tterdief.\" Probeer maar eens een briefje te schrijven zonder letters! Jullie gaan hem vinden. Op {N} plekken staat een taalstation. Daar zoeken jullie echte woorden in de buurt en doen er iets slims mee. Elk station geeft een woordsleutel. Alle woorden in de goede volgorde: dan staat zijn zin er."
};
var OPEN0={
  school:"Er zijn letters weg! Op de school staat S_HO_L. Op de bieb staat B_EB. De Letterdief heeft ze gepakt. Hij schreef: wie mij wil vinden, moet mijn zin maken. Op {N} plekken staat een taalstation. Daar zoeken jullie woorden en letters. Elk station geeft een woord. Alle woorden op een rij: dan staat zijn zin er!",
  bso:"Er zijn letters weg! Op de school staat S_HO_L. De Letterdief heeft ze gepakt! Hij schreef: wie mij wil vinden, moet mijn zin maken. Op {N} plekken staat een taalstation. Daar zoeken jullie woorden en letters. Elk station geeft een woord. Alle woorden op een rij: dan staat zijn zin er!"
};
var CLIFF=["Goed gelezen. Zo vindt een speurder de weg.","Weer een woord. Bewaar het in het woordenboekje.","De Letterdief hoort jullie al spellen. Hij wordt zenuwachtig.","Letters zijn overal, als je goed kijkt.","Zo kan ik het bureau wel aan jullie overlaten.","Op naar het volgende station!"];
var CLIFFLAST="Dat was het laatste station! Nu alle woordsleutels op volgorde: dan staat de zin van de Letterdief er.";
var REVEAL={
  school:"<p>De zin staat er. En dan staat hij er ineens zelf, bij de fietsenstalling: de Letterdief. Een klein mannetje met een jas vol zakken, en uit elke zak steken letters.</p><p>\"Jullie hebben mijn zin gemaakt,\" zegt hij zacht. \"Dat lukt bijna niemand. Ik stal letters omdat ik ze zo mooi vind. Maar ik zag jullie vandaag lezen en spellen en woorden bouwen, en ik dacht: letters zijn pas mooi als je er iets mee doet.\"</p><p>Hij haalt de letters uit zijn zakken en legt ze terug: op de gevel, op de bordjes, op het bord. SCHOOL. GROEP 5. BIEB. Juf Noor knikt. \"En nu, Letterdief?\" Hij glimlacht. \"Nu ga ik lezen.\"</p>",
  bso:"<p>De zin staat er. En dan staat hij er ineens zelf, bij de fietsenstalling: de Letterdief! Een klein mannetje met een jas vol zakken, en uit elke zak steken letters.</p><p>\"Jullie hebben mijn zin gemaakt!\" roept hij. \"Dat lukt bijna niemand! Ik stal letters omdat ik ze zo mooi vind. Maar jullie doen er echt iets mee: lezen, spellen, woorden bouwen. Dat is nog mooier.\"</p><p>Hij haalt de letters uit zijn zakken en plakt ze terug: SCHOOL. BIEB. GROEP 5. Meneer Tik lacht. \"En nu, Letterdief?\" \"Nu ga ik een boek lezen. Een dik boek.\"</p>"
};
var REVEAL0={
  school:"<p>De zin staat er! En daar is hij: de Letterdief, met een jas vol zakken. Uit elke zak steken letters.</p><p>\"Jullie hebben mijn zin gemaakt,\" zegt hij. \"Ik stal letters omdat ik ze mooi vind. Maar jullie doen er iets mee. Dat is mooier.\"</p><p>Hij plakt de letters terug: SCHOOL. BIEB. \"En nu ga ik lezen.\"</p>",
  bso:"<p>De zin staat er! En daar is hij: de Letterdief, met een jas vol zakken. Uit elke zak steken letters!</p><p>\"Jullie hebben mijn zin gemaakt! Ik stal letters omdat ik ze mooi vind. Maar jullie doen er iets mee. Dat is mooier.\"</p><p>Hij plakt de letters terug: SCHOOL. BIEB. \"En nu ga ik een dik boek lezen.\"</p>"
};
/* de zin van de Letterdief: per niveau zinnen van precies 6, 8 en 10 woorden; de woorden zijn de woordsleutels */
var ZIN={
  0:{6:["Ik hou van letters en woorden.","De dief leest nu een boek.","Mijn jas zit vol met letters."],8:["De dief heeft alle letters van de school.","Ik lees elke avond een boek in bed.","Wie goed leest, vindt de weg naar mij."],10:["De dief zit bij de fietsen met een jas vol letters.","Ik geef alle letters terug als jullie mijn zin maken.","Op het plein staat een man met letters in zijn zak."]},
  1:{6:["Wie leest, vindt de Letterdief.","Letters zijn mooi, woorden zijn mooier.","Zonder letters is de school stil."],8:["De Letterdief wacht bij de fietsenstalling op jullie.","Ik stal letters, maar jullie bouwen er woorden mee.","Wie mijn zin maakt, krijgt alle letters terug."],10:["De Letterdief zit bij de fietsenstalling met een jas vol letters.","Ik geef alle letters terug zodra jullie mijn hele zin maken.","Lezen is de enige manier om een letterdief te vinden."]},
  2:{6:["Letters worden pas mooi door lezers.","Wie goed leest, ontmaskert de dief."],8:["De Letterdief verstopt zich tussen de fietsen, met spijt.","Een letter zonder lezer is als een deur zonder huis."],10:["Hoewel ik letters stal, wilde ik eigenlijk alleen gelezen worden.","De Letterdief wacht bij de fietsenstalling, zijn zakken vol spijt."]}
};
var vow=function(w){return (w.match(/[aeiou]/gi)||[]).length};
var syl=function(w){var c=(w.toLowerCase().replace(/[^a-z]/g,"").match(/[aeiouy]+/g)||[]).length;return Math.max(1,c)};
var ltr=function(w){return w.replace(/[^a-zA-Z]/g,"")};
var pics=function(q,a,hint,o1,o2){return{kind:"choice",q:q,c:[{e:o1[0],t:o1[1]},{e:o2[0],t:o2[1]}],a:a,hint:hint}};
var ch=function(q,a,hint,opts){return{kind:"choice",q:q,c:opts,a:a,hint:hint}};
var S=[
{id:"bord",ico:"🪧",dom:"lezen",title:"Het straatnaambord",
 intro:"Elke straat heeft een naam op een bord. De Letterdief heeft ze gelukkig laten hangen. Zoek het dichtstbijzijnde straatnaambord (of een bordje met een naam) en lees de naam hardop.",
 act:{out:"Zoek een straatnaambord. Lees de naam hardop, zo hard dat de buren het horen. Typ hem precies over.",in:"Zoek een bordje met een naam: een lokaal, de bieb, de aula, een poster. Lees het hardop en typ het precies over."},
 tip:["Een naam begint met een hoofdletter. Kijk maar: straatnamen ook.","Klinkers zijn a, e, i, o, u (en soms y). De rest zijn medeklinkers.","Veel straatnamen zijn samenstellingen: Kerk + straat, Molen + weg. Het laatste deel zegt wat het is."],
 lvl:[{kind:"word",pre:"Typ de naam over (precies zoals op het bord):",fn:function(w){var n=ltr(w).length;return{kind:"choice",q:"\""+w+"\". Hoeveel letters heeft dit woord?",c:[{e:"🔤",t:String(n)+" letters"},{e:"🔡",t:String(n+2)+" letters"}],a:0}},hint:"Tel de letters één voor één. Wijs ze aan."},
      {kind:"word",pre:"Typ de naam over (precies zoals op het bord):",fn:function(w){var n=vow(w);return{q:"\""+w+"\". Hoeveel klinkers (a, e, i, o, u) zitten erin?",a:[String(n)]}},hint:"Klinkers zijn a, e, i, o en u. Tel ze."},
      {kind:"word",pre:"Typ de naam over (precies zoals op het bord):",fn:function(w){var n=syl(w);return{q:"\""+w+"\". Uit hoeveel lettergrepen bestaat de naam? Klap ze.",a:[String(n),String(n+1),String(Math.max(1,n-1))]}},hint:"Klap bij elke klinkerklank. Ker-k-straat: 2 klappen."}]},
{id:"klap",ico:"👏",dom:"lettergrepen",title:"Klap het woord",
 intro:"Lange woorden kun je in stukjes hakken: lettergrepen. Dat helpt bij lezen én bij spellen. Zoek om je heen het langste woord dat je ziet en klap het.",
 act:{out:"Zoek het langste woord dat je ziet (op een bord, een winkel, een busje). Klap de lettergrepen: zo-la-ri-um.",in:"Zoek het langste woord in deze ruimte (op een poster, een boek, een deur). Klap de lettergrepen."},
 tip:["Elk stukje dat je klapt heet een lettergreep. Ba-na-an: 3 klappen.","Je hakt een woord tussen twee medeklinkers: let-ter, kin-de-ren.","Lettergrepen bepalen de spelling: na één klinker in een open lettergreep komt één medeklinker (bo-men), in een gesloten twee (bom-men)."],
 lvl:[{kind:"word",pre:"Typ het woord over:",fn:function(w){var n=syl(w);return{kind:"choice",q:"\""+w+"\". Hoe vaak klap je?",c:[{e:"👏",t:String(n)+" keer"},{e:"👏👏",t:String(n+2)+" keer"}],a:0}},hint:"Zeg het woord langzaam en klap bij elk stukje."},
      {kind:"word",pre:"Typ het woord over:",fn:function(w){var n=syl(w);return{q:"\""+w+"\". Hoeveel lettergrepen?",a:[String(n),String(n+1),String(Math.max(1,n-1))]}},hint:"Klap bij elke klinkerklank."},
      {kind:"word",pre:"Typ het woord over:",fn:function(w){var n=syl(w),l=ltr(w).length;return{q:"\""+w+"\". Hoeveel letters heeft het woord, min het aantal lettergrepen?",a:[String(l-n),String(l-n-1),String(l-n+1)]}},hint:"Eerst letters tellen, dan lettergrepen klappen, dan aftrekken."}]},
{id:"rijm",ico:"🎵",dom:"rijm",title:"Rijmen op de buurt",
 intro:"Dichters zoeken woorden die rijmen. Zoek iets dat je ziet (een boom, een deur, een auto, een hek) en verzin een woord dat erop rijmt.",
 act:{out:"Kies iets dat je ziet: boom, deur, hek, auto, stoep, paal, raam. Verzin samen zo veel mogelijk rijmwoorden. Wie vindt de gekste?",in:"Kies iets in deze ruimte: stoel, deur, boek, kast, lamp, bord. Verzin samen zo veel mogelijk rijmwoorden."},
 tip:["Rijmen is: het eind klinkt hetzelfde. Boom – droom – stroom.","Rijmwoorden hebben vaak dezelfde letters aan het eind, maar niet altijd: hek en gek, maar ook lach en dag.","Een gedicht met rijm aan het eind van de regels heet eindrijm. Rijm in het midden van een regel heet binnenrijm."],
 lvl:[pics("Welk woord rijmt op 'boom'?",0,"Luister naar het eind: oom.",["💭","droom"],["🏠","huis"]),
      ch("Welk woord rijmt NIET op 'straat'?",2,"Zeg ze hardop: straat, laat, zaad, stoep.",["laat","zaad","stoep"]),
      ch("'Lach' en 'dag' rijmen. Hoe kan dat, terwijl ze anders geschreven worden?",0,"Rijm gaat over klank, niet over letters.",["Rijm gaat om de klank, niet om de letters","Ze rijmen eigenlijk niet","Omdat de g en de ch hetzelfde zijn in alle woorden"])]},
{id:"samen",ico:"🧩",dom:"samenstellingen",title:"Woorden plakken",
 intro:"Twee woorden aan elkaar maken een nieuw woord: fiets + pad = fietspad. Zo'n woord heet een samenstelling. De buurt staat er vol mee.",
 act:{out:"Zoek twee dingen die je ziet en plak ze aan elkaar tot een woord dat écht bestaat (lantaarnpaal, fietspad, stoeprand). Zoek er drie.",in:"Zoek twee dingen in deze ruimte en plak ze aan elkaar tot een woord dat écht bestaat (boekenkast, schoolbord, deurklink). Zoek er drie."},
 tip:["Een samenstelling schrijf je aan elkaar: fietspad, niet fiets pad.","Het laatste deel zegt wat het is: een fietspad is een pad, een padfiets zou een fiets zijn.","Soms komt er een tussen-s of tussen-n: stationsplein, boekenkast. Hoor je een s? Dan schrijf je hem."],
 lvl:[pics("Plak aan elkaar: fiets + pad = ?",1,"Gewoon achter elkaar.",["🛣️","padfiets"],["🚲","fietspad"]),
      {kind:"text",q:"Welk woord ontbreekt? lantaarn + … = lantaarnpaal. Typ het ontbrekende stukje.",a:["paal"],hint:"Waar hangt de lantaarn aan?"},
      {kind:"text",q:"Maak een samenstelling: boeken + kast en school + plein zijn er al. Typ een samenstelling met 'straat' als laatste deel (bijv. winkelstraat).",a:["winkelstraat","kerkstraat","dorpsstraat","hoofdstraat","zijstraat","woonstraat","schoolstraat","molenstraat","stationsstraat","marktstraat","langestraat","kortestraat","nieuwstraat","brugstraat","poststraat","parkstraat","hoogstraat","dwarsstraat","speelstraat","eenrichtingsstraat"],hint:"Iets + straat, aan elkaar. Bijvoorbeeld de straat van de kerk."}]},
{id:"tegen",ico:"↔️",dom:"woordenschat",title:"Tegenstellingen",
 intro:"Groot en klein, hoog en laag, open en dicht. Woorden met een tegengestelde betekenis heten tegenstellingen. Zoek er een paar in de buurt.",
 act:{out:"Zoek iets groots en iets kleins. Iets hoogs en iets laags. Iets ouds en iets nieuws. Wijs ze aan en zeg de twee woorden.",in:"Zoek in deze ruimte iets groots en iets kleins, iets hoogs en iets laags, iets ouds en iets nieuws."},
 tip:["Het tegenovergestelde van groot is klein. Van open is dicht.","Tegenstellingen heten ook antoniemen. Woorden die bijna hetzelfde betekenen heten synoniemen: groot en reusachtig.","Niet elk woord heeft een tegenstelling. 'Tafel' heeft er geen. Eigenschappen (bijvoeglijke naamwoorden) wel."],
 lvl:[pics("Wat is het tegenovergestelde van 'groot'?",0,"Een muis is …",["🐭","klein"],["🐘","zwaar"]),
      ch("Wat is het tegenovergestelde van 'ruim'?",1,"Een ruime kamer heeft veel plek. En een … kamer weinig.",["breed","krap","leeg"]),
      ch("Welk woord is een synoniem (bijna hetzelfde) van 'reusachtig'?",0,"Een reus is …",["enorm","piepklein","gevaarlijk"])]},
{id:"soort",ico:"🏷️",dom:"woordsoorten",title:"Wie doet wat?",
 intro:"Woorden hebben een soort. Dingen en mensen zijn zelfstandige naamwoorden (de boom, het kind). Wat je doet is een werkwoord (lopen, kijken). Kijk om je heen en benoem wat je ziet en wat er gebeurt.",
 act:{out:"Elk teamlid zegt een ding dat het ziet (een naamwoord) en iets dat er gebeurt (een werkwoord): 'de bus' – 'rijdt'. Maak er samen een zin van.",in:"Elk teamlid zegt een ding in deze ruimte (een naamwoord) en iets dat je ermee doet (een werkwoord): 'de stoel' – 'zit'. Maak er samen een zin van."},
 tip:["Voor een ding kun je 'de' of 'het' zetten: de boom, het hek. Dat zijn naamwoorden.","Een werkwoord zegt wat iemand doet of wat er gebeurt: loopt, rijdt, is. Je kunt er 'ik' voor zetten: ik loop.","Een bijvoeglijk naamwoord zegt iets over een naamwoord: de rode auto, het hoge gebouw."],
 lvl:[pics("Welk woord is iets dat je doet?",1,"Wat kun jij doen: een boom of rennen?",["🌳","boom"],["🏃","rennen"]),
      ch("Welk woord is een werkwoord?",2,"Zet er 'ik' voor: ik … .",["fiets (het ding)","fietspad","fietsen (wat je doet)"]),
      ch("In 'de oude boom staat scheef' is 'oude' een…",1,"Het zegt iets over de boom.",["werkwoord","bijvoeglijk naamwoord","zelfstandig naamwoord"])]},
{id:"spel",ico:"✍️",dom:"spelling",title:"Hoe schrijf je het?",
 intro:"De Letterdief ruilt ook letters om. Dan klopt de spelling niet meer. Een speurder ziet dat meteen. Kijk goed naar de woorden om je heen: staat alles goed?",
 act:{out:"Zoek een woord op een bord of een winkel en spel het samen hardop, letter voor letter. Daarna de vraag.",in:"Zoek een woord op een poster of boek en spel het samen hardop, letter voor letter. Daarna de vraag."},
 tip:["Luister goed: welke letter hoor je? Sch-ool: s, c, h.","Lange klank aan het eind van een lettergreep: één klinker (bo-men). Korte klank: dubbele medeklinker (bom-men).","'t Kofschip: eindigt de stam op t, k, f, s, ch of p? Dan verleden tijd met -te: fietste, maakte. Anders -de: speelde."],
 lvl:[pics("Hoe schrijf je het goed?",0,"Hoor je de s, de c en de h?",["🏫","school"],["❌","sgool"]),
      ch("Hoe schrijf je het goed?",0,"Bomen: lange o, dus één o en één m.",["bomen","boomen","bommen (als je 'veel boom' bedoelt)"]),
      ch("Verleden tijd van 'fietsen': ik …",0,"De stam is fiets. De s zit in 't kofschip.",["fietste","fietsde","fietsste"])]},
{id:"abc",ico:"🔠",dom:"alfabet",title:"Op alfabet",
 intro:"In de bibliotheek staan de boeken op alfabet, zodat je alles terugvindt. Een speurder ordent ook. Zoek drie woorden om je heen en zet ze op alfabet.",
 act:{out:"Zoek drie woorden (op borden, winkels, auto's). Zet ze op alfabet. Ga daarna zelf op een rij staan op alfabet van je voornaam, zonder praten!",in:"Zoek drie woorden in deze ruimte. Zet ze op alfabet. Ga daarna op een rij staan op alfabet van je voornaam, zonder praten!"},
 tip:["Het alfabet begint met a, b, c en eindigt met x, y, z.","Beginnen woorden met dezelfde letter? Kijk dan naar de tweede letter: kast komt voor klok.","In een woordenboek staan woorden op alfabet. Zo vind je er snel een, ook tussen honderdduizend andere."],
 lvl:[pics("Welke letter komt na de K?",0,"… h, i, j, k, en dan?",["🅻","L"],["🅹","J"]),
      ch("Welk woord staat op alfabet het eerst?",2,"Alle drie K. Kijk naar de tweede letter.",["klok","kast","kamer"]),
      ch("Zet op alfabet: Timmers, Tik, Tak. Welke komt als laatste?",0,"Ta, dan Ti. Dan Tik en Timmers: k komt voor m.",["Timmers","Tik","Tak"])]},
{id:"teken",ico:"❗",dom:"leestekens",title:"Leestekens",
 intro:"Een punt, een vraagteken, een uitroepteken: leestekens vertellen hoe je een zin moet lezen. Zoek een bord met een zin erop (een waarschuwing, een reclame, een naam) en lees hem met de goede toon.",
 act:{out:"Zoek een bord met tekst. Lees het drie keer: als een vraag, als een bevel, en heel verdrietig. Welke past?",in:"Zoek een poster of bord met tekst. Lees het drie keer: als een vraag, als een bevel, en heel verdrietig. Welke past?"},
 tip:["Aan het eind van een zin staat een punt. Een vraag eindigt met een vraagteken.","Een uitroepteken gebruik je als je iets roept of als het belangrijk is: Pas op!","Een komma is een korte pauze in de zin. Aanhalingstekens laten zien dat iemand iets zegt: \"Hallo,\" zei hij."],
 lvl:[pics("Wat staat er aan het eind van een vraag?",1,"Hoe laat is het…",["❗","!"],["❓","?"]),
      ch("Welk leesteken hoort achter 'Pas op voor de hond'?",1,"Het is een waarschuwing, je roept het.",["?","!",","]),
      ch("Welke zin is goed geschreven?",0,"Wat iemand zegt staat tussen aanhalingstekens, met een komma.",["\"Kom je ook?\" vroeg Noor.","Kom je ook? vroeg Noor\".","\"Kom je ook, vroeg Noor?\""])]},
{id:"zin",ico:"📝",dom:"zinsbouw",title:"Bouw een zin",
 intro:"Woorden alleen zeggen nog niets. Pas in een zin krijgen ze betekenis. Wie doet wat, waar? Bouw een zin over wat je hier ziet.",
 act:{out:"Elk teamlid zegt één woord, om de beurt, tot er een zin staat over iets dat je hier ziet. Begin met een hoofdletter, eindig met een punt.",in:"Elk teamlid zegt één woord, om de beurt, tot er een zin staat over deze ruimte. Begin met een hoofdletter, eindig met een punt."},
 tip:["Een zin begint met een hoofdletter en eindigt met een punt.","Wie doet het? Dat is het onderwerp. Wat doet hij? Dat is het gezegde: De bus (onderwerp) rijdt (gezegde).","Een zin heeft minstens een onderwerp en een persoonsvorm. De persoonsvorm verandert als je de zin in de verleden tijd zet: rijdt → reed."],
 lvl:[pics("Welke zin is goed?",0,"Een zin begint met een hoofdletter.",["✅","De bus rijdt."],["❌","de bus rijdt"]),
      ch("'De oude bus rijdt langzaam.' Wat is het onderwerp?",1,"Wie of wat rijdt?",["rijdt","de oude bus","langzaam"]),
      ch("'Gisteren liep de hond door het park.' Wat is de persoonsvorm?",0,"Zet de zin in de tegenwoordige tijd: welk woord verandert?",["liep","de hond","gisteren"])]},
{id:"verklein",ico:"🐣",dom:"spelling",title:"Klein, kleiner, -je",
 intro:"Met -je maak je alles klein: boom – boompje, huis – huisje. Maar hoe je het schrijft, hangt van het woord af. Kijk om je heen: wat kun je klein maken?",
 act:{out:"Zoek vijf dingen en maak ze klein: paaltje, deurtje, autootje. Zeg ze hardop. Welke klinkt het gekst?",in:"Zoek vijf dingen in deze ruimte en maak ze klein: stoeltje, boekje, lampje. Welke klinkt het gekst?"},
 tip:["Boom wordt boompje, huis wordt huisje. Je hangt er -je of -pje achter.","Na een lange klank aan het eind komt -tje met een extra klinker: auto – autootje, foto – fotootje.","Na -ing komt -kje (koning – koninkje) en na een m na een lange klank -pje (boom – boompje). Zo'n achtervoegsel heet een suffix."],
 lvl:[pics("Hoe maak je 'boom' klein?",1,"Boom… boom-pje.",["🌲","boomtje"],["🌱","boompje"]),
      ch("Hoe schrijf je 'auto' klein?",0,"Na een lange o komt een extra o.",["autootje","autotje","autoje"]),
      ch("Hoe schrijf je 'koning' klein?",2,"Na -ing komt -kje.",["koningje","koningtje","koninkje"])]},
{id:"spreek",ico:"🗣️",dom:"figuurlijk",title:"Zeg je dat zo?",
 intro:"\"Het regent pijpenstelen.\" Er vallen echt geen pijpjes uit de lucht. Dat is figuurlijk taalgebruik: je zegt iets anders dan je bedoelt. Spreekwoorden zitten er vol mee.",
 act:{out:"Verzin samen een gekke vergelijking over iets dat je ziet: 'Die boom is zo hoog als …'. Elk teamlid maakt er een.",in:"Verzin samen een gekke vergelijking over iets in deze ruimte: 'Die kast is zo zwaar als …'. Elk teamlid maakt er een."},
 tip:["'Zo snel als een haas' betekent: heel snel. Je vergelijkt met iets wat iedereen kent.","Een spreekwoord is een vaste zin met een wijze les: 'Wie een kuil graaft voor een ander, valt er zelf in.'","Letterlijk is wat er echt staat; figuurlijk is wat je bedoelt. 'Een hart van goud' is figuurlijk: heel lief."],
 lvl:[pics("'Zo snel als een haas.' Wat betekent dat?",0,"Een haas rent hard.",["🐇","heel snel"],["🐌","heel langzaam"]),
      ch("'Het regent pijpenstelen.' Wat betekent dat?",1,"Het is figuurlijk: niet echt pijpen.",["Er vallen pijpen uit de lucht","Het regent heel hard","Het regent een klein beetje"]),
      ch("'Wie het kleine niet eert, is het grote niet weerd.' Wat betekent dit spreekwoord?",0,"Klein en groot: waardering.",["Wees ook blij met kleine dingen","Grote mensen zijn belangrijker","Kleine dingen zijn niet belangrijk"])]},
{id:"leen",ico:"🌍",dom:"woordherkomst",title:"Woorden van ver",
 intro:"Veel woorden die we elke dag gebruiken komen uit andere talen: computer uit het Engels, pizza uit het Italiaans, koffie uit het Arabisch. Zoek om je heen naar woorden die niet uit Nederland komen.",
 act:{out:"Zoek op borden en winkels woorden uit een andere taal (sale, pizza, snackbar, garage, café). Hoeveel vind je er?",in:"Zoek in deze ruimte woorden uit een andere taal (computer, tablet, printer, poster, pen). Hoeveel vind je er?"},
 tip:["Pizza komt uit Italië. Daarom zeggen we 'pietsa' en niet 'pizza' met een z-klank.","Een leenwoord is een woord dat we uit een andere taal hebben overgenomen. Computer, weekend en baby komen uit het Engels.","Het Nederlands leende uit het Frans (bureau, cadeau), het Engels (computer) en het Arabisch (koffie, suiker). Andere talen leenden van ons: 'cookie' en 'boss' komen uit het Nederlands."],
 lvl:[pics("Welk woord komt uit het Engels?",1,"Het is iets waar je op typt.",["🚲","fiets"],["💻","computer"]),
      ch("Uit welke taal komt 'pizza'?",2,"Het land van spaghetti.",["Engels","Frans","Italiaans"]),
      ch("Welk Engels woord komt uit het Nederlands?",0,"Koekje… cookie.",["cookie","computer","weekend"])]},
{id:"brief",ico:"✉️",dom:"schrijven",title:"Een briefje voor de dief",
 intro:"Jullie schrijven een briefje aan de Letterdief. Kort, maar wel goed: een aanhef, een boodschap en een groet. Kijk eerst bij een brievenbus of een huis hoe een adres eruitziet.",
 act:{out:"Zoek een brievenbus of een huisnummer. Bedenk samen wat jullie de Letterdief willen zeggen, in drie zinnen. Eén teamlid zegt ze hardop.",in:"Bedenk samen wat jullie de Letterdief willen zeggen, in drie zinnen. Eén teamlid zegt ze hardop."},
 tip:["Een briefje begint met 'Beste …' of 'Lieve …' en eindigt met een groet en je naam.","Op een envelop staat het adres: naam, straat met huisnummer, postcode en plaats. Elk op een eigen regel.","Een formele brief ('Geachte heer') is anders dan een briefje aan een vriend ('Hoi!'). Dat heet register: je past je taal aan aan de lezer."],
 lvl:[pics("Hoe begint een briefje?",0,"Je begroet de lezer eerst.",["👋","Beste Letterdief,"],["🏁","Groetjes, wij"]),
      ch("Wat hoort op een envelop?",0,"Anders komt hij niet aan.",["Naam, straat en huisnummer, postcode en plaats","Alleen de naam","De datum en het weer"]),
      ch("Je schrijft een brief aan de burgemeester. Welke aanhef past?",2,"Formeel: de burgemeester ken je niet persoonlijk.",["Hoi burgemeester!","Lieve burgemeester,","Geachte heer/mevrouw,"])]}
];
var ORDER_KORT=["bord","klap","rijm","samen","spel","zin"];
return{lang:"nl",T:T,TYPES:TYPES,TIK:TIK,NOOR:NOOR,DIEF:DIEF,ROOMS:ROOMS,OPEN:OPEN,OPEN0:OPEN0,CLIFF:CLIFF,CLIFFLAST:CLIFFLAST,REVEAL:REVEAL,REVEAL0:REVEAL0,S:S,KORT:ORDER_KORT,ZIN:ZIN,FREE:true,
  LEADNOTE:"Tip: doe de korte introductieles vooraf (zie onder). Spreek het speelgebied af (buiten: alles binnen ongeveer 300 meter) en een eindtijd. Teams die vastzitten mogen de hint gebruiken (één per station). Bij de stations met een echt woord typt het team eerst het woord van het bord over; de vervolgvraag rekent daarmee (letters, klinkers, lettergrepen). Op het blad staat daarom het recept, niet één vast antwoord.",
  LES:[
   {intro:["Plak op het bord een woord met een paar letters weg (S_HO_L) en vraag: welke letters mist de Letterdief? Wat kun je niet zonder letters?","Oefen samen lettergrepen klappen met drie namen uit de klas en rijm op één ding in het lokaal.","Teams van 4–6 met een volwassene, één telefoon per team, zaakcode invullen. Zet voorlezen aan: de kinderen hoeven niet zelf te lezen, maar mogen het wel proberen."],
    na:["Welk woord van de straat vonden jullie het mooist? Schrijf alle gevonden woorden op het bord en klap ze samen.","Rijmen: maak klassikaal een rijmpje van vier regels over de Letterdief.","De zin van de Letterdief: schrijf hem op het bord. Waar staat de hoofdletter, waar de punt?","Thuisopdracht: zoek thuis drie woorden op pakken of flessen en breng ze mee."],
    doelen:"Groep 3–4 (SLO taal): klank-letterkoppeling, korte woorden lezen en schrijven, lettergrepen, rijm, hoofdletter en punt, samenstellingen herkennen, luisteren en spreken."},
   {intro:["Vraag: waar lees je buiten school allemaal? (borden, winkels, verpakkingen, apps). Wat gebeurt er als letters wegvallen?","Herhaal kort: klinkers en medeklinkers, lettergrepen, samenstellingen, tegenstellingen, naamwoord en werkwoord.","Teams van 4–6, één telefoon per team, zaakcode invullen. Afspraak: eerst hardop lezen, dan samen overleggen, één iemand typt."],
    na:["Zet alle gevonden woorden op het bord. Sorteer ze samen: naamwoorden, werkwoorden, samenstellingen, leenwoorden.","Welke spellingregel kwam je tegen? (lange en korte klank, verkleinwoorden, hoofdletters). Laat een team hem uitleggen.","De zin van de Letterdief: benoem onderwerp en gezegde. Maak er samen een vraag en een uitroep van.","Verdieping: schrijf in tweetallen het briefje aan de Letterdief af, met aanhef, drie zinnen en een groet."],
    doelen:"Groep 5–6 (SLO taal): spellingregels (open/gesloten lettergreep, verkleinwoorden), woordsoorten, samenstellingen, synoniemen en tegenstellingen, alfabetiseren, leestekens, zinsbouw, woordenschat."},
   {intro:["Vraag: wat is het verschil tussen letterlijk en figuurlijk? Verzamel drie uitdrukkingen die de klas kent.","Herhaal kort: 't kofschip, persoonsvorm en onderwerp, leenwoorden, register (formeel en informeel).","Teams van 4–6, één telefoon per team, zaakcode invullen. Afspraak: lees eerst hardop, redeneer samen, dan pas typen."],
    na:["Zet alle gevonden woorden op het bord en benoem per woord de herkomst (Nederlands, Engels, Frans…) en de woordsoort.","De zin van de Letterdief: ontleed hem (onderwerp, persoonsvorm, gezegde, bijwoordelijke bepaling). Zet hem in de verleden tijd en in de vragende vorm.","Figuurlijk taalgebruik: elk team maakt drie vergelijkingen over de buurt en legt uit wat letterlijk en figuurlijk is.","Verdieping: schrijf een formele brief aan de gemeente over iets dat jullie buiten zagen (een kapot bord, een onveilige oversteek), met aanhef, alinea's en afsluiting."],
    doelen:"Groep 7–8 (SLO taal): werkwoordspelling, zinsontleding (onderwerp, persoonsvorm, gezegde), figuurlijk taalgebruik en spreekwoorden, leenwoorden, leestekens bij directe rede, register, schrijven van een brief."}
  ]}
})();
