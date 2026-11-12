# Moordwandeling / Murder Walk – platform

Statische site voor GitHub Pages, geen build-stap. Draait sinds 30 okt 2026 op www.enigmamystery.com/wandel/ (EN in de map, NL onder /wandel/nl/). moordwandeling.nl en murderwalk.com sturen door, inclusief opgeslagen voortgang en codes (?mwimport=).

```
/index.html                  hub EN (op moordwandeling.nl stuurt hij door naar /nl/)
/nl/index.html               hub NL
/murder-walk.html            spel 1 EN        /nl/moordwandeling.html   spel 1 NL   (eigen, oudere motor; staat compleet in het bestand; startscherm tekent de sfeerfoto assets/mw-hero.webp in het canvas)
/the-vanishing.html          spel 2 EN        /nl/de-verdwijning.html   spel 2 NL   (shell; logica in /games/vanishing/)
/till-death-do-us-part.html  spel 3 EN        /nl/tot-de-dood-ons-scheidt.html  spel 3 NL (shell; logica in /games/bride/)
/games/bride/                game.js (zelfde motor als vanishing: zes gasten, motief, de bruid als schim) · data-nl.js · data-en.js · game.css · hero.webp (sfeerfoto, uitsnede zonder titel) · portrait.webp; gebruikt games/vanishing/puzzles.js. Eigen sfeer naar de sfeerfoto (natte nacht, lantaarnlicht, ivoor, dieprode rozenblaadjes; Cinzel + Cormorant Garamond), eigen pictogrammen (IC in game.js), getekende figuren (bride/witness) en eigen kaartkleuren via createMap({theme})
/eyewitness.html             spel 4 EN        /nl/ooggetuige.html   spel 4 NL (shell; logica in /games/witness/)
/night-of-the-ghosts.html     spel 7 EN        /nl/de-nacht-van-de-geesten.html   spel 7 NL (shell; logica in /games/ghosts/)
/games/witness/              thriller op de motor van vanishing: berichten van ‘Onbekend’ per punt, achtervolger op je eigen spoor, twee antwoorden (wie volgt je, wie vertrouw je) · data-nl.js · data-en.js · game.css · hero.webp
/unsolved.html               spel 5 EN        /nl/onopgelost.html   spel 5 NL (shell; logica in /games/coldcase/)
/games/coldcase/             cold case op de motor van vanishing: dossier van 22 jaar terug ({Y} wordt bij het laden ingevuld), zes namen, toen/nu per plek (THEN), papieren kaart met rode draad, figuren uit het verleden · data-nl.js · data-en.js · game.css · hero.webp
/the-last-bus.html           spel 6 EN        /nl/de-laatste-bus.html   spel 6 NL (shell; logica in /games/lastbus/)
/games/lastbus/              vermissing op de motor van vanishing: je zoekt een plek en een reden; zes plekken met vaste eigenschappen (CONTACTS), drie zekerheden die vervallen (TWIST), lijnfilm-stijl · data-nl.js · data-en.js · game.css · hero.webp
/games/vanishing/            game.js (logica, taalonafhankelijk) · data-nl.js · data-en.js · game.css · hero.webp (sfeerfoto, uitsnede zonder titel; eigen sfeer, figuren en rode routelijn)
/the-gamemakers-legacy.html  speurtocht EN   /nl/de-erfenis-van-de-spellenmaker.html   speurtocht NL (shell; logica in /games/spellenmaker/)
/games/spellenmaker/         speurtocht van ± 2 uur op de wandelmotor: tien vakken met elk een kist in 3D, een spel en een schim door de camera. Zie “De Erfenis van de Spellenmaker” hieronder
/shared/platform.js          gedeelde laag: Pro, groepspas, codes.json, profiel (rang/punten/streak), taal, instellingen (SS_PRO)
/shared/walk.js              wandelmotor voor nieuwe spellen: OpenStreetMap/Overpass, plekken kiezen, nachtkaart, gps, oefenwereld, vellen/geluid
/shared/steps.js             binnen-stand: stappen tellen met de bewegingssensor (devicemotion) of lopen op tempo, scherm aan houden. Nu in gebruik bij games/bride (keuze Buiten/Binnen op het startscherm, G.mode "in", teksten in D.IN); de keuze staat in `ss_where`
/shared/catalog.js           catalogus (categorieën + spellen) voor beide hubs
/shared/platform.css         gedeelde stijl   · /shared/hub.css + hub.js  hub
/codes.json  /codes.html     één codelijst voor het hele platform (codes.html staat op noindex en in robots.txt op Disallow)
/sitemap.xml /robots.txt /404.html
```

