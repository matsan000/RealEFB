import { useEffect, useState, type ReactNode } from 'react';

interface SimulatorClock { zuluSeconds: number; zuluYear: number; zuluMonth: number; zuluDay: number }
interface FlightState { connected: boolean; state: SimulatorClock | null }

function utcClock(state: SimulatorClock | null) {
  if (state && (![state.zuluSeconds, state.zuluYear, state.zuluMonth, state.zuluDay].every(Number.isFinite) || state.zuluSeconds < 0 || state.zuluSeconds >= 86400 || state.zuluYear < 1 || state.zuluMonth < 1 || state.zuluMonth > 12 || state.zuluDay < 1 || state.zuluDay > 31)) state = null;
  const now = new Date();
  const seconds = state ? Math.floor(state.zuluSeconds) : now.getUTCHours() * 3600 + now.getUTCMinutes() * 60;
  const date = state ? new Date(Date.UTC(state.zuluYear, state.zuluMonth - 1, state.zuluDay)) : now;
  return {
    time: `${String(Math.floor(seconds / 3600) % 24).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}Z`,
    date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }),
  };
}

export function StatusBar({ back }: { back?: ReactNode }) {
  const [showLocal,setShowLocal]=useState(()=>localStorage.getItem('realefb.showLocalTime')==='true');
  const [localTime,setLocalTime]=useState(()=>new Date());
  useEffect(()=>{const update=()=>setShowLocal(localStorage.getItem('realefb.showLocalTime')==='true');window.addEventListener('realefb:clock-preference',update);const timer=setInterval(()=>setLocalTime(new Date()),10000);return()=>{window.removeEventListener('realefb:clock-preference',update);clearInterval(timer);};},[]);
  const [clock, setClock] = useState(() => utcClock(null));
  const [online, setOnline] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending || document.hidden) return;
      pending = true;
      const [simulator, server] = await Promise.allSettled([
        fetch('/api/flight/state', { cache: 'no-store', signal: controller.signal }).then(async response => response.ok ? await response.json() as FlightState : null),
        fetch('/api/status', { cache: 'no-store', signal: controller.signal }),
      ]);
      pending = false;
      if (controller.signal.aborted) return;
      const sim = simulator.status === 'fulfilled' ? simulator.value : null;
      setClock(utcClock(sim?.connected ? sim.state : null));
      setOnline(server.status === 'fulfilled' && server.value.ok);
    }
    void refresh();
    const timer = window.setInterval(refresh, 5000);
    document.addEventListener('visibilitychange', refresh);
    return () => { controller.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  return <div id="statusbar"><div className="statusbar-left">{back}<span id="clock">{clock.time}</span><span id="date">{clock.date}</span>{showLocal && <span className="local-clock">{localTime.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false})} <small>LOCAL</small></span>}</div><div className="statusbar-right"><FullscreenToggle /><span id="connection-icon" className={`status-icon${online ? '' : ' offline'}`} role="img" aria-label={online ? 'Server connected' : 'Server offline'} title={online ? 'Server connected' : 'Server offline'}><i className={`fa-solid fa-${online ? 'signal' : 'plug-circle-xmark'}`} aria-hidden="true" /></span></div></div>;
}

// Phones and tablets in a browser can drop the browser chrome and pin landscape. The desktop
// app's own WebView2 window is already chromeless, so the control only appears in browsers.
function FullscreenToggle() {
  const isDesktopHost = !!(window as Window & { chrome?: { webview?: unknown } }).chrome?.webview;
  const [full, setFull] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const sync = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  if (isDesktopHost || !document.fullscreenEnabled) return null;
  async function toggle() {
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); return; }
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      if (window.matchMedia('(pointer: coarse)').matches) await orientation.lock?.('landscape').catch(() => undefined);
    } catch { /* The browser declined; the page keeps working in its current mode. */ }
  }
  return <button type="button" className="status-icon os-fullscreen" aria-label={full ? 'Exit full screen' : 'Full screen'} title={full ? 'Exit full screen' : 'Full screen'} onClick={toggle}><i className={`fa-solid fa-${full ? 'compress' : 'expand'}`} aria-hidden="true" /></button>;
}
