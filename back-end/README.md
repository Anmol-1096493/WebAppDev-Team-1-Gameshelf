# GameShelf backend

ASP.NET Core Web API in C#, gericht op **.NET 10**. De API gebruikt controllers, SQLite en bearer-tokenauthenticatie voor de sessiefuncties.

## Wat heb je nodig?

| Onderdeel | Windows met Visual Studio | macOS met VS Code |
| --- | --- | --- |
| .NET | .NET 10 SDK | .NET 10 SDK |
| Editor | Visual Studio 2026, bijgewerkt naar de nieuwste versie | Visual Studio Code |
| Editorondersteuning | Workload **ASP.NET and web development** | Microsoft-extensie **C# Dev Kit** |
| Database / Docker / Node.js | SQLite wordt automatisch aangemaakt; Docker en Node.js zijn niet nodig voor de backend | SQLite wordt automatisch aangemaakt; Docker en Node.js zijn niet nodig voor de backend |

Installeer de **SDK**, niet alleen de Runtime. De SDK bevat de tools om de API te bouwen en te draaien. Download: [.NET 10 SDK voor Windows en macOS](https://dotnet.microsoft.com/en-us/download/dotnet/10.0).

Dit project gebruikt `net10.0`. Hiervoor ondersteunt Visual Studio versie 18.0 of hoger (Visual Studio 2026) de target. Visual Studio 2022 is daarvoor niet geschikt; gebruik Visual Studio 2026 of VS Code met de .NET 10 SDK. Zie [Microsoft: SDK en Visual Studio-compatibiliteit](https://learn.microsoft.com/en-us/dotnet/core/porting/versioning-sdk-msbuild-vs).

## macOS met VS Code

1. Installeer de .NET 10 SDK via de downloadlink hierboven. Kies **Arm64** voor een Apple Silicon-Mac (M1/M2/M3/M4 enzovoort) of **x64** voor een Intel-Mac.
2. Sluit de terminal en VS Code en open ze opnieuw na de installatie.
3. Installeer in VS Code de Microsoft-extensie **C# Dev Kit** (`ms-dotnettools.csdevkit`). Deze is aanbevolen voor IntelliSense en debugging; om via de terminal te starten is de SDK voldoende.
4. Open de map `back-end` in VS Code via **File → Open Folder**.
5. Open **Terminal → New Terminal** en controleer de installatie:

```sh
dotnet --info
dotnet --list-sdks
```

In de SDK-lijst moet een versie `10.0.xxx` staan. Zie ook [Microsoft: .NET installeren op macOS](https://learn.microsoft.com/en-us/dotnet/core/install/macos) en [C# in VS Code](https://code.visualstudio.com/docs/csharp/get-started).

## Windows met Visual Studio

1. Installeer of update **Visual Studio 2026**.
2. Open **Visual Studio Installer → Modify** en selecteer **ASP.NET and web development**.
3. Controleer in **Individual components** of de .NET 10 SDK is geïnstalleerd. Zo nodig installeer je de SDK via de downloadlink hierboven.
4. Open `back-end/GameShelf.sln` via **File → Open → Project/Solution**.
5. Stel `GameShelf.Api` in als startup project als dat niet al zo is.
6. Selecteer bovenin het startprofiel **http** en gebruik **Ctrl+F5** (starten zonder debugger) of **F5** (met debugger).

De API draait op `http://localhost:5080`. Open zelf `http://localhost:5080/health` in de browser om te controleren of de API werkt.

Je kunt op Windows ook de terminalcommando's hieronder gebruiken vanuit PowerShell. Zie [Microsoft: .NET installeren op Windows](https://learn.microsoft.com/en-us/dotnet/core/install/windows).

## Starten via terminal — beide systemen

Open een terminal in de map `back-end`. Vanuit de hoofdmap van de repository doe je eerst:

```sh
cd back-end
```

Daarna:

```sh
dotnet restore GameShelf.sln
dotnet build GameShelf.sln
dotnet run --project GameShelf.Api --launch-profile http
```

De eerste restore heeft internet nodig om eventuele packages te downloaden. Na het starten verschijnt `Now listening on: http://localhost:5080`. Laat deze terminal open. Stoppen doe je met **Ctrl+C**.

### Controleren of de API draait

Open in een browser:

```text
http://localhost:5080/health
```

Verwachte HTTP-status: `200 OK`. Verwachte JSON:

```json
{"status":"ok"}
```

De route `/` geeft voorlopig `404`. In de ontwikkelomgeving vind je de interactieve Swagger-documentatie op `http://localhost:5080/swagger` en het OpenAPI-document op `http://localhost:5080/swagger/v1/swagger.json`.

Gebruik eerst `POST /api/auth/login` in Swagger, bijvoorbeeld met het ontwikkelaccount `jeffrey` en wachtwoord `gameshelf123`. Kopieer de waarde van `token` uit het antwoord naar **Authorize**; typ alleen de token, zonder `Bearer` ervoor. Daarna kun je de beveiligde sessie-, leden- en spellenroutes uitproberen. Swagger is alleen ingeschakeld in de `Development`-omgeving.

### Automatisch herstarten tijdens ontwikkelen

```sh
dotnet watch --project GameShelf.Api run --launch-profile http
```

### VS Code-debugger

Open `Program.cs` en druk op **F5** met C# Dev Kit geïnstalleerd. Kies `GameShelf.Api` en het profiel `http` als VS Code daarom vraagt. Via **Run → Start Debugging** kan dit ook. De terminalmethode werkt zonder debuggerconfiguratie.

## Mappen en bestanden

```text
back-end/
├── GameShelf.sln
├── global.json
├── README.md
├── .vscode/
│   └── extensions.json
└── GameShelf.Api/
    ├── Controllers/             # auth-, sessie-, leden- en spellenroutes
    ├── Swagger/                 # bearer-tokenmarkering in het OpenAPI-document
    ├── Properties/
    │   └── launchSettings.json  # lokaal startprofiel en poort
    ├── GameShelf.Api.csproj
    ├── GameShelf.Api.http
    ├── Program.cs              # services, middleware, Swagger en routes
    ├── appsettings.json
    └── appsettings.Development.json
```

`global.json` laat het team een .NET 10 SDK gebruiken en staat nieuwere stabiele .NET 10 feature bands en patches toe. De benodigde basisversie is `10.0.100`. Buildbestanden in `bin/` en `obj/` worden via de bestaande `.gitignore` uitgesloten.

De React-frontend blijft een apart project in `../front-end/` en start in een tweede terminal met `npm run dev`. De sessiepagina gebruikt de API via `../front-end/src/api.ts`.

## Veelvoorkomende problemen

- **`dotnet: command not found` / `dotnet is not recognized`**: installeer de SDK en open de terminal opnieuw. Controleer met `dotnet --info`. Op macOS kan de officiële installatie onder `/usr/local/share/dotnet` staan; controleer de installatie/PATH volgens de Microsoft-installatiepagina.
- **SDK niet gevonden / `NETSDK1045`**: controleer met `dotnet --list-sdks` of een .NET 10 SDK aanwezig is. Alleen een Runtime of .NET 8/9 SDK is niet voldoende.
- **Visual Studio kan `net10.0` niet bouwen**: update Visual Studio 2026 en de .NET SDK.
- **Poort 5080 is bezet**: stop de andere API met Ctrl+C of draai tijdelijk `dotnet run --project GameShelf.Api --no-launch-profile --urls http://localhost:5081`. Gebruik dan poort 5081 voor `/health`.
- **Browser opent geen API**: gebruik `http://localhost:5080/health`, controleer of de API-terminal nog draait en gebruik `http`, niet `https`. Het lokale profiel gebruikt HTTP; er is hiervoor geen ontwikkelcertificaat nodig.
