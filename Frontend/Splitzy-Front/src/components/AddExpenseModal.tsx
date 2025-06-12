"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { AddExpenseRequest } from "@/services/groupService"

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onAddExpense: (request: AddExpenseRequest) => Promise<void>
  groupId: string
  userId: number
}

export function AddExpenseModal({ isOpen, onClose, onAddExpense, userId }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.amount) return

    setIsLoading(true)
    try {
      await onAddExpense({
        userId,
        name: formData.name,
        amount: Number.parseFloat(formData.amount),
        description: formData.description,
      })
      setFormData({ name: "", amount: "", description: "" })
      onClose()
    } catch (error) {
      console.error("Error adding expense:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#242424] border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white">Añadir gasto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">
              Descripción del gasto *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Cena en restaurante"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="amount" className="text-white">
              Cantidad *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-white">
              Notas adicionales
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Notas opcionales sobre el gasto"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-white hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim() || !formData.amount} className="flex-1">
              {isLoading ? "Añadiendo..." : "Añadir gasto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
