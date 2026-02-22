import React from "react";
import { Bell } from "lucide-react";
import { Notification } from "../types";

interface NotificationBellProps {
  notifications: Notification[];
  onOpen?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onOpen,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <button
      className="relative p-2 rounded-full hover:bg-gray-100"
      onClick={onOpen}
    >
      <Bell className="h-6 w-6 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
};