# Het Alibi-rooster – generator

- `core.py`   regels, kandidaat-clues, greedy keuze (propagatie-maat) + terugsnoeien, certificering
- `csp.py`    propagatie-solver (domeinen per cel) – oplossingen tellen én "afleidbaar door propagatie" meten
- `verify_z3.py` onafhankelijke uniciteitscontrole met z3 (`pip install z3-solver`)
- `gen.py`    de vijf dossiers (huizen, personen, moordkamer, caps) → `dossiers.json`
- `bouw.py`   plakt `dossiers.json` in `alibi-rooster.template.html` → `out/alibi-rooster.html`
- `test.js`   Playwright-doorloop van alle dossiers (mobiel)

Regenereren: `python3 gen.py 4 [dossier-id ...]` daarna `python3 bouw.py`.
Elk dossier is gecertificeerd: unieke oplossing (eigen solver + z3), volledig afleidbaar zonder gokken,
en elke verklaring is nodig voor die afleiding.
