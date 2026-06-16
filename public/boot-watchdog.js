(function () {
  // Runs before the main app bundle. If the big JS bundle never finishes
  // loading/executing (e.g. the device woke from sleep and the network
  // hadn't reconnected yet), React never mounts and the static "Loading"
  // HTML just sits there forever with nothing alive to recover it. The app
  // marks window.__appBooted once it actually starts running; if that never
  // happens within this window, force a reload to retry against (hopefully)
  // a live connection.
  window.__appBooted = false;
  setTimeout(function () {
    if (!window.__appBooted) {
      location.reload();
    }
  }, 12000);
})();
