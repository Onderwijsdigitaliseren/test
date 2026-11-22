#!/usr/bin/env python3
"""Bouwt index.html + nl.js + en.js uit src-nl.html (de Nederlandse bron).
Gebruik: python3 build.py   (in de map van het spel)
Engelse teksten staan hieronder in PAIRS: (Nederlands fragment, Engels). Elk Nederlands fragment
moet letterlijk in de bron voorkomen; anders stopt het script en zegt het welk fragment ontbreekt."""
import json, re, sys

src = open('src-nl.html', encoding='utf-8').read()
i_body = src.index('<!-- START -->')
i_three = src.index('<script src="lib/three.min.js"></script>')
i_script = src.index('<script>\n"use strict";', i_three) + len('<script>\n')
i_end = src.rindex('</script>')
head, body, script = src[:i_body], src[i_body:i_three], src[i_script:i_end]

PAIRS = [
# ---- startscherm en vaste teksten ----
('<text x="297" y="478">Z</text>', '<text x="297" y="478">S</text>'),
('<text x="408" y="358">O</text>', '<text x="408" y="358">E</text>'),
('De Schat van <b>Rosse Neel</b>', 'The Treasure of <b>Red Nell</b>'),
('Schattenjacht · zes escape rooms in 3D · drie tussenstops · ± 60 tot 90 minuten', 'Treasure hunt · six 3D escape rooms · three stops in between · about 60 to 90 minutes'),
('Ga verder met je jacht', 'Continue your hunt'),
('Opnieuw beginnen', 'Start over'),
('>Kinderen</button>', '>Kids</button>'),
('>Gezin</button>', '>Family</button>'),
('<b>Buiten</b><span>Loop met gps. Het kompas wijst je de plekken aan in je eigen buurt.</span>', '<b>Outdoors</b><span>Walk with GPS. The compass points you to places in your own neighbourhood.</span>'),
('<b>Binnen</b><span>Loop door het huis of op de plaats. Je stappen brengen je verder.</span>', '<b>Indoors</b><span>Walk around the house or on the spot. Your steps take you further.</span>'),
('<b>Op de bank</b><span>Reis door te tikken op de schatkaart. Alle kamers, geen meter lopen.</span>', '<b>On the sofa</b><span>Travel by tapping the treasure map. Every room, not a single step.</span>'),
('Begin de jacht', 'Start the hunt'),
('Alleen of samen op één scherm. Sleep om rond te kijken in elke kamer, tik op wat je opvalt. Je voortgang wordt op dit apparaat bewaard.', 'Alone or together on one screen. Drag to look around in each room and tap whatever catches your eye. Your progress is saved on this device.'),
('>Geluid: aan<', '>Sound: on<'),
('>English</button>', '>Nederlands</button>'),
('<h2>De kaart van Neel</h2>', '<h2>Nell’s map</h2>'),
('🎒 Buidel', '🎒 Pouch'),
("const LS='rosseneel.v1';", "const LS='rednell.v1';"),
('Proefronde: de eerste twee plekken zijn gratis. Daarna speel je verder met een Feestpas.', 'Free trial: the first two places are free. After that you continue with a Party Pass.'),
('De proefronde is voorbij: de eerste twee plekken zijn gratis.', 'The free trial ends here: the first two places were free.'),
# ---- algemeen ----
("zon:'de zon',maan:'de maan',ster:'de ster',golf:'de golf',schedel:'de schedel',anker:'het anker',vis:'de vis',kroon:'de kroon'", "zon:'the sun',maan:'the moon',ster:'the star',golf:'the wave',schedel:'the skull',anker:'the anchor',vis:'the fish',kroon:'the crown'"),
("btn||'Verder'", "btn||'Continue'"),
("'IJzeren sleutel'", "'Iron key'"), ("'Spiegelscherf'", "'Mirror shard'"), ("'Half muziekblad'", "'Half a music sheet'"), ("'Andere helft'", "'The other half'"),
('<h3>Je buidel</h3>', '<h3>Your pouch</h3>'),
('${d.length} van 5 dubloenen · ${d.length} van 5 kaartstukken · ${S.coins} gouden munten', '${d.length} of 5 doubloons · ${d.length} of 5 map pieces · ${S.coins} gold coins'),
('</div>Dubloen</button>', '</div>Doubloon</button>'),
('Nog leeg. Dat gaat veranderen.', 'Still empty. That is about to change.'),
('Op elke dubloen staat een teken en een ingekrast cijfer. Bewaar ze goed.', 'Each doubloon has a symbol and a number scratched into it. Keep them safe.'),
("'Dicht'", "'Close'"),
('>Naar de kaart</text>', '>To the map</text>'),
('begin hier', 'start here'),
('<text x="500" y="590">Z</text>', '<text x="500" y="590">S</text>'),
('<text x="968" y="316">O</text>', '<text x="968" y="316">E</text>'),
('<text x="600" y="570">Z</text>', '<text x="600" y="570">S</text>'),
('<text x="668" y="498">O</text>', '<text x="668" y="498">E</text>'),
('>Probeer</button>', '>Try</button>'), ('>Terug</button>', '>Back</button>'), ('>Wis</button>', '>Clear</button>'),
# ---- kamer 1 ----
("name:'De Kapiteinshut'", "name:'The Captain’s Cabin'"),
("intro:'De hut van de <i>Meermin</i>. Het ruikt naar teer en kaarsvet. Links staat een zeekist met een hangslot. Het logboek ligt nog open op het bureau.'", "intro:'The cabin of the <i>Mermaid</i>. It smells of tar and candle wax. On the left stands a sea chest with a padlock. The logbook still lies open on the desk.'"),
("hints:['Lees het logboek op het bureau. Neel vertelt wat ze elke avond telde, en in welke volgorde.','Tel in de hele hut: de brandende kaarsen, de verrekijkers en de kanonskogels. Kijk op alle vier de wanden.','Vier kaarsen, twee kijkers, zes kogels: de lade opent met 4-2-6. De sleutel uit de lade past op de zeekist.']", "hints:['Read the logbook on the desk. Nell tells you what she counted every night, and in what order.','Count all through the cabin: the burning candles, the spyglasses and the cannonballs. Look at all four walls.','Four candles, two spyglasses, six cannonballs: the drawer opens with 4-2-6. The key from the drawer fits the sea chest.']"),
('Mijn lade heeft drie wieltjes.<br>Tel in de hele hut:', 'My drawer has three little wheels.<br>Count all through the cabin:'),
('🕯️ kaarsen = ?<br>🔭 kijkers = ?<br>⚫ kogels = ?', '🕯️ candles = ?<br>🔭 spyglasses = ?<br>⚫ cannonballs = ?'),
('Kijk op alle muren!', 'Look at every wall!'),
("'Logboek van de Meermin'", "'Logbook of the Mermaid'"),
('14 oktober 1689. Windstil. De bemanning slaapt, ik niet.', '14 October 1689. Not a breath of wind. The crew sleeps; I do not.'),
('Mijn lade opent alleen voor wie telt zoals ik elke avond tel: eerst mijn <b>kaarsen</b>, dan mijn <b>kijkers</b>, dan mijn <b>kogels</b>.', 'My drawer opens only for those who count as I count every night: first my <b>candles</b>, then my <b>spyglasses</b>, then my <b>cannonballs</b>.'),
('Wie ze niet alle vindt, heeft niet goed rondgekeken.', 'Whoever cannot find them all has not looked around properly.'),
("title:'De lade',text:'Drie koperen wieltjes naast de knop.'", "title:'The drawer',text:'Three brass wheels next to the knob.'"),
('De lade is leeg. De sleutel heb je al.', 'The drawer is empty. You already have the key.'),
('Klik. De lade schuift open. Er ligt een <b>ijzeren sleutel</b> in.', 'Click. The drawer slides open. Inside lies an <b>iron key</b>.'),
('Het schilderij zwaait opzij. Erachter glimt iets.', 'The painting swings aside. Something glints behind it.'),
('Een driemaster in de storm. Neel hield van drama.', 'A three-master in a storm. Nell liked a bit of drama.'),
('De zeekist is leeg, op wat zand na.', 'The sea chest is empty, apart from some sand.'),
('Een zwaar hangslot. Hier hoort een sleutel bij.', 'A heavy padlock. There must be a key for this.'),
# ---- kamer 2 ----
("name:'De Kaartenkamer'", "name:'The Chart Room'"),
("intro:'Kaarten tot aan het plafond. In de kast zit geen sleutelgat, maar een koperen kompasroos met vier knoppen.'", "intro:'Charts up to the ceiling. The cabinet has no keyhole, but a brass compass rose with four buttons.'"),
("hints:['Bekijk de grote zeekaart: vier schepen, elk aan een andere rand. En draai de wereldbol eens om.','Onder de wereldbol ligt een briefje: kleinste schip eerst, vlaggenschip het laatst. Tel de masten.','Eén mast ligt in het oosten, twee in het zuiden, drie in het noorden, vier in het westen: druk O, Z, N, W.']", "hints:['Study the big sea chart: four ships, each at a different edge. And give the globe a spin.','Under the globe lies a note: smallest ship first, flagship last. Count the masts.','One mast lies in the east, two in the south, three in the north, four in the west: press E, S, N, W.']"),
("note('De zeekaart',", "note('The sea chart',"),
('Vier schepen, elk voor anker aan een andere rand van de kaart.', 'Four ships, each at anchor at a different edge of the chart.'),
('De bol draait piepend. Er dwarrelt een briefje onder vandaan.', 'The globe turns with a squeak. A note flutters out from underneath.'),
('De wereld, zoals Neel hem kende. Halfleeg dus.', 'The world as Nell knew it. Half empty, that is.'),
("'Briefje onder de wereldbol'", "'Note under the globe'"),
('Eerst het kleinste schip, dan steeds groter.<br>Kijk op de grote kaart waar elk schip ligt: boven, onder, links of rechts. Druk op die pijl.', 'Smallest ship first, then bigger and bigger.<br>Look on the big chart where each ship lies: top, bottom, left or right. Press that arrow.'),
('Mijn vloot voer nooit zomaar uit. Het <b>kleinste schip eerst</b>, het vlaggenschip het laatst.', 'My fleet never sailed just anyhow. The <b>smallest ship first</b>, the flagship last.'),
('Waar ze liggen, daar draai je heen.', 'Where they lie is where you turn.'),
('De kast is leeg.', 'The cabinet is empty.'),
("title:'De kompasroos',text:'Vier knoppen. Vier keer drukken.',btns:['N','W','O','Z'],grid:[null,'N',null,'W',null,'O',null,'Z',null],len:4,lab:K()?{N:'↑',W:'←',O:'→',Z:'↓'}:null,answer:['O','Z','N','W']", "title:'The compass rose',text:'Four buttons. Press four times.',btns:['N','W','E','S'],grid:[null,'N',null,'W',null,'E',null,'S',null],len:4,lab:K()?{N:'↑',W:'←',E:'→',S:'↓'}:null,answer:['E','S','N','W']"),
# ---- kamer 3 ----
("name:'De Smokkelkelder'", "name:'The Smugglers’ Cellar'"),
("intro:'Pikdonker. Het ruikt naar rum en natte steen. Ergens gloeit een heel klein vonkje. Sleep rond tot je het vindt.'", "intro:'Pitch dark. It smells of rum and wet stone. Somewhere a tiny spark is glowing. Drag around until you find it.'"),
("hints:['Zoek eerst licht: op een plank gloeit de lont van een lantaarn. Tik erop.','Met licht zie je krijtstrepen op vier vaten en een tekst op de muur bij de trap. In de vloer zit een luik met vier tekens.','Meeste streepjes eerst: kroon (4), anker (3), schedel (2), vis (1). Het luik zit in de vloer, kijk omlaag.']", "hints:['First find some light: on a shelf the wick of a lantern is glowing. Tap it.','With light you can see chalk marks on four barrels and writing on the wall by the door. In the floor is a hatch with four symbols.','Most marks first: crown (4), anchor (3), skull (2), fish (1). The hatch is in the floor, so look down.']"),
('>MEESTE</text>', '>MOST</text>'), ('>STREEPJES</text>', '>MARKS</text>'), ('>EERST</text>', '>FIRST</text>'),
('De lantaarn brandt rustig. Kijk om je heen.', 'The lantern burns steadily. Look around you.'),
('Je draait de lont omhoog. De kelder komt tevoorschijn: vaten, krijt op de muur, een luik in de vloer.', 'You turn up the wick. The cellar appears: barrels, chalk on the wall, a hatch in the floor.'),
('Het luik staat open. Leeg nu.', 'The hatch is open. Empty now.'),
('Je voelt hout en koud ijzer. Zonder licht zie je niet wat je doet.', 'You feel wood and cold iron. Without light you cannot see what you are doing.'),
("title:'Het luik',text:'Vier wieltjes met tekens.'", "title:'The hatch',text:'Four wheels with symbols.'"),
# ---- kamer 4 ----
("name:'De Klokkentoren'", "name:'The Bell Tower'"),
("intro:'Wind door de galmgaten. Vijf klokken, geen twee even groot. Op de lessenaar ligt een half gescheurd muziekblad.'", "intro:'Wind through the belfry openings. Five bells, no two the same size. On the lectern lies a music sheet, torn in half.'"),
("hints:['Het muziekblad is doormidden gescheurd. De ene helft ligt op de lessenaar, de andere zit ergens waar een vogel hem heen sleepte.','Lees het bordje op de muur: hoe hoger de noot, hoe kleiner de klok. De bovenste lijn is de kleinste klok.','Luid in deze volgorde, van klein (1) tot groot (5): 2, 4, 1, 5, 3, 1.']", "hints:['The music sheet is torn in two. One half lies on the lectern, the other is somewhere a bird dragged it to.','Read the plaque on the wall: the higher the note, the smaller the bell. The top line is the smallest bell.','Ring them in this order, from small (1) to large (5): 2, 4, 1, 5, 3, 1.']"),
('De laatste toon blijft hangen. Onder de klokken schuift een steen opzij.', 'The last note lingers. Beneath the bells a stone slides aside.'),
("['','De kleinste klok. Hoog en helder.','Een kleine klok.','De middelste klok.','Een grote klok.','De grootste klok. Je voelt hem in je buik.']", "['','The smallest bell. High and clear.','A small bell.','The middle bell.','A large bell.','The largest bell. You feel it in your belly.']"),
('Tussen de takjes zit een stuk papier: de andere helft van het muziekblad.', 'Between the twigs is a piece of paper: the other half of the music sheet.'),
('Een verlaten meeuwennest. En één ei dat je met rust laat.', 'An abandoned gull’s nest. And one egg that you leave alone.'),
("'Koperen bordje'", "'Brass plaque'"),
('Luid mijn klokken zoals op het muziekblad:<br>kleine klok, grote klok, precies in die volgorde.', 'Ring my bells as on the music sheet:<br>small bell, large bell, in exactly that order.'),
('Hoe hoger de noot,<br>hoe kleiner de klok.', 'The higher the note,<br>the smaller the bell.'),
('Speel mijn lied en de toren geeft zich gewonnen.', 'Play my song and the tower will give in.'),
("note('Het lied van Neel'", "note('Nell’s song'"),
('Luid de klokken in deze volgorde: klein of groot, net als op het blad.', 'Ring the bells in this order: small or large, just as on the sheet.'),
('Zes noten. Het blad is weer heel.', 'Six notes. The sheet is whole again.'),
('De helft ontbreekt. Het blad is doormidden gescheurd.', 'Half is missing. The sheet is torn in two.'),
# ---- kamer 5 ----
("name:'De Getijdengrot'", "name:'The Tidal Cave'"),
("intro:'Druppels, zout, het ruisen van de zee. Door een spleet valt één straal maanlicht op een rek vol spiegels. Eén houder is leeg.'", "intro:'Drips, salt, the murmur of the sea. Through a crack a single beam of moonlight falls on a rack full of mirrors. One holder is empty.'"),
("hints:['Het spiegelwerk mist een spiegel. Zoek in de grot naar iets dat blinkt onder water.','De scherf ligt in de getijdenpoel. Zet hem in de lege houder linksonder en tik op spiegels om ze te kantelen.','De straal moet omlaag, naar links, omlaag en dan naar rechts naar het kristal. Kantel de vier spiegels op die route.']", "hints:['The mirror rack is missing a mirror. Search the cave for something that glints under water.','The shard lies in the tide pool. Put it in the empty holder at the bottom left and tap mirrors to tilt them.','The beam must go down, to the left, down and then to the right to the crystal. Tilt the four mirrors on that route.']"),
('Het water is helder en ijskoud. Een krabbetje kijkt je verontwaardigd aan.', 'The water is clear and ice cold. A little crab gives you an indignant look.'),
('Je vist een <b>spiegelscherf</b> uit de poel. Rond geslepen: dit is geen afval.', 'You fish a <b>mirror shard</b> out of the pool. Ground round: this is no rubbish.'),
('Het kristal gloeit. De straal staat goed.', 'The crystal glows. The beam is set right.'),
('Een sloep, half vergaan. Hiermee bracht Neel haar goud aan land.', 'A rowing boat, half rotted. This is how Nell brought her gold ashore.'),
("'Krassen in de rots'", "'Scratches in the rock'"),
('Licht buigt waar het spiegelt.<br>Breng de maan naar het kristal.', 'Light bends where it is mirrored.<br>Bring the moon to the crystal.'),
('<h3>Het spiegelwerk</h3>', '<h3>The mirror rack</h3>'),
('Tik op een spiegel om hem te kantelen. Stuur het maanlicht naar het kristal.', 'Tap a mirror to tilt it. Send the moonlight to the crystal.'),
('<b>Deze houder is leeg.</b> Hier hoort een spiegel in. Zoek hem in de grot.', '<b>This holder is empty.</b> A mirror belongs here. Look for it in the cave.'),
('Het kristal vangt de maan en licht blauw op. In de rots klapt een nis open.', 'The crystal catches the moon and lights up blue. A niche springs open in the rock.'),
# ---- kamer 6 ----
("name:'De Schatkamer'", "name:'The Treasure Vault'"),
("intro:'Het einde van de kompasnaald. Op een sokkel staat een kist met vijf cijferwielen. Geen sleutelgat. Neel vertrouwde alleen op wie álles had gevonden.'", "intro:'The end of the compass needle. On a pedestal stands a chest with five number wheels. No keyhole. Nell only trusted those who had found everything.'"),
("hints:['Leg je vijf kaartstukken op de stenen tafel. Samen vormen ze Neels kaart.','De stippellijn op de kaart loopt langs vijf tekens. Dat is de volgorde. Het cijfer vind je op de dubloen met dat teken, in je buidel.','Maan, golf, zon, schedel, ster: 3-6-7-9-4.']", "hints:['Lay your five map pieces on the stone table. Together they form Nell’s map.','The dotted line on the map passes five symbols. That is the order. You find the number on the doubloon with that symbol, in your pouch.','Moon, wave, sun, skull, star: 3-6-7-9-4.']"),
('>leg hier</text>', '>lay here</text>'),
("'De stenen tafel'", "'The stone table'"),
('Hier passen vijf kaartstukken. Je hebt er ', 'Five map pieces fit here. You have '),
('Je mist nog het stuk uit:', 'You are still missing the piece from:'),
('Tik op 🗺️ en ga terug naar die plek.', 'Tap 🗺️ and go back to that place.'),
("note('De kaart van Neel',", "note('Nell’s map',"),
('Volg de stippellijn vanaf "begin hier". Bij elk teken staat het cijfer van die dubloen. Dat zijn de vijf cijfers van de kist.', 'Follow the dotted line from "start here". Next to each symbol is the number of that doubloon. Those are the five numbers for the chest.'),
('Vijf stukken, één kaart. De stippellijn begint linksboven en eindigt bij het kruis.', 'Five pieces, one map. The dotted line starts at the top left and ends at the cross.'),
("'Rosse Neel, in steen'", "'Red Nell, in stone'"),
('Vijf munten, vijf cijfers.<br>Mijn kaart wijst de volgorde,<br>mijn munten het getal.', 'Five coins, five numbers.<br>My map shows the order,<br>my coins the number.'),
("'De kist van Neel'", "'Nell’s chest'"),
('Vijf wielen, maar jij hebt nog geen vijf dubloenen.', 'Five wheels, but you do not have five doubloons yet.'),
('Je mist nog de dubloen uit:', 'You are still missing the doubloon from:'),
("text:'Vijf wielen. Eén kans is genoeg, als je alles hebt gevonden.'", "text:'Five wheels. One try is enough, if you have found everything.'"),
# ---- hints kinderen ----
("['Tik op het rode boek op het bureau. Daar staat wat je moet tellen.','Tel 🕯️ de kaarsen met een vlammetje, 🔭 de gouden kijkers en ⚫ de zwarte kogels. Kijk op alle vier de muren!','🕯️ 4 · 🔭 2 · ⚫ 6. Draai de wieltjes van de lade op 4, 2, 6. Met de sleutel open je de kist.']", "['Tap the red book on the desk. It tells you what to count.','Count 🕯️ the candles with a flame, 🔭 the golden spyglasses and ⚫ the black cannonballs. Look at all four walls!','🕯️ 4 · 🔭 2 · ⚫ 6. Turn the wheels of the drawer to 4, 2, 6. The key opens the chest.']"),
("['Tik op de wereldbol. Er valt een briefje uit. Bekijk ook de grote kaart.','Zoek het schip met 1 mast. Ligt het boven, onder, links of rechts op de kaart? Druk op die pijl. Dan 2 masten, 3 masten, 4 masten.','Druk op de kast: → ↓ ↑ ←']", "['Tap the globe. A note falls out. Look at the big chart too.','Find the ship with 1 mast. Is it at the top, bottom, left or right of the chart? Press that arrow. Then 2 masts, 3 masts, 4 masts.','Press on the cabinet: → ↓ ↑ ←']"),
("['Het is donker! Sleep rond tot je een oranje lichtje ziet en tik erop.','Op vier vaten staan krijtstreepjes en een plaatje. Het vat met de meeste streepjes komt eerst. Het luik zit in de vloer: kijk omlaag.',`Zet de wieltjes van het luik zo: ", "['It is dark! Drag around until you see a little orange light and tap it.','Four barrels have chalk marks and a picture. The barrel with the most marks comes first. The hatch is in the floor: look down.',`Set the wheels of the hatch like this: "),
("['Tik op de lessenaar bij de deur. En kijk in het vogelnest bij het raam.','Op het muziekblad staan klokken getekend: klein of groot. Tik op de echte klokken in dezelfde volgorde.','Kleinste klok, grootste klok, middelste klok, kleinste klok.']", "['Tap the lectern by the door. And look in the bird’s nest by the window.','The music sheet shows drawings of bells: small or large. Tap the real bells in the same order.','Smallest bell, largest bell, middle bell, smallest bell.']"),
("['Er mist een spiegel. Kijk in het water van de poel, daar blinkt iets.','Tik op het spiegelrek en dan op het lege rondje linksonder. Tik daarna op spiegels om ze te draaien.','Draai alleen de twee spiegels helemaal links: die in het midden en die onderaan. Dan loopt het licht naar het kristal.']", "['A mirror is missing. Look in the water of the pool, something glints there.','Tap the mirror rack and then the empty circle at the bottom left. After that, tap mirrors to turn them.','Turn only the two mirrors on the far left: the one in the middle and the one at the bottom. Then the light runs to the crystal.']"),
("['Tik op de stenen tafel. Daar leg je de stukken van de kaart neer.','Volg de rode stippellijn vanaf \"begin hier\". Lees de cijfers in de zwarte rondjes, in die volgorde.','De kist gaat open met 3, 6, 7, 9, 4.']", "['Tap the stone table. That is where you lay down the pieces of the map.','Follow the red dotted line from \"start here\". Read the numbers in the black circles, in that order.','The chest opens with 3, 6, 7, 9, 4.']"),
# ---- tussenstops ----
("name:'De Oude Steiger'", "name:'The Old Jetty'"), ("name:'De Wegwijzer'", "name:'The Signpost'"), ("name:'De Papegaai'", "name:'The Parrot'"),
('<h3>Gelukt!</h3>', '<h3>Well done!</h3>'),
("'Het biljet is weer heel. Achter het spijkertje zat een <b>gouden munt</b> geklemd.','De wegwijzer kraakt en draait. Uit de paal rolt een <b>gouden munt</b>.','De papegaai krijst tevreden en laat een <b>gouden munt</b> uit zijn snavel vallen.'", "'The poster is whole again. Wedged behind the nail was a <b>gold coin</b>.','The signpost creaks and turns. Out of the post rolls a <b>gold coin</b>.','The parrot squawks contentedly and drops a <b>gold coin</b> from his beak.'"),
('Verder op de kaart', 'On with the map'),
('Tik op twee stukjes om ze te verwisselen.', 'Tap two pieces to swap them.'),
('Aan een paal hangt een opsporingsbiljet, in stukken gescheurd door de wind. Wie staat erop?', 'On a post hangs a wanted poster, torn to pieces by the wind. Who is on it?'),
('Goed zo! Nog één.', 'Well done! One more.'),
('Nee, dat is het niet. Denk nog eens.', 'No, that is not it. Think again.'),
('`${r+1} van ${rounds.length}`', '`${r+1} of ${rounds.length}`'),
('Hier ben je al geweest. De munt zit in je buidel.', 'You have been here already. The coin is in your pouch.'),
("</p>','Verder');", "</p>','Continue');"),
('Een scheve wegwijzer op een kruispunt. In de paal heeft iemand twee raadsels gekerfd.', 'A crooked signpost at a crossroads. Someone has carved two riddles into the post.'),
('<p>Ik heb een naald, maar naaien kan ik niet.<br>Ik weet altijd de weg, maar loop nooit zelf.</p><p><b>Wat ben ik?</b></p>', '<p>I have a needle, but I cannot sew.<br>I always know the way, but never walk it myself.</p><p><b>What am I?</b></p>'),
("o:['Een klok','Een kompas','Een zeilschip','Een schatkaart'],a:1", "o:['A clock','A compass','A sailing ship','A treasure map'],a:1"),
('<p>Hoe meer je van mij weghaalt, hoe groter ik word.<br>Schatgravers kennen mij goed.</p><p><b>Wat ben ik?</b></p>', '<p>The more you take away from me, the bigger I get.<br>Treasure diggers know me well.</p><p><b>What am I?</b></p>'),
("o:['Een schatkist','Een berg zand','De zee','Een kuil'],a:3", "o:['A treasure chest','A pile of sand','The sea','A hole'],a:3"),
('De papegaai van Neel heeft haar speelkaarten van tafel geveegd. Zoek de paren bij elkaar.', 'Nell’s parrot has swept her playing cards off the table. Find the matching pairs.'),
('Draai twee kaarten om. Zijn ze gelijk, dan blijven ze liggen.', 'Turn over two cards. If they match, they stay face up.'),
# ---- kamer-engine ----
('Sleep om rond te kijken, ook omhoog en omlaag. Tik op wat je opvalt.', 'Drag to look around, up and down too. Tap whatever catches your eye.'),
('>Kijk rond</button>', '>Look around</button>'),
('Een gouden munt! Je hebt er nu ${S.coins}.', 'A gold coin! You now have ${S.coins}.'),
('<h3>Een dubloen van Neel!</h3>', '<h3>One of Nell’s doubloons!</h3>'),
('Goud, met ${SYMN[x.s]} erop. In de rand is een <b>${x.n}</b> gekrast.', 'Gold, stamped with ${SYMN[x.s]}. A <b>${x.n}</b> is scratched into the rim.'),
('Eronder ligt een stuk van een kaart: <b>kaartstuk ', 'Underneath lies a piece of a map: <b>map piece '),
('.length} van 5</b>.', '.length} of 5</b>.'),
('>Terug naar de kaart</button>', '>Back to the map</button>'),
('Nog even rondzoeken', 'Keep looking around'),
('Zoek gerust verder naar gouden munten. De deur brengt je terug naar de kaart.', 'Feel free to keep looking for gold coins. The door takes you back to the map.'),
("note('Hint '+n+' van '+r.hints.length", "note('Hint '+n+' of '+r.hints.length"),
('<h3>Hint ${n+1} van ${r.hints.length}</h3>', '<h3>Hint ${n+1} of ${r.hints.length}</h3>'),
('Eerdere hint: ', 'Previous hint: '),
('Hints zijn gratis. Vraag er gerust een.', 'Hints are free. Just ask.'),
('De eerste hint in elke kamer is gratis.', 'The first hint in each room is free.'),
('Deze hint kost <b>1 gouden munt</b>.', 'This hint costs <b>1 gold coin</b>.'),
('Je hebt geen munten. Neel strijkt met de hand over het hart: deze is gratis.', 'You have no coins. Nell has a soft spot: this one is free.'),
('Geef de hint', 'Give me the hint'), ('Toch niet', 'Never mind'), ("'Dank je'", "'Thanks'"),
('Vijf klikken. Het deksel veert open en het goud spat je tegemoet.', 'Five clicks. The lid springs open and the gold bursts out at you.'),
# ---- einde ----
('Kaperkoning(in) van de zeven zeeën', 'Pirate monarch of the seven seas'),
('Eerste stuurman met een neus voor goud', 'First mate with a nose for gold'),
('Matroos met scherpe ogen', 'Sailor with sharp eyes'), ('Landrot met geluk', 'Lucky landlubber'),
('De schat is van jou', 'The treasure is yours'),
('Tijd op jacht', 'Time on the hunt'),
('<span>Dubloenen</span><b>5 van 5</b>', '<span>Doubloons</span><b>5 of 5</b>'),
('<span>Verborgen gouden munten</span><b>${found} van ${TOT}</b>', '<span>Hidden gold coins</span><b>${found} of ${TOT}</b>'),
('Hints gebruikt', 'Hints used'),
('Zoeker,', 'Seeker,'),
('Je hebt geteld, gekeken, geluisterd en licht gebogen. Meer vroeg ik nooit van mijn bemanning.', 'You have counted, looked, listened and bent light. I never asked more of my crew.'),
('Neem het goud. Maar leg één munt terug in de kist en doe hem dicht. Niet voor mij. Voor wie na jou komt, en voor het plezier van het zoeken.', 'Take the gold. But put one coin back in the chest and close it. Not for me. For whoever comes after you, and for the joy of the search.'),
('Er liggen nog ${TOT-found} gouden munten verstopt. Twee per kamer, zelden op ooghoogte, en één bij elke tussenstop.', 'There are still ${TOT-found} gold coins hidden. Two per room, rarely at eye level, and one at each stop in between.'),
('Kopieer je uitslag', 'Copy your result'), ('Opnieuw spelen', 'Play again'),
('Ik vond de schat van Rosse Neel in ${min} minuten, met ${found} van de ${TOT} verborgen munten. ${rank}.', 'I found the treasure of Red Nell in ${min} minutes, with ${found} of the ${TOT} hidden coins. ${rank}.'),
("'Gekopieerd'", "'Copied'"),
# ---- kaart en beweging ----
("'jouw bank'", "'your sofa'"),
("'De naald trilt'", "'The needle trembles'"),
('Vijf dubloenen, vijf kaartstukken. Het kompas draait nog één keer en blijft dan doodstil staan.', 'Five doubloons, five map pieces. The compass turns once more and then stands dead still.'),
('De laatste plek. Die van de kist.', 'The last place. The one with the chest.'),
("'Op naar de schat'", "'On to the treasure'"),
('Volgend punt ›', 'Next point ›'),
('Tik op een eerdere plek om daarheen terug te gaan.', 'Tap an earlier place to go back there.'),
('<h3>Je bent bij ${nm}</h3>', '<h3>You are at ${nm}</h3>'),
('Hier heb je alles al gevonden.', 'You have found everything here.'),
('Een tussenstop met een puzzel.', 'A stop in between, with a puzzle.'),
('Deze plek is nog niet opgelost.', 'This place has not been solved yet.'),
("'Open de puzzel':'Ga naar binnen'", "'Open the puzzle':'Go inside'"),
('<h3>Volgende plek: ${nm}</h3>', '<h3>Next place: ${nm}</h3>'),
('Tik op de plek op de kaart om erheen te reizen.', 'Tap the place on the map to travel there.'),
('<h3>Op weg naar ${nm}</h3>', '<h3>On the way to ${nm}</h3>'),
('${Math.floor(S.steps)} van ${need} stappen', '${Math.floor(S.steps)} of ${need} steps'),
("Math.floor(S.steps)+' van '+need+' stappen'", "Math.floor(S.steps)+' of '+need+' steps'"),
("walking?'Pauze':'Ik loop'", "walking?'Pause':'I’m walking'"),
('Loop door het huis of op de plaats, telefoon in je hand of zak.', 'Walk around the house or on the spot, phone in your hand or pocket.'),
('Speel verder op de bank', 'Carry on from the sofa'), ('Probeer gps opnieuw', 'Try GPS again'),
('Het kompas zoekt je plek. Even geduld, het ding is drie eeuwen oud.', 'The compass is looking for you. Bear with it, the thing is three centuries old.'),
('Rood wijst de richting op de kaart (noord boven).', 'Red shows the direction on the map (north is up).'),
('Rood wijst naar de plek.', 'Red points to the place.'),
('Tik nu op de kaart…', 'Now tap the map…'), ('Verleg dit punt', 'Move this point'), ('>Andere route<', '>Different route<'),
('Ik sta er (gps hapert)', 'I’m there (GPS is off)'),
('Nog niet. Je voeten brengen je erheen, niet je vinger.', 'Not yet. Your feet take you there, not your finger.'),
('Loop erheen. Het kompas wijst de weg.', 'Walk there. The compass shows the way.'),
('Geen stappenteller op dit apparaat: we tellen in wandeltempo zolang "Ik loop" aan staat.', 'No step counter on this device: we count at walking pace while "I’m walking" is on.'),
('Dit apparaat geeft geen gps door.', 'This device does not provide GPS.'),
('Het kompas vindt je plek niet. Sta gps toe voor deze pagina, of speel hier vanaf de bank. In de voorvertoning van Claude werkt gps niet; op je eigen site wel.', 'The compass cannot find you. Allow GPS for this page, or play from the sofa here. GPS does not work in the Claude preview; on your own site it does.'),
('Gps is hier niet beschikbaar.', 'GPS is not available here.'),
("['± 1,5 km','± 2,5 km','± 4 km']):['Kort','Normaal','Lang']", "['± 1.5 km','± 2.5 km','± 4 km']):['Short','Normal','Long']"),
('Testknoppen staan aan: sla kamers en lopen over met Test ⏭', 'Test buttons are on: skip rooms and walking with Test ⏭'),
("'Geluid: '+(S.sound?'aan':'uit')", "'Sound: '+(S.sound?'on':'off')"),
# ---- brief ----
('Dit kompas is niet kapot. Het wijst alleen niet naar het noorden. Het wijst naar mij.', 'This compass is not broken. It just does not point north. It points to me.'),
('In 1689 verstopte ik, <b>Rosse Neel</b>, mijn buit op zes plekken. Vijf bewaren een dubloen en een stuk van mijn kaart. De zesde bewaart de rest.', 'In 1689 I, <b>Red Nell</b>, hid my loot in six places. Five each keep a doubloon and a piece of my map. The sixth keeps the rest.'),
('Elke plek zit op slot. Kijk rond. Tel. Luister. En kijk ook eens omhoog: goud ligt zelden op ooghoogte.', 'Every place is locked. Look around. Count. Listen. And do look up: gold rarely lies at eye level.'),
('Volg het kompas', 'Follow the compass'),
]

