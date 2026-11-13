import { useEffect, useState } from "react";
import { API_URL } from "../Admin/api";

export default function ProductPage({ productId }) {
	const [product, setProduct] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		const controller = new AbortController();
		fetch(`${API_URL}/api/products/${productId}`, { signal: controller.signal })
			.then(async (response) => {
				const data = await response.json();
				if (!response.ok) throw new Error(data.message || "Could not load this product.");
				setProduct(data);
			})
			.catch((requestError) => { if (requestError.name !== "AbortError") setError(requestError.message); });
		return () => controller.abort();
	}, [productId]);

	if (error) return <main className="product-detail"><a href="/">← Back to shop</a><p className="store-message error">{error}</p></main>;
	if (!product) return <main className="product-detail"><p role="status">Loading product...</p></main>;
	return (
		<main className="product-detail">
			<a href="/">← Back to shop</a>
			<div className="product-detail-card">
				{product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.name} /> : <div className="image-placeholder">ROTORLAB COMPONENT</div>}
				<div><p className="eyebrow">{product.category?.name || "Drone components"}</p><h1>{product.name}</h1><p>{product.description}</p><strong>${Number(product.price).toFixed(2)}</strong><p>{product.stock > 0 ? `${product.stock} in stock` : "Sold out"}</p></div>
			</div>
		</main>
	);
}
