import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth } from '@aws-amplify/auth';
import { Hub } from '@aws-amplify/core';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      setCurrentUser({
        username: user.username,
        email: user.attributes.email,
        avatarUrl: user.attributes?.picture || "",
        attributes: user.attributes,
      });
    } catch (error) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const listener = (data) => {
      switch (data.payload.event) {
        case "signIn":
        case "signUp":
        case "tokenRefresh":
          fetchCurrentUser();
          break;
        case "signOut":
          setCurrentUser(null);
          break;
        default:
          break; // ✅ Default case added
      }
    };

    const hubListener = Hub.listen("auth", listener);

    return () => {
      hubListener(); // ✅ Clean up listener on unmount
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
