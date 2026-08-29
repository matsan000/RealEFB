// RealEFB's own local server - RealEFB needs to already be running for this panel to show
// anything (it's the same web app the desktop app and any LAN tablet use, just embedded here
// too). If you've changed RealEFB's port in Settings > Web Server away from the default 5150,
// update it here and re-run build.bat.
//
// "?context=msfs" is how app.js (see isMsfsToolbar in RealEFB's wwwroot/js/app.js) knows to
// hide Website Apps - opening one has nowhere sensible to go from inside a fixed sim panel, no
// window.chrome.webview (that's desktop-app-only) and no reasonable "new tab" either.
const REALEFB_URL = "http://localhost:5150/?context=msfs";

// Same activate/deactivate pattern the original MSFS in-game-panel WebView templates use:
// the iframe's src is only ever set while the panel is actually visible, and cleared the
// moment it's hidden. RealEFB's own polling (flight state, loadsheet checks, ...) would
// otherwise keep running in a torn-down/invisible CoherentGT context for no reason every time
// the toolbar icon is toggled off.
class IngamePanelRealEFB extends TemplateElement {
    constructor() {
        super(...arguments);
        this.ingameUi = null;
        this.iframeElement = null;
    }

    connectedCallback() {
        super.connectedCallback();

        const self = this;
        this.ingameUi = this.querySelector("ingame-ui");
        this.iframeElement = document.getElementById("RealEFBPanelIframe");

        if (this.ingameUi) {
            this.ingameUi.addEventListener("panelActive", () => {
                if (self.iframeElement) self.iframeElement.src = REALEFB_URL;
            });
            this.ingameUi.addEventListener("panelInactive", () => {
                if (self.iframeElement) self.iframeElement.src = "";
            });
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }
}
window.customElements.define("ingamepanel-realefb", IngamePanelRealEFB);
checkAutoload();
