# MiniMystery – speurtochten voor kinderfeestjes

Statische site voor GitHub Pages, geen build-stap. Domein www.minimystery.nl (Nederlands in de root, Engels onder /en/).
Zusje van Moordwandeling / Murder Walk: zelfde motor, zelfde Pro/groepspas en dezelfde codes.

```
/index.html                         hub NL          /en/index.html                     hub EN
/de-lichtjesdief.html               De Lichtjesdief /en/the-light-thief.html           (logica in /games/jacht/, beeldherkenning via /games/fotojacht/model + /shared/ort)
/het-geheim-van-pony-pluis.html     Pony Pluis      /en/the-secret-of-pony-fluff.html  (logica in /games/pony/)
/agent-voor-een-dag.html            Agent           /en/officer-for-a-day.html         (logica in /games/agent/)
/de-betoverde-toverspiegel.html     Toverspiegel    /en/the-enchanted-mirror.html      (logica in /games/spiegel/)
/glitch-in-de-buurt.html            Glitch (8+)     /en/glitch-in-the-neighbourhood.html (logica in /games/glitch/: de buurt als videogame; elf levelmechanieken (PUZ), hartjes/XP/munten/power-ups/achievements, pixel-avatar, Glitch kaapt het scherm, eindbaas in drie fases (canvas pseudo-3D, microfoon, 3D-escape-room in #room), album en diploma. Pixel-art en chiptune in code; Kellie's artwork in games/glitch/img (hero, scene-intro/boss/finale, bit/bit-run/bit-fall, glitch-0..2 + eyes-0..2 + ant-0..2 als lagen, kid-0..3 + hat-0..3, sjef) wint waar het er is. Codes GL…)
/backstage-de-verdwenen-setlist.html Backstage (8+) /en/backstage-the-missing-setlist.html (logica in /games/backstage/: popster-wandeling met meidenband NOVA; twaalf stop-mechanieken (PUZ), per stop een podium-onderdeel + setlist-snipper/spoor/getuige, festival-verhaalkaart met eigen plek per opdracht, finale: wazige foto (5 outfits), gesprek met Pip, setlist sorteren, de show met microfoon/beweging en tik-terugval, album en Backstage-pas. Figuren getekend op canvas, muziek in WebAudio. Codes BS…)
/de-grote-kraak.html                De Grote Kraak (9–12) /en/the-big-heist.html (logica in /games/kraak/: boef-en-politie + vluchtspel. Deel 1: twaalf kraak-puzzels (PUZ: verkenning, laser-AR, vermomming, kluisslot op het gehoor met trillen, blauwdruk met draaiende camera's, kabels, foto-agent, stille tocht met microfoon, vingerafdrukken, sleutels, alarmcode, uitkijkpost), per stop een onderdeel op het plan + cijfer van de kluiscode / spoor / tipgever. Kraak-film (nep-kroon, alarm). Deel 2: ontsnapping op de kaart met politiewagens (zoeklicht-kegel → stilstaan, gps merkt bewegen), wegversperringen en helikopter (crew.js hijack); zonder kaart een kantel/sleep-spel in #hide. Finale: schuilkluis kiezen (5 scènes, 3 kenmerken), kluis in 3D (#room: toetsenbord, code, rally om de deur te trekken), twist met Stella Blauw, album en Meesterdief-certificaat met politie-erepenning. Kraakkaart: nachtstad met eigen plek per opdracht + onderduikadres (fk 12); kidsmap.js kreeg daarvoor de hook draw.world(g,t,to,sc). Figuren op canvas; artwork van Kellie in games/kraak/img wint waar het er is. Codes GK…)
/wie-heeft-de-taart-gepakt.html     Wie heeft de taart gepakt? (4–10, binnen) – nog geen EN (logica in /games/taart/: kinder-whodunit voor één telefoon rond de tafel, géén wandelmotor. Zeven vaste verdachten met kenmerken (vacht, iets op het hoofd, klein, kleur); dader en sporen uit de seed (zaakcode WT…). Per ronde verhoor (dief liegt in stand Speurneus), opdracht (huis met timer: rond, kleur, sluipen, toren, letter T, dierentocht, standbeeld, lepel zoeken; minispel: kruimels vangen, vingerafdruk, wat is er weg, koelkastslot, spiegelschrift, schaduw, kaarsjes tellen) en spoor; sporenbord met zelf wegstrepen (stand Kruimel: Help). Deel 2 bij Normaal/Lang: vijf verstopplekken met plek-sporen. Rollen per ronde, geheime missies per kind, verrassing na afloop, diploma A4. Proefronde = 2 rondes. Artwork: games/taart/ARTWORK.md.)
/operatie-pakjesavond.html          Operatie Pakjesavond (6–10, pakjesavond) – nog geen EN (logica in /games/pakjes/: op de wandelmotor (als klok): binnen in huis (kamer per stukje), buiten met kaart (winterbuurt op kidsmap) of zonder kaart. 6/8/10 stukjes van Piets verstopkaart, elk achter een Pietenproef (PUZ: tel, vang, memory, dak, ritme, sorteer, verschil, code, rijm, boek, zoek, kijk, gym, schaduw), niveaus Pepernoot/Hoofdpiet. Hoofdpiet-knop = ouderhoek (pincode, ss_pa_parent): verstopplekken met raadsel, precieze plek en foto; finale: kaart omdraaien → Piet leest de aanwijzingen voor → Speurpieten-diploma. Codes PA…. Artwork: games/pakjes/ARTWORK.md.)
/shared/platform.js   gedeelde laag (Pro, groepspas, profiel, taal). Verschil met Moordwandeling: root = NL, /en/ = EN;
                      codes komen uit https://moordwandeling.nl/codes.json (één lijst voor beide sites), met /codes.json als terugval
/shared/catalog.js    de zaken op de hub      /shared/hub.js + hub.css   hub
/shared/walk.js       wandelmotor (kaart, gps, oefenwereld)
/shared/move.js       punten verleggen: de begeleider wijst op de straatkaart een andere plek aan voor een punt dat lastig of niet te bereiken is (knop "✥ Verleg punt"; op de kinderkaart niet zichtbaar). Zelfde bestand als wandel/shared/move.js van Enigma Mystery. Aansluiten: optie `move` in createMap, zie de kop van move.js
/shared/party.js      feestopties voor alle zaken (knop "Feestopties" op het startscherm, opslag ss_mm_party):
                      echte schat (laatste aanwijzing na de ontmaskering, MMP.finale), teamkleur + uitslagcode + teamstand (MMP.result),
                      begeleidersknop (lang drukken op de bovenste regel van een puzzel: overslaan +2 min, MMP.helper)
/assets/              logo, iconen, sfeerfoto's, deelplaatje, patroon, hoe-werkt-het-iconen, cover-<id>.webp per zaak
/sitemap.xml /robots.txt /404.html /CNAME
```

