import React, { useContext, useState } from "react";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { API, graphqlOperation } from '@aws-amplify/api-graphql';
import { Storage } from '@aws-amplify/storage';

import { v4 as uuid } from "uuid";
import { createMessage } from "../graphql/mutations";

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext); // data.chatRoomID

  const handleSend = async () => {
    if ((!text.trim() && !img) || isSending) return;

    setIsSending(true);
    let imageUrl = "";

    if (img) {
      const fileName = `${uuid()}_${img.name}`;
      try {
        await Storage.put(fileName, img, {
          contentType: img.type,
        });
        imageUrl = await Storage.get(fileName);
      } catch (error) {
        console.error("Error uploading file: ", error);
        setIsSending(false);
        return;
      }
    }

    try {
      const messageInput = {
        id: uuid(),
        content: text.trim(),
        sender: currentUser?.attributes?.email || currentUser?.username,
        senderProfileImage: currentUser?.attributes?.picture || "", // assumes avatar from Cognito or user pool
        chatRoomID: data.chatRoomID,
        timestamp: new Date().toISOString(),
        image: imageUrl || null,
      };

      await API.graphql(graphqlOperation(createMessage, { input: messageInput }));

      setText("");
      setImg(null);
    } catch (err) {
      console.error("Error sending message:", err);
    }

    setIsSending(false);
  };

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setText(e.target.value)}
        value={text}
        disabled={isSending}
      />
      <div className="send">
        <img src={Attach} alt="Attach" />
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          onChange={(e) => setImg(e.target.files[0])}
        />
        <label htmlFor="file">
          <img src={Img} alt="Upload" />
        </label>
        <button onClick={handleSend} disabled={isSending}>
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Input;
