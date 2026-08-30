// Simple line-style icon paths (24x24 viewBox), kept flat/minimal on purpose rather than
// colorful emoji - that's the "cartoony" look this replaced. Path data is straight from
// Lucide (ISC-licensed, ~24x24 grid, stroke-width 2) rather than hand-drawn - the earlier
// hand-drawn set didn't sit on the grid quite right (the "documents" fold and "dispatch"
// speech-bubble tail in particular), which read as slightly lopsided at tile size. Only the
// stroke-width itself is overridden, down to 1.6 (see .tile-icon svg in style.css) - everything
// else here renders as Lucide drew it.
const ICONS = {
  documents: '<svg viewBox="0 0 24 24"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8M16 13H8M16 17H8"/></svg>',
  logbook: '<svg viewBox="0 0 24 24"><path d="M12 5v16"/><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>',
  dispatch: '<svg viewBox="0 0 24 24"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg>',
  tracker: '<svg viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>',
  // The fallback face for a Website App (see WEB_APP_TILE_COLOR/webAppToTile) that hasn't had
  // an icon uploaded for it - a plain generic globe, deliberately not any particular product's
  // mark. Real per-site logos only ever come from a user's own upload (see openWebAppEditor),
  // never shipped with RealEFB itself - see WebApp.Icon's own note in AppSettings.cs for why.
  webapp: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
  // Add Website App's quick-add presets (see WEBSITE_APP_QUICK_ADD) - SimPrinter/SimCallouts icons.
  simprinter: '<svg viewBox="0 0 24 24"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>',
  simcallouts: '<svg viewBox="0 0 24 24"><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/></svg>',
};

// Every built-in app that can appear on the home screen, in the order they appear there. User-
// added Website Apps (see webAppToTile) come after these, then Settings last of all. "kind"
// decides what opening one does:
//   native  - renders inside RealEFB's own detail screen (see openDetail)
//   browser - an external site that needs a real top-level browsing context, never an iframe
//             (see openAppSite). Desktop embeds it in the main window; a LAN tablet's browser
//             can't host one, so it gets a new tab.
// Settings is deliberately not in here: it's always shown, since switching it off would leave
// no way to switch anything back on.
const APPS = [
  { id: "logbook", label: "EFL", color: "#a8712f", kind: "native" },
  { id: "dispatch", label: "Dispatch", color: "#2f7dc2", kind: "native" },
  { id: "tracker", label: "Flight Tracker", color: "#1f7a4d", kind: "native" },
  { id: "documents", label: "Documents", color: "#5a6b7d", kind: "native" },
];

const SETTINGS_TILE = { id: "settings", label: "Settings", color: "#6b7280" };

// Every Website App tile shares one flat, brand-neutral color (see ICONS.webapp) rather than
// each getting its own - there's no per-site color to derive one from the way the old fixed
// VPT/SimBrief tiles had (those used each product's own real color). An uploaded icon covers
// the whole face anyway (see makeTileEl's tile-logo treatment), so this only actually shows
// through behind the generic globe on one that hasn't had an icon added yet.
const WEB_APP_TILE_COLOR = "#3d6d94";

// A Settings > Website Apps entry (see AppSettings.WebApp), reshaped into the same {id, label,
// color, kind, url, icon} tile shape makeTileEl/openDetail already know how to render/open -
// same "browser" kind the old fixed VPT/SimBrief tiles used, so nothing about opening one is
// new. "webapp-" prefixed so its DOM id can never collide with a built-in app's.
function webAppToTile(w) {
  const color = w.icon && WHITE_BG_WEBAPP_LOGOS.has(w.icon) ? WEB_APP_WHITE_TILE_COLOR : WEB_APP_TILE_COLOR;
  return { id: `webapp-${w.id}`, label: w.name, color, kind: "browser", url: w.url, icon: w.icon || null };
}

// App id -> whether its tile is shown, from Settings > Apps. An id that isn't in here yet
// counts as enabled, so an app added in a later version turns up rather than staying hidden
// until someone goes looking for a switch (matches AppSettings.EnabledApps's own comment).
let enabledApps = {};

function appEnabled(id) {
  return enabledApps[id] !== false;
}

// Settings > Website Apps' own list ({id, name, url, icon}) - re-synced from the server every
// renderSettings() call, then mutated in place by the add/edit/delete flow there
// (openWebAppEditor/deleteWebApp) and posted back wholesale on every change via persistWebApps().
let webAppsState = [];

// Quick-add presets shown in the Add Website App editor (see openWebAppEditor) - the user's own
// SimPrinter/SimCallouts, each with a small local dashboard at this standard address (off by
// default - see each project's own Settings > Web Dashboard). Clicking one just pre-fills the
// form fields; nothing here checks either app is actually installed or running, same as if the
// user typed the URL in by hand.
//
// icon (a plain ICONS key) is only for the small line-icon on the quick-add button itself - the
// tile it actually creates uses logo instead, each project's own real mark (cropped to just the
// icon, background removed - see wwwroot/assets/webapp-icons and the note in each PNG's own
// generation history) rather than a generic stand-in, since these are specifically the user's
// other apps, not an arbitrary uploaded site the "generic globe" fallback is meant for.
const WEBSITE_APP_QUICK_ADD = [
  { id: "simprinter", name: "SimPrinter", url: "http://localhost:39910", icon: "simprinter", logo: "assets/webapp-icons/simprinter.png" },
  { id: "simcallouts", name: "SimCallouts", url: "http://localhost:39920", icon: "simcallouts", logo: "assets/webapp-icons/simcallouts.png" },
];

// These two presets' logos have their own background baked in (white, with the wordmark/icon
// in each product's own colors) - sitting on the shared blue WEB_APP_TILE_COLOR looked wrong,
// unlike a generic uploaded icon that's designed to work on any flat color (see webAppToTile).
// Matched by logo path rather than tile id, since that's exactly the value that ends up as a
// WebApp's own .icon once added.
const WHITE_BG_WEBAPP_LOGOS = new Set(WEBSITE_APP_QUICK_ADD.map((p) => p.logo));
const WEB_APP_WHITE_TILE_COLOR = "#ffffff";

// The 8 sections along the bottom of the loaded-flight EFL screen. No content behind any of
// them yet - just the navigation shell, filled in later.
const EFL_TABS = [
  { id: "flightlog", label: "Flight Log", icon: '<path d="M4 6h16M4 12h16M4 18h10"/>' },
  { id: "fuelfmc", label: "Fuel/FMC", icon: '<path d="M12 3c3 4 5 7 5 10a5 5 0 1 1-10 0c0-3 2-6 5-10z"/>' },
  { id: "waypoints", label: "Waypoints", icon: '<path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.2"/>' },
  { id: "weather", label: "Weather", icon: '<path d="M7 17a4 4 0 1 1 1.3-7.8 5 5 0 0 1 9.6 1.9A3.5 3.5 0 0 1 17.5 18H7z"/>' },
  { id: "notams", label: "NOTAMS", icon: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>' },
  { id: "vp", label: "VP", icon: '<path d="M3 17l6-6 4 4 8-9"/>' },
  { id: "atc", label: "ATC", icon: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2" y="13" width="4" height="7" rx="2"/><rect x="18" y="13" width="4" height="7" rx="2"/><path d="M20 20v1a2 2 0 0 1-2 2h-2"/>' },
  { id: "pdf", label: "PDF", icon: '<path d="M6 2h9l5 5v15H6V2z"/><path d="M15 2v5h5"/>' },
];

// The Standard IATA Delay Codes (AHM730/731), used by the Flight Log tab's Delays picker
// instead of a free-text reason - grouped the same way the source table is, so the picker
// reads as the real document rather than a flat alphabetical dump. Source: IATA Airport
// Handling Manual 730/731, as reproduced in EUROCONTROL's "Delays to Air Transport in
// Europe" CODA digest, Annex A.
const IATA_DELAY_CODES = [
  {
    group: "Other",
    codes: [
      { code: "00-05", letter: "", desc: "Airline internal codes" },
      { code: "06", letter: "OA", desc: "No gate/stand availability due to own airline activity" },
      { code: "09", letter: "SG", desc: "Scheduled ground time less than declared minimum ground time" },
    ],
  },
  {
    group: "Passenger and Baggage",
    codes: [
      { code: "11", letter: "PD", desc: "Late check-in, acceptance after deadline" },
      { code: "12", letter: "PL", desc: "Late check-in, congestion in check-in area" },
      { code: "13", letter: "PE", desc: "Check-in error, passenger and baggage" },
      { code: "14", letter: "PO", desc: "Oversales, booking errors" },
      { code: "15", letter: "PH", desc: "Boarding, discrepancies and paging, missing checked-in passenger" },
      {
        code: "16",
        letter: "PS",
        desc: "Commercial publicity/passenger convenience, VIP, press, ground meals and missing personal items",
      },
      { code: "17", letter: "PC", desc: "Catering order, late or incorrect order given to supplier" },
      { code: "18", letter: "PB", desc: "Baggage processing, sorting etc." },
      { code: "19", letter: "PW", desc: "Reduced mobility, boarding/deboarding of passengers with reduced mobility" },
    ],
  },
  {
    group: "Cargo and Mail",
    codes: [
      { code: "21", letter: "CD", desc: "Documentation, errors etc." },
      { code: "22", letter: "CP", desc: "Late positioning" },
      { code: "23", letter: "CC", desc: "Late acceptance" },
      { code: "24", letter: "CI", desc: "Inadequate packing" },
      { code: "25", letter: "CO", desc: "Oversales, booking errors" },
      { code: "26", letter: "CU", desc: "Late preparation in warehouse" },
      { code: "27", letter: "CE", desc: "Documentation, packing etc. (mail only)" },
      { code: "28", letter: "CL", desc: "Late positioning (mail only)" },
      { code: "29", letter: "CA", desc: "Late acceptance (mail only)" },
    ],
  },
  {
    group: "Aircraft and Ramp Handling",
    codes: [
      {
        code: "31",
        letter: "GD",
        desc: "Aircraft documentation late/inaccurate, weight and balance, general declaration, pax manifest, etc.",
      },
      { code: "32", letter: "GL", desc: "Loading/unloading, bulky, special load, cabin load, lack of loading staff" },
      { code: "33", letter: "GE", desc: "Loading equipment, lack of or breakdown, e.g. container pallet loader, lack of staff" },
      { code: "34", letter: "GS", desc: "Servicing equipment, lack of or breakdown, lack of staff, e.g. steps" },
      { code: "35", letter: "GC", desc: "Aircraft cleaning" },
      { code: "36", letter: "GF", desc: "Fuelling/defuelling, fuel supplier" },
      { code: "37", letter: "GB", desc: "Catering, late delivery or loading" },
      { code: "38", letter: "GU", desc: "ULD, lack of or serviceability" },
      { code: "39", letter: "GT", desc: "Technical equipment, lack of or breakdown, lack of staff, e.g. pushback" },
    ],
  },
  {
    group: "Technical and Aircraft Equipment",
    codes: [
      { code: "41", letter: "TD", desc: "Aircraft defects" },
      { code: "42", letter: "TM", desc: "Scheduled maintenance, late release" },
      {
        code: "43",
        letter: "TN",
        desc: "Non-scheduled maintenance, special checks and/or additional works beyond normal maintenance schedule",
      },
      { code: "44", letter: "TS", desc: "Spares and maintenance equipment, lack of or breakdown" },
      { code: "45", letter: "TA", desc: "AOG spares, to be carried to another station" },
      { code: "46", letter: "TC", desc: "Aircraft change, for technical reasons" },
      { code: "47", letter: "TL", desc: "Stand-by aircraft, lack of planned stand-by aircraft for technical reasons" },
      { code: "48", letter: "TV", desc: "Scheduled cabin configuration/version adjustments" },
    ],
  },
  {
    group: "Damage to Aircraft & EDP/Automated Equipment Failure",
    codes: [
      {
        code: "51",
        letter: "DF",
        desc: "Damage during flight operations, bird or lightning strike, turbulence, heavy or overweight landing, collision during taxiing",
      },
      {
        code: "52",
        letter: "DG",
        desc: "Damage during ground operations, collisions (other than during taxiing), loading/off-loading damage, contamination, towing, extreme weather conditions",
      },
      { code: "55", letter: "ED", desc: "Departure control" },
      { code: "56", letter: "EC", desc: "Cargo preparation/documentation" },
      { code: "57", letter: "EF", desc: "Flight plans" },
      { code: "58", letter: "EO", desc: "Other automated system" },
    ],
  },
  {
    group: "Flight Operations and Crewing",
    codes: [
      { code: "61", letter: "FP", desc: "Flight plan, late completion or change of, flight documentation" },
      { code: "62", letter: "FF", desc: "Operational requirements, fuel, load alteration" },
      {
        code: "63",
        letter: "FT",
        desc: "Late crew boarding or departure procedures, other than connection and standby (flight deck or entire crew)",
      },
      {
        code: "64",
        letter: "FS",
        desc: "Flight deck crew shortage, sickness, awaiting standby, flight time limitations, crew meals, valid visa, health documents, etc.",
      },
      { code: "65", letter: "FR", desc: "Flight deck crew special request, not within operational requirements" },
      { code: "66", letter: "FL", desc: "Late cabin crew boarding or departure procedures, other than connection and standby" },
      {
        code: "67",
        letter: "FC",
        desc: "Cabin crew shortage, sickness, awaiting standby, flight time limitations, crew meals, valid visa, health documents, etc.",
      },
      { code: "68", letter: "FA", desc: "Cabin crew error or special request, not within operational requirements" },
      { code: "69", letter: "FB", desc: "Captain request for security check, extraordinary" },
    ],
  },
  {
    group: "Weather",
    codes: [
      { code: "71", letter: "WO", desc: "Departure station" },
      { code: "72", letter: "WT", desc: "Destination station" },
      { code: "73", letter: "WR", desc: "En route or alternate" },
      {
        code: "75",
        letter: "WI",
        desc: "De-icing of aircraft, removal of ice and/or snow, frost prevention excluding unserviceability of equipment",
      },
      { code: "76", letter: "WS", desc: "Removal of snow, ice, water and sand from airport" },
      { code: "77", letter: "WG", desc: "Ground handling impaired by adverse weather conditions" },
    ],
  },
  {
    group: "ATFM, Airport and Governmental Authorities",
    codes: [
      { code: "81", letter: "AT", desc: "ATFM due to ATC en-route demand/capacity, standard demand/capacity problems" },
      {
        code: "82",
        letter: "AX",
        desc: "ATFM due to ATC staff/equipment en-route, reduced capacity caused by industrial action or staff shortage, equipment failure, military exercise or extraordinary demand due to capacity reduction in neighbouring area",
      },
      {
        code: "83",
        letter: "AE",
        desc: "ATFM due to restriction at destination airport, airport and/or runway closed due to obstruction, industrial action, staff shortage, political unrest, noise abatement, night curfew, special flights",
      },
      { code: "84", letter: "AW", desc: "ATFM due to weather at destination" },
      { code: "85", letter: "AS", desc: "Mandatory security" },
      { code: "86", letter: "AG", desc: "Immigration, customs, health" },
      { code: "87", letter: "AF", desc: "Airport facilities, parking stands, ramp congestion, lighting, buildings, gate limitations, etc." },
      {
        code: "88",
        letter: "AD",
        desc: "Restrictions at airport of destination, airport and/or runway closed due to obstruction, industrial action, staff shortage, political unrest, noise abatement, night curfew, special flights",
      },
      {
        code: "89",
        letter: "AM",
        desc: "Restrictions at airport of departure with or without ATFM restrictions, including Air Traffic Services, start-up and pushback, airport and/or runway closed due to obstruction or weather, industrial action, staff shortage, political unrest, noise abatement, night curfew, special flights",
      },
    ],
  },
  {
    group: "Reactionary",
    codes: [
      { code: "91", letter: "RL", desc: "Load connection, awaiting load from another flight" },
      { code: "92", letter: "RT", desc: "Through check-in error, passenger and baggage" },
      { code: "93", letter: "RA", desc: "Aircraft rotation, late arrival of aircraft from another flight or previous sector" },
      { code: "94", letter: "RS", desc: "Cabin crew rotation, awaiting cabin crew from another flight" },
      { code: "95", letter: "RC", desc: "Crew rotation, awaiting crew from another flight (flight deck or entire crew)" },
      {
        code: "96",
        letter: "RO",
        desc: "Operations control, re-routing, diversion, consolidation, aircraft change for reasons other than technical",
      },
    ],
  },
  {
    group: "Miscellaneous",
    codes: [
      { code: "97", letter: "MI", desc: "Industrial action with own airline" },
      { code: "98", letter: "MO", desc: "Industrial action outside own airline, excluding ATS" },
      { code: "99", letter: "MX", desc: "Other reason, not matching any code above" },
    ],
  },
];

const WALLPAPERS = [
  { id: "sky", label: "Sky" },
  { id: "sunset", label: "Sunset" },
  { id: "dusk", label: "Dusk" },
  { id: "night", label: "Night" },
  { id: "graphite", label: "Graphite" },
];

// Lightens (positive percent) or darkens (negative) a "#rrggbb" color - used to turn each
// tile's flat base color into a light-to-dark gradient so icons read as glossy/beveled
// rather than flat-filled shapes.
function shadeColor(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((num >> 16) + amt);
  const g = clamp(((num >> 8) & 0xff) + amt);
  const b = clamp((num & 0xff) + amt);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// window.chrome.webview only exists when this page is running inside the desktop app's own
// WebView2 - never in a regular tablet browser. The desktop keeps the rich native PDF viewer
// (full toolbar, zoom, search, print); everyone else pages through server-rendered JPEGs
// instead, since Chrome/Android won't render the PDF inline themselves.
const isDesktopHost = !!(window.chrome && window.chrome.webview);

const homeScreen = document.getElementById("home-screen");
const detailScreen = document.getElementById("detail-screen");
const detailTitle = document.getElementById("detail-title");
const detailBody = document.getElementById("detail-body");
const tileGrid = document.getElementById("tile-grid");
const homeButton = document.getElementById("home-button");
const clockEl = document.getElementById("clock");
const dateEl = document.getElementById("date");
const connectionIcon = document.getElementById("connection-icon");

function makeTileEl(tile) {
  const el = document.createElement("div");
  el.className = "tile";
  el.id = `tile-${tile.id}`;
  const light = shadeColor(tile.color, 12);
  const dark = shadeColor(tile.color, -22);
  // A Website App with its own uploaded icon fills the whole face (tile-logo, same treatment
  // the old fixed VPT/SimBrief tiles used); everything else - built-in apps, and a Website App
  // with none - uses the small inset drawn icon from ICONS, id-matched for built-ins or the
  // generic globe fallback for a Website App (see ICONS.webapp/webAppToTile).
  const iconHtml = tile.icon
    ? `<img class="tile-logo" src="${escapeAttr(tile.icon)}" alt="" />`
    : ICONS[tile.id] || ICONS.webapp;
  el.innerHTML = `
    <span class="tile-icon" style="--icon-light:${light};--icon-dark:${dark}">${iconHtml}</span>
    <span class="tile-label">${escapeAttr(tile.label)}</span>
  `;
  el.addEventListener("click", () => openDetail(tile));
  return el;
}

// Rebuilds the home grid from whichever apps are currently switched on, plus every Website App
// (see Settings > Website Apps/webAppToTile) - always shown there, since adding one there is
// already the opt-in; there's no separate on/off switch for these the way built-in apps get in
// Settings > Apps. Called every time the home screen is (re)shown rather than only at startup,
// so a change in either place takes effect as soon as the user gets back home, with no restart.
// A failed settings fetch leaves the previous grid alone rather than blanking the home screen.
async function refreshTiles() {
  let saved = {};
  let webApps = [];
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (!res.ok) return;
    const s = await res.json();
    saved = s.enabledApps || {};
    webApps = s.webApps || [];
  } catch {
    return;
  }
  enabledApps = saved;

  tileGrid.innerHTML = "";
  for (const app of APPS) {
    if (appEnabled(app.id)) tileGrid.appendChild(makeTileEl(app));
  }
  for (const w of webApps) {
    tileGrid.appendChild(makeTileEl(webAppToTile(w)));
  }
  tileGrid.appendChild(makeTileEl(SETTINGS_TILE));
}

const initScreen = document.getElementById("init-screen");
const wizardScreen = document.getElementById("wizard-screen");

// Gates the whole app behind two things, checked in order: the one-time setup wizard (see
// startWizard()), then loading a SimBrief flight plan (see showInitScreen()) - so every tile/
// tab that depends on either (EFL, the VPT calculator's airport auto-fill, Weather, NOTAMS,
// ...) has data to work with from the moment someone starts using RealEFB, rather than
// reaching a tile and discovering nothing's set up or loaded yet. The flight-plan check is
// keyed off the server's own currentFlightPlan (null right after every RealEFB restart, since
// that's in-memory only) - a tablet opening the app while the desktop already has a flight
// loaded skips straight past it, since the server-side state it's asking about is already
// there. Once initialized this session, no device needs to see that screen again until the
// next full restart. The wizard is different - once completed it stays completed (saved to
// disk) until the user deliberately re-runs it from Settings.
async function startApp() {
  let flightPlan = null;
  let setupWizardCompleted = true;
  try {
    const [fpRes, settingsRes] = await Promise.all([
      fetch("/api/simbrief/flightplan", { cache: "no-store" }),
      fetch("/api/settings", { cache: "no-store" }),
    ]);
    if (fpRes.ok) ({ flightPlan } = await fpRes.json());
    if (settingsRes.ok) ({ setupWizardCompleted } = await settingsRes.json());
  } catch {
    // Treated the same as "wizard already done, nothing loaded yet" - whichever screen this
    // falls through to has its own button that will surface any real connectivity problem.
  }

  if (!setupWizardCompleted) {
    startWizard();
  } else if (flightPlan) {
    showHomeScreen();
  } else {
    showInitScreen();
  }
}

function showHomeScreen() {
  wizardScreen.classList.add("hidden");
  initScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  refreshTiles();
}

async function showInitScreen() {
  wizardScreen.classList.add("hidden");
  homeScreen.classList.add("hidden");
  initScreen.classList.remove("hidden");

  const idInput = document.getElementById("init-simbrief-id");
  // Prefills with whatever SimBrief ID was saved last time, if any - entered once, remembered
  // after that, but this screen (and the explicit click) still happens every restart.
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (res.ok) {
      const { simBriefId } = await res.json();
      idInput.value = simBriefId || "";
    }
  } catch {
    // Field just starts blank - not fatal, the user can still type one in.
  }

  document.getElementById("init-button").addEventListener("click", initializeFlight);
  idInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") initializeFlight();
  });
}

async function initializeFlight() {
  const idInput = document.getElementById("init-simbrief-id");
  const button = document.getElementById("init-button");
  const status = document.getElementById("init-status");
  const id = idInput.value.trim();

  status.classList.remove("init-status-error");

  if (!id) {
    status.textContent = "Enter your SimBrief username or pilot ID.";
    status.classList.add("init-status-error");
    return;
  }

  status.textContent = "Loading...";
  button.disabled = true;

  try {
    const saveRes = await fetch("/api/settings/simbrief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simBriefId: id }),
    });
    if (!saveRes.ok) throw new Error("Could not save the SimBrief ID - try again.");

    const importRes = await fetch("/api/simbrief/import", { method: "POST" });
    const importBody = await importRes.json().catch(() => ({}));
    if (!importRes.ok || !importBody.ok) {
      throw new Error(importBody.error || "Could not load that flight plan - check the ID and try again.");
    }

    // A freshly imported flight's own loadsheets (once they fire) are a genuinely new thing
    // to notify about, even if the previous flight's loadsheets were already seen.
    lastNotifiedPrelimKey = null;
    lastNotifiedFinalKey = null;
    hideLoadsheetNotification();

    showHomeScreen();
  } catch (err) {
    status.textContent = err.message || "Could not load that flight plan - check the ID and try again.";
    status.classList.add("init-status-error");
  } finally {
    button.disabled = false;
  }
}

// Builds one toggle switch - shared by Settings and the setup wizard for the SayIntentions/
// VPT/Dispatch on-off flags, each independent of whether credentials are actually saved
// (see AppSettings.cs).
function toggleSwitchHtml(id, checked, label) {
  return `
    <label class="settings-toggle-row">
      <span class="settings-toggle-label">${escapeAttr(label)}</span>
      <span class="settings-toggle-switch">
        <input type="checkbox" id="${id}" ${checked ? "checked" : ""} />
        <span class="settings-toggle-slider"></span>
      </span>
    </label>`;
}

const EYE_ICON_SVG = '<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';

// Builds one password-style field with a show/hide eye button - shared by every secret-looking
// field in Settings and the setup wizard (SayIntentions code, VPT dev key/password). These all
// round-trip their real saved value now (see GET /api/settings),
// so the field shows the actual saved dots rather than a blank "leave this empty to keep it"
// placeholder - the eye button is what lets that value actually be read back when needed.
function passwordFieldHtml(id, value, placeholder) {
  return `
    <div class="settings-password-field">
      <input type="password" id="${id}" placeholder="${escapeAttr(placeholder || "")}" value="${escapeAttr(value || "")}" autocomplete="off" />
      <button type="button" class="settings-password-eye" data-target="${id}" aria-label="Show password" tabindex="-1">${EYE_ICON_SVG}</button>
    </div>`;
}

// Wires every .settings-password-eye button found under root - called once after each render
// that might contain one (Settings, and every wizard step), harmless no-op otherwise.
function wirePasswordEyeToggles(root) {
  for (const btn of root.querySelectorAll(".settings-password-eye")) {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      const revealing = input.type === "password";
      input.type = revealing ? "text" : "password";
      btn.classList.toggle("settings-password-eye-active", revealing);
      btn.setAttribute("aria-label", revealing ? "Hide password" : "Show password");
    });
  }
}

// The one-time setup wizard - walks through everything RealEFB can be configured with, one
// topic per step (SimBrief, the local web server's port, then each optional integration),
// saving as it goes via the same endpoints Settings itself uses so closing RealEFB partway
// through doesn't lose whatever was already answered. Shown automatically the first time ever
// (see startApp()), and re-runnable on purpose from its own button in Settings.
const WIZARD_STEPS = ["simbrief", "webserver", "sayintentions", "vpt", "done"];
let wizardIndex = 0;
let wizardState = {};

