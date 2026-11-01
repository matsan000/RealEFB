import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { RealisticApron } from './RealisticApron';
import { Pushback } from './Pushback';

const services = [
 {id:'jetway', name:'Jetway', icon:'building', detail:'Connect or send away at a compatible gate.', action:'Request / release'},
 {id:'stairs', name:'Passenger stairs', icon:'stairs', detail:'Call or send away the boarding ramp.', action:'Request / release'},
 {id:'baggage', name:'Baggage', icon:'suitcase-rolling', detail:'Request the luggage service at your stand.', action:'Request baggage'},
 {id:'fuel', name:'Fuel truck', icon:'gas-pump', detail:'Call the fuel truck to your parking spot.', action:'Request fuel'},
 {id:'catering', name:'Catering', icon:'utensils', detail:'Request catering for the aircraft.', action:'Request catering'},
 {id:'power', name:'Ground power', icon:'plug', detail:'Call the external power supply unit.', action:'Request power'},
];
export function GroundOperations() {
 const [tab,setTab]=useState('services');
 const [ready,setReady]=useState(false);
 const [busy,setBusy]=useState('');
 const lock=useRef(false);
 const [messages,setMessages]=useState<Record<string,string>>({});
 useEffect(()=>{
  const controller=new AbortController(); let pending=false;
  async function refresh(){
   if(pending)return; pending=true;
   try {const res=await fetch('/api/flight/state',{signal:controller.signal}); if(!res.ok)throw new Error(); const data=await res.json(); setReady(!!data.connected && !!data.state?.onGround && data.state.groundSpeedKts < .5);}
   catch{if(!controller.signal.aborted)setReady(false);} finally{pending=false;}
  }
  void refresh(); const timer=setInterval(refresh,1000);
  return ()=>{controller.abort();clearInterval(timer);};
 },[]);
 async function request(id:string){
  if(lock.current)return; lock.current=true;setBusy(id);
  try{const res=await fetch('/api/ground/control',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service:id}),signal:AbortSignal.timeout(6000)});const data=await res.json();if(!res.ok)throw new Error(data.error || 'Service request failed');setMessages(m=>({...m,[id]:'Request sent · confirm in simulator'}));}
  catch(e){setMessages(m=>({...m,[id]:e instanceof Error ? e.message : 'Request failed. Retry.'}));}
  finally{setBusy('');lock.current=false;}
 }
 return <div className="ground-workspace"><div className="ground-tabs" role="tablist" aria-label="Ground operations"><button role="tab" aria-selected={tab==='services'} onClick={()=>setTab('services')}><Icon name="layer-group"/> Stand services</button><button role="tab" aria-selected={tab==='pushback'} onClick={()=>setTab('pushback')}><Icon name="truck"/> Easy pushback</button></div>{tab==='pushback'?<Pushback/>:<section className="ground-services"><aside className="stand-overview"><span className="ops-kicker">STAND MANAGEMENT</span><div className="stand-aircraft-image stand-3d"><RealisticApron ready={false} lastCommand="None"/></div><h2>Ground services</h2><p>Everything you need for the next departure.</p><div className={`stand-connection${ready?' is-ready':''}`}><span/>{ready?'Aircraft parked':'Waiting for parked aircraft'}</div><small>Park below 0.5 kt at a compatible stand. Vehicle availability depends on your airport and aircraft.</small><button className="stand-pushback-link" onClick={()=>setTab('pushback')}>Open easy pushback <Icon name="arrow-right"/></button></aside><div className="service-board"><header><div><span className="ops-kicker">GROUND CREW</span><h2>Stand services</h2></div><span className="service-count">06 SERVICES</span></header><div className="service-grid">{services.map((s,index)=><article className="service-card" key={s.id}><span className="service-number">0{index+1}</span><span className="service-icon"><Icon name={s.icon}/></span><div className="service-copy"><h3>{s.name}</h3><p>{s.detail}</p><small role="status">{messages[s.id] || 'Ready to request'}</small></div><button disabled={!ready||!!busy} onClick={()=>request(s.id)}>{busy===s.id?'Sending…':s.action}<Icon name="arrow-up-right-from-square"/></button></article>)}</div></div></section>}</div>;
}
