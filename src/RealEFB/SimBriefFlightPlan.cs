using System.Text.Json;
using System.Text.Json.Serialization;

namespace RealEFB;

/// <summary>
/// A flattened, EFL-header-ready subset of a SimBrief OFP (flight plan). Parsing is
/// defensive: any missing/renamed field just falls back to "N/A" instead of throwing,
/// since SimBrief's JSON schema has some undocumented quirks - same approach as
/// SimCallouts/SimPrinter's SimBriefFlightPlan.
/// </summary>
internal sealed class SimBriefFlightPlan
{
    public string Callsign { get; set; } = "N/A";
    public string AircraftIcao { get; set; } = "N/A";
    public string AircraftName { get; set; } = "N/A";
    public string OriginIcao { get; set; } = "N/A";
    public string OriginIata { get; set; } = "N/A";
    public string OriginName { get; set; } = "N/A";
    public string DestIcao { get; set; } = "N/A";
    public string DestIata { get; set; } = "N/A";
    public string DestName { get; set; } = "N/A";
    public DateTimeOffset? ScheduledOutUtc { get; set; }
    public DateTimeOffset? ScheduledInUtc { get; set; }
    public DateTimeOffset? ScheduledOffUtc { get; set; }

    // "kgs" or "lbs" - whatever unit the pilot's SimBrief profile is set to. All the raw
    // fuel figures below are already in this unit, straight from SimBrief - no conversion.
    public string FuelUnits { get; set; } = "kgs";
    public double? BlockFuel { get; set; }
    public double? TripTaxiFuel { get; set; }
    public double? ReserveFuel { get; set; }

    public string? PdfUrl { get; set; }

    // Payload defaults for the Flight Log tab - same units as the fuel figures above.
    public double? MaxTowStruct { get; set; }
    public double? Cargo { get; set; }
    public double? PaxCountActual { get; set; }

    // Fuel/FMC tab defaults - SimBrief's own OFP fuel-plan breakdown, one property per row
    // of that table. Kept separate from the simplified Block/Trip+Taxi/Reserves figures
    // above, which are only for the Flight Log tab's own Fuel section.
    public double? FuelTrip { get; set; }
    public double? FuelContingency { get; set; }
    public double? FuelAlternate { get; set; }
    public string FuelAlternateIcao { get; set; } = "N/A";
    public double? FuelFinalReserve { get; set; }
    public double? FuelAdded { get; set; }
    public double? FuelPlannedTakeoff { get; set; }
    public double? FuelTaxi { get; set; }

    // Time equivalents for the rows above, in minutes - SimBrief gives these in seconds.
    public double? TimeTripMinutes { get; set; }
    public double? TimeContingencyMinutes { get; set; }
    public double? TimeAlternateMinutes { get; set; }
    public double? TimeFinalReserveMinutes { get; set; }
    public double? TimeAddedMinutes { get; set; }
    public double? TimeTaxiMinutes { get; set; }

    // SimBrief's own step-climb string for the Fuel/FMC tab's Flight Level Steps section -
    // already formatted as "ICAO/FL/FIX/FL/FIX/FL/...", nothing to reassemble here.
    public string StepClimbString { get; set; } = "N/A";

    // Flight info panel below Flight Level Steps - all reference-only figures pulled straight
    // from the OFP, same "kgs"/"lbs" unit as the fuel figures above where relevant.
    public string AtcRoute { get; set; } = "N/A";
    public double? EstZfw { get; set; }
    public double? MaxZfw { get; set; }
    public double? CruiseAltitudeFt { get; set; }
    public double? DestElevationFt { get; set; }
    public double? CostIndex { get; set; }
    public double? IsaDevC { get; set; }
    public double? AvgWindDir { get; set; }
    public double? AvgWindSpd { get; set; }
    public double? EstTow { get; set; }
    public double? MaxTow { get; set; }
    public double? EstLdw { get; set; }
    public double? MaxLdw { get; set; }
    public double? RouteDistanceNm { get; set; }

