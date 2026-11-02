// Generatore carosello Instagram "Risultati del weekend" per Mugello Info.
// Uso: node genera.js [file-dati.json] [cartella-output]
// Produce PNG 1080x1350 (formato verticale 4:5 di Instagram) + didascalia.txt

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const dataFile = process.argv[2] || path.join(__dirname, 'risultati.json');
const outDir = process.argv[3] || path.join(__dirname, 'output');
const MAX_PARTITE_PER_SLIDE = 7;

const d = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const c = d.colori;

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

const css = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1350px; background: ${c.sfondo}; color: ${c.testo};
         font-family: 'Inter', 'DejaVu Sans', sans-serif; overflow: hidden; }
  .slide { width: 1080px; height: 1350px; padding: 90px 80px; display: flex; flex-direction: column; position: relative; }
  .top { display: flex; justify-content: space-between; align-items: center; font-size: 30px; font-weight: 700;
         letter-spacing: 2px; text-transform: uppercase; opacity: .9; }
  .top .brand { color: ${c.accento}; }
  .bar { width: 120px; height: 10px; background: ${c.accento}; margin: 50px 0 30px; }
  h1 { font-size: 132px; line-height: .95; font-weight: 900; text-transform: uppercase; letter-spacing: -3px; }
  h2 { font-size: 92px; line-height: 1; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; }
  .sub { font-size: 40px; font-weight: 600; margin-top: 30px; color: ${c.accento}; }
  .girone { font-size: 34px; font-weight: 600; margin-top: 14px; opacity: .75; text-transform: uppercase; letter-spacing: 1px; }
  .lista { margin-top: 50px; display: flex; flex-direction: column; gap: 18px; flex: 1; }
  .match { display: grid; grid-template-columns: 1fr 190px 1fr; align-items: center; background: ${c.riga};
           border-radius: 18px; padding: 26px 30px; min-height: 108px; }
  .team { font-size: 32px; font-weight: 700; text-transform: uppercase; line-height: 1.1; }
  .team.home { text-align: right; padding-right: 24px; }
  .team.away { text-align: left; padding-left: 24px; }
  .score { background: ${c.accento}; color: ${c.sfondo}; font-size: 52px; font-weight: 900; text-align: center;
           border-radius: 12px; padding: 8px 0; font-variant-numeric: tabular-nums; }
  .note { grid-column: 1 / -1; text-align: center; font-size: 24px; opacity: .7; margin-top: 10px; }
  .foot { display: flex; justify-content: space-between; font-size: 28px; opacity: .8; margin-top: 30px; }
  .cover { justify-content: center; }
  .cover .foot { position: absolute; bottom: 90px; left: 80px; right: 80px; }
  .swipe { font-size: 34px; font-weight: 700; color: ${c.accento}; margin-top: 70px; }
  .end p { font-size: 46px; line-height: 1.3; margin-top: 40px; max-width: 880px; }
  .end .tags { font-size: 32px; color: ${c.accento}; margin-top: 60px; line-height: 1.5; }
`;

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;

const foot = (n, tot) => `<div class="foot"><span>${esc(d.handle)}</span><span>${n}/${tot}</span></div>`;

// Divide le categorie lunghe su più slide
const slideCategorie = [];
for (const cat of d.categorie) {
  const blocchi = [];
  for (let i = 0; i < cat.partite.length; i += MAX_PARTITE_PER_SLIDE) blocchi.push(cat.partite.slice(i, i + MAX_PARTITE_PER_SLIDE));
  blocchi.forEach((partite, i) => slideCategorie.push({ ...cat, partite, parte: blocchi.length > 1 ? `${i + 1}/${blocchi.length}` : '' }));
}
const totale = slideCategorie.length + 2;

const slides = [];

slides.push(page(`<div class="slide cover">
  <div class="top" style="position:absolute;top:90px;left:80px;right:80px"><span class="brand">${esc(d.pagina)}</span><span>Calcio</span></div>
  <div class="bar"></div>
  <h1>${esc(d.titolo)}</h1>
  <div class="sub">${esc(d.date)}</div>
  <div class="swipe">Scorri per tutte le categorie →</div>
  ${foot(1, totale)}
</div>`));

slideCategorie.forEach((cat, i) => {
  const righe = cat.partite.map((p) => `<div class="match">
      <div class="team home">${esc(p.casa)}</div>
      <div class="score">${esc(p.gol_casa)} – ${esc(p.gol_ospite)}</div>
      <div class="team away">${esc(p.ospite)}</div>
      ${p.nota ? `<div class="note">${esc(p.nota)}</div>` : ''}
    </div>`).join('');
  slides.push(page(`<div class="slide">
    <div class="top"><span class="brand">${esc(d.pagina)}</span><span>${esc(d.date)}</span></div>
    <div class="bar"></div>
    <h2>${esc(cat.nome)}${cat.parte ? ` <span style="opacity:.5">${cat.parte}</span>` : ''}</h2>
    ${cat.girone ? `<div class="girone">${esc(cat.girone)}</div>` : ''}
    <div class="lista">${righe}</div>
    ${foot(i + 2, totale)}
  </div>`));
});

slides.push(page(`<div class="slide end cover">
  <div class="top" style="position:absolute;top:90px;left:80px;right:80px"><span class="brand">${esc(d.pagina)}</span><span>Calcio</span></div>
  <div class="bar"></div>
  <h2>${esc(d.chiusura.titolo)}</h2>
  <p>${esc(d.chiusura.testo)}</p>
  <div class="tags">${esc(d.chiusura.hashtag)}</div>
  ${foot(totale, totale)}
</div>`));

// Didascalia pronta da incollare
const didascalia = [
  `⚽ ${d.titolo.toUpperCase()} | ${d.date}`,
  '',
  ...d.categorie.flatMap((cat) => [
    `🏆 ${cat.nome}${cat.girone ? ` (${cat.girone})` : ''}`,
    ...cat.partite.map((p) => `${p.casa} ${p.gol_casa}-${p.gol_ospite} ${p.ospite}`),
    '',
  ]),
  `👉 ${d.chiusura.titolo} ${d.chiusura.testo}`,
  '',
  d.chiusura.hashtag,
].join('\n');

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1350 } });
  const p = await ctx.newPage();
  for (let i = 0; i < slides.length; i++) {
    await p.setContent(slides[i], { waitUntil: 'load' });
    const file = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await p.screenshot({ path: file });
    console.log('creata', file);
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'didascalia.txt'), didascalia + '\n');
  console.log('creata', path.join(outDir, 'didascalia.txt'));
})();
