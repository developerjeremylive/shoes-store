// router.js — Utilidades de URL: lectura de parámetros, reescritura de search y popstate.

// Lee un parámetro de la query string actual (null si no existe).
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Reescribe la query string con history.replaceState preservando el hash.
export function setParams(params) {
  const url = new URL(window.location.href);
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  url.search = search.toString();
  window.history.replaceState({}, '', url.toString());
}

// Registra un listener de popstate (navegación atrás/adelante).
export function onPopState(fn) {
  window.addEventListener('popstate', fn);
}