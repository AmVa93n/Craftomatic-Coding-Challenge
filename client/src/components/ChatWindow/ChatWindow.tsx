import './ChatWindow.css';
import { Message } from '../../types';

interface Props {
    messages: Message[];
    participants: string[];
}

export default function ChatWindow({ messages, participants }: Props) {
    return (
        <div className="chat-window">
            <div className="chat-header">
                <h2>Chat with {participants.join(', ')}</h2>
            </div>
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className="chat-message">
                        <p>{message.text}</p>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input type="text" placeholder="Type a message..." />
                <button>Send</button>
            </div>
        </div>
    );
};