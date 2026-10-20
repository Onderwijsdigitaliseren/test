/* De Fotojacht – Nederlandse teksten en inhoud. Zelfde structuur als data-en.js. Vereist niets; game.js leest window.FJ_DATA. */
window.FJ_DATA={lang:"nl",
T:{
  today:"Start de zaak van vandaag",todayAgain:"Zaak van vandaag opnieuw",extra:"Extra zaak",pro:"Pro",proOn:"Pro is actief op dit toestel.",proFree:"Je eerste zaak is gratis. Daarna speel je met Pro elke dag een nieuwe.",proUsed:"Je gratis zaak is gespeeld. Met Pro speel je elke dag een nieuwe.",
  cancel:"Annuleren",close:"Sluiten",back:"Terug",saved:"Zaak bewaard. Je kunt later verdergaan.",wiped:"Gewist.",
  modeOut:"Buiten · de straat",modeIn:"Binnen · het huis",
  brief:"Dossier",briefNo:"Zaak {c}",go:"Pak de camera",
  hud:{t:"Tijd",n:"Foto's",w:"Getuigen"},
  task:"Opdracht {i} van 8",find:"Zoek en fotografeer:",hint:"Vage aanwijzing",hint2:"Zeg het gewoon",shoot:"Maak de foto",retake:"Opnieuw",
  checking:"Foto bekijken…",tooOld:"Deze foto is niet net gemaakt. Maak hem nu, met de camera.",tooDark:"Te donker om iets te zien. Probeer het nog een keer.",noFile:"Geen foto ontvangen.",
  found:"Op deze plek:",wit:"Getuige",says:"zegt:",next:"Volgende opdracht",accuse:"Wijs de dader aan",
  notebook:"Notitieboek",people:"Verdachten",strip:"Bewijsstrook",menu:"Menu",mBack:"Terug naar de jacht",mHome:"Zaak bewaren en stoppen",mWipe:"Zaak wissen",
  nbE:"Bewijs (altijd waar)",nbW:"Verklaringen (één liegt)",nbNone:"Nog niets. Maak de eerste foto.",
  acH:"Wie heeft het gedaan?",acT:"Bewijs liegt nooit. Van de vier getuigen liegt er één. Kies de dader én de leugenaar.",acWho:"De dader",acLiar:"De leugenaar",acGo:"Beschuldigen",acNeed:"Kies eerst een dader en een leugenaar.",
  wrong:"Dat klopt niet. Kijk nog eens naar het bewijs.",wrongTries:"Elke misser kost een ster.",
  won:"Zaak gesloten",shareBtn:"Deel je bewijsstrook",shareTxt:"Zaak {c} gesloten in {m} min, {s}. Jouw foto's liggen in je eigen straten: ",copied:"Tekst gekopieerd.",home:"Terug naar het begin",
  missed1:"Niet in één keer: geen tweede ster.",missed2:"Langer dan {m} minuten: geen derde ster.",up:"Nieuwe rang: {r}.",pts:"{x} punten",streakTxt:"Dag 1 op rij",streakTxtP:"{n} dagen op rij",
  dH:"Zaakcode",dT:"Speel dezelfde zaak als iemand anders. Vraag de code en vul hem hier in.",dGo:"Start",dBad:"Die code klopt niet.",
  aH:"Archief",aNone:"Nog geen gesloten zaken.",aTip:"Tik op een zaak om hem opnieuw te spelen.",
  wipe:"Wissen",wipeY:"Deze zaak wissen",wipeAll:"Alles wissen, ook rang en archief",wipeQ:"Zaak wissen?",wipeT:"Je foto's en aantekeningen van deze zaak gaan verloren.",allQ:"Alles wissen?",allT:"Rang, dagreeks, Pro-status en archief van alle wandelingen verdwijnen van dit toestel.",allY:"Ja, alles wissen",
  camNote:"De foto's blijven op je telefoon. Ze worden nergens heen gestuurd.",
  mlLoad:"Beeldherkenning laden… (eenmalig, ±15 MB; daarna werkt het ook offline)",mlOk:"Beeldherkenning staat aan.",mlFail:"Beeldherkenning kon niet laden. Foto's worden nu niet gecontroleerd.",mlCheck:"De foto bekijken…",
  mlNo:"Hier zie ik vooral: {x}. Ik zoek {w}. Kom dichterbij, zet het in het midden en probeer het nog eens.",mlYes:"Herkend: {x}",mlSkip:"Toch doorgaan (kost een ster)",mlSkipped:"Zonder controle doorgegaan.",
  stripT:"Bewijsstrook · zaak {c}",stripSub:"De Fotojacht · moordwandeling.nl",dl:"Opslaan als afbeelding"
},
/* attributen van verdachten */
AT:{jas:{n:"Jas",v:["een donkerblauwe jas","een lichte regenjas","een groene parka"],s:["donkerblauwe jas","lichte regenjas","groene parka"]},
    weg:{n:"Vervoer",v:["op de fiets","met de auto","te voet"],s:["fiets","auto","te voet"]},
    ding:{n:"Bij zich",v:["een paraplu","een hond","een rugzak"],s:["paraplu","hond","rugzak"]}},
/* bewijs per attribuut en waarde: wat je op een plek vindt. Altijd waar. */
EV:{jas:[["Een vezel aan de scherpe rand. Donkerblauw, dik geweven. Van een winterjas.","Een knoop in de goot: donkerblauw, met een anker erop. Van dezelfde jas als de vezel aan het hek twee straten terug."],
        ["Een lichte vlek op het natte hout: iemand heeft hier zijn jas uitgeschud. Lichte stof, regenjas.","Een ceintuur van een lichte regenjas, los, in de struik gegooid."],
        ["Groene vezels, ruw, aan de spijker. Van een parka.","Een capuchonkoord met groene stof eraan. Afgescheurd van een parka."]],
    weg:[["Verse bandensporen, smal, dwars door de modder. Een fiets, en hij had haast.","Een fietslampje, nog aan, in het gras gevallen."],
        ["Een kort remspoor op de stoep. Hier stond een auto scheef geparkeerd, met draaiende motor.","Glas van een koplamp, net geveegd naar de kant. Hier is een auto ergens tegenaan gereden."],
        ["Schoenafdrukken in de modder, diep, de hak eerst. Iemand die te voet was en rende.","Een afgebroken hak, en een paar meter verder een tweede afdruk op één schoen. Te voet, en in paniek."]],
    ding:[["Een paraplu, kapot, in de prullenbak gepropt. Nog nat.","Een paraplupunt, afgebroken, tussen de stenen."],
        ["Hondenharen op de bank, en een halsbandpenning zonder naam.","Een hond heeft hier gegraven, vannacht. De aarde is nog los."],
        ["Een riem van een rugzak, doorgesneden.","Een rugzak is hier neergezet: twee afdrukken in het natte blad, en een reeppapiertje ertussen."]]},
/* tijdspoor: smaak, sluit niemand uit */
TIME:["Een parkeerbon van {t}, één straat verderop. Wie hier was, was er precies op dat moment.","Een buurvrouw hoorde om {t} een deur slaan. Hard. Toen niets meer.","De lantaarn hier knipperde rond {t}; de hele straat heeft het gezien, niemand keek om."],
/* getuigenverklaringen per attribuut; {v} wordt de waarde */
WIT:{jas:["Ik zag iemand met {v} de hoek om gaan. Dat weet ik zeker, ik keek er recht tegenaan.","Die persoon droeg {v}. Ik lette erop omdat het regende."],
     weg:["Die ging {v} weg. Richting het water.","Ik hoorde het eerst, toen zag ik het: {v}, en snel."],
     ding:["Wat me opviel: {v}. Vreemd, op dat uur.","Diegene had {v} bij zich. Daar ben ik zeker van."]},
/* verdachten: naam, relatie tot het slachtoffer, wat ze zelf zeggen */
SUS:[["Mark Vermeulen","buurman","“Ik hoor nooit wat door die muren.”"],["Saskia de Groot","collega","“We hadden ruzie, ja. Maar dat had iedereen met hem.”"],["Jeroen Bakker","ex-partner","“Ik was thuis. Alleen, helaas.”"],["Ilse van Dijk","zus","“We spraken elkaar al maanden niet.”"],["Tom Hendriks","huurder","“Ik betaal te veel voor te weinig. Dat zei ik ook tegen hem.”"],["Nadia El Amrani","beste vriendin","“Ze belde me om tien uur. Daarna niets.”"],["Pieter Jansen","zakenpartner","“Het geld was ook mijn geld.”"],["Lotte Smit","buurvrouw","“Ik zag alleen de lantaarn knipperen.”"],["Bram Visser","oude schoolvriend","“We zouden vanavond afspreken. Hij kwam niet.”"],["Femke Mulder","nicht","“Ik weet niets van een testament.”"]],
/* getuigen (geen verdachten): naam, wie het is */
WS:[["de krantenbezorger","was om zes uur al op straat"],["mevrouw Koster","laat 's avonds de hond uit"],["de nachtportier","rookt zijn pauze buiten"],["een studente","kwam laat thuis van haar werk"],["de taxichauffeur","stond te wachten op een rit"],["de bakker","begint om vier uur"],["een jogger","loopt elke avond dezelfde ronde"],["de buschauffeur","reed de laatste rit"]],
/* slachtoffers: naam, waar gevonden */
VIC:[["Daniël Roos","bij het water, met zijn gezicht naar beneden"],["Eva Lindeman","onder aan de trap van haar eigen huis"],["Rutger de Wit","in zijn auto, de motor nog warm"],["Mira Jonker","op een bankje, alsof ze sliep"],["Koen Verhoeven","achter de garage, half onder het blad"]],
/* intro van het dossier */
OPEN:"{V} is vannacht gevonden, {W}. De dader is daarna door deze buurt gelopen en heeft onderweg dingen verloren, weggegooid of achtergelaten. Niet op een kaart te zetten: wel te vinden, als je weet waar je moet kijken. Vijf mensen hadden een reden. Vier mensen hebben iets gezien. Eén van hen liegt.",
/* opdrachten buiten: id, wat je zoekt, vage hint, letterlijke hint, intro op de plek */
OUT:[["bank","een bankje","Waar mensen even gaan zitten als ze niet meer weten waarheen.","Zoek een bankje: in een park, langs de weg, bij een bushalte.","Hier heeft iemand gezeten, kort. Onder de bank:",[703]],
     ["bak","een prullenbak","Waar je iets kwijt wilt zonder dat iemand het ziet.","Zoek een openbare prullenbak of container.","Bovenin, tussen het gewone afval:",[412,569]],
     ["brief","een brievenbus","Iemand wilde iets kwijt, zonder te praten.","Zoek een brievenbus: van PostNL of van een huis.","Erop, met de regen half weggewassen:",[637]],
     ["bord","een verkeersbord of stoplicht","De dader heeft het genegeerd.","Zoek een verkeersbord, een stoplicht of een parkeermeter.","Aan de achterkant van het bord:",[919,920,704]],
     ["fiets","een fiets of scooter","Niemand kwam hem ophalen.","Zoek een fiets, scooter of bromfiets.","Aan het stuur:",[671,444,665,670]],
     ["hek","een hek of muurtje","Niet de weg die normale mensen nemen.","Zoek een hek, een schutting of een stenen muurtje.","Aan de bovenkant, waar iemand overheen is geklommen:",[489,716,912,825]],
     ["auto","een geparkeerde auto","Hij stond scheef. Met draaiende motor.","Zoek een geparkeerde auto of bestelbus, van opzij of van voren.","Onder het portier, op de stoep:",[436,468,656,717,751,817,475,479,654,734,675,864,705]],
     ["put","een putdeksel","Alles wat hieronder valt, is weg.","Zoek een putdeksel in de straat of op de stoep.","In de rand van het deksel:",[640]],
     ["kerk","een kerk of toren","De klok sloeg toen het gebeurde.","Zoek een kerk, een toren of een kasteel; van ver mag ook.","Bij de poort:",[497,663,483,437,900]],
     ["water","water of een fontein","Alles wat je kwijt wilt, gooi je hierin. Dacht de dader.","Zoek water: een vijver, een gracht, een fontein, een steiger of een boot.","Aan de kant, waar het ondiep is:",[562,975,536,718,460,472,814,449,525,978]],
     ["winkel","een winkel of winkelwagen","Hier is nog iets gekocht. Contant.","Zoek een winkelpui, een bakker, een supermarkt of een winkelwagen.","Bij de ingang:",[791,790,582,415,860,509,467,454,788,865]],
     ["brug","een brug of viaduct","Eronder is het droog. En donker.","Zoek een brug, een viaduct of een tunneltje.","In de hoek waar het droog is gebleven:",[888,821,839]]],
/* opdrachten binnen */
IN:[["kop","een kop of glas","Er is hier gezeten en gewacht.","Fotografeer een koffiekop, mok, theepot of glas.","De kop is niet afgewassen. Op de rand:",[504,968,849,967,647,572,441]],
    ["klok","een klok of horloge","Het enige wat in dit huis niet liegt.","Fotografeer een klok, horloge of wekker.","De tijd staat stil. Precies op:",[409,530,892,531,826,604]],
    ["schoen","een schoen","De zool vertelt waar hij vannacht is geweest.","Fotografeer een schoen, sneaker, laars of sandaal.","In het profiel van de zool:",[770,774,630,502,514]],
    ["lamp","een lamp of kaars","Het licht dat vannacht als laatste uitging.","Fotografeer een tafellamp, lampenkap of kaars.","In de kring van het licht, op tafel:",[846,619,470]],
    ["plant","een plant in een pot","Hij staat scheef. Iemand heeft er tegenaan gestoten.","Fotografeer een plant in een pot of een vaas.","In de aarde van de pot:",[738,883]],
    ["boek","een boek of boekenkast","Er is iets in verstopt. Dat doen mensen altijd.","Fotografeer een boek, een strip of een boekenkast.","Tussen de bladzijden:",[453,917,921,454,446]],
    ["scherm","een telefoon, laptop of tv","Het laatste bericht is hierop gelezen.","Fotografeer een telefoon, afstandsbediening, laptop, toetsenbord of tv.","Op het scherm, nog net leesbaar:",[761,487,620,681,508,673,851,527,664]],
    ["fles","een fles of kan","Er is hier gedronken. Niet alleen.","Fotografeer een fles, kan of waterfles.","Op het etiket, met pen:",[898,907,440,737,720,899,725,455]],
    ["jas","een jas of trui","De zakken zijn leeg. Bijna.","Fotografeer een jas, trui, sjaal of spijkerbroek.","In de binnenzak:",[869,568,474,617,608,824,806]],
    ["paraplu","een paraplu","Hij is vannacht gebruikt. Hij is nog nat.","Fotografeer een paraplu, open of dicht.","In de plooien van de paraplu:",[879]],
    ["tas","een tas of rugzak","Alles wat je meeneemt als je niet terugkomt.","Fotografeer een rugzak, handtas, portemonnee of boodschappentas.","Onderin de tas:",[414,748,893,790,728,636]],
    ["keuken","iets uit de keuken","Hier is om middernacht nog koffie gezet.","Fotografeer een koffiezetapparaat, magnetron, koelkast, broodrooster of pan.","Op het aanrecht ernaast:",[859,651,760,827,534,505,550,567,909,544,897]],
    ["zit","een bank, stoel of kussen","Hier heeft iemand de hele nacht gezeten.","Fotografeer een bank, stoel, kussen of bed.","Tussen de kussens:",[721,831,765,559,564,423,520]]],
/* pictogrammen per opdracht-id (klein, één kleur) */
ICON:{bank:"M3 10h18v4H3zM5 14v6M19 14v6M3 8h18",bak:"M6 6h12l-1 15H7zM4 6h16M9 3h6v3",brief:"M3 6h18v12H3zM3 6l9 7 9-7",bord:"M12 2l10 18H2zM12 9v5M12 16v2",fiets:"M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15l4-8h6l2 8M10 7l4 8",hek:"M4 4v16M20 4v16M4 8h16M4 16h16M12 8v8",auto:"M3 13l2-6h14l2 6v5H3zM6 18v2M18 18v2M3 13h18M7 15h2M15 15h2",put:"M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 12h4M16 12h4",kerk:"M12 2v4M10 4h4M8 22V9l4-3 4 3v13M4 22v-8h4M16 14h4v8M2 22h20",water:"M3 15c3-3 6 3 9 0s6-3 9 0M3 19c3-3 6 3 9 0s6-3 9 0",winkel:"M3 10l2-5h14l2 5M4 10v11h16V10M9 21v-6h6v6",brug:"M2 18V10q10-8 20 0v8M7 18v-5M12 18v-6M17 18v-5",
      kop:"M4 6h12v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 8h2a2 2 0 0 1 0 4h-2",klok:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2",schoen:"M3 17h18v3H3zM3 17c0-5 3-8 6-8l3 3h4l5 5",lamp:"M12 22V8M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",plant:"M12 22v-9M12 13c-6 0-8-5-8-9 5 0 8 3 8 9zM12 13c6 0 8-5 8-9-5 0-8 3-8 9z",boek:"M4 3h12a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3zM4 18a3 3 0 0 1 3-3h12",scherm:"M7 2h10v20H7zM10 19h4",fles:"M10 2h4v4l2 3v12H8V9l2-3zM8 13h8",jas:"M8 3l4 2 4-2 5 4-2 4-2-1v12H7V10l-2 1-2-4z",paraplu:"M2 12a10 10 0 0 1 20 0zM12 12v8a2 2 0 0 1-4 0M12 2v2",tas:"M4 8h16l-1 13H5zM9 8V5a3 3 0 0 1 6 0v3",keuken:"M3 7h18v12H3zM3 11h18M7 15h4M15 15h2",zit:"M4 12V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 12h18v6H3zM5 18v2M19 18v2"},
/* Nederlandse namen voor de ImageNet-klassen die in de opdrachten voorkomen (de rest blijft Engels) */
LBL:{703:"een bankje",412:"een afvalbak",569:"een vuilniswagen",637:"een brievenbus",919:"een verkeersbord",920:"een stoplicht",704:"een parkeermeter",671:"een fiets",444:"een tandem",665:"een brommer",670:"een scooter",489:"een hekwerk",716:"een tuinhek",912:"een houten hek",825:"een stenen muur",436:"een stationwagen",468:"een taxi",656:"een busje",717:"een pick-up",751:"een raceauto",817:"een sportwagen",475:"een autospiegel",479:"een autowiel",654:"een minibus",734:"een politiebus",675:"een verhuiswagen",864:"een sleepwagen",705:"een treinwagon",640:"een putdeksel",497:"een kerk",663:"een klooster",483:"een kasteel",437:"een vuurtoren",900:"een watertoren",562:"een fontein",975:"een oever",536:"een steiger",718:"een pier",460:"een golfbreker",472:"een kano",814:"een motorboot",449:"een boothuis",525:"een dam",978:"een strand",791:"een winkelwagen",790:"een winkelmandje",582:"een supermarkt",415:"een bakker",860:"een tabakswinkel",509:"een snoepwinkel",467:"een slager",454:"een boekwinkel",788:"een schoenenwinkel",865:"een speelgoedwinkel",888:"een viaduct",821:"een boogbrug",839:"een hangbrug",
     504:"een koffiemok",968:"een kopje",849:"een theepot",967:"espresso",647:"een maatbeker",572:"een glas",441:"een bierglas",409:"een klok",530:"een digitale klok",892:"een wandklok",531:"een horloge",826:"een stopwatch",604:"een zandloper",770:"een sportschoen",774:"een sandaal",630:"een instapper",502:"klompen",514:"een laars",846:"een tafellamp",619:"een lampenkap",470:"een kaars",738:"een bloempot",883:"een vaas",453:"een boekenkast",917:"een stripboek",921:"een boekomslag",446:"een ringband",761:"een afstandsbediening",487:"een telefoon",620:"een laptop",681:"een laptop",508:"een toetsenbord",673:"een muis",851:"een televisie",527:"een computer",664:"een beeldscherm",898:"een waterfles",907:"een wijnfles",440:"een bierfles",737:"een frisdrankfles",720:"een pillenpotje",899:"een kan",725:"een schenkkan",455:"een flessendop",869:"een regenjas",568:"een bontjas",474:"een vest",617:"een labjas",608:"een spijkerbroek",824:"een sjaal",806:"een sok",879:"een paraplu",414:"een rugzak",748:"een handtas",893:"een portemonnee",728:"een plastic tas",636:"een posttas",859:"een broodrooster",651:"een magnetron",760:"een koelkast",827:"een fornuis",534:"een vaatwasser",505:"een koffiezetapparaat",550:"een espressomachine",567:"een koekenpan",909:"een wok",544:"een braadpan",897:"een wasmachine",721:"een kussen",831:"een bank",765:"een schommelstoel",559:"een klapstoel",564:"een hemelbed",423:"een kappersstoel",520:"een kinderbed"},
/* einde per attribuutcombinatie is niet nodig: één epiloog met variabelen */
END:"{K}, {KR} van {V}. {KJ}, {KW}, {KD}: alles wat je vond, wees die kant op. {L} loog, en wist dat jij de foto's had. Zaak gesloten.",
DEMO:null
};
