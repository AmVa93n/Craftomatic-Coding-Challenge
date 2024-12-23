import './ChatListItem.css';
import { Message } from '../../types';
import useSocket from '../../hooks/useSocket';

interface Props {
    name: string;
    active: boolean;
    onClick: () => void;
    lastMessage: Message;
    image: string | undefined;
}

export default function ChatListItem({ name, active, onClick, lastMessage, image }: Props) {
    const { castIdToUser, formatTimestamp } = useSocket();

    return (
        <div className={`chat ${active ? 'active' : ''}`} onClick={onClick}>
            <img 
                src={image || '/group-chat.png'} 
                alt="avatar" 
            />
            <div className="chat-info">
                <span className="chat-name">{name}</span>
                {lastMessage && 
                    <span className="last-message">
                        <span className="sender">{castIdToUser(lastMessage.sender)?.username || 'You'}:</span>
                        <span className='text'>{lastMessage.text}</span>
                        <span className='timestamp'>{formatTimestamp(lastMessage.timestamp)}</span>
                    </span>
                }
            </div>
        </div>
    );
}