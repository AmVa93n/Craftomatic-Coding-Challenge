import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { AuthContext } from "./auth.context";
import { User } from '../types';

const SocketContext = createContext<context>({} as context);

interface context {
  socket: Socket | null
  contacts: User[]
}

function SocketProvider({ children }: PropsWithChildren) {
  const [socket, setSocket] = useState<Socket | null>(null); // State to store the socket connection
  const [contacts, setContacts] = useState<User[]>([]); // state to store the users the current user can chat with
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000', { transports: ['websocket'] });
    setSocket(newSocket);

    if (user) {
      newSocket.emit('online', user); // Emit the 'online' event with the user object
    }

    newSocket.on('getUsers', (users: User[]) => { // listen for the geUsers event and update the users state
      setContacts(users);
    });

    return () => { // Clean up the socket connection when the component unmounts
      newSocket.close();
      newSocket.off('getUsers');
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{socket, contacts}}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };