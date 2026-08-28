// print/flightlog.html's own script - this page is never shown to a pilot. The desktop host's
// dedicated print WebView2 navigates here off-screen for every Log Flight save (see
// MainForm.PrintFlightLogAsync), whether it was the desktop app itself or a LAN tablet that
// asked for it (see logFlight() in app.js and POST /api/flightlog/print in Program.cs) - so
// this fetches the same flight plan + saved Flight Log entry any device would see, builds the
// report exactly like app.js used to inline, and reports back over the same
// window.chrome.webview bridge every other host message uses. MainForm waits on that message
// before calling PrintToPdfAsync, since the page needs a moment to fetch before there's
// anything worth printing.
(async () => {
  const reportBack = (result) => {
    window.chrome.webview.postMessage(JSON.stringify({ type: "print-ready", ...result }));
  };

  try {
    const [fpRes, logRes] = await Promise.all([
      fetch("/api/simbrief/flightplan", { cache: "no-store" }),
      fetch("/api/simbrief/flightlog", { cache: "no-store" }),
    ]);

    const fp = fpRes.ok ? (await fpRes.json()).flightPlan : null;
    const entry = logRes.ok ? (await logRes.json()).flightLog : null;

    if (!fp) throw new Error("No flight plan is currently loaded.");
    if (!entry) throw new Error("Nothing has been saved on the Flight Log tab yet.");

    document.getElementById("flight-log-report").innerHTML = buildFlightLogReportHtml(fp, entry);
    reportBack({ ok: true });
  } catch (err) {
    reportBack({ ok: false, error: err && err.message ? err.message : String(err) });
  }
})();
