import type React from 'react';
import { ArrowLeftIcon, SendIcon } from 'lucide-react';

type FeedUser = { id: number; username: string } | null | undefined;

type FeedMessage = {
  id: number;
  content: string;
  createdAt: Date | string;
  sender: { id: number; username: string };
};

type FeedProps = {
  selectedThreadId: number | null;
  messages: FeedMessage[];
  currentUser: FeedUser;
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSend: (e: React.FormEvent<HTMLFormElement>) => void;
  feedEndRef: React.RefObject<HTMLDivElement | null>;
  isSending: boolean;
  onBack?: () => void;
  threadDisplayName?: string;
};

export const Feed = ({
  selectedThreadId,
  messages,
  currentUser,
  messageInput,
  setMessageInput,
  handleSend,
  feedEndRef,
  isSending,
  onBack,
  threadDisplayName,
}: FeedProps) => {
  const getInitial = (name: string) => {
    const trimmed = name.trim();
    return trimmed ? trimmed[0]!.toUpperCase() : '?';
  };

  if (!selectedThreadId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-center px-6">
        <div className="max-w-sm">
          <p className="text-base font-medium text-gray-500">
            Select a thread or start a new conversation
          </p>
          <p className="text-sm mt-1 text-gray-400">
            Use the sidebar to open a chat or add someone by username.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {onBack && (
        <div className="p-3 border-b border-gray-200 bg-white sm:hidden fixed inset-x-0 py-2.5z-10 sm:static sm:inset-auto sm:z-auto">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-cyan-600 flex items-center gap-1"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            {threadDisplayName && (
              <div className="flex items-center gap-2 min-w-0 ml-4">
                <div className="flex items-center justify-center rounded-full bg-cyan-600 text-white w-9 h-9 text-sm font-semibold shrink-0 p">
                  {getInitial(threadDisplayName)}
                </div>
                <span className="text-sm font-medium text-gray-900 capitalize truncate">
                  {threadDisplayName}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {threadDisplayName && (
        <div className="hidden sm:flex items-center gap-3 px-4 py-3.5 border-b  border-gray-200 bg-white">
          <div className="flex items-center justify-center rounded-full bg-cyan-600 text-white w-9 h-9 text-sm font-semibold shrink-0">
            {getInitial(threadDisplayName)}
          </div>
          <span className="text-sm font-medium text-gray-900 capitalize truncate">
            {threadDisplayName}
          </span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 pt-24 pb-24 sm:pt-4 sm:pb-4 flex flex-col gap-3">
        {messages.map((m) => {
          const isMe = currentUser && m.sender.id === currentUser.id;
          return (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                isMe
                  ? 'self-end bg-cyan-600 text-white shadow-cyan-900/20'
                  : 'self-start bg-white text-gray-800 border border-gray-100 shadow-gray-200/50'
              }`}
            >
              <div
                className={`text-xs font-medium capitalize flex items-center gap-2 flex-wrap ${
                  isMe ? 'text-cyan-100' : 'text-gray-500'
                }`}
              >
                <span>{m.sender.username}</span>
                <span className={isMe ? 'text-cyan-200/90' : 'text-gray-400'}>
                  {new Date(m.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <span className="mt-1 break-words">{m.content}</span>
            </div>
          );
        })}
        <div ref={feedEndRef} />
      </div>
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-gray-200 bg-white flex gap-2 fixed inset-x-0 bottom-0 z-10 sm:static sm:inset-auto sm:z-auto"
      >
        <input
          type="text"
          placeholder="Write a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={isSending || !messageInput.trim()}
          className="px-3.5 py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 active:bg-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
