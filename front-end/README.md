# GameShelf frontend

React en TypeScript met Vite. Het entrypoint is `src/components/main.tsx`.
`src/components/App.tsx` regelt de routes en controleert de opgeslagen login.
De vormgeving gebruikt gewone CSS-bestanden; er wordt geen Tailwind gebruikt.

## Starten

```sh
npm ci
npm run dev
```

Start daarnaast de backend op `http://localhost:5080` (zie `../back-end/README.md`).
Open `http://localhost:5173`. Zonder login zie je eerst de homepagina.
Klik op **Sign in** om naar `/login` te gaan. Na inloggen opent standaard `/sessions`.
Na uitloggen ga je terug naar de openbare homepagina.
Demo: gebruikersnaam `jeffrey` of `artur`, wachtwoord `Admin001`.

## Indeling

De features volgen dezelfde opzet als collection en shelves: losse pagina's,
lijsten, kaarten en formulieren, met CSS bij de betreffende feature.

| Bestand of map | Wat staat erin? |
| --- | --- |
| `src/features/home/` | Openbare homepagina, eenvoudige header en footer, eigen CSS. |
| `src/features/auth/` | Inlogformulier en bijbehorende CSS. |
| `src/features/sessions/SessionsPage.tsx` | Verbindt het overzicht, de hook en de formulieren. |
| `src/features/sessions/SessionList.tsx` | Sessieoverzicht en melding bij een lege lijst. |
| `src/features/sessions/SessionCard.tsx` | Eén sessiekaart met host, locatie en bezetting. |
| `src/features/sessions/useSessions.ts` | Laden, verversen, foutmeldingen en sessiedetails. |
| `src/features/sessions/sessionsApi.ts` | HTTP-aanroepen voor sessies, deelnemers, hostacties en keuzelijsten. |
| `src/features/sessions/CreateSessionModal.tsx` | Formulier om een sessie aan te maken. |
| `src/features/sessions/SessionDetailModal.tsx` | Details, deelnemers, wachtlijst en meegenomen spellen. |
| `src/features/sessions/SignupActions.tsx` | Aanmelden, een spel kiezen en afmelden. |
| `src/features/sessions/HostControls.tsx` | Wijzigen, hostschap overdragen en annuleren. |
| `src/features/sessions/SignupRow.tsx` | Eén bevestigde deelnemer en het meegenomen spel. |
| `src/features/sessions/Modal.tsx` | Gedeelde pop-up met het native HTML-dialog-element. |
| `src/features/sessions/sessionUtils.ts` | Statuswaarden, foutmeldingen en lokale datumnotatie. |
| `src/features/sessions/SessionsPage.css` | Handmatige CSS voor sessiekaarten, formulieren en pop-ups. |
| `src/types/Session.ts` | TypeScript-types van sessies en inschrijvingen. |
| `src/api.ts` | Gedeelde HTTP-client, bearer-token en login-aanroepen. |
| `src/features/collection/`, `src/features/shelves/` | De onderdelen die vanuit main zijn overgenomen. |

Login en sessions gebruiken de echte backend en database. De overige pagina's
gebruiken voorlopig statische demogegevens; collection en shelves laden JSON uit
`public/data/`. De sidebar blijft na inloggen beschikbaar voor alle onderdelen.

## Scripts

- `npm run dev`: lokale ontwikkelserver met automatische updates.
- `npm run lint`: code controleren met Oxlint.
- `npm run build`: TypeScript controleren en de webapp bouwen in `dist/`.
- `npm run preview`: de gebouwde webapp lokaal bekijken.
