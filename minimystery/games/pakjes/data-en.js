/* Operation Sinterklaas Eve – English texts and trials. MiniMystery, ages 6–10, 5 December (pakjesavond).
   Same game as data-nl.js (Operatie Pakjesavond), for expat and international families. Keep the structure in step with data-nl.js:
   same keys, same array lengths, same order (the seed picks by index). Level 0 = Pepernoot (6–7), 1 = Head Piet (8–10). */
window.PA_DATA=(function(){
var T={
  today:"Start Operation Sinterklaas Eve",extra:"Another case",voice:"Read aloud",voiceOn:"Piet reads everything aloud",voiceOff:"Reading aloud is off",
  start:"Do the Piet trial",next:"Next ▸",back:"Back",close:"Close",cancel:"Cancel",ok:"Check ▸",listen:"Read aloud",
  loc:"Where are you? The phone will ask for your location.",pois:"Piet is looking for places nearby where the pieces landed…",nomap:"The map service is busy. We'll play on a drawn map.",
  noGps:"This phone has no GPS.",denied:"Location is switched off. Turn it on in the settings, or play without a map.",
  corner:"Corner",task:"Piece {i} of {n}",clue:"Piece {n} of {t} found",
  kinds:{tel:"Counting pepernoten",vang:"Catch the sweets",memory:"Shoe memory",dak:"Up on the roof",ritme:"Ozosnel's hoofbeat",sorteer:"The wrapping Piet",verschil:"The odd present",code:"Piet's secret code",rijm:"The Rhyme Piet",boek:"The Big Book",zoek:"Find and photograph",kijk:"Look and count",gym:"Piet gym",schaduw:"Shadows on the roof"},
  near:"Next piece in {d} m",warm:"Warm! {d} m to go",hot:"Hot! It must be here",radarAll:"All pieces found! Put the map together.",
  here:"A piece is here",look:"Pick up the piece",walk:"Walk there",gps:"We're really here (GPS is unsure)",
  notebook:"The hiding map",nbZ:"Pieces found",nbNone:"No pieces yet. Walk to the first place.",
  menu:"Menu",mBack:"Back to the case",mHome:"Pause, continue later",mWipe:"Delete this case",mParent:"🎄 Head Piet (grown-ups)",mSkip:"Grown-up: skip this trial",saved:"Saved. You can continue later.",
  wipe:"Delete",wipeY:"Delete this case",wipeAll:"Delete everything (archive too)",wipeQ:"Delete this case?",wipeT:"The progress of this case will be gone. The parents' hiding places stay.",allQ:"Delete everything?",allT:"Case, archive and settings will be deleted. The Head Piet settings too.",allY:"Yes, delete everything",wiped:"Deleted",
  dH:"Enter a case code",dT:"With a case code, several phones play the same case: the same places, the same trials. Handy with two groups.",dGo:"Load case",dBad:"We don't know that code. Codes start with PA.",
  demoCase:"Practice round · drawn town",demoTip:"Tap a place on the map: you'll walk there by yourselves.",
  howH:"How does it work?",
  won:"Done it",dipBtn:"Piet Detective diploma (A4)",dipH:"Piet Detective diploma",dipNote:"Print or save. Print one for every child.",home:"Back to the start",dl:"Save",shareBtn:"Share",copied:"Copied",
  shareTxt:"We put Piet's hiding map back together and found the presents! Case {c} · {s} · {m} min. ",
  missed1:"No hints: three stars.",
  pzT:"Talk it over. One person taps.",wrong:"Not yet. Talk it over again.",wrongHint:"Not yet. Take the hint, or try again.",hintBtn:"💡 Hint from Piet",hintUsed:"Hint used",
  countGo:"Done ▸",photoGo:"📷 Take the photo",photoAgain:"Once more",photoOk:"That's the one! ▸",photoKeep:"The photo stays on this phone.",photoSkip:"No camera? Show it to the grown-up and carry on",
  pieceGet:"A piece of the hiding map!",pepGet:"+{n} pepernoten",
  again:"▶ Once more",go:"▶ Start",done:"Done!",ready:"Ready? Here we go.",timer:"time",score:"caught",
  finH:"Put the map together",finNot:"Find all the pieces first. {n} to go.",
  finT:"All the pieces are on the table. Tap each piece to turn it over.",finGo:"The map is complete ▸",
  letH:"Piet reads the map",
  trH:"The last clue",trFound:"Found it! 🎉",trMore:"There's more…",trHelp:"We can't find it",trExact:"Piet whispers: {w}",trNone:"",
  prH:"Head Piet",prLead:"For the parents. Fill this in while the children aren't looking. Piet only shows it once the children have every piece of the map.",
  prPinNew:"Choose a 4-digit Piet code so the children can't get in here.",prPinAsk:"Piet code",prPinBad:"That code isn't right.",prPinSet:"Save code ▸",prPinGo:"Open ▸",prPinForgot:"Forgot the code? Delete everything (Delete button on the start screen) and start again.",
  prSpots:"The hiding places",prSpotsT:"One place for all the presents, or a place for each child. Piet shows them one by one.",
  prWhat:"What's there?",prWhatP:"e.g. the presents for Noor and Sam",prHint:"Clue (can be a riddle)",prHintP:"e.g. Where it's always warm and the socks get dry…",prWhere:"Exact place (only if they can't find it)",prWhereP:"e.g. in the laundry basket in the attic",prPhoto:"📷 Photo of the place (optional)",prPhotoOk:"Photo added ✓",prDel:"Remove",prAdd:"+ Another hiding place",
  prSave:"Save",prSaved:"Saved.",prEmpty:"No hiding place filled in yet. Then Piet points to the living room at the end. You can change it any time, even during the game.",prOk:"Set ✓",
  prAns:"Answers for this case",prAnsT:"For the grown-up only: the trials in this case and what the answer is.",prChange:"Change Piet code",
  prBtn:"🎄 Head Piet (for the grown-ups)",prBtnOk:"🎄 Head Piet · set ✓",
  lvl:["Pepernoot","Head Piet"],lvlAge:["ages 6–7","ages 8–10"],
  nw:{6:"six",8:"eight",10:"ten"},
  kv:{fp:["Bakery","Bus stop","Playground","Square","Bridge","Park","Church","Fountain","Shop","Postbox","Kiosk","Bench"],
    all:"All pieces found! Put the map together.",near:"Piece in {d} m",cold:"Cold… try another way",cool:"Lukewarm. Getting closer",warm:"Warm! Well done!",hot:"HOT! Look around you!",here:"The piece is here!",first:"Off you go, the compass shows the way",noDir:"Walk a little, then the compass knows the direction",
    map:"Street map",kids:"Story map",mapTip:"The real street map. Tap Story map for the children's drawing.",goDemo:"We're walking (pretend) to {p}…",inSteps:"{n} steps to go",
    mNoMap:"Continue without map (same case)",switched:"Continuing without a map. Same case, same trials.",virtOut:"No street map of the area found. You walk on the story map: the arrow and warm/cold show the way.",
    noMapQ:"No location today?",noMapT:"The phone isn't sharing a location. You can play the same case without a map: the pieces come one after another and you walk to a new place yourselves.",noMapGo:"Continue without map"}
};
var X={hint:"Hint",of:"{i} of {n}",flipped:"{i} of {n} turned over",phWord:"word",phRhyme:"rhyme word",noteLine:"{i} of {n} pieces · 🥜 {p} pepernoten",aWord:"the word: ",aPhoto:"photo of ",aKijk1:" → that number plus 3",aKijk0:" → even or odd",aTel:"the number of pepernoten that fall (shown after counting)",aVang:"catch at least {n} pepernoten in {s} seconds",aDak:"tap {n} times right above the red chimney",aRitme:"copy the hoofbeat, {n} rounds",aSort0:"tap from small to big",aSort1:"from the lowest to the highest number",aVerschil:"the present with the different bow",aMemory:"find {n} pairs",aGym:"jump until the time is up",aSchaduw:"the right name for the shadow, {n} times",
  pieces:"{n} pieces",mIn:"Indoors at home",mStreet:"Outdoors without map",mMap:"Outdoors with map",warnPar:"<b>For the grown-ups:</b> tap Head Piet first, while the children aren't looking. You can also do it later, from the menu.",
  goRoom:"Walk together to {r}. ",goOut:"Walk together to a new place nearby, like a corner, a lamppost or a bench. ",pieceThere:"Piece {i} is there. Piet has a trial for it: {t}.",
  telGo:"Count along…",telQ:"How many pepernoten were there?",vangGo:"Catch the pepernoten, not the coal!",vangOk:"Done it! {n} pepernoten.",vangNo:"Not enough yet: {n} of {m}.",
  dakGo:"Tap when Piet is above the red chimney · 0 of {n}",dakHit:"Got it! {i} of {n}",dakMiss:"Missed! Piet bounces on. {i} of {n}",
  listen:"Listen…",round:"Round {i} of {n}: listen…",yourTurn:"Your turn! Copy it.",exact:"Exactly right!",good:"Well done!",ritmeNo:"Oops, that was a different hoof. Listen again.",
  sort0:"Tap the smallest present",sort1:"Tap the present with the lowest number",sortOk:"Everything's in the sack!",sortNext:"Good! Now the next one.",sortNo:"That one's still too big. Start again with the smallest.",
  typeNum:"Type a number",kijk0:"You counted {n}. Is that an even or an odd number?",kijk1:"You counted {n}. Piet puts one pepernoot by each of them and keeps 3 more in his sack. How many pepernoten does he need?",evenOdd:["Even","Odd"],other:"change",
  secs:"seconds",jumps:"jumps counted",gymGo:"Start jumping! Count out loud.",gymTop:"Wow, {n} jumps! Real roof runners.",gymOk:"Great jumping: {n} counted. Piets are nimble!",gymNoSens:"Great jumping! Piets are nimble.",
  nicePhoto:"Nice photo!",skipT:"Piece {i} is then given without a trial (counts as a hint).",skipY:"Skip",onMap:"The map says: ",
  hint1:"1 hint",hintsN:"{n} hints",noHints:"no hints",noHints2:"without hints",teamDef:"The Piet Detectives",print:"Print",dipFile:"piet-detective-diploma",
  dTop:"MINIMYSTERY · OPERATION SINTERKLAAS EVE",dTitle:"Piet Detective diploma",dIntro:"Sinterklaas hereby appoints as official Piet Detectives:",dTeam:"the Piet Detectives of this house",dL1:"They found all {n} pieces of Piet Pepernoot's hiding map",dL2:"in {m} minutes · 🥜 {p} pepernoten · {h} · level {l}",dL3:"and brought the presents safely home.",dSign1:"Sinterklaas",dSign2:"and Piet Pepernoot",dFoot:"minimystery.nl · case ",
  archH:"Solved cases",archRow:"{m} min · case {c} · tap to play the same case again",archNone:"No case solved on this phone yet.",title:"Operation Sinterklaas Eve"};
var TYPES={kerk:"the church",hotel:"the hotel",bank:"the bank",apotheek:"the pharmacy",cafe:"the café",bieb:"the library",park:"the park",school:"the school",kunst:"the artwork",tank:"the petrol station",winkel:"the shop",halte:"the bus stop",post:"the postbox",bankje:"the bench",hoek:"the corner"};
var PIET="Piet Pepernoot",SINT="Sinterklaas";
var ROOMS=[["kitchen","in the kitchen","🍳"],["living room","in the living room","🛋️"],["hallway","in the hallway","🚪"],["stairs","by the stairs","🪜"],["bedroom","in a bedroom","🛏️"],["bathroom","in the bathroom","🛁"],["front door","by the front door","🏠"],["landing","on the landing or in the attic","🌙"],["shed","in the shed or storage room","🧹"],["garden","in the garden or on the balcony (if you can)","🌲"]];
var OPEN={
  buiten:"Psst! Over here, by the chimney. I'm Piet Pepernoot, the Piet who remembers where all the presents are. This afternoon I hid the presents for this house. Perfectly hidden. So well that I only know where they are thanks to my hiding map. And then… Ozosnel jumped over the roof, the wind snatched the map out of my pocket and TORE it into {N} pieces! Now they're all over the neighbourhood. Without the map nobody can find the presents. Not even Sinterklaas. Tonight you are my Piet Detectives. At every place there's a piece, but you only get it after a Piet trial. All the pieces together: then we'll read where the presents are.",
  binnen:"Psst! Over here, by the heater. I'm Piet Pepernoot, the Piet who remembers where all the presents are. This afternoon I hid the presents for this house. Perfectly hidden. So well that I only know where they are thanks to my hiding map. And then… the front door opened, the draught snatched the map out of my pocket and TORE it into {N} pieces! Now they're all over the house. Without the map nobody can find the presents. Not even Sinterklaas. Tonight you are my Piet Detectives. In every room there's a piece, but you only get it after a Piet trial. All the pieces together: then we'll read where the presents are."
};
var CLIFF=["Well done, Piet Detectives! On to the next piece.","Ozosnel neighs with joy. Keep going!","Sinterklaas is secretly watching, and he nods. Onwards!","Another piece. I'm starting to recognise the map a little…","You're real Piets. Hold on just a bit longer!","My sack feels lighter, but my heart feels happier. Next!","Pepernoten for everyone! Well, later. Searching first."];
var CLIFFLAST="That was the last piece! Put the map together: then we'll know where the presents are.";
var LETTER="Dear Piet Detectives, without you I'd have stood on the roof tonight with empty hands. The map is whole again. I'll read it out…";
var SINTTXT="Ho ho, what do I hear? All the pieces found? Then from now on you are official Piet Detectives. Thank you, and have a lovely Sinterklaas Eve!";
var ZOEK=[["something RED, like Sinterklaas's cloak","A coat, a car, a ball, a door…"],["something GOLD or YELLOW, like Sint's staff","A lamp, a sign, a leaf, a button…"],["a SHOE or boot, to put out","A shoe of someone in the group counts too!"],["something ROUND, as big as a pepernoot","A button, a coin, a pebble, a cap…"],["something with the NUMBER 5 on it, because it's 5 December","A house number, a sign, a clock, a number plate…"],["something shaped like a TRIANGLE, like the mitre","A roof, a sign, a flag, a slice of cake…"],["something that looks like a HORSE, or another animal","A picture counts too. Or someone neighing."]];
var KIJK={
  buiten:[["Count together how many WINDOWS you can see on the nearest house or building."],["Count the LAMPPOSTS you can see from here."],["Count how many DOORS you can see from this spot."],["Count the TREES you can see from here (bushes don't count)."]],
  binnen:[["Count together how many CHAIRS there are in this room (stools count too)."],["Count how many DOORS this room has (cupboard doors count too)."],["Count the LAMPS in this room."],["Count how many WINDOWS this room has."]]};
var BOEK=[[
  ["What's the name of Sinterklaas's horse?",["Ozosnel","Lightning","Speedy"],0],
  ["What do you put in your shoe for the horse?",["A carrot","A banana","A sandwich"],0],
  ["How does Sinterklaas arrive in the Netherlands?",["By steamboat","By plane","By bus"],0],
  ["What does Sinterklaas wear on his head?",["A mitre","A cap","A helmet"],0],
  ["How does Piet get into the house?",["Down the chimney","Through the window","Through the letterbox"],0],
  ["What colour is Sinterklaas's cloak?",["Red","Green","Blue"],0],
  ["On which day is Sinterklaas Eve (pakjesavond)?",["5 December","1 December","25 December"],0]
 ],[
  ["When is Sinterklaas's birthday?",["6 December","5 December","1 December"],0],
  ["What does Sinterklaas hold in his hand?",["A staff with a curl","An umbrella","A sword"],0],
  ["Where does the steamboat come from?",["From Spain","From Italy","From Sweden"],0],
  ["What does Piet throw around the room?",["Pepernoten and kruidnoten","Confetti","Rice"],0],
  ["What's the name of the Piet who looks after the presents?",["The Present Piet","The Road Piet","The Sleepy Piet"],0],
  ["What's written in Sinterklaas's Big Book?",["What every child did this year","Recipes for pepernoten","The way to Spain"],0],
  ["Where does Sinterklaas go after his birthday?",["Back to Spain","To the moon","To the beach, for a swim"],0]
 ]];
var RIJM=[[
  ["The steamboat sails across the sea, with presents for you and…","me",["me","him","them"]],
  ["Piet climbs up onto the roof, the horse goes clip-clop with its…","hoof",["hoof","tail","nose"]],
  ["Put a carrot in your shoe, for the horse, and some hay…","too",["too","bag","box"]],
  ["Pepernoten flying round, rolling, rolling on the…","ground",["ground","moon","door"]],
  ["Sinterklaas, with a beard so white, rides across the roofs at…","night",["night","noon","lunch"]],
  ["Piet has lost his map, oh dear! Is it over there, or is it…","here",["here","red","cold"]]
 ],[
  ["Piet has a sack so big and round, he drops the presents without a…","sound",["sound"]],
  ["The mitre's red, the staff is gold, Sint keeps on riding though it's…","cold",["cold"]],
  ["Ozosnel runs fast and far, following the brightest…","star",["star"]],
  ["Chocolate letters, sweet and brown, hidden all across the…","town",["town"]],
  ["A carrot for the horse, some hay, Sint will come again one…","day",["day"]],
  ["Up the stairs and down the hall, we found the pieces, one and…","all",["all"]]
 ]];
var SYM={a:"🎁",b:"👢",c:"🥕",d:"🐴",e:"⭐",g:"🍬",h:"🏠",i:"🎩",j:"🔔",k:"🍪",l:"🔑",m:"🌙",n:"🕯️",o:"🎀",p:"🧦",r:"🚢",s:"❄️",t:"🧤",u:"☂️",w:"🪁",z:"🎈"};
var CODEW=[["sack",["sack","cake","seat"]],["boot",["boot","bear","bell"]],["sock",["sock","rock","sand"]],["star",["star","tree","snow"]]];
var CODEW1=["carrot","mitre","horse","parcel","present","moon"];
var SHAD=[["🎁","the present"],["👢","the boot"],["🥕","the carrot"],["🐴","the horse"],["🚢","the steamboat"],["🔑","the key"],["🔔","the bell"],["🧦","the sock"],["🌙","the moon"],["🧤","the mitten"],["⛵","the sailing boat"],["🍬","the sweet"],["☂️","the umbrella"],["🎈","the balloon"]];
var Z=[
 {id:"tel",title:"Counting pepernoten",story:"I'm throwing a handful of pepernoten. Count them all, even the fast ones! How many were there?",lvl:[{min:5,max:9,speed:1,choice:true,hint:"Count out loud together, one pepernoot per tap."},{min:9,max:16,speed:1.5,choice:false,hint:"Split the group: one half counts the left, the other the right. Then add them up."}]},
 {id:"vang",title:"Catch the sweets",story:"Hold the shoe under the pepernoten and catch them! But not the coal, yuck.",lvl:[{secs:20,need:8,rate:.9,coal:.15,hint:"Drag your finger under the pepernoot. Let the black coal fall."},{secs:20,need:12,rate:1.3,coal:.3,hint:"Watch what appears at the top, not the shoe."}]},
 {id:"memory",title:"Shoe memory",story:"There's something in every shoe. Find the two shoes with the same thing inside.",lvl:[{pairs:4,hint:"Say out loud what was in each shoe and where it was."},{pairs:6,hint:"Give each child a row to remember."}]},
 {id:"dak",title:"Up on the roof",story:"I'm running across the roofs. Tap exactly when I'm above the red chimney, then I'll jump in. Three hits!",lvl:[{hits:3,speed:1,hint:"Tap just a tiny bit before the chimney and you'll be spot on."},{hits:4,speed:1.6,hint:"Watch the rhythm. He goes back and forth at the same speed."}]},
 {id:"ritme",title:"Ozosnel's hoofbeat",story:"Ozosnel taps his hooves on the roof. Listen and watch closely, then copy it exactly.",lvl:[{rounds:[2,3,3],hint:"Say the colours out loud: that makes them easier to remember."},{rounds:[3,4,5],hint:"Remember the first two, then the rest. Two short bits are easier than one long one."}]},
 {id:"sorteer",title:"The wrapping Piet",story:"The presents go into the sack: the smallest first, the biggest on top. Tap them from small to big.",lvl:[{n:4,by:"size",hint:"Find the very smallest present first."},{n:5,by:"num",hint:"Look at the number on the tag, not the size."}]},
 {id:"verschil",title:"The odd present",story:"One of these presents doesn't belong. It's wrapped just a little differently. Which one?",lvl:[{subtle:false,hint:"Look at the bow."},{subtle:true,hint:"Look at the colour of the ribbon and the bow."}]},
 {id:"code",title:"Piet's secret code",story:"Piets write in little pictures. Here's the key. Which word does it say?",lvl:[{text:false,hint:"Find each picture in the key and say the letter out loud."},{text:true,hint:"Write the letters down in order on a piece of paper."}]},
 {id:"rijm",title:"The Rhyme Piet",story:"The Rhyme Piet has lost his last word. Finish the rhyme!",lvl:[{text:false,hint:"Say the last line out loud and listen to the sound."},{text:true,hint:"It rhymes with the last word of the first line."}]},
 {id:"boek",title:"The Big Book",story:"Everything is written in the Big Book. Do you know this too?",lvl:[{hint:"Talk it over. Someone is sure to know."},{hint:"Think of what's on TV every year."}]},
 {id:"zoek",title:"Find and photograph",story:"A real search mission. Look around you, for real: {z}. Take a photo of it.",lvl:[{hint:"{h}"},{hint:"{h}"}]},
 {id:"kijk",title:"Look and count",story:"Piets notice everything. Look carefully around you.",lvl:[{hint:"Count out loud together. One child points, the others count."},{hint:"Count twice, then you'll be sure."}]},
 {id:"gym",title:"Piet gym",story:"Piets have to be nimble to get onto the roof! Hold the phone and all jump together: count the jumps out loud.",lvl:[{secs:15,target:10,hint:"Jump with the phone in your hand so it counts along."},{secs:15,target:15,hint:"Jump with the phone in your hand so it counts along."}]},
 {id:"schaduw",title:"Shadows on the roof",story:"The moon is shining on the roof and I can only see shadows. Which shadow is it?",lvl:[{opts:3,rounds:2,hint:"Look at the shape of the outline."},{opts:4,rounds:3,hint:"Turn the phone a little if you need to, that sometimes helps."}]}
];
var DEFSPOT={what:"the presents",hint:"Where everyone sits together tonight, where the candles are lit and the comfiest chair stands. Search really well there, under, behind and on top too!",where:"in the living room"};
var LEADNOTE="Tip: play each trial once yourself first, so you know how it works. Head Piet stays open: you can change the hiding places during the game too.";
return{lang:"en",FREE:false,T:T,X:X,TYPES:TYPES,PIET:PIET,SINT:SINT,ROOMS:ROOMS,OPEN:OPEN,CLIFF:CLIFF,CLIFFLAST:CLIFFLAST,LETTER:LETTER,SINTTXT:SINTTXT,ZOEK:ZOEK,KIJK:KIJK,BOEK:BOEK,RIJM:RIJM,SYM:SYM,CODEW:CODEW,CODEW1:CODEW1,SHAD:SHAD,Z:Z,LEADNOTE:LEADNOTE,DEFSPOT:DEFSPOT};
})();
