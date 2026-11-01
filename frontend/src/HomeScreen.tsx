import { useEffect, useState } from 'react';
import { Icon, Logo, AppMark } from './icons';
import type { AppId, FlightPlan, OperationsBridge, Settings } from './types';

export const apps = [
  { id: 'taxi', label: 'Taxi Map', icon: 'map-location-dot', color: 'mint' },
  { id: 'performance', label: 'Performance', icon: 'calculator', color: 'sky' },
  { id: 'ground', label: 'Ground Operations', icon: 'plane-circle-check', color: 'sky' },
  { id: 'pushback', label: 'Pushback', icon: 'truck', color: 'amber' },
  { id: 'logbook', label: 'Flight log', icon: 'clipboard-list', color: 'blue' },
  { id: 'tracker', label: 'Flight tracker', icon: 'route', color: 'mint' },
  { id: 'dispatch', label: 'Dispatch', icon: 'tower-broadcast', color: 'amber' },
  { id: 'documents', label: 'Documents', icon: 'folder-open', color: 'violet' },
] as const;

function time(value?: string) {
  if (!value) return '––:––';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '––:––' : date.toISOString().slice(11, 16);
}

export function HomeScreen({ bridge, settings, plan, error, refreshing, syncMessage, refresh }: {
  bridge: OperationsBridge | null; settings: Settings; plan: FlightPlan | null;
  error: boolean; refreshing: boolean; syncMessage: string; refresh: () => void;
}) {
  const enabled = apps.filter(app => settings.enabledApps[app.id] !== false);
  function open(id: AppId) { bridge?.navigate(id); }
  return <div className="os-desktop dashboard">
    <div className="os-widgets"><HomeClock />
      <section className="flight-card os-flight-widget os-glass" aria-label="Current flight">
        <div className="os-widget-header"><span><Icon name="plane-departure" /> {plan?.callsign || 'Your next flight'}</span><button className={`os-refresh${refreshing ? ' is-refreshing' : ''}`} aria-label="Refresh flight" disabled={refreshing} aria-busy={refreshing} onClick={refresh}><Icon name="arrows-rotate" /></button></div>
        {plan ? <>
          <div className="os-widget-route"><div className="airport"><strong>{plan.originIcao}</strong><span>{plan.originName}</span><b>{time(plan.scheduledOutUtc)}<small> UTC</small></b></div><div className="os-route-line"><span /><Icon name="plane" /><span /></div><div className="airport arrival"><strong>{plan.destIcao}</strong><span>{plan.destName}</span><b>{time(plan.scheduledInUtc)}<small> UTC</small></b></div></div>
          <div className="os-widget-footer"><span>{plan.aircraftIcao} <span>·</span> {plan.routeDistanceNm == null ? '—' : `${Math.round(plan.routeDistanceNm).toLocaleString()} NM`}</span><button disabled={!bridge || settings.enabledApps.logbook === false} onClick={() => open('logbook')}>Open flight log <Icon name="arrow-up-right-from-square" /></button></div>
        </> : <div className="os-no-flight"><span className="os-empty-plane"><Icon name="plane" /></span><h2>Where to next?</h2><p>Your latest flight arrives automatically from SimBrief.</p><button onClick={() => open('settings')}>SimBrief settings <Icon name="arrow-right" /></button></div>}
        <p className="os-sync-status" role="status">{syncMessage}</p>
        {error && <p className="os-data-error" role="status">Flight data is unavailable. Your apps are still accessible.</p>}
      </section>
      <section className="os-welcome page-heading os-glass">
        <Logo className="os-welcome-logo" />
        <div><p className="eyebrow">WELCOME TO YOUR FLIGHT DECK</p><h1>RealEFB <span>OS</span></h1><p>A little space for every flight.</p></div>
        <span className="os-welcome-note"><Icon name="wand-magic-sparkles" /> Ready when you are.</span>
      </section>
    </div>
    <section className="os-app-library" aria-label="Apps">
      <div className="os-app-grid workspace-grid">
        {enabled.map(app => <button key={app.id} data-app-id={app.id} className={`os-app workspace-card app-icon-${app.id} os-color-${app.color}`} aria-label={`${app.label} app`} disabled={!bridge} onClick={() => open(app.id)}><span className="os-app-icon tool-icon"><AppMark id={app.id} /></span><h3>{app.label}</h3></button>)}
        <button data-app-id="settings" className="os-app os-color-silver" aria-label="Settings app" onClick={() => open('settings')}><span className="os-app-icon"><Icon name="gear" /></span><h3>Settings</h3></button>
        {settings.webApps.map(app => <button className="os-app os-color-web" key={app.id} onClick={() => bridge?.openWebsite(app)}><span className="os-app-icon">{app.icon ? <img src={app.icon} alt="" /> : <Icon name="globe" />}</span><h3>{app.name}</h3></button>)}
      </div>
    </section>
    <div className="os-page-indicator" aria-hidden="true"><span className="selected" /></div>
  </div>;
}


function HomeClock() {
 const [now,setNow]=useState(()=>new Date());
 useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),10000);return ()=>clearInterval(timer);},[]);
 return <div className="home-clock"><strong>{now.toISOString().slice(11,16)}<small> UTC</small></strong><span>{now.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'})}</span></div>;
}
