import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { host, routes } from '../utils/routes';
import Contacts from '../components/Contact';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import { io } from "socket.io-client";
import styled from 'styled-components';
function Chat() {

  const [contacts, setContacts] = useState([]);
  const socket = useRef();
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const navigate = useNavigate();



  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect( () => {
    if (!localStorage.getItem('webchat-user')) {
      navigate("/login");
    } else {
      setCurrentUser(
        JSON.parse(
          localStorage.getItem('webchat-user')
        )
      );
    }
  }, []);

  useEffect( () => {
    const fetch = async()=>{
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(`${host}/${routes.all_users}/${currentUser._id}`);
          
          setContacts(data.data);
        } else {
          navigate("/setAvatar");
        }
      }
    }
    fetch();
  }, [currentUser]);

  const handleChatChange = (contact) => {
    setCurrentChat(contact);
  }

  return (
    <>
      <Container>
        <div className="container">
          <Contacts contacts={contacts} changeChat={handleChatChange} />
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer currentChat={currentChat} socket={socket} />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
export default Chat