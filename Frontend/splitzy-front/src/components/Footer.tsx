function Footer(){
    return(
        <div className="w-screen flex flex-row bg-transparent h-45 items-center">
            <div className="w-1/6"></div>
            <div className="w-1/2">
                <a href="/" className="flex flex-row items-center titulo">
                    <img src="/logo-splitzy.png" className="w-20"></img>
                    <h1 className="ml-7">splitzy</h1> 
                </a>
            </div>
            <div className="flex flex-row w-1/2 items-center">
                <div className="text-left flex flex-col w-1/2 space-y-4">
                    <p><a href="#">Todos los derechos reservados</a></p>
                    <p><a href="#">Política de privacidad</a></p>
                    <p><a href="#">Sobre nuestras cookies</a></p>
                </div>
               <div className="text-left flex flex-col w-1/2 space-y-4">
                    <p><a href="/">Home</a></p>
                    <p><a href="#">Sobre nostros</a></p>
                    <p><a href="#">Contacto</a></p>
               </div>
            </div>
            <div className="w-1/6"></div>
        </div>
    )
}

export default Footer