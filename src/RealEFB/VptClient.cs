using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace RealEFB;

/// <summary>
/// Talks to the Virtual Performance Tool API (api.virtualperformancetool.com) - takeoff/
/// landing performance calculations for a specific aircraft profile. Requires a VPT developer
/// key plus a VPT account's own email/password, all three configured in Settings; every call
/// here fails cleanly with a clear message if they're missing rather than attempting anything.
///
/// Authentication is two-step, not a simple bearer-API-key: first "log in" with the developer
/// key plus account email/password to get a JWT (documented as valid 30 days), then send that
/// JWT as "Authorization: Bearer &lt;token&gt;" on the actual calculation call. The token is
/// cached in memory and reused across calls rather than logging in again every time, since a
/// login is a separate request with its own round trip.
///
/// Request/response field names below are built with JsonObject/JsonNode rather than
/// strongly-typed C# records with [JsonPropertyName] attributes on every property - for a
/// third-party API where a single mistyped or wrongly-cased field name would silently break
/// the request, writing the field names out literally (e.g. ["windDirection"] = ...) makes
/// every one of them individually checkable against the documented schema, rather than
/// trusting an attribute list to all be correct.
/// </summary>
internal sealed class VptClient
{
    private const string BaseUrl = "https://api.virtualperformancetool.com/api";

    // "LATEST" is a special value VPT's own docs call out explicitly ("available for
    // development but not recommended for production" - pinning a real version number is the
    // documented best practice once the API stabilizes). Sent as the "X-API-Version" header on
    // every request - the Introduction page documents this as the API-wide way to pin a
    // version - and additionally as the "apiVersion" body field on "performance" queries
    // specifically, matching that endpoint's own documented request shape.
    private const string ApiVersion = "LATEST";

    // Auto-redirect explicitly disabled: live testing against VPT's own base URL intermittently
    // returned a 301 to a different path (https://.../htdocs/api/) instead of a normal response.
    // HttpClient's default redirect handling silently rewrites a POST into a bodyless GET when
    // following a 301/302 (same as a browser) - so if that redirect ever recurs, following it
    // would silently send an empty request instead of surfacing a clear error. Better to fail
    // loudly than to send a corrupted request VPT would (rightly) reject as missing everything.
    private static readonly HttpClient Http = new(new HttpClientHandler { AllowAutoRedirect = false })
    {
        Timeout = TimeSpan.FromSeconds(20)
    };

    private string? _token;
    private DateTimeOffset _tokenExpiresUtc = DateTimeOffset.MinValue;
    private readonly object _tokenLock = new();

    private async Task<string> GetTokenAsync(string devKey, string email, string password)
    {
        lock (_tokenLock)
        {
            if (_token is not null && DateTimeOffset.UtcNow < _tokenExpiresUtc)
                return _token;
        }

        var loginBody = new JsonObject
        {
            ["query"] = "login",
            ["devKey"] = devKey,
            ["data"] = new JsonObject
            {
                ["email"] = email,
                ["password"] = password,
            },
        };

        using var loginRequest = new HttpRequestMessage(HttpMethod.Post, BaseUrl) { Content = CreateJsonContent(loginBody) };
        loginRequest.Headers.Add("X-API-Version", ApiVersion);

        using var response = await Http.SendAsync(loginRequest);
        var responseText = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"VPT login failed ({(int)response.StatusCode}): {responseText}");

        using var doc = JsonDocument.Parse(responseText);
        var root = doc.RootElement;
        if (!root.TryGetProperty("token", out var tokenEl) || tokenEl.GetString() is not { Length: > 0 } token)
            throw new InvalidOperationException("VPT login succeeded but returned no token - double check the developer key, email, and password in Settings.");

        long expiresInSeconds = root.TryGetProperty("expiresIn", out var expEl) && expEl.TryGetInt64(out var exp) ? exp : 2592000;

