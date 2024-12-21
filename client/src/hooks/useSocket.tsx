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

    return {...context, castIdToUser};
};