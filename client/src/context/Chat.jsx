import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react'


const ChatContex = createContext();

const ChatProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("chat-user"));
    if(data && data._id) {
      setUser(data);
    }
  }, [])

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
