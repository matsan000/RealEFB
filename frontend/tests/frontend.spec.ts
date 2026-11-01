import { test, expect, type Page } from '@playwright/test';

const flightPlan = {
  callsign: 'BAW247', aircraftIcao: 'B78X', aircraftName: 'Boeing 787-10',
  originIcao: 'EGLL', originIata: 'LHR', originName: 'London Heathrow',
  destIcao: 'SBGR', destIata: 'GRU', destName: 'São Paulo Guarulhos',
  scheduledOutUtc: '2026-10-31T14:20:00Z', scheduledInUtc: '2026-11-01T02:10:00Z',
  blockFuel: 78400, fuelUnits: 'kgs', routeDistanceNm: 5132, cruiseAltitudeFt: 35000,
  originRunway: '27R', destRunway: '09L', originElevationFt: 83, destElevationFt: 2459, estTow: 220000, estLdw: 165000,
  originLat: 51.47, originLon: -0.45, destLat: -23.43, destLon: -46.47,
  origMetar: 'EGLL 311350Z 24008KT 9999 SCT025 15/09 Q1018',
  destMetar: 'SBGR 311350Z 09005KT 9999 FEW030 24/18 Q1015',
  navlog: [], notams: [], alternateWeather: [], etopsWeather: [], sigmets: [], charts: [],
};

async function mockApi(page: Page, options: { initialized?: boolean; setup?: boolean; disabled?: string[]; pilotId?: string } = {}) {
  let initialized = options.initialized ?? true;
  let simBriefId = options.pilotId ?? 'pilot123';
  const posts: { path: string; body: unknown }[] = [];
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() === 'POST') {
      posts.push({ path, body: route.request().postDataJSON() });
      if (path === '/api/settings/simbrief') simBriefId = route.request().postDataJSON().simBriefId;
      if (path.endsWith('/import')) initialized = true;
      await route.fulfill({ json: { ok: true } }); return;
    }
    const data: Record<string, unknown> = {
      '/api/settings': { setupWizardCompleted: options.setup ?? true, simBriefId, port: 5150, enabledApps: Object.fromEntries((options.disabled ?? []).map(id => [id, false])), webApps: [], dispatchDataSource: 'vatsim' },
      '/api/simbrief/flightplan': { flightPlan: initialized ? flightPlan : null },
      '/api/flight/state': { connected: false, state: null },
      '/api/status': { ok: true },
      '/api/dispatch/loadsheet': { hasFlight: false },
      '/api/simbrief/flightlog': { flightLog: null },
      '/api/simbrief/waypoints': { waypoints: null },
      '/api/simbrief/fuelfmc': { fuelFmc: null },
      '/api/documents': { documents: [], folderPath: 'Documents/RealEFB Documents' },
      '/api/network/interfaces': [],
      '/api/flight/trail': { points: [] },
    };
    await route.fulfill({ json: data[path] ?? {} });
  });
  return posts;
}

async function openOS(page: Page) {
  await page.goto('/');
  await expect(page.locator('.os-boot')).toHaveCount(0, {timeout:8000});
}
async function navigate(page: Page, name: string) {
 if (await page.getByRole('button', {name:'Back to Home', exact:true}).isVisible()) await page.getByRole('button', {name:'Back to Home', exact:true}).click();
 if (name !== 'Overview') await page.getByRole('button', {name, exact:true}).click();
}

test('dashboard, operational tabs and autosave survive React navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const posts = await mockApi(page);
  await openOS(page);
  await expect(page.getByRole('heading', { name: 'RealEFB OS' })).toBeVisible();
  await expect(page.locator('.airport strong').first()).toHaveText('EGLL');
  await expect(page.locator('#clock')).toContainText('Z');
  await page.getByRole('button', { name: 'Open flight log' }).click();
  await expect(page.locator('#fuel-captain-remarks')).toBeVisible();
  const tabs = await page.locator('.efl-tabbar').boundingBox();
  expect(tabs!.y + tabs!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.screenshot({ animations: 'disabled', path: 'test-results/flight-log.png', fullPage: true });
  await page.locator('#fuel-captain-remarks').fill('Briefing complete');
  await navigate(page, 'Documents');
  await expect(page.getByText('No PDFs found yet.')).toBeVisible();
  await expect.poll(() => posts.some(post => post.path === '/api/simbrief/flightlog' && (post.body as { captainRemarks: string }).captainRemarks === 'Briefing complete')).toBe(true);
  await navigate(page, 'Overview');
  await expect(page.getByRole('heading', { name: 'RealEFB OS' })).toBeVisible();
  await navigate(page, 'Settings');
  await page.locator('[data-category="simbrief"]').click();
  await expect(page.locator('#settings-simbrief-id')).toBeVisible();
  expect(errors).toEqual([]);
});

test('saved account automatically imports without an Import app', async ({ page }) => {
 const posts = await mockApi(page, { initialized: false });
 await openOS(page);
 await expect(page.locator('.airport strong').first()).toHaveText('EGLL');
 await expect(page.getByRole('button', { name: 'Import flight app' })).toHaveCount(0);
 expect(posts.some(p => p.path === '/api/simbrief/import')).toBe(true);
 expect(posts.some(p => p.path === '/api/settings/simbrief')).toBe(false);
});


