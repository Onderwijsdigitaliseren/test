/* De Betoverde Toverspiegel – Nederlandse teksten. Spel-logica staat in game.js. */
window.TS_DATA={lang:"nl",
/* drie kenmerken van Grimmel (per zaak geloot) */
COLS:["lila","mint","goud"],HATS:["een puntmuts","een kroontje","een strik"],HATS1:["puntmuts","kroontje","strik"],EYES:["twee ogen","drie ogen"],
/* woorden voor de toverspreuk */
WORDS:["kriebelkroon","glitterkwak","pannenkoek","toverspruitje","sokkensnoep","wiebelworst","knuffelkikker","fluisterfee","regenboogsnor","bubbelbeer","kietelkaas","maneschijnmuts"],
/* raadsels bij ingrediënt 4 (Tovenaar): rijm over de hoed, antwoord = index in HATS */
RIDDLE:[
 "Ik heb een punt, maar prik toch niet. Ik sta op het hoofd van wie toveren kan. Wat ben ik?",
 "Ik glinster goud en zit op een koning. Ik heb puntjes rondom, maar geen touw. Wat ben ik?",
 "Ik heb twee lussen en twee staartjes. Je ziet mij op een cadeautje of in het haar. Wat ben ik?"],
/* plaatjesraadsel (Elfje): "Wat zie je in de mist?" → zelfde hoeden als plaatje */
T:{
 listen:"Lees voor",cancel:"Annuleren",back:"Terug",close:"Sluiten",next:"Verder ▸",ok:"Oké!",skip:"Overslaan",
 today:"Start de zaak van vandaag",todayAgain:"Nog een keer: de zaak van vandaag",extra:"Extra zaak",pro:"Feestpas",
 demoH:"Dit was de oefenronde",demoT:"Zo werkt de Toverspiegel. De hele zaak, met alle zeven ingrediënten, de spiegelgeest en de kroning, speel je met de Feestpas.",
 namesH:"Wie doen er mee?",namesT:"Eén naam per regel (2 tot 10). De spiegel zegt steeds wie hem mag vasthouden.",namesPh:"Noor\nSem\nLina",namesErr:"Vul minstens twee namen in.",
 wakeH:"De spiegel slaapt nog",wakeT:"Tik op de knop en roep samen: SPIEGEL, WORD WAKKER! De telefoon vraagt dan of hij mag bewegen en luisteren. Zeg ja, anders tovert hij met zijn handen op de rug.",
 wake:"🔮 Spiegel, word wakker!",wakeOk:"De spiegel is wakker.",wakeMotion:"De spiegel voelt bewegen.",wakeMic:"De spiegel kan luisteren.",wakeNoMotion:"Bewegen lukt niet: schudden en kantelen worden tikken en vegen.",wakeNoMic:"Luisteren lukt niet: blazen en zingen worden tikken.",
 /* intro */
 in1:"Help… help! Is daar iemand?",in2:"Ik ben de toverspiegel van prinses Parel. Er is iets vreselijks gebeurd.",in3:"Grimmel, de spiegelgeest, heeft een grap uitgehaald. Kijk maar.",in4:"Kwaak. Hallo. Ik ben Parel. Ja, ik ben nu een kikker. Lach maar, ik lach zelf ook.",
 in5:"Alleen het Tegentoverdrankje helpt. Daar zijn zeven ingrediënten voor nodig. Ik weet hoe het moet, maar jullie moeten het doen.",in6:"En let op: Grimmel laat sporen achter. Onthoud alles wat je over hem ziet. Aan het eind moet je hem herkennen.",
 start:"We beginnen!",
 /* doorgeven */
 passH:"Geef de spiegel aan",passT:"De anderen helpen mee: roepen, zoeken, klappen.",passOk:"Ik heb hem!",
 /* ingrediënten */
 ing:[
  {n:"Sterrenstof",e:"✨",t:"Schud de spiegel zachtjes heen en weer tot de sterrenpot vol is. Te hard? Dan vliegen de sterren eruit!",tt:"Tik snel op de sterrenpot tot hij vol is.",done:"De sterrenpot is vol!",
   clue:"Kijk, Grimmel liet een sterretje achter. Zie je de kleur? Grimmel is {c}. Onthoud dat!"},
  {n:"Rozenblaadjes",e:"🌹",t:"Breng me iets ROODS! Richt de spiegel op iets roods in de kamer en houd hem stil tot de ring dicht is.",tt:"Tik op het rode ding in de kamer.",done:"Rood gevonden!",
   clue:"Hoorde je dat? Iemand giechelde… Grimmel is dichtbij."},
  {n:"Maanwater",e:"💧",t:"Kantel de spiegel en leid de waterdruppel door het doolhof naar de ketel.",tt:"Sleep de druppel met je vinger door het doolhof naar de ketel.",done:"De druppel is in de ketel!",
   clue:"Grimmel duwde de druppel twee keer weg. Hij speelt vals, maar hij lacht erbij. Volgens mij wil hij gewoon meedoen."},
  {n:"Vuurvliegadem",e:"🔥",t:"Blaas in de spiegel tot de mist weg is. Eronder staat iets getekend.",tt:"Veeg met je vinger over de mist tot hij weg is.",done:"De mist is weg!",
   clue:"Op de spiegel stond zijn hoed getekend. Grimmel draagt {h}. Onthoud dat!"},
  {n:"Slaapliedje",e:"🎵",t:"Tik mee op het ritme van de maan. Precies op de tel!",tt:"Tik mee op het ritme van de maan. Precies op de tel!",done:"Wat een mooi slaapliedje!",
   clue:"Grimmel viel bijna in slaap. Hij mompelde: '…niemand speelt ooit met mij…' Hm."},
  {n:"Het echte spiegelbeeld",e:"📸",t:"Allemaal samen voor de spiegel! Houd hem stil tot de foto scherp is.",tt:"Maak samen een foto met de camera.",done:"Wat een mooie foto. Maar wie staat daar achter jullie?",
   clue:"Dat was Grimmels schaduw. Kijk goed: hij heeft {o}. Onthoud dat!"},
  {n:"Een vriendelijk woord",e:"💛",t:"Zeg samen, hardop en luid, de drie toverwoorden die jullie verzamelden:",tt:"Tik de drie toverwoorden in de goede volgorde:",done:"De spreuk werkt! De ketel borrelt!",
   clue:"Nu hebben we alles. Tijd om Grimmel te vinden."}
 ],
 shakeHard:"Oei, te hard! De sterren vliegen eruit!",tilt:"Kantel…",pushed:"Hihi! Weggeduwd!",holdStill:"Houd stil…",sharp:"Scherp!",red:"ROOD",ringFill:"Houd vast…",
 beat:"Tik!",beatGood:"Mooi!",beatMiss:"Net naast…",beatCount:"{n} van {m}",
 riddleP:"Wat was er getekend in de mist?",riddleW:"Mira zegt een raadsel. Wat is het antwoord?",wrong:"Nee, kijk nog eens.",right:"Ja!",
 wordGet:"Jullie vinden een toverwoord:",wordsSoFar:"Toverwoorden:",speak:"Zeg het samen: {w}!",speakGo:"Luider!",speakOk:"Ik hoorde het!",
 selfieGo:"📸 Klik",selfieRetry:"Nog een keer",selfieOk:"Deze is goed",selfieNoCam:"Geen camera. Tik hieronder om een foto te kiezen.",pick:"Foto maken",
 silH:"Welke schaduw is Grimmel?",silT:"Kijk naar de hoed die jullie al kennen.",
 /* valse hint (Tovenaar) */
 lie:"Psst, dit is Grimmel. Ik verklap iets: ik ben {c}. Echt waar. Misschien.",
 /* finale */
 finH:"Wie zit er in de spiegel?",finT:"Drie spiegelgeesten. Eén is Grimmel. Weet je nog: zijn kleur, zijn hoed en zijn ogen?",finWrong:"Die is het niet… Kijk naar de kleur, de hoed en de ogen.",finRight:"Dat is Grimmel!",
 blowH:"Blaas allemaal tegelijk!",blowT:"Blaas de mist van de spiegel. Allemaal samen, zo hard je kunt!",blowTT:"Houd de knop ingedrukt tot de mist weg is.",blowBtn:"Blazen (ingedrukt houden)",
 back1:"Plop! Ik ben weer een prinses! Dank jullie wel, speurders!",back2:"En jij, Grimmel? Waarom deed je dat?",back3:"Omdat… niemand ooit met mij speelt. Ik woon al honderd jaar alleen in die spiegel.",
 askH:"Mag Grimmel op het feest blijven?",askY:"Ja, natuurlijk!",askN:"Alleen als hij lief is",askOk:"Hoera! Grimmel is vanaf nu de feest-spiegelgeest.",
 crownH:"De kroning",crownT:"Parel geeft haar kroontje aan de jarige. Maak een foto van {j} met de spiegel!",crownT0:"Parel geeft haar kroontje aan de jarige. Maak een foto van de jarige met de spiegel!",crownOk:"Lang leve {j}!",crownOk0:"Lang leve de jarige!",
 doneH:"Zaak opgelost!",doneT:"Prinses Parel is terug, Grimmel heeft vrienden en de ketel is leeg. Elk kind krijgt een diploma Spiegelspeurder.",dip:"Diploma's maken",dipH:"Diploma Spiegelspeurder",dipT:"Tik op een naam. Het plaatje kun je opslaan of delen via WhatsApp.",dipSave:"Opslaan",dipShare:"Delen",dipTitle:"Spiegelspeurder",dipLine:"heeft prinses Parel terugbetoverd en Grimmel een vriend gegeven",dipCase:"Zaak",
 home:"Naar het begin",again:"Nog een keer",
 /* zaakcode */
 dH:"Zaakcode",dT:"Vul de code van een andere telefoon in. Dan speel je dezelfde zaak (zelfde Grimmel, zelfde spreuk).",dGo:"Start deze zaak",dBad:"Die code klopt niet. Een zaakcode begint met TS.",codeIs:"Zaakcode: {c}",
 /* menu / ouderscherm */
 bookH:"Speurboekje",bookT:"Dit weten jullie al over Grimmel:",bookNone:"Nog niets. Let goed op de sporen!",
 menuH:"Ouderscherm",spiek:"Spiekbrief (lang indrukken)",spiekH:"Spiekbrief",spiekT:"Grimmel is {c}, draagt {h} en heeft {o}. De toverspreuk is: {w}.",spiekLie:"De valse hint van Grimmel gaat over zijn kleur.",
 sens:"Spiegelstand",sensA:"Spiegel (alle sensoren)",sensB:"Stille spiegel (geen microfoon)",sensC:"Oude spiegel (geen bewegen)",sensD:"Alleen tikken",
 pause:"Pauze",resume:"Verder",skipIng:"Dit ingrediënt overslaan",order:"Volgorde kinderen husselen",quit:"Stoppen met de zaak",quitT:"De zaak blijft bewaard; je kunt er straks mee verder.",
 wipe:"Wissen",wipeY:"Deze zaak wissen",wipeAll:"Alles wissen",wiped:"Gewist.",
 resumeBtn:"Verder met de zaak",
 /* puzzels na elk ingrediënt */
 pz:{starH:"Sterrenbeeld",starT:"Tik de sterren aan in de goede volgorde: 1, 2, 3…",starTT:"Kijk goed: de sterren lichten één voor één op. Tik ze daarna in dezelfde volgorde aan.",starBad:"Nee, die niet. Opnieuw!",
  roseH:"Tel de rozen",roseT:"Hoeveel rode rozen zie je? Alleen de rode rozen, niet de andere bloemen.",roseTT:"Hoeveel rode rozen zie je? Verwelkte rozen tellen niet mee.",
  moonH:"De maanreeks",moonT:"Welke maan komt hierna?",
  flyH:"Vang de vuurvliegjes",flyT:"Tik alleen op de MINT vuurvliegjes. Laat de lila met rust!",flyBad:"Au, dat was een lila!",flyDone:"Je ving {n} mint vuurvliegjes.",
  memH:"Het nachtegaal-geheugen",memT:"Vind de paren. Draai twee kaartjes om.",
  mirH:"Spiegelschrift",mirT:"In de spiegel staat een cijfer. Maar spiegels draaien alles om! Welk cijfer is het?",mirTT:"In de spiegel staan tekens. Eén ervan is een cijfer, in spiegelschrift. Welk?",
  digitGet:"Jullie vinden een gouden cijfer:",digitsSoFar:"Gouden cijfers:",timer:"⏱ {s}",timeUp:"De tijd is om, Grimmel giechelt. Maar jullie mogen door."},
 /* escape-room: de spiegelwereld */
 rm:{enterH:"De spiegelwereld",enter1:"De ketel borrelt… en het glas van de spiegel wordt zacht als water. Grimmel verstopt zich in zijn eigen wereld, áchter het glas. Durven jullie?",
  enter2:"Jullie steken je hand door de spiegel… en staan in Grimmels kamer. Het is er pikdonker.",
  dark:"Schuif met je vinger over het scherm om rond te kijken. Ergens staat een lantaarn.",lampOn:"Licht! Dit is de kamer van Grimmel. Schuif opzij om alles te zien.",
  roomT:"Open de kist, de boekenkast en de kandelaar. Dan gaat de deur open.",
  chestH:"De kist",chestT:"Drie gouden cijfers, in de volgorde waarin jullie ze vonden.",chestBad:"De kist blijft dicht.",chestOk:"Klik! In de kist ligt een gouden sleutel.",
  booksH:"De boekenkast",booksT:"Tik de boeken aan in de volgorde van de eerste zes letters van het eerste toverwoord: {w}",booksTT:"Tik de boeken aan in de volgorde van de eerste zes letters van het eerste toverwoord. Weet je het nog?",booksBad:"De boeken vallen terug. Opnieuw.",booksOk:"Een geheime la schuift open: een spiegelscherf!",
  candleH:"De kandelaar",candleT:"Steek de kaarsen aan in de kleurvolgorde van het schilderij.",candleTT:"Tik op het schilderij: het toont de volgorde maar heel even. Kijk goed!",candleOk:"Alle kaarsen branden. Op de muur verschijnt: 'Grimmel heeft {o}.'",candleBad:"Poef! Allemaal weer uit.",
  doorH:"De deur",doorLock:"Op slot. Je hebt de sleutel én de spiegelscherf nodig.",doorOk:"De sleutel past, de scherf glinstert… de deur zwaait open. Daar, in het grote glas, zie je drie spiegelgeesten.",
  inv:"Gevonden:",key:"sleutel",shard:"scherf",lamp:"lantaarn",open:"Open",light:"Aansteken",look:"Bekijk",
  taunts:["Hihi! Jullie vinden me tóch nooit!","Psst… ben ik links of rechts? Hihi!","Wat zijn jullie langzaam! Grapje. Of niet.","Niemand speelt ooit met mij… behalve jullie misschien?"]},
 how:["<b>De telefoon is de toverspiegel.</b> Hij gaat de kring rond. Per ingrediënt zegt de spiegel wie hem mag vasthouden; de anderen helpen.",
  "<b>Zeven ingrediënten,</b> elk een opdracht met de telefoon zelf (schudden, kantelen, blazen, iets roods zoeken met de camera, meeklappen, een groepsfoto, de toverspreuk roepen) en daarna een puzzel: sterrenbeeld, rozen tellen, maanreeks, vuurvliegjes vangen, memory en spiegelschrift.",
  "<b>Dan de escape-room:</b> jullie stappen door de spiegel in Grimmels donkere kamer. Zoek de lantaarn, kraak de kist met de drie gouden cijfers, leg de boekenkast en de kandelaar om, en open de deur.",
  "<b>Elfje</b> is makkelijk: de spiegel zegt precies wat je moet doen en de raadsels zijn met plaatjes. <b>Tovenaar</b> is pittiger: raadsels met woorden en Grimmel geeft één valse hint.",
  "Tussendoor zie je sporen van Grimmel: zijn kleur, zijn hoed en zijn ogen. Aan het eind kies je hem uit drie spiegelgeesten.",
  "Dan blazen jullie samen de betovering weg, krijgt de jarige het kroontje op een foto, en krijgt elk kind een diploma om te delen."],
 howTip:"Tip voor de volwassene: als bewegen of luisteren niet mag van de telefoon, schakelt de spiegel vanzelf om naar tikken en vegen. In het menu (☰) staat een spiekbrief en een overslaan-knop."
}};
