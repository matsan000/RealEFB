# Contributing to RealEFB

Thanks for wanting to help. Bug fixes, new features, and UI/design work are all welcome.

## Getting set up

You need the [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) and Node.js 22.12+ (or 24 LTS). Then:

```
git clone https://github.com/matsan000/RealEFB.git
cd RealEFB
dotnet run --project src/RealEFB/RealEFB.csproj
```

Or open `RealEFB.slnx` in Visual Studio / Rider and run.

For flight plan import you'll need a free [SimBrief](https://www.simbrief.com/) account (use your own). Live sim data needs Microsoft Flight Simulator 2024 running, but everything else works without it.

### Frontend edits and live reload

The React/TypeScript frontend lives in `frontend/`. The .NET build runs its production build when frontend sources change, then serves the generated files from `wwwroot`. Node is a build-time dependency only; desktop and tablet users do not need it.

For frontend development, start the desktop/backend normally, then run:

```sh
cd frontend
npm ci
npm run dev
```

Open the Vite URL in a browser. API calls and existing static resources are proxied to `http://localhost:5150`; change `vite.config.ts` if your backend uses a different port. React and CSS edits update through Vite. To update the UI served directly by the desktop host, run `npm run build` and rebuild the desktop app. Do not edit generated `wwwroot/index.html` or `wwwroot/web-assets` bundles.

To package checked-in web assets without rebuilding them, pass `-p:SkipFrontendBuild=true` to `dotnet build` or `dotnet publish`.

## Project layout

```
src/RealEFB/
  Program.cs            ASP.NET Core minimal API - every /api/... endpoint lives here
  MainForm.cs           WinForms host window + the WebView2 that shows the UI
  AppSettings.cs        settings model, loaded from/saved to %APPDATA%\RealEFB
  *Client.cs            one file per external integration (SimBrief, SayIntentions,
                        VATSIM, SimConnect, ...)
  SimBriefFlightPlan.cs parses SimBrief's OFP JSON into the model the app uses
  wwwroot/
    index.html
    js/flightlog-report.js, js/print-flightlog.js
    web-assets/         generated React app and operational bundles
    print/              the standalone flight-log print page
    vendor/leaflet/     vendored Leaflet, do not edit
  lib/SimConnect/       Microsoft's SimConnect redistributables, do not edit
installer/              WiX MSI installer project
frontend/
  src/App.tsx           RealEFB OS shell, boot screen, dock and screen containers
  src/HomeScreen.tsx    app launcher and flight widget
  src/icons.tsx         shared icons and supplied RealEFB logo
  src/types.ts          typed API data and operational adapter contract
  src/UtilityApps.tsx           React performance and pushback apps
  src/StatusBar.tsx     simulator UTC clock and server connection status
  src/theme.css         responsive flight deck design
  src/operations.js     existing operational views, isolated behind an adapter
  src/operations.css    operational document and tool styles
  tests/                browser tests against the production web assets
```

The same UI is served to the desktop app's embedded WebView2 **and** to tablets on the LAN over plain HTTP. If you touch the frontend, check it works in a normal browser too, not just the desktop window.

## Testing

For frontend changes, run `npm run build`, `npx playwright install chromium`, and `npm test` from `frontend/`. Browser tests serve production assets and mock backend responses for flight import, navigation, autosave, unavailable data, and tablet layouts. Also run the app, load a real flight plan, and exercise the changed area in the desktop window and a LAN browser; browser tests do not exercise SimConnect, external providers, native PDF printing, or WebView2.

## Style

Use React components and strict TypeScript for new frontend UI. Keep backend behavior in the existing .NET host. The migration is incremental: the React shell, dashboard, initialization form, and status bar are typed components; existing EFL, tracker, dispatch, documents, settings and wizard renderers remain JavaScript in `operations.js`, mounted into dedicated React-owned containers. The adapter publishes navigation and app settings events without letting operational code modify dashboard children. Move these remaining views into typed React components as they are refactored; do not add more DOM rendering to the adapter.

## Submitting a change

1. Fork the repo and branch off `main`.
2. Keep each PR focused on one thing; write a clear description of what changed and why.
3. Don't bump the version number or rebuild the installer in a feature PR — that's handled at release time.
4. Open the PR against `main`.

By submitting a contribution you agree it's licensed under the project's [MIT license](LICENSE).

## Ideas that would be nice

- More basemap / terrain layer options in the Flight Tracker (it currently uses OpenStreetMap tiles).
- General UI and visual-design polish across the app.

If you're planning something bigger, open an issue first so we can talk it through.
