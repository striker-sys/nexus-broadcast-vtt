/* =====================================================================================
 * Nexus Broadcast (Foundry V13) - SocketLib receiver + helper (ROBUST INIT)
 * + Monk's Active Tile Triggers (MATT) Integration (optional)
 *   -> IMPORTANT FIX: register via Hooks.on("setupTileActions", ...)
 *   -> Fade times in SECONDS in MATT UI (converted to ms internally)
 * ===================================================================================== */

const MODULE_ID = "nexus-broadcast";

// ---------------------------
// Overlay Helpers
// ---------------------------
function removeOverlay(id) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
}

function showScrollOverlay(payload = {}) {
  const {
    html = "",

    durationMs = null,
    durationSeconds = null,
    speedPercent = 100,

    fontSize = 48,
    color = "#ffffff",
    shadow = "0 0 20px #000000",
    width = "80%",

    fadeInMs = 1200,
    fadeOutMs = 1200,

    startTransform = "translate(-50%, 50%)",
    endTransform = "translate(-50%, -200%)"
  } = payload;

  const baseMs =
    typeof durationMs === "number" ? durationMs :
    typeof durationSeconds === "number" ? durationSeconds * 1000 :
    15000;

  const sp = Math.max(1, Number(speedPercent) || 100);
  const effectiveDurationMs = Math.max(250, baseMs * (100 / sp));

  const overlayId = "nexus-scrolling-text-overlay";
  removeOverlay(overlayId);

  const overlay = document.createElement("div");
  overlay.id = overlayId;

  overlay.style.position = "fixed";
  overlay.style.top = "50%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
  overlay.style.width = width;
  overlay.style.textAlign = "center";
  overlay.style.fontSize = `${fontSize}px`;
  overlay.style.color = color;
  overlay.style.textShadow = shadow;
  overlay.style.zIndex = 10000;
  overlay.style.pointerEvents = "none";

  overlay.style.opacity = "0";
  overlay.style.transition = `opacity ${fadeInMs}ms ease`;

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  setTimeout(() => (overlay.style.opacity = "1"), 50);

  overlay.animate(
    [{ transform: startTransform }, { transform: endTransform }],
    { duration: effectiveDurationMs, easing: "linear" }
  );

  const fo = Math.max(0, Number(fadeOutMs) || 0);
  const fadeOutStart = Math.max(0, effectiveDurationMs - fo);
  setTimeout(() => {
    overlay.style.transition = `opacity ${fo}ms ease`;
    overlay.style.opacity = "0";
  }, fadeOutStart);

  setTimeout(() => overlay.remove(), effectiveDurationMs + 50);
}

function showCenterOverlay(payload = {}) {
  const {
    html = "",

    displaySeconds = null,
    displayMs = null,

    width = "50%",
    fontSize = 44,
    color = "#ffffff",
    shadow = "0 0 20px #000000",
    background = "transparent",
    padding = "0.35em 0.6em",
    borderRadius = "12px",

    fadeInMs = 250,
    fadeOutMs = 800
  } = payload;

  const totalMs =
    typeof displayMs === "number" ? displayMs :
    typeof displaySeconds === "number" ? displaySeconds * 1000 :
    6000;

  const overlayId = "nexus-center-text-overlay";
  removeOverlay(overlayId);

  const overlay = document.createElement("div");
  overlay.id = overlayId;

  overlay.style.position = "fixed";
  overlay.style.top = "50%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
  overlay.style.width = width;
  overlay.style.textAlign = "center";
  overlay.style.zIndex = 10000;
  overlay.style.pointerEvents = "none";

  overlay.style.fontSize = `${fontSize}px`;
  overlay.style.color = color;
  overlay.style.textShadow = shadow;
  overlay.style.background = background;
  overlay.style.padding = padding;
  overlay.style.borderRadius = borderRadius;

  overlay.style.opacity = "0";
  overlay.style.transition = `opacity ${fadeInMs}ms ease`;

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  setTimeout(() => (overlay.style.opacity = "1"), 50);

  const fo = Math.max(0, Number(fadeOutMs) || 0);
  const fadeOutStart = Math.max(0, totalMs - fo);
  setTimeout(() => {
    overlay.style.transition = `opacity ${fo}ms ease`;
    overlay.style.opacity = "0";
  }, fadeOutStart);

  setTimeout(() => overlay.remove(), totalMs + 50);
}