## Stemmen (stemstudio)
- `stemstudio.html` (noindex): per spel en taal alle zinnen; zelf inspreken via de microfoon (stilte knippen → mp3 met shared/lame.min.js), mp3's koppelen of ElevenLabs. Menu komt uit `shared/catalog.js` (`dir` = map onder games/).
- Zinnenlijsten: `games/<spel>/voice/<taal>/script.js`, gemaakt door `node _tools/stemscript.js` (alle spellen) of `node _tools/stemscript.js <map> <taal>` (één spel, ook voor de met de hand samengestelde lijsten van pony/jacht/agent/spiegel). Draai dit na elke tekstwijziging en bij elk nieuw spel; bestaande wie/waar blijven staan, vervallen zinnen krijgen een †.
- Spelregels per spel (welke sleutels geen spraak zijn, wie wat zegt, plaatshouders) staan in `RULES` in het gereedschap. Zinnen met een niet-ingevulde {plaatshouder} blijven browserstem.
- Opnames: `games/<spel>/voice/<taal>/<sleutel>.mp3` + `index.js` (uit het zip-pakket van de studio). `shared/voice.js` speelt een mp3 als die er is en laat anders de telefoon voorlezen.

## Codes
Nieuwe codes maak je zoals altijd met codes.html op Moordwandeling. MiniMystery leest die lijst direct mee.
Werk /codes.json hier af en toe bij als terugval (gewoon een kopie).

