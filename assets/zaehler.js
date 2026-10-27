/* Besucherzählung mit GoatCounter (anonym, ohne Cookies).
   Gezählt wird der Pfad mit Adresse, z. B. „mibaso.de/schule/“.
   Einbinden vor </head>:  <script src="/assets/zaehler.js" defer></script>  */
(function () {
  if (window.__mibasoZaehler) return;
  window.__mibasoZaehler = true;
  window.goatcounter = { path: function (p) { return location.host + p } };
  var gc = document.createElement('script');
  gc.async = true;
  gc.src = '//gc.zgo.at/count.js';
  gc.setAttribute('data-goatcounter', 'https://mibaso.goatcounter.com/count');
  document.head.appendChild(gc);
})();
