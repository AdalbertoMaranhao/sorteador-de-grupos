(() => {
  if (!window.isSecureContext || !("serviceWorker" in navigator)) return;

  const panel = document.querySelector("#install-panel");
  const button = document.querySelector("#install-button");
  const help = document.querySelector("#install-help");
  const status = document.querySelector("#install-status");
  const standalone = window.matchMedia("(display-mode: standalone)");
  let installPrompt = null;
  let installed = false;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    help.textContent = "No Safari, toque em Compartilhar e em Adicionar à Tela de Início. Confirme em Adicionar. Após o primeiro acesso, você também pode usar sem internet.";
  }

  function updateInstallPanel() {
    panel.hidden = installed || standalone.matches || navigator.standalone === true;
    button.hidden = panel.hidden || !installPrompt;
  }

  updateInstallPanel();
  standalone.addEventListener("change", updateInstallPanel);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    status.textContent = "";
    updateInstallPanel();
  });

  button.addEventListener("click", async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    button.hidden = true;

    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") {
        panel.hidden = true;
      }
    } catch (error) {
      status.textContent = "Use o menu do navegador para instalar o aplicativo.";
      console.warn("Não foi possível abrir a instalação.", error);
    }
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    installPrompt = null;
    updateInstallPanel();
  });

  // Relative paths also support deployment in a GitHub Pages repository folder.
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.warn("Não foi possível habilitar o uso offline.", error);
  });
})();
