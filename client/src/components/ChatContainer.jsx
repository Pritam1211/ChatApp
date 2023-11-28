import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import ChatInput from "./ChatInput";
import axios from "axios";
import { host, routes } from "../utils/routes";
import { useChat } from "../context/Chat";
import { toast } from "react-toastify";
import { getHeaders, getOtherUser } from "../utils/chatHelper";
import moment from "moment";
import { Modal } from "antd";
import { IoCloseCircleSharp } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import UpdateUsers from "./UpdateUsers";
import { Dropdown } from "antd";
function ChatContainer({ socket }) {
  const [messages, setMessages] = useState([]);
  const [currentChatUser, setCurrentChatUser] = useState(undefined);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [updateUserModal, setUpdateUserModal] = useState(false);
  const [updateUserMode, setUpdateUserMode] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [nameModal, setNameModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const { user, currentChat, setChats, setCurrentChat } = useChat();
  const [items, setItems] = useState(null);


  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(
        `${host}/${routes.get_messages}/${currentChat._id}`,
        getHeaders(user.token)
      );
      if (data.success) {
        setMessages(data.messages);
        setCurrentChatUser(getOtherUser(currentChat.users, user._id));
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchMessages();
    socket.current.emit("join-chat", currentChat._id);
    // eslint-disable-next-line
  }, [currentChat]);

  const openUserModal = (mode) => {
    setUpdateUserMode(mode);
    setUpdateUserModal(true);
  };

  useEffect(() => {
    socket.current.on("message-recieved", (data) => {
      if (data.chat === currentChat._id && data.sender !== user._id) {
        setArrivalMessage(data);
      }
    });
    if (currentChat?.admin?._id === user?._id) {
      setItems([
        {
          label: <div onClick={() => setNameModal(true)}>Edit Group Name</div>,
          key: "0",
        },
        {
          label: <div onClick={() => openUserModal("Add")}>Add Member</div>,
          key: "1",
        },
        {
          label: <div onClick={() => openUserModal("Remove")}>Remove Member</div>,
          key: "2",
        },
        {
          label: <div onClick={() => setDetailModal(true)}>Group Detail</div>,
          key: "3",
        },
        {
          label: <div onClick={() => deleteGroup()}>Delete Group</div>,
          key: "4",
        },
      ]);
    } else {
      setItems([
        {
          label: <div onClick={() => setNameModal(true)}>Edit Group Name</div>,
          key: "0",
        },
        {
          label: <div onClick={() => setDetailModal(true)}>Group Detail</div>,
          key: "1",
        },
        {
          label: <div onClick={() => exitGroup()}>Exist Group</div>,
          key: "2",
        },
      ]);
    }
    // eslint-disable-next-line
  }, [currentChat, user]);

  const handleSendMsg = async (msg) => {
    try {
      const { data } = await axios.post(
        `${host}/${routes.send_message}`,
        {
          chatId: currentChat._id,
          message: msg,
        },
        getHeaders(user.token)
      );
      if (data?.success) {
        const msgs = [...messages, data.message];
        socket.current.emit("new-message", data.message);
        setMessages(msgs);
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    arrivalMessage &&
      arrivalMessage.chat === currentChat._id &&
      setMessages((messages) => [...messages, arrivalMessage]);
    // eslint-disable-next-line
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (users, e=null) => {
    try {
      if(e) e.preventDefault();
      let url =
        updateUserMode === "Add" ? routes.addMember : routes.removeMember;
      const { data } = await axios.put(
        `${host}/${url}/${currentChat._id}`,
        {
          users: users,
        },
        getHeaders(user.token)
      );
      if (data?.success) {
        setCurrentChat(data.chat);
        setChats((chats) =>
          chats.map((chat) => (chat._id === data.chat._id ? data.chat : chat))
        );
        setUpdateUserModal(false);
        setUpdateUserMode(null);
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const exitGroup = async () => {
    try {
      const { data } = await axios.put(`${host}/api/chat/exit_group/${currentChat._id}`,{}, getHeaders(user.token));
      if(data?.success) {
        setChats((chats) =>
          chats.filter((chat) => chat._id !== currentChat._id)
        );
        setCurrentChat(null);
      }
    } catch(err) {
      toast.error("Something went wrong");
    }
  }

  const deleteGroup = async () => {
    try {
      const { data } = await axios.delete(`${host}/api/chat/${currentChat._id}`, getHeaders(user.token));
      if(data?.success) {
        setChats((chats) =>
          chats.filter((chat) => chat._id !== currentChat._id)
        );
        setCurrentChat(null);
      }
    } catch(err) {
      toast.error("Something went wrong");
    }
  }

  const editName = async (e) => {
    try {
      e.preventDefault();
      const { data } = await axios.put(
        `${host}/${routes.editChatName}/${currentChat._id}`,
        {
          name: groupName,
        },
        getHeaders(user.token)
      );
      if (data?.success) {
        setCurrentChat(data.chat);
        setChats((chats) =>
          chats.map((chat) => (chat._id === data.chat._id ? data.chat : chat))
        );
        setNameModal(false);
        setGroupName("");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <Container>
        <div className="chat-header">
          <div className="user-details">
            {currentChat.isGroupChat ? (
              <>
                <div className="avatar">
                  <img
                    src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                    alt=""
                  />
                </div>
                <div className="username">
                  <h3>{currentChat.chatName}</h3>
                </div>
              </>
            ) : (
              <>
                <div className="avatar">
                  {currentChatUser?.avatarImage && (
                    <img
                      src={`data:image/svg+xml;base64,${currentChatUser?.avatarImage}`}
                      alt=""
                    />
                  )}
                </div>
                <div className="username">
                  <h3>{currentChatUser?.username}</h3>
                </div>
              </>
            )}
          </div>
          { currentChat.isGroupChat &&  
            <Dropdown
              type="dark"
              menu={{ items }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <BsThreeDotsVertical />
            </Dropdown>
          }
        </div>
        <div className="chat-messages">
          {messages.map((message) => {
            return (
              <div ref={scrollRef} key={uuidv4()}>
                <div
                  className={`message ${
                    message.sender._id === user._id ? "sended" : "recieved"
                  }`}
                >
                  {currentChat.isGroupChat &&
                    message.sender._id !== user._id && (
                      <div className="avatar">
                        <img
                          src={`data:image/svg+xml;base64,${message.sender.avatarImage}`}
                          alt=""
                        />
                      </div>
                    )}
                  <div className="content ">
                    {currentChat.isGroupChat &&
                      message.sender._id !== user._id && (
                        <p className="sender">{message.sender.username}</p>
                      )}
                    <p className="text">{message.message}</p>
                    <p className="time">
                      {moment(message.created_at).format("HH:MM")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <ChatInput handleSendMsg={handleSendMsg} />
      </Container>
      <StyledModal
        title={`${updateUserMode === "Add" ? "Add" : "Remove"} Users`}
        open={updateUserModal}
        footer={null}
        closeIcon={
          <IoCloseCircleSharp
            onClick={() => setUpdateUserModal(false)}
            fontSize={20}
          />
        }
        destroyOnClose={true}
      >
        <UpdateUsers handleSubmit={handleSubmit} mode={updateUserMode} />
      </StyledModal>

      <StyledModal
        title="Edit Goup Name"
        open={nameModal}
        footer={null}
        closeIcon={
          <IoCloseCircleSharp
            onClick={() => setNameModal(false)}
            fontSize={20}
          />
        }
        destroyOnClose={true}
      >
        <form onSubmit={(e) => editName(e)}>
          <input
            type="text"
            name="name"
            className="input"
            placeholder="Name"
            onChange={(e) => setGroupName(e.target.value)}
          />
          <button className="btn" type="submit">
            Submit
          </button>
        </form>
      </StyledModal>
      <StyledModal
        title="Group Details"
        open={detailModal}
        footer={null}
        closeIcon={
          <IoCloseCircleSharp
            onClick={() => setDetailModal(false)}
            fontSize={20}
          />
        }
        destroyOnClose={true}
      >
        {currentChat.isGroupChat && (
          <>
            <h3>Name:  {currentChat.chatName}</h3>
            <h3 className="part">Participants:</h3>
            <div className="contacts">
              {currentChat.users.map((contact, index) => {
                return (
                  <div key={contact._id} className="contact">
                    <div className="avatar">
                      <img
                        src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                        alt=""
                      />
                    </div>
                      <h3 className="username">{contact.username}</h3>
                    {currentChat.admin._id === contact._id && <h3 className="admin">Admin</h3>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </StyledModal>
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 10% 75% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: #080420;

    .dropdown {
      .ant-dropdown-menu {
        background-color: #0d0d30;
      }
    }

    svg {
      font-size: 1.5rem;
      color: #ebe7ff;
    }
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 2rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      gap: 1rem;
      .content {
        max-width: 40%;
        min-width: 4rem;
        overflow-wrap: break-word;
        padding: 0.2rem 0.5rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        display: flex;
        flex-direction: column;

        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
        .sender {
          font-size: 13px;
          color: #9a86f3;
        }
        .text {
          margin-top: 0.3rem;
        }
        .time {
          font-size: 10px;
          align-self: flex-end;
          color: #8f8f92;
        }
      }
      .avatar {
        img {
          height: 2.5rem;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #450371d4;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #005bb791;
      }
    }
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-content {
    background-color: #080420;
    .ant-modal-header {
      background-color: #080420;
      .ant-modal-title {
        color: #ebe7ff;
        text-align: center;
      }
    }

    svg {
      font-size: 1.5rem;
      color: #ebe7ff;
    }
    .ant-modal-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    form {
      width: 100%;
    }
    .input {
      background-color: transparent;
      padding: 0.5rem;
      border: 0.1rem solid #4e0eff;
      border-radius: 0.4rem;
      color: white;
      width: 100%;
      font-size: 1rem;
      margin-bottom: 1rem;
      &:focus {
        border: 0.1rem solid #997af0;
        outline: none;
      }
    }

    .btn {
      background-color: #4e0eff;
      color: white;
      padding: 0.6rem 1rem;
      border: none;
      width: 10rem;
      font-weight: bold;
      cursor: pointer;
      border-radius: 0.4rem;
      font-size: 1rem;
      text-transform: uppercase;
      &:hover {
        background-color: #4e0eff;
      }
    }
    h3 {
      color: #fff;
      margin-bottom: 0.6rem;
    }
    .part {
      margin-bottom: 0.3rem;
      align-self: flex-start;
    }
    .contacts {
      width: 100%;
      height: 50vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: auto;
      gap: 0.8rem;
      &::-webkit-scrollbar {
        width: 0.2rem;
        &-thumb {
          background-color: #ffffff39;
          width: 0.1rem;
          border-radius: 1rem;
        }
      }
      .contact {
        background-color: #ffffff34;
        min-height: 3rem;
        cursor: pointer;
        width: 90%;
        border-radius: 0.2rem;
        padding: 0.4rem 0.8rem;
        position: relative;
        display: flex;
        gap: 1rem;
        align-items: center;
        transition: 0.5s ease-in-out;
        .avatar {
          img {
            height: 2rem;
          }
        }
        .username {
            color: white
        }
        .admin {
            color: #080420;
            margin-left: auto;
          }
        input {
          &:checked + .box {
            background-color: #080420;
            border: none;
          }
        }
        .box {
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 50%;
          cursor: pointer;
          height: 1.5rem;
          width: 1.5rem;
          margin-left: auto;
        }
      }
    }
  }
`;

export default ChatContainer;
