# GameShelf frontend

React en TypeScript met Vite. Het entrypoint is `src/components/main.tsx`.
`src/components/App.tsx` regelt de routes. De startpagina toont direct Collections.
Alle pagina's zijn toegankelijk zonder account.
De vormgeving gebruikt gewone CSS-bestanden, zonder Tailwind.

## Starten

```sh
npm ci
npm run dev
```

Open de lokale URL die Vite toont, meestal `http://localhost:5173`.

## Sessions

| Bestand | Verantwoordelijkheid |
| --- | --- |
| `src/data/sessions.ts` | Vaste voorbeeldsessies, leden en spellen. |
| `src/features/sessions/SessionsPage.tsx` | Verbindt de lijst en formulieren met de schermgegevens. |
| `src/features/sessions/useSessions.ts` | Tijdelijke React-state voor de demonstratie van schermacties. |
| `src/features/sessions/SessionList.tsx` | Overzicht van sessies. |
| `src/features/sessions/SessionCard.tsx` | Eén kaart met locatie, organisator en bezette plaatsen. |
| `src/features/sessions/CreateSessionModal.tsx` | Formulier voor een nieuwe voorbeeldsessie. |
| `src/features/sessions/SessionDetailModal.tsx` | Details, deelnemers, wachtlijst en meegenomen spellen. |
| `src/features/sessions/SignupActions.tsx` | Aanmelden en afmelden in het schermvoorbeeld. |
| `src/features/sessions/HostControls.tsx` | Wijzigen, overdragen en annuleren in het schermvoorbeeld. |
| `src/features/sessions/SignupRow.tsx` | Eén deelnemer. |
| `src/features/sessions/Modal.tsx` | Gedeelde pop-up met het native dialog-element. |
| `src/features/sessions/SessionsPage.css` | Handmatige CSS. |
| `src/types/Session.ts` | TypeScript-types voor de schermgegevens. |

Sessions doet geen netwerkverzoeken en bewaart niets permanent. Een paginaherlading
herstelt de vaste voorbeelden. Het voorbeeldprofiel is Jeffrey.

Collections en Shelves laden lokale JSON-bestanden via `useFetch`; dit zijn statische
bestanden in `public/data/`. Wishlist, Trading en Lending gebruiken voorbeeldgegevens.

## Scripts

- `npm run dev`: ontwikkelserver.
- `npm run lint`: code controleren.
- `npm run build`: TypeScript controleren en de website bouwen in `dist/`.
- `npm run preview`: de gebouwde website bekijken.
