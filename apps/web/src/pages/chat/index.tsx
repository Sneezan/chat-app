import { useState, useRef, useEffect } from 'react';
import { trpc } from '../../trpc';
import { PlusIcon, SendIcon } from 'lucide-react';

export const Chat = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const feedEndRef = useRef<HTMLDivElement>(null);

  const { data: currentUser } = trpc.auth.me.useQuery();
  const { data: threads = [], refetch: refetchThreads } =
    trpc.thread.list.useQuery(undefined, { refetchInterval: 3000 });
  const createThread = trpc.thread.create.useMutation({
    onSuccess: (thread) => {
      refetchThreads();
      setSelectedThreadId(thread.id);
      setNewUsername('');
    },
  });

  const { data: messages = [], refetch: refetchMessages } =
    trpc.message.list.useQuery(
      { threadId: selectedThreadId! },
      {
        enabled: selectedThreadId != null,
        refetchInterval: 3000,
      }
    );
  const sendMessage = trpc.message.send.useMutation({
    onSuccess: () => {
      refetchMessages();
      refetchThreads();
      setMessageInput('');
    },
  });

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleNewThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    createThread.mutate({ username: newUsername.trim() });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadId || !messageInput.trim()) return;
    sendMessage.mutate({
      threadId: selectedThreadId,
      content: messageInput.trim(),
    });
  };

  return (
    <div className="flex mx-auto max-w-2xl min-h-[32rem] max-h-[75vh] border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xl shadow-gray-200/50">
      <aside className="w-52 border-r border-gray-200 flex flex-col bg-gradient-to-b from-gray-50 to-white shrink-0">
        <form
          onSubmit={handleNewThread}
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
              disabled={createThread.isPending}
              className="h-full w-10 shrink-0 flex items-center justify-center bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
        <ul className="flex-1 overflow-y-auto py-1">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSelectedThreadId(t.id)}
                className={`w-full text-left px-4 py-3 min-h-[4.5rem] flex flex-col justify-center border-b border-gray-100 transition-colors duration-150 ${
                  selectedThreadId === t.id
                    ? 'bg-cyan-50/80 border-l-4 border-l-cyan-600 text-cyan-900'
                    : 'border-l-4 border-l-transparent text-gray-800 hover:bg-sky-50/80 hover:border-l-sky-400/80'
                }`}
              >
                <span className="font-semibold capitalize block truncate">
                  {t.otherUsername}
                </span>
                <p className="text-xs text-gray-500 truncate mt-0.5 min-h-[1.25rem]">
                  {t.lastMessage ? t.lastMessage.content : ''}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
        {selectedThreadId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
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
                      className={`text-xs font-medium capitalize flex items-center gap-2 flex-wrap ${isMe ? 'text-cyan-100' : 'text-gray-500'}`}
                    >
                      <span>{m.sender.username}</span>
                      <span
                        className={isMe ? 'text-cyan-200/90' : 'text-gray-400'}
                      >
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
              className="p-3 border-t border-gray-200 bg-white flex gap-2"
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
                disabled={sendMessage.isPending || !messageInput.trim()}
                className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 active:bg-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
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
        )}
      </main>
    </div>
  );
};
