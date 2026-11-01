// Capture the shipped UI with isolated sample data; never touches a running RealEFB server.
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const root=resolve(project,'src/RealEFB/wwwroot'), output=resolve(project,'Assets/screenshots');
await mkdir(output,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{
 const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
 if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}
 try{res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'}).end(await readFile(path));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await page.addInitScript(()=>{localStorage.setItem('realefb.wallpaper','tidal');localStorage.setItem('realefb.appearance','dark');localStorage.setItem('realefb.notificationSound','false');});
 const plan={callsign:'BAW247',aircraftIcao:'B78X',aircraftName:'Boeing 787-10',originIcao:'EGLL',originIata:'LHR',originName:'London Heathrow',destIcao:'SBGR',destIata:'GRU',destName:'São Paulo Guarulhos',scheduledOutUtc:'2026-11-01T14:20:00Z',scheduledInUtc:'2026-11-02T02:10:00Z',blockFuel:78400,fuelUnits:'kgs',routeDistanceNm:5132,cruiseAltitudeFt:35000,originRunway:'27R',destRunway:'09L',originElevationFt:83,destElevationFt:2459,estTow:220000,estLdw:165000,originLat:51.47,originLon:-.45,destLat:-23.43,destLon:-46.47,origMetar:'EGLL 011350Z 24008KT 9999 SCT025 15/09 Q1018',destMetar:'SBGR 011350Z 09005KT 9999 FEW030 24/18 Q1015',navlog:[],notams:[],alternateWeather:[],etopsWeather:[],sigmets:[],charts:[]};
 const state={onGround:true,groundSpeedKts:0,headingDegreesTrue:270,latitude:51.47,longitude:-.45};
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(route.request().method()==='POST'){await route.fulfill({json:{ok:true}});return;}
  const values={'/api/settings':{setupWizardCompleted:true,simBriefId:'demo-pilot',port:5150,enabledApps:{},webApps:[],dispatchDataSource:'vatsim'},'/api/flight/state':{connected:true,state},'/api/status':{ok:true},'/api/simbrief/flightplan':{flightPlan:plan},'/api/simbrief/flightlog':{flightLog:null},'/api/simbrief/waypoints':{waypoints:null},'/api/simbrief/fuelfmc':{fuelFmc:null},'/api/dispatch/loadsheet':{hasFlight:false},'/api/documents':{documents:[],folderPath:'Documents/RealEFB Documents'},'/api/network/interfaces':[{name:'Wi-Fi',address:'192.168.1.50'}]};
  await route.fulfill({json:values[path]||{}});
 });
 const shot=async name=>{await page.mouse.move(0,0);await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});return page.screenshot({animations:'disabled',path:resolve(output,name+'.png')});};
 const home=async()=>{const back=page.getByRole('button',{name:'Back to Home',exact:true});if(await back.isVisible())await back.click();};
 const open=async app=>{await home();await page.getByRole('button',{name:app+' app',exact:true}).click();};
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('.os-boot').waitFor({state:'detached'});
 await page.evaluate(()=>document.fonts.ready);await shot('home-screen');
 await open('Ground Operations');await page.locator('.stand-3d canvas').waitFor();await shot('ground-operations');
 await page.getByRole('tab',{name:'Easy pushback',exact:true}).click();await page.locator('.ground-console canvas').waitFor();await page.waitForFunction(()=>{const e=document.querySelector('.ground-console .ground-3d-canvas');const n=Number(e?.getAttribute('data-model-heading'));return e&&Math.abs(((n%360)+360)%360-270)<.5;});await page.getByRole('button',{name:'Straight',exact:true}).click();await page.locator('.island-notice').waitFor();await page.getByRole('button',{name:'Dismiss notification',exact:true}).first().click();await page.locator('.island-notice').waitFor({state:'hidden'});await shot('pushback-3d');
 await open('Performance');await page.setViewportSize({width:1440,height:1240});
 for(const [name,value]of [['Runway heading','270'],['Available runway','3902'],['Required distance from aircraft data','2500']])await page.getByLabel(name,{exact:true}).fill(value);
 await page.locator('.utility-app').evaluate(el=>el.scrollTo(0,0));await shot('performance');await page.setViewportSize({width:1440,height:1000});
 await open('Flight log');await page.locator('.efl-tab-btn[data-tab="flightlog"]').click();await shot('flight-log');
 await page.locator('.efl-tab-btn[data-tab="fuelfmc"]').click();await shot('fuel-fmc');
 await page.locator('.efl-tab-btn[data-tab="waypoints"]').click();await shot('waypoints');
 await open('Settings');await page.getByRole('button',{name:'Wallpaper',exact:true}).click();await page.locator('.wallpaper-option[data-wallpaper="glacier"]').waitFor();
 // Wait for thumbnail images to decode before documenting the picker.
 await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.wallpaper-thumb[data-wallpaper]')].map(el=>{const match=getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/);if(!match)return;const i=new Image();i.src=match[1];return i.decode().catch(()=>{});}));});
 await shot('wallpapers');
 console.log('Captured current README screenshots in Assets/screenshots.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
