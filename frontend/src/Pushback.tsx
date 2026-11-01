import { useEffect, useRef, useState } from 'react';
import { RealisticApron } from './RealisticApron';
import { Icon } from './icons';
import { notify } from './Notifications';

export function Pushback() {
 const [telemetry,setTelemetry] = useState<{onGround?:boolean;groundSpeedKts?:number;headingDegreesTrue?:number;latitude?:number;longitude?:number}|null>(null);
 const [message,setMessage] = useState('Ready to connect to your simulator.');
 const commandLock=useRef(false);
 const [busy,setBusy] = useState(false);
 const [speed,setSpeed] = useState(1);
 const [heading,setHeading] = useState('');
 const [advanced,setAdvanced] = useState(false);
 const [lastCommand,setLastCommand] = useState('None');
 const [requestedHeading,setRequestedHeading]=useState<number|undefined>(undefined);
 const ready = !!telemetry?.onGround && (telemetry.groundSpeedKts ?? 99) < 3;
 useEffect(() => {
  const controller = new AbortController(); let pending=false;
  async function refresh() {
   if (document.hidden || pending) return; pending=true;
   try { const res = await fetch('/api/flight/state',{signal:controller.signal}); if (!res.ok) throw new Error(); const data=await res.json(); setTelemetry(data.connected ? data.state : null); }
   catch { if (!controller.signal.aborted) setTelemetry(null); }
   finally {pending=false;}
  }
  void refresh(); const timer=setInterval(refresh,1000); return () => {controller.abort();clearInterval(timer);};
 },[]);
 async function command(action:string,value=0,label=action) {
  if(commandLock.current)return; commandLock.current=true;
  setBusy(true);
  try { const res=await fetch('/api/pushback/control',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(6000),body:JSON.stringify({action,value})}); const data=await res.json(); if (!res.ok) throw new Error(data.error || 'Command unavailable'); setLastCommand(label);if(action==='heading')setRequestedHeading(value); setMessage(`${label} command sent. Confirm movement in the simulator.`); notify('Ground control',`${label} command sent.`); }
  catch(error) {const text=error instanceof Error ? error.message : 'Unable to send command';setMessage(text);notify('Ground control',text,true);}
  finally {setBusy(false);commandLock.current=false;}
 }
 const actualHeading=telemetry?.headingDegreesTrue;
 const steer=(delta:number) => {if (actualHeading != null) void command('heading',(actualHeading+delta+360)%360,delta < 0 ? 'Turn left' : delta > 0 ? 'Turn right' : 'Straight');};
 return <div className="ground-console"><section className="ground-scene"><div className="ground-scene-top"><span className={`ground-pill${ready ? ' ready' : ''}`}>{ready ? 'GROUND LINK READY' : 'WAITING FOR AIRCRAFT'}</span><span>STAND VIEW</span></div><div className="apron-diagram realistic-apron-wrap"><RealisticApron ready={ready} speed={telemetry?.groundSpeedKts} heading={actualHeading} lastCommand={lastCommand} latitude={telemetry?.latitude} longitude={telemetry?.longitude} targetHeading={requestedHeading}/></div><div className="ground-instruments"><div><small>GROUND SPEED</small><strong>{telemetry?.groundSpeedKts?.toFixed(1) ?? '--'} <em>KT</em></strong></div><div><small>TRUE HEADING</small><strong>{actualHeading == null ? '---' : Math.round(actualHeading).toString().padStart(3,'0')}°</strong></div><div><small>LAST COMMAND</small><strong>{lastCommand}</strong></div></div></section><section className="ground-controls utility-panel"><div className="pushback-control-heading"><h2>Easy pushback</h2><span>STANDARD TUG</span></div><p className="pushback-instruction">Clear the stand and release the parking brake before moving.</p><div className="pushback-primary"><button className="easy-pushback" disabled={!ready||busy} onClick={() => command('move',-speed,'Start pushback')}><Icon name="arrow-down"/> Start pushback</button><button className="ground-stop" disabled={!telemetry?.onGround||busy} onClick={() => command('stop',0,'Hold position')}><Icon name="hand"/> Hold position</button></div><div className="ground-steering">{[[-15,'Left'],[0,'Straight'],[15,'Right']].map(([delta,label]) => <button key={label} disabled={!ready||busy||actualHeading==null} onClick={() => steer(Number(delta))}>{label}</button>)}</div><label className="ground-speed">Command speed <strong>{speed} ft/s</strong><input aria-label="Command speed" type="range" min="1" max="3" step="1" value={speed} onChange={e => setSpeed(Number(e.target.value))}/></label><button className="tug-connect" disabled={!ready||busy} onClick={() => command('toggle',0,'Request / release tug')}><Icon name="link"/> Request / release tug</button><div className="ground-direction"><button disabled={!ready||busy} onClick={() => command('move',speed,'Forward')}><Icon name="arrow-up"/> Forward</button><button disabled={!ready||busy} onClick={() => command('move',-speed,'Reverse')}><Icon name="arrow-down"/> Reverse</button><button aria-label="Target heading" onClick={()=>setAdvanced(true)}><Icon name="compass"/> Heading</button></div><p role="status" className="pushback-message">{message}</p><small className="pushback-footnote">Below 3 kt on ground. Confirm tug movement in the simulator.</small></section>{advanced && <div className="heading-shade" onClick={()=>setAdvanced(false)}><section role="dialog" aria-modal="true" aria-label="Target heading" className="heading-dialog" onClick={e=>e.stopPropagation()}><header><h2>Target heading</h2><button aria-label="Close target heading" onClick={()=>setAdvanced(false)}><Icon name="xmark"/></button></header><label className="ground-heading">True heading, 000–359°<input aria-label="Target true heading" type="number" min="0" max="359" value={heading} placeholder="000–359" onChange={e=>setHeading(e.target.value)}/></label><button className="heading-apply" disabled={!ready||busy||heading.trim()===''||!Number.isFinite(Number(heading))||Number(heading)<0||Number(heading)>=360} onClick={()=>{void command('heading',Number(heading),'Target heading');setAdvanced(false);}}>Apply</button></section></div>}</div>;
}
