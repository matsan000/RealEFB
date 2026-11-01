var e=`home`,t=0,n=null;function r(e){let t=e.target instanceof Element?e.target.closest(`button, a, [role="button"]`):null;if(!t)return;let r=(t.querySelector(`.os-app-icon, .os-dock-icon`)||t).getBoundingClientRect();r.width&&(n={x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,t:performance.now()})}document.addEventListener(`pointerdown`,r,!0),document.addEventListener(`click`,r,!0);function i(){return document.querySelector(`.app-content`)}function a(e){let t=[`#home-screen [data-app-id="${e}"] .os-app-icon`,`.os-dock .dock-${e} .os-dock-icon`];for(let e of t){let t=document.querySelector(e)?.getBoundingClientRect();if(t&&t.width)return{x:t.left+t.width/2,y:t.top+t.height/2,w:t.width,h:t.height}}return null}function o(e){let t=i()?.getBoundingClientRect(),n=document.documentElement.style;if(!t||!t.width)return;let r=e||{x:t.left+t.width/2,y:t.top+t.height*.55,w:t.width*.3,h:t.width*.3},a=Math.min(.6,Math.max(.06,Math.max(r.w/t.width,r.h/t.height)*1.15));n.setProperty(`--os-vt-x`,`${Math.round(r.x-t.left)}px`),n.setProperty(`--os-vt-y`,`${Math.round(r.y-t.top)}px`),n.setProperty(`--os-vt-s`,a.toFixed(3)),n.setProperty(`--os-vt-r`,`${Math.round(24/a)}px`)}function s(e){let t=i();t&&(t.dataset.osAnim=``,t.offsetWidth,t.dataset.osAnim=e,window.setTimeout(()=>{t.dataset.osAnim===e&&delete t.dataset.osAnim},650))}function c(r,i){let c=e;e=r;let l=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,u=!!document.querySelector(`.os-boot:not(.is-leaving)`);if(c===r||l||u||document.hidden){i();return}let d=r===`home`?`close`:c===`home`?`open`:`switch`,f=n&&performance.now()-n.t<1200?n:null;n=null,d!==`close`&&o(f||a(r));let p=document.documentElement,m=document.startViewTransition;if(!m){i(),d===`close`&&o(a(c)),s(d);return}let h=++t;p.dataset.osTransition=d,m.call(document,()=>{i(),d===`close`&&o(a(c))}).finished.finally(()=>{t===h&&delete p.dataset.osTransition})}function l(e){return`<i class="fa-solid fa-${e}" aria-hidden="true"></i>`}var u={documents:l(`folder-open`),logbook:l(`book-open`),settings:l(`gear`),dispatch:l(`tower-broadcast`),tracker:l(`route`),webapp:l(`globe`),simprinter:l(`print`),simcallouts:l(`bullhorn`)},d=[{id:`taxi`,label:`Taxi Map`,color:`#2ecb9b`,kind:`native`},{id:`performance`,label:`Performance`,color:`#0891b2`,kind:`native`},{id:`ground`,label:`Ground Operations`,color:`#0891b2`,kind:`native`},{id:`pushback`,label:`Pushback`,color:`#e28b33`,kind:`native`},{id:`logbook`,label:`EFL`,color:`#f08c2e`,gradient:[`#ffb454`,`#e8590c`],kind:`native`},{id:`dispatch`,label:`Dispatch`,color:`#2f7dc2`,gradient:[`#5aa9ff`,`#1c5fd4`],kind:`native`},{id:`tracker`,label:`Flight Tracker`,color:`#12a37f`,gradient:[`#3ddc97`,`#0b7f6a`],kind:`native`},{id:`documents`,label:`Documents`,color:`#7a5af8`,gradient:[`#a78bfa`,`#5b33d6`],kind:`native`}],f={id:`settings`,label:`Settings`,color:`#6b7280`,gradient:[`#9aa4b2`,`#4b5563`]},p=[[`#38bdf8`,`#1d4ed8`],[`#f472b6`,`#be185d`],[`#34d399`,`#047857`],[`#fbbf24`,`#d97706`],[`#a78bfa`,`#6d28d9`],[`#f87171`,`#b91c1c`],[`#2dd4bf`,`#0f766e`],[`#818cf8`,`#4338ca`]];function m(e){let t=0;for(let n of String(e||``))t=t*31+n.codePointAt(0)>>>0;return p[t%p.length]}function h(e){let t=String(e||``).trim().split(/\s+/).filter(Boolean);return t.length?(t.length>1?t[0][0]+t[1][0]:t[0].slice(0,2)).toUpperCase():`?`}var g={};function _(e){return g[e]!==!1}var v=[],y=[{id:`simprinter`,name:`SimPrinter`,url:`http://localhost:39910`,icon:`simprinter`,logo:`assets/webapp-icons/simprinter.png`},{id:`simcallouts`,name:`SimCallouts`,url:`http://localhost:39920`,icon:`simcallouts`,logo:`assets/webapp-icons/simcallouts.png`}];new Set(y.map(e=>e.logo));var b=[{id:`flightlog`,label:`Flight Log`,icon:`clipboard-list`},{id:`fuelfmc`,label:`Fuel/FMC`,icon:`gas-pump`},{id:`waypoints`,label:`Waypoints`,icon:`location-dot`},{id:`weather`,label:`Weather`,icon:`cloud-sun`},{id:`notams`,label:`NOTAMS`,icon:`triangle-exclamation`},{id:`vp`,label:`VP`,icon:`chart-line`},{id:`atc`,label:`ATC`,icon:`headset`},{id:`pdf`,label:`PDF`,icon:`file-pdf`}],ee=[{group:`Other`,codes:[{code:`00-05`,letter:``,desc:`Airline internal codes`},{code:`06`,letter:`OA`,desc:`No gate/stand availability due to own airline activity`},{code:`09`,letter:`SG`,desc:`Scheduled ground time less than declared minimum ground time`}]},{group:`Passenger and Baggage`,codes:[{code:`11`,letter:`PD`,desc:`Late check-in, acceptance after deadline`},{code:`12`,letter:`PL`,desc:`Late check-in, congestion in check-in area`},{code:`13`,letter:`PE`,desc:`Check-in error, passenger and baggage`},{code:`14`,letter:`PO`,desc:`Oversales, booking errors`},{code:`15`,letter:`PH`,desc:`Boarding, discrepancies and paging, missing checked-in passenger`},{code:`16`,letter:`PS`,desc:`Commercial publicity/passenger convenience, VIP, press, ground meals and missing personal items`},{code:`17`,letter:`PC`,desc:`Catering order, late or incorrect order given to supplier`},{code:`18`,letter:`PB`,desc:`Baggage processing, sorting etc.`},{code:`19`,letter:`PW`,desc:`Reduced mobility, boarding/deboarding of passengers with reduced mobility`}]},{group:`Cargo and Mail`,codes:[{code:`21`,letter:`CD`,desc:`Documentation, errors etc.`},{code:`22`,letter:`CP`,desc:`Late positioning`},{code:`23`,letter:`CC`,desc:`Late acceptance`},{code:`24`,letter:`CI`,desc:`Inadequate packing`},{code:`25`,letter:`CO`,desc:`Oversales, booking errors`},{code:`26`,letter:`CU`,desc:`Late preparation in warehouse`},{code:`27`,letter:`CE`,desc:`Documentation, packing etc. (mail only)`},{code:`28`,letter:`CL`,desc:`Late positioning (mail only)`},{code:`29`,letter:`CA`,desc:`Late acceptance (mail only)`}]},{group:`Aircraft and Ramp Handling`,codes:[{code:`31`,letter:`GD`,desc:`Aircraft documentation late/inaccurate, weight and balance, general declaration, pax manifest, etc.`},{code:`32`,letter:`GL`,desc:`Loading/unloading, bulky, special load, cabin load, lack of loading staff`},{code:`33`,letter:`GE`,desc:`Loading equipment, lack of or breakdown, e.g. container pallet loader, lack of staff`},{code:`34`,letter:`GS`,desc:`Servicing equipment, lack of or breakdown, lack of staff, e.g. steps`},{code:`35`,letter:`GC`,desc:`Aircraft cleaning`},{code:`36`,letter:`GF`,desc:`Fuelling/defuelling, fuel supplier`},{code:`37`,letter:`GB`,desc:`Catering, late delivery or loading`},{code:`38`,letter:`GU`,desc:`ULD, lack of or serviceability`},{code:`39`,letter:`GT`,desc:`Technical equipment, lack of or breakdown, lack of staff, e.g. pushback`}]},{group:`Technical and Aircraft Equipment`,codes:[{code:`41`,letter:`TD`,desc:`Aircraft defects`},{code:`42`,letter:`TM`,desc:`Scheduled maintenance, late release`},{code:`43`,letter:`TN`,desc:`Non-scheduled maintenance, special checks and/or additional works beyond normal maintenance schedule`},{code:`44`,letter:`TS`,desc:`Spares and maintenance equipment, lack of or breakdown`},{code:`45`,letter:`TA`,desc:`AOG spares, to be carried to another station`},{code:`46`,letter:`TC`,desc:`Aircraft change, for technical reasons`},{code:`47`,letter:`TL`,desc:`Stand-by aircraft, lack of planned stand-by aircraft for technical reasons`},{code:`48`,letter:`TV`,desc:`Scheduled cabin configuration/version adjustments`}]},{group:`Damage to Aircraft & EDP/Automated Equipment Failure`,codes:[{code:`51`,letter:`DF`,desc:`Damage during flight operations, bird or lightning strike, turbulence, heavy or overweight landing, collision during taxiing`},{code:`52`,letter:`DG`,desc:`Damage during ground operations, collisions (other than during taxiing), loading/off-loading damage, contamination, towing, extreme weather conditions`},{code:`55`,letter:`ED`,desc:`Departure control`},{code:`56`,letter:`EC`,desc:`Cargo preparation/documentation`},{code:`57`,letter:`EF`,desc:`Flight plans`},{code:`58`,letter:`EO`,desc:`Other automated system`}]},{group:`Flight Operations and Crewing`,codes:[{code:`61`,letter:`FP`,desc:`Flight plan, late completion or change of, flight documentation`},{code:`62`,letter:`FF`,desc:`Operational requirements, fuel, load alteration`},{code:`63`,letter:`FT`,desc:`Late crew boarding or departure procedures, other than connection and standby (flight deck or entire crew)`},{code:`64`,letter:`FS`,desc:`Flight deck crew shortage, sickness, awaiting standby, flight time limitations, crew meals, valid visa, health documents, etc.`},{code:`65`,letter:`FR`,desc:`Flight deck crew special request, not within operational requirements`},{code:`66`,letter:`FL`,desc:`Late cabin crew boarding or departure procedures, other than connection and standby`},{code:`67`,letter:`FC`,desc:`Cabin crew shortage, sickness, awaiting standby, flight time limitations, crew meals, valid visa, health documents, etc.`},{code:`68`,letter:`FA`,desc:`Cabin crew error or special request, not within operational requirements`},{code:`69`,letter:`FB`,desc:`Captain request for security check, extraordinary`}]},{group:`Weather`,codes:[{code:`71`,letter:`WO`,desc:`Departure station`},{code:`72`,letter:`WT`,desc:`Destination station`},{code:`73`,letter:`WR`,desc:`En route or alternate`},{code:`75`,letter:`WI`,desc:`De-icing of aircraft, removal of ice and/or snow, frost prevention excluding unserviceability of equipment`},{code:`76`,letter:`WS`,desc:`Removal of snow, ice, water and sand from airport`},{code:`77`,letter:`WG`,desc:`Ground handling impaired by adverse weather conditions`}]},{group:`ATFM, Airport and Governmental Authorities`,codes:[{code:`81`,letter:`AT`,desc:`ATFM due to ATC en-route demand/capacity, standard demand/capacity problems`},{code:`82`,letter:`AX`,desc:`ATFM due to ATC staff/equipment en-route, reduced capacity caused by industrial action or staff shortage, equipment failure, military exercise or extraordinary demand due to capacity reduction in neighbouring area`},{code:`83`,letter:`AE`,desc:`ATFM due to restriction at destination airport, airport and/or runway closed due to obstruction, industrial action, staff shortage, political unrest, noise abatement, night curfew, special flights`},{code:`84`,letter:`AW`,desc:`ATFM due to weather at destination`},{code:`85`,letter:`AS`,desc:`Mandatory security`},{code:`86`,letter:`AG`,desc:`Immigration, customs, health`},{code:`87`,letter:`AF`,desc:`Airport facilities, parking stands, ramp congestion, lighting, buildings, gate limitations, etc.`},{code:`88`,letter:`AD`,desc:`Restrictions at airport of destination, airport and/or runway closed due to obstruction, industrial action, staff shortage, political unrest, noise abatement, night curfew, special flights`},{code:`89`,letter:`AM`,desc:`Restrictions at airport of departure with or without ATFM restrictions, including Air Traffic Services, start-up and pushback, airport and/or runway closed due to obstruction or weather, industrial action, staff shortage, political unrest, noise abatement, night curfew, special flights`}]},{group:`Reactionary`,codes:[{code:`91`,letter:`RL`,desc:`Load connection, awaiting load from another flight`},{code:`92`,letter:`RT`,desc:`Through check-in error, passenger and baggage`},{code:`93`,letter:`RA`,desc:`Aircraft rotation, late arrival of aircraft from another flight or previous sector`},{code:`94`,letter:`RS`,desc:`Cabin crew rotation, awaiting cabin crew from another flight`},{code:`95`,letter:`RC`,desc:`Crew rotation, awaiting crew from another flight (flight deck or entire crew)`},{code:`96`,letter:`RO`,desc:`Operations control, re-routing, diversion, consolidation, aircraft change for reasons other than technical`}]},{group:`Miscellaneous`,codes:[{code:`97`,letter:`MI`,desc:`Industrial action with own airline`},{code:`98`,letter:`MO`,desc:`Industrial action outside own airline, excluding ATS`},{code:`99`,letter:`MX`,desc:`Other reason, not matching any code above`}]}],x=[{id:`alpine`,label:`Alpine lake`,titlebar:`#293e60`},{id:`forest`,label:`Forest`,titlebar:`#152d30`},{id:`coast`,label:`Coast`,titlebar:`#527c91`},{id:`aurora`,label:`Aurora`,titlebar:`#10182e`,group:`elements`},{id:`highlands`,label:`Misty Highlands`,titlebar:`#293c36`},{id:`glacier`,label:`Glacier Dawn`,titlebar:`#192d51`},{id:`tidal`,label:`Tidal Glass`,titlebar:`#092938`,group:`elements`},{id:`ember`,label:`Ember Flow`,titlebar:`#3a1b18`,group:`elements`}];function te(){window.chrome&&window.chrome.webview&&window.chrome.webview.postMessage(JSON.stringify({type:`titlebar`,color:`#121c27`}))}var ne=`realefb.wallpaper`,S=`realefb.wallpaperPhoto`;function re(){try{return localStorage.getItem(S)}catch{return null}}function ie(e){e===`sky`&&(e=`aurora`),e!==`photo`&&!x.some(t=>t.id===e)&&(e=`alpine`);let t=re();document.body.style.setProperty(`--wallpaper-photo`,t?`url("${t}")`:`none`),e===`photo`&&!t&&(e=`alpine`),document.body.dataset.wallpaper=e;try{localStorage.setItem(ne,e)}catch{}te()}function ae(e,t=1920,n=.85){return new Promise((r,i)=>{let a=URL.createObjectURL(e),o=new Image;o.onload=()=>{let e=Math.min(1,t/Math.max(o.naturalWidth,o.naturalHeight)),i=document.createElement(`canvas`);i.width=Math.round(o.naturalWidth*e),i.height=Math.round(o.naturalHeight*e),i.getContext(`2d`).drawImage(o,0,0,i.width,i.height),URL.revokeObjectURL(a),r(i.toDataURL(`image/jpeg`,n))},o.onerror=()=>{URL.revokeObjectURL(a),i(Error(`That file couldn't be read as an image.`))},o.src=a})}function oe(){let e=document.body.dataset.wallpaper||`alpine`,t=!!re(),n=(t,n)=>`
      <button type="button" class="wallpaper-option ${t===e?`selected`:``}" data-wallpaper="${t}" aria-label="${n}">
        <span class="wallpaper-thumb" data-wallpaper="${t}">${l(`circle-check`)}</span>
        <span class="wallpaper-label">${n}</span>
      </button>`,r=t?n(`photo`,`Your photo`):`
      <label class="wallpaper-option">
        <span class="wallpaper-thumb wallpaper-thumb-add">${l(`image`)}</span>
        <span class="wallpaper-label">Add photo</span>
        <input type="file" accept="image/*" class="wallpaper-photo-input" />
      </label>`;return`
    <div class="wallpaper-collection"><h3>Nature</h3><div class="wallpaper-grid">${x.filter(e=>e.group!==`elements`).map(e=>n(e.id,e.label)).join(``)}</div></div>
    <div class="wallpaper-collection"><h3>Elements</h3><div class="wallpaper-grid">${x.filter(e=>e.group===`elements`).map(e=>n(e.id,e.label)).join(``)}</div></div>
    <div class="wallpaper-collection"><h3>Your photo</h3><div class="wallpaper-grid">${r}</div></div>
    <div class="wallpaper-photo-actions ${t?``:`hidden`}">
      <label class="wallpaper-photo-btn">${l(`image`)} Change photo<input type="file" accept="image/*" class="wallpaper-photo-input" /></label>
      <button type="button" class="wallpaper-photo-btn" id="wallpaper-photo-remove">${l(`trash-can`)} Remove photo</button>
    </div>
    <p id="wallpaper-status" class="settings-hint">Saved on this device only - each tablet keeps its own wallpaper.</p>`}function se(){let e=document.getElementById(`settings-section-background`);if(!e)return;let t=document.getElementById(`wallpaper-status`),n=()=>{e.querySelector(`.settings-section-body`).innerHTML=oe(),se()};for(let t of e.querySelectorAll(`button.wallpaper-option`))t.addEventListener(`click`,()=>{ie(t.dataset.wallpaper);for(let n of e.querySelectorAll(`.wallpaper-option`))n.classList.toggle(`selected`,n===t)});for(let r of e.querySelectorAll(`.wallpaper-photo-input`))r.addEventListener(`change`,async()=>{let e=r.files&&r.files[0];if(e){t.classList.remove(`settings-error`),t.textContent=`Loading photo...`;try{localStorage.setItem(S,await ae(e)),ie(`photo`),n()}catch(e){t.textContent=e&&e.name===`QuotaExceededError`?`That photo is too large to store on this device - try a smaller one.`:e&&e.message||`Could not use that photo.`,t.classList.add(`settings-error`)}}});document.getElementById(`wallpaper-photo-remove`)?.addEventListener(`click`,()=>{try{localStorage.removeItem(S)}catch{}ie(document.body.dataset.wallpaper===`photo`?`sky`:document.body.dataset.wallpaper),n()})}var ce=!!(window.chrome&&window.chrome.webview),C=document.getElementById(`home-screen`),w=document.getElementById(`detail-screen`),T=document.getElementById(`detail-title`),E=document.getElementById(`detail-body`),D=document.getElementById(`home-button`);function le(e,t){g=e,window.dispatchEvent(new CustomEvent(`realefb:apps`,{detail:{enabledApps:e,webApps:t}}))}function ue(e){window.dispatchEvent(new CustomEvent(`realefb:navigate`,{detail:{id:e}}))}var de=null;async function fe(){let e;try{let t=await fetch(`/api/settings`,{cache:`no-store`});if(!t.ok)return;e=await t.json()}catch{return}de=JSON.stringify([e.enabledApps||{},e.webApps||[]]),le(e.enabledApps||{},e.webApps||[])}async function pe(){if(C.classList.contains(`hidden`))return;let e;try{let t=await fetch(`/api/settings`,{cache:`no-store`});if(!t.ok)return;e=await t.json()}catch{return}let t=JSON.stringify([e.enabledApps||{},e.webApps||[]]);t!==de&&(de=t,le(e.enabledApps||{},e.webApps||[]))}var me=document.getElementById(`wizard-screen`);function he(){ge()}function ge(){c(`home`,_e)}function _e(){w.classList.add(`hidden`),D.classList.add(`hidden`),ue(`home`),me.classList.add(`hidden`),C.classList.remove(`hidden`),fe()}function ve(e,t,n){return`
    <label class="settings-toggle-row">
      <span class="settings-toggle-label">${escapeAttr(n)}</span>
      <span class="settings-toggle-switch">
        <input type="checkbox" id="${e}" ${t?`checked`:``} />
        <span class="settings-toggle-slider"></span>
      </span>
    </label>`}function ye(e,t,n){return`
    <div class="settings-password-field">
      <input type="password" id="${e}" placeholder="${escapeAttr(n||``)}" value="${escapeAttr(t||``)}" autocomplete="off" />
      <button type="button" class="settings-password-eye" data-target="${e}" aria-label="Show password" tabindex="-1">${l(`eye`)}</button>
    </div>`}function be(e){for(let t of e.querySelectorAll(`.settings-password-eye`))t.addEventListener(`click`,()=>{let e=document.getElementById(t.dataset.target),n=e.type===`password`;e.type=n?`text`:`password`,t.classList.toggle(`settings-password-eye-active`,n),t.setAttribute(`aria-label`,n?`Hide password`:`Show password`),t.innerHTML=l(n?`eye-slash`:`eye`)})}var xe=[`simbrief`,`webserver`,`sayintentions`,`done`],O=0,k={},Se=`realefb`;async function Ce(){ue(`wizard`),k={simBriefId:``,port:5150,sayIntentionsEnabled:!1,sayIntentionsApiCode:``};try{let e=await fetch(`/api/settings`,{cache:`no-store`});if(e.ok){let t=await e.json();k.simBriefId=t.simBriefId||``,k.port=t.port||5150,k.sayIntentionsEnabled=!!t.sayIntentionsEnabled,k.sayIntentionsApiCode=t.sayIntentionsApiCode||``}}catch{}c(`wizard`,()=>{C.classList.add(`hidden`),w.classList.add(`hidden`),D.classList.add(`hidden`),me.classList.remove(`hidden`),document.getElementById(`wizard-next`).onclick=Te,document.getElementById(`wizard-back`).onclick=Ee,O=0,we()})}function we(){let e=xe[O];document.getElementById(`wizard-progress`).textContent=`Step ${O+1} of ${xe.length}`;let t=document.getElementById(`wizard-status`);t.textContent=``,t.classList.remove(`init-status-error`);let n=document.getElementById(`wizard-back`),r=document.getElementById(`wizard-next`);n.style.visibility=O===0?`hidden`:`visible`,r.textContent=e===`done`?`Finish`:`Next`;let i=document.getElementById(`wizard-body`);e===`simbrief`?i.innerHTML=`
      <h1 class="init-title">Welcome to RealEFB OS</h1>
      <p class="init-subtitle">Let's get a few things set up. First, your SimBrief username or pilot ID - used to load your flight plans.</p>
      <input id="wizard-simbrief-id" type="text" placeholder="e.g. jdoe123" value="${escapeAttr(k.simBriefId)}" />
    `:e===`webserver`?i.innerHTML=`
      <h1 class="init-title">Local Web Server</h1>
      <p class="init-subtitle">RealEFB runs its own small web server so tablets on your WiFi can use it too - this always stays on, but you can pick which port it uses.</p>
      <input id="wizard-port" type="number" min="1" max="65535" value="${k.port}" />
    `:e===`sayintentions`?(i.innerHTML=`
      <h1 class="init-title">SayIntentions.AI</h1>
      <p class="init-subtitle">Optional. Turn this on if you use SayIntentions.AI and want to enter your API code.</p>
      ${ve(`wizard-sayintentions-enabled`,k.sayIntentionsEnabled,`Enable SayIntentions.AI`)}
      <div class="wizard-field-spaced ${k.sayIntentionsEnabled?``:`wizard-field-hidden`}" id="wizard-sayintentions-field">
        ${ye(`wizard-sayintentions-code`,k.sayIntentionsApiCode,`Paste your API code`)}
      </div>
    `,document.getElementById(`wizard-sayintentions-enabled`).addEventListener(`change`,e=>{document.getElementById(`wizard-sayintentions-field`).classList.toggle(`wizard-field-hidden`,!e.target.checked)})):e===`done`&&(i.innerHTML=`
      <h1 class="init-title">All set</h1>
      <p class="init-subtitle">RealEFB OS is ready to go. Press Finish to continue.</p>
    `),be(i)}async function Te(){let e=xe[O],t=document.getElementById(`wizard-status`),n=document.getElementById(`wizard-next`);t.classList.remove(`init-status-error`);let r=e=>{t.textContent=e,t.classList.add(`init-status-error`)},i=async(e,t)=>{if(!(await fetch(e,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)})).ok)throw Error(`save-failed`)};n.disabled=!0;try{if(e===`simbrief`){let e=document.getElementById(`wizard-simbrief-id`).value.trim();if(!e)return r(`Enter your SimBrief username or pilot ID.`);k.simBriefId=e,await i(`/api/settings/simbrief`,{simBriefId:e})}else if(e===`webserver`){let e=parseInt(document.getElementById(`wizard-port`).value,10);if(!Number.isInteger(e)||e<1||e>65535)return r(`Enter a port between 1 and 65535.`);k.port=e,await i(`/api/settings`,{port:e})}else if(e===`sayintentions`){let e=document.getElementById(`wizard-sayintentions-enabled`).checked,t=document.getElementById(`wizard-sayintentions-code`).value.trim();k.sayIntentionsEnabled=e,k.sayIntentionsApiCode=t,await i(`/api/settings/sayintentions`,{enabled:e,sayIntentionsApiCode:t})}else if(e===`done`){await i(`/api/settings/wizard-complete`,{}),me.classList.add(`hidden`),he();return}}catch{return r(`Could not save - check your connection and try again.`)}finally{n.disabled=!1}O++,we()}function Ee(){O!==0&&(O--,we())}function De(e){ce?window.chrome.webview.postMessage(JSON.stringify({type:`open-site`,url:e.url,title:e.label})):window.open(e.url,`_blank`,`noopener`)}function Oe(e){e.kind===`browser`?De(e):($(),c(e.id,()=>ke(e)))}function ke(e){ue(e.id),me.classList.add(`hidden`),T.textContent=e.label,T.style.display=``,C.classList.add(`hidden`),w.classList.remove(`hidden`),D.classList.remove(`hidden`),e.id===`settings`?Mn():e.id===`logbook`?vt():e.id===`documents`?qe():e.id===`dispatch`?tt():e.id===`performance`||e.id===`pushback`||e.id===`ground`?E.innerHTML=``:e.id===`taxi`?Le(!0):e.id===`tracker`?Le():E.innerHTML=`<p class="coming-soon">This section is a placeholder - coming soon.</p>`}var A=!1,Ae=0,je=!1,j=null,M=null,N=null,P=null,F=null,I=!0,R=!1,z=null,Me=`&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors`,B=`https://server.arcgisonline.com/ArcGIS/rest/services`,Ne=[{id:`map`,label:`Map`,icon:`map`,tiles:[{url:`https://tile.openstreetmap.org/{z}/{x}/{y}.png`,options:{maxZoom:19,attribution:Me}}]},{id:`satellite`,label:`Satellite`,icon:`satellite`,tiles:[{url:`${B}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,options:{maxZoom:19,detectRetina:!0,attribution:`Imagery &copy; Esri, Maxar, Earthstar Geographics`}},{url:`${B}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`,options:{maxZoom:19,zIndex:2}}]},{id:`terrain`,label:`Terrain`,icon:`mountain-sun`,tiles:[{url:`${B}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`,options:{maxZoom:19,attribution:`Tiles &copy; Esri, USGS, NOAA`}}]},{id:`dark`,label:`Dark`,icon:`moon`,tiles:[{url:`${B}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,options:{maxZoom:19,maxNativeZoom:16,attribution:`Tiles &copy; Esri, HERE, Garmin`}},{url:`${B}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,options:{maxZoom:19,maxNativeZoom:16,zIndex:2}}]}],Pe=`#e03fd8`;function Fe(){try{return localStorage.getItem(`realefb.trackerLayer`)||`map`}catch{return`map`}}function Ie(e){if(!j)return;let t=Ne.find(t=>t.id===e)||Ne[0];z&&j.removeLayer(z),z=L.layerGroup(t.tiles.map(e=>L.tileLayer(e.url,e.options))).addTo(j);for(let e of document.querySelectorAll(`.tracker-layer-opt`))e.classList.toggle(`selected`,e.dataset.layer===t.id);try{localStorage.setItem(`realefb.trackerLayer`,t.id)}catch{}}async function Le(e=!1){let t=++Ae;A=e,j&&j.remove(),T.style.display=`none`,M&&=(clearInterval(M),null),j=null,P=null,F=null,I=!0,R=!1,z=null,E.innerHTML=`<div class="tracker-sheet"><p class="coming-soon">Loading flight plan...</p></div>`;let n=null;try{let e=await fetch(`/api/simbrief/flightplan`,{cache:`no-store`});e.ok&&({flightPlan:n}=await e.json())}catch{}if(t!==Ae||w.classList.contains(`hidden`))return;if(e&&!n&&(n={callsign:`Taxi Map`,originIcao:`Departure`,destIcao:`Arrival`,navlog:[]}),!e&&(!n||n.originLat==null||n.destLat==null)){E.innerHTML=`
      <div class="tracker-sheet">
        <p class="coming-soon">No SimBrief flight plan with route coordinates is loaded yet.</p>
        <p class="coming-soon">Import a flight plan from the Dispatch or EFL tab, then reopen Flight Tracker.</p>
      </div>
    `;return}N=n;let r=e=>e&&e!==`N/A`?e:``,i=e=>{if(!e)return null;let t=new Date(e);return`${String(t.getUTCHours()).padStart(2,`0`)}${String(t.getUTCMinutes()).padStart(2,`0`)}Z`},a=[[`OUT`,i(n.scheduledOutUtc)],[`IN`,i(n.scheduledInUtc)],[`CRZ`,n.cruiseAltitudeFt?`FL${String(Math.round(n.cruiseAltitudeFt/100)).padStart(3,`0`)}`:null],[`DIST`,n.routeDistanceNm?`${Math.round(n.routeDistanceNm).toLocaleString()} NM`:null]].filter(([,e])=>e);if(E.innerHTML=`
    <div class="tracker-sheet">
      <div id="tracker-map" class="tracker-map"></div>
      <div class="tracker-card">
        <div class="tracker-card-top">
          <span class="tracker-callsign">${escapeAttr(n.callsign)}</span>
          <span class="tracker-chip">${escapeAttr(n.aircraftIcao)}</span>
          <span class="tracker-status-pill" id="tracker-status-pill">
            <span class="tracker-status-dot"></span><span id="tracker-status-text">No SimConnect</span>
          </span>
        </div>
        <div class="tracker-leg">
          <div class="tracker-apt">
            <span class="tracker-apt-code">${escapeAttr(n.originIcao)}</span>
            <span class="tracker-apt-name">${escapeAttr(r(n.originName))}</span>
          </div>
          <div class="tracker-progress" aria-hidden="true">
            <div class="tracker-progress-track"><div class="tracker-progress-fill" id="tk-progress-fill"></div></div>
            <span class="tracker-progress-plane" id="tk-progress-plane">${l(`plane`)}</span>
          </div>
          <div class="tracker-apt tracker-apt-dest">
            <span class="tracker-apt-code">${escapeAttr(n.destIcao)}</span>
            <span class="tracker-apt-name">${escapeAttr(r(n.destName))}</span>
          </div>
        </div>
        ${a.length?`<div class="tracker-card-meta">${a.map(([e,t])=>`<span class="tracker-meta-item"><span>${e}</span>${escapeAttr(t)}</span>`).join(``)}</div>`:``}
      </div>
      <div class="tracker-hud is-waiting" id="tracker-hud">
        <div class="tracker-hud-item"><span class="tracker-hud-label">GS</span><span class="tracker-hud-value" id="tk-gs">---</span><span class="tracker-hud-unit">KT</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-label">ALT</span><span class="tracker-hud-value" id="tk-alt">-----</span><span class="tracker-hud-unit">FT</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-label">HDG</span><span class="tracker-hud-value" id="tk-hdg">---&deg;</span><span class="tracker-hud-unit">TRUE</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-label">V/S</span><span class="tracker-hud-value" id="tk-vs">----</span><span class="tracker-hud-unit">FPM</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-label">TO DEST</span><span class="tracker-hud-value" id="tk-dist">---</span><span class="tracker-hud-unit">NM</span></div>
        <div class="tracker-hud-item"><span class="tracker-hud-label">ETE</span><span class="tracker-hud-value" id="tk-ete">--:--</span><span class="tracker-hud-unit">H:MM</span></div>
        <div class="tracker-hud-waiting">${l(`plane`)}<span>Waiting for the simulator - start MSFS to see the live position</span></div>
      </div>
      <div class="tracker-controls">
        <button type="button" id="tracker-layers-btn" class="tracker-ctrl-btn" title="Map type" aria-label="Map type" aria-expanded="false">${l(`layer-group`)}</button>
        <div class="tracker-ctrl-group">
          <button type="button" id="tracker-zoom-in" class="tracker-ctrl-btn" title="Zoom in" aria-label="Zoom in">${l(`plus`)}</button>
          <button type="button" id="tracker-zoom-out" class="tracker-ctrl-btn" title="Zoom out" aria-label="Zoom out">${l(`minus`)}</button>
        </div>
        <button type="button" id="tracker-center-btn" class="tracker-ctrl-btn tracker-center-btn active" title="Auto follow aircraft" aria-label="Auto follow aircraft" aria-pressed="true">${l(`location-crosshairs`)}<span class="tracker-follow-label">Auto follow</span></button>
        <button type="button" id="tracker-route-btn" class="tracker-ctrl-btn" aria-label="Show entire route" title="Show entire route">${l(`route`)}</button>
      </div>
      <div class="tracker-layer-menu hidden" id="tracker-layer-menu">
        ${Ne.map(e=>`
          <button type="button" class="tracker-layer-opt" data-layer="${e.id}">
            <span class="tracker-layer-swatch" data-layer="${e.id}">${l(e.icon)}</span>
            <span>${e.label}</span>
          </button>`).join(``)}
      </div>
    </div>
  `,document.getElementById(`tracker-center-btn`).addEventListener(`click`,()=>{I=!I,V(),I&&R&&j&&P&&j.panTo(P.getLatLng(),{animate:!0})}),document.getElementById(`tracker-route-btn`).onclick=()=>{I=!1,V();let e=Re(N);e.length&&j.fitBounds(L.latLngBounds(e),{padding:[70,70]})},e){document.querySelector(`.tracker-sheet`)?.classList.add(`taxi-sheet`);let e=document.querySelector(`.tracker-card`);e.innerHTML=`<div class="taxi-title"><span>${l(`map-location-dot`)} Taxi Map</span><span class="taxi-mode-pill">North Up</span><button id="taxi-airport-toggle" aria-label="Choose airport" aria-expanded="false">${l(`chevron-down`)}</button></div><div class="taxi-airports" role="group" aria-label="Airport selection"><button id="taxi-departure" title="Center on departure"><span class="taxi-apt-tag">DEP</span><strong>${escapeAttr(n.originIcao)}</strong></button><button id="taxi-arrival" title="Center on arrival"><span class="taxi-apt-tag">ARR</span><strong>${escapeAttr(n.destIcao)}</strong></button></div><p class="taxi-map-note">Online surface map · simulator position</p>`;for(let[e,t,r]of[[`taxi-departure`,n.originLat,n.originLon],[`taxi-arrival`,n.destLat,n.destLon]]){let n=document.getElementById(e);n.disabled=t==null||r==null,n.onclick=()=>{I=!1,V(),j.setView([t,r],17)}}document.getElementById(`tracker-route-btn`).style.display=`none`,document.querySelector(`.tracker-hud-waiting span`).textContent=`Waiting for a valid simulator position`}let o=document.getElementById(`tracker-layer-menu`),s=document.getElementById(`tracker-layers-btn`),c=e=>{o.classList.toggle(`hidden`,!e),s.classList.toggle(`active`,e),s.setAttribute(`aria-expanded`,String(e))};s.addEventListener(`click`,()=>c(o.classList.contains(`hidden`)));for(let e of o.querySelectorAll(`.tracker-layer-opt`))e.addEventListener(`click`,()=>{Ie(e.dataset.layer),c(!1)});document.getElementById(`tracker-zoom-in`).addEventListener(`click`,()=>j?.zoomIn()),document.getElementById(`tracker-zoom-out`).addEventListener(`click`,()=>j?.zoomOut()),Ue(n),j?.on(`click`,()=>c(!1)),M=setInterval(()=>{document.hidden||Ke()},e?1e3:2e3),Ke()}function Re(e){let t=[];e.originLat!=null&&e.originLon!=null&&t.push([e.originLat,e.originLon]);for(let n of e.navlog||[])n.lat!=null&&n.lon!=null&&t.push([n.lat,n.lon]);return e.destLat!=null&&e.destLon!=null&&t.push([e.destLat,e.destLon]),t}function ze(){return L.divIcon({className:`tracker-apt-icon`,html:`<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="6"/></svg>`,iconSize:[14,14],iconAnchor:[7,7]})}function Be(){return L.divIcon({className:`tracker-aircraft-icon`,html:`<div class="tracker-aircraft-rotor">${l(`plane-up`)}</div>`,iconSize:[30,30],iconAnchor:[15,15]})}function Ve(e){let t=`${(Math.max(0,Math.min(1,e))*100).toFixed(1)}%`,n=document.getElementById(`tk-progress-fill`),r=document.getElementById(`tk-progress-plane`);n&&(n.style.width=t),r&&(r.style.left=t)}function He(e){let t=P&&P.getElement(),n=t&&t.querySelector(`.tracker-aircraft-rotor`);n&&(n.style.transform=`rotate(${e}deg)`)}function V(){let e=document.getElementById(`tracker-center-btn`);e?.classList.toggle(`active`,I),e?.setAttribute(`aria-pressed`,String(I));let t=e?.querySelector(`span`);t&&(t.textContent=I?`Auto follow`:`Follow paused`)}function Ue(e){let t=document.getElementById(`tracker-map`);if(!t||typeof L>`u`)return;j=L.map(t,{zoomControl:!1,attributionControl:!0,worldCopyJump:!0}),Ie(A?`map`:Fe());let n=Re(e);n.length>=2&&L.polyline(n,{color:Pe,weight:3,opacity:.9,lineCap:`round`,interactive:!1}).addTo(j),e.originLat!=null&&e.originLon!=null&&L.marker([e.originLat,e.originLon],{icon:ze(),interactive:!1}).bindTooltip(e.originIcao,{permanent:!0,direction:`top`,className:`tracker-apt-label`,offset:[0,-8]}).addTo(j),e.destLat!=null&&e.destLon!=null&&L.marker([e.destLat,e.destLon],{icon:ze(),interactive:!1}).bindTooltip(e.destIcao,{permanent:!0,direction:`top`,className:`tracker-apt-label`,offset:[0,-8]}).addTo(j);for(let t of e.navlog||[])t.lat!=null&&t.lon!=null&&L.circleMarker([t.lat,t.lon],{radius:3.5,color:Pe,weight:2,fillColor:`#ffffff`,fillOpacity:1,interactive:!1}).bindTooltip(t.ident,{permanent:!1,direction:`top`,className:`tracker-wpt-label`,offset:[0,-4]}).addTo(j);F=L.polyline([],{color:`#ff9f1a`,weight:3,opacity:.95,interactive:!1}).addTo(j),We(),P=L.marker(n[0]||[0,0],{icon:Be(),interactive:!1,zIndexOffset:1e3});let r=L.latLngBounds(n.length?n:[[0,0]]);A&&n.length?j.setView(n[0],17):j.fitBounds(r,{padding:[40,40],maxZoom:5}),j.on(`dragstart`,()=>{I=!1,V()})}async function We(){if(F)try{let e=await fetch(`/api/flight/trail`,{cache:`no-store`});if(!e.ok)return;let{points:t}=await e.json();F.setLatLngs((t||[]).map(e=>[e.lat,e.lon]))}catch{}}function Ge(e,t,n,r){let i=e=>e*Math.PI/180,a=i(n-e),o=i(r-t),s=Math.sin(a/2)**2+Math.cos(i(e))*Math.cos(i(n))*Math.sin(o/2)**2;return 6880.13*Math.asin(Math.min(1,Math.sqrt(s)))}async function Ke(){if(!document.getElementById(`tracker-map`)||!j){M&&=(clearInterval(M),null);return}if(je||w.classList.contains(`hidden`))return;let e=j;je=!0;let t=!1,n=null;try{let e=await fetch(`/api/flight/state`,{cache:`no-store`});e.ok&&({connected:t,state:n}=await e.json())}catch{}if(je=!1,j!==e||w.classList.contains(`hidden`))return;let r=!!(t&&n&&Number.isFinite(n.latitude)&&Number.isFinite(n.longitude)&&Math.abs(n.latitude)<=90&&Math.abs(n.longitude)<=180&&(n.latitude!==0||n.longitude!==0)),i=document.getElementById(`tracker-status-pill`),a=document.getElementById(`tracker-status-text`);if(i&&a&&(i.classList.toggle(`tracker-status-live`,r),a.textContent=r?`Live`:`No SimConnect`),document.getElementById(`tracker-hud`)?.classList.toggle(`is-waiting`,!r),!r){P&&j?.hasLayer(P)&&j.removeLayer(P),R=!1;return}let{latitude:o,longitude:s,headingDegreesTrue:c,groundSpeedKts:l,altitudeFt:u,verticalSpeedFpm:d}=n,f=document.getElementById(`tk-gs`),p=document.getElementById(`tk-alt`),m=document.getElementById(`tk-hdg`),h=document.getElementById(`tk-vs`);f&&(f.textContent=Math.round(l)),p&&(p.textContent=Math.round(u).toLocaleString()),m&&(m.textContent=`${String(Math.round(c)%360).padStart(3,`0`)}°`),h&&(h.textContent=(d>=0?`+`:``)+Math.round(d));let g=document.getElementById(`tk-dist`),_=document.getElementById(`tk-ete`);if(N&&N.destLat!=null&&N.destLon!=null){let e=Ge(o,s,N.destLat,N.destLon);if(g&&(g.textContent=Math.round(e).toLocaleString()),N.originLat!=null&&N.originLon!=null){let t=Ge(N.originLat,N.originLon,N.destLat,N.destLon);t>0&&Ve(1-e/t)}if(_){if(l>20){let t=e/l*60,n=Math.floor(t/60),r=Math.round(t%60);_.textContent=`${n}:${String(r).padStart(2,`0`)}`}else _.textContent=`--:--`}}let v=[o,s];R?P.setLatLng(v):(R=!0,P.setLatLng(v),P.addTo(j),I&&j.setView(v,A?18:9)),He(c),We(),I&&j.panTo(v,{animate:!0,duration:.5})}async function qe(){T.textContent=`Documents`,T.style.display=``,E.innerHTML=`<p class="coming-soon">Loading...</p>`;let e=await fetch(`/api/simbrief/flightplan`).catch(()=>null),t=e?.ok?(await e.json()).flightPlan:null,n=[],r=``;try{let e=await fetch(`/api/documents`,{cache:`no-store`});e.ok&&({documents:n,folderPath:r}=await e.json())}catch{}T.style.display=`none`;let i=t?.pdfUrl?`
      <button class="doc-card doc-card-flight" id="doc-flight-pdf">
        <span class="doc-thumb doc-thumb-ofp">${l(`file-pdf`)}<b>OFP</b></span>
        <span class="doc-card-text"><strong>SimBrief flight plan</strong><small>${escapeAttr(t.callsign||``)} \u00b7 ${escapeAttr(t.originIcao||``)} \u2192 ${escapeAttr(t.destIcao||``)}</small></span>
      </button>`:`<p class="doc-shelf-empty">Your SimBrief flight plan appears here once a flight is imported.</p>`,a=n.length?`<div class="doc-grid">${n.map((e,t)=>`
        <button class="doc-card doc-list-item" data-index="${t}">
          <span class="doc-thumb">${l(`file-lines`)}<b>PDF</b></span>
          <span class="doc-card-text"><strong class="doc-list-name">${escapeAttr(e.fileName.replace(/\.pdf$/i,``))}</strong><small class="doc-list-pages">${e.pageCount} ${e.pageCount===1?`page`:`pages`}</small></span>
        </button>`).join(``)}</div>`:`<div class="doc-empty">${l(`folder-open`)}<p class="coming-soon">No PDFs found yet.</p><p class="coming-soon">Drop PDF files into the "RealEFB Documents" folder${r?` (<code class="doc-folder-path">${escapeAttr(r)}</code>)`:``} in your Documents folder, then reopen this tab.</p></div>`;E.innerHTML=`
    <div class="doc-library">
      <header class="doc-library-header"><h1>Documents</h1><span>${n.length+ +!!t?.pdfUrl} items</span></header>
      <section class="doc-shelf"><h2>Flight</h2>${i}</section>
      <section class="doc-shelf"><h2>Library</h2>${a}</section>
    </div>`,document.getElementById(`doc-flight-pdf`)?.addEventListener(`click`,()=>Je(`SimBrief flight plan \u00b7 ${t.callsign||``}`,`/api/simbrief/pdf`));for(let e of E.querySelectorAll(`.doc-list-item`)){let t=n[Number(e.dataset.index)];e.addEventListener(`click`,()=>Je(t.fileName,`/api/documents/file?file=${encodeURIComponent(t.fileName)}`))}}function Je(e,t){T.style.display=`none`,E.innerHTML=`
    <div class="doc-viewer">
      <div class="doc-viewer-bar">
        <button class="doc-back-btn" id="doc-back-btn">${l(`chevron-left`)} Documents</button>
        <strong>${escapeAttr(e)}</strong>
        <span></span>
      </div>
      <iframe class="doc-viewer-frame" src="${escapeAttr(t)}#toolbar=1&navpanes=0&view=FitH" title="${escapeAttr(e)}"></iframe>
    </div>`,document.getElementById(`doc-back-btn`).addEventListener(`click`,qe)}var H=`sayintentions`,Ye=``,U=null,Xe=[`JAN`,`FEB`,`MAR`,`APR`,`MAY`,`JUN`,`JUL`,`AUG`,`SEP`,`OCT`,`NOV`,`DEC`];function W(e){return`${String(e.getDate()).padStart(2,`0`)}${Xe[e.getMonth()]} ${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`}function G(){return W(new Date)}function Ze(){return document.getElementById(`dispatch-thread`)}function K(e,t,n,r){let i=Ze();if(!i)return null;let{pending:a,error:o}=r||{},s=document.createElement(`div`);return s.className=`dispatch-msg dispatch-msg-${e}${a?` dispatch-msg-pending`:``}${o?` dispatch-msg-error`:``}`,s.innerHTML=`
    <div class="dispatch-msg-meta">${t}</div>
    ${n?`<div class="dispatch-msg-body">${n}</div>`:``}
  `,i.appendChild(s),e===`in`&&!a&&!o&&n&&Qe(s),i.scrollTop=i.scrollHeight,s}function q(e,t,n,r){if(!e)return;if(e.classList.remove(`dispatch-msg-pending`),e.classList.toggle(`dispatch-msg-error`,!!r),e.querySelector(`.dispatch-msg-meta`).innerHTML=t,n){let t=e.querySelector(`.dispatch-msg-body`);t||(t=document.createElement(`div`),t.className=`dispatch-msg-body`,e.appendChild(t)),t.innerHTML=n}e.classList.contains(`dispatch-msg-in`)&&!r&&n&&Qe(e);let i=Ze();i&&(i.scrollTop=i.scrollHeight)}function Qe(e){if(e.querySelector(`.dispatch-print-btn`))return;let t=document.createElement(`button`);t.type=`button`,t.className=`dispatch-print-btn`,t.textContent=`Print via SimPrinter`,t.addEventListener(`click`,()=>et(e,t)),e.appendChild(t)}function $e(e){return[e.querySelector(`.dispatch-msg-meta`)?.textContent.trim()||``,e.querySelector(`.dispatch-msg-body`)?.innerText.trim()||``].filter(Boolean).join(`
`)}async function et(e,t){let n=t.textContent;t.disabled=!0,t.textContent=`Printing...`;try{let r=await fetch(`/api/dispatch/print`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({text:$e(e)})}),i=await r.json().catch(()=>({}));if(!r.ok||!i.ok)throw Error(i.error||i.detail||`Could not print.`);t.textContent=`Printed`,setTimeout(()=>{t.textContent=n,t.disabled=!1},1500)}catch{t.textContent=n,t.disabled=!1}}async function tt(){E.innerHTML=`<p class="coming-soon">Loading...</p>`;let e=``;try{let t=await fetch(`/api/settings`,{cache:`no-store`});if(t.ok){let n=await t.json();H=n.dispatchDataSource===`vatsim`?`vatsim`:`sayintentions`,e=n.sayIntentionsApiCode||``}}catch{}if(H===`sayintentions`&&!e){E.innerHTML=`
      <p class="coming-soon">No SayIntentions.AI API code is set.</p>
      <p class="coming-soon">Enter one in Settings under "SayIntentions.AI", or switch Dispatch's data source to VATSIM in Settings under "Dispatch" - that one needs no account. You can also turn Dispatch off there entirely so it no longer appears on the home screen.</p>
      <div class="settings-row settings-row-spaced">
        <button id="dispatch-open-settings" class="settings-save-btn">Open Settings</button>
      </div>
    `,document.getElementById(`dispatch-open-settings`).addEventListener(`click`,()=>{T.textContent=`Settings`,T.style.display=``,Mn()});return}U=null;try{let e=await fetch(`/api/simbrief/flightplan`,{cache:`no-store`});if(e.ok){let{flightPlan:t}=await e.json();t&&(U=t)}}catch{}Ye=U&&U.destIcao&&U.destIcao!==`N/A`?U.destIcao:``;let t=H!==`sayintentions`;E.innerHTML=`
    <div class="dispatch-app">
      <p class="settings-hint">Company Dispatch - data source: ${H===`vatsim`?`VATSIM`:`SayIntentions.AI`}.</p>
      <div id="dispatch-loadsheets"></div>
      <div class="dispatch-log-card">
        <div class="dispatch-log" id="dispatch-thread"></div>
      </div>
      <div class="dispatch-actions">
        <button class="dispatch-action-btn" data-action="metar">MET RQST</button>
        <button class="dispatch-action-btn" data-action="atis">ATIS RQST</button>
        <button class="dispatch-action-btn" data-action="gate-expect" ${t?`disabled`:``}>GATE</button>
        <button class="dispatch-action-btn" data-action="gate-request" ${t?`disabled`:``}>GATE RQST</button>
      </div>
    </div>
  `,K(`in`,G(),`Dispatch is online. Use the buttons below to request weather or a gate.`);for(let e of E.querySelectorAll(`.dispatch-action-btn`))e.addEventListener(`click`,()=>mt(e.dataset.action));nt()}async function nt(){let e=document.getElementById(`dispatch-loadsheets`);if(!e)return;let t=null;try{let e=await fetch(`/api/dispatch/loadsheet`,{cache:`no-store`});e.ok&&(t=await e.json())}catch{return}t&&t.hasFlight&&(t.final?(e.innerHTML=rt(`FINAL`,`EDNO 2`,t.final),it(t.final)):e.innerHTML=t.preliminary?rt(`PRELIM`,`EDNO 1`,t.preliminary):``,dt())}function rt(e,t,n){let r=U||{},i=(r.fuelUnits||`kgs`).toUpperCase().replace(`KGS`,`KG`).replace(`LBS`,`LB`),a=e=>e==null?`-`:Math.round(e).toLocaleString(),o=(e,t,n)=>`
      <div class="ls-row${t!=null&&n!=null&&t>n?` ls-row-over`:``}">
        <span class="ls-row-label">${e}</span>
        <span class="ls-row-value">${a(t)} ${i}</span>
        <span class="ls-row-max">MAX ${a(n)}</span>
      </div>`,s=e===`FINAL`,c=r.originIcao?` &middot; ${escapeAttr(r.originIcao)}&ndash;${escapeAttr(r.destIcao||``)}`:``,u=n.status===`accepted`?`<div class="ls-status ls-status-accepted">${l(`circle-check`)} ACCEPTED ${W(new Date(n.decidedUtc))}</div>`:n.status===`denied`?`<div class="ls-status ls-status-denied">${l(`circle-xmark`)} DENIED ${W(new Date(n.decidedUtc))}</div>`:``,d=s?n.status===`pending`?`<div class="ls-actions">
           <button class="ls-btn ls-btn-accept" id="ls-accept-btn">ACCEPT</button>
           <button class="ls-btn ls-btn-deny" id="ls-deny-btn">DENY</button>
         </div>`:n.status===`accepted`?`<div class="ls-actions">
             <button class="ls-btn ls-btn-efl" id="ls-send-efl-btn" ${n.sentToEfl?`disabled`:``}>${n.sentToEfl?`SENT TO EFL`:`SEND TO EFL`}</button>
           </div>`:``:``;return`
    <div class="ls-card ${s?`ls-card-final`:`ls-card-prelim`}" id="${s?`ls-final-card`:`ls-prelim-card`}">
      <div class="ls-card-head">
        <span class="ls-card-title">${e} LOADSHEET</span>
        <span class="ls-card-edno">${t}</span>
      </div>
      <div class="ls-card-sub">${escapeAttr(r.callsign||``)}${c} &middot; ${W(new Date(n.issuedUtc))}</div>
      <div class="ls-section">
        ${o(`ZFW`,r.estZfw,r.maxZfw)}
        ${o(`TOW`,r.estTow,r.maxTow)}
        ${o(`LAW`,r.estLdw,r.maxLdw)}
      </div>
      <div class="ls-section ls-pax-section">
        <div class="ls-pax-row">
          <span>ADULTS ${n.adults}</span>
          <span>CHILDREN ${n.children}</span>
          <span>INFANTS ${n.infants}</span>
        </div>
        <div class="ls-cargo-row">CARGO ${a(r.cargo)} ${i}</div>
        <div class="ls-pax-total">TOTAL PAX ${n.totalPax}</div>
      </div>
      ${u}
      ${d}
    </div>`}function it(e){e.status===`pending`?(document.getElementById(`ls-accept-btn`)?.addEventListener(`click`,()=>at(`accept`)),document.getElementById(`ls-deny-btn`)?.addEventListener(`click`,()=>at(`deny`))):e.status===`accepted`&&!e.sentToEfl&&document.getElementById(`ls-send-efl-btn`)?.addEventListener(`click`,()=>ot(e))}async function at(e){let t=document.getElementById(`ls-accept-btn`),n=document.getElementById(`ls-deny-btn`);t&&(t.disabled=!0),n&&(n.disabled=!0);try{let t=await fetch(`/api/dispatch/loadsheet/${e}`,{method:`POST`}),n=await t.json().catch(()=>({}));if(!t.ok||!n.ok)throw Error(n.error||n.detail||`Could not save - try again.`);let r=document.getElementById(`ls-final-card`);r&&(r.outerHTML=rt(`FINAL`,`EDNO 2`,n.final)),it(n.final)}catch{t&&(t.disabled=!1),n&&(n.disabled=!1)}}async function ot(e){let t=document.getElementById(`ls-send-efl-btn`);t&&(t.disabled=!0,t.textContent=`SENDING...`);let n={};try{let e=await fetch(`/api/simbrief/flightlog`,{cache:`no-store`});if(e.ok){let t=await e.json();t.flightLog&&(n=t.flightLog)}}catch{}n.adults=e.adults,n.children=e.children,n.infants=e.infants,n.actualPax=e.totalPax;try{await On(n),await fetch(`/api/dispatch/loadsheet/sent-to-efl`,{method:`POST`})}catch{}t&&(t.disabled=!0,t.textContent=`SENT TO EFL`)}var st=null,ct=null;async function lt(){if(!_(`dispatch`))return;let e;try{let t=await fetch(`/api/dispatch/loadsheet`,{cache:`no-store`});if(!t.ok)return;e=await t.json()}catch{return}e.hasFlight&&(e.final&&e.final.issuedUtc!==ct?(ct=e.final.issuedUtc,e.preliminary&&(st=e.preliminary.issuedUtc),e.finalNotificationSuppressed||ut(`Final Loadsheet Received`)):e.preliminary&&e.preliminary.issuedUtc!==st&&(st=e.preliminary.issuedUtc,ut(`Preliminary Loadsheet Received`)))}var J=null;function ut(e){let t=document.getElementById(`loadsheet-notification`);if(!t)return;let n=t.querySelector(`.loadsheet-notif-title`);n&&(n.textContent=e),window.dispatchEvent(new CustomEvent(`realefb:notification`,{detail:{title:e,message:`Loadsheet received. Open Dispatch to review.`,error:!1,onOpen:()=>t.click()}})),J&&clearTimeout(J),J=setTimeout(dt,1e4)}function dt(){document.getElementById(`loadsheet-notification`)?.classList.add(`hidden`),J&&=(clearTimeout(J),null)}function ft(){document.getElementById(`dispatch-entry`)?.remove()}function pt(e,t){ft();let n=document.querySelector(`.dispatch-app`),r=document.querySelector(`.dispatch-actions`);if(!n||!r)return;let i=document.createElement(`div`);i.id=`dispatch-entry`,i.className=`dispatch-entry`,i.innerHTML=e.map((e,t)=>`
      <label class="dispatch-entry-field">
        <span class="dispatch-entry-label">${escapeAttr(e.label)}</span>
        <input id="dispatch-entry-input-${t}" maxlength="${e.maxlength||10}" autocomplete="off"
               placeholder="${escapeAttr(e.placeholder||``)}" value="${escapeAttr(e.value||``)}" />
      </label>`).join(``)+`<button id="dispatch-entry-send" class="dispatch-entry-send">Send</button>`,n.insertBefore(i,r);let a=e.map((e,t)=>document.getElementById(`dispatch-entry-input-${t}`)),o=document.getElementById(`dispatch-entry-send`);for(let e of a)e.addEventListener(`input`,()=>{e.value=e.value.toUpperCase()}),e.addEventListener(`keydown`,e=>{e.key===`Enter`&&o.click()});a[0].focus(),o.addEventListener(`click`,()=>{let e=a.map(e=>e.value.trim());e.some(e=>!e)||(ft(),t(...e))})}function mt(e){e===`metar`||e===`atis`?pt([{label:`ICAO`,maxlength:4,placeholder:`e.g. EHAM`}],t=>ht(e,t)):e===`gate-expect`?gt():e===`gate-request`&&pt([{label:`ARPT`,maxlength:4,value:Ye},{label:`GATE`,maxlength:10,placeholder:`e.g. B14`}],(e,t)=>_t(e,t))}async function ht(e,t){let n=e===`atis`?`ATIS`:`MET`;K(`out`,`${G()} &middot; ${n} RQST ${escapeAttr(t)}`);let r=K(`in`,`Standby...`,null,{pending:!0});try{let i=await fetch(`/api/dispatch/weather`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({icao:t,kind:e})}),a=await i.json().catch(()=>({}));if(!i.ok||!a.ok)throw Error(a.error||a.detail||`Request failed - no reply.`);if(!a.text){q(r,G(),`No ${n} available for ${escapeAttr(t)}.`);return}q(r,G(),`<pre class="wx-raw">${escapeAttr(a.text)}</pre>`)}catch(e){q(r,G(),escapeAttr(e.message||`Request failed.`),!0)}}async function gt(){K(`out`,`${G()} &middot; GATE RQST`);let e=K(`in`,`Standby...`,null,{pending:!0});try{let t=await fetch(`/api/dispatch/gate`,{cache:`no-store`}),n=await t.json().catch(()=>({}));if(!t.ok||!n.ok)throw Error(n.error||n.detail||`Request failed - no reply.`);n.parking&&n.parking.name?q(e,G(),`Expect gate ${escapeAttr(n.parking.name)}.`):q(e,G(),`No gate assigned yet.`)}catch(t){q(e,G(),escapeAttr(t.message||`Request failed.`),!0)}}async function _t(e,t){K(`out`,`${G()} &middot; GATE RQST ${escapeAttr(t)} ${escapeAttr(e)}`);let n=K(`in`,`Standby...`,null,{pending:!0});try{let r=await fetch(`/api/dispatch/gate`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({airport:e,gate:t})}),i=await r.json().catch(()=>({}));if(!r.ok||!i.ok)throw Error(i.error||i.detail||`Request failed - no reply.`);i.assignedGate?q(n,G(),`Confirmed gate ${escapeAttr(i.assignedGate)}.`):q(n,G(),`Request sent - no gate confirmed.`)}catch(e){q(n,G(),escapeAttr(e.message||`Request failed.`),!0)}}async function vt(){T.style.display=`none`,E.innerHTML=``;let e=null;try{let t=await fetch(`/api/simbrief/flightplan`,{cache:`no-store`});t.ok&&({flightPlan:e}=await t.json())}catch{}e?Ct(e):yt()}function yt(){E.innerHTML=`
    <div class="efl-import-screen os-app-empty">
      <span class="os-empty-app-icon">${l(`clipboard-list`)}</span>
      <h2>Your flight log starts here.</h2>
      <p>Import a flight when you're ready. Your saved account will be used automatically.</p>
      <button id="efl-import-btn">SimBrief settings ${l(`arrow-right`)}</button>
    </div>
  `,document.getElementById(`efl-import-btn`).addEventListener(`click`,()=>Oe({id:`settings`,label:`Settings`}))}var bt=`realefb.eflTheme`;function xt(){try{return localStorage.getItem(bt)===`light`?`light`:`dark`}catch{return`dark`}}function St(e){let t=e===`dark`;document.body.dataset.eflTheme=t?`dark`:`light`;let n=document.getElementById(`efl-theme-btn`);n&&(n.innerHTML=l(t?`sun`:`moon`),n.title=t?`Light mode`:`Dark mode`,n.setAttribute(`aria-label`,t?`Switch to light mode`:`Switch to dark mode`))}function Ct(e){let t=e.scheduledOutUtc?new Date(e.scheduledOutUtc):null,n=e.scheduledInUtc?new Date(e.scheduledInUtc):null,r=e=>e?`${String(e.getUTCHours()).padStart(2,`0`)}${String(e.getUTCMinutes()).padStart(2,`0`)}Z`:`----`,i=e=>e?`${e.getUTCDate()} ${Kn[e.getUTCMonth()]} ${e.getUTCFullYear()}`:``,a=e=>`
      <button class="efl-tab-btn ${e.id===`flightlog`?`selected`:``}" data-tab="${e.id}">
        <i class="efl-tab-icon fa-solid fa-${e.icon}" aria-hidden="true"></i>
        <span>${e.label}</span>
      </button>`,o=b.slice(0,4),s=b.slice(4),c=`
      ${o.map(a).join(``)}
      <button class="efl-home-btn" id="efl-home-btn" aria-label="Home">${l(`house`)}</button>
      ${s.map(a).join(``)}
    `;E.innerHTML=`
    <div class="efl-sheet">
      <div class="efl-header">
        <span class="efl-callsign">${e.callsign||`N/A`}</span>
        <span class="efl-route">${e.originIcao} ${e.destIcao}</span>
        <span class="efl-meta">${i(t)} ${r(t)} ${r(n)} ${e.aircraftIcao}</span>
        <button type="button" class="efl-theme-btn" id="efl-refresh-btn" aria-label="Refresh flight log">${l(`arrows-rotate`)}</button><button type="button" class="efl-theme-btn" id="efl-theme-btn"></button>
      </div>
      <div class="efl-tab-content" id="efl-tab-content"></div>
    </div>
    <div class="efl-save-bar hidden" id="efl-save-bar">
      <span id="efl-save-status" class="fuel-save-status"></span>
    </div>
    <nav class="efl-tabbar">${c}</nav>
  `,D.classList.add(`hidden`),document.getElementById(`efl-home-btn`).addEventListener(`click`,Gn),document.getElementById(`efl-refresh-btn`).onclick=()=>{$(),vt()},St(xt()),document.getElementById(`efl-theme-btn`).addEventListener(`click`,()=>{let e=document.body.dataset.eflTheme===`dark`?`light`:`dark`;try{localStorage.setItem(bt,e)}catch{}St(e)});let u=document.getElementById(`efl-tab-content`);u.addEventListener(`input`,Dt),u.addEventListener(`click`,e=>{e.target.closest(`.fuel-sign-opt, .fuel-choice-opt`)&&Dt()}),Ot(u,`flightlog`,e);for(let t of E.querySelectorAll(`.efl-tab-btn`))t.addEventListener(`click`,()=>{for(let e of E.querySelectorAll(`.efl-tab-btn`))e.classList.remove(`selected`);t.classList.add(`selected`),Ot(u,t.dataset.tab,e)})}var wt={flightlog:kn,fuelfmc:nn,waypoints:dn},Tt=null,Y=null,Et=600;function Dt(){let e=wt[Tt];e&&(clearTimeout(Y),Y=setTimeout(()=>{Y=null,e()},Et))}function Ot(e,t,n){$(),Tt=t,document.getElementById(`efl-save-bar`).classList.toggle(`hidden`,!wt[t]);let r=document.getElementById(`efl-save-status`);r.textContent=``,r.classList.remove(`fuel-save-error`),t===`flightlog`?Nt(e,n):t===`fuelfmc`?Lt(e,n):t===`waypoints`?rn(e,n):t===`weather`?mn(e,n):t===`notams`?vn(e,n):t===`vp`?gn(e,n):t===`atc`?_n(e,n):t===`pdf`?kt(e,n):e.innerHTML=`<p class="coming-soon">${b.find(e=>e.id===t).label} - coming soon.</p>`}async function kt(e,t){e.innerHTML=`<p class="coming-soon">Loading...</p>`;let n=``;try{let e=await fetch(`/api/simbrief/planhtml`,{cache:`no-store`});e.ok&&(n=await e.text())}catch{}n?(e.innerHTML=`
    <h2 class="efl-section-title">PDF</h2>
    ${t.pdfUrl?`<a class="efl-pdf-original-link" href="/api/simbrief/pdf" target="_blank" rel="noopener">Open original PDF ${l(`arrow-up-right-from-square`)}</a>`:``}
    <div class="efl-pdf-html" id="efl-pdf-html"><div class="efl-pdf-html-inner" id="efl-pdf-html-inner">${n}</div></div>
  `,Mt()):e.innerHTML=`<p class="coming-soon">No OFP text available for this flight plan.</p>`}var At=null;function jt(){clearTimeout(At),At=setTimeout(Mt,120)}window.addEventListener(`resize`,jt);function Mt(){let e=document.getElementById(`efl-pdf-html`),t=document.getElementById(`efl-pdf-html-inner`);if(!e||!t)return;let n=t.scrollWidth,r=t.scrollHeight,i=e.clientWidth;if(!n||!i)return;let a=Math.min(1,i/n);t.style.transform=`scale(${a})`,t.style.transformOrigin=`top left`,e.style.height=`${r*a}px`}async function Nt(e,t){e.innerHTML=`<p class="coming-soon">Loading...</p>`;let n=null,r=null,i=null;try{let[e,t,a]=await Promise.all([fetch(`/api/simbrief/flightlog`,{cache:`no-store`}),fetch(`/api/simbrief/waypoints`,{cache:`no-store`}),fetch(`/api/simbrief/fuelfmc`,{cache:`no-store`})]);e.ok&&({flightLog:n}=await e.json()),t.ok&&({waypoints:r}=await t.json()),a.ok&&({fuelFmc:i}=await a.json())}catch{}let a=r&&r.actuals||{},o={offBlock:a.offblock?.time,airborne:a.depicao?.time,landed:a.arrivalicao?.time,onBlock:a.onblock?.time,offBlockFuel:a.offblock?.fuel??null,onBlockFuel:a.onblock?.fuel??null},s=i&&i.picDiscrFuel!==null&&i.picDiscrFuel!==void 0?i.picDiscrFuel:null;e.innerHTML=En(t,n,o,s);for(let e of[`fuel-pftakeoff`,`fuel-pflanding`]){let t=document.getElementById(e);for(let e of t.querySelectorAll(`.fuel-choice-opt`))e.addEventListener(`click`,()=>Tn(t,e.dataset.value))}wn();for(let e=1;e<=3;e++)yn(document.getElementById(`fuel-delay${e}-time`)),Pt(e);Cn(document.getElementById(`fuel-captain-remarks`)),document.getElementById(`log-flight-btn`).addEventListener(`click`,()=>An(t))}function Pt(e){let t=document.getElementById(`fuel-delay${e}-reason`);t.addEventListener(`click`,()=>{It(t.dataset.value,e=>{t.dataset.value=e,t.textContent=e||`Select reason`,t.classList.toggle(`delay-reason-btn-empty`,!e),Dt()})})}function Ft(e){return e.letter?`${e.code} (${e.letter}) - ${e.desc}`:`${e.code} - ${e.desc}`}function It(e,t){let n=document.createElement(`div`);n.className=`delay-picker-overlay`,n.innerHTML=`
    <div class="delay-picker-modal">
      <div class="delay-picker-header">
        <h3>Delay Reason</h3>
        <button type="button" class="delay-picker-close" aria-label="Close">${l(`xmark`)}</button>
      </div>
      <input type="text" class="delay-picker-search" placeholder="Search delay codes..." />
      <div class="delay-picker-list">
        ${ee.map(e=>`
          <div class="delay-picker-group">
            <div class="delay-picker-group-title">${escapeAttr(e.group)}</div>
            ${e.codes.map(e=>{let t=Ft(e);return`
                <button type="button" class="delay-picker-item" data-value="${escapeAttr(t)}">
                  <span class="delay-picker-item-code">${escapeAttr(e.letter?`${e.code} · ${e.letter}`:e.code)}</span>
                  <span class="delay-picker-item-desc">${escapeAttr(e.desc)}</span>
                </button>`}).join(``)}
          </div>`).join(``)}
      </div>
    </div>`,document.body.appendChild(n);let r=()=>n.remove();n.addEventListener(`click`,e=>{e.target===n&&r()}),n.querySelector(`.delay-picker-close`).addEventListener(`click`,r);for(let i of n.querySelectorAll(`.delay-picker-item`))i.classList.toggle(`selected`,i.dataset.value===e),i.addEventListener(`click`,()=>{t(i.dataset.value),r()});let i=n.querySelector(`.delay-picker-search`);i.addEventListener(`input`,()=>{let e=i.value.trim().toLowerCase();for(let t of n.querySelectorAll(`.delay-picker-group`)){let n=!1;for(let r of t.querySelectorAll(`.delay-picker-item`)){let t=!e||r.textContent.toLowerCase().includes(e);r.classList.toggle(`hidden`,!t),t&&(n=!0)}t.classList.toggle(`hidden`,!n)}}),i.focus()}async function Lt(e,t){e.innerHTML=`<p class="coming-soon">Loading...</p>`;let n=null;try{let e=await fetch(`/api/simbrief/fuelfmc`,{cache:`no-store`});e.ok&&({fuelFmc:n}=await e.json())}catch{}e.innerHTML=Qt(t,n),document.getElementById(`fmc-total-fuel`).addEventListener(`input`,Xt),document.getElementById(`fmc-block-fuel`).addEventListener(`input`,Xt),Xt();let r=document.querySelector(`.fmc-copy-btn`);r&&r.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(r.dataset.copy),r.textContent=`Copied`,setTimeout(()=>r.textContent=`Copy`,1500)}catch{}});for(let t of e.querySelectorAll(`.fmc-impact-toggle`)){let e=t.id.replace(`-toggle`,``),n=document.getElementById(`${e}-trip`),r=document.getElementById(`${e}-time`);for(let e of t.querySelectorAll(`.fmc-impact-toggle-opt`))e.addEventListener(`click`,()=>{let i=e.dataset.side;t.dataset.side=i;for(let n of t.querySelectorAll(`.fmc-impact-toggle-opt`))n.classList.toggle(`selected`,n===e);n.textContent=`Trip ${n.dataset[`${i}Trip`]}`,r.textContent=`Time ${r.dataset[`${i}Time`]}`})}Rt=n&&n.departureAtisFields||{},Bt=n&&n.departureClearanceFields||{},zt=n&&n.arrivalAtisFields||{},Jt(t)}var Rt={},zt={},Bt={},Vt=[{key:`info`,label:`Info`},{key:`time`,label:`Time`,type:`time`},{key:`appr`,label:`Appr`},{key:`rwy`,label:`Rwy`,type:`runway`},{key:`tlOther`,label:`TL / Other Info`},{key:`cond`,label:`Cond`,type:`select`,options:[`Dry`,`Wet`,`Snow`]},{key:`wind`,label:`Wind`,type:`slash`,slashAt:3},{key:`vis`,label:`Vis`,type:`unit`,units:[`KM`,`SM`]},{key:`wx`,label:`Wx`},{key:`cloud`,label:`Cloud`},{key:`oat`,label:`OAT`},{key:`dp`,label:`Dew Point`},{key:`qnh`,label:`QNH`},{key:`addInfo`,label:`Additional Info`}],X={atis:{title:`Departure ATIS`,fields:Vt,airportEditable:!1,defaultAirport:e=>e.originIcao,getValues:()=>Rt,textElId:`fmc-atis-text`},clearance:{title:`Departure ATC Clearance`,fields:[{key:`callsign`,label:`Callsign`,auto:!0},{key:`atisInfo`,label:`ATIS Info`},{key:`sidTrans`,label:`SID / Transition`},{key:`flAlt`,label:`FL / Alt`},{key:`freq`,label:`Freq`,type:`freq`},{key:`squawk`,label:`Squawk`},{key:`qnh`,label:`QNH`},{key:`ctot`,label:`CTOT`},{key:`addInfo`,label:`Additional Info`}],airportEditable:!1,defaultAirport:e=>e.originIcao,getValues:()=>Bt,textElId:`fmc-clearance-text`},arrival:{title:`Arrival ATIS / Alternate ATIS`,fields:Vt,airportEditable:!0,defaultAirport:e=>e.destIcao,getValues:()=>zt,textElId:`fmc-arrival-text`}};function Ht(e,t){let n=X[t],r=n.getValues(),i=[`Airport ${n.airportEditable&&r.airport||n.defaultAirport(e)}`];for(let t of n.fields){let n=(r[t.key]??``).trim();n===``&&t.auto&&t.key===`callsign`&&(n=e.callsign||``),n!==``&&i.push(`${t.label} ${n}`)}return i.length>1?i.join(` | `):``}function Ut(e,t){if(e.type===`select`){let n=e.options.map(e=>`<option value="${escapeAttr(e)}" ${e===t?`selected`:``}>${escapeAttr(e)}</option>`).join(``);return`<select id="atis-field-${e.key}"><option value=""></option>${n}</select>`}if(e.type===`unit`){let[n,r]=Wt(t,e.units),i=e.units.map(e=>`<option value="${escapeAttr(e)}" ${e===r?`selected`:``}>${escapeAttr(e)}</option>`).join(``);return`
      <span class="atis-field-compound">
        <input type="text" id="atis-field-${e.key}-num" value="${escapeAttr(n)}" />
        <select id="atis-field-${e.key}-unit">${i}</select>
      </span>`}return`<input type="text" id="atis-field-${e.key}" value="${escapeAttr(t)}" />`}function Wt(e,t){let n=(e||``).trim().split(/\s+/);return[n[0]||``,t.includes(n[1])?n[1]:t[0]]}function Gt(e){e.type===`time`&&yn(document.getElementById(`atis-field-${e.key}`)),e.type===`slash`&&xn(document.getElementById(`atis-field-${e.key}`),e.slashAt),e.type===`runway`&&Sn(document.getElementById(`atis-field-${e.key}`)),e.type===`freq`&&bn(document.getElementById(`atis-field-${e.key}`),`.`,3)}function Kt(e){if(e.type===`unit`){let t=document.getElementById(`atis-field-${e.key}-num`).value.trim(),n=document.getElementById(`atis-field-${e.key}-unit`).value;return t===``?``:`${t} ${n}`}return document.getElementById(`atis-field-${e.key}`).value}function qt(e){e.type===`unit`?(document.getElementById(`atis-field-${e.key}-num`).value=``,document.getElementById(`atis-field-${e.key}-unit`).value=e.units[0]):document.getElementById(`atis-field-${e.key}`).value=``}function Jt(e){let t=()=>{for(let t of Object.keys(X))document.getElementById(X[t].textElId).textContent=Ht(e,t)};t();for(let t of document.querySelectorAll(`.fmc-atis-change`))t.addEventListener(`click`,()=>Yt(t.dataset.target,e));let n=document.getElementById(`atis-modal-overlay`);document.getElementById(`atis-modal-new`).addEventListener(`click`,()=>{for(let e of X[n.dataset.mode].fields)qt(e)}),document.getElementById(`atis-modal-cancel`).addEventListener(`click`,()=>{n.classList.add(`hidden`)}),document.getElementById(`atis-modal-done`).addEventListener(`click`,()=>{let e=X[n.dataset.mode],r=e.getValues();for(let e of Object.keys(r))delete r[e];e.airportEditable&&(r.airport=document.getElementById(`atis-field-airport`).value);for(let t of e.fields)r[t.key]=Kt(t);n.classList.add(`hidden`),t(),nn()})}function Yt(e,t){let n=X[e],r=n.getValues();document.getElementById(`atis-modal-title`).textContent=n.title;let i=n.airportEditable&&r.airport||n.defaultAirport(t),a=`
    <div class="atis-field">
      <span class="atis-field-label">Airport</span>
      <input type="text" id="atis-field-airport" value="${escapeAttr(i)}" ${n.airportEditable?``:`readonly`} />
    </div>`,o=n.fields.map(e=>{let n=r[e.key]??``;return n===``&&e.auto&&e.key===`callsign`&&(n=t.callsign||``),`
        <div class="atis-field">
          <span class="atis-field-label">${escapeAttr(e.label)}</span>
          ${Ut(e,n)}
        </div>`}).join(``);document.getElementById(`atis-modal-grid`).innerHTML=a+o;for(let e of n.fields)Gt(e);let s=document.getElementById(`atis-modal-overlay`);s.dataset.mode=e,s.classList.remove(`hidden`)}function Xt(){let e=document.getElementById(`fmc-total-fuel`).value,t=document.getElementById(`fmc-block-fuel`).value,n=document.getElementById(`fmc-picdiscr-fuel`);n.textContent=e===``||t===``?``:Math.round(Number(e)-Number(t))}function Z(e){return e==null?``:formatMinutes(Math.round(e))}function Zt(...e){let t=e.filter(e=>e!=null);return t.length===0?null:t.reduce((e,t)=>e+t,0)}function Qt(e,t){let n=(e.fuelUnits||``).toLowerCase().includes(`lb`)?`Lbs`:`Kgs`,r=(e,n)=>t&&t[e]!==null&&t[e]!==void 0?t[e]:n,i=e=>e==null?``:Math.round(e),a=Z(Zt(e.timeTripMinutes,e.timeContingencyMinutes,e.timeAlternateMinutes,e.timeFinalReserveMinutes)),o=(e,t,n,r)=>`
    <tr>
      <td class="fmc-label">${e}</td>
      <td class="fmc-arpt">${escapeAttr(r??``)}</td>
      <td class="fmc-static">${i(t)}</td>
      <td class="fmc-static">${escapeAttr(n??``)}</td>
    </tr>`;return`
    <h2 class="efl-section-title">Fuel/FMC</h2>
    <table class="fmc-table">
      <thead>
        <tr>
          <th>Fuel (${n})</th>
          <th>Arpt</th>
          <th>Fuel</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${o(`Trip Fuel`,e.fuelTrip,Z(e.timeTripMinutes))}
        ${o(`Min Cont`,e.fuelContingency,Z(e.timeContingencyMinutes))}
        ${o(`Altn`,e.fuelAlternate,Z(e.timeAlternateMinutes),e.fuelAlternateIcao)}
        ${o(`Finres`,e.fuelFinalReserve,Z(e.timeFinalReserveMinutes))}
        ${o(`Add Res`,e.fuelAdded,Z(e.timeAddedMinutes))}
        <tr class="fmc-row-spacer"><td colspan="4"></td></tr>
        ${o(`Planned T/Off Fuel`,e.fuelPlannedTakeoff,a)}
        ${o(`T/Off Fuel`,e.fuelPlannedTakeoff,a)}
        ${o(`Taxi`,e.fuelTaxi,Z(e.timeTaxiMinutes))}
        <tr class="fmc-row-highlight">
          <td class="fmc-label">Block Fuel</td>
          <td class="fmc-arpt"></td>
          <td><input type="number" id="fmc-block-fuel" value="${i(r(`blockFuel`,e.blockFuel))}" /></td>
          <td class="fmc-static">${escapeAttr(a)}</td>
        </tr>
        <tr>
          <td class="fmc-label">PIC Discr</td>
          <td class="fmc-arpt"></td>
          <td class="fmc-static" id="fmc-picdiscr-fuel"></td>
          <td></td>
        </tr>
        <tr>
          <td class="fmc-label">Total Fuel</td>
          <td class="fmc-arpt"></td>
          <td><input type="number" id="fmc-total-fuel" value="${i(r(`totalFuel`,null))}" /></td>
          <td></td>
        </tr>
      </tbody>
    </table>
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Flight Level Steps</h2>
    <div class="fmc-steps">${escapeAttr(e.stepClimbString||`N/A`)}</div>
    ${tn(e,n)}
    ${en(e,n)}
    ${$t(e,n)}
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Departure ATIS</h2>
    <div class="fmc-atis-box">
      <div class="fmc-atis-text" id="fmc-atis-text"></div>
      <button type="button" class="fmc-atis-change" data-target="atis">Change</button>
    </div>
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Departure ATC Clearance</h2>
    <div class="fmc-atis-box">
      <div class="fmc-atis-text" id="fmc-clearance-text"></div>
      <button type="button" class="fmc-atis-change" data-target="clearance">Change</button>
    </div>
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Arrival ATIS / Alternate ATIS</h2>
    <div class="fmc-atis-box">
      <div class="fmc-atis-text" id="fmc-arrival-text"></div>
      <button type="button" class="fmc-atis-change" data-target="arrival">Change</button>
    </div>
    <div class="atis-modal-overlay hidden" id="atis-modal-overlay">
      <div class="atis-modal">
        <div class="atis-modal-header">
          <span class="atis-modal-title" id="atis-modal-title"></span>
          <div class="atis-modal-actions">
            <button type="button" id="atis-modal-new">New</button>
            <button type="button" id="atis-modal-cancel">Cancel</button>
            <button type="button" id="atis-modal-done">Done</button>
          </div>
        </div>
        <div class="atis-modal-grid" id="atis-modal-grid"></div>
      </div>
    </div>
  `}function $t(e,t){let n=e.operationalImpacts||[];if(n.length===0)return``;let r=(e,t)=>e==null?`-`:`${e<0?`M`:`P`} ${String(Math.round(Math.abs(e))).padStart(4,`0`)}${t?` `+t:``}`;return`
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Operational Impacts</h2>
    <div class="fmc-impacts">${n.map((e,n)=>{let i=e.positiveTripDiffWeight!=null||e.positiveTimeDiffMinutes!=null,a=e.negativeTripDiffWeight!=null||e.negativeTimeDiffMinutes!=null,o=`fmc-impact-${n}`,s=r(e.positiveTripDiffWeight,t),c=r(e.negativeTripDiffWeight,t),l=r(e.positiveTimeDiffMinutes),u=r(e.negativeTimeDiffMinutes);if(i&&a)return`
          <div class="fmc-impacts-row">
            <span class="fmc-impacts-label">${escapeAttr(e.category)}</span>
            <span class="fmc-impact-toggle" id="${o}-toggle" data-side="positive">
              <button type="button" class="fmc-impact-toggle-opt selected" data-side="positive">${escapeAttr(e.positiveLabel)}</button>
              <button type="button" class="fmc-impact-toggle-opt" data-side="negative">${escapeAttr(e.negativeLabel)}</button>
            </span>
            <span class="fmc-impacts-value" id="${o}-trip" data-positive-trip="${escapeAttr(s)}" data-negative-trip="${escapeAttr(c)}">Trip ${s}</span>
            <span class="fmc-impacts-value" id="${o}-time" data-positive-time="${escapeAttr(l)}" data-negative-time="${escapeAttr(u)}">Time ${l}</span>
          </div>`;let d=i?e.positiveLabel:e.negativeLabel,f=i?s:c,p=i?l:u;return`
        <div class="fmc-impacts-row">
          <span class="fmc-impacts-label">${escapeAttr(e.category)} ${escapeAttr(d)}</span>
          <span class="fmc-impacts-value">Trip ${f}</span>
          <span class="fmc-impacts-value">Time ${p}</span>
        </div>`}).join(``)}</div>
  `}function en(e,t){let n=e.alternateRoutes||[];if(n.length===0)return``;let r=e=>e==null?`-`:`FL${Math.round(e/100).toString().padStart(3,`0`)}`,i=(e,t)=>e==null||t==null?`-`:`${String(Math.round(e)).padStart(3,`0`)}/${String(Math.round(t)).padStart(3,`0`)}`;return`
    <h2 class="efl-section-title efl-section-title-spaced efl-section-title-small">Alternate Routes</h2>
    <table class="fmc-table">
      <thead>
        <tr>
          <th>Arpt</th>
          <th>Dist (nm)</th>
          <th>FL</th>
          <th>Wind</th>
          <th>Time</th>
          <th>Fuel</th>
        </tr>
      </thead>
      <tbody>${n.map(e=>`
      <tr>
        <td class="fmc-label">${escapeAttr(e.icao)}</td>
        <td class="fmc-static">${e.distanceNm==null?`-`:Math.round(e.distanceNm)}</td>
        <td class="fmc-static">${r(e.cruiseAltitudeFt)}</td>
        <td class="fmc-static">${i(e.windDir,e.windSpd)}</td>
        <td class="fmc-static">${e.timeMinutes==null?`-`:formatMinutes(Math.round(e.timeMinutes))}</td>
        <td class="fmc-static">${e.fuelUsed==null?`-`:`${Math.round(e.fuelUsed)} ${t}`}</td>
      </tr>`).join(``)}</tbody>
    </table>
  `}function tn(e,t){let n=e=>e==null?`-`:`${Math.round(e)} ${t}`,r=(e,t)=>e==null?`-`:`${Math.round(e)}${t?` `+t:``}`,i=e=>e==null?`-`:`${e>0?`+`:``}${Math.round(e)}`,a=(e,t)=>e==null||t==null?`-`:`${String(Math.round(e)).padStart(3,`0`)}/${String(Math.round(t)).padStart(3,`0`)}`,o=e=>e==null?`-`:`FL${Math.round(e/100).toString().padStart(3,`0`)}`,s=(e,t,n)=>`
    <div class="fmc-info-group">
      <div class="fmc-info-row fmc-info-header">${e.map(e=>`<span>${escapeAttr(e)}</span>`).join(``)}</div>
      <div class="fmc-info-row fmc-info-value">${t.map(e=>`<span>${escapeAttr(e)}</span>`).join(``)}${n??``}</div>
    </div>`;return`
    <div class="fmc-info-panel">
      ${s([`Origin`,`Dest`],[e.originIcao,e.destIcao])}
      ${s([`Flt No`],[e.callsign])}
      ${s([`Route`],[e.atcRoute||`N/A`],`<button type="button" class="fmc-copy-btn" data-copy="${escapeAttr(e.atcRoute||``)}">Copy</button>`)}
      ${s([`eZFW`,`(MZFW)`,`Crz Alt`,`Dest Elev`],[n(e.estZfw),n(e.maxZfw),o(e.cruiseAltitudeFt),r(e.destElevationFt,`ft`)])}
      ${s([`Reserves`,`(Altn)`,`Avg W/V`],[n(e.fuelFinalReserve),e.fuelAlternateIcao||`-`,a(e.avgWindDir,e.avgWindSpd)])}
      ${s([`Cost Index`,`ISA Dev`],[r(e.costIndex),i(e.isaDevC)+(e.isaDevC==null?``:`°C`)])}
      ${s([`eTOW`,`(MTOW)`,`eLW`,`(MLW)`],[n(e.estTow),n(e.maxTow),n(e.estLdw),n(e.maxLdw)])}
      ${s([`Gnd Dist`,`ePax`],[r(e.routeDistanceNm,`nm`),r(e.paxCountActual)])}
    </div>
  `}async function nn(){let e=document.getElementById(`efl-save-status`),t=e=>{let t=document.getElementById(e).value;return t===``?null:Number(t)},n={blockFuel:t(`fmc-block-fuel`),totalFuel:t(`fmc-total-fuel`),picDiscrFuel:(()=>{let e=document.getElementById(`fmc-picdiscr-fuel`).textContent;return e===``?null:Number(e)})(),departureAtisFields:Rt,departureClearanceFields:Bt,arrivalAtisFields:zt};e.classList.remove(`fuel-save-error`),e.textContent=`Saving...`;try{let t=await fetch(`/api/simbrief/fuelfmc`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(n)});Q(e,t.ok?`Saved.`:`Could not save - try again.`,!t.ok)}catch{Q(e,`Could not save - try again.`,!0)}}async function rn(e,t){e.innerHTML=`<p class="coming-soon">Loading...</p>`;let n=null;try{let e=await fetch(`/api/simbrief/waypoints`,{cache:`no-store`});e.ok&&({waypoints:n}=await e.json())}catch{}let r=an(t);e.innerHTML=un(r,n&&n.actuals||{});for(let e of r){document.getElementById(`wp-${e.id}-header`).addEventListener(`click`,()=>{document.getElementById(`wp-${e.id}`).classList.toggle(`wp-card-collapsed`)});let t=document.getElementById(`wp-${e.id}-time`);yn(t),t.addEventListener(`input`,()=>{sn(e.id),cn(r)}),sn(e.id),document.getElementById(`wp-${e.id}-fuel`).addEventListener(`input`,()=>{ln(e.id,`fuel`);for(let e of r)e.hasBurn&&on(e.id);cn(r)}),ln(e.id,`fuel`)}for(let e of r)e.hasBurn&&on(e.id);cn(r);for(let t of e.querySelectorAll(`.wp-clear-btn`))t.addEventListener(`click`,e=>{e.stopPropagation();let n=document.getElementById(t.dataset.clear);n.value=``,n.dispatchEvent(new Event(`input`))})}function an(e){let t=e.navlog||[],n=e.blockFuel??null,r=e=>e==null||n==null?null:n-e,i=e.fuelPlannedTakeoff??null,a=[{id:`offblock`,title:`Off Block`,plannedTimeIso:e.scheduledOutUtc,hasBurn:!1,defaultOpen:!0,plannedFuel:n,plannedBurn:null,oat:null,windDir:null,windSpd:null},{id:`depicao`,title:e.originIcao,plannedTimeIso:e.scheduledOffUtc,hasBurn:!0,defaultOpen:!0,plannedFuel:i,plannedBurn:r(i),oat:null,windDir:null,windSpd:null}];for(let n=0;n<t.length;n++){let i=t[n],o=e.scheduledOffUtc&&i.timeTotalSeconds!=null?new Date(new Date(e.scheduledOffUtc).getTime()+i.timeTotalSeconds*1e3).toISOString():null,s=i.fuelPlanOnboard??null;a.push({id:`wpt${n}`,title:i.viaAirway?`${i.ident} (${i.viaAirway})`:i.ident,plannedTimeIso:o,hasBurn:!0,defaultOpen:!1,plannedFuel:s,plannedBurn:r(s),oat:i.oat??null,windDir:i.windDir??null,windSpd:i.windSpd??null})}let o=t.length>0?t[t.length-1]:null,s=o?o.fuelPlanOnboard??null:null;return a.push({id:`arrivalicao`,title:e.destIcao,plannedTimeIso:e.arrivalTimeUtc,hasBurn:!0,defaultOpen:!0,plannedFuel:s,plannedBurn:r(s),oat:o?o.oat??null:null,windDir:o?o.windDir??null:null,windSpd:o?o.windSpd??null:null}),a.push({id:`onblock`,title:`On Block`,plannedTimeIso:e.scheduledInUtc,hasBurn:!0,defaultOpen:!0,plannedFuel:null,plannedBurn:null,oat:null,windDir:null,windSpd:null}),a}function on(e){let t=document.getElementById(`wp-${e}-burn`);if(!t)return;let n=document.getElementById(`wp-offblock-fuel`),r=document.getElementById(`wp-${e}-fuel`),i=n.value===``?NaN:Number(n.value),a=r.value===``?NaN:Number(r.value);t.value=Number.isNaN(i)||Number.isNaN(a)?``:Math.round(i-a),ln(e,`burn`,!0)}function sn(e){let t=document.getElementById(`wp-${e}-time`),n=document.getElementById(`wp-${e}-time-diff`),r=parseHHMM(t.dataset.planned),i=parseHHMM(t.value);if(n.classList.remove(`wp-diff-red`,`wp-diff-green`),r===null||i===null){n.textContent=``;return}let a=i-r;a>720&&(a-=1440),a<-720&&(a+=1440),a===0?n.textContent=``:(n.textContent=`${a>0?`+`:`-`}${formatMinutes(Math.abs(a))}`,n.classList.add(a>0?`wp-diff-red`:`wp-diff-green`))}function cn(e){let t=null,n=null,r=null;for(let i of e){let e=document.getElementById(`wp-${i.id}-time`),a=document.getElementById(`wp-${i.id}-estimate-time`),o=parseHHMM(e.dataset.planned),s=parseHHMM(e.value);if(s!==null){if(o!==null){let e=s-o;e>720&&(e-=1440),e<-720&&(e+=1440),t=e}a.textContent=`-`}else a.textContent=t===null||o===null?`-`:formatMinutes(((o+t)%1440+1440)%1440);let c=document.getElementById(`wp-${i.id}-fuel`),l=document.getElementById(`wp-${i.id}-estimate-fuel`),u=c.dataset.planned===``?null:Number(c.dataset.planned),d=c.value===``?null:Number(c.value);if(d===null?l.textContent=n===null||u===null?`-`:Math.round(u+n):(u!==null&&(n=d-u),l.textContent=`-`),!i.hasBurn)continue;let f=document.getElementById(`wp-${i.id}-burn`),p=document.getElementById(`wp-${i.id}-estimate-burn`),m=f.dataset.planned===``?null:Number(f.dataset.planned),h=f.value===``?null:Number(f.value);h===null?p.textContent=r===null||m===null?`-`:Math.round(m+r):(m!==null&&(r=h-m),p.textContent=`-`)}}function ln(e,t,n){let r=document.getElementById(`wp-${e}-${t}`),i=document.getElementById(`wp-${e}-${t}-diff`),a=Number(r.dataset.planned),o=r.value===``?NaN:Number(r.value);if(i.classList.remove(`wp-diff-red`,`wp-diff-green`),r.dataset.planned===``||Number.isNaN(a)||Number.isNaN(o)){i.textContent=``;return}let s=o-a;if(s===0){i.textContent=``;return}let c=a===0?0:s/a*100,l=s>0?`+`:``;i.textContent=`${l}${c.toFixed(1)}% | ${l}${Math.round(s)}`;let u=n?s<0:s>0;i.classList.add(u?`wp-diff-green`:`wp-diff-red`)}function un(e,t){let n=e=>{if(!e)return`-`;let t=new Date(e);return`${String(t.getUTCHours()).padStart(2,`0`)}:${String(t.getUTCMinutes()).padStart(2,`0`)}`},r=e=>e==null?`-`:Math.round(e),i=(e,t,n)=>{let r=[];return e!=null&&r.push(`${Math.round(e)}°C`),t!=null&&n!=null&&r.push(`${String(Math.round(t)).padStart(3,`0`)}°/${Math.round(n)}KT`),r.join(`  `)},a=(e,t,n,r,i)=>`
    <span class="wp-input-clear">
      <span class="wp-diff" id="wp-${e}-${t}-diff"></span>
      <span class="wp-input-clear-row">
        <input type="number" id="wp-${e}-${t}" data-planned="${n??``}" value="${r==null?``:Math.round(r)}" ${i?`readonly`:``} />
        ${i?``:`<button type="button" class="wp-clear-btn" data-clear="wp-${e}-${t}" aria-label="Clear">${l(`xmark`)}</button>`}
      </span>
    </span>`;return`
    <h2 class="efl-section-title">Waypoints</h2>
    ${e.map(e=>{let o=t[e.id]||{},s=n(e.plannedTimeIso),c=o.fuel,u=i(e.oat,e.windDir,e.windSpd);return`
      <div class="wp-card ${e.defaultOpen?``:`wp-card-collapsed`}" id="wp-${e.id}">
        <div class="wp-card-title" id="wp-${e.id}-header">
          <span class="wp-card-chevron">${l(`chevron-down`)}</span>
          <span>${escapeAttr(e.title)}</span>
          <span class="wp-card-title-right">
            <span class="wp-card-title-time">${escapeAttr(s)}</span>
            ${u?`<span class="wp-card-title-wx">${escapeAttr(u)}</span>`:``}
          </span>
        </div>
        <div class="wp-card-grid ${e.hasBurn?`wp-card-grid-4col`:`wp-card-grid-3col`}">
          <span></span>
          <span class="wp-col-label">Time</span>
          <span class="wp-col-label">Fuel on Board</span>
          ${e.hasBurn?`<span class="wp-col-label">Burn</span>`:``}

          <span class="wp-row-label">Planned</span>
          <span class="wp-static">${escapeAttr(s)}</span>
          <span class="wp-static">${r(e.plannedFuel)}</span>
          ${e.hasBurn?`<span class="wp-static">${r(e.plannedBurn)}</span>`:``}

          <span class="wp-row-label">Estimate</span>
          <span class="wp-static" id="wp-${e.id}-estimate-time">-</span>
          <span class="wp-static" id="wp-${e.id}-estimate-fuel">-</span>
          ${e.hasBurn?`<span class="wp-static" id="wp-${e.id}-estimate-burn">-</span>`:``}

          <span class="wp-row-label">Actual</span>
          <span class="wp-input-clear">
            <span class="wp-diff" id="wp-${e.id}-time-diff"></span>
            <span class="wp-input-clear-row">
              <input type="text" id="wp-${e.id}-time" data-planned="${escapeAttr(s)}" placeholder="00:00" value="${escapeAttr(o.time||``)}" />
              <button type="button" class="wp-clear-btn" data-clear="wp-${e.id}-time" aria-label="Clear">${l(`xmark`)}</button>
            </span>
          </span>
          ${a(e.id,`fuel`,e.plannedFuel,c,!1)}
          ${e.hasBurn?a(e.id,`burn`,e.plannedBurn,null,!0):``}
        </div>
      </div>`}).join(``)}
  `}async function dn(){let e=document.getElementById(`efl-save-status`),t={};for(let e of document.querySelectorAll(`[id^="wp-"][id$="-time"]`)){let n=e.id.replace(/^wp-/,``).replace(/-time$/,``),r=document.getElementById(`wp-${n}-fuel`),i=document.getElementById(`wp-${n}-burn`),a=e.value,o=r&&r.value!==``?Number(r.value):null,s=i&&i.value!==``?Number(i.value):null;(a!==``||o!==null||s!==null)&&(t[n]={time:a,fuel:o,burn:s})}e.classList.remove(`fuel-save-error`),e.textContent=`Saving...`;try{let n=await fetch(`/api/simbrief/waypoints`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({actuals:t})});Q(e,n.ok?`Saved.`:`Could not save - try again.`,!n.ok)}catch{Q(e,`Could not save - try again.`,!0)}}function fn(e,t){return`
    <div class="wx-chart-wrap">
      <div class="wx-zoom-controls">
        <button type="button" class="wx-zoom-btn wx-zoom-out" aria-label="Zoom out" disabled>${l(`minus`)}</button>
        <button type="button" class="wx-zoom-btn wx-zoom-in" aria-label="Zoom in">${l(`plus`)}</button>
      </div>
      <img class="wx-chart-img" src="${e}" alt="${escapeAttr(t)}" draggable="false" />
    </div>`}function pn(e){let t=e.querySelector(`.wx-chart-img`),n=e.querySelector(`.wx-zoom-in`),r=e.querySelector(`.wx-zoom-out`);if(!t)return;let i=1,a=0,o=0,s=()=>{t.style.transform=`translate(${a}px, ${o}px) scale(${i})`,t.classList.toggle(`wx-chart-img-zoomed`,i>1),r.disabled=i<=1,n.disabled=i>=4};n.addEventListener(`click`,()=>{i=Math.min(4,i*1.4),s()}),r.addEventListener(`click`,()=>{i=Math.max(1,i/1.4),i===1&&(a=0,o=0),s()});let c=!1,l=0,u=0,d=0,f=0,p=(e,t)=>i<=1?!1:(c=!0,l=e,u=t,d=a,f=o,!0),m=(e,t)=>{c&&(a=d+(e-l),o=f+(t-u),s())},h=()=>{c=!1};t.addEventListener(`mousedown`,e=>{if(!p(e.clientX,e.clientY))return;e.preventDefault();let t=e=>m(e.clientX,e.clientY),n=()=>{h(),window.removeEventListener(`mousemove`,t),window.removeEventListener(`mouseup`,n)};window.addEventListener(`mousemove`,t),window.addEventListener(`mouseup`,n)}),e.addEventListener(`touchstart`,e=>{p(e.touches[0].clientX,e.touches[0].clientY)&&e.stopPropagation()}),e.addEventListener(`touchmove`,e=>{c&&(e.stopPropagation(),m(e.touches[0].clientX,e.touches[0].clientY))}),e.addEventListener(`touchend`,e=>{c&&e.stopPropagation(),h()}),s()}function mn(e,t){let n=t.chartImages||[],r=1+n.length,i=0;e.innerHTML=`
    <div class="wx-tab">
      <div class="wx-page" id="wx-page"></div>
      <div class="wx-pager">
        <button type="button" id="wx-prev" class="wx-pager-btn" aria-label="Previous page">${l(`chevron-left`)}</button>
        <span class="wx-pager-label" id="wx-pager-label"></span>
        <button type="button" id="wx-next" class="wx-pager-btn" aria-label="Next page">${l(`chevron-right`)}</button>
      </div>
    </div>
  `;let a=document.getElementById(`wx-page`),o=document.getElementById(`wx-pager-label`),s=document.getElementById(`wx-prev`),c=document.getElementById(`wx-next`);function u(){if(s.disabled=i===0,c.disabled=i===r-1,o.textContent=`Page ${i+1} of ${r}`,i===0){a.innerHTML=hn(t);return}let e=n[i-1];a.innerHTML=`
      <h2 class="efl-section-title">${escapeAttr(e.name)}</h2>
      ${fn(`/api/simbrief/chart/${i-1}`,e.name)}`,pn(a.querySelector(`.wx-chart-wrap`))}let d=e=>{e<0||e>=r||e===i||(i=e,u())};s.addEventListener(`click`,()=>d(i-1)),c.addEventListener(`click`,()=>d(i+1));let f=null,p=null;a.addEventListener(`touchstart`,e=>{f=e.touches[0].clientX,p=e.touches[0].clientY}),a.addEventListener(`touchend`,e=>{if(f===null)return;let t=e.changedTouches[0].clientX-f,n=e.changedTouches[0].clientY-p;f=null,Math.abs(t)<50||Math.abs(t)<Math.abs(n)||d(t<0?i+1:i-1)}),u()}function hn(e){let t=(e,t)=>t&&t!==`N/A`?`${e}/${t}`:e,n=(e,t,n,r)=>`
    <div class="wx-airport-block">
      <div class="wx-airport-heading">${escapeAttr(e)}&nbsp;&nbsp;${escapeAttr(t)}</div>
      ${n&&n!==`N/A`?`<pre class="wx-raw">${escapeAttr(n)}</pre>`:``}
      ${r&&r!==`N/A`?`<pre class="wx-raw">${escapeAttr(r)}</pre>`:``}
    </div>`,r=e.alternateWeather||[],i=e.etopsWeather||[],a=e.sigmets||[],o=[],s={};for(let e of a)s[e.fir]||(s[e.fir]={firName:e.firName,items:[]},o.push(e.fir)),s[e.fir].items.push(e);return`
    <h2 class="efl-section-title">Weather</h2>

    <div class="wx-section-title">Destination</div>
    ${n(t(e.destIcao,e.destIata),e.destName,e.destMetar,e.destTaf)}

    <div class="wx-section-title">Departure</div>
    ${n(t(e.originIcao,e.originIata),e.originName,e.origMetar,e.origTaf)}

    ${r.length>0?`<div class="wx-section-title">Destination Alternates</div>
           ${r.map(e=>n(e.icaoIata,e.name,e.metar,e.taf)).join(``)}`:``}

    ${i.length>0?`<div class="wx-section-title">Critical ETOPS Airports</div>
           ${i.map(e=>n(e.icaoIata,e.name,e.metar,e.taf)).join(``)}`:``}

    ${o.length>0?`<div class="wx-section-title">FIR/UIR</div>
           ${o.map(e=>`
             <div class="wx-fir-block">
               <div class="wx-fir-heading">${escapeAttr(e)} - ${escapeAttr(s[e].firName)}</div>
               ${s[e].items.map(e=>`<pre class="wx-raw wx-sigmet">${escapeAttr(e.text)}</pre>`).join(``)}
             </div>`).join(``)}`:``}
  `}function gn(e,t){t.verticalProfileImageUrl?(e.innerHTML=`
    <h2 class="efl-section-title">VP</h2>
    ${fn(`/api/simbrief/vpchart`,`Vertical profile`)}
  `,pn(e.querySelector(`.wx-chart-wrap`))):e.innerHTML=`
      <h2 class="efl-section-title">VP</h2>
      <p class="coming-soon">No vertical profile chart available for this flight plan.</p>
    `}function _n(e,t){e.innerHTML=!t.atcFlightPlanText||t.atcFlightPlanText===`N/A`?`
      <h2 class="efl-section-title">ATC</h2>
      <p class="coming-soon">No ATC flight plan available for this flight plan.</p>
    `:`
    <h2 class="efl-section-title">ATC Flight Plan</h2>
    <pre class="wx-raw atc-flightplan">${escapeAttr(t.atcFlightPlanText)}</pre>
  `}function vn(e,t){let n=t.notams||[];if(n.length===0){e.innerHTML=`
      <h2 class="efl-section-title">NOTAMS</h2>
      <p class="coming-soon">No NOTAMs for this flight plan.</p>
    `;return}let r=[],i={};for(let e of n)i[e.icao]||(i[e.icao]={name:e.icaoName,items:[]},r.push(e.icao)),i[e.icao].items.push(e);let a=e=>`
    <div class="notam-item">
      ${e.notamId?`<div class="notam-item-id">${escapeAttr(e.notamId)}</div>`:``}
      <pre class="wx-raw">${escapeAttr(e.text)}</pre>
    </div>`;e.innerHTML=`
    <h2 class="efl-section-title">NOTAMS</h2>
    ${r.map((e,n)=>{let r=e===t.originIcao?`DEPARTURE`:e===t.destIcao?`ARRIVAL`:``;return`
      <div class="notam-group notam-group-collapsed" id="notam-group-${n}">
        <div class="notam-group-title" id="notam-group-${n}-header">
          <span class="notam-group-chevron">${l(`chevron-down`)}</span>
          <span>${escapeAttr(e)} - ${escapeAttr(i[e].name)}</span>
          ${r?`<span class="notam-group-leg-badge">${r}</span>`:``}
          <span class="notam-group-count">${i[e].items.length}</span>
        </div>
        <div class="notam-group-body" id="notam-group-${n}-body"></div>
      </div>`}).join(``)}
  `,r.forEach((e,t)=>{let n=document.getElementById(`notam-group-${t}`),r=document.getElementById(`notam-group-${t}-header`),o=document.getElementById(`notam-group-${t}-body`),s=!1;r.addEventListener(`click`,()=>{s||=(o.innerHTML=i[e].items.map(a).join(``),!0),n.classList.toggle(`notam-group-collapsed`)})})}function Q(e,t,n){e.textContent=t,e.classList.toggle(`fuel-save-error`,n),n||setTimeout(()=>{e.textContent===t&&(e.textContent=``)},2500)}function yn(e){e.addEventListener(`input`,()=>{let t=e.value.replace(/\D/g,``).slice(0,4);e.value=t.length>2?`${t.slice(0,2)}:${t.slice(2)}`:t})}function bn(e,t,n){e.addEventListener(`input`,()=>{let r=e.value.replace(/\D/g,``);e.value=r.length>n?`${r.slice(0,n)}${t}${r.slice(n)}`:r})}function xn(e,t){bn(e,`/`,t)}function Sn(e){e.addEventListener(`input`,()=>{let t=e.value.toUpperCase().replace(/[^0-9LCR]/g,``),n=[],r=``,i=0,a=!1;for(let e of t)/[0-9]/.test(e)?i>=2||a?(n.push(r),r=e,i=1,a=!1):(r+=e,i++):i>0&&!a&&(r+=e,a=!0);r&&n.push(r),e.value=n.join(`/`)})}function Cn(e){let t=()=>{e.style.height=`auto`,e.style.height=`${e.scrollHeight}px`};e.addEventListener(`input`,t),t()}function wn(){let e=document.getElementById(`fuel-airborne`).value,t=document.getElementById(`fuel-landed`).value;document.getElementById(`fuel-totalflight`).value=e&&t?durationHHMM(e,t):``;let n=document.getElementById(`fuel-offblock`).value,r=document.getElementById(`fuel-onblock`).value;document.getElementById(`fuel-totalblock`).value=n&&r?durationHHMM(n,r):``}function Tn(e,t){e.dataset.value=t;for(let n of e.querySelectorAll(`.fuel-choice-opt`))n.classList.toggle(`selected`,n.dataset.value===t)}function En(e,t,n,r){let i=(e.fuelUnits||``).toLowerCase().includes(`lb`),a=i?`Lbs`:`Kgs`,o=i?`Gal`:`Lts`,s=e=>e==null?``:Math.round(e),c=(e,n)=>t&&t[e]!==null&&t[e]!==void 0?t[e]:n,l=(e,t,n,r)=>`
    <div class="fuel-field">
      <span class="fuel-label">${t}</span>
      <span class="fuel-box">
        <input type="number" id="fuel-${e}" value="${s(n)}" />
        ${r?`<span class="fuel-unit">${r}</span>`:``}
      </span>
    </div>`,u=(e,t,n,r)=>`
    <div class="fuel-field">
      <span class="fuel-label">${t}</span>
      <span class="fuel-box fuel-box-readonly">
        <input type="number" id="fuel-${e}" value="${s(n)}" readonly />
        ${r?`<span class="fuel-unit">${r}</span>`:``}
      </span>
    </div>`,d=(e,t,n,r,i)=>`
    <div class="fuel-field">
      <span class="fuel-label">${t}</span>
      <span class="fuel-box${i?` fuel-box-readonly`:``}">
        <input type="text" id="fuel-${e}" value="${escapeAttr(n??``)}" ${r?`placeholder="${escapeAttr(r)}"`:``} ${i?`readonly`:``} />
      </span>
    </div>`,f=(e,t)=>`
    <div class="fuel-field">
      <span class="fuel-label">${t}</span>
      <span class="fuel-box fuel-box-readonly">
        <input type="text" id="fuel-${e}" value="" readonly />
      </span>
    </div>`,p=(e,t,n)=>`
    <div class="fuel-field">
      <span class="fuel-label">${t}</span>
      <span class="fuel-box fuel-box-readonly">
        <input type="text" id="fuel-${e}" placeholder="00:00" value="${escapeAttr(n||``)}" readonly />
      </span>
    </div>`,m=t&&t.delays||[],h=e=>{let t=m[e-1]||{},n=t.reason??``;return`
    <div class="fuel-field">
      <span class="fuel-label">Delay ${e}</span>
      <span class="delay-inputs">
        <button type="button" id="fuel-delay${e}-reason" class="delay-reason-input delay-reason-btn${n?``:` delay-reason-btn-empty`}" data-value="${escapeAttr(n)}">${escapeAttr(n)||`Select reason`}</button>
        <input type="text" id="fuel-delay${e}-time" class="delay-time-input" placeholder="00:00" value="${escapeAttr(t.time??``)}" />
      </span>
    </div>`},g=(e,t,n,r)=>`
    <div class="fuel-field">
      <span class="fuel-label">${t}</span>
      <span class="fuel-choice-toggle" id="fuel-${e}" data-value="${r}">
        ${n.map(e=>`<button type="button" class="fuel-choice-opt${e===r?` selected`:``}" data-value="${e}">${e}</button>`).join(``)}
      </span>
    </div>`,_=(e,t,n,r,i)=>`
    <div class="fuel-field">
      <span class="fuel-label">${t}</span>
      <span class="fuel-box fuel-box-readonly">
        <span class="fuel-sign-toggle" id="fuel-${e}-sign" data-sign="${n}">
          <button type="button" class="fuel-sign-opt${n===`+`?` selected`:``}" data-sign="+" disabled>+</button>
          <button type="button" class="fuel-sign-opt${n===`-`?` selected`:``}" data-sign="-" disabled>&minus;</button>
        </span>
        <input type="number" id="fuel-${e}" min="0" value="${s(r)}" readonly />
        <span class="fuel-unit">${i}</span>
      </span>
    </div>`,v=n.offBlockFuel,y=n.onBlockFuel,b=v!==null&&y!==null?v-y:null,ee=e.fuelTrip??null,x=b!==null&&ee!==null?b-ee:null,te=x!==null&&x<0?`-`:`+`,ne=x===null?null:Math.abs(x),S=r!==null&&Math.abs(r)>(i?441:200);return`
    <h2 class="efl-section-title">Fuel</h2>
    <div class="fuel-grid">
      ${l(`block`,`Block`,c(`block`,e.blockFuel),a)}
      ${l(`triptaxi`,`Trip+Taxi`,c(`tripTaxi`,e.tripTaxiFuel),a)}
      ${l(`reserves`,`Reserves`,c(`reserves`,e.reserveFuel),a)}
      ${l(`uplift`,`Uplift`,c(`uplift`,null),o)}
      ${u(`departure`,`Departure`,v,a)}
      ${u(`arrival`,`Arrival`,y,a)}
      ${u(`burnoff`,`Burn Off`,b,a)}
      ${_(`burndiff`,`Burn Difference`,te,ne,a)}
      ${d(`discrreason`,`Reason for DISCR Fuel`,c(`reasonForDiscrFuel`,``),null,!S)}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Payload</h2>
    <div class="fuel-grid">
      ${l(`adults`,`Adults`,c(`adults`,null),``)}
      ${l(`children`,`Children`,c(`children`,null),``)}
      ${l(`infants`,`Infants`,c(`infants`,null),``)}
      ${l(`actualpax`,`Actual Pax`,c(`actualPax`,e.paxCountActual),``)}
      ${l(`freight`,`Freight`,c(`freight`,e.cargo),a)}
      ${l(`placardwt`,`Placard WT`,c(`placardWt`,e.maxTowStruct),a)}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Times</h2>
    <p class="fuel-times-note">Sourced from the Actual times entered on the Waypoints tab.</p>
    <div class="fuel-grid">
      ${p(`offblock`,`Off Block`,n.offBlock)}
      ${p(`airborne`,`Airborne`,n.airborne)}
      ${f(`totalflight`,`Total Flight`)}
      ${p(`landed`,`Landed`,n.landed)}
      ${p(`onblock`,`On Block`,n.onBlock)}
      ${f(`totalblock`,`Total Block`)}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Delays</h2>
    <div class="fuel-grid">
      ${h(1)}
      ${h(2)}
      ${h(3)}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Pilot Flying</h2>
    <div class="fuel-grid">
      ${g(`pftakeoff`,`PF Takeoff`,[`CAPT`,`F/O`],c(`pfTakeoff`,`CAPT`))}
      ${g(`pflanding`,`PF Landing`,[`CAPT`,`F/O`],c(`pfLanding`,`CAPT`))}
    </div>
    <h2 class="efl-section-title efl-section-title-spaced">Captain Remarks</h2>
    <div class="fmc-notes">
      <label class="fmc-notes-field">
        <textarea id="fuel-captain-remarks" rows="3">${escapeAttr(c(`captainRemarks`,``))}</textarea>
      </label>
    </div>
    <div class="fuel-save-row">
      <button id="log-flight-btn" class="log-flight-btn">Log Flight</button>
      <span id="log-flight-status" class="fuel-save-status"></span>
    </div>
  `}function Dn(){let e=e=>{let t=document.getElementById(`fuel-${e}`).value;return t===``?null:Number(t)};return{block:e(`block`),tripTaxi:e(`triptaxi`),reserves:e(`reserves`),uplift:e(`uplift`),departure:e(`departure`),arrival:e(`arrival`),burnOff:e(`burnoff`),burnDiffSign:document.getElementById(`fuel-burndiff-sign`).dataset.sign,burnDiff:e(`burndiff`),reasonForDiscrFuel:document.getElementById(`fuel-discrreason`).value,adults:e(`adults`),children:e(`children`),infants:e(`infants`),actualPax:e(`actualpax`),freight:e(`freight`),placardWt:e(`placardwt`),offBlock:document.getElementById(`fuel-offblock`).value,airborne:document.getElementById(`fuel-airborne`).value,landed:document.getElementById(`fuel-landed`).value,onBlock:document.getElementById(`fuel-onblock`).value,delays:[1,2,3].map(e=>({reason:document.getElementById(`fuel-delay${e}-reason`).dataset.value||``,time:document.getElementById(`fuel-delay${e}-time`).value})),pfTakeoff:document.getElementById(`fuel-pftakeoff`).dataset.value,pfLanding:document.getElementById(`fuel-pflanding`).dataset.value,captainRemarks:document.getElementById(`fuel-captain-remarks`).value}}async function On(e){return(await fetch(`/api/simbrief/flightlog`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(e)})).ok}async function kn(){let e=document.getElementById(`efl-save-status`);e.classList.remove(`fuel-save-error`),e.textContent=`Saving...`;try{let t=await On(Dn());Q(e,t?`Saved.`:`Could not save - try again.`,!t)}catch{Q(e,`Could not save - try again.`,!0)}}async function An(e){let t=document.getElementById(`log-flight-status`);if(t.classList.remove(`fuel-save-error`),t.textContent=`Saving...`,!await On(Dn()))t.textContent=`Could not save - try again.`,t.classList.add(`fuel-save-error`);else{t.textContent=`Saving PDF...`;try{let n=await fetch(`/api/flightlog/print`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({suggestedName:`${e.callsign}-FlightLog`})});if(n.ok)t.classList.remove(`fuel-save-error`),t.textContent=`Saved to Documents\\RealEFB Documents\\FlightLogs`,setTimeout(()=>{t.textContent.startsWith(`Saved to`)&&(t.textContent=``)},4e3);else{let e=await n.json().catch(()=>({}));t.classList.add(`fuel-save-error`),t.textContent=`Could not save PDF: ${e.detail||e.title||`unknown error`}`}}catch{t.classList.add(`fuel-save-error`),t.textContent=`Could not reach the desktop app to save the PDF.`}}}function jn(e){Se=e;for(let t of E.querySelectorAll(`.settings-tab-btn`))t.classList.toggle(`selected`,t.dataset.tab===e);for(let t of E.querySelectorAll(`.settings-tab-panel`))t.classList.toggle(`hidden`,t.dataset.tabPanel!==e)}async function Mn(){E.innerHTML=`<p class="coming-soon">Loading...</p>`;let e=5150,t=``,n=!1,r=``,i=`sayintentions`,a=[];try{let[o,s]=await Promise.all([fetch(`/api/settings`,{cache:`no-store`}),fetch(`/api/network/interfaces`,{cache:`no-store`})]);if(o.ok){let a=await o.json();({port:e,simBriefId:t,sayIntentionsEnabled:n,sayIntentionsApiCode:r,dispatchDataSource:i}=a),g=a.enabledApps||{},v=a.webApps||[]}s.ok&&(a=await s.json())}catch{}let o=a.length?a.map(t=>`
        <div class="settings-ip-row">
          <span class="settings-ip-name">${escapeAttr(t.name)}</span>
          <span class="settings-ip-url">${escapeAttr(`http://${t.address}:${e}`)}</span>
          <button type="button" class="settings-copy-address" data-copy-address="${escapeAttr(`http://${t.address}:${e}`)}" aria-label="Copy ${escapeAttr(t.name)} address">${l(`copy`)} <span aria-live="polite">Copy</span></button>
        </div>`).join(``):`<p class="settings-hint">No network adapters detected.</p>`,s=`
    <label class="settings-label" for="settings-port">Server port</label>
    <div class="settings-row">
      <input id="settings-port" type="number" min="1" max="65535" value="${e}" />
      <button id="settings-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-status" class="settings-hint"></p>
    <span class="settings-label settings-label-spaced">Local IP address (open this on your tablet)</span>
    ${o}
  `,c=oe(),u=`
    <label class="settings-label" for="settings-simbrief-id">SimBrief username or pilot ID</label>
    <input id="settings-simbrief-id" type="text" placeholder="e.g. jdoe123" value="${escapeAttr(t)}" />
    <div class="settings-row settings-row-spaced">
      <button id="settings-simbrief-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-simbrief-status" class="settings-hint"></p>
  `,f=`
    <p class="settings-hint">Choose which apps appear on the home screen.</p>
    ${d.map(e=>ve(`settings-app-${e.id}`,_(e.id),e.label)).join(``)}
    <div class="settings-row settings-row-spaced">
      <button id="settings-apps-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-apps-status" class="settings-hint"></p>
  `,p=`
    <label class="settings-label">Data source</label>
    <div class="settings-segmented" id="settings-dispatch-source">
      <button type="button" class="settings-segmented-btn ${i===`vatsim`?``:`selected`}" data-value="sayintentions">SayIntentions.AI</button>
      <button type="button" class="settings-segmented-btn ${i===`vatsim`?`selected`:``}" data-value="vatsim">VATSIM</button>
    </div>
    <p class="settings-hint">SayIntentions.AI needs the API code below and adds gate requests. VATSIM needs no account - it's public network data - but has no gate feature, and only has an ATIS when a real controller is online for that airport.</p>
    <div class="settings-row settings-row-spaced">
      <button id="settings-dispatch-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-dispatch-status" class="settings-hint"></p>
    <div class="settings-subsection-divider"></div>
    ${ve(`settings-sayintentions-enabled`,n,`Enable SayIntentions.AI integration`)}
    <label class="settings-label settings-label-spaced" for="settings-sayintentions-code">SayIntentions.AI API code</label>
    ${ye(`settings-sayintentions-code`,r,`Paste your API code`)}
    <div class="settings-row settings-row-spaced">
      <button id="settings-sayintentions-save" class="settings-save-btn">Save</button>
    </div>
    <p id="settings-sayintentions-status" class="settings-hint"></p>
  `,m=[[`simbrief`,`SimBrief account`,`plane`,`violet`,u],[`background`,`Wallpaper`,`image`,`blue`,c],[`webserver`,`Network & connection`,`wifi`,`mint`,s],[`apps`,`Home screen apps`,`table-cells-large`,`blue`,f],[`webapps`,`Website apps`,`globe`,`violet`,In()],[`dispatch`,`Dispatch services`,`tower-broadcast`,`amber`,p],[`appearance`,`Appearance`,`circle-half-stroke`,`blue`,`<p class="settings-hint">Choose the appearance for RealEFB Settings on this device.</p><label class="settings-toggle-row"><span class="settings-toggle-label">Show local time alongside UTC</span><input id="show-local-time" type="checkbox" ${localStorage.getItem(`realefb.showLocalTime`)===`true`?`checked`:``}/></label><div class="appearance-picker"><button data-appearance="light"><span class="appearance-preview light"></span>Light</button><button data-appearance="dark"><span class="appearance-preview dark"></span>Dark</button></div>`],[`developer`,`Developer mode`,`code`,`violet`,`<p class="settings-hint">Developer tools for this device.</p><button id="developer-test-notification" class="settings-save-btn">Send test notification</button><p class="settings-hint">Sound and Do Not Disturb are available in Notification Center.</p>`]];E.innerHTML=`<div class="settings-native"><aside class="settings-list"><h2>Settings</h2><div class="settings-profile"><img src="/assets/brand/realefb-logo.png" alt=""/><div><strong>RealEFB OS</strong><small>Your flight workspace</small></div></div><p class="settings-group-label">PERSONAL & CONNECTIONS</p><nav aria-label="Settings categories">${m.map(([e,t,n,r],i)=>`${i===3?`<p class="settings-group-label">APPS & SERVICES</p>`:``}<button class="settings-category" data-category="${e}"><span class="settings-category-icon ${r}">${l(n)}</span><span>${t}</span>${l(`chevron-right`)}</button>`).join(``)}<button id="settings-run-wizard" class="settings-setup-row">${l(`wand-magic-sparkles`)} Setup assistant</button></nav></aside><section class="settings-detail">${m.map(([e,t,,,n])=>`<div class="settings-detail-page hidden" data-category-page="${e}"><div class="settings-detail-heading"><span>REALEFB OS</span><h2>${t}</h2></div><div class="settings-detail-group" id="settings-section-${e}"><div class="settings-section-body">${n}</div></div></div>`).join(``)}</section></div>`,E.querySelectorAll(`[data-copy-address]`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.querySelector(`span`),n=e.dataset.copyAddress;e.disabled=!0;try{let r=!1;if(navigator.clipboard?.writeText)try{await navigator.clipboard.writeText(n),r=!0}catch{}if(!r){let t=document.createElement(`textarea`);t.value=n,t.setAttribute(`readonly`,``),t.style.cssText=`position:fixed;left:0;top:0;opacity:0;pointer-events:none;`,document.body.appendChild(t);try{t.select(),r=document.execCommand(`copy`)}finally{t.remove(),e.focus({preventScroll:!0})}}t.textContent=r?`Copied!`:`Copy failed`}catch{t.textContent=`Copy failed`}finally{e.disabled=!1,window.setTimeout(()=>{t.isConnected&&(t.textContent=`Copy`)},2e3)}})});function h(e){E.querySelectorAll(`[data-category]`).forEach(t=>{t.classList.toggle(`selected`,t.dataset.category===e),t.setAttribute(`aria-current`,t.dataset.category===e?`page`:`false`)}),E.querySelectorAll(`[data-category-page]`).forEach(t=>t.classList.toggle(`hidden`,t.dataset.categoryPage!==e))}E.querySelectorAll(`[data-category]`).forEach(e=>e.onclick=()=>h(e.dataset.category)),document.getElementById(`show-local-time`).onchange=e=>{localStorage.setItem(`realefb.showLocalTime`,String(e.target.checked)),window.dispatchEvent(new Event(`realefb:clock-preference`))};let y=localStorage.getItem(`realefb.appearance`)||`light`;document.body.dataset.appearance=y;function b(e){document.body.dataset.appearance=e,localStorage.setItem(`realefb.appearance`,e),E.querySelectorAll(`[data-appearance]`).forEach(t=>t.setAttribute(`aria-pressed`,String(t.dataset.appearance===e)))}E.querySelectorAll(`[data-appearance]`).forEach(e=>e.onclick=()=>b(e.dataset.appearance)),b(y),h(`simbrief`),document.getElementById(`developer-test-notification`).onclick=()=>window.dispatchEvent(new CustomEvent(`realefb:notification`,{detail:{title:`Test notification`,message:`RealEFB OS notifications are working.`,error:!1}})),document.getElementById(`settings-run-wizard`).addEventListener(`click`,Ce);for(let e of E.querySelectorAll(`.settings-section-header`))e.addEventListener(`click`,()=>{document.getElementById(`settings-section-${e.dataset.section}`).classList.toggle(`settings-section-collapsed`)});for(let e of E.querySelectorAll(`.settings-tab-btn`))e.addEventListener(`click`,()=>jn(e.dataset.tab));jn(Se),document.getElementById(`settings-save`).addEventListener(`click`,Nn),document.getElementById(`settings-apps-save`).addEventListener(`click`,Pn),Ln(),document.getElementById(`settings-simbrief-save`).addEventListener(`click`,Hn),document.getElementById(`settings-dispatch-save`).addEventListener(`click`,Un),document.getElementById(`settings-sayintentions-save`).addEventListener(`click`,Wn),be(E);for(let e of E.querySelectorAll(`.settings-segmented-btn`))e.addEventListener(`click`,()=>{for(let t of e.parentElement.querySelectorAll(`.settings-segmented-btn`))t.classList.toggle(`selected`,t===e)});se()}async function Nn(){let e=document.getElementById(`settings-port`),t=document.getElementById(`settings-status`),n=parseInt(e.value,10);if(!Number.isInteger(n)||n<1||n>65535)t.textContent=`Enter a port between 1 and 65535.`,t.classList.add(`settings-error`);else{t.classList.remove(`settings-error`),t.textContent=`Saving...`;try{let e=await fetch(`/api/settings`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({port:n})});e.ok?t.textContent=`Saved. Restart RealEFB for the new port to take effect.`:(t.textContent=(await e.json().catch(()=>({}))).error||`Could not save - try again.`,t.classList.add(`settings-error`))}catch{t.textContent=`Could not save - try again.`,t.classList.add(`settings-error`)}}}async function Pn(){let e=document.getElementById(`settings-apps-status`);e.classList.remove(`settings-error`),e.textContent=`Saving...`;let t={};for(let e of d)t[e.id]=document.getElementById(`settings-app-${e.id}`).checked;try{let n=await fetch(`/api/settings/apps`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({enabledApps:t})});n.ok&&(g=t),e.textContent=n.ok?`Saved.`:`Could not save - try again.`,n.ok||e.classList.add(`settings-error`)}catch{e.textContent=`Could not save - try again.`,e.classList.add(`settings-error`)}}function Fn(e,t){let[n,r]=m(e.name),i=e.icon?`<img src="${escapeAttr(e.icon)}" alt="" />`:`<span class="webapp-row-monogram">${escapeAttr(h(e.name))}</span>`;return`
    <div class="webapp-row">
      <span class="webapp-row-icon"${e.icon?``:` style="background: linear-gradient(155deg, ${n}, ${r})"`}>${i}</span>
      <span class="webapp-row-info">
        <span class="webapp-row-name">${escapeAttr(e.name)}</span>
        <span class="webapp-row-url">${escapeAttr(e.url)}</span>
      </span>
      <button type="button" class="webapp-row-btn webapp-row-edit" data-index="${t}" aria-label="Edit">${l(`pen`)}</button>
      <button type="button" class="webapp-row-btn webapp-row-delete" data-index="${t}" aria-label="Delete">${l(`trash-can`)}</button>
    </div>`}function In(){return`
    <p class="settings-hint">Add any website as its own home-screen app - embedded in the app on the desktop, opened in a new tab on a tablet's browser.</p>
    <div class="webapp-list" id="webapp-list">
      ${v.length?v.map(Fn).join(``):`<p class="settings-hint">No website apps yet.</p>`}
    </div>
    <div class="settings-row settings-row-spaced">
      <button type="button" id="webapp-add-btn" class="settings-save-btn">+ Add Website App</button>
    </div>
  `}function Ln(){document.getElementById(`webapp-add-btn`).addEventListener(`click`,()=>Vn(null));for(let e of E.querySelectorAll(`.webapp-row-edit`))e.addEventListener(`click`,()=>Vn(v[Number(e.dataset.index)]));for(let e of E.querySelectorAll(`.webapp-row-delete`))e.addEventListener(`click`,()=>Bn(Number(e.dataset.index)))}function Rn(){let e=document.querySelector(`#settings-section-webapps .settings-section-body`);e&&(e.innerHTML=In(),Ln())}async function zn(){try{let e=await fetch(`/api/settings/webapps`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({webApps:v})});return e.ok?(v=(await e.json()).webApps||v,!0):!1}catch{return!1}}async function Bn(e){v.splice(e,1),await zn(),Rn(),fe()}function Vn(e){let t=!!e,n=e&&e.icon||null,r=document.createElement(`div`);r.className=`webapp-editor-overlay`,r.innerHTML=`
    <div class="webapp-editor">
      <div class="webapp-editor-header">
        <h3>${t?`Edit Website App`:`Add Website App`}</h3>
        <div class="webapp-editor-actions">
          <button type="button" class="webapp-editor-cancel">Cancel</button>
          <button type="button" class="webapp-editor-save">Save</button>
        </div>
      </div>
      <div class="webapp-editor-body">
        ${t?``:`
        <div class="webapp-quickadd-row">
          ${y.map(e=>`<button type="button" class="webapp-quickadd-btn" data-quickadd="${e.id}">${u[e.icon]}${escapeAttr(e.name)}</button>`).join(``)}
        </div>`}
        <label class="webapp-editor-label" for="webapp-editor-name">Name</label>
        <input id="webapp-editor-name" type="text" placeholder="e.g. Navigraph Charts" value="${escapeAttr(e?.name??``)}" />
        <label class="webapp-editor-label webapp-editor-label-spaced" for="webapp-editor-url">URL</label>
        <input id="webapp-editor-url" type="text" placeholder="https://" value="${escapeAttr(e?.url??``)}" />
        <label class="webapp-editor-label webapp-editor-label-spaced">Icon (optional)</label>
        <div class="webapp-editor-icon-row">
          <span class="webapp-editor-icon-preview" id="webapp-editor-icon-preview">${n?`<img src="${escapeAttr(n)}" alt="" />`:u.webapp}</span>
          <label class="webapp-editor-icon-pick">
            Choose Image
            <input id="webapp-editor-icon-file" type="file" accept="image/*" />
          </label>
          <button type="button" id="webapp-editor-icon-remove" ${n?``:`disabled`}>Remove</button>
        </div>
        <p class="webapp-editor-hint">Only saved on this PC - never bundled with RealEFB itself, so a site's own logo is never shipped or shared without its permission.</p>
        <p id="webapp-editor-status" class="fuel-save-status"></p>
      </div>
    </div>`,document.body.appendChild(r);let i=()=>r.remove();r.querySelector(`.webapp-editor-cancel`).addEventListener(`click`,i);let a=r.querySelector(`#webapp-editor-icon-preview`),o=r.querySelector(`#webapp-editor-icon-remove`);r.querySelector(`#webapp-editor-icon-file`).addEventListener(`change`,e=>{let t=e.target.files&&e.target.files[0];if(!t)return;let r=new FileReader;r.onload=()=>{n=r.result,a.innerHTML=`<img src="${escapeAttr(n)}" alt="" />`,o.disabled=!1},r.readAsDataURL(t)}),o.addEventListener(`click`,()=>{n=null,a.innerHTML=u.webapp,o.disabled=!0,r.querySelector(`#webapp-editor-icon-file`).value=``});for(let e of r.querySelectorAll(`.webapp-quickadd-btn`))e.addEventListener(`click`,()=>{let t=y.find(t=>t.id===e.dataset.quickadd);t&&(r.querySelector(`#webapp-editor-name`).value=t.name,r.querySelector(`#webapp-editor-url`).value=t.url,n=t.logo,a.innerHTML=`<img src="${escapeAttr(n)}" alt="" />`,o.disabled=!1)});r.querySelector(`.webapp-editor-save`).addEventListener(`click`,async()=>{let a=r.querySelector(`#webapp-editor-status`),o=r.querySelector(`#webapp-editor-name`).value.trim(),s=r.querySelector(`#webapp-editor-url`).value.trim();if(!o||!s)a.textContent=`Name and URL are both required.`,a.classList.add(`fuel-save-error`);else{if(t)e.name=o,e.url=s,e.icon=n;else{let e=window.crypto&&crypto.randomUUID?crypto.randomUUID():`webapp-${Date.now()}-${Math.random().toString(36).slice(2)}`;v.push({id:e,name:o,url:s,icon:n})}a.classList.remove(`fuel-save-error`),a.textContent=`Saving...`,await zn()?(i(),Rn(),fe()):(a.textContent=`Could not save - try again.`,a.classList.add(`fuel-save-error`))}})}async function Hn(){let e=document.getElementById(`settings-simbrief-status`);e.classList.remove(`settings-error`),e.textContent=`Saving...`;try{let t=await fetch(`/api/settings/simbrief`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({simBriefId:document.getElementById(`settings-simbrief-id`).value})});e.textContent=t.ok?`Saved.`:`Could not save - try again.`,t.ok||e.classList.add(`settings-error`)}catch{e.textContent=`Could not save - try again.`,e.classList.add(`settings-error`)}}async function Un(){let e=document.getElementById(`settings-dispatch-status`);e.classList.remove(`settings-error`),e.textContent=`Saving...`;try{let t=document.querySelector(`#settings-dispatch-source .settings-segmented-btn.selected`),n=await fetch(`/api/settings/dispatch`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({dataSource:t?t.dataset.value:`sayintentions`})});e.textContent=n.ok?`Saved.`:`Could not save - try again.`,n.ok||e.classList.add(`settings-error`)}catch{e.textContent=`Could not save - try again.`,e.classList.add(`settings-error`)}}async function Wn(){let e=document.getElementById(`settings-sayintentions-status`);e.classList.remove(`settings-error`),e.textContent=`Saving...`;try{let t=await fetch(`/api/settings/sayintentions`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({enabled:document.getElementById(`settings-sayintentions-enabled`).checked,sayIntentionsApiCode:document.getElementById(`settings-sayintentions-code`).value})});e.textContent=t.ok?`Saved.`:`Could not save - try again.`,t.ok||e.classList.add(`settings-error`)}catch{e.textContent=`Could not save - try again.`,e.classList.add(`settings-error`)}}function Gn(){$(),ge()}var Kn=[`Jan`,`Feb`,`Mar`,`Apr`,`May`,`Jun`,`Jul`,`Aug`,`Sep`,`Oct`,`Nov`,`Dec`];D.addEventListener(`click`,Gn),document.getElementById(`loadsheet-notification`).addEventListener(`click`,()=>{dt();let e=d.find(e=>e.id===`dispatch`);e&&Oe(e)});function qn(){let e=window.visualViewport,t=e?Math.max(0,window.innerHeight-e.height-e.offsetTop):0;document.documentElement.style.setProperty(`--keyboard-inset`,`${t}px`)}window.visualViewport&&(window.visualViewport.addEventListener(`resize`,qn),window.visualViewport.addEventListener(`scroll`,qn)),new MutationObserver(e=>{for(let t of e)for(let e of t.addedNodes)if(e instanceof Element){e.matches(`input, textarea`)&&e.setAttribute(`autocomplete`,`off`);for(let t of e.querySelectorAll(`input, textarea`))t.setAttribute(`autocomplete`,`off`)}}).observe(document.body,{childList:!0,subtree:!0}),St(xt()),te(),he(),lt(),setInterval(()=>{document.hidden||lt()},15e3),setInterval(()=>{document.hidden||pe()},3e3);function $(){if(Y){clearTimeout(Y),Y=null;let e=wt[Tt];e&&!w.classList.contains(`hidden`)&&E.querySelector(`.efl-sheet`)&&e()}}var Jn={navigate(e){if(e===`home`){Gn();return}let t=e===`settings`?f:d.find(t=>t.id===e);t&&Oe(t)},openWebsite(e){De({label:e.name,url:e.url})}};document.addEventListener(`visibilitychange`,()=>{document.hidden||(lt(),pe())});export{Jn as bridge};