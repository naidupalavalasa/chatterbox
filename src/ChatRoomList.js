import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from '@aws-amplify/api-graphql';
import { listChatRooms } from './graphql/queries';
import { createChatRoom } from './graphql/mutations'; // Fixed import

const ChatRoomList = ({ onRoomSelect }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await API.graphql(graphqlOperation(listChatRooms));
      setRooms(res.data.listChatRooms.items);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
    }
  };

  async function handleCreateRoom() {
    if (!newRoomName.trim()) return;

    try {
      await API.graphql(
        graphqlOperation(createChatRoom, { input: { name: newRoomName } })
      );
      setNewRoomName('');
      fetchRooms(); // Refresh list after creation
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
      <h2>Chat Rooms</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {rooms.map((room) => (
          <li
            key={room.id}
            onClick={() => onRoomSelect(room.id)}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderBottom: '1px solid #eee'
            }}
          >
            {room.name}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="New room name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          style={{ padding: '6px', marginRight: '8px' }}
        />
        <button onClick={handleCreateRoom}>Create Room</button>
      </div>
    </div>
  );
};

export default ChatRoomList;
