# Carosello "Risultati del weekend" – Mugello Info

Genera le slide Instagram (1080x1350, formato 4:5) con una slide per categoria, più copertina e chiusura, e la didascalia pronta da incollare.

1. Inserisci i risultati in `risultati.json` (una voce per categoria, una riga per partita; campo `nota` facoltativo, es. "giocata sabato").
2. Esegui `node genera.js` (richiede Node e Playwright).
3. Trovi le immagini e `didascalia.txt` nella cartella `output/`.

Le categorie con più di 7 partite vengono divise automaticamente su più slide.
Colori, nome pagina e handle si cambiano nella sezione iniziale del JSON.