    // One summary row per candidate alternate, built from SimBrief's alternate_navlog (a
    // full fix-by-fix navlog per alternate) - see ParseAlternateRoutes. Distance/fuel are
    // totals across every leg; cruise FL and wind come from whichever leg reaches the
    // highest altitude, as a stand-in for "the cruise portion" of that diversion.
    public List<AlternateRouteInfo> AlternateRoutes { get; set; } = new();

    // "What if" fuel/time deltas from SimBrief's own impacts object (FL changes, weight
    // changes, cost index changes) - see ParseOperationalImpacts. Not every scenario is
    // computed for every flight (e.g. a flight already near its ceiling won't get a "2000ft
    // above" figure), so this only ever includes whichever ones SimBrief actually returned.
    public List<OperationalImpactPair> OperationalImpacts { get; set; } = new();

    // Every fix on the main route, in order - see ParseNavlog. TimeTotalSeconds is elapsed
    // time since brake-release-to-airborne (ScheduledOffUtc), same baseline used for
    // Departure ICAO already, so the Waypoints tab just adds the two to get each fix's clock
    // time. FuelPlanOnboard/FuelLeg are SimBrief's own planned figures, not adjusted for
    // whatever the crew actually loaded - the Waypoints tab does that adjustment itself using
    // the Fuel/FMC tab's PIC Discr.
    public List<NavlogFixInfo> Navlog { get; set; } = new();

    // Touchdown time - the last navlog fix's cumulative time added to ScheduledOffUtc, same
    // way every other fix's clock time is derived. Not the same as ScheduledInUtc (gate
    // arrival), which is later by however long taxi-in takes.
    public DateTimeOffset? ArrivalTimeUtc { get; set; }

    // Weather tab, page 1 - raw METAR/TAF text straight from SimBrief for departure,
    // destination, every destination alternate, and every ETOPS suitable airport, plus any
    // SIGMETs covering the route's FIR/UIRs. See ParseAirportWeather*/ParseSigmets.
    public string OrigMetar { get; set; } = "N/A";
    public string OrigTaf { get; set; } = "N/A";
    public string DestMetar { get; set; } = "N/A";
    public string DestTaf { get; set; } = "N/A";
    public List<AirportWeatherInfo> AlternateWeather { get; set; } = new();
    public List<AirportWeatherInfo> EtopsWeather { get; set; } = new();
    public List<SigmetInfo> Sigmets { get; set; } = new();

    // NOTAMS tab - every NOTAM SimBrief pulled in for the route, in the order SimBrief
    // returned them. Can be several hundred entries for a long route, so the tab groups these
    // by airport/FIR and only builds each group's list of entries once it's expanded - see
    // renderNotamsTab in app.js.
    public List<NotamInfo> Notams { get; set; } = new();

    // Weather tab, remaining pages - SigWx charts, then UAD wind charts, in whatever order
    // SimBrief lists them. SimBrief's own "Route" chart is skipped entirely (not shown
    // anywhere in the app), and "Vertical profile" is pulled out into its own field below for
    // the VP tab rather than being one more Weather page. Served through
    // /api/simbrief/chart/{index} rather than linked directly, same same-origin-proxy
    // reasoning as PdfUrl.
    public List<ChartImageInfo> ChartImages { get; set; } = new();

    // VP tab - just this one chart image, proxied the same way as PdfUrl/ChartImages.
    public string? VerticalProfileImageUrl { get; set; }

    // ATC tab - SimBrief's own fully-formatted ICAO flight plan (FPL-...), ready to file as-is
    // - nothing to reassemble, unlike AtcRoute above which is just the route string.
    public string AtcFlightPlanText { get; set; } = "N/A";

    // PDF tab - SimBrief's own pre-rendered OFP, as one long HTML fragment with every chart/
    // weather image already embedded via <img> tags in the right place in each section. This
    // is the same document the PDF is generated from, just as markup instead of print output -
    // shown directly instead of the PDF itself, so no separate page-by-page image viewer is
    // needed for tablets. [JsonIgnore] because it typically runs 300-400 KB - if it serialized
    // along with everything else here, every other tab's plain GET /api/simbrief/flightplan
    // (used just to read things like OriginIcao) would drag that weight along for nothing.
    // Served on its own via GET /api/simbrief/planhtml instead, fetched only when the PDF tab
    // itself is opened.
    [JsonIgnore]
    public string PlanHtml { get; set; } = "";

