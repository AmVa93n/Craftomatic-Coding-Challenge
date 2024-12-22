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
    const [isModalOpen, setIsModalOpen] = useState(false); // state to control the visibility of the UserSelectionModal
    const { socket, castIdToUser } = useSocket();
    const { user } = useAuth();

    useEffect(() => {
        // Request permission to show notifications
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        if (!socket) return;
        
        // listen for the getChats event (sent by the server when the user goes online)
        socket.on('getChats', (chats: Chat[]) => { 
            setChats(chats); // Update the chats state
            if (chats.length > 0) setActiveChat(chats[0]); // Set the first chat as the active chat by default, if there are any chats
        });

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
            socket.off('getChats');
            socket.off('newChat');
            socket.off('newMessage');
        };
        
    }, [socket, user]);

    // Helper function to get the list of names of the participants in a chat
    function getParticipants(chat: Chat) { 
        if (!chat) return ''; // Return an empty string if the chat is not provided
        const participantIds = chat.participants.filter((id) => id !== user?.id); // Filter out the current user's id
        const participants = participantIds.map((id) => castIdToUser(id)); // cast the participant ID's to user objects
        const jointString = participants.map((user) => user?.username).join(', '); // Join the usernames of the participants
        return jointString
    };

    // Helper function to sort the chats based on the timestamp of the last message
    function sortChats(a: Chat, b: Chat) {
        const a_timestamp = a.messages?.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp).getTime() : Infinity;
        const b_timestamp = b.messages?.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp).getTime() : Infinity;
        return b_timestamp - a_timestamp;
    }

    return (
        <div className="chat-page">
            <div className='chat-list-container'>
                <div className='chat-list-header'>
                    <h2>Your Chats</h2>
                </div>

                <div className="chat-list">
                    {chats.sort(sortChats).map((chat) => (
                        // Display the chat only if it has messages or if the user started it
                        (chat.messages.length > 0 || chat.participants[0] === user?.id) && 
                        <ChatListItem 
                            key={chat.id} 
                            participants={getParticipants(chat)} 
                            active={chat.id === activeChat?.id} 
                            onClick={() => setActiveChat(chat)} 
                            lastMessage={chat.messages[chat.messages.length - 1]}
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