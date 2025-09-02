import { useState } from "react";
import { Send } from "lucide-react";
import axios from "axios";
import "./MedicalChatbot.css"; // Import CSS for styling

interface ChatMessage {
    user: string;
    bot: string;
}

const MedicalChatbot: React.FC = () => {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:5006/api/chat", { message });
            setChat([...chat, { user: message, bot: response.data.response }]);
            setMessage("");
        } catch (err) {
            setError("Failed to get response. Please try again.");
            console.error("Error:", err);
        }

        setLoading(false);
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>Chatbot Assistant</h2>
                <p>Ask me anything!</p>
            </div>

            <div className="chat-box">
                {chat.length === 0 && <p className="empty-chat">Start by asking a question...</p>}
                {chat.map((c, i) => (
                    <div key={i} className="message-container">
                        <div className="user-message">
                            <span className="user-text">{c.user}</span>
                        </div>
                        <div className="bot-message">
                            <span className="bot-text">{c.bot}</span>
                        </div>
                    </div>
                ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={sendMessage} className="message-input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    required
                />
                <button type="submit" disabled={loading} className="send-button">
                    {loading ? "Thinking..." : <Send size={20} />}
                </button>
            </form>
        </div>
    );
};

export default MedicalChatbot;