## Voortgang
Alles in `localStorage` onder `ss_*`, per domein. Wie Pro op moordwandeling.nl heeft, voert dezelfde code hier nog één keer in.

## Nieuwe zaak
Spelmap in /games/<naam>/, twee shells (NL in de root, EN in /en/, paden met ../), één object in shared/catalog.js, cover in assets/cover-<id>.webp, twee regels in sitemap.xml.

## MiniMystery Educatie: Engelse versies
De educatieve wandelingen (tijd, reken, taal, natuur, klok) hebben een Engelse versie in `en/` (Charlie is NL-only: Engels voor Nederlandse kinderen).
- Teksten van het spel staan in `games/<g>/data-en.js` (met de hand bijhouden naast `data-nl.js`).
- `games/<g>/game-en.js` is **gegenereerd** uit `game.js`: na een wijziging in `game.js` draai je `python3 _tools/edu_en.py` (vertaalregels in `_tools/edu_en.json`; het script meldt wat nog Nederlands is).
- De Engelse HTML-pagina's zijn **gegenereerd** uit de Nederlandse: `python3 _tools/edu_shell_en.py` (vertalingen in het script zelf; het meldt ontbrekende teksten).
- Landing: `educatie/` (NL) en `en/education/` (EN).

## Afdeling Educatie
- Spellen met `"line": "educatie"` in `shared/catalog.js` staan niet op de feest-hub (index.html, en/), maar alleen in `educatie/` en `en/education/`. De feest-hub toont één verwijskaart "MiniMystery Educatie".
- De terug-knop in de educatieve spellen gaat naar de afdeling Educatie.
- Betaald (sinds 8 nov 2026): `FREE:false` in alle educatieve data-bestanden. Eén **Schoolpas** (€ 39,99, 183 dagen) opent alle educatieve wandelingen: code in codes.json met `"t":"feest","spel":"educatie","dagen":183` (maak hem in codes.html, optie "MiniMystery Educatie – Schoolpas"). Prijs en Ko-fi-link staan in `shared/platform.js` onder `CFG.edu`; de koopknop op `educatie/` en `en/education/` heeft `id="eduBuy"` (link invullen, `hidden` weghalen, `#eduSoon` weg). De proefronde blijft gratis. `"spel":"alle"` opent ze ook.
- Plaatjes in de wandelingen worden meteen getoond (ook als ze nog laden) via `picTag()`; mislukt een plaatje, dan blijft de tekening/emoji staan.

## Speelwijzen (sinds 22 nov 2026): buiten, binnen op de plaats, op de bank
Alle speurtochten op de wandelmotor (feestjes én educatie) hebben op het startscherm de keuze "Hoe spelen jullie?" (`#len`, zichtbaar gemaakt door `shared/start.js`):
- **Buiten met kaart / zonder kaart** (`map`, `street`): zoals altijd.
- **Binnen, lopen op de plaats** (`in`; bij De Lichtjesdief en Operatie Pakjesavond heet de knop `stap`, omdat `in` daar "door het huis" is): de verhaalkaart met de stappenteller uit `shared/steps.js` (echte stappen of vanzelf op tempo). In het spel is dit `G.mode==="in"` met `G.in={kind:"sensor"|"tempo",…}`.
- **Op de bank, zonder lopen** (`bank`): dezelfde verhaalkaart, maar je tikt op de plek (of op de kaart onderaan) en het groepje loopt er vanzelf heen. In het spel `G.mode==="in"` met `G.in.kind==="tap"`; de functie `BANK()` in elk game.js. De kinderkaart behandelt dit als de proefronde (tikken = lopen).
- **In het gebouw** (`gebouw`, alleen de vak-wandelingen van Educatie) en **door het huis** (`in` bij Lichtjesdief/Pakjesavond): ongewijzigd.
- Zaakcode: de letter voor de stand is K (kaart), S (zonder kaart), B (binnen op de plaats; bij Pakjesavond = door het huis), T (Pakjesavond: op de plaats), G (gebouw), **Z (bank)**. De Lichtjesdief gebruikt de tabel `CL` (nu 30 tekens: 5 standen × 3 lengtes × 2 niveaus).
- De feestspellen aan tafel (Taart, Toverspiegel) hebben geen wandelmotor en dus geen standen.
- Nieuw spel op de wandelmotor: neem het blok "binnen: lopen op de plaats" + `BANK()` over uit `games/klok/game.js` en zet de vier of vijf knoppen in `#len`.

