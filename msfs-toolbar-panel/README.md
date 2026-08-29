# RealEFB - MSFS 2024 toolbar panel

Adds a RealEFB icon to the in-game toolbar in Microsoft Flight Simulator 2024. Opening it shows
RealEFB right inside the sim, in a resizable panel - the same app the desktop program and any
LAN tablet already use, just embedded here too. Website Apps (SimBrief Dispatch, MSFS Flight
Planner, Navigraph Charts Web, and anything you've added yourself) are hidden in this view -
opening one has nowhere sensible to go from inside a fixed sim panel.

This only works while RealEFB itself is running on the same PC - the panel is just a window onto
RealEFB's own local server (`http://localhost:5150` by default), not a separate copy of the app.

## How this works

MSFS in-game toolbar panels are plain HTML/CSS/JS, the same technology the sim's own ATC window,
checklist, and map use - see `realefb-ingamepanel/html_ui/InGamePanels/RealEFBPanel/`. The panel
itself is just an `<iframe>` pointed at RealEFB's local address, so nothing about RealEFB's own
code had to change to make this work (the one addition was `app.js` learning to hide Website Apps
when it detects the extra `?context=msfs` this panel's iframe adds to the URL - see
`isMsfsToolbar` in `src/RealEFB/wwwroot/js/app.js`).

## Building it

**You'll need the free Microsoft Flight Simulator 2024 SDK** (a separate download from the base
game - either through the in-game "Free Content" section, or as its own package on the Microsoft
Store) installed, since the panel's actual toolbar registration has to be compiled by the SDK's
own `fspackagetool.exe` into a binary `.spb` file - there's no way around needing the real tool
for that step, and nothing in this repo can substitute for it. The SDK installer sets the
`MSFS_SDK` environment variable for you.

1. Install the MSFS 2024 SDK.
2. From this folder, run `build.bat`.
3. Once it finishes, copy the `Build\realefb-ingamepanel` folder it produces into your Community
   folder (Options > General Options > Data > Community folder, from inside the sim, shows you
   where that is).
4. Restart MSFS.

## Using it

1. Start RealEFB on the same PC first.
2. Start MSFS. The RealEFB icon should now be in the toolbar (top of the screen, in-flight or at
   the main menu) - click it to open the panel.

## If you've changed RealEFB's port

The panel points at a fixed address baked in at build time. If Settings > Web Server in RealEFB
isn't using the default port 5150, open
`realefb-ingamepanel/html_ui/InGamePanels/RealEFBPanel/RealEFBPanel.js`, change the `REALEFB_URL`
constant to match, and run `build.bat` again.

## A heads-up on `manifest.json`

The `dependencies` block's `package_version` numbers were carried over from a known-working
MSFS 2020 in-game-panel template, since there's no way to look up MSFS 2024's exact current
values without the SDK actually installed and this repo doesn't have that. If the sim's Content
Manager complains about a dependency version mismatch after installing, that number is the fix -
bump it to whatever the sim's own error message reports it wants.
