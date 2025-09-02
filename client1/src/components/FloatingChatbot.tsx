import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import MedicalChatbot from './MedicalChatbot';
import './FloatingChatbot.css';

const FloatingChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button 
                className="floating-chat-button"
                onClick={toggleChat}
                aria-label="Open chat"
            >
                <MessageCircle color="white" size={30} />
            </button>

            <div className={`chatbot-modal ${isOpen ? 'open' : ''}`}>
                <button 
                    className="close-button"
                    onClick={toggleChat}
                    aria-label="Close chat"
                >
                    <X size={24} />
                </button>
                <MedicalChatbot />
            </div>
        </>
    );
};

export default FloatingChatbot; 