async function startWizard() {
  wizardState = {
    simBriefId: "",
    port: 5150,
    sayIntentionsEnabled: false,
    sayIntentionsApiCode: "",
    vptEnabled: false,
    vptDeveloperKey: "",
    vptEmail: "",
    vptPassword: "",
  };
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (res.ok) {
      const s = await res.json();
      wizardState.simBriefId = s.simBriefId || "";
      wizardState.port = s.port || 5150;
      wizardState.sayIntentionsEnabled = !!s.sayIntentionsEnabled;
      wizardState.sayIntentionsApiCode = s.sayIntentionsApiCode || "";
      wizardState.vptEnabled = !!s.vptEnabled;
      wizardState.vptDeveloperKey = s.vptDeveloperKey || "";
      wizardState.vptEmail = s.vptEmail || "";
      wizardState.vptPassword = s.vptPassword || "";
    }
  } catch {
    // Wizard still opens with blank defaults - nothing fatal about a failed prefill.
  }

  homeScreen.classList.add("hidden");
  initScreen.classList.add("hidden");
  detailScreen.classList.add("hidden");
  homeButton.classList.add("hidden");
  wizardScreen.classList.remove("hidden");

  document.getElementById("wizard-next").addEventListener("click", wizardNext);
  document.getElementById("wizard-back").addEventListener("click", wizardBack);

  wizardIndex = 0;
  renderWizardStep();
}

function renderWizardStep() {
  const stepId = WIZARD_STEPS[wizardIndex];
  document.getElementById("wizard-progress").textContent = `Step ${wizardIndex + 1} of ${WIZARD_STEPS.length}`;

  const status = document.getElementById("wizard-status");
  status.textContent = "";
  status.classList.remove("init-status-error");

  const backBtn = document.getElementById("wizard-back");
  const nextBtn = document.getElementById("wizard-next");
  backBtn.style.visibility = wizardIndex === 0 ? "hidden" : "visible";
  nextBtn.textContent = stepId === "done" ? "Finish" : "Next";

  const body = document.getElementById("wizard-body");

  if (stepId === "simbrief") {
    body.innerHTML = `
      <h1 class="init-title">Welcome to RealEFB</h1>
      <p class="init-subtitle">Let's get a few things set up. First, your SimBrief username or pilot ID - used to load your flight plans.</p>
      <input id="wizard-simbrief-id" type="text" placeholder="e.g. jdoe123" value="${escapeAttr(wizardState.simBriefId)}" />
    `;
  } else if (stepId === "webserver") {
    body.innerHTML = `
      <h1 class="init-title">Local Web Server</h1>
      <p class="init-subtitle">RealEFB runs its own small web server so tablets on your WiFi can use it too - this always stays on, but you can pick which port it uses.</p>
      <input id="wizard-port" type="number" min="1" max="65535" value="${wizardState.port}" />
    `;
  } else if (stepId === "sayintentions") {
    body.innerHTML = `
      <h1 class="init-title">SayIntentions.AI</h1>
      <p class="init-subtitle">Optional. Turn this on if you use SayIntentions.AI and want to enter your API code.</p>
      ${toggleSwitchHtml("wizard-sayintentions-enabled", wizardState.sayIntentionsEnabled, "Enable SayIntentions.AI")}
      <div class="wizard-field-spaced ${wizardState.sayIntentionsEnabled ? "" : "wizard-field-hidden"}" id="wizard-sayintentions-field">
        ${passwordFieldHtml("wizard-sayintentions-code", wizardState.sayIntentionsApiCode, "Paste your API code")}
      </div>
    `;
    document.getElementById("wizard-sayintentions-enabled").addEventListener("change", (e) => {
      document.getElementById("wizard-sayintentions-field").classList.toggle("wizard-field-hidden", !e.target.checked);
    });
  } else if (stepId === "vpt") {
    body.innerHTML = `
      <h1 class="init-title">Virtual Performance Tool</h1>
      <p class="init-subtitle">Optional. Turn this on if you have VPT access for the Takeoff Performance calculator.</p>
      ${toggleSwitchHtml("wizard-vpt-enabled", wizardState.vptEnabled, "Enable Virtual Performance Tool")}
      <div id="wizard-vpt-fields" class="wizard-field-spaced ${wizardState.vptEnabled ? "" : "wizard-field-hidden"}">
        ${passwordFieldHtml("wizard-vpt-devkey", wizardState.vptDeveloperKey, "Developer key")}
        <input id="wizard-vpt-email" type="text" class="wizard-field-spaced" placeholder="Account email" value="${escapeAttr(wizardState.vptEmail)}" />
        <div class="wizard-field-spaced">${passwordFieldHtml("wizard-vpt-password", wizardState.vptPassword, "Account password")}</div>
      </div>
    `;
    document.getElementById("wizard-vpt-enabled").addEventListener("change", (e) => {
      document.getElementById("wizard-vpt-fields").classList.toggle("wizard-field-hidden", !e.target.checked);
    });
  } else if (stepId === "done") {
    body.innerHTML = `
      <h1 class="init-title">All set</h1>
      <p class="init-subtitle">RealEFB is ready to go. Press Finish to continue.</p>
    `;
  }

  wirePasswordEyeToggles(body);
}

async function wizardNext() {
  const stepId = WIZARD_STEPS[wizardIndex];
  const status = document.getElementById("wizard-status");
  const nextBtn = document.getElementById("wizard-next");
  status.classList.remove("init-status-error");

  const fail = (msg) => {
    status.textContent = msg;
    status.classList.add("init-status-error");
  };
  const postJson = async (url, payload) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("save-failed");
  };

  nextBtn.disabled = true;
  try {
    if (stepId === "simbrief") {
      const id = document.getElementById("wizard-simbrief-id").value.trim();
      if (!id) return fail("Enter your SimBrief username or pilot ID.");
      wizardState.simBriefId = id;
      await postJson("/api/settings/simbrief", { simBriefId: id });
    } else if (stepId === "webserver") {
      const port = parseInt(document.getElementById("wizard-port").value, 10);
      if (!Number.isInteger(port) || port < 1 || port > 65535) return fail("Enter a port between 1 and 65535.");
      wizardState.port = port;
      await postJson("/api/settings", { port });
    } else if (stepId === "sayintentions") {
      const enabled = document.getElementById("wizard-sayintentions-enabled").checked;
      const code = document.getElementById("wizard-sayintentions-code").value.trim();
      wizardState.sayIntentionsEnabled = enabled;
      wizardState.sayIntentionsApiCode = code;
      await postJson("/api/settings/sayintentions", { enabled, sayIntentionsApiCode: code });
    } else if (stepId === "vpt") {
      const enabled = document.getElementById("wizard-vpt-enabled").checked;
      const devKey = document.getElementById("wizard-vpt-devkey").value.trim();
      const email = document.getElementById("wizard-vpt-email").value.trim();
      const password = document.getElementById("wizard-vpt-password").value;
      wizardState.vptEnabled = enabled;
      wizardState.vptDeveloperKey = devKey;
      wizardState.vptEmail = email;
      wizardState.vptPassword = password;
      await postJson("/api/settings/vpt", { enabled, vptDeveloperKey: devKey, vptEmail: email, vptPassword: password });
    } else if (stepId === "done") {
      await postJson("/api/settings/wizard-complete", {});
      wizardScreen.classList.add("hidden");
      startApp();
      return;
    }
  } catch {
    return fail("Could not save - check your connection and try again.");
  } finally {
    nextBtn.disabled = false;
  }

  wizardIndex++;
  renderWizardStep();
}

function wizardBack() {
  if (wizardIndex === 0) return;
  wizardIndex--;
  renderWizardStep();
}

// A browser-backed app (see APPS). None of these can be shown in an iframe: they sign in
// through providers that refuse framing outright - login.live.com sends "X-Frame-Options:
// deny", which blocks framing from any origin at all, same-origin included. The desktop app
// hosts them in a second WebView2 filling the same area RealEFB itself occupies (see
// MainForm.OpenEmbeddedSiteAsync), so it reads as an app inside the EFB with no extra window.
// A tablet browser can't host one, so there the only real top-level context available is a new
// tab.
function openAppSite(app) {
  if (isDesktopHost) {
    window.chrome.webview.postMessage(JSON.stringify({ type: "open-site", url: app.url, title: app.label }));
  } else {
    window.open(app.url, "_blank", "noopener");
  }
}

function openDetail(tile) {
  if (tile.kind === "browser") {
    openAppSite(tile);
    return;
  }

  detailTitle.textContent = tile.label;
  detailTitle.style.display = "";
  homeScreen.classList.add("hidden");
  detailScreen.classList.remove("hidden");
  homeButton.classList.remove("hidden");

  if (tile.id === "settings") {
    renderSettings();
  } else if (tile.id === "logbook") {
    renderEfl();
  } else if (tile.id === "documents") {
    renderDocuments();
  } else if (tile.id === "dispatch") {
    renderDispatch();
  } else if (tile.id === "tracker") {
    renderFlightTracker();
  } else {
    detailBody.innerHTML = `<p class="coming-soon">This section is a placeholder - coming soon.</p>`;
  }
}

// ============================== Flight Tracker (live moving map) ==============================
// A Leaflet map (vendored locally - see wwwroot/vendor/leaflet) showing the SimBrief flight
// plan's route (origin, every navlog fix, destination) plus the aircraft's live SimConnect
// position, updated on a 2s poll of /api/flight/state - the same endpoint the status bar clock
// already polls (see checkFlightState). Module-level state below is deliberately not scoped
// inside renderFlightTracker: the poll loop it starts needs to survive across re-renders of this
// same function (reopening the tab) and be reachable from updateTrackerPosition's setInterval
// callback, which itself has to self-cancel once the tab is navigated away from (see the DOM
// presence check at the top of that function - there's no teardown hook elsewhere in app.js to
// call this from, every other interval in this file just runs for the app's whole lifetime).
let trackerMap = null;
let trackerInterval = null;
let trackerFlightPlan = null;
let trackerAircraftMarker = null;
let trackerTrail = null;
let trackerTrailLatLngs = [];
let trackerFollow = true;
let trackerHasFix = false;

async function renderFlightTracker() {
  // Full-bleed like EFL's own sheet (#detail-screen:has(.tracker-sheet) in style.css cancels
  // the screen's normal padding) - a moving map needs the whole screen, and its own header/HUD
  // overlay makes the generic detail-title redundant.
  detailTitle.style.display = "none";

  if (trackerInterval) {
    clearInterval(trackerInterval);
    trackerInterval = null;
  }
  trackerMap = null;
  trackerAircraftMarker = null;
  trackerTrail = null;
  trackerTrailLatLngs = [];
  trackerFollow = true;
  trackerHasFix = false;

  detailBody.innerHTML = `<div class="tracker-sheet"><p class="coming-soon">Loading flight plan...</p></div>`;

  let flightPlan = null;
  try {
    const res = await fetch("/api/simbrief/flightplan", { cache: "no-store" });
    if (res.ok) ({ flightPlan } = await res.json());
  } catch {
    // Falls through to the empty state below.
  }

  if (!flightPlan || flightPlan.originLat == null || flightPlan.destLat == null) {
    detailBody.innerHTML = `
      <div class="tracker-sheet">
        <p class="coming-soon">No SimBrief flight plan with route coordinates is loaded yet.</p>
        <p class="coming-soon">Import a flight plan from the Dispatch or EFL tab, then reopen Flight Tracker.</p>
      </div>
    `;
    return;
  }

  trackerFlightPlan = flightPlan;

  detailBody.innerHTML = `
    <div class="tracker-sheet">
      <div id="tracker-map" class="tracker-map"></div>
      <div class="tracker-header">
        <div class="tracker-route">${escapeAttr(flightPlan.originIcao)} <span class="tracker-route-arrow">&#9656;</span> ${escapeAttr(flightPlan.destIcao)}</div>
        <div class="tracker-callsign">${escapeAttr(flightPlan.callsign)} &middot; ${escapeAttr(flightPlan.aircraftIcao)}</div>
      </div>
      <div class="tracker-status-pill" id="tracker-status-pill">
        <span class="tracker-status-dot"></span><span id="tracker-status-text">No SimConnect</span>
      </div>
      <div class="tracker-hud">
        <div class="tracker-hud-item"><span class="tracker-hud-value" id="tk-gs">---</span><span class="tracker-hud-label">GS KT</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-value" id="tk-alt">-----</span><span class="tracker-hud-label">ALT FT</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-value" id="tk-hdg">---&deg;</span><span class="tracker-hud-label">HDG</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-value" id="tk-vs">----</span><span class="tracker-hud-label">V/S FPM</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-value" id="tk-dist">--- NM</span><span class="tracker-hud-label">DEST DIST</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-value" id="tk-ete">--:--</span><span class="tracker-hud-label">ETE</span></div>
      </div>
      <button id="tracker-center-btn" class="tracker-center-btn active" title="Center on aircraft" aria-label="Center on aircraft">${ICONS.tracker}</button>
    </div>
  `;

  document.getElementById("tracker-center-btn").addEventListener("click", () => {
    trackerFollow = true;
    document.getElementById("tracker-center-btn")?.classList.add("active");
    if (trackerMap && trackerAircraftMarker) trackerMap.panTo(trackerAircraftMarker.getLatLng(), { animate: true });
  });

  initTrackerMap(flightPlan);

  trackerInterval = setInterval(updateTrackerPosition, 2000);
  updateTrackerPosition();
}

// Every lat/lon along the planned route in flying order - origin, each navlog fix, destination -
// straight line segments between them (no great-circle interpolation), same as SimBrief/most
// EFBs render their own route line at this scale since airway fixes are already dense enough
// for the difference to be invisible on a moving map.
function trackerRouteLatLngs(flightPlan) {
  const pts = [];
  if (flightPlan.originLat != null && flightPlan.originLon != null) pts.push([flightPlan.originLat, flightPlan.originLon]);
  for (const fix of flightPlan.navlog || []) {
    if (fix.lat != null && fix.lon != null) pts.push([fix.lat, fix.lon]);
  }
  if (flightPlan.destLat != null && flightPlan.destLon != null) pts.push([flightPlan.destLat, flightPlan.destLon]);
  return pts;
}

function trackerAirportIcon() {
  return L.divIcon({
    className: "tracker-apt-icon",
    html: '<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="6"/></svg>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// A simple top-down aircraft silhouette (nose at the top of its own local frame) wrapped in a
// rotor div so the marker's own DOM element can be rotated in place afterwards (see
// trackerSetAircraftHeading) instead of rebuilding the icon every 2s poll, which used to cause a
// visible flicker.
function trackerAircraftIcon() {
  return L.divIcon({
    className: "tracker-aircraft-icon",
    html: '<div class="tracker-aircraft-rotor"><svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 1.5 L14 9.5 L22.5 14.5 L22.5 16.5 L14 13.5 L14 19.5 L18 22.5 L18 24 L12 22.3 L6 24 L6 22.5 L10 19.5 L10 13.5 L1.5 16.5 L1.5 14.5 L10 9.5 Z"/></svg></div>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function trackerSetAircraftHeading(headingDeg) {
  const el = trackerAircraftMarker && trackerAircraftMarker.getElement();
  const rotor = el && el.querySelector(".tracker-aircraft-rotor");
  if (rotor) rotor.style.transform = `rotate(${headingDeg}deg)`;
}

function initTrackerMap(flightPlan) {
  const mapEl = document.getElementById("tracker-map");
  if (!mapEl || typeof L === "undefined") return;

  trackerMap = L.map(mapEl, { zoomControl: true, attributionControl: true, worldCopyJump: true });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    className: "tracker-tiles",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
  }).addTo(trackerMap);

  const routePts = trackerRouteLatLngs(flightPlan);
  if (routePts.length >= 2) {
    L.polyline(routePts, { color: "#29d3ff", weight: 2.5, opacity: 0.85, dashArray: "1 8", lineCap: "round", interactive: false }).addTo(
      trackerMap
    );
  }

  if (flightPlan.originLat != null && flightPlan.originLon != null) {
    L.marker([flightPlan.originLat, flightPlan.originLon], { icon: trackerAirportIcon(), interactive: false })
      .bindTooltip(flightPlan.originIcao, { permanent: true, direction: "top", className: "tracker-apt-label", offset: [0, -8] })
      .addTo(trackerMap);
  }
  if (flightPlan.destLat != null && flightPlan.destLon != null) {
    L.marker([flightPlan.destLat, flightPlan.destLon], { icon: trackerAirportIcon(), interactive: false })
      .bindTooltip(flightPlan.destIcao, { permanent: true, direction: "top", className: "tracker-apt-label", offset: [0, -8] })
      .addTo(trackerMap);
  }

  for (const fix of flightPlan.navlog || []) {
    if (fix.lat == null || fix.lon == null) continue;
    L.circleMarker([fix.lat, fix.lon], {
      radius: 3,
      color: "#29d3ff",
      weight: 1.5,
      fillColor: "#0b3a4a",
      fillOpacity: 0.9,
      interactive: false,
    })
      .bindTooltip(fix.ident, { permanent: false, direction: "top", className: "tracker-wpt-label", offset: [0, -4] })
      .addTo(trackerMap);
  }

  // The flown-track breadcrumb trail - empty until the first live position arrives.
  trackerTrail = L.polyline([], { color: "#ffb347", weight: 2.5, opacity: 0.9, interactive: false }).addTo(trackerMap);

  // The aircraft marker itself isn't added yet - it only appears once SimConnect actually gives
  // a real position (see updateTrackerPosition), same as a real EFB shows no ownship symbol at
  // all until it has a live position to plot.
  trackerAircraftMarker = L.marker(routePts[0] || [0, 0], { icon: trackerAircraftIcon(), interactive: false, zIndexOffset: 1000 });

  const bounds = L.latLngBounds(routePts.length ? routePts : [[0, 0]]);
  trackerMap.fitBounds(bounds, { padding: [40, 40] });

  // Panning manually breaks follow mode, same as every real moving-map EFB - the center button
  // re-enables it (see renderFlightTracker's click handler on #tracker-center-btn).
  trackerMap.on("dragstart", () => {
    trackerFollow = false;
    document.getElementById("tracker-center-btn")?.classList.remove("active");
  });
}

// Great-circle distance in nautical miles - used for the HUD's destination-distance/ETE figures.
function trackerHaversineNm(lat1, lon1, lat2, lon2) {
  const R_NM = 3440.065;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_NM * Math.asin(Math.min(1, Math.sqrt(a)));
}

async function updateTrackerPosition() {
  // The map is gone once the user has navigated to a different tab (detailBody.innerHTML was
  // replaced under us) - self-cancel rather than touch a detached Leaflet instance, since
  // nothing elsewhere in app.js calls back in to tear this loop down explicitly.
  if (!document.getElementById("tracker-map") || !trackerMap) {
    if (trackerInterval) {
      clearInterval(trackerInterval);
      trackerInterval = null;
    }
    return;
  }

  let connected = false;
  let state = null;
  try {
    const res = await fetch("/api/flight/state", { cache: "no-store" });
    if (res.ok) ({ connected, state } = await res.json());
  } catch {
    // Treated the same as "not connected" below.
  }

  const pill = document.getElementById("tracker-status-pill");
  const pillText = document.getElementById("tracker-status-text");
  if (pill && pillText) {
    const live = !!(connected && state);
    pill.classList.toggle("tracker-status-live", live);
    pillText.textContent = live ? "Live" : "No SimConnect";
  }
  if (!connected || !state) return;

  const { latitude, longitude, headingDegreesTrue, groundSpeedKts, altitudeFt, verticalSpeedFpm } = state;

  const gsEl = document.getElementById("tk-gs");
  const altEl = document.getElementById("tk-alt");
  const hdgEl = document.getElementById("tk-hdg");
  const vsEl = document.getElementById("tk-vs");
  if (gsEl) gsEl.textContent = Math.round(groundSpeedKts);
  if (altEl) altEl.textContent = Math.round(altitudeFt).toLocaleString();
  if (hdgEl) hdgEl.textContent = `${String(Math.round(headingDegreesTrue) % 360).padStart(3, "0")}°`;
  if (vsEl) vsEl.textContent = (verticalSpeedFpm >= 0 ? "+" : "") + Math.round(verticalSpeedFpm);

  const distEl = document.getElementById("tk-dist");
  const eteEl = document.getElementById("tk-ete");
  if (trackerFlightPlan && trackerFlightPlan.destLat != null && trackerFlightPlan.destLon != null) {
    const distNm = trackerHaversineNm(latitude, longitude, trackerFlightPlan.destLat, trackerFlightPlan.destLon);
    if (distEl) distEl.textContent = `${Math.round(distNm)} NM`;
    if (eteEl) {
      if (groundSpeedKts > 20) {
        const eteMin = (distNm / groundSpeedKts) * 60;
        const h = Math.floor(eteMin / 60);
        const m = Math.round(eteMin % 60);
        eteEl.textContent = `${h}:${String(m).padStart(2, "0")}`;
      } else {
        eteEl.textContent = "--:--";
      }
    }
  }

  const latLng = [latitude, longitude];
  if (!trackerHasFix) {
    trackerHasFix = true;
    trackerAircraftMarker.setLatLng(latLng);
    trackerAircraftMarker.addTo(trackerMap);
    trackerMap.setView(latLng, 9);
  } else {
    trackerAircraftMarker.setLatLng(latLng);
  }
  trackerSetAircraftHeading(headingDegreesTrue);

  trackerTrailLatLngs.push(latLng);
  if (trackerTrailLatLngs.length > 1000) trackerTrailLatLngs.shift();
  trackerTrail.setLatLngs(trackerTrailLatLngs);

  if (trackerFollow) trackerMap.panTo(latLng, { animate: true, duration: 0.5 });
}

// The Documents tab - lists any PDFs found in the "RealEFB Documents" folder (created under
// the user's own Documents folder - see GET /api/documents) and, once one is picked, pages
// through it as plain images (GET /api/documents/page) rather than embedding a real PDF
// viewer. Deliberately reuses the Weather tab's own .wx-page/.wx-pager/.wx-chart-img markup
// and pager behavior (including swipe) instead of building a second copy of the same thing.
async function renderDocuments() {
  // Coming back here from a document's page view (see renderDocumentPages) hid this - restore
  // it every time so the title reads correctly regardless of which path led here.
  detailTitle.textContent = "Documents";
  detailTitle.style.display = "";
  detailBody.innerHTML = `<p class="coming-soon">Loading...</p>`;

  let documents = [];
  let folderPath = "";
  try {
    const res = await fetch("/api/documents", { cache: "no-store" });
    if (res.ok) ({ documents, folderPath } = await res.json());
  } catch {
    // Falls through to the empty-state message below.
  }

  if (!documents.length) {
    detailBody.innerHTML = `
      <p class="coming-soon">No PDFs found yet.</p>
      <p class="coming-soon">Drop PDF files into the "RealEFB Documents" folder${
        folderPath ? ` (<code class="doc-folder-path">${escapeAttr(folderPath)}</code>)` : ""
      } in your Documents folder, then reopen this tab.</p>
    `;
    return;
  }

  detailBody.innerHTML = `
    <div class="doc-list">
      ${documents
        .map(
          (d, i) => `
        <button class="doc-list-item" data-index="${i}">
          <span class="doc-list-name">${escapeAttr(d.fileName)}</span>
          <span class="doc-list-pages">${d.pageCount} ${d.pageCount === 1 ? "page" : "pages"}</span>
        </button>`
        )
        .join("")}
    </div>
  `;

  for (const btn of detailBody.querySelectorAll(".doc-list-item")) {
    btn.addEventListener("click", () => renderDocumentPages(documents[Number(btn.dataset.index)]));
  }
}

function renderDocumentPages(doc) {
  let currentPage = 0;

  // The generic page title ("Documents") is redundant with the Return button right below it -
  // hidden here the same way EFL hides it for its own custom header, restored by renderDocuments
  // when the Return button navigates back.
  detailTitle.style.display = "none";

  detailBody.innerHTML = `
    <button class="doc-back-btn" id="doc-back-btn">&#8249; Return</button>
    <div class="wx-tab">
      <div class="wx-page" id="doc-page"></div>
      <div class="wx-pager">
        <button type="button" id="doc-prev" class="wx-pager-btn" aria-label="Previous page">&#10094;</button>
        <span class="wx-pager-label">
          Page <input type="number" id="doc-page-input" class="doc-page-input" min="1" max="${doc.pageCount}" /> of ${doc.pageCount}
        </span>
        <button type="button" id="doc-next" class="wx-pager-btn" aria-label="Next page">&#10095;</button>
      </div>
    </div>
  `;

  const pageEl = document.getElementById("doc-page");
  const pageInput = document.getElementById("doc-page-input");
  const prevBtn = document.getElementById("doc-prev");
  const nextBtn = document.getElementById("doc-next");

  function renderPage() {
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === doc.pageCount - 1;
    pageInput.value = currentPage + 1;
    pageEl.innerHTML = chartWrapHtml(
      `/api/documents/page?file=${encodeURIComponent(doc.fileName)}&index=${currentPage}`,
      `${doc.fileName} page ${currentPage + 1}`
    );
    setupChartZoom(pageEl.querySelector(".wx-chart-wrap"));
  }

  const goTo = (page) => {
    if (page < 0 || page >= doc.pageCount || page === currentPage) return;
    currentPage = page;
    renderPage();
  };
  document.getElementById("doc-back-btn").addEventListener("click", renderDocuments);
  prevBtn.addEventListener("click", () => goTo(currentPage - 1));
  nextBtn.addEventListener("click", () => goTo(currentPage + 1));

  // Fast-travel: typing a page number and pressing Enter/tabbing away jumps straight there -
  // essential once a document runs into the hundreds of pages (checklists, operations manuals)
  // and stepping one page at a time via prev/next stops being practical. Out-of-range numbers
  // clamp to the nearest valid page instead of being silently rejected; anything unparseable
  // just snaps the field back to whatever page is actually showing.
  pageInput.addEventListener("change", () => {
    const parsed = parseInt(pageInput.value, 10);
    const clamped = Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), doc.pageCount) : currentPage + 1;
    if (clamped - 1 === currentPage) pageInput.value = currentPage + 1;
    else goTo(clamped - 1);
  });
  pageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") pageInput.blur();
  });

  // Same swipe-to-turn-page gesture as the Weather tab - ignored if it's more vertical than
  // horizontal, or too short to be a deliberate swipe.
  let touchStartX = null;
  let touchStartY = null;
  pageEl.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  pageEl.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    touchStartX = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    goTo(dx < 0 ? currentPage + 1 : currentPage - 1);
  });

  renderPage();
}

// Dispatch - a modern company-comm app talking to either SayIntentions.AI or VATSIM's public
// data (see Settings > Dispatch), picked per dispatchDataSource. MET RQST/ATIS RQST prompt for
// a typed ICAO (auto-uppercased) rather than fixed departure/arrival buttons - a request could
// be about either leg, or a diversion. Gate requests are SayIntentions-only - VATSIM has no
// such concept - so those two buttons are disabled when VATSIM is the active source.
//
// Also receives two automatic loadsheets per flight (preliminary, then final - see GET
// /api/dispatch/loadsheet in Program.cs), each shown as its own document card above the
// message log rather than buried in it. The final one needs the pilot to actually decide on it
// - ACCEPT or DENY - before a "Send to EFL" button appears to push its passenger numbers into
// the Flight Log's Payload section on request (see decideFinalLoadsheet/sendFinalLoadsheetToEfl).
let dispatchDataSource = "sayintentions";
let dispatchDestIcao = ""; // prefills the gate-request entry's airport field only
let dispatchFlightPlan = null; // holds callsign/route/weights for the loadsheet cards

