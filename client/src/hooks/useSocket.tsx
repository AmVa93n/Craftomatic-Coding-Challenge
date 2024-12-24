import { useContext } from 'react';
import { SocketContext } from '../context/socket.context';
import { Chat } from '../types';
import { AuthContext } from '../context/auth.context';

export default function useSocket() {
    const context = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }

    // Helper function to cast a user ID to a user object
    function castIdToUser(id: string) {
        return context.contacts.find((user) => user.id === id);
    }

    // Helper function to get the name displayed for a chat
    function getChatName(chat: Chat) {
        if (chat.participants.length === 2) { // For one-on-one chats, show the other user's username
            const index = chat.participants[0] === user?.id ? 1 : 0;
            return castIdToUser(chat.participants[index])?.username;
        }
        return chat.name; // For group chats, show the chat name
    }

    // Helper function to get the chat image based on the participants
    function getChatImage(participants: string[]) {
        if (participants.length === 2) { // For one-on-one chats, show the other user's image
            const index = participants[0] === user?.id ? 1 : 0;
            return castIdToUser(participants[index])?.image;
        }
        return '/group-chat.png'; // For group chats, show the group chat image
    }

    // Helper function to get the list of names of the participants in a chat
    function getParticipants(chat: Chat) { 
        if (!chat) return ''; // Return an empty string if the chat is not provided
        const participantIds = chat.participants.filter((id: string) => id !== user?.id); // Filter out the current user's id
        const names = participantIds.map((id: string) => castIdToUser(id)?.username); // cast the participant ID's to usernames
        return 'You, ' + names.join(', '); // Join the usernames to a single string
    };

    return {...context, castIdToUser, getChatName, getParticipants, getChatImage};
};