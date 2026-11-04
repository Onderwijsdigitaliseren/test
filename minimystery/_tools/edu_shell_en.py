#!/usr/bin/env python3
"""Maakt de Engelse HTML-schil (en/<slug>.html) van een educatieve wandeling uit de Nederlandse schil.
Gebruik: python3 _tools/edu_shell_en.py   (vanuit de map minimystery)
Vertaalt tekst-nodes, attributen en meta's exact (geen losse woorden), zet paden op ../, laadt data-en.js en game-en.js.
Na een wijziging in een NL-schil: dit script opnieuw draaien; ontbrekende vertalingen worden gemeld."""
import re, sys, json, os

COMMON = {
 "◂ Alle zaken": "◂ All cases", "Educatie": "Education", "English": "Nederlands",
 "Hoe werkt het?": "How does it work?", "Dagen op rij": "Days in a row", "Opgelost": "Solved",
 "Teamnaam (mag leeg, komt op het diploma)": "Team name (optional, goes on the certificate)",
 "Voor wie": "Who is playing", "School": "School", "BSO": "After-school",
 "licht educatief": "lightly educational", "speels, meer bewegen": "playful, more moving",
 "6–7 jaar": "6–7 years", "8–9 jaar": "8–9 years", "10–12 jaar": "10–12 years",
 "groep 3–4": "ages 6–8", "groep 5–6": "ages 8–10", "groep 7–8": "ages 10–12",
 "Groep 3–4": "Ages 6–8", "Groep 5–6": "Ages 8–10", "Groep 7–8": "Ages 10–12",
 "Lengte": "Length", "Kort": "Short", "Normaal": "Normal", "Lang": "Long",
 "Buiten": "Outdoors", "met kaart": "with map", "zonder kaart": "without map", "In het": "In the", "gebouw": "building",
 "🔊 Voorlezen": "🔊 Read aloud", "Zaakcode invullen": "Enter a case code",
 "Proefronde in de binnenstad van Eindhoven": "Practice round in Eindhoven city centre",
 "Wissen": "Clear", "We gaan zoeken! ▸": "Let's go! ▸", "🖨 Begeleidersblad (antwoorden)": "🖨 Leader's sheet (answers)",
 "Terug": "Back", "Tijd": "Time", "Menu": "Menu", "Inzoomen": "Zoom in", "Uitzoomen": "Zoom out", "Centreer op mij": "Centre on me",
 "Maak de foto": "Take the photo", "Dit duurt meestal 5 tot 30 seconden. Blijf op deze pagina.": "This usually takes 5 to 30 seconds. Please stay on this page.",
 "Voor de begeleider:": "For the leader:", "zaakcode": "case code", "begeleidersblad": "leader's sheet", "verhaalkaart": "story map",
 "met een pijl en koud/warm/heet.": "with an arrow and cold/warm/hot.",
 "Buiten met kaart:": "Outdoors with map:", "Buiten zonder kaart:": "Outdoors without map:", "In het gebouw:": "In the building:",
 "Finale:": "Finale:", "Stations": "Stations", "Extra zaak": "Extra case", "Start de zaak van vandaag": "Start today's case",
 "Verder met de zaak": "Continue the case", "Opgeloste zaken": "Solved cases", "Drie niveaus": "Three levels", "Drie niveaus:": "Three levels:",
 "de stations komen achter elkaar, het team loopt zelf naar een nieuwe plek.": "the stations come one after another; the team walks to a new spot by itself.",
 "de stations staan dicht bij elkaar (alles binnen ongeveer 300 meter). De kinderen zien een": "the stations are close together (all within about 300 metres). The children see a",
 "de begeleider kiest plekken in de school; per plek een kaartje met een code uit het begeleidersblad.": "the leader picks spots in the school; each spot gets a card with a code from the leader's sheet.",
 "kies School of BSO, de groep en de lengte (6, 8 of 10 stations). Start de zaak op je eigen telefoon: in de briefing staat de": "choose School or After-school, the age group and the length (6, 8 or 10 stations). Start the case on your own phone: the briefing shows the",
 ". Elk team vult die code in en krijgt precies dezelfde zaak. Onder de briefing staat het": ". Every team enters that code and gets exactly the same case. Below the briefing is the",
 "Tip: spreek het speelgebied en een eindtijd af. Teams blijven bij elkaar en op de stoep. Geen account, geen app: werkt in de browser.": "Tip: agree on the play area and a finish time. Teams stay together and on the pavement. No account, no app: it works in the browser.",
 "6 stations · ±35 min": "6 stations · ±35 min", "8 stations · ±45 min": "8 stations · ±45 min", "10 stations · ±60 min": "10 stations · ±60 min",
 "(A4).": "(A4).",
}

