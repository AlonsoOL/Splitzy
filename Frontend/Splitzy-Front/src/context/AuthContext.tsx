"use client"

import { jwtDecode } from "jwt-decode"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"

interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("user") || sessionStorage.getItem("user")
    if (storedToken) {
      try{
        const decodedUser = jwtDecode(storedToken)
        setUser(decodedUser)
        setIsAuthenticated(true)
      }
      catch(err){
        console.log("token inválido")
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    setIsLoading(false)
  }, [])

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
      // He quitado userData y he pueso decodedUser para setearlo como usuario y poder cargar la imagen sin recargar página
      // const userData = {
      //   email,
      //   token,
      // }
      const decodedUser = jwtDecode(token)
  
      setUser(decodedUser)
      setIsAuthenticated(true)
      console.log("este usuario está autenticado", !isAuthenticated)
  
      // Cambio de  JSON.stringify(userData) a token para poder guardar directamente el token, sin necesidad de meter el correo suelto
      // puesto que ya se encuentra dentro del toekn
      if (rememberMe) {
        localStorage.setItem("user", token)
      } else {
        sessionStorage.setItem("user", token)
      }
  
      // console.log("Token recibido:", token)
    } catch (error) {
      console.error("Error en login:", error)
      throw error
    }
  }
  

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    console.log("el usuario autenticado tiene", isAuthenticated)
    localStorage.removeItem("user")
    sessionStorage.removeItem("user")
    navigate("/")
  }

  return <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
