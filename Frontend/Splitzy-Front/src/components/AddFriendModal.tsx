import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { API_BASE_URL, GETALLUSERS } from "@/config"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"
import { Link } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
  id: number
}

interface User {
    id: number,
    name: string,
    email: string,
    imageUrl: string,
}

interface AddFriendModalProps{
    isOpen: boolean,
    onClose: () => void,
    currentUserId: number,
    onSendRequest: (recivedId: number) => void
}

export function AddFriendModal({
    isOpen,
    onClose,
    currentUserId,
    onSendRequest
}: AddFriendModalProps){
    const[searchTerm, setSearchTerm] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")
    const [userId, setUserId] = useState<number>(0)

    useEffect(() => {
        if (token) {
        const decoded = jwtDecode<JwtPayload>(token)
        setUserId(decoded.id)
        }
    }, [])

    useEffect(() => {
        if(isOpen){
            console.log(userId)
            document.body.style.overflow = "hidden"
            fetch(`${GETALLUSERS}/?userId=${userId}`)
            .then((res) => res.json()
            .then((data) =>setUsers(data.filter((u: User) => u.id !== currentUserId ))))
        }
        return () =>{
            document.body.style.overflow = "auto"
        }
        
    },[isOpen, currentUserId])

    if (!isOpen)return null

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return(
        <div className="absolute left-0 top-0 bg-[#242424a6]! w-full h-full">
            <div className={`absolute w-[75%] h-[50%] bg-black z-50 bg-[#242424]! rounded-[21px] top-[10%] right-[12.5%] overflow-hidden ${isOpen ? "flex" : "hidden"}`} >
                <div className="w-full h-full p-4 space-y-4 overflow-y-auto">
                    <div className="flex w-full space-y-4 items-center text-left">
                        <span className="w-1/3! text-center sr-only xl:not-sr-only lg:not-sr-only">Foto de perfil</span>
                        <span className="w-1/3! sr-only xl:not-sr-only lg:not-sr-only md:not-sr-only">Nombre</span>
                        <span className="w-1/3! not-sr-only"> Correo electrónico</span>
                        <input className="p-2 border rounded-[11px]" placeholder="Buscar usuarios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                    <div className="flex flex-col items-center w-full">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="flex w-full space-y-4! items-center text-left">
                                <div className="flex w-1/3! justify-center sr-only xl:not-sr-only lg:not-sr-only">
                                    <Avatar>
                                        <AvatarImage src={`${API_BASE_URL}${user.imageUrl}`} className="rounded-full"></AvatarImage>
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-1/3! cursor-pointer sr-only xl:not-sr-only lg:not-sr-only md:not-sr-only">
                                <HoverCard>
                                    <HoverCardTrigger>
                                        <span className="w-1/3! sr-only xl:not-sr-only lg:not-sr-only md:not-sr-only">{user.name}</span>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="bg-[#262626] space-y-3">
                                        <div className="flex flex-row text-white items-center">
                                            <img src={`${API_BASE_URL}${user.imageUrl}`} className="w-10 h-10 mr-4 rounded-full space-y2"/>
                                            <div className="flex flex-col">
                                                <Link to={`/user-profile/${user.id}`}><strong>@{user.name}</strong></Link>
                                                <span className="text-sm text-gray-400">{user.email}</span>
                                            </div>
                                        </div>
                                        <div className="text-white">Aquí puede ir una futura descripción corta</div>
                                    </HoverCardContent>
                                </HoverCard>
                                </div>
                                <span className="w-1/3! not-sr-only">{user.email}</span>
                                <Button onClick={() => onSendRequest(user.id)}>Enviar solicitud</Button>
                            </div>
                        ))}
                    </div>
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
            </div>
        </div>
    )
}