import React from "react";
import { Notification } from "../types";

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onMarkRead,
}) => {
  return (
    <div className="space-y-2">
      {notifications.map((note) => (
        <div
          key={note.id}
          className={
            "flex justify-between rounded-lg p-3 shadow " +
            (note.read ? "bg-slate-800/50" : "bg-white")
          }
        >
          <div className="text-sm text-gray-800">{note.message}</div>
          {!note.read && onMarkRead && (
            <button
              className="text-xs text-blue-600"
              onClick={() => onMarkRead(note.id)}
            >
              Mark read
            </button>
          )}
        </div>
      ))}
      {notifications.length === 0 && (
        <p className="text-center text-sm text-slate-500">No notifications.</p>
      )}
    </div>
  );
};