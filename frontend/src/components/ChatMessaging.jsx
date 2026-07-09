import React, { useState } from 'react';

const ChatMessaging = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Admin', text: 'Welcome to the team chat!' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessage = { id: Date.now(), sender: 'You', text: input };
    setMessages([...messages, newMessage]);
    setInput('');
    // TODO: Send to Spring Boot backend via fetch('/api/messages/send')
  };

  return (
    <div className="flex flex-col h-96 bg-white border-2 border-blue-100 rounded-lg shadow-sm">
      <div className="bg-blue-600 text-white font-bold p-4 rounded-t-lg">
        Team Chat
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-blue-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-4 ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
            <span className="text-xs text-blue-400 font-semibold">{msg.sender}</span>
            <div className={`inline-block p-2 mt-1 rounded-lg ${msg.sender === 'You' ? 'bg-blue-600 text-white' : 'bg-white text-blue-900 border border-blue-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t border-blue-100 flex gap-2 rounded-b-lg">
        <input
          type="text"
          className="flex-1 p-2 border border-blue-300 rounded focus:outline-none focus:border-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatMessaging;
