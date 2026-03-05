import type React from 'react';
import { PlusIcon } from 'lucide-react';

type Thread = {
  id: number;
  otherUsername: string;
  lastMessage: { content: string } | null;
};

type SidebarProps = {
  threads: Thread[];
  selectedThreadId: number | null;
  onSelectThread: (id: number) => void;
  newUsername: string;
  setNewUsername: (value: string) => void;
  onSubmitNewThread: (e: React.FormEvent<HTMLFormElement>) => void;
  isCreatingThread: boolean;
};

export const Sidebar = ({
  threads,
  selectedThreadId,
  onSelectThread,
  newUsername,
  setNewUsername,
  onSubmitNewThread,
  isCreatingThread,
  isCollapsed,
  onToggleCollapsed,
}: SidebarProps & {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}) => {
  const getInitial = (name: string) => {
    const trimmed = name.trim();
    return trimmed ? trimmed[0]!.toUpperCase() : '?';
  };

  return (
    <aside
      className={`relative group border-r border-gray-200 flex flex-col bg-gradient-to-b from-gray-50 to-white shrink-0 ${
        isCollapsed ? 'w-16' : 'w-62'
      }`}
    >
      {isCollapsed ? (
        <div className="p-3 border-b border-gray-200 flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form
          onSubmit={onSubmitNewThread}
          className="p-3 border-b border-gray-200"
        >
          <div className="flex h-10 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500">
            <input
              type="text"
              placeholder="Type a username..."
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 min-w-0 border-0 px-3 text-sm outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isCreatingThread}
              className="h-full w-10 shrink-0 flex items-center justify-center bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
      <ul className="flex-1 overflow-y-auto">
        {threads.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onSelectThread(t.id)}
              className={`w-full text-left py-3 min-h-[4.5rem] flex items-center gap-3 border-b border-gray-100 transition-colors duration-150 ${
                selectedThreadId === t.id
                  ? 'bg-cyan-50/80 border-l-4 border-l-cyan-600 text-cyan-900'
                  : 'border-l-4 border-l-transparent text-gray-800 hover:bg-sky-50/80 hover:border-l-sky-400/80'
              } ${isCollapsed ? 'justify-center' : 'px-4'}`}
            >
              <div className="flex items-center justify-center rounded-full bg-cyan-600 text-white w-10 h-10 text-sm font-semibold shrink-0">
                {getInitial(t.otherUsername)}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold capitalize block truncate">
                    {t.otherUsername}
                  </span>
                  <p className="text-xs text-gray-500 truncate mt-0.5 min-h-[1.25rem]">
                    {t.lastMessage ? t.lastMessage.content : ''}
                  </p>
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-10 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-400 shadow-sm opacity-0 group-hover:opacity-100 hover:text-gray-600 hover:bg-gray-50 hover:cursor-pointer transition-all"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '›' : '‹'}
      </button>
    </aside>
  );
};
