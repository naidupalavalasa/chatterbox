export const listMessagesByChatRoom = /* GraphQL */ `
  query ListMessagesByChatRoom($chatRoomID: ID!, $sortDirection: ModelSortDirection) {
    listMessagesByChatRoom(chatRoomID: $chatRoomID, sortDirection: $sortDirection) {
      items {
        id
        content
        sender
        senderProfileImage
        chatRoomID
        timestamp
        image
      }
    }
  }
`;
