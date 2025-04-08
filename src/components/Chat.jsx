import React, { useContext } from "react";
import Cam from "../img/cam.png";
import Add from "../img/add.png";
import More from "../img/more.png";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {
  const { data } = useContext(ChatContext);

  return (
    <div className="chat">
      <div className="chatInfo">
        <span>{data?.user?.displayName || "Select a chat"}</span>
        <div className="chatIcons">
          <img src={Cam} alt="Camera" />
          <img src={Add} alt="Add" />
          <img src={More} alt="More Options" />
        </div>
      </div>
      {data?.chatRoomID ? (
        <>
          <Messages />
          <Input />
        </>
      ) : (
        <div className="noChatSelected">Please select a chat to start messaging.</div>
      )}
    </div>
  );
};

export default Chat;
