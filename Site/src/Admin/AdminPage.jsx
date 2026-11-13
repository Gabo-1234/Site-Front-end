import { useState } from "react";
import ResourceAdmin from "./ResourceAdmin";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";
import UserManagement from "./UserManagement";
import { clearAdminSession, getAdminToken } from "./api";
import "./AdminPage.css";

const productFields = [
	{ name: "name", type: "text", label: "Product name" },
	{ name: "description", type: "textarea" },
	{ name: "price", type: "number" },
	{ name: "stock", type: "number" },
	{ name: "category", type: "select", optionsFrom: "categories", optionLabel: "name" },
	{ name: "images", type: "images" },
	{ name: "isActive", type: "checkbox" },
];
const productColumns = [
	{ key: "images", label: "Image", render: (product) => product.images?.[0] && <img src={product.images[0].url} alt="" width="50" /> },
	{ key: "name" }, { key: "price", render: (product) => `$${Number(product.price).toFixed(2)}` },
	{ key: "stock" }, { key: "category", render: (product) => product.category?.name },
];
const productFilters = [
	{ name: "search", label: "Search products", type: "search" },
	{ name: "category", label: "Category", type: "select", optionsFrom: "categories", optionLabel: "name" },
	{ name: "minPrice", label: "Min price", type: "number" },
	{ name: "maxPrice", label: "Max price", type: "number" },
];
const categoryFields = [
	{ name: "name", type: "text" },
	{ name: "slug", type: "text" },
	{ name: "parent", type: "select", optionsFrom: "categories", optionLabel: "name" },
];
const categoryColumns = [{ key: "name" }, { key: "slug" }, { key: "parent", render: (category) => category.parent?.name }];
const noFilters = [];

function getSavedAdmin() {
	if (!getAdminToken()) return null;
	try {
		const user = JSON.parse(window.localStorage.getItem("rotorlab-admin-user") || "null");
		return user?.role === "admin" ? user : null;
	} catch {
		return null;
	}
}

export default function AdminPage() {
	const [tab, setTab] = useState("dashboard");
	const [user, setUser] = useState(getSavedAdmin);
	if (!user) return <LoginForm onLogin={setUser} />;

	function logout() {
		clearAdminSession();
		setUser(null);
	}

	return (
		<main className="admin-shell">
			<header className="admin-topbar">
				<a className="logo-container" href="/"><span className="logo">RL</span><span>RotorLab Admin</span></a>
				<div><span>{user.name}</span><button type="button" className="button button-light" onClick={logout}>Sign out</button></div>
			</header>
			<div className="admin-layout">
				<nav className="admin-nav" aria-label="Admin sections">
					{["dashboard", "products", "categories", "users"].map((item) => <button type="button" className={tab === item ? "active" : ""} key={item} onClick={() => setTab(item)}>{item}</button>)}
				</nav>
				<div className="admin-content">
					{tab === "dashboard" && <Dashboard />}
					{tab === "products" && <ResourceAdmin resource="products" title="Products" fields={productFields} columns={productColumns} filters={productFilters} />}
					{tab === "categories" && <ResourceAdmin resource="categories" title="Categories" fields={categoryFields} columns={categoryColumns} filters={noFilters} />}
					{tab === "users" && <UserManagement currentUserId={user.id} />}
				</div>
			</div>
		</main>
	);
}
