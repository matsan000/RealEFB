using System.Text.Json;

namespace RealEFB;

// (System.Linq's Select/Where extension methods below come from the implicit global usings
// this project already builds with - see RealEFB.csproj's ImplicitUsings.)

/// <summary>
/// Reads VATSIM's public data - no account or key needed, unlike SayIntentions.AI - so the
/// Dispatch app can work for pilots who don't use SayIntentions.AI. Only covers what VATSIM
/// actually has: a METAR feed, and ATIS text from whichever controller (if any) is actually
/// online for that airport right now. There's no VATSIM equivalent of a gate assignment, so
/// Dispatch's gate features are SayIntentions-only regardless of this client.
/// </summary>
internal sealed class VatsimClient
{
    private const string MetarUrl = "https://metar.vatsim.net/";
    private const string DataUrl = "https://data.vatsim.net/v3/vatsim-data.json";

    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(20) };

    /// <summary>
    /// A miss (unknown/offline ICAO) comes back as a 200 with an empty or non-METAR-looking
    /// body rather than a non-2xx status - treated as "no data" (null) rather than an error.
    /// </summary>
    public async Task<string?> GetMetarAsync(string icao)
    {
        using var response = await Http.GetAsync($"{MetarUrl}{Uri.EscapeDataString(icao)}");
        if (!response.IsSuccessStatusCode) return null;

        var text = (await response.Content.ReadAsStringAsync()).Trim();
        return text.StartsWith(icao, StringComparison.OrdinalIgnoreCase) ? text : null;
    }

    /// <summary>
    /// Pulls the current ATIS text for one airport out of VATSIM's full data feed's "atis"
    /// array - matched by callsign prefix (e.g. "EIDW_ATIS", "EIDW_D_ATIS"). Returns null if
    /// nobody's actually online providing ATIS there, which on VATSIM is the normal case for
    /// most airports most of the time.
    /// </summary>
    public async Task<string?> GetAtisAsync(string icao)
    {
        using var response = await Http.GetAsync(DataUrl);
        if (!response.IsSuccessStatusCode) return null;

        using var stream = await response.Content.ReadAsStreamAsync();
        using var doc = await JsonDocument.ParseAsync(stream);
        if (!doc.RootElement.TryGetProperty("atis", out var atisArray) || atisArray.ValueKind != JsonValueKind.Array)
            return null;

        foreach (var atis in atisArray.EnumerateArray())
        {
            var callsign = atis.TryGetProperty("callsign", out var cs) ? cs.GetString() : null;
            if (callsign is null || !callsign.StartsWith(icao, StringComparison.OrdinalIgnoreCase)) continue;
            if (!atis.TryGetProperty("text_atis", out var lines) || lines.ValueKind != JsonValueKind.Array) continue;

            var joined = string.Join(" ", lines.EnumerateArray()
                .Select(l => l.GetString())
                .Where(s => !string.IsNullOrWhiteSpace(s)));
            if (joined.Length > 0) return joined;
        }
        return null;
    }
}
