import { useState } from 'react'
import ResourceAdmin from './ResourceAdmin'

// ---- Each student edits this part: names of THEIR models and fields ----
const productFields = [
	{ name: 'title', type: 'text' },
	{ name: 'description', type: 'textarea' },
	{ name: 'price', type: 'number' },
	{ name: 'stock', type: 'number' },
	{ name: 'category', type: 'select', optionsFrom: 'categories', optionLabel: 'name' },
	{ name: 'images', type: 'images' },
	{ name: 'isActive', type: 'checkbox' },
]
const productColumns = [
	{ key: 'title' },
	{ key: 'price' },
	{ key: 'stock' },
	{ key: 'category', render: (p) => p.category?.name },
	{ key: 'images', render: (p) => p.images?.[0] && <img src={p.images[0].url} alt="" width="48" /> },
]

const categoryFields = [
	{ name: 'name', type: 'text' },
	{ name: 'slug', type: 'text' },
	{ name: 'parent', type: 'select', optionsFrom: 'categories', optionLabel: 'name' },
]
const categoryColumns = [{ key: 'name' }, { key: 'slug' }, { key: 'parent', render: (c) => c.parent?.name }]
// -------------------------------------------------------------------------

export default function AdminPage() {
	const [tab, setTab] = useState('products')
	return (
		<div>
			<nav style={{ display: 'flex', gap: 8 }}>
				<button onClick={() => setTab('products')}>Products</button>
				<button onClick={() => setTab('categories')}>Categories</button>
			</nav>
			{tab === 'products' && (
				<ResourceAdmin resource="products" title="Products" fields={productFields} columns={productColumns} />
			)}
			{tab === 'categories' && (
				<ResourceAdmin resource="categories" title="Categories" fields={categoryFields} columns={categoryColumns} />
			)}
		</div>
	)
}