# RealEFB web frontend

React, TypeScript and Vite supply RealEFB OS: a logo boot screen, app launcher, liquid-glass dock, flight widget, automatic SimBrief import, and simulator UTC/connection status bar. The existing .NET app still serves the static production build to WebView2 and LAN tablets.

```sh
npm ci
npm run dev       # backend must be running on port 5150
npm run build     # typecheck and write production assets to ../src/RealEFB/wwwroot
npx playwright install chromium
npm test          # production-asset browser tests with mocked API responses
```

The generated index and `web-assets/` bundles are checked in so static assets are also available without a Node runtime. Vite preserves the print pages, fonts, icons, and vendored map library. Rebuild after source changes; obsolete hashed bundles are pruned automatically.

Startup always opens Apps. A saved SimBrief account automatically imports the latest plan when no flight is loaded; automatic import preserves an existing session and its trail. Configure an account once in Settings. Import failures stay nonblocking and Refresh retries. There is no separate Import app. The map follows live simulator positions by default; dragging or route overview pauses follow, and Auto follow resumes it. The supplied logo is served unchanged from `assets/brand/realefb-logo.png`. Boot branding appears once per page load and waits for the local shell to mount, independently of network/account setup.

The migration boundary is intentional and explicit: `App.tsx` owns the shell and dashboard; `operations.js` contains the existing operational views and their calculations, autosave, polling, print requests, and WebView2 messages. It loads after the screen containers mount and exposes the typed `OperationsBridge` contract. Legacy operational JavaScript is bundled but is not typechecked. The remaining operational views still need conversion to React/TypeScript; the migration is not a complete rewrite of those views.

Use `npm run typecheck` to check the React components and adapter interface. Browser tests use generated production assets, so run `npm run build` before `npm test`. Native simulator and printing integrations require a real desktop app for end-to-end testing.

The shared design is layered through `theme.css`, `modern.css`, and `glass.css`. Glass tokens cover operational forms, tables, dialogs, dispatch cards, document controls, and map overlays. EFL defaults to dark glass while respecting a saved light theme. PDF/chart content keeps its original document presentation.

For rendering cost, backdrop blur is limited to stationary desktop shell chrome; cards and moving-map overlays use tinted fills. Tablet layouts and reduced-motion mode disable shell blur and simplify shadows. NOTAM rows defer offscreen layout. Hidden clients suspend UI polling and refresh on return; server-side flight recording continues independently. Flight-plan requests cannot overlap. These changes are verified functionally; no tablet frame-rate benchmark has been measured.

Performance and Pushback are React/TypeScript apps in `src/UtilityApps.tsx`. Performance provides wind components, approximate pressure/density altitude, and a margin against a user-provided aircraft distance; it does not invent aircraft-specific V-speeds or FLEX data. Density-altitude approximation reference: https://www.aopa.org/training-and-safety/active-pilots/safety-and-technique/weather/density-altitude .

Pushback sends the documented `TOGGLE_PUSHBACK` SimConnect event on the Windows UI thread. The backend checks fresh on-ground telemetry below 3 kt, expires queued requests, and throttles repeat commands. Successful submission is not confirmation of tug movement. Live MSFS/add-on compatibility requires simulator testing. Event reference: https://docs.flightsimulator.com/msfs2024/retail/programming-apis/key-events/aircraft-miscellaneous-events/ .

Built-in wallpapers are Aurora, Ocean, and Ember, rendered with static CSS. Older built-in selections migrate to Aurora; custom photos remain available. Settings uses a responsive sidebar/detail layout.

Performance now has independent Takeoff and Landing forms. The SimBrief parser exposes `origin.plan_rwy`, `destination.plan_rwy`, and origin elevation alongside existing destination elevation, estimated weights, and airport METARs. The UI prefills supplied runway identifiers, elevations, and METAR temperature/QNH/wind (including MPS conversion and negative temperatures). Variable wind direction remains blank. A runway identifier is not treated as a precise true heading; runway lengths and aircraft-required distances remain manual. Each result computes independently when its inputs are available. Phase edits survive switching between Takeoff and Landing while the app is open.

