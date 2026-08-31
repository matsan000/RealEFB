using System.Runtime.InteropServices;
using System.Windows.Forms;
using Microsoft.FlightSimulator.SimConnect;

namespace RealEFB;

/// <summary>
/// Thin SimConnect wrapper that polls the user aircraft's position and flight data once per
/// sim-second. The sim may not be running yet (or may close/reopen while RealEFB stays open)
/// so connecting is lazy and retried on a timer rather than attempted once at startup - same
/// pattern as SimCallouts/SimPrinter's SimConnectClient. Not tied to any UI - just publishes
/// FlightStateUpdated so any future screen (map, PFD strip, ...) can consume it.
/// </summary>
internal sealed class SimConnectClient : IDisposable
{
    private const string AppName = "RealEFB";
    private const int WM_USER_SIMCONNECT = 0x0402;
    private const int ReconnectIntervalMs = 5000;

    public event Action<SimFlightState>? FlightStateUpdated;
    public event Action? Connected;
    public event Action? Disconnected;

    private enum Definitions { FlightData }
    private enum Requests { FlightData }

    [StructLayout(LayoutKind.Sequential)]
    private struct FlightData
    {
        public double Latitude;
        public double Longitude;
        public double AltitudeFt;
        public double RadioAltitudeFt;
        public double HeadingDegreesTrue;
        public double AirspeedKts;
        public double GroundSpeedKts;
        public double VerticalSpeedFpm;
        public double OnGround;
        public double LocalTimeSeconds;
        public double LocalYear;
        public double LocalMonthOfYear;
        public double LocalDayOfMonth;
        public double ZuluTimeSeconds;
        public double ZuluYear;
        public double ZuluMonthOfYear;
        public double ZuluDayOfMonth;
        public double Eng1Combustion;
        public double Eng2Combustion;
        public double Eng3Combustion;
        public double Eng4Combustion;
    }

    private readonly MessageWindow _window;
    private readonly System.Windows.Forms.Timer _reconnectTimer;
    private SimConnect? _simConnect;

    public bool IsConnected => _simConnect != null;

    public SimConnectClient()
    {
        _window = new MessageWindow(this);
        _reconnectTimer = new System.Windows.Forms.Timer { Interval = ReconnectIntervalMs };
        _reconnectTimer.Tick += (_, _) => TryConnect();
        _reconnectTimer.Start();
        TryConnect();
    }