    public static SimBriefFlightPlan FromJson(JsonDocument doc)
    {
        var root = doc.RootElement;
        var fp = new SimBriefFlightPlan
        {
            AircraftIcao = GetProp(root, "aircraft", "icaocode"),
            AircraftName = GetProp(root, "aircraft", "name"),
            OriginIcao = GetProp(root, "origin", "icao_code"),
            OriginIata = GetProp(root, "origin", "iata_code"),
            OriginName = GetProp(root, "origin", "name"),
            DestIcao = GetProp(root, "destination", "icao_code"),
            DestIata = GetProp(root, "destination", "iata_code"),
            DestName = GetProp(root, "destination", "name"),
        };

        var atcCallsign = GetProp(root, "atc", "callsign");
        var airlineIcao = GetProp(root, "general", "icao_airline");
        var flightNumber = GetProp(root, "general", "flight_number");
        fp.Callsign = atcCallsign != "N/A" && atcCallsign != ""
            ? atcCallsign
            : $"{(airlineIcao == "N/A" ? "" : airlineIcao)}{(flightNumber == "N/A" ? "" : flightNumber)}";

        fp.ScheduledOutUtc = ParseUnixSeconds(GetProp(root, "times", "sched_out"));
        fp.ScheduledInUtc = ParseUnixSeconds(GetProp(root, "times", "sched_in"));
        fp.ScheduledOffUtc = ParseUnixSeconds(GetProp(root, "times", "sched_off"));

        var units = GetProp(root, "params", "units");
        fp.FuelUnits = units == "N/A" ? "kgs" : units;

        fp.BlockFuel = GetNumProp(root, "fuel", "plan_ramp");
        fp.ReserveFuel = GetNumProp(root, "fuel", "reserve");

        var tripBurn = GetNumProp(root, "fuel", "enroute_burn");
        var taxiBurn = GetNumProp(root, "fuel", "taxi");
        fp.TripTaxiFuel = tripBurn.HasValue || taxiBurn.HasValue ? (tripBurn ?? 0) + (taxiBurn ?? 0) : null;

        var pdfDirectory = GetProp(root, "files", "directory");
        var pdfLink = GetProp(root, "files", "pdf", "link");
        fp.PdfUrl = pdfDirectory != "N/A" && pdfLink != "N/A" ? $"{pdfDirectory}{pdfLink}" : null;

        // The certified structural max takeoff weight (constant per airframe) - not
        // "fuel.max_tow", which is the flight-specific, possibly performance-limited figure.
        fp.MaxTowStruct = GetNumProp(root, "weights", "max_tow_struct");
        fp.Cargo = GetNumProp(root, "weights", "cargo");
        fp.PaxCountActual = GetNumProp(root, "weights", "pax_count_actual");

        fp.FuelTrip = GetNumProp(root, "fuel", "enroute_burn");
        fp.FuelContingency = GetNumProp(root, "fuel", "contingency");
        fp.FuelAlternate = GetNumProp(root, "fuel", "alternate_burn");
        fp.FuelAlternateIcao = GetProp(root, "alternate", "icao_code");
        fp.FuelFinalReserve = GetNumProp(root, "fuel", "reserve");
        fp.FuelAdded = GetNumProp(root, "fuel", "extra");
        fp.FuelPlannedTakeoff = GetNumProp(root, "fuel", "plan_takeoff");
        fp.FuelTaxi = GetNumProp(root, "fuel", "taxi");

        fp.TimeTripMinutes = SecondsToMinutes(root, "times", "est_time_enroute");
        fp.TimeContingencyMinutes = SecondsToMinutes(root, "times", "contfuel_time");
        fp.TimeAlternateMinutes = SecondsToMinutes(root, "alternate", "ete");
        fp.TimeFinalReserveMinutes = SecondsToMinutes(root, "times", "reserve_time");
        fp.TimeAddedMinutes = SecondsToMinutes(root, "times", "extrafuel_time");
        fp.TimeTaxiMinutes = SecondsToMinutes(root, "times", "taxi_out");

        fp.StepClimbString = GetProp(root, "general", "stepclimb_string");

        fp.AtcRoute = GetProp(root, "atc", "route");
        fp.EstZfw = GetNumProp(root, "weights", "est_zfw");
        fp.MaxZfw = GetNumProp(root, "weights", "max_zfw");
        fp.CruiseAltitudeFt = GetNumProp(root, "general", "initial_altitude");
        fp.DestElevationFt = GetNumProp(root, "destination", "elevation");
        fp.CostIndex = GetNumProp(root, "general", "costindex");
        fp.IsaDevC = GetNumProp(root, "general", "avg_temp_dev");
        fp.AvgWindDir = GetNumProp(root, "general", "avg_wind_dir");
        fp.AvgWindSpd = GetNumProp(root, "general", "avg_wind_spd");
        fp.EstTow = GetNumProp(root, "weights", "est_tow");
        fp.MaxTow = GetNumProp(root, "weights", "max_tow");
        fp.EstLdw = GetNumProp(root, "weights", "est_ldw");
        fp.MaxLdw = GetNumProp(root, "weights", "max_ldw");
        fp.RouteDistanceNm = GetNumProp(root, "general", "route_distance");

        fp.AlternateRoutes = ParseAlternateRoutes(root);
        fp.OperationalImpacts = ParseOperationalImpacts(root);

        fp.Navlog = ParseNavlog(root);
        if (fp.Navlog.Count > 0 && fp.ScheduledOffUtc.HasValue && fp.Navlog[^1].TimeTotalSeconds.HasValue)
            fp.ArrivalTimeUtc = fp.ScheduledOffUtc.Value.AddSeconds(fp.Navlog[^1].TimeTotalSeconds!.Value);

        fp.OrigMetar = GetProp(root, "weather", "orig_metar");
        fp.OrigTaf = GetProp(root, "weather", "orig_taf");
        fp.DestMetar = GetProp(root, "weather", "dest_metar");
        fp.DestTaf = GetProp(root, "weather", "dest_taf");
        fp.AlternateWeather = ParseAirportWeatherList(root, new[] { "alternate" }, "altn_metar", "altn_taf");
        fp.EtopsWeather = ParseAirportWeatherList(root, new[] { "etops", "suitable_airport" }, "etops_metar", "etops_taf");
        fp.Sigmets = ParseSigmets(root);
        fp.Notams = ParseNotams(root);

        var (charts, verticalProfileUrl) = ParseChartImages(root);
        fp.ChartImages = charts;
        fp.VerticalProfileImageUrl = verticalProfileUrl;

        fp.AtcFlightPlanText = GetProp(root, "atc", "flightplan_text");

        fp.PlanHtml = GetProp(root, "text", "plan_html");
        if (fp.PlanHtml == "N/A") fp.PlanHtml = "";

        return fp;
    }