const ACARS_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function acarsTimestampFor(d) {
  return `${String(d.getDate()).padStart(2, "0")}${ACARS_MONTHS[d.getMonth()]} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function acarsTimestamp() {
  return acarsTimestampFor(new Date());
}

function dispatchScreenEl() {
  return document.getElementById("dispatch-thread");
}

// Appends one bubble to the message log and returns its element so a "Standby..." placeholder
// can be found again and swapped for the real reply once it comes back (see replaceDispatchMsg)
// rather than appending a second, separate entry. direction is "out" (the pilot) or "in"
// (dispatch) - controls which side of the log it aligns to.
function appendDispatchMsg(direction, headHtml, bodyHtml, opts) {
  const screen = dispatchScreenEl();
  if (!screen) return null;
  const { pending, error } = opts || {};
  const el = document.createElement("div");
  el.className = `dispatch-msg dispatch-msg-${direction}${pending ? " dispatch-msg-pending" : ""}${error ? " dispatch-msg-error" : ""}`;
  el.innerHTML = `
    <div class="dispatch-msg-meta">${headHtml}</div>
    ${bodyHtml ? `<div class="dispatch-msg-body">${bodyHtml}</div>` : ""}
  `;
  screen.appendChild(el);
  if (direction === "in" && !pending && !error && bodyHtml) addDispatchPrintButton(el);
  screen.scrollTop = screen.scrollHeight;
  return el;
}

function replaceDispatchMsg(el, headHtml, bodyHtml, isError) {
  if (!el) return;
  el.classList.remove("dispatch-msg-pending");
  el.classList.toggle("dispatch-msg-error", !!isError);
  el.querySelector(".dispatch-msg-meta").innerHTML = headHtml;
  if (bodyHtml) {
    let bodyEl = el.querySelector(".dispatch-msg-body");
    if (!bodyEl) {
      bodyEl = document.createElement("div");
      bodyEl.className = "dispatch-msg-body";
      el.appendChild(bodyEl);
    }
    bodyEl.innerHTML = bodyHtml;
  }
  if (el.classList.contains("dispatch-msg-in") && !isError && bodyHtml) addDispatchPrintButton(el);
  const screen = dispatchScreenEl();
  if (screen) screen.scrollTop = screen.scrollHeight;
}

// Every real (non-pending, non-error) incoming message gets its own "Print via SimPrinter"
// button - sends the message's own timestamp + body straight to SimPrinter's local print
// server (see /api/dispatch/print, and SimPrinterClient.cs for why it's relayed server-side).
function addDispatchPrintButton(el) {
  if (el.querySelector(".dispatch-print-btn")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "dispatch-print-btn";
  btn.textContent = "Print via SimPrinter";
  btn.addEventListener("click", () => printDispatchMsg(el, btn));
  el.appendChild(btn);
}

function dispatchMsgPlainText(el) {
  const meta = el.querySelector(".dispatch-msg-meta")?.textContent.trim() || "";
  const body = el.querySelector(".dispatch-msg-body")?.innerText.trim() || "";
  return [meta, body].filter(Boolean).join("\n");
}

async function printDispatchMsg(el, btn) {
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Printing...";

  try {
    const res = await fetch("/api/dispatch/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: dispatchMsgPlainText(el) }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || body.detail || "Could not print.");

    btn.textContent = "Printed";
    setTimeout(() => {
      btn.textContent = originalLabel;
      btn.disabled = false;
    }, 1500);
  } catch {
    btn.textContent = originalLabel;
    btn.disabled = false;
  }
}

async function renderDispatch() {
  detailBody.innerHTML = `<p class="coming-soon">Loading...</p>`;

  let sayIntentionsApiCode = "";
  try {
    const res = await fetch("/api/settings", { cache: "no-store" });
    if (res.ok) {
      const s = await res.json();
      dispatchDataSource = s.dispatchDataSource === "vatsim" ? "vatsim" : "sayintentions";
      sayIntentionsApiCode = s.sayIntentionsApiCode || "";
    }
  } catch {
    // Falls through - treated the same as "not configured" below.
  }

  if (dispatchDataSource === "sayintentions" && !sayIntentionsApiCode) {
    detailBody.innerHTML = `
      <p class="coming-soon">No SayIntentions.AI API code is set.</p>
      <p class="coming-soon">Enter one in Settings under "SayIntentions.AI", or switch Dispatch's data source to VATSIM in Settings under "Dispatch" - that one needs no account. You can also turn Dispatch off there entirely so it no longer appears on the home screen.</p>
      <div class="settings-row settings-row-spaced">
        <button id="dispatch-open-settings" class="settings-save-btn">Open Settings</button>
      </div>
    `;
    document.getElementById("dispatch-open-settings").addEventListener("click", () => {
      detailTitle.textContent = "Settings";
      detailTitle.style.display = "";
      renderSettings();
    });
    return;
  }

  dispatchFlightPlan = null;
  try {
    const res = await fetch("/api/simbrief/flightplan", { cache: "no-store" });
    if (res.ok) {
      const { flightPlan } = await res.json();
      if (flightPlan) dispatchFlightPlan = flightPlan;
    }
  } catch {
    // The gate-request entry's airport field, and the loadsheet cards' route/weight lines,
    // just fall back to blanks - not fatal.
  }
  dispatchDestIcao =
    dispatchFlightPlan && dispatchFlightPlan.destIcao && dispatchFlightPlan.destIcao !== "N/A" ? dispatchFlightPlan.destIcao : "";

  const gateDisabled = dispatchDataSource !== "sayintentions";
  const sourceLabel = dispatchDataSource === "vatsim" ? "VATSIM" : "SayIntentions.AI";

  detailBody.innerHTML = `
    <div class="dispatch-app">
      <p class="settings-hint">Company Dispatch - data source: ${sourceLabel}.</p>
      <div id="dispatch-loadsheets"></div>
      <div class="dispatch-log-card">
        <div class="dispatch-log" id="dispatch-thread"></div>
      </div>
      <div class="dispatch-actions">
        <button class="dispatch-action-btn" data-action="metar">MET RQST</button>
        <button class="dispatch-action-btn" data-action="atis">ATIS RQST</button>
        <button class="dispatch-action-btn" data-action="gate-expect" ${gateDisabled ? "disabled" : ""}>GATE</button>
        <button class="dispatch-action-btn" data-action="gate-request" ${gateDisabled ? "disabled" : ""}>GATE RQST</button>
      </div>
    </div>
  `;

  appendDispatchMsg("in", acarsTimestamp(), "Dispatch is online. Use the buttons below to request weather or a gate.");

  for (const btn of detailBody.querySelectorAll(".dispatch-action-btn")) {
    btn.addEventListener("click", () => handleDispatchAction(btn.dataset.action));
  }

  showLoadsheetInDispatch();
}

// Fetches both automatic loadsheets and renders whichever have fired for the current flight as
// document cards above the message log (see buildLoadsheetCardHtml) - shown every time
// Dispatch is opened after that point. Once the final loadsheet has arrived it supersedes the
// preliminary one entirely - the preliminary card is dropped from the UI rather than shown
// alongside it, same as a real final loadsheet supersedes the prelim rather than the two
// coexisting. Also clears the top-left notification pill, since arriving here is exactly what
// tapping it does anyway.
async function showLoadsheetInDispatch() {
  const container = document.getElementById("dispatch-loadsheets");
  if (!container) return;

  let data = null;
  try {
    const res = await fetch("/api/dispatch/loadsheet", { cache: "no-store" });
    if (res.ok) data = await res.json();
  } catch {
    return;
  }
  if (!data || !data.hasFlight) return;

  if (data.final) {
    container.innerHTML = buildLoadsheetCardHtml("FINAL", "EDNO 2", data.final);
    wireFinalLoadsheetCard(data.final);
  } else if (data.preliminary) {
    container.innerHTML = buildLoadsheetCardHtml("PRELIM", "EDNO 1", data.preliminary);
  } else {
    container.innerHTML = "";
  }

  hideLoadsheetNotification();
}

// One loadsheet document card - ZFW/TOW/LAW against their certified max (same weights the old
// Weight & Balance app showed, pulled from the current flight plan - see dispatchFlightPlan),
// then the passenger split, then whatever action the final loadsheet's current status calls
// for (ACCEPT/DENY while pending, SEND TO EFL once accepted, or just a status line once
// decided/sent). The preliminary loadsheet never gets an actions row - it's informational only.
function buildLoadsheetCardHtml(kind, ednoLabel, ls) {
  const fp = dispatchFlightPlan || {};
  const unit = (fp.fuelUnits || "kgs").toUpperCase().replace("KGS", "KG").replace("LBS", "LB");
  const fmt = (v) => (v === null || v === undefined ? "-" : Math.round(v).toLocaleString());
  const weightRow = (label, est, max) => {
    const overLimit = est !== null && est !== undefined && max !== null && max !== undefined && est > max;
    return `
      <div class="ls-row${overLimit ? " ls-row-over" : ""}">
        <span class="ls-row-label">${label}</span>
        <span class="ls-row-value">${fmt(est)} ${unit}</span>
        <span class="ls-row-max">MAX ${fmt(max)}</span>
      </div>`;
  };

  const isFinal = kind === "FINAL";
  const routeHtml = fp.originIcao ? ` &middot; ${escapeAttr(fp.originIcao)}&ndash;${escapeAttr(fp.destIcao || "")}` : "";

  const statusHtml =
    ls.status === "accepted"
      ? `<div class="ls-status ls-status-accepted">&#10003; ACCEPTED ${acarsTimestampFor(new Date(ls.decidedUtc))}</div>`
      : ls.status === "denied"
        ? `<div class="ls-status ls-status-denied">&#10007; DENIED ${acarsTimestampFor(new Date(ls.decidedUtc))}</div>`
        : "";

  const actionsHtml = !isFinal
    ? ""
    : ls.status === "pending"
      ? `<div class="ls-actions">
           <button class="ls-btn ls-btn-accept" id="ls-accept-btn">ACCEPT</button>
           <button class="ls-btn ls-btn-deny" id="ls-deny-btn">DENY</button>
         </div>`
      : ls.status === "accepted"
        ? `<div class="ls-actions">
             <button class="ls-btn ls-btn-efl" id="ls-send-efl-btn" ${ls.sentToEfl ? "disabled" : ""}>${ls.sentToEfl ? "SENT TO EFL" : "SEND TO EFL"}</button>
           </div>`
        : "";

  return `
    <div class="ls-card ${isFinal ? "ls-card-final" : "ls-card-prelim"}" id="${isFinal ? "ls-final-card" : "ls-prelim-card"}">
      <div class="ls-card-head">
        <span class="ls-card-title">${kind} LOADSHEET</span>
        <span class="ls-card-edno">${ednoLabel}</span>
      </div>
      <div class="ls-card-sub">${escapeAttr(fp.callsign || "")}${routeHtml} &middot; ${acarsTimestampFor(new Date(ls.issuedUtc))}</div>
      <div class="ls-section">
        ${weightRow("ZFW", fp.estZfw, fp.maxZfw)}
        ${weightRow("TOW", fp.estTow, fp.maxTow)}
        ${weightRow("LAW", fp.estLdw, fp.maxLdw)}
      </div>
      <div class="ls-section ls-pax-section">
        <div class="ls-pax-row">
          <span>ADULTS ${ls.adults}</span>
          <span>CHILDREN ${ls.children}</span>
          <span>INFANTS ${ls.infants}</span>
        </div>
        <div class="ls-cargo-row">CARGO ${fmt(fp.cargo)} ${unit}</div>
        <div class="ls-pax-total">TOTAL PAX ${ls.totalPax}</div>
      </div>
      ${statusHtml}
      ${actionsHtml}
    </div>`;
}

function wireFinalLoadsheetCard(ls) {
  if (ls.status === "pending") {
    document.getElementById("ls-accept-btn")?.addEventListener("click", () => decideFinalLoadsheet("accept"));
    document.getElementById("ls-deny-btn")?.addEventListener("click", () => decideFinalLoadsheet("deny"));
  } else if (ls.status === "accepted" && !ls.sentToEfl) {
    document.getElementById("ls-send-efl-btn")?.addEventListener("click", () => sendFinalLoadsheetToEfl(ls));
  }
}

// ACCEPT/DENY both go through here - action is "accept" or "deny", matching the endpoint path
// exactly. Both buttons disable immediately so a slow connection can't be double-tapped into
// two conflicting decisions; the card is rebuilt from the server's own response either way, so
// it always reflects what's actually saved rather than what the UI optimistically assumed.
async function decideFinalLoadsheet(action) {
  const acceptBtn = document.getElementById("ls-accept-btn");
  const denyBtn = document.getElementById("ls-deny-btn");
  if (acceptBtn) acceptBtn.disabled = true;
  if (denyBtn) denyBtn.disabled = true;

  try {
    const res = await fetch(`/api/dispatch/loadsheet/${action}`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || body.detail || "Could not save - try again.");

    const card = document.getElementById("ls-final-card");
    if (card) card.outerHTML = buildLoadsheetCardHtml("FINAL", "EDNO 2", body.final);
    wireFinalLoadsheetCard(body.final);
  } catch {
    if (acceptBtn) acceptBtn.disabled = false;
    if (denyBtn) denyBtn.disabled = false;
  }
}

// Merges just the pax numbers into whatever's already saved on the Flight Log tab (fuel
// figures, times, delays, etc. all carry over untouched) rather than overwriting the whole
// entry, then tells the server this loadsheet has been sent so the button still shows
// correctly if Dispatch is reopened later. Best-effort throughout - if either call silently
// fails the pilot can always fix it up from the Flight Log tab's own Save.
async function sendFinalLoadsheetToEfl(ls) {
  const btn = document.getElementById("ls-send-efl-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "SENDING...";
  }

  let entry = {};
  try {
    const res = await fetch("/api/simbrief/flightlog", { cache: "no-store" });
    if (res.ok) {
      const body = await res.json();
      if (body.flightLog) entry = body.flightLog;
    }
  } catch {
    // Still sends an entry with just the pax fields set below.
  }

  entry.adults = ls.adults;
  entry.children = ls.children;
  entry.infants = ls.infants;
  entry.actualPax = ls.totalPax;

  try {
    await persistFlightLogEntry(entry);
    await fetch("/api/dispatch/loadsheet/sent-to-efl", { method: "POST" });
  } catch {
    // See function comment above - not fatal.
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = "SENT TO EFL";
  }
}

// Polled on an interval (see setInterval near the bottom of this file) so a loadsheet that
// fires while the pilot is elsewhere in the app still surfaces a notification, same idea as
// checkFlightState/checkServerStatus's own polling. lastNotifiedPrelimKey/lastNotifiedFinalKey
// track whichever loadsheet (by issue time) has already triggered a notification this session,
// so the same one doesn't re-notify every poll - reset on a fresh SimBrief import (see
// initializeFlight) since a new flight's loadsheets are a genuinely new thing to surface.
let lastNotifiedPrelimKey = null;
let lastNotifiedFinalKey = null;

async function checkLoadsheetNotifications() {
  // A "tap to view Dispatch" notification has nowhere useful to go if Dispatch's own tile is
  // switched off in Settings > Apps - skip the poll entirely rather than surface a notification
  // for a screen the pilot deliberately hid.
  if (!appEnabled("dispatch")) return;

  let data;
  try {
    const res = await fetch("/api/dispatch/loadsheet", { cache: "no-store" });
    if (!res.ok) return;
    data = await res.json();
  } catch {
    return;
  }
  if (!data.hasFlight) return;

  // The final loadsheet is strictly the more current document, so if both showed up between
  // polls (e.g. the app was closed for a while), only its notification is shown - the
  // preliminary one is marked seen too rather than separately notifying right after.
  if (data.final && data.final.issuedUtc !== lastNotifiedFinalKey) {
    lastNotifiedFinalKey = data.final.issuedUtc;
    if (data.preliminary) lastNotifiedPrelimKey = data.preliminary.issuedUtc;
    showLoadsheetNotification("Final Loadsheet Received");
    return;
  }
  if (data.preliminary && data.preliminary.issuedUtc !== lastNotifiedPrelimKey) {
    lastNotifiedPrelimKey = data.preliminary.issuedUtc;
    showLoadsheetNotification("Preliminary Loadsheet Received");
  }
}

// Auto-dismisses 10s after showing (see setTimeout below) - loadsheetNotifHideTimer tracks
// that pending dismiss so a second notification arriving before the first one times out
// restarts the clock instead of getting cut off early by the first one's timer.
let loadsheetNotifHideTimer = null;

function showLoadsheetNotification(title) {
  const el = document.getElementById("loadsheet-notification");
  if (!el) return;
  const titleEl = el.querySelector(".loadsheet-notif-title");
  if (titleEl) titleEl.textContent = title;
  el.classList.remove("hidden");
  playNotificationSound();

  if (loadsheetNotifHideTimer) clearTimeout(loadsheetNotifHideTimer);
  loadsheetNotifHideTimer = setTimeout(hideLoadsheetNotification, 10000);
}

function hideLoadsheetNotification() {
  document.getElementById("loadsheet-notification")?.classList.add("hidden");
  if (loadsheetNotifHideTimer) {
    clearTimeout(loadsheetNotifHideTimer);
    loadsheetNotifHideTimer = null;
  }
}

// A short two-note chime, synthesized with the Web Audio API rather than an embedded/fetched
// audio file - no external asset needed, same reasoning as the wallpaper's CSS gradients. The
// AudioContext is created lazily and reused (not one per notification) since browsers cap how
// many can exist at once; wrapped in try/catch since a fresh context can start suspended under
// some autoplay policies and there's nothing useful to do about that beyond staying silent -
// the visual pill still shows either way.
let notificationAudioCtx = null;

function playNotificationSound() {
  try {
    notificationAudioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    const ctx = notificationAudioCtx;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const playTone = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.18, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    };
    playTone(880, 0, 0.16);
    playTone(1320, 0.14, 0.22);
  } catch {
    // Web Audio unavailable/blocked - the visual pill alone is still enough.
  }
}

function clearDispatchEntry() {
  document.getElementById("dispatch-entry")?.remove();
}

// Drops a composer row between the log and the action buttons - one input per field,
// auto-uppercased as the pilot types, Enter on any field sends the same as pressing Send. Used
// for the ICAO prompt (MET RQST/ATIS RQST) and the two-field gate-request prompt alike.
function showDispatchEntry(fields, onSend) {
  clearDispatchEntry();
  const app = document.querySelector(".dispatch-app");
  const actions = document.querySelector(".dispatch-actions");
  if (!app || !actions) return;

  const wrap = document.createElement("div");
  wrap.id = "dispatch-entry";
  wrap.className = "dispatch-entry";
  wrap.innerHTML =
    fields
      .map(
        (f, i) => `
      <label class="dispatch-entry-field">
        <span class="dispatch-entry-label">${escapeAttr(f.label)}</span>
        <input id="dispatch-entry-input-${i}" maxlength="${f.maxlength || 10}" autocomplete="off"
               placeholder="${escapeAttr(f.placeholder || "")}" value="${escapeAttr(f.value || "")}" />
      </label>`
      )
      .join("") + `<button id="dispatch-entry-send" class="dispatch-entry-send">Send</button>`;
  app.insertBefore(wrap, actions);

  const inputs = fields.map((_, i) => document.getElementById(`dispatch-entry-input-${i}`));
  const send = document.getElementById("dispatch-entry-send");
  for (const input of inputs) {
    input.addEventListener("input", () => {
      input.value = input.value.toUpperCase();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") send.click();
    });
  }
  inputs[0].focus();

  send.addEventListener("click", () => {
    const values = inputs.map((i) => i.value.trim());
    if (values.some((v) => !v)) return;
    clearDispatchEntry();
    onSend(...values);
  });
}

function handleDispatchAction(action) {
  if (action === "metar" || action === "atis") {
    showDispatchEntry([{ label: "ICAO", maxlength: 4, placeholder: "e.g. EHAM" }], (icao) => sendDispatchWeather(action, icao));
  } else if (action === "gate-expect") {
    sendDispatchGateExpect();
  } else if (action === "gate-request") {
    showDispatchEntry(
      [
        { label: "ARPT", maxlength: 4, value: dispatchDestIcao },
        { label: "GATE", maxlength: 10, placeholder: "e.g. B14" },
      ],
      (airport, gate) => sendDispatchGateRequest(airport, gate)
    );
  }
}

