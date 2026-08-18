import { NavigateFunction } from "react-router-dom";

const REDIRECT_KEY = "redirectAfterLogin";

/** Redirect to the login page, remembering where to return after login. */
export const goToLogin = (navigate: NavigateFunction, from: string) => {
  sessionStorage.setItem(REDIRECT_KEY, from);
  navigate(`/login?redirect=${encodeURIComponent(from)}`);
};

/** Read the page the user came from, if any. */
export const getLoginRedirect = (): string | null => {
  const fromQuery = new URLSearchParams(window.location.search).get("redirect");
  if (fromQuery && fromQuery.startsWith("/")) return fromQuery;
  return null;
};

/** Persist the intended destination for the Google OAuth round-trip. */
export const saveRedirectForOAuth = () => {
  const from = getLoginRedirect();
  if (from) sessionStorage.setItem(REDIRECT_KEY, from);
};

/** Restore the saved destination after login. Returns true if handled. */
export const consumeRedirect = (): string | null => {
  const saved = sessionStorage.getItem(REDIRECT_KEY);
  if (saved) {
    sessionStorage.removeItem(REDIRECT_KEY);
    return saved.startsWith("/") ? saved : null;
  }
  return null;
};