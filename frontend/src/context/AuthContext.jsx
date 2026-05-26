// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('jp_token')
    const saved = localStorage.getItem('jp_user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch { logout() }
    }
    setLoading(false)
  }, [])

  const login = async (email, password, role) => {
    const res  = await authAPI.login({ email, password, role })
    const data = res.data.data

    const userData = data.user || data.company || data.admin
    userData.role  = role

    localStorage.setItem('jp_token', data.token)
    localStorage.setItem('jp_user',  JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('jp_token')
    localStorage.removeItem('jp_user')
    setUser(null)
  }

  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('jp_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
