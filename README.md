# Moordwandeling / Murder Walk – platform

Statische site voor GitHub Pages, geen build-stap. Zelfde bestanden op murderwalk.com en moordwandeling.nl (aparte repo's, alleen CNAME verschilt).

```
/index.html                  hub EN (op moordwandeling.nl stuurt hij door naar /nl/)
/nl/index.html               hub NL
/murder-walk.html            spel 1 EN        /nl/moordwandeling.html   spel 1 NL   (eigen, oudere motor; staat compleet in het bestand)
/the-vanishing.html          spel 2 EN        /nl/de-verdwijning.html   spel 2 NL   (shell; logica in /games/vanishing/)
/till-death-do-us-part.html  spel 3 EN        /nl/tot-de-dood-ons-scheidt.html  spel 3 NL (shell; logica in /games/bride/)
/games/bride/                game.js (zelfde motor als vanishing: zes gasten, motief, de bruid als schim) · data-nl.js · data-en.js · game.css · hero.webp (sfeerfoto, uitsnede zonder titel) · portrait.webp; gebruikt games/vanishing/puzzles.js. Eigen sfeer naar de sfeerfoto (natte nacht, lantaarnlicht, ivoor, dieprode rozenblaadjes; Cinzel + Cormorant Garamond), eigen pictogrammen (IC in game.js), getekende figuren (bride/witness) en eigen kaartkleuren via createMap({theme})
/games/vanishing/            game.js (logica, taalonafhankelijk) · data-nl.js · data-en.js · game.css · hero.webp (sfeerfoto, uitsnede zonder titel; eigen sfeer, figuren en rode routelijn)
/shared/platform.js          gedeelde laag: Pro, groepspas, codes.json, profiel (rang/punten/streak), taal, instellingen (SS_PRO)
/shared/walk.js              wandelmotor voor nieuwe spellen: OpenStreetMap/Overpass, plekken kiezen, nachtkaart, gps, oefenwereld, vellen/geluid
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
`/#z=…` en `/#g=…` (zaakcodes en groepslinks van vóór het platform) worden door de hub doorgestuurd naar het juiste spel; `#z=VZ…` naar De Verdwijning, `#z=TD…` naar Tot de Dood Ons Scheidt.

## Nieuw spel toevoegen
1. Object toevoegen in `shared/catalog.js` (id, categorie, status, slugs/titels per taal).
2. Twee HTML-shells (EN in de root, NL onder `/nl/`) met SEO-head, die `platform.js`, `catalog.js`, `walk.js`, je data-bestand en je game.js laden. `games/vanishing/` is het voorbeeld.
3. Twee `<url>`-blokken in `sitemap.xml`, en als het spel zaakcodes deelt: een regel in de hub-doorsturing (`index.html`, `nl/index.html`, `404.html`).
4. In het spel: `MW.pro.locked("<id>")`, `MW.pro.setFree("<id>")`, `MW.profile.award({game:"<id>",…})`, `MW.proHTML/bindPro` voor het Pro-paneel.

## Instellingen
Ko-fi-links, prijzen, groepspas-uren en de hub-Ko-fi-knop: bovenin `shared/platform.js` (`CFG`). Het zout `moordwandeling|` nooit wijzigen.
