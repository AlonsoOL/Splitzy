export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const LOGIN = `${API_BASE_URL}/api/Auth/login`
const REGISTER = `${API_BASE_URL}/api/Auth/register`
const FETCHFRIENDLIST = `${API_BASE_URL}/api/Friends/friends/`
const FETCHREQUESTPENDING = `${API_BASE_URL}/api/FriendRequest/pending/`
const ACCEPTREQUEST = `${API_BASE_URL}/api/FriendRequest/accept`
const REJECTREQUEST = `${API_BASE_URL}/api/FriendRequest/reject`
const REMOVEFRIEND = `${API_BASE_URL}/api/FriendRequest/remove`
const GETUSERSADMIN = `${API_BASE_URL}/api/User` 
//const WEBSOCKET = `${API_BASE_URL}`

export {
    LOGIN,
    REGISTER,
    FETCHFRIENDLIST,
    FETCHREQUESTPENDING,
    ACCEPTREQUEST,
    REJECTREQUEST,
    REMOVEFRIEND,
    GETUSERSADMIN
}