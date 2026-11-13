import { useEffect, useState } from "react";
import { API_URL, authFetch } from "./api";
import { uploadImage } from "./uploadImage";

function emptyForm(fields) {
	const form = {};
	for (const field of fields) {
		if (field.type === "checkbox") form[field.name] = true;
		else if (field.type === "images") form[field.name] = [];
		else form[field.name] = "";
	}
	return form;
}

function toFormValue(field, value) {
	if (value === undefined || value === null) return emptyForm([field])[field.name];
	if (field.type === "select" && typeof value === "object") return value._id;
	return value;
}

export default function ResourceAdmin({ resource, title, fields, columns, filters = [] }) {
	const [items, setItems] = useState([]);
	const [options, setOptions] = useState({});
	const [form, setForm] = useState(emptyForm(fields));
	const [editingId, setEditingId] = useState(null);
	const [error, setError] = useState("");
	const [uploading, setUploading] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);
	const [filterValues, setFilterValues] = useState({});
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		const controller = new AbortController();
		async function loadItems() {
			setError("");
			const params = new URLSearchParams({ page: String(page), limit: "10" });
			if (resource === "products") params.set("includeInactive", "true");
			for (const [key, value] of Object.entries(filterValues)) {
				if (value) params.set(key, value);
			}
			try {
				const response = await authFetch(`${API_URL}/api/${resource}?${params}`, { signal: controller.signal });
				const data = await response.json();
				if (!response.ok) throw new Error(data.message || `Could not load ${title.toLowerCase()}.`);
				setItems(Array.isArray(data) ? data : data.items);
				setTotalPages(Array.isArray(data) ? 1 : Math.max(1, data.totalPages));
			} catch (requestError) {
				if (requestError.name !== "AbortError") setError(requestError.message || "Could not connect to the server.");
			}
		}
		loadItems();
		return () => controller.abort();
	}, [resource, title, reloadKey, page, filterValues]);

	useEffect(() => {
		const selectFields = [...fields, ...filters].filter((field) => field.type === "select");
		for (const field of selectFields) {
			if (!field.optionsFrom) continue;
			authFetch(`${API_URL}/api/${field.optionsFrom}`)
				.then(async (response) => {
					const data = await response.json();
					if (!response.ok) throw new Error(data.message || `Could not load ${field.optionsFrom}.`);
					setOptions((previous) => ({ ...previous, [field.name]: Array.isArray(data) ? data : data.items }));
				})
				.catch((requestError) => setError(requestError.message));
		}
	}, [fields, filters]);

	function setField(name, value) {
		setForm((previous) => ({ ...previous, [name]: value }));
	}

	function reset() {
		setForm(emptyForm(fields));
		setEditingId(null);
	}

	function startEdit(item) {
		const next = {};
		for (const field of fields) next[field.name] = toFormValue(field, item[field.name]);
		setForm(next);
		setEditingId(item._id);
		setError("");
	}

	async function handleFiles(field, files) {
		setUploading(true);
		setError("");
		try {
			const uploaded = [];
			for (const file of files) uploaded.push(await uploadImage(file));
			setField(field.name, [...form[field.name], ...uploaded]);
		} catch (requestError) {
			setError(requestError.message);
		} finally {
			setUploading(false);
		}
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		const body = {};
		for (const field of fields) {
			const value = form[field.name];
			if (field.type === "number") body[field.name] = value === "" ? undefined : Number(value);
			else if (value === "" && field.type !== "checkbox") body[field.name] = undefined;
			else body[field.name] = value;
		}
		try {
			const response = await authFetch(`${API_URL}/api/${resource}${editingId ? `/${editingId}` : ""}`, {
				method: editingId ? "PUT" : "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Something went wrong.");
			reset();
			setReloadKey((key) => key + 1);
		} catch (requestError) {
			setError(requestError.message || "Could not save this item.");
		}
	}

	async function handleDelete(item) {
		if (!window.confirm("Delete this item?")) return;
		setError("");
		try {
			const response = await authFetch(`${API_URL}/api/${resource}/${item._id}`, { method: "DELETE" });
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || "Could not delete this item.");
			setReloadKey((key) => key + 1);
		} catch (requestError) {
			setError(requestError.message || "Could not delete this item.");
		}
	}

	function renderField(field) {
		if (field.type === "textarea") return <textarea value={form[field.name]} onChange={(event) => setField(field.name, event.target.value)} />;
		if (field.type === "checkbox") return <input type="checkbox" checked={!!form[field.name]} onChange={(event) => setField(field.name, event.target.checked)} />;
		if (field.type === "select") {
			return (
				<select value={form[field.name]} onChange={(event) => setField(field.name, event.target.value)}>
					<option value="">Choose...</option>
					{(options[field.name] || []).map((option) => <option key={option._id} value={option._id}>{option[field.optionLabel || "name"]}</option>)}
				</select>
			);
		}
		if (field.type === "images") {
			return (
				<div>
					<input type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => handleFiles(field, [...event.target.files])} />
					{uploading && <span> Uploading...</span>}
					<div className="admin-image-list">
						{form[field.name].map((image) => (
							<div key={image.publicId || image.url}>
								<img src={image.url} alt="" width="68" />
								<button type="button" onClick={() => setField(field.name, form[field.name].filter((entry) => entry.publicId !== image.publicId))}>Remove</button>
							</div>
						))}
					</div>
				</div>
			);
		}
		return <input type={field.type} value={form[field.name]} onChange={(event) => setField(field.name, event.target.value)} />;
	}

	return (
		<section className="admin-resource">
			<div className="admin-section-heading"><div><p className="eyebrow">Manage catalog</p><h2>{title}</h2></div></div>
			{error && <p className="form-message error" role="alert">{error}</p>}
			<form onSubmit={handleSubmit} className="admin-edit-form">
				<h3>{editingId ? "Edit item" : "Create item"}</h3>
				{fields.map((field) => (
					<label className={field.type === "textarea" || field.type === "images" ? "wide-field" : ""} key={field.name}>
						{field.label || field.name}
						{renderField(field)}
					</label>
				))}
				<div className="form-actions">
					<button className="button button-primary" disabled={uploading}>{editingId ? "Save changes" : "Create"}</button>
					{editingId && <button className="button button-light" type="button" onClick={reset}>Cancel</button>}
				</div>
			</form>
			<div className="admin-filter-bar">
				{filters.map((field) => (
					<label key={field.name}>{field.label || field.name}
						{field.type === "select"
							? <select value={filterValues[field.name] || ""} onChange={(event) => { setPage(1); setFilterValues((previous) => ({ ...previous, [field.name]: event.target.value })); }}><option value="">All</option>{(options[field.name] || []).map((option) => <option key={option._id} value={option._id}>{option[field.optionLabel || "name"]}</option>)}</select>
							: <input type={field.type || "text"} value={filterValues[field.name] || ""} onChange={(event) => { setPage(1); setFilterValues((previous) => ({ ...previous, [field.name]: event.target.value })); }} />}
					</label>
				))}
				<label>Sort
					<select value={filterValues.sort || "newest"} onChange={(event) => { setPage(1); setFilterValues((previous) => ({ ...previous, sort: event.target.value })); }}>
						<option value="newest">Newest</option><option value="oldest">Oldest</option><option value="price">Price: low to high</option><option value="-price">Price: high to low</option><option value="name">Name: A-Z</option>
					</select>
				</label>
			</div>
			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead><tr>{columns.map((column) => <th key={column.key}>{column.label || column.key}</th>)}<th>Actions</th></tr></thead>
					<tbody>{items.map((item) => (
						<tr key={item._id}>
							{columns.map((column) => <td key={column.key}>{column.render ? column.render(item) : String(item[column.key] ?? "")}</td>)}
							<td className="table-actions"><button type="button" onClick={() => startEdit(item)}>Edit</button><button type="button" onClick={() => handleDelete(item)}>Delete</button></td>
						</tr>
					))}</tbody>
				</table>
				{items.length === 0 && !error && <p className="admin-empty">No items found.</p>}
			</div>
			<div className="pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div>
		</section>
	);
}
