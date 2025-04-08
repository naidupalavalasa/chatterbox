import React, { useEffect, useState, useRef, useContext } from 'react';
import { API, graphqlOperation } from '@aws-amplify/api-graphql';
import { messagesByChatRoomID } from '../graphql/queries';
import { onCreateMessage } from '../graphql/subscriptions';
import { AuthContext } from '../context/AuthContext';
import React, { useEffect, useRef } from 'react';

const MessageList = ({ chatRoomID }) => {
  const { currentUser } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await API.graphql(graphqlOperation(messagesByChatRoomID, {
          chatRoomID,
          sortDirection: "ASC"
        }));
        setMessages(res.data.messagesByChatRoomID.items);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    if (chatRoomID) fetchMessages();
  }, [chatRoomID]);

  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateMessage)
    ).subscribe({
      next: ({ value }) => {
        const newMessage = value.data.onCreateMessage;
        if (newMessage.chatRoomID === chatRoomID) {
          setMessages((prev) => [...prev, newMessage]);
        }
      },
      error: (err) => console.error("Subscription error:", err),
    });

    return () => subscription.unsubscribe();
  }, [chatRoomID]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getInitials = (email) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div style={{
      maxHeight: '400px',
      overflowY: 'auto',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '8px'
    }}>
      <h3 style={{ marginBottom: '10px' }}>Messages</h3>
      {messages.map((msg) => {
        const isCurrentUser = msg.sender === currentUser?.email;
        const avatarUrl = msg.senderProfileImage;

        return (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: isCurrentUser ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '12px',
              maxWidth: '80%'
            }}
          >
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                backgroundColor: '#888',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {getInitials(msg.sender)}
              </div>
            )}

            {/* Message bubble */}
            <div
              style={{
                backgroundColor: isCurrentUser ? '#daf0ff' : '#f0f0f0',
                padding: '8px',
                borderRadius: '6px',
                flexGrow: 1
              }}
            >
              <strong>{msg.sender}</strong>
              <p style={{ margin: '4px 0' }}>{msg.content}</p>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
