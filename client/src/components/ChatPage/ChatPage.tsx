import { useEffect, useState } from 'react';
import './ChatPage.css';
import ChatWindow from '../ChatWindow/ChatWindow';
import { Message, Chat } from '../../types';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';
import ChatListItem from '../ChatListItem/ChatListItem';
import UserSelectionModal from '../UserSelectionModal/UserSelectionModal';

export default function ChatPage() {
    const [chats, setChats] = useState<Chat[]>([]); // state to store the chats the user is part of
    const [activeChat, setActiveChat] = useState<Chat | null>(null); // state to store the currently active chat
    const [messages, setMessages] = useState<Message[]>([]); // state to store the messages of the active chat
    const [isModalOpen, setIsModalOpen] = useState(false); // state to control the visibility of the UserSelectionModal
    const { socket, castIdToUser } = useSocket();
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

        socket.on('newChat', (chat: Chat) => { // listen for the newChat event
            setChats((prevChats) => // Add the new chat to the chats state if it doesn't already exist
                (prevChats.some((existingChat) => existingChat.id === chat.id)) ? prevChats : [...prevChats, chat]
            );
            setActiveChat(chat);
        });

        socket.on('newMessage', (message: Message) => { // listen for the newMessage event
            if (message.chatId === activeChat?.id) { // Add the new message to the messages state if it belongs to the active chat
                setMessages((prevMessages) => [...prevMessages, message]);
            }
             // Update the lastMessage of the chat in the chats state
            setChats((prevChats) => prevChats.map((chat) => {
                if (chat.id === message.chatId) {
                    return { ...chat, lastMessage: message };
                }
                return chat;
            }));
        });

        return () => { // Clean up the event listeners when the component unmounts
            socket.off('getChats');
            socket.off('getMessages');
            socket.off('newChat');
            socket.off('newMessage');
        };
        
    }, [socket, user]);

    useEffect(() => {
        if (!socket) return;
        if (activeChat) socket.emit('joinChat', activeChat.id); // Join the active chat whenever it changes
    }, [socket, activeChat]);

    // Helper function to get the list of names of the participants in a chat
    function getParticipants(chat: Chat) { 
        if (!chat) return ''; // Return an empty string if the chat is not provided
        const participantIds = chat.participants.filter((id) => id !== user?.id); // Filter out the current user's id
        const participants = participantIds.map((id) => castIdToUser(id)); // cast the participant ID's to user objects
        const jointString = participants.map((user) => user?.username).join(', '); // Join the usernames of the participants
        return jointString
    };

    return (
        <div className="chat-page">
            <div className='chat-list-container'>
                <div className='chat-list-header'>
                    <h2>Your Chats</h2>
                </div>

                <div className="chat-list">
                    {chats.map((chat) => (
                        // Display the chat only if it has messages or if the user started it
                        (chat.lastMessage || chat.participants[0] === user?.id) && 
                        <ChatListItem 
                            key={chat.id} 
                            participants={getParticipants(chat)} 
                            active={chat.id === activeChat?.id} 
                            onClick={() => setActiveChat(chat)} 
                            lastMessage={chat.lastMessage}
                        />
                    ))}
                </div>

                <div className='chat-list-footer'>
                    <button onClick={() => setIsModalOpen(true)}>
                        Start a new Chat
                    </button>
                    {isModalOpen && (
                        <UserSelectionModal
                            onClose={() => setIsModalOpen(false)}
                        />
                    )}
                </div>
            </div>
            
            <div className='chat-window-container'>
                {activeChat ?
                    <ChatWindow 
                        chat={activeChat} 
                        messages={messages} 
                        participants={getParticipants(activeChat)}
                    />
                :
                    /* Display a placeholder message if there are no chats */
                    <div>
                        <h2>Oh no! it looks like you don't have any chats yet 😢</h2>
                        <h3>Click on <span className='inline-code'>Start a new Chat</span> and select the user(s) you'd like to chat with</h3>
                    </div>
                }
            </div>
        </div>
    );
};