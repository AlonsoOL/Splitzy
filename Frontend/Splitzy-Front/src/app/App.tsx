import "./App.css"
import "./menuUser.css"
import { Route, Routes } from "react-router-dom"
import Register from "../pages/Register"
import Header from "../components/Header"
import Login from "@/pages/Login"
import { AuthProvider } from "@/context/AuthContext"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import MenuUser from "@/pages/MenuUser"
import MenuAdmin from "@/pages/MenuAdmin"
import ProtectRoute from "@/components/ProtectedRoute"
import UserProfile from "@/pages/userProfile"

function Home() {
  return (
    <main className="min-h-screen w-full">
      <div className="bg-[url(/fondo-splitzy.png)] bg-cover">
        <div className="min-h-screen flex flex-col backdrop-blur-2xl items-center justify-center">
          <h1 className="uppercase">
            <span className="text-lime-500">Gestiona</span> y organiza tus <br />
            <span className="text-lime-500">gastos</span> con amigos
          </h1>
          <p className="w-1/3 my-12 text-lg">
            LLeva un seguimiento preciso de los gastos grupales y deja de preocuparte sobre quien paga más y quien paga menos
          </p>
          <a href="/register"><Button>Comenzar</Button></a>
          
          
        </div>      
      </div>
      <div className="relative z-10 flex flex-col min-h-screen bg-gradient-to-b from-[#1E1F21] to-[#000000] items-center justify-center pt-8 px-4 space-y-12">
        <div className="rounded-3xl bg-zinc-900 w-full max-w-4xl overflow-hidden relative">
          <div className="relative p-8 pb-24 z-10">
            <div className="flex flex-col max-w-md">
              <h2 className="text-3xl font-bold mb-2">Desprocúpate de las cuentas</h2>
              <p className="text-zinc-400 mb-4">Desprocúpate de las cuentas</p>
              <ArrowRight className="w-6 h-6" />
            </div>

            <div className="absolute right-8 bottom-0 transform translate-y-1/4">
              <div className="relative w-48 h-96 bg-white rounded-3xl overflow-hidden shadow-2xl rotate-12">
                <div className="absolute inset-1 bg-gray-100 rounded-2xl overflow-hidden">
                  <div className="p-4 text-black text-xs">
                    <div className="border border-blue-300 rounded p-2 flex justify-center items-center">
                      <span>375×812</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-0">
            <img src="/card-wave.svg" alt="" className="w-full" role="presentation" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <div className="rounded-3xl bg-green-200 p-8 text-black relative overflow-hidden">
            <div className="flex flex-col h-full justify-between relative z-10">
              <h3 className="text-2xl font-bold mb-2">Comparte y recibe dinero</h3>
              <div className="flex justify-end mt-4">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-0">
              <img src="/card-wave.svg" alt="" className="w-full h-16" role="presentation" />
            </div>
          </div>

          <div className="rounded-3xl bg-lime-400 p-8 text-black relative overflow-hidden">
            <div className="flex flex-col h-full justify-between relative z-10">
              <h3 className="text-2xl font-bold mb-2">Crea grupos de gastos con amigos</h3>
              <div className="flex justify-end mt-4">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-0">
              <img src="/card-wave.svg" alt="" className="w-full h-16" role="presentation" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


function App() {
  return (
    <>
      <AuthProvider>
        {/* <WebSocketProvider> */}
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/menu-user" element={
              <ProtectRoute>
                <MenuUser/>
              </ProtectRoute>}/>
            <Route path="/menu-admin" element={
              <ProtectRoute>
                <MenuAdmin/>
              </ProtectRoute>}/>
            <Route path="/user-profile" element={
              <ProtectRoute>
                <UserProfile/>
              </ProtectRoute>}/>
          </Routes>
          <Footer />
        {/* </WebSocketProvider> */}
      </AuthProvider>
    </>
  )
}

export default App
