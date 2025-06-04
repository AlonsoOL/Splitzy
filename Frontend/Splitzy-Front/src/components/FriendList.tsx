import { useEffect, useState} from "react"
import { fetchFriendList, friendDelete } from "@/services/friendService"
import { Button } from "./ui/button"
import { Separator } from "./ui/separator"


export function FriendList({userId, refreshSignal}: { userId: number, refreshSignal: boolean }) {
    const [friends, setFriends] = useState<any[]>([])

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
                <div key={friend.id} className="flex flex-row w-full items-center">
                    <div className="w-1/8 relative">
                        <img src={`https://localhost:7044${friend.profilePicture}`} className="w-10 h-10 mr-4 rounded-full"/>
                        <div className="bg-gray-500 w-4 h-4 rounded-full absolute bottom-0 xl:right-4 border border-stone-900 z-40 lg:right-2"></div>
                    </div>
                    <div className="w-full text-left">
                        <p>{friend.name}</p>
                    </div>
                    <div className="w-1/8">
                        <Button onClick={() => handleDeleteFriend(userId, friend.id)} className="w-10 h-10 bg-[url(/deleteUserFriend.svg)]! bg-transparent! bg-cover hover:border-none!"></Button>
                    </div>
                    
                </div>
            )))}
            <Separator className="my-4"/>
        </div>
    )
}