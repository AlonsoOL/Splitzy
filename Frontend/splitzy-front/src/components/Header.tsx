import { useNotification } from "@/context/NotificationContext"
import { Button } from "./ui/button"
import { useAuth } from "@/context/AuthContext"
import { API_BASE_URL } from "@/config"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

function Header(){
    const {user, isAuthenticated, logout} = useAuth()
    const { hasNotification } = useNotification()


    return(
        <div className="w-full bg-transparent">
            <div className="max-w-6xl mx-auto flex flex-row">
                <div className="w-1/2">
                    <a href="/" className="flex flex-row items-center titulo">
                        <img src="/logo-splitzy.png" className="w-25"></img>
                        <h1 className="ml-7">splitzy</h1> 
                    </a>
                </div>
                <div className="flex flex-row-reverse w-1/2 gap-x-8 items-center">
                    {user && isAuthenticated ?(
                        <div className="relative group inline-block">
                            <div id="" className="hidden group-hover:flex bg-[#242424] flex-col block absolute top-full right-[-55px] z-10 rounded-[10px]">
                                <a href="/user-profile" className="h-full p-2 mt-2 hover:underline decoration-1">Perfil</a>
                                <Button onClick={logout} className="m-2 hover:bg-red-500! hover:text-red-50! hover:border-transparent! hover:transition!">Cerrar sesión</Button>
                            </div>
                            <Avatar>
                                <AvatarImage src={`${API_BASE_URL}${user.imageUrl}`} className="rounded-full"></AvatarImage>
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            
                        </div>
                    ) : (
                        <a href="/user-profile">Perfil</a>
                        )}
                    <a href="/menu-user" className="relative">
                        Actividad
                        {hasNotification && (
                            <div className="flex bg-red-500 rounded-full w-4! h-4! absolute top-[-5px] right-[-13px] items-center justify-center">
                                <div className="bg-white rounded-full w-2! h-2! z-50"></div>
                            </div>
                        )}
                    </a>
                    <a href="">Amigos</a>
                    <a href="/menu-user">Grupos</a>
                    {user?.role === "Admin" && (
                        <a href="/menu-admin"><svg className="fill-white hover:rotate-30 hover:fill-green-500 duration-100" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fillRule="evenodd" d="M14.279 2.152C13.909 2 13.439 2 12.5 2s-1.408 0-1.779.152a2 2 0 0 0-1.09 1.083c-.094.223-.13.484-.145.863a1.62 1.62 0 0 1-.796 1.353a1.64 1.64 0 0 1-1.579.008c-.338-.178-.583-.276-.825-.308a2.03 2.03 0 0 0-1.49.396c-.318.242-.553.646-1.022 1.453c-.47.807-.704 1.21-.757 1.605c-.07.526.074 1.058.4 1.479c.148.192.357.353.68.555c.477.297.783.803.783 1.361s-.306 1.064-.782 1.36c-.324.203-.533.364-.682.556a2 2 0 0 0-.399 1.479c.053.394.287.798.757 1.605s.704 1.21 1.022 1.453c.424.323.96.465 1.49.396c.242-.032.487-.13.825-.308a1.64 1.64 0 0 1 1.58.008c.486.28.774.795.795 1.353c.015.38.051.64.145.863c.204.49.596.88 1.09 1.083c.37.152.84.152 1.779.152s1.409 0 1.779-.152a2 2 0 0 0 1.09-1.083c.094-.223.13-.483.145-.863c.02-.558.309-1.074.796-1.353a1.64 1.64 0 0 1 1.579-.008c.338.178.583.276.825.308c.53.07 1.066-.073 1.49-.396c.318-.242.553-.646 1.022-1.453c.47-.807.704-1.21.757-1.605a2 2 0 0 0-.4-1.479c-.148-.192-.357-.353-.68-.555c-.477-.297-.783-.803-.783-1.361s.306-1.064.782-1.36c.324-.203.533-.364.682-.556a2 2 0 0 0 .399-1.479c-.053-.394-.287-.798-.757-1.605s-.704-1.21-1.022-1.453a2.03 2.03 0 0 0-1.49-.396c-.242.032-.487.13-.825.308a1.64 1.64 0 0 1-1.58-.008a1.62 1.62 0 0 1-.795-1.353c-.015-.38-.051-.64-.145-.863a2 2 0 0 0-1.09-1.083M12.5 15c1.67 0 3.023-1.343 3.023-3S14.169 9 12.5 9s-3.023 1.343-3.023 3s1.354 3 3.023 3" clipRule="evenodd"/></svg></a>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header