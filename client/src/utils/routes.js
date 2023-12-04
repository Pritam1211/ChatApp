export const host = process.env.REACT_APP_API_URL;

export const routes = {
  register: "api/auth/register",
  login: "api/auth/login",
  logout: "api/auth/logout",
  set_avatar: "api/auth/set_avatar",
  all_users: "api/auth/all_users",
  send_message: `api/messages`,
  get_messages: `api/messages`,
  groupChat: "api/chat/group",
  oneOnoneChat: "api/chat",
  getChats: "api/chat",
  addMember: "api/chat/add_member",
  removeMember: "api/chat/remove_member",
  createChat: "api/chat",
  otherUsers: "api/chat/other_users",
  editChatName: "api/chat/name",
  getUser: "api/auth/info",

}