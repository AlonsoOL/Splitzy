function Footer(){
    return(
        <div className="w-full bg-transparent">
            <div className="flex flex-row max-w-6xl mx-auto items-center justify-center h-45">
                <div className="w-1/2">
                    <a href="/" className="flex flex-row items-center justify-center titulo">
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
            </div>
        </div>
    )
}

export default Footer