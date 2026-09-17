# WebAppDev-Team-1-Gameshelf

Webapplicatie voor GameShelf.

- `front-end/`: React + TypeScript met Vite.
- `back-end/`: ASP.NET Core Web API in C# (.NET 10). Zie de [backend-README](back-end/README.md) voor installatie en lokaal starten op Windows en macOS.

## Frontend starten

Voer vanuit deze projectmap uit:

```sh
cd front-end
npm install
npm run dev
```

Open de lokale URL die Vite in de terminal toont.

## Controleren

Voer vanuit `front-end/` uit:

```sh
npm run lint
npm run build
```

De styling, functionaliteit en koppeling met de backend worden later toegevoegd.

## Backend starten

Na het installeren van de .NET 10 SDK:

```sh
cd back-end
dotnet run --project GameShelf.Api --launch-profile http
```

Controleer de API op http://localhost:5080/health. Uitgebreide uitleg staat in [back-end/README.md](back-end/README.md).
