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
OUT:[["deur","een rode of felgekleurde voordeur","Iemand heeft hier aangebeld en is niet binnengelaten.","Zoek een voordeur die opvalt door zijn kleur. Rood, geel, blauw: alles behalve saai.","Er is hier aangebeld. Er werd niet opengedaan. Op de stoep:"],
     ["bank","een bankje","Waar mensen even gaan zitten als ze niet meer weten waarheen.","Zoek een bankje: in een park, langs de weg, bij een bushalte.","Hier heeft iemand gezeten, kort. Onder de bank:"],
     ["bak","een prullenbak","Waar je iets kwijt wilt zonder dat iemand het ziet.","Zoek een openbare prullenbak.","Bovenin, tussen het gewone afval:"],
     ["boom","een boom die dikker is dan jij","Ouder dan de hele straat. Hij heeft alles gezien.","Zoek een dikke boom; je armen moeten er niet omheen kunnen.","Aan de schors, op schouderhoogte:"],
     ["num","een huisnummer met een 7","Een getal dat de dader twee keer heeft gelezen voor hij verder liep.","Zoek een huisnummer waar een 7 in zit: 7, 17, 73, 127…","Hier is getwijfeld. Op de drempel:"],
     ["water","water","Alles wat je kwijt wilt, gooi je hierin. Dacht de dader.","Zoek water: een sloot, een vijver, een gracht, een fontein, een grote plas mag ook.","Aan de kant, waar het ondiep is:"],
     ["lamp","een lantaarnpaal met een sticker of graffiti","Het enige licht in de straat, en iemand heeft erop geleund.","Zoek een lantaarnpaal waar iets op geplakt of gespoten is.","Onder aan de paal, in de kring van het licht:"],
     ["fiets","iets wat achtergelaten is","Een fiets zonder eigenaar, een karretje, een leeg pand. Iets wat wacht op iemand die niet terugkomt.","Zoek iets wat verlaten is: een vastgeroeste fiets, een winkelwagen, een leegstaand huis.","Dit is niet zomaar blijven staan. Ernaast:"],
     ["brug","een brug of viaduct","Eronder is het droog. En donker.","Zoek een brug, een viaduct of een tunneltje.","In de hoek waar het droog is gebleven:"],
     ["bord","een verkeersbord","De dader heeft het genegeerd.","Zoek een verkeersbord.","Aan de achterkant van het bord:"],
     ["hek","een hek met een opening of een gat","Niet de weg die normale mensen nemen.","Zoek een hek waar je doorheen of overheen kunt.","Aan de rand van de opening:"],
     ["brief","een brievenbus","Iemand wilde iets kwijt, zonder te praten.","Zoek een brievenbus: van PostNL of van een huis.","Erop, met de regen half weggewassen:"]],
/* opdrachten binnen */
IN:[["sleutel","een sleutel","Iets wat één deur opent, en vannacht een andere.","Zoek een sleutel in huis. Welke dan ook.","Aan de sleutel hangt niets meer. Ernaast lag:"],
    ["rood","iets roods","De kleur die de getuige als eerste noemde.","Fotografeer iets wat rood is.","Op het rode, als je goed kijkt:"],
    ["foto","een foto van vroeger","Iemand op die foto is er niet meer.","Zoek een oude foto, ingelijst of los.","Achter de foto, in potlood:"],
    ["kop","een koffiekop of theeglas","Er is hier gezeten en gewacht.","Fotografeer een kop of een glas.","De kop is niet afgewassen. Op de rand:"],
    ["schoen","een schoen","De zool vertelt waar hij vannacht is geweest.","Fotografeer een schoen, het liefst de onderkant.","In het profiel van de zool:"],
    ["klok","een klok of iets wat de tijd aangeeft","Het enige wat in dit huis niet liegt.","Fotografeer een klok, horloge of het scherm van de magnetron.","De tijd staat stil. Precies op:"],
    ["raam","het uitzicht uit een raam","Van hieruit is het gezien.","Fotografeer wat je buiten ziet door een raam.","Op de vensterbank, aan de binnenkant:"],
    ["boek","een boek","Er is iets in verstopt. Dat doen mensen altijd.","Fotografeer een boek; de titel doet er niet toe.","Tussen de bladzijden:"],
    ["jas","een jas aan een haak","De zakken zijn leeg. Bijna.","Fotografeer een jas die ergens hangt.","In de binnenzak:"],
    ["lamp","een lamp die aan is","Het licht dat vannacht als laatste uitging.","Fotografeer een brandende lamp.","In de kring van het licht, op tafel:"],
    ["plant","een plant","Hij staat scheef. Iemand heeft er tegenaan gestoten.","Fotografeer een plant, echt of nep.","In de aarde van de pot:"],
    ["deur","een gesloten deur","Daarachter is het gebeurd. Dat denk je.","Fotografeer een dichte deur in huis.","Onder de deur door geschoven:"]],
/* pictogrammen per opdracht-id (klein, één kleur) */
ICON:{deur:"M6 2h12v20H6zM14 11h2v2h-2z",bank:"M3 10h18v4H3zM5 14v6M19 14v6M3 8h18",bak:"M6 6h12l-1 15H7zM4 6h16M9 3h6v3",boom:"M12 22V12M12 12c-5 0-7-4-5-8 2-4 8-4 10 0 2 4 0 8-5 8z",num:"M5 5h14M9 19l6-14",water:"M3 15c3-3 6 3 9 0s6-3 9 0M3 19c3-3 6 3 9 0s6-3 9 0",lamp:"M12 22V8M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",fiets:"M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15l4-8h6l2 8M10 7l4 8",brug:"M2 18V10q10-8 20 0v8M7 18v-5M12 18v-6M17 18v-5",bord:"M12 2l10 18H2zM12 9v5M12 16v2",hek:"M4 4v16M20 4v16M4 8h16M4 16h16M12 8v8",brief:"M3 6h18v12H3zM3 6l9 7 9-7",
      sleutel:"M8 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 12l9 9M18 18l2-2M15 15l2-2",rood:"M12 21s-8-5-8-11a4 4 0 0 1 8-2 4 4 0 0 1 8 2c0 6-8 11-8 11z",foto:"M3 5h18v14H3zM6 16l4-5 3 3 2-2 3 4",kop:"M4 6h12v9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 8h2a2 2 0 0 1 0 4h-2",schoen:"M3 17h18v3H3zM3 17c0-5 3-8 6-8l3 3h4l5 5",klok:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 7v5l3 2",raam:"M4 4h16v16H4zM12 4v16M4 12h16",boek:"M4 3h12a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3zM4 18a3 3 0 0 1 3-3h12",jas:"M8 3l4 2 4-2 5 4-2 4-2-1v12H7V10l-2 1-2-4z",plant:"M12 22v-9M12 13c-6 0-8-5-8-9 5 0 8 3 8 9zM12 13c6 0 8-5 8-9-5 0-8 3-8 9z"},
/* einde per attribuutcombinatie is niet nodig: één epiloog met variabelen */
END:"{K}, {KR} van {V}. {KJ}, {KW}, {KD}: alles wat je vond, wees die kant op. {L} loog, en wist dat jij de foto's had. Zaak gesloten.",
DEMO:null
};
