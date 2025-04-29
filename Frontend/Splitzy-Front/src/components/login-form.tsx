"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate() 

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    try {
      await login(email, password, rememberMe)
      navigate("/") 
    } catch (error) {
      console.error("Error:", error)
      setError("Error al iniciar sesión. Por favor, verifica tus credenciales.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-row rounded-[40px] bg-[#242424e0] overflow-hidden">
        <div className="p-6 w-full md:w-1/2">
          <div className="flex flex-row items-center mb-6">
            <div className="w-1/3">
              <img src="/logo-splitzy.png" alt="Logo" className="w-20 mr-10" />
            </div>
            <div className="text-center w-1/2">
              <h1 className="mb-2 text-white">Hola de nuevo</h1>
              <h3 className="text-gray-300">Conectate con tu cuenta</h3>
            </div>
            <div className="w-1/3"></div>
          </div>

          <div className="mt-4">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email" className="text-white">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-white">
                    Contraseña
                  </Label>
                  <a href="#" className="ml-auto text-sm text-gray-300 underline-offset-2 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <Label htmlFor="remember-me" className="text-white">
                  Mantener sesión iniciada
                </Label>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" className="w-full">
                Iniciar Sesión
              </Button>

              <div className="text-center text-sm text-gray-300">
                ¿No tienes cuenta aún?{" "}
                <a href="/register" className="underline underline-offset-4 hover:text-white">
                  Regístrate
                </a>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden md:block bg-[url(/cangrejo-form.png)] bg-cover bg-no-repeat rounded-r-[40px] w-1/2"></div>
      </div>

      <div className="text-balance text-center text-xs text-gray-500 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-white">
        Al hacer click en continuar aceptas nuestros <a href="#">Términos de Servicio</a> y nuestra{" "}
        <a href="#">Política de Privacidad</a>.
      </div>
    </div>
  )
}
