import './ChatListItem.css';
import { Message } from '../../types';
import useSocket from '../../hooks/useSocket';

interface Props {
    participants: string;
    active: boolean;
    onClick: () => void;
    lastMessage: Message;
}

export default function ChatListItem({ participants, active, onClick, lastMessage }: Props) {
    const { castIdToUser } = useSocket();

    return (
        <div className={`chat ${active ? 'active' : ''}`} onClick={onClick}>
            <img 
                src={'/default-avatar.png'} 
                alt="avatar" 
            />
            <div className="chat-info">
                <span className="chat-name">{participants}</span>
                {lastMessage && 
                    <span className="last-message">
                        <span className="last-message-sender">{castIdToUser(lastMessage.sender)?.username || 'You'}: </span>
                        <span>{lastMessage.text}</span>
                    </span>
                }
            </div>
        </div>
    );
}