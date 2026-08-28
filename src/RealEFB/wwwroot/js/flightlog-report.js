// Shared between the main app (app.js) and the standalone print/flightlog.html page that the
// desktop host's Log Flight save renders off-screen in its own dedicated WebView2 (see
// MainForm.PrintFlightLogAsync and print-flightlog.js) - loaded before both via a plain
// <script> tag, so everything here is just a global both scripts can call, the same way every
// function in app.js itself is. Kept out of app.js specifically so the print page doesn't have
// to load (and satisfy the DOM assumptions of) the other ~4000 lines of home-screen/EFL/
// Settings code that has nothing to do with building the report.

// Escapes a value for safe use inside an HTML attribute (e.g. a saved SimBrief ID or API
// code echoed back into value="..."), since those come from user input via a text field.
function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// HH:MM -> minutes since midnight, or null if not a valid time. Kept deliberately forgiving
// (single-digit hour is fine) since this is free-typed, not a native <input type="time">.
function parseHHMM(str) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((str || "").trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mi = parseInt(m[2], 10);
  if (h > 23 || mi > 59) return null;
  return h * 60 + mi;
}

function formatMinutes(totalMinutes) {
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const mm = String(totalMinutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function durationHHMM(fromStr, toStr) {
  const from = parseHHMM(fromStr);
  const to = parseHHMM(toStr);
  if (from === null || to === null) return "00:00";
  let diff = to - from;
  if (diff < 0) diff += 1440; // midnight rollover
  return formatMinutes(diff);
}

// A plain, print-friendly rundown of every Flight Log field - kept entirely separate from
// the on-screen form (which is full of input boxes and toggles) since #flight-log-report is
// the only thing left visible when the desktop host prints this to PDF (see the @media print
// rule in style.css). Total Flight/Total Block are recomputed from entry's own Airborne/
// Landed/Off Block/On Block rather than read off the live form's #fuel-totalflight/
// #fuel-totalblock inputs, since print/flightlog.html never builds that form at all - it
// only ever has fp + entry, fetched fresh from the server.
function buildFlightLogReportHtml(fp, entry) {
  const esc = (v) => escapeAttr(v ?? "");
  const isLbs = (fp.fuelUnits || "").toLowerCase().includes("lb");
  const weightUnit = isLbs ? "Lbs" : "Kgs";
  const volumeUnit = isLbs ? "Gal" : "Lts";
  const fmt = (v, unit) => (v === null || v === undefined ? "-" : `${v}${unit ? " " + unit : ""}`);
  const totalFlight = durationHHMM(entry.airborne, entry.landed);
  const totalBlock = durationHHMM(entry.offBlock, entry.onBlock);

  const row = (label, value) => `
    <div class="report-row">
      <span class="report-label">${esc(label)}</span>
      <span class="report-value">${esc(value)}</span>
    </div>`;

  const section = (title, rowsHtml) => `
    <div class="report-section">
      <h2>${esc(title)}</h2>
      <div class="report-grid">${rowsHtml}</div>
    </div>`;

  const delayRows = entry.delays
    .filter((d) => d.reason || d.time)
    .map((d, i) => row(`Delay ${i + 1}`, `${d.time || "00:00"} - ${d.reason || "(no reason given)"}`))
    .join("");

  return `
    <div class="report-header">
      <h1>${esc(fp.callsign)}</h1>
      <p>${esc(fp.originIcao)} &rarr; ${esc(fp.destIcao)} &middot; ${esc(fp.aircraftIcao)}</p>
    </div>
    ${section(
      "Fuel",
      row("Block", fmt(entry.block, weightUnit)) +
        row("Trip+Taxi", fmt(entry.tripTaxi, weightUnit)) +
        row("Reserves", fmt(entry.reserves, weightUnit)) +
        row("Uplift", fmt(entry.uplift, volumeUnit)) +
        row("Departure", fmt(entry.departure, weightUnit)) +
        row("Arrival", fmt(entry.arrival, weightUnit)) +
        row("Burn Off", fmt(entry.burnOff, weightUnit)) +
        row("Burn Difference", entry.burnDiff === null ? "-" : `${entry.burnDiffSign}${entry.burnDiff} ${weightUnit}`) +
        row("Reason for DISCR Fuel", entry.reasonForDiscrFuel || "-")
    )}
    ${section(
      "Payload",
      row("Adults", fmt(entry.adults)) +
        row("Children", fmt(entry.children)) +
        row("Infants", fmt(entry.infants)) +
        row("Actual Pax", fmt(entry.actualPax)) +
        row("Freight", fmt(entry.freight, weightUnit)) +
        row("Placard WT", fmt(entry.placardWt, weightUnit))
    )}
    ${section(
      "Times",
      row("Off Block", entry.offBlock || "-") +
        row("Airborne", entry.airborne || "-") +
        row("Total Flight", totalFlight) +
        row("Landed", entry.landed || "-") +
        row("On Block", entry.onBlock || "-") +
        row("Total Block", totalBlock)
    )}
    ${section("Delays", delayRows || row("Delays", "None"))}
    ${section("Pilot Flying", row("PF Takeoff", entry.pfTakeoff) + row("PF Landing", entry.pfLanding))}
  `;
}
