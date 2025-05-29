import { useEffect, useState } from "react"
import { Button } from "./ui/button"

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
            fetch("https://localhost:7044/api/Friends/GetAllUsers")
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

    console.log(users)
    return(
        <div className="absolute left-0 top-0 bg-[#242424a6]! w-full h-full">
            <div className={`absolute w-[50%] h-[50%] bg-black z-50 bg-[#242424]! rounded-[21px] top-[10%] right-[25%] overflow-hidden ${isOpen ? "flex" : "hidden"}`} >
                <div className="w-full h-full p-4 space-y-4 overflow-y-auto">
                    <div className="flex w-full space-y-4 items-center text-left">
                        <span className="w-1/3 text-center">Foto de perfil</span>
                        <span className="w-1/3">Nombre</span>
                        <span className="w-1/3"> Correo electrónico</span>
                        <input className="p-2" placeholder="Buscar usuarios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                    <div className="flex flex-col items-center w-full">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="flex w-full space-y-4 items-center text-left">
                                <div className="flex w-1/3 justify-center">
                                    <img src={`https://localhost:7044${user.imageUrl}`}  className="w-15 h-15 mr-4 rounded-full"/>
                                    </div>
                                <a href="#" className="w-1/3">{user.name}</a>
                                <span className="w-1/3">{user.email}</span>
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