async function sendDispatchWeather(kind, icao) {
  const label = kind === "atis" ? "ATIS" : "MET";
  appendDispatchMsg("out", `${acarsTimestamp()} &middot; ${label} RQST ${escapeAttr(icao)}`);
  const pendingEl = appendDispatchMsg("in", "Standby...", null, { pending: true });

  try {
    const res = await fetch("/api/dispatch/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icao, kind }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || body.detail || "Request failed - no reply.");

    if (!body.text) {
      replaceDispatchMsg(pendingEl, acarsTimestamp(), `No ${label} available for ${escapeAttr(icao)}.`);
      return;
    }
    replaceDispatchMsg(pendingEl, acarsTimestamp(), `<pre class="wx-raw">${escapeAttr(body.text)}</pre>`);
  } catch (err) {
    replaceDispatchMsg(pendingEl, acarsTimestamp(), escapeAttr(err.message || "Request failed."), true);
  }
}

async function sendDispatchGateExpect() {
  appendDispatchMsg("out", `${acarsTimestamp()} &middot; GATE RQST`);
  const pendingEl = appendDispatchMsg("in", "Standby...", null, { pending: true });

  try {
    const res = await fetch("/api/dispatch/gate", { cache: "no-store" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || body.detail || "Request failed - no reply.");

    if (body.parking && body.parking.name) {
      replaceDispatchMsg(pendingEl, acarsTimestamp(), `Expect gate ${escapeAttr(body.parking.name)}.`);
    } else {
      replaceDispatchMsg(pendingEl, acarsTimestamp(), "No gate assigned yet.");
    }
  } catch (err) {
    replaceDispatchMsg(pendingEl, acarsTimestamp(), escapeAttr(err.message || "Request failed."), true);
  }
}

async function sendDispatchGateRequest(airport, gate) {
  appendDispatchMsg("out", `${acarsTimestamp()} &middot; GATE RQST ${escapeAttr(gate)} ${escapeAttr(airport)}`);
  const pendingEl = appendDispatchMsg("in", "Standby...", null, { pending: true });

  try {
    const res = await fetch("/api/dispatch/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ airport, gate }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || body.detail || "Request failed - no reply.");

    if (body.assignedGate) {
      replaceDispatchMsg(pendingEl, acarsTimestamp(), `Confirmed gate ${escapeAttr(body.assignedGate)}.`);
    } else {
      replaceDispatchMsg(pendingEl, acarsTimestamp(), "Request sent - no gate confirmed.");
    }
  } catch (err) {
    replaceDispatchMsg(pendingEl, acarsTimestamp(), escapeAttr(err.message || "Request failed."), true);
  }
}

// EFL starts as a blank screen with just an import button - no title, no chrome, per the
// "blank page only with a button" brief. Once a flight plan has been imported (this session
// or a previous one, since the server keeps the last one in memory) it switches straight to
// the loaded view with its own header and 8-tab bar instead of re-asking to import.
async function renderEfl() {
  detailTitle.style.display = "none";
  detailBody.innerHTML = "";

  let flightPlan = null;
  try {
    const res = await fetch("/api/simbrief/flightplan", { cache: "no-store" });
    if (res.ok) ({ flightPlan } = await res.json());
  } catch {
    // Fall through to the import screen below.
  }

  if (flightPlan) renderEflLoaded(flightPlan);
  else renderEflImportScreen();
}

function renderEflImportScreen() {
  detailBody.innerHTML = `
    <div class="efl-import-screen">
      <button id="efl-import-btn">Import latest SimBrief flight plan</button>
      <p id="efl-import-status" class="settings-hint"></p>
    </div>
  `;
  document.getElementById("efl-import-btn").addEventListener("click", () => importFlightPlan(renderEflLoaded));
}

async function importFlightPlan(onSuccess) {
  const btn = document.getElementById("efl-import-btn");
  const status = document.getElementById("efl-import-status");
  btn.disabled = true;
  status.classList.remove("settings-error");
  status.textContent = "Importing...";
  try {
    const res = await fetch("/api/simbrief/import", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.flightPlan) {
      onSuccess(body.flightPlan);
    } else {
      status.textContent = body.error || "Could not import - try again.";
      status.classList.add("settings-error");
      btn.disabled = false;
    }
  } catch {
    status.textContent = "Could not import - try again.";
    status.classList.add("settings-error");
    btn.disabled = false;
  }
}

function renderEflLoaded(fp) {
  const outDate = fp.scheduledOutUtc ? new Date(fp.scheduledOutUtc) : null;
  const inDate = fp.scheduledInUtc ? new Date(fp.scheduledInUtc) : null;
  const fmtTime = (d) =>
    d ? `${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}Z` : "----";
  const fmtDate = (d) => (d ? `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}` : "");

  // A round home button back in the middle of the tab bar (4 tabs, home, 4 tabs) - an easy,
  // big tap target for getting back to the home screen, restored after the top-nav "< Home"
  // text link it briefly replaced turned out harder to hit.
  const tabBtnHtml = (t) => `
      <button class="efl-tab-btn ${t.id === "flightlog" ? "selected" : ""}" data-tab="${t.id}">
        <svg class="efl-tab-icon" viewBox="0 0 24 24">${t.icon}</svg>
        <span>${t.label}</span>
      </button>`;
  const leftTabs = EFL_TABS.slice(0, 4);
  const rightTabs = EFL_TABS.slice(4);
  const tabButtons = `
      ${leftTabs.map(tabBtnHtml).join("")}
      <button class="efl-home-btn" id="efl-home-btn" aria-label="Home"><span class="efl-home-ring"></span></button>
      ${rightTabs.map(tabBtnHtml).join("")}
    `;

  detailBody.innerHTML = `
    <div class="efl-sheet">
      <div class="efl-header">
        <span class="efl-callsign">${fp.callsign || "N/A"}</span>
        <span class="efl-route">${fp.originIcao} ${fp.destIcao}</span>
        <span class="efl-meta">${fmtDate(outDate)} ${fmtTime(outDate)} ${fmtTime(inDate)} ${fp.aircraftIcao}</span>
      </div>
      <div class="efl-tab-content" id="efl-tab-content"></div>
    </div>
    <div class="efl-save-bar hidden" id="efl-save-bar">
      <span id="efl-save-status" class="fuel-save-status"></span>
    </div>
    <nav class="efl-tabbar">${tabButtons}</nav>
  `;

  // The embedded home button above takes over navigating back to the home screen for as
  // long as this view is showing, so the app-wide floating one (which would otherwise sit
  // right on top of it) stays hidden until the user leaves via either button.
  homeButton.classList.add("hidden");
  document.getElementById("efl-home-btn").addEventListener("click", goHome);

  const content = document.getElementById("efl-tab-content");

  // Autosave, not a Save button: every keystroke/toggle click anywhere in the current tab's
  // content schedules a debounced save of whichever tab is active (see scheduleAutoSave() and
  // EFL_SAVE_HANDLERS). Wired once here via delegation on the outer container, which survives
  // content.innerHTML being replaced on every tab switch - individual fields never need their
  // own save wiring. Native "input" events cover every text/number field and textarea; the
  // segmented toggles (+/-, CAPT/F-O) and the delay-field clear buttons are plain <button>s
  // that don't fire "input", so those are caught by the click listener instead.
  content.addEventListener("input", scheduleAutoSave);
  content.addEventListener("click", (e) => {
    if (e.target.closest(".fuel-sign-opt, .fuel-choice-opt")) scheduleAutoSave();
  });

  renderEflTab(content, "flightlog", fp);

  for (const btn of detailBody.querySelectorAll(".efl-tab-btn")) {
    btn.addEventListener("click", () => {
      for (const b of detailBody.querySelectorAll(".efl-tab-btn")) b.classList.remove("selected");
      btn.classList.add("selected");
      renderEflTab(content, btn.dataset.tab, fp);
    });
  }
}

// Which save function autosave calls for the currently active tab - tabs with no editable
// data (Waypoints' remaining placeholders, PDF, etc.) simply aren't in here, so nothing fires
// and the status bar stays hidden.
const EFL_SAVE_HANDLERS = {
  flightlog: saveFlightLog,
  fuelfmc: saveFuelFmc,
  waypoints: saveWaypoints,
};

let eflActiveTabId = null;
let eflAutoSaveTimer = null;
const EFL_AUTOSAVE_DEBOUNCE_MS = 600;

// Debounced so a burst of keystrokes (typing a number, say) doesn't fire one request per
// character - waits for a short pause before actually saving.
function scheduleAutoSave() {
  const saveFn = EFL_SAVE_HANDLERS[eflActiveTabId];
  if (!saveFn) return;
  clearTimeout(eflAutoSaveTimer);
  eflAutoSaveTimer = setTimeout(saveFn, EFL_AUTOSAVE_DEBOUNCE_MS);
}

function renderEflTab(content, tabId, fp) {
  eflActiveTabId = tabId;
  clearTimeout(eflAutoSaveTimer);
  const saveBar = document.getElementById("efl-save-bar");
  saveBar.classList.toggle("hidden", !EFL_SAVE_HANDLERS[tabId]);
  const saveStatus = document.getElementById("efl-save-status");
  saveStatus.textContent = "";
  saveStatus.classList.remove("fuel-save-error");

  if (tabId === "flightlog") {
    renderFlightLogTab(content, fp);
  } else if (tabId === "fuelfmc") {
    renderFuelFmcTab(content, fp);
  } else if (tabId === "waypoints") {
    renderWaypointsTab(content, fp);
  } else if (tabId === "weather") {
    renderWeatherTab(content, fp);
  } else if (tabId === "notams") {
    renderNotamsTab(content, fp);
  } else if (tabId === "vp") {
    renderVpTab(content, fp);
  } else if (tabId === "atc") {
    renderAtcTab(content, fp);
  } else if (tabId === "pdf") {
    renderPdfTab(content, fp);
  } else {
    const tab = EFL_TABS.find((t) => t.id === tabId);
    content.innerHTML = `<p class="coming-soon">${tab.label} - coming soon.</p>`;
  }
}

// The PDF tab shows SimBrief's pre-rendered OFP as HTML (GET /api/simbrief/planhtml) instead
// of an embedded PDF viewer - the same document the PDF prints from, already carrying every
// chart/weather image in the right place in each section, just as markup. Works identically on
// desktop and on a tablet's browser, unlike the old PDF-viewer split (WebView2's native viewer
// on desktop vs. a plain download link everywhere else, since Chrome won't render a PDF inside
// an iframe at all).
async function renderPdfTab(content, fp) {
  content.innerHTML = `<p class="coming-soon">Loading...</p>`;

  let html = "";
  try {
    const res = await fetch("/api/simbrief/planhtml", { cache: "no-store" });
    if (res.ok) html = await res.text();
  } catch {
    // Falls through to the "not available" message below.
  }

  if (!html) {
    content.innerHTML = `<p class="coming-soon">No OFP text available for this flight plan.</p>`;
    return;
  }

  const pdfLink = fp.pdfUrl
    ? `<a class="efl-pdf-original-link" href="/api/simbrief/pdf" target="_blank" rel="noopener">Open original PDF &#8599;</a>`
    : "";

  content.innerHTML = `
    <h2 class="efl-section-title">PDF</h2>
    ${pdfLink}
    <div class="efl-pdf-html" id="efl-pdf-html"><div class="efl-pdf-html-inner" id="efl-pdf-html-inner">${html}</div></div>
  `;

  fitPdfHtmlToWidth();
}

// SimBrief's OFP text relies on monospace column alignment (fuel tables, the navlog, etc. are
// space-padded, not real HTML tables) - reflowing it to a narrower window would scramble that
// alignment, so instead the whole block is scaled down uniformly, the same way a print preview
// "zooms to fit" a fixed-size page rather than reformatting it. #efl-pdf-html-inner is sized to
// its own natural (unwrapped) width via CSS width:max-content, so measuring its scrollWidth
// gives the true content width to scale from.
let pdfFitResizeTimer = null;
function schedulePdfHtmlFit() {
  clearTimeout(pdfFitResizeTimer);
  pdfFitResizeTimer = setTimeout(fitPdfHtmlToWidth, 120);
}
// Registered once at module load rather than per-render - cheap to leave attached, and the
// null-check below makes it a no-op whenever the PDF tab isn't the thing currently on screen,
// so there's no per-tab-switch listener to add and remove.
window.addEventListener("resize", schedulePdfHtmlFit);

function fitPdfHtmlToWidth() {
  const outer = document.getElementById("efl-pdf-html");
  const inner = document.getElementById("efl-pdf-html-inner");
  if (!outer || !inner) return;

  // transform doesn't affect layout/intrinsic sizing, only painting - scrollWidth/scrollHeight
  // here are always the content's true unscaled size regardless of a previously applied scale.
  const naturalWidth = inner.scrollWidth;
  const naturalHeight = inner.scrollHeight;
  const availableWidth = outer.clientWidth;
  if (!naturalWidth || !availableWidth) return;

  // Capped at 1 - SimBrief's own font size is already sized to be readable, so a wide desktop
  // window shows it at its natural size rather than blown up and blurry.
  const scale = Math.min(1, availableWidth / naturalWidth);
  inner.style.transform = `scale(${scale})`;
  inner.style.transformOrigin = "top left";
  // transform doesn't shrink the space an element occupies in normal flow, so without this the
  // wrapper would keep the full unscaled height and leave a blank gap below the now-smaller
  // visible content.
  outer.style.height = `${naturalHeight * scale}px`;
}

// Fuel section on the Flight Log tab. Block/Trip+Taxi/Reserves come straight from the
// imported SimBrief OFP (still editable, in case the crew needs to adjust); everything else
// is left blank for the pilot to fill in - no auto-calculation for those yet. Saving writes
// every field to the server, shared by every device on the LAN, and only cleared by a full
// app restart (not by re-importing a flight plan).
async function renderFlightLogTab(content, fp) {
  content.innerHTML = `<p class="coming-soon">Loading...</p>`;

  let saved = null;
  let waypoints = null;
  let fuelFmc = null;
  try {
    const [logRes, wpRes, fmcRes] = await Promise.all([
      fetch("/api/simbrief/flightlog", { cache: "no-store" }),
      fetch("/api/simbrief/waypoints", { cache: "no-store" }),
      fetch("/api/simbrief/fuelfmc", { cache: "no-store" }),
    ]);
    if (logRes.ok) ({ flightLog: saved } = await logRes.json());
    if (wpRes.ok) ({ waypoints } = await wpRes.json());
    if (fmcRes.ok) ({ fuelFmc } = await fmcRes.json());
  } catch {
    // Form still renders with SimBrief's own defaults below.
  }

  const wpActuals = (waypoints && waypoints.actuals) || {};
  const waypointTimes = {
    offBlock: wpActuals.offblock?.time,
    airborne: wpActuals.depicao?.time,
    landed: wpActuals.arrivalicao?.time,
    onBlock: wpActuals.onblock?.time,
    // Departure/Arrival Fuel on the Flight Log tab aren't typed here at all - they mirror
    // the same Off Block/On Block Actual Fuel on Board the pilot already entered on the
    // Waypoints tab, same one-place-to-type-it reasoning as the block times above.
    offBlockFuel: wpActuals.offblock?.fuel ?? null,
    onBlockFuel: wpActuals.onblock?.fuel ?? null,
  };
  const picDiscrFuel = fuelFmc && fuelFmc.picDiscrFuel !== null && fuelFmc.picDiscrFuel !== undefined ? fuelFmc.picDiscrFuel : null;

  content.innerHTML = buildFlightLogTabHtml(fp, saved, waypointTimes, picDiscrFuel);

  // Burn Difference's +/- toggle is computed (see computedSignedField) and disabled, unlike
  // Pilot Flying's below - nothing to wire a click listener to.

  for (const id of ["fuel-pftakeoff", "fuel-pflanding"]) {
    const toggle = document.getElementById(id);
    for (const opt of toggle.querySelectorAll(".fuel-choice-opt")) {
      opt.addEventListener("click", () => setChoiceToggle(toggle, opt.dataset.value));
    }
  }

  recomputeTotals();

  for (let n = 1; n <= 3; n++) {
    autoColonizeTime(document.getElementById(`fuel-delay${n}-time`));
    wireDelayReasonPicker(n);
  }

  autoGrowTextarea(document.getElementById("fuel-captain-remarks"));

  document.getElementById("log-flight-btn").addEventListener("click", () => logFlight(fp));
}

function wireDelayReasonPicker(n) {
  const btn = document.getElementById(`fuel-delay${n}-reason`);
  btn.addEventListener("click", () => {
    openDelayCodePicker(btn.dataset.value, (label) => {
      btn.dataset.value = label;
      btn.textContent = label || "Select reason";
      btn.classList.toggle("delay-reason-btn-empty", !label);
      // The picker lives outside #efl-tab-content (it's appended to <body>), so the
      // delegated autosave listener on that container (see renderEflLoaded) never sees this
      // click - schedule it directly instead.
      scheduleAutoSave();
    });
  });
}

// "11 (PD) - Late check-in, acceptance after deadline" - what both the picker row and the
// button/report end up showing once a code's picked. Codes without a letter (00-05) just
// drop the parenthetical.
function delayCodeLabel(entry) {
  return entry.letter ? `${entry.code} (${entry.letter}) - ${entry.desc}` : `${entry.code} - ${entry.desc}`;
}

// Full-screen list of every Standard IATA Delay Code (see IATA_DELAY_CODES), grouped the
// same way the source table is. Built fresh on open and torn down on close/selection rather
// than kept in the DOM - it's rarely open, and this keeps it out of the way of every other
// tab's markup. onSelect gets the full label string (empty string for none, though there's
// currently no "clear" affordance beyond picking another code).
function openDelayCodePicker(currentValue, onSelect) {
  const overlay = document.createElement("div");
  overlay.className = "delay-picker-overlay";
  overlay.innerHTML = `
    <div class="delay-picker-modal">
      <div class="delay-picker-header">
        <h3>Delay Reason</h3>
        <button type="button" class="delay-picker-close" aria-label="Close">&times;</button>
      </div>
      <input type="text" class="delay-picker-search" placeholder="Search delay codes..." />
      <div class="delay-picker-list">
        ${IATA_DELAY_CODES.map(
          (group) => `
          <div class="delay-picker-group">
            <div class="delay-picker-group-title">${escapeAttr(group.group)}</div>
            ${group.codes
              .map((entry) => {
                const label = delayCodeLabel(entry);
                return `
                <button type="button" class="delay-picker-item" data-value="${escapeAttr(label)}">
                  <span class="delay-picker-item-code">${escapeAttr(entry.letter ? `${entry.code} · ${entry.letter}` : entry.code)}</span>
                  <span class="delay-picker-item-desc">${escapeAttr(entry.desc)}</span>
                </button>`;
              })
              .join("")}
          </div>`
        ).join("")}
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector(".delay-picker-close").addEventListener("click", close);

  for (const item of overlay.querySelectorAll(".delay-picker-item")) {
    item.classList.toggle("selected", item.dataset.value === currentValue);
    item.addEventListener("click", () => {
      onSelect(item.dataset.value);
      close();
    });
  }

  // Filters on both the code/letter and the description; a group left with nothing visible
  // hides its header too rather than leaving an orphaned label above an empty gap.
  const searchInput = overlay.querySelector(".delay-picker-search");
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    for (const group of overlay.querySelectorAll(".delay-picker-group")) {
      let anyVisible = false;
      for (const item of group.querySelectorAll(".delay-picker-item")) {
        const matches = !q || item.textContent.toLowerCase().includes(q);
        item.classList.toggle("hidden", !matches);
        if (matches) anyVisible = true;
      }
      group.classList.toggle("hidden", !anyVisible);
    }
  });

  searchInput.focus();
}

// Fuel/FMC replicates SimBrief's own OFP fuel-plan table (Trip/Min Cont/Altn/Finres/Add Res,
// then Planned T-Off/T-Off/Taxi) for reference - all of that is SimBrief's planning output,
// not something a crew retypes, so it's plain text. Only Block Fuel (what was actually
// uplifted) and Total Fuel (what's actually on board) are real inputs; PIC Discr is derived
// from those two rather than typed.
async function renderFuelFmcTab(content, fp) {
  content.innerHTML = `<p class="coming-soon">Loading...</p>`;

  let saved = null;
  try {
    const res = await fetch("/api/simbrief/fuelfmc", { cache: "no-store" });
    if (res.ok) ({ fuelFmc: saved } = await res.json());
  } catch {
    // Form still renders with SimBrief's own defaults below.
  }

  content.innerHTML = buildFuelFmcTabHtml(fp, saved);

  document.getElementById("fmc-total-fuel").addEventListener("input", recomputeFmcPicDiscr);
  document.getElementById("fmc-block-fuel").addEventListener("input", recomputeFmcPicDiscr);
  recomputeFmcPicDiscr();

  const copyBtn = document.querySelector(".fmc-copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      } catch {
        // Clipboard access can be blocked (permissions, non-HTTPS context, etc.) - the route
        // text is still fully visible to select/copy manually either way.
      }
    });
  }

  // View-only toggle for Operational Impacts (Above/Below, Up/Down, Higher/Lower) - just
  // swaps which side's pre-formatted Trip/Time text is shown, no data to save here.
  for (const toggle of content.querySelectorAll(".fmc-impact-toggle")) {
    const id = toggle.id.replace("-toggle", "");
    const tripEl = document.getElementById(`${id}-trip`);
    const timeEl = document.getElementById(`${id}-time`);
    for (const opt of toggle.querySelectorAll(".fmc-impact-toggle-opt")) {
      opt.addEventListener("click", () => {
        const side = opt.dataset.side;
        toggle.dataset.side = side;
        for (const o of toggle.querySelectorAll(".fmc-impact-toggle-opt")) o.classList.toggle("selected", o === opt);
        tripEl.textContent = `Trip ${tripEl.dataset[`${side}Trip`]}`;
        timeEl.textContent = `Time ${timeEl.dataset[`${side}Time`]}`;
      });
    }
  }

  fmcAtisValues = (saved && saved.departureAtisFields) || {};
  fmcClearanceValues = (saved && saved.departureClearanceFields) || {};
  fmcArrivalValues = (saved && saved.arrivalAtisFields) || {};
  wireAtisClearanceEditor(fp);
}

// Departure ATIS, Departure ATC Clearance, and Arrival ATIS/Alternate ATIS: three collapsed
// summary boxes, each with a "Change" button that opens a shared full-screen editing overlay
// (see openAtisModal/ATIS_MODES). Field values live in these module-level objects while the
// tab is open - reset fresh from the saved entry every time the tab renders, updated only
// when the user hits Done in the editor, and read by saveFuelFmc() alongside everything else
// on this tab. Arrival's also carries an "airport" entry, since unlike the other two its
// airport is editable rather than always the same fixed ICAO.
let fmcAtisValues = {};
let fmcArrivalValues = {};
let fmcClearanceValues = {};

const ATIS_FIELDS = [
  { key: "info", label: "Info" },
  { key: "time", label: "Time", type: "time" },
  { key: "appr", label: "Appr" },
  { key: "rwy", label: "Rwy", type: "runway" },
  { key: "tlOther", label: "TL / Other Info" },
  { key: "cond", label: "Cond", type: "select", options: ["Dry", "Wet", "Snow"] },
  { key: "wind", label: "Wind", type: "slash", slashAt: 3 },
  { key: "vis", label: "Vis", type: "unit", units: ["KM", "SM"] },
  { key: "wx", label: "Wx" },
  { key: "cloud", label: "Cloud" },
  { key: "oat", label: "OAT" },
  { key: "dp", label: "Dew Point" },
  { key: "qnh", label: "QNH" },
  { key: "addInfo", label: "Additional Info" },
];

const CLEARANCE_FIELDS = [
  { key: "callsign", label: "Callsign", auto: true },
  { key: "atisInfo", label: "ATIS Info" },
  { key: "sidTrans", label: "SID / Transition" },
  { key: "flAlt", label: "FL / Alt" },
  { key: "freq", label: "Freq", type: "freq" },
  { key: "squawk", label: "Squawk" },
  { key: "qnh", label: "QNH" },
  { key: "ctot", label: "CTOT" },
  { key: "addInfo", label: "Additional Info" },
];

// One entry per "Change" button on the Fuel/FMC tab, in the same order they appear there -
// Departure ATIS, then Departure ATC Clearance (both happen before/around pushback, so both
// key their airport off the origin and never let it be edited - it's always the departure
// field, full stop), then Arrival ATIS/Alternate ATIS last, since that's not needed until much
// later in the flight. It defaults to the destination but stays editable, since the actual
// arrival could end up being the destination or an alternate depending on how the flight goes.
const ATIS_MODES = {
  atis: {
    title: "Departure ATIS",
    fields: ATIS_FIELDS,
    airportEditable: false,
    defaultAirport: (fp) => fp.originIcao,
    getValues: () => fmcAtisValues,
    textElId: "fmc-atis-text",
  },
  clearance: {
    title: "Departure ATC Clearance",
    fields: CLEARANCE_FIELDS,
    airportEditable: false,
    defaultAirport: (fp) => fp.originIcao,
    getValues: () => fmcClearanceValues,
    textElId: "fmc-clearance-text",
  },
  arrival: {
    title: "Arrival ATIS / Alternate ATIS",
    fields: ATIS_FIELDS,
    airportEditable: true,
    defaultAirport: (fp) => fp.destIcao,
    getValues: () => fmcArrivalValues,
    textElId: "fmc-arrival-text",
  },
};

// Joins whichever fields actually have a value into one line, each as "Label value" -
// Airport is always first (editable modes read it from values.airport, fixed modes always
// use the mode's own default). Empty when nothing's been filled in at all yet.
function compileAtisLine(fp, modeKey) {
  const mode = ATIS_MODES[modeKey];
  const values = mode.getValues();
  const airport = mode.airportEditable ? values.airport || mode.defaultAirport(fp) : mode.defaultAirport(fp);
  const parts = [`Airport ${airport}`];
  for (const f of mode.fields) {
    let v = (values[f.key] ?? "").trim();
    if (v === "" && f.auto && f.key === "callsign") v = fp.callsign || "";
    if (v !== "") parts.push(`${f.label} ${v}`);
  }
  return parts.length > 1 ? parts.join(" | ") : "";
}

// Renders one field's input based on its type - plain text unless the field asks for
// something else. "unit" fields (currently just Vis) are stored as a single "value UNIT"
// string (e.g. "10 KM") even though they're edited as two separate controls, so the rest of
// the code (compileAtisLine, saving) never needs to know they're compound.
function renderAtisFieldInput(f, value) {
  if (f.type === "select") {
    const opts = f.options
      .map((o) => `<option value="${escapeAttr(o)}" ${o === value ? "selected" : ""}>${escapeAttr(o)}</option>`)
      .join("");
    return `<select id="atis-field-${f.key}"><option value=""></option>${opts}</select>`;
  }
  if (f.type === "unit") {
    const [num, unit] = splitUnitValue(value, f.units);
    const opts = f.units.map((u) => `<option value="${escapeAttr(u)}" ${u === unit ? "selected" : ""}>${escapeAttr(u)}</option>`).join("");
    return `
      <span class="atis-field-compound">
        <input type="text" id="atis-field-${f.key}-num" value="${escapeAttr(num)}" />
        <select id="atis-field-${f.key}-unit">${opts}</select>
      </span>`;
  }
  return `<input type="text" id="atis-field-${f.key}" value="${escapeAttr(value)}" />`;
}

function splitUnitValue(value, units) {
  const parts = (value || "").trim().split(/\s+/);
  return [parts[0] || "", units.includes(parts[1]) ? parts[1] : units[0]];
}

// After the field's HTML is in the DOM, wire whatever live-formatting its type needs -
// nothing for plain text/select/unit fields, since those don't reformat as you type.
function wireAtisFieldFormatting(f) {
  if (f.type === "time") autoColonizeTime(document.getElementById(`atis-field-${f.key}`));
  if (f.type === "slash") autoInsertSlash(document.getElementById(`atis-field-${f.key}`), f.slashAt);
  if (f.type === "runway") autoFormatRunway(document.getElementById(`atis-field-${f.key}`));
  // Departure Freq: "119.7" rather than typed with the "." by hand - same after-3-digits
  // split as Wind's "/", just its own separator.
  if (f.type === "freq") autoInsertSeparator(document.getElementById(`atis-field-${f.key}`), ".", 3);
}

function readAtisFieldValue(f) {
  if (f.type === "unit") {
    const num = document.getElementById(`atis-field-${f.key}-num`).value.trim();
    const unit = document.getElementById(`atis-field-${f.key}-unit`).value;
    return num === "" ? "" : `${num} ${unit}`;
  }
  return document.getElementById(`atis-field-${f.key}`).value;
}

function clearAtisField(f) {
  if (f.type === "unit") {
    document.getElementById(`atis-field-${f.key}-num`).value = "";
    document.getElementById(`atis-field-${f.key}-unit`).value = f.units[0];
    return;
  }
  document.getElementById(`atis-field-${f.key}`).value = "";
}

function wireAtisClearanceEditor(fp) {
  const refresh = () => {
    for (const modeKey of Object.keys(ATIS_MODES)) {
      document.getElementById(ATIS_MODES[modeKey].textElId).textContent = compileAtisLine(fp, modeKey);
    }
  };
  refresh();

  for (const btn of document.querySelectorAll(".fmc-atis-change")) {
    btn.addEventListener("click", () => openAtisModal(btn.dataset.target, fp));
  }

  const overlay = document.getElementById("atis-modal-overlay");

  document.getElementById("atis-modal-new").addEventListener("click", () => {
    for (const f of ATIS_MODES[overlay.dataset.mode].fields) clearAtisField(f);
    // Airport is the one thing "New" leaves alone - for the fixed modes there's no field to
    // touch anyway; for Arrival, its current value (default or already-edited) just stays.
  });

  document.getElementById("atis-modal-cancel").addEventListener("click", () => {
    overlay.classList.add("hidden");
  });

  document.getElementById("atis-modal-done").addEventListener("click", () => {
    const mode = ATIS_MODES[overlay.dataset.mode];
    const target = mode.getValues();

    for (const key of Object.keys(target)) delete target[key];
    if (mode.airportEditable) target.airport = document.getElementById("atis-field-airport").value;
    for (const f of mode.fields) target[f.key] = readAtisFieldValue(f);

    overlay.classList.add("hidden");
    refresh();
    saveFuelFmc();
  });
}

// Airport defaults per-mode (see ATIS_MODES) and is only ever editable for Arrival; every
// other field is pre-filled from whatever was saved last, falling back to Callsign's own
// flight-plan default the first time Clearance is opened with nothing saved yet.
function openAtisModal(modeKey, fp) {
  const mode = ATIS_MODES[modeKey];
  const values = mode.getValues();

  document.getElementById("atis-modal-title").textContent = mode.title;

  const airportValue = mode.airportEditable ? values.airport || mode.defaultAirport(fp) : mode.defaultAirport(fp);
  const airportCell = `
    <div class="atis-field">
      <span class="atis-field-label">Airport</span>
      <input type="text" id="atis-field-airport" value="${escapeAttr(airportValue)}" ${mode.airportEditable ? "" : "readonly"} />
    </div>`;

  const cells = mode.fields
    .map((f) => {
      let v = values[f.key] ?? "";
      if (v === "" && f.auto && f.key === "callsign") v = fp.callsign || "";
      return `
        <div class="atis-field">
          <span class="atis-field-label">${escapeAttr(f.label)}</span>
          ${renderAtisFieldInput(f, v)}
        </div>`;
    })
    .join("");

  document.getElementById("atis-modal-grid").innerHTML = airportCell + cells;
  for (const f of mode.fields) wireAtisFieldFormatting(f);

  const overlay = document.getElementById("atis-modal-overlay");
  overlay.dataset.mode = modeKey;
  overlay.classList.remove("hidden");
}

// PIC Discr is whatever's left over once the actual total fuel on board is compared against
// the actual block fuel - blank (not zero) whenever Total Fuel hasn't been entered yet, since
// "no discrepancy" and "not checked yet" shouldn't look the same.
function recomputeFmcPicDiscr() {
  const totalStr = document.getElementById("fmc-total-fuel").value;
  const blockStr = document.getElementById("fmc-block-fuel").value;
  const picDiscr = document.getElementById("fmc-picdiscr-fuel");
  picDiscr.textContent = totalStr === "" || blockStr === "" ? "" : Math.round(Number(totalStr) - Number(blockStr));
}

function fmtMinutesHHMM(minutes) {
  return minutes === null || minutes === undefined ? "" : formatMinutes(Math.round(minutes));
}

// Sums any number of possibly-null minute figures - null only when every input is null, so a
// missing single component (say, no alternate on this flight) doesn't zero out the total.
function sumMinutes(...values) {
  const present = values.filter((v) => v !== null && v !== undefined);
  return present.length === 0 ? null : present.reduce((a, b) => a + b, 0);
}

function buildFuelFmcTabHtml(fp, saved) {
  const isLbs = (fp.fuelUnits || "").toLowerCase().includes("lb");
  const weightUnit = isLbs ? "Lbs" : "Kgs";
  const val = (key, fallback) => (saved && saved[key] !== null && saved[key] !== undefined ? saved[key] : fallback);
  const fmtNum = (v) => (v === null || v === undefined ? "" : Math.round(v));

  const plannedToffTime = fmtMinutesHHMM(
    sumMinutes(fp.timeTripMinutes, fp.timeContingencyMinutes, fp.timeAlternateMinutes, fp.timeFinalReserveMinutes)
  );

  // Plain text, not an input - SimBrief's own planning output, shown for reference only.
  const staticRow = (label, fuelValue, timeValue, arpt) => `
    <tr>
      <td class="fmc-label">${label}</td>
      <td class="fmc-arpt">${escapeAttr(arpt ?? "")}</td>
      <td class="fmc-static">${fmtNum(fuelValue)}</td>
      <td class="fmc-static">${escapeAttr(timeValue ?? "")}</td>
    </tr>`;

  return `
    <h2 class="efl-section-title">Fuel/FMC</h2>
    <table class="fmc-table">
      <thead>
        <tr>
          <th>Fuel (${weightUnit})</th>
          <th>Arpt</th>
          <th>Fuel</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${staticRow("Trip Fuel", fp.fuelTrip, fmtMinutesHHMM(fp.timeTripMinutes))}
        ${staticRow("Min Cont", fp.fuelContingency, fmtMinutesHHMM(fp.timeContingencyMinutes))}
        ${staticRow("Altn", fp.fuelAlternate, fmtMinutesHHMM(fp.timeAlternateMinutes), fp.fuelAlternateIcao)}
        ${staticRow("Finres", fp.fuelFinalReserve, fmtMinutesHHMM(fp.timeFinalReserveMinutes))}
        ${staticRow("Add Res", fp.fuelAdded, fmtMinutesHHMM(fp.timeAddedMinutes))}
        <tr class="fmc-row-spacer"><td colspan="4"></td></tr>
        ${staticRow("Planned T/Off Fuel", fp.fuelPlannedTakeoff, plannedToffTime)}
        ${staticRow("T/Off Fuel", fp.fuelPlannedTakeoff, plannedToffTime)}
        ${staticRow("Taxi", fp.fuelTaxi, fmtMinutesHHMM(fp.timeTaxiMinutes))}
        <tr class="fmc-row-highlight">
          <td class="fmc-label">Block Fuel</td>
          <td class="fmc-arpt"></td>
          <td><input type="number" id="fmc-block-fuel" value="${fmtNum(val("blockFuel", fp.blockFuel))}" /></td>
          <td class="fmc-static">${escapeAttr(plannedToffTime)}</td>
        </tr>
        <tr>
          <td class="fmc-label">PIC Discr</td>
          <td class="fmc-arpt"></td>
          <td class="fmc-static" id="fmc-picdiscr-fuel"></td>
          <td></td>
        </tr>
        <tr>
          <td class="fmc-label">Total Fuel</td>
          <td class="fmc-arpt"></td>
          <td><input type="number" id="fmc-total-fuel" value="${fmtNum(val("totalFuel", null))}" /></td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Flight Level Steps</h2>
    <div class="fmc-steps">${escapeAttr(fp.stepClimbString || "N/A")}</div>
    ${buildFlightInfoPanelHtml(fp, weightUnit)}
    ${buildAlternateRoutesHtml(fp, weightUnit)}
    ${buildOperationalImpactsHtml(fp, weightUnit)}
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Departure ATIS</h2>
    <div class="fmc-atis-box">
      <div class="fmc-atis-text" id="fmc-atis-text"></div>
      <button type="button" class="fmc-atis-change" data-target="atis">Change</button>
    </div>
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Departure ATC Clearance</h2>
    <div class="fmc-atis-box">
      <div class="fmc-atis-text" id="fmc-clearance-text"></div>
      <button type="button" class="fmc-atis-change" data-target="clearance">Change</button>
    </div>
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Arrival ATIS / Alternate ATIS</h2>
    <div class="fmc-atis-box">
      <div class="fmc-atis-text" id="fmc-arrival-text"></div>
      <button type="button" class="fmc-atis-change" data-target="arrival">Change</button>
    </div>
    <div class="atis-modal-overlay hidden" id="atis-modal-overlay">
      <div class="atis-modal">
        <div class="atis-modal-header">
          <span class="atis-modal-title" id="atis-modal-title"></span>
          <div class="atis-modal-actions">
            <button type="button" id="atis-modal-new">New</button>
            <button type="button" id="atis-modal-cancel">Cancel</button>
            <button type="button" id="atis-modal-done">Done</button>
          </div>
        </div>
        <div class="atis-modal-grid" id="atis-modal-grid"></div>
      </div>
    </div>
  `;
}

// "What if" fuel/time deltas from SimBrief's own impacts object - see
// OperationalImpactPair/ParseOperationalImpacts in SimBriefFlightPlan.cs. Each category
// (an altitude step, weight change, or cost index change) is one row; when SimBrief computed
// both directions, an Above/Below-style toggle switches which one's numbers are shown
// instead of listing both as separate rows. When only one direction was computed, that row
// just states which one it is - a toggle with nothing on the other side isn't useful.
function buildOperationalImpactsHtml(fp, weightUnit) {
  const pairs = fp.operationalImpacts || [];
  if (pairs.length === 0) return "";

  const fmtSigned = (v, unit) => {
    if (v === null || v === undefined) return "-";
    const sign = v < 0 ? "M" : "P";
    const padded = String(Math.round(Math.abs(v))).padStart(4, "0");
    return `${sign} ${padded}${unit ? " " + unit : ""}`;
  };

  const rows = pairs
    .map((p, i) => {
      const hasPositive = p.positiveTripDiffWeight != null || p.positiveTimeDiffMinutes != null;
      const hasNegative = p.negativeTripDiffWeight != null || p.negativeTimeDiffMinutes != null;
      const id = `fmc-impact-${i}`;
      const posTrip = fmtSigned(p.positiveTripDiffWeight, weightUnit);
      const negTrip = fmtSigned(p.negativeTripDiffWeight, weightUnit);
      const posTime = fmtSigned(p.positiveTimeDiffMinutes);
      const negTime = fmtSigned(p.negativeTimeDiffMinutes);

      if (hasPositive && hasNegative) {
        return `
          <div class="fmc-impacts-row">
            <span class="fmc-impacts-label">${escapeAttr(p.category)}</span>
            <span class="fmc-impact-toggle" id="${id}-toggle" data-side="positive">
              <button type="button" class="fmc-impact-toggle-opt selected" data-side="positive">${escapeAttr(p.positiveLabel)}</button>
              <button type="button" class="fmc-impact-toggle-opt" data-side="negative">${escapeAttr(p.negativeLabel)}</button>
            </span>
            <span class="fmc-impacts-value" id="${id}-trip" data-positive-trip="${escapeAttr(posTrip)}" data-negative-trip="${escapeAttr(negTrip)}">Trip ${posTrip}</span>
            <span class="fmc-impacts-value" id="${id}-time" data-positive-time="${escapeAttr(posTime)}" data-negative-time="${escapeAttr(negTime)}">Time ${posTime}</span>
          </div>`;
      }

      const label = hasPositive ? p.positiveLabel : p.negativeLabel;
      const tripVal = hasPositive ? posTrip : negTrip;
      const timeVal = hasPositive ? posTime : negTime;
      return `
        <div class="fmc-impacts-row">
          <span class="fmc-impacts-label">${escapeAttr(p.category)} ${escapeAttr(label)}</span>
          <span class="fmc-impacts-value">Trip ${tripVal}</span>
          <span class="fmc-impacts-value">Time ${timeVal}</span>
        </div>`;
    })
    .join("");

  return `
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Operational Impacts</h2>
    <div class="fmc-impacts">${rows}</div>
  `;
}

// One row per candidate alternate - see AlternateRouteInfo/ParseAlternateRoutes in
// SimBriefFlightPlan.cs for how each row is built from SimBrief's alternate_navlog (a
// fix-by-fix navlog per alternate, not a ready-made summary, so this is an approximation:
// distance/fuel are totals across every leg, cruise FL/wind come from whichever leg reaches
// the highest altitude on that diversion).
function buildAlternateRoutesHtml(fp, weightUnit) {
  const routes = fp.alternateRoutes || [];
  if (routes.length === 0) return "";

  const fmtFl = (v) => (v === null || v === undefined ? "-" : `FL${Math.round(v / 100).toString().padStart(3, "0")}`);
  const fmtWind = (dir, spd) =>
    dir === null || dir === undefined || spd === null || spd === undefined
      ? "-"
      : `${String(Math.round(dir)).padStart(3, "0")}/${String(Math.round(spd)).padStart(3, "0")}`;

  const rows = routes
    .map(
      (r) => `
      <tr>
        <td class="fmc-label">${escapeAttr(r.icao)}</td>
        <td class="fmc-static">${r.distanceNm != null ? Math.round(r.distanceNm) : "-"}</td>
        <td class="fmc-static">${fmtFl(r.cruiseAltitudeFt)}</td>
        <td class="fmc-static">${fmtWind(r.windDir, r.windSpd)}</td>
        <td class="fmc-static">${r.timeMinutes != null ? formatMinutes(Math.round(r.timeMinutes)) : "-"}</td>
        <td class="fmc-static">${r.fuelUsed != null ? `${Math.round(r.fuelUsed)} ${weightUnit}` : "-"}</td>
      </tr>`
    )
    .join("");

  return `
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Alternate Routes</h2>
    <table class="fmc-table">
      <thead>
        <tr>
          <th>Arpt</th>
          <th>Dist (nm)</th>
          <th>FL</th>
          <th>Wind</th>
          <th>Time</th>
          <th>Fuel</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// Reference-only flight-plan figures below Flight Level Steps, styled after a real EFB's own
// info panel - a light gray backdrop with each labelled group as its own white card, rather
// than one continuous white sheet like the rest of this tab.
function buildFlightInfoPanelHtml(fp, weightUnit) {
  const fmtWeight = (v) => (v === null || v === undefined ? "-" : `${Math.round(v)} ${weightUnit}`);
  const fmtNum = (v, unit) => (v === null || v === undefined ? "-" : `${Math.round(v)}${unit ? " " + unit : ""}`);
  const fmtSigned = (v) => (v === null || v === undefined ? "-" : `${v > 0 ? "+" : ""}${Math.round(v)}`);
  const fmtWind = (dir, spd) =>
    dir === null || dir === undefined || spd === null || spd === undefined
      ? "-"
      : `${String(Math.round(dir)).padStart(3, "0")}/${String(Math.round(spd)).padStart(3, "0")}`;
  const fmtFl = (v) => (v === null || v === undefined ? "-" : `FL${Math.round(v / 100)
    .toString()
    .padStart(3, "0")}`);

  const group = (labels, values, extra) => `
    <div class="fmc-info-group">
      <div class="fmc-info-row fmc-info-header">${labels.map((l) => `<span>${escapeAttr(l)}</span>`).join("")}</div>
      <div class="fmc-info-row fmc-info-value">${values.map((v) => `<span>${escapeAttr(v)}</span>`).join("")}${extra ?? ""}</div>
    </div>`;

  return `
    <div class="fmc-info-panel">
      ${group(["Origin", "Dest"], [fp.originIcao, fp.destIcao])}
      ${group(["Flt No"], [fp.callsign])}
      ${group(
        ["Route"],
        [fp.atcRoute || "N/A"],
        `<button type="button" class="fmc-copy-btn" data-copy="${escapeAttr(fp.atcRoute || "")}">Copy</button>`
      )}
      ${group(
        ["eZFW", "(MZFW)", "Crz Alt", "Dest Elev"],
        [fmtWeight(fp.estZfw), fmtWeight(fp.maxZfw), fmtFl(fp.cruiseAltitudeFt), fmtNum(fp.destElevationFt, "ft")]
      )}
      ${group(["Reserves", "(Altn)", "Avg W/V"], [fmtWeight(fp.fuelFinalReserve), fp.fuelAlternateIcao || "-", fmtWind(fp.avgWindDir, fp.avgWindSpd)])}
      ${group(["Cost Index", "ISA Dev"], [fmtNum(fp.costIndex), fmtSigned(fp.isaDevC) + (fp.isaDevC != null ? "°C" : "")])}
      ${group(["eTOW", "(MTOW)", "eLW", "(MLW)"], [fmtWeight(fp.estTow), fmtWeight(fp.maxTow), fmtWeight(fp.estLdw), fmtWeight(fp.maxLdw)])}
      ${group(["Gnd Dist", "ePax"], [fmtNum(fp.routeDistanceNm, "nm"), fmtNum(fp.paxCountActual)])}
    </div>
  `;
}

async function saveFuelFmc() {
  const status = document.getElementById("efl-save-status");
  const numVal = (id) => {
    const v = document.getElementById(id).value;
    return v === "" ? null : Number(v);
  };

  const entry = {
    blockFuel: numVal("fmc-block-fuel"),
    totalFuel: numVal("fmc-total-fuel"),
    picDiscrFuel: (() => {
      const t = document.getElementById("fmc-picdiscr-fuel").textContent;
      return t === "" ? null : Number(t);
    })(),
    departureAtisFields: fmcAtisValues,
    departureClearanceFields: fmcClearanceValues,
    arrivalAtisFields: fmcArrivalValues,
  };

  status.classList.remove("fuel-save-error");
  status.textContent = "Saving...";
  try {
    const res = await fetch("/api/simbrief/fuelfmc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    flashSaveStatus(status, res.ok ? "Saved." : "Could not save - try again.", !res.ok);
  } catch {
    flashSaveStatus(status, "Could not save - try again.", true);
  }
}

// Waypoints - one collapsible card per fix on the route (Off Block, the departure ICAO,
// every navlog fix in order, the arrival ICAO, On Block), each with Planned/Estimate/Actual
// rows for Time, Fuel on Board, and Burn (Off Block has no Burn - nothing's been consumed
// yet at that point). Planned comes straight from SimBrief's own figures, unadjusted - it's
// a fixed reference, not a live estimate. Estimate has no data source yet so it's always
// "-". Actual Time and Actual Fuel on Board are typed by the pilot and start blank (never
// pre-filled from SimBrief or the Fuel/FMC tab); Actual Burn is never typed directly - see
// updateWpActualBurn(). Off Block and the two ICAO cards start expanded (they're always
// relevant); every navlog fix starts collapsed, since a long route can have dozens - all of
// them can be toggled either way by the pilot, and that choice isn't saved (resets to these
// defaults on reload).
async function renderWaypointsTab(content, fp) {
  content.innerHTML = `<p class="coming-soon">Loading...</p>`;

  let saved = null;
  try {
    const wpRes = await fetch("/api/simbrief/waypoints", { cache: "no-store" });
    if (wpRes.ok) ({ waypoints: saved } = await wpRes.json());
  } catch {
    // Form still renders with blank defaults below.
  }

  const cards = buildWaypointCardList(fp);
  const actuals = (saved && saved.actuals) || {};

  content.innerHTML = buildWaypointsTabHtml(cards, actuals);

  for (const card of cards) {
    const header = document.getElementById(`wp-${card.id}-header`);
    header.addEventListener("click", () => {
      document.getElementById(`wp-${card.id}`).classList.toggle("wp-card-collapsed");
    });

    const timeEl = document.getElementById(`wp-${card.id}-time`);
    autoColonizeTime(timeEl);
    timeEl.addEventListener("input", () => updateWpTimeDiff(card.id));
    updateWpTimeDiff(card.id);

    const fuelEl = document.getElementById(`wp-${card.id}-fuel`);
    fuelEl.addEventListener("input", () => {
      updateWpNumericDiff(card.id, "fuel");
      // Off Block's Actual Fuel on Board is the baseline every other card's Actual Burn is
      // computed from, so any Actual Fuel on Board edit - this card's or Off Block's - can
      // change every card's Burn.
      for (const c of cards) if (c.hasBurn) updateWpActualBurn(c.id);
    });
    updateWpNumericDiff(card.id, "fuel");
  }

  // Actual Burn is derived, not typed, so it needs its first computation only after every
  // card's Actual Fuel on Board input exists.
  for (const card of cards) {
    if (card.hasBurn) updateWpActualBurn(card.id);
  }

  for (const btn of content.querySelectorAll(".wp-clear-btn")) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // don't let the click bubble up into the card header's collapse toggle
      const target = document.getElementById(btn.dataset.clear);
      target.value = "";
      target.dispatchEvent(new Event("input"));
    });
  }
}

// One entry per card, in display order. Off Block and Departure ICAO's planned Fuel on Board
// come from the Fuel/FMC table's own figures (full block fuel, and planned takeoff fuel
// respectively); each navlog fix and the arrival ICAO get theirs from SimBrief's fix-by-fix
// navlog - all untouched SimBrief numbers. On Block has no clean SimBrief source for
// post-landing taxi-in fuel, so it's left blank. Planned Burn isn't SimBrief's own per-leg
// figure - it's Off Block's planned Fuel on Board minus this card's, so it lines up exactly
// with how Actual Burn is computed (see updateWpActualBurn), making the two comparable.
function buildWaypointCardList(fp) {
  const navlog = fp.navlog || [];
  const offBlockFuel = fp.blockFuel ?? null;
  const plannedBurnFrom = (plannedFuel) =>
    plannedFuel === null || plannedFuel === undefined || offBlockFuel === null || offBlockFuel === undefined
      ? null
      : offBlockFuel - plannedFuel;

  const depFuel = fp.fuelPlannedTakeoff ?? null;
  const cards = [
    {
      id: "offblock",
      title: "Off Block",
      plannedTimeIso: fp.scheduledOutUtc,
      hasBurn: false,
      defaultOpen: true,
      plannedFuel: offBlockFuel,
      plannedBurn: null,
      oat: null,
      windDir: null,
      windSpd: null,
    },
    {
      id: "depicao",
      title: fp.originIcao,
      plannedTimeIso: fp.scheduledOffUtc,
      hasBurn: true,
      defaultOpen: true,
      plannedFuel: depFuel,
      plannedBurn: plannedBurnFrom(depFuel),
      // No navlog fix sits right at the departure airport itself - SimBrief's per-fix
      // OAT/wind only starts at the first fix past the runway - so this card has nothing to
      // show here, same reasoning as its missing Burn source further up.
      oat: null,
      windDir: null,
      windSpd: null,
    },
  ];

  for (let i = 0; i < navlog.length; i++) {
    const fix = navlog[i];
    const plannedTimeIso =
      fp.scheduledOffUtc && fix.timeTotalSeconds != null
        ? new Date(new Date(fp.scheduledOffUtc).getTime() + fix.timeTotalSeconds * 1000).toISOString()
        : null;
    const fixFuel = fix.fuelPlanOnboard ?? null;
    cards.push({
      id: `wpt${i}`,
      title: fix.viaAirway ? `${fix.ident} (${fix.viaAirway})` : fix.ident,
      plannedTimeIso,
      hasBurn: true,
      defaultOpen: false,
      plannedFuel: fixFuel,
      plannedBurn: plannedBurnFrom(fixFuel),
      oat: fix.oat ?? null,
      windDir: fix.windDir ?? null,
      windSpd: fix.windSpd ?? null,
    });
  }

  const lastFix = navlog.length > 0 ? navlog[navlog.length - 1] : null;
  const arrivalFuel = lastFix ? (lastFix.fuelPlanOnboard ?? null) : null;
  cards.push({
    id: "arrivalicao",
    title: fp.destIcao,
    plannedTimeIso: fp.arrivalTimeUtc,
    hasBurn: true,
    defaultOpen: true,
    plannedFuel: arrivalFuel,
    plannedBurn: plannedBurnFrom(arrivalFuel),
    oat: lastFix ? (lastFix.oat ?? null) : null,
    windDir: lastFix ? (lastFix.windDir ?? null) : null,
    windSpd: lastFix ? (lastFix.windSpd ?? null) : null,
  });
  cards.push({
    id: "onblock",
    title: "On Block",
    plannedTimeIso: fp.scheduledInUtc,
    hasBurn: true,
    defaultOpen: true,
    plannedFuel: null,
    plannedBurn: null,
    oat: null,
    windDir: null,
    windSpd: null,
  });

  return cards;
}

// Actual Burn is never typed by the pilot - it's Off Block's Actual Fuel on Board minus this
// card's Actual Fuel on Board, recomputed live off those two inputs and shown in a
// greyed-out, non-editable box. Blank whenever either side hasn't been entered yet.
function updateWpActualBurn(id) {
  const burnEl = document.getElementById(`wp-${id}-burn`);
  if (!burnEl) return;
  const offBlockFuelEl = document.getElementById("wp-offblock-fuel");
  const fuelEl = document.getElementById(`wp-${id}-fuel`);
  const offBlockFuel = offBlockFuelEl.value === "" ? NaN : Number(offBlockFuelEl.value);
  const thisFuel = fuelEl.value === "" ? NaN : Number(fuelEl.value);
  burnEl.value = Number.isNaN(offBlockFuel) || Number.isNaN(thisFuel) ? "" : Math.round(offBlockFuel - thisFuel);
  updateWpNumericDiff(id, "burn", true);
}

// Positive diff (actual later than planned) shows red with a "+"; negative (actual earlier)
// shows green with a "-" - ahead of schedule is good, behind is not; blank whenever either
// side is missing or they match exactly.
function updateWpTimeDiff(id) {
  const timeInput = document.getElementById(`wp-${id}-time`);
  const diffEl = document.getElementById(`wp-${id}-time-diff`);
  const planned = parseHHMM(timeInput.dataset.planned);
  const actual = parseHHMM(timeInput.value);

  diffEl.classList.remove("wp-diff-red", "wp-diff-green");
  if (planned === null || actual === null) {
    diffEl.textContent = "";
    return;
  }

  let diff = actual - planned;
  if (diff > 720) diff -= 1440; // midnight rollover, same reasoning as durationHHMM
  if (diff < -720) diff += 1440;

  if (diff === 0) {
    diffEl.textContent = "";
    return;
  }
  diffEl.textContent = `${diff > 0 ? "+" : "-"}${formatMinutes(Math.abs(diff))}`;
  diffEl.classList.add(diff > 0 ? "wp-diff-red" : "wp-diff-green");
}

// Same idea as updateWpTimeDiff, for Fuel on Board/Burn - shown as a percentage plus the raw
// difference (e.g. "+2.3% | +113"), since a fixed weight difference means very different
// things depending on how much fuel is actually involved. More Fuel on Board than planned is
// green, less is red; for Burn it's the other way around (burning less than planned is
// good), so the caller flips it with invertColor.
function updateWpNumericDiff(id, field, invertColor) {
  const input = document.getElementById(`wp-${id}-${field}`);
  const diffEl = document.getElementById(`wp-${id}-${field}-diff`);
  const planned = Number(input.dataset.planned);
  const actual = input.value === "" ? NaN : Number(input.value);

  diffEl.classList.remove("wp-diff-red", "wp-diff-green");
  if (input.dataset.planned === "" || Number.isNaN(planned) || Number.isNaN(actual)) {
    diffEl.textContent = "";
    return;
  }

  const diff = actual - planned;
  if (diff === 0) {
    diffEl.textContent = "";
    return;
  }
  const pct = planned !== 0 ? (diff / planned) * 100 : 0;
  const sign = diff > 0 ? "+" : "";
  diffEl.textContent = `${sign}${pct.toFixed(1)}% | ${sign}${Math.round(diff)}`;
  const isGreen = invertColor ? diff < 0 : diff > 0;
  diffEl.classList.add(isGreen ? "wp-diff-green" : "wp-diff-red");
}

function buildWaypointsTabHtml(cards, actuals) {
  const fmtHHMM = (isoStr) => {
    if (!isoStr) return "-";
    const d = new Date(isoStr);
    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  };
  const fmtStaticNum = (v) => (v === null || v === undefined ? "-" : Math.round(v));

  // SimBrief only has OAT/wind at actual navlog fixes - Off Block, Departure ICAO, and On
  // Block don't line up with one, so they simply have nothing to show here (see
  // buildWaypointCardList).
  const fmtWx = (oat, windDir, windSpd) => {
    const parts = [];
    if (oat !== null && oat !== undefined) parts.push(`${Math.round(oat)}°C`);
    if (windDir !== null && windDir !== undefined && windSpd !== null && windSpd !== undefined) {
      parts.push(`${String(Math.round(windDir)).padStart(3, "0")}°/${Math.round(windSpd)}KT`);
    }
    return parts.join("  ");
  };

  const numericCell = (id, field, plannedValue, actualValue, readonly) => `
    <span class="wp-input-clear">
      <span class="wp-diff" id="wp-${id}-${field}-diff"></span>
      <span class="wp-input-clear-row">
        <input type="number" id="wp-${id}-${field}" data-planned="${plannedValue === null || plannedValue === undefined ? "" : plannedValue}" value="${actualValue === null || actualValue === undefined ? "" : Math.round(actualValue)}" ${readonly ? "readonly" : ""} />
        ${readonly ? "" : `<button type="button" class="wp-clear-btn" data-clear="wp-${id}-${field}">&times;</button>`}
      </span>
    </span>`;

  const card = (c) => {
    // Actual Fuel on Board starts blank unless the pilot already typed and saved one - it's
    // never pre-filled from Planned or from the Fuel/FMC tab. Actual Burn is left out of the
    // initial render entirely; updateWpActualBurn() fills it in right after the page wires up.
    const actual = actuals[c.id] || {};
    const plannedTimeStr = fmtHHMM(c.plannedTimeIso);
    const actualFuel = actual.fuel;
    const wxStr = fmtWx(c.oat, c.windDir, c.windSpd);

    return `
      <div class="wp-card ${c.defaultOpen ? "" : "wp-card-collapsed"}" id="wp-${c.id}">
        <div class="wp-card-title" id="wp-${c.id}-header">
          <span class="wp-card-chevron">&#9662;</span>
          <span>${escapeAttr(c.title)}</span>
          <span class="wp-card-title-right">
            <span class="wp-card-title-time">${escapeAttr(plannedTimeStr)}</span>
            ${wxStr ? `<span class="wp-card-title-wx">${escapeAttr(wxStr)}</span>` : ""}
          </span>
        </div>
        <div class="wp-card-grid ${c.hasBurn ? "wp-card-grid-4col" : "wp-card-grid-3col"}">
          <span></span>
          <span class="wp-col-label">Time</span>
          <span class="wp-col-label">Fuel on Board</span>
          ${c.hasBurn ? '<span class="wp-col-label">Burn</span>' : ""}

          <span class="wp-row-label">Planned</span>
          <span class="wp-static">${escapeAttr(plannedTimeStr)}</span>
          <span class="wp-static">${fmtStaticNum(c.plannedFuel)}</span>
          ${c.hasBurn ? `<span class="wp-static">${fmtStaticNum(c.plannedBurn)}</span>` : ""}

          <span class="wp-row-label">Estimate</span>
          <span class="wp-static">-</span>
          <span class="wp-static">-</span>
          ${c.hasBurn ? '<span class="wp-static">-</span>' : ""}

          <span class="wp-row-label">Actual</span>
          <span class="wp-input-clear">
            <span class="wp-diff" id="wp-${c.id}-time-diff"></span>
            <span class="wp-input-clear-row">
              <input type="text" id="wp-${c.id}-time" data-planned="${escapeAttr(plannedTimeStr)}" placeholder="00:00" value="${escapeAttr(actual.time || "")}" />
              <button type="button" class="wp-clear-btn" data-clear="wp-${c.id}-time">&times;</button>
            </span>
          </span>
          ${numericCell(c.id, "fuel", c.plannedFuel, actualFuel, false)}
          ${c.hasBurn ? numericCell(c.id, "burn", c.plannedBurn, null, true) : ""}
        </div>
      </div>`;
  };

  return `
    <h2 class="efl-section-title">Waypoints</h2>
    ${cards.map(card).join("")}
  `;
}

async function saveWaypoints() {
  const status = document.getElementById("efl-save-status");

  const actuals = {};
  for (const input of document.querySelectorAll('[id^="wp-"][id$="-time"]')) {
    const id = input.id.replace(/^wp-/, "").replace(/-time$/, "");
    const fuelEl = document.getElementById(`wp-${id}-fuel`);
    const burnEl = document.getElementById(`wp-${id}-burn`);
    const time = input.value;
    const fuel = fuelEl && fuelEl.value !== "" ? Number(fuelEl.value) : null;
    const burn = burnEl && burnEl.value !== "" ? Number(burnEl.value) : null;
    if (time !== "" || fuel !== null || burn !== null) actuals[id] = { time, fuel, burn };
  }

  status.classList.remove("fuel-save-error");
  status.textContent = "Saving...";
  try {
    const res = await fetch("/api/simbrief/waypoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actuals }),
    });
    flashSaveStatus(status, res.ok ? "Saved." : "Could not save - try again.", !res.ok);
  } catch {
    flashSaveStatus(status, "Could not save - try again.", true);
  }
}

// Builds one .wx-chart-wrap - shared markup for every place a single chart/document-page image
// is shown (Weather tab charts, the VP tab, the Documents pager) so the zoom controls and pan
// behavior (see setupChartZoom) only need to be written once. draggable="false" stops the
// browser's own native "drag this image out" ghost from competing with our pan handling.
function chartWrapHtml(src, alt) {
  return `
    <div class="wx-chart-wrap">
      <div class="wx-zoom-controls">
        <button type="button" class="wx-zoom-btn wx-zoom-out" aria-label="Zoom out" disabled>&minus;</button>
        <button type="button" class="wx-zoom-btn wx-zoom-in" aria-label="Zoom in">+</button>
      </div>
      <img class="wx-chart-img" src="${src}" alt="${escapeAttr(alt)}" draggable="false" />
    </div>`;
}

// Wires up the +/- zoom buttons and drag-to-pan (mouse and touch) for one .wx-chart-wrap.
// Called fresh every time a page turns, since each turn replaces the <img> with a brand new
// element - zoom/pan always starts back at the default 1x/centered on a new page rather than
// carrying over, which is the least surprising behavior when the image itself just changed.
//
// Panning only takes over from the page's own swipe-to-turn-page gesture (see the pager setup
// in renderWeatherTab/renderDocumentPages) once actually zoomed in - dragStart() returns false
// at 1x, so the touchstart/touchmove/touchend handlers below never call stopPropagation() in
// that case and the swipe listener on the ancestor .wx-page still sees the gesture normally.
function setupChartZoom(wrapEl) {
  const img = wrapEl.querySelector(".wx-chart-img");
  const zoomInBtn = wrapEl.querySelector(".wx-zoom-in");
  const zoomOutBtn = wrapEl.querySelector(".wx-zoom-out");
  if (!img) return;

  let scale = 1;
  let panX = 0;
  let panY = 0;

  const apply = () => {
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    img.classList.toggle("wx-chart-img-zoomed", scale > 1);
    zoomOutBtn.disabled = scale <= 1;
    zoomInBtn.disabled = scale >= 4;
  };

  zoomInBtn.addEventListener("click", () => {
    scale = Math.min(4, scale * 1.4);
    apply();
  });
  zoomOutBtn.addEventListener("click", () => {
    scale = Math.max(1, scale / 1.4);
    if (scale === 1) {
      panX = 0;
      panY = 0;
    }
    apply();
  });

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startPanX = 0;
  let startPanY = 0;

  const dragStart = (clientX, clientY) => {
    if (scale <= 1) return false;
    dragging = true;
    startX = clientX;
    startY = clientY;
    startPanX = panX;
    startPanY = panY;
    return true;
  };
  const dragMove = (clientX, clientY) => {
    if (!dragging) return;
    panX = startPanX + (clientX - startX);
    panY = startPanY + (clientY - startY);
    apply();
  };
  const dragEnd = () => {
    dragging = false;
  };

  img.addEventListener("mousedown", (e) => {
    if (!dragStart(e.clientX, e.clientY)) return;
    e.preventDefault();
    const onMove = (ev) => dragMove(ev.clientX, ev.clientY);
    const onUp = () => {
      dragEnd();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  });

  wrapEl.addEventListener("touchstart", (e) => {
    if (dragStart(e.touches[0].clientX, e.touches[0].clientY)) e.stopPropagation();
  });
  wrapEl.addEventListener("touchmove", (e) => {
    if (dragging) {
      e.stopPropagation();
      dragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  });
  wrapEl.addEventListener("touchend", (e) => {
    if (dragging) e.stopPropagation();
    dragEnd();
  });

  apply();
}

// Weather - a paged view straight off the imported OFP, nothing saved or editable. Page 1 is
// the raw METAR/TAF/SIGMET text (same content, same order as the OFP PDF's weather page);
// every page after that is one chart image (SigWx pages, then UAD wind charts - the vertical
// profile has its own VP tab instead, see renderVpTab). Only the current page's markup exists
// in the DOM at a time, so switching pages only fetches the one chart image being switched
// to, not all of them at once.
function renderWeatherTab(content, fp) {
  const chartImages = fp.chartImages || [];
  const totalPages = 1 + chartImages.length;
  let currentPage = 0;

  content.innerHTML = `
    <div class="wx-tab">
      <div class="wx-page" id="wx-page"></div>
      <div class="wx-pager">
        <button type="button" id="wx-prev" class="wx-pager-btn" aria-label="Previous page">&#10094;</button>
        <span class="wx-pager-label" id="wx-pager-label"></span>
        <button type="button" id="wx-next" class="wx-pager-btn" aria-label="Next page">&#10095;</button>
      </div>
    </div>
  `;

  const pageEl = document.getElementById("wx-page");
  const labelEl = document.getElementById("wx-pager-label");
  const prevBtn = document.getElementById("wx-prev");
  const nextBtn = document.getElementById("wx-next");

  function renderPage() {
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage === totalPages - 1;
    labelEl.textContent = `Page ${currentPage + 1} of ${totalPages}`;

    if (currentPage === 0) {
      pageEl.innerHTML = buildWeatherTextHtml(fp);
      return;
    }
    const chart = chartImages[currentPage - 1];
    pageEl.innerHTML = `
      <h2 class="efl-section-title">${escapeAttr(chart.name)}</h2>
      ${chartWrapHtml(`/api/simbrief/chart/${currentPage - 1}`, chart.name)}`;
    setupChartZoom(pageEl.querySelector(".wx-chart-wrap"));
  }

  const goTo = (page) => {
    if (page < 0 || page >= totalPages || page === currentPage) return;
    currentPage = page;
    renderPage();
  };
  prevBtn.addEventListener("click", () => goTo(currentPage - 1));
  nextBtn.addEventListener("click", () => goTo(currentPage + 1));

  // Swipe left/right anywhere on the page - ignored if it's more vertical than horizontal
  // (so scrolling a tall weather-text page still works), and if it's too short to be a
  // deliberate swipe.
  let touchStartX = null;
  let touchStartY = null;
  pageEl.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  pageEl.addEventListener("touchend", (e) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    touchStartX = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    goTo(dx < 0 ? currentPage + 1 : currentPage - 1);
  });

  renderPage();
}

// Page 1 of the Weather tab - Destination, Departure, Destination Alternates, Critical ETOPS
// Airports, then FIR/UIR SIGMETs, same order as the OFP PDF's own weather page. Blocks with
// nothing to show (no alternates, no SIGMETs) are left out entirely rather than shown empty.
function buildWeatherTextHtml(fp) {
  const fmtLabel = (icao, iata) => (iata && iata !== "N/A" ? `${icao}/${iata}` : icao);

  const airportBlock = (label, name, metar, taf) => `
    <div class="wx-airport-block">
      <div class="wx-airport-heading">${escapeAttr(label)}&nbsp;&nbsp;${escapeAttr(name)}</div>
      ${metar && metar !== "N/A" ? `<pre class="wx-raw">${escapeAttr(metar)}</pre>` : ""}
      ${taf && taf !== "N/A" ? `<pre class="wx-raw">${escapeAttr(taf)}</pre>` : ""}
    </div>`;

  const altnList = fp.alternateWeather || [];
  const etopsList = fp.etopsWeather || [];
  const sigmets = fp.sigmets || [];

  // Grouped by FIR, first-seen order preserved - matches the OFP PDF's "FIR/UIR:" section,
  // one heading per FIR with all of that FIR's SIGMETs listed underneath.
  const firOrder = [];
  const firGroups = {};
  for (const s of sigmets) {
    if (!firGroups[s.fir]) {
      firGroups[s.fir] = { firName: s.firName, items: [] };
      firOrder.push(s.fir);
    }
    firGroups[s.fir].items.push(s);
  }

  return `
    <h2 class="efl-section-title">Weather</h2>

    <div class="wx-section-title">Destination</div>
    ${airportBlock(fmtLabel(fp.destIcao, fp.destIata), fp.destName, fp.destMetar, fp.destTaf)}

    <div class="wx-section-title">Departure</div>
    ${airportBlock(fmtLabel(fp.originIcao, fp.originIata), fp.originName, fp.origMetar, fp.origTaf)}

    ${
      altnList.length > 0
        ? `<div class="wx-section-title">Destination Alternates</div>
           ${altnList.map((a) => airportBlock(a.icaoIata, a.name, a.metar, a.taf)).join("")}`
        : ""
    }

    ${
      etopsList.length > 0
        ? `<div class="wx-section-title">Critical ETOPS Airports</div>
           ${etopsList.map((a) => airportBlock(a.icaoIata, a.name, a.metar, a.taf)).join("")}`
        : ""
    }

    ${
      firOrder.length > 0
        ? `<div class="wx-section-title">FIR/UIR</div>
           ${firOrder
             .map(
               (fir) => `
             <div class="wx-fir-block">
               <div class="wx-fir-heading">${escapeAttr(fir)} - ${escapeAttr(firGroups[fir].firName)}</div>
               ${firGroups[fir].items.map((s) => `<pre class="wx-raw wx-sigmet">${escapeAttr(s.text)}</pre>`).join("")}
             </div>`
             )
             .join("")}`
        : ""
    }
  `;
}

// VP - just the one vertical profile chart image, proxied through /api/simbrief/vpchart the
// same way the Weather tab's charts are.
function renderVpTab(content, fp) {
  if (!fp.verticalProfileImageUrl) {
    content.innerHTML = `
      <h2 class="efl-section-title">VP</h2>
      <p class="coming-soon">No vertical profile chart available for this flight plan.</p>
    `;
    return;
  }
  content.innerHTML = `
    <h2 class="efl-section-title">VP</h2>
    ${chartWrapHtml("/api/simbrief/vpchart", "Vertical profile")}
  `;
  setupChartZoom(content.querySelector(".wx-chart-wrap"));
}

// ATC - SimBrief's own fully-formatted ICAO flight plan text (the "(FPL-..." block), shown
// verbatim exactly as it'd be filed - nothing parsed or reassembled here.
function renderAtcTab(content, fp) {
  if (!fp.atcFlightPlanText || fp.atcFlightPlanText === "N/A") {
    content.innerHTML = `
      <h2 class="efl-section-title">ATC</h2>
      <p class="coming-soon">No ATC flight plan available for this flight plan.</p>
    `;
    return;
  }
  content.innerHTML = `
    <h2 class="efl-section-title">ATC Flight Plan</h2>
    <pre class="wx-raw atc-flightplan">${escapeAttr(fp.atcFlightPlanText)}</pre>
  `;
}

// NOTAMS - every NOTAM SimBrief pulled in, grouped by airport/FIR into collapsible sections
// (a long route easily has several hundred of these - KJFK/EGTT/etc alone can run into the
// hundreds). Groups start collapsed, and each group's list of entries is only built the first
// time it's expanded rather than all at once, so opening the tab stays cheap regardless of
// how many NOTAMs the route pulled in. The departure/arrival airport's own group is just
// labeled as such - no auto-expanding, no keyword-based flagging, no separate shortlist.
function renderNotamsTab(content, fp) {
  const notams = fp.notams || [];
  if (notams.length === 0) {
    content.innerHTML = `
      <h2 class="efl-section-title">NOTAMS</h2>
      <p class="coming-soon">No NOTAMs for this flight plan.</p>
    `;
    return;
  }

  const groupOrder = [];
  const groups = {};
  for (const n of notams) {
    if (!groups[n.icao]) {
      groups[n.icao] = { name: n.icaoName, items: [] };
      groupOrder.push(n.icao);
    }
    groups[n.icao].items.push(n);
  }

  const notamItemHtml = (n) => `
    <div class="notam-item">
      ${n.notamId ? `<div class="notam-item-id">${escapeAttr(n.notamId)}</div>` : ""}
      <pre class="wx-raw">${escapeAttr(n.text)}</pre>
    </div>`;

  content.innerHTML = `
    <h2 class="efl-section-title">NOTAMS</h2>
    ${groupOrder
      .map((icao, i) => {
        const label =
          icao === fp.originIcao ? "DEPARTURE" : icao === fp.destIcao ? "ARRIVAL" : "";
        return `
      <div class="notam-group notam-group-collapsed" id="notam-group-${i}">
        <div class="notam-group-title" id="notam-group-${i}-header">
          <span class="notam-group-chevron">&#9662;</span>
          <span>${escapeAttr(icao)} - ${escapeAttr(groups[icao].name)}</span>
          ${label ? `<span class="notam-group-leg-badge">${label}</span>` : ""}
          <span class="notam-group-count">${groups[icao].items.length}</span>
        </div>
        <div class="notam-group-body" id="notam-group-${i}-body"></div>
      </div>`;
      })
      .join("")}
  `;

  groupOrder.forEach((icao, i) => {
    const group = document.getElementById(`notam-group-${i}`);
    const headerEl = document.getElementById(`notam-group-${i}-header`);
    const bodyEl = document.getElementById(`notam-group-${i}-body`);
    let built = false;
    headerEl.addEventListener("click", () => {
      if (!built) {
        bodyEl.innerHTML = groups[icao].items.map(notamItemHtml).join("");
        built = true;
      }
      group.classList.toggle("notam-group-collapsed");
    });
  });
}

// Shows a save result, then clears it after a couple of seconds if it was a success - an
// error stays up until the next save attempt, since the user should still see it if they
// glance back later rather than have it silently vanish.
function flashSaveStatus(status, text, isError) {
  status.textContent = text;
  status.classList.toggle("fuel-save-error", isError);
  if (!isError) {
    setTimeout(() => {
      if (status.textContent === text) status.textContent = "";
    }, 2500);
  }
}

// Auto-inserts the ":" as soon as the first 2 digits are typed, so a time field can just be
// typed as "1955" and reads back as "19:55" without the user having to type the colon
// themselves. Reformats from scratch on every keystroke (strip non-digits, cap at 4, split
// 2/2) rather than trying to patch around the cursor - simple, and correct for the common
// case of typing straight through; a manually-typed colon is harmless since it gets stripped
// and then reinserted in the right place anyway.
function autoColonizeTime(input) {
  input.addEventListener("input", () => {
    const digits = input.value.replace(/\D/g, "").slice(0, 4);
    input.value = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
  });
}

// Same idea as autoColonizeTime, generalized to any split position and separator (used for
// Wind - "/" after 3 - and Departure Freq - "." after 3, e.g. typing "1197" reads back as
// "119.7"). No total-length cap unlike the time version, since these fields can reasonably
// keep going after the split (a gust figure, more frequency digits, etc.).
function autoInsertSeparator(input, separator, position) {
  input.addEventListener("input", () => {
    const digits = input.value.replace(/\D/g, "");
    input.value = digits.length > position ? `${digits.slice(0, position)}${separator}${digits.slice(position)}` : digits;
  });
}

function autoInsertSlash(input, position) {
  autoInsertSeparator(input, "/", position);
}

// Rwy's own formatter, not the generic autoInsertSlash above - a runway designator is always
// exactly 2 digits plus an optional L/C/R (e.g. "07R"), and typing multiple runways just runs
// them together ("25L07R" -> "25L/07R"), so the "/" can't simply go in after a fixed digit
// count the way Wind's does. Instead each 2-digit-plus-optional-letter group is its own
// segment: a letter is only accepted right after 1-2 digits (one per segment - a second
// letter, or one with no digits yet, is dropped), and a digit that arrives once a segment
// already has 2 digits (with or without a letter) starts the next segment rather than
// extending this one. Reformats from scratch every keystroke like every other auto-format
// helper here, so backspacing over an auto-inserted "/" collapses back into the previous
// segment for free.
function autoFormatRunway(input) {
  input.addEventListener("input", () => {
    const raw = input.value.toUpperCase().replace(/[^0-9LCR]/g, "");
    const segments = [];
    let current = "";
    let digits = 0;
    let hasLetter = false;
    for (const ch of raw) {
      if (/[0-9]/.test(ch)) {
        if (digits >= 2 || hasLetter) {
          segments.push(current);
          current = ch;
          digits = 1;
          hasLetter = false;
        } else {
          current += ch;
          digits++;
        }
      } else if (digits > 0 && !hasLetter) {
        current += ch;
        hasLetter = true;
      }
      // A letter with no digits yet, or a second letter, has nowhere valid to go - dropped.
    }
    if (current) segments.push(current);
    input.value = segments.join("/");
  });
}

// Grows a textarea to fit whatever's typed into it instead of scrolling or offering a drag
// handle (see .fmc-notes-field textarea's resize:none/overflow:hidden) - resetting height to
// "auto" before reading scrollHeight is what lets it shrink back down again if text is
// deleted, not just grow.
function autoGrowTextarea(textarea) {
  const resize = () => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };
  textarea.addEventListener("input", resize);
  resize();
}

// parseHHMM/formatMinutes/durationHHMM now live in flightlog-report.js (loaded before this
// file - see index.html), shared with the standalone print/flightlog.html page.

// Total Flight/Total Block are always derived from the other four times, never typed
// directly - recomputed live as Off Block/Airborne/Landed/On Block change.
function recomputeTotals() {
  document.getElementById("fuel-totalflight").value = durationHHMM(
    document.getElementById("fuel-airborne").value,
    document.getElementById("fuel-landed").value
  );
  document.getElementById("fuel-totalblock").value = durationHHMM(
    document.getElementById("fuel-offblock").value,
    document.getElementById("fuel-onblock").value
  );
}

function setChoiceToggle(wrapper, value) {
  wrapper.dataset.value = value;
  for (const opt of wrapper.querySelectorAll(".fuel-choice-opt")) {
    opt.classList.toggle("selected", opt.dataset.value === value);
  }
}

function buildFlightLogTabHtml(fp, saved, waypointTimes, picDiscrFuel) {
  const isLbs = (fp.fuelUnits || "").toLowerCase().includes("lb");
  const weightUnit = isLbs ? "Lbs" : "Kgs";
  const volumeUnit = isLbs ? "Gal" : "Lts";
  const fmtNum = (v) => (v === null || v === undefined ? "" : Math.round(v));
  // A saved value (even 0) always wins over the SimBrief default - only fall back when
  // nothing has ever been saved for this field.
  const val = (key, fallback) => (saved && saved[key] !== null && saved[key] !== undefined ? saved[key] : fallback);

  const numField = (id, label, value, unit) => `
    <div class="fuel-field">
      <span class="fuel-label">${label}</span>
      <span class="fuel-box">
        <input type="number" id="fuel-${id}" value="${fmtNum(value)}" />
        ${unit ? `<span class="fuel-unit">${unit}</span>` : ""}
      </span>
    </div>`;

  // Departure Fuel/Arrival Fuel/Burn Off are never typed here - all three follow straight
  // from the Actual Fuel on Board the pilot already entered on the Waypoints tab, so they're
  // greyed out and read-only the same way Total Flight/Total Block are above.
  const computedField = (id, label, value, unit) => `
    <div class="fuel-field">
      <span class="fuel-label">${label}</span>
      <span class="fuel-box fuel-box-readonly">
        <input type="number" id="fuel-${id}" value="${fmtNum(value)}" readonly />
        ${unit ? `<span class="fuel-unit">${unit}</span>` : ""}
      </span>
    </div>`;

  const textField = (id, label, value, placeholder, readonly) => `
    <div class="fuel-field">
      <span class="fuel-label">${label}</span>
      <span class="fuel-box${readonly ? " fuel-box-readonly" : ""}">
        <input type="text" id="fuel-${id}" value="${escapeAttr(value ?? "")}" ${placeholder ? `placeholder="${escapeAttr(placeholder)}"` : ""} ${readonly ? "readonly" : ""} />
      </span>
    </div>`;

  // Total Flight/Total Block are computed, never typed directly - styled muted so that's
  // obvious at a glance.
  const readonlyField = (id, label) => `
    <div class="fuel-field">
      <span class="fuel-label">${label}</span>
      <span class="fuel-box fuel-box-readonly">
        <input type="text" id="fuel-${id}" value="00:00" readonly />
      </span>
    </div>`;

  // Off Block/Airborne/Landed/On Block are no longer typed here - they mirror whatever the
  // pilot entered as Actual Time on the Waypoints tab (Off Block, Departure ICAO, Arrival
  // ICAO, On Block respectively), so there's exactly one place to type a block time.
  const readonlyTimeField = (id, label, value) => `
    <div class="fuel-field">
      <span class="fuel-label">${label}</span>
      <span class="fuel-box fuel-box-readonly">
        <input type="text" id="fuel-${id}" value="${escapeAttr(value || "00:00")}" readonly />
      </span>
    </div>`;

  // Each Delays slot pairs a "00:00" time with a reason picked from the Standard IATA Delay
  // Codes (see IATA_DELAY_CODES/openDelayCodePicker) rather than typed free-text, so every
  // delay logged actually matches a real code. The reason button carries the full selected
  // label in data-value - gatherFlightLogEntry reads that, not textContent, since textContent
  // is just "Select reason" until something's picked.
  const savedDelays = (saved && saved.delays) || [];
  const delayField = (n) => {
    const d = savedDelays[n - 1] || {};
    const reason = d.reason ?? "";
    return `
    <div class="fuel-field">
      <span class="fuel-label">Delay ${n}</span>
      <span class="delay-inputs">
        <button type="button" id="fuel-delay${n}-reason" class="delay-reason-input delay-reason-btn${reason ? "" : " delay-reason-btn-empty"}" data-value="${escapeAttr(reason)}">${escapeAttr(reason) || "Select reason"}</button>
        <input type="text" id="fuel-delay${n}-time" class="delay-time-input" placeholder="00:00" value="${escapeAttr(d.time ?? "")}" />
      </span>
    </div>`;
  };

  // Pilot Flying is always one of two people - a two-way segmented control, same idea as
  // the Burn Difference +/- toggle below but with text options instead of a sign.
  const choiceField = (id, label, options, value) => `
    <div class="fuel-field">
      <span class="fuel-label">${label}</span>
      <span class="fuel-choice-toggle" id="fuel-${id}" data-value="${value}">
        ${options
          .map(
            (opt) => `<button type="button" class="fuel-choice-opt${opt === value ? " selected" : ""}" data-value="${opt}">${opt}</button>`
          )
          .join("")}
      </span>
    </div>`;

  // Burn Difference is computed too (actual Burn Off vs. SimBrief's planned trip
  // burn), so it gets the same read-only +/- toggle as above but disabled, since there's
  // nothing left for the pilot to pick.
  const computedSignedField = (id, label, sign, value, unit) => `
    <div class="fuel-field">
      <span class="fuel-label">${label}</span>
      <span class="fuel-box fuel-box-readonly">
        <span class="fuel-sign-toggle" id="fuel-${id}-sign" data-sign="${sign}">
          <button type="button" class="fuel-sign-opt${sign === "+" ? " selected" : ""}" data-sign="+" disabled>+</button>
          <button type="button" class="fuel-sign-opt${sign === "-" ? " selected" : ""}" data-sign="-" disabled>&minus;</button>
        </span>
        <input type="number" id="fuel-${id}" min="0" value="${fmtNum(value)}" readonly />
        <span class="fuel-unit">${unit}</span>
      </span>
    </div>`;

  // Departure Fuel = Off Block's Actual Fuel on Board, Arrival Fuel = On Block's, Burn Off =
  // the difference between them - all three sourced from the Waypoints tab, never typed here.
  const departureFuel = waypointTimes.offBlockFuel;
  const arrivalFuel = waypointTimes.onBlockFuel;
  const burnOff = departureFuel !== null && arrivalFuel !== null ? departureFuel - arrivalFuel : null;

  // Burn Difference = actual Burn Off vs. SimBrief's own planned trip burn (fp.fuelTrip,
  // the "Trip Fuel" row on the Fuel/FMC tab) - positive when more was burned than planned.
  const plannedBurn = fp.fuelTrip ?? null;
  const burnDiffRaw = burnOff !== null && plannedBurn !== null ? burnOff - plannedBurn : null;
  const burnDiffSign = burnDiffRaw !== null && burnDiffRaw < 0 ? "-" : "+";
  const burnDiff = burnDiffRaw === null ? null : Math.abs(burnDiffRaw);

  // Reason for DISCR Fuel only needs explaining once PIC Discr is a large enough number to
  // matter - greyed out below that, same as every other computed field here. 200kg (or its
  // lbs equivalent, since PIC Discr is already in whatever unit the SimBrief plan uses) is
  // the threshold the user gave; a discrepancy can run either direction, so it's the
  // magnitude that's compared, not the raw signed figure.
  const discrThreshold = isLbs ? 441 : 200; // 200kg ~= 440.92lbs
  const discrReasonEditable = picDiscrFuel !== null && Math.abs(picDiscrFuel) > discrThreshold;

  return `
    <h2 class="efl-section-title">Fuel</h2>
    <div class="fuel-grid">
      ${numField("block", "Block", val("block", fp.blockFuel), weightUnit)}
      ${numField("triptaxi", "Trip+Taxi", val("tripTaxi", fp.tripTaxiFuel), weightUnit)}
      ${numField("reserves", "Reserves", val("reserves", fp.reserveFuel), weightUnit)}
      ${numField("uplift", "Uplift", val("uplift", null), volumeUnit)}
      ${computedField("departure", "Departure", departureFuel, weightUnit)}
      ${computedField("arrival", "Arrival", arrivalFuel, weightUnit)}
      ${computedField("burnoff", "Burn Off", burnOff, weightUnit)}
      ${computedSignedField("burndiff", "Burn Difference", burnDiffSign, burnDiff, weightUnit)}
      ${textField("discrreason", "Reason for DISCR Fuel", val("reasonForDiscrFuel", ""), null, !discrReasonEditable)}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Payload</h2>
    <div class="fuel-grid">
      ${numField("adults", "Adults", val("adults", null), "")}
      ${numField("children", "Children", val("children", null), "")}
      ${numField("infants", "Infants", val("infants", null), "")}
      ${numField("actualpax", "Actual Pax", val("actualPax", fp.paxCountActual), "")}
      ${numField("freight", "Freight", val("freight", fp.cargo), weightUnit)}
      ${numField("placardwt", "Placard WT", val("placardWt", fp.maxTowStruct), weightUnit)}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Times</h2>
    <p class="fuel-times-note">Sourced from the Actual times entered on the Waypoints tab.</p>
    <div class="fuel-grid">
      ${readonlyTimeField("offblock", "Off Block", waypointTimes.offBlock)}
      ${readonlyTimeField("airborne", "Airborne", waypointTimes.airborne)}
      ${readonlyField("totalflight", "Total Flight")}
      ${readonlyTimeField("landed", "Landed", waypointTimes.landed)}
      ${readonlyTimeField("onblock", "On Block", waypointTimes.onBlock)}
      ${readonlyField("totalblock", "Total Block")}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Delays</h2>
    <div class="fuel-grid">
      ${delayField(1)}
      ${delayField(2)}
      ${delayField(3)}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Pilot Flying</h2>
    <div class="fuel-grid">
      ${choiceField("pftakeoff", "PF Takeoff", ["CAPT", "F/O"], val("pfTakeoff", "CAPT"))}
      ${choiceField("pflanding", "PF Landing", ["CAPT", "F/O"], val("pfLanding", "CAPT"))}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Captain Remarks</h2>
    <div class="fmc-notes">
      <label class="fmc-notes-field">
        <textarea id="fuel-captain-remarks" rows="3">${escapeAttr(val("captainRemarks", ""))}</textarea>
      </label>
    </div>
    <div class="fuel-save-row">
      <button id="log-flight-btn" class="log-flight-btn">Log Flight</button>
      <span id="log-flight-status" class="fuel-save-status"></span>
    </div>
  `;
}

// Reads every Flight Log field straight off the DOM - shared by the Save button and by
// Log Flight, which needs the same entry both to persist it and to print it.
function gatherFlightLogEntry() {
  const numVal = (id) => {
    const v = document.getElementById(`fuel-${id}`).value;
    return v === "" ? null : Number(v);
  };

  return {
    block: numVal("block"),
    tripTaxi: numVal("triptaxi"),
    reserves: numVal("reserves"),
    uplift: numVal("uplift"),
    departure: numVal("departure"),
    arrival: numVal("arrival"),
    burnOff: numVal("burnoff"),
    burnDiffSign: document.getElementById("fuel-burndiff-sign").dataset.sign,
    burnDiff: numVal("burndiff"),
    reasonForDiscrFuel: document.getElementById("fuel-discrreason").value,
    adults: numVal("adults"),
    children: numVal("children"),
    infants: numVal("infants"),
    actualPax: numVal("actualpax"),
    freight: numVal("freight"),
    placardWt: numVal("placardwt"),
    offBlock: document.getElementById("fuel-offblock").value,
    airborne: document.getElementById("fuel-airborne").value,
    landed: document.getElementById("fuel-landed").value,
    onBlock: document.getElementById("fuel-onblock").value,
    delays: [1, 2, 3].map((n) => ({
      reason: document.getElementById(`fuel-delay${n}-reason`).dataset.value || "",
      time: document.getElementById(`fuel-delay${n}-time`).value,
    })),
    pfTakeoff: document.getElementById("fuel-pftakeoff").dataset.value,
    pfLanding: document.getElementById("fuel-pflanding").dataset.value,
    captainRemarks: document.getElementById("fuel-captain-remarks").value,
  };
}

async function persistFlightLogEntry(entry) {
  const res = await fetch("/api/simbrief/flightlog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  return res.ok;
}

async function saveFlightLog() {
  const status = document.getElementById("efl-save-status");
  status.classList.remove("fuel-save-error");
  status.textContent = "Saving...";
  try {
    const ok = await persistFlightLogEntry(gatherFlightLogEntry());
    flashSaveStatus(status, ok ? "Saved." : "Could not save - try again.", !ok);
  } catch {
    flashSaveStatus(status, "Could not save - try again.", true);
  }
}

// Log Flight saves the current entry (so the PDF matches what's persisted), then asks the
// server to build and print it. The actual PDF write happens on whichever PC is running the
// desktop app - its dedicated print WebView2 renders print/flightlog.html (which fetches fp +
// this same saved entry itself) off-screen and writes straight to that PC's own Documents\
// RealEFB Documents\FlightLogs (see MainForm.PrintFlightLogAsync) - not necessarily the device
// that pressed the button. That's what makes this work the same from a LAN tablet as from the
// desktop app itself: it's just an HTTP request either way, nothing here needs
// window.chrome.webview specifically anymore. buildFlightLogReportHtml (used by that page, not
// this one) now lives in flightlog-report.js for exactly that reason - the tablet's browser
// never renders the report at all, only the PC's own print WebView2 does.
async function logFlight(fp) {
  const status = document.getElementById("log-flight-status");
  status.classList.remove("fuel-save-error");

  status.textContent = "Saving...";
  const entry = gatherFlightLogEntry();
  const ok = await persistFlightLogEntry(entry);
  if (!ok) {
    status.textContent = "Could not save - try again.";
    status.classList.add("fuel-save-error");
    return;
  }

  status.textContent = "Saving PDF...";
  try {
    const res = await fetch("/api/flightlog/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestedName: `${fp.callsign}-FlightLog` }),
    });
    if (res.ok) {
      status.classList.remove("fuel-save-error");
      status.textContent = "Saved to Documents\\RealEFB Documents\\FlightLogs";
      setTimeout(() => {
        if (status.textContent.startsWith("Saved to")) status.textContent = "";
      }, 4000);
    } else {
      const body = await res.json().catch(() => ({}));
      status.classList.add("fuel-save-error");
      status.textContent = `Could not save PDF: ${body.detail || body.title || "unknown error"}`;
    }
  } catch {
    status.classList.add("fuel-save-error");
    status.textContent = "Could not reach the desktop app to save the PDF.";
  }
}

// One retractable topic in Settings - collapsed by default (see renderSettings) so the whole
// screen reads as a clean list of headings rather than every field for every topic at once.
function settingsSectionHtml(id, title, bodyHtml) {
  return `
    <div class="settings-section settings-section-collapsed" id="settings-section-${id}">
      <div class="settings-section-header" data-section="${id}">
        <span class="settings-section-chevron">&#9662;</span>
        <span class="settings-section-title">${escapeAttr(title)}</span>
      </div>
      <div class="settings-section-body">${bodyHtml}</div>
    </div>`;
}

async function renderSettings() {
  detailBody.innerHTML = `<p class="coming-soon">Loading...</p>`;

  let port = 5150;
  let simBriefId = "";
  let sayIntentionsEnabled = false;
  let sayIntentionsApiCode = "";
  let vptEnabled = false;
  let vptDeveloperKey = "";
  let vptEmail = "";
  let vptPassword = "";
  let dispatchDataSource = "sayintentions";
  let interfaces = [];
  try {
    const [settingsRes, ifRes] = await Promise.all([
      fetch("/api/settings", { cache: "no-store" }),
      fetch("/api/network/interfaces", { cache: "no-store" }),
    ]);
    if (settingsRes.ok) {
      const s = await settingsRes.json();
      ({
        port,
        simBriefId,
        sayIntentionsEnabled,
        sayIntentionsApiCode,
        vptEnabled,
        vptDeveloperKey,
        vptEmail,
        vptPassword,
        dispatchDataSource,
      } = s);
      enabledApps = s.enabledApps || {};
      webAppsState = s.webApps || [];
    }
    if (ifRes.ok) interfaces = await ifRes.json();
  } catch {
    // Form still renders with defaults below - each section's own save button will surface
    // any real problem.
  }

  const ipRows = interfaces.length
    ? interfaces
        .map(
          (i) => `
        <div class="settings-ip-row">
          <span class="settings-ip-name">${i.name}</span>
          <span class="settings-ip-url">http://${i.address}:${port}</span>
        </div>`
        )
        .join("")
    : `<p class="settings-hint">No network adapters detected.</p>`;

  const currentWallpaper = document.body.dataset.wallpaper || "sky";
  const wallpaperSwatches = WALLPAPERS.map(
    (w) => `
      <button class="settings-swatch ${w.id === currentWallpaper ? "selected" : ""}"
              data-wallpaper="${w.id}" aria-label="${w.label}">
        <span class="settings-swatch-preview" data-preview="${w.id}"></span>
        <span class="settings-swatch-label">${w.label}</span>
      </button>`
  ).join("");

  const webServerBody = `
    <label class="settings-label" for="settings-port">Server port</label>
    <div class="settings-row">
      <input id="settings-port" type="number" min="1" max="65535" value="${port}" />
      <button id="settings-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-status" class="settings-hint"></p>
    <span class="settings-label settings-label-spaced">Local IP address (open this on your tablet)</span>
    ${ipRows}
  `;

  const backgroundBody = `<div class="settings-swatch-grid">${wallpaperSwatches}</div>`;

  const simBriefBody = `
    <label class="settings-label" for="settings-simbrief-id">SimBrief username or pilot ID</label>
    <input id="settings-simbrief-id" type="text" placeholder="e.g. jdoe123" value="${escapeAttr(simBriefId)}" />
    <div class="settings-row settings-row-spaced">
      <button id="settings-simbrief-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-simbrief-status" class="settings-hint"></p>
  `;

  // Every app's on/off switch in one place, rather than each app's own topic carrying its own -
  // Settings itself is deliberately absent, since switching it off would leave no way back in.
  const appsBody = `
    <p class="settings-hint">Choose which apps appear on the home screen.</p>
    ${APPS.map((a) => toggleSwitchHtml(`settings-app-${a.id}`, appEnabled(a.id), a.label)).join("")}
    <div class="settings-row settings-row-spaced">
      <button id="settings-apps-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-apps-status" class="settings-hint"></p>
  `;

  const dispatchBody = `
    <label class="settings-label">Data source</label>
    <div class="settings-segmented" id="settings-dispatch-source">
      <button type="button" class="settings-segmented-btn ${dispatchDataSource === "vatsim" ? "" : "selected"}" data-value="sayintentions">SayIntentions.AI</button>
      <button type="button" class="settings-segmented-btn ${dispatchDataSource === "vatsim" ? "selected" : ""}" data-value="vatsim">VATSIM</button>
    </div>
    <p class="settings-hint">SayIntentions.AI needs the API code below and adds gate requests. VATSIM needs no account - it's public network data - but has no gate feature, and only has an ATIS when a real controller is online for that airport.</p>
    <div class="settings-row settings-row-spaced">
      <button id="settings-dispatch-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-dispatch-status" class="settings-hint"></p>
  `;

  const sayIntentionsBody = `
    ${toggleSwitchHtml("settings-sayintentions-enabled", sayIntentionsEnabled, "Enable SayIntentions.AI integration")}
    <p class="settings-hint">Used by the Dispatch app when its data source (in the "Dispatch" section above) is set to SayIntentions.AI.</p>
    <label class="settings-label settings-label-spaced" for="settings-sayintentions-code">SayIntentions.AI API code</label>
    ${passwordFieldHtml("settings-sayintentions-code", sayIntentionsApiCode, "Paste your API code")}
    <div class="settings-row settings-row-spaced">
      <button id="settings-sayintentions-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-sayintentions-status" class="settings-hint"></p>
  `;

  const vptBody = `
    ${toggleSwitchHtml("settings-vpt-enabled", vptEnabled, "Enable Virtual Performance Tool integration")}
    <label class="settings-label settings-label-spaced" for="settings-vpt-devkey">Virtual Performance Tool developer key</label>
    ${passwordFieldHtml("settings-vpt-devkey", vptDeveloperKey, "Paste your VPT developer key")}
    <label class="settings-label settings-label-spaced" for="settings-vpt-email">VPT account email</label>
    <input id="settings-vpt-email" type="text" placeholder="you@example.com" value="${escapeAttr(vptEmail)}" />
    <label class="settings-label settings-label-spaced" for="settings-vpt-password">VPT account password</label>
    ${passwordFieldHtml("settings-vpt-password", vptPassword, "Enter your VPT account password")}
    <div class="settings-row settings-row-spaced">
      <button id="settings-vpt-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-vpt-status" class="settings-hint">Used by the Takeoff Performance calculator to sign in to Virtual Performance Tool.</p>
  `;

  detailBody.innerHTML = `
    <button id="settings-run-wizard" class="settings-wizard-btn">Run Setup Wizard</button>
    ${settingsSectionHtml("apps", "Apps", appsBody)}
    ${settingsSectionHtml("webapps", "Website Apps", webAppsSectionBodyHtml())}
    ${settingsSectionHtml("webserver", "Web Server", webServerBody)}
    ${settingsSectionHtml("background", "Background", backgroundBody)}
    ${settingsSectionHtml("simbrief", "SimBrief", simBriefBody)}
    ${settingsSectionHtml("dispatch", "Dispatch", dispatchBody)}
    ${settingsSectionHtml("sayintentions", "SayIntentions.AI", sayIntentionsBody)}
    ${settingsSectionHtml("vpt", "Virtual Performance Tool", vptBody)}
  `;

  document.getElementById("settings-run-wizard").addEventListener("click", startWizard);

  // Each section header toggles just its own body - independent, so opening one doesn't
  // close another.
  for (const header of detailBody.querySelectorAll(".settings-section-header")) {
    header.addEventListener("click", () => {
      document.getElementById(`settings-section-${header.dataset.section}`).classList.toggle("settings-section-collapsed");
    });
  }

  document.getElementById("settings-save").addEventListener("click", saveWebServer);
  document.getElementById("settings-apps-save").addEventListener("click", saveApps);
  wireWebAppsSection();
  document.getElementById("settings-simbrief-save").addEventListener("click", saveSimBrief);
  document.getElementById("settings-dispatch-save").addEventListener("click", saveDispatch);
  document.getElementById("settings-sayintentions-save").addEventListener("click", saveSayIntentions);
  document.getElementById("settings-vpt-save").addEventListener("click", saveVpt);
  wirePasswordEyeToggles(detailBody);

  for (const btn of detailBody.querySelectorAll(".settings-segmented-btn")) {
    btn.addEventListener("click", () => {
      for (const b of btn.parentElement.querySelectorAll(".settings-segmented-btn")) {
        b.classList.toggle("selected", b === btn);
      }
    });
  }

  for (const btn of detailBody.querySelectorAll(".settings-swatch")) {
    btn.addEventListener("click", () => {
      const id = btn.dataset.wallpaper;
      document.body.dataset.wallpaper = id;
      try {
        localStorage.setItem("realefb.wallpaper", id);
      } catch {
        // Private browsing / storage disabled - the choice just won't survive a reload.
      }
      for (const s of detailBody.querySelectorAll(".settings-swatch")) {
        s.classList.toggle("selected", s === btn);
      }
    });
  }
}

async function saveWebServer() {
  const portInput = document.getElementById("settings-port");
  const status = document.getElementById("settings-status");
  const newPort = parseInt(portInput.value, 10);

  if (!Number.isInteger(newPort) || newPort < 1 || newPort > 65535) {
    status.textContent = "Enter a port between 1 and 65535.";
    status.classList.add("settings-error");
    return;
  }

  status.classList.remove("settings-error");
  status.textContent = "Saving...";
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ port: newPort }),
    });
    if (res.ok) {
      status.textContent = "Saved. Restart RealEFB for the new port to take effect.";
    } else {
      const body = await res.json().catch(() => ({}));
      status.textContent = body.error || "Could not save - try again.";
      status.classList.add("settings-error");
    }
  } catch {
    status.textContent = "Could not save - try again.";
    status.classList.add("settings-error");
  }
}

