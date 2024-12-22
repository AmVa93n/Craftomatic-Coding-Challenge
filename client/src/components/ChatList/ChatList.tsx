import './ChatList.css'
import ChatListItem from '../ChatListItem/ChatListItem';
import UserSelectionModal from '../UserSelectionModal/UserSelectionModal';
import { Chat } from '../../types';
import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';

interface Props {
    chats: Chat[];
    activeChat: Chat | null;
    setActiveChat: (chat: Chat) => void;
}

export default function ChatList({ chats, activeChat, setActiveChat }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false); // state to control the visibility of the UserSelectionModal
    const { user, logOutUser } = useAuth();
    const { getParticipants } = useSocket();

    // Helper function to sort the chats based on the timestamp of the last message
    function sortChats(a: Chat, b: Chat) {
        const a_timestamp = new Date(a.messages[a.messages.length - 1].timestamp).getTime();
        const b_timestamp = new Date(b.messages[b.messages.length - 1].timestamp).getTime();
        return b_timestamp - a_timestamp;
    }

    return (
        <div className="chat-list-window">
            <div className='chat-list-header'>
                    <h2>Your Chats</h2>
                    <div className='user-info'>
                        <img className='avatar' src={user?.image || '/default-avatar.png'} alt='User Avatar' />
                        <span>Logged in as <b>{user?.username}</b></span>
                    </div>
            </div>

            <div className="chat-list">
                {chats.sort(sortChats).map((chat) => ( 
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
                <button className='logout-button' onClick={logOutUser}>Logout</button>
                {isModalOpen && (
                    <UserSelectionModal
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};