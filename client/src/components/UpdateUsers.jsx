import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { host, routes } from "../utils/routes";
import { useChat } from "../context/Chat";
import { toast } from "react-toastify";
import { getHeaders } from "../utils/chatHelper";

const UpdateUsers = ({ handleSubmit, mode }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { user, currentChat } = useChat();

  const handlCheckbox = (checked, id) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, id]);
    } else {
      setSelectedUsers((selectedUsers) =>
        selectedUsers.filter((u) => u !== id)
      );
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(
        `${host}/${routes.otherUsers}/${currentChat._id}`,
        getHeaders(user.token)
      );
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      toast.error("Something went worng");
    }
  };

  useEffect(() => {
    if(mode==='Add') {
      fetchUsers();
    } else {
      setUsers(currentChat.users);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Container>
      <form  onSubmit={(e)=>handleSubmit(selectedUsers,e)}>
        <div className="contacts">
          {users.map((contact, index) => {
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
                  onChange={(e) => handlCheckbox(e.target.checked, contact._id)}
                />
                <div className="box"></div>
              </label>
            );
          })}
        </div>
        <button className="btn" type="submit">
          Submit
        </button>
      </form>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  svg {
    font-size: 1.5rem;
    color: #ebe7ff;
  }
  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
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
`;

export default UpdateUsers;
