import React from "react";
import "./PresenceBar.scss";

interface OnlineUser {
  username: string;
  color: string;
}

interface PresenceBarProps {
  users: OnlineUser[];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export const PresenceBar: React.FC<PresenceBarProps> = ({ users }) => {
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
