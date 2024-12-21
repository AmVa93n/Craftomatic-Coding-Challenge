import { useEffect, useState } from 'react';
import './ChatPage.css';
import ChatWindow from '../ChatWindow/ChatWindow';
import { Message, Chat } from '../../types';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import ChatListItem from '../ChatListItem/ChatListItem';

export default function ChatPage() {
    const [chats, setChats] = useState<Chat[]>([]); // state to store the chats the user is part of
    const [activeChat, setActiveChat] = useState<Chat | null>(null); // state to store the currently active chat
    const [messages, setMessages] = useState<Message[]>([]); // state to store the messages of the active chat
    const socket = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        if (!socket) return;
        
        socket.on('getChats', (chats: Chat[]) => { // listen for the getChats event and update the chats state
            setChats(chats);
            if (chats.length > 0) setActiveChat(chats[0]); // Set the first chat as the active chat by default, if there are any chats
        });

        socket.on('getMessages', (messages: Message[]) => { // listen for the getMessages event and update the messages state
            setMessages(messages);
        });

        socket.on('newMessage', (message: Message) => { // listen for the newMessage event and add the new message to the messages state
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => { // Clean up the event listeners when the component unmounts
            socket.off('getChats');
            socket.off('getMessages');
            socket.off('newMessage');
        };
        
    }, [socket, user]);

    useEffect(() => {
        if (!socket) return;
        if (activeChat) socket.emit('joinChat', activeChat.id); // Join the active chat whenever it changes
    }, [socket, activeChat]);

    return (
        <div className="chat-page">
            <div className='chat-list-container'>
                <div className='chat-list-header'>
                    <h2>Your Chats</h2>
                </div>

                <div className="chat-list">
                    {chats.map((chat) => (
                        <ChatListItem key={chat.id} chat={chat} active={chat === activeChat} onClick={() => setActiveChat(chat)} />
                    ))}
                </div>

                <div className='chat-list-footer'>
                    <button onClick={() => socket?.emit('chat')}>Start a new Chat</button>
                </div>
            </div>
            
            <div className='chat-window-container'>
                <ChatWindow messages={messages} participants={activeChat?.participants || ['']} />
            </div>
        </div>
    );
};