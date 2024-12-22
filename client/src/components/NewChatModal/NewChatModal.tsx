import { useState } from 'react';
import './NewChatModal.css';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';

interface Props {
    onClose: () => void;
}

export default function NewChatModal({ onClose }: Props) {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]); // state to store the selected users for the new chat
    const [messageText, setMessageText] = useState(''); // State to store the message input
    const { socket, contacts } = useSocket();
    const { user } = useAuth();

    function handleCheckboxChange(userId: string) {
        setSelectedUsers(prev => // add or remove the user id from the selectedUsers state based on its current presence
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    function handleSubmit() {
        const participants = [user?.id, ...selectedUsers]; // Include the current user in the chat
        socket?.emit('chat', participants, messageText); // Emit the 'chat' event with the selected participants and message text
        onClose();
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <div className='modal-header'>
                    <h3>Select users to include in the chat</h3>
                </div>
                <div className='modal-list'>
                    {contacts.map(user => (
                        <div 
                            key={user.id} 
                            className={`modal-list-item ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                            onClick={() => handleCheckboxChange(user.id)}
                        >
                            <img src={user.image || '/default-avatar.png'} alt={`${user.username}'s avatar`} className="avatar" />
                            <span className="username">{user.username}</span>
                            <input
                                type="checkbox"
                                value={user.id}
                                checked={selectedUsers.includes(user.id)}
                            />
                        </div>
                    ))}
                </div>
                <div className='modal-msg'>
                    <input 
                        type="text" 
                        placeholder="Type a message..." 
                        value={messageText} onChange={(e) => 
                        setMessageText(e.target.value)} 
                    />
                </div>
                <div className='modal-buttons'>
                    <button 
                        onClick={handleSubmit}
                        disabled={selectedUsers.length === 0 || messageText.trim() === ''}
                    >
                        Start Chat
                    </button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};