// ---------------------------
// SocketLib Init (ROBUST)
// ---------------------------
function initNexusOverlaySocket() {
  if (game[`${MODULE_ID}_socket`]) return true;

  if (!game.modules.get("socketlib")?.active) {
    console.warn(`[${MODULE_ID}] SocketLib ist nicht aktiv.`);
    return false;
  }
  if (typeof socketlib === "undefined") {
    console.warn(`[${MODULE_ID}] socketlib global ist noch nicht verfügbar.`);
    return false;
  }

  try {
    const sock = socketlib.registerModule(MODULE_ID);

    sock.register("showScroll", (payload) => showScrollOverlay(payload));
    sock.register("showCenter", (payload) => showCenterOverlay(payload));

    game[`${MODULE_ID}_socket`] = sock;

    if (game.user?.isGM) ui.notifications.info("Nexus Broadcast: Socket registriert ✅");
    console.log(`[${MODULE_ID}] Socket registriert ✅`);
    return true;
  } catch (e) {
    console.error(`[${MODULE_ID}] Socket init fehlgeschlagen:`, e);
    return false;
  }
}

// ---------------------------
// MATT Integration
// ---------------------------

function isMATTActive() {
  return !!game.modules.get("monks-active-tiles")?.active;
}

// In MATT ist der "richtige" Einstieg: Hook "setupTileActions"
function isMATTApiAvailable(matt) {
  return (
    matt &&
    typeof matt.registerTileGroup === "function" &&
    typeof matt.registerTileAction === "function"
  );
}

function ensureSocketReady() {
  if (game[`${MODULE_ID}_socket`]) return true;
  if (typeof game.nexusOverlayInit === "function") return !!game.nexusOverlayInit();
  return false;
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : Number(fallback);
}
function toMsFromSeconds(value, fallbackSeconds) {
  const sec = toNumber(value, fallbackSeconds);
  return Math.max(0, sec * 1000);
}

async function resolveValue(matt, value, args) {
  try {
    if (typeof matt.getValue === "function") return await matt.getValue(value, args);
  } catch (e) {
    console.warn(`[${MODULE_ID}] MATT getValue failed:`, e);
  }
  return value;
}

function getUsersFor(matt, showto, args) {
  try {
    if (typeof matt.getForPlayers === "function") return matt.getForPlayers(showto, args);
  } catch (e) {
    console.warn(`[${MODULE_ID}] MATT getForPlayers failed:`, e);
  }
  return game.users?.contents ?? [];
}

