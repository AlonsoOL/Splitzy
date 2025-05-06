import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"

interface JwtPayload{
    name: string,
    mail: string,
    role: string,
    imageUrl: string,
}

function Header(){
    const [user, setUser] = useState<JwtPayload | null>(null)
    
    useEffect(() => {
        const token = localStorage.getItem("user")
        if (token){
            const decoded = jwtDecode<JwtPayload>(token)
            setUser(decoded)
        }
    }, [])

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
                {user ?(
                    <img
                    src={`https://localhost:7044${user.imageUrl}`}
                    alt="Perfil"
                    className="w-12 h-12 rounded-full"
                    />
                ) : (
                    <a href="/login">Perfil</a>
                    )}
                <a href="">Actividad</a>
                <a href="" className="ml-8">Amigos</a>
                <a href="/menu-user">Grupos</a>
                
            </div>
            <div className="w-1/6"></div>
        </div>
    )
}

export default Header