# Contributing to RealEFB

Thanks for wanting to help. Bug fixes, new features, and UI/design work are all welcome.

## Getting set up

You need the [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0). Then:

```
git clone https://github.com/matsan000/RealEFB.git
cd RealEFB
dotnet run --project src/RealEFB/RealEFB.csproj
```

Or open `RealEFB.slnx` in Visual Studio / Rider and run.

For flight plan import you'll need a free [SimBrief](https://www.simbrief.com/) account (use your own). Live sim data needs Microsoft Flight Simulator 2024 running, but everything else works without it.

### Frontend edits and live reload

RealEFB serves its own `wwwroot` folder. When you run it with `dotnet run` from the project directory, edits to `wwwroot/` (HTML/CSS/JS) show up on the next page refresh — no rebuild needed. If you instead run a *built* `RealEFB.exe`, it serves the copy in its own `bin` folder, so you'd need to rebuild to see frontend changes. During development, prefer `dotnet run`.

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
    js/app.js           the bulk of the frontend - plain vanilla JS, no framework
    js/flightlog-report.js, js/print-flightlog.js
    css/style.css
    print/              the standalone flight-log print page
    vendor/leaflet/     vendored Leaflet, do not edit
  lib/SimConnect/       Microsoft's SimConnect redistributables, do not edit
installer/              WiX MSI installer project
```

The same UI is served to the desktop app's embedded WebView2 **and** to tablets on the LAN over plain HTTP. If you touch the frontend, check it works in a normal browser too, not just the desktop window.

## Testing

There's no automated test suite yet — testing is manual. Run the app, load a flight plan, and exercise the area you changed. For frontend changes, open `http://localhost:5150` in a regular browser as well as using the desktop window.

## Style

Match the code around what you're changing. This codebase leans on thorough explanatory comments — the *why*, not just the *what* — and keeps to the existing naming and formatting. New frontend code should stay framework-free vanilla JS/CSS.

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
