import './ChatListItem.css';
import { Chat } from '../../types';

interface Props {
    chat: Chat;
    active: boolean;
    onClick: () => void;
}

export default function ChatListItem({ chat, active, onClick }: Props) {
    return (
        <div className={`chat ${active ? 'active' : ''}`} onClick={onClick}>
            <img src="user-avatar.jpg" alt="User Avatar" />
            <div className="chat-info">
                <span className="chat-name">{chat.participants.join(',')}</span>
                <span className="chat-last-message">Last message preview...</span>
            </div>
        </div>
    );
}