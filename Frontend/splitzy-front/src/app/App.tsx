import './App.css'
import { Route, Routes } from 'react-router-dom'
import Register from '../pages/Register'
import Header from '../components/Header'
import Login from '@/pages/Login'
import { AuthProvider } from '@/context/AuthContext'

function Home(){
  return(
    <div><h1 className='bg-blue-500'>Esto es una prueba</h1></div>
  )
}

function App() {

  return (
    <>
      <Header/>
      <AuthProvider>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
      </AuthProvider>
    </>
  )
}

export default App
