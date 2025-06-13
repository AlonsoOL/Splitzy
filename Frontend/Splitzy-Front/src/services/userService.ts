import { API_BASE_URL } from "@/config"

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

export const userService = {
  async getRecentActivity(userId: number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/User/RecentActivity/${userId}`, {
      headers: getAuthHeaders(),
    })

    return await handleResponse(response)
  },
}
