/* Charlie is zijn hond kwijt – MiniMystery Educatie (Engels, groep 5–8; niveau 0 voor vroeg-Engels in groep 3–4). Teksten en stations (NL + EN).
   Charlie woont net in de buurt, komt uit Engeland en spreekt alleen Engels. Zijn hond Biscuit is weggelopen. De teams helpen zoeken,
   en daarvoor moeten ze Engels gebruiken: tellen, kleuren, dieren, de weg wijzen, de tijd, het weer. Charlie's zinnen staan in het
   Engels (en worden met een Engelse stem voorgelezen); juf Noor vertaalt of legt uit. Elk station geeft een Engelse woordsleutel.
   In de finale zetten ze de woorden in de goede volgorde tot Charlie's zin: dan weten ze waar Biscuit is.
   Niveaus: 0 = vroeg-Engels (kleuren, tellen tot 10, dieren; twee plaatjes als antwoord, voorgelezen) · 1 = groep 5–6 (woorden en
   korte zinnen: greetings, numbers, colours, animals, food, body, the time, prepositions) · 2 = groep 7–8 (zinnen en vragen: directions,
   question words, weather, clothes, can/can't, there is/are, past tense).
   Per station: intro (nl), en (Charlie, Engels), act {out,in}, lvl[3] (kind text/choice/count/word), tip. */
