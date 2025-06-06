import { ACCEPTREQUEST, FETCHFRIENDLIST, FETCHREQUESTPENDING, REJECTREQUEST, REMOVEFRIEND } from "@/config"

export const fetchFriendList = async (userId: number) => {
    const response = await fetch(`${FETCHFRIENDLIST}${userId}`)
    if (!response.ok) throw new Error ("No se pudo obtener la lista de amigos")
    return response.json()
}

export const fetchPendingRequests = async (userId: number) => {
    const response = await fetch(`${FETCHREQUESTPENDING}${userId}`)
    if (!response.ok) throw new Error ("No se pudo obtener las solicitudes pendientes")
    return response.json()
}

export const acceptRequest = async (recivedId: number, senderId: number) => {
    const response = await fetch(ACCEPTREQUEST, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ recivedId, senderId}),
    })
    if (!response.ok) throw new Error ("No se ha podido enviar la solicitud")
}

export const rejectRequest = async (recivedId: number, senderId: number) => {
    const response = await fetch(REJECTREQUEST, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ recivedId, senderId}),
    })
    if (!response.ok) throw new Error ("No se ha podido rechazar la solicitud")
}

export const friendDelete = async (userId: number, friendId: number) =>{
    const response = await fetch(REMOVEFRIEND,{
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ userId, friendId}),
    })
    if (!response.ok) throw new Error ("Ha habido un fallo al eliminar la amistad")
}