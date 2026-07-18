import React, { useState, useEffect, useRef } from "react";

import "./CollabChat.scss";

interface ChatMessage {
  text: string;
  username: string;
  timestamp: string;
}

interface CollabChatProps {
  sendChatMessage?: (text: string) => void;
  username: string;
}

export const CollabChat: React.FC<CollabChatProps> = ({
  sendChatMessage,
  username,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNewMessage = (e: Event) => {
      const msg = (e as CustomEvent).detail as ChatMessage;
      setMessages((prev) => [...prev, msg]);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    };

    window.addEventListener("collab-chat-message", handleNewMessage);
    return () => {
      window.removeEventListener("collab-chat-message", handleNewMessage);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sendChatMessage) {
      return;
    }
    sendChatMessage(inputValue.trim());
    setInputValue("");
  };

  const getInitials = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : "?";
  };

  const getColorHash = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div className="collab-chat-container">
      {!isOpen && (
        <button
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Abrir chat de la sala"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Chat de la Sala</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <p>No hay mensajes en esta sala aún.</p>
                <p className="sub">¡Sé el primero en enviar uno!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.username === username;
                const avatarColor = getColorHash(msg.username);
                return (
                  <div
                    key={index}
                    className={`chat-message ${
                      isMe ? "message-me" : "message-other"
                    }`}
                  >
                    {!isMe && (
                      <div
                        className="message-avatar"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {getInitials(msg.username)}
                      </div>
                    )}
                    <div className="message-content">
                      {!isMe && (
                        <span className="message-author">{msg.username}</span>
                      )}
                      <div className="message-bubble">{msg.text}</div>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" disabled={!inputValue.trim()}>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
