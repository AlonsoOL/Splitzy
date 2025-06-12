"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CreateGroupRequest } from "@/services/groupService"

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateGroup: (request: CreateGroupRequest) => Promise<void>
  userId: number
}

export function CreateGroupModal({ isOpen, onClose, onCreateGroup, userId }: CreateGroupModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsLoading(true)
    try {
      await onCreateGroup({
        userId,
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl || "/placeholder.svg?height=40&width=40",
      })
      setFormData({ name: "", description: "", imageUrl: "" })
      onClose()
    } catch (error) {
      console.error("Error creating group:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#242424] border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white">Crear nuevo grupo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">
              Nombre del grupo *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Vacaciones de verano"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-white">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional del grupo"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="imageUrl" className="text-white">
              URL de imagen (opcional)
            </Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
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
            <Button type="submit" disabled={isLoading || !formData.name.trim()} className="flex-1">
              {isLoading ? "Creando..." : "Crear grupo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