test('disabled apps stay hidden and tablet navigation remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await mockApi(page, { disabled: ['dispatch'] });
  await openOS(page);
  await expect(page.getByRole('heading', { name: 'RealEFB OS' })).toBeVisible();
  await expect(page.locator('.workspace-card')).toHaveCount(7);
  await expect(page.getByRole('button', { name: 'Dispatch', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Flight tracker', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ animations: 'disabled', path: 'test-results/tablet-overview.png', fullPage: true });
});

test('dashboard shows backend failure without fabricated flight data', async ({ page }) => {
  await mockApi(page);
  await openOS(page);
  await expect(page.getByRole('heading', { name: 'RealEFB OS' })).toBeVisible();
  await page.route('**/api/simbrief/flightplan', route => route.fulfill({ status: 503, json: {} }));
  await page.getByRole('button', { name: 'Refresh flight' }).click();
  await expect(page.getByText('Flight data is unavailable.', { exact: false })).toBeVisible();
  await expect(page.locator('.os-no-flight')).toBeVisible();
});

test('desktop dashboard layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await mockApi(page);
  await openOS(page);
  await expect(page.locator('.airport strong').first()).toHaveText('EGLL');
  await page.screenshot({ animations: 'disabled', path: 'test-results/desktop-overview.png', fullPage: true });
});

test('phone navigation fits inside its rail and opens documents', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page);
  await openOS(page);
  await expect(page.locator('.airport strong').first()).toHaveText('EGLL');
  const rail = await page.locator('.navigation-rail').boundingBox();
  const button = await page.getByRole('button', { name: 'Overview', exact: true }).boundingBox();
  expect(button!.x).toBeGreaterThanOrEqual(rail!.x);
  expect(button!.x + button!.width).toBeLessThanOrEqual(rail!.x + rail!.width);
  await navigate(page, 'Documents');
  await expect(page.getByText('No PDFs found yet.')).toBeVisible();
});

test('first launch opens apps without requiring setup or a flight', async ({ page }) => {
  const posts = await mockApi(page, { setup: false, initialized: false, pilotId: '' });
  await openOS(page);
  await expect(page.locator('#home-screen')).toBeVisible();
  await expect(page.locator('#init-screen')).toBeHidden();
  await expect(page.locator('#wizard-screen')).toBeHidden();
  expect(posts).toEqual([]);
  await navigate(page, 'Settings');
  await page.getByRole('button', { name: 'Setup assistant' }).click();
  await expect(page.locator('#wizard-screen')).toBeVisible();
});
test('status bar uses simulator UTC rather than the device clock', async ({ page }) => {
  await mockApi(page);
  await page.route('**/api/flight/state', route => route.fulfill({ json: {
    connected: true, state: { zuluSeconds: 86340, zuluYear: 2025, zuluMonth: 2, zuluDay: 3 },
  } }));
  await openOS(page);
  await expect(page.locator('#clock')).toHaveText('23:59Z');
  await expect(page.locator('#date')).toHaveText('3 Feb 2025');
  await expect(page.getByRole('img', { name: 'Server connected', exact: true })).toBeVisible();
});

test('failed automatic import stays nonblocking and can retry', async ({ page }) => {
 await mockApi(page, { initialized: false });
 await page.route('**/api/simbrief/import?automatic=true', route => route.fulfill({ status: 400, json: { ok: false } }));
 await openOS(page);
 await expect(page.locator('.os-sync-status')).toContainText('unavailable');
 await expect(page.getByRole('button', { name: 'Refresh flight' })).toBeEnabled();
 await navigate(page, 'Documents');
 await expect(page.getByText('No PDFs found yet.')).toBeVisible();
});


test('Google Fonts and Font Awesome load locally and reduced motion disables entrances', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockApi(page);
  await openOS(page);
  await expect(page.locator('.airport strong').first()).toHaveText('EGLL');
  await page.evaluate(() => document.fonts.ready);
  const design = await page.evaluate(() => ({
    font: getComputedStyle(document.querySelector('.page-heading h1')!).fontFamily,
    fontLoaded: document.fonts.check('600 20px Manrope'),
    icon: getComputedStyle(document.querySelector('.os-refresh i')!, '::before').content,
    animation: getComputedStyle(document.querySelector('.flight-card')!).animationName,
  }));
  expect(design.font).toContain('Manrope');
  expect(design.fontLoaded).toBe(true);
  expect(design.icon).not.toBe('none');
  expect(design.animation).toBe('none');
});

