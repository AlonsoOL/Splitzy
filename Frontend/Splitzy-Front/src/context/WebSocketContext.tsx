import { createContext, useContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload{
    id: number,
}

const WebSocketContext = createContext<WebSocket | null>(null)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const socketRef = useRef<WebSocket | null>(null)
    const [ socket, setSocket] = useState<WebSocket | null>(null)
    const [ userId, setUserId ] = useState<number | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("user") || sessionStorage.getItem("user")    
        if(token){
            const decoded = jwtDecode<JwtPayload>(token)
            setUserId(decoded.id)
        }
        }, [])
    
    useEffect(() =>{
        if (userId == null) return

        const socketInstance = new WebSocket("wss://localhost:7044/ws")
        socketRef.current = socketInstance

        socketInstance.onopen = () => {
            console.log("WebSocket conectado")
            setSocket(socketInstance)

            socketInstance.send(JSON.stringify({
                Type: "init",
                Data:{
                    SenderId: userId
                }
            }))
        }

        socketInstance.onclose = () => {
            console.log("WebSocket desconectado")
        }

        return () => {
            socketInstance.close()
        }
    }, [userId])

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebsocket = () => useContext(WebSocketContext)