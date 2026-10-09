// Every API call the app makes, in one place, so screens never build URLs.

import { apiDelete, apiGet, apiPatch, apiPost, queryString } from "./api";
import { clearTokens, setTokens } from "./auth";

/* ---------------------------------------------------------------- auth --- */

export async function login({ email, password }) {
  const data = await apiPost("/api/auth/login/", { email, password }, { auth: false });
  setTokens({ access: data.access, refresh: data.refresh });
  return data;
}

export async function register({ firstName, lastName, email, password, role }) {
  return apiPost(
    "/api/auth/register/",
    {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role,
    },
    { auth: false }
  );
}

/** Register then sign in, so the user lands logged in. */
export async function registerAndLogin(form) {
  await register(form);
  return login({ email: form.email, password: form.password });
}

export function logout() {
  clearTokens();
}

export const getMe = () => apiGet("/api/auth/me/");

export const updateMe = (fields) => apiPatch("/api/auth/me/", fields);

export const changePassword = ({ currentPassword, newPassword }) =>
  apiPost("/api/auth/password-change/", {
    current_password: currentPassword,
    new_password: newPassword,
  });

export const requestPasswordReset = (email) =>
  apiPost("/api/auth/password-reset/", { email }, { auth: false });

export const confirmPasswordReset = ({ uid, token, newPassword }) =>
  apiPost(
    "/api/auth/password-reset/confirm/",
    { uid, token, new_password: newPassword },
    { auth: false }
  );

/* --------------------------------------------------------------- ideas --- */

/** The public marketplace. Readable signed out, so auth is off. */
export const listIdeas = (filters = {}) =>
  apiGet(`/api/ideas/${queryString(filters)}`, { auth: false });

export const getIdea = (id) => apiGet(`/api/ideas/${id}/`);

export const submitIdea = (payload) => apiPost("/api/ideas/submit/", payload);

export const updateIdea = (id, fields) => apiPatch(`/api/ideas/${id}/`, fields);

export const deleteIdea = (id) => apiDelete(`/api/ideas/${id}/`);

export const publishIdea = (id) => apiPost(`/api/ideas/${id}/publish/`);

export const unpublishIdea = (id) => apiDelete(`/api/ideas/${id}/publish/`);

export const listMyIdeas = (filters = {}) =>
  apiGet(`/api/ideas/mine/${queryString(filters)}`);

export const getDashboardStats = () => apiGet("/api/ideas/dashboard/stats/");

/* --------------------------------------------------------- connections --- */

export const requestConnection = (ideaId) =>
  apiPost(`/api/connections/request/${ideaId}/`);

export const listConnections = () => apiGet("/api/connections/");

export const respondToConnection = (id, action) =>
  apiPost(`/api/connections/${id}/${action}/`);

/* ------------------------------------------------------- notifications --- */

export const listNotifications = (filters = {}) =>
  apiGet(`/api/notifications/${queryString(filters)}`);

export const getUnreadCount = () => apiGet("/api/notifications/unread-count/");

export const markNotificationRead = (id) => apiPost(`/api/notifications/${id}/read/`);

export const markAllNotificationsRead = () => apiPost("/api/notifications/read-all/");
