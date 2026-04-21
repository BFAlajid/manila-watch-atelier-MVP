// Registers the PWA service worker on window load.
// Extracted from index.html so the CSP can drop script-src 'unsafe-inline'.
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {
        // Best-effort registration — swallow errors quietly.
      });
    });
  }
})();
