import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";

const Chats = () => {
  const [chats, setChats] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        if (doc.exists()) {
          setChats(doc.data());
        } else {
          setChats([]); // Set chats to an empty array if document doesn't exist
        }
      });

      return () => {
        unsub();
      };
    };

    // Check if currentUser.uid is truthy before calling getChats
    currentUser.uid && getChats();
  }, [currentUser.uid]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className="chats">
      {Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date).map((chat) => {
        // Check if userInfo exists before accessing its properties
        const userInfo = chat[1].userInfo;
        if (!userInfo || !userInfo.photoURL) {
          return null; // If userInfo or photoURL is undefined, return null to skip rendering
        }

        return (
          <div
            className="userChat"
            key={chat[0]}
            onClick={() => handleSelect(userInfo)}
          >
            <img src={userInfo.photoURL} alt="" />
            <div className="userChatInfo">
              <span>{userInfo.displayName}</span>
              <p>{chat[1].lastMessage?.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Chats;