// Posts every app's switch position together (the endpoint replaces the whole map), then
// updates the in-memory copy so the home screen is already correct when the user heads back -
// refreshTiles() re-fetches anyway, this just avoids a visible flicker in between.
async function saveApps() {
  const status = document.getElementById("settings-apps-status");
  status.classList.remove("settings-error");
  status.textContent = "Saving...";

  const next = {};
  for (const app of APPS) {
    next[app.id] = document.getElementById(`settings-app-${app.id}`).checked;
  }

  try {
    const res = await fetch("/api/settings/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabledApps: next }),
    });
    if (res.ok) enabledApps = next;
    status.textContent = res.ok ? "Saved." : "Could not save - try again.";
    if (!res.ok) status.classList.add("settings-error");
  } catch {
    status.textContent = "Could not save - try again.";
    status.classList.add("settings-error");
  }
}

// One row in Settings > Website Apps' list - a small icon (uploaded, or the generic globe
// fallback - see ICONS.webapp), name + URL, and Edit/Delete. Index-based rather than id-based
// lookups (data-index into webAppsState) since that's simpler than re-finding an entry by id
// every time, and the list is always rebuilt from webAppsState right after any change anyway.
function webAppRowHtml(w, idx) {
  const iconHtml = w.icon ? `<img src="${escapeAttr(w.icon)}" alt="" />` : ICONS.webapp;
  return `
    <div class="webapp-row">
      <span class="webapp-row-icon">${iconHtml}</span>
      <span class="webapp-row-info">
        <span class="webapp-row-name">${escapeAttr(w.name)}</span>
        <span class="webapp-row-url">${escapeAttr(w.url)}</span>
      </span>
      <button type="button" class="webapp-row-btn webapp-row-edit" data-index="${idx}" aria-label="Edit">&#9998;</button>
      <button type="button" class="webapp-row-btn webapp-row-delete" data-index="${idx}" aria-label="Delete">&#128465;</button>
    </div>`;
}

