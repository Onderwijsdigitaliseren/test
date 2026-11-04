/* The Letter Thief – MiniMystery Education (English literacy, ages 6–12). Texts and language stations (EN).
   Adapted (not translated) from data-nl.js: the Dutch version teaches Dutch, this version teaches English to English-speaking children.
   The Letter Thief stole letters in the night: from the classroom signs, from the board in the hall, from the school name on the wall.
   Letters and words are missing everywhere. At language stations around (or inside) the school, teams read, spell and build with real
   words from the neighbourhood. Each station gives a word key. In the finale they put the words in the right order to make a sentence:
   the Letter Thief feels sorry and brings everything back.
   Levels: 0 = ages 6–8 (phonics and letters, short words, clapping syllables, rhyme; two pictures as answers, everything read aloud)
   · 1 = ages 8–10 (spelling patterns, compound words, opposites and synonyms, word classes, alphabetical order, punctuation)
   · 2 = ages 10–12 (irregular past tense, subject and verb, figurative language and idioms, plurals, loanwords, register).
   Per station: intro, act {out,in}, lvl[3] (kind text/choice/word; word = first copy a real word, then fn(w) with the follow-up question), tip. */
window.TL_DATA=(function(){
var T={
  today:"Start today's case",extra:"Extra case",voice:"Read aloud",voiceOn:"Reading aloud is on",voiceOff:"Reading aloud is off",
  start:"Open the language station",next:"Next ▸",back:"Back",close:"Close",cancel:"Cancel",ok:"Check ▸",listen:"Read aloud",
  loc:"Where are you? The phone will ask for your location.",pois:"Miss Noor is looking for language stations nearby…",nomap:"The map service is busy. We'll play on a drawn map.",
  noGps:"This phone has no GPS.",denied:"Location is switched off. Turn it on in the settings, or play without a map.",fail:"That didn't work",
  corner:"Corner",task:"Station {i} of {n}",clue:"Word key {n} of {t}",
  near:"Next station in {d} m",warm:"Warm! {d} m to go",hot:"Hot! There's a station here",radarAll:"All the word keys! Off to the Letter Thief.",
  here:"Here's a language station",look:"Open the station",walk:"Walk there",gps:"We're really here (the GPS isn't sure)",
  notebook:"Word book",nbK:"Word keys",nbM:"Words from the neighbourhood",nbNone:"Nothing found yet. Walk to the first station.",
  menu:"Menu",mBack:"Back to the case",mHome:"Pause, carry on later",mWipe:"Delete this case",mLead:"Leader's sheet",saved:"Saved. You can carry on later.",
  wipe:"Delete",wipeY:"Delete this case",wipeAll:"Delete everything (archive too)",wipeQ:"Delete the case?",wipeT:"Your progress will be gone.",allQ:"Delete everything?",allT:"The case, the archive and the settings will be deleted.",allY:"Yes, delete everything",wiped:"Deleted",
  dH:"Enter a case code",dT:"With a case code, several phones play the same case: the same places, the same stations. That way each class or group gets one case for all its teams.",dGo:"Get the case",dBad:"We don't know that code. Codes start with TL.",
  demoCase:"Practice round · drawn town",demoTip:"Tap a place on the map: your team will walk there by itself.",
  howH:"How does it work?",
  won:"Letters returned",dipBtn:"Certificate (A4)",dipH:"Word Detective Certificate",dipNote:"Print it or save it. One per team, or print one for every child.",leadBtn:"Leader's sheet",home:"Back to the start",dl:"Save",shareBtn:"Share",copied:"Copied",
  shareTxt:"We caught the Letter Thief! Case {c} · {s} · {m} min. ",missed1:"No hints: three stars.",
  pzT:"Talk it over together. One person types.",wrong:"Not quite. Talk it over again.",wrongHint:"Not quite. Take the hint, or talk it over again.",hintBtn:"💡 Hint",hintUsed:"Hint used",
  countGo:"Done ▸",photoGo:"📷 Take the photo",photoAgain:"Try again",photoOk:"That's the one! ▸",photoKeep:"The photo stays on this phone.",
  keyGet:"A word key:",tipH:"Language tip",
  finH:"The Letter Thief's sentence",finT:"Tap the word keys in the right order to make a sentence. Watch out for the capital letter and the full stop.",finT0:"Tap the words to make a sentence. Which word comes first?",finBad:"That doesn't make a proper sentence. Start again.",finHint:"A sentence starts with a capital letter and ends with a full stop. Who is doing something? That often comes at the front.",finHint0:"The word with the capital letter comes first. The word with the full stop comes last.",finNot:"Do all the stations first. {n} still to go.",finOk:"That's the sentence! The Letter Thief jumps: his secret is out.",
  stripT:"Case {c}",keysBar:"Word keys",
  gbH:"Inside the building",gbT:"Choose the places in your school. The leader hangs a card with a code at each place (print them from the leader's sheet). Teams go to the place and type in the code.",gbNoCards:"No cards (teams press 'We're here' themselves)",gbGo:"Start the case",gbMin:"Choose at least {n} places (or places will be repeated).",
  gbGoto:"Go to:",gbCode:"Type the code from the card at that place",gbHere:"We're here ▸",gbBad:"That code doesn't belong to this place. Look at the card again.",gbCards:"Place cards (to hang up)",gbCardT:"Language station",
  leadH:"Leader's sheet",leadT:"For the leader only. This sheet belongs to this case code: every team with this code gets exactly these stations.",leadTeams:"Team scores (keep track yourself)",leadTeam:"Team",leadDone:"Finished at",leadPrint:"Print",leadCode:"Case code",
  lvl:["ages 6–8","ages 8–10","ages 10–12"],
  nw:{6:"six",8:"eight",10:"ten"},
  kv:{fp:["Bike rack","Bus stop","Playground","School playground","Bridge","Park","Church","Square","Shop","Postbox","Kiosk","Bench"],
    all:"All the word keys! Off to the Letter Thief.",near:"Station in {d} m",cold:"Cold… try another way",cool:"Lukewarm. Getting closer",warm:"Warm! Well done!",hot:"HOT! Look around you!",here:"The station is here!",first:"Start walking, the compass will show the way",noDir:"Walk a little way, then the compass will know the direction",
    map:"Map",kids:"Story map",mapTip:"The real map. Tap Story map for the children's drawing.",goDemo:"We're (pretend) walking to {p}…",inSteps:"{n} steps to go",
    mNoMap:"Carry on without a map (same case)",switched:"Carrying on without a map. Same case, same stations.",virtOut:"We couldn't find a map of the area. You'll walk on the story map: the arrow and warm/cold will show the way.",
    noMapQ:"No location today?",noMapT:"The phone isn't sharing a location. You can play the same case without a map: the stations come one after another and you walk to a new spot yourselves.",noMapGo:"Carry on without a map",
    inH:"",inT:"",inSensor:"",inTempo:"",inNoSensor:""}
};
var TYPES={kerk:"the church",hotel:"the hotel",bank:"the bank",apotheek:"the chemist",cafe:"the café",bieb:"the library",park:"the park",school:"the school",kunst:"the artwork",tank:"the petrol station",winkel:"the shop",halte:"the bus stop",post:"the postbox",bankje:"the bench",hoek:"the corner"};
var TIK="Mr Tik",NOOR="Miss Noor",DIEF="The Letter Thief";
var ROOMS=["The entrance hall","The school hall","The gym","The library or reading corner","The stairs","By the staff room","The kitchen","The playground","An infant classroom","A classroom for the older children","By the head teacher's office","The bike shed","The playroom","The cloakroom"];
var OPEN={
  school:"Something was wrong this morning. The name on the front of the school didn't say SCHOOL any more. It said S_HO_L. The signs on the classrooms said CL_SS 5 and L_BR_RY. And on the board in the hall: \"I have your letters. If you want to find me, you must make my sentence. – The L_tter Thief.\" Without letters you can't read, you can't write, and you can't find where you need to go. You are going to find the Letter Thief. There is a language station in {N} places. There you will read, spell and build with real words from the neighbourhood. Each station gives you a word key. Put all the words in the right order and you'll have his sentence. Then you'll know what he wants.",
  bso:"All the letters have gone! The front of the school says S_HO_L. The library door says L_BR_RY. And on the board in the hall: \"I have your letters. If you want to find me, you must make my sentence. – The L_tter Thief.\" Just try writing a note without any letters! You are going to find him. There is a language station in {N} places. There you'll look for real words nearby and do something clever with them. Each station gives you a word key. Put all the words in the right order, and there's his sentence."
};
var OPEN0={
  school:"Some letters have gone! The school sign says S_HO_L. The library sign says L_BR_RY. The Letter Thief took them. He wrote: if you want to find me, you must make my sentence. There is a language station in {N} places. There you will look for words and letters. Each station gives you a word. Put all the words in a row, and there's his sentence!",
  bso:"Some letters have gone! The school sign says S_HO_L. The Letter Thief took them! He wrote: if you want to find me, you must make my sentence. There is a language station in {N} places. There you will look for words and letters. Each station gives you a word. Put all the words in a row, and there's his sentence!"
};
var CLIFF=["Well read. That's how a detective finds the way.","Another word. Keep it safe in your word book.","The Letter Thief can already hear you spelling. He's getting nervous.","Letters are everywhere, if you look carefully.","I think I can leave this case to you.","On to the next station!"];
var CLIFFLAST="That was the last station! Now put all the word keys in order, and there's the Letter Thief's sentence.";
var REVEAL={
  school:"<p>The sentence is complete. And suddenly there he is, by the bike shed: the Letter Thief. A little man in a coat full of pockets, with letters poking out of every one.</p><p>\"You made my sentence,\" he says quietly. \"Hardly anyone ever manages that. I stole letters because I think they're beautiful. But today I watched you reading and spelling and building words, and I thought: letters are only beautiful when you do something with them.\"</p><p>He takes the letters out of his pockets and puts them back: on the front of the school, on the signs, on the board. SCHOOL. CLASS 5. LIBRARY. Miss Noor nods. \"And now, Letter Thief?\" He smiles. \"Now I'm going to read.\"</p>",
  bso:"<p>The sentence is complete. And suddenly there he is, by the bike shed: the Letter Thief! A little man in a coat full of pockets, with letters poking out of every one.</p><p>\"You made my sentence!\" he cries. \"Hardly anyone ever manages that! I stole letters because I think they're beautiful. But you really do something with them: reading, spelling, building words. That's even more beautiful.\"</p><p>He takes the letters out of his pockets and sticks them back: SCHOOL. LIBRARY. CLASS 5. Mr Tik laughs. \"And now, Letter Thief?\" \"Now I'm going to read a book. A big, thick book.\"</p>"
};
var REVEAL0={
  school:"<p>The sentence is done! And there he is: the Letter Thief, in a coat full of pockets. Letters are poking out of every pocket.</p><p>\"You made my sentence,\" he says. \"I stole letters because I think they're lovely. But you do something with them. That's even lovelier.\"</p><p>He sticks the letters back: SCHOOL. LIBRARY. \"And now I'm going to read.\"</p>",
  bso:"<p>The sentence is done! And there he is: the Letter Thief, in a coat full of pockets. Letters are poking out of every pocket!</p><p>\"You made my sentence! I stole letters because I think they're lovely. But you do something with them. That's even lovelier.\"</p><p>He sticks the letters back: SCHOOL. LIBRARY. \"And now I'm going to read a big, thick book.\"</p>"
};
/* the Letter Thief's sentence: per level, sentences of exactly 6, 8 and 10 words; the words are the word keys */
var ZIN={
  0:{6:["I really love letters and words.","The thief is reading a book.","My coat is full of letters."],8:["The thief has all the letters from school.","I read a book in bed every night.","If you read well, you will find me."],10:["The thief sits by the bikes with lots of letters.","I will give them all back when you find me.","A man with letters in his pocket is at school."]},
  1:{6:["Whoever reads will find the thief.","Letters are lovely, words are lovelier.","Without letters the school is silent."],8:["The Letter Thief is waiting by the bikes.","I took the letters, but you made words.","Whoever makes my sentence gets every letter back."],10:["The Letter Thief waits by the bikes with stolen letters.","I will return every letter once you make my sentence.","Reading is the only way to find a letter thief."]},
  2:{6:["Letters only shine when someone reads.","Careful readers will unmask the thief."],8:["The Letter Thief hides among the bikes, ashamed.","A letter nobody reads is a closed door."],10:["Although I stole letters, all I really wanted was readers.","The thief waits by the bikes, pockets full of regret."]}
};
var vow=function(w){return (w.match(/[aeiou]/gi)||[]).length};
var syl=function(w){var c=(w.toLowerCase().replace(/[^a-z]/g,"").match(/[aeiouy]+/g)||[]).length;return Math.max(1,c)};
var ltr=function(w){return w.replace(/[^a-zA-Z]/g,"")};
var pics=function(q,a,hint,o1,o2){return{kind:"choice",q:q,c:[{e:o1[0],t:o1[1]},{e:o2[0],t:o2[1]}],a:a,hint:hint}};
var ch=function(q,a,hint,opts){return{kind:"choice",q:q,c:opts,a:a,hint:hint}};
var S=[
{id:"bord",ico:"🪧",dom:"reading",title:"The street sign",
 intro:"Every street has a name on a sign. Luckily the Letter Thief left those alone. Find the nearest street sign (or a sign with a name on it) and read the name out loud.",
 act:{out:"Find a street sign. Read the name out loud, loud enough for the neighbours to hear. Type it in exactly as it is.",in:"Find a sign with a name on it: a classroom, the library, the hall, a poster. Read it out loud and type it in exactly as it is."},
 tip:["A name starts with a capital letter. Look: street names do too.","The vowels are a, e, i, o, u (and sometimes y). All the other letters are consonants.","Lots of street names are made of two parts: Church + Street, Mill + Lane. The last part tells you what kind of road it is."],
 lvl:[{kind:"word",pre:"Type in the name (exactly as it is on the sign):",fn:function(w){var n=ltr(w).length;return{kind:"choice",q:"\""+w+"\". How many letters does it have?",c:[{e:"🔤",t:String(n)+" letters"},{e:"🔡",t:String(n+2)+" letters"}],a:0}},hint:"Count the letters one by one. Point to each one."},
      {kind:"word",pre:"Type in the name (exactly as it is on the sign):",fn:function(w){var n=vow(w);return{q:"\""+w+"\". How many vowels (a, e, i, o, u) are in it?",a:[String(n)]}},hint:"The vowels are a, e, i, o and u. Count them."},
      {kind:"word",pre:"Type in the name (exactly as it is on the sign):",fn:function(w){var n=syl(w);return{q:"\""+w+"\". How many syllables does the name have? Clap them.",a:[String(n),String(n+1),String(Math.max(1,n-1))]}},hint:"Clap on each vowel sound. Church Street: 2 claps."}]},
{id:"klap",ico:"👏",dom:"syllables",title:"Clap the word",
 intro:"You can chop long words into pieces: syllables. That helps with reading and with spelling. Find the longest word you can see around you and clap it.",
 act:{out:"Find the longest word you can see (on a sign, a shop, a van). Clap the syllables: su-per-mar-ket.",in:"Find the longest word in this room (on a poster, a book, a door). Clap the syllables."},
 tip:["Each piece you clap is called a syllable. Ba-na-na: 3 claps.","You often split a word between two consonants: let-ter, rab-bit, win-dow.","Syllables help with spelling: a short vowel is often followed by a double consonant (hop-ping), a long vowel by just one (ho-ping)."],
 lvl:[{kind:"word",pre:"Type in the word:",fn:function(w){var n=syl(w);return{kind:"choice",q:"\""+w+"\". How many times do you clap?",c:[{e:"👏",t:String(n)+" times"},{e:"👏👏",t:String(n+2)+" times"}],a:0}},hint:"Say the word slowly and clap on each piece."},
      {kind:"word",pre:"Type in the word:",fn:function(w){var n=syl(w);return{q:"\""+w+"\". How many syllables?",a:[String(n),String(n+1),String(Math.max(1,n-1))]}},hint:"Clap on each vowel sound."},
      {kind:"word",pre:"Type in the word:",fn:function(w){var n=syl(w),l=ltr(w).length;return{q:"\""+w+"\". How many letters does the word have, minus the number of syllables?",a:[String(l-n),String(l-n-1),String(l-n+1)]}},hint:"First count the letters, then clap the syllables, then take one away from the other."}]},
{id:"rijm",ico:"🎵",dom:"rhyme",title:"Rhyme time",
 intro:"Poets look for words that rhyme. Find something you can see (a tree, a door, a car, a gate) and think of a word that rhymes with it.",
 act:{out:"Pick something you can see: tree, door, gate, car, wall, sign, house. Think of as many rhyming words as you can together. Who can find the silliest one?",in:"Pick something in this room: chair, door, book, shelf, lamp, board. Think of as many rhyming words as you can together."},
 tip:["Rhyming words end with the same sound. Cat – hat – mat.","Rhyming words often end with the same letters, but not always: bear and chair, blue and shoe.","Rhyme at the end of the lines in a poem is called end rhyme. Rhyme inside a line is called internal rhyme."],
 lvl:[pics("Which word rhymes with 'tree'?",0,"Listen to the end: ee.",["🐝","bee"],["🏠","house"]),
      ch("Which word does NOT rhyme with 'street'?",2,"Say them out loud: street, feet, seat, stop.",["feet","seat","stop"]),
      ch("'Bear' and 'chair' rhyme. How can that be, when they are spelled differently?",0,"Rhyme is about sound, not letters.",["Rhyme is about the sound, not the spelling","They don't really rhyme","Because 'ea' and 'ai' sound the same in every word"])]},
{id:"samen",ico:"🧩",dom:"compound words",title:"Word glue",
 intro:"Stick two words together and you get a new word: foot + ball = football. That's called a compound word. The neighbourhood is full of them.",
 act:{out:"Find two things you can see and stick them together into a word that really exists (lamppost, playground, doorbell). Find three.",in:"Find two things in this room and stick them together into a word that really exists (bookcase, whiteboard, doorknob). Find three."},
 tip:["Many compound words are written as one word: football, playground.","The last part tells you what it is: a doghouse is a house, but a housedog would be a dog.","Some compounds are one word (bedroom), some have a hyphen (mother-in-law) and some are two words (bus stop). If you're not sure, check a dictionary."],
 lvl:[pics("Stick them together: foot + ball = ?",1,"Just put one after the other.",["🦶","ballfoot"],["⚽","football"]),
      {kind:"text",q:"Which word is missing? lamp + … = lamppost. Type the missing part.",a:["post"],hint:"What does the lamp sit on top of?"},
      {kind:"text",q:"Make a compound word: book + case and play + ground are taken. Type a compound word with 'way' as the last part, as one word (e.g. railway).",a:["railway","motorway","doorway","hallway","driveway","pathway","subway","gateway","highway","walkway","runway","stairway","archway","cycleway","footway","freeway","alleyway","waterway","causeway","carriageway","halfway","anyway","someway","byway","slipway","speedway","gangway","expressway","raceway","passageway"],hint:"Something + way, written together. For example, the way a train goes."}]},
{id:"tegen",ico:"↔️",dom:"vocabulary",title:"Opposites",
 intro:"Big and small, high and low, open and shut. Words that mean the opposite of each other are called opposites. Find a few around you.",
 act:{out:"Find something big and something small. Something high and something low. Something old and something new. Point to them and say the two words.",in:"In this room, find something big and something small, something high and something low, something old and something new."},
 tip:["The opposite of big is small. The opposite of open is shut.","Opposites are also called antonyms. Words that mean almost the same are called synonyms: big and huge.","Not every word has an opposite. 'Table' doesn't have one. Describing words (adjectives) usually do."],
 lvl:[pics("What is the opposite of 'big'?",0,"A mouse is …",["🐭","small"],["🐘","heavy"]),
      ch("What is the opposite of 'wide'?",1,"A wide road has lots of room. A … road has very little.",["tall","narrow","empty"]),
      ch("Which word is a synonym (means almost the same) of 'enormous'?",0,"A giant is …",["huge","tiny","dangerous"])]},
{id:"soort",ico:"🏷️",dom:"word classes",title:"Who does what?",
 intro:"Words come in different types. Things and people are nouns (the tree, a child). What you do is a verb (walk, look). Look around and name what you see and what is happening.",
 act:{out:"Each team member names a thing they can see (a noun) and something that is happening (a verb): 'the bus' – 'drives'. Make a sentence out of it together.",in:"Each team member names a thing in this room (a noun) and something you do with it (a verb): 'the chair' – 'sit'. Make a sentence out of it together."},
 tip:["You can put 'a' or 'the' in front of a thing: the tree, a gate. Those are nouns.","A verb says what someone does or what happens: walks, drives, is. You can put 'I' in front of it: I walk.","An adjective tells you more about a noun: the red car, the tall building."],
 lvl:[pics("Which word is something you do?",1,"What can you do: tree or run?",["🌳","tree"],["🏃","run"]),
      ch("Which word is a verb?",2,"Put 'I' in front: I … .",["bicycle","bike shed","ride"]),
      ch("In 'the old tree leans to one side', 'old' is a…",1,"It tells you something about the tree.",["verb","adjective","noun"])]},
{id:"spel",ico:"✍️",dom:"spelling",title:"How do you spell it?",
 intro:"The Letter Thief also swaps letters around. Then the spelling is wrong. A detective spots that straight away. Look carefully at the words around you: is everything right?",
 act:{out:"Find a word on a sign or a shop and spell it out loud together, letter by letter. Then the question.",in:"Find a word on a poster or in a book and spell it out loud together, letter by letter. Then the question."},
 tip:["Listen carefully: which sounds can you hear? Sh-i-p: sh, i, p.","Magic e makes the vowel say its name: hop → hope, cap → cape. A short vowel doubles the next letter before -ing: hop → hopping, but hope → hoping.","Most verbs add -ed in the past tense (walked, played), but irregular verbs change: catch → caught, go → went, run → ran."],
 lvl:[pics("Which one is spelled correctly?",0,"The 'k' sound in this word is spelled 'ch'.",["🏫","school"],["❌","skool"]),
      ch("The frog jumps on one leg. It is …",0,"Hop has a short o, so double the p. Hoping comes from hope.",["hopping","hoping","hopeing"]),
      ch("Past tense of 'catch': yesterday I …",0,"It's an irregular verb: it doesn't take -ed.",["caught","catched","cought"])]},
{id:"abc",ico:"🔠",dom:"alphabet",title:"In ABC order",
 intro:"In the library, books are in alphabetical order, so you can always find them. A detective sorts things too. Find three words around you and put them in alphabetical order.",
 act:{out:"Find three words (on signs, shops, cars). Put them in alphabetical order. Then line up in alphabetical order of your first names, without talking!",in:"Find three words in this room. Put them in alphabetical order. Then line up in alphabetical order of your first names, without talking!"},
 tip:["The alphabet starts with a, b, c and ends with x, y, z.","Do the words start with the same letter? Then look at the second letter: cake comes before clock.","Words in a dictionary are in alphabetical order. That's how you find one quickly, even among a hundred thousand others."],
 lvl:[pics("Which letter comes after K?",0,"… h, i, j, k, and then?",["🅻","L"],["🅹","J"]),
      ch("Which word comes first in alphabetical order?",1,"All three start with C. Look at the second letter, then the third.",["clock","cake","camera"]),
      ch("Put these in alphabetical order: Timmins, Tik, Tak. Which one comes last?",0,"Ta, then Ti. Then Tik and Timmins: k comes before m.",["Timmins","Tik","Tak"])]},
{id:"teken",ico:"❗",dom:"punctuation",title:"Punctuation",
 intro:"A full stop, a question mark, an exclamation mark: punctuation tells you how to read a sentence. Find a sign with a sentence on it (a warning, an advert, a name) and read it in the right voice.",
 act:{out:"Find a sign with writing on it. Read it three times: as a question, as an order, and very sadly. Which one fits?",in:"Find a poster or sign with writing on it. Read it three times: as a question, as an order, and very sadly. Which one fits?"},
 tip:["A sentence ends with a full stop. A question ends with a question mark.","Use an exclamation mark when you shout something or when it's important: Watch out!","A comma is a short pause in a sentence. Speech marks show that someone is speaking: \"Hello,\" he said."],
 lvl:[pics("What goes at the end of a question?",1,"What time is it…",["❗","!"],["❓","?"]),
      ch("Which punctuation mark goes after 'Beware of the dog'?",1,"It's a warning, so you say it loudly.",["?","!",","]),
      ch("Which sentence is written correctly?",0,"The words someone says go inside the speech marks, with their punctuation.",["\"Are you coming?\" asked Noor.","Are you coming? asked Noor\".","\"Are you coming, asked Noor?\""])]},
{id:"zin",ico:"📝",dom:"sentences",title:"Build a sentence",
 intro:"Words on their own don't say much. They only mean something in a sentence. Who does what, and where? Build a sentence about what you can see here.",
 act:{out:"Take turns: each team member says one word, until you have a sentence about something you can see here. Start with a capital letter, end with a full stop.",in:"Take turns: each team member says one word, until you have a sentence about this room. Start with a capital letter, end with a full stop."},
 tip:["A sentence starts with a capital letter and ends with a full stop.","Who is doing it? That's the subject. What are they doing? That's the verb: The bus (subject) drives (verb).","Every sentence needs a subject and a verb. The verb changes when you put the sentence in the past tense: drives → drove."],
 lvl:[pics("Which sentence is right?",0,"A sentence starts with a capital letter.",["✅","The bus is fast."],["❌","the bus is fast"]),
      ch("'The old bus drives slowly.' What is the subject?",1,"Who or what is driving?",["drives","the old bus","slowly"]),
      ch("'Yesterday the dog ran through the park.' Which word is the verb?",0,"Which word changes if it happens today? The dog … through the park.",["ran","the dog","yesterday"])]},
{id:"verklein",ico:"🐣",dom:"plurals",title:"One, two, lots!",
 intro:"One bus, two buses. One baby, two babies. To make more than one, you usually add -s, but not always! Look around you: what can you count?",
 act:{out:"Find five things you can see more than one of: cars, trees, buses, benches. Say the plural out loud. Which one is the trickiest?",in:"Find five things in this room that there are more than one of: chairs, books, boxes, shelves. Which one is the trickiest?"},
 tip:["Most words just add -s: one cat, two cats.","After s, x, ch or sh, add -es: bus – buses, box – boxes. Consonant + y: change the y to i and add -es: baby – babies. Some f words change to -ves: leaf – leaves.","Some plurals are irregular: child – children, mouse – mice, foot – feet, sheep – sheep. An ending you add to a word, like -s, -es, -ful or -ness, is called a suffix."],
 lvl:[pics("One tree, two …?",1,"Just add an s.",["❌","treeses"],["🌳","trees"]),
      ch("One bus, two …",0,"After s, x, ch or sh you add -es.",["buses","buss","busies"]),
      ch("One child, two …",2,"It's an irregular plural, like mouse → mice.",["childs","childes","children"])]},
{id:"spreek",ico:"🗣️",dom:"figurative language",title:"Do you really say that?",
 intro:"\"It's raining cats and dogs.\" No animals are really falling from the sky. That's figurative language: you say something different from what you mean. Idioms and sayings are full of it.",
 act:{out:"Together, make up a silly comparison about something you can see: 'That tree is as tall as …'. Each team member makes one.",in:"Together, make up a silly comparison about something in this room: 'That cupboard is as heavy as …'. Each team member makes one."},
 tip:["'As fast as a cheetah' means: very fast. You compare it with something everyone knows. That's called a simile.","A proverb is a fixed saying with a wise lesson: 'Don't count your chickens before they hatch.'","Literal is what the words really say; figurative is what you mean. 'A heart of gold' is figurative: very kind."],
 lvl:[pics("'As fast as a cheetah.' What does that mean?",0,"A cheetah runs really fast.",["🐆","very fast"],["🐌","very slow"]),
      ch("'It's raining cats and dogs.' What does that mean?",1,"It's figurative: not real animals.",["Cats and dogs are falling from the sky","It's raining very hard","It's raining just a little"]),
      ch("'Don't count your chickens before they hatch.' What does this proverb mean?",0,"Not every egg hatches…",["Don't be sure of something before it has happened","Chickens are hard to count","Eggs take a long time to hatch"])]},
{id:"leen",ico:"🌍",dom:"word origins",title:"Words from far away",
 intro:"Lots of words we use every day came into English from other languages: pizza from Italian, kindergarten from German, and cookie from Dutch! Look around for words that travelled to English from far away.",
 act:{out:"Look on signs and shops for words from other languages (pizza, café, kebab, sushi, yoghurt, ballet). How many can you find?",in:"Look in this room for words from other languages (piano, yoghurt, pyjamas, ketchup, kindergarten). How many can you find?"},
 tip:["Pizza comes from Italy. That's why we say 'peet-sa', with a ts sound.","A loanword is a word English borrowed from another language. Café and ballet come from French, pyjamas from Hindi and Urdu, kindergarten from German.","English borrowed lots of words from Dutch: cookie (koekje), yacht (jacht), boss (baas), skate (schaats) and landscape (landschap). Dutch and English sailors and traders met all the time."],
 lvl:[pics("Which food word comes from Italy?",1,"It's round, with cheese and tomato on top.",["🍞","bread"],["🍕","pizza"]),
      ch("Which language does 'kindergarten' come from?",1,"It means 'children's garden' in the language of Germany.",["French","German","Spanish"]),
      ch("Which English word comes from Dutch?",0,"Koekje… cookie.",["cookie","pizza","ballet"])]},
{id:"brief",ico:"✉️",dom:"writing",title:"A note for the thief",
 intro:"You are going to write a note to the Letter Thief. Short, but done properly: a greeting, a message and a sign-off. First look at a postbox or a house to see what an address looks like.",
 act:{out:"Find a postbox or a house number. Together, decide what you want to say to the Letter Thief, in three sentences. One team member says them out loud.",in:"Together, decide what you want to say to the Letter Thief, in three sentences. One team member says them out loud."},
 tip:["A note starts with 'Dear …' or 'Hi …' and ends with a sign-off and your name.","An envelope shows the address: name, house number and street, town, and postcode. Each one on its own line.","A formal letter ('Dear Sir or Madam … Yours faithfully') is different from a note to a friend ('Hi! … See you soon!'). Choosing your words to suit your reader is called register."],
 lvl:[pics("How does a note start?",0,"First you greet the reader.",["👋","Dear Letter Thief,"],["🏁","Love from, us"]),
      ch("What goes on an envelope?",0,"Otherwise it won't arrive.",["Name, house number and street, town and postcode","Just the name","The date and the weather"]),
      ch("You are writing a letter to the mayor. Which greeting fits?",2,"Formal: you don't know the mayor personally.",["Hiya Mayor!","Love you, Mayor,","Dear Sir or Madam,"])]}
];
var ORDER_KORT=["bord","klap","rijm","samen","spel","zin"];
return{lang:"en",T:T,TYPES:TYPES,TIK:TIK,NOOR:NOOR,DIEF:DIEF,ROOMS:ROOMS,OPEN:OPEN,OPEN0:OPEN0,CLIFF:CLIFF,CLIFFLAST:CLIFFLAST,REVEAL:REVEAL,REVEAL0:REVEAL0,S:S,KORT:ORDER_KORT,ZIN:ZIN,FREE:true,
  LEADNOTE:"Tip: run the short introduction lesson first (see below). Agree on the play area (outside: everything within about 300 metres) and a finishing time. Teams who get stuck may use the hint (one per station). At the stations with a real word, the team first types in the word from the sign; the follow-up question is worked out from it (letters, vowels, syllables). That's why the sheet shows the method, not one fixed answer.",
  LES:[
   {intro:["Write a word on the board with a few letters missing (S_HO_L) and ask: which letters did the Letter Thief take? What can't you do without letters?","Practise clapping syllables together with three names from the class, and find rhymes for one thing in the classroom.","Teams of 4–6 with an adult, one phone per team, enter the case code. Turn reading aloud on: the children don't have to read by themselves, but they're welcome to try."],
    na:["Which word from the street did you like best? Write all the words you found on the board and clap them together.","Rhyming: as a class, make a four-line rhyme about the Letter Thief.","The Letter Thief's sentence: write it on the board. Where is the capital letter, where is the full stop?","Homework: find three words on boxes or bottles at home and bring them in."],
    doelen:"Ages 6–8 (English literacy): phonics and letter sounds, reading and writing short words, syllables, rhyme, capital letters and full stops, compound words, speaking and listening."},
   {intro:["Ask: where do you read things outside school? (signs, shops, packaging, apps). What happens when letters go missing?","Briefly revise: vowels and consonants, syllables, compound words, opposites, nouns and verbs.","Teams of 4–6, one phone per team, enter the case code. Rule: read it out loud first, then talk it over together, one person types."],
    na:["Put all the words you found on the board. Sort them together: nouns, verbs, compound words, loanwords.","Which spelling rule did you meet? (magic e, doubling consonants, plurals, capital letters). Let a team explain it.","The Letter Thief's sentence: find the subject and the verb. Together, turn it into a question and an exclamation.","Extension: in pairs, finish the note to the Letter Thief, with a greeting, three sentences and a sign-off."],
    doelen:"Ages 8–10 (English literacy): spelling patterns (magic e, doubling, plurals), word classes, compound words, synonyms and antonyms, alphabetical order, punctuation incl. speech marks, sentence structure, vocabulary."},
   {intro:["Ask: what's the difference between literal and figurative? Collect three idioms the class knows.","Briefly revise: regular and irregular past tense, subject and verb, loanwords, register (formal and informal).","Teams of 4–6, one phone per team, enter the case code. Rule: read it out loud first, reason it out together, and only then type."],
    na:["Put all the words you found on the board and, for each one, name its origin (English, French, Dutch…) and its word class.","The Letter Thief's sentence: identify the subject, verb and adverbial. Put it in the past tense and turn it into a question.","Figurative language: each team makes three similes about the neighbourhood and explains what is literal and what is figurative.","Extension: write a formal letter to the council about something you saw outside (a broken sign, an unsafe crossing), with a greeting, paragraphs and a formal sign-off."],
    doelen:"Ages 10–12 (English literacy): verb tenses incl. irregular past, subject and verb, figurative language, idioms and proverbs, plurals and suffixes, loanwords and word origins, punctuation of direct speech, register, letter writing."}
  ]}
})();
