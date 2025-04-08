import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { API, graphqlOperation } from '@aws-amplify/api-graphql';
import { Storage } from '@aws-amplify/storage';
import { listChatRoomsByUser } from "../graphql/queries";
import { onUpdateChatRoom } from "../graphql/subscriptions";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    if (!currentUser?.username) return;

    const fetchChats = async () => {
      try {
        const res = await API.graphql(
          graphqlOperation(listChatRoomsByUser, {
            userID: currentUser.username,
          })
        );

        const chatRooms = res.data?.listChatRoomsByUser?.items || [];
        setChats(chatRooms);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();

    // Subscribe to updates
    const subscription = API.graphql(
      graphqlOperation(onUpdateChatRoom, {
        userID: currentUser.username,
      })
    ).subscribe({
      next: ({ value }) => {
        const updatedChat = value.data.onUpdateChatRoom;
        setChats((prevChats) => {
          const updated = prevChats.map((chat) =>
            chat.id === updatedChat.id ? updatedChat : chat
          );
          return updated;
        });
      },
      error: (error) => console.warn("Subscription error:", error),
    });

    return () => subscription.unsubscribe();
  }, [currentUser?.username]);

  const handleSelect = (chatUser) => {
    dispatch({ type: "CHANGE_USER", payload: chatUser });
  };

  return (
    <div className="chats">
      {chats
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map((chat) => {
          const userInfo = chat.participants.find(
            (p) => p.id !== currentUser.username
          );

          if (!userInfo) return null;

          return (
            <div
              className="userChat"
              key={chat.id}
              onClick={() => handleSelect(userInfo)}
            >
              <img src={userInfo.photoURL} alt="User" />
              <div className="userChatInfo">
                <span>{userInfo.displayName}</span>
                <p>{chat.lastMessage?.text || "No messages yet"}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Chats;
