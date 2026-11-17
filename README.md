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
\n## Limiti di memoria (Alpha 0.8)\nPer evitare blocchi sui telefoni, i metadati JPEG/PNG vengono letti dai primi 4 MiB e SHA-256 viene calcolato solo per file fino a 64 MiB. I file più grandi sono comunque selezionabili, ma senza hash. L'anteprima precedente viene rilasciata quando si cambia file; i risultati di analisi obsolete vengono ignorati.\n\n## AI Vision 2 — fase di validazione (Alpha 0.9)\nAggiunto `ai-evaluation.js`: matrice di confusione, precision, recall, specificity e tassi di falsi positivi/negativi. Il codice non contiene un modello preaddestrato e **non effettua ancora classificazione AI**. Prima di attivare un classificatore serviranno un modello con licenza compatibile, un dataset di test indipendente, misure per categorie diverse e test su dispositivi reali. Le metriche su dati di esempio non costituiscono validazione.\n\n## Alpha 1.0 — classificatore sperimentale opzionale\nIl pulsante dedicato carica Transformers.js e il modello ONNX `onnx-community/ai-image-detection-ONNX` (licenza Apache-2.0 dichiarata nella model card). Il modello è basato su CIFAKE, non è stato validato da TrueLens su immagini recenti e i suoi score non sono probabilità calibrate. Il download iniziale può essere grande, richiede connessione e l'inferenza WebAssembly può fallire o essere lenta su mobile. Non è attivato automaticamente. Il codice tenta inferenza locale: non invia esplicitamente l'immagine a un servizio di classificazione. Le dipendenze e i pesi del modello vengono scaricati da provider esterni. La compatibilità effettiva su Safari iOS e Android è ancora da verificare.\n
## Copertura generatori recenti — piano di valutazione
Origin Trace cerca ora riferimenti testuali a Gemini/Imagen/Veo, Kling, Seedance, Firefly, Sora, Wan, MiniMax/Hailuo, Luma, FLUX e alle piattaforme Krea/Creen AI. **Sono indizi dichiarati nei metadati, non rilevamento visivo né attribuzione certificata.** Per i video non esiste ancora un estrattore di metadati specifico: il supporto a questi nomi è preparatorio.

Per la verifica affidabile occorre:
1. Verificare firme C2PA con una libreria di validazione e trust store aggiornato, non con ricerca di stringhe.
2. Per SynthID, utilizzare soltanto verificatori ufficiali o API autorizzate: TrueLens non decodifica autonomamente SynthID.
3. Costruire dataset separati per immagini, video, generatori e versioni, con file originali e copie ricompressate.
4. Separare detection binaria (AI/non AI) dall'attribuzione del generatore: la seconda richiede evidenze aggiuntive.
5. Misurare errori su contenuti mai visti in addestramento e mostrare "non determinabile" quando mancano prove.
6. Per i video, introdurre campionamento frame, segnali temporali e metadati container; un classificatore di immagini da solo non basta.

Non considerare le etichette di piattaforme aggregatrici come prova del modello sottostante.
\n## Alpha 1.1 — Video Vision preliminare\nPer i video supportati dal browser, campiona tre fotogrammi a intervalli lungo la durata e calcola luminosità, contrasto e differenze locali tra pixel, senza upload. Non è un rilevatore di deepfake né identifica Veo/Kling/Seedance. File lunghi o codec incompatibili possono fallire; il browser deve decodificare il video. Per la verifica C2PA, il SDK ufficiale corrente è @contentauth/c2pa-web, non il pacchetto legacy. L'integrazione di verifica delle firme richiede ancora sviluppo e collaudo.\n
## Alpha 1.2 — C2PA sperimentale
Pulsante facoltativo per tentare la lettura di manifest C2PA con @contentauth/c2pa-web 0.15.4 in browser. Nessuna catena di fiducia è configurata: **manifest presente non equivale a firma valida**. Il caricamento CDN ESM e la compatibilità Safari/Android devono essere collaudati.