test('all EFL sections, dialogs and light mode keep the shared design usable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockApi(page);
  await openOS(page);
  await page.getByRole('button', { name: 'Open flight log' }).click();
  await expect(page.locator('#fuel-delay1-reason')).toBeVisible();
  await page.locator('#fuel-delay1-reason').click();
  await expect(page.locator('.delay-picker-modal')).toBeVisible();
  await page.locator('.delay-picker-search').fill('weather');
  await page.screenshot({ animations: 'disabled', path: 'test-results/glass-delay-picker.png' });
  await page.locator('.delay-picker-close').click();
  const sections = [
    ['fuelfmc', '.fmc-table'], ['waypoints', '.wp-card'], ['weather', '.wx-raw'],
    ['notams', '.coming-soon'], ['vp', '.coming-soon'], ['atc', '.coming-soon'], ['pdf', '.efl-pdf-html'],
  ];
  for (const [id, content] of sections) {
    await page.locator(`.efl-tab-btn[data-tab="${id}"]`).click();
    await expect(page.locator(`#efl-tab-content ${content}`).first()).toBeVisible();
    if (['fuelfmc', 'waypoints', 'weather'].includes(id)) await page.screenshot({ animations: 'disabled', path: `test-results/glass-${id}.png` });
    if (id === 'fuelfmc') {
      await page.locator('.fmc-atis-change').first().click();
      await expect(page.locator('.atis-modal')).toBeVisible();
      await page.screenshot({ animations: 'disabled', path: 'test-results/glass-atis.png' });
      await page.locator('#atis-modal-cancel').click();
    }
  }
  await page.locator('.efl-tab-btn[data-tab="flightlog"]').click();
  await expect(page.locator('#fuel-captain-remarks')).toBeVisible();
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-efl-theme', 'light');
  await expect(page.locator('#fuel-block')).toBeVisible();
  await page.screenshot({ animations: 'disabled', path: 'test-results/glass-light-mode.png' });
  expect(errors).toEqual([]);
});

test('dispatch, settings and moving-map chrome share surfaces without per-card blur', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await mockApi(page);
  // Keep this a local production-asset check; live tiles are an external integration.
  await page.route('https://**', route => route.abort());
  await openOS(page);
  await navigate(page, 'Dispatch');
  await expect(page.locator('.dispatch-log-card')).toBeVisible();
  await page.screenshot({ animations: 'disabled', path: 'test-results/glass-dispatch.png' });
  await navigate(page, 'Settings');
  await page.locator('[data-category="simbrief"]').click();
  await expect(page.locator('#settings-simbrief-id')).toBeVisible();
  await page.screenshot({ animations: 'disabled', path: 'test-results/glass-settings.png' });
  await page.locator('[data-category="apps"]').click();
  await page.locator('[data-category="webapps"]').click();
  await page.locator('#webapp-add-btn').click();
  await expect(page.locator('.webapp-editor')).toBeVisible();
  await page.screenshot({ animations: 'disabled', path: 'test-results/glass-website-editor.png' });
  await page.locator('.webapp-editor-cancel').click();
  await navigate(page, 'Flight tracker');
  await expect(page.locator('.tracker-card')).toBeVisible();
  const blur = await page.locator('.tracker-card').evaluate(element => getComputedStyle(element).backdropFilter);
  expect(blur).toBe('none');
  await page.getByRole('button', { name: 'Map type', exact: true }).click();
  await expect(page.locator('.tracker-layer-menu')).toBeVisible();
  await page.screenshot({ animations: 'disabled', path: 'test-results/glass-tracker.png' });
  expect(errors).toEqual([]);
});

test('hidden clients stop UI polling and resume with fresh data', async ({ page }) => {
  await page.clock.install();
  await mockApi(page);
  let requests = 0;
  page.on('request', request => { if (request.url().includes('/api/')) requests++; });
  await page.goto('/');
  await page.clock.runFor(6000);
  await expect(page.locator('.os-boot')).toHaveCount(0, {timeout:8000});
  await expect(page.locator('.airport strong').first()).toHaveText('EGLL');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  const before = requests;
  await page.clock.runFor(16000);
  expect(requests).toBe(before);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => requests).toBeGreaterThan(before);
});

test('boot uses the supplied logo and opens RealEFB OS without a flight gate', async ({ page }) => {
  await page.clock.install();
  const posts = await mockApi(page, { initialized: false, setup: false, pilotId: '' });
  await page.goto('/');
  await expect(page.locator('.os-boot')).toBeVisible();
  await expect(page.locator('.os-boot-mark')).toBeVisible();
  await page.screenshot({ animations: 'disabled', path: 'test-results/realefb-os-boot.png' });
  await page.clock.runFor(6000);
  await expect(page.locator('.os-boot')).toHaveCount(0, {timeout:8000});
  await expect(page.locator('.os-app-grid')).toBeVisible();
  await expect(page.locator('#init-screen')).toBeHidden();
  expect(posts).toEqual([]);
  await page.screenshot({ animations: 'disabled', path: 'test-results/realefb-os-no-flight.png' });
});

test('map follows live aircraft and route overview pauses follow', async ({ page }) => {
 await mockApi(page);
 await page.route('https://**', route => route.abort());
 await page.route('**/api/flight/state', route => route.fulfill({ json: { connected: true, state: { latitude: 51.5, longitude: -0.5, headingDegreesTrue: 120, groundSpeedKts: 250, altitudeFt: 12000, verticalSpeedFpm: 500 } } }));
 await openOS(page);
 await navigate(page, 'Flight tracker');
 await expect(page.locator('.tracker-aircraft-icon')).toBeVisible();
 await expect(page.locator('#tracker-center-btn')).toHaveAttribute('aria-pressed', 'true');
 await expect(page.locator('#tk-gs')).toHaveText('250');
 await page.getByRole('button', { name: 'Show entire route' }).click();
 await expect(page.locator('#tracker-center-btn')).toHaveAttribute('aria-pressed', 'false');
 await page.getByRole('button', { name: 'Auto follow aircraft' }).click();
 await expect(page.locator('#tracker-center-btn')).toHaveAttribute('aria-pressed', 'true');
});


