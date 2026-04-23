import React from "react";
import { Thread } from "@/features/social/types";

interface ThreadListProps {
  threads: Thread[];
}

export const ThreadList: React.FC<ThreadListProps> = ({ threads }) => {
  return (
    <div className="space-y-4">
      {threads.map((t) => (
        <div key={t.id} className="p-4 border rounded-lg hover:bg-gray-50">
          <h4 className="text-lg font-semibold">{t.title}</h4>
          <div className="text-sm text-slate-500">
            started by {t.creator} • {t.posts.length} posts
          </div>
        </div>
      ))}
      {threads.length === 0 && (
        <p className="text-center text-slate-500 text-sm">No threads yet.</p>
      )}
    </div>
  );
};