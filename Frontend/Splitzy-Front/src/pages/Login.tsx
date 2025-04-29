import { LoginForm } from "@/components/login-form"

export default function Login() {
    return (
        <main className="w-screen min-h-screen bg-[url(/fondo-splitzy.png)] bg-cover flex justify-center items-center p-6">
        <div className="w-full max-w-4xl">
          <LoginForm />
        </div>
      </main>
    )
  }