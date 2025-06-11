import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { API_BASE_URL, GETALLUSERS } from "@/config"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

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

    useEffect(() => {
        if(isOpen){
            document.body.style.overflow = "hidden"
            fetch(GETALLUSERS)
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
                                <span className="w-1/3! sr-only xl:not-sr-only lg:not-sr-only md:not-sr-only"><a href={`/user-name`}>{user.name}</a></span>
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