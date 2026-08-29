using System.Diagnostics;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace RealEFB;

// What PrintFlightLogAsync hands back to whoever asked for a Log Flight save - Program.cs's
// POST /api/flightlog/print turns this straight into the HTTP response, so both the desktop
// app's own click and a LAN tablet's get the same real success/failure, not just "message
// sent".
internal readonly record struct PrintFlightLogResult(bool Ok, string? Error);

internal sealed class MainForm : Form
{
    // The only MainForm there ever is - set at the end of the constructor, read by Program.cs's
    // POST /api/flightlog/print handler (which runs on Kestrel's own thread pool, not this
    // form's UI thread) to reach PrintFlightLogAsync. Null for the brief moment between
    // app.StartAsync() returning and this constructor finishing; that handler treats null as
    // "not ready yet" rather than crashing.
    internal static MainForm? Instance { get; private set; }

    private readonly string _localUrl;

    private readonly WebView2 _webView = new() { Dock = DockStyle.Fill };

    // The embedded-site view, used by the browser-backed apps (VPT Performance Calculator,
    // SimBrief - see APPS in app.js). A second WebView2 rather than an iframe inside RealEFB's
    // own page, because every one of these sites signs in through a provider that refuses to
    // render in a frame at all (login.live.com sends "X-Frame-Options: deny", which blocks
    // framing from ANY origin, same-origin included). A WebView2 loads its URL as a top-level
    // document, so that header simply doesn't apply. It fills the same area RealEFB itself
    // occupies rather than opening a window of its own, so it reads as an app inside the EFB.
    private readonly WebView2 _siteView = new() { Dock = DockStyle.Fill, Visible = false };

    // A third WebView2, permanently invisible and outside the visible _webView/_siteView layout
    // entirely - dedicated to rendering print/flightlog.html for Log Flight (see
    // PrintFlightLogAsync below). Kept separate from _webView specifically because a Log Flight
    // request can now arrive from a LAN tablet with no relation to whatever the pilot happens to
    // have open on this PC's own screen - printing "whatever's currently on the page" (the old
    // approach) only worked because the desktop's own click always fired from the same page that
    // was showing. Given a fixed render size since it's never laid out by the docked
    // TableLayoutPanel below.
    private readonly WebView2 _printView = new() { Visible = false, Size = new Size(1024, 768) };

    private readonly Panel _siteBar = new() { Dock = DockStyle.Fill, Height = 34, Visible = false };
    private readonly Button _siteBack = new()
    {
        Text = "◀ Back to RealEFB",
        Dock = DockStyle.Left,
        Width = 150,
        FlatStyle = FlatStyle.Flat,
    };
    private readonly Label _siteTitle = new() { Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft };

    // Shared by every WebView2 control below - all three need to be given the *same*
    // environment object, not just equivalent ones, so they behave as one coherent browser
    // instance (same cookie jar for _siteView's OAuth sign-ins, same cache/profile on disk).
    // Created once in Load, before any of them call EnsureCoreWebView2Async; never null by the
    // time OpenEmbeddedSiteAsync can actually be reached (that only happens via a page message
    // the loaded UI sends, and the UI isn't loaded until after Load has already set this).
    private CoreWebView2Environment? _webViewEnvironment;

    internal MainForm(string localUrl)
    {
        _localUrl = localUrl;

        Text = "RealEFB";
        Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
        ClientSize = new Size(820, 1040);
        MinimumSize = new Size(480, 640);
        StartPosition = FormStartPosition.CenterScreen;

        _siteBack.FlatAppearance.BorderSize = 0;
        _siteBack.Click += (_, _) => CloseEmbeddedSite();
        _siteBar.Controls.Add(_siteTitle);
        _siteBar.Controls.Add(_siteBack);

        // Both WebView2s live in this panel, one visible at a time. A hidden WebView2 doesn't
        // paint, so there's no "airspace" clash between the two.
        var content = new Panel { Dock = DockStyle.Fill };
        content.Controls.Add(_siteView);
        content.Controls.Add(_webView);

        // A TableLayoutPanel rather than relying on Dock order between _siteBar and the content
        // panel directly - WebView2 hosts its content in its own child HWND, which paints over
        // anything it overlaps regardless of normal WinForms Z-order ("airspace"), so the two
        // need genuinely non-overlapping bounds, not just a dock-order that happens to look
        // right.
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 2 };
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        layout.Controls.Add(_siteBar, 0, 0);
        layout.Controls.Add(content, 0, 1);
        Controls.Add(layout);

