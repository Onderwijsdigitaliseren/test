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
