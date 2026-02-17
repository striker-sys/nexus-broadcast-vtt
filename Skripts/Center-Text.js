if (!game.user.isGM) return ui.notifications.warn("Nur der GM kann senden.");

const sock = game["nexus-overlay_socket"];
if (!sock) return ui.notifications.error("Socket nicht bereit. Foundry neu starten?");

const text = `
<h2>Warnung</h2>
<p><i>Die Luft wird kalt…</i></p>
<p><b>Roll Initiative!</b></p>
`;

await sock.executeForEveryone("showCenter", {
  html: text,

  displaySeconds: 6,      // Anzeige zeit in Sekunden
  width: "50%",           // Breite der Anzeige im verhältniss zum Bildschirm
  fontSize: 44,           // Schriftgröße

  fadeInMs: 200,          // Einblendezeit in Millisekunden.
  fadeOutMs: 900,         // Ausblendezeit in Millisekunden.

  background: "transparent" // z.B. "rgba(0,0,0,0.35)"
});
