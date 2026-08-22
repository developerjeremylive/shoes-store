// auth.js — Módulo de autenticación para el CMS de SoleStyle.
// Credenciales: admin / admin. Sesión persistente en localStorage.

const AUTH_KEY = 'solestyle_auth';
const VALID_USER = 'admin';
const VALID_PASS = 'admin';

// Inicia sesión con las credenciales proporcionadas.
export function login(username, password) {
  if (username === VALID_USER && password === VALID_PASS) {
    const session = { user: username, ts: Date.now() };
    try {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    } catch (e) { /* localStorage no disponible */ }
    return true;
  }
  return false;
}

// Verifica si hay una sesión activa válida.
export function isLoggedIn() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return session?.user === VALID_USER;
  } catch {
    return false;
  }
}

// Cierra la sesión actual.
export function logout() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch (e) { /* silencioso */ }
}

// Obtiene el nombre del usuario actual (o null).
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.user || null;
  } catch {
    return null;
  }
}
