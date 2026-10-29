# MiniMystery – landingspagina's rond zoekwoorden (thema, leeftijd, provincie).
# Draaien vanuit de map minimystery/:  python3 _tools/landing.py
# Maakt statische HTML (leesbaar voor Google zonder JavaScript) + werkt sitemap.xml bij.
# Alles wat op meerdere pagina's staat (prijs, spellen, opdrachten) staat hier één keer.
# Map _tools/ wordt door GitHub Pages niet gepubliceerd.
import html, json, re, os

SITE = "https://www.minimystery.nl/"
MAIL = "kellievandekerkhof@gmail.com"
PRICE = "€ 9,99"
e = html.escape

# ---------- de spellen ----------
G = {
 "sj": dict(t="De Lichtjesdief", slug="de-lichtjesdief.html", age=(6, 10), min="45–75", where="buiten of binnen",
    tag="Hij stal alle lichtjes van de straat. Vang hem op acht plekken en zie wie hij is.",
    tasks=["De Lichtjesdief vangen terwijl hij over het scherm flitst", "Met de zaklamp zijn schaduw vasthouden", "Raden wiens schaduw er op de muur staat",
           "Een groepsfoto met z'n allen de ogen dicht", "Zijn ogen in het donker terugvinden", "De lantaarn opladen door met z'n allen te tikken"]),
 "pp": dict(t="Het Geheim van Pony Pluis", slug="het-geheim-van-pony-pluis.html", age=(6, 9), min="40–60", where="buiten of binnen",
    tag="Pony Pluis is weg uit haar stal. Volg de hoefafdrukken en vraag het aan de dieren.",
    tasks=["Hoefafdrukken zoeken in het zand", "Pluis roskammen", "Appels tellen bij de appelkraam", "De kleuren van de halsters onthouden",
           "Dieren herkennen aan hun geluid", "Met z'n allen het hek van Kraai Karel openduwen"]),
 "ag": dict(t="Agent voor Eén Dag", slug="agent-voor-een-dag.html", age=(6, 10), min="40–60", where="buiten of binnen",
    tag="Alle straatnaamborden in de buurt zijn gestolen. Word agent en pak de dief.",
    tasks=["Een vingerafdruk afnemen", "Een compositietekening van de dief maken", "Een voetspoor vergelijken", "De sirene nadoen",
           "Een kenteken onthouden", "De dief aanwijzen bij de confrontatie en de handboeien om"]),
 "ts": dict(t="De Betoverde Toverspiegel", slug="de-betoverde-toverspiegel.html", age=(6, 9), min="45–80", where="binnen, in de tuin of in de auto",
    tag="De telefoon is de toverspiegel. Verzamel zeven ingrediënten en tover de prinses terug.",
    tasks=["Schudden voor sterrenstof", "Met de camera iets roods zoeken", "Een druppel door een doolhof kantelen", "De mist wegblazen",
           "Meeklappen op het ritme", "Een escape-room in de spiegelwereld"]),
 "gl": dict(t="Glitch in de Buurt", slug="glitch-in-de-buurt.html", age=(8, 12), min="35–80", where="buiten of binnen",
    tag="De buurt is de game. Elke plek een level, een eindbaas op het plein.",
    tasks=["Een platformer waarin je echt springt", "Een sluip-level met de microfoon", "Een AR-jacht met de camera", "Geheimschrift kraken",
           "Pixels herstellen", "De eindbaas verslaan door te kantelen en samen te klappen"]),
 "bs": dict(t="Backstage: De Verdwenen Setlist", slug="backstage-de-verdwenen-setlist.html", age=(8, 12), min="35–80", where="buiten of binnen",
    tag="Een uur voor de show is de setlist weg. Vind hem terug en geef dan zelf de show.",
    tasks=["Een dansje van de band nadoen", "Merch stylen", "De lichtshow nabouwen", "Tickets scannen met de camera",
           "Lipsyncen op de beat", "Aan het eind zelf de show geven, met de hele groep"]),
}

FACTS_BASE = [("🎟", "Prijs", PRICE + " per zaak (Feestpas, twee maanden onbeperkt). De proefronde is gratis."),
              ("👧", "Aantal kinderen", "Tot ongeveer 8 kinderen per telefoon. Meer kinderen? Maak groepjes met elk een telefoon en dezelfde zaakcode; aan het eind is er een teamstand."),]