    // Unlike alternate_navlog (a list of routes, each with its own "fix" array), the main
    // route's navlog is a single object with one "fix" array - still walked by hand rather
    // than GetProp's single-path traversal, since it's a genuine list of distinct waypoints.
    private static List<NavlogFixInfo> ParseNavlog(JsonElement root)
    {
        var result = new List<NavlogFixInfo>();
        if (!root.TryGetProperty("navlog", out var navlogEl) || navlogEl.ValueKind != JsonValueKind.Object)
            return result;
        if (!navlogEl.TryGetProperty("fix", out var fixesEl) || fixesEl.ValueKind != JsonValueKind.Array)
            return result;

        foreach (var fix in fixesEl.EnumerateArray())
        {
            string ident = fix.TryGetProperty("ident", out var identEl) ? identEl.GetString() ?? "N/A" : "N/A";
            string viaAirway = fix.TryGetProperty("via_airway", out var viaEl) ? viaEl.GetString() ?? "" : "";
            result.Add(new NavlogFixInfo(
                ident,
                viaAirway,
                GetFixDouble(fix, "time_total"),
                GetFixDouble(fix, "fuel_plan_onboard"),
                GetFixDouble(fix, "fuel_leg"),
                GetFixDouble(fix, "oat"),
                GetFixDouble(fix, "wind_dir"),
                GetFixDouble(fix, "wind_spd")));
        }
        return result;
    }

