import { API_BASE_URL } from "@/config"

export interface Group {
  id: string
  name: string
  description: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface GroupMember {
  id: number
  name: string
  email: string
  imageUrl: string
}

export interface GroupExpense {
  id: string
  groupId: string
  userId: number
  userName: string
  amount: number
  name: string
  description: string
  createdAt: string
}

export interface GroupPayment {
  id: string
  groupId: string
  payerId: number
  payerName: string
  receiverId: number
  receiverName: string
  amount: number
  description: string
  createdAt: string
}

export interface GroupBalance {
  userId: number
  userName: string
  balance: number
}

export interface GroupDebt {
  debtorId: number
  debtorName: string
  creditorId: number
  creditorName: string
  amount: number
}

export interface CreateGroupRequest {
  userId: number
  name: string
  description: string
  imageUrl: string
}

export interface AddExpenseRequest {
  userId: number
  amount: number
  name: string
  description: string
}

export interface AddPaymentRequest {
  payerId: number
  receiverId: number
  amount: number
  description: string
}

export interface GroupInvitationRequestDto {
  groupId: string
  senderId: number
  invitedUserId: number
}

export interface GroupInvitationManageDto {
  invitationId: number
  userId: number
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("user") || sessionStorage.getItem("user")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`
    try {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } else {
        const errorText = await response.text()
        if (errorText) {
          errorMessage = errorText
        }
      }
    } catch (e) {
      console.error("Error parsing error response:", e)
      errorMessage = `Failed to parse error response: ${errorMessage}`
    }
    throw new Error(errorMessage)
  }

  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return await response.json()
  } else {
    const text = await response.text()
    return text || true
  }
}

export const groupService = {
  sendGroupInvitation: async (request: GroupInvitationRequestDto) => {
    try {
      console.log("Sending group invitation:", request)
      const response = await fetch(`${API_BASE_URL}/api/GroupInvitation/invite`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      })

      return await handleResponse(response)
    } catch (error) {
      console.error("Error in sendGroupInvitation:", error)
      throw error
    }
  },

  acceptGroupInvitation: async (invitationId: number, userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/GroupInvitation/accept`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ invitationId, userId }),
      })

      return await handleResponse(response)
    } catch (error) {
      console.error("Error in acceptGroupInvitation:", error)
      throw error
    }
  },

  rejectGroupInvitation: async (invitationId: number, userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/GroupInvitation/reject`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ invitationId, userId }),
      })

      return await handleResponse(response)
    } catch (error) {
      console.error("Error in rejectGroupInvitation:", error)
      throw error
    }
  },

  getPendingInvitations: async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/GroupInvitation/pending/${userId}`, {
        headers: getAuthHeaders(),
      })

      if (response.status === 404) {
        return []
      }

      return await handleResponse(response)
    } catch (error) {
      console.error("Error in getPendingInvitations:", error)
      if (error instanceof Error && error.message.includes("404")) {
        return []
      }
      throw error
    }
  },

  async getAllGroups(): Promise<Group[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetGroups`, {
        headers: getAuthHeaders(),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in getAllGroups:", error)
      throw new Error("Failed to fetch groups")
    }
  },

  async getUserGroups(userId: number): Promise<Group[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupsOfUser/${userId}`, {
        headers: getAuthHeaders(),
      })

      if (response.status === 404) {
        return []
      }

      const data = await handleResponse(response)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Error in getUserGroups:", error)
      return []
    }
  },

  async getGroupById(groupId: string): Promise<Group> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetGroup/${groupId}`, {
        headers: getAuthHeaders(),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in getGroupById:", error)
      throw new Error("Failed to fetch group")
    }
  },

  async createGroup(request: CreateGroupRequest): Promise<Group> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/CreateGroup`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in createGroup:", error)
      throw new Error("Failed to create group")
    }
  },

  async updateGroup(groupId: string, request: Omit<CreateGroupRequest, "userId">): Promise<Group> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/UpdateGroup/${groupId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(request),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in updateGroup:", error)
      throw new Error("Failed to update group")
    }
  },

  async deleteGroup(groupId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/DeleteGroup/${groupId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      await handleResponse(response)
    } catch (error) {
      console.error("Error in deleteGroup:", error)
      throw new Error("Failed to delete group")
    }
  },

  async addMemberToGroup(groupId: string, userId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/AddMemberToGroup/${groupId}/${userId}`, {
        method: "POST",
        headers: getAuthHeaders(),
      })
      await handleResponse(response)
    } catch (error) {
      console.error("Error in addMemberToGroup:", error)
      throw new Error("Failed to add member to group")
    }
  },

  async removeMemberFromGroup(groupId: string, userId: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/RemoveMemberFromGroup/${groupId}/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      await handleResponse(response)
    } catch (error) {
      console.error("Error in removeMemberFromGroup:", error)
      throw new Error("Failed to remove member from group")
    }
  },

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupMembers/${groupId}`, {
        headers: getAuthHeaders(),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in getGroupMembers:", error)
      throw new Error("Failed to fetch group members")
    }
  },

  async addExpenseToGroup(groupId: string, request: AddExpenseRequest): Promise<GroupExpense> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/AddExpenseToGroup/${groupId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...request,
          amount: parseFloat(request.amount.toFixed(2)),
        }),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in addExpenseToGroup:", error)
      throw new Error("Failed to add expense")
    }
  },

  async getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetExpensesByGroupId/${groupId}`, {
        headers: getAuthHeaders(),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in getGroupExpenses:", error)
      throw new Error("Failed to fetch group expenses")
    }
  },

  async deleteExpense(expenseId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/DeleteExpense/${expenseId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      await handleResponse(response)
    } catch (error) {
      console.error("Error in deleteExpense:", error)
      throw new Error("Failed to delete expense")
    }
  },

  async addPaymentToGroup(groupId: string, request: AddPaymentRequest): Promise<GroupPayment> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/AddPaymentToGroup/${groupId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...request,
          amount: parseFloat(request.amount.toFixed(2)), 
        }),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in addPaymentToGroup:", error)
      throw new Error("Failed to add payment")
    }
  },

  async getGroupPayments(groupId: string): Promise<GroupPayment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetPaymentsByGroupId/${groupId}`, {
        headers: getAuthHeaders(),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in getGroupPayments:", error)
      throw new Error("Failed to fetch group payments")
    }
  },

  async deletePayment(paymentId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/DeletePayment/${paymentId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      await handleResponse(response)
    } catch (error) {
      console.error("Error in deletePayment:", error)
      throw new Error("Failed to delete payment")
    }
  },

  async getGroupBalances(groupId: string): Promise<GroupBalance[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupBalances/${groupId}`, {
        headers: getAuthHeaders(),
      })

      if (response.status === 404) {
        return []
      }

      const data = await handleResponse(response)
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error("Error in getGroupBalances:", error)
      return []
    }
  },

  async getGroupDebts(groupId: string): Promise<GroupDebt[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupDebts/${groupId}`, {
        headers: getAuthHeaders(),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in getGroupDebts:", error)
      throw new Error("Failed to fetch group debts")
    }
  },

  async getGroupSummary(groupId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupSummary/${groupId}`, {
        headers: getAuthHeaders(),
      })
      return await handleResponse(response)
    } catch (error) {
      console.error("Error in getGroupSummary:", error)
      throw new Error("Failed to fetch group summary")
    }
  },
}