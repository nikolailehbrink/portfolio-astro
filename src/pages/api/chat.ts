export const prerender = false;

import { AI_CHAT_MESSAGE_LIMIT, SECONDS_TO_CHAT_AGAIN } from "@/consts";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type UIMessage, convertToModelMessages } from "ai";
import type { APIRoute } from "astro";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = createOpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const { messages }: { messages: UIMessage[] } = await request.json();
  const messageCount = cookies.get("message_count")?.number();

  if (messageCount !== undefined && messageCount >= AI_CHAT_MESSAGE_LIMIT) {
    return new Response("Message limit reached", { status: 403 });
  }

  const result = streamText({
    model: openai("gpt-4o"),
    messages: convertToModelMessages(messages),
  });

  cookies.set("message_count", String(messageCount ? messageCount + 1 : 1), {
    // expires: new Date(Date.now() + 100000000),
    maxAge: SECONDS_TO_CHAT_AGAIN,
    httpOnly: true,
    // secure: import.meta.env.PROD,
    sameSite: "lax",
    path: "/",
  });

  return result.toUIMessageStreamResponse();
};
