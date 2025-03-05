import React, { useState } from 'react';
import './Chatbot.css'; // Import the CSS file
import chatbot from '../Assets/chatIcon.png';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      // Add user message to the chat
      const userMessage = { text: inputValue, sender: 'user' };
      setMessages([...messages, userMessage]);

      // Generate a bot response
      const botResponse = generateBotResponse(inputValue);
      setMessages((prevMessages) => [...prevMessages, botResponse]);

      // Clear the input field
      setInputValue('');
    }
  };

  // Handle "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Function to generate a bot response
  const generateBotResponse = (userMessage) => {
    let botMessage = '';
    switch (userMessage.toLowerCase()) {
      case 'hello':
        botMessage = 'Hi there! How can I help you?';
        break;
      case 'how are you?':
        botMessage = 'I am just a bot, but I am doing great! How about you?';
        break;
      case 'what is your name?':
        botMessage = 'I am your friendly chatbot!';
        break;
      case 'bye':
        botMessage = 'Goodbye! Have a great day!';
        break;
      default:
        botMessage = "I'm sorry, I don't understand that. Can you please rephrase?";
    }
    return { text: botMessage, sender: 'bot' };
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-button" onClick={toggleChatbot} aria-label="Open chatbot">
        <img src={chatbot} alt="Chatbot" className="chatbot-icon" />
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Chatbot</h3>
            <button className="close-button" onClick={toggleChatbot} aria-label="Close chatbot">
              ×
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;