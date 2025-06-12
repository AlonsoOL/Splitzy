"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { userService } from "@/services/userService"

interface ActivityItem {
  type: "expense" | "payment"
  groupId: string
  amount: number
  description: string
  createdAt: string
  payerId?: number
  receiverId?: number
}

interface JwtPayload {
  id: number
}



export function RecentActivityPage() {
  const [userId, setUserId] = useState<number | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const navigate = useNavigate()
  

  useEffect(() => {
    const token = localStorage.getItem("user") || sessionStorage.getItem("user")
    if (token) {
      const decoded = jwtDecode<JwtPayload>(token)
      setUserId(decoded.id)
    }
  }, [])

  useEffect(() => {
  if (!userId) return
  userService
    .getRecentActivity(userId)
    .then(setActivity)
    .catch((err) => console.error("Error al cargar actividad:", err))
}, [userId])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="min-h-screen bg-[url(/fondo-splitzy.png)] bg-cover">
      <div className="min-h-screen backdrop-blur-2xl p-6 flex justify-center">
        <div className="max-w-4xl w-full space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Actividad reciente</h1>
            <Button variant="outline" onClick={() => navigate("/menu-user")} className="text-white border-gray-600">
              Volver al menú
            </Button>
          </div>

          <Card className="bg-[#1f1f1f] border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Historial de movimientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {activity.length > 0 ? (
                  activity.map((item, index) => (
                    <div key={index} className="text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-400">{formatDate(item.createdAt)}</p>
                          <p className="font-semibold">
                            {item.type === "expense"
                              ? `Gasto en grupo ${item.groupId}`
                              : `Pago en grupo ${item.groupId}`}
                          </p>
                          <p className="text-gray-400 text-sm">{item.description}</p>
                        </div>
                        <div
                          className={`text-right font-bold ${
                            item.type === "expense" ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          {formatCurrency(item.amount)}
                          <div className="text-xs text-gray-500">{item.type === "expense" ? "gasto" : "pago"}</div>
                        </div>
                      </div>
                      <Separator className="bg-gray-600 my-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No hay actividad registrada.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1f1f1f] border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Resumen gráfico</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {activity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activity.map((item) => ({
                      name: new Date(item.createdAt).toLocaleDateString("es-ES"),
                      amount: item.amount,
                      type: item.type,
                    }))}
                  >
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#2e2e2e", border: "1px solid #444" }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="amount" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">No hay datos para mostrar.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
