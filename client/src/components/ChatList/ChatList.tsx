import './ChatList.css'
import ChatListItem from '../ChatListItem/ChatListItem';
import { Chat } from '../../types';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';

interface Props {
    setIsDrawerOpen: (isOpen: boolean) => void;
    setIsModalOpen: (isOpen: boolean) => void;
}

export default function ChatList({ setIsDrawerOpen, setIsModalOpen }: Props) {
    const { user, logOutUser } = useAuth();
    const { chats, activeChat, setActiveChat, getChatName, getChatImage } = useSocket();

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
                        name={getChatName(chat) || 'Unnamed Chat'}
                        active={chat.id === activeChat?.id} 
                        onClick={() => {
                            setActiveChat(chat);
                            setIsDrawerOpen(false); // Close the drawer when a chat is selected
                        }} 
                        lastMessage={chat.messages[chat.messages.length - 1]}
                        image={getChatImage(chat.participants)}
                    />
                ))}
            </div>

            <div className='chat-list-footer'>
                <button onClick={() => setIsModalOpen(true)}>
                    Start a new Chat
                </button>
                <button className='logout-button' onClick={logOutUser}>Logout</button>
            </div>
        </div>
    );
};