import { useEffect, useState } from "react"
import { Button } from "./ui/button"

interface User {
    id: number,
    name: string,
    mail: string,
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

    return(
        <div className={`${isOpen ? "flex" : "hidden"}`} >
            <div>
                <input placeholder="Buscar usuarios..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                <div className="flex flex-col items-center border-1 border-solid ">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="">
                            <img src={`https://localhost:7044${user.imageUrl}`}  className="w-10 h-10 mr-4 rounded-full"/>
                            <span>{user.name}</span>
                            <span>{user.mail}</span>
                            <Button onClick={() => onSendRequest(user.id)}>Enviar solicitud</Button>
                        </div>
                    ))}
                </div>
                <Button onClick={onClose}>Cerrar</Button>
            </div>
        </div>
    )
}