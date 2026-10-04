/* The Vanishing – English texts and case data. Placeholders: {N} name, {P} he/she, {O} him/her, {S} his/her, {K} key person, {KR} relation, {t} time */
window.VZ_DATA={lang:"en",
T:{title:"The Vanishing",eyebrow:"Someone is gone",lead:"You hold the last message. The last eight traces of that evening lie in your streets: camera stills, texts, statements, objects. Everything you find is true. But nobody knows the whole story.",
  rank:"Rank",streak:"Day streak",solved:"Solved",short:"Short · 40 min",full:"Full · 75 min",resume:"Continue your case",today:"Start today's case",todayAgain:"Play today's case again",extra:"Extra case here",code:"Enter a case code",demo:"Practice round in a fictional Amsterdam",
  how:["The map lays eight traces on real places around you: the route {N} walked that evening.","Come within 35 metres and the trace opens. Every trace carries a time. Together they make the evening.","Decide what happened (abducted, fled or vanished by choice) and who knows more."],
  archive:"Archive",wipe:"Erase",safety:"Stay on public roads and mind the traffic. You never need to go inside.",allWalks:"◂ All walks",lang:"Nederlands",
  brief:"File",missing:"Missing since last night",lastMsg:"Last message, {t}",contacts:"Five people from {S} life",go:"Into the night",back:"Back",
  hud:["Time","Traces","Earliest","Km"],menu:"Menu",zin:"Zoom in",zout:"Zoom out",me:"Centre on me",snd:"Sound on or off",
  radar0:"Find the first trace",radarAll:"All traces found. Time to close the file.",hot:"Hot. {d} m to go",warm:"Warm. {d} m to go",near:"Nearest trace: {d} m",
  note:"Notebook",close:"Close file",look:"Examine",walk:"Walk here",gps:"GPS is off, I'm here",here:"A trace lies here.",wit:"Someone stands in the shadow: {p}.",
  kinds:{cam:"Camera still",msg:"Message",wit:"Statement",obj:"Object",time:"Time stamp",open:"Last message"},
  hold:"Hold to examine",holdWit:"Hold to listen",later:"Come back later",found:"Trace {i} of 8 · {t}",
  nbRoute:"Route",nbPeople:"People",nbWhat:"What happened?",nbNone:"No traces yet. The time stamps put the evening in order.",nbTip:"Tap a name or an outcome to strike it out.",
  scn:[["Abducted","Someone took {N}, against {S} will."],["Fled","{N} left because {P} was afraid of something."],["Vanished by choice","{N} wanted out and arranged it {S}self."]],
  vH:"Close the file",vT:"Choose what happened and who knows more. Everything you found is true; the combination makes the difference.",vWhat:"What happened?",vWho:"Who knows more?",vGo:"This is my conclusion",vNeed:"Choose an outcome and a person.",
  wrong:"Not quite. One of the two, or both, is wrong.",wrongTries:"Read the time stamps in order once more.",
  won:"File closed",stars:["Solved.","First conclusion right.","Within time."],missed1:"Star missed: right first time.",missed2:"Star missed: within {m} minutes.",
  up:"Promoted to {r}.",pts:"+{x} points",streakTxt:"{n} day in a row",streakTxtP:"{n} days in a row",share:"Share this case",shareTxt:"The Vanishing, file {c}: {s}, {m} min. Walk the same case in your own streets:",copied:"Copied",toHome:"To the start screen",
  dH:"Play the same case",dT:"Every case has a code. Enter someone else's code and you get the same disappearance, the same people and the same truth, at places in your own streets.",dGo:"Start this case",dBad:"That case code does not exist. Check it and try again.",
  aH:"Archive",aNone:"No closed files yet.",aTip:"Tap a file to share its case code.",
  mMap:"Back to the map",mHome:"To the start screen",mWipe:"Erase this case",saved:"Your case is saved. Choose Continue to go on.",wipeQ:"Erase this case?",wipeT:"The traces and time of this case will be lost.",wipeY:"Yes, erase",wipeAll:"Erase everything, including rank and archive",allQ:"Erase everything?",allT:"Rank, points, day streak and archive will be lost on this phone. Pro stays.",allY:"Yes, erase everything",wiped:"Erased.",cancel:"Cancel",
  noGps:"This device does not share its location. You can still play the practice round.",denied:"No access to your location. Open this game in your phone's browser via an https address and allow location. You can play the practice round here.",fail:"That won't work here",
  loc:"Finding your location…",pois:"Finding places near you…",nomap:"The map service is not responding. Your traces lie within walking distance around you.",demoTip:"Practice round: tap the map to walk.",wait:"This usually takes 5 to 30 seconds. Stay on this page.",
  pro:"Go Pro",proFree:"Your first missing-person case is free.",proUsed:"Your free case is played. With Pro you play a new one every day, in every walk.",proOn:"Pro is active on this phone.",
  corner:"Corner of",demoCase:"practice round"},
PZ:{lamp:["Someone is hiding","Shine your torch through the dark. Keep the light on the figure until the circle closes. Three times."],
  seq:["The doorbell camera is blinking","Watch the order of the lights and tap it back. Each round adds one."],
  pin:["The phone is locked","Four keys carry greasy smudges. Find the order. Green is right; yellow is in the code, but elsewhere."],
  radio:["A voice in the static","Turn the dial until the voice is clear and hold it there."],
  tiles:["A torn photo","Tap two pieces to swap them until the picture is right."],
  dust:["Something lies here under the dust","Wipe it away."],
  look:"Watch…",yours:"Your turn: {n} lights",wrongSeq:"Wrong. Watch again.",good:"Good. One more.",tryBtn:"Try",freq:"Frequency",
  ar:{h:"Look around",t:"Through your camera you can see where {N} stood that evening. Turn around until you find the figure and keep it in view. The image stays on your phone and is never stored or sent.",yes:"Turn on camera",no:"Without camera",left:"◀ Turn left",right:"Turn right ▶",hold:"Hold still…",found:"There.",close:"Camera off",drag:"Swipe across the screen to look around"},
  epi:{btn:"To the last place · +50",home:"To the start screen",radar:"Walk to the last place: {d} m",name:"The last place",chip:"This is where {N}'s trail ends.",act:"Look around",h:"Epilogue",bonus:"+50 points",back:"Back"}},
TYPES:{kerk:["the church","the verger"],bank:["the bank","the bank's night guard"],cafe:["the café","the barman"],hotel:["the hotel","the night porter"],apotheek:["the pharmacy","the pharmacy assistant"],halte:["the bus stop","the night-bus driver"],post:["the postbox","the postman"],park:["the park","the dog walker"],school:["the school","the caretaker"],winkel:["the shop","the shelf stacker"],bieb:["the library","the librarian"],kunst:["the artwork","the street musician"],bankje:["the bench","the sleepless neighbour"],tank:["the petrol station","the pump attendant"],hoek:["the street corner","the paper boy"]},
SPARE:["the street sweeper","the night nurse on her way home","the insomniac angler","the baker's boy","the homeless poet"],
DEMO:[["kerk","Old Night Church"],["cafe","Café The Blue Heron"],["post","Postbox Lantern Lane"],["hotel","Hotel Winterlight"],["bank","Half Moon Savings Bank"],["apotheek","Golden Mortar Pharmacy"],["park","Shade Gardens"],["halte","Tram stop Night Canal"],["bieb","Night Barge Library"],["kunst","Statue The Watchman"],["winkel","Van Dam Bakery"],["school","The Switch School"],["bankje","Bench on Mist Canal"]],
PRON:{f:{P:"she",O:"her",S:"her"},m:{P:"he",O:"him",S:"his"}},
MISSING:[
 {n:"Maaike Verhoef",r:"night pharmacist",g:"f",msg:"Nearly there. Don't answer the door if someone rings.",bio:"Had worked the night shift for eight years and knew everyone who needed medicine after dark."},
 {n:"Sander Boonstra",r:"bike courier",g:"m",msg:"If I'm not back by midnight: look in the blue bag.",bio:"Rode for anyone who wanted something gone fast and never asked questions. Until last week."},
 {n:"Lotte Brandsma",r:"music teacher",g:"f",msg:"It's arranged. Don't tell anyone I sent this.",bio:"Taught piano to half the neighbourhood and had recently acquired a second phone."},
 {n:"Emiel Terpstra",r:"night porter at the town hall",g:"m",msg:"They know. I'm leaving now. I'll call tomorrow, if I can.",bio:"Saw every evening who still came in after closing time, and wrote it down."},
 {n:"Noa Dekker",r:"medical student",g:"f",msg:"I have to pick something up by the water. Then I'll come.",bio:"Moved here three months ago and walked the same round every evening."},
 {n:"Bas Hooijmaijers",r:"owner of a second-hand shop",g:"m",msg:"It was just in a box. I should never have opened it.",bio:"Cleared out whole houses and sometimes found more than the inventory listed."}
],
CONTACTS:[["Joris Verhoef","the brother"],["Wendy Kalsbeek","the sister"],["Nadia El Amrani","the colleague"],["Henk Bultena","the neighbour"],["Rutger Smeets","the ex"],["Ton Ravensbergen","the landlord"],["Fleur Hoogland","the best friend"],["Dennis Wiersma","the gym trainer"],["Marloes Vink","the boss"],["Yusuf Demir","the fellow student"],["Greet Oosterhuis","the upstairs neighbour"],["Pim de Lange","the regular customer"],["Ilse Nooteboom","the family doctor"],["Kasper Rooijakkers","the old school friend"]],
CT:{
 auto:{v:["auto","fiets"],tag:{auto:"drives a car",fiets:"has no car"},clue:{
   auto:[{k:"cam",t:"Camera still, {t}. A dark car idles round the corner, passenger door open; {N} walks towards it."},{k:"wit",t:"There was a car with its lights off. Someone at the wheel, someone beside it. {N} got in without looking back."},{k:"obj",t:"A parking ticket from a machine up the road, {t}, valid for less than fifteen minutes. Nobody local parks that briefly."}],
   fiets:[{k:"cam",t:"Camera still, {t}. {N} walks beside someone wheeling a bicycle. They talk; the bike is never ridden."},{k:"wit",t:"Two people on foot, one with a bike. They walked past as if they had to be somewhere close. No car, I'm sure of that."},{k:"obj",t:"A bike light, still on, in the grass. The kind someone tears off when there is a hurry."}]}},
 sleutel:{v:["ja","nee"],tag:{ja:"has a key to {S} home",nee:"never comes to {S} home"},clue:{
   ja:[{k:"msg",t:"Message to {N}, {t}: “I already have your things. I was inside, nobody saw me.”"},{k:"wit",t:"That person said something about {N}'s back door. That it didn't shut properly. You only know that if you go in yourself."},{k:"obj",t:"{N}'s keyring, two keys missing. Whoever could get into {S} home didn't need to take those."}],
   nee:[{k:"msg",t:"Message to {N}, {t}: “I'll wait outside. I'm not coming up, you know that.”"},{k:"wit",t:"They stood talking in the street. The one with {N} clearly didn't want to come inside. Or wasn't allowed."},{k:"obj",t:"A note under a stone by the door: “Outside, as agreed.” The ink hasn't run yet."}]}},
 geld:{v:["ja","nee"],tag:{ja:"borrowed money from {O}",nee:"has no money dealings with {O}"},clue:{
   ja:[{k:"msg",t:"Message to {N}, {t}: “It's not about the money. Please don't say that again.”"},{k:"obj",t:"An envelope with an amount written on it, crossed out, and below it: “tonight”."},{k:"wit",t:"I heard the word ‘interest’. You don't forget that, this late in the street."}],
   nee:[{k:"msg",t:"Message to {N}, {t}: “This has nothing to do with money. You know that too.”"},{k:"obj",t:"A cash-machine slip of {N}'s: balance checked, nothing withdrawn. Someone handing over money would have withdrawn something."},{k:"wit",t:"No fuss about money, if that's what you mean. It was about something else. Something they both knew."}]}},
 ruzie:{v:["ja","nee"],tag:{ja:"argued with {O} last week",nee:"has never argued with {O}"},clue:{
   ja:[{k:"wit",t:"They'd fought this out before, you could hear it. ‘Just like last week,’ {N} said. ‘This is exactly like last week.’"},{k:"cam",t:"Camera still, {t}. {N} keeps a distance. The other steps forward; {N} steps back."},{k:"msg",t:"Message to {N}, {t}: “Sorry about last time. I didn't mean it. Just come.”"}],
   nee:[{k:"wit",t:"A calm talk. No raised voices, no old wounds. Two people who trust each other, that's how it looked."},{k:"cam",t:"Camera still, {t}. {N} puts a hand on the other's shoulder. Familiar. They walk in step."},{k:"msg",t:"Message to {N}, {t}: “You know I'd never lie to you. Never have.”"}]}},
 bellen:{v:["ja","nee"],tag:{ja:"called {O} that evening",nee:"did not call {O} that evening"},clue:{
   ja:[{k:"obj",t:"{N}'s phone, screen cracked. Last call {t}, 4 minutes, a number from {S} contacts."},{k:"wit",t:"{N} was on the phone. ‘I'm nearly there,’ {P} said. And then: ‘No, I'm coming alone.’"},{k:"cam",t:"Camera still, {t}. {N} stands still with the phone to {S} ear, looks around, then walks on."}],
   nee:[{k:"obj",t:"{N}'s phone in a planter. Flight mode since {t}. Anyone who wanted to reach {O} had to find another way."},{k:"wit",t:"No phone call, no. They knew exactly where to be. That had been arranged, you could tell."},{k:"cam",t:"Camera still, {t}. {N} looks at a slip of paper, not a phone, and turns the corner."}]}}
},
SC:[
 {m:"TF",k:"cam",t:"Camera still, {t}. {N} looks back three times in twenty seconds. Walks faster than someone heading somewhere."},
 {m:"TF",k:"wit",t:"{P} was scared. You could see it. Not of me, of something behind {O}. I asked if {P} was alright; {P} just shook {S} head."},
 {m:"TF",k:"obj",t:"A glove, half in the gutter, the other nowhere to be found. Nobody leaves one glove behind when they leave calmly."},
 {m:"TF",k:"msg",t:"Draft, never sent, {t}: “If you read this I'm not home. Don't call. They're listening.”"},
 {m:"TV",k:"wit",t:"Someone was waiting for {O}. Not by chance: already there when I passed, checking the phone every minute."},
 {m:"TV",k:"cam",t:"Camera still, {t}. {N} is handed something, a packet or a phone, and pockets it without looking."},
 {m:"TV",k:"obj",t:"A train ticket for tomorrow morning, one person, single, not in {N}'s name."},
 {m:"TV",k:"msg",t:"Message to {N}, {t}: “Everything is ready. All you have to do is come.”"},
 {m:"FV",k:"obj",t:"{N}'s keys, neatly in an envelope, name on it. Nobody who leaves like that is back tomorrow."},
 {m:"FV",k:"cam",t:"Camera still, {t}. {N} walks alone, with a full backpack {P} didn't have in the afternoon."},
 {m:"FV",k:"wit",t:"{P} asked me when the first bus went. Alone, no company. {P} had already decided, you could hear it."},
 {m:"FV",k:"msg",t:"Message to {S} work, {t}: “I'm not coming in tomorrow. Or the day after. Find someone else.”"}
],
TIME:[
 {k:"time",t:"Receipt, {t}: a bottle of water and batteries. Paid cash. {N} always paid by phone."},
 {k:"time",t:"A bin where a bag was dropped at {t}, with clothes of {N}'s. The coat isn't among them."},
 {k:"time",t:"A doorbell camera: {t}, {N} rings, waits, doesn't ring again, walks on."},
 {k:"time",t:"Chalk on the pavement, an arrow, and {t} beside it in {N}'s handwriting. How can you tell? Because {P} never crosses a 7, and this one isn't crossed either."}
],
OPEN:"From here {N} sent the last message at {t}: “{msg}” Then the phone went off, or was switched off.",
END:[
 ["{N} was taken, and {K} ({KR}) knows where. Not because {K} did it, but because {K} was there when it went wrong, and has kept silent since. The car, the waiting figure, the fear on the stills: it only fitted once you laid it out in order.","Police found {N} tonight at an address only {K} knew. Shaken, unharmed. {K} had nearly called three times."],
 ["{N} fled, and {K} ({KR}) is the reason. Not the violence you expected: a threat that had lasted for weeks and that nobody else knew about. The keys in the envelope, the backpack, the question about the first bus: {N} didn't just leave. {P} left someone.","Two days later a card arrived with no sender. One line: ‘I'm fine. Tell {K} I'm not coming back.’"],
 ["{N} vanished by choice, and {K} ({KR}) helped. The ticket in another name, the packet ready and waiting, the calm on the stills: {N} had a plan, and {K} was the only part of it still living in this neighbourhood.","You close the file without an address. That is what {N} wanted. {K} says nothing, but doesn't look away when you say {S} name."]
]
};
