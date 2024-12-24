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
    const [chatName, setChatName] = useState(''); // State to store the chat name input
    const { socket, contacts } = useSocket();
    const { user } = useAuth();

    function handleCheckboxChange(userId: string) {
        setSelectedUsers(prev => // add or remove the user id from the selectedUsers state based on its current presence
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    function handleSubmit() {
        const participants = [user?.id, ...selectedUsers]; // Include the current user in the chat
        socket?.emit('chat', participants, messageText, chatName); // Emit the 'chat' event with the selected users, message text, and chat name
        onClose();
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <div className='modal-header'>
                    <h3>Start a new chat</h3>
                </div>

                <div className='modal-body'>
                    <p>Select users to include in the chat:</p>
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
                                    onChange={() => handleCheckboxChange(user.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className='modal-input'>
                    {selectedUsers.length > 1 && <input // Show the chat name input field only if more than one user is selected
                        type="text" 
                        placeholder="Choose a name for the group chat" 
                        value={chatName} onChange={(e) => 
                        setChatName(e.target.value)} 
                    />}
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
                        disabled={selectedUsers.length === 0 || messageText.trim() === '' 
                            || (selectedUsers.length > 1 && chatName.trim() === '')} // Disable the button if no users are selected or the message/chat name is empty
                    >
                        Start Chat
                    </button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};