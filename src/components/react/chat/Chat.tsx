import Actions from "@/components/react/chat/Actions";
import Body from "@/components/react/chat/Body";
import ExampleMessage from "@/components/react/chat/ExampleMessage";
import { EXAMPLE_MESSAGES } from "@/data/example-chat-messages";
import type { MyUIMessage } from "@/pages/api/chat";
import { useChat } from "@ai-sdk/react";
import { useState, type FormEvent } from "react";

export default function Chat({
  isChatDisabled,
  messageCountResetDate,
}: {
  isChatDisabled: boolean;
  messageCountResetDate?: Date;
}) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, stop, status, regenerate } =
    useChat<MyUIMessage>();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage({ text: input });
    setInput("");
  };

  // https://play.tailwindcss.com/ztVLNgodlA
  return (
    <div
      className="mt-1 mb-4 flex max-w-5xl grow flex-col gap-2 overflow-hidden
        sm:rounded-xl sm:border sm:bg-neutral-900 sm:py-4 sm:pl-4
        sm:offset-border"
    >
      <Body
        messages={messages}
        status={status}
        isDisabled={isChatDisabled}
        messageCountResetDate={messageCountResetDate}
      />
      {!isChatDisabled ? (
        <>
          <div className="flex justify-center gap-2">
            {EXAMPLE_MESSAGES.map(({ heading, message, icon: Icon }) => (
              <ExampleMessage
                key={heading}
                setInput={setInput}
                message={message}
              >
                <Icon size={20} weight="duotone" />
                <span className="max-sm:sr-only">{heading}</span>
              </ExampleMessage>
            ))}
          </div>
          <Actions
            handleInputChange={(e) => setInput(e.target.value)}
            handleSubmit={handleSubmit}
            input={input}
            regenerate={regenerate}
            status={status}
            stop={stop}
            isInputDisabled={isChatDisabled}
          />
        </>
      ) : null}
    </div>
  );
}
