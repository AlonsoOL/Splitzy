import { createContext, useContext, useState, useEffect } from "react";
import { useWebsocket } from "./WebSocketContext";
import { useLocation } from "react-router-dom";

interface NotificationContextType{
    hasNotification: boolean,
    setHasNotification: (value: boolean) => void
    clearNotification: () => void
}

const NotificationContext = createContext<NotificationContextType>({
    hasNotification: false,
    setHasNotification: () => {},
    clearNotification: () => {}
})
// console.log("tengo que añadir más mensajes para gestionar cosas")

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }: { children: React.ReactNode}) =>{
    const [hasNotification, setHasNotification] = useState(false)
    const socket = useWebsocket()
    const location = useLocation()

    const clearNotification = () => {
        setHasNotification(false)
    }

    useEffect(() => {
        if (!socket) return

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data)

            if ((message.Type === "friend_request" || message.Type === "friend_request_reject" || message.Type === "friend_resquest_accept" || message.Type === "delete_friend") && location.pathname !== "/menu-user"){
                setHasNotification(true)
            }
        }
    }, [socket])

    return(
        <NotificationContext.Provider value = {{hasNotification, setHasNotification, clearNotification}}>
            {children}
        </NotificationContext.Provider>
    )

    
}