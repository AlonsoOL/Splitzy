function Header(){
    return(
        <div className="w-screen flex flex-row bg-transparent">
            <div className="w-1/6"></div>
            <div className="w-1/2">
                <a href="/" className="flex flex-row items-center titulo">
                    <img src="/logo-splitzy.png" className="w-25"></img>
                    <h1 className="ml-7">splitzy</h1> 
                </a>
            </div>
            <div className="flex flex-row-reverse w-1/2 space-x-8 items-center">
                <a>Amigos</a>
                <a className="ml-8">Perfil</a>
                <a>Grupos</a>
                
            </div>
            <div className="w-1/6"></div>
        </div>
    )
}

export default Header