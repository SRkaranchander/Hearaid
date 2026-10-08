import React, { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

function ChatBox({ currentUser, selectedUser, messages, onSendMessage }) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      text: newMessage,
      senderId: currentUser._id,
      receiverId: selectedUser._id
    };

    try {
      await onSendMessage(message);
      setNewMessage('');
    } catch (error) {
      alert('Failed to send message. Make sure you are connected.');
    }
  };

  return (
    <div className="chat-container d-flex flex-column h-100">
      <div className="chat-header">
        <h5 className="mb-0">{selectedUser.name}</h5>
        <small>
          {selectedUser.status === 'online' ? '🟢 Online' : '⚪ Offline'}
        </small>
      </div>
      
      <div className="chat-messages flex-grow-1">
        {messages.map(msg => (
          <div 
            key={msg._id}
            className={`message-wrapper d-flex ${msg.senderId === currentUser._id ? 'justify-content-end' : 'justify-content-start'}`}
          >
            <div className={`message-bubble ${msg.senderId === currentUser._id ? 'sent' : 'received'}`}>
              <p className="mb-0">{msg.text}</p>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-container">
        <div className="input-group">
          <input
            type="text"
            className="form-control chat-input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="btn send-button" type="submit">Send 🚀</button>
        </div>
      </form>
    </div>
  );
}

export default ChatBox;
