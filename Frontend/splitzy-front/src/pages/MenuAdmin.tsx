import { Button } from "@/components/ui/button"
import { use, useEffect, useState } from "react"

interface User{
    id: string,
    name: string,
    email: string,
    role: string,
    imageUrl?: string,
}

function MenuAdmin(){
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("user") || sessionStorage.getItem("user")
        
        const fetchUsers = async() => {
            try{
                const response = await fetch("https://localhost:7044/api/User",{
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                })
                console.log("este es el ussuario", token)
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
            finally{
                setLoading(false)
            }
        }

        fetchUsers()

    }, [])
    

    return(
        <div className="w-full bg-[url(/fondo-splitzy.png)] bg-cover">
            <div className="min-h-screen w-full flex flex-row items-center justify-center backdrop-blur-2xl xl:gap-10 md:gap-5">
                {/* Sección actividad reciente */}
                <div className="w-1/2 h-160 p-8 bg-[#1b1b1b48] rounded-[21px] space-y-3">
                    <div className="text-xl">Lista de usuarios</div>
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
                                    <img src={`https://localhost:7044${user.imageUrl}`} className="rounded-full w-[50px] h-[50px]"/>
                                </div>
                                <p className="w-1/5">{user.name}</p>
                                <p className="w-1/5">{user.email}</p>
                                <p className="w-1/5">{user.role}</p>
                                <Button className="hover:bg-green-400! w-1/5">Cambiar rol</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MenuAdmin