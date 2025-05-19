import { createContext, useContext, useEffect, useRef } from "react";

const WebSocketContext = createContext<WebSocket | null>(null)

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const socketRef = useRef<WebSocket | null>(null)
    
    useEffect(() =>{
        const socket = new WebSocket("ws://localhost:7044/ws")
        socketRef.current = socket

        socket.onopen = () => {
            console.log("WebSocket conectado")
        }

        socket.onclose = () => {
            console.log("WebSocket desconectado")
        }

        return () => {
            socket.close()
        }
    }, [])

    return (
        <WebSocketContext.Provider value={socketRef.current}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWebsocket = () => useContext(WebSocketContext)