# TrueLens — Evidence Engine

Prototipo gratuito di analisi preliminare locale per immagini e video.

## Funzioni attuali
- Selezione e anteprima di file compatibili col browser
- Tipo MIME, dimensione e data di modifica
- AI Vision (fase 1): misure visive locali di luminosità, contrasto e differenze tra pixel; NON è un classificatore AI\n- Controllo firma binaria del file e confronto con MIME dichiarato\n- Origin Trace: indizi testuali dichiarati nei metadati (non attribuzione verificata)\n- Lettura locale e limitata di metadati PNG tEXt/iTXt non compressi\n- Lettura limitata e locale di tag EXIF JPEG (produttore, modello, software, data), se presenti\n- SHA-256 del file tramite Web Crypto
- Rapporto copiabile
- PWA con service worker

**Non implementato:** rilevamento AI, riconoscimento generatore, analisi Photoshop, verifica C2PA, deepfake. Non confondere i metadati con una prova di autenticità.

## Esecuzione
Apri la pagina tramite un server HTTPS o localhost. Su GitHub Pages puoi aggiungerla alla schermata Home del telefono.

## Roadmap
1. Verifica C2PA e parser EXIF più completi
2. Modello locale di classificazione AI con benchmark e incertezza
3. Analisi di fotogrammi video
4. Packaging Android

Licenza da definire prima di distribuire contributi esterni.
\n## Limiti di memoria (Alpha 0.8)\nPer evitare blocchi sui telefoni, i metadati JPEG/PNG vengono letti dai primi 4 MiB e SHA-256 viene calcolato solo per file fino a 64 MiB. I file più grandi sono comunque selezionabili, ma senza hash. L'anteprima precedente viene rilasciata quando si cambia file; i risultati di analisi obsolete vengono ignorati.\n\n## AI Vision 2 — fase di validazione (Alpha 0.9)\nAggiunto `ai-evaluation.js`: matrice di confusione, precision, recall, specificity e tassi di falsi positivi/negativi. Il codice non contiene un modello preaddestrato e **non effettua ancora classificazione AI**. Prima di attivare un classificatore serviranno un modello con licenza compatibile, un dataset di test indipendente, misure per categorie diverse e test su dispositivi reali. Le metriche su dati di esempio non costituiscono validazione.\n