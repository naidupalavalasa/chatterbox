import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Auth } from '@aws-amplify/auth';
import { Storage } from '@aws-amplify/storage';


function Navbar() {
  const { currentUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await Auth.signOut();
      window.location.reload(); // Or redirect to login page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="navbar">
      <span className="logo">
        <marquee>Chat Me</marquee>
      </span>
      <div className="user">
        <img src={currentUser?.attributes?.picture || "/default-avatar.png"} alt="avatar" />
        <span>{currentUser?.attributes?.email}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;
