import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import "./style.scss";

import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthContext } from "./context/AuthContext";

import { createNewChatRoom, sendMessage } from "./ChatService";
import ChatRoomList from "./ChatRoomList";
import MessageList from "./MessageList";
import ChatInput from "./components/ChatInput";

// ✅ Configure Amplify
Amplify.configure(awsExports);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const { currentUser } = useContext(AuthContext);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Optional: auto-create a default room
  useEffect(() => {
    const run = async () => {
      const chatRoom = await createNewChatRoom("General");
      if (chatRoom) {
        await sendMessage("Hello AWS!", "siddu@example.com", chatRoom.id);
      }
    };
    // run(); // Uncomment to auto-create a room on load
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="App" style={{ padding: 20 }}>
                <h1>Chat App</h1>
                <div style={{ display: "flex", gap: "2rem" }}>
                  {/* Chat Room List Sidebar */}
                  <ChatRoomList onRoomSelect={setSelectedRoom} />

                  {/* Main Chat Area */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {selectedRoom ? (
                      <>
                        <h2>{selectedRoom.name}</h2>
                        <div
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "1rem",
                            maxHeight: "60vh",
                            overflowY: "auto",
                            marginBottom: "1rem",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <MessageList chatRoomID={selectedRoom.id} />
                        </div>
                        <ChatInput
                          chatRoomID={selectedRoom.id}
                          sender={currentUser?.email || "guest@example.com"}
                        />
                      </>
                    ) : (
                      <div style={{ marginTop: "2rem", fontStyle: "italic" }}>
                        Please select a chat room to begin.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
