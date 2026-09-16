import { useState } from 'react'

export function readSession() {
  try { return JSON.parse(sessionStorage.getItem('tifund_user')) || null } catch { return null }
}

export function useAuth() {
  const [user, setUser] = useState(readSession)
  const signIn = (account) => { sessionStorage.setItem('tifund_user', JSON.stringify(account)); setUser(account) }
  const signOut = () => { sessionStorage.removeItem('tifund_user'); setUser(null) }
  return { user, signIn, signOut }
}
