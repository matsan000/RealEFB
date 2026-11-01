export function Icon({ name }: { name: string }) {
  return <i className={`fa-solid fa-${name}`} aria-hidden="true" />;
}

export function Logo({ className = '' }: { className?: string }) {
  return <span className={`os-logo ${className}`}><img src="/assets/brand/realefb-logo.png" alt="RealEFB" /></span>;
}

// Original geometric app marks, drawn for RealEFB.
export function AppMark({ id }: { id: string }) {
 const paths: Record<string,string> = {
  ground:'M7 35h38M12 35V20h10v15m8 0V10h10v25M16 15h2m16 0h2m-2 8h2M8 42h36',
  taxi:'M8 9l12-4 12 4 12-4v32l-12 4-12-4-12 4V9m12-4v32m12-28v32M13 24h26M26 17l5 7-5 7',
  performance:'M12 6h28v40H12zM18 13h16M18 22h3m8 0h3m-14 8h3m8 0h3m-14 8h3m8 0h3',
  pushback:'M8 30h36v10H8zM16 30V18h17l7 12M18 40v4m18-4v4M10 16h15m-4-5 5 5-5 5',
  logbook:'M14 8h27v38H14zM20 8V5h15v3M20 19h14M20 27h14M20 35h9',
  tracker:'M7 39l10-9 12 4 15-22M9 12h9m-4-4v8M38 37h8m-4-4v8',
  dispatch:'M26 44V24m-8 20h16M16 13a14 14 0 0120 0M11 8a21 21 0 0130 0M21 18a7 7 0 0110 0M24 24h4',
  documents:'M6 15h17l5 5h18l-5 24H9zM9 15V9h14l5 6',
 };
 return paths[id] ? <svg className="app-mark" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[id]}/></svg> : <Icon name="gear"/>;
}
