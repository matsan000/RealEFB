// Liquid Glass refraction. Chromium (desktop WebView2, Chrome, Android) can feed an SVG
// displacement filter into backdrop-filter, which bends whatever sits behind the glass at its
// rounded edges, like a thick lens. Each opted-in element ([data-liquid-glass]) gets a map
// generated for its exact size; every other browser keeps the plain frosted-glass material.

const SVG_NS = 'http://www.w3.org/2000/svg';
let counter = 0;

function supported() {
  const chromium = 'userAgentData' in navigator;
  const reduced = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  return chromium && !reduced && typeof ResizeObserver !== 'undefined';
}

// Encodes, per pixel, how far to sample the backdrop: zero across the flat middle, rising steeply
// through a curved bezel along the rounded-rectangle edge and always pointing inwards.
function displacementMap(width: number, height: number, radius: number, bezel: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const image = ctx.createImageData(width, height);
  const hw = width / 2, hh = height / 2;
  const r = Math.min(radius, hw, hh);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const px = x + 0.5 - hw, py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - r), qy = Math.abs(py) - (hh - r);
      let nx = 0, ny = 0, dist: number;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy) || 1;
        dist = r - len; nx = qx / len; ny = qy / len;
      } else if (qx > qy) { dist = r - qx; nx = 1; } else { dist = r - qy; ny = 1; }
      nx *= Math.sign(px) || 1; ny *= Math.sign(py) || 1;
      const t = Math.max(0, Math.min(1, 1 - dist / bezel));
      const m = t * t * (3 - 2 * t); // smooth convex bezel profile
      const i = (y * width + x) * 4;
      image.data[i] = Math.round(128 - nx * m * 127);
      image.data[i + 1] = Math.round(128 - ny * m * 127);
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

export function attachLiquidGlass() {
  if (!supported()) return undefined;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  document.body.append(svg);
  const filters = new Map<Element, { id: string; size: string }>();

  function build(el: HTMLElement) {
    const width = Math.round(el.offsetWidth), height = Math.round(el.offsetHeight);
    if (width < 8 || height < 8) return;
    const size = `${width}x${height}`;
    const existing = filters.get(el);
    if (existing?.size === size) return;
    const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const bezel = Math.max(8, Math.min(26, height * 0.38));
    const href = displacementMap(width, height, radius, bezel);
    if (!href) return;
    const id = existing?.id || `lg-refract-${++counter}`;
    svg.querySelector(`#${id}`)?.remove();
    const filter = document.createElementNS(SVG_NS, 'filter');
    filter.id = id;
    for (const [k, v] of Object.entries({ x: '0', y: '0', width: String(width), height: String(height), filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' })) filter.setAttribute(k, v);
    const map = document.createElementNS(SVG_NS, 'feImage');
    for (const [k, v] of Object.entries({ href, x: '0', y: '0', width: String(width), height: String(height), preserveAspectRatio: 'none', result: 'map' })) map.setAttribute(k, v);
    const displace = document.createElementNS(SVG_NS, 'feDisplacementMap');
    for (const [k, v] of Object.entries({ in: 'SourceGraphic', in2: 'map', scale: String(Math.round(bezel * 1.6)), xChannelSelector: 'R', yChannelSelector: 'G' })) displace.setAttribute(k, v);
    filter.append(map, displace);
    svg.append(filter);
    filters.set(el, { id, size });
    el.style.setProperty('--lg-refraction', `url(#${id})`);
    el.classList.add('lg-refract');
  }

  const resize = new ResizeObserver(entries => { for (const entry of entries) build(entry.target as HTMLElement); });
  const scan = () => document.querySelectorAll<HTMLElement>('[data-liquid-glass]').forEach(el => {
    if (!filters.has(el)) { resize.observe(el); build(el); }
  });
  scan();
  const mutations = new MutationObserver(scan);
  // Glass surfaces are shell chrome (direct children of the OS root), so app content churn is ignored.
  mutations.observe(document.querySelector('.efb-app') || document.body, { childList: true });
  return () => {
    resize.disconnect();
    mutations.disconnect();
    filters.forEach((_, el) => { (el as HTMLElement).classList.remove('lg-refract'); (el as HTMLElement).style.removeProperty('--lg-refraction'); });
    svg.remove();
  };
}