NEED = ["Een smartphone met internet (iPhone of Android), opgeladen en met het geluid aan",
        "Buiten met kaart: GPS aan. Werkt de kaart niet, dan speel je dezelfde zaak zonder kaart verder",
        "Een volwassene die meeloopt en de telefoon vasthoudt of doorgeeft",
        "Geen app en geen account: je opent de zaak gewoon in de browser",
        "Optioneel: een printer voor het diploma, en een echte traktatie om te verstoppen (de laatste aanwijzing stuurt de kinderen erheen)"]
STEPS = [("Kies een zaak en probeer de proefronde", "Gratis, een paar minuten, op de bank. Dan weet iedereen hoe het werkt."),
         ("Koop de Feestpas en vul de code in", PRICE + " per zaak, direct na betaling. Twee maanden lang zo vaak spelen als je wilt."),
         ("Spelen!", "Buiten met kaart in je eigen buurt, buiten zonder kaart, of binnen. Aan het eind een diploma en een album met jullie foto's.")]

def age_txt(a): return "%d tot %d jaar" % a

# ---------- pagina's ----------
P = []
def page(slug, title, h1, desc, intro, games, facts=None, faq=None, extra="", kind="thema", region=None):
    P.append(dict(slug=slug, title=title, h1=h1, desc=desc, intro=intro, games=games, facts=facts or {}, faq=faq or [], extra=extra, kind=kind, region=region))

ALLWALK = ["sj", "pp", "ag", "gl", "bs"]
page("digitale-speurtocht-kinderfeestje.html",
  "Digitale speurtocht voor het kinderfeestje | MiniMystery",
  "Digitale speurtocht voor het kinderfeestje",
  "Een digitale speurtocht voor het kinderfeestje, gespeeld op je eigen telefoon. Voor 6 tot 12 jaar, 40 tot 75 minuten, € 9,99 per zaak. Proefronde gratis.",
  ["Een digitale speurtocht is een speurtocht die je op de telefoon speelt: de telefoon vertelt het verhaal, wijst de weg en geeft de opdrachten. Jij hoeft niets voor te bereiden, niets te printen en geen aanwijzingen te verstoppen.",
   "Bij MiniMystery kies je een zaak, zoals een dief vangen of een verdwenen pony terugvinden. De kinderen lossen samen puzzels op, verzamelen sporen en ontmaskeren aan het eind de dader. Lezen hoeft niet: de telefoon leest voor."],
  ALLWALK + ["ts"],
  faq=[("Heb ik een app nodig?", "Nee. Je opent de zaak in de browser van je telefoon. Er is geen account nodig."),
       ("Wat als de kaart of GPS niet werkt?", "Dan speel je dezelfde zaak zonder kaart verder: de opdrachten komen dan achter elkaar. Er gaat niets verloren."),
       ("Kunnen we het eerst proberen?", "Ja. Elke zaak heeft een gratis proefronde van een paar minuten.")])
page("detectivefeestje-kinderen.html",
  "Detectivefeestje voor kinderen: speurtocht met echte zaak | MiniMystery",
  "Detectivefeestje voor kinderen",
  "Een detectivefeestje met een echte zaak: sporen zoeken, getuigen horen en de dader ontmaskeren. Voor 6 tot 12 jaar, € 9,99 per zaak, op je eigen telefoon.",
  ["Op een detectivefeestje zijn de kinderen zelf de speurders. Ze volgen sporen in de buurt, horen getuigen (van wie er één liegt), verzamelen bewijs en wijzen aan het eind de dader aan.",
   "MiniMystery heeft drie detectivezaken: een politiezaak met vingerafdrukken en een confrontatie, een dief die alle lichtjes uit de straat stal, en een verdwenen pony met dieren als getuigen. Aan het eind krijgt de groep een diploma met hun eigen foto's."],
  ["ag", "sj", "pp", "bs"],
  faq=[("Is het niet te eng?", "Nee. Er vloeit geen bloed en niemand gaat dood: er is iets gestolen of iemand is zoek. Het blijft spannend, maar kindvriendelijk."),
       ("Kunnen kinderen die nog niet lezen meedoen?", "Ja. De telefoon leest alles voor, en bij Agent voor Eén Dag en Pony Pluis zijn de puzzels met plaatjes."),
       ("Hoe sluit het af?", "Met een ontmaskering of confrontatie, een diploma om te printen en een album met de foto's van de groep.")])
