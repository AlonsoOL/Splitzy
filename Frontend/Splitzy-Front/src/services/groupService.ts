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

const getAuthHeaders = () => {
  const token = localStorage.getItem("user") || sessionStorage.getItem("user")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const groupService = {
  async getAllGroups(): Promise<Group[]> {
    const response = await fetch(`${API_BASE_URL}/api/Group/GetGroups`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch groups")
    return response.json()
  },

  async getUserGroups(userId: number): Promise<Group[]> {
    const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupsOfUser/${userId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch user groups")
    return response.json()
  },

  async getGroupById(groupId: string): Promise<Group> {
    const response = await fetch(`${API_BASE_URL}/api/Group/GetGroup/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch group")
    return response.json()
  },

  async createGroup(request: CreateGroupRequest): Promise<Group> {
    const response = await fetch(`${API_BASE_URL}/api/Group/CreateGroup`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error("Failed to create group")
    return response.json()
  },

  async updateGroup(groupId: string, request: Omit<CreateGroupRequest, "userId">): Promise<Group> {
    const response = await fetch(`${API_BASE_URL}/api/Group/UpdateGroup/${groupId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error("Failed to update group")
    return response.json()
  },

  async deleteGroup(groupId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Group/DeleteGroup/${groupId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to delete group")
  },

  async addMemberToGroup(groupId: string, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Group/AddMemberToGroup/${groupId}/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to add member to group")
  },

  async removeMemberFromGroup(groupId: string, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Group/RemoveMemberFromGroup/${groupId}/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to remove member from group")
  },

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupMembers/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch group members")
    return response.json()
  },

  async addExpenseToGroup(groupId: string, request: AddExpenseRequest): Promise<GroupExpense> {
    const response = await fetch(`${API_BASE_URL}/api/Group/AddExpenseToGroup/${groupId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error("Failed to add expense")
    return response.json()
  },

  async getGroupExpenses(groupId: string): Promise<GroupExpense[]> {
    const response = await fetch(`${API_BASE_URL}/api/Group/GetExpensesByGroupId/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch group expenses")
    return response.json()
  },

  async deleteExpense(expenseId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Group/DeleteExpense/${expenseId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to delete expense")
  },

  async addPaymentToGroup(groupId: string, request: AddPaymentRequest): Promise<GroupPayment> {
    const response = await fetch(`${API_BASE_URL}/api/Group/AddPaymentToGroup/${groupId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error("Failed to add payment")
    return response.json()
  },

  async getGroupPayments(groupId: string): Promise<GroupPayment[]> {
    const response = await fetch(`${API_BASE_URL}/api/Group/GetPaymentsByGroupId/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch group payments")
    return response.json()
  },

  async deletePayment(paymentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Group/DeletePayment/${paymentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to delete payment")
  },

  async getGroupBalances(groupId: string): Promise<GroupBalance[]> {
    const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupBalances/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch group balances")
    return response.json()
  },

  async getGroupDebts(groupId: string): Promise<GroupDebt[]> {
    const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupDebts/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch group debts")
    return response.json()
  },

  async getGroupSummary(groupId: string): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}/api/Group/GetGroupSummary/${groupId}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch group summary")
    return response.json()
  },
}