SVG = {"tijdlek!": "time leak!", "cijfers weg!": "numbers gone!", "letters weg!": "letters gone!", "kast leeg?!": "hive empty?!", "weg?!": "gone?!"}

GAMES = {
"tijd": {"nl": "de-tijdreizigers.html", "en": "the-time-travellers.html", "id": "tr", "t": {
 "De Tijdreizigers – geschiedenis-speurtocht voor school en BSO | MiniMystery Educatie": "The Time Travellers – a history walk for school and after-school clubs | MiniMystery Education",
 "MiniMystery Educatie – De Tijdreizigers": "MiniMystery Education – The Time Travellers",
 "De schoolklok is een tijdmachine. Tien tijdvakken in je eigen buurt, voor groep 5–8 en BSO.": "The school clock is a time machine. Ten eras of history in your own neighbourhood, for ages 8–12 and after-school clubs.",
 "De Tijdreizigers": "The Time Travellers",
 "MiniMystery Educatie · geschiedenis · groep 5–8": "MiniMystery Education · history · ages 8–12",
 "De schoolklok is een tijdmachine!": "The school clock is a time machine!",
 "De klok in de hal is weg, en in een oud schrift uit 1923 staat waarom: wie hem verkeerd opwindt, maakt een lek in de tijd. Rond (of in) jullie school zitten nu tijdlekken. Bij elk lek kijk je een tijdvak in, doe je een onderzoek in je eigen buurt en verdien je een tijdsleutel. Leg de tijdvakken op volgorde en de klok komt terug. De tien tijdvakken van de canon, voor groep 5–8 en BSO.":
   "The clock in the hall is gone, and an old notebook from 1923 explains why: whoever winds it the wrong way makes a leak in time. There are now time leaks around (or inside) your school. At each leak you look into an era, do an investigation in your own neighbourhood and earn a time key. Put the eras in order and the clock comes back. The ten eras of Dutch history, for ages 8–12 and after-school clubs.",
 "bijv. De Tijdreizigers": "e.g. The Time Travellers",
 "6 tijdvakken · ±35 min": "6 eras · ±35 min", "10 tijdvakken · ±50 min": "10 eras · ±50 min", "12 · met nu en toekomst": "12 · with now and the future",
 "Verder met de tijdreis": "Continue the time journey", "Start de tijdreis van vandaag": "Start today's time journey", "Extra tijdreis": "Extra time journey",
 "Eerdere tijdreizen": "Earlier time journeys", "Het oude schrift": "The old notebook",
 "Tijdlekken": "Time leaks", "Tijdsleutels": "Time keys", "Logboek": "Logbook", "De tijdlijn": "The timeline",
 "Op weg naar het eerste tijdlek": "On the way to the first time leak",
 "kies School of BSO, de leeftijd en de lengte (6, 10 of 12 tijdvakken). Start de tijdreis op je eigen telefoon: in de briefing staat de": "choose School or After-school, the age and the length (6, 10 or 12 eras). Start the time journey on your own phone: the briefing shows the",
 ". Elk team vult die code in (knop Zaakcode invullen) en krijgt precies dezelfde tijdreis. Onder de briefing staat het": ". Every team enters that code (button Enter a case code) and gets exactly the same time journey. Below the briefing is the",
 ": het verhaal, een korte lesbrief vooraf en achteraf, alle missies met antwoorden en hints.": ": the story, a short lesson plan for before and after, all missions with answers and hints.",
 "Elk tijdlek is een tijdvak": "Each time leak is an era",
 "uit de canon: jagers en boeren, Grieken en Romeinen, monniken en ridders, steden en staten, ontdekkers en hervormers, regenten en vorsten, pruiken en revoluties, burgers en stoommachines, wereldoorlogen, televisie en computer. Lang voegt \"jouw eigen tijd\" en \"de toekomst\" toe. Eerst een korte tijdreis (verhaal), dan een":
   "from the Dutch history canon: hunters and farmers, Greeks and Romans, monks and knights, towns and states, explorers and reformers, regents and monarchs, wigs and revolutions, citizens and steam engines, world wars, television and computers. Long adds \"your own time\" and \"the future\". First a short time journey (story), then an",
 "onderzoek": "investigation",
 "in de buurt of in het gebouw (sporen zoeken, tellen, vergelijken), dan een vraag op niveau 6–7, 8–9 of 10–12 jaar. Eén hint per missie.": "in the neighbourhood or in the building (looking for traces, counting, comparing), then a question at level 6–7, 8–9 or 10–12 years. One hint per mission.",
 "Na elk goed antwoord: een": "After each right answer: a",
 ", een \"wist je dat\", en het": ", a \"did you know\", and the",
 "buurtonderzoek": "neighbourhood check",
 ": heeft het team een spoor uit dit tijdvak gezien? Dat komt in het logboek en op het diploma, en is de basis voor de nabespreking in de klas.": ": has the team seen a trace from this era? It goes into the logbook and on the certificate, and is the starting point for the class discussion afterwards.",
 "tijdsleutel": "time key",
 "de tijdlekken zitten op plekken dicht bij elkaar (alles binnen ongeveer 300 meter). De kinderen zien een": "the time leaks are at spots close together (all within about 300 metres). The children see a",
 "de missies komen achter elkaar, het team loopt zelf naar een nieuwe plek.": "the missions come one after another; the team walks to a new spot by itself.",
 "de begeleider kiest plekken in de school (aula, gymzaal, bieb, trap…). Die keuze zit in de zaakcode. Per plek print je een kaartje met een code uit het begeleidersblad; het team loopt naar de plek en typt de code. Zonder kaartjes kan ook.":
   "the leader picks spots in the school (hall, gym, library, stairs…). That choice is stored in the case code. For each spot you print a card with a code from the leader's sheet; the team walks to the spot and types the code. Playing without cards works too.",
 "de tijdvakken op volgorde leggen van oud naar nieuw (bij 6–9 jaar met jaartallen erbij). Klopt het, dan stroomt de tijd weer, komt de klok terug en krijgt het team een": "put the eras in order from old to new (with years shown for ages 6–9). If it's right, time flows again, the clock comes back and the team gets a",
 "diploma Tijdreiziger": "Time Traveller certificate", "(A4) met hun tijdlijn.": "(A4) with their timeline.",
}, "meta": {
 "desc": "History walk for ages 8–12 and after-school clubs: the school clock turns out to be a time machine. At ten time leaks around (or inside) the school, teams look into an era, do a small investigation in their own neighbourhood and collect time keys. Finale: put the eras in order. With map, without map or inside the building. Case code, leader's sheet with lesson plan, certificate.",
 "ld": "History walk for primary school (ages 8–12) and after-school clubs: the school clock is a time machine. Ten eras of Dutch history, investigations in your own neighbourhood, finale in order. Case code, leader's sheet with lesson plan, certificate."}},

"reken": {"nl": "professor-nul-en-de-verdwenen-cijfers.html", "en": "professor-zero-and-the-missing-numbers.html", "id": "rk", "t": {
 "Professor Nul en de verdwenen cijfers – reken-speurtocht voor school en BSO | MiniMystery Educatie": "Professor Zero and the Missing Numbers – a maths walk for school and after-school clubs | MiniMystery Education",
 "MiniMystery Educatie – Professor Nul en de verdwenen cijfers": "MiniMystery Education – Professor Zero and the Missing Numbers",
 "Alle cijfers zijn weg. Rekenen met echte dingen in je eigen buurt, voor groep 3–8 en BSO.": "All the numbers are gone. Maths with real things in your own neighbourhood, for ages 6–12 and after-school clubs.",
 "Professor Nul en de verdwenen cijfers": "Professor Zero and the Missing Numbers",
 "MiniMystery Educatie · rekenen · groep 3–8": "MiniMystery Education · maths · ages 6–12",
 "Getallen? Overbodig! – Prof. Nul": "Numbers? Pointless! – Prof. Zero",
 "Alle cijfers van de school zijn weg: van de klok, de deuren, de kalender en de kassa. Professor Nul vindt getallen overbodig. Jullie bewijzen het tegendeel. Op rekenstations rond (of in) de school tellen, meten, schatten en rekenen jullie met echte dingen: stappen, ramen, huisnummers, de klok, de kassa, het verkeer. Elk station geeft een getalsleutel; alle sleutels op volgorde en de kluis gaat open.":
   "All the numbers in the school are gone: from the clock, the doors, the calendar and the till. Professor Zero thinks numbers are pointless. You will prove him wrong. At maths stations around (or inside) the school you count, measure, estimate and calculate with real things: steps, windows, house numbers, the clock, the till, the traffic. Each station gives a number key; put all the keys in order and the safe opens.",
 "bijv. De Rekenspeurders": "e.g. The Number Detectives",
 "tot 20 en 100": "up to 20 and 100", "tafels, meten, klok": "times tables, measuring, clock", "komma, %, schaal": "decimals, %, scale",
 "Het briefje van Professor Nul": "Professor Zero's note", "Getalsleutels": "Number keys", "Rekenboekje": "Maths notebook", "De kluis": "The safe",
 "Op weg naar het eerste station": "On the way to the first station",
 ": het verhaal, een lesbrief vooraf en achteraf per groep, alle stations met het rekenrecept, hints en rekentips.": ": the story, a lesson plan for before and after per age group, all stations with the calculation, hints and maths tips.",
 "Elk station is een echte meting:": "Each station is a real measurement:",
 "stappen tellen naar een paal, ramen tellen, een huisnummer zoeken, lantaarnpalen, verkeer tellen in één minuut, stoeptegels, verdiepingen, vormen, de klok zonder cijfers, de kassa, eerlijk delen, kaart en schaal. Het team typt eerst wat het zelf heeft geteld; de vervolgvraag rekent daarmee verder. Daarom heeft elk team een ander antwoord, en controleert het spel toch.":
   "counting steps to a post, counting windows, finding a house number, lamp posts, counting traffic for one minute, paving stones, floors, shapes, the clock without numbers, the till, sharing fairly, map and scale. The team first types what it counted itself; the follow-up question calculates with that. So every team has a different answer, and the game still checks it.",
 "volgens de rekenleerlijn: groep 3–4 (tellen tot 20 en 100, meer/minder, even/oneven, hele uren, geld tot 10, twee plaatjes als antwoord en alles voorgelezen), groep 5–6 (tafels, delen met rest, cm en m, kwartieren, geld met komma, afronden) en groep 7–8 (kommagetallen, procenten, verhoudingen en schaal, oppervlakte, grote getallen). Eén hint per station, en na elk antwoord een rekentip.":
   "following the Dutch maths curriculum: ages 6–8 (counting to 20 and 100, more/less, odd/even, o'clock, money up to 10, two pictures as answers and everything read aloud), ages 8–10 (times tables, division with remainders, cm and m, quarter hours, money with decimals, rounding) and ages 10–12 (decimals, percentages, ratio and scale, area, large numbers). One hint per station, and a maths tip after every answer.",
 "de getalsleutels van klein naar groot (groep 7–8 met kommagetallen, breuken en procenten door elkaar). Klopt het, dan gaat de getallenkluis open, komen de cijfers terug en krijgt het team een": "the number keys from small to large (ages 10–12 with decimals, fractions and percentages mixed). If it's right, the number safe opens, the numbers come back and the team gets a",
 "diploma Rekenspeurder": "Maths Detective certificate",
}, "meta": {
 "desc": "Maths walk for ages 6–12 and after-school clubs: all the numbers in the school are gone. At maths stations around (or inside) the school, teams count, measure, estimate and calculate with real things: steps, windows, house numbers, the clock, the till, traffic. Three levels. Case code, leader's sheet with lesson plan, certificate.",
 "ld": "Maths walk for primary school (ages 6–12) and after-school clubs: maths stations in your own neighbourhood or in the school building, with real measurements. Three levels. Case code, leader's sheet with lesson plan, certificate."}},

"taal": {"nl": "de-letterdief.html", "en": "the-letter-thief.html", "id": "tl", "t": {
 "De Letterdief – taal-speurtocht voor school en BSO | MiniMystery Educatie": "The Letter Thief – an English literacy walk for school and after-school clubs | MiniMystery Education",
 "MiniMystery Educatie – De Letterdief": "MiniMystery Education – The Letter Thief",
 "De Letterdief stal de letters van de school. Lezen en spellen met echte woorden uit je eigen buurt, voor groep 3–8 en BSO.": "The Letter Thief stole the school's letters. Reading and spelling with real words from your own neighbourhood, for ages 6–12 and after-school clubs.",
 "De Letterdief": "The Letter Thief",
 "MiniMystery Educatie · taal · groep 3–8": "MiniMystery Education · literacy · ages 6–12",
 "Op de gevel staat S_HO_L!": "The sign on the wall says S_HO_L!",
 "Vannacht heeft de Letterdief letters gestolen: van de gevel, van de bordjes op de lokalen, van het bord in de hal. Hij liet een briefje achter: wie mij wil vinden, moet mijn zin maken. Op taalstations rond (of in) de school lezen, spellen en bouwen jullie met echte woorden uit de buurt: straatnaamborden, rijm, lettergrepen, samenstellingen, leestekens. Elk station geeft een woordsleutel; alle woorden op volgorde en zijn zin staat er.":
   "Last night the Letter Thief stole letters: from the sign on the wall, from the classroom doors, from the board in the hall. He left a note: whoever wants to find me must make my sentence. At word stations around (or inside) the school you read, spell and build with real words from the neighbourhood: street signs, rhymes, syllables, compound words, punctuation. Each station gives a word key; put all the words in order and his sentence appears.",
 "bijv. De Woordspeurders": "e.g. The Word Detectives",
 "letters, klanken, rijm": "letters, sounds, rhyme", "spelling, woordsoorten": "spelling, word classes", "ontleden, figuurlijk": "grammar, figurative",
 "Het briefje van de Letterdief": "The Letter Thief's note", "Woordsleutels": "Word keys", "Woordenboekje": "Word book", "De zin": "The sentence",
 "Op weg naar het eerste station": "On the way to the first station",
 ": het verhaal, een lesbrief vooraf en achteraf per groep, alle stations met antwoorden, hints en taaltips.": ": the story, a lesson plan for before and after per age group, all stations with answers, hints and language tips.",
 "Elk station gebruikt echte taal uit de buurt:": "Each station uses real words from the neighbourhood:",
 "het straatnaambord overtypen en de letters, klinkers of lettergrepen tellen, het langste woord klappen, rijmen op wat je ziet, woorden plakken tot samenstellingen, tegenstellingen zoeken, wie doet wat (woordsoorten), spelling, alfabet, leestekens, een zin bouwen, verkleinwoorden, figuurlijk taalgebruik, woorden uit andere talen, een briefje aan de dief. Bij de bord-stations typt het team eerst het woord over; de vervolgvraag gaat daarmee verder, dus elk team heeft een ander antwoord.":
   "copying the street sign and counting its letters, vowels or syllables, clapping the longest word, rhyming with what you see, gluing words into compound words, finding opposites, who does what (word classes), spelling, the alphabet, punctuation, building a sentence, plurals, figurative language, words from other languages, a note to the thief. At the sign stations the team first types the word; the follow-up question works with it, so every team has a different answer.",
 "volgens de taalleerlijn: groep 3–4 (klanken en letters, lettergrepen, rijm, hoofdletter en punt; twee plaatjes als antwoord en alles voorgelezen), groep 5–6 (spellingregels, woordsoorten, samenstellingen, synoniemen en tegenstellingen, alfabet, leestekens) en groep 7–8 (werkwoordspelling, zinsontleding, figuurlijk taalgebruik, leenwoorden, register). Eén hint per station, na elk antwoord een taaltip.":
   "building up step by step: ages 6–8 (sounds and letters, syllables, rhyme, capital letter and full stop; two pictures as answers and everything read aloud), ages 8–10 (spelling rules, word classes, compound words, synonyms and opposites, the alphabet, punctuation) and ages 10–12 (verb spelling, grammar, figurative language, loanwords, register). One hint per station, and a language tip after every answer.",
 "de woordsleutels in de goede volgorde tot een zin (hoofdletter vooraan, punt achteraan). Dan verschijnt de Letterdief, brengt de letters terug en krijgt het team een": "put the word keys in the right order to make a sentence (capital letter at the start, full stop at the end). Then the Letter Thief appears, brings the letters back and the team gets a",
 "diploma Woordspeurder": "Word Detective certificate", "(A4) met zijn zin erop.": "(A4) with his sentence on it.",
}, "meta": {
 "desc": "English literacy walk for ages 6–12 and after-school clubs: the Letter Thief has stolen letters from the school. At word stations around (or inside) the school, teams read, spell and build with real words from the neighbourhood: street signs, syllables, rhyme, compound words, word classes, punctuation. Three levels. Case code, leader's sheet with lesson plan, certificate.",
 "ld": "English literacy walk for primary school (ages 6–12) and after-school clubs: word stations in your own neighbourhood or in the school building, with real words from signs and shops. Three levels. Case code, leader's sheet with lesson plan, certificate."}},

"natuur": {"nl": "de-verdwenen-bijen.html", "en": "the-missing-bees.html", "id": "nt", "t": {
 "De verdwenen bijen – natuur-speurtocht voor school en BSO | MiniMystery Educatie": "The Missing Bees – a nature walk for school and after-school clubs | MiniMystery Education",
 "MiniMystery Educatie – De verdwenen bijen": "MiniMystery Education – The Missing Bees",
 "De bijenkast is leeg. Natuuronderzoek in je eigen buurt, voor groep 3–8 en BSO.": "The beehive is empty. Nature investigation in your own neighbourhood, for ages 6–12 and after-school clubs.",
 "De verdwenen bijen": "The Missing Bees",
 "MiniMystery Educatie · natuur · groep 3–8": "MiniMystery Education · nature · ages 6–12",
 "Geen gezoem. De kast is leeg.": "No buzzing. The hive is empty.",
 "De bijenkast achter de school is leeg: de bijen zijn vertrokken. Bijen blijven alleen waar genoeg bloemen, water en schuilplekken zijn. Dus klopt er iets niet in de buurt. Op natuurstations rond (of in) de school doen jullie echte waarnemingen: bloemen tellen, bomen herkennen, beestjes onder een steen, één minuut luisteren naar vogels, water, bodem, weer, zwerfafval, steen of groen. Elk station geeft een natuursleutel; alle sleutels op volgorde en de kringloop klopt.":
   "The beehive behind the school is empty: the bees have left. Bees only stay where there are enough flowers, water and places to shelter. So something is wrong in the neighbourhood. At nature stations around (or inside) the school you make real observations: counting flowers, recognising trees, minibeasts under a stone, one minute of listening to birds, water, soil, weather, litter, stone or green. Each station gives a nature key; put all the keys in order and the cycle is complete.",
 "bijv. De Natuurspeurders": "e.g. The Nature Detectives",
 "kijken en tellen": "looking and counting", "soorten, voedselketen": "species, food chain", "ecosysteem, %": "ecosystem, %",
 "De lege bijenkast": "The empty beehive", "Natuursleutels": "Nature keys", "Veldboekje": "Field notebook", "De kringloop": "The cycle",
 "Op weg naar het eerste station": "On the way to the first station",
 ": het verhaal, een lesbrief vooraf en achteraf per groep, alle stations met antwoorden, hints en weetjes.": ": the story, a lesson plan for before and after per age group, all stations with answers, hints and fun facts.",
 "Elk station is een echte waarneming:": "Each station is a real observation:",
 "bloemen tellen, de boom herkennen aan het blad, beestjes onder een steen, één minuut stil luisteren naar vogels, water zoeken, de bodem voelen, het weer meten zonder apparaten, zwerfafval tellen, dierensporen, het seizoen aflezen, schuilplekken, bestuiving, steen of groen in tien stappen, wie eet wie, en wat kun je zelf doen. Het team typt eerst wat het telde; de vervolgvraag rekent daarmee verder. Zo heeft elk team een andere uitkomst en kun je ze in de klas vergelijken.":
   "counting flowers, recognising a tree by its leaf, minibeasts under a stone, one minute of quiet listening to birds, looking for water, feeling the soil, measuring the weather without instruments, counting litter, animal tracks, reading the season, shelters, pollination, stone or green in ten steps, who eats whom, and what you can do yourself. The team first types what it counted; the follow-up question calculates with that. So every team gets a different result, and you can compare them in class.",
 "groep 3–4 (kijken, tellen, meer/minder; twee plaatjes als antwoord en alles voorgelezen), groep 5–6 (soorten herkennen, voedselketen, seizoenen, meten) en groep 7–8 (ecosysteem, kringlopen, biodiversiteit, percentages, oorzaak en gevolg). Eén hint per station, na elk antwoord een weetje.":
   "ages 6–8 (looking, counting, more/less; two pictures as answers and everything read aloud), ages 8–10 (recognising species, food chain, seasons, measuring) and ages 10–12 (ecosystem, cycles, biodiversity, percentages, cause and effect). One hint per station, and a fun fact after every answer.",
 "de begeleider kiest plekken in de school; de waarnemingen gebeuren dan aan het raam, bij planten in de klas of op het plein.": "the leader picks spots in the school; the observations then happen at the window, by plants in the classroom or in the playground.",
 "de natuursleutels op volgorde van de kringloop: zon → plant → dier → bodem. Klopt het, dan komt het gezoem terug en krijgt het team een": "put the nature keys in the order of the cycle: sun → plant → animal → soil. If it's right, the buzzing comes back and the team gets a",
 "diploma Natuurspeurder": "Nature Detective certificate",
 "Regels buiten: stenen terugleggen, niets plukken, beestjes laten leven, afval niet met blote handen oprapen. Teams blijven bij elkaar en op de stoep. Geen account, geen app: werkt in de browser.": "Outdoor rules: put stones back, don't pick anything, let minibeasts live, don't pick up litter with bare hands. Teams stay together and on the pavement. No account, no app: it works in the browser.",
}, "meta": {
 "desc": "Nature walk for ages 6–12 and after-school clubs: the beehive by the school is empty. At nature stations around (or inside) the school, teams make real observations: counting flowers, recognising trees, minibeasts under a stone, listening to birds, water, soil, weather, litter, animal tracks. Three levels. Case code, leader's sheet with lesson plan, certificate.",
 "ld": "Nature walk for primary school (ages 6–12) and after-school clubs: nature stations in your own neighbourhood or around the school building, with real observations and counts. Three levels. Case code, leader's sheet with lesson plan, certificate."}},

"klok": {"nl": "de-verdwenen-schoolklok.html", "en": "the-missing-school-clock.html", "id": "kl", "t": {
 "Het mysterie van de verdwenen schoolklok – MiniMystery Educatie voor school en BSO": "The Mystery of the Missing School Clock – MiniMystery Education for school and after-school clubs",
 "MiniMystery Educatie – Het mysterie van de verdwenen schoolklok": "MiniMystery Education – The Mystery of the Missing School Clock",
 "De schoolklok is weg. Een educatieve speurtocht rond de eigen school of BSO: zes letters, een hangslot, één plek.": "The school clock is gone. An educational walk around your own school or after-school club: six letters, a padlock, one place.",
 "Het mysterie van de verdwenen schoolklok": "The Mystery of the Missing School Clock",
 "MiniMystery Educatie · school &amp; BSO": "MiniMystery Education · school &amp; after-school",
 "De grote klok hangt er niet meer!": "The big clock isn't there any more!",
 "Vanmorgen was de schoolklok weg. Alleen een briefje bleef achter: zes letters wijzen de weg, de cijfers openen de deur. Op acht, tien of twaalf plekken rond jullie school of BSO ligt een zaak: tellen, lezen, kijken, nadenken. Teams van 4–6 kinderen, één telefoon per team.":
   "This morning the school clock was gone. Only a note was left behind: six letters show the way, the numbers open the door. At eight, ten or twelve spots around your school or after-school club there is a case: counting, reading, looking, thinking. Teams of 4–6 children, one phone per team.",
 "bijv. De Tijdspeurders": "e.g. The Clock Detectives",
 "8 plekken · ±35 min": "8 spots · ±35 min", "10 plekken · ±45 min": "10 spots · ±45 min", "12 plekken · ±60 min": "12 spots · ±60 min",
 "Binnen": "Indoors", "Het briefje": "The note", "Zaken": "Cases", "Letters en cijfers": "Letters and numbers", "Speurboekje": "Notebook", "Waar is de klok?": "Where is the clock?",
 "Op weg naar de eerste zaak": "On the way to the first case",
 "kies School of BSO, de leeftijd en de lengte (8, 10 of 12 plekken, allemaal binnen ongeveer 300 meter van de startplek). Start de zaak op je eigen telefoon: in de briefing staat de": "choose School or After-school, the age and the length (8, 10 or 12 spots, all within about 300 metres of the start). Start the case on your own phone: the briefing shows the",
 ". Elk team vult die code in (knop Zaakcode invullen) en krijgt precies dezelfde zaak. Onder de briefing staat het": ". Every team enters that code (button Enter a case code) and gets exactly the same case. Below the briefing is the",
 "met alle antwoorden en hints, om te printen.": "with all answers and hints, for printing.",
 "Met kaart:": "With map:", "Zonder kaart:": "Without map:", "Binnen:": "Indoors:",
 "meneer Tik prikt zaken op plekken in de buurt. De kinderen zien een": "Mr Tik pins cases on spots in the neighbourhood. The children see a",
 ": hun groepje loopt naar de volgende plek, zo ver als ze in het echt al dichterbij zijn, met een pijl en koud/warm/heet. De begeleider kan met de knop even de echte kaart bekijken.": ": their group walks towards the next spot, as far as they really got closer, with an arrow and cold/warm/hot. The leader can tap the button to look at the real map.",
 "de zaken komen achter elkaar; na elke zaak loopt het team zelf naar een nieuwe plek.": "the cases come one after another; after each case the team walks to a new spot by itself.",
 "lopen op de plaats met de telefoon in de hand.": "walking on the spot with the phone in your hand.",
 "Elke zaak": "Each case",
 "is een korte educatieve opdracht die bij de plek past: kennis op de plek (natuur, tijd, geschiedenis, geld), kijken en rekenen (ramen tellen, huisnummers, stappen meten), taal en lezen (straatnaambord, geheimschrift, spelling) en verkeer en veiligheid. Drie niveaus: 6–7, 8–9 en 10–12 jaar. In de BSO-modus hoort bij elke zaak eerst een beweegopdracht; in de schoolmodus staan de leerdoelen erbij.":
   "is a short educational task that fits the spot: knowledge about the place (nature, time, history, money), looking and counting (counting windows, house numbers, measuring steps), language and reading (street sign, secret code, spelling) and traffic and safety. Three levels: 6–7, 8–9 and 10–12 years. In After-school mode each case starts with a movement task; in School mode the learning goals are shown.",
 "Goed antwoord = een": "Right answer = a", "letter": "letter", "of een": "or a", "cijfer": "number",
 ". Eén hint per zaak. Eén foto-opdracht (de levende klok); de foto blijft op de telefoon.": ". One hint per case. One photo task (the living clock); the photo stays on the phone.",
 "Na alle zaken: de zes letters vormen de plek, de cijfers openen het hangslot. Dan de onthulling en een": "After all the cases: the six letters spell the place, the numbers open the padlock. Then the reveal and a",
 "diploma": "certificate", "(A4) met teamnaam.": "(A4) with the team name.",
}, "meta": {
 "desc": "Educational walk for school and after-school clubs: the school clock is gone. Eight, ten or twelve cases close together around your own school: looking, counting, reading, traffic and nature. With map, without map or indoors. Case code for all teams, leader's sheet with answers, certificate.",
 "ld": "Educational walk for primary school and after-school clubs: the school clock has disappeared. Eight to twelve cases around your own school about maths, language, nature and traffic. Case code for all teams, leader's sheet, certificate."}},
}

