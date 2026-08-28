using System.Text.Json;

namespace RealEFB;

internal sealed class AppSettings
{
    public int Port { get; set; } = 5150;
    public string SimBriefId { get; set; } = "";

    // Each integration below has its own on/off flag, independent of whether credentials are
    // saved - so a user can flip one off without losing/retyping the key, and back on later.
    // Nothing yet reads these to actually gate behavior (see VptEnabled's own note) - they
    // exist now so Settings and the setup wizard have something real to switch.
    public bool SayIntentionsEnabled { get; set; } = false;
    public string SayIntentionsApiCode { get; set; } = "";

    // Virtual Performance Tool (api.virtualperformancetool.com) - see VptClient. Unlike a
    // simple API key, VPT's login needs all three of these together (developer key plus a VPT
    // account's own email/password) to exchange for the JWT actual calculation calls use.
    public bool VptEnabled { get; set; } = false;
    public string VptDeveloperKey { get; set; } = "";
    public string VptEmail { get; set; } = "";
    public string VptPassword { get; set; } = "";

    // Which home-screen apps are switched on - see Settings > Apps, keyed by the app ids in
    // APPS in app.js. Deliberately a dictionary rather than a bool per app: an id that isn't
    // in here yet counts as enabled (see app.js's appEnabled), so adding an app in a later
    // version makes it show up for existing users instead of silently staying hidden until
    // they go find a switch. Settings itself is never in here - turning that off would leave
    // no way to turn anything back on.
    public Dictionary<string, bool> EnabledApps { get; set; } = new();

    // Which source the Dispatch app pulls from - "sayintentions" or "vatsim". A VATSIM-only
    // user has no reason to also flip on the SayIntentions.AI integration itself, which is why
    // this is separate from SayIntentionsEnabled above.
    public string DispatchDataSource { get; set; } = "sayintentions";

    // User-added home-screen apps, each just a name + URL (opened embedded on the desktop app,
    // a new tab on a LAN tablet - see WEB_APPS/openAppSite in app.js). Seeded with three common
    // ones on a settings.json that's never had this list before - both a brand new install and
    // an existing one updating to a version that just gained this feature (Deserialize leaves a
    // property's initializer value alone when the saved JSON has no key for it at all, but an
    // explicit `"webApps": []` - the shape a user who deleted all three saves right back to
    // disk - overrides it, so a deliberate "none of these" sticks). Icon is deliberately never
    // seeded (see SeedDefaultWebApps) - only ever set when a user uploads their own from
    // Settings, so the app can ship with zero third-party logos baked in.
    public List<WebApp> WebApps { get; set; } = SeedDefaultWebApps();

    // Shown once, the first time RealEFB is ever run (see startApp() in app.js) - flipped to
    // true on completion and never shown again automatically after that, though Settings has
    // its own button to run it again on purpose.
    public bool SetupWizardCompleted { get; set; } = false;

    private static string FilePath => Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "RealEFB", "settings.json");

    internal static AppSettings Load()
    {
        try
        {
            if (File.Exists(FilePath))
            {
                var loaded = JsonSerializer.Deserialize<AppSettings>(File.ReadAllText(FilePath));
                if (loaded is not null && loaded.Port is > 0 and <= 65535)
                    return loaded;
            }
        }
        catch
        {
            // A missing, corrupt, or unreadable settings file shouldn't prevent startup -
            // just fall back to defaults below.
        }
        return new AppSettings();
    }

    internal void Save()
    {
        var dir = Path.GetDirectoryName(FilePath)!;
        Directory.CreateDirectory(dir);
        File.WriteAllText(FilePath, JsonSerializer.Serialize(this));
    }

    // Three sites almost everyone flying with RealEFB already uses, so Settings > Website Apps
    // isn't empty on day one - all still just ordinary entries in WebApps once seeded, editable
    // and deletable exactly like anything a user adds themselves. No Icon on any of them: this
    // ships as part of RealEFB, so nothing here can bundle a logo whose owner hasn't given
    // permission for that - a user who wants one uploads it themselves, on their own PC only.
    private static List<WebApp> SeedDefaultWebApps() =>
    [
        new WebApp { Id = "simbrief-dispatch", Name = "SimBrief Dispatch", Url = "https://dispatch.simbrief.com/" },
        new WebApp { Id = "msfs-flight-planner", Name = "MSFS Flight Planner", Url = "https://planner.flightsimulator.com/" },
        new WebApp { Id = "navigraph-charts", Name = "Navigraph Charts Web", Url = "https://charts.navigraph.com/" },
    ];
}

// One user-added (or seeded, see SeedDefaultWebApps) home-screen web app. Icon is a data URL
// (e.g. "data:image/png;base64,...") straight from an <input type="file"> the user picked in
// Settings, stored as-is - simplest thing that works for something this small, and settings.json
// is already a plain single file with no other asset storage nearby to put it in instead.
internal sealed class WebApp
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Url { get; set; } = "";
    public string? Icon { get; set; }
}
