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
/shared/platform.js   gedeelde laag (Pro, groepspas, profiel, taal). Verschil met Moordwandeling: root = NL, /en/ = EN;
                      codes komen uit https://moordwandeling.nl/codes.json (één lijst voor beide sites), met /codes.json als terugval
/shared/catalog.js    de zaken op de hub      /shared/hub.js + hub.css   hub
/shared/walk.js       wandelmotor (kaart, gps, oefenwereld)
/shared/party.js      feestopties voor alle zaken (knop "Feestopties" op het startscherm, opslag ss_mm_party):
                      echte schat (laatste aanwijzing na de ontmaskering, MMP.finale), teamkleur + uitslagcode + teamstand (MMP.result),
                      begeleidersknop (lang drukken op de bovenste regel van een puzzel: overslaan +2 min, MMP.helper)
/assets/              logo, iconen, sfeerfoto's, deelplaatje, patroon, hoe-werkt-het-iconen, cover-<id>.webp per zaak
/sitemap.xml /robots.txt /404.html /CNAME
```

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
- Betaald maken: zet in `games/<g>/data-*.js` `FREE` uit; een code in codes.json met `"t":"feest","spel":"educatie"` opent dan alle educatieve spellen (per spel kan ook met de spel-id). Let op: `"spel":"alle"` opent ze ook.
