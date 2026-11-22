#!/usr/bin/env python3
"""MiniMystery – zet de body van de hoofdpagina (index.html en en/index.html) opnieuw neer: kort en duidelijk.
De spellen zelf komen uit shared/catalog.js (hub.js tekent de kaarten); hier staat alleen de vaste tekst.
Gebruik: python3 _tools/hub_body.py"""
import re,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T={
 'nl':dict(f='index.html',a='',edu='educatie/',lang='<a class="pill" id="lang" href="en/" hreflang="en">English</a>',eduP='🏫 Educatie',skip='Kies je spel',
  h1='Mysterie-speurtochten voor kinderen',lead='Eén telefoon, een groepje kinderen en een mysterie. Buiten, binnen of op de bank.',
  facts=['⏱ 35 tot 80 minuten','🎟 Proefronde gratis'],cta='Kies een spel ↓',
  lanes=[('#cases','🎂','Kinderfeestje','Speurtochten met een verhaal'),('#cases','🏠','Thuis &amp; binnen','Ook op de bank of aan tafel'),('educatie/','🏫','School &amp; BSO','Met lesstof en lesbrief')],
  wk='Zo speel je',wh='Drie manieren om te spelen',ws='Elke speurtocht kan op alle drie. Je kiest bij de start.',
  ways=[('🚶','Buiten','Met gps langs plekken in je eigen buurt.'),('👣','Binnen','Lopen op de plaats: de telefoon telt je stappen.'),('🛋️','Op de bank','Zonder lopen: tik op de kaart en speel de puzzels.')],
  gk='De spellen',gh='Kies je spel',
  ek='Voor school en BSO',eh='MiniMystery Educatie',et='Speurtochten met echte lesstof, per vak. Eén Schoolpas voor de hele school.',eb='Bekijk Educatie →',
  hk='Spelregels',hh='Zo werkt het',
  how=[('how-map.webp','1. Open het spel','Geen app, geen account. Eén telefoon per groepje.'),('how-camera.webp','2. Los het mysterie op','Puzzels, foto\'s en opdrachten. De telefoon leest voor.'),('how-diploma.webp','3. Diploma','Opgelost? Print het diploma met jullie foto\'s.')],
  tipsH='Tips voor de volwassene',tips=['Speel eerst samen de gratis proefronde: dan weet iedereen hoe het werkt.','Meer telefoons? Vul op elke telefoon dezelfde Feestpas-code in en daarna de zaakcode van de eerste telefoon.','Buiten blijf je op de stoep; een volwassene loopt altijd mee.'],
  pk='Het echte feest',ph='De Feestpas',
  ck='Op maat',ch='Jullie eigen versie',
  c1=('📸 Personaliseren · € 29,95','Foto\'s en namen van de kinderen in het spel, plus een thema. Inclusief Feestpas.'),c2=('✨ Iets helemaal nieuws','Eigen route, eigen verhaal of een speurtocht voor een hele school. Prijs op aanvraag.'),
  cb='✉️ Vraag aan',cn='Vraag minimaal twee weken van tevoren aan. <a href="speurtocht-op-maat.html">Meer over op maat →</a>',mail='Speurtocht%20op%20maat%20via%20MiniMystery',
  foot='Gemaakt in Nederland, met liefde voor speurneuzen.',adult='Voor volwassenen: Enigma Mystery →',adultU='https://www.enigmamystery.com/nl/wandelingen/',fl=('Op maat','Contact','Privacy')),
 'en':dict(f='en/index.html',a='../',edu='education/',lang='<a class="pill" id="lang" href="../" hreflang="nl">Nederlands</a>',eduP='🏫 Education',skip='Pick your game',
  h1='Mystery treasure hunts for children',lead='One phone, a group of children and a mystery. Outdoors, indoors or on the sofa.',
  facts=['⏱ 35 to 80 minutes','🎟 Practice round free'],cta='Pick a game ↓',
  lanes=[('#cases','🎂','Kids\' party','Treasure hunts with a story'),('#cases','🏠','At home &amp; indoors','On the sofa or round the table'),('education/','🏫','School &amp; clubs','With real school subjects')],
  wk='How to play',wh='Three ways to play',ws='Every hunt works all three ways. You choose at the start.',
  ways=[('🚶','Outdoors','With GPS, past places in your own neighbourhood.'),('👣','Indoors','Walk on the spot: the phone counts your steps.'),('🛋️','On the sofa','No walking: tap the map and play the puzzles.')],
  gk='The games',gh='Pick your game',
  ek='For schools and after-school clubs',eh='MiniMystery Education',et='Treasure hunts with real school subjects. One School Pass for the whole school.',eb='See Education →',
  hk='How to play',hh='How it works',
  how=[('how-map.webp','1. Open the game','No app, no account. One phone per group.'),('how-camera.webp','2. Solve the mystery','Puzzles, photos and tasks. The phone reads aloud.'),('how-diploma.webp','3. Diploma','Solved? Print the diploma with your photos.')],
  tipsH='Tips for the grown-up',tips=['Play the free practice round together first, so everyone knows how it works.','More phones? Enter the same Party Pass code on each phone, then the case code from the first phone.','Outdoors, stay on the pavement; an adult always walks along.'],
  pk='The real party',ph='The Party Pass',
  ck='Made to measure',ch='Your own version',
  c1=('📸 Personalise · € 29.95','Photos and names of the children in the game, plus a theme. Party Pass included.'),c2=('✨ Something entirely new','Your own route, your own story or a hunt for a whole school. Price on request.'),
  cb='✉️ Ask for one',cn='Ask at least two weeks ahead.',mail='Custom%20treasure%20hunt%20via%20MiniMystery',
  foot='Made in the Netherlands, with love for young detectives.',adult='For grown-ups: Enigma Mystery →',adultU='https://www.enigmamystery.com/en/walks/',fl=('Made to measure','Contact','Privacy')),
}
def body(t):
    a=t['a']
    return f'''<body>
<a class="skip" href="#cases">{t['skip']}</a>
<header class="hero slim">
  <picture><source media="(min-width:860px)" srcset="{a}assets/hero-wide.webp"><img src="{a}assets/hero.webp" alt="" width="786" height="984"></picture>
  <div class="top"><span class="tr"><a class="pill edu-pill" href="{t['edu']}">{t['eduP']}</a>{t['lang']}</span></div>
  <div class="in"><div class="card">
    <img class="logo" src="{a}assets/logo-wide.webp" alt="MiniMystery" width="1222" height="378">
    <h1>{t['h1']}</h1>
    <p class="lead">{t['lead']}</p>
  </div></div>
</header>
<main>
  <section class="sec first"><h2>{t['gh']}</h2><div class="games" id="cases"></div><p class="note status" id="status"></p></section>
  <section class="sec"><span class="kick">{t['wk']}</span><h2>{t['wh']}</h2><p class="sub">{t['ws']}</p>
    <ul class="ways3">{''.join(f'<li><i aria-hidden="true">{i}</i><b>{h}</b><span>{s}</span></li>' for i,h,s in t['ways'])}</ul></section>
  <section class="sec" id="edu"><div class="edub"><div class="edut"><span class="kick">{t['ek']}</span><h2>{t['eh']}</h2><p>{t['et']}</p><a class="btn" href="{t['edu']}">{t['eb']}</a></div><div class="edus" id="eduStrip"></div></div></section>
  <section class="sec"><span class="kick">{t['hk']}</span><h2>{t['hh']}</h2><ol class="how how3">{''.join(f'<li><img src="{a}assets/{im}" alt="" width="160" height="160" loading="lazy"><b>{h}</b><span>{s}</span></li>' for im,h,s in t['how'])}</ol>
    <details class="tips"><summary>{t['tipsH']}</summary><ul>{''.join('<li>'+x+'</li>' for x in t['tips'])}</ul></details></section>
  <section class="sec" id="proSec"><span class="kick">{t['pk']}</span><h2>{t['ph']}</h2><div class="probox" id="proBox"></div></section>
  <section class="sec" id="custom"><span class="kick">{t['ck']}</span><h2>{t['ch']}</h2>
    <div class="custom">
      <div class="cgrid c2"><div><b>{t['c1'][0]}</b><span>{t['c1'][1]}</span></div><div><b>{t['c2'][0]}</b><span>{t['c2'][1]}</span></div></div>
      <a class="btn" href="mailto:kellievandekerkhof@gmail.com?subject={t['mail']}">{t['cb']}</a>
      <p class="note">{t['cn']}</p>
    </div></section>
'''
for l,t in T.items():
    p=os.path.join(R,t['f']);s=open(p,encoding='utf8').read()
    i=s.index('<body>');j=s.index('<section class="sec" id="zoek">') if '<section class="sec" id="zoek">' in s else s.index('</main>')
    s=s[:i]+body(t)+'  '+s[j:]
    s=re.sub(r'<footer class="foot">.*?</footer>',lambda m:f'''<footer class="foot">
  <img src="{t['a']}assets/logo-mark-wink.webp" alt="" width="576" height="472" loading="lazy">
  <p>{t['foot']}</p>
  <a class="adult" href="{t['adultU']}">{t['adult']}</a>
  <div class="links"><a href="#custom">{t['fl'][0]}</a><a href="mailto:kellievandekerkhof@gmail.com">{t['fl'][1]}</a><button type="button" id="bPriv">{t['fl'][2]}</button></div>
</footer>''',s,flags=re.S)
    s=re.sub(r'hub\.css\?v=\d+','hub.css?v=15',s);s=re.sub(r'catalog\.js\?v=mm\d+','catalog.js?v=mm19',s);s=re.sub(r'hub\.js\?v=mm\d+','hub.js?v=mm19',s)
    open(p,'w',encoding='utf8').write(s);print('ok',t['f'])
