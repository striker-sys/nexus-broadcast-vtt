# Nexus Broadcast  
### Foundry VTT V13 Module

Broadcast cinematic text overlays (scrolling or centered) to **all connected players** using SocketLib.

Designed for story intros, dramatic reveals, combat warnings, and immersive narrative moments.

Now includes **optional integration with Monk’s Active Tile Triggers** (MATT) to trigger overlays directly from tiles—no macros required.

---

## ✨ Features

- 📜 Cinematic scrolling / crawl text
- 🎯 Centered static text overlays
- 👥 Broadcast to all players simultaneously
- ⚡ Fully adjustable:
  - Duration (seconds or milliseconds)
  - Scroll speed (% based)
  - Font size
  - Width
  - Fade in / fade out timing
  - Background styling
- 🔌 Uses SocketLib for reliable multi-client execution
- 🧩 Built for Foundry VTT V13
- 🧱 **Monk’s Active Tile Triggers Integration (optional)**
  - Adds tile actions:
    - **Nexus Broadcast: Scroll**
    - **Nexus Broadcast: Center**
  - Supports MATT variable resolution (Handlebars / tile context)
  - Supports targeting (Everyone / Players / GM / Triggering User / Token Owner)

---

## 📦 Requirements

- Foundry VTT **V13**
- SocketLib **v1.1.3+**

### Optional (for Tile Integration)
- **Monk’s Active Tile Triggers** (`monks-active-tiles`)

> If Monk’s Active Tile Triggers is not installed/active, Nexus Broadcast still works normally via macros.

---

## 🔧 Installation

### Option 1 – Manual Installation

1. Create a folder:

   ```
   Data/modules/nexus-broadcast/
   ```

2. Place inside:
   - `module.json`
   - `nexus-broadcast.js`

3. Restart Foundry.
4. Activate **Nexus Broadcast** inside your World.

---

### Option 2 – Install via Manifest URL

```
Setup → Add-on Modules → Install Module → Manifest URL
```

https://raw.githubusercontent.com/striker-sys/nexus-broadcast-vtt/main/module.json

---

## 🚀 Usage

After activating the module and restarting Foundry, you have **two ways** to use Nexus Broadcast:

1) **Macros (default)**  
2) **Monk’s Active Tile Triggers actions (optional)**

---

## 🧙 Option A — Use via Macro (GM)

Create a **Script Macro** as GM.

---

## 📜 Scroll Overlay (Cinematic Crawl)

```javascript
if (!game.user.isGM) return;

const sock = game["nexus-broadcast_socket"];

await sock.executeForEveryone("showScroll", {
  html: `
  <h1>The Nexus Stone Awakens…</h1>
  <p>The ground trembles beneath your feet.</p>
  `,
  durationSeconds: 15,
  speedPercent: 120,
  fontSize: 48,
  width: "80%",
  fadeInMs: 900,
  fadeOutMs: 1200
});
```

---

## 🎯 Centered Overlay (Static Message)

```javascript
if (!game.user.isGM) return;

const sock = game["nexus-broadcast_socket"];

await sock.executeForEveryone("showCenter", {
  html: `
  <h2>Warning</h2>
  <p><b>Roll Initiative!</b></p>
  `,
  displaySeconds: 6,
  width: "50%",
  fontSize: 44,
  fadeInMs: 200,
  fadeOutMs: 800
});
```

---

## 🧱 Option B — Use via Monk’s Active Tile Triggers (MATT)

If you have **Monk’s Active Tile Triggers** installed and active, Nexus Broadcast adds a new **Action Group**:

- **Nexus Broadcast**

with two actions:

- **Nexus Broadcast: Scroll**
- **Nexus Broadcast: Center**

### How to use
1. Create / select a tile
2. Add an action from the group **Nexus Broadcast**
3. Configure HTML + timing
4. Trigger the tile → overlay plays for your selected target audience

### Timing input note
In the MATT UI, **fade timings are configured in seconds** (e.g. `1.2`) and are converted internally to milliseconds.

---

## 🎛 Scroll Overlay Parameters

| Option | Type | Description |
|--------|------|------------|
| `html` | string | HTML content to display |
| `durationSeconds` | number | Base duration in seconds |
| `durationMs` | number | Base duration in milliseconds |
| `speedPercent` | number | 100 = normal speed |
| `fontSize` | number | Font size in pixels |
| `width` | string | CSS width (e.g. `"80%"`) |
| `color` | string | Text color |
| `shadow` | string | CSS text-shadow |
| `fadeInMs` | number | Fade-in duration |
| `fadeOutMs` | number | Fade-out duration |
| `startTransform` | string | CSS transform start |
| `endTransform` | string | CSS transform end |

---

## 🎛 Center Overlay Parameters

| Option | Type | Description |
|--------|------|------------|
| `html` | string | HTML content |
| `displaySeconds` | number | Visible time in seconds |
| `displayMs` | number | Visible time in ms |
| `fontSize` | number | Font size in pixels |
| `width` | string | Overlay width |
| `background` | string | CSS background |
| `padding` | string | CSS padding |
| `borderRadius` | string | CSS border-radius |
| `fadeInMs` | number | Fade-in duration |
| `fadeOutMs` | number | Fade-out duration |

---

## 🧪 Troubleshooting

### "Socket not ready"
- Ensure `"socket": true` is present in `module.json`
- Restart the Foundry server (browser reload is not enough)

### Players do not see overlays
- Make sure the module is activated in the World
- All players must reload after installation

### Monk’s actions don’t appear in Tile config
- Make sure **Monk’s Active Tile Triggers** is installed and activated
- Reload the world after enabling modules
- Re-open the tile config window (the action list may not refresh live)

---

## 🧠 How It Works

1. The module registers a SocketLib module socket.
2. Two handlers are registered:
   - `showScroll`
   - `showCenter`
3. The GM triggers overlays either by:
   - **Macro:** `executeForEveryone(...)`
   - **MATT Tile Action:** the action calls the same socket handlers
4. All connected clients render the overlay locally.

---

## 📜 License

[GENERAL PUBLIC LICENSE](https://github.com/striker-sys/nexus-broadcast-vtt?tab=GPL-3.0-1-ov-file)
[FOUNDRY LIZENZ](https://foundryvtt.com/article/license/)

---

## 💡 Planned Enhancements

- More presets (Star Wars crawl, chapter cards, alerts)
- Per-user styling overrides (GM vs players)
- Optional sound triggers
- More MATT targeting options & presets

---

Created for immersive storytelling in Foundry VTT.
