import React, {
  useState,
  useRef,
  FormEvent,
  KeyboardEvent,
  useEffect,
} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { BASE_URL } from "./constants";

// Define message type for type safety
interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
}

interface Chat {
  id: number;
  title: string;
  messages: Message[];
}

const ChatInterface: React.FC = () => {
  const token = localStorage.getItem("token");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const truncateTitle = (text: string, maxLength: number = 20): string => {
    return text.length > maxLength
      ? text.substring(0, maxLength).trim() + "..."
      : text.trim();
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get(BASE_URL + "/sessions", {
        headers: {
          Authorization: "Token " + token,
        },
      });
      setChats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchResponse = async (newMessage: Message) => {
    let sessionDeatils = {};
    if (selectedChatId != null && selectedChatId > 0 && selectedChatId > 1000) {
      // this means this chat is not saved on db
      sessionDeatils = { session_title: truncateTitle(inputText) };
    } else {
      sessionDeatils = { session_id: selectedChatId };
    }
    try {
      setInputText("");
      const response = await axios.post(
        BASE_URL + "/generate-sentence/",
        {
          input: newMessage.text,
          ...sessionDeatils,
        },
        { headers: { Authorization: "Token " + token } }
      );

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  { id: Date.now(), sender: "assistant", text: response.data },
                ],
              }
            : chat
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendMessage = (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!inputText.trim()) return;

    if (selectedChatId === null) {
      const newChat: Chat = {
        id: Date.now(),
        title: "New Chat", // Default title
        messages: [],
      };
      setChats((prevChats) => [...prevChats, newChat]);
      setSelectedChatId(newChat.id);
    }

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "user",
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === selectedChatId) {
          const updatedTitle =
            chat.messages.length === 0 ? truncateTitle(inputText) : chat.title;

          return {
            ...chat,
            title: updatedTitle,
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );
    fetchResponse(newMessage);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const getCurrentChatMessages = () => {
    const currentChat = chats.find((chat) => chat.id === selectedChatId);
    return currentChat ? currentChat.messages : [];
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-fluid vh-100 d-flex">
      {/* Sidebar */}
      <div
        className="col-3 border-end p-0 d-flex flex-column"
        style={{
          backgroundColor: "#f0f2f5",
        }}
      >
        <div className="p-3 border-bottom">
          <button
            className="btn btn-success w-100"
            onClick={() => {
              const newChat: Chat = {
                id: Date.now(),
                title: "New Chat",
                messages: [],
              };
              setChats((prevChats) => [...prevChats, newChat]);
              setSelectedChatId(newChat.id);
            }}
          >
            + New Chat
          </button>
        </div>
        <div className="flex-grow-1 overflow-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 border-bottom cursor-pointer ${
                selectedChatId === chat.id ? "bg-light" : ""
              }`}
              onClick={() => {
                setSelectedChatId(chat.id);
              }}
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
              style={{ backgroundColor: "#f0f2f5" }}
            >
              {getCurrentChatMessages().length === 0 ? (
                // Logo/Welcome Screen within Messages Area
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <img
                    src="https://www.airindia.com/content/dam/air-india/airindia-revamp/logos/AI_Logo_Red_New.svg"
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
                      className={`d-flex ${
                        message.sender === "user"
                          ? "justify-content-end"
                          : "justify-content-start"
                      } mb-3`}
                    >
                      <div
                        className={`p-2 rounded ${
                          message.sender === "user"
                            ? "bg-primary text-white"
                            : "bg-light text-dark"
                        }`}
                        style={{
                          maxWidth: "70%",
                          wordWrap: "break-word",
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
                      style={{ resize: "none" }}
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