window.EN_DATA=(function(){
var T={
  today:"Start de zaak van vandaag",extra:"Extra zaak",voice:"Voorlezen",voiceOn:"Voorlezen staat aan",voiceOff:"Voorlezen staat uit",
  start:"Open het station",next:"Verder ▸",back:"Terug",close:"Sluiten",cancel:"Annuleren",ok:"Controleer ▸",listen:"Voorlezen",
  loc:"Waar zijn jullie? De telefoon vraagt om je locatie.",pois:"Charlie zoekt plekken in de buurt…",nomap:"De kaartdienst is druk. We spelen op een getekende plattegrond.",
  noGps:"Deze telefoon heeft geen gps.",denied:"De locatie staat uit. Zet hem aan in de instellingen, of speel zonder kaart.",fail:"Dat lukte niet",
  corner:"Hoek",task:"Station {i} van {n}",clue:"Woordsleutel {n} van {t}",
  near:"Volgend station op {d} m",warm:"Warm! Nog {d} m",hot:"Heet! Hier staat een station",radarAll:"Alle woordsleutels! Terug naar Charlie.",
  here:"Hier is een station",look:"Open het station",walk:"Loop erheen",gps:"We staan er echt (gps twijfelt)",
  notebook:"Wordbook",nbK:"Woordsleutels (Charlie's zin)",nbM:"Woorden die jullie vonden",nbNone:"Nog niets gevonden. Loop naar het eerste station.",
  menu:"Menu",mBack:"Terug naar de zaak",mHome:"Pauze, later verder",mWipe:"Deze zaak wissen",mLead:"Begeleidersblad",saved:"Opgeslagen. Je kunt later verdergaan.",
  wipe:"Wissen",wipeY:"Deze zaak wissen",wipeAll:"Alles wissen (ook het archief)",wipeQ:"Zaak wissen?",wipeT:"De voortgang is dan weg.",allQ:"Alles wissen?",allT:"Zaak, archief en instellingen worden gewist.",allY:"Ja, alles wissen",wiped:"Gewist",
  dH:"Zaakcode invullen",dT:"Met een zaakcode spelen meer telefoons dezelfde zaak: dezelfde plekken, dezelfde stations. Elke klas of groep krijgt zo één zaak voor alle teams.",dGo:"Zaak ophalen",dBad:"Die code kennen we niet. Codes beginnen met EN.",
  demoCase:"Proefronde · getekende stad",demoTip:"Tik op een plek op de kaart: jullie groepje loopt er vanzelf heen.",
  howH:"Hoe werkt het?",
  won:"Biscuit gevonden",dipBtn:"Diploma (A4)",dipH:"Diploma English Detective",dipNote:"Printen of opslaan. Eén per team, of print er voor elk kind een.",leadBtn:"Begeleidersblad",home:"Naar het begin",dl:"Opslaan",shareBtn:"Delen",copied:"Gekopieerd",
  shareTxt:"We found Biscuit! Zaak {c} · {s} · {m} min. ",missed1:"Zonder hints: drie sterren.",
  pzT:"Overleg samen. Eén iemand typt. Engelse woorden, geen hoofdletters nodig.",wrong:"Not quite. Overleg nog eens.",wrongHint:"Not quite. Pak de hint, of overleg nog eens.",hintBtn:"💡 Hint",hintUsed:"Hint gebruikt",
  countGo:"Ingevuld ▸",photoGo:"📷 Maak de foto",photoAgain:"Nog een keer",photoOk:"Dit is hem! ▸",photoKeep:"De foto blijft op deze telefoon.",
  keyGet:"Een woordsleutel:",tipH:"Good to know",
  finH:"Charlie's zin",finT:"Tik de woordsleutels aan in de goede volgorde, zodat er een Engelse zin staat. Hoofdletter vooraan, punt achteraan.",finT0:"Tik de woorden aan zodat er een zin staat. Het woord met de hoofdletter komt eerst.",finBad:"That's not it. Begin opnieuw.",finHint:"Een Engelse zin: wie (The dog) – doet wat (is) – waar (in the park). Het woord met de hoofdletter eerst.",finHint0:"Eerst het woord met de hoofdletter. Als laatste het woord met de punt.",finNot:"Eerst alle stations doen. Nog {n} te gaan.",finOk:"Yes! That's the sentence. Charlie weet nu waar Biscuit is.",
  stripT:"Zaak {c}",keysBar:"Woordsleutels",
  gbH:"In het gebouw",gbT:"Kies de plekken in jullie school. De begeleider hangt op elke plek een kaartje met een code (printen via het begeleidersblad). Teams gaan naar de plek en typen de code.",gbNoCards:"Zonder kaartjes (teams drukken zelf op 'We zijn er')",gbGo:"Zaak starten",gbMin:"Kies minstens {n} plekken (of de plekken worden herhaald).",
  gbGoto:"Ga naar:",gbCode:"Typ de code van het kaartje op die plek",gbHere:"We zijn er ▸",gbBad:"Die code hoort niet bij deze plek. Kijk nog eens op het kaartje.",gbCards:"Plekkaartjes (ophangen)",gbCardT:"English station",
  leadH:"Begeleidersblad",leadT:"Alleen voor de begeleider. Dit blad hoort bij deze zaakcode: alle teams met deze code krijgen precies deze stations.",leadTeams:"Teamstand (zelf bijhouden)",leadTeam:"Team",leadDone:"Klaar om",leadPrint:"Printen",leadCode:"Zaakcode",
  lvl:["vroeg-Engels (groep 3–4)","groep 5–6","groep 7–8"],
  nw:{6:"zes",8:"acht",10:"tien"},
  kv:{fp:["Fietsenstalling","Bushalte","Speeltuin","Schoolplein","Brug","Park","Kerk","Plein","Winkel","Brievenbus","Kiosk","Bankje"],
    all:"Alle woordsleutels! Terug naar Charlie.",near:"Station op {d} m",cold:"Koud… loop een andere kant op",cool:"Lauw. Dichterbij komt-ie",warm:"Warm! Goed zo!",hot:"HEET! Kijk om je heen!",here:"Hier is het station!",first:"Loop maar, het kompas wijst de weg",noDir:"Loop een stukje, dan weet het kompas de richting",
    map:"Plattegrond",kids:"Verhaalkaart",mapTip:"De echte plattegrond. Tik op Verhaalkaart voor de kindertekening.",goDemo:"We lopen (nep) naar {p}…",inSteps:"Nog {n} stappen",
    mNoMap:"Verder zonder kaart (zelfde zaak)",switched:"Verder zonder kaart. Dezelfde zaak, dezelfde stations.",virtOut:"Geen plattegrond van de buurt gevonden. Jullie lopen op de verhaalkaart: de pijl en warm/koud wijzen de weg.",
    noMapQ:"Geen locatie vandaag?",noMapT:"De telefoon geeft geen locatie door. Jullie kunnen dezelfde zaak zonder kaart spelen: de stations komen dan achter elkaar en jullie lopen zelf naar een nieuwe plek.",noMapGo:"Verder zonder kaart",
    inH:"",inT:"",inSensor:"",inTempo:"",inNoSensor:""}
};
var TYPES={kerk:"de kerk",hotel:"het hotel",bank:"de bank",apotheek:"de apotheek",cafe:"het café",bieb:"de bibliotheek",park:"het park",school:"de school",kunst:"het kunstwerk",tank:"het tankstation",winkel:"de winkel",halte:"de bushalte",post:"de brievenbus",bankje:"het bankje",hoek:"de hoek"};
var TIK="Meneer Tik",NOOR="Juf Noor",CHARLIE="Charlie";
var ROOMS=["De hal bij de ingang","De aula","De gymzaal","De bibliotheek of leeshoek","De trap","Bij de lerarenkamer","De keuken","Het schoolplein","Een kleuterlokaal","Een bovenbouwlokaal","Bij de directiekamer","De fietsenstalling","Het speellokaal","De kapstokken"];
var OPEN={
  school:"Vanmorgen stond er een jongen op het schoolplein die niemand kende. Hij heet Charlie, hij komt uit Engeland en hij woont hier sinds vorige week. Hij huilde bijna. \"My dog ran away. His name is Biscuit. Can you help me?\" Charlie spreekt nog geen Nederlands. Dus als jullie hem willen helpen, moet dat in het Engels. Op {N} plekken in de buurt heeft iemand Biscuit gezien. Daar krijgen jullie van Charlie een vraag of een opdracht in het Engels. Elk station geeft een Engels woord: een woordsleutel. Met alle woorden in de goede volgorde staat er een zin, en die zin zegt waar Biscuit is.",
  bso:"Er staat een jongen op het plein die niemand kent. Hij heet Charlie, hij komt uit Engeland en hij woont hier pas een week. \"My dog ran away! His name is Biscuit. Can you help me?\" Charlie spreekt nog geen woord Nederlands. Dus helpen doe je in het Engels! Op {N} plekken in de buurt heeft iemand Biscuit gezien. Daar krijg je van Charlie een vraag of een opdracht in het Engels. Elk station geeft een Engels woord. Alle woorden op de goede volgorde: dan staat er een zin, en die zegt waar Biscuit is."
};
var OPEN0={
  school:"Er staat een jongen op het plein. Hij heet Charlie en hij komt uit Engeland. Hij is zijn hond kwijt. De hond heet Biscuit. Charlie spreekt alleen Engels. Jullie gaan helpen, in het Engels! Op {N} plekken is Biscuit gezien. Daar stelt Charlie een vraag. Elk station geeft een Engels woord. Alle woorden op een rij: dan weet je waar Biscuit is.",
  bso:"Er staat een jongen op het plein. Hij heet Charlie en hij komt uit Engeland. Hij is zijn hond kwijt! De hond heet Biscuit. Charlie spreekt alleen Engels. Jullie gaan helpen, in het Engels! Op {N} plekken is Biscuit gezien. Daar stelt Charlie een vraag. Elk station geeft een Engels woord. Alle woorden op een rij: dan weet je waar Biscuit is!"
};
var CLIFF=["Well done! Charlie snapt jullie helemaal.","Weer een woord. Charlie's zin wordt langer.","\"Brilliant!\" zegt Charlie. Dat betekent: geweldig.","Jullie Engels wordt steeds beter. Verder!","Biscuit is dichtbij, ik voel het.","On to the next station!"];
var CLIFFLAST="That was the last station! Nu alle woordsleutels op volgorde: dan staat Charlie's zin er.";
var REVEAL={
  school:"<p>De zin staat er. Charlie leest hem hardop, en zijn ogen worden groot. \"Of course!\" Hij rent vooruit, jullie erachteraan. En daar, precies waar de zin het zei, ligt een kleine bruine hond te slapen in de zon. \"Biscuit!\"</p><p>Biscuit springt op, kwispelt, likt Charlie's hele gezicht. Charlie draait zich om. \"Thank you. Thank you so much. You are… hoe zeg je dat… jullie zijn mijn vrienden.\" Juf Noor lacht. \"Dat was al bijna Nederlands, Charlie.\" \"And your English,\" zegt Charlie, \"is brilliant.\"</p>",
  bso:"<p>De zin staat er. Charlie leest hem hardop en roept: \"Of course!\" Hij rent vooruit, jullie erachteraan. En daar, precies waar de zin het zei, ligt een kleine bruine hond te slapen in de zon. \"Biscuit!\"</p><p>Biscuit springt op, kwispelt als een gek en likt Charlie's hele gezicht. Charlie draait zich om. \"Thank you! You are… hoe zeg je dat… jullie zijn mijn vrienden!\" Meneer Tik lacht. \"Dat was al bijna Nederlands, Charlie.\" \"And your English,\" zegt Charlie, \"is brilliant!\"</p>"
};
var REVEAL0={
  school:"<p>De zin staat er! Charlie roept: \"Of course!\" en rent vooruit. En daar ligt een kleine bruine hond in de zon. \"Biscuit!\"</p><p>Biscuit kwispelt en likt Charlie's gezicht. \"Thank you!\" zegt Charlie. \"Jullie zijn mijn vrienden.\"</p>",
  bso:"<p>De zin staat er! Charlie roept: \"Of course!\" en rent vooruit. En daar ligt een kleine bruine hond in de zon. \"Biscuit!\"</p><p>Biscuit kwispelt als een gek. \"Thank you!\" zegt Charlie. \"Jullie zijn mijn vrienden!\"</p>"
};
/* Charlie's zin (waar Biscuit is): per niveau zinnen van 6, 8 en 10 woorden */
var ZIN={
  0:{6:["Biscuit is in the big park.","The dog is under a tree.","My dog is at the school."],8:["Biscuit is sleeping under the big green tree.","The brown dog is in the sunny park.","My dog is at the bus stop now."],10:["Biscuit is sleeping in the sun next to the school.","The little brown dog is under a big tree now."]},
  1:{6:["Biscuit is behind the old school.","The dog is near the bridge.","Biscuit sleeps under the big tree."],8:["Biscuit is sleeping in the park near school.","The brown dog is under the old bridge.","My dog is behind the bus stop, sleeping."],10:["Biscuit is sleeping in the sun behind the old school.","The little dog is waiting next to the bus stop."]},
  2:{6:["Biscuit is waiting near the school.","The dog ran to the park."],8:["Biscuit ran to the park and fell asleep.","My dog is sleeping behind the old church."],10:["Biscuit ran to the park and fell asleep over there.","I think that Biscuit is sleeping behind the old school."]}
};
var NUM=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
var numEN=function(n){if(n<=20)return [NUM[n]];var t=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"][Math.floor(n/10)],u=n%10;return u?[t+"-"+NUM[u],t+" "+NUM[u],t+NUM[u]]:[t]};
var pics=function(q,a,hint,o1,o2){return{kind:"choice",q:q,c:[{e:o1[0],t:o1[1]},{e:o2[0],t:o2[1]}],a:a,hint:hint}};
var ch=function(q,a,hint,opts){return{kind:"choice",q:q,c:opts,a:a,hint:hint}};
var S=[
{id:"colours",ico:"🎨",dom:"colours",title:"Colours",en:"Biscuit is brown. Look around: what colours can you see?",
 intro:"Charlie vraagt naar kleuren: Biscuit is bruin. Kijk om je heen: welke kleuren zie je? Deuren, auto's, bloemen, jassen.",
 act:{out:"Wijs om de beurt iets aan en zeg de kleur in het Engels: red, blue, green, yellow, white, black, brown, orange, pink, purple, grey. Wie weet er de meeste?",in:"Wijs om de beurt iets in deze ruimte aan en zeg de kleur in het Engels: red, blue, green, yellow, white, black, brown, orange, pink, purple, grey."},
 tip:["Brown is bruin. Green is groen. Blue is blauw. Red is rood.","In Engeland schrijf je 'colour' met een u. In Amerika 'color' zonder u.","Light blue, dark green: 'light' is licht, 'dark' is donker. 'What colour is it?' is de vraag; 'It's red.' het antwoord."],
 lvl:[pics("Biscuit is brown. Welke kleur is dat?",1,"Brown… bruin. Hoor je het?",["🟩","groen"],["🟫","bruin"]),
      {kind:"text",q:"Zoek iets dat rood is. Hoe heet die kleur in het Engels?",a:["red"],hint:"R-e-d. Drie letters."},
      {kind:"text",q:"Zoek iets dat paars of oranje is. Typ de Engelse naam van die kleur.",a:["purple","orange"],hint:"Paars begint met een p, oranje lijkt op het Nederlands."}]},
{id:"numbers",ico:"🔢",dom:"numbers",title:"Numbers",en:"How many windows can you see? Count them in English!",
 intro:"Charlie wil weten hoeveel ramen er in het gebouw hiernaast zitten. Tel ze samen, en zeg de getallen in het Engels: one, two, three…",
 act:{out:"Tel de ramen van het dichtstbijzijnde gebouw hardop in het Engels: one, two, three, four… Hoeveel zijn het?",in:"Tel de ramen (of stoelen) in deze ruimte hardop in het Engels: one, two, three, four… Hoeveel zijn het?"},
 tip:["One, two, three, four, five, six, seven, eight, nine, ten.","Eleven, twelve, thirteen… en dan -teen tot twenty. Thirty, forty, fifty: dat zijn de tientallen.","Twenty-one, twenty-two: in het Engels zeg je eerst het tiental, dan de eenheid. Andersom dan in het Nederlands (eenentwintig)."],
 lvl:[{kind:"count",pre:"Hoeveel ramen hebben jullie geteld?",fn:function(x){var n=Math.min(10,Math.max(1,x)),o=n===10?9:n+1;return{kind:"choice",q:"Jullie telden "+x+". Hoe zeg je "+n+" in het Engels?",c:[{e:"🔢",t:NUM[n]},{e:"🔢",t:NUM[o]}],a:0}},hint:"Tel hardop: one, two, three…"},
      {kind:"count",pre:"Hoeveel ramen hebben jullie geteld?",fn:function(x){var n=Math.min(20,x);return{q:"Jullie telden "+x+". Typ "+n+" in het Engels (met letters).",a:numEN(n)}},hint:"One, two, three… tot twenty. Let op de spelling van eight en twelve."},
      {kind:"count",pre:"Hoeveel ramen hebben jullie geteld?",fn:function(x){var n=x+15;return{q:"Jullie telden "+x+". Er komen 15 ramen bij: typ "+n+" in het Engels (met letters, bijvoorbeeld twenty-three).",a:numEN(Math.min(99,n))}},hint:"Eerst het tiental (twenty, thirty…), dan een streepje, dan de eenheid."}]},
{id:"animals",ico:"🐾",dom:"animals",title:"Animals",en:"Have you seen a dog? Or a cat? A bird? Any animals?",
 intro:"Charlie vraagt of jullie dieren hebben gezien. Kijk en luister: een vogel, een kat, een hond, een insect? Zeg ze in het Engels.",
 act:{out:"Zoek dieren (of sporen van dieren) en zeg ze in het Engels: a bird, a cat, a dog, a duck, a bee, a spider, a snail. Hoeveel verschillende vinden jullie?",in:"Noem alle dieren die je vanuit het raam ziet, of die je kent, in het Engels: a bird, a cat, a dog, a fish, a horse, a cow. Hoeveel weten jullie er?"},
 tip:["Dog is hond, cat is kat, bird is vogel.","Een dier: a dog. Meer dieren: dogs. Je plakt er een s achter. Mouse wordt mice: dat is een uitzondering.","Een puppy is een jonge hond, a kitten een jonge kat. 'Pet' is huisdier; 'wild animals' zijn wilde dieren."],
 lvl:[pics("Biscuit is a dog. Wat is een 'cat'?",0,"Miauw.",["🐱","een kat"],["🐦","een vogel"]),
      {kind:"text",q:"Hoe zeg je 'vogel' in het Engels?",a:["bird","a bird"],hint:"B-i-r-d."},
      {kind:"text",q:"Je ziet drie honden. Typ in het Engels: 'drie honden' (twee woorden).",a:["three dogs"],hint:"Three, en dan dog met een s."}]},
{id:"where",ico:"📍",dom:"prepositions",title:"Where is it?",en:"Where could Biscuit hide? Under a bench? Behind a tree? In a box?",
 intro:"Waar zou een hondje zich verstoppen? Onder een bankje, achter een boom, in een doos, naast een auto. Charlie leert jullie de woorden: under, behind, in, on, next to.",
 act:{out:"Zoek vijf plekken waar een hond zich kan verstoppen en zeg ze in het Engels: under the bench, behind the tree, in the bush, next to the car, on the wall.",in:"Zoek vijf plekken in deze ruimte waar een hond zich kan verstoppen en zeg ze in het Engels: under the table, behind the door, in the cupboard, next to the bag, on the chair."},
 tip:["Under is onder. On is op. In is in.","Behind is achter, in front of is voor, next to is naast, between is tussen.","'Where is Biscuit?' – 'He's under the bench.' Het antwoord begint met he's (he is) of it's (it is)."],
 lvl:[pics("Biscuit zit ONDER het bankje. Hoe zeg je 'onder'?",1,"Un-der.",["🔼","on"],["🔽","under"]),
      {kind:"text",q:"Hoe zeg je 'achter de boom' in het Engels? (drie woorden)",a:["behind the tree"],hint:"Be-hind the tree."},
      {kind:"text",q:"Maak de zin af in het Engels: 'The dog is … the car and the bike.' (tussen)",a:["between"],hint:"Be-tween."}]},
{id:"directions",ico:"🧭",dom:"directions",title:"Left or right?",en:"I'm lost. Is the park on the left or on the right?",
 intro:"Charlie kent de buurt nog niet. Hij wil naar het park, maar welke kant op? Wijs hem de weg in het Engels: left, right, straight on.",
 act:{out:"Ga met z'n allen dezelfde kant op kijken. Wijs naar het park (of de school): is dat left, right of straight on? Loop vijf stappen en roep: turn left! turn right!",in:"Ga met z'n allen naar de deur kijken. Wijs naar de uitgang: is dat left, right of straight on? Loop vijf stappen en roep: turn left! turn right!"},
 tip:["Left is links, right is rechts. Onthoud: Left begint met een L, net als Links.","Go straight on: rechtdoor. Turn left: sla linksaf. It's on your right: het is aan je rechterkant.","'Excuse me, how do I get to the park?' – 'Go straight on, then turn left at the church. It's opposite the school.' Opposite is tegenover."],
 lvl:[pics("Charlie moet naar LINKS. Wat roep je?",0,"Links en Left beginnen allebei met een L.",["⬅️","left"],["➡️","right"]),
      {kind:"text",q:"Hoe zeg je 'rechtdoor' in het Engels? (twee woorden)",a:["straight on","straight ahead","go straight","go straight on"],hint:"Straight… on."},
      {kind:"text",q:"Vertaal: 'Sla rechtsaf bij de kerk.' (vijf woorden, begin met Turn)",a:["turn right at the church"],hint:"Turn right at the church."}]},
{id:"time",ico:"⏰",dom:"time",title:"What time is it?",en:"What time is it? Biscuit always wants his dinner at five o'clock!",
 intro:"Biscuit krijgt altijd om vijf uur eten. Dan komt hij vast terug! Maar hoe laat is het nu? Charlie vraagt het in het Engels.",
 act:{out:"Kijk op de tijd bovenin het scherm. Zeg hardop in het Engels hoe laat het is: It's ten o'clock. It's half past two. Doe daarna samen een klok na: twee kinderen zijn de wijzers.",in:"Kijk op de klok in de klas of bovenin het scherm. Zeg hardop in het Engels hoe laat het is: It's ten o'clock. It's half past two."},
 tip:["It's five o'clock: het is vijf uur.","Half past five is half zes! In het Engels tel je een half uur ná het hele uur. Quarter past is kwart over, quarter to is kwart voor.","'Twenty past four' is 4:20. 'Ten to six' is 5:50. En 'a.m.' is 's ochtends, 'p.m.' 's middags en 's avonds."],
 lvl:[pics("Biscuit eet om vijf uur. Hoe zeg je dat?",1,"Five o'clock.",["🕒","three o'clock"],["🕔","five o'clock"]),
      ch("Hoe laat is 'half past five'?",1,"Let op: half past five is NIET half vijf.",["4:30","5:30","5:00"]),
      ch("Hoe laat is 'quarter to seven'?",0,"To = voor. Een kwartier vóór zeven.",["6:45","7:15","6:15"])]},
{id:"food",ico:"🍎",dom:"food",title:"Food",en:"I'm hungry. Is there a shop near here? I'd like an apple and some water.",
 intro:"Charlie heeft honger en Biscuit vast ook. Is er een winkel in de buurt? Wat zou je daar kopen? Zeg het in het Engels: an apple, bread, milk, water.",
 act:{out:"Zoek een winkel, kiosk of snackbar (of stel je er een voor). Elk teamlid zegt in het Engels één ding dat je er koopt: I'd like an apple, please.",in:"Stel je de schoolkantine voor. Elk teamlid zegt in het Engels één ding dat je er koopt: I'd like a sandwich, please."},
 tip:["Apple is appel, bread is brood, milk is melk, water is water.","'I'd like … please.' is beleefd vragen. 'Can I have …?' kan ook. Vergeet 'please' niet!","'Some' gebruik je voor dingen die je niet telt: some water, some bread. 'An' voor woorden die met een klinker beginnen: an apple, an egg."],
 lvl:[pics("Charlie wil een 'apple'. Wat is dat?",0,"Een rood of groen fruit.",["🍎","een appel"],["🍞","brood"]),
      {kind:"text",q:"Hoe zeg je 'brood' in het Engels?",a:["bread"],hint:"B-r-e-a-d."},
      {kind:"text",q:"Vraag beleefd om water, in het Engels. Begin met 'I'd like' en eindig met 'please'. (vijf woorden)",a:["i'd like some water please","id like some water please","i'd like some water, please","i would like some water please"],hint:"I'd like some water, please."}]},
{id:"weather",ico:"🌦️",dom:"weather",title:"The weather",en:"What's the weather like today? Biscuit hates rain.",
 intro:"Biscuit haat regen. Hoe is het weer nu? Kijk omhoog en zeg het in het Engels: sunny, cloudy, rainy, windy, cold, warm.",
 act:{out:"Kijk naar de lucht en voel de wind. Zeg samen in het Engels hoe het weer is: It's sunny. It's cloudy. It's windy. It's cold.",in:"Kijk uit het raam. Zeg samen in het Engels hoe het weer is: It's sunny. It's cloudy. It's raining."},
 tip:["Sun is zon, sunny is zonnig. Rain is regen, rainy is regenachtig.","It's raining: het regent. It's snowing: het sneeuwt. It's windy: het waait.","'What's the weather like?' is de vraag. Antwoord: 'It's cold and cloudy, but it isn't raining.' Degrees: graden. 'It's ten degrees.'"],
 lvl:[pics("Hoe is het weer als de zon schijnt?",0,"Sun… sunny.",["☀️","sunny"],["🌧️","rainy"]),
      {kind:"text",q:"Hoe zeg je 'het waait' in het Engels? (twee woorden: It's …)",a:["it's windy","its windy","windy"],hint:"Wind… windy."},
      {kind:"text",q:"Vertaal: 'Het regent niet.' (drie woorden, begin met It)",a:["it isn't raining","it is not raining","it's not raining","its not raining"],hint:"It isn't raining."}]},
{id:"body",ico:"🖐️",dom:"body",title:"Simon says",en:"Let's play Simon says! Simon says: touch your nose!",
 intro:"Even bewegen. Charlie speelt Simon says: alleen doen wat 'Simon says' zegt! Touch your nose, jump, clap your hands, turn around.",
 act:{out:"Eén teamlid is Simon. Simon zegt in het Engels: 'Simon says touch your head / jump / clap your hands / turn around / touch your knees.' Zonder 'Simon says' moet je stil blijven staan!",in:"Eén teamlid is Simon. Simon zegt in het Engels: 'Simon says touch your head / jump / clap your hands / turn around / sit down.' Zonder 'Simon says' moet je stil blijven staan!"},
 tip:["Head is hoofd, nose is neus, hand is hand, knee is knie.","Shoulders, knees and toes: schouders, knieën en tenen. Het liedje 'Head, shoulders, knees and toes' helpt om ze te onthouden.","Een bevel heet een 'imperative': Jump! Sit down! Don't run! 'Don't' maakt het verbod."],
 lvl:[pics("Simon says: touch your NOSE. Wat raak je aan?",1,"Nose… neus.",["👂","je oor"],["👃","je neus"]),
      {kind:"text",q:"Hoe zeg je 'knie' in het Engels?",a:["knee"],hint:"De k hoor je niet, maar schrijf je wel: k-n-e-e."},
      {kind:"text",q:"Vertaal het verbod: 'Niet rennen!' (twee woorden)",a:["don't run","dont run","do not run"],hint:"Don't + run."}]},
{id:"clothes",ico:"👕",dom:"clothes",title:"What is he wearing?",en:"The man who saw Biscuit was wearing a red jacket and blue jeans.",
 intro:"Iemand heeft Biscuit gezien: een man met een rode jas en een blauwe spijkerbroek. Kijk om je heen: wat dragen mensen hier? Zeg het in het Engels.",
 act:{out:"Kijk naar elkaar (of naar mensen op straat). Elk teamlid beschrijft in het Engels wat iemand draagt: She's wearing a green coat. He's wearing black shoes.",in:"Kijk naar elkaar. Elk teamlid beschrijft in het Engels wat iemand draagt: She's wearing a green jumper. He's wearing white trainers."},
 tip:["Jacket is jas, shoes zijn schoenen, hat is hoed of muts.","Trousers (broek), jumper (trui), trainers (sportschoenen) zijn Brits. Amerikanen zeggen pants, sweater, sneakers.","'He's wearing' = hij draagt (nu). 'He wears' = hij draagt (altijd). Dat verschil heet present continuous en present simple."],
 lvl:[pics("De man draagt een 'red jacket'. Wat is dat?",0,"Jacket… jas.",["🧥","een rode jas"],["👟","rode schoenen"]),
      {kind:"text",q:"Hoe zeg je 'schoenen' in het Engels?",a:["shoes"],hint:"Sh-o-e-s."},
      {kind:"text",q:"Vertaal: 'Zij draagt een gele trui.' (Brits Engels, begin met She's)",a:["she's wearing a yellow jumper","shes wearing a yellow jumper","she is wearing a yellow jumper","she's wearing a yellow sweater"],hint:"She's wearing a yellow jumper."}]},
{id:"questions",ico:"❓",dom:"question words",title:"Who, what, where?",en:"Who saw Biscuit? Where did he go? When? I have so many questions!",
 intro:"Charlie heeft vragen: wie, wat, waar, wanneer, waarom? In het Engels: who, what, where, when, why, how. Vraagwoorden die een speurder nodig heeft.",
 act:{out:"Stel elkaar om de beurt een vraag in het Engels over de buurt: Where is the school? What colour is that door? How many trees can you see?",in:"Stel elkaar om de beurt een vraag in het Engels over deze ruimte: Where is the door? What colour is the wall? How many chairs are there?"},
 tip:["Who is wie. What is wat. Where is waar.","When is wanneer, why is waarom, how is hoe. 'How many' is hoeveel.","Een vraag in het Engels begint vaak met het vraagwoord en dan 'do/does' of 'is/are': Where does Biscuit live? Is he brown?"],
 lvl:[pics("'Where is Biscuit?' Wat vraagt Charlie?",1,"Where… waar.",["👤","wie is Biscuit"],["📍","waar is Biscuit"]),
      {kind:"text",q:"Welk Engels vraagwoord betekent 'wanneer'?",a:["when"],hint:"W-h-e-n."},
      {kind:"text",q:"Vertaal: 'Hoeveel honden zie je?' (begin met How many, eindig met see)",a:["how many dogs can you see","how many dogs do you see"],hint:"How many dogs can you see?"}]},
{id:"family",ico:"👨‍👩‍👧",dom:"family",title:"Charlie's family",en:"My mum, my dad and my little sister are looking for Biscuit too.",
 intro:"Charlie's moeder, vader en zusje zoeken ook. Hoe heet je familie in het Engels? Mum, dad, brother, sister, grandma, grandad.",
 act:{out:"Elk teamlid vertelt in het Engels wie er thuis woont: I have one brother and a dog. My mum is a teacher. Wie heeft de grootste familie?",in:"Elk teamlid vertelt in het Engels wie er thuis woont: I have one brother and a dog. My mum is a teacher. Wie heeft de grootste familie?"},
 tip:["Mum is mama, dad is papa, sister is zus, brother is broer.","Grandma en grandad (of granny en grandpa) zijn oma en opa. Aunt en uncle zijn tante en oom. Cousin is neef of nicht.","'I have got two sisters' of 'I have two sisters': allebei goed. 'My sister's name is Emma': de 's geeft bezit aan."],
 lvl:[pics("Charlie's 'sister' zoekt mee. Wie is dat?",0,"Sis-ter… zus.",["👧","zijn zus"],["👴","zijn opa"]),
      {kind:"text",q:"Hoe zeg je 'oma' in het Engels?",a:["grandma","granny","grandmother","gran","nan","nana"],hint:"Grand-ma."},
      {kind:"text",q:"Vertaal: 'Ik heb twee broers.' (vier woorden, begin met I have)",a:["i have two brothers","i've got two brothers","i have got two brothers"],hint:"I have two brothers."}]},
{id:"school",ico:"🏫",dom:"school",title:"At school",en:"Next week I'm starting at your school. What's in your classroom?",
 intro:"Volgende week komt Charlie bij jullie op school. Wat is er allemaal in een klas? Leer hem de woorden: desk, chair, book, pen, teacher, whiteboard.",
 act:{out:"Kijk naar de school (of stel je je klas voor) en noem in het Engels tien dingen uit een klaslokaal. Wie weet er het meest?",in:"Kijk rond in deze ruimte en noem in het Engels tien dingen: desk, chair, book, pen, door, window, wall, floor, bag, board."},
 tip:["Book is boek, pen is pen, chair is stoel, teacher is juf of meester.","Desk (tafel), whiteboard (bord), rubber (gum, Brits), ruler (liniaal), pencil (potlood).","'Can I borrow your pen?' Mag ik je pen lenen? 'Can' gebruik je om iets te vragen of om te zeggen wat je kunt: I can swim."],
 lvl:[pics("Charlie's 'teacher' is juf Noor. Wat is een teacher?",1,"Teach… leren.",["📚","een boek"],["👩‍🏫","een juf of meester"]),
      {kind:"text",q:"Hoe zeg je 'potlood' in het Engels?",a:["pencil","a pencil"],hint:"Pen-cil."},
      {kind:"text",q:"Vraag in het Engels of je een liniaal mag lenen. (begin met Can I borrow, eindig met ruler)",a:["can i borrow your ruler","can i borrow a ruler","can i borrow the ruler"],hint:"Can I borrow your ruler?"}]},
{id:"greetings",ico:"👋",dom:"greetings",title:"Hello and goodbye",en:"Hello! My name is Charlie. What's your name? Nice to meet you!",
 intro:"Charlie stelt zich voor. Nu jullie: hoe heet je, hoe gaat het, tot ziens. De eerste zinnen die je in elke taal leert.",
 act:{out:"Ga in een kring staan. Om de beurt in het Engels: 'Hello, my name is … Nice to meet you!' De volgende antwoordt: 'Nice to meet you too!'",in:"Ga in een kring staan. Om de beurt in het Engels: 'Hello, my name is … Nice to meet you!' De volgende antwoordt: 'Nice to meet you too!'"},
 tip:["Hello is hallo, goodbye is tot ziens, thank you is dank je wel.","'How are you?' – 'I'm fine, thanks. And you?' Dat is het standaardgesprekje.","Good morning (tot 12 uur), good afternoon, good evening, good night (alleen bij het slapengaan). 'See you later!' is tot straks."],
 lvl:[pics("Charlie zegt 'Hello!' Wat zeg jij terug?",0,"Hello… hallo.",["👋","Hello!"],["😴","Good night!"]),
      {kind:"text",q:"Hoe zeg je 'dank je wel' in het Engels? (twee woorden)",a:["thank you","thanks","thankyou"],hint:"Thank you."},
      {kind:"text",q:"Charlie vraagt: 'How are you?' Antwoord in het Engels: 'Goed, dank je. En jij?' (begin met I'm fine)",a:["i'm fine thanks and you","im fine thanks and you","i'm fine, thanks. and you?","i'm fine thank you and you","im fine thank you and you","i am fine thanks and you"],hint:"I'm fine, thanks. And you?"}]}
];
var ORDER_KORT=["colours","numbers","animals","where","greetings","time"];
return{lang:"nl",T:T,TYPES:TYPES,TIK:TIK,NOOR:NOOR,CHARLIE:CHARLIE,ROOMS:ROOMS,OPEN:OPEN,OPEN0:OPEN0,CLIFF:CLIFF,CLIFFLAST:CLIFFLAST,REVEAL:REVEAL,REVEAL0:REVEAL0,S:S,KORT:ORDER_KORT,ZIN:ZIN,FREE:false,
  LEADNOTE:"Tip: doe de korte introductieles vooraf (zie onder). Spreek het speelgebied af (buiten: alles binnen ongeveer 300 meter) en een eindtijd. Teams die vastzitten mogen de hint gebruiken (één per station). Charlie's zinnen worden met een Engelse stem voorgelezen (knop Voorlezen); de uitleg van juf Noor is Nederlands. Engelse antwoorden: hoofdletters en leestekens maken niet uit.",
  LES:[
   {intro:["Begroet de klas in het Engels: 'Good morning! My name is …' en laat ze antwoorden. Vraag: welke Engelse woorden kennen jullie al? (uit games, tv, liedjes)","Oefen samen de kleuren en tellen tot tien in het Engels, met dingen in de klas: 'a red pen, two blue chairs'.","Teams van 4–6 met een volwassene, één telefoon per team, zaakcode invullen. Zet voorlezen aan: Charlie spreekt Engels, de uitleg is Nederlands."],
    na:["Welk Engels woord vonden jullie het leukst? Zet alle woorden van vandaag op het bord, met een plaatje erbij.","Zing samen 'Head, shoulders, knees and toes' of speel nog één keer Simon says in het Engels.","Charlie's zin: lees hem samen hardop. Wat betekent hij in het Nederlands?","Thuisopdracht: zoek thuis drie dingen en zeg de kleur in het Engels."],
    doelen:"Vroeg-Engels groep 1–4 (kerndoel 13/14): luisteren naar en herkennen van eenvoudige Engelse woorden en zinnen over bekende onderwerpen (kleuren, getallen, dieren, lichaam, begroetingen), plezier in de taal, nazeggen."},
   {intro:["Begroet de klas in het Engels en laat ze antwoorden: 'Good morning! How are you?' – 'I'm fine, thanks.' Vraag: wanneer heb je buiten school Engels nodig?","Herhaal kort: kleuren, getallen tot 20, dieren, voorzetsels (in, on, under, behind), de klok (o'clock, half past, quarter past/to).","Teams van 4–6, één telefoon per team, zaakcode invullen. Afspraak: hardop Engels praten mag en moet; fouten zijn goed."],
    na:["Zet alle Engelse woorden van vandaag op het bord, per onderwerp (colours, animals, food…). Laat teams er zinnen mee maken.","De klok: oefen 'half past' nog eens, want dat gaat in het Engels anders dan in het Nederlands.","Charlie's zin: vertaal hem, en maak er een vraag van (Where is Biscuit?).","Verdieping: schrijf in tweetallen een kort gesprek tussen Charlie en jullie (begroeting, drie vragen, afscheid) en speel het na."],
    doelen:"Groep 5–6 Engels (kerndoel 13–16): eenvoudige gesprekjes voeren over vertrouwde onderwerpen, woordenschat (kleuren, getallen, dieren, eten, familie, school, tijd), korte zinnen lezen en schrijven, uitspraak en luistervaardigheid."},
   {intro:["Begin de les in het Engels: 'Good morning everyone. Today we're going to help Charlie find his dog.' Blijf zo lang mogelijk in het Engels. Vraag: 'What do you need to say when you are lost in London?'","Herhaal kort: directions (turn left, straight on, opposite), question words, present continuous (He's wearing), can/can't, don't.","Teams van 4–6, één telefoon per team, zaakcode invullen. Afspraak: bij elk station eerst de opdracht hardop in het Engels, dan pas typen."],
    na:["Zet de zinnen van vandaag op het bord en benoem de grammatica: vraagwoord + do/does, present continuous, imperative (Don't run!).","Rollenspel: één leerling is Charlie (alleen Engels), de rest wijst de weg naar het park met echte straatnamen uit de buurt.","Charlie's zin: ontleed hem (subject, verb, place) en zet hem in de verleden tijd (Biscuit was sleeping…).","Verdieping: schrijf een 'lost dog'-poster in het Engels voor Biscuit: naam, kleur, wat hij draagt, waar gezien, telefoonnummer. Hang ze op in de school."],
    doelen:"Groep 7–8 Engels (kerndoel 13–16, ERK A1): informatie vragen en geven (de weg, tijd, weer), beschrijven (kleding, uiterlijk), vragen stellen met vraagwoorden, eenvoudige teksten lezen en schrijven, Brits en Amerikaans Engels herkennen."}
  ]}
})();
