import { GroundOperations } from './GroundOperations';
import { Pushback } from './Pushback';
import { useEffect, useState } from 'react';
import type { FlightPlan } from './types';
import { Icon } from './icons';

export function UtilityApps({ active }: { active: string }) {
  if (active !== 'performance' && active !== 'pushback' && active !== 'ground') return null;
  return <main className="utility-app"><header><span className="eyebrow">REALEFB OS / FLIGHT TOOLS</span><h1><Icon name={active === 'performance' ? 'calculator' : active === 'ground' ? 'plane-circle-check' : 'truck'} /> {active === 'performance' ? 'Performance' : active === 'ground' ? 'Ground Operations' : 'Pushback'}</h1></header>{active === 'performance' ? <Performance /> : active === 'ground' ? <GroundOperations /> : <Pushback />}</main>;
}
function Performance() {
  const empty = { heading: '', wind: '', speed: '', elevation: '', qnh: '', temperature: '', available: '', required: '' };
  const [phase, setPhase] = useState<'takeoff' | 'landing'>('takeoff');
  const [plan, setPlan] = useState<FlightPlan | null>(null);
  const [status, setStatus] = useState('Loading flight plan...');
  const [forms, setForms] = useState({ takeoff: {...empty}, landing: {...empty} });
  const [runways, setRunways] = useState({takeoff: '', landing: ''});
  const values = forms[phase];
  const setValues = (next: typeof empty) => setForms(previous => ({...previous, [phase]: next}));
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/simbrief/flightplan', {signal:controller.signal, cache:'no-store'}).then(async res => {
      if (!res.ok) throw new Error();
      const data = await res.json(); const fp: FlightPlan | null = data.flightPlan;
      setPlan(fp);
      if (!fp) { setStatus('No flight plan loaded. Enter conditions manually or configure SimBrief in Settings.'); return; }
      function conditions(metar: string | undefined, elevation: number | undefined) {
        const text = metar || '';
        const wind = text.match(/\b(\d{3}|VRB)(\d{2,3})(?:G\d{2,3})?(KT|MPS)\b/);
        const temp = text.match(/\b(M?\d{2})\/(?:M?\d{2}|\/\/)\b/);
        const pressure = text.match(/\bQ(\d{4})\b/); const inches = text.match(/\bA(\d{4})\b/);
        return {...empty, elevation: elevation == null ? '' : String(elevation), wind: wind && wind[1] !== 'VRB' ? wind[1] : '', speed: wind ? String(Number(wind[2])*(wind[3] === 'MPS' ? 1.943844 : 1)) : '', temperature: temp ? temp[1].replace('M','-') : '', qnh: pressure ? pressure[1] : inches ? (Number(inches[1])/100*33.86389).toFixed(2) : ''};
      }
      setForms({takeoff:conditions(fp.origMetar, fp.originElevationFt), landing:conditions(fp.destMetar, fp.destElevationFt)});
      setRunways({takeoff: fp.originRunway === 'N/A' ? '' : fp.originRunway || '', landing: fp.destRunway === 'N/A' ? '' : fp.destRunway || ''});
      setStatus('Imported from SimBrief. Review planned runways and weather before use. Missing data stays blank.');
    }).catch(() => { if (!controller.signal.aborted) setStatus('Flight plan unavailable. You can enter conditions manually.'); });
    return () => controller.abort();
  }, []);
  const fields = [['heading','Runway heading','deg'], ['wind','Wind from','deg'], ['speed','Wind speed','kt'], ['elevation','Field elevation','ft'], ['qnh','QNH','hPa'], ['temperature','Temperature','C'], ['available','Available runway','m'], ['required','Required distance from aircraft data','m']] as const;
  const n = Object.fromEntries(Object.entries(values).map(([k,v]) => [k, Number(v)]));
  const valid = Object.values(values).every(v => v.trim() !== '' && Number.isFinite(Number(v))) && n.heading >= 0 && n.heading <= 360 && n.wind >= 0 && n.wind <= 360 && n.speed >= 0 && n.qnh >= 850 && n.qnh <= 1100 && n.available > 0 && n.required > 0 && n.temperature > -100 && n.temperature < 100;
  const angle = (n.wind-n.heading)*Math.PI/180;
  const pressure = n.elevation + (1013.25-n.qnh)*27;
  const density = pressure + 120*(n.temperature-(15-1.98*pressure/1000));
  const supplied = (...keys: (keyof typeof empty)[]) => keys.every(k => values[k].trim() !== '' && Number.isFinite(n[k]));
  const windReady = supplied('wind','heading','speed') && n.wind >= 0 && n.wind <= 360 && n.heading >= 0 && n.heading <= 360 && n.speed >= 0;
  const altitudeReady = supplied('elevation','qnh') && n.qnh >= 850 && n.qnh <= 1100;
  const densityReady = altitudeReady && supplied('temperature') && n.temperature > -100 && n.temperature < 100;
  const marginReady = supplied('available','required') && n.available > 0 && n.required > 0;
  const results = [
    ['Headwind / tailwind', windReady ? `${Math.abs(n.speed*Math.cos(angle)).toFixed(1)} kt ${Math.cos(angle) >= 0 ? 'headwind' : 'tailwind'}` : 'Enter heading and wind'],
    ['Crosswind', windReady ? `${Math.abs(n.speed*Math.sin(angle)).toFixed(1)} kt` : 'Enter heading and wind'],
    ['Pressure altitude (approx.)', altitudeReady ? `${Math.round(pressure)} ft` : 'Enter elevation and QNH'],
    ['Density altitude (approx.)', densityReady ? `${Math.round(density)} ft` : 'Enter elevation, QNH and temperature'],
    ['Runway margin', marginReady ? `${Math.round(n.available-n.required)} m` : 'Enter runway and required distances'],
  ];
  const airport = phase === 'takeoff' ? plan?.originIcao : plan?.destIcao;
  const weight = phase === 'takeoff' ? plan?.estTow : plan?.estLdw;
  const metar = phase === 'takeoff' ? plan?.origMetar : plan?.destMetar;
  const field = ([key,label,unit]: typeof fields[number]) => <label key={key} className="ui-field">{label}<span><input aria-label={label} type="number" step="any" inputMode="decimal" value={values[key]} onChange={e => setValues({...values,[key]:e.target.value})}/><small>{unit}</small></span></label>;
  return <div className="performance-workspace"><div className="performance-toolbar"><div className="performance-tabs" role="tablist" aria-label="Flight phase">{(['takeoff','landing'] as const).map(p => <button key={p} role="tab" aria-selected={phase === p} onClick={() => setPhase(p)}><Icon name={p === 'takeoff' ? 'plane-departure' : 'plane-arrival'}/>{p === 'takeoff' ? 'Takeoff' : 'Landing'}</button>)}</div><span className="performance-badge">PLANNING WORKSPACE</span></div><section className="performance-overview"><div className="performance-airport"><span className="ui-eyebrow">{phase === 'takeoff' ? 'DEPARTURE' : 'ARRIVAL'}</span><h2>{airport || '----'}</h2><p>{plan?.aircraftIcao || 'Aircraft not supplied'}{weight != null ? ` · ${weight.toLocaleString()} ${plan?.fuelUnits}` : ''}</p></div><label className="ui-field performance-runway">Planned runway<span><input aria-label="Planned runway" value={runways[phase]} placeholder="Not supplied" onChange={e => setRunways({...runways,[phase]:e.target.value})}/></span></label><div className="performance-weather"><span className="ui-eyebrow">LATEST PLANNED WEATHER</span><p className="performance-metar">{metar && metar !== 'N/A' ? metar : 'No METAR supplied'}</p></div></section><p className="performance-sync" role="status"><Icon name="circle-info"/>{status}</p><div className="utility-columns performance-columns"><section className="utility-panel performance-conditions"><div className="ui-section-heading"><span className="ui-eyebrow">01 / INPUTS</span><h2>Conditions</h2><p>Review imported values and complete the runway data.</p></div><fieldset><legend>Wind & weather</legend><div className="utility-fields">{fields.filter(([key]) => ['wind','speed','temperature','qnh'].includes(key)).map(field)}</div></fieldset><fieldset><legend>Runway & aircraft</legend><div className="utility-fields">{fields.filter(([key]) => ['heading','elevation','available','required'].includes(key)).map(field)}</div></fieldset><details className="performance-help"><summary>About these inputs</summary><p>METAR winds use true north. Enter a verified true runway heading; runway numbers alone are not precise headings. Runway length and aircraft-required distance are manual when absent from the plan.</p></details></section><section className="utility-panel performance-results"><div className="ui-section-heading"><span className="ui-eyebrow">02 / ANALYSIS</span><h2>Calculated results</h2></div><div className="wind-preview"><svg viewBox="0 0 120 120" role="img" aria-label={windReady ? `Wind relative to runway: ${Math.round(n.wind-n.heading)} degrees` : 'Wind direction preview awaiting conditions'}><circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" opacity=".18"/><path d="M60 15v8m0 74v8M15 60h8m74 0h8" stroke="currentColor" opacity=".5"/><path d="M54 32h12v56H54z" fill="currentColor" opacity=".2"/>{windReady && <g transform={`rotate(${n.wind-n.heading},60,60)`}><path d="M60 24v59m-7-7 7 8 7-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g>}</svg><div><strong>{windReady ? `${n.speed} kt` : '—'}</strong><span>{windReady ? `Wind from ${String(n.wind).padStart(3,'0')}° true` : 'Awaiting wind conditions'}</span><small>Relative to runway heading</small></div></div>{results.map(([label,value]) => <div className="utility-result" key={label}><span>{label}</span><strong>{value}</strong></div>)}{marginReady && <div className="runway-usage"><div><span>Runway required</span><strong>{Math.round(n.required/n.available*100)}%</strong></div><div role="meter" aria-label="Runway utilization" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100,n.required/n.available*100)}><span style={{width:`${Math.min(100,n.required/n.available*100)}%`,background:n.required>n.available?'#ed8f8f':undefined}}/></div></div>}{!valid && <p className="ui-inline-notice" role="alert">Complete missing fields with valid conditions and positive runway distances to calculate all results.</p>}<p className="utility-note">Simulation planning only. Required distance must come from your aircraft's performance data. This calculator does not generate V-speeds, FLEX temperatures, or aircraft-specific takeoff/landing distances.</p></section></div></div>;
}
