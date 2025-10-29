import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  smoothStream,
  streamText,
  type UIMessage,
} from "ai";
import { llamaindex } from "@llamaindex/vercel";
import { LlamaCloudIndex } from "llama-cloud-services";
import { track } from "@vercel/analytics/server";
import type { APIRoute } from "astro";
import { AI_CHAT_MESSAGE_LIMIT, SECONDS_TO_CHAT_AGAIN } from "@/consts";

export const maxDuration = 30;
export const prerender = false;

// Reuse OpenAI client instance to avoid creating new connections
const openai = createOpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

// Cache the LlamaCloudIndex instance to avoid re-initialization
let llamaIndexInstance: LlamaCloudIndex | null = null;

function getLlamaIndex() {
  if (!llamaIndexInstance) {
    llamaIndexInstance = new LlamaCloudIndex({
      name: "ai-chat",
      projectName: "website",
      organizationId: "fab19a52-2da6-43e7-b2cb-6ea2e721faa7",
      apiKey: import.meta.env.LLAMA_CLOUD_API_KEY,
    });
  }
  return llamaIndexInstance;
}

// Pre-define the system prompt to avoid string creation on each request
const SYSTEM_PROMPT = `You are chatting with a user that landed on Nikolai Lehbrink's personal website. Write as if you were Nikolai in the I form, using the data available.
If there's no answer to a question, clarify that without making up a conclusion.
Use simple, easily understandable language and keep answers short. Do not use Markdown or code blocks, just answer with plain text.
If a user's question isn't related to Nikolai, explain that the chat is focused on him and can't answer unrelated questions, this is important!
Inappropriate questions will not be answered, with a clear statement that such questions won't be addressed.`;

export const POST: APIRoute = async ({ request, cookies }) => {
  const { messages }: { messages: Array<UIMessage> } = await request.json();
  const messageCount = cookies.get("message_count")?.number() ?? 0;
  
  // Track analytics asynchronously to avoid blocking the response
  track("submit-ai-message").catch(console.error);

  if (messageCount >= AI_CHAT_MESSAGE_LIMIT) {
    return new Response("Message limit reached", { status: 403 });
  }

  try {
    const index = getLlamaIndex();

    const result = streamText({
      onError: (error) => {
        // Log error without exposing sensitive information
        console.error("Chat API error:", error.message || "Unknown error occurred");
      },
      experimental_transform: smoothStream(),
      model: openai("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      messages: convertToModelMessages(messages),
      toolChoice: "required",
      tools: {
        queryTool: llamaindex({
          index,
          model: openai("gpt-4o-mini"),
          description: `Get information from your knowledge base to answer questions abut Nikolai. 
                        Everytime somebody refers to the chat, act like Nikolai was asked and try to retrieve correct information. 
                        Answer as if you were Nikolai in the self perspective.`,
        }),
      },
    });

    cookies.set("message_count", String(messageCount + 1), {
      maxAge: SECONDS_TO_CHAT_AGAIN,
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    // Log sanitized error without sensitive details
    console.error("Chat API error:", error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
};