// Rebuilt from webAppsState on every render/change (see refreshWebAppsSection) rather than
// patched in place - the list is short enough that there's no real cost to it, and it keeps
// the row markup and webAppsState from ever drifting apart.
function webAppsSectionBodyHtml() {
  return `
    <p class="settings-hint">Add any website as its own home-screen app - embedded in the app on the desktop, opened in a new tab on a tablet's browser.</p>
    <div class="webapp-list" id="webapp-list">
      ${webAppsState.length ? webAppsState.map(webAppRowHtml).join("") : '<p class="settings-hint">No website apps yet.</p>'}
    </div>
    <div class="settings-row settings-row-spaced">
      <button type="button" id="webapp-add-btn" class="settings-save-btn">+ Add Website App</button>
    </div>
  `;
}

// Wires the Add/Edit/Delete buttons currently in the DOM - called both right after
// renderSettings() builds the section the first time and every time refreshWebAppsSection()
// replaces just this section's body afterward.
function wireWebAppsSection() {
  document.getElementById("webapp-add-btn").addEventListener("click", () => openWebAppEditor(null));
  for (const btn of detailBody.querySelectorAll(".webapp-row-edit")) {
    btn.addEventListener("click", () => openWebAppEditor(webAppsState[Number(btn.dataset.index)]));
  }
  for (const btn of detailBody.querySelectorAll(".webapp-row-delete")) {
    btn.addEventListener("click", () => deleteWebApp(Number(btn.dataset.index)));
  }
}

