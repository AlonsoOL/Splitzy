"use client"

import { Button } from "@/components/ui/button"
import { FriendList } from "@/components/FriendList"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
import { AddFriendModal } from "@/components/AddFriendModal"
import { useSendFriendRequest } from "@/hook/useSendFriendRequest"
import { acceptRequest, fetchPendingRequests, rejectRequest } from "@/services/friendService"
import { useWebsocket } from "@/context/WebSocketContext"
import { useNotification } from "@/context/NotificationContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { API_BASE_URL } from "@/config"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Link } from "react-router-dom"
import { CreateGroupModal } from "@/components/CreateGroupModal"
import { groupService, type CreateGroupRequest } from "@/services/groupService"
import { GroupList } from "@/components/GroupList"

interface JwtPayload {
  id: number
}

interface FriendRequestDto {
  id: number
  recivedId: number
  senderId: number
  senderName: string
  senderImageUrl: string
}

function MenuUser() {
  const socket = useWebsocket()
  const [modalOpen, setModalOpen] = useState(false)
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const sendRequest = useSendFriendRequest()
  const token = localStorage.getItem("user") || sessionStorage.getItem("user")
  const [userId, setUserId] = useState<number>(0)
  const [notification, setNotification] = useState<string[]>([])
  const [refreshFriendList, setRefreshFriendList] = useState(false)
  const [refreshGroupList, setRefreshGroupList] = useState(false)
  const { clearNotification } = useNotification()
  const [pending, setPending] = useState<FriendRequestDto[]>([])
  const [pendingGroupInvitations, setPendingGroupInvitations] = useState<any[]>([])

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token)
      setUserId(decoded.id)
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    fetchPendingRequests(userId).then((data: FriendRequestDto[]) => {
      setPending(data)
    })

    const handler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data)

        if (msg.Type === "friend_request") {
          const request = msg.Data

          const newRequest: FriendRequestDto = {
            id: request.id,
            recivedId: userId,
            senderId: request.sender.SenderId,
            senderName: request.sender.name,
            senderImageUrl: request.sender.imageUrl,
          }

          setPending((prev) => [...prev, newRequest])
        }

        if (msg.Type === "friend_request_reject") {
          const { RecivedName } = msg.Data
          const message = `${RecivedName} ha rechazado la solicitud de amistad`

          setNotification((prev) => [...prev, message])
        }

        if (msg.Type === "friend_request_accept") {
          const { RecivedName } = msg.Data
          const message = `${RecivedName} ha aceptado la solicitud de amistad`

          setNotification((prev) => [...prev, message])
          setRefreshFriendList((prev) => !prev)
        }

        if (msg.Type === "delete_friend") {
          const { removeByName } = msg.Data
          const message = `${removeByName} y tú ya no sois amigos.`

          setNotification((prev) => [...prev, message])
          setRefreshFriendList((prev) => !prev)
        }

        // Group-related WebSocket events
        if (msg.Type === "group_invitation") {
          const { groupName, inviterName } = msg.Data
          const message = `${inviterName} te ha invitado al grupo ${groupName}`
          setNotification((prev) => [...prev, message])
        }

        if (msg.Type === "group_expense_added") {
          const { groupName, expenseName, userName, amount } = msg.Data
          const message = `${userName} añadió un gasto de ${amount}€ en ${groupName}: ${expenseName}`
          setNotification((prev) => [...prev, message])
          setRefreshGroupList((prev) => !prev)
        }

        if (msg.Type === "group_payment_added") {
          const { groupName, payerName, receiverName, amount } = msg.Data
          const message = `${payerName} pagó ${amount}€ a ${receiverName} en ${groupName}`
          setNotification((prev) => [...prev, message])
          setRefreshGroupList((prev) => !prev)
        }
      } catch (e) {
        console.error("ws mensaje inválido", e)
      }
    }

    socket.addEventListener("message", handler)
    return () => {
      socket.removeEventListener("message", handler)
    }
  }, [socket, userId])

  useEffect(() => {
    if (userId > 0) {
      // Fetch pending group invitations
      groupService
        .getPendingInvitations(userId)
        .then((data) => {
          setPendingGroupInvitations(data)
        })
        .catch((error) => {
          console.error("Error fetching group invitations:", error)
        })
    }
  }, [userId, refreshGroupList])

  useEffect(() => {
    if (notification.length === 0) return

    const timer = setTimeout(() => {
      setNotification((prev) => prev.slice(1))
    }, 3600)

    return () => clearTimeout(timer)
  }, [notification])

  const handleSendRequest = async (recivedId: number) => {
    try {
      await sendRequest(userId, recivedId)
    } catch {
      alert("error al enviar la solicitud")
    }
  }

  const handleAccept = async (recivedId: number, senderId: number, requestId: number) => {
    try {
      await acceptRequest(recivedId, senderId)
      setPending((cur) => cur.filter((r) => r.id !== requestId))
      setRefreshFriendList((prev) => !prev)
    } catch (e) {
      console.error("No se ha podido aceptar la solicitud de amistad", e)
    }
  }

  const handleReject = async (recivedId: number, senderId: number, requestid: number) => {
    try {
      await rejectRequest(recivedId, senderId)
      clearNotification()
      setPending((cur) => cur.filter((r) => r.id !== requestid))
    } catch (e) {
      console.error("No se ha podido rechazar la solicitud", e)
    }
  }

  const handleCreateGroup = async (request: CreateGroupRequest) => {
    try {
      await groupService.createGroup(request)
      setRefreshGroupList((prev) => !prev)
    } catch (error) {
      console.error("Error creating group:", error)
      throw error
    }
  }

  const handleAcceptGroupInvitation = async (invitationId: number) => {
    try {
      await groupService.acceptGroupInvitation(invitationId, userId)
      setPendingGroupInvitations((current) => current.filter((inv) => inv.id !== invitationId))
      setRefreshGroupList((prev) => !prev)
    } catch (error) {
      console.error("Error accepting group invitation:", error)
    }
  }

  const handleRejectGroupInvitation = async (invitationId: number) => {
    try {
      await groupService.rejectGroupInvitation(invitationId, userId)
      setPendingGroupInvitations((current) => current.filter((inv) => inv.id !== invitationId))
    } catch (error) {
      console.error("Error rejecting group invitation:", error)
    }
  }

  return (
    <div className="w-full bg-[url(/fondo-splitzy.png)] bg-cover">
      <div className="min-h-screen w-full flex flex-col 2xl:flex-row xl:flex-row lg:flex-row items-center justify-center backdrop-blur-2xl 2xl:gap-10 xl:gap-10 gap-5">
        {notification.length > 0 && (
          <div className="absolute top-5 right-1 bg-black p-4 rounded-lg max-w-sm z-50">
            {notification.map((note, index) => (
              <div key={index} className="text-white text-sm mb-2 last:mb-0">
                {note}
              </div>
            ))}
          </div>
        )}
        <div className="w-1/6"></div>
        <div className="2xl:w-1/2 xl:w-1/2 lg:w-1/2 w-[85%] flex flex-col 2xl:gap-10 xl:gap-10 gap-5">
          {/* Sección de los amigos */}
          <div className="bg-[#242424e0] rounded-[21px] overflow-hidden h-75 p-8">
            <div className="flex flex-row mb-4">
              <p className="w-1/2 text-left">Amigos</p>
              <div className="w-1/2 text-right ">
                <a href="#" className="cursor-pointer" onClick={() => setModalOpen(true)}>
                  Añadir amigo
                </a>
                <div>
                  <AddFriendModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    currentUserId={userId}
                    onSendRequest={handleSendRequest}
                  ></AddFriendModal>
                </div>
              </div>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              <FriendList userId={userId} refreshSignal={refreshFriendList} />
            </div>
          </div>

          {/* Sección de los grupos */}
          <div className="h-75 p-8 bg-[#242424e0] rounded-[21px] overflow-hidden">
            <div className="flex flex-row mb-4">
              <p className="w-1/2 text-left">Grupos</p>
              <div className="w-1/2 text-right">
                <a href="#" className="cursor-pointer hover:underline" onClick={() => setGroupModalOpen(true)}>
                  Crear grupo
                </a>
                <CreateGroupModal
                  isOpen={groupModalOpen}
                  onClose={() => setGroupModalOpen(false)}
                  onCreateGroup={handleCreateGroup}
                  userId={userId}
                />
              </div>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {userId > 0 ? (
                <GroupList userId={userId} refreshSignal={refreshGroupList} />
              ) : (
                <div className="text-center text-gray-400">Cargando...</div>
              )}
            </div>
          </div>
        </div>

        {/* Sección actividad reciente */}
        <div className="2xl:w-1/2 xl:w-1/2 lg:w-1/2 w-[85%] h-160 p-8 bg-[#242424e0] rounded-[21px] space-y-3">
          <div className="text-xl">Actividad reciente</div>
          <div className="flex flex-col border-b-1 border-white-500 space-y-3 pb-3">
            
            
          </div>
          {/* Solicitudes de amistad */}
          {pending.length === 0 ? (
            <div></div>
          ) : (
            <div>
              {pending.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-raw border-b-1 border-white-500 justify-center items-center pb-3"
                >
                  <div className="w-3/4 flex flex-row space-y-2 space-x-2 items-center text-left">
                    <Avatar className="size-10">
                      <AvatarImage src={`${API_BASE_URL}${req.senderImageUrl}`} className="rounded-full"></AvatarImage>
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <HoverCard>
                      <HoverCardTrigger>
                        <span className="hover:border-b">
                          <strong>{req.senderName}</strong> te ha mandado una solicitud de amistad
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="bg-[#262626] space-y-3">
                        <div className="flex flex-row text-white items-center">
                          <img
                            src={`${API_BASE_URL}${req.senderImageUrl}`}
                            className="w-10 h-10 mr-4 rounded-full space-y2"
                          />
                          <div className="flex flex-col">
                            <Link to={`/user-profile/${req.senderId}`}>
                              <strong>@{req.senderName}</strong>
                            </Link>
                          </div>
                        </div>
                        <div className="text-white">Aquí puede ir una futura descripción corta</div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <div className="flex flex-raw w-1/4 justify-center gap-x-2">
                    <Button
                      onClick={() => handleAccept(req.recivedId, req.senderId, req.id)}
                      className="bg-transparent! bg-[url(/check.svg)]! bg-cover! w-[40px]! h-[40px]! rounded-full! text-white! hover:bg-green-400!"
                    ></Button>
                    <Button
                      onClick={() => handleReject(req.recivedId, req.senderId, req.id)}
                      className="bg-transparent! bg-[url(/decline.svg)]! bg-cover! w-[40px]! h-[40px]! rounded-full! text-white! hover:bg-red-400! hover:border-red-600!"
                    ></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Group Invitations */}
          {pendingGroupInvitations.length > 0 && (
            <div>
              {pendingGroupInvitations.map((invitation) => (
                <div key={invitation.id} className="flex flex-col border-b-1 border-white-500 space-y-3 pb-3 mb-3">
                  <div className="flex flex-raw justify-center">
                    <p>
                      <strong>{invitation.senderName}&nbsp;</strong> te ha invitado al grupo{" "}
                      <strong>&nbsp;{invitation.groupName}</strong>.
                    </p>
                  </div>
                  <div className="flex flex-raw w-full gap-x-4 justify-center">
                    <Button className="w-1/3" onClick={() => handleAcceptGroupInvitation(invitation.id)}>
                      Aceptar
                    </Button>
                    <Button
                      className="w-1/3"
                      variant="outline"
                      onClick={() => handleRejectGroupInvitation(invitation.id)}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-1/6"></div>
      </div>
    </div>
  )
}

export default MenuUser
