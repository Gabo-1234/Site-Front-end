import { useEffect, useState } from 'react'
import AdminPage from './Admin/AdminPage'
import ResourceAdmin from './Admin/ResourceAdmin'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      {/* <ResourceAdmin /> */}
      <AdminPage />
    </>
  )
}

export default App