# GameShelf

React-frontend voor de GameShelf bordspellenclub, met voorbeeldgegevens en handmatige CSS.
De website opent direct op Collections. Alle pagina's zijn bereikbaar via de sidebar.

## Starten

```sh
cd front-end
npm ci
npm run dev
```

Open de lokale URL die Vite toont. Er is geen account of aparte server nodig.

## Controleren

```sh
cd front-end
npm run lint
npm run build
```

Sessions gebruikt vaste voorbeeldgegevens uit `front-end/src/data/sessions.ts`.
Formulieren en knoppen passen tijdelijk de React-state aan; bij het herladen
begin je weer met de oorspronkelijke voorbeelden.

Collections en Shelves lezen lokale JSON-bestanden uit `front-end/public/data/`.
Wishlist, Trading en Lending gebruiken eveneens voorbeeldgegevens.
Het ontwerp van het datamodel staat in `database/`.
