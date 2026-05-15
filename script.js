// Minimal Windows Bio Template JS
// Kept intentionally small so the site remains GitHub Pages-friendly.

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#site-nav");
const clock = document.querySelector("#clock");
const updatedDate = document.querySelector("#updated-date");
const widgetControls = document.querySelectorAll(".widget-control");
const siteMusic = document.querySelector("#site-music");
const musicVolume = document.querySelector("#music-volume");
const syncedPanels = document.querySelectorAll(".sync-panel");

function updateClock() {
  if (!clock) return;

  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setUpdatedDate() {
  if (!updatedDate) return;

  const now = new Date();
  updatedDate.textContent = now.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function setupMobileMenu() {
  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    const clickedLink = event.target.closest("a");
    if (!clickedLink) return;

    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
}

function setupWindowControls() {
  const toggleButtons = document.querySelectorAll(".window-toggle");

  function setWindowCollapsed(win, isCollapsed) {
    const button = win.querySelector(".window-toggle");
    if (!button) return;

    const defaultLabel = button.getAttribute("aria-label") || "Minimize window";
    const minimizeLabel = defaultLabel.replace("Restore", "Minimize");
    const restoreLabel = minimizeLabel.replace("Minimize", "Restore");

    win.classList.toggle("is-collapsed", isCollapsed);
    button.setAttribute("aria-expanded", String(!isCollapsed));
    button.setAttribute("aria-label", isCollapsed ? restoreLabel : minimizeLabel);
    syncPanelHeights();
  }

  toggleButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();

      const win = button.closest(".window");
      if (!win) return;

      setWindowCollapsed(win, !win.classList.contains("is-collapsed"));
    });
  });

  widgetControls.forEach((button) => {
    button.addEventListener("click", () => {
      const shouldCollapse = button.dataset.widgetAction === "minimize";
      document.querySelectorAll(".window:not(.intro-side-card)").forEach((win) => {
        setWindowCollapsed(win, shouldCollapse);
      });
    });
  });
}

function syncPanelHeights() {
  if (!syncedPanels.length) return;

  syncedPanels.forEach((panel) => {
    panel.style.minHeight = "";
  });

  if (window.matchMedia("(max-width: 820px)").matches) return;

  const expandedPanels = Array.from(syncedPanels).filter(
    (panel) => !panel.classList.contains("is-collapsed")
  );
  if (!expandedPanels.length) return;

  const tallestPanel = Math.max(...expandedPanels.map((panel) => panel.offsetHeight));
  expandedPanels.forEach((panel) => {
    panel.style.minHeight = `${tallestPanel}px`;
  });
}

function setupSiteMusic() {
  if (!siteMusic || !musicVolume) return;

  const audioControl = musicVolume.closest(".audio-control");
  const volumeReadout = audioControl?.querySelector(".volume-readout");

  function syncVolume() {
    siteMusic.volume = Number(musicVolume.value) / 100;
    if (volumeReadout) {
      volumeReadout.textContent = `${musicVolume.value}%`;
    }
  }

  function playMusic() {
    siteMusic.play().catch(() => {
      document.addEventListener("click", playMusic, { once: true });
      document.addEventListener("keydown", playMusic, { once: true });
      document.addEventListener("touchstart", playMusic, { once: true });
    });
  }

  syncVolume();
  playMusic();

  musicVolume.addEventListener("input", () => {
    syncVolume();
    playMusic();
  });

  musicVolume.addEventListener("pointerdown", () => {
    audioControl?.classList.add("is-adjusting");
  });

  document.addEventListener("pointerup", () => {
    audioControl?.classList.remove("is-adjusting");
  });

  musicVolume.addEventListener("pointercancel", () => {
    audioControl?.classList.remove("is-adjusting");
  });
}

function setupTallyEmbeds() {
  const tallyScriptSrc = "https://tally.so/widgets/embed.js";

  function loadEmbeds() {
    if (typeof Tally !== "undefined") {
      Tally.loadEmbeds();
      return;
    }

    document.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((iframe) => {
      iframe.src = iframe.dataset.tallySrc;
    });
  }

  if (typeof Tally !== "undefined") {
    loadEmbeds();
    return;
  }

  if (document.querySelector(`script[src="${tallyScriptSrc}"]`)) return;

  const script = document.createElement("script");
  script.src = tallyScriptSrc;
  script.onload = loadEmbeds;
  script.onerror = loadEmbeds;
  document.body.appendChild(script);
}

updateClock();
setUpdatedDate();
setupMobileMenu();
setupWindowControls();
setupSiteMusic();
setupTallyEmbeds();
syncPanelHeights();

window.addEventListener("resize", syncPanelHeights);
setInterval(updateClock, 30_000);
