import React, { useState, useEffect } from "react";

import "./NotificationManager.scss";

interface NotificationItem {
  id: string;
  type: "chat" | "join" | "leave" | "comment";
  title: string;
  message: string;
  avatarColor?: string;
}

interface NotificationManagerProps {
  isCollaborating: boolean;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  isCollaborating,
}) => {
  const [toasts, setToasts] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (
      isCollaborating &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, [isCollaborating]);

  useEffect(() => {
    const handleFocus = () => {
      setUnreadCount(0);
      document.title = "Excalidraw Workspace";
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Excalidraw Workspace`;
    } else {
      document.title = "Excalidraw Workspace";
    }
  }, [unreadCount]);

  const addNotification = (
    type: NotificationItem["type"],
    title: string,
    message: string,
    avatarColor?: string,
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationItem = {
      id,
      type,
      title,
      message,
      avatarColor,
    };

    // 1. If page is hidden, send native notification
    if (document.hidden) {
      setUnreadCount((prev) => prev + 1);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body: message,
          icon: "/apple-touch-icon.png",
        });
      }
    } else {
      // 2. Otherwise, trigger glassmorphic toast notification
      setToasts((prev) => [...prev, newNotification]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4000);
    }
  };

  useEffect(() => {
    const handleCollabChat = (e: any) => {
      const data = e.detail;
      addNotification(
        "chat",
        `Mensaje de ${data.username}`,
        data.message,
        data.avatarColor,
      );
    };

    const handleUserJoin = (e: any) => {
      const { socketId } = e.detail;
      addNotification(
        "join",
        "Colaborador Conectado",
        `Un usuario (${socketId.slice(0, 4)}) se ha unido a la sala.`,
      );
    };

    const handleUserLeave = (e: any) => {
      const { socketId } = e.detail;
      addNotification(
        "leave",
        "Colaborador Desconectado",
        `El usuario (${socketId.slice(0, 4)}) ha salido de la sala.`,
      );
    };

    const handleCommentCreate = (e: any) => {
      const comment = e.detail;
      addNotification(
        "comment",
        "Nuevo Comentario Anclado",
        `De ${comment.author}: "${comment.text}"`,
      );
    };

    window.addEventListener("collab-chat-message" as any, handleCollabChat);
    window.addEventListener("collab-user-join" as any, handleUserJoin);
    window.addEventListener("collab-user-leave" as any, handleUserLeave);
    window.addEventListener(
      "collab-comment-create" as any,
      handleCommentCreate,
    );

    return () => {
      window.removeEventListener(
        "collab-chat-message" as any,
        handleCollabChat,
      );
      window.removeEventListener("collab-user-join" as any, handleUserJoin);
      window.removeEventListener("collab-user-leave" as any, handleUserLeave);
      window.removeEventListener(
        "collab-comment-create" as any,
        handleCommentCreate,
      );
    };
  }, []);

  return (
    <div className="toasts-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card ${toast.type}`}>
          <div className="toast-icon-wrapper">
            {toast.type === "chat" && (
              <span
                className="chat-avatar-dot"
                style={{
                  backgroundColor: toast.avatarColor || "var(--accent-color)",
                }}
              >
                💬
              </span>
            )}
            {toast.type === "join" && <span className="toast-emoji">👋</span>}
            {toast.type === "leave" && <span className="toast-emoji">🚪</span>}
            {toast.type === "comment" && (
              <span className="toast-emoji">📌</span>
            )}
          </div>
          <div className="toast-content-wrapper">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button
            className="toast-close-btn"
            onClick={() =>
              setToasts((prev) => prev.filter((item) => item.id !== toast.id))
            }
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
