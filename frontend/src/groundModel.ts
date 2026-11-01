import * as THREE from 'three';

export function createGroundRig() {
 const rig=new THREE.Group();
 const white=new THREE.MeshStandardMaterial({color:0xe6ebed,metalness:.25,roughness:.38});
 const wing=new THREE.MeshStandardMaterial({color:0xbfc9d0,metalness:.4,roughness:.5});
 const dark=new THREE.MeshStandardMaterial({color:0x17212a,metalness:.3,roughness:.6});
 const rubber=new THREE.MeshStandardMaterial({color:0x111314,roughness:.9});
 const yellow=new THREE.MeshStandardMaterial({color:0xe4a934,metalness:.3,roughness:.4});
 function mesh(geometry:THREE.BufferGeometry,material:THREE.Material,parent=rig,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function box(w:number,h:number,d:number,mat:THREE.Material,parent:THREE.Group,x:number,y:number,z:number){return mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z);}
 const profile=[[-20,0],[-19.5,.55],[-18,1.1],[-16,1.65],[-13,2],[-9,2.05],[8,2.05],[12,1.7],[16,1.05],[19,.3],[20,0]].map(([z,r])=>new THREE.Vector2(r,z));
 const body=mesh(new THREE.LatheGeometry(profile,48),white,rig,0,3.5,0);body.rotation.x=Math.PI/2;
 function surface(points:number[][],height:number,mat=wing){const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,z)));const m=mesh(new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:2}),mat,rig,0,height,0);m.rotation.x=Math.PI/2;return m;}
 for(const side of [-1,1]){
  surface([[side*1.6,-4],[side*17.2,5],[side*17.5,7],[side*5.2,4.8],[side*1.6,7]],3.4);
  surface([[side*1,12],[side*7.2,17],[side*7.2,18],[side*1,16]],4);
  box(.18,1.65,1.8,wing,rig,side*17.3,4.05,6.1).rotation.z=-side*.28;
  const engine=mesh(new THREE.CylinderGeometry(1.18,1.05,4.7,32),white,rig,side*6.1,2.6,.2);engine.rotation.x=Math.PI/2;
  mesh(new THREE.TorusGeometry(.95,.15,12,32),wing,rig,side*6.1,2.6,-2.18);
  const inlet=mesh(new THREE.CircleGeometry(.92,32),dark,rig,side*6.1,2.6,-2.2);inlet.rotation.y=Math.PI;
  for(let i=0;i<12;i++){const blade=box(.08,1.5,.05,wing,rig,side*6.1,2.6,-2.23);blade.rotation.z=i*Math.PI/6;}
  box(.35,1.2,1,wing,rig,side*6.1,3.1,1);
  // Landing gear and paired tires remain visible when orbiting the model.
  box(.16,1.1,.16,wing,rig,side*2.4,1.3,4);
  for(const offset of [-.24,.24]){const wheel=mesh(new THREE.CylinderGeometry(.53,.53,.3,16),rubber,rig,side*2.4+offset,.6,4);wheel.rotation.z=Math.PI/2;}
  // Passenger window strips and cockpit glazing sit on the fuselage surface.
  for(let z=-12;z<12;z+=.9){const window=mesh(new THREE.SphereGeometry(.16,8,6),dark,rig,side*1.87,4.22,z);window.scale.set(.4,1,1.3);}
 }
 const fin=new THREE.Shape([new THREE.Vector2(10,0),new THREE.Vector2(18,0),new THREE.Vector2(17.5,6),new THREE.Vector2(14.5,5.7)]);
 const tail=mesh(new THREE.ExtrudeGeometry(fin,{depth:.22,bevelEnabled:true,bevelSize:.08,bevelThickness:.08}),dark,rig,.1,4.4,0);tail.rotation.y=-Math.PI/2;
 const cockpit=mesh(new THREE.SphereGeometry(1,24,12),dark,rig,0,4.85,-16.1);cockpit.scale.set(1.22,.28,1.25);
 box(.15,1.3,.15,wing,rig,0,1.3,-15.8);
 for(const side of [-1,1]){const w=mesh(new THREE.CylinderGeometry(.38,.38,.22,16),rubber,rig,side*.23,.6,-15.8);w.rotation.z=Math.PI/2;}
 const beacon=mesh(new THREE.SphereGeometry(.12,12,8),new THREE.MeshStandardMaterial({color:0xed4b40,emissive:0x5c0900}),rig,0,5.6,0);
 const tugPivot=new THREE.Group();tugPivot.position.set(0,0,-15.8);rig.add(tugPivot);
 const tug=new THREE.Group();tug.position.z=-4.1;tugPivot.add(tug);
 box(3.3,1.1,4.7,yellow,tug,0,1.05,0);
 box(2.45,1.25,1.7,yellow,tug,0,2.05,-1.15);
 box(2.18,.78,.04,dark,tug,0,2.1,-2.02);
 box(1.65,.1,1.4,dark,tug,0,1.66,1);
 for(const side of [-1,1])for(const z of [-1.4,1.4]){const w=mesh(new THREE.CylinderGeometry(.62,.62,.45,20),rubber,tug,side*1.6,.65,z);w.rotation.z=Math.PI/2;}
 // Towbar runs from tractor rear to the aircraft nose-wheel pivot.
 box(.23,.23,2.2,wing,tugPivot,0,.75,-1.1);
 for(const side of [-1,1])box(.38,.16,.12,new THREE.MeshStandardMaterial({color:0xfff4d3,emissive:0xffdf8c,emissiveIntensity:.6}),tug,side*1.1,1.15,-2.4);
 mesh(new THREE.CylinderGeometry(.16,.16,.25,12),new THREE.MeshStandardMaterial({color:0xffb224,emissive:0xff9600,emissiveIntensity:.7}),tug,0,2.85,-1);
 beacon.name='aircraft-beacon';
 return {rig,tugPivot};
}
