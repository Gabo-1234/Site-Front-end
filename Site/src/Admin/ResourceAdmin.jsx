import { useEffect, useState } from 'react'
import { uploadImage } from './uploadImage'

const API_URL = import.meta.env.VITE_API_URL

// Fills a form with the values of an item (or empty values for a new one)
function emptyForm(fields) {
	const form = {}
	for (const f of fields) {
		if (f.type === 'checkbox') form[f.name] = true
		else if (f.type === 'images') form[f.name] = []
		else form[f.name] = ''
	}
	return form
}

// A populated reference comes back as an object. The form needs only its id.
function toFormValue(field, value) {
	if (value === undefined || value === null) return emptyForm([field])[field.name]
	if (field.type === 'select' && typeof value === 'object') return value._id
	return value
}

export default function ResourceAdmin({ resource, title, fields, columns }) {
	const [items, setItems] = useState([])
	const [options, setOptions] = useState({}) // for select fields
	const [form, setForm] = useState(emptyForm(fields))
	const [editingId, setEditingId] = useState(null)
	const [error, setError] = useState('')
	const [uploading, setUploading] = useState(false)

	const [reloadKey, setReloadKey] = useState(0)

	// Load the list again whenever reloadKey changes
	useEffect(() => {
		fetch(`${API_URL}/api/${resource}`)
			.then((res) => res.json())
			.then(setItems)
			.catch((err) => setError(err.message))
	}, [resource, reloadKey])

	// Load the choices for every select field
	useEffect(() => {
		for (const f of fields.filter((f) => f.type === 'select')) {
			fetch(`${API_URL}/api/${f.optionsFrom}`)
				.then((res) => res.json())
				.then((list) => setOptions((prev) => ({ ...prev, [f.name]: list })))
		}
	}, [fields])

	function load() {
		setReloadKey((k) => k + 1)
	}

	function setField(name, value) {
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	function startEdit(item) {
		const next = {}
		for (const f of fields) next[f.name] = toFormValue(f, item[f.name])
		setForm(next)
		setEditingId(item._id)
		setError('')
	}

	function reset() {
		setForm(emptyForm(fields))
		setEditingId(null)
	}

	async function handleFiles(field, files) {
		setUploading(true)
		setError('')
		try {
			const uploaded = []
			for (const file of files) uploaded.push(await uploadImage(file))
			setField(field.name, [...form[field.name], ...uploaded])
		} catch (err) {
			setError(err.message)
		} finally {
			setUploading(false)
		}
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		// numbers must be sent as numbers, empty text fields are left out
		const body = {}
		for (const f of fields) {
			const v = form[f.name]
			if (f.type === 'number') body[f.name] = v === '' ? undefined : Number(v)
			else if (v === '' && f.type !== 'checkbox') body[f.name] = undefined
			else body[f.name] = v
		}
		const res = await fetch(`${API_URL}/api/${resource}${editingId ? `/${editingId}` : ''}`, {
			method: editingId ? 'PUT' : 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})
		const data = await res.json()
		if (!res.ok) return setError(data.message || 'Something went wrong')
		reset()
		load()
	}

	async function handleDelete(item) {
		if (!window.confirm('Delete this item?')) return
		const res = await fetch(`${API_URL}/api/${resource}/${item._id}`, { method: 'DELETE' })
		const data = await res.json()
		if (!res.ok) return setError(data.message || 'Could not delete')
		load()
	}

	return (
		<section>
			<h2>{title}</h2>
			{error && <p style={{ color: 'crimson' }}>{error}</p>}

			<form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
				<h3>{editingId ? 'Edit' : 'New'}</h3>
				{fields.map((f) => (
					<label key={f.name} style={{ display: 'grid', gap: 2 }}>
						{f.label || f.name}
						{f.type === 'textarea' && (
							<textarea value={form[f.name]} onChange={(e) => setField(f.name, e.target.value)} />
						)}
						{f.type === 'checkbox' && (
							<input type="checkbox" checked={!!form[f.name]} onChange={(e) => setField(f.name, e.target.checked)} />
						)}
						{f.type === 'select' && (
							<select value={form[f.name]} onChange={(e) => setField(f.name, e.target.value)}>
								<option value="">Choose...</option>
								{(options[f.name] || []).map((o) => (
									<option key={o._id} value={o._id}>{o[f.optionLabel || 'name']}</option>
								))}
							</select>
						)}
						{f.type === 'images' && (
							<div>
								<input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => handleFiles(f, [...e.target.files])} />
								{uploading && <span> Uploading...</span>}
								<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
									{form[f.name].map((img) => (
										<div key={img.publicId}>
											<img src={img.url} alt="" width="80" />
											<button type="button" onClick={() => setField(f.name, form[f.name].filter((i) => i.publicId !== img.publicId))}>
												remove
											</button>
										</div>
									))}
								</div>
							</div>
						)}
						{['text', 'number', 'email'].includes(f.type) && (
							<input type={f.type} value={form[f.name]} onChange={(e) => setField(f.name, e.target.value)} />
						)}
					</label>
				))}
				<div>
					<button type="submit" disabled={uploading}>{editingId ? 'Save changes' : 'Create'}</button>
					{editingId && <button type="button" onClick={reset}>Cancel</button>}
				</div>
			</form>

			<table style={{ marginTop: 24 }}>
				<thead>
					<tr>
						{columns.map((c) => <th key={c.key}>{c.label || c.key}</th>)}
						<th></th>
					</tr>
				</thead>
				<tbody>
					{items.map((item) => (
						<tr key={item._id}>
							{columns.map((c) => (
								<td key={c.key}>{c.render ? c.render(item) : String(item[c.key] ?? '')}</td>
							))}
							<td>
								<button onClick={() => startEdit(item)}>Edit</button>
								<button onClick={() => handleDelete(item)}>Delete</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	)
}