// Replaces just the Website Apps section's own body after an add/edit/delete, rather than
// re-running the whole renderSettings() - that would re-fetch and re-collapse every other
// section too, losing whatever the pilot was doing elsewhere on the screen for no reason.
function refreshWebAppsSection() {
  const body = document.querySelector("#settings-section-webapps .settings-section-body");
  if (!body) return; // navigated off Settings entirely before this finished
  body.innerHTML = webAppsSectionBodyHtml();
  wireWebAppsSection();
}

// Website Apps saves its whole list at once (see POST /api/settings/webapps in Program.cs),
// same wholesale-replace approach Settings > Apps uses above - simpler than separate per-item
// endpoints for a list this short. Returns whether it actually saved; webAppsState is synced to
// whatever the server actually kept (an oversized icon gets dropped server-side, say), not just
// assumed to match what was sent.
async function persistWebApps() {
  try {
    const res = await fetch("/api/settings/webapps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webApps: webAppsState }),
    });
    if (!res.ok) return false;
    const body = await res.json();
    webAppsState = body.webApps || webAppsState;
    return true;
  } catch {
    return false;
  }
}

async function deleteWebApp(idx) {
  webAppsState.splice(idx, 1);
  await persistWebApps();
  refreshWebAppsSection();
  refreshTiles();
}

// Add/Edit modal for one Website App - the same form either way, prefilled from `existing`
// (a live reference into webAppsState) when editing, blank when adding. The icon is read
// client-side via FileReader into a data URL and held only in this closure until Save actually
// posts the whole list - Cancel never touches webAppsState, so it truly discards anything
// picked. Full-screen rather than an inline expanding row, same reasoning as the ATIS editor/
// delay code picker elsewhere in the app: three fields including a file picker is more than a
// row has room for.
function openWebAppEditor(existing) {
  const isEdit = !!existing;
  let iconDataUrl = existing ? existing.icon || null : null;

  const overlay = document.createElement("div");
  overlay.className = "webapp-editor-overlay";
  overlay.innerHTML = `
    <div class="webapp-editor">
      <div class="webapp-editor-header">
        <h3>${isEdit ? "Edit Website App" : "Add Website App"}</h3>
        <div class="webapp-editor-actions">
          <button type="button" class="webapp-editor-cancel">Cancel</button>
          <button type="button" class="webapp-editor-save">Save</button>
        </div>
      </div>
      <div class="webapp-editor-body">
        ${
          isEdit
            ? ""
            : `
        <div class="webapp-quickadd-row">
          ${WEBSITE_APP_QUICK_ADD.map(
            (q) => `<button type="button" class="webapp-quickadd-btn" data-quickadd="${q.id}">${ICONS[q.icon]}${escapeAttr(q.name)}</button>`
          ).join("")}
        </div>`
        }
        <label class="webapp-editor-label" for="webapp-editor-name">Name</label>
        <input id="webapp-editor-name" type="text" placeholder="e.g. Navigraph Charts" value="${escapeAttr(existing?.name ?? "")}" />
        <label class="webapp-editor-label webapp-editor-label-spaced" for="webapp-editor-url">URL</label>
        <input id="webapp-editor-url" type="text" placeholder="https://" value="${escapeAttr(existing?.url ?? "")}" />
        <label class="webapp-editor-label webapp-editor-label-spaced">Icon (optional)</label>
        <div class="webapp-editor-icon-row">
          <span class="webapp-editor-icon-preview" id="webapp-editor-icon-preview">${
            iconDataUrl ? `<img src="${escapeAttr(iconDataUrl)}" alt="" />` : ICONS.webapp
          }</span>
          <label class="webapp-editor-icon-pick">
            Choose Image
            <input id="webapp-editor-icon-file" type="file" accept="image/*" />
          </label>
          <button type="button" id="webapp-editor-icon-remove" ${iconDataUrl ? "" : "disabled"}>Remove</button>
        </div>
        <p class="webapp-editor-hint">Only saved on this PC - never bundled with RealEFB itself, so a site's own logo is never shipped or shared without its permission.</p>
        <p id="webapp-editor-status" class="fuel-save-status"></p>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector(".webapp-editor-cancel").addEventListener("click", close);

  const preview = overlay.querySelector("#webapp-editor-icon-preview");
  const removeBtn = overlay.querySelector("#webapp-editor-icon-remove");
  overlay.querySelector("#webapp-editor-icon-file").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      iconDataUrl = reader.result;
      preview.innerHTML = `<img src="${escapeAttr(iconDataUrl)}" alt="" />`;
      removeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  });
  removeBtn.addEventListener("click", () => {
    iconDataUrl = null;
    preview.innerHTML = ICONS.webapp;
    removeBtn.disabled = true;
    overlay.querySelector("#webapp-editor-icon-file").value = "";
  });

  // Quick-add - just pre-fills Name/URL/icon with one preset's values, same as typing them in
  // by hand; nothing about Save below needs to know a preset was used at all.
  for (const btn of overlay.querySelectorAll(".webapp-quickadd-btn")) {
    btn.addEventListener("click", () => {
      const preset = WEBSITE_APP_QUICK_ADD.find((q) => q.id === btn.dataset.quickadd);
      if (!preset) return;
      overlay.querySelector("#webapp-editor-name").value = preset.name;
      overlay.querySelector("#webapp-editor-url").value = preset.url;
      iconDataUrl = preset.logo;
      preview.innerHTML = `<img src="${escapeAttr(iconDataUrl)}" alt="" />`;
      removeBtn.disabled = false;
    });
  }

  overlay.querySelector(".webapp-editor-save").addEventListener("click", async () => {
    const status = overlay.querySelector("#webapp-editor-status");
    const name = overlay.querySelector("#webapp-editor-name").value.trim();
    const url = overlay.querySelector("#webapp-editor-url").value.trim();
    if (!name || !url) {
      status.textContent = "Name and URL are both required.";
      status.classList.add("fuel-save-error");
      return;
    }

    if (isEdit) {
      existing.name = name;
      existing.url = url;
      existing.icon = iconDataUrl;
    } else {
      const id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : `webapp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      webAppsState.push({ id, name, url, icon: iconDataUrl });
    }

    status.classList.remove("fuel-save-error");
    status.textContent = "Saving...";
    const ok = await persistWebApps();
    if (!ok) {
      status.textContent = "Could not save - try again.";
      status.classList.add("fuel-save-error");
      return;
    }

    close();
    refreshWebAppsSection();
    refreshTiles();
  });
}

async function saveSimBrief() {
  const status = document.getElementById("settings-simbrief-status");
  status.classList.remove("settings-error");
  status.textContent = "Saving...";
  try {
    const res = await fetch("/api/settings/simbrief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simBriefId: document.getElementById("settings-simbrief-id").value }),
    });
    status.textContent = res.ok ? "Saved." : "Could not save - try again.";
    if (!res.ok) status.classList.add("settings-error");
  } catch {
    status.textContent = "Could not save - try again.";
    status.classList.add("settings-error");
  }
}

