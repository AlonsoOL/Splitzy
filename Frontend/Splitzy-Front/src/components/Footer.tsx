function Footer() {
  return (
    <div className="w-full bg-transparent px-4 md:px-0">
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto items-center justify-center h-auto md:h-45 py-8">
        <div className="w-full md:w-1/2 mb-6 md:mb-0 flex justify-center md:justify-start">
          <a href="/" className="flex flex-row items-center justify-center titulo">
            <img src="/logo-splitzy.png" className="w-20"></img>
            <h1 className="ml-7">splitzy</h1>
          </a>
        </div>
        <div className="flex flex-col md:flex-row w-full md:w-1/2 items-center md:items-start">
          <div className="text-center md:text-left flex flex-col w-full md:w-1/2 space-y-4 mb-4 md:mb-0">
            <p>
              <a href="#">Todos los derechos reservados</a>
            </p>
            <p>
              <a href="#">Política de privacidad</a>
            </p>
            <p>
              <a href="#">Sobre nuestras cookies</a>
            </p>
          </div>
          <div className="text-center md:text-left flex flex-col w-full md:w-1/2 space-y-4">
            <p>
              <a href="/">Home</a>
            </p>
            <p>
              <a href="#">Sobre nostros</a>
            </p>
            <p>
              <a href="#">Contacto</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
