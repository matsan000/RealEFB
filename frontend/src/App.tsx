import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import { Notifications } from './Notifications';
import { UtilityApps } from './UtilityApps';
import { StatusBar } from './StatusBar';
import { HomeScreen, apps } from './HomeScreen';
import { Icon, Logo } from './icons';
import { attachLiquidGlass } from './liquidGlass';
import type { AppId, FlightPlan, OperationsBridge, Settings } from './types';

function OperationalScreens() {
  return <>
    <main id="wizard-screen" className="hidden"><div className="init-card wizard-card"><p className="wizard-progress" id="wizard-progress" /><div id="wizard-body" /><p id="wizard-status" className="init-status" /><div className="wizard-nav"><button id="wizard-back" className="wizard-back-btn">Back</button><button id="wizard-next" className="wizard-next-btn">Next</button></div></div></main>
    <main id="detail-screen" className="hidden"><h1 id="detail-title" /><div id="detail-body" /></main>
    <button id="home-button" className="hidden" aria-label="Back to apps"><Icon name="chevron-left" /><span>Apps</span></button>
  </>;
}

export function App() {
  const [bridge, setBridge] = useState<OperationsBridge | null>(null);
  const [active, setActive] = useState<string>('loading');
  const [settings, setSettings] = useState<Settings>({ enabledApps: {}, webApps: [] });
  const [plan, setPlan] = useState<FlightPlan | null>(null);
  const [error, setError] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [startupError, setStartupError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [bootElapsed, setBootElapsed] = useState(false);

  useEffect(() => {
    // A short identity reveal runs once per page load, independently of account setup.
    const timer = window.setTimeout(() => setBootElapsed(true), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const navigate = (event: WindowEventMap['realefb:navigate']) => {
      // Commit synchronously so app transitions capture the finished screen, not a half-rendered one.
      flushSync(() => {
        setActive(event.detail.id);
        if (event.detail.id === 'home') setRefreshKey(key => key + 1);
      });
    };
    const updateApps = (event: WindowEventMap['realefb:apps']) => setSettings(event.detail);
    window.addEventListener('realefb:navigate', navigate);
    window.addEventListener('realefb:apps', updateApps);
    import('./operations.js').then(module => setBridge(module.bridge)).catch(() => setStartupError(true));
    return () => {
      window.removeEventListener('realefb:navigate', navigate);
      window.removeEventListener('realefb:apps', updateApps);
    };
  }, []);

  useEffect(() => {
    if (active !== 'home') return;
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (document.hidden || pending) return;
      pending = true;
      setRefreshing(true);
      try {
        const accountResponse = await fetch('/api/settings', { signal: controller.signal });
        if (!accountResponse.ok) throw new Error('Settings unavailable');
        const account = await accountResponse.json();
        if (account.simBriefId?.trim()) {
          setSyncMessage('Syncing SimBrief…');
          const imported = await fetch('/api/simbrief/import?automatic=true', { method: 'POST', signal: controller.signal });
          setSyncMessage(imported.ok ? 'SimBrief connected · automatic import' : 'SimBrief unavailable · retry with Refresh');
        } else setSyncMessage('Add your SimBrief account once in Settings to import automatically.');
        const response = await fetch('/api/simbrief/flightplan', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Flight plan unavailable');
        const data: { flightPlan: FlightPlan | null } = await response.json();
        setPlan(data.flightPlan);
        setError(false);
      } catch {
        if (!controller.signal.aborted) { setError(true); setPlan(null); }
      } finally {
        pending = false;
        if (!controller.signal.aborted) setRefreshing(false);
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    return () => { controller.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', refresh); };
  }, [active, refreshKey]);

  const booting = !bootElapsed || !bridge || active === 'loading';
  const [bootVisible, setBootVisible] = useState(true);
  useEffect(() => {
    if (booting || !bootVisible) return;
    // Let the boot screen dissolve while the home screen settles into place behind it.
    const timer = window.setTimeout(() => setBootVisible(false), 0);
    return () => window.clearTimeout(timer);
  }, [booting, bootVisible]);
  useEffect(() => { if (bridge) return attachLiquidGlass(); }, [bridge]);
  const isHome = active === 'home';
  const appNav = apps.filter(item => (item.id !== 'performance' && item.id !== 'pushback') || item.id === active).filter(item => settings.enabledApps[item.id] !== false);
  const currentApp = apps.find(app => app.id === active) || (active === 'settings' ? { label: 'Settings', icon: 'gear' } : { label: 'Setup', icon: 'cloud-arrow-down' });
  const dockButton = (item: { id: string; label: string; icon: string }) => <button key={item.id} aria-label={item.label} title={item.id === 'home' ? 'Home' : item.label} className={`${active === item.id ? 'active ' : ''}dock-${item.id}`} aria-current={active === item.id ? 'page' : undefined} onClick={() => bridge?.navigate(active === item.id ? 'home' : item.id as AppId)}><span className="os-dock-icon"><Icon name={item.icon} /></span><span className="os-dock-label">{item.id === 'home' ? 'Home' : item.label}</span><span className="os-dock-dot" /></button>;

  return <>
    <div className={`efb-app realefb-os workspace-ready active-${active} ${isHome ? 'os-home' : 'os-app-open'}${bootVisible && !booting ? ' os-waking' : ''}`} inert={booting || undefined}>
      <div id="wallpaper" /><div id="noise" />
      <header className="app-header os-statusbar">
        <StatusBar back={!isHome ? <button className="os-back" aria-label="Back to Home" onClick={() => bridge?.navigate('home')}><Icon name="chevron-left" /><span>Back</span></button> : undefined} />
        {!isHome && active !== 'loading' && <div className="os-active-app"><Icon name={currentApp.icon} /><span>{currentApp.label}</span></div>}
      </header>
      <div className="app-content">
        <main id="home-screen" className="hidden"><HomeScreen bridge={bridge} settings={settings} plan={plan} error={error} refreshing={refreshing} syncMessage={syncMessage} refresh={() => setRefreshKey(key => key + 1)} /></main>
        <OperationalScreens />
        <UtilityApps active={active} />
      </div>
      {bridge && isHome && <aside className="navigation-rail os-dock" data-liquid-glass="dock"><nav aria-label="Main navigation">
        {dockButton({ id: 'home', label: 'Overview', icon: 'table-cells-large' })}
        <span className="os-dock-divider" aria-hidden="true" />
        {appNav.map(dockButton)}
        <span className="os-dock-divider" aria-hidden="true" />
        {dockButton({ id: 'settings', label: 'Settings', icon: 'gear' })}
      </nav></aside>}
      <button id="loadsheet-notification" className="loadsheet-notif hidden" type="button"><span className="loadsheet-notif-icon"><Icon name="tower-broadcast" /></span><span className="loadsheet-notif-text"><span className="loadsheet-notif-title">Loadsheet received</span><span className="loadsheet-notif-sub">Tap to view Dispatch</span></span></button>
    </div>
    <Notifications />
    {bootVisible && <div className={`os-boot${booting ? '' : ' is-leaving'}`} role={startupError ? 'alert' : 'status'} aria-label="RealEFB OS starting"><div className="os-boot-mark" aria-hidden="true"><span className="boot-mark-outline"/><span className="boot-mark-fill"/></div>{startupError && <button className="boot-error" onClick={() => window.location.reload()}>Unable to start. Reload RealEFB OS</button>}</div>}
  </>;
}
