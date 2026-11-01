import { lazy, Suspense } from 'react';
import type { ApronProps } from './GroundScene3D';
const GroundScene3D=lazy(()=>import('./GroundScene3D'));
export function RealisticApron(props:ApronProps){return <Suspense fallback={<div className="ground-3d-loading">Loading 3D ground view…</div>}><GroundScene3D {...props}/></Suspense>;}