    // Each pair is one row in the UI - a step-climb distance (or weight/cost-index change)
    // with two directions. SimBrief computes each direction independently, and often only
    // has one side available (a flight already near its ceiling won't get an "above" figure,
    // say) - ParseOperationalImpacts only includes a direction when SimBrief actually
    // returned it, and drops the whole row if neither side is available.
    private static readonly (string PlusKey, string MinusKey, string Category, string PlusLabel, string MinusLabel)[] ImpactPairs =
    {
        ("plus_2000ft", "minus_2000ft", "FL Change 2000", "Above", "Below"),
        ("plus_4000ft", "minus_4000ft", "FL Change 4000", "Above", "Below"),
        ("plus_6000ft", "minus_6000ft", "FL Change 6000", "Above", "Below"),
        ("zfw_plus_1000", "zfw_minus_1000", "Weight Change 1.0", "Up", "Down"),
        ("higher_ci", "lower_ci", "Cost Index", "Higher", "Lower"),
    };

    private static List<OperationalImpactPair> ParseOperationalImpacts(JsonElement root)
    {
        var result = new List<OperationalImpactPair>();
        if (!root.TryGetProperty("impacts", out var impactsEl) || impactsEl.ValueKind != JsonValueKind.Object)
            return result;

        foreach (var (plusKey, minusKey, category, plusLabel, minusLabel) in ImpactPairs)
        {
            var plus = ParseSingleImpact(impactsEl, plusKey);
            var minus = ParseSingleImpact(impactsEl, minusKey);
            if (plus is null && minus is null) continue;

            result.Add(new OperationalImpactPair(
                category,
                plusLabel, plus?.TripDiffWeight, plus?.TimeDiffMinutes,
                minusLabel, minus?.TripDiffWeight, minus?.TimeDiffMinutes));
        }
        return result;
    }

    private static (double? TripDiffWeight, double? TimeDiffMinutes)? ParseSingleImpact(JsonElement impactsEl, string key)
    {
        // SimBrief includes every possible scenario as a key, but leaves the ones it
        // couldn't/didn't compute for this flight as an empty object rather than omitting
        // them - null here means "not computed", not "computed as zero".
        if (!impactsEl.TryGetProperty(key, out var entry) || entry.ValueKind != JsonValueKind.Object)
            return null;
        if (!entry.EnumerateObject().MoveNext())
            return null;

        double? burnDifference = GetFixDouble(entry, "burn_difference");
        double? timeDifferenceSeconds = GetFixDouble(entry, "time_difference");
        return (burnDifference, timeDifferenceSeconds.HasValue ? timeDifferenceSeconds.Value / 60.0 : null);
    }

    // alternate_navlog is a list of full fix-by-fix navlogs, one per candidate alternate -
    // unlike the rest of this parser, that's genuinely a list of distinct routes rather than
    // SimBrief's usual "array of one" quirk, so it needs its own walk instead of GetProp's
    // single-path traversal.
    private static List<AlternateRouteInfo> ParseAlternateRoutes(JsonElement root)
    {
        var result = new List<AlternateRouteInfo>();
        if (!root.TryGetProperty("alternate_navlog", out var navlogsEl) || navlogsEl.ValueKind != JsonValueKind.Array)
            return result;

        foreach (var entry in navlogsEl.EnumerateArray())
        {
            if (!entry.TryGetProperty("fix", out var fixesEl) || fixesEl.ValueKind != JsonValueKind.Array)
                continue;

            var fixes = new List<JsonElement>();
            foreach (var f in fixesEl.EnumerateArray()) fixes.Add(f);
            if (fixes.Count == 0) continue;

            var last = fixes[^1];
            string icao = last.TryGetProperty("ident", out var identEl) ? identEl.GetString() ?? "N/A" : "N/A";

            double totalDistance = 0;
            double maxAltitude = 0;
            double? cruiseWindDir = null;
            double? cruiseWindSpd = null;
            foreach (var fix in fixes)
            {
                totalDistance += GetFixDouble(fix, "distance") ?? 0;
                double? altitude = GetFixDouble(fix, "altitude_feet");
                if (altitude.HasValue && altitude.Value > maxAltitude)
                {
                    maxAltitude = altitude.Value;
                    cruiseWindDir = GetFixDouble(fix, "wind_dir");
                    cruiseWindSpd = GetFixDouble(fix, "wind_spd");
                }
            }

            double? timeTotalSeconds = GetFixDouble(last, "time_total");
            double? fuelTotalUsed = GetFixDouble(last, "fuel_totalused");

            result.Add(new AlternateRouteInfo(
                icao,
                totalDistance,
                maxAltitude,
                cruiseWindDir,
                cruiseWindSpd,
                timeTotalSeconds.HasValue ? timeTotalSeconds.Value / 60.0 : null,
                fuelTotalUsed));
        }
        return result;
    }

