import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type GroupMember, type AddPaymentRequest } from "@/services/groupService"

interface AddPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onAddPayment: (request: AddPaymentRequest) => Promise<void>
  groupId: string
  userId: number
  members: GroupMember[]
}

export function AddPaymentModal({ isOpen, onClose, onAddPayment, userId, members }: AddPaymentModalProps) {
  const [receiverId, setReceiverId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const parsedAmount = parseFloat(amount)
    if (!receiverId || parsedAmount <= 0 || isNaN(parsedAmount)) {
      setError("Por favor, selecciona un receptor y un monto válido.")
      return
    }

    if (parseInt(receiverId) === userId) {
      setError("No puedes registrarte como receptor del pago.")
      return
    }

    try {
      const paymentRequest: AddPaymentRequest = {
        payerId: userId,
        receiverId: parseInt(receiverId),
        amount: parsedAmount,
        description,
      }
      await onAddPayment(paymentRequest)
      setReceiverId("")
      setAmount("")
      setDescription("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar el pago")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#242424e0] text-white border-gray-600">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="receiver">Receptor</Label>
              <Select value={receiverId} onValueChange={setReceiverId}>
                <SelectTrigger id="receiver" className="border-gray-600 text-white">
                  <SelectValue placeholder="Selecciona un receptor" />
                </SelectTrigger>
                <SelectContent className="bg-[#242424e0] text-white border-gray-600">
                  {members
                    .filter((member) => member.id !== userId)
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ej. 50.00"
                className="border-gray-600 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Pago por cena compartida"
                className="border-gray-600 text-white"
              />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-600 text-white">
              Cancelar
            </Button>
            <Button type="submit">Registrar Pago</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}