test('account configured once in Settings enables automatic import', async ({ page }) => {
 const posts = await mockApi(page, { initialized: false, pilotId: '' });
 await openOS(page);
 expect(posts).toEqual([]);
 await navigate(page, 'Settings');
 await page.locator('[data-category="simbrief"]').click();
 await page.locator('#settings-simbrief-id').fill('newpilot456');
 await page.locator('#settings-simbrief-save').click();
 await expect(page.locator('#settings-simbrief-status')).toHaveText('Saved.');
 await navigate(page, 'Overview');
 await expect(page.locator('.airport strong').first()).toHaveText('EGLL');
 expect(posts.filter(p => p.path === '/api/settings/simbrief')).toHaveLength(1);
});


test('the OS remains accessible when the backend is unavailable', async ({ page }) => {
  await page.route('**/api/**', route => route.fulfill({ status: 503, json: {} }));
  await openOS(page);
  await expect(page.locator('.os-app-grid')).toBeVisible();
  await expect(page.locator('#init-screen')).toBeHidden();
  await navigate(page, 'Documents');
  await expect(page.getByText('No PDFs found yet.')).toBeVisible();
  await navigate(page, 'Overview');
  await expect(page.locator('#home-screen')).toBeVisible();
});




test('performance calculations validate inputs and show wind components', async ({ page }) => {
 await mockApi(page); await openOS(page);
 await page.getByRole('button', { name: 'Performance app', exact: true }).click();
 await expect(page.getByRole('heading', { name: 'Calculated results' })).toBeVisible();
 await expect(page.getByLabel('Planned runway')).toHaveValue('27R');
 await page.getByLabel('Field elevation').fill('0');
 await page.getByLabel('QNH').fill('1013.25');
 await page.getByLabel('Temperature', {exact:true}).fill('15');
 await page.getByLabel('Available runway').fill('3000');
 await page.getByLabel('Required distance from aircraft data').fill('2000');
 await page.getByLabel('Runway heading').fill('270');
 await page.getByLabel('Wind from').fill('270');
 await page.getByLabel('Wind speed').fill('20');
 await expect(page.locator('.utility-result').first()).toContainText('20.0 kt headwind');
 await expect(page.locator('.utility-result').nth(1)).toContainText('0.0 kt');
 await expect(page.locator('.utility-result').nth(3)).toContainText('0 ft');
 await page.screenshot({ path: 'test-results/performance.png' });
 await page.getByLabel('QNH').fill('0');
 await expect(page.getByRole('alert')).toContainText('valid conditions');
});

