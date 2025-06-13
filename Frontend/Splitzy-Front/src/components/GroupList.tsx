"use client"

import { useEffect, useState } from "react"
import { type Group, type GroupBalance, groupService } from "@/services/groupService"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"
import { API_BASE_URL } from "@/config"

interface GroupListProps {
  userId: number
  refreshSignal: boolean
}

export function GroupList({ userId, refreshSignal }: GroupListProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [groupBalances, setGroupBalances] = useState<Record<string, GroupBalance[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [userId, refreshSignal])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const userGroups = await groupService.getUserGroups(userId)
      setGroups(userGroups)

      // Fetch balances for each group
      const balances: Record<string, GroupBalance[]> = {}
      for (const group of userGroups) {
        try {
          const groupBalances = await groupService.getGroupBalances(group.id)
          // Ensure we always set an array, even if the response is unexpected
          balances[group.id] = Array.isArray(groupBalances) ? groupBalances : []
        } catch (error) {
          console.error(`Error fetching balances for group ${group.id}:`, error)
          balances[group.id] = []
        }
      }
      setGroupBalances(balances)
    } catch (error) {
      console.error("Error fetching groups:", error)
      setGroups([])
      setGroupBalances({})
    } finally {
      setLoading(false)
    }
  }

  const getUserBalance = (groupId: string): { balance: number; status: string } => {
    const balances = groupBalances[groupId]

    // Check if balances exists and is an array
    if (!balances || !Array.isArray(balances)) {
      return { balance: 0, status: "¡Estás al día!" }
    }

    const userBalance = balances.find((b) => b.userId === userId)

    if (!userBalance) {
      return { balance: 0, status: "¡Estás al día!" }
    }

    if (userBalance.balance > 0) {
      return { balance: userBalance.balance, status: `Te deben ${userBalance.balance.toFixed(2)}€` }
    } else if (userBalance.balance < 0) {
      return { balance: Math.abs(userBalance.balance), status: `Debes ${Math.abs(userBalance.balance).toFixed(2)}€` }
    } else {
      return { balance: 0, status: "¡Estás al día!" }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString("es-ES", { month: "short" })
    const day = date.getDate()
    return { month, day }
  }

  if (loading) {
    return <div className="text-center text-gray-400">Cargando grupos...</div>
  }

  if (groups.length === 0) {
    return <div className="text-center text-gray-400">No tienes grupos aún</div>
  }

  return (
    <div className="space-y-2">
      {groups.map((group, index) => {
        const { balance, status } = getUserBalance(group.id)
        const { month, day } = formatDate(group.updatedAt || group.createdAt)

        return (
          <div key={group.id}>
            <div className="flex flex-row items-center pb-2">
              <div className="w-1/8 text-center mr-2">
                <p className="text-xs text-gray-400">{month}</p>
                <p className="text-sm font-semibold">{day}</p>
              </div>
              <img
                src={`${API_BASE_URL}${group.imageUrl}`}
                className="w-10 h-10 mr-4 rounded-[4px] object-cover"
                alt={group.name}
              />
              <div className="w-1/2 text-left">
                <Link to={`/group/${group.id}`} className="hover:underline font-medium">
                  {group.name}
                </Link>
                <p className="text-gray-400 text-sm">{group.description || "Sin descripción"}</p>
              </div>
              <p
                className={`w-1/2 text-right text-sm ${
                  balance > 0 && status.includes("Te deben")
                    ? "text-green-400"
                    : balance > 0 && status.includes("Debes")
                      ? "text-red-400"
                      : "text-gray-400"
                }`}
              >
                {status}
              </p>
            </div>
            {index < groups.length - 1 && <Separator className="bg-gray-600" />}
          </div>
        )
      })}
    </div>
  )
}