        // Not part of `content`/`layout` at all - it never shows on screen, so it has no place
        // in the visible docking above. Still needs to be a child control for WebView2 to get a
        // real HWND to render into.
        Controls.Add(_printView);

        Load += async (_, _) =>
        {
            // WebView2 defaults to creating its user-data folder (cache, cookies, GPU cache,
            // ...) right next to the executable when no environment is given - fine for a dev
            // build run straight out of bin\, but the installed copy lives in Program Files,
            // which a standard (non-admin) user can't write to, so that default throws
            // E_ACCESSDENIED the instant the first WebView2 control tries to initialize.
            // %LocalAppData% is always writable by whoever's running the app and is the right
            // place for machine-local browser-profile-style data - unlike %AppData%\RealEFB,
            // which is where AppSettings.cs keeps small roaming settings.
            var userDataFolder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "RealEFB", "WebView2");
            _webViewEnvironment = await CoreWebView2Environment.CreateAsync(userDataFolder: userDataFolder);

            await _webView.EnsureCoreWebView2Async(_webViewEnvironment);

            // Links with target="_blank" (the SimBrief OFP PDF, say) would otherwise open in
            // a brand-new WebView2-hosted popup window - not useful here. Cancel that and
            // hand the URL to the system's actual default browser instead.
            _webView.CoreWebView2.NewWindowRequested += (_, e) =>
            {
                e.Handled = true;
                Process.Start(new ProcessStartInfo(e.Uri) { UseShellExecute = true });
            };

            _webView.CoreWebView2.WebMessageReceived += async (_, e) =>
            {
                var json = e.TryGetWebMessageAsString();
                if (json is null) return;

                using var message = JsonDocument.Parse(json);
                var root = message.RootElement;
                var type = root.GetProperty("type").GetString();

                if (type == "open-site")
                {
                    // URL and title both come from APPS in app.js, so that list stays the one
                    // place a browser-backed app is defined.
                    var url = root.TryGetProperty("url", out var u) ? u.GetString() : null;
                    var title = root.TryGetProperty("title", out var t) ? t.GetString() : null;
                    if (url is not null) await OpenEmbeddedSiteAsync(url, title ?? "");
                }
            };

            _webView.CoreWebView2.Navigate(localUrl);

