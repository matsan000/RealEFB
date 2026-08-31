using System.Text.Json;

namespace RealEFB;

/// <summary>
/// Talks to SayIntentions.AI's SAPI (https://apipri.sayintentions.ai/sapi) on the pilot's
/// behalf - used by the Dispatch app for METAR/ATIS lookups and gate requests. Every endpoint
/// here is a plain GET with the account's API code as a query-string "api_key" param - SAPI's
/// own documented auth scheme, no bearer token/login step needed.
///
/// SAPI returns HTTP 200 with a JSON body even for a request-level failure (e.g. an unknown
/// gate, a missing/invalid api_key) - the error shows up as an "error" string field in an
/// otherwise-200 response rather than as a non-2xx status code, so every call here checks for
/// that field explicitly and throws if it's present, in addition to the normal status-code check.
/// </summary>
internal sealed class SayIntentionsClient
{
    private const string BaseUrl = "https://apipri.sayintentions.ai/sapi";

    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(15) };

    /// <summary>
    /// "getWX" - current weather (METAR/TAF/ATIS, active runway, wind) for one airport ICAO.
    /// </summary>
    public Task<JsonDocument> GetWeatherAsync(string apiKey, string icao) =>
        GetAsync($"getWX?api_key={Uri.EscapeDataString(apiKey)}&icao={Uri.EscapeDataString(icao)}");

    /// <summary>
    /// "getParking" - the currently-assigned gate/stand for the active flight, if SayIntentions
    /// has assigned one yet. No airport param - it's always about the current flight's own
    /// session, per SAPI's own docs.
    /// </summary>
    public Task<JsonDocument> GetParkingAsync(string apiKey) =>
        GetAsync($"getParking?api_key={Uri.EscapeDataString(apiKey)}");

    /// <summary>
    /// "assignGate" - requests a specific gate at a specific airport. This is the only
    /// gate-related write SAPI documents (there's no separate "just tell me what's expected
    /// without committing" query) - used both for the initial "what gate can I expect" ask and
    /// for a follow-up "give me a different one" ask, just with a different gate value.
    /// </summary>
    public Task<JsonDocument> AssignGateAsync(string apiKey, string airport, string gate) =>
        GetAsync($"assignGate?api_key={Uri.EscapeDataString(apiKey)}&airport={Uri.EscapeDataString(airport)}&gate={Uri.EscapeDataString(gate)}");

    private static async Task<JsonDocument> GetAsync(string pathAndQuery)
    {
        using var response = await Http.GetAsync($"{BaseUrl}/{pathAndQuery}");
        var responseText = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"SayIntentions.AI returned {(int)response.StatusCode}: {responseText}");

        var doc = JsonDocument.Parse(responseText);
        if (doc.RootElement.ValueKind == JsonValueKind.Object &&
            doc.RootElement.TryGetProperty("error", out var errorEl) &&
            errorEl.ValueKind == JsonValueKind.String)
        {
            var message = errorEl.GetString();
            doc.Dispose();
            throw new InvalidOperationException(message);
        }

        return doc;
    }
}
