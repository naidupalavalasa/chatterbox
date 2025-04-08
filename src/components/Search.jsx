import React, { useContext, useState } from "react";
import { API, graphqlOperation } from '@aws-amplify/api-graphql';
import { listUsers } from "../graphql/queries";
import { createChatRoom, createUserChat } from "../graphql/mutations";
import { AuthContext } from "../context/AuthContext";
import { v4 as uuid } from "uuid";

const Search = () => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleSearch = async () => {
    try {
      const userData = await API.graphql(
        graphqlOperation(listUsers, {
          filter: { username: { eq: username } }
        })
      );

      const foundUser = userData.data.listUsers.items[0];

      if (foundUser) {
        setUser(foundUser);
        setErr(false);
      } else {
        setErr(true);
        setUser(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setErr(true);
    }
  };

  const handleKey = (e) => {
    if (e.code === "Enter") handleSearch();
  };

  const handleSelect = async () => {
    const combinedId =
      currentUser.username > user.username
        ? currentUser.username + user.username
        : user.username + currentUser.username;

    try {
      // Create a new chat room if one doesn't exist
      const newChatRoom = await API.graphql(
        graphqlOperation(createChatRoom, {
          input: {
            id: combinedId,
            participants: [currentUser.username, user.username],
          },
        })
      );

      // Create user-chat mapping
      await Promise.all([
        API.graphql(
          graphqlOperation(createUserChat, {
            input: {
              id: uuid(),
              userId: currentUser.username,
              chatRoomID: combinedId,
              lastMessage: "",
            },
          })
        ),
        API.graphql(
          graphqlOperation(createUserChat, {
            input: {
              id: uuid(),
              userId: user.username,
              chatRoomID: combinedId,
              lastMessage: "",
            },
          })
        ),
      ]);

      setUser(null);
      setUsername("");
    } catch (error) {
      console.error("Error selecting user/chat creation:", error);
    }
  };

  return (
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder="Find a user"
          onKeyDown={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>
      {err && <span>User not found!</span>}
      {user && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user.profileImage || "/default-avatar.png"} alt="" />
          <div className="userChatInfo">
            <span>{user.username}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
