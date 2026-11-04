/* Professor Zero and the Missing Numbers – MiniMystery Education (maths, ages 6–12). Texts and maths stations (EN).
   All the numbers in the school have gone: from the clock, the doors, the calendar, the till. Professor Zero thinks numbers are useless.
   At places around (or inside) the school there are "maths stations": there the team proves you need numbers by really
   counting, measuring, estimating or calculating something. Each station gives a number key. In the finale they put the numbers in order:
   then the number vault opens and the numbers come back.
   Levels: 0 = ages 6–8 (Dutch groep 3–4: up to 20/100, counting, measuring with steps, hours and half hours, money up to 10; two pictures as answers,
   everything is read aloud) · 1 = ages 8–10 (groep 5–6: up to 1000, times tables, cm/m, quarter hours, money with decimals, halves and quarters) ·
   2 = ages 10–12 (groep 7–8: large numbers, decimals, percentages, ratios, area, scale, mean).
   Per station: intro, act {out,in} (the measurement), lvl[3] (kind text/choice/count/word/clock; count = first count something, then fn(x)
   gives the follow-up question), tip (the learning moment after the answer). */
window.RK_DATA=(function(){
var Y=new Date().getFullYear();
var T={
  today:"Start today's case",extra:"Extra case",voice:"Read aloud",voiceOn:"Reading aloud is on",voiceOff:"Reading aloud is off",
  start:"Open the maths station",next:"Next ▸",back:"Back",close:"Close",cancel:"Cancel",ok:"Check ▸",listen:"Read aloud",
  loc:"Where are you? The phone will ask for your location.",pois:"Miss Noor is looking for maths stations nearby…",nomap:"The map service is busy. We'll play on a drawn map.",
  noGps:"This phone has no GPS.",denied:"Location is turned off. Turn it on in the settings, or play without a map.",fail:"That didn't work",
  corner:"Corner",task:"Station {i} of {n}",clue:"Number key {n} of {t}",
  near:"Next station in {d} m",warm:"Warm! {d} m to go",hot:"Hot! There's a station here",radarAll:"All the number keys! Off to the number vault.",
  here:"Here's a maths station",look:"Open the station",walk:"Walk there",gps:"We're really here (GPS isn't sure)",
  notebook:"Maths notebook",nbK:"Number keys",nbM:"Your measurements",nbNone:"Nothing found yet. Walk to the first station.",
  menu:"Menu",mBack:"Back to the case",mHome:"Pause, carry on later",mWipe:"Delete this case",mLead:"Leader's sheet",saved:"Saved. You can carry on later.",
  wipe:"Delete",wipeY:"Delete this case",wipeAll:"Delete everything (archive too)",wipeQ:"Delete case?",wipeT:"Your progress will be lost.",allQ:"Delete everything?",allT:"The case, the archive and the settings will be deleted.",allY:"Yes, delete everything",wiped:"Deleted",
  dH:"Enter a case code",dT:"With a case code, several phones play the same case: the same places, the same stations. That way each class or group gets one case for all its teams.",dGo:"Get the case",dBad:"We don't know that code. Codes start with RK.",
  demoCase:"Practice round · drawn town",demoTip:"Tap a place on the map: your group will walk there by itself.",
  howH:"How does it work?",
  won:"Numbers back",dipBtn:"Certificate (A4)",dipH:"Maths Detective Certificate",dipNote:"Print or save. One per team, or print one for every child.",leadBtn:"Leader's sheet",home:"Back to the start",dl:"Save",shareBtn:"Share",copied:"Copied",
  shareTxt:"We got the numbers back! Case {c} · {s} · {m} min. ",missed1:"No hints: three stars.",
  pzT:"Talk it over together. One person types.",wrong:"Not quite. Work it out together again.",wrongHint:"Not quite. Use the hint, or work it out together again.",hintBtn:"💡 Hint",hintUsed:"Hint used",
  countGo:"Done ▸",photoGo:"📷 Take the photo",photoAgain:"Try again",photoOk:"That's the one! ▸",photoKeep:"The photo stays on this phone.",
  keyGet:"A number key:",tipH:"Maths tip",
  finH:"The number vault",finT:"Tap your number keys from smallest to largest. If the order is right, the vault opens.",finT0:"Tap the numbers: the smallest first, then a bigger one each time.",finBad:"That isn't the smallest one left. Start again.",finHint:"First look for the smallest number. With decimals: look at the number before the decimal point.",finHint0:"The smallest number first. Count: which one comes first when you count?",finNot:"Do all the stations first. {n} to go.",finOk:"CLICK! The vault is open. All the numbers come flooding back!",
  stripT:"Case {c}",keysBar:"Number keys",
  gbH:"In the building",gbT:"Choose the places in your school. The leader puts a card with a code at each place (print them from the leader's sheet). Teams go to the place and type the code.",gbNoCards:"Without cards (teams press 'We're here' themselves)",gbGo:"Start the case",gbMin:"Choose at least {n} places (or the places will repeat).",
  gbGoto:"Go to:",gbCode:"Type the code from the card at that place",gbHere:"We're here ▸",gbBad:"That code doesn't belong to this place. Have another look at the card.",gbCards:"Place cards (to put up)",gbCardT:"Maths station",
  leadH:"Leader's sheet",leadT:"For the leader only. This sheet belongs to this case code: all teams with this code get exactly these stations.",leadTeams:"Team scores (keep track yourself)",leadTeam:"Team",leadDone:"Finished at",leadPrint:"Print",leadCode:"Case code",
  lvl:["ages 6–8","ages 8–10","ages 10–12"],
  nw:{6:"six",8:"eight",10:"ten"},
  clockQ:["What time is it on this clock?","What time is it on this clock? Type it like 8:15.","What time is it on this clock? Type it like 8:35."],
  kv:{fp:["Bike shed","Bus stop","Playground","Schoolyard","Bridge","Park","Church","Square","Shop","Postbox","Kiosk","Bench"],
    all:"All the number keys! Off to the vault.",near:"Station in {d} m",cold:"Cold… try walking another way",cool:"Lukewarm. It's getting closer",warm:"Warm! Well done!",hot:"HOT! Look around you!",here:"Here's the station!",first:"Start walking, the compass will show the way",noDir:"Walk a little way, then the compass will know the direction",
    map:"Map",kids:"Story map",mapTip:"The real map. Tap Story map for the children's drawing.",goDemo:"We're (pretend) walking to {p}…",inSteps:"{n} steps to go",
    mNoMap:"Carry on without a map (same case)",switched:"Carrying on without a map. Same case, same stations.",virtOut:"We couldn't find a map of the area. You'll walk on the story map: the arrow and warm/cold will show the way.",
    noMapQ:"No location today?",noMapT:"The phone isn't giving a location. You can play the same case without a map: the stations then come one after another, and you walk to a new spot yourselves.",noMapGo:"Carry on without a map",
    inH:"",inT:"",inSensor:"",inTempo:"",inNoSensor:""}
};
var TYPES={kerk:"the church",hotel:"the hotel",bank:"the bank",apotheek:"the chemist's",cafe:"the café",bieb:"the library",park:"the park",school:"the school",kunst:"the artwork",tank:"the petrol station",winkel:"the shop",halte:"the bus stop",post:"the postbox",bankje:"the bench",hoek:"the corner"};
var TIK="Mr Tik",NOOR="Miss Noor",NUL="Professor Zero";
var ROOMS=["The hall by the entrance","The assembly hall","The gym","The library or reading corner","The stairs","By the staff room","The kitchen","The playground","An infants' classroom","An upper-school classroom","By the head teacher's office","The bike shed","The indoor play room","The coat pegs"];
var OPEN={
  school:"Something strange happened this morning. The clock in the hall had no numbers any more. Nor did the classroom doors. The calendar was empty and the till in the canteen wasn't working. On the board it said: \"Numbers are useless. I have locked them away in my vault. – Professor Zero.\" But without numbers, nobody knows what time it is, where classroom 7 is, or how much a sandwich costs. You are going to prove Professor Zero wrong. There is a maths station at {N} places. There you will count, measure or work out something real. Each station gives a number key. With all the keys in order, the vault will open.",
  bso:"All the numbers have gone! From the clock, from the doors, from the calendar, from the till. On the board, in big letters, it says: \"Numbers are useless. I have locked them away in my vault. – Professor Zero.\" Well, just try buying a sandwich without numbers! You are going to show Professor Zero that he is wrong. There is a maths station at {N} places. There you will count, measure or work out something real from the neighbourhood. Each station gives a number key. All the keys in order: then the vault will crack open."
};
var OPEN0={
  school:"All the numbers have gone! The clock has no numbers any more. Nor do the doors. Professor Zero has put them in his vault. He says you don't need numbers. But without numbers you can't tell the time! There is a maths station at {N} places. There you will count and measure something real. Each station gives a number. All the numbers in order: then the vault will open.",
  bso:"All the numbers have gone! From the clock, from the doors, from the till. Professor Zero has put them in his vault. He says you don't need numbers. Pff! There is a maths station at {N} places. There you will count and measure something real. Each station gives a number. All the numbers in order: then the vault will open!"
};
var CLIFF=["You see, Professor Zero? You can't manage without numbers.","Well measured. That's how surveyors do it too.","Another number key. Keep it safe in the maths notebook.","Professor Zero is muttering something. I think he's starting to have doubts.","Doing maths with real things: not everyone can do that.","On to the next station!"];
var CLIFFLAST="That was the last station! Now put all the number keys in order, and the vault will open.";
var REVEAL={
  school:"<p>CLICK. The number vault swings open and the numbers come flooding out: back to the clock, to the doors, to the calendar. Professor Zero stands there with his arms folded.</p><p>\"All right,\" he grumbles. \"You have measured, counted, estimated and calculated. With real steps and real windows and real euros. Perhaps… numbers are useful after all.\"</p><p>Miss Noor laughs. \"Perhaps?\" Professor Zero looks at the clock, which has its numbers again. \"Hm. Quarter past eleven. Time for coffee. I didn't know that a minute ago.\"</p>",
  bso:"<p>CLICK! The number vault swings open and the numbers fly out: back to the clock, to the doors, to the till. Professor Zero stands there with a red face.</p><p>\"OK, OK,\" he grumbles. \"You have measured and counted and calculated. With real steps and real windows and real euros. Numbers are… perhaps… a tiny bit useful.\"</p><p>Mr Tik grins and looks at the clock. \"Quarter past eleven, Professor. Time for coffee. Without numbers you would never have known.\"</p>"
};
var REVEAL0={
  school:"<p>CLICK! The vault opens. All the numbers come flooding out, back to the clock and the doors.</p><p>Professor Zero looks glum. \"You have counted and measured. Numbers are… quite useful after all.\"</p><p>Miss Noor laughs. The clock has its numbers again!</p>",
  bso:"<p>CLICK! The vault opens. All the numbers fly out, back to the clock and the doors.</p><p>Professor Zero goes red. \"OK, OK. Numbers are quite useful after all.\"</p><p>Mr Tik grins. The clock has its numbers again!</p>"
};
/* number keys per level: unique values, sorted in the finale. s = text, v = value */
var KEYS=[
  [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(function(n){return{s:String(n),v:n}}),
  [48,84,120,102,250,205,360,306,480,408,550,505,700,670,890,980,1000,1100].map(function(n){return{s:String(n),v:n}}),
  [{s:"0.5",v:.5},{s:"¼",v:.25},{s:"0.75",v:.75},{s:"⅔",v:.667},{s:"1.2",v:1.2},{s:"1.05",v:1.05},{s:"2.5",v:2.5},{s:"10%",v:.1},{s:"⅓",v:.333},{s:"1½",v:1.5},{s:"0.9",v:.9},{s:"3.14",v:3.14},{s:"⅕",v:.2},{s:"2",v:2},{s:"0.07",v:.07},{s:"5%",v:.05},{s:"4.5",v:4.5},{s:"1.75",v:1.75}]
];
var ch=function(q,a,hint,opts){return{kind:"choice",q:q,c:opts,a:a,hint:hint}};
var pics=function(q,a,hint,o1,o2){return{kind:"choice",q:q,c:[{e:o1[0],t:o1[1]},{e:o2[0],t:o2[1]}],a:a,hint:hint}};
var S=[
{id:"stappen",ico:"👣",dom:"measuring",title:"Measuring with steps",
 intro:"Long ago, people measured with their bodies: feet, thumbs, steps. A surveyor without a tape measure still does it this way. Choose a spot nearby (a post, a tree, a door) and walk to it with big steps. Count them.",
 act:{out:"Walk from here to the nearest post or tree with big steps. Count out loud. Then walk back and count again: is it the same?",in:"Walk along the corridor (or the classroom) from one wall to the other with big steps. Count out loud. Walk back and count again: is it the same?"},
 tip:["A big step for a child is about half a metre. So two steps make a metre.","A big step is about 50 cm. Surveyors measure with a laser now, but they still estimate with steps.","A step of 60 cm: 100 steps is 60 metres. That way you can estimate how far away something is anywhere, even without a tape measure."],
 lvl:[{kind:"count",pre:"How many steps was it?",fn:function(x){return{kind:"choice",q:x+" steps. Is that more or fewer than 10?",c:[{e:"🔼",t:"More than 10"},{e:"🔽",t:"Fewer than 10"}],a:x>10?0:1}},hint:"Count to 10 on your fingers. Did you take more steps?"},
      {kind:"count",pre:"How many big steps was it?",fn:function(x){return{q:x+" steps. A big step is about half a metre. About how many metres is that? (whole metres, round down)",a:[String(Math.floor(x/2))]}},hint:"Two steps make a metre. Divide the number of steps by 2."},
      {kind:"count",pre:"How many big steps was it?",fn:function(x){return{q:x+" steps of about 60 cm. How many metres is that? Type it with a decimal point, like 7.2.",a:[String(x*60/100),String(x*60/100).replace(".",",")]}},hint:"Steps × 60 = centimetres. Divide by 100 for metres."}]},
{id:"ramen",ico:"🪟",dom:"multiplying",title:"Counting windows",
 intro:"An architect counts windows to know how much glass is needed. Find the nearest building and count the windows on the front. Do it together, or you might count one twice.",
 act:{out:"Count the windows on the front of the nearest building. Everyone in the team counts, then compare.",in:"Count all the windows in this classroom or room. Everyone in the team counts, then compare."},
 tip:["Counting is easier in groups: first the windows in the first row, then the second.","Are the windows in rows? Then you don't have to count them all: rows × windows per row.","Times sums are counting in groups. 4 rows of 6 windows = 24, without pointing at all 24."],
 lvl:[{kind:"count",pre:"How many windows did you count?",fn:function(x){return{q:x+" windows. 1 more window is added. How many windows are there now?",a:[String(x+1)]}},hint:"One more than you counted."},
      {kind:"count",pre:"How many windows did you count?",fn:function(x){return{q:x+" windows. Each window has 2 curtains. How many curtains is that altogether?",a:[String(x*2)]}},hint:"The number of windows times 2."},
      {kind:"count",pre:"How many windows did you count?",fn:function(x){return{q:x+" windows. A pane of glass costs € 45 to replace. A storm breaks a quarter of the panes (round down). How much does that cost?",a:[String(Math.floor(x/4)*45)]}},hint:"First divide the number of windows by 4 (round down), then × 45."}]},
{id:"nummer",ico:"🔢",dom:"numbers",title:"The house number",
 intro:"House numbers follow a system: even on one side of the street, odd on the other. Find the nearest house number (or a number on a door).",
 act:{out:"Find a house number. Look at the house next door too: what number is there?",in:"Find a number on a door or a classroom. Look at the door next to it too."},
 tip:["Even numbers end in 0, 2, 4, 6 or 8. Odd numbers end in 1, 3, 5, 7 or 9.","Postmen work it out like this: on the same side, the numbers go up by 2 each time. Number 12 and number 16 are the neighbours of number 14.","Adding up the digits of a number gives its digit sum. Can it be divided by 3? Then the number itself can be divided by 3 too."],
 lvl:[{kind:"count",pre:"What number can you see? (just the number)",fn:function(x){return{kind:"choice",q:"Number "+x+". Is that even or odd?",c:[{e:"2️⃣",t:"Even"},{e:"1️⃣",t:"Odd"}],a:x%2===0?0:1}},hint:"Even numbers end in 0, 2, 4, 6 or 8."},
      {kind:"count",pre:"What number can you see? (just the number)",fn:function(x){return{q:"Number "+x+". What number is probably three houses further along on the same side?",a:[String(x+6)]}},hint:"On the same side, the numbers go up by 2 each time. So three houses further is +6."},
      {kind:"count",pre:"What number can you see? (just the number)",fn:function(x){var r=parseInt(String(x).split("").reverse().join(""),10);return{q:"Number "+x+". Turn the digits around (47 becomes 74). What is the turned-around number minus the real number? (it can be negative: then type a minus sign in front)",a:[String(r-x)]}},hint:"First turn it around, then subtract: turned-around minus real."}]},
{id:"palen",ico:"💡",dom:"patterns",title:"Lamp posts",
 intro:"Lamp posts stand at equal distances: that's a pattern. If you know the pattern, you don't have to count everything. Count how many posts you can see from here.",
 act:{out:"Count the lamp posts you can see from here, without walking. Look too: are they the same distance apart?",in:"Count the lights on the ceiling of this room. Are they in rows?"},
 tip:["Things in a row can be counted in jumps: 2, 4, 6, 8.","Between 5 posts there are only 4 gaps. Lots of people forget that.","The fence-post problem: between n posts there are n−1 gaps. Important for distances and for fences."],
 lvl:[{kind:"count",pre:"How many posts (or lights) can you see?",fn:function(x){return{q:x+" posts. Each post has 1 lamp. How many lamps is that?",a:[String(x)]}},hint:"Just as many lamps as posts."},
      {kind:"count",pre:"How many posts (or lights) can you see?",fn:function(x){return{q:x+" posts. Each post has 2 lamps. In the evening, 1 lamp is broken. How many lamps are on?",a:[String(Math.max(0,x*2-1))]}},hint:"First 2 × the number of posts, then take 1 away."},
      {kind:"count",pre:"How many posts (or lights) can you see?",fn:function(x){return{q:x+" posts with 30 metres between each one. How many metres is it from the first post to the last?",a:[String(Math.max(0,(x-1)*30))]}},hint:"Between the posts there are (number − 1) gaps. Times 30."}]},
{id:"klok",ico:"🕐",dom:"time",title:"The clock without numbers",
 intro:"Professor Zero has taken the numbers off the clock. But the hands are still there. Can you still tell the time? The short hand shows the hour, the long hand the minutes.",
 act:{out:"First act out a clock together: stand in a circle, and two children are the hands. Set it to 3 o'clock. Then the clock on the screen.",in:"First act out a clock together: stand in a circle, and two children are the hands. Set it to 3 o'clock. Then the clock on the screen."},
 tip:["The short hand is the hour hand. If it points to the 3, it's 3 o'clock.","The long hand on the 3 is quarter past, on the 6 half past, on the 9 quarter to.","Each little line is one minute, each number 5 minutes. The long hand on the 7: 7 × 5 = 35 minutes."],
 lvl:[{kind:"clock",hint:"Look at the short hand: which number is it pointing to?"},{kind:"clock",hint:"Short hand = hour. Long hand on 3 = quarter past, on 6 = half past, on 9 = quarter to."},{kind:"clock",hint:"Long hand: each number is 5 minutes. Count in jumps of 5."}]},
{id:"kassa",ico:"🧾",dom:"money",title:"The till without numbers",
 intro:"The canteen till is empty: no prices, no amounts. Pretend you are the canteen. Without numbers you can't pay, so you have to work it out in your heads.",
 act:{out:"Together, think of three things you could buy at a kiosk or shop round here. What would they cost? Then add them up.",in:"Together, think of three things from the school canteen. What would they cost? Then add them up."},
 tip:["For 2 euros and 3 euros together, you just add: 5 euros.","Getting change is taking away: you pay 5 euros, it costs 2.50, so you get 2.50 back.","Discount in percent: 25% is a quarter. On € 8 that's € 2 off. 'Buy three, pay for two' is 33% off."],
 lvl:[pics("An apple costs 1 euro. You buy 3. How many euros do you pay?",1,"1 + 1 + 1.",["2️⃣","2 euros"],["3️⃣","3 euros"]),
      {kind:"text",q:"A sandwich costs € 2.50 and a carton of juice € 1.25. You pay with € 5. How much change do you get? Type it like 1.25.",a:["1.25","1,25","125"],hint:"First add: 2.50 + 1.25. Then: 5 minus that amount."},
      {kind:"text",q:"A packet of biscuits costs € 1.80. This week: 'buy three, pay for two'. How much do three packets cost? Type it like 3.60.",a:["3.60","3,60","3.6","3,6","360"],hint:"You pay for two: 2 × 1.80."}]},
{id:"tegels",ico:"🟫",dom:"area",title:"Paving slabs",
 intro:"A paver counts slabs to know how many are needed. A pavement is a grid: rows and columns. Find a piece of pavement (or a tiled floor).",
 act:{out:"Count how many slabs lie side by side (the width of the pavement). Also count how many slabs there are lengthways, up to the next post or tree.",in:"Find a tiled floor (hall, toilets, kitchen). Count the tiles across the width and along the length."},
 tip:["A paving slab is usually a square: four equal sides, four corners.","Slabs in a grid: rows × columns. That's how you work out area without counting everything.","A paving slab is 30 × 30 cm = 900 cm². Just over 11 slabs make 1 m² together."],
 lvl:[{kind:"count",pre:"How many slabs lie side by side?",fn:function(x){return{q:x+" slabs side by side. How many corners does one slab have? Type the number.",a:["4"]}},hint:"A square has as many corners as sides."},
      {kind:"count",pre:"How many slabs lie side by side (the width)?",fn:function(x){return{q:x+" slabs wide. Lengthways there are 12 rows. How many slabs is that altogether?",a:[String(x*12)]}},hint:"Width × length: "+"number × 12."},
      {kind:"count",pre:"How many slabs lie side by side (the width)?",fn:function(x){return{q:x+" slabs wide, each slab 30 cm. How wide is the pavement in metres? Type it with a decimal point, like 1.8.",a:[String(x*30/100),String(x*30/100).replace(".",",")]}},hint:"Slabs × 30 = centimetres. Divide by 100."}]},
{id:"verkeer",ico:"🚗",dom:"statistics",title:"Counting traffic",
 intro:"The council counts traffic to find out whether a street is safe. Now you are going to do it too. One team member keeps time, the rest count: everything that goes past on wheels (cars, bikes, scooters).",
 act:{out:"For one minute, count everything on wheels that goes past. Use the timer at the top of the screen. Everyone counts, then compare.",in:"For one minute, count how many people walk past this spot. Use the timer at the top of the screen."},
 tip:["Tally marks help you count: one line per car, and the fifth line goes across the other four.","Per minute × 60 = per hour. That's how the council estimates how busy a street is.","One minute is a small sample. The longer you count, the more reliable the estimate."],
 lvl:[{kind:"count",pre:"How many did you count in one minute?",fn:function(x){return{kind:"choice",q:x+" in one minute. Was that a lot or not many?",c:[{e:"🚗🚗🚗",t:"More than 5"},{e:"🚗",t:"5 or fewer"}],a:x>5?0:1}},hint:"Count on your fingers: more than one hand?"},
      {kind:"count",pre:"How many did you count in one minute?",fn:function(x){return{q:x+" in one minute. How many is that in 10 minutes, if it stays the same?",a:[String(x*10)]}},hint:"Times 10: put a 0 on the end."},
      {kind:"count",pre:"How many did you count in one minute?",fn:function(x){return{q:x+" in one minute. How many is that per hour, if it stays the same?",a:[String(x*60)]}},hint:"An hour is 60 minutes. Times 60."}]},
{id:"koekjes",ico:"🍪",dom:"dividing",title:"Fair shares",
 intro:"Miss Noor has baked biscuits for all the teams. But without numbers she doesn't know how to share them out. How many of you are there?",
 act:{out:"Stand in a circle and count off: 1, 2, 3… How many team members are there?",in:"Stand in a circle and count off: 1, 2, 3… How many team members are there?"},
 tip:["Dividing is sharing fairly: everyone gets the same.","Is there anything left over? That's called the remainder. 13 biscuits for 4 children: 3 each, and 1 left over.","A fraction is a division sum: ¾ of 24 is 24 ÷ 4 × 3 = 18."],
 lvl:[{kind:"count",pre:"How many of you are there?",fn:function(x){return{q:"There are "+x+" of you. Everyone gets 2 biscuits. How many biscuits is that altogether?",a:[String(x*2)]}},hint:"Count two biscuits for each child: 2, 4, 6…"},
      {kind:"count",pre:"How many of you are there?",fn:function(x){return{q:"There are "+x+" of you. There are 24 biscuits. How many does each person get, and how many are left over? Type: the number per child, then a space, then the remainder (e.g. 4 2).",a:[Math.floor(24/x)+" "+(24%x),Math.floor(24/x)+","+(24%x)]}},hint:"How many times does "+"your number go into 24? What is left over?"},
      {kind:"count",pre:"How many of you are there?",fn:function(x){return{q:"There are "+x+" of you. There are 60 biscuits for 5 teams. Your team gets a fair share. How many biscuits does each team member get? (round down)",a:[String(Math.floor(12/x))]}},hint:"First 60 ÷ 5 = 12 biscuits for your team. Then 12 ÷ your number."}]},
{id:"hoogte",ico:"🌳",dom:"estimating",title:"How tall is that?",
 intro:"Nobody can measure a tree or a building with a tape measure. Even so, surveyors know how tall it is: by comparing cleverly. Find the tallest thing you can see.",
 act:{out:"Look at the tallest building or the tallest tree. How many children your height would have to stand on top of each other to be just as tall? Estimate it together.",in:"Look at the height of this room. How many children your height would have to stand on top of each other to reach the ceiling? Estimate it together."},
 tip:["Estimating is clever guessing: you compare with something you know, like your own height.","One floor is about 3 metres. Count the floors and you know roughly how tall it is.","With shadows: if your shadow is 2× as long as you are, the tree's shadow is also 2× the tree. That's how you measure height without climbing."],
 lvl:[{kind:"count",pre:"How many children on top of each other?",fn:function(x){return{kind:"choice",q:x+" children on top of each other. Is that taller than a house?",c:[{e:"🏠",t:"Yes, taller"},{e:"🧍",t:"No, shorter"}],a:x>=5?0:1}},hint:"A house is about as tall as 5 children on top of each other."},
      {kind:"count",pre:"How many children on top of each other?",fn:function(x){return{q:x+" children of about 1 metre 30. About how many centimetres is that altogether?",a:[String(x*130)]}},hint:"1 metre 30 is 130 cm. Times the number of children."},
      {kind:"count",pre:"How many children on top of each other?",fn:function(x){return{q:x+" children of 1.3 m. One floor is 3 m. About how many floors is that? (round to a whole number)",a:[String(Math.round(x*1.3/3))]}},hint:"First × 1.3 for the metres, then divide by 3, then round."}]},
{id:"vormen",ico:"🔺",dom:"geometry",title:"Shape hunt",
 intro:"An architect sees shapes everywhere: square tiles, round drain covers, triangular roofs. Look around you for shapes.",
 act:{out:"Find something round, something square and something triangular. Point to all three. Which shape do you see the most?",in:"Find something round, something square and something triangular in this room. Which shape do you see the most?"},
 tip:["A circle has no corners. A triangle has 3, a square has 4.","A stop sign is an octagon: 8 corners. A warning road sign is a triangle.","Drain covers are round because a round cover can never fall through the hole. A square one can, if you tip it."],
 lvl:[pics("How many corners does a triangle have?",0,"Tri-angle. Tri means three.",["🔺","3 corners"],["🟦","4 corners"]),
      ch("A stop sign has 8 corners. What is that shape called?",1,"Eight corners: an octagon, like an octopus with eight arms.",["Hexagon","Octagon","Rectangle"]),
      ch("Why are drain covers round?",0,"Think of a square cover: it fits through the hole if you tip it.",["A round cover can never fall through the hole","Round is cheaper","Because cars are round"])]},
{id:"getallenjacht",ico:"🔍",dom:"numbers",title:"Number hunt",
 intro:"Professor Zero has taken away the school's numbers, but outside they are still there: on signs, cars, doors and adverts. Find the biggest number you can see.",
 act:{out:"Find the biggest number you can see from here: a house number, a number plate, a sign, a price. Type it in.",in:"Find the biggest number you can see in this room: on a poster, a book, a door, a clock. Type it in."},
 tip:["A number with more digits is almost always bigger: 12 is bigger than 9.","Rounding to the nearest ten: look at the last digit. 5 or more: round up.","Read big numbers in groups of three: 1,250 is 'one thousand two hundred and fifty'."],
 lvl:[{kind:"count",pre:"What number did you find?",fn:function(x){return{kind:"choice",q:"You found "+x+". Is that more than 20?",c:[{e:"🔼",t:"Yes, more"},{e:"🔽",t:"No, less"}],a:x>20?0:1}},hint:"Count to 20. Does your number come after that?"},
      {kind:"count",pre:"What number did you find?",fn:function(x){return{q:"You found "+x+". Round it to the nearest ten.",a:[String(Math.round(x/10)*10)]}},hint:"Look at the last digit: 5 or more rounds up, otherwise round down."},
      {kind:"count",pre:"What number did you find?",fn:function(x){return{q:"You found "+x+". What is half of it? Use a decimal point if you need one (e.g. 12.5).",a:[String(x/2),String(x/2).replace(".",",")]}},hint:"Divide by 2. Odd number? Then it ends in .5."}]},
{id:"schaal",ico:"🗺️",dom:"ratio",title:"Map and scale",
 intro:"On a map, everything is smaller. How much smaller is shown by the scale. A surveyor converts the map to the real world. Have a look around you: which direction is the school?",
 act:{out:"Everyone point at the school at the same time. Are you all pointing the same way? Then check on the map (the Map button) or on the story map: were you right?",in:"Everyone point at the school entrance at the same time. Are you all pointing the same way?"},
 tip:["A map is the world seen from above, drawn very small.","Scale 1 cm = 100 m means: 1 cm on the map is 100 metres in real life.","Scale 1:1000 means: everything is 1000 times smaller. 5 cm on the map = 5000 cm = 50 m."],
 lvl:[pics("The school is drawn on a map. Is the real school bigger or smaller than on the map?",0,"On a map, everything is very small.",["🏫","Bigger"],["🗺️","Smaller"]),
      {kind:"text",q:"On the map, 1 cm is 100 metres in real life. The playground is 4 cm from the school. How many metres is that in real life?",a:["400"],hint:"4 × 100."},
      {kind:"text",q:"Scale 1:1000. On the map, the street is 12 cm long. How many metres is that in real life?",a:["120"],hint:"12 cm × 1000 = 12,000 cm. Divide by 100 for metres."}]},
{id:"verdiepingen",ico:"🏢",dom:"measuring",title:"Floors",
 intro:"You can work out how tall a building is from its floors. Find the building with the most floors that you can see and count them: each row of windows is a floor.",
 act:{out:"Count the floors of the tallest building you can see. Count the ground floor too.",in:"How many floors does the school have? Count the ground floor too. How many steps does the staircase going up have? Count them together."},
 tip:["The ground floor is a floor too: count it.","A floor is about 3 metres high. So 4 floors is about 12 metres.","A staircase of 15 steps of 18 cm: 15 × 18 = 270 cm = 2.7 m per floor."],
 lvl:[{kind:"count",pre:"How many floors?",fn:function(x){return{q:x+" floors. On each floor lives 1 family. How many families live there?",a:[String(x)]}},hint:"Just as many families as floors."},
      {kind:"count",pre:"How many floors?",fn:function(x){return{q:x+" floors of about 3 metres. About how tall is the building, in metres?",a:[String(x*3)]}},hint:"Floors × 3."},
      {kind:"count",pre:"How many floors?",fn:function(x){return{q:x+" floors. A staircase of 16 steps of 17 cm goes up to each floor. How tall is the building in metres? Type it with a decimal point (e.g. 8.16).",a:[String(Math.round((x-1)*16*17)/100),String(Math.round((x-1)*16*17)/100).replace(".",","),String(x*16*17/100),String(x*16*17/100).replace(".",",")]}},hint:"One staircase = 16 × 17 = 272 cm = 2.72 m. Between the floors there are (number − 1) staircases."}]}
];
var ORDER_KORT=["stappen","ramen","klok","kassa","koekjes","vormen"];
return{lang:"en",T:T,TYPES:TYPES,TIK:TIK,NOOR:NOOR,NUL:NUL,ROOMS:ROOMS,OPEN:OPEN,OPEN0:OPEN0,CLIFF:CLIFF,CLIFFLAST:CLIFFLAST,REVEAL:REVEAL,REVEAL0:REVEAL0,S:S,KORT:ORDER_KORT,KEYS:KEYS,FREE:true,
  LEADNOTE:"Tip: do the short introduction lesson beforehand (see below). Agree on the play area (outside: everything within about 300 metres) and a finishing time. Teams that get stuck may use the hint (one per station). At the measuring stations, the team first types what they counted themselves; the follow-up question then works with that number. That is why this sheet shows the method for each sum, not one fixed answer.",
  LES:[
   {intro:["Show the clock without numbers (cover the numbers up) and ask: what time is it now? What can't you do without numbers? (what time, how many, how far, how much)","Practise measuring with steps once together in the classroom: how many steps wide is the classroom? Agree: big steps, count out loud.","Teams of 4–6 with an adult, one phone per team, enter the case code. Turn reading aloud on: the children don't need to read by themselves."],
    na:["Which station was the most fun? What did you count there?","Put the teams' measurements side by side on the board: how many steps, how many windows. Are they different? Why is that (big and small steps)?","Maths without numbers: what would go wrong in a day without numbers? Let each child name one thing.","Homework: count the stairs at home, or the windows on the front of your house."],
    doelen:"Ages 6–8 (Dutch groep 3–4, SLO maths): counting and numbers up to 20 and 100, more/fewer, odd and even, measuring with natural units (steps), whole hours on the clock, money up to 10 euros, recognising shapes."},
   {intro:["Ask: where do you use maths outside school? Collect five examples (paying, time, distance, cooking, building).","Practise measuring with steps: how many steps is the classroom, and about how many metres is that (step ≈ 50 cm)? That way they know what they will be doing.","Teams of 4–6, one phone per team, enter the case code. Agree: measure first, then calculate, check together."],
    na:["Put all the teams' measurements in a table on the board: steps, windows, traffic per minute. Who had the most? What is the mean (ages 9–10)?","Traffic: how many cars per hour is that? Is our street busy? What would the council do with that information?","Which sum was the hardest? Let a team explain it.","Going further: measure one thing in the school properly with a tape measure and compare it with the step estimate."],
    doelen:"Ages 8–10 (Dutch groep 5–6, SLO maths): numbers up to 1000/10,000, times tables and division with remainders, measuring in cm and m, quarter hours and minutes on the clock, money with decimals, simple fractions, patterns, rounding, tables."},
   {intro:["Ask: how does a surveyor know how tall a building is without climbing it? Let them guess, but don't give the answer yet (that comes at the station 'How tall is that?').","Briefly revise: scale, percentages, decimals. They will come up in the neighbourhood.","Teams of 4–6, one phone per team, enter the case code. Agree: estimate first, then measure, and compare."],
    na:["Put all the teams' measurements in a table: steps, metres, traffic per hour. Work out the mean and discuss the spread: why are they different?","Traffic per hour × 12 school hours: how many vehicles per day? Is that a lot? Find out what the council calls a busy street.","The shadow method: go outside on a sunny day and measure the height of a tree using your own shadow. Compare it with the estimate in floors.","Going further: make a map of the playground at a scale of 1:100 using the step measurements."],
    doelen:"Ages 10–12 (Dutch groep 7–8, SLO maths): large numbers, decimals, percentages and fractions, ratio and scale, area, mean, rounding, measuring and estimating with reference measures, maths in context."}
  ]}
})();