        lock (_tokenLock)
        {
            _token = token;
            // A minute of slack so an in-flight request never gets caught by the token
            // expiring mid-call.
            _tokenExpiresUtc = DateTimeOffset.UtcNow.AddSeconds(Math.Max(60, expiresInSeconds - 60));
        }
        return token;
    }

    /// <summary>
    /// Sends a "performance" query. <paramref name="data"/> must already be the full VPT
    /// "data" object for the request (requestType, aircraft, airport, runway, weather,
    /// runwayCondition, configuration, weight, ...) - built by the caller (see Program.cs's
    /// /api/vpt/takeoff endpoint) so the mapping from RealEFB's own simplified request shape
    /// to VPT's documented schema lives in one visible place rather than being duplicated
    /// here too.
    /// </summary>
    public Task<JsonDocument> CalculateAsync(string devKey, string email, string password, JsonObject data)
    {
        var body = new JsonObject
        {
            ["query"] = "performance",
            ["apiVersion"] = ApiVersion,
            ["data"] = data,
        };
        return PostAsync(devKey, email, password, body);
    }

    /// <summary>
    /// "allowedAircrafts" query - the list of aircraft profiles the logged-in VPT account can
    /// use (system-wide profiles, the user's own personal fleet, and their virtual airline's
    /// fleet), per the Aircraft API's stage 1. Used to populate the calculator's aircraft
    /// picker after the user presses "Authenticate VPT".
    /// </summary>
    public Task<JsonDocument> GetAllowedAircraftAsync(string devKey, string email, string password)
    {
        var body = new JsonObject { ["query"] = "allowedAircrafts" };
        return PostAsync(devKey, email, password, body);
    }

    /// <summary>
    /// "aircraft" query - the Aircraft API's stage 2. Loads one aircraft profile's full data
    /// (weight limits, calculation limits, and the formData option lists the calculator's
    /// FLAP/RTG/COND/A-I dropdowns are built from) once the user has picked a profile from
    /// the list GetAllowedAircraftAsync returned. All three identifiers are required even when
    /// null, per the Aircraft API docs - they jointly identify one specific profile
    /// configuration (a standard profile vs. a personalized fleet/VA registration of it).
    /// </summary>
    public Task<JsonDocument> GetAircraftDataAsync(string devKey, string email, string password, string file, string? userRegistration, string? virtualAirline)
    {
        var body = new JsonObject
        {
            ["query"] = "aircraft",
            ["data"] = new JsonObject
            {
                ["aircraft"] = file,
                ["userRegistration"] = userRegistration,
                ["virtualAirline"] = virtualAirline,
            },
        };
        return PostAsync(devKey, email, password, body);
    }

    private async Task<JsonDocument> PostAsync(string devKey, string email, string password, JsonObject body)
    {
        var token = await GetTokenAsync(devKey, email, password);

        using var request = new HttpRequestMessage(HttpMethod.Post, BaseUrl) { Content = CreateJsonContent(body) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.Add("X-API-Version", ApiVersion);

        using var response = await Http.SendAsync(request);
        var responseText = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"VPT returned {(int)response.StatusCode}: {responseText}");

        return JsonDocument.Parse(responseText);
    }

    // .NET's JsonContent/PostAsJsonAsync helpers append "; charset=utf-8" to the Content-Type
    // header by default. VPT's own documented curl examples send a bare "application/json"
    // with no charset parameter - and the very first live test against this API failed with
    // "Missing required parameter: query" even though the JSON body itself was byte-for-byte
    // correct (verified locally before this fix), which is the exact symptom of a PHP backend
    // doing a strict Content-Type comparison and silently ignoring the body when a charset is
    // present. Stripping it here matches their examples exactly.
    private static StringContent CreateJsonContent(JsonObject body)
    {
        var content = new StringContent(body.ToJsonString(), Encoding.UTF8, "application/json");
        content.Headers.ContentType!.CharSet = null;
        return content;
    }
}
