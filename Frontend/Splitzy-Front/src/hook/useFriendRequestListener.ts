import { useWebsocket } from "@/context/WebSocketContext";
import { useEffect } from "react";

export const useFriendRequestListener = (onRequest: (data: any) => void) =>{
    const socket = useWebsocket()

    useEffect(() => {
        if (!socket) return

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data)

            if (message.type === "friend_request_recived"){
                onRequest(message.data)
            }
        }
    }, [socket])
}