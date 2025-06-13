import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { API_BASE_URL, CHANGEROLE, GETUSERSADMIN } from "@/config"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"

interface JwtPayload{
    id: number
}

interface User{
    id: number,
    name: string,
    email: string,
    role: string,
    imageUrl?: string,
}

interface HandleRole{
    userId: number,
    Role: string,
}

function MenuAdmin(){
    const [users, setUsers] = useState<User[]>([])
    const [currentUserId, setCurrentUserId] = useState<number>(0)
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")

    useEffect(() => {
        if(token){
        const decoded = jwtDecode<JwtPayload>(token)
        setCurrentUserId(decoded.id)
    }
    }, [])

    useEffect(() => {        
        const fetchUsers = async() => {
            try{
                const response = await fetch(GETUSERSADMIN,{
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                })
                
                if(!response.ok){
                    console.log("estoy dentro del if")
                    throw new Error("error al cargar a los usuarios")
                }
                const data = await response.json()
                setUsers(data)
            }
            catch(error){
                console.log("estoy dentro del catch")
                console.error("Error al cargar los usuarios:", error)
            }
        }

        fetchUsers()

    }, [])

    const HandleChangeRole = async (userId: number, Role:string) => {

        if(currentUserId == userId){
            console.log("No te puedes cambiar el rol a ti mismo")
        }
        else{
            if(Role == "Admin"){
            Role = "User"
            }
            else{
                Role = "Admin"
            }

            const payload: HandleRole = {userId, Role}

            const response = await fetch(CHANGEROLE ,{
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })
            const updateUser: User = await response.json()
            
            setUsers(prevUsers => prevUsers.map(user => user.id === userId ? {...user, role:updateUser.role} : user))
            if(!response.ok){
                const error = await response.json()
                console.log("error al manejar el rol")
                throw new Error(error.Message)
            }
        }
    }

    return(
        <div className="w-full bg-[url(/fondo-splitzy.png)] bg-cover">
            <div className="min-h-screen w-full flex flex-row items-center justify-center backdrop-blur-2xl 2xl:gap-10 xl:gap-10 gap-5 overflow-hidden">
                <div className="w-[75%] h-160 p-8 bg-[#1b1b1b48] rounded-[21px] space-y-3 overflow-y-auto overflow-x-auto">
                    <div className="text-3xl">Lista de usuarios</div>
                    <div className="flex flex-raw border-b-1 border-stone-500 items-center pb-3">
                        <div className="flex flex-raw items-center w-full">
                            <p className="w-1/5">Foto de perfil</p>
                            <p className="w-1/5">Nombre</p>
                            <p className="w-1/5">Correo electrónico</p>
                            <p className="w-1/5">Rol</p>
                        </div>
                    </div>
                    {users.map(user => (
                        <div className="flex flex-raw border-b-1 border-stone-500 items-center pb-3">
                            <div key={user.id} className="flex flex-raw items-center gap-x-1 w-full">
                                <div className="w-1/5 flex justify-center">
                                    <Avatar className="2xl:size-15 xl:size-15 lg:size-15 md:size-10">
                                        <AvatarImage src={`${API_BASE_URL}${user.imageUrl}`} className="rounded-full"></AvatarImage>
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </div>
                                <p className="w-1/5">{user.name}</p>
                                <p className="w-1/5">{user.email}</p>
                                <p className="w-1/5">{user.role}</p>
                                <Button className="hover:bg-green-400! w-1/5" onClick={() => HandleChangeRole(user.id, user.role)}>Cambiar rol</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MenuAdmin