            // _printView's own bridge - see PrintFlightLogCoreAsync/print-flightlog.js. Set up
            // eagerly here rather than lazily on first print, so the very first Log Flight
            // doesn't pay EnsureCoreWebView2Async's startup cost on top of everything else.
            await _printView.EnsureCoreWebView2Async(_webViewEnvironment);
            _printView.CoreWebView2.WebMessageReceived += (_, e) =>
            {
                var json = e.TryGetWebMessageAsString();
                if (json is null) return;

                using var message = JsonDocument.Parse(json);
                var root = message.RootElement;
                if (root.GetProperty("type").GetString() != "print-ready") return;

                var ok = root.TryGetProperty("ok", out var okProp) && okProp.GetBoolean();
                var error = root.TryGetProperty("error", out var errProp) ? errProp.GetString() : null;
                _printReadyTcs?.TrySetResult((ok, error));
            };
        };

        Instance = this;
    }

    private bool _siteViewWired;

    private async Task OpenEmbeddedSiteAsync(string url, string title)
    {
        await _siteView.EnsureCoreWebView2Async(_webViewEnvironment);

        // Wired once, not per open - EnsureCoreWebView2Async returns immediately on later calls
        // and the same CoreWebView2 persists, so re-subscribing here would stack a fresh handler
        // on every tile press and navigate several times per popup.
        if (!_siteViewWired)
        {
            _siteViewWired = true;

            // Keep sign-in popups inside this same view rather than spawning a window - these
            // sites hand off to Microsoft/Navigraph OAuth, and the whole point of embedding is
            // that nothing pops out of the EFB. Same view means the same cookie jar, so the
            // session that comes back is the one this view is signed in with.
            _siteView.CoreWebView2.NewWindowRequested += (_, e) =>
            {
                e.Handled = true;
                _siteView.CoreWebView2.Navigate(e.Uri);
            };
        }

        _siteTitle.Text = $"  {title}";
        _siteView.CoreWebView2.Navigate(url);

        _siteBar.Visible = true;
        _siteView.Visible = true;
        _webView.Visible = false;
    }

    private void CloseEmbeddedSite()
    {
        _webView.Visible = true;
        _siteView.Visible = false;
        _siteBar.Visible = false;

        // Park it on a blank page so the site isn't left running (timers, audio, polling) in
        // the background once the pilot has gone back to the EFB.
        _siteView.CoreWebView2?.Navigate("about:blank");
    }

    private TaskCompletionSource<(bool Ok, string? Error)>? _printReadyTcs;
    private readonly SemaphoreSlim _printLock = new(1, 1);

    // Entry point for POST /api/flightlog/print (see Program.cs), called from Kestrel's own
    // thread pool - everything from here on needs to run on this form's UI thread, since that's
    // the one _printView's COM apartment is affinitized to. Invoke hops the actual work over
    // there; the WindowsFormsSynchronizationContext that's active once we're running on that
    // thread is what brings every "await" inside PrintFlightLogCoreAsync back there too, so the
    // Task handed back here can still be awaited from Kestrel's thread same as any other.
    internal Task<PrintFlightLogResult> PrintFlightLogAsync(string suggestedName)
    {
        if (InvokeRequired)
            return (Task<PrintFlightLogResult>)Invoke(new Func<Task<PrintFlightLogResult>>(() => PrintFlightLogCoreAsync(suggestedName)));

        return PrintFlightLogCoreAsync(suggestedName);
    }

    private async Task<PrintFlightLogResult> PrintFlightLogCoreAsync(string suggestedName)
    {
        // One print at a time through the shared _printView - a second request arriving while
        // one's still in flight (the desktop and a tablet both hitting Log Flight close
        // together, say) would otherwise navigate out from under the first one's PrintToPdfAsync.
        await _printLock.WaitAsync();
        try
        {
            var tcs = new TaskCompletionSource<(bool Ok, string? Error)>(TaskCreationOptions.RunContinuationsAsynchronously);
            _printReadyTcs = tcs;

            // print/flightlog.html fetches the current flight plan + saved Flight Log entry
            // itself and posts back "print-ready" once the report's actually built - see
            // print-flightlog.js.
            _printView.CoreWebView2.Navigate($"{_localUrl}/print/flightlog.html");

            var completed = await Task.WhenAny(tcs.Task, Task.Delay(TimeSpan.FromSeconds(15)));
            if (completed != tcs.Task)
                return new PrintFlightLogResult(false, "Timed out building the flight log PDF.");

            var (ok, error) = await tcs.Task;
            if (!ok) return new PrintFlightLogResult(false, error ?? "Could not build the flight log PDF.");

            var fileName = $"{SanitizeFileName(string.IsNullOrWhiteSpace(suggestedName) ? "FlightLog" : suggestedName)}.pdf";

            // No Save dialog to pick a location from - every Flight Log lands in the same
            // place, Documents\RealEFB Documents\FlightLogs, so there's nothing for anyone
            // (desktop or tablet) to choose.
            var folder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                "RealEFB Documents",
                "FlightLogs");
            Directory.CreateDirectory(folder);
            var path = UniquePath(Path.Combine(folder, fileName));

            var printSettings = _printView.CoreWebView2.Environment.CreatePrintSettings();
            printSettings.ShouldPrintBackgrounds = true;
            printSettings.ShouldPrintHeaderAndFooter = false;
            await _printView.CoreWebView2.PrintToPdfAsync(path, printSettings);

            return new PrintFlightLogResult(true, null);
        }
        catch (Exception ex)
        {
            return new PrintFlightLogResult(false, ex.Message);
        }
        finally
        {
            _printReadyTcs = null;
            // Parked on a blank page rather than left on the report - nothing polls or plays
            // there, but this keeps the same "don't leave a page running idle" habit _siteView's
            // own CloseEmbeddedSite follows.
            _printView.CoreWebView2?.Navigate("about:blank");
            _printLock.Release();
        }
    }

    private static string SanitizeFileName(string name)
    {
        foreach (var c in Path.GetInvalidFileNameChars())
            name = name.Replace(c, '_');
        return name;
    }

    // Windows' own "name (2).ext" convention for a file that already exists there, rather than
    // silently overwriting a previous flight's log - Log Flight has no Save dialog left for
    // anyone to rename from (see PrintFlightLogCoreAsync above), so this is the only thing
    // standing between two flights under the same callsign and one clobbering the other.
    private static string UniquePath(string path)
    {
        if (!File.Exists(path)) return path;

        var dir = Path.GetDirectoryName(path)!;
        var name = Path.GetFileNameWithoutExtension(path);
        var ext = Path.GetExtension(path);

        for (var i = 2; ; i++)
        {
            var candidate = Path.Combine(dir, $"{name} ({i}){ext}");
            if (!File.Exists(candidate)) return candidate;
        }
    }
}
