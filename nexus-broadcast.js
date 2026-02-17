/* =====================================================================================
 * Nexus Overlay (Foundry V13) - SocketLib receiver + helper (ROBUST INIT)
 * ===================================================================================== */

const MODULE_ID = "nexus-overlay";

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
  // Schon da?
  if (game[`${MODULE_ID}_socket`]) return true;

  // SocketLib aktiv?
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

    // Sichtbarer Hinweis (nur GM)
    if (game.user?.isGM) ui.notifications.info("Nexus Overlay: Socket registriert ✅");
    console.log(`[${MODULE_ID}] Socket registriert ✅`);

    return true;
  } catch (e) {
    console.error(`[${MODULE_ID}] Socket init fehlgeschlagen:`, e);
    return false;
  }
}

// Debug: manuell aus der Konsole aufrufbar
Hooks.once("init", () => {
  game.nexusOverlayInit = initNexusOverlaySocket;
  console.log(`[${MODULE_ID}] Modul geladen (init).`);
});

// 1) Normal: wenn SocketLib meldet „ready“
Hooks.once("socketlib.ready", () => initNexusOverlaySocket());

// 2) Fallback: wenn socketlib.ready schon vorbei war, versuchen wir es nach World-Ready + retries
Hooks.once("ready", () => {
  let tries = 0;
  const maxTries = 10;

  const t = setInterval(() => {
    tries += 1;
    const ok = initNexusOverlaySocket();
    if (ok || tries >= maxTries) clearInterval(t);
  }, 500);
});
