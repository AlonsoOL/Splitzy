import { useEffect, useState } from "react";
import { acceptRequest, fetchRecivedRequests, rejectRequest } from "@/services/friendService";
import { Button } from "@/components/ui/button";

export function FriendRequests({userId}: {userId: number}){
    const [requests, setRequests] = useState<any[]>([])

    useEffect(() => {
        fetchRecivedRequests(userId).then(setRequests)
    }, [userId])

    const handleAccept = async (id: number) => {
        await acceptRequest(id)
        setRequests(prev => prev.filter(r => r.id !== id))
    }

    const handleReject = async (id: number) => {
        await rejectRequest(id)
        setRequests(prev => prev.filter(r => r.id !== id))
    }

    return (
        <div>
            {requests.map((r) => (
                <div>
                    <div key={r.id}>
                        <div>{r.senderName} te ha enviado una solicitud</div>
                        <div>
                            <Button onClick={() => handleAccept(r.id)}>Aceptar</Button>
                            <Button onClick={() => handleReject(r.id)}>Rechazar</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}