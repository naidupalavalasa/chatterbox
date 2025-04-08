import React, { useContext, useEffect, useState } from "react";
import { API, graphqlOperation } from '@aws-amplify/api-graphql';
import { ChatContext } from "../context/ChatContext";
import Message from "./Message";
import { listMessagesByChatRoom } from "../graphql/customQueries"; // You will create this query

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!data?.chatRoom?.id) return;

        const res = await API.graphql(
          graphqlOperation(listMessagesByChatRoom, {
            chatRoomID: data.chatRoom.id,
            sortDirection: "ASC", // oldest to newest
          })
        );

        setMessages(res.data.listMessagesByChatRoom.items);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [data.chatRoom?.id]);

  return (
    <div className="messages">
      {messages.map((m) => (
        <Message message={m} key={m.id} />
      ))}
    </div>
  );
};

export default Messages;
