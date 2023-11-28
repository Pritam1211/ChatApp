import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react'
import { host, routes } from '../utils/routes';


const ChatContex = createContext();

const ChatProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  
  const verifyUser = async(id, token) => {
    try {
      const { data } = await axios.get(`${host}/${routes.getUser}/${user._id}`, {
        headers: {
          Authorization: token,
        },
      });
      if(data?.success){
        return
      } else {
        setUser(null);
      }
    } catch(err) {
      setUser(null);
    }
  }
  
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("chat-user"));
    if(data && data._id) {
      verifyUser(data._id);
      setUser(data);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chat-user", (JSON.stringify(user)));
  }, [user])

  return (
    <ChatContex.Provider value={{user, setUser, chats, setChats, currentChat, setCurrentChat}}>
      {children}
    </ChatContex.Provider>
  )
}

const useChat = () => useContext(ChatContex);

export { useChat, ChatProvider };
