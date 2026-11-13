import AdminPage from "./Admin/AdminPage";
import Home from "./Pages/Main Page";
import ProductPage from "./Pages/ProductPage";

function App() {
	const path = window.location.pathname;
	if (path === "/admin" || path === "/admin/") return <AdminPage />;
	const productRoute = path.match(/^\/products\/([^/]+)\/?$/);
	if (productRoute) return <ProductPage productId={productRoute[1]} />;
	return <Home />;
}

export default App;