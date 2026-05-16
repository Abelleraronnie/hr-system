import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const login = (tokenStr, userData) => {
    localStorage.setItem('token', tokenStr)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(tokenStr)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
