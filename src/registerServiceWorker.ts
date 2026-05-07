export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || import.meta.env.DEV) return;
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(
      "/reaction-diffusion-patternmaker/sw.js",
    );
  });
}
