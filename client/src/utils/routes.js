export const host = "http://localhost:5000";

export const routes = {
  register: "api/auth/register",
  login: "api/auth/login",
  logout: "api/auth/logout",
  set_avatar: "api/auth/set_avatar",
  all_users: "api/auth/all_users",
  send_message: `api/messages/add_msg`,
  get_messages: `api/messages/get_msgs`

}