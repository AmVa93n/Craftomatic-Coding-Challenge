import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { AuthContext } from "./auth.context";
import { User, Chat } from '../types';

const SocketContext = createContext<context>({} as context);

interface context {
  socket: Socket | null
  contacts: User[]
  chats: Chat[]
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
}

function SocketProvider({ children }: PropsWithChildren) {
  const [socket, setSocket] = useState<Socket | null>(null); // State to store the socket connection
  const [contacts, setContacts] = useState<User[]>([]); // state to store the users the current user can chat with
  const [chats, setChats] = useState<Chat[]>([]); // state to store the chats the user is part of
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000', { transports: ['websocket'] });
    setSocket(newSocket); // create a new socket connection

    if (user) {
      newSocket.emit('online', user); // Emit the 'online' event with the user object
    }

    // listen for the geUsers event (sent by the server when the user goes online)
    newSocket.on('getUsers', (users: User[]) => { 
      setContacts(users.sort((a,b) => a.username.localeCompare(b.username))); // Sort the users by username and update the users state
    });

    // listen for the getChats event (sent by the server when the user goes online)
    newSocket.on('getChats', (chats: Chat[]) => { 
        setChats(chats); // Update the chats state
        
    });

    return () => { // Clean up the socket connection when the component unmounts
      newSocket.off('getUsers');
      newSocket.off('getChats');
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{socket, contacts, chats, setChats}}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };