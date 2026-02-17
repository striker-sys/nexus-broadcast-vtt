if (!game.user.isGM) return ui.notifications.warn("Nur der GM kann senden.");

const sock = game["nexus-overlay_socket"];
if (!sock) return ui.notifications.error("Socket nicht bereit. Foundry neu starten?");

const text = `
<h1>Der Nexusstein erwacht…</h1>
<p>Ein leises Beben durchzieht die Erde.</p>
<p>Arkane Energie sammelt sich im Zentrum der Kammer.</p>
<p><i>Etwas Uraltes öffnet die Augen.</i></p>
`;

// Hier anpassen:
await sock.executeForEveryone("showScroll", {
  html: text,

  durationSeconds: 15,   // Basisdauer in Sekunden
  speedPercent: 120,     // 100 normal, 200 schneller, 50 langsamer

  fontSize: 48,          // Schrift Größe Standard 48
  width: "80%",          // Breite des Textes auf dem Bildschirm

  fadeInMs: 900,         // Einblendezeit in Millisekunden.
  fadeOutMs: 1200        // Ausblendezeit in Millisekunden.
});
