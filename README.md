# RealEFB

A self-hosted Electronic Flight Bag built to feel like the real thing — SimBrief flight plans, an airline-style flight log, and live dispatch, usable from a tablet on your network.

RealEFB runs as a Windows desktop app and serves its own interface over your LAN, so a tablet propped in the cockpit can act as a second EFB screen with no separate install — same flight, same data, on both devices at once.

## Features

- **SimBrief integration** — import your latest flight plan by username or pilot ID, no manual entry.
- **EFL (Electronic Flight Log)** — Fuel/FMC, Waypoints (planned vs. actual times, fuel, and burn per leg), Weather, NOTAMs, Vertical Profile, ATC, and the original OFP as a PDF.
- **Flight Log** — departure/arrival fuel and burn are computed automatically from what you enter on Waypoints, "Reason for DISCR Fuel" only unlocks once PIC Discr crosses 200kg/lbs, and delays are logged against the real Standard IATA Delay Codes (AHM730/731) instead of free text.
- **Log Flight** — saves a flight-log PDF straight to `Documents\RealEFB Documents\FlightLogs` on the PC running RealEFB. Works the same from the desktop app or any tablet on the network — it's a plain request either way.
- **Dispatch** — preliminary/final loadsheets, gate requests, and weather via SayIntentions.AI or VATSIM.
- **Documents** — a local PDF viewer for anything dropped into your `Documents\RealEFB Documents` folder.
- **Website Apps** — add any site as its own home-screen app, with your own name, URL, and (optionally) an icon you upload yourself. Seeded with SimBrief Dispatch, MSFS Flight Planner, and Navigraph Charts Web — all editable or removable. Embedded in the app on desktop, opened as a new tab on a tablet's browser.
- **Live sim data** — reads aircraft state from Microsoft Flight Simulator via SimConnect when it's running.

## Requirements

- Windows 10/11 (x64)
- [.NET 10 Desktop Runtime](https://dotnet.microsoft.com/download/dotnet/10.0) — RealEFB will prompt you for this on first run if it isn't already installed
- A [SimBrief](https://www.simbrief.com/) account, for flight plan import
- Microsoft Flight Simulator 2024 — optional, only needed for live sim data

## Getting started

1. Build `src/RealEFB/RealEFB.csproj` (or open `RealEFB.slnx`) with the .NET 10 SDK.
2. Run `RealEFB.exe`. The first launch walks you through a short setup wizard — your SimBrief ID, and optional SayIntentions.AI/VATSIM and Virtual Performance Tool integrations.
3. To use RealEFB on a tablet, open Settings on the desktop app to find the PC's LAN IP address, then browse to `http://<that IP>:<port>` from the tablet (default port `5150`).

## License

All rights reserved — see [LICENSE](LICENSE).
