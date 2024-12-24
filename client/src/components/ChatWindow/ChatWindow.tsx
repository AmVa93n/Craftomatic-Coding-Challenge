import './ChatWindow.css';
import { Chat } from '../../types';
import { useState, useEffect, useRef } from 'react';
import useSocket from '../../hooks/useSocket'
import useAuth from '../../hooks/useAuth';
import useFormat from '../../hooks/useFormat';
import data, { Skin } from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function ChatWindow({ chat }: {chat: Chat}) {
    const [messageText, setMessageText] = useState(''); // State to store the message input
    const { socket, castIdToUser, getChatName, getParticipants } = useSocket();
    const { formatTime } = useFormat();
    const { user } = useAuth();
    const chatContainerRef = useRef<HTMLDivElement>(null); // Ref to the chat container div
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State to control the visibility of the emoji picker

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

    // Scroll chat to the bottom whenever a new message is added
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chat.messages]);

    return (
        <div className="chat-window">
            <div className="chat-header">
                <h2>{chat.name || `Chat with ${getChatName(chat)}`}</h2>
                {chat.participants.length > 2 && <span>{getParticipants(chat)}</span>}
            </div>
            <div className="chat-messages" ref={chatContainerRef}>
                {chat.messages.map((message, index) => (
                    <div key={index} className="chat-message">
                        <img 
                            src={castIdToUser(message.sender)?.image || user?.image || '/default-avatar.png'} 
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
                <button className='emoji-button' onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😊</button>
                <button onClick={handleSend}>Send</button>
                {showEmojiPicker && (
                    <div className='emoji-picker'>
                        <Picker 
                            data={data} 
                            onEmojiSelect={(emoji: Skin) => setMessageText(messageText + emoji.native)} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};