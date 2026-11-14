import { useEffect, useState } from "react";
import { API_URL } from "../Admin/api";
import "./MainPage.css";

const currency = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export default function ProductPage({ productId }) {
	const [request, setRequest] = useState(() => ({
		productId,
		product: null,
		loading: true,
		error: "",
	}));
	const [imageSelection, setImageSelection] = useState({ productId, index: 0 });

	useEffect(() => {
		const controller = new AbortController();

		async function fetchProduct() {
			try {
				const response = await fetch(`${API_URL}/api/products/${encodeURIComponent(productId)}`, {
					signal: controller.signal,
				});
				const data = await response.json();
				if (!response.ok) throw new Error(data.message || "Could not load this product.");
				setRequest({ productId, product: data, loading: false, error: "" });
			} catch (requestError) {
				if (requestError.name !== "AbortError") {
					setRequest({
						productId,
						product: null,
						loading: false,
						error: requestError.message || "Could not connect to the server.",
					});
				}
			}
		}

		fetchProduct();
		return () => controller.abort();
	}, [productId]);

	const isCurrentRequest = request.productId === productId;
	const product = isCurrentRequest ? request.product : null;
	const loading = !isCurrentRequest || request.loading;
	const error = isCurrentRequest ? request.error : "";
	const selectedImage = imageSelection.productId === productId ? imageSelection.index : 0;
	const images = product?.images?.filter((image) => image?.url) || [];
	const activeImage = images[selectedImage] || images[0];

	return (
		<>
			<header className="main-header">
				<a className="logo-container" href="/" aria-label="RotorLab home">
					<span className="logo">RL</span><span>RotorLab</span>
				</a>
				<nav className="user-actions" aria-label="Main navigation">
					<a href="/#products">Shop parts</a>
					<a className="button button-dark" href="/admin">Admin</a>
				</nav>
			</header>
			<main className="product-detail">
				<nav className="product-breadcrumb" aria-label="Breadcrumb">
					<a href="/">Home</a><span aria-hidden="true">/</span>
					<a href="/#products">Shop parts</a><span aria-hidden="true">/</span>
					<span aria-current="page">{product?.name || "Product"}</span>
				</nav>
				{loading && <p className="store-message" role="status">Loading product...</p>}
				{error && <p className="store-message error" role="alert">{error}</p>}
				{!loading && !error && product && (
					<article className="product-detail-card">
						<div className="product-gallery">
							<div className="product-detail-image">
								{activeImage
									? <img src={activeImage.url} alt={product.name} />
									: <div className="image-placeholder">ROTORLAB<br />COMPONENTS</div>}
							</div>
							{images.length > 1 && (
								<div className="product-thumbnails" aria-label="Product images">
									{images.map((image, index) => (
										<button
											className={`product-thumbnail${selectedImage === index ? " active" : ""}`}
											type="button"
											key={image._id || image.url}
											onClick={() => setImageSelection({ productId, index })}
											aria-label={`Show product image ${index + 1}`}
											aria-pressed={selectedImage === index}
										>
											<img src={image.url} alt="" />
										</button>
									))}
								</div>
							)}
						</div>
						<div className="product-detail-copy">
							<p className="eyebrow">{product.category?.name || "Drone components"}</p>
							<h1>{product.name}</h1>
							<p className="product-detail-description">
								{product.description || "A performance-ready component for your next build."}
							</p>
							<p className="product-detail-price">{currency.format(Number(product.price))}</p>
							<p className={`product-stock${product.stock > 0 ? "" : " sold-out"}`} role="status">
								{product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
							</p>
							<dl className="product-specifications">
								{product.sku && (
									<div><dt>SKU</dt><dd>{product.sku}</dd></div>
								)}
								<div><dt>Category</dt><dd>{product.category?.name || "Drone components"}</dd></div>
								<div><dt>Availability</dt><dd>{product.stock > 0 ? "Available" : "Currently unavailable"}</dd></div>
							</dl>
							<a className="button button-primary product-back-link" href="/#products">Back to the collection</a>
						</div>
					</article>
				)}
				{!loading && !error && !product && (
					<p className="store-message" role="alert">Product not found.</p>
				)}
			</main>
			<footer className="site-footer">
				<a className="logo-container" href="/"><span className="logo">RL</span><span>RotorLab</span></a>
				<span>Parts for the next great flight.</span>
				<a href="/admin">Admin</a>
			</footer>
		</>
	);
}