    private void TryConnect()
    {
        if (_simConnect != null) return;

        try
        {
            var sc = new SimConnect(AppName, _window.Handle, WM_USER_SIMCONNECT, null, 0);
            sc.OnRecvOpen += (_, _) => Connected?.Invoke();
            sc.OnRecvQuit += (_, _) => HandleDisconnect();
            sc.OnRecvException += (_, _) => { };
            sc.OnRecvSimobjectData += OnRecvSimobjectData;

            sc.AddToDataDefinition(Definitions.FlightData, "PLANE LATITUDE", "degrees",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "PLANE LONGITUDE", "degrees",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            // True MSL altitude, not the altimeter-affected "INDICATED ALTITUDE" - avoids QNH
            // throwing off anything that compares against it later.
            sc.AddToDataDefinition(Definitions.FlightData, "PLANE ALTITUDE", "feet",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "RADIO HEIGHT", "feet",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "PLANE HEADING DEGREES TRUE", "degrees",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "AIRSPEED INDICATED", "knots",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "GROUND VELOCITY", "knots",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "VERTICAL SPEED", "feet per minute",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "SIM ON GROUND", "bool",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            // In-sim local time/date - the status bar shows this instead of the PC's real
            // clock whenever SimConnect is connected, since the sim's time-of-day slider can
            // be set to anything and that's what's actually relevant to the flight.
            sc.AddToDataDefinition(Definitions.FlightData, "LOCAL TIME", "seconds",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "LOCAL YEAR", "number",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "LOCAL MONTH OF YEAR", "number",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "LOCAL DAY OF MONTH", "number",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "ZULU TIME", "seconds",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            // Paired with ZULU TIME above so the status bar can show a Zulu date that actually
            // matches the Zulu time it's showing next to it, instead of pairing that time with
            // the local date (which can be a different calendar day around a Zulu-day
            // boundary) - see checkFlightState in app.js.
            sc.AddToDataDefinition(Definitions.FlightData, "ZULU YEAR", "number",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "ZULU MONTH OF YEAR", "number",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "ZULU DAY OF MONTH", "number",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "GENERAL ENG COMBUSTION:1", "bool",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "GENERAL ENG COMBUSTION:2", "bool",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "GENERAL ENG COMBUSTION:3", "bool",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.AddToDataDefinition(Definitions.FlightData, "GENERAL ENG COMBUSTION:4", "bool",
                SIMCONNECT_DATATYPE.FLOAT64, 0f, SimConnect.SIMCONNECT_UNUSED);
            sc.RegisterDataDefineStruct<FlightData>(Definitions.FlightData);

            sc.RequestDataOnSimObject(Requests.FlightData, Definitions.FlightData,
                SimConnect.SIMCONNECT_OBJECT_ID_USER, SIMCONNECT_PERIOD.SECOND,
                SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT, 0, 0, 0);

            _simConnect = sc;
        }
        catch (COMException)
        {
            // Sim isn't running (or isn't ready yet) - retry on the next timer tick.
            _simConnect = null;
        }
    }

    private void OnRecvSimobjectData(SimConnect sender, SIMCONNECT_RECV_SIMOBJECT_DATA data)
    {
        if ((Requests)data.dwRequestID != Requests.FlightData) return;
        var value = (FlightData)data.dwData[0];

        FlightStateUpdated?.Invoke(new SimFlightState(
            Latitude: value.Latitude,
            Longitude: value.Longitude,
            AltitudeFt: value.AltitudeFt,
            RadioAltitudeFt: value.RadioAltitudeFt,
            HeadingDegreesTrue: value.HeadingDegreesTrue,
            AirspeedKts: value.AirspeedKts,
            GroundSpeedKts: value.GroundSpeedKts,
            VerticalSpeedFpm: value.VerticalSpeedFpm,
            OnGround: value.OnGround != 0,
            LocalTimeSeconds: value.LocalTimeSeconds,
            LocalYear: (int)value.LocalYear,
            LocalMonth: (int)value.LocalMonthOfYear,
            LocalDay: (int)value.LocalDayOfMonth,
            ZuluSeconds: value.ZuluTimeSeconds,
            ZuluYear: (int)value.ZuluYear,
            ZuluMonth: (int)value.ZuluMonthOfYear,
            ZuluDay: (int)value.ZuluDayOfMonth,
            EngineCombustion: new[]
            {
                value.Eng1Combustion != 0,
                value.Eng2Combustion != 0,
                value.Eng3Combustion != 0,
                value.Eng4Combustion != 0,
            }));
    }

    internal void ReceiveMessage()
    {
        try
        {
            _simConnect?.ReceiveMessage();
        }
        catch (COMException)
        {
            HandleDisconnect();
        }
    }

    private void HandleDisconnect()
    {
        if (_simConnect == null) return;
        _simConnect.Dispose();
        _simConnect = null;
        Disconnected?.Invoke();
    }

    public void Dispose()
    {
        _reconnectTimer.Stop();
        _reconnectTimer.Dispose();
        _simConnect?.Dispose();
        _simConnect = null;
        _window.DestroyHandle();
    }

    /// <summary>Message-only native window that receives the WM_USER message SimConnect
    /// posts when new data is ready to be pulled via ReceiveMessage().</summary>
    private sealed class MessageWindow : NativeWindow
    {
        private readonly SimConnectClient _owner;

        public MessageWindow(SimConnectClient owner)
        {
            _owner = owner;
            CreateHandle(new CreateParams());
        }

        protected override void WndProc(ref Message m)
        {
            if (m.Msg == WM_USER_SIMCONNECT)
            {
                _owner.ReceiveMessage();
                return;
            }
            base.WndProc(ref m);
        }
    }
}

/// <summary>One sim-second snapshot of the user aircraft's flight data.</summary>
internal readonly record struct SimFlightState(
    double Latitude,
    double Longitude,
    double AltitudeFt,
    double RadioAltitudeFt,
    double HeadingDegreesTrue,
    double AirspeedKts,
    double GroundSpeedKts,
    double VerticalSpeedFpm,
    bool OnGround,
    double LocalTimeSeconds,
    int LocalYear,
    int LocalMonth,
    int LocalDay,
    double ZuluSeconds,
    int ZuluYear,
    int ZuluMonth,
    int ZuluDay,
    bool[] EngineCombustion);