    // Pairs an airport list (e.g. root.alternate, or root.etops.suitable_airport) up with a
    // pair of parallel METAR/TAF string arrays under root.weather - SimBrief returns both in
    // the same order, one entry per airport, so they're zipped by index. Either side can be
    // the "array of one" quirk described on GetProp (a bare object/string instead of a
    // single-element array), handled the same defensive way here.
    private static List<AirportWeatherInfo> ParseAirportWeatherList(JsonElement root, string[] airportPath, string metarKey, string tafKey)
    {
        var airports = GetObjectOrArray(root, airportPath);
        var metars = GetStringArray(root, "weather", metarKey);
        var tafs = GetStringArray(root, "weather", tafKey);

        var result = new List<AirportWeatherInfo>();
        for (int i = 0; i < airports.Count; i++)
        {
            var a = airports[i];
            string icao = a.TryGetProperty("icao_code", out var icaoEl) ? icaoEl.GetString() ?? "N/A" : "N/A";
            string iata = a.TryGetProperty("iata_code", out var iataEl) ? iataEl.GetString() ?? "" : "";
            string name = a.TryGetProperty("name", out var nameEl) ? nameEl.GetString() ?? "N/A" : "N/A";
            result.Add(new AirportWeatherInfo(
                string.IsNullOrEmpty(iata) ? icao : $"{icao}/{iata}",
                name,
                i < metars.Count ? metars[i] : "N/A",
                i < tafs.Count ? tafs[i] : "N/A"));
        }
        return result;
    }

    // SIGMETs are grouped by which FIR/UIR they cover on the Weather tab, same as the OFP
    // PDF's "FIR/UIR:" section - each entry already carries its own fir/fir_name, so no
    // grouping happens here, just a flat parse.
    private static List<SigmetInfo> ParseSigmets(JsonElement root)
    {
        var result = new List<SigmetInfo>();
        var items = GetObjectOrArray(root, new[] { "sigmets", "sigmet" });
        foreach (var s in items)
        {
            string text = s.TryGetProperty("text", out var textEl) ? textEl.GetString() ?? "" : "";
            if (text == "") continue;
            string fir = s.TryGetProperty("fir", out var firEl) ? firEl.GetString() ?? "N/A" : "N/A";
            string firName = s.TryGetProperty("fir_name", out var firNameEl) ? firNameEl.GetString() ?? "N/A" : "N/A";
            string type = s.TryGetProperty("type", out var typeEl) ? typeEl.GetString() ?? "" : "";
            result.Add(new SigmetInfo(fir, firName, type, text));
        }
        return result;
    }

