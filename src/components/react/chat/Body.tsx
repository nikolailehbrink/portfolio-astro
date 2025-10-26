import type { UIMessage, UseChatHelpers } from "@ai-sdk/react";
import { useState } from "react";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import LoadingMessage from "./LoadingMessage";
import WelcomeMessage from "./WelcomeMessage";
import Message from "./Message";
import ErrorMessage from "./ErrorMessage";
import LimitHitMessage from "./LimitHitMessage";

export default function Body({
  messages,
  status,
  isDisabled = false,
  messageCountResetDate,
}: Pick<UseChatHelpers<UIMessage>, "messages" | "status"> & {
  isDisabled?: boolean;
  messageCountResetDate?: Date;
}) {
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const containerRef = useScrollToBottom();

  return (
    <div
      ref={containerRef}
      className="flex grow flex-col gap-4 overflow-y-auto pr-4"
    >
      {/* Don't show if user starts new chat with Message Limit hit */}
      {showWelcomeMessage && !(messages.length === 0 && isDisabled === true) ? (
        <WelcomeMessage
          setShowWelcomeMessage={setShowWelcomeMessage}
          showCloseButton={messages.length > 0}
        />
      ) : null}
      {messages.map(({ id, role, parts }) => (
        // See comment below
        <Message key={id} role={role}>
          {parts.map((part) => {
            switch (part.type) {
              case "text":
                return part.text;
              case "tool-queryTool": {
                switch (part.state) {
                  case "input-streaming":
                    // This is streamed
                    return <pre>{JSON.stringify(part.input, null, 2)}</pre>;
                  case "input-available":
                    return <pre>{JSON.stringify(part.input, null, 2)}</pre>;
                  case "output-available":
                    return <pre>{JSON.stringify(part.output, null, 2)}</pre>;
                  case "output-error":
                    return <div>Error: {part.errorText}</div>;
                }
              }
            }
          })}
        </Message>
      ))}
      {(status === "submitted" ||
        // This is because the tool call in api/chat sets the status to "streaming"
        // but doesn't immediately has text content, resulting in an empty textbox before the text is eventually streamed
        status === "streaming") && <LoadingMessage />}
      {isDisabled && (
        <LimitHitMessage messageCountResetDate={messageCountResetDate} />
      )}
      {status === "error" && <ErrorMessage />}
    </div>
  );
}
