import React, { useEffect, useState } from "react";
import "./PresenceBar.scss";

interface OnlineUser {
  username: string;
  color: string;
  onlineAt: string;
}

interface PresenceBarProps {
  presenceChannelRef: React.MutableRefObject<any>;
  currentSocketId: string;
}

const PALETTE = [
  "#e03131", "#c2255c", "#9c36b5", "#3b5bdb", "#1971c2",
  "#0c8599", "#2f9e44", "#e67700", "#d9480f", "#5c7cfa",
  "#f03e3e", "#ae3ec9", "#4c6ef5", "#1c7ed6", "#12b886",
  "#40c057", "#fab005", "#fd7e14", "#7950f2", "#e64980",
];

function usernameToColor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export const PresenceBar: React.FC<PresenceBarProps> = ({
  presenceChannelRef,
}) => {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!presenceChannelRef.current) return;

    const channel = presenceChannelRef.current;

    const updateUsers = () => {
      const state = channel.presenceState();
      const online: OnlineUser[] = [];
      Object.values(state).forEach((presences: any) => {
        if (presences.length > 0) {
          const p = presences[0];
          const name = p.username || "Usuario";
          online.push({
            username: name,
            color: usernameToColor(name),
            onlineAt: p.onlineAt,
          });
        }
      });
      // Sort by join time
      online.sort((a, b) => a.onlineAt.localeCompare(b.onlineAt));
      setUsers(online);
    };

    channel.on("presence", { event: "sync" }, updateUsers);
    channel.on("presence", { event: "join" }, updateUsers);
    channel.on("presence", { event: "leave" }, updateUsers);

    // initial read
    updateUsers();
  }, [presenceChannelRef.current]);

  if (users.length === 0) return null;

  const MAX_VISIBLE = 4;
  const visible = users.slice(0, MAX_VISIBLE);
  const overflow = users.length - MAX_VISIBLE;

  return (
    <div className="presence-bar" title="Usuarios en línea">
      {visible.map((u, i) => (
        <div
          key={u.username + i}
          className="presence-avatar"
          style={{
            backgroundColor: u.color,
            zIndex: MAX_VISIBLE - i,
            marginLeft: i === 0 ? 0 : "-8px",
          }}
          title={u.username}
        >
          {getInitials(u.username)}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="presence-avatar presence-avatar--overflow"
          style={{ marginLeft: "-8px" }}
          title={`${overflow} más en línea`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};