function registerMonksActiveTilesActions(matt) {
  // Doppelt registrieren verhindern
  if (game[`${MODULE_ID}_mattRegistered`]) return true;

  // Namespace muss als Modul existieren (MATT prüft das intern)
  if (!game.modules.get(MODULE_ID)) return false;

  if (!isMATTActive()) return false;

  // matt kommt idealerweise aus dem Hook-Parameter, sonst fallback
  matt = matt ?? game.MonksActiveTiles ?? globalThis.MonksActiveTiles;
  if (!isMATTApiAvailable(matt)) return false;

  // Gruppe (Kategorie) anlegen
  matt.registerTileGroup(MODULE_ID, "Nexus Broadcast");

  const showtoValues = {
    everyone: "Everyone",
    players: "Players",
    gm: "GM",
    trigger: "Triggering User",
    owner: "Token Owner"
  };

  // ---------------------------
  // Action: Scroll (Fade in SECONDS)
  // ---------------------------
  matt.registerTileAction(MODULE_ID, "scroll", {
    group: MODULE_ID,
    name: "Nexus Broadcast: Scroll",
    ctrls: [
      { id: "html", name: "HTML", type: "text", required: true },

      { id: "durationSeconds", name: "Duration (s)", type: "number", defvalue: 15, min: 1, max: 600, step: 1 },
      { id: "speedPercent", name: "Speed (%)", type: "number", defvalue: 100, min: 1, max: 1000, step: 1 },

      { id: "fontSize", name: "Font Size", type: "number", defvalue: 48, min: 8, max: 200, step: 1 },
      { id: "width", name: "Width (CSS)", type: "text", defvalue: "80%" },

      // CHANGED: seconds
      { id: "fadeInSeconds", name: "Fade In (s)", type: "number", defvalue: 1.2, min: 0, max: 60, step: 0.1 },
      { id: "fadeOutSeconds", name: "Fade Out (s)", type: "number", defvalue: 1.2, min: 0, max: 60, step: 0.1 },

      { id: "showto", name: "For", type: "list", list: "showto", defvalue: "everyone" }
    ],
    values: { showto: showtoValues },
    fn: async (args = {}) => {
      const { action } = args;
      if (!action?.data) return;

      if (!ensureSocketReady()) return;
      const sock = game[`${MODULE_ID}_socket`];
      if (!sock) return;

      const html = await resolveValue(matt, action.data.html, args);
      const showto = action.data.showto ?? "everyone";
      const users = getUsersFor(matt, showto, args);

      const payload = {
        html,
        durationSeconds: toNumber(action.data.durationSeconds, 15),
        speedPercent: toNumber(action.data.speedPercent, 100),
        fontSize: toNumber(action.data.fontSize, 48),
        width: action.data.width ?? "80%",

        // seconds -> ms
        fadeInMs: toMsFromSeconds(action.data.fadeInSeconds, 1.2),
        fadeOutMs: toMsFromSeconds(action.data.fadeOutSeconds, 1.2)
      };

      if (typeof sock.executeForUsers === "function" && Array.isArray(users) && users.length) {
        return await sock.executeForUsers("showScroll", users, payload);
      }
      return await sock.executeForEveryone("showScroll", payload);
    }
  });

  // ---------------------------
  // Action: Center (Fade in SECONDS)
  // ---------------------------
  matt.registerTileAction(MODULE_ID, "center", {
    group: MODULE_ID,
    name: "Nexus Broadcast: Center",
    ctrls: [
      { id: "html", name: "HTML", type: "text", required: true },

      { id: "displaySeconds", name: "Display (s)", type: "number", defvalue: 6, min: 1, max: 600, step: 1 },

      { id: "fontSize", name: "Font Size", type: "number", defvalue: 44, min: 8, max: 200, step: 1 },
      { id: "width", name: "Width (CSS)", type: "text", defvalue: "50%" },

      // CHANGED: seconds
      { id: "fadeInSeconds", name: "Fade In (s)", type: "number", defvalue: 0.25, min: 0, max: 60, step: 0.1 },
      { id: "fadeOutSeconds", name: "Fade Out (s)", type: "number", defvalue: 0.8, min: 0, max: 60, step: 0.1 },

      { id: "showto", name: "For", type: "list", list: "showto", defvalue: "everyone" }
    ],
    values: { showto: showtoValues },
    fn: async (args = {}) => {
      const { action } = args;
      if (!action?.data) return;

      if (!ensureSocketReady()) return;
      const sock = game[`${MODULE_ID}_socket`];
      if (!sock) return;

      const html = await resolveValue(matt, action.data.html, args);
      const showto = action.data.showto ?? "everyone";
      const users = getUsersFor(matt, showto, args);

      const payload = {
        html,
        displaySeconds: toNumber(action.data.displaySeconds, 6),
        fontSize: toNumber(action.data.fontSize, 44),
        width: action.data.width ?? "50%",

        // seconds -> ms
        fadeInMs: toMsFromSeconds(action.data.fadeInSeconds, 0.25),
        fadeOutMs: toMsFromSeconds(action.data.fadeOutSeconds, 0.8)
      };

      if (typeof sock.executeForUsers === "function" && Array.isArray(users) && users.length) {
        return await sock.executeForUsers("showCenter", users, payload);
      }
      return await sock.executeForEveryone("showCenter", payload);
    }
  });

  game[`${MODULE_ID}_mattRegistered`] = true;
  console.log(`[${MODULE_ID}] MATT Actions registriert ✅`);
  if (game.user?.isGM) ui.notifications.info("Nexus Broadcast: MATT Actions registriert ✅");
  return true;
}

/**
 * ✅ THE IMPORTANT PART:
 * MATT ruft beim Start Hooks.call("setupTileActions", this) auf.
 * Genau hier registrieren wir unsere Actions.
 */
Hooks.on("setupTileActions", (matt) => {
  try {
    registerMonksActiveTilesActions(matt);
  } catch (e) {
    console.error(`[${MODULE_ID}] setupTileActions hook failed:`, e);
  }
});

// ---------------------------
// Hooks (dein ursprüngliches init/ready handling)
// ---------------------------

Hooks.once("init", () => {
  game.nexusOverlayInit = initNexusOverlaySocket;
  game.nexusRegisterMATT = registerMonksActiveTilesActions; // Debug
  console.log(`[${MODULE_ID}] Modul geladen (init).`);
});

// 1) Normal: wenn SocketLib meldet „ready“
Hooks.once("socketlib.ready", () => initNexusOverlaySocket());

// 2) Fallback: wenn socketlib.ready schon vorbei war. World-Ready + retries
Hooks.once("ready", () => {
  let tries = 0;
  const maxTries = 30; // erhöht, falls MATT später initialisiert

  const t = setInterval(() => {
    tries += 1;

    // Socket init
    const ok = initNexusOverlaySocket();

    // Fallback: falls setupTileActions verpasst wurde oder MATT spät lädt
    if (!game[`${MODULE_ID}_mattRegistered`]) {
      registerMonksActiveTilesActions();
    }

    if ((ok && game[`${MODULE_ID}_mattRegistered`]) || tries >= maxTries) clearInterval(t);
  }, 500);
});
