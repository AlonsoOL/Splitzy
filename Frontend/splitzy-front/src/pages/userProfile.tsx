import { FriendList } from "@/components/FriendList"
import { API_BASE_URL, GETCURRENTUSER } from "@/config"
import { useWebsocket } from "@/context/WebSocketContext"
import { Separator } from "@/components/ui/separator"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"

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

function UserProfile(){
    const socket = useWebsocket()
    const [currentUserId, setCurrentUserId] = useState<number>(0)
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")
    const [user, setUser] = useState<userProfile | null>(null)
    const [ notification, setNotification ] = useState<string[]>([])
    const [refreshFriendList, setRefreshFriendList] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false) 

    useEffect(() => {
        if(token){
        const decoded = jwtDecode<JwtPayload>(token)
        setCurrentUserId(decoded.id)
        setIsAuthenticated(true)
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
                <div className="w-full h-160 p-20 bg-[#1b1b1b48] rounded-[21px] space-x-6 flex flex-raw">
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
                        </div>
                    )}
                    <Separator orientation="vertical"/>
                    <div className="w-[50%] space-y-6">
                        <div className="text-4xl">Amigos:</div>
                        <FriendList userId={currentUserId} refreshSignal={refreshFriendList} isAuthenticated={isAuthenticated}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile