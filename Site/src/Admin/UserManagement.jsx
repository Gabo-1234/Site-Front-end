import { useEffect, useState } from "react";
import { API_URL, authFetch } from "./api";

export default function UserManagement({ currentUserId }) {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [error, setError] = useState("");
	const [reloadKey, setReloadKey] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		const params = new URLSearchParams({ page: "1", limit: "50" });
		if (search.trim()) params.set("search", search.trim());
		authFetch(`${API_URL}/api/admin/users?${params}`, { signal: controller.signal })
			.then(async (response) => {
				const data = await response.json();
				if (!response.ok) throw new Error(data.message || "Could not load users.");
				if (!controller.signal.aborted) setUsers(Array.isArray(data) ? data : data.items);
			})
			.catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message); });
		return () => controller.abort();
	}, [search, reloadKey]);

	async function updateUser(user, path, body) {
		setError("");
		try {
			const response = await authFetch(`${API_URL}/api/admin/users/${user._id}/${path}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Could not update user.");
			setReloadKey((value) => value + 1);
		} catch (requestError) {
			setError(requestError.message || "Could not update user.");
		}
	}

	return (
		<section className="admin-users">
			<div className="admin-section-heading"><div><p className="eyebrow">Access and accounts</p><h2>Users</h2></div></div>
			<label className="user-search">Search by name or email<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." /></label>
			{error && <p className="form-message error" role="alert">{error}</p>}
			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
					<tbody>{users.map((user) => (
						<tr key={user._id}>
							<td>{user.name}{user._id === currentUserId && <small> (you)</small>}</td><td>{user.email}</td><td>{user.role}</td><td>{user.isBlocked ? "Blocked" : "Active"}</td>
							<td className="table-actions">
								{user._id !== currentUserId && <>
									<button type="button" onClick={() => updateUser(user, "role", { role: user.role === "admin" ? "customer" : "admin" })}>{user.role === "admin" ? "Make customer" : "Make admin"}</button>
									<button type="button" onClick={() => updateUser(user, "block", { isBlocked: !user.isBlocked })}>{user.isBlocked ? "Unblock" : "Block"}</button>
								</>}
							</td>
						</tr>
					))}</tbody>
				</table>
				{users.length === 0 && <p className="admin-empty">No users found.</p>}
			</div>
		</section>
	);
}
