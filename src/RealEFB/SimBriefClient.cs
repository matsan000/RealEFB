using System.Text.Json;

namespace RealEFB;

/// <summary>Ported from SimCallouts/SimPrinter's SimBriefClient - same API, same error handling.</summary>
internal static class SimBriefClient
{
    private static readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(15) };

    /// <summary>
    /// Fetches the pilot's latest SimBrief OFP.
    /// Accepts either a numeric SimBrief pilot ID or a SimBrief username.
    /// </summary>
    public static async Task<SimBriefFlightPlan> FetchLatestAsync(string userIdentifier)
    {
        if (string.IsNullOrWhiteSpace(userIdentifier))
            throw new ArgumentException("Enter your SimBrief username or pilot ID in Settings first.");

        userIdentifier = userIdentifier.Trim();

        // SimBrief accepts either "userid" (numeric) or "username" (text)
        string param = userIdentifier.All(char.IsDigit) ? "userid" : "username";
        string url = $"https://www.simbrief.com/api/xml.fetcher.php?{param}={Uri.EscapeDataString(userIdentifier)}&json=1";

        HttpResponseMessage response;
        try
        {
            response = await _http.GetAsync(url);
        }
        catch (Exception ex)
        {
            throw new Exception($"Could not reach SimBrief (network error): {ex.Message}");
        }

        if (!response.IsSuccessStatusCode)
            throw new Exception($"SimBrief returned HTTP {(int)response.StatusCode}. Check your username/ID.");

        string json = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(json);

        // SimBrief embeds a "fetch" status block indicating success/failure
        if (doc.RootElement.TryGetProperty("fetch", out var fetchEl) &&
            fetchEl.TryGetProperty("status", out var statusEl))
        {
            string status = statusEl.GetString() ?? "";
            if (!status.Contains("Success", StringComparison.OrdinalIgnoreCase))
                throw new Exception($"SimBrief error: {status}");
        }

        return SimBriefFlightPlan.FromJson(doc);
    }

    /// <summary>Downloads raw bytes from a SimBrief-hosted URL (the OFP PDF, say) - used to
    /// proxy it through our own server so the PDF viewer iframe is same-origin. Chrome
    /// declines to render its native PDF viewer inside a cross-origin iframe (WebView2's
    /// app-hosted context is more permissive, which is why this only mattered once testing
    /// moved to Chrome/Android) - serving it from our own origin sidesteps that entirely.</summary>
    public static async Task<byte[]> DownloadBytesAsync(string url) => await _http.GetByteArrayAsync(url);
}
