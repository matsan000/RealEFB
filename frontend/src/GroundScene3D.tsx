import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createGroundRig } from './groundModel';

export type ApronProps={ready:boolean;speed?:number;heading?:number;latitude?:number;longitude?:number;lastCommand:string;targetHeading?:number};
const radians=Math.PI/180;
export default function GroundScene3D(props:ApronProps) {
 const mount=useRef<HTMLDivElement>(null);
 const current=useRef(props);current.current=props;
 const [preview,setPreview]=useState(false);const [orbit,setOrbit]=useState(false);const [error,setError]=useState('');const [travel,setTravel]=useState('STATIONARY');
 const mode=useRef({preview,orbit});mode.current={preview,orbit};
 useEffect(()=>{if(props.ready)setPreview(false);},[props.ready,props.lastCommand]);
 const reset=useRef<()=>void>(()=>{});
 useEffect(()=>{
  const container=mount.current;if(!container)return;const host:HTMLDivElement=container;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch{setError('3D unavailable. Enable WebGL and hardware acceleration to display the ground view.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x141719);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label','Interactive top-down 3D aircraft and tug');renderer.domElement.setAttribute('role','img');host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xe8f2ff,0x55504a,2.3));
  const light=new THREE.DirectionalLight(0xfff0d7,3.2);light.position.set(-25,50,-20);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:.1,far:130});light.shadow.bias=-.001;scene.add(light);scene.add(light.target);
  const fill=new THREE.DirectionalLight(0xb6d4ed,1.5);fill.position.set(20,15,10);scene.add(fill);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshStandardMaterial({color:0x272b2d,roughness:.96}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const grid=new THREE.GridHelper(1000,200,0x434748,0x343839);grid.position.y=.02;scene.add(grid);
  const centerline=new THREE.Mesh(new THREE.PlaneGeometry(.15,1000),new THREE.MeshBasicMaterial({color:0xad8840}));centerline.rotation.x=-Math.PI/2;centerline.position.y=.035;scene.add(centerline);
  const {rig,tugPivot}=createGroundRig();scene.add(rig);
  const camera=new THREE.OrthographicCamera(-35,35,35,-35,.1,600);camera.up.set(0,1,0);camera.position.set(0,110,.01);camera.lookAt(0,0,0);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enableRotate=false;controls.enablePan=true;controls.minZoom=.65;controls.maxZoom=2.8;controls.maxPolarAngle=Math.PI/2.5;
  const measured=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(22,.5,0),10,0x71d6d0,2,1);measured.visible=false;scene.add(measured);
  const requested=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineDashedMaterial({color:0xf3bd67,dashSize:1,gapSize:.7,transparent:true,opacity:.85}));rig.add(requested);
  const requestArrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(0,.3,22),6,0xf3bd67,1.7,.9);rig.add(requestArrow);requestArrow.visible=false;
  const trailMaterial=new THREE.LineBasicMaterial({color:0x71d6d0,transparent:true,opacity:.65});
  const trail=new THREE.Line(new THREE.BufferGeometry(),trailMaterial);scene.add(trail);
  const trailPoints:THREE.Vector3[]=[];let origin:{lat:number;lon:number}|null=null;let lastFix:{x:number;z:number;time:number}|null=null;
  const target=new THREE.Vector3();const forward=new THREE.Vector3(0,0,-1);let measuredDirection=new THREE.Vector3(0,0,1);let moving=false;
  let previous=performance.now();let frame=0;let angle=0;let demoTime=0;let lastPreview=false;let lastOrbit=false;let lastRequest='';let travelLabel='STATIONARY';
  const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h;const span=Math.max(58,48/aspect);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  function recenter(){camera.zoom=1;const t=rig.position;camera.position.copy(t).add(mode.current.orbit?new THREE.Vector3(42,65,45):new THREE.Vector3(0,110,.01));camera.up.set(0,1,0);controls.target.copy(t);camera.lookAt(t);camera.updateProjectionMatrix();controls.update();}
  reset.current=recenter;
  const contextLost=(event:Event)=>{event.preventDefault();setError('3D context lost. Reopen Pushback to restore the view.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  function tick(now:number){
   frame=requestAnimationFrame(tick);const dt=Math.min((now-previous)/1000,.1);previous=now;if(document.hidden||!host.clientWidth||!host.clientHeight)return;
   const p=current.current;const demo=mode.current.preview;
   if(demo!==lastPreview){origin=null;lastFix=null;trailPoints.length=0;trail.geometry.dispose();trail.geometry=new THREE.BufferGeometry();target.set(0,0,0);rig.position.set(0,0,0);demoTime=0;lastPreview=demo;recenter();}
   if(mode.current.orbit!==lastOrbit){controls.enableRotate=mode.current.orbit;lastOrbit=mode.current.orbit;recenter();}
   if(demo){demoTime+=dt;const t=demoTime;angle=Math.sin(t*.2)*.65;target.set(10*(1-Math.cos(t*.2)),0,t*1.05);measuredDirection.set(Math.sin(t*.2)*.4,0,1).normalize();moving=true;}
   else {
    if(p.heading!=null&&Number.isFinite(p.heading)){const desired=-p.heading*radians;angle+=Math.atan2(Math.sin(desired-angle),Math.cos(desired-angle))*Math.min(1,dt*6);}
    const hasFix=p.ready&&p.latitude!=null&&p.longitude!=null&&Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)&&!(p.latitude===0&&p.longitude===0);
    if(hasFix){if(!origin)origin={lat:p.latitude!,lon:p.longitude!};const x=(p.longitude!-origin.lon)*111320*Math.cos(origin.lat*radians),z=-(p.latitude!-origin.lat)*111320;
     if(lastFix){const delta=new THREE.Vector3(x-lastFix.x,0,z-lastFix.z);if(delta.length()>.025){if(delta.length()>300){origin={lat:p.latitude!,lon:p.longitude!};target.set(0,0,0);rig.position.set(0,0,0);lastFix=null;trailPoints.length=0;}else{measuredDirection.copy(delta).normalize();lastFix={x,z,time:now};target.set(x,0,z);}}}
     else{lastFix={x,z,time:now};target.set(x,0,z);}
    }
    moving=!!p.ready&&(p.speed??0)>.03&&lastFix!=null&&now-lastFix.time<3000;
   }
   const old=rig.position.clone();rig.position.lerp(target,Math.min(1,dt*5));rig.rotation.y=angle;
   const shift=rig.position.clone().sub(old);camera.position.add(shift);controls.target.add(shift);light.position.copy(rig.position).add(new THREE.Vector3(-25,50,-20));light.target.position.copy(rig.position);
   const steer=demo?Math.sin(demoTime*.2)*.28:p.lastCommand==='Turn left'?.25:p.lastCommand==='Turn right'?-.25:0;tugPivot.rotation.y=THREE.MathUtils.damp(tugPivot.rotation.y,steer,5,dt);
   forward.set(-Math.sin(angle),0,-Math.cos(angle));
   if(moving){if(!trailPoints.length||trailPoints[trailPoints.length-1].distanceTo(rig.position)>.4){trailPoints.push(rig.position.clone().setY(.08));if(trailPoints.length>180)trailPoints.shift();trail.geometry.dispose();trail.geometry=new THREE.BufferGeometry().setFromPoints(trailPoints);}measured.position.copy(rig.position).add(new THREE.Vector3(22,.3,0));measured.setDirection(measuredDirection);measured.setLength(8+Math.min(4,(p.speed??1)*2),2,1);}
   measured.visible=moving;
   const requestKey=`${p.lastCommand}/${p.targetHeading}/${demo}`;
   if(requestKey!==lastRequest){lastRequest=requestKey;const sign=p.lastCommand==='Forward'?-1:1;const active=demo||['Start pushback','Reverse','Forward','Turn left','Turn right','Straight','Target heading'].includes(p.lastCommand);requested.visible=active;requestArrow.visible=active;
    const delta=p.targetHeading!=null&&p.lastCommand==='Target heading'?THREE.MathUtils.clamp(Math.atan2(Math.sin((p.targetHeading-(p.heading??0))*radians),Math.cos((p.targetHeading-(p.heading??0))*radians)),-1.2,1.2):p.lastCommand==='Turn left'?-.5:p.lastCommand==='Turn right'?.5:0;
    const points=[];for(let i=0;i<=40;i++){const f=i/40;points.push(new THREE.Vector3(-delta*18*f*f,.12,sign*(22+f*18)));}requested.geometry.dispose();requested.geometry=new THREE.BufferGeometry().setFromPoints(points);requested.computeLineDistances();requestArrow.position.set(0,.2,sign*24);requestArrow.setDirection(new THREE.Vector3(0,0,sign));
   }
   host.dataset.motionSource=demo?'preview':moving?'telemetry':'stationary';host.dataset.modelHeading=String(Math.round(-angle/radians*10)/10);host.dataset.modelZ=String(Math.round(rig.position.z*100)/100);
   host.dataset.travelDirection=!moving?'stopped':measuredDirection.dot(forward)<0?'reverse':'forward';
   const label=demo?'PREVIEW MOTION':!p.ready?'NO GROUND TELEMETRY':!moving?'STATIONARY':host.dataset.travelDirection==='reverse'?'MOVING BACKWARD':'MOVING FORWARD';if(label!==travelLabel){travelLabel=label;setTravel(label);}
   controls.update();renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('webglcontextlost',contextLost);scene.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Line){obj.geometry.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();reset.current=()=>{};};
 },[]);
 return <figure className="aircraft-visual ground-3d"><div className="ground-3d-toolbar"><span>{preview?'MOTION PREVIEW':'LIVE GROUND VIEW'}</span><div><button aria-label={orbit?'Switch to top-down view':'Switch to angled 3D view'} onClick={()=>setOrbit(v=>!v)}>{orbit?'Top-down':'3D angle'}</button><button aria-label="Recenter 3D view" onClick={()=>reset.current()}>Reset</button><button aria-pressed={preview} disabled={props.ready&&!preview} title={props.ready?"Live telemetry is active":"Preview without simulator commands"} onClick={()=>setPreview(v=>!v)}>{preview?'Exit preview':'Preview motion'}</button></div></div><div className="ground-3d-canvas" ref={mount}/>{!orbit&&<span className="ground-3d-north" aria-label="North up">↑ N</span>}<span className="ground-3d-travel" aria-live="polite">{travel}</span>{error&&<p className="ground-3d-error" role="status">{error}</p>}<figcaption><span><b className="legend-measured"/> Measured motion <b className="legend-requested"/> Requested direction</span><span>{preview?'Preview only · no simulator commands':props.ready?'Generic aircraft · live position / heading':'Generic aircraft · waiting for ground telemetry'}</span></figcaption></figure>;
}
