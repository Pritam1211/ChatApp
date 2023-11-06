import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Contacts from "../components/Contact";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import styled from "styled-components";
import { useChat } from "../context/Chat";
import {io} from "socket.io-client"
import { host } from "../utils/routes";
function Chat() {
  const navigate = useNavigate();
  const { user, currentChat } = useChat();
  const socket = useRef();
  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      if (!user.isAvatarImageSet) {
        navigate("/set_avatar");
      } else {
        socket.current = io(host);
      }
    }
  }, []);

  return (
    <>
      {user && (
        <Container>
          <div className="container">
            <Contacts socket={socket} />
            {currentChat ? (
              <ChatContainer socket={socket} />
            ) : (
              <Welcome name={user.username} />
            )}
          </div>
        </Container>
      )}
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
export default Chat;
