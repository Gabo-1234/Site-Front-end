import { useEffect, useState } from "react";
import RegisterForm from "./RegisterForm";
import { API_URL } from "../Admin/api";
import "./MainPage.css";

const Home = () => {
	const [items, setItems] = useState([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const controller = new AbortController();
		async function fetchItems() {
			setLoading(true);
			setError("");
			try {
				const params = new URLSearchParams();
				if (search.trim()) params.set("search", search.trim());
				const suffix = params.toString() ? `?${params}` : "";
				const response = await fetch(`${API_URL}/api/products${suffix}`, { signal: controller.signal });
				const data = await response.json();
				if (!response.ok) throw new Error(data.message || "Could not load products.");
				if (!Array.isArray(data)) throw new Error("The server returned an unexpected product list.");
				setItems(data);
			} catch (requestError) {
				if (requestError.name !== "AbortError") setError(requestError.message || "Could not connect to the server.");
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		}
		fetchItems();
		return () => controller.abort();
	}, [search]);

	return (
		<>
			<header className="main-header">
				<a className="logo-container" href="/" aria-label="RotorLab home">
					<span className="logo">RL</span><span>RotorLab</span>
				</a>
				<label className="search">
					<span className="sr-only">Search parts</span>
					<input type="search" placeholder="Search parts..." value={search} onChange={(event) => setSearch(event.target.value)} />
				</label>
				<nav className="user-actions" aria-label="Main navigation">
					<a href="#products">Shop parts</a>
					<a className="button button-dark" href="/admin">Admin</a>
				</nav>
			</header>
			<main>
				<section className="store-hero">
					<div className="hero-copy">
						<p className="eyebrow">FPV and racing drone parts</p>
						<h1>Parts for drones<br />that go fast.</h1>
						<p>Every part shows its size, weight and stock, so your next build fits the first time.</p>
						<a className="button button-primary" href="#products">Explore the collection <span aria-hidden="true">↗</span></a>
					</div>
					<div className="hero-art" role="img" aria-label="FPV racing drone in flight">
						<div className="hero-art-label"><span>01 / FIELD NOTES</span><strong>Built to fly.</strong></div>
					</div>
					<div className="hero-index">ROTORLAB — 2026</div>
				</section>

				<section className="products-section" id="products">
					<div className="section-heading">
						<div><p className="eyebrow">Curated components</p><h2>Shop the parts</h2></div>
						<p>Performance-ready components for your next build.</p>
					</div>
					{loading && <p className="store-message" role="status">Loading products...</p>}
					{error && <p className="store-message error" role="alert">{error}</p>}
					{!loading && !error && items.length === 0 && <p className="store-message">No products found. Try another search.</p>}
					{!loading && !error && items.length > 0 && (
						<div className="product-grid">
							{items.map((item, index) => (
								<a className="product-card" href={`/products/${item._id}`} key={item._id}>
									<div className="product-image">
										{item.images?.[0]?.url
											? <img src={item.images[0].url} alt={item.name} loading="lazy" />
											: <div className="image-placeholder">ROTORLAB<br />COMPONENTS</div>}
										<span className="product-number">0{(index % 9) + 1}</span>
									</div>
									<div className="product-card-content">
										<p className="product-category">{item.category?.name || "Drone components"}</p>
										<h3>{item.name}</h3>
										<div className="product-meta"><strong>${Number(item.price).toFixed(2)}</strong><span>{item.stock > 0 ? `${item.stock} in stock` : "Sold out"}</span></div>
									</div>
								</a>
							))}
						</div>
					)}
				</section>
				<RegisterForm />
			</main>
			<footer className="site-footer"><a className="logo-container" href="/"><span className="logo">RL</span><span>RotorLab</span></a><span>Parts for the next great flight.</span><a href="/admin">Admin</a></footer>
		</>
	);
}

export default Home;
