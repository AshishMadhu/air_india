import React, { useState, useRef, FormEvent, KeyboardEvent } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Define message type for type safety
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
}

interface Chat {
  id: number;
  title: string;
  messages: Message[];
}

const ChatInterface: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Truncate title to a reasonable length
  const truncateTitle = (text: string, maxLength: number = 20): string => {
    return text.length > maxLength 
      ? text.substring(0, maxLength).trim() + '...' 
      : text.trim();
  };

  // Simulate assistant response (replace with actual API call)
  const generateResponse = (userMessage: string): string => {
    const responses = [
      "That's an interesting point!",
      "Could you tell me more about that?",
      "I'm processing your request.",
      "Let me think about that for a moment."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!inputText.trim()) return;

    // Create a new chat if no chat is selected
    if (selectedChatId === null) {
      const newChat: Chat = {
        id: Date.now(),
        title: 'New Chat', // Default title
        messages: []
      };
      setChats(prevChats => [...prevChats, newChat]);
      setSelectedChatId(newChat.id);
    }

    // Add user message to current chat
    const newUserMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user'
    };

    // Update chat with new message and potentially new title
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === selectedChatId) {
        // If this is the first message and the title is still 'New Chat'
        const updatedTitle = chat.messages.length === 0 
          ? truncateTitle(inputText)
          : chat.title;

        return { 
          ...chat, 
          title: updatedTitle,
          messages: [...chat.messages, newUserMessage] 
        };
      }
      return chat;
    }));

    // Generate and add assistant response
    const assistantResponseText = generateResponse(inputText);
    const newAssistantMessage: Message = {
      id: Date.now() + 1,
      text: assistantResponseText,
      sender: 'assistant'
    };

    // Clear input and add assistant message
    setInputText('');
    setChats(prevChats => prevChats.map(chat => 
      chat.id === selectedChatId 
        ? { ...chat, messages: [...chat.messages, newAssistantMessage] }
        : chat
    ));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const getCurrentChatMessages = () => {
    const currentChat = chats.find(chat => chat.id === selectedChatId);
    return currentChat ? currentChat.messages : [];
  };

  return (
    <div className="container-fluid vh-100 d-flex">
      {/* Sidebar */}
      <div 
        className="col-3 border-end p-0 d-flex flex-column" 
        style={{ 
          backgroundColor: '#f0f2f5'
        }}
      >
        <div className="p-3 border-bottom">
          <button 
            className="btn btn-success w-100" 
            onClick={() => {
              const newChat: Chat = {
                id: Date.now(),
                title: 'New Chat',
                messages: []
              };
              setChats(prevChats => [...prevChats, newChat]);
              setSelectedChatId(newChat.id);
            }}
          >
            + New Chat
          </button>
        </div>
        <div className="flex-grow-1 overflow-auto">
          {chats.map(chat => (
            <div 
              key={chat.id}
              className={`p-3 border-bottom cursor-pointer ${selectedChatId === chat.id ? 'bg-light' : ''}`}
              onClick={() => setSelectedChatId(chat.id)}
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="col-9 d-flex flex-column">
        {selectedChatId !== null && (
          <>
            {/* Messages Area */}
            <div 
              className="flex-grow-1 overflow-auto p-3 position-relative" 
              style={{ backgroundColor: '#f0f2f5' }}
            >
              {getCurrentChatMessages().length === 0 ? (
                // Logo/Welcome Screen within Messages Area
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <img 
                    src="/api/placeholder/300/200" 
                    alt="ChatGPT Logo" 
                    className="mb-4"
                  />
                  <h2 className="text-muted">How can I help you today?</h2>
                </div>
              ) : (
                <div className="col-12">
                  {getCurrentChatMessages().map((message) => (
                    <div 
                      key={message.id} 
                      className={`d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-3`}
                    >
                      <div 
                        className={`p-2 rounded ${
                          message.sender === 'user' 
                            ? 'bg-primary text-white' 
                            : 'bg-light text-dark'
                        }`}
                        style={{ 
                          maxWidth: '70%', 
                          wordWrap: 'break-word' 
                        }}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="row p-3 bg-white border-top">
              <div className="col-12">
                <form onSubmit={handleSendMessage}>
                  <div className="input-group">
                    <textarea
                      className="form-control"
                      rows={1}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      style={{ resize: 'none' }}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;