page("speurtocht-in-eigen-buurt.html",
  "Speurtocht in je eigen buurt voor het kinderfeestje | MiniMystery",
  "Speurtocht in je eigen buurt",
  "Een speurtocht die zich aanpast aan jouw straat: de telefoon legt de plekken in je eigen buurt. Overal in Nederland, 0 tot 2 km lopen, € 9,99 per zaak.",
  ["Je hoeft nergens heen: de speurtocht komt naar jou. Als je start, zoekt de telefoon plekken bij jou in de buurt, zoals een bankje, een speeltuin, de kerk of de bushalte, en legt daar de sporen neer.",
   "De kinderen zien een getekende speelkaart in de stijl van het verhaal, met jullie groepje dat meeloopt via GPS. Een pijl en koud/warm/heet wijzen de weg. De begeleider kan met één knop de echte plattegrond bekijken."],
  ALLWALK,
  facts={"Afstand": "0 tot 2 km, in de buurt van je huis of een andere startplek."},
  faq=[("Werkt het overal in Nederland?", "Ja. De plekken komen uit de openbare kaart van jouw buurt. In een stad, een dorp of een nieuwbouwwijk."),
       ("Is het veilig?", "Je blijft op de stoep en een volwassene loopt mee. De plekken zijn gewone, openbare plekken."),
       ("Wat als er weinig plekken in de buurt zijn?", "Dan vult de telefoon aan met hoeken van straten. Of je speelt zonder kaart.")])
page("indoor-speurtocht-kinderfeestje.html",
  "Regenproof kinderfeestje: indoor speurtocht | MiniMystery",
  "Regenproof kinderfeestje: een speurtocht binnen",
  "Regent het op het feest? Elke MiniMystery-zaak kun je ook binnen spelen, en De Betoverde Toverspiegel is speciaal voor binnen. € 9,99 per zaak, proefronde gratis.",
  ["Slecht weer hoeft het feest niet te verpesten. Alle zaken van MiniMystery hebben een binnenstand: de kinderen lopen op de plaats met de telefoon in de hand, en elke stap brengt ze dichter bij het volgende spoor op de speelkaart.",
   "De Betoverde Toverspiegel is helemaal voor binnen gemaakt: de telefoon is een toverspiegel die de kring rondgaat, met schud-, blaas- en kantelopdrachten, een fotojacht door het huis en een escape-room."],
  ["ts", "pp", "ag", "sj", "gl", "bs"],
  facts={"Waar": "In de woonkamer, de gang, de garage of de tuin. Ook in de auto (Toverspiegel)."},
  faq=[("Hoeveel ruimte heb ik nodig?", "Niet veel. Een woonkamer is genoeg. Bij de binnenstand loop je op de plaats."),
       ("Kan ik binnen en buiten combineren?", "Ja. Bij de Toverspiegel kies je 'binnen + buiten'. Bij de speurtochten kun je beginnen binnen en daarna verder buiten, of andersom, met dezelfde zaakcode."),
       ("Werkt het zonder internet?", "Je hebt internet nodig om de zaak te openen. Tijdens het spelen is weinig data nodig.")])
# leeftijd
page("speurtocht-kinderfeestje-6-jaar.html",
  "Speurtocht kinderfeestje 6 en 7 jaar | MiniMystery",
  "Speurtocht voor het kinderfeestje van 6 of 7 jaar",
  "Een speurtocht voor 6 en 7 jaar: de telefoon leest alles voor, puzzels met plaatjes, 40 tot 60 minuten. € 9,99 per zaak, proefronde gratis.",
  ["Op 6 en 7 jaar kunnen kinderen nog niet allemaal goed lezen, en een plattegrond zegt ze nog weinig. Daarom leest de telefoon alles voor, zijn de puzzels met plaatjes en zien de kinderen een getekende speelkaart met een pijl en koud/warm/heet.",
   "Kies het makkelijke niveau (Veulen, Junior agent of Makkelijk) en de korte lengte van 5 plekken (ongeveer een half uur) als de groep klein of jong is."],
  ["pp", "ag", "sj", "ts"],
  facts={"Leeftijd": "6 en 7 jaar (makkelijk niveau)", "Duur": "Kort: ± 30 min (5 plekken). Normaal: ± 50 min (8 plekken)."},
  faq=[("Is het niet te moeilijk?", "Nee. Op het makkelijke niveau zijn de puzzels kort en met plaatjes, en drie hartjes per puzzel zorgen dat niemand vastloopt: zijn ze op, dan begin je gewoon opnieuw."),
       ("Moet er een volwassene mee?", "Ja. Eén volwassene houdt de telefoon vast of geeft hem door, en let op het verkeer.")], kind="leeftijd")