def translate(t):
    for nl, en in sorted(PAIRS, key=lambda p: -len(p[0])):
        t = t.replace(nl, en)
    return t

both = body + script
missing = [nl for nl, _ in PAIRS if nl not in both]
if missing:
    print('ONTBREEKT in de bron (%d):' % len(missing))
    for m in missing: print('  ', m[:110])
    sys.exit(1)

def pack(b, s):
    return 'document.getElementById("app").innerHTML=' + json.dumps(b, ensure_ascii=False) + '.split("img/").join((window.RNB||"")+"img/");\n' + s

open('nl.js', 'w', encoding='utf-8').write(pack(body, script))
en = pack(translate(body), translate(script))
open('en.js', 'w', encoding='utf-8').write(en)

LOADER = """<div id="app"></div>
%(pre)s<script src="%(b)slib/three.min.js"></script>
<script>
(function(){var d=document.documentElement,l=d.getAttribute('data-lang'),h=location.hash.replace('#',''),B=d.getAttribute('data-base')||'';window.RNB=B;
if(!l&&(h==='en'||h==='nl'))l=h;if(!l){try{l=localStorage.getItem('rn.lang')}catch(e){}}if(l!=='en'&&l!=='nl')l='nl';
window.LANG=l;d.lang=l;if(l==='en'&&!d.getAttribute('data-lang'))document.title='The Treasure of Red Nell';
var s=document.createElement('script');s.src=B+l+'.js?v=%(v)s';s.onload=function(){var r=document.createElement('script');r.src=B+'room3d.js?v=%(v)s';document.body.appendChild(r)};document.body.appendChild(s)})();
</script>
</body>
</html>
"""
V = '1'
open('index.html', 'w', encoding='utf-8').write(head + LOADER % {'pre': '', 'b': '', 'v': V})

