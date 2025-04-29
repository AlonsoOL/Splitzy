import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
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
            <form className="space-y-8">
              <div>
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input id="email" type="email" placeholder="m@example.com" required className="mt-2" />
              </div>

              <div>
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-white">
                    Contraseña
                  </Label>
                  <a href="#" className="ml-auto text-sm text-gray-300 underline-offset-2 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required className="mt-2" />
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>

              <div className="text-center text-sm text-gray-300">
                No tienes cuenta aún?{" "}
                <a href="/register" className="underline underline-offset-4 hover:text-white">
                  Registrate.
                </a>
              </div>
            </form>
          </div>
        </div>

        <div className="hidden md:block bg-[url(/cangrejo-form.png)] bg-cover bg-no-repeat rounded-r-[40px] w-1/2"></div>
      </div>

      <div className="text-balance text-center text-xs text-gray-500 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-white">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
