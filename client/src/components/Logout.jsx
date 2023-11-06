import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";
import { useChat } from "../context/Chat";
export default function Logout({ socket }) {
  const navigate = useNavigate();
  const { setUser, setChats, setCurrentChat } = useChat();
  const handleClick = async () => {
    setUser(null);
    setChats([]);
    setCurrentChat(null);
    navigate("/login");
    socket.current.disconnect();
  };
  return (
    <Button onClick={handleClick}>
      <BiPowerOff />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
`;