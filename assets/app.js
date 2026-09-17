/* Gemeinsamer App-Baustein für Media Mibaso:
   Service-Worker-Registrierung + vollautomatische Aktualisierung (analog Flora/Fauna).
   Die App prüft beim Öffnen, bei Rückkehr zur App und alle 3 Minuten, ob eine
   neue Version vorliegt, übernimmt sie sofort und lädt die Seite einmal sanft
   neu — ohne Knopf, ohne Banner.
   Einbinden mit:  <script src="/assets/app.js" defer></script>  */
(function () {
  if (!('serviceWorker' in navigator)) return;

  var refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (refreshing) return; refreshing = true; window.location.reload();
  });

  // Wartet eine neue Version? Dann sofort aktivieren (löst controllerchange aus).
  function uebernehmen(reg) {
    if (reg && reg.waiting && navigator.serviceWorker.controller) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      // Failsafe (iPhone/iPad): falls controllerchange ausbleibt, trotzdem neu laden.
      setTimeout(function () { if (!refreshing) { refreshing = true; window.location.reload(); } }, 1500);
    }
  }

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(function (reg) {
      uebernehmen(reg);
      reg.addEventListener('updatefound', function () {
        var neu = reg.installing; if (!neu) return;
        neu.addEventListener('statechange', function () {
          if (neu.state === 'installed') uebernehmen(reg);
        });
      });
      // Nach Neuigkeiten schauen: jetzt, bei Rückkehr zur App und alle 3 Minuten.
      reg.update();
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') reg.update();
      });
      // iPhone/iPad: beim Zurückkehren zur App feuert visibilitychange nicht
      // immer – deshalb zusätzlich bei pageshow und focus nachsehen.
      window.addEventListener('pageshow', function () { reg.update(); });
      window.addEventListener('focus', function () { reg.update(); });
      setInterval(function () { reg.update(); }, 3 * 60 * 1000);
    }).catch(function () {});
  });
})();
