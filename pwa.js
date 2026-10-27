(() => {
  if (!window.isSecureContext || !("serviceWorker" in navigator)) return;

  // Relative paths also support deployment in a GitHub Pages repository folder.
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.warn("Não foi possível habilitar o uso offline.", error);
  });
})();
