import { useState } from 'react';
import './ChatPage.css';
import ChatWindow from '../ChatWindow/ChatWindow';
import useSocket from '../../hooks/useSocket';
import ChatList from '../ChatList/ChatList';
import NewChatModal from '../NewChatModal/NewChatModal';

export default function ChatPage() {
    const { activeChat } = useSocket();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false); // state to control the visibility of the ChatList in mobile view
    const [isModalOpen, setIsModalOpen] = useState(false); // state to control the visibility of the new chat modal

    return (
        <div className="chat-page">
            <div className={`chat-list-container ${isDrawerOpen ? 'open' : ''}`}>
                <ChatList 
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