    // "Route" is dropped entirely - not shown anywhere in the app; "Vertical profile" is
    // pulled out into its own return value for the VP tab rather than joining the Weather
    // tab's chart pages.
    private static (List<ChartImageInfo> Charts, string? VerticalProfileUrl) ParseChartImages(JsonElement root)
    {
        var result = new List<ChartImageInfo>();
        string? verticalProfileUrl = null;
        string directory = GetProp(root, "images", "directory");
        if (directory == "N/A") return (result, null);
        if (!root.TryGetProperty("images", out var imagesEl) || imagesEl.ValueKind != JsonValueKind.Object) return (result, null);
        if (!imagesEl.TryGetProperty("map", out var mapEl) || mapEl.ValueKind != JsonValueKind.Array) return (result, null);

        foreach (var item in mapEl.EnumerateArray())
        {
            string name = item.TryGetProperty("name", out var nameEl) ? nameEl.GetString() ?? "" : "";
            string link = item.TryGetProperty("link", out var linkEl) ? linkEl.GetString() ?? "" : "";
            if (name == "" || link == "") continue;
            string url = $"{directory}{link}";
            if (name == "Route") continue;
            if (name == "Vertical profile") { verticalProfileUrl = url; continue; }
            result.Add(new ChartImageInfo(name, url));
        }
        return (result, verticalProfileUrl);
    }

    // notam_report is SimBrief's own reformatted, single-paragraph version of the raw
    // notam_text (dates spelled out, line breaks collapsed) - the same text style the OFP PDF
    // uses, so that's preferred here too; notam_text is only a fallback for the rare record
    // missing a report.
    private static List<NotamInfo> ParseNotams(JsonElement root)
    {
        var result = new List<NotamInfo>();
        var items = GetObjectOrArray(root, new[] { "notams", "notamdrec" });
        foreach (var n in items)
        {
            string text = n.TryGetProperty("notam_report", out var reportEl) ? reportEl.GetString() ?? "" : "";
            if (text == "" && n.TryGetProperty("notam_text", out var textEl)) text = textEl.GetString() ?? "";
            if (text == "") continue;

            string icao = n.TryGetProperty("icao_id", out var icaoEl) ? icaoEl.GetString() ?? "N/A" : "N/A";
            string icaoName = n.TryGetProperty("icao_name", out var nameEl) ? nameEl.GetString() ?? "N/A" : "N/A";
            string notamId = n.TryGetProperty("notam_id", out var idEl) ? idEl.GetString() ?? "" : "";
            result.Add(new NotamInfo(icao, icaoName, notamId, text));
        }
        return result;
    }

    // Resolves a path to a JSON node that's normally an array, but which SimBrief sometimes
    // collapses to a bare object when there's only one entry (the same "array of one" quirk
    // GetProp works around for scalar values) - always returns a list, empty if the path is
    // missing or of an unexpected shape.
    private static List<JsonElement> GetObjectOrArray(JsonElement root, string[] path)
    {
        JsonElement current = root;
        foreach (var p in path)
        {
            if (current.ValueKind != JsonValueKind.Object || !current.TryGetProperty(p, out var next))
                return new List<JsonElement>();
            current = next;
        }
        return current.ValueKind switch
        {
            JsonValueKind.Array => new List<JsonElement>(current.EnumerateArray()),
            JsonValueKind.Object => new List<JsonElement> { current },
            _ => new List<JsonElement>()
        };
    }

    // Same "array of one" defensiveness as GetObjectOrArray, for a leaf that's normally an
    // array of plain strings.
    private static List<string> GetStringArray(JsonElement root, params string[] path)
    {
        JsonElement current = root;
        foreach (var p in path)
        {
            if (current.ValueKind != JsonValueKind.Object || !current.TryGetProperty(p, out var next))
                return new List<string>();
            current = next;
        }
        if (current.ValueKind == JsonValueKind.Array)
        {
            var list = new List<string>();
            foreach (var el in current.EnumerateArray())
                if (el.ValueKind == JsonValueKind.String) list.Add(el.GetString() ?? "");
            return list;
        }
        if (current.ValueKind == JsonValueKind.String)
        {
            var s = current.GetString();
            return string.IsNullOrEmpty(s) ? new List<string>() : new List<string> { s };
        }
        return new List<string>();
    }

    private static double? GetFixDouble(JsonElement fix, string property) =>
        fix.TryGetProperty(property, out var el) && el.ValueKind == JsonValueKind.String &&
        double.TryParse(el.GetString(), System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var v)
            ? v : null;

    private static double? SecondsToMinutes(JsonElement root, params string[] path)
    {
        var seconds = GetNumProp(root, path);
        return seconds / 60.0;
    }

