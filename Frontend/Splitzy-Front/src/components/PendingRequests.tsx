import { useEffect, useState } from "react";
import { fetchPendingRequests } from "@/services/friendService";

export function PendingRequests({userId}: { userId: number }) {
    const [requests, setRequests] = useState<any[]>([])

    useEffect(() =>{
        fetchPendingRequests(userId).then(setRequests)
    }, [userId])

    return (
        <div>
            {requests.map((r) =>(
                <div key={r.recivedId}>Solicitud enviada a {r.name}</div>
            ))}
        </div>
    )
}