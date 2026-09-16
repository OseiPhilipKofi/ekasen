import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/api',
  headers: { Accept: 'application/json' },
})

console.log(api);

api.interceptors.request.use((config) => {
  const session = sessionStorage.getItem('tifund_user')
  if (session) config.headers.Authorization = `Bearer ${JSON.parse(session).token || ''}`
  return config
})

export default api
