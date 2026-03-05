import { useState, useRef, useEffect } from 'react';
import { skipToken } from '@tanstack/react-query';
import { trpc } from '../../trpc';
import { Feed } from './feed';
import { Sidebar } from './sidebar';

type ChatProps = {
  onHeaderVisibilityChange?: (visible: boolean) => void;
};

export const Chat = ({ onHeaderVisibilityChange }: ChatProps) => {
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeView, setActiveView] = useState<'sidebar' | 'feed'>('sidebar');
  const feedEndRef = useRef<HTMLDivElement>(null);

  const { data: currentUser } = trpc.auth.me.useQuery();
  const { data: threads = [], refetch: refetchThreads } =
    trpc.thread.list.useQuery(undefined);

  trpc.thread.onThreadListUpdate.useSubscription(undefined, {
    onData: () => refetchThreads(),
  });
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
      { enabled: selectedThreadId != null }
    );

  trpc.message.onNewMessage.useSubscription(
    selectedThreadId != null ? { threadId: selectedThreadId } : skipToken,
    {
      onData: () => {
        refetchMessages();
        refetchThreads();
      },
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

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handleChange = () => {
      setIsMobile(mq.matches);
      setActiveView(mq.matches ? 'sidebar' : 'feed');
    };
    handleChange();
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!onHeaderVisibilityChange) return;
    const visible = !isMobile || activeView === 'sidebar';
    onHeaderVisibilityChange(visible);
  }, [isMobile, activeView, onHeaderVisibilityChange]);

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

  const selectedThread = threads.find((t) => t.id === selectedThreadId);
  const threadDisplayName = selectedThread?.otherUsername;

  if (isMobile) {
    return (
      <div className="flex w-full h-full bg-white">
        {activeView === 'sidebar' ? (
          <Sidebar
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelectThread={(id) => {
              setSelectedThreadId(id);
              setActiveView('feed');
            }}
            newUsername={newUsername}
            setNewUsername={setNewUsername}
            onSubmitNewThread={handleNewThread}
            isCreatingThread={createThread.isPending}
            isCollapsed={false}
            onToggleCollapsed={() => {}}
            canCollapse={false}
          />
        ) : (
          <main className="flex-1 w-full flex flex-col min-w-0 bg-gray-50/30">
            <Feed
              selectedThreadId={selectedThreadId}
              messages={messages}
              currentUser={currentUser}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              handleSend={handleSend}
              feedEndRef={feedEndRef}
              isSending={sendMessage.isPending}
              onBack={() => setActiveView('sidebar')}
              threadDisplayName={threadDisplayName}
            />
          </main>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full mx-auto max-w-2xl h-[80vh] border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xl shadow-gray-200/50">
      <Sidebar
        threads={threads}
        selectedThreadId={selectedThreadId}
        onSelectThread={setSelectedThreadId}
        newUsername={newUsername}
        setNewUsername={setNewUsername}
        onSubmitNewThread={handleNewThread}
        isCreatingThread={createThread.isPending}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() =>
          setIsSidebarCollapsed((prevCollapsed) => !prevCollapsed)
        }
      />

      <main className="flex-1 w-full flex flex-col min-w-0 bg-gray-50/30">
        <Feed
          selectedThreadId={selectedThreadId}
          messages={messages}
          currentUser={currentUser}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          handleSend={handleSend}
          feedEndRef={feedEndRef}
          isSending={sendMessage.isPending}
          threadDisplayName={threadDisplayName}
        />
      </main>
    </div>
  );
};
