import { useContext } from 'react';
import { SocketContext } from '../context/socket.context';

export default function useSocket() {
    const context = useContext(SocketContext);
    
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

    return {...context, castIdToUser, formatTimestamp};
};