# TrueLens — Evidence Engine

Prototipo gratuito di analisi preliminare locale per immagini e video.

## Funzioni attuali
- Selezione e anteprima di file compatibili col browser
- Tipo MIME, dimensione e data di modifica
- Origin Trace: indizi testuali dichiarati nei metadati (non attribuzione verificata)\n- Lettura locale e limitata di metadati PNG tEXt/iTXt non compressi\n- Lettura limitata e locale di tag EXIF JPEG (produttore, modello, software, data), se presenti\n- SHA-256 del file tramite Web Crypto
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
