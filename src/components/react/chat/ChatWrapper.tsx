import { Suspense, lazy } from "react";

// Lazy load the heavy Chat component
const ChatComponent = lazy(() => import("./Chat"));

// Skeleton loader for the chat while it's loading
function ChatSkeleton() {
  return (
    <div
      className="mt-1 mb-4 flex max-w-5xl grow flex-col gap-2 overflow-hidden
        sm:rounded-xl sm:border sm:bg-neutral-900 sm:py-4 sm:pl-4
        sm:offset-border animate-pulse"
    >
      <div className="flex-1 space-y-4 p-4">
        <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-700 rounded"></div>
          <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
        </div>
      </div>
      <div className="flex gap-2 p-4">
        <div className="h-10 bg-neutral-700 rounded flex-1"></div>
        <div className="h-10 w-10 bg-neutral-700 rounded"></div>
      </div>
    </div>
  );
}

type ChatWrapperProps = {
  isChatDisabled: boolean;
  messageCountResetDate?: Date;
};

export default function ChatWrapper(props: ChatWrapperProps) {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatComponent {...props} />
    </Suspense>
  );
}