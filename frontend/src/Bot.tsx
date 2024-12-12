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
import ShowMessage from "./ShowMessage";

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
  const faqs = [
    "What are your capabilities?",
    "Can you help me write code?",
    "Explain machine learning basics",
    "Help me brainstorm ideas",
    "Translate this text",
  ];
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [hideFaq, setHideFaq] = useState<boolean>(false);
  const [currentMessageCount, setCurrentMessageCount] = useState<number>(0);
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

  const fetchResponse = async (newMessage: Message, faq: string = "") => {
    let sessionDeatils = {};
    if (selectedChatId != null && selectedChatId > 0 && selectedChatId > 1000) {
      // this means this chat is not saved on db
      sessionDeatils = {
        session_title: truncateTitle(inputText ? inputText : faq),
      };
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
    setCurrentMessageCount(1);
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

  const handlePlotSelectClick = (clicked: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text: clicked,
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

  const handleFAQClick = (faq: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text: faq,
      sender: "user",
    };
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === selectedChatId) {
          const updatedTitle =
            chat.messages.length === 0 ? truncateTitle(faq) : chat.title;
          return {
            ...chat,
            title: updatedTitle,
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );
    fetchResponse(newMessage, faq);
    setHideFaq(true);
  };

  useEffect(() => {
    fetchChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-fluid vh-100 d-flex">
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
              chats.map((c) => {
                if (c.id == newChat.id) setCurrentMessageCount(0);
              });
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
                chats.map((c) => {
                  if (c.id == chat.id)
                    setCurrentMessageCount(chat.messages.length);
                });
              }}
            >
              {chat.title}
            </div>
          ))}
        </div>
      </div>

      <div className="col-9 d-flex flex-column">
        {selectedChatId == null && (
          <div
            className="flex-grow-1 overflow-auto p-3 position-relative"
            style={{ backgroundColor: "#f0f2f5" }}
          >
            <div className="position-absolute top-50 start-50 translate-middle text-center">
              <img
                src="https://www.airindia.com/content/dam/air-india/airindia-revamp/logos/AI_Logo_Red_New.svg"
                alt="ChatGPT Logo"
                className="mb-4"
              />
              <h2 className="text-muted">How can I help you today?</h2>
            </div>
          </div>
        )}
        {selectedChatId !== null && (
          <>
            <div
              className="flex-grow-1 overflow-auto p-3 position-relative"
              style={{ backgroundColor: "#f0f2f5" }}
            >
              {getCurrentChatMessages().length === 0 ? (
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
                        <ShowMessage
                          message={message.text}
                          handlePlotSelectClick={handlePlotSelectClick}
                        />
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            {!hideFaq && currentMessageCount == 0 && (
              <div className="row p-2 bg-light">
                <div className="col-12">
                  <div className="d-flex flex-wrap justify-content-center">
                    {faqs.map((faq, index) => (
                      <button
                        key={index}
                        className="btn btn-outline-secondary btn-sm m-1"
                        onClick={() => handleFAQClick(faq)}
                      >
                        {faq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
