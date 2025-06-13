import { useEffect, useState} from "react"
import { fetchFriendList, friendDelete } from "@/services/friendService"
import { Button } from "./ui/button"
import { API_BASE_URL } from "@/config"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Separator } from "./ui/separator"
import { Link } from "react-router-dom"
import { jwtDecode } from "jwt-decode"

interface JwtPayload{
    id: number
}

export function FriendList({userId, refreshSignal}: { userId: number, refreshSignal: boolean}) {
    const [friends, setFriends] = useState<any[]>([])
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")
    const [currentUserId, setCurrentUserId] = useState<number>(0)
    const isMyProfile = currentUserId === userId

    useEffect(() => {
            if(token){
            const decoded = jwtDecode<JwtPayload>(token)
            setCurrentUserId(decoded.id)
        }
        }, [])

    const fetchFriends = () =>{
        fetchFriendList(userId).then(setFriends)
    }

    useEffect(() =>{
        fetchFriends()
    }, [userId, refreshSignal])
    
    const handleDeleteFriend = async (userId: number, friendId: number) =>{
        try{
            await friendDelete(userId, friendId)
            setFriends(prev => prev.filter(f => f.id !== friendId))
        }
        catch(e){
            console.log(e)
            console.log("No se ha podido eliminar al amigo", e)
        }
    }

    useEffect(() => {
        const socket = new WebSocket("wss://localhost:7044/ws")
        const handler = (event: MessageEvent) => {
            const msg = JSON.parse(event.data)
            if (msg === "friend_request_accept"){
                fetchFriends()
            }
        }

        socket.addEventListener("message", handler)
        return () =>{
            socket.removeEventListener("message", handler)
        }
    }, [])

    
    return(
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {friends.length === 0 ?(
                <p>No tienes amigos aún</p>
            ) :
            (friends.map((friend) =>(
                <>
                    <div key={friend.id} className="flex flex-row border-bottom items-center">
                        <div className="w-1/8 relative">
                            <Avatar>
                                <AvatarImage src={`${API_BASE_URL}${friend.profilePicture}`} className="rounded-full"></AvatarImage>
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            {/* <div className="bg-gray-500 w-4 h-4 rounded-full absolute bottom-0 xl:right-2 2xl:right-9 border border-stone-900 z-40 lg:right-2"></div> */}
                        </div>
                        <div className="w-full pl-4 text-left">
                            <HoverCard>
                                <HoverCardTrigger>
                                    <span className="hover:border-b">{friend.name}</span>
                                </HoverCardTrigger>
                                <HoverCardContent className="bg-[#262626] space-y-3">
                                    <div className="flex flex-row text-white items-center">
                                        <img src={`${API_BASE_URL}${friend.profilePicture}`} className="w-10 h-10 mr-4 rounded-full space-y2"/>
                                        <div className="flex flex-col">
                                            <Link to={`/user-profile/${friend.id}`}><strong>@{friend.name}</strong></Link>
                                            <span className="text-sm text-gray-400">{friend.email}</span>
                                        </div>
                                    </div>
                                    <div className="text-white">Aquí puede ir una futura descripción corta</div>
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                        {isMyProfile && (
                            <div className="w-1/8 relative">
                            <Button onClick={() => handleDeleteFriend(userId, friend.id)} className="w-10 h-10 bg-[url(/deleteUserFriend.svg)]! bg-transparent! bg-cover hover:border-none!"></Button>
                            </div> 
                        )}             
                    </div>
                    <Separator/>
                </>
            )))}
        </div>
    )
}