page("speurtocht-kinderfeestje-8-jaar.html",
  "Speurtocht kinderfeestje 8 jaar | MiniMystery",
  "Speurtocht voor het kinderfeestje van 8 jaar",
  "Een speurtocht voor 8 jaar: videogame-levels, een setlist-mysterie of een politiezaak in je eigen buurt. 35 tot 80 minuten, € 9,99 per zaak.",
  ["Op 8 jaar willen kinderen uitdaging. Ze lezen zelf, denken mee en willen niet dat het 'voor kleintjes' voelt. Daarom zijn er twee zaken speciaal vanaf 8 jaar: Glitch in de Buurt, waarin elke plek een level is met een eindbaas, en Backstage, waarin de groep de crew van een meidenband is.",
   "Ook de politiezaak en De Lichtjesdief werken goed op 8 jaar: kies dan het pittige niveau (Rechercheur of Pittig) en de normale of lange lengte."],
  ["gl", "bs", "ag", "sj"],
  facts={"Leeftijd": "8 en 9 jaar", "Duur": "Normaal: ± 55 min (8 plekken). Lang: ± 80 min (11 plekken)."},
  faq=[("Welke zaak voor jongens en welke voor meiden?", "Ze zijn voor iedereen. Glitch is een videogame, Backstage draait om een meidenband en een show, Agent om een politiezaak. Kies wat bij de jarige past."),
       ("Kunnen we met twee teams tegen elkaar?", "Ja. Twee telefoons, dezelfde zaakcode en een teamkleur via Feestopties. Aan het eind vergelijk je de tijden.")], kind="leeftijd")
page("speurtocht-kinderfeestje-10-jaar.html",
  "Speurtocht kinderfeestje 10, 11 en 12 jaar | MiniMystery",
  "Speurtocht voor het kinderfeestje van 10 tot 12 jaar",
  "Een speurtocht voor 10 tot 12 jaar: moeilijke levels, een team-tegen-team mysterie en een eindbaas. 55 tot 80 minuten, € 9,99 per zaak.",
  ["Vanaf 10 jaar kies je het moeilijkste niveau en de lange lengte. Glitch in de Buurt heeft een stand voor gamers met strakkere timers, en Backstage op Superster laat de setlist-snippers een puzzel worden. Bij De Lichtjesdief liegt de dief één keer, en moet je uitzoeken welke keer.",
   "Grotere groep? Speel team tegen team: elk team een telefoon met dezelfde zaakcode, en aan het eind een teamstand."],
  ["gl", "bs", "sj"],
  facts={"Leeftijd": "10 tot 12 jaar (moeilijk niveau)", "Duur": "Lang: ± 75 tot 80 min (11 plekken)."},
  faq=[("Is het niet te kinderachtig voor 11 of 12 jaar?", "Kies dan Glitch in de Buurt op Hard of Backstage op Superster. Wil je iets voor nog ouder? Kijk dan bij onze zusterwebsite voor volwassenen, Moordwandeling."),
       ("Kan het langer?", "De lange stand duurt ongeveer 80 minuten. Voor een speurtocht op maat, bijvoorbeeld voor een schoolkamp, kun je mailen.")], kind="leeftijd")

# ---------- provincies (elk met eigen tekst; plekken = grote plaatsen en typische omgeving) ----------
PROV = [
 ("noord-brabant", "Noord-Brabant", "Brabant", "Eindhoven, Tilburg, Breda, 's-Hertogenbosch en Helmond", "van de binnenstad van Eindhoven tot de dorpspleinen in de Kempen en de Meierij",
  "De gratis proefronde van elke zaak speelt zich zelfs af in het centrum van Eindhoven, op een getekende kaart."),
 ("zuid-holland", "Zuid-Holland", None, "Rotterdam, Den Haag, Leiden, Dordrecht en Zoetermeer", "van de stadsparken in Rotterdam en Den Haag tot de dorpen in het Groene Hart",
  "In drukke stadswijken is de binnenstand of buiten zonder kaart handig voor wie liever niet oversteekt."),
 ("noord-holland", "Noord-Holland", None, "Amsterdam, Haarlem, Zaanstad, Alkmaar en Hilversum", "van de pleintjes in Amsterdam tot de dorpen in West-Friesland en aan de kust",
  "In een stad met veel grachten en bruggen kiest de telefoon plekken aan jouw kant van het water waar het kan; de begeleider ziet de echte plattegrond."),
 ("utrecht", "Utrecht", None, "Utrecht, Amersfoort, Veenendaal, Nieuwegein en Zeist", "van de wijken van Leidsche Rijn tot de dorpen op de Heuvelrug",
  "Nieuwbouwwijken met speeltuinen en pleintjes zijn ideaal: de plekken liggen dicht bij elkaar."),
 ("gelderland", "Gelderland", None, "Arnhem, Nijmegen, Apeldoorn, Ede en Zutphen", "van de stadswijken in Nijmegen en Arnhem tot de dorpen op de Veluwe en in de Achterhoek",
  "In een dorp met wat minder plekken vult de telefoon aan met straathoeken; de korte lengte van 5 plekken past dan goed."),
 ("overijssel", "Overijssel", None, "Enschede, Zwolle, Deventer, Hengelo en Almelo", "van de binnenstad van Zwolle tot de dorpen in Twente en Salland", ""),
 ("limburg", "Limburg", None, "Maastricht, Venlo, Heerlen, Sittard en Roermond", "van de pleinen in Maastricht tot de heuveldorpen in Zuid-Limburg",
  "Heuvelachtig? Kies de korte lengte, dan blijft de tocht rond de 1 km."),
 ("groningen", "Groningen", None, "Groningen, Hoogezand, Veendam, Delfzijl en Winschoten", "van de wijken in de stad Groningen tot de wierdedorpen op het platteland", ""),
 ("friesland", "Friesland", None, "Leeuwarden, Sneek, Heerenveen, Drachten en Harlingen", "van de binnenstad van Leeuwarden tot de dorpen aan de meren", ""),
 ("drenthe", "Drenthe", None, "Assen, Emmen, Hoogeveen, Meppel en Coevorden", "van de wijken in Assen en Emmen tot de brinkdorpen", "Een brinkdorp met een groot dorpsplein is een mooie startplek."),
 ("flevoland", "Flevoland", None, "Almere, Lelystad, Dronten, Zeewolde en Emmeloord", "van de wijken in Almere tot de polderdorpen", "De ruime nieuwbouwwijken met veel speelplekken maken Flevoland een fijne speurtochtprovincie."),
 ("zeeland", "Zeeland", None, "Middelburg, Vlissingen, Goes, Terneuzen en Zierikzee", "van de binnenstad van Middelburg tot de dorpen op de eilanden", "Een feestje bij het strand of op de camping? Speel dan buiten zonder kaart of binnen."),
]
for key, name, alias, cities, range_, tip in PROV:
    alias_txt = (" (" + alias + ")") if alias else ""
    kw = alias or name
    page("speurtocht-kinderfeestje-%s.html" % key,
      "Speurtocht kinderfeestje %s | MiniMystery" % kw,
      "Speurtocht voor het kinderfeestje in %s" % kw,
      "Een speurtocht voor het kinderfeestje in %s%s, in je eigen straat of binnen. In %s en elk dorp. 6 tot 12 jaar, € 9,99 per zaak." % (name, alias_txt, cities.split(",")[0]),
      ["Zoek je een speurtocht voor het kinderfeestje in %s%s? Met MiniMystery speel je hem in je eigen buurt: de telefoon zoekt plekken bij jou in de straat en legt daar de sporen neer. Dat werkt in %s, maar net zo goed in een dorp of nieuwbouwwijk, %s." % (name, alias_txt, cities, range_),
       "Je hoeft dus nergens heen te rijden en niets te reserveren: openen, Feestpas-code invullen en starten. Regent het? Dan speel je dezelfde zaak binnen." + ((" " + tip) if tip else "")],
      ["sj", "pp", "ag", "gl", "bs", "ts"], kind="regio", region=name,
      faq=[("Komen jullie langs?", "Nee, je speelt zelf met je eigen telefoon. Wil je een speurtocht op maat voor een school, buurtfeest of bedrijf in %s? Mail dan, dan kijken we samen wat kan." % name),
           ("Werkt het ook in een klein dorp?", "Ja. Zijn er weinig plekken, dan vult de telefoon aan met straathoeken, of je kiest de korte lengte of de binnenstand.")])
page("speurtocht-kinderfeestje-per-provincie.html",
  "Speurtocht kinderfeestje per provincie | MiniMystery",
  "Speurtocht voor het kinderfeestje, in elke provincie",
  "MiniMystery werkt in heel Nederland: de speurtocht legt de plekken in je eigen buurt. Kies je provincie. 6 tot 12 jaar, € 9,99 per zaak.",
  ["Een MiniMystery-speurtocht is niet gebonden aan één stad. De telefoon zoekt bij de start plekken bij jou in de buurt, dus je speelt hem waar je woont: in de stad, in een dorp of op een vakantieadres.",
   "Hieronder vind je per provincie meer uitleg en tips."],
  [], kind="overzicht")

# ---------- opmaak ----------
CSS = """
.lp{max-width:860px;margin:0 auto;padding:0 16px 30px}
.lp .crumb{font:600 13px Nunito,sans-serif;color:var(--soft);margin:14px 0 6px}.lp .crumb a{color:var(--soft)}
.lp h1{font:600 clamp(27px,5vw,40px)/1.15 Fredoka,sans-serif;color:var(--navy);margin:6px 0 10px}
.lp .intro p{font-size:17px;line-height:1.6;margin:0 0 12px}
.lp .facts2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0 8px}@media(max-width:620px){.lp .facts2{grid-template-columns:1fr}}
.lp .facts2 div{background:#fff;border:2px solid var(--line);border-radius:16px;padding:12px 14px}.lp .facts2 b{display:block;font:600 13px Fredoka,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--violet)}
.lp .facts2 span{font-size:15px;line-height:1.45}
.lp h2{text-align:left;margin:30px 0 10px}
.lp .gl{display:grid;gap:12px;grid-template-columns:1fr 1fr}@media(max-width:620px){.lp .gl{grid-template-columns:1fr}}
.lp .gc{display:flex;gap:12px;background:#fff;border:2px solid var(--line);border-radius:18px;padding:12px}
.lp .gc img{width:84px;height:84px;border-radius:50%;object-fit:cover;flex:0 0 84px;border:3px solid #fff;box-shadow:0 4px 12px -4px rgba(27,37,80,.5)}
.lp .gc h3{margin:0 0 2px;font:600 18px Fredoka,sans-serif;color:var(--navy)}.lp .gc p{margin:0 0 6px;font-size:14px;line-height:1.4;color:var(--soft)}
.lp .gc .m{font:600 13px Nunito,sans-serif;color:var(--ink)}.lp .gc .a{display:flex;gap:10px;margin-top:6px;flex-wrap:wrap}.lp .gc .a a{font:700 14px Nunito,sans-serif;color:var(--navy)}
.lp ul.ck{padding-left:0;list-style:none}.lp ul.ck li{position:relative;padding-left:28px;margin:0 0 8px;line-height:1.45}.lp ul.ck li:before{content:"✓";position:absolute;left:4px;color:var(--violet);font-weight:800}
.lp ul.ex{columns:2;column-gap:24px;padding-left:20px}@media(max-width:620px){.lp ul.ex{columns:1}}.lp ul.ex li{margin:0 0 6px;break-inside:avoid}.lp ul.ex small{color:var(--soft)}
.lp ol.st{padding-left:0;list-style:none;counter-reset:s}.lp ol.st li{counter-increment:s;position:relative;padding-left:44px;margin:0 0 12px}.lp ol.st li:before{content:counter(s);position:absolute;left:0;top:0;width:32px;height:32px;border-radius:50%;background:var(--gold);color:var(--ink);font:700 16px Fredoka,sans-serif;display:flex;align-items:center;justify-content:center}
.lp ol.st b{display:block}
.lp details{background:#fff;border:2px solid var(--line);border-radius:14px;padding:10px 14px;margin:0 0 8px}.lp summary{cursor:pointer;font-weight:700}
.lp .cta2{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}.lp .cta2 .btn{flex:1 1 220px;text-align:center}
.lp .rel{display:flex;flex-wrap:wrap;gap:8px}.lp .rel a{background:#fff;border:1.5px solid var(--line);border-radius:999px;padding:6px 12px;font:600 14px Nunito,sans-serif;color:var(--navy);text-decoration:none}
.lp .prov{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}@media(max-width:620px){.lp .prov{grid-template-columns:1fr 1fr}}.lp .prov a{background:#fff;border:2px solid var(--line);border-radius:14px;padding:12px;text-align:center;font:600 16px Fredoka,sans-serif;color:var(--navy);text-decoration:none}
.lp .custom{margin-top:8px}
.lptop{display:flex;align-items:center;justify-content:space-between;max-width:860px;margin:0 auto;padding:12px 16px}.lptop img{height:42px;width:auto;max-width:60vw}.lptop a.btn{padding:8px 14px;font-size:15px}
"""

