/* The Last Bus – English text and case data. Placeholders: {N} the missing person, {P}/{O}/{S} pronouns, {K} the place the journey really went, {KR} kind of place, {LN} route number, {t} time.
   CONTACTS are PLACES here: [name, kind of place, what they say at home, fixed traits]. CT: labels per trait + leads pointing at that value.
   SC: leads per reason (A meeting, G money, B proof); each fits two reasons. TWIST: which certainty falls after 3, 5 and 7 leads. */
window.LB_DATA={
 "lang": "en",
 "T": {
  "title": "The Last Bus",
  "eyebrow": "Missing",
  "lead": "The phone arrived home. The travel card checked out. The camera saw someone get off. But nobody came home.",
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
   "The map lays eight leads from the last hour on real places around you: messages, locations, a purchase, camera stills, a witness, a found object.",
   "Along the way the certainties fall away one by one. The missing person was not heading straight home at all.",
   "Decide where the journey really went, and why nobody was allowed to know."
  ],
  "archive": "Archive",
  "echoBtn": "Lost property",
  "nbEcho": "Found",
  "wipe": "Erase",
  "safety": "Stay on public roads and mind the traffic. You never need to go inside.",
  "allWalks": "◂ All walks",
  "lang": "Nederlands",
  "brief": "Missing",
  "missing": "Last journey: route {LN}",
  "lastMsg": "Last message · {t}",
  "contacts": "Six places {N} could have gone",
  "go": "Follow the route",
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
  "radar0": "Next stop: the first lead",
  "radarAll": "Terminus. All leads in: close the file.",
  "hot": "Stop approaching · {d} m",
  "warm": "Next stop · {d} m",
  "near": "Next stop · {d} m",
  "note": "Travel log",
  "close": "Close file",
  "look": "Examine the lead",
  "walk": "Walk here",
  "gps": "GPS is off, I'm here",
  "here": "A lead from the last hour lies here.",
  "wit": "Someone is waiting for the bus here: {p}.",
  "kinds": {
   "cam": "Camera still",
   "msg": "Message",
   "wit": "Witness",
   "obj": "Receipt or object",
   "time": "Location",
   "open": "Last journey"
  },
  "hold": "Hold to examine",
  "holdWit": "Hold to listen",
  "later": "Come back later",
  "found": "Lead {i} of 8 · {t}",
  "nbRoute": "Travel log",
  "nbPeople": "Where to?",
  "nbWhat": "Why?",
  "nbNone": "No leads yet. The times put the last hour in order.",
  "nbTip": "Tap a place or a reason to strike it out.",
  "scn": [
   [
    "A meeting",
    "{N} went to see someone nobody at home was allowed to know about."
   ],
   [
    "Money",
    "{N} had to pay or collect something that had to stay hidden."
   ],
   [
    "Proof",
    "{N} was looking into something and wanted to be sure before telling anyone."
   ]
  ],
  "vH": "Close the file",
  "vT": "Where was {N} really going, and why was nobody allowed to know? Every lead along the way is true; together they point one way.",
  "vWhat": "Why was nobody allowed to know?",
  "vWho": "Where did the journey really go?",
  "vGo": "This is my conclusion",
  "vNeed": "Choose a place and a reason.",
  "wrong": "That does not fit the travel log. The place, the reason, or both are wrong.",
  "wrongTries": "Lay the locations next to the six places once more.",
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
  "shareTxt": "The Last Bus, file {c}: {s}, {m} min. Walk the same disappearance in your own streets:",
  "copied": "Copied",
  "toHome": "To the start screen",
  "dH": "Play the same case",
  "dT": "Every case has a code. Enter someone else's code and you get the same disappearance, the same places and the same truth, in your own streets.",
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
  "proFree": "Your first ride is free.",
  "proUsed": "Your free case is played. With Pro you play a new one every day, in every walk.",
  "proOn": "Pro is active on this phone.",
  "corner": "Corner of",
  "demoCase": "practice round",
  "quoteNote": "What they say at home about these places is what they thought they knew. The leads along the way are facts.",
  "line": "Route",
  "endStop": "Terminus",
  "certH": "What everyone assumes",
  "certGone": "A certainty falls",
  "cert": [
   [
    "Phone",
    "arrived home"
   ],
   [
    "Travel card",
    "checked out at the home stop"
   ],
   [
    "Camera",
    "got off, own coat, own bag"
   ],
   [
    "Home",
    "never arrived"
   ]
  ]
 },
 "PZ": {
  "lamp": [
   "Someone in the dark by the stop",
   "Shine your torch. Keep the light on the figure until the circle closes. Three times."
  ],
  "seq": [
   "The lights on the stop button",
   "They light up in an order. Watch closely and tap it back. Each round adds one."
  ],
  "pin": [
   "The phone is locked",
   "Four keys carry greasy smudges. Find the order. Green is right; yellow is in the code, but elsewhere."
  ],
  "radio": [
   "The bus radio",
   "Turn the dial until the driver's voice is clear and hold it there."
  ],
  "tiles": [
   "A torn printout",
   "Tap two pieces to swap them until the picture is right."
  ],
  "dust": [
   "A steamed-up window",
   "Wipe it clear."
  ],
  "look": "Watch…",
  "yours": "Your turn: {n} lights",
  "wrongSeq": "Wrong. Watch again.",
  "good": "Good. One more.",
  "tryBtn": "Try",
  "freq": "Frequency",
  "ar": {
   "h": "Look by the stop",
   "t": "Through your camera you can see where {N} stood that hour. Turn until you find the figure and keep it in view. The image stays on your phone and is never stored or sent.",
   "yes": "Turn on camera",
   "no": "Without camera",
   "left": "◀ Turn left",
   "right": "Turn right ▶",
   "hold": "Hold still…",
   "found": "Captured.",
   "close": "Camera off",
   "drag": "Swipe across the screen to look around"
  },
  "epi": {
   "btn": "To the real terminus · +50",
   "home": "To the start screen",
   "radar": "Walk to the real terminus: {d} m",
   "name": "The real terminus",
   "chip": "This is where {N}'s journey really ended.",
   "act": "Look around",
   "h": "Epilogue",
   "bonus": "+50 points",
   "back": "Back"
  }
 },
 "ECHO": [
  [
   "The bus ticket",
   1,
   "Single journey, stamped. The stop on the ticket is not the stop near home."
  ],
  [
   "The glove",
   1,
   "One, on the back seat. The other was never found."
  ],
  [
   "The earphones",
   1,
   "Still tangled. Nobody listened to music on that ride."
  ],
  [
   "The umbrella",
   1,
   "Folded in the rack. It was raining, and still it was left behind."
  ],
  [
   "The receipt",
   1,
   "A bottle of water and a roll of mints. Cash, two minutes before departure."
  ],
  [
   "The key fob",
   2,
   "A red tag with a route number on it. The house key is no longer attached."
  ],
  [
   "The timetable",
   2,
   "Printed out, one time circled. It is not the time of the bus home."
  ],
  [
   "The second ticket",
   2,
   "Same evening, other direction. Bought before the first one was used."
  ],
  [
   "The power bank",
   2,
   "Empty. Someone used it to keep a phone awake that should long have been lying at home."
  ],
  [
   "The coat",
   3,
   "{N}'s. It hung over a seat on the bus, and someone else put it on."
  ],
  [
   "The second phone",
   3,
   "Prepaid, one contact, no name. Last call: four minutes, during the hour of the ride."
  ],
  [
   "The empty seat",
   3,
   "Not something to pick up. The driver is certain someone sat there. On the footage the seat is empty."
  ]
 ],
 "ECHOT": {
  "eye": "Left behind on route {LN}",
  "chip": "Something is lying here.",
  "act": "Pick it up",
  "radar": "Something was left behind here…",
  "name": "???",
  "found": "Found: {e}",
  "tip": "This object strikes out a place: it cannot be {X}. {r}",
  "book": "Lost property",
  "bookT": "What was left on the route that evening. Rare objects only show when you are close.",
  "tier": [
   "",
   "Common",
   "Rare",
   "Legendary"
  ],
  "reasons": [
   "A patrol car was parked there that evening; they would have seen {O}.",
   "The gate there was locked by ten, and the lock was not touched.",
   "There was a camera there that did work. Nobody is on it.",
   "A crew was working there until after midnight; nobody saw anyone arrive.",
   "A dog walker was doing the usual round there, and paying attention."
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
   "n": "Lisa White",
   "r": "aged 24, nursery worker",
   "g": "f",
   "msg": "Nearly at the bus. Home soon",
   "bio": "Got on the last bus after her late shift. Her housemate heard nothing and found an empty bed the next morning."
  },
  {
   "n": "Jasper Miller",
   "r": "aged 31, mechanic",
   "g": "m",
   "msg": "Caught the last bus. Start eating without me",
   "bio": "Was coming home on the last bus after a birthday. At midnight his girlfriend saw his location at home and went to sleep."
  },
  {
   "n": "Nadia Bouzid",
   "r": "aged 19, student",
   "g": "f",
   "msg": "On the bus. Don't double-lock the door",
   "bio": "Texted her mother from the stop. The door stayed off the double lock. Nobody came in."
  },
  {
   "n": "Rupert Clarke",
   "r": "aged 45, accountant",
   "g": "m",
   "msg": "On my way. See you in a bit.",
   "bio": "Took the last bus after a meeting that overran. His briefcase turned up in lost property the next day. Empty."
  },
  {
   "n": "Iris Hawkins",
   "r": "aged 37, nurse",
   "g": "f",
   "msg": "Bus is coming. I'll text when I'm in",
   "bio": "That last text never came. Her phone did say she was at home: until the battery ran out."
  },
  {
   "n": "Dan Verney",
   "r": "aged 17, schoolboy",
   "g": "m",
   "msg": "on the bus. dont wait up",
   "bio": "His father stayed up anyway. At quarter past twelve the app put Dan's phone in the hallway. The hallway was empty."
  }
 ],
 "CONTACTS": [
  [
   "The hospital",
   "a place of care",
   "{P} knew nobody there. As far as we know.",
   {
    "lijn": "ja",
    "open": "ja",
    "water": "nee",
    "cam": "ja",
    "druk": "ja"
   }
  ],
  [
   "The night pharmacy",
   "a place of care",
   "Nobody at home was ill.",
   {
    "lijn": "nee",
    "open": "ja",
    "water": "nee",
    "cam": "ja",
    "druk": "nee"
   }
  ],
  [
   "The railway station",
   "a way out",
   "You don't leave without a bag. Do you?",
   {
    "lijn": "nee",
    "open": "ja",
    "water": "nee",
    "cam": "ja",
    "druk": "ja"
   }
  ],
  [
   "The car-share car park",
   "a way out",
   "Who on earth would pick {O} up there?",
   {
    "lijn": "nee",
    "open": "ja",
    "water": "nee",
    "cam": "nee",
    "druk": "nee"
   }
  ],
  [
   "The allotments",
   "an abandoned place",
   "{P} hasn't been there since childhood.",
   {
    "lijn": "nee",
    "open": "nee",
    "water": "ja",
    "cam": "nee",
    "druk": "nee"
   }
  ],
  [
   "The old swimming baths",
   "an abandoned place",
   "That has stood empty for years. You don't end up there by chance.",
   {
    "lijn": "ja",
    "open": "nee",
    "water": "ja",
    "cam": "nee",
    "druk": "nee"
   }
  ],
  [
   "The office after hours",
   "a workplace",
   "{S} work ended at six. Always.",
   {
    "lijn": "ja",
    "open": "nee",
    "water": "nee",
    "cam": "ja",
    "druk": "nee"
   }
  ],
  [
   "The warehouse by the docks",
   "a workplace",
   "We have never heard that name mentioned.",
   {
    "lijn": "nee",
    "open": "nee",
    "water": "ja",
    "cam": "ja",
    "druk": "nee"
   }
  ],
  [
   "A house on Park Lane",
   "an address",
   "We know nobody there.",
   {
    "lijn": "ja",
    "open": "nee",
    "water": "nee",
    "cam": "nee",
    "druk": "nee"
   }
  ],
  [
   "A flat on Town Hall Square",
   "an address",
   "Nobody we know lives there, as far as we are aware.",
   {
    "lijn": "ja",
    "open": "ja",
    "water": "nee",
    "cam": "ja",
    "druk": "nee"
   }
  ],
  [
   "The cemetery",
   "a quiet place",
   "None of ours is buried there.",
   {
    "lijn": "nee",
    "open": "nee",
    "water": "nee",
    "cam": "nee",
    "druk": "nee"
   }
  ],
  [
   "The quay by the bridge",
   "a quiet place",
   "{P} only went there to think. Years ago.",
   {
    "lijn": "ja",
    "open": "ja",
    "water": "ja",
    "cam": "nee",
    "druk": "ja"
   }
  ]
 ],
 "CT": {
  "lijn": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "is on route {LN}",
    "nee": "is not on route {LN}"
   },
   "clue": {
    "ja": [
     {
      "k": "time",
      "t": "Travel log, {t}: a second check-in on route {LN}, the other way. Wherever {N} was going, it is on the same route."
     },
     {
      "k": "wit",
      "t": "‘Got back on with me. Same route, going back. Asked whether I went all the way.’"
     },
     {
      "k": "obj",
      "t": "A second bus ticket: route {LN}, {t}, single. Bought while the phone was already ‘home’."
     }
    ],
    "nee": [
     {
      "k": "time",
      "t": "Travel log: after {t} not a single check-in on route {LN}. The last stretch was on foot or by something else."
     },
     {
      "k": "wit",
      "t": "‘Walked straight past the stop. Didn't wait for the bus back, turned into a street no route runs along.’"
     },
     {
      "k": "obj",
      "t": "A receipt for a hire bike, unlocked at {t}. No bus runs to where {N} wanted to go."
     }
    ]
   }
  },
  "open": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "is open at night",
    "nee": "is closed at night"
   },
   "clue": {
    "ja": [
     {
      "k": "msg",
      "t": "Message from {N}, {t}, to a number with no name: ‘Are you still open now? I'm on my way.’"
     },
     {
      "k": "wit",
      "t": "‘I was asked whether it was still open there at night. I said: all night long.’"
     },
     {
      "k": "obj",
      "t": "A receipt from {t}: coffee from a machine that only stands indoors. So someone could still get in."
     }
    ],
    "nee": [
     {
      "k": "msg",
      "t": "Message from {N}, {t}, to a number with no name: ‘The gate's shut, I know. I'll come round the back.’"
     },
     {
      "k": "wit",
      "t": "‘I did say: there's nobody there now, it's all locked up. That was known, I was told.’"
     },
     {
      "k": "obj",
      "t": "A small torch, still in its packaging, with a receipt from {t}. Where {N} was going, no light was on."
     }
    ]
   }
  },
  "water": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "is by the water",
    "nee": "is not by the water"
   },
   "clue": {
    "ja": [
     {
      "k": "cam",
      "t": "Camera still, {t}. {N} walks down the slope, towards the water. Not towards home."
     },
     {
      "k": "wit",
      "t": "‘I was asked which way the water was. Not the street home, the water.’"
     },
     {
      "k": "obj",
      "t": "A scarf over a railing. On the other side of that railing there is only water."
     }
    ],
    "nee": [
     {
      "k": "cam",
      "t": "Camera still, {t}. {N} crosses the bridge without stopping and walks away from the water, into the estate."
     },
     {
      "k": "wit",
      "t": "‘Not to the quay, no. The other way, away from the water.’"
     },
     {
      "k": "obj",
      "t": "Dry shoe prints on a covered path leading away from the water. Nobody heading for the quay walked here."
     }
    ]
   }
  },
  "cam": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "is covered in cameras",
    "nee": "has no cameras"
   },
   "clue": {
    "ja": [
     {
      "k": "time",
      "t": "Phone log, {t}: a second handset connects to a network called ‘SECURITY-GUEST’."
     },
     {
      "k": "msg",
      "t": "Message to {N}, {t}: ‘There are cameras everywhere there. Put your hood up.’"
     },
     {
      "k": "wit",
      "t": "‘The hood went up. “They film everything there,” I heard.’"
     }
    ],
    "nee": [
     {
      "k": "time",
      "t": "Phone log, {t}: last mast, then nothing. No wifi, no cash machine, no camera anywhere near."
     },
     {
      "k": "msg",
      "t": "Message to {N}, {t}: ‘Nobody sees us there. No cameras. That's the point.’"
     },
     {
      "k": "wit",
      "t": "‘“At least there's nothing up on the walls there,” I heard. I thought: what an odd reason to go somewhere.’"
     }
    ]
   }
  },
  "druk": {
   "v": [
    "ja",
    "nee"
   ],
   "tag": {
    "ja": "is busy in the evening",
    "nee": "is deserted in the evening"
   },
   "clue": {
    "ja": [
     {
      "k": "wit",
      "t": "‘“It's busy there, I won't stand out.” That's what I heard, on the phone.’"
     },
     {
      "k": "cam",
      "t": "Camera still, {t}. {N} disappears into a group of people walking the same way."
     },
     {
      "k": "msg",
      "t": "Message to {N}, {t}: ‘Wait among the people. Don't stand apart.’"
     }
    ],
    "nee": [
     {
      "k": "wit",
      "t": "‘“Not a soul goes there at this hour.” It sounded as if that was an advantage.’"
     },
     {
      "k": "cam",
      "t": "Camera still, {t}. {N} walks alone into an empty street. Nobody else comes into shot before the corner."
     },
     {
      "k": "msg",
      "t": "Message to {N}, {t}: ‘There's nobody there at this hour. Just us.’"
     }
    ]
   }
  }
 },
 "SC": [
  {
   "m": "AG",
   "k": "msg",
   "t": "Message to {N}, {t}: ‘Come alone. Bring what we agreed.’"
  },
  {
   "m": "AG",
   "k": "wit",
   "t": "‘Someone was waiting, one stop further on. The two of them walked off together without a word.’"
  },
  {
   "m": "AG",
   "k": "obj",
   "t": "A receipt from {t}: two coffees, paid in cash. {N} never normally carried cash."
  },
  {
   "m": "AG",
   "k": "cam",
   "t": "Camera still, {t}. {N} hands something to someone out of shot. Only a hand is visible."
  },
  {
   "m": "AB",
   "k": "msg",
   "t": "Message from {N}, {t}, never delivered: ‘I'm going to ask in person tonight. If it's true, I know enough.’"
  },
  {
   "m": "AB",
   "k": "wit",
   "t": "‘I was shown a photo, on a phone. Did I know that person. I didn't.’"
  },
  {
   "m": "AB",
   "k": "obj",
   "t": "A folded note: a name, a time, and underneath ‘don't call, go round’."
  },
  {
   "m": "AB",
   "k": "time",
   "t": "Search history, {t}: the same name, four times in a row. Then directions."
  },
  {
   "m": "GB",
   "k": "obj",
   "t": "A receipt from the copy shop by the stop, {t}: 46 copies, paid in cash."
  },
  {
   "m": "GB",
   "k": "msg",
   "t": "Message to {N}, {t}: ‘If you take this outside, it costs us both everything.’"
  },
  {
   "m": "GB",
   "k": "time",
   "t": "Banking app, {t}: balance checked, three times in ten minutes. Nothing transferred."
  },
  {
   "m": "GB",
   "k": "cam",
   "t": "Camera still, {t}. {N} takes an envelope from the rucksack, looks inside, puts it back and checks the zip twice."
  }
 ],
 "TIME": [
  {
   "k": "time",
   "t": "Travel log, {t}: checked in, route {LN}. According to the card an ordinary ride home."
  },
  {
   "k": "time",
   "t": "Phone log, {t}: the handset moves at the speed of a bus, stop after stop. Exactly as expected."
  },
  {
   "k": "time",
   "t": "Timetable, route {LN}: last departure, {t}. The bus ran four minutes late. Nobody knows why it waited."
  },
  {
   "k": "time",
   "t": "Doorbell camera on the route, {t}: the last bus goes by. The lights are on inside. Nobody is sitting at the back."
  }
 ],
 "OPEN": "Here {N} boarded route {LN} at {t}, the last bus. Last message: “{msg}” Phone, travel card and camera all say: got home. Home says: no.",
 "END": [
  [
   "{N} went to {K}. Someone was waiting there whom nobody at home was allowed to know about: not a lover, but family {P} had only known of for a month. The phone and the travel card rode home in someone else's bag, so nobody would ask questions.",
   "A light is still on at the real terminus. {N} opens the door in person. ‘I meant to tell them,’ {P} says. ‘I just didn't know how you say a thing like that at home.’ You call the house. This time the message is true."
  ],
  [
   "{N} went to {K}, to pay something nobody at home was allowed to know about: someone else's debt, which {P} had taken on. The phone and the travel card rode home in someone else's bag. Everything had to look like an ordinary evening.",
   "At the real terminus {N} is sitting on a low wall, the empty envelope beside {O}. ‘It's paid,’ {P} says. ‘I just didn't dare go home.’ You call the house. They are on their way."
  ],
  [
   "{N} went to {K}, to see in person what nobody believed. Nobody at home was allowed to know, because it concerned someone at home. The phone and the travel card rode home in someone else's bag: anyone watching saw an ordinary ride.",
   "At the real terminus {N} is standing with the copies under the coat. ‘I wanted to be sure first,’ {P} says. ‘Now I am.’ You call the house. There is a long silence at the other end."
  ]
 ],
 "TWIST": {
  "3": "The phone did arrive home. In someone else's bag.",
  "5": "The travel card checked out at the home stop. But {N} was not holding it.",
  "7": "The camera saw {N}'s coat get off. It was not {N}."
 },
 "LINES": [
  73,
  12,
  401,
  9,
  55,
  7,
  23,
  118
 ],
 "SCN": [
  "A",
  "G",
  "B"
 ]
};
