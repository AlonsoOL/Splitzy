import { createContext, useContext, useEffect, useRef, useState } from "react";

const WebSocketContext = createContext<WebSocket | null>(null)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const socketRef = useRef<WebSocket | null>(null)
    const [ socket, setSocket] = useState<WebSocket | null>(null)
    
    useEffect(() =>{
        const socketInstance = new WebSocket("wss://localhost:7044/ws")
        socketRef.current = socketInstance

        socketInstance.onopen = () => {
            console.log("WebSocket conectado")
            setSocket(socketInstance)
        }

        socketInstance.onclose = () => {
            console.log(socketRef)
            console.log("WebSocket desconectado")
        }

        return () => {
            socketInstance.close()
        }
    }, [])

    return (
        <WebSocketContext.Provider value={socket}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebsocket = () => useContext(WebSocketContext)