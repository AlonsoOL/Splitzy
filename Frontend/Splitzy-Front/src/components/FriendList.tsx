import { useEffect, useState} from "react"
import { fetchFriendList, friendDelete } from "@/services/friendService"
import { Button } from "./ui/button"

export function FriendList({userId}: { userId: number }) {
    const [friends, setFriends] = useState<any[]>([])

    useEffect(() =>{
        fetchFriendList(userId).then(setFriends).catch(console.error)
    }, [userId])
    
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

    return(
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {friends.length === 0 ?(
                <p>No tienes amigos aún</p>
            ) :
            (friends.map((friend) =>(
                <div key={friend.id} className="flex flex-row border-bottom items-center border-b-2 pb-2">
                    <div className="w-1/8 relative">
                        <img src={`https://localhost:7044${friend.profilePicture}`} className="w-10 h-10 mr-4 rounded-full"/>
                        <div className="bg-gray-500 w-4 h-4 rounded-full absolute bottom-0 xl:right-5 border border-stone-900 z-40 lg:right-2"></div>
                    </div>
                    <div className="w-1/2 text-left">
                        <p>{friend.name}</p>
                    </div>
                    <div className="w-1/8 relative">
                        <Button onClick={() => handleDeleteFriend(userId, friend.id)} className="w-10 h-10 bg-[url(/deleteUserFriend.svg)]! bg-transparent! bg-cover hover:border-none!"></Button>
                    </div>
                </div>
            )))}
        </div>
    )
}