## Gedeelde voortgang
Alles staat in `localStorage` onder `ss_*`, per domein gedeeld tussen alle pagina's. Bestaande keys zijn ongewijzigd
(`ss_prof`, `ss_proH`, `ss_grp`, `ss_grpU`, `ss_codes`, `ss_free`, `ss_lang`, `ss_snd`, `ss_map`, `ss_game`/`ss_game_en`, …):
bestaande Pro-kopers en groepscodes blijven werken, er is geen migratie nodig. Nieuwe spellen gebruiken `ss_game_<id>_<taal>` en `ss_free_<id>`
(eerste zaak per spel gratis), en loggen hun resultaten in `ss_prof.games.<id>`. Rang, punten en dagstreak zijn platformbreed.

## Oude links
`/#z=…` en `/#g=…` (zaakcodes en groepslinks van vóór het platform) worden door de hub doorgestuurd naar het juiste spel; `#z=VZ…` naar De Verdwijning, `#z=TD…` naar Tot de Dood Ons Scheidt, `#z=OG…` naar Ooggetuige, `#z=CC…` naar Onopgelost, `#z=LB…` naar De Laatste Bus.

## Nieuw spel toevoegen
1. Object toevoegen in `shared/catalog.js` (id, categorie, status, slugs/titels per taal).
2. Twee HTML-shells (EN in de root, NL onder `/nl/`) met SEO-head, die `platform.js`, `catalog.js`, `walk.js`, je data-bestand en je game.js laden. `games/vanishing/` is het voorbeeld.
3. Twee `<url>`-blokken in `sitemap.xml`, en als het spel zaakcodes deelt: een regel in de hub-doorsturing (`index.html`, `nl/index.html`, `404.html`).
4. In het spel: `MW.pro.locked("<id>")`, `MW.pro.setFree("<id>")`, `MW.profile.award({game:"<id>",…})`, `MW.proHTML/bindPro` voor het Pro-paneel.

## De Erfenis van de Spellenmaker (`sm`)
Eigen categorie `quest` (Speurtocht) in de catalogus. Tien vakken; elk vak is kist (3D-raadsel) → spel → schim (camera) → nieuw bewijs in het dossier. Vak 10 is de finale met drie sloten en het eindoordeel (wie, hoe, waarom en een bonusvraag). Tussen de vakken liggen zes losse speelstukken om met de camera te vangen.

```
game.js      verloop, kaart, dossier, fiches (hints kosten fiches), speelkast, Speelkamer (gewonnen spellen opnieuw spelen)
data-nl.js   alle tekst: verhaal, tien vakken (CH), kistcodes, verdachten (SUS), eindoordeel (V), uitleg
data-en.js   dezelfde sleutels in het Engels. Twee kistraadsels wijken af (letters op de hendels van vak 4: R Y B G W; het woord achterop kist 5: LUCK). Bewijsstukken met tekst in het beeld gebruiken Engelse varianten (ev-*-en)
kist.js      SM_KIST: de kist in 3D (three.js) met rolletjes, dobbelstenen, knoppen, hendels en verborgen zijden; zonder WebGL een platte variant
lens.js      SM_LENS: schimmen en speelstukken door de camera (zelfde aanpak als games/ghosts), met getekend straatbeeld als de camera uit staat
spel-a.js    legpuzzel (jig), Drie Torens (torens), knikkers op een rij (knikkers)
spel-b.js    zoek de verschillen (verschil), Stenenrij (stenen), mahjong
spel-c.js    uurwerk (buizen draaien), vier op een rij tegen Meneer Zet (vier), kogelbaan met kantelen (kogel)
three.min.js three.js r149, wordt pas geladen als de speurtocht start (niet op het startscherm)
img/         beelden (webp): hero, por-* (portretten), foto (legpuzzel), trap-voor/trap-na (verschillen), ev-* (bewijsstukken), stuk-* (speelstukken), meneer-zet. Geladen via SM_GAMES.pic(naam, cb); zolang een beeld er niet is, tekent de code de oude versie
```

