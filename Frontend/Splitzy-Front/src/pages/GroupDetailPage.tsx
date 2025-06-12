"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Plus, Users, Receipt, CreditCard } from "lucide-react"
import {
  type Group,
  type GroupMember,
  type GroupExpense,
  type GroupPayment,
  type GroupBalance,
  groupService,
  type AddExpenseRequest,
} from "@/services/groupService"
import { AddExpenseModal } from "@/components/AddExpenseModal"
import { API_BASE_URL } from "@/config"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
  id: number
}

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [expenses, setExpenses] = useState<GroupExpense[]>([])
  const [payments, setPayments] = useState<GroupPayment[]>([])
  const [balances, setBalances] = useState<GroupBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [userId, setUserId] = useState<number>(0)

  useEffect(() => {
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token)
      setUserId(decoded.id)
    }
  }, [])

  useEffect(() => {
    if (groupId && userId) {
      fetchGroupData()
    }
  }, [groupId, userId])

  const fetchGroupData = async () => {
    if (!groupId) return

    try {
      setLoading(true)
      const [groupData, membersData, expensesData, paymentsData, balancesData] = await Promise.all([
        groupService.getGroupById(groupId),
        groupService.getGroupMembers(groupId),
        groupService.getGroupExpenses(groupId),
        groupService.getGroupPayments(groupId),
        groupService.getGroupBalances(groupId),
      ])

      setGroup(groupData)
      setMembers(membersData)
      setExpenses(expensesData)
      setPayments(paymentsData)
      setBalances(balancesData)
    } catch (error) {
      console.error("Error fetching group data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (request: AddExpenseRequest) => {
    if (!groupId) return

    try {
      await groupService.addExpenseToGroup(groupId, request)
      await fetchGroupData() 
    } catch (error) {
      console.error("Error adding expense:", error)
      throw error
    }
  }

  const getUserBalance = () => {
    const userBalance = balances.find((b) => b.userId === userId)
    return userBalance?.balance || 0
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[url(/fondo-splitzy.png)] bg-cover">
        <div className="min-h-screen backdrop-blur-2xl flex items-center justify-center">
          <div className="text-white text-xl">Cargando grupo...</div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[url(/fondo-splitzy.png)] bg-cover">
        <div className="min-h-screen backdrop-blur-2xl flex items-center justify-center">
          <div className="text-white text-xl">Grupo no encontrado</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url(/fondo-splitzy.png)] bg-cover">
      <div className="min-h-screen backdrop-blur-2xl p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link to="/menu-user">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <img
                src={group.imageUrl || "/placeholder.svg?height=60&width=60"}
                className="w-15 h-15 rounded-lg object-cover"
                alt={group.name}
              />
              <div>
                <h1 className="text-2xl font-bold text-white">{group.name}</h1>
                <p className="text-gray-300">{group.description}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            <div className="space-y-6">
      
              <Card className="bg-[#242424e0] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Tu balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${
                        getUserBalance() > 0
                          ? "text-green-400"
                          : getUserBalance() < 0
                            ? "text-red-400"
                            : "text-gray-400"
                      }`}
                    >
                      {formatCurrency(getUserBalance())}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {getUserBalance() > 0 ? "Te deben" : getUserBalance() < 0 ? "Debes" : "Estás al día"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#242424e0] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Acciones rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setExpenseModalOpen(true)} className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir gasto
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-600 text-white hover:bg-gray-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Registrar pago
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#242424e0] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Miembros ({members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {members.map((member) => {
                      const memberBalance = balances.find((b) => b.userId === member.id)
                      return (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`${API_BASE_URL}${member.imageUrl}`} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-white text-sm">{member.name}</span>
                          </div>
                          <span
                            className={`text-sm ${
                              (memberBalance?.balance || 0) > 0
                                ? "text-green-400"
                                : (memberBalance?.balance || 0) < 0
                                  ? "text-red-400"
                                  : "text-gray-400"
                            }`}
                          >
                            {formatCurrency(memberBalance?.balance || 0)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="bg-[#242424e0] border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Actividad del grupo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">

                    {[
                      ...expenses.map((e) => ({ ...e, type: "expense" })),
                      ...payments.map((p) => ({ ...p, type: "payment" })),
                    ]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((item, index) => (
                        <div key={`${item.type}-${item.id}`}>
                          <div className="flex items-start gap-4 py-3">
                            <div className="text-center min-w-[60px]">
                              <div className="text-xs text-gray-400">{formatDate(item.createdAt)}</div>
                            </div>
                            <div className="flex-1">
                              {item.type === "expense" ? (
                                <div>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-white font-medium">{(item as GroupExpense).name}</h4>
                                      <p className="text-gray-400 text-sm">
                                        Pagado por {(item as GroupExpense).userName}
                                      </p>
                                      {(item as GroupExpense).description && (
                                        <p className="text-gray-500 text-xs mt-1">
                                          {(item as GroupExpense).description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-white font-semibold">
                                        {formatCurrency((item as GroupExpense).amount)}
                                      </div>
                                      <div className="text-xs text-gray-400">gasto</div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="text-white font-medium">Pago realizado</h4>
                                      <p className="text-gray-400 text-sm">
                                        {(item as GroupPayment).payerName} pagó a {(item as GroupPayment).receiverName}
                                      </p>
                                      {(item as GroupPayment).description && (
                                        <p className="text-gray-500 text-xs mt-1">
                                          {(item as GroupPayment).description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-green-400 font-semibold">
                                        {formatCurrency((item as GroupPayment).amount)}
                                      </div>
                                      <div className="text-xs text-gray-400">pago</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {index < expenses.length + payments.length - 1 && <Separator className="bg-gray-600" />}
                        </div>
                      ))}

                    {expenses.length === 0 && payments.length === 0 && (
                      <div className="text-center text-gray-400 py-8">No hay actividad en este grupo aún</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <AddExpenseModal
          isOpen={expenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          onAddExpense={handleAddExpense}
          groupId={groupId!}
          userId={userId}
        />
      </div>
    </div>
  )
}
