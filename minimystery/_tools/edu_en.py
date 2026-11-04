#!/usr/bin/env python3
"""MiniMystery Educatie: maakt de Engelse spelcode games/<spel>/game-en.js uit games/<spel>/game.js.
De vaste teksten in game.js (die niet in data-nl.js staan) worden vervangen volgens _tools/edu_en.json.
Draaien na elke wijziging in een game.js:  python3 _tools/edu_en.py
Meldt Nederlandse woorden die nog in de Engelse versie staan."""
import json,os,re,sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M=json.load(open(os.path.join(ROOT,"_tools","edu_en.json"),encoding="utf-8"))
GAMES=["tijd","reken","taal","natuur","klok"]
DUTCH=re.compile(r"\b(jullie|zaak|zaken|tijdlek|tijdlekken|niveau|minuten|kluis|gebouw|buurt|Loop|samen|Typ|Lesbrief|Leerdoelen|Kerndoelen|Antwoord|Vraag|Opdracht|Waarnemen|Onderzoek|Meten|geteld|gevonden|hersteld|opgelost|zonder|juf|meneer)\b")
bad=0
for g in GAMES:
    src=os.path.join(ROOT,"games",g,"game.js")
    if not os.path.exists(src): continue
    s=open(src,encoding="utf-8").read()
    for a,b in M.get("games",{}).get(g,[])+M["common"]: s=s.replace(a,b)
    open(os.path.join(ROOT,"games",g,"game-en.js"),"w",encoding="utf-8").write(s)
    left=set()
    for m in re.finditer(r'''"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*\'''',re.sub(r"/\*.*?\*/","",s,flags=re.S)):
        t=re.sub(r"<[^>]*>"," ",m.group(0))
        if DUTCH.search(t): left.add(m.group(0)[:90])
    if left:
        bad+=len(left);print(g+":");[print("   ",x) for x in sorted(left)]
print("klaar" if not bad else str(bad)+" teksten nog Nederlands")
