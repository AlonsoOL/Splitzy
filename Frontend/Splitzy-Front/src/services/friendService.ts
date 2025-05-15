export const fetchFriendList = async (userId: number) => {
    const response = await fetch(`https://localhost:7044/api/FriendRequest/pending/${userId}`)
    if (!response.ok) throw new Error ("No se pudo obtener la lista de amigos")
    return response.json()
}

export const fetchPendingRequests = async (userId: number) => {
    const response = await fetch(`https://localhost:7044/api/FriendRequest/pending/${userId}`)
    if (!response.ok) throw new Error ("No se pudo obtener las solicitudes pendientes")
    return response.json()
}

export const fetchRecivedRequests = async (userId: number) =>{
    const response = await fetch(`https://localhost:7044/api/FriendRequest/pending/${userId}`)
    if (!response.ok) throw new Error ("No se pudo obtener las solicitudes recibidas")
    return response.json()
}

export const acceptRequest = async (requestId: number) => {
    const response = await fetch(`https://localhost:7044/api/FriendRequest/accept/${requestId}`, {
        method: "POST"
    })
    if (!response.ok) throw new Error ("No se ha podido enviar la solicitud")
}

export const rejectRequest = async (requestId: number) => {
    const response = await fetch(`https://localhost:7044/api/FriendRequest/reject/${requestId}`, {
        method: "POST"
    })
    if (!response.ok) throw new Error ("No se ha podido rechazar la solicitud")
}