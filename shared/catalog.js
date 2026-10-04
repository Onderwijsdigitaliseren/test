/* Catalogus van wandelspellen. Eén bron voor beide hubs (EN + NL) en voor het "meer wandelingen"-menu in de spellen.
   Nieuw spel toevoegen = één object in games[] + de twee HTML-bestanden + twee regels in sitemap.xml.
   status: "live" | "new" | "soon"   ·   access: "free" (helemaal gratis) | "trial" (eerste zaak gratis, daarna Pro) | "pro" */
window.MW_CATALOG={
  cats:[
    {id:"murder", icon:"🔎", nl:{n:"Moordzaak",   t:"Wie heeft het gedaan? Bewijs is altijd waar; van de getuigen liegt er één."},
                            en:{n:"Murder case",  t:"Who did it? Evidence never lies; one of the witnesses does."}},
    {id:"missing",icon:"👤", nl:{n:"Vermissing",  t:"Iemand is weg. Alles wat je vindt is waar, maar niemand weet het hele verhaal."},
                            en:{n:"Missing person",t:"Someone is gone. Everything you find is true, but nobody knows the whole story."}},
    {id:"night",  icon:"🌑", nl:{n:"Nachtzaak",   t:"Jij bent geen speurder maar doelwit. Thriller: blijf lopen en kijk om je heen."},
                            en:{n:"Night case",   t:"You are not the detective but the target. A thriller: keep walking and look around you."}},
    {id:"cold",   icon:"📁", nl:{n:"Cold case",   t:"Een oud dossier, nieuwe ogen. De plekken zijn er nog; de getuigen ook, ouder."},
                            en:{n:"Cold case",    t:"An old file, fresh eyes. The places are still there; so are the witnesses, older now."}}
  ],
  games:[
    {id:"mw", cat:"murder", status:"live", access:"trial", minutes:"45–90", km:"2–4", group:true,
      en:{slug:"murder-walk.html", title:"Murder Walk", tag:"A murder mystery you walk, in your own streets.",
          desc:"Eight leads at real places around you, five witnesses, one liar. Four story series, rare shades to catch, group mode for up to ten phones."},
      nl:{slug:"nl/moordwandeling.html", title:"Moordwandeling", tag:"Een moordzaak die je loopt, in je eigen straten.",
          desc:"Acht sporen op echte plekken om je heen, vijf getuigen, één leugenaar. Vier verhaalseries, zeldzame schimmen, groepszaak voor maximaal tien telefoons."}},
    {id:"vz", cat:"missing", status:"new", access:"trial", minutes:"40–75", km:"2–3", group:false,
      en:{slug:"the-vanishing.html", title:"The Vanishing", tag:"Someone is gone. Their last eight traces lie in your streets.",
          desc:"You hold the last message. Follow the route: camera stills, texts, statements, objects. Was it abduction, flight or a disappearance by choice, and who knows more?"},
      nl:{slug:"nl/de-verdwijning.html", title:"De Verdwijning", tag:"Iemand is verdwenen. De laatste acht sporen liggen in jouw buurt.",
          desc:"Jij hebt het laatste bericht. Volg de route: camerabeelden, berichten, verklaringen, voorwerpen. Ontvoerd, gevlucht of vrijwillig verdwenen, en wie weet er meer?"}},
    {id:"td", cat:"murder", status:"new", access:"trial", minutes:"40–75", km:"2–3", group:false,
      en:{slug:"till-death-do-us-part.html", title:"Till Death Do Us Part", tag:"She was to be married today. Only the bride never arrived.",
          desc:"A wedding mystery of love, jealousy and family secrets. Six guests, eight traces of her last evening, and a figure in a long dress at the end of your street. Who met her, and why?"},
      nl:{slug:"nl/tot-de-dood-ons-scheidt.html", title:"Tot de Dood Ons Scheidt", tag:"Ze zou vandaag trouwen. Alleen de bruid kwam nooit aan.",
          desc:"Een bruiloftsmysterie over liefde, jaloezie en familiegeheimen. Zes gasten, acht sporen van haar laatste avond, en een gestalte in een lange jurk aan het einde van je straat. Wie ontmoette haar, en waarom?"}},
    {id:"cc", cat:"cold", status:"soon", access:"trial", minutes:"60", km:"3",
      en:{slug:"", title:"Cold Case", tag:"Coming later this season.", desc:"A dossier from decades ago. The places have changed; the truth has not."},
      nl:{slug:"", title:"Cold Case", tag:"Komt later dit seizoen.", desc:"Een dossier van tientallen jaren terug. De plekken zijn veranderd; de waarheid niet."}},
    {id:"og", cat:"night", status:"new", access:"trial", minutes:"40–75", km:"2–3", group:false,
      en:{slug:"eyewitness.html", title:"Eyewitness", tag:"You saw something you were never meant to see.",
          desc:"Not a whodunit: a thriller. At eight points a message from ‘Unknown’ is waiting, and someone is walking behind you. Who is following you, and who can you trust?"},
      nl:{slug:"nl/ooggetuige.html", title:"Ooggetuige", tag:"Jij hebt iets gezien wat je niet had mogen zien.",
          desc:"Geen detective maar een thriller. Op acht punten wacht een bericht van ‘Onbekend’, en iemand loopt achter je. Wie volgt je, en wie kun je vertrouwen?"}}
  ]
};
