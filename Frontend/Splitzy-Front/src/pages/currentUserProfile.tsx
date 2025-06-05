import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { API_BASE_URL, DELETEUSERACCOUNT, GETCURRENTUSER } from "@/config"
import { DialogClose } from "@radix-ui/react-dialog"
import { Separator } from "@/components/ui/separator";
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FriendList } from "@/components/FriendList";
import { useWebsocket } from "@/context/WebSocketContext";

interface JwtPayload{
    id: number
}

interface userProfile{
    id: number,
    name: string,
    email: string,
    role: string,
    imageUrl: string,
    address: string,
    phone: string,
}

function CurrentUserProfile(){
    const socket = useWebsocket()
    const [currentUserId, setCurrentUserId] = useState<number>(0)
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")
    const [user, setUser] = useState<userProfile | null>(null)
    const [ notification, setNotification ] = useState<string[]>([])
    const navigate = useNavigate();
    const [refreshFriendList, setRefreshFriendList] = useState(false)

    useEffect(() => {
        if(token){
        const decoded = jwtDecode<JwtPayload>(token)
        setCurrentUserId(decoded.id)
    }
    }, [])

    useEffect(() =>{
            if (!socket) return
            
            const handler = (event: MessageEvent) => {
                try {
                    const msg = JSON.parse(event.data)
    
                    if( msg.Type === "friend_request_reject"){
                        const { RecivedName } = msg.Data
                        const message = `${RecivedName} ha rechazado la solicitud de amistad`
    
                        setNotification(prev => [...prev, message])
                    }
    
                    if(msg.Type === "friend_request_accept"){
                        const { RecivedName } = msg.Data
                        const message = `${RecivedName} ha aceptado la solicitud de amistad`
    
                        setNotification(prev => [...prev, message])
                        setRefreshFriendList(prev => !prev)
                    }
    
                    if(msg.Type === "delete_friend"){
                        const {removeByName} = msg.Data
                        const message = `${removeByName} y tú ya no sois amigos.`
    
                        setNotification(prev => [...prev, message])
                        setRefreshFriendList(prev => !prev)
                    }
    
                }catch (e){
                    console.error("ws mensaje inválido", e)
                }
            }
    
            socket.addEventListener("message", handler)
            return () => { socket.removeEventListener("message", handler)}
        }, [socket, currentUserId])

        useEffect(() =>{
            if (notification.length === 0) return

            const timer = setTimeout(() => {
                setNotification(prev => prev.slice(1))
            }, 3600)

            return () =>clearTimeout(timer)
        }, [notification])

    useEffect(() =>{
        const fetchProfile = async () => {
            const response = await fetch(`${GETCURRENTUSER}${currentUserId}`, {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok){
                const errorData = await response.json()
                console.log(errorData)
            }

            const data = await response.json()
            setUser(data)
        }

        fetchProfile()
    }, [currentUserId])

    const handleDeleteAccount = async () => {
        try{
            const response = await fetch(`${DELETEUSERACCOUNT}${currentUserId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            localStorage.removeItem("user")
            sessionStorage.removeItem("user")
            navigate("/login")
        }
        catch(error: any){
            console.error("no se ha podido eliminar el usuario correctamente", error)
        }
    }

    return (
        <div className="min-h-screen w-full bg-[url(/fondo-splitzy.png)] bg-cover">
            <div className="min-h-screen w-full p-10 items-center justify-center backdrop-blur-2xl xl:gap-10 md:gap-5">
                {notification.length > 0 && (
                    <div className="absolute top-5 right-1 bg-black p-4">
                    {notification.map((note) => (
                        <div>{note}</div>
                    ))}
                    </div>
                )}
                <div className="w-full h-160 p-20 bg-[#1b1b1b48] rounded-[21px] space-x-4  flex flex-raw">
                    {user && (
                        <div className="w-[50%] items-center flex flex-col h-full space-y-6">
                            <div className="flex items-center justify-center w-41 h-41 rounded-full border">
                                <img src={`${API_BASE_URL}${user.imageUrl}`} className="w-40 h-40 rounded-full"/>
                            </div>
                            {/* <Button>Cambiar foto de perfil</Button> */}
                            <Separator/>
                            <div className="flex w-full space-x-6 text-left">
                                <div className="w-1/2 flex flex-col" >
                                    <span>Nombre:</span> 
                                    <span className="text-2xl">{user.name}</span>
                                </div>
                                <div className="w-1/2 flex flex-col">
                                    <span>Email:</span>
                                    <span className="text-2xl">{user.email}</span>
                                </div>
                            </div>
                            <div className="flex w-full space-x-6 text-left">
                                <div className="w-1/2 flex flex-col">
                                    <span>Dirección:</span> 
                                    <span className="text-2xl">{user.address}</span>
                                </div>
                                <div className="w-1/2 flex flex-col">
                                    <span>Teléfono:</span>
                                    <span className="text-2xl">{user.phone}</span>
                                </div>
                            </div>
                            <Dialog>
                                <form>
                                    <DialogTrigger asChild>
                                        <Button>Editar perfil</Button>
                                        
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Editar perfil</DialogTitle>
                                            <DialogDescription>
                                                Edita tus datos de perfil y pulsa en "guardar" para actualizar tu información de perfil
                                            </DialogDescription>
                                        </DialogHeader>
                                        {/* Aquí van los campos para cambiar los datos del usuario */}
                                        <label>Nombre</label>
                                        <input type="text" placeholder="Tu nombre" value={user.name}/>
                                        <input/>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button>Cancelar</Button>
                                            </DialogClose>
                                            <Button type="submit">Guardar Cambios</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </form>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-red-500! transition duration-500 text-white! hover:border-transparent! hover:bg-white! hover:text-red-500!">Eliminar perfil</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>¿Estás seguro?</DialogTitle>
                                        <DialogDescription>
                                            Tu cuenta será eliminada definitivamente
                                        </DialogDescription>
                                    </DialogHeader>
                                    {/* Aquí van los campos para cambiar los datos del usuario */}
                                    <DialogFooter>
                                        <Button onClick={handleDeleteAccount} className="bg-red-500! transition duration-500 text-white! hover:border-transparent! hover:bg-white! hover:text-red-500!">
                                            Eliminar
                                        </Button>
                                        <DialogClose asChild>
                                            <Button>Cancelar</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                    <Separator orientation="vertical"/>
                    <div className="w-[40%] space-y-6">
                        <div className="text-4xl">Amigos:</div>
                        <FriendList userId={currentUserId} refreshSignal={refreshFriendList}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CurrentUserProfile