import React from "react";
import { FeedItem } from "../types";

interface FeedProps {
  items: FeedItem[];
}

export const Feed: React.FC<FeedProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-slate-500">{item.timestamp}</div>
          <div className="mt-1 text-gray-800">{item.content}</div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-center text-sm text-slate-500">No feed items yet.</p>
      )}
    </div>
  );
};