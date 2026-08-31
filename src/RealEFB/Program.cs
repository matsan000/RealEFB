using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text.Json;

namespace RealEFB;

internal sealed record PortUpdateRequest(int Port);

internal sealed record SimBriefSettingsUpdateRequest(string SimBriefId);

internal sealed record SayIntentionsSettingsUpdateRequest(bool Enabled, string SayIntentionsApiCode);

// DataSource is "sayintentions" or "vatsim" - see DispatchDataSource in AppSettings. Whether
// Dispatch appears at all is no longer part of this - that moved to Settings > Apps along with
// every other app's switch (see AppsSettingsUpdateRequest).
internal sealed record DispatchSettingsUpdateRequest(string DataSource);

// Settings > Apps - app id (see APPS in app.js) to whether its home-screen tile is shown.
internal sealed record AppsSettingsUpdateRequest(Dictionary<string, bool>? EnabledApps);

// Settings > Website Apps saves its whole list at once, same as Settings > Apps above - the
// list itself is short enough (typically single digits) that there's no real cost to
// replacing it wholesale on every add/edit/delete rather than building out separate per-item
// endpoints.
internal sealed record WebAppsUpdateRequest(List<WebApp>? WebApps);

// The Dispatch app's own two request shapes - see SayIntentionsClient/VatsimClient. Icao is a
// single airport per call (each request the frontend sends asks about one at a time), not
// SAPI's own comma-separated multi-airport form. Kind is "metar" or "atis" - both come from
// the same SayIntentions call either way, but VATSIM needs to know which one to fetch since
// they're two entirely separate requests there.
internal sealed record DispatchWeatherRequest(string Icao, string Kind);

internal sealed record DispatchGateRequest(string Airport, string Gate);

internal sealed record DispatchPrintRequest(string Text);

// One Delays slot: a free-typed reason and a "00:00" time, both left blank if unused.
internal sealed record DelayEntry(string Reason, string Time);

// POST /api/flightlog/print's own request shape - see MainForm.PrintFlightLogAsync. Same
// "<callsign>-FlightLog" name app.js has always suggested; the endpoint doesn't need anything
// else since the report itself is built from whatever's already saved (POST
// /api/simbrief/flightlog), not from this request.
internal sealed record FlightLogPrintRequest(string SuggestedName);

// The Flight Log tab's Fuel and Payload entries. Kept as one flat record - simplest
// possible shape to mirror straight into and out of the form.
internal sealed record FlightLogEntry(
    double? Block,
    double? TripTaxi,
    double? Reserves,
    double? Uplift,
    double? Departure,
    double? Arrival,
    double? BurnOff,
    string BurnDiffSign,
    double? BurnDiff,
    string ReasonForDiscrFuel,
    double? Adults,
    double? Children,
    double? Infants,
    double? ActualPax,
    double? Freight,
    double? PlacardWt,
    string OffBlock,
    string Airborne,
    string Landed,
    string OnBlock,
    IReadOnlyList<DelayEntry>? Delays,
    string PfTakeoff,
    string PfLanding,
    string CaptainRemarks);

// The Fuel/FMC tab - a replica of SimBrief's own OFP fuel-plan table (Trip/Min Cont/Altn/
// Finres/Add Res/Planned T-Off/T-Off/Taxi, each with a fuel figure and a time). Only Block
// Fuel and Total Fuel are ever actually typed by the crew - everything else is SimBrief's own
// planning output, shown for reference and always re-derived from the flight plan rather than
// saved here. PIC Discr is derived too (Total Fuel - Block Fuel), not saved as user input, but
// is included so the last-saved discrepancy is available without recomputing on every load.
// DepartureAtisFields/DepartureClearanceFields hold whatever the crew typed into those two
// editing screens, keyed by field id (see ATIS_FIELDS/CLEARANCE_FIELDS in app.js) - kept as
// a raw dictionary rather than a fixed set of properties since it's a flat bag of optional
// strings and the compiled summary line shown on the tab is always re-derived from these at
// display time, never stored itself.
internal sealed record FuelFmcEntry(
    double? BlockFuel,
    double? TotalFuel,
    double? PicDiscrFuel,
    Dictionary<string, string>? DepartureAtisFields,
    Dictionary<string, string>? DepartureClearanceFields,
    // Arrival ATIS/Alternate ATIS shares the same field set as Departure ATIS, but its
    // airport is editable (an arrival could end up being the destination or an alternate),
    // so unlike Departure/Clearance its dictionary also carries an "airport" entry - see
    // ATIS_MODES in app.js.
    Dictionary<string, string>? ArrivalAtisFields);

// One waypoint card's pilot-entered Actual row (Off Block never has Burn, since nothing's
// been consumed yet at that point - it's just left null there).
internal sealed record WaypointActual(string Time, double? Fuel, double? Burn);

