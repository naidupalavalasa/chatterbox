import { API, graphqlOperation } from '@aws-amplify/api-graphql';
import { Auth } from '@aws-amplify/auth';
// import { Storage } from '@aws-amplify/storage';
import { createMessage, createChatRoom } from './graphql/mutations';

/**
 * Send a chat message.
 *
 * @param {string} content - Message content (text or file URL).
 * @param {string} chatRoomID - Target chat room ID.
 */
export const sendMessage = async (content, chatRoomID) => {
  try {
    const user = await Auth.currentAuthenticatedUser();

    const message = {
      content,
      sender: user.username,
      chatRoomID,
      timestamp: new Date().toISOString(),
      senderProfileImage: user.attributes?.picture || '',
    };

    await API.graphql(graphqlOperation(createMessage, { input: message }));
  } catch (err) {
    console.error('Error sending message:', err);
  }
};

/**
 * Create a new chat room.
 *
 * @param {string} name - Name of the new chat room.
 * @returns {Promise<Object|null>}
 */
export const createNewChatRoom = async (name) => {
  try {
    const user = await Auth.currentAuthenticatedUser();

    const input = {
      name,
      createdBy: user.username, // Optional: if your schema has a createdBy field
    };

    const res = await API.graphql(graphqlOperation(createChatRoom, { input }));
    return res.data.createChatRoom;
  } catch (err) {
    console.error('Error creating chat room:', err);
    return null;
  }
};
