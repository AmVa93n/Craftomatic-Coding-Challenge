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

    // Helper function to format the timestamp of a message to hh:mm
    function formatTimestamp(timestamp: string) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    function getChatName(chat: Chat) {
        if (chat.participants.length === 2) { // For one-on-one chats, show the other user's username
            if (chat.participants[1] === user?.id) {
                return castIdToUser(chat.participants[0])?.username;
            } else {
                return castIdToUser(chat.participants[1])?.username;
            }
        }
        return chat.name; // For group chats, show the chat name
    }

    // Helper function to get the list of names of the participants in a chat
    function getParticipants(chat: Chat) { 
        if (!chat) return ''; // Return an empty string if the chat is not provided
        const participantIds = chat.participants.filter((id: string) => id !== user?.id); // Filter out the current user's id
        const users = participantIds.map((id: string) => castIdToUser(id)); // cast the participant ID's to user objects
        const jointString = users.map((user) => user?.username).join(', '); // Join the usernames of the participants
        return 'You, ' + jointString
    };

    return {...context, castIdToUser, formatTimestamp, getChatName, getParticipants};
};