- Drie standen op het startscherm: Buiten (gps), Binnen (stappen via `shared/steps.js`) en Op de bank (alles met tikken, geen lopen). De keuze staat in `ss_sm_where`, de voortgang in `ss_game_sm_nl`, de speelkast in `ss_sm_album`.
- Toegang: op de live site een teamticket (`MW.pro.locked("sm")`); zonder ticket is alleen de proefronde open (de eerste twee vakken, zonder lopen). Er is nog geen eigen Ko-fi-product: zolang `CFG.team.url.sm` ontbreekt, verwijst het Pro-paneel naar het ticket voor alle wandelingen.
- Op de testsite (`*.github.io/test/`) en lokaal staat alles open en is er een knop “Test ⏭” om een onderdeel over te slaan (ook in het menu ☰). Met `?live` achter het adres gedraagt de testsite zich als de live site: slot op de startknop, proefronde van twee vakken, ticketpaneel, geen testknoppen (alleen `SM.skip()` in de console blijft dan werken). Op de live site bestaat geen van deze hulpmiddelen.
- De proefronde stopt na vak 2 op één plek in de code (`trialOver()` in `vakGo` en `nextVak`), dus ook “Ga verder waar je was” komt zonder ticket niet voorbij vak 2.
- De oefenwereld van de wandelmotor (Op de bank, proefronde, Binnen zonder locatie) krijgt hier Nederlandse straatnamen (`STREETS` in data-nl.js).
- Drie Torens, de knikkerzak en Stenenrij hebben elk drie rondes met een eigen draai (jokers en kaarten uit de mouw; glas en dobbelstenen; een volle tafel en een steen te veel). Tussenkaarten tekent `SM_GAMES.kit.banner`. Vier op een rij: eerst twee keer winnen.
- Gratis periode: `CFG.gratis` in platform.js (`{sm:"2026-11-16T23:59:59+01:00"}`). Tot dan geeft `MW.pro.has("sm")` true: geen slot, geen proefronde-stop, statusregel "tot en met … gratis" en in de hub het label "Gratis t/m …". Wie in die periode begint, mag de speurtocht afmaken (G.trial blijft false). Daarna gewoon teamticket.
- In de hub uitgelicht met `feature:{nl,en,icon,acc,tag}` (eigen kleur via --facc/--ftag in hub.css) en `assets/feature-sm.webp`.
- Hub-cover `assets/cover-sm.webp` en deelplaatje `assets/og-sm.jpg` (1200×630) zijn van Kellie; `assets/og-sm-en.jpg` ook. Bewijsstukken met tekst hebben een Engelse versie (`img/ev-*-en.webp`), gekoppeld in data-en.js. De tikvlakken van Zoek de verschillen staan als rechthoeken in pixels van trap-voor/trap-na (1360×840) in `DIFF` bovenin spel-b.js; een nieuw trapbeeld vraagt nieuwe rechthoeken.

## Instellingen
Ko-fi-links, prijzen, groepspas-uren en de hub-Ko-fi-knop: bovenin `shared/platform.js` (`CFG`). Het zout `moordwandeling|` nooit wijzigen.
