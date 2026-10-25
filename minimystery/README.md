# MiniMystery – speurtochten voor kinderfeestjes

Statische site voor GitHub Pages, geen build-stap. Domein www.minimystery.nl (Nederlands in de root, Engels onder /en/).
Zusje van Moordwandeling / Murder Walk: zelfde motor, zelfde Pro/groepspas en dezelfde codes.

```
/index.html                         hub NL          /en/index.html                     hub EN
/de-lichtjesdief.html               De Lichtjesdief /en/the-light-thief.html           (logica in /games/jacht/, beeldherkenning via /games/fotojacht/model + /shared/ort)
/het-geheim-van-pony-pluis.html     Pony Pluis      /en/the-secret-of-pony-fluff.html  (logica in /games/pony/)
/agent-voor-een-dag.html            Agent           /en/officer-for-a-day.html         (logica in /games/agent/)
/shared/platform.js   gedeelde laag (Pro, groepspas, profiel, taal). Verschil met Moordwandeling: root = NL, /en/ = EN;
                      codes komen uit https://www.moordwandeling.nl/codes.json (één lijst voor beide sites), met /codes.json als terugval
/shared/catalog.js    de zaken op de hub      /shared/hub.js + hub.css   hub
/shared/walk.js       wandelmotor (kaart, gps, oefenwereld)
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
