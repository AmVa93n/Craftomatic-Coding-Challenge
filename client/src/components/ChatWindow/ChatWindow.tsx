import './ChatWindow.css';
import { Chat, Message } from '../../types';
import { useState, useEffect, useRef } from 'react';
import useSocket from '../../hooks/useSocket'
import useAuth from '../../hooks/useAuth';

interface Props {
    chat: Chat
    messages: Message[];
    participants: string;
}

export default function ChatWindow({ chat, messages, participants }: Props) {
    const [messageText, setMessageText] = useState('');
    const { socket, castIdToUser } = useSocket();
    const { user } = useAuth();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    function handleSend() {
        if (!messageText.trim()) return; // Check if the message is not empty
        const message = { // Create a message object with the sender's id, text, and chatId
            sender: user?.id,
            text: messageText,
            chatId: chat.id
        }
        socket?.emit('message', message) // Emit the message event to the server with the message object
        setMessageText(''); // Clear the input field after sending
    };

    // Scroll chat to the bottom whenever messages array changes
    useEffect(() => {
        if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    function formatTime(timestamp: string) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h2>Chat with {participants}</h2>
            </div>
            <div className="chat-messages" ref={chatContainerRef}>
                {messages.map((message, index) => (
                    <div key={index} className="chat-message">
                        <img 
                            src={castIdToUser(message.sender)?.image || '/default-avatar.png'} 
                            alt={`avatar`} 
                            className="avatar" 
                        />
                        <div className="message-content">
                            <div className="message-header">
                                <span className="username">{castIdToUser(message.sender)?.username || 'You'}</span>
                                <span className="timestamp">{formatTime(message.timestamp)}</span>
                            </div>
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input type="text" placeholder="Type a message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};