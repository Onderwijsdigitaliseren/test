/* Operatie Pakjesavond – teksten en opdrachten (NL). MiniMystery, 6–10 jaar, pakjesavond 5 december.
   Piet Pepernoot heeft alle pakjes verstopt, maar zijn verstopkaart is in stukken gewaaid. Op elke plek (buiten in de buurt of
   binnen in huis) ligt een stukje; je verdient het met een Pietenproef. De laatste aanwijzing komt van de ouders (Ouderhoek):
   waar de echte pakjes liggen. Twee niveaus: 0 = Pepernoot (6–7, voorgelezen, kiezen), 1 = Hoofdpiet (8–10, pittiger, soms typen). */
window.PA_DATA=(function(){
var T={
  today:"Start Operatie Pakjesavond",extra:"Andere zaak",voice:"Voorlezen",voiceOn:"Piet leest alles voor",voiceOff:"Voorlezen staat uit",
  start:"Doe de Pietenproef",next:"Verder ▸",back:"Terug",close:"Sluiten",cancel:"Annuleren",ok:"Controleer ▸",listen:"Voorlezen",
  loc:"Waar zijn jullie? De telefoon vraagt om je locatie.",pois:"Piet zoekt plekken in de buurt waar de stukjes liggen…",nomap:"De kaartdienst is druk. We spelen op een getekende plattegrond.",
  noGps:"Deze telefoon heeft geen gps.",denied:"De locatie staat uit. Zet hem aan in de instellingen, of speel zonder kaart.",
  corner:"Hoek",task:"Stukje {i} van {n}",clue:"Stukje {n} van {t} gevonden",
  kinds:{tel:"Pepernoten tellen",vang:"Strooigoed vangen",memory:"Schoenen-memory",dak:"Het dak op",ritme:"De hoefslag van Ozosnel",sorteer:"De inpakpiet",verschil:"Het verkeerde pakje",code:"Pietengeheimschrift",rijm:"De Rijmpiet",boek:"Het Grote Boek",zoek:"Zoek en fotografeer",kijk:"Kijk en tel",gym:"Pietengym",schaduw:"Schaduwen op het dak"},
  near:"Volgend stukje op {d} m",warm:"Warm! Nog {d} m",hot:"Heet! Hier moet het liggen",radarAll:"Alle stukjes gevonden! Leg de kaart in elkaar.",
  here:"Hier ligt een stukje",look:"Pak het stukje",walk:"Loop erheen",gps:"We staan er echt (gps twijfelt)",
  notebook:"De verstopkaart",nbZ:"Gevonden stukjes",nbNone:"Nog geen stukje. Loop naar de eerste plek.",
  menu:"Menu",mBack:"Terug naar de zaak",mHome:"Pauze, later verder",mWipe:"Deze zaak wissen",mParent:"🎁 Ouderhoek",mSkip:"Begeleider: deze proef overslaan",saved:"Opgeslagen. Je kunt later verdergaan.",
  wipe:"Wissen",wipeY:"Deze zaak wissen",wipeAll:"Alles wissen (ook het archief)",wipeQ:"Zaak wissen?",wipeT:"De voortgang van deze zaak is dan weg. De verstopplekken van de ouders blijven staan.",allQ:"Alles wissen?",allT:"Zaak, archief en instellingen worden gewist. De Ouderhoek ook.",allY:"Ja, alles wissen",wiped:"Gewist",
  dH:"Zaakcode invullen",dT:"Met een zaakcode spelen meer telefoons dezelfde zaak: dezelfde plekken, dezelfde proeven. Handig met twee groepjes.",dGo:"Zaak ophalen",dBad:"Die code kennen we niet. Codes beginnen met PA.",
  demoCase:"Proefronde · getekende stad",demoTip:"Tik op een plek op de kaart: jullie lopen er vanzelf heen.",
  howH:"Hoe werkt het?",
  won:"Gelukt",dipBtn:"Speurpieten-diploma (A4)",dipH:"Speurpieten-diploma",dipNote:"Printen of opslaan. Print er voor elk kind een.",home:"Naar het begin",dl:"Opslaan",shareBtn:"Delen",copied:"Gekopieerd",
  shareTxt:"Wij hebben de verstopkaart van Piet gemaakt en de pakjes gevonden! Zaak {c} · {s} · {m} min. ",
  missed1:"Zonder hints: drie sterren.",
  pzT:"Overleg samen. Eén iemand tikt.",wrong:"Nog niet goed. Overleg nog eens.",wrongHint:"Nog niet goed. Pak de hint, of probeer het nog eens.",hintBtn:"💡 Hint van Piet",hintUsed:"Hint gebruikt",
  countGo:"Ingevuld ▸",photoGo:"📷 Maak de foto",photoAgain:"Nog een keer",photoOk:"Dit is hem! ▸",photoKeep:"De foto blijft op deze telefoon.",photoSkip:"Geen camera? Laat het aan de begeleider zien en ga verder",
  pieceGet:"Een stukje van de verstopkaart!",pepGet:"+{n} pepernoten",
  again:"▶ Nog een keer",go:"▶ Start",done:"Klaar!",ready:"Klaar? Dan gaan we.",timer:"tijd",score:"gevangen",
  finH:"Leg de kaart in elkaar",finNot:"Eerst alle stukjes vinden. Nog {n} te gaan.",
  finT:"Alle stukjes liggen op tafel. Tik op elk stukje om het om te draaien.",finGo:"De kaart is compleet ▸",
  letH:"Piet leest de kaart",
  trH:"De laatste aanwijzing",trFound:"Gevonden! 🎉",trMore:"Er ligt nog meer…",trHelp:"We vinden het niet",trExact:"Piet fluistert: {w}",trNone:"Op de kaart staat een vlek… Piet kan hem niet lezen. Een grote mens in dit huis weet het nog wel: vraag de hoofdpiet van dit huis om de laatste aanwijzing!",trNoneBtn:"De hoofdpiet heeft het verteld ▸",
  prH:"Ouderhoek",prLead:"Voor de ouders. Vul dit in zonder dat de kinderen meekijken. Pas als de kinderen alle stukjes van de kaart hebben, laat Piet dit zien.",
  prPinNew:"Kies een pietencode van 4 cijfers, zodat de kinderen hier niet bij kunnen.",prPinAsk:"Pietencode",prPinBad:"Die code klopt niet.",prPinSet:"Code opslaan ▸",prPinGo:"Open ▸",prPinForgot:"Code vergeten? Wis alles (knop Wissen op het startscherm), dan kun je opnieuw beginnen.",
  prSpots:"De verstopplekken",prSpotsT:"Eén plek voor alle pakjes, of per kind een eigen plek. Piet laat ze één voor één zien.",
  prWhat:"Wat ligt er?",prWhatP:"bijv. de pakjes voor Noor en Sam",prHint:"Aanwijzing (mag een raadsel zijn)",prHintP:"bijv. Waar het altijd warm is en de sokken drogen…",prWhere:"Precieze plek (alleen als ze het niet vinden)",prWhereP:"bijv. in de wasmand op zolder",prPhoto:"📷 Foto van de plek (mag)",prPhotoOk:"Foto staat erin ✓",prDel:"Weg",prAdd:"+ Nog een verstopplek",
  prSave:"Opslaan",prSaved:"Opgeslagen. Piet weet het nu ook.",prEmpty:"Nog geen verstopplek ingevuld. Dat kan altijd nog, ook tijdens het spel.",prOk:"{n} verstopplek(ken) klaar ✓",
  prAns:"Antwoorden van deze zaak",prAnsT:"Alleen voor de begeleider: de proeven van deze zaak en wat er uit moet komen.",prChange:"Pietencode veranderen",
  prBtn:"🎁 Ouderhoek: waar liggen de pakjes?",prBtnOk:"🎁 Ouderhoek · {n} verstopplek(ken) klaar",
  lvl:["Pepernoot","Hoofdpiet"],lvlAge:["6–7 jaar","8–10 jaar"],
  nw:{6:"zes",8:"acht",10:"tien"},
  kv:{fp:["Bakker","Bushalte","Speeltuin","Plein","Brug","Park","Kerk","Fontein","Winkel","Brievenbus","Kiosk","Bankje"],
    all:"Alle stukjes gevonden! Leg de kaart in elkaar.",near:"Stukje op {d} m",cold:"Koud… loop een andere kant op",cool:"Lauw. Dichterbij komt-ie",warm:"Warm! Goed zo!",hot:"HEET! Kijk om je heen!",here:"Hier ligt het stukje!",first:"Loop maar, het kompas wijst de weg",noDir:"Loop een stukje, dan weet het kompas de richting",
    map:"Plattegrond",kids:"Verhaalkaart",mapTip:"De echte plattegrond. Tik op Verhaalkaart voor de kindertekening.",goDemo:"We lopen (nep) naar {p}…",inSteps:"Nog {n} stappen",
    mNoMap:"Verder zonder kaart (zelfde zaak)",switched:"Verder zonder kaart. Dezelfde zaak, dezelfde proeven.",virtOut:"Geen plattegrond van de buurt gevonden. Jullie lopen op de verhaalkaart: de pijl en warm/koud wijzen de weg.",
    noMapQ:"Geen locatie vandaag?",noMapT:"De telefoon geeft geen locatie door. Jullie kunnen dezelfde zaak zonder kaart spelen: de stukjes komen dan achter elkaar en jullie lopen zelf naar een nieuwe plek.",noMapGo:"Verder zonder kaart"}
};
var TYPES={kerk:"de kerk",hotel:"het hotel",bank:"de bank",apotheek:"de apotheek",cafe:"het café",bieb:"de bibliotheek",park:"het park",school:"de school",kunst:"het kunstwerk",tank:"het tankstation",winkel:"de winkel",halte:"de bushalte",post:"de brievenbus",bankje:"het bankje",hoek:"de hoek"};
var PIET="Piet Pepernoot",SINT="Sinterklaas";
/* binnen: de kamers waar de stukjes liggen (de kinderen lopen er zelf heen) */
var ROOMS=[["keuken","in de keuken","🍳"],["woonkamer","in de woonkamer","🛋️"],["gang","in de gang","🚪"],["trap","bij de trap","🪜"],["slaapkamer","in een slaapkamer","🛏️"],["badkamer","in de badkamer","🛁"],["voordeur","bij de voordeur","🏠"],["overloop","op de overloop of zolder","🌙"],["berging","in de schuur of berging","🧹"],["tuin","in de tuin of op het balkon (als dat kan)","🌲"]];
var OPEN={
  buiten:"Psst! Hier, bij de schoorsteen. Ik ben Piet Pepernoot, de Piet die onthoudt waar alle pakjes liggen. Vanmiddag heb ik de pakjes voor dit huis verstopt. Perfect verstopt. Zó goed, dat ik het zelf alleen nog weet door mijn verstopkaart. En toen… sprong Ozosnel over het dak, de wind pakte de kaart uit mijn zak en SCHEURDE hem in {N} stukken! Ze liggen nu overal in de buurt. Zonder kaart vindt niemand de pakjes. Zelfs Sinterklaas niet. Jullie zijn vanavond mijn Speurpieten. Op elke plek ligt een stukje, maar je krijgt het pas na een Pietenproef. Alle stukjes bij elkaar: dan lezen we samen waar de pakjes liggen.",
  binnen:"Psst! Hier, bij de kachel. Ik ben Piet Pepernoot, de Piet die onthoudt waar alle pakjes liggen. Vanmiddag heb ik de pakjes voor dit huis verstopt. Perfect verstopt. Zó goed, dat ik het zelf alleen nog weet door mijn verstopkaart. En toen… ging de voordeur open, de tocht pakte de kaart uit mijn zak en SCHEURDE hem in {N} stukken! Ze liggen nu overal in huis. Zonder kaart vindt niemand de pakjes. Zelfs Sinterklaas niet. Jullie zijn vanavond mijn Speurpieten. In elke kamer ligt een stukje, maar je krijgt het pas na een Pietenproef. Alle stukjes bij elkaar: dan lezen we samen waar de pakjes liggen."
};
var CLIFF=["Goed gedaan, Speurpieten! Op naar het volgende stukje.","Ozosnel hinnikt van blijdschap. Verder!","Sinterklaas kijkt stiekem mee en knikt. Door!","Weer een stukje. Ik begin de kaart al een beetje te herkennen…","Jullie zijn echte Pieten. Nog even volhouden!","Mijn zak voelt lichter, maar mijn hart voelt vrolijker. Verder!","Pepernoten voor iedereen! Nou ja, straks. Eerst zoeken."];
var CLIFFLAST="Dat was het laatste stukje! Leg de kaart in elkaar: dan weten we waar de pakjes liggen.";
var LETTER="Lieve Speurpieten, zonder jullie had ik vannacht met lege handen op het dak gestaan. De kaart is weer heel. Ik lees hem voor…";
var SINTTXT="Ho ho, wat hoor ik daar? Alle stukjes gevonden? Dan zijn jullie vanaf nu officieel Speurpieten. Dank jullie wel, en een fijne pakjesavond!";
/* zoekopdrachten (foto in het echt), per seed één */
var ZOEK=[["iets ROODS, zoals de mantel van Sinterklaas","Een jas, een auto, een bal, een deur…"],["iets GOUDS of GEELS, zoals de staf van Sint","Een lamp, een bord, een blad, een knop…"],["een SCHOEN of laars, om te zetten","Een schoen van iemand uit de groep telt ook!"],["iets RONDS, zo groot als een pepernoot","Een knoop, een muntje, een steentje, een dop…"],["iets met het CIJFER 5 erop, want het is 5 december","Een huisnummer, een bord, een klok, een kenteken…"],["iets in de vorm van een DRIEHOEK, zoals de mijter","Een dak, een bord, een vlag, een stuk taart…"],["iets wat op een PAARD lijkt, of een dier","Een plaatje telt ook. Of iemand die hinnikt."]];
/* kijk-en-tel: eerst echt tellen, dan een vraag met dat getal */
var KIJK={
  buiten:[["Tel samen hoeveel RAMEN je ziet aan het huis of gebouw dat het dichtstbij is."],["Tel de LANTAARNPALEN die je vanaf hier kunt zien."],["Tel hoeveel DEUREN je vanaf deze plek ziet."],["Tel de BOMEN die je vanaf hier kunt zien (struiken tellen niet)."]],
  binnen:[["Tel samen hoeveel STOELEN er in deze kamer staan (krukjes tellen mee)."],["Tel hoeveel DEUREN deze kamer heeft (kastdeuren tellen mee)."],["Tel de LAMPEN in deze kamer."],["Tel hoeveel RAMEN deze kamer heeft."]]};
/* quiz: Het Grote Boek */
var BOEK=[[
  ["Hoe heet het paard van Sinterklaas?",["Ozosnel","Blits","Snelletje"],0],
  ["Wat zet je in je schoen voor het paard?",["Een wortel","Een banaan","Een broodje"],0],
  ["Waarmee komt Sinterklaas naar Nederland?",["Met de stoomboot","Met het vliegtuig","Met de bus"],0],
  ["Wat heeft Sinterklaas op zijn hoofd?",["Een mijter","Een pet","Een helm"],0],
  ["Hoe komt Piet het huis binnen?",["Door de schoorsteen","Door het raam","Door de brievenbus"],0],
  ["Welke kleur heeft de mantel van Sinterklaas?",["Rood","Groen","Blauw"],0],
  ["Op welke dag is het pakjesavond?",["5 december","1 december","25 december"],0]
 ],[
  ["Wanneer is Sinterklaas jarig?",["6 december","5 december","1 december"],0],
  ["Wat heeft Sinterklaas in zijn hand?",["Een staf met een krul","Een paraplu","Een zwaard"],0],
  ["Waar komt de stoomboot vandaan?",["Uit Spanje","Uit Italië","Uit Zweden"],0],
  ["Wat strooit Piet door de kamer?",["Pepernoten en kruidnoten","Confetti","Rijst"],0],
  ["Hoe heet de Piet die op de pakjes let?",["De Pakjespiet","De Wegpiet","De Slaappiet"],0],
  ["Wat staat er in het Grote Boek van Sinterklaas?",["Wat alle kinderen dit jaar deden","Recepten voor pepernoten","De weg naar Spanje"],0],
  ["Waar gaat Sinterklaas op zijn verjaardag weer naartoe?",["Terug naar Spanje","Naar de maan","Naar zee, zwemmen"],0]
 ]];
/* rijmen (eigen rijmpjes). c = keuzes op niveau 0; op niveau 1 typ je het rijmwoord */
var RIJM=[[
  ["Sinterklaas zit op zijn paard, hij heeft een lange witte…","baard",["baard","jas","staf"]],
  ["Piet klimt hoog het dak op, met een hele zware…","zak",["zak","sok","bak"]],
  ["Zet je schoen maar bij de haard, met een wortel voor het…","paard",["paard","hert","hond"]],
  ["Piet strooit pepernoten in het rond, ze rollen zo over de…","grond",["grond","maan","deur"]],
  ["De stoomboot vaart over de zee, Sint neemt alle pakjes…","mee",["mee","weg","terug"]],
  ["Een mijter rood met goud, Sint draagt hem, ook al is het…","koud",["koud","laat","nat"]]
 ],[
  ["Ozosnel galoppeert over het dak, met op zijn rug een zware…","zak",["zak"]],
  ["De pepernoten zijn bijna op, Piet krabt zich eens op zijn…","kop",["kop","hoofd"]],
  ["Chocoladeletter, dik en bruin, ligt die soms verstopt in de…","tuin",["tuin"]],
  ["Speculaas, zo knapperig en fijn, daar wil ik vanavond graag bij…","zijn",["zijn"]],
  ["Het is al donker, kijk eens naar de maan, straks komt Sinterklaas er…","aan",["aan"]],
  ["De kaart is kwijt, wat een gedoe, van al dat zoeken word ik…","moe",["moe"]]
 ]];
/* geheimschrift: elke letter een tekentje */
var SYM={a:"🎁",b:"👢",c:"🥕",d:"🐴",e:"⭐",g:"🍬",h:"🏠",i:"🎩",j:"🔔",k:"🍪",l:"🔑",m:"🌙",n:"🕯️",o:"🎀",p:"🧦",r:"🚢",s:"❄️",t:"🧤",u:"☂️",w:"🪁",z:"🎈"};
var CODEW=[["zak",["zak","pet","jas"]],["dak",["dak","bal","hek"]],["sok",["sok","pop","kat"]],["boot",["boot","hoed","pet"]]];
var CODEW1=["schoen","wortel","mijter","paard","pakje","maan"];
/* schaduwen: [emoji, naam] */
var SHAD=[["🎁","het pakje"],["👢","de laars"],["🥕","de wortel"],["🐴","het paard"],["🚢","de stoomboot"],["🔑","de sleutel"],["🔔","de bel"],["🧦","de sok"],["🌙","de maan"],["🧤","de want"],["⛵","het zeilbootje"],["🍬","het snoepje"],["☂️","de paraplu"],["🎈","de ballon"]];
/* de proeven. story = wat Piet zegt. lvl[0] = Pepernoot, lvl[1] = Hoofdpiet */
var Z=[
 {id:"tel",title:"Pepernoten tellen",story:"Ik strooi een handje pepernoten. Tel ze allemaal, ook de snelle! Hoeveel waren het?",lvl:[{min:5,max:9,speed:1,choice:true,hint:"Tel hardop met z'n allen mee, één pepernoot per tik."},{min:9,max:16,speed:1.5,choice:false,hint:"Verdeel de groep: de ene helft telt links, de andere rechts. Tel daarna op."}]},
 {id:"vang",title:"Strooigoed vangen",story:"Houd de schoen onder de pepernoten en vang ze! Maar niet de kolen, bah.",lvl:[{secs:20,need:8,rate:.9,coal:.15,hint:"Sleep met je vinger onder de pepernoot. Laat de zwarte kolen vallen."},{secs:20,need:12,rate:1.3,coal:.3,hint:"Kijk naar wat er bovenaan verschijnt, niet naar de schoen."}]},
 {id:"memory",title:"Schoenen-memory",story:"In elke schoen zit iets. Vind de twee schoenen met hetzelfde erin.",lvl:[{pairs:4,hint:"Zeg hardop wat er in elke schoen zat en waar hij stond."},{pairs:6,hint:"Geef elk kind een rij om te onthouden."}]},
 {id:"dak",title:"Het dak op",story:"Ik ren over de daken. Tik precies als ik boven de rode schoorsteen ben, dan spring ik erin. Drie keer raak!",lvl:[{hits:3,speed:1,hint:"Tik een heel klein beetje vóór de schoorsteen, dan zit je goed."},{hits:4,speed:1.6,hint:"Kijk naar het ritme. Hij gaat heen en weer, even snel."}]},
 {id:"ritme",title:"De hoefslag van Ozosnel",story:"Ozosnel klopt met zijn hoeven op het dak. Luister en kijk goed, en klop het precies zo na.",lvl:[{rounds:[2,3,3],hint:"Zeg de kleuren hardop mee: dan onthoud je ze makkelijker."},{rounds:[3,4,5],hint:"Onthoud de eerste twee, dan de rest. Twee stukjes zijn makkelijker dan één lange."}]},
 {id:"sorteer",title:"De inpakpiet",story:"De pakjes moeten in de zak: het kleinste eerst, het grootste bovenop. Tik ze aan van klein naar groot.",lvl:[{n:4,by:"size",hint:"Zoek eerst het allerkleinste pakje."},{n:5,by:"num",hint:"Kijk naar het getal op het kaartje, niet naar de grootte."}]},
 {id:"verschil",title:"Het verkeerde pakje",story:"Eén van deze pakjes hoort hier niet. Het is net een beetje anders ingepakt. Welke?",lvl:[{subtle:false,hint:"Kijk naar de strik."},{subtle:true,hint:"Kijk naar de kleur van het lint én de strik."}]},
 {id:"code",title:"Pietengeheimschrift",story:"Pieten schrijven in tekentjes. Hier is de sleutel. Welk woord staat er?",lvl:[{text:false,hint:"Zoek elk tekentje op in de sleutel en zeg de letter hardop."},{text:true,hint:"Schrijf de letters op volgorde op een papiertje."}]},
 {id:"rijm",title:"De Rijmpiet",story:"De Rijmpiet is zijn laatste woord kwijt. Maak het rijmpje af!",lvl:[{text:false,hint:"Zeg de laatste regel hardop en luister naar de klank."},{text:true,hint:"Het rijmt op het laatste woord van de eerste regel."}]},
 {id:"boek",title:"Het Grote Boek",story:"In het Grote Boek staat alles. Weten jullie dit ook?",lvl:[{hint:"Overleg samen. Iemand weet het vast."},{hint:"Denk aan wat er elk jaar op tv is."}]},
 {id:"zoek",title:"Zoek en fotografeer",story:"Een echte speuropdracht. Zoek in het echt, hier om je heen: {z}. Maak er een foto van.",lvl:[{hint:"{h}"},{hint:"{h}"}]},
 {id:"kijk",title:"Kijk en tel",story:"Pieten letten op alles. Kijk goed om je heen.",lvl:[{hint:"Tel samen hardop. Eén kind wijst, de rest telt."},{hint:"Tel twee keer, dan weet je het zeker."}]},
 {id:"gym",title:"Pietengym",story:"Pieten moeten lenig zijn voor op het dak! Houd de telefoon vast en spring met z'n allen: tel de sprongen hardop mee.",lvl:[{secs:15,target:10,hint:"Spring met de telefoon in je hand, dan telt hij mee. Of tik op Klaar als jullie klaar zijn."},{secs:15,target:15,hint:"Spring met de telefoon in je hand, dan telt hij mee."}]},
 {id:"schaduw",title:"Schaduwen op het dak",story:"De maan schijnt op het dak en ik zie alleen schaduwen. Welke schaduw is het?",lvl:[{opts:3,rounds:2,hint:"Kijk naar de vorm aan de buitenkant."},{opts:4,rounds:3,hint:"Draai de telefoon desnoods even, dat helpt soms."}]}
];
var LEADNOTE="Tip: speel de opdrachten één keer zelf voor, dan weet je hoe ze gaan. De Ouderhoek blijft open: je kunt de verstopplekken ook tijdens het spel nog aanpassen.";
return{lang:"nl",FREE:false,T:T,TYPES:TYPES,PIET:PIET,SINT:SINT,ROOMS:ROOMS,OPEN:OPEN,CLIFF:CLIFF,CLIFFLAST:CLIFFLAST,LETTER:LETTER,SINTTXT:SINTTXT,ZOEK:ZOEK,KIJK:KIJK,BOEK:BOEK,RIJM:RIJM,SYM:SYM,CODEW:CODEW,CODEW1:CODEW1,SHAD:SHAD,Z:Z,LEADNOTE:LEADNOTE};
})();
