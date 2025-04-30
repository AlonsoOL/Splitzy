import './App.css'
import { Route, Routes } from 'react-router-dom'
import Register from '../pages/Register'
import Header from '../components/Header'
import Login from '@/pages/Login'
import Footer from '@/components/Footer'
import { Button } from "@/components/ui/button"


function Home(){
  return(
    <main className="min-h-screen w-screen">
      <div className='bg-[url(/fondo-splitzy.png)] bg-cover'>
        <div className='min-h-screen flex flex-col backdrop-blur-2xl items-center justify-center'>
          <h1 className='uppercase'><span className='text-lime-500'>Gestiona</span> y organiza tus <br/> <span className='text-lime-500'>gastos</span> con amigos</h1>
          <p className='w-1/3 my-12 text-lg'>LLeva un seguimiento preciso de los gastos grupales y deja de preocuparte sobre quien paga más y quien paga menos</p>
          <Button>Comenzar</Button>
        </div>
      </div>
      <div className='bg-white h-48'>aquí va la foto de figma</div>
      <div className='flex flex-col min-h-screen bg-linear-to-t from-zinc-950 to-zinc-800 items-center justify-center space-y-4'>
        <div className='rounded-xl border-4 border-indigo-600 w-1/3 text-left p-4 flex flex-raw'>
          <div className='flex flex-col'>
            <h2 className='text-3xl'>Despreocúpate de las cuentas</h2>
            <p>Despreocúpate de las cuentas</p>
          </div>
          <img/>
        </div>
        <div className='flex flex-raw'>
          <div className='rounded-xl border-4 border-indigo-600 text-left p-4'>
            segundo texto
          </div>
          <div className='rounded-xl border-4 border-indigo-600 text-left p-4'>
            tercer texto
          </div>
        </div>
      </div>
    </main>
  )
}

function App() {

  return (
    <>
      <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
      <Footer/>
    </>
  )
}

export default App
