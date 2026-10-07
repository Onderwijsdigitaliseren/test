/* De Nacht van de Geesten – Nederlandse teksten en zaakdata (Halloween-nachtzaak).
   Plaatshouders: {N} aantal jaren geleden, {PY} jaartal op de foto, {HAIR}/{DRESS} uiterlijk van de geest, {OBJ}/{OBJD} het voorwerp, {INI} initialen,
   {NOT} hint die één reden uitsluit, {GEST} gebaar dat één lot uitsluit, {ASSERT}/{SUM} het verkeerde lot, {REFUTE} waarom dat niet kan, {POINT} wat wél gebeurde.
   WOMEN: a = haar (0 los, 1 opgestoken), b = kleding (0 rok/omslagdoek, 1 mantel). RARE: [naam, zeldzaamheid 1-3, figuur w/s/g/m, tekst]. */
window.NG_DATA={
 "lang": "nl",
 "T": {
  "rank": "Rang",
  "streak": "Dagen op rij",
  "solved": "Opgelost",
  "short": "Kort · 40 min",
  "full": "Volledig · 75 min",
  "resume": "Ga verder met je nacht",
  "today": "Start de nacht van vandaag",
  "todayAgain": "Loop de nacht van vandaag opnieuw",
  "extra": "Extra nacht op deze plek",
  "code": "Zaakcode invoeren",
  "demo": "Proefronde in fictief Londen",
  "archive": "Archief",
  "wipe": "Wissen",
  "safety": "Blijf op de openbare weg en let op het verkeer. Je hoeft nergens naar binnen.",
  "allWalks": "◂ Alle wandelingen",
  "lang": "English",
  "back": "Terug",
  "menu": "Menu",
  "zin": "Inzoomen",
  "zout": "Uitzoomen",
  "me": "Centreer op mij",
  "snd": "Geluid aan of uit",
  "walk": "Loop hierheen",
  "gps": "Gps hapert, ik sta er",
  "later": "Later terugkomen",
  "stars": [
   "Opgelost.",
   "Eerste conclusie goed.",
   "Binnen de tijd."
  ],
  "missed1": "Ster gemist: in één keer goed.",
  "missed2": "Ster gemist: binnen {m} minuten.",
  "up": "Bevorderd tot {r}.",
  "pts": "+{x} punten",
  "streakTxt": "{n} dag op rij",
  "streakTxtP": "{n} dagen op rij",
  "share": "Deel deze zaak",
  "copied": "Gekopieerd",
  "toHome": "Naar het startscherm",
  "dH": "Speel dezelfde zaak",
  "dGo": "Start deze zaak",
  "dBad": "Die zaakcode bestaat niet. Controleer hem en probeer het opnieuw.",
  "aH": "Archief",
  "aNone": "Nog geen gesloten dossiers.",
  "aTip": "Tik op een dossier om de zaakcode te delen.",
  "mMap": "Terug naar de kaart",
  "mHome": "Naar het startscherm",
  "mWipe": "Deze zaak wissen",
  "saved": "Je zaak is bewaard. Kies Ga verder om door te gaan.",
  "wipeQ": "Deze zaak wissen?",
  "wipeT": "Je sporen en tijd van deze zaak gaan verloren.",
  "wipeY": "Ja, wissen",
  "wipeAll": "Alles wissen, ook rang en archief",
  "allQ": "Alles wissen?",
  "allT": "Rang, punten, dagstreak en archief gaan verloren op dit toestel. Pro blijft.",
  "allY": "Ja, alles wissen",
  "wiped": "Gewist.",
  "cancel": "Annuleren",
  "noGps": "Dit toestel geeft geen locatie door. Je kunt wel de proefronde spelen.",
  "denied": "Geen toegang tot je locatie. Open dit spel in de browser van je telefoon via een https-adres en sta locatie toe. Hier kun je de proefronde spelen.",
  "fail": "Dat lukt hier niet",
  "loc": [
   "De foto",
   "De getuige",
   "Het voorwerp",
   "De verschijning",
   "Het oude bericht",
   "De verkeerde conclusie",
   "De waarschuwing",
   "De laatste plek",
   "De negende"
  ],
  "pois": "Plekken in je buurt zoeken…",
  "nomap": "De kaartdienst reageert niet. Je sporen liggen op loopafstand om je heen.",
  "demoTip": "Proefronde: tik op de kaart om te lopen.",
  "wait": "Dit duurt meestal 5 tot 30 seconden. Blijf even op deze pagina.",
  "pro": "Word Pro",
  "proUsed": "Je gratis zaak is gespeeld. Met Pro speel je elke dag een nieuwe, in alle wandelingen.",
  "proOn": "Pro is actief op dit toestel.",
  "corner": "Hoek",
  "demoCase": "oefenronde",
  "title": "De Nacht van de Geesten",
  "intro": [
   "Vanavond blijven de doden niet waar ze horen.",
   "Op acht plekken in jouw buurt zijn verschijningen gemeld.",
   "Eén van hen probeert je iets duidelijk te maken.",
   "Zoek uit wie zij is voordat je de laatste locatie bereikt."
  ],
  "brief": "Nachtzaak",
  "women": "Drie vrouwen uit het archief. Eén van hen loopt vannacht rond.",
  "go": "De nacht in",
  "locN": "Locatie {n}",
  "radarNext": "Locatie {n}: {d} m",
  "radarHot": "Je bent er bijna. Nog {d} m",
  "radarItem": "Er ontbreekt nog iets. Ga terug naar locatie 7.",
  "look": "Onderzoek",
  "here": "Hier is iets gemeld.",
  "locked": "Nog niet. Eerst locatie {n}.",
  "lockedLast": "Ga niet rechtstreeks hierheen. Er ontbreekt nog iets.",
  "note": "Notitieboek",
  "nbFound": "Verschijningen",
  "nbWomen": "Drie vrouwen",
  "nbWhy": "Wat en waarom",
  "nbGhosts": "Geesten",
  "nbNone": "Nog niets gevonden. Loop naar locatie 1.",
  "nbTip": "Tik om door te strepen.",
  "carry": "Je draagt bij je",
  "nothing": "nog niets",
  "inv": "Wat je hebt gevonden",
  "hairTag": [
   "los haar",
   "opgestoken haar"
  ],
  "dressTag": [
   "lange rok en omslagdoek",
   "mantel met bontkraag"
  ],
  "vanished": "verdwenen in {y}, {a} jaar oud",
  "holdDev": "Houd ingedrukt om de foto te bekijken",
  "readOn": "Lees verder",
  "pick": "Welk bewijs neem je mee naar de laatste plek?",
  "pickHint": "Het teken dat je hebt gelegd staat op één van de drie.",
  "pickWrong": "Dat teken klopt niet. De lucht wordt kouder.",
  "pickRight": "Je neemt {i} mee. De mist wijkt een eindje, alsof iemand opzij stapt.",
  "q1": "Wie is de geest?",
  "q2": "Wat is er met haar gebeurd?",
  "q3": "Waarom verschijnt ze juist vannacht?",
  "qGo": "Zeg het hardop",
  "qNeed": "Kies bij alle drie de vragen.",
  "qWrong": "Ze schudt haar hoofd. De mist wordt dichter. Kijk nog eens naar wat je hebt verzameld.",
  "last": "De laatste plek. Ze is hier. Ze wacht tot iemand het hardop zegt.",
  "won": "Zaak gesloten",
  "closing": "Ze verdwijnt langzaam. Na al die jaren weet eindelijk iemand wat er is gebeurd.",
  "caught": "geesten gevangen",
  "shareTxt": "De Nacht van de Geesten, zaak {c}: {s}, {m} min. Durf jij de acht verschijningen in jouw buurt te onderzoeken?",
  "dT": "Elke nacht heeft een code. Voer de code van een ander in en je krijgt dezelfde geest en dezelfde waarheid, op plekken in je eigen buurt.",
  "proFree": "Je eerste nacht is gratis.",
  "echoBtn": "Geestenboek",
  "hud": [
   "Tijd",
   "Locaties",
   "Geesten",
   "Km"
  ],
  "ev": {
   "gone": "LOCATIE 6 IS VERDWENEN",
   "found": "NIEUWE LOCATIE GEVONDEN",
   "not8": "ER ZIJN GEEN ACHT VERSCHIJNINGEN GEREGISTREERD",
   "nine": "ER ZIJN ER NEGEN",
   "miss": "ER ONTBREEKT NOG IETS"
  },
  "rare": {
   "seen": "Er verschijnt iets. Tik het aan!",
   "late": "Te laat. Weg.",
   "got": "Gevangen: {n}",
   "book": "Geestenboek",
   "bookT": "Zeldzame geesten duiken onverwacht op en blijven maar even. Tik ze op tijd aan.",
   "tier": [
    "",
    "Gewoon",
    "Zeldzaam",
    "Legendarisch"
   ],
   "new": "nieuw"
  }
 },
 "TYPES": {
  "kerk": [
   "de kerk",
   "de koster"
  ],
  "bank": [
   "de bank",
   "de nachtwaker van de bank"
  ],
  "cafe": [
   "het café",
   "de barman"
  ],
  "hotel": [
   "het hotel",
   "de nachtportier"
  ],
  "apotheek": [
   "de apotheek",
   "de apothekersassistente"
  ],
  "halte": [
   "de bushalte",
   "de nachtbuschauffeur"
  ],
  "post": [
   "de brievenbus",
   "de postbode"
  ],
  "park": [
   "het park",
   "de hondenuitlater"
  ],
  "school": [
   "de school",
   "de conciërge"
  ],
  "winkel": [
   "de winkel",
   "de vakkenvuller"
  ],
  "bieb": [
   "de bibliotheek",
   "de bibliothecaresse"
  ],
  "kunst": [
   "het kunstwerk",
   "de straatmuzikant"
  ],
  "bankje": [
   "het bankje",
   "de slapeloze buurvrouw"
  ],
  "tank": [
   "het tankstation",
   "de pompbediende"
  ],
  "hoek": [
   "de straathoek",
   "de krantenbezorger"
  ]
 },
 "DEMO": [
  [
   "kunst",
   "Klokkentoren"
  ],
  [
   "cafe",
   "Pub The Crown & Anchor"
  ],
  [
   "post",
   "Brievenbus Fleet Lane"
  ],
  [
   "hotel",
   "Hotel Blackfriars"
  ],
  [
   "bank",
   "Lombard Spaarbank"
  ],
  [
   "apotheek",
   "Apotheek Nightingale"
  ],
  [
   "park",
   "Nightingale Gardens"
  ],
  [
   "halte",
   "Station Lantern Street"
  ],
  [
   "bieb",
   "Leeszaal Marylebone"
  ],
  [
   "kerk",
   "St. Jude's Church"
  ],
  [
   "winkel",
   "Bakkerij Fleet Lane"
  ],
  [
   "school",
   "St. Jude's School"
  ],
  [
   "bankje",
   "Bankje aan de Embankment"
  ]
 ],
 "PZ": {
  "look": "Kijk…",
  "yours": "Jouw beurt: {n} lampjes",
  "wrongSeq": "Fout. Kijk opnieuw.",
  "good": "Goed. Eén erbij.",
  "tryBtn": "Probeer",
  "freq": "Frequentie",
  "ar": {
   "yes": "Camera aanzetten",
   "no": "Zonder camera",
   "left": "◀ Draai naar links",
   "right": "Draai naar rechts ▶",
   "close": "Camera uit",
   "drag": "Veeg over het scherm om rond te kijken",
   "h": "Kijk om je heen",
   "hold": "Blijf kijken…",
   "found": "Ze heeft je gezien.",
   "calm": "Ze kijkt je aan.",
   "fade": "Ze gaat."
  },
  "dust": [
   "Onder het vuil van jaren",
   "Veeg het schoon."
  ],
  "seq": [
   "De kaarsen flakkeren",
   "Ze doven en ontvlammen in een volgorde. Kijk goed en tik die na. Elke ronde komt er één bij."
  ],
  "tiles": [
   "Het gescheurde teken",
   "Tik twee stukken aan om ze te wisselen tot het teken heel is."
  ],
  "lamp": [
   "Ze is hier ergens",
   "Schijn met je lantaarn door de mist. Houd het licht op haar tot de cirkel rond is. Drie keer."
  ]
 },
 "INTROLOC": [
  "Een oude foto ligt hier. Er staat iemand op die er niet hoort te staan.",
  "Iemand heeft hier iets opgeschreven wat hij 's nachts zag.",
  "Tussen de stenen ligt iets wat niet van deze tijd is.",
  "Hier is zij gezien. Met eigen ogen.",
  "Een stuk krant, ouder dan iedereen die hier woont.",
  "Hier ligt iets wat het hele verhaal omgooit.",
  "Er staat iets op de muur. Het krijt is nog nat.",
  "Ze wacht.",
  "Deze stond niet op de lijst."
 ],
 "WOMEN": [
  {
   "n": "Maria van Dalen",
   "ini": "M.v.D.",
   "role": "naaister",
   "y": 1907,
   "age": 24,
   "a": 0,
   "b": 0
  },
  {
   "n": "Johanna Rutten",
   "ini": "J.R.",
   "role": "dienstbode",
   "y": 1911,
   "age": 19,
   "a": 1,
   "b": 0
  },
  {
   "n": "Cornelia Brands",
   "ini": "C.B.",
   "role": "onderwijzeres",
   "y": 1923,
   "age": 31,
   "a": 0,
   "b": 0
  },
  {
   "n": "Elisabeth Verhoeven",
   "ini": "E.V.",
   "role": "winkeliersdochter",
   "y": 1919,
   "age": 22,
   "a": 1,
   "b": 1
  },
  {
   "n": "Anna de Rooij",
   "ini": "A.d.R.",
   "role": "bakker",
   "y": 1902,
   "age": 38,
   "a": 1,
   "b": 0
  },
  {
   "n": "Wilhelmina Sanders",
   "ini": "W.S.",
   "role": "telefoniste",
   "y": 1928,
   "age": 27,
   "a": 1,
   "b": 1
  }
 ],
 "OBJ": [
  [
   "de hanger",
   "een zilveren hanger, zwart uitgeslagen"
  ],
  [
   "de ring",
   "een dunne gouden ring, te klein voor een hand van nu"
  ],
  [
   "de sleutel",
   "een ijzeren sleutel met een baard die op geen slot meer past"
  ]
 ],
 "ITEMS": [
  "de foto",
  "{OBJ}",
  "het krantenknipsel"
 ],
 "SIG": [
  "☽",
  "☉",
  "✠"
 ],
 "L1": "Een oude foto, genomen op deze plek. Op de achterkant staat in potlood: {PY}. Vooraan poseert een gezin. Op de achtergrond staat een vrouw die niemand toen heeft opgemerkt. {HAIR} Ze kijkt niet naar de fotograaf. Ze kijkt naar jou.",
 "HAIR": [
  "Haar haar hangt los, tot op haar rug.",
  "Haar haar is opgestoken onder een hoed."
 ],
 "L2": "Een verklaring, vorige week met de hand geschreven: ‘Ze liep midden in de nacht langs mijn raam. {DRESS} Kleren van tientallen jaren terug, en toch niet versleten. Ze liep alsof ze de weg kende, maar de straat niet meer herkende.’ In de kantlijn, later toegevoegd: ‘{NOT}’",
 "DRESS": [
  "Een lange donkere rok en een omslagdoek.",
  "Een mantel met een bontkraag."
 ],
 "NOTW": [
  "Ik heb het nagevraagd: vóór deze week heeft niemand haar ooit gezien. Er is geen vaste nacht, geen datum die terugkomt.",
  "En nee, er wordt hier niets gesloopt of gebouwd. De straat ligt er al jaren hetzelfde bij.",
  "Niemand hier kent haar naam, en niemand heeft ernaar gevraagd. Het archief is al jaren dicht."
 ],
 "L3a": "Tussen de stenen ligt {OBJD}. Er staat iets in gegraveerd, maar het zit onder het vuil van jaren.",
 "L3": "Gegraveerd in {OBJ}: {INI}. Bij wie hoorde dit? Drie vrouwen staan in het archief. Bij één van hen kloppen de letters.",
 "L4a": "Hier is zij gezien. Als je het toelaat, kijk je met je camera of ze er nu staat. Het beeld blijft op je telefoon en wordt niet opgeslagen of verstuurd.",
 "L4": "Ze stond er. Een ogenblik, niet langer. {GEST}",
 "GEST": [
  "Haar jurk was droog, haar haar ook. Wat haar is overkomen, had niets met water te maken.",
  "Ze keek niet naar de weg de stad uit. Ze keek naar de grond onder je voeten. Ze is hier nooit weggestuurd.",
  "Ze stond in de open lucht en hief haar gezicht naar de regen. Geen muur heeft haar ooit vastgehouden."
 ],
 "L5": "Een krantenknipsel, bruin van ouderdom: ‘Sedert dinsdag wordt vermist eene vrouw uit deze buurt. {ASSERT}’ De naam en het jaartal zijn door vocht weggevreten. Maar de beschrijving ken je. Het is de vrouw van de foto, en ze is al heel lang weg.",
 "ASSERT": [
  "Men neemt aan dat zij in den mist van het pad is geraakt en verdronken.",
  "Naar verluidt is zij de stad uit gezet; de familie wenscht er niet over te spreken.",
  "Gevreesd wordt dat zij is achtergebleven in het gebouw dat dezer dagen is dichtgezet."
 ],
 "L6": "Alles wees één kant op: {SUM} Zo staat het in de krant, en zo is het altijd verteld. Maar hier ligt iets wat dat onmogelijk maakt. {REFUTE} {POINT}",
 "SUM": [
  "ze is verdronken.",
  "ze is weggestuurd.",
  "ze is ingesloten geraakt."
 ],
 "REFUTE": [
  "Het water is dat jaar tot op de bodem drooggelegd. Er lag niemand.",
  "Niemand heeft haar weggestuurd: haar koffer is nooit gepakt, en haar loon van die week zit nog in de envelop.",
  "Het gebouw is bij de sloop steen voor steen nagekeken. Er lag niemand."
 ],
 "POINT": [
  "Wel spoelde die winter een omslagdoek aan bij de sluis, verderop.",
  "Wel bestaat er een brief van de notabelen: ‘dat zij de stad verlate en haar naam niet meer genoemd worde’. Haar naam is uit het register gekrast.",
  "Wel bestaat er een rekening van een metselaar, gedateerd één dag na haar verdwijning: ‘dichtzetten keldergat’."
 ],
 "L7a": "Op de muur, in krijt dat nog nat is: GA NIET RECHTSTREEKS NAAR DE LAATSTE PLEK. ER ONTBREEKT NOG IETS. Daaronder, kleiner: ‘{NOT}’ En een teken, in stukken gescheurd.",
 "NOTM": [
  "Tel de jaren niet. Het is geen verjaardag die mij wakker houdt.",
  "Niemand breekt hier iets af. Ik heb de tijd. Alleen jij niet.",
  "Niemand heeft mijn naam genoemd. Al die jaren niet, deze week niet."
 ],
 "L9": "De negende. Niet zij. Een kind, hooguit acht, met een hoepel. Het wijst naar de laatste plek, schudt nee, en wijst dan op wat je bij je draagt. Dan is de straat leeg.",
 "FATE": [
  [
   "Verdronken",
   "Ze raakte in de mist van het pad en kwam in het water terecht."
  ],
  [
   "Weggestuurd",
   "Ze werd de stad uit gezet en haar naam werd uitgewist."
  ],
  [
   "Ingesloten",
   "Ze bleef achter in een gebouw dat werd dichtgezet."
  ]
 ],
 "REASON": [
  [
   "Het is vannacht precies {N} jaar geleden",
   "Op de dag af. Daarom nu, en niet gisteren."
  ],
  [
   "Morgen verdwijnt de plek waar ze is",
   "Vannacht is haar laatste kans om gehoord te worden."
  ],
  [
   "Haar naam is deze week weer genoemd",
   "Voor het eerst in al die jaren. Dat heeft haar wakker gemaakt."
  ]
 ],
 "FATEEND": [
  "Ze raakte in de mist van het pad en verdronk, en niemand heeft ooit op de goede plek gezocht.",
  "Ze werd weggestuurd en haar naam werd uitgewist. Ze stierf elders, zonder dat iemand wist wie ze was.",
  "Ze bleef achter toen het gebouw werd dichtgezet. Niemand heeft geluisterd."
 ],
 "REASONEND": [
  "Vannacht is het op de dag af {N} jaar geleden.",
  "Morgen gaat de plek waar ze is voorgoed verloren; dit was haar laatste nacht.",
  "Deze week is haar naam voor het eerst weer genoemd, en dat heeft haar wakker gemaakt."
 ],
 "RARE": [
  [
   "De Weduwe",
   1,
   "w",
   "Ze wacht op een schip dat in 1893 is vergaan. Ze weet het. Ze wacht toch."
  ],
  [
   "De Soldaat",
   1,
   "s",
   "Hij staat op wacht bij een brug die er niet meer is."
  ],
  [
   "Het Meisje bij het raam",
   1,
   "g",
   "Ze tikt van binnen tegen het glas. Het huis is al veertig jaar onbewoond."
  ],
  [
   "De Lantaarnopsteker",
   1,
   "m",
   "Hij steekt lantaarns aan die al een eeuw elektrisch zijn."
  ],
  [
   "De Koster",
   1,
   "m",
   "Hij luidt de klok voor een dienst waar niemand komt."
  ],
  [
   "De Man zonder gezicht",
   2,
   "m",
   "Hij draait zich om als je kijkt. Aan de voorkant is niets."
  ],
  [
   "De Non",
   2,
   "w",
   "Ze telt de kinderen. Er ontbreekt er altijd één."
  ],
  [
   "De Veerman",
   2,
   "s",
   "Hij vraagt een cent voor de overtocht. Er is hier geen water."
  ],
  [
   "Het Kind met de hoepel",
   2,
   "g",
   "Het rent de hoek om. Om de hoek is niemand."
  ],
  [
   "De Dame in het zwart",
   3,
   "w",
   "Ze loopt achter elke begrafenis aan. Ook achter die van haarzelf."
  ],
  [
   "De Trommelaar",
   3,
   "s",
   "Je hoort hem voor je hem ziet. Je ziet hem alleen als je stilstaat."
  ],
  [
   "De Schaduw zonder mens",
   3,
   "m",
   "Hij loopt een stap achter je. Hij is van niemand."
  ]
 ]
};
