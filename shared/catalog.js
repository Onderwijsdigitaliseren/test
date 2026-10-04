/* Catalogus van wandelspellen. Eén bron voor beide hubs (EN + NL) en voor het "meer wandelingen"-menu in de spellen.
   Nieuw spel toevoegen = één object in games[] + de twee HTML-bestanden + twee regels in sitemap.xml.
   status: "live" | "new" | "soon"   ·   access: "free" (helemaal gratis) | "trial" (eerste zaak gratis, daarna Pro) | "pro" */
window.MW_CATALOG={
  cats:[
    {id:"murder", icon:"🔎", nl:{n:"Moordzaak",   t:"Wie heeft het gedaan? Bewijs is altijd waar; van de getuigen liegt er één."},
                            en:{n:"Murder case",  t:"Who did it? Evidence never lies; one of the witnesses does."}},
    {id:"missing",icon:"👤", nl:{n:"Vermissing",  t:"Iemand is weg. Alles wat je vindt is waar, maar niemand weet het hele verhaal."},
                            en:{n:"Missing person",t:"Someone is gone. Everything you find is true, but nobody knows the whole story."}},
    {id:"cold",   icon:"📁", nl:{n:"Cold case",   t:"Een oud dossier, nieuwe ogen. De plekken zijn er nog; de getuigen ook, ouder."},
                            en:{n:"Cold case",    t:"An old file, fresh eyes. The places are still there; so are the witnesses, older now."}},
    {id:"night",  icon:"🌑", nl:{n:"Nachtzaak",   t:"Geen misdaad, wel iets dat niet klopt. Thriller met een paranormaal randje."},
                            en:{n:"Night case",   t:"No crime, but something is wrong. A thriller with a paranormal edge."}}
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
    {id:"cc", cat:"cold", status:"soon", access:"trial", minutes:"60", km:"3",
      en:{slug:"", title:"Cold Case", tag:"Coming later this season.", desc:"A dossier from decades ago. The places have changed; the truth has not."},
      nl:{slug:"", title:"Cold Case", tag:"Komt later dit seizoen.", desc:"Een dossier van tientallen jaren terug. De plekken zijn veranderd; de waarheid niet."}},
    {id:"nw", cat:"night", status:"soon", access:"trial", minutes:"45", km:"2",
      en:{slug:"", title:"Night Case", tag:"Coming later this season.", desc:"Lights that should be off. Footsteps with no feet. A night you walk alone."},
      nl:{slug:"", title:"Nachtzaak", tag:"Komt later dit seizoen.", desc:"Lampen die uit hadden moeten zijn. Voetstappen zonder voeten. Een nacht die je alleen loopt."}}
  ]
};
