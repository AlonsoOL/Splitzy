import { useEffect, useState} from "react"
import { fetchFriendList } from "@/services/friendService"

export function FriendList({userId}: { userId: number }) {
    const [friends, setFriends] = useState<any[]>([])

    useEffect(() =>{
        fetchFriendList(userId).then(setFriends).catch(console.error)
    }, [userId])

    return(
        <div>
            {friends.map((friend) =>(
                <div>
                    <div>{friend.imageUrl}</div>
                    <div>{friend.name}</div>
                </div>
            ))}
        </div>
    )
}