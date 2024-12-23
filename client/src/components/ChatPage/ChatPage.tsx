import { useEffect, useState } from 'react';
import './ChatPage.css';
import ChatWindow from '../ChatWindow/ChatWindow';
import { Message, Chat } from '../../types';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';
import ChatList from '../ChatList/ChatList';
import NewChatModal from '../NewChatModal/NewChatModal';

export default function ChatPage() {
    const [activeChat, setActiveChat] = useState<Chat | null>(null); // state to store the currently active chat
    const { socket, chats, setChats, castIdToUser } = useSocket();
    const { user } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // state to control the visibility of the ChatList in mobile view
    const [isModalOpen, setIsModalOpen] = useState(false); // state to control the visibility of the new chat modal

    useEffect(() => {
        // Request permission to show notifications
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        if (chats.length > 0) setActiveChat(chats[0]); // Set the first chat as the active chat by default, if there are any chats

        if (!socket) return;

        // listen for the newChat event (sent by the server when a new chat is created with the user as a participant)
        socket.on('newChat', (newChat: Chat) => { 
            setChats((prevChats) => // Add to the chats state if it doesn't already exist
                (prevChats.some((existingChat) => existingChat.id === newChat.id)) ? prevChats : [newChat, ...prevChats]
            );
            if (newChat.participants[0] === user?.id) {
                setActiveChat(newChat); // set as active chat if the user started the chat
            } 
        });

        // listen for the newMessage event (sent by the server when a new message is sent in any chat)
        socket.on('newMessage', (newMsg: Message) => { 
            setChats((prevChats) => prevChats.map((chat) => { // update the chats state with the new message
                return chat.id === newMsg.chatId ? { ...chat, messages: [...chat.messages, newMsg] } : chat;
            }));
            setActiveChat((prevChat) => // If the active chat is the one that received the new message, update the active chat state
                prevChat?.id === newMsg.chatId ? { ...prevChat, messages: [...prevChat.messages, newMsg] } : prevChat
            );
            // Trigger a browser notification if the tab is not active
            if (document.hidden && Notification.permission === 'granted') {
                const sender = castIdToUser(newMsg.sender)?.username || 'Someone';
                new Notification('New Message', {
                    body: `${sender}: ${newMsg.text}`,
                    icon: castIdToUser(newMsg.sender)?.image || '/default-avatar.png'
                });
                console.log('Creating notification for new message from:', sender);
            }
        });

        return () => { // Clean up the event listeners when the component unmounts
            socket.off('newChat');
            socket.off('newMessage');
        };
        
    }, [socket, user, chats, setChats, castIdToUser]);

    return (
        <div className="chat-page">
            <div className={`chat-list-container ${isDrawerOpen ? 'open' : ''}`}>
                <ChatList 
                    chats={chats} 
                    activeChat={activeChat} 
                    setActiveChat={setActiveChat} 
                    setIsDrawerOpen={setIsDrawerOpen}
                    setIsModalOpen={setIsModalOpen}
                />
            </div>
            
            <div className='chat-window-container'>
                {activeChat ? <ChatWindow chat={activeChat} /> :
                    /* Display a placeholder message if there are no chats */
                    <div>
                        <h2>It looks like you don't have any chats yet</h2>
                        <h3>Click on <span className='inline-code'>Start a new Chat</span> and select the user(s) you'd like to chat with</h3>
                    </div>
                }
            </div>

            {isModalOpen && <NewChatModal onClose={() => setIsModalOpen(false)}/>}

            <button className="floating-button" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>🗨️</button>
        </div>
    );
};