// The Waypoints tab's saved entries, keyed by a stable id per card: "offblock", "depicao",
// "wpt0"/"wpt1"/... for each navlog fix in order, "arrivalicao", "onblock" - see
// WAYPOINT_ID_* in app.js. Planned/Estimate are always re-derived from the flight plan (and,
// for Estimate, not sourced from anywhere yet), so there's nothing to save for those.
internal sealed record WaypointsEntry(Dictionary<string, WaypointActual>? Actuals);

// One of the Dispatch app's two automatic loadsheets - see GET /api/dispatch/loadsheet.
// Adults/Children/Infants always sum to TotalPax, which matches SimBrief's own
// pax_count_actual for the flight (see Program.GenerateRealisticPaxSplit) - both loadsheets
// share the same split, since they describe the same real passengers. Status/DecidedUtc/
// SentToEfl/SentToEflUtc only ever change on the final loadsheet (see POST /api/dispatch/
// loadsheet/accept, /deny, /sent-to-efl) - the preliminary one is informational only and stays
// Status:"pending" forever. Status is "pending"/"accepted"/"denied".
internal sealed record LoadsheetInfo(
    DateTimeOffset IssuedUtc,
    int Adults,
    int Children,
    int Infants,
    int TotalPax,
    string Status,
    DateTimeOffset? DecidedUtc,
    bool SentToEfl,
    DateTimeOffset? SentToEflUtc);

internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);

        // Used to suppress the Final Loadsheet's notification pill (not the loadsheet itself -
        // see GET /api/dispatch/loadsheet) when RealEFB was launched too long after a flight's
        // scheduled off-block to make a "just arrived" notification meaningful.
        var appStartUtc = DateTimeOffset.UtcNow;

        var settings = AppSettings.Load();

        // Holds the latest sim-second snapshot from SimConnect, if the sim is running and
        // connected - null until then. Connecting is lazy/retried, so this app can be opened
        // before the sim, or survive the sim closing and reopening, without a restart.
        SimFlightState? latestFlightState = null;
        bool simConnected = false;
        var flightLock = new object();

        var sayIntentionsClient = new SayIntentionsClient();
        var vatsimClient = new VatsimClient();
        var simPrinterClient = new SimPrinterClient();

        // The Documents tab's source folder - created (idempotently) on every launch rather
        // than only "on install" since RealEFB has no separate installer step to hook into
        // right now; CreateDirectory is a no-op if it's already there, so this is safe to run
        // every single startup.
        var documentsFolder = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "RealEFB Documents");
        Directory.CreateDirectory(documentsFolder);

        // The Flight Tracker's flown-track trail - recorded here in the backend rather than by
        // whichever client happens to have the tab open, so it keeps building for the entire
        // flight even if Flight Tracker is never opened, and so every device (desktop, every
        // tablet) sees the exact same trail instead of each one only knowing about whatever
        // portion it personally happened to be watching - see GET /api/flight/trail. Points are
        // throttled to one every TrailSampleIntervalSeconds of real time rather than every
        // SimConnect tick (~1/s) so a long flight's trail stays a reasonable size to keep in
        // memory and send down the wire; TrailMaxPoints is a hard ceiling on top of that, in
        // case a flight runs long enough for even the throttled rate to add up. Reset on every
        // fresh SimBrief import (see /api/simbrief/import below), same as the Dispatch
        // loadsheets - it only makes sense for one specific flight.
        const int TrailSampleIntervalSeconds = 10;
        const int TrailMaxPoints = 20_000;
        var flightTrail = new List<(double Lat, double Lon)>();
        DateTimeOffset? lastTrailSampleUtc = null;
        var flightTrailLock = new object();

        var simConnectClient = new SimConnectClient();
        simConnectClient.FlightStateUpdated += state =>
        {
            lock (flightLock) { latestFlightState = state; }

            lock (flightTrailLock)
            {
                var now = DateTimeOffset.UtcNow;
                if (lastTrailSampleUtc is null || (now - lastTrailSampleUtc.Value).TotalSeconds >= TrailSampleIntervalSeconds)
                {
                    lastTrailSampleUtc = now;
                    if (flightTrail.Count < TrailMaxPoints) flightTrail.Add((state.Latitude, state.Longitude));
                }
            }
        };
        simConnectClient.Connected += () => { lock (flightLock) { simConnected = true; } };
        simConnectClient.Disconnected += () =>
        {
            lock (flightLock) { simConnected = false; latestFlightState = null; }
        };

        // Holds the last flight plan imported from SimBrief for the EFL app, so reopening
        // it doesn't need a fresh fetch - null until "Import latest SimBrief flight plan"
        // is pressed.
        SimBriefFlightPlan? currentFlightPlan = null;
        var flightPlanLock = new object();

        // The Flight Log's saved Fuel + Payload entries - shared across every device on the
        // LAN, and deliberately NOT cleared on a fresh SimBrief import. Only a full app
        // restart resets it, per how this is meant to behave.
        FlightLogEntry? savedFlightLog = null;
        var flightLogLock = new object();

        // The Fuel/FMC tab's saved entry - same sharing/reset rules as savedFlightLog above.
        FuelFmcEntry? savedFuelFmc = null;
        var fuelFmcLock = new object();

        // The Waypoints tab's saved entry - same sharing/reset rules as savedFlightLog above.
        WaypointsEntry? savedWaypoints = null;
        var waypointsLock = new object();

        // The Dispatch app's two automatic loadsheets - unlike the saved entries above, this
        // DOES reset on every fresh SimBrief import (see /api/simbrief/import below), since it
        // only makes sense for one specific flight. Each *TriggerUtc is rolled once per flight
        // (a random point before ScheduledOutUtc - see GET /api/dispatch/loadsheet) and cached
        // rather than rerolled on every poll, so it doesn't drift; each loadsheet itself flips
        // from null to a real snapshot the first poll after its trigger time has passed.
        (int Adults, int Children, int Infants)? paxSplit = null;
        DateTimeOffset? prelimLoadsheetTriggerUtc = null;
        DateTimeOffset? finalLoadsheetTriggerUtc = null;
        LoadsheetInfo? preliminaryLoadsheet = null;
        LoadsheetInfo? finalLoadsheet = null;
        var loadsheetLock = new object();

        var builder = WebApplication.CreateBuilder(args);

        // Bind to every network interface, not just localhost - this is the whole point: a tablet
        // on the same Wi-Fi needs to be able to reach this over the LAN, not just this PC itself.
        builder.WebHost.UseUrls($"http://0.0.0.0:{settings.Port}");

        var app = builder.Build();

        app.UseDefaultFiles();

        // Force revalidation on every load instead of letting the browser/WebView2 disk
        // cache serve a stale copy after an update - static assets still get a fast 304
        // when unchanged, but a real change is never masked by a cached page.
        app.UseStaticFiles(new StaticFileOptions
        {
            OnPrepareResponse = ctx => ctx.Context.Response.Headers.CacheControl = "no-cache"
        });

        // Minimal placeholder endpoint so the frontend has something real to call - the status
        // bar's connection indicator pings this to confirm the server is actually reachable
        // rather than just assuming so.
        app.MapGet("/api/status", () => Results.Ok(new
        {
            ok = true,
            name = "RealEFB",
            version = "0.1.0",
            serverTimeUtc = DateTime.UtcNow
        }));

        app.MapGet("/api/settings", () => Results.Ok(new
        {
            port = settings.Port,
            simBriefId = settings.SimBriefId,
            sayIntentionsEnabled = settings.SayIntentionsEnabled,
            sayIntentionsApiCode = settings.SayIntentionsApiCode,
            enabledApps = settings.EnabledApps,
            webApps = settings.WebApps,
            dispatchDataSource = settings.DispatchDataSource,
            setupWizardCompleted = settings.SetupWizardCompleted
        }));

        // The port only takes effect on the next launch - Kestrel is already bound and
        // serving this very request, so rebinding it live is out of scope here. The
        // Settings screen tells the user to restart after saving.
        app.MapPost("/api/settings", (PortUpdateRequest req) =>
        {
            if (req.Port is < 1 or > 65535)
                return Results.BadRequest(new { ok = false, error = "Port must be between 1 and 65535." });

            settings.Port = req.Port;
            settings.Save();
            return Results.Ok(new { ok = true, port = settings.Port, restartRequired = true });
        });

        app.MapPost("/api/settings/simbrief", (SimBriefSettingsUpdateRequest req) =>
        {
            settings.SimBriefId = req.SimBriefId?.Trim() ?? "";
            settings.Save();

            return Results.Ok(new { ok = true });
        });

        app.MapPost("/api/settings/sayintentions", (SayIntentionsSettingsUpdateRequest req) =>
        {
            settings.SayIntentionsEnabled = req.Enabled;
            settings.SayIntentionsApiCode = req.SayIntentionsApiCode?.Trim() ?? "";
            settings.Save();

            return Results.Ok(new { ok = true });
        });

        app.MapPost("/api/settings/dispatch", (DispatchSettingsUpdateRequest req) =>
        {
            settings.DispatchDataSource = req.DataSource == "vatsim" ? "vatsim" : "sayintentions";
            settings.Save();

            return Results.Ok(new { ok = true });
        });

        // Settings > Apps - the whole on/off map is replaced wholesale rather than patched one
        // key at a time, since the Settings screen always posts every app's current switch
        // position together.
        app.MapPost("/api/settings/apps", (AppsSettingsUpdateRequest req) =>
        {
            settings.EnabledApps = req.EnabledApps ?? new Dictionary<string, bool>();
            settings.Save();

            return Results.Ok(new { ok = true });
        });

        // Settings > Website Apps - same wholesale-replace approach as Settings > Apps above.
        // A blank Name/Url is dropped rather than saved (the add/edit form on the frontend
        // shouldn't ever submit one, but this is the actual guarantee); an Id missing entirely
        // gets a fresh one server-side, and an oversized Icon is dropped rather than failing the
        // whole save - a giant image shouldn't be able to block someone from deleting an entry.
        app.MapPost("/api/settings/webapps", (WebAppsUpdateRequest req) =>
        {
            const int maxIconLength = 400_000; // ~300KB decoded - plenty for a small app icon

            settings.WebApps = (req.WebApps ?? [])
                .Where(w => !string.IsNullOrWhiteSpace(w.Name) && !string.IsNullOrWhiteSpace(w.Url))
                .Select(w => new WebApp
                {
                    Id = string.IsNullOrWhiteSpace(w.Id) ? Guid.NewGuid().ToString("n") : w.Id,
                    Name = w.Name.Trim(),
                    Url = w.Url.Trim(),
                    Icon = w.Icon is { Length: > 0 and <= maxIconLength } ? w.Icon : null,
                })
                .ToList();
            settings.Save();

            return Results.Ok(new { ok = true, webApps = settings.WebApps });
        });

        // Marks the one-time setup wizard as done so it doesn't show again on the next
        // launch (see startApp() in app.js) - Settings also has its own "Run Setup Wizard"
        // button that shows it again on purpose, unrelated to this flag.
        app.MapPost("/api/settings/wizard-complete", () =>
        {
            settings.SetupWizardCompleted = true;
            settings.Save();

            return Results.Ok(new { ok = true });
        });

        // The Dispatch app's MET RQST/ATIS RQST keys - routed to whichever data source is
        // active in Settings. SayIntentions' "getWX" returns both METAR and ATIS in one call
        // (Kind just picks which field to read back out); VATSIM has no equivalent single
        // call, so Kind picks an entirely different request there (a plain METAR feed vs. a
        // scan of the full data feed's "atis" array). Response is just the raw text (or null
        // if that source has nothing for this ICAO right now) - the frontend prints it
        // verbatim into the ACARS-style screen either way.
        app.MapPost("/api/dispatch/weather", async (DispatchWeatherRequest req) =>
        {
            if (string.IsNullOrWhiteSpace(req.Icao))
                return Results.BadRequest(new { ok = false, error = "Airport ICAO is required." });
            var icao = req.Icao.Trim().ToUpperInvariant();
            var kind = string.Equals(req.Kind, "atis", StringComparison.OrdinalIgnoreCase) ? "atis" : "metar";

            if (settings.DispatchDataSource == "vatsim")
            {
                try
                {
                    var text = kind == "atis" ? await vatsimClient.GetAtisAsync(icao) : await vatsimClient.GetMetarAsync(icao);
                    return Results.Ok(new { ok = true, text });
                }
                catch (Exception ex)
                {
                    return Results.Problem($"VATSIM {kind.ToUpperInvariant()} request failed: {ex.Message}", statusCode: 502);
                }
            }

            if (settings.SayIntentionsApiCode.Length == 0)
                return Results.BadRequest(new { ok = false, error = "SayIntentions.AI API code must be set in Settings first." });

            try
            {
                using var result = await sayIntentionsClient.GetWeatherAsync(settings.SayIntentionsApiCode, icao);
                string? text = null;
                if (result.RootElement.TryGetProperty("airports", out var airports) && airports.GetArrayLength() > 0)
                {
                    var airport = airports[0];
                    var field = kind == "atis" ? "atis" : "metar";
                    if (airport.TryGetProperty(field, out var t) && t.ValueKind == JsonValueKind.String) text = t.GetString();
                }
                return Results.Ok(new { ok = true, text });
            }
            catch (Exception ex)
            {
                return Results.Problem($"SayIntentions.AI weather request failed: {ex.Message}", statusCode: 502);
            }
        });

        // Gate features are SayIntentions-only - VATSIM has no gate-assignment concept - so
        // both endpoints below reject outright when VATSIM is the active data source, rather
        // than the frontend just hiding the buttons and hoping nothing else calls these.

        // "What gate can I expect" - reads whatever SayIntentions has currently assigned for
        // the active flight (SAPI's "getParking"), without requesting/changing anything.
        app.MapGet("/api/dispatch/gate", async () =>
        {
            if (settings.DispatchDataSource == "vatsim")
                return Results.BadRequest(new { ok = false, error = "Gate requests need SayIntentions.AI - switch Dispatch's data source in Settings." });
            if (settings.SayIntentionsApiCode.Length == 0)
                return Results.BadRequest(new { ok = false, error = "SayIntentions.AI API code must be set in Settings first." });

            try
            {
                using var result = await sayIntentionsClient.GetParkingAsync(settings.SayIntentionsApiCode);
                JsonElement? parking = result.RootElement.TryGetProperty("parking", out var p) && p.ValueKind == JsonValueKind.Object
                    ? p.Clone()
                    : null;
                return Results.Ok(new { ok = true, parking });
            }
            catch (Exception ex)
            {
                return Results.Problem($"SayIntentions.AI parking request failed: {ex.Message}", statusCode: 502);
            }
        });

        // "Request a (different) gate" - SAPI's "assignGate" is the only gate-write it
        // documents, so this is used both for the pilot's first ask and any follow-up change.
        app.MapPost("/api/dispatch/gate", async (DispatchGateRequest req) =>
        {
            if (settings.DispatchDataSource == "vatsim")
                return Results.BadRequest(new { ok = false, error = "Gate requests need SayIntentions.AI - switch Dispatch's data source in Settings." });
            if (settings.SayIntentionsApiCode.Length == 0)
                return Results.BadRequest(new { ok = false, error = "SayIntentions.AI API code must be set in Settings first." });
            if (string.IsNullOrWhiteSpace(req.Airport))
                return Results.BadRequest(new { ok = false, error = "Airport is required." });
            if (string.IsNullOrWhiteSpace(req.Gate))
                return Results.BadRequest(new { ok = false, error = "Gate is required." });

            try
            {
                using var result = await sayIntentionsClient.AssignGateAsync(
                    settings.SayIntentionsApiCode, req.Airport.Trim().ToUpperInvariant(), req.Gate.Trim());
                var assignedGate = result.RootElement.TryGetProperty("assigned_gate_name", out var g) ? g.GetString() : null;
                return Results.Ok(new { ok = true, assignedGate });
            }
            catch (Exception ex)
            {
                return Results.Problem($"SayIntentions.AI gate request failed: {ex.Message}", statusCode: 502);
            }
        });

        app.MapGet("/api/network/interfaces", () => Results.Ok(GetLocalIPv4Addresses()));

        app.MapGet("/api/flight/state", () =>
        {
            lock (flightLock)
            {
                return Results.Ok(new { connected = simConnected, state = latestFlightState });
            }
        });

        // See flightTrail's own comment above for why this is recorded server-side rather than
        // by whichever client has Flight Tracker open.
        app.MapGet("/api/flight/trail", () =>
        {
            lock (flightTrailLock)
            {
                return Results.Ok(new { points = flightTrail.Select(p => new { lat = p.Lat, lon = p.Lon }) });
            }
        });

        app.MapGet("/api/simbrief/flightplan", () =>
        {
            lock (flightPlanLock)
            {
                return Results.Ok(new { flightPlan = currentFlightPlan });
            }
        });

        app.MapPost("/api/simbrief/import", async () =>
        {
            try
            {
                var plan = await SimBriefClient.FetchLatestAsync(settings.SimBriefId);
                lock (flightPlanLock) { currentFlightPlan = plan; }
                lock (flightTrailLock) { flightTrail.Clear(); lastTrailSampleUtc = null; }
                lock (loadsheetLock)
                {
                    paxSplit = null;
                    prelimLoadsheetTriggerUtc = null;
                    finalLoadsheetTriggerUtc = null;
                    preliminaryLoadsheet = null;
                    finalLoadsheet = null;
                }
                return Results.Ok(new { ok = true, flightPlan = plan });
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { ok = false, error = ex.Message });
            }
        });

        // Proxies the OFP PDF through our own server so the <iframe> that displays it is
        // same-origin - pointed straight at simbrief.com, Chrome's built-in PDF viewer
        // refuses to render inside the iframe at all (WebView2 is more permissive about
        // this, which is why it only showed up once testing moved to Chrome/Android). Used
        // by the desktop app's own native PDF viewer; everyone else just gets a plain link
        // to open the same URL themselves.
        app.MapGet("/api/simbrief/pdf", async () =>
        {
            string? pdfUrl;
            lock (flightPlanLock) { pdfUrl = currentFlightPlan?.PdfUrl; }
            if (pdfUrl is null) return Results.NotFound();

            try
            {
                var bytes = await SimBriefClient.DownloadBytesAsync(pdfUrl);
                return Results.File(bytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return Results.Problem($"Could not download the OFP PDF from SimBrief: {ex.Message}", statusCode: 502);
            }
        });

        // Same same-origin-proxy reasoning as /api/simbrief/pdf, for the Weather tab's SigWx/
        // UAD chart images - index is the chart's position in currentFlightPlan.ChartImages
        // (the Weather tab already has that list, from the flight plan it fetched to render
        // itself).
        app.MapGet("/api/simbrief/chart/{index:int}", async (int index) =>
        {
            string? chartUrl;
            lock (flightPlanLock)
            {
                var charts = currentFlightPlan?.ChartImages;
                chartUrl = charts is not null && index >= 0 && index < charts.Count ? charts[index].Url : null;
            }
            if (chartUrl is null) return Results.NotFound();

            try
            {
                var bytes = await SimBriefClient.DownloadBytesAsync(chartUrl);
                return Results.File(bytes, "image/gif");
            }
            catch (Exception ex)
            {
                return Results.Problem($"Could not download the chart image from SimBrief: {ex.Message}", statusCode: 502);
            }
        });

        // Same idea as /api/simbrief/chart/{index}, for the VP tab's single vertical profile
        // image - kept as its own endpoint rather than one more indexed entry since it isn't
        // part of the Weather tab's page sequence at all.
        app.MapGet("/api/simbrief/vpchart", async () =>
        {
            string? url;
            lock (flightPlanLock) { url = currentFlightPlan?.VerticalProfileImageUrl; }
            if (url is null) return Results.NotFound();

            try
            {
                var bytes = await SimBriefClient.DownloadBytesAsync(url);
                return Results.File(bytes, "image/gif");
            }
            catch (Exception ex)
            {
                return Results.Problem($"Could not download the vertical profile chart from SimBrief: {ex.Message}", statusCode: 502);
            }
        });

        // The PDF tab's own content - SimBrief's pre-rendered OFP as HTML (see
        // SimBriefFlightPlan.PlanHtml), served on its own endpoint rather than folded into
        // GET /api/simbrief/flightplan since it's typically 300-400 KB and every other tab
        // that just needs something like OriginIcao would otherwise pay for it too. The
        // embedded chart <img> tags point straight at simbrief.com - plain <img src> isn't
        // subject to the cross-origin restriction that made PdfUrl/ChartImages need proxying
        // (that was specifically about same-origin requirements for an <iframe>/PDF viewer),
        // so no proxying is needed here.
        app.MapGet("/api/simbrief/planhtml", () =>
        {
            string? html;
            lock (flightPlanLock) { html = currentFlightPlan?.PlanHtml; }
            if (string.IsNullOrEmpty(html)) return Results.NotFound();

            return Results.Text(html, "text/html");
        });

        // The Documents tab - any PDF dropped into the "RealEFB Documents" folder (created
        // under the user's own Documents folder on every launch - see documentsFolder above)
        // shows up here. Re-scans the folder and re-reads each PDF's page count on every
        // request rather than caching it - simple, and cheap enough for the handful of PDFs
        // this is meant for (reading a page count doesn't render anything).
        app.MapGet("/api/documents", () =>
        {
            var documents = new List<object>();
            foreach (var file in Directory.EnumerateFiles(documentsFolder, "*.pdf", SearchOption.TopDirectoryOnly)
                         .OrderBy(f => Path.GetFileName(f), StringComparer.OrdinalIgnoreCase))
            {
                try
                {
                    using var stream = File.OpenRead(file);
                    var pageCount = PDFtoImage.Conversion.GetPageCount(stream);
                    documents.Add(new { fileName = Path.GetFileName(file), pageCount });
                }
                catch
                {
                    // A corrupt/unreadable PDF just doesn't show up, rather than breaking the
                    // whole list for every other document in the folder.
                }
            }

            return Results.Ok(new { documents, folderPath = documentsFolder });
        });

        // Renders one page of one PDF from the Documents folder as a PNG, the same page-by-page
        // pattern as the Weather tab's charts instead of embedding a real PDF viewer. "file" is
        // validated to be a bare filename that resolves inside documentsFolder (no
        // subdirectories, no ".." traversal) since this is a LAN-reachable endpoint and could
        // otherwise be used to read arbitrary files off the host machine.
        app.MapGet("/api/documents/page", (string file, int index) =>
        {
            if (string.IsNullOrWhiteSpace(file) || Path.GetFileName(file) != file)
                return Results.BadRequest(new { ok = false, error = "Invalid file name." });

            var fullPath = Path.Combine(documentsFolder, file);
            if (!File.Exists(fullPath)) return Results.NotFound();

            try
            {
                using var pdfStream = File.OpenRead(fullPath);
                using var imageStream = new MemoryStream();
                PDFtoImage.Conversion.SavePng(imageStream, pdfStream, page: index);
                return Results.File(imageStream.ToArray(), "image/png");
            }
            catch (Exception ex)
            {
                return Results.Problem($"Could not render page {index} of {file}: {ex.Message}", statusCode: 502);
            }
        });

        // Shared across every device on the LAN - saving from the desktop app makes the same
        // values show up on a tablet that opens the Flight Log tab afterward, and vice versa.
        app.MapGet("/api/simbrief/flightlog", () =>
        {
            lock (flightLogLock) { return Results.Ok(new { flightLog = savedFlightLog }); }
        });

        app.MapPost("/api/simbrief/flightlog", (FlightLogEntry entry) =>
        {
            lock (flightLogLock) { savedFlightLog = entry; }
            return Results.Ok(new { ok = true });
        });

        // Log Flight's actual PDF step - called by app.js (logFlight()) from the desktop app or
        // any LAN tablet alike, since both just make the same HTTP request. The real work
        // (rendering print/flightlog.html off-screen and writing the PDF to this PC's own
        // Documents\RealEFB Documents\FlightLogs) can only happen on the UI thread MainForm's
        // WebView2s are affinitized to, so this just bridges the request over to it.
        app.MapPost("/api/flightlog/print", async (FlightLogPrintRequest req) =>
        {
            var mainForm = MainForm.Instance;
            if (mainForm is null)
                return Results.Problem("The desktop app isn't ready yet - try again in a moment.", statusCode: 503);

            var result = await mainForm.PrintFlightLogAsync(req.SuggestedName);
            if (!result.Ok)
                return Results.Problem(result.Error ?? "Could not save the flight log PDF.", statusCode: 500);

            return Results.Ok(new { ok = true });
        });

        app.MapGet("/api/simbrief/fuelfmc", () =>
        {
            lock (fuelFmcLock) { return Results.Ok(new { fuelFmc = savedFuelFmc }); }
        });

        app.MapPost("/api/simbrief/fuelfmc", (FuelFmcEntry entry) =>
        {
            lock (fuelFmcLock) { savedFuelFmc = entry; }
            return Results.Ok(new { ok = true });
        });

        app.MapGet("/api/simbrief/waypoints", () =>
        {
            lock (waypointsLock) { return Results.Ok(new { waypoints = savedWaypoints }); }
        });

        app.MapPost("/api/simbrief/waypoints", (WaypointsEntry entry) =>
        {
            lock (waypointsLock) { savedWaypoints = entry; }
            return Results.Ok(new { ok = true });
        });

        // The Dispatch app's two automatic loadsheets - preliminary fires at a random point
        // 20-25 minutes before ScheduledOutUtc (off-block), final at a random point 4-7
        // minutes before it, always strictly after the preliminary since 7 < 20. Lazily
        // evaluated on each poll rather than a background timer, same pattern as every other
        // timing-sensitive endpoint in this file: roll each random trigger time the first time
        // it's asked for, then flip that loadsheet from null to a real snapshot the first poll
        // after its own trigger time has passed.
        app.MapGet("/api/dispatch/loadsheet", () =>
        {
            SimBriefFlightPlan? fp;
            lock (flightPlanLock) { fp = currentFlightPlan; }
            if (fp is null) return Results.Ok(new { ok = true, hasFlight = false });

            lock (loadsheetLock)
            {
                if (paxSplit is null)
                    paxSplit = GenerateRealisticPaxSplit((int)Math.Round(fp.PaxCountActual ?? 0));

                // The Final Loadsheet's notification pill is meaningless once RealEFB was
                // launched well after the fact - if you only opened the app 5+ minutes past
                // off-block, "just received" doesn't apply, whether that's because the loadsheet
                // fired while the app was closed or SimBrief import itself simply happened late.
                // Suppresses only the notification (see checkLoadsheetNotifications in app.js) -
                // the loadsheet itself is still generated and shown normally in Dispatch either
                // way, exactly as before.
                var finalNotificationSuppressed =
                    fp.ScheduledOutUtc is { } schedForSuppress && appStartUtc > schedForSuppress.AddMinutes(5);

                if (fp.ScheduledOutUtc is { } sched)
                {
                    prelimLoadsheetTriggerUtc ??= sched.AddMinutes(-(20 + Random.Shared.NextDouble() * 5)); // 20.0 - 25.0
                    finalLoadsheetTriggerUtc ??= sched.AddMinutes(-(4 + Random.Shared.NextDouble() * 3)); // 4.0 - 7.0

                    var (adults, children, infants) = paxSplit.Value;
                    var now = DateTimeOffset.UtcNow;
                    var totalPax = adults + children + infants;

                    if (preliminaryLoadsheet is null && now >= prelimLoadsheetTriggerUtc)
                        preliminaryLoadsheet = new LoadsheetInfo(now, adults, children, infants, totalPax, "pending", null, false, null);

                    if (finalLoadsheet is null && now >= finalLoadsheetTriggerUtc)
                        finalLoadsheet = new LoadsheetInfo(now, adults, children, infants, totalPax, "pending", null, false, null);
                }

                return Results.Ok(new
                {
                    ok = true,
                    hasFlight = true,
                    preliminary = preliminaryLoadsheet,
                    final = finalLoadsheet,
                    finalNotificationSuppressed
                });
            }
        });

        // Marks the final loadsheet accepted - the preliminary one is informational only and
        // has no equivalent endpoint. Idempotent: only moves Status out of "pending" once, so
        // a repeat call (or a call after it was denied) doesn't flip it back or reset DecidedUtc.
        app.MapPost("/api/dispatch/loadsheet/accept", () =>
        {
            lock (loadsheetLock)
            {
                if (finalLoadsheet is null)
                    return Results.BadRequest(new { ok = false, error = "No final loadsheet to accept yet." });

                if (finalLoadsheet.Status == "pending")
                    finalLoadsheet = finalLoadsheet with { Status = "accepted", DecidedUtc = DateTimeOffset.UtcNow };

                return Results.Ok(new { ok = true, final = finalLoadsheet });
            }
        });

        // The DENY counterpart - for now this just records the decision (no re-issue/amend
        // workflow yet). Same idempotent "only out of pending once" rule as accept.
        app.MapPost("/api/dispatch/loadsheet/deny", () =>
        {
            lock (loadsheetLock)
            {
                if (finalLoadsheet is null)
                    return Results.BadRequest(new { ok = false, error = "No final loadsheet to deny yet." });

                if (finalLoadsheet.Status == "pending")
                    finalLoadsheet = finalLoadsheet with { Status = "denied", DecidedUtc = DateTimeOffset.UtcNow };

                return Results.Ok(new { ok = true, final = finalLoadsheet });
            }
        });

        // Marks the accepted final loadsheet as sent to the Flight Log's Payload section - the
        // frontend does the actual sending (a plain POST to /api/simbrief/flightlog, see
        // sendFinalLoadsheetToEfl in app.js), this just records that it happened so the "Send
        // to EFL" button shows correctly as already-sent if Dispatch is reopened later.
        app.MapPost("/api/dispatch/loadsheet/sent-to-efl", () =>
        {
            lock (loadsheetLock)
            {
                if (finalLoadsheet is null || finalLoadsheet.Status != "accepted")
                    return Results.BadRequest(new { ok = false, error = "The final loadsheet must be accepted first." });

                if (!finalLoadsheet.SentToEfl)
                    finalLoadsheet = finalLoadsheet with { SentToEfl = true, SentToEflUtc = DateTimeOffset.UtcNow };

                return Results.Ok(new { ok = true, final = finalLoadsheet });
            }
        });

        // Print via SimPrinter - see SimPrinterClient for why this is relayed server-side
        // rather than the frontend calling SimPrinter's loopback-only print server directly.
        app.MapPost("/api/dispatch/print", async (DispatchPrintRequest req) =>
        {
            if (string.IsNullOrWhiteSpace(req.Text))
                return Results.BadRequest(new { ok = false, error = "Nothing to print." });

            try
            {
                await simPrinterClient.PrintAsync(req.Text);
                return Results.Ok(new { ok = true });
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    $"Could not reach SimPrinter - make sure it's running with \"Allow the SimPrinter browser extension to print\" enabled in its Settings. ({ex.Message})",
                    statusCode: 502);
            }
        });

        // Block synchronously rather than awaiting here - this Main runs on the explicit
        // STA thread WebView2 needs, and an await without a SynchronizationContext yet
        // installed can resume on a thread-pool (MTA) thread, which throws RPC_E_CHANGED_MODE
        // the moment WebView2 tries to initialize its COM apartment.
        app.StartAsync().GetAwaiter().GetResult();

        using var mainForm = new MainForm($"http://localhost:{settings.Port}");
        Application.Run(mainForm);

        simConnectClient.Dispose();
        app.StopAsync().GetAwaiter().GetResult();
    }

    // Lists every IPv4 address this PC currently has, since a laptop with Wi-Fi + Ethernet
    // (or a VPN) often has several - the Settings screen shows all of them so the user can
    // pick the one that matches their tablet's network rather than guessing.
    private static List<object> GetLocalIPv4Addresses()
    {
        var results = new List<object>();
        try
        {
            foreach (var ni in NetworkInterface.GetAllNetworkInterfaces())
            {
                if (ni.OperationalStatus != OperationalStatus.Up) continue;
                if (ni.NetworkInterfaceType == NetworkInterfaceType.Loopback) continue;

                foreach (var addr in ni.GetIPProperties().UnicastAddresses)
                {
                    if (addr.Address.AddressFamily != AddressFamily.InterNetwork) continue;
                    results.Add(new { name = ni.Name, address = addr.Address.ToString() });
                }
            }
        }
        catch
        {
            // Best-effort - an empty list just means the Settings screen shows no rows.
        }
        return results;
    }

    // A realistic-looking adults/children/infants split for the Weight & Balance app's
    // loadsheets - SimBrief only gives a total pax count, not a breakdown, so this rolls one.
    // Rates are randomized per flight (not a fixed ratio) so two different flights don't
    // always show the exact same split, but stay within real-world ranges: infants (lap
    // infants, essentially always travelling with an adult) are a small share, children a
    // modest one, and the rest adults. A tiny cabin (a handful of pax) keeps at least one
    // adult rather than letting rounding claim the whole thing as children/infants.
    private static (int Adults, int Children, int Infants) GenerateRealisticPaxSplit(int totalPax)
    {
        if (totalPax <= 0) return (0, 0, 0);

        var rng = Random.Shared;
        double infantRate = 0.005 + rng.NextDouble() * 0.02; // ~0.5% - 2.5%
        double childRate = 0.03 + rng.NextDouble() * 0.07; // ~3% - 10%

        int infants = (int)Math.Round(totalPax * infantRate);
        int children = (int)Math.Round(totalPax * childRate);
        if (infants + children >= totalPax)
        {
            infants = totalPax > 4 ? infants : 0;
            children = Math.Max(0, Math.Min(children, totalPax - infants - 1));
        }
        int adults = totalPax - infants - children;
        return (adults, children, infants);
    }
}
