import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { AuthContext } from "./auth.context";
import { User, Chat, Message } from '../types';

const SocketContext = createContext<context>({} as context);

interface context {
  socket: Socket | null
  contacts: User[]
  chats: Chat[]
  activeChat: Chat | null
  setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>
}

function SocketProvider({ children }: PropsWithChildren) {
  const [socket, setSocket] = useState<Socket | null>(null); // State to store the socket connection
  const [contacts, setContacts] = useState<User[]>([]); // state to store the users the current user can chat with
  const [chats, setChats] = useState<Chat[]>([]); // state to store the chats the user is part of
  const [activeChat, setActiveChat] = useState<Chat | null>(null); // state to store the currently active chat
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3000', { transports: ['websocket'] });
    setSocket(newSocket); // create a new socket connection

    // Request permission to show notifications
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

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
        if (chats.length > 0) setActiveChat(chats[0]); // Set the first chat as the active chat by default, if there are any chats
    });

    // listen for the newChat event (sent by the server when a new chat is created with the user as a participant)
    newSocket.on('newChat', (newChat: Chat) => { 
      setChats((prevChats) => // Add to the chats state if it doesn't already exist
          (prevChats.some((existingChat) => existingChat.id === newChat.id)) ? prevChats : [newChat, ...prevChats]
      );
      if (newChat.participants[0] === user?.id) {
          setActiveChat(newChat); // set as active chat if the user started the chat
      } 
    });
    
    // listen for the newMessage event (sent by the server when a new message is sent in any chat)
    newSocket.on('newMessage', (newMsg: Message) => { 
      setChats((prevChats) => prevChats.map((chat) => { // update the chats state with the new message
          return chat.id === newMsg.chatId ? { ...chat, messages: [...chat.messages, newMsg] } : chat;
      }));
      setActiveChat((prevChat) => // If the active chat is the one that received the new message, update the active chat state
          prevChat?.id === newMsg.chatId ? { ...prevChat, messages: [...prevChat.messages, newMsg] } : prevChat
      );
    });

    return () => { // Clean up the socket connection and event listeners when the component unmounts
      newSocket.off('getUsers');
      newSocket.off('getChats');
      newSocket.off('newChat');
      newSocket.off('newMessage');
      newSocket.close();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{socket, contacts, chats, activeChat, setActiveChat}}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, SocketContext };