import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
import { Button } from "./ui/button"

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
                    <div className="relative group inline-block">
                        <div id="" className="hidden group-hover:flex bg-[#242424] flex-col block absolute top-full right-[-55px] z-10 rounded-[10px]">
                            <a href="#" className="h-full p-2 mt-2 hover:underline decoration-1">Perfil</a>
                            <Button className="m-2 hover:bg-red-500! hover:text-red-50! hover:border-transparent! hover:transition!">Cerrar sesión</Button>
                        </div>
                        <img
                        src={`https://localhost:7044${user.imageUrl}`}
                        alt="Perfil"
                        className="w-12 h-12 rounded-full"
                        />
                        
                    </div>
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