test('pushback stays disabled offline and submits one toggle when grounded', async ({ page }) => {
 const posts = await mockApi(page); await openOS(page);
 await page.getByRole('button', { name: 'Pushback app', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Request / release tug' })).toBeDisabled();
 await page.route('**/api/flight/state', route => route.fulfill({ json: { connected: true, state: { onGround: true, groundSpeedKts: 0 } } }));
 await expect(page.getByRole('button', { name: 'Request / release tug' })).toBeEnabled();
 await page.getByRole('button', { name: 'Request / release tug' }).click();
 await expect(page.locator('.ground-controls > p[role=status]')).toContainText('command sent');
 expect(posts.filter(p => p.path === '/api/pushback/control')).toHaveLength(1);
 await page.screenshot({ path: 'test-results/pushback.png' });
});

test('new wallpapers migrate the old choice and map buttons align', async ({ page }) => {
 await page.addInitScript(() => localStorage.setItem('realefb.wallpaper','sky'));
 await mockApi(page); await openOS(page);
 await expect(page.locator('body')).toHaveAttribute('data-wallpaper','aurora');
 await navigate(page, 'Flight tracker');
 const boxes = await page.locator('.tracker-controls button').evaluateAll(nodes => nodes.map(n => ({ x:n.getBoundingClientRect().x, width:n.getBoundingClientRect().width })));
 expect(new Set(boxes.map(b => b.x)).size).toBe(1);
 expect(boxes.every(b => b.width === 54)).toBe(true);
});

test('takeoff and landing import independent plan conditions and retain edits', async ({ page }) => {
 await mockApi(page); await openOS(page);
 await page.getByRole('button', {name:'Performance app', exact:true}).click();
 await expect(page.getByLabel('Planned runway')).toHaveValue('27R');
 await expect(page.getByLabel('Wind from', {exact:true})).toHaveValue('240');
 await expect(page.getByLabel('Field elevation')).toHaveValue('83');
 await expect(page.getByLabel('Available runway')).toHaveValue('');
 await page.getByLabel('Runway heading').fill('269');
 await page.getByRole('tab', {name:'Landing'}).click();
 await expect(page.getByLabel('Planned runway')).toHaveValue('09L');
 await expect(page.getByLabel('Field elevation')).toHaveValue('2459');
 await expect(page.getByLabel('Wind from', {exact:true})).toHaveValue('090');
 await expect(page.getByLabel('QNH')).toHaveValue('1015');
 await page.getByRole('tab', {name:'Takeoff'}).click();
 await expect(page.getByLabel('Runway heading')).toHaveValue('269');
 await page.screenshot({path:'test-results/performance-plan.png'});
 await page.getByRole('button', {name:'Back to Home', exact:true}).click();
 await expect(page.locator('#home-screen')).toBeVisible();
 await page.getByRole('button', {name:'Flight log', exact:true}).click();
 await page.getByRole('button', {name:'Back to Home', exact:true}).click();
 await expect(page.locator('#home-screen')).toBeVisible();
});

test('taxi map works without a flight plan and follows valid simulator fixes', async ({ page }) => {
 await mockApi(page, {initialized:false,pilotId:''});
 await page.route('https://**', route => route.abort());
 let longitude = 0; let latitude = 0;
 await page.route('**/api/flight/state', route => route.fulfill({json:{connected:true,state:{latitude,longitude,groundSpeedKts:12,headingDegreesTrue:95,altitudeFt:80,verticalSpeedFpm:0,onGround:true}}}));
 await openOS(page);
 await page.getByRole('button',{name:'Taxi Map app',exact:true}).click();
 await expect(page.locator('.os-dock')).toHaveCount(0);
 await expect(page.locator('.taxi-sheet')).toBeVisible();
 await expect(page.locator('#clock')).not.toContainText('NaN');
 await expect(page.locator('#date')).not.toContainText('Invalid');
 await expect(page.locator('.tracker-aircraft-icon')).toHaveCount(0);
 latitude=51.47; longitude=-0.45;
 await expect(page.locator('.tracker-aircraft-icon')).toBeVisible();
 await expect(page.locator('#tk-gs')).toHaveText('12');
 await page.screenshot({path:'test-results/taxi-map.png'});
 await page.getByRole('button',{name:'Back to Home'}).click();
 await expect(page.locator('.os-dock')).toBeVisible();
});

test('ground controls send explicit commands and show dismissible glass notifications', async ({page}) => {
 const posts=await mockApi(page);
 await page.route('**/api/flight/state',route => route.fulfill({json:{connected:true,state:{onGround:true,groundSpeedKts:0,headingDegreesTrue:90}}}));
 await openOS(page);
 await page.getByRole('button',{name:'Pushback app',exact:true}).click();
 await page.getByRole('button',{name:'Reverse',exact:true}).click();
 await expect(page.locator('.island-notice')).toContainText('Reverse command sent');
 expect(posts.at(-1)?.body).toEqual({action:'move',value:-1});
 await page.getByRole('button',{name:'Hold position',exact:true}).click();
 await expect.poll(() => posts.at(-1)?.body).toEqual({action:'stop',value:0});
 await page.getByRole('button',{name:'Left',exact:true}).click();
 await expect.poll(() => posts.at(-1)?.body).toEqual({action:'heading',value:75});
 await page.getByRole('button',{name:'Dismiss notification'}).first().click();
 await page.screenshot({path:'test-results/ground-control.png'});
});

test('settings grouped rows open detail pages and save raises a notification', async ({page}) => {
 await mockApi(page); await openOS(page); await navigate(page,'Settings');
 await expect(page.locator('.settings-detail-page:not(.hidden) .settings-detail-heading')).toContainText('SimBrief account');
 await page.locator('#settings-simbrief-save').click();
 await expect(page.locator('.island-notice')).toContainText('Saved.');
 await page.getByRole('button',{name:'Wallpaper',exact:true}).click();
 await expect(page.locator('.settings-detail-page:not(.hidden)')).toContainText('Aurora');
 await expect(page.locator('.settings-detail-page[data-category-page=simbrief]')).toBeHidden();
 await page.screenshot({path:'test-results/settings-grouped.png'});
});

test('notification island supports actionable loadsheet notices', async ({page}) => {
 await mockApi(page); await openOS(page);
 await page.evaluate(() => window.dispatchEvent(new CustomEvent('realefb:notification',{detail:{title:'Final loadsheet',message:'Ready for review',onOpen:() => document.body.dataset.noticeOpened='yes'}})));
 await page.getByRole('button',{name:'Open Dispatch',exact:true}).click();
 await expect(page.locator('body')).toHaveAttribute('data-notice-opened','yes');
 await expect(page.locator('.island-notice')).toHaveCount(0);
});

test('notification center stores quiet notifications and developer mode sends tests', async ({page}) => {
 await mockApi(page);await openOS(page);
 await expect(page.locator('.notification-test')).toHaveCount(0);
 await page.getByRole('button',{name:'Open Notification Center',exact:true}).click();
 await page.getByRole('button',{name:'Do Not Disturb Off',exact:true}).click();
 await page.getByRole('button',{name:'Close Notification Center',exact:true}).click();
 await navigate(page,'Settings');
 await page.getByRole('button',{name:'Developer mode',exact:true}).click();
 await page.getByRole('button',{name:'Send test notification',exact:true}).click();
 await expect(page.locator('.island-notice')).toHaveCount(0);
 await page.getByRole('button',{name:'Open Notification Center',exact:true}).click();
 await expect(page.locator('.notification-center article')).toContainText('Test notification');
 await expect(page.getByRole('button',{name:'Do Not Disturb On',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.screenshot({path:'test-results/notification-center.png'});
});

test('settings fills the app, keeps developer last and persists dark appearance', async ({page}) => {
 await mockApi(page);await openOS(page);await navigate(page,'Settings');
 await expect(page.locator('[data-category]').last()).toHaveText('Developer mode');
 const box=await page.locator('.settings-native').boundingBox();expect(box!.width).toBeGreaterThan(page.viewportSize()!.width-5);
 await page.getByRole('button',{name:'Appearance',exact:true}).click();
 await page.getByRole('button',{name:'Dark',exact:true}).click();
 await expect(page.locator('body')).toHaveAttribute('data-appearance','dark');
 await page.reload();await expect(page.locator('.os-boot')).toHaveCount(0, {timeout:8000});await navigate(page,'Settings');
 await expect(page.locator('body')).toHaveAttribute('data-appearance','dark');
 await page.screenshot({path:'test-results/settings-dark-full.png'});
});

test('local clock preference and nature wallpapers persist', async ({page}) => {
 await mockApi(page);await openOS(page);await navigate(page,'Settings');
 await page.getByRole('button',{name:'Appearance',exact:true}).click();
 await page.getByLabel('Show local time alongside UTC').check();
 await expect(page.locator('.local-clock')).toBeVisible();
 await page.getByRole('button',{name:'Wallpaper',exact:true}).click();
 await page.getByRole('button',{name:'Forest',exact:true}).click();
 await expect(page.locator('body')).toHaveAttribute('data-wallpaper','forest');
 await page.reload();await expect(page.locator('.os-boot')).toHaveCount(0, {timeout:8000});
 await expect(page.locator('.local-clock')).toBeVisible();
 await expect(page.locator('body')).toHaveAttribute('data-wallpaper','forest');
});

test('ground services, easy pushback and icon geometry', async ({ page }) => {
 const posts=await mockApi(page);
 await page.route('**/api/flight/state', route=>route.fulfill({json:{connected:true,state:{onGround:true,groundSpeedKts:0,headingDegreesTrue:90}}}));
 await openOS(page);
 await expect(page.locator('.app-icon-taxi .os-app-icon > i')).toHaveCount(0);
 const icon=page.locator('.app-icon-taxi .os-app-icon');
 const shape=await icon.evaluate(el=>{const r=el.getBoundingClientRect();const s=el.querySelector('svg')!.getBoundingClientRect();return {x:Math.abs((r.x+r.width/2)-(s.x+s.width/2)),y:Math.abs((r.y+r.height/2)-(s.y+s.height/2))};});
 expect(shape.x).toBeLessThan(1);expect(shape.y).toBeLessThan(1);
 await page.screenshot({path:'test-results/home-polish.png'});
 await page.getByRole('button',{name:'Ground Operations app',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Ground services',exact:true})).toBeVisible();
 for(const service of ['Jetway','Passenger stairs','Baggage','Fuel truck','Catering','Ground power']) {
  const card=page.locator('.service-card').filter({has:page.getByRole('heading',{name:service,exact:true})});
  await expect(card.getByRole('button')).toBeEnabled();await card.getByRole('button').click();
  await expect(card.getByRole('status')).toContainText('Request sent');
 }
 expect(posts.filter(p=>p.path==='/api/ground/control').map(p=>p.body)).toEqual(['jetway','stairs','baggage','fuel','catering','power'].map(service=>({service})));
 await page.locator('.utility-app').evaluate(el=>el.scrollTo(0,0));
 await page.screenshot({animations:'disabled',path:'test-results/ground-services.png'});
 await page.getByRole('tab',{name:'Easy pushback'}).click();
 await page.getByRole('button',{name:'Start pushback',exact:true}).click();
 expect(posts.some(p=>p.path==='/api/pushback/control' && JSON.stringify(p.body)===JSON.stringify({action:'move',value:-1}))).toBeTruthy();
 await page.getByRole('button',{name:'Hold position',exact:true}).click();
 await page.screenshot({path:'test-results/easy-pushback.png'});
 await page.getByRole('button',{name:'Back to Home',exact:true}).click();
 await page.getByRole('button',{name:'Settings app',exact:true}).click();
 await expect(page.getByRole('button',{name:'Back to Home',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Back to Home',exact:true}).click();
 await expect(page.locator('.os-app-grid')).toBeVisible();
});

test('ground requests respect parked state and surface simulator errors on mobile', async ({page})=>{
 await page.setViewportSize({width:390,height:844});
 await mockApi(page);await openOS(page);
 await page.getByRole('button',{name:'Ground Operations app',exact:true}).click();
 const fuel=page.locator('.service-card').filter({has:page.getByRole('heading',{name:'Fuel truck',exact:true})});
 await expect(fuel.getByRole('button')).toBeDisabled();
 await page.route('**/api/flight/state',route=>route.fulfill({json:{connected:true,state:{onGround:true,groundSpeedKts:2}}}));
 await expect(fuel.getByRole('button')).toBeDisabled();
 await page.route('**/api/flight/state',route=>route.fulfill({json:{connected:true,state:{onGround:true,groundSpeedKts:0}}}));
 await expect(fuel.getByRole('button')).toBeEnabled();
 await page.route('**/api/ground/control',route=>route.fulfill({status:400,json:{error:'Stand service unavailable'}}));
 await fuel.getByRole('button').click();await expect(fuel.getByRole('status')).toHaveText('Stand service unavailable');
 await expect(fuel.getByRole('button')).toBeEnabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Back to Home',exact:true}).click();
 await page.getByRole('button',{name:'Settings app',exact:true}).click();
 await page.getByRole('button',{name:'Back to Home',exact:true}).click();
 await expect(page.locator('.os-app-grid')).toBeVisible();
});


test('top bar back stays inside Settings header and command center corners stay intact',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await mockApi(page);await openOS(page);
 for(const appearance of ['light','dark']){
  await page.evaluate(value=>{document.body.dataset.appearance=value;localStorage.setItem('realefb.appearance',value);},appearance);
  await page.getByRole('button',{name:'Settings app',exact:true}).click();
  const back=page.getByRole('button',{name:'Back to Home',exact:true});
  await expect(back).toBeVisible();
  const bounds=await back.boundingBox();const header=await page.locator('.app-header').boundingBox();
  expect(bounds!.y).toBeGreaterThanOrEqual(header!.y);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(header!.y+header!.height);
  expect(await back.evaluate(el=>getComputedStyle(el).position)).toBe('static');
  await expect(page.locator('.settings-native')).toBeVisible();
  await page.screenshot({animations:'disabled',path:`test-results/settings-back-${appearance}.png`});
  await back.click();
 }
 await page.getByRole('button',{name:'Open Notification Center',exact:true}).click();
 for(const value of ['0','60','100']){
  await page.getByLabel('Display brightness',{exact:true}).fill(value);
  await page.getByLabel('Alert volume',{exact:true}).fill(value);
  expect(await page.locator('.glass-level').first().evaluate(el=>getComputedStyle(el).clipPath)).toContain('round 24px');
  await page.screenshot({path:`test-results/command-corners-${value}.png`});
 }
});

for(const viewport of [{width:360,height:800},{width:768,height:1024},{width:1440,height:900},{width:812,height:375}]){
 test(`responsive UI kit at ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await mockApi(page);await openOS(page);
  const checkWidth=async()=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await checkWidth();
  for(const app of ['Performance','Ground Operations','Pushback','Settings','Documents','Dispatch','Flight log','Taxi Map','Flight tracker']){
   await page.getByRole('button',{name:`${app} app`,exact:true}).click();
   await checkWidth();
   const main=app==='Performance'||app==='Ground Operations'||app==='Pushback'?'.utility-app':app==='Settings'?'.settings-detail':'#detail-screen';
   const overflow=await page.locator(main).evaluate(el=>el.scrollWidth-el.clientWidth);
   expect(overflow,`${app} width at ${viewport.width}`).toBeLessThanOrEqual(1);
   if(app==='Performance'){
    await page.getByLabel('Available runway',{exact:true}).fill('3000');
    await page.getByLabel('Required distance from aircraft data',{exact:true}).fill('2000');
    await expect(page.getByRole('meter',{name:'Runway utilization'})).toHaveAttribute('aria-valuenow');
    await page.getByRole('tab',{name:'Landing',exact:true}).click();
    await expect(page.getByLabel('Planned runway',{exact:true})).toHaveValue('09L');
    await page.getByRole('tab',{name:'Takeoff',exact:true}).click();
    await expect(page.getByLabel('Available runway',{exact:true})).toHaveValue('3000');
    await page.locator(main).evaluate(el=>el.scrollTo(0,0));
   }
   await page.screenshot({animations:'disabled',path:`test-results/responsive-${app.replaceAll(' ','-')}-${viewport.width}.png`});
   await page.getByRole('button',{name:'Back to Home',exact:true}).click();
  }
  await page.getByRole('button',{name:'Open Notification Center',exact:true}).click();
  const box=await page.getByRole('dialog',{name:'Notification Center',exact:true}).boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(viewport.width);
  expect(errors).toEqual([]);
 });
}

for(const viewport of [{width:1920,height:980},{width:1280,height:720},{width:360,height:800},{width:390,height:640},{width:812,height:375}]){
 test(`ground workspaces fit one screen ${viewport.width}x${viewport.height}`,async({page})=>{
  await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await mockApi(page);await openOS(page);
  await page.getByRole('button',{name:'Ground Operations app',exact:true}).click();
  const assertFits=async()=>{
   expect(await page.locator('.utility-app').evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(1);
   for(const button of await page.locator('.utility-app button:visible').all()){
    const box=await button.boundingBox();expect(box!.y).toBeGreaterThanOrEqual(44);expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height+1);expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(viewport.width+1);
   }
  };
  await assertFits();await expect(page.locator('.service-card')).toHaveCount(6);
  await page.screenshot({animations:'disabled',path:`test-results/fit-services-${viewport.width}-${viewport.height}.png`});
  await page.getByRole('tab',{name:'Easy pushback',exact:true}).click();
  await assertFits();await expect(page.locator('.ground-3d-canvas canvas')).toBeVisible();
  expect(await page.locator('.ground-3d-canvas canvas').evaluate((el:HTMLCanvasElement)=>el.width>0&&el.height>0)).toBe(true);
  await page.screenshot({animations:'disabled',path:`test-results/fit-pushback-${viewport.width}-${viewport.height}.png`});
  await page.getByRole('button',{name:'Target heading',exact:true}).click();await expect(page.getByRole('dialog',{name:'Target heading',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Close target heading',exact:true}).click();
 });
}


test('3D ground view follows measured fixes and preview sends no commands',async({page})=>{
 const posts=await mockApi(page);await page.emulateMedia({reducedMotion:'reduce'});await openOS(page);
 await page.getByRole('button',{name:'Pushback app',exact:true}).click();
 const view=page.locator('.ground-3d-canvas');await expect(view.locator('canvas')).toBeVisible();await expect(page.locator('.ground-3d-error')).toHaveCount(0);
 await page.getByRole('button',{name:'Preview motion',exact:true}).click();await expect(view).toHaveAttribute('data-motion-source','preview');
 const before=await view.getAttribute('data-model-z');await expect.poll(()=>view.getAttribute('data-model-z')).not.toBe(before);
 expect(posts.filter(p=>p.path.includes('/pushback/'))).toHaveLength(0);
 await page.getByRole('button',{name:'Switch to angled 3D view',exact:true}).click();await page.screenshot({animations:'disabled',path:'test-results/ground-3d-angle.png'});
 await page.getByRole('button',{name:'Switch to top-down view',exact:true}).click();await page.getByRole('button',{name:'Exit preview',exact:true}).click();
 let state={onGround:true,groundSpeedKts:.6,headingDegreesTrue:0,latitude:51,longitude:-.45};
 await page.route('**/api/flight/state',route=>route.fulfill({json:{connected:true,state}}));
 await expect(page.getByRole('button',{name:'Start pushback',exact:true})).toBeEnabled();
 state={...state,latitude:51.00002};await expect(view).toHaveAttribute('data-motion-source','telemetry');await expect(view).toHaveAttribute('data-travel-direction','forward');
 state={...state,latitude:51.00001};await expect(view).toHaveAttribute('data-travel-direction','reverse');
 state={...state,headingDegreesTrue:90};await expect.poll(async()=>Number(await view.getAttribute('data-model-heading'))).toBeCloseTo(90,0);
 await page.getByRole('button',{name:'Left',exact:true}).click();await expect(page.locator('.ground-controls')).toContainText('Turn left command sent');
 await page.screenshot({animations:'disabled',path:'test-results/ground-3d-top.png'});
 state={...state,groundSpeedKts:0};await expect(view).toHaveAttribute('data-motion-source','stationary');
});

test('home dock stays horizontal and unclipped in short landscape windows',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await mockApi(page);await openOS(page);
 for(const viewport of [{width:1196,height:440},{width:812,height:375},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  const dock=page.locator('.os-dock');const box=await dock.boundingBox();
  expect(box!.height).toBeLessThan(100);expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height);
  expect(await dock.locator('nav').evaluate(el=>getComputedStyle(el).flexDirection)).toBe('row');
  for(const button of await dock.getByRole('button').all()){
   const rect=await button.boundingBox();expect(rect!.y).toBeGreaterThanOrEqual(box!.y);expect(rect!.y+rect!.height).toBeLessThanOrEqual(box!.y+box!.height);
  }
  await page.screenshot({animations:'disabled',path:`test-results/dock-fixed-${viewport.width}.png`});
 }
 await page.getByRole('button',{name:'Settings',exact:true}).click();await expect(page.locator('.settings-native')).toBeVisible();
});

test('new Nature and Elements wallpapers load and survive reload',async({page})=>{
 test.setTimeout(60000);
 await mockApi(page);await page.emulateMedia({reducedMotion:'reduce'});await openOS(page);
 for(const [id,label]of [['tidal','Tidal Glass'],['ember','Ember Flow'],['highlands','Misty Highlands'],['glacier','Glacier Dawn']]){
  await page.getByRole('button',{name:'Settings app',exact:true}).click();await page.getByRole('button',{name:'Wallpaper',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Nature',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Elements',exact:true})).toBeVisible();
  await page.getByRole('button',{name:label,exact:true}).click();await expect(page.locator('body')).toHaveAttribute('data-wallpaper',id);
  expect((await page.request.get(`/assets/wallpapers/${id}.jpg`)).ok()).toBe(true);
  await page.reload();await expect(page.locator('.os-boot')).toHaveCount(0,{timeout:8000});await expect(page.locator('body')).toHaveAttribute('data-wallpaper',id);
  expect(await page.locator('#wallpaper').evaluate(el=>getComputedStyle(el).backgroundImage)).toContain(`${id}.jpg`);
 }
});
