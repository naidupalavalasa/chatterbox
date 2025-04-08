import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const isOwner = message.sender === currentUser?.attributes?.email;

  return (
    <div ref={ref} className={`message ${isOwner ? "owner" : ""}`}>
      <div className="messageInfo">
        <img
          src={
            isOwner
              ? currentUser.avatarUrl || "/default-avatar.png"
              : message.senderProfileImage || "/default-avatar.png"
          }
          alt="avatar"
        />
        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="messageContent">
        <p>{message.content}</p>
        {message.image && <img src={message.image} alt="attached" />}
      </div>
    </div>
  );
};

export default Message;
