import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import { useChat } from "../context/Chat";
import { toast } from "react-toastify";
import axios from "axios";
import { host, routes } from "../utils/routes";
import { getHeaders, getOtherUser } from "../utils/chatHelper";
import { FaSearch } from "react-icons/fa";
import { IoCloseCircleSharp } from "react-icons/io5";
import { Modal } from "antd";
import { Buffer } from "buffer";
import Logout from "./Logout";
export default function Contacts({socket}) {
  const { chats, setChats, user, currentChat, setCurrentChat } = useChat();
  const [userModal, setUserModal] = useState(false);
  const [groupModal, setgroupModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupUser, setGroupUser] = useState([]);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get(`${host}/${routes.getChats}`, getHeaders(user.token));
      if (data?.success) {
        setChats(data.chats);
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line
  }, []); 

  const fetchAllUsers = async () => {
    try {
      const { data } = await axios.get(`${host}/${routes.all_users}`, getHeaders(user.token));
      if (data.success) {
        setAllUsers(data.users);
        setUserModal(true);
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const userModalOpen = () => {
    fetchAllUsers();
  };

  const groupModalOpen = () => {
    setUserModal(false);
    setgroupModal(true);
  };

  const close = () => {
    setUserModal(false);
  };

  const accessChat = async (chat) => {
    try {
      const { data } = await axios.post(
        `${host}/${routes.createChat}`,
        {
          user: chat._id,
        },
        getHeaders(user.token)
      );

      if (data.success) {
        setUserModal(false);
        if (!data.exist) {
          setChats((chats) => [data.chat, ...chats]);
        }
        setCurrentChat(data.chat);
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const closeGroupModal = () => {
    setgroupModal(false);
  };
  const handlCheckbox = (checked, id) => {
    if (checked) {
      setGroupUser([...groupUser, id]);
    } else {
      setGroupUser((groupUser) => groupUser.filter((u) => u !== id));
    }
  };

  const createGroup = async (e) => {
    try {
      e.preventDefault();
      const image = await axios.get(
        `https://api.multiavatar.com/4645646/${Math.round(Math.random() * 1000)}`
      );
      const buffer = new Buffer(image.data);

      const {data} = await axios.post(`${host}/${routes.groupChat}`, {
        users: [...groupUser, user._id],
        name: groupName,
        avatarImage: buffer.toString("base64")
      }, getHeaders(user.token));
      if(data?.success) {
        setCurrentChat(data.chat)
        setChats([data.chat, ...chats]);
        setgroupModal(false);
      }
    } catch(err) {
      toast.error("Something went wrong");
    }
  };
  return (
    <>
      {user && (
        <Container>
          <div className="bar">
            <div className="brand">
              <img src={Logo} alt="logo" />
              <h3>snappy</h3>
            </div>
            <FaSearch fontSize={20} color="#124578" onClick={userModalOpen} />
          </div>
          <div className="contacts">
            {chats &&
              chats.map((contact, index) => {
                return (
                  <div
                    key={contact._id}
                    className={`contact ${
                      contact?._id === currentChat?._id ? "selected" : ""
                    }`}
                    onClick={() => setCurrentChat(contact)}
                  >
                    {contact.isGroupChat ? (
                      <>
                        <div className="avatar">
                          <img
                            src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                            alt=""
                          />
                        </div>
                        <div className="username">
                          <h3>{contact.chatName}</h3>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="avatar">
                          <img
                            src={`data:image/svg+xml;base64,${
                              getOtherUser(contact.users, user._id).avatarImage
                            }`}
                            alt=""
                          />
                        </div>
                        <div className="username">
                          <h3>
                            {getOtherUser(contact.users, user._id).username}
                          </h3>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
          </div>
          <div className="bar">
            <div className="current-user">
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${user.avatarImage}`}
                  alt="avatar"
                />
              </div>
              <div className="username">
                <h4>{user.username}</h4>
              </div>
            </div>
            <Logout socket={socket} />
          </div>
        </Container>
      )}
      <StyledModal
        title="All Users"
        open={userModal}
        footer={null}
        closeIcon={<IoCloseCircleSharp onClick={close} fontSize={20} />}
        afterClose={close}
        destroyOnClose={true}
      >
        <div className="contacts">
          {allUsers.map((contact, index) => {
            return (
              <div
                key={contact._id}
                className={`contact`}
                onClick={() => accessChat(contact)}
              >
                <div className="avatar">
                  <img
                    src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                    alt=""
                  />
                </div>
                <div className="username">
                  <h3>{contact.username}</h3>
                </div>
              </div>
            );
          })}
        </div>
        <button className="btn" onClick={groupModalOpen}>
          Create Group
        </button>
      </StyledModal>

      <StyledModal
        title="All Users"
        open={groupModal}
        footer={null}
        closeIcon={
          <IoCloseCircleSharp onClick={closeGroupModal} fontSize={20} />
        }
        destroyOnClose={true}
      >
        <form onSubmit={(e) => createGroup(e)}>
          <input
            className="input"
            type="text"
            name="group_name"
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="contacts">
            {allUsers.map((contact, index) => {
              return (
                <label
                  htmlFor={`${contact._id}`}
                  key={contact._id}
                  className={`contact`}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt=""
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                  <input
                    type="checkbox"
                    id={`${contact._id}`}
                    style={{ visibility: "hidden" }}
                    onChange={(e) =>
                      handlCheckbox(e.target.checked, contact._id)
                    }
                  />
                  <div className="box"></div>
                </label>
              );
            })}
          </div>
          <button className="btn" type="submit">Submit</button>
        </form>
      </StyledModal>
    </>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  overflow: hidden;
  background-color: #080420;
  .bar {
    background-color: #0d0d30;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    box-shadow: rgba(5, 32, 101, 0.16) 0px 1px 4px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      min-height: 2rem;
      cursor: pointer;
      width: 100%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      border-bottom: 1px solid #9a86f3;
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
        h3 {
          color: white;
        }
      }
    }
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    .avatar {
      img {
        height: 2rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h4 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h4 {
          font-size: 1rem;
        }
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
          h3 {
            color: white;
          }
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
