import React from "react";

interface FollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  onToggle,
}) => {
  return (
    <button
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        isFollowing
          ? "bg-slate-800 text-gray-700 hover:bg-gray-300"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
      onClick={onToggle}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};