def build(g, cfg):
    s = open(cfg["nl"], encoding="utf-8").read()
    tr = dict(COMMON); tr.update(cfg["t"])
    miss = []
    def tx(t):
        k = t.strip()
        if not k or not re.search("[A-Za-z]", k): return t
        if k in tr:
            return t.replace(k, tr[k])
        miss.append(k); return t
    head, body = s[:s.index("<body>")], s[s.index("<body>"):]
    # body: tekst-nodes buiten <svg>/<script>
    parts = re.split(r'(<svg.*?</svg>|<script.*?</script>)', body, flags=re.S)
    for i, p in enumerate(parts):
        if p.startswith("<svg") or p.startswith("<script"): continue
        p = re.sub(r'>([^<>]+)<', lambda m: ">" + tx(m.group(1)) + "<", p)
        p = re.sub(r'((?:placeholder|aria-label|title)=")([^"]+)(")', lambda m: m.group(1) + tx(m.group(2)) + m.group(3), p)
        parts[i] = p
    body = "".join(parts)
    for a, b in SVG.items(): body = body.replace(">" + a + "</text>", ">" + b + "</text>")
    # head
    nl_url = "https://www.minimystery.nl/" + cfg["nl"]; en_url = "https://www.minimystery.nl/en/" + cfg["en"]
    head = head.replace('<html lang="nl">', '<html lang="en">')
    head = re.sub(r'<title>(.*?)</title>', lambda m: "<title>" + tx(m.group(1)) + "</title>", head)
    head = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + cfg["meta"]["desc"], head)
    head = re.sub(r'(<meta property="og:(?:title|description)" content=")([^"]*)', lambda m: m.group(1) + tx(m.group(2)), head)
    head = head.replace('content="nl_NL"', 'content="en_GB"')
    head = re.sub(r'<link rel="canonical"[^>]*>', '<link rel="canonical" href="%s">\n<link rel="alternate" hreflang="en" href="%s">\n<link rel="alternate" hreflang="nl" href="%s">\n<link rel="alternate" hreflang="x-default" href="%s">' % (en_url, en_url, nl_url, nl_url), head)
    head = head.replace('og:url" content="' + nl_url, 'og:url" content="' + en_url)
    def ld(m):
        j = json.loads(m.group(1))
        j["name"] = tx(j["name"]); j["url"] = en_url; j["description"] = cfg["meta"]["ld"]; j["inLanguage"] = "en"
        return '<script type="application/ld+json">' + json.dumps(j, ensure_ascii=False) + "</script>"
    head = re.sub(r'<script type="application/ld\+json">(.*?)</script>', ld, head, flags=re.S)
    out = head + body
    # paden en scripts
    out = re.sub(r'((?:src|href)=")(shared/|games/|assets/)', r'\1../\2', out)
    out = out.replace('href="educatie/"', 'href="education/"')
    out = re.sub(r'games/%s/data-nl\.js\?v=\d+' % g, 'games/%s/data-en.js?v=1' % g, out)
    out = re.sub(r'games/%s/game\.js\?v=\d+' % g, 'games/%s/game-en.js?v=1' % g, out)
    open(os.path.join("en", cfg["en"]), "w", encoding="utf-8").write(out)
    print(g, "->", "en/" + cfg["en"], "| niet vertaald:", sorted(set(miss)) or "-")

if __name__ == "__main__":
    for g in (sys.argv[1:] or GAMES):
        build(g, GAMES[g])
