import { useEffect, useState} from "react"
import { fetchFriendList } from "@/services/friendService"

export function FriendList({userId}: { userId: number }) {
    const [friends, setFriends] = useState<any[]>([])

    useEffect(() =>{
        fetchFriendList(userId).then(setFriends).catch(console.error)
    }, [userId])
    console.log("estos son mis amigos:", friends.map(friend => friend))
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
                </div>
            )))}
        </div>
    )
}