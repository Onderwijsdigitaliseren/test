/* Unsolved (cold case) – English text and case data. Placeholders: {N} the missing person, {P}/{O}/{S} pronouns, {K} who knew, {KR} relation, {t} time, {D} the date back then, {Y} the year (22 years back; filled in at load).
   CONTACTS: [name, relation, statement at the time]. CT: traits + pieces pointing at that value. SC: pieces per outcome (M foul play, O accident, V left); each fits two outcomes.
   THEN: what stood at such a place back then, per place type. */
window.CC_DATA={
 "lang": "en",
 "T": {
  "title": "Unsolved",
  "eyebrow": "A file from {Y}",
  "lead": "A case from {Y}. Never solved. The file is still there; so are the places.",
  "rank": "Rank",
  "streak": "Day streak",
  "solved": "Solved",
  "short": "Short · 40 min",
  "full": "Full · 75 min",
  "resume": "Continue your case",
  "today": "Start today's case",
  "todayAgain": "Play today's case again",
  "extra": "Extra case here",
  "code": "Enter a case code",
  "demo": "Practice round in a fictional London",
  "how": [
   "The map pins eight pieces of the old file to real places around you: press cuttings, interviews, photographs, letters, exhibits.",
   "Come within 35 metres and you walk into {Y}: you see what stood there then, and who.",
   "Put the evening in order. Decide what happened and who has known all these years."
  ],
  "archive": "Archive",
  "echoBtn": "From the archive",
  "nbEcho": "Archive",
  "wipe": "Erase",
  "safety": "Stay on public roads and mind the traffic. You never need to go inside.",
  "allWalks": "◂ All walks",
  "lang": "Nederlands",
  "brief": "File",
  "missing": "Missing since {D}",
  "lastMsg": "Last text · {D} · {t}",
  "contacts": "Six names from the {Y} investigation",
  "go": "Open the file",
  "back": "Back",
  "hud": [
   "Time",
   "Traces",
   "Earliest",
   "Km"
  ],
  "menu": "Menu",
  "zin": "Zoom in",
  "zout": "Zoom out",
  "me": "Centre on me",
  "snd": "Sound on or off",
  "radar0": "Find the first piece",
  "radarAll": "The file is complete. Time to close it.",
  "hot": "You are walking into {Y}. {d} m to go",
  "warm": "Close. {d} m to go",
  "near": "Nearest piece: {d} m",
  "note": "File",
  "close": "Close file",
  "look": "Examine the piece",
  "walk": "Walk here",
  "gps": "GPS is off, I'm here",
  "here": "A piece of the file belongs here.",
  "wit": "Someone stood here in {Y}: {p}.",
  "kinds": {
   "cam": "Photograph",
   "msg": "Letter",
   "wit": "Interview",
   "obj": "Exhibit",
   "time": "Cutting",
   "open": "First report"
  },
  "hold": "Hold to examine",
  "holdWit": "Hold to listen",
  "later": "Come back later",
  "found": "Piece {i} of 8 · {t}",
  "nbRoute": "Timeline",
  "nbPeople": "Names",
  "nbWhat": "What happened?",
  "nbNone": "The file is still empty. The times put that evening in order.",
  "nbTip": "Tap a name or an outcome to strike it out.",
  "scn": [
   [
    "Foul play",
    "Someone did something to {N} that evening."
   ],
   [
    "Accident, covered up",
    "It went wrong by accident, and someone covered it up."
   ],
   [
    "Left",
    "{N} left by choice and lives somewhere else."
   ]
  ],
  "vH": "Close the file",
  "vT": "Choose what happened in {Y} and who has known all these years. Every piece is genuine; nobody ever laid them side by side.",
  "vWhat": "What happened?",
  "vWho": "Who knew?",
  "vGo": "This is my conclusion",
  "vNeed": "Choose an outcome and a name.",
  "wrong": "That does not fit the file. The case stays open.",
  "wrongTries": "Lay the timeline next to the names once more.",
  "won": "File closed",
  "stars": [
   "Solved.",
   "First conclusion right.",
   "Within time."
  ],
  "missed1": "Star missed: right first time.",
  "missed2": "Star missed: within {m} minutes.",
  "up": "Promoted to {r}.",
  "pts": "+{x} points",
  "streakTxt": "{n} day in a row",
  "streakTxtP": "{n} days in a row",
  "share": "Share this case",
  "shareTxt": "Unsolved, file {c}: {s}, {m} min. Walk the same cold case in your own streets:",
  "copied": "Copied",
  "toHome": "To the start screen",
  "dH": "Play the same case",
  "dT": "Every file has a code. Enter someone else's code and you get the same case, the same names and the same truth, at places in your own streets.",
  "dGo": "Start this case",
  "dBad": "That case code does not exist. Check it and try again.",
  "aH": "Archive",
  "aNone": "No closed files yet.",
  "aTip": "Tap a file to share its case code.",
  "mMap": "Back to the map",
  "mHome": "To the start screen",
  "mWipe": "Erase this case",
  "saved": "Your case is saved. Choose Continue to go on.",
  "wipeQ": "Erase this case?",
  "wipeT": "The traces and time of this case will be lost.",
  "wipeY": "Yes, erase",
  "wipeAll": "Erase everything, including rank and archive",
  "allQ": "Erase everything?",
  "allT": "Rank, points, day streak and archive will be lost on this phone. Pro stays.",
  "allY": "Yes, erase everything",
  "wiped": "Erased.",
  "cancel": "Cancel",
  "noGps": "This device does not share its location. You can still play the practice round.",
  "denied": "No access to your location. Open this game in your phone's browser via an https address and allow location. You can play the practice round here.",
  "fail": "That won't work here",
  "loc": "Finding your location…",
  "pois": "Finding places near you…",
  "nomap": "The map service is not responding. Your traces lie within walking distance around you.",
  "demoTip": "Practice round: tap the map to walk.",
  "wait": "This usually takes 5 to 30 seconds. Stay on this page.",
  "pro": "Go Pro",
  "proFree": "Your first file is free.",
  "proUsed": "Your free file is closed. With Pro you open a new one every day, in every walk.",
  "proOn": "Pro is active on this phone.",
  "corner": "Corner of",
  "demoCase": "practice round",
  "quoteNote": "What they stated in {Y} need not be true. What is in the file is.",
  "stampOpen": "Unsolved",
  "stampDone": "Solved",
  "now": "Now",
  "backIn": "{Y}",
  "months": [
   "January",
   "February",
   "March",
   "April",
   "May",
   "June",
   "July",
   "August",
   "September",
   "October",
   "November",
   "December"
  ]
 },
 "PZ": {
  "lamp": [
   "A figure from {Y}",
   "Shine your torch across the old photograph. Keep the light on the figure until the circle closes. Three times."
  ],
  "seq": [
   "The strip lights in the archive",
   "They flicker in a fixed order. Watch closely and tap it back. Each round adds one."
  ],
  "pin": [
   "A phone from {Y}",
   "The keypad lock is on. Four keys are worn smooth. Find the order. Green is right; yellow is in the code, but elsewhere."
  ],
  "radio": [
   "The interview tape",
   "The cassette has stretched. Turn the dial until the voice is clear and hold it there."
  ],
  "tiles": [
   "A torn photograph from the file",
   "Tap two pieces to swap them until the picture is right."
  ],
  "dust": [
   "Under the dust of all those years",
   "Wipe it away."
  ],
  "look": "Watch…",
  "yours": "Your turn: {n} lights",
  "wrongSeq": "Wrong. Watch again.",
  "good": "Good. One more.",
  "tryBtn": "Try",
  "freq": "Frequency",
  "ar": {
   "h": "Look back",
   "t": "Point your camera at the street. The picture fades to {Y}. Turn until you see who stood here then and keep the figure in view. The image stays on your phone and is never stored or sent.",
   "yes": "Turn on camera",
   "no": "Without camera",
   "left": "◀ Turn left",
   "right": "Turn right ▶",
   "hold": "Hold still, the shutter is open…",
   "found": "Captured.",
   "close": "Camera off",
   "drag": "Swipe across the screen to look around"
  },
  "epi": {
   "btn": "To the last place · +50",
   "home": "To the start screen",
   "radar": "Walk to the last place: {d} m",
   "name": "The last place",
   "chip": "This is where {N}'s trail ended in {Y}.",
   "act": "Look around",
   "h": "Epilogue",
   "bonus": "+50 points",
   "back": "Back"
  }
 },
 "ECHO": [
  [
   "The diary page",
   1,
   "One week from {Y}. Thursday is circled; there is only a time beside it."
  ],
  [
   "The phone card",
   1,
   "Three units left. Nobody calls with a card like this any more."
  ],
  [
   "The cinema ticket",
   1,
   "Early showing, row 7. The seat beside it was never sold."
  ],
  [
   "The Polaroid",
   1,
   "Faded almost to white. A first name on the border, in ballpoint."
  ],
  [
   "The cassette",
   1,
   "Side A: music off the radio. Side B: someone recording a message and starting again."
  ],
  [
   "The video tape",
   2,
   "‘CCTV’, the label says. The last eleven minutes have been taped over."
  ],
  [
   "The notebook",
   2,
   "The detective's, from back then. On the last page one sentence, underlined three times: ‘why not asked?’"
  ],
  [
   "The red thread",
   2,
   "From the pinboard in the archive. It ran from the photo to a name, and someone has moved the pin."
  ],
  [
   "The necklace",
   2,
   "In a bag with a label. According to the label found by the bridge; according to the report never found."
  ],
  [
   "The missing page",
   3,
   "Page 14 of the file. It was in a different file, with a different name on the cover."
  ],
  [
   "The second statement",
   3,
   "Same witness, a week later. The story is the same, except for one time."
  ],
  [
   "The shade",
   3,
   "Not something to pick up. On the spot where {N} was last seen, someone stood for a moment. In the clothes of that year."
  ]
 ],
 "ECHOT": {
  "eye": "From the archive",
  "chip": "Something that stayed out of the file is lying here.",
  "act": "Pick it up",
  "radar": "Something from the archive is close by…",
  "name": "???",
  "found": "Found: {e}",
  "tip": "This piece clears someone: {X} ({XR}) was not with {N} that evening. {r}",
  "book": "From the archive",
  "bookT": "What never made it into the file. Rare pieces only show when you are close.",
  "tier": [
   "",
   "Common",
   "Rare",
   "Legendary"
  ],
  "reasons": [
   "Was in hospital that week; the discharge slip is in the folder.",
   "Was on stage at the community hall that evening, in front of a full room.",
   "Was abroad; the stamp is in the passport.",
   "Was on a night shift and clocked every fifteen minutes.",
   "Was at a wedding, and is in every photograph."
  ]
 },
 "TYPES": {
  "kerk": [
   "the church",
   "the verger"
  ],
  "bank": [
   "the bank",
   "the bank's night guard"
  ],
  "cafe": [
   "the café",
   "the barman"
  ],
  "hotel": [
   "the hotel",
   "the night porter"
  ],
  "apotheek": [
   "the pharmacy",
   "the pharmacy assistant"
  ],
  "halte": [
   "the bus stop",
   "the night-bus driver"
  ],
  "post": [
   "the postbox",
   "the postman"
  ],
  "park": [
   "the park",
   "the dog walker"
  ],
  "school": [
   "the school",
   "the caretaker"
  ],
  "winkel": [
   "the shop",
   "the shelf stacker"
  ],
  "bieb": [
   "the library",
   "the librarian"
  ],
  "kunst": [
   "the artwork",
   "the street musician"
  ],
  "bankje": [
   "the bench",
   "the sleepless neighbour"
  ],
  "tank": [
   "the petrol station",
   "the pump attendant"
  ],
  "hoek": [
   "the street corner",
   "the paper boy"
  ]
 },
 "SPARE": [
  "the street sweeper",
  "the night nurse on her way home",
  "the insomniac angler",
  "the baker's boy",
  "the homeless poet"
 ],
 "DEMO": [
  [
   "kunst",
   "Clock Tower"
  ],
  [
   "cafe",
   "The Crown & Anchor"
  ],
  [
   "post",
   "Pillar box, Fleet Lane"
  ],
  [
   "hotel",
   "Hotel Blackfriars"
  ],
  [
   "bank",
   "Lombard Savings Bank"
  ],
  [
   "apotheek",
   "Nightingale Pharmacy"
  ],
  [
   "park",
   "Nightingale Gardens"
  ],
  [
   "halte",
   "Lantern Street Station"
  ],
  [
   "bieb",
   "Marylebone Reading Room"
  ],
  [
   "kerk",
   "St Jude's Church"
  ],
  [
   "winkel",
   "Fleet Lane Bakery"
  ],
  [
   "school",
   "St Jude's School"
  ],
  [
   "bankje",
   "Bench on the Embankment"
  ]
 ],
 "PRON": {
  "f": {
   "P": "she",
   "O": "her",
   "S": "her"
  },
  "m": {
   "P": "he",
   "O": "him",
   "S": "his"
  }
 },
 "MISSING": [
  {
   "n": "Marlene Cooper",
   "r": "aged 19, student",
   "g": "f",
   "msg": "Home in ten. Don't wait up xx",
   "bio": "Cycled home from her evening job and never arrived. Her bike was found locked by the bridge the next morning."
  },
  {
   "n": "Dennis Lowe",
   "r": "aged 23, DJ in a local pub",
   "g": "m",
   "msg": "Got to sort something first. Explain tmrw",
   "bio": "Played until closing, packed his record case and walked out. A week later the case was still behind the bar."
  },
  {
   "n": "Ingrid Sutton",
   "r": "aged 34, cashier",
   "g": "f",
   "msg": "Don't set the alarm. I'll be there tomorrow as usual",
   "bio": "Cashed up, said goodnight to everyone and took the short cut through the park. Her bag was found; her coat was not."
  },
  {
   "n": "Robbie Arden",
   "r": "aged 17, schoolboy",
   "g": "m",
   "msg": "dont ring. back in a bit",
   "bio": "Went out for a moment after dinner. His moped stood on its stand by the bus stop, the key still in it."
  },
  {
   "n": "Karen Whitlock",
   "r": "aged 27, nurse",
   "g": "f",
   "msg": "Found something at work. Tell you when I'm home.",
   "bio": "Was on the late shift and clocked out at nine. After that three people saw her, and they do not agree about the time."
  },
  {
   "n": "Tony Harman",
   "r": "aged 41, taxi driver",
   "g": "m",
   "msg": "Last fare, then I'm done with it. Really.",
   "bio": "Signed off his last fare and parked the cab on the rank. The meter was still running when the morning shift came in."
  }
 ],
 "CONTACTS": [
  [
   "Ben Lambert",
   "the partner at the time",
   "We hadn't quarrelled. I said so then and I say so now."
  ],
  [
   "Sandra Merton",
   "the partner at the time",
   "It was already over. Only nobody knew yet."
  ],
  [
   "Stuart Baxter",
   "the housemate",
   "I was already in bed. I didn't hear the door."
  ],
  [
   "Linda Cole",
   "the housemate",
   "I assumed it was a night at someone else's. That happened often enough."
  ],
  [
   "Harry Swindell",
   "the employer",
   "By nine the till was counted and everyone went home."
  ],
  [
   "Maggie Varden",
   "the employer",
   "I never found that week's rota again."
  ],
  [
   "Colin Brooke",
   "the neighbour",
   "I don't watch who comes and goes. Never have."
  ],
  [
   "John Ryman",
   "the neighbour",
   "There was a light on until about two. That's all I know."
  ],
  [
   "Frank Kirkham",
   "the beat officer at the time",
   "We checked everything back then. Everything."
  ],
  [
   "Peter Small",
   "the beat officer at the time",
   "The file was not complete when I handed it over."
  ],
  [
   "Monica Dale",
   "the colleague",
   "We didn't see each other outside work."
  ],
  [
   "Ronald Peters",
   "the colleague",
   "I offered a lift. It was turned down."
  ]
 ],
 "CT": {
  "auto": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "had a car in {Y}",
    "nee": "had no car in {Y}"
   },
   "clue": {
    "ja": [
     {
      "k": "cam",
      "t": "CCTV, {D}, {t}. A dark saloon stands at the kerb with its engine running. {N} bends down to the window."
     },
     {
      "k": "wit",
      "t": "Statement, {Y}. Witness: ‘A car pulled up. The driver was someone familiar, because there was no hesitation getting in. I didn't get the plate.’"
     },
     {
      "k": "obj",
      "t": "Exhibit 04-11. A tyre print in the verge, measured and photographed. Never compared with a vehicle."
     }
    ],
    "nee": [
     {
      "k": "cam",
      "t": "CCTV, {D}, {t}. {N} walks beside someone pushing a bicycle. No car in shot, not on the whole tape."
     },
     {
      "k": "wit",
      "t": "Statement, {Y}. Witness: ‘They walked together, one pushing a bike. Over the bridge on foot. I saw no car.’"
     },
     {
      "k": "obj",
      "t": "Exhibit 04-12. A bicycle key on a piece of string, found on the path. Not {N}'s: that key was still in the lock."
     }
    ]
   }
  },
  "sleutel": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "had a key to {S} home",
    "nee": "had no key to {S} home"
   },
   "clue": {
    "ja": [
     {
      "k": "obj",
      "t": "Exhibit 04-07. {N}'s front door: not forced, double-locked from outside. In the margin: ‘who has a key?’ No answer is recorded."
     },
     {
      "k": "msg",
      "t": "Letter, found in {S} room: ‘I still have your key. I'm not bringing it back, then at least I have a reason to come.’ No sender."
     },
     {
      "k": "wit",
      "t": "Statement, {Y}. Neighbour: ‘Someone was inside that night. With a key, because I never heard the bell.’"
     }
    ],
    "nee": [
     {
      "k": "obj",
      "t": "Exhibit 04-08. The door-entry log: on {D} one bell was pressed eleven times. Whoever stood there could not get in alone."
     },
     {
      "k": "msg",
      "t": "Note pushed under the door: ‘I've been ringing. I'll wait by the bridge.’ No name."
     },
     {
      "k": "wit",
      "t": "Statement, {Y}. Neighbour: ‘The bell rang, over and over. Then the door opened and two people walked off down the street.’"
     }
    ]
   }
  },
  "werk": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "was working that evening",
    "nee": "was off that evening"
   },
   "clue": {
    "ja": [
     {
      "k": "wit",
      "t": "Statement, {Y}. Witness: ‘The other one was in work clothes. Had just come off shift, I heard.’"
     },
     {
      "k": "obj",
      "t": "Exhibit 04-15. A time card, clocked out at {t} on {D}. Found ten metres from where {N} was last seen."
     },
     {
      "k": "msg",
      "t": "Letter to {N}: ‘I finish work at nine. Will you wait for me? It has to be tonight.’ Unsigned."
     }
    ],
    "nee": [
     {
      "k": "wit",
      "t": "Statement, {Y}. Witness: ‘The other one had been standing there a long while. No hurry, no bag, nothing. Had all evening.’"
     },
     {
      "k": "obj",
      "t": "Exhibit 04-16. Two cinema tickets for the matinee on {D}. One is torn. Whoever sat in the cinema that afternoon was not at work."
     },
     {
      "k": "msg",
      "t": "Letter to {N}: ‘I waited for you all day. I'd taken the day off, for you.’ Unsigned."
     }
    ]
   }
  },
  "rookt": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "smoked in {Y}",
    "nee": "did not smoke"
   },
   "clue": {
    "ja": [
     {
      "k": "obj",
      "t": "Exhibit 04-03. Four cigarette ends of the same brand by the railing. Kept in {Y}, never examined. {N} did not smoke."
     },
     {
      "k": "cam",
      "t": "Photograph from the file. Two figures by the bridge; one holds a hand to the mouth. A point of light in the dark."
     },
     {
      "k": "wit",
      "t": "Statement, {Y}. Witness: ‘A cigarette was lit. I saw the flame, not the face.’"
     }
    ],
    "nee": [
     {
      "k": "obj",
      "t": "Exhibit 04-04. The ground by the railing was combed. Not one cigarette end. Note: ‘odd for someone who waited here an hour’."
     },
     {
      "k": "cam",
      "t": "Photograph from the file. Two figures by the bridge. Someone offers a packet of cigarettes; the other waves it away with a flat hand."
     },
     {
      "k": "wit",
      "t": "Statement, {Y}. Witness: ‘The other one turned down a cigarette. I remember because they laughed about it.’"
     }
    ]
   }
  },
  "lang": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "had known {O} for years",
    "nee": "had only known {O} a short while"
   },
   "clue": {
    "ja": [
     {
      "k": "msg",
      "t": "Letter to {N}: ‘After all these years I can ask this of you, surely.’ The handwriting was never compared."
     },
     {
      "k": "wit",
      "t": "Statement, {Y}. Witness: ‘They talked like people who had known each other a very long time. Half sentences, and the other understood.’"
     },
     {
      "k": "obj",
      "t": "Exhibit 04-19. An old photograph from {S} coat pocket, six years old. One face is circled in pen."
     }
    ],
    "nee": [
     {
      "k": "msg",
      "t": "Letter to {N}: ‘We've only known each other a few weeks, but I know what I saw.’ The handwriting was never compared."
     },
     {
      "k": "wit",
      "t": "Statement, {Y}. Witness: ‘It was polite, distant. They all but shook hands. Those two had not known each other long.’"
     },
     {
      "k": "obj",
      "t": "Exhibit 04-20. A beer mat with a first name and a phone number. The ink is from that same week."
     }
    ]
   }
  }
 },
 "SC": [
  {
   "m": "MO",
   "k": "obj",
   "t": "Exhibit 04-21. One of {N}'s shoes, the left, on the quay. The lace is still tied."
  },
  {
   "m": "MO",
   "k": "wit",
   "t": "Statement, {Y}. Witness: ‘I heard something fall into the water. Once. Then someone ran off.’"
  },
  {
   "m": "MO",
   "k": "time",
   "t": "The Courier, three days later: ‘Divers search canal. Police rule nothing out.’ Nothing was found. The search lasted one afternoon."
  },
  {
   "m": "MO",
   "k": "cam",
   "t": "CCTV, {D}, {t}. {N} takes a step back. Someone reaches for an arm. Then the picture cuts out: the tape was full."
  },
  {
   "m": "MV",
   "k": "msg",
   "t": "Letter with no sender: ‘If you come tonight, bring everything you don't want to lose.’"
  },
  {
   "m": "MV",
   "k": "wit",
   "t": "Statement, {Y}. Witness: ‘Someone was waiting. Not by chance: checking a watch every minute.’"
  },
  {
   "m": "MV",
   "k": "obj",
   "t": "Exhibit 04-23. {N}'s bank card, used once more a week later, in another town. The cash machine photo shows someone in a hood."
  },
  {
   "m": "MV",
   "k": "cam",
   "t": "Photograph from the file. {N} is handed an envelope and puts it away without looking inside."
  },
  {
   "m": "OV",
   "k": "obj",
   "t": "Exhibit 04-25. {N}'s transport was neatly locked. Someone who is attacked does not stop to lock up."
  },
  {
   "m": "OV",
   "k": "msg",
   "t": "Letter from {N}, never sent: ‘I want to get away from here. Not because of you. Because of me.’"
  },
  {
   "m": "OV",
   "k": "wit",
   "t": "Statement, {Y}. Witness: ‘No shouting, no row. Two people talking. For years I wondered why it ever became a case.’"
  },
  {
   "m": "OV",
   "k": "time",
   "t": "The Courier, a month later: ‘No indication of a crime.’ The item is on page 14, under the weather forecast."
  }
 ],
 "TIME": [
  {
   "k": "time",
   "t": "The Courier, the following week: ‘Missing: {N}.’ The first report is six lines long. Last seen on {D} at {t}."
  },
  {
   "k": "time",
   "t": "Appeal poster, yellowed: ‘Who saw {N} on {D} around {t}?’ The phone number below it no longer exists."
  },
  {
   "k": "time",
   "t": "Police note in pencil: ‘{t}, seen at the bus stop? Check.’ It was never checked."
  },
  {
   "k": "time",
   "t": "Control room log, {D}, {t}: ‘shouting or laughter, unclear’. No unit sent."
  }
 ],
 "OPEN": "The file begins here. On {D} at {t} {N} sent one last text: “{msg}” After that nobody saw {O} again.",
 "END": [
  [
   "{K} ({KR}) was with {N} that evening and has kept silent about it all these years. There was a quarrel, and only {K} knows how it ended. It was all in the file already. Nobody had ever laid it side by side.",
   "You are standing where the trail ended. The case goes back to the detectives, with your timeline attached. {K} will be interviewed again tomorrow. This time the pieces will be on the table."
  ],
  [
   "It was an accident, and {K} ({KR}) was there. No intent: panic. {K} walked away and said nothing, and every year silence became easier than speaking.",
   "{K} opens the door in person when you ring. ‘I knew someone would come one day,’ {K} says. ‘I already have my coat on.’"
  ],
  [
   "{N} left by choice, and {K} ({KR}) helped and has known all these years. No crime: an agreement. The bank card in the other town, the envelope, the lock: it was all there.",
   "A week later a card lands on your mat, no sender, postmarked far away. ‘Thank you for understanding. Tell them at home I'm all right.’ You know the handwriting from the file."
  ]
 ],
 "SCN": [
  "M",
  "O",
  "V"
 ],
 "THEN": {
  "kerk": "The church was already here in {Y}. Its clock ran eight minutes slow then.",
  "bank": "In {Y} this was a bank branch with a counter and a night safe.",
  "cafe": "In {Y} this was an old pub where you could still smoke indoors.",
  "hotel": "In {Y} this was a guest house with a night bell and a register.",
  "apotheek": "In {Y} this was a chemist's with a photo counter.",
  "halte": "The same stop as in {Y}. Back then a phone box stood beside it.",
  "post": "In {Y} a red pillar box stood here.",
  "park": "The same park as in {Y}, but without street lamps then.",
  "school": "The same school as in {Y}. The bike shed was on the other side.",
  "winkel": "In {Y} this was a video rental shop.",
  "bieb": "The library of {Y}, with a card index and one computer.",
  "kunst": "In {Y} only an empty plinth stood here.",
  "bankje": "In {Y} a wooden bench with no back stood here.",
  "tank": "In {Y} this was a filling station with an attendant and a gumball machine.",
  "hoek": "In {Y} a phone box stood on this corner."
 }
};
