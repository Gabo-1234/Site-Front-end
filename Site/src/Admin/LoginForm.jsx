import { useState } from "react";
import { API_URL, saveAdminSession } from "./api";

export default function LoginForm({ onLogin }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		setLoading(true);
		try {
			const response = await fetch(`${API_URL}/api/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await response.json();
			if (!response.ok) {
				setError(data.message || "Could not sign in.");
				return;
			}
			if (data.user.role !== "admin") {
				setError("This account does not have admin access.");
				return;
			}
			saveAdminSession(data.token, data.user);
			onLogin(data.user);
		} catch (requestError) {
			setError(requestError.message || "Could not connect to the server.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="admin-login">
			<a className="back-home" href="/">RotorLab</a>
			<form onSubmit={handleSubmit} className="admin-login-form">
				<p className="eyebrow">RotorLab administration</p>
				<h1>Sign in</h1>
				<label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
				<label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
				{error && <p className="form-message error" role="alert">{error}</p>}
				<button className="button button-primary" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
			</form>
		</main>
	);
}
