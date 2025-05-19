import { useSendFriendRequest } from "@/hook/useSendFriendRequest";

export const FriendRequestButton = ({ senderId, recivedId }: {senderId: number; recivedId: number}) =>{
    const sendRequest = useSendFriendRequest()

    return(
        <button onClick={() => sendRequest(senderId, recivedId)}>
            Eviar solicitud de amistad
        </button>
    )
}