async function saveDispatch() {
  const status = document.getElementById("settings-dispatch-status");
  status.classList.remove("settings-error");
  status.textContent = "Saving...";
  try {
    const selected = document.querySelector("#settings-dispatch-source .settings-segmented-btn.selected");
    const res = await fetch("/api/settings/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataSource: selected ? selected.dataset.value : "sayintentions" }),
    });
    status.textContent = res.ok ? "Saved." : "Could not save - try again.";
    if (!res.ok) status.classList.add("settings-error");
  } catch {
    status.textContent = "Could not save - try again.";
    status.classList.add("settings-error");
  }
}

async function saveSayIntentions() {
  const status = document.getElementById("settings-sayintentions-status");
  status.classList.remove("settings-error");
  status.textContent = "Saving...";
  try {
    const res = await fetch("/api/settings/sayintentions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled: document.getElementById("settings-sayintentions-enabled").checked,
        sayIntentionsApiCode: document.getElementById("settings-sayintentions-code").value,
      }),
    });
    status.textContent = res.ok ? "Saved." : "Could not save - try again.";
    if (!res.ok) status.classList.add("settings-error");
  } catch {
    status.textContent = "Could not save - try again.";
    status.classList.add("settings-error");
  }
}

async function saveVpt() {
  const status = document.getElementById("settings-vpt-status");
  status.classList.remove("settings-error");
  status.textContent = "Saving...";
  try {
    const res = await fetch("/api/settings/vpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled: document.getElementById("settings-vpt-enabled").checked,
        vptDeveloperKey: document.getElementById("settings-vpt-devkey").value,
        vptEmail: document.getElementById("settings-vpt-email").value,
        // Blank means "leave the saved password alone" - see /api/settings/vpt.
        vptPassword: document.getElementById("settings-vpt-password").value,
      }),
    });
    status.textContent = res.ok ? "Saved." : "Could not save - try again.";
    if (!res.ok) status.classList.add("settings-error");
  } catch {
    status.textContent = "Could not save - try again.";
    status.classList.add("settings-error");
  }
}

// ---------------------------------------------------------------------------------------
// CURRENTLY UNUSED. The VPT Performance Calculator app now just opens VPT's own web
// calculator (see APPS), so nothing calls renderVptTakeoff any more. Everything from here to
// renderEfl below - along with the /api/vpt/* endpoints in Program.cs and the Virtual
// Performance Tool section in Settings - is kept intact rather than deleted because the switch
// to the website was explicitly a "for now" move, and VPT's own API had an unrelated blocker
// (its /api endpoint 301-redirects POSTs, corrupting the login body) that may yet get fixed.
// Delete this block if the native calculator isn't coming back.
// ---------------------------------------------------------------------------------------
// The TKO Dispatch takeoff performance calculator, backed by the Virtual Performance Tool API.
// Per VPT's own documented Aircraft API, aircraft data is loaded in two stages: press
// "Authenticate VPT" to log in and fetch the account's whole aircraft catalog (POST
// /api/vpt/authenticate), then pick one aircraft from the resulting list to load that profile's
// full data - weight limits, calculation limits, and the FLAP/RTG/COND/A-I option lists (POST
// /api/vpt/aircraft) - which rebuilds those dropdowns and the limits panel to match exactly
// what that aircraft allows. Only once an aircraft is loaded does Calculate (POST
// /api/vpt/takeoff) become available. The airport field is pre-filled from the loaded SimBrief
// flight plan's origin ONLY if one happens to already be loaded, and stays fully editable - the
// calculator never requires a flight plan to be loaded to be used.
let vptAircraftCatalog = []; // flat list of {file, userRegistration, virtualAirline, label} after a successful Authenticate
let vptSelectedAircraft = null; // the "aircraft" object from /api/vpt/aircraft's response, once one is picked

async function renderVptTakeoff() {
  detailBody.innerHTML = `<p class="coming-soon">Loading...</p>`;
  vptAircraftCatalog = [];
  vptSelectedAircraft = null;

  let originIcao = "";
  try {
    const res = await fetch("/api/simbrief/flightplan", { cache: "no-store" });
    if (res.ok) {
      const { flightPlan } = await res.json();
      if (flightPlan && flightPlan.originIcao && flightPlan.originIcao !== "N/A") {
        originIcao = flightPlan.originIcao;
      }
    }
  } catch {
    // No flight plan loaded (or server hiccup) - ARPT just starts blank, which is fine.
  }

  detailBody.innerHTML = `
    <button id="vpt-auth-button" class="vpt-auth-btn">Authenticate VPT</button>
    <div class="vpt-form">
      <p class="settings-hint">TKO Dispatch - powered by Virtual Performance Tool. Requires a VPT developer key, email, and password saved in Settings.</p>
      <p id="vpt-auth-status" class="settings-hint">Not authenticated yet - press "Authenticate VPT" to load your aircraft.</p>

      <label class="vpt-field vpt-field-wide">Aircraft
        <select id="vpt-aircraft" disabled>
          <option value="">Authenticate first to load your aircraft list</option>
        </select>
      </label>
      <p id="vpt-aircraft-status" class="settings-hint"></p>
      <div id="vpt-aircraft-limits"></div>

      <div class="vpt-grid vpt-grid-spaced">
        <label class="vpt-field">ARPT<input id="vpt-airport" type="text" maxlength="4" placeholder="e.g. EHAM" value="${escapeAttr(originIcao)}" /></label>
        <label class="vpt-field">RWY<input id="vpt-runway" type="text" maxlength="6" placeholder="e.g. 18R" /></label>
        <label class="vpt-field">COND<select id="vpt-cond" disabled><option value="">-</option></select></label>
        <label class="vpt-field vpt-field-hidden" id="vpt-depth-field">DEPTH (mm)<input id="vpt-depth" type="number" min="0" placeholder="e.g. 5" /></label>
        <label class="vpt-field">WIND DIR<input id="vpt-wind-dir" type="number" min="0" max="360" placeholder="e.g. 270" /></label>
        <label class="vpt-field">WIND SPD (kt)<input id="vpt-wind-spd" type="number" placeholder="e.g. 10" /></label>
        <label class="vpt-field">OAT (°C)<input id="vpt-oat" type="number" placeholder="15" /></label>
        <label class="vpt-field">QNH (hPa)<input id="vpt-qnh" type="number" placeholder="1013" /></label>
        <label class="vpt-field">RTG<select id="vpt-rtg" disabled><option value="OPTIMUM">Optimum</option></select></label>
        <label class="vpt-field">FLAP<select id="vpt-flap" disabled><option value="OPTIMUM">Optimum</option></select></label>
        <label class="vpt-field">A/I (anti-ice)<select id="vpt-ai" disabled><option value="">-</option></select></label>
        <label class="vpt-field">A/C (bleed)<select id="vpt-acbleed" disabled><option value="">-</option></select></label>
        <label class="vpt-field">IC (improved climb)<select id="vpt-ic" disabled><option value="">-</option></select></label>
        <label class="vpt-field">Takeoff Weight (kg)<input id="vpt-tow" type="number" placeholder="Leave blank for max (RTOW)" /></label>
        <label class="vpt-field">CG (% MAC)<input id="vpt-cg" type="number" step="0.1" placeholder="optional" /></label>
      </div>
      <div class="settings-row settings-row-spaced">
        <button id="vpt-calculate" disabled>Calculate</button>
      </div>
      <p id="vpt-status" class="settings-hint"></p>
      <div id="vpt-results"></div>
    </div>
  `;

  document.getElementById("vpt-auth-button").addEventListener("click", authenticateVpt);
  document.getElementById("vpt-aircraft").addEventListener("change", onVptAircraftSelected);
  document.getElementById("vpt-cond").addEventListener("change", updateVptDepthVisibility);
  document.getElementById("vpt-calculate").addEventListener("click", calculateVptTakeoff);
}

// Contamination depth only applies to runway conditions whose own formData entry sets
// requiresDepth (slush/snow/water and the like) - for DRY/WET it isn't just optional, it's
// meaningless, so the field stays hidden rather than inviting a value that would be ignored.
function updateVptDepthVisibility() {
  const condSelect = document.getElementById("vpt-cond");
  const depthField = document.getElementById("vpt-depth-field");
  const options = vptSelectedAircraft?.formData?.takeoff?.condition || [];
  const selected = options.find((o) => o.value === condSelect.value);
  const needsDepth = !!selected && Number(selected.requiresDepth) === 1;
  depthField.classList.toggle("vpt-field-hidden", !needsDepth);
  if (!needsDepth) document.getElementById("vpt-depth").value = "";
}

async function authenticateVpt() {
  const authStatus = document.getElementById("vpt-auth-status");
  const aircraftSelect = document.getElementById("vpt-aircraft");
  authStatus.classList.remove("settings-error");
  authStatus.textContent = "Authenticating...";

  try {
    const res = await fetch("/api/vpt/authenticate", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      authStatus.textContent = body.error || body.detail || "VPT authentication failed - check the developer key/email/password in Settings.";
      authStatus.classList.add("settings-error");
      return;
    }

    const result = body.result || {};
    const groups = [
      ["Available Aircraft", result.availableAircraft || []],
      ["Your Fleet", result.userFleet || []],
      ["Virtual Airline Fleet", result.virtualAirlineFleet || []],
    ];

    vptAircraftCatalog = [];
    let optionsHtml = `<option value="">Select an aircraft...</option>`;
    for (const [groupLabel, entries] of groups) {
      if (!entries.length) continue;
      optionsHtml += `<optgroup label="${escapeAttr(groupLabel)}">`;
      for (const entry of entries) {
        const idx = vptAircraftCatalog.length;
        vptAircraftCatalog.push({
          file: entry.profile.file,
          userRegistration: entry.profile.userRegistration,
          virtualAirline: entry.profile.virtualAirline,
        });
        const label = `${entry.profile.title}${entry.profile.description ? " " + entry.profile.description : ""} (${entry.model?.engines || ""})`;
        optionsHtml += `<option value="${idx}">${escapeAttr(label)}</option>`;
      }
      optionsHtml += `</optgroup>`;
    }

    aircraftSelect.innerHTML = optionsHtml;
    aircraftSelect.disabled = vptAircraftCatalog.length === 0;
    authStatus.textContent = vptAircraftCatalog.length
      ? `Authenticated. ${vptAircraftCatalog.length} aircraft available - pick one below.`
      : "Authenticated, but no aircraft are available on this account.";
  } catch {
    authStatus.textContent = "Could not reach the server - try again.";
    authStatus.classList.add("settings-error");
  }
}

async function onVptAircraftSelected() {
  const select = document.getElementById("vpt-aircraft");
  const aircraftStatus = document.getElementById("vpt-aircraft-status");
  const limitsEl = document.getElementById("vpt-aircraft-limits");
  const calcButton = document.getElementById("vpt-calculate");
  aircraftStatus.classList.remove("settings-error");

  const entry = vptAircraftCatalog[select.value];
  if (!entry) {
    vptSelectedAircraft = null;
    calcButton.disabled = true;
    limitsEl.innerHTML = "";
    aircraftStatus.textContent = "";
    return;
  }

  aircraftStatus.textContent = "Loading aircraft data...";
  calcButton.disabled = true;
  try {
    const res = await fetch("/api/vpt/aircraft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file: entry.file,
        userRegistration: entry.userRegistration,
        virtualAirline: entry.virtualAirline,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      aircraftStatus.textContent = body.error || body.detail || "Could not load that aircraft's data.";
      aircraftStatus.classList.add("settings-error");
      return;
    }

    vptSelectedAircraft = body.result?.aircraft || null;
    if (!vptSelectedAircraft) {
      aircraftStatus.textContent = "VPT returned no aircraft data.";
      aircraftStatus.classList.add("settings-error");
      return;
    }

    const takeoffForm = vptSelectedAircraft.formData?.takeoff || {};
    populateVptOptionSelect("vpt-cond", takeoffForm.condition);
    populateVptOptionSelect("vpt-rtg", takeoffForm.rating);
    populateVptOptionSelect("vpt-flap", takeoffForm.flap);
    populateVptOptionSelect("vpt-ai", takeoffForm.ai);
    populateVptOptionSelect("vpt-acbleed", takeoffForm.acBleed);
    populateVptOptionSelect("vpt-ic", takeoffForm.improved);
    updateVptDepthVisibility();

    const w = vptSelectedAircraft.weight || {};
    const cl = vptSelectedAircraft.calculationLimit || {};
    const towInput = document.getElementById("vpt-tow");
    if (w.mstow) towInput.max = w.mstow;

    // Not every profile supports a CG input at all - when it doesn't, the field is disabled
    // rather than left accepting a value the calculation would ignore.
    const cgInput = document.getElementById("vpt-cg");
    const cgAvailable = vptSelectedAircraft.takeoff?.isCGAvailable !== false;
    cgInput.disabled = !cgAvailable;
    if (!cgAvailable) cgInput.value = "";
    cgInput.placeholder = cgAvailable ? "optional" : "not available for this aircraft";

    limitsEl.innerHTML = `
      <div class="vpt-results-card">
        <div class="vpt-result-row"><span>OEW</span><span>${w.oew ?? "-"} kg</span></div>
        <div class="vpt-result-row"><span>Max Takeoff Weight (MSTOW)</span><span>${w.mstow ?? "-"} kg</span></div>
        <div class="vpt-result-row"><span>Max Zero Fuel Weight (MZFW)</span><span>${w.mzfw ?? "-"} kg</span></div>
        <div class="vpt-result-row"><span>Max Structural Ramp Weight (MSRW)</span><span>${w.msrw ?? "-"} kg</span></div>
        <div class="vpt-result-row"><span>OAT range</span><span>${cl.minTemperatureC ?? "-"} to ${cl.maxTemperatureC ?? "-"} °C</span></div>
        <div class="vpt-result-row"><span>QNH range</span><span>${cl.minQNHhPa ?? "-"} to ${cl.maxQNHhPa ?? "-"} hPa</span></div>
      </div>
    `;

    aircraftStatus.textContent = `Loaded ${vptSelectedAircraft.profile?.title || entry.file}.`;
    calcButton.disabled = false;
  } catch {
    aircraftStatus.textContent = "Could not reach the server - try again.";
    aircraftStatus.classList.add("settings-error");
  }
}

// Rebuilds a <select>'s options from one of the selected aircraft's formData option arrays
// (condition/rating/flap/ai) - each option's real API "value" (not its display "description")
// becomes the <option>'s value, per VPT's documented requirement that configuration fields
// must use formData's value field. Falls back to leaving the select on its single hardcoded
// default option if this aircraft profile didn't provide that category.
function populateVptOptionSelect(selectId, options) {
  const select = document.getElementById(selectId);
  if (!options || !options.length) {
    select.disabled = true;
    return;
  }
  const sorted = [...options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  select.innerHTML = sorted
    .map((o) => `<option value="${escapeAttr(o.value)}" ${o.isDefault ? "selected" : ""}>${escapeAttr(o.description)}</option>`)
    .join("");
  select.disabled = false;
}

async function calculateVptTakeoff() {
  const status = document.getElementById("vpt-status");
  const results = document.getElementById("vpt-results");
  results.innerHTML = "";
  status.classList.remove("settings-error");

  if (!vptSelectedAircraft) {
    status.textContent = "Authenticate and pick an aircraft first.";
    status.classList.add("settings-error");
    return;
  }

  const airport = document.getElementById("vpt-airport").value.trim();
  const runway = document.getElementById("vpt-runway").value.trim();

  if (!airport || !runway) {
    status.textContent = "ARPT and RWY are required.";
    status.classList.add("settings-error");
    return;
  }

  const numOrNull = (id) => {
    const v = document.getElementById(id).value;
    return v === "" ? null : Number(v);
  };

  // VPT rejects out-of-range inputs server-side, and the aircraft profile already told us the
  // exact accepted ranges - so catch them here with a message naming the real limit rather than
  // spending a calculation (they're metered) on a request that can only come back an error.
  const oat = numOrNull("vpt-oat");
  const qnh = numOrNull("vpt-qnh");
  const tow = numOrNull("vpt-tow");
  const limits = vptSelectedAircraft.calculationLimit || {};
  const weightLimits = vptSelectedAircraft.weight || {};
  const fail = (msg) => {
    status.textContent = msg;
    status.classList.add("settings-error");
  };

  if (oat !== null && limits.minTemperatureC != null && limits.maxTemperatureC != null &&
      (oat < limits.minTemperatureC || oat > limits.maxTemperatureC)) {
    return fail(`OAT must be between ${limits.minTemperatureC} and ${limits.maxTemperatureC} °C for this aircraft.`);
  }
  if (qnh !== null && limits.minQNHhPa != null && limits.maxQNHhPa != null &&
      (qnh < limits.minQNHhPa || qnh > limits.maxQNHhPa)) {
    return fail(`QNH must be between ${limits.minQNHhPa} and ${limits.maxQNHhPa} hPa for this aircraft.`);
  }
  if (tow !== null && weightLimits.mstow != null && tow > weightLimits.mstow) {
    return fail(`Takeoff weight exceeds this aircraft's maximum structural takeoff weight (${weightLimits.mstow} kg).`);
  }

  const profile = vptSelectedAircraft.profile || {};

  status.textContent = "Calculating...";
  try {
    const res = await fetch("/api/vpt/takeoff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aircraftFile: profile.file,
        userRegistration: profile.userRegistration,
        virtualAirline: profile.virtualAirline,
        airport,
        runway,
        windDirection: numOrNull("vpt-wind-dir"),
        windSpeed: numOrNull("vpt-wind-spd"),
        temperatureC: oat,
        qnhHpa: qnh,
        runwayCondition: document.getElementById("vpt-cond").value,
        runwayConditionDepth: numOrNull("vpt-depth"),
        flap: document.getElementById("vpt-flap").value,
        rating: document.getElementById("vpt-rtg").value,
        antiIce: document.getElementById("vpt-ai").value,
        acBleed: document.getElementById("vpt-acbleed").value,
        improvedClimb: document.getElementById("vpt-ic").value,
        takeoffWeight: tow,
        cg: numOrNull("vpt-cg"),
      }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      status.textContent = body.error || body.detail || "VPT calculation failed.";
      status.classList.add("settings-error");
      return;
    }

    status.textContent = "";
    const performance = body.result?.performance;
    const perf = performance?.full;
    if (!perf) {
      results.innerHTML = `<p class="settings-hint">VPT returned a response with no performance data.</p>`;
      return;
    }

    const extras = (performance.additionalAssumed || [])
      .map((a) => renderVptPerfBlock(`Requested FLEX ${a.requested ?? ""} °C`, a))
      .join("");

    results.innerHTML =
      renderVptPerfBlock("Full thrust", perf) +
      renderVptPerfBlock("Assumed / FLEX thrust", performance.assumed) +
      extras +
      (perf.efp
        ? `<div class="vpt-results-card"><div class="vpt-result-head">Engine Failure Procedure</div><p>${escapeAttr(perf.efp)}</p></div>`
        : "");
  } catch {
    status.textContent = "Could not reach the server - try again.";
    status.classList.add("settings-error");
  }
}

// Renders one VPT performance result - used for the full-thrust block, the assumed/FLEX block,
// and each additionalAssumed entry, since VPT documents all three as carrying the same field
// set. Units come from the result itself (perf.units) rather than being assumed, so this stays
// correct if the request ever switches to lb/metres.
function renderVptPerfBlock(title, perf) {
  if (!perf) return "";

  // An assumed/FLEX block that couldn't be computed carries only status fields; an
  // additionalAssumed entry that failed carries available:false plus an errorMessage.
  if (perf.available === false || (perf.maxTow === undefined && perf.v1 === undefined)) {
    const why = perf.errorMessage || perf.assumedMessage || "Not available for these conditions.";
    return `
      <div class="vpt-results-card">
        <div class="vpt-result-head">${escapeAttr(title)}</div>
        <p>${escapeAttr(why)}</p>
      </div>`;
  }

  const u = perf.units || {};
  const wt = u.weight || "kg";
  const dist = u.distance || "ft";
  const row = (label, value, unit) =>
    value === undefined || value === null || value === ""
      ? ""
      : `<div class="vpt-result-row"><span>${escapeAttr(label)}</span><span>${escapeAttr(value)}${unit ? " " + escapeAttr(unit) : ""}</span></div>`;

  // V-speeds only come back when a takeoff weight was supplied (VPT's "actual TOW" mode) -
  // in RTOW mode the fields are absent/zero and displayVspeeds is false, so showing a row of
  // zeros as if they were real speeds would be actively misleading.
  const speeds =
    perf.displayVspeeds === false
      ? `<div class="vpt-result-note">RTOW mode - enter a takeoff weight to get V-speeds and thrust setting.</div>`
      : row("V1", perf.v1, "kt") +
        row("VR", perf.vr, "kt") +
        row("V2", perf.v2, "kt") +
        row("Green dot", perf.greenDot, "kt") +
        (perf.vrefIsDisplayed ? row(`Vref (flap ${perf.vrefFlaps ?? "-"})`, perf.vrefSpeed, "kt") : "");

  // A negative margin means the takeoff does not fit on the runway - too important to render
  // as just another neutral row.
  const marginRow =
    perf.margin === undefined || perf.margin === null
      ? ""
      : `<div class="vpt-result-row ${perf.margin < 0 ? "vpt-result-bad" : ""}">
           <span>Margin</span><span>${escapeAttr(perf.margin)} ${escapeAttr(dist)}${perf.margin < 0 ? " - DOES NOT FIT" : ""}</span>
         </div>`;

  return `
    <div class="vpt-results-card">
      <div class="vpt-result-head">${escapeAttr(title)}</div>
      ${row("Thrust rating", perf.rating)}
      ${row("Flap", perf.flap)}
      ${row(perf.lblTemp || "Temperature", perf.temperature, "°C")}
      ${row("Thrust setting", perf.lblThrust)}
      ${row(perf.n1Label || "N1", perf.n1)}
      ${speeds}
      ${row("Takeoff weight", perf.tow, wt)}
      ${row("Max takeoff weight", perf.maxTow, wt)}
      ${row("Limiting factor", perf.limitingFactor)}
      ${row("TORA", perf.tora, dist)}
      ${marginRow}
      ${row("ASD (one engine)", perf.accelerateStopDistanceOneEngine, dist)}
      ${row("TOD (all engines)", perf.takeOffDistanceAllEngines, dist)}
      ${row("TOD (one engine)", perf.takeOffDistanceOneEngine, dist)}
      ${row("2nd segment (net)", perf.secondSegmentNet, "%")}
      ${row("Trim", perf.trimRounded)}
    </div>`;
}

function goHome() {
  detailScreen.classList.add("hidden");
  homeButton.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  refreshTiles();
}

const statusbarLeft = document.querySelector(".statusbar-left");
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// The status bar only ever shows the sim's own local time/date, never the PC's real clock -
// real-world time is meaningless for the flight, and the sim's time-of-day can be set to
// anything. So there's simply nothing to show here until SimConnect is actually connected.
async function checkFlightState() {
  try {
    const res = await fetch("/api/flight/state", { cache: "no-store" });
    if (res.ok) {
      const { connected, state } = await res.json();
      if (connected && state) {
        statusbarLeft.classList.remove("hidden");
        const totalSeconds = Math.floor(state.localTimeSeconds);
        const hh = String(Math.floor(totalSeconds / 3600) % 24).padStart(2, "0");
        const mm = String(Math.floor(totalSeconds / 60) % 60).padStart(2, "0");
        clockEl.textContent = `${hh}:${mm}`;
        dateEl.textContent = `${state.localDay} ${MONTH_NAMES[state.localMonth - 1] ?? ""} ${state.localYear}`;
        return;
      }
    }
  } catch {
    // fall through - hide below, same as "not connected"
  }
  statusbarLeft.classList.add("hidden");
}

const WIFI_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 8.5a16 16 0 0 1 20 0M5.5 12.5a11 11 0 0 1 13 0M9 16.5a6 6 0 0 1 6 0"/><circle cx="12" cy="20" r="1.2" fill="currentColor" stroke="none"/></svg>';

function batterySvg(pct) {
  const fillWidth = Math.max(0, Math.min(1, pct / 100)) * 16;
  return `<svg viewBox="0 0 26 17" fill="none">
    <rect x="1" y="1" width="21" height="15" rx="3.5" stroke="currentColor" stroke-width="1.4"/>
    <rect x="23.2" y="6" width="2.2" height="5" rx="1" fill="currentColor"/>
    <rect x="3.2" y="3.2" width="${fillWidth}" height="10.6" rx="1.8" fill="currentColor"/>
  </svg>`;
}

// Pings the server's own /api/status endpoint so the status-bar indicator reflects
// reality (the page loading at all doesn't guarantee the backend is still responsive)
// rather than just always showing connected because the page happened to load once.
async function checkServerStatus() {
  try {
    const res = await fetch("/api/status", { cache: "no-store" });
    if (res.ok) {
      connectionIcon.classList.remove("offline");
      return;
    }
  } catch {
    // fall through to offline state below
  }
  connectionIcon.classList.add("offline");
}

const SIGNAL_SVG = '<svg viewBox="0 0 20 16" fill="currentColor" stroke="none"><rect x="0" y="11" width="3.4" height="5" rx="1"/><rect x="5.5" y="8" width="3.4" height="8" rx="1"/><rect x="11" y="4.5" width="3.4" height="11.5" rx="1"/><rect x="16.5" y="0" width="3.4" height="16" rx="1"/></svg>';

document.getElementById("wifi-icon").innerHTML = WIFI_SVG;
document.getElementById("battery-icon").innerHTML = batterySvg(100);
connectionIcon.innerHTML = SIGNAL_SVG;

homeButton.addEventListener("click", goHome);

document.getElementById("loadsheet-notification").addEventListener("click", () => {
  hideLoadsheetNotification();
  // Opens Dispatch even if its tile is currently switched off in Settings > Apps - a loadsheet
  // that has already been issued is worth showing regardless of whether the tile is on show.
  const dispatch = APPS.find((a) => a.id === "dispatch");
  if (dispatch) openDetail(dispatch);
});

// The EFL tab bar and its save-status pill (.efl-tabbar/.efl-save-bar) are position:fixed
// against the bottom of the page's layout viewport. On a tablet, opening the on-screen
// keyboard to type into a field doesn't shrink that layout viewport - only the *visual*
// viewport shrinks - so a plain `bottom: 0` stays put behind where the keyboard now covers,
// instead of riding up above it. window.visualViewport reports the real gap between the two,
// which is exactly the keyboard's height; --keyboard-inset feeds that into both bars' `bottom`
// (see .efl-tabbar/.efl-save-bar in style.css) so they stay above the keyboard instead of
// underneath it.
function updateKeyboardInset() {
  const vv = window.visualViewport;
  const inset = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
  document.documentElement.style.setProperty("--keyboard-inset", `${inset}px`);
}
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateKeyboardInset);
  window.visualViewport.addEventListener("scroll", updateKeyboardInset);
}

startApp();
checkFlightState();
setInterval(checkFlightState, 5000);

checkServerStatus();
setInterval(checkServerStatus, 10000);

checkLoadsheetNotifications();
setInterval(checkLoadsheetNotifications, 15000);
