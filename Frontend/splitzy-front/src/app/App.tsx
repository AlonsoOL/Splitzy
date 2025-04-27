import './App.css'
import { Route, Routes } from 'react-router-dom'
import Register from '../pages/Register'

function Home(){
  return(
    <div><h1 className='bg-blue-500'>Esto es una prueba</h1></div>
  )
}

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/register' element={<Register/>}/>
      </Routes>
    </>
  )
}

export default App
