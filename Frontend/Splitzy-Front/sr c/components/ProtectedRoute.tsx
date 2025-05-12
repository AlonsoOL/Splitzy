import { useAuth } from "@/context/AuthContext";
import { JSX } from "react";
import { Navigate } from "react-router-dom";


interface ProtectRouteProps{
    children: JSX.Element
}

export default function ProtectRoute({ children }: ProtectRouteProps){
    const { isAuthenticated, isLoading } = useAuth()

    if(isLoading) return null
    if (!isAuthenticated){
        console.log("ha intentado acceder un usuario", isAuthenticated)
        return <Navigate to="/login" replace/>
    }

    return (children)
}