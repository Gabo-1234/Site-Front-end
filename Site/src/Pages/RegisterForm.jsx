import { useState } from "react";
import { API_URL } from "../Admin/api";

export default function RegisterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	async function handleSubmit(event) {
		event.preventDefault();
		setMessage("");
		setError("");
		try {
			const response = await fetch(`${API_URL}/api/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			});
			const data = await response.json();
			if (!response.ok) {
				setError(data.message || "Registration failed.");
				return;
			}
			setMessage(`გამარჯობა, ${data.user.name}`);
			setName("");
			setEmail("");
			setPassword("");
		} catch (requestError) {
			setError(requestError.message || "სერვერთან დაკავშირება ვერ მოხერხდა.");
		}
	}

	return (
		<section className="register-section" id="register">
			<div>
				<p className="eyebrow">Join the flight crew</p>
				<h2>Build your next setup with us.</h2>
				<p>Create an account to keep your favorite parts close.</p>
			</div>
			<form className="register-form" onSubmit={handleSubmit}>
				<label>Name<input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} /></label>
				<label>Email<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
				<label>Password<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
				<button className="button button-primary">Create account</button>
				{error && <p className="form-message error" role="alert">{error}</p>}
				{message && <p className="form-message success" role="status">{message}</p>}
			</form>
		</section>
	);
}