# ---- pagina's voor de MiniMystery-site (alleen als dit in <site>/games/neel/ staat) ----
import os
SITE = os.path.abspath(os.path.join(os.getcwd(), '..', '..'))
if os.path.exists(os.path.join(SITE, 'shared', 'platform.js')):
    U = 'https://www.minimystery.nl/'
    NLS, ENS = 'de-schat-van-rosse-neel.html', 'en/the-treasure-of-red-nell.html'
    def shell(lang, root, title, desc):
        base = root + 'games/neel/'
        h = head.replace('url(img/', 'url(' + base + 'img/')
        attrs = '<html lang="%s" data-lang="%s" data-base="%s" data-other="%s" data-hub="%s">' % (lang, lang, base, ('en/the-treasure-of-red-nell.html' if lang == 'nl' else '../de-schat-van-rosse-neel.html'), ('index.html' if lang == 'nl' else 'index.html'))
        assert '<html lang="nl">' in h
        h = h.replace('<html lang="nl">', attrs)
        meta = ('<title>%s</title>\n<link rel="icon" href="%sassets/favicon.png">\n<link rel="apple-touch-icon" href="%sassets/apple-touch-icon.png">\n<meta name="description" content="%s">\n'
                '<link rel="canonical" href="%s">\n<link rel="alternate" hreflang="nl" href="%s">\n<link rel="alternate" hreflang="en" href="%s">\n'
                '<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:image" content="%sassets/og-rn.jpg">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="theme-color" content="#0a1a22">'
                ) % (title, root, root, desc, U + (NLS if lang == 'nl' else ENS), U + NLS, U + ENS, title, desc, U)
        h = re.sub(r'<title>.*?</title>', lambda m: meta, h, count=1)
        pre = '<script src="%sshared/platform.js?v=mm20"></script>\n<script src="%sshared/catalog.js?v=mm19"></script>\n' % (root, root)
        return h + LOADER % {'pre': pre, 'b': base, 'v': V}
    open(os.path.join(SITE, NLS), 'w', encoding='utf-8').write(shell('nl', '', 'De Schat van Rosse Neel – schattenjacht met escape rooms in 3D voor het hele gezin', 'Volg het kompas van kaapvaarster Rosse Neel langs zes escape rooms in 3D en drie puzzelstops, en open haar schatkist. Buiten met gps, binnen op de plaats of vanaf de bank. Voor kinderen en voor het hele gezin. Proefronde gratis.'))
    open(os.path.join(SITE, ENS), 'w', encoding='utf-8').write(shell('en', '../', 'The Treasure of Red Nell – a treasure hunt with 3D escape rooms for the whole family', 'Follow the compass of privateer Red Nell through six 3D escape rooms and three puzzle stops, and open her treasure chest. Outdoors with GPS, indoors on the spot or from the sofa. For kids and for the whole family. Free trial.'))
    print('sitepagina\'s geschreven:', NLS, ENS)

# controle: Nederlandse woorden die in de Engelse versie zijn blijven staan
strings = re.findall(r"'([^'\\n]{4,})'|>([^<>{}$`\\n]{4,})<|`([^`]{4,})`", translate(script) + translate(body))
dutch = re.compile(r"\b(de|het|een|je|jij|van|niet|naar|op|te|dat|die|met|voor|er|aan|ik|bij|ook|nog|maar|als|dan|zijn|hier|deze|wat|kaart|plek|munt|kist|tik|geluid|stappen|schat|terug|verder|dicht|kamer|klok|sleutel|zoek|bent|hebt|mijn|uit|naar|geen|wel|nu|gaat|staat)\b", re.I)
left = []
for tup in strings:
    for f in tup:
        f = f.strip()
        if f and dutch.search(f) and not re.search(r"(=>|function|const |return|\(\)|\.fl|stroke|querySelector|fill=|S\.|\$\(|data-|class=|px|rgba|translate\()", f):
            left.append(f)
print('gebouwd: index.html, nl.js, en.js; mogelijk nog Nederlands: %d' % len(set(left)))
for f in sorted(set(left))[:60]: print('  ?', f[:120])
