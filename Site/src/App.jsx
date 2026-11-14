import AdminPage from "./Admin/AdminPage";
import Home from "./Pages/MainPage";
import ProductPage from "./Pages/ProductPage";

const App = () => {
	const path = window.location.pathname;
	if (path === "/admin" || path === "/admin/") return <AdminPage />;
	const productRoute = path.match(/^\/products\/([^/]+)\/?$/);
	if (productRoute) return <ProductPage productId={productRoute[1]} />;
	return <Home />;
}

export default App;