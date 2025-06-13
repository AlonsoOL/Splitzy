"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, UserPlus } from "lucide-react"
import { API_BASE_URL } from "@/config"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
  id: number
}

interface Friend {
  id: number
  name: string
  email: string
  profilePicture: string
}

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSendInvitation: (userId: number) => Promise<void>
  groupId: string
}

export function InviteUserModal({ isOpen, onClose, onSendInvitation, groupId }: InviteUserModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [friends, setFriends] = useState<Friend[]>([])
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState<number | null>(null)
  const [groupMembers, setGroupMembers] = useState<number[]>([])
  const [userId, setUserId] = useState<number>(0)

  

  useEffect(() => {
    
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token)
      setUserId(decoded.id)
    }
  }, [])

  useEffect(() => {
    if (isOpen && groupId && userId) {
      fetchGroupMembers()
      fetchFriends()
    }
  }, [isOpen, groupId, userId])

  useEffect(() => {
  
    const filtered = friends.filter((friend) => {
      const matchesSearch =
        friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.email.toLowerCase().includes(searchTerm.toLowerCase())
      const notInGroup = !groupMembers.includes(friend.id)
      return matchesSearch && notInGroup
    })
    setFilteredFriends(filtered)
  }, [searchTerm, friends, groupMembers])

  const fetchGroupMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupMembers/${groupId}`)
      if (response.ok) {
        const members = await response.json()
        setGroupMembers(members.map((member: any) => member.id))
      }
    } catch (error) {
      console.error("Error fetching group members:", error)
    }
  }

  const fetchFriends = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/Friends/friends/${userId}`)
      if (response.ok) {
        const friendsData = await response.json()
        setFriends(friendsData)
      }
    } catch (error) {
      console.error("Error fetching friends:", error)
      setFriends([])
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (friendId: number) => {
    setSending(friendId)
    try {
      await onSendInvitation(friendId)

      setFilteredFriends((prev) => prev.filter((friend) => friend.id !== friendId))
      setGroupMembers((prev) => [...prev, friendId])
    } catch (error) {
      console.error("Error sending invitation:", error)
    
    } finally {
      setSending(null)
    }
  }

  const handleClose = () => {
    setSearchTerm("")
    setFriends([])
    setFilteredFriends([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#242424] border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Invitar amigos al grupo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar entre tus amigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1a1a1a] border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading && <div className="text-center text-gray-400 py-4">Cargando amigos...</div>}

            {!loading && friends.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                <p>No tienes amigos para invitar</p>
                <p className="text-sm mt-1">Añade amigos primero para poder invitarlos a grupos</p>
              </div>
            )}

            {!loading && friends.length > 0 && filteredFriends.length === 0 && searchTerm && (
              <div className="text-center text-gray-400 py-4">
                No se encontraron amigos que coincidan con la búsqueda
              </div>
            )}

            {!loading && friends.length > 0 && filteredFriends.length === 0 && !searchTerm && (
              <div className="text-center text-gray-400 py-4">Todos tus amigos ya están en este grupo</div>
            )}

            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`${API_BASE_URL}${friend.profilePicture}`} />
                    <AvatarFallback className="bg-gray-600 text-white">
                      {friend.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{friend.name}</p>
                    <p className="text-sm text-gray-400">{friend.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleInvite(friend.id)}
                  disabled={sending === friend.id}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending === friend.id ? "Enviando..." : "Invitar"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} className="border-gray-600 text-white hover:bg-gray-700">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
