import React, { useEffect, useState } from 'react';
import { sendMessage } from '../ChatService';
import { Auth } from '@aws-amplify/auth';
import { Storage } from '@aws-amplify/storage';

import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css'; // Only if v2; newer doesn't need this


const ChatInput = ({ chatRoomID }) => {
  const [message, setMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderProfileImage, setSenderProfileImage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setSenderEmail(user.attributes.email);
        setSenderProfileImage(user.attributes.picture || '');
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message, senderEmail, chatRoomID, senderProfileImage);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const s3Response = await Storage.put(fileName, file, {
        contentType: file.type,
      });

      const fileUrl = await Storage.get(s3Response.key);
      await sendMessage(fileUrl, senderEmail, chatRoomID, senderProfileImage);
    } catch (error) {
      console.error("File upload error:", error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + (emoji.native || emoji.colons || ''));
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <div>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{ width: '300px', padding: '8px' }}
        />
        <button onClick={handleSend} style={{ marginLeft: '10px' }}>
          Send
        </button>
        <input type="file" onChange={handleFileUpload} style={{ marginLeft: '10px' }} />
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ marginLeft: '10px' }}>
          😀
        </button>
      </div>

      {showEmojiPicker && (
        <div style={{ position: 'absolute', zIndex: 100 }}>
          <Picker onSelect={handleEmojiSelect} />
          {/* For emoji-mart v3+, use: <Picker onEmojiSelect={handleEmojiSelect} /> */}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
