/* Enigma Mystery — taal onthouden, filters, Pro-pas, notitie */
(function () {
  "use strict";
  function bewaar(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} }
  function lees(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  var PRO_KEY = "gf_pro_code";
  /* code meegenomen van de oude sites (graveyardfiles.com / nachtdossier.nl) */
  try {
    var u = new URL(location.href), mee = u.searchParams.get("code");
    if (mee) { bewaar(PRO_KEY, String(mee).toUpperCase().replace(/[^A-Z0-9]/g, "")); u.searchParams.delete("code"); history.replaceState(null, "", u.pathname + u.search + u.hash); }
  } catch (e) {}

  /* taal: de pagina die je bekijkt is je keuze */
  var taal = document.body.getAttribute("data-lang");
  if (taal) bewaar("mm_lang", taal);
  document.querySelectorAll("[data-kies-taal]").forEach(function (a) {
    a.addEventListener("click", function () { bewaar("mm_lang", a.getAttribute("data-kies-taal")); });
  });

  /* geluid standaard uit, ook in de 3D-kamers die een gedeelde instelling gebruiken */
  if (!lees("lr_snd")) bewaar("lr_snd", "0");

  /* typemachine-regel in de held */
  var typ = document.querySelector(".typ");
  if (typ && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var tekst = typ.getAttribute("data-tekst") || typ.textContent, i = 0;
    typ.textContent = "";
    var tik = function () { typ.textContent = tekst.slice(0, ++i); if (i < tekst.length) setTimeout(tik, 28 + Math.random() * 50); else typ.classList.remove("typ"); };
    setTimeout(tik, 500);
  } else if (typ) { typ.classList.remove("typ"); }

  /* de dossierkast: laden opentrekken */
  var laden = document.querySelectorAll(".la .lafront");
  if (laden.length) {
    var zet = function (la, open) {
      la.classList.toggle("open", open);
      var b = la.querySelector(".lafront"), inh = la.querySelector(".lainhoud");
      b.setAttribute("aria-expanded", String(open)); inh.hidden = !open;
    };
    laden.forEach(function (b) {
      b.addEventListener("click", function () {
        var la = b.closest(".la"); if (la.classList.contains("dicht")) return;
        zet(la, !la.classList.contains("open"));
      });
    });
    var doel = location.hash && document.querySelector(location.hash + ".la");
    if (doel && !doel.classList.contains("dicht")) { zet(doel, true); doel.scrollIntoView({ block: "start" }); }
    else if (lees(PRO_KEY)) { var la2 = document.getElementById("archief-2"); if (la2) zet(la2, true); }
  }

  /* filters op de spellenpagina */
  var knoppen = document.querySelectorAll(".filters button");
  if (knoppen.length) {
    var kies = function (f) {
      knoppen.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === f)); });
      document.querySelectorAll("#archief-1 .plank").forEach(function (plank) {
        var zicht = 0;
        plank.querySelectorAll(".dossier").forEach(function (d) {
          var st = d.getAttribute("data-status");
          var aan = f === "alles" || (f === "pro" ? st !== "gratis" : st !== "pro");
          d.hidden = !aan; if (aan) zicht++;
        });
        plank.hidden = zicht === 0;
      });
    };
    knoppen.forEach(function (b) { b.addEventListener("click", function () { kies(b.getAttribute("data-filter")); }); });
  }

  /* Pro: stempels weg als de pas actief is */
  function norm(c) { return String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  if (lees(PRO_KEY)) document.documentElement.classList.add("pro-actief");

  var form = document.getElementById("proForm");
  if (form && window.MM_PRO) {
    var T = window.MM_PRO.t, meld = document.getElementById("proMelding"), stand = document.getElementById("proStand");
    if (lees(PRO_KEY)) { stand.textContent = T.actief; document.getElementById("proCode").value = lees(PRO_KEY); }
    var b64 = function (s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
    var check = async function (code) {
      var r = await fetch(window.MM_PRO.probe, { cache: "no-store" });
      var m = (await r.text()).match(/<script type="application\/json" id="gfpro">([\s\S]*?)<\/script>/);
      if (!m) throw new Error("geen zegel");
      var P = JSON.parse(m[1]), S = crypto.subtle;
      var basis = await S.importKey("raw", new TextEncoder().encode(norm(code)), "PBKDF2", false, ["deriveKey"]);
      var kek = await S.deriveKey({ name: "PBKDF2", salt: b64(P.salt), iterations: P.it, hash: "SHA-256" }, basis, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      for (var i = 0; i < P.keys.length; i++) {
        var w = b64(P.keys[i]);
        try { await S.decrypt({ name: "AES-GCM", iv: w.subarray(0, 12) }, kek, w.subarray(12)); return true; } catch (e) {}
      }
      return false;
    };
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var code = norm(document.getElementById("proCode").value);
      if (code.length < 6) { meld.textContent = T.kort; meld.className = "melding fout"; return; }
      meld.textContent = T.bezig; meld.className = "melding";
      try {
        if (await check(code)) { bewaar(PRO_KEY, code); meld.textContent = T.ok; meld.className = "melding ok"; stand.textContent = T.actief; }
        else { meld.textContent = T.fout; meld.className = "melding fout"; }
      } catch (err) { bewaar(PRO_KEY, code); meld.textContent = T.offline; meld.className = "melding"; }
    });
  }

  /* notitie via FormSubmit */
  var nf = document.getElementById("notitieForm");
  if (nf && window.MM_NOTITIE) {
    var N = window.MM_NOTITIE, nm = document.getElementById("notitieMelding"), knop = nf.querySelector("button");
    nf.addEventListener("submit", async function (e) {
      e.preventDefault();
      var fd = new FormData(nf), bericht = String(fd.get("message") || "").trim();
      if (!bericht) { nm.textContent = N.t.leeg; nm.className = "melding fout"; return; }
      if (fd.get("_honey")) { nm.textContent = N.t.ok; nm.className = "melding ok"; return; }
      fd.set("_subject", "Notitie via enigmamystery.com");
      fd.set("_template", "table"); fd.set("_captcha", "false"); fd.set("page", location.href);
      knop.disabled = true; nm.textContent = N.t.bezig; nm.className = "melding";
      try {
        var r = await fetch("https://formsubmit.co/ajax/" + N.adres, { method: "POST", headers: { Accept: "application/json" }, body: fd });
        var d = await r.json().catch(function () { return {}; });
        if (r.ok && (d.success === "true" || d.success === true)) { nm.textContent = N.t.ok; nm.className = "melding ok"; nf.reset(); }
        else throw new Error(d.message || r.status);
      } catch (err) {
        var body = encodeURIComponent(bericht + "\n\n— " + (fd.get("name") || "") + (fd.get("email") ? " (" + fd.get("email") + ")" : ""));
        nm.innerHTML = N.t.fout + ' <a href="mailto:' + N.adres + "?subject=Enigma%20Mystery&body=" + body + '">' + N.t.mail + "</a>.";
        nm.className = "melding fout";
      } finally { knop.disabled = false; }
    });
  }
})();
