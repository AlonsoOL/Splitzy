"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await fetch("https://localhost:7044/login", {
        method: "POST",
        headers: {
          accept: "text/plain", 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
  
      if (!response.ok) {
        throw new Error("Credenciales inválidas")
      }
  
      const token = await response.text() 
      const userData = {
        email,
        token,
      }
  
      setUser(userData)
      setIsAuthenticated(true)
  
      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(userData))
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData))
      }
  
      console.log("Token recibido:", token)
    } catch (error) {
      console.error("Error en login:", error)
      throw error
    }
  }
  

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
    sessionStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