The global Back button returns Home. Clicking the active dock app also returns Home; active Performance/Pushback appears temporarily in the dock.

Taxi Map reuses the live Leaflet map with an independent app entry, airport zoom (17 for planned airports, 18 on first live fix), north-up aircraft heading, and 1-second foreground polling. It works without a SimBrief flight plan; planned departure/arrival shortcuts enable only when coordinates are present. It uses online OpenStreetMap surface tiles, whose coverage may differ from simulator scenery. No taxi clearance or routed guidance is implied. Zero/zero initialization fixes are suppressed, invalid/disconnected positions hide ownship, and dragging pauses following. The dock is now Home-only; Back returns from every app.

Obsolete standalone `wwwroot/js/app.js` and `wwwroot/css/style.css` have been removed, along with the unused React import screen. `src/operations.js` and its styles remain active during the incremental migration. The `wwwroot/js` report/print helpers, `print` page, and `vendor` assets are required at runtime; `wwwroot/index.html` and `web-assets` are Vite build output.

Settings now uses grouped category rows and dedicated detail pages. `Notifications.tsx` supplies top-down glass banners for settings save results, ground-control command results, and actionable loadsheet arrivals. Banners can be dismissed, expire automatically, and respect reduced motion/transparency preferences.

Ground control now exposes request/release, forward/reverse, 1–3 ft/s command speed, relative heading requests, a target true heading, and Hold (zero tug speed). The simulator-side command queue uses TOGGLE_PUSHBACK, TUG_SPEED and TUG_HEADING; parameters are validated and processed on the simulator UI thread with expiry and fresh ground-state checks. Hold bypasses the movement speed threshold and command throttle. Telemetry and last requested command are displayed separately. No actual tug motion was tested in a connected simulator; compatibility and speed sign/direction behavior must be verified with the intended aircraft/add-on. SDK reference: https://docs.flightsimulator.com/html/Programming_Tools/Event_IDs/Aircraft_Misc_Events.htm .

The shared UI kit lives in `src/ui-kit.css`, loaded after the older screen styles. It defines typography, spacing, corner radii, focus states and control sizing. Performance uses the same graphite workspace as Ground Operations, with separate takeoff/landing inputs, planned weather, a wind preview and runway utilization. Calculations remain manual planning aids with the existing input validation.

Responsive layouts cover phone, tablet, desktop and short landscape screens. Settings categories scroll horizontally on phones; the detail pane retains its own vertical scrolling. Pushback controls precede the schematic on smaller screens. The dock scrolls horizontally when needed, and dense flight-log tables retain internal scrolling. Browser tests exercise the app at 360×800, 768×1024, 1440×900 and 812×375.


Ground visualization uses a lazy-loaded Three.js WebGL scene with procedural 3D aircraft and tug meshes. It defaults to a north-up orthographic top view, with optional orbit inspection, pan, zoom, and recenter. Latitude/longitude deltas and true heading drive measured aircraft motion; the cyan arrow/trail records that motion. The amber guide and tug articulation visualize requested steering. The model is generic and tug attachment is not confirmed by telemetry. An explicitly labelled offline motion preview does not send simulator commands. WebGL resources, controls, observers, and frame loops are disposed on navigation. Ground Operations and Pushback retain viewport-bound layouts across the five fit tests.


Wallpaper Settings groups the bundled choices into Nature (Alpine Lake, Forest, Coast, Misty Highlands, Glacier Dawn) and Elements (Aurora, Tidal Glass, Ember Flow), with a separate custom-photo slot. Add wallpaper IDs to both the `WALLPAPERS` registry in `operations.js` and the startup allowlist in `main.tsx`; backgrounds and picker thumbnails share asset rules in `ui-kit.css`. Generated JPEG assets are bundled locally. The repository README gallery is refreshed with `node frontend/scripts/capture-readme.mjs`, using isolated sample data.
