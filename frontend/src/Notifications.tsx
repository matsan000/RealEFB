import { useEffect, useState } from 'react';
import { Icon } from './icons';
export function notify(title: string, message: string, error = false) {
 window.dispatchEvent(new CustomEvent('realefb:notification', {detail:{title,message,error}}));
}
type Notice = {id:number; title:string; message:string; error:boolean; onOpen?:()=>void};
export function Notifications() {
 const [open,setOpen] = useState(false);
 const [brightness,setBrightness] = useState(() => {
   const saved = localStorage.getItem('realefb.screenBrightness');
   if (saved != null) return Math.min(100, Math.max(0, Number(saved)));
   const oldDim = localStorage.getItem('realefb.screenDim');
   if (oldDim != null) {
     const migrated = Math.round(100 - (Number(oldDim) / 0.65));
     return Math.min(100, Math.max(0, migrated));
   }
   return 100;
 });
 const [volume,setVolume] = useState(() => Number(localStorage.getItem('realefb.alertVolume') || 60));
 const [link,setLink] = useState('Checking connection');
 useEffect(() => {
   localStorage.setItem('realefb.screenBrightness', String(brightness));
   const dim = Math.round((100 - brightness) * 0.65);
   localStorage.setItem('realefb.screenDim', String(dim));
 },[brightness]);
 useEffect(() => {localStorage.setItem('realefb.alertVolume',String(volume));},[volume]);
 useEffect(() => {
  if(!open) return;
  let cancelled=false;
  fetch('/api/flight/state').then(r=>r.json()).then(data=>{if(!cancelled)setLink(data.connected?'Simulator connected':'Simulator disconnected');}).catch(()=>{if(!cancelled)setLink('Server unavailable');});
  return ()=>{cancelled=true;};
 },[open]);
 const [history,setHistory] = useState<Notice[]>([]);

 const [dnd,setDnd] = useState(() => localStorage.getItem('realefb.dnd') === 'true');
 const [sound,setSound] = useState(() => localStorage.getItem('realefb.notificationSound') !== 'false');
 useEffect(() => {localStorage.setItem('realefb.dnd',String(dnd));},[dnd]);
 useEffect(() => {localStorage.setItem('realefb.notificationSound',String(sound));},[sound]);
 useEffect(() => {
  let startY=-1;
  const down=(e:PointerEvent) => {startY=e.clientY<65 ? e.clientY : -1;};
  const up=(e:PointerEvent) => {if(startY>=0 && e.clientY-startY>70)setOpen(true);startY=-1;};
  const key=(e:KeyboardEvent) => {if(e.key==='Escape')setOpen(false);};
  window.addEventListener('pointerdown',down);window.addEventListener('pointerup',up);window.addEventListener('keydown',key);
  return () => {window.removeEventListener('pointerdown',down);window.removeEventListener('pointerup',up);window.removeEventListener('keydown',key);};
 },[]);
 const [items,setItems] = useState<Notice[]>([]);
 useEffect(() => {
  let serial=0;
  let cruiseSeen=false, descentSent=false, pending=false;
  const descentTimer=setInterval(async () => {
   if(document.hidden || pending) return; pending=true;
   try {const res=await fetch('/api/flight/state');const data=await res.json();const state=data.connected?data.state:null;
    if(state?.onGround){cruiseSeen=false;descentSent=false;}
    if(state && !state.onGround && state.altitudeFt>18000 && Math.abs(state.verticalSpeedFpm)<300) cruiseSeen=true;
    if(cruiseSeen && !descentSent && state && state.verticalSpeedFpm < -500){descentSent=true;notify('Descent started','Aircraft is descending from cruise. Review arrival and landing preparation.');}
   }catch{}finally{pending=false;}
  },5000);
  const receive=(event:Event) => { const detail=(event as CustomEvent).detail; const notice={...detail,id:Date.now()+ ++serial};setHistory(old => [notice,...old].slice(0,40));
   if(localStorage.getItem('realefb.dnd')==='true')return;
   setItems(old => [...old.slice(-3),notice]);
   if(localStorage.getItem('realefb.notificationSound')!=='false') {
    try {const ctx=new AudioContext(); const oscillator=ctx.createOscillator();const gain=ctx.createGain();oscillator.connect(gain);gain.connect(ctx.destination);oscillator.frequency.setValueAtTime(740,ctx.currentTime);oscillator.frequency.setValueAtTime(988,ctx.currentTime+.1);gain.gain.setValueAtTime(.1 * Number(localStorage.getItem('realefb.alertVolume') || 60)/100,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.3);oscillator.start();oscillator.stop(ctx.currentTime+.32);oscillator.onended=()=>{void ctx.close();};}catch{}
   } };
  window.addEventListener('realefb:notification',receive);
  const seen=new WeakMap<Element,string>();
  const observer=new MutationObserver(() => {
   document.querySelectorAll('.settings-hint[id$="status"]').forEach(el => {
    const text=el.textContent?.trim() || '';
    if (seen.get(el) === text) return; seen.set(el,text);
    if (/^Saved\.(?:\s|$)|^Could not|^.*failed/i.test(text)) notify('Settings',text,!/^Saved/.test(text));
   });
  });
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  return () => {window.removeEventListener('realefb:notification',receive);observer.disconnect();clearInterval(descentTimer);};
 },[]);
 useEffect(() => {if (!items.length) return; const timer=setTimeout(() => setItems(old => old.slice(1)),6500); return () => clearTimeout(timer);},[items]);
 const dimmerOpacity = Math.max(0, Math.min(0.65, ((100 - brightness) * 0.65) / 100));
 return <><div className="screen-dimmer" style={{opacity:dimmerOpacity}}/><button className="notification-center-trigger" aria-label="Open Notification Center" onClick={() => setOpen(true)}><Icon name={dnd ? 'moon' : 'bell'}/></button>{open && <div className="notification-shade" onClick={() => setOpen(false)}><section className="notification-center" role="dialog" aria-modal="true" aria-label="Notification Center" onClick={e=>e.stopPropagation()}><header><h2>Command Center</h2><button aria-label="Close Notification Center" onClick={()=>setOpen(false)}><Icon name="xmark"/></button></header><div className={`command-link${link==='Simulator connected'?' is-on':''}`}><Icon name="tower-broadcast"/><span>{link}</span><small>Live link</small></div><div className="notification-quick-controls"><button aria-pressed={dnd} onClick={()=>{setDnd(!dnd);setItems([]);}}><Icon name="moon"/><span>Do Not Disturb {dnd?'On':'Off'}</span></button><button aria-pressed={sound} onClick={()=>setSound(!sound)}><Icon name="volume-high"/><span>Sound {sound?'On':'Off'}</span></button></div><div className="command-sliders"><label className="glass-level"><span className="level-fill" aria-hidden="true" style={{height:`${brightness}%`}}/><Icon name="sun"/><span>Display brightness</span><input style={{background:`linear-gradient(to top, #f4f4f0 ${brightness}%, transparent ${brightness}%)`}} aria-label="Display brightness" type="range" min="0" max="100" value={brightness} onChange={e=>setBrightness(Number(e.target.value))}/></label><label className="glass-level"><span className="level-fill" aria-hidden="true" style={{height:`${volume}%`}}/><Icon name="volume-high"/><span>Alert volume</span><input style={{background:`linear-gradient(to top, #f4f4f0 ${volume}%, transparent ${volume}%)`}} aria-label="Alert volume" type="range" min="0" max="100" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></label></div><div className="command-history-heading"><h3>Notifications</h3><button onClick={()=>setHistory([])}>Clear</button></div>{history.length===0 && <p>No notifications yet.</p>}{history.map(n=><article key={n.id}><strong>{n.title}</strong><p>{n.message}</p>{n.onOpen && <button onClick={()=>{n.onOpen?.();setOpen(false);}}>Open Dispatch</button>}</article>)}</section></div>}<div className="notification-island" aria-live="polite" aria-atomic="false">{items.map(item => <div className={`island-notice${item.error ? ' error' : ''}`} key={item.id}><span className="notice-symbol"><Icon name={item.error ? 'triangle-exclamation' : 'circle-check'} /></span><div><small>REALEFB OS</small><strong>{item.title}</strong><p>{item.message}</p>{item.onOpen && <button className="notice-open" onClick={() => {item.onOpen?.();setItems(old => old.filter(n => n.id !== item.id));}}>Open Dispatch</button>}</div><button aria-label="Dismiss notification" onClick={() => setItems(old => old.filter(n => n.id !== item.id))}><Icon name="xmark" /></button></div>)}</div></>;
}
