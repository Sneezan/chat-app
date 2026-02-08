import { useState, useRef, useEffect } from 'react';
import { trpc } from '../../trpc';

export const Chat = () => {
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const feedEndRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], refetch: refetchThreads } =
    trpc.threads.list.useQuery(undefined, { refetchInterval: 3000 });
  const createThread = trpc.threads.create.useMutation({
    onSuccess: (thread) => {
      refetchThreads();
      setSelectedThreadId(thread.id);
      setNewUsername('');
    },
  });

  const { data: messages = [], refetch: refetchMessages } =
    trpc.messages.list.useQuery(
      { threadId: selectedThreadId! },
      {
        enabled: selectedThreadId != null,
        refetchInterval: 3000,
      }
    );
  const sendMessage = trpc.messages.send.useMutation({
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
    <div className="flex h-[calc(100vh-6rem)] border rounded-lg overflow-hidden bg-white">
      {/* Thread list (left) */}
      <aside className="w-64 border-r flex flex-col bg-gray-50">
        <form onSubmit={handleNewThread} className="p-2 border-b flex gap-1">
          <input
            type="text"
            placeholder="Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="flex-1 border rounded px-2 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={createThread.isPending}
            className="px-2 py-1.5 text-sm bg-blue-600 text-white rounded"
          >
            New
          </button>
        </form>
        <ul className="flex-1 overflow-y-auto">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSelectedThreadId(t.id)}
                className={`w-full text-left px-3 py-2 border-b hover:bg-gray-100 ${
                  selectedThreadId === t.id
                    ? 'bg-blue-50 border-l-2 border-l-blue-600'
                    : ''
                }`}
              >
                <span className="font-medium">{t.otherUsername}</span>
                {t.lastMessage && (
                  <p className="text-xs text-gray-500 truncate">
                    {t.lastMessage.content}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Feed + input (right) */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedThreadId ? (
          <>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col max-w-[80%] self-start bg-gray-100 rounded-lg px-3 py-1.5"
                >
                  <span className="text-xs text-gray-500">
                    {m.sender.username}
                  </span>
                  <span>{m.content}</span>
                </div>
              ))}
              <div ref={feedEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-2 border-t flex gap-2">
              <input
                type="text"
                placeholder="Message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                type="submit"
                disabled={sendMessage.isPending || !messageInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a thread or start a new conversation
          </div>
        )}
      </main>
    </div>
  );
};
