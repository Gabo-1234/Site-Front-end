export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export function getAdminToken() {
	return window.localStorage.getItem("rotorlab-admin-token");
}

export function saveAdminSession(token, user) {
	window.localStorage.setItem("rotorlab-admin-token", token);
	window.localStorage.setItem("rotorlab-admin-user", JSON.stringify(user));
}

export function clearAdminSession() {
	window.localStorage.removeItem("rotorlab-admin-token");
	window.localStorage.removeItem("rotorlab-admin-user");
}

export function authFetch(url, options = {}) {
	const headers = new Headers(options.headers || {});
	const token = getAdminToken();
	if (token) headers.set("Authorization", `Bearer ${token}`);
	return fetch(url, { ...options, headers });
}
