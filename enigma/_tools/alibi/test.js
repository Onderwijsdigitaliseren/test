const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const url = 'file://' + path.resolve('out/alibi-rooster.html') + '#nl';
  await page.goto(url);
  await page.screenshot({ path: 'out/s1_start.png' });
  const data = await page.evaluate(() => DATA);
  // Dossier I via de UI
  await page.click('.dossier[data-i="0"]');
  await page.screenshot({ path: 'out/s2_dossier.png', fullPage: false });
  const d = data[0];
  for (let pi = 0; pi < d.personen.length; pi++) for (let ti = 0; ti < (pi === 0 ? d.M + 1 : d.T); ti++) {
    await page.click(`td.cel[data-k="${pi}_${ti}"]`);
    await page.click(`#sheet .chip[data-r="${d.sol[pi][ti]}"]`);
  }
  await page.click('.verklaring[data-i="0"]');
  await page.click('#bCheck');
  const ber = await page.textContent('#bericht');
  if (!/kloppen\./.test(ber)) throw new Error('controle: ' + ber);
  await page.screenshot({ path: 'out/s3_rooster.png' });
  // verkeerde beschuldiging
  await page.click('#bAcc');
  const fout = d.killer === 1 ? 2 : 1;
  await page.click(`.verdachte[data-p="${fout}"]`);
  const b2 = await page.textContent('#bericht');
  if (!/alibi/.test(b2)) throw new Error('fout: ' + b2);
  await page.click('#bAcc');
  await page.click(`.verdachte[data-p="${d.killer}"]`);
  const b3 = await page.textContent('#bericht');
  if (!/klopt/.test(b3)) throw new Error('goed: ' + b3);
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('em_alibi_v1')));
  console.log('dossier I sterren', st[d.id].sterren, '(verwacht 2: controle gebruikt, tweede poging... → 1)');
  await page.screenshot({ path: 'out/s4_einde.png', fullPage: false });
  // volgende dossiers: ontgrendeling + beschuldiging direct, in EN
  for (let i = 1; i < data.length; i++) {
    await page.click('#bVolg');
    await page.waitForSelector('#bAcc');
    const di = data[i];
    // EN wisselen en terug
    await page.click('#kTaal'); const titelEn = await page.textContent('#kTitel'); await page.click('#kTaal');
    const n = await page.$$eval('.verklaring', els => els.length);
    if (n !== di.clues.length) throw new Error('clues ' + n);
    const txt = await page.$$eval('.verklaring .q', els => els.map(e => e.textContent).join('\n'));
    if (/\[|undefined|NaN/.test(txt)) throw new Error('tekstfout ' + txt);
    if (i === 2) await page.screenshot({ path: 'out/s5_dossier3.png', fullPage: true });
    await page.click('#bAcc');
    await page.click(`.verdachte[data-p="${di.killer}"]`);
    const b = await page.textContent('#bericht');
    if (!/klopt/.test(b)) throw new Error('dossier ' + i + ': ' + b);
    console.log('dossier', i + 1, 'ok,', titelEn);
  }
  await page.click('#bTerug2');
  await page.screenshot({ path: 'out/s6_klaar.png', fullPage: true });
  const st2 = await page.evaluate(() => JSON.parse(localStorage.getItem('em_alibi_v1')));
  console.log(Object.values(st2).map(x => x.sterren).join(','));
  // herladen: voortgang blijft
  await page.reload();
  const sterren = await page.$$eval('.dossier .st', els => els.map(e => e.textContent));
  console.log('na herladen', sterren.join(' | '));
  if (errors.length) { console.log('ERRORS', errors); process.exit(1); }
  await browser.close();
  console.log('alles ok');
})().catch(e => { console.error(e); process.exit(1); });