def game_card(k):
    g = G[k]
    return ('<div class="gc"><img src="assets/cover-%s.webp" alt="" width="84" height="84" loading="lazy"><div><h3>%s</h3><p>%s</p>'
            '<div class="m">%s · %s min · %s</div><div class="a"><a href="%s">Bekijk de zaak →</a><a href="%s?oefen">Gratis proefronde</a></div></div></div>') % (
        k, e(g["t"]), e(g["tag"]), age_txt(g["age"]), g["min"], e(g["where"]), g["slug"], g["slug"])

def facts(p):
    gs = [G[k] for k in p["games"]] or list(G.values())
    a0 = min(g["age"][0] for g in gs); a1 = max(g["age"][1] for g in gs)
    mins = [int(x) for g in gs for x in re.findall(r"\d+", g["min"])]
    d = {"Leeftijd": "%d tot %d jaar" % (a0, a1), "Duur": "%d tot %d minuten, afhankelijk van de lengte die je kiest (5, 8 of 11 plekken)." % (min(mins), max(mins)),
         "Waar": "Buiten in je eigen buurt (met of zonder kaart) of binnen."}
    d.update(p["facts"])
    rows = [("🎟", "Prijs", FACTS_BASE[0][2]), ("🎂", "Leeftijd", d["Leeftijd"]), ("⏱", "Duur", d["Duur"]), ("👧", "Aantal kinderen", FACTS_BASE[1][2]), ("📍", "Waar", d["Waar"])]
    if "Afstand" in d: rows.append(("👟", "Afstand", d["Afstand"]))
    return '<div class="facts2">' + "".join('<div><b>%s %s</b><span>%s</span></div>' % (i, e(t), e(v)) for i, t, v in rows) + '</div>'

def examples(p):
    ks = p["games"] or list(G)
    out = []
    for k in ks:
        for t in G[k]["tasks"][:3]:
            out.append('<li>%s <small>(%s)</small></li>' % (e(t), e(G[k]["t"])))
    return '<ul class="ex">' + "".join(out[:12]) + '</ul>'

def related(cur):
    pick = [q for q in P if q["slug"] != cur["slug"] and q["kind"] in ("thema", "leeftijd")]
    if cur["kind"] == "regio": pick = [q for q in P if q["kind"] == "overzicht"] + pick
    return '<div class="rel">' + "".join('<a href="%s">%s</a>' % (q["slug"], e(q["h1"])) for q in pick) + '</div>'

def custom(region=None):
    subj = "Speurtocht op maat via MiniMystery" + (" (" + region + ")" if region else "")
    body = "Hoi Kellie,%0A%0AIk zoek een speurtocht op maat.%0A%0AVoor wie en hoeveel kinderen: %0ALeeftijd: %0AWaar (adres of buurt): %0AWanneer: %0AWat ik in gedachten heb: %0A%0AGroet,%0A"
    return ('<h2>Speurtocht op maat</h2><div class="custom"><p>Een speurtocht met de namen van de kinderen erin, rond jullie school of straat%s, voor een schoolkamp, buurtfeest of bedrijfsuitje? Mail wat je in gedachten hebt, dan hoor je snel wat er kan. Prijs in overleg.</p>'
            '<a class="btn" href="mailto:%s?subject=%s&body=%s">✉️ Mail je idee</a><p class="note">Liever bellen? Zet je nummer in de mail, dan bel ik terug.</p></div>') % (
        (" in " + region) if region else "", MAIL, subj.replace(" ", "%20"), body)