## Hoofdpagina en Educatie-pagina (nieuwe indeling, 22 nov 2026)
- `index.html` en `en/index.html`: de vaste tekst komt uit `python3 _tools/hub_body.py` (NL en EN in één script). De spelkaarten tekent `shared/hub.js` uit de catalogus: plaatje, titel, één zin (`short`), leeftijd (`age`), duur, speelwijzen (`ways`) en twee knoppen; de lange `desc` zit achter "Meer over dit spel". Filter "Hoe wil je spelen?" werkt op `ways`.
- `educatie/` en `en/education/`: lege schil + `shared/edu.js` en `shared/edu.css`. Elke wandeling met `"line":"educatie"` wordt vanzelf een kaart (plaatje, vak `subj`, groep `grp`, één zin `short`), met filter per vak. `"status":"soon"` = grijze kaart "Binnenkort"; `"isNew":true` = lintje "Nieuw". **Nieuwe educatieve wandeling = één regel in `shared/catalog.js` + cover**, de pagina hoeft niet aangepast.

## Educatie: verdieping per station (sinds 23 nov 2026)
- `shared/meer.js`: na de hoofdvraag van een station volgen extra stappen met uitleg; pas daarna komt de sleutel. Op het begeleidersblad staan ze met antwoord erbij.
- Data: onderaan `games/<spel>/data-nl.js` staat een blok dat per station `more:[niveau0,niveau1,niveau2]` zet. Stap = `["vraag",["goed","fout","fout"],"uitleg"]` (goede antwoord eerst, het spel husselt), `["vraag","antwoord|alternatief","uitleg"]` (typen) of `["doe-opdracht"]`.
- Staat in: natuur, reken, taal, tijd en engels (twee stappen per station per niveau). De verdwenen schoolklok is ongemoeid gelaten.
- Engels (sinds 23 nov 2026): ook onderaan `data-en.js` van natuur, reken, taal en tijd. The Letter Thief gaat over de Engelse taal, dus daar zijn het eigen Engelse taalvragen, geen vertaling. Staat er geen `more` in een datafile, dan speelt het station zoals voorheen.
- In een `game.js`: `accept()` start de verdieping (`MW.Meer.run`), `award()` geeft daarna de sleutel. De shells laden `shared/meer.js` vóór de data.

## De Vergeetmist (automatiseren, sinds 23 nov 2026, nog niet live)
- `/de-vergeetmist.html` + `games/vlot/` (id `vm`, zaakcode VM…, alleen NL). Zelfde motor en standen als de andere vak-wandelingen.
- Elk station: de truc (`truc[niveau]`) → bewegen (`act`) → flitsronde (`kind:"flits"`; `fl[niveau](r)` maakt één som of woordkeuze uit de seed) → verdieping → flitslamp.
- Flitsronde: 8/10/12 flitsen (`FLN`) plus drie opfrissers van het vorige station; 80% in één keer goed is gehaald; een foute flits komt terug (maximaal drie keer); na twee mislukte rondes mag een team verder en staat er 'nog oefenen' in het flitsboekje.
- Finale: de flitslampen zijn veelvouden van één tafel (`TAFELS` per niveau), op volgorde tikken.
- Klokkijken zit er bewust niet in (krijgt een eigen wandeling). Artwork: `games/vlot/ARTWORK.md`; de hubtegel `assets/cover-vm.webp` is een tijdelijke.