    private static DateTimeOffset? ParseUnixSeconds(string value) =>
        long.TryParse(value, out var seconds) && seconds > 0
            ? DateTimeOffset.FromUnixTimeSeconds(seconds)
            : null;

    private static double? GetNumProp(JsonElement root, params string[] path)
    {
        var s = GetProp(root, path);
        return double.TryParse(s, System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out var v) ? v : null;
    }

    private static string GetProp(JsonElement root, params string[] path)
    {
        JsonElement current = root;
        foreach (var p in path)
        {
            // SimBrief returns some sections as a one-or-more-element array rather than a
            // single object; use the first entry in that case.
            if (current.ValueKind == JsonValueKind.Array)
            {
                if (current.GetArrayLength() == 0) return "N/A";
                current = current[0];
            }

            if (current.ValueKind != JsonValueKind.Object || !current.TryGetProperty(p, out var next))
                return "N/A";
            current = next;
        }

        return current.ValueKind switch
        {
            JsonValueKind.String => current.GetString() ?? "N/A",
            JsonValueKind.Number => current.ToString(),
            _ => "N/A"
        };
    }
}

// One summary row for the Fuel/FMC tab's Alternate Routes table - see
// SimBriefFlightPlan.ParseAlternateRoutes for how this is built from alternate_navlog.
internal sealed record AlternateRouteInfo(
    string Icao,
    double? DistanceNm,
    double? CruiseAltitudeFt,
    double? WindDir,
    double? WindSpd,
    double? TimeMinutes,
    double? FuelUsed);

// One row for the Fuel/FMC tab's Operational Impacts section - see
// SimBriefFlightPlan.ParseOperationalImpacts. Each row is really two scenarios (e.g. 2000ft
// Above vs Below) that share a category and toggle between each other in the UI; either side
// can be null if SimBrief didn't compute it for this flight, but not both (rows with neither
// side available are dropped during parsing). The *DiffWeight/*DiffMinutes figures are
// signed - positive means more fuel/time than planned, negative means less.
internal sealed record OperationalImpactPair(
    string Category,
    string PositiveLabel,
    double? PositiveTripDiffWeight,
    double? PositiveTimeDiffMinutes,
    string NegativeLabel,
    double? NegativeTripDiffWeight,
    double? NegativeTimeDiffMinutes);

// One fix on the main route, for the Waypoints tab - see SimBriefFlightPlan.ParseNavlog. Oat
// is outside air temperature in Celsius; WindDir/WindSpd are SimBrief's forecast wind at that
// fix's cruise altitude, same figures used for the Alternate Routes table's "cruise" wind.
internal sealed record NavlogFixInfo(
    string Ident,
    string ViaAirway,
    double? TimeTotalSeconds,
    double? FuelPlanOnboard,
    double? FuelLeg,
    double? Oat,
    double? WindDir,
    double? WindSpd);

// One airport's METAR/TAF on the Weather tab (a destination alternate or an ETOPS suitable
// airport) - see SimBriefFlightPlan.ParseAirportWeatherList. IcaoIata is already formatted
// as "ICAO/IATA" (or just "ICAO" if SimBrief has no IATA code for it).
internal sealed record AirportWeatherInfo(string IcaoIata, string Name, string Metar, string Taf);

// One SIGMET on the Weather tab - see SimBriefFlightPlan.ParseSigmets. Text is the full raw
// SIGMET message; Fir/FirName are which FIR/UIR it applies to, used to group entries the same
// way the OFP PDF's "FIR/UIR:" section does.
internal sealed record SigmetInfo(string Fir, string FirName, string Type, string Text);

// One chart image on the Weather tab (a SigWx page or a UAD wind chart) - see
// SimBriefFlightPlan.ParseChartImages. Url is the full simbrief.com address; the Weather tab
// never links to it directly, instead fetching bytes through /api/simbrief/chart/{index} so
// the request stays same-origin.
internal sealed record ChartImageInfo(string Name, string Url);

// One NOTAM on the NOTAMS tab - see SimBriefFlightPlan.ParseNotams. Text is SimBrief's own
// reformatted notam_report (falling back to the raw notam_text).
internal sealed record NotamInfo(string Icao, string IcaoName, string NotamId, string Text);