def render(p):
    url = SITE + p["slug"]
    faq = p["faq"] + [("Wat kost het?", "Een zaak kost %s. Daarmee speel je die zaak twee maanden lang zo vaak je wilt. De proefronde is gratis." % PRICE),
                      ("Hoeveel kinderen kunnen meedoen?", FACTS_BASE[1][2])]
    ld = [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]},
          {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "MiniMystery", "item": SITE}, {"@type": "ListItem", "position": 2, "name": p["h1"], "item": url}]}]
    if p["games"]:
        ld.append({"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": G[k]["t"], "url": SITE + G[k]["slug"]} for i, k in enumerate(p["games"])]})
    body = []
    body.append('<div class="intro">' + "".join("<p>%s</p>" % e(x) for x in p["intro"]) + '</div>')
    if p["kind"] == "overzicht":
        body.append('<div class="prov">' + "".join('<a href="%s">%s</a>' % (q["slug"], e(q["region"])) for q in P if q["kind"] == "regio") + '</div>')
    else:
        body.append(facts(p))
        body.append('<div class="cta2"><a class="btn" href="index.html#cases">Kies een zaak</a><a class="btn ghost" href="%s?oefen">Eerst gratis proberen</a></div>' % G[p["games"][0]]["slug"])
        body.append('<h2>Welke zaak past?</h2><div class="gl">' + "".join(game_card(k) for k in p["games"]) + '</div>')
        body.append('<h2>Voorbeeldopdrachten</h2>' + examples(p))
        body.append('<h2>Wat heb je nodig?</h2><ul class="ck">' + "".join("<li>%s</li>" % e(x) for x in NEED) + '</ul>')
        body.append('<h2>Zo werkt het</h2><ol class="st">' + "".join("<li><b>%s</b>%s</li>" % (e(a), e(b)) for a, b in STEPS) + '</ol>')
    body.append('<h2>Veelgestelde vragen</h2>' + "".join("<details><summary>%s</summary><p>%s</p></details>" % (e(q), e(a)) for q, a in faq))
    body.append(custom(p["region"]))
    body.append('<h2>Meer ideeën</h2>' + related(p))
    return """<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>%(title)s</title>
<meta name="description" content="%(desc)s">
<link rel="canonical" href="%(url)s">
<link rel="icon" href="assets/favicon.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<meta property="og:site_name" content="MiniMystery">
<meta property="og:title" content="%(title)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:type" content="website">
<meta property="og:url" content="%(url)s">
<meta property="og:image" content="%(site)sassets/og-image.jpg">
<meta property="og:locale" content="nl_NL">
<meta name="theme-color" content="#f5b800">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;700;800&display=swap">
<link rel="stylesheet" href="shared/hub.css?v=7">
<style>%(css)s</style>
<script type="application/ld+json">%(ld)s</script>
</head>
<body>
<header class="lptop"><a href="index.html"><img src="assets/logo-wide.webp" alt="MiniMystery" width="1222" height="378"></a><a class="btn" href="index.html#cases">Alle zaken</a></header>
<main class="lp">
<div class="crumb"><a href="index.html">MiniMystery</a> › %(h1)s</div>
<h1>%(h1)s</h1>
%(body)s
</main>
<footer class="foot">
  <img src="assets/logo-mark-wink.webp" alt="" width="576" height="472" loading="lazy">
  <p>Gemaakt in Nederland, met liefde voor speurneuzen.</p>
  <a class="adult" href="https://www.moordwandeling.nl/nl/">Voor volwassenen: Moordwandeling →</a>
  <div class="links"><a href="mailto:%(mail)s">Contact</a><a href="speurtocht-kinderfeestje-per-provincie.html">Per provincie</a></div>
</footer>
</body>
</html>
""" % dict(title=e(p["title"]), desc=e(p["desc"]), url=url, site=SITE, css=CSS, ld=json.dumps(ld, ensure_ascii=False), h1=e(p["h1"]), body="\n".join(body), mail=MAIL)

for p in P:
    open(p["slug"], "w").write(render(p))

# ---------- sitemap ----------
sm = open("sitemap.xml").read()
sm = re.sub(r"\s*<url><loc>[^<]*</loc><!--lp--></url>", "", sm)
add = "".join("\n  <url><loc>%s%s</loc><!--lp--></url>" % (SITE, p["slug"]) for p in P)
sm = sm.replace("</urlset>", add + "\n</urlset>")
open("sitemap.xml", "w").write(sm)
print(len(P), "pagina's")
