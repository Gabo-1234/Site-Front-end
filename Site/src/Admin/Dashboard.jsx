import { useEffect, useState } from "react";
import { API_URL, authFetch } from "./api";

const cards = [
	{ key: "productCount", label: "Total products" },
	{ key: "activeProductCount", label: "Active products" },
	{ key: "categoryCount", label: "Product categories" },
	{ key: "customerCount", label: "Customers" },
];

export default function Dashboard() {
	const [stats, setStats] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;
		authFetch(`${API_URL}/api/admin/stats`)
			.then(async (response) => {
				const data = await response.json();
				if (!response.ok) throw new Error(data.message || "Could not load dashboard.");
				if (!cancelled) setStats(data);
			})
			.catch((requestError) => { if (!cancelled) setError(requestError.message); });
		return () => { cancelled = true; };
	}, []);

	return (
		<section className="admin-dashboard">
			<div className="admin-section-heading"><div><p className="eyebrow">Store overview</p><h1>Dashboard</h1></div></div>
			{error && <p className="form-message error" role="alert">{error}</p>}
			<div className="stats-grid">{cards.map((card) => <article className="stat-card" key={card.key}><span>{card.label}</span><strong>{stats ? stats[card.key] : "—"}</strong></article>)}</div>
		</section>
	);
}
