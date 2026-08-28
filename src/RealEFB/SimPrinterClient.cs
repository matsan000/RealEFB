using System.Text;

namespace RealEFB;

/// <summary>
/// Relays plain text to SimPrinter's own local print server (see SimPrinter's LocalPrintServer.cs
/// - POST /print-text on 127.0.0.1:39901, raw text/plain body, no JSON). That server only ever
/// listens on loopback, so a request from a LAN tablet's own browser could never reach it
/// directly - this has to be relayed through RealEFB's own server instead, which does run on the
/// same PC as SimPrinter, same reasoning as the OFP PDF/chart proxies elsewhere in this project.
///
/// SimPrinter's print server is opt-in and off by default ("Allow the SimPrinter browser
/// extension to print" in its own Settings), so a connection failure here almost always just
/// means SimPrinter isn't running or that setting is off - not a bug to retry.
/// </summary>
internal sealed class SimPrinterClient
{
    private const string PrintUrl = "http://127.0.0.1:39901/print-text";

    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(5) };

    public async Task PrintAsync(string text)
    {
        using var content = new StringContent(text, Encoding.UTF8, "text/plain");
        using var response = await Http.PostAsync(PrintUrl, content);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"SimPrinter returned {(int)response.StatusCode}.");
    }
}
