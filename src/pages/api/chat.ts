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
import { AI_CHAT_MESSAGE_LIMIT } from "@/consts";

export const maxDuration = 30;
export const prerender = false;

const openai = createOpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY,
});

export const POST: APIRoute = async ({ request, cookies }) => {
  const { messages }: { messages: Array<UIMessage> } = await request.json();
  const messageCount = cookies.get("message_count")?.number();
  await track("submit-ai-message");

  if (messageCount !== undefined && messageCount >= AI_CHAT_MESSAGE_LIMIT) {
    return new Response("Message limit reached", { status: 403 });
  }

  try {
    const index = new LlamaCloudIndex({
      name: "ai-chat",
      projectName: "website",
      organizationId: "fab19a52-2da6-43e7-b2cb-6ea2e721faa7",
      apiKey: import.meta.env.LLAMA_CLOUD_API_KEY,
    });

    const result = streamText({
      onError: (error) => {
        console.error("Error:", error);
      },
      experimental_transform: smoothStream(),
      model: openai("gpt-4o-mini"),
      system: `You are chatting with a user that landed on Nikolai Lehbrink's personal website. Write as if you were Nikolai in the I form, using the data available.
              If there's no answer to a question, clarify that without making up a conclusion.
              Use simple, easily understandable language and keep answers short. Do not use Markdown or code blocks, just answer with plain text.
              If a user's question isn't related to Nikolai, explain that the chat is focused on him and can't answer unrelated questions, this is important!
              Inappropriate questions will not be answered, with a clear statement that such questions won't be addressed.`,
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

    cookies.set("message_count", String(messageCount ? messageCount + 1 : 1), {
      // expires: new Date(Date.now() + 100000000),
      maxAge: SECONDS_TO_CHAT_AGAIN,
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      path: "/",
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(error);
    throw error;
  }
};
